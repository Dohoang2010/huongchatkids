// Banner trang chủ "Dung dịch vệ sinh Hexacare cho bé gái" – pc 1760x760, mb 1200x900 (nền hồng đậm, chữ trắng Baloo 2)
// Chạy trong thư mục có puppeteer-core: node banner-hexacare-be-gai.js <ảnh lọ đã tách nền .png>
const puppeteer = require('puppeteer-core'), fs = require('fs');
const W = 'file:///C:/Users/Admin/Desktop/WEB%20KID/', OUT = 'C:/Users/Admin/Desktop/WEB KID/img/banner/';
const SP = 'data:image/png;base64,' + fs.readFileSync(process.argv[2]).toString('base64');
const CONG_DUNG = [ // [biểu tượng, chữ đậm, chữ thường]
  ['🌸', 'Làm sạch nhẹ nhàng', 'không gây khô da'],
  ['💧', 'pH 4.5', 'phù hợp vùng kín của bé'],
  ['🌿', 'Chiết xuất lá xô thơm', 'dịu nhẹ, lành tính'],
  ['🩺', 'Kiểm nghiệm', 'dưới giám sát phụ khoa'],
];
const html = (pc) => {
  const w = pc ? 1760 : 1200, h = pc ? 760 : 900, s = pc ? 1 : 0.9;
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Be+Vietnam+Pro:wght@500;600;700;800&display=block" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;overflow:hidden;font-family:'Be Vietnam Pro',sans-serif;color:#fff;position:relative;
background:radial-gradient(circle at ${pc ? '78% 45%' : '78% 62%'},#FF8FB8 0,transparent 38%),linear-gradient(120deg,#C2185B 0%,#E91E63 45%,#F06292 100%)}
.cham{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.13) 2.5px,transparent 2.5px);background-size:36px 36px;-webkit-mask-image:linear-gradient(90deg,#000 0,transparent 50%)}
.chu{position:absolute;left:${pc ? 90 : 60}px;top:${pc ? 0 : 50}px;${pc ? 'bottom:0;' : ''}width:${pc ? 940 : 660}px;display:flex;flex-direction:column;justify-content:center}
.hieu{display:inline-flex;align-self:flex-start;align-items:center;gap:12px;background:#fff;border-radius:40px;padding:${9 * s}px ${20 * s}px ${9 * s}px ${10 * s}px;font-weight:800;font-size:${21 * s}px;color:#C2185B;box-shadow:0 8px 20px rgba(80,0,30,.25)}
.hieu img{width:${42 * s}px;height:${42 * s}px;border-radius:50%}
.hieu span{background:#FFD54F;color:#7A0E36;border-radius:20px;padding:3px 14px;font-size:${17 * s}px}
h1{font-family:'Baloo 2',sans-serif;font-weight:800;font-size:${pc ? 84 : 70}px;line-height:.98;margin-top:${22 * s}px;letter-spacing:-.5px;text-shadow:0 4px 0 rgba(120,0,40,.35),0 10px 24px rgba(80,0,30,.3)}
h1 em{display:block;font-style:normal;color:#FFE45C}
.ds{display:grid;grid-template-columns:${pc ? '1fr 1fr' : '1fr'};gap:${12 * s}px ${14 * s}px;margin-top:${26 * s}px}
.o{display:flex;align-items:center;gap:${12 * s}px;background:#fff;border-radius:18px;padding:${11 * s}px ${16 * s}px;box-shadow:0 8px 20px rgba(80,0,30,.22)}
.o i{flex:none;font-style:normal;width:${48 * s}px;height:${48 * s}px;border-radius:14px;background:#FDE4EE;display:grid;place-items:center;font-size:${27 * s}px}
.o div{font-size:${21 * s}px;line-height:1.25;color:#5B3A48;font-weight:600}.o b{display:block;color:#C2185B;font-weight:800;font-size:${23 * s}px}
.mua{display:flex;align-items:center;gap:${22 * s}px;margin-top:${28 * s}px}
.gia{font-family:'Baloo 2';font-weight:800;font-size:${54 * s}px;line-height:1;color:#FFE45C;text-shadow:0 3px 0 rgba(120,0,40,.35)}.gia small{font-family:'Be Vietnam Pro';font-size:${21 * s}px;color:#fff;font-weight:700;text-shadow:none}
.nut{background:#FFE45C;color:#8A0F3D;border-radius:40px;padding:${15 * s}px ${34 * s}px;font-weight:800;font-size:${26 * s}px;box-shadow:0 8px 0 #D4A800,0 14px 26px rgba(80,0,30,.3)}
.vong{position:absolute;border-radius:50%;background:radial-gradient(circle,#fff 0,#FFF0F6 50%,rgba(255,240,246,0) 70%)}
.sp{position:absolute;filter:drop-shadow(0 28px 30px rgba(80,0,30,.4))}
.the{position:absolute;background:#FFE45C;color:#7A0E36;border-radius:50%;display:grid;place-items:center;text-align:center;font-family:'Baloo 2';font-weight:800;line-height:1;box-shadow:0 10px 24px rgba(80,0,30,.3);transform:rotate(-10deg)}
.the small{display:block;font-family:'Be Vietnam Pro';font-size:.36em;font-weight:800;margin-top:4px}
.co{position:absolute;background:#fff;color:#C2185B;border-radius:14px;padding:10px 18px;font-weight:800;font-size:${21 * s}px;box-shadow:0 10px 24px rgba(80,0,30,.25)}
.co b{color:#1E40AF}.co u{text-decoration:none;color:#DC2626}
.chan{position:absolute;left:${pc ? 90 : 60}px;bottom:${pc ? 20 : 26}px;font-size:${15 * s}px;color:rgba(255,255,255,.8)}
</style></head><body><div class="cham"></div>
<div class="chu">
  <div class="hieu"><img src="${W}img/logo.png">Hương Chất Kids<span>MỚI VỀ</span></div>
  <h1>Dung dịch vệ sinh<em>cho bé gái 3–12 tuổi</em></h1>
  <div class="ds">${CONG_DUNG.map((c) => `<div class="o"><i>${c[0]}</i><div><b>${c[1]}</b>${c[2]}</div></div>`).join('')}</div>
  <div class="mua"><div class="gia">195.000đ <small>/ chai 200ml</small></div><div class="nut">Mua ngay →</div></div>
</div>
${pc ? `<div class="vong" style="left:1080px;top:20px;width:720px;height:720px"></div>
<img class="sp" src="${SP}" style="left:1250px;top:50px;height:660px">
<div class="the" style="left:1085px;top:90px;width:170px;height:170px;font-size:62px">pH<br>4.5<small>dịu nhẹ</small></div>
<div class="co" style="left:1480px;top:560px">Sản xuất tại <b>Pháp</b></div>`
  : `<div class="vong" style="left:640px;top:220px;width:620px;height:620px"></div>
<img class="sp" src="${SP}" style="left:800px;top:250px;height:600px">
<div class="the" style="left:1010px;top:330px;width:150px;height:150px;font-size:54px">pH<br>4.5<small>dịu nhẹ</small></div>`}
<div class="chan">Thông tin theo nhà sản xuất · Sản phẩm dùng ngoài</div>
</body></html>`;
};
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage();
  for (const pc of [true, false]) {
    await p.setViewport({ width: pc ? 1760 : 1200, height: pc ? 760 : 900 });
    const f = OUT.replace('img/banner/', '') + '_banner-tam.html'; fs.writeFileSync(f, html(pc)); await p.goto('file:///' + f, { waitUntil: 'networkidle0' }); await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: OUT + 'hexacare-be-gai-v2-' + (pc ? 'pc' : 'mb') + '.jpg', type: 'jpeg', quality: 90 }); fs.unlinkSync(f);
  }
  await b.close(); console.log('xong');
})();
