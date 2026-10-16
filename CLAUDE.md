# Hương Chất Kids – huongchatkids.vn (đọc trước khi sửa)

Chủ shop không rành kỹ thuật: luôn trả lời **tiếng Việt**, ngắn gọn, dễ hiểu.

## Web chạy ở đâu (từ 16/10/2026)
- Toàn bộ web chạy trên **VPS 103.77.242.192** (nginx, Cloudflare proxy, SSL Full strict). GitHub Pages chỉ còn là đường lùi.
- **Code nằm trên GitHub** (repo công khai `Dohoang2010/huongchatkids`, nhánh `main`). VPS tự `git pull` mỗi phút
  → sửa web = commit + push lên `main`, khoảng 1 phút sau là lên web thật (gọi `https://huongchatkids.vn/api/keo-web` để VPS kéo ngay).
  Trang quản trị **tự lưu** (sửa xong 3 giây tự ghi js/data.js lên GitHub rồi gọi keo-web) – không còn nút Xuất bản bắt buộc. Trước khi sửa luôn `git pull` (chủ shop sửa ở nhiều máy / nhiều phiên).
- **Máy chủ (API) cũng chạy trên VPS**: dịch vụ `hck-api` chạy chính file `tools/apps-script.gs` (VPS tự nạp lại sau mỗi lần pull)
  qua lớp giả lập trong `tools/may-chu-vps/` – xem `tools/may-chu-vps/README.md`. Dữ liệu nằm trong PostgreSQL trên VPS.
  - Sửa chức năng máy chủ = sửa `tools/apps-script.gs` rồi push → **lên thật ngay**, nên kiểm tra kỹ (`node -e "new Function(require('fs').readFileSync('tools/apps-script.gs','utf8'))"`).
  - Google Apps Script cũ chỉ còn chuyển tiếp sang VPS. **Sửa / deploy Apps Script trên Google không còn tác dụng** – không dùng `tools/deploy-appscript.sh` nữa.
  - Không bao giờ chạy lệnh nhập lại từ Google Sheets (`/noi-bo/nhap`): sẽ ghi đè dữ liệu thật bằng dữ liệu cũ.

## Quy tắc bắt buộc
- Repo **công khai**: không ghi mật khẩu, token, khoá vào bất kỳ file nào. Khoá chỉ nằm trong `/etc/hck-api/env` trên VPS.
  Hook `.git/hooks/pre-commit` chặn chuỗi giống khoá – không bỏ qua bằng `--no-verify`.
- `js/data.js`: các khối giữa `/* ===ADMIN:XXX=== */` do trang quản trị ghi đè – sửa bên trong khối, giữ dấu mốc.
- Đổi file JS/CSS thì tăng số phiên bản `?v=` trong các file HTML dùng nó.
- Sản phẩm là thực phẩm bổ sung / mỹ phẩm: không viết công dụng chữa bệnh, luôn "theo nhà sản xuất".
- Vào VPS cần khoá SSH riêng của máy đã được gắn (hiện chỉ máy Windows của shop có `~/.ssh/id_ed25519_hck_vps`).
  Máy / tài khoản khác muốn vào VPS: tạo khoá mới và nhờ chủ shop gắn – không dùng mật khẩu root.
