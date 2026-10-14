/**
 * Lịch làm việc – máy chủ trên VPS quanlylichtrinh.site (nhiều thành viên + 1 tài khoản admin riêng)
 *   POST /api          : mọi yêu cầu của app, dạng {action, token, ...}
 *   GET  /api/luong    : kênh Server-Sent Events báo app tải lại ngay khi có tin nhắn / lịch mới
 * Dữ liệu: PostgreSQL (DATABASE_URL). Thông báo đẩy: Web Push (VAPID_PUBLIC / VAPID_PRIVATE).
 * Nhắc lịch: kiểm tra mỗi 30 giây ngay trong tiến trình này.
 * Tạo / đặt lại mật khẩu admin từ dòng lệnh:  node server.js tao-admin <ten_dang_nhap> <mat_khau>  (xong: systemctl restart lichtrinh)
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
const THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const MAU = ['#ff9500', '#007aff', '#af52de', '#ff2d55', '#5ac8fa', '#a2845e', '#ffcc00', '#5856d6', '#ff6482', '#30b0c7', '#64c466', '#bf5af2'];
const RE_TEN_DN = /^[a-z0-9._-]{3,30}$/;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 4 });
if (process.env.VAPID_PUBLIC) webpush.setVapidDetails(SITE, process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);
const scrypt = promisify(crypto.scrypt);
const q = (sql, p) => pool.query(sql, p);

/* ===================== DỮ LIỆU ===================== */
async function taoBang() {
  await q(`
    CREATE TABLE IF NOT EXISTS nguoi_dung (vai text PRIMARY KEY, ten text NOT NULL, salt text NOT NULL, hash text NOT NULL);
    CREATE TABLE IF NOT EXISTS thanh_vien (
      id text PRIMARY KEY, ten_dang_nhap text UNIQUE NOT NULL, ten text NOT NULL, chuc_vu text NOT NULL DEFAULT '',
      mau text NOT NULL DEFAULT '#8e8e93', la_admin boolean NOT NULL DEFAULT false, khoa boolean NOT NULL DEFAULT false,
      da_xoa boolean NOT NULL DEFAULT false, salt text NOT NULL, hash text NOT NULL, thu_tu serial, tao_luc timestamptz DEFAULT now());
    CREATE TABLE IF NOT EXISTS phien (token_hash text PRIMARY KEY, vai text NOT NULL, het timestamptz NOT NULL, may text);
    CREATE TABLE IF NOT EXISTS lich (id text PRIMARY KEY, data jsonb NOT NULL);
    CREATE TABLE IF NOT EXISTS tin (id serial PRIMARY KEY, t text NOT NULL, tu text NOT NULL, nd text NOT NULL DEFAULT '', lich_id text NOT NULL DEFAULT '');
    ALTER TABLE tin ADD COLUMN IF NOT EXISTS kenh text NOT NULL DEFAULT 'nhom';
    CREATE INDEX IF NOT EXISTS tin_kenh ON tin (kenh, id);
    CREATE TABLE IF NOT EXISTS da_doc (nguoi text NOT NULL, kenh text NOT NULL, id integer NOT NULL, PRIMARY KEY (nguoi, kenh));
    CREATE TABLE IF NOT EXISTS thiet_bi (endpoint text PRIMARY KEY, p256dh text NOT NULL, auth text NOT NULL, vai text NOT NULL, ten_may text, ngay_tao timestamptz DEFAULT now());
    CREATE TABLE IF NOT EXISTS bien (k text PRIMARY KEY, v text NOT NULL);
  `);
}

// Bản cũ chỉ có 2 tài khoản cố định (sep, troly) → chuyển sang bảng thành viên, tin nhắn cũ thành cuộc trò chuyện riêng của 2 người
async function chuyenDoiBanCu() {
  if ((await q('SELECT count(*)::int AS n FROM thanh_vien')).rows[0].n) return;
  const cu = (await q("SELECT * FROM nguoi_dung ORDER BY (vai = 'sep') DESC")).rows;
  if (!cu.length) return;
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    for (const u of cu) {
      await c.query('INSERT INTO thanh_vien (id, ten_dang_nhap, ten, chuc_vu, mau, salt, hash) VALUES ($1,$1,$2,$3,$4,$5,$6)',
        [u.vai, u.ten, u.vai === 'sep' ? 'Sếp' : 'Trợ lý', u.vai === 'sep' ? MAU[0] : MAU[1], u.salt, u.hash]);
    }
    if (cu.length === 2) {
      await c.query("UPDATE tin SET kenh = 'dm:sep:troly'");
      const b = Object.fromEntries((await c.query("SELECT k, v FROM bien WHERE k IN ('daDoc_sep','daDoc_troly')")).rows.map(r => [r.k, r.v]));
      for (const v of ['sep', 'troly']) if (b['daDoc_' + v]) await c.query("INSERT INTO da_doc VALUES ($1, 'dm:sep:troly', $2) ON CONFLICT DO NOTHING", [v, Number(b['daDoc_' + v])]);
    }
    await c.query('COMMIT');
    console.log('Đã chuyển', cu.length, 'tài khoản cũ sang bảng thành viên');
  } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
}

// Giữ sẵn trong bộ nhớ (chỉ 1 tiến trình) để mỗi lần app hỏi không phải đọc database
const M = { tv: new Map(), lich: [], verLich: '0', verNguoi: '0', tinCuoi: 0, daDoc: new Map(), online: {}, phien: new Map(), nhacDaChay: 0 };

async function napBoNho() {
  M.tv.clear();
  for (const r of (await q('SELECT * FROM thanh_vien')).rows) M.tv.set(r.id, r);
  M.lich = (await q('SELECT data FROM lich')).rows.map(r => r.data);
  const b = Object.fromEntries((await q('SELECT k, v FROM bien')).rows.map(r => [r.k, r.v]));
  M.verLich = b.verLich || Date.now().toString(36);
  M.verNguoi = Date.now().toString(36);
  M.tinCuoi = Number((await q('SELECT coalesce(max(id), 0) AS m FROM tin')).rows[0].m);
  for (const r of (await q('SELECT nguoi, kenh, id FROM da_doc')).rows) M.daDoc.set(`${r.nguoi}|${r.kenh}`, r.id);
  M.nhacDaChay = Math.max(Number(b.nhacDaChay || 0), Date.now() - 10 * 60000);
}
const datBien = (k, v) => q('INSERT INTO bien (k, v) VALUES ($1, $2) ON CONFLICT (k) DO UPDATE SET v = EXCLUDED.v', [k, String(v)]);
const bayGio = () => new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 19);

/* ===================== THÀNH VIÊN ===================== */
const theoThuTu = (a, b) => a.thu_tu - b.thu_tu;
const thanhVien = () => [...M.tv.values()].filter(u => !u.la_admin && !u.da_xoa).sort(theoThuTu);   // người có lịch & chat
const dangHoatDong = () => thanhVien().filter(u => !u.khoa);
const congKhai = u => ({ id: u.id, ten: u.ten, chucVu: u.chuc_vu, mau: u.mau, admin: u.la_admin, khoa: u.khoa, daXoa: u.da_xoa });
const dsNguoi = () => [...M.tv.values()].sort(theoThuTu).map(congKhai);
const tenCua = id => (M.tv.get(id) || {}).ten || 'Ai đó';
const laThanhVien = id => { const u = M.tv.get(id); return !!u && !u.la_admin && !u.da_xoa; };
const kenhRieng = (a, b) => 'dm:' + [a, b].sort().join(':');
function kenhCua(uid) {
  if (!laThanhVien(uid)) return [];
  return ['nhom', ...thanhVien().filter(u => u.id !== uid).map(u => kenhRieng(uid, u.id))];
}
const nguoiTrongKenh = kenh => kenh === 'nhom' ? thanhVien().map(u => u.id) : kenh.slice(3).split(':');
async function doiNguoi() { M.verNguoi = Date.now().toString(36); phatTin('nguoi'); }

/* ===================== MẬT KHẨU & PHIÊN ===================== */
async function bamMk(mk, salt) { return (await scrypt(String(mk), salt, 64)).toString('hex'); }
const bamToken = t => crypto.createHash('sha256').update(String(t)).digest('hex');
function bangNhau(a, b) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); }
async function taoMk(mk) { const salt = crypto.randomBytes(16).toString('hex'); return { salt, hash: await bamMk(mk, salt) }; }
async function xoaPhienCua(uid) {
  await q('DELETE FROM phien WHERE vai = $1', [uid]);
  for (const [k, p] of M.phien) if (p.vai === uid) M.phien.delete(k);
  for (const c of luong) if (c.vai === uid) c.res.end();
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
  const u = M.tv.get(p.vai);
  if (p.het < Date.now() || !u || u.khoa || u.da_xoa) { M.phien.delete(k); return null; }
  return { id: u.id, admin: u.la_admin, khoa: k };
}

function kiemTraTaiKhoan(tenDN, mk, mkToiThieu = 6) {
  if (!RE_TEN_DN.test(tenDN)) return 'Tên đăng nhập 3–30 ký tự, chỉ gồm chữ không dấu, số, dấu chấm, gạch dưới';
  if (String(mk || '').length < mkToiThieu) return `Mật khẩu cần ít nhất ${mkToiThieu} ký tự`;
  if ([...M.tv.values()].some(u => u.ten_dang_nhap === tenDN)) return 'Tên đăng nhập này đã có người dùng';
  return '';
}

async function themNguoi({ tenDN, mk, ten, chucVu = '', mau, admin = false }) {
  const id = (admin ? 'a' : 'u') + crypto.randomBytes(4).toString('hex');
  const dangDung = new Set(thanhVien().map(u => u.mau));
  mau = /^#[0-9a-f]{6}$/i.test(mau || '') ? mau : (MAU.find(m => !dangDung.has(m)) || MAU[thanhVien().length % MAU.length]);
  const { salt, hash } = await taoMk(mk);
  const r = (await q(`INSERT INTO thanh_vien (id, ten_dang_nhap, ten, chuc_vu, mau, la_admin, salt, hash)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [id, tenDN, ten, chucVu, mau, admin, salt, hash])).rows[0];
  M.tv.set(id, r);
  await doiNguoi();
  return r;
}

const saiMk = new Map();
const chiAdmin = toi => { if (!toi.admin) throw new Error('Chỉ admin mới làm được việc này'); };
const layThanhVien = id => {
  const u = M.tv.get(String(id || ''));
  if (!u || u.da_xoa) throw new Error('Không tìm thấy thành viên');
  if (u.la_admin) throw new Error('Không sửa tài khoản admin ở đây');
  return u;
};

/* ===================== YÊU CẦU TỪ APP ===================== */
const HANH_DONG = {
  async trangThai() { return { ok: true, daCaiDat: M.tv.size > 0 }; },

  // Lần đầu: tạo tài khoản admin
  async caiDat(req) {
    if (M.tv.size) return { loi: 'Ứng dụng đã được thiết lập rồi' };
    const tenDN = String(req.tenDangNhap || '').trim().toLowerCase(), loi = kiemTraTaiKhoan(tenDN, req.matKhau);
    if (loi) return { loi };
    await themNguoi({ tenDN, mk: String(req.matKhau), ten: 'Quản trị viên', chucVu: 'Admin', admin: true });
    return { ok: true };
  },

  async dangNhap(req) {
    const tenDN = String(req.tenDangNhap || req.vaiTro || '').trim().toLowerCase();
    const u = [...M.tv.values()].find(x => x.ten_dang_nhap === tenDN && !x.da_xoa);
    const s = saiMk.get(tenDN) || { n: 0, den: 0 };
    if (s.n >= SAI_MK_TOI_DA && s.den > Date.now()) return { loi: 'Sai mật khẩu quá nhiều lần. Thử lại sau 15 phút.' };
    if (!u || !bangNhau(await bamMk(String(req.matKhau || ''), u.salt), u.hash)) {
      saiMk.set(tenDN, { n: (s.den > Date.now() ? s.n : 0) + 1, den: Date.now() + 15 * 60000 });
      return { loi: 'Sai tên đăng nhập hoặc mật khẩu' };
    }
    if (u.khoa) return { loi: 'Tài khoản này đang bị khoá. Liên hệ admin.' };
    saiMk.delete(tenDN);
    const token = crypto.randomBytes(32).toString('hex'), het = Date.now() + PHIEN_NGAY * 86400000;
    await q('INSERT INTO phien (token_hash, vai, het, may) VALUES ($1,$2,$3,$4)', [bamToken(token), u.id, new Date(het), String(req.tenMay || '').slice(0, 60)]);
    await q('DELETE FROM phien WHERE het < now()');
    return { ok: true, token, toi: u.id };
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
    await q('UPDATE thanh_vien SET ten = $1 WHERE id = $2', [ten, toi.id]);
    M.tv.get(toi.id).ten = ten;
    await doiNguoi();
    return { ok: true, nguoi: dsNguoi(), verNguoi: M.verNguoi };
  },

  async doiMatKhau(req, toi) {
    const u = M.tv.get(toi.id);
    if (!bangNhau(await bamMk(String(req.cu || ''), u.salt), u.hash)) return { loi: 'Mật khẩu hiện tại không đúng' };
    if (String(req.moi || '').length < 6) return { loi: 'Mật khẩu mới cần ít nhất 6 ký tự' };
    const { salt, hash } = await taoMk(String(req.moi));
    await q('UPDATE thanh_vien SET salt = $1, hash = $2 WHERE id = $3', [salt, hash, u.id]);
    Object.assign(u, { salt, hash });
    return { ok: true };
  },

  /* ---- admin: quản lý thành viên ---- */
  async dsThanhVien(req, toi) {
    chiAdmin(toi);
    return { ok: true, ds: thanhVien().map(u => Object.assign(congKhai(u), { tenDangNhap: u.ten_dang_nhap, taoLuc: u.tao_luc })) };
  },
  async taoThanhVien(req, toi) {
    chiAdmin(toi);
    const tenDN = String(req.tenDangNhap || '').trim().toLowerCase(), ten = String(req.ten || '').trim().slice(0, 40);
    if (!ten) return { loi: 'Chưa nhập họ tên' };
    const loi = kiemTraTaiKhoan(tenDN, req.matKhau);
    if (loi) return { loi };
    const u = await themNguoi({ tenDN, mk: String(req.matKhau), ten, chucVu: String(req.chucVu || '').trim().slice(0, 30), mau: req.mau });
    return { ok: true, tv: congKhai(u) };
  },
  async suaThanhVien(req, toi) {
    chiAdmin(toi);
    const u = layThanhVien(req.id), ten = String(req.ten || '').trim().slice(0, 40);
    if (!ten) return { loi: 'Chưa nhập họ tên' };
    const mau = /^#[0-9a-f]{6}$/i.test(req.mau || '') ? req.mau : u.mau, chucVu = String(req.chucVu || '').trim().slice(0, 30);
    await q('UPDATE thanh_vien SET ten = $1, chuc_vu = $2, mau = $3 WHERE id = $4', [ten, chucVu, mau, u.id]);
    Object.assign(u, { ten, chuc_vu: chucVu, mau });
    await doiNguoi();
    return { ok: true };
  },
  async datLaiMatKhau(req, toi) {
    chiAdmin(toi);
    const u = layThanhVien(req.id);
    if (String(req.matKhau || '').length < 6) return { loi: 'Mật khẩu cần ít nhất 6 ký tự' };
    const { salt, hash } = await taoMk(String(req.matKhau));
    await q('UPDATE thanh_vien SET salt = $1, hash = $2 WHERE id = $3', [salt, hash, u.id]);
    Object.assign(u, { salt, hash });
    await xoaPhienCua(u.id);   // đăng xuất mọi máy của người đó
    return { ok: true };
  },
  async khoaThanhVien(req, toi) {
    chiAdmin(toi);
    const u = layThanhVien(req.id), khoa = !!req.khoa;
    await q('UPDATE thanh_vien SET khoa = $1 WHERE id = $2', [khoa, u.id]);
    u.khoa = khoa;
    if (khoa) await xoaPhienCua(u.id);
    await doiNguoi();
    return { ok: true };
  },
  async xoaThanhVien(req, toi) {
    chiAdmin(toi);
    const u = layThanhVien(req.id), tenDN = `${u.ten_dang_nhap}#xoa${Date.now().toString(36)}`;
    await q('UPDATE thanh_vien SET da_xoa = true, khoa = true, ten_dang_nhap = $1 WHERE id = $2', [tenDN, u.id]);
    Object.assign(u, { da_xoa: true, khoa: true, ten_dang_nhap: tenDN });
    await xoaPhienCua(u.id);
    await q('DELETE FROM thiet_bi WHERE vai = $1', [u.id]);
    await doiNguoi();
    return { ok: true };
  },

  /* ---- đồng bộ ---- */
  async tongHop(req, toi) {
    ghiDangXem(toi.id, req.kenhMo);
    return {
      ok: true, toi: toi.id, admin: toi.admin, nguoi: dsNguoi(), verNguoi: M.verNguoi, vapid: process.env.VAPID_PUBLIC,
      verLich: M.verLich, lich: M.lich, tin: await tinSau(toi.id, 0), tinCuoi: M.tinCuoi,
      daDoc: daDocCho(toi.id), online: trangThaiOnline()
    };
  },

  async poll(req, toi) {
    ghiDangXem(toi.id, req.kenhMo);
    const r = { ok: true, verLich: M.verLich, verNguoi: M.verNguoi, tinCuoi: M.tinCuoi, daDoc: daDocCho(toi.id), online: trangThaiOnline() };
    if (String(req.verLich) !== M.verLich) r.lich = M.lich;
    if (String(req.verNguoi) !== M.verNguoi) r.nguoi = dsNguoi();
    if (Number(req.tinCuoi || 0) < M.tinCuoi) r.tin = await tinSau(toi.id, Number(req.tinCuoi || 0));
    return r;
  },

  /* ---- lịch ---- */
  async luuLich(req, toi) {
    const ev = chuanHoaLich(req.ev || {}), id = String((req.ev || {}).id || '');
    const cu = id ? M.lich.find(x => x.id === id) : null;
    if (id && !cu) return { loi: 'Sự kiện này đã bị xoá' };
    if (!lichHopLe(ev.lich) && !(cu && cu.lich === ev.lich)) return { loi: 'Người được giao lịch không còn trong danh sách' };
    const moi = Object.assign({}, cu || {}, ev, {
      id: cu ? id : 'L' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex'),
      taoBoi: cu ? cu.taoBoi : toi.id, suaBoi: toi.id, capNhat: bayGio()
    });
    await q('INSERT INTO lich (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data', [moi.id, moi]);
    if (cu) M.lich[M.lich.indexOf(cu)] = moi; else M.lich.push(moi);
    await doiVerLich();
    baoDoiLich(toi.id, moi, cu ? 'sửa' : 'thêm', cu);
    return { ok: true, ev: moi, verLich: M.verLich };
  },

  // Lưu nhiều sự kiện 1 lần: tất cả hoặc không gì cả; mỗi người liên quan chỉ nhận 1 thông báo
  async luuNhieuLich(req, toi) {
    const ds = Array.isArray(req.ds) ? req.ds.slice(0, 200) : [];
    if (!ds.length) return { loi: 'Chưa có lịch nào để lưu' };
    const moi = ds.map((e, i) => {
      let ev;
      try { ev = chuanHoaLich(e || {}); } catch (err) { throw new Error(`Dòng ${i + 1}: ${err.message}`); }
      if (!lichHopLe(ev.lich)) throw new Error(`Dòng ${i + 1}: người được giao lịch không còn trong danh sách`);
      return Object.assign(ev, { id: 'L' + Date.now().toString(36) + crypto.randomBytes(3).toString('hex'), taoBoi: toi.id, suaBoi: toi.id, capNhat: bayGio() });
    });
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      for (const ev of moi) await c.query('INSERT INTO lich (id, data) VALUES ($1, $2)', [ev.id, ev]);
      await c.query('COMMIT');
    } catch (e) { await c.query('ROLLBACK'); throw e; } finally { c.release(); }
    M.lich.push(...moi);
    await doiVerLich();
    const theoNguoi = new Map();
    for (const ev of moi) for (const uid of nguoiNhanLich(ev.lich)) if (uid !== toi.id) (theoNguoi.get(uid) || theoNguoi.set(uid, []).get(uid)).push(ev);
    for (const [uid, evs] of theoNguoi) {
      if (evs.length === 1) { baoDoiLich(toi.id, evs[0], 'thêm', null, [uid]); continue; }
      guiThongBao([uid], {
        title: `${tenCua(toi.id)} đã thêm ${evs.length} lịch`,
        body: evs.slice(0, 4).map(e => `• ${e.tieuDe} – ${moTaGio(e)}`).join('\n') + (evs.length > 4 ? `\n… và ${evs.length - 4} lịch khác` : ''),
        tag: 'lich-nhieu-' + Date.now(), url: './#sap-toi'
      });
    }
    return { ok: true, ds: moi, verLich: M.verLich };
  },

  async xoaLich(req, toi) {
    const cu = M.lich.find(x => x.id === String(req.id || ''));
    if (!cu) return { ok: true, verLich: M.verLich };
    await q('DELETE FROM lich WHERE id = $1', [cu.id]);
    M.lich = M.lich.filter(x => x !== cu);
    await doiVerLich();
    baoDoiLich(toi.id, cu, 'xoá');
    return { ok: true, verLich: M.verLich };
  },

  /* ---- tin nhắn ---- */
  async guiTin(req, toi) {
    const kenh = String(req.kenh || 'nhom');
    if (!kenhCua(toi.id).includes(kenh)) return { loi: 'Bạn không ở trong cuộc trò chuyện này' };
    const nd = String(req.noiDung || '').trim().slice(0, 4000), lichId = String(req.lichId || '').slice(0, 40);
    if (!nd && !lichId) return { loi: 'Tin nhắn trống' };
    const t = bayGio();
    const id = (await q('INSERT INTO tin (t, tu, nd, lich_id, kenh) VALUES ($1,$2,$3,$4,$5) RETURNING id', [t, toi.id, nd, lichId, kenh])).rows[0].id;
    M.tinCuoi = Math.max(M.tinCuoi, id);
    await ghiDaDoc(toi.id, kenh, id);
    phatTin('tin');
    let body = nd;
    if (lichId) { const ev = M.lich.find(e => e.id === lichId); body = (nd ? nd + '\n' : '') + '📅 ' + (ev ? `${ev.tieuDe} • ${moTaGio(ev)}` : 'Một sự kiện'); }
    const nhan = nguoiTrongKenh(kenh).filter(uid => uid !== toi.id && !dangXemKenh(uid, kenh));
    guiThongBao(nhan, {
      title: kenh === 'nhom' ? `💬 ${tenCua(toi.id)} · Nhóm chung` : `💬 ${tenCua(toi.id)}`,
      body: body.slice(0, 180), tag: 'chat-' + id, url: './#chat/' + kenh
    });
    return { ok: true, tin: { id, t, tu: toi.id, nd, lichId, kenh } };
  },

  async daDoc(req, toi) {
    const kenh = String(req.kenh || 'nhom');
    if (!kenhCua(toi.id).includes(kenh)) return { ok: true };
    const id = Math.min(Number(req.id || 0), M.tinCuoi);
    if (id > (M.daDoc.get(`${toi.id}|${kenh}`) || 0)) { await ghiDaDoc(toi.id, kenh, id); phatTin('daDoc'); }
    return { ok: true };
  },

  /* ---- thông báo ---- */
  async dangKyThongBao(req, toi) {
    const s = req.sub || {}, k = s.keys || {};
    if (!/^https:\/\//.test(s.endpoint || '') || !k.p256dh || !k.auth) return { loi: 'Đăng ký thông báo không hợp lệ' };
    await q(`INSERT INTO thiet_bi (endpoint, p256dh, auth, vai, ten_may) VALUES ($1,$2,$3,$4,$5)
             ON CONFLICT (endpoint) DO UPDATE SET p256dh=$2, auth=$3, vai=$4, ten_may=$5, ngay_tao=now()`,
    [s.endpoint, k.p256dh, k.auth, toi.id, String(req.tenMay || '').slice(0, 60)]);
    return { ok: true };
  },
  async huyThongBao(req) { if (req.endpoint) await q('DELETE FROM thiet_bi WHERE endpoint = $1', [req.endpoint]); return { ok: true }; },
  async thuThongBao(req, toi) {
    const kq = await guiThongBao([toi.id], { title: '🔔 Thông báo đã hoạt động', body: 'Máy này sẽ nhận nhắc lịch và tin nhắn.', tag: 'thu', url: './#toi' });
    return kq.daGui ? { ok: true, daGui: kq.daGui } : { loi: kq.ghiChu || 'Chưa có máy nào bật thông báo' };
  }
};
const MO_CONG = new Set(['trangThai', 'caiDat', 'dangNhap']);

async function tinSau(uid, sauId) {
  const kenh = kenhCua(uid);
  if (!kenh.length) return [];
  return (await q('SELECT id, t, tu, nd, lich_id, kenh FROM tin WHERE id > $1 AND kenh = ANY($2) ORDER BY id DESC LIMIT 600', [sauId, kenh])).rows
    .reverse().map(r => ({ id: r.id, t: r.t, tu: r.tu, nd: r.nd, lichId: r.lich_id, kenh: r.kenh }));
}
function daDocCho(uid) {
  const r = {};
  for (const kenh of kenhCua(uid)) { r[kenh] = {}; for (const n of nguoiTrongKenh(kenh)) r[kenh][n] = M.daDoc.get(`${n}|${kenh}`) || 0; }
  return r;
}
async function ghiDaDoc(uid, kenh, id) {
  M.daDoc.set(`${uid}|${kenh}`, id);
  await q('INSERT INTO da_doc (nguoi, kenh, id) VALUES ($1,$2,$3) ON CONFLICT (nguoi, kenh) DO UPDATE SET id = GREATEST(da_doc.id, EXCLUDED.id)', [uid, kenh, id]);
}

async function doiVerLich() { M.verLich = Date.now().toString(36); await datBien('verLich', M.verLich); phatTin('lich'); }
const lichHopLe = l => l === 'chung' || laThanhVien(l);
const nguoiNhanLich = l => l === 'chung' ? dangHoatDong().map(u => u.id) : (laThanhVien(l) && !M.tv.get(l).khoa ? [l] : []);
const tenLich = l => l === 'chung' ? 'lịch chung' : 'lịch của ' + tenCua(l);

function chuanHoaLich(ev) {
  const t = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  const o = {
    tieuDe: String(ev.tieuDe || '').trim().slice(0, 200), caNgay: !!ev.caNgay, bd: String(ev.bd || ''), kt: String(ev.kt || ''),
    diaDiem: String(ev.diaDiem || '').slice(0, 200), lich: String(ev.lich || 'chung'),
    lap: ['', 'ngay', 'tuan', 'thang', 'nam'].includes(ev.lap || '') ? (ev.lap || '') : '',
    lapDen: /^\d{4}-\d{2}-\d{2}$/.test(ev.lapDen || '') ? ev.lapDen : '',
    nhac: ev.nhac == null || ev.nhac === '' ? -1 : Math.max(-1, Math.min(20160, Number(ev.nhac) || 0)),
    ghiChu: String(ev.ghiChu || '').slice(0, 3000)
  };
  if (!o.tieuDe) throw new Error('Chưa nhập nội dung công việc');
  if (!t.test(o.bd) || !t.test(o.kt)) throw new Error('Ngày giờ không hợp lệ');
  if (o.kt < o.bd) o.kt = o.bd;
  return o;
}

function moTaGio(ev) {
  const ymd = ev.bd.slice(0, 10), ngay = `${THU[new Date(ymd + 'T00:00:00Z').getUTCDay()]} ${ymd.slice(8, 10)}/${ymd.slice(5, 7)}`;
  return ev.caNgay ? 'Cả ngày ' + ngay : `${ev.bd.slice(11, 16)} ${ngay}`;
}

// Báo cho người có lịch bị thêm / sửa / xoá (lịch chung: báo cả nhóm), trừ người vừa làm
function baoDoiLich(nguoiLam, ev, kieu, cu, chiGui) {
  const nhan = new Set(chiGui || [...nguoiNhanLich(ev.lich), ...(cu ? nguoiNhanLich(cu.lich) : [])]);
  nhan.delete(nguoiLam);
  if (!nhan.size) return;
  guiThongBao([...nhan], {
    title: `${tenCua(nguoiLam)} đã ${kieu} ${tenLich(ev.lich)}`,
    body: `${ev.tieuDe} • ${moTaGio(ev)}`, tag: 'lich-' + ev.id,
    url: kieu === 'xoá' ? './#lich/' + ev.bd.slice(0, 10) : './#su-kien/' + ev.id
  });
}

/* ===================== ĐANG HOẠT ĐỘNG & KÊNH TỨC THÌ ===================== */
const luong = new Set();   // các kết nối SSE đang mở: {vai, res}
const luongMo = v => [...luong].some(c => c.vai === v);
function ghiDangXem(v, kenhMo) { M.online[v] = { t: Date.now(), kenh: String(kenhMo || '') }; }
const dangXemKenh = (uid, kenh) => { const o = M.online[uid]; return !!o && o.kenh === kenh && luongMo(uid) && Date.now() - o.t < 60000; };
function trangThaiOnline() {
  const r = {};
  for (const u of thanhVien()) {
    const o = M.online[u.id];
    r[u.id] = luongMo(u.id) ? { t: Date.now() } : o ? { t: o.t } : null;
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
  const c = { vai: toi.id, res };
  luong.add(c);
  M.online[toi.id] = Object.assign({}, M.online[toi.id], { t: Date.now() });
  phatTin('online');
  req.on('close', () => {
    luong.delete(c);
    M.online[toi.id] = { t: Date.now(), kenh: '' };
    phatTin('online');
  });
}

/* ===================== THÔNG BÁO ĐẨY ===================== */
async function guiThongBao(ids, tb) {
  if (!ids.length) return { daGui: 0, ghiChu: '' };
  const ds = (await q('SELECT endpoint, p256dh, auth FROM thiet_bi WHERE vai = ANY($1)', [ids])).rows;
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
        await guiThongBao(nguoiNhanLich(ev.lich), {
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
    if (req.method === 'GET') return guiJson(res, 200, { ok: true, ten: 'Lịch làm việc', daCaiDat: M.tv.size > 0 });
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
    if (!/^(Chỉ admin|Không tìm thấy thành viên|Không sửa tài khoản|Dòng \d|Chưa nhập|Ngày giờ)/.test(e.message)) console.error(e);
    if (!res.headersSent) guiJson(res, 200, { loi: e.message || 'Lỗi máy chủ' });
  }
});

async function khoiDong() {
  await taoBang();
  await chuyenDoiBanCu();
  await napBoNho();
}

if (process.argv[2] === 'tao-admin') {
  // node server.js tao-admin <ten_dang_nhap> <mat_khau> : tạo admin mới, hoặc đặt lại mật khẩu nếu admin đó đã có
  (async () => {
    await khoiDong();
    const tenDN = String(process.argv[3] || '').toLowerCase(), mk = String(process.argv[4] || '');
    if (!RE_TEN_DN.test(tenDN) || mk.length < 6) throw new Error('Cách dùng: node server.js tao-admin <ten_dang_nhap> <mat_khau ≥ 6 ký tự>');
    const co = [...M.tv.values()].find(u => u.ten_dang_nhap === tenDN);
    if (co && !co.la_admin) throw new Error('Tên đăng nhập này đang là thành viên, chọn tên khác');
    if (co) { const { salt, hash } = await taoMk(mk); await q('UPDATE thanh_vien SET salt=$1, hash=$2, khoa=false WHERE id=$3', [salt, hash, co.id]); console.log('Đã đặt lại mật khẩu admin', tenDN); }
    else { await themNguoi({ tenDN, mk, ten: 'Quản trị viên', chucVu: 'Admin', admin: true }); console.log('Đã tạo admin', tenDN); }
    console.log('→ Chạy: systemctl restart lichtrinh  để máy chủ đang chạy nhận tài khoản này');
    await pool.end();
  })().catch(e => { console.error(e.message); process.exit(1); });
} else {
  khoiDong().then(() => {
    setInterval(kiemTraNhac, 30000).unref();
    mayChu.listen(PORT, '127.0.0.1', () => console.log(`Lịch làm việc đang chạy ở cổng ${PORT}`));
  }).catch(e => { console.error(e); process.exit(1); });
}
