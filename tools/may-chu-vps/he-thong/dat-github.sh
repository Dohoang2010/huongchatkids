#!/bin/sh
# Ghi mã GitHub (fine-grained token, quyền Contents: Read and write trên repo web) vào /etc/hck-api/env để trang quản trị LƯU QUA MÁY CHỦ.
# Gọi từ cai-github.ps1 (máy shop): dòng 1 stdin = mã (không lộ trên dòng lệnh, không ghi vào GitHub).
set -eu
read -r T
T=$(printf '%s' "$T" | tr -d '\r ')
case "$T" in github_pat_*|ghp_*) ;; *) echo '{"ok":false,"msg":"Mã GitHub phải bắt đầu bằng github_pat_ hoặc ghp_"}'; exit 1;; esac
# Kiểm tra mã ghi được vào repo trước khi lưu
QUYEN=$(curl -s -H "Authorization: Bearer $T" -H "Accept: application/vnd.github+json" https://api.github.com/repos/Dohoang2010/huongchatkids | grep -o '"push": *true' || true)
[ -n "$QUYEN" ] || { echo '{"ok":false,"msg":"Mã chưa có quyền ghi (Contents: Read and write) vào repo Dohoang2010/huongchatkids"}'; exit 1; }
f=/etc/hck-api/env
cp "$f" "$f.truoc-github"
sed -i '/^GITHUB_TOKEN=/d' "$f"
printf 'GITHUB_TOKEN=%s\n' "$T" >> "$f"
chmod 600 "$f"
systemctl restart hck-api
i=0; until curl -s -o /dev/null http://127.0.0.1:3100/api/suc-khoe; do i=$((i+1)); [ $i -gt 30 ] && break; sleep 1; done
echo '{"ok":true}'
