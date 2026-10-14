#!/bin/bash
# Cài app Lịch làm việc lên VPS LẦN ĐẦU (chạy trên VPS bằng root). Chạy lại cũng không sao: bước nào đã làm thì bỏ qua.
# Từ máy Mac:  ssh quanlylichtrinh 'bash -s' < tools/lich-trinh-vps/cai-dat-vps.sh
# Sau đó:      sh tools/lich-trinh-vps/deploy.sh
set -euo pipefail
TEN=lichtrinh; THU_MUC=/opt/$TEN; ENV=/etc/$TEN.env; MIEN=quanlylichtrinh.site

id -u $TEN >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin $TEN
mkdir -p $THU_MUC/public && chmod 755 $THU_MUC $THU_MUC/public

# Database riêng + mật khẩu ngẫu nhiên (chỉ tạo nếu chưa có file cấu hình)
if [ ! -f $ENV ]; then
  MK=$(openssl rand -hex 24)
  sudo -u postgres psql -v ON_ERROR_STOP=1 -q <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$TEN') THEN CREATE ROLE $TEN LOGIN PASSWORD '$MK';
  ELSE ALTER ROLE $TEN PASSWORD '$MK'; END IF;
END \$\$;
SQL
  sudo -u postgres psql -Atc "SELECT 1 FROM pg_database WHERE datname='$TEN'" | grep -q 1 || sudo -u postgres createdb -O $TEN $TEN
  umask 077
  { echo "PORT=3200"; echo "SITE_URL=https://$MIEN"; echo "DATABASE_URL=postgres://$TEN:$MK@127.0.0.1:5432/$TEN"; } > $ENV
  chown root:$TEN $ENV && chmod 640 $ENV
  echo "Đã tạo database và $ENV"
fi
echo "Cài xong phần nền. Tiếp theo chạy deploy.sh từ máy Mac."
