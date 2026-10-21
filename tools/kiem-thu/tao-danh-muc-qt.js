'use strict';
/* Sinh js/admin/danh-muc.js – danh mục các mục trang quản trị (tên, biểu tượng, nhóm, quyền, tệp, phiên bản) để menu hiện đủ ngay
   mà mã từng mục chỉ tải khi mở mục đó (core.js › taiMuc). Chạy lại mỗi khi thêm / sửa tệp js/admin/m-*.js:
     node tools/kiem-thu/tao-danh-muc-qt.js          (ghi tệp)
     node tools/kiem-thu/tao-danh-muc-qt.js --kiem   (chỉ kiểm tra tệp đã cập nhật chưa – bài kiểm thử dùng) */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const GOC = path.join(__dirname, '..', '..');
const THU_MUC = path.join(GOC, 'js', 'admin');
/* Mục dùng hàm của mục khác → tải mục kia trước */
const CAN = { 'm-customers.js': ['m-bao-mat.js'], 'm-system.js': ['m-bao-mat.js'], 'm-doi-tac.js': ['m-doi-tac-hh.js'], 'm-marketing.js': ['m-qua-tang.js'], 'm-voucher.js': ['m-qua-tang.js'] };
/* Thứ tự tệp = thứ tự mục trên menu bên trái (thêm tệp mới vào đúng chỗ muốn hiện; tệp chưa có trong danh sách xếp cuối) */
const THU_TU = ['m-dashboard.js', 'm-products.js', 'm-orders.js', 'm-customers.js', 'm-chat.js', 'm-danh-gia.js', 'm-thong-ke-ban.js', 'm-facebook.js', 'm-gioi-thieu.js', 'm-bao-mat.js', 'm-bao-mat-ht.js',
  'm-doi-tac-hh.js', 'm-doi-tac.js', 'm-marketing.js', 'm-diem-danh.js', 'm-qua-tang.js', 'm-voucher.js', 'm-menu.js', 'm-content.js', 'm-seo.js', 'm-website.js', 'm-theme.js', 'm-le-hoi.js',
  'm-versions.js', 'm-users.js', 'm-system.js'];
/* Tải ngay khi mở trang quản trị (trang đầu) */
const NGAY = ['m-dashboard.js'];

function chupDangKy(tep) {
  const ds = [], ham = function () { return ham; };
  const gia = new Proxy(ham, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'then' ? undefined : gia), apply: () => gia, construct: () => gia });
  const A = new Proxy({}, { get: (t, k) => (k === 'dangKy' ? (m) => ds.push(m) : k === 'D' ? {} : gia) });
  const hop = { window: null, ADMIN: A, document: gia, location: { hash: '', pathname: '/admin.html', search: '' }, localStorage: gia, sessionStorage: gia, console: { log() {}, warn() {} },
    setTimeout: () => 0, setInterval: () => 0, clearTimeout() {}, SITE: {}, PRODUCTS: [], CATEGORIES: [], BRANDS: [], POSTS: [], NAV: [], URL, URLSearchParams, Date, Math, JSON, Intl, Set, Map };
  hop.window = new Proxy(hop, { get: (t, k) => (k in t ? t[k] : gia) });
  vm.runInNewContext(fs.readFileSync(path.join(THU_MUC, tep), 'utf8'), hop, { filename: tep, timeout: 2000 });
  return ds;
}
function tao() {
  /* thứ tự = thứ tự trong admin.html (menu bên trái hiện theo thứ tự này); tệp mới chưa có trong admin.html xếp cuối */
  const thuTu = THU_TU;
  const vt = (f) => (thuTu.includes(f) ? thuTu.indexOf(f) : 999);
  const tep = fs.readdirSync(THU_MUC).filter((f) => /^m-.*\.js$/.test(f)).sort((a, b) => vt(a) - vt(b) || a.localeCompare(b));
  const muc = [], tepDs = {};
  for (const f of tep) {
    const ma = fs.readFileSync(path.join(THU_MUC, f), 'utf8').replace(/\r\n/g, '\n');
    tepDs[f] = { v: crypto.createHash('sha1').update(ma).digest('hex').slice(0, 8), can: CAN[f] || [], ngay: NGAY.includes(f) };
    chupDangKy(f).forEach((m) => {
      const o = { tep: f }; for (const k of Object.keys(m)) if (['string', 'number', 'boolean'].includes(typeof m[k])) o[k] = m[k];
      if (!o.route) throw new Error(f + ': mục không có route'); muc.push(o);
    });
  }
  return '/* TỰ SINH bởi tools/kiem-thu/tao-danh-muc-qt.js – KHÔNG sửa tay. Thêm / sửa js/admin/m-*.js xong thì chạy lại lệnh đó. */\n' +
    'window.ADMIN_DANH_MUC = ' + JSON.stringify({ tep: tepDs, muc }, null, 1) + ';\n';
}
const ra = path.join(THU_MUC, 'danh-muc.js'), moi = tao();
/* admin.html: số phiên bản (?v=) của danh-muc.js và các mục tải ngay = mã băm nội dung → sửa xong là trình duyệt lấy bản mới */
const bam = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const ADMIN = path.join(GOC, 'admin.html');
let html = fs.readFileSync(ADMIN, 'utf8');
const htmlMoi = html.replace(/(js\/admin\/danh-muc\.js\?v=)\w+/, '$1' + bam(moi))
  .replace(/(js\/admin\/(m-[\w-]+\.js)\?v=)\w+/g, (m, a, f) => (NGAY.includes(f) ? a + bam(fs.readFileSync(path.join(THU_MUC, f), 'utf8').replace(/\r\n/g, '\n')) : m));
if (process.argv.includes('--kiem')) {
  const cu = fs.existsSync(ra) ? fs.readFileSync(ra, 'utf8').replace(/\r\n/g, '\n') : '';
  if (cu !== moi || html.replace(/\r\n/g, '\n') !== htmlMoi.replace(/\r\n/g, '\n')) { console.error('js/admin/danh-muc.js / admin.html chưa cập nhật – chạy: node tools/kiem-thu/tao-danh-muc-qt.js'); process.exit(1); }
  console.log('danh-muc.js đã cập nhật');
} else { fs.writeFileSync(ra, moi); if (html !== htmlMoi) fs.writeFileSync(ADMIN, htmlMoi); console.log('Đã ghi js/admin/danh-muc.js + phiên bản trong admin.html'); }
module.exports = { tao };
