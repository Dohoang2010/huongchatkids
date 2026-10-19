'use strict';
/* Nạp js/data.js + js/app.js vào môi trường giả lập trình duyệt (không cần Chrome) để kiểm thử các hàm tính giá / quà / voucher.
   o.gio = giả đồng hồ (giờ vàng, chương trình theo ngày), o.truocApp(W) = thay dữ liệu trước khi app.js chạy. Dùng: const { MC, W } = taoWeb({ gio: '2026-10-19T20:30:00+07:00' }) */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const GOC = path.join(__dirname, '..', '..');

function taoWeb(o = {}) {
  const bayGio = o.gio ? Date.parse(o.gio) : Date.now();
  const DateGia = class extends Date { constructor(...a) { super(...(a.length ? a : [bayGio + (Date.now() - batDau)])); } static now() { return bayGio + (Date.now() - batDau); } };
  const batDau = Date.now();
  const kho = new Map(Object.entries(o.localStorage || {}));
  const luuTru = { getItem: (k) => (kho.has(k) ? kho.get(k) : null), setItem: (k, v) => kho.set(k, String(v)), removeItem: (k) => kho.delete(k), clear: () => kho.clear() };
  const phanTu = () => ({ style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, setAttribute() {}, getAttribute: () => null, appendChild() {}, append() {}, prepend() {},
    addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], insertAdjacentHTML() {}, remove() {}, dataset: {}, innerHTML: '', textContent: '' });
  const document = { readyState: 'loading', cookie: '', referrer: '', title: '', hidden: false, visibilityState: 'visible', documentElement: phanTu(), body: phanTu(), head: phanTu(),
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; }, querySelector: () => null, querySelectorAll: () => [], getElementById: () => null, createElement: phanTu };
  const W = { document, console, Date: DateGia, Math, JSON, Intl, URL, URLSearchParams, Promise, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {}, requestAnimationFrame: () => 0,
    localStorage: luuTru, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} }, navigator: { userAgent: 'node', sendBeacon: () => true, clipboard: {} },
    location: { hostname: 'huongchatkids.vn', host: 'huongchatkids.vn', protocol: 'https:', pathname: '/', search: '', hash: '', href: 'https://huongchatkids.vn/', origin: 'https://huongchatkids.vn' },
    history: { replaceState() {}, pushState() {} }, matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }), addEventListener() {}, removeEventListener() {}, innerWidth: 412, innerHeight: 800,
    fetch: () => Promise.resolve({ ok: true, json: async () => ({}), text: async () => '' }), XMLHttpRequest: class { open() {} send() {} }, IntersectionObserver: class { observe() {} disconnect() {} }, MutationObserver: class { observe() {} disconnect() {} },
    performance: { now: () => 0 }, screen: { width: 412 }, CustomEvent: class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } }, Event: class { constructor(t) { this.type = t; } } };
  W.window = W; W.self = W; W.globalThis = W; W.top = W;
  vm.createContext(W);
  vm.runInContext(fs.readFileSync(path.join(GOC, 'js/data.js'), 'utf8'), W, { filename: 'js/data.js' });
  if (o.truocApp) o.truocApp(W);   // thay dữ liệu TRƯỚC khi app.js chạy (giờ vàng áp giá ngay lúc nạp)
  vm.runInContext(fs.readFileSync(path.join(GOC, 'js/app.js'), 'utf8'), W, { filename: 'js/app.js' });
  if (o.sua) o.sua(W);   // chỉnh dữ liệu cho bài kiểm thử (vd thêm chương trình quà giả)
  return { MC: W.MC, W };
}
module.exports = { taoWeb };
