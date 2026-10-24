#!/bin/sh
# Gắn khoá SSH CÔNG KHAI (không bí mật) của máy Windows shop sau khi cài lại Win (24/10/2026).
# Chạy trong Console VPS:  sh /var/www/huongchatkids/tools/gk.sh
K='ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEWbj3HemkpZQrBTwQqAFFHWYxzKm9dKP0olpjVXjAcU hck-vps-may-moi-2026-10-24'
mkdir -p /root/.ssh && chmod 700 /root/.ssh
touch /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys
grep -qF "$K" /root/.ssh/authorized_keys || echo "$K" >> /root/.ssh/authorized_keys
restorecon -R /root/.ssh 2>/dev/null
echo DA_GAN_KHOA
