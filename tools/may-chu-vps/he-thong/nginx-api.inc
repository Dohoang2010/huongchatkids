# Đường /api → máy chủ Node (127.0.0.1:3100). Chỉ cho /api, /api/exec, /api/suc-khoe ra ngoài.
location ~ ^/api(/exec|/suc-khoe)?/?$ {
  limit_req zone=hck_api burst=60 nodelay;
  client_max_body_size 4m;
  proxy_pass http://127.0.0.1:3100;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_read_timeout 120s;
}
location ^~ /api/ { return 404; }
location ^~ /.well-known/acme-challenge/ { root /var/www/acme; default_type text/plain; }
