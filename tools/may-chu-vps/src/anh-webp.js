'use strict';
/* Ảnh WebP tự tạo trên VPS: quét thư mục img/ của web (VPS git pull mỗi phút), ảnh .jpg/.png nào chưa có bản WebP
   (hoặc vừa đổi) thì tạo bản WebP nhẹ hơn ở /var/lib/hck-api/webp (nginx phục vụ ở /webp/). Ảnh gốc giữ nguyên.
   Tên tệp kèm dấu thời gian sửa của ảnh gốc → ảnh đổi thì link đổi, Cloudflare / trình duyệt không giữ ảnh cũ.
   data.js bản gọn + trang dựng sẵn đổi "img/x.jpg" → "/webp/img/x-<dấu>.webp" khi đã có bản WebP. */
const fs = require('node:fs');
const path = require('node:path');

function taoAnhWebp({ thuMucWeb, thuMucRa, ghi }) {
  let sharp = null;
  try { sharp = require('sharp'); sharp.concurrency(1); sharp.cache(false); } catch (e) { ghi('WebP: chưa có thư viện sharp – dùng ảnh gốc'); }
  const bang = new Map();   // 'img/a/b.jpg' → '/webp/img/a/b-<dấu>.webp'
  let dangChay = false, phienBan = 0;
  const dau = (ms) => Math.floor(ms / 1000).toString(36);

  function quetTep(goc, rel, ra) {
    let ds; try { ds = fs.readdirSync(path.join(goc, rel), { withFileTypes: true }); } catch { return; }
    for (const d of ds) {
      const r = rel ? rel + '/' + d.name : d.name;
      if (d.isDirectory()) quetTep(goc, r, ra);
      else if (/\.(jpe?g|png)$/i.test(d.name)) ra.push(r);
    }
  }
  /* Đọc bảng từ các tệp đã tạo (khởi động lại không phải tạo lại) */
  function napBang() {
    const ds = []; quetTep(thuMucWeb, 'img', ds); let doi = 0;
    for (const r of ds) {
      let st; try { st = fs.statSync(path.join(thuMucWeb, r)); } catch { continue; }
      const ten = r.replace(/\.(jpe?g|png)$/i, '') + '-' + dau(st.mtimeMs) + '.webp';
      if (fs.existsSync(path.join(thuMucRa, ten))) { const u = '/webp/' + ten; if (bang.get(r) !== u) { bang.set(r, u); doi++; } }
      else if (bang.has(r)) { bang.delete(r); doi++; }
    }
    return { ds, doi };
  }
  async function chay() {
    if (!sharp || dangChay) return; dangChay = true;
    try {
      const { ds } = napBang(); let tao = 0, boQua = 0;
      for (const r of ds) {
        if (bang.has(r)) continue;
        const goc = path.join(thuMucWeb, r), st = fs.statSync(goc);
        if (Date.now() - st.mtimeMs < 20000) continue;   // ảnh đang được ghi dở
        const ten = r.replace(/\.(jpe?g|png)$/i, '') + '-' + dau(st.mtimeMs) + '.webp', ra = path.join(thuMucRa, ten);
        if (fs.existsSync(ra + '.bo-qua')) continue;   // đã thử: WebP không nhẹ hơn ảnh gốc
        try {
          fs.mkdirSync(path.dirname(ra), { recursive: true });
          const buf = await sharp(goc, { failOn: 'none' }).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
            .webp({ quality: /\.png$/i.test(r) ? 85 : 78, effort: 4 }).toBuffer();
          if (buf.length > st.size * 0.92) { boQua++; fs.writeFileSync(ra + '.bo-qua', ''); continue; }   // WebP không nhẹ hơn: giữ ảnh gốc
          fs.writeFileSync(ra + '.tmp', buf); fs.renameSync(ra + '.tmp', ra);
          /* xoá bản WebP cũ của cùng ảnh */
          const coSo = path.basename(r).replace(/\.(jpe?g|png)$/i, '');
          for (const f of fs.readdirSync(path.dirname(ra))) if (f !== path.basename(ra) && f.startsWith(coSo + '-') && /^[a-z0-9]+\.webp(\.bo-qua)?$/.test(f.slice(coSo.length + 1))) fs.unlinkSync(path.join(path.dirname(ra), f));
          bang.set(r, '/webp/' + ten); tao++;
        } catch (e) { ghi('WebP lỗi ' + r + ': ' + e.message); try { fs.writeFileSync(ra + '.bo-qua', ''); } catch { /* bỏ qua */ } }
      }
      if (tao) { phienBan++; ghi('WebP: tạo ' + tao + ' ảnh' + (boQua ? ', giữ ảnh gốc ' + boQua : '') + ', tổng ' + bang.size); }
    } catch (e) { ghi('WebP: ' + e.message); } finally { dangChay = false; }
  }
  return {
    batDau() {
      try { fs.mkdirSync(thuMucRa, { recursive: true }); } catch (e) { ghi('WebP: ' + e.message); return; }
      napBang(); phienBan++;
      const lan = () => chay().catch(() => {});
      setTimeout(lan, 15000).unref(); setInterval(lan, 5 * 60000).unref();
    },
    duong: (rel) => bang.get(String(rel || '').replace(/^\/+/, '').split('?')[0]) || null,
    get phienBan() { return phienBan; },
    get so() { return bang.size; },
    chay
  };
}

module.exports = { taoAnhWebp };
