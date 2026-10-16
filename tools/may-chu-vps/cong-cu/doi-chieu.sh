#!/bin/sh
# Đối chiếu lệnh đọc Apps Script ↔ VPS (chạy trên VPS bằng root)
set -a; . /etc/hck-api/env; set +a
exec node /opt/hck-api/cong-cu/doi-chieu-api.js "$@"
