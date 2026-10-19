/* =====================================================================
   ĐÁNH GIÁ SẢN PHẨM CỦA KHÁCH (trang sản phẩm, tab Đánh giá – khung #dgWeb)
   - Hiện điểm trung bình, biểu đồ 1–5 sao, danh sách đánh giá (kèm ảnh, nhãn "Đã mua hàng", câu trả lời của shop).
   - Khách đã đăng nhập viết / sửa đánh giá: chọn sao, viết cảm nhận, thêm tối đa 4 ảnh.
   - Máy chủ: tools/apps-script.gs (dgDs / dgGui); shop duyệt ở Quản trị › Đánh giá sản phẩm.
   ===================================================================== */
(() => {
  'use strict';
  const MC = window.MC; if (!MC) return;
  const { $, esc, loyaltyApi, Session, toast, starRow, openLogin } = MC;
  const API = () => ((SITE.loyalty || {}).endpoint || '').replace(/\/+$/, '');
  const GOC = () => { try { return new URL(API()).origin; } catch { return ''; } };
  const ngay = (t) => { const d = new Date(t + 7 * 36e5); return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`; };
  const NHAN = ['', 'Rất tệ', 'Chưa hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'];
  let kq = null, mo = false, sao = 5, anh = [], dangGui = false;

  function ve() {
    const box = $('#dgWeb'); if (!box) return; const id = box.dataset.id;
    if (!kq) { box.innerHTML = '<p class="text-muted">Đang tải đánh giá…</p>'; return; }
    const f0 = document.getElementById('dgForm'), giu = f0 ? { nd: f0.noiDung.value, ten: f0.ten.value } : { nd: mo && kq.cuaToi ? kq.cuaToi.noiDung : '', ten: '' };
    const tong = kq.so || 0, s = Session.get(), cua = kq.cuaToi;
    const thanh = [5, 4, 3, 2, 1].map((n) => { const c = (kq.phan || [])[n - 1] || 0; return `<div class="dg-thanh"><span>${n} ★</span><i><b style="width:${tong ? Math.round(c * 100 / tong) : 0}%"></b></i><small>${c}</small></div>`; }).join('');
    box.innerHTML = `<div class="dg-dau">
        <div class="dg-diem">${tong ? `<b>${kq.tb.toFixed(1)}</b><div class="stars">${starRow(kq.tb)}</div><small>${tong} đánh giá trên website</small>` : '<b>–</b><small>Chưa có đánh giá trên website</small>'}</div>
        <div class="dg-phan">${thanh}</div>
        <div class="dg-viet"><p>${cua ? (cua.trangThai === 'cho' ? 'Đánh giá của mẹ đang chờ shop duyệt.' : 'Mẹ đã đánh giá sản phẩm này.') : 'Mẹ đã dùng sản phẩm? Chia sẻ cảm nhận để các mẹ khác tham khảo nhé.'}</p>
          <button class="btn btn--primary" type="button" data-dg-mo>${cua ? 'Sửa đánh giá của tôi' : 'Viết đánh giá'}</button></div></div>
      <form class="dg-form ${mo ? '' : 'hide'}" id="dgForm" novalidate>
        ${s ? '' : '<p class="dg-chu">Mẹ cần <b>đăng nhập</b> để gửi đánh giá (đánh giá của khách đã mua hàng sẽ có nhãn "Đã mua hàng").</p>'}
        <div class="dg-chon-sao" role="radiogroup" aria-label="Chọn số sao">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="${n <= sao ? 'is-on' : ''}" data-dg-sao="${n}" aria-label="${n} sao">★</button>`).join('')}<span id="dgNhan">${NHAN[sao]}</span></div>
        <textarea class="input" name="noiDung" rows="4" maxlength="1500" placeholder="Bé / mẹ dùng thấy thế nào? Vị, hiệu quả sau bao lâu, giao hàng, đóng gói… (ít nhất 10 ký tự)"></textarea>
        <div class="dg-anh">${anh.map((a, i) => `<span class="dg-anh__o"><img src="${esc(a.xem)}" alt="">${a.dang ? '<i>…</i>' : ''}<button type="button" data-dg-bo-anh="${i}" aria-label="Bỏ ảnh">×</button></span>`).join('')}${anh.length < 4 ? '<button type="button" class="dg-anh__them" data-dg-them-anh>+ Thêm ảnh</button>' : ''}<input type="file" id="dgTep" accept="image/*" multiple hidden></div>
        <label class="field mt-8"><span>Tên hiển thị (không bắt buộc)</span><input class="input" name="ten" maxlength="40" placeholder="Để trống = tự hiện kiểu “Mẹ Hà”"></label>
        <div class="form-error hide mt-8" id="dgLoi" role="alert"></div>
        <div class="flex gap-8 mt-12"><button class="btn btn--primary" type="submit">${s ? 'Gửi đánh giá' : 'Đăng nhập & gửi đánh giá'}</button><button class="btn btn--ghost" type="button" data-dg-dong>Huỷ</button></div>
      </form>
      <div class="dg-ds">${(kq.ds || []).map((d) => `<div class="dg-muc"><div class="dg-muc__dau"><span class="stars">${starRow(d.sao)}</span><b>${esc(d.ten)}</b>${d.daMua ? '<span class="dg-mua">✓ Đã mua hàng</span>' : ''}<small>${ngay(d.luc)}</small></div>
          <p>${esc(d.noiDung).replace(/\n/g, '<br>')}</p>
          ${d.anh && d.anh.length ? `<div class="dg-muc__anh">${d.anh.map((u) => `<a href="${esc(GOC() + u)}" target="_blank" rel="noopener"><img src="${esc(GOC() + u)}" alt="Ảnh khách gửi" loading="lazy"></a>`).join('')}</div>` : ''}
          ${d.traLoi ? `<div class="dg-tl"><b>Hương Chất Kids trả lời:</b> ${esc(d.traLoi)}</div>` : ''}</div>`).join('')}</div>`;
    const tab = document.querySelector('#pdpTabs [data-panel="reviews"]');
    if (tab && tong && !tab.dataset.dgCo) { tab.dataset.dgCo = 1; tab.insertAdjacentHTML('beforeend', ` <small class="dg-tab">★ ${kq.tb.toFixed(1)}</small>`); }
    const f1 = document.getElementById('dgForm'); if (f1) { f1.noiDung.value = giu.nd || ''; f1.ten.value = giu.ten || ''; }
    if (id) chenSchema(id);
  }
  /* Điểm đánh giá vào dữ liệu có cấu trúc (Google) – chỉ đánh giá thật của khách trên website */
  function chenSchema(id) {
    if (!kq || !kq.so) return; if (document.getElementById('ldDanhGia') || document.getElementById('ldSP')) return;
    const p = MC.byId(id); if (!p) return;
    const s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ldDanhGia';
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: String(p.id),
      aggregateRating: { '@type': 'AggregateRating', ratingValue: kq.tb, reviewCount: kq.so, bestRating: 5, worstRating: 1 },
      review: (kq.ds || []).slice(0, 5).map((d) => ({ '@type': 'Review', author: { '@type': 'Person', name: d.ten }, datePublished: new Date(d.luc).toISOString().slice(0, 10), reviewBody: d.noiDung.slice(0, 500), reviewRating: { '@type': 'Rating', ratingValue: d.sao, bestRating: 5 } })) });
    document.head.appendChild(s);
  }
  async function tai(id) {
    const s = Session.get();
    try { const r = await loyaltyApi('dgDs', { id, ...(s ? { token: s.token } : {}) }, 15000); kq = r && r.ok ? r : { so: 0, ds: [] }; } catch { kq = { so: 0, ds: [] }; }
    if (kq.cuaToi) { sao = kq.cuaToi.sao || 5; anh = (kq.cuaToi.anh || []).map((u) => ({ url: u, xem: GOC() + u })); }
    ve();
  }
  async function taiAnh(files) {
    const phien = 'cdg' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    for (const f of [...files].slice(0, 4 - anh.length)) {
      if (!/^image\//.test(f.type)) continue;
      let blob = f;
      try { const bm = await createImageBitmap(f); const tl = Math.min(1, 1600 / Math.max(bm.width, bm.height)); const c = document.createElement('canvas'); c.width = Math.round(bm.width * tl); c.height = Math.round(bm.height * tl); c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height); blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.85)); } catch { /* gửi nguyên ảnh */ }
      const o = { xem: URL.createObjectURL(blob), dang: true }; anh.push(o); ve();
      try {
        const r = await fetch(API() + '/chat-tep?phien=' + phien, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: blob });
        const j = await r.json(); if (!r.ok || !j.ok || j.loai !== 'anh') throw new Error(j.msg || 'Chưa tải được ảnh');
        o.url = j.url; o.dang = false;
      } catch (e) { anh = anh.filter((x) => x !== o); toast(e.message || 'Chưa tải được ảnh', { type: 'error' }); }
      ve();
    }
  }
  async function gui(f) {
    if (dangGui) return;
    const loi = (m) => { const e = $('#dgLoi'); if (e) { e.textContent = m; e.classList.remove('hide'); } };
    let s = Session.get();
    if (!s) { s = await openLogin({ title: 'Đăng nhập để gửi đánh giá' }); if (!s) return; }
    const noiDung = f.noiDung.value.trim();
    if (noiDung.length < 10) return loi('Mẹ viết thêm vài dòng cảm nhận (ít nhất 10 ký tự) nhé');
    if (anh.some((a) => a.dang)) return loi('Ảnh đang tải lên, mẹ chờ một chút nhé');
    const id = $('#dgWeb').dataset.id, p = MC.byId(id); dangGui = true;
    const btn = f.querySelector('[type=submit]'); btn.disabled = true; btn.textContent = 'Đang gửi…';
    try {
      const r = await loyaltyApi('dgGui', { token: s.token, id, sao, noiDung, ten: f.ten.value.trim(), anh: JSON.stringify(anh.map((a) => a.url).filter(Boolean)), tenSP: p ? (p.short || p.name) : '' }, 25000);
      if (!r || !r.ok) throw new Error((r && r.msg) || 'Chưa gửi được, mẹ thử lại nhé');
      toast(r.msg, { type: 'ok' }); mo = false; kq = null; ve(); await tai(id);
    } catch (e) { loi(e.message); btn.disabled = false; btn.textContent = 'Gửi đánh giá'; }
    dangGui = false;
  }

  document.addEventListener('click', (e) => {
    const t = e.target; if (!t.closest('#dgWeb')) return;
    if (t.closest('[data-dg-mo]')) { mo = true; ve(); const tx = document.querySelector('#dgForm textarea'); if (tx && kq.cuaToi && !tx.value) tx.value = kq.cuaToi.noiDung; tx && tx.focus(); return; }
    if (t.closest('[data-dg-dong]')) { mo = false; ve(); return; }
    const sb = t.closest('[data-dg-sao]'); if (sb) { sao = Number(sb.dataset.dgSao); document.querySelectorAll('[data-dg-sao]').forEach((b) => b.classList.toggle('is-on', Number(b.dataset.dgSao) <= sao)); $('#dgNhan').textContent = NHAN[sao]; return; }
    if (t.closest('[data-dg-them-anh]')) { $('#dgTep').click(); return; }
    const bo = t.closest('[data-dg-bo-anh]'); if (bo) { anh.splice(Number(bo.dataset.dgBoAnh), 1); ve(); }
  });
  document.addEventListener('change', (e) => { if (e.target.id === 'dgTep') { const fs2 = [...e.target.files]; e.target.value = ''; taiAnh(fs2); } });
  document.addEventListener('submit', (e) => { if (e.target.id === 'dgForm') { e.preventDefault(); gui(e.target); } });
  const batDau = () => { const box = $('#dgWeb'); if (box) { ve(); tai(box.dataset.id); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(batDau, 0)); else setTimeout(batDau, 0);
})();
