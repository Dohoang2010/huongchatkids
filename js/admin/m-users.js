/* ===== NGƯỜI DÙNG & PHÂN QUYỀN – tài khoản quản trị lưu ở Google Sheet ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc } = A;

  const TEN_VT = {
    SUPER_ADMIN: 'Quản trị cao nhất', MANAGER: 'Quản lý', ORDER_STAFF: 'Nhân viên đơn hàng',
    PRODUCT_STAFF: 'Nhân viên sản phẩm', CONTENT_STAFF: 'Nhân viên nội dung',
  };
  const MO_VT = {
    SUPER_ADMIN: 'Làm được mọi thứ, kể cả tạo tài khoản',
    MANAGER: 'Mọi nghiệp vụ bán hàng và website, không quản lý tài khoản',
    ORDER_STAFF: 'Xem và đổi trạng thái đơn, xem khách hàng',
    PRODUCT_STAFF: 'Sản phẩm, danh mục, flash sale, combo',
    CONTENT_STAFF: 'Bài viết, banner, SEO',
  };
  let data = null, dangSua = null;

  async function veDS(el) {
    el.innerHTML = A.dangTai('danh sách tài khoản');
    try {
      const d = await A.api('qtDs', A.xacThuc());
      if (!d || !d.ok) { el.innerHTML = d && d.msg ? A.loiTai(d.msg) : chuaCo(); return; }
      if (!d.ds) { el.innerHTML = chuaCo(); return; }
      data = d; ve(el, d);
    } catch (e) { el.innerHTML = A.loiTai(e.message); }
  }
  const chuaCo = () => `<div class="card err-box"><h3>⏳ Apps Script chưa có phần tài khoản</h3>
    <p>Dán lại <code>tools/apps-script-CUA-SHOP.gs</code> vào Apps Script rồi <b>Deploy → Manage deployments → ✏️ → New version → Deploy</b>.</p>
    <button class="btn btn--primary" data-act="tai-lai">Thử lại</button></div>`;

  function ve(el, d) {
    $('#pageAct').innerHTML = `<button class="btn btn--primary" id="qtThem">+ Thêm tài khoản</button>`;
    el.innerHTML = `<div class="card">
      <p class="muted">Mỗi người một tài khoản riêng. Mật khẩu được băm kèm muối trước khi lưu — không ai đọc được mật khẩu gốc, kể cả chủ shop.</p>
      <div class="tbl-wrap"><table><thead><tr><th>Tài khoản</th><th>Họ tên</th><th>Vai trò</th><th>Quyền</th><th>Trạng thái</th><th>Đăng nhập cuối</th><th></th></tr></thead><tbody>
      ${d.ds.map((u) => `<tr>
        <td><code>${esc(u.tk)}</code></td><td><b>${esc(u.ten)}</b></td>
        <td data-nhan="Vai trò">${A.badge(TEN_VT[u.vaiTro] || u.vaiTro, u.vaiTro === 'SUPER_ADMIN' ? 'tag--hot' : '')}</td>
        <td data-nhan="Quyền">${u.quyenRieng ? A.badge(u.quyenRieng.split(',').length + ' quyền riêng', 'tag--wait') : '<span class="muted">theo vai trò</span>'}</td>
        <td>${u.trangThai === 'Hoạt động' ? A.badge('Hoạt động', 'tag--ok') : A.badge('Đã khoá', 'tag--no')}</td>
        <td>${esc(u.dangNhapCuoi)}</td>
        <td class="num" style="white-space:nowrap">
          <button class="btn btn--ghost btn--sm" data-qt-sua="${esc(u.tk)}">Sửa</button>
          <button class="btn btn--red btn--sm" data-qt-xoa="${esc(u.tk)}">Xoá</button></td></tr>`).join('')}
      </tbody></table></div></div>
      <div id="qtForm"></div>`;
  }

  function veForm(u) {
    dangSua = u;
    const moi = !u;
    $('#qtForm').innerHTML = `<div class="card" id="qtBox">
      <h3>${moi ? '➕ Thêm tài khoản' : '✏️ Sửa tài khoản ' + esc(u.tk)}</h3>
      <div class="row row-3">
        <label>Tài khoản <i>*</i><input id="qtTk" value="${esc(u ? u.tk : '')}" ${moi ? '' : 'disabled'} placeholder="vd: nhanvien1"><small class="hint">Chữ thường, số, dấu _ . — 4 đến 24 ký tự</small></label>
        <label>Họ tên <i>*</i><input id="qtTen" value="${esc(u ? u.ten : '')}" placeholder="VD: Nguyễn Thu Hà"></label>
        <label>Vai trò<select id="qtVt">${Object.keys(TEN_VT).map((k) => `<option value="${k}" ${u && u.vaiTro === k ? 'selected' : ''}>${esc(TEN_VT[k])}</option>`).join('')}</select></label>
      </div>
      <div class="row row-3">
        <label>Mật khẩu ${moi ? '<i>*</i>' : '<span class="muted">(để trống = giữ nguyên)</span>'}<input id="qtMk" type="password" autocomplete="new-password" placeholder="${moi ? 'ít nhất 4 ký tự' : '••••••'}"></label>
        <label>Trạng thái<select id="qtTt">
          <option ${u && u.trangThai !== 'Hoạt động' ? '' : 'selected'}>Hoạt động</option>
          <option ${u && u.trangThai !== 'Hoạt động' ? 'selected' : ''}>Khoá</option></select></label>
        <div class="row__nut"><button class="btn btn--primary" id="qtLuu">${moi ? 'Tạo tài khoản' : 'Lưu'}</button>
          <button class="btn btn--ghost" id="qtHuy">Huỷ</button></div>
      </div>
      <div class="box-note" id="qtMoVt">${esc(MO_VT[u ? u.vaiTro : 'SUPER_ADMIN'])}</div>

      <h4>Quyền của tài khoản này</h4>
      <label class="sw"><input type="checkbox" id="qtRieng" ${u && u.quyenRieng ? 'checked' : ''}>
        Tự chọn quyền thay vì dùng quyền mặc định của vai trò</label>
      <div id="qtQuyen" class="${u && u.quyenRieng ? '' : 'hide'}"></div>
      </div>`;
    veQuyenChon(u);
    $('#qtForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* Ô tích quyền riêng cho từng tài khoản */
  function veQuyenChon(u) {
    const box = $('#qtQuyen'); if (!box) return;
    const dm = (data && data.danhMucQuyen) || [];
    const vt = $('#qtVt') ? $('#qtVt').value : (u ? u.vaiTro : 'SUPER_ADMIN');
    const mac = ((data && data.quyenTheoVaiTro) || {})[vt] || [];
    const hop = (q) => mac.some((m) => m === '*' || m === q || (m.endsWith('.*') && q.startsWith(m.slice(0, -1))));
    const dang = u && u.quyenRieng ? u.quyenRieng.split(',') : null;
    const bat = (q) => (dang ? dang.includes(q) : hop(q));
    if (!dm.length) { box.innerHTML = '<p class="muted">Cần Apps Script bản mới để hiện danh mục quyền.</p>'; return; }
    box.innerHTML = `<p class="muted">Tích vào quyền muốn cho phép. Apps Script cũng kiểm tra đúng danh sách này.</p>
      <div class="qgrid">${dm.map((g) => `<div class="qgrid__n"><b>${esc(g.nhom)}</b>
        ${g.ds.map(([q, ten]) => `<label class="qgrid__i"><input type="checkbox" data-q="${esc(q)}" ${bat(q) ? 'checked' : ''}>
          <span>${esc(ten)}<small>${esc(q)}</small></span></label>`).join('')}</div>`).join('')}</div>
      <div class="flex-nut"><button class="btn btn--ghost btn--sm" id="qtChonHet">Chọn tất cả</button>
        <button class="btn btn--ghost btn--sm" id="qtBoHet">Bỏ chọn tất cả</button>
        <button class="btn btn--ghost btn--sm" id="qtTheoVt">Lấy lại theo vai trò</button></div>`;
  }

  /* ---------------- Vai trò & phân quyền ---------------- */
  function veQuyen(el) {
    const q = (data && data.quyenTheoVaiTro) || {};
    const tatCa = [...new Set(Object.values(q).flat().filter((x) => x !== '*'))].sort();
    el.innerHTML = `<div class="card">
      <p class="muted">Vai trò quyết định mục nào hiện ra và thao tác nào làm được.
      <b>Apps Script cũng kiểm tra quyền này</b> trước khi trả dữ liệu — không chỉ ẩn nút trên giao diện.</p>
      ${Object.keys(TEN_VT).map((k) => `<div class="vt">
        <div class="vt__h"><b>${esc(TEN_VT[k])}</b> <code>${esc(k)}</code></div>
        <p class="muted">${esc(MO_VT[k])}</p>
        <div class="vt__q">${(q[k] || []).map((x) => A.badge(x === '*' ? 'Toàn quyền' : x, x === '*' ? 'tag--hot' : '')).join(' ') || '<span class="muted">—</span>'}</div>
      </div>`).join('')}
      ${tatCa.length ? `<h4>Danh sách quyền trong hệ thống</h4><div class="vt__q">${tatCa.map((x) => A.badge(x)).join(' ')}</div>` : ''}
      <div class="box-note">Muốn thêm/đổi vai trò: sửa biến <code>VAI_TRO_QT</code> trong Apps Script và <code>VAI_TRO</code> trong <code>js/admin/core.js</code> cho khớp.</div></div>`;
  }

  /* ---------------- Sự kiện ---------------- */
  document.addEventListener('click', async (e) => {
    const t = e.target;
    if (t.id === 'qtThem') return veForm(null);
    if (t.id === 'qtHuy') { $('#qtForm').innerHTML = ''; return; }
    const sua = t.closest('[data-qt-sua]');
    if (sua) return veForm(data.ds.find((u) => u.tk === sua.dataset.qtSua));
    const xoa = t.closest('[data-qt-xoa]');
    if (xoa) {
      const tk = xoa.dataset.qtXoa;
      const ok = await A.hoi({ tieuDe: 'Xoá tài khoản?', noiDung: `Tài khoản <code>${esc(tk)}</code> sẽ không đăng nhập được nữa.`, nutOk: 'Xoá', nguyHiem: true });
      if (!ok) return;
      try { const r = await A.api('qtXoa', { ...A.xacThuc(), tk });
        if (!r || !r.ok) { A.toast((r && r.msg) || 'Không xoá được', 'err'); return; }
        A.toast('Đã xoá tài khoản', 'ok'); data = null; A.veTrang();
      } catch (err) { A.toast(err.message, 'err'); }
      return;
    }
    if (t.id === 'qtLuu') {
      const tk = $('#qtTk').value.trim().toLowerCase(), ten = $('#qtTen').value.trim();
      const vaiTro = $('#qtVt').value, mk = $('#qtMk').value, trangThai = $('#qtTt').value;
      const quyenRieng = $('#qtRieng') && $('#qtRieng').checked
        ? $$('#qtQuyen [data-q]').filter((x) => x.checked).map((x) => x.dataset.q).join(',') : '';
      if (!tk || !ten) { A.toast('Nhập đủ tài khoản và họ tên', 'err'); return; }
      t.disabled = true; t.textContent = 'Đang lưu…';
      try {
        const r = await A.api('qtLuu', { ...A.xacThuc(), tk, ten, vaiTro, mk, trangThai, quyenRieng });
        if (!r || !r.ok) { A.toast((r && r.msg) || 'Không lưu được', 'err'); t.disabled = false; t.textContent = 'Lưu'; return; }
        A.toast(r.moi ? 'Đã tạo tài khoản' : 'Đã lưu', 'ok'); data = null; A.veTrang();
      } catch (err) {
        /* Hết giờ chờ nhưng máy chủ có thể vẫn đã lưu → tải lại danh sách để kiểm tra, tránh tạo trùng */
        if (/không phản hồi/i.test(err.message)) { A.toast('Máy chủ phản hồi chậm – có thể tài khoản đã được lưu. Đang tải lại danh sách để kiểm tra…', 'err'); data = null; A.veTrang(); return; }
        A.toast(err.message, 'err'); t.disabled = false; t.textContent = 'Lưu';
      }
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'qtVt') {
      if ($('#qtMoVt')) $('#qtMoVt').textContent = MO_VT[e.target.value] || '';
      if ($('#qtRieng') && !$('#qtRieng').checked) veQuyenChon(dangSua);
      return;
    }
    if (e.target.id === 'qtRieng') { $('#qtQuyen').classList.toggle('hide', !e.target.checked); return; }
  });
  document.addEventListener('click', (e) => {
    if (e.target.id === 'qtChonHet') { $$('#qtQuyen [data-q]').forEach((x) => { x.checked = true; }); return; }
    if (e.target.id === 'qtBoHet') { $$('#qtQuyen [data-q]').forEach((x) => { x.checked = false; }); return; }
    if (e.target.id === 'qtTheoVt') { veQuyenChon(null); return; }
  });

  A.dangKy({ route: '/nguoi-dung', ten: 'Người dùng', icon: '🧑‍💼', nhom: 'he-thong', quyen: 'setting.view',
    mo: 'Tài khoản quản trị cho từng người', ve: veDS });
  A.dangKy({ route: '/phan-quyen', ten: 'Vai trò & phân quyền', icon: '🛡️', nhom: 'he-thong', quyen: 'setting.view',
    mo: 'Ai được làm gì', async ve(el) { if (!data) { try { data = await A.api('qtDs', A.xacThuc()); } catch { data = null; } } veQuyen(el); } });
})();
