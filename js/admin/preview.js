/* =====================================================================
   KHUNG XEM TRƯỚC – chạy chính website thật trong iframe với ?preview=1
   Không phải website giả, không phải ảnh chụp: dùng chung toàn bộ component
   của js/app.js. Bản nháp truyền qua sessionStorage (cùng origin) và
   postMessage (Phase 6 sẽ dùng để cập nhật không cần tải lại).
   ===================================================================== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, esc } = A;

  const TRANG = [
    { v: 'index.html', t: 'Trang chủ' },
    { v: 'collections.html', t: 'Tất cả sản phẩm' },
    { v: 'product.html', t: 'Trang sản phẩm' },
    { v: 'cart.html', t: 'Giỏ hàng' },
    { v: 'checkout.html', t: 'Thanh toán' },
    { v: 'account.html', t: 'Thông tin khách hàng' },
    { v: 'blog.html', t: 'Cẩm nang chăm con' },
  ];
  const MAY = { desktop: { w: 1440, t: 'Máy tính', i: '🖥️' }, tablet: { w: 768, t: 'Máy tính bảng', i: '📱' }, mobile: { w: 390, t: 'Điện thoại', i: '📲' } };

  let may = localStorage.getItem('hck_pv_may') || 'desktop';
  let zoom = Number(localStorage.getItem('hck_pv_zoom')) || 0;   // 0 = vừa khung
  let trang = 'index.html';
  let moHienTai = false;

  function ve() {
    const el = $('#pv'); if (!el) return;
    el.innerHTML = `
      <div class="pv__bar">
        <b>Xem trước</b>
        <select id="pvTrang" aria-label="Chọn trang xem trước">${TRANG.map((t) => `<option value="${t.v}" ${t.v === trang ? 'selected' : ''}>${esc(t.t)}</option>`).join('')}</select>
        <span class="grow"></span>
        <div class="pv__may">${Object.keys(MAY).map((k) => `<button class="icobtn ${k === may ? 'is-on' : ''}" data-may="${k}" title="${esc(MAY[k].t)} (${MAY[k].w}px)">${MAY[k].i}</button>`).join('')}</div>
        <select id="pvZoom" aria-label="Phóng to thu nhỏ">
          <option value="0" ${!zoom ? 'selected' : ''}>Vừa khung</option>
          <option value="0.75" ${zoom === 0.75 ? 'selected' : ''}>75%</option>
          <option value="1" ${zoom === 1 ? 'selected' : ''}>100%</option>
          <option value="1.25" ${zoom === 1.25 ? 'selected' : ''}>125%</option>
        </select>
        <button class="icobtn" id="pvTai" title="Tải lại">↻</button>
        <button class="icobtn" id="pvTab" title="Mở trong tab mới">↗</button>
        <button class="icobtn" id="pvAn" title="Ẩn khung xem trước">✕</button>
      </div>
      <div class="pv__khung" id="pvKhung"><div class="pv__may-box" id="pvBox"><iframe id="pvFrame" title="Xem trước website"></iframe></div></div>
      <div class="pv__note"><span class="cham"></span>Khung này hiện <b>bản nháp</b>. Khách chỉ thấy sau khi bấm <b>Xuất bản</b>.</div>`;
    doMay(); tai();
  }

  function doMay() {
    const box = $('#pvBox'), khung = $('#pvKhung'); if (!box) return;
    const w = MAY[may].w;
    box.style.width = w + 'px';
    const rong = khung.clientWidth - 24;
    const ty = zoom || Math.min(1, rong / w);
    box.style.transform = `scale(${ty})`;
    box.style.height = Math.round(khung.clientHeight / ty) + 'px';
    box.style.marginBottom = Math.round(khung.clientHeight * (1 / ty - 1) * -1) + 'px';
  }

  function tai() {
    const f = $('#pvFrame'); if (!f) return;
    sessionStorage.setItem('hck_preview', JSON.stringify(A.D));
    f.src = trang + (trang.includes('?') ? '&' : '?') + 'preview=1&t=' + Date.now();
  }

  /* Phase 6 sẽ dùng kênh này để cập nhật không cần tải lại.
     Hiện tại iframe nhận bản nháp lúc tải, nên ta nạp lại có tiết chế. */
  const capNhat = A.tre(() => { if (moHienTai) tai(); }, 600);

  function hienKhi(bat) {
    moHienTai = !!bat;
    const el = $('#pv'); if (!el) return;
    el.classList.toggle('hide', !bat);
    document.body.classList.toggle('co-pv', !!bat);
    if (bat && !el.innerHTML.trim()) ve();
    else if (bat) { doMay(); tai(); }
  }

  document.addEventListener('click', (e) => {
    const m = e.target.closest('[data-may]');
    if (m) { may = m.dataset.may; localStorage.setItem('hck_pv_may', may); ve(); return; }
    if (e.target.id === 'pvTai') return tai();
    if (e.target.id === 'pvAn') { $('#pv').classList.add('hide'); document.body.classList.remove('co-pv'); return; }
    if (e.target.id === 'pvTab') { window.open(trang + '?preview=1', '_blank', 'noopener'); return; }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'pvTrang') { trang = e.target.value; tai(); }
    if (e.target.id === 'pvZoom') { zoom = Number(e.target.value); localStorage.setItem('hck_pv_zoom', String(zoom)); doMay(); }
  });
  window.addEventListener('resize', A.tre(doMay, 200));

  A.datPreview({ dung: ve, capNhat, hienKhi, tai, doiTrang(t) { trang = t; tai(); } });
})();
