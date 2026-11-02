/* =====================================================================
   ICON ƯU ĐÃI HÔM NAY – góc trái màn hình (mọi trang bán hàng, trừ giỏ hàng / thanh toán)
   - Tự lấy ưu đãi đang có từ data.js: sự kiện, giờ vàng, flash sale, quà tặng, mã giảm giá, freeship, điểm danh.
   - Rung nhẹ mỗi 8 giây khi có ưu đãi "nóng" (giờ vàng đang mở, sự kiện, chương trình quà…); ngày thường đứng yên.
   - Mây hội thoại tự hiện 1 lần mỗi lần truy cập (3 giây sau khi vào, ẩn sau 6 giây); máy tính rê chuột vào cũng hiện.
   - Kéo đi được (thả ra tự hít mép trái / phải, nhớ vị trí). ✕ = ẩn thành mẩu nhỏ ở mép đến lần truy cập sau.
   - Đếm lượt mở bảng / bấm từng ưu đãi (su = 'uudai') → Quản trị › Thống kê bán hàng.
   ===================================================================== */
(() => {
  if (!window.MC || window.top !== window || /(cart|checkout)\.html$/.test(location.pathname)) return;
  const { esc, fmt } = MC;
  const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { /* bỏ qua */ } }, del: (k) => { try { sessionStorage.removeItem(k); } catch { /* bỏ qua */ } } };
  const theo = (ct) => { try { MC.trackSu('uudai', ct); } catch { /* bỏ qua */ } };
  const wt = location.protocol === 'file:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname);   // máy thử không có link gọn
  const dm = (k) => wt ? 'collections.html?dm=' + k : '/' + k;
  const phut = (t) => { const m = String(t || '').match(/^(\d{1,2}):(\d{2})/); return m ? m[1] * 60 + Number(m[2]) : 0; };
  const hhmm = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return [s / 3600, s % 3600 / 60, s % 60].map((x) => String(Math.floor(x)).padStart(2, '0')).join(':'); };

  /* ---- Danh sách ưu đãi đang có ---- */
  function dsUuDai() {
    const now = Date.now(), ph = Math.floor((now + 7 * 3600e3) / 60000) % 1440, ngay = new Date(now + 7 * 3600e3).toISOString().slice(0, 10), ds = [];
    const sk = MC.suKienHien();
    if (sk) ds.push({ k: 'su-kien', ic: sk.icon || '🎉', nong: 1, chu: `<b>${esc(sk.ten)}</b>${sk.khau ? ' – ' + esc(sk.khau) : ''}`, may: `${sk.icon || '🎉'} ${sk.ten} – xem ưu đãi`, nut: 'Xem', link: 'index.html?tab=' + encodeURIComponent(sk.id) });
    (window.GIO_VANG || []).filter((g) => !g.tat && !(g.tuNgay && ngay < g.tuNgay) && !(g.denNgay && ngay > g.denNgay)).forEach((g) => {
      if (MC.gioVangChay(g)) ds.push({ k: 'gio-vang', ic: '⏰', nong: 1, chu: `<b>${esc(g.ten)} đang mở</b>: giảm ${g.giam}% đến ${esc(g.den)}`, may: `${g.ten} đang mở, giảm ${g.giam}% đến ${g.den} ⏰`, nut: 'Mua ngay', link: dm('khuyen-mai') });
      else if (ph < phut(g.tu) && !MC.suKienDangChay()) ds.push({ k: 'gio-vang', ic: '⏰', chu: `${esc(g.ten)} <b>${esc(g.tu)}–${esc(g.den)}</b> hôm nay: giảm ${g.giam}%`, nut: 'Xem', link: dm('khuyen-mai') });
    });
    const soFlash = (window.PRODUCTS || []).filter((p) => !p.an && (p.tags || []).includes('Sản phẩm hot')).length;
    const hetFlash = SITE.flashSaleEnd === 'daily' ? () => { const e = new Date(); e.setHours(24, 0, 0, 0); return e.getTime(); } : () => Date.parse(SITE.flashSaleEnd);
    if (soFlash && SITE.flashSaleEnd && now >= (SITE.flashSaleStart ? Date.parse(SITE.flashSaleStart) : 0) && now < hetFlash())
      ds.push({ k: 'flash', ic: '⚡', nong: SITE.flashSaleEnd !== 'daily', chu: `<b>Flash sale</b> ${soFlash} sản phẩm · còn <b data-ud-dem>${hhmm(hetFlash() - now)}</b>`, may: 'Flash sale hôm nay ⚡ xem ngay', nut: 'Xem', link: dm('flash-sale'), het: hetFlash });
    MC.ctDangChay().forEach((x) => ds.push({ k: 'qua', ic: '🎁', nong: 1, chu: esc(MC.ctMoTa(x)), nut: 'Xem', link: dm('khuyen-mai') }));
    const qt = window.QUA_TANG, don = (qt && qt.donTu) || {};
    if (qt && qt.enabled && don.muc && don.soQua && !MC.suKienDangChay())
      ds.push({ k: 'qua-don', ic: '🎁', chu: `Đơn từ <b>${fmt(don.muc)}</b> tặng <b>${don.soQua} ${esc(qt.ten)}</b>${don.chiKhachMoi ? ' (khách mới)' : ''}`, nut: 'Xem', link: dm('khuyen-mai') });
    const s = MC.Session.get();
    MC.couponsFor(s && (s.kh || s)).filter((c) => c.type !== 'ship').slice(0, 2)
      .forEach((c) => ds.push({ k: 'ma', ic: '🎟️', chu: `Mã <b>${esc(c.ma)}</b>: ${esc(c.desc || c.ten)}`, ma: c.ma, nut: MC.ViMa.co(c.ma) ? 'Đã lưu' : 'Lưu mã', link: 'vi-voucher.html' }));
    if (SITE.freeshipFrom) ds.push({ k: 'freeship', ic: '🚚', chu: `Freeship đơn từ <b>${fmt(SITE.freeshipFrom)}</b>`, dem: false });
    ds.push({ k: 'diem-danh', ic: '✅', chu: 'Điểm danh mỗi ngày nhận điểm thưởng', nut: 'Vào', link: 'diem-danh.html', dem: false });
    return ds;
  }

  /* Hộp quà vàng bóng (SVG, không cần tải ảnh) */
  const HOP = `<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="udV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".45" stop-color="#FFC93C"/><stop offset="1" stop-color="#D98B00"/></linearGradient>
    <linearGradient id="udN" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E8344F"/><stop offset=".5" stop-color="#FF6F86"/><stop offset="1" stop-color="#C81E3A"/></linearGradient></defs>
    <path d="M24 13c-3-6-11-7-11-2 0 3 5 4 11 2zm0 0c3-6 11-7 11-2 0 3-5 4-11 2z" fill="url(#udN)"/>
    <rect x="7" y="13" width="34" height="9" rx="2.5" fill="url(#udV)" stroke="#B87400" stroke-width=".8"/><rect x="9.5" y="22" width="29" height="19" rx="2.5" fill="url(#udV)" stroke="#B87400" stroke-width=".8"/>
    <rect x="21" y="13" width="6" height="28" fill="url(#udN)"/><path d="M10 15h14v3H11q-1-1.5-1-3z" fill="#fff" opacity=".55"/><path d="M12 24h5v12h-3q-2-5-2-12z" fill="#fff" opacity=".35"/></svg>`;
  /* ---- Giao diện ---- */
  const ds = dsUuDai(), so = ds.filter((x) => x.dem !== false).length, nong = ds.some((x) => x.nong);
  const may = (ds.find((x) => x.nong && x.may) || {}).may || (so ? `Hôm nay có ${so} ưu đãi cho mẹ nè 🎁` : 'Xem ưu đãi hôm nay cho mẹ 🎁');
  const goc = document.createElement('div');
  goc.className = 'ud';
  goc.innerHTML = `<button class="ud__nut" type="button" aria-label="Ưu đãi hôm nay" aria-expanded="false">${HOP}${so ? `<b>${so > 9 ? '9+' : so}</b>` : ''}</button>
    <button class="ud__an" type="button" aria-label="Ẩn ưu đãi">✕</button>
    <div class="ud__may" role="status"><span>${esc(may)}</span><button type="button" aria-label="Đóng">✕</button></div>`;
  const tab = document.createElement('button');
  tab.className = 'ud-tab'; tab.type = 'button'; tab.setAttribute('aria-label', 'Hiện ưu đãi hôm nay'); tab.innerHTML = HOP.replace(/udV/g, 'udV2').replace(/udN/g, 'udN2');
  const bang = document.createElement('div');
  bang.className = 'ud-bang'; bang.setAttribute('role', 'dialog'); bang.setAttribute('aria-label', 'Ưu đãi hôm nay');
  bang.innerHTML = `<div class="ud-bang__dau"><b>Ưu đãi hôm nay</b><button type="button" data-ud-dong aria-label="Đóng">✕</button></div>
    <ul>${ds.map((x, i) => `<li><span class="ud-bang__ic" aria-hidden="true">${x.ic}</span><span class="ud-bang__chu">${x.chu}</span>${x.nut ? (x.ma
      ? `<button type="button" class="ud-bang__nut" data-ud-ma="${esc(x.ma)}" data-i="${i}">${x.nut}</button>`
      : `<a class="ud-bang__nut" href="${esc(x.link)}" data-i="${i}">${x.nut}</a>`) : ''}</li>`).join('')}</ul>
    <a class="ud-bang__tat" href="${dm('khuyen-mai')}" data-i="-1">Xem tất cả khuyến mãi →</a>`;
  document.body.append(goc, tab, bang);
  const nut = goc.querySelector('.ud__nut'), mayEl = goc.querySelector('.ud__may');

  /* ---- Vị trí: mép trái / phải + độ cao (0 = trên cùng, 1 = dưới cùng vùng được phép) ---- */
  let vt = MC.store.get('hck_ud_vt', null) || { ben: 'trai', y: 1 };
  const coThanhDuoi = () => innerWidth < 992;
  function vung() {
    const co = nut.offsetWidth || 50, sb = document.getElementById('stickyBuy');
    let duoi = innerHeight - 14 - co - (coThanhDuoi() ? 62 : 0);
    if (sb && sb.classList.contains('is-visible')) duoi -= sb.offsetHeight;
    if (vt.ben === 'phai') duoi -= 70;   // chừa nút chat ở góc phải
    return { tren: coThanhDuoi() ? 70 : 90, duoi, co };
  }
  function datViTri() {
    const v = vung(), y = Math.round(v.tren + (Math.max(v.duoi, v.tren) - v.tren) * Math.min(1, Math.max(0, vt.y)));
    goc.style.top = y + 'px'; goc.style.left = goc.style.right = '';
    goc.style[vt.ben === 'phai' ? 'right' : 'left'] = (coThanhDuoi() ? 12 : 20) + 'px';
    goc.classList.toggle('ud--phai', vt.ben === 'phai'); tab.classList.toggle('ud-tab--phai', vt.ben === 'phai');
    tab.style.top = y + 'px';
    if (bang.classList.contains('is-mo')) datBang();
  }
  function datBang() {
    if (innerWidth < 768) { bang.style.cssText = ''; return; }   // điện thoại: tấm trượt từ dưới (CSS)
    const r = nut.getBoundingClientRect(), s = bang.style;
    s.left = s.right = s.top = s.bottom = '';
    s[vt.ben === 'phai' ? 'right' : 'left'] = (vt.ben === 'phai' ? innerWidth - r.right : r.left) + 'px';
    if (r.top > innerHeight / 2) s.bottom = (innerHeight - r.top + 10) + 'px'; else s.top = (r.bottom + 10) + 'px';
  }

  /* ---- Mây hội thoại ---- */
  let hMay = 0;
  const hienMay = (giay) => { if (goc.classList.contains('ud--mo') || ss.get('hck_ud_an')) return; goc.classList.add('ud--may'); clearTimeout(hMay); if (giay) hMay = setTimeout(anMay, giay * 1000); };
  const anMay = () => { clearTimeout(hMay); goc.classList.remove('ud--may'); };
  mayEl.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); anMay(); });
  mayEl.querySelector('span').addEventListener('click', () => moBang(true));
  if (matchMedia('(hover: hover)').matches) { nut.addEventListener('mouseenter', () => hienMay(0)); nut.addEventListener('mouseleave', () => { hMay = setTimeout(anMay, 800); }); }

  /* ---- Bảng ưu đãi ---- */
  let dem = 0;
  function moBang(mo) {
    goc.classList.toggle('ud--mo', mo); bang.classList.toggle('is-mo', mo); nut.setAttribute('aria-expanded', String(mo));
    clearInterval(dem);
    if (!mo) return;
    anMay(); datBang(); theo('mo');
    const f = ds.find((x) => x.het), o = bang.querySelector('[data-ud-dem]');
    if (f && o) dem = setInterval(() => { o.textContent = hhmm(f.het() - Date.now()); }, 1000);
  }
  bang.addEventListener('click', (e) => {
    if (e.target.closest('[data-ud-dong]')) return moBang(false);
    const a = e.target.closest('[data-i]'); if (!a) return;
    const x = ds[Number(a.dataset.i)]; theo(x ? x.k : 'tat-ca');
    if (a.dataset.udMa) { MC.ViMa.luu(a.dataset.udMa); a.textContent = 'Đã lưu'; MC.toast('Đã lưu mã ' + a.dataset.udMa + ' – web tự áp khi thanh toán', { type: 'ok' }); }
  });
  document.addEventListener('pointerdown', (e) => { if (bang.classList.contains('is-mo') && !bang.contains(e.target) && !goc.contains(e.target)) moBang(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') moBang(false); });

  /* ---- Kéo di chuyển (chạm nhẹ = mở bảng) ---- */
  let keo = null;
  nut.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    const r = goc.getBoundingClientRect(); keo = { x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, di: false };
    nut.setPointerCapture(e.pointerId);
  });
  nut.addEventListener('pointermove', (e) => {
    if (!keo) return;
    if (!keo.di && Math.hypot(e.clientX - keo.x, e.clientY - keo.y) < 8) return;
    if (!keo.di) { keo.di = true; anMay(); moBang(false); goc.classList.add('ud--keo'); }
    goc.style.right = ''; goc.style.left = Math.min(innerWidth - nut.offsetWidth, Math.max(0, e.clientX - keo.dx)) + 'px'; goc.style.top = Math.min(innerHeight - nut.offsetHeight, Math.max(0, e.clientY - keo.dy)) + 'px';
  });
  const tha = (e) => {
    if (!keo) return; const k = keo; keo = null; goc.classList.remove('ud--keo');
    if (!k.di) { if (e.type === 'pointerup') moBang(!bang.classList.contains('is-mo')); return; }
    const r = goc.getBoundingClientRect(); vt.ben = r.left + r.width / 2 < innerWidth / 2 ? 'trai' : 'phai';
    const v = vung(); vt.y = v.duoi > v.tren ? (r.top - v.tren) / (v.duoi - v.tren) : 1; vt.y = Math.min(1, Math.max(0, vt.y));
    MC.store.set('hck_ud_vt', vt); datViTri();
  };
  nut.addEventListener('pointerup', tha); nut.addEventListener('pointercancel', tha);
  nut.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); moBang(!bang.classList.contains('is-mo')); } });
  nut.addEventListener('click', (e) => e.preventDefault());

  /* ---- Ẩn đến lần truy cập sau ---- */
  const capNhatAn = () => { const an = !!ss.get('hck_ud_an'); goc.hidden = an; tab.hidden = !an; if (an) { anMay(); moBang(false); } };
  goc.querySelector('.ud__an').addEventListener('click', () => { ss.set('hck_ud_an', '1'); theo('an'); capNhatAn(); });
  tab.addEventListener('click', () => { ss.del('hck_ud_an'); capNhatAn(); datViTri(); hienMay(4); });

  /* ---- Rung nhẹ khi có ưu đãi nóng ---- */
  if (nong && !matchMedia('(prefers-reduced-motion: reduce)').matches)
    setInterval(() => { if (goc.hidden || goc.classList.contains('ud--mo') || document.hidden) return; nut.classList.remove('ud--rung'); void nut.offsetWidth; nut.classList.add('ud--rung'); }, 8000);

  capNhatAn(); datViTri();
  let hRaf = 0; const veLai = () => { cancelAnimationFrame(hRaf); hRaf = requestAnimationFrame(datViTri); };
  addEventListener('resize', veLai); addEventListener('scroll', veLai, { passive: true });
  if (!ss.get('hck_ud_may')) setTimeout(() => { ss.set('hck_ud_may', '1'); hienMay(6); }, 3000);
})();
