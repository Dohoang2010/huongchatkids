'use strict';
/* Gửi mail / tin Zalo SAU khi lần chạy đã ghi dữ liệu xong. Mọi thứ ghi vào bảng hop_thu_di (hộp thư đi) để tra lại.
   - Chế độ "song-song" (đang chạy thử cạnh Apps Script): KHÔNG gửi gì thật, chỉ ghi lại – tránh khách nhận 2 lần.
   - Chế độ "chinh": mail qua SMTP (SMTP_HOST…); chưa cài SMTP thì nhờ Apps Script gửi hộ (MailApp như cũ). */
const { goiMot } = require('./goi-mang');

function taoGuiDi(o) {
  const { pool, cauHinh, ghi } = o;
  let smtp = null;
  if (cauHinh.smtp && cauHinh.smtp.host) {
    const nodemailer = require('nodemailer');
    smtp = nodemailer.createTransport({ host: cauHinh.smtp.host, port: cauHinh.smtp.port || 465, secure: (cauHinh.smtp.port || 465) === 465,
      auth: cauHinh.smtp.user ? { user: cauHinh.smtp.user, pass: cauHinh.smtp.pass } : undefined });
  }
  const luu = async (h, trangThai, loi) => {
    if (!pool) return null;
    const noiDung = h.loai === 'mail' ? h.thu : { method: h.yc.method, url: h.tomTat, body: h.yc.body };
    const r = await pool.query('INSERT INTO hop_thu_di (loai, tom_tat, noi_dung, trang_thai, loi, gui_luc) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id',
      [h.loai, h.tomTat, JSON.stringify(noiDung), trangThai, loi || null, trangThai === 'da-gui' ? new Date() : null]);
    return r.rows[0].id;
  };
  const guiMail = async (thu) => {
    if (smtp) {
      const tu = cauHinh.smtp.from || cauHinh.smtp.user;
      await smtp.sendMail({ from: thu.name ? { name: thu.name, address: tu } : tu, to: thu.to, cc: thu.cc || undefined, bcc: thu.bcc || undefined,
        replyTo: thu.replyTo || undefined, subject: thu.subject, text: thu.body || undefined, html: thu.htmlBody || undefined });
      return 'smtp';
    }
    // Nhờ Apps Script gửi hộ bằng MailApp (cần VPS_KHOA)
    const r = await fetch(cauHinh.appsScriptUrl, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ type: 'vpsNhap', viec: 'mail', key: cauHinh.vpsKhoa, thu }), signal: AbortSignal.timeout(60000) });
    const d = JSON.parse(await r.text());
    if (!d.ok) throw new Error(d.msg || 'Apps Script không gửi được');
    return 'apps-script';
  };
  const mot = async (h, nguon) => {
    if (cauHinh.cheDo !== 'chinh') { await luu(h, 'bo-qua-song-song'); ghi('(chạy thử, không gửi) ' + h.loai + ': ' + h.tomTat + ' ← ' + nguon); return; }
    try {
      if (h.loai === 'mail') { const qua = await guiMail(h.thu); await luu(h, 'da-gui', qua); }
      else { const kq = await goiMot(h.yc); if (kq.loi || kq.ma >= 400) throw new Error(kq.loi || ('HTTP ' + kq.ma + ' ' + String(kq.noiDung).slice(0, 200))); await luu(h, 'da-gui'); }
      ghi('Đã gửi ' + h.loai + ': ' + h.tomTat);
    } catch (e) {
      ghi('LỖI gửi ' + h.loai + ' (' + h.tomTat + '): ' + e.message);
      try { await luu(h, 'loi', e.message); } catch (e2) { ghi('Không ghi được hộp thư đi: ' + e2.message); }
    }
  };
  // gửi lần lượt theo thứ tự (Zalo báo đơn đúng thứ tự)
  let duoi = Promise.resolve();
  return (ds, nguon) => { for (const h of ds) duoi = duoi.then(() => mot(h, nguon)).catch(() => {}); };
}

module.exports = { taoGuiDi };
