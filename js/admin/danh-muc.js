/* TỰ SINH bởi tools/kiem-thu/tao-danh-muc-qt.js – KHÔNG sửa tay. Thêm / sửa js/admin/m-*.js xong thì chạy lại lệnh đó. */
window.ADMIN_DANH_MUC = {
 "tep": {
  "m-dashboard.js": {
   "v": "983716ca",
   "can": [],
   "ngay": true
  },
  "m-products.js": {
   "v": "45ad2149",
   "can": [],
   "ngay": false
  },
  "m-orders.js": {
   "v": "7e9df0d9",
   "can": [],
   "ngay": false
  },
  "m-customers.js": {
   "v": "a4631a28",
   "can": [
    "m-bao-mat.js"
   ],
   "ngay": false
  },
  "m-chat.js": {
   "v": "2efc8e04",
   "can": [],
   "ngay": false
  },
  "m-danh-gia.js": {
   "v": "aff7bf40",
   "can": [],
   "ngay": false
  },
  "m-thong-ke-ban.js": {
   "v": "14a133a7",
   "can": [],
   "ngay": false
  },
  "m-facebook.js": {
   "v": "dede1beb",
   "can": [],
   "ngay": false
  },
  "m-gioi-thieu.js": {
   "v": "ed662d6c",
   "can": [],
   "ngay": false
  },
  "m-bao-mat.js": {
   "v": "59c58244",
   "can": [],
   "ngay": false
  },
  "m-bao-mat-ht.js": {
   "v": "0f44b532",
   "can": [],
   "ngay": false
  },
  "m-doi-tac-hh.js": {
   "v": "8cecb1cb",
   "can": [],
   "ngay": false
  },
  "m-doi-tac.js": {
   "v": "468a01be",
   "can": [
    "m-doi-tac-hh.js"
   ],
   "ngay": false
  },
  "m-marketing.js": {
   "v": "e5b63581",
   "can": [
    "m-qua-tang.js"
   ],
   "ngay": false
  },
  "m-diem-danh.js": {
   "v": "9839c146",
   "can": [],
   "ngay": false
  },
  "m-qua-tang.js": {
   "v": "79ec21bb",
   "can": [],
   "ngay": false
  },
  "m-voucher.js": {
   "v": "51c7d5e0",
   "can": [
    "m-qua-tang.js"
   ],
   "ngay": false
  },
  "m-menu.js": {
   "v": "72186565",
   "can": [],
   "ngay": false
  },
  "m-content.js": {
   "v": "3295c295",
   "can": [],
   "ngay": false
  },
  "m-seo.js": {
   "v": "8581d4f1",
   "can": [],
   "ngay": false
  },
  "m-website.js": {
   "v": "9d239ddf",
   "can": [],
   "ngay": false
  },
  "m-theme.js": {
   "v": "e0eeebbf",
   "can": [],
   "ngay": false
  },
  "m-le-hoi.js": {
   "v": "bea4cd05",
   "can": [],
   "ngay": false
  },
  "m-versions.js": {
   "v": "7364cba9",
   "can": [],
   "ngay": false
  },
  "m-users.js": {
   "v": "3adf5a30",
   "can": [],
   "ngay": false
  },
  "m-system.js": {
   "v": "95967bbf",
   "can": [
    "m-bao-mat.js"
   ],
   "ngay": false
  }
 },
 "muc": [
  {
   "tep": "m-dashboard.js",
   "route": "/tong-quan",
   "ten": "Tổng quan",
   "icon": "🏠",
   "nhom": "",
   "quyen": "dashboard.view",
   "mo": "Doanh thu, đơn hàng, khách hàng và tình trạng kho"
  },
  {
   "tep": "m-products.js",
   "route": "/san-pham",
   "ten": "Sản phẩm",
   "icon": "📦",
   "nhom": "ban-hang",
   "quyen": "product.view",
   "mo": "Thêm, sửa, ẩn/hiện sản phẩm và nhãn"
  },
  {
   "tep": "m-orders.js",
   "route": "/don-hang",
   "ten": "Đơn hàng",
   "icon": "🧾",
   "nhom": "ban-hang",
   "quyen": "order.view",
   "mo": "Đơn khách đặt trên website"
  },
  {
   "tep": "m-customers.js",
   "route": "/thanh-vien",
   "ten": "Thành viên",
   "icon": "👤",
   "nhom": "khach-hang",
   "quyen": "customer.view",
   "mo": "Khách hàng, hạng và lịch sử mua"
  },
  {
   "tep": "m-chat.js",
   "route": "/chat",
   "ten": "Chat với khách",
   "icon": "💬",
   "nhom": "khach-hang",
   "quyen": "customer.view",
   "mo": "Trả lời khách nhắn trong khung chat trên website"
  },
  {
   "tep": "m-danh-gia.js",
   "route": "/danh-gia",
   "ten": "Đánh giá sản phẩm",
   "icon": "⭐",
   "nhom": "ban-hang",
   "quyen": "product.view",
   "mo": "Duyệt, ẩn và trả lời đánh giá khách viết trên website"
  },
  {
   "tep": "m-thong-ke-ban.js",
   "route": "/thong-ke-ban",
   "ten": "Thống kê bán hàng",
   "icon": "📈",
   "nhom": "ban-hang",
   "quyen": "dashboard.view",
   "mo": "Khách đến từ đâu, chương trình / bài đăng nào ra đơn, phễu mua hàng"
  },
  {
   "tep": "m-facebook.js",
   "route": "/facebook",
   "ten": "Lịch đăng Facebook",
   "icon": "📣",
   "nhom": "ban-hang",
   "quyen": "content.update",
   "mo": "Soạn bài, chủ shop duyệt – máy chủ tự đăng lên page đúng giờ (kèm ảnh, bình luận, link theo dõi)"
  },
  {
   "tep": "m-gioi-thieu.js",
   "route": "/gioi-thieu",
   "ten": "Giới thiệu & điểm",
   "icon": "🤝",
   "nhom": "khach-hang",
   "quyen": "referral.view",
   "mo": "Giới thiệu bạn bè, ví điểm, cộng/trừ điểm"
  },
  {
   "tep": "m-bao-mat-ht.js",
   "route": "/bao-mat-he-thong",
   "ten": "Bảo mật hệ thống",
   "icon": "🛡️",
   "nhom": "he-thong",
   "quyen": "*",
   "mo": "Khoá bí mật, đăng nhập 2 lớp, cảnh báo"
  },
  {
   "tep": "m-doi-tac.js",
   "route": "/doi-tac",
   "ten": "Đối tác (affiliate)",
   "icon": "🤝",
   "nhom": "ban-hang",
   "quyen": "affiliate.view",
   "mo": "Đối tác bán hàng, đơn theo nguồn, hoa hồng & thuế"
  },
  {
   "tep": "m-marketing.js",
   "route": "/flash-sale",
   "ten": "Flash Sale",
   "icon": "⚡",
   "nhom": "ban-hang",
   "quyen": "flashsale.view",
   "preview": true,
   "mo": "Chọn sản phẩm chạy flash sale trang chủ"
  },
  {
   "tep": "m-marketing.js",
   "route": "/combo",
   "ten": "Combo",
   "icon": "🎁",
   "nhom": "ban-hang",
   "quyen": "combo.view",
   "preview": true,
   "mo": "Gói nhiều sản phẩm bán kèm"
  },
  {
   "tep": "m-marketing.js",
   "route": "/qua-tang",
   "ten": "Quà tặng & hạng",
   "icon": "🏅",
   "nhom": "ban-hang",
   "quyen": "product.view",
   "mo": "Chương trình Mua để nhận quà và hạng khách hàng"
  },
  {
   "tep": "m-diem-danh.js",
   "route": "/diem-danh",
   "ten": "Điểm danh & Voucher",
   "icon": "📅",
   "nhom": "khach-hang",
   "quyen": "loyalty.view",
   "mo": "Điểm danh hằng ngày, voucher ngày đôi & chuỗi ngày – thống kê, cấu hình phần thưởng, lịch sử"
  },
  {
   "tep": "m-voucher.js",
   "route": "/ma-giam-gia",
   "ten": "Mã giảm giá",
   "icon": "🎟️",
   "nhom": "ban-hang",
   "quyen": "product.view",
   "preview": false,
   "mo": "Voucher toàn shop, voucher sản phẩm, voucher riêng tư"
  },
  {
   "tep": "m-menu.js",
   "route": "/menu",
   "ten": "Menu",
   "icon": "🧭",
   "nhom": "website",
   "quyen": "content.view",
   "preview": true,
   "mo": "Thanh menu chính của website"
  },
  {
   "tep": "m-content.js",
   "route": "/noi-dung",
   "ten": "Nội dung",
   "icon": "📝",
   "nhom": "website",
   "quyen": "content.view",
   "mo": "Bài viết Cẩm nang chăm con"
  },
  {
   "tep": "m-seo.js",
   "route": "/seo",
   "ten": "SEO",
   "icon": "🔍",
   "nhom": "website",
   "quyen": "seo.view",
   "mo": "Tiêu đề và mô tả hiện trên Google"
  },
  {
   "tep": "m-website.js",
   "route": "/banner",
   "ten": "Banner",
   "icon": "🖼️",
   "nhom": "website",
   "quyen": "banner.view",
   "preview": true,
   "mo": "Khung lớn ở đầu trang chủ"
  },
  {
   "tep": "m-theme.js",
   "route": "/giao-dien",
   "ten": "Trình chỉnh sửa giao diện",
   "icon": "🎨",
   "nhom": "website",
   "quyen": "theme.view",
   "preview": true,
   "mo": "Bố cục, màu sắc, phông chữ – đổi là thấy ngay"
  },
  {
   "tep": "m-le-hoi.js",
   "route": "/le-hoi",
   "ten": "Giao diện ngày lễ",
   "icon": "🎉",
   "nhom": "website",
   "quyen": "theme.view",
   "preview": true,
   "mo": "Tự đổi giao diện theo Tết, 8/3, 20/10, Trung Thu, Giáng sinh…"
  },
  {
   "tep": "m-versions.js",
   "route": "/phien-ban",
   "ten": "Phiên bản & xem thử",
   "icon": "🕘",
   "nhom": "he-thong",
   "quyen": "setting.view",
   "mo": "Lịch sử thay đổi, so sánh, khôi phục, link xem thử"
  },
  {
   "tep": "m-users.js",
   "route": "/nguoi-dung",
   "ten": "Người dùng",
   "icon": "🧑‍💼",
   "nhom": "he-thong",
   "quyen": "setting.view",
   "mo": "Tài khoản quản trị cho từng người"
  },
  {
   "tep": "m-users.js",
   "route": "/phan-quyen",
   "ten": "Vai trò & phân quyền",
   "icon": "🛡️",
   "nhom": "he-thong",
   "quyen": "setting.view",
   "mo": "Ai được làm gì"
  },
  {
   "tep": "m-system.js",
   "route": "/nhat-ky",
   "ten": "Nhật ký hoạt động",
   "icon": "📜",
   "nhom": "he-thong",
   "quyen": "setting.view",
   "mo": "Thao tác trên đơn hàng và khách hàng"
  },
  {
   "tep": "m-system.js",
   "route": "/cau-hinh",
   "ten": "Cấu hình",
   "icon": "⚙️",
   "nhom": "cau-hinh",
   "quyen": "setting.view",
   "mo": "Kết nối, thông tin shop, bảo mật"
  }
 ]
};
