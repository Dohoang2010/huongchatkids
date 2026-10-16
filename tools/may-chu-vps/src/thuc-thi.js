'use strict';
/* Bộ chạy mã Apps Script (.gs) trên Node.
   - Mỗi lần chạy (1 yêu cầu web / 1 lượt chạy nền) dùng 1 vùng mã mới như Apps Script (biến toàn cục không dính sang lần sau).
   - Các lần chạy nối đuôi nhau, 1 lần 1 lượt → thay cho LockService, không bao giờ trùng điểm / voucher.
   - Ghi dữ liệu xuống PostgreSQL xong mới trả lời và mới gửi mail / Zalo. */
const vm = require('node:vm');
const { GiaoDich } = require('./kho');
const { taoDichVu, khoaYeuCau, anKhoa } = require('./dich-vu');
const { goiNhieu } = require('./goi-mang');

const SO_LAN_CHAY_LAI = 6;

class HangCho {   // khoá 1 lượt
  constructor() { this.duoi = Promise.resolve(); }
  lay() { let tra; const truoc = this.duoi; this.duoi = new Promise((r) => { tra = r; }); return truoc.then(() => tra); }
}

class BoChay {
  constructor(o) {
    this.kho = o.kho;
    this.cauHinh = o.cauHinh || {};
    this.guiDi = o.guiDi || null;               // (hieuUng[]) => void : gửi mail / Zalo sau khi ghi xong
    this.nhatKy = [];                           // 300 dòng nhật ký gần nhất (xem ở /api/_tinh-trang)
    this.hang = new HangCho();
    this.thongKe = { lanChay: 0, chayLai: 0, loi: 0, tongMs: 0 };
    this.dichVu = taoDichVu({ kho: this.kho, gd: () => this.kho.gd, cauHinh: this.cauHinh, ghiNhatKy: (s) => this.ghi(s) });
    this.script = null;
  }
  ghi(s) {
    const dong = new Date().toISOString().slice(11, 19) + ' ' + String(s).slice(0, 2000);
    this.nhatKy.push(dong); if (this.nhatKy.length > 300) this.nhatKy.splice(0, this.nhatKy.length - 300);
    if (!this.cauHinh.imLang) console.log('[gs] ' + dong);
  }
  napMa(ma, tenFile) {
    this.script = new vm.Script(ma + '\n;globalThis.__chay__ = function (f) { return f(); };', { filename: tenFile || 'apps-script.gs' });
  }
  taoVung() {
    const g = Object.assign({}, this.dichVu, { console, __VPS__: true });
    const ctx = vm.createContext(g, { name: 'apps-script' });
    this.script.runInContext(ctx, { timeout: 10000 });
    const NgayVung = vm.runInContext('Date', ctx);
    this.kho.taoNgay = (ms) => new NgayVung(ms);
    return ctx;
  }
  /* goi(ctx) → giá trị trả về của hàm .gs (chạy đồng bộ trong vùng mã) */
  async chay(ten, goi, o = {}) {
    if (!this.script) throw new Error('Chưa nạp mã Apps Script');
    const daLay = new Map(); const t0 = Date.now();
    for (let lan = 0; ; lan++) {
      const tra = await this.hang.lay();
      const gd = new GiaoDich(this.kho);
      gd.daLay = daLay; gd.thieu = []; gd.hieuUng = []; gd.lanCuoi = lan >= SO_LAN_CHAY_LAI; gd.ten = ten;
      this.kho.gd = gd;
      let kq, loi;
      try {
        const ctx = this.taoVung();
        ctx.__ham__ = () => goi(ctx);
        kq = vm.runInContext('__chay__(__ham__)', ctx, { timeout: o.thoiGian || 60000 });
      } catch (e) { loi = e; }
      this.kho.gd = null;
      if (gd.thieu.length && !gd.lanCuoi) {
        gd.hoanTac(); tra(); this.thongKe.chayLai++;
        const ds = gd.thieu;
        const kqMang = await (this.cauHinh.goiMang || goiNhieu)(ds, 10);
        ds.forEach((y, i) => daLay.set(khoaYeuCau(y), kqMang[i]));
        continue;
      }
      try { await this.kho.luu(gd); } catch (e) {
        gd.hoanTac(); tra(); this.thongKe.loi++;
        this.ghi('LỖI ghi PostgreSQL (' + ten + '): ' + (e && e.message));
        throw e;
      }
      tra();
      this.thongKe.lanChay++; this.thongKe.tongMs += Date.now() - t0;
      if (gd.hieuUng.length && this.guiDi) { try { this.guiDi(gd.hieuUng, ten); } catch (e) { this.ghi('Lỗi xếp hàng gửi: ' + e.message); } }
      if (loi) { this.thongKe.loi++; this.ghi('Lỗi chạy ' + ten + ': ' + anKhoa(String(loi && loi.stack || loi)).slice(0, 600)); throw loi; }
      return kq;
    }
  }
  /* ---- tiện ích cho máy chủ web ---- */
  async doGet(thamSo) {
    const e = suKien(thamSo, null);
    const kq = await this.chay('doGet:' + (e.parameter.action || ''), (ctx) => ctx.doGet(e));
    return ketQuaWeb(kq);
  }
  async doPost(thamSo, than, kieu) {
    const e = suKien(thamSo, { contents: than, length: Buffer.byteLength(than || ''), type: kieu || 'text/plain', name: 'postData' });
    const kq = await this.chay('doPost', (ctx) => ctx.doPost(e));
    return ketQuaWeb(kq);
  }
  async goiHam(ten, thamSo = [], o = {}) {
    return this.chay(ten, (ctx) => {
      if (typeof ctx[ten] !== 'function') throw new Error('Không có hàm ' + ten);
      const kq = ctx[ten].apply(null, thamSo);
      return kq === undefined ? undefined : JSON.parse(JSON.stringify(kq));
    }, Object.assign({ thoiGian: 300000 }, o));
  }
}

function suKien(thamSo, postData) {
  const parameter = {}, parameters = {};
  for (const [k, v] of thamSo) { if (!(k in parameter)) parameter[k] = v; (parameters[k] = parameters[k] || []).push(v); }
  const e = { parameter, parameters, queryString: new URLSearchParams(thamSo).toString(), contextPath: '', contentLength: postData ? postData.length : -1, pathInfo: '' };
  if (postData) e.postData = postData;
  return e;
}
function ketQuaWeb(kq) {
  if (kq && kq.__laKetQua) return { kieu: kq.kieu || 'text/plain', noiDung: kq.noiDung };
  return { kieu: 'text/html', noiDung: '<!doctype html><title>Hương Chất Kids</title><p>The script completed but did not return anything.</p>' };
}

module.exports = { BoChay, anKhoa };
