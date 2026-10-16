#!/bin/sh
# NGÀY ĐỔI – phần trên VPS (chỉ chạy khi chủ shop ra lệnh "chuyển sang vps"). Chạy bằng root trên VPS.
#   sh /opt/hck-api/cong-cu/chuyen-sang-vps.sh
# Sau đó (ngoài VPS): js/data.js endpoint → https://huongchatkids.vn/api, DNS Cloudflare @/www → A 103.77.242.192, cấp chứng chỉ tên miền.
set -e
DICH="${1:-https://103-77-242-192.sslip.io/api}"   # địa chỉ này chạy ngay, không phụ thuộc DNS
CC=/opt/hck-api/cong-cu
set -a; . /etc/hck-api/env; set +a
echo "1/5 Apps Script tạm bảo trì (không ai ghi thêm vào Sheets)…"
sh $CC/apps-script.sh chuyen bao-tri
sleep 5
echo "2/5 Chép dữ liệu lần cuối…"
curl -sf -X POST -H "x-noi-bo: $NOI_BO_KHOA" http://127.0.0.1:3100/noi-bo/nhap >/dev/null
echo "3/5 Đối chiếu mã băm từng trang…"
if ! sh $CC/doi-chieu-bam.sh; then
  echo "LỆCH – DỪNG, trả Apps Script về như cũ."; sh $CC/apps-script.sh chuyen tat; exit 2
fi
echo "4/5 Bật chế độ chính trên VPS…"
sed -i 's/^CHE_DO=.*/CHE_DO=chinh/' /etc/hck-api/env
systemctl restart hck-api; sleep 4; curl -sf http://127.0.0.1:3100/api/suc-khoe; echo
echo "5/5 Apps Script chuyển tiếp mọi lệnh sang $DICH (lịch nền Apps Script tự dừng)…"
sh $CC/apps-script.sh chuyen "$DICH"
echo "XONG phần VPS. Quay lại: xem README mục QUAY LẠI APPS SCRIPT."
