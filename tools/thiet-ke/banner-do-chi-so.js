// Banner trang chủ "Đo chỉ số cho bé" kiểu mới của trang đo (nền hồng–mint, thước hồng, bé 3D img/be) – pc 1760x760, mb 1200x900
// Chạy trong thư mục có puppeteer-core: node banner-do-chi-so.js
const puppeteer = require('puppeteer-core');
const W = 'file:///C:/Users/Admin/Desktop/WEB%20KID/', OUT = 'C:/Users/Admin/Desktop/WEB KID/img/banner/';
const BE = [ // [ảnh, cm, nhãn, phụ, loại]
  ['be-gai', 104, 'Lần trước', 'tháng 4', 'cu'],
  ['be-gai', 112, 'Bé Na', 'hôm nay', 'be'],
  ['be-gai', 109.4, 'Trung bình', 'chuẩn WHO', 'tb'],
];
const html = (pc) => {
  const w = pc ? 1760 : 1200, h = pc ? 760 : 900;
  const canh = pc ? { l: 930, t: 70, w: 760, h: 620 } : { l: 560, t: 300, w: 600, h: 560 };
  const s = pc ? 1 : 0.8, day = 64, maxH = 130, cao = canh.h - day - 120;
  const y = (cm) => (cm / maxH * cao);
  const vach = []; for (let v = 0; v <= maxH; v += 10) vach.push(v);
  const oW = (canh.w - 70) / 3;
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Quicksand:wght@600;700&display=block" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}
body{width:${w}px;height:${h}px;overflow:hidden;font-family:'Be Vietnam Pro',sans-serif;color:#1F2A37;position:relative;
background:radial-gradient(circle at 12% 10%,#FFE3EC 0,transparent 38%),radial-gradient(circle at 85% 90%,#CFF1EA 0,transparent 45%),linear-gradient(135deg,#FFF6F9 0%,#F1FAF8 100%)}
.cham{position:absolute;inset:0;background-image:radial-gradient(rgba(240,83,122,.10) 2px,transparent 2px);background-size:34px 34px;-webkit-mask-image:linear-gradient(90deg,#000 0,transparent 60%)}
.chu{position:absolute;left:${pc ? 90 : 60}px;top:${pc ? 0 : 50}px;${pc ? 'bottom:0;' : ''}width:${pc ? 840 : 1080}px;display:flex;flex-direction:column;justify-content:center}
.hieu{display:inline-flex;align-self:flex-start;align-items:center;gap:12px;background:#fff;border-radius:40px;padding:${10 * s}px ${22 * s}px ${10 * s}px ${12 * s}px;box-shadow:0 6px 20px rgba(240,83,122,.12);font-weight:700;font-size:${23 * s}px;color:#2E8B7A}
.hieu img{width:${44 * s}px;height:${44 * s}px;border-radius:50%}
.hieu span{background:#F0537A;color:#fff;border-radius:20px;padding:4px 14px;font-size:${18 * s}px}
h1{font-family:'Quicksand',sans-serif;font-weight:700;font-size:${pc ? 68 : 76}px;line-height:1.1;margin-top:${26 * s}px;color:#1F6F62;letter-spacing:-1px}
h1 em{display:block;font-style:normal;color:#F0537A}
.phu{margin-top:${18 * s}px;font-size:${27 * s}px;color:#4B5563;line-height:1.45;max-width:${pc ? 780 : 470}px}
.phu b{color:#1F6F62}
.chip{display:grid;grid-template-columns:${pc ? 'repeat(2,auto)' : '1fr'};justify-content:start;gap:${14 * s}px;margin-top:${28 * s}px}
.chip div{max-width:${pc ? 'none' : '470px'};display:flex;align-items:center;gap:14px;background:#fff;border-radius:18px;padding:${12 * s}px ${20 * s}px ${12 * s}px ${12 * s}px;box-shadow:0 4px 14px rgba(31,111,98,.08);border:1.5px solid #E6F4F1}
.chip i{font-style:normal;width:${50 * s}px;height:${50 * s}px;border-radius:14px;display:grid;place-items:center;font-size:${28 * s}px;background:#FFF0F4}
.chip b{display:block;font-size:${21 * s}px;color:#1F2A37}
.chip small{display:block;font-size:${16 * s}px;color:#6B7280;margin-top:2px}
.chip .moi{border-color:#F7B5C7}
.chip .moi b:after{content:'MỚI';margin-left:8px;background:#F0537A;color:#fff;font-size:${12 * s}px;padding:2px 8px;border-radius:10px;vertical-align:middle}
.nut{margin-top:${32 * s}px;align-self:flex-start;background:linear-gradient(90deg,#F0537A,#F57A99);color:#fff;font-weight:800;font-size:${30 * s}px;padding:${18 * s}px ${44 * s}px;border-radius:50px;box-shadow:0 10px 24px rgba(240,83,122,.35)}
.canh{position:absolute;left:${canh.l}px;top:${canh.t}px;width:${canh.w}px;height:${canh.h}px;border-radius:32px;background:linear-gradient(180deg,#FFFFFF 0%,#F4FBF9 100%);box-shadow:0 20px 50px rgba(31,111,98,.14);overflow:hidden}
.canh h3{position:absolute;left:28px;top:22px;font-family:'Quicksand';font-size:${26 * s}px;color:#1F6F62}
.canh h3 small{display:block;font-family:'Be Vietnam Pro';font-weight:500;font-size:${16 * s}px;color:#6B7280;margin-top:2px}
.san{position:absolute;left:70px;right:0;bottom:${day}px;height:3px;background:#EADDE4}
.thuoc{position:absolute;left:0;bottom:${day}px;width:62px;height:${cao}px;border-right:3px solid #F3C6D4;background:repeating-linear-gradient(0deg,transparent 0 ${cao / maxH * 2 - 1}px,rgba(240,83,122,.18) ${cao / maxH * 2 - 1}px ${cao / maxH * 2}px)}
.thuoc span{position:absolute;right:8px;transform:translateY(50%);font-size:${15 * s}px;font-weight:700;color:#9CA3AF}
.thuoc span:after{content:'';position:absolute;left:calc(100% + 9px);top:50%;width:${canh.w}px;border-top:1.5px dashed rgba(0,0,0,.06)}
.o{z-index:1;position:absolute;bottom:0;width:${oW}px;display:flex;flex-direction:column;align-items:center}
.o img{display:block}
.o--cu img{opacity:.45;filter:saturate(.6)}
.o--tb img{opacity:.75;filter:drop-shadow(0 0 0 #fff) saturate(.85)}
.so{position:absolute;transform:translateY(-100%);margin-top:-10px;background:#fff;border-radius:14px;padding:6px 14px;font-weight:800;font-size:${21 * s}px;color:#6B7280;box-shadow:0 4px 12px rgba(0,0,0,.08);white-space:nowrap}
.o--be .so{background:#F0537A;color:#fff;font-size:${26 * s}px;box-shadow:0 8px 18px rgba(240,83,122,.35)}
.o--tb .so{color:#2E8B7A}
.ten{position:absolute;bottom:${-day + 10}px;text-align:center;font-size:${17 * s}px;color:#6B7280;line-height:1.25}
.ten b{display:block;font-size:${19 * s}px;color:#1F2A37}
.vach{z-index:0;position:absolute;left:70px;right:0;border-top:2.5px dashed #F0537A;opacity:.7}
.tem{position:absolute;right:22px;top:20px;background:#E6F7F3;color:#1F6F62;font-weight:700;font-size:${17 * s}px;padding:8px 14px;border-radius:12px}
</style></head><body><div class="cham"></div>
<div class="chu">
  <div class="hieu"><img src="${W}img/logo.png" onerror="this.remove()">Hương Chất Kids<span>Miễn phí</span></div>
  <h1>Bé nhà mình cao, nặng<em>đã chuẩn chưa?</em></h1>
  <div class="phu">Đo chỉ số cho con theo <b>chuẩn WHO</b> – có kết quả ngay sau 1&nbsp;phút</div>
  <div class="chip">
    <div><i>📏</i><span><b>Chiều cao · Cân nặng · BMI</b><small>So với bạn cùng tuổi</small></span></div>
    <div><i>🥗</i><span><b>Chế độ ăn</b><small>Thực đơn theo tuổi</small></span></div>
    <div><i>⚽</i><span><b>Vận động</b><small>Môn hợp bé trai, bé gái</small></span></div>
    <div class="moi"><i>🤸</i><span><b>Tập cùng bé</b><small>Mỗi ngày một bộ bài mới</small></span></div>
  </div>
  <div class="nut">📏 Đo cho bé ngay</div>
</div>
<div class="canh">
  <h3>So với chuẩn WHO<small>Bé gái · 5 tuổi</small></h3>
  <div class="tem">✓ Đạt chuẩn WHO</div>
  <div class="thuoc">${vach.map((v) => `<span style="bottom:${y(v)}px">${v}</span>`).join('')}</div>
  <div class="san"></div>
  ${BE.map(([a, cm, nhan, phu, loai], i) => { const hh = y(cm), ww = hh * 275 / 560;
    return `<div class="o o--${loai}" style="left:${70 + i * oW}px;bottom:${day}px;height:${hh}px">
      <div class="so" style="top:0">${String(cm).replace('.', ',')} cm</div>
      <img src="${W}img/be/${a}-560.webp" style="height:${hh}px;width:${ww}px">
      <div class="ten"><b>${nhan}</b>${phu}</div></div>`; }).join('')}
  <div class="vach" style="bottom:${day + y(112)}px"></div>
</div>
</body></html>`;
};
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  for (const pc of [true, false]) {
    const p = await b.newPage(); await p.setViewport({ width: pc ? 1760 : 1200, height: pc ? 760 : 900 });
    const f = OUT.replace('img/banner/', '') + '_banner-tam.html'; require('fs').writeFileSync(f, html(pc)); await p.goto('file:///' + f, { waitUntil: 'networkidle0' }); await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: OUT + 'do-chi-so-v2-' + (pc ? 'pc' : 'mb') + '.jpg', type: 'jpeg', quality: 88 });
  }
  require('fs').unlinkSync(OUT.replace('img/banner/', '') + '_banner-tam.html'); await b.close(); console.log('xong');
})();
