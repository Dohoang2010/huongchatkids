// Banner trang chủ "Dung dịch vệ sinh Hexacare cho bé gái" – pc 1760x760, mb 1200x900
// Chạy trong thư mục có puppeteer-core: node banner-hexacare-be-gai.js <ảnh lọ đã tách nền .png>
const puppeteer = require('puppeteer-core'), fs = require('fs');
const W = 'file:///C:/Users/Admin/Desktop/WEB%20KID/', OUT = 'C:/Users/Admin/Desktop/WEB KID/img/banner/';
const SP = 'data:image/png;base64,' + fs.readFileSync(process.argv[2]).toString('base64');
const html = (pc) => {
  const w = pc ? 1760 : 1200, h = pc ? 760 : 900, s = pc ? 1 : 0.86;
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Quicksand:wght@600;700&display=block" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;overflow:hidden;font-family:'Be Vietnam Pro',sans-serif;color:#3A2A33;position:relative;
background:radial-gradient(circle at 8% 12%,#FFE0EC 0,transparent 40%),radial-gradient(circle at 88% 85%,#E3F4EE 0,transparent 45%),linear-gradient(135deg,#FFF5F9 0%,#FDF0F5 55%,#F3FAF7 100%)}
.cham{position:absolute;inset:0;background-image:radial-gradient(rgba(214,51,108,.09) 2px,transparent 2px);background-size:34px 34px;-webkit-mask-image:linear-gradient(90deg,#000 0,transparent 55%)}
.chu{position:absolute;left:${pc ? 96 : 64}px;top:${pc ? 0 : 56}px;${pc ? 'bottom:0;' : ''}width:${pc ? 900 : 640}px;display:flex;flex-direction:column;justify-content:center}
.hieu{display:inline-flex;align-self:flex-start;align-items:center;gap:12px;background:#fff;border-radius:40px;padding:${10 * s}px ${22 * s}px ${10 * s}px ${12 * s}px;box-shadow:0 6px 20px rgba(214,51,108,.12);font-weight:700;font-size:${22 * s}px;color:#D6336C}
.hieu img{width:${44 * s}px;height:${44 * s}px;border-radius:50%}
.hieu span{background:#D6336C;color:#fff;border-radius:20px;padding:4px 14px;font-size:${17 * s}px}
h1{font-family:'Quicksand',sans-serif;font-weight:700;font-size:${pc ? 70 : 64}px;line-height:1.1;margin-top:${26 * s}px;color:#3A2A33;letter-spacing:-1px}
h1 em{display:block;font-style:normal;color:#D6336C}
.phu{margin-top:${18 * s}px;font-size:${26 * s}px;color:#5B4B54;line-height:1.45;max-width:${pc ? 800 : 620}px}
.ds{display:flex;flex-wrap:wrap;gap:${12 * s}px;margin-top:${26 * s}px;max-width:${pc ? 860 : 620}px}
.ds div{background:#fff;border:2px solid #F7C6D8;border-radius:16px;padding:${10 * s}px ${18 * s}px;font-weight:700;font-size:${22 * s}px;color:#3A2A33}
.ds b{color:#D6336C}
.mua{display:flex;align-items:center;gap:${22 * s}px;margin-top:${32 * s}px}
.gia{font-family:'Quicksand';font-weight:700;font-size:${46 * s}px;color:#D6336C}.gia small{font-size:${22 * s}px;color:#7A6870;font-family:'Be Vietnam Pro';font-weight:600}
.nut{background:linear-gradient(135deg,#F0537A,#D6336C);color:#fff;border-radius:40px;padding:${16 * s}px ${36 * s}px;font-weight:800;font-size:${25 * s}px;box-shadow:0 10px 24px rgba(214,51,108,.3)}
.vong{position:absolute;border-radius:50%;background:radial-gradient(circle,#fff 0,#FFE6EF 55%,rgba(255,230,239,0) 72%)}
.sp{position:absolute;filter:drop-shadow(0 26px 30px rgba(120,40,70,.25))}
.the{position:absolute;background:#fff;border-radius:18px;padding:12px 18px;box-shadow:0 10px 26px rgba(120,40,70,.14);font-weight:700;font-size:${21 * s}px;color:#3A2A33;display:flex;align-items:center;gap:10px}
.the i{font-style:normal;font-size:${28 * s}px}
.chan{position:absolute;left:${pc ? 96 : 64}px;bottom:${pc ? 26 : 30}px;font-size:${15 * s}px;color:#9A8890}
</style></head><body><div class="cham"></div>
<div class="chu">
  <div class="hieu"><img src="${W}img/logo.png">Hương Chất Kids<span>MỚI</span></div>
  <h1>Dung dịch vệ sinh<em>cho bé gái 3–12 tuổi</em></h1>
  <div class="phu">Hexacare sản xuất tại Pháp – làm sạch nhẹ nhàng, không gây khô da, pH phù hợp cho bé.</div>
  <div class="ds"><div><b>pH 4.5</b> dịu nhẹ</div><div>🌿 Chiết xuất xô thơm</div><div>Made in <b>France</b></div></div>
  <div class="mua"><div class="gia">195.000đ <small>/ chai 200ml</small></div><div class="nut">Xem ngay →</div></div>
</div>
${pc ? `<div class="vong" style="left:1060px;top:40px;width:680px;height:680px"></div>
<img class="sp" src="${SP}" style="left:1215px;top:52px;height:640px">
<div class="the" style="left:1020px;top:430px"><i>👧</i>Bé gái 3–12 tuổi</div>
<div class="the" style="left:1430px;top:170px"><i>💧</i>Không gây khô da</div>`
  : `<div class="vong" style="left:620px;top:200px;width:620px;height:620px"></div>
<img class="sp" src="${SP}" style="left:790px;top:230px;height:600px">
<div class="the" style="left:690px;top:640px"><i>👧</i>Bé gái 3–12 tuổi</div>`}
<div class="chan">Thông tin theo nhà sản xuất. Sản phẩm dùng ngoài.</div>
</body></html>`;
};
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  for (const pc of [true, false]) {
    await p.setViewport({ width: pc ? 1760 : 1200, height: pc ? 760 : 900 });
    const f = OUT.replace('img/banner/', '') + '_banner-tam.html'; fs.writeFileSync(f, html(pc)); await p.goto('file:///' + f, { waitUntil: 'networkidle0' }); await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: OUT + 'hexacare-be-gai-' + (pc ? 'pc' : 'mb') + '.jpg', type: 'jpeg', quality: 88 }); fs.unlinkSync(f);
  }
  await b.close(); console.log('xong');
})();
