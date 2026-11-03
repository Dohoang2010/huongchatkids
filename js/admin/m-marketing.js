/* ===== KHUYẾN MÃI – Flash sale · Mã giảm giá · Quà tặng & hạng khách · Combo ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt, khongDau } = A;
  const ds = () => A.D.PRODUCTS || [];

  /* ---------------- FLASH SALE ---------------- */
  let fsQ = '';
  /* Lưu ở khối CAUHINH (đè lên SITE): flashSaleEnd = 'daily' | '' | 'YYYY-MM-DDTHH:mm' (giờ kết thúc), flashSaleStart = giờ bắt đầu */
  const isoGio = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  function fsDoc() {
    const C = A.D.CAUHINH || {};
    const end = 'flashSaleEnd' in C ? C.flashSaleEnd : SITE.flashSaleEnd;
    const start = 'flashSaleStart' in C ? C.flashSaleStart : SITE.flashSaleStart;
    if (end === 'daily') return { mode: 'daily', bd: '', kt: '' };
    if (!end) return { mode: C.fsKhoang ? 'khoang' : '', bd: start || '', kt: '' };
    return { mode: 'khoang', bd: start ? isoGio(Date.parse(start)) : '', kt: isoGio(Date.parse(end)) };
  }
  function fsTrangThai(fs) {
    const s = fs.bd ? Date.parse(fs.bd) : 0, e = fs.kt ? Date.parse(fs.kt) : 0, now = Date.now();
    if (!e) return A.badge('Chưa chọn giờ kết thúc', 'tag--wait');
    if (s && e <= s) return A.badge('Giờ kết thúc phải sau giờ bắt đầu', 'tag--no');
    if (now < s) return A.badge('Sắp diễn ra', 'tag--wait');
    if (now < e) return A.badge('Đang diễn ra', 'tag--ok');
    return A.badge('Đã kết thúc – khối Flash sale đang ẩn trên trang chủ', 'tag--off');
  }
  function fsLuu(mode) {
    const C = (A.D.CAUHINH = A.D.CAUHINH || {});
    delete C.fsKhoang;
    if (mode === 'daily' || mode === '') { C.flashSaleEnd = mode; C.flashSaleStart = ''; }
    else {
      const bd = ($('#fsBD') || {}).value, kt = ($('#fsKT') || {}).value;
      if (bd === undefined) { const now = Date.now(); C.flashSaleStart = isoGio(now); C.flashSaleEnd = isoGio(now + 864e5); }
      else { C.flashSaleStart = bd || ''; C.flashSaleEnd = kt || ''; if (!kt) C.fsKhoang = true; }
    }
    A.doiDuLieu();
  }
  /* Giao diện khối Flash sale trang chủ – CAUHINH.flashGd = { mau1, mau2, icon, trangTri, tieuDe } (thiếu = như mặc định) */
  const FG_MAU = [['Hồng cam (mặc định)', '', ''], ['Đỏ Tết', '#C62828', '#FF7043'], ['Cam vàng', '#EF6C00', '#FFB300'], ['Xanh ngọc', '#00897B', '#26C6DA'],
    ['Xanh dương', '#1E63D6', '#4FC3F7'], ['Tím', '#7B1FA2', '#E040FB'], ['Xanh lá', '#2E7D32', '#9CCC65'], ['Đen sang', '#1F1F2E', '#6D4C41']];
  const FG_ICON = ['⚡', '🔥', '🎁', '🛍️', '⭐', '🌸', '🎄', '🧧', '💖'];
  const FG_TT = [['🔥', 'Lửa'], ['✨', 'Lấp lánh'], ['🌸', 'Hoa'], ['❄️', 'Tuyết'], ['🎈', 'Bóng bay'], ['💖', 'Tim'], ['🎁', 'Quà'], ['', 'Không']];
  const fgDoc = () => Object.assign({ mau1: '', mau2: '', icon: '⚡', trangTri: '🔥', tieuDe: '' }, (A.D.CAUHINH || {}).flashGd || {});
  function fgLuu(o) { const C = (A.D.CAUHINH = A.D.CAUHINH || {}); C.flashGd = Object.assign(fgDoc(), o); A.doiDuLieu(); }
  function veGd() {
    const g = fgDoc(), nen = g.mau1 ? `linear-gradient(135deg,${g.mau1},${g.mau2 || g.mau1})` : 'linear-gradient(135deg,#FF3D71 0%,#F0537A 45%,#FF8A5C 100%)';
    const chip = (dk, html, data) => `<button type="button" class="btn btn--sm ${dk ? 'btn--primary' : 'btn--light'}" ${data}>${html}</button>`;
    return `<div class="card"><h3>🎨 Giao diện Flash sale</h3>
      <div style="background:${nen};color:#fff;border-radius:14px;padding:14px 18px;font-weight:800;font-size:18px;text-transform:uppercase;margin-bottom:12px">${esc(g.icon)} ${esc(g.tieuDe || 'Flash sale hôm nay')} <span style="font-size:16px">${g.trangTri ? esc(g.trangTri.repeat(3)) : ''}</span></div>
      <p class="muted" style="margin:0 0 6px">Màu nền</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px">${FG_MAU.map(([ten, a, b]) => chip(g.mau1 === a && (!a || g.mau2 === b), `<i style="display:inline-block;width:14px;height:14px;border-radius:50%;vertical-align:-2px;margin-right:4px;background:${a ? `linear-gradient(135deg,${a},${b})` : 'linear-gradient(135deg,#FF3D71,#FF8A5C)'}"></i>${ten}`, `data-fg-mau="${a}|${b}"`)).join('')}</div>
      <div class="row row-2"><label>Màu tự chọn – đầu<input type="color" id="fgMau1" value="${g.mau1 || '#FF3D71'}"></label><label>Màu tự chọn – cuối<input type="color" id="fgMau2" value="${g.mau2 || g.mau1 || '#FF8A5C'}"></label></div>
      <p class="muted" style="margin:10px 0 6px">Biểu tượng cạnh tiêu đề</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${FG_ICON.map((x) => chip(g.icon === x, x, `data-fg-icon="${x}"`)).join('')}</div>
      <p class="muted" style="margin:10px 0 6px">Trang trí bay quanh tiêu đề</p>
      <div style="display:flex;flex-wrap:wrap;gap:6px">${FG_TT.map(([x, ten]) => chip(g.trangTri === x, `${x} ${ten}`, `data-fg-tt="${x}"`)).join('')}</div>
      <div class="row row-2" style="margin-top:10px"><label>Tiêu đề (để trống = "Flash sale hôm nay")<input id="fgTieuDe" value="${esc(g.tieuDe)}" maxlength="40" placeholder="Flash sale hôm nay"></label>
        <label>&nbsp;<button type="button" class="btn btn--light" data-fg-mac>↺ Về giao diện mặc định</button></label></div>
    </div>`;
  }
  function veFlash(el) {
    const fs = fsDoc();
    const chon = ds().filter((p) => (p.tags || []).includes('Sản phẩm hot'));
    $('#pageAct').innerHTML = `<span class="muted">${chon.length} sản phẩm đang chạy</span>`;
    el.innerHTML = `
      <div class="card"><h3>⚡ Cấu hình hàng Flash sale</h3>
        <p class="muted">Hàng sản phẩm chạy ngang dưới banner trang chủ. Tích sản phẩm là vào flash sale ngay.</p>
        <div class="row row-2">
          <label>Thời gian chạy<select id="fsMode">
            <option value="daily" ${fs.mode === 'daily' ? 'selected' : ''}>Mỗi ngày – đếm ngược tới 24:00, hôm sau tự đếm lại</option>
            <option value="khoang" ${fs.mode === 'khoang' ? 'selected' : ''}>Theo khung giờ – chọn ngày giờ bắt đầu và kết thúc</option>
            <option value="" ${fs.mode === '' ? 'selected' : ''}>Không giới hạn – tắt đếm ngược</option></select></label>
          <label>Tìm sản phẩm<input id="fsQ" value="${esc(fsQ)}" placeholder="Gõ tên sản phẩm…"></label>
        </div>
        ${fs.mode === 'khoang' ? `<div class="row row-2">
          <label>Bắt đầu<input type="datetime-local" id="fsBD" value="${esc(fs.bd)}"></label>
          <label>Kết thúc<input type="datetime-local" id="fsKT" value="${esc(fs.kt)}"></label>
        </div>
        <p>${fsTrangThai(fs)}</p>
        <p class="hint">Trước giờ bắt đầu: trang chủ hiện "Flash sale sắp diễn ra" và đếm ngược tới giờ mở. Trong khung giờ: đếm ngược tới lúc kết thúc. Hết giờ: khối Flash sale tự ẩn khỏi trang chủ.</p>` : ''}
      </div>
      ${veGd()}
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
    if ($('#qtBat') && $('#qtTen')) Object.assign(A.D.QUA_TANG, {
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
    const fg = e.target.closest('[data-fg-mau],[data-fg-icon],[data-fg-tt],[data-fg-mac]');
    if (fg) { const d = fg.dataset;
      if (d.fgMau !== undefined) { const [a, b] = d.fgMau.split('|'); fgLuu({ mau1: a, mau2: b }); }
      else if (d.fgIcon !== undefined) fgLuu({ icon: d.fgIcon });
      else if (d.fgTt !== undefined) fgLuu({ trangTri: d.fgTt });
      else { delete (A.D.CAUHINH || {}).flashGd; A.doiDuLieu(); }
      A.veTrang(); return; }
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
    if (e.target.id === 'fsMode') { fsLuu(e.target.value); A.veTrang(); return; }
    if (e.target.id === 'fgMau1' || e.target.id === 'fgMau2') { fgLuu({ mau1: $('#fgMau1').value, mau2: $('#fgMau2').value }); A.veTrang(); return; }
    if (e.target.id === 'fgTieuDe') { fgLuu({ tieuDe: e.target.value.trim() }); A.veTrang(); return; }
    if (e.target.id === 'fsBD' || e.target.id === 'fsKT') { fsLuu('khoang'); A.veTrang(); return; }
    if (e.target.closest('#maBody')) { thuMa(); A.doiDuLieu(); }
    if (e.target.closest('#qtThung') || e.target.closest('#hangBody') || (e.target.id || '').startsWith('qt')) { thuQua(); A.doiDuLieu(); }
  });

  A.dangKy({ route: '/flash-sale', ten: 'Flash Sale', icon: '⚡', nhom: 'ban-hang', quyen: 'flashsale.view', preview: true, mo: 'Chọn sản phẩm chạy flash sale trang chủ', ve: veFlash });
  A.dangKy({ route: '/combo', ten: 'Combo', icon: '🎁', nhom: 'ban-hang', quyen: 'combo.view', preview: true, mo: 'Gói nhiều sản phẩm bán kèm', ve: veCombo });
  A.dangKy({ route: '/qua-tang', ten: 'Quà tặng & hạng', icon: '🏅', nhom: 'ban-hang', quyen: 'product.view', preview: (sub) => !sub, mo: 'Chương trình Mua để nhận quà và hạng khách hàng', ve: veQua });
})();
