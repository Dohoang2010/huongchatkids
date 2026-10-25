// Poster cảm ơn 2 mặt gửi kèm đơn – A5 (148x210mm): PNG 300dpi từng mặt + PDF 2 trang để in
const puppeteer = require('puppeteer-core'), fs = require('fs'), path = require('path'), QR = require('qrcode'), sharp = require('sharp');
const WEB = 'C:/Users/Admin/Desktop/WEB KID/', OUT = 'C:/Users/Admin/Desktop/Poster cam on gui kem don/';
fs.mkdirSync(OUT, { recursive: true });
const u = (p) => 'file:///' + p.split(String.fromCharCode(92)).join('/').replace(/ /g, '%20');
(async () => {
  const qr = async (txt) => 'data:image/png;base64,' + (await QR.toBuffer(txt, { width: 600, margin: 1, color: { dark: '#2B2B3A', light: '#FFFFFF' } })).toString('base64');
  const cat = async (f) => 'data:image/jpeg;base64,' + (await sharp(fs.readFileSync(WEB + f)).extract({ left: 280, top: 610, width: 700, height: 700 }).jpeg({ quality: 92 }).toBuffer()).toString('base64');
  const qZaloOA = await qr('https://zalo.me/2560253151670008554'), qWeb = await qr('https://huongchatkids.vn/?nguon=poster'), qDoiTac = await qr('https://huongchatkids.vn/doi-tac.html?nguon=poster');
  const qCongDong = await cat('img/qr/zalo-cong-dong.jpg'), qNhomDT = await cat('img/qr/zalo-doi-tac.jpg');
  const css = `@page{size:148mm 210mm;margin:0}*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Be Vietnam Pro',sans-serif;color:#3A2A2E}
.trang{width:148mm;height:210mm;position:relative;overflow:hidden;page-break-after:always}
.t1{background:linear-gradient(180deg,#FFF8F2 0%,#FDEDEF 100%)}
.vien{position:absolute;inset:5mm;border:0.4mm solid #C9A15A;border-radius:3mm}
.anh{position:absolute;left:0;right:0;top:0;height:128mm;overflow:hidden}
.anh img{width:118%;margin-left:-6%;height:100%;object-fit:cover;object-position:50% 14%;filter:contrast(1.03)}
.anh:after{content:'';position:absolute;left:0;right:0;bottom:0;height:30mm;background:linear-gradient(180deg,rgba(255,248,242,0),#FFF8F2)}
.logo{position:absolute;left:50%;top:119mm;transform:translateX(-50%);width:20mm;height:20mm;border-radius:50%;background:#fff;border:0.5mm solid #C9A15A;overflow:hidden}
.logo img{width:100%;height:100%;object-fit:cover}
.noi{position:absolute;left:12mm;right:12mm;top:141mm;text-align:center}
.nho{font-size:3.2mm;letter-spacing:1.2mm;color:#B08843;font-weight:600}
h1{font-family:'Playfair Display',serif;font-size:9.5mm;line-height:1.1;color:#8E1B2C;margin-top:2mm}
h1 em{display:block;font-style:italic;font-weight:600;font-size:8mm;color:#B08843}
.thu{font-size:3.2mm;line-height:1.5;margin-top:3mm;color:#4A3A3E}
.ky{font-family:'Playfair Display',serif;font-style:italic;font-size:5mm;color:#8E1B2C;margin-top:3mm}
.zalo{position:absolute;left:12mm;right:12mm;bottom:12mm;display:flex;align-items:center;gap:4mm;background:#fff;border-radius:3mm;padding:3mm 4mm;box-shadow:0 0.6mm 2mm rgba(142,27,44,.12)}
.zalo img{width:24mm;height:24mm}.zalo b{display:block;font-size:3.8mm;color:#1E6FD9}.zalo span{font-size:3mm;line-height:1.45;display:block}
.t2{background:#FFFDF9;padding:7mm 9mm}
.t2 h2{font-family:'Playfair Display',serif;font-size:7mm;color:#8E1B2C;text-align:center;line-height:1.15}
.t2 h2 em{color:#B08843;font-style:italic}
.luoi{display:grid;grid-template-columns:1fr 1fr;gap:1.6mm 3mm;margin-top:3.5mm}
.luoi div{font-size:2.65mm;line-height:1.3;background:#FDF1F3;border-radius:2mm;padding:1.4mm 2.2mm}.luoi b{color:#8E1B2C;display:block;font-size:2.9mm}
.ve{margin-top:3.5mm;border:0.5mm dashed #8E1B2C;border-radius:3mm;background:linear-gradient(90deg,#8E1B2C,#B3263C);color:#FBF3E8;display:flex;align-items:center;padding:3mm 4mm;gap:4mm}
.ve .so{font-family:'Playfair Display',serif;font-size:9mm;color:#E7C985;line-height:1}.ve .ma{font-size:3mm;line-height:1.45}.ve .ma b{font-size:4.6mm;letter-spacing:0.8mm;color:#fff;background:rgba(0,0,0,.2);padding:0.3mm 2mm;border-radius:1.2mm}
.qr{display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-top:3.5mm}
.qr .o{border:0.35mm solid #E7D3B0;border-radius:3mm;padding:2.5mm;text-align:center;background:#fff}
.qr .o img{width:25mm;height:25mm;display:block;margin:1.5mm auto}
.qr .o b{display:block;font-size:3.1mm;color:#8E1B2C}.qr .o span{display:block;font-size:2.5mm;line-height:1.35;color:#555}
.dt{margin-top:3mm;background:#FDF1F3;border-radius:3mm;padding:2.6mm 4mm}.dt>b{font-size:3.3mm;color:#8E1B2C}.dt ol{margin:1.2mm 0 0 4.5mm;font-size:2.7mm;line-height:1.45}.dt i{font-style:normal;font-weight:700;color:#8E1B2C}.dt u{text-decoration:none;font-weight:700}
.chan{position:absolute;left:9mm;right:9mm;bottom:6mm;display:flex;align-items:center;justify-content:space-between;font-size:2.7mm;color:#6B5B5F;border-top:0.3mm solid #E7D3B0;padding-top:2mm}
.chan img{width:13mm;height:13mm}.chan b{color:#8E1B2C;font-size:3.6mm}`;
  const mat1 = `<div class="trang t1"><div class="anh"><img src="${u(WEB + 'img/chi-huong/chi-huong-trang-sang-in.jpg')}"></div><div class="vien"></div>
<div class="logo"><img src="${u(WEB + 'img/logo.png')}"></div>
<div class="noi"><div class="nho">HƯƠNG CHẤT KIDS</div><h1>Cảm ơn mẹ<em>đã tin chọn Hương</em></h1>
<div class="thu">Mỗi đơn hàng mẹ gửi gắm là một niềm tin Hương luôn trân trọng. Chúc mẹ và bé thật nhiều sức khoẻ, bé ăn ngoan, chóng lớn, mỗi ngày đều vui. Có bất cứ điều gì cần hỏi về sản phẩm hay cách dùng, mẹ cứ nhắn Hương nhé 💗</div>
<div class="ky">Thương mến, Hương</div></div>
</div>`;
  const ly = [['Chính hãng 100%', 'Hoàn tiền 100% nếu phát hiện hàng giả'], ['Kiểm hàng khi nhận', 'Thanh toán khi nhận hàng hoặc VietQR · đổi trả 7 ngày'],
    ['Tích điểm mỗi đơn', '1 điểm = 1đ, dùng giảm đến 10% đơn sau'], ['Điểm danh nhận quà', '1.000 điểm mỗi ngày · voucher ngày đôi & chuỗi ngày'],
    ['Hạng thành viên', 'Giảm 5% – 12% mọi đơn theo tổng chi tiêu'], ['Sinh nhật bé', 'Tháng sinh nhật bé giảm 10% mọi đơn'],
    ['Đo chỉ số bé miễn phí', 'Chiều cao, cân nặng theo chuẩn WHO'], ['Freeship từ 3 triệu', 'Hà Nội có giao hoả tốc trong ngày']];
  const mat2 = `<div class="trang t2"><h2>Mua tại <em>huongchatkids.vn</em><br>mẹ được nhiều hơn</h2>
<div class="luoi">${ly.map(([a, b]) => `<div><b>✓ ${a}</b>${b}</div>`).join('')}</div>
<div class="ve"><div class="so">-30K</div><div class="ma">Quà cảm ơn mẹ đã mua hàng: nhập mã <b>CAMON30</b> khi đặt trên web<br>Giảm 30.000đ cho đơn từ 200.000đ · mỗi khách dùng 1 lần</div></div>
<div class="qr"><div class="o"><b>Cộng đồng Zalo Hương Chất Kids</b><img src="${qCongDong}"><span>Mẹo nuôi con, ưu đãi mới sớm nhất cho mẹ</span></div>
<div class="o"><b>Kinh doanh cùng Hương Chất Kids</b><img src="${qNhomDT}"><span>Nhóm Zalo dành cho đối tác bán hàng</span></div></div>
<div class="dt"><b>Đăng ký làm đối tác chỉ 4 bước</b><ol><li>Vào <u>huongchatkids.vn/doi-tac.html</u>, chọn thẻ <i>Đăng ký đối tác</i></li><li>Điền họ tên, SĐT, email, kênh bán, tài khoản ngân hàng → <i>Gửi đăng ký</i></li><li>Shop duyệt và báo qua email → <i>Đăng nhập</i> trang đối tác</li><li>Chọn sản phẩm, <i>Copy link</i> chia sẻ – nhận hoa hồng mỗi đơn thành công, trả ngày 10</li></ol></div><div class="chan"><div><b>huongchatkids.vn</b><br>15 Lý Nam Đế, Hoàn Kiếm, Hà Nội · 0967 233 003</div><img src="${qWeb}"></div></div>`;
  const html = (b) => `<!doctype html><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;800&family=Playfair+Display:ital,wght@0,700;1,600&display=swap" rel="stylesheet"><style>${css}</style><body>${b}</body>`;
  const tr = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--allow-file-access-from-files'] });
  const pg = await tr.newPage(), tam = OUT + '_tam.html';
  for (const [ten, b] of [['mat-truoc', mat1], ['mat-sau', mat2]]) {
    fs.writeFileSync(tam, html(b)); await pg.setViewport({ width: 560, height: 794, deviceScaleFactor: 1748 / 560 });
    await pg.goto(u(tam), { waitUntil: 'networkidle0' }); await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: OUT + 'poster-' + ten + '.png', clip: { x: 0, y: 0, width: 560, height: 794 } });
  }
  fs.writeFileSync(tam, html(mat1 + mat2)); await pg.goto(u(tam), { waitUntil: 'networkidle0' }); await pg.evaluate(() => document.fonts.ready);
  await pg.pdf({ path: OUT + 'poster-cam-on-A5-2-mat.pdf', width: '148mm', height: '210mm', printBackground: true });
  await tr.close(); console.log('xong', OUT);
})();
