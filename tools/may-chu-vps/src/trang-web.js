'use strict';
/* Trang sản phẩm có từ khoá cho Google: huongchatkids.vn/<slug> (vd /nuoc-ep-lotte-tang-cao).
   nginx không tìm thấy tệp tĩnh → hỏi máy chủ này. Đọc js/data.js (cùng bảng SP_SLUG trình duyệt dùng) + product.html,
   chèn sẵn <title>, mô tả riêng từng sản phẩm, canonical, Open Graph và dữ liệu cấu trúc Product (giá, còn hàng, điểm đánh giá
   từ đánh giá khách trên website). Link cũ product.html?id=… → chuyển 301 sang link mới. Kèm /sitemap.xml tự cập nhật. */
const fs = require('node:fs');
const vm = require('node:vm');

const GOC = 'https://huongchatkids.vn';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const tuyetDoi = (u) => !u ? '' : /^https?:\/\//.test(u) ? u : GOC + '/' + String(u).replace(/^\/+/, '');
const gon = (s, n) => { s = String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };

function taoTrangWeb({ thuMuc, bc, ghi }) {
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
    return { sp: hop.PRODUCTS || [], bai: hop.POSTS || [], hieu: hop.BRANDS || [], slug: hop.SP_SLUG || {}, theoSlug: hop.SP_THEO_SLUG || {} };
  });
  const mau = () => docTheoGio('product.html', (s) => s);

  /* Đánh giá khách (đã hiện) – nhớ 5 phút mỗi sản phẩm */
  const nhoDg = new Map();
  async function danhGia(id) {
    const c = nhoDg.get(id); if (c && Date.now() - c.luc < 300000) return c.kq;
    let kq = null;
    try { const r = await bc.goiHam('apiDgDs', [{ id }], { thoiGian: 15000 }); if (r && r.ok) kq = r; } catch (e) { ghi('trang-sp đánh giá ' + id + ': ' + e.message); }
    nhoDg.set(id, { luc: Date.now(), kq }); if (nhoDg.size > 500) nhoDg.delete(nhoDg.keys().next().value);
    return kq;
  }

  function schema(p, d, url, dg) {
    const hieu = d.hieu.find((b) => b.key === p.brand);
    const gia = (p.variants && p.variants.length ? p.variants.map((v) => Number(v.price) || 0) : [Number(p.price) || 0]).filter((g) => g > 0);
    const conHang = p.stock == null || Number(p.stock) > 0;
    const hetHan = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    const offer = gia.length > 1 && Math.min(...gia) !== Math.max(...gia)
      ? { '@type': 'AggregateOffer', priceCurrency: 'VND', lowPrice: Math.min(...gia), highPrice: Math.max(...gia), offerCount: gia.length }
      : { '@type': 'Offer', priceCurrency: 'VND', price: gia[0] || 0, priceValidUntil: hetHan };
    Object.assign(offer, { availability: 'https://schema.org/' + (conHang ? 'InStock' : 'OutOfStock'), url, itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: 'Hương Chất Kids' } });
    const o = { '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: String(p.id), url,
      image: [...new Set([p.image, ...(p.images || [])].filter(Boolean))].slice(0, 6).map(tuyetDoi),
      description: gon(p.seoDesc || p.desc, 500), offers: offer };
    if (hieu && hieu.key !== 'khac') o.brand = { '@type': 'Brand', name: hieu.label };
    if (p.cat) o.category = String(p.cat);
    if (dg && dg.so > 0) {
      o.aggregateRating = { '@type': 'AggregateRating', ratingValue: dg.tb, reviewCount: dg.so, bestRating: 5, worstRating: 1 };
      o.review = (dg.ds || []).slice(0, 5).map((r) => ({ '@type': 'Review', author: { '@type': 'Person', name: r.ten || 'Khách hàng' }, datePublished: new Date(r.luc).toISOString().slice(0, 10),
        reviewBody: gon(r.noiDung, 500), reviewRating: { '@type': 'Rating', ratingValue: r.sao, bestRating: 5, worstRating: 1 } }));
    }
    const vun = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: GOC + '/' },
      { '@type': 'ListItem', position: 2, name: 'Sản phẩm', item: GOC + '/collections.html' },
      { '@type': 'ListItem', position: 3, name: p.short || p.name, item: url }] };
    const json = (x) => JSON.stringify(x).replace(/</g, '\\u003c');
    return `<script type="application/ld+json" id="ldSP">${json(o)}</script>\n  <script type="application/ld+json">${json(vun)}</script>`;
  }

  /* Trả HTML trang sản phẩm theo slug; null = không có */
  async function trangSP(slug) {
    const d = duLieu(), id = d.theoSlug[slug]; if (id == null) return null;
    const p = d.sp.find((x) => String(x.id) === String(id)); if (!p) return null;
    const url = GOC + '/' + slug, dg = await danhGia(String(p.id));
    const tieuDe = p.seoTitle || ((p.short || p.name) + ' – chính hãng, giá tốt | Hương Chất Kids');
    const gia = Number((p.variants && p.variants[0] && p.variants[0].price) || p.price) || 0;
    const moTa = gon(p.seoDesc || (p.name + (gia ? ' giá ' + gia.toLocaleString('vi-VN') + 'đ' : '') + '. ' + (p.desc || '')), 158);
    const anh = tuyetDoi(p.image || (p.images || [])[0]);
    const dau = `<title>${esc(tieuDe)}</title>
  <meta name="description" content="${esc(moTa)}">
  <link rel="canonical" href="${esc(url)}">
  <meta property="og:type" content="product"><meta property="og:site_name" content="Hương Chất Kids">
  <meta property="og:title" content="${esc(tieuDe)}"><meta property="og:description" content="${esc(moTa)}">
  <meta property="og:url" content="${esc(url)}">${anh ? `<meta property="og:image" content="${esc(anh)}">` : ''}
  ${gia ? `<meta property="product:price:amount" content="${gia}"><meta property="product:price:currency" content="VND">` : ''}
  ${schema(p, d, url, dg)}`;
    const html = mau();
    const a = html.indexOf('<!-- ADMIN:SEO'), b = html.indexOf('<!-- /ADMIN:SEO -->');
    if (a < 0 || b < 0) throw new Error('product.html thiếu mốc ADMIN:SEO');
    return html.slice(0, a) + dau + '\n  ' + html.slice(b + '<!-- /ADMIN:SEO -->'.length);
  }

  /* product.html?id=X → /slug (giữ các tham số khác, bỏ id); null = để nguyên */
  function chuyenTuLinkCu(thamSo) {
    if (thamSo.get('preview')) return null;
    const id = thamSo.get('id'); if (!id) return null;
    const slug = duLieu().slug[id]; if (!slug) return null;
    const con = new URLSearchParams(thamSo); con.delete('id');
    const q = con.toString(); return '/' + slug + (q ? '?' + q : '');
  }

  function sitemap() {
    const d = duLieu(), nay = new Date().toISOString().slice(0, 10);
    const dong = (loc, tanSuat, uuTien, luc) => `  <url><loc>${esc(loc)}</loc><lastmod>${luc || nay}</lastmod><changefreq>${tanSuat}</changefreq><priority>${uuTien}</priority></url>`;
    const ds = [dong(GOC + '/', 'daily', '1.0'), dong(GOC + '/collections.html', 'daily', '0.9'), dong(GOC + '/blog.html', 'weekly', '0.7'),
      dong(GOC + '/gioi-thieu.html', 'monthly', '0.5'), dong(GOC + '/doi-tac.html', 'monthly', '0.5'), dong(GOC + '/policy.html', 'yearly', '0.3')];
    d.sp.forEach((p) => { const s = d.slug[p.id]; if (s && !p.an) ds.push(dong(GOC + '/' + s, 'weekly', '0.8')); });
    const homNay = Date.now();
    d.bai.forEach((b) => { const m = String(b.date || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/), t = m ? new Date(+m[3], m[2] - 1, +m[1]).getTime() : Date.parse(b.date); if (t && t > homNay) return; ds.push(dong(GOC + '/blog.html?id=' + encodeURIComponent(b.id), 'monthly', '0.6', t ? new Date(t).toISOString().slice(0, 10) : nay)); });
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ds.join('\n') + '\n</urlset>\n';
  }

  return { trangSP, chuyenTuLinkCu, sitemap };
}

module.exports = { taoTrangWeb };
