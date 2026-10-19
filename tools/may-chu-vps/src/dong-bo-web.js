'use strict';
/* LƯU THẲNG VÀO VPS – GitHub chỉ còn là nơi sao lưu.
   Chạy bằng root (systemd), KHÔNG chạy trong máy chủ API:
     node src/dong-bo-web.js --ap-dung   (hck-luu-web.service)  ghi các thay đổi trong hàng chờ vào thư mục web + commit tại chỗ → web đổi ngay
     node src/dong-bo-web.js --dong-bo   (hck-keo-web.service, mỗi phút + khi gọi /api/keo-web)
                                          áp dụng hàng chờ, kéo bản mới từ GitHub (rebase phần quản trị lên trên), rồi gửi bản sao lên GitHub
   Hàng chờ: máy chủ API (đã kiểm quyền từng tài khoản) ghi /var/lib/hck-api/luu-cho/<id>.json { id, duong, noiDung (base64), shaCu, thongDiep, tk };
   kết quả ghi /var/lib/hck-api/luu-xong/<id>.json; tình trạng gửi GitHub ở /var/lib/hck-api/dong-bo.json.
   GitHub lỗi / mất mạng: web vẫn chạy bản trên VPS, commit nằm chờ, lần sau tự gửi. Mã GITHUB_TOKEN đọc từ /etc/hck-api/env, không ghi vào repo. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

/* Tệp trang quản trị được sửa (máy chủ API cũng kiểm – ở đây kiểm lại lần nữa vì thư mục hàng chờ do tài khoản hckapi ghi) */
const duongHopLe = (d) => /^[\w./-]{1,200}$/.test(d) && !d.includes('..') && !d.startsWith('/') &&
  (d === 'js/data.js' || d === 'data/stock.json' || /^[\w-]+\.html$/.test(d) || /^img\/[\w./-]+\.(jpe?g|png|webp|gif)$/i.test(d) || /^data\/nhap\/[\w-]{8,64}\.json$/.test(d));
const shaBlob = (buf) => crypto.createHash('sha1').update('blob ' + buf.length + '\0').update(buf).digest('hex');

function tao(o = {}) {
  const WEB = o.web || process.env.WEB_DIR || '/var/www/huongchatkids';
  const TT = o.trangThai || process.env.HCK_STATE || '/var/lib/hck-api';
  const HANG = path.join(TT, 'luu-cho'), XONG = path.join(TT, 'luu-xong'), KHOA = path.join(TT, 'dong-bo.khoa'), TINH = path.join(TT, 'dong-bo.json');
  const ENV = o.env || '/etc/hck-api/env';
  const NHANH = o.nhanh || 'main';
  const git = (args, them = {}) => execFileSync('git', ['-c', 'safe.directory=' + WEB, '-c', 'core.autocrlf=false', '-C', WEB, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: them.thoiGian || 30000, env: { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^GIT_/.test(k))), GIT_TERMINAL_PROMPT: '0', ...(them.env || {}) } }).trim();
  const thu = (fn) => { try { return fn(); } catch { return null; } };

  /* Khoá đơn giản bằng mkdir (nguyên tử) – 2 lệnh không cùng sửa repo; khoá treo quá 3 phút coi như bỏ */
  function khoa(fn) {
    for (let i = 0; i < 100; i++) {
      try { fs.mkdirSync(KHOA); break; } catch {
        const tuoi = thu(() => Date.now() - fs.statSync(KHOA).mtimeMs);
        if (tuoi > 180000) { thu(() => fs.rmdirSync(KHOA)); continue; }
        if (i === 99) throw new Error('Đang bận lưu, thử lại sau');
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
      }
    }
    try { return fn(); } finally { thu(() => fs.rmdirSync(KHOA)); }
  }
  const ghiNguyenTu = (dich, noiDung) => { fs.mkdirSync(path.dirname(dich), { recursive: true }); const t = dich + '.tam-' + process.pid; fs.writeFileSync(t, noiDung); fs.renameSync(t, dich); };
  const ketQua = (id, kq) => thu(() => { fs.mkdirSync(XONG, { recursive: true }); ghiNguyenTu(path.join(XONG, id + '.json'), JSON.stringify(kq)); });

  /* 1 thay đổi trong hàng chờ → ghi tệp + commit tại chỗ */
  function apMot(tep) {
    let v; try { v = JSON.parse(fs.readFileSync(path.join(HANG, tep), 'utf8')); } catch { fs.rmSync(path.join(HANG, tep), { force: true }); return; }
    const id = String(v.id || tep.replace(/\.json$/, '')).replace(/[^\w-]/g, '');
    try {
      if (!duongHopLe(String(v.duong || ''))) throw new Error('Không được sửa tệp này');
      const dich = path.join(WEB, v.duong), moi = Buffer.from(String(v.noiDung || ''), 'base64');
      const cu = thu(() => fs.readFileSync(dich));
      if (v.shaCu && (!cu || shaBlob(cu) !== v.shaCu)) throw new Error('Tệp vừa bị sửa ở nơi khác (máy / phiên khác) – tải lại trang rồi sửa lại nhé');
      let commit = '';
      if (!cu || !cu.equals(moi)) {
        ghiNguyenTu(dich, moi);
        git(['add', '--', v.duong]);
        const tk = String(v.tk || 'quản trị').replace(/[^\p{L}\p{N} ._@-]/gu, '').slice(0, 60) || 'quản trị';
        git(['-c', 'user.name=Quản trị (' + tk + ')', '-c', 'user.email=quan-tri@huongchatkids.vn', 'commit', '-q', '-m', String(v.thongDiep || 'Quản trị: cập nhật').slice(0, 300), '--', v.duong]);
        commit = git(['rev-parse', 'HEAD']);
      }
      ketQua(id, { ok: true, sha: shaBlob(moi), commit, luc: Date.now() });
    } catch (e) { ketQua(id, { ok: false, msg: String(e.message || e).split('\n')[0].slice(0, 300) }); }
    fs.rmSync(path.join(HANG, tep), { force: true });
  }
  function apDung() {
    let n = 0;
    for (let vong = 0; vong < 20; vong++) {   // quét lại tới khi hết (có thể có thay đổi mới trong lúc đang ghi)
      const ds = thu(() => fs.readdirSync(HANG).filter((f) => /^[\w-]+\.json$/.test(f)).sort()) || [];
      if (!ds.length) break;
      khoa(() => ds.forEach((f) => { apMot(f); n++; }));
    }
    /* dọn kết quả cũ không ai đọc (máy chủ API đọc xong thì xoá) */
    (thu(() => fs.readdirSync(XONG)) || []).forEach((f) => thu(() => { if (Date.now() - fs.statSync(path.join(XONG, f)).mtimeMs > 3600e3) fs.rmSync(path.join(XONG, f)); }));
    return n;
  }

  const docToken = () => { const m = (thu(() => fs.readFileSync(ENV, 'utf8')) || '').match(/^GITHUB_TOKEN=(.+)$/m); return m ? m[1].trim().replace(/^["']|["']$/g, '') : (o.token || ''); };
  const dauXacThuc = (t) => (t ? ['-c', 'http.https://github.com/.extraheader=Authorization: Basic ' + Buffer.from('x-access-token:' + t).toString('base64')] : []);
  const anMa = (s, t) => String(s || '').split(t || '\u0000').join('***').replace(/Basic [\w+/=]+/g, 'Basic ***').split('\n').filter(Boolean).slice(-3).join(' | ').slice(0, 400);

  /* Kéo bản mới từ GitHub + gửi bản sao các thay đổi của trang quản trị */
  function dongBo() {
    const tt = { luc: new Date().toISOString(), ok: true, choGui: 0, loi: '' };
    apDung();
    const t = docToken();
    try { git([...dauXacThuc(t), 'fetch', '-q', 'origin', NHANH], { thoiGian: 45000 }); }
    catch (e) { tt.ok = false; tt.loi = 'Không kéo được từ GitHub: ' + anMa(e.stderr || e.message, t); }
    khoa(() => {
      if (!tt.ok) return;
      const [truoc, sau] = git(['rev-list', '--left-right', '--count', 'HEAD...origin/' + NHANH]).split(/\s+/).map(Number);
      if (!sau) return;
      try {
        if (!truoc) git(['merge', '-q', '--ff-only', 'origin/' + NHANH]);
        else git(['-c', 'user.name=VPS', '-c', 'user.email=vps@huongchatkids.vn', 'rebase', '-q', 'origin/' + NHANH], { thoiGian: 60000 });
      } catch (e) {
        thu(() => git(['rebase', '--abort']));
        tt.ok = false; tt.xungDot = true;
        tt.loi = 'Bản trên GitHub và bản trên VPS cùng sửa một chỗ – giữ nguyên bản VPS, chưa gửi được: ' + anMa(e.stderr || e.message, t);
      }
    });
    tt.choGui = Number(thu(() => git(['rev-list', '--count', 'origin/' + NHANH + '..HEAD'])) || 0);
    if (tt.choGui && !tt.xungDot) {
      if (!t) { tt.ok = false; tt.loi = 'Máy chủ chưa có mã GitHub – thay đổi chỉ nằm trên VPS (chạy cai-github.ps1)'; }
      else {
        try { git([...dauXacThuc(t), 'push', '-q', 'origin', 'HEAD:' + NHANH], { thoiGian: 90000 }); tt.choGui = 0; tt.daGuiLuc = new Date().toISOString(); }
        catch (e) { tt.ok = false; tt.loi = 'Chưa gửi được bản sao lên GitHub (sẽ tự thử lại): ' + anMa(e.stderr || e.message, t); }
      }
    }
    const cu = thu(() => JSON.parse(fs.readFileSync(TINH, 'utf8'))) || {};
    tt.loiTu = tt.ok ? '' : (cu.loiTu || tt.luc);   // lỗi kéo dài từ lúc nào (máy chủ API dựa vào đây để báo Zalo)
    tt.daGuiLuc = tt.daGuiLuc || cu.daGuiLuc || '';
    thu(() => ghiNguyenTu(TINH, JSON.stringify(tt)));
    return tt;
  }
  return { apDung, dongBo, shaBlob, duongHopLe, HANG, XONG, TINH };
}

module.exports = { tao, shaBlob, duongHopLe };
if (require.main === module) {
  const d = tao();
  if (process.argv.includes('--ap-dung')) { const n = d.apDung(); if (n) console.log('Đã ghi ' + n + ' thay đổi của trang quản trị'); }
  else { const tt = d.dongBo(); if (!tt.ok) console.error(tt.loi); }
}
