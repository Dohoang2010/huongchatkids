'use strict';
/* TỰ LÀM ẢNH BÌA SẢN PHẨM (Quản trị › Sản phẩm › Ảnh › ✨ Tự làm ảnh bìa)
   POST /api/qt-anh-bia { token | key, anh (base64), cach: 'tu-dong' | 'nen-trang' | 'giu', sang: bool }
   → tách nền (tự động bằng AI / xoá nền trắng / giữ nguyên) → đặt sản phẩm to giữa bục trong khung logo Hương Chất Kids
   (tai-nguyen/khung-bia.png, 800×800) – KHÔNG ghi giá → trả về ảnh bìa 800px + ảnh nhỏ 420px (base64 JPEG) để xem trước.
   Trang quản trị bấm "Dùng ảnh này" mới tải lên GitHub (qua /api/qt-github). Mỗi lần 1 ảnh, tách nền ở tiến trình con. */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');

function taoAnhBia({ bc, ghi, docThan }) {
  let sharp = null; try { sharp = require('sharp'); } catch { /* chưa cài */ }
  const KHUNG = path.join(__dirname, '..', 'tai-nguyen', 'khung-bia.png');
  let dangLam = Promise.resolve();
  const thuMucTam = () => { const d = process.env.ANH_BIA_TAM || path.join(process.env.STATE_DIRECTORY || os.tmpdir(), 'anh-bia-tam'); fs.mkdirSync(d, { recursive: true }); return d; };

  function tachAI(vao, ra) {
    return new Promise((ok, loi) => {
      const c = spawn(process.execPath, [process.env.TACH_NEN_SCRIPT || path.join(__dirname, 'tach-nen.mjs'), vao, ra], { cwd: process.env.TACH_NEN_CWD || path.join(__dirname, '..'), stdio: ['ignore', 'ignore', 'pipe'] });   // thư viện tìm mô hình trong <cwd>/node_modules
      let e = ''; c.stderr.on('data', (d) => { e += d; });
      const hen = setTimeout(() => { c.kill('SIGKILL'); loi(new Error('Tách nền quá lâu, thử lại hoặc chọn "Xoá nền trắng"')); }, 120000);
      c.on('close', (ma) => { clearTimeout(hen); ma === 0 && fs.existsSync(ra) ? ok() : loi(new Error('Tách nền lỗi: ' + e.slice(-200))); });
    });
  }
  /* Nền trắng / rất sáng nối với mép ảnh → trong suốt (ảnh chụp trên nền trắng) */
  async function xoaNenTrang(buf) {
    const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height, seen = new Uint8Array(W * H), q = [];
    const trang = (i) => data[i * 4] > 236 && data[i * 4 + 1] > 236 && data[i * 4 + 2] > 236;
    for (let x = 0; x < W; x++) q.push(x, (H - 1) * W + x); for (let y = 0; y < H; y++) q.push(y * W, y * W + W - 1);
    while (q.length) { const i = q.pop(); if (seen[i] || !trang(i)) continue; seen[i] = 1; data[i * 4 + 3] = 0; const x = i % W, y = (i / W) | 0; if (x > 0) q.push(i - 1); if (x < W - 1) q.push(i + 1); if (y > 0) q.push(i - W); if (y < H - 1) q.push(i + W); }
    return sharp(data, { raw: info }).png().toBuffer();
  }
  /* Ghép vào khung: đáy sản phẩm chạm bục (y 652), tâm x 327, cao ≤ 450, rộng ≤ 430, bóng đổ nhẹ; sang = quầng trắng phía sau (sản phẩm màu nhạt) */
  async function ghep(spPng, sang) {
    const { data, info } = await sharp(spPng).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 3; i < data.length; i += 4) data[i] = data[i] < 60 ? 0 : Math.min(255, Math.round((data[i] - 60) * 255 / 150));
    const sp = await sharp(data, { raw: info }).trim({ threshold: 1 }).png().toBuffer(), m = await sharp(sp).metadata();
    const k = Math.min(450 / m.height, 430 / m.width), w = Math.max(1, Math.round(m.width * k)), h = Math.max(1, Math.round(m.height * k)), day = 652, gx = 327;
    const nho = await sharp(sp).resize(w, h).modulate({ saturation: 1.06 }).sharpen({ sigma: 0.6 }).png().toBuffer();
    const bong = Buffer.from(`<svg width="800" height="800"><defs><filter id="b"><feGaussianBlur stdDeviation="10"/></filter></defs><ellipse cx="${gx}" cy="${day - 3}" rx="${Math.min(w * 0.52, 250)}" ry="16" fill="rgba(120,60,60,.32)" filter="url(#b)"/></svg>`);
    const quang = Buffer.from(`<svg width="800" height="800"><defs><radialGradient id="g"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".55" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><ellipse cx="${gx}" cy="${day - h / 2}" rx="${Math.max(w, h) * 0.62}" ry="${h * 0.62}" fill="url(#g)"/></svg>`);
    const bia = await sharp(KHUNG).resize(800, 800).composite([...(sang ? [{ input: quang, left: 0, top: 0 }] : []), { input: bong, left: 0, top: 0 }, { input: nho, left: Math.round(gx - w / 2), top: day - h }])
      .flatten({ background: '#fff' }).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
    const thumb = await sharp(bia).resize(420, 420).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    return { bia, thumb };
  }

  async function xuLy(req, res, cors, traJson) {
    let d; try { d = JSON.parse(await docThan(req, 15 * 1024 * 1024)); } catch { return traJson(res, 400, { ok: false, msg: 'Dữ liệu gửi lên không hợp lệ' }, cors); }
    const q = await bc.goiHam('qtQuyenGh_', [d.token || '', d.key || '', ['product.update']], { thoiGian: 15000 });
    if (!q || !q.ok) return traJson(res, 200, { ok: false, loi: 'token', msg: 'Phiên quản trị đã hết hạn – đăng nhập lại nhé' }, cors);
    if (!q.co['product.update']) return traJson(res, 200, { ok: false, msg: 'Tài khoản này không có quyền sửa sản phẩm' }, cors);
    if (!sharp) return traJson(res, 200, { ok: false, msg: 'Máy chủ chưa cài thư viện ảnh' }, cors);
    const goc = Buffer.from(String(d.anh || '').replace(/^data:[^,]*,/, ''), 'base64');
    if (goc.length < 1000) return traJson(res, 200, { ok: false, msg: 'Chưa có ảnh' }, cors);
    const lam = async () => {
      const t0 = Date.now(), tam = thuMucTam(), ma = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const vao = path.join(tam, ma + '.png'), ra = path.join(tam, ma + '-ra.png');
      try {
        const chuan = await sharp(goc, { failOn: 'none' }).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).png().toBuffer();
        let sp;
        if (d.cach === 'giu') sp = chuan;
        else if (d.cach === 'nen-trang') sp = await xoaNenTrang(chuan);
        else { fs.writeFileSync(vao, chuan); await tachAI(vao, ra); sp = fs.readFileSync(ra); }
        const { bia, thumb } = await ghep(sp, !!d.sang);
        ghi('Ảnh bìa: ' + q.tk + ' – ' + (d.cach || 'tu-dong') + ' – ' + ((Date.now() - t0) / 1000).toFixed(1) + ' giây');
        return { ok: true, bia: bia.toString('base64'), thumb: thumb.toString('base64'), giay: Math.round((Date.now() - t0) / 100) / 10 };
      } finally { for (const f of [vao, ra]) try { fs.unlinkSync(f); } catch { /* bỏ qua */ } }
    };
    const viec = dangLam.then(lam, lam); dangLam = viec.catch(() => {});   // lần lượt từng ảnh
    try { return traJson(res, 200, await viec, cors); } catch (e) { ghi('LỖI ảnh bìa: ' + e.message); return traJson(res, 200, { ok: false, msg: e.message }, cors); }
  }
  return { xuLy, ghep, xoaNenTrang };
}
module.exports = { taoAnhBia };
