#!/bin/sh
# Tình trạng máy chủ API (chạy trên VPS)
set -a; . /etc/hck-api/env; set +a
curl -s -H "x-noi-bo: $NOI_BO_KHOA" http://127.0.0.1:3100/noi-bo/tinh-trang | node -e '
let s = ""; process.stdin.on("data", (d) => (s += d)).on("end", () => {
  const o = JSON.parse(s);
  console.log("Chế độ:", o.cheDo, "| bộ nhớ:", o.boNho, "| SMTP:", o.smtp);
  console.log("Lần chép:", JSON.stringify(o.trangThai.lanNhap));
  console.log("Chạy nền:", JSON.stringify(o.trangThai.lich));
  console.log("Thống kê:", JSON.stringify(o.thongKe));
  o.nhatKyHeThong.slice(-15).forEach((d) => console.log(d));
});'
