/* =====================================================================
   ADMIN CORE – Hương Chất Kids
   Khung chung cho trang quản trị: tiện ích, đăng nhập, phân quyền, router,
   layout (sidebar + header), bản nháp, gọi Apps Script, ghi GitHub.
   Mỗi module nghiệp vụ nằm ở file js/admin/m-*.js và tự đăng ký vào ADMIN.
   ===================================================================== */
window.ADMIN = (() => {
  'use strict';

  /* ---------------- Tiện ích ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n) => (Math.round(n) || 0).toLocaleString('vi-VN') + '₫';
  const gon = (n) => { n = Number(n) || 0; return n >= 1e9 ? (n / 1e9).toFixed(1) + ' tỷ' : n >= 1e6 ? (n / 1e6).toFixed(1) + ' tr' : n >= 1e3 ? Math.round(n / 1e3) + 'K' : String(n); };
  const ngayISO = (d) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const sao = (v) => JSON.parse(JSON.stringify(v));
  const hoan = (ms) => new Promise((r) => setTimeout(r, ms));
  const tre = (fn, ms = 350) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const khongDau = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

  const REPO = 'Dohoang2010/huongchatkids';

  /* ---------------- Thông báo & hộp thoại ---------------- */
  let tToast = 0;
  function toast(msg, kieu = '') {
    const el = $('#toast'); if (!el) return;
    el.textContent = msg; el.className = 'toast ' + kieu;
    clearTimeout(tToast); tToast = setTimeout(() => el.classList.add('hide'), 3600);
  }
  /* Hộp xác nhận – luôn dùng cái này cho thao tác xoá, không dùng confirm() của trình duyệt */
  function hoi({ tieuDe, noiDung, nutOk = 'Đồng ý', nguyHiem = false }) {
    return new Promise((xong) => {
      const m = $('#modal');
      m.innerHTML = `<div class="modal__bd"></div><div class="modal__box">
        <h3>${esc(tieuDe)}</h3><p>${noiDung}</p>
        <div class="modal__act"><button class="btn btn--ghost" data-no>Huỷ</button>
        <button class="btn ${nguyHiem ? 'btn--red' : 'btn--primary'}" data-yes>${esc(nutOk)}</button></div></div>`;
      m.classList.remove('hide');
      const dong = (v) => { m.classList.add('hide'); m.innerHTML = ''; xong(v); };
      m.addEventListener('click', (e) => {
        if (e.target.closest('[data-yes]')) dong(true);
        else if (e.target.closest('[data-no]') || e.target.classList.contains('modal__bd')) dong(false);
      });
    });
  }

  /* ---------------- Phân quyền (RBAC phía giao diện) ----------------
     Apps Script vẫn kiểm tra khoá riêng cho các việc đọc số liệu; phần này
     quyết định ẩn/hiện menu và nút bấm theo vai trò. */
  const VAI_TRO = {
    SUPER_ADMIN:   { ten: 'Quản trị cao nhất', quyen: ['*'] },
    MANAGER:       { ten: 'Quản lý', quyen: ['dashboard.view', 'order.*', 'product.*', 'customer.*', 'banner.*', 'content.*', 'flashsale.*', 'combo.*', 'seo.*', 'theme.*', 'setting.view'] },
    ORDER_STAFF:   { ten: 'Nhân viên đơn hàng', quyen: ['dashboard.view', 'order.view', 'order.update', 'customer.view'] },
    PRODUCT_STAFF: { ten: 'Nhân viên sản phẩm', quyen: ['dashboard.view', 'product.*', 'category.*', 'flashsale.*', 'combo.*'] },
    CONTENT_STAFF: { ten: 'Nhân viên nội dung', quyen: ['dashboard.view', 'content.*', 'banner.*', 'seo.*'] },
  };
  let nguoiDung = { ten: 'Chủ shop', vaiTro: 'SUPER_ADMIN' };
  try { const p = JSON.parse(sessionStorage.getItem('hck_qt_nd') || 'null'); if (p && p.ten) nguoiDung = p; } catch { /* dùng mặc định */ }
  function co(quyen) {
    if (!quyen) return true;
    const ds = (VAI_TRO[nguoiDung.vaiTro] || {}).quyen || [];
    return ds.some((q) => q === '*' || q === quyen || (q.endsWith('.*') && quyen.startsWith(q.slice(0, -1))));
  }

  /* ---------------- Đăng nhập ---------------- */
  const KHOA_PHIEN = 'hck_admin_in';
  const TAI_KHOAN = { id: 'adminhck', mk: '123' };
  const PHIEN_GIO = 8;   // tự thoát sau 8 giờ không dùng

  function dangNhapHopLe() {
    try {
      const p = JSON.parse(sessionStorage.getItem(KHOA_PHIEN) || 'null');
      return !!(p && p.luc && Date.now() - p.luc < PHIEN_GIO * 3600e3);
    } catch { return false; }
  }
  function ghiPhien() { sessionStorage.setItem(KHOA_PHIEN, JSON.stringify({ luc: Date.now(), ten: nguoiDung.ten })); }
  function thoat() { sessionStorage.removeItem(KHOA_PHIEN); sessionStorage.removeItem('hck_qt_token'); sessionStorage.removeItem('hck_qt_nd'); location.reload(); }

  /* ---------------- Gọi Apps Script (JSONP) ---------------- */
  let seq = 0;
  const LENH_QT = ['thongKe', 'truyCap', 'donHang', 'donChiTiet', 'doiTrangThai', 'dongBoCRM', 'khachHang', 'khachChiTiet', 'khoaKhach', 'nhatKy', 'qtDs', 'qtLuu', 'qtXoa'];
  /* Lệnh chỉ đọc: hết giờ thì tự gửi lại 1 lần (Apps Script lần đầu sau khi nghỉ có thể mất 20–40 giây để "thức dậy") */
  const LENH_DOC = ['thongKe', 'truyCap', 'donHang', 'donChiTiet', 'khachHang', 'khachChiTiet', 'nhatKy', 'qtDs', 'qtHoSo'];
  function api(action, params = {}, timeout = 45000) {
    const lan1 = goiApi(action, params, timeout);
    return LENH_DOC.includes(action) ? lan1.catch((e) => (/không phản hồi/i.test(e.message) ? goiApi(action, params, timeout) : Promise.reject(e))) : lan1;
  }
  function goiApi(action, params, timeout) {
    if (LENH_QT.includes(action)) params = { ...xacThuc(), ...params };
    const url = (SITE.loyalty && SITE.loyalty.endpoint) || SITE.orderEndpoint || '';
    if (!url) return Promise.reject(new Error('Chưa cấu hình link Apps Script trong js/data.js'));
    return new Promise((ok, loi) => {
      const cb = 'adCb' + (++seq) + Math.random().toString(36).slice(2, 7);
      const sc = document.createElement('script'); let tid = 0;
      /* Không xoá hàm nhận kết quả: phản hồi về muộn sẽ gọi vào hàm rỗng thay vì báo lỗi "Script error" */
      const xong = (fn, v) => { clearTimeout(tid); window[cb] = () => {}; sc.remove(); fn(v); };
      tid = setTimeout(() => xong(loi, new Error('Máy chủ không phản hồi (Google Apps Script đang chậm). Bấm "Thử lại" sau vài giây.')), timeout);
      window[cb] = (d) => xong(ok, d || {});
      sc.onerror = () => xong(loi, new Error('Không kết nối được Apps Script'));
      sc.src = url + (url.includes('?') ? '&' : '?') + new URLSearchParams({ ...params, action, callback: cb });
      document.head.appendChild(sc);
    });
  }
  const adminKey = () => localStorage.getItem('hck_admin_key') || 'hck-admin-2026';
  /* Tham số xác thực gửi kèm mọi lệnh quản trị: token của tài khoản đang đăng nhập,
     kèm khoá chủ shop làm phương án dự phòng khi chưa tạo tài khoản nào. */
  function xacThuc(extra) {
    const p = sessionStorage.getItem('hck_qt_token');
    return { key: adminKey(), ...(p ? { token: p } : {}), ...(extra || {}) };
  }

  /* ---------------- GitHub ---------------- */
  const ghToken = () => localStorage.getItem('hck_gh_token') || '';
  const b64 = (s) => btoa(unescape(encodeURIComponent(s)));
  const unb64 = (s) => decodeURIComponent(escape(atob(String(s).replace(/\n/g, ''))));

  function loiGh(status, duong, msg) {
    if (status === 401) return 'Mã GitHub sai hoặc đã hết hạn. Vào ⚙️ Cấu hình → Kết nối GitHub để dán lại.';
    if (status === 403) return 'Mã GitHub thiếu quyền Contents: Read and write.';
    if (status === 404) return `Không thấy ${duong} – kiểm tra mã GitHub đã chọn đúng kho ${REPO} chưa.`;
    if (status === 409) return 'File vừa bị sửa ở nơi khác. Tải lại trang rồi sửa lại.';
    return `Lỗi GitHub ${status}${msg ? ': ' + msg : ''}`;
  }
  async function ghDoc(duong, nhanh = 'main') {
    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${duong}?ref=${nhanh}&t=${Date.now()}`,
      { headers: { Authorization: 'Bearer ' + ghToken(), Accept: 'application/vnd.github+json' } });
    if (!r.ok) throw new Error(loiGh(r.status, duong));
    return r.json();
  }
  async function ghGhi(duong, noiDung, sha, loi, nhanh = 'main') {
    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${duong}`, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + ghToken(), Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: loi, content: noiDung, sha, branch: nhanh }),
    });
    if (!r.ok) { const d = await r.json().catch(() => ({})); throw new Error(loiGh(r.status, duong, d.message)); }
    return r.json();
  }
  function kiemTraGh() {
    const dot = $('#ghDot'); if (!dot) return;
    const t = ghToken();
    if (!t) { dot.className = 'dot no'; dot.title = 'Chưa có mã GitHub – không lưu được'; return; }
    fetch(`https://api.github.com/repos/${REPO}`, { headers: { Authorization: 'Bearer ' + t } })
      .then((r) => { dot.className = 'dot ' + (r.ok ? 'ok' : 'no'); dot.title = r.ok ? 'Đã kết nối GitHub' : 'Mã GitHub không dùng được'; })
      .catch(() => { dot.className = 'dot no'; dot.title = 'Không kết nối được GitHub'; });
  }

  /* ---------------- Bản nháp dữ liệu website ----------------
     GOC = bản đang chạy thật, D = bản đang sửa. Chỉ ghi lên web khi bấm Xuất bản. */
  const KHOI = ['PRODUCTS', 'BANNERS', 'QUA_TANG', 'TIERS', 'COUPONS', 'NAV', 'POSTS', 'THEME', 'CAUHINH'];
  let GOC = {}, D = {}, daSua = false;
  function napNhap() {
    GOC = {}; KHOI.forEach((k) => { GOC[k] = sao(window[k] || (k === 'QUA_TANG' || k === 'THEME' || k === 'CAUHINH' ? {} : [])); });
    let nhap = null;
    try { nhap = JSON.parse(sessionStorage.getItem('hck_admin_nhap') || 'null'); } catch { nhap = null; }
    D = nhap || sao(GOC);
    daSua = !!nhap;
    veThanhLuu();
  }
  function doiDuLieu() {
    daSua = true;
    sessionStorage.setItem('hck_admin_nhap', JSON.stringify(D));
    sessionStorage.setItem('hck_preview', JSON.stringify(D));
    veThanhLuu();
    PREVIEW && PREVIEW.capNhat(D);
  }
  function boNhap() {
    sessionStorage.removeItem('hck_admin_nhap'); sessionStorage.removeItem('hck_preview');
    D = sao(GOC); daSua = false; veThanhLuu(); PREVIEW && PREVIEW.capNhat(D); veTrang();
  }
  function daDoiGi() { return KHOI.filter((k) => JSON.stringify(D[k]) !== JSON.stringify(GOC[k])); }

  function veThanhLuu() {
    const b = $('#bar'); if (!b) return;
    if (!daSua) { b.classList.add('hide'); b.innerHTML = ''; return; }
    b.classList.remove('hide'); b.className = 'bar';
    b.innerHTML = `<span class="cham"></span><b>Chưa xuất bản</b>
      <span class="muted">Thay đổi đang ở bản nháp, khách chưa nhìn thấy.</span>
      <span class="grow"></span>
      <button class="btn btn--ghost btn--sm" data-act="bo-nhap">Huỷ thay đổi</button>
      <a class="btn btn--ghost btn--sm" href="#/phien-ban">🔗 Link xem thử</a>
      <button class="btn btn--primary btn--sm" data-act="xuat-ban">Xuất bản</button>`;
  }

  /* Ghi bản nháp lên website thật (commit vào js/data.js + data/stock.json) */
  async function xuatBan() {
    if (!ghToken()) { toast('Chưa có mã GitHub – vào ⚙️ Cấu hình để dán mã', 'err'); di('#/cau-hinh/github'); return; }
    const doi = daDoiGi();
    if (!doi.length) { toast('Không có gì thay đổi'); return; }
    const ten = { PRODUCTS: 'sản phẩm', BANNERS: 'banner', QUA_TANG: 'quà tặng', TIERS: 'hạng khách', COUPONS: 'mã giảm giá', NAV: 'menu', POSTS: 'bài viết', THEME: 'giao diện', CAUHINH: 'cấu hình website' };
    const ok = await hoi({ tieuDe: 'Xuất bản thay đổi?',
      noiDung: `Các phần sẽ cập nhật lên website thật: <b>${doi.map((k) => esc(ten[k])).join(', ')}</b>.<br>Khách sẽ nhìn thấy sau khoảng 1 phút.`,
      nutOk: 'Xuất bản' });
    if (!ok) return;
    const b = $('#bar'); b.className = 'bar bar--wait'; b.innerHTML = '⏳ Đang xuất bản…';
    try {
      const f = await ghDoc('js/data.js');
      let src = unb64(f.content);
      doi.forEach((k) => { src = thayKhoi(src, k, D[k]); });
      new Function(src);   // kiểm tra cú pháp trước khi đẩy, tránh làm hỏng web
      await ghGhi('js/data.js', b64(src), f.sha, 'Quản trị: cập nhật ' + doi.map((k) => ten[k]).join(', '));
      await dongBoTonKho();
      sessionStorage.removeItem('hck_admin_nhap');
      GOC = sao(D); daSua = false; veThanhLuu();
      b.classList.remove('hide'); b.className = 'bar bar--ok';
      b.innerHTML = '✅ Đã xuất bản lên website. GitHub Pages cần khoảng 1 phút để cập nhật.';
      setTimeout(() => { if (!daSua) b.classList.add('hide'); }, 9000);
      toast('Đã xuất bản 🎉', 'ok');
    } catch (e) {
      b.className = 'bar bar--err'; b.innerHTML = '❌ ' + esc(e.message) + ' <button class="btn btn--ghost btn--sm" data-act="xuat-ban">Thử lại</button>';
      toast('Chưa xuất bản được', 'err');
    }
  }
  function thayKhoi(src, key, giaTri) {
    const re = new RegExp(`/\\* ===ADMIN:${key}===[\\s\\S]*?/\\* ===/ADMIN:${key}=== \\*/`);
    if (!re.test(src)) throw new Error(`Không tìm thấy dấu mốc ADMIN:${key} trong js/data.js`);
    return src.replace(re, () => `/* ===ADMIN:${key}=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong) */\nwindow.${key} = ${JSON.stringify(giaTri, null, 2)};\n/* ===/ADMIN:${key}=== */`);
  }
  /* data/stock.json đè lên js/data.js lúc web chạy nên phải đồng bộ theo */
  async function dongBoTonKho() {
    const canDoi = D.PRODUCTS.some((p) => {
      const g = GOC.PRODUCTS.find((x) => x.id === p.id);
      if (!g) return true;
      if ((g.stock > 0) !== (p.stock > 0)) return true;
      const gv = g.variants || [], pv = p.variants || [];
      return pv.some((v, j) => !!v.oos !== !!(gv[j] && gv[j].oos));
    });
    if (!canDoi) return;
    let f = null, cu = {};
    try { f = await ghDoc('data/stock.json'); cu = JSON.parse(unb64(f.content)); } catch { f = null; }
    const items = cu.items || {};
    D.PRODUCTS.forEach((p) => {
      const con = (p.stock ?? 0) > 0;
      const vo = {}; (p.variants || []).forEach((v) => { vo[v.label] = !v.oos; });
      items[p.id] = Object.keys(vo).length ? { in: con, variants: vo } : con;
    });
    await ghGhi('data/stock.json', b64(JSON.stringify({ ...cu, updatedAt: new Date().toISOString(), source: 'admin', note: 'true = con hang, false = het hang', items }, null, 2)),
      f ? f.sha : undefined, 'Quản trị: cập nhật tồn kho');
  }

  /* Tải ảnh từ máy lên thư mục img/ */
  async function taiAnh(file, tenFile) {
    const buf = await file.arrayBuffer(); const arr = new Uint8Array(buf);
    let bin = ''; for (let i = 0; i < arr.length; i += 8192) bin += String.fromCharCode.apply(null, arr.subarray(i, i + 8192));
    const duong = 'img/' + tenFile;
    let sha; try { sha = (await ghDoc(duong)).sha; } catch { sha = undefined; }
    await ghGhi(duong, btoa(bin), sha, 'Quản trị: tải ảnh ' + tenFile);
    return duong;
  }

  /* ---------------- Đăng ký module ---------------- */
  const MODULES = [];
  const NHOM = [
    { key: '', ten: '' },
    { key: 'ban-hang', ten: 'Bán hàng', icon: '🛍️' },
    { key: 'website', ten: 'Website', icon: '🎨' },
    { key: 'khach-hang', ten: 'Khách hàng', icon: '👥' },
    { key: 'he-thong', ten: 'Hệ thống', icon: '🔐' },
    { key: 'cau-hinh', ten: 'Cấu hình', icon: '⚙️' },
  ];
  function dangKy(mod) { MODULES.push(mod); }
  const timMod = (route) => MODULES.find((m) => m.route === route) || MODULES.find((m) => route.startsWith(m.route + '/'));

  /* ---------------- Router ---------------- */
  const duong = () => (location.hash || '#/tong-quan').replace(/^#/, '');
  function di(hash) { location.hash = hash.replace(/^#/, ''); }

  async function veTrang() {
    const r = duong();
    const mod = timMod(r);
    $$('#sidebar .nav__i').forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + (mod ? mod.route : '')));
    const main = $('#main');
    if (!mod) { main.innerHTML = trong('Không tìm thấy trang', 'Mục này không tồn tại.', '🧭'); return; }
    if (!co(mod.quyen)) { main.innerHTML = trong('Không có quyền truy cập', 'Tài khoản của bạn không được phép xem mục này.', '🔒'); return; }
    document.title = mod.ten + ' – Quản trị Hương Chất Kids';
    main.innerHTML = `<div class="page">
      <nav class="crumb"><a href="#/tong-quan">Quản trị</a>${mod.nhom ? `<span>›</span><span>${esc((NHOM.find((n) => n.key === mod.nhom) || {}).ten || '')}</span>` : ''}<span>›</span><span>${esc(mod.ten)}</span></nav>
      <div class="page__head"><div><h1>${mod.icon} ${esc(mod.ten)}</h1>${mod.mo ? `<p>${esc(mod.mo)}</p>` : ''}</div><div id="pageAct"></div></div>
      <div id="body"></div></div>`;
    const sub = r.slice(mod.route.length).replace(/^\//, '');
    PREVIEW && PREVIEW.hienKhi(typeof mod.preview === 'function' ? !!mod.preview(sub) : !!mod.preview);
    try { await mod.ve($('#body'), { sub }); }
    catch (e) { $('#body').innerHTML = loiTai(e.message); }
  }

  /* ---------------- Mảnh giao diện dùng chung ---------------- */
  const trong = (tieuDe, mo, icon = '📭') => `<div class="empty"><div class="emoji">${icon}</div><h3>${esc(tieuDe)}</h3><p>${esc(mo)}</p></div>`;
  const dangTai = (ten = 'dữ liệu') => `<div class="skel"><div class="skel__l" style="width:40%"></div><div class="skel__l"></div><div class="skel__l" style="width:80%"></div><p class="muted">Đang tải ${esc(ten)}…</p></div>`;
  const loiTai = (msg) => `<div class="card err-box"><h3>Không thể tải dữ liệu</h3><p>${esc(msg || 'Vui lòng thử lại.')}</p><button class="btn btn--primary" data-act="tai-lai">Thử lại</button></div>`;
  const the = (nhan, giaTri, phu = '', mau = '') => `<div class="kpi ${mau}"><span>${esc(nhan)}</span><b>${giaTri}</b>${phu ? `<small>${phu}</small>` : ''}</div>`;
  const badge = (text, kieu = '') => `<span class="tag ${kieu}">${esc(text)}</span>`;
  function sapXep(ds, khoa, nguoc) { return [...ds].sort((a, b) => { const x = a[khoa], y = b[khoa]; const r = typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'vi'); return nguoc ? -r : r; }); }

  /* Phân trang dùng chung */
  function phanTrang(tong, trang, moiTrang, id = 'pg') {
    const soTrang = Math.max(1, Math.ceil(tong / moiTrang));
    if (soTrang <= 1) return '';
    const nut = [];
    for (let i = 1; i <= soTrang; i++) {
      if (i === 1 || i === soTrang || Math.abs(i - trang) <= 1) nut.push(`<button class="pg__b ${i === trang ? 'is-on' : ''}" data-${id}="${i}">${i}</button>`);
      else if (Math.abs(i - trang) === 2) nut.push('<span class="pg__d">…</span>');
    }
    return `<div class="pg"><span class="muted">${tong} mục · trang ${trang}/${soTrang}</span><div class="pg__n">
      <button class="pg__b" data-${id}="${Math.max(1, trang - 1)}" ${trang === 1 ? 'disabled' : ''}>‹</button>
      ${nut.join('')}
      <button class="pg__b" data-${id}="${Math.min(soTrang, trang + 1)}" ${trang === soTrang ? 'disabled' : ''}>›</button></div></div>`;
  }

  /* ---------------- Layout ---------------- */
  function veKhung() {
    $('#app').innerHTML = `
      <a class="skip" href="#main">Bỏ qua, tới nội dung chính</a>
      <header class="top">
        <button class="icobtn top__burger" id="btnBurger" aria-label="Mở menu">☰</button>
        <a class="top__logo" href="#/tong-quan"><img src="img/logo-96.png" alt="" width="28" height="28"><b>Quản trị</b></a>
        <div class="search" id="searchBox">
          <input id="gSearch" placeholder="Tìm sản phẩm, đơn hàng, khách hàng…" autocomplete="off" aria-label="Tìm kiếm">
          <div class="search__kq hide" id="gKq"></div>
        </div>
        <span class="grow"></span>
        <span class="dot" id="ghDot" title="Kết nối GitHub"></span>
        <div class="bell" id="bellBox">
          <button class="icobtn" id="btnBell" aria-label="Thông báo">🔔<i class="bell__n hide" id="bellN"></i></button>
          <div class="pop hide" id="bellPop"></div>
        </div>
        <div class="who" id="whoBox">
          <button class="who__b" id="btnWho">👤 <span>${esc(nguoiDung.ten)}</span> ▾</button>
          <div class="pop hide" id="whoPop">
            <div class="pop__h"><b>${esc(nguoiDung.ten)}</b><small>${esc((VAI_TRO[nguoiDung.vaiTro] || {}).ten || '')}</small></div>
            <a class="pop__i" href="#/cau-hinh/github">🔑 Kết nối GitHub</a>
            <a class="pop__i" href="index.html" target="_blank" rel="noopener">🌐 Mở website</a>
            <button class="pop__i" data-act="thoat">🚪 Đăng xuất</button>
          </div>
        </div>
      </header>
      <div class="bar hide" id="bar"></div>
      <div class="wrap">
        <aside class="side" id="sidebar" aria-label="Menu quản trị">${veSidebar()}</aside>
        <div class="side__bd" id="sideBd"></div>
        <main class="main" id="main" tabindex="-1"></main>
        <aside class="pv hide" id="pv"></aside>
      </div>`;
    if (localStorage.getItem('hck_admin_thu') === '1') document.body.classList.add('thu');
  }
  function veSidebar() {
    let h = '<nav class="nav">';
    NHOM.forEach((n) => {
      const ds = MODULES.filter((m) => m.nhom === n.key && !m.an && co(m.quyen));
      if (!ds.length) return;
      if (n.ten) h += `<div class="nav__g"><span>${n.icon} ${esc(n.ten)}</span></div>`;
      ds.forEach((m) => {
        h += `<a class="nav__i" href="#${m.route}" data-tip="${esc(m.ten)}">
          <i>${m.icon}</i><span>${esc(m.ten)}</span>${m.giaiDoan ? `<em class="nav__soon" title="Sẽ có ở Phase ${m.giaiDoan}">P${m.giaiDoan}</em>` : ''}</a>`;
      });
    });
    h += '</nav><button class="nav__thu" id="btnThu" title="Thu gọn menu">⟨</button>';
    return h;
  }

  /* ---------------- Tìm kiếm toàn hệ thống ---------------- */
  const timKiem = tre((q) => {
    const box = $('#gKq'); if (!q.trim()) { box.classList.add('hide'); return; }
    const k = khongDau(q);
    const sp = (D.PRODUCTS || []).map((p, i) => ({ p, i }))
      .filter(({ p }) => khongDau(p.name + ' ' + (p.short || '') + ' ' + p.id).includes(k)).slice(0, 6);
    const mod = MODULES.filter((m) => co(m.quyen) && khongDau(m.ten).includes(k)).slice(0, 4);
    let h = '';
    if (sp.length) h += `<div class="search__g">Sản phẩm</div>` + sp.map(({ p, i }) =>
      `<a class="search__i" href="#/san-pham/${i}"><img src="${esc(p.thumb || p.image || '')}" alt="" onerror="this.style.visibility='hidden'"><span><b>${esc(p.short || p.name)}</b><small>${fmt(p.price)} · tồn ${p.stock ?? 0}</small></span></a>`).join('');
    if (mod.length) h += `<div class="search__g">Trang quản trị</div>` + mod.map((m) =>
      `<a class="search__i" href="#${m.route}"><span class="search__ic">${m.icon}</span><span><b>${esc(m.ten)}</b><small>${esc(m.mo || '')}</small></span></a>`).join('');
    if (!h) h = `<div class="search__none">Không tìm thấy “${esc(q)}”</div>`;
    box.innerHTML = h; box.classList.remove('hide');
  }, 300);

  /* ---------------- Trung tâm thông báo ---------------- */
  const TB = [];
  function thongBao() {
    TB.length = 0;
    const sapHet = (D.PRODUCTS || []).filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5);
    const het = (D.PRODUCTS || []).filter((p) => (p.stock ?? 0) <= 0 && !p.an);
    if (het.length) TB.push({ icon: '⛔', ten: `${het.length} sản phẩm đang hết hàng`, mo: het.slice(0, 3).map((p) => p.short || p.name).join(', '), di: '#/san-pham' });
    if (sapHet.length) TB.push({ icon: '📉', ten: `${sapHet.length} sản phẩm sắp hết`, mo: sapHet.slice(0, 3).map((p) => p.short || p.name).join(', '), di: '#/san-pham' });
    if (!ghToken()) TB.push({ icon: '🔑', ten: 'Chưa kết nối GitHub', mo: 'Chưa dán mã nên không xuất bản được thay đổi.', di: '#/cau-hinh/github' });
    if (daSua) TB.push({ icon: '📝', ten: 'Có thay đổi chưa xuất bản', mo: 'Bản nháp đang chờ xuất bản lên website.', di: duong() });
    const n = $('#bellN'); if (n) { n.textContent = TB.length; n.classList.toggle('hide', !TB.length); }
    const pop = $('#bellPop'); if (!pop) return;
    pop.innerHTML = `<div class="pop__h"><b>Thông báo</b><small>${TB.length} mục cần chú ý</small></div>`
      + (TB.length ? TB.map((t) => `<a class="pop__i pop__i--2" href="${t.di}"><span class="search__ic">${t.icon}</span><span><b>${esc(t.ten)}</b><small>${esc(t.mo)}</small></span></a>`).join('')
        : '<div class="pop__none">Mọi thứ đang ổn 👍</div>');
  }

  /* ---------------- Sự kiện chung ---------------- */
  function gan() {
    document.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (act) {
        const a = act.dataset.act;
        if (a === 'thoat') return thoat();
        if (a === 'xuat-ban') return xuatBan();
        if (a === 'bo-nhap') return hoi({ tieuDe: 'Huỷ thay đổi?', noiDung: 'Mọi thay đổi chưa xuất bản sẽ mất.', nutOk: 'Huỷ thay đổi', nguyHiem: true }).then((v) => { if (v) { boNhap(); toast('Đã huỷ thay đổi'); } });
        if (a === 'tai-lai') return veTrang();
      }
      if (e.target.closest('#btnThu')) { document.body.classList.toggle('thu'); localStorage.setItem('hck_admin_thu', document.body.classList.contains('thu') ? '1' : '0'); return; }
      if (e.target.closest('#btnBurger')) { document.body.classList.toggle('mo-side'); return; }
      if (e.target.id === 'sideBd') { document.body.classList.remove('mo-side'); return; }
      if (e.target.closest('#btnBell')) { thongBao(); $('#bellPop').classList.toggle('hide'); $('#whoPop').classList.add('hide'); return; }
      if (e.target.closest('#btnWho')) { $('#whoPop').classList.toggle('hide'); $('#bellPop').classList.add('hide'); return; }
      if (!e.target.closest('#bellBox')) $('#bellPop') && $('#bellPop').classList.add('hide');
      if (!e.target.closest('#whoBox')) $('#whoPop') && $('#whoPop').classList.add('hide');
      if (!e.target.closest('#searchBox')) $('#gKq') && $('#gKq').classList.add('hide');
      if (e.target.closest('.search__i') || e.target.closest('.pop__i')) { $('#gKq').classList.add('hide'); $('#bellPop').classList.add('hide'); $('#whoPop').classList.add('hide'); document.body.classList.remove('mo-side'); }
      if (e.target.closest('.nav__i')) document.body.classList.remove('mo-side');
    });
    document.addEventListener('input', (e) => { if (e.target.id === 'gSearch') timKiem(e.target.value); });
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); $('#gSearch') && $('#gSearch').focus(); }
      if (e.key === 'Escape') { $('#gKq') && $('#gKq').classList.add('hide'); $('#modal') && !$('#modal').classList.contains('hide') && $('#modal').querySelector('[data-no]') && $('#modal').querySelector('[data-no]').click(); }
    });
    window.addEventListener('hashchange', veTrang);
    window.addEventListener('offline', () => { const b = $('#bar'); if (!b) return; b.classList.remove('hide'); b.className = 'bar bar--err'; b.textContent = '📴 Mất kết nối mạng — thay đổi vẫn được giữ, nối mạng lại rồi hãy Xuất bản.'; });
    window.addEventListener('online', () => { veThanhLuu(); kiemTraGh(); });
    window.addEventListener('beforeunload', (e) => { if (daSua) { e.preventDefault(); e.returnValue = ''; } });
    window.addEventListener('error', (ev) => {
      /* "Script error." = lỗi trong script khác tên miền (VD phản hồi Apps Script về muộn) – không có thông tin gì, bỏ qua */
      if (!ev.lineno && /^Script error\.?$/i.test(ev.message || '')) return;
      const b = $('#bar'); if (!b) return;
      b.classList.remove('hide'); b.className = 'bar bar--err';
      b.textContent = '❌ Lỗi: ' + (ev.message || '') + (ev.lineno ? ' (dòng ' + ev.lineno + ')' : '');
    });
  }

  /* ---------------- Khởi động ---------------- */
  let PREVIEW = null;
  function datPreview(p) { PREVIEW = p; }

  function batDau() {
    veKhung(); gan(); napNhap(); kiemTraGh(); thongBao();
    PREVIEW && PREVIEW.dung();
    if (!location.hash) location.hash = '#/tong-quan';
    veTrang();
    setInterval(() => { if (!dangNhapHopLe()) thoat(); }, 60000);
  }

  return { $, $$, esc, fmt, gon, ngayISO, sao, hoan, tre, khongDau, REPO,
    toast, hoi, co, VAI_TRO, nguoiDung,
    api, adminKey, xacThuc, ghToken, ghDoc, ghGhi, b64, unb64, taiAnh, kiemTraGh,
    get D() { return D; }, get GOC() { return GOC; }, get daSua() { return daSua; },
    doiDuLieu, boNhap, daDoiGi, xuatBan, napNhap,
    dangKy, MODULES, NHOM, di, duong, veTrang, veSidebar,
    trong, dangTai, loiTai, the, badge, sapXep, phanTrang, thongBao,
    datPreview, batDau, dangNhapHopLe, ghiPhien, thoat, TAI_KHOAN };
})();
