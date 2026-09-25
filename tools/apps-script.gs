/**
 * Nhận đơn hàng từ website Hương Chất Kids.
 * Mỗi đơn khách đặt trên web sẽ: ghi 1 dòng vào Google Sheet + gửi email + (tuỳ chọn) nhắn Telegram.
 *
 * CÁCH CÀI (làm 1 lần, miễn phí):
 *  1. Vào https://sheets.new → đặt tên "Đơn hàng Hương Chất Kids".
 *  2. Menu Tiện ích mở rộng (Extensions) → Apps Script. Xoá code mẫu, dán toàn bộ file này vào.
 *  3. Sửa EMAIL bên dưới nếu muốn nhận ở hộp thư khác. Muốn nhận Telegram thì điền
 *     TELEGRAM_TOKEN và TELEGRAM_CHAT_ID (xem hướng dẫn ở README).
 *  4. Bấm Triển khai (Deploy) → Tạo bản triển khai mới → loại "Ứng dụng web" (Web app):
 *        Thực thi với tên (Execute as): Tôi / Me
 *        Ai có quyền truy cập (Who has access): Bất kỳ ai / Anyone
 *     → Triển khai → Cho phép quyền (Authorize) → copy link dạng
 *       https://script.google.com/macros/s/..../exec
 *  5. Dán link đó vào js/data.js, dòng orderEndpoint: ''  →  orderEndpoint: 'https://script.google.com/.../exec'
 *     rồi commit & push (hoặc nhắn Claude làm giúp).
 *
 * Lưu ý: mỗi lần sửa code phải bấm Triển khai → Quản lý bản triển khai → sửa → Phiên bản mới.
 */

var EMAIL = 'huongchatkids@gmail.com';   // nơi nhận email báo đơn
var TELEGRAM_TOKEN = '';                 // tuỳ chọn, lấy từ @BotFather
var TELEGRAM_CHAT_ID = '';               // tuỳ chọn, lấy từ @userinfobot

var HEADERS = ['Thời gian', 'Mã đơn', 'Loại', 'Khách', 'Điện thoại', 'Địa chỉ', 'Sản phẩm',
               'Tiền hàng', 'Giảm', 'Ship', 'Tổng', 'Thanh toán', 'Mã giảm giá', 'Ghi chú', 'Email'];

function doPost(e) {
  try {
    var order = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    var c = order.customer || {};
    var items = (order.items || []).map(function (it) {
      return (it.short || it.name) + (it.variant ? ' – ' + it.variant : '') + ' × ' + (it.qty || 1);
    }).join('\n');
    var loai = order.type === 'callback' ? 'Yêu cầu gọi lại' : (order.type === 'quick' ? 'Mua nhanh' : 'Đặt hàng');
    var thanhToan = order.payment === 'bank' ? 'Chuyển khoản' : (order.payment ? 'COD' : '');

    sheet.appendRow([
      new Date(), order.code || '', loai, c.name || '', "'" + (c.phone || ''), c.address || '', items,
      order.subtotal || 0, order.discount || 0, order.ship || 0, order.total || 0,
      thanhToan, order.coupon || '', order.note || '', c.email || ''
    ]);

    var tien = (order.total || 0).toLocaleString('vi-VN') + 'đ';
    var text = loai + ' ' + (order.code || '') + '\n'
      + 'Khách: ' + (c.name || '(chưa có tên)') + ' – ' + (c.phone || '') + '\n'
      + (c.address ? 'Địa chỉ: ' + c.address + '\n' : '')
      + (items ? items + '\n' : '')
      + 'Tổng: ' + tien + (thanhToan ? ' (' + thanhToan + ')' : '')
      + (order.note ? '\nGhi chú: ' + order.note : '');

    if (EMAIL) {
      MailApp.sendEmail(EMAIL, '🛒 ' + loai + ' ' + (order.code || '') + ' – ' + tien, text);
    }
    if (TELEGRAM_TOKEN && TELEGRAM_CHAT_ID) {
      UrlFetchApp.fetch('https://api.telegram.org/bot' + TELEGRAM_TOKEN + '/sendMessage', {
        method: 'post', muteHttpExceptions: true,
        payload: { chat_id: TELEGRAM_CHAT_ID, text: text }
      });
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

/** Mở link /exec trên trình duyệt để kiểm tra đã cài đúng chưa. */
function doGet() {
  return ContentService.createTextOutput('Hương Chất Kids – nơi nhận đơn đang hoạt động.');
}

/** Chạy thử trong Apps Script (menu Chạy) để xem Sheet/email có nhận được không. */
function testDonHang() {
  doPost({ postData: { contents: JSON.stringify({
    code: 'HCK-TEST', type: 'checkout', customer: { name: 'Khách thử', phone: '0865023003', address: 'Hà Nội' },
    items: [{ short: 'Nước ép Lotte Tăng Cao', variant: 'Hộp 10 gói', qty: 2 }],
    subtotal: 896000, discount: 0, ship: 25000, total: 921000, payment: 'cod', note: 'Đơn thử'
  }) } });
}
