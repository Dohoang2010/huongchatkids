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
.phu{margin-top:${22 * s}px;font-size:${25 * s}px;color:#F1DCCB;line-height:1.5}
.ma{display:flex;gap:${20 * s}px;margin-top:${30 * s}px}
.ma div{border:1.5px solid #D6B26E;border-radius:14px;padding:${16 * s}px ${24 * s}px;background:rgba(0,0,0,.18);min-width:${250 * s}px}
.ma b{display:block;font-family:'Playfair Display',serif;font-size:${46 * s}px;letter-spacing:4px;color:#E7C985;line-height:1}
.ma small{display:block;margin-top:8px;font-size:${19 * s}px;color:#F1DCCB;line-height:1.35}
.qua{margin-top:${24 * s}px;font-size:${21 * s}px;color:#F1DCCB}
.web{margin-top:${26 * s}px;display:inline-block;align-self:flex-start;background:linear-gradient(90deg,#E7C985,#C9A15A);color:#4A0C17;font-weight:800;font-size:${27 * s}px;letter-spacing:1px;padding:${12 * s}px ${30 * s}px;border-radius:40px}
.ghi{position:absolute;left:${pc ? 90 : 60}px;max-width:${pc ? 1000 : 600}px;line-height:1.4;bottom:${pc ? 38 : 34}px;font-size:${15 * s}px;color:rgba(241,220,203,.75)}`;
};
const body = () => `<div class="anh"><img src="${W}img/chi-huong/chi-huong-do-canxi.jpg"></div><div class="vien"></div>
<div class="chu"><div class="ngay">TỪ 01.11.2026</div>
<h1>Canxi Calciumore<em>chỉ bán trên website</em></h1>
<div class="phu">Dừng bán trên Shopee &amp; TikTok Shop – mua chính hãng tại web</div>
<div class="ma"><div><b>KHSP</b><small>Khách quen Shopee<br>giảm 5%</small></div><div><b>KHTT</b><small>Khách quen TikTok Shop<br>giảm 5%</small></div></div>
<div class="qua">Hoặc mua 2 hộp tặng 1 lọ D3K2 · 3 hộp tặng 2 · 4 hộp tặng 3</div>
<div class="web">huongchatkids.vn</div></div>
<div class="ghi">Mã dùng 1 lần/khách, đến 31/12/2026 · Không cộng dồn, web tự chọn ưu đãi có lợi nhất · Thực phẩm này không phải là thuốc</div>`;
(async () => {
  const tr = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files'] });
  const pg = await tr.newPage();
  for (const pc of [true, false]) {
    const tam = path.join(__dirname, '_bn.html');
    fs.writeFileSync(tam, `<!doctype html><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;800&family=Playfair+Display:ital,wght@0,700;1,600&display=swap" rel="stylesheet"><style>${css(pc)}</style><body>${body()}</body>`);
    await pg.setViewport({ width: pc ? 1760 : 1200, height: pc ? 760 : 900 });
    await pg.goto('file:///' + tam.replace(/\\/g, '/'), { waitUntil: 'networkidle0' }); await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: OUT + 'canxi-chi-web-0111-' + (pc ? 'pc' : 'mb') + '.jpg', type: 'jpeg', quality: 90 });
  }
  await tr.close(); console.log('xong');
})();
