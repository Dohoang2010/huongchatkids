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
  assert.strictEqual(MC.giftFor([l1], { coMa: true, maShip: false }).soQua, 0, 'áp mã giảm tiền → đơn không kèm quà (khách chọn quà hoặc mã)');
  assert.strictEqual(MC.giftFor([l1], { coMa: true, maShip: true }).soQua, 1, 'mã freeship vẫn được quà');
  const cho = taoWeb({ gio: gio('10:00'), truocApp: voiQua([chuongTrinh()], { quaMa: true, quaShip: true }) });
  assert.strictEqual(cho.MC.giftFor([dong(cho.W, LOTTE, n1)], { coMa: true }).soQua, 1, 'shop cho dùng chung mã + quà');
});

test('sản phẩm đang có quà: giữ quà thì không cộng hạng / sinh nhật; áp mã / voucher thì bỏ quà và mã giảm như thường; combo / phân loại giảm sẵn không nhận mã, voucher', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00'), truocApp: (w) => { voiQua([chuongTrinh()])(w); w.COUPONS = { G10: { type: 'percent', value: 10, loai: 'shop' } }; } });
  const gia = dong(W, LOTTE).price, n1 = Math.ceil(1000000 / gia);
  const lQua = dong(W, LOTTE, n1), lKhac = dong(W, KHAC, 1), ls = [lQua, lKhac], tong = lQua.total + lKhac.total;
  const kh = MC.hangKhongUuDai(ls);
  assert.ok(kh.co(lQua) && !kh.co(lKhac)); assert.strictEqual(kh.tien, lQua.total);
  assert.strictEqual(MC.hangKhongUuDai([dong(W, LOTTE, 1)]).tien, 0, 'chưa đủ mốc quà thì vẫn được ưu đãi như thường');
  assert.strictEqual(MC.baseUuDai(tong, ls), lKhac.total, 'đơn giữ quà: hạng / sinh nhật chỉ tính trên phần còn lại');
  assert.strictEqual(MC.baseUuDai(tong, ls, { chiA: true }), tong, 'sản phẩm có quà không phải combo → mã / voucher / giới thiệu tính cả');
  assert.strictEqual(MC.applyCoupon('G10', tong, ls).discount, Math.round(tong * 0.1), 'áp mã: mã giảm trên cả sản phẩm (đơn bỏ quà)');
  assert.strictEqual(MC.giftFor(ls, { coMa: true, maShip: false }).soQua, 0, 'áp mã → không còn quà');
  assert.strictEqual(MC.giftFor(ls, {}).soQua, 1, 'không áp mã → có quà');
  const vc = { trangThai: 'AVAILABLE', hetHan: '2099-01-01T00:00:00Z', batDau: '2000-01-01T00:00:00Z', giaTri: 999999999, donToiThieu: 0, phamVi: { loai: 'tatca' } };
  assert.strictEqual(MC.DD.giam(vc, tong, ls).giam, tong, 'voucher tính cả (dùng voucher thì đơn bỏ quà)');
  assert.match(MC.ghiChuKhongUuDai(ls, { coQua: true }), /áp mã giảm giá hoặc voucher thì đơn không kèm quà/);
  assert.strictEqual(MC.ghiChuKhongUuDai(ls, { coQua: false }), '', 'đã bỏ quà (dùng mã) → không cần ghi chú');
  /* combo / phân loại đã giảm sẵn trong tên: không nhận mã, voucher */
  const cb = W.PRODUCTS.find((p) => p.isCombo);
  if (cb) { const lCb = dong(W, cb.id), l2 = [lCb, lKhac];
    assert.strictEqual(MC.applyCoupon('G10', lCb.total + lKhac.total, l2).discount, Math.round(lKhac.total * 0.1), 'combo không nhận mã');
    assert.strictEqual(MC.DD.giam(vc, lCb.total + lKhac.total, l2).giam, lKhac.total, 'combo không nhận voucher');
    assert.match(MC.ghiChuKhongUuDai(l2), /Combo/); }
  const bt = W.PRODUCTS.find((p) => !p.isCombo && (p.variants || []).some((v) => /\+.*giảm/i.test(v.label)));
  if (bt) { const i = bt.variants.findIndex((v) => /\+.*giảm/i.test(v.label)), l = dong(W, bt.id, 1, i);
    assert.ok(MC.hangKhongUuDai([l], { chiA: true }).co(l), 'phân loại "' + bt.variants[i].label + '" đã giảm sẵn → không nhận mã / voucher'); }
});

test('Calciumore: phân loại 2 / 3 / 4 hộp váng sữa → dòng "Tặng 1 / 2 / 3 lọ D3K2" dưới ô chọn phân loại', () => {
  /* bỏ chương trình tính theo cả hoá đơn (tatCaSP, vd hoá đơn từ 2 triệu tặng bình) – bài này chỉ xét quà theo sản phẩm */
  const { MC, W } = taoWeb({ gio: '2026-11-05T10:00:00+07:00', truocApp: (w) => { w.QUA_TANG = Object.assign({}, w.QUA_TANG, { chuongTrinh: (w.QUA_TANG.chuongTrinh || []).filter((c) => !c.tatCaSP) }); } });
  const p = W.PRODUCTS.find((x) => x.id === '26060839019'); assert.ok(p, 'có Calciumore');
  for (const [nhan, so] of [['2 hộp váng sữa', 1], ['3 hộp váng sữa', 2], ['4 hộp váng sữa', 3]]) {
    assert.ok(p.variants.some((v) => v.label === nhan), 'có phân loại ' + nhan);
    assert.match(MC.quaBienThe(p, nhan, 1), new RegExp('Tặng ' + so + ' '), nhan + ' tặng ' + so);
  }
  assert.strictEqual(MC.quaBienThe(p, '1 hộp 90 gói', 1), '', '1 hộp chưa có quà');
  assert.match(MC.quaBienThe(p, '1 hộp 90 gói', 2), /Tặng 1 /, 'mua 2 hộp lẻ cũng tặng 1');
  assert.ok(!p.variants.some((v) => /tặng/i.test(v.label)), 'không còn phân loại ghi "tặng" trong tên');
});

/* ---------- Phí ship, tìm kiếm, link ---------- */
/* ---------- Chương trình 21/10/2026 (Kid · MP · Food): không dùng song song với ưu đãi đang có, web chọn mức lợi nhất ---------- */
const bt = (W, id, re) => W.PRODUCTS.find((x) => x.id === id).variants.findIndex((v) => re.test(v.label));
const phien = (chiTieu) => ({ localStorage: { mc_session: JSON.stringify({ sdt: '0900000000', token: 't', kh: { ten: 'Khách thử', tongChiTieu: chiTieu }, donHang: [], hetHan: Date.parse(gio('10:00')) + 864e6, luc: Date.parse(gio('10:00')) }),
  mc_customer: JSON.stringify({ name: 'Khách thử', phone: '0900000000' }) } });
test('Kid: Gạc Sumo mua thùng 40 gói tặng 1 hộp nước dinh dưỡng Lotte 10 gói (chọn xanh / hồng / cam), gói lẻ không tặng', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00') });
  const SUMO = '26156646705', thung = bt(W, SUMO, /thùng 40/i), le = bt(W, SUMO, /^10 gói/);
  const g1 = MC.giftFor([dong(W, SUMO, 1, thung)], {});
  assert.strictEqual(g1.soQua, 1); assert.match(g1.moTa, /Lotte 10 gói/);
  assert.strictEqual(JSON.stringify(g1.vi), JSON.stringify(['Xanh – Táo & Củ dền · 10 gói', 'Hồng – Nho & Mận · 10 gói', 'Cam – Lê & Hoa chuông · 10 gói']), 'chỉ chọn hộp 10 gói, đủ 3 màu');
  assert.strictEqual(MC.giftFor([dong(W, SUMO, 2, thung)], {}).soQua, 2, '2 thùng tặng 2 hộp');
  assert.notStrictEqual((MC.giftFor([dong(W, SUMO, 4, le)], {}) || {}).chuongTrinh, 'ct-2110-gac-sumo', '4 × 10 gói không phải thùng → không tặng hộp Lotte');
  const l = dong(W, SUMO, 1, thung); assert.ok(MC.hangKhongUuDai([l]).co(l), 'đang có quà → không cộng hạng / sinh nhật / mua 2 giảm 3%');
  assert.strictEqual(MC.giftFor([l], { coMa: true, maShip: false }).soQua, 0, 'áp mã giảm giá → bỏ quà');
  const CX = 'gac-canxi-sumo';
  assert.strictEqual(MC.giftFor([dong(W, CX, 1, bt(W, CX, /thùng 40/i))], {}).soQua, 1, 'Gạc canxi thùng 40 gói cũng tặng 1 hộp Lotte');
  assert.notStrictEqual((MC.giftFor([dong(W, CX, 1, bt(W, CX, /thùng 30/i))], {}) || {}).chuongTrinh, 'ct-2110-gac-sumo', 'Gạc canxi thùng 30 gói không thuộc chương trình');
  const phi = (ls) => MC.shipFee(1, 'standard', { tinh: 'Hà Nội', lines: ls });
  assert.strictEqual(phi([dong(W, CX, 1, bt(W, CX, /thùng 40/i))]), 50000, 'phí ship gạc canxi 1 thùng 50k');
  assert.strictEqual(phi([dong(W, CX, 3, bt(W, CX, /^hộp/i))]), 50000, '3 hộp 10 gói = 1 thùng');
  assert.strictEqual(phi([dong(W, CX, 1, bt(W, CX, /^hộp/i))]), 30000, '1 hộp lẻ = hàng khác');
  assert.strictEqual(phi([dong(W, CX, 2, bt(W, CX, /thùng 30/i))]), 80000, '2 thùng 80k');
});
test('Quà theo phân loại phải khớp tên phân loại thật (đổi tên phân loại mà quên sửa chương trình → hộp lẻ bị tính như thùng)', () => {
  const { W } = taoWeb({ gio: gio('10:00') });
  const sai = [];
  (W.QUA_TANG.chuongTrinh || []).forEach((c) => {
    const kiem = (id, keys, cho) => { const p = W.PRODUCTS.find((x) => x.id === id); if (!p || !p.variants || !p.variants.length) return;
      Object.keys(keys || {}).forEach((k) => { if (!p.variants.some((v) => v.label === k)) sai.push(c.id + ' › ' + cho + ' ' + id + ': "' + k + '"'); }); };
    (c.sanPhamChinh || []).forEach((x) => kiem(x.id, x.heSo, 'heSo'));
    (c.quaTang || []).forEach((x) => kiem(x.id, x.bienThe, 'bienThe'));
  });
  assert.deepStrictEqual(sai, [], 'tên phân loại không còn tồn tại');
});
test('24–25/10: 2 thùng nước ép Lotte tặng 1 thùng Háu Ăn, 2 hộp 10 gói thì không', () => {
  const { MC, W } = taoWeb({ gio: '2026-10-24T10:00:00+07:00' });
  const LT = '22686115682', thung = bt(W, LT, /Thùng 30 gói/), hop = bt(W, LT, /· 10 gói/);
  assert.strictEqual((MC.giftFor([dong(W, LT, 2, thung)], {}) || {}).chuongTrinh, 'ct-2410-hau-an-lotte', '2 thùng được tặng');
  assert.notStrictEqual((MC.giftFor([dong(W, LT, 2, hop)], {}) || {}).chuongTrinh, 'ct-2410-hau-an-lotte', '2 hộp 10 gói không phải 2 thùng');
});
test('MP: bộ 3 Meso bạc (cặp serum + kem + peel Anubis) tặng 1 hộp mặt nạ NMN; thiếu món nào cũng không tặng', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00') });
  const MESO = '29006040615', PEEL = '24764883120', cap = bt(W, MESO, /cặp/i), serum = bt(W, MESO, /^serum/i);
  const ctCua = (ls) => (MC.giftFor(ls, {}) || {}).chuongTrinh || '';   // (đơn từ 1 triệu vẫn có thể nhận quà đơn đầu của chương trình cũ)
  assert.notStrictEqual(ctCua([dong(W, MESO, 1, cap)]), 'ct-2110-meso-bac', 'chỉ cặp Meso, chưa có peel');
  assert.notStrictEqual(ctCua([dong(W, MESO, 1, serum), dong(W, PEEL, 1, 0)]), 'ct-2110-meso-bac', 'serum lẻ + peel chưa đủ bộ');
  const g = MC.giftFor([dong(W, MESO, 1, cap), dong(W, PEEL, 1, 0)], {});
  assert.strictEqual(g.soQua, 1); assert.match(g.moTa, /mặt nạ NMN/); assert.strictEqual(JSON.stringify(g.vi), JSON.stringify(['Mặt nạ trẻ hoá NMN Kousa hộp 8 miếng']));
  assert.strictEqual(MC.giftFor([dong(W, MESO, 2, cap), dong(W, PEEL, 1, 0)], {}).soQua, 1, '2 cặp + 1 peel = 1 bộ');
  const ls = [dong(W, MESO, 1, cap), dong(W, PEEL, 1, 0)]; assert.ok(MC.hangKhongUuDai(ls).co(ls[0]) && MC.hangKhongUuDai(ls).co(ls[1]), 'bộ được tặng quà không nhận thêm giảm giá');
});
test('MP: mỹ phẩm từ 10 triệu chọn giảm 5% hoặc 1 quà (Toner C / 2 hộp mặt nạ NMN); trùng bộ Meso bạc thì chỉ lấy 1 chương trình lợi hơn', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00') });
  const MESO = '29006040615', PEEL = '24764883120', SERUM = '24015142248', cap = bt(W, MESO, /cặp/i);
  const ls = [dong(W, MESO, 1, cap), dong(W, PEEL, 1, 0), dong(W, SERUM, 1, 0)], tien = ls.reduce((s, l) => s + l.total, 0);
  assert.ok(tien >= 10000000);
  const g = MC.giftFor(ls, {});
  assert.strictEqual(g.soQua, 1); assert.strictEqual(g.chuongTrinh, 'ct-2110-mp-10tr', 'quà 10 triệu giá trị cao hơn hộp mặt nạ của bộ Meso → không cộng 2 chương trình');
  assert.strictEqual(g.hoacGiam, 5); assert.strictEqual(g.giamTien, Math.round(tien * 0.05));
  assert.strictEqual(g.vi.length, 2); assert.match(g.vi[0], /Toner C/); assert.match(g.vi[1], /2 hộp mặt nạ NMN/);
  assert.notStrictEqual((MC.giftFor([dong(W, MESO, 1, cap)], {}) || {}).chuongTrinh, 'ct-2110-mp-10tr', 'dưới 10 triệu không có');
});
test('Food: thực phẩm / đồ ăn vặt từ 1 triệu giảm 5% – không dùng chung mã giảm giá / voucher, sản phẩm đó không cộng hạng / mua 2 giảm 3%', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00') });
  const BO = 'bo-xuyen-tieu', l3 = dong(W, BO, 3), gn = MC.giamNganh([l3]);
  assert.ok(l3.total >= 1000000); assert.ok(gn); assert.strictEqual(gn.tien, Math.round(l3.total * 0.05)); assert.strictEqual(gn.chuongTrinh, 'ct-2110-food-1tr');
  assert.strictEqual(MC.giamNganh([dong(W, BO, 2)]), null, 'dưới 1 triệu không giảm');
  assert.strictEqual(MC.giamNganh([l3], { coMa: true, maShip: false }), null, 'đã dùng mã / voucher thì không giảm thêm');
  assert.ok(MC.giamNganh([l3], { coMa: true, maShip: true }), 'mã freeship vẫn dùng kèm');
  assert.ok(MC.hangKhongUuDai([l3]).co(l3), 'đã giảm 5% → không cộng hạng / mua 2 giảm 3%');
  const lk = dong(W, LOTTE, 1); assert.strictEqual(MC.giamNganh([lk, dong(W, BO, 2)]), null, 'tiền hàng không phải Food không tính vào mốc 1 triệu');
});
test('Không song song – web chọn mức lợi nhất: khách hạng cao (giảm 12%) thì bỏ giảm 5% Food / quà, giữ ưu đãi hạng', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00'), ...phien(150000000) });
  const pct = W.TIERS.slice().sort((a, b) => b.min - a.min).find((t) => 150000000 >= t.min).discount;
  assert.ok(pct > 5, 'hạng thử nghiệm giảm hơn 5%: ' + pct);
  const l3 = dong(W, 'bo-xuyen-tieu', 3);
  assert.strictEqual(MC.giamNganh([l3]), null, 'hạng giảm nhiều hơn → không áp 5% Food');
  assert.ok(!MC.hangKhongUuDai([l3]).co(l3), 'sản phẩm được tính ưu đãi hạng như thường');
  const k = taoWeb({ gio: gio('10:00') }), lk = dong(k.W, 'bo-xuyen-tieu', 3);
  assert.ok(k.MC.giamNganh([lk]), 'khách chưa có hạng → được giảm 5%');
});

test('phí ship: đơn đủ mức miễn phí; giao nhanh có phí riêng', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00') });
  assert.strictEqual(MC.shipFee(W.SITE.freeshipFrom, 'standard', { tinh: 'Hà Nội', lines: [] }), 0);
  assert.strictEqual(MC.shipFee(0, 'standard', {}), 0, 'giỏ trống');
  assert.strictEqual(MC.shipFee(500000, 'express'), W.SITE.expressFee || 35000);
  const phi = MC.shipFee(300000, 'standard', { tinh: 'Hà Nội', lines: [dong(W, LOTTE)] });
  assert.ok(phi > 0, 'đơn nhỏ có phí ship: ' + phi);
});

test('phí ship theo bảng J&T: thùng Lotte 30/60/130/130k, gạc hươu · ChuChu · Norco 50/80/130k, hàng khác 30k mỗi kiện 3kg, đồng giá toàn quốc', () => {
  const { MC, W } = taoWeb({ gio: gio('10:00') });
  const bt = (id, re) => W.PRODUCTS.find((x) => x.id === id).variants.findIndex((v) => re.test(v.label));
  const phi = (ls, tinh = 'Hà Nội') => MC.shipFee(1, 'standard', { tinh, lines: ls });
  const thungLotte = bt(LOTTE, /thùng/i), hopLotte = bt(LOTTE, /^hộp 10/i);
  assert.ok(thungLotte >= 0 && hopLotte >= 0, 'Lotte có phân loại hộp và thùng');
  assert.strictEqual(phi([dong(W, LOTTE, 1, thungLotte)]), 30000, '1 thùng Lotte');
  assert.strictEqual(phi([dong(W, LOTTE, 2, thungLotte)]), 60000, '2 thùng Lotte');
  assert.strictEqual(phi([dong(W, LOTTE, 3, thungLotte)]), 130000, '3 thùng Lotte');
  assert.strictEqual(phi([dong(W, LOTTE, 4, thungLotte)]), 130000, '4 thùng Lotte');
  assert.strictEqual(phi([dong(W, LOTTE, 3, hopLotte)]), 30000, '3 hộp 10 gói = 1 thùng');
  assert.strictEqual(phi([dong(W, LOTTE, 1, hopLotte)]), 30000, '1 hộp lẻ = hàng khác 1 kiện');
  assert.strictEqual(phi([dong(W, LOTTE, 1, thungLotte)], 'Cà Mau'), 30000, 'đồng giá toàn quốc');
  const SUMO = '26156646705', CHU = '22644617070', NORCO = '26523206270';
  assert.strictEqual(phi([dong(W, SUMO, 1, bt(SUMO, /thùng/i))]), 50000, '1 thùng gạc hươu');
  assert.strictEqual(phi([dong(W, SUMO, 2, bt(SUMO, /thùng/i))]), 80000, '2 thùng gạc hươu');
  assert.strictEqual(phi([dong(W, CHU, 3, bt(CHU, /1 thùng/i))]), 130000, '3 thùng ChuChu');
  assert.strictEqual(phi([dong(W, CHU, 2, bt(CHU, /nửa thùng/i))]), 50000, '2 × nửa thùng ChuChu = 1 thùng');
  assert.strictEqual(phi([dong(W, NORCO, 1, bt(NORCO, /2 thùng/i))]), 80000, 'phân loại "2 thùng" Norco');
  assert.strictEqual(phi([dong(W, '42878618667', 1)]), 30000, 'D3K2: hàng khác 1 kiện');
  assert.strictEqual(phi([dong(W, NORCO, 1, 0), dong(W, '42878618667', 1)]), 80000, 'đơn nhiều loại: cộng từng loại');
  assert.match(MC.ghnInfo('', [dong(W, LOTTE, 2, thungLotte)]), /J&T Express · 2 thùng Lotte/);
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

/* ---------- Gợi ý bậc quà: không gợi ý quà kém giá trị hơn quà đang được (24/10/2026) ---------- */
test('gợi ý quà: bỏ gợi ý chương trình có quà rẻ hơn quà khách đang được', () => {
  const ct = (id, gia, bac) => ({ id, ten: id, batDau: '2026-11-01T00:00', ketThuc: '2026-11-30T23:59', kieu: 'soLuong', donVi: 'hộp', tenQua: 'quà ' + id,
    bac, sanPhamChinh: [{ id: KHAC, bat: true }], quaTang: [{ ten: 'Quà ' + id, bat: true, gia }] });
  const { W } = taoWeb({ gio: gio('10:00'), truocApp: (w) => { w.SU_KIEN = null; w.QUA_TANG = Object.assign({}, w.QUA_TANG, { chuongTrinh: [ct('re', 100000, [{ muc: 2, soQua: 1 }]), ct('dat', 700000, [{ muc: 1, soQua: 1 }, { muc: 2, soQua: 2 }])] }); } });
  const g = W.MC.giftFor([dong(W, KHAC, 1, 0)], {});
  assert.strictEqual(g.chuongTrinh, 'dat');
  assert.ok(/2 quà dat/.test(g.goiY), 'gợi ý bậc kế của chương trình đang thắng: ' + g.goiY);
  assert.ok(!/quà re/.test(g.goiY), 'không gợi ý quà rẻ hơn');
});

test('giờ vàng: sản phẩm trong truSanPham không giảm dù cùng thương hiệu', () => {
  const { W } = taoWeb({ gio: gio('20:30'), truocApp: (w) => { w.SU_KIEN = null; w.GIO_VANG = [{ id: 'gv', ten: 'GV', giam: 5, tu: '20:00', den: '22:00', brands: ['lotte'], sanPham: [], truSanPham: [LOTTE], tuNgay: '2026-11-01', denNgay: '', tat: false }]; } });
  assert.ok(!W.PRODUCTS.find((x) => x.id === LOTTE).gioVang, 'sản phẩm bị trừ không có giờ vàng');
  assert.ok(W.PRODUCTS.some((x) => x.brand === 'lotte' && x.id !== LOTTE && !x.isCombo && x.gioVang), 'sản phẩm lotte khác vẫn giảm');
});

test('quà giới hạn suất: tatCaSP tính cả hoá đơn, giuHang vẫn giữ ưu đãi hạng, hết suất (QUA_CON = 0) thì ẩn', () => {
  const ct = { id: 'ct-thu-2tr', ten: 'Hoá đơn từ 2tr tặng bình', batDau: '2026-11-01T00:00', ketThuc: '2026-11-30T23:59', kieu: 'tien', tatCaSP: true, giuHang: true, gioiHan: 50,
    bac: [{ muc: 2000000, soQua: 1 }], sanPhamChinh: [], quaTang: [{ ten: 'Bình thử', bat: true, gia: 250000 }] };
  const moi = (con) => taoWeb({ gio: gio('10:00'), truocApp: (w) => { w.SU_KIEN = null; w.GIO_VANG = []; w.QUA_TANG = Object.assign({}, w.QUA_TANG, { chuongTrinh: [ct] }); if (con) w.QUA_CON = con; } }).W;
  const W = moi(); const l = dong(W, KHAC, 1, 0);
  assert.ok(l.total >= 2000000, 'đơn thử từ 2 triệu');
  assert.strictEqual(W.MC.giftFor([l], {}).chuongTrinh, 'ct-thu-2tr');
  assert.ok(!W.MC.hangKhongUuDai || !W.MC.hangKhongUuDai([l]).size, 'giuHang: sản phẩm vẫn nhận ưu đãi hạng');
  const W2 = moi({ 'ct-thu-2tr': 0 });
  assert.notStrictEqual((W2.MC.giftFor([dong(W2, KHAC, 1, 0)], {}) || {}).chuongTrinh, 'ct-thu-2tr', 'hết suất thì không tặng');
});
