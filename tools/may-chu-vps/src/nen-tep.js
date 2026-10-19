'use strict';
/* JS / CSS bản nén gọn (minify bằng esbuild) cho khách – nginx gửi /js/*.js, /css/*.css sang đây.
   Đọc tệp gốc trong thư mục web (VPS git pull mỗi phút), nén gọn + nén br/gzip, nhớ theo thời điểm sửa tệp
   → sửa mã xong là bản gọn tự đổi theo, không cần bước build. Nén lỗi → trả nguyên tệp gốc. Không đụng js/data.js (trang-web.js lo). */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

function taoNenTep({ thuMuc, ghi }) {
  let esbuild = null;
  try { esbuild = require('esbuild'); } catch { ghi('Nén JS/CSS: chưa có thư viện esbuild – trả tệp gốc'); }
  const nho = new Map();
  const goc = path.resolve(thuMuc);
  function lay(duong) {
    if (!/^\/(js|css)\/[a-zA-Z0-9/_.-]+\.(js|css)$/.test(duong) || duong.includes('..') || duong === '/js/data.js' || duong.startsWith('/js/admin/') || duong.startsWith('/css/admin')) return null;   // trang quản trị: để nguyên tệp gốc
    const tep = path.resolve(goc, '.' + duong);
    if (!tep.startsWith(goc + path.sep)) return null;
    let st; try { st = fs.statSync(tep); } catch { return null; }
    if (!st.isFile()) return null;
    const c = nho.get(duong); if (c && c.luc === st.mtimeMs) return c;
    const ma = fs.readFileSync(tep, 'utf8'), loai = duong.endsWith('.css') ? 'css' : 'js';
    let ra = ma, gon = false;
    if (esbuild && !/\.min\.(js|css)$/.test(duong)) {
      try { ra = esbuild.transformSync(ma, { loader: loai, minify: true, legalComments: 'none', charset: 'utf8' }).code; gon = true; }
      catch (e) { ghi('Nén JS/CSS lỗi ' + duong + ' – trả tệp gốc: ' + (e.message || '').slice(0, 200)); }
    }
    const buf = Buffer.from(ra, 'utf8');
    const kq = { luc: st.mtimeMs, buf, gon, kieu: loai === 'css' ? 'text/css' : 'application/javascript',
      etag: '"' + crypto.createHash('sha1').update(buf).digest('base64url').slice(0, 20) + '"',
      gz: zlib.gzipSync(buf, { level: 9 }), br: zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }) };
    nho.set(duong, kq); if (nho.size > 300) nho.delete(nho.keys().next().value);
    return kq;
  }
  /* Trả tệp; false = không phải tệp của mình (để nginx tự lo) */
  function tra(req, res, duong) {
    const t = lay(duong); if (!t) return false;
    const ae = String(req.headers['accept-encoding'] || '');
    /* có ?v= (đổi tệp là đổi số phiên bản) → giữ lâu 30 ngày; không có → 4 giờ */
    const lau = /[?&]v=/.test(req.url || '');
    const dau = { 'Content-Type': t.kieu + '; charset=utf-8', 'Cache-Control': lau ? 'public, max-age=2592000, immutable' : 'public, max-age=14400', ETag: t.etag, Vary: 'Accept-Encoding', 'X-Content-Type-Options': 'nosniff', 'X-Nen-Gon': t.gon ? '1' : '0' };
    if (req.headers['if-none-match'] === t.etag) { res.writeHead(304, dau); res.end(); return true; }
    const [than, nen] = /\bbr\b/.test(ae) ? [t.br, 'br'] : /\bgzip\b/.test(ae) ? [t.gz, 'gzip'] : [t.buf, null];
    res.writeHead(200, Object.assign(dau, nen ? { 'Content-Encoding': nen } : {}, { 'Content-Length': than.length }));
    res.end(than); return true;
  }
  return { tra, lay };
}

module.exports = { taoNenTep };
