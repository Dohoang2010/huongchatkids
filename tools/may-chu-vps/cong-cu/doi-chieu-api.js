'use strict';
/* Đối chiếu kết quả các lệnh ĐỌC giữa Apps Script (đang chạy thật) và VPS, trên cùng dữ liệu.
   Chạy trên VPS:  sh /opt/hck-api/cong-cu/doi-chieu.sh
   - Chép dữ liệu mới nhất từ Sheets về VPS, rồi gọi cùng 1 lệnh ở 2 nơi, so từng trường.
   - Không in dữ liệu khách: chỉ in đường dẫn trường bị lệch + kiểu giá trị (chuỗi bị che). */
const E = process.env;
const VPS = 'http://127.0.0.1:' + (E.CONG || 3100);
const GAS = E.APPS_SCRIPT_URL;
const NB = { 'x-noi-bo': E.NOI_BO_KHOA };

async function json(url, o) { const r = await fetch(url, Object.assign({ redirect: 'follow', signal: AbortSignal.timeout(180000) }, o)); const t = await r.text(); try { return JSON.parse(t); } catch (e) { return { __khongPhaiJson: t.slice(0, 200) }; } }
const goi = async (goc, q) => { const d = await json(goc + '?' + new URLSearchParams(q)); return d.__khongPhaiJson ? json(goc + '?' + new URLSearchParams(q)) : d; };   // Apps Script đôi khi lỗi tạm → gọi lại 1 lần
const che = (v) => (typeof v === 'string' ? 'chuỗi[' + v.length + ']' : JSON.stringify(v));

/* Trường thay đổi theo từng giây / theo người đang online – không so */
const BO_QUA = /(^|\.)(luc|online|lichLuc|homNay|thoiGian)$/;
function soSanh(a, b, duong, ds) {
  if (BO_QUA.test(duong)) return;
  if (a === b) return;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') { ds.push(duong + ': ' + che(a) + ' ≠ ' + che(b)); return; }
  if (Array.isArray(a) !== Array.isArray(b)) { ds.push(duong + ': kiểu khác'); return; }
  if (Array.isArray(a)) { if (a.length !== b.length) ds.push(duong + '.length: ' + a.length + ' ≠ ' + b.length); for (let i = 0; i < Math.min(a.length, b.length); i++) soSanh(a[i], b[i], duong + '[' + i + ']', ds); return; }
  const k = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const x of k) soSanh(a[x], b[x], duong ? duong + '.' + x : x, ds);
}

(async () => {
  if (!process.argv.includes('--khong-chep')) {
    console.log('Chép dữ liệu mới nhất từ Sheets…');
    const n = await json(VPS + '/noi-bo/nhap', { method: 'POST', headers: NB });
    console.log(n.ok ? '  xong: ' + n.kq.dong + ' dòng' : '  LỖI ' + JSON.stringify(n));
  }
  const ac = await json(VPS + '/noi-bo/anh-chup', { headers: NB });
  const trang = Object.fromEntries(ac.trang.map((t) => [t.ten, t.giaTri]));
  const conHan = (ms) => ms && ms.d && ms.d > Date.now();
  // phiên khách còn hạn (Token, Điện thoại, Hết hạn, Tạo lúc, Kiểu), phiên quản trị còn hạn (cột 4 = hết hạn), phiên đối tác
  const phien = (trang['Phiên'] || []).slice(1).filter((r) => conHan(r[2])).reverse();
  const phienQT = (trang['Phiên QT'] || []).slice(1).filter((r) => conHan(r[3])).reverse();
  const phienDT = (trang['Phiên đối tác'] || []).slice(1).filter((r) => r.some(conHan)).reverse();
  const sdts = (trang['Khách hàng'] || []).slice(1).map((r) => String(r[0])).filter((s) => /^0\d{9}$/.test(s)).slice(0, 4);
  let tkKhach = '';
  for (const r of phien) { const h = await goi(VPS + '/api', { action: 'hoSo', token: r[0] }); if (h.ok) { tkKhach = r[0]; break; } }
  let tkQT = '';
  for (const r of phienQT) { const h = await goi(VPS + '/api', { action: 'qtHoSo', token: r[0] }); if (h.ok) { tkQT = r[0]; break; } }
  let tkDT = '';
  for (const r of phienDT) { const h = await goi(VPS + '/api', { action: 'affHoSo', token: r[0] }); if (h.ok) { tkDT = r[0]; break; } }
  console.log('Có phiên khách: ' + !!tkKhach + ', phiên quản trị: ' + !!tkQT + ', phiên đối tác: ' + !!tkDT + ', số khách thử: ' + sdts.length);

  const ds = [
    ['ping', {}], ['gtCauHinh', {}], ['ddCauHinh', {}], ['qmkCauHinh', {}], ['affCongKhai', {}],
    ...sdts.map((s) => ['kiemTra', { sdt: s }]),
    ['kiemTra', { sdt: '0900000001' }],
  ];
  if (tkKhach) ds.push(...['hoSo', 'diemCuaToi', 'gtCuaToi', 'ddTongQuan', 'vcCuaToi'].map((a) => [a, { token: tkKhach }]));
  if (tkDT) ds.push(['affHoSo', { token: tkDT }]);
  if (tkQT) {
    const q = (a, x) => [a, Object.assign({ token: tkQT }, x || {})];
    ds.push(q('qtHoSo'), q('thongKe'), q('donHang'), q('khachHang'), q('nhatKy'), q('truyCap', { chiOnline: '0', kieu: '7' }), q('qtDs'),
      q('qtAffDs'), q('qtAffDon'), q('qtAffKy'), q('qtAffCauHinh'), q('qtAffSp'), q('qtAffCd'), q('qtGioiThieu'), q('qtDiem'), q('qtDiemLichSu'),
      q('qtGtCauHinh'), q('qtDdTongQuan'), q('qtDdCauHinh'), q('qtDdLichSu'), q('qtVcDs'), q('qtQmkCauHinh'), q('qtBiMat'), q('donChiTiet', { dong: 2 }),
      ...sdts.slice(0, 2).map((s) => q('khachChiTiet', { sdt: s })), ...sdts.slice(0, 2).map((s) => q('qtBaoMatKhach', { sdt: s })));
  }
  let khop = 0; const lech = [];
  for (const [action, tham] of ds) {
    const q = Object.assign({ action }, tham);
    const [g, v] = [await goi(GAS, q), await goi(VPS + '/api', q)];
    const khac = []; soSanh(g, v, '', khac);
    if (!khac.length) { khop++; console.log('KHỚP  ' + action); }
    else { lech.push(action); console.log('LỆCH  ' + action + '\n    ' + khac.slice(0, 10).join('\n    ') + (khac.length > 10 ? '\n    … +' + (khac.length - 10) : '')); }
  }
  console.log('\nTổng: ' + ds.length + ' lệnh, khớp ' + khop + ', lệch ' + lech.length + (lech.length ? ' (' + lech.join(', ') + ')' : ''));
})().catch((e) => { console.error(e); process.exit(1); });
