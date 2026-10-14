/**
 * LỊCH LÀM VIỆC (Sếp ↔ Trợ lý) – máy chủ chạy miễn phí trên Google Apps Script.
 * App nằm ở https://huongchatkids.vn/lich-trinh/ . File này lo:
 *   1) Lưu lịch trình (sheet "Lịch")      2) Tin nhắn giữa 2 người (sheet "Tin nhắn")
 *   3) Thông báo đẩy về điện thoại (Web Push, tự tạo khoá – không cần Firebase hay dịch vụ trả phí)
 *   4) Nhắc lịch trước giờ hẹn (trình kích hoạt chạy mỗi phút)
 *
 * CÁCH CÀI (làm 1 lần, miễn phí):
 *  1. Vào https://sheets.new → đặt tên "Lịch làm việc".
 *  2. Tiện ích mở rộng (Extensions) → Apps Script. Xoá code mẫu, dán TOÀN BỘ file này vào → bấm Lưu.
 *  3. Triển khai (Deploy) → Tùy chọn triển khai mới (New deployment) → bánh răng chọn "Ứng dụng web":
 *        Thực thi với tên (Execute as): Tôi (Me)
 *        Người có quyền truy cập (Who has access): Bất kỳ ai (Anyone)
 *     → Triển khai → Cho phép truy cập (Authorize) → copy link dạng https://script.google.com/macros/s/..../exec
 *  4. Dán link đó vào lich-trinh/config.js (hoặc gửi cho người làm web).
 *  5. Mở https://huongchatkids.vn/lich-trinh/ → màn "Thiết lập lần đầu": đặt tên + mật khẩu cho Sếp và Trợ lý.
 *     (Bước này tự tạo khoá thông báo và trình nhắc lịch mỗi phút.)
 *
 * ⚠️ MỖI LẦN SỬA CODE: Triển khai → Quản lý các lượt triển khai → bút chì → Phiên bản: Mới → Triển khai.
 * Không có khoá bí mật nào trong file này: khoá thông báo được tạo ngay trên Google và cất ở Script Properties.
 */

/* ===================== CẤU HÌNH ===================== */
var TZ = 'Asia/Ho_Chi_Minh';
var APP_URL = 'https://huongchatkids.vn/lich-trinh/';
var VAPID_SUB = 'https://huongchatkids.vn';   // thông tin liên hệ gửi kèm thông báo (bắt buộc với Apple)
var PHIEN_NGAY = 180;          // giữ đăng nhập bao nhiêu ngày
var SAI_MK_TOI_DA = 8;         // sai mật khẩu quá số lần này thì khoá 15 phút
var GIO_NHAC_CA_NGAY = 8;      // sự kiện cả ngày: nhắc lúc 8 giờ sáng

var SHEET_LICH = 'Lịch';
var SHEET_TIN = 'Tin nhắn';
var SHEET_TB = 'Thiết bị';
var COT_LICH = ['id', 'tieuDe', 'caNgay', 'bd', 'kt', 'diaDiem', 'lich', 'lap', 'lapDen', 'nhac', 'ghiChu', 'taoBoi', 'suaBoi', 'capNhat'];
var COT_TIN = ['id', 'thoiGian', 'nguoiGui', 'noiDung', 'lichId'];
var COT_TB = ['endpoint', 'p256dh', 'auth', 'vaiTro', 'tenMay', 'ngayTao'];
var VAI_TRO = ['sep', 'troly'];
var TEN_VAI = { sep: 'Sếp', troly: 'Trợ lý' };

/* ===================== CỔNG VÀO ===================== */
function doGet(e) {
  return traVe_({ ok: true, ten: 'Lịch làm việc', daCaiDat: !!prop_('user_sep') });
}

function doPost(e) {
  var req;
  try { req = JSON.parse(e.postData.contents || '{}'); } catch (err) { return traVe_({ loi: 'Dữ liệu gửi lên không hợp lệ' }); }
  try {
    var hd = HANH_DONG[req.action];
    if (!hd) return traVe_({ loi: 'Không rõ yêu cầu' });
    if (hd.moCong) return traVe_(hd.fn(req));
    var toi = xacThuc_(req.token);
    if (!toi) return traVe_({ loi: 'Phiên đăng nhập đã hết, vui lòng đăng nhập lại', hetPhien: true });
    return traVe_(hd.fn(req, toi));
  } catch (err) {
    console.error(err && err.stack || err);
    return traVe_({ loi: String(err && err.message || err) });
  }
}

var HANH_DONG = {
  trangThai:      { moCong: true, fn: function () { return trangThai_(); } },
  caiDat:         { moCong: true, fn: caiDat_ },
  dangNhap:       { moCong: true, fn: dangNhap_ },
  dangXuat:       { fn: dangXuat_ },
  tongHop:        { fn: tongHop_ },
  poll:           { fn: poll_ },
  luuLich:        { fn: luuLich_ },
  xoaLich:        { fn: xoaLich_ },
  guiTin:         { fn: guiTin_ },
  daDoc:          { fn: daDoc_ },
  dangKyThongBao: { fn: dangKyThongBao_ },
  huyThongBao:    { fn: huyThongBao_ },
  thuThongBao:    { fn: thuThongBao_ },
  doiTen:         { fn: doiTen_ },
  doiMatKhau:     { fn: doiMatKhau_ }
};

function traVe_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ===================== TÀI KHOẢN & PHIÊN ===================== */
function trangThai_() {
  return { ok: true, daCaiDat: !!prop_('user_sep'), ten: tenNguoi_() };
}

function tenNguoi_() {
  var r = {};
  VAI_TRO.forEach(function (v) { var u = jsonProp_('user_' + v); r[v] = u ? u.ten : TEN_VAI[v]; });
  return r;
}

function caiDat_(req) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    if (prop_('user_sep')) return { loi: 'Ứng dụng đã được thiết lập rồi' };
    VAI_TRO.forEach(function (v) {
      var ten = String(req['ten_' + v] || '').trim().slice(0, 40) || TEN_VAI[v];
      var mk = String(req['mk_' + v] || '');
      if (mk.length < 4) throw new Error('Mật khẩu của ' + TEN_VAI[v] + ' cần ít nhất 4 ký tự');
      datMatKhau_(v, ten, mk);
    });
    taoKhoaVapid_();
    caiDatNhacLich();
    sheet_(SHEET_LICH, COT_LICH); sheet_(SHEET_TIN, COT_TIN); sheet_(SHEET_TB, COT_TB);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

function datMatKhau_(vaiTro, ten, mk) {
  var salt = hex_(ngauNhien_(16));
  setProp_('user_' + vaiTro, JSON.stringify({ ten: ten, salt: salt, hash: bamMk_(mk, salt) }));
}

function bamMk_(mk, salt) {
  var b = utf8_(salt + '|' + mk);
  for (var i = 0; i < 2000; i++) b = sha256(b.concat(utf8_(salt)));
  return hex_(b);
}

function dangNhap_(req) {
  var v = req.vaiTro;
  if (VAI_TRO.indexOf(v) < 0) return { loi: 'Chọn Sếp hoặc Trợ lý' };
  var u = jsonProp_('user_' + v);
  if (!u) return { loi: 'Ứng dụng chưa được thiết lập' };
  var cache = CacheService.getScriptCache(), kSai = 'sai_' + v;
  var sai = Number(cache.get(kSai) || 0);
  if (sai >= SAI_MK_TOI_DA) return { loi: 'Sai mật khẩu quá nhiều lần. Thử lại sau 15 phút.' };
  if (bamMk_(String(req.matKhau || ''), u.salt) !== u.hash) {
    cache.put(kSai, String(sai + 1), 900);
    return { loi: 'Mật khẩu không đúng' };
  }
  cache.remove(kSai);
  var token = hex_(ngauNhien_(32));
  var phien = { v: v, het: Date.now() + PHIEN_NGAY * 86400000, may: String(req.tenMay || '').slice(0, 60) };
  setProp_('phien_' + bamToken_(token), JSON.stringify(phien));
  donPhienCu_();
  return { ok: true, token: token, vaiTro: v };
}

function bamToken_(t) { return hex_(sha256(utf8_(String(t)))).slice(0, 40); }

function xacThuc_(token) {
  if (!token) return null;
  var k = 'phien_' + bamToken_(token), cache = CacheService.getScriptCache();
  var s = cache.get(k);
  var p = s ? JSON.parse(s) : jsonProp_(k);
  if (!p || p.het < Date.now()) return null;
  if (!s) cache.put(k, JSON.stringify(p), 21600);
  return { vaiTro: p.v, khoa: k };
}

function dangXuat_(req, toi) {
  PropertiesService.getScriptProperties().deleteProperty(toi.khoa);
  CacheService.getScriptCache().remove(toi.khoa);
  if (req.endpoint) xoaThietBi_(req.endpoint);
  return { ok: true };
}

function donPhienCu_() {
  var props = PropertiesService.getScriptProperties(), all = props.getProperties(), now = Date.now();
  Object.keys(all).forEach(function (k) {
    if (k.indexOf('phien_') !== 0) return;
    try { if (JSON.parse(all[k]).het < now) props.deleteProperty(k); } catch (e) { props.deleteProperty(k); }
  });
}

function doiTen_(req, toi) {
  var ten = String(req.ten || '').trim().slice(0, 40);
  if (!ten) return { loi: 'Tên không được để trống' };
  var u = jsonProp_('user_' + toi.vaiTro);
  u.ten = ten;
  setProp_('user_' + toi.vaiTro, JSON.stringify(u));
  return { ok: true, ten: tenNguoi_() };
}

function doiMatKhau_(req, toi) {
  var u = jsonProp_('user_' + toi.vaiTro);
  if (bamMk_(String(req.cu || ''), u.salt) !== u.hash) return { loi: 'Mật khẩu hiện tại không đúng' };
  if (String(req.moi || '').length < 4) return { loi: 'Mật khẩu mới cần ít nhất 4 ký tự' };
  datMatKhau_(toi.vaiTro, u.ten, String(req.moi));
  return { ok: true };
}

/* ===================== ĐỒNG BỘ ===================== */
function tongHop_(req, toi) {
  var tt = trangThaiNhanh_();
  ghiDangXem_(toi.vaiTro, req.chat);
  return {
    ok: true, toi: toi.vaiTro, ten: tenNguoi_(), vapid: prop_('vapid_pub'),
    verLich: tt.verLich, lich: docLich_(), tin: docTinSau_(Math.max(0, tt.tinCuoi - 300)),
    tinCuoi: tt.tinCuoi, daDoc: tt.daDoc, online: tt.online
  };
}

// Mỗi 3–10 giây app hỏi 1 lần: chỉ trả phần đã thay đổi. Dùng CacheService để không tốn hạn mức Properties.
function poll_(req, toi) {
  var tt = trangThaiNhanh_();
  ghiDangXem_(toi.vaiTro, req.chat);
  var r = { ok: true, verLich: tt.verLich, tinCuoi: tt.tinCuoi, daDoc: tt.daDoc, online: tt.online };
  if (String(req.verLich) !== String(tt.verLich)) r.lich = docLich_();
  if (Number(req.tinCuoi || 0) < tt.tinCuoi) r.tin = docTinSau_(Number(req.tinCuoi || 0));
  if (req.canTen) r.ten = tenNguoi_();
  return r;
}

var KHOA_NHANH = ['verLich', 'tinCuoi', 'daDoc_sep', 'daDoc_troly'];
function trangThaiNhanh_() {
  var cache = CacheService.getScriptCache();
  var c = cache.getAll(KHOA_NHANH.concat(['seen_sep', 'seen_troly']));
  var thieu = KHOA_NHANH.filter(function (k) { return c[k] == null; });
  if (thieu.length) {
    var p = PropertiesService.getScriptProperties(), bu = {};
    thieu.forEach(function (k) { bu[k] = p.getProperty(k) || '0'; c[k] = bu[k]; });
    cache.putAll(bu, 21600);
  }
  var online = {};
  VAI_TRO.forEach(function (v) { online[v] = c['seen_' + v] ? JSON.parse(c['seen_' + v]) : null; });
  return {
    verLich: c.verLich, tinCuoi: Number(c.tinCuoi),
    daDoc: { sep: Number(c.daDoc_sep), troly: Number(c.daDoc_troly) }, online: online
  };
}

function ghiDangXem_(v, chat) {
  CacheService.getScriptCache().put('seen_' + v, JSON.stringify({ t: Date.now(), chat: !!chat }), 21600);
}

function datBien_(k, val) {
  setProp_(k, String(val));
  CacheService.getScriptCache().put(k, String(val), 21600);
}

/* ===================== LỊCH ===================== */
function docLich_() {
  var cache = CacheService.getScriptCache(), s = cache.get('lichJson');
  if (s) return JSON.parse(s);
  var sh = sheet_(SHEET_LICH, COT_LICH), n = sh.getLastRow();
  var ds = n < 2 ? [] : sh.getRange(2, 1, n - 1, COT_LICH.length).getValues().map(function (r) {
    var o = {};
    COT_LICH.forEach(function (c, i) { o[c] = r[i] instanceof Date ? Utilities.formatDate(r[i], TZ, "yyyy-MM-dd'T'HH:mm") : r[i]; });
    o.id = String(o.id); o.caNgay = String(o.caNgay).toLowerCase() === 'true';
    o.nhac = o.nhac === '' ? -1 : Number(o.nhac);
    return o;
  }).filter(function (o) { return o.id; });
  s = JSON.stringify(ds);
  if (s.length < 95000) cache.put('lichJson', s, 21600);
  return ds;
}

function chuanHoaLich_(ev) {
  var t = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  var o = {
    tieuDe: String(ev.tieuDe || '').trim().slice(0, 200),
    caNgay: !!ev.caNgay, bd: String(ev.bd || ''), kt: String(ev.kt || ''),
    diaDiem: String(ev.diaDiem || '').slice(0, 200),
    lich: VAI_TRO.concat('chung').indexOf(ev.lich) >= 0 ? ev.lich : 'chung',
    lap: ['', 'ngay', 'tuan', 'thang', 'nam'].indexOf(ev.lap || '') >= 0 ? (ev.lap || '') : '',
    lapDen: /^\d{4}-\d{2}-\d{2}$/.test(ev.lapDen || '') ? ev.lapDen : '',
    nhac: ev.nhac == null || ev.nhac === '' ? -1 : Math.max(-1, Math.min(20160, Number(ev.nhac) || 0)),
    ghiChu: String(ev.ghiChu || '').slice(0, 3000)
  };
  if (!o.tieuDe) throw new Error('Chưa nhập tiêu đề');
  if (!t.test(o.bd) || !t.test(o.kt)) throw new Error('Ngày giờ không hợp lệ');
  if (o.kt < o.bd) o.kt = o.bd;
  return o;
}

function luuLich_(req, toi) {
  var ev = chuanHoaLich_(req.ev || {});
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  var moi, cu = null;
  try {
    var sh = sheet_(SHEET_LICH, COT_LICH), id = String((req.ev || {}).id || '');
    var dong = id ? timDong_(sh, id) : 0;
    if (id && !dong) return { loi: 'Sự kiện này đã bị xoá' };
    if (dong) cu = docDongLich_(sh, dong);
    moi = Object.assign({}, cu || {}, ev, {
      id: dong ? id : 'L' + Date.now().toString(36) + hex_(ngauNhien_(2)),
      taoBoi: cu ? cu.taoBoi : toi.vaiTro, suaBoi: toi.vaiTro,
      capNhat: Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ss")
    });
    var hang = COT_LICH.map(function (c) { return c === 'nhac' && moi.nhac < 0 ? '' : moi[c]; });
    var o = dong ? sh.getRange(dong, 1, 1, hang.length) : sh.getRange(sh.getLastRow() + 1, 1, 1, hang.length);
    o.setNumberFormat('@').setValues([hang.map(chu_)]);
    sauKhiDoiLich_();
  } finally { lock.releaseLock(); }
  baoDoiLich_(toi.vaiTro, moi, cu ? 'sửa' : 'thêm', cu);
  return { ok: true, ev: moi, verLich: prop_('verLich') };
}

function xoaLich_(req, toi) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  var cu;
  try {
    var sh = sheet_(SHEET_LICH, COT_LICH), dong = timDong_(sh, String(req.id || ''));
    if (!dong) return { ok: true, verLich: prop_('verLich') };
    cu = docDongLich_(sh, dong);
    sh.deleteRow(dong);
    sauKhiDoiLich_();
  } finally { lock.releaseLock(); }
  baoDoiLich_(toi.vaiTro, cu, 'xoá');
  return { ok: true, verLich: prop_('verLich') };
}

function docDongLich_(sh, dong) {
  var r = sh.getRange(dong, 1, 1, COT_LICH.length).getValues()[0], o = {};
  COT_LICH.forEach(function (c, i) { o[c] = r[i]; });
  o.caNgay = String(o.caNgay).toLowerCase() === 'true'; o.nhac = o.nhac === '' ? -1 : Number(o.nhac);
  return o;
}

function timDong_(sh, id) {
  var n = sh.getLastRow();
  if (n < 2 || !id) return 0;
  var ids = sh.getRange(2, 1, n - 1, 1).getDisplayValues();
  for (var i = 0; i < ids.length; i++) if (ids[i][0] === id) return i + 2;
  return 0;
}

function sauKhiDoiLich_() {
  datBien_('verLich', Date.now().toString(36));
  CacheService.getScriptCache().remove('lichJson');
  tinhNhacKeTiep_();
}

// Báo cho người còn lại khi lịch của họ (hoặc lịch chung) bị thêm / sửa / xoá
function baoDoiLich_(nguoiLam, ev, kieu, cu) {
  var khac = nguoiLam === 'sep' ? 'troly' : 'sep';
  if (ev.lich !== khac && ev.lich !== 'chung' && !(cu && (cu.lich === khac || cu.lich === 'chung'))) return;
  var ten = tenNguoi_()[nguoiLam];
  guiThongBao_([khac], {
    title: ten + ' đã ' + kieu + ' lịch' + (ev.lich === 'chung' ? ' chung' : ''),
    body: ev.tieuDe + ' • ' + moTaGio_(ev),
    tag: 'lich-' + ev.id,
    url: kieu === 'xoá' ? './#lich/' + ev.bd.slice(0, 10) : './#su-kien/' + ev.id
  });
}

var THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
function moTaGio_(ev) {
  var d = new Date(ev.bd.slice(0, 10) + 'T00:00:00Z');
  var ngay = THU[d.getUTCDay()] + ' ' + ev.bd.slice(8, 10) + '/' + ev.bd.slice(5, 7);
  return ev.caNgay ? 'Cả ngày ' + ngay : ev.bd.slice(11, 16) + ' ' + ngay;
}

/* ===================== NHẮC LỊCH ===================== */
// Chạy hàm này 1 lần (hoặc để "Thiết lập lần đầu" tự chạy) để tạo trình nhắc mỗi phút.
function caiDatNhacLich() {
  var co = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === 'kiemTraNhacLich'; });
  if (!co) ScriptApp.newTrigger('kiemTraNhacLich').timeBased().everyMinutes(1).create();
  tinhNhacKeTiep_();
}

// Giờ (ms) của một lần diễn ra, theo giờ Việt Nam
function msGio_(ymd, hm) { return new Date(ymd + 'T' + hm + ':00+07:00').getTime(); }

function lucNhac_(ev, ymd) {
  var gio = ev.caNgay ? ('0' + GIO_NHAC_CA_NGAY).slice(-2) + ':00' : ev.bd.slice(11, 16);
  return msGio_(ymd, gio) - ev.nhac * 60000;
}

function tinhNhacKeTiep_() {
  var now = Date.now(), next = 0;
  docLich_().forEach(function (ev) {
    if (ev.nhac < 0) return;
    var tu = ymdCong_(ymdTuMs_(now), -1), den = ymdCong_(tu, 400);
    var ngay = lanDienRa(ev, tu, den, 1, function (ymd) { return lucNhac_(ev, ymd) > now; });
    if (ngay.length) { var t = lucNhac_(ev, ngay[0]); if (!next || t < next) next = t; }
  });
  datBien_('nhacKeTiep', next || 0);
}

function kiemTraNhacLich() {
  var cache = CacheService.getScriptCache(), now = Date.now();
  var next = Number(cache.get('nhacKeTiep') || prop_('nhacKeTiep') || 0);
  if (!next || now < next) return;
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return;
  try {
    var tu = Math.max(Number(prop_('nhacDaChay') || 0), now - 2 * 3600000);
    docLich_().forEach(function (ev) {
      if (ev.nhac < 0) return;
      var ngay = lanDienRa(ev, ymdCong_(ymdTuMs_(tu), -15), ymdCong_(ymdTuMs_(now), 15), 50, function (ymd) {
        var t = lucNhac_(ev, ymd); return t > tu && t <= now;
      });
      ngay.forEach(function (ymd) {
        var nguoi = ev.lich === 'chung' ? VAI_TRO : [ev.lich];
        var truoc = ev.nhac === 0 ? 'Bắt đầu ngay bây giờ' : ev.nhac % 1440 === 0 ? 'Còn ' + (ev.nhac / 1440) + ' ngày'
          : ev.nhac % 60 === 0 ? 'Còn ' + (ev.nhac / 60) + ' giờ' : 'Còn ' + ev.nhac + ' phút';
        guiThongBao_(nguoi, {
          title: '⏰ ' + ev.tieuDe,
          body: truoc + ' • ' + moTaGio_(Object.assign({}, ev, { bd: ymd + ev.bd.slice(10) })) + (ev.diaDiem ? ' • ' + ev.diaDiem : ''),
          tag: 'nhac-' + ev.id + '-' + ymd, url: './#su-kien/' + ev.id + '/' + ymd
        });
      });
    });
    setProp_('nhacDaChay', String(now));
    tinhNhacKeTiep_();
  } finally { lock.releaseLock(); }
}

/* ---- Lặp lại: dùng chung logic với app (lich-trinh/app.js → lanDienRa) ---- */
function soNgay_(ymd) { return Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10)) / 86400000; }
function ymdTuSo_(n) { return new Date(n * 86400000).toISOString().slice(0, 10); }
function ymdCong_(ymd, k) { return ymdTuSo_(soNgay_(ymd) + k); }
function ymdTuMs_(ms) { return Utilities.formatDate(new Date(ms), TZ, 'yyyy-MM-dd'); }

// Trả về các ngày bắt đầu (yyyy-MM-dd) mà sự kiện diễn ra và có phần nằm trong [tu, den].
// toiDa: lấy tối đa bao nhiêu lần; loc: hàm lọc thêm (tuỳ chọn).
function lanDienRa(ev, tu, den, toiDa, loc) {
  var bd = ev.bd.slice(0, 10), dai = soNgay_(ev.kt.slice(0, 10)) - soNgay_(bd);
  var nTu = soNgay_(tu) - dai, nDen = soNgay_(den), kq = [];
  var het = ev.lapDen ? Math.min(nDen, soNgay_(ev.lapDen)) : nDen;
  function them(ymd) { if (!loc || loc(ymd)) kq.push(ymd); return kq.length >= toiDa; }
  var n0 = soNgay_(bd);
  if (!ev.lap) { if (n0 >= nTu && n0 <= nDen) them(bd); return kq; }
  if (ev.lap === 'ngay' || ev.lap === 'tuan') {
    var buoc = ev.lap === 'ngay' ? 1 : 7;
    var k = Math.max(0, Math.ceil((nTu - n0) / buoc));
    for (var n = n0 + k * buoc; n <= het; n += buoc) if (them(ymdTuSo_(n))) break;
    return kq;
  }
  var y = +bd.slice(0, 4), m = +bd.slice(5, 7), d = +bd.slice(8, 10);
  var yTu = +ymdTuSo_(nTu).slice(0, 4), mTu = +ymdTuSo_(nTu).slice(5, 7);
  if (ev.lap === 'thang') { var lech = (yTu - y) * 12 + (mTu - m) - 1; if (lech > 0) { y += Math.floor((m - 1 + lech) / 12); m = (m - 1 + lech) % 12 + 1; } }
  if (ev.lap === 'nam' && yTu - 1 > y) y = yTu - 1;
  for (var i = 0; i < 2000; i++) {
    var ngayHopLe = new Date(Date.UTC(y, m - 1, d)).getUTCDate() === d;
    var ymd2 = y + '-' + ('0' + m).slice(-2) + '-' + ('0' + d).slice(-2);
    if (ngayHopLe) {
      var nn = soNgay_(ymd2);
      if (nn > het) break;
      if (nn >= nTu && nn >= n0 && them(ymd2)) break;
    }
    if (ev.lap === 'thang') { m++; if (m > 12) { m = 1; y++; } } else y++;
  }
  return kq;
}

/* ===================== TIN NHẮN ===================== */
function docTinSau_(sauId) {
  var sh = sheet_(SHEET_TIN, COT_TIN), n = sh.getLastRow();
  if (n < 2) return [];
  var tuDong = Math.max(2, n - 299);
  return sh.getRange(tuDong, 1, n - tuDong + 1, COT_TIN.length).getDisplayValues().map(function (r) {
    return { id: Number(r[0]), t: r[1], tu: r[2], nd: r[3], lichId: r[4] };
  }).filter(function (m) { return m.id > sauId; });
}

function guiTin_(req, toi) {
  var nd = String(req.noiDung || '').trim().slice(0, 4000), lichId = String(req.lichId || '');
  if (!nd && !lichId) return { loi: 'Tin nhắn trống' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  var tin;
  try {
    var id = Number(prop_('tinCuoi') || 0) + 1;
    tin = { id: id, t: Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd'T'HH:mm:ss"), tu: toi.vaiTro, nd: nd, lichId: lichId };
    var sh = sheet_(SHEET_TIN, COT_TIN);
    sh.getRange(sh.getLastRow() + 1, 1, 1, 5).setNumberFormat('@').setValues([[String(id), tin.t, tin.tu, chu_(nd), lichId]]);
    datBien_('tinCuoi', id);
    datBien_('daDoc_' + toi.vaiTro, id);
  } finally { lock.releaseLock(); }

  var khac = toi.vaiTro === 'sep' ? 'troly' : 'sep';
  var tt = trangThaiNhanh_(), o = tt.online[khac];
  var dangMoChat = o && o.chat && Date.now() - o.t < 12000;
  if (!dangMoChat) {
    var body = nd;
    if (lichId) {
      var ev = docLich_().filter(function (e) { return e.id === lichId; })[0];
      body = (nd ? nd + '\n' : '') + '📅 ' + (ev ? ev.tieuDe + ' • ' + moTaGio_(ev) : 'Một sự kiện');
    }
    guiThongBao_([khac], {
      title: '💬 ' + tenNguoi_()[toi.vaiTro], body: body.slice(0, 180), tag: 'chat-' + tin.id, url: './#chat',
      badge: tt.tinCuoi - tt.daDoc[khac]
    });
  }
  return { ok: true, tin: tin };
}

function daDoc_(req, toi) {
  var id = Number(req.id || 0), cu = Number(prop_('daDoc_' + toi.vaiTro) || 0);
  if (id > cu) datBien_('daDoc_' + toi.vaiTro, Math.min(id, Number(prop_('tinCuoi') || 0)));
  return { ok: true };
}

/* ===================== THÔNG BÁO ĐẨY (Web Push) ===================== */
function taoKhoaVapid_() {
  if (prop_('vapid_pub')) return;
  var k = taoCapKhoa();
  setProp_('vapid_priv', hex_(k.priv));
  setProp_('vapid_pub', b64url_(k.pub));
}

function dangKyThongBao_(req, toi) {
  var s = req.sub || {}, keys = s.keys || {};
  if (!/^https:\/\//.test(s.endpoint || '') || !keys.p256dh || !keys.auth) return { loi: 'Đăng ký thông báo không hợp lệ' };
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    xoaThietBi_(s.endpoint);
    var sh = sheet_(SHEET_TB, COT_TB);
    sh.appendRow([s.endpoint, keys.p256dh, keys.auth, toi.vaiTro, chu_(String(req.tenMay || '').slice(0, 60)),
      Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm')]);
  } finally { lock.releaseLock(); }
  return { ok: true };
}

function huyThongBao_(req) { if (req.endpoint) xoaThietBi_(req.endpoint); return { ok: true }; }

function thuThongBao_(req, toi) {
  var kq = guiThongBao_([toi.vaiTro], { title: '🔔 Thông báo đã hoạt động', body: 'Máy này sẽ nhận nhắc lịch và tin nhắn.', tag: 'thu', url: './#toi' });
  return { ok: true, daGui: kq.daGui, loi: kq.daGui ? undefined : (kq.ghiChu || 'Chưa có máy nào bật thông báo') };
}

function xoaThietBi_(endpoint) {
  var sh = sheet_(SHEET_TB, COT_TB), n = sh.getLastRow();
  if (n < 2) return;
  var ds = sh.getRange(2, 1, n - 1, 1).getValues();
  for (var i = ds.length - 1; i >= 0; i--) if (ds[i][0] === endpoint) sh.deleteRow(i + 2);
}

// Gửi 1 thông báo tới mọi máy đã bật thông báo của các vai trò trong danh sách
function guiThongBao_(vaiTros, tb) {
  var sh = sheet_(SHEET_TB, COT_TB), n = sh.getLastRow();
  if (n < 2) return { daGui: 0 };
  var ds = sh.getRange(2, 1, n - 1, COT_TB.length).getValues().filter(function (r) { return vaiTros.indexOf(r[3]) >= 0; });
  if (!ds.length) return { daGui: 0 };
  var priv = BigInt('0x' + prop_('vapid_priv')), pub = prop_('vapid_pub');
  var noiDung = utf8_(JSON.stringify(tb));
  var yeuCau = ds.map(function (r) {
    var body = maHoaWebPush(noiDung, b64urlBytes_(r[1]), b64urlBytes_(r[2]));
    return {
      url: r[0], method: 'post', muteHttpExceptions: true, contentType: 'application/octet-stream',
      payload: body.map(function (b) { return b > 127 ? b - 256 : b; }),
      headers: { TTL: '86400', Urgency: 'high', 'Content-Encoding': 'aes128gcm', Authorization: vapidHeader_(r[0], priv, pub) }
    };
  });
  var kq = UrlFetchApp.fetchAll(yeuCau), daGui = 0, ghiChu = '';
  kq.forEach(function (res, i) {
    var code = res.getResponseCode();
    if (code >= 200 && code < 300) daGui++;
    else if (code === 404 || code === 410) xoaThietBi_(ds[i][0]);
    else { ghiChu = 'Máy chủ thông báo trả lỗi ' + code; console.warn('Push lỗi', code, res.getContentText().slice(0, 300)); }
  });
  return { daGui: daGui, ghiChu: ghiChu };
}

function vapidHeader_(endpoint, priv, pub) {
  var aud = endpoint.match(/^https:\/\/[^\/]+/)[0];
  var cache = CacheService.getScriptCache(), k = 'jwt_' + aud;
  var jwt = cache.get(k);
  if (!jwt) {
    var dau = b64url_(utf8_(JSON.stringify({ typ: 'JWT', alg: 'ES256' }))) + '.' +
      b64url_(utf8_(JSON.stringify({ aud: aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: VAPID_SUB })));
    jwt = dau + '.' + b64url_(kyEcdsa(utf8_(dau), priv));
    cache.put(k, jwt, 6 * 3600);
  }
  return 'vapid t=' + jwt + ', k=' + pub;
}

/* ===================== TIỆN ÍCH ===================== */
// Ô bắt đầu bằng "=" sẽ bị Sheet hiểu là công thức → thêm dấu ' để giữ nguyên chữ
function chu_(v) { v = String(v); return v.charAt(0) === '=' ? "'" + v : v; }

function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function setProp_(k, v) { PropertiesService.getScriptProperties().setProperty(k, v); }
function jsonProp_(k) { var s = prop_(k); return s ? JSON.parse(s) : null; }

function sheet_(ten, cot) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(ten);
  if (!sh) {
    sh = ss.insertSheet(ten);
    sh.getRange(1, 1, 1, cot.length).setValues([cot]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function ngauNhien_(n) {
  var out = [];
  while (out.length < n) {
    var h = typeof Utilities !== 'undefined'
      ? sha256(utf8_(Utilities.getUuid() + Utilities.getUuid() + Date.now() + Math.random()))
      : sha256(utf8_(String(Math.random()) + Math.random() + Date.now()));
    out = out.concat(h);
  }
  return out.slice(0, n);
}

function utf8_(s) {
  var out = [], str = unescape(encodeURIComponent(String(s)));
  for (var i = 0; i < str.length; i++) out.push(str.charCodeAt(i));
  return out;
}
function hex_(b) { return b.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
var B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function b64url_(b) {
  var s = '';
  for (var i = 0; i < b.length; i += 3) {
    var n = (b[i] << 16) | ((b[i + 1] || 0) << 8) | (b[i + 2] || 0);
    s += B64[n >> 18 & 63] + B64[n >> 12 & 63] + (i + 1 < b.length ? B64[n >> 6 & 63] : '') + (i + 2 < b.length ? B64[n & 63] : '');
  }
  return s;
}
function b64urlBytes_(s) {
  s = String(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  var out = [], bits = 0, val = 0;
  for (var i = 0; i < s.length; i++) {
    val = (val << 6) | B64.indexOf(s[i]); bits += 6;
    if (bits >= 8) { bits -= 8; out.push((val >> bits) & 255); }
  }
  return out;
}

/* ===================== MẬT MÃ (thuần JavaScript) =====================
 * Apps Script không có sẵn ECDSA / ECDH / AES-GCM nên tự cài theo chuẩn:
 *   SHA-256, HMAC, HKDF (RFC 5869) • đường cong P-256 • ECDSA ES256 (VAPID, RFC 8292)
 *   AES-128-GCM • mã hoá nội dung Web Push aes128gcm (RFC 8188 / RFC 8291)
 * Mảng byte là mảng số 0–255.
 */
var SHA_K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];

function sha256(msg) {
  var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  var m = msg.slice(), len = msg.length * 8;
  m.push(0x80);
  while (m.length % 64 !== 56) m.push(0);
  for (var s = 56; s >= 0; s -= 8) m.push(s >= 32 ? Math.floor(len / Math.pow(2, s)) & 255 : (len >>> s) & 255);
  var w = new Array(64);
  for (var o = 0; o < m.length; o += 64) {
    for (var i = 0; i < 16; i++) w[i] = (m[o + 4 * i] << 24) | (m[o + 4 * i + 1] << 16) | (m[o + 4 * i + 2] << 8) | m[o + 4 * i + 3];
    for (i = 16; i < 64; i++) {
      var a0 = w[i - 15], a1 = w[i - 2];
      var s0 = ((a0 >>> 7) | (a0 << 25)) ^ ((a0 >>> 18) | (a0 << 14)) ^ (a0 >>> 3);
      var s1 = ((a1 >>> 17) | (a1 << 15)) ^ ((a1 >>> 19) | (a1 << 13)) ^ (a1 >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
    for (i = 0; i < 64; i++) {
      var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      var t1 = (hh + S1 + ((e & f) ^ (~e & g)) + SHA_K[i] + w[i]) | 0;
      var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      var t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
    h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
  }
  var out = [];
  h.forEach(function (x) { out.push((x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255); });
  return out;
}

function hmac256(key, msg) {
  if (key.length > 64) key = sha256(key);
  var k = key.concat(new Array(64 - key.length).fill(0));
  var ipad = k.map(function (x) { return x ^ 0x36; }), opad = k.map(function (x) { return x ^ 0x5c; });
  return sha256(opad.concat(sha256(ipad.concat(msg))));
}

function hkdf(salt, ikm, info, len) {
  var prk = hmac256(salt, ikm);
  return hmac256(prk, info.concat([1])).slice(0, len);
}

/* ---- P-256 ---- */
var EC_P = BigInt('0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff');
var EC_N = BigInt('0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551');
var EC_G = [BigInt('0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296'),
  BigInt('0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5'), BigInt(1)];
var B0 = BigInt(0), B1 = BigInt(1), B2 = BigInt(2), B3 = BigInt(3), B4 = BigInt(4), B8 = BigInt(8);

function modP_(a) { a %= EC_P; return a < B0 ? a + EC_P : a; }
function nghichDao_(a, m) {
  var t = B0, nt = B1, r = m, nr = ((a % m) + m) % m;
  while (nr !== B0) { var q = r / nr, x = t - q * nt; t = nt; nt = x; x = r - q * nr; r = nr; nr = x; }
  return t < B0 ? t + m : t;
}
function nhanDoi_(P) {
  var X = P[0], Y = P[1], Z = P[2];
  if (Z === B0 || Y === B0) return [B0, B1, B0];
  var delta = modP_(Z * Z), gamma = modP_(Y * Y), beta = modP_(X * gamma);
  var alpha = modP_(B3 * (X - delta) * (X + delta));
  var X3 = modP_(alpha * alpha - B8 * beta);
  var Z3 = modP_((Y + Z) * (Y + Z) - gamma - delta);
  var Y3 = modP_(alpha * (B4 * beta - X3) - B8 * modP_(gamma * gamma));
  return [X3, Y3, Z3];
}
function cong_(P, Q) {
  if (P[2] === B0) return Q;
  if (Q[2] === B0) return P;
  var Z1s = modP_(P[2] * P[2]), Z2s = modP_(Q[2] * Q[2]);
  var U1 = modP_(P[0] * Z2s), U2 = modP_(Q[0] * Z1s);
  var S1 = modP_(P[1] * Z2s * Q[2]), S2 = modP_(Q[1] * Z1s * P[2]);
  if (U1 === U2) return S1 === S2 ? nhanDoi_(P) : [B0, B1, B0];
  var H = modP_(U2 - U1), R = modP_(S2 - S1), H2 = modP_(H * H), H3 = modP_(H2 * H), U1H2 = modP_(U1 * H2);
  var X3 = modP_(R * R - H3 - B2 * U1H2);
  var Y3 = modP_(R * (U1H2 - X3) - S1 * H3);
  return [X3, Y3, modP_(H * P[2] * Q[2])];
}
function nhanDiem_(k, P) {
  var R = [B0, B1, B0], bits = k.toString(2);
  for (var i = 0; i < bits.length; i++) { R = nhanDoi_(R); if (bits[i] === '1') R = cong_(R, P); }
  if (R[2] === B0) throw new Error('Điểm vô cực');
  var zi = nghichDao_(R[2], EC_P), zi2 = modP_(zi * zi);
  return [modP_(R[0] * zi2), modP_(R[1] * zi2 * zi), B1];
}
function soTuByte_(b) { return BigInt('0x' + (hex_(b) || '0')); }
function byteTuSo_(n, len) {
  var h = n.toString(16); while (h.length < len * 2) h = '0' + h;
  var out = []; for (var i = 0; i < len; i++) out.push(parseInt(h.substr(i * 2, 2), 16));
  return out;
}
function diemTuByte_(b) {
  if (b.length !== 65 || b[0] !== 4) throw new Error('Khoá công khai không hợp lệ');
  return [soTuByte_(b.slice(1, 33)), soTuByte_(b.slice(33)), B1];
}
function byteTuDiem_(P) { return [4].concat(byteTuSo_(P[0], 32), byteTuSo_(P[1], 32)); }
function soNgauNhien_() { return soTuByte_(ngauNhien_(48)) % (EC_N - B1) + B1; }

function taoCapKhoa(d) {
  d = d || soNgauNhien_();
  return { priv: byteTuSo_(d, 32), d: d, pub: byteTuDiem_(nhanDiem_(d, EC_G)) };
}

// Chữ ký ES256 dạng r||s (64 byte) như JWS yêu cầu
function kyEcdsa(msg, d) {
  var e = soTuByte_(sha256(msg)) % EC_N;
  for (;;) {
    var k = soNgauNhien_(), R = nhanDiem_(k, EC_G), r = R[0] % EC_N;
    if (r === B0) continue;
    var s = (nghichDao_(k, EC_N) * ((e + r * d) % EC_N)) % EC_N;
    if (s !== B0) return byteTuSo_(r, 32).concat(byteTuSo_(s, 32));
  }
}

/* ---- AES-128-GCM ---- */
var AES_S = (function () {
  var s = new Array(256), p = 1, q = 1;
  do {
    p = p ^ ((p << 1) & 255) ^ (p & 0x80 ? 0x1b : 0);
    q ^= q << 1; q ^= q << 2; q ^= q << 4; q &= 255; if (q & 0x80) q ^= 0x09;
    var x = q ^ ((q << 1) | (q >> 7)) ^ ((q << 2) | (q >> 6)) ^ ((q << 3) | (q >> 5)) ^ ((q << 4) | (q >> 4));
    s[p] = (x ^ 0x63) & 255;
  } while (p !== 1);
  s[0] = 0x63;
  return s;
})();
function xt_(a) { return ((a << 1) ^ (a & 0x80 ? 0x1b : 0)) & 255; }
function aesKhoa_(key) {
  var w = key.slice(), rcon = 1;
  for (var i = 16; i < 176; i += 4) {
    var t = w.slice(i - 4, i);
    if (i % 16 === 0) { t = [AES_S[t[1]] ^ rcon, AES_S[t[2]], AES_S[t[3]], AES_S[t[0]]]; rcon = xt_(rcon); }
    for (var j = 0; j < 4; j++) w.push(w[i - 16 + j] ^ t[j]);
  }
  return w;
}
function aesKhoi_(w, inp) {
  var s = inp.map(function (x, i) { return x ^ w[i]; });
  for (var r = 1; r <= 10; r++) {
    var t = new Array(16);
    for (var c = 0; c < 4; c++) for (var row = 0; row < 4; row++) t[c * 4 + row] = AES_S[s[((c + row) % 4) * 4 + row]];
    if (r < 10) {
      for (c = 0; c < 4; c++) {
        var a0 = t[c * 4], a1 = t[c * 4 + 1], a2 = t[c * 4 + 2], a3 = t[c * 4 + 3], all = a0 ^ a1 ^ a2 ^ a3;
        t[c * 4] ^= all ^ xt_(a0 ^ a1); t[c * 4 + 1] ^= all ^ xt_(a1 ^ a2);
        t[c * 4 + 2] ^= all ^ xt_(a2 ^ a3); t[c * 4 + 3] ^= all ^ xt_(a3 ^ a0);
      }
    }
    for (var i = 0; i < 16; i++) t[i] ^= w[r * 16 + i];
    s = t;
  }
  return s;
}
var GCM_R = BigInt('0xe1') << BigInt(120);
function gmul_(X, Y) {
  var Z = B0, V = Y;
  for (var i = 127; i >= 0; i--) {
    if ((X >> BigInt(i)) & B1) Z ^= V;
    V = (V & B1) ? (V >> B1) ^ GCM_R : V >> B1;
  }
  return Z;
}
function aesGcm(key, iv, pt) {
  var w = aesKhoa_(key), H = soTuByte_(aesKhoi_(w, new Array(16).fill(0)));
  var j0 = iv.concat([0, 0, 0, 1]), ct = [];
  for (var o = 0, ctr = 2; o < pt.length; o += 16, ctr++) {
    var ks = aesKhoi_(w, iv.concat([(ctr >>> 24) & 255, (ctr >>> 16) & 255, (ctr >>> 8) & 255, ctr & 255]));
    for (var i = 0; i < 16 && o + i < pt.length; i++) ct.push(pt[o + i] ^ ks[i]);
  }
  var Y = B0;
  for (o = 0; o < ct.length; o += 16) {
    var blk = ct.slice(o, o + 16); while (blk.length < 16) blk.push(0);
    Y = gmul_(Y ^ soTuByte_(blk), H);
  }
  Y = gmul_(Y ^ BigInt(ct.length * 8), H);
  var tag = byteTuSo_(Y ^ soTuByte_(aesKhoi_(w, j0)), 16);
  return ct.concat(tag);
}

// Mã hoá nội dung gửi tới 1 trình duyệt (RFC 8291). asD: khoá tạm (chỉ truyền khi kiểm thử).
function maHoaWebPush(noiDung, uaPub, authSecret, asD, salt) {
  var as = taoCapKhoa(asD);
  var chung = byteTuSo_(nhanDiem_(as.d, diemTuByte_(uaPub))[0], 32);
  var ikm = hkdf(authSecret, chung, utf8_('WebPush: info').concat([0], uaPub, as.pub), 32);
  salt = salt || ngauNhien_(16);
  var cek = hkdf(salt, ikm, utf8_('Content-Encoding: aes128gcm').concat([0]), 16);
  var nonce = hkdf(salt, ikm, utf8_('Content-Encoding: nonce').concat([0]), 12);
  var ma = aesGcm(cek, nonce, noiDung.concat([2]));
  return salt.concat([0, 0, 16, 0, 65], as.pub, ma);
}
