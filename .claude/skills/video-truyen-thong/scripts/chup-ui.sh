#!/bin/sh
# Chụp 1 phần giao diện web thành ảnh PNG nền trong suốt, độ nét x2 (để lồng vào cảnh video).
# Dùng: sh chup-ui.sh <trang-thu.html> '<CSS selector>' <rộng cửa sổ> <ảnh ra.png> [trễ ms, mặc định 2200]
#   trang-thu.html: bản sao 1 trang web có <base href> trỏ vào thư mục web + <script> giả lập dữ liệu (xem SKILL.md)
set -e
TRANG="$1"; SEL="$2"; RONG="$3"; RA="$4"; TRE="${5:-2200}"
CH="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
TMP="$(dirname "$RA")"; JS="$TMP/_tach.js"; CAP="$TMP/_cap.html"
cat > "$JS" <<JS
setTimeout(() => { const el = document.querySelector('$SEL'); if (!el) { document.title = 'KHONG_THAY'; return; }
  const w = el.getBoundingClientRect().width; const c = el.cloneNode(true); document.body.innerHTML = '';
  document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent'; document.body.style.margin = '0';
  c.style.margin = '0'; c.style.width = w + 'px'; c.style.position = 'static'; c.style.transform = 'none'; c.style.maxHeight = 'none'; c.style.overflow = 'visible';
  document.body.appendChild(c);
  const p = document.createElement('pre'); p.id = 'kt'; p.style.cssText = 'position:absolute;left:-9999px';
  p.textContent = Math.ceil(w) + 'x' + Math.ceil(c.getBoundingClientRect().height); document.body.appendChild(p); }, $TRE);
JS
T="$JS" perl -pe 'BEGIN{local $/; open F, "<:raw", $ENV{T}; $s=<F>} s#(</body>)#<script>$s</script>$1#' "$TRANG" > "$CAP"
B=$(( TRE + 1500 ))
KT=$("$CH" --headless=new --disable-gpu --allow-file-access-from-files --virtual-time-budget=$B --window-size=$RONG,2400 --dump-dom "file:///$(cygpath -m "$CAP")" 2>/dev/null | grep -o '<pre id="kt"[^>]*>[0-9x]*' | grep -o '[0-9]*x[0-9]*$')
[ -z "$KT" ] && { echo "Không thấy phần tử $SEL"; exit 1; }
W=${KT%x*}; H=${KT#*x}; [ "$W" -lt 500 ] && WW=500 || WW=$W
"$CH" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files --force-device-scale-factor=2 --default-background-color=00000000 \
  --virtual-time-budget=$B --window-size=$WW,$H --screenshot="$(cygpath -w "$RA")" "file:///$(cygpath -m "$CAP")" >/dev/null 2>&1
echo "$RA ($KT)"
