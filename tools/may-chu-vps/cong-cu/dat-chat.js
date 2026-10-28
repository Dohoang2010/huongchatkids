'use strict';
/* Bật cổng chat cho CRM (chạy trên VPS bằng root): node dat-chat.js [webhook https] [moi]
   Tạo CHAT_API_KEY nếu chưa có ('moi' = tạo khoá mới, khoá cũ hết dùng), đặt CHAT_WEBHOOK nếu truyền vào. In khoá ra màn hình. */
const fs = require('node:fs');
const env = Object.fromEntries(fs.readFileSync('/etc/hck-api/env', 'utf8').split('\n').map((d) => d.match(/^([A-Z_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].replace(/^['"]|['"]$/g, '')]));
const [webhook = '', moi = ''] = process.argv.slice(2);
fetch('http://127.0.0.1:3100/noi-bo/chay?ham=chatCaiDat_&thamSo=' + encodeURIComponent(JSON.stringify([webhook === '-' ? '' : webhook, moi === 'moi'])), { method: 'POST', headers: { 'x-noi-bo': env.NOI_BO_KHOA } })
  .then((r) => r.json()).then((d) => {
    const kq = d.kq || {};
    if (!kq.ok) return console.log('Chưa được: ' + (kq.msg || JSON.stringify(d)));
    console.log('\nĐỊA CHỈ API : https://huongchatkids.vn/api?action=chatApi&key=<CHAT_API_KEY>&viec=ds');
    console.log('CHAT_API_KEY: ' + kq.key);
    console.log('WEBHOOK CRM : ' + (kq.webhook || '(chưa có – chạy lại kèm địa chỉ webhook khi bên CRM gửi)') + '\n');
  }).catch((e) => console.log('Lỗi: ' + e.message));
