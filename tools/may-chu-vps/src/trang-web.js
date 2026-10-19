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
      baiSlug: hop.BAI_SLUG || {}, baiTheoSlug: hop.BAI_THEO_SLUG || {}, danhMuc: hop.CATEGORIES || [], nhuCau: hop.NEEDS || [], tuoi: hop.AGES || [], site: hop.SITE || {} };
  });
  const mau = (ten) => docTheoGio(ten, (s) => s);
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

  /* Biểu tượng + nhãn độ tuổi lấy thẳng từ js/app.js (thẻ dựng sẵn giống hệt MC.productCard) */
  const cu = () => docTheoGio('js/app.js', (ma) => {
    const lay = (dau, cuoi) => { const a = ma.indexOf(dau); if (a < 0) return ''; const b = ma.indexOf(cuoi, a); return b < 0 ? '' : ma.slice(a, b + cuoi.length); };
    const hop = { AGES: duLieu().tuoi };
    try { vm.runInNewContext(lay('const ic = ', '\n  };') + '\n' + lay('const ageLabel = ', '\n  };') + '\nthis.I = I; this.ageRange = ageRange;', hop, { timeout: 1000 }); } catch (e) { ghi('trang-web: không đọc được biểu tượng app.js – ' + e.message); }
    return { I: hop.I || {}, ageRange: hop.ageRange || (() => '') };
  });
  /* Thẻ sản phẩm dựng sẵn – cùng HTML với MC.productCard (nút Mua ngay / giỏ hàng chạy bằng app.js) */
  function the(d, p) {
    const { I, ageRange } = cu(), b = d.hieu.find((x) => x.key === p.brand) || {}, u = spLink(d, p), ten = p.short || p.name, het = Number(p.stock) <= 0;
    const giam = d.site.showOldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const tags = (p.tags || []).filter((t) => t !== 'Giảm sâu').slice(0, 2);
    const lop = (t) => (t === 'Mới' ? 'badge--new' : t === 'Combo' ? 'badge--teal' : t === 'Sản phẩm hot' ? 'badge--fire' : 'badge--hot');
    const ban = Number(p.sold) || 0, dg = Number(p.reviews) || 0;
    let tuoi = ''; try { tuoi = p.ages && p.ages.length ? `<span>${I.user || ''}${esc(ageRange(p.ages))}${p.family ? ' &amp; cả nhà' : ''}</span>` : `<span>${p.family ? '👨‍👩‍👧 Cả gia đình' : 'Dành cho mẹ'}</span>`; } catch { /* bỏ qua */ }
    return `<article class="pcard ${het ? 'pcard--oos' : ''}" data-id="${esc(p.id)}">
      <a class="pcard__media" href="${esc(u)}"><img src="${esc(anh(p.thumb || (p.images || [])[0] || p.image || ''))}" alt="${esc(ten)}" loading="lazy" width="420" height="420">
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
    return doiAnhHtml(thayDauSEO(mau('product.html'), dau));
  }

  /* ================= Bài cẩm nang ================= */
  function veNoiDung(d, body) {
    let h = '', ul = [];
    const xa = () => { if (ul.length) { h += '<ul>' + ul.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>'; ul = []; } };
    (body || []).forEach((t) => {
      t = String(t); let m;
      if (/^- /.test(t)) { ul.push(t.slice(2)); return; }
      xa();
      if (/^## /.test(t)) h += `<h2>${esc(t.slice(3))}</h2>`;
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
      them: `<meta property="article:published_time" content="${iso(t)}">\n  ${ld(bv)}\n  ${ld(vun([['Trang chủ', GOC + '/'], ['Cẩm nang chăm con', GOC + '/blog.html'], [gon(b.title, 80), url]]))}` +
        (xemTruoc ? '\n  <meta name="robots" content="noindex">' : '') }));
    /* nội dung bài cho JavaScript của trang (data.js bản gọn không kèm nội dung bài) */
    html = html.replace('<script src="js/data.js', `<script>window.BAI_DAY_DU=${json({ id: b.id, body: b.body || [] })};</script>\n<script src="js/data.js`);
    html = chen(html, 'blogPage', `<nav class="breadcrumb"><a href="/">Trang chủ</a><span>›</span><a href="/blog.html">Cẩm nang chăm con</a><span>›</span><span>${esc(b.cat)}</span></nav>
      <article class="post"><h1>${esc(b.title)}</h1><div class="post-card__meta mb-12"><span class="badge badge--soft">${esc(b.cat)}</span><span>${esc(b.date)}</span></div>
      ${b.image ? `<div class="post__hero" style="background:${esc(b.color || '#FFE9EF')}"><img src="${esc(anh(b.image))}" alt=""></div>` : ''}<div class="post__body">${veNoiDung(d, b.body)}</div></article>`);
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
    html = themVaoDau(html, `<link rel="canonical" href="${GOC}/blog.html${cat ? '?cat=' + encodeURIComponent(cat) : ''}">\n  ` +
      ld({ '@context': 'https://schema.org', '@type': 'Blog', name: 'Cẩm nang chăm con – Hương Chất Kids', url: GOC + '/blog.html',
        blogPost: loc.slice(0, 20).map((b) => ({ '@type': 'BlogPosting', headline: gon(b.title, 110), url: GOC + baiLink(d, b), datePublished: iso(ngayBai(b) || Date.now()) })) }));
    html = chen(html, 'blogPage', `<nav class="breadcrumb"><a href="/">Trang chủ</a><span>›</span><span>Cẩm nang chăm con</span></nav><h1 class="page-title">Cẩm nang chăm con${cat ? ' – ' + esc(cat) : ''}</h1>
      <div class="grid grid--3">${loc.map((b) => theBai(d, b)).join('')}</div>`);
    return { html: doiAnhHtml(html) };
  }

  /* ================= Trang chủ ================= */
  function trangChu() {
    const d = duLieu(), ds = spHien(d), s = d.site;
    const me = (p) => (p.cat === 'cho-me' ? 1 : 0);   // giống MC.rankDefault (tab Bán chạy)
    const noiBat = ds.filter((p) => !p.isCombo).sort((a, b) => me(a) - me(b) || (Number(b.priority) || 0) - (Number(a.priority) || 0) || (Number(b.sold) || 0) - (Number(a.sold) || 0) || ds.indexOf(a) - ds.indexOf(b)).slice(0, 8);
    const to = { '@context': 'https://schema.org', '@type': 'OnlineStore', name: s.name || 'Hương Chất Kids', url: GOC + '/', logo: GOC + '/img/logo-192.png',
      description: s.slogan || undefined, email: s.email || undefined, telephone: s.hotlineTel || s.hotline || undefined,
      address: s.address ? { '@type': 'PostalAddress', streetAddress: s.address, addressCountry: 'VN' } : undefined,
      sameAs: [s.facebook, s.instagram, s.youtube, s.tiktok, s.shopee].filter((x) => typeof x === 'string' && /^https?:/.test(x)) };
    const web = { '@context': 'https://schema.org', '@type': 'WebSite', name: s.name || 'Hương Chất Kids', url: GOC + '/', inLanguage: 'vi',
      potentialAction: { '@type': 'SearchAction', target: GOC + '/collections.html?q={search_term_string}', 'query-input': 'required name=search_term_string' } };
    let html = mau('index.html');
    html = themVaoDau(html, `<link rel="canonical" href="${GOC}/">\n  ${ld(to)}\n  ${ld(web)}\n  ${ld(danhSachSP(d, noiBat, GOC + '/'))}`);
    html = chen(html, 'featGrid', noiBat.map((p) => the(d, p)).join(''));
    html = chen(html, 'catGrid', d.danhMuc.map((c) => `<a class="cat-tile" href="/collections.html?cat=${esc(c.key)}" style="background:${esc(c.color || '')}"><b>${esc(c.label)}</b></a>`).join(''));
    html = chen(html, 'comboGrid', ds.filter((p) => p.isCombo).map((p) => theCombo(d, p)).join(''));
    html = chen(html, 'momGrid', ds.filter((p) => p.cat === 'cho-me' && !p.isCombo).sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0)).slice(0, 8).map((p) => the(d, p)).join(''));
    html = chen(html, 'postGrid',baiHien(d, false).slice(0, 3).map((b) => theBai(d, b)).join(''));
    html = chen(html, 'brandRow', d.hieu.filter((b) => b.key !== 'khac').map((b) => `<a href="/collections.html?brand=${esc(b.key)}">${esc(b.label)}</a>`).join(''));
    return doiAnhHtml(html);
  }

  /* ================= Danh mục ================= */
  function trangDanhMuc(thamSo) {
    const d = duLieu(), lay = (k) => thamSo.getAll(k).filter(Boolean);
    const cat = lay('cat'), need = lay('need'), age = lay('age'), brand = lay('brand'), tag = thamSo.get('tag') || '', q = (thamSo.get('q') || '').trim();
    let ds = spHien(d).filter((p) => (!cat.length || cat.includes(p.cat)) && (!need.length || need.some((n) => (p.needs || []).includes(n)))
      && (!age.length || age.some((a) => (p.ages || []).includes(a))) && (!brand.length || brand.includes(p.brand)) && (!tag || (p.tags || []).includes(tag)));
    ds.sort((a, b) => (Number(b.sold) || 0) - (Number(a.sold) || 0));
    const mot = (arr, ...khac) => arr.length === 1 && khac.every((x) => !x.length);
    let ten = 'Tất cả sản phẩm', moTa = '', canon = GOC + '/collections.html';
    const c = mot(cat, need, age, brand) && d.danhMuc.find((x) => x.key === cat[0]);
    const b = mot(brand, cat, need, age) && d.hieu.find((x) => x.key === brand[0]);
    const n = mot(need, cat, age, brand) && d.nhuCau.find((x) => x.key === need[0]);
    const t = mot(age, cat, need, brand) && d.tuoi.find((x) => x.key === age[0]);
    if (c) { ten = c.label; moTa = c.label + (c.desc ? ': ' + c.desc : '') + '. '; canon += '?cat=' + encodeURIComponent(c.key); }
    else if (b) { ten = b.label + ' chính hãng'; moTa = 'Sản phẩm ' + b.label + (b.origin ? ' (' + b.origin + ')' : '') + ' chính hãng. '; canon += '?brand=' + encodeURIComponent(b.key); }
    else if (n) { ten = n.label; moTa = n.label + '. '; canon += '?need=' + encodeURIComponent(n.key); }
    else if (t) { ten = 'Sản phẩm cho bé ' + t.label; moTa = 'Sản phẩm phù hợp bé ' + t.label + '. '; canon += '?age=' + encodeURIComponent(t.key); }
    else if (tag && !cat.length && !need.length && !age.length && !brand.length) { ten = tag; canon += '?tag=' + encodeURIComponent(tag); }
    const loc = !q && (c || b || n || t || tag || (!cat.length && !need.length && !age.length && !brand.length));
    moTa = gon(moTa + ds.length + ' sản phẩm chính hãng tại Hương Chất Kids: ' + ds.slice(0, 4).map((p) => p.short || p.name).join(', ') + '. Giao nhanh, chuyên gia dinh dưỡng tư vấn miễn phí.', 158);
    const tieuDe = ten === 'Tất cả sản phẩm' ? 'Tất cả sản phẩm dinh dưỡng cho bé – Hương Chất Kids' : ten + ' – Hương Chất Kids';
    let html = mau('collections.html');
    html = thayDauSEO(html, dauTrang({ tieuDe, moTa, url: canon, them: (loc ? '' : '<meta name="robots" content="noindex, follow">\n  ') +
      ld(danhSachSP(d, ds, canon)) + '\n  ' + ld(vun([['Trang chủ', GOC + '/'], [ten, canon]])) }));
    html = html.replace(/(<h1 class="page-title" id="title">)[^<]*(<\/h1>)/, (m, a, z) => a + esc(ten) + z);
    html = chen(html, 'grid', ds.map((p) => the(d, p)).join(''));
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
    const ds = [dong(GOC + '/', 'daily', '1.0'), dong(GOC + '/collections.html', 'daily', '0.9'), dong(GOC + '/blog.html', 'weekly', '0.7'),
      dong(GOC + '/gioi-thieu.html', 'monthly', '0.5'), dong(GOC + '/doi-tac.html', 'monthly', '0.5'), dong(GOC + '/policy.html', 'yearly', '0.3')];
    d.danhMuc.forEach((c) => ds.push(dong(GOC + '/collections.html?cat=' + encodeURIComponent(c.key), 'weekly', '0.7')));
    spHien(d).forEach((p) => { if (d.slug[p.id]) ds.push(dong(GOC + '/' + d.slug[p.id], 'weekly', '0.8')); });
    baiHien(d, false).forEach((b) => ds.push(dong(GOC + baiLink(d, b), 'monthly', '0.6', ngayBai(b) ? iso(ngayBai(b)) : nay)));
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ds.join('\n') + '\n</urlset>\n';
  }

  /* product.html?id=X → /slug (giữ các tham số khác, bỏ id); null = để nguyên */
  function chuyenTuLinkCu(thamSo) {
    if (thamSo.get('preview')) return null;
    const id = thamSo.get('id'); if (!id) return null;
    const slug = duLieu().slug[id]; if (!slug) return null;
    const con = new URLSearchParams(thamSo); con.delete('id');
    const q = con.toString(); return '/' + slug + (q ? '?' + q : '');
  }

  return { trangSP, trangBaiTheoSlug, trangBlog, trangChu, trangDanhMuc, dataGon, sitemap, chuyenTuLinkCu, doiAnhHtml, mau };
}

module.exports = { taoTrangWeb };
