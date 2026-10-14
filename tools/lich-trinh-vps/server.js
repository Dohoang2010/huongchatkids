/**
 * Lịch làm việc (Sếp ↔ Trợ lý) – máy chủ trên VPS quanlylichtrinh.site
 *   POST /api          : mọi yêu cầu của app, dạng {action, token, ...} (cùng giao thức với bản Apps Script)
 *   GET  /api/luong    : kênh Server-Sent Events báo app tải lại ngay khi có tin nhắn / lịch mới
 * Dữ liệu: PostgreSQL (DATABASE_URL). Thông báo đẩy: Web Push (VAPID_PUBLIC / VAPID_PRIVATE).
 * Nhắc lịch: kiểm tra mỗi 30 giây ngay trong tiến trình này.
 * Cài đặt & cập nhật: xem tools/lich-trinh-vps/README.md
 */
'use strict';
const http = require('node:http');
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const pg = require('pg');
const webpush = require('web-push');

const PORT = Number(process.env.PORT || 3200);
const SITE = process.env.SITE_URL || 'https://quanlylichtrinh.site';
const PHIEN_NGAY = 180, SAI_MK_TOI_DA = 8, GIO_NHAC_CA_NGAY = 8;
const VAI_TRO = ['sep', 'troly'], TEN_VAI = { sep: 'Sếp', troly: 'Trợ lý' };
const THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
webpush.setVapidDetails(SITE, process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);
const scrypt = promisify(crypto.scrypt);
const q = (sql, p) => pool.query(sql, p);

/* ===================== DỮ LIỆU ===================== */
async function taoBang() {
  await q(`
    CREATE TABLE IF NOT EXISTS nguoi_dung (vai text PRIMARY KEY, ten text NOT NULL, salt text NOT NULL, hash text NOT NULL);
    CREATE TABLE IF NOT EXISTS phien (token_hash text PRIMARY KEY, vai text NOT NULL, het timestamptz NOT NULL, may text);
    CREATE TABLE IF NOT EXISTS lich (id text PRIMARY KEY, data jsonb NOT NULL);
    CREATE TABLE IF NOT EXISTS tin (id serial PRIMARY KEY, t text NOT NULL, tu text NOT NULL, nd text NOT NULL DEFAULT '', lich_id text NOT NULL DEFAULT '');
    CREATE TABLE IF NOT EXISTS thiet_bi (endpoint text PRIMARY KEY, p256dh text NOT NULL, auth text NOT NULL, vai text NOT NULL, ten_may text, ngay_tao timestamptz DEFAULT now());
    CREATE TABLE IF NOT EXISTS bien (k text PRIMARY KEY, v text NOT NULL);
  `);
}

// Giữ sẵn trong bộ nhớ (chỉ 1 tiến trình) để mỗi lần app hỏi không phải đọc database
const M = { nguoi: {}, lich: [], verLich: '0', tinCuoi: 0, daDoc: { sep: 0, troly: 0 }, online: {}, phien: new Map() };

async function napBoNho() {
  for (const r of (await q('SELECT * FROM nguoi_dung')).rows) M.nguoi[r.vai] = r;
  M.lich = (await q('SELECT data FROM lich')).rows.map(r => r.data);
  const b = Object.fromEntries((await q('SELECT k, v FROM bien')).rows.map(r => [r.k, r.v]));
  M.verLich = b.verLich || Date.now().toString(36);
  M.daDoc = { sep: Number(b.daDoc_sep || 0), troly: Number(b.daDoc_troly || 0) };
  M.tinCuoi = Number((await q('SELECT coalesce(max(id), 0) AS m FROM tin')).rows[0].m);
  M.nhacDaChay = Math.max(Number(b.nhacDaChay || 0), Date.now() - 10 * 60000);
}
const datBien = (k, v) => q('INSERT INTO bien (k, v) VALUES ($1, $2) ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v', [k, String(v)]);
const tenNguoi = () => Object.fromEntries(VAI_TRO.map(v => [v, M.nguoi[v] ? M.nguoi[v].ten : TEN_VAI[v]]));
const bayGio = () => { const d = new Date(Date.now() + 7 * 3600000).toISOString(); return d.slice(0, 19); };

/* ===================== TÀI KHOẢN ===================== */
async function bamMk(mk, salt) { return (await scrypt(String(mk), salt, 64)).toString('hex'); }
const bamToken = t => crypto.createHash('sha256').update(String(t)).digest('hex');
function bangNhau(a, b) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); }

async function datMatKhau(vai, ten, mk) {
  const salt = crypto.randomBytes(16).toString('hex'), hash = await bamMk(mk, salt);
  await q('INSERT INTO nguoi_dung (vai, ten, salt, hash) VALUES ($1,$2,$3,$4) ON CONFLICT (vai) DO UPDATE SET ten=$2, salt=$3, hash=$4', [vai, ten, salt, hash]);
  M.nguoi[vai] = { vai, ten, salt, hash };
}

async function xacThuc(token) {
  if (!token) return null;
  const k = bamToken(token);
  let p = M.phien.get(k);
  if (!p) {
    const r = (await q('SELECT vai, het FROM phien WHERE token_hash = $1', [k])).rows[0];
    if (!r) return null;
    p = { vai: r.vai, het: new Date(r.het).getTime() };
    M.phien.set(k, p);
  }
  if (p.het < Date.now()) { M.phien.delete(k); return null; }
  return { vaiTro: p.vai, khoa: k };
}

const saiMk = new Map();
const HANH_DONG = {
  async trangThai() { return { ok: true, daCaiDat: !!M.nguoi.sep, ten: tenNguoi() }; },

  async caiDat(req) {
    if (M.nguoi.sep) return { loi: 'Ứng dụng đã được thiết lập rồi' };
    for (const v of VAI_TRO) if (String(req['mk_' + v] || '').length < 4) return { loi: `Mật khẩu của ${TEN_VAI[v]} cần ít nhất 4 ký tự` };
    for (const v of VAI_TRO) await datMatKhau(v, String(req['ten_' + v] || '').trim().slice(0, 40) || TEN_VAI[v], String(req['mk_' + v]));
    return { ok: true };
  },

  async dangNhap(req) {
    const v = req.vaiTro, u = M.nguoi[v];
    if (!VAI_TRO.includes(v)) return { loi: 'Chọn Sếp hoặc Trợ lý' };
    if (!u) return { loi: 'Ứng dụng chưa được thiết lập' };
    const s = saiMk.get(v) || { n: 0, den: 0 };
    if (s.n >= SAI_MK_TOI_DA && s.den > Date.now()) return { loi: 'Sai mật khẩu quá nhiều lần. Thử lại sau 15 phút.' };
    if (!bangNhau(await bamMk(String(req.matKhau || ''), u.salt), u.hash)) {
      saiMk.set(v, { n: (s.den > Date.now() ? s.n : 0) + 1, den: Date.now() + 15 * 60000 });
      return { loi: 'Mật khẩu không đúng' };
    }
    saiMk.delete(v);
    const token = crypto.randomBytes(32).toString('hex'), het = Date.now() + PHIEN_NGAY * 86400000;
    await q('INSERT INTO phien (token_hash, vai, het, may) VALUES ($1,$2,$3,$4)', [bamToken(token), v, new Date(het), String(req.tenMay || '').slice(0, 60)]);
    await q('DELETE FROM phien WHERE het < now()');
    return { ok: true, token, vaiTro: v };
  },

  async dangXuat(req, toi) {
    await q('DELETE FROM phien WHERE token_hash = $1', [toi.khoa]);
    M.phien.delete(toi.khoa);
    if (req.endpoint) await q('DELETE FROM thiet_bi WHERE endpoint = $1', [req.endpoint]);
    return { ok: true };
  },

  async doiTen(req, toi) {
    const ten = String(req.ten || '').trim().slice(0, 40);
    if (!ten) return { loi: 'Tên không được để trống' };
    await q('UPDATE nguoi_dung SET ten = $1 WHERE vai = $2', [ten, toi.vaiTro]);
    M.nguoi[toi.vaiTro].ten = ten;
    phatTin('ten');
    return { ok: true, ten: tenNguoi() };
  },

  async doiMatKhau(req, toi) {
    const u = M.nguoi[toi.vaiTro];
    if (!bangNhau(await bamMk(String(req.cu || ''), u.salt), u.hash)) return { loi: 'Mật khẩu hiện tại không đúng' };
    if (String(req.moi || '').length < 4) return { loi: 'Mật khẩu mới cần ít nhất 4 ký tự' };
    await datMatKhau(toi.vaiTro, u.ten, String(req.moi));
    return { ok: true };
  },

  /* ---- đồng bộ ---- */
  async tongHop(req, toi) {
    ghiDangXem(toi.vaiTro, req.chat);
    return {
      ok: true, toi: toi.vaiTro, ten: tenNguoi(), vapid: process.env.VAPID_PUBLIC,
      verLich: M.verLich, lich: M.lich, tin: await tinSau(Math.max(0, M.tinCuoi - 300)),
      tinCuoi: M.tinCuoi, daDoc: M.daDoc, online: trangThaiOnline()
    };
  },

  async poll(req, toi) {
    ghiDangXem(toi.vaiTro, req.chat);
    const r = { ok: true, verLich: M.verLich, tinCuoi: M.tinCuoi, daDoc: M.daDoc, online: trangThaiOnline() };
    if (String(req.verLich) !== M.verLich) r.lich = M.lich;
    if (Number(req.tinCuoi || 0) < M.tinCuoi) r.tin = await tinSau(Number(req.tinCuoi || 0));
    if (req.canTen) r.ten = tenNguoi();
    return r;
  },

  /* ---- lịch ---- */
  async luuLich(req, toi) {
    const ev = chuanHoaLich(req.ev || {}), id = String((req.ev || {}).id || '');
    const cu = id ? M.lich.find(x => x.id === id) : null;
    if (id && !cu) return { loi: 'Sự kiện này đã bị xoá' };
    const moi = Object.assign({}, cu || {}, ev, {
      id: cu ? id : 'L' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex'),
      taoBoi: cu ? cu.taoBoi : toi.vaiTro, suaBoi: toi.vaiTro, capNhat: bayGio()
    });
    await q('INSERT INTO lich (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data', [moi.id, moi]);
    if (cu) M.lich[M.lich.indexOf(cu)] = moi; else M.lich.push(moi);
    await doiVerLich();
    baoDoiLich(toi.vaiTro, moi, cu ? 'sửa' : 'thêm', cu);
    return { ok: true, ev: moi, verLich: M.verLich };
  },

  async xoaLich(req, toi) {
    const cu = M.lich.find(x => x.id === String(req.id || ''));
    if (!cu) return { ok: true, verLich: M.verLich };
    await q('DELETE FROM lich WHERE id = $1', [cu.id]);
    M.lich = M.lich.filter(x => x !== cu);
    await doiVerLich();
    baoDoiLich(toi.vaiTro, cu, 'xoá');
    return { ok: true, verLich: M.verLich };
  },

  /* ---- tin nhắn ---- */
  async guiTin(req, toi) {
    const nd = String(req.noiDung || '').trim().slice(0, 4000), lichId = String(req.lichId || '').slice(0, 40);
    if (!nd && !lichId) return { loi: 'Tin nhắn trống' };
    const t = bayGio();
    const id = (await q('INSERT INTO tin (t, tu, nd, lich_id) VALUES ($1,$2,$3,$4) RETURNING id', [t, toi.vaiTro, nd, lichId])).rows[0].id;
    M.tinCuoi = Math.max(M.tinCuoi, id);
    M.daDoc[toi.vaiTro] = id; datBien('daDoc_' + toi.vaiTro, id);
    phatTin('tin');
    const khac = toi.vaiTro === 'sep' ? 'troly' : 'sep', o = M.online[khac];
    const dangMoChat = o && o.chat && luongMo(khac) && Date.now() - o.t < 60000;
    if (!dangMoChat) {
      let body = nd;
      if (lichId) { const ev = M.lich.find(e => e.id === lichId); body = (nd ? nd + '\n' : '') + '📅 ' + (ev ? `${ev.tieuDe} • ${moTaGio(ev)}` : 'Một sự kiện'); }
      guiThongBao([khac], { title: '💬 ' + tenNguoi()[toi.vaiTro], body: body.slice(0, 180), tag: 'chat-' + id, url: './#chat', badge: M.tinCuoi - M.daDoc[khac] });
    }
    return { ok: true, tin: { id, t, tu: toi.vaiTro, nd, lichId } };
  },

  async daDoc(req, toi) {
    const id = Math.min(Number(req.id || 0), M.tinCuoi);
    if (id > M.daDoc[toi.vaiTro]) { M.daDoc[toi.vaiTro] = id; await datBien('daDoc_' + toi.vaiTro, id); phatTin('daDoc'); }
    return { ok: true };
  },

  /* ---- thông báo ---- */
  async dangKyThongBao(req, toi) {
    const s = req.sub || {}, k = s.keys || {};
    if (!/^https:\/\//.test(s.endpoint || '') || !k.p256dh || !k.auth) return { loi: 'Đăng ký thông báo không hợp lệ' };
    await q(`INSERT INTO thiet_bi (endpoint, p256dh, auth, vai, ten_may) VALUES ($1,$2,$3,$4,$5)
             ON CONFLICT (endpoint) DO UPDATE SET p256dh=$2, auth=$3, vai=$4, ten_may=$5, ngay_tao=now()`,
    [s.endpoint, k.p256dh, k.auth, toi.vaiTro, String(req.tenMay || '').slice(0, 60)]);
    return { ok: true };
  },
  async huyThongBao(req) { if (req.endpoint) await q('DELETE FROM thiet_bi WHERE endpoint = $1', [req.endpoint]); return { ok: true }; },
  async thuThongBao(req, toi) {
    const kq = await guiThongBao([toi.vaiTro], { title: '🔔 Thông báo đã hoạt động', body: 'Máy này sẽ nhận nhắc lịch và tin nhắn.', tag: 'thu', url: './#toi' });
    return kq.daGui ? { ok: true, daGui: kq.daGui } : { loi: kq.ghiChu || 'Chưa có máy nào bật thông báo' };
  }
};
const MO_CONG = new Set(['trangThai', 'caiDat', 'dangNhap']);

async function tinSau(sauId) {
  return (await q('SELECT id, t, tu, nd, lich_id FROM tin WHERE id > $1 ORDER BY id DESC LIMIT 300', [sauId])).rows
    .reverse().map(r => ({ id: r.id, t: r.t, tu: r.tu, nd: r.nd, lichId: r.lich_id }));
}

async function doiVerLich() { M.verLich = Date.now().toString(36); await datBien('verLich', M.verLich); phatTin('lich'); }

function chuanHoaLich(ev) {
  const t = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  const o = {
    tieuDe: String(ev.tieuDe || '').trim().slice(0, 200), caNgay: !!ev.caNgay, bd: String(ev.bd || ''), kt: String(ev.kt || ''),
    diaDiem: String(ev.diaDiem || '').slice(0, 200), lich: ['sep', 'troly', 'chung'].includes(ev.lich) ? ev.lich : 'chung',
    lap: ['', 'ngay', 'tuan', 'thang', 'nam'].includes(ev.lap || '') ? (ev.lap || '') : '',
    lapDen: /^\d{4}-\d{2}-\d{2}$/.test(ev.lapDen || '') ? ev.lapDen : '',
    nhac: ev.nhac == null || ev.nhac === '' ? -1 : Math.max(-1, Math.min(20160, Number(ev.nhac) || 0)),
    ghiChu: String(ev.ghiChu || '').slice(0, 3000)
  };
  if (!o.tieuDe) throw new Error('Chưa nhập tiêu đề');
  if (!t.test(o.bd) || !t.test(o.kt)) throw new Error('Ngày giờ không hợp lệ');
  if (o.kt < o.bd) o.kt = o.bd;
  return o;
}

function moTaGio(ev) {
  const ymd = ev.bd.slice(0, 10), ngay = `${THU[new Date(ymd + 'T00:00:00Z').getUTCDay()]} ${ymd.slice(8, 10)}/${ymd.slice(5, 7)}`;
  return ev.caNgay ? 'Cả ngày ' + ngay : `${ev.bd.slice(11, 16)} ${ngay}`;
}

function baoDoiLich(nguoiLam, ev, kieu, cu) {
  const khac = nguoiLam === 'sep' ? 'troly' : 'sep';
  if (ev.lich !== khac && ev.lich !== 'chung' && !(cu && (cu.lich === khac || cu.lich === 'chung'))) return;
  guiThongBao([khac], {
    title: `${tenNguoi()[nguoiLam]} đã ${kieu} lịch${ev.lich === 'chung' ? ' chung' : ''}`,
    body: `${ev.tieuDe} • ${moTaGio(ev)}`, tag: 'lich-' + ev.id,
    url: kieu === 'xoá' ? './#lich/' + ev.bd.slice(0, 10) : './#su-kien/' + ev.id
  });
}

/* ===================== ĐANG HOẠT ĐỘNG & KÊNH TỨC THÌ ===================== */
const luong = new Set();   // các kết nối SSE đang mở: {vai, res}
const luongMo = v => [...luong].some(c => c.vai === v);
function ghiDangXem(v, chat) { M.online[v] = { t: Date.now(), chat: !!chat }; }
function trangThaiOnline() {
  const r = {};
  for (const v of VAI_TRO) {
    const o = M.online[v];
    r[v] = luongMo(v) ? { t: Date.now(), chat: !!(o && o.chat) } : o || null;
  }
  return r;
}
function phatTin(loai) {
  const s = `data: ${JSON.stringify({ loai })}\n\n`;
  for (const c of luong) c.res.write(s);
}
setInterval(() => { for (const c of luong) c.res.write(': giu\n\n'); }, 25000).unref();

async function moLuong(req, res, url) {
  const toi = await xacThuc(url.searchParams.get('token'));
  if (!toi) { res.writeHead(401).end(); return; }
  res.writeHead(200, { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no', Connection: 'keep-alive' });
  res.write('retry: 3000\n\n');
  const c = { vai: toi.vaiTro, res };
  luong.add(c);
  M.online[toi.vaiTro] = Object.assign({}, M.online[toi.vaiTro], { t: Date.now() });
  phatTin('online');
  req.on('close', () => {
    luong.delete(c);
    M.online[toi.vaiTro] = Object.assign({}, M.online[toi.vaiTro], { t: Date.now(), chat: false });
    phatTin('online');
  });
}

/* ===================== THÔNG BÁO ĐẨY ===================== */
async function guiThongBao(vais, tb) {
  const ds = (await q('SELECT endpoint, p256dh, auth FROM thiet_bi WHERE vai = ANY($1)', [vais])).rows;
  let daGui = 0, ghiChu = '';
  await Promise.all(ds.map(async r => {
    try {
      await webpush.sendNotification({ endpoint: r.endpoint, keys: { p256dh: r.p256dh, auth: r.auth } }, JSON.stringify(tb), { TTL: 86400, urgency: 'high' });
      daGui++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) await q('DELETE FROM thiet_bi WHERE endpoint = $1', [r.endpoint]);
      else { ghiChu = 'Máy chủ thông báo trả lỗi ' + (e.statusCode || e.message); console.warn('Push lỗi', e.statusCode, String(e.body || e.message).slice(0, 300)); }
    }
  }));
  return { daGui, ghiChu };
}

/* ===================== NHẮC LỊCH ===================== */
// Giống hệt lanDienRa() trong lich-trinh/app.js
const pad = n => String(n).padStart(2, '0');
const soNgay = ymd => Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10)) / 864e5;
const ymdTuSo = n => new Date(n * 864e5).toISOString().slice(0, 10);
const ymdCong = (ymd, k) => ymdTuSo(soNgay(ymd) + k);
const ymdTuMs = ms => new Date(ms + 7 * 3600000).toISOString().slice(0, 10);
function lanDienRa(ev, tu, den, toiDa, loc) {
  const bd = ev.bd.slice(0, 10), dai = soNgay(ev.kt.slice(0, 10)) - soNgay(bd);
  const nTu = soNgay(tu) - dai, nDen = soNgay(den), kq = [];
  const het = ev.lapDen ? Math.min(nDen, soNgay(ev.lapDen)) : nDen;
  const them = ymd => { if (!loc || loc(ymd)) kq.push(ymd); return kq.length >= toiDa; };
  const n0 = soNgay(bd);
  if (!ev.lap) { if (n0 >= nTu && n0 <= nDen) them(bd); return kq; }
  if (ev.lap === 'ngay' || ev.lap === 'tuan') {
    const buoc = ev.lap === 'ngay' ? 1 : 7;
    const k = Math.max(0, Math.ceil((nTu - n0) / buoc));
    for (let n = n0 + k * buoc; n <= het; n += buoc) if (them(ymdTuSo(n))) break;
    return kq;
  }
  let y = +bd.slice(0, 4), m = +bd.slice(5, 7);
  const d = +bd.slice(8, 10), yTu = +ymdTuSo(nTu).slice(0, 4), mTu = +ymdTuSo(nTu).slice(5, 7);
  if (ev.lap === 'thang') { const lech = (yTu - y) * 12 + (mTu - m) - 1; if (lech > 0) { y += Math.floor((m - 1 + lech) / 12); m = (m - 1 + lech) % 12 + 1; } }
  if (ev.lap === 'nam' && yTu - 1 > y) y = yTu - 1;
  for (let i = 0; i < 2000; i++) {
    if (new Date(Date.UTC(y, m - 1, d)).getUTCDate() === d) {
      const ymd = `${y}-${pad(m)}-${pad(d)}`, nn = soNgay(ymd);
      if (nn > het) break;
      if (nn >= nTu && nn >= n0 && them(ymd)) break;
    }
    if (ev.lap === 'thang') { m++; if (m > 12) { m = 1; y++; } } else y++;
  }
  return kq;
}
const lucNhac = (ev, ymd) => new Date(`${ymd}T${ev.caNgay ? pad(GIO_NHAC_CA_NGAY) + ':00' : ev.bd.slice(11, 16)}:00+07:00`).getTime() - ev.nhac * 60000;

let dangNhac = false;
async function kiemTraNhac() {
  if (dangNhac) return;
  dangNhac = true;
  try {
    const now = Date.now(), tu = M.nhacDaChay;
    for (const ev of M.lich) {
      if (!(ev.nhac >= 0)) continue;
      const ngay = lanDienRa(ev, ymdCong(ymdTuMs(tu), -15), ymdCong(ymdTuMs(now), 15), 50, ymd => { const t = lucNhac(ev, ymd); return t > tu && t <= now; });
      for (const ymd of ngay) {
        const truoc = ev.nhac === 0 ? 'Bắt đầu ngay bây giờ' : ev.nhac % 1440 === 0 ? `Còn ${ev.nhac / 1440} ngày` : ev.nhac % 60 === 0 ? `Còn ${ev.nhac / 60} giờ` : `Còn ${ev.nhac} phút`;
        await guiThongBao(ev.lich === 'chung' ? VAI_TRO : [ev.lich], {
          title: '⏰ ' + ev.tieuDe,
          body: `${truoc} • ${moTaGio(Object.assign({}, ev, { bd: ymd + ev.bd.slice(10) }))}${ev.diaDiem ? ' • ' + ev.diaDiem : ''}`,
          tag: `nhac-${ev.id}-${ymd}`, url: `./#su-kien/${ev.id}/${ymd}`
        });
      }
    }
    M.nhacDaChay = now;
    await datBien('nhacDaChay', now);
  } catch (e) { console.error('Nhắc lịch lỗi', e); }
  finally { dangNhac = false; }
}

/* ===================== HTTP ===================== */
function guiJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

const mayChu = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  try {
    if (url.pathname === '/api/luong' && req.method === 'GET') return await moLuong(req, res, url);
    if (url.pathname !== '/api') return guiJson(res, 404, { loi: 'Không tìm thấy' });
    if (req.method === 'GET') return guiJson(res, 200, { ok: true, ten: 'Lịch làm việc', daCaiDat: !!M.nguoi.sep });
    if (req.method !== 'POST') return guiJson(res, 405, { loi: 'Sai phương thức' });
    let than = '';
    for await (const c of req) { than += c; if (than.length > 200000) return guiJson(res, 413, { loi: 'Dữ liệu quá lớn' }); }
    let body;
    try { body = JSON.parse(than || '{}'); } catch (e) { return guiJson(res, 400, { loi: 'Dữ liệu gửi lên không hợp lệ' }); }
    const fn = HANH_DONG[body.action];
    if (!fn) return guiJson(res, 400, { loi: 'Không rõ yêu cầu' });
    if (MO_CONG.has(body.action)) return guiJson(res, 200, await fn(body));
    const toi = await xacThuc(body.token);
    if (!toi) return guiJson(res, 200, { loi: 'Phiên đăng nhập đã hết, vui lòng đăng nhập lại', hetPhien: true });
    return guiJson(res, 200, await fn(body, toi));
  } catch (e) {
    console.error(e);
    if (!res.headersSent) guiJson(res, 200, { loi: e.message || 'Lỗi máy chủ' });
  }
});

(async () => {
  await taoBang();
  await napBoNho();
  setInterval(kiemTraNhac, 30000).unref();
  mayChu.listen(PORT, '127.0.0.1', () => console.log(`Lịch làm việc đang chạy ở cổng ${PORT}`));
})().catch(e => { console.error(e); process.exit(1); });
