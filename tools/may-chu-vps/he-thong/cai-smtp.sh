#!/bin/sh
# Ghi cấu hình SMTP vào /etc/hck-api/env rồi gửi thử 1 mail tới chủ shop. Gọi từ cai-mail.ps1 (máy shop):
#   dòng 1 stdin = địa chỉ Gmail, dòng 2 = mật khẩu ứng dụng (không lộ trên dòng lệnh, không ghi vào GitHub).
set -e
read -r U; read -r P
U=$(printf '%s' "$U" | tr -d '\r '); P=$(printf '%s' "$P" | tr -d '\r ')
[ -n "$U" ] && [ ${#P} -eq 16 ] || { echo '{"ok":false,"msg":"Thiếu địa chỉ hoặc mật khẩu ứng dụng chưa đủ 16 ký tự"}'; exit 1; }
f=/etc/hck-api/env
cp "$f" "$f.truoc-smtp"
sed -i '/^SMTP_/d' "$f"
printf 'SMTP_HOST=smtp.gmail.com\nSMTP_PORT=465\nSMTP_USER=%s\nSMTP_PASS=%s\nSMTP_FROM=%s\n' "$U" "$P" "$U" >> "$f"
chmod 600 "$f"
systemctl restart hck-api
i=0; until curl -s -o /dev/null http://127.0.0.1:3100/api/suc-khoe; do i=$((i+1)); [ $i -gt 30 ] && break; sleep 1; done
K=$(sed -n 's/^NOI_BO_KHOA=//p' "$f" | head -1)
curl -s -X POST -H "x-noi-bo: $K" http://127.0.0.1:3100/noi-bo/thu-mail
echo
