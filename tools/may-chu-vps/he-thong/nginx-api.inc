# Đường /api → máy chủ Node (127.0.0.1:3100). Chỉ cho /api, /api/exec, /api/suc-khoe, /api/keo-web ra ngoài.
location ~ ^/api(/exec|/suc-khoe|/keo-web|/loi-js)?/?$ {
  limit_req zone=hck_api burst=60 nodelay;
  client_max_body_size 4m;
  proxy_pass http://127.0.0.1:3100;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_read_timeout 120s;
}
# Khách gửi ảnh / video trong chat (tối đa 25MB, máy chủ Node tự kiểm tra loại tệp)
location = /api/chat-tep {
  limit_req zone=hck_api burst=10 nodelay;
  client_max_body_size 26m;
  proxy_pass http://127.0.0.1:3100;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_read_timeout 120s;
}
location ^~ /chat-tep/ {
  alias /var/lib/hck-api/chat-tep/;
  expires 30d;
  add_header X-Content-Type-Options nosniff always;
  add_header Content-Security-Policy "default-src 'none'; img-src 'self'; media-src 'self'" always;
  location ~ \.(php|html?|js|svg)$ { return 404; }
}
location /api/ { return 404; }
location ^~ /.well-known/acme-challenge/ { root /var/www/acme; default_type text/plain; }
