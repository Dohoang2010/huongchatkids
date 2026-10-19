#!/bin/sh
# Ghi mật khẩu khoá bản sao lưu gửi Gmail (SAO_LUU_MAT_KHAU) vào /etc/hck-api/env rồi gửi thử 1 bản ngay.
# Gọi từ cai-mat-khau-sao-luu.ps1 (máy shop): dòng 1 stdin = mật khẩu (không lộ trên dòng lệnh, không ghi vào GitHub).
set -eu
read -r MK
MK=$(printf '%s' "$MK" | tr -d '\r')
[ ${#MK} -ge 10 ] || { echo '{"ok":false,"msg":"Mật khẩu cần ít nhất 10 ký tự"}'; exit 1; }
case "$MK" in *[!A-Za-z0-9@#%+=_.,:-]*) echo '{"ok":false,"msg":"Mật khẩu chỉ dùng chữ không dấu, số và ký tự @ # % + = _ . , : -"}'; exit 1;; esac
f=/etc/hck-api/env
cp "$f" "$f.truoc-mk-sao-luu"
sed -i '/^SAO_LUU_MAT_KHAU=/d' "$f"
printf 'SAO_LUU_MAT_KHAU=%s\n' "$MK" >> "$f"
chmod 600 "$f"
sh /opt/hck-api/he-thong/sao-luu-thang.sh
