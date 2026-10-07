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
var WEB = 'https://huongchatkids.vn';
var ZALO_LINK = 'https://zalo.me/0967233003';
var GUI_EMAIL_CHO_KHACH = true;   // false = tắt email xác nhận đơn gửi cho khách

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
function sheetPhien() { return sheetPhu(SHEET_PHIEN, ['Token', 'Điện thoại', 'Hết hạn', 'Tạo lúc', 'Kiểu']); }

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

    // Lượt truy cập web gửi lên (không phải đơn hàng)
    if (order && order.type === 'track') { if (demGioiHan('gh_track', 3000, 600)) ghiTruyCap(order); return ContentService.createTextOutput('ok'); }

    // Tin nhắn Zalo OA gửi tới (nếu có) – chỉ lưu lại user id
    if (order && order.event_name && order.sender && order.sender.id) {
      PropertiesService.getScriptProperties().setProperty('ZALO_USER_ID', String(order.sender.id));
      return ContentService.createTextOutput(JSON.stringify({ ok: true, zalo: true })).setMimeType(ContentService.MimeType.JSON);
    }

    var c = order.customer || {};
    var sdt = chuanSdt(c.phone);
    /* C2 – chống spam đơn ảo: tối đa 8 đơn / số / 10 phút và 150 đơn / 10 phút toàn shop */
    if (!demGioiHan('gh_don', 150, 600) || (sdt && !demGioiHan('gh_don_' + sdt, 8, 600))) {
      canhBao_('tan-suat-don', '⚠️ Có quá nhiều đơn gửi lên trong 10 phút (có thể bot spam đơn ảo). Đơn vượt giới hạn đã bị chặn – kiểm tra bảng Đơn hàng.');
      return ContentService.createTextOutput(JSON.stringify({ ok: false, code: 'RATE_LIMITED', msg: 'Hệ thống đang bận, mẹ gọi hotline ' + HOTLINE + ' để đặt hàng nhé' })).setMimeType(ContentService.MimeType.JSON);
    }
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
    // Email xác nhận đơn gửi cho khách hàng
    if (GUI_EMAIL_CHO_KHACH && order.type !== 'callback' && emailHopLe(c.email)) {
      try { guiEmailXacNhan(order, c, items, thanhToan, quaText); } catch (err3) { Logger.log('Email khách lỗi: ' + err3); }
    }

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

function emailHopLe(v) { return /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(String(v || '').trim()); }

/* Email xác nhận đơn gửi cho khách hàng */
function guiEmailXacNhan(order, c, items, thanhToan, quaText) {
  var dong = function (nhan, gt, dam) {
    return '<tr><td style="padding:6px 0;color:#6B7280;font-size:14px">' + nhan + '</td>'
      + '<td style="padding:6px 0;text-align:right;font-size:14px' + (dam ? ';font-weight:700;color:#F0537A' : '') + '">' + gt + '</td></tr>';
  };
  var sp = String(items || '').split('\n').filter(String).map(function (x) {
    return '<li style="margin:4px 0">' + x + '</li>';
  }).join('');
  var ck = '';
  if (order.payment === 'bank') {
    ck = '<div style="margin:16px 0;padding:14px;border:1px solid #F8B8C8;border-radius:12px;background:#FFF4F7">'
      + '<b style="font-size:15px">Thông tin chuyển khoản</b>'
      + '<div style="font-size:14px;margin-top:6px;line-height:1.7">'
      + 'Ngân hàng: <b>BIDV</b><br>Số tài khoản: <b>8855349222</b><br>Chủ tài khoản: <b>DO VAN HOANG</b><br>'
      + 'Số tiền: <b>' + tien(order.total) + '</b><br>Nội dung: <b>' + (order.code || '') + '</b></div>'
      + '<div style="font-size:13px;color:#6B7280;margin-top:8px">Đơn được gửi đi ngay khi shop nhận được chuyển khoản.</div></div>';
  }
  var html = '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1F2937">'
    + '<div style="background:#F0537A;color:#fff;padding:20px 24px;border-radius:14px 14px 0 0">'
    + '<div style="font-size:20px;font-weight:700">' + TEN_SHOP + '</div>'
    + '<div style="font-size:14px;opacity:.92">Mẹ nào cũng là siêu nhân</div></div>'
    + '<div style="border:1px solid #ECEFF3;border-top:0;border-radius:0 0 14px 14px;padding:24px">'
    + '<h2 style="margin:0 0 6px;font-size:19px">Cảm ơn ' + (c.name || 'mẹ') + ' đã đặt hàng! 💗</h2>'
    + '<p style="margin:0 0 16px;font-size:14px;color:#6B7280">Đơn hàng <b style="color:#1F2937">' + (order.code || '') + '</b> đã được tiếp nhận. '
    + 'Chuyên gia dinh dưỡng sẽ gọi số <b style="color:#1F2937">' + (c.phone || '') + '</b> để xác nhận trong giờ làm việc.</p>'
    + '<b style="font-size:15px">Sản phẩm</b><ul style="font-size:14px;padding-left:20px;margin:8px 0 16px">' + sp + '</ul>'
    + (quaText ? '<div style="margin:0 0 16px;padding:12px 14px;border-radius:12px;background:#FFF9EC;border:1px solid #F6DFA8;font-size:14px">🎁 <b>Quà tặng kèm:</b> ' + quaText + '</div>' : '')
    + '<table style="width:100%;border-collapse:collapse;border-top:1px solid #ECEFF3;margin-top:8px">'
    + dong('Tiền hàng', tien(order.subtotal))
    + (order.discount ? dong('Giảm giá', '− ' + tien(order.discount)) : '')
    + dong('Phí vận chuyển', order.ship ? tien(order.ship) : 'Miễn phí')
    + dong('Tổng cộng', tien(order.total), true)
    + '</table>'
    + '<div style="margin-top:16px;font-size:14px;line-height:1.7">'
    + '<b>Giao tới:</b> ' + (c.address || '') + '<br>'
    + '<b>Thanh toán:</b> ' + (thanhToan === 'Chuyển khoản' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)') + '</div>'
    + ck
    + '<div style="margin-top:20px;padding-top:16px;border-top:1px solid #ECEFF3;font-size:13px;color:#6B7280;line-height:1.8">'
    + 'Cần hỗ trợ, mẹ gọi <b style="color:#1F2937">' + HOTLINE + '</b> hoặc nhắn <a href="' + ZALO_LINK + '" style="color:#0068FF">Zalo</a>.<br>'
    + 'Xem lại đơn, hạng và ưu đãi tại <a href="' + WEB + '/account.html" style="color:#F0537A">' + WEB + '/account.html</a><br>'
    + 'Email này được gửi tự động, mẹ không cần trả lời.</div></div></div>';

  MailApp.sendEmail({ to: String(c.email).trim(), subject: 'Xác nhận đơn hàng ' + (order.code || '') + ' – ' + TEN_SHOP,
    htmlBody: html, name: TEN_SHOP, replyTo: EMAIL });
}

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
/* kieu: 'otp' | 'mk' (mật khẩu riêng) | 'mkMacDinh' – dùng điểm chỉ cho phép phiên otp / mk */
function luuPhien(sdt, kieu) {
  var token = taoToken();
  sheetPhien().appendRow([token, "'" + sdt, new Date(Date.now() + PHIEN_NGAY * 864e5), new Date(), kieu || '']);
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

/* ===================== GIỚI THIỆU BẠN BÈ + VÍ ĐIỂM =====================
   Mã giới thiệu = số điện thoại của khách. Người mới nhập mã → giảm X% đơn đầu (mặc định 5%).
   Đơn đó GIAO THÀNH CÔNG (theo trạng thái CRM) → người giới thiệu được cộng Y% giá trị hàng thành điểm (mặc định 5%).
   1 điểm = giaTriDiem đồng (mặc định 1đ), dùng để trừ thẳng vào tiền hàng khi thanh toán (không trừ phí ship).

   Lưu trữ (Google Sheet):
   - "Giới thiệu"        : mỗi người được giới thiệu đúng 1 dòng (không đổi người giới thiệu sau khi đã liên kết).
   - "Điểm - Giao dịch"  : sổ cái điểm, chỉ thêm không xoá. Số dư = tổng cột Điểm. Cột Khoá chống ghi trùng
                           (VD EARN:HCK2610071234 – gọi lại bao nhiêu lần cũng chỉ cộng 1 lần).
   - "Điểm - Giữ chỗ"    : mỗi đơn có dùng điểm / giảm giới thiệu có 1 mã giữ chỗ. Đang giữ → Đã dùng / Đã trả lại / Đã hoàn điểm.
   - Cấu hình            : Thuộc tính tập lệnh GT_CAU_HINH (sửa ở trang quản trị, không sửa code).
   Mọi thao tác ghi điểm chạy trong khoá tập lệnh (LockService) → 2 yêu cầu cùng lúc không dùng trùng điểm. */
var SHEET_GT = 'Giới thiệu';
var H_GT = ['Người được GT', 'Người GT', 'Tạo lúc', 'Nguồn', 'Trạng thái', 'Mã đơn', 'Mã giữ chỗ', 'Tiền giảm', '% giảm',
            '% thưởng', 'Giá trị tính thưởng', 'Điểm thưởng', 'Cập nhật', 'Ghi chú'];
var SHEET_DG = 'Điểm - Giao dịch';
var H_DG = ['Thời gian', 'Mã GD', 'Điện thoại', 'Loại', 'Điểm', 'Số dư trước', 'Số dư sau', 'Loại tham chiếu', 'Mã tham chiếu',
            'Nội dung', 'Người tạo', 'Khoá'];
var SHEET_GC = 'Điểm - Giữ chỗ';
var H_GC = ['Mã giữ chỗ', 'Điện thoại', 'Mã đơn', 'Điểm', 'Trạng thái', 'Tạo lúc', 'Xử lý lúc', 'Người GT', 'Giảm GT',
            'Giá trị tính GT', '% giảm', '% thưởng', 'Tổng đơn', 'Ghi chú'];
var GT = { LIEN_KET: 'Đã liên kết', CHO_GIAO: 'Chờ giao', DA_THUONG: 'Đã thưởng', THU_HOI: 'Đã thu hồi' };
var GC = { GIU: 'Đang giữ', DUNG: 'Đã dùng', TRA: 'Đã trả lại', HOAN: 'Đã hoàn điểm' };
var GT_MAC_DINH = {
  bat: true,            // bật chương trình giới thiệu
  giam: 5,              // % giảm cho người được giới thiệu (đơn đầu)
  thuong: 5,            // % giá trị đơn thưởng cho người giới thiệu (thành điểm)
  giaTriDiem: 1,        // 1 điểm = bao nhiêu đồng
  donToiThieu: 0,       // giá trị hàng tối thiểu để được giảm giới thiệu
  canXacThuc: false,    // true = người mới phải xác thực OTP mới được giảm giới thiệu
  giuChoGio: 72,        // giữ điểm tối đa bao nhiêu giờ nếu CRM chưa thấy đơn
  theoDoiNgay: 60,      // theo dõi hoàn hàng bao nhiêu ngày sau khi thưởng / dùng điểm
  noiDungChiaSe: 'Mua sắm tại Hương Chất Kids và nhận ưu đãi {giam}% cho đơn hàng đầu tiên. Dùng mã giới thiệu của mình: {ma} {link}'
};

function sheetGT() { return sheetPhu(SHEET_GT, H_GT); }
function sheetDG() { return sheetPhu(SHEET_DG, H_DG); }
function sheetGC() { return sheetPhu(SHEET_GC, H_GC); }
function anSdt(s) { s = chuanSdt(s); return s.length >= 9 ? s.slice(0, 2) + '****' + s.slice(-2) : s; }
function soNguyen(v) { var n = Math.round(Number(v) || 0); return isFinite(n) ? n : 0; }

function gtCauHinh() {
  var c = {}; try { c = JSON.parse(PropertiesService.getScriptProperties().getProperty('GT_CAU_HINH') || '{}'); } catch (e) { c = {}; }
  var kq = {}; for (var k in GT_MAC_DINH) kq[k] = c[k] != null ? c[k] : GT_MAC_DINH[k];
  return kq;
}
/* Chạy trong khoá tập lệnh; flush trước khi nhả khoá để lần gọi sau đọc được dữ liệu mới */
function voiKhoa(fn) {
  var lock = LockService.getScriptLock();
  try { lock.waitLock(20000); } catch (e) { return { ok: false, code: 'BUSY', msg: 'Máy chủ đang bận, mẹ thử lại sau vài giây nhé' }; }
  try { return fn(); } finally { try { SpreadsheetApp.flush(); } catch (e2) {} lock.releaseLock(); }
}
function gtLoi(code, msg) { return { ok: false, valid: false, code: code, message: msg, msg: msg }; }

/* ---------- Phiên khách: biết phiên đến từ OTP / mật khẩu riêng (mạnh) hay mật khẩu mặc định (yếu) ---------- */
function phienKhach(token) {
  if (!token) return null;
  var s = sheetPhien(); var n = s.getLastRow(); if (n < 2) return null;
  var v = s.getRange(2, 1, n - 1, 5).getValues();
  for (var i = v.length - 1; i >= 0; i--) {
    if (String(v[i][0]) !== String(token)) continue;
    if (new Date(v[i][2]).getTime() < Date.now()) return null;
    var kieu = String(v[i][4] || '');
    return { sdt: chuanSdt(v[i][1]), kieu: kieu, manh: kieu === 'otp' || kieu === 'mk', dong: i + 2 };
  }
  return null;
}

/* ---------- Sổ điểm ---------- */
function docSoDiem() {
  var s = sheetDG(); var n = s.getLastRow();
  return n < 2 ? [] : s.getRange(2, 1, n - 1, H_DG.length).getValues();
}
function docGiuCho() {
  var s = sheetGC(); var n = s.getLastRow();
  return n < 2 ? [] : s.getRange(2, 1, n - 1, H_GC.length).getValues();
}
/* Số dư của 1 khách: tổng sổ cái; đang giữ = điểm của các mã giữ chỗ chưa xử lý */
function viDiem(sdt, so, gc) {
  so = so || docSoDiem(); gc = gc || docGiuCho();
  var kq = { soDu: 0, tongNhan: 0, tongDung: 0, dangGiu: 0, soGD: 0, ganNhat: null };
  so.forEach(function (r) {
    if (chuanSdt(r[2]) !== sdt) return;
    var d = soNguyen(r[4]); kq.soDu += d; kq.soGD++;
    if (r[3] === 'EARN' || (r[3] === 'ADJUSTMENT' && d > 0)) kq.tongNhan += d;
    if (r[3] === 'SPEND') kq.tongDung += -d;
    if (r[3] === 'REFUND') kq.tongDung -= d;
    kq.ganNhat = r[0];
  });
  gc.forEach(function (r) { if (chuanSdt(r[1]) === sdt && r[4] === GC.GIU) kq.dangGiu += soNguyen(r[3]); });
  kq.khaDung = Math.max(0, kq.soDu - kq.dangGiu);
  return kq;
}
/* Ghi 1 giao dịch điểm (PHẢI gọi trong voiKhoa). khoa trùng → không ghi, trả trung:true. Không bao giờ để số dư âm. */
function ghiDiem(sdt, loai, diem, refLoai, refMa, noiDung, nguoiTao, khoa) {
  diem = soNguyen(diem); if (!diem) return { ok: true, khongDoi: true };
  var so = docSoDiem();
  if (khoa) for (var i = 0; i < so.length; i++) if (String(so[i][11]) === String(khoa)) return { ok: true, trung: true };
  var truoc = viDiem(sdt, so, []).soDu;
  if (truoc + diem < 0) return { ok: false, code: 'INSUFFICIENT', msg: 'Số điểm vượt quá số dư (' + truoc + ' điểm)' };
  var ma = 'GD' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyMMddHHmmss') + Math.floor(Math.random() * 90 + 10);
  sheetDG().appendRow([new Date(), ma, "'" + sdt, loai, diem, truoc, truoc + diem, refLoai || '', refMa || '', noiDung || '', nguoiTao || 'hệ thống', khoa || '']);
  return { ok: true, ma: ma, soDu: truoc + diem };
}

/* ---------- Quan hệ giới thiệu ---------- */
function gtTimDong(sdt) {
  var s = sheetGT(); var n = s.getLastRow(); if (n < 2) return null;
  var v = s.getRange(2, 1, n - 1, H_GT.length).getValues();
  for (var i = 0; i < v.length; i++) if (chuanSdt(v[i][0]) === sdt) return { dong: i + 2, v: v[i] };
  return null;
}
function khachBiKhoa(sdt) {
  var dong = timDongKH(sdt); if (!dong) return false;
  return String(sheetKH().getRange(dong, 12).getValue() || '').indexOf('KHOA') > -1;
}
/* Kiểm tra mã giới thiệu (không ghi gì). sdt = số của người nhập mã (có thể trống khi chưa nhập) */
function gtXetMa(ref, sdt, cfg, maDon) {
  cfg = cfg || gtCauHinh();
  if (!cfg.bat) return gtLoi('REFERRAL_DISABLED', 'Chương trình giới thiệu đang tạm dừng.');
  ref = chuanSdt(ref); sdt = sdt ? chuanSdt(sdt) : '';
  if (!sdtHopLe(ref)) return gtLoi('INVALID_REFERRAL_CODE', 'Mã giới thiệu không hợp lệ. Mã là số điện thoại 10 số của người giới thiệu.');
  if (sdt && sdt === ref) return gtLoi('SELF_REFERRAL', 'Bạn không thể sử dụng mã giới thiệu của chính mình.');
  if (sdt) { var e = gtXetNguoiMoi(sdt, ref, maDon); if (e) return e; }
  var nguoi = docKH(ref);
  if (!(nguoi.dong || nguoi.kh.ten || Number(nguoi.kh.soDon) > 0)) return gtLoi('INVALID_REFERRAL_CODE', 'Mã giới thiệu không tồn tại: số này chưa là khách hàng của shop.');
  if (khachBiKhoa(ref)) return gtLoi('REFERRER_BLOCKED', 'Mã giới thiệu này đang bị khoá.');
  return { ok: true, valid: true, code: 'OK', tenAn: anTen(nguoi.kh.ten) || anSdt(ref), discountPercent: Number(cfg.giam),
    donToiThieu: Number(cfg.donToiThieu) || 0, message: 'Mã giới thiệu hợp lệ', msg: 'Mã giới thiệu hợp lệ' };
}
/* Người nhập mã có còn đủ điều kiện không: chưa có người giới thiệu khác, chưa dùng ưu đãi, chưa từng mua */
/* Phần kiểm tra chỉ dựa trên sheet "Giới thiệu" (nhanh, dùng được trong khoá) */
function gtXetDong(sdt, ref, maDon) {
  var r = gtTimDong(sdt);
  if (r) {
    var tt = String(r.v[4]);
    if (chuanSdt(r.v[1]) !== ref) return { r: r, loi: gtLoi('REFERRAL_ALREADY_USED', 'Số điện thoại này đã được liên kết với mã giới thiệu khác (' + anSdt(r.v[1]) + ').') };
    if (tt === GT.DA_THUONG || tt === GT.THU_HOI) return { r: r, loi: gtLoi('REFERRAL_ALREADY_USED', 'Ưu đãi giới thiệu chỉ dùng 1 lần cho đơn đầu tiên.') };
    if (tt === GT.CHO_GIAO && String(r.v[5]) !== String(maDon || '')) return { r: r, loi: gtLoi('REFERRAL_ALREADY_USED', 'Ưu đãi giới thiệu đã được dùng cho đơn ' + r.v[5] + ' đang chờ giao.') };
  }
  return { r: r, loi: null };
}
function gtXetNguoiMoi(sdt, ref, maDon) {
  var x = gtXetDong(sdt, ref, maDon); if (x.loi) return x.loi;
  if (x.r && String(x.r.v[4]) === GT.CHO_GIAO) return null;   // chính đơn đang giữ chỗ: CRM có thể đã thấy đơn này
  var kh = docKH(sdt);
  if (Number(kh.kh.soDon) > 0) return gtLoi('CUSTOMER_NOT_ELIGIBLE', 'Ưu đãi giới thiệu chỉ dành cho khách mới chưa từng mua hàng.');
  if (khachBiKhoa(sdt)) return gtLoi('CUSTOMER_NOT_ELIGIBLE', 'Tài khoản này đang bị khoá.');
  return null;
}
/* Tạo / cập nhật quan hệ giới thiệu (PHẢI gọi trong voiKhoa, sau khi đã gtXetMa) */
function gtLienKet(sdt, ref, nguon) {
  var r = gtTimDong(sdt);
  if (r) return r;
  sheetGT().appendRow(["'" + sdt, "'" + ref, new Date(), nguon || '', GT.LIEN_KET, '', '', 0, '', '', 0, 0, new Date(), '']);
  ghiNhatKy('Giới thiệu', sdt, 'Liên kết với người giới thiệu ' + ref + ' (' + (nguon || '') + ')');
  return gtTimDong(sdt);
}

/* ===================== API KHÁCH ===================== */
function apiGtCauHinh() {
  var c = gtCauHinh();
  return { ok: true, bat: !!c.bat, giam: Number(c.giam), thuong: Number(c.thuong), giaTriDiem: Number(c.giaTriDiem) || 1,
    donToiThieu: Number(c.donToiThieu) || 0, canXacThuc: !!c.canXacThuc, noiDungChiaSe: String(c.noiDungChiaSe || '') };
}
function apiGtKiemTra(p) {
  var cache = CacheService.getScriptCache(); var k = 'gtkt_' + chuanSdt(p.sdt || '') + '_' + chuanSdt(p.ref || '');
  var dem = Number(cache.get(k) || 0); if (dem >= 20) return gtLoi('RATE_LIMIT', 'Mẹ thử lại sau ít phút nhé');
  cache.put(k, String(dem + 1), 3600);
  return gtXetMa(p.ref, p.sdt);
}
/* Giữ chỗ ưu đãi khi bấm Đặt hàng: khoá quan hệ giới thiệu + giữ điểm. Gọi lại cùng mã đơn → tính lại (không giữ trùng).
   p: sdt, token, maDon, ref, dungGT ('1'), diem, giaTri (tiền hàng sau giảm sản phẩm), giamKhac (mã / hạng), tongDon */
function apiGtGiuCho(p) {
  var cfg = gtCauHinh(); var sdt = chuanSdt(p.sdt); var maDon = String(p.maDon || '').trim().slice(0, 30);
  if (!sdtHopLe(sdt)) return { ok: false, code: 'BAD_PHONE', msg: 'Số điện thoại chưa đúng' };
  if (!/^[A-Z0-9-]{6,30}$/i.test(maDon)) return { ok: false, code: 'BAD_ORDER', msg: 'Mã đơn không hợp lệ' };
  var giaTri = Math.max(0, soNguyen(p.giaTri)), giamKhac = Math.max(0, soNguyen(p.giamKhac)), tongDon = Math.max(0, soNguyen(p.tongDon));
  var muonDiem = Math.max(0, soNguyen(p.diem)), dungGT = String(p.dungGT) === '1';
  var ph = phienKhach(p.token); var cuaToi = ph && ph.sdt === sdt;
  var ref = '';
  if (dungGT) {   // đọc CRM bên ngoài khoá (chậm), trong khoá chỉ kiểm tra lại dữ liệu sheet
    var r0 = gtTimDong(sdt); ref = chuanSdt(p.ref || (r0 ? r0.v[1] : ''));
    if (!ref) return gtLoi('INVALID_REFERRAL_CODE', 'Mẹ nhập mã giới thiệu trước nhé');
    var xet = gtXetMa(ref, sdt, cfg, maDon); if (!xet.ok) return xet;
    if (cfg.canXacThuc && !cuaToi) return gtLoi('REQUIRE_OTP', 'Mẹ xác thực số điện thoại (mã OTP) để nhận ưu đãi giới thiệu nhé.');
    if (giaTri < (Number(cfg.donToiThieu) || 0)) return gtLoi('MIN_ORDER', 'Ưu đãi giới thiệu áp dụng cho đơn từ ' + tien(cfg.donToiThieu) + '.');
  }
  if (muonDiem > 0 && !(cuaToi && ph.manh)) return { ok: false, code: 'REQUIRE_AUTH', msg: 'Mẹ xác thực mã OTP (hoặc đăng nhập bằng mật khẩu riêng) để dùng điểm nhé.' };
  return voiKhoa(function () {
    var gcS = sheetGC(); var gc = docGiuCho(); var maGiu = '';
    /* Đơn này đã giữ chỗ trước đó (khách bấm lại) → trả chỗ cũ rồi tính lại */
    for (var i = 0; i < gc.length; i++) if (String(gc[i][2]) === maDon) {
      if (chuanSdt(gc[i][1]) !== sdt) return { ok: false, code: 'BAD_ORDER', msg: 'Mã đơn đã được dùng' };
      if (gc[i][4] === GC.DUNG || gc[i][4] === GC.HOAN) return { ok: false, code: 'ORDER_DONE', msg: 'Đơn này đã được xử lý' };
      if (gc[i][4] !== GC.GIU) continue;
      maGiu = String(gc[i][0]); gcS.getRange(i + 2, 5, 1, 3).setValues([[GC.TRA, gc[i][5], new Date()]]); gc[i][4] = GC.TRA;
    }
    /* Quan hệ giới thiệu đang gắn với đơn này (lần bấm trước) → trả về "Đã liên kết", tính lại bên dưới */
    var cu = gtTimDong(sdt);
    if (cu && String(cu.v[4]) === GT.CHO_GIAO && String(cu.v[5]) === maDon) sheetGT().getRange(cu.dong, 5, 1, 9).setValues([[GT.LIEN_KET, '', '', 0, '', '', 0, 0, new Date()]]);
    var giamGT = 0, phanTram = 0;
    if (dungGT) {
      var x = gtXetDong(sdt, ref, maDon); if (x.loi) return x.loi;   // kiểm tra lại trong khoá (2 tab cùng lúc)
      if (!x.r) gtLienKet(sdt, ref, 'Thanh toán');
      phanTram = Number(cfg.giam) || 0; giamGT = Math.round(giaTri * phanTram / 100);
    }
    var gtd = Number(cfg.giaTriDiem) || 1, diem = 0;
    if (muonDiem > 0) {
      var vi = viDiem(sdt, docSoDiem(), gc);
      var toiDa = Math.floor(Math.max(0, giaTri - giamGT - giamKhac) / gtd);
      diem = Math.max(0, Math.min(muonDiem, vi.khaDung, toiDa));
    }
    if (!giamGT && !diem) return { ok: true, maGiu: '', giamGT: 0, phanTram: 0, diem: 0, giamDiem: 0 };
    maGiu = maGiu || ('GC' + Utilities.getUuid().replace(/-/g, '').slice(0, 10).toUpperCase());
    gcS.appendRow([maGiu, "'" + sdt, maDon, diem, GC.GIU, new Date(), '', dungGT ? "'" + ref : '', giamGT, giaTri, phanTram,
      dungGT ? Number(cfg.thuong) || 0 : '', tongDon, '']);
    if (dungGT) {
      var rr = gtTimDong(sdt);
      sheetGT().getRange(rr.dong, 5, 1, 9).setValues([[GT.CHO_GIAO, maDon, maGiu, giamGT, phanTram, Number(cfg.thuong) || 0, giaTri, 0, new Date()]]);
      ghiNhatKy('Giới thiệu', sdt, 'Dùng ưu đãi giới thiệu ' + phanTram + '% (−' + tien(giamGT) + ') cho đơn ' + maDon + ', người giới thiệu ' + ref);
    }
    if (diem) ghiNhatKy('Điểm', sdt, 'Giữ ' + diem + ' điểm cho đơn ' + maDon + ' (' + maGiu + ')');
    return { ok: true, maGiu: maGiu, giamGT: giamGT, phanTram: phanTram, diem: diem, giamDiem: diem * gtd };
  });
}
/* Ví điểm của khách đang đăng nhập */
function apiDiemCuaToi(p) {
  var ph = phienKhach(p.token); if (!ph) return { ok: false, loi: 'token', msg: 'Phiên đã hết hạn, mẹ đăng nhập lại nhé' };
  var so = docSoDiem(), gc = docGiuCho(), cfg = gtCauHinh(); var vi = viDiem(ph.sdt, so, gc);
  var ls = [];
  for (var i = so.length - 1; i >= 0 && ls.length < 100; i--) if (chuanSdt(so[i][2]) === ph.sdt)
    ls.push({ ngay: ngayVN(so[i][0]), loai: String(so[i][3]), diem: soNguyen(so[i][4]), soDu: soNguyen(so[i][6]), noiDung: String(so[i][9] || ''), don: String(so[i][8] || '') });
  var giu = [];
  gc.forEach(function (r) { if (chuanSdt(r[1]) === ph.sdt && r[4] === GC.GIU && soNguyen(r[3])) giu.push({ maDon: String(r[2]), diem: soNguyen(r[3]), ngay: ngayVN(r[5]) }); });
  return { ok: true, sdt: ph.sdt, soDu: vi.soDu, dangGiu: vi.dangGiu, khaDung: vi.khaDung, tongNhan: vi.tongNhan, tongDung: vi.tongDung,
    tietKiem: vi.tongDung * (Number(cfg.giaTriDiem) || 1), giaTriDiem: Number(cfg.giaTriDiem) || 1, dungDuoc: ph.manh, lichSu: ls, giu: giu };
}
/* Bảng giới thiệu của khách đang đăng nhập (không lộ thông tin người được giới thiệu) */
function apiGtCuaToi(p) {
  var ph = phienKhach(p.token); if (!ph) return { ok: false, loi: 'token', msg: 'Phiên đã hết hạn, mẹ đăng nhập lại nhé' };
  var s = sheetGT(); var n = s.getLastRow(); var v = n < 2 ? [] : s.getRange(2, 1, n - 1, H_GT.length).getValues();
  var ds = [], daMua = 0, tongDiem = 0, cuaToi = null;
  v.forEach(function (r) {
    if (chuanSdt(r[0]) === ph.sdt) cuaToi = { nguoiGT: anSdt(r[1]), trangThai: String(r[4]) };
    if (chuanSdt(r[1]) !== ph.sdt) return;
    if (r[4] === GT.DA_THUONG) { daMua++; tongDiem += soNguyen(r[11]); }
    ds.push({ khach: anSdt(r[0]), ngay: ngayVN(r[2]), trangThai: String(r[4]), diem: soNguyen(r[11]) });
  });
  ds.reverse();
  return { ok: true, ma: ph.sdt, cauHinh: apiGtCauHinh(), soNguoi: ds.length, daMua: daMua, tongDiem: tongDiem, ds: ds.slice(0, 100), cuaToi: cuaToi };
}

/* ===================== XỬ LÝ NỀN: theo trạng thái đơn trong CRM =====================
   - Giữ chỗ "Đang giữ": CRM thấy đơn → trừ điểm (SPEND) "Đã dùng"; đơn huỷ / quá giuChoGio không thấy đơn → "Đã trả lại".
   - Giữ chỗ "Đã dùng": đơn huỷ / hoàn hàng (trong theoDoiNgay) → hoàn điểm (REFUND).
   - Giới thiệu "Chờ giao": đơn Đã giao → thưởng người giới thiệu (EARN, khoá EARN:<mã đơn>);
     đơn huỷ / không thấy đơn → quay lại "Đã liên kết" (khách vẫn dùng ưu đãi được ở đơn đầu tiếp theo).
   - Giới thiệu "Đã thưởng": hoàn hàng → thu hồi (REVERSE); CRM ghi tiền thấp hơn (hoàn 1 phần) → thu hồi phần chênh. */
function xuLyDiemGT() {
  var cfg = gtCauHinh(); var now = Date.now(); var kq = { ok: true, daDung: 0, traLai: 0, hoanDiem: 0, thuong: 0, thuHoi: 0, quayLai: 0, loi: [] };
  var gc = docGiuCho(); var sGT = sheetGT(); var nGT = sGT.getLastRow();
  var gt = nGT < 2 ? [] : sGT.getRange(2, 1, nGT - 1, H_GT.length).getValues();
  var theoDoi = (Number(cfg.theoDoiNgay) || 60) * 864e5;
  var canXem = {};
  gc.forEach(function (r) { if (r[4] === GC.GIU || (r[4] === GC.DUNG && now - new Date(r[6] || r[5]).getTime() < theoDoi)) canXem[chuanSdt(r[1])] = 1; });
  gt.forEach(function (r) { if (r[4] === GT.CHO_GIAO || (r[4] === GT.DA_THUONG && now - new Date(r[12]).getTime() < theoDoi)) canXem[chuanSdt(r[0])] = 1; });
  var ds = Object.keys(canXem); if (!ds.length) return kq;
  var crm = {};   // gọi CRM ngoài khoá
  ds.slice(0, 60).forEach(function (sdt) { try { crm[sdt] = crmKhachCache(sdt); } catch (e) { crm[sdt] = null; } });
  var donCRM = function (sdt, maDon, tong, ngay) {
    var c = crm[sdt]; if (!c || !c.ok) return undefined;     // undefined = chưa biết (CRM lỗi) → để lần sau
    var d = timDonCRM(c, maDon, tong, ngay); if (!d) return null;
    return { tt: ttTuCRM(d.trangThai), tien: Number(d.tien != null ? d.tien : d.tong) || 0, raw: String(d.trangThai || '') };
  };
  return voiKhoa(function () {
    var gcS = sheetGC(); gc = docGiuCho();
    for (var i = 0; i < gc.length; i++) {
      var r = gc[i], sdt = chuanSdt(r[1]); if (!(sdt in crm)) continue;
      var d = donCRM(sdt, r[2], r[12], r[5]); if (d === undefined) continue;
      var huy = d && (d.tt === 'Đã huỷ' || d.tt === 'Đã hoàn hàng');
      if (r[4] === GC.GIU) {
        if (d && !huy) {
          var w = soNguyen(r[3]) ? ghiDiem(sdt, 'SPEND', -soNguyen(r[3]), 'ORDER', r[2], 'Dùng điểm cho đơn ' + r[2], 'hệ thống', 'SPEND:' + r[0]) : { ok: true };
          if (!w.ok) { kq.loi.push(r[0] + ': ' + w.msg); gcS.getRange(i + 2, 14).setValue('Lỗi trừ điểm: ' + w.msg); continue; }
          gcS.getRange(i + 2, 5, 1, 3).setValues([[GC.DUNG, r[5], new Date()]]); kq.daDung++;
        } else if (huy || (!d && now - new Date(r[5]).getTime() > (Number(cfg.giuChoGio) || 72) * 3600e3)) {
          gcS.getRange(i + 2, 5, 1, 3).setValues([[GC.TRA, r[5], new Date()]]);
          gcS.getRange(i + 2, 14).setValue(huy ? 'Đơn huỷ trước khi xử lý' : 'Quá hạn, CRM chưa thấy đơn'); kq.traLai++;
        }
      } else if (r[4] === GC.DUNG && huy && soNguyen(r[3])) {
        var h = ghiDiem(sdt, 'REFUND', soNguyen(r[3]), 'ORDER', r[2], 'Hoàn điểm do đơn ' + r[2] + ' ' + d.tt.toLowerCase(), 'hệ thống', 'REFUND:' + r[0]);
        if (h.ok) { gcS.getRange(i + 2, 5, 1, 3).setValues([[GC.HOAN, r[5], new Date()]]); kq.hoanDiem++; }
      }
    }
    var gtS = sheetGT(); gt = gtS.getLastRow() < 2 ? [] : gtS.getRange(2, 1, gtS.getLastRow() - 1, H_GT.length).getValues();
    for (var j = 0; j < gt.length; j++) {
      var g = gt[j], nguoiMoi = chuanSdt(g[0]), ref = chuanSdt(g[1]); if (!(nguoiMoi in crm)) continue;
      if (g[4] !== GT.CHO_GIAO && g[4] !== GT.DA_THUONG) continue;
      var gcDong = null; for (var q = 0; q < gc.length; q++) if (String(gc[q][2]) === String(g[5]) && String(gc[q][0]) === String(g[6])) gcDong = gc[q];
      var tongDon = gcDong ? soNguyen(gcDong[12]) : 0;
      var dd = donCRM(nguoiMoi, g[5], tongDon, gcDong ? gcDong[5] : g[12]); if (dd === undefined) continue;
      var giaTri = soNguyen(g[10]), pt = Number(g[9]) || 0, gtd = Number(cfg.giaTriDiem) || 1;
      /* Giá trị tính thưởng thực tế: CRM ghi tổng thấp hơn tổng đơn lúc đặt quá 1.000đ (hoàn 1 phần) → trừ phần chênh */
      var thucTe = function () { return dd && tongDon && dd.tien && tongDon - dd.tien > 1000 ? Math.max(0, giaTri - (tongDon - dd.tien)) : giaTri; };
      if (g[4] === GT.CHO_GIAO) {
        if (dd && dd.tt === 'Đã giao') {
          var diem = Math.floor(thucTe() * pt / 100 / gtd);
          var e = ghiDiem(ref, 'EARN', diem, 'ORDER', g[5], 'Thưởng giới thiệu: đơn ' + g[5] + ' của khách ' + anSdt(nguoiMoi), 'hệ thống', 'EARN:' + g[5]);
          if (!e.ok) { kq.loi.push(g[5] + ': ' + e.msg); continue; }
          gtS.getRange(j + 2, 5).setValue(GT.DA_THUONG); gtS.getRange(j + 2, 12, 1, 2).setValues([[diem, new Date()]]); kq.thuong++;
          ghiNhatKy('Giới thiệu', ref, 'Cộng ' + diem + ' điểm thưởng giới thiệu (đơn ' + g[5] + ')');
          try { zaloBotGuiTin('⭐ Cộng ' + diem.toLocaleString('vi-VN') + ' điểm cho ' + ref + ' – giới thiệu khách ' + anSdt(nguoiMoi) + ' (đơn ' + g[5] + ' đã giao)'); } catch (z) { Logger.log(z); }
          try { var dk = timDongKH(ref); var mail = dk ? String(sheetKH().getRange(dk, 6).getValue() || '') : '';
            if (emailHopLe(mail)) MailApp.sendEmail(mail, '⭐ Bạn vừa nhận ' + diem.toLocaleString('vi-VN') + ' điểm từ ' + TEN_SHOP,
              'Bạn vừa nhận được ' + diem.toLocaleString('vi-VN') + ' điểm từ đơn hàng của người bạn đã giới thiệu.\n1 điểm = ' + gtd + 'đ, dùng để giảm giá khi đặt hàng tại ' + WEB + '\nXem ví điểm: ' + WEB + '/account.html#diem'); } catch (m) { Logger.log(m); }
        } else if ((dd && dd.tt === 'Đã huỷ') || (!dd && now - new Date(g[12]).getTime() > (Number(cfg.giuChoGio) || 72) * 3600e3)) {
          gtS.getRange(j + 2, 5, 1, 9).setValues([[GT.LIEN_KET, '', '', 0, '', '', 0, 0, new Date()]]);
          gtS.getRange(j + 2, 14).setValue('Đơn ' + g[5] + (dd ? ' huỷ trước khi giao' : ' không thấy trong CRM') + ' – ưu đãi được dùng lại');
          kq.quayLai++;
        }
      } else if (g[4] === GT.DA_THUONG && dd) {
        var daCong = soNguyen(g[11]);
        var dich = dd.tt === 'Đã hoàn hàng' || dd.tt === 'Đã huỷ' ? 0 : Math.floor(thucTe() * pt / 100 / gtd);
        if (dich < daCong) {
          var conLai = viDiem(ref, docSoDiem(), []).soDu; var tru = Math.min(daCong - dich, Math.max(0, conLai));
          var rv = tru ? ghiDiem(ref, 'REVERSE', -tru, 'ORDER', g[5], 'Thu hồi điểm thưởng: đơn ' + g[5] + (dich ? ' hoàn một phần' : ' ' + dd.tt.toLowerCase()), 'hệ thống', 'REVERSE:' + g[5] + ':' + dich) : { ok: true };
          if (!rv.ok) continue;
          gtS.getRange(j + 2, 12, 1, 2).setValues([[daCong - tru, new Date()]]);
          if (!dich) gtS.getRange(j + 2, 5).setValue(GT.THU_HOI);
          if (tru < daCong - dich) gtS.getRange(j + 2, 14).setValue('Chỉ thu hồi được ' + tru + '/' + (daCong - dich) + ' điểm (khách đã dùng bớt)');
          ghiNhatKy('Giới thiệu', ref, 'Thu hồi ' + tru + ' điểm thưởng (đơn ' + g[5] + ')'); kq.thuHoi++;
        }
      }
    }
    return kq;
  });
}

/* ===================== API QUẢN TRỊ ===================== */
function tenQT(p) { var ph = phienQT(p.token); return ph ? ph.tk : 'chủ shop'; }
function tenTheoSdt() {
  var s = sheetKH(); var n = s.getLastRow(); var m = {};
  if (n >= 2) s.getRange(2, 1, n - 1, 2).getValues().forEach(function (r) { m[chuanSdt(r[0])] = String(r[1] || ''); });
  return m;
}
function apiQtGioiThieu(p) {
  if (!coQuyen(p, 'referral.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var s = sheetGT(); var n = s.getLastRow(); var v = n < 2 ? [] : s.getRange(2, 1, n - 1, H_GT.length).getValues();
  var ten = tenTheoSdt(); var top = {};
  var ds = v.map(function (r) {
    var ref = chuanSdt(r[1]);
    if (!top[ref]) top[ref] = { sdt: ref, ten: ten[ref] || '', soNguoi: 0, daMua: 0, diem: 0 };
    top[ref].soNguoi++; if (r[4] === GT.DA_THUONG) { top[ref].daMua++; top[ref].diem += soNguyen(r[11]); }
    return { duoc: chuanSdt(r[0]), tenDuoc: ten[chuanSdt(r[0])] || '', gt: ref, tenGt: ten[ref] || '', ngay: ngayVN(r[2]), nguon: String(r[3] || ''),
      trangThai: String(r[4]), maDon: String(r[5] || ''), giam: soNguyen(r[7]), pGiam: r[8], pThuong: r[9], giaTri: soNguyen(r[10]),
      diem: soNguyen(r[11]), capNhat: r[12] ? ngayVN(r[12]) : '', ghiChu: String(r[13] || '') };
  }).reverse();
  /* Lịch chạy nền ghi thời điểm mỗi lần chạy (web app không có quyền đọc danh sách lịch) */
  var lichLuc = Number(PropertiesService.getScriptProperties().getProperty('LICH_LUC') || 0); var lich = !!lichLuc && Date.now() - lichLuc < 45 * 60e3;
  var so = docSoDiem(); var tongThuong = 0, tongDung = 0;
  so.forEach(function (r) { if (r[3] === 'EARN') tongThuong += soNguyen(r[4]); if (r[3] === 'REVERSE') tongThuong += soNguyen(r[4]); if (r[3] === 'SPEND') tongDung -= soNguyen(r[4]); if (r[3] === 'REFUND') tongDung -= soNguyen(r[4]); });
  return { ok: true, cauHinh: gtCauHinh(), ds: ds, top: Object.keys(top).map(function (k) { return top[k]; }).sort(function (a, b) { return b.diem - a.diem || b.soNguoi - a.soNguoi; }).slice(0, 10),
    tongThuong: tongThuong, tongDung: tongDung, lich: lich, lichLuc: lichLuc ? ngayVN(new Date(lichLuc)) : '' };
}
function apiQtDiem(p) {
  if (!coQuyen(p, 'points.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var so = docSoDiem(), gc = docGiuCho(), ten = tenTheoSdt(), m = {};
  so.forEach(function (r) { m[chuanSdt(r[2])] = 1; }); gc.forEach(function (r) { m[chuanSdt(r[1])] = 1; });
  var ds = Object.keys(m).map(function (sdt) { var v = viDiem(sdt, so, gc); v.sdt = sdt; v.ten = ten[sdt] || ''; v.ganNhat = v.ganNhat ? ngayVN(v.ganNhat) : ''; v.khoa = khachBiKhoa(sdt); return v; });
  ds.sort(function (a, b) { return b.soDu - a.soDu; });
  return { ok: true, ds: ds };
}
function apiQtDiemLichSu(p) {
  if (!coQuyen(p, 'points.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var sdt = p.sdt ? chuanSdt(p.sdt) : ''; var so = docSoDiem(), gc = docGiuCho(); var ls = [], giu = [];
  for (var i = so.length - 1; i >= 0 && ls.length < 1000; i--) {
    var r = so[i]; if (sdt && chuanSdt(r[2]) !== sdt) continue;
    ls.push({ ngay: ngayVN(r[0]), ma: String(r[1]), sdt: chuanSdt(r[2]), loai: String(r[3]), diem: soNguyen(r[4]), truoc: soNguyen(r[5]), sau: soNguyen(r[6]),
      refLoai: String(r[7] || ''), ref: String(r[8] || ''), noiDung: String(r[9] || ''), nguoiTao: String(r[10] || '') });
  }
  for (var j = gc.length - 1; j >= 0 && giu.length < 500; j--) {
    var g = gc[j]; if (sdt && chuanSdt(g[1]) !== sdt) continue;
    giu.push({ ma: String(g[0]), sdt: chuanSdt(g[1]), maDon: String(g[2]), diem: soNguyen(g[3]), trangThai: String(g[4]), ngay: ngayVN(g[5]),
      xuLy: g[6] ? ngayVN(g[6]) : '', giamGT: soNguyen(g[8]), tongDon: soNguyen(g[12]), ghiChu: String(g[13] || '') });
  }
  return { ok: true, sdt: sdt, ten: sdt ? (tenTheoSdt()[sdt] || '') : '', vi: sdt ? viDiem(sdt, so, gc) : null, ls: ls, giu: giu };
}
/* Cộng / trừ điểm tay: bắt buộc lý do, ghi sổ ADJUSTMENT + nhật ký. maYc chống bấm 2 lần. */
function apiQtDiemDieuChinh(p) {
  if (!coQuyen(p, 'points.adjust')) return { ok: false, msg: 'Không có quyền cộng / trừ điểm' };
  var sdt = chuanSdt(p.sdt); var diem = soNguyen(p.diem); var lyDo = String(p.lyDo || '').trim().slice(0, 200);
  if (!sdtHopLe(sdt)) return { ok: false, msg: 'Số điện thoại chưa đúng' };
  if (!diem) return { ok: false, msg: 'Nhập số điểm khác 0' };
  if (Math.abs(diem) > 100000000) return { ok: false, msg: 'Số điểm quá lớn' };
  if (lyDo.length < 3) return { ok: false, msg: 'Bắt buộc nhập lý do' };
  var ai = tenQT(p);
  return voiKhoa(function () {
    var w = ghiDiem(sdt, 'ADJUSTMENT', diem, 'ADMIN', ai, lyDo, ai, p.maYc ? 'ADJ:' + String(p.maYc).slice(0, 40) : '');
    if (!w.ok) return w;
    if (!w.trung) ghiNhatKy('Điểm', sdt, (diem > 0 ? '+' : '') + diem + ' điểm – ' + lyDo + ' – bởi ' + ai);
    return { ok: true, trung: !!w.trung, soDu: w.soDu };
  });
}
function apiQtGtCauHinh(p) {
  if (p.luu !== '1') { if (!coQuyen(p, 'referral_settings.view') && !coQuyen(p, 'referral.view')) return { ok: false, msg: 'Không có quyền' }; return { ok: true, cauHinh: gtCauHinh() }; }
  if (!coQuyen(p, 'referral_settings.update')) return { ok: false, msg: 'Không có quyền sửa cấu hình giới thiệu' };
  var cu = gtCauHinh(), moi = {};
  var so = function (k, min, max) { var v = Number(p[k]); if (p[k] == null || p[k] === '' || !isFinite(v)) return cu[k]; return Math.max(min, Math.min(max, v)); };
  moi.bat = p.bat != null ? String(p.bat) === '1' : cu.bat;
  moi.canXacThuc = p.canXacThuc != null ? String(p.canXacThuc) === '1' : cu.canXacThuc;
  moi.giam = so('giam', 0, 50); moi.thuong = so('thuong', 0, 50); moi.giaTriDiem = so('giaTriDiem', 0.01, 100000);
  moi.donToiThieu = so('donToiThieu', 0, 1e9); moi.giuChoGio = so('giuChoGio', 1, 720); moi.theoDoiNgay = so('theoDoiNgay', 1, 365);
  moi.noiDungChiaSe = p.noiDungChiaSe != null ? String(p.noiDungChiaSe).slice(0, 300) : cu.noiDungChiaSe;
  PropertiesService.getScriptProperties().setProperty('GT_CAU_HINH', JSON.stringify(moi));
  var doi = Object.keys(moi).filter(function (k) { return String(moi[k]) !== String(cu[k]); }).map(function (k) { return k + ': ' + cu[k] + ' → ' + moi[k]; });
  if (doi.length) ghiNhatKy('Cấu hình giới thiệu', tenQT(p), doi.join('; '));
  return { ok: true, cauHinh: moi };
}
function apiQtGtXuLy(p) {
  if (!coQuyen(p, 'referral.update')) return { ok: false, msg: 'Không có quyền' };
  return xuLyDiemGT();
}
/* Bật lịch chạy nền 30 phút (đồng bộ trạng thái CRM + xử lý điểm) từ trang quản trị */
function apiQtGtLich(p) {
  if (!coQuyen(p, 'referral_settings.update')) return { ok: false, msg: 'Không có quyền' };
  try { taoLichDongBoCRM(); ghiNhatKy('Cấu hình giới thiệu', tenQT(p), 'Bật lịch tự xử lý 30 phút/lần'); return { ok: true }; }
  catch (e) { return { ok: false, msg: 'Chưa bật được lịch: ' + e + '. Mở Apps Script, chọn hàm taoLichDongBoCRM rồi bấm Chạy 1 lần.' }; }
}

/* ===================== QUÊN MẬT KHẨU – OTP QUA EMAIL =====================
   Luồng: qmkGui (email đã đăng ký → gửi OTP 6 số) → qmkXacThuc (OTP đúng → cấp reset token dùng 1 lần)
          → qmkDatLai (mật khẩu mới nhập 2 lần → đổi mật khẩu, đăng xuất mọi máy, email thông báo).
   - Chỉ gửi tới email ĐÃ LƯU trong hồ sơ khách (sheet Khách hàng). Email lạ: trả lời trung lập, không gửi gì.
   - Sheet "Đặt lại mật khẩu": mỗi yêu cầu 1 dòng, chỉ lưu MÃ BĂM của OTP và token (không lưu mã thật).
   - Yêu cầu mới → yêu cầu cũ của email đó bị huỷ (CANCELLED). Sai 5 lần → LOCKED. Hết hạn → EXPIRED.
   - Giới hạn: chờ 60 giây giữa 2 lần gửi, tối đa N lần / email / 15 phút, theo máy và toàn hệ thống
     (Apps Script không biết IP của khách nên giới hạn theo mã máy + tổng hệ thống).
   - Cấu hình + mẫu email: Thuộc tính tập lệnh QMK_CAU_HINH (sửa ở trang quản trị). */
var SHEET_QMK = 'Đặt lại mật khẩu';
var H_QMK = ['Mã yêu cầu', 'Email', 'Tài khoản (SĐT)', 'Kênh', 'Trạng thái', 'Tạo lúc', 'OTP băm', 'Muối', 'OTP hết hạn', 'Số lần sai',
             'Xác thực lúc', 'Token băm', 'Token hết hạn', 'Hoàn tất lúc', 'Mã máy', 'Ghi chú'];
var QMK = { PENDING: 'PENDING', VERIFIED: 'OTP_VERIFIED', DONE: 'PASSWORD_RESET', EXPIRED: 'EXPIRED', LOCKED: 'LOCKED', CANCELLED: 'CANCELLED' };
var QMK_MAC_DINH = {
  otpPhut: 15, saiToiDa: 5, choGuiLaiGiay: 60, guiToiDa15p: 5, mayToiDa15p: 10, heThongToiDa15p: 80, tokenPhut: 15, mkToiThieu: 8,
  tieuDeOtp: 'Mã OTP đặt lại mật khẩu',
  noiDungOtp: 'Xin chào {ten},\n\nBạn vừa yêu cầu đặt lại mật khẩu tài khoản tại {shop}.\n\nMã OTP của bạn là: {otp}\n\nMã OTP có hiệu lực trong {phut} phút và chỉ dùng được 1 lần.\n\nNếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.\n\nTrân trọng,\n{shop}',
  tieuDeDoi: 'Mật khẩu tài khoản đã được thay đổi',
  noiDungDoi: 'Xin chào {ten},\n\nMật khẩu tài khoản {sdt} tại {shop} vừa được thay đổi thành công lúc {luc}.\nMọi thiết bị đang đăng nhập đã được đăng xuất.\n\nNếu bạn không thực hiện thao tác này, vui lòng liên hệ ngay hotline {hotline}.\n\n{shop}'
};
function sheetQMK() { return sheetPhu(SHEET_QMK, H_QMK); }
function qmkCauHinh() {
  var c = {}; try { c = JSON.parse(PropertiesService.getScriptProperties().getProperty('QMK_CAU_HINH') || '{}'); } catch (e) { c = {}; }
  var kq = {}; for (var k in QMK_MAC_DINH) kq[k] = c[k] != null && c[k] !== '' ? c[k] : QMK_MAC_DINH[k];
  return kq;
}
function bamHex(s) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(s), Utilities.Charset.UTF_8).map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join(''); }
/* Mật khẩu kiểu mới: băm lặp 300 vòng có muối (Apps Script không có bcrypt/Argon2). Tiền tố v2$ để phân biệt kiểu cũ. */
function bamMkManh(mk, muoi) { var h = String(muoi) + '|' + String(mk); for (var i = 0; i < 300; i++) h = bamHex(h + '|' + muoi + '|' + i); return 'v2$' + h; }
function kiemMk(mk, tk) { if (!tk || !tk.hash) return false; return tk.hash.indexOf('v2$') === 0 ? bamMkManh(mk, tk.muoi) === tk.hash : bamMk(mk, tk.muoi) === tk.hash; }
/* So sánh không lộ thời gian (tránh đoán dần mã băm) */
function bangNhau(a, b) { a = String(a); b = String(b); if (a.length !== b.length) return false; var d = 0; for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
function soNgauNhien6() { var h = Utilities.getUuid().replace(/-/g, ''); return ('000000' + (parseInt(h.slice(0, 12), 16) % 1000000)).slice(-6); }
function taoMaQmk() { return 'QM' + Utilities.getUuid().replace(/-/g, '').slice(0, 14).toUpperCase(); }
function dien(mau, v) { return String(mau || '').replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }
function chuanEmail(e) { return String(e || '').trim().toLowerCase(); }
/* Tài khoản có email này trong sheet Khách hàng (1 email có thể gắn nhiều SĐT) */
function timTheoEmail(email) {
  var s = sheetKH(); var n = s.getLastRow(); var kq = []; if (n < 2 || !email) return kq;
  s.getRange(2, 1, n - 1, 12).getValues().forEach(function (r) {
    if (chuanEmail(r[5]) === email && sdtHopLe(chuanSdt(r[0])) && String(r[11] || '').indexOf('KHOA') < 0) kq.push({ sdt: chuanSdt(r[0]), ten: String(r[1] || '') });
  });
  return kq;
}
/* Đếm theo khoá trong CacheService (cửa sổ cố định 15 phút) */
function demGioiHan(k, toiDa, giay) {
  var c = CacheService.getScriptCache(); var n = Number(c.get(k) || 0);
  if (n >= toiDa) return false; c.put(k, String(n + 1), giay || 900); return true;
}
function qmkNhatKy(maSo, viec, chiTiet) { ghiNhatKy('Bảo mật', maSo, viec + (chiTiet ? ' – ' + chiTiet : '')); }
/* Đăng xuất mọi máy của 1 số điện thoại (cho phiên hết hạn ngay). giuToken: giữ lại phiên đang dùng (đổi mật khẩu khi đang đăng nhập) */
function huyMoiPhien(sdt, giuToken) {
  var s = sheetPhien(); var n = s.getLastRow(); if (n < 2) return 0; var v = s.getRange(2, 1, n - 1, 3).getValues(); var dem = 0;
  for (var i = 0; i < v.length; i++) if (chuanSdt(v[i][1]) === sdt && String(v[i][0]) !== String(giuToken || '') && new Date(v[i][2]).getTime() > Date.now()) { s.getRange(i + 2, 3).setValue(new Date(0)); dem++; }
  return dem;
}
/* Ghi mật khẩu mới (kiểu băm mạnh) cho 1 số điện thoại */
function luuMatKhau(sdt, mk) {
  var muoi = Utilities.getUuid(); var hang = ["'" + sdt, bamMkManh(mk, muoi), muoi, new Date()];
  var tk = timTK(sdt); var s = sheetTK();
  if (tk) s.getRange(tk.dong, 1, 1, 4).setValues([hang]); else s.appendRow(hang);
}
function kiemMkMoi(mk, mk2, cfg) {
  mk = String(mk || ''); var toiThieu = Number(cfg.mkToiThieu) || 8;
  if (mk2 != null && mk !== String(mk2)) return { ok: false, code: 'PASSWORD_MISMATCH', msg: 'Hai mật khẩu không khớp.' };
  if (mk.length < toiThieu) return { ok: false, code: 'PASSWORD_INVALID', msg: 'Mật khẩu cần ít nhất ' + toiThieu + ' ký tự.' };
  if (mk.length > 100) return { ok: false, code: 'PASSWORD_INVALID', msg: 'Mật khẩu quá dài (tối đa 100 ký tự).' };
  if (mk === MK_MAC_DINH) return { ok: false, code: 'PASSWORD_INVALID', msg: 'Mẹ chọn mật khẩu khác mật khẩu mặc định nhé.' };
  return { ok: true };
}
function guiMailDoiMk(sdt, ten, cfg) {
  try {
    var dong = timDongKH(sdt); var mail = dong ? String(sheetKH().getRange(dong, 6).getValue() || '') : '';
    if (!emailHopLe(mail)) return;
    var v = { ten: ten || 'quý khách', sdt: anSdt(sdt), shop: TEN_SHOP, hotline: HOTLINE, luc: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'HH:mm dd/MM/yyyy') };
    MailApp.sendEmail(mail, dien(cfg.tieuDeDoi, v), dien(cfg.noiDungDoi, v), { name: TEN_SHOP });
  } catch (e) { Logger.log('Email báo đổi mật khẩu lỗi: ' + e); }
}

/* ---------- API khách ---------- */
function apiQmkCauHinh() { var c = qmkCauHinh(); return { ok: true, otpPhut: Number(c.otpPhut), choGuiLaiGiay: Number(c.choGuiLaiGiay), mkToiThieu: Number(c.mkToiThieu), saiToiDa: Number(c.saiToiDa) }; }
/* B1. Gửi OTP. Luôn trả lời giống nhau dù email có tồn tại hay không. */
function apiQmkGui(p) {
  var cfg = qmkCauHinh(); var email = chuanEmail(p.email); var may = String(p.may || '').replace(/[^\w-]/g, '').slice(0, 40);
  if (!emailHopLe(email)) return { ok: false, code: 'EMAIL_INVALID', msg: 'Email chưa đúng định dạng.' };
  var c = CacheService.getScriptCache(); var cd = Number(c.get('qmk_cd_' + email) || 0);
  if (cd && Date.now() - cd < Number(cfg.choGuiLaiGiay) * 1000) return { ok: false, code: 'RATE_LIMITED', choGiay: Math.ceil((Number(cfg.choGuiLaiGiay) * 1000 - (Date.now() - cd)) / 1000), msg: 'Mẹ chờ một chút rồi gửi lại mã nhé.' };
  if (!demGioiHan('qmk_ht', Number(cfg.heThongToiDa15p)) || (may && !demGioiHan('qmk_m_' + may, Number(cfg.mayToiDa15p))) || !demGioiHan('qmk_e_' + email, Number(cfg.guiToiDa15p)))
    return { ok: false, code: 'RATE_LIMITED', msg: 'Mẹ đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 15 phút hoặc gọi hotline ' + HOTLINE + '.' };
  c.put('qmk_cd_' + email, String(Date.now()), 900);
  /* p.loai = 'doiTac': quên mật khẩu tài khoản ĐỐI TÁC (email trong sheet Đối tác), còn lại: tài khoản khách */
  var laDT = p.loai === 'doiTac'; var kenh = laDT ? 'email-doi-tac' : 'email';
  var ds = laDT ? timDTTheoEmail(email) : timTheoEmail(email); var ma = taoMaQmk();
  var traLoi = { ok: true, code: 'OTP_SENT', maYc: ma, emailAn: anEmail(email), choGiay: Number(cfg.choGuiLaiGiay), hetHanGiay: Number(cfg.otpPhut) * 60,
    msg: 'Nếu email này đã được đăng ký, chúng tôi đã gửi mã OTP đến email đó.' };
  if (!ds.length) { qmkNhatKy(anEmail(email), 'PASSWORD_RESET_REQUESTED', 'email chưa đăng ký – không gửi'); return traLoi; }
  var kq = voiKhoa(function () {
    var s = sheetQMK(); var n = s.getLastRow();
    if (n >= 2) s.getRange(2, 1, n - 1, 5).getValues().forEach(function (r, i) {   // huỷ yêu cầu cũ của email này
      if (chuanEmail(r[1]) === email && String(r[3] || 'email') === kenh && (r[4] === QMK.PENDING || r[4] === QMK.VERIFIED)) s.getRange(i + 2, 5).setValue(QMK.CANCELLED);
    });
    var otp = soNgauNhien6(), muoi = Utilities.getUuid();
    s.appendRow([ma, email, "'" + ds.map(function (x) { return x.sdt; }).join(','), kenh, QMK.PENDING, new Date(), bamHex(muoi + '|' + otp), muoi,
      new Date(Date.now() + Number(cfg.otpPhut) * 60000), 0, '', '', '', '', may, '']);
    return { ok: true, otp: otp };
  });
  if (!kq.ok) return kq;
  try {
    var v = { ten: ds[0].ten || 'quý khách', otp: kq.otp, phut: cfg.otpPhut, shop: TEN_SHOP, hotline: HOTLINE };
    MailApp.sendEmail(email, dien(cfg.tieuDeOtp, v), dien(cfg.noiDungOtp, v), { name: TEN_SHOP });
    qmkNhatKy(anEmail(email), 'OTP_SENT', ds.length + ' tài khoản (' + ds.map(function (x) { return anSdt(x.sdt); }).join(', ') + ')');
  } catch (e) { Logger.log('Gửi OTP email lỗi: ' + e); qmkNhatKy(anEmail(email), 'PASSWORD_RESET_FAILED', 'gửi email lỗi'); return { ok: false, code: 'SEND_FAILED', msg: 'Chưa gửi được email, mẹ thử lại sau ít phút nhé.' }; }
  return traLoi;
}
function qmkTimDong(ma) {
  var s = sheetQMK(); var n = s.getLastRow(); if (n < 2 || !ma) return null;
  var v = s.getRange(2, 1, n - 1, H_QMK.length).getValues();
  for (var i = v.length - 1; i >= 0; i--) if (String(v[i][0]) === String(ma)) return { dong: i + 2, v: v[i] };
  return null;
}
/* B2. Xác thực OTP → cấp reset token (chỉ trả 1 lần, máy chủ chỉ giữ mã băm) */
function apiQmkXacThuc(p) {
  var cfg = qmkCauHinh(); var email = chuanEmail(p.email); var otp = String(p.otp || '').replace(/\D/g, '');
  if (!demGioiHan('qmk_xt_' + String(p.maYc || '').slice(0, 20), 30)) return { ok: false, code: 'RATE_LIMITED', msg: 'Thử quá nhiều lần, vui lòng yêu cầu mã mới.' };
  return voiKhoa(function () {
    var r = qmkTimDong(p.maYc); var sai = { ok: false, code: 'OTP_INVALID', msg: 'Mã OTP không chính xác. Vui lòng kiểm tra và thử lại.' };
    if (!r || chuanEmail(r.v[1]) !== email || otp.length !== 6) return sai;
    var s = sheetQMK(), tt = String(r.v[4]);
    if (tt === QMK.CANCELLED) return { ok: false, code: 'OTP_EXPIRED', msg: 'Mã này đã được thay bằng mã mới. Vui lòng dùng mã OTP mới nhất.' };
    if (tt === QMK.LOCKED) return { ok: false, code: 'OTP_LOCKED', msg: 'Mã OTP đã bị vô hiệu hóa do nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới.' };
    if (tt !== QMK.PENDING) return { ok: false, code: 'OTP_EXPIRED', msg: 'Mã OTP đã được sử dụng. Vui lòng yêu cầu mã OTP mới.' };
    if (new Date(r.v[8]).getTime() < Date.now()) { s.getRange(r.dong, 5).setValue(QMK.EXPIRED); return { ok: false, code: 'OTP_EXPIRED', msg: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã OTP mới.' }; }
    if (!bangNhau(bamHex(r.v[7] + '|' + otp), r.v[6])) {
      var lan = Number(r.v[9] || 0) + 1, toiDa = Number(cfg.saiToiDa) || 5;
      s.getRange(r.dong, 10).setValue(lan);
      if (lan >= toiDa) { s.getRange(r.dong, 5).setValue(QMK.LOCKED); qmkNhatKy(anEmail(email), 'OTP_LOCKED', 'sai ' + lan + ' lần'); return { ok: false, code: 'OTP_LOCKED', msg: 'Mã OTP đã bị vô hiệu hóa do nhập sai quá nhiều lần. Vui lòng yêu cầu mã OTP mới.' }; }
      qmkNhatKy(anEmail(email), 'OTP_FAILED', 'lần ' + lan + '/' + toiDa);
      return { ok: false, code: 'OTP_INVALID', conLan: toiDa - lan, msg: 'Mã OTP không chính xác. Vui lòng kiểm tra và thử lại (còn ' + (toiDa - lan) + ' lần).' };
    }
    var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
    s.getRange(r.dong, 5).setValue(QMK.VERIFIED); s.getRange(r.dong, 11, 1, 3).setValues([[new Date(), bamHex(token), new Date(Date.now() + Number(cfg.tokenPhut) * 60000)]]);
    qmkNhatKy(anEmail(email), 'OTP_VERIFIED', '');
    var ten = String(r.v[3]) === 'email-doi-tac' ? tenDoiTacTheoSdt() : tenTheoSdt();
    var tk = String(r.v[2]).split(',').filter(String).map(function (x, i) { return { k: i, sdt: anSdt(x), ten: anTen(ten[chuanSdt(x)] || '') }; });
    return { ok: true, code: 'OTP_VERIFIED', token: token, hetHanGiay: Number(cfg.tokenPhut) * 60, taiKhoan: tk };
  });
}
/* B3. Đặt mật khẩu mới bằng reset token (dùng 1 lần) */
function apiQmkDatLai(p) {
  var cfg = qmkCauHinh(); var kt = kiemMkMoi(p.mk, p.mk2, cfg); if (!kt.ok) return kt;
  if (!demGioiHan('qmk_dl_' + String(p.maYc || '').slice(0, 20), 20)) return { ok: false, code: 'RATE_LIMITED', msg: 'Thử quá nhiều lần, vui lòng yêu cầu mã mới.' };
  return voiKhoa(function () {
    var r = qmkTimDong(p.maYc); var hong = { ok: false, code: 'RESET_TOKEN_INVALID', msg: 'Phiên đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu mã OTP mới.' };
    if (!r || String(r.v[4]) !== QMK.VERIFIED || !p.token || !bangNhau(bamHex(p.token), r.v[11])) return hong;
    if (new Date(r.v[12]).getTime() < Date.now()) { sheetQMK().getRange(r.dong, 5).setValue(QMK.EXPIRED); return { ok: false, code: 'RESET_TOKEN_EXPIRED', msg: 'Phiên đặt lại mật khẩu đã hết hạn.' }; }
    var ds = String(r.v[2]).split(',').filter(String).map(chuanSdt);
    var k = p.k != null && p.k !== '' ? Number(p.k) : (ds.length === 1 ? 0 : -1);
    if (!(k >= 0 && k < ds.length)) return { ok: false, code: 'CHOOSE_ACCOUNT', msg: 'Mẹ chọn tài khoản (số điện thoại) cần đặt lại mật khẩu nhé.' };
    var sdt = ds[k]; var email = chuanEmail(r.v[1]); var laDT = String(r.v[3]) === 'email-doi-tac';
    if (!(laDT ? timDTTheoEmail(email) : timTheoEmail(email)).some(function (x) { return x.sdt === sdt; })) return hong;   // email đã bị đổi khỏi tài khoản trong lúc chờ
    var dx = laDT ? luuMkDoiTac(sdt, String(p.mk)) : (luuMatKhau(sdt, String(p.mk)), huyMoiPhien(sdt));
    var s = sheetQMK(); s.getRange(r.dong, 5).setValue(QMK.DONE); s.getRange(r.dong, 12, 1, 3).setValues([['', r.v[12], new Date()]]);
    s.getRange(r.dong, 16).setValue('Đã đặt lại cho ' + (laDT ? 'đối tác ' : '') + anSdt(sdt));
    qmkNhatKy(sdt, 'PASSWORD_RESET_SUCCESS', (laDT ? 'tài khoản ĐỐI TÁC, ' : '') + 'qua email ' + anEmail(email) + ', đăng xuất ' + dx + ' phiên');
    if (laDT) { try { var vv = { ten: tenDoiTacTheoSdt()[sdt] || 'bạn', sdt: anSdt(sdt), shop: TEN_SHOP, hotline: HOTLINE, luc: Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'HH:mm dd/MM/yyyy') };
      MailApp.sendEmail(email, dien(cfg.tieuDeDoi, vv), dien(cfg.noiDungDoi, vv), { name: TEN_SHOP }); } catch (em) { Logger.log(em); } }
    else guiMailDoiMk(sdt, (tenTheoSdt()[sdt] || ''), cfg);
    return { ok: true, code: 'PASSWORD_RESET_SUCCESS', sdtAn: anSdt(sdt), msg: 'Bạn đã đặt lại mật khẩu thành công.' };
  });
}

/* ---------- API quản trị ---------- */
function apiQtBaoMatKhach(p) {
  if (!coQuyen(p, 'customer.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var sdt = chuanSdt(p.sdt); if (!sdtHopLe(sdt)) return { ok: false, msg: 'Số điện thoại chưa đúng' };
  var dong = timDongKH(sdt); var row = dong ? sheetKH().getRange(dong, 1, 1, 12).getValues()[0] : [];
  var email = chuanEmail(row[5]); var tk = timTK(sdt);
  var tkLuc = tk ? sheetTK().getRange(tk.dong, 4).getValue() : '';
  var phien = 0; var sp = sheetPhien(); var np = sp.getLastRow();
  if (np >= 2) sp.getRange(2, 1, np - 1, 5).getValues().forEach(function (r) { if (chuanSdt(r[1]) === sdt && new Date(r[2]).getTime() > Date.now()) phien++; });
  var yc = []; var sq = sheetQMK(); var nq = sq.getLastRow();
  if (nq >= 2) sq.getRange(2, 1, nq - 1, H_QMK.length).getValues().forEach(function (r) {
    if ((email && chuanEmail(r[1]) === email) || String(r[2]).split(',').map(chuanSdt).indexOf(sdt) > -1)
      yc.push({ ngay: ngayVN(r[5]), kenh: String(r[3]), trangThai: String(r[4]), sai: Number(r[9] || 0), hoanTat: r[13] ? ngayVN(r[13]) : '' });
  });
  return { ok: true, email: email, coEmail: emailHopLe(email), sdt: sdt, matKhau: tk && tk.hash ? (tk.hash.indexOf('v2$') === 0 ? 'Mật khẩu riêng (băm mạnh)' : 'Mật khẩu riêng') : 'Mật khẩu mặc định',
    doiMkLuc: tkLuc ? ngayVN(tkLuc) : '', phienDangMo: phien, khoa: String(row[11] || '').indexOf('KHOA') > -1, yeuCau: yc.reverse().slice(0, 30) };
}
function apiQtQmkCauHinh(p) {
  if (!coQuyen(p, 'setting.view')) return { ok: false, msg: 'Không có quyền' };
  if (p.luu !== '1') return { ok: true, cauHinh: qmkCauHinh(), shop: TEN_SHOP, hotline: HOTLINE };
  var cu = qmkCauHinh(), moi = {};
  var so = function (k, min, max) { var v = Number(p[k]); return p[k] == null || p[k] === '' || !isFinite(v) ? cu[k] : Math.max(min, Math.min(max, Math.round(v))); };
  moi.otpPhut = so('otpPhut', 1, 60); moi.saiToiDa = so('saiToiDa', 1, 20); moi.choGuiLaiGiay = so('choGuiLaiGiay', 10, 600);
  moi.guiToiDa15p = so('guiToiDa15p', 1, 50); moi.mayToiDa15p = so('mayToiDa15p', 1, 100); moi.heThongToiDa15p = so('heThongToiDa15p', 5, 1000);
  moi.tokenPhut = so('tokenPhut', 5, 60); moi.mkToiThieu = so('mkToiThieu', 6, 32);
  ['tieuDeOtp', 'noiDungOtp', 'tieuDeDoi', 'noiDungDoi'].forEach(function (k) { moi[k] = p[k] != null ? String(p[k]).slice(0, 2000) : cu[k]; });
  if (moi.noiDungOtp.indexOf('{otp}') < 0) return { ok: false, msg: 'Nội dung email OTP phải có {otp}' };
  PropertiesService.getScriptProperties().setProperty('QMK_CAU_HINH', JSON.stringify(moi));
  var doi = Object.keys(moi).filter(function (k) { return String(moi[k]) !== String(cu[k]); });
  if (doi.length) ghiNhatKy('Cấu hình bảo mật', tenQT(p), 'Sửa: ' + doi.join(', '));
  return { ok: true, cauHinh: moi };
}

/* ===================== ĐỐI TÁC (AFFILIATE) =====================
   Đối tác đăng link ?aff=MÃ. Mỗi lượt bấm có MÃ LƯỢT do máy chủ cấp + ghi sổ (không bịa được).
   Đơn hàng mang mã lượt → máy chủ kiểm tra → nguồn "Qua link". Khách gõ SĐT sau khi bấm → nối SĐT với lượt bấm
   → đặt ở máy khác trong hạn vẫn tính ("Qua link – khác máy"). Hạn tính từ lượt bấm GẦN NHẤT (mặc định 7 ngày),
   2 đối tác → người được bấm SAU CÙNG. Không bấm link trong hạn → không tính. SĐT đặt hàng trùng SĐT đối tác → "Tự mua" (0đ).
   Hoa hồng = % (theo nguồn, shop tự chỉnh) × tiền hàng khách thực trả (sau giảm giá, không gồm ship).
   CRM báo Đã giao → chờ đủ N ngày (đổi trả) → vào kỳ thanh toán ngày 10 hằng tháng. Huỷ → không tính. Hoàn hàng → trừ lại
   (đã trả rồi thì trừ vào kỳ sau). Thuế TNCN: khấu trừ theo tỉ lệ / ngưỡng cấu hình (mặc định 10% khi khoản chi ≥ 2.000.000đ
   cho cá nhân không ký HĐLĐ – Thông tư 111/2013/TT-BTC Điều 25), trừ đối tác đã nộp cam kết 08/CK-TNCN hoặc là
   doanh nghiệp / hộ kinh doanh xuất hoá đơn. */
var SHEET_DT = 'Đối tác', SHEET_LB = 'Lượt bấm', SHEET_DD = 'Đơn đối tác', SHEET_KY = 'Kỳ thanh toán', SHEET_PDT = 'Phiên đối tác';
var H_DT = ['Mã', 'Họ tên', 'Điện thoại', 'Email', 'Kênh bán', 'Ngân hàng', 'Số tài khoản', 'Chủ tài khoản', 'CCCD / MST', 'Loại thuế',
            'Trạng thái', 'Đăng ký lúc', 'Duyệt lúc', 'Người duyệt', 'Mật khẩu (băm)', 'Muối', 'Ghi chú'];
var H_LB = ['Mã lượt', 'Thời gian', 'Mã đối tác', 'Trang', 'Mã khách', 'SĐT nối', 'Nối lúc', 'Thiết bị'];
var H_DD = ['Mã đơn', 'Thời gian', 'SĐT khách', 'Mã đối tác', 'Nguồn', 'Mã lượt', 'Bấm lúc', 'Tiền tính HH', 'Tổng đơn', '% HH', 'Hoa hồng',
            'Trạng thái', 'Giao lúc', 'Kỳ trả', 'Trừ ở kỳ', 'Cập nhật', 'Sản phẩm', 'Người gán', 'Ghi chú', 'Chi tiết HH', 'Chiến dịch'];
var H_KY = ['Mã kỳ', 'Mã đối tác', 'Ngày chốt', 'Số đơn', 'Tổng hoa hồng', 'Điều chỉnh', 'Thu nhập tính thuế', 'Thuế TNCN', 'Thực nhận',
            'Trạng thái', 'Trả lúc', 'Mã giao dịch', 'Người trả', 'Danh sách đơn', 'Ghi chú'];
var NGUON = { link: 'Qua link', khacMay: 'Qua link – khác máy', zalo: 'Zalo có mã đối tác', ganTay: 'Gán tay', tuMua: 'Tự mua' };
var DTT = { CHO: 'Chờ duyệt', DUYET: 'Đã duyệt', TU_CHOI: 'Từ chối', KHOA: 'Đã khoá' };
var DDT = { CHO: 'Chờ giao', GIAO: 'Đã giao', HUY: 'Đã huỷ', HOAN: 'Hoàn hàng', KHONG: 'Không tính' };
var AFF_MAC_DINH = { bat: true, ngay: 7, hh: { link: 10, khacMay: 10, zalo: 8, ganTay: 5 }, choDoiTraNgay: 7, ngayTra: 10,
  thueTyLe: 10, thueNguong: 2000000, gioiThieu: 'Chia sẻ link sản phẩm Hương Chất Kids, nhận hoa hồng cho mỗi đơn giao thành công.', hienTyLe: false, chiSpTrongDs: true,
  coChe: 'Bạn nhận hoa hồng cho mỗi đơn hàng khách mua qua link của bạn và giao thành công.\nMức hoa hồng, thời gian ghi nhận và lịch thanh toán theo thoả thuận với Hương Chất Kids – shop sẽ thông báo cụ thể khi duyệt tài khoản.\nHoa hồng được thanh toán hằng tháng; shop khấu trừ thuế TNCN theo quy định pháp luật.' };
function sheetDT() { return sheetPhu(SHEET_DT, H_DT); } function sheetLB() { return sheetPhu(SHEET_LB, H_LB); }
function sheetDD() { var s = sheetPhu(SHEET_DD, H_DD); if (s.getLastColumn() < H_DD.length) s.getRange(1, 1, 1, H_DD.length).setValues([H_DD]).setFontWeight('bold'); return s; } function sheetKY() { return sheetPhu(SHEET_KY, H_KY); }
function sheetPDT() { return sheetPhu(SHEET_PDT, ['Token', 'Mã đối tác', 'Hết hạn', 'Tạo lúc']); }
function affCauHinh() {
  var c = {}; try { c = JSON.parse(PropertiesService.getScriptProperties().getProperty('AFF_CAU_HINH') || '{}'); } catch (e) { c = {}; }
  var kq = {}; for (var k in AFF_MAC_DINH) kq[k] = c[k] != null ? c[k] : AFF_MAC_DINH[k];
  kq.hh = {}; for (var n in AFF_MAC_DINH.hh) kq.hh[n] = c.hh && c.hh[n] != null ? Number(c.hh[n]) : AFF_MAC_DINH.hh[n];
  return kq;
}
function chuanMaDT(m) { return String(m || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16); }
function docBang(s, cot) { var n = s.getLastRow(); return n < 2 ? [] : s.getRange(2, 1, n - 1, cot).getValues(); }
function timDT(ma) { ma = chuanMaDT(ma); if (!ma) return null; var v = docBang(sheetDT(), H_DT.length); for (var i = 0; i < v.length; i++) if (String(v[i][0]) === ma) return { dong: i + 2, v: v[i] }; return null; }
function timDTTheoSdt(sdt) { var v = docBang(sheetDT(), H_DT.length); for (var i = 0; i < v.length; i++) if (chuanSdt(v[i][2]) === sdt) return { dong: i + 2, v: v[i] }; return null; }
function dtHoatDong(r) { return r && String(r.v[10]) === DTT.DUYET; }
function anTK(s) { s = String(s || ''); return s.length > 4 ? '••••' + s.slice(-4) : s; }
/* Quên mật khẩu đối tác (dùng chung luồng OTP email của khách – xem QUÊN MẬT KHẨU) */
function timDTTheoEmail(email) { var kq = []; if (!email) return kq; docBang(sheetDT(), H_DT.length).forEach(function (r) { if (chuanEmail(r[3]) === email && String(r[10]) === DTT.DUYET && sdtHopLe(chuanSdt(r[2]))) kq.push({ sdt: chuanSdt(r[2]), ten: String(r[1] || '') }); }); return kq; }
function tenDoiTacTheoSdt() { var m = {}; docBang(sheetDT(), 3).forEach(function (r) { m[chuanSdt(r[2])] = String(r[1] || ''); }); return m; }
function luuMkDoiTac(sdt, mk) {
  var dt = timDTTheoSdt(sdt); if (!dt) return 0; var muoi = Utilities.getUuid(); sheetDT().getRange(dt.dong, 15, 1, 2).setValues([[bamMkManh(mk, muoi), muoi]]);
  var s = sheetPDT(); var v = docBang(s, 3); var dem = 0; for (var i = 0; i < v.length; i++) if (String(v[i][1]) === String(dt.v[0]) && new Date(v[i][2]).getTime() > Date.now()) { s.getRange(i + 2, 3).setValue(new Date(0)); dem++; }
  return dem;
}

/* ---------- 1. Lượt bấm (công khai) ---------- */
function apiAffBam(p) {
  var cfg = affCauHinh(); if (!cfg.bat) return { ok: false, msg: 'Chương trình đối tác đang tạm dừng' };
  var ma = chuanMaDT(p.ma); var vid = String(p.vid || '').replace(/[^\w-]/g, '').slice(0, 40);
  if (!demGioiHan('aff_b_' + (vid || 'x'), 60, 3600)) return { ok: false, msg: 'Quá nhiều lượt' };
  var dt = timDT(ma); if (!dtHoatDong(dt)) return { ok: false, msg: 'Mã đối tác không hợp lệ' };
  var lb = 'LB' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
  sheetLB().appendRow([lb, new Date(), ma, String(p.trang || '').slice(0, 120), vid, '', '', String(p.tb || '').slice(0, 20)]);
  return { ok: true, lb: lb, ma: ma, ngay: Number(cfg.ngay) };
}
/* Lượt bấm còn hạn (đọc từ cuối sheet, dừng khi quá hạn) */
function luotConHan(cfg) {
  var s = sheetLB(); var v = docBang(s, H_LB.length); var tu = Date.now() - Number(cfg.ngay) * 864e5; var kq = [];
  for (var i = v.length - 1; i >= 0; i--) { var t = new Date(v[i][1]).getTime(); if (t < tu) break; kq.push({ dong: i + 2, lb: String(v[i][0]), t: t, ma: String(v[i][2]), sdt: chuanSdt(v[i][5]), trang: String(v[i][3]) }); }
  return kq;
}
/* 2. Nối SĐT với lượt bấm (khách gõ SĐT trên máy đã bấm link) */
function apiAffSdt(p) {
  var sdt = chuanSdt(p.sdt); var lb = String(p.lb || '').slice(0, 20); if (!sdtHopLe(sdt) || !lb) return { ok: false };
  if (!demGioiHan('aff_s_' + lb, 20, 3600)) return { ok: false };
  return voiKhoa(function () {
    var ds = luotConHan(affCauHinh()); for (var i = 0; i < ds.length; i++) if (ds[i].lb === lb) {
      if (!ds[i].sdt) sheetLB().getRange(ds[i].dong, 6, 1, 2).setValues([["'" + sdt, new Date()]]);
      return { ok: true };
    }
    return { ok: false };
  });
}
/* 3. Gắn đơn với đối tác lúc đặt hàng (web gọi cho MỌI đơn; không có lượt bấm còn hạn → không ghi gì).
   p: maDon, sdt, lb (mã lượt trên máy này, có thể trống), tien (tiền hàng khách trả sau giảm, không ship), tong, sp */
function apiAffGanDon(p) {
  var cfg = affCauHinh(); if (!cfg.bat) return { ok: true, nguon: '' };
  var maDon = String(p.maDon || '').trim().slice(0, 30); var sdt = chuanSdt(p.sdt);
  if (!/^[A-Z0-9-]{6,30}$/i.test(maDon) || !sdtHopLe(sdt)) return { ok: false, msg: 'Thiếu mã đơn / SĐT' };
  if (!demGioiHan('aff_g_' + sdt, 30, 3600)) return { ok: false, msg: 'Quá nhiều yêu cầu' };
  return voiKhoa(function () {
    var dd = docBang(sheetDD(), H_DD.length); for (var i = 0; i < dd.length; i++) if (String(dd[i][0]) === maDon) return { ok: true, nguon: String(dd[i][4]), trung: true };
    var ds = luotConHan(cfg); var lb = String(p.lb || '');
    /* Ứng viên: lượt bấm trên máy này (mã lượt) + lượt bấm đã nối với SĐT này → lấy lượt SAU CÙNG */
    var chon = null;
    ds.forEach(function (x) { if ((lb && x.lb === lb) || (x.sdt && x.sdt === sdt)) { if (!chon || x.t > chon.t) chon = x; } });
    if (!chon) return { ok: true, nguon: '' };
    var dt = timDT(chon.ma); if (!dtHoatDong(dt)) return { ok: true, nguon: '' };
    var nguon = chon.lb === lb ? 'link' : 'khacMay';
    if (chuanSdt(dt.v[2]) === sdt) nguon = 'tuMua';
    var tien = Math.max(0, soNguyen(p.tien)); var items = []; try { items = JSON.parse(String(p.ds || '[]')).slice(0, 50); } catch (e) { items = []; }
    var hh = tinhHH(chon.ma, nguon, items, tien, Date.now(), cfg);
    sheetDD().appendRow([maDon, new Date(), "'" + sdt, chon.ma, NGUON[nguon], chon.lb, new Date(chon.t), tien, Math.max(0, soNguyen(p.tong)), hh.pt,
      hh.hh, nguon === 'tuMua' ? DDT.KHONG : DDT.CHO, '', '', '', new Date(), String(p.sp || '').slice(0, 300), 'web', nguon === 'tuMua' ? 'Đối tác tự mua – không tính' : '', JSON.stringify(hh.ct), hh.cd]);
    if (!chon.sdt) sheetLB().getRange(chon.dong, 6, 1, 2).setValues([["'" + sdt, new Date()]]);
    return { ok: true, nguon: NGUON[nguon], ma: chon.ma };
  });
}

/* ---------- 4. Đăng ký / đăng nhập đối tác ---------- */
function apiAffDangKy(p) {
  var cat = function (x, n) { return String(x || '').trim().slice(0, n); };
  var ten = cat(p.ten, 80), sdt = chuanSdt(p.sdt), email = chuanEmail(p.email), ma = chuanMaDT(p.ma);
  if (ten.length < 2) return { ok: false, msg: 'Nhập họ tên' };
  if (!sdtHopLe(sdt)) return { ok: false, msg: 'Số điện thoại chưa đúng' };
  if (!emailHopLe(email)) return { ok: false, msg: 'Email chưa đúng' };
  if (ma && (ma.length < 3 || ma.length > 12)) return { ok: false, msg: 'Mã đối tác 3–12 chữ / số, không dấu' };
  var kt = kiemMkMoi(p.mk, p.mk2, qmkCauHinh()); if (!kt.ok) return kt;
  if (!cat(p.cccd, 20)) return { ok: false, msg: 'Nhập số CCCD hoặc mã số thuế (để khấu trừ thuế TNCN theo quy định)' };
  if (!cat(p.stk, 30) || !cat(p.nganHang, 60)) return { ok: false, msg: 'Nhập ngân hàng và số tài khoản nhận hoa hồng' };
  if (!demGioiHan('aff_dk_' + sdt, 3, 3600)) return { ok: false, msg: 'Thử lại sau 1 giờ' };
  var loai = ['ca-nhan', 'cam-ket-08', 'doanh-nghiep'].indexOf(String(p.loaiThue)) > -1 ? String(p.loaiThue) : 'ca-nhan';
  return voiKhoa(function () {
    if (timDTTheoSdt(sdt)) return { ok: false, msg: 'Số điện thoại này đã đăng ký đối tác. Liên hệ shop nếu cần hỗ trợ.' };
    if (!ma) { var goc = chuanMaDT(khongDauTen(ten).split(/\s+/).pop()).slice(0, 8) || 'DT'; ma = goc; var i = 1; while (timDT(ma)) ma = goc + (++i); }
    else if (timDT(ma)) return { ok: false, msg: 'Mã ' + ma + ' đã có người dùng, chọn mã khác nhé' };
    var muoi = Utilities.getUuid();
    sheetDT().appendRow([ma, ten, "'" + sdt, email, cat(p.kenh, 300), cat(p.nganHang, 60), "'" + cat(p.stk, 30), cat(p.chuTk, 80) || ten, "'" + cat(p.cccd, 20), loai,
      DTT.CHO, new Date(), '', '', bamMkManh(String(p.mk), muoi), muoi, '']);
    ghiNhatKy('Đối tác', ma, 'Đăng ký mới: ' + ten + ' – ' + sdt);
    try { zaloBotGuiTin('🤝 Đối tác mới đăng ký: ' + ten + ' – ' + sdt + ' (mã ' + ma + '). Vào Quản trị → Đối tác để duyệt.'); } catch (e) { Logger.log(e); }
    return { ok: true, ma: ma, msg: 'Đã gửi đăng ký. Shop sẽ duyệt và báo qua email ' + anEmail(email) + '.' };
  });
}
function khongDauTen(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D'); }
function apiAffDangNhap(p) {
  var ten = String(p.tk || '').trim(); var sdt = chuanSdt(ten);
  if (!demGioiHan('aff_dn_' + (sdt || chuanMaDT(ten)), 10, 3600)) return { ok: false, msg: 'Sai nhiều lần, thử lại sau 1 giờ' };
  var dt = sdtHopLe(sdt) ? timDTTheoSdt(sdt) : timDT(ten);
  if (!dt || !kiemMk(String(p.mk || ''), { hash: String(dt.v[14]), muoi: String(dt.v[15]) })) return { ok: false, msg: 'Tài khoản hoặc mật khẩu chưa đúng' };
  if (String(dt.v[10]) === DTT.CHO) return { ok: false, msg: 'Tài khoản đang chờ shop duyệt.' };
  if (String(dt.v[10]) !== DTT.DUYET) return { ok: false, msg: 'Tài khoản đối tác đang ' + String(dt.v[10]).toLowerCase() + '. Liên hệ shop ' + HOTLINE + '.' };
  var token = taoToken(); sheetPDT().appendRow([token, String(dt.v[0]), new Date(Date.now() + 30 * 864e5), new Date()]);
  return { ok: true, token: token, ma: String(dt.v[0]) };
}
/* Khách đã đăng nhập (trang Tài khoản) → biết mình là đối tác chưa; vao=1 cấp phiên đối tác, khỏi đăng nhập lại.
   Chỉ cấp khi phiên khách mạnh (OTP / mật khẩu riêng) – mật khẩu mặc định của shop ai cũng đoán được. */
function apiAffTuKhach(p) {
  var ph = phienKhach(p.token); if (!ph) return { ok: false, loi: 'token', msg: 'Phiên đăng nhập đã hết hạn' };
  var dt = timDTTheoSdt(ph.sdt); if (!dt) return { ok: true, la: false };
  var tt = String(dt.v[10]), ma = String(dt.v[0]), kq = { ok: true, la: true, ma: ma, tt: tt, duocVao: tt === DTT.DUYET && ph.manh };
  if (String(p.vao) !== '1') return kq;
  if (tt !== DTT.DUYET) return { ok: false, msg: tt === DTT.CHO ? 'Đăng ký đối tác đang chờ shop duyệt.' : 'Tài khoản đối tác đang ' + tt.toLowerCase() + '. Liên hệ shop ' + HOTLINE + '.' };
  if (!ph.manh) return { ok: false, canMk: true, msg: 'Mẹ đăng nhập bằng OTP hoặc mật khẩu riêng để vào thẳng trang đối tác nhé.' };
  var token = taoToken(); sheetPDT().appendRow([token, ma, new Date(Date.now() + 30 * 864e5), new Date()]);
  return { ok: true, token: token, ma: ma };
}
function phienDT(token) {
  if (!token) return null; var v = docBang(sheetPDT(), 3);
  for (var i = v.length - 1; i >= 0; i--) if (String(v[i][0]) === String(token)) { if (new Date(v[i][2]).getTime() < Date.now()) return null; var dt = timDT(v[i][1]); return dtHoatDong(dt) ? dt : null; }
  return null;
}
/* 5. Bảng điều khiển của đối tác */
function apiAffHoSo(p) {
  var dt = phienDT(p.token); if (!dt) return { ok: false, loi: 'token', msg: 'Phiên đã hết hạn, đăng nhập lại nhé' };
  var ma = String(dt.v[0]), cfg = affCauHinh(), now = Date.now();
  var lb = docBang(sheetLB(), 3).filter(function (r) { return String(r[2]) === ma; });
  var ngay = {}; lb.forEach(function (r) { var d = Utilities.formatDate(new Date(r[1]), 'Asia/Ho_Chi_Minh', 'dd/MM'); ngay[d] = (ngay[d] || 0) + 1; });
  var bieuDo = []; for (var k = 13; k >= 0; k--) { var d = Utilities.formatDate(new Date(now - k * 864e5), 'Asia/Ho_Chi_Minh', 'dd/MM'); bieuDo.push({ ngay: d, luot: ngay[d] || 0 }); }
  var don = docBang(sheetDD(), H_DD.length).filter(function (r) { return String(r[3]) === ma; });
  var banSp = {};   // số đơn của đối tác này theo từng sản phẩm (để đối tác biết SP nào bán tốt)
  don.forEach(function (r) { if (String(r[11]) === DDT.HUY || String(r[11]) === DDT.KHONG) return; var ct = []; try { ct = JSON.parse(String(r[19] || "[]")); } catch (e) { ct = []; } ct.forEach(function (x) { if (x.id && x.id !== "*") banSp[x.id] = (banSp[x.id] || 0) + 1; }); });
  var tk = { cho: 0, choDoiTra: 0, duocTra: 0, daTra: 0, soDon: 0 };
  var dsDon = don.slice(-100).reverse().map(function (r) {
    var tt = String(r[11]), hh = soNguyen(r[10]);
    if (tt !== DDT.HUY && tt !== DDT.KHONG) tk.soDon++;
    if (tt === DDT.CHO) tk.cho += hh;
    if (tt === DDT.GIAO && !r[13]) { if (now - new Date(r[12]).getTime() < Number(cfg.choDoiTraNgay) * 864e5) tk.choDoiTra += hh; else tk.duocTra += hh; }
    return { ma: String(r[0]), ngay: ngayVN(r[1]), khach: anSdt(r[2]), nguon: String(r[4]), tien: soNguyen(r[7]), pt: r[9], hh: hh, tt: tt, ky: String(r[13] || ''), sp: String(r[16] || '') };
  });
  var ky = docBang(sheetKY(), H_KY.length).filter(function (r) { return String(r[1]) === ma; }).reverse().map(function (r) {
    if (String(r[9]) === 'Đã trả') tk.daTra += soNguyen(r[8]);
    return { ma: String(r[0]), ngay: Utilities.formatDate(new Date(r[2]), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'), soDon: r[3], tong: soNguyen(r[4]), dc: soNguyen(r[5]), thue: soNguyen(r[7]), nhan: soNguyen(r[8]), tt: String(r[9]), traLuc: r[10] ? ngayVN(r[10]) : '' };
  });
  return { ok: true, doiTac: { ma: ma, ten: String(dt.v[1]), sdt: anSdt(dt.v[2]), email: anEmail(dt.v[3]), nganHang: String(dt.v[5]), stk: anTK(dt.v[6]), loaiThue: String(dt.v[9]) },
    bangHH: (function () { var m = docHHSP(); var sp = {}; Object.keys(m).forEach(function (k) { sp[k] = { pt: m[k].pt, tat: m[k].tat }; });
      return { macDinh: Number(cfg.hh.link) || 0, chiSpTrongDs: cfg.chiSpTrongDs !== false, sp: sp, cds: cdDangChay(ma, Date.now()).map(function (c) { return { ten: c.ten, tatCa: c.tatCa, ptChung: c.ptChung, sp: c.sp, kt: c.kt ? ngayVN(new Date(c.kt)) : '' }; }) }; })(),
    cauHinh: { ngay: cfg.ngay, hh: cfg.hh, hienTyLe: !!cfg.hienTyLe, coChe: String(cfg.coChe || ''), ngayTra: cfg.ngayTra, choDoiTraNgay: cfg.choDoiTraNgay, thueTyLe: cfg.thueTyLe, thueNguong: cfg.thueNguong },
    banSp: banSp,
    luotBam: lb.length, bieuDo: bieuDo, tk: tk, don: dsDon, ky: ky };
}
function apiAffCongKhai() { var c = affCauHinh(); return { ok: true, bat: !!c.bat, hienTyLe: !!c.hienTyLe, coChe: String(c.coChe || ''), ngay: c.ngay, hh: c.hh, ngayTra: c.ngayTra, choDoiTraNgay: c.choDoiTraNgay, thueTyLe: c.thueTyLe, thueNguong: c.thueNguong, gioiThieu: c.gioiThieu }; }

/* ---------- Hoa hồng theo SẢN PHẨM + CHIẾN DỊCH RIÊNG cho đối tác ----------
   Mức % cho mỗi dòng sản phẩm của đơn (shop chốt 07/10/2026):
     1) Chiến dịch riêng đang chạy có đối tác + sản phẩm đó (nhiều chiến dịch → lấy mức cao nhất)
     2) % của sản phẩm (tab Hoa hồng sản phẩm); sản phẩm bị "Loại bỏ" → 0%
     3) % mặc định theo nguồn (Cấu hình)
   Đã có (1) hoặc (2) thì mọi nguồn dùng chung mức đó. Tự mua → 0. Tiền từng dòng = tiền hàng khách trả chia theo tỉ lệ giá × SL. */
var SHEET_HSP = 'Hoa hồng SP', SHEET_CD = 'Chiến dịch ĐT';
var H_HSP = ['Mã SP', '% hoa hồng', 'Không tính HH', 'Áp dụng từ', 'Cập nhật', 'Người sửa'];
var H_CD = ['Mã CD', 'Tên', 'Đối tác', 'Tất cả SP', '% chung', 'Sản phẩm (JSON)', 'Bắt đầu', 'Kết thúc', 'Trạng thái', 'Tạo lúc', 'Người tạo', 'Cập nhật'];
function sheetHSP() { return sheetPhu(SHEET_HSP, H_HSP); } function sheetCD() { return sheetPhu(SHEET_CD, H_CD); }
function docHHSP() {
  var m = {}; docBang(sheetHSP(), H_HSP.length).forEach(function (r, i) { var id = String(r[0]).replace(/^'/, ''); if (!id) return;
    m[id] = { dong: i + 2, pt: r[1] === '' || r[1] == null ? null : Number(r[1]), tat: String(r[2]) === '1', tu: r[3] ? ngayVN(r[3]) : '', capNhat: r[4] ? ngayVN(r[4]) : '', nguoi: String(r[5] || '') }; });
  return m;
}
function docCD() {
  return docBang(sheetCD(), H_CD.length).map(function (r, i) {
    var sp = {}; try { sp = JSON.parse(String(r[5] || '{}')); } catch (e) { sp = {}; }
    return { dong: i + 2, ma: String(r[0]), ten: String(r[1]), dts: String(r[2] || '').split(',').map(chuanMaDT).filter(String), tatCa: String(r[3]) === '1', ptChung: r[4] === '' ? null : Number(r[4]),
      sp: sp, bd: r[6] ? new Date(r[6]).getTime() : 0, kt: r[7] ? new Date(r[7]).getTime() : 0, tt: String(r[8] || 'Đang chạy'), tao: r[9] ? ngayVN(r[9]) : '', nguoi: String(r[10] || '') };
  });
}
function cdDangChay(ma, t, ds) { return (ds || docCD()).filter(function (c) { return c.tt === 'Đang chạy' && c.dts.indexOf(ma) > -1 && (!c.bd || c.bd <= t) && (!c.kt || c.kt >= t); }); }
/* items: [[id, sl, gia], …] (có thể rỗng – đơn gán tay) → { pt (% bình quân), hh, ct: [{id,t,p,h,c,n}], cd } */
function tinhHH(ma, nguon, items, tien, t, cfg) {
  if (nguon === 'tuMua') return { pt: 0, hh: 0, ct: [], cd: '' };
  var sp = docHHSP(), cds = cdDangChay(ma, t), macDinh = Number(cfg.hh[nguon]) || 0;
  var muc = function (id) {
    var best = null, cdMa = '';
    cds.forEach(function (c) { var v = c.tatCa ? c.ptChung : (c.sp[id] != null ? Number(c.sp[id]) : null); if (v != null && isFinite(v) && (best === null || v > best)) { best = v; cdMa = c.ma; } });
    if (best !== null) return { p: best, c: cdMa, n: 'Chiến dịch' };
    if (id === '*') return { p: macDinh, c: '', n: 'Mặc định' };   // đơn gán tay không có chi tiết sản phẩm
    var s = sp[id]; if (s && s.tat) return { p: 0, c: '', n: 'SP loại bỏ' };
    if (s) return { p: s.pt != null ? s.pt : macDinh, c: '', n: 'Theo SP' };
    /* Sản phẩm CHƯA thêm vào chương trình: không có hoa hồng (shop chỉ làm affiliate một số sản phẩm) */
    return cfg.chiSpTrongDs === false ? { p: macDinh, c: '', n: 'Mặc định' } : { p: 0, c: '', n: 'Không tham gia' };
  };
  var ds = (items || []).filter(function (x) { return x && x[0]; });
  if (!ds.length) { var m = muc('*'); var h0 = Math.round(tien * m.p / 100); return { pt: m.p, hh: h0, ct: [{ id: '*', t: tien, p: m.p, h: h0, c: m.c, n: m.n }], cd: m.c }; }
  var tong = ds.reduce(function (a, x) { return a + Math.max(0, Number(x[1]) || 1) * Math.max(0, Number(x[2]) || 0); }, 0);
  var ct = [], hh = 0, daChia = 0, cdSet = {};
  ds.forEach(function (x, i) {
    var dong = Math.max(0, Number(x[1]) || 1) * Math.max(0, Number(x[2]) || 0);
    var tt = i === ds.length - 1 ? tien - daChia : (tong ? Math.round(dong * tien / tong) : Math.round(tien / ds.length)); daChia += tt;
    var m = muc(String(x[0])); var h = Math.round(tt * m.p / 100); hh += h; if (m.c) cdSet[m.c] = 1;
    ct.push({ id: String(x[0]), t: tt, p: m.p, h: h, c: m.c, n: m.n });
  });
  return { pt: tien ? Math.round(hh / tien * 10000) / 100 : 0, hh: hh, ct: ct, cd: Object.keys(cdSet).join(',') };
}
/* Hiệu quả theo sản phẩm / chiến dịch (đơn chưa huỷ / không tính) */
function hieuQuaHH() {
  var sp = {}, cd = {};
  docBang(sheetDD(), H_DD.length).forEach(function (r) {
    var tt = String(r[11]); if (tt === DDT.HUY || tt === DDT.KHONG) return; var ct = []; try { ct = JSON.parse(String(r[19] || '[]')); } catch (e) { ct = []; }
    var daDem = {};
    ct.forEach(function (x) {
      var a = sp[x.id] = sp[x.id] || { don: 0, tien: 0, hh: 0 }; a.don++; a.tien += Number(x.t) || 0; a.hh += Number(x.h) || 0;
      if (x.c) { var b = cd[x.c] = cd[x.c] || { don: 0, tien: 0, hh: 0 }; if (!daDem[x.c]) { b.don++; daDem[x.c] = 1; } b.tien += Number(x.t) || 0; b.hh += Number(x.h) || 0; }
    });
  });
  return { sp: sp, cd: cd };
}
function apiQtAffSp(p) {
  if (!coQuyen(p, 'affiliate.view')) return { ok: false, msg: 'Không có quyền' };
  var m = docHHSP(); Object.keys(m).forEach(function (k) { delete m[k].dong; });
  return { ok: true, sp: m, hieuQua: hieuQuaHH().sp, macDinh: affCauHinh().hh };
}
/* Sửa hàng loạt: ids "a,b,c", viec = dat (pt) | macDinh (xoá % riêng) | loai (không tính HH) | khoiPhuc */
function apiQtAffSpLuu(p) {
  if (!coQuyen(p, 'affiliate.settings')) return { ok: false, msg: 'Không có quyền sửa hoa hồng' };
  var ids = String(p.ids || '').split(',').map(function (x) { return x.trim().replace(/[^\w-]/g, ''); }).filter(String).slice(0, 500);
  if (!ids.length) return { ok: false, msg: 'Chưa chọn sản phẩm' };
  var viec = String(p.viec || 'dat'), pt = Number(p.pt);
  if (viec === 'dat' && !(p.pt !== '' && isFinite(pt) && pt >= 0 && pt <= 50)) return { ok: false, msg: 'Tỉ lệ hoa hồng từ 0 đến 50%' };
  var ai = tenQT(p);
  return voiKhoa(function () {
    var s = sheetHSP(), m = docHHSP(), now = new Date();
    ids.forEach(function (id) {
      var r = m[id], cu = r ? [r.pt == null ? '' : r.pt, r.tat ? '1' : ''] : ['', ''];
      var moi = viec === 'dat' ? [Math.round(pt * 100) / 100, ''] : viec === 'macDinh' ? ['', ''] : viec === 'loai' ? [cu[0], '1'] : [cu[0], ''];
      if (r) s.getRange(r.dong, 2, 1, 5).setValues([[moi[0], moi[1], viec === 'dat' || !r.tu ? now : s.getRange(r.dong, 4).getValue(), now, ai]]);
      else s.appendRow(["'" + id, moi[0], moi[1], now, now, ai]);
    });
    ghiNhatKy('Hoa hồng SP', ai, ({ dat: 'Đặt ' + pt + '%', macDinh: 'Về mức mặc định', loai: 'Loại bỏ (không tính HH)', khoiPhuc: 'Khôi phục' }[viec] || viec) + ' cho ' + ids.length + ' SP: ' + ids.slice(0, 20).join(', '));
    return { ok: true, soSp: ids.length };
  });
}
function apiQtAffCd(p) {
  if (!coQuyen(p, 'affiliate.view')) return { ok: false, msg: 'Không có quyền' };
  var hq = hieuQuaHH().cd, now = Date.now();
  var ds = docCD().map(function (c) { delete c.dong; c.hieuQua = hq[c.ma] || { don: 0, tien: 0, hh: 0 };
    c.trangThai = c.tt !== 'Đang chạy' ? c.tt : c.bd > now ? 'Sắp diễn ra' : c.kt && c.kt < now ? 'Đã kết thúc' : 'Đang diễn ra';
    c.batDau = c.bd ? Utilities.formatDate(new Date(c.bd), 'Asia/Ho_Chi_Minh', "yyyy-MM-dd'T'HH:mm") : ''; c.ketThuc = c.kt ? Utilities.formatDate(new Date(c.kt), 'Asia/Ho_Chi_Minh', "yyyy-MM-dd'T'HH:mm") : ''; return c; }).reverse();
  return { ok: true, ds: ds };
}
function apiQtAffCdLuu(p) {
  if (!coQuyen(p, 'affiliate.settings')) return { ok: false, msg: 'Không có quyền sửa hoa hồng' };
  var ten = String(p.ten || '').trim().slice(0, 100), dts = String(p.dts || '').split(',').map(chuanMaDT).filter(String);
  var tatCa = String(p.tatCa) === '1', ptChung = p.ptChung === '' || p.ptChung == null ? null : Number(p.ptChung), sp = {};
  try { var raw = JSON.parse(String(p.sp || '{}')); Object.keys(raw).slice(0, 500).forEach(function (k) { var v = Number(raw[k]); if (isFinite(v) && v >= 0 && v <= 50) sp[String(k).replace(/[^\w-]/g, '')] = Math.round(v * 100) / 100; }); } catch (e) { return { ok: false, msg: 'Danh sách sản phẩm không hợp lệ' }; }
  if (ten.length < 2) return { ok: false, msg: 'Nhập tên chiến dịch' };
  if (!dts.length) return { ok: false, msg: 'Chọn ít nhất 1 đối tác' };
  if (tatCa && !(ptChung != null && isFinite(ptChung) && ptChung >= 0 && ptChung <= 50)) return { ok: false, msg: 'Nhập % chung (0–50%)' };
  if (!tatCa && !Object.keys(sp).length) return { ok: false, msg: 'Chọn ít nhất 1 sản phẩm và nhập %' };
  var bd = p.batDau ? new Date(String(p.batDau) + (String(p.batDau).length <= 16 ? ':00+07:00' : '')) : new Date();
  var kt = p.ketThuc ? new Date(String(p.ketThuc) + (String(p.ketThuc).length <= 16 ? ':00+07:00' : '')) : '';
  if (isNaN(bd.getTime()) || (kt && (isNaN(kt.getTime()) || kt <= bd))) return { ok: false, msg: 'Thời gian chưa đúng (kết thúc phải sau bắt đầu)' };
  var ai = tenQT(p);
  return voiKhoa(function () {
    var dtsCo = dts.filter(function (m) { return timDT(m); }); if (!dtsCo.length) return { ok: false, msg: 'Không thấy đối tác' };
    var hang = [ten, dtsCo.join(','), tatCa ? '1' : '', tatCa ? ptChung : '', JSON.stringify(tatCa ? {} : sp), bd, kt];
    var s = sheetCD(); var cu = p.ma ? docCD().filter(function (c) { return c.ma === String(p.ma); })[0] : null;
    if (cu) { s.getRange(cu.dong, 2, 1, 7).setValues([hang]); s.getRange(cu.dong, 12).setValue(new Date()); ghiNhatKy('Chiến dịch ĐT', cu.ma, 'Sửa: ' + ten + ' – bởi ' + ai); return { ok: true, ma: cu.ma }; }
    /* Chống tạo trùng khi bấm 2 lần: mỗi lần mở form có 1 mã phiên, gửi lại cùng mã → trả chiến dịch đã tạo */
    var bn = CacheService.getScriptCache(), kp = p.phien ? 'cdTao_' + String(p.phien).replace(/[^\w-]/g, '').slice(0, 40) : '';
    var daTao = kp ? bn.get(kp) : null; if (daTao) return { ok: true, ma: daTao, trung: true };
    var daCo = {}, ma = ''; docCD().forEach(function (c) { daCo[c.ma] = 1; });
    do { ma = 'CD' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyMMddHHmm') + Math.floor(Math.random() * 900 + 100); } while (daCo[ma]);
    s.appendRow([ma].concat(hang).concat(['Đang chạy', new Date(), ai, new Date()]));
    if (kp) bn.put(kp, ma, 1800);
    ghiNhatKy('Chiến dịch ĐT', ma, 'Tạo: ' + ten + ' (' + dtsCo.join(', ') + ') – bởi ' + ai);
    return { ok: true, ma: ma };
  });
}
function apiQtAffCdDung(p) {
  if (!coQuyen(p, 'affiliate.settings')) return { ok: false, msg: 'Không có quyền' };
  var tt = p.viec === 'chay' ? 'Đang chạy' : 'Đã dừng';
  return voiKhoa(function () { var c = docCD().filter(function (x) { return x.ma === String(p.ma); })[0]; if (!c) return { ok: false, msg: 'Không thấy chiến dịch' };
    sheetCD().getRange(c.dong, 9).setValue(tt); sheetCD().getRange(c.dong, 12).setValue(new Date()); ghiNhatKy('Chiến dịch ĐT', c.ma, tt + ' – bởi ' + tenQT(p)); return { ok: true }; });
}
function apiQtAffCdXoa(p) {
  if (!coQuyen(p, 'affiliate.settings')) return { ok: false, msg: 'Không có quyền' };
  return voiKhoa(function () { var c = docCD().filter(function (x) { return x.ma === String(p.ma); })[0]; if (!c) return { ok: false, msg: 'Không thấy chiến dịch' };
    sheetCD().deleteRow(c.dong); ghiNhatKy('Chiến dịch ĐT', c.ma, 'Xoá: ' + c.ten + ' – bởi ' + tenQT(p)); return { ok: true }; });
}

/* ---------- 6. Xử lý nền theo CRM + chốt kỳ ngày 10 ---------- */
function xuLyAff() {
  var cfg = affCauHinh(); var now = Date.now(); var kq = { ok: true, giao: 0, huy: 0, hoan: 0, ky: 0, loi: [] };
  var dd = docBang(sheetDD(), H_DD.length); var theoDoi = 60 * 864e5; var canXem = {};
  dd.forEach(function (r) { var tt = String(r[11]); if (tt === DDT.CHO || (tt === DDT.GIAO && now - new Date(r[12]).getTime() < theoDoi)) canXem[chuanSdt(r[2])] = 1; });
  var crm = {}; Object.keys(canXem).slice(0, 60).forEach(function (s) { try { crm[s] = crmKhachCache(s); } catch (e) { crm[s] = null; } });
  var res = voiKhoa(function () {
    var s = sheetDD(); dd = docBang(s, H_DD.length);
    for (var i = 0; i < dd.length; i++) {
      var r = dd[i], sdt = chuanSdt(r[2]); if (!(sdt in crm)) continue; var c = crm[sdt]; if (!c || !c.ok) continue;
      var d = timDonCRM(c, r[0], r[8], r[1]); var tt = String(r[11]);
      if (!d) { if (tt === DDT.CHO && now - new Date(r[1]).getTime() > 7 * 864e5) { s.getRange(i + 2, 12).setValue(DDT.KHONG); s.getRange(i + 2, 19).setValue('Không thấy đơn trong CRM sau 7 ngày'); } continue; }
      var moi = ttTuCRM(d.trangThai); var tienCRM = Number(d.tien != null ? d.tien : d.tong) || 0;
      if (tt === DDT.CHO && moi === 'Đã giao') {
        var tien = soNguyen(r[7]); if (r[8] && tienCRM && soNguyen(r[8]) - tienCRM > 1000) tien = Math.max(0, tien - (soNguyen(r[8]) - tienCRM));   // hoàn 1 phần trước khi giao xong
        s.getRange(i + 2, 8).setValue(tien); s.getRange(i + 2, 11, 1, 3).setValues([[Math.round(tien * Number(r[9]) / 100), DDT.GIAO, new Date()]]); s.getRange(i + 2, 16).setValue(new Date()); kq.giao++;
      } else if (tt === DDT.CHO && moi === 'Đã huỷ') { s.getRange(i + 2, 12).setValue(DDT.HUY); s.getRange(i + 2, 16).setValue(new Date()); kq.huy++; }
      else if (tt === DDT.GIAO && (moi === 'Đã hoàn hàng' || moi === 'Đã huỷ')) {
        s.getRange(i + 2, 12).setValue(DDT.HOAN); s.getRange(i + 2, 16).setValue(new Date());
        s.getRange(i + 2, 19).setValue(r[13] ? 'Đã trả ở kỳ ' + r[13] + ' – trừ lại ở kỳ sau' : 'Hoàn hàng trước khi trả – không tính'); kq.hoan++;
      }
    }
    return kq;
  });
  /* Chốt kỳ tự động: từ ngày [ngayTra] mỗi tháng, mỗi tháng 1 lần */
  var thang = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM'); var ngayHom = Number(Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'd'));
  var pr = PropertiesService.getScriptProperties();
  if (ngayHom >= Number(cfg.ngayTra) && pr.getProperty('AFF_KY_THANG') !== thang) { var t = chotKy(new Date(), 'hệ thống'); if (t.ok) { pr.setProperty('AFF_KY_THANG', thang); res.ky = t.soKy; } }
  return res;
}
/* Chốt kỳ: mỗi đối tác đã duyệt → gom đơn Đã giao quá N ngày chưa vào kỳ + khoản trừ do hoàn hàng sau khi đã trả → tính thuế */
function chotKy(ngayChot, ai) {
  var cfg = affCauHinh(); var moc = new Date(ngayChot).getTime() - Number(cfg.choDoiTraNgay) * 864e5;
  return voiKhoa(function () {
    var s = sheetDD(); var dd = docBang(s, H_DD.length); var dts = docBang(sheetDT(), H_DT.length); var soKy = 0;
    var nhan = Utilities.formatDate(new Date(ngayChot), 'Asia/Ho_Chi_Minh', 'yyMMdd');
    dts.forEach(function (d) {
      var ma = String(d[0]); if (String(d[10]) !== DTT.DUYET && String(d[10]) !== DTT.KHOA) return;
      var don = [], tong = 0, dc = 0, dongDon = [], dongTru = [];
      dd.forEach(function (r, i) {
        if (String(r[3]) !== ma) return;
        if (String(r[11]) === DDT.GIAO && !r[13] && new Date(r[12]).getTime() <= moc) { tong += soNguyen(r[10]); don.push(String(r[0])); dongDon.push(i + 2); }
        if (String(r[11]) === DDT.HOAN && r[13] && !r[14]) { dc -= soNguyen(r[10]); don.push(String(r[0]) + '(trừ)'); dongTru.push(i + 2); }
      });
      if (!don.length) return;
      var tinhThue = tong + dc; if (tinhThue <= 0) return;   // âm / bằng 0 → dồn sang kỳ sau
      var loai = String(d[9]); var thue = loai === 'ca-nhan' && tinhThue >= Number(cfg.thueNguong) ? Math.round(tinhThue * Number(cfg.thueTyLe) / 100) : 0;
      var maKy = 'KY' + nhan + '-' + ma;
      sheetKY().appendRow([maKy, ma, new Date(ngayChot), dongDon.length, tong, dc, tinhThue, thue, tinhThue - thue, 'Chờ trả', '', '', '', don.join(', '), loai === 'ca-nhan' ? '' : (loai === 'cam-ket-08' ? 'Không khấu trừ – đã có cam kết 08/CK-TNCN' : 'Không khấu trừ – doanh nghiệp / HKD xuất hoá đơn')]);
      dongDon.forEach(function (n) { s.getRange(n, 14).setValue(maKy); }); dongTru.forEach(function (n) { s.getRange(n, 15).setValue(maKy); });
      soKy++;
    });
    if (soKy) ghiNhatKy('Đối tác', ai || 'hệ thống', 'Chốt kỳ thanh toán ' + nhan + ': ' + soKy + ' đối tác');
    return { ok: true, soKy: soKy };
  });
}

/* ---------- 7. API quản trị ---------- */
/* C5 – CCCD / MST và số tài khoản chỉ hiện đầy đủ cho người có quyền thanh toán đối tác (affiliate.pay); mỗi lần xem được ghi nhật ký */
function anCccd_(x) { x = String(x || ''); return x.length > 3 ? '•••••' + x.slice(-3) : x; }
function cheNhayCam_(p, ds, viec) {
  if (coQuyen(p, 'affiliate.pay')) { var ai = tenQT(p), k = 'xemnc_' + ai + '_' + viec; if (demGioiHan(k, 1, 3600)) ghiNhatKy('Bảo mật', ai, 'Xem CCCD / số tài khoản đối tác (' + viec + ', ' + ds.length + ' dòng)'); return ds; }
  ds.forEach(function (x) { x.cccd = anCccd_(x.cccd); x.stk = anTK(x.stk); x.che = true; }); return ds;
}
function apiQtAffDs(p) {
  if (!coQuyen(p, 'affiliate.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var lb = docBang(sheetLB(), 3), dd = docBang(sheetDD(), H_DD.length), tkMa = {};
  lb.forEach(function (r) { var m = String(r[2]); (tkMa[m] = tkMa[m] || { bam: 0, don: 0, doanhThu: 0, hh: 0 }).bam++; });
  dd.forEach(function (r) { var m = String(r[3]), t = tkMa[m] = tkMa[m] || { bam: 0, don: 0, doanhThu: 0, hh: 0 }; if (String(r[11]) === DDT.GIAO || String(r[11]) === DDT.CHO) { t.don++; t.doanhThu += soNguyen(r[7]); t.hh += soNguyen(r[10]); } });
  var ds = docBang(sheetDT(), H_DT.length).map(function (r) { var m = String(r[0]); return { ma: m, ten: String(r[1]), sdt: chuanSdt(r[2]), email: String(r[3]), kenh: String(r[4]), nganHang: String(r[5]), stk: String(r[6]), chuTk: String(r[7]), cccd: String(r[8]), loaiThue: String(r[9]), tt: String(r[10]), dangKy: ngayVN(r[11]), duyet: r[12] ? ngayVN(r[12]) : '', ghiChu: String(r[16] || ''), tk: tkMa[m] || { bam: 0, don: 0, doanhThu: 0, hh: 0 } }; }).reverse();
  return { ok: true, ds: cheNhayCam_(p, ds, 'danh sách'), cauHinh: affCauHinh() };
}
function apiQtAffDuyet(p) {
  if (!coQuyen(p, 'affiliate.update')) return { ok: false, msg: 'Không có quyền' };
  var tt = { duyet: DTT.DUYET, tuChoi: DTT.TU_CHOI, khoa: DTT.KHOA, moKhoa: DTT.DUYET }[p.viec]; if (!tt && p.viec !== 'capNhat') return { ok: false, msg: 'Thao tác không hợp lệ' };
  return voiKhoa(function () {
    var dt = timDT(p.ma); if (!dt) return { ok: false, msg: 'Không thấy đối tác' };
    var s = sheetDT(); if (tt) s.getRange(dt.dong, 11).setValue(tt);
    if (p.viec === 'duyet') s.getRange(dt.dong, 13, 1, 2).setValues([[new Date(), tenQT(p)]]);
    if (p.loaiThue && ['ca-nhan', 'cam-ket-08', 'doanh-nghiep'].indexOf(p.loaiThue) > -1) s.getRange(dt.dong, 10).setValue(p.loaiThue);
    if (p.ghiChu != null) s.getRange(dt.dong, 17).setValue(String(p.ghiChu).slice(0, 300));
    ghiNhatKy('Đối tác', String(dt.v[0]), (tt || 'Cập nhật' + (p.loaiThue ? ' hình thức thuế: ' + p.loaiThue : '')) + ' – bởi ' + tenQT(p));
    var mail = String(dt.v[3]);
    if (emailHopLe(mail) && (p.viec === 'duyet' || p.viec === 'tuChoi')) { try { MailApp.sendEmail(mail, p.viec === 'duyet' ? 'Chào mừng bạn trở thành đối tác ' + TEN_SHOP : 'Kết quả đăng ký đối tác ' + TEN_SHOP,
      p.viec === 'duyet' ? 'Xin chào ' + dt.v[1] + ',\n\nĐăng ký đối tác của bạn đã được duyệt. Mã đối tác: ' + dt.v[0] + '\nĐăng nhập để lấy link sản phẩm và theo dõi hoa hồng: ' + WEB + '/doi-tac.html\n\n' + TEN_SHOP
        : 'Xin chào ' + dt.v[1] + ',\n\nRất tiếc đăng ký đối tác của bạn chưa được duyệt lúc này.' + (p.ghiChu ? '\nLý do: ' + p.ghiChu : '') + '\nLiên hệ ' + HOTLINE + ' nếu cần hỗ trợ.\n\n' + TEN_SHOP, { name: TEN_SHOP }); } catch (e) { Logger.log(e); } }
    return { ok: true };
  });
}
function apiQtAffDon(p) {
  if (!coQuyen(p, 'affiliate.view')) return { ok: false, msg: 'Không có quyền' };
  var ds = docBang(sheetDD(), H_DD.length).map(function (r) { return { ma: String(r[0]), ngay: ngayVN(r[1]), sdt: chuanSdt(r[2]), dt: String(r[3]), nguon: String(r[4]), lb: String(r[5]), bamLuc: r[6] ? ngayVN(r[6]) : '',
    cachPhut: r[6] ? Math.round((new Date(r[1]).getTime() - new Date(r[6]).getTime()) / 60000) : null, tien: soNguyen(r[7]), tong: soNguyen(r[8]), pt: r[9], hh: soNguyen(r[10]), tt: String(r[11]),
    giao: r[12] ? ngayVN(r[12]) : '', ky: String(r[13] || ''), tru: String(r[14] || ''), sp: String(r[16] || ''), nguoiGan: String(r[17] || ''), ghiChu: String(r[18] || '') }; }).reverse();
  return { ok: true, ds: ds.slice(0, 2000) };
}
/* Gán tay đơn Zalo / gọi điện cho đối tác */
function apiQtAffGanTay(p) {
  if (!coQuyen(p, 'affiliate.update')) return { ok: false, msg: 'Không có quyền' };
  var cfg = affCauHinh(); var maDon = String(p.maDon || '').trim().slice(0, 30), sdt = chuanSdt(p.sdt), ma = chuanMaDT(p.maDT), nguon = p.nguon === 'zalo' ? 'zalo' : 'ganTay';
  var tien = Math.max(0, soNguyen(p.tien)), lyDo = String(p.lyDo || '').trim().slice(0, 200);
  if (!maDon || !sdtHopLe(sdt) || !tien) return { ok: false, msg: 'Nhập mã đơn, SĐT khách và tiền hàng' };
  if (lyDo.length < 3) return { ok: false, msg: 'Bắt buộc ghi lý do' };
  return voiKhoa(function () {
    var dt = timDT(ma); if (!dtHoatDong(dt)) return { ok: false, msg: 'Mã đối tác không hợp lệ hoặc chưa duyệt' };
    if (docBang(sheetDD(), 1).some(function (r) { return String(r[0]) === maDon; })) return { ok: false, msg: 'Đơn này đã được gắn đối tác' };
    var tu = chuanSdt(dt.v[2]) === sdt; var tay = p.pt !== '' && p.pt != null && isFinite(Number(p.pt)) ? Math.max(0, Math.min(50, Number(p.pt))) : null;
    var hh = tu ? { pt: 0, hh: 0, ct: [], cd: '' } : tay != null ? { pt: tay, hh: Math.round(tien * tay / 100), ct: [{ id: '*', t: tien, p: tay, h: Math.round(tien * tay / 100), c: '', n: 'Nhập tay' }], cd: '' } : tinhHH(ma, nguon, [], tien, Date.now(), cfg);
    sheetDD().appendRow([maDon, new Date(), "'" + sdt, ma, tu ? NGUON.tuMua : NGUON[nguon], '', '', tien, tien, hh.pt, hh.hh, tu ? DDT.KHONG : DDT.CHO, '', '', '', new Date(), String(p.sp || '').slice(0, 300), tenQT(p), lyDo, JSON.stringify(hh.ct), hh.cd]);
    ghiNhatKy('Đối tác', ma, 'Gán tay đơn ' + maDon + ' (' + NGUON[nguon] + ') – ' + lyDo + ' – bởi ' + tenQT(p));
    return { ok: true };
  });
}
function apiQtAffKy(p) {
  if (!coQuyen(p, 'affiliate.view')) return { ok: false, msg: 'Không có quyền' };
  var dts = {}; docBang(sheetDT(), H_DT.length).forEach(function (r) { dts[String(r[0])] = r; });
  var ds = docBang(sheetKY(), H_KY.length).map(function (r) { var d = dts[String(r[1])] || []; return { ma: String(r[0]), dt: String(r[1]), ten: String(d[1] || ''), cccd: String(d[8] || ''), loaiThue: String(d[9] || ''), nganHang: String(d[5] || ''), stk: String(d[6] || ''), chuTk: String(d[7] || ''),
    ngay: Utilities.formatDate(new Date(r[2]), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy'), soDon: r[3], tong: soNguyen(r[4]), dc: soNguyen(r[5]), tinhThue: soNguyen(r[6]), thue: soNguyen(r[7]), nhan: soNguyen(r[8]), tt: String(r[9]), traLuc: r[10] ? ngayVN(r[10]) : '', gd: String(r[11] || ''), nguoiTra: String(r[12] || ''), don: String(r[13] || ''), ghiChu: String(r[14] || '') }; }).reverse();
  return { ok: true, ds: cheNhayCam_(p, ds, 'kỳ thanh toán') };
}
function apiQtAffChotKy(p) { if (!coQuyen(p, 'affiliate.pay')) return { ok: false, msg: 'Không có quyền' }; return chotKy(new Date(), tenQT(p)); }
function apiQtAffTra(p) {
  if (!coQuyen(p, 'affiliate.pay')) return { ok: false, msg: 'Không có quyền' };
  var gd = String(p.gd || '').trim().slice(0, 60); if (gd.length < 3) return { ok: false, msg: 'Nhập mã giao dịch chuyển khoản' };
  return voiKhoa(function () {
    var s = sheetKY(); var v = docBang(s, H_KY.length);
    for (var i = 0; i < v.length; i++) if (String(v[i][0]) === String(p.maKy)) {
      if (String(v[i][9]) === 'Đã trả') return { ok: false, msg: 'Kỳ này đã trả rồi' };
      s.getRange(i + 2, 10, 1, 4).setValues([['Đã trả', new Date(), "'" + gd, tenQT(p)]]);
      ghiNhatKy('Đối tác', String(v[i][1]), 'Đã trả kỳ ' + v[i][0] + ': thực nhận ' + tien(v[i][8]) + ', thuế TNCN ' + tien(v[i][7]) + ' – GD ' + gd);
      var dt = timDT(v[i][1]); var mail = dt ? String(dt.v[3]) : '';
      if (emailHopLe(mail)) { try { MailApp.sendEmail(mail, 'Hoa hồng đối tác ' + TEN_SHOP + ' – kỳ ' + Utilities.formatDate(new Date(v[i][2]), 'Asia/Ho_Chi_Minh', 'MM/yyyy'),
        'Xin chào ' + dt.v[1] + ',\n\nShop đã chuyển hoa hồng kỳ ' + v[i][0] + ':\n- Tổng hoa hồng: ' + tien(v[i][4]) + (soNguyen(v[i][5]) ? '\n- Điều chỉnh (hoàn hàng): ' + tien(v[i][5]) : '') + '\n- Thuế TNCN đã khấu trừ: ' + tien(v[i][7]) + '\n- Thực nhận: ' + tien(v[i][8]) + '\n- Mã giao dịch: ' + gd + '\n\nChi tiết tại ' + WEB + '/doi-tac.html\n\n' + TEN_SHOP, { name: TEN_SHOP }); } catch (e) { Logger.log(e); } }
      return { ok: true };
    }
    return { ok: false, msg: 'Không thấy kỳ' };
  });
}
function apiQtAffCauHinh(p) {
  if (p.luu !== '1') { if (!coQuyen(p, 'affiliate.view')) return { ok: false, msg: 'Không có quyền' }; return { ok: true, cauHinh: affCauHinh() }; }
  if (!coQuyen(p, 'affiliate.settings')) return { ok: false, msg: 'Không có quyền sửa cấu hình đối tác' };
  var cu = affCauHinh(), moi = JSON.parse(JSON.stringify(cu));
  var so = function (v, min, max, mac) { var n = Number(v); return v == null || v === '' || !isFinite(n) ? mac : Math.max(min, Math.min(max, n)); };
  moi.bat = p.bat != null ? String(p.bat) === '1' : cu.bat;
  moi.ngay = so(p.ngay, 1, 90, cu.ngay); moi.choDoiTraNgay = so(p.choDoiTraNgay, 0, 60, cu.choDoiTraNgay); moi.ngayTra = so(p.ngayTra, 1, 28, cu.ngayTra);
  moi.thueTyLe = so(p.thueTyLe, 0, 50, cu.thueTyLe); moi.thueNguong = so(p.thueNguong, 0, 1e9, cu.thueNguong);
  ['link', 'khacMay', 'zalo', 'ganTay'].forEach(function (k) { moi.hh[k] = so(p['hh_' + k], 0, 50, cu.hh[k]); });
  if (p.gioiThieu != null) moi.gioiThieu = String(p.gioiThieu).slice(0, 500);
  if (p.coChe != null) moi.coChe = String(p.coChe).slice(0, 3000);
  if (p.hienTyLe != null) moi.hienTyLe = String(p.hienTyLe) === '1';
  if (p.chiSpTrongDs != null) moi.chiSpTrongDs = String(p.chiSpTrongDs) === '1';
  PropertiesService.getScriptProperties().setProperty('AFF_CAU_HINH', JSON.stringify(moi));
  ghiNhatKy('Cấu hình đối tác', tenQT(p), JSON.stringify(moi.hh) + ', hạn ' + moi.ngay + ' ngày, thuế ' + moi.thueTyLe + '% từ ' + moi.thueNguong);
  return { ok: true, cauHinh: moi };
}
function apiQtAffXuLy(p) { if (!coQuyen(p, 'affiliate.update')) return { ok: false, msg: 'Không có quyền' }; return xuLyAff(); }

/* ===================== API CHO WEBSITE (JSONP) ===================== */
function traVe(data, callback) {
  try { baoLenh_(data); } catch (e) { Logger.log('Cảnh báo lỗi: ' + e); }
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
  HD_ = { a: action, p: p };
  var chan = chanTanSuat_(action); if (chan) return traVe(chan, cb);
  try {
    if (action === 'kiemTra')  return traVe(apiKiemTra(p), cb);
    if (action === 'guiOtp')   return traVe(apiGuiOtp(p), cb);
    if (action === 'xacThuc')  return traVe(apiXacThuc(p), cb);
    if (action === 'hoSo')     return traVe(apiHoSo(p), cb);
    if (action === 'capNhat')  return traVe(apiCapNhat(p), cb);
    if (action === 'dangNhap') return traVe(apiDangNhap(p), cb);
    if (action === 'dangKy')   return traVe(apiDangKy(p), cb);
    if (action === 'thongKe')  return traVe(apiThongKe(p), cb);
    if (action === 'donHang')      return traVe(apiDonHang(p), cb);
    if (action === 'donChiTiet')   return traVe(apiDonChiTiet(p), cb);
    if (action === 'doiTrangThai') return traVe(apiDoiTrangThai(p), cb);
    if (action === 'dongBoCRM')    return traVe(apiDongBoCRM(p), cb);
    if (action === 'truyCap')      return traVe(apiTruyCap(p), cb);
    if (action === 'khachHang')    return traVe(apiKhachHang(p), cb);
    if (action === 'khachChiTiet') return traVe(apiKhachChiTiet(p), cb);
    if (action === 'khoaKhach')    return traVe(apiKhoaKhach(p), cb);
    if (action === 'nhatKy')       return traVe(apiNhatKy(p), cb);
    if (action === 'qtDangNhap')   return traVe(apiQtDangNhap(p), cb);
    if (action === 'qtDangNhap2')  return traVe(apiQtDangNhap2(p), cb);
    if (action === 'qtBiMat')      return traVe(apiQtBiMat(p), cb);
    if (action === 'qtHoSo')       return traVe(apiQtHoSo(p), cb);
    if (action === 'qtDs')         return traVe(apiQtDs(p), cb);
    if (action === 'qtLuu')        return traVe(apiQtLuu(p), cb);
    if (action === 'qtXoa')        return traVe(apiQtXoa(p), cb);
    if (action === 'doiMatKhau') return traVe(apiDoiMatKhau(p), cb);
    if (action === 'affBam')        return traVe(apiAffBam(p), cb);
    if (action === 'affSdt')        return traVe(apiAffSdt(p), cb);
    if (action === 'affGanDon')     return traVe(apiAffGanDon(p), cb);
    if (action === 'affDangKy')     return traVe(apiAffDangKy(p), cb);
    if (action === 'affDangNhap')   return traVe(apiAffDangNhap(p), cb);
    if (action === 'affTuKhach')    return traVe(apiAffTuKhach(p), cb);
    if (action === 'affHoSo')       return traVe(apiAffHoSo(p), cb);
    if (action === 'affCongKhai')   return traVe(apiAffCongKhai(), cb);
    if (action === 'qtAffDs')       return traVe(apiQtAffDs(p), cb);
    if (action === 'qtAffDuyet')    return traVe(apiQtAffDuyet(p), cb);
    if (action === 'qtAffDon')      return traVe(apiQtAffDon(p), cb);
    if (action === 'qtAffGanTay')   return traVe(apiQtAffGanTay(p), cb);
    if (action === 'qtAffKy')       return traVe(apiQtAffKy(p), cb);
    if (action === 'qtAffChotKy')   return traVe(apiQtAffChotKy(p), cb);
    if (action === 'qtAffTra')      return traVe(apiQtAffTra(p), cb);
    if (action === 'qtAffCauHinh')  return traVe(apiQtAffCauHinh(p), cb);
    if (action === 'qtAffXuLy')     return traVe(apiQtAffXuLy(p), cb);
    if (action === 'qtAffSp')       return traVe(apiQtAffSp(p), cb);
    if (action === 'qtAffSpLuu')    return traVe(apiQtAffSpLuu(p), cb);
    if (action === 'qtAffCd')       return traVe(apiQtAffCd(p), cb);
    if (action === 'qtAffCdLuu')    return traVe(apiQtAffCdLuu(p), cb);
    if (action === 'qtAffCdDung')   return traVe(apiQtAffCdDung(p), cb);
    if (action === 'qtAffCdXoa')    return traVe(apiQtAffCdXoa(p), cb);
    if (action === 'qmkCauHinh')    return traVe(apiQmkCauHinh(), cb);
    if (action === 'qmkGui')        return traVe(apiQmkGui(p), cb);
    if (action === 'qmkXacThuc')    return traVe(apiQmkXacThuc(p), cb);
    if (action === 'qmkDatLai')     return traVe(apiQmkDatLai(p), cb);
    if (action === 'qtBaoMatKhach') return traVe(apiQtBaoMatKhach(p), cb);
    if (action === 'qtQmkCauHinh')  return traVe(apiQtQmkCauHinh(p), cb);
    if (action === 'gtCauHinh')     return traVe(apiGtCauHinh(), cb);
    if (action === 'gtKiemTra')     return traVe(apiGtKiemTra(p), cb);
    if (action === 'gtGiuCho')      return traVe(apiGtGiuCho(p), cb);
    if (action === 'diemCuaToi')    return traVe(apiDiemCuaToi(p), cb);
    if (action === 'gtCuaToi')      return traVe(apiGtCuaToi(p), cb);
    if (action === 'qtGioiThieu')   return traVe(apiQtGioiThieu(p), cb);
    if (action === 'qtDiem')        return traVe(apiQtDiem(p), cb);
    if (action === 'qtDiemLichSu')  return traVe(apiQtDiemLichSu(p), cb);
    if (action === 'qtDiemDieuChinh') return traVe(apiQtDiemDieuChinh(p), cb);
    if (action === 'qtGtCauHinh')   return traVe(apiQtGtCauHinh(p), cb);
    if (action === 'qtGtXuLy')      return traVe(apiQtGtXuLy(p), cb);
    if (action === 'qtGtLich')      return traVe(apiQtGtLich(p), cb);
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
/* Khoá cho trang quản trị đọc số liệu (admin.html). Đổi chuỗi này rồi dán lại vào trang quản trị. */
/* Khoá chủ shop dự phòng: KHÔNG ghi trong mã (repo công khai). Chỉ có hiệu lực khi đặt Script Property
   ADMIN_KEY dài ít nhất 24 ký tự (Apps Script → Cài đặt dự án → Thuộc tính tập lệnh). Bình thường để trống. */
function khoaChuShop_() { var k = String(PropertiesService.getScriptProperties().getProperty('ADMIN_KEY') || ''); return k.length >= 24 ? k : ''; }
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
  var tk = timTK(sdt); var dung = tk && tk.hash ? kiemMk(p.mk, tk) : String(p.mk) === MK_MAC_DINH;
  if (!dung) { cache.put(k, String(dem + 1), 3600); return { ok: false, msg: tk && tk.hash ? 'Mật khẩu chưa đúng. Quên mật khẩu thì bấm nhận mã OTP nhé' : 'Mật khẩu chưa đúng (mật khẩu mặc định là ' + MK_MAC_DINH + ')' }; }
  cache.remove(k);
  if (!d.dong) capNhatKhachHang(sdt, { name: d.kh.ten || '', phone: sdt, tinh: d.kh.tinh, xa: d.kh.xa, diaChi: d.kh.diaChi, email: d.kh.email }, {});
  var token = luuPhien(sdt, tk && tk.hash ? 'mk' : 'mkMacDinh');
  return { ok: true, token: token, kh: d.kh, donHang: d.don, macDinh: !(tk && tk.hash) };
}
/* Đăng ký khách mới – KHÔNG cần OTP, chỉ điền thông tin.
   An toàn: số điện thoại ĐÃ có hồ sơ thì từ chối, bắt đăng nhập hoặc xác thực OTP,
   để người lạ không ghi đè tên/địa chỉ của khách cũ. Không trả token: muốn xem
   hồ sơ, lịch sử đơn, tổng chi tiêu thì vẫn phải đăng nhập. */
/* Đăng ký kèm mã giới thiệu (p.ref): tạo tài khoản xong mới liên kết, ngoài khoá của phần đăng ký */
function apiDangKy(p) {
  var kq = apiDangKyGoc(p);
  if (kq && kq.ok && p.ref) {
    var sdt = chuanSdt(p.sdt), x = gtXetMa(p.ref, sdt);
    if (!x.ok) kq.gioiThieu = x;
    else kq.gioiThieu = voiKhoa(function () { var d = gtXetDong(sdt, chuanSdt(p.ref), ''); if (d.loi) return d.loi; if (!d.r) gtLienKet(sdt, chuanSdt(p.ref), 'Đăng ký'); return x; });
  }
  return kq;
}
function apiDangKyGoc(p) {
  var sdt = chuanSdt(p.sdt);
  if (!sdtHopLe(sdt)) return { ok: false, msg: 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0)' };
  var ten = String(p.ten || '').trim();
  if (ten.length < 2) return { ok: false, msg: 'Mẹ nhập họ tên nhé' };

  var cache = CacheService.getScriptCache(); var k = 'dk_' + sdt;
  var dem = Number(cache.get(k) || 0);
  if (dem >= 3) return { ok: false, msg: 'Mẹ thử lại sau 1 giờ hoặc gọi hotline ' + HOTLINE + ' nhé' };
  cache.put(k, String(dem + 1), 3600);

  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (err) { return { ok: false, msg: 'Máy chủ đang bận, mẹ thử lại sau vài giây' }; }
  try {
    var d = docKH(sdt);
    if (d.dong || d.kh.ten || Number(d.kh.soDon) > 0) {
      return { ok: false, daCo: true,
        msg: 'Số này đã có tài khoản tại shop rồi. Mẹ bấm Đăng nhập (mật khẩu mặc định ' + MK_MAC_DINH + ') hoặc Nhận mã OTP nếu quên mật khẩu nhé.' };
    }
    var cat = function (v, n) { return String(v || '').trim().slice(0, n); };
    capNhatKhachHang(sdt, {
      name: cat(ten, 80), phone: sdt, tinh: cat(p.tinh, 60), xa: cat(p.xa, 80),
      diaChi: cat(p.diaChi, 200), email: emailHopLe(p.email) ? cat(p.email, 100) : ''
    }, {});
    var kq = docKH(sdt);
    var bao = '🆕 Khách mới đăng ký trên web\n' + cat(ten, 80) + ' – ' + sdt
      + (p.diaChi || p.xa || p.tinh ? '\nĐịa chỉ: ' + [cat(p.diaChi, 200), cat(p.xa, 80), cat(p.tinh, 60)].filter(String).join(', ') : '')
      + (emailHopLe(p.email) ? '\nEmail: ' + cat(p.email, 100) : '');
    try { zaloBotGuiTin(bao); } catch (e1) { Logger.log(e1); }
    if (EMAIL) { try { MailApp.sendEmail(EMAIL, '🆕 Khách mới đăng ký: ' + cat(ten, 80), bao); } catch (e2) { Logger.log(e2); } }
    return { ok: true, kh: kq.kh, mkMacDinh: MK_MAC_DINH };
  } finally { lock.releaseLock(); }
}

/* ===================== SỐ LIỆU CHO TRANG QUẢN TRỊ ===================== */
/* Trả về doanh số, số đơn, khách mới, top sản phẩm, đơn theo ngày và theo giờ
   trong khoảng thời gian tuỳ chọn. Cần phiên quản trị hợp lệ mới đọc được. */
/* ===================== KHÁCH TRUY CẬP WEBSITE =====================
   Web (js/app.js → TrackVisit) gửi ngầm bằng sendBeacon, không có thông tin cá nhân:
   - su = 'xem' khi mở trang · 'roi' khi rời / ẩn tab (kèm số giây THỰC SỰ hoạt động trên trang)
   - su = 'tim' | 'gio' | 'thanhtoan' | 'mua' cho hành vi · su = 'hb' nhịp tim 15 giây (chỉ lưu bộ nhớ đệm, không ghi sheet)
   Mã khách (vid) cố định trong trình duyệt, mã phiên (sid) đổi sau 30 phút không hoạt động.
   Sheet "Truy cập": mỗi dòng 1 sự kiện. Khách online lưu trong CacheService (tự hết hạn). */
var SHEET_TC = 'Truy cập';
var H_TC = ['Thời gian', 'Mã khách', 'Phiên', 'Trang', 'Mã SP', 'Nguồn', 'Thiết bị', 'Giây', 'Sự kiện', 'Chi tiết'];
function sheetTC() { return sheetPhu(SHEET_TC, H_TC); }
var LOAI_TRANG = { 'trang-chu': 'Trang chủ', 'san-pham': 'Sản phẩm', 'gio-hang': 'Giỏ hàng', 'thanh-toan': 'Checkout', 'danh-muc': 'Danh mục', 'cam-nang': 'Cẩm nang', 'tai-khoan': 'Tài khoản', 'khac': 'Trang khác' };
function ghiTruyCap(d) {
  var cat = function (x, n) { return String(x || '').slice(0, n); };
  var su = cat(d.su || 'roi', 12);
  if (su === 'hb') return capNhatOnline(d);
  var luc = d.luc ? new Date(d.luc) : new Date();
  if (isNaN(luc.getTime()) || Math.abs(luc.getTime() - Date.now()) > 864e5) luc = new Date();
  var giay = Math.max(0, Math.min(1800, Math.round(Number(d.giay) || 0)));
  sheetTC().appendRow([luc, cat(d.vid, 40), cat(d.sid, 24), cat(d.trang, 60), cat(d.q, 40), cat(d.nguon, 60), cat(d.tb, 20), giay, su, cat(d.ct, 80)]);
  if (su === 'xem' || su === 'roi') capNhatOnline(d);
}
/* Khách online: 1 khoá đệm chứa cả danh sách, khoá script để nhiều khách gửi cùng lúc không ghi đè nhau */
function capNhatOnline(d) {
  var lock = LockService.getScriptLock(); if (!lock.tryLock(3000)) return;
  try {
    var c = CacheService.getScriptCache(), now = Date.now(), ds = {};
    try { ds = JSON.parse(c.get('tc_online') || '{}'); } catch (e) { ds = {}; }
    Object.keys(ds).forEach(function (k) { if (now - ds[k].t > 5 * 60e3) delete ds[k]; });
    var sid = String(d.sid || '').slice(0, 24); if (!sid) return;
    var cu = ds[sid] || { v: String(d.vid || '').slice(0, 40), b: now, n: 0 };
    cu.t = now; cu.p = String(d.loai || 'khac').slice(0, 12); cu.u = String(d.trang || '').slice(0, 60);
    cu.i = d.su === 'roi' && d.an ? 2 : (d.idle ? 1 : 0);           // 0 hoạt động · 1 không hoạt động · 2 đã ẩn/rời trang
    if (d.batDau) cu.b = Math.min(cu.b, Number(d.batDau) || cu.b);
    if (d.soTrang) cu.n = Math.max(cu.n, Number(d.soTrang) || 0);
    if (d.giayPhien) cu.g = Math.max(cu.g || 0, Number(d.giayPhien) || 0);
    ds[sid] = cu;
    c.put('tc_online', JSON.stringify(ds), 21600);
  } finally { lock.releaseLock(); }
}
/* Trạng thái: Online (nhịp tim < 45 giây, đang thao tác) · Không hoạt động (còn mở nhưng không thao tác / chưa quá 5 phút) · Offline (bị xoá) */
function docOnline() {
  var ds = {}; try { ds = JSON.parse(CacheService.getScriptCache().get('tc_online') || '{}'); } catch (e) { ds = {}; }
  var now = Date.now(), kq = { online: 0, khongHoatDong: 0, theoTrang: {}, ds: [] };
  Object.keys(LOAI_TRANG).forEach(function (k) { kq.theoTrang[k] = 0; });
  Object.keys(ds).forEach(function (sid) {
    var x = ds[sid], tre = now - x.t; if (tre > 5 * 60e3) return;
    var tt = tre < 45e3 && x.i === 0 ? 'online' : (tre < 45e3 && x.i === 2 ? 'roi' : 'khong');
    if (tt === 'roi' && tre > 60e3) return;
    if (tt === 'online') { kq.online++; kq.theoTrang[x.p] = (kq.theoTrang[x.p] || 0) + 1; } else kq.khongHoatDong++;
    kq.ds.push({ khach: String(x.v || '').slice(-6), trang: x.u, loai: LOAI_TRANG[x.p] || x.p, trangThai: tt === 'online' ? 'Online' : 'Không hoạt động',
      vao: Utilities.formatDate(new Date(x.b), 'Asia/Ho_Chi_Minh', 'HH:mm:ss'), giay: x.g || Math.round((x.t - x.b) / 1000), soTrang: x.n || 1 });
  });
  kq.ds.sort(function (a, b) { return a.trangThai === b.trangThai ? b.giay - a.giay : (a.trangThai === 'Online' ? -1 : 1); });
  kq.ds = kq.ds.slice(0, 30);
  return kq;
}
/* Thống kê cho dashboard: kieu = 'hom-nay' (theo giờ) | '7' | '30' (theo ngày) */
function thongKeTruyCapMoi(kieu) {
  var tz = 'Asia/Ho_Chi_Minh', now = new Date();
  var homNay = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  var soNgay = kieu === '30' ? 30 : kieu === '7' ? 7 : 1;
  var tuMs = new Date(homNay + 'T00:00:00+07:00').getTime() - (soNgay - 1) * 864e5;
  var s = sheetTC(); var n = s.getLastRow();
  var r = { kieu: kieu, homNay: { luot: 0, phien: 0, khach: 0, giayTB: 0, trangTB: 0 }, ky: { luot: 0, phien: 0, khach: 0, giayTB: 0, trangTB: 0, thoat: 0 },
    bieuDo: [], hanhVi: { tim: 0, gio: 0, thanhtoan: 0, mua: 0 }, phienGanDay: [] };
  var moc = [];
  if (soNgay === 1) for (var h = 0; h < 24; h++) moc.push({ nhan: (h < 10 ? '0' : '') + h + 'h', luot: 0, phien: 0 });
  else for (var k = soNgay - 1; k >= 0; k--) { var dd = Utilities.formatDate(new Date(now.getTime() - k * 864e5), tz, 'yyyy-MM-dd'); moc.push({ ngay: dd, nhan: dd.slice(8) + '/' + dd.slice(5, 7), luot: 0, phien: 0 }); }
  if (n >= 2) {
    var bd = Math.max(2, n - 30000);                          // đọc tối đa 30.000 dòng gần nhất
    var v = s.getRange(bd, 1, n - bd + 1, H_TC.length).getValues();
    var phien = {}, khachKy = {}, khachHN = {};
    for (var i = v.length - 1; i >= 0; i--) {
      if (!v[i][0]) continue; var t = new Date(v[i][0]).getTime(); if (t < tuMs) break;
      var su = String(v[i][8] || 'roi'), sid = String(v[i][2] || ('x' + i)), vid = String(v[i][1] || ''), giay = Number(v[i][7]) || 0;
      var ngay = Utilities.formatDate(new Date(t), tz, 'yyyy-MM-dd'), laHN = ngay === homNay;
      var p = phien[sid] || (phien[sid] = { vid: vid, b: t, e: t, giay: 0, trang: 0, dau: '', cuoi: '', ngay: ngay, hn: laHN, mua: false });
      if (t < p.b) { p.b = t; p.ngay = ngay; } if (t + giay * 1000 > p.e) p.e = t + giay * 1000;
      if (su === 'xem') {
        p.trang++; r.ky.luot++; if (laHN) r.homNay.luot++;
        if (!p.cuoi) p.cuoi = String(v[i][3] || ''); p.dau = String(v[i][3] || '');   // duyệt ngược: dòng cuối cùng gặp = trang vào
        var m = soNgay === 1 ? moc[Number(Utilities.formatDate(new Date(t), tz, 'H'))] : moc.filter(function (x) { return x.ngay === ngay; })[0];
        if (m) m.luot++;
      } else if (su === 'roi') p.giay += giay;
      else if (r.hanhVi[su] != null) { r.hanhVi[su]++; if (su === 'mua') p.mua = true; }
      khachKy[vid] = 1; if (laHN) khachHN[vid] = 1;
    }
    var tongG = 0, tongT = 0, tongGH = 0, tongTH = 0, thoat = 0;
    Object.keys(phien).forEach(function (sid) {
      var p = phien[sid]; if (!p.trang) return;
      r.ky.phien++; tongG += p.giay; tongT += p.trang; if (p.trang <= 1) thoat++;
      if (p.hn) { r.homNay.phien++; tongGH += p.giay; tongTH += p.trang; }
      var m = soNgay === 1 ? moc[Number(Utilities.formatDate(new Date(p.b), tz, 'H'))] : moc.filter(function (x) { return x.ngay === p.ngay; })[0];
      if (m && (soNgay > 1 || p.hn)) m.phien++;
      r.phienGanDay.push({ khach: p.vid.slice(-6), vao: Utilities.formatDate(new Date(p.b), tz, 'dd/MM HH:mm:ss'), roi: Utilities.formatDate(new Date(p.e), tz, 'HH:mm:ss'),
        giay: p.giay, soTrang: p.trang, trangVao: p.dau, trangCuoi: p.cuoi, mua: p.mua, _b: p.b });
    });
    r.ky.khach = Object.keys(khachKy).length; r.homNay.khach = Object.keys(khachHN).length;
    r.ky.giayTB = r.ky.phien ? Math.round(tongG / r.ky.phien) : 0; r.ky.trangTB = r.ky.phien ? Math.round(tongT / r.ky.phien * 10) / 10 : 0;
    r.ky.thoat = r.ky.phien ? Math.round(thoat / r.ky.phien * 100) : 0;
    r.homNay.giayTB = r.homNay.phien ? Math.round(tongGH / r.homNay.phien) : 0; r.homNay.trangTB = r.homNay.phien ? Math.round(tongTH / r.homNay.phien * 10) / 10 : 0;
    r.phienGanDay.sort(function (a, b) { return b._b - a._b; }); r.phienGanDay = r.phienGanDay.slice(0, 20).map(function (x) { delete x._b; return x; });
  }
  r.bieuDo = moc;
  return r;
}
function apiTruyCap(p) {
  if (!coQuyen(p, 'dashboard.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var kq = { ok: true, online: docOnline() };
  if (p.chiOnline !== '1') { var k = String(p.kieu || 'hom-nay'); kq.thongKe = thongKeTruyCapMoi(k === '7' || k === '30' ? k : 'hom-nay'); }
  return kq;
}

function apiThongKe(p) {
  if (!coQuyen(p, 'dashboard.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var tu = p.tu ? new Date(p.tu + 'T00:00:00+07:00') : new Date(Date.now() - 30 * 864e5);
  var den = p.den ? new Date(p.den + 'T23:59:59+07:00') : new Date();
  var s = sheetDon(); var n = s.getLastRow();
  var kq = { ok: true, tu: Utilities.formatDate(tu, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd'),
             den: Utilities.formatDate(den, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd'),
             doanhThu: 0, soDon: 0, soKhach: 0, khachMoi: 0, huy: 0, tienHuy: 0,
             theoNgay: [], theoGio: [], topSP: [], donMoi: [], goiLai: 0, quaDaTang: 0 };
  for (var g = 0; g < 24; g++) kq.theoGio.push(0);
  if (n < 2) return kq;

  var v = s.getRange(2, 1, n - 1, HEADERS.length).getValues();
  var ngay = {}, gio = {}, sp = {}, khach = {}, khachTruoc = {};
  for (var i = 0; i < v.length; i++) {
    var d = v[i][0]; if (!d) continue;
    var t = new Date(d).getTime();
    var sdt = chuanSdt(v[i][4]);
    var loai = String(v[i][2] || '');
    if (t < tu.getTime()) { if (sdt) khachTruoc[sdt] = 1; continue; }   // khách đã mua trước kỳ này
    if (t > den.getTime()) continue;
    if (loai.indexOf('gọi lại') > -1) { kq.goiLai++; continue; }
    var tien = Number(v[i][10]) || 0;
    var tt = String(v[i][18] || '');
    if (/huỷ|huy|hoàn|hoan/i.test(tt)) { kq.huy++; kq.tienHuy += tien; continue; }

    kq.doanhThu += tien; kq.soDon++;
    if (sdt) khach[sdt] = (khach[sdt] || 0) + 1;
    if (String(v[i][17] || '').trim()) kq.quaDaTang++;

    var k = Utilities.formatDate(new Date(d), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
    if (!ngay[k]) ngay[k] = { ngay: k, tien: 0, don: 0 };
    ngay[k].tien += tien; ngay[k].don++;
    var h = Number(Utilities.formatDate(new Date(d), 'Asia/Ho_Chi_Minh', 'H'));
    kq.theoGio[h] = (kq.theoGio[h] || 0) + 1;

    var dong = String(v[i][6] || '').split('\n');
    for (var j = 0; j < dong.length; j++) {
      var m = dong[j].match(/^(.*?)\s*×\s*(\d+)$/);
      if (!m) continue;
      var ten = m[1].trim(); if (!ten) continue;
      if (!sp[ten]) sp[ten] = { ten: ten, sl: 0, don: 0 };
      sp[ten].sl += Number(m[2]) || 1; sp[ten].don++;
    }
    if (kq.donMoi.length < 15) kq.donMoi.push({ ma: String(v[i][1] || ''), ngay: ngayVN(d), khach: String(v[i][3] || ''),
      sdt: sdt, tong: tien, thanhToan: String(v[i][11] || ''), trangThai: tt, qua: String(v[i][17] || '') });
  }
  Object.keys(ngay).forEach(function (k2) { kq.theoNgay.push(ngay[k2]); });
  kq.theoNgay.sort(function (a, b) { return a.ngay < b.ngay ? -1 : 1; });
  Object.keys(sp).forEach(function (k3) { kq.topSP.push(sp[k3]); });
  kq.topSP.sort(function (a, b) { return b.sl - a.sl; }); kq.topSP = kq.topSP.slice(0, 12);
  var ds = Object.keys(khach); kq.soKhach = ds.length;
  for (var q = 0; q < ds.length; q++) if (!khachTruoc[ds[q]]) kq.khachMoi++;
  kq.donMoi.reverse();
  kq.giaTriTB = kq.soDon ? Math.round(kq.doanhThu / kq.soDon) : 0;
  return kq;
}

/* ===================== TÀI KHOẢN QUẢN TRỊ & PHÂN QUYỀN =====================
   Mỗi nhân viên một tài khoản riêng, mật khẩu băm kèm muối, lưu ở sheet "Quản trị".
   Mọi lệnh quản trị kiểm tra quyền ở ĐÂY (máy chủ), không chỉ ẩn nút trên giao diện. */
var H_QT = ['Tài khoản', 'Họ tên', 'Vai trò', 'Hash', 'Muối', 'Trạng thái', 'Tạo lúc', 'Đăng nhập cuối', 'Quyền riêng'];
var VAI_TRO_QT = {
  SUPER_ADMIN:   ['*'],
  MANAGER:       ['dashboard.view', 'order.*', 'product.*', 'customer.*', 'referral.*', 'points.*', 'referral_settings.view', 'affiliate.view', 'affiliate.update', 'banner.*', 'content.*', 'flashsale.*', 'combo.*', 'seo.*', 'theme.*', 'setting.view'],
  ORDER_STAFF:   ['dashboard.view', 'order.view', 'order.update', 'customer.view'],
  PRODUCT_STAFF: ['dashboard.view', 'product.*', 'category.*', 'flashsale.*', 'combo.*'],
  CONTENT_STAFF: ['dashboard.view', 'content.*', 'banner.*', 'seo.*']
};
/* Danh mục quyền – trang quản trị dựa vào đây để hiện ô tích chọn */
var DANH_MUC_QUYEN = [
  { nhom: 'Tổng quan', ds: [['dashboard.view', 'Xem số liệu kinh doanh']] },
  { nhom: 'Đơn hàng',  ds: [['order.view', 'Xem đơn hàng'], ['order.update', 'Đổi trạng thái đơn']] },
  { nhom: 'Sản phẩm',  ds: [['product.view', 'Xem sản phẩm'], ['product.update', 'Thêm / sửa sản phẩm'], ['product.delete', 'Xoá sản phẩm']] },
  { nhom: 'Khách hàng',ds: [['customer.view', 'Xem khách hàng'], ['customer.update', 'Khoá / mở tài khoản khách']] },
  { nhom: 'Đối tác (affiliate)', ds: [['affiliate.view', 'Xem đối tác, đơn, kỳ thanh toán'], ['affiliate.update', 'Duyệt / khoá đối tác, gán tay đơn'], ['affiliate.pay', 'Chốt kỳ & xác nhận đã trả hoa hồng'], ['affiliate.settings', 'Sửa mức hoa hồng, thuế, hạn tính']] },
  { nhom: 'Giới thiệu & điểm', ds: [['referral.view', 'Xem giới thiệu'], ['referral.update', 'Xử lý giới thiệu / điểm'], ['referral.export', 'Xuất báo cáo giới thiệu'], ['points.view', 'Xem ví điểm'], ['points.adjust', 'Cộng / trừ điểm'], ['points.export', 'Xuất báo cáo điểm'], ['referral_settings.view', 'Xem cấu hình giới thiệu'], ['referral_settings.update', 'Sửa cấu hình giới thiệu']] },
  { nhom: 'Khuyến mãi',ds: [['flashsale.view', 'Flash sale'], ['combo.view', 'Combo']] },
  { nhom: 'Website',   ds: [['banner.view', 'Banner'], ['content.view', 'Menu & bài viết'], ['seo.view', 'SEO'], ['theme.view', 'Giao diện']] },
  { nhom: 'Hệ thống',  ds: [['setting.view', 'Cấu hình, tài khoản, nhật ký']] }
];
function sheetQT()     { return sheetPhu('Quản trị', H_QT); }
function sheetPhienQT() { return sheetPhu('Phiên QT', ['Token', 'Tài khoản', 'Vai trò', 'Hết hạn', 'Tạo lúc', 'Quyền riêng']); }

function bamMkQT(mk, muoi) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(muoi) + '|' + String(mk), Utilities.Charset.UTF_8);
  return raw.map(function (b) { return ('0' + (b & 0xFF).toString(16)).slice(-2); }).join('');
}
function timQT(tk) {
  var s = sheetQT(); var n = s.getLastRow(); if (n < 2) return 0;
  var v = s.getRange(2, 1, n - 1, 1).getValues();
  for (var i = 0; i < v.length; i++) if (String(v[i][0]).trim().toLowerCase() === String(tk).trim().toLowerCase()) return i + 2;
  return 0;
}
/* Lần đầu chạy: tạo sẵn tài khoản chủ shop để không bị khoá ngoài */
function taoChuShopNeuChuaCo() {
  var s = sheetQT();
  if (s.getLastRow() >= 2) return;
  var muoi = Utilities.getUuid().slice(0, 12);
  s.appendRow(['adminhck', 'Chủ shop', 'SUPER_ADMIN', bamMkQT('123', muoi), muoi, 'Hoạt động', new Date(), '', '']);
}
/* Chạy tay trong Apps Script nếu muốn đưa mật khẩu tài khoản adminhck về 123 */
function datLaiMatKhauChuShop() {
  taoChuShopNeuChuaCo();
  var dong = timQT('adminhck');
  if (!dong) { Logger.log('Khong thay tai khoan adminhck'); return; }
  var muoi = Utilities.getUuid().slice(0, 12);
  var s = sheetQT();
  s.getRange(dong, 4).setValue(bamMkQT('123', muoi));
  s.getRange(dong, 5).setValue(muoi);
  s.getRange(dong, 3).setValue('SUPER_ADMIN');
  s.getRange(dong, 6).setValue('Hoạt động');
  Logger.log('✅ Da dat lai: adminhck / 123');
}

function apiQtDangNhap(p) {
  taoChuShopNeuChuaCo();
  var tk = String(p.tk || '').trim().toLowerCase();
  var cache = CacheService.getScriptCache(); var k = 'qt_' + tk;
  if (Number(cache.get(k) || 0) >= 8) return { ok: false, msg: 'Nhập sai nhiều lần, thử lại sau 1 giờ' };
  var dong = timQT(tk);
  if (!dong) { cache.put(k, String(Number(cache.get(k) || 0) + 1), 3600); return { ok: false, msg: 'Tài khoản hoặc mật khẩu chưa đúng' }; }
  var v = sheetQT().getRange(dong, 1, 1, H_QT.length).getValues()[0];
  if (String(v[5]) !== 'Hoạt động') return { ok: false, msg: 'Tài khoản đang bị khoá' };
  if (bamMkQT(p.mk, v[4]) !== String(v[3])) {
    var sai = Number(cache.get(k) || 0) + 1; cache.put(k, String(sai), 3600);
    if (sai === 3 || sai === 8) canhBao_('qt-sai-' + tk + '-' + sai, '⚠️ Tài khoản quản trị "' + tk + '" nhập sai mật khẩu ' + sai + ' lần' + (sai >= 8 ? ' – đã tạm khoá 1 giờ' : '') + '. Nếu không phải bạn, có người đang dò mật khẩu.');
    return { ok: false, msg: 'Tài khoản hoặc mật khẩu chưa đúng' };
  }
  cache.remove(k);
  if (canOtpQT_(v)) return guiOtpQT_(tk);
  return capPhienQT_(tk, v, dong);
}
/* C1 – Đăng nhập 2 lớp: chủ shop / quản lý nhập đúng mật khẩu còn phải nhập mã 6 số gửi về email shop.
   Tắt khẩn cấp: Script Property QT_OTP = tat (hoặc nút ở Quản trị → Hệ thống). */
var VAI_TRO_OTP = ['SUPER_ADMIN', 'MANAGER'];
function canOtpQT_(v) { return VAI_TRO_OTP.indexOf(String(v[2])) >= 0 && emailHopLe(EMAIL) && PropertiesService.getScriptProperties().getProperty('QT_OTP') !== 'tat'; }
function guiOtpQT_(tk) {
  var id = Utilities.getUuid().replace(/-/g, ''), ma = String(parseInt(Utilities.getUuid().replace(/-/g, '').slice(0, 8), 16) % 1000000);
  while (ma.length < 6) ma = '0' + ma;
  CacheService.getScriptCache().put('qt2_' + id, JSON.stringify({ tk: tk, ma: ma, sai: 0 }), 600);
  MailApp.sendEmail(EMAIL, 'Mã đăng nhập quản trị ' + TEN_SHOP + ': ' + ma,
    'Mã đăng nhập trang quản trị cho tài khoản "' + tk + '": ' + ma + '\nMã có hiệu lực 10 phút.\nLúc: ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss') +
    '\n\nNếu không phải bạn đang đăng nhập: có người đã biết mật khẩu tài khoản này – hãy đổi mật khẩu ngay.', { name: TEN_SHOP });
  return { ok: true, can2: true, phien2: id, msg: 'Đã gửi mã 6 số tới email ' + anEmail(EMAIL) + '. Mã có hiệu lực 10 phút.' };
}
function apiQtDangNhap2(p) {
  var c = CacheService.getScriptCache(), k = 'qt2_' + String(p.phien2 || '').replace(/[^\w]/g, '').slice(0, 40), raw = c.get(k);
  if (!raw) return { ok: false, hetHan: true, msg: 'Mã đã hết hạn, đăng nhập lại nhé' };
  var o = JSON.parse(raw);
  if (String(p.otp || '').replace(/\D/g, '') !== o.ma) {
    o.sai++;
    if (o.sai >= 5) { c.remove(k); canhBao_('qt-otp-' + o.tk, '⚠️ Tài khoản quản trị "' + o.tk + '" đã đúng mật khẩu nhưng nhập sai mã email 5 lần. Nếu không phải bạn, hãy đổi mật khẩu ngay.'); return { ok: false, hetHan: true, msg: 'Sai mã quá 5 lần, đăng nhập lại nhé' }; }
    c.put(k, JSON.stringify(o), 600); return { ok: false, msg: 'Mã chưa đúng (còn ' + (5 - o.sai) + ' lần thử)' };
  }
  c.remove(k);
  var dong = timQT(o.tk); if (!dong) return { ok: false, hetHan: true, msg: 'Không thấy tài khoản' };
  var v = sheetQT().getRange(dong, 1, 1, H_QT.length).getValues()[0];
  if (String(v[5]) !== 'Hoạt động') return { ok: false, hetHan: true, msg: 'Tài khoản đang bị khoá' };
  return capPhienQT_(o.tk, v, dong);
}
function capPhienQT_(tk, v, dong) {
  var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '').slice(0, 8);
  var rieng = String(v[8] || '').trim();
  sheetPhienQT().appendRow([token, tk, String(v[2]), new Date(Date.now() + 12 * 3600e3), new Date(), rieng]);
  sheetQT().getRange(dong, 8).setValue(new Date());
  ghiNhatKy('Quản trị', tk, 'Đăng nhập');
  canhBao_('qt-dn-' + token.slice(0, 12), '🔐 Đăng nhập trang quản trị: tài khoản "' + tk + '" (' + String(v[2]) + ') lúc ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'HH:mm dd/MM/yyyy') + '. Nếu không phải bạn/nhân viên của bạn, đổi mật khẩu và báo kỹ thuật ngay.');
  return { ok: true, token: token, tk: tk, ten: String(v[1]), vaiTro: String(v[2]),
    quyen: rieng ? rieng.split(',') : (VAI_TRO_QT[String(v[2])] || []), quyenRieng: !!rieng };
}

/* ===================== BẢO MẬT: cảnh báo (D2), giới hạn tần suất (C2), khoá bí mật (A3) ===================== */
/* D2 – Gửi cảnh báo qua bot Zalo + email shop. Cùng 1 loại chỉ gửi 1 lần / 10 phút để không spam. */
function canhBao_(khoa, noiDung) {
  var c = CacheService.getScriptCache(), k = 'cb_' + String(khoa).replace(/[^\w-]/g, '').slice(0, 200);
  if (c.get(k)) return; c.put(k, '1', 600);
  var tin = '[' + TEN_SHOP + ' – Bảo mật] ' + noiDung;
  try { zaloBotGuiTin(tin); } catch (e) { Logger.log(e); }
  try { if (emailHopLe(EMAIL)) MailApp.sendEmail(EMAIL, '🔔 Cảnh báo bảo mật – ' + String(noiDung).replace(/\s+/g, ' ').slice(0, 80), tin + '\n\nLúc: ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss'), { name: TEN_SHOP }); } catch (e2) { Logger.log(e2); }
  try { ghiNhatKy('Bảo mật', 'Cảnh báo', String(noiDung).slice(0, 300)); } catch (e3) { Logger.log(e3); }
}
/* Thao tác quản trị đụng tới tiền / quyền → báo cho chủ shop (gộp theo người làm, 10 phút / lần) */
var LENH_BAO = { qtAffSpLuu: 'đổi % hoa hồng sản phẩm', qtAffCdLuu: 'lưu chiến dịch hoa hồng riêng', qtAffCdDung: 'dừng / chạy lại chiến dịch hoa hồng', qtAffCdXoa: 'xoá chiến dịch hoa hồng',
  qtAffCauHinh: 'đổi cấu hình chương trình đối tác', qtAffChotKy: 'chốt kỳ thanh toán đối tác', qtAffTra: 'đánh dấu đã trả tiền đối tác', qtAffGanTay: 'gán tay đơn cho đối tác',
  qtDiemDieuChinh: 'điều chỉnh điểm của khách', qtLuu: 'tạo / sửa tài khoản quản trị', qtXoa: 'xoá tài khoản quản trị', qtBiMat: 'đổi cài đặt bảo mật' };
var HD_ = null;   // lệnh đang xử lý (gán ở doGet) để traVe biết mà cảnh báo
function baoLenh_(data) {
  if (!HD_ || !data || data.ok !== true || !LENH_BAO[HD_.a]) return;
  var a = HD_.a, p = HD_.p;
  if (a === 'qtAffCauHinh' && String(p.luu) !== '1') return;
  if (a === 'qtBiMat' && !p.viec) return;
  var ai = tenQT(p), x = [];
  if (p.ma) x.push('mã ' + String(p.ma).slice(0, 30)); if (p.tk) x.push('tài khoản ' + String(p.tk).slice(0, 30)); if (p.viec) x.push(String(p.viec).slice(0, 20));
  if (p.pt !== undefined && p.pt !== '') x.push(String(p.pt).slice(0, 8) + '%'); if (p.ids) x.push(String(p.ids).split(',').length + ' SP');
  if (p.sdt) x.push('SĐT …' + String(p.sdt).slice(-3)); if (p.maDon) x.push('đơn ' + String(p.maDon).slice(0, 20));
  canhBao_('lenh-' + a + '-' + ai, '✏️ "' + ai + '" vừa ' + LENH_BAO[a] + (x.length ? ' (' + x.join(', ') + ')' : '') + '.');
}
/* C2 – Giới hạn số yêu cầu mỗi 10 phút cho toàn hệ thống (Apps Script không biết IP người gọi).
   Vượt ngưỡng: tạm chặn lệnh đó + cảnh báo chủ shop. Ngưỡng rộng hơn nhiều so với lượng khách thật. */
var GIOI_HAN_10P = { guiOtp: 40, xacThuc: 120, dangKy: 40, dangNhap: 150, capNhat: 100, affDangKy: 15, affDangNhap: 80, affTuKhach: 300, affBam: 1500, affSdt: 600, affGanDon: 300,
  qtDangNhap: 40, qtDangNhap2: 40, qmkGui: 60, gtGiuCho: 200 };
function chanTanSuat_(action) {
  var t = GIOI_HAN_10P[action]; if (!t || demGioiHan('gh_' + action, t, 600)) return null;
  canhBao_('tan-suat-' + action, '⚠️ Có hơn ' + t + ' yêu cầu "' + action + '" trong 10 phút – có thể bot đang tấn công. Hệ thống đã tạm chặn lệnh này, tự mở lại sau khi lắng xuống.');
  return { ok: false, code: 'RATE_LIMITED', msg: 'Hệ thống đang bận, vui lòng thử lại sau ít phút.' };
}
function laChuShop_(p) { var ph = phienQT(p.token); if (ph && ph.vaiTro === 'SUPER_ADMIN') return true; var kc = khoaChuShop_(); return !!(kc && String(p.key || '') === kc); }
/* Quản trị → Hệ thống → Bảo mật hệ thống (chỉ SUPER_ADMIN) */
function apiQtBiMat(p) {
  if (!laChuShop_(p)) return { ok: false, msg: 'Chỉ tài khoản chủ shop (SUPER_ADMIN) dùng được mục này' };
  var pr = PropertiesService.getScriptProperties();
  if (p.viec === 'zalo') {
    var t = String(p.giaTri || '').trim();
    if (!/^\d{6,}:[\w-]{20,}$/.test(t)) return { ok: false, msg: 'Token Zalo chưa đúng dạng (dãy số:chuỗi ký tự)' };
    pr.setProperty('ZALO_BOT_TOKEN', t);
    var kt = ''; try { kt = String(zaloBotGoi('getMe', {})).slice(0, 300); } catch (e) { kt = String(e).slice(0, 300); }
    return { ok: true, msg: 'Đã lưu token mới trên máy chủ', kiemTra: kt };
  }
  if (p.viec === 'otp') { pr.setProperty('QT_OTP', p.giaTri === 'tat' ? 'tat' : 'bat'); return { ok: true, msg: p.giaTri === 'tat' ? 'Đã TẮT đăng nhập 2 lớp' : 'Đã bật đăng nhập 2 lớp' }; }
  return { ok: true, zalo: pr.getProperty('ZALO_BOT_TOKEN') ? 'moi' : (ZALO_BOT_TOKEN ? 'cu' : 'chua'), khoaDuPhong: !!khoaChuShop_(), otp: pr.getProperty('QT_OTP') !== 'tat', email: anEmail(EMAIL) };
}
function phienQT(token) {
  if (!token) return null;
  var s = sheetPhienQT(); var n = s.getLastRow(); if (n < 2) return null;
  var v = s.getRange(2, 1, n - 1, 6).getValues();
  for (var i = 0; i < v.length; i++) {
    if (String(v[i][0]) !== String(token)) continue;
    if (new Date(v[i][3]).getTime() < Date.now()) return null;
    return { tk: String(v[i][1]), vaiTro: String(v[i][2]), rieng: String(v[i][5] || '').trim() };
  }
  return null;
}
function coQuyen(p, quyen) {
  var kc = khoaChuShop_(); if (kc && String(p.key || '') === kc) return true;   // khoá dự phòng (chỉ khi đặt trong Script Properties)
  var ph = phienQT(p.token); if (!ph) return false;
  /* Quyền riêng của tài khoản (nếu có) được ưu tiên hơn quyền mặc định của vai trò */
  var ds = ph.rieng ? ph.rieng.split(',') : (VAI_TRO_QT[ph.vaiTro] || []);
  for (var i = 0; i < ds.length; i++) {
    var q = ds[i];
    if (q === '*' || q === quyen) return true;
    if (q.slice(-2) === '.*' && quyen.indexOf(q.slice(0, -1)) === 0) return true;
  }
  return false;
}
function apiQtHoSo(p) {
  var ph = phienQT(p.token);
  if (!ph) return { ok: false, loi: 'token', msg: 'Phiên đã hết hạn, đăng nhập lại nhé' };
  var dong = timQT(ph.tk); var v = sheetQT().getRange(dong, 1, 1, H_QT.length).getValues()[0];
  return { ok: true, tk: ph.tk, ten: String(v[1]), vaiTro: ph.vaiTro, quyen: VAI_TRO_QT[ph.vaiTro] || [] };
}
function apiQtDs(p) {
  if (!coQuyen(p, 'setting.view')) return { ok: false, msg: 'Không có quyền' };
  taoChuShopNeuChuaCo();
  var s = sheetQT(); var n = s.getLastRow(); var ds = [];
  if (n >= 2) {
    var v = s.getRange(2, 1, n - 1, H_QT.length).getValues();
    for (var i = 0; i < v.length; i++) ds.push({ dong: i + 2, tk: String(v[i][0]), ten: String(v[i][1]), vaiTro: String(v[i][2]),
      trangThai: String(v[i][5]), tao: v[i][6] ? ngayVN(v[i][6]) : '', dangNhapCuoi: v[i][7] ? ngayVN(v[i][7]) : 'chưa đăng nhập',
      quyenRieng: String(v[i][8] || '').trim() });
  }
  return { ok: true, ds: ds, vaiTro: Object.keys(VAI_TRO_QT), quyenTheoVaiTro: VAI_TRO_QT, danhMucQuyen: DANH_MUC_QUYEN };
}
function apiQtLuu(p) {
  if (!coQuyen(p, 'setting.view')) return { ok: false, msg: 'Không có quyền' };
  var tk = String(p.tk || '').trim().toLowerCase();
  if (!/^[a-z0-9_.]{4,24}$/.test(tk)) return { ok: false, msg: 'Tài khoản 4–24 ký tự, chỉ chữ thường, số, dấu _ .' };
  if (!VAI_TRO_QT[String(p.vaiTro)]) return { ok: false, msg: 'Vai trò không hợp lệ' };
  var s = sheetQT(); var dong = timQT(tk);
  var mk = String(p.mk || '');
  if (!dong) {
    if (mk.length < 4) return { ok: false, msg: 'Mật khẩu cần ít nhất 4 ký tự' };
    var muoi = Utilities.getUuid().slice(0, 12);
    s.appendRow([tk, String(p.ten || tk), String(p.vaiTro), bamMkQT(mk, muoi), muoi, String(p.trangThai || 'Hoạt động'), new Date(), '', locQuyen(p.quyenRieng)]);
    ghiNhatKy('Quản trị', tk, 'Tạo tài khoản · vai trò ' + p.vaiTro);
    return { ok: true, moi: true };
  }
  var v = s.getRange(dong, 1, 1, H_QT.length).getValues()[0];
  if (String(v[2]) === 'SUPER_ADMIN' && String(p.vaiTro) !== 'SUPER_ADMIN' && demSuperAdmin() <= 1)
    return { ok: false, msg: 'Phải còn ít nhất 1 tài khoản Quản trị cao nhất' };
  s.getRange(dong, 2).setValue(String(p.ten || v[1]));
  s.getRange(dong, 3).setValue(String(p.vaiTro));
  s.getRange(dong, 6).setValue(String(p.trangThai || v[5]));
  if (mk) { var m2 = Utilities.getUuid().slice(0, 12); s.getRange(dong, 4).setValue(bamMkQT(mk, m2)); s.getRange(dong, 5).setValue(m2); }
  s.getRange(dong, 9).setValue(locQuyen(p.quyenRieng));
  ghiNhatKy('Quản trị', tk, 'Sửa tài khoản' + (mk ? ' · đổi mật khẩu' : ''));
  return { ok: true };
}
/* Chỉ nhận các quyền có thật trong danh mục, tránh ghi bừa vào Sheet */
function locQuyen(chuoi) {
  var hop = [];
  for (var i = 0; i < DANH_MUC_QUYEN.length; i++)
    for (var j = 0; j < DANH_MUC_QUYEN[i].ds.length; j++) hop.push(DANH_MUC_QUYEN[i].ds[j][0]);
  var vao = String(chuoi || '').split(',').map(function (x) { return x.trim(); }).filter(function (x) { return hop.indexOf(x) > -1; });
  return vao.join(',');
}
function demSuperAdmin() {
  var s = sheetQT(); var n = s.getLastRow(); if (n < 2) return 0;
  var v = s.getRange(2, 3, n - 1, 1).getValues(); var d = 0;
  for (var i = 0; i < v.length; i++) if (String(v[i][0]) === 'SUPER_ADMIN') d++;
  return d;
}
function apiQtXoa(p) {
  if (!coQuyen(p, 'setting.view')) return { ok: false, msg: 'Không có quyền' };
  var tk = String(p.tk || '').trim().toLowerCase(); var dong = timQT(tk);
  if (!dong) return { ok: false, msg: 'Không tìm thấy tài khoản' };
  var vt = String(sheetQT().getRange(dong, 3).getValue());
  if (vt === 'SUPER_ADMIN' && demSuperAdmin() <= 1) return { ok: false, msg: 'Phải còn ít nhất 1 tài khoản Quản trị cao nhất' };
  sheetQT().deleteRow(dong);
  ghiNhatKy('Quản trị', tk, 'Xoá tài khoản');
  return { ok: true };
}

/* ===================== QUẢN TRỊ: ĐƠN HÀNG ===================== */
var TRANG_THAI = ['Chờ xác nhận', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Đã giao', 'Đã huỷ', 'Yêu cầu hoàn hàng', 'Đã hoàn hàng'];
/* Chỉ cho chuyển sang trạng thái hợp lệ, tránh bấm nhầm Đã giao khi chưa giao */
var LUONG = {
  'Chờ xác nhận':      ['Đã xác nhận', 'Đã huỷ'],
  'Đã xác nhận':       ['Đang chuẩn bị', 'Đã huỷ'],
  'Đang chuẩn bị':     ['Đang giao', 'Đã huỷ'],
  'Đang giao':         ['Đã giao', 'Yêu cầu hoàn hàng'],
  'Đã giao':           ['Yêu cầu hoàn hàng'],
  'Yêu cầu hoàn hàng': ['Đã hoàn hàng', 'Đã giao'],
  'Đã huỷ':            [],
  'Đã hoàn hàng':      []
};
function chuanTT(v) { var t = String(v || '').trim(); return t || 'Chờ xác nhận'; }

/* ===================== ĐỒNG BỘ TRẠNG THÁI ĐƠN TỪ CRM =====================
   CRM (web-khach) trả lịch sử đơn của khách kèm trạng thái. Đơn web được tìm theo mã đơn,
   trạng thái CRM được quy về trạng thái của trang quản trị rồi tự cập nhật vào sheet Đơn hàng:
   - Mở chi tiết đơn ở trang quản trị → đồng bộ ngay đơn đó.
   - Nút "Đồng bộ CRM" ở danh sách đơn, hoặc lịch chạy nền 30 phút/lần (chạy taoLichDongBoCRM 1 lần).
   Chỉ cập nhật TIẾN LÊN (VD Đang chuẩn bị → Đang giao) hoặc sang Huỷ / Hoàn; không lùi trạng thái đã đặt tay. */
function ttTuCRM(raw) {
  var t = String(raw || '').toLowerCase().trim();
  if (!t) return '';
  if (/huỷ|hủy|cancel/.test(t)) return 'Đã huỷ';
  if (/đã hoàn hàng|hoàn hàng thành công|đã trả hàng|returned/.test(t)) return 'Đã hoàn hàng';
  if (/hoàn tất|thành công|đã giao|giao xong|đã nhận|success|delivered|completed/.test(t)) return 'Đã giao';
  if (/hoàn|trả hàng|return/.test(t)) return 'Yêu cầu hoàn hàng';
  if (/đang giao|vận chuyển|đang chuyển|đã gửi|bàn giao|shipping|in transit|giao hàng/.test(t)) return 'Đang giao';
  if (/đóng gói|chuẩn bị|đang xử lý|đã xử lý|chờ lấy|chờ giao|packing|processing/.test(t)) return 'Đang chuẩn bị';
  if (/chờ xác nhận|^chờ|mới|tiếp nhận|new|pending/.test(t)) return 'Chờ xác nhận';
  if (/xác nhận|confirmed/.test(t)) return 'Đã xác nhận';
  return '';
}
function crmKhachCache(sdt) {
  var c = CacheService.getScriptCache(), k = 'crmkh_' + sdt, v = c.get(k);
  if (v) { try { return JSON.parse(v); } catch (e) {} }
  var d = layKhachTuCRM(sdt);
  try { c.put(k, JSON.stringify(d || { ok: false }), 300); } catch (e) {}
  return d;
}
/* Tìm đơn CRM khớp đơn web: đúng mã (hoặc mã CRM chứa mã web); không có mã thì cùng ngày + cùng số tiền và chỉ có 1 đơn như vậy */
function timDonCRM(crm, ma, tong, ngay) {
  var ds = (crm && crm.donHang) || []; var m = String(ma || '').toUpperCase();
  for (var i = 0; i < ds.length; i++) { var x = String(ds[i].ma || '').toUpperCase(); if (m && x && (x === m || x.indexOf(m) > -1 || m.indexOf(x) > -1)) return ds[i]; }
  var ng = ngay ? Utilities.formatDate(new Date(ngay), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy') : '';
  var hop = ds.filter(function (d) { var tien = Number(d.tien != null ? d.tien : d.tong) || 0; return ng && String(d.ngay || '').indexOf(ng) === 0 && Math.abs(tien - Number(tong || 0)) < 1000; });
  return hop.length === 1 ? hop[0] : null;
}
var TT_CUOI = ['Đã huỷ', 'Đã hoàn hàng'];
/* Đồng bộ 1 dòng đơn; trả { crm: {...} | null, trangThai, doi } */
function dongBoDongCRM(s, dong, v) {
  var cu = chuanTT(v[18]), sdt = chuanSdt(v[4]), ma = String(v[1] || '');
  var crm = crmKhachCache(sdt); if (!crm || !crm.ok) return { crm: null, trangThai: cu, doi: false };
  var d = timDonCRM(crm, ma, v[10], v[0]); if (!d) return { crm: { coDon: false }, trangThai: cu, doi: false };
  var raw = String(d.trangThai || ''), moi = ttTuCRM(raw);
  var info = { coDon: true, ma: String(d.ma || ''), trangThai: raw, quyDoi: moi };
  if (!moi || moi === cu || TT_CUOI.indexOf(cu) > -1) return { crm: info, trangThai: cu, doi: false };
  var thuTu = ['Chờ xác nhận', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Đã giao'];
  var tien = /huỷ|hoàn/i.test(moi) || (thuTu.indexOf(moi) > thuTu.indexOf(cu) && thuTu.indexOf(cu) > -1);
  if (!tien) return { crm: info, trangThai: cu, doi: false };
  s.getRange(dong, 19).setValue(moi);
  ghiNhatKy('Đơn hàng', ma, 'Tự cập nhật từ CRM: ' + cu + ' → ' + moi + ' (CRM: ' + raw + ')');
  if (/huỷ|hoàn/i.test(moi)) { try { capNhatKhachHang(sdt, { name: '', phone: sdt }, {}); } catch (e) { Logger.log(e); } }
  try { zaloBotGuiTin('🔄 Đơn ' + ma + ' (CRM): ' + cu + ' → ' + moi); } catch (e) { Logger.log(e); }
  return { crm: info, trangThai: moi, doi: true };
}
/* Đồng bộ các đơn chưa xong trong 60 ngày gần nhất (tối đa 40 khách mỗi lần để không quá giờ) */
function dongBoCRMNhieu() {
  var s = sheetDon(); var n = s.getLastRow(); var kq = { ok: true, kiemTra: 0, doi: 0, ds: [] };
  if (n < 2 || !PropertiesService.getScriptProperties().getProperty('CRM_KEY')) { kq.msg = 'Chưa có CRM_KEY trong Thuộc tính tập lệnh'; return kq; }
  var v = s.getRange(2, 1, n - 1, HEADERS.length).getValues(); var tu = Date.now() - 60 * 864e5; var khach = {};
  for (var i = v.length - 1; i >= 0; i--) {
    if (!v[i][0] || new Date(v[i][0]).getTime() < tu) continue;
    var cu = chuanTT(v[i][18]); if (cu === 'Đã giao' || TT_CUOI.indexOf(cu) > -1) continue;
    var sdt = chuanSdt(v[i][4]); if (!sdt) continue;
    if (!khach[sdt] && Object.keys(khach).length >= 40) continue;
    khach[sdt] = 1; kq.kiemTra++;
    var r = dongBoDongCRM(s, i + 2, v[i]);
    if (r.doi) { kq.doi++; kq.ds.push(String(v[i][1]) + ': ' + cu + ' → ' + r.trangThai); }
  }
  return kq;
}
function apiDongBoCRM(p) {
  if (!coQuyen(p, 'order.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  return dongBoCRMNhieu();
}
/* Chạy nền (trigger) */
function dongBoCRMTuDong() {
  PropertiesService.getScriptProperties().setProperty('LICH_LUC', String(Date.now()));   // để trang quản trị biết lịch đang chạy
  try { Logger.log(JSON.stringify(dongBoCRMNhieu())); } catch (e) { Logger.log('Đồng bộ CRM lỗi: ' + e); }
  try { Logger.log(JSON.stringify(xuLyDiemGT())); } catch (e2) { Logger.log('Xử lý điểm lỗi: ' + e2); }   // giới thiệu & điểm
  try { Logger.log(JSON.stringify(xuLyAff())); } catch (e3) { Logger.log('Xử lý đối tác lỗi: ' + e3); }   // đối tác: hoa hồng + chốt kỳ ngày 10
}
/* CHẠY TAY 1 LẦN trong trình soạn thảo Apps Script: tạo lịch tự đồng bộ trạng thái đơn từ CRM mỗi 30 phút */
function taoLichDongBoCRM() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'dongBoCRMTuDong') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('dongBoCRMTuDong').timeBased().everyMinutes(30).create();
  Logger.log('✅ Đã tạo lịch đồng bộ trạng thái đơn từ CRM 30 phút/lần');
}

function apiDonHang(p) {
  if (!coQuyen(p, 'order.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var s = sheetDon(); var n = s.getLastRow();
  var kq = { ok: true, ds: [], tong: 0, demTT: {} };
  if (n < 2) return kq;
  var v = s.getRange(2, 1, n - 1, HEADERS.length).getValues();
  var tu = p.tu ? new Date(p.tu + 'T00:00:00+07:00').getTime() : 0;
  var den = p.den ? new Date(p.den + 'T23:59:59+07:00').getTime() : Date.now() + 864e5;
  var tt = String(p.tt || ''), tim = chuanSdt(p.q || '') || String(p.q || '').toLowerCase().trim();
  for (var i = v.length - 1; i >= 0; i--) {
    var d = v[i][0]; if (!d) continue;
    var t = new Date(d).getTime(); if (t < tu || t > den) continue;
    var loai = String(v[i][2] || '');
    var trang = chuanTT(v[i][18]);
    kq.demTT[trang] = (kq.demTT[trang] || 0) + 1;
    if (tt && trang !== tt) continue;
    if (tim) {
      var chuoi = (String(v[i][1]) + ' ' + String(v[i][3]) + ' ' + chuanSdt(v[i][4])).toLowerCase();
      if (chuoi.indexOf(tim) < 0) continue;
    }
    kq.tong++;
    if (kq.ds.length >= 300) continue;
    kq.ds.push({
      dong: i + 2, ma: String(v[i][1] || ''), ngay: ngayVN(d), loai: loai,
      khach: String(v[i][3] || ''), sdt: chuanSdt(v[i][4]), diaChi: String(v[i][5] || ''),
      sanPham: String(v[i][6] || ''), soMon: String(v[i][6] || '').split('\n').filter(String).length,
      tamTinh: Number(v[i][7]) || 0, giam: Number(v[i][8]) || 0, ship: Number(v[i][9]) || 0, tong: Number(v[i][10]) || 0,
      thanhToan: String(v[i][11] || ''), ma_gg: String(v[i][12] || ''), ghiChu: String(v[i][13] || ''),
      email: String(v[i][14] || ''), hang: String(v[i][15] || ''), giamHang: Number(v[i][16]) || 0,
      qua: String(v[i][17] || ''), trangThai: trang,
      tiep: LUONG[trang] || []
    });
  }
  return kq;
}

function apiDonChiTiet(p) {
  if (!coQuyen(p, 'order.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var s = sheetDon(); var dong = Number(p.dong || 0);
  if (dong < 2 || dong > s.getLastRow()) return { ok: false, msg: 'Không tìm thấy đơn' };
  var v = s.getRange(dong, 1, 1, HEADERS.length).getValues()[0];
  var dbCRM = { crm: null }; try { dbCRM = dongBoDongCRM(s, dong, v); if (dbCRM.doi) v[18] = dbCRM.trangThai; } catch (e) { Logger.log('CRM: ' + e); }
  var trang = chuanTT(v[18]);
  var sdt = chuanSdt(v[4]);
  var ct = tinhChiTieu(sdt);
  return { ok: true, don: {
    dong: dong, ma: String(v[1] || ''), ngay: ngayVN(v[0]), loai: String(v[2] || ''),
    khach: String(v[3] || ''), sdt: sdt, diaChi: String(v[5] || ''), email: String(v[14] || ''),
    sanPham: String(v[6] || '').split('\n').filter(String),
    tamTinh: Number(v[7]) || 0, giam: Number(v[8]) || 0, ship: Number(v[9]) || 0, tong: Number(v[10]) || 0,
    thanhToan: String(v[11] || ''), ma_gg: String(v[12] || ''), ghiChu: String(v[13] || ''),
    hang: String(v[15] || ''), giamHang: Number(v[16]) || 0, qua: String(v[17] || ''),
    trangThai: trang, tiep: LUONG[trang] || [], luong: TRANG_THAI,
    crm: dbCRM.crm, crmVuaCapNhat: !!dbCRM.doi
  }, khach: { soDon: ct.soDon, tongChiTieu: ct.tong, hang: hangTheoTien(ct.tong).label } };
}

function apiDoiTrangThai(p) {
  if (!coQuyen(p, 'order.update')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var moi = String(p.trangThai || '').trim();
  if (TRANG_THAI.indexOf(moi) < 0) return { ok: false, msg: 'Trạng thái không hợp lệ' };
  var s = sheetDon(); var dong = Number(p.dong || 0);
  if (dong < 2 || dong > s.getLastRow()) return { ok: false, msg: 'Không tìm thấy đơn' };
  var cu = chuanTT(s.getRange(dong, 19).getValue());
  if (cu === moi) return { ok: true, trangThai: moi, tiep: LUONG[moi] || [] };
  if ((LUONG[cu] || []).indexOf(moi) < 0) return { ok: false, msg: 'Không chuyển từ "' + cu + '" sang "' + moi + '" được' };
  s.getRange(dong, 19).setValue(moi);
  var ma = String(s.getRange(dong, 2).getValue() || '');
  var sdt = chuanSdt(s.getRange(dong, 5).getValue());
  ghiNhatKy('Đơn hàng', ma, 'Trạng thái: ' + cu + ' → ' + moi);
  // Huỷ / hoàn hàng thì tổng chi tiêu và hạng của khách phải tính lại
  if (/huỷ|hoàn/i.test(moi) || /huỷ|hoàn/i.test(cu)) {
    try { capNhatKhachHang(sdt, { name: '', phone: sdt }, {}); } catch (e) { Logger.log(e); }
  }
  try { zaloBotGuiTin('🔄 Đơn ' + ma + ': ' + cu + ' → ' + moi); } catch (e) { Logger.log(e); }
  return { ok: true, trangThai: moi, tiep: LUONG[moi] || [] };
}

/* ===================== QUẢN TRỊ: KHÁCH HÀNG ===================== */
function apiKhachHang(p) {
  if (!coQuyen(p, 'customer.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var s = sheetKH(); var n = s.getLastRow();
  var kq = { ok: true, ds: [], tong: 0 };
  if (n < 2) return kq;
  var v = s.getRange(2, 1, n - 1, H_KH.length).getValues();
  var tim = String(p.q || '').toLowerCase().trim();
  var hang = String(p.hang || '');
  for (var i = 0; i < v.length; i++) {
    var sdt = chuanSdt(v[i][0]); if (!sdt) continue;
    var tien = Number(v[i][6]) || 0;
    var h = hangTheoTien(tien);
    if (hang && h.key !== hang) continue;
    if (tim && (String(v[i][1]).toLowerCase() + ' ' + sdt).indexOf(tim) < 0) continue;
    kq.tong++;
    if (kq.ds.length >= 400) continue;
    kq.ds.push({ dong: i + 2, sdt: sdt, ten: String(v[i][1] || ''), tinh: String(v[i][2] || ''), xa: String(v[i][3] || ''),
      diaChi: String(v[i][4] || ''), email: String(v[i][5] || ''), tongChiTieu: tien, soDon: Number(v[i][7]) || 0,
      hang: h.key, hangLabel: h.label, donGanNhat: String(v[i][9] || ''), tao: v[i][10] ? ngayVN(v[i][10]) : '',
      khoa: String(v[i][11] || '').indexOf('KHOA') > -1 });
  }
  kq.ds.sort(function (a, b) { return b.tongChiTieu - a.tongChiTieu; });
  return kq;
}

function apiKhachChiTiet(p) {
  if (!coQuyen(p, 'customer.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var sdt = chuanSdt(p.sdt);
  if (!sdtHopLe(sdt)) return { ok: false, msg: 'Số điện thoại chưa đúng' };
  var d = docKH(sdt);
  var dong = timDongKH(sdt);
  var khoa = dong ? String(sheetKH().getRange(dong, 12).getValue() || '').indexOf('KHOA') > -1 : false;
  return { ok: true, kh: d.kh, donHang: d.don, khoa: khoa, dong: dong };
}

function apiKhoaKhach(p) {
  if (!coQuyen(p, 'customer.update')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var sdt = chuanSdt(p.sdt); var dong = timDongKH(sdt);
  if (!dong) return { ok: false, msg: 'Không tìm thấy khách' };
  var khoa = String(p.khoa) === '1';
  var cu = String(sheetKH().getRange(dong, 12).getValue() || '').replace(/KHOA\s*/g, '').trim();
  sheetKH().getRange(dong, 12).setValue(khoa ? ('KHOA ' + cu).trim() : cu);
  ghiNhatKy('Khách hàng', sdt, khoa ? 'Khoá tài khoản' : 'Mở khoá tài khoản');
  return { ok: true, khoa: khoa };
}

/* ===================== NHẬT KÝ THAO TÁC ===================== */
function sheetNhatKy() { return sheetPhu('Nhật ký', ['Thời gian', 'Mục', 'Bản ghi', 'Thay đổi']); }
function ghiNhatKy(muc, banGhi, thayDoi) {
  // thêm dấu ' để Sheets giữ nguyên số 0 đứng đầu của số điện thoại
  try { sheetNhatKy().appendRow([new Date(), muc, "'" + banGhi, thayDoi]); } catch (e) { Logger.log('Nhật ký lỗi: ' + e); }
}
function apiNhatKy(p) {
  if (!coQuyen(p, 'setting.view')) return { ok: false, msg: 'Không có quyền hoặc phiên đã hết hạn' };
  var s = sheetNhatKy(); var n = s.getLastRow();
  var ds = [];
  if (n >= 2) {
    var v = s.getRange(Math.max(2, n - 199), 1, Math.min(200, n - 1), 4).getValues();
    for (var i = v.length - 1; i >= 0; i--) ds.push({ ngay: ngayVN(v[i][0]), muc: String(v[i][1] || ''), banGhi: String(v[i][2] || ''), thayDoi: String(v[i][3] || '') });
  }
  return { ok: true, ds: ds };
}

function apiDoiMatKhau(p) {
  var ph = phienKhach(p.token); var sdt = ph ? ph.sdt : '';
  if (!sdt) return { ok: false, loi: 'token', code: 'RESET_TOKEN_INVALID', msg: 'Phiên đã hết hạn, mẹ đăng nhập lại nhé' };
  var cfg = qmkCauHinh(); var mk = String(p.mkMoi || '');
  var kt = kiemMkMoi(mk, p.mkMoi2 != null ? p.mkMoi2 : mk, cfg); if (!kt.ok) return kt;
  if (!demGioiHan('doimk_' + sdt, 10)) return { ok: false, code: 'RATE_LIMITED', msg: 'Mẹ thử lại sau 15 phút nhé.' };
  luuMatKhau(sdt, mk);
  /* datLai = '1': quên mật khẩu qua OTP số điện thoại → đăng xuất MỌI máy (kể cả máy này). Còn lại: giữ máy đang dùng, đăng xuất máy khác */
  var datLai = String(p.datLai) === '1' && ph.kieu === 'otp';
  var dx = huyMoiPhien(sdt, datLai ? '' : p.token);
  if (!datLai) sheetPhien().getRange(ph.dong, 5).setValue('mk');   // phiên này giờ là mật khẩu riêng
  qmkNhatKy(sdt, datLai ? 'PASSWORD_RESET_SUCCESS' : 'PASSWORD_CHANGED', (datLai ? 'qua OTP số điện thoại, ' : '') + 'đăng xuất ' + dx + ' phiên khác');
  guiMailDoiMk(sdt, (tenTheoSdt()[sdt] || ''), cfg);
  return { ok: true, code: 'PASSWORD_RESET_SUCCESS', dangXuat: datLai };
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
    // Số chưa có hồ sơ (khách đăng ký mới) thì cho nhận mã qua email vừa nhập.
    // Số ĐÃ có hồ sơ thì chỉ dùng email đã lưu, tránh người lạ chuyển mã sang email của họ.
    if (!dong && !emailKhach && emailHopLe(p.email)) emailKhach = String(p.email).trim();
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
  var token = luuPhien(sdt, 'otp');
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
/* Token bot lưu trong Script Properties (nhập ở Quản trị → Hệ thống → Khoá bí mật), không nằm trong mã */
function zaloToken_() { return PropertiesService.getScriptProperties().getProperty('ZALO_BOT_TOKEN') || ZALO_BOT_TOKEN; }
function zaloBotGoi(method, payload) {
  var tk = zaloToken_(); if (!tk) return '';
  var res = UrlFetchApp.fetch(ZALO_BOT_API + tk + '/' + method, {
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
  if (!zaloToken_() || !chat) return;
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

