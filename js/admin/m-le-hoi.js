/* ===== GIAO DIỆN NGÀY LỄ – lịch chiến dịch theo mùa (khối LE_HOI trong js/data.js, engine ở js/le-hoi.js)
   - Danh sách chiến dịch theo năm: ngày bắt đầu / diễn ra / kết thúc tự tính (dương lịch, âm lịch Việt Nam, quy tắc).
   - Bật / tắt từng chiến dịch, tắt cả hệ thống, tắt riêng hiệu ứng, khôi phục mặc định.
   - Sửa chữ, màu, hiệu ứng, trang áp dụng, ngày; nhập tay ngày riêng cho 1 năm.
   - Xem trước: khung bên phải hiện đúng chiến dịch đang sửa (chỉ trong khung, khách không thấy cho tới khi lưu).
   Như mọi mục khác của trang quản trị: sửa xong 3 giây web tự lưu. Chỉ là lớp trang trí – không đụng giá, giỏ, voucher, điểm. ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc } = A, LH = window.LeHoi;
  const R = '/le-hoi';
  let nam = new Date(Date.now() + 7 * 36e5).getUTCFullYear(), xemId = '';

  const hopLe = (c) => c && typeof c === 'object' && Array.isArray(c.ds);
  const C = () => { if (!hopLe(A.D.LE_HOI)) A.D.LE_HOI = A.sao(hopLe(window.LE_HOI) ? window.LE_HOI : LH.MAC_DINH); return A.D.LE_HOI; };
  const timCd = (id) => C().ds.find((x) => x.id === id);
  const ngayVN = (s) => (s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : '—');
  const THU = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const thuCua = (s) => (s ? THU[new Date(s + 'T12:00:00Z').getUTCDay()] : '');
  const loaiLich = (l) => (!l ? '' : l.loai === 'am' ? `Âm lịch ${l.ngay}/${l.thang}` : l.loai === 'quytac' ? { 'ngay-cua-me': 'CN thứ 2 tháng 5', 'ngay-cua-cha': 'CN thứ 3 tháng 6', 'black-friday': 'Thứ Sáu sau Lễ Tạ ơn' }[l.ma] || l.ma : 'Dương lịch ' + (l.ngay || '').split('-').reverse().join('/'));

  /* Gửi bản nháp vào khung xem trước ngay (không chờ tải lại) */
  function guiXem() {
    A.D.LE_XEM = xemId ? { id: xemId } : null;
    try { sessionStorage.setItem('hck_preview', JSON.stringify(A.D)); } catch { /* */ }
    const f = $('#pvFrame'); if (f && f.contentWindow) f.contentWindow.postMessage({ type: 'hck-le-hoi', cfg: C(), xem: A.D.LE_XEM }, location.origin);
  }
  function luu() { A.doiDuLieu(); guiXem(); }
  const luuTre = A.tre(luu, 400);

  /* ---------- Danh sách ---------- */
  function veDs(el) {
    const c = C(), ms = Date.now(), dang = LH.chon(c, ms);
    const lich = LH.lichNam(c, nam), sapToi = LH.lichNam(c, nam).concat(LH.lichNam(c, nam + 1)).filter((x) => x.bat && x.bd && Date.parse(x.bd + 'T00:00:00+07:00') > ms).sort((a, b) => a.bd < b.bd ? -1 : 1)[0];
    const loi = lich.filter((x) => x.loi);
    const hang = lich.map((x, i) => ({ ...x, i })).sort((a, b) => (a.bd || '9') < (b.bd || '9') ? -1 : 1);
    $('#pageAct').innerHTML = `<button class="btn btn--ghost" id="lhMacDinh">↺ Khôi phục mặc định</button>`;
    el.innerHTML = `
      <div class="lh-dau card">
        <div class="lh-dau__tt">${!c.bat ? '<span class="tag tag--no">Đã tắt toàn bộ</span> Web đang dùng giao diện mặc định.'
          : dang ? `<span class="tag tag--ok">Đang chạy</span> <b>${esc(dang.ten)}</b> · ${ngayVN(LH.chuoi(dang.khoang.bd))} → hết ${ngayVN(LH.chuoi(dang.khoang.kt))}`
          : '<span class="tag">Ngày thường</span> Không có chiến dịch nào đang chạy.'}
          ${sapToi ? `<span class="muted"> · Sắp tới: <b>${esc(sapToi.ten)}</b> từ ${ngayVN(sapToi.bd)}</span>` : ''}</div>
        <div class="lh-dau__sw">
          <label class="sw"><input type="checkbox" id="lhBat" ${c.bat !== false ? 'checked' : ''}> Bật giao diện ngày lễ</label>
          <label class="sw"><input type="checkbox" id="lhHu" ${c.hieuUng !== false ? 'checked' : ''}> Hiệu ứng chuyển động (hoa rơi, tuyết…)</label>
          <label class="sw" title="Chiến dịch âm lịch chỉ bật ở những năm đã có ngày đối chiếu với lịch Việt Nam công bố"><input type="checkbox" id="lhDc" ${c.chiDungNgayDoiChieu ? 'checked' : ''}> Âm lịch: chỉ dùng ngày đã đối chiếu</label>
        </div>
      </div>
      ${loi.length ? `<div class="box-note box-note--warn">⚠️ ${loi.map((x) => `<b>${esc(x.ten)}</b>: ${esc(x.loi)}`).join(' · ')} – chiến dịch này sẽ không tự bật năm ${nam}. Bấm Sửa → nhập tay ngày cho năm ${nam}.</div>` : ''}
      <div class="lh-nam"><button class="icobtn" data-lh-nam="-1" title="Năm trước">‹</button><b>Năm ${nam}</b><button class="icobtn" data-lh-nam="1" title="Năm sau">›</button>
        <span class="muted">Ngày tự tính lại mỗi năm · hiển thị từ 00:00 ngày bắt đầu đến hết ngày kết thúc (giờ Việt Nam)</span></div>
      <div class="tbl-wrap"><table class="tbl lh-tbl"><thead><tr><th>Chiến dịch</th><th>Lịch</th><th>Bắt đầu</th><th>Ngày lễ</th><th>Kết thúc</th><th title="Trùng ngày: số lớn hơn thắng">Ưu tiên</th><th>Bật</th><th></th></tr></thead><tbody>
      ${hang.map((x) => { const cd = c.ds[x.i], cd0 = LH.CHU_DE[cd.chuDe] || {}; return `<tr class="${x.bat ? '' : 'is-off'}${dang && dang.id === x.id ? ' is-now' : ''}">
        <td><span class="lh-cham" style="background:linear-gradient(135deg,${esc((cd.mau || {}).m1 || cd0.m1 || '#ccc')},${esc((cd.mau || {}).m2 || cd0.m2 || '#eee')})">${esc(cd.sticker || cd0.sticker || '')}</span><b>${esc(x.ten)}</b>${dang && dang.id === x.id ? ' <span class="tag tag--ok">đang chạy</span>' : ''}<small class="muted lh-mo">${esc(cd.moTa || '')}</small></td>
        <td class="muted">${esc(loaiLich(cd.lich))}${x.tay ? ' <span class="tag">nhập tay</span>' : ''}</td>
        <td>${x.bd ? thuCua(x.bd) + ' ' + ngayVN(x.bd) : '—'}</td><td><b>${x.suKien ? thuCua(x.suKien) + ' ' + ngayVN(x.suKien) : '—'}</b></td><td>${x.kt ? thuCua(x.kt) + ' ' + ngayVN(x.kt) : '—'}${x.loi ? `<small class="text-red">${esc(x.loi)}</small>` : ''}</td>
        <td><input class="lh-uu" type="number" min="0" max="999" value="${esc(String(cd.uuTien || 0))}" data-lh-uu="${esc(x.id)}" aria-label="Ưu tiên"></td>
        <td><label class="sw" style="margin:0"><input type="checkbox" data-lh-bat="${esc(x.id)}" ${x.bat ? 'checked' : ''}></label></td>
        <td class="nowrap"><button class="btn btn--ghost btn--sm" data-lh-xem="${esc(x.id)}">👁 Xem</button> <a class="btn btn--sm" href="#${R}/${esc(x.id)}">Sửa</a></td></tr>`; }).join('')}
      </tbody></table></div>
      <p class="muted mt-12">👁 <b>Xem</b>: khung bên phải hiện thử giao diện của chiến dịch đó (chỉ trong khung, khách không thấy). Đổi máy tính / điện thoại ở thanh trên khung xem trước.</p>`;
  }

  /* ---------- Sửa 1 chiến dịch ---------- */
  function veSua(el, id) {
    const cd = timCd(id); if (!cd) { el.innerHTML = A.trong('Không thấy chiến dịch', 'Chiến dịch có thể đã bị xoá.', '🎉'); return; }
    if (xemId !== id) { xemId = id; guiXem(); }
    const cd0 = LH.CHU_DE[cd.chuDe] || LH.CHU_DE['hoa-hong'], m = cd.mau || {}, l = cd.lich || {}, k = LH.khoang(cd, nam, LH.cauHinh(C())), gd = (cd.ghiDe || {})[nam] || {};
    const ds = (a) => esc((a || []).join(', '));
    $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#${R}">← Danh sách</a>`;
    el.innerHTML = `<div class="card lh-sua" data-lh-id="${esc(id)}">
      <div class="row row-2"><label>Tên chiến dịch<input data-f="ten" maxlength="80" value="${esc(cd.ten || '')}"></label><label>Mô tả (cho quản trị)<input data-f="moTa" maxlength="120" value="${esc(cd.moTa || '')}"></label></div>
      <h4>📅 Thời gian</h4>
      <div class="row row-4">
        <label>Loại lịch<select data-l="loai">${[['duong', 'Dương lịch'], ['am', 'Âm lịch Việt Nam'], ['quytac', 'Theo quy tắc']].map(([v, t]) => `<option value="${v}" ${l.loai === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        ${l.loai === 'duong' ? `<label>Ngày lễ (ngày-tháng)<input data-l="ngay" placeholder="MM-DD" pattern="\\d{2}-\\d{2}" value="${esc(l.ngay || '')}"></label>`
          : l.loai === 'am' ? `<label>Ngày âm<input type="number" min="1" max="30" data-l="ngay" value="${esc(String(l.ngay || 1))}"></label><label>Tháng âm<input type="number" min="1" max="12" data-l="thang" value="${esc(String(l.thang || 1))}"></label>`
          : `<label>Quy tắc<select data-l="ma">${[['ngay-cua-me', 'Chủ nhật thứ 2 tháng 5 (Ngày của Mẹ)'], ['ngay-cua-cha', 'Chủ nhật thứ 3 tháng 6 (Ngày của Cha)'], ['black-friday', 'Thứ Sáu sau Lễ Tạ ơn (Black Friday)']].map(([v, t]) => `<option value="${v}" ${l.ma === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`}
        <label>Bật trước ngày lễ (ngày)<input type="number" min="0" max="30" data-f="truoc" value="${esc(String(cd.truoc ?? 3))}"></label>
      </div>
      <div class="row row-4">
        <label>Số ngày lễ<input type="number" min="1" max="60" data-f="soNgay" value="${esc(String(cd.soNgay || 1))}"></label>
        <label>Hoặc kết thúc cố định (MM-DD)<input data-f="denNgay" placeholder="vd 09-10" value="${esc(cd.denNgay || '')}"></label>
        <label>Ưu tiên khi trùng<input type="number" min="0" max="999" data-f="uuTien" value="${esc(String(cd.uuTien || 0))}"></label>
        <label class="sw" style="align-self:end"><input type="checkbox" data-f="bat" ${cd.bat !== false ? 'checked' : ''}> Bật chiến dịch</label>
      </div>
      <div class="box-note">Năm ${nam}: ${k.bd ? `hiển thị <b>${thuCua(LH.chuoi(k.bd))} ${ngayVN(LH.chuoi(k.bd))}</b> → hết <b>${thuCua(LH.chuoi(k.kt))} ${ngayVN(LH.chuoi(k.kt))}</b> · ngày lễ ${ngayVN(LH.chuoi(k.suKien))}${k.tay ? ' (nhập tay)' : ''}` : `<span class="text-red">không tính được: ${esc(k.loi || '')}</span>`}</div>
      <details ${gd.bd ? 'open' : ''}><summary>Nhập tay ngày riêng cho năm ${nam} (khi cần sửa lịch của năm này)</summary>
        <div class="row row-4 mt-8"><label>Bắt đầu<input type="date" data-gd="bd" value="${esc(gd.bd || '')}"></label><label>Kết thúc<input type="date" data-gd="kt" value="${esc(gd.kt || '')}"></label><label>Ngày lễ<input type="date" data-gd="suKien" value="${esc(gd.suKien || '')}"></label>
        <button class="btn btn--ghost btn--sm" style="align-self:end" id="lhBoGd">Bỏ nhập tay</button></div></details>
      <h4>🎨 Giao diện</h4>
      <div class="row row-4">
        <label>Chủ đề<select data-f="chuDe">${Object.keys(LH.CHU_DE).map((t) => `<option value="${t}" ${cd.chuDe === t ? 'selected' : ''}>${LH.CHU_DE[t].sticker} ${t}</option>`).join('')}</select></label>
        <label>Hiệu ứng<select data-f="hieuUng"><option value="__">Theo chủ đề (${esc(LH.HIEU_UNG[cd0.hieuUng] || 'Không có')})</option>${Object.keys(LH.HIEU_UNG).map((h) => `<option value="${h}" ${cd.hieuUng === h ? 'selected' : ''}>${esc(LH.HIEU_UNG[h])}</option>`).join('')}</select></label>
        <label>Màu 1<span class="lh-mau"><input type="color" data-m="m1" value="${esc(m.m1 || cd0.m1)}">${m.m1 ? '<button class="icobtn" data-bo-m="m1" title="Về màu chủ đề">↺</button>' : '<small class="muted">theo chủ đề</small>'}</span></label>
        <label>Màu 2<span class="lh-mau"><input type="color" data-m="m2" value="${esc(m.m2 || cd0.m2)}">${m.m2 ? '<button class="icobtn" data-bo-m="m2" title="Về màu chủ đề">↺</button>' : '<small class="muted">theo chủ đề</small>'}</span></label>
      </div>
      <div class="row row-4">
        <label>Sticker (biểu tượng)<input data-f="sticker" maxlength="8" placeholder="${esc(cd0.sticker)}" value="${esc(cd.sticker || '')}"></label>
        <label>Hạt hiệu ứng (cách nhau dấu phẩy)<input data-f="hat" maxlength="40" placeholder="${esc((cd0.hat || []).join(', '))}" value="${ds(cd.hat)}"></label>
        <label>Chữ trên nút<input data-f="nut" maxlength="24" value="${esc(cd.nut || '')}"></label>
        <label>Link khi bấm<input data-f="link" maxlength="200" placeholder="vd index.html?tab=2010" value="${esc(cd.link || '')}"></label>
      </div>
      <label>Lời chào trên dải đầu trang<textarea data-f="dai" rows="2" maxlength="180">${esc(cd.dai || '')}</textarea></label>
      <h4>🧭 Trang áp dụng</h4>
      <div class="row row-3">
        <label>Hiện ở trang (* = mọi trang)<input data-f="trang" value="${ds(cd.trang)}"></label>
        <label>Không hiện ở trang<input data-f="truTrang" value="${ds(cd.truTrang)}"></label>
        <label>Hiệu ứng chỉ chạy ở trang<input data-f="hieuUngTrang" value="${ds(cd.hieuUngTrang)}"></label>
      </div>
      <p class="muted">Tên trang: index.html, collections.html, product.html, cart.html, checkout.html, account.html, blog.html, diem-danh.html… Mặc định không hiện ở trang thanh toán để khách tập trung đặt hàng.</p>
      <div class="flex gap-8 mt-12"><button class="btn btn--ghost" id="lhMacDinh1">↺ Khôi phục mặc định chiến dịch này</button></div>
    </div>`;
  }

  /* Đọc form → cấu hình (đã kiểm tra kiểu, cắt độ dài) */
  function thuForm() {
    const box = $('.lh-sua'); if (!box) return; const cd = timCd(box.dataset.lhId); if (!cd) return;
    const v = (f) => { const i = $(`[data-f="${f}"]`, box); return i ? (i.type === 'checkbox' ? i.checked : i.value.trim()) : undefined; };
    const so = (x, a, b, mac) => { const n = Math.round(Number(x)); return Number.isFinite(n) ? Math.max(a, Math.min(b, n)) : mac; };
    const dsTrang = (s) => String(s || '').split(',').map((x) => x.trim().toLowerCase()).filter((x) => x === '*' || /^[a-z0-9-]+\.html$/.test(x)).slice(0, 20);
    cd.ten = String(v('ten') || cd.ten).slice(0, 80); cd.moTa = String(v('moTa') || '').slice(0, 120);
    cd.truoc = so(v('truoc'), 0, 30, 3); cd.soNgay = so(v('soNgay'), 1, 60, 1); cd.uuTien = so(v('uuTien'), 0, 999, 0); cd.bat = !!v('bat');
    const dn = v('denNgay'); cd.denNgay = /^\d{2}-\d{2}$/.test(dn) ? dn : '';
    cd.chuDe = LH.CHU_DE[v('chuDe')] ? v('chuDe') : 'hoa-hong';
    const hu = v('hieuUng'); cd.hieuUng = hu === '__' ? null : (Object.prototype.hasOwnProperty.call(LH.HIEU_UNG, hu) ? hu : null);
    cd.sticker = String(v('sticker') || '').slice(0, 8);
    cd.hat = String(v('hat') || '').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 6).map((x) => x.slice(0, 4));
    cd.nut = String(v('nut') || '').slice(0, 24);
    const lk = String(v('link') || ''); cd.link = /^(https:\/\/[^\s"'<>]+|[a-z0-9-]+\.html([?#][^\s"'<>]*)?)$/i.test(lk) ? lk : '';
    cd.dai = String(v('dai') || '').slice(0, 180);
    cd.trang = dsTrang(v('trang')); if (!cd.trang.length) cd.trang = ['*'];
    cd.truTrang = dsTrang(v('truTrang')); cd.hieuUngTrang = dsTrang(v('hieuUngTrang'));
    const l = {}; const li = (k) => { const i = $(`[data-l="${k}"]`, box); return i ? i.value.trim() : ''; };
    l.loai = ['duong', 'am', 'quytac'].includes(li('loai')) ? li('loai') : 'duong';
    if (l.loai !== (cd.lich || {}).loai) { Object.assign(l, l.loai === 'am' ? { thang: 1, ngay: 1 } : l.loai === 'quytac' ? { ma: 'ngay-cua-me' } : { ngay: '01-01' }); }
    else if (l.loai === 'duong') l.ngay = /^\d{2}-\d{2}$/.test(li('ngay')) ? li('ngay') : cd.lich.ngay;
    else if (l.loai === 'am') { l.ngay = so(li('ngay'), 1, 30, 1); l.thang = so(li('thang'), 1, 12, 1); }
    else l.ma = ['ngay-cua-me', 'ngay-cua-cha', 'black-friday'].includes(li('ma')) ? li('ma') : 'ngay-cua-me';
    cd.lich = l;
    const mau = {}; $$('[data-m]', box).forEach((i) => { const cu = (cd.mau || {})[i.dataset.m]; if (cu || i.dataset.doi) mau[i.dataset.m] = /^#[0-9a-f]{6}$/i.test(i.value) ? i.value : ''; });
    cd.mau = mau;
    const gd = {}; $$('[data-gd]', box).forEach((i) => { if (/^\d{4}-\d{2}-\d{2}$/.test(i.value)) gd[i.dataset.gd] = i.value; });
    cd.ghiDe = cd.ghiDe || {}; if (gd.bd && gd.kt && gd.bd <= gd.kt) cd.ghiDe[nam] = gd; else if (!gd.bd && !gd.kt) delete cd.ghiDe[nam];
    return cd;
  }

  function ve(el, o) {
    const sub = (o && o.sub) || '';
    if (!LH) { el.innerHTML = A.trong('Thiếu js/le-hoi.js', 'Tải lại trang quản trị.', '⚠️'); return; }
    C();
    if (sub) return veSua(el, decodeURIComponent(sub));
    veDs(el);
  }

  document.addEventListener('click', async (e) => {
    const t = e.target; if (!$('.lh-tbl') && !$('.lh-sua')) return;
    const n = t.closest('[data-lh-nam]'); if (n) { nam += Number(n.dataset.lhNam); A.veTrang(); return; }
    const x = t.closest('[data-lh-xem]'); if (x) { xemId = x.dataset.lhXem; guiXem(); A.toast('Khung xem trước: ' + (timCd(xemId) || {}).ten); return; }
    const bm = t.closest('[data-bo-m]'); if (bm) { const cd = thuForm(); delete cd.mau[bm.dataset.boM]; luu(); A.veTrang(); return; }
    if (t.id === 'lhBoGd') { const cd = thuForm(); delete cd.ghiDe[nam]; luu(); A.veTrang(); return; }
    if (t.id === 'lhMacDinh') {
      if (!(await A.hoi({ tieuDe: 'Khôi phục lịch ngày lễ mặc định?', noiDung: 'Mọi chỉnh sửa chữ, màu, ngày nhập tay của tất cả chiến dịch sẽ về như ban đầu.', nutOk: 'Khôi phục', nguyHiem: true }))) return;
      A.D.LE_HOI = A.sao(LH.MAC_DINH); luu(); A.veTrang(); A.toast('Đã khôi phục mặc định', 'ok'); return;
    }
    if (t.id === 'lhMacDinh1') {
      const box = $('.lh-sua'), goc = LH.MAC_DINH.ds.find((d) => d.id === box.dataset.lhId); if (!goc) { A.toast('Chiến dịch này không có bản mặc định', 'err'); return; }
      const ds = C().ds, i = ds.findIndex((d) => d.id === goc.id); ds[i] = A.sao(goc); luu(); A.veTrang(); A.toast('Đã khôi phục', 'ok');
    }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'lhBat' || t.id === 'lhHu' || t.id === 'lhDc') { const c = C(); c.bat = $('#lhBat').checked; c.hieuUng = $('#lhHu').checked; c.chiDungNgayDoiChieu = $('#lhDc').checked; luu(); A.veTrang(); return; }
    if (t.dataset.lhBat) { const cd = timCd(t.dataset.lhBat); if (cd) { cd.bat = t.checked; luu(); A.veTrang(); } return; }
    if (t.dataset.lhUu) { const cd = timCd(t.dataset.lhUu); if (cd) { cd.uuTien = Math.max(0, Math.min(999, Math.round(+t.value) || 0)); luu(); A.veTrang(); } return; }
    if (t.closest('.lh-sua')) { if (t.dataset.m) t.dataset.doi = '1'; thuForm(); luu(); if (t.matches('select,[type=checkbox],[type=date],[type=number],[data-f=denNgay],[data-l=ngay]')) A.veTrang(); }
  });
  document.addEventListener('input', (e) => { const t = e.target; if (t.closest('.lh-sua') && t.matches('textarea,[data-f=nut],[data-f=sticker],[data-f=ten],[type=color]')) { if (t.dataset.m) t.dataset.doi = '1'; thuForm(); luuTre(); } });
  /* rời mục này → khung xem trước về giao diện thật theo ngày */
  window.addEventListener('hashchange', () => { if (!location.hash.startsWith('#' + R) && xemId) { xemId = ''; delete A.D.LE_XEM; } });

  A.dangKy({ route: R, ten: 'Giao diện ngày lễ', icon: '🎉', nhom: 'website', quyen: 'theme.view', preview: true,
    mo: 'Tự đổi giao diện theo Tết, 8/3, 20/10, Trung Thu, Giáng sinh…', ve });
})();
