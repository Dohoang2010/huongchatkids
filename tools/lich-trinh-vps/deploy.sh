#!/bin/sh
# Đưa bản mới của app Lịch làm việc lên VPS quanlylichtrinh.site (giao diện + máy chủ).
# Cần alias "quanlylichtrinh" trong ~/.ssh/config. Lần đầu: chạy cai-dat-vps.sh trước.
# Dùng: sh tools/lich-trinh-vps/deploy.sh
set -e
cd "$(dirname "$0")/../.."
H=quanlylichtrinh
COPYFILE_DISABLE=1 tar --no-xattrs -C lich-trinh -czf - --exclude .DS_Store . | ssh $H 'rm -rf /opt/lichtrinh/public.moi && mkdir -p /opt/lichtrinh/public.moi && tar -C /opt/lichtrinh/public.moi -xzf - && chmod -R a+rX /opt/lichtrinh/public.moi && rm -rf /opt/lichtrinh/public.cu && mv /opt/lichtrinh/public /opt/lichtrinh/public.cu && mv /opt/lichtrinh/public.moi /opt/lichtrinh/public'
COPYFILE_DISABLE=1 tar --no-xattrs -C tools/lich-trinh-vps -czf - server.js package.json lichtrinh.service nginx.conf | ssh $H 'tar -C /opt/lichtrinh -xzf - && chmod a+r /opt/lichtrinh/*.js /opt/lichtrinh/*.json'
ssh $H 'set -e
cd /opt/lichtrinh
npm install --omit=dev --no-audit --no-fund --loglevel=error
# Khoá thông báo đẩy (VAPID): tạo 1 lần, cất trong /etc/lichtrinh.env
if ! grep -q "^VAPID_PUBLIC=" /etc/lichtrinh.env; then
  node -e "const k=require(\"web-push\").generateVAPIDKeys();console.log(\"VAPID_PUBLIC=\"+k.publicKey+\"\\nVAPID_PRIVATE=\"+k.privateKey)" >> /etc/lichtrinh.env
fi
cmp -s lichtrinh.service /etc/systemd/system/lichtrinh.service || { cp lichtrinh.service /etc/systemd/system/; systemctl daemon-reload; systemctl enable lichtrinh; }
systemctl restart lichtrinh
sleep 2
systemctl is-active lichtrinh
curl -sf http://127.0.0.1:3200/api'
echo
echo "XONG: https://quanlylichtrinh.site"
