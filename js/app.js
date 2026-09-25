/* =====================================================================
   HƯƠNG CHẤT KIDS – Lõi giao diện dùng chung cho mọi trang
   - Header / mega menu / mobile menu / tìm kiếm gợi ý
   - Giỏ hàng (localStorage) + drawer
   - Mua nhanh 1-chạm (Quick Buy), Gọi lại, Đặt qua Zalo
   - Ảnh minh hoạ sản phẩm tự sinh (SVG) khi chưa có ảnh thật
   - Footer, floating contact, bottom nav (mobile), toast
   ===================================================================== */
(function () {
  'use strict';

  /* ---------------- Utilities ---------------- */
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const fmt = (n) => (Math.round(n) || 0).toLocaleString('vi-VN') + '₫';
  const pct = (p) => (p.oldPrice && p.oldPrice > p.price) ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const param = (k) => new URLSearchParams(location.search).get(k);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const brandOf = (p) => BRANDS.find((b) => b.key === p.brand) || { label: p.brand, color: '#888' };
  const ageLabel = (k) => (AGES.find((a) => a.key === k) || {}).label || k;
  /* Gộp dải tuổi: ['6-12m','1-3y','3-6y'] -> '6 tháng – 6 tuổi'; ['0-6m','6-12m'] -> '0–12 tháng' */
  const ageRange = (ages) => {
    if (!ages || !ages.length) return '';
    if (ages.length === 1) return ageLabel(ages[0]);
    const first = ageLabel(ages[0]), last = ageLabel(ages[ages.length - 1]);
    const start = first.split('–')[0].trim(), end = last.split('–')[1].trim();
    const u1 = first.includes('tháng') ? 'tháng' : 'tuổi', u2 = last.includes('tháng') ? 'tháng' : 'tuổi';
    if (u1 === u2) return `${start}–${end}`;
    return (start === '0' ? 'Sơ sinh' : `${start} ${u1}`) + ` – ${end}`;
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const phoneOk = (v) => /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(String(v).replace(/[\s.-]/g, ''));
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ---------------- Icons (Feather-style, stroke) ---------------- */
  const ic = (d, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
  const I = {
    search: ic('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    cart: ic('<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>'),
    user: ic('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
    phone: ic('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
    menu: ic('<path d="M3 6h18M3 12h18M3 18h18"/>'),
    close: ic('<path d="M18 6 6 18M6 6l12 12"/>'),
    chevron: ic('<path d="m6 9 6 6 6-6"/>'),
    chevronR: ic('<path d="m9 18 6-6-6-6"/>'),
    chevronL: ic('<path d="m15 18-6-6 6-6"/>'),
    arrowR: ic('<path d="M5 12h14M12 5l7 7-7 7"/>'),
    arrowUp: ic('<path d="M12 19V5M5 12l7-7 7 7"/>'),
    star: ic('<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'),
    heart: ic('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>'),
    truck: ic('<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'),
    shield: ic('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>'),
    refresh: ic('<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.8-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>'),
    check: ic('<path d="M20 6 9 17l-5-5"/>'),
    checkCircle: ic('<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14l-3-3"/>'),
    plus: ic('<path d="M12 5v14M5 12h14"/>'),
    minus: ic('<path d="M5 12h14"/>'),
    home: ic('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>'),
    grid: ic('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>'),
    filter: ic('<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>'),
    trash: ic('<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>'),
    tag: ic('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7" cy="7" r="1.5"/>'),
    gift: ic('<path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zm0 0h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>'),
    clock: ic('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
    zap: ic('<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>'),
    mapPin: ic('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
    mail: ic('<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="m22 6-10 7L2 6"/>'),
    headset: ic('<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'),
    phoneCall: ic('<path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94"/><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>'),
    messenger: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.1 2 11.3c0 2.9 1.4 5.5 3.7 7.2V22l3.4-1.9c.9.3 1.9.4 2.9.4 5.5 0 10-4.1 10-9.3S17.5 2 12 2zm1 12.4-2.6-2.7-5 2.7 5.5-5.8 2.6 2.7 4.9-2.7-5.4 5.8z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>',
    instagram: ic('<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>'),
    youtube: ic('<path d="M22.5 6.4a2.8 2.8 0 0 0-2-2C18.8 4 12 4 12 4s-6.8 0-8.5.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1 12a29 29 0 0 0 .5 5.6 2.8 2.8 0 0 0 2 2C5.2 20 12 20 12 20s6.8 0 8.5-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 23 12a29 29 0 0 0-.5-5.6z"/><path d="m9.8 15.5 5.7-3.5-5.7-3.5z" fill="currentColor"/>'),
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z"/></svg>',
    file: ic('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>'),
    award: ic('<circle cx="12" cy="8" r="6"/><path d="M15.5 13 17 22l-5-3-5 3 1.5-9"/>'),
    package: ic('<path d="m16.5 9.4-9-5.2M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z"/><path d="M3.3 7 12 12l8.7-5M12 22V12"/>'),
    external: ic('<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>'),
  };
  const starRow = (n, total = 5) => Array.from({ length: total }, (_, i) => `<span style="opacity:${i < Math.round(n) ? 1 : .25}">${I.star}</span>`).join('');

  /* ---------------- Ảnh minh hoạ sản phẩm (SVG) ---------------- */
  function hexToRgb(h) { const n = parseInt(h.replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(h, t, w) { const [r, g, b] = hexToRgb(h); const [r2, g2, b2] = hexToRgb(t); const m = (a, c) => Math.round(a + (c - a) * w); return `rgb(${m(r, r2)},${m(g, g2)},${m(b, b2)})`; }
  function wrap(text, max) { const words = text.split(' '); const lines = []; let cur = ''; for (const w of words) { if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) lines.push(cur); return lines.slice(0, 2); }
  function productImage(p, v = 0, forceGen = false) {
    if (!forceGen) {
      if (p.images && p.images[v]) return p.images[v];
      if (p.image && v === 0) return p.image;
    }
    const c = p.color || '#F0537A';
    const dark = mix(c, '#000000', .28), light = mix(c, '#ffffff', .3);
    const bgs = [mix(c, '#ffffff', .9), mix(c, '#ffffff', .84), '#F7F6F8'];
    const bg = bgs[v % bgs.length];
    const brand = brandOf(p).label.toUpperCase();
    const lines = wrap(p.short || p.name, 16);
    const age = ageRange(p.ages);
    const rot = v === 1 ? 'rotate(-6 200 220)' : v === 2 ? 'rotate(5 200 220)' : '';
    const label = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#fff" opacity=".96"/>
      <text x="200" y="${y + 26}" text-anchor="middle" font-family="Quicksand, Arial, sans-serif" font-weight="800" font-size="13" fill="${dark}" letter-spacing="1.5">${esc(brand)}</text>
      <line x1="${x + 24}" y1="${y + 36}" x2="${x + w - 24}" y2="${y + 36}" stroke="${light}" stroke-width="2"/>
      ${lines.map((l, i) => `<text x="200" y="${y + 60 + i * 20}" text-anchor="middle" font-family="Be Vietnam Pro, Arial, sans-serif" font-weight="700" font-size="15" fill="#22202A">${esc(l)}</text>`).join('')}
      <text x="200" y="${y + h - 14}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#8A8794">${esc(p.weight || '')}</text>`;
    const agePill = age ? `<rect x="120" y="345" width="160" height="26" rx="13" fill="${dark}"/><text x="200" y="363" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="12" fill="#fff">${esc(age)}</text>` : '';
    let body = '';
    switch (p.shape) {
      case 'bottle':
        body = `<g transform="${rot}"><rect x="170" y="52" width="60" height="30" rx="6" fill="${dark}"/><path d="M160 90 h80 v40 q0 10 10 12 v186 q0 12 -12 12 h-76 q-12 0 -12 -12 v-186 q10 -2 10 -12 z" fill="url(#g)"/>${label(126, 160, 148, 130)}</g>`; break;
      case 'jar':
        body = `<g transform="${rot}"><rect x="110" y="60" width="180" height="46" rx="12" fill="${dark}"/><rect x="118" y="72" width="164" height="8" rx="4" fill="${mix(c, '#000', .4)}"/><rect x="100" y="104" width="200" height="230" rx="26" fill="url(#g)"/>${label(122, 150, 156, 132)}</g>`; break;
      case 'carton':
        body = `<g transform="${rot}"><path d="M110 120 l90 -40 l90 40 v210 q0 12 -12 12 h-156 q-12 0 -12 -12 z" fill="url(#g)"/><path d="M110 120 l90 -40 l90 40 z" fill="${light}"/><path d="M200 80 v40" stroke="${dark}" stroke-width="3"/>${label(126, 160, 148, 130)}</g>`; break;
      case 'box':
        body = `<g transform="${rot}"><rect x="90" y="90" width="220" height="250" rx="14" fill="url(#g)"/><rect x="90" y="90" width="220" height="34" rx="14" fill="${dark}"/><rect x="90" y="110" width="220" height="14" fill="${dark}"/>${label(112, 150, 176, 140)}</g>`; break;
      default: /* can */
        body = `<g transform="${rot}"><ellipse cx="200" cy="336" rx="102" ry="20" fill="${dark}"/><rect x="98" y="96" width="204" height="240" fill="url(#g)"/><ellipse cx="200" cy="96" rx="102" ry="22" fill="#E6E6EA"/><rect x="98" y="76" width="204" height="20" fill="#D6D6DC"/><ellipse cx="200" cy="76" rx="102" ry="22" fill="#F5F5F8"/><ellipse cx="200" cy="76" rx="84" ry="15" fill="#E9E9EE"/>${label(118, 150, 164, 132)}</g>`;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="${dark}"/><stop offset=".45" stop-color="${c}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs><rect width="400" height="400" fill="${bg}"/><circle cx="330" cy="70" r="90" fill="#fff" opacity=".35"/><ellipse cx="200" cy="372" rx="130" ry="12" fill="#000" opacity=".07"/>${body}${agePill}</svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------------- Cart ---------------- */
  const Cart = {
    key: 'mc_cart',
    items() { return store.get(this.key, []); },
    save(items) { store.set(this.key, items); updateCartBadges(); document.dispatchEvent(new CustomEvent('cart:change')); },
    add(id, qty = 1, variant = null) {
      const p = byId(id); if (!p) return;
      const items = this.items();
      const vKey = variant != null ? String(variant) : '';
      const line = items.find((i) => i.id === id && (i.variant ?? '') === vKey);
      if (line) line.qty = Math.min(99, line.qty + qty); else items.push({ id, qty, variant: vKey });
      this.save(items);
    },
    setQty(id, variant, qty) {
      let items = this.items();
      const line = items.find((i) => i.id === id && (i.variant ?? '') === (variant ?? ''));
      if (!line) return;
      if (qty <= 0) items = items.filter((i) => i !== line); else line.qty = Math.min(99, qty);
      this.save(items);
    },
    remove(id, variant) { this.save(this.items().filter((i) => !(i.id === id && (i.variant ?? '') === (variant ?? '')))); },
    clear() { this.save([]); },
    lines() {
      return this.items().map((i) => {
        const p = byId(i.id); if (!p) return null;
        const v = i.variant !== '' && p.variants ? p.variants[Number(i.variant)] : null;
        return { ...i, p, name: p.name, variantLabel: v ? v.label : '', price: v ? v.price : p.price, oldPrice: v ? v.oldPrice : p.oldPrice, total: (v ? v.price : p.price) * i.qty };
      }).filter(Boolean);
    },
    count() { return this.items().reduce((s, i) => s + i.qty, 0); },
    subtotal() { return this.lines().reduce((s, l) => s + l.total, 0); },
    /* Ưu đãi "mua từ 2 giảm 3%": tính theo từng dòng có số lượng ≥ 2 */
    multiDiscount() { return this.lines().reduce((s, l) => s + (l.qty >= 2 ? Math.round(l.total * MULTI_RATE) : 0), 0); },
  };
  const MULTI_RATE = 0.03;
  const Customer = { key: 'mc_customer', get() { return store.get(this.key, null); }, set(v) { store.set(this.key, v); }, clear() { store.set(this.key, null); } };
  const Wish = { key: 'mc_wish', get() { return store.get(this.key, []); }, has(id) { return this.get().includes(id); }, toggle(id) { const w = this.get(); const i = w.indexOf(id); if (i > -1) w.splice(i, 1); else w.push(id); store.set(this.key, w); return i === -1; } };

  /* Gửi đơn về chỗ nhận đơn của shop (SITE.orderEndpoint – Google Apps Script). Mất mạng thì xếp hàng gửi lại. */
  function postOrder(order) {
    const url = SITE.orderEndpoint;
    if (!url) return Promise.resolve(false);
    return fetch(url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(order) })
      .then(() => true).catch(() => false);
  }
  function queueOrder(order) { const q = store.get('mc_order_queue', []); q.push(order); store.set('mc_order_queue', q.slice(-20)); }
  function flushOrders() {
    const q = store.get('mc_order_queue', []);
    if (!q.length || !SITE.orderEndpoint) return;
    store.set('mc_order_queue', []);
    q.forEach((o) => postOrder(o).then((ok) => { if (!ok) queueOrder(o); }));
  }

  /* Tạo mã đơn, lưu máy khách và gửi về shop. */
  function submitOrder(order) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const code = 'HCK' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + String(Math.floor(Math.random() * 900) + 100);
        const saved = { ...order, code, createdAt: new Date().toISOString(), site: location.host };
        const orders = store.get('mc_orders', []); orders.unshift(saved); store.set('mc_orders', orders.slice(0, 20));
        store.set('mc_last_order', saved);
        postOrder(saved).then((ok) => { if (!ok) queueOrder(saved); });
        resolve(saved);
      }, 700);
    });
  }
  function shipFee(subtotal, method = 'standard') { if (method === 'express') return SITE.expressFee || 35000; return subtotal >= SITE.freeshipFrom || subtotal === 0 ? 0 : SITE.shipFee; }
  const productThumb = (p) => p.thumb || productImage(p);
  const addrShow = (a) => { const [cty, ...rst] = String(a || '').split('|'); return rst.length ? `${rst.join('|').trim()}, ${cty.trim()}` : String(a || ''); };
  const shortName = (p) => p.short || p.name;
  const hoursNote = () => `trong giờ làm việc ${SITE.workingHours}; ngoài giờ sẽ gọi vào sáng hôm sau`;
  function applyCoupon(code, subtotal) {
    const c = COUPONS[(code || '').trim().toUpperCase()]; if (!c) return { ok: false, msg: 'Mã giảm giá không hợp lệ' };
    if (subtotal < (c.min || 0)) return { ok: false, msg: `Mã áp dụng cho đơn từ ${fmt(c.min)}` };
    let discount = 0, freeship = false;
    if (c.type === 'percent') discount = Math.min(subtotal * c.value / 100, c.max || Infinity);
    else if (c.type === 'fixed') discount = c.value; else if (c.type === 'ship') freeship = true;
    return { ok: true, discount: Math.round(discount), freeship, desc: c.desc, code: (code || '').toUpperCase() };
  }
  function deliveryEstimate() { const d = new Date(); d.setDate(d.getDate() + 1); const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']; return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`; }

  /* ---------------- VietQR (chuẩn NAPAS/EMVCo) – tạo QR chuyển khoản ngay trên web ---------------- */
  const stripVN = (str) => String(str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^A-Za-z0-9 _-]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
  const tlv = (id, v) => id + String(v.length).padStart(2, '0') + v;
  function crc16(str) { let crc = 0xFFFF; for (let i = 0; i < str.length; i++) { crc ^= str.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1; crc &= 0xFFFF; } return crc.toString(16).toUpperCase().padStart(4, '0'); }
  function vietqrPayload({ bin, account, amount, info }) {
    const acc = tlv('00', 'A000000727') + tlv('01', tlv('00', bin) + tlv('01', account)) + tlv('02', 'QRIBFTTA');
    let p = tlv('00', '01') + tlv('01', amount ? '12' : '11') + tlv('38', acc) + tlv('52', '0000') + tlv('53', '704');
    if (amount) p += tlv('54', String(Math.round(amount)));
    p += tlv('58', 'VN');
    if (info) p += tlv('62', tlv('08', info.slice(0, 99)));
    p += '6304'; return p + crc16(p);
  }
  const transferInfo = (order) => (SITE.transferFormat || '{name}_thanhtoan_{code}').replace('{name}', stripVN(order.customer?.name || 'KHACH')).replace('{code}', String(order.code || '').toUpperCase()).slice(0, 99);
  function payQrSvg(order) {
    if (typeof qrcode !== 'function' || !SITE.bank) return '';
    try { const q = qrcode(0, 'M'); q.addData(vietqrPayload({ bin: SITE.bank.bin, account: SITE.bank.account, amount: order.total, info: transferInfo(order) })); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); } catch (e) { return ''; }
  }
  /* Khối hướng dẫn chuyển khoản kèm QR cho một đơn hàng */
  function payBox(order) {
    const b = SITE.bank; if (!b) return '';
    const info = transferInfo(order); const svg = payQrSvg(order);
    return `<div class="paybox"><div class="paybox__qr">${svg || '<div class="skeleton" style="width:180px;height:180px"></div>'}<small>Quét bằng app ngân hàng / ví bất kỳ – số tiền & nội dung điền sẵn</small></div>
      <div class="paybox__info">
        <div class="paybox__row"><span>Ngân hàng</span><b>${esc(b.name)}</b></div>
        <div class="paybox__row"><span>Số tài khoản</span><b>${esc(b.account)}</b><button class="btn btn--ghost btn--sm" type="button" data-copy="${esc(b.account)}">Sao chép</button></div>
        ${b.holder ? `<div class="paybox__row"><span>Chủ tài khoản</span><b>${esc(b.holder)}</b></div>` : ''}
        <div class="paybox__row"><span>Số tiền</span><b class="text-price">${fmt(order.total)}</b><button class="btn btn--ghost btn--sm" type="button" data-copy="${Math.round(order.total)}">Sao chép</button></div>
        <div class="paybox__row"><span>Nội dung</span><b>${esc(info)}</b><button class="btn btn--ghost btn--sm" type="button" data-copy="${esc(info)}">Sao chép</button></div>
        <p class="paybox__note">Sau khi chuyển, mẹ chụp màn hình giao dịch gửi Zalo <b>${SITE.hotline}</b> để được giao sớm nhất. ${SITE.name} chỉ dùng duy nhất số tài khoản này – không chuyển cho số khác.</p>
      </div></div>`;
  }
  function openPayQR(order) {
    $('#callbackContent').innerHTML = `<div class="modal__head"><h3>${I.file}Thanh toán đơn ${esc(order.code)}</h3><button class="modal__close" type="button" data-close-modal aria-label="Đóng">${I.close}</button></div><div class="modal__body">${payBox(order)}</div>`;
    openModal('#callbackModal');
  }

  /* ---------------- Ngày sale Shopee (15, 25, ngày đôi) ---------------- */
  function todayVN() { const d = param('demo_date'); const t = d ? new Date(d + 'T12:00:00') : new Date(); return isNaN(t) ? new Date() : t; }
  function shopeeSale() {
    const cfg = SITE.shopeeSale; if (!cfg) return null;
    const t = todayVN(); const d = t.getDate(), m = t.getMonth() + 1; let day = null;
    if (cfg.doubleDays !== false && d === m) day = `${d}/${m}`;
    else if ((cfg.days || []).includes(d)) day = String(d);
    return day ? { day, label: (cfg.label || 'Siêu ưu đãi ngày {d}').replace('{d}', day) } : null;
  }
  /* Nút Shopee: ngày thường màu nhạt, ngày sale nổi bật + tag */
  function shopeeBtn(url, cls = 'btn--ghost', text = 'Xem trên Shopee') {
    const s = shopeeSale(); if (!url) return '';
    return s ? `<a class="btn btn--shopee btn--stack shopee-btn" href="${url}" target="_blank" rel="noopener"><span>${text} ↗</span><small class="sale-tag">🔥 ${esc(s.label)}</small></a>` : `<a class="btn ${cls} shopee-btn" href="${url}" target="_blank" rel="noopener">${text} ↗</a>`;
  }

  /* ---------------- Toast ---------------- */
  function toast(msg, opts = {}) {
    let wrap = $('.toasts'); if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toasts'; wrap.setAttribute('aria-live', 'polite'); document.body.appendChild(wrap); }
    const el = document.createElement('div'); el.className = 'toast' + (opts.type === 'error' ? ' toast--error' : '');
    el.innerHTML = `${opts.type === 'error' ? I.close : I.checkCircle}<span>${msg}</span>${opts.action ? `<button type="button">${opts.action.label}</button>` : ''}`;
    if (opts.action) $('button', el).addEventListener('click', () => { opts.action.onClick(); el.remove(); });
    wrap.appendChild(el); setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, opts.duration || 3200);
  }

  /* ---------------- Product card ---------------- */
  function productCard(p, opts = {}) {
    const d = pct(p); const b = brandOf(p); const oos = p.stock <= 0;
    const tag = (p.tags || []).find((t) => t !== 'Giảm sâu') || '';
    return `<article class="pcard ${oos ? 'pcard--oos' : ''}" data-id="${p.id}">
      <a class="pcard__media" href="product.html?id=${p.id}">
        <img src="${productThumb(p)}" alt="${esc(shortName(p))}" loading="lazy" width="420" height="420">
        <div class="pcard__badges">${d >= 5 ? `<span class="badge badge--sale">-${d}%</span>` : ''}${tag ? `<span class="badge ${tag === 'Mới' ? 'badge--new' : tag === 'Combo' ? 'badge--teal' : 'badge--hot'}">${tag}</span>` : ''}</div>
        <button class="pcard__wish ${Wish.has(p.id) ? 'is-on' : ''}" type="button" data-wish="${p.id}" aria-label="Lưu vào yêu thích" aria-pressed="${Wish.has(p.id)}">${I.heart}</button>
      </a>
      <div class="pcard__body">
        <div class="pcard__brand">${esc(b.label)}${p.origin && p.origin !== 'Hàn Quốc' ? ` · ${esc(p.origin)}` : ''}</div>
        <a class="pcard__name" href="product.html?id=${p.id}" title="${esc(p.name)}">${esc(shortName(p))}</a>
        <div class="pcard__meta">${p.reviews > 0 ? `<span class="star">${I.star}${p.rating.toFixed(1)} <span class="text-muted">(${p.reviews})</span></span>` : ''}${p.reviews > 0 && p.sold > 0 ? '<span>·</span>' : ''}${p.sold > 0 ? `<span>Đã bán ${p.sold >= 1000 ? (p.sold / 1000).toFixed(1) + 'k' : p.sold}</span>` : ''}${!p.reviews && !p.sold ? `<span class="text-teal fw-600">${I.check} Chính hãng</span>` : ''}</div>
        <div class="pcard__price"><b>${p.variants && p.variants.length > 1 ? '<small>từ</small> ' : ''}${fmt(p.price)}</b>${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ''}</div>
        <div class="pcard__age">${p.ages && p.ages.length ? `<span>${I.user}${ageRange(p.ages)}${p.family ? ' & cả nhà' : ''}</span>` : `<span>${p.family ? '👨‍👩‍👧 Cả gia đình' : 'Dành cho mẹ'}</span>`}</div>
        <div class="pcard__actions">
          <button class="btn btn--primary" type="button" data-buy="${p.id}" ${oos ? 'disabled' : ''}>${I.zap}Mua ngay</button>
          <button class="btn btn--outline btn--icon" type="button" data-add="${p.id}" aria-label="Thêm ${esc(shortName(p))} vào giỏ" ${oos ? 'disabled' : ''}>${I.cart}</button>
        </div>
      </div>
    </article>`;
  }

  /* ---------------- Menu từ dữ liệu NAV ---------------- */
  const needLink = (k) => { const n = NEEDS.find((x) => x.key === k); return n ? `<li><a href="collections.html?need=${k}">${n.label}</a></li>` : ''; };
  function navColumn(col) {
    if (col.ages) return `<div><h4>${col.title}</h4><div class="age-list">${AGES.filter((a) => col.ages === true || col.ages.includes(a.key)).map((a) => `<a href="collections.html?age=${a.key}">${a.emoji} ${a.label}</a>`).join('')}</div></div>`;
    if (col.needs) return `<div><h4>${col.title}</h4><ul>${col.needs.map(needLink).join('')}</ul></div>`;
    return `<div><h4>${col.title}</h4><ul>${(col.links || []).map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>`;
  }
  function navItem(n) {
    if (n.ages) return `<li class="navbar__item"><a class="navbar__link" href="collections.html">${n.label} ${I.chevron}</a><div class="mega"><div class="age-list">${AGES.map((a) => `<a href="collections.html?age=${a.key}"><span>${a.emoji}</span>${a.label} <small style="color:var(--muted);font-weight:500">· ${a.desc}</small></a>`).join('')}</div></div></li>`;
    if (n.brands) return `<li class="navbar__item"><a class="navbar__link" href="collections.html">${n.label} ${I.chevron}</a><div class="mega mega--brands"><div class="brand-grid">${BRANDS.map((b) => `<a href="collections.html?brand=${b.key}">${b.label} <small style="color:var(--muted)">· ${b.origin}</small></a>`).join('')}</div></div></li>`;
    if (n.columns) return `<li class="navbar__item"><a class="navbar__link" href="${n.link}">${n.label} ${I.chevron}</a><div class="mega mega--wide">${n.columns.map(navColumn).join('')}</div></li>`;
    return `<li class="navbar__item"><a class="navbar__link ${n.hot ? 'navbar__link--hot' : ''}" href="${n.link}">${n.label}</a></li>`;
  }
  function navMobile(n, i) {
    const links = (n.columns || []).flatMap((c) => c.ages ? [] : c.needs ? c.needs.map((k) => { const x = NEEDS.find((y) => y.key === k); return x ? [x.label, 'collections.html?need=' + k] : null; }).filter(Boolean) : (c.links || []));
    if (n.brands) return `<details class="mmenu__group"><summary>${n.label} ${I.chevron}</summary><ul>${BRANDS.map((b) => `<li><a href="collections.html?brand=${b.key}">${b.label}</a></li>`).join('')}</ul></details>`;
    if (n.ages) return '';
    if (n.columns) return `<details class="mmenu__group"><summary>${n.label} ${I.chevron}</summary><ul><li><a href="${n.link}" class="fw-700">Xem tất cả ${n.label.toLowerCase()}</a></li>${links.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></details>`;
    return `<a class="mmenu__link ${n.hot ? 'text-red' : ''}" href="${n.link}">${n.label}</a>`;
  }

  /* ---------------- Shell: header / footer / widgets ---------------- */
  function renderShell() {
    const cartCount = Cart.count();
    const header = `
    <div class="topbar"><div class="container topbar__inner">
      <span class="topbar__item">${I.truck}Freeship đơn từ <b>${fmt(SITE.freeshipFrom)}</b> · Hà Nội giao trong ngày</span>
      <span class="topbar__item">${I.shield}Chính hãng 100% – Tem phụ, hoá đơn VAT</span>
      <span class="topbar__item">${I.headset}Chuyên gia dinh dưỡng tư vấn miễn phí ${SITE.workingHours}</span>
      <a class="topbar__item topbar__link" href="policy.html">${I.file}Hỗ trợ & chính sách</a>
      ${(() => { const s = shopeeSale(); return s && SITE.shopee ? `<a class="topbar__item topbar__sale" href="${SITE.shopee}" target="_blank" rel="noopener">🔥 ${esc(s.label)} trên Shopee – mua ngay</a>` : ''; })()}
    </div></div>
    <header class="header" id="header">
      <div class="container header__inner">
        <button class="hamburger" type="button" id="btnMenu" aria-label="Mở menu">${I.menu}</button>
        <a class="logo" href="index.html">${SITE.logo ? `<img class="logo__img" src="${SITE.logo}" alt="" width="44" height="44">` : `<span class="logo__mark">🍼</span>`}<span>${SITE.name}<small>${SITE.slogan}</small></span></a>
        <div class="search" id="search">
          <form class="search__form" action="collections.html" method="get" role="search" autocomplete="off">
            <input type="search" name="q" id="searchInput" placeholder="Tìm sản phẩm: hồng sâm, nước ép, D3K2…" aria-label="Tìm sản phẩm">
            <button type="submit">${I.search}<span>Tìm kiếm</span></button>
          </form>
          <div class="search__suggest" id="searchSuggest"></div>
        </div>
        <div class="header__actions">
          <button class="hact hact--search" type="button" id="btnSearchToggle" aria-label="Tìm kiếm">${I.search}</button>
          <a class="hact hact--hotline" href="tel:${SITE.hotlineTel}">${I.phoneCall}<span><b>${SITE.hotline}</b><small>Tư vấn miễn phí</small></span></a>
          <a class="hact hact--account" href="account.html">${I.user}<span class="lbl">Tài khoản</span></a>
          <button class="hact" type="button" data-open-cart aria-label="Giỏ hàng">${I.cart}<span class="lbl">Giỏ hàng</span><span class="hact__count ${cartCount ? '' : 'hide'}" data-cart-count>${cartCount}</span></button>
        </div>
      </div>
      <nav class="navbar" aria-label="Danh mục chính"><div class="container"><ul class="navbar__list">
        <li class="navbar__item"><a class="navbar__link navbar__link--cat" href="collections.html">${I.grid}Danh mục sản phẩm</a>
          <div class="mega mega--wide"><div><h4>Danh mục</h4><ul>${CATEGORIES.slice(0, Math.ceil(CATEGORIES.length / 2)).map((c) => `<li><a href="collections.html?cat=${c.key}">${c.icon} ${c.label}</a></li>`).join('')}</ul></div>
          <div><h4>&nbsp;</h4><ul>${CATEGORIES.slice(Math.ceil(CATEGORIES.length / 2)).map((c) => `<li><a href="collections.html?cat=${c.key}">${c.icon} ${c.label}</a></li>`).join('')}</ul></div>
          <div><h4>Theo độ tuổi</h4><div class="age-list">${AGES.map((a) => `<a href="collections.html?age=${a.key}">${a.emoji} ${a.label}</a>`).join('')}</div></div>
          <div class="mega__promo">🎁 Mua từ 2 sản phẩm giảm thêm 3% – tự động áp dụng <a class="fw-700" href="collections.html?sort=discount">Xem ưu đãi →</a></div></div></li>
        <li class="navbar__item"><a class="navbar__link navbar__link--about" href="gioi-thieu.html">💗 Giới thiệu</a></li>
        ${NAV.map(navItem).join('')}
      </ul></div></nav>
    </header>
    <div class="mmenu" id="mmenu" aria-hidden="true">
      <div class="mmenu__backdrop" data-close-menu></div>
      <div class="mmenu__panel" role="dialog" aria-label="Menu">
        <div class="mmenu__head"><a class="logo" href="index.html">${SITE.logo ? `<img class="logo__img" src="${SITE.logo}" alt="" width="44" height="44">` : `<span class="logo__mark">🍼</span>`}${SITE.name}</a><button class="mmenu__close" type="button" data-close-menu aria-label="Đóng">${I.close}</button></div>
        <div class="mmenu__ages">${AGES.map((a) => `<a href="collections.html?age=${a.key}"><span>${a.emoji}</span>${a.label}</a>`).join('')}</div>
        <div class="mmenu__contact mmenu__contact--top"><a class="btn btn--primary btn--block" href="tel:${SITE.hotlineTel}">${I.phoneCall}Gọi ${SITE.hotline}</a><a class="btn btn--zalo btn--block" href="${SITE.zalo}" target="_blank" rel="noopener">Chat Zalo với chuyên gia dinh dưỡng</a></div>
        <details class="mmenu__group"><summary>Danh mục sản phẩm ${I.chevron}</summary><ul>${CATEGORIES.map((c) => `<li><a href="collections.html?cat=${c.key}">${c.icon} ${c.label}</a></li>`).join('')}</ul></details>
        <a class="mmenu__link" href="gioi-thieu.html">💗 Giới thiệu Hương Chất Kids</a>
        ${NAV.map(navMobile).join('')}
        <a class="mmenu__link" href="account.html">👤 Tài khoản / Đơn hàng</a>
        <a class="mmenu__link" href="policy.html">📋 Hỗ trợ & chính sách</a>
      </div>
    </div>`;
    const footer = `
    <footer class="footer"><div class="container">
      <div class="footer__top">
        <div class="footer__info">
          <a class="logo" href="index.html">${SITE.logo ? `<img class="logo__img" src="${SITE.logo}" alt="" width="44" height="44">` : `<span class="logo__mark">🍼</span>`}<span>${SITE.name}<small>${SITE.slogan}</small></span></a>
          <b>${SITE.company}</b>
          <p>${I.mapPin}<span>${SITE.address}</span></p>
          <p>${I.phoneCall}<span>Hotline: <b>${SITE.hotline}</b> (${SITE.workingHours})</span></p>
          <p>${I.mail}<span>${SITE.email}</span></p>
          ${SITE.taxCode ? `<p>${I.file}<span>MST: ${SITE.taxCode}</span></p>` : ''}
          ${SITE.bctUrl ? `<a class="footer__cert" href="${SITE.bctUrl}" target="_blank" rel="noopener">${I.shield} Đã thông báo Bộ Công Thương</a>` : ''}
        </div>
        <div class="footer__col"><h4><a href="policy.html">Hỗ trợ khách hàng</a></h4><ul><li><a href="policy.html?p=mua-hang">Hướng dẫn mua hàng</a></li><li><a href="policy.html?p=thanh-toan">Phương thức thanh toán</a></li><li><a href="policy.html?p=giao-hang">Chính sách giao hàng</a></li><li><a href="policy.html?p=doi-tra">Chính sách đổi trả & hoàn tiền</a></li><li><a href="policy.html?p=bao-mat">Chính sách bảo mật</a></li><li><a href="policy.html?p=dieu-khoan">Điều khoản sử dụng</a></li></ul></div>
        <div class="footer__col"><h4><a href="gioi-thieu.html">Về ${SITE.name}</a></h4><ul><li><a href="gioi-thieu.html">Giới thiệu</a></li><li><a href="policy.html?p=chinh-hang">Cam kết chính hãng</a></li><li><a href="policy.html?p=faq">Câu hỏi thường gặp</a></li><li><a href="blog.html">Cẩm nang mẹ</a></li><li><a href="policy.html?p=tra-cuu">Tra cứu đơn hàng</a></li><li><a href="policy.html?p=hop-tac">Liên hệ hợp tác</a></li></ul></div>
        <div class="footer__col"><h4>Kết nối với chúng tôi</h4>
          <p class="fs-13 text-muted">Theo dõi để nhận ưu đãi và kiến thức chăm con mỗi ngày.</p>
          ${SITE.zaloQr ? `<div class="footer__qr"><img src="${SITE.zaloQr}" width="112" height="112" alt="Mã QR Zalo ${SITE.name}" loading="lazy"><div><b>Zalo ${SITE.hotline}</b><small>Quét mã để chat với chuyên gia dinh dưỡng, đặt hàng nhanh</small><a href="${SITE.zalo}" target="_blank" rel="noopener">Mở Zalo →</a></div></div>` : ''}
          <div class="footer__social">${SITE.facebook ? `<a href="${SITE.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${I.facebook}</a>` : ''}${SITE.instagram ? `<a href="${SITE.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.instagram}</a>` : ''}${SITE.youtube ? `<a href="${SITE.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${I.youtube}</a>` : ''}${SITE.tiktok ? `<a href="${SITE.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${I.tiktok}</a>` : ''}<a class="pill" href="${SITE.zalo}" target="_blank" rel="noopener" aria-label="Zalo" style="font-weight:800;font-size:12px;color:var(--zalo)">Zalo</a>${SITE.shopee ? `<a class="pill" href="${SITE.shopee}" target="_blank" rel="noopener" aria-label="Shopee" style="font-weight:800;font-size:12px;color:#EE4D2D">Shopee</a>` : ''}</div>
          <h4 class="mt-16">Thanh toán</h4>
          <div class="footer__pay"><span>💵 Tiền mặt khi nhận hàng (COD)</span><span>🏦 Chuyển khoản / VietQR ${SITE.bank ? SITE.bank.name : ''}</span></div>
        </div>
      </div>
      <p class="footer__note">* Thực phẩm bảo vệ sức khoẻ không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh. Hiệu quả có thể khác nhau tuỳ cơ địa. Vui lòng đọc kỹ hướng dẫn sử dụng trước khi dùng.</p>
      <div class="footer__bottom"><span>© 2026 ${SITE.company} · ${SITE.address}</span><span><a href="policy.html?p=bao-mat">Bảo mật</a> · <a href="policy.html?p=dieu-khoan">Điều khoản</a></span></div>
    </div></footer>
    <div class="floating">
      <button class="fab fab--top" type="button" id="btnTop" aria-label="Lên đầu trang">${I.arrowUp}</button>
      <button class="fab fab--callback" type="button" data-callback aria-label="Yêu cầu gọi lại">${I.headset}<span class="fab__label">Gọi lại cho tôi</span></button>
      ${SITE.messenger ? `<a class="fab fab--messenger" href="${SITE.messenger}" target="_blank" rel="noopener" aria-label="Messenger">${I.messenger}<span class="fab__label">Chat Messenger</span></a>` : ''}
      <a class="fab fab--zalo" href="${SITE.zalo}" target="_blank" rel="noopener" aria-label="Zalo">Zalo<span class="fab__label">Chat Zalo</span></a>
      <a class="fab fab--phone" href="tel:${SITE.hotlineTel}" aria-label="Gọi hotline">${I.phone}<span class="fab__label">${SITE.hotline}</span></a>
    </div>
    <nav class="bottom-nav" aria-label="Điều hướng nhanh">
      <a href="index.html" data-nav="index">${I.home}Trang chủ</a>
      <a href="collections.html" data-nav="collections">${I.grid}Danh mục</a>
      <a class="bn-center" href="${SITE.zalo}" target="_blank" rel="noopener"><span class="circle">Zalo</span>Tư vấn</a>
      <button type="button" data-open-cart>${I.cart}Giỏ hàng<span class="hact__count ${cartCount ? '' : 'hide'}" data-cart-count>${cartCount}</span></button>
      <a href="tel:${SITE.hotlineTel}">${I.phoneCall}Gọi ngay</a>
    </nav>
    <div class="drawer" id="cartDrawer" aria-hidden="true">
      <div class="drawer__backdrop" data-close-cart></div>
      <div class="drawer__panel" role="dialog" aria-label="Giỏ hàng">
        <div class="drawer__head"><h3>🛒 Giỏ hàng của mẹ <span class="text-muted fs-14" data-cart-count-text></span></h3><button class="modal__close" type="button" data-close-cart aria-label="Đóng">${I.close}</button></div>
        <div class="drawer__body" id="drawerBody"></div>
        <div class="drawer__foot" id="drawerFoot"></div>
      </div>
    </div>
    <div class="modal" id="quickBuy" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Mua nhanh"><div class="modal__backdrop" data-close-modal></div><div class="modal__panel"><div class="modal__grip"></div><div id="quickBuyContent"></div></div></div>
    <div class="modal" id="callbackModal" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Yêu cầu gọi lại"><div class="modal__backdrop" data-close-modal></div><div class="modal__panel modal__panel--sm"><div class="modal__grip"></div><div id="callbackContent"></div></div></div>`;
    document.body.insertAdjacentHTML('afterbegin', header);
    document.body.insertAdjacentHTML('beforeend', footer);
    const page = location.pathname.split('/').pop().replace('.html', '') || 'index';
    $$('.bottom-nav [data-nav]').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === page));
  }

  function updateCartBadges() {
    const n = Cart.count();
    $$('[data-cart-count]').forEach((el) => { el.textContent = n; el.classList.toggle('hide', !n); });
    $$('[data-cart-count-text]').forEach((el) => { el.textContent = n ? `(${n} sản phẩm)` : ''; });
  }

  /* ---------------- Cart drawer ---------------- */
  function renderDrawer() {
    const body = $('#drawerBody'), foot = $('#drawerFoot'); if (!body) return;
    const lines = Cart.lines(); const sub = Cart.subtotal();
    if (!lines.length) {
      body.innerHTML = `<div class="drawer__empty"><div class="emoji">🧺</div><h3>Giỏ hàng đang trống</h3><p class="mt-8">Mẹ chọn sản phẩm phù hợp với bé nhé!</p><a class="btn btn--primary mt-16" href="collections.html">Xem sản phẩm</a></div>`;
      foot.innerHTML = ''; return;
    }
    const remain = SITE.freeshipFrom - sub;
    body.innerHTML = `<div class="freeship-bar mt-12">${remain > 0 ? `Mua thêm <b>${fmt(remain)}</b> để được <b>freeship</b>` : `🎉 Đơn hàng được <b>miễn phí vận chuyển</b>`}<div class="bar"><i style="width:${Math.min(100, sub / SITE.freeshipFrom * 100)}%"></i></div></div>` +
      lines.map((l) => `<div class="cart-item"><img src="${productThumb(l.p)}" alt=""><div><div class="name">${esc(shortName(l.p))}</div>${l.variantLabel ? `<div class="variant">Phân loại: ${esc(l.variantLabel)}</div>` : ''}<div class="price">${fmt(l.price)}${l.oldPrice ? `<s>${fmt(l.oldPrice)}</s>` : ''}</div>
        <div class="ctrl"><div class="qty qty--sm"><button type="button" data-qty-minus="${l.id}" data-variant="${l.variant}">−</button><input type="number" value="${l.qty}" min="1" data-qty-input="${l.id}" data-variant="${l.variant}"><button type="button" data-qty-plus="${l.id}" data-variant="${l.variant}">+</button></div><button class="remove" type="button" data-remove="${l.id}" data-variant="${l.variant}">Xoá</button></div></div>
        <div class="total">${fmt(l.total)}</div></div>`).join('');
    const multi = Cart.multiDiscount(); const ship = shipFee(sub - multi);
    foot.innerHTML = `<div class="summary-line"><span>Tạm tính (${Cart.count()} sản phẩm)</span><b>${fmt(sub)}</b></div>${multi ? `<div class="summary-line"><span>Mua từ 2 giảm 3%</span><span class="free">−${fmt(multi)}</span></div>` : ''}<div class="summary-line"><span>Phí vận chuyển</span><span class="${ship ? '' : 'free'}">${ship ? fmt(ship) : 'Miễn phí'}</span></div>
      <a class="btn btn--primary btn--lg btn--block" href="checkout.html">${I.zap}Thanh toán ngay · ${fmt(sub - multi + ship)}</a>
      <a class="btn btn--ghost btn--block" href="cart.html">Xem chi tiết giỏ hàng</a>`;
  }
  function openCart() { renderDrawer(); const d = $('#cartDrawer'); d.classList.add('is-open'); d.setAttribute('aria-hidden', 'false'); lockScroll(); setTimeout(() => $('#cartDrawer [data-close-cart].modal__close')?.focus(), 50); }
  function closeCart() { const d = $('#cartDrawer'); d.classList.remove('is-open'); d.setAttribute('aria-hidden', 'true'); unlockScroll(); }

  /* ---------------- Modal helpers ---------------- */
  /* Khoá cuộn nền khi mở modal/drawer (cả iOS Safari) */
  let _lockY = 0;
  function lockScroll() { if (document.body.classList.contains('no-scroll')) return; _lockY = window.scrollY; document.body.style.top = `-${_lockY}px`; document.body.classList.add('no-scroll'); }
  function unlockScroll() { if ($('.modal.is-open') || $('.drawer.is-open') || $('.mmenu.is-open')) return; document.body.classList.remove('no-scroll'); document.body.style.top = ''; window.scrollTo(0, _lockY); }
  function openModal(id) { const m = $(id); m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); lockScroll(); }
  function closeModal(el) { const m = el.closest ? el.closest('.modal') : $(el); if (m) { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); } unlockScroll(); }

  /* ---------------- Quick Buy (Mua nhanh 1-chạm) ---------------- */
  const QB = { id: null, variant: null, qty: 1, coupon: '' };
  function qbPrice() { const p = byId(QB.id); const v = QB.variant != null && p.variants ? p.variants[QB.variant] : null; return { price: v ? v.price : p.price, old: v ? v.oldPrice : p.oldPrice, label: v ? v.label : '' }; }
  function qbCalc() {
    const { price } = qbPrice(); const sub = price * QB.qty; const multi = QB.qty >= 2 ? Math.round(sub * MULTI_RATE) : 0;
    const cr = QB.coupon ? applyCoupon(QB.coupon, sub - multi) : null; const coupon = cr && cr.ok ? cr.discount : 0;
    const ship = cr && cr.ok && cr.freeship ? 0 : shipFee(sub - multi - coupon);
    return { sub, multi, coupon, cr, ship, total: Math.max(0, sub - multi - coupon) + ship };
  }
  const qbTotal = () => qbCalc().total;
  function openQuickBuy(id, opts = {}) {
    const p = byId(id); if (!p) return;
    QB.id = id; QB.variant = opts.variant ?? (p.variants ? 0 : null); QB.qty = opts.qty || 1; QB.coupon = '';
    const c = Customer.get() || {}; const known = !!c.phone;
    const manyVariants = p.variants && p.variants.length > 4;
    $('#quickBuyContent').innerHTML = `
      <div class="modal__head"><h3>${I.zap}Mua nhanh · chỉ 30 giây</h3><button class="modal__close" type="button" data-close-modal aria-label="Đóng">${I.close}</button></div>
      <div class="modal__body">
        <div class="qb__product"><img src="${productThumb(p)}" alt=""><div><div class="name">${esc(shortName(p))}</div><div class="price" id="qbPrice"></div></div></div>
        ${p.variants ? (manyVariants ? `<label class="field mb-12"><span class="fs-13 fw-600">Phân loại</span><select class="input" id="qbVariantSel" aria-label="Chọn phân loại">${p.variants.map((v, i) => `<option value="${i}" ${i === QB.variant ? 'selected' : ''}>${esc(v.label)} – ${fmt(v.price)}</option>`).join('')}</select></label>` : `<div class="qb__variants" id="qbVariants" role="group" aria-label="Phân loại">${p.variants.map((v, i) => `<button type="button" class="chip chip--sm ${i === QB.variant ? 'is-active' : ''}" data-qb-variant="${i}" aria-pressed="${i === QB.variant}">${esc(v.label)} · ${fmt(v.price)}</button>`).join('')}</div>`) : ''}
        <div class="qb__row"><div class="qty" role="group" aria-label="Số lượng"><button type="button" data-qb-minus aria-label="Giảm số lượng">−</button><input type="number" id="qbQty" value="${QB.qty}" min="1" max="99" inputmode="numeric" aria-label="Số lượng"><button type="button" data-qb-plus aria-label="Tăng số lượng">+</button></div><span class="qb__hint" id="qbHint"></span></div>
        <form class="qb__form" id="qbForm" novalidate>
          ${known ? `<div class="qb__saved" id="qbSaved">👋 Chào ${esc(c.name || 'mẹ')}, thông tin giao hàng đã điền sẵn từ lần trước <button type="button" data-qb-clear>Sửa</button></div>` : ''}
          <div class="grid-2 ${known ? 'hide' : ''}" id="qbFields1"><input class="input" name="name" placeholder="Họ tên mẹ / ba *" aria-label="Họ tên" value="${esc(c.name || '')}" required autocomplete="name"><input class="input" name="phone" type="tel" inputmode="numeric" placeholder="Số điện thoại *" aria-label="Số điện thoại" value="${esc(c.phone || '')}" required autocomplete="tel"></div>
          <input class="input ${known ? 'hide' : ''}" id="qbFields2" name="address" placeholder="Địa chỉ nhận hàng (số nhà, đường, phường, quận, tỉnh) *" aria-label="Địa chỉ nhận hàng" value="${esc(addrShow(c.address))}" required autocomplete="street-address">
          ${known ? `<div class="qb__savedinfo" id="qbSavedInfo"><b>${esc(c.name || '')}</b> · ${esc(c.phone)}<br>${esc(addrShow(c.address))}</div>` : ''}
          <div class="pay-options pay-options--2" role="radiogroup" aria-label="Hình thức thanh toán">
            <label class="pay-option"><input type="radio" name="payment" value="cod" ${(c.payment || 'cod') !== 'bank' ? 'checked' : ''}><span class="ico">💵</span><span><b>Thanh toán khi nhận hàng</b><small>Kiểm tra hàng rồi mới trả tiền</small></span></label>
            <label class="pay-option"><input type="radio" name="payment" value="bank" ${c.payment === 'bank' ? 'checked' : ''}><span class="ico">🏦</span><span><b>Chuyển khoản / VietQR</b><small>${SITE.bank ? `${SITE.bank.name} ${SITE.bank.account} · quét QR sau khi đặt` : 'Quét mã QR sau khi đặt'}</small></span></label>
          </div>
          <details class="qb__coupon"><summary>${I.tag}Có mã giảm giá? <span class="text-muted">(VD: HCK10)</span></summary><div class="coupon mt-8"><input class="input" id="qbCoupon" placeholder="Nhập mã" aria-label="Mã giảm giá"><button class="btn btn--dark" type="button" data-qb-coupon>Áp dụng</button></div><div class="coupon-hint" id="qbCouponHint"></div></details>
          <div class="qb__summary" id="qbSummary" aria-live="polite"></div>
          <div class="form-error hide" id="qbError" role="alert"></div>
          <button class="btn btn--primary btn--lg btn--block btn--stack" type="submit" id="qbSubmit"><span>ĐẶT HÀNG · <span id="qbTotal"></span></span><small>Không cần tài khoản · Kiểm tra hàng trước khi thanh toán</small></button>
          <div class="qb__trust"><span>${I.check}Chính hãng, tem phụ tiếng Việt</span><span>${I.check}Đổi trả 7 ngày</span><span>${I.check}Giao dự kiến ${deliveryEstimate()}</span></div>
          <p class="qb__privacy">Thông tin chỉ dùng để giao hàng và tư vấn, không chia sẻ cho bên thứ ba. <a href="policy.html?p=bao-mat" target="_blank">Chính sách bảo mật</a></p>
        </form>
        <div class="qb__alt"><p>Hoặc đặt hàng qua</p><div class="row ${p.shopeeUrl ? 'row--4' : ''}">
          <a class="btn btn--zalo" href="${SITE.zalo}" target="_blank" rel="noopener" data-zalo-copy="${esc(shortName(p))}${p.variants ? ' – ' + esc(p.variants[QB.variant || 0].label) : ''}">Đặt qua Zalo</a>${shopeeBtn(p.shopeeUrl)}
          <a class="btn btn--ghost" href="tel:${SITE.hotlineTel}">${I.phoneCall}Gọi đặt</a>
          <button class="btn btn--ghost" type="button" data-callback="${p.id}">${I.headset}Gọi lại tôi</button>
        </div></div>
      </div>`;
    qbRefresh(); openModal('#quickBuy'); setTimeout(() => { if (!known) $('#qbForm input[name=name]').focus(); else $('#qbSubmit').focus(); }, 300);
  }
  function qbRefresh() {
    const { price, old } = qbPrice(); const k = qbCalc();
    $('#qbPrice').innerHTML = `<b>${fmt(price)}</b>${old ? `<s>${fmt(old)}</s>` : ''}`;
    $('#qbTotal').textContent = fmt(k.total);
    $('#qbQty').value = QB.qty;
    $('#qbHint').innerHTML = QB.qty >= 2 ? `🎉 Đã giảm 3% khi mua từ 2` : `Mua từ 2 giảm thêm 3%`;
    $('#qbSummary').innerHTML = `<div class="summary-line"><span>Tạm tính (${QB.qty} sản phẩm)</span><span>${fmt(k.sub)}</span></div>${k.multi ? `<div class="summary-line"><span>Mua từ 2 giảm 3%</span><span class="free">−${fmt(k.multi)}</span></div>` : ''}${k.coupon ? `<div class="summary-line"><span>Mã ${k.cr.code}</span><span class="free">−${fmt(k.coupon)}</span></div>` : ''}<div class="summary-line"><span>Phí vận chuyển</span><span class="${k.ship ? '' : 'free'}">${k.ship ? fmt(k.ship) : 'Miễn phí'}</span></div>`;
    const hint = $('#qbCouponHint'); if (hint) hint.innerHTML = k.cr ? (k.cr.ok ? `<span class="text-teal fw-600">✓ ${k.cr.desc}</span>` : `<span class="text-red">${k.cr.msg}</span>`) : '';
    $$('#qbVariants [data-qb-variant]').forEach((b) => { const on = Number(b.dataset.qbVariant) === QB.variant; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
    const z = $('#quickBuy [data-zalo-copy]'); const p = byId(QB.id); if (z && p) z.dataset.zaloCopy = `${shortName(p)}${p.variants && QB.variant != null ? ' – ' + p.variants[QB.variant].label : ''} × ${QB.qty}`;
  }
  async function qbSubmit(form) {
    const fd = new FormData(form); const name = fd.get('name').trim(), phone = fd.get('phone').trim(), address = fd.get('address').trim(), payment = fd.get('payment') || 'cod';
    const err = $('#qbError'); err.classList.add('hide');
    $$('.input', form).forEach((i) => i.classList.remove('is-invalid'));
    const bad = [];
    if (!name) bad.push('name'); if (!phoneOk(phone)) bad.push('phone'); if (address.length < 10) bad.push('address');
    if (bad.length) { $('#qbFields1')?.classList.remove('hide'); $('#qbFields2')?.classList.remove('hide'); $('#qbSavedInfo')?.remove(); $('#qbSaved')?.remove(); bad.forEach((n) => form.elements[n].classList.add('is-invalid')); err.textContent = !phoneOk(phone) && name && address.length >= 10 ? 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0)' : 'Mẹ vui lòng điền đủ họ tên, số điện thoại và địa chỉ nhé'; err.classList.remove('hide'); form.elements[bad[0]].focus(); return; }
    Customer.set({ ...(Customer.get() || {}), name, phone, address, payment });
    const btn = $('#qbSubmit'); btn.disabled = true; btn.innerHTML = '<span>Đang gửi đơn…</span>';
    const p = byId(QB.id); const { price, label } = qbPrice(); const k = qbCalc();
    const order = await submitOrder({ type: 'quick', customer: { name, phone, address }, payment, coupon: k.cr && k.cr.ok ? k.cr.code : '', items: [{ id: p.id, name: p.name, short: shortName(p), variant: label, qty: QB.qty, price }], subtotal: k.sub, discount: k.multi + k.coupon, ship: k.ship, total: k.total });
    $('#quickBuyContent').innerHTML = orderSuccessHTML(order, true);
    setTimeout(() => $('#quickBuy .qb__success h3')?.focus(), 100);
  }
  function orderSuccessHTML(order, inModal) {
    const payNote = order.payment === 'bank' ? `<span><i>2</i><p>Mẹ chuyển khoản <b>${fmt(order.total)}</b> theo mã QR ở trên (số tiền và nội dung đã điền sẵn). Đơn được giao ngay khi nhận được tiền.</p></span>` : `<span><i>2</i><p>Mẹ thanh toán <b>${fmt(order.total)}</b> khi nhận hàng, được kiểm tra hàng trước khi trả tiền.</p></span>`;
    const items = (order.items || []).map((it) => `<li>${esc(it.short || it.name)}${it.variant ? ` – ${esc(it.variant)}` : ''} <b>× ${it.qty || 1}</b></li>`).join('');
    return `${inModal ? `<div class="modal__head"><h3>${I.checkCircle}Đặt hàng thành công</h3><button class="modal__close" type="button" data-close-modal aria-label="Đóng">${I.close}</button></div>` : ''}
      <div class="modal__body"><div class="qb__success">
        <div class="check">${I.check}</div>
        <h3 tabindex="-1">Cảm ơn ${esc(order.customer.name)}! 💗</h3>
        <p>Đơn hàng của mẹ đã được ghi nhận.</p>
        <div class="code">Mã đơn: ${order.code}</div>
        ${items ? `<ul class="qb__items">${items}</ul>` : ''}
        ${order.payment === 'bank' ? payBox(order) : ''}
        <div class="steps"><span><i>1</i><p>Chuyên gia dinh dưỡng ${SITE.name} sẽ gọi số <b>${esc(order.customer.phone)}</b> để xác nhận & tư vấn liều dùng (${hoursNote()}).</p></span>${payNote}<span><i>3</i><p>Giao dự kiến <b>${deliveryEstimate()}</b> tới: ${esc(addrShow(order.customer.address))}</p></span></div>
        <div class="actions"><a class="btn btn--zalo btn--block" href="${SITE.zalo}" target="_blank" rel="noopener">Theo dõi đơn qua Zalo</a>${inModal ? `<button class="btn btn--ghost btn--block" type="button" data-close-modal>Tiếp tục mua sắm</button>` : `<a class="btn btn--ghost btn--block" href="index.html">Tiếp tục mua sắm</a>`}</div>
      </div></div>`;
  }

  /* ---------------- Callback modal (chỉ cần SĐT) ---------------- */
  function openCallback(pid) {
    const c = Customer.get() || {}; const p = pid ? byId(pid) : null;
    $('#callbackContent').innerHTML = `<div class="modal__head"><h3>${I.headset}Chuyên gia dinh dưỡng gọi lại cho mẹ</h3><button class="modal__close" type="button" data-close-modal aria-label="Đóng">${I.close}</button></div>
      <div class="modal__body"><p class="fs-14 text-muted mb-12">Mẹ chỉ cần để lại số điện thoại, chuyên gia dinh dưỡng sẽ gọi tư vấn ${p ? `về <b class="text-primary">${esc(p.short || p.name)}</b>` : 'sản phẩm phù hợp với bé'} — miễn phí, thường trong <b>10 phút</b> ${hoursNote()}.</p>
      <form id="cbForm" class="qb__form" novalidate><label class="sr-only" for="cbPhone">Số điện thoại của mẹ</label><div class="input-group">${I.phone}<input class="input" id="cbPhone" name="phone" type="tel" inputmode="numeric" placeholder="Số điện thoại của mẹ" value="${esc(c.phone || '')}" required autofocus></div>
      <div class="form-error hide" id="cbError" role="alert"></div>
      <button class="btn btn--teal btn--lg btn--block" type="submit">${I.phoneCall}Gọi lại cho tôi</button>
      <p class="fs-13 text-muted" style="text-align:center">Hoặc gọi ngay <a class="fw-700 text-primary" href="tel:${SITE.hotlineTel}">${SITE.hotline}</a> · ${SITE.workingHours}</p></form>
      ${SITE.zaloQr ? `<div class="qr-box"><img src="${SITE.zaloQr}" width="96" height="96" alt="QR Zalo"><div><b>Chat Zalo ${SITE.hotline}</b><small>Quét mã hoặc <a href="${SITE.zalo}" target="_blank" rel="noopener">bấm vào đây</a> để mở Zalo</small></div></div>` : ''}</div>`;
    openModal('#callbackModal'); setTimeout(() => $('#cbForm input').focus(), 300);
    $('#cbForm').addEventListener('submit', async (e) => {
      e.preventDefault(); const phone = e.target.phone.value.trim(); const err = $('#cbError');
      if (!phoneOk(phone)) { err.textContent = 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0)'; err.classList.remove('hide'); return; }
      Customer.set({ ...(Customer.get() || {}), phone });
      const btn = $('button[type=submit]', e.target); btn.disabled = true; btn.textContent = 'Đang gửi…';
      await submitOrder({ type: 'callback', customer: { phone }, items: p ? [{ id: p.id, name: p.name }] : [], total: 0 });
      $('#callbackContent').innerHTML = `<div class="modal__body"><div class="qb__success"><div class="check">${I.check}</div><h3>Đã nhận yêu cầu!</h3><p>Chuyên gia dinh dưỡng sẽ gọi số <b>${esc(phone)}</b> ${hoursNote()}. Mẹ để ý điện thoại nhé 💗</p><div class="actions"><button class="btn btn--primary btn--block" type="button" data-close-modal>Đóng</button></div></div></div>`;
    });
  }

  /* ---------------- Search suggestions ---------------- */
  function initSearch() {
    const input = $('#searchInput'), box = $('#searchSuggest'); if (!input) return;
    const hot = SITE.hotSearches || [];
    const render = (q) => {
      q = q.trim().toLowerCase();
      if (!q) { box.innerHTML = `<div class="search__hint">Tìm kiếm phổ biến<div class="chips">${hot.map((h) => `<a class="chip chip--sm" href="collections.html?q=${encodeURIComponent(h)}">${h}</a>`).join('')}</div></div>`; box.classList.add('is-open'); return; }
      const res = PRODUCTS.filter((p) => (p.name + ' ' + p.short + ' ' + brandOf(p).label + ' ' + (p.needs || []).map((n) => (NEEDS.find((x) => x.key === n) || {}).label).join(' ')).toLowerCase().includes(q))
        .sort((a, b) => (b.priority || 0) - (a.priority || 0) || b.sold - a.sold).slice(0, 6);
      box.innerHTML = res.length ? res.map((p) => `<a href="product.html?id=${p.id}"><img src="${productThumb(p)}" alt=""><span><div class="name">${esc(shortName(p))}</div><div class="price">${fmt(p.price)}</div></span></a>`).join('') + `<a class="all" href="collections.html?q=${encodeURIComponent(q)}">Xem tất cả kết quả cho "${esc(q)}" →</a>` : `<div class="search__hint">Không tìm thấy "${esc(q)}". Mẹ thử từ khoá khác hoặc <a class="text-primary fw-600" href="${SITE.zalo}" target="_blank">chat Zalo</a> để được tư vấn.</div>`;
      box.classList.add('is-open');
    };
    input.addEventListener('input', debounce(() => render(input.value), 120));
    input.addEventListener('focus', () => render(input.value));
    document.addEventListener('click', (e) => { if (!e.target.closest('#search')) box.classList.remove('is-open'); });
    $('#btnSearchToggle')?.addEventListener('click', (e) => { const open = $('#header').classList.toggle('is-search-open'); e.currentTarget.innerHTML = open ? I.close : I.search; e.currentTarget.setAttribute('aria-label', open ? 'Đóng tìm kiếm' : 'Tìm kiếm'); if (open) input.focus(); else box.classList.remove('is-open'); });
  }

  /* ---------------- Global events ---------------- */
  function bindGlobal() {
    document.addEventListener('click', (e) => {
      const t = e.target.closest('[data-buy],[data-add],[data-open-cart],[data-close-cart],[data-close-modal],[data-callback],[data-close-menu],#btnMenu,#btnTop,[data-qty-minus],[data-qty-plus],[data-remove],[data-qb-minus],[data-qb-plus],[data-qb-variant],[data-qb-clear],[data-qb-coupon],[data-wish],[data-reorder],[data-zalo-copy],[data-copy],[data-pay-qr]');
      if (!t) return;
      if (t.dataset.buy !== undefined) { e.preventDefault(); openQuickBuy(t.dataset.buy, { qty: Number(t.dataset.qty) || 1, variant: t.dataset.variant != null ? Number(t.dataset.variant) : undefined }); }
      else if (t.dataset.add !== undefined) { e.preventDefault(); Cart.add(t.dataset.add, Number(t.dataset.qty) || 1, t.dataset.variant != null ? Number(t.dataset.variant) : null); toast('Đã thêm vào giỏ hàng', { action: { label: 'Thanh toán ngay', onClick: () => location.href = 'checkout.html' } }); if (window.innerWidth >= 992) openCart(); }
      else if (t.dataset.openCart !== undefined) { e.preventDefault(); openCart(); }
      else if (t.dataset.closeCart !== undefined) closeCart();
      else if (t.dataset.closeModal !== undefined) closeModal(t);
      else if (t.dataset.callback !== undefined) { e.preventDefault(); openCallback(t.dataset.callback || null); }
      else if (t.id === 'btnMenu') { $('#mmenu').classList.add('is-open'); $('#mmenu').setAttribute('aria-hidden', 'false'); lockScroll(); }
      else if (t.dataset.closeMenu !== undefined) { $('#mmenu').classList.remove('is-open'); $('#mmenu').setAttribute('aria-hidden', 'true'); unlockScroll(); }
      else if (t.id === 'btnTop') window.scrollTo({ top: 0, behavior: 'smooth' });
      else if (t.dataset.qtyMinus !== undefined) { const l = Cart.lines().find((x) => x.id === t.dataset.qtyMinus && x.variant === t.dataset.variant); if (l) { Cart.setQty(l.id, l.variant, l.qty - 1); renderDrawer(); } }
      else if (t.dataset.qtyPlus !== undefined) { const l = Cart.lines().find((x) => x.id === t.dataset.qtyPlus && x.variant === t.dataset.variant); if (l) { Cart.setQty(l.id, l.variant, l.qty + 1); renderDrawer(); } }
      else if (t.dataset.remove !== undefined) { Cart.remove(t.dataset.remove, t.dataset.variant); renderDrawer(); toast('Đã xoá sản phẩm khỏi giỏ'); }
      else if (t.dataset.qbMinus !== undefined) { QB.qty = Math.max(1, QB.qty - 1); qbRefresh(); }
      else if (t.dataset.qbPlus !== undefined) { QB.qty = Math.min(99, QB.qty + 1); qbRefresh(); }
      else if (t.dataset.qbVariant !== undefined) { QB.variant = Number(t.dataset.qbVariant); qbRefresh(); }
      else if (t.dataset.qbClear !== undefined) { $('#qbFields1')?.classList.remove('hide'); $('#qbFields2')?.classList.remove('hide'); $('#qbSavedInfo')?.remove(); $('#qbSaved')?.remove(); $('#qbForm input[name=name]')?.focus(); }
      else if (t.dataset.qbCoupon !== undefined) { QB.coupon = ($('#qbCoupon').value || '').trim().toUpperCase(); qbRefresh(); }
      else if (t.dataset.copy !== undefined) { try { navigator.clipboard?.writeText(t.dataset.copy); toast('Đã sao chép: ' + t.dataset.copy); } catch (err) { /* bỏ qua */ } }
      else if (t.dataset.payQr !== undefined) { const o = store.get('mc_orders', []).find((x) => x.code === t.dataset.payQr); if (o) openPayQR(o); }
      else if (t.dataset.zaloCopy !== undefined) { try { navigator.clipboard?.writeText(`Mình muốn đặt: ${t.dataset.zaloCopy}`); toast('Đã sao chép tên sản phẩm – mẹ dán vào Zalo là xong'); } catch (err) { /* bỏ qua */ } }
      else if (t.dataset.wish !== undefined) { e.preventDefault(); const on = Wish.toggle(t.dataset.wish); t.classList.toggle('is-on', on); toast(on ? 'Đã thêm vào yêu thích 💗' : 'Đã bỏ yêu thích'); }
      else if (t.dataset.reorder !== undefined) { const o = store.get('mc_last_order'); if (o && o.items) { o.items.forEach((it) => { const p = byId(it.id); if (p) Cart.add(it.id, it.qty || 1, it.variant && p.variants ? p.variants.findIndex((v) => v.label === it.variant) : null); }); location.href = 'checkout.html'; } }
    });
    document.addEventListener('change', (e) => { const i = e.target.closest('[data-qty-input]'); if (i) { Cart.setQty(i.dataset.qtyInput, i.dataset.variant, Number(i.value) || 1); renderDrawer(); } if (e.target.id === 'qbVariantSel') { QB.variant = Number(e.target.value); qbRefresh(); } });
    document.addEventListener('submit', (e) => { if (e.target.id === 'qbForm') { e.preventDefault(); qbSubmit(e.target); } });
    document.addEventListener('input', (e) => { if (e.target.id === 'qbQty') { QB.qty = Math.max(1, Math.min(99, Number(e.target.value) || 1)); qbRefresh(); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.id === 'qbCoupon') { e.preventDefault(); $('[data-qb-coupon]')?.click(); } });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { $$('.modal.is-open').forEach((m) => { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); }); $('#cartDrawer').classList.remove('is-open'); $('#mmenu').classList.remove('is-open'); unlockScroll(); } });
    window.addEventListener('scroll', () => { const y = window.scrollY; $('#header').classList.toggle('is-scrolled', y > 10); $('#btnTop').classList.toggle('is-visible', y > 500); }, { passive: true });
  }

  /* ---------------- Countdown ---------------- */
  // endTs: mốc thời gian (ms) hoặc hàm trả về mốc (tính lại mỗi giây → tự sang ngày mới với ưu đãi 'daily')
  function countdown(el, endTs, label = 'Kết thúc sau') {
    const tick = () => { const end = typeof endTs === 'function' ? endTs() : endTs; const d = Math.max(0, end - Date.now()); const h = Math.floor(d / 36e5), m = Math.floor(d % 36e5 / 6e4), s = Math.floor(d % 6e4 / 1e3); el.innerHTML = `${label} <b>${String(h).padStart(2, '0')}</b><i>:</i><b>${String(m).padStart(2, '0')}</b><i>:</i><b>${String(s).padStart(2, '0')}</b>`; };
    tick(); return setInterval(tick, 1000);
  }

  /* ---------------- Ảnh thật lỗi/thiếu file → ảnh minh hoạ ---------------- */
  const IMG_MAP = {}; PRODUCTS.forEach((p) => { if (p.image) IMG_MAP[p.image] = [p, 0]; (p.images || []).forEach((im, i) => { IMG_MAP[im] = [p, i]; }); });
  document.addEventListener('error', (e) => { const img = e.target; if (!(img instanceof HTMLImageElement) || img.dataset.fb) return; const hit = IMG_MAP[img.getAttribute('src')]; if (hit) { img.dataset.fb = '1'; img.src = productImage(hit[0], hit[1], true); } }, true);


  /* ---------------- Tồn kho realtime (data/stock.json) ---------------- */
  const STOCK_URL = 'data/stock.json';
  function applyStock(data) {
    const items = (data && data.items) || {};
    PRODUCTS.forEach((p) => {
      if (!(p.id in items)) return;
      const e = items[p.id];
      const inStock = e && typeof e === 'object' ? e.in !== false : e !== false;
      p.stock = inStock ? (p.stock > 0 ? p.stock : 50) : 0;
      const vo = e && typeof e === 'object' ? e.variants : null;
      if (vo && p.variants) p.variants.forEach((v) => { if (v.label in vo) v.oos = vo[v.label] === false; });
    });
    if (data && data.updatedAt) MC.stockUpdatedAt = data.updatedAt;
    paintStock();
  }
  function paintStock() {
    $$('.pcard[data-id]').forEach((card) => {
      const p = byId(card.dataset.id); if (!p) return;
      const oos = p.stock <= 0;
      card.classList.toggle('pcard--oos', oos);
      card.querySelectorAll('[data-buy],[data-add]').forEach((b) => { b.disabled = oos; });
    });
    const cur = byId(param('id'));
    if (cur && $('.pdp__buy')) {
      const oos = cur.stock <= 0;
      $$('.pdp__buy [data-buy], .pdp__buy [data-add], .sticky-buy [data-buy], .sticky-buy [data-add]').forEach((b) => { b.disabled = oos; });
      const meta = $('.pdp__meta > span:last-child');
      if (meta) meta.innerHTML = oos ? '<span class="text-red fw-600">\u25cf T\u1ea1m h\u1ebft</span>' : '<span class="text-teal fw-600">\u25cf C\u00f2n h\u00e0ng</span>';
    }
  }
  function syncStock() {
    fetch(STOCK_URL + '?t=' + Date.now(), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null)).then((d) => { if (d) applyStock(d); }).catch(() => {});
  }

  /* ---------------- Boot ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    renderShell(); initSearch(); bindGlobal(); updateCartBadges();
    syncStock(); setInterval(syncStock, 3 * 60000); flushOrders();
    document.addEventListener('visibilitychange', () => { if (!document.hidden) syncStock(); });
  });

  window.MC = { $, $$, fmt, pct, param, esc, byId, brandOf, ageLabel, ageRange, productThumb, shortName, addrShow, hoursNote, MULTI_RATE, shopeeSale, shopeeBtn, vietqrPayload, payBox, payQrSvg, openPayQR, transferInfo, stripVN, store, phoneOk, I, starRow, productImage, productCard, Cart, Customer, Wish, submitOrder, shipFee, applyCoupon, deliveryEstimate, toast, openQuickBuy, openCallback, openCart, renderDrawer, countdown, orderSuccessHTML, syncStock, applyStock };
})();
