/* ===== KHUYẾN MÃI – Flash sale · Mã giảm giá · Quà tặng & hạng khách · Combo ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt, khongDau } = A;
  const ds = () => A.D.PRODUCTS || [];

  /* ---------------- FLASH SALE ---------------- */
  let fsQ = '';
  function veFlash(el) {
    const chon = ds().filter((p) => (p.tags || []).includes('Sản phẩm hot'));
    $('#pageAct').innerHTML = `<span class="muted">${chon.length} sản phẩm đang chạy</span>`;
    el.innerHTML = `
      <div class="card"><h3>⚡ Cấu hình hàng Flash sale</h3>
        <p class="muted">Hàng sản phẩm chạy ngang dưới banner trang chủ. Tích sản phẩm là vào flash sale ngay.</p>
        <div class="row row-2">
          <label>Đếm ngược kết thúc<select id="fsEnd">
            <option value="daily" ${SITE.flashSaleEnd === 'daily' ? 'selected' : ''}>Mỗi ngày – đếm ngược tới 24:00, hôm sau tự đếm lại</option>
            <option value="" ${SITE.flashSaleEnd !== 'daily' ? 'selected' : ''}>Tắt đếm ngược</option></select></label>
          <label>Tìm sản phẩm<input id="fsQ" value="${esc(fsQ)}" placeholder="Gõ tên sản phẩm…"></label>
        </div>
      </div>
      <div class="card"><h3>Đang chạy flash sale (${chon.length})</h3>
        ${chon.length ? `<div class="plist">${chon.map((p) => the(p, true)).join('')}</div>` : '<p class="muted">Chưa chọn sản phẩm nào.</p>'}</div>
      <div class="card"><h3>Chọn thêm sản phẩm</h3>
        <div class="plist">${ds().filter((p) => !(p.tags || []).includes('Sản phẩm hot') && (!fsQ || khongDau(p.name + (p.short || '')).includes(khongDau(fsQ)))).map((p) => the(p, false)).join('') || '<p class="muted">Không còn sản phẩm nào.</p>'}</div></div>`;
  }
  const the = (p, on) => `<div class="pitem ${on ? 'is-on' : ''}" data-fs="${ds().indexOf(p)}">
    <img src="${esc(p.thumb || p.image || '')}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
    <div><b>${esc(p.short || p.name)}</b><small>${fmt(p.price)} · tồn ${p.stock ?? 0}</small></div>
    <input type="checkbox" ${on ? 'checked' : ''} tabindex="-1" aria-label="Chọn"></div>`;

  /* ---------------- MÃ GIẢM GIÁ ---------------- */
  function veMa(el) {
    const C = A.D.COUPONS || {};
    $('#pageAct').innerHTML = `<button class="btn btn--primary" id="btnThemMa">+ Thêm mã</button>`;
    const keys = Object.keys(C);
    el.innerHTML = `<div class="card">
      <p class="muted">Khách nhập mã ở bước thanh toán. Mã <b>không cộng dồn</b> với ưu đãi hạng – web tự lấy mức lợi hơn cho khách.</p>
      ${keys.length ? `<div class="tbl-wrap"><table><thead><tr><th>Mã</th><th>Kiểu</th><th class="num">Giá trị</th><th class="num">Giảm tối đa</th><th class="num">Đơn tối thiểu</th><th>Mô tả hiện cho khách</th><th>Đơn đầu</th><th></th></tr></thead><tbody id="maBody">
        ${keys.map((ma) => { const c = C[ma]; return `<tr data-ma="${esc(ma)}">
          <td><input value="${esc(ma)}" data-f="ma" style="width:112px;text-transform:uppercase"></td>
          <td><select data-f="type" style="width:118px"><option value="percent"${c.type === 'percent' ? ' selected' : ''}>Giảm %</option><option value="fixed"${c.type === 'fixed' ? ' selected' : ''}>Giảm tiền</option><option value="ship"${c.type === 'ship' ? ' selected' : ''}>Miễn ship</option></select></td>
          <td class="num"><input type="number" value="${c.value || 0}" data-f="value" style="width:92px"></td>
          <td class="num"><input type="number" value="${c.max || 0}" data-f="max" style="width:110px"></td>
          <td class="num"><input type="number" value="${c.min || 0}" data-f="min" style="width:110px"></td>
          <td><input value="${esc(c.desc || '')}" data-f="desc"></td>
          <td style="text-align:center"><input type="checkbox" ${c.donDau ? 'checked' : ''} data-f="donDau"></td>
          <td><button class="btn btn--red btn--sm" data-xoa-ma="${esc(ma)}">Xoá</button></td></tr>`; }).join('')}
        </tbody></table></div>` : A.trong('Chưa có mã giảm giá', 'Bấm "Thêm mã" để tạo mã đầu tiên.', '🎟️')}</div>`;
  }
  function thuMa() {
    if (!$('#maBody')) return;
    const C = {};
    $$('#maBody tr[data-ma]').forEach((tr) => {
      const g = (f) => $(`[data-f="${f}"]`, tr);
      const ma = (g('ma').value || '').trim().toUpperCase(); if (!ma) return;
      const o = { type: g('type').value, value: Number(g('value').value) || 0, min: Number(g('min').value) || 0, desc: g('desc').value.trim() };
      if (Number(g('max').value)) o.max = Number(g('max').value);
      if (g('donDau').checked) o.donDau = true;
      C[ma] = o;
    });
    A.D.COUPONS = C;
  }

  /* ---------------- QUÀ TẶNG & HẠNG KHÁCH ---------------- */
  /* Không có sub → danh sách chương trình (m-qua-tang.js); "mac-dinh" → chương trình cũ bên dưới; còn lại → tạo/sửa chương trình */
  function veQua(el, { sub } = {}) {
    if (!sub) return A.quaTang.veDanhSach(el, veHang);
    if (sub !== 'mac-dinh') return A.quaTang.veSua(el, sub);
    $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#/qua-tang">← Danh sách</a>`;
    const q = A.D.QUA_TANG || {};
    el.innerHTML = `
      <div class="card"><h3>🎁 Quà tặng kèm</h3><p class="muted">Web tự tính quà theo giỏ hàng và tự thêm vào đơn.</p>
        <label class="sw"><input type="checkbox" id="qtBat" ${q.enabled ? 'checked' : ''}> Bật chương trình quà tặng</label>
        <div class="row row-2">
          <label>Tên quà<input id="qtTen" value="${esc(q.ten || '')}" placeholder="VD: gói nước ép Lotte"></label>
          <label>Các vị cho khách chọn (cách nhau dấu phẩy)<input id="qtVi" value="${esc((q.vi || []).join(', '))}"></label>
        </div>
        <h4>Chương trình 1 – theo giá trị đơn</h4>
        <div class="row row-3">
          <label>Đơn từ (đ)<input type="number" id="qtMuc" value="${(q.donTu || {}).muc || 0}"></label>
          <label>Tặng (số lượng)<input type="number" id="qtSo" value="${(q.donTu || {}).soQua || 0}"></label>
          <label class="sw" style="align-self:end"><input type="checkbox" id="qtMoi" ${(q.donTu || {}).chiKhachMoi ? 'checked' : ''}> Chỉ khách chưa lên hạng</label>
        </div>
        <h4>Chương trình 2 – mua thùng nước dinh dưỡng Lotte</h4>
        <div id="qtThung"></div>
        <button class="btn btn--ghost btn--sm" id="btnThemBac">+ Thêm bậc</button>
        <label class="sw mt-12"><input type="checkbox" id="qtThungMoi" ${q.thungChiKhachMoi ? 'checked' : ''}> Khách đã lên hạng cũng KHÔNG được quà khi mua thùng</label>
        <div class="box-note">Hai chương trình không cộng dồn – web lấy chương trình tặng nhiều quà hơn. Combo có ưu đãi riêng nên không tính vào chương trình mua thùng.</div>
      </div>`;
    veBac();
  }
  function veHang() {
    return `<div class="card"><h3>🏅 Hạng khách hàng</h3><p class="muted">Xét theo tổng tiền khách đã mua. Ưu đãi hạng tự trừ vào đơn.</p>
        <div class="tbl-wrap"><table><thead><tr><th>Biểu tượng</th><th>Tên hạng</th><th class="num">Tổng chi tiêu từ</th><th class="num">Giảm (%)</th><th>Mô tả</th></tr></thead><tbody id="hangBody">
        ${(A.D.TIERS || []).map((t, i) => `<tr data-hang="${i}">
          <td><input value="${esc(t.icon || '')}" data-f="icon" style="width:54px;text-align:center"></td>
          <td><input value="${esc(t.label || '')}" data-f="label" style="width:120px"></td>
          <td class="num"><input type="number" value="${t.min || 0}" data-f="min" style="width:130px"></td>
          <td class="num"><input type="number" value="${t.discount || 0}" data-f="discount" style="width:80px"></td>
          <td><input value="${esc(t.desc || '')}" data-f="desc"></td></tr>`).join('')}
        </tbody></table></div>
        <div class="box-note">⚠️ Sửa ở đây xong nhớ sửa biến <code>HANG</code> trong Apps Script cho khớp rồi Deploy lại, vì máy chủ cũng tính hạng khi nhận đơn.</div></div>`;
  }
  function veBac() {
    const bac = (A.D.QUA_TANG && A.D.QUA_TANG.thung) || [];
    const b = $('#qtThung'); if (!b) return;
    b.innerHTML = bac.map((x, i) => `<div class="vrow" data-bac="${i}" style="grid-template-columns:1fr 1fr auto">
      <label>Mua từ (thùng)<input type="number" value="${x.tu}" data-f="tu"></label>
      <label>Tặng (số lượng)<input type="number" value="${x.soQua}" data-f="soQua"></label>
      <button class="btn btn--red btn--sm" data-xoa-bac="${i}">✕</button></div>`).join('') || '<p class="muted">Chưa có bậc nào.</p>';
  }
  function thuQua() {
    A.D.QUA_TANG = A.D.QUA_TANG || {};
    if ($('#qtTen')) Object.assign(A.D.QUA_TANG, {
      enabled: $('#qtBat').checked, ten: $('#qtTen').value.trim(),
      vi: $('#qtVi').value.split(',').map((x) => x.trim()).filter(Boolean),
      donTu: { muc: Number($('#qtMuc').value) || 0, soQua: Number($('#qtSo').value) || 0, chiKhachMoi: $('#qtMoi').checked },
      thungChiKhachMoi: $('#qtThungMoi').checked,
      thung: $$('#qtThung [data-bac]').map((r) => ({ tu: Number($('[data-f="tu"]', r).value) || 1, soQua: Number($('[data-f="soQua"]', r).value) || 0 })).sort((a, b) => a.tu - b.tu),
    });
    $$('#hangBody tr[data-hang]').forEach((tr) => {
      const t = A.D.TIERS[Number(tr.dataset.hang)];
      t.icon = $('[data-f="icon"]', tr).value.trim(); t.label = $('[data-f="label"]', tr).value.trim();
      t.min = Number($('[data-f="min"]', tr).value) || 0; t.discount = Number($('[data-f="discount"]', tr).value) || 0;
      t.desc = $('[data-f="desc"]', tr).value.trim();
    });
    A.D.TIERS.sort((a, b) => a.min - b.min);
  }

  /* ---------------- COMBO ---------------- */
  function veCombo(el) {
    const combos = ds().map((p, i) => ({ p, i })).filter(({ p }) => p.isCombo);
    $('#pageAct').innerHTML = `<button class="btn btn--primary" id="btnThemCombo">+ Tạo combo</button>`;
    el.innerHTML = `<div class="card"><p class="muted">Combo là một sản phẩm đặc biệt gồm nhiều sản phẩm lẻ, hiện ở mục “Combo tiết kiệm” trang chủ.</p>
      ${combos.length ? `<div class="tbl-wrap"><table><thead><tr><th>Combo</th><th>Gồm</th><th class="num">Giá</th><th class="num">Phân loại</th><th>Trạng thái</th><th></th></tr></thead><tbody>
        ${combos.map(({ p, i }) => `<tr>
          <td><a class="sp-cell" href="#/san-pham/${i}"><img src="${esc(p.thumb || p.image || '')}" alt="" onerror="this.style.visibility='hidden'"><span><b>${esc(p.short || p.name)}</b><small>${esc(p.id)}</small></span></a></td>
          <td>${(p.items || []).map((id) => { const x = ds().find((y) => y.id === id); return esc(x ? (x.short || x.name) : id); }).join('<br>') || '—'}</td>
          <td class="num">${fmt(p.price)}</td><td class="num">${(p.variants || []).length || 1}</td>
          <td>${p.an ? A.badge('Đang ẩn', 'tag--off') : A.badge('Đang hiện', 'tag--ok')}</td>
          <td class="num"><a class="btn btn--ghost btn--sm" href="#/san-pham/${i}">Sửa</a></td></tr>`).join('')}
        </tbody></table></div>` : A.trong('Chưa có combo nào', 'Bấm “Tạo combo” để gộp nhiều sản phẩm thành một gói bán kèm.', '🎁')}</div>`;
  }

  /* ---------------- Sự kiện ---------------- */
  document.addEventListener('click', async (e) => {
    const fs = e.target.closest('[data-fs]');
    if (fs) { const p = ds()[Number(fs.dataset.fs)];
      const tags = (p.tags || []).filter((x) => x !== 'Sản phẩm hot');
      if (!(p.tags || []).includes('Sản phẩm hot')) tags.unshift('Sản phẩm hot');
      p.tags = tags; A.doiDuLieu(); A.veTrang(); return; }
    if (e.target.id === 'btnThemMa') { thuMa(); A.D.COUPONS['MAMOI' + (Object.keys(A.D.COUPONS).length + 1)] = { type: 'percent', value: 10, min: 300000, desc: 'Mô tả hiện cho khách' }; A.doiDuLieu(); A.veTrang(); return; }
    const xm = e.target.closest('[data-xoa-ma]');
    if (xm) { const ok = await A.hoi({ tieuDe: 'Xoá mã giảm giá?', noiDung: `Mã <b>${esc(xm.dataset.xoaMa)}</b> sẽ không dùng được nữa.`, nutOk: 'Xoá', nguyHiem: true });
      if (!ok) return; thuMa(); delete A.D.COUPONS[xm.dataset.xoaMa]; A.doiDuLieu(); A.veTrang(); return; }
    if (e.target.id === 'btnThemBac') { thuQua(); A.D.QUA_TANG.thung.push({ tu: (A.D.QUA_TANG.thung.length || 0) + 1, soQua: 5 }); A.doiDuLieu(); veBac(); return; }
    const xb = e.target.closest('[data-xoa-bac]');
    if (xb) { thuQua(); A.D.QUA_TANG.thung.splice(Number(xb.dataset.xoaBac), 1); A.doiDuLieu(); veBac(); return; }
    if (e.target.id === 'btnThemCombo') {
      const id = 'combo-' + Date.now();
      ds().push({ id, name: 'Combo mới', short: 'Combo mới', brand: (window.BRANDS[0] || {}).key, cat: (window.CATEGORIES[0] || {}).key,
        ages: [], needs: [], price: 0, oldPrice: 0, rating: 5, reviews: 0, sold: 0, stock: 50, isCombo: true, items: [],
        shape: 'box', color: '#F0537A', weight: '', origin: 'Hàn Quốc', tags: ['Combo'], image: '', thumb: '', images: [],
        desc: '', highlights: [], usage: '', an: true });
      A.doiDuLieu(); A.di('#/san-pham/' + (ds().length - 1)); A.toast('Đã tạo combo (đang ẩn) – điền thông tin rồi bỏ ẩn', 'ok'); return;
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'fsQ') { fsQ = e.target.value; return A.veTrang(); }
    if (e.target.closest('#maBody')) { thuMa(); A.doiDuLieu(); }
    if (e.target.closest('#qtThung') || e.target.closest('#hangBody') || (e.target.id || '').startsWith('qt')) { thuQua(); A.doiDuLieu(); }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'fsEnd') { A.D.SITE = { ...(A.D.SITE || {}), flashSaleEnd: e.target.value }; A.doiDuLieu(); return; }
    if (e.target.closest('#maBody')) { thuMa(); A.doiDuLieu(); }
    if (e.target.closest('#qtThung') || e.target.closest('#hangBody') || (e.target.id || '').startsWith('qt')) { thuQua(); A.doiDuLieu(); }
  });

  A.dangKy({ route: '/flash-sale', ten: 'Flash Sale', icon: '⚡', nhom: 'ban-hang', quyen: 'flashsale.view', preview: true, mo: 'Chọn sản phẩm chạy flash sale trang chủ', ve: veFlash });
  A.dangKy({ route: '/combo', ten: 'Combo', icon: '🎁', nhom: 'ban-hang', quyen: 'combo.view', preview: true, mo: 'Gói nhiều sản phẩm bán kèm', ve: veCombo });
  A.dangKy({ route: '/qua-tang', ten: 'Quà tặng & hạng', icon: '🏅', nhom: 'ban-hang', quyen: 'product.view', preview: (sub) => !sub, mo: 'Chương trình Mua để nhận quà và hạng khách hàng', ve: veQua });
})();
