# Viết bài Cẩm nang chăm con tự động (3 ngày 1 bài)

Hướng dẫn cho lịch chạy tự động trên Claude (cloud). Mỗi lần chạy: viết **1 bài mới** cho mục
"Cẩm nang chăm con" của huongchatkids.vn, rồi commit và push thẳng lên nhánh `main` (GitHub Pages
tự đưa lên web). Không hỏi lại, không mở pull request.

## 1. Đọc dữ liệu

- Toàn bộ dữ liệu nằm trong `js/data.js`.
- Bài viết nằm trong mảng `window.POSTS`, giữa hai dấu mốc `/* ===ADMIN:POSTS=== … */` và
  `/* ===/ADMIN:POSTS=== */`. Chỉ sửa bên trong khối này, không viết ghi chú (comment) bên trong.
- Sản phẩm nằm trong `window.PRODUCTS` (khối `ADMIN:PRODUCTS`). Bỏ qua sản phẩm có `an: true`
  hoặc `stock` bằng 0. Thông tin để viết: `name`, `short`, `cat`, `ages`, `highlights`, `usage`, `desc`, `tags`.

## 2. Chọn ngày đăng

- Tìm ngày lớn nhất trong trường `date` (dạng `dd/mm/yyyy`) của tất cả bài trong `POSTS`.
- Bài mới có `date` = ngày đó **cộng 3 ngày**. Nếu kết quả trước hôm nay thì dùng ngày hôm nay.
- Web tự ẩn bài có ngày ở tương lai và tự hiện khi tới ngày, nên cứ hẹn trước như vậy.
- Nếu đã có từ 4 bài trở lên có ngày ở tương lai (hàng chờ đủ dài), **không viết thêm**, dừng lại.

## 3. Chọn chủ đề

- Ưu tiên sản phẩm cho bé (không phải `cat: 'cho-me'`) và sản phẩm có nhãn `Sản phẩm hot` / `Bán chạy`.
- Không trùng chủ đề với 10 bài gần nhất (đọc `title`, `sanPham` của chúng). Xoay vòng giữa các
  nhóm: dinh dưỡng theo tuổi, vitamin & canxi, tiêu hoá, đề kháng, ăn dặm & bữa ăn, sữa, tăng cân, chiều cao.
- Bài là kiến thức chăm con hữu ích, sản phẩm chỉ là gợi ý đi kèm – không viết kiểu quảng cáo.

## 4. Định dạng một bài

Thêm bài mới vào **đầu** mảng `POSTS` (ngay sau dòng `window.POSTS = [`), theo đúng mẫu:

```js
  { id: 'slug-khong-dau-ngan-gon', title: 'Tiêu đề rõ ràng, dưới 90 ký tự', cat: 'Dinh dưỡng', date: 'dd/mm/yyyy', read: '4 phút', emoji: '🍼', color: '#FFE9EF', image: 'img/<mã sản phẩm>.jpg',
    sanPham: ['<mã sản phẩm>', '<mã sản phẩm>'],
    excerpt: 'Tóm tắt 1–2 câu, dưới 200 ký tự.',
    body: ['Đoạn mở đầu.',
      '## Tiêu đề nhỏ',
      'Đoạn văn.',
      '- Gạch đầu dòng',
      '![Chú thích ảnh](img/<mã sản phẩm>-2.jpg)',
      '[[sp:<mã sản phẩm>]]',
      'Đoạn kết.'] },
```

- `cat` chọn một trong: `Dinh dưỡng`, `Vitamin`, `Chăm con`, `Tiêu hoá`, `Tuổi teen`, `Mua sắm`.
- `id` là duy nhất, chữ thường không dấu nối bằng gạch ngang.
- `color` là màu nền nhạt (VD `#FFE9EF`, `#E8F4FF`, `#EEF8E6`, `#FFF3D6`, `#F3E9FF`, `#E0F5F2`).
- Ảnh: chỉ dùng file **đã có** trong repo – `img/<mã>.jpg` và `img/<mã>-2.jpg` … `img/<mã>-5.jpg`.
  Kiểm tra file tồn tại trước khi dùng. Không tạo ảnh mới.
- `body`: 10–20 dòng; dòng bắt đầu `## ` là tiêu đề nhỏ, `- ` là gạch đầu dòng,
  `![chú thích](đường dẫn)` là ảnh, `[[sp:mã]]` là thẻ sản phẩm (2–3 thẻ mỗi bài).
- Chỉ thêm `noiBat: true` nếu bài viết chủ yếu về một sản phẩm có nhãn `Sản phẩm hot`.
- Chuỗi dùng dấu nháy đơn; nếu trong chữ có dấu nháy đơn thì đổi thành dấu nháy kép hoặc viết lại.

## 5. Quy tắc nội dung (bắt buộc)

- Tiếng Việt có dấu, giọng gần gũi xưng "mẹ", câu ngắn, thông tin cụ thể (con số, độ tuổi, liều).
- Công dụng sản phẩm luôn ghi "theo nhà sản xuất". Không nói sản phẩm chữa bệnh, thay thuốc,
  hay cam kết kết quả. Không bịa số liệu; chỉ dùng thông tin có trong `js/data.js` hoặc kiến thức
  dinh dưỡng phổ biến, thận trọng (VD nhu cầu canxi, vitamin D theo tuổi).
- Có ít nhất một câu nhắc khi nào cần đưa bé đi khám hoặc hỏi bác sĩ.
- Không nhắc giá cụ thể trong bài (thẻ sản phẩm tự hiện giá).

## 6. Kiểm tra trước khi đẩy lên

- `js/data.js` phải còn chạy được: mở bằng trình duyệt không cài được thì ít nhất kiểm tra cú pháp
  bằng `node --check js/data.js` nếu có Node; ngoặc, dấu phẩy, dấu nháy phải khớp.
- Đúng một bài mới được thêm, các bài cũ giữ nguyên.
- Mọi đường dẫn ảnh và mã sản phẩm trong bài đều tồn tại.

## 7. Commit và push

- `git pull --rebase` trước, sửa xong commit với tiêu đề: `Cẩm nang: <tiêu đề bài> (đăng dd/mm/yyyy)`
  rồi `git push origin main`.
- Nếu push bị từ chối vì có thay đổi mới, `git pull --rebase` rồi push lại. Không dùng `--force`.
- Không sửa file nào khác ngoài `js/data.js`.
