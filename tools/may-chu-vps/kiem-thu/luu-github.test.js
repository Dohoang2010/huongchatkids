'use strict';
/* Kiểm thử "trang quản trị lưu qua máy chủ" (src/luu-github.js): kiểm quyền theo khối dữ liệu, chặn sửa mã web, chặn tệp lạ.
   GitHub được giả lập (không gọi mạng thật, không đụng repo thật). */
process.env.TZ = 'Asia/Ho_Chi_Minh';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { Kho } = require('../src/kho');
const { BoChay } = require('../src/thuc-thi');
const { taoLuuGithub } = require('../src/luu-github');

const MA = fs.readFileSync(process.env.GS || path.join(__dirname, '..', '..', 'apps-script.gs'), 'utf8');
const KHOA = 'khoa-quan-tri-thu-nghiem-0123456789';
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const DATA = "/* đầu tệp */\nwindow.SITE = { name: 'HCK' };\n/* ===ADMIN:PRODUCTS=== (x) */\nwindow.PRODUCTS = [{\"id\":\"a\",\"price\":1}];\n/* ===/ADMIN:PRODUCTS=== */\n/* ===ADMIN:CAUHINH=== (x) */\nwindow.CAUHINH = {};\n/* ===/ADMIN:CAUHINH=== */\nwindow.X = 1;\n";

function taoMay() {
  const kho = new Kho();
  const bc = new BoChay({ kho, cauHinh: { imLang: true, goiMang: async (ds) => ds.map(() => ({ ma: 404, noiDung: '', dau: {} })) }, guiDi: () => {} });
  bc.napMa(MA, 'apps-script.gs'); kho.thuocTinh.set('ADMIN_KEY', KHOA);
  /* GitHub giả: 1 tệp js/data.js + ghi lại các lần PUT */
  const tep = { 'js/data.js': { content: b64(DATA), sha: 'sha1' } }, put = [];
  global.fetch = async (url, o = {}) => {
    const m = String(url).match(/\/contents\/([^?]+)/), duong = m && decodeURIComponent(m[1]);
    const tra = (ma, d) => ({ ok: ma < 300, status: ma, json: async () => d });
    if (o.method === 'PUT') { const b = JSON.parse(o.body); put.push({ duong, ...b }); tep[duong] = { content: b.content, sha: 'sha' + (put.length + 1) }; return tra(200, { content: { sha: tep[duong].sha, path: duong }, commit: { sha: 'c' + put.length } }); }
    if (/\/commits/.test(url)) return tra(200, [{ sha: 'c1' }]);
    return tep[duong] ? tra(200, tep[duong]) : tra(404, { message: 'Not Found' });
  };
  process.env.GITHUB_TOKEN = 'gia';
  const lg = taoLuuGithub({ bc, ghi: () => {}, docThan: async (req) => req.than });
  const goi = async (o) => { let kq; const res = {}; await lg.xuLy({ than: JSON.stringify(o) }, res, {}, (r, ma, d) => { kq = d; }); return kq; };
  /* phiên nhân viên: vai trò PRODUCT_STAFF (sửa sản phẩm, không sửa cấu hình) */
  const nv = async (vaiTro, tk) => { await bc.goiHam('qtQuyenGh_', ['x', '', []]); const t = 'tok' + tk; kho.bang.getSheetByName('Phiên QT').appendRow([t, tk, vaiTro, new Date(Date.now() + 3600e3), new Date(), '']); return t; };
  return { goi, put, nv };
}
const suaKhoi = (src, k, moi) => src.replace(new RegExp('window\\.' + k + ' = [^\\n]*;'), 'window.' + k + ' = ' + moi + ';');

test('lưu qua máy chủ: chưa đăng nhập bị từ chối; chủ shop (khoá) sửa được mọi khối; trangThai báo có mã', async () => {
  const m = taoMay();
  assert.strictEqual((await m.goi({ viec: 'trangThai', token: 'sai' })).loi, 'token');
  const tt = await m.goi({ viec: 'trangThai', key: KHOA }); assert.strictEqual(tt.coToken, true);
  const r = await m.goi({ viec: 'ghi', key: KHOA, duong: 'js/data.js', sha: 'sha1', noiDung: b64(suaKhoi(DATA, 'CAUHINH', '{"a":1}')), thongDiep: 'Quản trị: cập nhật cấu hình' });
  assert.strictEqual(r.ok, true, JSON.stringify(r)); assert.strictEqual(m.put.length, 1); assert.match(m.put[0].message, /^Quản trị \(chủ shop/);
});

test('lưu qua máy chủ: nhân viên sản phẩm sửa được sản phẩm, KHÔNG sửa được cấu hình / mã web / tệp lạ', async () => {
  const m = taoMay(), t = await m.nv('PRODUCT_STAFF', 'nv-sp');
  const sp = await m.goi({ viec: 'ghi', token: t, duong: 'js/data.js', sha: 'sha1', noiDung: b64(suaKhoi(DATA, 'PRODUCTS', '[{"id":"a","price":2}]')) });
  assert.strictEqual(sp.ok, true, JSON.stringify(sp)); assert.match(m.put[0].message, /\(nv-sp\).*sản phẩm/);
  const ch = await m.goi({ viec: 'ghi', token: t, duong: 'js/data.js', noiDung: b64(suaKhoi(DATA, 'CAUHINH', '{"a":1}')) });
  assert.strictEqual(ch.ok, false); assert.strictEqual(ch.loi, 'quyen');
  const ma = await m.goi({ viec: 'ghi', token: t, duong: 'js/data.js', noiDung: b64(DATA.replace('window.X = 1;', 'window.X = 2; fetch("//la.com");')) });
  assert.strictEqual(ma.ok, false, 'sửa ngoài khối ADMIN = sửa mã web → chỉ chủ shop');
  assert.strictEqual((await m.goi({ viec: 'ghi', token: t, duong: 'js/app.js', noiDung: b64('x') })).ok, false, 'tệp lạ');
  assert.strictEqual((await m.goi({ viec: 'ghi', token: t, duong: '../etc/x', noiDung: b64('x') })).ok, false, 'đường dẫn lạ');
  assert.strictEqual((await m.goi({ viec: 'ghi', token: t, duong: 'js/data.js', noiDung: b64(suaKhoi(DATA, 'PRODUCTS', '[{')) })).ok, false, 'lỗi cú pháp không lưu');
  assert.strictEqual((await m.goi({ viec: 'ghi', token: t, duong: 'img/sp-moi.jpg', noiDung: b64('anh') })).ok, true, 'tải ảnh');
  assert.strictEqual(m.put.length, 2);
});

test('lưu qua máy chủ: nhân viên đơn hàng không sửa được sản phẩm, không tải ảnh; sửa trùng (sha cũ) bị chặn', async () => {
  const m = taoMay(), t = await m.nv('ORDER_STAFF', 'nv-don');
  assert.strictEqual((await m.goi({ viec: 'ghi', token: t, duong: 'js/data.js', noiDung: b64(suaKhoi(DATA, 'PRODUCTS', '[]')) })).ok, false);
  assert.strictEqual((await m.goi({ viec: 'ghi', token: t, duong: 'img/x.jpg', noiDung: b64('a') })).ok, false);
  const cu = await m.goi({ viec: 'ghi', key: KHOA, duong: 'js/data.js', sha: 'sha-cu', noiDung: b64(suaKhoi(DATA, 'PRODUCTS', '[]')) });
  assert.strictEqual(cu.ok, false); assert.match(cu.msg, /sửa ở nơi khác/);
  assert.strictEqual(m.put.length, 0);
});
