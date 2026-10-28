// Ảnh mô tả sản phẩm 800x800 (công dụng / thành phần / đối tượng / cách dùng) – đồng bộ cho mọi sản phẩm đăng mới.
// node anh-mo-ta.js <cấu hình .json>   (chạy trong thư mục có puppeteer-core)
// Cấu hình: { ra: 'C:/.../img/', ma: 'hiskin-micellar', anhSp: '<ảnh sản phẩm đã tách nền .png>', mau: '#2E7D32', nhan: 'HISKIN Micellar Water 500ml',
//   the: [ { so: 4, tieuDe: 'Công dụng nổi bật', kieu: 'muc' | 'buoc', muc: [[biểu tượng, tiêu đề, mô tả], ...] } ] }
// Ảnh ra: <ra>/<ma>-<so>.jpg. Câu chữ mỹ phẩm / TPCN: chỉ ghi theo nhà sản xuất, không ghi công dụng chữa bệnh.
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path');
const C = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const WEB = 'file:///C:/Users/Admin/Desktop/WEB%20KID/';
const anh = 'data:image/png;base64,' + fs.readFileSync(C.anhSp).toString('base64');
const html = (t) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Quicksand:wght@700&display=block" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}
body{width:800px;height:800px;overflow:hidden;font-family:'Be Vietnam Pro',sans-serif;color:#1F2A37;position:relative;
background:radial-gradient(circle at 85% 15%,${C.mau}22 0,transparent 45%),radial-gradient(circle at 10% 95%,#FFE3EC 0,transparent 40%),linear-gradient(160deg,#FFFFFF 0%,#F4FAF6 100%)}
.dau{position:absolute;left:44px;top:40px;right:300px}
.logo{display:flex;align-items:center;gap:10px;font-weight:700;font-size:17px;color:#F0537A}.logo img{width:40px;height:40px;border-radius:50%}
h1{font-family:'Quicksand';font-size:42px;line-height:1.1;margin-top:16px;color:${C.mau}}
.nhan{margin-top:8px;font-size:17px;color:#6B7280;font-weight:600}
.sp{position:absolute;right:26px;bottom:40px;height:610px;filter:drop-shadow(0 18px 24px rgba(0,0,0,.18))}
.ds{position:absolute;left:44px;top:200px;width:470px;display:flex;flex-direction:column;gap:16px}
.o{display:flex;gap:14px;align-items:flex-start;background:#fff;border-radius:18px;padding:14px 16px;box-shadow:0 6px 18px rgba(31,42,55,.07);border:1.5px solid ${C.mau}22}
.o i{flex:none;font-style:normal;width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-size:24px;background:${C.mau}14;color:${C.mau};font-weight:800}
.o b{display:block;font-size:19px;color:#1F2A37;line-height:1.25}.o span{display:block;font-size:15px;color:#4B5563;margin-top:3px;line-height:1.4}
.chan{position:absolute;left:44px;bottom:26px;font-size:12.5px;color:#9CA3AF;width:470px}
</style></head><body>
<div class="dau"><div class="logo"><img src="${WEB}img/logo.png">Hương Chất Kids</div><h1>${t.tieuDe}</h1><div class="nhan">${C.nhan}</div></div>
<div class="ds">${t.muc.map((m, i) => `<div class="o"><i>${t.kieu === 'buoc' ? i + 1 : m[0]}</i><div><b>${m[1]}</b>${m[2] ? `<span>${m[2]}</span>` : ''}</div></div>`).join('')}</div>
<img class="sp" src="${anh}">
<div class="chan">${C.chan || 'Thông tin theo nhà sản xuất. Hiệu quả tuỳ cơ địa mỗi người.'}</div>
</body></html>`;
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage(); await p.setViewport({ width: 800, height: 800 });
  const tam = path.join(C.ra, '..', '_the-tam.html');   // đường dẫn ngắn (Chrome không mở được thư mục tạm quá dài)
  for (const t of C.the) {
    fs.writeFileSync(tam, html(t)); await p.goto('file:///' + tam.replace(/\\/g, '/'), { waitUntil: 'networkidle0' }); await p.evaluate(() => document.fonts.ready);
    fs.writeFileSync(path.join(C.ra, C.ma + '-' + t.so + '.jpg'), await p.screenshot({ type: 'jpeg', quality: 88 }));
  }
  fs.unlinkSync(tam); await b.close(); console.log('xong', C.the.length, 'ảnh');
})();
