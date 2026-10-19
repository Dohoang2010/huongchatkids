#!/bin/sh
# Sao lưu dữ liệu Hương Chất Kids trên VPS – chạy tự động 03:00 mỗi đêm (hck-sao-luu.timer), chạy tay: sh sao-luu.sh [--ca-chat]
#  - Cơ sở dữ liệu PostgreSQL "hck" (khách, đơn, điểm, voucher, chat, đánh giá…): mỗi đêm 1 bản nén, giữ 30 ngày
#  - Cấu hình /etc/hck-api/env (có khoá, chỉ root đọc được): mỗi đêm, giữ 30 ngày
#  - Ảnh / video khách gửi trong chat: Chủ nhật hằng tuần chép thêm tệp mới (không xoá tệp cũ)
# Mã nguồn web đã có trên GitHub, ảnh WebP tự tạo lại được → không cần sao lưu.
# Khôi phục: xem tools/may-chu-vps/README.md mục "Sao lưu & khôi phục".
set -eu
GOC=/var/backups/hck
CSDL=$GOC/csdl; CAUHINH=$GOC/cau-hinh; CHAT=$GOC/chat-tep
umask 077
mkdir -p "$CSDL" "$CAUHINH" "$CHAT"; chmod 700 "$GOC"
NGAY=$(date +%Y%m%d-%H%M)
TEP=$CSDL/hck-$NGAY.dump

# 1. Cơ sở dữ liệu (định dạng nén của pg_dump) + kiểm tra đọc lại được trước khi giữ
su - postgres -c 'pg_dump -Fc -Z 9 hck' > "$TEP.tmp"
SO_BANG=$(pg_restore --list "$TEP.tmp" | grep -c ' TABLE DATA ' || true)
[ "$SO_BANG" -gt 0 ] || { rm -f "$TEP.tmp"; logger -t hck-sao-luu "LỖI: bản sao lưu không đọc lại được"; echo "LỖI: bản sao lưu hỏng" >&2; exit 1; }
mv "$TEP.tmp" "$TEP"

# 2. Cấu hình
cp /etc/hck-api/env "$CAUHINH/env-$NGAY"

# 3. Ảnh / video chat (Chủ nhật hoặc khi gọi --ca-chat)
if [ "$(date +%u)" = 7 ] || [ "${1:-}" = "--ca-chat" ]; then
  rsync -a /var/lib/hck-api/chat-tep/ "$CHAT/"
  CHAT_GHI="đã chép ảnh chat ($(du -sh "$CHAT" | cut -f1))"
else CHAT_GHI="ảnh chat: chép vào Chủ nhật"; fi

# 4. Dọn bản cũ hơn 30 ngày (luôn giữ ít nhất 7 bản mới nhất)
ls -1t "$CSDL"/hck-*.dump 2>/dev/null | tail -n +8 | while read -r f; do if [ -n "$(find "$f" -mtime +30)" ]; then rm -f "$f"; fi; done
ls -1t "$CAUHINH"/env-* 2>/dev/null | tail -n +8 | while read -r f; do if [ -n "$(find "$f" -mtime +30)" ]; then rm -f "$f"; fi; done

KQ="OK $NGAY: CSDL $(du -h "$TEP" | cut -f1) ($SO_BANG bảng), $(ls "$CSDL"/hck-*.dump | wc -l) bản đang giữ; $CHAT_GHI"
echo "$KQ" > "$GOC/lan-cuoi.txt"
logger -t hck-sao-luu "$KQ"
echo "$KQ"
