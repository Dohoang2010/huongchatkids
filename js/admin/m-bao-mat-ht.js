/* ===== BẢO MẬT HỆ THỐNG – khoá bí mật (token bot Zalo), đăng nhập 2 lớp, sao lưu dữ liệu mỗi đêm =====
   Máy chủ: Apps Script qtBiMat (chỉ SUPER_ADMIN). Khoá bí mật lưu trong Script Properties, không bao giờ hiện lại. */
(() => {
  'use strict';
  const A = window.ADMIN, { $, esc } = A;
  const ZALO = { moi: ['badge--teal', 'Đã cài token mới (lưu riêng trên máy chủ)'], cu: ['badge--hot', 'Đang dùng token cũ đã bị lộ – cần thay'], chua: ['badge--soft', 'Chưa cài'] };

  async function ve(el) {
    el.innerHTML = A.dangTai('cài đặt bảo mật');
    let d;
    try { d = await A.api('qtBiMat', {}); } catch (e) { d = { ok: false, msg: e.message }; }
    if (!d || !d.ok) { el.innerHTML = `<div class="card"><h3>🔐 Bảo mật hệ thống</h3><p class="muted">${esc((d && d.msg) || 'Chưa tải được')}</p></div>`; return; }
    const z = ZALO[d.zalo] || ZALO.chua;
    el.innerHTML = `<div class="grid-2" style="align-items:start">
      <div class="card"><h3>🤖 Token bot Zalo</h3>
        <p>Trạng thái: <span class="badge ${z[0]}">${esc(z[1])}</span></p>
        <p class="muted">Tạo lại token trong trang quản lý bot Zalo (token cũ hết tác dụng), rồi dán vào đây. Token được cất trên máy chủ, không nằm trong mã nguồn và không hiện lại.</p>
        <label>Token mới<input id="bmZalo" type="password" autocomplete="off" placeholder="123456789:AbC…"></label>
        <button class="btn btn--primary" id="bmZaloLuu">Lưu token</button><p class="muted" id="bmZaloKq" style="margin-top:8px"></p></div>
      <div class="card"><h3>🔑 Đăng nhập 2 lớp</h3>
        <p>Trạng thái: <span class="badge ${d.otp ? 'badge--teal' : 'badge--hot'}">${d.otp ? 'Đang bật' : 'Đang TẮT'}</span></p>
        <p class="muted">Tài khoản chủ shop và quản lý: sau mật khẩu phải nhập mã 6 số gửi về email ${esc(d.email || '')}. Nhân viên chỉ cần mật khẩu.</p>
        <button class="btn ${d.otp ? 'btn--ghost' : 'btn--primary'}" id="bmOtp" data-gia-tri="${d.otp ? 'tat' : 'bat'}">${d.otp ? 'Tắt tạm thời (khi không nhận được email)' : 'Bật lại'}</button></div>
      <div class="card"><h3>💾 Sao lưu dữ liệu</h3>
        <p>Lần gần nhất: <b>${esc(d.saoLuu || 'chưa có')}</b></p>
        <p class="muted">Mỗi đêm (1h–5h) toàn bộ Google Sheet được chép sang file sao lưu theo ngày trong tháng, giữ 31 bản xoay vòng, trong Google Drive của shop.</p>
        <button class="btn btn--primary" id="bmSaoLuu">Sao lưu ngay</button>
        ${(d.saoLuuDs || []).length ? `<div class="bm-sl">${d.saoLuuDs.map((x) => `<a href="${esc(x.url)}" target="_blank" rel="noopener">Ngày ${x.ngay}</a>`).join('')}</div>` : ''}</div>
      <div class="card"><h3>🔔 Cảnh báo</h3>
        <p class="muted">Gửi về bot Zalo và email shop khi: đăng nhập quản trị, nhập sai mật khẩu / mã nhiều lần, đổi % hoa hồng, chốt / trả tiền đối tác, điều chỉnh điểm, sửa tài khoản quản trị, có quá nhiều yêu cầu bất thường (bot), sao lưu lỗi.</p>
        <p class="muted">Khoá dự phòng máy chủ: <b>${d.khoaDuPhong ? 'đang đặt' : 'không đặt (an toàn)'}</b>.</p></div></div>`;
  }

  document.addEventListener('click', async (e) => {
    if (!location.hash.startsWith('#/bao-mat-he-thong')) return;
    const goi = async (p, nut) => { nut.disabled = true; try { return await A.api('qtBiMat', p); } catch (err) { return { ok: false, msg: err.message }; } finally { nut.disabled = false; } };
    if (e.target.id === 'bmZaloLuu') { const v = $('#bmZalo').value.trim(); if (!v) return A.toast('Dán token mới', 'err');
      const r = await goi({ viec: 'zalo', giaTri: v }, e.target); A.toast(r.ok ? r.msg : r.msg || 'Lỗi', r.ok ? 'ok' : 'err');
      if (r.ok) { $('#bmZalo').value = ''; $('#bmZaloKq').textContent = /"ok":\s*true/.test(r.kiemTra || '') ? '✓ Bot Zalo trả lời bình thường với token mới.' : 'Đã lưu. Bot chưa xác nhận – kiểm tra lại token.'; } return; }
    if (e.target.id === 'bmOtp') { const tat = e.target.dataset.giaTri === 'tat';
      if (tat && !(await A.hoi({ tieuDe: 'Tắt đăng nhập 2 lớp?', noiDung: 'Chỉ nên tắt khi email shop không nhận được mã. Nhớ bật lại sau.', nutOk: 'Tắt', nguyHiem: true }))) return;
      const r = await goi({ viec: 'otp', giaTri: tat ? 'tat' : 'bat' }, e.target); A.toast(r.msg || 'Lỗi', r.ok ? 'ok' : 'err'); return A.veTrang(); }
    if (e.target.id === 'bmSaoLuu') { e.target.textContent = 'Đang sao lưu…'; const r = await goi({ viec: 'saoLuu' }, e.target); A.toast(r.ok ? r.msg : r.msg || 'Lỗi', r.ok ? 'ok' : 'err'); return A.veTrang(); }
  });

  A.dangKy({ route: '/bao-mat-he-thong', ten: 'Bảo mật hệ thống', icon: '🛡️', nhom: 'he-thong', quyen: '*', mo: 'Khoá bí mật, đăng nhập 2 lớp, sao lưu, cảnh báo', ve });
})();
