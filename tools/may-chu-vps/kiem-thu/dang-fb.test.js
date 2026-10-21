'use strict';
/* Kiểm thử LỊCH ĐĂNG FACEBOOK (src/dang-fb.js): chỉ bài đã duyệt mới đăng, đúng giờ, kèm ảnh + bình luận + link theo dõi;
   mã page hết hạn → dừng đăng, báo "cần đăng nhập lại", kết nối lại thì đăng tiếp. Facebook được giả lập, đồng hồ giả, không gọi mạng thật. */
process.env.TZ = 'Asia/Ho_Chi_Minh';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Kho } = require('../src/kho');
const { BoChay } = require('../src/thuc-thi');
const { taoDangFb, ganTheoDoi } = require('../src/dang-fb');

const MA = fs.readFileSync(process.env.GS || path.join(__dirname, '..', '..', 'apps-script.gs'), 'utf8');
const KHOA = 'khoa-quan-tri-thu-nghiem-0123456789';
let sharp = null; try { sharp = require('sharp'); } catch { /* máy không có sharp */ }
const anhThu = async () => (sharp ? (await sharp({ create: { width: 40, height: 30, channels: 3, background: '#F0537A' } }).jpeg().toBuffer()) : Buffer.alloc(400, 7)).toString('base64');

function taoMay() {
  const kho = new Kho();
  const bc = new BoChay({ kho, cauHinh: { imLang: true, goiMang: async (ds) => ds.map(() => ({ ma: 404, noiDung: '', dau: {} })) }, guiDi: () => {} });
  bc.napMa(MA, 'apps-script.gs'); kho.thuocTinh.set('ADMIN_KEY', KHOA);
  process.env.FB_PAGE_ID = '111'; process.env.FB_PAGE_TOKEN = 'ma-page-gia';
  const fb = { goi: [], hetHan: false, so: 0 };
  const fetchFn = async (url, o = {}) => {
    const u = String(url), tra = (d, ma = 200) => ({ ok: ma < 300, status: ma, json: async () => d });
    const phan = {}; if (o.body && o.body.forEach) o.body.forEach((v, k) => { phan[k] = typeof v === 'string' ? v : '[tệp]'; });
    fb.goi.push({ url: u.replace(/access_token=[^&]+/, 'access_token=***'), phan });
    if (fb.hetHan) return tra({ error: { message: 'Error validating access token: Session has expired', type: 'OAuthException', code: 190 } }, 400);
    if (/\/111\?fields=id,name/.test(u)) return tra({ id: '111', name: 'Hương Chất Kids' });
    if (/\/111\/photos$/.test(u)) return tra({ id: 'anh' + (++fb.so) });
    if (/\/111\/feed$/.test(u)) return tra({ id: '111_999' });
    if (/\/111_999\/comments$/.test(u)) return tra({ id: 'bl' + (++fb.so) });
    if (/\/111_999\?fields=permalink_url/.test(u)) return tra({ permalink_url: 'https://www.facebook.com/111/posts/999' });
    return tra({ error: { message: 'không biết ' + u, code: 1 } }, 400);
  };
  const dong = { t: Date.parse('2026-11-02T09:00:00+07:00') };
  const thuMuc = fs.mkdtempSync(path.join(os.tmpdir(), 'hck-fb-'));
  const daGhi = [];
  const df = taoDangFb({ bc, ghi: (s) => daGhi.push(s), docThan: async (req) => req.than, thuMuc, fetchFn, bayGio: () => dong.t });
  const goi = async (o) => { let kq; await df.xuLy({ than: JSON.stringify(o) }, {}, {}, (r, ma, d) => { kq = d; }); return kq; };
  const nv = async (vaiTro, tk) => { await bc.goiHam('qtQuyenGh_', ['x', '', []]); const t = 'tok' + tk; kho.bang.getSheetByName('Phiên QT').appendRow([t, tk, vaiTro, new Date(Date.now() + 3600e3), new Date(), '']); return t; };
  return { df, goi, nv, fb, dong, daGhi };
}

test('link theo dõi: link web trong bài được gắn ?nguon=facebook&cd=…, chữ "huongchatkids.vn" trơn giữ nguyên', () => {
  const s = ganTheoDoi('Vào huongchatkids.vn/account.html nhé\n🌐 huongchatkids.vn\nhttps://huongchatkids.vn/collections.html?cat=sua', 'bai-08');
  assert.match(s, /https:\/\/huongchatkids\.vn\/account\.html\?nguon=facebook&cd=bai-08/);
  assert.match(s, /🌐 huongchatkids\.vn\n/);
  assert.match(s, /collections\.html\?cat=sua&nguon=facebook&cd=bai-08/);
});

test('lịch đăng: nhân viên nội dung soạn bài (chờ duyệt, không tự đăng) – chỉ chủ shop duyệt – tới giờ máy chủ đăng kèm ảnh, bình luận, link theo dõi', async () => {
  const m = taoMay(), t = await m.nv('CONTENT_STAFF', 'nv-nd');
  const anh = await anhThu();
  const luu = await m.goi({ viec: 'luu', token: t, bai: { noiDung: '🎁 Tạo tài khoản tặng 50.000 điểm\n👉 huongchatkids.vn/account.html', luc: '2026-11-02T11:30:00+07:00', cd: 'bai-08',
    anhMoi: [anh, anh], binhLuan: [{ noiDung: 'Link: https://huongchatkids.vn/account.html' }, { noiDung: 'Ví dụ minh hoạ', anhMoi: anh }] } });
  assert.strictEqual(luu.ok, true, JSON.stringify(luu)); assert.strictEqual(luu.bai.trangThai, 'nhap'); assert.strictEqual(luu.bai.anh.length, 2);
  const id = luu.bai.id;
  m.dong.t = Date.parse('2026-11-02T12:00:00+07:00'); await m.df.nhip();
  assert.strictEqual(m.fb.goi.filter((x) => /\/feed$/.test(x.url)).length, 0, 'chưa duyệt thì không đăng');
  assert.strictEqual((await m.goi({ viec: 'duyet', token: t, id })).ok, false, 'nhân viên không duyệt được');
  m.dong.t = Date.parse('2026-11-02T09:00:00+07:00');
  const d = await m.goi({ viec: 'duyet', key: KHOA, id }); assert.strictEqual(d.ok, true, JSON.stringify(d)); assert.strictEqual(d.bai.trangThai, 'duyet');
  await m.df.nhip(); assert.strictEqual(m.fb.goi.length, 0, 'chưa tới giờ');
  m.dong.t = Date.parse('2026-11-02T11:31:00+07:00'); await m.df.nhip();
  const feed = m.fb.goi.find((x) => /\/feed$/.test(x.url));
  assert.ok(feed, 'đã đăng'); assert.match(feed.phan.message, /account\.html\?nguon=facebook&cd=bai-08/);
  assert.ok(feed.phan['attached_media[0]'] && feed.phan['attached_media[1]'], 'kèm 2 ảnh');
  assert.strictEqual(m.fb.goi.filter((x) => /\/photos$/.test(x.url)).every((x) => x.phan.published === 'false'), true, 'ảnh tải lên dạng chưa công khai rồi gắn vào bài');
  const bl = m.fb.goi.filter((x) => /\/comments$/.test(x.url)); assert.strictEqual(bl.length, 2); assert.match(bl[0].phan.message, /nguon=facebook/); assert.strictEqual(bl[1].phan.source, '[tệp]');
  const ds = await m.goi({ viec: 'ds', token: t }); const b = ds.ds.find((x) => x.id === id);
  assert.strictEqual(b.trangThai, 'da-dang'); assert.strictEqual(b.ketQua.link, 'https://www.facebook.com/111/posts/999');
  const truoc = m.fb.goi.length; await m.df.nhip(); assert.strictEqual(m.fb.goi.length, truoc, 'không đăng lại lần 2');
  assert.strictEqual((await m.goi({ viec: 'luu', token: t, bai: { id, noiDung: 'sửa', luc: '2026-11-03T10:00:00+07:00' } })).ok, false, 'bài đã đăng không sửa được');
});

test('lịch đăng: mã page hết hạn → dừng đăng, báo cần đăng nhập lại (không báo Zalo), kết nối lại thì đăng tiếp; quá 12 tiếng thì không đăng bù', async () => {
  const m = taoMay();
  const a = (await m.goi({ viec: 'luu', key: KHOA, bai: { noiDung: 'Bài A', luc: '2026-11-02T10:00:00+07:00' } })).bai;
  await m.goi({ viec: 'duyet', key: KHOA, id: a.id });
  m.fb.hetHan = true; m.dong.t = Date.parse('2026-11-02T10:01:00+07:00'); await m.df.nhip();
  let tt = await m.goi({ viec: 'trangThai', key: KHOA }); assert.strictEqual(tt.canDangNhap, true, JSON.stringify(tt));
  let b = (await m.goi({ viec: 'ds', key: KHOA })).ds[0]; assert.strictEqual(b.trangThai, 'duyet', 'bài giữ nguyên, chờ kết nối lại');
  const truoc = m.fb.goi.length; await m.df.nhip(); assert.strictEqual(m.fb.goi.length, truoc, 'đang cần đăng nhập lại thì không gọi Facebook nữa');
  assert.ok(m.daGhi.some((s) => /cần đăng nhập lại/.test(s)), 'ghi nhật ký máy chủ');
  m.fb.hetHan = false; tt = await m.goi({ viec: 'kiemTra', key: KHOA }); assert.strictEqual(tt.canDangNhap, false); assert.strictEqual(tt.trang.ten, 'Hương Chất Kids');
  await m.df.nhip(); b = (await m.goi({ viec: 'ds', key: KHOA })).ds[0]; assert.strictEqual(b.trangThai, 'da-dang');
  const c = (await m.goi({ viec: 'luu', key: KHOA, bai: { noiDung: 'Bài C', luc: '2026-11-02T11:00:00+07:00' } })).bai;
  await m.goi({ viec: 'duyet', key: KHOA, id: c.id });
  m.dong.t = Date.parse('2026-11-03T08:00:00+07:00'); await m.df.nhip();
  b = (await m.goi({ viec: 'ds', key: KHOA })).ds.find((x) => x.id === c.id); assert.strictEqual(b.trangThai, 'loi'); assert.match(b.loi, /12 tiếng/);
});

test('lịch đăng: nhân viên đơn hàng không vào được; duyệt bài có giờ đã qua bị chặn (dùng Đăng ngay)', async () => {
  const m = taoMay(), t = await m.nv('ORDER_STAFF', 'nv-don');
  assert.strictEqual((await m.goi({ viec: 'ds', token: t })).ok, false);
  const a = (await m.goi({ viec: 'luu', key: KHOA, bai: { noiDung: 'Bài cũ', luc: '2026-11-01T10:00:00+07:00' } })).bai;
  assert.strictEqual((await m.goi({ viec: 'duyet', key: KHOA, id: a.id })).ok, false);
  const dn = await m.goi({ viec: 'dangNgay', key: KHOA, id: a.id }); assert.strictEqual(dn.ok, true, JSON.stringify(dn));
  await new Promise((x) => setTimeout(x, 120));
  assert.strictEqual((await m.goi({ viec: 'ds', key: KHOA })).ds[0].trangThai, 'da-dang');
});
