/* ===== ĐÁNH GIÁ SẢN PHẨM – duyệt / ẩn / trả lời đánh giá khách viết trên website (js/danh-gia.js) ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, esc } = A;
  const R = '/danh-gia';
  let ds = null, tab = 'cho', dangTai = false;
  const TT = { cho: ['Chờ duyệt', 'tag--wait'], hien: ['Đang hiện', 'tag--ok'], an: ['Đã ẩn', 'tag--off'] };
  const GOC = () => { try { return new URL((SITE.loyalty || {}).endpoint || '').origin; } catch { return ''; } };
  const ngay = (t) => new Date(t).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  const sp = (id) => (A.D.PRODUCTS || window.PRODUCTS || []).find((p) => p.id === id);

  async function tai() {
    if (dangTai) return; dangTai = true;
    try { const r = await A.api('qtDgDs', {}); if (!r || !r.ok) throw new Error((r && r.msg) || 'Chưa tải được'); ds = r.ds || []; }
    catch (e) { A.toast(e.message, 'err'); ds = ds || []; } finally { dangTai = false; }
    if (location.hash.startsWith('#' + R)) A.veTrang();
  }
  function ve(el) {
    $('#pageAct').innerHTML = '<button class="btn btn--ghost" id="dgTaiLai">↻ Tải lại</button>';
    if (!ds) { el.innerHTML = A.trong('Đang tải đánh giá…', '', '⏳'); tai(); return; }
    const dem = { tat: ds.length, cho: 0, hien: 0, an: 0 }; ds.forEach((d) => { dem[d.trangThai] = (dem[d.trangThai] || 0) + 1; });
    const list = ds.filter((d) => tab === 'tat' || d.trangThai === tab);
    el.innerHTML = `<div class="card"><h3>⭐ Đánh giá của khách</h3>
      <p class="muted">Khách đã mua sản phẩm thì đánh giá hiện ngay (nhãn "Đã mua hàng"); khách chưa mua cần duyệt. Mỗi đánh giá mới đều được báo qua Zalo bot.</p>
      <div class="vc-tabs">${[['cho', 'Chờ duyệt'], ['hien', 'Đang hiện'], ['an', 'Đã ẩn'], ['tat', 'Tất cả']].map(([k, t]) => `<button class="${tab === k ? 'is-on' : ''}" data-dg-tab="${k}">${t} (${dem[k] || 0})</button>`).join('')}</div>
      ${list.length ? list.map((d) => { const p = sp(d.id), [tt, cls] = TT[d.trangThai] || [d.trangThai, '']; return `<div class="dg-qt" data-dg="${esc(d.ma)}">
        <div class="dg-qt__dau">${p ? `<img src="${esc(p.thumb || p.image || '')}" alt="">` : ''}<div><b>${esc(p ? (p.short || p.name) : d.tenSP || d.id)}</b><small>${'★'.repeat(d.sao)}${'☆'.repeat(5 - d.sao)} · ${esc(d.ten)} · <a href="#/thanh-vien/${encodeURIComponent(d.sdt)}">${esc(d.sdt)}</a> · ${ngay(d.luc)}</small></div>
          <span class="grow"></span>${d.daMua ? A.badge('Đã mua hàng', 'tag--ok') : A.badge('Chưa thấy đơn mua', 'tag--wait')} ${A.badge(tt, cls)}</div>
        <p class="dg-qt__nd">${esc(d.noiDung).replace(/\n/g, '<br>')}</p>
        ${d.anh && d.anh.length ? `<div class="dg-qt__anh">${d.anh.map((u) => `<a href="${esc(GOC() + u)}" target="_blank" rel="noopener"><img src="${esc(GOC() + u)}" alt=""></a>`).join('')}</div>` : ''}
        <div class="dg-qt__tl"><textarea rows="2" placeholder="Trả lời của shop (hiện dưới đánh giá)…" data-dg-tl>${esc(d.traLoi || '')}</textarea>
          <div class="dg-qt__nut">${d.trangThai !== 'hien' ? '<button class="btn btn--primary btn--sm" data-dg-tt="hien">✓ Cho hiện</button>' : ''}${d.trangThai !== 'an' ? '<button class="btn btn--ghost btn--sm" data-dg-tt="an">Ẩn</button>' : ''}<button class="btn btn--ghost btn--sm" data-dg-luu-tl>Lưu trả lời</button>${p ? `<a class="btn btn--ghost btn--sm" href="${esc(MC_URL(p))}" target="_blank" rel="noopener">Xem trên web ↗</a>` : ''}</div></div></div>`; }).join('')
      : A.trong('Không có đánh giá', tab === 'cho' ? 'Chưa có đánh giá nào chờ duyệt.' : 'Chưa có đánh giá trong mục này.', '⭐')}</div>`;
  }
  const MC_URL = (p) => 'https://huongchatkids.vn/' + ((window.SP_SLUG || {})[p.id] || 'product.html?id=' + encodeURIComponent(p.id));
  async function capNhat(ma, them) {
    try { const r = await A.api('qtDgDuyet', { ma, ...them }); if (!r || !r.ok) throw new Error((r && r.msg) || 'Chưa lưu được');
      const i = ds.findIndex((d) => d.ma === ma); if (i > -1) ds[i] = r.dg; A.toast('Đã lưu', 'ok'); A.veTrang(); }
    catch (e) { A.toast(e.message, 'err'); }
  }
  document.addEventListener('click', (e) => {
    if (!location.hash.startsWith('#' + R)) return; const t = e.target;
    const tb = t.closest('[data-dg-tab]'); if (tb) { tab = tb.dataset.dgTab; A.veTrang(); return; }
    if (t.id === 'dgTaiLai') { ds = null; A.veTrang(); return; }
    const box = t.closest('[data-dg]'); if (!box) return;
    const st = t.closest('[data-dg-tt]'); if (st) { capNhat(box.dataset.dg, { trangThai: st.dataset.dgTt }); return; }
    if (t.closest('[data-dg-luu-tl]')) capNhat(box.dataset.dg, { traLoi: $('[data-dg-tl]', box).value });
  });
  A.dangKy({ route: R, ten: 'Đánh giá sản phẩm', icon: '⭐', nhom: 'ban-hang', quyen: 'product.view', mo: 'Duyệt, ẩn và trả lời đánh giá khách viết trên website', ve });
})();
