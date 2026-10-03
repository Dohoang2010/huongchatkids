/* ===== MENU – sửa thanh menu chính và các cột trong menu thả xuống ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc } = A;
  const nav = () => A.D.NAV || [];
  let moCot = -1;   // đang mở menu thả xuống của mục nào

  function ve(el) {
    $('#pageAct').innerHTML = `<button class="btn btn--primary" id="mnThem">+ Thêm mục menu</button>`;
    el.innerHTML = `<div class="card">
      <p class="muted">Thanh menu chính của website. Dùng ↑ ↓ để đổi thứ tự. Mục có <b>cột con</b> sẽ hiện menu thả xuống khi khách rê chuột.</p>
      <div id="mnList">${nav().map((n, i) => mucHTML(n, i)).join('') || A.trong('Chưa có mục menu nào', 'Bấm “Thêm mục menu”.', '🧭')}</div>
      <div class="box-note">Tên rút gọn dùng cho màn hình hẹp để thanh menu không bị tràn: <b>Tên hiển thị</b> cho màn rộng,
      <b>Tên vừa</b> cho màn trung bình, <b>Tên ngắn nhất</b> cho màn hẹp.</div></div>`;
  }

  const mucHTML = (n, i) => `<div class="mn" data-mn="${i}">
    <div class="mn__h">
      <b>${esc(n.label || '(chưa đặt tên)')}</b>
      ${n.columns && n.columns.length ? A.badge(`${n.columns.length} cột con`) : A.badge('Không có menu con', 'tag--off')}
      <span class="grow"></span>
      <button class="icobtn" data-mn-len="${i}" title="Lên trên" ${i === 0 ? 'disabled' : ''}>↑</button>
      <button class="icobtn" data-mn-xuong="${i}" title="Xuống dưới" ${i === nav().length - 1 ? 'disabled' : ''}>↓</button>
      <button class="btn btn--ghost btn--sm" data-mn-cot="${i}">${moCot === i ? 'Đóng menu con' : 'Menu con'}</button>
      <button class="btn btn--red btn--sm" data-mn-xoa="${i}">Xoá</button>
    </div>
    <div class="row row-4">
      <label>Tên hiển thị<input data-f="label" value="${esc(n.label || '')}"></label>
      <label>Tên vừa<input data-f="short" value="${esc(n.short || '')}" placeholder="để trống = dùng tên hiển thị"></label>
      <label>Tên ngắn nhất<input data-f="tiny" value="${esc(n.tiny || '')}" placeholder="để trống = dùng tên vừa"></label>
      <label>Link khi bấm<input data-f="link" value="${esc(n.link || '')}" placeholder="VD: collections.html?cat=sua"></label>
    </div>
    ${moCot === i ? cotHTML(n, i) : ''}</div>`;

  const cotHTML = (n, i) => `<div class="mn__cot">
    <h4>Menu thả xuống</h4>
    ${(n.columns || []).map((c, j) => `<div class="mn__c" data-col="${j}">
      <div class="mn__ch"><input data-c="title" value="${esc(c.title || '')}" placeholder="Tiêu đề cột">
        <button class="btn btn--red btn--sm" data-col-xoa="${i}-${j}">Xoá cột</button></div>
      <label>Các dòng — mỗi dòng ghi <code>Tên | link</code>
        <textarea data-c="links" rows="${Math.max(3, (c.links || []).length + 1)}">${esc((c.links || []).map((l) => `${l[0]} | ${l[1]}`).join('\n'))}</textarea></label>
    </div>`).join('')}
    <button class="btn btn--ghost btn--sm" data-col-them="${i}">+ Thêm cột</button></div>`;

  function thu() {
    $$('#mnList [data-mn]').forEach((el) => {
      const n = nav()[Number(el.dataset.mn)]; if (!n) return;
      ['label', 'short', 'tiny', 'link'].forEach((f) => {
        const inp = $(`:scope > .row [data-f="${f}"]`, el); if (!inp) return;
        const v = inp.value.trim();
        if (v) n[f] = v; else delete n[f];
      });
      const cots = $$('.mn__c', el);
      if (cots.length) {
        n.columns = cots.map((c) => ({
          title: $('[data-c="title"]', c).value.trim(),
          links: $('[data-c="links"]', c).value.split('\n').map((d) => d.trim()).filter(Boolean)
            .map((d) => { const [t, ...r] = d.split('|'); return [t.trim(), r.join('|').trim()]; }),
        }));
      }
    });
  }

  document.addEventListener('click', async (e) => {
    const t = e.target;
    if (t.id === 'mnThem') { thu(); nav().push({ label: 'Mục mới', link: 'collections.html' }); A.doiDuLieu(); A.veTrang(); return; }
    const xoa = t.closest('[data-mn-xoa]');
    if (xoa) { const i = Number(xoa.dataset.mnXoa);
      const ok = await A.hoi({ tieuDe: 'Xoá mục menu?', noiDung: `Mục <b>${esc(nav()[i].label)}</b> sẽ biến mất khỏi thanh menu.`, nutOk: 'Xoá', nguyHiem: true });
      if (!ok) return; thu(); nav().splice(i, 1); moCot = -1; A.doiDuLieu(); A.veTrang(); return; }
    const len = t.closest('[data-mn-len]'), xuong = t.closest('[data-mn-xuong]');
    if (len || xuong) { thu(); const i = Number((len || xuong).dataset.mnLen ?? (len || xuong).dataset.mnXuong); const j = len ? i - 1 : i + 1;
      const d = nav(); [d[i], d[j]] = [d[j], d[i]]; moCot = -1; A.doiDuLieu(); A.veTrang(); return; }
    const cot = t.closest('[data-mn-cot]');
    if (cot) { thu(); const i = Number(cot.dataset.mnCot); moCot = moCot === i ? -1 : i; A.veTrang(); return; }
    const them = t.closest('[data-col-them]');
    if (them) { thu(); const n = nav()[Number(them.dataset.colThem)]; n.columns = n.columns || []; n.columns.push({ title: 'Cột mới', links: [] }); A.doiDuLieu(); A.veTrang(); return; }
    const cx = t.closest('[data-col-xoa]');
    if (cx) { thu(); const [i, j] = cx.dataset.colXoa.split('-').map(Number); nav()[i].columns.splice(j, 1); A.doiDuLieu(); A.veTrang(); return; }
  });
  document.addEventListener('input', (e) => { if (e.target.closest('#mnList')) { thu(); A.doiDuLieu(); } });

  A.dangKy({ route: '/menu', ten: 'Menu', icon: '🧭', nhom: 'website', quyen: 'content.view', preview: true, mo: 'Thanh menu chính của website', ve });
})();
