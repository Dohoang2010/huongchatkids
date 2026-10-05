/* ===== MÃ GIẢM GIÁ – Voucher kiểu Shopee =====
   Lưu ở window.COUPONS (khối ADMIN:COUPONS), khoá = mã khách nhập:
   { ten, loai: 'shop' | 'sanpham' | 'riengtu', batDau, hetHan ('YYYY-MM-DDTHH:mm'), luuTruoc,
     type: 'percent' | 'fixed' | 'ship', value, max, min, donDau, sanPham: [id], desc }
   Mã cũ không có loai/thời gian vẫn chạy như trước (toàn shop, không thời hạn).
   Web (js/app.js → applyCoupon / couponsFor) kiểm tra thời gian, sản phẩm áp dụng và ẩn mã riêng tư. */
(() => {
  'use strict';
  const A = window.ADMIN, { $, esc, fmt, khongDau } = A;
  const C = () => { A.D.COUPONS = A.D.COUPONS || {}; return A.D.COUPONS; };
  const ds = () => A.D.PRODUCTS || [];
  const sp = (id) => ds().find((p) => p.id === id);
  const LOAI = {
    shop: { ten: 'Voucher toàn Shop', mo: 'Voucher áp dụng cho tất cả sản phẩm trong Shop của bạn', ic: '🏪' },
    sanpham: { ten: 'Voucher sản phẩm', mo: 'Voucher chỉ áp dụng cho những sản phẩm nhất định mà Shop chọn', ic: '🛍️' },
    riengtu: { ten: 'Voucher riêng tư', mo: 'Voucher áp dụng cho nhóm khách hàng Shop muốn thông qua mã Voucher (không hiện công khai)', ic: '🎫' },
  };
  const loaiCua = (c) => (LOAI[c.loai] ? c.loai : 'shop');
  const isoGio = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const hienNgay = (s) => { if (!s) return ''; const d = new Date(s); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };
  const giamText = (c) => (c.type === 'ship' ? 'Miễn phí ship' : c.type === 'percent' ? `${c.value}% GIẢM${c.max ? ` (tối đa ${fmt(c.max)})` : ''}` : `${fmt(c.value)}`);
  function trangThai(c) {
    const now = Date.now(), s = c.batDau ? Date.parse(c.batDau) : 0, e = c.hetHan ? Date.parse(c.hetHan) : Infinity;
    if (now < s) return ['Sắp diễn ra', 'tag--wait', 'sap'];
    if (now < e) return ['Đang diễn ra', 'tag--ok', 'dang'];
    return ['Đã kết thúc', 'tag--off', 'het'];
  }

  /* ================= TRANG CHÍNH: TẠO VOUCHER + DANH SÁCH ================= */
  let tab = 'tat', tim = { theo: 'ten', q: '' };
  function veDanhSach(el) {
    $('#pageAct').innerHTML = '';
    const the = (k) => `<div class="vc-o"><b>${LOAI[k].ic} ${LOAI[k].ten}</b><p>${LOAI[k].mo}</p><a class="btn btn--outline btn--sm" href="#/ma-giam-gia/moi-${k}">Tạo</a></div>`;
    const all = Object.keys(C()).map((ma) => ({ ma, c: C()[ma] }));
    const dem = { tat: all.length, dang: 0, sap: 0, het: 0 }; all.forEach((x) => { dem[trangThai(x.c)[2]]++; });
    const q = khongDau(tim.q);
    const list = all.filter((x) => (tab === 'tat' || trangThai(x.c)[2] === tab) && (!q || khongDau(tim.theo === 'ma' ? x.ma : (x.c.ten || x.ma)).includes(q)))
      .sort((a, b) => (Date.parse(b.c.batDau || 0) || 0) - (Date.parse(a.c.batDau || 0) || 0));
    el.innerHTML = `
      <div class="card"><h3>Tạo Voucher</h3><p class="muted">Tạo Mã giảm giá toàn shop hoặc Mã giảm giá sản phẩm ngay bây giờ để thu hút người mua.</p>
        <div class="vc-nhom">Cải thiện tỷ lệ chuyển đổi</div><div class="vc-loai">${the('shop')}${the('sanpham')}</div>
        <div class="vc-nhom">Tập trung vào kênh hiển thị Voucher</div><div class="vc-loai">${the('riengtu')}</div>
      </div>
      <div class="card"><h3>Danh sách mã giảm giá</h3>
        <div class="vc-tabs">${[['tat', 'Tất cả'], ['dang', 'Đang diễn ra'], ['sap', 'Sắp diễn ra'], ['het', 'Đã kết thúc']].map(([k, t]) => `<button class="${tab === k ? 'is-on' : ''}" data-vc-tab="${k}">${t} (${dem[k]})</button>`).join('')}</div>
        <div class="loc">
          <label>Tìm kiếm<select id="vcTheo"><option value="ten" ${tim.theo === 'ten' ? 'selected' : ''}>Tên Voucher</option><option value="ma" ${tim.theo === 'ma' ? 'selected' : ''}>Mã voucher</option></select></label>
          <label>&nbsp;<input id="vcQ" value="${esc(tim.q)}" placeholder="Nhập để tìm"></label>
          <button class="btn btn--outline btn--sm" id="vcTim">Tìm</button>
        </div>
        ${list.length ? `<div class="tbl-wrap"><table class="ct-tbl"><thead><tr><th>Tên Voucher | Mã voucher</th><th>Loại mã</th><th>Sản phẩm áp dụng</th><th>Người mua mục tiêu</th><th>Giảm giá</th><th class="num">Đơn tối thiểu</th><th>Thời gian lưu Mã giảm giá</th><th>Thao tác</th></tr></thead><tbody>
          ${list.map(({ ma, c }) => { const [tt, cls, k] = trangThai(c); const l = loaiCua(c); return `<tr>
            <td data-nhan="Voucher"><div class="ct-sp"><span class="vc-ic ${c.type === 'fixed' ? 'vc-ic--tien' : ''}">${c.type === 'fixed' ? '₫' : c.type === 'ship' ? '🚚' : '%'}</span><span>${A.badge(tt, cls)}<a class="ct-ten" href="#/ma-giam-gia/${encodeURIComponent(ma)}">${esc(c.ten || ma)}</a><small class="muted">Mã voucher: <b>${esc(ma)}</b></small></span></div></td>
            <td data-nhan="Loại mã">${LOAI[l].ten}</td>
            <td data-nhan="Sản phẩm">${l === 'sanpham' ? `Tổng cộng ${(c.sanPham || []).length} sản phẩm` : 'Tất cả sản phẩm'}</td>
            <td data-nhan="Người mua">${c.donDau ? 'Khách mua lần đầu' : 'Tất cả Người mua'}</td>
            <td data-nhan="Giảm giá">${giamText(c)}</td>
            <td class="num" data-nhan="Đơn tối thiểu">${c.min ? fmt(c.min) : '—'}</td>
            <td data-nhan="Thời gian">${c.batDau || c.hetHan ? `${hienNgay(c.batDau) || 'Ngay'} –<br>${hienNgay(c.hetHan) || 'Không thời hạn'}` : 'Không thời hạn'}</td>
            <td data-nhan="Thao tác"><div class="ct-act">
              <a href="#/ma-giam-gia/${encodeURIComponent(ma)}">${k === 'het' ? 'Chi tiết' : 'Chỉnh sửa'}</a>
              <button data-vc-sao="${esc(ma)}">Sao chép</button>
              ${k === 'dang' && c.hetHan ? `<button data-vc-ket="${esc(ma)}">Kết thúc</button>` : ''}
              <button class="red" data-vc-xoa="${esc(ma)}">Xoá</button></div></td></tr>`; }).join('')}
        </tbody></table></div>` : A.trong('Không có mã giảm giá', tab === 'tat' && !tim.q ? 'Chọn một loại Voucher ở trên để tạo mã đầu tiên.' : 'Không có mã nào khớp bộ lọc.', '🎟️')}
        <div class="box-note">Khách nhập mã ở bước thanh toán. Dùng chung với ưu đãi hạng / quà tặng hay không: chỉnh ở thẻ <b>Quy tắc dùng chung ưu đãi</b> bên dưới. Voucher toàn shop và Voucher sản phẩm hiện ở trang tài khoản của khách; Voucher riêng tư chỉ ai có mã mới dùng được.</div>
      </div>
      ${A.veKetHop ? A.veKetHop() : ''}`;
  }

  /* ================= TẠO / SỬA VOUCHER ================= */
  let nhap = null, maGoc = null;
  function veSua(el, sub) {
    const moi = /^moi-/.test(sub);
    const key = moi ? null : decodeURIComponent(sub);
    if (!nhap || nhap._sub !== sub) {
      if (moi) {
        const l = sub.slice(4); if (!LOAI[l]) { A.di('#/ma-giam-gia'); return; }
        const t = Date.now() + 10 * 6e4;
        nhap = { _sub: sub, ma: '', ten: '', loai: l, batDau: isoGio(t), hetHan: isoGio(t + 7 * 864e5), luuTruoc: false, type: 'percent', value: 10, max: 0, min: 0, donDau: false, sanPham: [], desc: '' };
        maGoc = null;
      } else {
        const c = C()[key]; if (!c) { el.innerHTML = A.trong('Không tìm thấy mã', 'Mã có thể đã bị xoá.', '🔍') + '<p><a href="#/ma-giam-gia">← Danh sách</a></p>'; return; }
        nhap = { _sub: sub, ma: key, ten: '', loai: 'shop', batDau: '', hetHan: '', luuTruoc: false, max: 0, min: 0, donDau: false, sanPham: [], desc: '', ...A.sao(c) };
        nhap.loai = loaiCua(nhap); maGoc = key;
      }
    }
    const c = nhap, goc = maGoc ? C()[maGoc] : null;
    const [tt, cls, k] = goc ? trangThai(goc) : ['Mới', 'tag--wait', 'moi'];
    const chiXem = k === 'het', dis = chiXem ? 'disabled' : '';
    $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#/ma-giam-gia" data-vc-huy>← Danh sách</a>`;
    el.innerHTML = `
      <div class="card"><h3>Thông tin cơ bản ${A.badge(tt, cls)}</h3>
        <div class="row row-2">
          <label>Loại mã<div class="ct-loai"><span>${LOAI[c.loai].ic} ${LOAI[c.loai].ten}</span></div><small class="hint">${LOAI[c.loai].mo}</small></label>
          <label>Tên chương trình giảm giá<input id="vcTen" maxlength="100" value="${esc(c.ten || '')}" placeholder="VD: Giảm 10% tháng 10" ${dis}><small class="hint">Tên Voucher sẽ không được hiển thị cho Người mua.</small></label>
        </div>
        <div class="row row-2">
          <label>Mã voucher<div class="vc-ma"><input id="vcMa" maxlength="20" value="${esc(c.ma)}" placeholder="VD: HCK10" ${dis || (goc && k === 'dang' ? 'disabled' : '')}></div><small class="hint">Chỉ chữ cái (A-Z) và số (0-9), tối đa 20 kí tự. Khách nhập mã này khi thanh toán.</small></label>
          <label>Mô tả hiện cho khách<input id="vcDesc" maxlength="120" value="${esc(c.desc || '')}" placeholder="Tự tạo nếu để trống" ${dis}></label>
        </div>
        <div class="row row-2">
          <label>Thời gian bắt đầu<input type="datetime-local" id="vcBD" value="${esc(c.batDau || '')}" ${dis || (goc && k === 'dang' ? 'disabled' : '')}></label>
          <label>Thời gian kết thúc<input type="datetime-local" id="vcKT" value="${esc(c.hetHan || '')}" ${dis}><small class="hint">Để trống = không thời hạn. Kết thúc phải sau bắt đầu tối thiểu 1 tiếng.</small></label>
        </div>
        ${c.loai === 'riengtu' ? '' : `<label class="ck"><input type="checkbox" id="vcLuu" ${c.luuTruoc ? 'checked' : ''} ${dis}> Cho phép lưu mã trước Thời gian sử dụng (hiện ở trang tài khoản khách trước khi bắt đầu)</label>`}
      </div>

      <div class="card"><h3>Thiết lập mã giảm giá</h3>
        <div class="row row-2">
          <label>Loại giảm giá | Mức giảm<div class="vc-giam">
            <select id="vcType" ${dis}><option value="percent" ${c.type === 'percent' ? 'selected' : ''}>Theo phần trăm</option><option value="fixed" ${c.type === 'fixed' ? 'selected' : ''}>Theo số tiền</option><option value="ship" ${c.type === 'ship' ? 'selected' : ''}>Miễn phí vận chuyển</option></select>
            ${c.type === 'ship' ? '<input disabled value="Miễn phí ship">' : `<input type="number" id="vcVal" min="0" value="${Number(c.value) || 0}" placeholder="${c.type === 'percent' ? '%' : '₫'}" ${dis}>`}</div>
            <small class="hint">${c.type === 'percent' ? 'Nhập số phần trăm giảm, VD 10 = giảm 10%.' : c.type === 'fixed' ? 'Nhập số tiền giảm (đ).' : 'Đơn dùng mã được miễn phí vận chuyển.'}</small></label>
          ${c.type === 'percent' ? `<label>Mức giảm tối đa (đ)<input type="number" id="vcMax" min="0" value="${Number(c.max) || 0}" ${dis}><small class="hint">0 = không giới hạn.</small></label>` : '<div></div>'}
        </div>
        <div class="row row-2">
          <label>Giá trị đơn hàng tối thiểu (đ)<input type="number" id="vcMin" min="0" value="${Number(c.min) || 0}" ${dis}><small class="hint">${c.loai === 'sanpham' ? 'Tính trên tiền các sản phẩm áp dụng trong giỏ.' : 'Tính trên tạm tính của đơn.'}</small></label>
          <label>Người mua mục tiêu<select id="vcDoi" ${dis}><option value="" ${c.donDau ? '' : 'selected'}>Tất cả Người mua</option><option value="dau" ${c.donDau ? 'selected' : ''}>Khách mua lần đầu</option></select></label>
        </div>
      </div>

      <div class="card"><div class="ct-h"><div><h3>Sản phẩm được áp dụng</h3>
          <p class="muted">${c.loai === 'sanpham' ? 'Mã chỉ giảm trên tiền các sản phẩm bên dưới.' : 'Tất cả sản phẩm'}</p></div>
          ${c.loai === 'sanpham' && !chiXem ? '<button class="btn btn--outline" id="vcThemSP">+ Thêm sản phẩm</button>' : ''}</div>
        ${c.loai === 'sanpham' ? ((c.sanPham || []).length ? `<div class="tbl-wrap"><table><thead><tr><th>Sản phẩm</th><th class="num">Giá</th><th class="num">Kho</th>${chiXem ? '' : '<th></th>'}</tr></thead><tbody>
          ${c.sanPham.map((id) => { const p = sp(id); if (!p) return ''; return `<tr><td><div class="ct-sp"><img src="${esc(p.thumb || p.image || '')}" alt="" onerror="this.style.visibility='hidden'"><span>${esc(p.short || p.name)}<small class="muted">Mã: ${esc(p.id)}</small></span></div></td>
            <td class="num">${fmt(p.price)}</td><td class="num">${p.stock > 0 ? p.stock : '<span class="red">Hết</span>'}</td>${chiXem ? '' : `<td><button class="icobtn" data-vc-bo="${esc(id)}" title="Bỏ">🗑</button></td>`}</tr>`; }).join('')}
          </tbody></table></div>` : '<p class="muted">Chưa chọn sản phẩm nào.</p>') : ''}
      </div>

      <div class="ct-foot">${chiXem ? '<span class="muted">Mã đã kết thúc – chỉ xem. Bấm "Sao chép" ở danh sách để tạo đợt mới.</span>' : '<span class="muted">Bấm Xác nhận để lưu vào bản nháp, rồi Xuất bản để khách dùng được.</span>'}
        <a class="btn btn--ghost" href="#/ma-giam-gia" data-vc-huy>${chiXem ? 'Quay lại' : 'Huỷ'}</a>${chiXem ? '' : '<button class="btn btn--primary" id="vcXacNhan">Xác nhận</button>'}</div>`;
  }
  function thu() {
    if (!nhap || !$('#vcTen') || $('#vcTen').disabled) return;
    const v = (id) => ($(id) ? $(id).value : '');
    nhap.ten = v('#vcTen').trim(); nhap.ma = v('#vcMa').toUpperCase().replace(/[^A-Z0-9]/g, ''); nhap.desc = v('#vcDesc').trim();
    nhap.batDau = v('#vcBD'); nhap.hetHan = v('#vcKT'); nhap.luuTruoc = !!($('#vcLuu') && $('#vcLuu').checked);
    nhap.type = v('#vcType') || nhap.type; if ($('#vcVal')) nhap.value = Math.max(0, Number(v('#vcVal')) || 0);
    if ($('#vcMax')) nhap.max = Math.max(0, Number(v('#vcMax')) || 0);
    nhap.min = Math.max(0, Number(v('#vcMin')) || 0); nhap.donDau = v('#vcDoi') === 'dau';
  }
  function kiemTra() {
    const c = nhap, goc = maGoc ? C()[maGoc] : null;
    if (!c.ten) return 'Nhập tên chương trình giảm giá';
    if (!c.ma) return 'Nhập mã voucher (chữ và số)';
    if (c.ma !== maGoc && C()[c.ma]) return `Mã ${c.ma} đã tồn tại`;
    const s = c.batDau ? Date.parse(c.batDau) : 0, e = c.hetHan ? Date.parse(c.hetHan) : 0;
    if (e && s && e - s < 36e5) return 'Thời gian kết thúc phải sau thời gian bắt đầu tối thiểu 1 tiếng';
    if (e && !goc && e <= Date.now()) return 'Thời gian kết thúc phải ở tương lai';
    if (c.type === 'percent' && !(c.value > 0 && c.value <= 100)) return 'Phần trăm giảm phải từ 1 đến 100';
    if (c.type === 'fixed' && !(c.value > 0)) return 'Nhập số tiền giảm';
    if (c.type === 'fixed' && c.min && c.value > c.min) return 'Số tiền giảm không được lớn hơn giá trị đơn tối thiểu';
    if (c.loai === 'sanpham' && !(c.sanPham || []).some(sp)) return 'Chọn ít nhất 1 sản phẩm áp dụng';
    return '';
  }
  function luu() {
    const c = nhap;
    const o = { ten: c.ten, loai: c.loai, type: c.type, value: c.type === 'ship' ? 0 : c.value, min: c.min,
      desc: c.desc || (c.type === 'ship' ? 'Miễn phí vận chuyển' : c.type === 'percent' ? `Giảm ${c.value}%${c.max ? ' tối đa ' + fmt(c.max) : ''}` : `Giảm ${fmt(c.value)}`) + (c.desc ? '' : (c.min ? ` cho đơn từ ${fmt(c.min)}` : '') + (c.loai === 'sanpham' ? ' (sản phẩm áp dụng)' : '')) };
    if (c.batDau) o.batDau = c.batDau; if (c.hetHan) o.hetHan = c.hetHan;
    if (c.type === 'percent' && c.max) o.max = c.max;
    if (c.donDau) o.donDau = true; if (c.luuTruoc && c.loai !== 'riengtu') o.luuTruoc = true;
    if (c.loai === 'sanpham') o.sanPham = c.sanPham.filter(sp);
    const goc = maGoc ? C()[maGoc] : null; if (goc && goc.hang) o.hang = goc.hang;
    const moiC = {};   // giữ thứ tự, đổi tên khoá nếu sửa mã
    Object.keys(C()).forEach((k) => { if (k === maGoc) moiC[c.ma] = o; else moiC[k] = C()[k]; });
    if (!maGoc) moiC[c.ma] = o;
    A.D.COUPONS = moiC;
  }

  /* ================= SỰ KIỆN ================= */
  const o = () => /^#\/ma-giam-gia/.test(location.hash);
  document.addEventListener('click', async (e) => {
    if (!o()) return;
    const t = e.target;
    if (t.closest('[data-vc-huy]')) { nhap = null; return; }
    const tb = t.closest('[data-vc-tab]'); if (tb) { tab = tb.dataset.vcTab; return A.veTrang(); }
    if (t.id === 'vcTim') { tim = { theo: $('#vcTheo').value, q: $('#vcQ').value.trim() }; return A.veTrang(); }
    const sa = t.closest('[data-vc-sao]'); if (sa) {
      const g = C()[sa.dataset.vcSao]; if (!g) return;
      const now = Date.now() + 10 * 6e4, dai = g.batDau && g.hetHan ? Math.max(36e5, Date.parse(g.hetHan) - Date.parse(g.batDau)) : 7 * 864e5;
      nhap = { ma: '', ten: '', loai: 'shop', luuTruoc: false, max: 0, min: 0, donDau: false, sanPham: [], desc: '', ...A.sao(g), _sub: 'moi-' + loaiCua(g), batDau: isoGio(now), hetHan: isoGio(now + dai) };
      nhap.loai = loaiCua(nhap); nhap.ma = ''; nhap.ten = (g.ten || sa.dataset.vcSao) + ' (bản sao)'; maGoc = null;
      A.di('#/ma-giam-gia/moi-' + nhap.loai); return;
    }
    const xo = t.closest('[data-vc-xoa]'); if (xo) {
      const ma = xo.dataset.vcXoa;
      if (!await A.hoi({ tieuDe: 'Xoá mã giảm giá?', noiDung: `Mã <b>${esc(ma)}</b> sẽ không dùng được nữa sau khi Xuất bản.`, nutOk: 'Xoá', nguyHiem: true })) return;
      delete C()[ma]; A.doiDuLieu(); A.veTrang(); return;
    }
    const kt = t.closest('[data-vc-ket]'); if (kt) {
      const ma = kt.dataset.vcKet;
      if (!await A.hoi({ tieuDe: 'Kết thúc mã ngay?', noiDung: `Mã <b>${esc(ma)}</b> sẽ hết hạn ngay sau khi Xuất bản.`, nutOk: 'Kết thúc' })) return;
      C()[ma].hetHan = isoGio(Date.now()); A.doiDuLieu(); A.veTrang(); return;
    }
    if (!nhap) return;
    if (t.id === 'vcThemSP') { thu(); A.chonSanPham(new Set(nhap.sanPham), (ids) => { nhap.sanPham.push(...ids); A.veTrang(); }); return; }
    const bo = t.closest('[data-vc-bo]'); if (bo) { thu(); nhap.sanPham = nhap.sanPham.filter((x) => x !== bo.dataset.vcBo); A.veTrang(); return; }
    if (t.id === 'vcXacNhan') {
      thu(); const loi = kiemTra(); if (loi) { A.toast(loi, 'err'); return; }
      luu(); nhap = null; A.doiDuLieu(); A.toast('Đã lưu mã vào bản nháp – bấm Xuất bản để khách dùng được', 'ok'); A.di('#/ma-giam-gia');
    }
  });
  document.addEventListener('change', (e) => {
    if (!o() || !nhap) return;
    if (e.target.id === 'vcType') { thu(); if (nhap.type === 'percent' && nhap.value > 100) nhap.value = 10; A.veTrang(); return; }
    if (/^vc/.test(e.target.id)) thu();
  });
  document.addEventListener('keydown', (e) => { if (o() && e.key === 'Enter' && e.target.id === 'vcQ') { tim = { theo: $('#vcTheo').value, q: e.target.value.trim() }; A.veTrang(); } });

  A.dangKy({ route: '/ma-giam-gia', ten: 'Mã giảm giá', icon: '🎟️', nhom: 'ban-hang', quyen: 'product.view', preview: false, mo: 'Voucher toàn shop, voucher sản phẩm, voucher riêng tư',
    ve: (el, { sub } = {}) => (sub ? veSua(el, sub) : veDanhSach(el)) });
})();
