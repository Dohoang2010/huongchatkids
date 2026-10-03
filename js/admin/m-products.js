/* ===== SẢN PHẨM – danh sách (tìm/lọc/sắp xếp/phân trang/chọn nhiều) + form 5 tab ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt, khongDau } = A;

  const S = { q: '', cat: '', tt: '', sx: 'moi', trang: 1, moiTrang: 12, chon: new Set() };
  const SX = { moi: 'Mới nhất', cu: 'Cũ nhất', 'ten-az': 'Tên A→Z', 'gia-cao': 'Giá cao→thấp', 'gia-thap': 'Giá thấp→cao', 'ton-thap': 'Tồn ít nhất', 'ban-chay': 'Bán chạy' };

  const ds = () => A.D.PRODUCTS || [];
  const tenDM = (k) => ((window.CATEGORIES || []).find((c) => c.key === k) || {}).label || k || '—';
  const tenTH = (k) => ((window.BRANDS || []).find((b) => b.key === k) || {}).label || k || '—';

  function loc() {
    let list = ds().map((p, i) => ({ p, i }));
    if (S.q) { const k = khongDau(S.q); list = list.filter(({ p }) => khongDau(p.name + ' ' + (p.short || '') + ' ' + p.id).includes(k)); }
    if (S.cat) list = list.filter(({ p }) => p.cat === S.cat);
    if (S.tt === 'hien') list = list.filter(({ p }) => !p.an);
    if (S.tt === 'an') list = list.filter(({ p }) => p.an);
    if (S.tt === 'het') list = list.filter(({ p }) => (p.stock ?? 0) <= 0);
    if (S.tt === 'sap-het') list = list.filter(({ p }) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5);
    const sx = {
      moi: (a, b) => b.i - a.i, cu: (a, b) => a.i - b.i,
      'ten-az': (a, b) => String(a.p.short || a.p.name).localeCompare(String(b.p.short || b.p.name), 'vi'),
      'gia-cao': (a, b) => b.p.price - a.p.price, 'gia-thap': (a, b) => a.p.price - b.p.price,
      'ton-thap': (a, b) => (a.p.stock ?? 0) - (b.p.stock ?? 0), 'ban-chay': (a, b) => (b.p.sold || 0) - (a.p.sold || 0),
    }[S.sx];
    return list.sort(sx);
  }

  /* ---------------- Danh sách ---------------- */
  function veDanhSach(el) {
    const all = loc();
    const tong = all.length;
    S.trang = Math.min(S.trang, Math.max(1, Math.ceil(tong / S.moiTrang)));
    const slice = all.slice((S.trang - 1) * S.moiTrang, S.trang * S.moiTrang);
    $('#pageAct').innerHTML = `<button class="btn btn--ghost" data-xuat-sp>⭳ Xuất Excel</button>
      <button class="btn btn--primary" data-them-sp>+ Thêm sản phẩm</button>`;

    el.innerHTML = `
      <div class="card">
        <div class="tool">
          <div class="tool__tim"><input id="spQ" placeholder="Tìm theo tên hoặc mã sản phẩm…" value="${esc(S.q)}" autocomplete="off"></div>
          <select id="spCat"><option value="">Tất cả danh mục</option>${(window.CATEGORIES || []).map((c) => `<option value="${esc(c.key)}" ${S.cat === c.key ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select>
          <select id="spTT"><option value="">Mọi trạng thái</option>
            <option value="hien" ${S.tt === 'hien' ? 'selected' : ''}>Đang hiện</option>
            <option value="an" ${S.tt === 'an' ? 'selected' : ''}>Đang ẩn</option>
            <option value="sap-het" ${S.tt === 'sap-het' ? 'selected' : ''}>Sắp hết (≤5)</option>
            <option value="het" ${S.tt === 'het' ? 'selected' : ''}>Hết hàng</option></select>
          <select id="spSX">${Object.keys(SX).map((k) => `<option value="${k}" ${S.sx === k ? 'selected' : ''}>${SX[k]}</option>`).join('')}</select>
        </div>

        <div class="bulk ${S.chon.size ? '' : 'hide'}" id="spBulk">
          <b>Đã chọn ${S.chon.size} sản phẩm</b>
          <button class="btn btn--ghost btn--sm" data-bulk="hien">Cho hiện</button>
          <button class="btn btn--ghost btn--sm" data-bulk="an">Ẩn đi</button>
          <button class="btn btn--ghost btn--sm" data-bulk="hot">Gắn nhãn hot</button>
          <button class="btn btn--ghost btn--sm" data-bulk="bo-hot">Bỏ nhãn hot</button>
          <button class="btn btn--red btn--sm" data-bulk="xoa">Xoá</button>
          <span class="grow"></span><button class="btn btn--ghost btn--sm" data-bulk="bo-chon">Bỏ chọn</button>
        </div>

        ${tong ? `<div class="tbl-wrap"><table class="tbl-sp">
          <thead><tr>
            <th class="tbl-ck"><input type="checkbox" id="spAll" aria-label="Chọn tất cả"></th>
            <th>Sản phẩm</th><th>Danh mục</th><th class="num">Giá bán</th><th class="num">Tồn</th><th class="num">Đã bán</th><th>Nhãn</th><th>Trạng thái</th><th></th>
          </tr></thead>
          <tbody>${slice.map(({ p, i }) => `<tr class="${S.chon.has(i) ? 'is-pick' : ''}">
            <td class="tbl-ck"><input type="checkbox" data-pick="${i}" ${S.chon.has(i) ? 'checked' : ''} aria-label="Chọn ${esc(p.short || p.name)}"></td>
            <td data-nhan="Sản phẩm"><a class="sp-cell" href="#/san-pham/${i}">
              <img src="${esc(p.thumb || p.image || '')}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
              <span><b>${esc(p.short || p.name)}</b><small>${esc(p.id)}${(p.variants || []).length ? ' · ' + p.variants.length + ' phân loại' : ''}</small></span></a></td>
            <td data-nhan="Danh mục">${esc(tenDM(p.cat))}</td>
            <td class="num" data-nhan="Giá bán">${fmt(p.price)}</td>
            <td class="num">${A.badge(String(p.stock ?? 0), (p.stock ?? 0) <= 0 ? 'tag--no' : (p.stock ?? 0) <= 5 ? 'tag--wait' : 'tag--ok')}</td>
            <td class="num" data-nhan="Đã bán">${p.sold || 0}</td>
            <td>${(p.tags || []).slice(0, 2).map((t) => A.badge(t, t === 'Sản phẩm hot' ? 'tag--hot' : '')).join(' ') || '—'}</td>
            <td>${p.an ? A.badge('Đang ẩn', 'tag--off') : A.badge('Đang hiện', 'tag--ok')}</td>
            <td class="num"><a class="btn btn--ghost btn--sm" href="#/san-pham/${i}">Sửa</a></td>
          </tr>`).join('')}</tbody></table></div>
          ${A.phanTrang(tong, S.trang, S.moiTrang, 'sp-pg')}`
        : A.trong('Không có sản phẩm nào', S.q || S.cat || S.tt ? 'Thử bỏ bớt bộ lọc xem sao.' : 'Bấm "Thêm sản phẩm" để tạo sản phẩm đầu tiên.', '📦')}
      </div>`;
  }

  /* ---------------- Form sửa (5 tab) ---------------- */
  const TAB = [['co-ban', '📝 Thông tin cơ bản'], ['anh', '🖼️ Hình ảnh'], ['gia', '💰 Giá & kho'], ['bien-the', '🏷️ Phân loại'], ['seo', '🔍 SEO']];
  const NHAN = [
    { ten: 'Sản phẩm hot', mo: '🔥 nhãn đỏ + vào hàng Flash sale trang chủ' },
    { ten: 'Bán chạy', mo: 'nhãn xanh trên ảnh sản phẩm' },
    { ten: 'Mới', mo: 'nhãn "Mới" cho hàng vừa về' },
    { ten: 'Cho mẹ', mo: 'đánh dấu sản phẩm dành cho mẹ' },
  ];
  let tabHienTai = 'co-ban';

  function veForm(el, idx) {
    const p = ds()[idx];
    if (!p) { el.innerHTML = A.trong('Không tìm thấy sản phẩm', 'Sản phẩm này có thể đã bị xoá.', '🔍'); return; }
    $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#/san-pham">← Danh sách</a>
      <a class="btn btn--ghost" href="product.html?id=${encodeURIComponent(p.id)}&preview=1" target="_blank" rel="noopener">Xem trên web ↗</a>
      <button class="btn btn--red" data-xoa-sp="${idx}">Xoá</button>`;
    el.innerHTML = `<div class="card" id="spForm" data-idx="${idx}">
      <div class="tabs2">${TAB.map(([k, t]) => `<button class="tab2 ${k === tabHienTai ? 'is-on' : ''}" data-tab2="${k}">${t}</button>`).join('')}</div>
      <div id="tabBody"></div></div>`;
    veTab(p, idx);
  }

  function veTab(p, idx) {
    const b = $('#tabBody'); if (!b) return;
    if (tabHienTai === 'co-ban') b.innerHTML = `
      <div class="row row-2">
        <label>Tên đầy đủ <i>*</i><input data-p="name" value="${esc(p.name || '')}" required></label>
        <label>Tên ngắn (hiện ở thẻ sản phẩm)<input data-p="short" value="${esc(p.short || '')}"></label>
      </div>
      <div class="row row-3">
        <label>Mã sản phẩm (SKU)<input data-p="id" value="${esc(p.id)}"><small class="hint">Đổi mã sẽ làm hỏng link cũ – chỉ đổi khi thật cần.</small></label>
        <label>Danh mục<select data-p="cat">${(window.CATEGORIES || []).map((c) => `<option value="${esc(c.key)}" ${c.key === p.cat ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></label>
        <label>Thương hiệu<select data-p="brand">${(window.BRANDS || []).map((x) => `<option value="${esc(x.key)}" ${x.key === p.brand ? 'selected' : ''}>${esc(x.label)}</option>`).join('')}</select></label>
      </div>
      <div class="row row-3">
        <label>Quy cách<input data-p="weight" value="${esc(p.weight || '')}"></label>
        <label>Xuất xứ<input data-p="origin" value="${esc(p.origin || '')}"></label>
        <label>Độ tuổi phù hợp<div class="pick">${(window.AGES || []).map((a) => `<label class="pick__i"><input type="checkbox" data-age="${esc(a.key)}" ${(p.ages || []).includes(a.key) ? 'checked' : ''}>${esc(a.label)}</label>`).join('')}</div></label>
      </div>
      <label>Nhu cầu<div class="pick">${(window.NEEDS || []).map((n) => `<label class="pick__i"><input type="checkbox" data-need="${esc(n.key)}" ${(p.needs || []).includes(n.key) ? 'checked' : ''}>${esc(n.label)}</label>`).join('')}</div></label>
      <h4>Nhãn sản phẩm <span class="muted">— tích vào là web hiện nhãn ngay</span></h4>
      <div class="nhan" id="nhanList">${NHAN.map((n) => `<label class="nhan__i"><input type="checkbox" data-nhan="${esc(n.ten)}" ${(p.tags || []).includes(n.ten) ? 'checked' : ''}><span><b>${esc(n.ten)}</b><small>${esc(n.mo)}</small></span></label>`).join('')}</div>
      <label class="sw"><input type="checkbox" data-p="an" ${p.an ? 'checked' : ''}> Ẩn sản phẩm này khỏi website</label>
      <label>Mô tả<textarea data-p="desc" rows="4">${esc(p.desc || '')}</textarea></label>
      <label>Điểm nổi bật (mỗi dòng một ý)<textarea data-p="highlights" rows="4">${esc((p.highlights || []).join('\n'))}</textarea></label>
      <label>Cách dùng<textarea data-p="usage" rows="3">${esc(p.usage || '')}</textarea></label>`;

    if (tabHienTai === 'anh') {
      const imgs = p.images && p.images.length ? p.images : (p.image ? [p.image] : []);
      b.innerHTML = `<p class="muted">Ảnh đầu tiên là <b>ảnh bìa</b>. Kéo thả để sắp xếp lại.</p>
        <div class="imgs" id="imgList">${imgs.map((src, i) => `<div class="imgs__i" draggable="true" data-img="${i}">
          <img src="${esc(src)}" alt="" onerror="this.style.opacity=.3">
          ${i === 0 ? '<em>Ảnh bìa</em>' : `<button class="imgs__x" data-lam-bia="${i}" title="Đặt làm ảnh bìa">★</button>`}
          <button class="imgs__x imgs__x--d" data-xoa-anh="${i}" title="Xoá ảnh">✕</button></div>`).join('')
          || '<p class="muted">Chưa có ảnh nào.</p>'}</div>
        <div class="drop" id="imgDrop">📁 Bấm hoặc kéo ảnh vào đây để tải lên website<input type="file" id="imgFile" accept="image/*" multiple hidden></div>`;
    }

    if (tabHienTai === 'gia') b.innerHTML = `
      <div class="row row-3">
        <label>Giá bán (đ) <i>*</i><input type="number" data-p="price" value="${p.price || 0}"></label>
        <label>Giá niêm yết (đ)<input type="number" data-p="oldPrice" value="${p.oldPrice || 0}"><small class="hint">Web đang ẩn giá niêm yết (SITE.showOldPrice = false).</small></label>
        <label>Tồn kho<input type="number" data-p="stock" value="${p.stock ?? 0}"><small class="hint">Bằng 0 là hết hàng.</small></label>
      </div>
      <div class="row row-3">
        <label>Đã bán<input type="number" data-p="sold" value="${p.sold || 0}"></label>
        <label>Điểm đánh giá<input type="number" step="0.1" max="5" data-p="rating" value="${p.rating || 5}"></label>
        <label>Số đánh giá<input type="number" data-p="reviews" value="${p.reviews || 0}"></label>
      </div>
      <div class="box-note">💡 Giá của từng phân loại đặt ở tab <b>Phân loại</b>. Giá ở đây là giá hiện khi sản phẩm không có phân loại.</div>`;

    if (tabHienTai === 'bien-the') {
      const vs = p.variants || [];
      b.innerHTML = `<p class="muted">Mỗi phân loại có giá và tình trạng còn/hết riêng.</p>
        <div id="vList">${vs.length ? vs.map((v, i) => `<div class="vrow" data-v="${i}">
          <label>Tên phân loại<input value="${esc(v.label)}" data-f="label"></label>
          <label>Giá bán<input type="number" value="${v.price || 0}" data-f="price"></label>
          <label>Giá niêm yết<input type="number" value="${v.oldPrice || 0}" data-f="oldPrice"></label>
          <label class="vrow__ck"><input type="checkbox" ${v.oos ? 'checked' : ''} data-f="oos"> Hết hàng</label>
          <button class="btn btn--red btn--sm" data-xoa-v="${i}">✕</button></div>`).join('')
          : '<p class="muted">Chưa có phân loại – khách mua theo một mức giá duy nhất.</p>'}</div>
        <button class="btn btn--ghost btn--sm mt-8" id="btnThemV">+ Thêm phân loại</button>`;
    }

    if (tabHienTai === 'seo') {
      const url = 'https://huongchatkids.vn/product.html?id=' + encodeURIComponent(p.id);
      const tieuDe = p.seoTitle || `${p.short || p.name} – Hương Chất Kids`;
      const mota = p.seoDesc || (p.desc || '').slice(0, 155);
      b.innerHTML = `
        <div class="row row-2">
          <div>
            <label>Tiêu đề SEO<input data-p="seoTitle" value="${esc(p.seoTitle || '')}" placeholder="${esc(tieuDe)}" maxlength="70"><small class="hint">Nên 50–60 ký tự.</small></label>
            <label>Mô tả SEO<textarea data-p="seoDesc" rows="3" maxlength="170" placeholder="${esc(mota)}">${esc(p.seoDesc || '')}</textarea><small class="hint">Nên 120–155 ký tự.</small></label>
            <label>Từ khoá chính<input data-p="seoKey" value="${esc(p.seoKey || '')}" placeholder="VD: váng sữa canxi Hàn Quốc"></label>
          </div>
          <div><h4>Xem trước trên Google</h4>
            <div class="goo"><div class="goo__u">huongchatkids.vn › product</div>
              <div class="goo__t">${esc(tieuDe)}</div>
              <div class="goo__d">${esc(mota || 'Mô tả sẽ hiện ở đây…')}</div></div>
            <p class="muted mt-8">Đường dẫn: <code>${esc(url)}</code></p></div>
        </div>`;
    }
  }

  /* ---------------- Thu dữ liệu từ form ---------------- */
  function thu() {
    const f = $('#spForm'); if (!f) return;
    const idx = Number(f.dataset.idx); const p = ds()[idx]; if (!p) return;
    $$('[data-p]', f).forEach((el) => {
      const k = el.dataset.p;
      if (k === 'an') { if (el.checked) p.an = true; else delete p.an; return; }
      if (k === 'highlights') { p.highlights = el.value.split('\n').map((x) => x.trim()).filter(Boolean); return; }
      if (el.type === 'number') p[k] = Number(el.value) || 0;
      else { const v = el.value; if (v === '' && ['seoTitle', 'seoDesc', 'seoKey'].includes(k)) delete p[k]; else p[k] = v; }
    });
    const nhan = $$('#nhanList [data-nhan]', f);
    if (nhan.length) {
      const chon = nhan.filter((el) => el.checked).map((el) => el.dataset.nhan);
      const giu = (p.tags || []).filter((t) => !NHAN.some((n) => n.ten === t));
      p.tags = chon.concat(giu);
    }
    const ages = $$('[data-age]', f); if (ages.length) p.ages = ages.filter((el) => el.checked).map((el) => el.dataset.age);
    const needs = $$('[data-need]', f); if (needs.length) p.needs = needs.filter((el) => el.checked).map((el) => el.dataset.need);
    const vs = $$('#vList [data-v]', f).map((r) => {
      const o = { label: $('[data-f="label"]', r).value.trim(), price: Number($('[data-f="price"]', r).value) || 0 };
      const op = Number($('[data-f="oldPrice"]', r).value); if (op) o.oldPrice = op;
      if ($('[data-f="oos"]', r).checked) o.oos = true;
      return o;
    }).filter((v) => v.label);
    if ($('#vList', f)) { if (vs.length) p.variants = vs; else delete p.variants; }
  }

  /* ---------------- Sự kiện ---------------- */
  const timTre = A.tre(() => { S.trang = 1; A.veTrang(); }, 350);

  document.addEventListener('input', (e) => {
    if (e.target.id === 'spQ') { S.q = e.target.value; timTre(); return; }
    if (e.target.closest('#spForm')) { thu(); A.doiDuLieu(); if (e.target.dataset.p === 'seoTitle' || e.target.dataset.p === 'seoDesc') veTab(ds()[Number($('#spForm').dataset.idx)], 0); }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'spCat') { S.cat = e.target.value; S.trang = 1; return A.veTrang(); }
    if (e.target.id === 'spTT') { S.tt = e.target.value; S.trang = 1; return A.veTrang(); }
    if (e.target.id === 'spSX') { S.sx = e.target.value; return A.veTrang(); }
    if (e.target.id === 'spAll') { const on = e.target.checked; loc().forEach(({ i }) => on ? S.chon.add(i) : S.chon.delete(i)); return A.veTrang(); }
    /* Chỉ cập nhật đúng dòng và thanh thao tác, không vẽ lại cả trang cho nhẹ */
    if (e.target.dataset.pick !== undefined) {
      const i = Number(e.target.dataset.pick);
      e.target.checked ? S.chon.add(i) : S.chon.delete(i);
      const tr = e.target.closest('tr'); if (tr) tr.classList.toggle('is-pick', e.target.checked);
      const bulk = $('#spBulk');
      if (bulk) { bulk.classList.toggle('hide', !S.chon.size); const b = bulk.querySelector('b'); if (b) b.textContent = `Đã chọn ${S.chon.size} sản phẩm`; }
      return;
    }
    if (e.target.closest('#spForm')) { thu(); A.doiDuLieu(); }
    if (e.target.id === 'imgFile') taiAnhLen(Array.from(e.target.files || []));
  });

  document.addEventListener('click', async (e) => {
    const t = e.target;
    if (t.closest('[data-them-sp]')) {
      const id = 'sp' + Date.now();
      ds().push({ id, name: 'Sản phẩm mới', short: 'Sản phẩm mới', brand: (window.BRANDS[0] || {}).key || 'khac',
        cat: (window.CATEGORIES[0] || {}).key || 'khac', ages: [], needs: [], price: 0, oldPrice: 0, rating: 5, reviews: 0,
        sold: 0, stock: 10, shape: 'box', color: '#F0537A', weight: '', origin: 'Hàn Quốc', tags: [],
        image: '', thumb: '', images: [], desc: '', highlights: [], usage: '', an: true });
      A.doiDuLieu(); tabHienTai = 'co-ban'; A.di('#/san-pham/' + (ds().length - 1));
      A.toast('Đã tạo sản phẩm mới (đang ẩn) – điền thông tin rồi bỏ ẩn', 'ok'); return;
    }
    const tab = t.closest('[data-tab2]');
    if (tab) { thu(); tabHienTai = tab.dataset.tab2; $$('.tab2').forEach((x) => x.classList.toggle('is-on', x === tab)); veTab(ds()[Number($('#spForm').dataset.idx)], 0); return; }
    const xoa = t.closest('[data-xoa-sp]');
    if (xoa) {
      const i = Number(xoa.dataset.xoaSp); const p = ds()[i];
      const ok = await A.hoi({ tieuDe: 'Xoá sản phẩm?', noiDung: `Xoá hẳn <b>${esc(p.short || p.name)}</b> khỏi website?<br><span class="muted">Muốn tạm ẩn thì dùng ô “Ẩn sản phẩm” sẽ an toàn hơn.</span>`, nutOk: 'Xoá', nguyHiem: true });
      if (!ok) return;
      ds().splice(i, 1); S.chon.clear(); A.doiDuLieu(); A.di('#/san-pham'); A.toast('Đã xoá sản phẩm'); return;
    }
    const bulk = t.closest('[data-bulk]');
    if (bulk) {
      const a = bulk.dataset.bulk; const ids = [...S.chon];
      if (a === 'bo-chon') { S.chon.clear(); return A.veTrang(); }
      if (a === 'xoa') {
        const ok = await A.hoi({ tieuDe: `Xoá ${ids.length} sản phẩm?`, noiDung: 'Thao tác này không hoàn tác được.', nutOk: 'Xoá', nguyHiem: true });
        if (!ok) return;
        ids.sort((x, y) => y - x).forEach((i) => ds().splice(i, 1));
        S.chon.clear(); A.doiDuLieu(); A.veTrang(); A.toast(`Đã xoá ${ids.length} sản phẩm`); return;
      }
      ids.forEach((i) => {
        const p = ds()[i]; if (!p) return;
        if (a === 'an') p.an = true;
        if (a === 'hien') delete p.an;
        if (a === 'hot' && !(p.tags || []).includes('Sản phẩm hot')) p.tags = ['Sản phẩm hot', ...(p.tags || [])];
        if (a === 'bo-hot') p.tags = (p.tags || []).filter((x) => x !== 'Sản phẩm hot');
      });
      A.doiDuLieu(); A.veTrang(); A.toast(`Đã cập nhật ${ids.length} sản phẩm`, 'ok'); return;
    }
    const pg = t.closest('[data-sp-pg]'); if (pg) { S.trang = Number(pg.dataset.spPg); return A.veTrang(); }
    if (t.closest('[data-xuat-sp]')) return xuatExcel();
    if (t.closest('#imgDrop')) { $('#imgFile').click(); return; }
    const bia = t.closest('[data-lam-bia]');
    if (bia) { const p = ds()[Number($('#spForm').dataset.idx)]; const i = Number(bia.dataset.lamBia);
      p.images = [p.images[i], ...p.images.filter((_, j) => j !== i)]; p.image = p.images[0]; p.thumb = p.images[0];
      A.doiDuLieu(); veTab(p, 0); return; }
    const xa = t.closest('[data-xoa-anh]');
    if (xa) { const p = ds()[Number($('#spForm').dataset.idx)]; p.images = (p.images || []).filter((_, j) => j !== Number(xa.dataset.xoaAnh));
      p.image = p.images[0] || ''; p.thumb = p.images[0] || ''; A.doiDuLieu(); veTab(p, 0); return; }
    if (t.id === 'btnThemV') { const p = ds()[Number($('#spForm').dataset.idx)]; thu(); p.variants = p.variants || [];
      p.variants.push({ label: 'Phân loại mới', price: p.price || 0 }); A.doiDuLieu(); veTab(p, 0); return; }
    const xv = t.closest('[data-xoa-v]');
    if (xv) { const p = ds()[Number($('#spForm').dataset.idx)]; thu(); p.variants.splice(Number(xv.dataset.xoaV), 1); A.doiDuLieu(); veTab(p, 0); return; }
  });

  async function taiAnhLen(files) {
    if (!files.length) return;
    if (!A.ghToken()) { A.toast('Cần mã GitHub để tải ảnh lên', 'err'); return; }
    const p = ds()[Number($('#spForm').dataset.idx)];
    A.toast(`Đang tải ${files.length} ảnh lên…`);
    try {
      for (const f of files) {
        const duong = await A.taiAnh(f, `${p.id}-${Date.now()}.${(f.name.split('.').pop() || 'jpg').toLowerCase()}`);
        p.images = p.images || []; p.images.push(duong);
        if (!p.image) p.image = duong; if (!p.thumb) p.thumb = duong;
      }
      A.doiDuLieu(); veTab(p, 0); A.toast('Đã tải ảnh lên', 'ok');
    } catch (err) { A.toast(err.message, 'err'); }
  }

  function xuatExcel() {
    const cot = ['Mã', 'Tên', 'Tên ngắn', 'Danh mục', 'Thương hiệu', 'Giá bán', 'Giá niêm yết', 'Tồn', 'Đã bán', 'Nhãn', 'Trạng thái'];
    const dong = loc().map(({ p }) => [p.id, p.name, p.short || '', tenDM(p.cat), tenTH(p.brand), p.price, p.oldPrice || '', p.stock ?? 0, p.sold || 0, (p.tags || []).join(' / '), p.an ? 'Ẩn' : 'Hiện']);
    const csv = '﻿' + [cot, ...dong].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `san-pham-${A.ngayISO(new Date())}.csv`; a.click();
    A.toast('Đã xuất file Excel (CSV)', 'ok');
  }

  A.dangKy({ route: '/san-pham', ten: 'Sản phẩm', icon: '📦', nhom: 'ban-hang', quyen: 'product.view',
    preview: (sub) => sub !== '',   // danh sách cần chỗ rộng, chỉ mở khung xem trước khi đang sửa 1 sản phẩm
    mo: 'Thêm, sửa, ẩn/hiện sản phẩm và nhãn',
    ve(el, { sub }) { if (sub !== '') { tabHienTai = tabHienTai || 'co-ban'; veForm(el, Number(sub)); } else veDanhSach(el); } });
})();
