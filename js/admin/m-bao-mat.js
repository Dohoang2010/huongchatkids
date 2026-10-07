/* ===== BẢO MẬT TÀI KHOẢN KHÁCH – cấu hình Quên mật khẩu + mẫu email (xem trước trực tiếp) + thẻ bảo mật ở chi tiết khách =====
   Máy chủ: Apps Script qtQmkCauHinh / qtBaoMatKhach. Không bao giờ hiện mật khẩu, mã băm, OTP hay reset token. */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc } = A;
  let cfg = null, thongTin = { shop: 'Hương Chất Kids', hotline: '' };
  const SO = [['otpPhut', 'Mã OTP hết hạn sau (phút)', 1, 60], ['saiToiDa', 'Nhập sai tối đa (lần) rồi khoá mã', 1, 20], ['choGuiLaiGiay', 'Chờ giữa 2 lần gửi lại (giây)', 10, 600],
    ['guiToiDa15p', 'Mỗi email gửi tối đa / 15 phút', 1, 50], ['mayToiDa15p', 'Mỗi máy gửi tối đa / 15 phút', 1, 100], ['heThongToiDa15p', 'Toàn hệ thống tối đa / 15 phút', 5, 1000],
    ['tokenPhut', 'Phiên đặt mật khẩu mới sống (phút)', 5, 60], ['mkToiThieu', 'Mật khẩu mới tối thiểu (ký tự)', 6, 32]];
  const BUOC = [['email', '1. Nhập email'], ['otp', '2. Nhập OTP'], ['mk', '3. Mật khẩu mới'], ['xong', '4. Thành công'], ['hethan', 'Hết hạn']];
  const dien = (mau, v) => String(mau || '').replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  const giaTri = (id) => ($('#' + id) || {}).value;

  /* Xem trước email: thay biến bằng dữ liệu mẫu, cập nhật ngay khi gõ */
  function veEmail() {
    const v = { ten: 'Nguyễn Văn An', otp: '483921', phut: giaTri('qmk_otpPhut') || 15, shop: thongTin.shop, hotline: thongTin.hotline, sdt: '09****67', luc: '13:25 07/10/2026' };
    const the = (td, nd, lamNoi) => `<div class="em-pv"><div class="em-pv__head"><img src="img/logo-96.png" alt=""><b>${esc(thongTin.shop)}</b></div>
      <div class="em-pv__sub">${esc(dien(td, v))}</div><div class="em-pv__body">${esc(dien(nd, v)).replace(/\n/g, '<br>').replace(lamNoi, '<span class="em-pv__otp">$1</span>')}</div></div>`;
    $('#pvOtp').innerHTML = the(giaTri('qmk_tieuDeOtp'), giaTri('qmk_noiDungOtp'), /(483921)/);
    $('#pvDoi').innerHTML = the(giaTri('qmk_tieuDeDoi'), giaTri('qmk_noiDungDoi'), /(^$)/);
    const b = $('#pvLuong .tab2.is-on'); veLuong(b ? b.dataset.buoc : 'email');
  }
  /* Xem trước 5 màn hình khách thấy (trang quen-mat-khau.html ở chế độ xem) */
  function veLuong(buoc) {
    $$('#pvLuong .tab2').forEach((x) => x.classList.toggle('is-on', x.dataset.buoc === buoc));
    const f = $('#pvKhung'); if (!f) return;
    const src = `quen-mat-khau.html?xem=${buoc}&phut=${encodeURIComponent(giaTri('qmk_otpPhut') || 15)}&min=${encodeURIComponent(giaTri('qmk_mkToiThieu') || 8)}`;
    if (f.getAttribute('src') !== src) f.setAttribute('src', src);
  }
  async function veQmkCauHinh(b) {
    b.innerHTML = A.dangTai('cấu hình quên mật khẩu');
    try {
      const d = await A.api('qtQmkCauHinh', {}); if (!d || !d.ok) { b.innerHTML = A.loiTai((d && d.msg) || 'Apps Script chưa có phần Quên mật khẩu'); return; }
      cfg = d.cauHinh; thongTin = { shop: d.shop || thongTin.shop, hotline: d.hotline || '' };
      b.innerHTML = `<h3>🔁 Quên mật khẩu (OTP qua email)</h3>
        <p class="muted">Khách vào <b>Tài khoản → Quên mật khẩu?</b>: nhập email đã lưu trong hồ sơ → nhận mã OTP 6 số → tạo mật khẩu mới (nhập 2 lần). Email không có trong hệ thống thì không gửi gì (trả lời trung lập). Đặt lại xong mọi thiết bị của khách bị đăng xuất và khách nhận email thông báo. Vẫn giữ cách lấy OTP qua số điện thoại.</p>
        <div class="grid-2 qmk-ch">${SO.map(([k, t, mi, ma]) => `<label>${t}<input id="qmk_${k}" type="number" min="${mi}" max="${ma}" value="${esc(cfg[k])}"></label>`).join('')}</div>
        <h3 style="margin-top:8px">✉️ Mẫu email</h3>
        <p class="muted">Biến dùng được: <code>{ten}</code> tên khách · <code>{otp}</code> mã OTP (bắt buộc ở email OTP) · <code>{phut}</code> số phút hiệu lực · <code>{shop}</code> · <code>{hotline}</code> · <code>{sdt}</code> số điện thoại (đã che) · <code>{luc}</code> thời điểm đổi.</p>
        <div class="em-grid">
          <div><label>Tiêu đề email OTP<input id="qmk_tieuDeOtp" maxlength="200" value="${esc(cfg.tieuDeOtp)}"></label>
            <label>Nội dung email OTP<textarea id="qmk_noiDungOtp" rows="9">${esc(cfg.noiDungOtp)}</textarea></label></div>
          <div><div class="em-nhan">LIVE PREVIEW – email OTP</div><div id="pvOtp"></div></div>
          <div><label>Tiêu đề email “đã đổi mật khẩu”<input id="qmk_tieuDeDoi" maxlength="200" value="${esc(cfg.tieuDeDoi)}"></label>
            <label>Nội dung email “đã đổi mật khẩu”<textarea id="qmk_noiDungDoi" rows="7">${esc(cfg.noiDungDoi)}</textarea></label></div>
          <div><div class="em-nhan">LIVE PREVIEW – email thông báo</div><div id="pvDoi"></div></div>
        </div>
        <h3>📱 Xem trước màn hình khách</h3>
        <div class="tabs2" id="pvLuong">${BUOC.map(([k, t]) => `<button type="button" class="tab2" data-buoc="${k}">${t}</button>`).join('')}</div>
        <div class="pv-dt"><iframe id="pvKhung" title="Xem trước trang quên mật khẩu" loading="lazy"></iframe></div>
        <div style="display:flex;gap:8px;margin-top:14px"><button class="btn btn--primary" id="qmkLuu">Lưu cấu hình</button><button class="btn btn--ghost" id="qmkMacDinh">Khôi phục mẫu mặc định</button></div>
        <p class="muted" style="margin-top:8px">Mật khẩu, mã OTP và token không bao giờ được lưu dạng chữ thường hay hiện ở trang quản trị. Mọi yêu cầu được ghi vào Nhật ký (PASSWORD_RESET_REQUESTED, OTP_SENT, OTP_VERIFIED, OTP_FAILED, OTP_LOCKED, PASSWORD_RESET_SUCCESS…).</p>`;
      veEmail(); veLuong('email');
    } catch (e) { b.innerHTML = A.loiTai(e.message); }
  }
  document.addEventListener('input', (e) => { if (e.target.id && e.target.id.startsWith('qmk_') && $('#pvOtp')) veEmail(); });
  document.addEventListener('click', async (e) => {
    const bu = e.target.closest('#pvLuong [data-buoc]'); if (bu) return veLuong(bu.dataset.buoc);
    if (e.target.id === 'qmkMacDinh') {
      const ok = await A.hoi({ tieuDe: 'Khôi phục mẫu email mặc định?', noiDung: 'Tiêu đề và nội dung 2 email sẽ về mẫu ban đầu (chưa lưu cho tới khi bấm Lưu).', nutOk: 'Khôi phục' }); if (!ok) return;
      ['tieuDeOtp', 'noiDungOtp', 'tieuDeDoi', 'noiDungDoi'].forEach((k) => { $('#qmk_' + k).value = MAC_DINH[k]; }); veEmail();
    }
    if (e.target.id === 'qmkLuu') {
      const p = { luu: '1' }; SO.forEach(([k]) => { p[k] = giaTri('qmk_' + k); }); ['tieuDeOtp', 'noiDungOtp', 'tieuDeDoi', 'noiDungDoi'].forEach((k) => { p[k] = giaTri('qmk_' + k); });
      if (!p.noiDungOtp.includes('{otp}')) return A.toast('Nội dung email OTP phải có {otp}', 'err');
      const ok = await A.hoi({ tieuDe: 'Lưu cấu hình quên mật khẩu?', noiDung: `OTP hết hạn sau <b>${esc(p.otpPhut)} phút</b>, sai tối đa <b>${esc(p.saiToiDa)} lần</b>, mật khẩu tối thiểu <b>${esc(p.mkToiThieu)} ký tự</b>. Áp dụng ngay cho yêu cầu mới.`, nutOk: 'Lưu' }); if (!ok) return;
      try { const r = await A.api('qtQmkCauHinh', p); A.toast(r && r.ok ? 'Đã lưu cấu hình' : (r && r.msg) || 'Chưa lưu được', r && r.ok ? 'ok' : 'err'); } catch (err) { A.toast(err.message, 'err'); }
    }
  });
  const MAC_DINH = {
    tieuDeOtp: 'Mã OTP đặt lại mật khẩu',
    noiDungOtp: 'Xin chào {ten},\n\nBạn vừa yêu cầu đặt lại mật khẩu tài khoản tại {shop}.\n\nMã OTP của bạn là: {otp}\n\nMã OTP có hiệu lực trong {phut} phút và chỉ dùng được 1 lần.\n\nNếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.\n\nTrân trọng,\n{shop}',
    tieuDeDoi: 'Mật khẩu tài khoản đã được thay đổi',
    noiDungDoi: 'Xin chào {ten},\n\nMật khẩu tài khoản {sdt} tại {shop} vừa được thay đổi thành công lúc {luc}.\nMọi thiết bị đang đăng nhập đã được đăng xuất.\n\nNếu bạn không thực hiện thao tác này, vui lòng liên hệ ngay hotline {hotline}.\n\n{shop}',
  };

  /* Thẻ "Bảo mật" ở chi tiết khách */
  async function veBaoMatKhach(el, sdt) {
    if (!el) return; el.innerHTML = '<h3>🔐 Bảo mật tài khoản</h3><p class="muted">Đang tải…</p>';
    try {
      const d = await A.api('qtBaoMatKhach', { sdt }); if (!d || !d.ok) { el.innerHTML = `<h3>🔐 Bảo mật tài khoản</h3><p class="muted">${esc((d && d.msg) || 'Chưa tải được')}</p>`; return; }
      const TT = { PENDING: 'Chờ nhập OTP', OTP_VERIFIED: 'Đã xác thực OTP', PASSWORD_RESET: 'Đã đặt lại', EXPIRED: 'Hết hạn', LOCKED: 'Khoá (sai nhiều lần)', CANCELLED: 'Đã thay mã mới' };
      el.innerHTML = `<h3>🔐 Bảo mật tài khoản</h3>
        <div class="kh-row"><span>Email</span><b>${d.coEmail ? esc(d.email) + ' ' + A.badge('Dùng lấy lại mật khẩu', 'tag--ok') : '<span class="muted">Chưa có – khách chỉ lấy lại mật khẩu qua SĐT</span>'}</b></div>
        <div class="kh-row"><span>Số điện thoại</span><b>${esc(d.sdt)} ${A.badge('Đã xác minh (OTP)', 'tag--ok')}</b></div>
        <div class="kh-row"><span>Mật khẩu</span><b>${esc(d.matKhau)}</b></div>
        <div class="kh-row"><span>Đổi mật khẩu gần nhất</span><b>${esc(d.doiMkLuc || '—')}</b></div>
        <div class="kh-row"><span>Thiết bị đang đăng nhập</span><b>${d.phienDangMo}</b></div>
        <div class="kh-row"><span>Trạng thái</span><b>${d.khoa ? A.badge('Đã khoá', 'tag--no') : A.badge('Bình thường', 'tag--ok')}</b></div>
        <h4 style="margin:12px 0 6px">Yêu cầu đặt lại mật khẩu (${d.yeuCau.length})</h4>
        ${d.yeuCau.length ? `<div class="tbl-wrap"><table><thead><tr><th>Thời gian</th><th>Kênh</th><th>Trạng thái</th><th class="num">Nhập sai</th><th>Hoàn tất</th></tr></thead><tbody>
          ${d.yeuCau.map((y) => `<tr><td><small>${esc(y.ngay)}</small></td><td>${esc(y.kenh)}</td><td>${A.badge(TT[y.trangThai] || y.trangThai, y.trangThai === 'PASSWORD_RESET' ? 'tag--ok' : y.trangThai === 'LOCKED' ? 'tag--no' : '')}</td><td class="num">${y.sai}</td><td><small>${esc(y.hoanTat || '—')}</small></td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">Chưa có yêu cầu nào.</p>'}
        <p class="muted" style="margin-top:6px">Không hiển thị mật khẩu, mã băm, OTP hay token.</p>`;
    } catch (e) { el.innerHTML = `<h3>🔐 Bảo mật tài khoản</h3><p class="muted">${esc(e.message)}</p>`; }
  }
  A.veQmkCauHinh = veQmkCauHinh; A.veBaoMatKhach = veBaoMatKhach;
})();
