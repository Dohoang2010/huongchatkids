# Máy chủ API trên VPS (thay Google Apps Script)

VPS `103.77.242.192` (Oracle Linux 10, Node 22, PostgreSQL 16, nginx). Khoá SSH: `~/.ssh/id_ed25519_hck_vps`, user `root`.

## Cách hoạt động
- VPS chạy **chính file Apps Script của shop** (`tools/apps-script.gs` trên GitHub, VPS tự `git pull` mỗi phút và tự nạp lại mã mới).
  Không viết lại từng lệnh → 83 lệnh `doGet`, `doPost`, các hàm chạy nền giữ đúng quy tắc điểm / voucher / hoa hồng như Apps Script.
- Lớp giả lập (`src/`) thay các dịch vụ Google:
  | Apps Script | Trên VPS |
  |---|---|
  | SpreadsheetApp (Google Sheets) | giữ trong bộ nhớ + ghi PostgreSQL (`hck`: bảng `trang_tinh`, `dong`), mỗi yêu cầu 1 giao dịch; ghi ô giống Sheets (`'0912…` giữ số 0, chuỗi ngày → ngày…) |
  | LockService | mọi lần chạy nối đuôi nhau (1 lượt 1 lần) → không thể trùng điểm / voucher |
  | CacheService | bộ nhớ (giới hạn 100KB/giá trị như Google) |
  | PropertiesService | bảng `thuoc_tinh` (CRM_KEY, cấu hình điểm danh, token Zalo…) |
  | MailApp | gửi SAU khi ghi xong: SMTP nếu có `SMTP_HOST…`, chưa có thì nhờ Apps Script gửi hộ (MailApp như cũ) |
  | UrlFetchApp | lệnh đọc (CRM, Zalo getMe) gọi trước rồi chạy lại – không treo máy chủ; Zalo sendMessage gửi sau khi ghi xong |
  | Trigger 30 phút | máy chủ tự chạy `dongBoCRMTuDong` phút :07 và :37 (chỉ ở chế độ `chinh`) |
- Mỗi lần chạy dùng vùng mã mới như Apps Script; lỗi/chạy lại thì hoàn tác, không ghi nửa vời.
- Hộp thư đi: bảng `hop_thu_di` (mọi mail / tin Zalo, kể cả lúc chạy thử – trạng thái `bo-qua-song-song`).

## Chế độ (`CHE_DO` trong `/etc/hck-api/env`)
- `song-song` (hiện tại): Apps Script vẫn là hệ thống thật. VPS chép dữ liệu từ Sheets mỗi 15 phút (`NHAP_PHUT`), KHÔNG gửi mail/Zalo, KHÔNG chạy nền. Ghi trên VPS bị ghi đè ở lần chép sau.
- `chinh`: VPS là hệ thống thật – gửi mail/Zalo, chạy nền, không chép từ Sheets nữa.

## Lệnh thường dùng (chạy từ máy có khoá SSH)
```bash
sh tools/may-chu-vps/dua-len-vps.sh                       # đưa mã Node lên VPS + cài + khởi động lại
node --test tools/may-chu-vps/kiem-thu/kiem-thu.js        # kiểm thử trên máy (không cần PostgreSQL)
ssh -i ~/.ssh/id_ed25519_hck_vps root@103.77.242.192 sh /opt/hck-api/cong-cu/doi-chieu.sh        # đối chiếu lệnh đọc Apps Script ↔ VPS
ssh -i ~/.ssh/id_ed25519_hck_vps root@103.77.242.192 sh /opt/hck-api/cong-cu/tinh-trang.sh       # tình trạng máy chủ
ssh -i ~/.ssh/id_ed25519_hck_vps root@103.77.242.192 journalctl -u hck-api -f                    # nhật ký
```
Công cụ trên VPS (`/opt/hck-api/cong-cu/`): `doi-chieu.sh` (so 45 lệnh đọc), `apps-script.sh chuyen|quay-lai|thu-quay-lai`, `tinh-trang.sh`, `doi-chieu-bam.sh` (so mã băm từng trang tính Sheets ↔ VPS).
Thử web thật trên VPS trước ngày đổi: mở `http://103.77.242.192` (web tự gọi `/api` của VPS – dữ liệu là bản chép, bị làm mới mỗi 15 phút).

## NGÀY ĐỔI (chỉ làm khi chủ shop đồng ý; chọn giờ vắng khách, ~10 phút)
1. Trên VPS: `sh /opt/hck-api/cong-cu/apps-script.sh chuyen bao-tri` → Apps Script tạm trả "đang nâng cấp", không ai ghi thêm vào Sheets.
2. Chép lần cuối + đối chiếu: `curl -X POST -H "x-noi-bo: $NOI_BO_KHOA" 127.0.0.1:3100/noi-bo/nhap` rồi `sh /opt/hck-api/cong-cu/doi-chieu-bam.sh` → phải **khớp 100%**.
3. Đổi `CHE_DO=chinh` trong `/etc/hck-api/env`, `systemctl restart hck-api`.
4. `sh /opt/hck-api/cong-cu/apps-script.sh chuyen https://huongchatkids.vn/api` → máy khách còn giữ trang cũ (gọi Apps Script) được chuyển tiếp sang VPS; lịch nền của Apps Script tự dừng.
5. Web: sửa `js/data.js` `SITE.loyalty.endpoint: 'https://huongchatkids.vn/api'`, tăng `?v=` → commit, push.
6. Cloudflare (chủ shop làm hoặc cấp quyền): DNS `@` và `www` từ CNAME `dohoang2010.github.io` → bản ghi **A 103.77.242.192**, giữ đám mây cam; SSL/TLS chế độ **Full**. Sau đó cấp chứng chỉ cho tên miền:
   `certbot certonly --webroot -w /var/www/acme -d huongchatkids.vn -d www.huongchatkids.vn`, thêm khối `nginx-https-huongchatkids.vn.conf`, chuyển Cloudflare sang **Full (strict)**.
7. Thử: đăng nhập, điểm danh, giữ voucher khi đặt hàng, trang quản trị (đăng nhập 2 lớp), trang đối tác; xem `hop_thu_di` có mail/Zalo đi ra.
8. Giữ GitHub Pages + Apps Script nguyên vẹn ≥ 30 ngày (đường lùi).

## QUAY LẠI APPS SCRIPT (nếu VPS lỗi sau khi đổi)
1. `sh /opt/hck-api/cong-cu/apps-script.sh chuyen bao-tri` (không ai ghi trong lúc chép ngược).
2. Đổi `CHE_DO=song-song`, `NHAP_PHUT=0` trong env, `systemctl restart hck-api` (VPS ngừng gửi mail/Zalo, ngừng chạy nền, KHÔNG chép đè).
3. `sh /opt/hck-api/cong-cu/apps-script.sh quay-lai` → chép toàn bộ dữ liệu VPS (đơn, điểm, voucher, phiên…) về Google Sheets, đối chiếu mã băm từng trang (phải "Khớp N/N").
4. `sh /opt/hck-api/cong-cu/apps-script.sh chuyen tat` → Apps Script chạy lại như cũ, lịch nền 30 phút tự chạy lại.
5. Web: trả `SITE.loyalty.endpoint` về địa chỉ Apps Script cũ (commit, push). Cloudflare: trả `@`/`www` về CNAME `dohoang2010.github.io`.
Đã thử chép ngược trên trang tạm (`thu-quay-lai`) – xem kết quả trong ghi chú bàn giao.

## Bảo mật
- Khoá chỉ nằm ở `/etc/hck-api/env` (quyền 600, root): `VPS_KHOA` (Apps Script chỉ lưu mã băm `VPS_KHOA_BAM`), `NOI_BO_KHOA`, SMTP. Repo công khai không có khoá.
- Token Zalo / CRM_KEY nằm trong thuộc tính (chép từ Script Properties). Token Zalo: chủ shop nhập ở Quản trị › Hệ thống › Bảo mật hệ thống.
- nginx: chỉ mở `/api`, `/api/exec`, `/api/suc-khoe`; giới hạn 20 yêu cầu/giây/IP (lấy IP thật qua Cloudflare); `/tools/`, `.git` bị chặn. Đường `/noi-bo/*` chỉ gọi được trong máy (cổng 3100, có khoá).
- Dịch vụ chạy user `hckapi` (không phải root), PostgreSQL đăng nhập kiểu peer (không mật khẩu).
