/* ===== TRÌNH CHỈNH SỬA GIAO DIỆN – bố cục, màu, phông, Header/Footer
   Mọi thay đổi gửi thẳng vào khung xem trước qua postMessage, đổi là thấy ngay. ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc } = A;

  const MAU = [
    { k: 'primary', t: 'Màu chính', mo: 'nút, giá, nhãn, link' },
    { k: 'teal', t: 'Màu phụ', mo: 'ưu đãi, trạng thái tốt' },
    { k: 'amber', t: 'Màu nhấn', mo: 'cảnh báo, nhãn vàng' },
    { k: 'ink', t: 'Màu chữ', mo: 'chữ chính trên trang' },
    { k: 'bg-soft', t: 'Nền mềm', mo: 'nền các khối xen kẽ' },
  ];
  const BO_MAU = [
    { t: 'Hồng Hương Chất (mặc định)', m: { primary: '#F0537A', teal: '#17A398', amber: '#FFB020', ink: '#22202A', 'bg-soft': '#FFF8FA' } },
    { t: 'Cam năng động', m: { primary: '#F2682A', teal: '#13A3A3', amber: '#F5A524', ink: '#231E1A', 'bg-soft': '#FFF6F0' } },
    { t: 'Xanh dương tin cậy', m: { primary: '#2F6FDB', teal: '#17A398', amber: '#FFB020', ink: '#1C2333', 'bg-soft': '#F3F7FF' } },
    { t: 'Xanh lá tự nhiên', m: { primary: '#2E9E5B', teal: '#0F9488', amber: '#E8A317', ink: '#1C2A22', 'bg-soft': '#F2FBF5' } },
    { t: 'Tím dịu', m: { primary: '#7C5CD6', teal: '#17A398', amber: '#F2A93B', ink: '#241F33', 'bg-soft': '#F8F5FF' } },
  ];
  const FONT = ['Be Vietnam Pro', 'Quicksand', 'Nunito', 'Inter', 'Roboto', 'Montserrat', 'Lora'];

  const T = () => (A.D.THEME = A.D.THEME || A.sao(window.THEME || {}));
  let mucMo = 'bo-cuc';

  function ve(el) {
    const t = T();
    $('#pageAct').innerHTML = `<label class="sw" style="margin:0"><input type="checkbox" id="thSua" checked> Chế độ bấm để sửa</label>`;
    el.innerHTML = `
      <div class="th">
        <div class="th__tab">
          ${[['bo-cuc', '🧩 Bố cục'], ['mau', '🎨 Màu sắc'], ['chu', '🔤 Phông chữ'], ['header', '🧭 Header'], ['footer', '🦶 Footer']]
            .map(([k, n]) => `<button class="th__t ${k === mucMo ? 'is-on' : ''}" data-th="${k}">${n}</button>`).join('')}
        </div>
        <div id="thBody"></div>
      </div>`;
    veMuc();
    guiTheme(); guiMode(true);
  }

  function veMuc() {
    const t = T(); const b = $('#thBody'); if (!b) return;

    if (mucMo === 'bo-cuc') b.innerHTML = `
      <p class="muted">Kéo thứ tự bằng ↑ ↓, tắt công tắc để ẩn khối khỏi trang chủ. Bấm vào tên khối để nhảy tới khối đó trong khung xem trước.</p>
      <div class="kb">${(t.khoi || []).map((k, i) => `<div class="kb__i ${k.bat === false ? 'is-off' : ''}" data-kb="${i}">
        <span class="kb__n">${i + 1}</span>
        <button class="kb__ten" data-toi="${esc(k.key)}">${esc(k.ten)}</button>
        <span class="grow"></span>
        <button class="icobtn" data-kb-len="${i}" ${i === 0 ? 'disabled' : ''} title="Lên trên">↑</button>
        <button class="icobtn" data-kb-xuong="${i}" ${i === (t.khoi || []).length - 1 ? 'disabled' : ''} title="Xuống dưới">↓</button>
        <label class="sw" style="margin:0"><input type="checkbox" data-kb-bat="${i}" ${k.bat === false ? '' : 'checked'}></label>
      </div>`).join('')}</div>`;

    if (mucMo === 'mau') b.innerHTML = `
      <h4 style="margin-top:0">Bộ màu có sẵn</h4>
      <div class="bo-mau">${BO_MAU.map((x, i) => `<button class="bo-mau__i" data-bomau="${i}">
        <span class="bo-mau__c">${Object.values(x.m).slice(0, 4).map((c) => `<i style="background:${c}"></i>`).join('')}</span>
        <b>${esc(x.t)}</b></button>`).join('')}</div>
      <h4>Tuỳ chỉnh từng màu</h4>
      ${MAU.map((m) => `<div class="mau-r">
        <input type="color" data-mau="${m.k}" value="${esc((t.mau || {})[m.k] || '#000000')}">
        <div><b>${esc(m.t)}</b><small>${esc(m.mo)}</small></div>
        <input class="mau-hex" data-mau-hex="${m.k}" value="${esc((t.mau || {})[m.k] || '')}" maxlength="7">
      </div>`).join('')}
      <div class="box-note">Đổi <b>Màu chính</b> là nút, giá, nhãn, viền, nền nhạt… đổi theo cả site — web tự tính các sắc độ đậm nhạt.</div>`;

    if (mucMo === 'chu') b.innerHTML = `
      <div class="row row-2">
        <label>Phông chữ nội dung<select data-chu="body">${FONT.map((f) => `<option ${(t.chu || {}).body === f ? 'selected' : ''}>${f}</option>`).join('')}</select></label>
        <label>Phông chữ tiêu đề<select data-chu="heading">${FONT.map((f) => `<option ${(t.chu || {}).heading === f ? 'selected' : ''}>${f}</option>`).join('')}</select></label>
      </div>
      <label>Cỡ chữ nền (px) — <b id="coHien">${(t.chu || {}).co || 15}px</b>
        <input type="range" min="13" max="18" step="0.5" data-chu="co" value="${(t.chu || {}).co || 15}"></label>
      <label>Bo góc (px) — <b id="boHien">${(t.bo || {}).radius || 16}px</b>
        <input type="range" min="0" max="26" step="1" data-bo="radius" value="${(t.bo || {}).radius || 16}"></label>
      <div class="box-note">Phông tải từ Google Fonts. Chọn xong nhìn khung bên phải là thấy ngay.</div>`;

    if (mucMo === 'header') b.innerHTML = `
      <label class="sw"><input type="checkbox" data-hd="sticky" ${(t.header || {}).sticky !== false ? 'checked' : ''}> Header dính khi cuộn trang</label>
      <label class="sw"><input type="checkbox" data-hd="hienTimKiem" ${(t.header || {}).hienTimKiem !== false ? 'checked' : ''}> Hiện ô tìm kiếm</label>
      <label class="sw"><input type="checkbox" data-hd="hienGioHang" ${(t.header || {}).hienGioHang !== false ? 'checked' : ''}> Hiện giỏ hàng</label>
      <label class="sw"><input type="checkbox" data-hd="hienTaiKhoan" ${(t.header || {}).hienTaiKhoan !== false ? 'checked' : ''}> Hiện tài khoản</label>
      <div class="box-note">Nội dung menu sửa ở mục <a href="#/menu">Menu</a>. Logo, hotline, Zalo sửa ở <a href="#/cau-hinh/chung">Cấu hình</a>.</div>`;

    if (mucMo === 'footer') b.innerHTML = `
      <p class="muted">Footer đang lấy dữ liệu từ <code>SITE</code> và danh mục sản phẩm — đổi hotline, địa chỉ, mạng xã hội ở <a href="#/cau-hinh/chung">Cấu hình</a>.</p>
      <div class="box-note">⚙️ <b>Sẽ bổ sung ở Phase 8:</b> sắp xếp cột footer, tự chọn nhóm link cho từng cột.</div>`;
  }

  /* ---------- Gửi sang khung xem trước ---------- */
  function khung() { const f = $('#pvFrame'); return f && f.contentWindow; }
  const guiTheme = A.tre(() => { const w = khung(); if (w) w.postMessage({ type: 'hck-theme', theme: T() }, '*'); }, 90);
  function guiMode(sua) { const w = khung(); if (w) w.postMessage({ type: 'hck-mode', sua }, '*'); }
  function toiKhoi(key) { const w = khung(); if (w) w.postMessage({ type: 'hck-toi', khoi: key }, '*'); }

  /* Khung xem trước tải xong thì gửi lại theme + chế độ sửa */
  window.addEventListener('message', (e) => {
    const d = e.data; if (!d || typeof d !== 'object') return;
    if (d.type === 'hck-san-sang') { guiTheme(); guiMode($('#thSua') ? $('#thSua').checked : false); return; }
    if (d.type === 'hck-chon') {
      if (!$('#thBody')) return;
      const t = T(); const i = (t.khoi || []).findIndex((k) => k.key === d.khoi);
      mucMo = 'bo-cuc'; veMuc();
      $$('.th__t').forEach((x) => x.classList.toggle('is-on', x.dataset.th === 'bo-cuc'));
      const el = $(`[data-kb="${i}"]`);
      if (el) { el.classList.add('is-chon'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); setTimeout(() => el.classList.remove('is-chon'), 1600); }
      A.toast('Đang sửa khối: ' + ((t.khoi[i] || {}).ten || d.khoi));
    }
  });

  /* ---------- Sự kiện ---------- */
  document.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-th]');
    if (tab) { mucMo = tab.dataset.th; $$('.th__t').forEach((x) => x.classList.toggle('is-on', x === tab)); veMuc(); return; }
    const toi = e.target.closest('[data-toi]'); if (toi) return toiKhoi(toi.dataset.toi);
    const len = e.target.closest('[data-kb-len]'), xuong = e.target.closest('[data-kb-xuong]');
    if (len || xuong) {
      const t = T(); const i = Number((len || xuong).dataset.kbLen ?? (len || xuong).dataset.kbXuong); const j = len ? i - 1 : i + 1;
      [t.khoi[i], t.khoi[j]] = [t.khoi[j], t.khoi[i]];
      A.doiDuLieu(); veMuc(); guiTheme(); return;
    }
    const bm = e.target.closest('[data-bomau]');
    if (bm) { const t = T(); t.mau = { ...(t.mau || {}), ...BO_MAU[Number(bm.dataset.bomau)].m }; A.doiDuLieu(); veMuc(); guiTheme(); A.toast('Đã đổi bộ màu'); return; }
  });

  document.addEventListener('input', (e) => {
    const t = T();
    const mau = e.target.dataset.mau, hex = e.target.dataset.mauHex;
    if (mau || hex) {
      const k = mau || hex; const v = e.target.value.trim();
      if (!/^#[0-9a-fA-F]{3,6}$/.test(v)) return;
      t.mau = t.mau || {}; t.mau[k] = v;
      const doi = hex ? $(`[data-mau="${k}"]`) : $(`[data-mau-hex="${k}"]`);
      if (doi) doi.value = v;
      A.doiDuLieu(); guiTheme(); return;
    }
    if (e.target.dataset.chu) {
      t.chu = t.chu || {}; const k = e.target.dataset.chu;
      t.chu[k] = k === 'co' ? Number(e.target.value) : e.target.value;
      if (k === 'co' && $('#coHien')) $('#coHien').textContent = t.chu.co + 'px';
      A.doiDuLieu(); guiTheme(); return;
    }
    if (e.target.dataset.bo) {
      t.bo = t.bo || {}; t.bo[e.target.dataset.bo] = Number(e.target.value);
      if ($('#boHien')) $('#boHien').textContent = t.bo.radius + 'px';
      A.doiDuLieu(); guiTheme(); return;
    }
  });

  document.addEventListener('change', (e) => {
    const t = T();
    if (e.target.id === 'thSua') return guiMode(e.target.checked);
    if (e.target.dataset.chu) { t.chu = t.chu || {}; t.chu[e.target.dataset.chu] = e.target.value; A.doiDuLieu(); guiTheme(); return; }
    if (e.target.dataset.hd) { t.header = t.header || {}; t.header[e.target.dataset.hd] = e.target.checked; A.doiDuLieu(); guiTheme(); return; }
    const bat = e.target.dataset.kbBat;
    if (bat !== undefined) { t.khoi[Number(bat)].bat = e.target.checked; A.doiDuLieu(); veMuc(); guiTheme(); return; }
  });

  A.dangKy({ route: '/giao-dien', ten: 'Trình chỉnh sửa giao diện', icon: '🎨', nhom: 'website', quyen: 'theme.view', preview: true,
    mo: 'Bố cục, màu sắc, phông chữ – đổi là thấy ngay', ve });
})();
