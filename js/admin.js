/* =====================================================================
   TRANG QUẢN TRỊ – Hương Chất Kids
   - Số liệu kinh doanh đọc từ Google Sheet qua Apps Script (SITE.orderEndpoint).
   - Sửa sản phẩm / marketing / trang trí: ghi thẳng vào js/data.js trên GitHub,
     nhờ mã GitHub (fine-grained token) mà chủ shop dán 1 lần, chỉ lưu trên máy này.
   - Bản nháp để ở sessionStorage, khung "Xem trước" mở web thật với ?preview=1.
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => (Math.round(n) || 0).toLocaleString('vi-VN') + '₫';
  const gon = (n) => { n = Number(n) || 0; return n >= 1e9 ? (n / 1e9).toFixed(1) + ' tỷ' : n >= 1e6 ? (n / 1e6).toFixed(1) + ' tr' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(n); };
  const ngayISO = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };

  /* Có lỗi lạ thì hiện ra cho thấy, đừng để trang đứng im không biết vì sao */
  window.addEventListener('error', (e) => {
    const el = document.getElementById('bar'); if (!el) return;
    el.className = 'bar err'; el.classList.remove('hide');
    el.textContent = '❌ Lỗi: ' + (e.message || '') + (e.lineno ? ' (dòng ' + e.lineno + ')' : '');
  });

  const REPO = 'Dohoang2010/huongchatkids';
  /* Nhãn gắn được cho sản phẩm – tích là web hiện ngay nhãn đó trên thẻ sản phẩm */
  const NHAN = [
    { ten: 'Sản phẩm hot', mo: '🔥 nhãn đỏ + vào hàng Flash sale ở trang chủ' },
    { ten: 'Bán chạy',     mo: 'nhãn xanh trên ảnh sản phẩm' },
    { ten: 'Mới',          mo: 'nhãn "Mới" cho hàng vừa về' },
    { ten: 'Cho mẹ',       mo: 'đánh dấu sản phẩm dành cho mẹ' },
  ];
  const TAI_KHOAN = { id: 'adminhck', mk: '123' };

  /* ---------------- Thông báo ---------------- */
  let tToast = 0;
  function toast(msg, kieu = '') {
    const el = $('#toast'); el.textContent = msg; el.className = 'toast ' + kieu;
    clearTimeout(tToast); tToast = setTimeout(() => el.classList.add('hide'), 3400);
  }
  function bar(html, kieu = 'info') {
    const el = $('#bar'); if (!html) { el.classList.add('hide'); return; }
    el.className = 'bar ' + kieu; el.innerHTML = html;
  }

  /* ---------------- Đăng nhập ---------------- */
  const DA_VAO = 'hck_admin_in';
  function moKhoa() { $('#login').classList.add('hide'); $('#app').classList.remove('hide'); khoiDong(); }
  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#lgId').value.trim() === TAI_KHOAN.id && $('#lgPw').value === TAI_KHOAN.mk) {
      sessionStorage.setItem(DA_VAO, '1'); moKhoa();
    } else { $('#lgErr').textContent = 'Tên đăng nhập hoặc mật khẩu chưa đúng'; $('#lgErr').classList.remove('hide'); }
  });
  $('#btnOut').addEventListener('click', () => { sessionStorage.removeItem(DA_VAO); location.reload(); });

  /* ---------------- Bản nháp ----------------
     Giữ nguyên bản gốc để biết đã sửa gì; D là bản đang sửa. */
  const sao = (v) => JSON.parse(JSON.stringify(v));
  let GOC = {}, D = {}, daSua = false;
  function napNhap() {
    GOC = { PRODUCTS: sao(window.PRODUCTS), BANNERS: sao(window.BANNERS), QUA_TANG: sao(window.QUA_TANG), TIERS: sao(window.TIERS), COUPONS: sao(window.COUPONS) };
    const nhap = sessionStorage.getItem('hck_admin_nhap');
    D = nhap ? JSON.parse(nhap) : sao(GOC);
    daSua = !!nhap;
    capNhatNutLuu();
  }
  function danhDauSua() {
    daSua = true;
    sessionStorage.setItem('hck_admin_nhap', JSON.stringify(D));
    sessionStorage.setItem('hck_preview', JSON.stringify(D));
    capNhatNutLuu();
  }
  function capNhatNutLuu() {
    $('#btnLuu').disabled = !daSua;
    $('#btnLuu').textContent = daSua ? '💾 Lưu lên web (có thay đổi)' : '💾 Lưu lên web';
    if (daSua) bar('✏️ Đang có thay đổi <b>chưa lưu</b>. Bấm <b>Xem thử</b> để xem trước, bấm <b>Lưu lên web</b> để khách nhìn thấy. <button class="btn btn--ghost btn--sm" id="btnBo">Bỏ thay đổi</button>', 'info');
    else bar('');
  }
  document.addEventListener('click', (e) => {
    if (e.target.id === 'btnBo') {
      if (!confirm('Bỏ hết thay đổi chưa lưu?')) return;
      sessionStorage.removeItem('hck_admin_nhap'); sessionStorage.removeItem('hck_preview');
      D = sao(GOC); daSua = false; capNhatNutLuu(); veLai(); toast('Đã bỏ thay đổi');
    }
  });

  /* ---------------- Mã GitHub ---------------- */
  const ghToken = () => localStorage.getItem('hck_gh_token') || '';
  function kiemTraGh() {
    const dot = $('#ghDot'); const t = ghToken();
    if (!t) { dot.className = 'dot no'; dot.title = 'Chưa có mã GitHub – không lưu được'; return; }
    fetch(`https://api.github.com/repos/${REPO}`, { headers: { Authorization: 'Bearer ' + t } })
      .then((r) => { dot.className = 'dot ' + (r.ok ? 'ok' : 'no'); dot.title = r.ok ? 'Đã kết nối GitHub' : 'Mã GitHub không dùng được'; })
      .catch(() => { dot.className = 'dot no'; dot.title = 'Không kết nối được GitHub'; });
  }

  /* ---------------- Gọi Apps Script (JSONP) ---------------- */
  let seq = 0;
  function api(action, params = {}, timeout = 25000) {
    const url = (SITE.loyalty && SITE.loyalty.endpoint) || SITE.orderEndpoint || '';
    if (!url) return Promise.reject(new Error('Chưa cấu hình link Apps Script trong js/data.js'));
    return new Promise((ok, loi) => {
      const cb = 'adCb' + (++seq) + Math.random().toString(36).slice(2, 7);
      const sc = document.createElement('script'); let tid = 0;
      const xong = (fn, v) => { clearTimeout(tid); try { delete window[cb]; } catch { window[cb] = undefined; } sc.remove(); fn(v); };
      tid = setTimeout(() => xong(loi, new Error('Máy chủ không phản hồi. Kiểm tra lại Apps Script đã Deploy chưa.')), timeout);
      window[cb] = (d) => xong(ok, d || {});
      sc.onerror = () => xong(loi, new Error('Không kết nối được Apps Script'));
      sc.src = url + (url.includes('?') ? '&' : '?') + new URLSearchParams({ ...params, action, callback: cb });
      document.head.appendChild(sc);
    });
  }

  /* =====================================================================
     TAB 1 – TỔNG QUAN
     ===================================================================== */
  const adminKey = () => localStorage.getItem('hck_admin_key') || 'hck-admin-2026';
  let kyTu = '', kyDen = '';

  function datKhoang(loai) {
    const h = new Date(); const den = ngayISO(h); let tu = den;
    if (loai === '7') tu = ngayISO(new Date(h.getTime() - 6 * 864e5));
    else if (loai === '30') tu = ngayISO(new Date(h.getTime() - 29 * 864e5));
    else if (loai === '90') tu = ngayISO(new Date(h.getTime() - 89 * 864e5));
    else if (loai === 'month') tu = ngayISO(new Date(h.getFullYear(), h.getMonth(), 1));
    kyTu = tu; kyDen = den; $('#dTu').value = tu; $('#dDen').value = den;
  }

  function taiThongKe() {
    $('#dashBody').innerHTML = '<div class="loading">Đang tải số liệu từ Google Sheet…</div>';
    api('thongKe', { key: adminKey(), tu: kyTu, den: kyDen })
      .then((d) => {
        if (!d || !d.ok) { $('#dashBody').innerHTML = loiKhoa(d && d.msg); return; }
        if (!d.theoNgay) {   // Apps Script bản cũ chưa có phần thống kê
          $('#dashBody').innerHTML = `<div class="card"><h3>⏳ Apps Script chưa có phần số liệu</h3>
            <p class="muted">Máy chủ đang chạy nhưng chưa nhận lệnh <code>thongKe</code>. Mở file
            <code>tools/apps-script-CUA-SHOP.gs</code> trên máy, dán đè vào Apps Script rồi
            <b>Deploy → Manage deployments → ✏️ → New version → Deploy</b>, sau đó bấm nút dưới đây.</p>
            <button class="btn btn--primary" id="btnThuLai" style="margin-top:10px">Thử lại</button></div>`;
          return;
        }
        veDashboard(d);
      })
      .catch((e) => { $('#dashBody').innerHTML = `<div class="card"><h3>Chưa tải được số liệu</h3><p class="muted">${esc(e.message)}</p>
        <p class="muted">Kiểm tra: Apps Script đã dán bản mới nhất và Deploy → Manage deployments → ✏️ → New version chưa?</p></div>`; });
  }
  const loiKhoa = (msg) => `<div class="card"><h3>🔑 Cần khoá quản trị</h3>
      <p class="muted">${esc(msg || 'Sai khoá quản trị')}. Khoá nằm ở dòng <code>var ADMIN_KEY</code> trong Apps Script.</p>
      <div class="row row-2" style="margin-top:10px"><label>Khoá quản trị<input id="inKey" value="${esc(adminKey())}"></label>
      <div style="align-self:end"><button class="btn btn--primary" id="btnKey">Lưu khoá & thử lại</button></div></div></div>`;

  function veDashboard(d) {
    const ngayCount = d.theoNgay.length || 1;
    const tbNgay = Math.round(d.doanhThu / ngayCount);
    $('#dashBody').innerHTML = `
      <div class="kpis">
        <div class="kpi kpi--pink"><span>Doanh thu</span><b>${fmt(d.doanhThu)}</b><small>trung bình ${gon(tbNgay)}/ngày</small></div>
        <div class="kpi"><span>Số đơn</span><b>${d.soDon}</b><small>${d.huy ? d.huy + ' đơn huỷ · ' + gon(d.tienHuy) : 'không có đơn huỷ'}</small></div>
        <div class="kpi kpi--teal"><span>Giá trị TB/đơn</span><b>${fmt(d.giaTriTB)}</b><small>trên ${d.soDon} đơn</small></div>
        <div class="kpi"><span>Khách mua hàng</span><b>${d.soKhach}</b><small>${d.khachMoi} khách mới</small></div>
        <div class="kpi kpi--amber"><span>Đơn có quà tặng</span><b>${d.quaDaTang}</b><small>${d.soDon ? Math.round(d.quaDaTang / d.soDon * 100) : 0}% số đơn</small></div>
        <div class="kpi"><span>Yêu cầu gọi lại</span><b>${d.goiLai}</b><small>khách để lại số</small></div>
      </div>

      <div class="card"><h3>Doanh thu theo ngày</h3><p>${esc(d.tu)} → ${esc(d.den)}</p>${cot(d.theoNgay)}</div>

      <div class="card"><h3>Giờ khách đặt hàng</h3><p>Cộng dồn số đơn theo từng giờ trong ngày – chọn giờ chạy quảng cáo và trực Zalo cho đúng.</p>
        <div class="hours">${d.theoGio.map((v) => `<i style="height:${Math.max(2, v / Math.max(1, Math.max(...d.theoGio)) * 100)}%" title="${v} đơn"></i>`).join('')}</div>
        <div class="hours-x">${d.theoGio.map((_, i) => (i % 2 === 0 ? i : '')).join('</div><div>').replace(/^/, '<div>').replace(/$/, '</div>')}</div>
        <p class="muted" style="margin-top:10px;font-size:13px">${gioCaoDiem(d.theoGio)}</p>
      </div>

      <div class="card"><h3>Sản phẩm bán chạy</h3><p>Theo số lượng bán trong kỳ</p>
        <div class="tbl-wrap"><table><thead><tr><th>#</th><th>Sản phẩm</th><th class="num">Số lượng</th><th class="num">Lượt đơn</th></tr></thead>
        <tbody>${d.topSP.length ? d.topSP.map((x, i) => `<tr><td>${i + 1}</td><td>${esc(x.ten)}</td><td class="num"><b>${x.sl}</b></td><td class="num">${x.don}</td></tr>`).join('') : '<tr><td colspan="4" class="muted">Chưa có dữ liệu trong kỳ này</td></tr>'}</tbody></table></div></div>

      <div class="card"><h3>Đơn gần nhất</h3>
        <div class="tbl-wrap"><table><thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Khách</th><th>Điện thoại</th><th class="num">Tổng</th><th>Thanh toán</th><th>Trạng thái</th></tr></thead>
        <tbody>${d.donMoi.length ? d.donMoi.map((o) => `<tr><td><b>${esc(o.ma)}</b></td><td>${esc(o.ngay)}</td><td>${esc(o.khach)}</td><td>${esc(o.sdt)}</td>
          <td class="num">${fmt(o.tong)}</td><td>${esc(o.thanhToan)}</td><td><span class="tag ${/huỷ|hoàn/i.test(o.trangThai) ? 'tag--no' : o.trangThai ? 'tag--ok' : 'tag--wait'}">${esc(o.trangThai || 'Đã tiếp nhận')}</span></td></tr>`).join('') : '<tr><td colspan="7" class="muted">Chưa có đơn nào trong kỳ này</td></tr>'}</tbody></table></div>
        <p class="muted" style="margin-top:10px;font-size:13px">Sửa cột <b>Trạng thái</b> ngay trong Google Sheet (ghi "Huỷ" là đơn đó không tính vào doanh thu và hạng khách).</p></div>`;
  }

  /* Biểu đồ cột doanh thu theo ngày (SVG, không cần thư viện ngoài) */
  function cot(list) {
    if (!list.length) return '<p class="muted">Chưa có đơn nào trong kỳ này.</p>';
    const W = 900, H = 210, pad = { t: 14, r: 8, b: 26, l: 52 };
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
  function gioCaoDiem(g) {
    const max = Math.max(...g); if (!max) return 'Chưa có dữ liệu giờ đặt hàng.';
    const top = g.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v).slice(0, 3).filter((x) => x.v > 0);
    return 'Giờ khách đặt nhiều nhất: ' + top.map((x) => `<b>${x.i}:00–${x.i + 1}:00</b> (${x.v} đơn)`).join(', ') + '.';
  }

  /* =====================================================================
     TAB 2 – MARKETING
     ===================================================================== */
  function veMarketing() {
    const q = D.QUA_TANG || {};
    $('#mktBody').innerHTML = `
      <div class="card"><h3>⚡ Flash sale trang chủ</h3><p>Hàng sản phẩm chạy ngang dưới banner. Tích sản phẩm muốn cho vào flash sale.</p>
        <label>Đếm ngược kết thúc
          <select id="fsEnd">
            <option value="daily">Mỗi ngày (đếm ngược tới 24:00, hôm sau tự đếm lại)</option>
            <option value="off">Tắt đếm ngược</option>
          </select></label>
        <div class="plist" id="fsList"></div>
      </div>

      <div class="card"><h3>🎟️ Mã giảm giá</h3><p>Khách nhập mã ở bước thanh toán. Mã không cộng dồn với ưu đãi hạng – web tự lấy mức lợi hơn cho khách.</p>
        <div class="tbl-wrap"><table><thead><tr><th>Mã</th><th>Kiểu</th><th class="num">Giá trị</th><th class="num">Giảm tối đa</th><th class="num">Đơn tối thiểu</th><th>Mô tả hiện cho khách</th><th>Đơn đầu</th><th></th></tr></thead><tbody id="maBody"></tbody></table></div>
        <button class="btn btn--teal btn--sm" id="btnThemMa" style="margin-top:12px">+ Thêm mã giảm giá</button>
      </div>

      <div class="card"><h3>🎁 Quà tặng kèm</h3><p>Web tự tính quà theo giỏ hàng và tự thêm vào đơn.</p>
        <label class="sw"><input type="checkbox" id="qtBat" ${q.enabled ? 'checked' : ''}> Bật chương trình quà tặng</label>
        <div class="row row-2">
          <label>Tên quà<input id="qtTen" value="${esc(q.ten || '')}" placeholder="VD: gói nước ép Lotte"></label>
          <label>Các vị cho khách chọn (cách nhau bằng dấu phẩy)<input id="qtVi" value="${esc((q.vi || []).join(', '))}"></label>
        </div>
        <h4 style="margin:16px 0 8px;font-size:14px">Chương trình 1 – theo giá trị đơn</h4>
        <div class="row row-3">
          <label>Đơn từ (đ)<input type="number" id="qtMuc" value="${(q.donTu || {}).muc || 0}"></label>
          <label>Tặng (số lượng)<input type="number" id="qtSo" value="${(q.donTu || {}).soQua || 0}"></label>
          <label style="align-self:end"><span class="sw" style="margin:0"><input type="checkbox" id="qtMoi" ${(q.donTu || {}).chiKhachMoi ? 'checked' : ''}> Chỉ khách chưa lên hạng</span></label>
        </div>
        <h4 style="margin:16px 0 8px;font-size:14px">Chương trình 2 – mua thùng nước dinh dưỡng Lotte</h4>
        <div id="qtThung"></div>
        <button class="btn btn--ghost btn--sm" id="btnThemBac">+ Thêm bậc</button>
        <label class="sw" style="margin-top:14px"><input type="checkbox" id="qtThungMoi" ${q.thungChiKhachMoi ? 'checked' : ''}> Khách đã lên hạng cũng KHÔNG được quà khi mua thùng</label>
        <p class="muted" style="font-size:13px">Hai chương trình không cộng dồn: web lấy chương trình tặng nhiều quà hơn.</p>
      </div>

      <div class="card"><h3>🏅 Hạng khách hàng</h3><p>Xét theo tổng tiền khách đã mua. Ưu đãi hạng tự trừ vào đơn.</p>
        <div class="tbl-wrap"><table><thead><tr><th>Biểu tượng</th><th>Tên hạng</th><th class="num">Tổng chi tiêu từ</th><th class="num">Giảm (%)</th><th>Mô tả</th></tr></thead><tbody id="hangBody"></tbody></table></div>
        <p class="muted" style="margin-top:10px;font-size:13px">⚠️ Sửa ở đây xong nhớ sửa luôn biến <code>HANG</code> trong Apps Script cho khớp, rồi Deploy lại.</p>
      </div>`;

    $('#fsEnd').value = SITE.flashSaleEnd === 'daily' ? 'daily' : 'off';
    veFlash(); veMa(); veBacThung(); veHang();
  }

  function veFlash() {
    $('#fsList').innerHTML = D.PRODUCTS.map((p, i) => {
      const on = (p.tags || []).includes('Sản phẩm hot');
      return `<div class="pitem ${on ? 'is-on' : ''}" data-fs="${i}">
        <img src="${esc(p.thumb || p.image || '')}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div><b>${esc(p.short || p.name)}</b><small>${fmt(p.price)} · ${esc(p.cat || '')}</small></div>
        <div><input type="checkbox" ${on ? 'checked' : ''} style="width:20px;height:20px" tabindex="-1"></div></div>`;
    }).join('');
  }
  function veMa() {
    const C = D.COUPONS || {};
    $('#maBody').innerHTML = Object.keys(C).map((ma) => {
      const c = C[ma];
      return `<tr data-ma="${esc(ma)}">
        <td><input value="${esc(ma)}" data-f="ma" style="width:110px;text-transform:uppercase"></td>
        <td><select data-f="type" style="width:116px"><option value="percent"${c.type === 'percent' ? ' selected' : ''}>Giảm %</option><option value="fixed"${c.type === 'fixed' ? ' selected' : ''}>Giảm tiền</option><option value="ship"${c.type === 'ship' ? ' selected' : ''}>Miễn ship</option></select></td>
        <td class="num"><input type="number" value="${c.value || 0}" data-f="value" style="width:92px"></td>
        <td class="num"><input type="number" value="${c.max || 0}" data-f="max" style="width:110px"></td>
        <td class="num"><input type="number" value="${c.min || 0}" data-f="min" style="width:110px"></td>
        <td><input value="${esc(c.desc || '')}" data-f="desc"></td>
        <td style="text-align:center"><input type="checkbox" ${c.donDau ? 'checked' : ''} data-f="donDau" style="width:18px;height:18px"></td>
        <td><button class="btn btn--red btn--sm" data-xoama="${esc(ma)}">Xoá</button></td></tr>`;
    }).join('') || '<tr><td colspan="8" class="muted">Chưa có mã nào</td></tr>';
  }
  function veBacThung() {
    const bac = (D.QUA_TANG && D.QUA_TANG.thung) || [];
    $('#qtThung').innerHTML = bac.map((b, i) => `<div class="vrow" data-bac="${i}" style="grid-template-columns:1fr 1fr 36px">
      <label style="margin:0">Mua từ (thùng)<input type="number" value="${b.tu}" data-f="tu"></label>
      <label style="margin:0">Tặng (số lượng)<input type="number" value="${b.soQua}" data-f="soQua"></label>
      <button class="btn btn--red btn--sm" data-xoabac="${i}" style="align-self:end">✕</button></div>`).join('');
  }
  function veHang() {
    $('#hangBody').innerHTML = (D.TIERS || []).map((t, i) => `<tr data-hang="${i}">
      <td><input value="${esc(t.icon || '')}" data-f="icon" style="width:52px;text-align:center"></td>
      <td><input value="${esc(t.label || '')}" data-f="label" style="width:120px"></td>
      <td class="num"><input type="number" value="${t.min || 0}" data-f="min" style="width:130px"></td>
      <td class="num"><input type="number" value="${t.discount || 0}" data-f="discount" style="width:80px"></td>
      <td><input value="${esc(t.desc || '')}" data-f="desc"></td></tr>`).join('');
  }

  /* =====================================================================
     TAB 3 – CỬA HÀNG
     ===================================================================== */
  let spDangSua = -1;
  function veShop() {
    $('#shopBody').innerHTML = `
      <div class="card"><h3>📦 Sản phẩm <span class="muted" style="font-weight:400;font-size:13px">(${D.PRODUCTS.length})</span></h3>
        <div class="row row-2" style="margin-bottom:12px"><input id="spTim" placeholder="Tìm theo tên sản phẩm…">
          <div style="display:flex;gap:8px"><button class="btn btn--teal" id="btnThemSP">+ Thêm sản phẩm</button></div></div>
        <div class="plist" id="spList"></div>
      </div>
      <div id="spSua"></div>
      <div class="card"><h3>🖼️ Banner trang chủ</h3><p>Các khung lớn chạy ở đầu trang chủ.</p><div id="bnList"></div>
        <button class="btn btn--teal btn--sm" id="btnThemBn" style="margin-top:10px">+ Thêm banner</button></div>`;
    veDsSP(); veBanner();
  }
  function veDsSP(loc = '') {
    const q = loc.trim().toLowerCase();
    $('#spList').innerHTML = D.PRODUCTS.map((p, i) => ({ p, i }))
      .filter(({ p }) => !q || (p.name + ' ' + (p.short || '')).toLowerCase().includes(q))
      .map(({ p, i }) => `<div class="pitem ${i === spDangSua ? 'is-on' : ''} ${p.an ? 'is-off' : ''}" data-sp="${i}">
        <img src="${esc(p.thumb || p.image || '')}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div><b>${esc(p.short || p.name)}</b><small>${fmt(p.price)} · tồn ${p.stock ?? 0}${p.an ? ' · ĐANG ẨN' : ''}${(p.variants || []).length ? ' · ' + p.variants.length + ' phân loại' : ''}</small></div>
        <div class="muted" style="font-size:12px">sửa ›</div></div>`).join('') || '<p class="muted">Không tìm thấy sản phẩm nào.</p>';
  }
  function veSuaSP() {
    const box = $('#spSua'); if (spDangSua < 0) { box.innerHTML = ''; return; }
    const p = D.PRODUCTS[spDangSua];
    box.innerHTML = `<div class="card" id="spForm">
      <h3>✏️ ${esc(p.short || p.name || 'Sản phẩm mới')}</h3><p>Mã sản phẩm: <code>${esc(p.id)}</code></p>
      <div class="row row-2">
        <label>Tên đầy đủ (hiện ở trang sản phẩm)<input data-p="name" value="${esc(p.name || '')}"></label>
        <label>Tên ngắn (hiện ở thẻ sản phẩm)<input data-p="short" value="${esc(p.short || '')}"></label>
      </div>
      <div class="row row-4">
        <label>Giá bán (đ)<input type="number" data-p="price" value="${p.price || 0}"></label>
        <label>Giá niêm yết (đ)<input type="number" data-p="oldPrice" value="${p.oldPrice || 0}"></label>
        <label>Tồn kho<input type="number" data-p="stock" value="${p.stock ?? 0}"></label>
        <label>Đã bán<input type="number" data-p="sold" value="${p.sold || 0}"></label>
      </div>
      <div class="row row-3">
        <label>Danh mục<select data-p="cat">${(window.CATEGORIES || []).map((c) => `<option value="${esc(c.key)}"${c.key === p.cat ? ' selected' : ''}>${esc(c.label)}</option>`).join('')}</select></label>
        <label>Thương hiệu<select data-p="brand">${(window.BRANDS || []).map((b) => `<option value="${esc(b.key)}"${b.key === p.brand ? ' selected' : ''}>${esc(b.label)}</option>`).join('')}</select></label>
        <label>Quy cách<input data-p="weight" value="${esc(p.weight || '')}"></label>
      </div>
      <label class="sw"><input type="checkbox" data-p="an" ${p.an ? 'checked' : ''}> Ẩn sản phẩm này khỏi website</label>

      <h4 style="margin:18px 0 8px;font-size:14px">Nhãn sản phẩm <span class="muted" style="font-weight:400;font-size:12.5px">— tích vào là web hiện nhãn ngay</span></h4>
      <div class="nhan" id="nhanList">${NHAN.map((n) => `<label class="nhan__i"><input type="checkbox" data-nhan="${esc(n.ten)}" ${(p.tags || []).includes(n.ten) ? 'checked' : ''}><span><b>${esc(n.ten)}</b><small>${esc(n.mo)}</small></span></label>`).join('')}</div>

      <h4 style="margin:18px 0 8px;font-size:14px">Phân loại & giá</h4>
      <div id="vList"></div>
      <button class="btn btn--ghost btn--sm" id="btnThemV">+ Thêm phân loại</button>

      <h4 style="margin:18px 0 8px;font-size:14px">Ảnh sản phẩm</h4>
      <div class="imgrow" id="imgList"></div>
      <div class="drop" id="imgDrop" style="margin-top:10px">📁 Bấm để chọn ảnh từ máy (tự tải lên website)<input type="file" id="imgFile" accept="image/*" multiple hidden></div>

      <label style="margin-top:16px">Mô tả<textarea data-p="desc">${esc(p.desc || '')}</textarea></label>
      <label>Cách dùng<textarea data-p="usage">${esc(p.usage || '')}</textarea></label>
      <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
        <button class="btn btn--ghost" id="btnDongSP">Đóng</button>
        <button class="btn btn--red" id="btnXoaSP">Xoá sản phẩm</button>
      </div></div>`;
    veVariants(); veAnh();
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function veVariants() {
    const p = D.PRODUCTS[spDangSua]; const vs = p.variants || [];
    $('#vList').innerHTML = vs.length ? vs.map((v, i) => `<div class="vrow" data-v="${i}">
      <input value="${esc(v.label)}" data-f="label" placeholder="Tên phân loại">
      <input type="number" value="${v.price || 0}" data-f="price" placeholder="Giá bán">
      <input type="number" value="${v.oldPrice || 0}" data-f="oldPrice" placeholder="Giá niêm yết">
      <label style="margin:0;font-size:12px"><input type="checkbox" ${v.oos ? 'checked' : ''} data-f="oos" style="width:16px;height:16px;margin-right:4px">hết</label>
      <button class="btn btn--red btn--sm" data-xoav="${i}">✕</button></div>`).join('')
      : '<p class="muted" style="font-size:13px">Chưa có phân loại – khách mua theo 1 mức giá duy nhất.</p>';
  }
  function veAnh() {
    const p = D.PRODUCTS[spDangSua]; const imgs = p.images && p.images.length ? p.images : (p.image ? [p.image] : []);
    $('#imgList').innerHTML = imgs.map((src, i) => `<div style="position:relative">
      <img src="${esc(src)}" alt="" onerror="this.style.opacity=.3">
      <button class="btn btn--red btn--sm" data-xoaanh="${i}" style="position:absolute;top:-6px;right:-6px;padding:2px 7px">✕</button>
      ${i === 0 ? '<small class="muted" style="display:block;text-align:center;font-size:11px">ảnh bìa</small>' : ''}</div>`).join('')
      || '<p class="muted" style="font-size:13px">Chưa có ảnh nào.</p>';
  }
  function veBanner() {
    $('#bnList').innerHTML = (D.BANNERS || []).map((b, i) => `<div class="card" style="box-shadow:none;margin-bottom:10px" data-bn="${i}">
      <div class="row row-2">
        <label>Tiêu đề (xuống dòng bằng Enter)<textarea data-f="title" style="min-height:60px">${esc(b.title || '')}</textarea></label>
        <label>Mô tả<textarea data-f="sub" style="min-height:60px">${esc(b.sub || '')}</textarea></label>
      </div>
      <div class="row row-4">
        <label>Chữ trên nút<input data-f="cta" value="${esc(b.cta || '')}"></label>
        <label>Link khi bấm<input data-f="link" value="${esc(b.link || '')}"></label>
        <label>Nhãn góc<input data-f="badge" value="${esc(b.badge || '')}"></label>
        <label>Màu<select data-f="theme">${['pink', 'teal', 'amber'].map((t) => `<option${b.theme === t ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
      </div>
      <div class="imgrow"><img src="${esc(b.image || '')}" alt="" onerror="this.style.opacity=.3">
        <button class="btn btn--ghost btn--sm" data-anhbn="${i}">Đổi ảnh</button>
        <span class="grow"></span><button class="btn btn--red btn--sm" data-xoabn="${i}">Xoá banner</button></div></div>`).join('')
      || '<p class="muted">Chưa có banner nào.</p>';
  }

  /* =====================================================================
     TAB 4 – CÀI ĐẶT
     ===================================================================== */
  function veCaiDat() {
    $('#caiBody').innerHTML = `
      <div class="card"><h3>🔑 Kết nối GitHub (bắt buộc để lưu được)</h3>
        <p>Trang quản trị ghi thay đổi thẳng vào mã nguồn website trên GitHub. Cần mã truy cập dán 1 lần, chỉ lưu trên máy này.</p>
        <ol style="font-size:13.5px;line-height:1.9;padding-left:20px;color:var(--muted)">
          <li>Vào <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com → Fine-grained token</a></li>
          <li>Repository access → Only select repositories → chọn <b>${REPO}</b></li>
          <li>Permissions → Repository permissions → <b>Contents: Read and write</b></li>
          <li>Generate token → copy mã <code>github_pat_…</code> rồi dán xuống dưới</li>
        </ol>
        <div class="row row-2"><label>Mã GitHub<input type="password" id="inGh" placeholder="github_pat_..." autocomplete="off"></label>
        <div style="align-self:end;display:flex;gap:8px"><button class="btn btn--primary" id="btnLuuGh">Lưu mã</button><button class="btn btn--ghost" id="btnXoaGh">Xoá mã</button></div></div>
      </div>
      <div class="card"><h3>📊 Khoá đọc số liệu</h3><p>Phải khớp với <code>var ADMIN_KEY</code> trong Apps Script.</p>
        <div class="row row-2"><label>Khoá quản trị<input id="inKey2" value="${esc(adminKey())}"></label>
        <div style="align-self:end"><button class="btn btn--primary" id="btnKey2">Lưu khoá</button></div></div>
      </div>
      <div class="card"><h3>🔒 Lưu ý bảo mật</h3>
        <p style="color:var(--red)">Mật khẩu đăng nhập trang này nằm trong mã nguồn website, ai xem mã nguồn cũng đọc được.
        Nó chỉ là lớp che cho đỡ bấm nhầm, <b>không phải bảo vệ thật</b>.</p>
        <p class="muted" style="font-size:13.5px">Thứ thật sự bảo vệ shop là <b>mã GitHub</b> – không có mã đó thì không ai sửa được website.
        Mã GitHub chỉ nằm trên máy này, không nằm trong mã nguồn. Vì vậy: đừng dán mã GitHub lên máy lạ, và nếu
        nghi mã bị lộ thì vào GitHub xoá token cũ, tạo token mới.</p>
      </div>`;
  }

  /* =====================================================================
     LƯU LÊN GITHUB
     ===================================================================== */
  const ten = { PRODUCTS: 'sản phẩm', BANNERS: 'banner', QUA_TANG: 'quà tặng', TIERS: 'hạng khách', COUPONS: 'mã giảm giá' };
  function khoiJS(key, giaTri) {
    const json = JSON.stringify(giaTri, null, 2);
    return `/* ===ADMIN:${key}=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong) */\nwindow.${key} = ${json};\n/* ===/ADMIN:${key}=== */`;
  }
  function thayKhoi(src, key, giaTri) {
    const re = new RegExp(`/\\* ===ADMIN:${key}===[\\s\\S]*?/\\* ===/ADMIN:${key}=== \\*/`);
    if (!re.test(src)) throw new Error(`Không tìm thấy dấu mốc ADMIN:${key} trong js/data.js`);
    return src.replace(re, () => khoiJS(key, giaTri));
  }
  const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
  const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));

  async function ghDoc(duong) {
    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${duong}?t=${Date.now()}`,
      { headers: { Authorization: 'Bearer ' + ghToken(), Accept: 'application/vnd.github+json' } });
    if (!r.ok) throw new Error(loiGh(r.status, duong));
    return r.json();
  }
  async function ghGhi(duong, noiDung, sha, loi) {
    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${duong}`, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + ghToken(), Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: loi, content: noiDung, sha, branch: 'main' }),
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(loiGh(r.status, duong, d.message)); }
    return r.json();
  }
  function loiGh(status, duong, msg) {
    if (status === 401) return 'Mã GitHub sai hoặc đã hết hạn. Vào ⚙️ Cài đặt dán lại mã.';
    if (status === 403) return 'Mã GitHub thiếu quyền Contents: Read and write.';
    if (status === 404) return `Không thấy ${duong} – kiểm tra mã GitHub đã chọn đúng kho ${REPO} chưa.`;
    if (status === 409) return 'File vừa bị sửa ở nơi khác. Tải lại trang rồi sửa lại.';
    return `Lỗi GitHub ${status}${msg ? ': ' + msg : ''}`;
  }

  async function luuLenWeb() {
    if (!ghToken()) { toast('Chưa có mã GitHub – vào ⚙️ Cài đặt để dán mã', 'err'); chuyenTab('cai'); return; }
    const btn = $('#btnLuu'); btn.disabled = true; btn.textContent = '⏳ Đang lưu…';
    try {
      thuThapForm();
      const f = await ghDoc('js/data.js');
      let src = unb64(f.content);
      const doi = [];
      ['PRODUCTS', 'BANNERS', 'QUA_TANG', 'TIERS', 'COUPONS'].forEach((k) => {
        if (JSON.stringify(D[k]) === JSON.stringify(GOC[k])) return;
        src = thayKhoi(src, k, D[k]); doi.push(ten[k]);
      });
      if (!doi.length) { toast('Không có gì thay đổi'); btn.textContent = '💾 Lưu lên web'; return; }
      new Function(src);   // kiểm tra cú pháp trước khi đẩy lên, tránh làm hỏng web
      await ghGhi('js/data.js', b64(src), f.sha, 'Trang quản trị: cập nhật ' + doi.join(', '));
      await dongBoTonKho();
      sessionStorage.removeItem('hck_admin_nhap');
      GOC = sao(D); daSua = false; capNhatNutLuu();
      bar('✅ Đã lưu lên website. GitHub Pages cần khoảng <b>1 phút</b> để cập nhật, khách có thể thấy chậm hơn vài phút do bộ nhớ đệm trình duyệt.', 'ok');
      toast('Đã lưu lên web 🎉', 'ok');
    } catch (e) {
      bar('❌ ' + esc(e.message), 'err'); toast('Chưa lưu được', 'err');
    } finally { btn.disabled = false; btn.textContent = daSua ? '💾 Lưu lên web (có thay đổi)' : '💾 Lưu lên web'; }
  }

  /* Tồn kho còn được ghi riêng ở data/stock.json (trang quản lý tồn kho dùng chung).
     File đó đè lên js/data.js lúc web chạy, nên lưu xong phải đồng bộ lại, không thì
     sản phẩm vừa đặt "hết hàng" sẽ lại hiện còn hàng. */
  async function dongBoTonKho() {
    const canDoi = D.PRODUCTS.some((p, i) => {
      const g = GOC.PRODUCTS.find((x) => x.id === p.id);
      if (!g) return true;
      if ((g.stock > 0) !== (p.stock > 0)) return true;
      const gv = g.variants || [], pv = p.variants || [];
      return pv.some((v, j) => !!v.oos !== !!(gv[j] && gv[j].oos));
    });
    if (!canDoi) return;
    let f, cu = {};
    try { f = await ghDoc('data/stock.json'); cu = JSON.parse(unb64(f.content)); } catch { f = null; }
    const items = cu.items || {};
    D.PRODUCTS.forEach((p) => {
      const con = (p.stock ?? 0) > 0;
      const vo = {};
      (p.variants || []).forEach((v) => { vo[v.label] = !v.oos; });
      items[p.id] = Object.keys(vo).length ? { in: con, variants: vo } : con;
    });
    const noiDung = JSON.stringify({ ...cu, updatedAt: new Date().toISOString(), source: 'admin',
      note: 'true = con hang, false = het hang', items }, null, 2);
    await ghGhi('data/stock.json', b64(noiDung), f ? f.sha : undefined, 'Trang quản trị: cập nhật tồn kho');
  }

  /* Tải ảnh từ máy lên thư mục img/ của website */
  async function taiAnh(file, tenFile) {
    const buf = await file.arrayBuffer();
    let bin = ''; const arr = new Uint8Array(buf);
    for (let i = 0; i < arr.length; i += 8192) bin += String.fromCharCode.apply(null, arr.subarray(i, i + 8192));
    const duong = 'img/' + tenFile;
    let sha; try { sha = (await ghDoc(duong)).sha; } catch { sha = undefined; }
    await ghGhi(duong, btoa(bin), sha, 'Trang quản trị: tải ảnh ' + tenFile);
    return duong;
  }

  /* =====================================================================
     THU THẬP DỮ LIỆU TỪ CÁC Ô NHẬP
     ===================================================================== */
  function thuThapForm() {
    // Marketing: mã giảm giá
    if ($('#maBody')) {
      const C = {};
      $$('#maBody tr[data-ma]').forEach((tr) => {
        const g = (f) => $(`[data-f="${f}"]`, tr);
        const ma = (g('ma').value || '').trim().toUpperCase(); if (!ma) return;
        const o = { type: g('type').value, value: Number(g('value').value) || 0, min: Number(g('min').value) || 0, desc: g('desc').value.trim() };
        if (Number(g('max').value)) o.max = Number(g('max').value);
        if (g('donDau').checked) o.donDau = true;
        C[ma] = o;
      });
      D.COUPONS = C;
    }
    // Marketing: quà tặng
    if ($('#qtTen')) {
      D.QUA_TANG = D.QUA_TANG || {};
      Object.assign(D.QUA_TANG, {
        enabled: $('#qtBat').checked,
        ten: $('#qtTen').value.trim(),
        vi: $('#qtVi').value.split(',').map((x) => x.trim()).filter(Boolean),
        donTu: { muc: Number($('#qtMuc').value) || 0, soQua: Number($('#qtSo').value) || 0, chiKhachMoi: $('#qtMoi').checked },
        thungChiKhachMoi: $('#qtThungMoi').checked,
        thung: $$('#qtThung [data-bac]').map((r) => ({ tu: Number($('[data-f="tu"]', r).value) || 1, soQua: Number($('[data-f="soQua"]', r).value) || 0 })).sort((a, b) => a.tu - b.tu),
      });
    }
    // Marketing: hạng khách
    if ($('#hangBody')) {
      $$('#hangBody tr[data-hang]').forEach((tr) => {
        const t = D.TIERS[Number(tr.dataset.hang)];
        t.icon = $('[data-f="icon"]', tr).value.trim();
        t.label = $('[data-f="label"]', tr).value.trim();
        t.min = Number($('[data-f="min"]', tr).value) || 0;
        t.discount = Number($('[data-f="discount"]', tr).value) || 0;
        t.desc = $('[data-f="desc"]', tr).value.trim();
      });
      D.TIERS.sort((a, b) => a.min - b.min);
    }
    // Cửa hàng: sản phẩm đang mở
    if ($('#spForm') && spDangSua >= 0) {
      const p = D.PRODUCTS[spDangSua];
      $$('#spForm [data-p]').forEach((el) => {
        const f = el.dataset.p;
        if (f === 'an') { if (el.checked) p.an = true; else delete p.an; return; }
        p[f] = el.type === 'number' ? Number(el.value) || 0 : el.value;
      });
      const chon = $$('#nhanList [data-nhan]').filter((el) => el.checked).map((el) => el.dataset.nhan);
      const giu = (p.tags || []).filter((t) => !NHAN.some((n) => n.ten === t));   // giữ nhãn lạ do shop tự thêm trong data.js
      p.tags = chon.concat(giu);
      const vs = $$('#vList [data-v]').map((r) => {
        const o = { label: $('[data-f="label"]', r).value.trim(), price: Number($('[data-f="price"]', r).value) || 0 };
        const op = Number($('[data-f="oldPrice"]', r).value); if (op) o.oldPrice = op;
        if ($('[data-f="oos"]', r).checked) o.oos = true;
        return o;
      }).filter((v) => v.label);
      if (vs.length) p.variants = vs; else delete p.variants;
    }
    // Cửa hàng: banner
    if ($('#bnList')) {
      $$('#bnList [data-bn]').forEach((el) => {
        const b = D.BANNERS[Number(el.dataset.bn)];
        ['title', 'sub', 'cta', 'link', 'badge', 'theme'].forEach((f) => { const i = $(`[data-f="${f}"]`, el); if (i) b[f] = i.value; });
      });
    }
    // Flash sale: hạn đếm ngược
    if ($('#fsEnd')) D.SITE = { ...(D.SITE || {}), flashSaleEnd: $('#fsEnd').value === 'daily' ? 'daily' : '' };
  }

  /* =====================================================================
     SỰ KIỆN
     ===================================================================== */
  function chuyenTab(tab) {
    $$('#tabs .tab').forEach((b) => b.classList.toggle('is-on', b.dataset.tab === tab));
    $$('.tabpane').forEach((p) => p.classList.toggle('hide', p.dataset.pane !== tab));
    if (tab === 'dash') { if (!$('#dashBody').dataset.da) { $('#dashBody').dataset.da = '1'; taiThongKe(); } }
    if (tab === 'mkt' && !$('#mktBody').children.length) veMarketing();
    if (tab === 'shop' && !$('#shopBody').children.length) veShop();
    if (tab === 'cai') veCaiDat();
  }
  function veLai() {
    if ($('#mktBody').children.length) veMarketing();
    if ($('#shopBody').children.length) { veDsSP($('#spTim') ? $('#spTim').value : ''); veSuaSP(); veBanner(); }
  }

  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('.tab'); if (b) chuyenTab(b.dataset.tab); });

  // Bộ lọc thời gian
  $('#dashFilter').addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    $$('#dashFilter .chip').forEach((x) => x.classList.toggle('is-on', x === c));
    datKhoang(c.dataset.range); taiThongKe();
  });
  $('#btnLoc').addEventListener('click', () => {
    kyTu = $('#dTu').value; kyDen = $('#dDen').value;
    $$('#dashFilter .chip').forEach((x) => x.classList.remove('is-on'));
    taiThongKe();
  });

  // Mọi thay đổi trong các ô nhập đều đánh dấu là "có sửa"
  $('#pane').addEventListener('input', (e) => {
    if (e.target.id === 'spTim') { veDsSP(e.target.value); return; }
    if (e.target.closest('#caiBody') || e.target.closest('#dashBody')) return;
    thuThapForm(); danhDauSua();
  });
  $('#pane').addEventListener('change', (e) => {
    if (e.target.closest('#caiBody') || e.target.closest('#dashBody')) return;
    thuThapForm(); danhDauSua();
    if (e.target.dataset.p === 'an' || e.target.dataset.nhan) { veDsSP($('#spTim') ? $('#spTim').value : ''); if ($('#fsList')) veFlash(); }
  });

  $('#pane').addEventListener('click', async (e) => {
    const t = e.target;

    // ----- Khoá quản trị -----
    if (t.id === 'btnThuLai') { taiThongKe(); return; }
    if (t.id === 'btnKey' || t.id === 'btnKey2') {
      const v = (t.id === 'btnKey' ? $('#inKey') : $('#inKey2')).value.trim();
      localStorage.setItem('hck_admin_key', v); toast('Đã lưu khoá', 'ok');
      if (t.id === 'btnKey') taiThongKe();
      return;
    }
    // ----- Mã GitHub -----
    if (t.id === 'btnLuuGh') { const v = $('#inGh').value.trim(); if (!v) return; localStorage.setItem('hck_gh_token', v); $('#inGh').value = ''; toast('Đã lưu mã GitHub trên máy này', 'ok'); kiemTraGh(); return; }
    if (t.id === 'btnXoaGh') { localStorage.removeItem('hck_gh_token'); toast('Đã xoá mã khỏi máy này'); kiemTraGh(); return; }

    // ----- Flash sale -----
    const fs = t.closest('[data-fs]');
    if (fs) {
      const p = D.PRODUCTS[Number(fs.dataset.fs)];
      const tags = (p.tags || []).filter((x) => x !== 'Sản phẩm hot');
      if (!(p.tags || []).includes('Sản phẩm hot')) tags.unshift('Sản phẩm hot');
      p.tags = tags; danhDauSua(); veFlash(); return;
    }
    // ----- Mã giảm giá -----
    if (t.id === 'btnThemMa') { thuThapForm(); D.COUPONS['MAMOI' + (Object.keys(D.COUPONS).length + 1)] = { type: 'percent', value: 10, min: 300000, desc: 'Mô tả hiện cho khách' }; danhDauSua(); veMa(); return; }
    if (t.dataset.xoama) { if (!confirm('Xoá mã ' + t.dataset.xoama + '?')) return; thuThapForm(); delete D.COUPONS[t.dataset.xoama]; danhDauSua(); veMa(); return; }
    // ----- Bậc quà thùng -----
    if (t.id === 'btnThemBac') { thuThapForm(); D.QUA_TANG.thung.push({ tu: (D.QUA_TANG.thung.length || 0) + 1, soQua: 5 }); danhDauSua(); veBacThung(); return; }
    if (t.dataset.xoabac) { thuThapForm(); D.QUA_TANG.thung.splice(Number(t.dataset.xoabac), 1); danhDauSua(); veBacThung(); return; }

    // ----- Sản phẩm -----
    const sp = t.closest('[data-sp]');
    if (sp) { thuThapForm(); spDangSua = Number(sp.dataset.sp); veDsSP($('#spTim').value); veSuaSP(); return; }
    if (t.id === 'btnDongSP') { thuThapForm(); spDangSua = -1; veDsSP($('#spTim').value); veSuaSP(); return; }
    if (t.id === 'btnThemSP') {
      thuThapForm();
      const id = 'sp' + Date.now();
      D.PRODUCTS.push({ id, name: 'Sản phẩm mới', short: 'Sản phẩm mới', brand: (window.BRANDS[0] || {}).key || 'khac',
        cat: (window.CATEGORIES[0] || {}).key || 'khac', ages: [], needs: [], price: 0, oldPrice: 0, rating: 5, reviews: 0, sold: 0,
        stock: 10, shape: 'box', color: '#F0537A', weight: '', origin: 'Hàn Quốc', tags: [], image: '', thumb: '', images: [], desc: '', highlights: [], usage: '' });
      spDangSua = D.PRODUCTS.length - 1; danhDauSua(); veDsSP(); veSuaSP();
      toast('Đã thêm sản phẩm mới – điền thông tin rồi bấm Lưu lên web', 'ok'); return;
    }
    if (t.id === 'btnXoaSP') {
      const p = D.PRODUCTS[spDangSua];
      if (!confirm(`Xoá hẳn "${p.short || p.name}" khỏi website?\n\nMuốn tạm ẩn thì dùng ô "Ẩn sản phẩm" sẽ an toàn hơn.`)) return;
      D.PRODUCTS.splice(spDangSua, 1); spDangSua = -1; danhDauSua(); veDsSP(); veSuaSP(); toast('Đã xoá'); return;
    }
    if (t.id === 'btnThemV') { thuThapForm(); const p = D.PRODUCTS[spDangSua]; p.variants = p.variants || []; p.variants.push({ label: 'Phân loại mới', price: p.price || 0 }); danhDauSua(); veVariants(); return; }
    if (t.dataset.xoav) { thuThapForm(); D.PRODUCTS[spDangSua].variants.splice(Number(t.dataset.xoav), 1); danhDauSua(); veVariants(); return; }
    if (t.dataset.xoaanh) {
      const p = D.PRODUCTS[spDangSua]; p.images = (p.images || []).filter((_, i) => i !== Number(t.dataset.xoaanh));
      p.image = p.images[0] || ''; p.thumb = p.thumb && p.images.includes(p.thumb) ? p.thumb : p.images[0] || '';
      danhDauSua(); veAnh(); return;
    }
    if (t.closest('#imgDrop')) { $('#imgFile').click(); return; }

    // ----- Banner -----
    if (t.id === 'btnThemBn') { thuThapForm(); D.BANNERS.push({ title: 'Tiêu đề banner', sub: 'Mô tả ngắn', cta: 'Mua ngay', link: 'collections.html', theme: 'pink', badge: '', image: '' }); danhDauSua(); veBanner(); return; }
    if (t.dataset.xoabn) { if (!confirm('Xoá banner này?')) return; thuThapForm(); D.BANNERS.splice(Number(t.dataset.xoabn), 1); danhDauSua(); veBanner(); return; }
    if (t.dataset.anhbn) { bnDangDoi = Number(t.dataset.anhbn); $('#bnFile').click(); return; }
  });

  /* ----- Tải ảnh ----- */
  let bnDangDoi = -1;
  document.body.insertAdjacentHTML('beforeend', '<input type="file" id="bnFile" accept="image/*" hidden>');
  $('#bnFile').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f || bnDangDoi < 0) return;
    if (!ghToken()) { toast('Cần mã GitHub để tải ảnh lên', 'err'); return; }
    toast('Đang tải ảnh lên…');
    try {
      const duong = await taiAnh(f, 'banner-' + Date.now() + '.' + (f.name.split('.').pop() || 'jpg').toLowerCase());
      thuThapForm(); D.BANNERS[bnDangDoi].image = duong; danhDauSua(); veBanner(); toast('Đã tải ảnh lên', 'ok');
    } catch (err) { toast(err.message, 'err'); }
    e.target.value = '';
  });
  $('#pane').addEventListener('change', async (e) => {
    if (e.target.id !== 'imgFile') return;
    const files = Array.from(e.target.files || []); if (!files.length) return;
    if (!ghToken()) { toast('Cần mã GitHub để tải ảnh lên', 'err'); return; }
    const p = D.PRODUCTS[spDangSua];
    toast(`Đang tải ${files.length} ảnh lên…`);
    try {
      for (const f of files) {
        const duong = await taiAnh(f, `${p.id}-${Date.now()}.${(f.name.split('.').pop() || 'jpg').toLowerCase()}`);
        p.images = p.images || []; p.images.push(duong);
        if (!p.image) p.image = duong;
        if (!p.thumb) p.thumb = duong;
      }
      danhDauSua(); veAnh(); toast('Đã tải ảnh lên', 'ok');
    } catch (err) { toast(err.message, 'err'); }
    e.target.value = '';
  });

  /* ----- Xem trước ----- */
  function moXem(reload) {
    thuThapForm();
    sessionStorage.setItem('hck_preview', JSON.stringify(D));
    const f = $('#pvFrame'); const trang = $('#pvPage').value;
    f.src = trang + (trang.includes('?') ? '&' : '?') + 'preview=1&t=' + Date.now();
    if (reload !== false) toast('Khung xem trước đang hiện bản nháp');
  }
  $('#btnXem').addEventListener('click', () => { $('#preview').classList.remove('hide'); $('#pvShow').classList.add('hide'); $('.main').classList.remove('full'); moXem(); });
  $('#pvReload').addEventListener('click', () => moXem(false));
  $('#pvPage').addEventListener('change', () => moXem(false));
  $('#pvMobile').addEventListener('click', () => $('#pvWrap').classList.toggle('mobile'));
  $('#pvHide').addEventListener('click', () => { $('#preview').classList.add('hide'); $('#pvShow').classList.remove('hide'); $('.main').classList.add('full'); });
  $('#pvShow').addEventListener('click', () => { $('#preview').classList.remove('hide'); $('#pvShow').classList.add('hide'); $('.main').classList.remove('full'); moXem(); });

  $('#btnLuu').addEventListener('click', luuLenWeb);
  window.addEventListener('beforeunload', (e) => { if (daSua) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------------- Khởi động ---------------- */
  function khoiDong() {
    napNhap(); kiemTraGh(); datKhoang('30');
    chuyenTab((location.hash || '').replace('#', '') || 'dash');
    moXem(false);
  }
  if (sessionStorage.getItem(DA_VAO) === '1') moKhoa();   // đã đăng nhập trong phiên này thì vào thẳng
})();
