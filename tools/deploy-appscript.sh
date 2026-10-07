#!/bin/sh
# Đưa Apps Script của shop lên Google và cập nhật bản deploy web app (giữ nguyên địa chỉ /exec).
# Bản gốc để sửa: tools/apps-script-CUA-SHOP.gs (không lên git). Thư mục clasp: tools/appscript-live/ (không lên git).
# Cần: Node + clasp (npm i -g @google/clasp) và đã chạy "clasp.cmd login" một lần trên máy.
# Dùng: sh tools/deploy-appscript.sh "mô tả thay đổi"
set -e
cd "$(dirname "$0")"
GOC=apps-script-CUA-SHOP.gs
DIR=appscript-live
FILE="$DIR/Mã.js"
DEPLOY_ID=AKfycbzgqygxD6zYswgL8HtoBcvWvYRTQjjejhpt7H2Sqz9LcrzHVk0zt4iKf6_7JerNSUgG
CLASP="${APPDATA:+$APPDATA/npm/}clasp.cmd"; command -v "$CLASP" >/dev/null 2>&1 || CLASP=clasp
MOTA="${1:-Cập nhật từ máy}"

cd "$DIR"
# 1. Lấy bản đang chạy trên Google, so với bản đã đẩy lần trước: khác nhau = có người sửa trực tiếp trên trình duyệt
"$CLASP" pull >/dev/null
if [ -f .last-pushed.gs ] && ! diff --strip-trailing-cr -q .last-pushed.gs "Mã.js" >/dev/null; then
  cp "Mã.js" "../apps-script-TREN-GOOGLE-$(date +%Y%m%d-%H%M).gs"
  echo "DỪNG: Apps Script trên Google đã bị sửa trực tiếp sau lần đẩy trước."
  echo "Đã lưu bản trên Google vào tools/apps-script-TREN-GOOGLE-*.gs. Gộp thay đổi vào $GOC rồi chạy lại."
  exit 2
fi
# 2. Đẩy bản gốc lên và cập nhật bản deploy
cp "../$GOC" "Mã.js"
"$CLASP" push --force
"$CLASP" deploy --deploymentId "$DEPLOY_ID" --description "$MOTA"
cp "Mã.js" .last-pushed.gs
echo "XONG: đã deploy lên $DEPLOY_ID"
