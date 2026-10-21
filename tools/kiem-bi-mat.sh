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
# Sửa mã máy chủ (tools/apps-script.gs, tools/may-chu-vps/…), js/app.js (giá / quà / voucher) hoặc giao diện ngày lễ → chạy kiểm thử, hỏng thì chặn commit
if git diff --cached --name-only | grep -qE '^tools/(apps-script\.gs|may-chu-vps/(src|kiem-thu)/|kiem-thu/)|^js/(le-hoi|app)\.js'; then
  echo "Đang chạy kiểm thử máy chủ…"
  NHAT_KY=$(mktemp)
  if ! node --test tools/may-chu-vps/kiem-thu/kiem-thu.js tools/may-chu-vps/kiem-thu/chuc-nang.test.js tools/kiem-thu/le-hoi.test.js tools/kiem-thu/gia-gio-hang.test.js tools/may-chu-vps/kiem-thu/luu-github.test.js tools/may-chu-vps/kiem-thu/luu-vps.test.js tools/may-chu-vps/kiem-thu/dang-fb.test.js > "$NHAT_KY" 2>&1; then
    echo "⛔ CHẶN COMMIT: kiểm thử máy chủ hỏng – sửa xong mới commit được:"
    grep -E '^✖|AssertionError|Error:' "$NHAT_KY" | head -20
    rm -f "$NHAT_KY"; exit 1
  fi
  echo "✔ $(grep -E '^ℹ pass' "$NHAT_KY")"; rm -f "$NHAT_KY"
fi
# Sửa mục quản trị (js/admin/m-*.js) → danh mục tải-khi-mở (js/admin/danh-muc.js) phải được sinh lại
if git diff --cached --name-only | grep -qE '^js/admin/|^admin.html'; then
  node tools/kiem-thu/tao-danh-muc-qt.js --kiem || { echo "⛔ CHẶN COMMIT: chạy node tools/kiem-thu/tao-danh-muc-qt.js rồi git add lại"; exit 1; }
fi
exit 0
