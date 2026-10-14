# Lịch làm việc – máy chủ trên VPS (quanlylichtrinh.site)

App chính: **https://quanlylichtrinh.site** · Demo: https://quanlylichtrinh.site/?demo
(huongchatkids.vn/lich-trinh/ tự chuyển sang tên miền này, trừ khi mở `?demo`.)

| Phần | Ở đâu trên VPS |
|---|---|
| Giao diện (thư mục `lich-trinh/`) | `/opt/lichtrinh/public` (nginx phát trực tiếp) |
| Máy chủ Node (`server.js`) | `/opt/lichtrinh`, dịch vụ `lichtrinh` (systemd), cổng 127.0.0.1:3200 |
| Cấu hình + khoá thông báo VAPID | `/etc/lichtrinh.env` (không đưa lên git) |
| Dữ liệu | PostgreSQL, database `lichtrinh` |
| Ảnh / video / tệp gửi trong chat | `/var/lib/lichtrinh/tep/` (systemd StateDirectory), tối đa 150 MB mỗi tệp |
| nginx | `/etc/nginx/sites-available/quanlylichtrinh.site` (+ HTTPS certbot) |

SSH: thêm vào `~/.ssh/config` alias `quanlylichtrinh` (HostName 103.216.116.57, Port 24700, User root, IdentityFile khoá riêng).

- **Cập nhật** sau khi sửa code: `sh tools/lich-trinh-vps/deploy.sh`
- **Tài khoản:** 1 admin (chỉ quản lý thành viên, không chat) + các thành viên do admin tạo trong app (tab Thành viên). Quên mật khẩu admin:
  `ssh quanlylichtrinh 'cd /opt/lichtrinh && set -a && . /etc/lichtrinh.env && set +a && sudo -E -u lichtrinh node server.js tao-admin admin MATKHAUMOI && systemctl restart lichtrinh'`
- **Sao lưu trước khi đổi cấu trúc dữ liệu:** bản sao lưu nằm ở `/root/sao-luu/` trên VPS.
- **Cài lần đầu trên VPS mới**: `ssh quanlylichtrinh 'bash -s' < tools/lich-trinh-vps/cai-dat-vps.sh`, chép `nginx.conf` vào sites-available, `certbot --nginx -d quanlylichtrinh.site -d www.quanlylichtrinh.site`, rồi chạy `deploy.sh`.
- **Xem nhật ký**: `ssh quanlylichtrinh journalctl -u lichtrinh -n 100`
- **Sao lưu dữ liệu**: `ssh quanlylichtrinh 'sudo -u postgres pg_dump lichtrinh' > lichtrinh-$(date +%F).sql`
- **Sao lưu tệp chat**: `ssh quanlylichtrinh 'tar -C /var/lib/lichtrinh -czf - tep' > tep-chat-$(date +%F).tgz` · xem dung lượng: `ssh quanlylichtrinh du -sh /var/lib/lichtrinh/tep`
- nginx: `location = /api/tai-len` cho phép thân yêu cầu 160 MB (gửi tệp); các location khác giữ 256 KB.

Máy chủ VPS này còn chạy hcfamily.site, saigonsk.com, giadinhhanhphuc.com – đừng đụng tới cấu hình của các web đó.
