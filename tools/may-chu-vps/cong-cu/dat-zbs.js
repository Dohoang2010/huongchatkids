'use strict';
/* Lưu mã kết nối Zalo ZBS lên máy chủ + gửi thử / bật tắt (chạy trên VPS bằng root, nhận JSON qua stdin):
     { viec: 'luu', appId, secret, refresh } | { viec: 'thu', sdt, loai: 'don'|'otp' } | { viec: 'bat' } | { viec: 'tat' }
   Dùng qua tools/may-chu-vps/cai-zalo-zbs.ps1 – mã chỉ nằm trong thuộc tính máy chủ (PostgreSQL), không nằm trong code. */
const fs = require('node:fs');
const env = Object.fromEntries(fs.readFileSync('/etc/hck-api/env', 'utf8').split('\n').map((d) => d.match(/^([A-Z_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^['"]|['"]$/g, '')]));
const goi = async (ham, thamSo) => {
  const r = await fetch('http://127.0.0.1:3100/noi-bo/chay?ham=' + ham + '&thamSo=' + encodeURIComponent(JSON.stringify(thamSo)), { method: 'POST', headers: { 'x-noi-bo': env.NOI_BO_KHOA } });
  return (await r.json()).kq;
};
let vao = ''; process.stdin.on('data', (d) => { vao += d; }).on('end', async () => {
  try {
    const d = JSON.parse(vao || '{}'); let kq;
    if (d.viec === 'luu') kq = await goi('zbsLuuMa_', [d.appId || '', d.secret || '', d.refresh || '']);
    else if (d.viec === 'thu') kq = await goi('zbsGuiThu_', [d.sdt, d.loai || 'don']);
    else if (d.viec === 'bat' || d.viec === 'tat') kq = await goi('zbsBatTat_', [d.viec === 'bat']);
    else kq = { ok: false, msg: 'Việc không hợp lệ' };
    console.log(JSON.stringify(kq || { ok: false, msg: 'Máy chủ không trả lời' }));
  } catch (e) { console.log(JSON.stringify({ ok: false, msg: e.message })); }
});
