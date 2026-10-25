// Vẽ ảnh thẻ 1080x1080 (ảnh bình luận / ảnh bổ sung) bằng Chrome. node the.js the.json
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path');
const W = 'file:///C:/Users/Admin/Desktop/WEB%20KID/';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const vnd = (n) => n ? n.toLocaleString('vi-VN') + 'đ' : '';
const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1080px;font-family:'Be Vietnam Pro',sans-serif;color:#2B2B3A;overflow:hidden}
.k{position:relative;width:1080px;height:1080px;background:linear-gradient(160deg,#FFF1F5 0%,#FFFFFF 45%,#E6F7F4 100%);padding:56px 60px}
.top{display:flex;align-items:center;gap:18px}
.logo{width:92px;height:92px;border-radius:50%;background:#fff;box-shadow:0 6px 20px rgba(240,83,122,.25);object-fit:cover}
.ten{font-family:Quicksand;font-weight:700;font-size:38px;color:#F0537A;line-height:1}
.ten small{display:block;font-size:22px;color:#17A398;margin-top:6px;font-weight:700}
.nhan{margin-left:auto;background:#FFB020;color:#fff;font-weight:800;font-size:28px;padding:12px 26px;border-radius:40px;box-shadow:0 6px 16px rgba(255,176,32,.35)}
.giua{display:flex;gap:40px;margin-top:40px;align-items:center}
.anh{flex:0 0 470px;height:470px;border-radius:36px;background:#fff;box-shadow:0 14px 40px rgba(0,0,0,.10);display:flex;align-items:center;justify-content:center;overflow:hidden}
.anh img{width:100%;height:100%;object-fit:contain}
.ph{flex:1}
h1{font-family:Quicksand;font-weight:700;font-size:50px;line-height:1.14;color:#2B2B3A}
h1 em{font-style:normal;color:#F0537A}
.gia{margin-top:26px;font-family:Quicksand;font-weight:700;font-size:74px;color:#F0537A;line-height:1}
.cu{font-size:32px;color:#9A9AA8;text-decoration:line-through;margin-top:8px}
.giam{display:inline-block;margin-top:14px;background:#F0537A;color:#fff;font-weight:800;font-size:28px;padding:8px 18px;border-radius:14px}
ul{list-style:none;margin-top:36px}
li{font-size:31px;line-height:1.35;padding:14px 0 14px 58px;position:relative;border-bottom:2px dashed #F6C9D5}
li:last-child{border-bottom:0}
li:before{content:'✓';position:absolute;left:0;top:12px;width:42px;height:42px;border-radius:50%;background:#17A398;color:#fff;font-weight:800;font-size:26px;display:flex;align-items:center;justify-content:center}
.chan{position:absolute;left:0;right:0;bottom:0;height:120px;background:#F0537A;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 60px;font-family:Quicksand;font-weight:700;font-size:40px}
.chan b{background:#fff;color:#F0537A;padding:10px 26px;border-radius:40px;font-size:32px}
.ghi{position:absolute;left:60px;right:60px;bottom:136px;font-size:21px;color:#6B6B7B;line-height:1.35}
.ct .giua{display:block}
.ct h1{font-size:62px;margin-top:6px}
.ct .hang{display:flex;gap:22px;margin-top:34px}
.ct .hang .anh{flex:1;height:300px;border-radius:28px}
.ct li{font-size:36px}
.buoc li:before{content:counter(b);counter-increment:b;background:#F0537A;width:56px;height:56px;font-size:32px;top:28px}
.buoc{counter-reset:b;margin-top:50px}
.buoc li{font-size:46px;line-height:1.3;padding:30px 0 30px 84px;font-weight:600}
.ct.hd h1{font-size:76px;margin-top:30px}
`;
function html(t) {
  const logo = `<img class="logo" src="${W}img/logo.png">`;
  const dau = `<div class="top">${logo}<div class="ten">Hương Chất Kids<small>Dinh dưỡng Hàn Quốc chính hãng</small></div>${t.nhan ? `<div class="nhan">${esc(t.nhan)}</div>` : ''}</div>`;
  const ds = (t.dong || []).map((d) => `<li>${esc(d)}</li>`).join('');
  const chan = `<div class="chan"><span>🌐 huongchatkids.vn</span><b>☎ 0967 233 003</b></div>` + (t.ghi ? `<div class="ghi">${esc(t.ghi)}</div>` : '');
  let than;
  if (t.kieu === 'ct' || t.kieu === 'hd') {
    const anh = (t.anh || []).slice(0, 3).map((a) => `<div class="anh"><img src="${W}${a}"></div>`).join('');
    than = `<div class="giua"><h1>${t.tieuDe}</h1>${anh ? `<div class="hang">${anh}</div>` : ''}<ul class="${t.kieu === 'hd' ? 'buoc' : ''}">${ds}</ul></div>`;
  } else {
    const pt = t.giaCu && t.gia && t.giaCu > t.gia ? Math.round((1 - t.gia / t.giaCu) * 100) : 0;
    than = `<div class="giua"><div class="anh"><img src="${W}${t.anh[0]}"></div><div class="ph"><h1>${t.tieuDe}</h1>${t.gia ? `<div class="gia">${vnd(t.gia)}</div>` : ''}${pt ? `<div class="cu">${vnd(t.giaCu)}</div><div class="giam">Tiết kiệm ${pt}%</div>` : ''}</div></div><ul>${ds}</ul>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;800&family=Quicksand:wght@600;700&display=swap" rel="stylesheet"><style>${CSS}</style></head><body><div class="k ${t.kieu === 'ct' ? 'ct' : t.kieu === 'hd' ? 'ct hd' : ''}">${dau}${than}${chan}</div></body></html>`;
}
module.exports.ve = async function ve(ds, thuMuc) {
  const tr = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files'] });
  const pg = await tr.newPage(); await pg.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 1 });
  const tam = path.join(thuMuc, '_the.html');
  for (const t of ds) {
    if (fs.existsSync(t.out)) continue;
    fs.writeFileSync(tam, html(t));
    await pg.goto('file:///' + tam.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 60000 });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: t.out, type: 'jpeg', quality: 92 });
  }
  await tr.close();
};
if (require.main === module) module.exports.ve(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), __dirname).then(() => console.log('xong'));
