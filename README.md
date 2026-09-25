# Hương Chất Kids – Website bán sữa & thực phẩm chức năng cho bé (0–18 tuổi)

Website tĩnh (HTML/CSS/JS thuần, không cần build) được thiết kế theo bố cục của hannaholala.com,
tối ưu UX/UI cho **mẹ Việt có con 0–18 tuổi** và tích hợp các luồng **mua hàng ít điểm chạm**.

## Chạy thử
```bash
cd "web HCK2026"
python3 -m http.server 8080      # rồi mở http://localhost:8080
```
Hoặc mở trực tiếp `index.html`. Deploy: upload nguyên thư mục lên bất kỳ hosting tĩnh nào
(Netlify, Vercel, GitHub Pages, cPanel…).

## Cấu trúc
| File | Nội dung |
|---|---|
| `index.html` | Trang chủ: hero carousel, chọn theo tuổi, 6 khối danh mục, flash sale (đếm ngược), tab bán chạy, combo, cam kết, đánh giá, blog, thương hiệu, đăng ký Zalo |
| `collections.html` | Danh sách sản phẩm: lọc theo tuổi / danh mục / nhu cầu / thương hiệu / giá, sắp xếp, phân trang, tìm kiếm (`?q=`) |
| `product.html?id=` | Chi tiết: gallery, phân loại, ưu đãi, mua ngay, mua kèm tiết kiệm, tab mô tả/cách dùng/đánh giá/chính sách, sản phẩm tương tự, thanh mua sticky mobile |
| `cart.html` | Giỏ hàng + mã giảm giá |
| `checkout.html` | Thanh toán 1 trang (không cần tài khoản) → màn hình đặt hàng thành công |
| `blog.html` | Cẩm nang mẹ (danh sách + bài viết `?id=`) |
| `policy.html` | Trung tâm hỗ trợ: 12 mục (hướng dẫn mua hàng, thanh toán, giao hàng, đổi trả, bảo mật, điều khoản, giới thiệu, chính hãng, FAQ, tra cứu đơn, hợp tác) – nội dung trong `js/policies.js` |
| `account.html` | Đơn hàng gần đây (mua lại 1 chạm), yêu thích, thông tin đã lưu |
| `css/style.css` | Design system (màu, nút, thẻ sản phẩm, modal, drawer, responsive) |
| `js/policies.js` | Nội dung 12 mục hỗ trợ/chính sách (HTML), placeholder {hotline} {email}… tự điền từ SITE |
| `js/data.js` | **Toàn bộ dữ liệu**: thông tin shop, độ tuổi, danh mục, nhu cầu, thương hiệu, sản phẩm, banner, đánh giá, blog, mã giảm giá, tỉnh thành |
| `js/app.js` | Lõi dùng chung: header/menu/tìm kiếm, giỏ hàng (localStorage), Mua nhanh, Gọi lại, ảnh sản phẩm tự sinh, footer, widget nổi, bottom nav |

## Các điểm chạm mua hàng đã tích hợp
| Luồng | Số bước của khách |
|---|---|
| **Mua ngay** trên thẻ sản phẩm / trang sản phẩm → bottom-sheet 3 trường (tên, SĐT, địa chỉ) → Đặt hàng | Lần đầu: 1 chạm + 3 ô nhập. **Lần sau: 2 chạm** (thông tin tự điền) |
| **Đặt qua Zalo** (nút trong modal, trang sản phẩm, bottom nav, widget nổi) | 1 chạm |
| **Gọi lại cho tôi** – chỉ nhập SĐT, dược sĩ gọi trong 5 phút | 1 ô nhập |
| **Gọi hotline** – `tel:` ở header, widget nổi, bottom nav | 1 chạm |
| **Thêm giỏ → mini-cart → Thanh toán ngay** | 2 chạm |
| **Mua kèm tiết kiệm** trên trang sản phẩm – thêm cả bộ 3 SP vào giỏ | 1 chạm |
| **Mua lại đơn gần nhất** – dải nhắc trên trang chủ & trang tài khoản | 1 chạm → checkout đã điền sẵn |
| **Thanh toán 1 trang**, COD mặc định, không bắt đăng ký, tự nhớ thông tin | – |
| **Thanh mua sticky** trên mobile khi cuộn qua nút mua chính | – |

## Dữ liệu sản phẩm
`js/data.js` hiện chứa **29 sản phẩm** nhập từ 3 file xuất Shopee (21/09/2026) với ảnh, điểm đánh giá, đã bán; 8 danh mục.
Giá niêm yết (gạch ngang) = giá bán × 1,40 (nước ép) / 1,35 (hồng sâm, sữa, thực phẩm, mẹ) / 1,30 (vitamin & canxi).

**Ảnh sản phẩm**: đặt file vào thư mục `img/` với tên = mã sản phẩm Shopee + `.jpg`
(danh sách trong `img/README.txt`, VD `img/28254163202.jpg`). Chưa có file → web tự hiện ảnh minh hoạ.
Muốn nhiều ảnh cho gallery: thêm `images: ['img/a.jpg', 'img/b.jpg', 'img/c.jpg']` vào sản phẩm.

## Tuỳ chỉnh nhanh
- **Tên shop, hotline, Zalo, Messenger, Shopee, địa chỉ, ngưỡng freeship, từ khoá tìm kiếm gợi ý**: `window.SITE`.
- **Thêm sản phẩm**: thêm object vào `window.PRODUCTS` (xem mẫu có sẵn). `variants` = phân loại (giá "từ" lấy theo phân loại rẻ nhất).
  `sold` / `reviews` = 0 thì thẻ sản phẩm tự ẩn "Đã bán" / sao đánh giá.
- **Danh mục, nhu cầu, thương hiệu, menu**: `CATEGORIES`, `NEEDS`, `BRANDS`, `NAV` – menu desktop & mobile sinh tự động từ `NAV`.
- **Màu sắc**: biến `--primary`, `--teal`, `--amber` đầu file `css/style.css`.
- **Mã giảm giá**: `window.COUPONS`.
- **Feedback thực tế**: `window.FEEDBACKS` + ảnh trong `img/feedback/` – mục trang chủ tự hiện khi có ≥1 ảnh, bấm ảnh phóng to.
- **Ngày sale Shopee**: `SITE.shopeeSale` – ngày 15, 25 và ngày đôi (1/1 … 12/12) nút "Xem trên Shopee" tự chuyển màu cam kèm tag "Siêu ưu đãi ngày …". Xem trước bằng `?demo_date=2026-09-09`.
- **Chuyển khoản / VietQR**: `SITE.bank` (ngân hàng, BIN, số tài khoản, tên chủ TK) và `SITE.transferFormat` (mẫu nội dung, mặc định `{name}_thanhtoan_{code}`). Mã QR chuẩn NAPAS được tạo ngay trên web (`js/qrcode.min.js` + hàm `vietqrPayload` trong app.js), tự điền số tiền & nội dung cho từng đơn. BIN các ngân hàng khác: Vietcombank 970436, Techcombank 970407, MB 970422, VietinBank 970415, Agribank 970405, ACB 970416, TPBank 970423, VPBank 970432.

## Kết nối backend
Mọi đơn hàng / yêu cầu gọi lại đi qua hàm `submitOrder(order)` trong `js/app.js` (hiện lưu vào
localStorage để demo). Thay phần thân hàm bằng `fetch('/api/orders', { method: 'POST', body: JSON.stringify(order) })`
hoặc gửi tới Google Sheets / Zalo OA / Haravan / Sapo webhook. Cấu trúc `order`:
```js
{ type: 'quick' | 'checkout' | 'callback', customer: { name, phone, address, email },
  payment: 'cod' | 'bank', shipMethod, coupon, note,
  items: [{ id, name, variant, qty, price }], subtotal, discount, ship, total }
```

## Lưu ý pháp lý (thị trường VN)
Đã có sẵn dòng cảnh báo bắt buộc cho TPCN ("Thực phẩm này không phải là thuốc…") và sữa công thức
("Sữa mẹ là thức ăn tốt nhất…") ở trang sản phẩm và footer.

## Lưu ý vận hành
- Thư mục dự án nằm trong Desktop được iCloud đồng bộ. Khi ổ đĩa gần đầy, macOS có thể đẩy file lên iCloud
  (file còn tên nhưng rỗng trên máy) làm web mất ảnh và git treo. Nên tắt *Optimise Mac Storage* hoặc chuột phải
  thư mục → *Keep Downloaded*, hoặc chuyển dự án ra ngoài Desktop/Documents.
- Số liệu mẫu còn lại: bài blog (nội dung tham khảo), mảng `REVIEWS` (không hiển thị – bật bằng `SITE.showReviews = true`).

## Tồn kho: còn hàng / hết hàng

Trạng thái tồn kho nằm ở `data/stock.json` (`true` = còn hàng, `false` = hết hàng). Web đọc file này khi mở trang và tự kiểm tra lại mỗi 3 phút, nên đổi tồn kho **không cần sửa code**.

Ba cách cập nhật:

1. **Trang quản lý (tiện nhất, làm được trên điện thoại)** – mở `quan-ly-ton-kho.html` trên web
   (https://huongchatkids.vn/quan-ly-ton-kho.html), bật/tắt từng sản phẩm rồi bấm **Lưu lên web**.
   Lần đầu cần dán 1 mã GitHub (fine-grained token, quyền *Contents: Read and write* cho repo này);
   mã chỉ lưu trong máy/điện thoại đó. Trang này không có trong menu và có thẻ `noindex`.
2. **Dòng lệnh trên máy**: `python3 tools/stock.py list` / `het <id hoặc tên>` / `con <id>` / `con --all`,
   thêm `--push` để tự commit và đẩy lên web.
3. Sửa tay `data/stock.json` rồi commit.

> Shopee chặn truy cập tự động (API trả 403, trang sản phẩm chỉ render bằng JS), nên web **không thể
> tự đọc tồn kho Shopee**. Nếu shop đăng ký Shopee Open Platform và có API key thì có thể thêm
> GitHub Actions chạy định kỳ để ghi `data/stock.json` tự động.

## Thứ tự hiển thị sản phẩm

Trường `priority` trong `js/data.js` quyết định sản phẩm nào lên đầu khi khách xem *Tất cả sản phẩm*
hoặc tìm kiếm (3 = cao nhất). Hiện đặt 3 cho nước ép Lotte, váng sữa canxi Calciumore, D3K2 và rong biển;
2 cho sữa Lotte Kid A+.

## Nhận đơn hàng (Google Sheet + email + Telegram)

Khi `SITE.orderEndpoint` trong `js/data.js` còn rỗng, đơn chỉ lưu trong máy khách – shop **không** nhận được gì.
Cách nối (miễn phí, ~10 phút): làm theo hướng dẫn ngay đầu file `tools/apps-script.gs`
(tạo Google Sheet → Extensions → Apps Script → dán code → Deploy dạng Web app, *Anyone* →
copy link `.../exec` → dán vào `orderEndpoint` → commit & push).

Sau đó mỗi đơn (đặt hàng, mua nhanh, yêu cầu gọi lại) sẽ tự: thêm 1 dòng vào Google Sheet,
gửi email về `huongchatkids@gmail.com`, và nhắn Telegram nếu đã điền `TELEGRAM_TOKEN` / `TELEGRAM_CHAT_ID`.

Muốn nhận Telegram: chat với **@BotFather** → `/newbot` → lấy token; chat với **@userinfobot** → lấy `Id`;
nhắn 1 câu bất kỳ cho bot của mình rồi điền 2 giá trị đó vào `tools/apps-script.gs` và deploy lại.

Nếu khách mất mạng lúc đặt, đơn được xếp hàng trong máy khách và tự gửi lại ở lần mở web sau.

### Báo đơn về Zalo (bằng Zalo Bot – cách đang dùng)

Cách rẻ nhất và không cần OA trả phí: dùng **Zalo Bot**.

1. Mở Zalo → tìm **Bot Creator** (https://zalo.me/s/botcreator/) → tạo bot. Zalo nhắn lại cho bạn
   một token dạng `211668...:IEUc...`.
2. Dán token vào `ZALO_BOT_TOKEN` trong `tools/apps-script.gs` (**không commit token lên GitHub** –
   repo này là public, chỉ dán trong Apps Script của shop).
3. Mở Zalo, vào đúng con bot đó và **nhắn cho bot 1 tin** (bot chỉ được nhắn lại cho người đã nhắn nó trước).
4. Trong Apps Script chạy hàm `zaloBotLayChatId()` → xem Nhật ký để lấy mã hộp chat
   (mã cũng được lưu tự động vào Script Properties). Dán vào `ZALO_BOT_CHAT_ID`.
5. Chạy `zaloBotThuGuiTin()` để thử, rồi Triển khai → Phiên bản mới.

API của Zalo Bot giống hệt Telegram: `POST https://bot-api.zapps.me/bot<TOKEN>/<method>` với
`getMe`, `getUpdates`, `sendMessage` (`{chat_id, text}`), `sendPhoto`, `setWebhook`.
`getUpdates` trả HTTP 408 "Request timeout" khi không có tin mới – đó là bình thường, không phải lỗi.

### Báo đơn về Zalo OA (cách cũ, tốn phí – đang tắt)

Zalo **không cho gửi tin vào Zalo cá nhân bằng API**, nên tin báo đơn phải đi qua một
**Zalo OA** (Official Account) miễn phí của shop: tạo OA tại https://oa.zalo.me, quan tâm OA đó
bằng Zalo cá nhân, tạo ứng dụng ở https://developers.zalo.me và liên kết OA, rồi điền
`ZALO_APP_ID`, `ZALO_APP_SECRET`, `ZALO_USER_ID` + lưu refresh token theo hướng dẫn chi tiết
ở cuối file `tools/apps-script.gs`.

Giới hạn của Zalo: OA chỉ nhắn được cho người đã tương tác trong vòng 7 ngày. Nếu lâu không nhắn cho OA,
tin báo đơn có thể bị từ chối – mở Zalo nhắn cho OA 1 tin là dùng tiếp được. Email và Telegram không bị giới hạn này.
Muốn gửi chắc chắn mọi lúc thì phải dùng **ZNS (Zalo Notification Service)** – có tính phí theo tin và cần duyệt mẫu tin.
