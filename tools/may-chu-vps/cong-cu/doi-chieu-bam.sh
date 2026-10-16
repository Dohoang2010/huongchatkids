#!/bin/sh
# So mã băm từng trang tính Google Sheets ↔ VPS
set -a; . /etc/hck-api/env; set +a
curl -s -H "x-noi-bo: $NOI_BO_KHOA" http://127.0.0.1:3100/noi-bo/doi-chieu | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const o=JSON.parse(s);if(!o.ok)return console.log(s);for(const x of o.ds)console.log((x.khop?"KHỚP ":"LỆCH ")+x.ten+" (Sheets "+x.dongSheets+", VPS "+x.dongVps+")");console.log(o.khopHet?"=> KHỚP HẾT":"=> CÓ TRANG LỆCH");process.exitCode=o.khopHet?0:2})'
