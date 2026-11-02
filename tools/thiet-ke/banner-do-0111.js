// Banner 1/11 (ảnh chị Hương áo đỏ): Canxi Calciumore chỉ bán trên web – pc 1760x760, mb 1200x900
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path');
const W = 'file:///C:/Users/Admin/Desktop/WEB%20KID/', OUT = 'C:/Users/Admin/Desktop/WEB KID/img/banner/';
const css = (pc) => {
  const w = pc ? 1760 : 1200, h = pc ? 760 : 900, anhW = pc ? 640 : 560, chuW = pc ? 980 : 660, s = pc ? 1 : 0.86;
  return `*{margin:0;padding:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;overflow:hidden;font-family:'Be Vietnam Pro',sans-serif;color:#F7EBDD;
background:radial-gradient(ellipse at 20% 30%,#9B1F33 0%,#6E1224 45%,#3E0913 100%);position:relative}
.anh{position:absolute;right:0;top:0;width:${anhW}px;height:${h}px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 26%);mask-image:linear-gradient(90deg,transparent 0,#000 26%)}
.anh img{width:100%;height:100%;object-fit:${pc ? 'cover' : 'cover'};object-position:${pc ? '50% 100%' : '45% 20%'}}
.vien{position:absolute;inset:${pc ? 26 : 22}px;border:1.5px solid rgba(214,178,110,.55);border-radius:6px;pointer-events:none}
.chu{position:absolute;left:${pc ? 90 : 60}px;top:0;bottom:0;width:${chuW}px;display:flex;flex-direction:column;justify-content:center}
.ngay{font-size:${22 * s}px;letter-spacing:6px;color:#D6B26E;font-weight:600}
.ngay:before{content:'';display:inline-block;width:48px;height:1.5px;background:#D6B26E;vertical-align:middle;margin-right:16px}
h1{font-family:'Playfair Display',serif;font-weight:700;font-size:${78 * s}px;line-height:1.05;margin-top:${22 * s}px;color:#FBF3E8}
h1 em{display:block;font-style:italic;font-weight:600;color:#E7C985;font-size:${66 * s}px;margin-top:6px}
.gach{width:${90 * s}px;height:2px;background:linear-gradient(90deg,#E7C985,transparent);margin-top:${30 * s}px}
.phu{margin-top:${26 * s}px;font-size:${28 * s}px;color:#F1DCCB;line-height:1.5;max-width:${pc ? 760 : 620}px}
.phu b{color:#FBF3E8;font-weight:600}
.diem{display:flex;flex-wrap:wrap;gap:${14 * s}px;margin-top:${32 * s}px}
.diem span{border:1px solid rgba(214,178,110,.6);border-radius:40px;padding:${10 * s}px ${22 * s}px;font-size:${20 * s}px;color:#F1DCCB;background:rgba(0,0,0,.15)}
.diem span:before{content:'✦';color:#E7C985;margin-right:10px}
.web{margin-top:${40 * s}px;display:inline-block;align-self:flex-start;background:linear-gradient(90deg,#E7C985,#C9A15A);color:#4A0C17;font-weight:800;font-size:${28 * s}px;letter-spacing:1px;padding:${14 * s}px ${36 * s}px;border-radius:40px;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.ghi{position:absolute;left:${pc ? 90 : 60}px;bottom:${pc ? 38 : 34}px;font-size:${15 * s}px;color:rgba(241,220,203,.6)}`;
};
const body = () => `<div class="anh"><img src="${W}img/chi-huong/chi-huong-do-canxi.jpg"></div><div class="vien"></div>
<div class="chu"><div class="ngay">TỪ 01.11.2026</div>
<h1>Canxi Calciumore<em>chỉ bán trên website</em></h1>
<div class="gach"></div>
<div class="phu">Dừng bán trên Shopee &amp; TikTok Shop.<br><b>Mua chính hãng duy nhất tại website.</b></div>
<div class="diem"><span>Chính hãng Hàn Quốc</span><span>Tư vấn miễn phí</span><span>Giao toàn quốc</span></div>
<div class="web">huongchatkids.vn</div></div>
<div class="ghi">Thực phẩm này không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh</div>`;
(async () => {
  const tr = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files'] });
  const pg = await tr.newPage();
  for (const pc of [true, false]) {
    const tam = path.join(__dirname, '_bn.html');
    fs.writeFileSync(tam, `<!doctype html><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;800&family=Playfair+Display:ital,wght@0,700;1,600&display=swap" rel="stylesheet"><style>${css(pc)}</style><body>${body()}</body>`);
    await pg.setViewport({ width: pc ? 1760 : 1200, height: pc ? 760 : 900 });
    await pg.goto('file:///' + tam.replace(/\\/g, '/'), { waitUntil: 'networkidle0' }); await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: OUT + 'canxi-chi-web-0111b-' + (pc ? 'pc' : 'mb') + '.jpg', type: 'jpeg', quality: 90 });
  }
  await tr.close(); console.log('xong');
})();
