// Bản chính chạy ở https://quanlylichtrinh.site – máy chủ riêng trên VPS, đường dẫn /api (tools/lich-trinh-vps/).
// Bản trên huongchatkids.vn/lich-trinh/ chỉ để xem demo (?demo); mở không có ?demo thì chuyển sang bản chính.
window.LICH_API = '/api';
if (/(^|\.)huongchatkids\.vn$/.test(location.hostname) && !/[?&]demo\b/.test(location.search)) {
  location.replace('https://quanlylichtrinh.site/' + location.hash);
}
