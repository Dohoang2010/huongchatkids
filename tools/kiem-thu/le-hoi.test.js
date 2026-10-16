/* Kiểm thử giao diện ngày lễ (js/le-hoi.js) – chạy: node --test tools/kiem-thu/
   Mọi thời điểm là đồng hồ giả (truyền ms vào hàm), không phụ thuộc ngày chạy thật hay múi giờ máy. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../../js/le-hoi.js');

const vn = (s, gio = '00:00:00') => Date.parse(s + 'T' + gio + '+07:00');            // mốc giờ Việt Nam
const id = (ms, cfg) => (L.chon(cfg || null, ms) || {}).id || null;
const mot = (cd) => ({ bat: true, hieuUng: true, ds: [cd] });
const lay = (ma) => JSON.parse(JSON.stringify(L.MAC_DINH.ds.find((x) => x.id === ma)));
const nam = (y) => Object.fromEntries(L.lichNam(null, y).map((x) => [x.id, x]));

test('20/10: trước 4 ngày không bật, đúng 00:00 trước 3 ngày bật, hết ngày 20/10 tắt', () => {
  const cfg = mot(lay('phu-nu-viet-nam'));
  assert.equal(id(vn('2026-10-16', '23:59:59'), cfg), null);
  assert.equal(id(vn('2026-10-17', '00:00:00'), cfg), 'phu-nu-viet-nam');
  assert.equal(id(vn('2026-10-20', '12:00:00'), cfg), 'phu-nu-viet-nam');
  assert.equal(id(vn('2026-10-20', '23:59:59'), cfg), 'phu-nu-viet-nam');
  assert.equal(id(vn('2026-10-21', '00:00:00'), cfg), null);
});

test('Ranh giới ngày theo giờ VN, không theo UTC: 17/10 00:00 VN = 16/10 17:00 UTC', () => {
  const cfg = mot(lay('phu-nu-viet-nam'));
  assert.equal(id(Date.parse('2026-10-16T16:59:59Z'), cfg), null);
  assert.equal(id(Date.parse('2026-10-16T17:00:00Z'), cfg), 'phu-nu-viet-nam');
});

test('Ví dụ 8/3: bắt đầu 05/03, kết thúc hết 08/03', () => {
  const k = nam(2027)['quoc-te-phu-nu'];
  assert.deepEqual([k.bd, k.suKien, k.kt], ['2027-03-05', '2027-03-08', '2027-03-08']);
});

test('Ngày cố định tự lặp lại các năm sau', () => {
  for (const y of [2026, 2027, 2030, 2040]) {
    const n = nam(y);
    assert.equal(n['tet-duong-lich'].suKien, y + '-01-01');
    assert.equal(n['tet-duong-lich'].bd, (y - 1) + '-12-29');
    assert.equal(n['quoc-khanh'].suKien, y + '-09-02');
    assert.equal(n['giang-sinh'].bd, y + '-12-21');
    assert.equal(n['giang-sinh'].kt, y + '-12-25');
    assert.equal(n['30-4-1-5'].kt, y + '-05-01');
  }
});

test('Tết Dương lịch vắt qua năm: 30/12 vẫn chọn đúng Tết năm sau', () => {
  assert.equal(id(vn('2026-12-30', '10:00:00'), mot(lay('tet-duong-lich'))), 'tet-duong-lich');
});

test('Ngày của Mẹ (CN thứ 2 tháng 5) và Ngày của Cha (CN thứ 3 tháng 6)', () => {
  const me = { 2024: '2024-05-12', 2025: '2025-05-11', 2026: '2026-05-10', 2027: '2027-05-09', 2028: '2028-05-14' };
  const cha = { 2024: '2024-06-16', 2025: '2025-06-15', 2026: '2026-06-21', 2027: '2027-06-20', 2028: '2028-06-18' };
  for (const y of Object.keys(me)) { assert.equal(nam(+y)['ngay-cua-me'].suKien, me[y]); assert.equal(nam(+y)['ngay-cua-cha'].suKien, cha[y]); }
});

test('Black Friday = thứ Sáu sau Lễ Tạ ơn, kéo tới Cyber Monday', () => {
  const bf = { 2024: '2024-11-29', 2025: '2025-11-28', 2026: '2026-11-27', 2027: '2027-11-26', 2028: '2028-11-24', 2029: '2029-11-23' };
  for (const y of Object.keys(bf)) {
    const k = nam(+y)['black-friday'];
    assert.equal(k.suKien, bf[y]);
    assert.equal(new Date(k.suKien + 'T12:00:00Z').getUTCDay(), 5);
    assert.equal(new Date(k.kt + 'T12:00:00Z').getUTCDay(), 1);     // Cyber Monday
  }
});

test('Âm lịch Việt Nam: Tết, Giỗ Tổ, Trung Thu nhiều năm', () => {
  const tet = { 2023: '2023-01-22', 2024: '2024-02-10', 2025: '2025-01-29', 2026: '2026-02-17', 2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13' };
  const gio = { 2023: '2023-04-29', 2024: '2024-04-18', 2025: '2025-04-07', 2026: '2026-04-26', 2027: '2027-04-16' };
  const tt = { 2023: '2023-09-29', 2024: '2024-09-17', 2025: '2025-10-06', 2026: '2026-09-25', 2027: '2027-09-15' };
  for (const y of Object.keys(tet)) assert.equal(L.chuoi(L.amSangDuong(1, 1, +y, 0)), tet[y], 'Tết ' + y);
  for (const y of Object.keys(gio)) assert.equal(L.chuoi(L.amSangDuong(10, 3, +y, 0)), gio[y], 'Giỗ Tổ ' + y);
  for (const y of Object.keys(tt)) assert.equal(L.chuoi(L.amSangDuong(15, 8, +y, 0)), tt[y], 'Trung Thu ' + y);
});

test('Lịch Việt Nam khác lịch Trung Quốc (múi giờ +7): Tết 1985, 2007, 2030', () => {
  assert.equal(L.chuoi(L.amSangDuong(1, 1, 1985, 0)), '1985-01-21');   // Trung Quốc: 20/02/1985
  assert.equal(L.chuoi(L.amSangDuong(1, 1, 2007, 0)), '2007-02-17');   // Trung Quốc: 18/02/2007
  assert.equal(L.chuoi(L.amSangDuong(1, 1, 2030, 0)), '2030-02-02');   // Trung Quốc: 03/02/2030
});

test('Năm có tháng nhuận: 2023 (nhuận 2), 2025 (nhuận 6), 2028 (nhuận 5)', () => {
  assert.equal(L.thangNhuan(2023), 2); assert.equal(L.thangNhuan(2025), 6); assert.equal(L.thangNhuan(2028), 5); assert.equal(L.thangNhuan(2026), 0);
  // Giỗ Tổ 2023 rơi sau tháng 2 nhuận → 29/04 (không phải 31/03)
  assert.equal(L.chuoi(L.amSangDuong(10, 3, 2023, 0)), '2023-04-29');
  // Tháng 6 nhuận 2025: 1/6 nhuận = 25/07/2025, sau 1/6 thường = 25/06/2025
  assert.equal(L.chuoi(L.amSangDuong(1, 6, 2025, 1)), '2025-07-25');
  assert.equal(L.chuoi(L.amSangDuong(1, 6, 2025, 0)), '2025-06-25');
  assert.equal(L.amSangDuong(1, 7, 2025, 1), null);                     // 2025 không có tháng 7 nhuận
  // chiều ngược lại
  assert.deepEqual(L.duongSangAm({ y: 2025, m: 7, d: 25 }), { d: 1, m: 6, y: 2025, nhuan: 1 });
  assert.deepEqual(L.duongSangAm({ y: 2026, m: 2, d: 17 }), { d: 1, m: 1, y: 2026, nhuan: 0 });
});

test('Tết Nguyên Đán: bật trước mùng 1 ba ngày, tắt hết mùng 3', () => {
  const k = nam(2027)['tet-nguyen-dan'];
  assert.deepEqual([k.bd, k.suKien, k.kt], ['2027-02-03', '2027-02-06', '2027-02-08']);
  const cfg = mot(lay('tet-nguyen-dan'));
  assert.equal(id(vn('2027-02-02', '23:59:59'), cfg), null);
  assert.equal(id(vn('2027-02-03'), cfg), 'tet-nguyen-dan');
  assert.equal(id(vn('2027-02-08', '23:00:00'), cfg), 'tet-nguyen-dan');
  assert.equal(id(vn('2027-02-09'), cfg), null);
});

test('Ngày âm lệch bảng đối chiếu → không bật, báo lỗi', () => {
  const r = L.ngaySuKien({ loai: 'am', thang: 1, ngay: 2 }, 2026);      // mùng 2 không có trong bảng → vẫn tính
  assert.equal(L.chuoi(r.n), '2026-02-18');
  const cfg = { bat: true, chiDungNgayDoiChieu: true, ds: [lay('tet-nguyen-dan')] };
  assert.ok(L.lichNam(cfg, 2040)[0].loi, 'năm ngoài bảng + chỉ dùng ngày đối chiếu → không bật');
  assert.equal(L.lichNam(cfg, 2027)[0].loi, '');
});

test('Back to School kéo dài tới 10/09, Quốc khánh trùng thì ưu tiên cao hơn thắng', () => {
  const k = nam(2026)['tuu-truong'];
  assert.deepEqual([k.bd, k.kt], ['2026-07-29', '2026-09-10']);
  assert.equal(id(vn('2026-08-15', '09:00:00')), 'tuu-truong');
  assert.equal(id(vn('2026-09-01', '09:00:00')), 'quoc-khanh');          // 30/8 → 2/9 Quốc khánh (ưu tiên 50 > 5)
  assert.equal(id(vn('2026-09-05', '09:00:00')), 'tuu-truong');
  assert.equal(id(vn('2026-09-11', '09:00:00')), null);
});

test('Trùng nhau cùng ưu tiên → chiến dịch đứng trước trong danh sách', () => {
  const a = { ...lay('phu-nu-viet-nam'), id: 'a', uuTien: 5 }, b = { ...lay('phu-nu-viet-nam'), id: 'b', uuTien: 5 };
  assert.equal(id(vn('2026-10-20'), { bat: true, ds: [a, b] }), 'a');
  assert.equal(id(vn('2026-10-20'), { bat: true, ds: [a, { ...b, uuTien: 9 }] }), 'b');
});

test('Quản trị tắt từng chiến dịch / tắt cả hệ thống', () => {
  const cd = lay('phu-nu-viet-nam');
  assert.equal(id(vn('2026-10-20'), mot({ ...cd, bat: false })), null);
  assert.equal(id(vn('2026-10-20'), { bat: false, ds: [cd] }), null);
});

test('Quản trị sửa ngày (truoc, soNgay) và nhập tay riêng một năm', () => {
  const cd = { ...lay('phu-nu-viet-nam'), truoc: 0, soNgay: 2 };
  assert.equal(id(vn('2026-10-19', '23:00:00'), mot(cd)), null);
  assert.equal(id(vn('2026-10-21', '10:00:00'), mot(cd)), 'phu-nu-viet-nam');
  const tay = { ...lay('trung-thu'), ghiDe: { 2026: { bd: '2026-09-20', kt: '2026-09-27' } } };
  assert.equal(id(vn('2026-09-27', '20:00:00'), mot(tay)), 'trung-thu');
  assert.equal(id(vn('2026-09-28'), mot(tay)), null);
  assert.equal(id(vn('2027-09-12'), mot(tay)), 'trung-thu');               // năm khác vẫn tự tính
});

test('Cấu hình hỏng / thiếu → dùng mặc định, không lỗi', () => {
  assert.equal(id(vn('2026-10-20')), 'phu-nu-viet-nam');
  assert.equal(id(vn('2026-10-20'), 'rác'), 'phu-nu-viet-nam');
  assert.equal(id(vn('2026-10-20'), { ds: [{ id: 'x' }, null, { id: 'y', lich: { loai: 'duong', ngay: '13-45' } }] }), null);
  assert.doesNotThrow(() => L.lichNam({ ds: [{ id: 'z', lich: { loai: 'quytac', ma: 'khong-co' } }] }, 2026));
});

test('Mốc kế tiếp để tự đổi giao diện không cần tải lại', () => {
  assert.equal(L.mocKeTiep(mot(lay('phu-nu-viet-nam')), vn('2026-10-16', '15:00:00')), vn('2026-10-17'));
  assert.equal(L.mocKeTiep(mot(lay('phu-nu-viet-nam')), vn('2026-10-18')), vn('2026-10-21'));
});

test('Lịch 19 chiến dịch mặc định đều tính được cho 2026–2035', () => {
  assert.equal(L.MAC_DINH.ds.length, 19);
  for (let y = 2026; y <= 2035; y++) L.lichNam(null, y).forEach((x) => assert.ok(x.bd && x.kt && !x.loi, x.id + ' ' + y + ' ' + x.loi));
});
