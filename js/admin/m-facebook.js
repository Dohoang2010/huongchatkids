/* ===== LỊCH ĐĂNG FACEBOOK – soạn bài, chủ shop duyệt, máy chủ VPS tự đăng lên page đúng giờ =====
   Máy chủ: tools/may-chu-vps/src/dang-fb.js (POST /api/qt-fb). Bài chưa duyệt không bao giờ tự đăng.
   Link huongchatkids.vn/… trong bài tự gắn ?nguon=facebook&cd=<mã theo dõi> → Thống kê bán hàng biết bài nào ra đơn.
   Mã page hết hạn → thẻ đỏ "Cần đăng nhập lại Facebook" (chạy lại tools/may-chu-vps/cai-facebook.ps1). */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc } = A;
  const R = '/facebook';
  const S = { ds: null, tt: null, loc: 'cho', dangTai: false, loi: '', sua: null, chuShop: false };
  const TRANG = { nhap: ['Chờ duyệt', 'tag--wait'], duyet: ['Đã duyệt · chờ tới giờ', 'tag--ok'], 'dang-dang': ['Đang đăng…', 'tag--hot'], 'da-dang': ['Đã đăng', 'tag--off'], loi: ['Lỗi', 'tag--no'] };
  const LOC = [['cho', 'Chờ duyệt', (b) => b.trangThai === 'nhap'], ['sap', 'Sắp đăng', (b) => b.trangThai === 'duyet' || b.trangThai === 'dang-dang'], ['loi', 'Lỗi', (b) => b.trangThai === 'loi'], ['da', 'Đã đăng', (b) => b.trangThai === 'da-dang'], ['het', 'Tất cả', () => true]];

  const url = () => { try { return new URL((window.SITE && SITE.loyalty && SITE.loyalty.endpoint) || '').origin + '/api/qt-fb'; } catch { return ''; } };
  async function may(viec, them = {}) {
    let r; try { r = await fetch(url(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...A.xacThuc(), viec, ...them }) }); }
    catch { throw new Error('Không kết nối được máy chủ – kiểm tra mạng rồi thử lại'); }
    const d = await r.json().catch(() => ({ ok: false, msg: 'Máy chủ không trả lời (' + r.status + ')' }));
    if (!d.ok) throw new Error(d.msg || 'Chưa làm được');
    return d;
  }
  const gio = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
  const oNgay = (iso) => { const d = iso ? new Date(iso) : new Date(Date.now() + 864e5); if (!iso) d.setHours(20, 0, 0, 0); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
  const slug = (s) => A.khongDau(String(s || '')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
  /* giống máy chủ (dang-fb.js › ganTheoDoi) – chỉ để xem trước */
  const theoDoi = (chu, cd) => String(chu || '').replace(/(https?:\/\/)?(?:www\.)?huongchatkids\.vn(\/[^\s)\]]*)?/gi, (m, g, d) => { if (!g && !d) return m; if (/[?&]nguon=/.test(m)) return m; const u = 'https://huongchatkids.vn' + (d || '/'); return u + (u.includes('?') ? '&' : '?') + 'nguon=facebook&cd=' + encodeURIComponent(cd); });
  const chuXem = (chu, cd) => esc(theoDoi(chu, cd)).replace(/(https:\/\/huongchatkids\.vn[^\s<]*)/g, '<span class="fb-link">$1</span>').replace(/\n/g, '<br>');

  /* Ảnh chọn từ máy → thu nhỏ tối đa 2048px, JPEG (gửi lên máy chủ dạng base64) */
  const docAnh = (file) => new Promise((ok, loi) => {
    const img = new Image(), u = URL.createObjectURL(file);
    img.onload = () => { const k = Math.min(1, 2048 / Math.max(img.width, img.height)), c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL('image/jpeg', 0.9)); };
    img.onerror = () => { URL.revokeObjectURL(u); loi(new Error('Không đọc được ảnh ' + file.name)); };
    img.src = u;
  });

  async function tai(lai) {
    if (S.dangTai) return; S.dangTai = true; S.loi = '';
    try { const [tt, ds] = await Promise.all([may(lai ? 'kiemTra' : 'trangThai'), may('ds')]); S.tt = tt; S.ds = ds.ds; S.chuShop = !!ds.chuShop; }
    catch (e) { S.loi = e.message; }
    S.dangTai = false; if (location.hash.startsWith('#' + R)) A.veTrang();
  }

  function theTrangThai() {
    const t = S.tt || {};
    if (!t.coToken) return `<div class="card fb-tt fb-tt--chua"><h3>🔌 Chưa kết nối page Facebook</h3>
      <p>Mẹ vẫn soạn và duyệt bài được, nhưng máy chủ chưa đăng được cho tới khi kết nối. Trên máy tính shop chạy lệnh:</p>
      <code class="fb-lenh">powershell -ExecutionPolicy Bypass -File "C:\\Users\\B-Tech Computer\\Desktop\\web HCK2026\\tools\\may-chu-vps\\cai-facebook.ps1"</code></div>`;
    if (t.canDangNhap) return `<div class="card fb-tt fb-tt--do"><h3>⚠️ Cần đăng nhập lại Facebook</h3>
      <p>Facebook đã khoá / hết hạn mã đăng bài${t.canTu ? ' từ ' + esc(gio(t.canTu)) : ''}. <b>Máy chủ đang tạm dừng đăng</b> – các bài đã duyệt được giữ nguyên, kết nối lại xong sẽ tự đăng tiếp (bài quá giờ hơn 12 tiếng sẽ chuyển sang Lỗi để mẹ chọn giờ mới).</p>
      <p class="muted">Chi tiết: ${esc(t.loi || '')}</p>
      <p>Cách sửa: trên máy tính shop chạy lại <code>tools\\may-chu-vps\\cai-facebook.ps1</code> (làm như lần đầu), rồi bấm <b>Kiểm tra lại</b>.</p>
      <button class="btn btn--primary btn--sm" data-fb="kiem">Kiểm tra lại</button></div>`;
    return `<div class="card fb-tt fb-tt--ok"><b>✅ Đã kết nối page ${esc((t.trang || {}).ten || '')}</b><span class="muted"> · kiểm tra lúc ${esc(gio(t.kiemLuc))}${t.loi ? ' · ' + esc(t.loi) : ''}</span>
      <button class="btn btn--ghost btn--sm" data-fb="kiem">Kiểm tra lại</button></div>`;
  }

  function veDanhSach(el) {
    $('#pageAct').innerHTML = `<button class="btn btn--primary" data-fb="moi">+ Soạn bài mới</button>`;
    if (!S.ds) { if (S.loi) { const l = S.loi; S.loi = ''; el.innerHTML = A.loiTai(l); return; } el.innerHTML = A.dangTai('lịch đăng'); tai(); return; }   // bấm Thử lại → tải lại
    const loc = LOC.find((x) => x[0] === S.loc) || LOC[0];
    const ds = S.ds.filter(loc[2]).sort((a, b) => (S.loc === 'da' || S.loc === 'het' ? Date.parse(b.luc) - Date.parse(a.luc) : Date.parse(a.luc) - Date.parse(b.luc)));
    el.innerHTML = `${theTrangThai()}
      <div class="chips fb-loc">${LOC.map(([k, ten, f]) => `<button class="chip ${k === S.loc ? 'is-on' : ''}" data-fb-loc="${k}">${ten} <b>${S.ds.filter(f).length}</b></button>`).join('')}</div>
      ${ds.length ? `<div class="fb-ds">${ds.map(veBai).join('')}</div>` : A.trong(S.loc === 'cho' ? 'Không có bài chờ duyệt' : 'Chưa có bài', 'Bấm "+ Soạn bài mới" để thêm bài vào lịch.', '🗓️')}
      <p class="muted fb-chu">Bài <b>chưa duyệt không bao giờ tự đăng</b>. ${S.chuShop ? 'Mẹ là chủ shop nên duyệt được bài.' : 'Chỉ chủ shop duyệt được bài – mẹ soạn xong báo chủ shop duyệt nhé.'} Link huongchatkids.vn trong bài tự gắn mã theo dõi để xem bài nào ra đơn ở <a href="#/thong-ke-ban">Thống kê bán hàng</a>.</p>`;
  }
  function veBai(b) {
    const [nhan, lop] = TRANG[b.trangThai] || [b.trangThai, ''];
    const dong1 = String(b.noiDung || '').split('\n').find((x) => x.trim()) || '';
    const xong = b.trangThai === 'da-dang', dang = b.trangThai === 'dang-dang';
    return `<div class="card fb-bai fb-bai--${esc(b.trangThai)}">
      <div class="fb-bai__anh">${(b.anhNho || []).slice(0, 4).map((u) => `<img src="${u}" alt="">`).join('') || '<span>📝</span>'}${(b.anh || []).length > 4 ? `<i>+${b.anh.length - 4}</i>` : ''}</div>
      <div class="fb-bai__nd">
        <div class="fb-bai__dau"><b>🕗 ${esc(gio(b.luc))}</b>${A.badge(nhan, lop)}${b.cd ? `<small class="muted">mã ${esc(b.cd)}</small>` : ''}</div>
        <p class="fb-bai__chu">${esc(b.tieuDe ? b.tieuDe + ' – ' : '')}${esc(dong1.slice(0, 140))}</p>
        <small class="muted">${(b.anh || []).length} ảnh · ${(b.binhLuan || []).length} bình luận · soạn bởi ${esc(b.taoBoi || '')}${b.duyetBoi ? ' · duyệt bởi ' + esc(b.duyetBoi) : ''}</small>
        ${b.loi ? `<p class="fb-bai__loi">⚠️ ${esc(b.loi)}</p>` : ''}
        ${xong && b.ketQua ? `<p class="fb-bai__ok">✅ Đăng lúc ${esc(gio(b.ketQua.luc))} · <a href="${esc(b.ketQua.link)}" target="_blank" rel="noopener">Xem trên Facebook ↗</a>${(b.ketQua.binhLuan || []).some((x) => !x.ok) ? ' · <span class="fb-bai__loi">có bình luận chưa đăng được</span>' : ''}</p>` : ''}
      </div>
      <div class="fb-bai__nut">
        ${!xong && !dang ? `<a class="btn btn--ghost btn--sm" href="#${R}/${esc(b.id)}">Sửa</a>` : ''}
        ${S.chuShop && b.trangThai === 'nhap' ? `<button class="btn btn--primary btn--sm" data-fb="duyet" data-id="${esc(b.id)}">Duyệt</button>` : ''}
        ${S.chuShop && b.trangThai === 'duyet' ? `<button class="btn btn--ghost btn--sm" data-fb="bo-duyet" data-id="${esc(b.id)}">Bỏ duyệt</button>` : ''}
        ${S.chuShop && !xong && !dang ? `<button class="btn btn--ghost btn--sm" data-fb="ngay" data-id="${esc(b.id)}">Đăng ngay</button>` : ''}
        ${!dang && (b.trangThai !== 'duyet' || S.chuShop) ? `<button class="btn btn--ghost btn--sm fb-xoa" data-fb="xoa" data-id="${esc(b.id)}" title="${xong ? 'Chỉ xoá khỏi lịch – bài trên Facebook giữ nguyên' : 'Xoá bài khỏi lịch'}">Xoá</button>` : ''}
      </div></div>`;
  }

  /* ---------- Soạn / sửa bài ---------- */
  function moSua(id) {
    const b = id === 'moi' ? null : (S.ds || []).find((x) => x.id === id);
    if (id !== 'moi' && !b) return false;
    S.sua = { id: b ? b.id : '', tieuDe: b ? b.tieuDe || '' : '', luc: oNgay(b && b.luc), cd: b ? b.cd || '' : '', noiDung: b ? b.noiDung : '',
      anh: b ? (b.anh || []).map((a, i) => ({ ten: a, xem: (b.anhNho || [])[i] || '' })) : [],
      binhLuan: b ? (b.binhLuan || []).map((x) => ({ noiDung: x.noiDung, anh: x.anh || '', xem: x.anhNho || '' })) : [], trangThai: b ? b.trangThai : 'nhap', dangLuu: false };
    return true;
  }
  function veSua(el, id) {
    if (!S.ds) { if (S.loi) { const l = S.loi; S.loi = ''; el.innerHTML = A.loiTai(l); return; } el.innerHTML = A.dangTai('bài'); tai(); return; }
    if (!S.sua || (S.sua.id || 'moi') !== id) { if (!moSua(id)) { el.innerHTML = A.trong('Không thấy bài này', 'Bài có thể đã bị xoá.', '🧭'); return; } }
    const s = S.sua, cd = s.cd || slug(s.tieuDe) || 'fb-moi';
    $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#${R}">← Về lịch đăng</a>`;
    el.innerHTML = `<div class="fb-sua">
      <div class="card fb-sua__trai">
        ${s.trangThai === 'duyet' ? '<p class="fb-bai__loi">Bài đang ở trạng thái <b>Đã duyệt</b> – lưu thay đổi sẽ đưa bài về <b>Chờ duyệt</b>.</p>' : ''}
        <div class="fb-hang">
          <label class="field">Giờ đăng<input class="input" type="datetime-local" id="fbLuc" value="${esc(s.luc)}"></label>
          <label class="field">Tên bài (chỉ để mẹ dễ tìm)<input class="input" id="fbTen" maxlength="120" value="${esc(s.tieuDe)}" placeholder="VD: Bài 08 – Quà 50.000 điểm"></label>
        </div>
        <label class="field">Nội dung bài <small class="muted" id="fbDem">${s.noiDung.length} ký tự</small>
          <textarea class="input fb-chu" id="fbChu" rows="14" placeholder="Viết nội dung bài đăng…">${esc(s.noiDung)}</textarea></label>
        <div class="field"><span>Ảnh trong bài (tối đa 10 – ảnh đầu tiên là ảnh lớn nhất)</span>
          <div class="fb-anh">${s.anh.map((a, i) => `<div class="fb-anh__o"><img src="${a.xem}" alt=""><span>${i + 1}</span>
            <div class="fb-anh__nut">${i ? `<button type="button" data-fb-anh="trai" data-i="${i}" title="Lên trước">◀</button>` : ''}${i < s.anh.length - 1 ? `<button type="button" data-fb-anh="phai" data-i="${i}" title="Xuống sau">▶</button>` : ''}<button type="button" data-fb-anh="bo" data-i="${i}" title="Bỏ ảnh">✕</button></div></div>`).join('')}
            ${s.anh.length < 10 ? `<label class="fb-anh__them">＋<small>Thêm ảnh</small><input type="file" accept="image/*" multiple id="fbAnh" hidden></label>` : ''}</div></div>
        <div class="field"><span>Bình luận máy chủ tự đăng ngay dưới bài (tối đa 5 – thường để link + ảnh lưu ý)</span>
          ${s.binhLuan.map((b, i) => `<div class="fb-bl"><textarea class="input" rows="2" data-fb-bl="${i}" placeholder="Nội dung bình luận ${i + 1}">${esc(b.noiDung)}</textarea>
            <div class="fb-bl__anh">${b.xem ? `<img src="${b.xem}" alt=""><button type="button" class="btn btn--ghost btn--sm" data-fb-bl-bo-anh="${i}">Bỏ ảnh</button>` : `<label class="btn btn--ghost btn--sm">+ Ảnh<input type="file" accept="image/*" hidden data-fb-bl-anh="${i}"></label>`}
            <button type="button" class="btn btn--ghost btn--sm fb-xoa" data-fb-bl-xoa="${i}">Xoá</button></div></div>`).join('')}
          ${s.binhLuan.length < 5 ? '<button type="button" class="btn btn--ghost btn--sm" data-fb="them-bl">+ Thêm bình luận</button>' : ''}</div>
        <label class="field">Mã theo dõi (gắn vào link web trong bài)<input class="input" id="fbCd" maxlength="40" value="${esc(s.cd)}" placeholder="${esc(slug(s.tieuDe) || 'tự tạo khi lưu')}"></label>
        <div class="fb-luu">
          <button class="btn btn--primary" data-fb="luu" ${s.dangLuu ? 'disabled' : ''}>${s.dangLuu ? 'Đang lưu…' : 'Lưu (chờ duyệt)'}</button>
          ${S.chuShop ? `<button class="btn btn--teal" data-fb="luu-duyet" ${s.dangLuu ? 'disabled' : ''}>Lưu & duyệt</button>` : ''}
        </div>
      </div>
      <div class="fb-xem">
        <div class="fb-xem__dau"><img src="img/logo-96.png" alt=""><div><b>${esc(((S.tt || {}).trang || {}).ten || 'Hương Chất Kids')}</b><small>${esc(gio(new Date(s.luc).toISOString()))} · 🌐</small></div></div>
        <div class="fb-xem__chu" id="fbXemChu">${chuXem(s.noiDung, cd) || '<span class="muted">Nội dung bài hiện ở đây…</span>'}</div>
        ${s.anh.length ? `<div class="fb-xem__anh fb-xem__anh--${Math.min(s.anh.length, 4)}">${s.anh.slice(0, 4).map((a, i) => `<div><img src="${a.xem}" alt="">${i === 3 && s.anh.length > 4 ? `<i>+${s.anh.length - 4}</i>` : ''}</div>`).join('')}</div>` : ''}
        ${s.binhLuan.filter((b) => b.noiDung || b.xem).map((b) => `<div class="fb-xem__bl"><img src="img/logo-96.png" alt=""><div><b>Hương Chất Kids</b><p>${chuXem(b.noiDung, cd)}</p>${b.xem ? `<img class="fb-xem__bl-anh" src="${b.xem}" alt="">` : ''}</div></div>`).join('')}
        <p class="muted fb-xem__ghi">Xem trước gần giống Facebook – link xanh là link đã gắn mã theo dõi.</p>
      </div></div>`;
  }
  function docForm() {
    const s = S.sua; if (!s || !$('#fbChu')) return;
    s.luc = $('#fbLuc').value; s.tieuDe = $('#fbTen').value; s.noiDung = $('#fbChu').value; s.cd = $('#fbCd').value;
    $$('[data-fb-bl]').forEach((t) => { const b = s.binhLuan[Number(t.dataset.fbBl)]; if (b) b.noiDung = t.value; });
  }
  async function luu(duyet) {
    docForm(); const s = S.sua;
    if (!s.noiDung.trim()) return A.toast('Bài chưa có nội dung', 'err');
    if (!s.luc || isNaN(new Date(s.luc))) return A.toast('Chọn giờ đăng', 'err');
    if (duyet && new Date(s.luc) < Date.now() - 60e3) return A.toast('Giờ đăng đã qua – chọn giờ mới (hoặc lưu rồi bấm Đăng ngay)', 'err');
    s.dangLuu = true; A.veTrang();
    try {
      const bai = { id: s.id || undefined, tieuDe: s.tieuDe, luc: new Date(s.luc).toISOString(), cd: s.cd || slug(s.tieuDe), noiDung: s.noiDung,
        giuAnh: s.anh.filter((a) => a.ten).map((a) => a.ten), anhMoi: s.anh.filter((a) => !a.ten).map((a) => a.xem), thuTuAnh: s.anh.map((a) => a.ten || ''),
        binhLuan: s.binhLuan.map((b) => ({ noiDung: b.noiDung, anh: b.anh && !b.moi ? b.anh : '', anhMoi: b.moi ? b.xem : '' })) };
      /* thứ tự ảnh: ảnh mới chưa có tên → máy chủ thêm cuối; đổi chỗ ảnh mới thì lưu xong mẹ chỉnh lại */
      const r = await may('luu', { bai });
      if (duyet) await may('duyet', { id: r.bai.id });
      A.toast(duyet ? '✓ Đã lưu và duyệt – tới giờ máy chủ tự đăng' : '✓ Đã lưu – chờ chủ shop duyệt', 'ok');
      S.sua = null; S.ds = null; S.loc = duyet ? 'sap' : 'cho'; location.hash = '#' + R;
    } catch (e) { s.dangLuu = false; A.veTrang(); A.toast(e.message, 'err'); }
  }

  async function lam(viec, id, hoiTruoc) {
    if (hoiTruoc && !(await A.hoi(hoiTruoc))) return;
    try { if (viec === 'bo-duyet') await may('duyet', { id, co: false }); else await may(viec, viec === 'duyet' ? { id, co: true } : { id }); A.toast('✓ Xong', 'ok'); S.ds = null; tai(); }
    catch (e) { A.toast(e.message, 'err'); }
  }

  document.addEventListener('click', async (e) => {
    if (!location.hash.startsWith('#' + R)) return; const t = e.target;
    const l = t.closest('[data-fb-loc]'); if (l) { S.loc = l.dataset.fbLoc; A.veTrang(); return; }
    const a = t.closest('[data-fb-anh]'); if (a && S.sua) { docForm(); const i = Number(a.dataset.i), ds = S.sua.anh;
      if (a.dataset.fbAnh === 'bo') ds.splice(i, 1); else { const j = a.dataset.fbAnh === 'trai' ? i - 1 : i + 1; [ds[i], ds[j]] = [ds[j], ds[i]]; } A.veTrang(); return; }
    const bx = t.closest('[data-fb-bl-xoa]'); if (bx && S.sua) { docForm(); S.sua.binhLuan.splice(Number(bx.dataset.fbBlXoa), 1); A.veTrang(); return; }
    const ba = t.closest('[data-fb-bl-bo-anh]'); if (ba && S.sua) { docForm(); Object.assign(S.sua.binhLuan[Number(ba.dataset.fbBlBoAnh)], { anh: '', xem: '', moi: false }); A.veTrang(); return; }
    const n = t.closest('[data-fb]'); if (!n) return; const v = n.dataset.fb, id = n.dataset.id;
    if (v === 'moi') { S.sua = null; location.hash = '#' + R + '/moi'; return; }
    if (v === 'kiem') { S.tt = null; S.ds = null; tai(true); return; }
    if (v === 'them-bl' && S.sua) { docForm(); S.sua.binhLuan.push({ noiDung: '', anh: '', xem: '' }); A.veTrang(); return; }
    if (v === 'luu') return luu(false);
    if (v === 'luu-duyet') return luu(true);
    const b = (S.ds || []).find((x) => x.id === id);
    if (v === 'duyet') return lam('duyet', id, { tieuDe: 'Duyệt bài này?', noiDung: `Tới ${gio(b && b.luc)} máy chủ sẽ tự đăng lên page Facebook.`, nutOk: 'Duyệt' });
    if (v === 'bo-duyet') return lam('bo-duyet', id);
    if (v === 'ngay') return lam('dangNgay', id, { tieuDe: 'Đăng ngay bây giờ?', noiDung: 'Bài sẽ được đăng lên page Facebook trong vài giây.', nutOk: 'Đăng ngay' });
    if (v === 'xoa') return lam('xoa', id, { tieuDe: 'Xoá bài khỏi lịch?', noiDung: b && b.trangThai === 'da-dang' ? 'Chỉ xoá khỏi lịch – bài trên Facebook vẫn giữ nguyên.' : 'Bài và ảnh của bài sẽ bị xoá khỏi lịch.', nutOk: 'Xoá', nguyHiem: true });
  });
  document.addEventListener('change', async (e) => {
    if (!location.hash.startsWith('#' + R) || !S.sua) return; const t = e.target;
    if (t.id === 'fbAnh') { docForm(); for (const f of [...t.files].slice(0, 10 - S.sua.anh.length)) { try { S.sua.anh.push({ ten: '', xem: await docAnh(f) }); } catch (er) { A.toast(er.message, 'err'); } } A.veTrang(); return; }
    if (t.dataset.fbBlAnh !== undefined && t.files[0]) { docForm(); try { Object.assign(S.sua.binhLuan[Number(t.dataset.fbBlAnh)], { xem: await docAnh(t.files[0]), moi: true, anh: '' }); } catch (er) { A.toast(er.message, 'err'); } A.veTrang(); }
  });
  /* gõ nội dung → cập nhật xem trước (không vẽ lại cả trang để khỏi mất chỗ con trỏ) */
  document.addEventListener('input', (e) => {
    if (!location.hash.startsWith('#' + R) || !S.sua) return;
    if (e.target.id === 'fbChu' || e.target.id === 'fbCd' || e.target.id === 'fbTen') { docForm(); const x = $('#fbXemChu'); if (x) x.innerHTML = chuXem(S.sua.noiDung, S.sua.cd || slug(S.sua.tieuDe) || 'fb-moi') || ''; const d = $('#fbDem'); if (d) d.textContent = S.sua.noiDung.length + ' ký tự'; }
    if (e.target.dataset && e.target.dataset.fbBl !== undefined) docForm();
  });

  A.dangKy({ route: R, ten: 'Lịch đăng Facebook', icon: '📣', nhom: 'ban-hang', quyen: 'content.update', mo: 'Soạn bài, chủ shop duyệt – máy chủ tự đăng lên page đúng giờ (kèm ảnh, bình luận, link theo dõi)',
    ve(el, { sub }) { if (sub) veSua(el, sub); else { S.sua = null; veDanhSach(el); } } });
})();
