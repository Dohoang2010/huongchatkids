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
  const guiSmtp = async (thu) => {
    const tu = cauHinh.smtp.from || cauHinh.smtp.user;
    return smtp.sendMail({ from: { name: thu.name || 'Hương Chất Kids', address: tu }, to: thu.to, cc: thu.cc || undefined, bcc: thu.bcc || undefined,
      replyTo: thu.replyTo || undefined, subject: thu.subject, text: thu.body || undefined, html: thu.htmlBody || undefined,
      attachments: thu.tep ? [{ filename: require('node:path').basename(thu.tep), path: thu.tep }] : undefined });
  };
  const guiMail = async (thu) => {
    /* SMTP (VPS tự gửi); SMTP lỗi (sai mật khẩu ứng dụng, Gmail chặn…) → vẫn nhờ Apps Script gửi hộ để khách không mất mail */
    if (smtp) {
      try { await guiSmtp(thu); return 'smtp'; }
      catch (e) { ghi('SMTP lỗi, chuyển sang Apps Script gửi hộ: ' + e.message); if (!cauHinh.appsScriptUrl) throw e; }
    }
    // Nhờ Apps Script gửi hộ bằng MailApp (cần VPS_KHOA)
    const r = await fetch(cauHinh.appsScriptUrl, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ type: 'vpsNhap', viec: 'mail', key: cauHinh.vpsKhoa, thu }), signal: AbortSignal.timeout(60000) });
    const d = JSON.parse(await r.text());
    if (!d.ok) throw new Error(d.msg || 'Apps Script không gửi được');
    return 'apps-script';
  };
  const mot = async (h, nguon) => {
    /* Chạy thử: mail gửi tới chính shop (mã đăng nhập quản trị 2 lớp…) vẫn gửi thật, tiêu đề gắn [VPS thử] */
    const choThu = cauHinh.cheDo !== 'chinh' && h.loai === 'mail' && String(h.thu.to).split(/\s*,\s*/).every((x) => (cauHinh.mailThu || []).includes(x.toLowerCase()));
    if (choThu) h = Object.assign({}, h, { thu: Object.assign({}, h.thu, { subject: '[VPS thử] ' + h.thu.subject }) });
    if (cauHinh.cheDo !== 'chinh' && !choThu) { await luu(h, 'bo-qua-song-song'); ghi('(chạy thử, không gửi) ' + h.loai + ': ' + h.tomTat + ' ← ' + nguon); return; }
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
  const gui = (ds, nguon) => { for (const h of ds) duoi = duoi.then(() => mot(h, nguon)).catch(() => {}); };
  /* Thử SMTP: kiểm tra đăng nhập + gửi 1 mail tới chủ shop */
  gui.thuSmtp = async (toi) => { if (!smtp) throw new Error('Chưa cài SMTP'); await smtp.verify();
    const r = await guiSmtp({ to: toi, subject: 'Thử gửi mail từ máy chủ VPS Hương Chất Kids', body: 'Máy chủ VPS đã gửi mail trực tiếp được (SMTP). Từ giờ mail cho khách gửi thẳng từ VPS, không cần nhờ Google Apps Script.' });
    return { messageId: r.messageId, accepted: r.accepted }; };
  /* Gửi 1 mail kèm tệp (bản sao lưu hằng tháng) – chỉ qua SMTP */
  gui.guiTep = async (thu, tep) => { if (!smtp) throw new Error('Chưa cài SMTP – không gửi được tệp đính kèm');
    const r = await guiSmtp(Object.assign({}, thu, { tep }));
    await luu({ loai: 'mail', tomTat: thu.subject, thu: { to: thu.to, subject: thu.subject, body: thu.body } }, 'da-gui', 'smtp + tệp');
    return { messageId: r.messageId, accepted: r.accepted }; };
  return gui;
}

module.exports = { taoGuiDi };
