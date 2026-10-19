#!/bin/sh
# Ngày 1 hằng tháng (hck-sao-luu-thang.timer): gửi 1 bản sao lưu CÓ KHOÁ về Gmail chủ shop – phòng khi VPS hỏng hẳn.
# Gói: bản sao lưu CSDL mới nhất + cấu hình (env) + ảnh chat (nếu tổng < 18MB), mã hoá AES-256 bằng gpg với mật khẩu
# SAO_LUU_MAT_KHAU trong /etc/hck-api/env (chủ shop tự đặt bằng cai-mat-khau-sao-luu.ps1). Chưa có mật khẩu → KHÔNG gửi file.
# Mở file: Gpg4win (Windows) hoặc  gpg -d hck-sao-luu-….tar.gz.gpg > sao-luu.tar.gz  → nhập mật khẩu.
set -eu
GOC=/var/backups/hck; RA=/var/lib/hck-api/gui-thang; ENV=/etc/hck-api/env
K=$(sed -n 's/^NOI_BO_KHOA=//p' "$ENV" | head -1)
bao() { curl -s -X POST -H "x-noi-bo: $K" "http://127.0.0.1:3100/noi-bo/gui-sao-luu?$1"; echo; }
MK=$(sed -n 's/^SAO_LUU_MAT_KHAU=//p' "$ENV" | head -1)
if [ -z "$MK" ]; then logger -t hck-sao-luu "Tháng: chưa đặt mật khẩu khoá – không gửi file"; bao "loi=chua-mat-khau"; exit 0; fi

sh /opt/hck-api/he-thong/sao-luu.sh >/dev/null   # bản mới nhất ngay lúc gửi
DB=$(ls -1t "$GOC"/csdl/hck-*.dump | head -1); CH=$(ls -1t "$GOC"/cau-hinh/env-* | head -1)
THANG=$(date +%Y%m); TAM=$(mktemp -d /run/hck-sl.XXXXXX); trap 'rm -rf "$TAM"' EXIT
mkdir -p "$TAM/hck-sao-luu-$THANG"
cp "$DB" "$CH" "$TAM/hck-sao-luu-$THANG/"
CHAT_KB=$(du -sk "$GOC/chat-tep" | cut -f1)
if [ "$CHAT_KB" -lt 18000 ]; then cp -a "$GOC/chat-tep" "$TAM/hck-sao-luu-$THANG/"; GHI="kèm ảnh chat"; else GHI="ảnh chat quá lớn (${CHAT_KB}KB) – chỉ còn trên VPS"; fi
cat > "$TAM/hck-sao-luu-$THANG/DOC-TRUOC.txt" <<TXT
Bản sao lưu Hương Chất Kids tháng $THANG (tạo $(date '+%d/%m/%Y %H:%M')).
- hck-*.dump: toàn bộ cơ sở dữ liệu (khôi phục: xem tools/may-chu-vps/README.md, mục "Sao lưu & khôi phục")
- env-*: cấu hình + khoá máy chủ (giữ kín)
- chat-tep/: ảnh / video khách gửi trong chat
TXT
tar -czf "$TAM/goi.tar.gz" -C "$TAM" "hck-sao-luu-$THANG"
mkdir -p "$RA"; chown hckapi:hckapi "$RA"; chmod 700 "$RA"
TEP="hck-sao-luu-$THANG.tar.gz.gpg"
printf '%s' "$MK" | gpg --batch --yes --quiet --pinentry-mode loopback --passphrase-fd 0 --symmetric --cipher-algo AES256 -o "$RA/$TEP" "$TAM/goi.tar.gz"
chown hckapi:hckapi "$RA/$TEP"
KQ=$(bao "tep=$TEP&ghi=$(printf '%s' "$GHI" | od -An -tx1 | tr -d ' \n' | sed 's/../%&/g')")
rm -f "$RA/$TEP"
logger -t hck-sao-luu "Tháng $THANG: $KQ"
echo "$KQ"
