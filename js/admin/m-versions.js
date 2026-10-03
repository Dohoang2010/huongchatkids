/* ===== PHIÊN BẢN – lịch sử, so sánh, khôi phục, link xem thử =====
   Mỗi lần Xuất bản là một bản ghi trong lịch sử Git của website.
   So sánh được viết lại bằng tiếng Việt dễ đọc, không hiện mã nguồn thô. */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt } = A;

  const KHOI = ['PRODUCTS', 'BANNERS', 'QUA_TANG', 'TIERS', 'COUPONS', 'NAV', 'POSTS', 'THEME'];
  const TEN = { PRODUCTS: 'Sản phẩm', BANNERS: 'Banner', QUA_TANG: 'Quà tặng', TIERS: 'Hạng khách', COUPONS: 'Mã giảm giá', NAV: 'Menu', POSTS: 'Bài viết', THEME: 'Giao diện' };
  let ds = null, dangSo = null;

  /* ---------------- Danh sách phiên bản ---------------- */
  async function ve(el) {
    $('#pageAct').innerHTML = `<button class="btn btn--ghost" id="pbTai">↻ Tải lại</button>
      <button class="btn btn--primary" id="pbLink">🔗 Tạo link xem thử</button>`;
    el.innerHTML = A.dangTai('lịch sử phiên bản');
    try {
      if (!ds) {
        const r = await fetch(`https://api.github.com/repos/${A.REPO}/commits?path=js/data.js&per_page=30&t=${Date.now()}`,
          A.ghToken() ? { headers: { Authorization: 'Bearer ' + A.ghToken() } } : {});
        if (!r.ok) throw new Error('Không đọc được lịch sử (' + r.status + ')');
        ds = await r.json();
      }
      veBang(el);
    } catch (e) { el.innerHTML = A.loiTai(e.message); }
  }

  function veBang(el) {
    el.innerHTML = `
      <div class="card"><h3>🔗 Link xem thử</h3>
        <p class="muted">Tạo một đường dẫn để gửi cho người khác xem bản nháp mà website thật vẫn giữ nguyên.
        Link có mã riêng, tự hết hạn và không bị Google đánh chỉ mục.</p>
        <div id="pbLinkBox"></div>
      </div>

      <div class="card"><h3>🕘 Lịch sử phiên bản website</h3>
        <p class="muted">Mỗi lần bấm <b>Xuất bản</b> tạo một phiên bản. Chọn <b>So sánh</b> để xem phiên bản đó khác bản đang chạy chỗ nào,
        hoặc <b>Khôi phục</b> để đưa nội dung cũ về bản nháp.</p>
        <div class="tbl-wrap"><table><thead><tr><th>Phiên bản</th><th>Thời gian</th><th>Người thực hiện</th><th>Nội dung</th><th></th></tr></thead><tbody>
        ${ds.map((c, i) => { const d = new Date(c.commit.author.date);
          return `<tr><td><b>#${ds.length - i}</b>${i === 0 ? ' ' + A.badge('Đang chạy', 'tag--ok') : ''}</td>
            <td>${d.toLocaleString('vi-VN')}</td><td>${esc(c.commit.author.name)}</td>
            <td>${esc(c.commit.message.split('\n')[0])}</td>
            <td class="num" style="white-space:nowrap">
              ${i === 0 ? '' : `<button class="btn btn--ghost btn--sm" data-pb-so="${esc(c.sha)}">So sánh</button>
              <button class="btn btn--ghost btn--sm" data-pb-khoi="${esc(c.sha)}">Khôi phục</button>`}
              <a class="btn btn--ghost btn--sm" href="${esc(c.html_url)}" target="_blank" rel="noopener">Xem ↗</a></td></tr>`; }).join('')}
        </tbody></table></div></div>
      <div id="pbSoSanh"></div>`;
    veLink();
  }

  /* ---------------- Link xem thử ---------------- */
  function veLink() {
    const luu = JSON.parse(localStorage.getItem('hck_link_xem') || 'null');
    const box = $('#pbLinkBox'); if (!box) return;
    if (!luu || Date.now() > luu.hetHan) { box.innerHTML = `<p class="muted">Chưa có link nào. Bấm <b>Tạo link xem thử</b> ở trên.</p>`; return; }
    const url = `https://huongchatkids.vn/index.html?xem=${luu.ma}`;
    box.innerHTML = `<div class="link-box">
      <input id="pbUrl" value="${esc(url)}" readonly>
      <button class="btn btn--dark" id="pbChep">Chép link</button>
      <a class="btn btn--ghost" href="${esc(url)}" target="_blank" rel="noopener">Mở thử ↗</a>
      <button class="btn btn--red btn--sm" id="pbXoaLink">Xoá link</button></div>
      <p class="muted mt-8">Hết hạn lúc <b>${new Date(luu.hetHan).toLocaleString('vi-VN')}</b>.</p>`;
  }

  async function taoLink() {
    if (!A.ghToken()) { A.toast('Cần mã GitHub để tạo link xem thử', 'err'); return A.di('#/cau-hinh/github'); }
    const ok = await A.hoi({ tieuDe: 'Tạo link xem thử?', noiDung: 'Bản nháp hiện tại sẽ được lưu lại kèm một mã riêng, link sống <b>7 ngày</b>. Website thật không đổi.', nutOk: 'Tạo link' });
    if (!ok) return;
    const btn = $('#pbLink'); btn.disabled = true; btn.textContent = 'Đang tạo…';
    try {
      const ma = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(36)).join('').slice(0, 24);
      const hetHan = Date.now() + 7 * 864e5;
      const goi = { tao: Date.now(), hetHan };
      KHOI.forEach((k) => { goi[k] = A.D[k]; });
      await A.ghGhi(`data/nhap/${ma}.json`, A.b64(JSON.stringify(goi)), undefined, 'Quản trị: tạo link xem thử');
      localStorage.setItem('hck_link_xem', JSON.stringify({ ma, hetHan }));
      A.toast('Đã tạo link xem thử 🎉', 'ok'); veLink();
    } catch (e) { A.toast(e.message, 'err'); }
    btn.disabled = false; btn.textContent = '🔗 Tạo link xem thử';
  }

  /* ---------------- Đọc một phiên bản cũ ---------------- */
  async function docPhienBan(sha) {
    const r = await fetch(`https://api.github.com/repos/${A.REPO}/contents/js/data.js?ref=${sha}`,
      A.ghToken() ? { headers: { Authorization: 'Bearer ' + A.ghToken(), Accept: 'application/vnd.github+json' } } : { headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) throw new Error('Không đọc được phiên bản này (' + r.status + ')');
    const f = await r.json();
    const src = A.unb64(f.content);
    const w = {};
    new Function('window', src)(w);
    return w;
  }

  /* ---------------- So sánh dễ đọc ---------------- */
  function soSanh(cu, moi) {
    const out = [];
    const them = (muc, viec, truoc, sau) => out.push({ muc, viec, truoc, sau });

    /* Sản phẩm – so theo mã */
    const a = cu.PRODUCTS || [], b = moi.PRODUCTS || [];
    const mapA = Object.fromEntries(a.map((p) => [p.id, p])), mapB = Object.fromEntries(b.map((p) => [p.id, p]));
    b.forEach((p) => { if (!mapA[p.id]) them('Sản phẩm', `Thêm mới “${p.short || p.name}”`, '—', fmt(p.price)); });
    a.forEach((p) => { if (!mapB[p.id]) them('Sản phẩm', `Xoá “${p.short || p.name}”`, fmt(p.price), '—'); });
    b.forEach((p) => {
      const q = mapA[p.id]; if (!q) return;
      const ten = p.short || p.name;
      if (q.price !== p.price) them('Sản phẩm', `${ten} – giá bán`, fmt(q.price), fmt(p.price));
      if ((q.stock ?? 0) !== (p.stock ?? 0)) them('Sản phẩm', `${ten} – tồn kho`, String(q.stock ?? 0), String(p.stock ?? 0));
      if (!!q.an !== !!p.an) them('Sản phẩm', `${ten} – hiển thị`, q.an ? 'Đang ẩn' : 'Đang hiện', p.an ? 'Đang ẩn' : 'Đang hiện');
      if ((q.short || q.name) !== (p.short || p.name)) them('Sản phẩm', 'Đổi tên sản phẩm', q.short || q.name, p.short || p.name);
      const tq = (q.tags || []).join(', '), tp = (p.tags || []).join(', ');
      if (tq !== tp) them('Sản phẩm', `${ten} – nhãn`, tq || '(không có)', tp || '(không có)');
      const vq = JSON.stringify(q.variants || []), vp = JSON.stringify(p.variants || []);
      if (vq !== vp) them('Sản phẩm', `${ten} – phân loại`, `${(q.variants || []).length} phân loại`, `${(p.variants || []).length} phân loại`);
    });

    /* Mã giảm giá */
    const ca = cu.COUPONS || {}, cb = moi.COUPONS || {};
    Object.keys(cb).forEach((k) => { if (!ca[k]) them('Mã giảm giá', `Thêm mã ${k}`, '—', cb[k].desc || ''); });
    Object.keys(ca).forEach((k) => { if (!cb[k]) them('Mã giảm giá', `Xoá mã ${k}`, ca[k].desc || '', '—'); });
    Object.keys(cb).forEach((k) => { if (ca[k] && JSON.stringify(ca[k]) !== JSON.stringify(cb[k])) them('Mã giảm giá', `Sửa mã ${k}`, ca[k].desc || '', cb[k].desc || ''); });

    /* Hạng khách */
    (moi.TIERS || []).forEach((t, i) => {
      const q = (cu.TIERS || [])[i]; if (!q) { them('Hạng khách', `Thêm hạng ${t.label}`, '—', `từ ${fmt(t.min)} · giảm ${t.discount}%`); return; }
      if (q.min !== t.min || q.discount !== t.discount || q.label !== t.label)
        them('Hạng khách', t.label || q.label, `từ ${fmt(q.min)} · giảm ${q.discount}%`, `từ ${fmt(t.min)} · giảm ${t.discount}%`);
    });

    /* Quà tặng */
    const qa = cu.QUA_TANG || {}, qb = moi.QUA_TANG || {};
    if (!!qa.enabled !== !!qb.enabled) them('Quà tặng', 'Bật/tắt chương trình', qa.enabled ? 'Đang bật' : 'Đang tắt', qb.enabled ? 'Đang bật' : 'Đang tắt');
    if ((qa.donTu || {}).muc !== (qb.donTu || {}).muc) them('Quà tặng', 'Mốc đơn được tặng', fmt((qa.donTu || {}).muc), fmt((qb.donTu || {}).muc));
    if ((qa.donTu || {}).soQua !== (qb.donTu || {}).soQua) them('Quà tặng', 'Số quà tặng', String((qa.donTu || {}).soQua), String((qb.donTu || {}).soQua));
    if (JSON.stringify(qa.thung) !== JSON.stringify(qb.thung)) them('Quà tặng', 'Bậc mua thùng', (qa.thung || []).map((x) => `${x.tu}→${x.soQua}`).join(', '), (qb.thung || []).map((x) => `${x.tu}→${x.soQua}`).join(', '));

    /* Banner */
    const ba = cu.BANNERS || [], bb = moi.BANNERS || [];
    if (ba.length !== bb.length) them('Banner', 'Số lượng banner', String(ba.length), String(bb.length));
    bb.forEach((x, i) => { const y = ba[i]; if (!y) return;
      if ((y.title || '') !== (x.title || '')) them('Banner', `Banner ${i + 1} – tiêu đề`, (y.title || '').split('\n')[0], (x.title || '').split('\n')[0]);
      if ((y.image || '') !== (x.image || '')) them('Banner', `Banner ${i + 1} – ảnh`, y.image || '—', x.image || '—'); });

    /* Menu */
    const na = (cu.NAV || []).map((n) => n.label).join(' · '), nb = (moi.NAV || []).map((n) => n.label).join(' · ');
    if (na !== nb) them('Menu', 'Danh sách mục menu', na, nb);

    /* Bài viết */
    const pa = cu.POSTS || [], pb2 = moi.POSTS || [];
    if (pa.length !== pb2.length) them('Bài viết', 'Số bài viết', String(pa.length), String(pb2.length));

    /* Giao diện */
    const ta = cu.THEME || {}, tb = moi.THEME || {};
    Object.keys(tb.mau || {}).forEach((k) => { if ((ta.mau || {})[k] !== tb.mau[k]) them('Giao diện', 'Màu ' + k, (ta.mau || {})[k] || '—', tb.mau[k]); });
    if ((ta.chu || {}).body !== (tb.chu || {}).body) them('Giao diện', 'Phông chữ nội dung', (ta.chu || {}).body || '—', (tb.chu || {}).body);
    if ((ta.bo || {}).radius !== (tb.bo || {}).radius) them('Giao diện', 'Bo góc', ((ta.bo || {}).radius || '—') + 'px', (tb.bo || {}).radius + 'px');
    const ka = (ta.khoi || []).map((k) => k.key).join(','), kb = (tb.khoi || []).map((k) => k.key).join(',');
    if (ka !== kb) them('Giao diện', 'Thứ tự khối trang chủ', 'thứ tự cũ', 'thứ tự mới');
    (tb.khoi || []).forEach((k) => { const o = (ta.khoi || []).find((x) => x.key === k.key);
      if (o && (o.bat !== false) !== (k.bat !== false)) them('Giao diện', `Khối “${k.ten}”`, o.bat === false ? 'Đang ẩn' : 'Đang hiện', k.bat === false ? 'Đang ẩn' : 'Đang hiện'); });

    return out;
  }

  async function moSoSanh(sha) {
    const box = $('#pbSoSanh'); box.innerHTML = A.dangTai('nội dung phiên bản');
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
    try {
      const cu = await docPhienBan(sha);
      dangSo = { sha, cu };
      const kq = soSanh(cu, A.D);
      const c = ds.find((x) => x.sha === sha);
      box.innerHTML = `<div class="card"><h3>So sánh với bản đang sửa</h3>
        <p class="muted">Phiên bản ${new Date(c.commit.author.date).toLocaleString('vi-VN')} — ${esc(c.commit.message.split('\n')[0])}</p>
        ${kq.length ? `<div class="tbl-wrap"><table><thead><tr><th>Mục</th><th>Thay đổi</th><th>Phiên bản cũ</th><th>Bản hiện tại</th></tr></thead><tbody>
          ${kq.map((x) => `<tr><td>${A.badge(x.muc)}</td><td>${esc(x.viec)}</td>
            <td class="so-cu">${esc(x.truoc)}</td><td class="so-moi">${esc(x.sau)}</td></tr>`).join('')}
        </tbody></table></div><p class="muted mt-8">${kq.length} điểm khác nhau.</p>`
        : '<p class="muted">Không có khác biệt nào ở phần dữ liệu website.</p>'}
        <div class="dh__act"><button class="btn btn--primary" data-pb-khoi="${esc(sha)}">Khôi phục phiên bản này</button>
        <button class="btn btn--ghost" id="pbDongSo">Đóng</button></div></div>`;
    } catch (e) { box.innerHTML = A.loiTai(e.message); }
  }

  async function khoiPhuc(sha) {
    const c = ds.find((x) => x.sha === sha);
    const ok = await A.hoi({ tieuDe: 'Khôi phục phiên bản này?',
      noiDung: `Nội dung của phiên bản <b>${new Date(c.commit.author.date).toLocaleString('vi-VN')}</b> sẽ được đưa về <b>bản nháp</b>.<br>
        <span class="muted">Website thật chưa đổi — xem lại rồi bấm Xuất bản mới có hiệu lực.</span>`, nutOk: 'Khôi phục' });
    if (!ok) return;
    try {
      const cu = await docPhienBan(sha);
      KHOI.forEach((k) => { if (cu[k]) A.D[k] = A.sao(cu[k]); });
      A.doiDuLieu();
      A.toast('Đã đưa phiên bản cũ về bản nháp – kiểm tra rồi bấm Xuất bản', 'ok');
      A.veTrang();
    } catch (e) { A.toast(e.message, 'err'); }
  }

  document.addEventListener('click', (e) => {
    if (e.target.id === 'pbTai') { ds = null; return A.veTrang(); }
    if (e.target.id === 'pbLink') return taoLink();
    if (e.target.id === 'pbChep') { const i = $('#pbUrl'); i.select(); navigator.clipboard?.writeText(i.value); A.toast('Đã chép link', 'ok'); return; }
    if (e.target.id === 'pbXoaLink') { localStorage.removeItem('hck_link_xem'); veLink(); A.toast('Đã xoá link khỏi máy này'); return; }
    if (e.target.id === 'pbDongSo') { $('#pbSoSanh').innerHTML = ''; return; }
    const so = e.target.closest('[data-pb-so]'); if (so) return moSoSanh(so.dataset.pbSo);
    const kp = e.target.closest('[data-pb-khoi]'); if (kp) return khoiPhuc(kp.dataset.pbKhoi);
  });

  A.dangKy({ route: '/phien-ban', ten: 'Phiên bản & xem thử', icon: '🕘', nhom: 'he-thong', quyen: 'setting.view',
    mo: 'Lịch sử thay đổi, so sánh, khôi phục, link xem thử', ve });
})();
