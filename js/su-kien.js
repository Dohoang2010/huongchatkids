/* ===== TAB SỰ KIỆN TRÊN TRANG CHỦ (vd Siêu sale 10.10) =====
   Dữ liệu: window.SU_KIEN trong js/data.js. Tự hiện từ hienTu, tự biến mất sau ketThuc.
   - Trong ngày sự kiện (batDau → ketThuc) trang chủ mở sẵn tab sự kiện; khách bấm "Trang chủ" để xem như thường.
   - 2 banner sự kiện được chèn lên đầu băng chuyền banner trang chủ.
   Chương trình quà của sự kiện tính ở js/app.js (QUA_TANG.chuongTrinh có suKien = id). */
(() => {
  'use strict';
  const MC = window.MC; if (!MC || !MC.suKienHien) return;
  const sk = MC.suKienHien(); if (!sk) return;
  const { esc } = MC;
  const bd = Date.parse(sk.batDau), kt = Date.parse(sk.ketThuc);

  /* Banner sự kiện lên đầu băng chuyền (trang chủ vẽ từ window.BANNERS) */
  if (Array.isArray(sk.banners) && Array.isArray(window.BANNERS)) window.BANNERS = sk.banners.map((b) => ({ anh: b, link: b.link, alt: b.alt })).concat(window.BANNERS);

  const KHOA = 'hck_sk_tab_' + sk.id;
  const chonTab = () => {
    const q = new URLSearchParams(location.search).get('tab');
    if (q === sk.id || q === 'home') { try { sessionStorage.setItem(KHOA, q); } catch { /* chế độ riêng tư */ } return q; }
    let luu = ''; try { luu = sessionStorage.getItem(KHOA) || ''; } catch { /* bỏ qua */ }
    if (luu) return luu;
    return Date.now() >= bd ? sk.id : 'home';   // ngày sự kiện: mở sẵn tab sự kiện
  };

  const dem = (el) => {
    const tick = () => {
      const n = Date.now(), toi = n < bd ? bd : kt, d = Math.max(0, toi - n);
      if (n >= kt) { el.closest('.sk-head').querySelector('.sk-dem__nhan').textContent = 'Chương trình đã kết thúc'; el.innerHTML = ''; return; }
      const ngay = Math.floor(d / 864e5), h = Math.floor(d % 864e5 / 36e5), m = Math.floor(d % 36e5 / 6e4), s = Math.floor(d % 6e4 / 1e3);
      const o = (v, t) => `<span><b>${String(v).padStart(2, '0')}</b><small>${t}</small></span>`;
      el.innerHTML = (ngay ? o(ngay, 'ngày') : '') + o(h, 'giờ') + o(m, 'phút') + o(s, 'giây');
      el.closest('.sk-head').querySelector('.sk-dem__nhan').textContent = n < bd ? 'Bắt đầu sau' : 'Kết thúc sau';
    };
    tick(); setInterval(tick, 1000);
  };

  function noiDung() {
    const { byId, productCard } = MC;
    const dangChay = Date.now() >= bd;
    /* Thẻ cuối hàng dẫn sang trang tất cả sản phẩm – để khách không dừng ở 4 món */
    const the = (x) => `<a class="sk-them" href="${esc(x.link)}">
      <span class="sk-them__ico">${esc(x.icon || '🛍️')}</span>
      <b>${esc(x.chu || 'Xem tất cả sản phẩm')}</b>
      <small>${esc(x.mo || 'Xem toàn bộ danh mục')}</small>
      <span class="sk-them__nut">Xem ngay →</span></a>`;
    const khoi = (sk.khoi || []).map((k, i) => {
      /* Khối ảnh (vd ảnh ưu đãi mỹ phẩm): { anh, alt, link } */
      if (k.anh) return `<section class="sk-khoi sk-khoi--anh">${k.link ? `<a href="${esc(k.link)}">` : ""}<img src="${esc(k.anh)}" alt="${esc(k.alt || sk.ten)}" loading="lazy" width="1080" height="1350">${k.link ? "</a>" : ""}</section>`;
      const sp = (k.sp || []).map(byId).filter((p) => p && !p.an);
      return `<section class="sk-khoi sk-khoi--${i % 3}${sp.length ? '' : ' sk-khoi--chu'}">
        <div class="sk-khoi__dau">
          <div class="sk-khoi__nhan">${k.icon ? `<i class="sk-khoi__ico" aria-hidden="true">${esc(k.icon)}</i>` : ''}<span>${esc(k.nhan)}</span>${k.huyHieu ? `<em>${esc(k.huyHieu)}</em>` : ''}</div>
          <h2>${esc(k.tieuDe)}</h2>
          ${k.noiBat ? `<div class="sk-khoi__noibat">${esc(k.noiBat)}</div>` : ''}
          <ul class="sk-khoi__dong">${(k.dong || []).map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
          ${k.ghiChu ? `<small class="sk-khoi__ghichu">${esc(k.ghiChu)}</small>` : ''}
          ${k.nut ? `<a class="btn btn--primary btn--sm sk-khoi__nut" href="${esc(k.nut.link)}">${esc(k.nut.chu)}</a>` : ''}
          ${k.xem ? `<a class="btn btn--ghost btn--sm sk-khoi__xem" href="${esc(k.xem.link)}">${esc(k.xem.chu || 'Xem tất cả sản phẩm')} →</a>` : ''}
        </div>
        ${sp.length ? `<div class="row-scroll sk-khoi__sp">${sp.map((p) => productCard(p)).join('')}${k.xem ? the(k.xem) : ''}</div>` : ''}
      </section>`;
    }).join('');
    const ma = MC.maCongKhai().filter((c) => !(c.donDau && MC.daMuaTruoc((MC.Customer.get() || {}).phone)));
    const hot = PRODUCTS.filter((p) => !p.an && (p.tags || []).includes('Sản phẩm hot')).sort(MC.rankDefault).slice(0, 8);
    return `<div class="container">
      <div class="sk-head">
        <a class="sk-head__poster" href="${esc(sk.poster)}" target="_blank" rel="noopener"><img src="${esc(sk.poster)}" alt="${esc(sk.ten)} – ${esc(sk.khau)}" width="1080" height="1350"></a>
        <div class="sk-head__chu">
          <span class="sk-head__trang">${dangChay ? (sk.icon || '🔥') + ' Đang diễn ra' : '⏰ Sắp diễn ra'}</span>
          <h1><small>${esc(sk.ten.replace(sk.nhan, '').trim() || 'Siêu sale')}</small>${esc(sk.nhan)}</h1>
          <p class="sk-head__khau">${esc(sk.khau)}</p>
          <div class="sk-dem"><span class="sk-dem__nhan"></span><div class="sk-dem__so" id="skDem"></div></div>
          ${sk.loiChuc ? `<p class="sk-head__chuc">${esc(sk.loiChuc)}</p>` : ''}
          <ul class="sk-head__luat">
            <li>Ưu đãi áp dụng từ 0h đến 24h ngày ${new Date(bd + 7 * 36e5).getUTCDate()}/${new Date(bd + 7 * 36e5).getUTCMonth() + 1}.</li>
            ${(sk.luat || ['Các chương trình không cộng dồn – mỗi đơn hàng tự nhận ưu đãi của 1 chương trình có lợi nhất.', 'Trong ngày sự kiện, các chương trình quà tặng ngày thường tạm dừng.']).map((x) => `<li>${esc(x)}</li>`).join('')}
          </ul>
        </div>
      </div>
      ${khoi}
      ${ma.length ? `<section class="sk-khoi sk-khoi--ma"><div class="sk-khoi__dau"><h2>🎟️ Voucher dùng được hôm nay</h2><small class="sk-khoi__ghichu">Bấm Lưu – web tự áp mã lợi nhất khi thanh toán. Mã giảm tiền không dùng chung với quà tặng (trừ mã miễn phí vận chuyển).</small></div><div class="vstrip__row">${ma.map(MC.voucherTicket).join('')}</div></section>` : ''}
      ${hot.length ? `<section class="sk-goiy"><h2>Gợi ý cho bạn</h2><div class="grid grid--4">${hot.map((p) => productCard(p)).join('')}</div></section>` : ''}
    </div>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app'); if (!app) return;
    /* máy chủ đã giữ sẵn chỗ cho thanh tab → thay vào đúng chỗ, trang không bị xô */
    const cho = app.querySelector('.sk-tabs-cho'); if (cho) cho.remove();
    app.insertAdjacentHTML('afterbegin', `<div class="sk-tabs"><div class="container sk-tabs__in" role="tablist">
        <button type="button" role="tab" data-sk-tab="home">🏠 Trang chủ</button>
        <button type="button" role="tab" data-sk-tab="${esc(sk.id)}" class="sk-tabs__sk"><b>${sk.icon || '⚡'} ${esc(sk.nhan)}</b><small>${esc(sk.ten.replace(sk.nhan, '').trim() || 'Sale')}</small></button>
      </div></div>
      <div class="sk sk--${esc(sk.id)}" id="skTab" hidden></div>`);
    app.querySelector('.sk-tabs').classList.add('sk-tabs--' + sk.id);
    const tab = document.getElementById('skTab'); let daVe = false;
    const dat = (t, cuon) => {
      const la = t === sk.id;
      if (la && !daVe) { tab.innerHTML = noiDung(); dem(document.getElementById('skDem')); MC.autoScrollRow && tab.querySelectorAll('.sk-khoi__sp').forEach((r) => MC.autoScrollRow(r)); daVe = true; }
      tab.hidden = !la; document.body.classList.toggle('sk-on', la);
      app.querySelectorAll('[data-sk-tab]').forEach((b) => { const on = b.dataset.skTab === t; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on ? 'true' : 'false'); });
      if (cuon) window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    app.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sk-tab]'); if (!b) return;
      try { sessionStorage.setItem(KHOA, b.dataset.skTab); } catch { /* bỏ qua */ }
      dat(b.dataset.skTab, true);
    });
    dat(chonTab(), false);
  });
})();
