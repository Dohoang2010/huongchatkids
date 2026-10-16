'use strict';
/* Điều khiển Apps Script từ VPS (dùng khoá VPS_KHOA). Chạy trên VPS qua: sh /opt/hck-api/cong-cu/apps-script.sh <lệnh>
     chuyen bao-tri          Apps Script tạm trả "đang nâng cấp" (lúc chép dữ liệu lần cuối)
     chuyen <địa chỉ VPS>    Apps Script chuyển tiếp mọi lệnh sang VPS (vd https://huongchatkids.vn/api)
     chuyen tat              Apps Script chạy lại như cũ
     quay-lai                CHÉP NGƯỢC toàn bộ dữ liệu VPS → Google Sheets (ghi đè), kèm thuộc tính, rồi đối chiếu mã băm
     thu-quay-lai            Thử chép ngược 2 trang vào trang tạm __VPS_THU…, đối chiếu, xoá trang tạm (không đụng dữ liệu thật) */
const crypto = require('node:crypto');
const E = process.env;
const VPS = 'http://127.0.0.1:' + (E.CONG || 3100);
const NB = { 'x-noi-bo': E.NOI_BO_KHOA };
const bam = (v) => crypto.createHash('sha256').update(JSON.stringify(v), 'utf8').digest('hex');

async function gas(viec, du) {
  const r = await fetch(E.APPS_SCRIPT_URL, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(Object.assign({ type: 'vpsNhap', key: E.VPS_KHOA, viec }, du || {})), signal: AbortSignal.timeout(300000) });
  const t = await r.text(); let d; try { d = JSON.parse(t); } catch (e) { throw new Error('Apps Script trả về không phải JSON: ' + t.slice(0, 200)); }
  if (!d.ok) throw new Error('Apps Script: ' + (d.msg || t.slice(0, 200)));
  return d;
}
async function bamSheets() {
  const r = await fetch(E.APPS_SCRIPT_URL + '?' + new URLSearchParams({ action: 'vpsXuat', viec: 'bam', key: E.VPS_KHOA }), { redirect: 'follow', signal: AbortSignal.timeout(300000) });
  const d = JSON.parse(await r.text()); if (!d.ok) throw new Error(d.msg); return d.trang;
}
async function anhChup() { const r = await fetch(VPS + '/noi-bo/anh-chup', { headers: NB }); const d = await r.json(); if (!d.ok) throw new Error('VPS không trả ảnh chụp'); return d; }

async function chepTrang(ten, giaTri) {
  const LO = 2000;
  if (!giaTri.length) { await gas('trang', { ten, xoaTruoc: true, tu: 1, giaTri: [] }); return; }
  for (let i = 0; i < giaTri.length; i += LO) await gas('trang', { ten, xoaTruoc: i === 0, tu: i + 1, giaTri: giaTri.slice(i, i + LO) });
}

(async () => {
  const [lenh, thamSo] = process.argv.slice(2);
  if (lenh === 'chuyen') {
    const gt = thamSo === 'tat' ? '' : thamSo;
    if (thamSo !== 'tat' && thamSo !== 'bao-tri' && !/^https:\/\//.test(thamSo || '')) throw new Error('Dùng: chuyen bao-tri | chuyen tat | chuyen https://…');
    const d = await gas('chuyen', { giaTri: gt });
    console.log('Apps Script VPS_CHUYEN = ' + (d.chuyen || '(tắt – chạy như cũ)'));
    return;
  }
  if (lenh === 'quay-lai' || lenh === 'thu-quay-lai') {
    const thu = lenh === 'thu-quay-lai';
    const ac = await anhChup();
    const ds = thu ? ac.trang.filter((t) => ['Khách hàng', 'Điểm - Giao dịch'].includes(t.ten)).map((t, i) => Object.assign({}, t, { ten: '__VPS_THU_' + (i + 1), goc: t.ten })) : ac.trang;
    console.log((thu ? 'THỬ ' : '') + 'Chép ngược ' + ds.length + ' trang VPS → Google Sheets…');
    for (const t of ds) { await chepTrang(t.ten, t.giaTri); console.log('  ' + t.ten + (t.goc ? ' (từ ' + t.goc + ')' : '') + ': ' + t.giaTri.length + ' dòng'); }
    if (!thu) { const tt = await gas('thuocTinh', { giaTri: ac.thuocTinh }); console.log('  thuộc tính: ' + tt.so); }
    const ben = await bamSheets();
    let khop = 0;
    for (const t of ds) {
      const g = ben.find((x) => x.ten === t.ten); const ok = !!g && g.bam === bam(t.giaTri);
      if (ok) khop++; console.log((ok ? 'KHỚP ' : 'LỆCH ') + t.ten + ' (Sheets ' + (g ? g.soDong : '–') + ' dòng, VPS ' + t.giaTri.length + ')');
    }
    console.log('Khớp ' + khop + '/' + ds.length);
    if (thu) { for (const t of ds) await gas('xoaTrang', { ten: t.ten }); console.log('Đã xoá trang thử.'); }
    if (khop !== ds.length) process.exitCode = 2;
    return;
  }
  console.log('Lệnh: chuyen bao-tri|tat|<https://…> · quay-lai · thu-quay-lai');
})().catch((e) => { console.error('LỖI: ' + e.message); process.exit(1); });
