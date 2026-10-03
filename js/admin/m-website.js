/* ===== WEBSITE – Banner · Menu · Nội dung · SEO (các mục sẽ mở rộng ở phase sau) ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc } = A;

  /* ---------------- BANNER ---------------- */
  let bnDangDoi = -1;
  function veBanner(el) {
    const bs = A.D.BANNERS || [];
    $('#pageAct').innerHTML = `<button class="btn btn--primary" id="btnThemBn">+ Thêm banner</button>`;
    el.innerHTML = `<p class="muted mb-12">Các khung lớn chạy ở đầu trang chủ. Dùng mũi tên để đổi thứ tự – banner trên cùng hiện đầu tiên.</p>
      <div id="bnList">${bs.map((b, i) => `<div class="card bn" data-bn="${i}">
        <div class="bn__h"><b>Banner ${i + 1}</b>
          <span class="grow"></span>
          <button class="icobtn" data-bn-len="${i}" title="Lên trên" ${i === 0 ? 'disabled' : ''}>↑</button>
          <button class="icobtn" data-bn-xuong="${i}" title="Xuống dưới" ${i === bs.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="btn btn--red btn--sm" data-xoa-bn="${i}">Xoá</button></div>
        <div class="row row-2">
          <label>Tiêu đề <span class="muted">(xuống dòng bằng Enter)</span><textarea data-f="title" rows="2">${esc(b.title || '')}</textarea></label>
          <label>Mô tả<textarea data-f="sub" rows="2">${esc(b.sub || '')}</textarea></label>
        </div>
        <div class="row row-4">
          <label>Chữ trên nút<input data-f="cta" value="${esc(b.cta || '')}"></label>
          <label>Link khi bấm<input data-f="link" value="${esc(b.link || '')}"></label>
          <label>Nhãn góc<input data-f="badge" value="${esc(b.badge || '')}"></label>
          <label>Màu nền<select data-f="theme">${['pink', 'teal', 'amber'].map((t) => `<option ${b.theme === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        </div>
        <div class="imgrow"><img src="${esc(b.image || '')}" alt="" onerror="this.style.opacity=.25">
          <button class="btn btn--ghost btn--sm" data-anh-bn="${i}">Đổi ảnh</button>
          <span class="muted">${esc(b.image || 'chưa có ảnh')}</span></div>
      </div>`).join('') || A.trong('Chưa có banner nào', 'Bấm “Thêm banner” để tạo banner đầu tiên.', '🖼️')}</div>`;
  }
  function thuBn() {
    $$('#bnList [data-bn]').forEach((el) => {
      const b = A.D.BANNERS[Number(el.dataset.bn)]; if (!b) return;
      ['title', 'sub', 'cta', 'link', 'badge', 'theme'].forEach((f) => { const i = $(`[data-f="${f}"]`, el); if (i) b[f] = i.value; });
    });
  }

  /* ---------------- TRÌNH CHỈNH SỬA GIAO DIỆN ---------------- */
  function veTheme(el) {
    el.innerHTML = `<div class="card"><h3>🎨 Trình chỉnh sửa giao diện</h3>
      <p class="muted">Kéo thả bố cục trang chủ, đổi màu – phông chữ – bo góc, sửa Header/Footer, và xem đổi ngay trong khung bên phải không cần tải lại.</p>
      <div class="box-note">⚙️ <b>Đang làm ở Phase 6.</b> Nền móng đã xong: khung xem trước chạy chính website thật (không phải ảnh chụp, không phải web giả),
      đã có chọn Máy tính / Máy tính bảng / Điện thoại và phóng to thu nhỏ. Phase 6 sẽ thêm:
      kéo thả khối, bấm thẳng vào phần tử trong khung xem trước để sửa, đổi màu/phông/bo góc toàn site, Header & Footer builder.</div>
      <p>Trong lúc chờ, các phần sau đã sửa được và xem trước ngay: <a href="#/banner">Banner</a> · <a href="#/san-pham">Sản phẩm</a> · <a href="#/flash-sale">Flash sale</a> · <a href="#/qua-tang">Quà tặng</a>.</p></div>`;
  }

  /* ---------------- Sự kiện ---------------- */
  document.addEventListener('click', async (e) => {
    const t = e.target;
    if (t.id === 'btnThemBn') { A.D.BANNERS.push({ title: 'Tiêu đề banner', sub: 'Mô tả ngắn', cta: 'Mua ngay', link: 'collections.html', theme: 'pink', badge: '', image: '' }); A.doiDuLieu(); A.veTrang(); return; }
    const xb = t.closest('[data-xoa-bn]');
    if (xb) { const ok = await A.hoi({ tieuDe: 'Xoá banner?', noiDung: 'Banner này sẽ không hiện trên trang chủ nữa.', nutOk: 'Xoá', nguyHiem: true });
      if (!ok) return; thuBn(); A.D.BANNERS.splice(Number(xb.dataset.xoaBn), 1); A.doiDuLieu(); A.veTrang(); return; }
    const len = t.closest('[data-bn-len]'), xuong = t.closest('[data-bn-xuong]');
    if (len || xuong) { thuBn(); const i = Number((len || xuong).dataset.bnLen ?? (len || xuong).dataset.bnXuong); const j = len ? i - 1 : i + 1;
      const b = A.D.BANNERS; [b[i], b[j]] = [b[j], b[i]]; A.doiDuLieu(); A.veTrang(); return; }
    const ab = t.closest('[data-anh-bn]');
    if (ab) { bnDangDoi = Number(ab.dataset.anhBn); $('#bnFile').click(); return; }
  });
  document.addEventListener('input', (e) => {
    if (e.target.closest('#bnList')) { thuBn(); A.doiDuLieu(); }
    if (['seoT', 'seoD'].includes(e.target.id)) { const m = { seoT: 'gooT', seoD: 'gooD' }[e.target.id]; const el = $('#' + m); if (el) el.textContent = e.target.value; }
  });
  document.addEventListener('change', (e) => { if (e.target.closest('#bnList')) { thuBn(); A.doiDuLieu(); } });

  document.body.insertAdjacentHTML('beforeend', '<input type="file" id="bnFile" accept="image/*" hidden>');
  document.getElementById('bnFile').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f || bnDangDoi < 0) return;
    if (!A.ghToken()) { A.toast('Cần mã GitHub để tải ảnh lên', 'err'); return; }
    A.toast('Đang tải ảnh lên…');
    try {
      const duong = await A.taiAnh(f, 'banner-' + Date.now() + '.' + (f.name.split('.').pop() || 'jpg').toLowerCase());
      thuBn(); A.D.BANNERS[bnDangDoi].image = duong; A.doiDuLieu(); A.veTrang(); A.toast('Đã tải ảnh lên', 'ok');
    } catch (err) { A.toast(err.message, 'err'); }
    e.target.value = '';
  });

  A.dangKy({ route: '/banner', ten: 'Banner', icon: '🖼️', nhom: 'website', quyen: 'banner.view', preview: true, mo: 'Khung lớn ở đầu trang chủ', ve: veBanner });
  A.dangKy({ route: '/giao-dien', ten: 'Trình chỉnh sửa giao diện', icon: '🎨', nhom: 'website', quyen: 'theme.view', preview: true, mo: 'Bố cục, màu sắc, phông chữ', giaiDoan: 6, ve: veTheme });
})();
