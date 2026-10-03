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
      duLieu = d; veSo(box, d);
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

  function veSo(box, d) {
    const soNgay = d.theoNgay.length || 1;
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

      <div class="card"><h3>Doanh thu theo ngày</h3><p class="muted">${esc(d.tu)} → ${esc(d.den)}</p>${cot(d.theoNgay)}</div>

      <div class="grid-2">
        <div class="card"><h3>Giờ khách đặt hàng</h3><p class="muted">Chọn giờ chạy quảng cáo và trực Zalo cho đúng.</p>
          <div class="hours">${d.theoGio.map((v) => `<i style="height:${Math.max(2, v / Math.max(1, Math.max(...d.theoGio)) * 100)}%" title="${v} đơn"></i>`).join('')}</div>
          <div class="hours-x">${d.theoGio.map((_, i) => `<div>${i % 2 === 0 ? i : ''}</div>`).join('')}</div>
          <p class="muted mt-8">${gioCao(d.theoGio)}</p></div>

        <div class="card"><h3>Sản phẩm bán chạy</h3><p class="muted">Theo số lượng bán trong kỳ</p>
          <div class="tbl-wrap" style="max-height:300px"><table><thead><tr><th>#</th><th>Sản phẩm</th><th class="num">SL</th></tr></thead>
          <tbody>${d.topSP.length ? d.topSP.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.ten)}</td><td class="num"><b>${x.sl}</b></td></tr>`).join('')
            : '<tr><td colspan="3" class="muted">Chưa có dữ liệu</td></tr>'}</tbody></table></div></div>
      </div>

      ${sapHet.length ? `<div class="card"><h3>⚠️ Sản phẩm sắp hết / đã hết</h3>
        <div class="tbl-wrap" style="max-height:260px"><table><thead><tr><th>Sản phẩm</th><th class="num">Tồn</th><th></th></tr></thead><tbody>
        ${sapHet.map((p) => `<tr><td>${esc(p.short || p.name)}</td><td class="num">${A.badge(String(p.stock ?? 0), (p.stock ?? 0) <= 0 ? 'tag--no' : 'tag--wait')}</td>
          <td class="num"><a class="btn btn--ghost btn--sm" href="#/san-pham/${(A.D.PRODUCTS || []).indexOf(p)}">Sửa</a></td></tr>`).join('')}
        </tbody></table></div></div>` : ''}

      <div class="card"><h3>Đơn hàng gần nhất</h3>
        <div class="tbl-wrap"><table><thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Khách</th><th>Điện thoại</th><th class="num">Tổng</th><th>Thanh toán</th><th>Trạng thái</th></tr></thead>
        <tbody>${d.donMoi.length ? d.donMoi.map((o) => `<tr><td><b>${esc(o.ma)}</b></td><td>${esc(o.ngay)}</td><td>${esc(o.khach)}</td><td>${esc(o.sdt)}</td>
          <td class="num">${fmt(o.tong)}</td><td>${esc(o.thanhToan)}</td>
          <td>${A.badge(o.trangThai || 'Đã tiếp nhận', /huỷ|hoàn/i.test(o.trangThai) ? 'tag--no' : o.trangThai ? 'tag--ok' : 'tag--wait')}</td></tr>`).join('')
          : '<tr><td colspan="7" class="muted">Chưa có đơn nào trong kỳ này</td></tr>'}</tbody></table></div>
        <p class="muted mt-8">Quản lý đơn đầy đủ nằm ở mục <a href="#/don-hang">Đơn hàng</a>.</p></div>`;
  }

  function cot(list) {
    if (!list.length) return '<p class="muted">Chưa có đơn nào trong kỳ này.</p>';
    const W = 900, H = 220, pad = { t: 14, r: 8, b: 26, l: 54 };
    const max = Math.max(...list.map((x) => x.tien), 1);
    const bw = (W - pad.l - pad.r) / list.length;
    const luoi = [0, .25, .5, .75, 1].map((f) => {
      const y = pad.t + (H - pad.t - pad.b) * (1 - f);
      return `<line class="grid-l" x1="${pad.l}" y1="${y}" x2="${W - pad.r}" y2="${y}"/><text x="${pad.l - 6}" y="${y + 3}" text-anchor="end">${gon(max * f)}</text>`;
    }).join('');
    const cols = list.map((x, i) => {
      const h = (H - pad.t - pad.b) * (x.tien / max);
      const X = pad.l + i * bw, Y = H - pad.b - h;
      const nhan = list.length <= 31 && (list.length <= 10 || i % Math.ceil(list.length / 10) === 0)
        ? `<text x="${X + bw / 2}" y="${H - 9}" text-anchor="middle">${x.ngay.slice(8)}/${x.ngay.slice(5, 7)}</text>` : '';
      return `<rect class="bar-r" x="${X + bw * .15}" y="${Y}" width="${bw * .7}" height="${Math.max(1, h)}" rx="3"><title>${x.ngay}: ${fmt(x.tien)} · ${x.don} đơn</title></rect>${nhan}`;
    }).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${luoi}${cols}</svg>`;
  }
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
