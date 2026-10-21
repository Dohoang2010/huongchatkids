'use strict';
/* LỊCH ĐĂNG FACEBOOK – máy chủ VPS tự đăng bài lên page đúng giờ (Graph API chính thức của Meta).
   POST /api/qt-fb { token | key, viec, ... }   (phiên quản trị như /api/qt-github)
     viec 'trangThai'                 → kết nối page (tên page, cần đăng nhập lại?)
     viec 'ds'                        → danh sách bài (kèm ảnh nhỏ để xem trước)
     viec 'luu'    { bai }            → tạo / sửa bài (sửa bài đã duyệt → về Chờ duyệt)
     viec 'duyet'  { id, co }         → duyệt / bỏ duyệt (chỉ chủ shop '*')
     viec 'dangNgay' { id }           → duyệt + đăng ngay (chỉ chủ shop)
     viec 'xoa'    { id }             → xoá bài khỏi lịch (bài đã đăng trên Facebook giữ nguyên)
     viec 'kiemTra'                   → kiểm tra lại mã page ngay
   Bài CHƯA DUYỆT không bao giờ tự đăng. Mã page (FB_PAGE_ID, FB_PAGE_TOKEN) chỉ nằm trong /etc/hck-api/env (đặt bằng tools/may-chu-vps/cai-facebook.ps1).
   Mã hết hạn / bị Facebook khoá → dừng đăng, đánh dấu "cần đăng nhập lại" (trang quản trị hiện cảnh báo đỏ) – KHÔNG báo Zalo (chủ shop dặn 21/10/2026).
   Dữ liệu: <STATE>/fb/lich.json + <STATE>/fb/anh/<id>/… (ảnh bài + ảnh bình luận + ảnh nhỏ). */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const GOC_WEB = 'huongchatkids.vn';
const TRE_TOI_DA = 12 * 3600e3;   // máy chủ tắt quá 12 tiếng thì không đăng bù (tránh đăng bài lễ sai ngày)
const QUYEN_SUA = 'content.update';

/* Gắn link theo dõi vào link web trong bài: ?nguon=facebook&cd=<mã bài> (Quản trị › Thống kê bán hàng biết bài nào ra đơn) */
function ganTheoDoi(chu, cd) {
  if (!cd) return String(chu || '');
  return String(chu || '').replace(/(https?:\/\/)?(?:www\.)?huongchatkids\.vn(\/[^\s)\]]*)?/gi, (m, giao, duong) => {
    if (!giao && !duong) return m;                       // chữ "huongchatkids.vn" trơn: giữ nguyên cho đẹp
    if (/[?&]nguon=/.test(m)) return m;
    const u = 'https://' + GOC_WEB + (duong || '/');
    return u + (u.includes('?') ? '&' : '?') + 'nguon=facebook&cd=' + encodeURIComponent(cd);
  });
}
const loiToken = (e) => !!(e && (e.code === 190 || e.code === 102 || e.code === 10 || e.code === 200 || e.type === 'OAuthException' && e.code !== 368));

function taoDangFb({ bc, ghi, docThan, thuMuc, fetchFn, bayGio }) {
  const now = bayGio || (() => Date.now());
  const goi = fetchFn || ((...a) => fetch(...a));
  const TM = thuMuc || path.join(process.env.STATE_DIRECTORY || '/var/lib/hck-api', 'fb');
  const LICH = path.join(TM, 'lich.json'), TINH = path.join(TM, 'trang-thai.json'), ANH = path.join(TM, 'anh');
  const VER = process.env.FB_GRAPH_VER || 'v23.0';
  const page = () => ({ id: process.env.FB_PAGE_ID || '', token: process.env.FB_PAGE_TOKEN || '' });
  let sharp = null; try { sharp = require('sharp'); } catch { /* máy thử */ }
  fs.mkdirSync(ANH, { recursive: true });
  const thu = (fn) => { try { return fn(); } catch { return null; } };
  const ghiTep = (f, s) => { const t = f + '.tam'; fs.writeFileSync(t, s); fs.renameSync(t, f); };
  const docLich = () => thu(() => JSON.parse(fs.readFileSync(LICH, 'utf8'))) || [];
  const ghiLich = (ds) => ghiTep(LICH, JSON.stringify(ds, null, 1));
  const docTinh = () => thu(() => JSON.parse(fs.readFileSync(TINH, 'utf8'))) || {};
  const ghiTinh = (o) => ghiTep(TINH, JSON.stringify({ ...docTinh(), ...o }));
  const maMoi = () => now().toString(36) + crypto.randomBytes(3).toString('hex');
  const anhCua = (id) => path.join(ANH, String(id).replace(/[^\w-]/g, ''));

  /* ---------- Graph API ---------- */
  async function graph(duong, form, phuongThuc) {
    const p = page(), url = 'https://graph.facebook.com/' + VER + '/' + duong;
    let r;
    if (form) { form.append('access_token', p.token); r = await goi(url, { method: 'POST', body: form, signal: AbortSignal.timeout(120000) }); }
    else r = await goi(url + (url.includes('?') ? '&' : '?') + 'access_token=' + encodeURIComponent(p.token), { method: phuongThuc || 'GET', signal: AbortSignal.timeout(30000) });
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.error) { const e = d.error || {}; const x = new Error('Facebook báo lỗi' + (e.code ? ' ' + e.code : '') + ': ' + (e.error_user_msg || e.message || r.status)); x.fb = e; throw x; }
    return d;
  }
  const formAnh = (tep, them) => { const f = new FormData(); f.append('source', new Blob([fs.readFileSync(tep)], { type: 'image/jpeg' }), path.basename(tep)); Object.entries(them || {}).forEach(([k, v]) => f.append(k, v)); return f; };

  async function kiemTraToken() {
    const p = page();
    if (!p.id || !p.token) { ghiTinh({ coToken: false, canDangNhap: false, loi: '', kiemLuc: new Date(now()).toISOString() }); return docTinh(); }
    try {
      const d = await graph(encodeURIComponent(p.id) + '?fields=id,name');
      ghiTinh({ coToken: true, canDangNhap: false, loi: '', trang: { id: d.id, ten: d.name }, kiemLuc: new Date(now()).toISOString() });
    } catch (e) {
      if (loiToken(e.fb)) datCanDangNhap(e.message); else ghiTinh({ coToken: true, loi: e.message, kiemLuc: new Date(now()).toISOString() });
    }
    return docTinh();
  }
  function datCanDangNhap(msg) {
    const cu = docTinh();
    ghiTinh({ coToken: true, canDangNhap: true, loi: msg, canTu: cu.canDangNhap ? cu.canTu : new Date(now()).toISOString(), kiemLuc: new Date(now()).toISOString() });
    if (!cu.canDangNhap) ghi('FACEBOOK: mã page hết hạn / bị khoá – cần đăng nhập lại (chạy cai-facebook.ps1): ' + msg);
  }

  /* Đăng 1 bài: tải ảnh (chưa công khai) → tạo bài kèm ảnh → đăng bình luận (kèm ảnh nếu có) */
  async function dang(bai) {
    const p = page(), dir = anhCua(bai.id), cd = bai.cd || ('fb-' + bai.id);
    const ids = [];
    for (const a of bai.anh || []) { const d = await graph(encodeURIComponent(p.id) + '/photos', formAnh(path.join(dir, a), { published: 'false' })); ids.push(d.id); }
    const f = new FormData(); f.append('message', ganTheoDoi(bai.noiDung, cd));
    ids.forEach((x, i) => f.append('attached_media[' + i + ']', JSON.stringify({ media_fbid: x })));
    const kq = await graph(encodeURIComponent(p.id) + '/feed', f);
    const postId = kq.id, binhLuan = [];
    for (const b of bai.binhLuan || []) {
      try {
        const fb = b.anh ? formAnh(path.join(dir, b.anh), { message: ganTheoDoi(b.noiDung, cd) }) : (() => { const x = new FormData(); x.append('message', ganTheoDoi(b.noiDung, cd)); return x; })();
        binhLuan.push({ ok: true, id: (await graph(postId + '/comments', fb)).id });
      } catch (e) { if (loiToken(e.fb)) throw e; binhLuan.push({ ok: false, loi: e.message }); }
    }
    let link = ''; try { link = (await graph(postId + '?fields=permalink_url')).permalink_url || ''; } catch { link = 'https://www.facebook.com/' + postId; }
    return { postId, link, binhLuan };
  }

  /* Mỗi phút: bài đã duyệt tới giờ → đăng (lần lượt từng bài) */
  let dangChay = false;
  async function nhip() {
    if (dangChay) return; dangChay = true;
    try {
      const p = page(), t = docTinh();
      if (!p.id || !p.token || t.canDangNhap) return;
      const ds = docLich(), bai = ds.filter((b) => b.trangThai === 'duyet' && Date.parse(b.luc) <= now()).sort((a, b) => Date.parse(a.luc) - Date.parse(b.luc))[0];
      if (!bai) return;
      if (now() - Date.parse(bai.luc) > TRE_TOI_DA) { capNhat(bai.id, { trangThai: 'loi', loi: 'Quá giờ đăng hơn 12 tiếng (máy chủ tắt?) – chọn giờ mới rồi duyệt lại' }); return; }
      capNhat(bai.id, { trangThai: 'dang-dang', loi: '' });
      try {
        const kq = await dang(bai);
        capNhat(bai.id, { trangThai: 'da-dang', ketQua: { ...kq, luc: new Date(now()).toISOString() } });
        ghi('FACEBOOK: đã đăng bài ' + bai.id + ' → ' + kq.link);
        bc.goiHam('ghiNhatKy', ['Facebook', 'hệ thống', 'Đã đăng bài ' + (bai.cd || bai.id) + ': ' + kq.link]).catch(() => {});
      } catch (e) {
        if (loiToken(e.fb)) { datCanDangNhap(e.message); capNhat(bai.id, { trangThai: 'duyet', loi: 'Chờ đăng nhập lại Facebook' }); }
        else { capNhat(bai.id, { trangThai: 'loi', loi: e.message }); ghi('FACEBOOK: LỖI đăng bài ' + bai.id + ': ' + e.message); }
      }
    } finally { dangChay = false; }
  }
  function capNhat(id, o) { const ds = docLich(), i = ds.findIndex((b) => b.id === id); if (i < 0) return null; ds[i] = { ...ds[i], ...o, sua: new Date(now()).toISOString() }; ghiLich(ds); return ds[i]; }

  /* ---------- ảnh ---------- */
  async function luuAnh(id, b64, ten) {
    const buf = Buffer.from(String(b64 || '').replace(/^data:[^,]*,/, ''), 'base64');
    if (buf.length < 200) throw new Error('Ảnh không hợp lệ');
    if (buf.length > 12 * 1024 * 1024) throw new Error('Ảnh quá lớn (tối đa ~9MB)');
    const dir = anhCua(id); fs.mkdirSync(dir, { recursive: true });
    const tep = ten + '.jpg';
    if (sharp) {
      await sharp(buf).rotate().resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#fff' }).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(dir, tep));
      await sharp(buf).rotate().resize({ width: 240, height: 240, fit: 'inside' }).flatten({ background: '#fff' }).jpeg({ quality: 72 }).toFile(path.join(dir, ten + '-nho.jpg'));
    } else { fs.writeFileSync(path.join(dir, tep), buf); fs.writeFileSync(path.join(dir, ten + '-nho.jpg'), buf); }
    return tep;
  }
  const nho = (id, tep) => thu(() => 'data:image/jpeg;base64,' + fs.readFileSync(path.join(anhCua(id), tep.replace(/\.jpg$/, '-nho.jpg'))).toString('base64')) || '';
  const choXem = (b) => ({ ...b, anhNho: (b.anh || []).map((a) => nho(b.id, a)), binhLuan: (b.binhLuan || []).map((x) => ({ ...x, anhNho: x.anh ? nho(b.id, x.anh) : '' })) });

  /* ---------- API cho trang quản trị ---------- */
  async function xuLy(req, res, cors, traJson) {
    let d; try { d = JSON.parse(await docThan(req, 40 * 1024 * 1024)); } catch { return traJson(res, 400, { ok: false, msg: 'Dữ liệu gửi lên không hợp lệ' }, cors); }
    const q = await bc.goiHam('qtQuyenGh_', [d.token || '', d.key || '', [QUYEN_SUA, '*']], { thoiGian: 15000 });
    if (!q || !q.ok) return traJson(res, 200, { ok: false, loi: 'token', msg: 'Phiên quản trị đã hết hạn – đăng nhập lại nhé' }, cors);
    const sua = !!(q.co[QUYEN_SUA] || q.co['*']), chu = !!q.co['*'];
    if (!sua) return traJson(res, 200, { ok: false, msg: 'Tài khoản này không có quyền quản lý bài đăng' }, cors);
    const viec = String(d.viec || '');
    try {
      if (viec === 'trangThai' || viec === 'kiemTra') {
        const t = viec === 'kiemTra' || !docTinh().kiemLuc ? await kiemTraToken() : docTinh();
        return traJson(res, 200, { ok: true, ...t, coToken: !!(page().id && page().token), chuShop: chu }, cors);
      }
      if (viec === 'ds') return traJson(res, 200, { ok: true, ds: docLich().sort((a, b) => Date.parse(b.luc) - Date.parse(a.luc)).map(choXem), chuShop: chu }, cors);
      if (viec === 'luu') {
        const v = d.bai || {}, ds = docLich(), cu = v.id ? ds.find((b) => b.id === v.id) : null;
        if (v.id && !cu) return traJson(res, 200, { ok: false, msg: 'Không thấy bài này' }, cors);
        if (cu && (cu.trangThai === 'da-dang' || cu.trangThai === 'dang-dang')) return traJson(res, 200, { ok: false, msg: 'Bài đã đăng – không sửa được nữa' }, cors);
        const noiDung = String(v.noiDung || '').trim().slice(0, 60000);
        if (!noiDung) return traJson(res, 200, { ok: false, msg: 'Bài chưa có nội dung' }, cors);
        if (!Date.parse(v.luc)) return traJson(res, 200, { ok: false, msg: 'Chọn giờ đăng' }, cors);
        const id = cu ? cu.id : maMoi();
        let anh = (cu ? cu.anh || [] : []).filter((a) => (v.giuAnh || []).includes(a));
        for (const b64 of v.anhMoi || []) { if (anh.length >= 10) break; anh.push(await luuAnh(id, b64, 'a' + maMoi())); }
        if (Array.isArray(v.thuTuAnh)) anh = v.thuTuAnh.filter((a) => anh.includes(a)).concat(anh.filter((a) => !v.thuTuAnh.includes(a)));
        const binhLuan = [];
        for (const b of (v.binhLuan || []).slice(0, 5)) {
          const nd = String(b.noiDung || '').trim().slice(0, 8000); if (!nd && !b.anhMoi && !b.anh) continue;
          binhLuan.push({ noiDung: nd, anh: b.anhMoi ? await luuAnh(id, b.anhMoi, 'b' + maMoi()) : (b.anh && cu && (cu.binhLuan || []).some((x) => x.anh === b.anh) ? b.anh : '') });
        }
        const moi = { id, noiDung, anh, binhLuan, luc: new Date(Date.parse(v.luc)).toISOString(), cd: String(v.cd || '').replace(/[^\w-]/g, '').slice(0, 40) || 'fb-' + id,
          tieuDe: String(v.tieuDe || '').slice(0, 120), trangThai: 'nhap', loi: '', tao: cu ? cu.tao : new Date(now()).toISOString(), taoBoi: cu ? cu.taoBoi : q.tk, suaBoi: q.tk, sua: new Date(now()).toISOString() };
        if (cu) ds[ds.indexOf(cu)] = moi; else ds.push(moi);
        ghiLich(ds);
        /* dọn ảnh không còn dùng */
        const dung = new Set([...anh, ...binhLuan.map((b) => b.anh).filter(Boolean)].flatMap((a) => [a, a.replace(/\.jpg$/, '-nho.jpg')]));
        (thu(() => fs.readdirSync(anhCua(id))) || []).forEach((f) => { if (!dung.has(f)) thu(() => fs.rmSync(path.join(anhCua(id), f))); });
        bc.goiHam('ghiNhatKy', ['Facebook', q.tk, (cu ? 'Sửa' : 'Tạo') + ' bài ' + moi.cd + ' (chờ duyệt)']).catch(() => {});
        return traJson(res, 200, { ok: true, bai: choXem(moi) }, cors);
      }
      const bai = docLich().find((b) => b.id === String(d.id || ''));
      if (!bai) return traJson(res, 200, { ok: false, msg: 'Không thấy bài này' }, cors);
      if (viec === 'xoa') {
        if (bai.trangThai === 'dang-dang') return traJson(res, 200, { ok: false, msg: 'Bài đang được đăng, thử lại sau ít phút' }, cors);
        if (bai.trangThai === 'duyet' && !chu) return traJson(res, 200, { ok: false, msg: 'Bài đã duyệt – chỉ chủ shop xoá được' }, cors);
        ghiLich(docLich().filter((b) => b.id !== bai.id)); thu(() => fs.rmSync(anhCua(bai.id), { recursive: true, force: true }));
        bc.goiHam('ghiNhatKy', ['Facebook', q.tk, 'Xoá bài ' + bai.cd + ' khỏi lịch']).catch(() => {});
        return traJson(res, 200, { ok: true }, cors);
      }
      if (viec === 'duyet' || viec === 'dangNgay') {
        if (!chu) return traJson(res, 200, { ok: false, msg: 'Chỉ chủ shop được duyệt bài đăng Facebook' }, cors);
        if (bai.trangThai === 'da-dang' || bai.trangThai === 'dang-dang') return traJson(res, 200, { ok: false, msg: 'Bài đã đăng rồi' }, cors);
        const co = viec === 'dangNgay' || d.co !== false;
        if (co && viec === 'duyet' && Date.parse(bai.luc) < now() - 60e3) return traJson(res, 200, { ok: false, msg: 'Giờ đăng đã qua – sửa giờ đăng mới rồi duyệt, hoặc bấm Đăng ngay' }, cors);
        const sau = capNhat(bai.id, co ? { trangThai: 'duyet', loi: '', duyetBoi: q.tk, ...(viec === 'dangNgay' ? { luc: new Date(now()).toISOString() } : {}) } : { trangThai: 'nhap' });
        bc.goiHam('ghiNhatKy', ['Facebook', q.tk, (viec === 'dangNgay' ? 'Đăng ngay' : co ? 'Duyệt' : 'Bỏ duyệt') + ' bài ' + bai.cd]).catch(() => {});
        if (viec === 'dangNgay') { const t = docTinh(); if (t.canDangNhap) return traJson(res, 200, { ok: false, msg: 'Facebook đang cần đăng nhập lại – bài đã duyệt, sẽ tự đăng khi kết nối lại' }, cors); setTimeout(() => nhip().catch(() => {}), 50); }
        return traJson(res, 200, { ok: true, bai: choXem(sau) }, cors);
      }
      return traJson(res, 400, { ok: false, msg: 'Việc không hợp lệ' }, cors);
    } catch (e) { ghi('LỖI lịch đăng Facebook (' + q.tk + '): ' + e.message); return traJson(res, 200, { ok: false, msg: e.message }, cors); }
  }

  function chay() {
    /* máy chủ tắt giữa lúc đang đăng → không biết bài đã lên chưa: KHÔNG đăng lại (tránh trùng), báo để chủ shop kiểm tra page */
    const ds = docLich(); let doi = 0;
    ds.forEach((b) => { if (b.trangThai === 'dang-dang') { b.trangThai = 'loi'; b.loi = 'Máy chủ khởi động lại lúc đang đăng – mẹ xem trên page đã có bài chưa; chưa có thì bấm Đăng ngay'; doi++; } });
    if (doi) ghiLich(ds);
    const t1 = setInterval(() => nhip().catch((e) => ghi('FACEBOOK nhịp lỗi: ' + e.message)), 60e3); t1.unref();
    const t2 = setInterval(() => kiemTraToken().catch(() => {}), 6 * 3600e3); t2.unref();
    setTimeout(() => kiemTraToken().catch(() => {}), 15e3).unref();
  }
  return { xuLy, nhip, kiemTraToken, chay, ganTheoDoi, docLich, docTinh };
}
module.exports = { taoDangFb, ganTheoDoi };
