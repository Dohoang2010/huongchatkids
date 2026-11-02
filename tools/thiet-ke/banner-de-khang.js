// Banner mùa giao mùa: gợi ý sản phẩm hỗ trợ đề kháng cho bé (xanh ngọc + vàng) – pc 1760x760, mb 1200x900
// Ảnh sản phẩm đã tách nền: img/banner/de-khang/*.png
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path');
const W = 'file:///C:/Users/Admin/Desktop/WEB%20KID/', OUT = 'C:/Users/Admin/Desktop/WEB KID/img/banner/';
const SP = [
  ['chuchu', 'Hồng sâm ChuChu', 'Hàn Quốc', 250],
  ['lotte-le', 'Nước ép Lê &amp; Hoa chuông', 'Lotte · Hàn Quốc', 215],
  ['d3k2', 'Vitamin D3K2', 'Pure Vitality · NZ', 300],
  ['kem', 'Kẽm Zinc', 'Pure Vitality · NZ', 300],
];
const css = (pc) => {
  const w = pc ? 1760 : 1200, h = pc ? 760 : 900, s = pc ? 1 : 0.84;
  return `*{margin:0;padding:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;overflow:hidden;font-family:'Be Vietnam Pro',sans-serif;color:#F3EEDF;position:relative;
background:radial-gradient(ellipse at ${pc ? '72% 55%' : '50% 78%'},#1C5E55 0%,#0E3B36 45%,#06211F 100%)}
body:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at ${pc ? '72% 60%' : '50% 80%'},rgba(231,201,133,.20),transparent ${pc ? 38 : 42}%)}
.vien{position:absolute;inset:${pc ? 26 : 22}px;border:1.5px solid rgba(214,178,110,.5);border-radius:6px}
.chu{position:absolute;${pc ? 'left:90px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center' : 'left:70px;right:70px;top:74px'}}
.nhan{font-size:${21 * s}px;letter-spacing:6px;color:#D6B26E;font-weight:600}
.nhan:before{content:'';display:inline-block;width:48px;height:1.5px;background:#D6B26E;vertical-align:middle;margin-right:16px}
h1{font-family:'Playfair Display',serif;font-weight:700;font-size:${80 * s}px;line-height:1.05;margin-top:${20 * s}px;color:#FBF6EA}
h1 em{display:block;font-style:italic;font-weight:600;color:#E7C985;font-size:${68 * s}px;margin-top:6px}
.gach{width:90px;height:2px;background:linear-gradient(90deg,#E7C985,transparent);margin-top:${28 * s}px}
.phu{margin-top:${24 * s}px;font-size:${26 * s}px;line-height:1.5;color:#DCE7E2;max-width:${pc ? 560 : 900}px}
.nut{margin-top:${34 * s}px;display:inline-block;align-self:flex-start;background:linear-gradient(90deg,#E7C985,#C9A15A);color:#0E3B36;font-weight:800;font-size:${26 * s}px;padding:${14 * s}px ${34 * s}px;border-radius:40px;box-shadow:0 8px 24px rgba(0,0,0,.3)}
.sp{position:absolute;display:flex;align-items:flex-end;${pc ? 'left:760px;right:70px;bottom:130px;gap:26px' : 'left:50px;right:50px;bottom:120px;gap:14px'}}
.sp div{flex:1;text-align:center;position:relative}
.sp i{display:flex;align-items:flex-end;justify-content:center;height:${pc ? 310 : 300}px}
.sp img{display:block;object-fit:contain;filter:drop-shadow(0 18px 22px rgba(0,0,0,.45))}
.sp div:after{content:'';position:absolute;left:8%;right:8%;bottom:${pc ? 62 : 58}px;height:22px;border-radius:50%;background:radial-gradient(ellipse,rgba(231,201,133,.45),transparent 70%);z-index:-1}
.sp b{display:block;margin-top:${pc ? 26 : 22}px;font-size:${21 * s}px;color:#FBF6EA;font-weight:600;white-space:nowrap}
.sp small{display:block;margin-top:4px;font-size:${15 * s}px;color:#D6B26E;letter-spacing:.5px;white-space:nowrap}
.ghi{position:absolute;left:${pc ? 90 : 70}px;right:${pc ? 90 : 70}px;bottom:${pc ? 40 : 40}px;font-size:${15 * s}px;color:rgba(220,231,226,.6)}`;
};
const body = (pc) => `<div class="vien"></div>
<div class="chu"><div class="nhan">MÙA GIAO MÙA</div>
<h1>Chăm đề kháng<em>cho con yêu</em></h1><div class="gach"></div>
<div class="phu">Bộ sản phẩm hỗ trợ tăng sức đề kháng* chính hãng Hàn Quốc &amp; New Zealand – mẹ yên tâm chọn cho bé.</div>
${pc ? '<div class="nut">Xem bộ sản phẩm →</div>' : ''}</div>
<div class="sp">${SP.map(([f, ten, xx, cao]) => `<div><i><img src="${W}img/banner/de-khang/${f}.png" style="height:${Math.round(cao * (pc ? 1 : 0.95))}px"></i><b>${ten}</b><small>${xx}</small></div>`).join('')}</div>
<div class="ghi">*Theo nhà sản xuất · Thực phẩm này không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh</div>`;
(async () => {
  const tr = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files'] });
  const pg = await tr.newPage();
  for (const pc of [true, false]) {
    const tam = path.join(__dirname, '_bn.html');
    fs.writeFileSync(tam, `<!doctype html><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;800&family=Playfair+Display:ital,wght@0,700;1,600&display=swap" rel="stylesheet"><style>${css(pc)}</style><body>${body(pc)}</body>`);
    await pg.setViewport({ width: pc ? 1760 : 1200, height: pc ? 760 : 900 });
    await pg.goto('file:///' + tam.replace(/\\/g, '/'), { waitUntil: 'networkidle0' }); await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: OUT + 'de-khang-0211-' + (pc ? 'pc' : 'mb') + '.jpg', type: 'jpeg', quality: 90 });
  }
  await tr.close(); fs.unlinkSync(path.join(__dirname, '_bn.html')); console.log('xong');
})();
