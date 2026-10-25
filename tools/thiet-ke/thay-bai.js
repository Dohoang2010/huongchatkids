'use strict';
/* Thay bài CHƯA ĐĂNG trong lịch Facebook bằng bản mới (ảnh mới), chạy trên VPS bằng root:
     node thay-bai.js <thư mục lô> [...]
   Chỉ thay bài trạng thái 'duyet' có giờ đăng còn > 5 phút; bài đã đăng / sắp đăng giữ nguyên.
   Xử lý ảnh trước, đọc lại lich.json ngay trước khi ghi để không đè cập nhật của bộ đăng bài. */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const sharp = require('/opt/hck-api/node_modules/sharp');
const TM = '/var/lib/hck-api/fb', LICH = path.join(TM, 'lich.json'), DU = 5 * 60e3;
(async () => {
  const cu0 = JSON.parse(fs.readFileSync(LICH, 'utf8')), byCd = Object.fromEntries(cu0.map((b) => [b.cd, b]));
  const moi = [];
  for (const VAO of process.argv.slice(2)) for (const b of JSON.parse(fs.readFileSync(path.join(VAO, 'nhap.json'), 'utf8'))) {
    const c = byCd[b.cd];
    if (Date.parse(b.luc) <= Date.now() + DU || (c && c.trangThai !== 'duyet')) continue;
    const id = Date.now().toString(36) + crypto.randomBytes(3).toString('hex'), dir = path.join(TM, 'anh', id);
    fs.mkdirSync(dir, { recursive: true });
    const lam = async (tep, tien) => {
      const ten = tien + Date.now().toString(36) + crypto.randomBytes(3).toString('hex'), src = path.join(VAO, tep);
      await sharp(src).rotate().resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#fff' }).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(dir, ten + '.jpg'));
      await sharp(src).rotate().resize({ width: 240, height: 240, fit: 'inside' }).flatten({ background: '#fff' }).jpeg({ quality: 72 }).toFile(path.join(dir, ten + '-nho.jpg'));
      return ten + '.jpg';
    };
    const anh = []; for (const a of (b.anh || []).slice(0, 10)) anh.push(await lam(a, 'a'));
    const binhLuan = []; for (const x of (b.binhLuan || []).slice(0, 5)) binhLuan.push({ noiDung: String(x.noiDung || ''), anh: x.anh ? await lam(x.anh, 'b') : '' });
    const nay = new Date().toISOString();
    moi.push({ id, noiDung: String(b.noiDung || ''), anh, binhLuan, luc: new Date(b.luc).toISOString(), cd: String(b.cd), tieuDe: String(b.tieuDe || '').slice(0, 120),
      trangThai: 'duyet', loi: '', tao: (c && c.tao) || nay, taoBoi: 'Claude (soạn sẵn)', suaBoi: 'Claude (đổi ảnh)', sua: nay, duyetBoi: 'Claude (chủ shop cho tự đăng)' });
  }
  // đọc lại ngay trước khi ghi
  const ds = JSON.parse(fs.readFileSync(LICH, 'utf8')); let thay = 0, them = 0; const xoaAnh = [];
  for (const m of moi) {
    const i = ds.findIndex((x) => x.cd === m.cd);
    if (i >= 0) { if (ds[i].trangThai !== 'duyet' || Date.parse(ds[i].luc) <= Date.now() + 60e3) { xoaAnh.push(m.id); continue; } xoaAnh.push(ds[i].id); ds[i] = m; thay++; }
    else { ds.push(m); them++; }
  }
  const t = LICH + '.tam'; fs.writeFileSync(t, JSON.stringify(ds, null, 1)); fs.renameSync(t, LICH);
  for (const id of xoaAnh) fs.rmSync(path.join(TM, 'anh', id), { recursive: true, force: true });
  try { require('node:child_process').execFileSync('chown', ['-R', 'hckapi:hckapi', TM]); } catch { /* */ }
  console.log('Thay', thay, 'bài, thêm', them, 'bài');
})();
