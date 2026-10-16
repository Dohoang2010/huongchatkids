'use strict';
/* Máy chủ API Hương Chất Kids trên VPS – thay cho Google Apps Script web app.
   Chạy chính file Apps Script của shop (doGet/doPost) trên Node + PostgreSQL. Cấu hình: /etc/hck-api/env (xem README). */
process.env.TZ = process.env.TZ || 'Asia/Ho_Chi_Minh';
const http = require('node:http');
const fs = require('node:fs');
const { Pool } = require('pg');
const { Kho } = require('./kho');
const { BoChay } = require('./thuc-thi');
const { taoGuiDi } = require('./gui-di');
const { layTuAppsScript, doiChieuBam } = require('./nhap');

const E = process.env;
const cauHinh = {
  cong: Number(E.CONG || 3100),
  gsFile: E.GS_FILE || '/var/www/huongchatkids/tools/apps-script.gs',   // bản mẫu công khai, VPS tự git pull mỗi phút
  cheDo: E.CHE_DO === 'chinh' ? 'chinh' : 'song-song',
  appsScriptUrl: E.APPS_SCRIPT_URL || '',
  vpsKhoa: E.VPS_KHOA || '',
  noiBoKhoa: E.NOI_BO_KHOA || '',
  nhapPhut: Number(E.NHAP_PHUT || 15),
  lich30: (E.LICH_30P || 'dongBoCRMTuDong').split(',').map((s) => s.trim()).filter(Boolean),
  lichNgay: (E.LICH_NGAY || '').split(',').map((s) => s.trim()).filter(Boolean),   // vd "donRacOtp@03:10"
  nguon: (E.NGUON_CHO_PHEP || 'https://huongchatkids.vn,https://www.huongchatkids.vn').split(',').map((s) => s.trim()),
  diaChiCongKhai: E.DIA_CHI_CONG_KHAI || '',
  emailChu: E.EMAIL_CHU || 'huongchatkids@gmail.com',
  mailThu: (E.MAIL_THU || 'huongchatkids@gmail.com').toLowerCase().split(',').map((s) => s.trim()).filter(Boolean),   // chạy thử: chỉ gửi thật tới các địa chỉ này
  smtp: E.SMTP_HOST ? { host: E.SMTP_HOST, port: Number(E.SMTP_PORT || 465), user: E.SMTP_USER, pass: E.SMTP_PASS, from: E.SMTP_FROM } : null
};

const pool = new Pool({ max: 4 });   // PGHOST / PGUSER / PGDATABASE lấy từ biến môi trường
const kho = new Kho({ pool });
const nhatKyHeThong = [];
const ghi = (s) => { const d = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' ' + s; console.log(d); nhatKyHeThong.push(d); if (nhatKyHeThong.length > 200) nhatKyHeThong.shift(); };
const guiDi = taoGuiDi({ pool, cauHinh, ghi });
const bc = new BoChay({ kho, cauHinh, guiDi });
const trangThai = { batDau: Date.now(), lanNhap: null, lanNhapLoi: null, doiChieu: null, lich: {}, dangNhap: false };

function napMa() {
  const ma = fs.readFileSync(cauHinh.gsFile, 'utf8');
  bc.napMa(ma, 'apps-script.gs');   // lỗi cú pháp → ném lỗi, giữ bản cũ
  trangThai.maLuc = fs.statSync(cauHinh.gsFile).mtime.toISOString();
}
/* Mã Apps Script đổi trên GitHub (VPS kéo về mỗi phút) → nạp lại, lần chạy sau dùng mã mới */
function theoDoiMa() {
  setInterval(() => {
    try { const luc = fs.statSync(cauHinh.gsFile).mtime.toISOString(); if (luc !== trangThai.maLuc) { napMa(); ghi('Đã nạp lại mã Apps Script (sửa lúc ' + luc + ')'); } }
    catch (e) { ghi('LỖI nạp lại mã Apps Script, vẫn chạy bản cũ: ' + e.message); try { trangThai.maLuc = fs.statSync(cauHinh.gsFile).mtime.toISOString(); } catch (e2) { /* bỏ qua */ } }
  }, 30000).unref();
}

/* ---- chép dữ liệu từ Google Sheets (chế độ song song / ngày đổi) ---- */
async function nhapTuSheets(lyDo) {
  if (cauHinh.cheDo === 'chinh') throw new Error('Đang ở chế độ chính – VPS giữ dữ liệu thật, không chép đè từ Google Sheets');
  if (trangThai.dangNhap) throw new Error('Đang chép dữ liệu, đợi xong lượt trước');
  trangThai.dangNhap = true; const t0 = Date.now();
  try {
    ghi('Bắt đầu chép dữ liệu từ Google Sheets (' + lyDo + ')');
    const du = await layTuAppsScript(cauHinh, ghi);
    const tra = await bc.hang.lay();          // chặn mọi lần chạy trong lúc thay dữ liệu
    try { await kho.thayToanBo(du); } finally { tra(); }
    const tong = du.trang.reduce((s, t) => s + t.giaTri.length, 0);
    trangThai.lanNhap = { luc: Date.now(), ms: Date.now() - t0, trang: du.trang.length, dong: tong, lyDo };
    await pool.query('INSERT INTO lan_nhap (nguon, ket_qua) VALUES ($1,$2)', ['apps-script', JSON.stringify(trangThai.lanNhap)]);
    ghi('Chép xong ' + du.trang.length + ' trang, ' + tong + ' dòng trong ' + (Date.now() - t0) + ' ms');
    return trangThai.lanNhap;
  } catch (e) { trangThai.lanNhapLoi = { luc: Date.now(), loi: e.message }; ghi('LỖI chép dữ liệu: ' + e.message); throw e; }
  finally { trangThai.dangNhap = false; }
}

/* ---- lịch chạy nền (chế độ chính) ---- */
async function chayNen(ten) {
  if (trangThai.lich[ten] && trangThai.lich[ten].dangChay) return;
  const l = trangThai.lich[ten] = Object.assign(trangThai.lich[ten] || {}, { dangChay: true, batDau: Date.now() });
  try { await bc.goiHam(ten, [], { thoiGian: 330000 }); l.ketQua = 'ok'; }
  catch (e) { l.ketQua = 'lỗi: ' + e.message; ghi('LỖI chạy nền ' + ten + ': ' + e.message); }
  finally { l.dangChay = false; l.xong = Date.now(); }
}
function batLich() {
  let phutTruoc = -1;
  setInterval(() => {
    const d = new Date(); const phut = d.getHours() * 60 + d.getMinutes(); if (phut === phutTruoc) return; phutTruoc = phut;
    if (cauHinh.cheDo === 'chinh') {
      if (d.getMinutes() % 30 === 7) cauHinh.lich30.forEach((ten) => chayNen(ten));
      for (const x of cauHinh.lichNgay) { const [ten, gio] = x.split('@'); const [h, m] = (gio || '03:10').split(':').map(Number); if (d.getHours() === h && d.getMinutes() === m) chayNen(ten); }
    } else if (cauHinh.nhapPhut > 0 && phut % cauHinh.nhapPhut === 0) {
      nhapTuSheets('tự động ' + cauHinh.nhapPhut + ' phút').catch(() => {});
    }
  }, 15000).unref();
}

/* ---- máy chủ web ---- */
const DAU_CHUNG = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
function tra(res, ma, kieu, noiDung, them) { res.writeHead(ma, Object.assign({ 'Content-Type': kieu + '; charset=utf-8' }, DAU_CHUNG, them || {})); res.end(noiDung); }
function traJson(res, ma, o, them) { tra(res, ma, 'application/json', JSON.stringify(o), them); }
function docThan(req, toiDa = 4 * 1024 * 1024) {
  return new Promise((ok, loi) => {
    const ds = []; let n = 0;
    req.on('data', (c) => { n += c.length; if (n > toiDa) { loi(new Error('Dữ liệu quá lớn')); req.destroy(); } else ds.push(c); });
    req.on('end', () => ok(Buffer.concat(ds).toString('utf8'))); req.on('error', loi);
  });
}
const laNoiBo = (req) => !!cauHinh.noiBoKhoa && req.headers['x-noi-bo'] === cauHinh.noiBoKhoa;

const mayChu = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const nguon = req.headers.origin;
  const cors = nguon && (cauHinh.nguon.includes(nguon) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(nguon)) ? { 'Access-Control-Allow-Origin': nguon, Vary: 'Origin' } : {};
  const duongDan = url.pathname.replace(/\/+$/, '');
  try {
    if (req.method === 'OPTIONS') { res.writeHead(204, Object.assign({ 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' }, cors)); return res.end(); }
    if (duongDan === '/api' || duongDan === '/api/exec') {
      if (req.method === 'GET') {
        const kq = await bc.doGet(url.searchParams);
        return tra(res, 200, kq.kieu, kq.noiDung, cors);
      }
      if (req.method === 'POST') {
        const than = await docThan(req);
        const kq = await bc.doPost(url.searchParams, than, (req.headers['content-type'] || 'text/plain').split(';')[0]);
        return tra(res, 200, kq.kieu, kq.noiDung, cors);
      }
      return traJson(res, 405, { ok: false });
    }
    /* Trang quản trị vừa lưu lên GitHub → báo VPS kéo bản mới NGAY (systemd path hck-keo-web-ngay theo dõi file này).
       Không cần khoá: chỉ khiến VPS git pull sớm hơn lịch 1 phút; tối đa 1 lần / 3 giây. Kéo thêm lần nữa sau 8 giây phòng GitHub chậm. */
    if (duongDan === '/api/keo-web') {
      const bay = Date.now();
      if (bay - (trangThai.keoWebLuc || 0) > 3000) {
        trangThai.keoWebLuc = bay;
        const bao = () => { try { fs.writeFileSync('/run/hck-api/keo-web', String(Date.now())); } catch (e) { ghi('keo-web: ' + e.message); } };
        bao(); setTimeout(bao, 8000).unref();
      }
      return traJson(res, 200, { ok: true }, cors);
    }
    if (duongDan === '/api/suc-khoe') return traJson(res, 200, { ok: true, cheDo: cauHinh.cheDo, luc: Date.now(), lanNhap: trangThai.lanNhap ? trangThai.lanNhap.luc : null });
    /* ---- nội bộ (cần khoá NOI_BO_KHOA; nginx không cho ra ngoài) ---- */
    if (duongDan.startsWith('/noi-bo/')) {
      if (!laNoiBo(req)) return traJson(res, 403, { ok: false });
      const viec = duongDan.slice(8);
      if (viec === 'tinh-trang') return traJson(res, 200, { ok: true, cheDo: cauHinh.cheDo, trangThai, thongKe: bc.thongKe, bangTinh: kho.trang.map((t) => t.ten + ': ' + t.getLastRow()),
        nhatKyHeThong: nhatKyHeThong.slice(-60), nhatKyGs: bc.nhatKy.slice(-60), boNho: Math.round(process.memoryUsage().rss / 1048576) + ' MB', smtp: !!cauHinh.smtp });
      if (viec === 'nhap' && req.method === 'POST') return traJson(res, 200, { ok: true, kq: await nhapTuSheets('gọi tay') });
      if (viec === 'doi-chieu') { trangThai.doiChieu = await doiChieuBam(cauHinh, kho); return traJson(res, 200, Object.assign({ ok: true }, trangThai.doiChieu)); }
      if (viec === 'anh-chup') return traJson(res, 200, { ok: true, muiGio: kho.muiGio, ngonNgu: kho.ngonNgu, trang: kho.anhChup(), thuocTinh: Object.fromEntries(kho.thuocTinh) });
      if (viec === 'chay' && req.method === 'POST') { const ten = url.searchParams.get('ham'); return traJson(res, 200, { ok: true, kq: await bc.goiHam(ten, JSON.parse(url.searchParams.get('thamSo') || '[]'), { thoiGian: 330000 }) }); }
      if (viec === 'nap-ma' && req.method === 'POST') { napMa(); return traJson(res, 200, { ok: true, maLuc: trangThai.maLuc }); }
      return traJson(res, 404, { ok: false });
    }
    traJson(res, 404, { ok: false, msg: 'Không có' });
  } catch (e) {
    ghi('LỖI yêu cầu ' + req.method + ' ' + duongDan + ': ' + (e && e.message));
    const cb = url.searchParams.get('callback') || '';
    const loi = { ok: false, msg: 'Máy chủ đang bận, mẹ thử lại sau ít phút nhé' };
    if (!res.headersSent) {
      if (/^[A-Za-z_$][\w$]*$/.test(cb)) tra(res, 200, 'application/javascript', cb + '(' + JSON.stringify(loi) + ');', cors);
      else traJson(res, 500, loi, cors);
    }
  }
});

(async () => {
  napMa();
  const kq = await kho.taiTuPG();
  ghi('Đã tải ' + kq.trang + ' trang tính, ' + kq.dong + ' dòng từ PostgreSQL. Chế độ: ' + cauHinh.cheDo + (cauHinh.smtp ? ', có SMTP' : ', mail nhờ Apps Script gửi'));
  if (!kq.dong && cauHinh.appsScriptUrl && cauHinh.cheDo !== 'chinh') await nhapTuSheets('lần đầu').catch(() => {});
  batLich(); theoDoiMa();
  mayChu.listen(cauHinh.cong, '127.0.0.1', () => ghi('Máy chủ API chạy ở 127.0.0.1:' + cauHinh.cong));
})().catch((e) => { console.error('Không khởi động được:', e); process.exit(1); });

process.on('SIGTERM', () => { ghi('Dừng máy chủ'); mayChu.close(); bc.hang.lay().then(() => pool.end()).then(() => process.exit(0)); setTimeout(() => process.exit(0), 10000).unref(); });
