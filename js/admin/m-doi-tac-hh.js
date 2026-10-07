/* ===== ĐỐI TÁC – HOA HỒNG SẢN PHẨM + CHIẾN DỊCH RIÊNG (kiểu Shopee Affiliate) =====
   - Hoa hồng sản phẩm: chỉ sản phẩm shop THÊM vào chương trình mới có hoa hồng; sửa % nhanh, sửa hàng loạt, loại bỏ, xem hiệu quả.
   - Chiến dịch riêng: mức % riêng cho 1 / nhiều đối tác, theo từng sản phẩm hoặc toàn bộ, có thời gian bắt đầu / kết thúc.
   Thứ tự tính (máy chủ): chiến dịch riêng (cao nhất) > % sản phẩm > sản phẩm chưa thêm = 0. Mọi nguồn đơn dùng chung mức này.
   Máy chủ: qtAffSp / qtAffSpLuu / qtAffCd / qtAffCdLuu / qtAffCdDung / qtAffCdXoa. Được m-doi-tac.js gọi qua A.affHH. */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt } = A;
  const n0 = (x) => Number(x || 0).toLocaleString('vi-VN');
  const pct = (x) => String(Math.round(Number(x) * 100) / 100).replace('.', ',') + '%';
  const SP = () => (A.D.PRODUCTS || []).filter((p) => p && p.id);
  const timSp = (id) => SP().find((p) => String(p.id) === String(id)) || { id, name: 'SP ' + id };
  const anh = (p, c = 40) => `<img src="${esc(p.thumb || p.image || (p.images || [])[0] || '')}" alt="" style="width:${c}px;height:${c}px;border-radius:8px;object-fit:cover;background:#f3f3f3" onerror="this.style.visibility='hidden'">`;
  const sua = () => A.co('affiliate.settings');
  const S = { q: '', loc: 'dung', chon: new Set(), them: false, qThem: '', chonThem: new Set() };
  let dl = null, cdDl = null, ed = null;

  /* ================= HOA HỒNG SẢN PHẨM ================= */
  async function veSp(el, khung) {
    const b = khung(el, '');
    try { const d = await A.api('qtAffSp', {}); if (!d || !d.ok) { b.innerHTML = A.loiTai((d && d.msg) || 'Apps Script chưa có phần Hoa hồng sản phẩm'); return; } dl = d; S.chon.clear(); veBangSp(b); }
    catch (e) { b.innerHTML = A.loiTai(e.message); }
  }
  function veBangSp(b) {
    const m = dl.sp || {}, hq = dl.hieuQua || {};
    const tatCa = Object.keys(m).map((id) => ({ id, r: m[id], p: timSp(id), hq: hq[id] || { don: 0, tien: 0, hh: 0 } }));
    const dang = tatCa.filter((x) => !x.r.tat), loai = tatCa.filter((x) => x.r.tat);
    const ds = (S.loc === 'loai' ? loai : S.loc === 'tat' ? tatCa : dang).filter((x) => !S.q || (x.p.name + ' ' + x.id).toLowerCase().includes(S.q.toLowerCase()));
    $('#pageAct').innerHTML = sua() ? '<button class="btn btn--primary" id="hhThemMo">+ Thêm sản phẩm</button>' : '';
    b.innerHTML = `<div class="kpis">
        ${A.the('Sản phẩm có hoa hồng', n0(dang.length), `/ ${n0(SP().length)} sản phẩm của shop`, 'kpi--teal')}
        ${A.the('Đơn qua đối tác', n0(dang.reduce((s, x) => s + x.hq.don, 0)), 'tính theo dòng sản phẩm')}
        ${A.the('Doanh thu', fmt(tatCa.reduce((s, x) => s + x.hq.tien, 0)), '')}
        ${A.the('Hoa hồng phát sinh', fmt(tatCa.reduce((s, x) => s + x.hq.hh, 0)), '', 'kpi--pink')}</div>
      ${S.them ? panelThem() : ''}
      <div class="card"><h3>📦 Sản phẩm trong chương trình đối tác</h3>
        <p class="muted">Chỉ sản phẩm có trong danh sách này mới có hoa hồng (trừ khi có trong chiến dịch riêng của đối tác). Đối tác cũng chỉ thấy các sản phẩm này để lấy link.</p>
        <div class="tool" style="grid-template-columns:1fr 200px"><div class="tool__tim"><input id="hhQ" placeholder="Tìm tên / mã sản phẩm…" value="${esc(S.q)}" autocomplete="off"></div>
          <select id="hhLoc"><option value="dung" ${S.loc === 'dung' ? 'selected' : ''}>Đang áp dụng (${dang.length})</option><option value="loai" ${S.loc === 'loai' ? 'selected' : ''}>Đã loại bỏ (${loai.length})</option><option value="tat" ${S.loc === 'tat' ? 'selected' : ''}>Tất cả (${tatCa.length})</option></select></div>
        ${sua() && S.chon.size ? `<div class="hh-loat"><b>Đã chọn ${S.chon.size}</b><input id="hhLoatPt" type="number" min="0" max="50" step="0.5" placeholder="%" style="width:90px"><button class="btn btn--primary btn--sm" id="hhLoatDat">Đặt %</button><button class="btn btn--ghost btn--sm" id="hhLoatLoai">Loại bỏ</button><button class="btn btn--ghost btn--sm" id="hhLoatKhoi">Khôi phục</button><button class="btn btn--ghost btn--sm" id="hhLoatBo">Bỏ chọn</button></div>` : ''}
        ${ds.length ? `<div class="tbl-wrap"><table><thead><tr>${sua() ? `<th style="width:34px"><input type="checkbox" id="hhAll" ${ds.every((x) => S.chon.has(x.id)) ? 'checked' : ''}></th>` : ''}<th>Thông tin sản phẩm</th><th>Trạng thái</th><th class="num">Tỉ lệ hoa hồng</th><th>Áp dụng từ</th><th class="num">Hiệu quả</th><th></th></tr></thead><tbody>
          ${ds.map((x) => `<tr>${sua() ? `<td><input type="checkbox" data-hh-chon="${esc(x.id)}" ${S.chon.has(x.id) ? 'checked' : ''}></td>` : ''}
            <td><div style="display:flex;gap:10px;align-items:center">${anh(x.p)}<div><b>${esc(x.p.short || x.p.name)}</b><br><small class="muted">Mã SP: ${esc(x.id)} · ${fmt(x.p.price || 0)}</small></div></div></td>
            <td>${x.r.tat ? A.badge('Đã loại bỏ', 'tag--no') : A.badge('Đang áp dụng', 'tag--ok')}</td>
            <td class="num" data-nhan="Tỉ lệ"><span data-hh-sua="${esc(x.id)}" class="hh-pt" title="${sua() ? 'Bấm để sửa' : ''}">${x.r.pt != null ? pct(x.r.pt) : `${pct(dl.macDinh.link)} <small class="muted">(mặc định)</small>`} ${sua() ? '✏️' : ''}</span></td>
            <td><small>${esc(x.r.tu || '—')}<br>– Không giới hạn</small></td>
            <td class="num" data-nhan="Hiệu quả"><small>${n0(x.hq.don)} đơn · ${fmt(x.hq.tien)}<br>HH <b>${fmt(x.hq.hh)}</b></small></td>
            <td class="num">${sua() ? (x.r.tat ? `<button class="btn btn--ghost btn--sm" data-hh-viec="khoiPhuc" data-id="${esc(x.id)}">Khôi phục</button>` : `<button class="btn btn--ghost btn--sm" data-hh-viec="loai" data-id="${esc(x.id)}">Loại bỏ</button>`) : ''}</td></tr>`).join('')}
        </tbody></table></div>` : A.trong(S.loc === 'loai' ? 'Chưa loại bỏ sản phẩm nào' : 'Chưa có sản phẩm nào trong chương trình', sua() ? 'Bấm "+ Thêm sản phẩm" để chọn sản phẩm làm affiliate.' : '', '📦')}
      </div>`;
  }
  function panelThem() {
    const m = dl.sp || {}; const k = S.qThem.toLowerCase();
    const ds = SP().filter((p) => (!m[p.id] || m[p.id].tat) && (!k || (p.name + ' ' + p.id).toLowerCase().includes(k)));
    return `<div class="card hh-them"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><h3 style="margin:0">+ Thêm sản phẩm vào chương trình</h3><button class="btn btn--ghost btn--sm" id="hhThemDong">Đóng</button></div>
      <div class="tool" style="grid-template-columns:1fr auto auto auto;margin-top:10px"><div class="tool__tim"><input id="hhThemQ" placeholder="Tìm sản phẩm…" value="${esc(S.qThem)}" autocomplete="off"></div>
        <label style="margin:0;display:flex;align-items:center;gap:6px;white-space:nowrap">Tỉ lệ <input id="hhThemPt" type="number" min="0" max="50" step="0.5" value="${esc(dl.macDinh.link)}" style="width:80px;margin:0">%</label>
        <button class="btn btn--ghost btn--sm" id="hhThemTatCa">Chọn tất cả (${ds.length})</button><button class="btn btn--primary" id="hhThemLuu">Thêm ${S.chonThem.size || ''} SP</button></div>
      <div class="hh-lua">${ds.map((p) => `<label class="hh-lua__it"><input type="checkbox" data-them="${esc(p.id)}" ${S.chonThem.has(String(p.id)) ? 'checked' : ''}>${anh(p, 44)}<span><b>${esc(p.short || p.name)}</b><small class="muted">${fmt(p.price || 0)} · đã bán ${n0(p.sold)}${m[p.id] && m[p.id].tat ? ' · <i>đã loại bỏ trước đó</i>' : ''}</small></span></label>`).join('') || '<p class="muted">Mọi sản phẩm đã có trong chương trình.</p>'}</div></div>`;
  }
  const luuSp = async (ids, viec, pt, ok) => {
    try { const r = await A.api('qtAffSpLuu', { ids: ids.join(','), viec, pt: pt ?? '' }); if (!r || !r.ok) { A.toast((r && r.msg) || 'Chưa lưu được', 'err'); return false; } A.toast(ok, 'ok'); return true; }
    catch (e) { A.toast(e.message, 'err'); return false; }
  };

  /* ================= CHIẾN DỊCH RIÊNG ================= */
  async function veCd(el, khung, sub) {
    const b = khung(el, 'cd');
    try {
      const [d, dsDt, sp] = await Promise.all([A.api('qtAffCd', {}), A.api('qtAffDs', {}), dl ? Promise.resolve(dl) : A.api('qtAffSp', {})]);
      if (sp && sp.ok) dl = sp;   // cột "% sản phẩm hiện tại" trong màn tạo chiến dịch
      if (!d || !d.ok) { b.innerHTML = A.loiTai((d && d.msg) || 'Chưa tải được'); return; }
      cdDl = { ds: d.ds, dts: ((dsDt && dsDt.ds) || []).filter((x) => x.tt === 'Đã duyệt' || x.tt === 'Đã khoá'), macDinh: (dsDt && dsDt.cauHinh && dsDt.cauHinh.hh) || {} };
      const s = sub.replace(/^cd\/?/, '');
      if (s.startsWith('moi') || s) { if (s.startsWith('moi')) moEd(null, s.slice(4)); else moEd(cdDl.ds.find((c) => c.ma === s)); return veEd(b); }
      veDsCd(b);
    } catch (e) { b.innerHTML = A.loiTai(e.message); }
  }
  function veDsCd(b) {
    $('#pageAct').innerHTML = sua() ? '<a class="btn btn--primary" href="#/doi-tac/cd/moi">+ Tạo chiến dịch</a>' : '';
    const TT = { 'Đang diễn ra': 'tag--ok', 'Sắp diễn ra': '', 'Đã kết thúc': 'tag--no', 'Đã dừng': 'tag--no' };
    b.innerHTML = `<div class="card"><h3>🎯 Chiến dịch riêng cho đối tác</h3><p class="muted">Mức hoa hồng riêng cho từng đối tác (ưu tiên hơn % sản phẩm). Nhiều chiến dịch cùng áp dụng → đối tác nhận mức cao nhất.</p>
      ${cdDl.ds.length ? `<div class="tbl-wrap"><table><thead><tr><th>Tên chiến dịch</th><th>Thời gian</th><th>Đối tác</th><th>Sản phẩm</th><th class="num">Tỉ lệ hoa hồng</th><th class="num">Hiệu quả</th><th>Trạng thái</th><th></th></tr></thead><tbody>
        ${cdDl.ds.map((c) => { const v = c.tatCa ? [c.ptChung] : Object.values(c.sp).map(Number); const lo = Math.min(...v), hi = Math.max(...v); const ids = Object.keys(c.sp);
          return `<tr><td><b>${esc(c.ten)}</b><br><small class="muted">Mã: ${esc(c.ma)}</small></td>
            <td><small>${esc((c.batDau || '').replace('T', ' '))}<br>– ${c.ketThuc ? esc(c.ketThuc.replace('T', ' ')) : 'Không giới hạn'}</small></td>
            <td>${c.dts.map((m) => `<span class="tag">${esc(m)}</span>`).join(' ')}</td>
            <td>${c.tatCa ? '<span class="tag tag--ok">Toàn bộ SP</span>' : `<div class="hh-thumbs">${ids.slice(0, 3).map((id) => anh(timSp(id), 34)).join('')}${ids.length > 3 ? `<span class="hh-them-so">+${ids.length - 3}</span>` : ''}</div>`}</td>
            <td class="num"><b>${lo === hi ? pct(lo) : pct(lo) + ' – ' + pct(hi)}</b></td>
            <td class="num"><small>${n0(c.hieuQua.don)} đơn · ${fmt(c.hieuQua.tien)}<br>HH <b>${fmt(c.hieuQua.hh)}</b></small></td>
            <td>${A.badge(c.trangThai, TT[c.trangThai] || '')}</td>
            <td class="num" style="white-space:nowrap">${sua() ? `<a class="btn btn--ghost btn--sm" href="#/doi-tac/cd/${esc(c.ma)}">Chỉnh sửa</a> ${c.tt === 'Đã dừng' ? `<button class="btn btn--ghost btn--sm" data-cd-dung="chay" data-ma="${esc(c.ma)}">Chạy lại</button>` : `<button class="btn btn--ghost btn--sm" data-cd-dung="dung" data-ma="${esc(c.ma)}">Dừng</button>`} <button class="btn btn--ghost btn--sm" style="color:var(--danger,#d33)" data-cd-xoa="${esc(c.ma)}" data-ten="${esc(c.ten)}">Xoá</button>` : ''}</td></tr>`; }).join('')}
      </tbody></table></div>` : A.trong('Chưa có chiến dịch riêng', 'Tạo chiến dịch để đặt hoa hồng riêng cho đối tác (vd KOC bán tốt được 15%).', '🎯')}</div>`;
  }
  function moEd(c, maDt) {
    ed = c ? { ma: c.ma, ten: c.ten, dts: new Set(c.dts), tatCa: c.tatCa, ptChung: c.ptChung ?? '', sp: { ...c.sp }, batDau: c.batDau, ketThuc: c.ketThuc, q: '' }
      : { ma: '', ten: maDt ? 'Hoa hồng riêng – ' + maDt.toUpperCase() : '', dts: new Set(maDt ? [maDt.toUpperCase()] : []), tatCa: false, ptChung: '', sp: {}, batDau: '', ketThuc: '', q: '', phien: Date.now().toString(36) + Math.random().toString(36).slice(2, 8) };
  }
  function veEd(b) {
    $('#pageAct').innerHTML = '<a class="btn btn--ghost" href="#/doi-tac/cd">← Danh sách chiến dịch</a>';
    const mHh = (dl && dl.sp) || {}; const k = ed.q.toLowerCase();
    const ds = SP().filter((p) => !k || (p.name + ' ' + p.id).toLowerCase().includes(k));
    b.innerHTML = `<div class="card" style="max-width:1000px"><h3>${ed.ma ? 'Sửa chiến dịch ' + esc(ed.ma) : '🎯 Tạo chiến dịch riêng'}</h3>
      <div class="grid-2"><label>Tên chiến dịch <i>*</i><input id="cdTen" maxlength="100" value="${esc(ed.ten)}" placeholder="VD: HCK x Mẹ Bi – tháng 10"></label>
        <div class="grid-2" style="gap:10px"><label>Bắt đầu<input id="cdBd" type="datetime-local" value="${esc(ed.batDau)}"><small class="hint">Trống = ngay bây giờ</small></label><label>Kết thúc<input id="cdKt" type="datetime-local" value="${esc(ed.ketThuc)}"><small class="hint">Trống = không giới hạn</small></label></div></div>
      <label>Đối tác áp dụng <i>*</i></label>
      <div class="hh-dt">${cdDl.dts.map((x) => `<label class="hh-dt__it"><input type="checkbox" data-cd-dt="${esc(x.ma)}" ${ed.dts.has(x.ma) ? 'checked' : ''}> <b>${esc(x.ma)}</b> · ${esc(x.ten)}</label>`).join('') || '<p class="muted">Chưa có đối tác đã duyệt.</p>'}</div>
      <label style="margin-top:12px">Sản phẩm áp dụng</label>
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:10px"><label class="qmk__tk" style="margin:0"><input type="radio" style="width:auto;margin:0" name="cdPham" value="chon" ${ed.tatCa ? '' : 'checked'}> Chọn từng sản phẩm, mỗi SP một mức %</label>
        <label class="qmk__tk" style="margin:0"><input type="radio" style="width:auto;margin:0" name="cdPham" value="tatCa" ${ed.tatCa ? 'checked' : ''}> Toàn bộ sản phẩm của shop, 1 mức</label></div>
      ${ed.tatCa ? `<label style="max-width:240px">% hoa hồng chung <i>*</i><input id="cdPtChung" type="number" min="0" max="50" step="0.5" value="${esc(ed.ptChung)}"></label>`
      : `<div class="tool" style="grid-template-columns:1fr auto auto"><div class="tool__tim"><input id="cdQ" placeholder="Tìm sản phẩm…" value="${esc(ed.q)}" autocomplete="off"></div>
          <input id="cdLoatPt" type="number" min="0" max="50" step="0.5" placeholder="%" style="width:90px"><button class="btn btn--ghost btn--sm" id="cdLoat">Áp % cho SP đã chọn (${Object.keys(ed.sp).length})</button></div>
        <div class="tbl-wrap" style="max-height:460px;overflow:auto"><table><thead><tr><th style="width:34px"><input type="checkbox" id="cdAll" title="Chọn toàn bộ sản phẩm đang hiển thị" ${ds.length && ds.every((p) => ed.sp[p.id] != null) ? "checked" : ""}></th><th>Sản phẩm</th><th class="num">% sản phẩm hiện tại</th><th class="num" style="width:150px">% riêng chiến dịch</th></tr></thead><tbody>
          ${ds.map((p) => { const co = ed.sp[p.id] != null; const h = mHh[p.id]; return `<tr><td><input type="checkbox" data-cd-sp="${esc(p.id)}" ${co ? 'checked' : ''}></td>
            <td><div style="display:flex;gap:10px;align-items:center">${anh(p, 36)}<div><b>${esc(p.short || p.name)}</b><br><small class="muted">${fmt(p.price || 0)}</small></div></div></td>
            <td class="num"><small>${h && !h.tat ? (h.pt != null ? pct(h.pt) : pct(cdDl.macDinh.link) + ' (mặc định)') : '<span class="muted">không tham gia</span>'}</small></td>
            <td class="num"><input type="number" min="0" max="50" step="0.5" data-cd-pt="${esc(p.id)}" value="${co ? esc(ed.sp[p.id]) : ''}" ${co ? '' : 'disabled'} style="width:90px"> %</td></tr>`; }).join('')}
        </tbody></table></div>`}
      <div style="display:flex;gap:8px;margin-top:14px"><button class="btn btn--primary" id="cdLuu">${ed.ma ? 'Lưu thay đổi' : 'Tạo chiến dịch'}</button><a class="btn btn--ghost" href="#/doi-tac/cd">Huỷ</a></div>
      <p class="muted" style="margin-top:8px">Đơn đã ghi nhận giữ mức % lúc đặt. Đối tác thấy mức riêng của mình ngay trong trang đối tác.</p></div>`;
  }
  const docEd = () => { if (!ed || !$('#cdTen')) return; ed.ten = $('#cdTen').value; ed.batDau = $('#cdBd').value; ed.ketThuc = $('#cdKt').value; if ($('#cdPtChung')) ed.ptChung = $('#cdPtChung').value; };

  /* ================= Sự kiện ================= */
  const veLai = () => { const b = $('#dtBody'); if (!b) return; if (location.hash.startsWith('#/doi-tac/cd/')) veEd(b); else if (dl && (location.hash === '#/doi-tac' || location.hash === '#/doi-tac/')) veBangSp(b); };
  const tre = A.tre(() => { veLai(); const i = $('#hhQ') || $('#hhThemQ') || $('#cdQ'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 300);
  document.addEventListener('input', (e) => {
    if (!location.hash.startsWith('#/doi-tac')) return;
    if (e.target.id === 'hhQ') { S.q = e.target.value; tre(); } if (e.target.id === 'hhThemQ') { S.qThem = e.target.value; tre(); }
    if (e.target.id === 'cdQ') { docEd(); ed.q = e.target.value; tre(); }
    const p = e.target.closest('[data-cd-pt]'); if (p && ed) ed.sp[p.dataset.cdPt] = p.value;
  });
  document.addEventListener('change', (e) => {
    if (!location.hash.startsWith('#/doi-tac')) return;
    if (e.target.id === 'hhLoc') { S.loc = e.target.value; S.chon.clear(); veLai(); }
    if (e.target.id === 'hhAll') { $$('[data-hh-chon]').forEach((c) => (e.target.checked ? S.chon.add(c.dataset.hhChon) : S.chon.delete(c.dataset.hhChon))); veLai(); }
    const c = e.target.closest('[data-hh-chon]'); if (c) { c.checked ? S.chon.add(c.dataset.hhChon) : S.chon.delete(c.dataset.hhChon); veLai(); }
    const t = e.target.closest('[data-them]'); if (t) { t.checked ? S.chonThem.add(t.dataset.them) : S.chonThem.delete(t.dataset.them); const n = $('#hhThemLuu'); if (n) n.textContent = `Thêm ${S.chonThem.size || ''} SP`; }
    const dt = e.target.closest('[data-cd-dt]'); if (dt && ed) dt.checked ? ed.dts.add(dt.dataset.cdDt) : ed.dts.delete(dt.dataset.cdDt);
    if (e.target.name === 'cdPham' && ed) { docEd(); ed.tatCa = e.target.value === 'tatCa'; veLai(); }
    if (e.target.id === 'cdAll' && ed) { docEd(); const on = e.target.checked; $$('[data-cd-sp]').forEach((x) => { const id = x.dataset.cdSp; if (!on) return delete ed.sp[id]; if (ed.sp[id] == null) { const h = (dl && dl.sp && dl.sp[id]) || null; ed.sp[id] = h && h.pt != null ? h.pt : (cdDl.macDinh.link ?? 10); } }); return veLai(); }
    const sp = e.target.closest('[data-cd-sp]'); if (sp && ed) { docEd(); const id = sp.dataset.cdSp; if (sp.checked) { const h = (dl && dl.sp && dl.sp[id]) || null; ed.sp[id] = h && h.pt != null ? h.pt : (cdDl.macDinh.link ?? 10); } else delete ed.sp[id]; veLai(); }
  });
  document.addEventListener('click', async (e) => {
    if (!location.hash.startsWith('#/doi-tac')) return;
    if (e.target.id === 'hhThemMo') { S.them = true; S.chonThem.clear(); return veLai(); }
    if (e.target.id === 'hhThemDong') { S.them = false; return veLai(); }
    if (e.target.id === 'hhThemTatCa') { $$('[data-them]').forEach((c) => S.chonThem.add(c.dataset.them)); return veLai(); }
    if (e.target.id === 'hhThemLuu') { const pt = $('#hhThemPt').value; if (!S.chonThem.size) return A.toast('Chọn sản phẩm cần thêm', 'err');
      if (await luuSp([...S.chonThem], 'dat', pt, `Đã thêm ${S.chonThem.size} sản phẩm (${pt}%)`)) { S.them = false; S.chonThem.clear(); A.veTrang(); } return; }
    const ed1 = e.target.closest('[data-hh-sua]'); if (ed1 && sua()) { const id = ed1.dataset.hhSua; const cu = (dl.sp[id] || {}).pt;
      ed1.outerHTML = `<span class="hh-sua"><input type="number" min="0" max="50" step="0.5" value="${cu ?? ''}" data-hh-o="${esc(id)}" style="width:76px"> <button class="btn btn--primary btn--sm" data-hh-ok="${esc(id)}">✓</button></span>`; $(`[data-hh-o="${id}"]`).focus(); return; }
    const ok1 = e.target.closest('[data-hh-ok]'); if (ok1) { const id = ok1.dataset.hhOk; const v = $(`[data-hh-o="${id}"]`).value; if (v === '') return A.toast('Nhập tỉ lệ %', 'err'); if (await luuSp([id], 'dat', v, `Đã đặt ${v}%`)) A.veTrang(); return; }
    const vi = e.target.closest('[data-hh-viec]'); if (vi) { const loai = vi.dataset.hhViec === 'loai';
      if (loai && !(await A.hoi({ tieuDe: 'Loại bỏ sản phẩm khỏi chương trình?', noiDung: 'Đơn mới của sản phẩm này không còn hoa hồng (trừ chiến dịch riêng có sản phẩm này). Đối tác không thấy sản phẩm để lấy link nữa.', nutOk: 'Loại bỏ', nguyHiem: true }))) return;
      if (await luuSp([vi.dataset.id], vi.dataset.hhViec, '', loai ? 'Đã loại bỏ' : 'Đã khôi phục')) A.veTrang(); return; }
    if (e.target.id === 'hhLoatBo') { S.chon.clear(); return veLai(); }
    if (e.target.id === 'hhLoatDat') { const v = $('#hhLoatPt').value; if (v === '') return A.toast('Nhập tỉ lệ %', 'err');
      if (await A.hoi({ tieuDe: `Đặt ${v}% cho ${S.chon.size} sản phẩm?`, noiDung: 'Áp dụng cho đơn mới.', nutOk: 'Đặt %' }) && await luuSp([...S.chon], 'dat', v, `Đã đặt ${v}% cho ${S.chon.size} sản phẩm`)) { S.chon.clear(); A.veTrang(); } return; }
    if (e.target.id === 'hhLoatLoai' || e.target.id === 'hhLoatKhoi') { const viec = e.target.id === 'hhLoatLoai' ? 'loai' : 'khoiPhuc';
      if (await A.hoi({ tieuDe: (viec === 'loai' ? 'Loại bỏ ' : 'Khôi phục ') + S.chon.size + ' sản phẩm?', noiDung: viec === 'loai' ? 'Các sản phẩm này không còn hoa hồng cho đơn mới.' : 'Các sản phẩm có hoa hồng trở lại.', nutOk: 'Đồng ý', nguyHiem: viec === 'loai' }) && await luuSp([...S.chon], viec, '', 'Đã cập nhật')) { S.chon.clear(); A.veTrang(); } return; }
    if (e.target.id === 'cdLoat') { docEd(); const v = $('#cdLoatPt').value; if (v === '') return A.toast('Nhập %', 'err'); Object.keys(ed.sp).forEach((id) => { ed.sp[id] = v; }); return veLai(); }
    const dg = e.target.closest('[data-cd-dung]'); if (dg) { const dung = dg.dataset.cdDung === 'dung';
      if (!(await A.hoi({ tieuDe: dung ? 'Dừng chiến dịch?' : 'Chạy lại chiến dịch?', noiDung: dung ? 'Đơn mới của đối tác sẽ về mức % sản phẩm.' : 'Áp dụng lại mức % riêng cho đơn mới.', nutOk: dung ? 'Dừng' : 'Chạy lại', nguyHiem: dung }))) return;
      try { const r = await A.api('qtAffCdDung', { ma: dg.dataset.ma, viec: dg.dataset.cdDung }); A.toast(r && r.ok ? 'Đã cập nhật' : (r && r.msg) || 'Lỗi', r && r.ok ? 'ok' : 'err'); } catch (err) { A.toast(err.message, 'err'); } return A.veTrang(); }
    if (e.target.id === 'cdLuu') { docEd();
      const sp = {}; Object.keys(ed.sp).forEach((id) => { if (ed.sp[id] !== '' && ed.sp[id] != null) sp[id] = ed.sp[id]; });
      const p = { ma: ed.ma, ten: ed.ten.trim(), dts: [...ed.dts].join(','), tatCa: ed.tatCa ? '1' : '0', ptChung: ed.ptChung, sp: JSON.stringify(sp), batDau: ed.batDau, ketThuc: ed.ketThuc, phien: ed.phien || '' };
      if (!p.ten) return A.toast('Nhập tên chiến dịch', 'err'); if (!ed.dts.size) return A.toast('Chọn ít nhất 1 đối tác', 'err');
      if (!ed.tatCa && !Object.keys(sp).length) return A.toast('Chọn sản phẩm và nhập %', 'err');
      const nut = e.target; if (nut.disabled) return; nut.disabled = true; const nhan = nut.textContent; nut.textContent = 'Đang lưu…';
      const mo = () => { nut.disabled = false; nut.textContent = nhan; };
      try { const r = await A.api('qtAffCdLuu', p); if (!r || !r.ok) { mo(); return A.toast((r && r.msg) || 'Chưa lưu được', 'err'); } A.toast(ed.ma ? 'Đã lưu chiến dịch' : 'Đã tạo chiến dịch ' + r.ma, 'ok'); ed = null; location.hash = '#/doi-tac/cd'; }
      catch (err) { mo(); A.toast(err.message, 'err'); } }
    const xo = e.target.closest('[data-cd-xoa]'); if (xo) {
      if (!(await A.hoi({ tieuDe: 'Xoá chiến dịch?', noiDung: 'Xoá hẳn chiến dịch ' + xo.dataset.ten + '. Đơn mới của đối tác về mức % sản phẩm; đơn đã ghi nhận giữ nguyên hoa hồng. Không hoàn tác được.', nutOk: 'Xoá', nguyHiem: true }))) return;
      xo.disabled = true; try { const r = await A.api('qtAffCdXoa', { ma: xo.dataset.cdXoa }); A.toast(r && r.ok ? 'Đã xoá chiến dịch' : (r && r.msg) || 'Lỗi', r && r.ok ? 'ok' : 'err'); } catch (err) { A.toast(err.message, 'err'); } return A.veTrang(); }
  });

  A.affHH = { veSp, veCd };
})();
