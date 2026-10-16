#!/bin/sh
# Điều khiển Apps Script từ VPS: chuyen bao-tri|tat|https://… · quay-lai · thu-quay-lai
set -a; . /etc/hck-api/env; set +a
exec node /opt/hck-api/cong-cu/apps-script.js "$@"
