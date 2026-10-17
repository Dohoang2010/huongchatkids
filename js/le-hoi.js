/* =====================================================================
   GIAO DIỆN THEO NGÀY LỄ (SeasonalThemeEngine) – Hương Chất Kids
   - Lịch chiến dịch: window.LE_HOI trong js/data.js (trang quản trị › Website › Giao diện ngày lễ sửa khối này).
     Thiếu / hỏng → dùng LE_HOI_MAC_DINH bên dưới. Không có gì ở đây đụng tới giá, giỏ hàng, voucher, điểm…
   - Ngày tính theo giờ Việt Nam (UTC+7, không đổi giờ mùa hè) – không phụ thuộc múi giờ máy khách hay máy chủ.
   - Mỗi năm tự tính lại: ngày cố định (dương lịch), âm lịch Việt Nam (tính thiên văn, múi giờ +7),
     quy tắc (Chủ nhật thứ 2 tháng 5, thứ Sáu sau thứ Năm thứ 4 tháng 11…).
   - Hiển thị từ 00:00 ngày (sự kiện − truoc ngày, mặc định 3) đến hết ngày kết thúc. Trùng nhau → uuTien cao hơn thắng.
   - Chỉ thêm lớp trang trí (dải chào mừng, hoa văn, hiệu ứng nhẹ) – không đổi DOM nghiệp vụ, không chặn click.
   Chạy được cả trong Node (tools/kiem-thu/le-hoi.test.js) để kiểm thử với đồng hồ giả.
   ===================================================================== */
(function (goc, nhaMay) {
  const LH = nhaMay();
  if (typeof module === 'object' && module.exports) module.exports = LH;
  else { goc.LeHoi = LH; if (goc.document && !goc.LE_HOI_CHI_TINH && !/admin\.html$/i.test(goc.location.pathname)) LH.khoiDong(goc); }   // trang quản trị chỉ dùng phần tính lịch
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const TZ = 7;                       // giờ Việt Nam
  const NGAY = 864e5;

  /* ---------- Ngày dân sự (y, m, d) theo giờ VN ---------- */
  const homNayVN = (ms) => { const d = new Date(ms + TZ * 36e5); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; };
  const dauNgayVN = (y, m, d) => Date.UTC(y, m - 1, d) - TZ * 36e5;          // 00:00 giờ VN, tính ra mốc thời gian tuyệt đối
  const congNgay = (n, k) => { const t = new Date(Date.UTC(n.y, n.m - 1, n.d) + k * NGAY); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }; };
  const thu = (n) => new Date(Date.UTC(n.y, n.m - 1, n.d)).getUTCDay();       // 0 = Chủ nhật
  const chuoi = (n) => n.y + '-' + String(n.m).padStart(2, '0') + '-' + String(n.d).padStart(2, '0');
  const docChuoi = (s) => { const r = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); if (!r) return null; const n = { y: +r[1], m: +r[2], d: +r[3] }; return chuoi(congNgay(n, 0)) === s ? n : null; };

  /* ---------- Âm lịch Việt Nam ----------
     Tính theo thiên văn (công thức trăng mới và kinh độ mặt trời của J. Meeus, "Astronomical Algorithms"),
     áp quy tắc lịch Việt Nam: múi giờ UTC+7, tháng 11 âm chứa ngày Đông chí, năm nhuận (13 tháng) thì tháng nhuận
     là tháng đầu tiên không chứa trung khí. Khác lịch Trung Quốc (UTC+8) ở một số năm, vd Tết 1985, 2007; 2030… */
  const PI = Math.PI, INT = Math.floor;
  function jdTuNgay(d, m, y) {
    const a = INT((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    let jd = d + INT((153 * mm + 2) / 5) + 365 * yy + INT(yy / 4) - INT(yy / 100) + INT(yy / 400) - 32045;
    if (jd < 2299161) jd = d + INT((153 * mm + 2) / 5) + 365 * yy + INT(yy / 4) - 32083;
    return jd;
  }
  function ngayTuJd(jd) {
    let b, c;
    if (jd > 2299160) { const a = jd + 32044; b = INT((4 * a + 3) / 146097); c = a - INT(b * 146097 / 4); } else { b = 0; c = jd + 32082; }
    const d = INT((4 * c + 3) / 1461), e = c - INT(1461 * d / 4), m = INT((5 * e + 2) / 153);
    return { d: e - INT((153 * m + 2) / 5) + 1, m: m + 3 - 12 * INT(m / 10), y: b * 100 + d - 4800 + INT(m / 10) };
  }
  function trangMoi(k) {             // thời điểm trăng mới thứ k (tính từ 1/1/1900), ngày Julius
    const T = k / 1236.85, T2 = T * T, T3 = T2 * T, dr = PI / 180;
    let jd = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
    jd += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
    const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
    const Mp = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
    const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
    let c = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
    c += -0.4068 * Math.sin(Mp * dr) + 0.0161 * Math.sin(dr * 2 * Mp) - 0.0004 * Math.sin(dr * 3 * Mp);
    c += 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mp)) - 0.0074 * Math.sin(dr * (M - Mp));
    c += 0.0004 * Math.sin(dr * (2 * F + M)) - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mp));
    c += 0.0010 * Math.sin(dr * (2 * F - Mp)) + 0.0005 * Math.sin(dr * (2 * Mp + M));
    const dt = T < -11 ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3 : -0.000278 + 0.000265 * T + 0.000262 * T2;
    return jd + c - dt;
  }
  function kinhDoMatTroi(jdn) {      // radian
    const T = (jdn - 2451545.0) / 36525, T2 = T * T, dr = PI / 180;
    const M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
    const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
    const DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M) + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.000290 * Math.sin(dr * 3 * M);
    let L = (L0 + DL) * dr; L -= PI * 2 * INT(L / (PI * 2)); return L;
  }
  const cungMatTroi = (jd) => INT(kinhDoMatTroi(jd - 0.5 - TZ / 24) / PI * 6);   // 0..11 (mỗi cung 30°)
  const ngayTrangMoi = (k) => INT(trangMoi(k) + 0.5 + TZ / 24);
  function thang11(y) {               // ngày bắt đầu tháng 11 âm của năm dương y
    const k = INT((jdTuNgay(31, 12, y) - 2415021) / 29.530588853);
    let nm = ngayTrangMoi(k); if (cungMatTroi(nm) >= 9) nm = ngayTrangMoi(k - 1); return nm;
  }
  function viTriNhuan(a11) {
    const k = INT((a11 - 2415021.076998695) / 29.530588853 + 0.5);
    let cu, i = 1, cung = cungMatTroi(ngayTrangMoi(k + i));
    do { cu = cung; i++; cung = cungMatTroi(ngayTrangMoi(k + i)); } while (cung !== cu && i < 14);
    return i - 1;
  }
  /* Dương → âm: { d, m, y, nhuan } */
  function duongSangAm(n) {
    const jd = jdTuNgay(n.d, n.m, n.y), k = INT((jd - 2415021.076998695) / 29.530588853);
    let dau = ngayTrangMoi(k + 1); if (dau > jd) dau = ngayTrangMoi(k);
    let a11 = thang11(n.y), b11 = a11, nam;
    if (a11 >= dau) { nam = n.y; a11 = thang11(n.y - 1); } else { nam = n.y + 1; b11 = thang11(n.y + 1); }
    const ngay = jd - dau + 1, lech = INT((dau - a11) / 29); let thang = lech + 11, nhuan = 0;
    if (b11 - a11 > 365) { const v = viTriNhuan(a11); if (lech >= v) { thang = lech + 10; if (lech === v) nhuan = 1; } }
    if (thang > 12) thang -= 12;
    if (thang >= 11 && lech < 4) nam -= 1;
    return { d: ngay, m: thang, y: nam, nhuan };
  }
  /* Âm → dương (nhuan = 1: tháng nhuận). Trả null nếu tháng nhuận đó không có. */
  function amSangDuong(d, m, y, nhuan) {
    let a11, b11;
    if (m < 11) { a11 = thang11(y - 1); b11 = thang11(y); } else { a11 = thang11(y); b11 = thang11(y + 1); }
    const k = INT(0.5 + (a11 - 2415021.076998695) / 29.530588853);
    let lech = m - 11; if (lech < 0) lech += 12;
    if (b11 - a11 > 365) {
      const v = viTriNhuan(a11); let tn = v - 2; if (tn < 0) tn += 12;
      if (nhuan && m !== tn) return null;
      if (nhuan || lech >= v) lech += 1;
    } else if (nhuan) return null;
    return ngayTuJd(ngayTrangMoi(k + lech) + d - 1);
  }
  /* Tháng nhuận của năm âm y (0 = không nhuận) */
  function thangNhuan(y) {
    const a11 = thang11(y - 1), b11 = thang11(y); if (b11 - a11 <= 365) return 0;
    let tn = viTriNhuan(a11) - 2; if (tn <= 0) tn += 12; return tn;
  }

  /* Ngày đã đối chiếu với lịch Việt Nam công bố – nếu kết quả tính khác bảng này thì KHÔNG bật chiến dịch âm lịch
     của năm đó (ghi cảnh báo, trang quản trị báo để kiểm tra / nhập tay). Ngoài bảng: dùng kết quả tính,
     trừ khi cấu hình chiDungNgayDoiChieu = true. */
  const DOI_CHIEU = {
    'am-1-1': { 2024: '2024-02-10', 2025: '2025-01-29', 2026: '2026-02-17', 2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13', 2030: '2030-02-02', 2031: '2031-01-23', 2032: '2032-02-11', 2033: '2033-01-31', 2034: '2034-02-19', 2035: '2035-02-08' },
    'am-3-10': { 2023: '2023-04-29', 2024: '2024-04-18', 2025: '2025-04-07', 2026: '2026-04-26', 2027: '2027-04-16', 2028: '2028-04-04' },
    'am-8-15': { 2023: '2023-09-29', 2024: '2024-09-17', 2025: '2025-10-06', 2026: '2026-09-25', 2027: '2027-09-15', 2028: '2028-10-03', 2029: '2029-09-22', 2030: '2030-09-12' },
  };

  /* ---------- Ngày sự kiện trong năm ---------- */
  function ngayThu(y, m, thuTrongTuan, lan) {         // lần thứ lan (1..5) của thứ thuTrongTuan trong tháng m
    const dau = { y, m, d: 1 }; return congNgay(dau, (thuTrongTuan - thu(dau) + 7) % 7 + (lan - 1) * 7);
  }
  /* lich: { loai: 'duong', ngay: 'MM-DD' } | { loai: 'am', thang, ngay } | { loai: 'quytac', ma: 'ngay-cua-me' | 'ngay-cua-cha' | 'black-friday' } */
  function ngaySuKien(lich, y) {
    if (!lich) return { loi: 'thiếu lịch' };
    if (lich.loai === 'duong') { const r = /^(\d{2})-(\d{2})$/.exec(lich.ngay || ''); if (!r) return { loi: 'ngày dương sai' }; const n = { y, m: +r[1], d: +r[2] }; if (chuoi(congNgay(n, 0)) !== chuoi(n)) return { loi: 'ngày không tồn tại' }; return { n }; }
    if (lich.loai === 'am') {
      const n = amSangDuong(+lich.ngay, +lich.thang, y, 0); if (!n) return { loi: 'không đổi được ngày âm' };
      const k = 'am-' + (+lich.thang) + '-' + (+lich.ngay), bang = DOI_CHIEU[k] && DOI_CHIEU[k][y];
      if (bang && bang !== chuoi(n)) return { n, loi: 'lệch bảng đối chiếu (' + chuoi(n) + ' ≠ ' + bang + ')', chan: true };
      return { n, doiChieu: !!bang, am: true };
    }
    if (lich.loai === 'quytac') {
      if (lich.ma === 'ngay-cua-me') return { n: ngayThu(y, 5, 0, 2) };
      if (lich.ma === 'ngay-cua-cha') return { n: ngayThu(y, 6, 0, 3) };
      if (lich.ma === 'black-friday') return { n: congNgay(ngayThu(y, 11, 4, 4), 1) };    // thứ Sáu sau Lễ Tạ ơn (thứ Năm thứ 4)
      return { loi: 'quy tắc lạ: ' + lich.ma };
    }
    return { loi: 'loại lịch lạ' };
  }
  /* Khoảng hiển thị của chiến dịch cho năm y: { bd, kt, suKien } (ngày dân sự VN, kt tính trọn ngày) */
  function khoang(cd, y, cfg) {
    const ghi = (cd.ghiDe || {})[y];                   // quản trị nhập tay cho riêng năm đó
    if (ghi && docChuoi(ghi.bd) && docChuoi(ghi.kt)) return { bd: docChuoi(ghi.bd), kt: docChuoi(ghi.kt), suKien: docChuoi(ghi.suKien || ghi.bd), tay: true };
    const r = ngaySuKien(cd.lich, y); if (!r.n || r.chan) return { loi: r.loi || 'không tính được' };
    if (r.am && !r.doiChieu && cfg && cfg.chiDungNgayDoiChieu) return { loi: 'năm ' + y + ' chưa có ngày đối chiếu', n: r.n };
    const truoc = Number.isFinite(+cd.truoc) && cd.truoc !== '' ? Math.max(0, Math.min(30, +cd.truoc)) : 3;
    const soNgay = Math.max(1, Math.min(60, +cd.soNgay || 1));
    let kt = congNgay(r.n, soNgay - 1);
    if (cd.denNgay && /^\d{2}-\d{2}$/.test(cd.denNgay)) { const [mm, dd] = cd.denNgay.split('-').map(Number); let k = { y, m: mm, d: dd }; if (chuoi(k) < chuoi(r.n)) k = { y: y + 1, m: mm, d: dd }; kt = k; }
    return { bd: congNgay(r.n, -truoc), kt, suKien: r.n, canhBao: r.loi };
  }
  const trongKhoang = (k, ms) => k && k.bd && ms >= dauNgayVN(k.bd.y, k.bd.m, k.bd.d) && ms < dauNgayVN(k.kt.y, k.kt.m, k.kt.d) + NGAY;

  /* Cấu hình hợp lệ (thiếu → mặc định), chỉ giữ kiểu dữ liệu an toàn */
  function cauHinh(goc) {
    const c = goc && typeof goc === 'object' && Array.isArray(goc.ds) ? goc : MAC_DINH;
    return { bat: c.bat !== false, hieuUng: c.hieuUng !== false, chiDungNgayDoiChieu: !!c.chiDungNgayDoiChieu, ds: c.ds.filter((x) => x && x.id && x.lich) };
  }
  /* Chiến dịch đang chạy tại thời điểm ms (null nếu không có / đã tắt). Xét năm trước, năm nay, năm sau (lễ vắt qua năm). */
  function chon(goc, ms) {
    const cfg = cauHinh(goc); if (!cfg.bat) return null;
    const y = homNayVN(ms).y; let tot = null;
    cfg.ds.forEach((cd, i) => {
      if (cd.bat === false) return;
      [y - 1, y, y + 1].forEach((nam) => {
        const k = khoang(cd, nam, cfg); if (!trongKhoang(k, ms)) return;
        const uu = +cd.uuTien || 0;
        if (!tot || uu > tot.uu || (uu === tot.uu && i < tot.i)) tot = { cd, k, uu, i, nam };
      });
    });
    return tot ? { ...tot.cd, khoang: tot.k, nam: tot.nam } : null;
  }
  /* Mốc thời gian tiếp theo (bắt đầu / kết thúc một chiến dịch) sau ms – để đổi giao diện đúng lúc, không cần tải lại */
  function mocKeTiep(goc, ms) {
    const cfg = cauHinh(goc), y = homNayVN(ms).y; let tot = Infinity;
    cfg.ds.forEach((cd) => { if (cd.bat === false) return; [y, y + 1].forEach((nam) => { const k = khoang(cd, nam, cfg); if (!k.bd) return;
      [dauNgayVN(k.bd.y, k.bd.m, k.bd.d), dauNgayVN(k.kt.y, k.kt.m, k.kt.d) + NGAY].forEach((t) => { if (t > ms && t < tot) tot = t; }); }); });
    return tot;
  }
  /* Lịch cả năm (cho trang quản trị + kiểm thử) */
  function lichNam(goc, y) {
    const cfg = cauHinh(goc);
    return cfg.ds.map((cd) => { const k = khoang(cd, y, cfg); return { id: cd.id, ten: cd.ten, bat: cd.bat !== false, uuTien: +cd.uuTien || 0,
      bd: k.bd ? chuoi(k.bd) : '', kt: k.kt ? chuoi(k.kt) : '', suKien: k.suKien ? chuoi(k.suKien) : '', loi: k.loi || '', canhBao: k.canhBao || '', tay: !!k.tay }; });
  }

  /* ---------- Bộ chủ đề (màu chỉ dùng cho lớp trang trí, không đè màu chữ / nút / giá của web) ---------- */
  const CHU_DE = {
    'nam-moi':   { m1: '#1B2A6B', m2: '#E6B422', chu: '#fff', sticker: '🎆', hieuUng: 'phao-hoa', hat: ['✨', '🎉', '⭐'] },
    'tet':       { m1: '#C8102E', m2: '#F6B800', chu: '#fff', sticker: '🧧', hieuUng: 'hoa', hat: ['🌸', '🌼', '🧧'] },
    'tinh-yeu':  { m1: '#E0245E', m2: '#FF8FB1', chu: '#fff', sticker: '💝', hieuUng: 'tim', hat: ['💗', '💖', '🌹'] },
    'hoa-hong':  { m1: '#E8436E', m2: '#FF9BB5', chu: '#fff', sticker: '💐', hieuUng: 'hoa', hat: ['🌸', '🌷', '🌺', '💮'] },
    'hoa-tim':   { m1: '#8E44AD', m2: '#F06292', chu: '#fff', sticker: '💐', hieuUng: 'hoa', hat: ['🌸', '🌷', '💜'] },
    'trang-trong': { m1: '#B71C1C', m2: '#F9A825', chu: '#fff', sticker: '🇻🇳', hieuUng: 'sao-vang', hat: ['⭐', '🌟', '🇻🇳'] },
    'gia-dinh':  { m1: '#E07A5F', m2: '#F2CC8F', chu: '#fff', sticker: '💐', hieuUng: 'hoa', hat: ['🌸', '🌷', '💗'] },
    'thieu-nhi': { m1: '#2E86DE', m2: '#FF9F43', chu: '#fff', sticker: '🎈', hieuUng: 'bong-bay', hat: ['🎈', '🎈', '⭐', '🧸'] },
    'am-ap':     { m1: '#2C3E50', m2: '#D4A373', chu: '#fff', sticker: '👔', hieuUng: 'am-ap', hat: ['💙', '👔', '⭐', '🤍'] },
    'tuu-truong': { m1: '#1E88E5', m2: '#FDD835', chu: '#fff', sticker: '🎒', hieuUng: 'hoc-cu', hat: ['📚', '✏️', '🎒', '📐', '⭐'] },
    'trung-thu': { m1: '#1A237E', m2: '#FFB300', chu: '#fff', sticker: '🏮', hieuUng: 'den-long', hat: ['🏮', '🌕', '⭐'] },
    'halloween': { m1: '#3D1E6D', m2: '#FF7518', chu: '#fff', sticker: '🎃', hieuUng: 'halloween', hat: ['🎃', '🦇', '👻', '🍬'] },
    'sale':      { m1: '#E53935', m2: '#FF7043', chu: '#fff', sticker: '🛍️', hieuUng: 'qua-sale', hat: ['🛍️', '🎁', '🏷️', '✨'] },
    'tri-an':    { m1: '#00796B', m2: '#E57373', chu: '#fff', sticker: '📚', hieuUng: 'hoa', hat: ['🌷', '🌸'] },
    'sale-den':  { m1: '#111111', m2: '#FFC107', chu: '#fff', sticker: '🏷️', hieuUng: 'the-gia', hat: ['🏷️', '💥', '✨', '🖤'] },
    'giang-sinh': { m1: '#1B5E20', m2: '#C62828', chu: '#fff', sticker: '🎄', hieuUng: 'tuyet', hat: ['❄', '❅', '❆'] },
  };
  const HIEU_UNG = { '': 'Không có', hoa: 'Cánh hoa rơi', tim: 'Trái tim bay', 'phao-hoa': 'Lấp lánh năm mới', 'bong-bay': 'Bóng bay', 'den-long': 'Đèn lồng', halloween: 'Bí ngô & dơi vui nhộn', tuyet: 'Tuyết nhẹ',
    'sao-vang': 'Sao vàng bay nhẹ', 'am-ap': 'Lời chúc ấm áp', 'hoc-cu': 'Sách vở, bút chì', 'qua-sale': 'Túi quà, nhãn giá', 'the-gia': 'Nhãn giá Black Friday' };

  /* ---------- 19 chiến dịch mặc định ---------- */
  const C = (id, ten, lich, x) => Object.assign({ id, ten, lich, bat: true, uuTien: 10, truoc: 3, soNgay: 1, chuDe: 'hoa-hong', hieuUng: null, dai: '', nut: '', link: '', moTa: '',
    trang: ['*'], truTrang: ['checkout.html'], hieuUngTrang: ['index.html', 'collections.html', 'product.html', 'blog.html', 'diem-danh.html'], ghiDe: {} }, x);
  const MAC_DINH = { bat: true, hieuUng: true, chiDungNgayDoiChieu: false, ds: [
    C('tet-duong-lich', 'Tết Dương lịch', { loai: 'duong', ngay: '01-01' }, { chuDe: 'nam-moi', uuTien: 20, dai: '🎆 Hương Chất Kids chúc mẹ và bé năm mới an khang – mạnh khoẻ – nhiều niềm vui!', moTa: 'Năm mới, pháo hoa, lời chúc' }),
    C('tet-nguyen-dan', 'Tết Nguyên Đán', { loai: 'am', thang: 1, ngay: 1 }, { chuDe: 'tet', soNgay: 3, uuTien: 100, dai: '🧧 Chúc Mừng Năm Mới – Hương Chất Kids chúc cả nhà an khang thịnh vượng, bé ăn ngoan chóng lớn!', moTa: 'Mùng 1–3 Tết âm lịch: hoa đào, hoa mai, lì xì' }),
    C('valentine', 'Valentine', { loai: 'duong', ngay: '02-14' }, { chuDe: 'tinh-yeu', dai: '💝 Valentine ngọt ngào – yêu thương bắt đầu từ những điều chọn lọc cho cả nhà', moTa: 'Trái tim, quà tặng, hoa' }),
    C('quoc-te-phu-nu', 'Ngày Quốc tế Phụ nữ 8/3', { loai: 'duong', ngay: '03-08' }, { chuDe: 'hoa-tim', uuTien: 30, dai: '💐 Chúc mừng ngày Quốc tế Phụ nữ 8/3 – chúc mẹ luôn xinh đẹp, hạnh phúc và được yêu thương', moTa: 'Hoa, quà tặng, lời chúc phụ nữ' }),
    C('gio-to', 'Giỗ Tổ Hùng Vương', { loai: 'am', thang: 3, ngay: 10 }, { chuDe: 'trang-trong', uuTien: 40, dai: '🇻🇳 Dù ai đi ngược về xuôi, nhớ ngày Giỗ Tổ mùng mười tháng ba', moTa: 'Trang trọng, văn hoá Việt – sao vàng bay nhẹ' }),
    C('30-4-1-5', 'Giải phóng miền Nam & Quốc tế Lao động', { loai: 'duong', ngay: '04-30' }, { chuDe: 'trang-trong', soNgay: 2, uuTien: 40, dai: '🇻🇳 Chào mừng 30/4 – 1/5 · Chúc cả nhà kỳ nghỉ lễ vui vẻ, an toàn', moTa: '30/4 và 1/5 – trang trọng, hiện đại' }),
    C('ngay-cua-me', 'Ngày của Mẹ', { loai: 'quytac', ma: 'ngay-cua-me' }, { chuDe: 'gia-dinh', uuTien: 30, dai: '💐 Ngày của Mẹ – cảm ơn mẹ vì tất cả. Hương Chất Kids chúc mẹ luôn khoẻ và hạnh phúc', moTa: 'Chủ nhật thứ 2 của tháng 5' }),
    C('thieu-nhi', 'Quốc tế Thiếu nhi 1/6', { loai: 'duong', ngay: '06-01' }, { chuDe: 'thieu-nhi', uuTien: 30, dai: '🎈 Chúc mừng ngày Quốc tế Thiếu nhi 1/6 – chúc các bé luôn vui khoẻ, mau lớn!', moTa: 'Bóng bay, màu sắc vui tươi' }),
    C('ngay-cua-cha', 'Ngày của Cha', { loai: 'quytac', ma: 'ngay-cua-cha' }, { chuDe: 'am-ap', uuTien: 30, dai: '👔 Ngày của Cha – gửi lời cảm ơn tới những người bố tuyệt vời', moTa: 'Chủ nhật thứ 3 của tháng 6' }),
    C('tuu-truong', 'Back to School – Mùa tựu trường', { loai: 'duong', ngay: '08-01' }, { chuDe: 'tuu-truong', uuTien: 5, denNgay: '09-10', dai: '🎒 Mùa tựu trường – chuẩn bị dinh dưỡng cho bé tự tin vào năm học mới', moTa: 'Từ 01/8 đến 10/9 (sửa được)' }),
    C('quoc-khanh', 'Quốc khánh 2/9', { loai: 'duong', ngay: '09-02' }, { chuDe: 'trang-trong', uuTien: 50, dai: '🇻🇳 Chào mừng Quốc khánh 2/9 – chúc cả nhà kỳ nghỉ lễ vui vẻ, bình an', moTa: 'Đỏ, vàng, trang trọng' }),
    C('trung-thu', 'Tết Trung Thu', { loai: 'am', thang: 8, ngay: 15 }, { chuDe: 'trung-thu', uuTien: 60, dai: '🏮 Trung Thu đoàn viên – chúc các bé một mùa trăng thật vui, cả nhà sum vầy', moTa: 'Rằm tháng 8 âm lịch: trăng, đèn lồng, thỏ' }),
    C('phu-nu-viet-nam', 'Ngày Phụ nữ Việt Nam 20/10', { loai: 'duong', ngay: '10-20' }, { chuDe: 'hoa-hong', uuTien: 60, dai: '🌷 Chào mừng 20/10 – tạo tài khoản từ nay đến hết 20/10 tặng ngay 20.100 điểm · điểm danh ngày 20/10 nhận 50.000 điểm', nut: 'Nhận quà', link: 'index.html?tab=2010', moTa: 'Hoa, quà tặng, lời chúc' }),
    C('halloween', 'Halloween', { loai: 'duong', ngay: '10-31' }, { chuDe: 'halloween', uuTien: 20, dai: '🎃 Happy Halloween – bé vui hết nấc, mẹ yên tâm với đồ ăn vặt chọn lọc', moTa: 'Bí ngô, dơi, ma vui nhộn' }),
    C('sale-11-11', 'Siêu sale 11.11', { loai: 'duong', ngay: '11-11' }, { chuDe: 'sale', uuTien: 30, dai: '🛍️ Mùa săn deal 11.11 – xem các ưu đãi đang có trên web', nut: 'Xem ưu đãi', link: 'collections.html', moTa: 'Mua sắm, ưu đãi' }),
    C('nha-giao', 'Ngày Nhà giáo Việt Nam 20/11', { loai: 'duong', ngay: '11-20' }, { chuDe: 'tri-an', uuTien: 40, dai: '📚 Tri ân thầy cô nhân ngày Nhà giáo Việt Nam 20/11', moTa: 'Hoa, sách, lời tri ân' }),
    C('black-friday', 'Black Friday & Cyber Monday', { loai: 'quytac', ma: 'black-friday' }, { chuDe: 'sale-den', soNgay: 4, uuTien: 35, dai: '🏷️ Black Friday – Cyber Monday: săn ưu đãi cuối tháng 11', nut: 'Xem ưu đãi', link: 'collections.html', moTa: 'Thứ Sáu sau Lễ Tạ ơn → Cyber Monday' }),
    C('sale-12-12', 'Siêu sale 12.12', { loai: 'duong', ngay: '12-12' }, { chuDe: 'sale', uuTien: 30, dai: '🛍️ Siêu sale 12.12 – deal cuối năm cho mẹ và bé', nut: 'Xem ưu đãi', link: 'collections.html', moTa: 'Ngày đôi cuối năm' }),
    C('giang-sinh', 'Giáng sinh', { loai: 'duong', ngay: '12-24' }, { chuDe: 'giang-sinh', soNgay: 2, uuTien: 50, dai: '🎄 Merry Christmas – Hương Chất Kids chúc cả nhà Giáng sinh an lành, ấm áp', moTa: '24–25/12: cây thông, tuyết nhẹ, quà' }),
  ] };

  /* ---------- Áp giao diện trên trình duyệt ---------- */
  const an = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mauHopLe = (s, mac) => (/^#[0-9a-f]{6}$/i.test(String(s || '')) ? s : mac);
  const linkHopLe = (s) => (/^(https:\/\/|[a-z0-9-]+\.html)/i.test(String(s || '')) && !/^javascript:/i.test(s) ? s : '');
  const trangHienTai = (w) => { const p = (w.location.pathname.split('/').pop() || 'index.html').toLowerCase(); return p || 'index.html'; };
  const hopTrang = (ds, p) => Array.isArray(ds) && ds.some((x) => x === '*' || String(x).toLowerCase() === p);

  function khoiDong(w) {
    const doc = w.document, SEARCH0 = w.location.search; let hen = 0, dangCo = null, hieuUngEl = null;   // một số trang tự gọn URL → nhớ tham số lúc nạp
    const xemTruoc = () => {          // trang quản trị: ?preview=1&le=<id> hoặc bản nháp trong sessionStorage
      try {
        if (!/[?&]preview=1/.test(SEARCH0) && w.top === w) return null;
        const q = new URLSearchParams(SEARCH0), d = JSON.parse(w.sessionStorage.getItem('hck_preview') || 'null') || {};
        return { cfg: d.LE_HOI || null, id: q.get('le') || (d.LE_XEM && d.LE_XEM.id) || '', ngay: q.get('le_ngay') || (d.LE_XEM && d.LE_XEM.ngay) || '' };
      } catch { return null; }
    };
    function go() {
      doc.documentElement.classList.remove('le-on'); [...doc.documentElement.classList].forEach((c) => c.indexOf('le--') === 0 && doc.documentElement.classList.remove(c));
      doc.querySelectorAll('.le-dai,.le-hoa').forEach((x) => x.remove()); hieuUngEl = null; dangCo = null;
    }
    function ap() {
      clearTimeout(hen); go();
      const xt = xemTruoc(); let cfg = (xt && xt.cfg) || w.LE_HOI; let ms = Date.now(), cd = null;
      try {
        if (xt && xt.ngay && docChuoi(xt.ngay)) { const n = docChuoi(xt.ngay); ms = dauNgayVN(n.y, n.m, n.d) + 12 * 36e5; }
        if (xt && xt.id) { const c0 = cauHinh(cfg).ds.find((x) => x.id === xt.id); if (c0) cd = { ...c0, khoang: khoang(c0, homNayVN(ms).y, cauHinh(cfg)) }; }
        else cd = chon(cfg, ms);
      } catch (e) { try { console.warn('Giao diện ngày lễ lỗi, dùng giao diện mặc định:', e); } catch { /* */ } cd = null; }
      if (!xt) { const t = mocKeTiep(cfg, Date.now()); if (t - Date.now() < 2 * NGAY) hen = setTimeout(ap, Math.max(1000, t - Date.now() + 500)); }   // tới mốc thì tự đổi
      if (!cd) return;
      const p = trangHienTai(w); if (!hopTrang(cd.trang || ['*'], p) || hopTrang(cd.truTrang || [], p)) return;
      const cfgOk = cauHinh(cfg), cd0 = CHU_DE[cd.chuDe] || CHU_DE['hoa-hong'], m = cd.mau || {};
      const root = doc.documentElement; dangCo = cd;
      root.classList.add('le-on', 'le--' + String(cd.chuDe || 'hoa-hong').replace(/[^a-z0-9-]/g, ''));
      root.style.setProperty('--le-1', mauHopLe(m.m1, cd0.m1)); root.style.setProperty('--le-2', mauHopLe(m.m2, cd0.m2)); root.style.setProperty('--le-chu', mauHopLe(m.chu, cd0.chu));
      /* Dải chào mừng đầu trang (khách đóng được, nhớ trong phiên) */
      const KD = 'mc_le_dai_' + cd.id + '_' + (cd.nam || '');
      let daDong = false; try { daDong = w.sessionStorage.getItem(KD) === '1'; } catch { /* riêng tư */ }
      if (cd.dai && (!daDong || xt)) {
        const d = doc.createElement('div'); d.className = 'le-dai'; d.setAttribute('role', 'note');
        const link = linkHopLe(cd.link), st0 = String(cd.sticker || cd0.sticker || ''), sticker = String(cd.dai).indexOf(st0) === 0 ? '' : an(st0);   // lời chào đã mở đầu bằng sticker thì không lặp
        d.innerHTML = `<${link ? 'a href="' + an(link) + '"' : 'div'} class="le-dai__in"><span class="le-dai__st" aria-hidden="true">${sticker}</span><span class="le-dai__chu">${an(cd.dai)}</span>${link && cd.nut ? `<b>${an(cd.nut)} →</b>` : ''}</${link ? 'a' : 'div'}><button type="button" aria-label="Đóng lời chào">×</button>`;
        d.querySelector('button').addEventListener('click', () => { d.remove(); try { w.sessionStorage.setItem(KD, '1'); } catch { /* */ } });
        doc.body.prepend(d);
      }
      /* Hiệu ứng nhẹ: tắt khi người dùng chọn giảm chuyển động, máy yếu, tab ẩn; ít hạt trên điện thoại */
      const hu = cd.hieuUng == null ? cd0.hieuUng : cd.hieuUng, hat = (Array.isArray(cd.hat) && cd.hat.length ? cd.hat : cd0.hat).slice(0, 6);
      const giam = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const yeu = (w.navigator.deviceMemory && w.navigator.deviceMemory <= 2) || (w.navigator.hardwareConcurrency && w.navigator.hardwareConcurrency <= 2) || (w.navigator.connection && w.navigator.connection.saveData);
      if (hu && hat.length && cfgOk.hieuUng && !giam && !yeu && hopTrang(cd.hieuUngTrang || [], p)) {
        /* Mật độ thưa + rơi chậm cho đỡ rối mắt: tuyết dày hơn chút (hạt nhỏ), ngày trang trọng thưa và chậm nhất */
        const nho = w.innerWidth < 768, trangChu = p === 'index.html';
        const nhe = hu === 'sao-vang' || hu === 'am-ap';                                  // ngày lễ trang trọng: rất nhẹ nhàng
        const so = hu === 'tuyet' ? (nho ? 7 : 12) : nhe ? (nho ? 3 : 6) : (nho ? 4 : 8);
        const el = doc.createElement('div'); el.className = 'le-hoa le-hoa--' + hu; el.setAttribute('aria-hidden', 'true');
        for (let i = 0; i < so; i++) {
          const c = doc.createElement('i'); c.textContent = hat[i % hat.length];
          const lap = trangChu ? 'infinite' : '2';
          c.style.cssText = `left:${(i + Math.random()) * 100 / so}%;font-size:${(hu === 'tuyet' ? 9 : 13) + Math.random() * 11}px;animation-duration:${(nhe ? 26 : 18) + Math.random() * 12}s,${5 + Math.random() * 3}s;animation-delay:${-Math.random() * 26}s,0s;animation-iteration-count:${lap},infinite`;
          el.appendChild(c);
        }
        doc.body.appendChild(el); hieuUngEl = el;
        if (!trangChu) setTimeout(() => { if (hieuUngEl === el) { el.remove(); hieuUngEl = null; } }, 60000);
      }
    }
    doc.addEventListener('visibilitychange', () => { if (hieuUngEl) hieuUngEl.style.animationPlayState = ''; if (hieuUngEl) hieuUngEl.classList.toggle('is-dung', doc.hidden); });
    w.addEventListener('message', (e) => { if (e.origin === w.location.origin && e.data && e.data.type === 'hck-le-hoi') { try { const d = JSON.parse(w.sessionStorage.getItem('hck_preview') || '{}'); d.LE_HOI = e.data.cfg; d.LE_XEM = e.data.xem || null; w.sessionStorage.setItem('hck_preview', JSON.stringify(d)); } catch { /* */ } ap(); } });
    /* Chạy sau khi js/app.js vẽ xong khung trang (script này nạp defer → luôn trước DOMContentLoaded); 'load' là dự phòng */
    let daChay = false; const mot = () => { if (!daChay) { daChay = true; ap(); } };
    if (doc.readyState === 'complete') mot(); else { doc.addEventListener('DOMContentLoaded', () => setTimeout(mot, 0)); w.addEventListener('load', mot); }
    LH.apLai = ap; LH.dangCo = () => dangCo;
  }

  const LH = { TZ, MAC_DINH, CHU_DE, HIEU_UNG, homNayVN, dauNgayVN, congNgay, chuoi, docChuoi, duongSangAm, amSangDuong, thangNhuan, ngaySuKien, khoang, chon, mocKeTiep, lichNam, cauHinh, khoiDong };
  return LH;
});
