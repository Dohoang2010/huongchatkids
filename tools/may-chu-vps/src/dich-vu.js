'use strict';
/* Giả lập các dịch vụ Google mà mã Apps Script dùng:
   SpreadsheetApp, CacheService, PropertiesService, LockService, Utilities, ContentService,
   MailApp, UrlFetchApp, ScriptApp, Session, Logger.

   UrlFetchApp (mã .gs gọi kiểu "chờ kết quả" – Node không làm thế được mà không treo cả máy chủ):
   - Lệnh ĐỌC (GET, Zalo getMe/getUpdates): lần chạy đầu ghi lại địa chỉ cần gọi và trả "chưa có" (mã 599),
     máy chủ hoàn tác lần chạy đó, gọi song song các địa chỉ (không treo ai), rồi chạy lại với kết quả thật.
   - Lệnh GỬI (Zalo sendMessage…): xếp hàng, gửi SAU khi lần chạy ghi dữ liệu thành công.
   - Lệnh khác (POST lạ, eSMS): gọi thật ngay, chờ kết quả (hiếm).
   MailApp: xếp hàng gửi sau khi ghi thành công (SMTP / chuyển qua Apps Script). */
const crypto = require('node:crypto');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { dinhDangNgay, laNgay } = require('./ngay');

const GIOI_HAN_DEM = 100 * 1024;   // CacheService: 100KB / giá trị

function anKhoa(url) {   // che khoá bí mật khi ghi nhật ký
  return String(url).replace(/(bot)\d{6,}:[\w-]+/g, '$1***').replace(/([?&](key|ApiKey|SecretKey|token)=)[^&]*/gi, '$1***');
}

class PhanHoi {
  constructor(o) { this.o = o; }
  getResponseCode() { return this.o.ma; }
  getContentText() { return this.o.noiDung != null ? this.o.noiDung : ''; }
  getContent() { return Array.from(Buffer.from(this.getContentText(), 'utf8'), (b) => (b > 127 ? b - 256 : b)); }
  getHeaders() { return Object.assign({}, this.o.dau || {}); }
  getAllHeaders() { return this.getHeaders(); }
  getBlob() { const t = this.getContentText(); return { getDataAsString: () => t, getBytes: () => this.getContent(), getContentType: () => (this.o.dau || {})['Content-Type'] || '' }; }
  toString() { return this.getContentText(); }
}

/* Chuẩn hoá 1 yêu cầu UrlFetchApp → {url, method, headers, body} */
function chuanYeuCau(url, tham) {
  tham = tham || {};
  const method = String(tham.method || 'get').toUpperCase();
  const headers = {};
  for (const [k, v] of Object.entries(tham.headers || {})) headers[k] = String(v);
  let body;
  if (tham.payload != null && method !== 'GET') {
    if (typeof tham.payload === 'string') body = tham.payload;
    else if (typeof tham.payload === 'object') { body = new URLSearchParams(Object.entries(tham.payload).map(([k, v]) => [k, String(v)])).toString(); if (!tham.contentType) headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
    if (tham.contentType) headers['Content-Type'] = tham.contentType;
  }
  return { url: String(url), method, headers, body, mute: !!tham.muteHttpExceptions, theoChuyenHuong: tham.followRedirects !== false };
}
function khoaYeuCau(y) { return y.method + ' ' + y.url + ' ' + (y.body || ''); }

/* Loại yêu cầu: 'doc' (gọi trước, chạy lại) | 'gui' (gửi sau khi ghi xong) | 'cho' (gọi ngay, chờ) */
function loaiYeuCau(y) {
  if (/bot-api\.zapps\.me\/bot[^/]+\/(sendMessage|sendPhoto|sendSticker|sendChatAction)/.test(y.url)) return 'gui';
  if (/bot-api\.zapps\.me\/bot[^/]+\/(getMe|getUpdates|getWebhookInfo)/.test(y.url)) return 'doc';
  if (y.method === 'GET' && !/esms\.vn/i.test(y.url)) return 'doc';
  return 'cho';
}

/* Gọi mạng kiểu chờ (treo luồng chính) – chỉ dùng cho loại 'cho' hoặc khi đã chạy lại quá nhiều lần */
let goiChoThu = null;   // kiểm thử thay bằng hàm giả
function goiCho(dsYeuCau) {
  if (goiChoThu) return goiChoThu(dsYeuCau);
  const ra = execFileSync(process.execPath, [path.join(__dirname, 'goi-mang.js')], {
    input: JSON.stringify(dsYeuCau), timeout: 90000, maxBuffer: 64 * 1024 * 1024, encoding: 'utf8'
  });
  return JSON.parse(ra);
}

function taoDichVu(mt) {
  // mt: { kho, gd: () => lần chạy hiện tại, cauHinh, ghiNhatKy(msg) }
  const kho = mt.kho;
  const lan = () => mt.gd();

  const ketQuaThanhPhanHoi = (y, kq) => {
    if (kq.loi) throw new Error('Exception: ' + kq.loi + ': ' + anKhoa(y.url));
    if (!y.mute && kq.ma >= 400) throw new Error('Exception: Request failed for ' + anKhoa(y.url).split('?')[0] + ' returned code ' + kq.ma + '. Truncated server response: ' + String(kq.noiDung || '').slice(0, 200) + ' (use muteHttpExceptions option to examine full response)');
    return new PhanHoi(kq);
  };
  const layMot = (y) => {
    const l = lan(); const loai = loaiYeuCau(y);
    if (loai === 'gui') {
      l.hieuUng.push({ loai: 'mang', yc: y, tomTat: anKhoa(y.url).replace(/^https:\/\/bot-api\.zapps\.me\/bot\*\*\*\//, 'Zalo ') });
      return new PhanHoi({ ma: 200, noiDung: '{"ok":true,"result":{"vps_xep_hang":true}}', dau: {} });
    }
    const k = khoaYeuCau(y);
    if (l.daLay.has(k)) return ketQuaThanhPhanHoi(y, l.daLay.get(k));
    if (loai === 'doc' && !l.lanCuoi) {
      if (!l.thieu.some((x) => khoaYeuCau(x) === k)) l.thieu.push(y);
      const kq = { ma: 599, noiDung: '', dau: {}, tam: true };
      if (!y.mute) throw new Error('Exception: Request failed (VPS đang lấy dữ liệu, sẽ chạy lại)');
      return new PhanHoi(kq);
    }
    const [kq] = goiCho([y]); l.daLay.set(k, kq);
    return ketQuaThanhPhanHoi(y, kq);
  };

  const UrlFetchApp = {
    fetch(url, tham) { return layMot(chuanYeuCau(url, tham)); },
    fetchAll(ds) {
      const ycs = (ds || []).map((x) => (typeof x === 'string' ? chuanYeuCau(x, {}) : chuanYeuCau(x.url, x)));
      const l = lan();
      // các yêu cầu loại 'cho' trong lô: gọi song song 1 lần
      const canCho = ycs.filter((y) => loaiYeuCau(y) === 'cho' || (loaiYeuCau(y) === 'doc' && l.lanCuoi)).filter((y) => !l.daLay.has(khoaYeuCau(y)));
      if (canCho.length) goiCho(canCho).forEach((kq, i) => l.daLay.set(khoaYeuCau(canCho[i]), kq));
      return ycs.map((y) => layMot(y));
    },
    getRequest(url, tham) { const y = chuanYeuCau(url, tham); return { url: y.url, method: y.method.toLowerCase(), headers: y.headers, payload: y.body }; }
  };

  const MailApp = {
    sendEmail(a, b, c, d) {
      let m;
      if (a && typeof a === 'object') m = Object.assign({}, a);
      else { m = Object.assign({}, d || {}); m.to = a; m.subject = b; m.body = c; }
      const thu = { to: String(m.to || m.recipient || '').trim(), subject: String(m.subject || ''), body: m.body != null ? String(m.body) : '',
        htmlBody: m.htmlBody != null ? String(m.htmlBody) : '', name: m.name ? String(m.name) : '', replyTo: m.replyTo ? String(m.replyTo) : '',
        cc: m.cc ? String(m.cc) : '', bcc: m.bcc ? String(m.bcc) : '' };
      if (!thu.to) throw new Error('Exception: Failed to send email: no recipient');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+(\s*,\s*[^@\s]+@[^@\s]+\.[^@\s]+)*$/.test(thu.to)) throw new Error('Exception: Invalid email: ' + thu.to);
      lan().hieuUng.push({ loai: 'mail', thu, tomTat: thu.to.replace(/^(.).*?(@.*)$/, '$1***$2') + ' – ' + thu.subject.slice(0, 80) });
    },
    getRemainingDailyQuota() { return 1000; }
  };
  const GmailApp = { sendEmail: MailApp.sendEmail };

  const CacheService = (() => {
    const dem = {
      get(k) { const x = kho.boNhoDem.get(String(k)); if (!x) return null; if (x.het <= Date.now()) { kho.boNhoDem.delete(String(k)); return null; } return x.v; },
      getAll(ds) { const o = {}; (ds || []).forEach((k) => { const v = dem.get(k); if (v != null) o[k] = v; }); return o; },
      put(k, v, giay) {
        k = String(k); v = String(v);
        if (k.length > 250) throw new Error('Exception: Argument too large: key');
        if (Buffer.byteLength(v, 'utf8') > GIOI_HAN_DEM) throw new Error('Exception: Argument too large: value');
        const t = Math.min(21600, Math.max(1, Number(giay) || 600));
        const cu = kho.boNhoDem.get(k); lan().hoanTacKhac.push(() => { if (cu) kho.boNhoDem.set(k, cu); else kho.boNhoDem.delete(k); });
        kho.boNhoDem.set(k, { v, het: Date.now() + t * 1000 });
      },
      putAll(o, giay) { Object.keys(o || {}).forEach((k) => dem.put(k, o[k], giay)); },
      remove(k) { k = String(k); const cu = kho.boNhoDem.get(k); if (!cu) return; lan().hoanTacKhac.push(() => kho.boNhoDem.set(k, cu)); kho.boNhoDem.delete(k); },
      removeAll(ds) { (ds || []).forEach((k) => dem.remove(k)); }
    };
    return { getScriptCache: () => dem, getUserCache: () => dem, getDocumentCache: () => dem };
  })();

  const PropertiesService = (() => {
    const doi = (k, v) => {
      const l = lan(); const co = kho.thuocTinh.has(k), cu = kho.thuocTinh.get(k);
      l.hoanTacKhac.push(() => { if (co) kho.thuocTinh.set(k, cu); else kho.thuocTinh.delete(k); });
      if (v === undefined) kho.thuocTinh.delete(k); else kho.thuocTinh.set(k, v);
      l.thuocTinhDoi.add(k);
    };
    const tt = {
      getProperty(k) { const v = kho.thuocTinh.get(String(k)); return v === undefined ? null : v; },
      setProperty(k, v) { doi(String(k), String(v)); return tt; },
      deleteProperty(k) { if (kho.thuocTinh.has(String(k))) doi(String(k), undefined); return tt; },
      getProperties() { return Object.fromEntries(kho.thuocTinh); },
      getKeys() { return [...kho.thuocTinh.keys()]; },
      setProperties(o, xoaKhac) { if (xoaKhac) [...kho.thuocTinh.keys()].forEach((k) => { if (!(k in o)) doi(k, undefined); }); Object.keys(o || {}).forEach((k) => doi(k, String(o[k]))); return tt; },
      deleteAllProperties() { [...kho.thuocTinh.keys()].forEach((k) => doi(k, undefined)); return tt; }
    };
    return { getScriptProperties: () => tt, getUserProperties: () => tt, getDocumentProperties: () => tt };
  })();

  /* Mọi lần chạy đã nối đuôi nhau (1 lần 1 lượt) → khoá luôn lấy được ngay */
  const khoa = { waitLock() {}, tryLock() { return true; }, releaseLock() {}, hasLock() { return true; } };
  const LockService = { getScriptLock: () => khoa, getDocumentLock: () => khoa, getUserLock: () => khoa };

  const Utilities = {
    formatDate: (d, tz, mau) => dinhDangNgay(d, tz, mau),
    getUuid: () => crypto.randomUUID(),
    DigestAlgorithm: { MD2: 'md2', MD5: 'md5', SHA_1: 'sha1', SHA_256: 'sha256', SHA_384: 'sha384', SHA_512: 'sha512' },
    MacAlgorithm: { HMAC_MD5: 'md5', HMAC_SHA_1: 'sha1', HMAC_SHA_256: 'sha256', HMAC_SHA_384: 'sha384', HMAC_SHA_512: 'sha512' },
    Charset: { UTF_8: 'utf8', US_ASCII: 'ascii' },
    computeDigest(alg, giaTri, bangMa) { return Array.from(crypto.createHash(alg).update(thanhBuffer(giaTri, bangMa)).digest(), coDau); },
    computeHmacSha256Signature(giaTri, khoaBm, bangMa) { return Array.from(crypto.createHmac('sha256', thanhBuffer(khoaBm, bangMa)).update(thanhBuffer(giaTri, bangMa)).digest(), coDau); },
    computeHmacSignature(alg, giaTri, khoaBm, bangMa) { return Array.from(crypto.createHmac(alg, thanhBuffer(khoaBm, bangMa)).update(thanhBuffer(giaTri, bangMa)).digest(), coDau); },
    base64Encode(x, bangMa) { return thanhBuffer(x, bangMa).toString('base64'); },
    base64EncodeWebSafe(x, bangMa) { return thanhBuffer(x, bangMa).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'); },
    base64Decode(s) { return Array.from(Buffer.from(String(s), 'base64'), coDau); },
    base64DecodeWebSafe(s) { return Array.from(Buffer.from(String(s).replace(/-/g, '+').replace(/_/g, '/'), 'base64'), coDau); },
    newBlob(du, loai, ten) { const b = thanhBuffer(du); return { getDataAsString: () => b.toString('utf8'), getBytes: () => Array.from(b, coDau), getContentType: () => loai || '', getName: () => ten || '', setName() { return this; } }; },
    sleep(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.min(Number(ms) || 0, 300000)); },
    jsonStringify: (o) => JSON.stringify(o), jsonParse: (s) => JSON.parse(s),
    parseCsv(s, sep) { return String(s).split(/\r?\n/).filter((x) => x !== '').map((d) => d.split(sep || ',')); }
  };

  const ContentService = {
    MimeType: { JSON: 'application/json', JAVASCRIPT: 'application/javascript', TEXT: 'text/plain', CSV: 'text/csv', XML: 'application/xml', ICAL: 'text/calendar', RSS: 'application/rss+xml', ATOM: 'application/atom+xml', VCARD: 'text/vcard' },
    createTextOutput(noiDung) {
      const o = { noiDung: noiDung == null ? '' : String(noiDung), kieu: 'text/plain',
        setMimeType(k) { o.kieu = k; return o; }, getMimeType() { return o.kieu; }, getContent() { return o.noiDung; },
        setContent(x) { o.noiDung = String(x); return o; }, append(x) { o.noiDung += String(x); return o; }, clear() { o.noiDung = ''; return o; },
        downloadAsFile() { return o; }, __laKetQua: true };
      return o;
    }
  };
  const HtmlService = {
    createHtmlOutput(h) { const o = ContentService.createTextOutput(h).setMimeType('text/html'); o.setTitle = () => o; o.setXFrameOptionsMode = () => o; o.addMetaTag = () => o; return o; },
    XFrameOptionsMode: { ALLOWALL: 'ALLOWALL', DEFAULT: 'DEFAULT' }
  };

  const ScriptApp = {
    getProjectTriggers: () => [],
    deleteTrigger() {},
    newTrigger(ham) {
      const b = new Proxy({}, { get: (_, ten) => (ten === 'create' ? () => { mt.ghiNhatKy('ScriptApp.newTrigger(' + ham + ') – trên VPS lịch chạy nền do máy chủ tự đặt'); return { getHandlerFunction: () => ham, getUniqueId: () => 'vps-' + ham }; } : () => b) });
      return b;
    },
    getScriptId: () => 'vps', getService: () => ({ getUrl: () => (mt.cauHinh && mt.cauHinh.diaChiCongKhai) || '' }),
    getOAuthToken: () => '', AuthMode: { FULL: 'FULL', NONE: 'NONE', LIMITED: 'LIMITED' }, WeekDay: {}
  };
  const Session = {
    getScriptTimeZone: () => kho.muiGio, getTimeZone: () => kho.muiGio,
    getActiveUser: () => ({ getEmail: () => '' }), getEffectiveUser: () => ({ getEmail: () => (mt.cauHinh && mt.cauHinh.emailChu) || '' }),
    getTemporaryActiveUserKey: () => '', getActiveUserLocale: () => 'vi'
  };
  const SpreadsheetApp = {
    getActiveSpreadsheet: () => kho.bang, getActive: () => kho.bang, openById: () => kho.bang, openByUrl: () => kho.bang,
    flush() {}, getUi() { throw new Error('Exception: Cannot call SpreadsheetApp.getUi() from this context.'); }
  };
  const Logger = {
    log(dinhDang, ...thamSo) {
      let s = typeof dinhDang === 'string' ? dinhDang : (dinhDang && typeof dinhDang === 'object' ? JSON.stringify(dinhDang) : String(dinhDang));
      if (thamSo.length && typeof dinhDang === 'string') { let i = 0; s = s.replace(/%s|%d|%f/g, () => String(thamSo[i++])); }
      mt.ghiNhatKy(anKhoa(s)); return Logger;
    },
    getLog: () => '', clear() {}
  };
  return { UrlFetchApp, MailApp, GmailApp, CacheService, PropertiesService, LockService, Utilities, ContentService, HtmlService, ScriptApp, Session, SpreadsheetApp, Logger };
}

function coDau(b) { return b > 127 ? b - 256 : b; }
function thanhBuffer(x, bangMa) {
  if (x == null) return Buffer.alloc(0);
  if (Array.isArray(x)) return Buffer.from(x.map((b) => b & 255));
  if (Buffer.isBuffer(x)) return x;
  if (typeof x === 'object' && typeof x.getBytes === 'function') return thanhBuffer(x.getBytes());
  return Buffer.from(String(x), bangMa === 'ascii' ? 'latin1' : 'utf8');
}

module.exports = { datGoiChoThu: (f) => { goiChoThu = f; }, taoDichVu, chuanYeuCau, khoaYeuCau, loaiYeuCau, anKhoa, PhanHoi, laNgay };
