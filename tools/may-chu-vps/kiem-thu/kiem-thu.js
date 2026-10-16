'use strict';
/* Kiểm thử bộ chạy VPS với mã Apps Script thật (bản mẫu công khai tools/apps-script.gs, hoặc GS=đường-dẫn).
   Chạy:  node --test tools/may-chu-vps/kiem-thu/kiem-thu.js     (không cần PostgreSQL, không gọi mạng thật) */
process.env.TZ = 'Asia/Ho_Chi_Minh';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { Kho, giaTriGhi } = require('../src/kho');
const { BoChay } = require('../src/thuc-thi');
const { datGoiChoThu } = require('../src/dich-vu');
const { dinhDangNgay } = require('../src/ngay');

const GS = process.env.GS || path.join(__dirname, '..', '..', 'apps-script.gs');
const MA = fs.readFileSync(GS, 'utf8');
const SDT = '0912345678';

function taoMay(crm) {
  const kho = new Kho(); const daGui = []; const goiMang = [];
  const traLoi = (y) => {
    goiMang.push(y.url);
    const m = y.url.match(/web-khach\?sdt=(\d+)/);
    if (m && crm && crm[m[1]]) return { ma: 200, noiDung: JSON.stringify(crm[m[1]]), dau: {} };
    if (m) return { ma: 200, noiDung: JSON.stringify({ ok: true, co: false, donHang: [] }), dau: {} };
    return { ma: 404, noiDung: 'không có', dau: {} };
  };
  const bc = new BoChay({ kho, cauHinh: { imLang: true, goiMang: async (ds) => ds.map(traLoi) }, guiDi: (h) => daGui.push(...h) });
  datGoiChoThu((ds) => ds.map(traLoi));
  bc.napMa(MA, 'apps-script.gs');
  const get = async (q) => JSON.parse((await bc.doGet(new URLSearchParams(q))).noiDung);
  return { kho, bc, get, daGui, goiMang };
}
const trang = (kho, ten) => kho.bang.getSheetByName(ten);

test('ngày giờ kiểu Utilities.formatDate', () => {
  const d = new Date(Date.UTC(2026, 9, 15, 17, 5, 9));   // 16/10/2026 00:05:09 giờ VN
  assert.strictEqual(dinhDangNgay(d, 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss'), '16/10/2026 00:05:09');
  assert.strictEqual(dinhDangNgay(d, 'Asia/Ho_Chi_Minh', 'yyMMddHHmmss'), '261016000509');
  assert.strictEqual(dinhDangNgay(d, 'Asia/Ho_Chi_Minh', 'H'), '0');
  assert.strictEqual(dinhDangNgay(d, 'GMT+7', "yyyy-MM-dd'T'HH"), '2026-10-16T00');
  assert.throws(() => dinhDangNgay(new Date(NaN), 'Asia/Ho_Chi_Minh', 'yyyy'));
});

test('ghi ô giống Google Sheets', () => {
  assert.strictEqual(giaTriGhi("'0912345678"), '0912345678');
  assert.strictEqual(giaTriGhi('0912345678'), 912345678);
  assert.strictEqual(giaTriGhi('TRUE'), true);
  assert.strictEqual(giaTriGhi('abc'), 'abc');
  assert.strictEqual(giaTriGhi('15%'), 0.15);
  assert.strictEqual(giaTriGhi('1,5', false, 'vi_VN'), 1.5);
  assert.strictEqual(giaTriGhi('1.5', false, 'en_US'), 1.5);
  const d = giaTriGhi('16/10/2026 10:30', false, 'vi_VN');
  assert.ok(d instanceof Date && d.getDate() === 16 && d.getMonth() === 9 && d.getHours() === 10);
  assert.ok(giaTriGhi('2026-10-16') instanceof Date);
  assert.strictEqual(giaTriGhi('0912345678', true), '0912345678');   // cột văn bản thuần
  assert.strictEqual(giaTriGhi(null), '');
});

test('đơn hàng → đăng nhập → điểm danh → ví điểm / voucher', async () => {
  const { kho, bc, get, daGui } = taoMay();
  const don = { type: 'checkout', code: 'HCK2610160001', customer: { name: 'Nguyễn Thị Thử', phone: SDT, address: 'Số 1, Phường Ba Đình, Hà Nội', email: 'thu@example.com' },
    items: [{ short: 'Sữa thử', qty: 2 }], subtotal: 500000, discount: 0, ship: 0, total: 500000, payment: 'cod' };
  const r = await bc.doPost(new URLSearchParams(), JSON.stringify(don));
  assert.deepStrictEqual(JSON.parse(r.noiDung), { ok: true });
  const kh = trang(kho, 'Khách hàng').getRange(2, 1, 1, 12).getValues()[0];
  assert.strictEqual(kh[0], SDT, 'số điện thoại giữ số 0 đầu');
  assert.strictEqual(kh[1], 'Nguyễn Thị Thử');
  assert.strictEqual(kh[6], 500000);
  assert.ok(daGui.some((x) => x.loai === 'mail' && x.thu.to === 'thu@example.com'), 'có email xác nhận cho khách');

  const kt = await get('action=kiemTra&sdt=' + SDT);
  assert.strictEqual(kt.coTaiKhoan, true); assert.strictEqual(kt.ten, 'Nguyễn Thị Thử');

  const dn = await get('action=dangNhap&sdt=' + SDT + '&mk=1');
  assert.strictEqual(dn.ok, true); assert.ok(dn.token);
  assert.strictEqual(dn.diemDanh.ok, true); assert.strictEqual(dn.diemDanh.diem, 1000);
  const vi = await get('action=diemCuaToi&token=' + dn.token);
  assert.strictEqual(vi.soDu, 1000);
  assert.strictEqual(vi.dungDuoc, false, 'mật khẩu mặc định chưa được dùng điểm');

  // 15 lần bấm điểm danh cùng lúc → chỉ 1 lần cộng điểm
  const ds = await Promise.all(Array.from({ length: 15 }, () => get('action=ddDiemDanh&token=' + dn.token)));
  assert.ok(ds.every((x) => x.ok));
  assert.strictEqual(ds.filter((x) => x.diem > 0).length, 0, 'đã điểm danh khi đăng nhập');
  const tq = await get('action=ddTongQuan&token=' + dn.token);
  assert.strictEqual(tq.soNgay, 1); assert.strictEqual(tq.diem.soDu, 1000);
  assert.strictEqual(trang(kho, 'Điểm danh').getLastRow(), 2);
  const vc = await get('action=vcCuaToi&token=' + dn.token);
  assert.strictEqual(vc.ok, true);
});

test('OTP → phiên mạnh → giữ điểm cùng lúc không vượt số dư', async () => {
  const { kho, get } = taoMay();
  await get('action=dangNhap&sdt=' + SDT + '&mk=1');   // chưa mua → chuaMua
  const ot = await get('action=guiOtp&sdt=' + SDT);
  assert.strictEqual(ot.ok, true);
  const ma = String(trang(kho, 'OTP').getRange(2, 2).getValue());
  assert.match(ma, /^\d{6}$/);
  const sai = await get('action=xacThuc&sdt=' + SDT + '&ma=000000');
  assert.strictEqual(sai.ok, false);
  const xt = await get('action=xacThuc&sdt=' + SDT + '&ma=' + ma);
  assert.strictEqual(xt.ok, true, JSON.stringify(xt));
  const lai = await get('action=xacThuc&sdt=' + SDT + '&ma=' + ma);
  assert.strictEqual(lai.ok, false, 'mã OTP chỉ dùng 1 lần');
  assert.strictEqual(xt.diemDanh.diem, 1000);
  // 6 đơn cùng lúc, mỗi đơn xin 400 điểm, số dư 1000 → tổng giữ ≤ 1000
  const kq = await Promise.all([1, 2, 3, 4, 5, 6].map((i) => get('action=gtGiuCho&sdt=' + SDT + '&token=' + xt.token + '&maDon=HCKTEST00' + i + '&diem=400&giaTri=10000000&tongDon=10000000')));
  const tong = kq.reduce((s, x) => s + (x.diem || 0), 0);
  assert.ok(kq.every((x) => x.ok), JSON.stringify(kq));
  assert.strictEqual(tong, 1000, 'giữ đúng bằng số dư: ' + kq.map((x) => x.diem).join(','));
  const vi = await get('action=diemCuaToi&token=' + xt.token);
  assert.strictEqual(vi.khaDung, 0); assert.strictEqual(vi.dangGiu, 1000);
});

test('gọi CRM: lần đầu thiếu dữ liệu → gọi trước rồi chạy lại, không ghi trùng', async () => {
  const crm = { '0987654321': { ok: true, co: true, kh: { ten: 'Khách CRM', tongChiTieu: 25000000, soDon: 7 }, donHang: [{ ma: 'NH1', ngay: '01/10/2026', tien: 1000000, trangThai: 'Đã giao' }] } };
  const { kho, bc, get, goiMang } = taoMay(crm);
  // chưa có CRM_KEY → không gọi CRM
  assert.strictEqual((await get('action=kiemTra&sdt=0987654321')).coTaiKhoan, false);
  kho.thuocTinh.set('CRM_KEY', 'khoa-thu'); kho.boNhoDem.clear();   // lần trước đã nhớ "CRM không có" 5 phút như Apps Script
  const truoc = bc.thongKe.chayLai;
  const kt = await get('action=kiemTra&sdt=0987654321');
  assert.strictEqual(kt.coTaiKhoan, true); assert.strictEqual(kt.ten, 'Khách CRM'); assert.strictEqual(kt.hang, 'gold');
  assert.strictEqual(bc.thongKe.chayLai - truoc, 1, 'chạy lại đúng 1 lần');
  assert.strictEqual(goiMang.filter((u) => /0987654321/.test(u)).length, 1);
  const kt2 = await get('action=kiemTra&sdt=0987654321');   // lần sau lấy bộ nhớ đệm 5 phút, không gọi lại
  assert.strictEqual(kt2.ten, 'Khách CRM');
  assert.strictEqual(goiMang.filter((u) => /0987654321/.test(u)).length, 1);
  // đăng nhập khách CRM: tạo hồ sơ trên sheet đúng 1 dòng dù chạy lại
  const dn = await get('action=dangNhap&sdt=0987654321&mk=1');
  assert.strictEqual(dn.ok, true, JSON.stringify(dn));
  assert.strictEqual(trang(kho, 'Khách hàng').getLastRow(), 2);
});

test('lỗi giữa chừng → không để dữ liệu nửa vời; quản trị không có quyền bị từ chối', async () => {
  const { get } = taoMay();
  const r = await get('action=donHang&token=sai');
  assert.strictEqual(r.ok, false);
  const r2 = await get('action=qtVcThuHoi&token=sai&ma=VCABCDEF12&lyDo=thu');
  assert.strictEqual(r2.ok, false);
});

test('JSONP: tên callback lạ bị bỏ qua', async () => {
  const { bc } = taoMay();
  const a = await bc.doGet(new URLSearchParams('action=gtCauHinh&callback=cb_1'));
  assert.ok(a.noiDung.startsWith('cb_1(')); assert.strictEqual(a.kieu, 'application/javascript');
  const b = await bc.doGet(new URLSearchParams('action=gtCauHinh&callback=alert(1)//'));
  assert.ok(b.noiDung.startsWith('{')); assert.strictEqual(b.kieu, 'application/json');
});
