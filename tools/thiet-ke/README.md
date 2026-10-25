# Công cụ thiết kế & lịch Facebook (Claude, 24–25/10/2026)
Bản lưu các script đã dùng (bản gốc nằm trong thư mục tạm, có thể đã bị xoá). Đường dẫn trong script là đường dẫn cũ – sửa lại khi dùng.
Cài thư viện (chạy trong thư mục làm việc tạm, KHÔNG cài vào repo): `npm i sharp puppeteer-core qrcode` (Chrome: C:/Program Files/Google/Chrome).
- `poster.js` – poster cảm ơn A5 2 mặt gửi kèm đơn (PDF + PNG 300dpi) → Desktop/Poster cam on gui kem don/
- `banner-do-0111.js` – banner trang chủ kiểu sang (nền đỏ đô, chữ vàng, ảnh chị Hương mờ dần) pc 1760x760 / mb 1200x900
- `the.js` – vẽ thẻ ảnh 1080x1080 (thẻ giá, thẻ chương trình, thẻ các bước) cho bình luận Facebook
- `dung.js` – ghép bài FB: chọn ảnh chi tiết (không ảnh bìa, bỏ ảnh dễ bị từ chối quảng cáo), vẽ thẻ, kiểm luật (từ cấm, TPCN, link), xuất nhap.json
- `thay-bai.js` – chạy trên VPS: thay / thêm bài CHƯA ĐĂNG trong /var/lib/hck-api/fb/lich.json (đọc lại lịch ngay trước khi ghi)
- `lich.js`, `BRIEF.md` – cách chia lịch 10 bài/ngày và luật viết bài chạy Ads (không giá gốc, không trích lời khách, TPCN, sữa <24 tháng không quảng cáo)
- `bo-gia-goc.js` – xoá mọi chỗ ghi giá gốc trong bài (giá niêm yết là bí mật)
