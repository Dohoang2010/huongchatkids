// Sinh lịch 10 bài/ngày (24/10 tối → 31/12/2026): slots.json
const fs = require('fs');
const GIO = [7, 8, 9, 11, 13, 15, 17, 19, 20, 22];
// Loại bài theo giờ. T10–T11: ưu tiên sản phẩm cho bé; T12: xen sản phẩm cho mẹ.
const MAU_1011 = { 7: 'HD', 8: 'BE', 9: 'BE', 11: 'CT', 13: 'BE', 15: 'BE', 17: 'BE', 19: 'CT', 20: 'BE', 22: 'BE' };
const MAU_12 = { 7: 'HD', 8: 'BE', 9: 'ME', 11: 'CT', 13: 'BE', 15: 'ME', 17: 'BE', 19: 'CT', 20: 'BE', 22: 'ME' };
// Sản phẩm cho bé (trọng số = mức ưu tiên)
const BE = { '22686115682': 3, '26060839019': 3, '42878618667': 2.5, '41353214697': 2, '25632276959': 2, '23660586997': 1.5, '22644617070': 2, '27355720019': 1.8,
  '41002695070': 2, '26156646705': 1.8, 'gac-canxi-sumo': 1.3, 'combo-vangsua-d3k2': 1.3, 'combo-lottexanh-d3k2': 1.2, 'lotte-hau-an': 1.2, 'suaxanh-lotte': 1.2,
  '13899935993': 1.2, '19682441455': 1.2, '26523206270': 1, 'men-sysy': 1.2, 'zinc-purevitality': 1.2, '45462512687': 1.2, '43532388498': 0.8,
  'ngu-coc-bap-thien-ma-kitea': 0.8, 'hexacare': 0.7, 'com-chay-phomai': 0.6, 'binh-giu-nhiet-hck': 1, '28467224687': 0.5, 'mien-ga-cf': 0.5 };
const LOTTE = ['22686115682', '41353214697', '25632276959', '23660586997', 'combo-lottexanh-d3k2', 'suaxanh-lotte', '13899935993'];
const ME = { '29006040615': 2, '24015583018': 2, '24764883120': 2, '27734205778': 1.8, 'cap-kem-nen-eclat': 1.5, '57556697426': 1.5, '24015142248': 1.2, '26800350417': 1,
  '26900366084': 1.3, '24329101823': 1, '28806784125': 1, '57903449970': 1.2, '51013054442': 1.2, '57413220644': 1.2, 'kem-exosome-toneup': 1.2, 'drvita-ecm-serum': 1,
  'daycell-nad-white-cream': 1, 'avca-body-tone-up': 1, '24465090622': 1, '27809051612': 1, 'goi-xa-boryeong-mud': 1, '56857599724': 1, '28902157429': 1,
  '49061985399': 1, '48112514210': 1, '24767149051': 0.8, '50002678694': 0.8, '25678530796': 0.6, 'mabelle-5790': 0.8, 'mabelle-5192': 0.6, 'mabelle-5997': 0.6, 'mabelle-6999': 0.6 };
// Góc viết – xoay vòng để không trùng ý
const GOC_SP = ['noi-dau', 'cau-hoi', 'con-so', 'huong-dan-dung', 'thanh-phan', 'mua-vu', 'combo', 'qua-tang', 'faq', 'chinh-hang', 'checklist', 'tiet-kiem', 'di-hoc', 'ca-nha', 'chuyen-shop', 'so-sanh-cach-chon'];
// Chương trình: từ ngày – đến ngày (YYYY-MM-DD, gồm cả 2 đầu)
const CT = [
  ['hau-an-2410', '2026-10-24', '2026-10-25', 6], ['hck5', '2026-10-24', '2026-10-31', 2], ['binh-giu-nhiet', '2026-10-24', '2026-12-31', 3],
  ['canxi-d3k2', '2026-10-24', '2026-12-31', 3], ['gac-sumo-lotte', '2026-10-24', '2026-12-31', 2], ['gio-vang-lotte', '2026-10-24', '2026-12-31', 2],
  ['qua-dang-ky-50k', '2026-10-24', '2026-12-31', 2.5], ['diem-danh', '2026-10-24', '2026-12-31', 1.5], ['qua-don-dau-lotte', '2026-10-24', '2026-12-31', 1.5],
  ['freeship-3tr', '2026-10-24', '2026-12-31', 1], ['hang-thanh-vien', '2026-10-24', '2026-12-31', 1], ['sinh-nhat-be', '2026-10-24', '2026-12-31', 1],
  ['khach-shopee-tiktok', '2026-11-01', '2026-12-31', 1.5], ['food-1tr', '2026-10-24', '2026-12-31', 0.8], ['meso-bac-nmn', '2026-12-01', '2026-12-31', 1],
  ['my-pham-10tr', '2026-12-01', '2026-12-31', 1], ['ngay-doi-1111', '2026-11-09', '2026-11-11', 8], ['ngay-doi-1212', '2026-12-10', '2026-12-12', 8],
  ['doi-tac', '2026-10-24', '2026-12-31', 0.7], ['chinh-sach-mua-hang', '2026-10-24', '2026-12-31', 0.8],
];
const HD = ['dat-hang-3-buoc', 'tao-tai-khoan', 'diem-danh', 'vi-voucher', 'do-chi-so-be', 'tra-cuu-don', 'chat-zalo-tu-van', 'sinh-nhat-be', 'dung-diem', 'mua-nhanh', 'doi-tac', 'quen-mat-khau', 'khuyen-mai-trang', 'cam-nang', 'fanpage-chinh-chu'];
// Chọn có trọng số, tránh lặp gần (giảm trọng số theo số lần đã dùng)
function chon(bang, dem, cam = []) {
  let best = null, bs = -1;
  for (const [k, w] of Object.entries(bang)) { if (cam.includes(k)) continue; const s = w / (1 + (dem[k] || 0)); if (s > bs) { bs = s; best = k; } }
  dem[best] = (dem[best] || 0) + 1; return best;
}
const out = [], demBE = {}, demME = {}, demCT = {}, gocDem = {};
let hdI = 0;
const ngay = (d) => d.toISOString().slice(0, 10);
const bd = new Date('2026-10-24T00:00:00Z'), kt = new Date('2026-12-31T00:00:00Z');
for (let d = new Date(bd); d <= kt; d.setUTCDate(d.getUTCDate() + 1)) {
  const n = ngay(d), mau = n >= '2026-12-01' ? MAU_12 : MAU_1011, ganDay = [];
  for (const g of GIO) {
    if (n === '2026-10-24' && g < 19) continue;
    let loai = mau[g], muc;
    if (loai === 'HD') { muc = HD[hdI++ % HD.length]; }
    else if (loai === 'CT') {
      const bang = Object.fromEntries(CT.filter(([, a, b]) => a <= n && n <= b).map(([k, , , w]) => [k, w]));
      muc = chon(bang, demCT, ganDay);
    } else if (loai === 'BE') {
      const cam = [...ganDay]; const bang = g === 20 ? Object.fromEntries(LOTTE.map((k) => [k, BE[k]])) : BE;
      muc = chon(bang, demBE, cam);
    } else muc = chon(ME, demME, ganDay);
    ganDay.push(muc);
    let goc = '';
    if (loai === 'BE' || loai === 'ME') { const i = gocDem[muc] || 0; const h = [...muc].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 7); goc = GOC_SP[(i * 7 + h) % GOC_SP.length]; gocDem[muc] = i + 1; }
    const hh = String(g).padStart(2, '0');
    out.push({ cd: `fb${n.slice(5).replace('-', '')}${hh}`, luc: `${n}T${hh}:00:00+07:00`, ngay: n, gio: g, loai, muc, goc, lan: (loai === 'BE' ? demBE : loai === 'ME' ? demME : loai === 'CT' ? demCT : {})[muc] || 0 });
  }
}
fs.writeFileSync(__dirname + '/slots.json', JSON.stringify(out, null, 1));
const tk = {}; out.forEach((s) => { tk[s.loai] = (tk[s.loai] || 0) + 1; });
console.log(out.length, tk); console.log('BE', demBE); console.log('CT', demCT);
