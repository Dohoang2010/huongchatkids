#!/bin/sh
# Đưa máy chủ API lên VPS (chạy từ máy có khoá SSH ~/.ssh/id_ed25519_hck_vps): chép mã Node, cài đặt, khởi động lại.
# Mã Apps Script mà VPS chạy = tools/apps-script.gs trên GitHub (VPS tự kéo mỗi phút và tự nạp lại) – KHÔNG chép bản có khoá.
set -e
cd "$(dirname "$0")"
VPS=root@103.77.242.192
SSH="ssh -i $HOME/.ssh/id_ed25519_hck_vps -o BatchMode=yes"
tar -cf - package.json src he-thong cong-cu | $SSH $VPS 'mkdir -p /opt/hck-api && tar -xf - -C /opt/hck-api'
$SSH $VPS 'sh /opt/hck-api/he-thong/cai-dat.sh'
