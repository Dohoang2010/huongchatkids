'use strict';
/* Trang web dựng sẵn cho Google + khách (nginx gửi sang máy chủ này):
   - Sản phẩm: huongchatkids.vn/<slug> (vd /nuoc-ep-lotte-tang-cao) – <title>, mô tả riêng, canonical, Open Graph, schema Product
     (giá, còn hàng, điểm đánh giá từ đánh giá khách trên website). Link cũ product.html?id=… → 301.
   - Bài cẩm nang: huongchatkids.vn/<mã bài> – nội dung bài có sẵn trong HTML, schema BlogPosting. Link cũ blog.html?id=… → 301.
   - Trang chủ, danh mục (collections.html), danh sách cẩm nang: chèn sẵn sản phẩm / bài viết vào khung trang
     (JavaScript của trang vẽ lại như cũ), kèm schema Organization / WebSite / ItemList.
   - js/data.js bản gọn cho khách: bỏ nội dung bài viết (chỉ trang bài mới cần), JSON viết liền, ảnh đổi sang WebP (anh-webp.js).
     Trang quản trị nạp bản đầy đủ: js/data.js?day-du=1.
   - /sitemap.xml tự cập nhật.
   Đọc cùng js/data.js mà trình duyệt dùng (bảng SP_SLUG / BAI_SLUG), nhớ theo thời điểm sửa tệp. */
const fs = require('node:fs');
const vm = require('node:vm');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

const GOC = 'https://huongchatkids.vn';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tuyetDoi = (u) => !u ? '' : /^https?:\/\//.test(u) ? u : GOC + '/' + String(u).replace(/^\/+/, '');
const gon = (s, n) => { s = String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
const fmt = (n) => (Math.round(n) || 0).toLocaleString('vi-VN') + '₫';
const json = (x) => JSON.stringify(x).replace(/</g, '\\u003c');
const ld = (x, id) => `<script type="application/ld+json"${id ? ` id="${id}"` : ''}>${json(x)}</script>`;
const ngayBai = (b) => { const m = String(b.date || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? new Date(+m[3], m[2] - 1, +m[1]).getTime() : (Date.parse(b.date) || 0); };
const iso = (t) => new Date(t).toISOString().slice(0, 10);

function taoTrangWeb({ thuMuc, bc, ghi, webp }) {
  const bo = {};   // tệp đọc theo thời điểm sửa
  function docTheoGio(ten, xuLy) {
    const duong = thuMuc + '/' + ten, luc = fs.statSync(duong).mtimeMs, c = bo[ten];
    if (c && c.luc === luc) return c.gt;
    const gt = xuLy(fs.readFileSync(duong, 'utf8')); bo[ten] = { luc, gt }; return gt;
  }
  const duLieu = () => docTheoGio('js/data.js', (ma) => {
    const hop = { console: { log() {}, warn() {}, error() {} }, location: { hostname: 'huongchatkids.vn', search: '', pathname: '/', hash: '', href: GOC + '/' } };
    hop.window = hop; hop.self = hop;
    vm.runInNewContext(ma, hop, { filename: 'data.js', timeout: 3000 });
    return { sp: hop.PRODUCTS || [], bai: hop.POSTS || [], hieu: hop.BRANDS || [], slug: hop.SP_SLUG || {}, theoSlug: hop.SP_THEO_SLUG || {},
      baiSlug: hop.BAI_SLUG || {}, baiTheoSlug: hop.BAI_THEO_SLUG || {}, banner: hop.BANNERS || [], leHoi: hop.LE_HOI, suKien: hop.SU_KIEN || null, danhMuc: hop.CATEGORIES || [], nhuCau: hop.NEEDS || [], tuoi: hop.AGES || [], site: hop.SITE || {},
      trangDm: hop.TRANG_DM || [], quaTang: hop.QUA_TANG || {}, gioVang: hop.GIO_VANG || [] };
  });
  const mau = (ten) => docTheoGio(ten, (s) => s);

  /* ---- Giao diện ngày lễ dựng sẵn (cùng tính toán với js/le-hoi.js) – dải chào mừng có sẵn trong HTML nên trang không bị xô khi nó hiện ---- */
  const leHoi = () => docTheoGio('js/le-hoi.js', (ma) => { const m = { exports: {} }; vm.runInNewContext(ma, { module: m, exports: m.exports, console: { log() {}, warn() {}, error() {} } }, { timeout: 2000 }); return m.exports; });
  function chenLe(html, ten) {
    try {
      const LH = leHoi(), d = duLieu(), cd = LH.chon(d.leHoi, Date.now()); if (!cd) return html;
      const p = String(ten || 'index.html').toLowerCase(), hop = (ds) => Array.isArray(ds) && ds.some((x) => x === '*' || String(x).toLowerCase() === p);
      if (!hop(cd.trang || ['*']) || hop(cd.truTrang || [])) return html;
      const cd0 = LH.CHU_DE[cd.chuDe] || LH.CHU_DE['hoa-hong'], m = cd.mau || {}, hl = (s, mac) => (/^#[0-9a-f]{6}$/i.test(String(s || '')) ? s : mac);
      const lop = 'le-on le--' + String(cd.chuDe || 'hoa-hong').replace(/[^a-z0-9-]/g, '');
      html = html.replace(/<html([^>]*)>/, (x, a) => '<html' + a + ' class="' + lop + '" style="--le-1:' + hl(m.m1, cd0.m1) + ';--le-2:' + hl(m.m2, cd0.m2) + ';--le-chu:' + hl(m.chu, cd0.chu) + '">');
      if (cd.dai) {
        const link = /^(https:\/\/|[a-z0-9-]+\.html)/i.test(String(cd.link || '')) && !/^javascript:/i.test(cd.link) ? cd.link : '';
        const st0 = String(cd.sticker || cd0.sticker || ''), sticker = String(cd.dai).indexOf(st0) === 0 ? '' : esc(st0);
        const dai = '<div class="le-dai" role="note" data-dung-san="1"><' + (link ? 'a href="' + esc(link) + '"' : 'div') + ' class="le-dai__in"><span class="le-dai__st" aria-hidden="true">' + sticker + '</span><span class="le-dai__chu">' + esc(cd.dai) + '</span>' +
          (link && cd.nut ? '<b>' + esc(cd.nut) + ' →</b>' : '') + '</' + (link ? 'a' : 'div') + '><button type="button" aria-label="Đóng lời chào">×</button></div>';
        html = html.replace(/<body([^>]*)>\n?/, (x) => x.replace(/\n?$/, '\n') + dai + '\n');
      }
    } catch (e) { ghi('trang-web: giao diện ngày lễ dựng sẵn lỗi – ' + e.message); }
    return html;
  }
  /* Hoàn thiện mọi trang HTML do máy chủ trả: dải ngày lễ + ảnh WebP */
  const hoanThien = (html, ten) => doiAnhHtml(chenLe(html, ten));
  /* Trang .html khác (giỏ hàng, tài khoản, giới thiệu…): chỉ hoàn thiện, không dựng nội dung */
  function trangKhac(ten) {
    if (!/^[a-z0-9-]+\.html$/.test(ten) || /^(admin|quan-ly-ton-kho)\.html$/.test(ten)) return null;
    let html; try { html = mau(ten); } catch { return null; }
    return hoanThien(html, ten);
  }
  const spHien = (d) => d.sp.filter((p) => !p.an);
  const baiHien = (d, xemTruoc) => d.bai.filter((b) => !b.nhap && (xemTruoc || ngayBai(b) <= Date.now())).sort((a, b) => ngayBai(b) - ngayBai(a));
  const spLink = (d, p) => d.slug[p.id] ? '/' + d.slug[p.id] : '/product.html?id=' + encodeURIComponent(p.id);
  const baiLink = (d, b) => d.baiSlug[b.id] ? '/' + d.baiSlug[b.id] : '/blog.html?id=' + encodeURIComponent(b.id);

  /* ---- ảnh WebP ---- */
  const anh = (u) => (webp && u && webp.duong(u)) || u;
  const doiAnhHtml = (html) => !webp ? html : html.replace(/(\ssrc=")(img\/[^"]+?\.(?:jpe?g|png))"/gi, (m, a, u) => { const w = webp.duong(u); return w ? a + w + '"' : m; });

  /* ---- ghép HTML ---- */
  function thayDauSEO(html, dau) {
    const a = html.indexOf('<!-- ADMIN:SEO'), b = html.indexOf('<!-- /ADMIN:SEO -->');
    if (a < 0 || b < 0) return html.replace('</head>', dau + '\n</head>');
    return html.slice(0, a) + dau + '\n  ' + html.slice(b + '<!-- /ADMIN:SEO -->'.length);
  }
  const themVaoDau = (html, them) => html.replace('</head>', '  ' + them + '\n</head>');
  /* Chèn nội dung vào khung rỗng <div ... id="X"></div> (JavaScript của trang sẽ vẽ lại) */
  const chen = (html, id, noiDung) => html.replace(new RegExp('(<div[^>]*\\sid="' + id + '"[^>]*>)(</div>)'), (m, a, b) => a + noiDung + b);
  const xoaMeta = (html, re) => html.replace(re, '');
  function dauTrang({ tieuDe, moTa, url, anhOg, loai, them }) {
    return `<title>${esc(tieuDe)}</title>
  <meta name="description" content="${esc(moTa)}">
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:type" content="${loai || 'website'}"><meta property="og:site_name" content="Hương Chất Kids">
  <meta property="og:title" content="${esc(tieuDe)}"><meta property="og:description" content="${esc(moTa)}">
  <meta property="og:url" content="${esc(url)}">${anhOg ? `<meta property="og:image" content="${esc(tuyetDoi(anhOg))}">` : ''}
  ${them || ''}`;
  }

  /* Tồn kho (data/stock.json do Quản trị › Tồn kho ghi) – giống MC.applyStock + MC.hetHang */
  const tonKho = () => { try { return docTheoGio('data/stock.json', (s) => (JSON.parse(s) || {}).items || {}); } catch { return {}; } };
  function hetHang(p) {
    const e = tonKho()[p.id]; let con = Number(p.stock) > 0, vo = null;
    if (e !== undefined) { con = e && typeof e === 'object' ? e.in !== false : e !== false; vo = e && typeof e === 'object' ? e.variants : null; }
    if (!con) return true;
    const ds = Array.isArray(p.variants) ? p.variants : []; if (!ds.length) return false;
    return ds.every((v) => (vo && v.label in vo ? vo[v.label] === false : !!v.oos));
  }
  /* Biểu tượng + nhãn độ tuổi lấy thẳng từ js/app.js (thẻ dựng sẵn giống hệt MC.productCard) */
  const cu = () => docTheoGio('js/app.js', (ma) => {
    const lay = (dau, cuoi) => { const a = ma.indexOf(dau); if (a < 0) return ''; const b = ma.indexOf(cuoi, a); return b < 0 ? '' : ma.slice(a, b + cuoi.length); };
    const hop = { AGES: duLieu().tuoi };
    try { vm.runInNewContext(lay('const ic = ', '\n  };') + '\n' + lay('const ageLabel = ', '\n  };') + '\nthis.I = I; this.ageRange = ageRange;', hop, { timeout: 1000 }); } catch (e) { ghi('trang-web: không đọc được biểu tượng app.js – ' + e.message); }
    return { I: hop.I || {}, ageRange: hop.ageRange || (() => '') };
  });
  /* Thẻ sản phẩm dựng sẵn – cùng HTML với MC.productCard (nút Mua ngay / giỏ hàng chạy bằng app.js) */
  function the(d, p, uuTien) {
    const { I, ageRange } = cu(), b = d.hieu.find((x) => x.key === p.brand) || {}, u = spLink(d, p), ten = p.short || p.name, het = hetHang(p);
    const giam = d.site.showOldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const tags = (p.tags || []).filter((t) => t !== 'Giảm sâu').slice(0, 2);
    const lop = (t) => (t === 'Mới' ? 'badge--new' : t === 'Combo' ? 'badge--teal' : t === 'Sản phẩm hot' ? 'badge--fire' : 'badge--hot');
    const ban = Number(p.sold) || 0, dg = Number(p.reviews) || 0;
    let tuoi = ''; try { tuoi = p.ages && p.ages.length ? `<span>${I.user || ''}${esc(ageRange(p.ages))}${p.family ? ' &amp; cả nhà' : ''}</span>` : `<span>${p.family ? '👨‍👩‍👧 Cả gia đình' : 'Dành cho mẹ'}</span>`; } catch { /* bỏ qua */ }
    return `<article class="pcard ${het ? 'pcard--oos' : ''}" data-id="${esc(p.id)}">
      <a class="pcard__media" href="${esc(u)}"><img src="${esc(anh(p.thumb || (p.images || [])[0] || p.image || ''))}" alt="${esc(ten)}" ${uuTien ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"'} width="420" height="420">
        <div class="pcard__badges">${giam >= 5 ? `<span class="badge badge--sale">-${giam}%</span>` : ''}${tags.map((t) => `<span class="badge ${lop(t)}">${t === 'Sản phẩm hot' ? '🔥 ' : ''}${esc(t)}</span>`).join('')}</div>
        <button class="pcard__wish" type="button" data-wish="${esc(p.id)}" aria-label="Lưu vào yêu thích" aria-pressed="false">${I.heart || ''}</button></a>
      <div class="pcard__body"><div class="pcard__brand">${esc(b.label || '')}${p.origin && p.origin !== 'Hàn Quốc' ? ' · ' + esc(p.origin) : ''}</div>
        <a class="pcard__name" href="${esc(u)}" title="${esc(p.name)}">${esc(ten)}</a>
        <div class="pcard__meta">${dg > 0 ? `<span class="star">${I.star || '★'}${(Number(p.rating) || 0).toFixed(1)} <span class="text-muted">(${dg})</span></span>` : ''}${dg > 0 && ban > 0 ? '<span>·</span>' : ''}${ban > 0 ? `<span>Đã bán ${ban >= 1000 ? (ban / 1000).toFixed(1) + 'k' : ban}</span>` : ''}${!dg && !ban ? `<span class="text-teal fw-600">${I.check || ''} Chính hãng</span>` : ''}</div>
        <div class="pcard__price"><b>${p.variants && p.variants.length > 1 ? '<small>từ</small> ' : ''}${fmt(p.price)}</b></div>
        <div class="pcard__age">${tuoi}</div>
        <div class="pcard__actions"><button class="btn btn--primary" type="button" data-buy="${esc(p.id)}" ${het ? 'disabled' : ''}>${I.zap || ''}Mua ngay</button><button class="btn btn--outline btn--icon" type="button" data-add="${esc(p.id)}" aria-label="Thêm ${esc(ten)} vào giỏ" ${het ? 'disabled' : ''}>${I.cart || ''}</button></div>
      </div></article>`;
  }
  /* Thẻ combo (giống index.html) */
  const theCombo = (d, p) => { const { I } = cu(), u = esc(spLink(d, p)), gom = (p.items || []).map((id) => (d.sp.find((x) => String(x.id) === String(id)) || {}).short).filter(Boolean);
    return `<div class="combo-card"><a href="${u}"><img src="${esc(anh((p.images || [])[0] || p.image || ''))}" alt="${esc(p.name)}" loading="lazy"></a><div><a href="${u}"><h3>${esc(p.name)}</h3></a>${gom.length ? `<div class="items">Gồm: ${esc(gom.join(' + '))}</div>` : ''}<div class="price"><b>${fmt(p.price)}</b></div><div class="flex gap-8 wrap"><button class="btn btn--primary" type="button" data-buy="${esc(p.id)}">${I.zap || ''}Mua ngay</button><button class="btn btn--outline" type="button" data-add="${esc(p.id)}">${I.cart || ''}Thêm giỏ</button></div></div></div>`; };
  const theBai = (d, b) => `<a class="post-card" href="${esc(baiLink(d, b))}"><div class="post-card__thumb" style="background:${esc(b.color || '#FFE9EF')}">${b.image ? `<img src="${esc(anh(b.image))}" alt="" loading="lazy">` : esc(b.emoji || '📖')}</div><div class="post-card__body"><div class="post-card__meta"><span class="badge badge--soft">${esc(b.cat)}</span><span>${esc(b.date)}</span></div><h3>${esc(b.title)}</h3><p>${esc(b.excerpt)}</p></div></a>`;
  const danhSachSP = (d, ds, url) => ({ '@context': 'https://schema.org', '@type': 'ItemList', url, numberOfItems: ds.length,
    itemListElement: ds.slice(0, 50).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: GOC + spLink(d, p), name: p.short || p.name })) });
  const vun = (ds) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: ds.map(([ten, u], i) => ({ '@type': 'ListItem', position: i + 1, name: ten, item: u })) });

  /* ================= Sản phẩm ================= */
  const nhoDg = new Map();   // đánh giá khách (đã hiện) – nhớ 5 phút mỗi sản phẩm
  async function danhGia(id) {
    const c = nhoDg.get(id); if (c && Date.now() - c.luc < 300000) return c.kq;
    let kq = null;
    try { const r = await bc.goiHam('apiDgDs', [{ id }], { thoiGian: 15000 }); if (r && r.ok) kq = r; } catch (e) { ghi('trang-sp đánh giá ' + id + ': ' + e.message); }
    nhoDg.set(id, { luc: Date.now(), kq }); if (nhoDg.size > 500) nhoDg.delete(nhoDg.keys().next().value);
    return kq;
  }
  function schemaSP(p, d, url, dg) {
    const hieu = d.hieu.find((b) => b.key === p.brand);
    const gia = (p.variants && p.variants.length ? p.variants.map((v) => Number(v.price) || 0) : [Number(p.price) || 0]).filter((g) => g > 0);
    const conHang = p.stock == null || Number(p.stock) > 0;
    const offer = gia.length > 1 && Math.min(...gia) !== Math.max(...gia)
      ? { '@type': 'AggregateOffer', priceCurrency: 'VND', lowPrice: Math.min(...gia), highPrice: Math.max(...gia), offerCount: gia.length }
      : { '@type': 'Offer', priceCurrency: 'VND', price: gia[0] || 0, priceValidUntil: iso(Date.now() + 30 * 864e5) };
    Object.assign(offer, { availability: 'https://schema.org/' + (conHang ? 'InStock' : 'OutOfStock'), url, itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: 'Hương Chất Kids' } });
    const o = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: String(p.id), url,
      image: [...new Set([p.image, ...(p.images || [])].filter(Boolean))].slice(0, 6).map(tuyetDoi),
      description: gon(p.seoDesc || p.desc, 500), offers: offer };
    if (hieu && hieu.key !== 'khac') o.brand = { '@type': 'Brand', name: hieu.label };
    if (p.cat) o.category = String(p.cat);
    if (dg && dg.so > 0) {
      o.aggregateRating = { '@type': 'AggregateRating', ratingValue: dg.tb, reviewCount: dg.so, bestRating: 5, worstRating: 1 };
      o.review = (dg.ds || []).slice(0, 5).map((r) => ({ '@type': 'Review', author: { '@type': 'Person', name: r.ten || 'Khách hàng' }, datePublished: iso(r.luc),
        reviewBody: gon(r.noiDung, 500), reviewRating: { '@type': 'Rating', ratingValue: r.sao, bestRating: 5, worstRating: 1 } }));
    }
    return ld(o, 'ldSP') + '\n  ' + ld(vun([['Trang chủ', GOC + '/'], ['Sản phẩm', GOC + '/collections.html'], [p.short || p.name, url]]));
  }
  async function trangSP(slug) {
    const d = duLieu(), id = d.theoSlug[slug]; if (id == null) return null;
    const p = d.sp.find((x) => String(x.id) === String(id)); if (!p || p.an) return null;
    const url = GOC + '/' + slug, dg = await danhGia(String(p.id));
    const tieuDe = p.seoTitle || ((p.short || p.name) + ' – chính hãng, giá tốt | Hương Chất Kids');
    const gia = Number((p.variants && p.variants[0] && p.variants[0].price) || p.price) || 0;
    const moTa = gon(p.seoDesc || (p.name + (gia ? ' giá ' + gia.toLocaleString('vi-VN') + 'đ' : '') + '. ' + (p.desc || '')), 158);
    const dau = dauTrang({ tieuDe, moTa, url, anhOg: p.image || (p.images || [])[0], loai: 'product',
      them: (gia ? `<meta property="product:price:amount" content="${gia}"><meta property="product:price:currency" content="VND">\n  ` : '') + schemaSP(p, d, url, dg) });
    const anhChinh = anh((p.images || [])[0] || p.image || '');   // ảnh lớn đầu trang (MC.productImage) – báo trình duyệt tải ngay, không chờ JS
    const dm = d.danhMuc.find((x) => x.key === p.cat), hieu = d.hieu.find((x) => x.key === p.brand) || {}, ten = p.short || p.name;
    const soAnh = p.images && p.images.length ? Math.min(6, p.images.length) : 0;
    const khung = `<nav class="breadcrumb"><a href="index.html">Trang chủ</a><span>›</span><a href="collections.html?cat=${esc(p.cat)}">${esc(dm ? dm.label : 'Sản phẩm')}</a><span>›</span><span>${esc(ten)}</span></nav>
    <div class="pdp"><div class="gallery"><div class="gallery__main">${anhChinh ? `<img id="mainImg" data-dung-san="1" src="${esc(anhChinh)}" alt="${esc(ten)}" fetchpriority="high">` : ''}</div>
      ${soAnh > 1 ? `<div class="gallery__thumbs">${p.images.slice(0, soAnh).map((u, i) => `<button type="button" class="${i ? '' : 'is-active'}" aria-label="Ảnh ${i + 1}"><img src="${esc(anh(u))}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}</div>
      <div class="pdp__info"><a class="pdp__brand" href="collections.html?brand=${esc(p.brand)}">${esc(hieu.label || '')}${p.origin ? ' · Xuất xứ ' + esc(p.origin) : ''}</a><h1 class="pdp__title">${esc(ten)}</h1>
        ${p.short && p.short !== p.name ? `<p class="pdp__fullname">${esc(p.name)}</p>` : ''}<p class="pdp__price"><b>${fmt(gia)}</b></p><p class="muted">${esc(gon(p.desc, 300))}</p></div></div>`;
    return doiAnhHtml(chen(themVaoDau(thayDauSEO(mau('product.html'), dau), anhChinh ? `<link rel="preload" as="image" href="${esc(anhChinh)}" fetchpriority="high">` : ''), 'pdp', khung));
  }

  /* ================= Bài cẩm nang ================= */
  /* mã mục (giống maMuc trong blog.html) + mục lục khi bài có từ 3 mục ## */
  const maMuc = (t) => 'muc-' + String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '').slice(0, 50);
  const mucLuc = (body) => { const ds = (body || []).map(String).filter((t) => /^## /.test(t)).map((t) => t.slice(3)); return ds.length >= 3 ? '<nav class="post-muc" aria-label="Mục lục bài viết"><b>Nội dung bài</b><ol>' + ds.map((t) => '<li><a href="#' + maMuc(t) + '">' + esc(t) + '</a></li>').join('') + '</ol></nav>' : ''; };
  function veNoiDung(d, body) {
    let h = '', ul = [];
    const xa = () => { if (ul.length) { h += '<ul>' + ul.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>'; ul = []; } };
    (body || []).forEach((t) => {
      t = String(t); let m;
      if (/^- /.test(t)) { ul.push(t.slice(2)); return; }
      xa();
      if (/^## /.test(t)) h += `<h2 id="${maMuc(t.slice(3))}">${esc(t.slice(3))}</h2>`;
      else if ((m = t.match(/^!\[(.*?)\]\((.+?)\)$/))) h += `<figure><img src="${esc(anh(m[2]))}" alt="${esc(m[1])}" loading="lazy">${m[1] ? `<figcaption>${esc(m[1])}</figcaption>` : ''}</figure>`;
      else if ((m = t.match(/^\[\[sp:(.+?)\]\]$/))) { const sp = d.sp.find((x) => String(x.id) === m[1] && !x.an); if (sp) h += `<p><a href="${esc(spLink(d, sp))}">${esc(sp.short || sp.name)} – ${fmt(sp.price)}</a></p>`; }
      else h += `<p>${esc(t)}</p>`;
    });
    xa(); return h;
  }
  function trangBai(d, b, xemTruoc) {
    const url = GOC + baiLink(d, b), tieuDe = b.seoTitle || (b.title + ' – Cẩm nang chăm con Hương Chất Kids');
    const moTa = gon(b.seoDesc || b.excerpt || (b.body || []).join(' '), 158), t = ngayBai(b) || Date.now();
    const bv = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: gon(b.title, 110), description: moTa, url, mainEntityOfPage: url,
      datePublished: iso(t), dateModified: iso(t), inLanguage: 'vi', articleSection: b.cat || undefined,
      author: { '@type': 'Organization', name: 'Hương Chất Kids', url: GOC + '/' },
      publisher: { '@type': 'Organization', name: 'Hương Chất Kids', logo: { '@type': 'ImageObject', url: GOC + '/img/logo-192.png' } } };
    if (b.image) bv.image = [tuyetDoi(b.image)];
    let html = thayDauSEO(mau('blog.html'), dauTrang({ tieuDe, moTa, url, anhOg: b.image, loai: 'article',
      them: `<meta property="article:published_time" content="${iso(t)}">\n  ${ld(bv)}\n  ${ld(vun([['Trang chủ', GOC + '/'], ['Cẩm nang chăm con', GOC + '/cam-nang'], [gon(b.title, 80), url]]))}` +
        (xemTruoc ? '\n  <meta name="robots" content="noindex">' : '') }));
    /* nội dung bài cho JavaScript của trang (data.js bản gọn không kèm nội dung bài) */
    html = html.replace('<script src="js/data.js', `<script>window.BAI_DAY_DU=${json({ id: b.id, body: b.body || [] })};</script>\n<script src="js/data.js`);
    html = chen(html, 'blogPage', `<nav class="breadcrumb"><a href="/">Trang chủ</a><span>›</span><a href="/cam-nang">Cẩm nang chăm con</a><span>›</span><a href="/blog.html?cat=${encodeURIComponent(b.cat || '')}">${esc(b.cat)}</a></nav>
      <article class="post"><h1>${esc(b.title)}</h1><div class="post-card__meta mb-12"><span class="badge badge--soft">${esc(b.cat)}</span><span>${esc(b.date)}</span></div>
      ${b.image ? `<div class="post__hero" style="background:${esc(b.color || '#FFE9EF')}"><img src="${esc(anh(b.image))}" alt=""></div>` : ''}<div class="post__body">${mucLuc(b.body)}${veNoiDung(d, b.body)}</div></article>`);
    return doiAnhHtml(html);
  }
  function trangBaiTheoSlug(slug) {
    const d = duLieu(), id = d.baiTheoSlug[slug]; if (id == null) return null;
    const b = baiHien(d, false).find((x) => x.id === id); return b ? trangBai(d, b, false) : null;
  }
  /* blog.html: ?id= → 301 sang link mới (xem trước từ quản trị thì giữ nguyên, kèm cả bài hẹn giờ); không id = danh sách bài */
  function trangBlog(thamSo) {
    const d = duLieu(), id = thamSo.get('id'), xemTruoc = thamSo.get('preview') === '1';
    if (id) {
      const b = (xemTruoc ? d.bai : baiHien(d, false)).find((x) => x.id === id);
      if (!b) return { html: doiAnhHtml(mau('blog.html')) };
      if (!xemTruoc && d.baiSlug[id]) { const con = new URLSearchParams(thamSo); con.delete('id'); const q = con.toString(); return { chuyen: '/' + d.baiSlug[id] + (q ? '?' + q : '') }; }
      return { html: trangBai(d, b, xemTruoc) };
    }
    const ds = baiHien(d, false), cat = thamSo.get('cat');
    const loc = cat ? ds.filter((b) => b.cat === cat) : ds;
    let html = mau('blog.html');
    html = themVaoDau(html, `<link rel="canonical" href="${GOC}/${cat ? 'blog.html?cat=' + encodeURIComponent(cat) : 'cam-nang'}">\n  ` +
      ld({ '@context': 'https://schema.org', '@type': 'Blog', name: 'Cẩm nang chăm con – Hương Chất Kids', url: GOC + '/blog.html',
        blogPost: loc.slice(0, 20).map((b) => ({ '@type': 'BlogPosting', headline: gon(b.title, 110), url: GOC + baiLink(d, b), datePublished: iso(ngayBai(b) || Date.now()) })) }));
    html = chen(html, 'blogPage', `<nav class="breadcrumb"><a href="/">Trang chủ</a><span>›</span><span>Cẩm nang chăm con</span></nav><h1 class="page-title">Cẩm nang chăm con${cat ? ' – ' + esc(cat) : ''}</h1>
      <div class="grid grid--3">${loc.map((b) => theBai(d, b)).join('')}</div>`);
    return { html: doiAnhHtml(html) };
  }

  /* ================= Trang chủ ================= */
  function trangChu() {
    const d = duLieu(), ds = spHien(d), s = d.site;
    const me = (p) => (p.cat === 'cho-me' || p.cat === 'thoi-trang' ? 1 : 0);   // giống MC.rankDefault (tab Bán chạy)
    const noiBat = ds.filter((p) => !p.isCombo).sort((a, b) => me(a) - me(b) || (Number(b.priority) || 0) - (Number(a.priority) || 0) || (Number(b.sold) || 0) - (Number(a.sold) || 0) || ds.indexOf(a) - ds.indexOf(b)).slice(0, 8);
    const to = { '@context': 'https://schema.org', '@type': 'OnlineStore', name: s.name || 'Hương Chất Kids', url: GOC + '/', logo: GOC + '/img/logo-192.png',
      description: s.slogan || undefined, email: s.email || undefined, telephone: s.hotlineTel || s.hotline || undefined,
      address: s.address ? { '@type': 'PostalAddress', streetAddress: s.address, addressCountry: 'VN' } : undefined,
      sameAs: [s.facebook, s.instagram, s.youtube, s.tiktok, s.shopee].filter((x) => typeof x === 'string' && /^https?:/.test(x)) };
    const web = { '@context': 'https://schema.org', '@type': 'WebSite', name: s.name || 'Hương Chất Kids', url: GOC + '/', inLanguage: 'vi',
      potentialAction: { '@type': 'SearchAction', target: GOC + '/collections.html?q={search_term_string}', 'query-input': 'required name=search_term_string' } };
    let html = mau('index.html');
    html = themVaoDau(html, `<link rel="canonical" href="${GOC}/">\n  ${ld(to)}\n  ${ld(web)}\n  ${ld(danhSachSP(d, noiBat, GOC + '/'))}`);
    /* Sự kiện đang hiện (giống MC.suKienHien): banner sự kiện lên đầu băng chuyền + giữ chỗ thanh tab "Trang chủ | sự kiện" (js/su-kien.js thay vào) */
    const sk = d.suKien && d.suKien.ketThuc && Date.now() >= Date.parse(d.suKien.hienTu || d.suKien.batDau) && Date.now() < Date.parse(d.suKien.ketThuc) ? d.suKien : null;
    const dsBanner = (sk && Array.isArray(sk.banners) ? sk.banners.map((b) => ({ anh: b, link: b.link, alt: b.alt })) : []).concat(d.banner);
    if (sk) html = html.replace(/<main id="app"([^>]*)>/, (x) => x + '\n<div class="sk-tabs-cho" aria-hidden="true"></div>');
    { const nay = Date.now(), bn = dsBanner.filter((b) => !(b.hienTu && nay < Date.parse(b.hienTu)) && !(b.anTu && nay >= Date.parse(b.anTu)))[0];
      if (bn && bn.anh && bn.anh.mb) {
        const mb = anh(bn.anh.mb), pc = anh(bn.anh.pc || bn.anh.mb);
        html = themVaoDau(html, `<link rel="preload" as="image" href="${esc(mb)}" media="(max-width: 767px)" fetchpriority="high"><link rel="preload" as="image" href="${esc(pc)}" media="(min-width: 768px)" fetchpriority="high">`);
        html = chen(html, 'carouselTrack', `<a class="slide slide--anh" data-dung-san="1" href="${esc(bn.link || '#')}"${bn.nen ? ` style="background:${esc(bn.nen)}"` : ''}><picture><source media="(min-width: 768px)" srcset="${esc(pc)}"><img src="${esc(mb)}" alt="${esc(bn.alt || '')}" loading="eager" fetchpriority="high"></picture></a>`);
      } }
    html = chen(html, 'featGrid', noiBat.map((p) => the(d, p)).join(''));
    html = chen(html, 'catGrid', d.danhMuc.map((c) => `<a class="cat-tile" href="/collections.html?cat=${esc(c.key)}" style="background:${esc(c.color || '')}"><b>${esc(c.label)}</b></a>`).join(''));
    html = chen(html, 'comboGrid', ds.filter((p) => p.isCombo).map((p) => theCombo(d, p)).join(''));
    html = chen(html, 'momGrid', ds.filter((p) => p.cat === 'cho-me' && !p.isCombo).sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0)).slice(0, 8).map((p) => the(d, p)).join(''));
    html = chen(html, 'postGrid',baiHien(d, false).slice(0, 3).map((b) => theBai(d, b)).join(''));
    html = chen(html, 'brandRow', d.hieu.filter((b) => b.key !== 'khac').map((b) => `<a href="/collections.html?brand=${esc(b.key)}">${esc(b.label)}</a>`).join(''));
    return doiAnhHtml(html);
  }

  /* ================= Danh mục ================= */
  /* Trang đích 8 mục menu (window.TRANG_DM) */
  const dsDm = (d) => (d.trangDm || []).filter((t) => t.trang !== 'blog');
  function trangDichTheoSlug(slug) { const d = duLieu(); return dsDm(d).find((t) => t.slug === slug) || null; }
  /* Sản phẩm đang khuyến mãi (gần giống MC.dangKhuyenMai): giờ vàng, chương trình quà đang chạy, combo ưu đãi */
  function dangKM(d, p) {
    const nay = Date.now(), ngay = new Date(nay + 7 * 3600e3).toISOString().slice(0, 10);
    const gv = (d.gioVang || []).some((g) => !g.tat && (!g.tuNgay || g.tuNgay <= ngay) && (!g.denNgay || ngay <= g.denNgay) && ((g.brands || []).includes(p.brand) || (g.sanPham || []).map(String).includes(String(p.id))));
    const ct = d.quaTang.enabled !== false && (d.quaTang.chuongTrinh || []).some((c) => !c.tat && (!c.batDau || Date.parse(c.batDau + '+07:00') <= nay) && (!c.ketThuc || nay < Date.parse(c.ketThuc + '+07:00'))
      && (c.sanPhamChinh || []).some((x) => x.bat !== false && String(x.id) === String(p.id)));
    return gv || ct || !!(p.isCombo && (p.uuDai || []).length);
  }
  function trangDanhMuc(thamSo, dmGoc) {
    const d = duLieu(), lay = (k) => thamSo.getAll(k).flatMap((v) => v.split(',')).filter(Boolean);
    const coLoc = ['cat', 'need', 'age', 'brand', 'price', 'q', 'tag', 'km', 'size', 'mau'].some((k) => thamSo.get(k));
    const DM = dmGoc || dsDm(d).find((t) => t.key === thamSo.get('dm')) || (!coLoc ? dsDm(d).find((t) => t.key === 'san-pham') : null) || null;
    const goc = DM && (dmGoc || !coLoc) ? DM.loc || {} : null;
    const nen = !goc && DM && !lay('cat').length && !thamSo.get('tag') && !thamSo.get('km') ? DM.loc || {} : null;   // ?dm= kèm lọc khác: giữ phạm vi của mục
    const cat = goc ? (goc.cat || []).slice() : nen ? (nen.cat || []).slice() : lay('cat'), need = goc ? [] : lay('need'), age = goc ? [] : lay('age'), brand = goc ? [] : lay('brand');
    const tag = goc ? goc.tag || '' : nen ? nen.tag || '' : thamSo.get('tag') || '', km = goc ? !!goc.km : nen ? !!nen.km : thamSo.get('km') === '1', q = goc ? '' : (thamSo.get('q') || '').trim();
    let ds = spHien(d).filter((p) => (!cat.length || cat.includes(p.cat)) && (!need.length || need.some((n) => (p.needs || []).includes(n)))
      && (!age.length || age.some((a) => (p.ages || []).includes(a))) && (!brand.length || brand.includes(p.brand)) && (!tag || (p.tags || []).includes(tag)) && (!km || dangKM(d, p)));
    const me = (p) => (p.cat === 'cho-me' || p.cat === 'thoi-trang' ? 1 : 0), thuTu = spHien(d);   // giống MC.rankDefault (Bán chạy nhất)
    ds.sort((a, b) => me(a) - me(b) || (Number(b.priority) || 0) - (Number(a.priority) || 0) || (Number(b.sold) || 0) - (Number(a.sold) || 0) || thuTu.indexOf(a) - thuTu.indexOf(b));
    const mot = (arr, ...khac) => arr.length === 1 && khac.every((x) => !x.length);
    let ten = 'Tất cả sản phẩm', moTa = '', canon = GOC + '/collections.html';
    const c = mot(cat, need, age, brand) && d.danhMuc.find((x) => x.key === cat[0]);
    const b = mot(brand, cat, need, age) && d.hieu.find((x) => x.key === brand[0]);
    const n = mot(need, cat, age, brand) && d.nhuCau.find((x) => x.key === need[0]);
    const t = mot(age, cat, need, brand) && d.tuoi.find((x) => x.key === age[0]);
    if (goc) { ten = DM.ten; canon = GOC + '/' + DM.slug; }
    else if (c) { ten = c.label; moTa = c.label + (c.desc ? ': ' + c.desc : '') + '. '; canon += '?cat=' + encodeURIComponent(c.key); }
    else if (b) { ten = b.label + ' chính hãng'; moTa = 'Sản phẩm ' + b.label + (b.origin ? ' (' + b.origin + ')' : '') + ' chính hãng. '; canon += '?brand=' + encodeURIComponent(b.key); }
    else if (n) { ten = n.label; moTa = n.label + '. '; canon += '?need=' + encodeURIComponent(n.key); }
    else if (t) { ten = 'Sản phẩm cho bé ' + t.label; moTa = 'Sản phẩm phù hợp bé ' + t.label + '. '; canon += '?age=' + encodeURIComponent(t.key); }
    else if (tag && !cat.length && !need.length && !age.length && !brand.length) { ten = tag; canon += '?tag=' + encodeURIComponent(tag); }
    const loc = goc || (!q && !km && (c || b || n || t || tag || (!cat.length && !need.length && !age.length && !brand.length)));
    moTa = goc ? gon(DM.gioiThieu || DM.ten, 158) : gon(moTa + ds.length + ' sản phẩm chính hãng tại Hương Chất Kids: ' + ds.slice(0, 4).map((p) => p.short || p.name).join(', ') + '. Giao nhanh, chuyên gia dinh dưỡng tư vấn miễn phí.', 158);
    const tieuDe = goc && DM.seoTieuDe ? DM.seoTieuDe : ten === 'Tất cả sản phẩm' ? 'Tất cả sản phẩm dinh dưỡng cho bé – Hương Chất Kids' : ten + ' – Hương Chất Kids';
    let html = mau('collections.html');
    html = thayDauSEO(html, dauTrang({ tieuDe, moTa, url: canon, them: (loc ? '' : '<meta name="robots" content="noindex, follow">\n  ') +
      ld(danhSachSP(d, ds, canon)) + '\n  ' + ld(vun(DM && !goc ? [['Trang chủ', GOC + '/'], [DM.nhan, GOC + '/' + DM.slug], [ten, canon]] : [['Trang chủ', GOC + '/'], [goc ? DM.nhan : ten, canon]])) }));
    html = html.replace(/(<h1 class="page-title" id="title">)[^<]*(<\/h1>)/, (m, a, z) => a + esc(ten) + z);
    html = chen(html, 'grid', ds.slice(0, 12).map((p, i) => the(d, p, i < 4)).join(''));   // trang đầu 12 sản phẩm như collections.html (PER = 12); 4 ảnh đầu tải ngay
    /* đường dẫn + hàng chọn độ tuổi dựng sẵn (giống collections.html) để trang không bị xô */
    html = html.replace(/(<nav class="breadcrumb" id="crumb">)(<\/nav>)/, (m, a, z) => a + '<a href="index.html">Trang chủ</a><span>›</span>' + (DM ? (goc ? '<span>' + esc(DM.nhan) + '</span>' : '<a href="/' + esc(DM.slug) + '">' + esc(DM.nhan) + '</a><span>›</span><span>' + esc(ten) + '</span>')
      : '<a href="collections.html">Sản phẩm</a>' + (ten !== 'Tất cả sản phẩm' ? '<span>›</span><span>' + esc(ten) + '</span>' : '')) + z);
    /* banner trang đích dựng sẵn (giống renderHero của collections.html) */
    if (DM) {
      const mau = DM.mau || {}, bien = Object.entries(mau).filter(([, v]) => /^#[0-9a-f]{3,8}$/i.test(String(v))).map(([k, v]) => '--dm-' + k + ':' + v).join(';');
      html = html.replace(/<body([^>]*)>/, (x, a) => '<body' + a + ' class="dm" data-dm="' + esc(DM.key) + '" style="' + bien + '">');
      html = html.replace('<header class="dm-hero" id="dmHero">', '<header class="dm-hero dm-hero--on" id="dmHero">');
      if (goc && DM.gioiThieu) html = chen(html, 'dmIntro', '<p>' + esc(DM.gioiThieu) + '</p>');
      const l = DM.loc || {}, anh3 = spHien(d).filter((p) => (!l.cat || l.cat.includes(p.cat)) && (!l.tag || (p.tags || []).includes(l.tag)) && (!l.km || dangKM(d, p)) && !p.isCombo)
        .sort((a, b) => me(a) - me(b) || (Number(b.priority) || 0) - (Number(a.priority) || 0) || (Number(b.sold) || 0) - (Number(a.sold) || 0) || thuTu.indexOf(a) - thuTu.indexOf(b)).slice(0, 3);
      html = chen(html, 'dmAnh', anh3.map((p, i) => '<img src="' + esc(anh(p.thumb || p.image || '')) + '" alt="" width="180" height="180"' + (i ? ' loading="lazy"' : '') + '>').join(''));
      if (goc && DM.con === 'danhMuc') html = chen(html, 'dmCon', d.danhMuc.filter((c) => (!l.cat || l.cat.includes(c.key)) && spHien(d).some((p) => p.cat === c.key))
        .map((c) => '<a class="dm-o" href="collections.html?cat=' + esc(c.key) + '&amp;dm=' + esc(DM.key) + '">' + (c.image ? '<img src="' + esc(anh(c.image)) + '" alt="" width="44" height="44" loading="lazy">' : '<span class="dm-o__ic">' + esc(c.icon || '') + '</span>')
          + '<span><b>' + esc(c.label) + '</b><small>' + spHien(d).filter((p) => p.cat === c.key).length + ' sản phẩm</small></span></a>').join(''));
    }
    html = html.replace(/(<p class="text-muted fs-14 mb-16" id="subtitle">)(<\/p>)/, (m, a, z) => thamSo.get('km') ? m : a + esc(age.length === 1 ? 'Chuyên gia dinh dưỡng đã chọn lọc sản phẩm phù hợp cho bé ' + ((d.tuoi.find((t) => t.key === age[0]) || {}).label || age[0]) : 'Hàng chính hãng · Freeship từ 3 triệu · Đổi trả 7 ngày') + z);
    /* bộ lọc bên trái, bộ lọc đang chọn, số sản phẩm – dựng sẵn giống collections.html (renderFilters / renderActive) */
    { const tatCa = spHien(d), S = { age, cat, need, brand, price: lay('price') };
      let KHOANG = []; try { const mm = mau('collections.html').match(/const PRICE_RANGES = (\[[^;]*\]);/); if (mm) KHOANG = vm.runInNewContext(mm[1], {}, { timeout: 200 }); } catch { /* bỏ qua */ }
      const cb = (name, key, label, n) => '<label><input type="checkbox" name="' + name + '" value="' + esc(key) + '" ' + (S[name].includes(key) ? 'checked' : '') + '>' + label + '<span class="count">' + n + '</span></label>';
      html = chen(html, 'fAge', d.tuoi.map((a) => cb('age', a.key, esc(a.emoji) + ' ' + esc(a.label), tatCa.filter((p) => (p.ages || []).includes(a.key)).length)).join(''));
      html = chen(html, 'fCat', d.danhMuc.map((c) => cb('cat', c.key, esc(c.label), tatCa.filter((p) => p.cat === c.key).length)).join(''));
      html = chen(html, 'fNeed', d.nhuCau.map((n) => cb('need', n.key, esc(n.label), tatCa.filter((p) => (p.needs || []).includes(n.key)).length)).join(''));
      html = chen(html, 'fBrand', d.hieu.filter((b) => tatCa.some((p) => p.brand === b.key)).map((b) => cb('brand', b.key, esc(b.label), tatCa.filter((p) => p.brand === b.key).length)).join(''));
      if (KHOANG.length) html = chen(html, 'fPrice', KHOANG.map((r) => cb('price', r.key, esc(r.label), tatCa.filter((p) => p.price >= r.min && p.price < r.max).length)).join(''));
      const chip = (k, v, nhan) => '<button class="chip chip--sm is-active" type="button" data-rm="' + k + '" data-val="' + esc(v) + '">' + esc(nhan) + ' <span class="chip__x">×</span></button>';
      const chips = [].concat(age.map((a) => chip('age', a, (d.tuoi.find((t) => t.key === a) || {}).label || a)), cat.map((c) => chip('cat', c, (d.danhMuc.find((x) => x.key === c) || {}).label || c)),
        need.map((n) => chip('need', n, (d.nhuCau.find((x) => x.key === n) || {}).label || n)), brand.map((b) => chip('brand', b, (d.hieu.find((x) => x.key === b) || {}).label || b)), tag ? [chip('tag', tag, tag)] : []);
      if (chips.length && !q && !S.price.length && !thamSo.get('km')) html = chen(html, 'activeFilters', chips.join('') + '<button class="chip chip--sm" type="button" id="clearAllChips">Xoá tất cả</button>');
      html = html.replace(/(<span class="count" id="count">)(<\/span>)/, (m, a, z) => a + ds.length + ' sản phẩm' + z); }
    html = chen(html, 'ageChips', '<a class="chip' + (!age.length ? ' is-active' : '') + '" href="#" data-age="">Tất cả tuổi</a>' + d.tuoi.map((t) => '<a class="chip' + (age.length === 1 && age[0] === t.key ? ' is-active' : '') + '" href="#" data-age="' + esc(t.key) + '">' + esc(t.emoji) + ' ' + esc(t.label) + '</a>').join(''));
    return doiAnhHtml(html);
  }

  /* ================= data.js bản gọn ================= */
  let nhoData = null;
  function dataGon() {
    const st = fs.statSync(thuMuc + '/js/data.js'), khoa = st.mtimeMs + ':' + (webp ? webp.phienBan : 0);
    if (nhoData && nhoData.khoa === khoa) return nhoData;
    let s = fs.readFileSync(thuMuc + '/js/data.js', 'utf8'), bot = 0;
    s = s.replace(/(\/\* ===ADMIN:(\w+)===[^\n]*\n)([\s\S]*?)(\/\* ===\/ADMIN:\2=== \*\/)/g, (m, mo, ten, than, dong) => {
      const k = than.match(/^\s*window\.(\w+)\s*=\s*([\s\S]*?);?\s*$/); if (!k) return m;
      let gt; try { gt = JSON.parse(k[2]); } catch { return m; }
      if (ten === 'POSTS' && Array.isArray(gt)) gt = gt.filter((b) => !b.nhap).map((b) => { const o = Object.assign({}, b); delete o.body; return o; });
      bot++; return mo + 'window.' + k[1] + ' = ' + JSON.stringify(gt) + ';\n' + dong;
    });
    if (webp) s = s.replace(/(["'])(img\/[^"'\s]+?\.(?:jpe?g|png))\1/gi, (m, q, u) => { const w = webp.duong(u); return w ? q + w + q : m; });
    s = '/* Hương Chất Kids – dữ liệu web (bản gọn cho khách, bản đầy đủ: js/data.js?day-du=1) */\n' + s + '\nwindow.POSTS_GON = true;\n';
    const buf = Buffer.from(s, 'utf8');
    nhoData = { khoa, buf, etag: '"' + crypto.createHash('sha1').update(buf).digest('base64url').slice(0, 20) + '"', gz: zlib.gzipSync(buf, { level: 9 }),
      br: zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }), khoi: bot };
    return nhoData;
  }

  /* ================= Sitemap ================= */
  function sitemap() {
    const d = duLieu(), nay = iso(Date.now());
    const dong = (loc, tanSuat, uuTien, luc) => `  <url><loc>${esc(loc)}</loc><lastmod>${luc || nay}</lastmod><changefreq>${tanSuat}</changefreq><priority>${uuTien}</priority></url>`;
    const ds = [dong(GOC + '/', 'daily', '1.0'), dong(GOC + '/cam-nang', 'weekly', '0.7'), dong(GOC + '/do-chi-so-cho-be.html', 'monthly', '0.8'),
      dong(GOC + '/gioi-thieu.html', 'monthly', '0.5'), dong(GOC + '/doi-tac.html', 'monthly', '0.5'), dong(GOC + '/policy.html', 'yearly', '0.3')];
    dsDm(d).forEach((t) => ds.push(dong(GOC + '/' + t.slug, 'daily', '0.9')));
    d.danhMuc.filter((c) => !dsDm(d).some((t) => t.loc && String(t.loc.cat || []) === c.key)).forEach((c) => ds.push(dong(GOC + '/collections.html?cat=' + encodeURIComponent(c.key), 'weekly', '0.7')));
    spHien(d).forEach((p) => { if (d.slug[p.id]) ds.push(dong(GOC + '/' + d.slug[p.id], 'weekly', '0.8')); });
    baiHien(d, false).forEach((b) => ds.push(dong(GOC + baiLink(d, b), 'monthly', '0.6', ngayBai(b) ? iso(ngayBai(b)) : nay)));
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ds.join('\n') + '\n</urlset>\n';
  }

  function chuyenDanhMuc(thamSo) {
    const d = duLieu(), khoa = [...new Set([...thamSo.keys()])];
    if (khoa.some((k) => !['cat', 'tag', 'km', 'dm', 'sort', 'page'].includes(k))) return null;
    const giu = new URLSearchParams(); ['sort', 'page'].forEach((k) => { if (thamSo.get(k)) giu.set(k, thamSo.get(k)); });
    const cat = thamSo.getAll('cat').flatMap((v) => v.split(',')).filter(Boolean).sort(), tag = thamSo.get('tag') || '', km = thamSo.get('km') === '1', dm = thamSo.get('dm');
    const t = dsDm(d).find((x) => (dm ? x.key === dm && !cat.length && !tag && !km : String([...((x.loc || {}).cat || [])].sort()) === String(cat) && ((x.loc || {}).tag || '') === tag && !!(x.loc || {}).km === km));
    return t ? '/' + t.slug + (giu.toString() ? '?' + giu : '') : null;
  }
  /* product.html?id=X → /slug (giữ các tham số khác, bỏ id); null = để nguyên */
  function chuyenTuLinkCu(thamSo) {
    if (thamSo.get('preview')) return null;
    const id = thamSo.get('id'); if (!id) return null;
    const slug = duLieu().slug[id]; if (!slug) return null;
    const con = new URLSearchParams(thamSo); con.delete('id');
    const q = con.toString(); return '/' + slug + (q ? '?' + q : '');
  }

  return { trangSP, trangBaiTheoSlug, trangBlog, trangChu, trangDanhMuc, trangDichTheoSlug, chuyenDanhMuc, dataGon, sitemap, chuyenTuLinkCu, hoanThien, trangKhac, doiAnhHtml, mau };
}

module.exports = { taoTrangWeb };
