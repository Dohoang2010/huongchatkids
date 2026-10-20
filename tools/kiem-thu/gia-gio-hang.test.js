'use strict';
/* Kiểm thử phần tính tiền chạy trên trình duyệt (js/app.js): giờ vàng, mã giảm giá, quà tặng theo đơn, quà cộng dồn,
   quy tắc mã + quà, phí ship, tìm kiếm, link sản phẩm. Chạy: node --test tools/kiem-thu/gia-gio-hang.test.js
   Dùng chương trình / mã / giờ vàng GIẢ (không phụ thuộc dữ liệu chủ shop đang cài) và đồng hồ giả. */
const test = require('node:test');
const assert = require('node:assert');
const { taoWeb } = require('./moi-truong-web');

const LOTTE = '41353214697';            // Nước ép Lotte Tăng Cao (thương hiệu lotte)
const KHAC = '26060839019';             // Váng sữa Calciumore (không phải lotte)
const NGAY = '2026-11-05';              // ngày thường, ngoài sự kiện 20/10
const gio = (hhmm) => NGAY + 'T' + hhmm + ':00+07:00';
/* Dòng giỏ hàng giống Cart.lines() */
const dong = (W, id, qty = 1, bt = 0) => { const p = W.PRODUCTS.find((x) => x.id === id); const v = p.variants && p.variants.length ? p.variants[bt] : null;
  const gia = v ? v.price : p.price; return { id, qty, variant: v ? String(bt) : '', p, name: p.name, variantLabel: v ? v.label : '', price: gia, total: gia * qty }; };
const gocGia = (id) => { const { W } = taoWeb({ gio: gio('10:00'), truocApp: (w) => { w.GIO_VANG = []; } }); return W.PRODUCTS.find((x) => x.id === id).price; };

/* ---------- Giờ vàng ---------- */
test('giờ vàng: chỉ giảm đúng khung giờ, đúng thương hiệu, làm tròn 100đ; tắt thì không giảm', () => {
  const g = (tat) => (w) => { w.GIO_VANG = [{ id: 'gv-thu', ten: 'Giờ vàng thử', giam: 5, tu: '20:00', den: '22:00', brands: ['lotte'], sanPham: [], tuNgay: '2026-11-01', denNgay: '', tat }]; w.SU_KIEN = null; };
  const goc = gocGia(LOTTE), gocKhac = gocGia(KHAC);
  const trong = taoWeb({ gio: gio('20:30'), truocApp: g(false) }).W;
  const p = trong.PRODUCTS.find((x) => x.id === LOTTE);
  assert.strictEqual(p.price, Math.round(goc * 0.95 / 100) * 100, 'giảm 5% làm tròn 100đ');
  assert.strictEqual(p.giaGoc, goc); assert.ok(p.gioVang);
  assert.strictEqual(trong.PRODUCTS.find((x) => x.id === KHAC).price, gocKhac, 'sản phẩm khác thương hiệu không giảm');
  assert.strictEqual(taoWeb({ gio: gio('19:59'), truocApp: g(false) }).W.PRODUCTS.find((x) => x.id === LOTTE).price, goc, 'trước 20:00 chưa giảm');
  assert.strictEqual(taoWeb({ gio: gio('22:00'), truocApp: g(false) }).W.PRODUCTS.find((x) => x.id === LOTTE).price, goc, '22:00 hết giờ');
  assert.strictEqual(taoWeb({ gio: gio('20:30'), truocApp: g(true) }).W.PRODUCTS.find((x) => x.id === LOTTE).price, goc, 'tắt giờ vàng');
  assert.strictEqual(taoWeb({ gio: '2026-10-30T20:30:00+07:00', truocApp: g(false) }).W.PRODUCTS.find((x) => x.id === LOTTE).price, goc, 'trước ngày bắt đầu');
});

/* ---------- Mã giảm giá ---------- */
test('mã giảm giá: %, có trần, số tiền cố định, freeship, đơn tối thiểu, hết hạn, chưa tới giờ, mã theo sản phẩm', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00'), truocApp: (w) => { w.GIO_VANG = []; w.COUPONS = {
    G10: { type: 'percent', value: 10, min: 500000, loai: 'shop' }, G10TRAN: { type: 'percent', value: 10, max: 30000, loai: 'shop' }, BOT50: { type: 'fixed', value: 50000, loai: 'shop' },
    SHIP: { type: 'ship', value: 0, loai: 'shop' }, CU: { type: 'fixed', value: 50000, hetHan: '2026-11-01T00:00', loai: 'shop' }, SAP: { type: 'fixed', value: 50000, batDau: '2026-12-01T00:00', loai: 'shop' },
    LOTTE15: { type: 'percent', value: 15, loai: 'sanpham', sanPham: [LOTTE] } }; } });
  assert.strictEqual(MC.applyCoupon('KHONGCO', 1000000).ok, false);
  assert.deepStrictEqual([MC.applyCoupon('g10', 1000000).ok, MC.applyCoupon('g10', 1000000).discount], [true, 100000], 'không phân biệt hoa thường');
  assert.strictEqual(MC.applyCoupon('G10', 400000).ok, false, 'chưa đủ đơn tối thiểu');
  assert.strictEqual(MC.applyCoupon('G10TRAN', 1000000).discount, 30000, 'giảm tối đa');
  assert.strictEqual(MC.applyCoupon('BOT50', 30000).discount, 30000, 'không giảm quá tiền hàng');
  assert.strictEqual(MC.applyCoupon('SHIP', 200000).freeship, true);
  assert.match(MC.applyCoupon('CU', 1000000).msg, /hết hạn/);
  assert.match(MC.applyCoupon('SAP', 1000000).msg, /chưa đến/);
  const ls = [dong(W, LOTTE, 2), dong(W, KHAC, 1)], tong = ls.reduce((s, l) => s + l.total, 0);
  const r = MC.applyCoupon('LOTTE15', tong, ls);
  assert.strictEqual(r.discount, Math.round(dong(W, LOTTE, 2).total * 0.15), 'mã theo sản phẩm chỉ tính trên tiền sản phẩm áp dụng');
  assert.strictEqual(MC.applyCoupon('LOTTE15', dong(W, KHAC).total, [dong(W, KHAC)]).ok, false, 'giỏ không có sản phẩm áp dụng');
});

test('mã giảm giá KHÔNG áp dụng cho combo (giá combo đã giảm sẵn); mã freeship vẫn dùng được', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00'), truocApp: (w) => { w.GIO_VANG = []; w.COUPONS = {
    G10: { type: 'percent', value: 10, loai: 'shop' }, MIN: { type: 'fixed', value: 50000, min: 300000, loai: 'shop' }, SHIP: { type: 'ship', value: 0, loai: 'shop' },
    SPCB: { type: 'percent', value: 10, loai: 'sanpham', sanPham: [] } }; } });
  const cb = W.PRODUCTS.find((p) => p.isCombo && !(p.variants || []).length) || W.PRODUCTS.find((p) => p.isCombo);
  assert.ok(cb, 'dữ liệu có combo');
  W.COUPONS.SPCB.sanPham = [cb.id, KHAC];
  const lCb = dong(W, cb.id), lKhac = dong(W, KHAC);
  const r1 = MC.applyCoupon('G10', lCb.total, [lCb]);
  assert.strictEqual(r1.ok, false, 'giỏ chỉ có combo → mã không dùng được'); assert.match(r1.msg, /combo/);
  const ls = [lCb, lKhac], tong = lCb.total + lKhac.total;
  assert.strictEqual(MC.applyCoupon('G10', tong, ls).discount, Math.round(lKhac.total * 0.1), 'chỉ giảm trên tiền sản phẩm thường');
  assert.strictEqual(MC.applyCoupon('SPCB', tong, ls).discount, Math.round(lKhac.total * 0.1), 'mã theo sản phẩm có chọn combo cũng bỏ combo');
  if (lKhac.total < 300000) assert.match(MC.applyCoupon('MIN', tong, ls).msg || '', /không tính tiền combo/, 'đơn tối thiểu không tính tiền combo');
  assert.strictEqual(MC.applyCoupon('SHIP', lCb.total, [lCb]).freeship, true, 'freeship vẫn dùng cho combo');
});

/* ---------- Quà tặng theo đơn ---------- */
const chuongTrinh = (them = {}) => Object.assign({ id: 'ct-thu', ten: 'Quà thử', batDau: '2026-11-01T00:00', ketThuc: '2026-11-30T00:00', kieu: 'tien', tenQua: 'hộp quà thử',
  bac: [{ muc: 1000000, soQua: 1 }, { muc: 2000000, soQua: 2 }], sanPhamChinh: [{ id: LOTTE, bat: true }], quaTang: [{ ten: 'hộp quà thử', bat: true }] }, them);
const voiQua = (ds, ketHop = { quaMa: false, quaShip: true }) => (w) => { w.GIO_VANG = []; w.SU_KIEN = null; w.QUA_TANG = { chuongTrinh: ds, ketHop }; };

test('quà tặng: đủ mức mới tặng, bậc cao tặng nhiều hơn, gợi ý mua thêm; ngoài ngày / tắt thì không tặng', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00'), truocApp: voiQua([chuongTrinh()]) });
  const gia = dong(W, LOTTE).price, n1 = Math.ceil(1000000 / gia), n2 = Math.ceil(2000000 / gia);
  const g0 = MC.giftFor([dong(W, LOTTE, 1)], {});
  assert.strictEqual((g0 || {}).soQua || 0, 0, 'chưa đủ 1 triệu');
  assert.match(g0.goiY, /Mua thêm/, 'có gợi ý mua thêm');
  const g1 = MC.giftFor([dong(W, LOTTE, n1)], {});
  assert.deepStrictEqual([g1.soQua, g1.chuongTrinh], [1, 'ct-thu']);
  assert.strictEqual(MC.giftFor([dong(W, LOTTE, n2)], {}).soQua, 2, 'bậc 2 triệu tặng 2');
  assert.strictEqual((MC.giftFor([dong(W, KHAC, 30)], {}) || {}).soQua || 0, 0, 'sản phẩm ngoài chương trình không tính');
  const ngoai = taoWeb({ gio: '2026-12-05T10:00:00+07:00', truocApp: voiQua([chuongTrinh()]) });
  assert.strictEqual((ngoai.MC.giftFor([dong(ngoai.W, LOTTE, n2)], {}) || {}).soQua || 0, 0, 'hết hạn chương trình');
  const tat = taoWeb({ gio: gio('10:00'), truocApp: voiQua([chuongTrinh({ tat: true })]) });
  assert.strictEqual((tat.MC.giftFor([dong(tat.W, LOTTE, n2)], {}) || {}).soQua || 0, 0, 'chương trình tắt');
});

test('quà tặng: "hoặc giảm %" tính đúng tiền giảm; quà cộng dồn ghép thêm; mã giảm giá không dùng chung quà (trừ mã freeship)', () => {
  const ct2 = chuongTrinh({ id: 'ct-cong', tenQua: 'gói sốt', congDon: true, bac: [{ muc: 1, soQua: 1 }], sanPhamChinh: [{ id: KHAC, bat: true }], quaTang: [{ ten: 'gói sốt', bat: true }] });
  const { MC, W } = taoWeb({ gio: gio('10:00'), truocApp: voiQua([chuongTrinh({ hoacGiam: 5 }), ct2]) });
  const gia = dong(W, LOTTE).price, n1 = Math.ceil(1000000 / gia), l1 = dong(W, LOTTE, n1);
  const g = MC.giftFor([l1], {});
  assert.strictEqual(g.hoacGiam, 5); assert.strictEqual(g.giamTien, Math.round(l1.total * 5 / 100));
  const gop = MC.giftFor([l1, dong(W, KHAC, 1)], {});
  assert.match(gop.moTa, /hộp quà thử/); assert.match(gop.moTa, /\+ 1 gói sốt/, 'quà cộng dồn ghi kèm: ' + gop.moTa);
  assert.strictEqual(MC.giftFor([l1], { coMa: true, maShip: false }).soQua, 0, 'dùng mã giảm tiền → không kèm quà');
  assert.strictEqual(MC.giftFor([l1], { coMa: true, maShip: true }).soQua, 1, 'mã freeship vẫn được quà');
  const cho = taoWeb({ gio: gio('10:00'), truocApp: voiQua([chuongTrinh()], { quaMa: true, quaShip: true }) });
  assert.strictEqual(cho.MC.giftFor([dong(cho.W, LOTTE, n1)], { coMa: true }).soQua, 1, 'shop cho dùng chung mã + quà');
});

/* ---------- Phí ship, tìm kiếm, link ---------- */
test('phí ship: đơn đủ mức miễn phí; giao nhanh có phí riêng', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00') });
  assert.strictEqual(MC.shipFee(W.SITE.freeshipFrom, 'standard', { tinh: 'Hà Nội', lines: [] }), 0);
  assert.strictEqual(MC.shipFee(0, 'standard', {}), 0, 'giỏ trống');
  assert.strictEqual(MC.shipFee(500000, 'express'), W.SITE.expressFee || 35000);
  const phi = MC.shipFee(300000, 'standard', { tinh: 'Hà Nội', lines: [dong(W, LOTTE)] });
  assert.ok(phi > 0, 'đơn nhỏ có phí ship: ' + phi);
});

test('tìm kiếm không dấu / sai chính tả nhẹ và link sản phẩm có từ khoá', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00') });
  const ids = (q) => MC.timSP(q, W.PRODUCTS).ds.map((p) => p.id);
  assert.ok(ids('nuoc ep lotte tang cao').includes(LOTTE), 'không dấu');
  assert.ok(ids('Nước ép Lotte').includes(LOTTE), 'có dấu');
  assert.ok(ids('lote tang cao').includes(LOTTE), 'gõ thiếu chữ');
  assert.strictEqual(ids('xyzkhongcosanphamnay').length, 0);
  assert.strictEqual(MC.spUrl(LOTTE), '/' + W.SP_SLUG[LOTTE]);
  assert.strictEqual(MC.spUrl(LOTTE, 'aff=ABC'), '/' + W.SP_SLUG[LOTTE] + '?aff=ABC');
});

/* ---------- Hết hàng ---------- */
test('hết hàng: mọi phân loại hết (hoặc tồn kho 0) mới hiện nhãn "Hết hàng" và khoá nút mua; còn 1 phân loại thì vẫn bán', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00') });
  const p = W.PRODUCTS.find((x) => x.variants && x.variants.length > 1);
  p.stock = 50; p.variants.forEach((v) => { v.oos = false; });
  assert.strictEqual(MC.hetHang(p), false);
  p.variants.forEach((v, i) => { v.oos = i > 0; });
  assert.strictEqual(MC.hetHang(p), false, 'còn 1 phân loại');
  assert.ok(!MC.productCard(p).includes('pcard--oos'));
  p.variants.forEach((v) => { v.oos = true; });
  assert.strictEqual(MC.hetHang(p), true, 'mọi phân loại đều hết');
  const the = MC.productCard(p);
  assert.ok(the.includes('pcard--oos'), 'thẻ có nhãn hết hàng'); assert.match(the, /data-buy="[^"]+" disabled/, 'khoá nút Mua ngay');
  const k = W.PRODUCTS.find((x) => !x.variants || !x.variants.length) || { stock: 0 };
  k.stock = 0; assert.strictEqual(MC.hetHang(k), true, 'tồn kho 0');
});

test('cháy hàng: không thêm được vào giỏ (cả sản phẩm hết, hoặc phân loại đang chọn hết); phân loại còn hàng vẫn thêm được', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00') });
  const p = W.PRODUCTS.find((x) => x.variants && x.variants.length > 1); p.stock = 50;
  p.variants.forEach((v, i) => { v.oos = i === 0; });
  assert.strictEqual(MC.chayHang(p, 0), true, 'phân loại 1 hết'); assert.strictEqual(MC.chayHang(p, 1), false);
  assert.strictEqual(MC.Cart.add(p.id, 1, 0), false, 'không thêm được phân loại đã hết');
  MC.Cart.add(p.id, 1, 1); assert.strictEqual(MC.Cart.items().length, 1, 'phân loại còn hàng thêm được');
  p.variants.forEach((v) => { v.oos = true; });
  assert.strictEqual(MC.Cart.add(p.id, 1, 1), false, 'cả sản phẩm cháy hàng');
  assert.strictEqual(MC.Cart.items().length, 1);
});
