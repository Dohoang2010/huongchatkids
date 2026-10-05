/* ===== QUÀ TẶNG – chương trình "Mua để nhận quà" kiểu Shopee =====
   Lưu ở window.QUA_TANG.chuongTrinh (khối ADMIN:QUA_TANG trong js/data.js):
   { id, ten, batDau, ketThuc ('YYYY-MM-DDTHH:mm'), muc (đ), soQua, tat,
     sanPhamChinh: [{ id, bat }], quaTang: [{ id, bat, bienThe: { [nhãn phân loại]: true/false } }] }
   Web (js/app.js → giftFor) tự tính: trong thời gian chương trình, tiền các sản phẩm chính trong giỏ
   đạt mức "muc" thì đơn được tặng "soQua" quà, khách chọn phân loại quà đang bật. */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt, khongDau } = A;
  const ds = () => A.D.PRODUCTS || [];
  const sp = (id) => ds().find((p) => p.id === id);
  const QT = () => { A.D.QUA_TANG = A.D.QUA_TANG || {}; A.D.QUA_TANG.chuongTrinh = A.D.QUA_TANG.chuongTrinh || []; return A.D.QUA_TANG; };
  const anh = (p) => esc((p && (p.thumb || p.image)) || '');
  const giaKhoang = (p) => { const g = p.variants && p.variants.length ? p.variants.map((v) => v.price) : [p.price]; const a = Math.min(...g), b = Math.max(...g); return a === b ? fmt(a) : `${fmt(a)} – ${fmt(b)}`; };
  const hienNgay = (s) => { if (!s) return '—'; const d = new Date(s); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const isoGio = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

  function trangThai(c) {
    if (c.tat) return ['Đã tắt', 'tag--off', 'tat'];
    const now = Date.now(), s = Date.parse(c.batDau), e = Date.parse(c.ketThuc);
    if (now < s) return ['Sắp diễn ra', 'tag--wait', 'sap'];
    if (now < e) return ['Đang diễn ra', 'tag--ok', 'dang'];
    return ['Đã kết thúc', 'tag--off', 'het'];
  }

  /* ================= DANH SÁCH CHƯƠNG TRÌNH ================= */
  let loc = { q: '', tu: '', den: '' };
  function veDanhSach(el, veHang) {
    const q = QT();
    $('#pageAct').innerHTML = `<a class="btn btn--primary" href="#/qua-tang/moi">+ Tạo chương trình</a>`;
    const list = q.chuongTrinh.filter((c) => {
      if (loc.q && !khongDau(c.ten).includes(khongDau(loc.q))) return false;
      if (loc.tu && Date.parse(c.ketThuc) < Date.parse(loc.tu + 'T00:00')) return false;
      if (loc.den && Date.parse(c.batDau) > Date.parse(loc.den + 'T23:59')) return false;
      return true;
    }).sort((a, b) => Date.parse(b.batDau) - Date.parse(a.batDau));
    const thumbs = (c) => [...(c.sanPhamChinh || []), ...(c.quaTang || [])].slice(0, 3).map((x) => sp(x.id)).filter(Boolean)
      .map((p) => `<img class="ct-thumb" src="${anh(p)}" alt="" title="${esc(p.short || p.name)}" onerror="this.style.visibility='hidden'">`).join('');
    el.innerHTML = `
      <div class="card"><h3>🎁 Danh sách chương trình quà tặng</h3>
        <p class="muted">Bấm vào tên chương trình để xem chi tiết. Các chương trình không cộng dồn – web tự lấy chương trình tặng nhiều quà nhất cho đơn.</p>
        <div class="loc">
          <label>Tìm kiếm<input id="ctQ" value="${esc(loc.q)}" placeholder="Tên chương trình"></label>
          <label>Từ ngày<input type="date" id="ctTu" value="${esc(loc.tu)}"></label>
          <label>Đến ngày<input type="date" id="ctDen" value="${esc(loc.den)}"></label>
          <button class="btn btn--ghost btn--sm" id="ctDatLai">Đặt lại</button>
        </div>
        <div class="tbl-wrap"><table class="ct-tbl"><thead><tr><th>Chương trình</th><th>Loại khuyến mãi</th><th>Sản phẩm</th><th>Thời gian</th><th>Thao tác</th></tr></thead><tbody>
          ${list.map((c) => { const [tt, cls, k] = trangThai(c); return `<tr>
            <td data-nhan="Chương trình">${A.badge(tt, cls)}<br><a class="ct-ten" href="#/qua-tang/${esc(c.id)}">${esc(c.ten)}</a><small class="muted">Mua ${fmt(c.muc)} nhận ${c.soQua} quà tặng</small></td>
            <td data-nhan="Loại">Mua để nhận quà</td>
            <td data-nhan="Sản phẩm"><div class="ct-thumbs">${thumbs(c) || '<span class="muted">—</span>'}</div></td>
            <td data-nhan="Thời gian">${hienNgay(c.batDau)}<br>– ${hienNgay(c.ketThuc)}</td>
            <td data-nhan="Thao tác"><div class="ct-act">
              <a href="#/qua-tang/${esc(c.id)}">${k === 'het' ? 'Chi tiết' : 'Chỉnh sửa'}</a>
              <button data-ct-sao="${esc(c.id)}">Sao chép</button>
              ${k === 'dang' ? `<button data-ct-tat="${esc(c.id)}">Kết thúc sớm</button>` : `<button class="red" data-ct-xoa="${esc(c.id)}">Xoá</button>`}</div></td></tr>`; }).join('')}
          ${q.ten || q.donTu || q.thung ? `<tr>
            <td data-nhan="Chương trình">${A.badge(q.enabled ? 'Đang chạy liên tục' : 'Đang tắt', q.enabled ? 'tag--ok' : 'tag--off')}<br><a class="ct-ten" href="#/qua-tang/mac-dinh">Quà ${esc(q.ten || 'mặc định')} (đơn từ ${fmt((q.donTu || {}).muc || 0)} · mua thùng)</a><small class="muted">Chương trình cũ, không giới hạn thời gian</small></td>
            <td data-nhan="Loại">Tặng theo giá trị đơn / số thùng</td><td data-nhan="Sản phẩm"><span class="muted">${esc((q.vi || []).join(', '))}</span></td>
            <td data-nhan="Thời gian">Không thời hạn</td><td data-nhan="Thao tác"><div class="ct-act"><a href="#/qua-tang/mac-dinh">Chỉnh sửa</a></div></td></tr>` : ''}
        </tbody></table></div>
        ${!list.length && !(q.ten || q.donTu) ? A.trong('Chưa có chương trình', 'Bấm "Tạo chương trình" để tạo chương trình Mua để nhận quà.', '🎁') : ''}
      </div>
      ${veKetHop()}
      ${veHang()}`;
  }

  /* ================= TẠO / SỬA CHƯƠNG TRÌNH ================= */
  let nhap = null, goc = null, chiXem = false, chonCT = new Set();
  function moiCT() {
    const now = Date.now() + 15 * 6e4;
    return { id: 'ct' + Date.now().toString(36), ten: '', batDau: isoGio(now), ketThuc: isoGio(now + 7 * 864e5), muc: 1000000, soQua: 1, sanPhamChinh: [], quaTang: [] };
  }
  function veSua(el, id) {
    const q = QT();
    if (!nhap || nhap.id !== id && !(id === 'moi' && nhap.moi)) {
      const c = id === 'moi' ? null : q.chuongTrinh.find((x) => x.id === id);
      if (id !== 'moi' && !c) { el.innerHTML = A.trong('Không tìm thấy chương trình', 'Chương trình có thể đã bị xoá.', '🔍') + '<p><a href="#/qua-tang">← Danh sách</a></p>'; return; }
      goc = c ? A.sao(c) : null; nhap = c ? A.sao(c) : { ...moiCT(), moi: true }; chonCT = new Set();
    }
    const [tt, cls, k] = goc ? trangThai(goc) : ['Mới', 'tag--wait', 'moi'];
    chiXem = k === 'het';
    const dis = chiXem ? 'disabled' : '';
    $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#/qua-tang" data-ct-huy>← Danh sách</a>`;
    const chinh = nhap.sanPhamChinh || [];
    const bat = chinh.filter((x) => x.bat !== false).length;
    el.innerHTML = `
      <div class="ct-buoc"><span class="ct-so">1</span><div class="card">
        <h3>Thông tin cơ bản ${A.badge(tt, cls)}</h3>
        <div class="row row-2">
          <label>Loại chương trình<div class="ct-loai"><span>🎁 Mua để nhận quà</span></div></label>
          <label>Tên chương trình Mua để nhận quà<input id="ctTen" value="${esc(nhap.ten)}" maxlength="60" placeholder="VD: Mua 1 triệu tặng nước ép Lotte" ${dis}><small class="hint">Tên chương trình không hiển thị với người mua.</small></label>
        </div>
        <div class="row row-2">
          <label>Thời gian bắt đầu<input type="datetime-local" id="ctBD" value="${esc(nhap.batDau)}" ${dis || (k === 'dang' ? 'disabled' : '')}></label>
          <label>Thời gian kết thúc<input type="datetime-local" id="ctKT" value="${esc(nhap.ketThuc)}" ${dis}></label>
        </div>
        <p class="hint">Thời gian kết thúc phải sau thời gian bắt đầu tối thiểu 1 tiếng. Chương trình đang diễn ra chỉ được rút ngắn thời gian.</p>
        <div class="ct-dk">Điều kiện nhận quà: Mua <span class="ct-dong">₫<input type="number" id="ctMuc" min="1000" step="1000" value="${Number(nhap.muc) || 0}" ${dis}></span>
          để nhận <input type="number" id="ctSo" min="1" value="${Number(nhap.soQua) || 1}" style="width:80px" ${dis}> quà tặng</div>
      </div></div>

      <div class="ct-buoc"><span class="ct-so">2</span><div class="card">
        <div class="ct-h"><div><h3>Sản Phẩm Chính</h3><p class="muted">Khách mua các sản phẩm này đủ mức tiền ở bước 1 thì được nhận quà.</p></div>
          ${chiXem ? '' : '<button class="btn btn--outline" data-chon="chinh">+ Thêm Sản Phẩm</button>'}</div>
        ${chinh.length ? `<p class="muted"><b>${bat}</b> sản phẩm được bật, trên tổng <b>${chinh.length}</b> sản phẩm</p>
          ${chiXem ? '' : `<div class="ct-loat"><div><b>Thiết Lập Hàng Loạt</b><small class="muted">đã chọn ${chonCT.size} sản phẩm</small></div>
            <div><button class="btn btn--ghost btn--sm" data-loat="tat" ${chonCT.size ? '' : 'disabled'}>Tắt</button><button class="btn btn--ghost btn--sm" data-loat="bat" ${chonCT.size ? '' : 'disabled'}>Bật</button><button class="btn btn--ghost btn--sm" data-loat="xoa" ${chonCT.size ? '' : 'disabled'}>Xoá</button></div></div>`}
          <div class="tbl-wrap"><table><thead><tr>${chiXem ? '' : `<th><input type="checkbox" data-chon-tat ${chonCT.size && chonCT.size === chinh.length ? 'checked' : ''}></th>`}<th>Sản Phẩm</th><th class="num">Giá Bán Hiện Tại</th><th class="num">Số Lượng Hàng</th><th>Trạng thái</th>${chiXem ? '' : '<th>Hoạt động</th>'}</tr></thead><tbody>
          ${chinh.map((x) => { const p = sp(x.id); if (!p) return ''; return `<tr>
            ${chiXem ? '' : `<td><input type="checkbox" data-chon-mot="${esc(x.id)}" ${chonCT.has(x.id) ? 'checked' : ''}></td>`}
            <td data-nhan="Sản phẩm"><div class="ct-sp"><img src="${anh(p)}" alt="" onerror="this.style.visibility='hidden'"><span>${esc(p.short || p.name)}<small class="muted">Mã: ${esc(p.id)}</small></span></div></td>
            <td class="num" data-nhan="Giá">${giaKhoang(p)}</td><td class="num" data-nhan="Kho">${p.stock > 0 ? p.stock : '<span class="red">Hết hàng</span>'}</td>
            <td data-nhan="Trạng thái"><label class="sw"><input type="checkbox" data-bat-chinh="${esc(x.id)}" ${x.bat !== false ? 'checked' : ''} ${dis}></label></td>
            ${chiXem ? '' : `<td><button class="icobtn" data-xoa-chinh="${esc(x.id)}" title="Xoá">🗑</button></td>`}</tr>`; }).join('')}
          </tbody></table></div>` : '<p class="muted">Chưa có sản phẩm chính.</p>'}
      </div></div>

      <div class="ct-buoc"><span class="ct-so">3</span><div class="card">
        <div class="ct-h"><div><h3>Quà tặng</h3><p class="muted">Người mua chỉ có thể nhận quà tặng khi đơn đạt điều kiện. Bật / tắt từng phân loại khách được chọn làm quà.</p></div>
          ${chiXem ? '' : '<button class="btn btn--outline" data-chon="qua">+ Thêm quà tặng</button>'}</div>
        ${(nhap.quaTang || []).map((g) => { const p = sp(g.id); if (!p) return ''; const pl = p.variants && p.variants.length ? p.variants : null; return `<div class="ct-qua">
          <div class="ct-qua__h"><div class="ct-sp"><img src="${anh(p)}" alt="" onerror="this.style.visibility='hidden'"><span>${esc(p.short || p.name)}</span></div>
            ${chiXem ? '' : `<button class="icobtn" data-xoa-qua="${esc(g.id)}" title="Xoá quà">🗑</button>`}</div>
          <div class="tbl-wrap"><table><thead><tr><th>Phân Loại</th><th class="num">Giá Bán Hiện Tại</th><th class="num">Giá quà tặng</th><th class="num">Số Lượng Hàng</th><th>Trạng thái</th></tr></thead><tbody>
          ${(pl || [{ label: '' }]).map((v) => { const nhan = v.label; const on = pl ? (g.bienThe || {})[nhan] !== false : g.bat !== false; const het = pl ? !!v.oos || p.stock <= 0 : p.stock <= 0; return `<tr>
            <td data-nhan="Phân loại">${esc(nhan || 'Mặc định')}</td><td class="num" data-nhan="Giá">${fmt(pl ? v.price : p.price)}</td><td class="num" data-nhan="Giá quà">₫0</td>
            <td class="num" data-nhan="Kho">${het ? '<span class="red">Hết hàng</span>' : (p.stock ?? 0)}</td>
            <td data-nhan="Trạng thái"><label class="sw"><input type="checkbox" data-bat-qua="${esc(g.id)}" data-pl="${esc(nhan)}" ${on ? 'checked' : ''} ${dis}></label></td></tr>`; }).join('')}
          </tbody></table></div></div>`; }).join('') || '<p class="muted">Chưa có quà tặng.</p>'}
      </div></div>

      <div class="ct-foot">${chiXem ? '<span class="muted">Chương trình đã kết thúc – chỉ xem. Bấm "Sao chép" ở danh sách để tạo đợt mới.</span>' : '<span class="muted">Bấm Xác nhận để lưu vào bản nháp, rồi Xuất bản để khách thấy.</span>'}
        <a class="btn btn--ghost" href="#/qua-tang" data-ct-huy>${chiXem ? 'Quay lại' : 'Huỷ'}</a>${chiXem ? '' : '<button class="btn btn--primary" id="ctXacNhan">Xác nhận</button>'}</div>`;
  }
  function thuThongTin() {
    if (!nhap || chiXem || !$('#ctTen')) return;
    nhap.ten = $('#ctTen').value.trim(); nhap.batDau = $('#ctBD').value; nhap.ketThuc = $('#ctKT').value;
    nhap.muc = Math.max(0, Number($('#ctMuc').value) || 0); nhap.soQua = Math.max(1, Math.round(Number($('#ctSo').value) || 1));
  }
  function kiemTra() {
    const c = nhap, loi = [];
    if (!c.ten) loi.push('Nhập tên chương trình');
    const s = Date.parse(c.batDau), e = Date.parse(c.ketThuc);
    if (!s || !e) loi.push('Chọn thời gian bắt đầu và kết thúc');
    else {
      if (e - s < 36e5) loi.push('Thời gian kết thúc phải sau thời gian bắt đầu tối thiểu 1 tiếng');
      if (goc && trangThai(goc)[2] === 'dang' && e > Date.parse(goc.ketThuc)) loi.push('Chương trình đang diễn ra chỉ được rút ngắn thời gian');
      if (!goc && e <= Date.now()) loi.push('Thời gian kết thúc phải ở tương lai');
    }
    if (!(c.muc > 0)) loi.push('Nhập số tiền tối thiểu để nhận quà');
    if (!(c.sanPhamChinh || []).some((x) => x.bat !== false && sp(x.id))) loi.push('Thêm và bật ít nhất 1 sản phẩm chính');
    const coQua = (c.quaTang || []).some((g) => { const p = sp(g.id); if (!p) return false; return p.variants && p.variants.length ? p.variants.some((v) => (g.bienThe || {})[v.label] !== false) : g.bat !== false; });
    if (!coQua) loi.push('Thêm và bật ít nhất 1 quà tặng');
    return loi;
  }

  /* ================= HỘP CHỌN SẢN PHẨM ================= */
  function chonSanPham(daCo, xong) {
    const chon = new Set(); let f = { cat: '', q: '', coSan: true };
    const m = $('#modal');
    const ve = () => {
      const list = ds().filter((p) => !p.an && (!f.cat || p.cat === f.cat) && (!f.coSan || p.stock > 0) && (!f.q || khongDau(p.name + ' ' + (p.short || '') + ' ' + p.id).includes(khongDau(f.q))));
      m.innerHTML = `<div class="modal__bd"></div><div class="modal__box modal__box--lg">
        <div class="ct-h"><h3>Chọn Sản Phẩm</h3><button class="icobtn" data-dong title="Đóng">✕</button></div>
        <div class="loc">
          <label>Ngành hàng<select id="pkCat"><option value="">Tất cả ngành hàng</option>${(window.CATEGORIES || []).map((c) => `<option value="${esc(c.key)}" ${c.key === f.cat ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select></label>
          <label>Tìm<input id="pkQ" value="${esc(f.q)}" placeholder="Tên sản phẩm hoặc mã"></label>
          <button class="btn btn--primary btn--sm" data-tim>Tìm</button><button class="btn btn--ghost btn--sm" data-dat-lai>Đặt lại</button>
          <label class="ck"><input type="checkbox" id="pkCoSan" ${f.coSan ? 'checked' : ''}> Xem sản phẩm có sẵn</label>
        </div>
        <div class="tbl-wrap" style="max-height:52vh"><table><thead><tr><th></th><th>Sản Phẩm</th><th class="num">Doanh số</th><th class="num">Giá</th><th class="num">Kho hàng</th></tr></thead><tbody>
          ${list.map((p) => { const co = daCo.has(p.id); return `<tr class="${co ? 'is-dim' : ''}"><td><input type="checkbox" data-pk="${esc(p.id)}" ${co || chon.has(p.id) ? 'checked' : ''} ${co ? 'disabled' : ''}></td>
            <td><div class="ct-sp"><img src="${anh(p)}" alt="" onerror="this.style.visibility='hidden'"><span>${esc(p.short || p.name)}<small class="muted">Mã: ${esc(p.id)}</small></span></div></td>
            <td class="num">${p.sold || 0}</td><td class="num">${giaKhoang(p)}</td><td class="num">${p.stock > 0 ? p.stock : 'Hết'}</td></tr>`; }).join('') || '<tr><td colspan="5" class="muted">Không có sản phẩm phù hợp.</td></tr>'}
        </tbody></table></div>
        <div class="modal__act"><span class="muted grow">Đã chọn ${chon.size} sản phẩm</span><button class="btn btn--ghost" data-dong>Huỷ</button><button class="btn btn--primary" data-xac ${chon.size ? '' : 'disabled'}>Xác nhận</button></div></div>`;
    };
    ve(); m.classList.remove('hide');
    const dong = () => { m.classList.add('hide'); m.innerHTML = ''; m.removeEventListener('click', onClick); m.removeEventListener('change', onChange); m.removeEventListener('keydown', onKey); };
    const onClick = (e) => {
      if (e.target.closest('[data-dong]') || e.target.classList.contains('modal__bd')) return dong();
      if (e.target.closest('[data-tim]')) { f.q = $('#pkQ').value.trim(); return ve(); }
      if (e.target.closest('[data-dat-lai]')) { f = { cat: '', q: '', coSan: true }; return ve(); }
      if (e.target.closest('[data-xac]')) {
        dong(); xong([...chon]); A.toast(`Đã thêm ${chon.size} sản phẩm`, 'ok');
      }
    };
    const onChange = (e) => {
      const pk = e.target.closest('[data-pk]'); if (pk) { if (pk.checked) chon.add(pk.dataset.pk); else chon.delete(pk.dataset.pk); const s = $('.modal__act .muted', m); if (s) s.textContent = `Đã chọn ${chon.size} sản phẩm`; $('[data-xac]', m).disabled = !chon.size; return; }
      if (e.target.id === 'pkCat') { f.cat = e.target.value; ve(); }
      if (e.target.id === 'pkCoSan') { f.coSan = e.target.checked; ve(); }
    };
    const onKey = (e) => { if (e.key === 'Enter' && e.target.id === 'pkQ') { f.q = e.target.value.trim(); ve(); } };
    m.addEventListener('click', onClick); m.addEventListener('change', onChange); m.addEventListener('keydown', onKey);
  }

  function moChon(loai) {
    chonSanPham(new Set((loai === 'chinh' ? nhap.sanPhamChinh : nhap.quaTang).map((x) => x.id)), (ids) => {
      ids.forEach((id) => { if (loai === 'chinh') nhap.sanPhamChinh.push({ id, bat: true }); else { const p = sp(id); const bt = {}; (p.variants || []).forEach((v) => { bt[v.label] = !v.oos; }); nhap.quaTang.push(p.variants && p.variants.length ? { id, bienThe: bt } : { id, bat: true }); } });
      A.veTrang();
    });
  }

  /* ================= QUY TẮC DÙNG CHUNG ƯU ĐÃI (hiện ở trang Quà tặng và Mã giảm giá) ================= */
  function ketHop() {
    const k = QT().ketHop || {};
    return { hangMa: k.hangMa != null ? !!k.hangMa : !!((A.D.SITE || {}).loyalty || {}).combineWithCoupon, quaMa: k.quaMa !== false, quaHang: k.quaHang !== false };
  }
  function veKetHop() {
    const k = ketHop();
    const dong = (id, on, ten, mo) => `<label class="sw"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}> <span>${ten}<small class="hint">${mo}</small></span></label>`;
    return `<div class="card"><h3>🔗 Quy tắc dùng chung ưu đãi</h3><p class="muted">Bật = khách được hưởng cùng lúc. Tắt = chỉ được một, web tự chọn theo ghi chú bên dưới.</p>
      ${dong('khHangMa', k.hangMa, 'Ưu đãi hạng khách hàng + Mã giảm giá', 'Tắt: web lấy mức giảm lớn hơn cho khách.')}
      ${dong('khQuaMa', k.quaMa, 'Quà tặng + Mã giảm giá', 'Tắt: đơn dùng mã giảm giá sẽ không kèm quà (khách bỏ mã để nhận quà).')}
      ${dong('khQuaHang', k.quaHang, 'Quà tặng + Ưu đãi hạng khách hàng', 'Tắt: khách đã lên hạng (Silver trở lên) nhận giảm % theo hạng, không kèm quà.')}</div>`;
  }
  document.addEventListener('change', (e) => {
    const m = { khHangMa: 'hangMa', khQuaMa: 'quaMa', khQuaHang: 'quaHang' }[e.target.id]; if (!m) return;
    QT().ketHop = { ...ketHop(), [m]: e.target.checked }; A.doiDuLieu();
    A.toast('Đã đổi quy tắc – bấm Xuất bản để áp dụng', 'ok');
  });

  /* ================= SỰ KIỆN ================= */
  const trongQuaTang = () => /^#\/qua-tang/.test(location.hash);
  document.addEventListener('click', async (e) => {
    if (!trongQuaTang()) return;
    const t = e.target;
    if (t.closest('[data-ct-huy]')) { nhap = null; goc = null; return; }
    if (t.id === 'ctDatLai') { loc = { q: '', tu: '', den: '' }; return A.veTrang(); }
    const sao = t.closest('[data-ct-sao]'); if (sao) {
      const c = QT().chuongTrinh.find((x) => x.id === sao.dataset.ctSao); if (!c) return;
      const now = Date.now() + 15 * 6e4, dai = Math.max(36e5, Date.parse(c.ketThuc) - Date.parse(c.batDau));
      nhap = { ...A.sao(c), id: 'ct' + Date.now().toString(36), ten: c.ten + ' (bản sao)', batDau: isoGio(now), ketThuc: isoGio(now + dai), tat: false, moi: true }; goc = null;
      A.di('#/qua-tang/moi'); return;
    }
    const xoa = t.closest('[data-ct-xoa]'); if (xoa) {
      const c = QT().chuongTrinh.find((x) => x.id === xoa.dataset.ctXoa);
      if (!c || !await A.hoi({ tieuDe: 'Xoá chương trình?', noiDung: `Xoá <b>${esc(c.ten)}</b>. Sau khi Xuất bản, khách sẽ không còn nhận quà của chương trình này.`, nutOk: 'Xoá', nguyHiem: true })) return;
      QT().chuongTrinh = QT().chuongTrinh.filter((x) => x !== c); A.doiDuLieu(); A.veTrang(); return;
    }
    const tat = t.closest('[data-ct-tat]'); if (tat) {
      const c = QT().chuongTrinh.find((x) => x.id === tat.dataset.ctTat);
      if (!c || !await A.hoi({ tieuDe: 'Kết thúc chương trình ngay?', noiDung: `Chương trình <b>${esc(c.ten)}</b> sẽ dừng tặng quà sau khi Xuất bản.`, nutOk: 'Kết thúc' })) return;
      c.ketThuc = isoGio(Date.now()); A.doiDuLieu(); A.veTrang(); return;
    }
    if (!nhap) return;
    const ch = t.closest('[data-chon]'); if (ch) { thuThongTin(); moChon(ch.dataset.chon); return; }
    const xc = t.closest('[data-xoa-chinh]'); if (xc) { thuThongTin(); nhap.sanPhamChinh = nhap.sanPhamChinh.filter((x) => x.id !== xc.dataset.xoaChinh); chonCT.delete(xc.dataset.xoaChinh); A.veTrang(); return; }
    const xq = t.closest('[data-xoa-qua]'); if (xq) { thuThongTin(); nhap.quaTang = nhap.quaTang.filter((x) => x.id !== xq.dataset.xoaQua); A.veTrang(); return; }
    const lo = t.closest('[data-loat]'); if (lo && chonCT.size) {
      thuThongTin();
      if (lo.dataset.loat === 'xoa') nhap.sanPhamChinh = nhap.sanPhamChinh.filter((x) => !chonCT.has(x.id));
      else nhap.sanPhamChinh.forEach((x) => { if (chonCT.has(x.id)) x.bat = lo.dataset.loat === 'bat'; });
      chonCT = new Set(); A.veTrang(); return;
    }
    if (t.id === 'ctXacNhan') {
      thuThongTin();
      const loi = kiemTra(); if (loi.length) { A.toast(loi[0], 'err'); return; }
      const ct = A.sao(nhap); delete ct.moi;
      const list = QT().chuongTrinh; const i = list.findIndex((x) => x.id === ct.id);
      if (i >= 0) list[i] = ct; else list.push(ct);
      nhap = null; goc = null; A.doiDuLieu(); A.toast('Đã lưu chương trình vào bản nháp – bấm Xuất bản để khách thấy', 'ok'); A.di('#/qua-tang');
    }
  });
  document.addEventListener('change', (e) => {
    if (!trongQuaTang()) return;
    const t = e.target;
    if (t.id === 'ctQ' || t.id === 'ctTu' || t.id === 'ctDen') { loc = { q: $('#ctQ').value.trim(), tu: $('#ctTu').value, den: $('#ctDen').value }; return A.veTrang(); }
    if (!nhap) return;
    const bc = t.closest('[data-bat-chinh]'); if (bc) { const x = nhap.sanPhamChinh.find((y) => y.id === bc.dataset.batChinh); if (x) x.bat = bc.checked; thuThongTin(); A.veTrang(); return; }
    const bq = t.closest('[data-bat-qua]'); if (bq) { const g = nhap.quaTang.find((y) => y.id === bq.dataset.batQua); if (g) { if (g.bienThe) g.bienThe[bq.dataset.pl] = bq.checked; else g.bat = bq.checked; } return; }
    const c1 = t.closest('[data-chon-mot]'); if (c1) { if (c1.checked) chonCT.add(c1.dataset.chonMot); else chonCT.delete(c1.dataset.chonMot); thuThongTin(); A.veTrang(); return; }
    if (t.closest('[data-chon-tat]')) { chonCT = t.checked ? new Set(nhap.sanPhamChinh.map((x) => x.id)) : new Set(); thuThongTin(); A.veTrang(); return; }
    if (['ctTen', 'ctBD', 'ctKT', 'ctMuc', 'ctSo'].includes(t.id)) thuThongTin();
  });

  /* veHang: hàm vẽ bảng hạng khách hàng (giữ ở m-marketing.js) */
  A.quaTang = { veDanhSach, veSua, trangThai };
  A.chonSanPham = chonSanPham;
  A.veKetHop = veKetHop;
})();
