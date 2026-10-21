# Hương Chất Kids – huongchatkids.vn (đọc trước khi sửa)

Chủ shop không rành kỹ thuật: luôn trả lời **tiếng Việt**, ngắn gọn, dễ hiểu.

## Web chạy ở đâu (từ 16/10/2026)
- Toàn bộ web chạy trên **VPS 103.77.242.192** (nginx, Cloudflare proxy, SSL Full strict). GitHub Pages chỉ còn là đường lùi.
- **Code nằm trên GitHub** (repo công khai `Dohoang2010/huongchatkids`, nhánh `main`). VPS tự `git pull` mỗi phút
  → sửa web = commit + push lên `main`, khoảng 1 phút sau là lên web thật (gọi `https://huongchatkids.vn/api/keo-web` để VPS kéo ngay).
  Trang quản trị **tự lưu** (sửa xong 3 giây) và từ 20/10/2026 **lưu thẳng vào VPS** (web đổi ngay); VPS tự commit tại chỗ rồi gửi bản sao lên GitHub, nên GitHub có thể đi sau VPS vài phút – push của mình được VPS rebase các commit "Quản trị (…)" lên trên. Trước khi sửa luôn `git pull` (chủ shop sửa ở nhiều máy / nhiều phiên).
- **Máy chủ (API) cũng chạy trên VPS**: dịch vụ `hck-api` chạy chính file `tools/apps-script.gs` (VPS tự nạp lại sau mỗi lần pull)
  qua lớp giả lập trong `tools/may-chu-vps/` – xem `tools/may-chu-vps/README.md`. Dữ liệu nằm trong PostgreSQL trên VPS.
  - Sửa chức năng máy chủ = sửa `tools/apps-script.gs` rồi push → **lên thật ngay**, nên kiểm tra kỹ (`node -e "new Function(require('fs').readFileSync('tools/apps-script.gs','utf8'))"`).
  - Google Apps Script cũ chỉ còn chuyển tiếp sang VPS. **Sửa / deploy Apps Script trên Google không còn tác dụng** – không dùng `tools/deploy-appscript.sh` nữa.
  - **Kiểm thử máy chủ** (dữ liệu giả, không đụng dữ liệu thật): `node --test tools/may-chu-vps/kiem-thu/kiem-thu.js tools/may-chu-vps/kiem-thu/chuc-nang.test.js tools/kiem-thu/le-hoi.test.js tools/kiem-thu/gia-gio-hang.test.js` (gia-gio-hang = giờ vàng, mã giảm giá, quà tặng, ship, tìm kiếm của js/app.js, nạp qua tools/kiem-thu/moi-truong-web.js). Hook pre-commit tự chạy khi sửa mã máy chủ hoặc js/app.js; VPS chỉ nạp apps-script.gs mới khi qua kiểm thử (hỏng → giữ bản cũ + báo Zalo). Thêm chức năng máy chủ = thêm bài kiểm thử trong chuc-nang.test.js.
  - Không bao giờ chạy lệnh nhập lại từ Google Sheets (`/noi-bo/nhap`): sẽ ghi đè dữ liệu thật bằng dữ liệu cũ.

## Trang quản trị (19/10/2026)
- **Lưu thẳng vào VPS** (src/dong-bo-web.js, chạy bằng root): API bỏ thay đổi vào hàng chờ /var/lib/hck-api/luu-cho → hck-luu-web.service ghi tệp + commit; hck-keo-web.service (mỗi phút) fetch, rebase, push bản sao lên GitHub, tình trạng ở /var/lib/hck-api/dong-bo.json (kẹt >30 phút → báo Zalo). Kiểm thử: kiem-thu/luu-vps.test.js. Đừng sửa tay tệp trong /var/www/huongchatkids (làm tree bẩn, chặn rebase).
- **Lưu qua máy chủ**: trình duyệt không giữ mã GitHub nữa. Admin gửi `POST /api/qt-github` (`tools/may-chu-vps/src/luu-github.js`), VPS kiểm quyền từng khối ADMIN theo tài khoản nhân viên (`qtQuyenGh_` trong apps-script.gs), ghi nhật ký rồi commit "Quản trị (tk): …". Mã `GITHUB_TOKEN` nằm trong /etc/hck-api/env, đặt bằng `tools/may-chu-vps/cai-github.ps1`.
- **Lịch đăng Facebook** (Quản trị › Bán hàng › Lịch đăng Facebook, `js/admin/m-facebook.js` + `tools/may-chu-vps/src/dang-fb.js`, POST /api/qt-fb): soạn bài + ảnh + bình luận, chủ shop duyệt (bài nhân viên soạn), VPS tự đăng đúng giờ qua Graph API lên page **huongchatkids.vn**. **Bài Claude soạn KHÔNG cần duyệt** (chủ shop dặn 21/10/2026): nhập bằng `node /opt/hck-api/cong-cu/nhap-bai-fb.js <thư mục>` (nhap.json + ảnh) trên VPS → vào thẳng trạng thái Đã duyệt; kiểm tra kỹ số liệu (lấy từ web / máy chủ) và quy định TPCN trước khi nhập, link web tự gắn `?nguon=facebook&cd=`. Dữ liệu: /var/lib/hck-api/fb/. Mã page `FB_PAGE_ID/FB_PAGE_TOKEN` trong /etc/hck-api/env, đặt bằng `tools/may-chu-vps/cai-facebook.ps1`. Mã hết hạn → dừng đăng + thẻ đỏ trong quản trị, **KHÔNG báo Zalo** (chủ shop muốn được báo trong phiên Claude: kiểm tra `/var/lib/hck-api/fb/trang-thai.json` › canDangNhap). Kiểm thử: kiem-thu/dang-fb.test.js.
- **Tự làm ảnh bìa**: `POST /api/qt-anh-bia` (`src/anh-bia.js` + `src/tach-nen.mjs`, AI @imgly chạy tiến trình con ~1 GB RAM; VPS có swap 2 GB).
- **Mục nào mở mới tải**: admin.html chỉ nạp core.js + m-dashboard.js + `js/admin/danh-muc.js` (TỰ SINH). Thêm / sửa `js/admin/m-*.js` xong **phải chạy** `node tools/kiem-thu/tao-danh-muc-qt.js` (hook pre-commit chặn nếu quên; phiên bản ?v= của mục = mã băm, không cần tăng tay).
- Sửa máy chủ Node (tools/may-chu-vps/src, he-thong, package.json) cần `sh tools/may-chu-vps/dua-len-vps.sh` (khác apps-script.gs tự nạp).

## Quy tắc bắt buộc
- Repo **công khai**: không ghi mật khẩu, token, khoá vào bất kỳ file nào. Khoá chỉ nằm trong `/etc/hck-api/env` trên VPS.
  Hook `.git/hooks/pre-commit` chặn chuỗi giống khoá – không bỏ qua bằng `--no-verify`.
- `js/data.js`: các khối giữa `/* ===ADMIN:XXX=== */` do trang quản trị ghi đè – sửa bên trong khối, giữ dấu mốc.
- Đổi file JS/CSS thì tăng số phiên bản `?v=` trong các file HTML dùng nó.
- Sản phẩm là thực phẩm bổ sung / mỹ phẩm: không viết công dụng chữa bệnh, luôn "theo nhà sản xuất".
- Vào VPS cần khoá SSH riêng của máy đã được gắn (hiện chỉ máy Windows của shop có `~/.ssh/id_ed25519_hck_vps`).
  Máy / tài khoản khác muốn vào VPS: tạo khoá mới và nhờ chủ shop gắn – không dùng mật khẩu root.

## Giao diện ngày lễ (16/10/2026)
- Engine: `js/le-hoi.js` (nạp defer trên mọi trang bán hàng, không nạp ở quan-ly-ton-kho; admin chỉ dùng phần tính lịch). Cấu hình: khối `ADMIN:LE_HOI` trong js/data.js, sửa ở Quản trị › Website › Giao diện ngày lễ (`js/admin/m-le-hoi.js`).
- Chỉ là lớp trang trí (dải chào mừng `.le-dai`, hiệu ứng `.le-hoa`, biến màu `--le-1/--le-2/--le-chu`) – không đụng giá, giỏ, voucher, điểm. Mặc định không hiện ở checkout.
- Âm lịch Việt Nam tính thiên văn (UTC+7) + bảng đối chiếu `DOI_CHIEU`; thêm năm mới vào bảng khi có lịch công bố.
- Kiểm thử: `node --test tools/kiem-thu/le-hoi.test.js` (đồng hồ giả, 19 bài).
- SU_KIEN (tab sự kiện, quà điểm) vẫn tách riêng; `giuCT: true` = không tạm dừng quà tặng/giờ vàng ngày thường.
