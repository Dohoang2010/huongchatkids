#!/bin/sh
# Chặn commit nếu phần thêm mới có dạng khoá bí mật (repo công khai – ai cũng đọc được lịch sử).
# Cài 1 lần: cp tools/kiem-bi-mat.sh .git/hooks/pre-commit
# Khoá bí mật để ở Script Properties của Apps Script (hoặc Quản trị → Bảo mật hệ thống), không ghi vào file.
MAU='[0-9]{9,}:[A-Za-z0-9_-]{25,}|hck-admin-[0-9]|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AIza[0-9A-Za-z_-]{35}|-----BEGIN [A-Z ]*PRIVATE KEY|xox[baprs]-[A-Za-z0-9-]{10,}|sk-[A-Za-z0-9_-]{30,}'
LOI=$(git diff --cached -U0 --no-color -- . ':(exclude)tools/kiem-bi-mat.sh' | grep -E '^\+[^+]' | grep -nE "$MAU")
if [ -n "$LOI" ]; then
  echo "⛔ CHẶN COMMIT: phát hiện thứ trông như khoá bí mật trong thay đổi:"
  echo "$LOI" | sed -E "s/($MAU)/[KHOÁ BÍ MẬT]/g" | cut -c1-160
  echo "→ Bỏ khoá khỏi file, cất trong Script Properties rồi commit lại."
  exit 1
fi
exit 0
