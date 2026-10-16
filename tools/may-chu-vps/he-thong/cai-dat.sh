#!/bin/sh
# Cài / cập nhật máy chủ API trên VPS (chạy bằng root, chạy lại nhiều lần không sao). Gọi từ dua-len-vps.sh.
set -e
cd /opt/hck-api
id hckapi >/dev/null 2>&1 || useradd --system --home-dir /opt/hck-api --shell /sbin/nologin hckapi
# Cơ sở dữ liệu: role hckapi đăng nhập kiểu "peer" (theo user hệ thống, không mật khẩu)
su - postgres -c "psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname='hckapi'\"" | grep -q 1 || su - postgres -c "createuser hckapi"
su - postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='hck'\"" | grep -q 1 || su - postgres -c "createdb -O hckapi -E UTF8 hck"
# Thư viện Node
npm install --omit=dev --no-audit --no-fund --loglevel=error
chown -R root:hckapi /opt/hck-api; chmod -R g+rX,o-rwx /opt/hck-api
# Cấu hình mặc định (không ghi đè giá trị đã có)
ENV=/etc/hck-api/env
them() { grep -q "^$1=" $ENV || echo "$1=$2" >> $ENV; }
them CHE_DO song-song
them APPS_SCRIPT_URL https://script.google.com/macros/s/AKfycbzgqygxD6zYswgL8HtoBcvWvYRTQjjejhpt7H2Sqz9LcrzHVk0zt4iKf6_7JerNSUgG/exec
them NHAP_PHUT 15
them LICH_30P dongBoCRMTuDong
chmod 600 $ENV
# Dịch vụ
cp he-thong/hck-api.service /etc/systemd/system/hck-api.service
cp he-thong/hck-keo-web.service he-thong/hck-keo-web.timer he-thong/hck-keo-web-ngay.path /etc/systemd/system/
systemctl daemon-reload
systemctl enable hck-api >/dev/null 2>&1
systemctl enable --now hck-keo-web.timer >/dev/null 2>&1
mkdir -p /run/hck-api && chown hckapi:hckapi /run/hck-api && touch /run/hck-api/keo-web && chown hckapi:hckapi /run/hck-api/keo-web
systemctl enable --now hck-keo-web-ngay.path >/dev/null 2>&1
# nginx
mkdir -p /var/www/acme /etc/nginx/hck
cp he-thong/nginx-gioi-han.conf /etc/nginx/conf.d/00-hck-gioi-han.conf
cp he-thong/nginx-api.inc /etc/nginx/hck/api.inc
cp he-thong/nginx-huongchatkids.conf /etc/nginx/conf.d/huongchatkids.conf
# khối HTTPS chỉ bật khi đã có chứng chỉ
for f in he-thong/nginx-https-*.conf; do
  ten=$(basename "$f" .conf | sed 's/^nginx-https-//'); cert=/etc/letsencrypt/live/$ten/fullchain.pem
  if [ -f "$cert" ]; then cp "$f" /etc/nginx/conf.d/https-$ten.conf; else rm -f /etc/nginx/conf.d/https-$ten.conf; fi
done
nginx -t && systemctl reload nginx
systemctl restart hck-api
sleep 2; systemctl is-active hck-api
