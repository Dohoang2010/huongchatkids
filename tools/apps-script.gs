/**
 * HƯƠNG CHẤT KIDS – máy chủ nhỏ chạy miễn phí trên Google Apps Script.
 * Gồm 3 việc:
 *   1) Nhận đơn từ website  → ghi 1 dòng vào Google Sheet + gửi email + nhắn Zalo qua bot.
 *   2) Hồ sơ khách hàng     → mỗi số điện thoại 1 dòng ở sheet "Khách hàng": tên, địa chỉ,
 *                             tổng chi tiêu, số đơn, hạng (Silver/Gold/Diamond).
 *   3) Xác thực OTP         → khách muốn xem hồ sơ / sửa địa chỉ phải nhập mã OTP 6 số.
 *
 * CÁCH CÀI (làm 1 lần, miễn phí):
 *  1. Vào https://sheets.new → đặt tên "Đơn hàng Hương Chất Kids".
 *  2. Extensions (Tiện ích mở rộng) → Apps Script. Xoá code mẫu, dán toàn bộ file này vào.
 *  3. Điền ZALO_BOT_TOKEN (token bot Zalo của shop) ở phần CẤU HÌNH bên dưới.
 *  4. Deploy (Triển khai) → New deployment → loại "Web app":
 *        Execute as (Thực thi với tên): Me / Tôi
 *        Who has access (Ai có quyền): Anyone / Bất kỳ ai
 *     → Deploy → Authorize → copy link dạng https://script.google.com/macros/s/..../exec
 *  5. Dán link đó vào js/data.js ở dòng orderEndpoint.
 *
 * ⚠️ MỖI LẦN SỬA CODE phải bấm Deploy → Manage deployments → bút chì → Version: New version → Deploy.
 * ⚠️ KHÔNG dán token thật vào bản trong thư mục tools/ của website (thư mục đó công khai trên GitHub).
 */

/* ===================== CẤU HÌNH ===================== */
var EMAIL = 'huongchatkids@gmail.com';   // nơi nhận email báo đơn & báo mã OTP khi chưa có SMS
var TEN_SHOP = 'Hương Chất Kids';
var HOTLINE = '0967.233.003';

// Bot Zalo báo đơn (tạo tại https://zalo.me/s/botcreator/). Để trống = tắt báo Zalo.
var ZALO_BOT_TOKEN = '';       // dạng 211668...:IEUc...
var ZALO_BOT_CHAT_ID = '';     // để trống: nhắn cho bot 1 tin rồi chạy hàm zaloBotLayChatId()

// Gửi OTP bằng SMS (tuỳ chọn – cần đăng ký dịch vụ brandname, VD eSMS.vn).
// Để trống = shop chưa dùng SMS: mã OTP sẽ được gửi về email khách (nếu có) hoặc
// báo về Zalo/email của shop để shop nhắn tay cho khách.
var SMS_API_KEY = '';
var SMS_SECRET_KEY = '';
var SMS_BRANDNAME = '';        // tên thương hiệu đã đăng ký với nhà mạng

// Bảng hạng khách hàng – phải khớp với window.TIERS trong js/data.js
var HANG = [
  { key: 'moi',     label: 'Khách mới', min: 0,         giam: 0 },
  { key: 'silver',   label: 'Silver',    min: 5000000,   giam: 5 },
  { key: 'gold',     label: 'Gold',      min: 20000000,  giam: 7 },
  { key: 'diamond',  label: 'Diamond',   min: 40000000,  giam: 10 },
  { key: 'platinum', label: 'Platinum',  min: 100000000, giam: 12 }
];

var OTP_PHUT = 10;        // mã OTP sống bao nhiêu phút
var OTP_SAI_TOI_DA = 5;   // nhập sai quá số lần này thì phải xin mã mới
var OTP_MOI_GIO = 5;      // mỗi số điện thoại xin tối đa bao nhiêu mã trong 1 giờ
var PHIEN_NGAY = 30;      // token đăng nhập sống bao nhiêu ngày

var SHEET_DON = 'Đơn hàng';
var SHEET_KH = 'Khách hàng';
var SHEET_OTP = 'OTP';
var SHEET_PHIEN = 'Phiên';

var HEADERS = ['Thời gian', 'Mã đơn', 'Loại', 'Khách', 'Điện thoại', 'Địa chỉ', 'Sản phẩm',
               'Tiền hàng', 'Giảm', 'Ship', 'Tổng', 'Thanh toán', 'Mã giảm giá', 'Ghi chú', 'Email',
               'Hạng KH', 'Giảm theo hạng', 'Quà tặng', 'Trạng thái'];
var H_KH = ['Điện thoại', 'Họ tên', 'Tỉnh/Thành', 'Xã/Phường', 'Địa chỉ cụ thể', 'Email',
            'Tổng chi tiêu', 'Số đơn', 'Hạng', 'Đơn gần nhất', 'Tạo lúc', 'Ghi chú'];

/* ===================== TIỆN ÍCH CHUNG ===================== */
function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }

function sheetDon() {
  var s = ss().getSheetByName(SHEET_DON);
  if (!s) { s = ss().getSheets()[0]; if (s.getLastRow() === 0) s.setName(SHEET_DON); }
  if (s.getLastRow() === 0) {
    s.appendRow(HEADERS);
    s.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    s.setFrozenRows(1);
  } else if (s.getLastColumn() < HEADERS.length) {
    // sheet cũ ít cột hơn -> bổ sung tiêu đề cho các cột mới
    s.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  }
  return s;
}
function sheetPhu(ten, headers) {
  var s = ss().getSheetByName(ten);
  if (!s) { s = ss().insertSheet(ten); s.appendRow(headers); s.getRange(1, 1, 1, headers.length).setFontWeight('bold'); s.setFrozenRows(1); }
  return s;
}
function sheetKH()    { return sheetPhu(SHEET_KH, H_KH); }
function sheetOtp()   { return sheetPhu(SHEET_OTP, ['Điện thoại', 'Mã', 'Hết hạn', 'Số lần sai', 'Gửi lúc', 'Kênh']); }
function sheetPhien() { return sheetPhu(SHEET_PHIEN, ['Token', 'Điện thoại', 'Hết hạn', 'Tạo lúc']); }

function chuanSdt(v) {
  var s = String(v == null ? '' : v).replace(/[\s.()\-']/g, '');
  if (s.indexOf('+84') === 0) s = '0' + s.slice(3);
  else if (s.indexOf('84') === 0 && s.length === 11) s = '0' + s.slice(2);
  if (s.length === 9 && s.charAt(0) !== '0') s = '0' + s;
  return s;
}
function sdtHopLe(s) { return /^0(3|5|7|8|9)\d{8}$/.test(chuanSdt(s)); }
function anTen(ten) {
  var t = String(ten || '').trim(); if (!t) return '';
  return t.split(/\s+/).map(function (w, i, a) { return i === a.length - 1 ? w : w.charAt(0) + '***'; }).join(' ');
}
function anEmail(mail) {
  var m = String(mail || ''); var i = m.indexOf('@'); if (i < 1) return '';
  return m.charAt(0) + '***' + m.slice(i - 1);
}
function hangTheoTien(tien) {
  var h = HANG[0];
  for (var i = 0; i < HANG.length; i++) if ((tien || 0) >= HANG[i].min) h = HANG[i];
  return h;
}
function tien(n) { return (Number(n) || 0).toLocaleString('vi-VN') + 'đ'; }
function ngayVN(d) { return Utilities.formatDate(new Date(d), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm'); }

/* ===================== NHẬN ĐƠN (POST từ website) ===================== */
function doPost(e) {
  try {
    var order = JSON.parse(e.postData.contents);

    // Tin nhắn Zalo OA gửi tới (nếu có) – chỉ lưu lại user id
    if (order && order.event_name && order.sender && order.sender.id) {
      PropertiesService.getScriptProperties().setProperty('ZALO_USER_ID', String(order.sender.id));
      return ContentService.createTextOutput(JSON.stringify({ ok: true, zalo: true })).setMimeType(ContentService.MimeType.JSON);
    }

    var c = order.customer || {};
    var sdt = chuanSdt(c.phone);
    var items = (order.items || []).map(function (it) {
      return (it.short || it.name) + (it.variant ? ' – ' + it.variant : '') + ' × ' + (it.qty || 1);
    }).join('\n');
    var loai = order.type === 'callback' ? 'Yêu cầu gọi lại' : (order.type === 'quick' ? 'Mua nhanh' : 'Đặt hàng');
    var thanhToan = order.payment === 'bank' ? 'Chuyển khoản' : (order.payment ? 'COD' : '');
    var quaText = order.qua && order.qua.soQua ? (order.qua.moTa || (order.qua.soQua + ' ' + order.qua.ten)) : '';

    sheetDon().appendRow([
      new Date(), order.code || '', loai, c.name || '', "'" + sdt, c.address || '', items,
      order.subtotal || 0, order.discount || 0, order.ship || 0, order.total || 0,
      thanhToan, order.coupon || '', order.note || '', c.email || '',
      order.hangLabel || '', order.giamHang || 0, quaText, ''
    ]);

    // Cập nhật hồ sơ khách (bỏ qua yêu cầu gọi lại)
    if (order.type !== 'callback' && sdtHopLe(sdt)) {
      try { capNhatKhachHang(sdt, c, order); } catch (err) { Logger.log('Cập nhật khách lỗi: ' + err); }
    }

    var text = loai + ' ' + (order.code || '') + '\n'
      + 'Khách: ' + (c.name || '(chưa có tên)') + ' – ' + sdt + '\n'
      + (c.address ? 'Địa chỉ: ' + c.address + '\n' : '')
      + (items ? items + '\n' : '')
      + (quaText ? '🎁 Quà tặng: ' + quaText + '\n' : '')
      + (order.hangLabel ? 'Hạng ' + order.hangLabel + ' – đã giảm ' + tien(order.giamHang) + '\n' : '')
      + 'Tổng: ' + tien(order.total) + (thanhToan ? ' (' + thanhToan + ')' : '')
      + (order.note ? '\nGhi chú: ' + order.note : '');

    if (EMAIL) MailApp.sendEmail(EMAIL, '🛒 ' + loai + ' ' + (order.code || '') + ' – ' + tien(order.total), text);
    try { zaloBotGuiTin(text); } catch (err2) { Logger.log('Zalo bot lỗi: ' + err2); }

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log('doPost lỗi: ' + err);
    return ContentService.createTextOutput(JSON.stringify({ ok: false, msg: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

/* ===================== KẾT NỐI CRM (crm.huongchatkids.com) =====================
   Sau khi khách nhập đúng OTP, hạng & tổng chi tiêu lấy theo ĐƠN THẬT trong CRM / Nhanh
   thay vì sheet Đơn hàng. Khoá bí mật KHÔNG đặt trong mã: vào Cài đặt dự án (⚙️) →
   Thuộc tính tập lệnh (Script Properties) → thêm CRM_KEY = <khoá ở trang Kết nối web của CRM>.
   Chưa có CRM_KEY hoặc CRM lỗi → tự dùng sheet Đơn hàng như cũ. */
var CRM_KHACH_URL = 'https://crm.huongchatkids.com/api/webhook/web-khach';
function layKhachTuCRM(sdt) {
  var key = PropertiesService.getScriptProperties().getProperty('CRM_KEY');
  if (!key) return null;
  try {
    var r = UrlFetchApp.fetch(CRM_KHACH_URL + '?sdt=' + encodeURIComponent(sdt) + '&key=' + encodeURIComponent(key), { muteHttpExceptions: true });
    if (r.getResponseCode() !== 200) return null;
    var d = JSON.parse(r.getContentText());
    return d && d.ok ? d : null;
  } catch (err) { return null; }
}
/* Chạy thử trong trình soạn thảo: xem Nhật ký */
function testCRM() { Logger.log(JSON.stringify(layKhachTuCRM('0900000000'))); }

/* ===================== HỒ SƠ KHÁCH HÀNG ===================== */
/* Tổng chi tiêu tính lại từ sheet Đơn hàng (bỏ qua đơn có trạng thái huỷ/hoàn) */
function tinhChiTieu(sdt) {
  var s = sheetDon(); var n = s.getLastRow(); if (n < 2) return { tong: 0, soDon: 0, ganNhat: '', don: [] };
  var v = s.getRange(2, 1, n - 1, HEADERS.length).getValues();
  var tong = 0, soDon = 0, ganNhat = '', don = [];
  for (var i = v.length - 1; i >= 0; i--) {
    if (chuanSdt(v[i][4]) !== sdt) continue;
    var loai = String(v[i][2] || '');
    if (loai.indexOf('gọi lại') > -1) continue;
    var tt = String(v[i][18] || '');
    var bo = /huỷ|huy|hoàn|hoan/i.test(tt);
    if (!bo) { tong += Number(v[i][10]) || 0; soDon++; if (!ganNhat) ganNhat = ngayVN(v[i][0]); }
    if (don.length < 30) don.push({
      ma: String(v[i][1] || ''), ngay: ngayVN(v[i][0]), sanPham: String(v[i][6] || ''),
      tong: Number(v[i][10]) || 0, thanhToan: String(v[i][11] || ''), qua: String(v[i][17] || ''),
      trangThai: tt || 'Đã tiếp nhận'
    });
  }
  return { tong: tong, soDon: soDon, ganNhat: ganNhat, don: don };
}

function timDongKH(sdt) {
  var s = sheetKH(); var n = s.getLastRow(); if (n < 2) return 0;
  var v = s.getRange(2, 1, n - 1, 1).getValues();
  for (var i = 0; i < v.length; i++) if (chuanSdt(v[i][0]) === sdt) return i + 2;
  return 0;
}

function docKH(sdt) {
  var s = sheetKH(); var dong = timDongKH(sdt);
  var ct = tinhChiTieu(sdt);
  /* Có CRM → tổng chi tiêu, số đơn, lịch sử đơn lấy theo CRM (trường tien của CRM → tong mà web đọc) */
  var crm = layKhachTuCRM(sdt);
  if (crm && crm.co && crm.kh) {
    ct = { tong: Number(crm.kh.tongChiTieu) || 0, soDon: Number(crm.kh.soDon) || 0, ganNhat: '',
      don: (crm.donHang || []).slice(0, 30).map(function (d) {
        return { ma: String(d.ma || ''), ngay: String(d.ngay || ''), sanPham: String(d.sanPham || ''),
          tong: Number(d.tien != null ? d.tien : d.tong) || 0, thanhToan: String(d.thanhToan || ''), qua: String(d.qua || ''),
          trangThai: String(d.trangThai || 'Đã tiếp nhận') };
      }) };
    if (!ct.soDon) ct.soDon = ct.don.length;
    if (ct.don.length) ct.ganNhat = ct.don[0].ngay;
  }
  var h = hangTheoTien(ct.tong);
  var kh = { sdt: sdt, ten: '', tinh: '', xa: '', diaChi: '', email: '',
             tongChiTieu: ct.tong, soDon: ct.soDon, hang: h.key, hangLabel: h.label, giam: h.giam, donGanNhat: ct.ganNhat };
  if (dong) {
    var v = s.getRange(dong, 1, 1, H_KH.length).getValues()[0];
    kh.ten = String(v[1] || ''); kh.tinh = String(v[2] || ''); kh.xa = String(v[3] || '');
    kh.diaChi = String(v[4] || ''); kh.email = String(v[5] || '');
  }
  /* Sheet chưa có → lấy tên, địa chỉ, email từ CRM (CRM trả thêm tinh / xa / diaChi / email thì tự dùng) */
  if (crm && crm.co && crm.kh) {
    var ck = crm.kh;
    if (!kh.ten) kh.ten = String(ck.ten || '');
    if (!kh.tinh && !kh.diaChi) { kh.tinh = String(ck.tinh || ''); kh.xa = String(ck.xa || ''); kh.diaChi = String(ck.diaChi || ck.diaChiChiTiet || ''); }
    if (!kh.email) kh.email = String(ck.email || '');
  }
  return { kh: kh, don: ct.don, dong: dong };
}

/* Tách "số nhà, xã, tỉnh" thành 3 phần khi đơn cũ không gửi kèm tinh/xa */
function capNhatKhachHang(sdt, c, order) {
  var s = sheetKH(); var dong = timDongKH(sdt);
  var ct = tinhChiTieu(sdt); var h = hangTheoTien(ct.tong);
  var tinh = c.tinh || '', xa = c.xa || '', chiTiet = c.diaChi || '';
  if (!tinh && c.address) {
    var p = String(c.address).split(',');
    if (p.length >= 3) { tinh = p.pop().trim(); xa = p.pop().trim(); chiTiet = p.join(',').trim(); }
    else chiTiet = String(c.address).trim();
  }
  if (dong) {
    var cu = s.getRange(dong, 1, 1, H_KH.length).getValues()[0];
    s.getRange(dong, 1, 1, H_KH.length).setValues([[
      "'" + sdt, c.name || cu[1], tinh || cu[2], xa || cu[3], chiTiet || cu[4], c.email || cu[5],
      ct.tong, ct.soDon, h.label, ct.ganNhat, cu[10] || new Date(), cu[11] || ''
    ]]);
  } else {
    s.appendRow(["'" + sdt, c.name || '', tinh, xa, chiTiet, c.email || '', ct.tong, ct.soDon, h.label, ct.ganNhat, new Date(), '']);
  }
}

/* Chạy tay khi muốn tính lại toàn bộ tổng chi tiêu & hạng cho mọi khách */
function tinhLaiTatCaKhachHang() {
  var s = sheetKH(); var n = s.getLastRow(); if (n < 2) return;
  var v = s.getRange(2, 1, n - 1, H_KH.length).getValues();
  for (var i = 0; i < v.length; i++) {
    var sdt = chuanSdt(v[i][0]); if (!sdt) continue;
    var ct = tinhChiTieu(sdt); var h = hangTheoTien(ct.tong);
    s.getRange(i + 2, 7, 1, 4).setValues([[ct.tong, ct.soDon, h.label, ct.ganNhat]]);
  }
  SpreadsheetApp.flush();
}

/* ===================== OTP & PHIÊN ĐĂNG NHẬP ===================== */
function taoMaOtp() { return String(Math.floor(100000 + Math.random() * 900000)); }
function taoToken() { return Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 8); }

function luuOtp(sdt, ma, kenh) {
  var s = sheetOtp(); var n = s.getLastRow();
  var het = new Date(Date.now() + OTP_PHUT * 60000);
  if (n >= 2) {
    var v = s.getRange(2, 1, n - 1, 1).getValues();
    for (var i = 0; i < v.length; i++) if (chuanSdt(v[i][0]) === sdt) {
      s.getRange(i + 2, 1, 1, 6).setValues([["'" + sdt, ma, het, 0, new Date(), kenh]]); return;
    }
  }
  s.appendRow(["'" + sdt, ma, het, 0, new Date(), kenh]);
}
function kiemTraOtp(sdt, ma) {
  var s = sheetOtp(); var n = s.getLastRow(); if (n < 2) return { ok: false, msg: 'Mã đã hết hạn, mẹ bấm gửi lại mã nhé' };
  var v = s.getRange(2, 1, n - 1, 6).getValues();
  for (var i = 0; i < v.length; i++) {
    if (chuanSdt(v[i][0]) !== sdt) continue;
    var dong = i + 2;
    if (Number(v[i][3]) >= OTP_SAI_TOI_DA) return { ok: false, msg: 'Nhập sai quá nhiều lần, mẹ bấm gửi lại mã mới nhé' };
    if (new Date(v[i][2]).getTime() < Date.now()) return { ok: false, msg: 'Mã đã hết hạn, mẹ bấm gửi lại mã nhé' };
    if (String(v[i][1]) !== String(ma)) { s.getRange(dong, 4).setValue(Number(v[i][3]) + 1); return { ok: false, msg: 'Mã OTP không đúng' }; }
    s.getRange(dong, 2, 1, 3).setValues([['', new Date(0), OTP_SAI_TOI_DA]]);  // dùng 1 lần rồi huỷ
    return { ok: true };
  }
  return { ok: false, msg: 'Mẹ bấm gửi mã OTP trước nhé' };
}
function luuPhien(sdt) {
  var token = taoToken();
  sheetPhien().appendRow([token, "'" + sdt, new Date(Date.now() + PHIEN_NGAY * 864e5), new Date()]);
  return token;
}
function sdtTheoToken(token) {
  if (!token) return '';
  var s = sheetPhien(); var n = s.getLastRow(); if (n < 2) return '';
  var v = s.getRange(2, 1, n - 1, 3).getValues();
  for (var i = 0; i < v.length; i++) {
    if (String(v[i][0]) !== String(token)) continue;
    if (new Date(v[i][2]).getTime() < Date.now()) return '';
    return chuanSdt(v[i][1]);
  }
  return '';
}
/* Dọn mã OTP & phiên hết hạn – nên đặt trigger chạy mỗi ngày */
function donRacOtp() {
  [[sheetOtp(), 3], [sheetPhien(), 3]].forEach(function (x) {
    var s = x[0], cot = x[1], n = s.getLastRow(); if (n < 2) return;
    var v = s.getRange(2, cot, n - 1, 1).getValues();
    for (var i = v.length - 1; i >= 0; i--) if (v[i][0] && new Date(v[i][0]).getTime() < Date.now() - 864e5) s.deleteRow(i + 2);
  });
}

/* Gửi mã OTP: ưu tiên SMS → email khách → báo về shop để shop nhắn tay */
function guiMaOtp(sdt, ma, emailKhach) {
  var noiDung = 'Ma xac thuc ' + TEN_SHOP + ' cua ban la ' + ma + '. Ma co hieu luc ' + OTP_PHUT + ' phut. Khong chia se ma nay cho bat ky ai.';
  if (SMS_API_KEY && SMS_SECRET_KEY) {
    try {
      var url = 'https://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_get'
        + '?Phone=' + encodeURIComponent(sdt) + '&Content=' + encodeURIComponent(noiDung)
        + '&ApiKey=' + encodeURIComponent(SMS_API_KEY) + '&SecretKey=' + encodeURIComponent(SMS_SECRET_KEY)
        + '&SmsType=2' + (SMS_BRANDNAME ? '&Brandname=' + encodeURIComponent(SMS_BRANDNAME) : '');
      var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      var kq = JSON.parse(res.getContentText());
      if (String(kq.CodeResult) === '100') return { kenh: 'sms' };
      Logger.log('SMS lỗi: ' + res.getContentText());
    } catch (err) { Logger.log('SMS lỗi: ' + err); }
  }
  if (emailKhach) {
    try {
      MailApp.sendEmail(emailKhach, 'Mã xác thực ' + TEN_SHOP + ': ' + ma,
        'Mã xác thực của bạn là ' + ma + '.\nMã có hiệu lực ' + OTP_PHUT + ' phút.\nNếu không phải bạn yêu cầu, vui lòng bỏ qua email này.');
      return { kenh: 'email', emailAn: anEmail(emailKhach) };
    } catch (err) { Logger.log('Email OTP lỗi: ' + err); }
  }
  var bao = '🔐 Khách ' + sdt + ' xin mã OTP: ' + ma + ' (hiệu lực ' + OTP_PHUT + ' phút).\nShop nhắn mã này cho khách qua Zalo/SMS giúp nhé.';
  try { zaloBotGuiTin(bao); } catch (err) { Logger.log(err); }
  if (EMAIL) { try { MailApp.sendEmail(EMAIL, '🔐 Mã OTP cho khách ' + sdt, bao); } catch (err) { Logger.log(err); } }
  return { kenh: 'shop' };
}

/* ===================== API CHO WEBSITE (JSONP) ===================== */
function traVe(data, callback) {
  var json = JSON.stringify(data);
  if (callback && /^[A-Za-z_$][\w$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  var cb = p.callback || '';
  var action = p.action || '';
  try {
    if (action === 'kiemTra')  return traVe(apiKiemTra(p), cb);
    if (action === 'guiOtp')   return traVe(apiGuiOtp(p), cb);
    if (action === 'xacThuc')  return traVe(apiXacThuc(p), cb);
    if (action === 'hoSo')     return traVe(apiHoSo(p), cb);
    if (action === 'capNhat')  return traVe(apiCapNhat(p), cb);
    if (action === 'dangNhap') return traVe(apiDangNhap(p), cb);
    if (action === 'doiMatKhau') return traVe(apiDoiMatKhau(p), cb);
    return traVe({ ok: true, ten: TEN_SHOP, msg: 'Máy chủ nhận đơn đang chạy.' }, cb);
  } catch (err) {
    Logger.log('doGet lỗi: ' + err);
    return traVe({ ok: false, msg: 'Máy chủ đang bận, mẹ thử lại sau ít phút nhé' }, cb);
  }
}

/* Tra theo số điện thoại (KHÔNG cần OTP – theo yêu cầu shop 30/09/2026): trả tên, địa chỉ đã lưu và HẠNG
   để web tự điền. KHÔNG trả email, số tiền đã chi, lịch sử đơn – các thứ đó chỉ trả sau khi đăng nhập / OTP. */
function apiKiemTra(p) {
  var sdt = chuanSdt(p.sdt);
  if (!sdtHopLe(sdt)) return { ok: false, msg: 'Số điện thoại chưa đúng' };
  var d = docKH(sdt);   // Sheet + CRM
  var co = !!d.dong || !!d.kh.ten || Number(d.kh.soDon) > 0;
  if (!co) return { ok: true, coTaiKhoan: false };
  return { ok: true, coTaiKhoan: true, tenAn: anTen(d.kh.ten), ten: d.kh.ten || '', hang: d.kh.hang,
           tinh: d.kh.tinh || '', xa: d.kh.xa || '', diaChi: d.kh.diaChi || '' };
}

/* ===================== TÀI KHOẢN: SĐT + MẬT KHẨU =====================
   Khách đã mua (có trong Sheet hoặc CRM) đăng nhập bằng số điện thoại, mật khẩu mặc định MK_MAC_DINH.
   Đổi mật khẩu → lưu dạng mã hoá (SHA-256 + muối) ở sheet "Tài khoản", không lưu mật khẩu thật. */
var MK_MAC_DINH = '1';
var SHEET_TK = 'Tài khoản';
function sheetTK() { return sheetPhu(SHEET_TK, ['Điện thoại', 'Mật khẩu (mã hoá)', 'Muối', 'Cập nhật']); }
function bamMk(mk, muoi) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, muoi + '|' + String(mk), Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}
function timTK(sdt) {
  var s = sheetTK(); var n = s.getLastRow(); if (n < 2) return null;
  var v = s.getRange(2, 1, n - 1, 3).getValues();
  for (var i = 0; i < v.length; i++) if (chuanSdt(v[i][0]) === sdt) return { dong: i + 2, hash: String(v[i][1] || ''), muoi: String(v[i][2] || '') };
  return null;
}
function apiDangNhap(p) {
  var sdt = chuanSdt(p.sdt);
  if (!sdtHopLe(sdt)) return { ok: false, msg: 'Số điện thoại chưa đúng' };
  var cache = CacheService.getScriptCache(); var k = 'dn_' + sdt; var dem = Number(cache.get(k) || 0);
  if (dem >= 10) return { ok: false, msg: 'Mẹ nhập sai nhiều lần, thử lại sau 1 giờ hoặc gọi hotline ' + HOTLINE + ' nhé' };
  var d = docKH(sdt);
  var co = !!d.dong || !!d.kh.ten || Number(d.kh.soDon) > 0;
  if (!co) return { ok: false, chuaMua: true, msg: 'Số này chưa mua hàng tại shop. Mẹ cứ đặt hàng không cần đăng nhập nhé, lần sau đăng nhập bằng mật khẩu ' + MK_MAC_DINH };
  var tk = timTK(sdt); var dung = tk && tk.hash ? bamMk(p.mk, tk.muoi) === tk.hash : String(p.mk) === MK_MAC_DINH;
  if (!dung) { cache.put(k, String(dem + 1), 3600); return { ok: false, msg: tk && tk.hash ? 'Mật khẩu chưa đúng. Quên mật khẩu thì bấm nhận mã OTP nhé' : 'Mật khẩu chưa đúng (mật khẩu mặc định là ' + MK_MAC_DINH + ')' }; }
  cache.remove(k);
  if (!d.dong) capNhatKhachHang(sdt, { name: d.kh.ten || '', phone: sdt, tinh: d.kh.tinh, xa: d.kh.xa, diaChi: d.kh.diaChi, email: d.kh.email }, {});
  var token = luuPhien(sdt);
  return { ok: true, token: token, kh: d.kh, donHang: d.don, macDinh: !(tk && tk.hash) };
}
function apiDoiMatKhau(p) {
  var sdt = sdtTheoToken(p.token);
  if (!sdt) return { ok: false, loi: 'token', msg: 'Phiên đã hết hạn, mẹ đăng nhập lại nhé' };
  var mk = String(p.mkMoi || '');
  if (mk.length < 4) return { ok: false, msg: 'Mật khẩu mới cần ít nhất 4 ký tự' };
  if (mk === MK_MAC_DINH) return { ok: false, msg: 'Mẹ chọn mật khẩu khác mật khẩu mặc định nhé' };
  var muoi = Utilities.getUuid(); var hang = ["'" + sdt, bamMk(mk, muoi), muoi, new Date()];
  var tk = timTK(sdt); var s = sheetTK();
  if (tk) s.getRange(tk.dong, 1, 1, 4).setValues([hang]); else s.appendRow(hang);
  return { ok: true };
}

function apiGuiOtp(p) {
  var sdt = chuanSdt(p.sdt);
  if (!sdtHopLe(sdt)) return { ok: false, msg: 'Số điện thoại chưa đúng' };
  var cache = CacheService.getScriptCache();
  var k = 'otp_' + sdt;
  var dem = Number(cache.get(k) || 0);
  if (dem >= OTP_MOI_GIO) return { ok: false, msg: 'Mẹ đã xin mã quá nhiều lần, thử lại sau 1 giờ hoặc gọi hotline ' + HOTLINE + ' nhé' };
  cache.put(k, String(dem + 1), 3600);

  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (err) { return { ok: false, msg: 'Máy chủ đang bận, mẹ thử lại sau vài giây' }; }
  try {
    var ma = taoMaOtp();
    var dong = timDongKH(sdt);
    var emailKhach = dong ? String(sheetKH().getRange(dong, 6).getValue() || '') : '';
    var gui = guiMaOtp(sdt, ma, emailKhach);
    luuOtp(sdt, ma, gui.kenh);
    return { ok: true, kenh: gui.kenh, emailAn: gui.emailAn || '', hetHanGiay: OTP_PHUT * 60 };
  } finally { lock.releaseLock(); }
}

function apiXacThuc(p) {
  var sdt = chuanSdt(p.sdt);
  if (!sdtHopLe(sdt)) return { ok: false, msg: 'Số điện thoại chưa đúng' };
  var kq = kiemTraOtp(sdt, String(p.ma || '').replace(/\D/g, ''));
  if (!kq.ok) return { ok: false, msg: kq.msg };
  var d = docKH(sdt);
  if (!d.dong) capNhatKhachHang(sdt, { name: d.kh.ten || '', phone: sdt, tinh: d.kh.tinh, xa: d.kh.xa, diaChi: d.kh.diaChi, email: d.kh.email }, {});   // khách mới trên web: tạo hồ sơ (lấy sẵn tên/địa chỉ từ CRM nếu có)
  var token = luuPhien(sdt);
  return { ok: true, token: token, kh: d.kh, donHang: d.don };
}

function apiHoSo(p) {
  var sdt = sdtTheoToken(p.token);
  if (!sdt) return { ok: false, loi: 'token', msg: 'Phiên đã hết hạn, mẹ xác thực lại nhé' };
  var d = docKH(sdt);
  return { ok: true, kh: d.kh, donHang: d.don };
}

function apiCapNhat(p) {
  var sdt = sdtTheoToken(p.token);
  if (!sdt) return { ok: false, loi: 'token', msg: 'Phiên đã hết hạn, mẹ xác thực lại nhé' };
  var s = sheetKH(); var dong = timDongKH(sdt);
  var cat = function (v, n) { return String(v || '').slice(0, n); };
  if (!dong) { s.appendRow(["'" + sdt, '', '', '', '', '', 0, 0, HANG[0].label, '', new Date(), '']); dong = s.getLastRow(); }
  var cu = s.getRange(dong, 1, 1, H_KH.length).getValues()[0];
  s.getRange(dong, 2, 1, 5).setValues([[
    cat(p.ten || cu[1], 80), cat(p.tinh || '', 60), cat(p.xa || '', 80), cat(p.diaChi || '', 200), cat(p.email || '', 100)
  ]]);
  var d = docKH(sdt);
  return { ok: true, kh: d.kh, donHang: d.don };
}

/* ===================== BOT ZALO ===================== */
var ZALO_BOT_API = 'https://bot-api.zapps.me/bot';
function zaloBotGoi(method, payload) {
  if (!ZALO_BOT_TOKEN) return '';
  var res = UrlFetchApp.fetch(ZALO_BOT_API + ZALO_BOT_TOKEN + '/' + method, {
    method: 'post', muteHttpExceptions: true, contentType: 'application/json',
    payload: JSON.stringify(payload || {})
  });
  return res.getContentText();
}
function zaloBotChatId() {
  return ZALO_BOT_CHAT_ID || PropertiesService.getScriptProperties().getProperty('ZALO_BOT_CHAT_ID') || '';
}
function zaloBotGuiTin(text) {
  var chat = zaloBotChatId();
  if (!ZALO_BOT_TOKEN || !chat) return;
  Logger.log('Zalo bot: ' + zaloBotGoi('sendMessage', { chat_id: chat, text: text }));
}
/* Nhắn cho bot 1 tin bất kỳ rồi chạy hàm này để lấy & lưu chat id */
function zaloBotLayChatId() {
  for (var i = 0; i < 3; i++) {
    var raw = zaloBotGoi('getUpdates', { timeout: 20 });
    Logger.log('getUpdates: ' + raw);
    try {
      var data = JSON.parse(raw);
      var list = (data && data.result) || [];
      for (var j = 0; j < list.length; j++) {
        var m = list[j].message || (list[j].event_name ? list[j].message : null);
        if (m && m.chat && m.chat.id) {
          PropertiesService.getScriptProperties().setProperty('ZALO_BOT_CHAT_ID', String(m.chat.id));
          Logger.log('✅ Đã lưu ZALO_BOT_CHAT_ID: ' + m.chat.id);
          return String(m.chat.id);
        }
      }
    } catch (err) { Logger.log('Lỗi đọc getUpdates: ' + err); }
    Utilities.sleep(2000);
  }
  Logger.log('⚠️ Chưa thấy tin nhắn nào. Hãy nhắn cho bot 1 tin rồi chạy lại hàm này.');
  return '';
}
function zaloBotThuGuiTin() { zaloBotGuiTin('✅ Bot đã kết nối với web ' + TEN_SHOP + '.'); }
function zaloBotXemChatId() { Logger.log('ZALO_BOT_CHAT_ID hiện tại: ' + (zaloBotChatId() || '(chưa có)')); }

/* ===================== CHẠY THỬ ===================== */
function testDonHang() {
  doPost({ postData: { contents: JSON.stringify({
    type: 'checkout', code: 'HCK-TEST', customer: { name: 'Khách thử', phone: '0900000000', address: 'Số 1, Phường Ba Đình, Hà Nội', tinh: 'Hà Nội', xa: 'Phường Ba Đình', diaChi: 'Số 1' },
    items: [{ short: 'Sản phẩm thử', qty: 1 }], subtotal: 100000, discount: 0, ship: 0, total: 100000, payment: 'cod',
    qua: { soQua: 5, ten: 'gói nước ép Lotte', moTa: '5 gói nước ép Lotte (Hồng – Tăng cân tự nhiên)' }
  }) } });
}
function testGuiOtp() { Logger.log(JSON.stringify(apiGuiOtp({ sdt: '0900000000' }))); }
