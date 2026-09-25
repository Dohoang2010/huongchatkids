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

// ----- BÁO ĐƠN VỀ ZALO (qua Zalo OA – xem hướng dẫn ở cuối file) -----
var ZALO_APP_ID = '2831485758862930392';   // ID ứng dụng trong developers.zalo.me
var ZALO_APP_SECRET = '';                 // Secret key của ứng dụng đó (cần để tự làm mới token)
var ZALO_USER_ID = '';                    // để trống: script tự lấy khi chị nhắn cho OA (xem mục Webhook)
// Refresh token KHÔNG để trong code: chạy hàm zaloLuuRefreshToken('…') một lần, nó được cất trong Script Properties.

var HEADERS = ['Thời gian', 'Mã đơn', 'Loại', 'Khách', 'Điện thoại', 'Địa chỉ', 'Sản phẩm',
               'Tiền hàng', 'Giảm', 'Ship', 'Tổng', 'Thanh toán', 'Mã giảm giá', 'Ghi chú', 'Email'];

function doPost(e) {
  try {
    var order = JSON.parse(e.postData.contents);

    // Sự kiện từ Zalo OA (khi chủ shop nhắn cho OA) -> lưu user_id để gửi tin báo đơn
    if (order && order.event_name && order.sender && order.sender.id) {
      PropertiesService.getScriptProperties().setProperty('ZALO_USER_ID', String(order.sender.id));
      Logger.log('Đã lưu ZALO_USER_ID: ' + order.sender.id);
      return ContentService.createTextOutput(JSON.stringify({ ok: true, zalo: true })).setMimeType(ContentService.MimeType.JSON);
    }
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
    try { zaloGuiTin(text); } catch (e) { Logger.log('Zalo lỗi: ' + e); }
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

/* =====================================================================
 *  BÁO ĐƠN VỀ ZALO (Zalo OA)
 *  Zalo không cho gửi tin vào Zalo cá nhân bằng API, nên phải đi qua một
 *  Official Account (OA) miễn phí của shop. Làm 1 lần:
 *
 *  1. Tạo OA tại https://oa.zalo.me (loại Doanh nghiệp/Bán hàng, miễn phí).
 *     Dùng Zalo cá nhân của chị bấm "Quan tâm" OA đó và nhắn cho OA 1 tin bất kỳ.
 *  2. Vào https://developers.zalo.me → Tạo ứng dụng → mục "Official Account API"
 *     → Liên kết OA vừa tạo. Ghi lại App ID và Secret key → điền vào ZALO_APP_ID,
 *     ZALO_APP_SECRET ở đầu file.
 *  3. Trong ứng dụng đó, mở công cụ tạo access token (Tools / API Explorer),
 *     cấp quyền cho OA, copy REFRESH TOKEN.
 *  4. Trong Apps Script: chọn hàm zaloLuuRefreshToken ở ô chọn hàm, sửa chuỗi
 *     'DAN_REFRESH_TOKEN_VAO_DAY' thành refresh token vừa copy, bấm Chạy.
 *  5. Chọn hàm zaloLayUserId, bấm Chạy, mở Nhật ký (Ctrl+Enter) để xem user_id
 *     của chị → điền vào ZALO_USER_ID ở đầu file.
 *  6. Cài Webhook để script tự biết user_id của chị:
 *     developers.zalo.me → ứng dụng → Official Account API → Webhook
 *     → dán chính link /exec của script này vào ô URL
 *     → tích sự kiện "Người dùng gửi tin văn bản cho OA" (user_send_text) → Lưu.
 *     Sau đó mở Zalo, nhắn 1 tin bất kỳ cho OA của shop. Chạy hàm zaloXemUserId để kiểm tra.
 *  7. Bấm Lưu, rồi Triển khai → Quản lý bản triển khai → bút chì → Phiên bản mới.
 *
 *  Lưu ý: Zalo chỉ cho OA nhắn cho người đã tương tác trong vòng 7 ngày. Nếu lâu
 *  không nhắn cho OA, tin báo đơn có thể bị từ chối – lúc đó chị chỉ cần mở Zalo
 *  nhắn cho OA của mình 1 tin là dùng tiếp được. Email và Telegram thì không giới hạn.
 * ===================================================================== */

function zaloLuuRefreshToken(token) {
  var t = token || 'DAN_REFRESH_TOKEN_VAO_DAY';
  PropertiesService.getScriptProperties().setProperty('ZALO_REFRESH_TOKEN', t);
  Logger.log('Đã lưu refresh token.');
}

function zaloAccessToken() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('ZALO_ACCESS_TOKEN');
  var hetHan = Number(props.getProperty('ZALO_TOKEN_EXP') || 0);
  if (token && Date.now() < hetHan - 60000) return token;

  var refresh = props.getProperty('ZALO_REFRESH_TOKEN');
  if (!ZALO_APP_ID || !ZALO_APP_SECRET || !refresh) return '';

  var res = UrlFetchApp.fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
    method: 'post', muteHttpExceptions: true,
    headers: { secret_key: ZALO_APP_SECRET },
    contentType: 'application/x-www-form-urlencoded',
    payload: { refresh_token: refresh, app_id: ZALO_APP_ID, grant_type: 'refresh_token' }
  });
  var d = JSON.parse(res.getContentText());
  if (!d.access_token) throw new Error('Không lấy được access token Zalo: ' + res.getContentText());
  props.setProperty('ZALO_ACCESS_TOKEN', d.access_token);
  props.setProperty('ZALO_TOKEN_EXP', String(Date.now() + (Number(d.expires_in || 3600) * 1000)));
  if (d.refresh_token) props.setProperty('ZALO_REFRESH_TOKEN', d.refresh_token);
  return d.access_token;
}

function zaloUserId() {
  return ZALO_USER_ID || PropertiesService.getScriptProperties().getProperty('ZALO_USER_ID') || '';
}

function zaloGuiTin(text) {
  var uid = zaloUserId();
  if (!ZALO_APP_ID || !uid) return;
  var token = zaloAccessToken();
  if (!token) return;
  var res = UrlFetchApp.fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
    method: 'post', muteHttpExceptions: true, contentType: 'application/json',
    headers: { access_token: token },
    payload: JSON.stringify({ recipient: { user_id: uid }, message: { text: text } })
  });
  Logger.log('Zalo: ' + res.getContentText());
}

/** Xem user_id đã lưu (có sau khi chị nhắn 1 tin cho OA và webhook đã cài đúng). */
function zaloXemUserId() {
  Logger.log('ZALO_USER_ID = ' + (zaloUserId() || '(chưa có – hãy nhắn 1 tin cho OA rồi chạy lại)'));
}

/** Lưu tạm access token Zalo (dùng được ~1 giờ) để thử ngay khi chưa có Secret key. */
function zaloLuuAccessTokenTam(token) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('ZALO_ACCESS_TOKEN', token || 'DAN_ACCESS_TOKEN_VAO_DAY');
  props.setProperty('ZALO_TOKEN_EXP', String(Date.now() + 55 * 60 * 1000));
  Logger.log('Đã lưu access token tạm.');
}

/** Chạy để thử gửi 1 tin Zalo. */
function zaloThuGuiTin() {
  zaloGuiTin('Hương Chất Kids: thử gửi tin báo đơn về Zalo.');
}
