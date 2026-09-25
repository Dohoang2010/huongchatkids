/**
 * NHẬN ĐƠN HÀNG – HƯƠNG CHẤT KIDS
 * Mỗi đơn khách đặt trên website sẽ: ghi 1 dòng vào Google Sheet + gửi email + nhắn về Zalo qua bot.
 *
 * CÁCH DÙNG FILE NÀY (làm 1 lần):
 *  1. Mở Google Sheet đơn hàng → menu Tiện ích mở rộng → Apps Script.
 *  2. Bấm vào vùng code, ấn Ctrl+A (máy Mac: Cmd+A) để bôi đen HẾT, ấn Delete cho sạch,
 *     rồi dán toàn bộ file này vào. Bấm Lưu (biểu tượng đĩa mềm).
 *  3. Mở Zalo, vào "Bot hương chất kids", nhắn cho bot 1 tin bất kỳ (ví dụ: xin chào).
 *     Bắt buộc, vì Zalo chỉ cho bot nhắn lại cho người đã nhắn cho nó trước.
 *  4. Ở ô chọn hàm (đang hiện chữ doPost) chọn zaloBotLayChatId → bấm Chạy.
 *     Lần đầu Google hỏi quyền: Xem lại quyền → chọn tài khoản → Nâng cao → Chuyển đến… → Cho phép.
 *  5. Mở Nhật ký thực thi (Ctrl+Enter), tìm dòng "ĐÃ LƯU mã hộp chat: …".
 *     Dán số đó vào ZALO_BOT_CHAT_ID bên dưới rồi bấm Lưu.
 *  6. Chọn hàm zaloBotThuGuiTin → Chạy → kiểm tra Zalo đã nhận được tin thử chưa.
 *  7. Bấm Triển khai → Quản lý bản triển khai → biểu tượng bút chì → Phiên bản mới → Triển khai.
 *     BẮT BUỘC làm bước này mỗi lần sửa code, nếu không website vẫn chạy code cũ.
 */

var EMAIL = 'huongchatkids@gmail.com';   // nơi nhận email báo đơn

// Bot Zalo báo đơn (tạo tại https://zalo.me/s/botcreator/)
var ZALO_BOT_TOKEN = '';                 // dán token bot vào đây (KHÔNG commit lên GitHub)
var ZALO_BOT_CHAT_ID = '';               // để trống: chạy hàm zaloBotLayChatId() để lấy

var HEADERS = ['Thời gian', 'Mã đơn', 'Loại', 'Khách', 'Điện thoại', 'Địa chỉ', 'Sản phẩm',
               'Tiền hàng', 'Giảm', 'Ship', 'Tổng', 'Thanh toán', 'Mã giảm giá', 'Ghi chú', 'Email'];

/* ============ NHẬN ĐƠN TỪ WEBSITE ============ */

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
    try { zaloBotGuiTin(text); } catch (err2) { Logger.log('Zalo bot lỗi: ' + err2); }

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

/** Mở link /exec trên trình duyệt để kiểm tra đã cài đúng chưa. */
function doGet() {
  return ContentService.createTextOutput('Hương Chất Kids – nơi nhận đơn đang hoạt động.');
}

/** Chạy thử: tạo 1 đơn giả để xem Sheet, email và Zalo có nhận được không. */
function testDonHang() {
  doPost({ postData: { contents: JSON.stringify({
    code: 'HCK-TEST', type: 'checkout',
    customer: { name: 'Khách thử', phone: '0865023003', address: 'Hà Nội' },
    items: [{ short: 'Nước ép Lotte Tăng Cao', variant: 'Hộp 10 gói', qty: 2 }],
    subtotal: 896000, discount: 0, ship: 25000, total: 921000, payment: 'cod', note: 'Đơn thử'
  }) } });
}

/* ============ BÁO ĐƠN VỀ ZALO BẰNG BOT ============ */

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

/** Gửi 1 tin về Zalo của chủ shop qua bot. */
function zaloBotGuiTin(text) {
  var chat = zaloBotChatId();
  if (!ZALO_BOT_TOKEN || !chat) return;
  Logger.log('Zalo bot: ' + zaloBotGoi('sendMessage', { chat_id: chat, text: text }));
}

/** Chạy SAU KHI đã nhắn 1 tin cho bot trên Zalo, để lấy và lưu mã hộp chat. */
function zaloBotLayChatId() {
  if (!ZALO_BOT_TOKEN) { Logger.log('Chưa dán ZALO_BOT_TOKEN ở đầu file.'); return ''; }
  for (var lan = 0; lan < 3; lan++) {
    var raw = zaloBotGoi('getUpdates', { offset: 0, limit: 20, timeout: 15 });
    Logger.log(raw);
    var d = {};
    try { d = JSON.parse(raw || '{}'); } catch (e) {}
    var ds = d && d.result ? (d.result.length ? d.result : [d.result]) : [];
    for (var i = 0; i < ds.length; i++) {
      var m = ds[i] && (ds[i].message || ds[i]);
      var id = m && m.chat && m.chat.id;
      if (id) {
        PropertiesService.getScriptProperties().setProperty('ZALO_BOT_CHAT_ID', String(id));
        Logger.log('ĐÃ LƯU mã hộp chat: ' + id + '  → dán số này vào ZALO_BOT_CHAT_ID ở đầu file.');
        return String(id);
      }
    }
  }
  Logger.log('Chưa thấy tin nào. Hãy mở Zalo nhắn cho bot 1 tin rồi chạy lại hàm này ngay sau đó.');
  return '';
}

/** Chạy để thử gửi 1 tin về Zalo qua bot. */
function zaloBotThuGuiTin() {
  zaloBotGuiTin('Hương Chất Kids: thử báo đơn về Zalo qua bot. Nếu chị đọc được tin này là đã chạy tốt.');
}

/** Xem mã hộp chat đang lưu. */
function zaloBotXemChatId() {
  Logger.log('ZALO_BOT_CHAT_ID = ' + (zaloBotChatId() || '(chưa có)'));
}
