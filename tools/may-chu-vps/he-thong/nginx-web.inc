# Trang dựng sẵn bởi máy chủ Node (src/trang-web.js): trang chủ, danh mục, cẩm nang, sản phẩm /slug, data.js bản gọn, sitemap.
# Node lỗi / đang khởi động lại → nginx tự trả tệp tĩnh như trước (web vẫn chạy, chỉ thiếu phần dựng sẵn).
gzip_proxied any;
location = / { limit_req zone=hck_api burst=60 nodelay; proxy_pass http://127.0.0.1:3100; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_read_timeout 15s; proxy_intercept_errors on; error_page 500 502 503 504 = @tinh_chu; }
location ~ ^/(?!admin\.html|quan-ly-ton-kho\.html)[a-z0-9-]+\.html$ { limit_req zone=hck_api burst=60 nodelay; proxy_pass http://127.0.0.1:3100; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_read_timeout 15s; proxy_intercept_errors on; error_page 500 502 503 504 = @tinh; }
location = /js/data.js { proxy_pass http://127.0.0.1:3100; proxy_set_header Host $host; proxy_read_timeout 15s; proxy_intercept_errors on; error_page 500 502 503 504 = @tinh_data; }
# JS / CSS bản nén gọn (src/nen-tep.js); Node lỗi → tệp gốc
location ~* ^/(js|css)/.+\.(js|css)$ { proxy_pass http://127.0.0.1:3100; proxy_set_header Host $host; proxy_read_timeout 15s; proxy_intercept_errors on; error_page 404 500 502 503 504 = @tinh_tep; }
location @tinh_tep { expires 4h; try_files $uri =404; }
location = /sitemap.xml { proxy_pass http://127.0.0.1:3100; proxy_set_header Host $host; proxy_intercept_errors on; error_page 500 502 503 504 = @tinh; }
# Ảnh WebP tự tạo (src/anh-webp.js) – tên tệp đổi khi ảnh gốc đổi nên giữ lâu được
location ^~ /webp/ {
  alias /var/lib/hck-api/webp/;
  expires 365d; add_header Cache-Control "public, immutable";
  add_header X-Content-Type-Options nosniff always;
  location ~ \.(?!webp$)[^.]+$ { return 404; }
}
# Đường dẫn không phải tệp có sẵn → Node (link sản phẩm / bài viết có từ khoá)
location / { try_files $uri $uri/ $uri.html @trangsp; }
location @trangsp { limit_req zone=hck_api burst=60 nodelay; proxy_pass http://127.0.0.1:3100; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_read_timeout 15s; proxy_intercept_errors on; error_page 500 502 503 504 = @tinh_sp; }
location @tinh { try_files $uri =404; }
location @tinh_chu { try_files /index.html =404; }
location @tinh_sp { try_files /product.html =404; }
location @tinh_data { add_header Cache-Control "private, no-cache, max-age=0" always; try_files /js/data.js =404; }
