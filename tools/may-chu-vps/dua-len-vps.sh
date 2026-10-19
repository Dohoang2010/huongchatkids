#!/bin/sh
# Đưa máy chủ API lên VPS (chạy từ máy có khoá SSH ~/.ssh/id_ed25519_hck_vps): chép mã Node, cài đặt, khởi động lại.
# Mã Apps Script mà VPS chạy = tools/apps-script.gs trên GitHub (VPS tự kéo mỗi phút và tự nạp lại) – KHÔNG chép bản có khoá.
set -e
cd "$(dirname "$0")"
VPS=root@103.77.242.192
KHOA="$HOME/.ssh/id_ed25519_hck_vps"
tar -cf - package.json src he-thong cong-cu kiem-thu tai-nguyen | ssh -i "$KHOA" -o BatchMode=yes $VPS \
  'mkdir -p /opt/hck-api && tar -xf - -C /opt/hck-api && find /opt/hck-api/he-thong /opt/hck-api/cong-cu -type f -exec sed -i "s/\r$//" {} +'
ssh -i "$KHOA" -o BatchMode=yes $VPS 'sh /opt/hck-api/he-thong/cai-dat.sh'
