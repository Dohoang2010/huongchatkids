// Ghép bài: gắn ảnh bài + ảnh bình luận, vẽ thẻ, kiểm tra luật, xuất thư mục nhập VPS.
// node dung.js <tên lô> parts/bai-A.json [parts/bai-B.json ...]
const fs = require('fs'), path = require('path');
const { ve } = require('./the.js');
const D = __dirname, WEB = 'C:/Users/Admin/Desktop/WEB KID/';
const [LO, ...TEP] = process.argv.slice(2);
const SP = Object.fromEntries(require('./facts-sp.json').map((p) => [p.id, p]));
const SLOT = Object.fromEntries(require('./slots.json').map((s) => [s.cd, s]));
const ANH_OK = Object.fromEntries(require('./anh.json').map((o) => [o.id, o.sizes]));
const OUT = path.join(D, 'lo', LO); fs.mkdirSync(path.join(OUT, 'img'), { recursive: true }); fs.mkdirSync(path.join(OUT, 'the'), { recursive: true });
fs.mkdirSync(path.join(D, 'the-cache'), { recursive: true });
const BAN = (f) => 'img/banner/' + f;
const anhSP = (id) => { const p = SP[id]; if (!p) return []; const s = ANH_OK[id] || []; return (p.images || []).filter((_, i) => (s[i] || 800) >= 700); };
const bia = (id) => anhSP(id)[0];
// Ảnh chi tiết (không dùng ảnh bìa khung hồng), bỏ ảnh trước/sau, ảnh tuyên bố công dụng, giấy tờ
const CAM_ANH = new Set(['img/24764883120-2.jpg', 'img/24764883120-5.jpg', 'img/57556697426-3.jpg', 'img/57903449970-4.jpg', 'img/57903449970-5.jpg', 'img/25678530796-3.jpg', 'img/25678530796-5.jpg', 'img/26800350417-3.jpg', 'img/28806784125-2.jpg', 'img/25632276959-cb.jpg', 'img/gac-canxi-sumo-6.jpg', 'img/26156646705-4.jpg', 'img/26060839019-4.jpg', 'img/26523206270-5.jpg']);
const GHEP = { 'combo-vangsua-d3k2': ['26060839019', '42878618667'], 'combo-lottexanh-d3k2': ['41353214697', '42878618667'], '22686115682': ['22686115682', '41353214697', '25632276959', '23660586997'] };
const chiTiet = (id) => (GHEP[id] || [id]).flatMap((x) => anhSP(x).slice(1)).filter((a) => !CAM_ANH.has(a) && !/-h.jpg$/.test(a));
// Ảnh cho bài chương trình (ảnh chi tiết thay cho ảnh bìa)
const ct1 = (id) => chiTiet(id)[0] || bia(id), ct2 = (id) => chiTiet(id)[1] || ct1(id);
const ANH_CT = {
  'hau-an-2410': [BAN('hau-an-2410-mb.jpg'), ct1('lotte-hau-an'), ct1('26060839019'), ct1('22686115682'), ...anhSP('lotte-hau-an').slice(1)],
  'binh-giu-nhiet': [BAN('binh-giu-nhiet-v9-mb.jpg'), ...anhSP('binh-giu-nhiet-hck'), ct1('22686115682')],
  'canxi-d3k2': [ct1('combo-vangsua-d3k2'), ct1('26060839019'), ct1('42878618667'), ...anhSP('26060839019').slice(1), ...anhSP('42878618667').slice(1)],
  'gac-sumo-lotte': [ct1('26156646705'), ct1('gac-canxi-sumo'), ct1('22686115682'), ...anhSP('26156646705').slice(1), ...anhSP('gac-canxi-sumo').slice(1)],
  'gio-vang-lotte': [ct1('22686115682'), ct1('41353214697'), ct1('25632276959'), ct1('23660586997'), ct1('suaxanh-lotte'), ct1('13899935993'), ct1('combo-lottexanh-d3k2')],
  'qua-dang-ky-50k': ['chup/tai-khoan-0.jpg', BAN('diem-danh-mb.jpg'), 'chup/tai-khoan-1.jpg', 'chup/diem-danh-1.jpg', ct1('22686115682')],
  'diem-danh': [BAN('diem-danh-mb.jpg'), 'chup/diem-danh-0.jpg', 'chup/diem-danh-1.jpg', 'chup/diem-danh-2.jpg'],
  'qua-don-dau-lotte': [ct1('25632276959'), ct1('23660586997'), ct1('22686115682'), 'chup/khuyen-mai-0.jpg', ...anhSP('25632276959').slice(1)],
  'freeship-3tr': ['chup/khuyen-mai-1.jpg', ct1('26060839019'), ct1('22686115682'), ct1('29006040615'), ct1('42878618667')],
  'hang-thanh-vien': ['chup/tai-khoan-1.jpg', 'chup/tai-khoan-0.jpg', ct1('26060839019'), ct1('22686115682')],
  'sinh-nhat-be': ['chup/tai-khoan-0.jpg', ct1('22686115682'), ct1('27355720019'), ct1('41002695070'), 'chup/tai-khoan-1.jpg'],
  'khach-shopee-tiktok': [BAN('canxi-chi-web-0111-mb.jpg'), 'img/26060839019-3.jpg', 'img/42878618667-3.jpg', 'img/42878618667-4.jpg', 'img/42878618667-5.jpg'],
  'food-1tr': [ct1('28467224687'), ct1('43532388498'), ct1('ngu-coc-bap-thien-ma-kitea'), ct1('mien-ga-cf'), ct1('bo-xuyen-tieu'), ct1('com-chay-phomai')],
  'meso-bac-nmn': [ct1('29006040615'), ct1('24764883120'), ct1('24015583018'), ...anhSP('29006040615').slice(1)],
  'my-pham-10tr': [BAN('huong-lam-dep-mb-v2.jpg'), ct1('29006040615'), ct1('cap-kem-nen-eclat'), ct1('24015583018'), ct1('26900366084')],
  'ngay-doi-1111': [BAN('diem-danh-mb.jpg'), 'chup/diem-danh-1.jpg', 'chup/vi-voucher-0.jpg', 'chup/khuyen-mai-0.jpg', ct1('26060839019')],
  'ngay-doi-1212': [BAN('diem-danh-mb.jpg'), 'chup/diem-danh-1.jpg', 'chup/vi-voucher-0.jpg', 'chup/khuyen-mai-0.jpg', ct1('22686115682')],
  'doi-tac': [BAN('huong-doi-tac-mb-v2.jpg'), 'chup/doi-tac-0.jpg', 'chup/doi-tac-1.jpg', 'chup/doi-tac-2.jpg'],
  'chinh-sach-mua-hang': [BAN('huong-dinh-duong-mb-v2.jpg'), 'chup/ho-tro-0.jpg', 'chup/ho-tro-1.jpg', ct1('22686115682')],
};
const ANH_HD = {
  'dat-hang-3-buoc': ['chup/sp-lotte-0.jpg', 'chup/sp-lotte-1.jpg', 'chup/sp-canxi-1.jpg', 'chup/trang-chu-0.jpg'],
  'tao-tai-khoan': ['chup/tai-khoan-0.jpg', 'chup/tai-khoan-1.jpg', 'chup/tai-khoan-2.jpg', BAN('diem-danh-mb.jpg')],
  'diem-danh': [BAN('diem-danh-mb.jpg'), 'chup/diem-danh-0.jpg', 'chup/diem-danh-1.jpg', 'chup/diem-danh-2.jpg'],
  'vi-voucher': ['chup/vi-voucher-0.jpg', 'chup/khuyen-mai-1.jpg', 'chup/diem-danh-1.jpg', BAN('diem-danh-mb.jpg')],
  'do-chi-so-be': [BAN('do-chi-so-mb.jpg'), 'chup/do-chi-so-0.jpg', 'chup/do-chi-so-1.jpg', 'chup/do-chi-so-2.jpg'],
  'tra-cuu-don': ['chup/tai-khoan-0.jpg', 'chup/ho-tro-1.jpg', 'chup/ho-tro-0.jpg', 'chup/trang-chu-0.jpg'],
  'chat-zalo-tu-van': ['chup/trang-chu-0.jpg', 'chup/sp-lotte-0.jpg', 'chup/ho-tro-0.jpg', 'chup/cam-nang-1.jpg'],
  'sinh-nhat-be': ['chup/tai-khoan-0.jpg', 'chup/tai-khoan-1.jpg', ct1('22686115682'), ct1('27355720019')],
  'dung-diem': ['chup/diem-danh-1.jpg', 'chup/tai-khoan-1.jpg', 'chup/sp-canxi-1.jpg', 'chup/khuyen-mai-0.jpg'],
  'mua-nhanh': ['chup/sp-lotte-1.jpg', 'chup/sp-canxi-1.jpg', 'chup/sp-lotte-0.jpg', 'chup/sp-canxi-0.jpg'],
  'doi-tac': [BAN('huong-doi-tac-mb-v2.jpg'), 'chup/doi-tac-0.jpg', 'chup/doi-tac-1.jpg', 'chup/doi-tac-2.jpg'],
  'quen-mat-khau': ['chup/quen-mk-0.jpg', 'chup/quen-mk-1.jpg', 'chup/tai-khoan-2.jpg', 'chup/trang-chu-0.jpg'],
  'khuyen-mai-trang': ['chup/khuyen-mai-0.jpg', 'chup/khuyen-mai-1.jpg', 'chup/khuyen-mai-2.jpg', BAN('binh-giu-nhiet-v9-mb.jpg')],
  'cam-nang': ['chup/cam-nang-0.jpg', 'chup/cam-nang-1.jpg', 'chup/cam-nang-2.jpg', 'chup/trang-chu-1.jpg'],
  'fanpage-chinh-chu': [BAN('facebook-chinh-chu-mb.jpg'), 'chup/trang-chu-0.jpg', 'chup/ho-tro-2.jpg', 'chup/trang-chu-1.jpg'],
};
const LIEN_QUAN_HD = { 'dat-hang-3-buoc': '22686115682', 'mua-nhanh': '26060839019', 'sinh-nhat-be': '41002695070', 'dung-diem': '42878618667' };
const xoay = (ds, k, n) => { const a = ds.filter(Boolean), u = [...new Set(a)]; if (!u.length) return []; const r = []; for (let i = 0; i < n; i++) r.push(u[(((k + i) % u.length) + u.length) % u.length]); return [...new Set(r)]; };
const CHINH_SACH = [0, 1, 2].map((i) => ({ out: path.join(D, 'the-cache', `chinh-sach-${i}.jpg`), kieu: 'ct', nhan: ['Mua an tâm', 'Cam kết', 'Hỗ trợ 8h–22h'][i],
  tieuDe: ['Mua sắm an tâm tại <em>Hương Chất Kids</em>', 'Chính hãng – <em>hoàn tiền 100%</em> nếu hàng giả', 'Đặt hàng dễ, <em>nhận hàng kiểm tra</em>'][i],
  anh: [[ct1('22686115682'), ct1('26060839019'), ct1('42878618667')], [ct1('22644617070'), ct1('41002695070'), ct1('27355720019')], [ct1('41353214697'), ct1('25632276959'), ct1('23660586997')]][i],
  dong: ['Thanh toán khi nhận hàng hoặc VietQR', 'Được kiểm hàng khi nhận · Đổi trả 7 ngày', 'Freeship đơn từ 3.000.000đ'] }));
// Luật cấm (kiểm tra máy)
const CAM = [/\bchữa\b/i, /\bđiều trị\b/i, /\bđặc trị\b/i, /khỏi bệnh/i, /\bthần dược\b/i, /thay thế thuốc(?! chữa bệnh)/i, /\bsố 1\b/i, /\bduy nhất\b/i, /cam kết tăng/i, /con bạn bị/i, /\bbạn bị\b/i, /da bạn/i, /trước\s*[-–]\s*sau/i, /100% hiệu quả/i, /hết hẳn/i];
const CAM_TOT_NHAT = /tốt nhất/i, SUA_ME = /Sữa mẹ là thức ăn tốt nhất/;
const TPCN_CANH = /không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh/;
const loi = [], bai = [], the = [];
const BO_SP = ['hexacare', '28902157429', '50002678694', '19682441455', '13899935993', 'mabelle-6999', 'mabelle-5192', 'mabelle-5790', 'mabelle-5038', 'mabelle-5997', 'mabelle-5992']; let boQua = 0; const demHD = {};
const DUONG = new Set(['', 'khuyen-mai', 'account.html', 'diem-danh.html', 'vi-voucher.html', 'do-chi-so-cho-be.html', 'doi-tac.html', 'policy.html', 'blog.html', 'quen-mat-khau.html', 'cart.html', 'collections.html', 'danh-cho-be', 'beauty', 'thuc-pham', 'thoi-trang', 'gioi-thieu.html', 'index.html', ...Object.values(SP).map((p) => p.slug)]);
const bo = (s) => String(s || '').replace(/Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh\.?/g, '').replace(/Sữa mẹ là thức ăn tốt nhất[^.]*\./g, '');
const tpcnSP = (id) => SP[id] && (SP[id].tpcn && !SP[id].cosmetic || ['49061985399', '48112514210', '24767149051', '28902157429'].includes(id));
const chepAnh = (a) => { const dich = path.join(OUT, a.replace(/^img\//, 'img/').replace(/^chup\//, 'img/chup-')); fs.mkdirSync(path.dirname(dich), { recursive: true }); if (!fs.existsSync(dich)) fs.copyFileSync(a.startsWith('chup/') ? path.join(D, a) : WEB + a, dich); return path.relative(OUT, dich).replace(/\\/g, '/'); };
for (const t of TEP) for (const b of JSON.parse(fs.readFileSync(path.join(D, t), 'utf8'))) {
  const s0 = SLOT[b.cd], s = s0 && b.muc ? { ...s0, muc: b.muc } : s0; if (!s) { loi.push(b.cd + ': không có slot'); continue; }
  if (BO_SP.includes(s.muc)) { boQua++; continue; }
  if (s.loai === 'HD') { demHD[s.muc] = (demHD[s.muc] || 0) + 1; s.lan = demHD[s.muc]; }
  if (/Biostime|sữa dê|Hexacare|Arravite|MaBelle|ngải cứu/i.test([b.noiDung, ...(b.binhLuan || []).map((x) => x.noiDung)].join(' '))) loi.push(b.cd + ': nhắc sản phẩm bị loại');
  const tx = [b.noiDung, ...(b.binhLuan || []).map((x) => x.noiDung)].join('\n');
  for (const r of CAM) if (r.test(bo(tx))) loi.push(`${b.cd}: từ cấm ${r}`);
  if (CAM_TOT_NHAT.test(bo(tx))) loi.push(`${b.cd}: "tốt nhất"`);
  if ((b.binhLuan || []).length < 3) loi.push(`${b.cd}: thiếu bình luận`);
  if ((s.loai === 'BE' || s.loai === 'ME') && tpcnSP(s.muc) && !TPCN_CANH.test(b.noiDung)) loi.push(`${b.cd}: thiếu cảnh báo TPCN`);
  if (s.muc === '19682441455' && !SUA_ME.test(b.noiDung)) loi.push(`${b.cd}: thiếu câu sữa mẹ`);
  for (const m of tx.matchAll(/huongchatkids\.vn\/([^\s)?#\]]*)/g)) { const d = m[1].replace(/[.,;:!]+$/, ''); if (!DUONG.has(d)) loi.push(b.cd + ': link lạ /' + d); }
  if (!/0967 ?233 ?003/.test(b.noiDung)) loi.push(`${b.cd}: thiếu hotline`);
  // ảnh bài
  let anh, anhBL;
  if (s.loai === 'BE' || s.loai === 'ME') {
    const ds = anhSP(s.muc), dau = ds[0], phu = chiTiet(s.muc), k = (s.lan - 1) * 3;
    anh = xoay(phu, k, 4);
    const con = phu.filter((x) => !anh.includes(x));
    anhBL = con.length ? con[(s.lan) % con.length] : phu[(k + 3) % Math.max(1, phu.length)] || dau;
  } else if (s.loai === 'CT') { const ds = ANH_CT[s.muc] || []; anh = xoay(ds, (s.lan - 1) % Math.max(1, ds.length), 4); anhBL = ds.find((x) => !anh.includes(x)) || ds[ds.length - 1]; }
  else { const ds = ANH_HD[s.muc] || []; anh = xoay(ds, (s.lan - 1) % 4, 4); anhBL = LIEN_QUAN_HD[s.muc] ? ct1(LIEN_QUAN_HD[s.muc]) : BAN(['diem-danh-mb.jpg', 'do-chi-so-mb.jpg', 'facebook-chinh-chu-mb.jpg', 'huong-dinh-duong-mb-v2.jpg'][s.lan % 4]); }
  // thẻ
  const theOf = (x, kieu, i, anhThe) => { if (!x || !x.the) return null; const bam = require('crypto').createHash('md5').update(JSON.stringify([kieu, x.the, anhThe])).digest('hex').slice(0, 8), f = path.join(D, 'the-cache', `${b.cd}-${i}-${bam}.jpg`);
    the.push({ out: f, kieu, nhan: x.the.nhan, tieuDe: x.the.tieuDe, gia: x.the.gia, giaCu: x.the.giaCu, dong: x.the.dong, anh: anhThe }); return f; };
  const bl = b.binhLuan.slice(0, 4).map((x) => ({ noiDung: x.noiDung, anh: '' }));
  if (s.loai === 'BE' || s.loai === 'ME') {
    const f1 = theOf(b.binhLuan[0], 'gia', 1, [ct1(s.muc)]), f3 = theOf(b.binhLuan[2], 'ct', 3, xoay(chiTiet(s.muc).length ? chiTiet(s.muc) : anhSP(s.muc), s.lan + 1, 3));
    if (!f1 || !f3) loi.push(`${b.cd}: thiếu thẻ bình luận 1/3`);
    bl[0].anh = f1; bl[1].anh = anhBL; if (bl[2]) bl[2].anh = f3;
    if (anh.length < 4) anh.push(f3 || f1); if (anh.length < 4) anh.push(f1); if (anh.length < 4) anh.push(anhSP(s.muc)[0]);
  } else {
    const lq = s.loai === 'CT' ? (ANH_CT[s.muc] || []).filter((x) => x.startsWith('img/') && !x.includes('banner')) : [];
    const f1 = theOf(b.binhLuan[0], 'ct', 1, lq.slice(0, 3)), f2 = theOf(b.binhLuan[1], 'hd', 2, []);
    if (!f1 || !f2) loi.push(`${b.cd}: thiếu thẻ bình luận 1/2`);
    bl[0].anh = f1; bl[1].anh = f2; if (bl[2]) bl[2].anh = anhBL;
    while (anh.length < 4) anh.push(f1);
  }
  if (bl[3]) bl[3].anh = CHINH_SACH[s.lan % 3].out;
  bai.push({ cd: b.cd, luc: s.luc, tieuDe: String(b.tieuDe || '').slice(0, 120), noiDung: b.noiDung, anh, binhLuan: bl });
}
if (loi.length) { console.log('LỖI:\n' + loi.join('\n')); if (!process.argv.includes('--bo-loi')) process.exit(1); }
(async () => {
  await ve([...CHINH_SACH, ...the], D);
  const ra = bai.map((b) => ({ ...b, anh: b.anh.map((a) => a.startsWith(D) ? chepThe(a) : chepAnh(a)), binhLuan: b.binhLuan.map((x) => ({ ...x, anh: x.anh ? (x.anh.startsWith(D) ? chepThe(x.anh) : chepAnh(x.anh)) : undefined })) }));
  fs.writeFileSync(path.join(OUT, 'nhap.json'), JSON.stringify(ra, null, 1));
  console.log('Xong lô', LO, ':', ra.length, 'bài, bỏ', boQua);
})();
function chepThe(f) { const dich = path.join(OUT, 'the', path.basename(f)); if (!fs.existsSync(dich)) fs.copyFileSync(f, dich); return 'the/' + path.basename(f); }
