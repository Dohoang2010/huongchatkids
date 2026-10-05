/* ===== TỔNG QUAN – số liệu kinh doanh đọc từ Google Sheet qua Apps Script ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt, gon, ngayISO } = A;

  const MOC = [
    { k: 'today', t: 'Hôm nay' }, { k: '7', t: '7 ngày' }, { k: '30', t: '30 ngày' },
    { k: '90', t: '3 tháng' }, { k: '180', t: '6 tháng' }, { k: '365', t: '1 năm' },
  ];
  let moc = '30', tu = '', den = '', duLieu = null;

  function datKhoang(k) {
    const h = new Date(); den = ngayISO(h);
    if (k === 'today') tu = den;
    else if (k === 'month') tu = ngayISO(new Date(h.getFullYear(), h.getMonth(), 1));
    else tu = ngayISO(new Date(h.getTime() - (Number(k) - 1) * 864e5));
    moc = k;
  }

  async function ve(el) {
    if (!tu) datKhoang('30');
    el.innerHTML = `<div class="loc" id="dashLoc">
        ${MOC.map((m) => `<button class="chip ${m.k === moc ? 'is-on' : ''}" data-moc="${m.k}">${m.t}</button>`).join('')}
        <span class="loc__tuy">Từ <input type="date" id="dTu" value="${tu}"> đến <input type="date" id="dDen" value="${den}">
        <button class="btn btn--dark btn--sm" data-loc-tuy>Xem</button></span>
      </div><div id="dashBody">${A.dangTai('số liệu')}</div>`;
    await tai();
  }

  async function tai() {
    const box = $('#dashBody'); if (!box) return;
    box.innerHTML = A.dangTai('số liệu');
    try {
      const d = await A.api('thongKe', { key: A.adminKey(), tu, den });
      if (!d || !d.ok) { box.innerHTML = loiKhoa(d && d.msg); return; }
      if (!d.theoNgay) { box.innerHTML = chuaDeploy(); return; }
      duLieu = d; veSo(box, d); taiTruyCap();
    } catch (e) { box.innerHTML = A.loiTai(e.message); }
  }

  const chuaDeploy = () => `<div class="card err-box"><h3>⏳ Apps Script chưa có phần số liệu</h3>
    <p>Máy chủ đang chạy nhưng chưa nhận lệnh <code>thongKe</code>. Mở <code>tools/apps-script-CUA-SHOP.gs</code>,
    dán đè vào Apps Script rồi <b>Deploy → Manage deployments → ✏️ → New version → Deploy</b>.</p>
    <button class="btn btn--primary" data-act="tai-lai">Thử lại</button></div>`;

  const loiKhoa = (msg) => `<div class="card err-box"><h3>🔑 Cần khoá quản trị</h3>
    <p>${esc(msg || 'Sai khoá quản trị')}. Khoá nằm ở dòng <code>var ADMIN_KEY</code> trong Apps Script.</p>
    <div class="row row-2" style="margin-top:10px"><label>Khoá quản trị<input id="inKey" value="${esc(A.adminKey())}"></label>
    <div style="align-self:end"><button class="btn btn--primary" id="btnKey">Lưu khoá & thử lại</button></div></div></div>`;

  /* Điền đủ mọi ngày trong khoảng (ngày không có đơn = 0) để đường biểu đồ lên xuống đúng thực tế.
     Khoảng dài thì gộp: tới 62 ngày theo ngày, tới 200 ngày theo tuần, dài hơn theo tháng. */
  const soNgayKhoang = (a, b) => Math.max(1, Math.round((Date.parse(b + 'T12:00') - Date.parse(a + 'T12:00')) / 864e5) + 1);
  function dayDu(list, a, b) {
    const map = {}; (list || []).forEach((x) => { map[x.ngay] = x; });
    const n = soNgayKhoang(a, b), ngay = [];
    for (let i = 0; i < n; i++) { const d = ngayISO(new Date(Date.parse(a + 'T12:00') + i * 864e5)); const x = map[d]; ngay.push({ ngay: d, tien: x ? x.tien : 0, don: x ? x.don : 0 }); }
    const kieu = n <= 62 ? 'ngay' : n <= 200 ? 'tuan' : 'thang';
    if (kieu === 'ngay') return { kieu, ds: ngay };
    const nhom = [];
    ngay.forEach((x, i) => {
      const k = kieu === 'tuan' ? Math.floor(i / 7) : x.ngay.slice(0, 7);
      let g = nhom[nhom.length - 1];
      if (!g || g.k !== k) { g = { k, ngay: x.ngay, den: x.ngay, tien: 0, don: 0 }; nhom.push(g); }
      g.den = x.ngay; g.tien += x.tien; g.don += x.don;
    });
    return { kieu, ds: nhom };
  }
  const nhanMoc = (x, kieu) => (kieu === 'thang' ? `${x.ngay.slice(5, 7)}/${x.ngay.slice(0, 4)}` : `${x.ngay.slice(8)}/${x.ngay.slice(5, 7)}`);
  const tenMoc = (x, kieu) => (kieu === 'thang' ? `Tháng ${x.ngay.slice(5, 7)}/${x.ngay.slice(0, 4)}`
    : kieu === 'tuan' ? `Tuần ${x.ngay.slice(8)}/${x.ngay.slice(5, 7)} – ${x.den.slice(8)}/${x.den.slice(5, 7)}` : `${x.ngay.slice(8)}/${x.ngay.slice(5, 7)}/${x.ngay.slice(0, 4)}`);

  function veSo(box, d) {
    const soNgay = soNgayKhoang(d.tu || tu, d.den || den);
    const bd = dayDu(d.theoNgay, d.tu || tu, d.den || den);
    const sapHet = (A.D.PRODUCTS || []).filter((p) => !p.an && (p.stock ?? 0) <= 5);
    box.innerHTML = `
      <div class="kpis">
        ${A.the('Tổng doanh thu', fmt(d.doanhThu), `trung bình ${gon(Math.round(d.doanhThu / soNgay))}/ngày`, 'kpi--pink')}
        ${A.the('Tổng đơn hàng', d.soDon, d.huy ? `${d.huy} đơn huỷ · ${gon(d.tienHuy)}` : 'không có đơn huỷ')}
        ${A.the('Giá trị TB/đơn', fmt(d.giaTriTB), `trên ${d.soDon} đơn`, 'kpi--teal')}
        ${A.the('Khách mua hàng', d.soKhach, `${d.khachMoi} khách mới`)}
        ${A.the('Đơn có quà tặng', d.quaDaTang, `${d.soDon ? Math.round(d.quaDaTang / d.soDon * 100) : 0}% số đơn`, 'kpi--amber')}
        ${A.the('Yêu cầu gọi lại', d.goiLai, 'khách để lại số')}
        ${A.the('Tổng sản phẩm', (A.D.PRODUCTS || []).filter((p) => !p.an).length, `${(A.D.PRODUCTS || []).filter((p) => p.an).length} đang ẩn`)}
        ${A.the('Sản phẩm sắp hết', sapHet.length, sapHet.length ? 'cần nhập thêm' : 'kho đang ổn', sapHet.length ? 'kpi--red' : '')}
      </div>

      <div class="dash-row dash-row--21">
        <div class="card"><div class="dash-h"><h3>Doanh thu theo ${bd.kieu === 'thang' ? 'tháng' : bd.kieu === 'tuan' ? 'tuần' : 'ngày'}</h3><span class="muted">${esc(d.tu)} → ${esc(d.den)}</span></div>
          <div id="dtChart"></div></div>
        <div class="card"><h3>Giờ khách đặt hàng</h3><p class="muted">Chọn giờ chạy quảng cáo và trực Zalo cho đúng.</p>
          <div class="hours">${d.theoGio.map((v) => `<i style="height:${Math.max(2, v / Math.max(1, Math.max(...d.theoGio)) * 100)}%" title="${v} đơn"></i>`).join('')}</div>
          <div class="hours-x">${d.theoGio.map((_, i) => `<div>${i % 2 === 0 ? i : ''}</div>`).join('')}</div>
          <p class="muted mt-8">${gioCao(d.theoGio)}</p></div>
      </div>

      <div class="card tc" id="tcCard"><h3>Khách truy cập website</h3>${A.dangTai('số liệu truy cập')}</div>

      <div class="dash-row ${sapHet.length ? 'dash-row--11' : ''}">
        <div class="card"><h3>Sản phẩm bán chạy</h3><p class="muted">Theo số lượng bán trong kỳ</p>
          <div class="tbl-wrap" style="max-height:300px"><table><thead><tr><th>#</th><th>Sản phẩm</th><th class="num">SL</th></tr></thead>
          <tbody>${d.topSP.length ? d.topSP.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.ten)}</td><td class="num"><b>${x.sl}</b></td></tr>`).join('')
            : '<tr><td colspan="3" class="muted">Chưa có dữ liệu</td></tr>'}</tbody></table></div></div>
        ${sapHet.length ? `<div class="card"><h3>⚠️ Sản phẩm sắp hết / đã hết</h3><p class="muted">Tồn kho từ 5 trở xuống</p>
          <div class="tbl-wrap" style="max-height:300px"><table><thead><tr><th>Sản phẩm</th><th class="num">Tồn</th><th></th></tr></thead><tbody>
          ${sapHet.map((p) => `<tr><td>${esc(p.short || p.name)}</td><td class="num">${A.badge(String(p.stock ?? 0), (p.stock ?? 0) <= 0 ? 'tag--no' : 'tag--wait')}</td>
            <td class="num"><a class="btn btn--ghost btn--sm" href="#/san-pham/${(A.D.PRODUCTS || []).indexOf(p)}">Sửa</a></td></tr>`).join('')}
          </tbody></table></div></div>` : ''}
      </div>`;
    veBieuDoDT();
  }
  /* Vẽ biểu đồ theo đúng bề rộng khung (1 đơn vị = 1px) để chữ không bị phóng to trên màn hình rộng */
  let dtBd = null;
  function veBieuDoDT() {
    const w = $('#dtChart'); if (!w || !duLieu) return;
    dtBd = dtBd && dtBd.d === duLieu ? dtBd : { d: duLieu, ...dayDu(duLieu.theoNgay, duLieu.tu || tu, duLieu.den || den) };
    w.innerHTML = cot(dtBd.ds, dtBd.kieu, w.clientWidth);
  }
  let hoanVe = 0;
  window.addEventListener('resize', () => { clearTimeout(hoanVe); hoanVe = setTimeout(() => { veBieuDoDT(); veTruyCap(); }, 200); });

  /* Biểu đồ đường doanh thu theo ngày – dễ nhìn xu hướng lên xuống hơn biểu đồ cột */
  function cot(list, kieu = 'ngay', rong) {
    if (!list.some((x) => x.tien > 0)) return '<p class="muted">Chưa có đơn nào trong kỳ này.</p>';
    if (!list.length) return '<p class="muted">Chưa có đơn nào trong kỳ này.</p>';
    const W = Math.max(320, Math.round(rong || 900)), H = 240, pad = { t: 22, r: 18, b: 28, l: 56 };
    const max = Math.max(...list.map((x) => x.tien), 1);
    const n = list.length;
    const X = (i) => pad.l + (n === 1 ? (W - pad.l - pad.r) / 2 : i * (W - pad.l - pad.r) / (n - 1));
    const Y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);

    const luoi = [0, .25, .5, .75, 1].map((f) => {
      const y = Y(max * f);
      return `<line class="grid-l" x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}"/>` +
             `<text x="${pad.l - 8}" y="${y + 3}" text-anchor="end">${gon(max * f)}</text>`;
    }).join('');

    const diem = list.map((x, i) => [X(i), Y(x.tien)]);
    const duong = diem.map((p2, i) => (i ? 'L' : 'M') + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1)).join(' ');
    const nen = `${duong} L ${diem[n - 1][0].toFixed(1)} ${H - pad.b} L ${diem[0][0].toFixed(1)} ${H - pad.b} Z`;

    const buoc = Math.max(1, Math.ceil(n / Math.max(2, Math.floor((W - 80) / 56))));
    const nhanX = list.map((x, i) => ((i % buoc === 0 && n - 1 - i >= buoc * 0.6) || i === n - 1)
      ? `<text x="${X(i)}" y="${H - 9}" text-anchor="middle">${nhanMoc(x, kieu)}</text>` : '').join('');

    const cham = list.map((x, i) => `<g class="pt"><circle cx="${X(i)}" cy="${Y(x.tien)}" r="${n > 45 ? 2.5 : 4}"/>
      <circle class="pt__hit" cx="${X(i)}" cy="${Y(x.tien)}" r="14"><title>${tenMoc(x, kieu)}: ${fmt(x.tien)} · ${x.don} đơn</title></circle></g>`).join('');

    const cao = list.reduce((a, b) => (b.tien > a.tien ? b : a), list[0]);
    const iCao = list.indexOf(cao);

    const xCao = Math.min(W - pad.r - 22, Math.max(pad.l + 22, X(iCao)));
    return `<svg class="chart chart--line" viewBox="0 0 ${W} ${H}" role="img"
        aria-label="Biểu đồ đường doanh thu, cao nhất ${fmt(cao.tien)} – ${tenMoc(cao, kieu)}">
      <defs><linearGradient id="gdt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--pink)" stop-opacity=".28"/>
        <stop offset="100%" stop-color="var(--pink)" stop-opacity="0"/></linearGradient></defs>
      ${luoi}
      <path class="area" d="${nen}"/>
      <path class="line" d="${duong}"/>
      ${cham}
      ${n > 1 ? `<circle class="pt-cao" cx="${X(iCao)}" cy="${Y(cao.tien)}" r="5"/>
        <text class="nhan-cao" x="${xCao}" y="${Math.max(14, Y(cao.tien) - 11)}" text-anchor="middle">${gon(cao.tien)}</text>` : ''}
      ${nhanX}
    </svg>
    <p class="muted mt-8">${kieu === 'thang' ? 'Tháng' : kieu === 'tuan' ? 'Tuần' : 'Ngày'} cao nhất: <b>${tenMoc(cao, kieu)}</b> · ${fmt(cao.tien)} · ${cao.don} đơn</p>`;
  }

  /* ================= KHÁCH TRUY CẬP WEBSITE (giữa "Giờ khách đặt hàng" và "Sản phẩm bán chạy") =================
     Dữ liệu: Apps Script action "truyCap" (sheet "Truy cập" + danh sách online trong bộ nhớ đệm).
     Số khách online tự làm mới 15 giây/lần khi đang ở trang Tổng quan. */
  let tcKieu = 'hom-nay', tcDL = null, tcHen = 0;
  const TC_TRANG = [['trang-chu', 'Trang chủ'], ['san-pham', 'Sản phẩm'], ['gio-hang', 'Giỏ hàng'], ['thanh-toan', 'Checkout'], ['danh-muc', 'Danh mục'], ['khac', 'Trang khác']];
  const tcGio = (s) => { s = Math.round(Number(s) || 0); const m = Math.floor(s / 60), g = s % 60; return m ? `${String(m).padStart(2, '0')} phút ${String(g).padStart(2, '0')} giây` : `${g} giây`; };
  const soVN = (n) => Number(n || 0).toLocaleString('vi-VN');
  async function taiTruyCap(chiOnline) {
    clearTimeout(tcHen);
    if (!$('#tcCard')) return;
    try {
      const d = await A.api('truyCap', { kieu: tcKieu, chiOnline: chiOnline ? '1' : '' });
      if (!$('#tcCard')) return;
      if (!d || !d.ok) { if (!chiOnline) $('#tcCard').innerHTML = `<h3>Khách truy cập website</h3><p class="muted">${esc((d && d.msg) || 'Chưa đọc được số liệu')}</p>`; return; }
      if (chiOnline && tcDL) tcDL.online = d.online; else tcDL = d;
      veTruyCap();
    } catch (e) {
      if (!chiOnline && $('#tcCard')) $('#tcCard').innerHTML = `<h3>Khách truy cập website</h3><p class="muted">Apps Script chưa có phần thống kê truy cập – dán bản mới nhất rồi Deploy lại. <button class="btn btn--ghost btn--sm" data-tc-tai>Thử lại</button></p>`;
    }
    if (/^#\/tong-quan|^$|^#\/?$/.test(location.hash) && $('#tcCard')) tcHen = setTimeout(() => taiTruyCap(true), 15000);
  }
  function veTruyCap() {
    const el = $('#tcCard'); if (!el || !tcDL) return;
    const moChiTiet = !!el.querySelector('details[open]');
    const on = tcDL.online || { online: 0, khongHoatDong: 0, theoTrang: {}, ds: [] }, tk = tcDL.thongKe || { homNay: {}, ky: {}, bieuDo: [], hanhVi: {}, phienGanDay: [] };
    const hn = tk.homNay || {}, ky = tk.ky || {}, hv = tk.hanhVi || {};
    const maxTrang = Math.max(1, ...TC_TRANG.map(([k]) => on.theoTrang[k] || 0));
    el.innerHTML = `
      <div class="tc__h"><h3>Khách truy cập website</h3><span class="tc__live"><i></i>cập nhật 15 giây/lần</span></div>
      <div class="tc__body">
        <div class="tc__trai">
          <div class="tc__kpis">
            <div class="tc__k tc__k--on"><span>🟢 Khách đang online</span><b>${soVN(on.online)}</b><small><i class="tc__dot"></i>Đang hoạt động${on.khongHoatDong ? ` · ${on.khongHoatDong} không hoạt động` : ''}</small></div>
            <div class="tc__k"><span>👁 Lượt truy cập hôm nay</span><b>${soVN(hn.luot)}</b><small>${soVN(hn.phien)} phiên · ${soVN(hn.khach)} khách</small></div>
            <div class="tc__k"><span>⏱ Thời gian TB / phiên</span><b>${tcGio(hn.giayTB)}</b><small>chỉ tính lúc khách thật sự xem</small></div>
            <div class="tc__k"><span>📄 Số trang TB / phiên</span><b>${String(hn.trangTB || 0).replace('.', ',')} trang</b><small>hôm nay</small></div>
          </div>
          <div class="tc__on"><b>🟢 ${soVN(on.online)} khách đang online</b>
            ${TC_TRANG.filter(([k]) => k !== 'danh-muc' && k !== 'khac' || on.theoTrang[k]).map(([k, t]) => `<div class="tc__row"><span>${t}</span><i style="--w:${Math.round((on.theoTrang[k] || 0) / maxTrang * 100)}%"></i><b>${on.theoTrang[k] || 0} khách</b></div>`).join('')}
          </div>
        </div>
        <div class="tc__phai">
          <div class="tc__chart-h"><b>Lượt truy cập</b><div class="tc__tabs">${[['hom-nay', 'Hôm nay'], ['7', '7 ngày'], ['30', '30 ngày']].map(([k, t]) => `<button class="chip ${tcKieu === k ? 'is-on' : ''}" data-tc-kieu="${k}">${t}</button>`).join('')}</div></div>
          <div id="tcChart"></div>
          <div class="tc__ky">${[[soVN(ky.luot), 'lượt xem'], [soVN(ky.phien), 'phiên'], [soVN(ky.khach), 'khách'], [tcGio(ky.giayTB), 'TB / phiên'], [(ky.thoat || 0) + '%', 'thoát']].map(([v, t]) => `<span><b>${v}</b>${t}</span>`).join('')}</div>
          <div class="tc__hv">${[['🔍', hv.tim, 'tìm kiếm'], ['🛒', hv.gio, 'thêm giỏ'], ['💳', hv.thanhtoan, 'checkout'], ['✅', hv.mua, 'mua hàng']].map(([i, v, t]) => `<span>${i} <b>${soVN(v)}</b> ${t}</span>`).join('')}</div>
        </div>
      </div>
      <details class="tc__more"><summary>Xem chi tiết khách đang online & phiên gần đây</summary>
        ${on.ds.length ? `<div class="tbl-wrap"><table><thead><tr><th>Khách</th><th>Đang xem</th><th>Vào lúc</th><th class="num">Đã xem</th><th class="num">Số trang</th><th>Trạng thái</th></tr></thead><tbody>
          ${on.ds.map((x) => `<tr><td>#${esc(x.khach)}</td><td>${esc(x.loai)}<small class="muted"> ${esc(x.trang)}</small></td><td>${esc(x.vao)}</td><td class="num">${tcGio(x.giay)}</td><td class="num">${x.soTrang}</td><td>${A.badge(x.trangThai, x.trangThai === 'Online' ? 'tag--ok' : 'tag--wait')}</td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">Hiện không có khách online.</p>'}
        <h4>Phiên gần đây</h4>
        ${(tk.phienGanDay || []).length ? `<div class="tbl-wrap"><table><thead><tr><th>Khách</th><th>Vào</th><th>Rời</th><th class="num">Thời gian xem</th><th class="num">Số trang</th><th>Trang vào → trang cuối</th></tr></thead><tbody>
          ${tk.phienGanDay.map((x) => `<tr><td>#${esc(x.khach)}${x.mua ? ' ✅' : ''}</td><td>${esc(x.vao)}</td><td>${esc(x.roi)}</td><td class="num">${tcGio(x.giay)}</td><td class="num">${x.soTrang}</td><td><small>${esc(x.trangVao)} → ${esc(x.trangCuoi)}</small></td></tr>`).join('')}
        </tbody></table></div>` : '<p class="muted">Chưa có phiên nào trong kỳ.</p>'}
      </details>`;
    const cw = $('#tcChart'); if (cw) cw.innerHTML = bieuDoTC(tk.bieuDo || [], cw.clientWidth);
    if (moChiTiet) { const dt = el.querySelector('details'); if (dt) dt.open = true; }
  }
  function bieuDoTC(moc, rong) {
    if (!moc.length || !moc.some((x) => x.luot)) return '<p class="muted tc__trong">Chưa có lượt truy cập trong kỳ này.</p>';
    const W = Math.max(300, Math.round(rong || 520)), H = 190, pad = { t: 14, r: 12, b: 24, l: 34 }, n = moc.length;
    const max = Math.max(...moc.map((x) => x.luot), 1);
    const X = (i) => pad.l + (n === 1 ? (W - pad.l - pad.r) / 2 : i * (W - pad.l - pad.r) / (n - 1));
    const Y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
    const diem = moc.map((x, i) => [X(i), Y(x.luot)]);
    const duong = diem.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const nen = `${duong} L ${diem[n - 1][0].toFixed(1)} ${H - pad.b} L ${diem[0][0].toFixed(1)} ${H - pad.b} Z`;
    const buoc = Math.max(1, Math.ceil(n / Math.max(2, Math.floor((W - 50) / 46))));
    return `<svg class="chart chart--line tc__chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ lượt truy cập">
      <defs><linearGradient id="gtc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--teal)" stop-opacity=".25"/><stop offset="100%" stop-color="var(--teal)" stop-opacity="0"/></linearGradient></defs>
      ${[0, .5, 1].map((f) => `<line class="grid-l" x1="${pad.l}" y1="${Y(max * f)}" x2="${W - pad.r}" y2="${Y(max * f)}"/><text x="${pad.l - 6}" y="${Y(max * f) + 3}" text-anchor="end">${Math.round(max * f)}</text>`).join('')}
      <path class="area" d="${nen}" style="fill:url(#gtc)"/><path class="line" d="${duong}" style="stroke:var(--teal)"/>
      ${moc.map((x, i) => `<g class="pt"><circle cx="${X(i)}" cy="${Y(x.luot)}" r="${n > 24 ? 2 : 3}" style="stroke:var(--teal)"/><circle class="pt__hit" cx="${X(i)}" cy="${Y(x.luot)}" r="10"><title>${x.nhan}: ${x.luot} lượt xem · ${x.phien} phiên</title></circle></g>`).join('')}
      ${moc.map((x, i) => ((i % buoc === 0 && n - 1 - i >= buoc * 0.6) || i === n - 1) ? `<text x="${X(i)}" y="${H - 7}" text-anchor="middle">${x.nhan}</text>` : '').join('')}
    </svg>`;
  }
  document.addEventListener('click', (e) => {
    const k = e.target.closest('[data-tc-kieu]'); if (k) { tcKieu = k.dataset.tcKieu; taiTruyCap(); return; }
    if (e.target.closest('[data-tc-tai]')) taiTruyCap();
  });

  function gioCao(g) {
    const max = Math.max(...g); if (!max) return 'Chưa có dữ liệu giờ đặt hàng.';
    const top = g.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v).slice(0, 3).filter((x) => x.v > 0);
    return 'Giờ khách đặt nhiều nhất: ' + top.map((x) => `<b>${x.i}:00–${x.i + 1}:00</b> (${x.v} đơn)`).join(', ') + '.';
  }

  document.addEventListener('click', (e) => {
    const m = e.target.closest('[data-moc]');
    if (m) { datKhoang(m.dataset.moc); $$('#dashLoc .chip').forEach((c) => c.classList.toggle('is-on', c === m)); $('#dTu').value = tu; $('#dDen').value = den; tai(); return; }
    if (e.target.closest('[data-loc-tuy]')) { tu = $('#dTu').value; den = $('#dDen').value; moc = ''; $$('#dashLoc .chip').forEach((c) => c.classList.remove('is-on')); tai(); return; }
    if (e.target.id === 'btnKey') { localStorage.setItem('hck_admin_key', $('#inKey').value.trim()); A.toast('Đã lưu khoá', 'ok'); tai(); return; }
  });

  A.dangKy({ route: '/tong-quan', ten: 'Tổng quan', icon: '🏠', nhom: '', quyen: 'dashboard.view',
    mo: 'Doanh thu, đơn hàng, khách hàng và tình trạng kho', ve });
})();
