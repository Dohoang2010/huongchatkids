/* ===== THỐNG KÊ BÁN HÀNG – khách đến từ đâu, bước nào rơi, chương trình / bài đăng nào ra đơn =====
   Dữ liệu: apiQtBaoCaoBan (tools/apps-script.gs) ghép sheet Truy cập (phễu) + Đơn hàng + Nguồn đơn (nguồn của từng đơn).
   Link theo dõi: ?nguon=<kênh>&cd=<tên bài> – web (js/app.js) nhớ nguồn gần nhất 30 ngày và gắn vào đơn. */
(() => {
  'use strict';
  const A = window.ADMIN, { $, esc } = A;
  const R = '/thong-ke-ban';
  const GOC = 'https://huongchatkids.vn';
  const fmt = (n) => (Math.round(n) || 0).toLocaleString('vi-VN') + '₫';
  const so = (n) => (Math.round(n) || 0).toLocaleString('vi-VN');
  const pt = (a, b) => (b ? Math.round(a / b * 1000) / 10 : 0);
  const ngay = (d) => new Date(d.getTime() + 7 * 36e5).toISOString().slice(0, 10);
  let ky = '30', tu = '', den = '', kq = null, dangTai = false, loi = '';
  const KENH = [['facebook', 'Facebook'], ['zalo', 'Zalo'], ['tiktok', 'TikTok'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['email', 'Email'], ['sms', 'SMS'], ['qr', 'QR / in ấn']];
  const taoSlug = (x) => (window.taoSlug ? window.taoSlug(x) : String(x || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')).slice(0, 50);
  const tenSP = (id) => { const p = (A.D.PRODUCTS || window.PRODUCTS || []).find((x) => String(x.id) === String(id)); return p ? (p.short || p.name) : id; };
  const tenCT = (t) => { const m = /^Quà tặng: (.+)$/.exec(t); if (!m) return t; const c = ((A.D.QUA_TANG || window.QUA_TANG || {}).chuongTrinh || []).find((x) => x.id === m[1]); return c ? 'Quà tặng: ' + (c.ten || c.id) : t; };

  function khoang() {
    const nay = new Date();
    if (ky === 'tuy' && tu && den) return [tu, den];
    const n = ky === 'hom-nay' ? 0 : Number(ky) - 1;
    return [ngay(new Date(nay.getTime() - n * 864e5)), ngay(nay)];
  }
  async function tai() {
    if (dangTai) return; dangTai = true; loi = '';
    const [a, b] = khoang();
    try { const r = await A.api('qtBaoCaoBan', { tu: a, den: b }); if (!r || !r.ok) throw new Error((r && r.msg) || 'Chưa tải được'); kq = r; }
    catch (e) { loi = e.message; kq = kq || null; } finally { dangTai = false; }
    if (location.hash.startsWith('#' + R)) A.veTrang();
  }
  const thanh = (nhan, n, goc, mau) => `<div class="tkb-pheu__dong"><span>${nhan}</span><div class="tkb-pheu__ong"><i style="width:${Math.max(goc ? n / goc * 100 : 0, n ? 1.5 : 0)}%;background:${mau}"></i></div><b>${so(n)}</b><small>${goc ? pt(n, goc) + '%' : ''}</small></div>`;
  const bangNguon = (ds, cotTen) => ds.length ? `<div class="tbl-wrap"><table><thead><tr><th>${cotTen}</th><th class="num">Lượt vào</th><th class="num">Xem SP</th><th class="num">Thêm giỏ</th><th class="num">Đơn</th><th class="num">Doanh thu</th><th class="num">Tỉ lệ chốt</th></tr></thead><tbody>
    ${ds.map((x) => `<tr><td><b>${esc(x.ten)}</b></td><td class="num">${so(x.phien)}</td><td class="num">${so(x.xemSP)}</td><td class="num">${so(x.gio)}</td><td class="num">${so(x.don)}</td><td class="num">${fmt(x.doanhThu)}</td><td class="num">${x.tyLe == null ? '–' : x.tyLe + '%'}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Chưa có dữ liệu trong kỳ này.</p>';

  function veLink() {
    const sp = (A.D.PRODUCTS || window.PRODUCTS || []).filter((p) => !p.an), bai = window.POSTS || [];
    return `<div class="card"><h3>🔗 Tạo link theo dõi cho bài đăng</h3>
      <p class="muted">Mỗi bài đăng (Facebook, Zalo, TikTok…) dùng 1 link riêng → bảng "Bài đăng / chiến dịch" ở dưới cho biết bài nào mang về khách và đơn.</p>
      <div class="tkb-link">
        <label>Kênh<select id="tkbKenh">${KENH.map(([k, t]) => `<option value="${k}">${t}</option>`).join('')}</select></label>
        <label>Tên bài (ngắn, không dấu cũng được)<input id="tkbTen" placeholder="vd: bai 20-10 qua tang" maxlength="60"></label>
        <label>Trang đến<select id="tkbTrang"><option value="/">Trang chủ</option><option value="/2010">Tab sự kiện 20.10</option><option value="/collections.html">Tất cả sản phẩm</option>
          <optgroup label="Sản phẩm">${sp.map((p) => `<option value="/${esc((window.SP_SLUG || {})[p.id] || 'product.html?id=' + p.id)}">${esc(p.short || p.name)}</option>`).join('')}</optgroup>
          <optgroup label="Bài cẩm nang">${bai.slice(0, 40).map((b) => `<option value="/${esc((window.BAI_SLUG || {})[b.id] || 'blog.html?id=' + b.id)}">${esc(b.title)}</option>`).join('')}</optgroup></select></label>
      </div>
      <div class="tkb-link__ra"><input id="tkbRa" readonly><button class="btn btn--primary" id="tkbChep" type="button">Chép link</button></div>
      <p class="muted" style="font-size:12.5px">Link vẫn mở đúng trang như bình thường, chỉ thêm phần đuôi để web biết khách đến từ bài nào. Khách đặt đơn trong 30 ngày sau khi bấm vẫn được tính cho bài đó.</p></div>`;
  }
  function capNhatLink() {
    const k = $('#tkbKenh'), t = $('#tkbTen'), tr = $('#tkbTrang'), ra = $('#tkbRa'); if (!k || !ra) return;
    const cd = taoSlug(t.value), u = tr.value;
    ra.value = GOC + u + (u.includes('?') ? '&' : '?') + 'nguon=' + k.value + (cd ? '&cd=' + cd : '');
  }

  function ve(el) {
    $('#pageAct').innerHTML = '<button class="btn btn--ghost" id="tkbTaiLai">↻ Tải lại</button>';
    const [a, b] = khoang();
    const chon = `<div class="vc-tabs">${[['hom-nay', 'Hôm nay'], ['7', '7 ngày'], ['30', '30 ngày'], ['90', '90 ngày'], ['tuy', 'Tự chọn']].map(([k, t]) => `<button class="${ky === k ? 'is-on' : ''}" data-tkb-ky="${k}">${t}</button>`).join('')}</div>
      ${ky === 'tuy' ? `<div class="tkb-tuy"><input type="date" id="tkbTu" value="${esc(tu || a)}"> → <input type="date" id="tkbDen" value="${esc(den || b)}"><button class="btn btn--ghost btn--sm" id="tkbXem">Xem</button></div>` : ''}`;
    if (!kq) { el.innerHTML = `<div class="card">${chon}${loi ? `<p class="err">${esc(loi)}</p>` : A.trong('Đang tải số liệu…', '', '⏳')}</div>${veLink()}`; if (!loi) tai(); capNhatLink(); return; }
    const t = kq.tong;
    el.innerHTML = `<div class="card">${chon}<p class="muted">Từ ${esc(kq.tu.split('-').reverse().join('/'))} đến ${esc(kq.den.split('-').reverse().join('/'))}${dangTai ? ' · đang tải…' : ''}</p>
      <div class="kpis">
        <div class="kpi"><span>Lượt vào web</span><b>${so(t.phien)}</b><small>${so(t.khach)} khách</small></div>
        <div class="kpi kpi--pink"><span>Đơn hàng</span><b>${so(t.don)}</b><small>${so(t.donCoNguon)} đơn biết nguồn</small></div>
        <div class="kpi kpi--teal"><span>Doanh thu</span><b>${fmt(t.doanhThu)}</b><small>không tính đơn huỷ</small></div>
        <div class="kpi kpi--amber"><span>Tỉ lệ chốt đơn</span><b>${t.tyLe}%</b><small>đơn / lượt vào</small></div>
      </div>
      <h4>Phễu mua hàng (theo lượt vào)</h4>
      <div class="tkb-pheu">${thanh('Vào web', t.phien, t.phien, '#9AA4B2')}${thanh('Xem sản phẩm', t.xemSP, t.phien, '#7C9CF0')}${thanh('Thêm vào giỏ', t.gio, t.phien, '#F2A33A')}${thanh('Mở thanh toán', t.thanhToan, t.phien, '#F0537A')}${thanh('Đặt đơn', t.mua, t.phien, '#13A38B')}</div>
      <p class="muted" style="font-size:12.5px">Bước nào tụt mạnh nhất là chỗ nên cải thiện (vd nhiều người thêm giỏ nhưng ít người thanh toán → xem lại phí ship, mã giảm giá, trang thanh toán).</p></div>
      <div class="card"><h3>📣 Khách đến từ đâu</h3>${bangNguon(kq.nguon, 'Nguồn')}
        <p class="muted" style="font-size:12.5px">"Chưa rõ" = đơn đặt trước khi bật đo (19/10/2026) hoặc đơn nhập tay. "Trực tiếp" = khách gõ thẳng địa chỉ web / mở từ Zalo, Messenger không kèm link theo dõi.</p></div>
      <div class="card"><h3>📝 Bài đăng / chiến dịch (link theo dõi)</h3>${kq.baiDang.length ? bangNguon(kq.baiDang, 'Kênh · bài') : '<p class="muted">Chưa có bài nào dùng link theo dõi. Tạo link ở khung bên dưới rồi dán vào bài đăng.</p>'}</div>
      <div class="card"><h3>🎁 Chương trình nào ra đơn</h3>${kq.chuongTrinh.length ? `<div class="tbl-wrap"><table><thead><tr><th>Chương trình / ưu đãi</th><th class="num">Số đơn</th><th class="num">Doanh thu</th><th class="num">% số đơn</th></tr></thead><tbody>
        ${kq.chuongTrinh.map((x) => `<tr><td>${esc(tenCT(x.ten))}</td><td class="num">${so(x.don)}</td><td class="num">${fmt(x.doanhThu)}</td><td class="num">${pt(x.don, t.don)}%</td></tr>`).join('')}</tbody></table></div>
        <p class="muted" style="font-size:12.5px">Một đơn dùng nhiều ưu đãi (vd mã giảm giá + quà) được tính cho mỗi ưu đãi.</p>` : '<p class="muted">Chưa có đơn trong kỳ.</p>'}</div>
      <div class="card"><h3>🛍️ Sản phẩm: được xem → được mua</h3>${kq.sanPham.length ? `<div class="tbl-wrap"><table><thead><tr><th>Sản phẩm</th><th class="num">Lượt xem</th><th class="num">Thêm giỏ</th><th class="num">Đơn</th><th class="num">Số lượng</th><th class="num">Doanh thu</th><th class="num">Tỉ lệ mua</th></tr></thead><tbody>
        ${kq.sanPham.map((x) => `<tr${x.xem >= 20 && x.tyLe != null && x.tyLe < 1 ? ' class="tkb-canh"' : ''}><td>${esc(tenSP(x.id))}</td><td class="num">${so(x.xem)}</td><td class="num">${so(x.gio)}</td><td class="num">${so(x.don)}</td><td class="num">${so(x.sl)}</td><td class="num">${fmt(x.doanhThu)}</td><td class="num">${x.tyLe == null ? '–' : x.tyLe + '%'}</td></tr>`).join('')}</tbody></table></div>
        <p class="muted" style="font-size:12.5px">Dòng tô vàng: nhiều người xem (≥ 20) nhưng rất ít người mua (&lt; 1%) – nên xem lại giá, ảnh, mô tả của sản phẩm đó.</p>` : '<p class="muted">Chưa có dữ liệu.</p>'}</div>
      ${veLink()}`;
    capNhatLink();
  }

  document.addEventListener('click', async (e) => {
    if (!location.hash.startsWith('#' + R)) return; const t = e.target;
    const k = t.closest('[data-tkb-ky]'); if (k) { ky = k.dataset.tkbKy; if (ky !== 'tuy') { kq = null; } A.veTrang(); return; }
    if (t.id === 'tkbTaiLai') { kq = null; A.veTrang(); return; }
    if (t.id === 'tkbXem') { tu = $('#tkbTu').value; den = $('#tkbDen').value; if (tu && den) { kq = null; A.veTrang(); } return; }
    if (t.id === 'tkbChep') { const ra = $('#tkbRa'); try { await navigator.clipboard.writeText(ra.value); A.toast('Đã chép link – dán vào bài đăng nhé', 'ok'); } catch { ra.select(); document.execCommand('copy'); A.toast('Đã chép link', 'ok'); } }
  });
  document.addEventListener('input', (e) => { if (location.hash.startsWith('#' + R) && /^tkb(Kenh|Ten|Trang)$/.test(e.target.id)) capNhatLink(); });
  document.addEventListener('change', (e) => { if (location.hash.startsWith('#' + R) && /^tkb(Kenh|Ten|Trang)$/.test(e.target.id)) capNhatLink(); });
  A.dangKy({ route: R, ten: 'Thống kê bán hàng', icon: '📈', nhom: 'ban-hang', quyen: 'dashboard.view', mo: 'Khách đến từ đâu, chương trình / bài đăng nào ra đơn, phễu mua hàng', ve });
})();
