'use strict';
/* Trang quản trị LƯU QUA MÁY CHỦ. Từ 20/10/2026: LƯU THẲNG VÀO VPS – web đổi ngay, GitHub chỉ là nơi sao lưu (src/dong-bo-web.js gửi bản sao).
   POST /api/qt-github  { token | key, viec, ... }   (token = phiên đăng nhập quản trị, key = ADMIN_KEY)
     viec 'trangThai'                      → { coToken (= lưu được), cheDo 'vps' | 'github', dongBo (tình trạng gửi bản sao GitHub) }
     viec 'doc'    { duong }               → nội dung tệp (giống GitHub contents API: content base64 + sha)
     viec 'ghi'    { duong, noiDung, sha, thongDiep } → lưu (kiểm quyền theo phần được sửa) + ghi nhật ký
     viec 'lichSu' { duong }               → 30 commit gần nhất của tệp
     viec 'docBan' { duong, ref }          → tệp ở một phiên bản cũ
   Chế độ 'vps' (có thư mục web là repo git, mặc định trên VPS): máy chủ API (tài khoản hckapi, không có quyền ghi thư mục web)
     bỏ thay đổi vào hàng chờ /var/lib/hck-api/luu-cho → hck-luu-web.service (root) ghi tệp + commit tại chỗ trong vài giây.
   Chế độ 'github' (không có thư mục web, vd máy thử): ghi thẳng GitHub bằng GITHUB_TOKEN như trước.
   Quyền: js/data.js kiểm từng khối ADMIN được sửa (PRODUCTS → product.update…); phần ngoài khối chỉ chủ shop ('*') được sửa.
   Trang .html chỉ cho sửa khối ADMIN:SEO (seo.update). Ảnh img/*, link xem thử data/nhap/*, tồn kho data/stock.json. Tệp khác: từ chối. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');

const REPO = process.env.GITHUB_REPO || 'Dohoang2010/huongchatkids';
const QUYEN_KHOI = { PRODUCTS: 'product.update', COUPONS: 'product.update', QUA_TANG: 'product.update', TIERS: 'product.update', BANNERS: 'banner.update',
  NAV: 'content.update', POSTS: 'content.update', THEME: 'theme.update', LE_HOI: 'theme.update', CAUHINH: 'setting.update' };
const TEN_KHOI = { PRODUCTS: 'sản phẩm', COUPONS: 'mã giảm giá', QUA_TANG: 'quà tặng', TIERS: 'hạng khách', BANNERS: 'banner', NAV: 'menu', POSTS: 'bài viết', THEME: 'giao diện', LE_HOI: 'giao diện ngày lễ', CAUHINH: 'cấu hình website' };
const QUYEN_SUA = ['product.update', 'banner.update', 'content.update', 'theme.update', 'seo.update', 'setting.update', '*'];
const shaBlob = (buf) => crypto.createHash('sha1').update('blob ' + buf.length + '\0').update(buf).digest('hex');
const loiMa = (ma, msg) => { const e = new Error(msg); e.ma = ma; return e; };

/* ---- Kho GitHub (cách cũ) ---- */
function khoGithub() {
  const token = () => process.env.GITHUB_TOKEN || '';
  async function gh(duongApi, o = {}) {
    const r = await fetch('https://api.github.com/repos/' + REPO + duongApi, { method: o.method || 'GET', signal: AbortSignal.timeout(30000),
      headers: { Authorization: 'Bearer ' + token(), Accept: 'application/vnd.github+json', 'User-Agent': 'hck-api', ...(o.body ? { 'Content-Type': 'application/json' } : {}) }, body: o.body ? JSON.stringify(o.body) : undefined });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw loiMa(r.status, r.status === 409 || r.status === 422 ? 'Tệp vừa bị sửa ở nơi khác – tải lại trang rồi sửa lại nhé' : r.status === 401 ? 'Mã GitHub trên máy chủ sai hoặc hết hạn – chạy lại cai-github.ps1' : r.status === 404 ? 'Không thấy tệp' : 'GitHub báo lỗi ' + r.status + (d.message ? ': ' + d.message : ''));
    return d;
  }
  return {
    cheDo: 'github', san: () => !!token(), chuaSan: 'Máy chủ chưa có mã GitHub – chủ shop chạy cai-github.ps1 trên máy tính shop',
    doc: (duong) => gh('/contents/' + duong + '?ref=main'),
    docBan: (duong, ref) => gh('/contents/' + duong + '?ref=' + (ref || 'main')),
    lichSu: (duong, n) => gh('/commits?per_page=' + n + (duong ? '&path=' + encodeURIComponent(duong) : '')),
    async ghi({ duong, noiDung, shaCu, thongDiep }) {
      const kq = await gh('/contents/' + duong, { method: 'PUT', body: { message: thongDiep, content: noiDung, sha: shaCu || undefined, branch: 'main' } });
      return { sha: kq.content && kq.content.sha, commit: kq.commit ? kq.commit.sha : '' };
    },
    dongBo: () => null,
  };
}

/* ---- Kho VPS: đọc thẳng thư mục web, ghi qua hàng chờ (src/dong-bo-web.js áp dụng bằng root) ---- */
function khoVps(o) {
  const WEB = o.web, TT = o.trangThai, HANG = path.join(TT, 'luu-cho'), XONG = path.join(TT, 'luu-xong'), TINH = path.join(TT, 'dong-bo.json');
  const BAO = o.bao || '/run/hck-api/luu-moi', CHO = o.choToiDa || 20000;
  const git = (args) => new Promise((ok, loi) => execFile('git', ['-c', 'safe.directory=' + WEB, '-C', WEB, ...args], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024, timeout: 20000, env: Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^GIT_/.test(k))) },
    (e, out, err) => (e ? loi(loiMa(404, String(err || e.message).split('\n')[0])) : ok(out))));
  const thu = (fn) => { try { return fn(); } catch { return null; } };
  /* Thay đổi còn trong hàng chờ (chưa kịp ghi) – đọc tệp phải thấy bản mới nhất để lần lưu sau không đè mất */
  const choCuaTep = (duong) => {
    const ds = (thu(() => fs.readdirSync(HANG)) || []).filter((f) => /^[\w-]+\.json$/.test(f)).sort().reverse();
    for (const f of ds) { const v = thu(() => JSON.parse(fs.readFileSync(path.join(HANG, f), 'utf8'))); if (v && v.duong === duong) return Buffer.from(String(v.noiDung || ''), 'base64'); }
    return null;
  };
  const baoGhi = () => { try { fs.writeFileSync(BAO, String(Date.now())); } catch { /* máy thử: không có systemd */ } if (o.khiBao) o.khiBao(); };
  const nghi = (ms) => new Promise((x) => setTimeout(x, ms));
  return {
    cheDo: 'vps', san: () => true,
    async doc(duong) {
      const buf = choCuaTep(duong) || thu(() => fs.readFileSync(path.join(WEB, duong)));
      if (!buf) throw loiMa(404, 'Không thấy tệp ' + duong);
      return { path: duong, encoding: 'base64', content: buf.toString('base64'), sha: shaBlob(buf) };
    },
    async docBan(duong, ref) {
      const r = String(ref || 'HEAD').replace(/[^\w.-]/g, '').slice(0, 60) || 'HEAD';
      const buf = await git(['show', r + ':' + duong]);
      return { path: duong, encoding: 'base64', content: buf.toString('base64'), sha: shaBlob(buf) };
    },
    async lichSu(duong, n) {
      const out = String(await git(['log', '-n', String(n), '--format=%H%x1f%an%x1f%aI%x1f%s%x1e', ...(duong ? ['--', duong] : [])]));
      return out.split('\x1e').map((x) => x.trim()).filter(Boolean).map((x) => { const [sha, ten, ngay, msg] = x.split('\x1f');
        return { sha, html_url: 'https://github.com/' + REPO + '/commit/' + sha, commit: { message: msg, author: { name: ten, date: ngay } } }; });
    },
    async ghi({ duong, noiDung, shaCu, thongDiep, tk }) {
      const id = Date.now().toString(36).padStart(9, '0') + '-' + crypto.randomBytes(4).toString('hex');
      fs.mkdirSync(HANG, { recursive: true });
      const tam = path.join(HANG, '.' + id + '.tam');
      fs.writeFileSync(tam, JSON.stringify({ id, duong, noiDung, shaCu: shaCu || '', thongDiep, tk, luc: new Date().toISOString() }));
      fs.renameSync(tam, path.join(HANG, id + '.json'));
      baoGhi();
      const kqTep = path.join(XONG, id + '.json');
      for (let t = 0; t < CHO; t += 150) {
        await nghi(150);
        const kq = thu(() => JSON.parse(fs.readFileSync(kqTep, 'utf8')));
        if (kq) { thu(() => fs.rmSync(kqTep)); if (!kq.ok) throw loiMa(409, kq.msg || 'Chưa lưu được'); return { sha: kq.sha, commit: kq.commit || '' }; }
        if (t && t % 5000 < 150) baoGhi();   // nhắc lại phòng lần báo trước rơi đúng lúc đang ghi
      }
      /* Quá lâu: thay đổi vẫn nằm trong hàng chờ, sẽ được ghi ở lượt sau (đọc tệp đã thấy bản mới) */
      return { sha: shaBlob(Buffer.from(String(noiDung || ''), 'base64')), commit: '', choXuLy: true };
    },
    dongBo: () => thu(() => JSON.parse(fs.readFileSync(TINH, 'utf8'))),
  };
}

function taoLuuGithub({ bc, ghi, docThan, kho: khoTruyen }) {
  const WEB = process.env.WEB_DIR || '/var/www/huongchatkids';
  const kho = khoTruyen || (process.env.LUU_VPS !== '0' && fs.existsSync(path.join(WEB, '.git'))
    ? khoVps({ web: WEB, trangThai: process.env.STATE_DIRECTORY || '/var/lib/hck-api' }) : khoGithub());
  const unb64 = (s) => Buffer.from(String(s || '').replace(/\n/g, ''), 'base64').toString('utf8');
  const duongHopLe = (d) => /^[\w./-]{1,200}$/.test(d) && !d.includes('..') && !d.startsWith('/');

  /* Khối ADMIN trong data.js: tách khung (phần ngoài khối) + nội dung từng khối */
  const tachKhoi = (src, kieu) => {
    const re = kieu === 'html' ? /<!-- ADMIN:(SEO)[\s\S]*?<!-- \/ADMIN:SEO -->/g : /\/\* ===ADMIN:(\w+)===[\s\S]*?\/\* ===\/ADMIN:\1=== \*\//g;
    const khoi = {}; const khung = String(src).replace(/\r\n/g, '\n').replace(re, (m, k) => { khoi[k] = m; return '@@KHOI:' + k + '@@'; });
    return { khung, khoi };
  };
  async function quyen(dau, ds) { return bc.goiHam('qtQuyenGh_', [dau.token || '', dau.key || '', ds], { thoiGian: 15000 }); }

  /* Gửi bản sao GitHub kẹt quá 30 phút (mất mạng, mã hết hạn, sửa trùng chỗ) → báo chủ shop qua Zalo + email (canhBao_ gộp 10 phút / lần) */
  if (kho.cheDo === 'vps' && !khoTruyen) setInterval(() => {
    const tt = kho.dongBo(); if (!tt || tt.ok || !tt.loiTu) return;
    if (Date.now() - Date.parse(tt.loiTu) < 30 * 60e3) return;
    bc.goiHam('canhBao_', ['dong-bo-github', 'Bản sao lưu trên GitHub chưa cập nhật từ ' + new Date(tt.loiTu).toLocaleString('vi-VN') + ' (web vẫn chạy bình thường): ' + tt.loi]).catch(() => {});
  }, 10 * 60e3).unref();

  async function xuLy(req, res, cors, traJson) {
    let dau; try { dau = JSON.parse(await docThan(req, 26 * 1024 * 1024)); } catch { return traJson(res, 400, { ok: false, msg: 'Dữ liệu gửi lên không hợp lệ' }, cors); }
    const q = await quyen(dau, QUYEN_SUA);
    if (!q || !q.ok) return traJson(res, 200, { ok: false, loi: 'token', msg: 'Phiên quản trị đã hết hạn – đăng nhập lại nhé' }, cors);
    const viec = String(dau.viec || ''), duong = String(dau.duong || '');
    if (viec === 'trangThai') return traJson(res, 200, { ok: true, coToken: kho.san(), cheDo: kho.cheDo, dongBo: kho.dongBo(), tk: q.tk, quyen: q.co }, cors);
    if (!kho.san()) return traJson(res, 200, { ok: false, loi: 'chua-token', msg: kho.chuaSan }, cors);
    try {
      if (viec === 'lichSu') return traJson(res, 200, { ok: true, ds: await kho.lichSu(duong && duongHopLe(duong) ? duong : '', Math.min(Number(dau.soLuong) || 30, 60)) }, cors);
      if (!duongHopLe(duong)) return traJson(res, 400, { ok: false, msg: 'Đường dẫn tệp không hợp lệ' }, cors);
      if (viec === 'doc') return traJson(res, 200, { ok: true, tep: await kho.doc(duong) }, cors);
      if (viec === 'docBan') return traJson(res, 200, { ok: true, tep: await kho.docBan(duong, String(dau.ref || '').replace(/[^\w.-]/g, '').slice(0, 60)) }, cors);
      if (viec !== 'ghi') return traJson(res, 400, { ok: false, msg: 'Việc không hợp lệ' }, cors);

      /* ---- kiểm quyền theo loại tệp ---- */
      const moi = String(dau.noiDung || ''); let canQuyen = [], moTa = '';
      const co = (x) => !!(q.co[x] || q.co['*']);
      if (duong === 'js/data.js' || /^[\w-]+\.html$/.test(duong)) {
        const kieu = duong.endsWith('.html') ? 'html' : 'js', cu = await kho.doc(duong), a = tachKhoi(unb64(cu.content), kieu), b = tachKhoi(unb64(moi), kieu);
        if (dau.sha && dau.sha !== cu.sha) return traJson(res, 200, { ok: false, msg: 'Tệp vừa bị sửa ở nơi khác (máy / phiên khác) – tải lại trang rồi sửa lại nhé' }, cors);
        const doi = Object.keys({ ...a.khoi, ...b.khoi }).filter((k) => a.khoi[k] !== b.khoi[k]);
        if (a.khung !== b.khung) canQuyen.push('*');   // sửa ngoài khối ADMIN = sửa mã web → chỉ chủ shop
        doi.forEach((k) => canQuyen.push(kieu === 'html' ? 'seo.update' : (QUYEN_KHOI[k] || '*')));
        if (kieu === 'js') { try { new vm.Script(unb64(moi), { filename: 'data.js' }); } catch (e) { return traJson(res, 200, { ok: false, msg: 'Dữ liệu mới bị lỗi cú pháp, chưa lưu: ' + e.message }, cors); } }
        moTa = kieu === 'html' ? 'SEO ' + duong : (doi.map((k) => TEN_KHOI[k] || k).join(', ') || 'không đổi');
        if (!doi.length && a.khung === b.khung) return traJson(res, 200, { ok: true, khongDoi: true, tep: { content: cu.content, sha: cu.sha } }, cors);
        dau.sha = cu.sha;
      } else if (duong === 'data/stock.json') {
        try { JSON.parse(unb64(moi)); } catch { return traJson(res, 200, { ok: false, msg: 'Tồn kho không hợp lệ' }, cors); }
        canQuyen = ['product.update']; moTa = 'tồn kho';
      } else if (/^img\/[\w./-]+\.(jpe?g|png|webp|gif)$/i.test(duong)) {
        if (moi.length > 12 * 1024 * 1024) return traJson(res, 200, { ok: false, msg: 'Ảnh quá lớn (tối đa ~9MB)' }, cors);
        if (!['product.update', 'banner.update', 'content.update', 'theme.update', 'seo.update'].some(co)) return traJson(res, 200, { ok: false, msg: 'Tài khoản này không có quyền tải ảnh' }, cors);
        moTa = 'ảnh ' + duong;
      } else if (/^data\/nhap\/[\w-]{8,64}\.json$/.test(duong)) {
        if (!['product.update', 'banner.update', 'content.update', 'theme.update'].some(co)) return traJson(res, 200, { ok: false, msg: 'Tài khoản này không có quyền tạo link xem thử' }, cors);
        moTa = 'link xem thử';
      } else return traJson(res, 200, { ok: false, msg: 'Không được sửa tệp này từ trang quản trị' }, cors);
      const thieu = [...new Set(canQuyen)].filter((x) => !co(x));
      if (thieu.length) return traJson(res, 200, { ok: false, loi: 'quyen', msg: 'Tài khoản ' + q.tk + ' không có quyền sửa phần này (' + moTa + ')' }, cors);

      const thongDiep = 'Quản trị (' + q.tk + '): ' + String(dau.thongDiep || ('cập nhật ' + moTa)).replace(/^Quản trị:\s*/, '').slice(0, 200);
      const kq = await kho.ghi({ duong, noiDung: moi, shaCu: dau.sha, thongDiep, tk: q.tk });
      bc.goiHam('ghiNhatKy', ['Website', q.tk, 'Lưu ' + moTa + (kq.commit ? ' (' + String(kq.commit).slice(0, 7) + ')' : '')]).catch(() => {});
      ghi('Quản trị lưu: ' + q.tk + ' – ' + moTa + (kq.choXuLy ? ' (đang chờ ghi)' : ''));
      if (kho.cheDo === 'github') { const bao = () => { try { fs.writeFileSync('/run/hck-api/keo-web', String(Date.now())); } catch { /* bỏ qua */ } }; bao(); setTimeout(bao, 8000).unref(); }
      return traJson(res, 200, { ok: true, tep: { sha: kq.sha, path: duong }, commit: kq.commit, cheDo: kho.cheDo, choXuLy: !!kq.choXuLy }, cors);
    } catch (e) { ghi('LỖI lưu (' + (q && q.tk) + '): ' + e.message); return traJson(res, 200, { ok: false, msg: e.message }, cors); }
  }
  return { xuLy, tachKhoi, kho };
}
module.exports = { taoLuuGithub, khoVps, khoGithub, shaBlob };
