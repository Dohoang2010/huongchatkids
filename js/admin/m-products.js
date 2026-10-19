/* ===== SẢN PHẨM – danh sách (tìm/lọc/sắp xếp/phân trang/chọn nhiều) + form 5 tab ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt, khongDau } = A;

  const S = { q: '', cat: '', tt: '', sx: 'moi', trang: 1, moiTrang: 12, chon: new Set(), moPL: new Set() };
  const SX = { moi: 'Mới nhất', cu: 'Cũ nhất', 'ten-az': 'Tên A→Z', 'gia-cao': 'Giá cao→thấp', 'gia-thap': 'Giá thấp→cao', 'ton-thap': 'Tồn ít nhất', 'ban-chay': 'Bán chạy' };

  const ds = () => A.D.PRODUCTS || [];
  /* Cháy hàng = tồn 0 hoặc mọi phân loại hết (giống MC.hetHang ngoài web) */
  const hetSP = (p) => (p.stock ?? 0) <= 0 || ((p.variants || []).length > 0 && p.variants.every((v) => v.oos));
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
            <th>Sản phẩm</th><th>Danh mục</th><th class="num">Giá bán</th><th class="num">Hàng</th><th class="num">Đã bán</th><th>Nhãn</th><th>Trạng thái</th><th></th>
          </tr></thead>
          <tbody>${slice.map(({ p, i }) => `<tr class="${S.chon.has(i) ? 'is-pick' : ''}">
            <td class="tbl-ck"><input type="checkbox" data-pick="${i}" ${S.chon.has(i) ? 'checked' : ''} aria-label="Chọn ${esc(p.short || p.name)}"></td>
            <td data-nhan="Sản phẩm"><a class="sp-cell" href="#/san-pham/${i}">
              <img src="${esc(p.thumb || p.image || '')}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
              <span><b>${esc(p.short || p.name)}</b><small>${esc(p.id)}${(p.variants || []).length ? ' · ' + p.variants.length + ' phân loại' : ''}</small></span></a></td>
            <td data-nhan="Danh mục">${esc(tenDM(p.cat))}</td>
            <td class="num" data-nhan="Giá bán">${(p.variants || []).length ? `<button class="sp-pl-nut" type="button" data-mo-pl="${i}" title="Sửa giá / tồn từng phân loại">${fmt(p.price)} <small>${p.variants.length} loại ${S.moPL.has(i) ? '▴' : '▾'}</small></button>` : `<input class="sp-gia" type="number" min="0" step="1000" inputmode="numeric" data-gia="${i}" value="${p.price || 0}" aria-label="Giá bán ${esc(p.short || p.name)}">`}</td>
            <td class="num" data-nhan="Hàng"><button class="sp-tg ${hetSP(p) ? 'is-off' : 'is-on'}" type="button" data-ton="${i}" title="Bấm để đổi còn hàng / cháy hàng">${hetSP(p) ? 'Cháy hàng' : 'Còn hàng'}</button></td>
            <td class="num" data-nhan="Đã bán">${p.sold || 0}</td>
            <td class="sp-nhan-col">${(p.tags || []).slice(0, 2).map((t) => A.badge(t, t === 'Sản phẩm hot' ? 'tag--hot' : '')).join(' ') || '—'}</td>
            <td data-nhan="Trạng thái"><button class="sp-tg ${p.an ? 'is-off' : 'is-on'}" type="button" data-hien="${i}" title="Bấm để ẩn / hiện trên web">${p.an ? 'Đang ẩn' : 'Đang hiện'}</button></td>
            <td class="num sp-nut"><a class="btn btn--ghost btn--sm" href="#/san-pham/${i}">Sửa</a> <button class="btn btn--ghost btn--sm" type="button" data-nhan-ban="${i}" title="Nhân bản sản phẩm này">⧉<span class="sp-nb-chu"> Nhân bản</span></button></td>
          </tr>${S.moPL.has(i) && (p.variants || []).length ? `<tr class="sp-pl"><td colspan="9"><div class="sp-pl__ds">${p.variants.map((v, j) => `<div class="sp-pl__dong"><span>${esc(v.label)}</span><input class="sp-gia" type="number" min="0" step="1000" inputmode="numeric" data-gia-pl="${i}:${j}" value="${v.price || 0}" aria-label="Giá ${esc(v.label)}"><button class="sp-tg ${v.oos ? 'is-off' : 'is-on'}" type="button" data-ton-pl="${i}:${j}">${v.oos ? 'Cháy hàng' : 'Còn hàng'}</button></div>`).join('')}</div></td></tr>` : ''}`).join('')}</tbody></table></div>
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

  /* Trang sửa sản phẩm: sửa chỉ là bản nháp (khung xem trước vẫn đổi theo), bấm Lưu mới lưu & đăng lên web */
  let goc = null, gocIdx = -1, chuaLuuSP = false;
  function chuaLuu() { chuaLuuSP = true; A.doiNhap(); veThanhSP(); }
  function veThanhSP() {
    const b = $('#spLuu'); if (!b) return;
    b.classList.toggle('is-doi', chuaLuuSP);
    $('#spLuuTT', b).innerHTML = chuaLuuSP ? '<span class="cham"></span><b>Có thay đổi chưa lưu</b> <span class="muted">– bấm Lưu để đăng lên website</span>' : '<span class="muted">✓ Đã lưu – chưa có thay đổi mới</span>';
    $('[data-sp-luu]', b).disabled = !chuaLuuSP; $('[data-sp-huy]', b).disabled = !chuaLuuSP;
  }
  async function luuSP() {
    if (!chuaLuuSP) return; thu();
    chuaLuuSP = false; goc = A.sao(ds()[gocIdx]); veThanhSP();
    A.doiDuLieu(); A.toast('Đang lưu…'); await A.xuatBan();
  }
  function huySP() {
    if (gocIdx < 0 || !goc) return; ds()[gocIdx] = A.sao(goc); chuaLuuSP = false; A.doiNhap(); A.veTrang(); A.toast('Đã bỏ các thay đổi chưa lưu');
  }
  /* Rời trang sửa khi chưa lưu → hỏi Lưu hay bỏ thay đổi */
  window.addEventListener('hashchange', async () => {
    if (!chuaLuuSP || gocIdx < 0 || location.hash === '#/san-pham/' + gocIdx) return;
    const idx = gocIdx, ok = await A.hoi({ tieuDe: 'Lưu thay đổi sản phẩm?', noiDung: 'Mẹ đã sửa sản phẩm nhưng chưa bấm <b>Lưu</b>.<br>Bấm <b>Lưu</b> để đăng lên website, bấm <b>Huỷ</b> để bỏ các thay đổi.', nutOk: 'Lưu' });
    if (ok) { chuaLuuSP = false; A.doiDuLieu(); A.toast('Đang lưu…'); await A.xuatBan(); }
    else { if (goc) ds()[idx] = A.sao(goc); chuaLuuSP = false; A.doiNhap(); A.toast('Đã bỏ các thay đổi chưa lưu'); }
    gocIdx = -1; goc = null;
  });
  window.addEventListener('beforeunload', (e) => { if (chuaLuuSP) { e.preventDefault(); e.returnValue = ''; } });

  function veForm(el, idx) {
    const p = ds()[idx];
    if (!p) { el.innerHTML = A.trong('Không tìm thấy sản phẩm', 'Sản phẩm này có thể đã bị xoá.', '🔍'); return; }
    if (gocIdx !== idx || !goc) { gocIdx = idx; goc = A.sao(p); chuaLuuSP = false; }
    $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#/san-pham">← Danh sách</a>
      <a class="btn btn--ghost" href="product.html?id=${encodeURIComponent(p.id)}&preview=1" target="_blank" rel="noopener">Xem trên web ↗</a>
      <button class="btn btn--red" data-xoa-sp="${idx}">Xoá</button>`;
    el.innerHTML = `<div class="card" id="spForm" data-idx="${idx}">
      <div class="tabs2">${TAB.map(([k, t]) => `<button class="tab2 ${k === tabHienTai ? 'is-on' : ''}" data-tab2="${k}">${t}</button>`).join('')}</div>
      <div id="tabBody"></div>
      <div class="sp-luu" id="spLuu"><div id="spLuuTT"></div><span class="grow"></span>
        <button class="btn btn--ghost" data-sp-huy>Huỷ thay đổi</button><button class="btn btn--primary" data-sp-luu>💾 Lưu</button></div></div>`;
    veTab(p, idx); veThanhSP();
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
        <div class="drop" id="imgDrop">📁 Bấm hoặc kéo ảnh vào đây để tải lên website<input type="file" id="imgFile" accept="image/*" multiple hidden></div>
        ${veBia(p)}`;
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
      const url = 'https://huongchatkids.vn/' + (p.slug ? window.taoSlug(p.slug) : ((window.SP_SLUG || {})[p.id] || 'product.html?id=' + encodeURIComponent(p.id)));
      const tieuDe = p.seoTitle || `${p.short || p.name} – Hương Chất Kids`;
      const mota = p.seoDesc || (p.desc || '').slice(0, 155);
      b.innerHTML = `
        <div class="row row-2">
          <div>
            <label>Đường dẫn (link) sản phẩm<input data-p="slug" value="${esc(p.slug || '')}" placeholder="${esc((window.SP_SLUG || {})[p.id] || window.taoSlug(p.short || p.name))}" maxlength="70"><small class="hint">huongchatkids.vn/<b>${esc(p.slug ? window.taoSlug(p.slug) : (window.SP_SLUG || {})[p.id] || '')}</b> – chữ thường không dấu, nối bằng gạch ngang. Để trống = tự tạo từ tên ngắn. Nên đặt 1 lần: đổi link thì link cũ đã chia sẻ sẽ không vào được nữa (link product.html?id=… vẫn luôn dùng được).</small></label>
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
      else { const v = el.value; if (v === '' && ['seoTitle', 'seoDesc', 'seoKey', 'slug'].includes(k)) delete p[k]; else if (k === 'slug') p[k] = window.taoSlug(v); else p[k] = v; }
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

  /* ---------------- Sửa nhanh trong danh sách (tự lưu sau 3 giây, như các mục khác) ---------------- */
  const luuNhanh = (msg) => { A.doiDuLieu(); A.veTrang(); if (msg) A.toast(msg + ' – tự lưu sau 3 giây', 'ok'); };
  document.addEventListener('change', (e) => {
    if (!location.hash.startsWith('#/san-pham') || /#\/san-pham\/\d/.test(location.hash)) return; const t = e.target;
    if (t.matches('[data-gia]')) { const p = ds()[Number(t.dataset.gia)]; const g = Math.max(0, Math.round(Number(t.value) || 0)); if (p && g !== p.price) { p.price = g; luuNhanh('Đã đổi giá ' + (p.short || p.name)); } }
    if (t.matches('[data-gia-pl]')) { const [i, j] = t.dataset.giaPl.split(':').map(Number), p = ds()[i], v = p && p.variants && p.variants[j]; const g = Math.max(0, Math.round(Number(t.value) || 0));
      if (v && g !== v.price) { v.price = g; if (j === 0) p.price = g; luuNhanh('Đã đổi giá ' + v.label); } }
  });
  document.addEventListener('click', (e) => {
    if (!location.hash.startsWith('#/san-pham') || /#\/san-pham\/\d/.test(location.hash)) return; const t = e.target;
    const mo = t.closest('[data-mo-pl]'); if (mo) { const i = Number(mo.dataset.moPl); S.moPL.has(i) ? S.moPL.delete(i) : S.moPL.add(i); A.veTrang(); return; }
    const ton = t.closest('[data-ton]'); if (ton) { const p = ds()[Number(ton.dataset.ton)]; const het = hetSP(p);
      if (het) { p.stock = p.stock > 0 ? p.stock : 50; (p.variants || []).forEach((v) => { delete v.oos; }); } else { p.stock = 0; (p.variants || []).forEach((v) => { v.oos = true; }); }
      return luuNhanh((p.short || p.name) + (het ? ': còn hàng' : ': cháy hàng')); }
    const tpl = t.closest('[data-ton-pl]'); if (tpl) { const [i, j] = tpl.dataset.tonPl.split(':').map(Number), p = ds()[i], v = p.variants[j];
      if (v.oos) { delete v.oos; if ((p.stock ?? 0) <= 0) p.stock = 50; } else v.oos = true; return luuNhanh(v.label + (v.oos ? ': cháy hàng' : ': còn hàng')); }
    const hien = t.closest('[data-hien]'); if (hien) { const p = ds()[Number(hien.dataset.hien)]; p.an = !p.an; return luuNhanh((p.short || p.name) + (p.an ? ': đã ẩn khỏi web' : ': đã hiện trên web')); }
    const nb = t.closest('[data-nhan-ban]'); if (nb) {
      const i = Number(nb.dataset.nhanBan), goc = ds()[i], ban = JSON.parse(JSON.stringify(goc));
      ban.id = String(goc.id).replace(/-ban-sao-[a-z0-9]+$/, '') + '-ban-sao-' + Date.now().toString(36);
      ban.name = goc.name + ' (bản sao)'; ban.short = (goc.short || goc.name) + ' (bản sao)'; ban.an = true;
      ban.sold = 0; ban.reviews = 0; ban.rating = 5; delete ban.slug; delete ban.seoTitle; delete ban.seoDesc;
      ds().splice(i + 1, 0, ban); A.doiDuLieu(); tabHienTai = 'co-ban'; A.di('#/san-pham/' + (i + 1));
      A.toast('Đã nhân bản (đang ẩn) – sửa tên, giá, ảnh rồi bấm Lưu, sau đó bỏ ẩn', 'ok'); return;
    }
  });

  /* ---------------- Sự kiện ---------------- */
  const timTre = A.tre(() => { S.trang = 1; A.veTrang(); }, 350);

  document.addEventListener('input', (e) => {
    if (e.target.id === 'spQ') { S.q = e.target.value; timTre(); return; }
    if (e.target.closest('#spForm')) { thu(); chuaLuu(); if (e.target.dataset.p === 'seoTitle' || e.target.dataset.p === 'seoDesc') veTab(ds()[Number($('#spForm').dataset.idx)], 0); }
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
    if (e.target.closest('#spForm') && e.target.id !== 'imgFile') { thu(); chuaLuu(); }
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
    if (t.closest('[data-sp-luu]')) return luuSP();
    if (t.closest('[data-sp-huy]')) return huySP();
    const tab = t.closest('[data-tab2]');
    if (tab) { thu(); tabHienTai = tab.dataset.tab2; $$('.tab2').forEach((x) => x.classList.toggle('is-on', x === tab)); veTab(ds()[Number($('#spForm').dataset.idx)], 0); return; }
    const xoa = t.closest('[data-xoa-sp]');
    if (xoa) {
      const i = Number(xoa.dataset.xoaSp); const p = ds()[i];
      const ok = await A.hoi({ tieuDe: 'Xoá sản phẩm?', noiDung: `Xoá hẳn <b>${esc(p.short || p.name)}</b> khỏi website?<br><span class="muted">Muốn tạm ẩn thì dùng ô “Ẩn sản phẩm” sẽ an toàn hơn.</span>`, nutOk: 'Xoá', nguyHiem: true });
      if (!ok) return;
      chuaLuuSP = false; gocIdx = -1; goc = null;
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
      chuaLuu(); veTab(p, 0); return; }
    const xa = t.closest('[data-xoa-anh]');
    if (xa) { const p = ds()[Number($('#spForm').dataset.idx)]; p.images = (p.images || []).filter((_, j) => j !== Number(xa.dataset.xoaAnh));
      p.image = p.images[0] || ''; p.thumb = p.images[0] || ''; chuaLuu(); veTab(p, 0); return; }
    if (t.id === 'btnThemV') { const p = ds()[Number($('#spForm').dataset.idx)]; thu(); p.variants = p.variants || [];
      p.variants.push({ label: 'Phân loại mới', price: p.price || 0 }); chuaLuu(); veTab(p, 0); return; }
    const xv = t.closest('[data-xoa-v]');
    if (xv) { const p = ds()[Number($('#spForm').dataset.idx)]; thu(); p.variants.splice(Number(xv.dataset.xoaV), 1); chuaLuu(); veTab(p, 0); return; }
  });

  /* ---------------- ✨ Tự làm ảnh bìa: máy chủ tách nền + đặt vào khung logo Hương Chất Kids (không ghi giá) ---------------- */
  const BIA = { id: '', file: null, ten: '', kq: null, dangLam: false, cach: 'tu-dong', sang: false, loi: '' };
  const urlBia = () => { try { return new URL((SITE.loyalty || {}).endpoint || '').origin + '/api/qt-anh-bia'; } catch { return ''; } };
  function veBia(p) {
    if (BIA.id !== p.id) Object.assign(BIA, { id: p.id, file: null, ten: '', kq: null, loi: '' });
    return `<div class="bia-tu card mt-12"><h4>✨ Tự làm ảnh bìa</h4>
      <p class="muted">Chọn 1 ảnh sản phẩm (chụp điện thoại cũng được) → web tự tách nền, đặt sản phẩm to giữa bục trong khung logo Hương Chất Kids, không ghi giá. Xem trước rồi mới dùng.</p>
      <div class="bia-tu__chon"><label class="btn btn--ghost">📷 Chọn ảnh sản phẩm<input type="file" id="biaFile" accept="image/*" hidden></label><span class="muted">${esc(BIA.ten || 'chưa chọn ảnh')}</span></div>
      <div class="bia-tu__cach">
        <label><input type="radio" name="biaCach" value="tu-dong" ${BIA.cach === 'tu-dong' ? 'checked' : ''}> Tự tách nền (ảnh chụp có nền bất kỳ)</label>
        <label><input type="radio" name="biaCach" value="nen-trang" ${BIA.cach === 'nen-trang' ? 'checked' : ''}> Xoá nền trắng (ảnh nền trắng sẵn)</label>
        <label><input type="radio" name="biaCach" value="giu" ${BIA.cach === 'giu' ? 'checked' : ''}> Giữ nguyên ảnh (đặt cả ảnh lên bục)</label>
        <label><input type="checkbox" id="biaSang" ${BIA.sang ? 'checked' : ''}> Thêm quầng sáng phía sau (sản phẩm màu hồng / trắng nhạt)</label>
      </div>
      <button class="btn btn--primary" id="biaLam" type="button" ${BIA.file && !BIA.dangLam ? '' : 'disabled'}>${BIA.dangLam ? '⏳ Đang làm ảnh bìa… (5–20 giây)' : '✨ Làm ảnh bìa'}</button>
      ${BIA.loi ? `<p class="err mt-8">${esc(BIA.loi)}</p>` : ''}
      ${BIA.kq ? `<div class="bia-tu__xem"><img src="data:image/jpeg;base64,${BIA.kq.bia}" alt="Ảnh bìa mới"><div><p><b>Ảnh bìa mới</b><br><span class="muted">Làm trong ${BIA.kq.giay} giây. Chưa ưng: đổi cách tách nền / quầng sáng rồi làm lại.</span></p>
        <button class="btn btn--primary" id="biaDung" type="button">✓ Dùng làm ảnh bìa</button> <button class="btn btn--ghost" id="biaBo" type="button">Bỏ</button></div></div>` : ''}
      <p class="muted" style="font-size:11.5px;margin-top:8px">Tách nền dùng thư viện mã nguồn mở @imgly/background-removal (AGPL-3.0, github.com/imgly/background-removal-js), chạy trên máy chủ của shop.</p></div>`;
  }
  const docB64 = (f) => new Promise((ok, loi) => { const r = new FileReader(); r.onload = () => ok(String(r.result).replace(/^data:[^,]*,/, '')); r.onerror = loi; r.readAsDataURL(f); });
  async function lamBia() {
    const p = ds()[Number($('#spForm').dataset.idx)]; if (!BIA.file || BIA.dangLam) return;
    BIA.dangLam = true; BIA.loi = ''; BIA.kq = null; veTab(p, 0);
    try {
      const r = await fetch(urlBia(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...A.xacThuc(), anh: await docB64(BIA.file), cach: BIA.cach, sang: BIA.sang }) });
      const d = await r.json().catch(() => ({ ok: false, msg: 'Máy chủ không trả lời (' + r.status + ')' }));
      if (!d.ok) throw new Error(d.msg || 'Chưa làm được ảnh bìa'); BIA.kq = d;
    } catch (e) { BIA.loi = e.message; } finally { BIA.dangLam = false; veTab(ds()[Number($('#spForm').dataset.idx)], 0); }
  }
  async function dungBia() {
    const p = ds()[Number($('#spForm').dataset.idx)]; if (!BIA.kq) return;
    if (!A.ghToken()) { A.toast('Chưa lưu được ảnh: máy chủ chưa có mã GitHub', 'err'); return; }
    A.toast('Đang tải ảnh bìa lên…');
    try {
      const t = Date.now().toString(36), bia = `img/${p.id}-bia-${t}.jpg`, nho = `img/thumb/${p.id}-${t}.jpg`;
      await A.ghGhi(bia, BIA.kq.bia, undefined, 'Quản trị: ảnh bìa ' + p.id);
      await A.ghGhi(nho, BIA.kq.thumb, undefined, 'Quản trị: ảnh nhỏ ' + p.id);
      p.images = [bia, ...(p.images || []).filter((x) => x !== bia)]; p.image = bia; p.thumb = nho;
      Object.assign(BIA, { file: null, ten: '', kq: null }); chuaLuu(); veTab(p, 0); A.toast('Đã đặt ảnh bìa mới – bấm Lưu để đăng lên web', 'ok');
    } catch (e) { A.toast(e.message, 'err'); }
  }
  document.addEventListener('change', (e) => {
    if (!$('#spForm')) return; const t = e.target;
    if (t.id === 'biaFile' && t.files && t.files[0]) { BIA.file = t.files[0]; BIA.ten = t.files[0].name; BIA.kq = null; BIA.loi = ''; veTab(ds()[Number($('#spForm').dataset.idx)], 0); }
    else if (t.name === 'biaCach') BIA.cach = t.value; else if (t.id === 'biaSang') BIA.sang = t.checked;
  });
  document.addEventListener('click', (e) => {
    if (!$('#spForm')) return; const id = e.target.id;
    if (id === 'biaLam') lamBia(); else if (id === 'biaDung') dungBia(); else if (id === 'biaBo') { BIA.kq = null; veTab(ds()[Number($('#spForm').dataset.idx)], 0); }
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
      chuaLuu(); veTab(p, 0); A.toast('Đã tải ảnh lên – bấm Lưu để đăng lên web', 'ok');
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
