'use strict';
/* Trang quản trị LƯU QUA MÁY CHỦ: mã GitHub (GITHUB_TOKEN) chỉ nằm trong /etc/hck-api/env trên VPS, không còn trong trình duyệt.
   POST /api/qt-github  { token | key, viec, ... }   (token = phiên đăng nhập quản trị, key = ADMIN_KEY)
     viec 'trangThai'                      → { coToken }
     viec 'doc'    { duong }               → nội dung tệp (giống GitHub contents API: content base64 + sha)
     viec 'ghi'    { duong, noiDung, sha, thongDiep } → commit (kiểm quyền theo phần được sửa) + ghi nhật ký + VPS kéo ngay
     viec 'lichSu' { duong }               → 30 commit gần nhất của tệp
     viec 'docBan' { duong, ref }          → tệp ở một phiên bản cũ
   Quyền: js/data.js kiểm từng khối ADMIN được sửa (PRODUCTS → product.update…); phần ngoài khối chỉ chủ shop ('*') được sửa.
   Trang .html chỉ cho sửa khối ADMIN:SEO (seo.update). Ảnh img/*, link xem thử data/nhap/*, tồn kho data/stock.json. Tệp khác: từ chối. */
const fs = require('node:fs');
const vm = require('node:vm');

const REPO = process.env.GITHUB_REPO || 'Dohoang2010/huongchatkids';
const QUYEN_KHOI = { PRODUCTS: 'product.update', COUPONS: 'product.update', QUA_TANG: 'product.update', TIERS: 'product.update', BANNERS: 'banner.update',
  NAV: 'content.update', POSTS: 'content.update', THEME: 'theme.update', LE_HOI: 'theme.update', CAUHINH: 'setting.update' };
const TEN_KHOI = { PRODUCTS: 'sản phẩm', COUPONS: 'mã giảm giá', QUA_TANG: 'quà tặng', TIERS: 'hạng khách', BANNERS: 'banner', NAV: 'menu', POSTS: 'bài viết', THEME: 'giao diện', LE_HOI: 'giao diện ngày lễ', CAUHINH: 'cấu hình website' };
const QUYEN_SUA = ['product.update', 'banner.update', 'content.update', 'theme.update', 'seo.update', 'setting.update', '*'];

function taoLuuGithub({ bc, ghi, docThan }) {
  const token = () => process.env.GITHUB_TOKEN || '';
  async function gh(duongApi, o = {}) {
    const r = await fetch('https://api.github.com/repos/' + REPO + duongApi, { method: o.method || 'GET', signal: AbortSignal.timeout(30000),
      headers: { Authorization: 'Bearer ' + token(), Accept: 'application/vnd.github+json', 'User-Agent': 'hck-api', ...(o.body ? { 'Content-Type': 'application/json' } : {}) }, body: o.body ? JSON.stringify(o.body) : undefined });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(r.status === 409 || r.status === 422 ? 'Tệp vừa bị sửa ở nơi khác – tải lại trang rồi sửa lại nhé' : r.status === 401 ? 'Mã GitHub trên máy chủ sai hoặc hết hạn – chạy lại cai-github.ps1' : 'GitHub báo lỗi ' + r.status + (d.message ? ': ' + d.message : '')); e.ma = r.status; throw e; }
    return d;
  }
  const b64 = (s) => Buffer.from(s, 'utf8').toString('base64'), unb64 = (s) => Buffer.from(String(s || '').replace(/\n/g, ''), 'base64').toString('utf8');
  const duongHopLe = (d) => /^[\w./-]{1,200}$/.test(d) && !d.includes('..') && !d.startsWith('/');

  /* Khối ADMIN trong data.js: tách khung (phần ngoài khối) + nội dung từng khối */
  const tachKhoi = (src, kieu) => {
    const re = kieu === 'html' ? /<!-- ADMIN:(SEO)[\s\S]*?<!-- \/ADMIN:SEO -->/g : /\/\* ===ADMIN:(\w+)===[\s\S]*?\/\* ===\/ADMIN:\1=== \*\//g;
    const khoi = {}; const khung = String(src).replace(/\r\n/g, '\n').replace(re, (m, k) => { khoi[k] = m; return '@@KHOI:' + k + '@@'; });
    return { khung, khoi };
  };
  async function quyen(dau, ds) { return bc.goiHam('qtQuyenGh_', [dau.token || '', dau.key || '', ds], { thoiGian: 15000 }); }

  async function xuLy(req, res, cors, traJson) {
    let dau; try { dau = JSON.parse(await docThan(req, 26 * 1024 * 1024)); } catch { return traJson(res, 400, { ok: false, msg: 'Dữ liệu gửi lên không hợp lệ' }, cors); }
    const q = await quyen(dau, QUYEN_SUA);
    if (!q || !q.ok) return traJson(res, 200, { ok: false, loi: 'token', msg: 'Phiên quản trị đã hết hạn – đăng nhập lại nhé' }, cors);
    const viec = String(dau.viec || ''), duong = String(dau.duong || '');
    if (viec === 'trangThai') return traJson(res, 200, { ok: true, coToken: !!token(), tk: q.tk, quyen: q.co }, cors);
    if (!token()) return traJson(res, 200, { ok: false, loi: 'chua-token', msg: 'Máy chủ chưa có mã GitHub – chủ shop chạy cai-github.ps1 trên máy tính shop' }, cors);
    try {
      if (viec === 'lichSu') { const ds = await gh('/commits?per_page=' + Math.min(Number(dau.soLuong) || 30, 60) + (duong && duongHopLe(duong) ? '&path=' + encodeURIComponent(duong) : '')); return traJson(res, 200, { ok: true, ds }, cors); }
      if (!duongHopLe(duong)) return traJson(res, 400, { ok: false, msg: 'Đường dẫn tệp không hợp lệ' }, cors);
      if (viec === 'doc' || viec === 'docBan') {
        const ref = viec === 'docBan' ? String(dau.ref || '').replace(/[^\w.-]/g, '').slice(0, 60) : 'main';
        return traJson(res, 200, { ok: true, tep: await gh('/contents/' + duong + '?ref=' + (ref || 'main')) }, cors);
      }
      if (viec !== 'ghi') return traJson(res, 400, { ok: false, msg: 'Việc không hợp lệ' }, cors);

      /* ---- kiểm quyền theo loại tệp ---- */
      const moi = String(dau.noiDung || ''); let canQuyen = [], moTa = '';
      const co = (x) => !!(q.co[x] || q.co['*']);
      if (duong === 'js/data.js' || /^[\w-]+\.html$/.test(duong)) {
        const kieu = duong.endsWith('.html') ? 'html' : 'js', cu = await gh('/contents/' + duong + '?ref=main'), a = tachKhoi(unb64(cu.content), kieu), b = tachKhoi(unb64(moi), kieu);
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

      const kq = await gh('/contents/' + duong, { method: 'PUT', body: { message: 'Quản trị (' + q.tk + '): ' + String(dau.thongDiep || ('cập nhật ' + moTa)).replace(/^Quản trị:\s*/, '').slice(0, 200), content: moi, sha: dau.sha || undefined, branch: 'main' } });
      bc.goiHam('ghiNhatKy', ['Website', q.tk, 'Lưu ' + moTa + ' (' + String(kq.commit && kq.commit.sha || '').slice(0, 7) + ')']).catch(() => {});
      ghi('Quản trị lưu: ' + q.tk + ' – ' + moTa);
      const bao = () => { try { fs.writeFileSync('/run/hck-api/keo-web', String(Date.now())); } catch { /* bỏ qua */ } }; bao(); setTimeout(bao, 8000).unref();
      return traJson(res, 200, { ok: true, tep: kq.content ? { sha: kq.content.sha, path: kq.content.path } : null, commit: kq.commit ? kq.commit.sha : '' }, cors);
    } catch (e) { ghi('LỖI lưu GitHub (' + (q && q.tk) + '): ' + e.message); return traJson(res, 200, { ok: false, msg: e.message }, cors); }
  }
  return { xuLy, tachKhoi };
}
module.exports = { taoLuuGithub };
