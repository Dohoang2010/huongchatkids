'use strict';
/* Nhập bài Claude soạn sẵn vào LỊCH ĐĂNG FACEBOOK (chạy trên VPS bằng root):
     node /opt/hck-api/cong-cu/nhap-bai-fb.js <thư mục> [--nhap]
   <thư mục> có nhap.json = [{ tieuDe, luc (ISO, giờ VN có +07:00), cd (mã theo dõi), noiDung, anh: [tệp ảnh], binhLuan: [{ noiDung, anh? }] }] + các tệp ảnh.
   Mặc định bài vào trạng thái ĐÃ DUYỆT (chủ shop cho Claude tự đăng, không cần duyệt – 21/10/2026); --nhap = để Chờ duyệt.
   Bài trùng mã theo dõi (cd) với bài đã có thì bỏ qua. Giờ đăng đã qua → để Chờ duyệt (không tự đăng bù).
   Gửi thư mục lên VPS: tar -cf - <thư mục> | ssh … 'tar -xf - -C /root && node /opt/hck-api/cong-cu/nhap-bai-fb.js /root/<thư mục>' */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require(path.join(__dirname, '..', 'node_modules', 'sharp'));
const VAO = process.argv[2], DE_NHAP = process.argv.includes('--nhap');
const TM = '/var/lib/hck-api/fb', LICH = path.join(TM, 'lich.json');
if (!VAO) { console.error('Thiếu thư mục bài'); process.exit(1); }
(async () => {
  const nhap = JSON.parse(fs.readFileSync(path.join(VAO, 'nhap.json'), 'utf8'));
  const ds = fs.existsSync(LICH) ? JSON.parse(fs.readFileSync(LICH, 'utf8')) : [];
  let them = 0;
  for (const b of nhap) {
    if (!b.cd || ds.some((x) => x.cd === b.cd)) { console.log('bỏ qua (thiếu / trùng mã):', b.cd); continue; }
    if (!Date.parse(b.luc)) { console.log('bỏ qua (giờ đăng sai):', b.cd); continue; }
    const id = Date.now().toString(36) + crypto.randomBytes(3).toString('hex'), dir = path.join(TM, 'anh', id);
    fs.mkdirSync(dir, { recursive: true });
    const lam = async (tep, tien) => {
      const ten = tien + Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
      await sharp(path.join(VAO, tep)).rotate().resize({ width: 2048, height: 2048, fit: 'inside', withoutEnlargement: true }).flatten({ background: '#fff' }).jpeg({ quality: 90, mozjpeg: true }).toFile(path.join(dir, ten + '.jpg'));
      await sharp(path.join(VAO, tep)).rotate().resize({ width: 240, height: 240, fit: 'inside' }).flatten({ background: '#fff' }).jpeg({ quality: 72 }).toFile(path.join(dir, ten + '-nho.jpg'));
      return ten + '.jpg';
    };
    const anh = []; for (const a of (b.anh || []).slice(0, 10)) anh.push(await lam(a, 'a'));
    const binhLuan = []; for (const x of (b.binhLuan || []).slice(0, 5)) binhLuan.push({ noiDung: String(x.noiDung || ''), anh: x.anh ? await lam(x.anh, 'b') : '' });
    const nay = new Date().toISOString(), tuDang = !DE_NHAP && Date.parse(b.luc) > Date.now();
    ds.push({ id, noiDung: String(b.noiDung || ''), anh, binhLuan, luc: new Date(b.luc).toISOString(), cd: String(b.cd).replace(/[^\w-]/g, '').slice(0, 40), tieuDe: String(b.tieuDe || '').slice(0, 120),
      trangThai: tuDang ? 'duyet' : 'nhap', loi: '', tao: nay, taoBoi: 'Claude (soạn sẵn)', suaBoi: 'Claude (soạn sẵn)', sua: nay, ...(tuDang ? { duyetBoi: 'Claude (chủ shop cho tự đăng)' } : {}) });
    them++; console.log((tuDang ? 'lên lịch tự đăng: ' : 'chờ duyệt: ') + b.cd + ' · ' + b.luc);
  }
  const t = LICH + '.tam'; fs.writeFileSync(t, JSON.stringify(ds, null, 1)); fs.renameSync(t, LICH);
  try { require('node:child_process').execFileSync('chown', ['-R', 'hckapi:hckapi', TM]); } catch { /* không phải root */ }
  console.log('Đã thêm', them, 'bài');
})();
