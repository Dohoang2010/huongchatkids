/* ===== ĐIỂM DANH & VOUCHER – Khách hàng › Loyalty =====
   Máy chủ (Apps Script): qtDdTongQuan, qtDdCauHinh, qtDdLichSu, qtVcDs, qtVcThuHoi.
   Cấu hình lưu ở Script Properties (DD_CAU_HINH); sửa ở đây chỉ đổi khung xem trước, bấm Lưu mới áp dụng cho khách. */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc } = A;
  const R = '/diem-danh';
  const TAB = [['', 'Tổng quan', 'loyalty.view'], ['cau-hinh', 'Cấu hình phần thưởng', 'loyalty.view'], ['lich-su', 'Lịch sử điểm danh', 'loyalty.view'], ['voucher', 'Voucher đã cấp', 'loyalty.view']];
  const NGUON = { DOUBLE_DATE: 'Ngày đôi', STREAK_10: 'Chuỗi 10 ngày', STREAK_20: 'Chuỗi 20 ngày', STREAK_30: 'Chuỗi 30 ngày' };
  const TT = { AVAILABLE: ['Chưa dùng', 'tag--ok'], RESERVED: ['Đang giữ', 'tag--wait'], USED: ['Đã dùng', 'tag--hot'], EXPIRED: ['Hết hạn', 'tag--off'], REVOKED: ['Đã thu hồi', 'tag--no'] };
  const d0 = (n) => (Number(n) || 0).toLocaleString('vi-VN');
  const dd = (n) => d0(n) + 'đ';
  const homNay = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
  const dauThang = () => homNay().slice(0, 8) + '01';
  const loc = { tu: dauThang(), den: homNay(), sdt: '', nguon: '', trangThai: '', trang: 1 };
  let cfgGoc = null, cfgSua = null, xtSan = false;

  const khung = (el, tab) => { el.innerHTML = `<div class="tabs2">${TAB.filter((t) => A.co(t[2])).map(([k, t]) => `<a class="tab2 ${k === tab ? 'is-on' : ''}" href="#${R}${k ? '/' + k : ''}">${t}</a>`).join('')}</div><div id="ddBody"></div>`; return $('#ddBody'); };
  const goi = async (action, p = {}) => { try { return await A.api(action, p); } catch (e) { return { ok: false, msg: e.message }; } };
  const boLoc = (coNguon) => `<div class="card dd-loc"><div class="dd-loc__h">
      <label>Từ ngày<input type="date" id="ddTu" value="${esc(loc.tu)}"></label><label>Đến ngày<input type="date" id="ddDen" value="${esc(loc.den)}"></label>
      ${coNguon !== undefined ? `<label>SĐT khách<input id="ddSdt" inputmode="numeric" placeholder="Tìm theo số" value="${esc(loc.sdt)}"></label>` : ''}
      ${coNguon ? `<label>Nguồn<select id="ddNguon"><option value="">Tất cả</option>${Object.keys(NGUON).map((k) => `<option value="${k}" ${loc.nguon === k ? 'selected' : ''}>${NGUON[k]}</option>`).join('')}</select></label>
      <label>Trạng thái<select id="ddTT"><option value="">Tất cả</option>${Object.keys(TT).map((k) => `<option value="${k}" ${loc.trangThai === k ? 'selected' : ''}>${TT[k][0]}</option>`).join('')}</select></label>` : ''}
      <button class="btn btn--primary" id="ddLoc">Lọc</button><button class="btn btn--ghost" id="ddLocTat">Tất cả thời gian</button></div></div>`;

  /* ---------- Tổng quan ---------- */
  async function tongQuan(el) {
    el.innerHTML = boLoc() + A.dangTai('số liệu điểm danh');
    const d = await goi('qtDdTongQuan', { tu: loc.tu, den: loc.den });
    if (!d.ok) { el.innerHTML = boLoc() + A.loiTai(d.msg); return; }
    const tt = d.theoTT || {};
    el.innerHTML = boLoc() + `<div class="kpis">
        ${A.the('Khách tham gia', d0(d.khachThamGia), 'trong khoảng lọc')}
        ${A.the('Điểm danh hôm nay', d0(d.luotHomNay), 'tháng này: ' + d0(d.luotThang))}
        ${A.the('Tổng điểm đã phát', d0(d.diemPhat), '≈ ' + dd(d.giaTriDiem))}
        ${A.the('Voucher đã cấp', d0(d.soVoucher), 'tổng mệnh giá ' + dd(d.giaTriVoucherCap))}
        ${A.the('Còn hiệu lực', d0(d.conHieuLuc), 'đang giữ: ' + d0(tt.RESERVED))}
        ${A.the('Đã sử dụng', d0(d.daDung), 'tỷ lệ dùng ' + d.tyLeDung + '%')}
        ${A.the('Chi phí ưu đãi thực tế', dd(d.chiPhiThucTe), 'voucher đã dùng + giá trị điểm')}
      </div>
      <div class="grid-2" style="align-items:start"><div class="card"><h3>Voucher theo loại</h3>
        ${(d.theoNguon || []).length ? `<div class="tbl-wrap"><table><thead><tr><th>Loại</th><th>Đã cấp</th><th>Đã dùng</th><th>Tỷ lệ dùng</th><th>Tổng mệnh giá</th></tr></thead><tbody>
          ${d.theoNguon.map((x) => `<tr><td>${esc(x.ten)}</td><td>${d0(x.cap)}</td><td>${d0(x.dung)}</td><td>${x.cap ? Math.round(x.dung * 100 / x.cap) : 0}%</td><td>${dd(x.giaTri)}</td></tr>`).join('')}</tbody></table></div>` : A.trong('Chưa cấp voucher nào', 'Trong khoảng thời gian đã chọn chưa có voucher.', '🎟️')}</div>
        <div class="card"><h3>Trạng thái voucher</h3><div class="dd-tt">${Object.keys(TT).map((k) => `<div><span class="tag ${TT[k][1]}">${TT[k][0]}</span><b>${d0(tt[k])}</b></div>`).join('')}</div>
        <p class="muted" style="margin-top:10px">Số liệu đọc trực tiếp từ sheet "Điểm danh" và "Voucher khách". Chi phí thực tế = mệnh giá voucher đã dùng + giá trị điểm đã phát (1 điểm = ${dd(d.diemPhat ? d.giaTriDiem / d.diemPhat : 1)}).</p></div></div>`;
  }

  /* ---------- Cấu hình + xem trước trực tiếp ---------- */
  const o = (c, k) => (k.split('.').reduce((x, y) => (x || {})[y], c));
  const nhap = (nhan, k, kieu = 'number', them = '') => `<label>${nhan}<input data-k="${k}" type="${kieu}" ${them} value="${esc(o(cfgSua, k) ?? '')}"></label>`;
  const bat = (nhan, k) => `<label class="dd-bat"><input type="checkbox" data-k="${k}" ${o(cfgSua, k) ? 'checked' : ''}> ${nhan}</label>`;
  function cauHinhCongKhai(c) {   // giống cauHinhCongKhai_ trên máy chủ: giá trị 0 khi tắt
    const g = (x) => (x && x.bat ? Number(x.giaTri) || 0 : 0);
    return { ...c, diemNgay: Number(c.diemNgay) || 0, ngayDoi: g(c.ngayDoi), m10: g(c.moc.m10), m20: g(c.moc.m20), m30: g(c.moc.m30), hanNgay: Number(c.hanNgay) || 0, donToiThieu: Number(c.donToiThieu) || 0 };
  }
  function guiXemTruoc() { const f = $('#ddXt'); if (f && xtSan) f.contentWindow.postMessage({ type: 'dd-preview', cfg: cauHinhCongKhai(cfgSua) }, location.origin); }
  async function cauHinh(el) {
    el.innerHTML = A.dangTai('cấu hình');
    const d = await goi('qtDdCauHinh', {});
    if (!d.ok) { el.innerHTML = A.loiTai(d.msg); return; }
    cfgGoc = d.cauHinh; cfgSua = JSON.parse(JSON.stringify(cfgGoc)); xtSan = false;
    const sua = A.co('loyalty.update');
    const pv = cfgSua.phamVi || { loai: 'tatca', ds: [] };
    el.innerHTML = `<div class="dd-ch">
      <div class="dd-ch__form">
        ${sua ? '' : '<div class="card"><p class="muted">Tài khoản của bạn chỉ được xem cấu hình (cần quyền "Sửa cấu hình điểm danh").</p></div>'}
        <div class="card"><h3>⚙️ Chương trình</h3>
          ${bat('Bật chương trình điểm danh', 'bat')}${bat('Tự điểm danh khi khách đăng nhập thành công', 'tuDong')}
          ${nhap('Tên chương trình', 'ten', 'text', 'maxlength="120"')}
          <label>Mô tả<textarea data-k="moTa" rows="2" maxlength="300">${esc(cfgSua.moTa)}</textarea></label>
          <div class="grid-2">${nhap('Biểu tượng (emoji)', 'icon', 'text', 'maxlength="8"')}<label>Màu chủ đạo<input data-k="mau" type="color" value="${esc(cfgSua.mau)}"></label></div>
          <div class="grid-2">${nhap('Bắt đầu (trống = ngay)', 'batDau', 'date')}${nhap('Kết thúc (trống = không giới hạn)', 'ketThuc', 'date')}</div></div>
        <div class="card"><h3>🎁 Phần thưởng</h3>
          ${nhap('Điểm thưởng mỗi ngày', 'diemNgay', 'number', 'min="0" step="100"')}
          <div class="dd-th">${bat('Voucher ngày đôi (01/01 … 12/12)', 'ngayDoi.bat')}${nhap('Giá trị (đ)', 'ngayDoi.giaTri', 'number', 'min="0" step="1000"')}</div>
          ${[10, 20, 30].map((m) => `<div class="dd-th">${bat(`Voucher chuỗi ${m} ngày liên tiếp`, `moc.m${m}.bat`)}${nhap('Giá trị (đ)', `moc.m${m}.giaTri`, 'number', 'min="0" step="1000"')}</div>`).join('')}
          <p class="muted">Tắt một loại thưởng chỉ dừng cấp thưởng MỚI; voucher đã cấp vẫn giữ nguyên trong ví khách.</p></div>
        <div class="card"><h3>🎟️ Điều kiện voucher</h3>
          <div class="grid-2">${nhap('Hạn dùng (ngày kể từ lúc nhận)', 'hanNgay', 'number', 'min="1" max="365"')}${nhap('Đơn tối thiểu (đ)', 'donToiThieu', 'number', 'min="0" step="10000"')}</div>
          <label>Phạm vi áp dụng<select data-k="phamVi.loai"><option value="tatca" ${pv.loai === 'tatca' ? 'selected' : ''}>Tất cả sản phẩm</option><option value="danhmuc" ${pv.loai === 'danhmuc' ? 'selected' : ''}>Theo danh mục</option><option value="sanpham" ${pv.loai === 'sanpham' ? 'selected' : ''}>Theo sản phẩm</option></select></label>
          <div id="ddPv">${chonPhamVi(pv)}</div>
          ${bat('Cho cộng dồn với ưu đãi hạng thành viên (tắt = web tự chọn mức có lợi hơn cho khách)', 'ketHopHang')}
          <p class="muted">Voucher không cộng dồn với mã giảm giá khác và giảm giá giới thiệu (mỗi đơn 1 mã). Áp dụng cho phạm vi mới chỉ với voucher cấp sau khi lưu.</p></div>
        <div class="card"><h3>💬 Thông báo & thể lệ</h3>
          ${nhap('Thông báo khi điểm danh thành công', 'thongBao', 'text', 'maxlength="300"')}<p class="muted">Dùng {diem} = số điểm, {voucher} = voucher vừa nhận.</p>
          <label>Thể lệ (mỗi dòng 1 ý)<textarea data-k="theLe" rows="6" maxlength="3000">${esc(cfgSua.theLe)}</textarea></label>
          <p class="muted">Dùng {diem}, {ngayDoi}, {m10}, {m20}, {m30}, {donToiThieu}, {hanNgay} để tự điền theo cấu hình.</p></div>
        ${sua ? `<div class="dd-luu"><span class="muted" id="ddTrangThai">Chưa có thay đổi</span><button class="btn btn--ghost" id="ddHoan">Hoàn tác</button><button class="btn btn--primary" id="ddLuu">Lưu cấu hình</button></div>` : ''}
      </div>
      <div class="dd-ch__xt"><div class="card dd-xt"><h3>👁️ Xem trước giao diện khách <small class="muted">(cập nhật ngay, chưa lưu)</small></h3>
        <div class="dd-xt__seg"><button class="btn btn--ghost btn--sm is-on" data-xt-w="420">📱 Điện thoại</button><button class="btn btn--ghost btn--sm" data-xt-w="1100">🖥️ Máy tính</button></div>
        <div class="dd-xt__khung" id="ddXtKhung"><iframe id="ddXt" title="Xem trước trang điểm danh" src="diem-danh.html?preview=1"></iframe></div></div></div></div>`;
    if (!sua) $$('#ddBody [data-k]').forEach((x) => { x.disabled = true; });
    const f = $('#ddXt'); f.addEventListener('load', () => { setTimeout(() => { xtSan = true; guiXemTruoc(); }, 300); });
    co();
  }
  function chonPhamVi(pv) {
    if (pv.loai === 'danhmuc') return `<div class="dd-pv">${(window.CATEGORIES || []).map((c) => `<label class="dd-bat"><input type="checkbox" data-pv="${esc(c.key)}" ${(pv.ds || []).includes(c.key) ? 'checked' : ''}> ${esc(c.label)}</label>`).join('')}</div>`;
    if (pv.loai === 'sanpham') return `<input id="ddPvTim" placeholder="Lọc sản phẩm…" style="margin-bottom:6px"><div class="dd-pv dd-pv--sp">${(window.PRODUCTS || []).filter((p) => !p.an).map((p) => `<label class="dd-bat" data-ten="${esc(A.khongDau((p.short || p.name).toLowerCase()))}"><input type="checkbox" data-pv="${esc(p.id)}" ${(pv.ds || []).includes(p.id) ? 'checked' : ''}> ${esc(p.short || p.name)}</label>`).join('')}</div>`;
    return '';
  }
  const daDoi = () => JSON.stringify(cfgSua) !== JSON.stringify(cfgGoc);
  function co() { const t = $('#ddTrangThai'); if (t) { t.textContent = daDoi() ? '● Có thay đổi chưa lưu' : 'Chưa có thay đổi'; t.style.color = daDoi() ? '#C2185B' : ''; } }
  function ganGiaTri(k, v) { const p = k.split('.'); let x = cfgSua; while (p.length > 1) { const y = p.shift(); x[y] = x[y] || {}; x = x[y]; } x[p[0]] = v; }

  /* ---------- Lịch sử điểm danh ---------- */
  async function lichSu(el) {
    el.innerHTML = boLoc(false) + A.dangTai('lịch sử điểm danh');
    const d = await goi('qtDdLichSu', { tu: loc.tu, den: loc.den, sdt: loc.sdt, trang: loc.trang, moiTrang: 50 });
    if (!d.ok) { el.innerHTML = boLoc(false) + A.loiTai(d.msg); return; }
    el.innerHTML = boLoc(false) + `<div class="card">${d.ds.length ? `<div class="tbl-wrap"><table><thead><tr><th>Ngày</th><th>Khách</th><th>Thời điểm</th><th>Cách</th><th>Chuỗi</th><th>Điểm</th><th>Voucher nhận</th></tr></thead><tbody>
      ${d.ds.map((x) => `<tr><td>${esc(x.ngay.split('-').reverse().join('/'))}</td><td><b>${esc(x.ten || '—')}</b><br><small class="muted">${esc(x.sdt)}</small></td><td>${esc(x.luc)}</td><td>${esc(x.nguon)}</td><td>${d0(x.chuoi)} ngày</td><td>+${d0(x.diem)}</td><td><small>${esc(x.thuong || '—')}</small></td></tr>`).join('')}</tbody></table></div>${A.phanTrang(d.tong, d.trang, d.moiTrang, 'ddpg')}` : A.trong('Chưa có lượt điểm danh', 'Thử đổi khoảng ngày hoặc số điện thoại.', '📅')}</div>`;
  }
  /* ---------- Voucher đã cấp ---------- */
  async function voucher(el) {
    el.innerHTML = boLoc(true) + A.dangTai('voucher');
    const d = await goi('qtVcDs', { tu: loc.tu, den: loc.den, sdt: loc.sdt, nguon: loc.nguon, trangThai: loc.trangThai, trang: loc.trang, moiTrang: 50 });
    if (!d.ok) { el.innerHTML = boLoc(true) + A.loiTai(d.msg); return; }
    const thuHoi = A.co('loyalty.update');
    el.innerHTML = boLoc(true) + `<div class="card">${d.ds.length ? `<div class="tbl-wrap"><table><thead><tr><th>Mã</th><th>Khách</th><th>Loại</th><th>Giá trị</th><th>Trạng thái</th><th>Cấp lúc</th><th>Hết hạn</th><th>Đơn dùng</th>${thuHoi ? '<th></th>' : ''}</tr></thead><tbody>
      ${d.ds.map((v) => `<tr><td><code>${esc(v.ma)}</code></td><td><b>${esc(v.ten || '—')}</b><br><small class="muted">${esc(v.sdt)}</small></td><td>${esc(NGUON[v.nguon] || v.nguon)}<br><small class="muted">${esc(v.ky)}</small></td><td>${dd(v.giaTri)}<br><small class="muted">đơn từ ${dd(v.donToiThieu)}</small></td>
        <td><span class="tag ${(TT[v.trangThai] || [])[1] || ''}">${esc((TT[v.trangThai] || [v.trangThai])[0])}</span>${v.ghiChu ? `<br><small class="muted">${esc(v.ghiChu)}</small>` : ''}</td><td>${esc(v.capLuc)}</td><td>${esc(new Date(v.hetHan).toLocaleDateString('vi-VN'))}</td><td>${esc(v.maDon || '—')}</td>
        ${thuHoi ? `<td>${v.trangThai === 'AVAILABLE' || v.trangThai === 'RESERVED' ? `<button class="btn btn--ghost btn--sm" data-thu-hoi="${esc(v.ma)}">Thu hồi</button>` : ''}</td>` : ''}</tr>`).join('')}</tbody></table></div>${A.phanTrang(d.tong, d.trang, d.moiTrang, 'ddpg')}` : A.trong('Không có voucher', 'Thử đổi bộ lọc.', '🎟️')}</div>`;
  }

  async function ve(el, { sub }) {
    const tab = TAB.some((t) => t[0] === sub) ? sub : '';
    const body = khung(el, tab);
    if (tab === 'cau-hinh') return cauHinh(body);
    if (tab === 'lich-su') return lichSu(body);
    if (tab === 'voucher') return voucher(body);
    return tongQuan(body);
  }
  const taiLai = () => A.veTrang();
  const dangO = () => location.hash.startsWith('#' + R);

  /* Sửa ô cấu hình → cập nhật khung xem trước ngay (chưa lưu) */
  document.addEventListener('input', (e) => {
    if (!dangO()) return;
    const x = e.target.closest('[data-k]');
    if (x) { const v = x.type === 'checkbox' ? x.checked : x.type === 'number' ? Number(x.value) || 0 : x.value; ganGiaTri(x.dataset.k, v); if (x.dataset.k === 'phamVi.loai') { cfgSua.phamVi.ds = []; $('#ddPv').innerHTML = chonPhamVi(cfgSua.phamVi); } guiXemTruoc(); co(); return; }
    const pv = e.target.closest('[data-pv]'); if (pv) { const ds = new Set(cfgSua.phamVi.ds || []); if (pv.checked) ds.add(pv.dataset.pv); else ds.delete(pv.dataset.pv); cfgSua.phamVi.ds = [...ds]; co(); return; }
    if (e.target.id === 'ddPvTim') { const q = A.khongDau(e.target.value.toLowerCase().trim()); $$('.dd-pv--sp [data-ten]').forEach((l) => { l.style.display = !q || l.dataset.ten.includes(q) ? '' : 'none'; }); }
  });
  document.addEventListener('change', (e) => { if (dangO() && e.target.closest('[data-k],[data-pv]')) e.target.dispatchEvent(new Event('input', { bubbles: true })); });
  window.addEventListener('message', (e) => { if (e.origin === location.origin && e.data && e.data.type === 'dd-preview-ready') { xtSan = true; guiXemTruoc(); } });
  window.addEventListener('beforeunload', (e) => { if (dangO() && cfgSua && cfgGoc && daDoi()) { e.preventDefault(); e.returnValue = ''; } });

  let dangLuu = false;
  document.addEventListener('click', async (e) => {
    if (!dangO()) return;
    const w = e.target.closest('[data-xt-w]'); if (w) { $$('[data-xt-w]').forEach((b) => b.classList.toggle('is-on', b === w)); $('#ddXtKhung').style.setProperty('--w', w.dataset.xtW + 'px'); $('#ddXtKhung').classList.toggle('is-pc', w.dataset.xtW !== '420'); return; }
    if (e.target.id === 'ddHoan') { cfgSua = JSON.parse(JSON.stringify(cfgGoc)); return taiLai(); }
    if (e.target.id === 'ddLuu') {
      if (dangLuu || !daDoi()) return; dangLuu = true; e.target.disabled = true; e.target.textContent = 'Đang lưu…';
      const r = await goi('qtDdCauHinh', { luu: JSON.stringify(cfgSua) });
      dangLuu = false; e.target.disabled = false; e.target.textContent = 'Lưu cấu hình';
      if (!r.ok) return A.toast(r.msg || 'Chưa lưu được', 'err');
      cfgGoc = r.cauHinh; cfgSua = JSON.parse(JSON.stringify(cfgGoc)); co(); guiXemTruoc();
      try { localStorage.removeItem('mc_dd_cfg'); } catch { /* bỏ qua */ }
      return A.toast('Đã lưu – khách thấy cấu hình mới trong vòng 10 phút', 'ok');
    }
    if (e.target.id === 'ddLoc') { loc.tu = $('#ddTu').value; loc.den = $('#ddDen').value; loc.sdt = ($('#ddSdt') || {}).value || ''; loc.nguon = ($('#ddNguon') || {}).value || ''; loc.trangThai = ($('#ddTT') || {}).value || ''; loc.trang = 1; return taiLai(); }
    if (e.target.id === 'ddLocTat') { loc.tu = ''; loc.den = ''; loc.trang = 1; return taiLai(); }
    const pg = e.target.closest('[data-ddpg]'); if (pg) { loc.trang = Number(pg.dataset.ddpg) || 1; return taiLai(); }
    const th = e.target.closest('[data-thu-hoi]');
    if (th) {
      const lyDo = prompt('Lý do thu hồi voucher ' + th.dataset.thuHoi + ' (bắt buộc, khách không thấy):'); if (lyDo == null) return;
      if (lyDo.trim().length < 3) return A.toast('Nhập lý do thu hồi (ít nhất 3 ký tự)', 'err');
      th.disabled = true; const r = await goi('qtVcThuHoi', { ma: th.dataset.thuHoi, lyDo: lyDo.trim() });
      A.toast(r.ok ? 'Đã thu hồi voucher' : (r.msg || 'Chưa thu hồi được'), r.ok ? 'ok' : 'err'); if (r.ok) taiLai(); else th.disabled = false;
    }
  });

  A.dangKy({ route: R, ten: 'Điểm danh & Voucher', icon: '📅', nhom: 'khach-hang', quyen: 'loyalty.view', mo: 'Điểm danh hằng ngày, voucher ngày đôi & chuỗi ngày – thống kê, cấu hình phần thưởng, lịch sử', ve });
})();
