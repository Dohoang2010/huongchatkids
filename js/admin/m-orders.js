/* ===== ĐƠN HÀNG – danh sách, lọc, chi tiết, dòng thời gian, đổi trạng thái ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt, ngayISO, khongDau } = A;

  const LUONG = ['Chờ xác nhận', 'Đã xác nhận', 'Đang chuẩn bị', 'Đang giao', 'Đã giao'];
  const MAU = { 'Chờ xác nhận': 'tag--wait', 'Đã xác nhận': 'tag--ok', 'Đang chuẩn bị': 'tag--ok', 'Đang giao': 'tag--ok', 'Đã giao': 'tag--ok', 'Đã huỷ': 'tag--no', 'Yêu cầu hoàn hàng': 'tag--wait', 'Đã hoàn hàng': 'tag--no' };
  const S = { tt: '', q: '', ngay: '30', tu: '', den: '', trang: 1, moiTrang: 20 };
  let data = null;

  function khoang() {
    const h = new Date(); S.den = ngayISO(h);
    S.tu = S.ngay === 'all' ? '2020-01-01' : ngayISO(new Date(h.getTime() - (Number(S.ngay) - 1) * 864e5));
  }

  async function veDS(el) {
    if (!S.tu) khoang();
    el.innerHTML = A.dangTai('đơn hàng');
    try {
      const d = await A.api('donHang', { key: A.adminKey(), tu: S.tu, den: S.den, tt: S.tt, q: S.q });
      if (!d || !d.ok) { el.innerHTML = d && d.msg ? A.loiTai(d.msg) : chuaCo(); return; }
      if (!d.ds) { el.innerHTML = chuaCo(); return; }
      data = d; veBang(el, d);
    } catch (e) { el.innerHTML = A.loiTai(e.message); }
  }

  const chuaCo = () => `<div class="card err-box"><h3>⏳ Apps Script chưa có phần đơn hàng</h3>
    <p>Mở file <code>tools/apps-script-CUA-SHOP.gs</code> trên máy, dán đè vào Apps Script rồi
    <b>Deploy → Manage deployments → ✏️ → New version → Deploy</b>. Sau đó bấm Thử lại.</p>
    <button class="btn btn--primary" data-act="tai-lai">Thử lại</button></div>`;

  function veBang(el, d) {
    const tong = d.ds.length;
    S.trang = Math.min(S.trang, Math.max(1, Math.ceil(tong / S.moiTrang)));
    const slice = d.ds.slice((S.trang - 1) * S.moiTrang, S.trang * S.moiTrang);
    const tien = d.ds.reduce((s, o) => s + (/huỷ|hoàn/i.test(o.trangThai) ? 0 : o.tong), 0);
    $('#pageAct').innerHTML = `<button class="btn btn--ghost" id="dhCRM" title="Lấy trạng thái mới nhất của các đơn chưa xong từ CRM">🔄 Đồng bộ CRM</button><button class="btn btn--ghost" id="dhXuat">⭳ Xuất Excel</button>`;

    el.innerHTML = `
      <div class="kpis">
        ${A.the('Đơn trong kỳ', d.tong, `${S.ngay === 'all' ? 'tất cả' : S.ngay + ' ngày'} gần nhất`)}
        ${A.the('Doanh thu (trừ huỷ/hoàn)', fmt(tien), '', 'kpi--pink')}
        ${A.the('Chờ xác nhận', d.demTT['Chờ xác nhận'] || 0, 'cần xử lý sớm', (d.demTT['Chờ xác nhận'] || 0) ? 'kpi--amber' : '')}
        ${A.the('Đang giao', d.demTT['Đang giao'] || 0, '')}
        ${A.the('Đã giao', d.demTT['Đã giao'] || 0, '', 'kpi--teal')}
        ${A.the('Huỷ / hoàn', (d.demTT['Đã huỷ'] || 0) + (d.demTT['Đã hoàn hàng'] || 0), '', 'kpi--red')}
      </div>

      <div class="card">
        <div class="tool">
          <div class="tool__tim"><input id="dhQ" placeholder="Tìm mã đơn, tên khách, số điện thoại…" value="${esc(S.q)}" autocomplete="off"></div>
          <select id="dhTT"><option value="">Mọi trạng thái</option>
            ${Object.keys(MAU).map((t) => `<option value="${esc(t)}" ${S.tt === t ? 'selected' : ''}>${esc(t)}${d.demTT[t] ? ` (${d.demTT[t]})` : ''}</option>`).join('')}</select>
          <select id="dhNgay">
            ${[['7', '7 ngày'], ['30', '30 ngày'], ['90', '3 tháng'], ['365', '1 năm'], ['all', 'Tất cả']].map(([v, t]) => `<option value="${v}" ${S.ngay === v ? 'selected' : ''}>${t}</option>`).join('')}</select>
        </div>
        ${tong ? `<div class="tbl-wrap"><table>
          <thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Khách hàng</th><th class="num">SP</th><th class="num">Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>${slice.map((o) => `<tr>
            <td><a href="#/don-hang/${o.dong}"><b>${esc(o.ma)}</b></a>${o.qua ? '<br><small class="muted">🎁 có quà</small>' : ''}</td>
            <td data-nhan="Thời gian">${esc(o.ngay)}<br><small class="muted">${esc(o.loai)}</small></td>
            <td data-nhan="Khách hàng"><b>${esc(o.khach || '—')}</b><br><small class="muted">${esc(o.sdt)}</small></td>
            <td class="num" data-nhan="Số SP">${o.soMon}</td>
            <td class="num"><b>${fmt(o.tong)}</b>${o.giamHang ? `<br><small class="muted">hạng ${esc(o.hang)}</small>` : ''}</td>
            <td data-nhan="Thanh toán">${esc(o.thanhToan)}</td>
            <td>${A.badge(o.trangThai, MAU[o.trangThai] || '')}</td>
            <td class="num"><a class="btn btn--ghost btn--sm" href="#/don-hang/${o.dong}">Chi tiết</a></td>
          </tr>`).join('')}</tbody></table></div>
          ${A.phanTrang(tong, S.trang, S.moiTrang, 'dh-pg')}`
          : A.trong('Không có đơn nào', 'Thử bỏ bớt bộ lọc hoặc chọn khoảng thời gian rộng hơn.', '🧾')}
      </div>`;
  }

  /* ---------------- Chi tiết đơn ---------------- */
  /* Dòng trạng thái lấy từ CRM (Apps Script tự đồng bộ khi mở chi tiết đơn) */
  const crmDong = (o) => {
    const c = o.crm; if (!c) return '<p class="muted mt-8">🔗 CRM: chưa kết nối (thiếu CRM_KEY) hoặc CRM chưa phản hồi.</p>';
    if (!c.coDon) return '<p class="muted mt-8">🔗 CRM: chưa thấy đơn này trong CRM (đơn mới có thể mất vài phút để CRM ghi nhận).</p>';
    return `<div class="box-note mt-8">🔗 Trạng thái trên CRM: <b>${esc(c.trangThai || '—')}</b>${c.ma ? ` · mã CRM ${esc(c.ma)}` : ''}${c.quyDoi ? ` → ${esc(c.quyDoi)}` : ' (chưa quy đổi được – cập nhật tay nếu cần)'}${o.crmVuaCapNhat ? ' · <b>vừa tự cập nhật trạng thái đơn</b>' : ''}</div>`;
  };
  async function veChiTiet(el, dong) {
    el.innerHTML = A.dangTai('chi tiết đơn');
    try {
      const d = await A.api('donChiTiet', { key: A.adminKey(), dong });
      if (!d || !d.ok) { el.innerHTML = d && d.msg ? A.loiTai(d.msg) : chuaCo(); return; }
      const o = d.don;
      const buoc = LUONG.indexOf(o.trangThai);
      const huy = /huỷ|hoàn/i.test(o.trangThai);
      const suaDuoc = A.co('order.update') && !/^Đã (huỷ|hoàn hàng)$/.test(o.trangThai);
      $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#/don-hang">← Danh sách</a>
        ${suaDuoc ? `<a class="btn btn--primary" href="#/don-hang/${o.dong}/sua" title="Sửa khi khách đổi ý, đổi sản phẩm, đổi địa chỉ…">✏️ Sửa đơn</a>` : ''}
        <button class="btn btn--ghost" id="dhIn">🖨 In đơn</button>`;
      el.innerHTML = `
        <div class="card">
          <div class="dh__top"><div><h3>Đơn ${esc(o.ma)}</h3><p class="muted">${esc(o.ngay)} · ${esc(o.loai)}</p></div>
            <span class="grow"></span>${A.badge(o.trangThai, MAU[o.trangThai] || '')}</div>

          ${huy ? `<div class="box-note box-note--red">Đơn đã ${esc(o.trangThai.toLowerCase())} – không tính vào doanh thu và hạng khách.</div>`
            : `<ol class="tline">${LUONG.map((t, i) => `<li class="${i <= buoc ? 'is-done' : ''} ${i === buoc ? 'is-now' : ''}"><i>${i <= buoc ? '✓' : i + 1}</i><span>${esc(t)}</span></li>`).join('')}</ol>`}

          ${crmDong(o)}
          ${o.tiep.length ? `<div class="dh__act"><span class="muted">Chuyển trạng thái:</span>
            ${o.tiep.map((t) => `<button class="btn ${/huỷ|hoàn/i.test(t) ? 'btn--red' : 'btn--primary'} btn--sm" data-tt="${esc(t)}" data-dong="${o.dong}">${esc(t)}</button>`).join('')}</div>`
            : '<p class="muted mt-8">Đơn đã ở trạng thái cuối, không chuyển tiếp được.</p>'}
        </div>

        <div class="grid-2">
          <div class="card"><h3>👤 Khách hàng</h3>
            <div class="kh-row"><span>Họ tên</span><b>${esc(o.khach || '—')}</b></div>
            <div class="kh-row"><span>Điện thoại</span><b><a href="tel:${esc(o.sdt)}">${esc(o.sdt)}</a></b></div>
            <div class="kh-row"><span>Email</span><b>${esc(o.email || '—')}</b></div>
            <div class="kh-row"><span>Địa chỉ giao</span><b>${esc(o.diaChi || '—')}</b></div>
            <div class="kh-row"><span>Hạng khi đặt</span><b>${esc(o.hang || '—')}</b></div>
            <div class="kh-row"><span>Đã mua tại shop</span><b>${d.khach.soDon} đơn · ${fmt(d.khach.tongChiTieu)}</b></div>
            <a class="btn btn--ghost btn--block mt-12" href="#/thanh-vien/${esc(o.sdt)}">Xem hồ sơ khách →</a></div>

          <div class="card"><h3>💰 Thanh toán</h3>
            <div class="kh-row"><span>Hình thức</span><b>${esc(o.thanhToan || '—')}</b></div>
            <div class="kh-row"><span>Tiền hàng</span><b>${fmt(o.tamTinh)}</b></div>
            ${o.giam ? `<div class="kh-row"><span>Giảm giá${o.ma_gg ? ' (' + esc(o.ma_gg) + ')' : ''}</span><b class="text-teal">−${fmt(o.giam)}</b></div>` : ''}
            ${o.giamHang ? `<div class="kh-row"><span>Ưu đãi hạng ${esc(o.hang)}</span><b class="text-teal">−${fmt(o.giamHang)}</b></div>` : ''}
            <div class="kh-row"><span>Phí vận chuyển</span><b>${o.ship ? fmt(o.ship) : 'Miễn phí'}</b></div>
            <div class="kh-row"><span>Tổng cộng</span><b style="color:var(--pink);font-size:17px">${fmt(o.tong)}</b></div></div>
        </div>

        <div class="card"><h3>📦 Sản phẩm</h3>
          <ul class="dh__sp">${o.sanPham.map((x) => `<li>${esc(x)}</li>`).join('') || '<li class="muted">—</li>'}</ul>
          ${o.qua ? `<div class="box-note">🎁 <b>Quà tặng kèm:</b> ${esc(o.qua)}</div>` : ''}
          ${o.ghiChu ? `<div class="box-note">📝 <b>Ghi chú của khách:</b> ${esc(o.ghiChu)}</div>` : ''}</div>`;
    } catch (e) { el.innerHTML = A.loiTai(e.message); }
  }

  /* ---------------- Sửa đơn (khách đổi ý, đổi sản phẩm, đổi địa chỉ…) ----------------
     Sản phẩm trong đơn lưu dạng chữ "Tên – phân loại × SL"; đơn giá tự lấy theo sản phẩm hiện tại trên web. */
  let E = null;
  const SP = () => (window.PRODUCTS || []).filter((p) => !p.an);
  const tenSP = (p) => p.short || p.name;
  const timSP = (ten) => { const t = khongDau(ten).trim(); return t ? (window.PRODUCTS || []).find((p) => khongDau(tenSP(p)) === t || khongDau(p.name) === t) : null; };
  const giaSP = (p, bien) => { if (!p) return 0; const v = (p.variants || []).find((x) => x.label === bien); return Number(v ? v.price : p.price) || 0; };
  function tachDong(s) {
    const m = String(s).match(/^(.*?)\s*×\s*(\d+)\s*$/);
    let ten = m ? m[1] : String(s), bien = '';
    const sl = m ? Number(m[2]) : 1;
    const i = ten.lastIndexOf(' – ');
    if (i > 0) { bien = ten.slice(i + 3).trim(); ten = ten.slice(0, i).trim(); }
    const p = timSP(ten);
    return { ten, bien, sl, gia: giaSP(p, bien) };
  }
  const chuDong = (r) => `${r.ten.trim()}${r.bien.trim() ? ' – ' + r.bien.trim() : ''} × ${Math.max(1, Number(r.sl) || 1)}`;
  const tongDong = () => E.rows.reduce((s, r) => s + (Number(r.sl) || 0) * (Number(r.gia) || 0), 0);

  async function veSua(el, dong) {
    el.innerHTML = A.dangTai('đơn hàng');
    try {
      const d = await A.api('donChiTiet', { key: A.adminKey(), dong });
      if (!d || !d.ok) { el.innerHTML = d && d.msg ? A.loiTai(d.msg) : chuaCo(); return; }
      const o = d.don;
      $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#/don-hang/${o.dong}">← Quay lại đơn</a>`;
      if (!A.co('order.update')) { el.innerHTML = A.loiTai('Tài khoản của bạn không có quyền sửa đơn'); return; }
      if (/^Đã (huỷ|hoàn hàng)$/.test(o.trangThai)) { el.innerHTML = `<div class="card err-box"><h3>Đơn ${esc(o.trangThai.toLowerCase())}</h3><p>Đơn đã huỷ / hoàn hàng thì không sửa được.</p></div>`; return; }
      E = { dong: o.dong, ma: o.ma, trangThai: o.trangThai, rows: o.sanPham.map(tachDong), khach: o.khach, sdt: o.sdt, diaChi: o.diaChi, email: o.email,
        thanhToan: o.thanhToan, qua: o.qua, ghiChu: o.ghiChu, tamTinh: o.tamTinh, giam: o.giam, giamHang: o.giamHang, ship: o.ship, tong: o.tong, lyDo: '' };
      if (!E.rows.length) E.rows.push({ ten: '', bien: '', sl: 1, gia: 0 });
      const so = (id, nhan, v, goiY = '') => `<label>${nhan}<input id="${id}" type="number" min="0" step="1000" inputmode="numeric" value="${Number(v) || 0}">${goiY ? `<span class="hint">${goiY}</span>` : ''}</label>`;
      el.innerHTML = `
        <div id="dhSua">
        <div class="card"><div class="dh__top"><div><h3>✏️ Sửa đơn ${esc(o.ma)}</h3><p class="muted">${esc(o.ngay)} · ${esc(o.loai)}</p></div>
          <span class="grow"></span>${A.badge(o.trangThai, MAU[o.trangThai] || '')}</div>
          ${/Đang giao|Đã giao|hoàn/.test(o.trangThai) ? `<div class="box-note">⚠️ Đơn đang ở bước <b>${esc(o.trangThai)}</b> – nhớ báo bên giao hàng nếu đổi sản phẩm / địa chỉ / tiền thu.</div>` : ''}
          <div class="box-note">💡 Sửa xong bấm <b>Lưu thay đổi</b>. Tổng chi tiêu và hạng của khách tự tính lại; mọi thay đổi được ghi vào Nhật ký. Nếu đơn đã lên CRM thì sửa cả bên CRM.</div></div>

        <div class="card"><h3>📦 Sản phẩm</h3>
          <datalist id="dhSpDs">${SP().map((p) => `<option value="${esc(tenSP(p))}"></option>`).join('')}</datalist>
          <div id="dhSuaSP"></div>
          <div class="dh__act" style="margin-top:6px;padding-top:10px"><button class="btn btn--ghost btn--sm" data-sua="them">＋ Thêm sản phẩm</button>
            <span class="grow"></span><span class="muted">Cộng theo đơn giá: <b id="dhTongDong"></b></span></div></div>

        <div class="grid-2">
          <div class="card"><h3>👤 Khách hàng & giao hàng</h3>
            <label>Họ tên<input id="sKhach" value="${esc(E.khach)}" maxlength="80"></label>
            <label>Điện thoại <i>*</i><input id="sSdt" value="${esc(E.sdt)}" inputmode="tel" maxlength="12"></label>
            <label>Địa chỉ giao<textarea id="sDiaChi" rows="2" maxlength="300">${esc(E.diaChi)}</textarea></label>
            <label>Email<input id="sEmail" value="${esc(E.email)}" maxlength="120"></label>
            <label>Ghi chú của khách<textarea id="sGhiChu" rows="2" maxlength="500">${esc(E.ghiChu)}</textarea></label></div>

          <div class="card"><h3>💰 Thanh toán</h3>
            <label>Hình thức<select id="sTT">${['COD', 'Chuyển khoản'].concat(['COD', 'Chuyển khoản'].includes(E.thanhToan) || !E.thanhToan ? [] : [E.thanhToan]).map((t) => `<option ${t === E.thanhToan ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
            <div class="row row-2">${so('sTamTinh', 'Tiền hàng', E.tamTinh, 'tự cộng lại khi đổi sản phẩm')}${so('sShip', 'Phí vận chuyển', E.ship)}</div>
            <div class="row row-2">${so('sGiam', `Giảm giá${o.ma_gg ? ' (' + esc(o.ma_gg) + ')' : ''}`, E.giam)}${so('sGiamHang', `Ưu đãi hạng${o.hang ? ' ' + esc(o.hang) : ''}`, E.giamHang)}</div>
            <label>Tổng cộng (tiền thu khách)<input id="sTong" type="number" min="0" step="1000" inputmode="numeric" value="${Number(E.tong) || 0}" style="font-weight:700;color:var(--pink);font-size:16px">
              <span class="hint">= Tiền hàng − giảm giá − ưu đãi hạng + phí ship (tự tính, sửa tay được)</span></label>
            <label>Quà tặng kèm<input id="sQua" value="${esc(E.qua)}" maxlength="300"></label></div>
        </div>

        <div class="card"><label>Lý do sửa <span class="muted">(ghi vào nhật ký)</span><input id="sLyDo" maxlength="200" placeholder="VD: khách đổi sang vị dâu, thêm 1 hộp…"></label>
          <div class="dh__act" style="border:0;margin-top:0;padding-top:0"><span class="grow"></span>
            <a class="btn btn--ghost" href="#/don-hang/${o.dong}">Huỷ</a><button class="btn btn--primary" data-sua="luu">💾 Lưu thay đổi</button></div></div>
        </div>`;
      veDongSP();
    } catch (e) { el.innerHTML = A.loiTai(e.message); }
  }

  function veDongSP() {
    const box = $('#dhSuaSP'); if (!box) return;
    box.innerHTML = E.rows.map((r, i) => {
      const p = timSP(r.ten), vs = (p && p.variants) || [];
      const bien = vs.length && (!r.bien || vs.some((v) => v.label === r.bien))
        ? `<select data-r="${i}" data-f="bien">${r.bien ? '' : '<option value="">— chọn —</option>'}${vs.map((v) => `<option ${v.label === r.bien ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}</select>`
        : `<input data-r="${i}" data-f="bien" value="${esc(r.bien)}" placeholder="(không có)">`;
      return `<div class="vrow dh-sp">
        <label>Sản phẩm<input data-r="${i}" data-f="ten" list="dhSpDs" value="${esc(r.ten)}" placeholder="Gõ để tìm sản phẩm…">${r.ten && !p ? '<span class="hint">⚠ không khớp sản phẩm trên web – nhập đơn giá tay</span>' : ''}</label>
        <label>Phân loại${bien}</label>
        <label>SL<input data-r="${i}" data-f="sl" type="number" min="1" value="${Number(r.sl) || 1}"></label>
        <label>Đơn giá<input data-r="${i}" data-f="gia" type="number" min="0" step="1000" value="${Number(r.gia) || 0}"><span class="hint" data-tien="${i}">= ${fmt((Number(r.sl) || 0) * (Number(r.gia) || 0))}</span></label>
        <button class="icobtn" data-sua="xoa" data-i="${i}" title="Bỏ sản phẩm này" ${E.rows.length < 2 ? 'disabled' : ''}>✕</button></div>`;
    }).join('');
    $('#dhTongDong').textContent = fmt(tongDong());
  }
  /* Đổi sản phẩm → cộng lại tiền hàng (nếu đủ đơn giá); đổi tiền → tính lại tổng */
  function tinhLai(theoSP) {
    const v = (id) => Math.max(0, Number(($('#' + id) || {}).value) || 0);
    if (theoSP) {
      $('#dhTongDong').textContent = fmt(tongDong());
      E.rows.forEach((r, i) => { const h = $(`[data-tien="${i}"]`); if (h) h.textContent = '= ' + fmt((Number(r.sl) || 0) * (Number(r.gia) || 0)); });
      if (E.rows.every((r) => !r.ten.trim() || Number(r.gia) > 0)) $('#sTamTinh').value = tongDong();
    }
    $('#sTong').value = Math.max(0, v('sTamTinh') - v('sGiam') - v('sGiamHang') + v('sShip'));
  }
  async function luuSua(nut) {
    const val = (id) => ($('#' + id) || {}).value || '';
    const rows = E.rows.filter((r) => r.ten.trim());
    if (!rows.length) return A.toast('Đơn phải có ít nhất 1 sản phẩm', 'err');
    const don = { sanPham: rows.map(chuDong), khach: val('sKhach').trim(), sdt: val('sSdt').trim(), diaChi: val('sDiaChi').trim(), email: val('sEmail').trim(),
      ghiChu: val('sGhiChu').trim(), thanhToan: val('sTT'), qua: val('sQua').trim(), lyDo: val('sLyDo').trim(),
      tamTinh: Number(val('sTamTinh')) || 0, giam: Number(val('sGiam')) || 0, giamHang: Number(val('sGiamHang')) || 0, ship: Number(val('sShip')) || 0, tong: Number(val('sTong')) || 0 };
    if (!/^0(3|5|7|8|9)\d{8}$/.test(don.sdt.replace(/\D/g, '').replace(/^84/, '0'))) return A.toast('Số điện thoại chưa đúng', 'err');
    const ok = await A.hoi({ tieuDe: `Lưu đơn ${E.ma}?`, noiDung: `<span style="display:block;text-align:left">${don.sanPham.map((x) => '• ' + esc(x)).join('<br>')}<br><b>Tổng: ${fmt(don.tong)}</b>${don.tong !== E.tong ? ` <span class="muted">(trước: ${fmt(E.tong)})</span>` : ''}</span>`, nutOk: 'Lưu' });
    if (!ok) return;
    nut.disabled = true; nut.textContent = 'Đang lưu…';
    try {
      const r = await A.api('suaDon', { key: A.adminKey(), dong: E.dong, ma: E.ma, don: JSON.stringify(don) });
      if (!r || !r.ok) { A.toast((r && r.msg) || 'Không lưu được', 'err'); nut.disabled = false; nut.textContent = '💾 Lưu thay đổi'; return; }
      A.toast(r.doi ? `Đã lưu đơn ${E.ma} (${r.doi} thay đổi)` : 'Không có gì thay đổi', 'ok');
      location.hash = '#/don-hang/' + E.dong;
    } catch (err) { A.toast(err.message, 'err'); nut.disabled = false; nut.textContent = '💾 Lưu thay đổi'; }
  }
  document.addEventListener('input', (e) => {
    if (!E || !e.target.closest('#dhSua')) return;
    const f = e.target.dataset.f, i = Number(e.target.dataset.r);
    if (f && E.rows[i]) {
      const r = E.rows[i];
      if (f === 'ten') {
        r.ten = e.target.value; const p = timSP(r.ten);
        if (p) { const vs = p.variants || []; if (vs.length && !vs.some((v) => v.label === r.bien)) r.bien = (vs.find((v) => !v.oos) || vs[0]).label; if (!vs.length) r.bien = ''; r.gia = giaSP(p, r.bien); veDongSP(); const o = $(`[data-r="${i}"][data-f="sl"]`); o && o.focus(); }
      } else if (f === 'bien') { r.bien = e.target.value; const p = timSP(r.ten); if (p && (p.variants || []).length) { r.gia = giaSP(p, r.bien); const g = $(`[data-r="${i}"][data-f="gia"]`); if (g) g.value = r.gia; } }
      else r[f] = Number(e.target.value) || 0;
      return tinhLai(true);
    }
    if (['sTamTinh', 'sGiam', 'sGiamHang', 'sShip'].includes(e.target.id)) tinhLai(false);
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('#dhSua [data-sua]'); if (!b || !E) return;
    if (b.dataset.sua === 'them') { E.rows.push({ ten: '', bien: '', sl: 1, gia: 0 }); veDongSP(); const o = $(`[data-r="${E.rows.length - 1}"][data-f="ten"]`); o && o.focus(); return; }
    if (b.dataset.sua === 'xoa') { E.rows.splice(Number(b.dataset.i), 1); veDongSP(); return tinhLai(true); }
    if (b.dataset.sua === 'luu') return luuSua(b);
  });

  /* ---------------- Sự kiện ---------------- */
  const timTre = A.tre(() => { S.trang = 1; A.veTrang(); }, 420);
  document.addEventListener('input', (e) => { if (e.target.id === 'dhQ') { S.q = e.target.value; timTre(); } });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'dhTT') { S.tt = e.target.value; S.trang = 1; return A.veTrang(); }
    if (e.target.id === 'dhNgay') { S.ngay = e.target.value; khoang(); S.trang = 1; return A.veTrang(); }
  });
  document.addEventListener('click', async (e) => {
    const pg = e.target.closest('[data-dh-pg]'); if (pg) { S.trang = Number(pg.dataset.dhPg); return A.veTrang(); }
    if (e.target.id === 'dhIn') { window.print(); return; }
    if (e.target.id === 'dhXuat') return xuat();
    if (e.target.id === 'dhCRM') {
      const b = e.target; b.disabled = true; b.textContent = 'Đang đồng bộ…';
      try {
        const r = await A.api('dongBoCRM', {}, 120000);
        if (!r || !r.ok) A.toast((r && r.msg) || 'Không đồng bộ được', 'err');
        else if (r.msg) A.toast(r.msg, 'err');
        else { A.toast(r.doi ? `Đã cập nhật ${r.doi} đơn từ CRM` : `Đã kiểm tra ${r.kiemTra} đơn – không có thay đổi`, 'ok'); if (r.doi) { A.veTrang(); return; } }
      } catch (err) { A.toast(err.message, 'err'); }
      b.disabled = false; b.textContent = '🔄 Đồng bộ CRM'; return;
    }
    const tt = e.target.closest('[data-tt]');
    if (tt) {
      const moi = tt.dataset.tt, dong = tt.dataset.dong;
      const ok = await A.hoi({ tieuDe: 'Đổi trạng thái đơn?', noiDung: `Chuyển sang <b>${esc(moi)}</b>?${/huỷ|hoàn/i.test(moi) ? '<br><span class="muted">Đơn huỷ/hoàn sẽ bị trừ khỏi doanh thu và tổng chi tiêu của khách.</span>' : ''}`, nutOk: 'Đổi', nguyHiem: /huỷ|hoàn/i.test(moi) });
      if (!ok) return;
      tt.disabled = true; tt.textContent = 'Đang lưu…';
      try {
        const r = await A.api('doiTrangThai', { key: A.adminKey(), dong, trangThai: moi });
        if (!r || !r.ok) { A.toast((r && r.msg) || 'Không đổi được', 'err'); A.veTrang(); return; }
        A.toast('Đã chuyển sang “' + moi + '”', 'ok'); A.veTrang();
      } catch (err) { A.toast(err.message, 'err'); A.veTrang(); }
    }
  });

  function xuat() {
    if (!data) return;
    const cot = ['Mã đơn', 'Thời gian', 'Khách', 'Điện thoại', 'Địa chỉ', 'Sản phẩm', 'Tổng tiền', 'Thanh toán', 'Quà', 'Trạng thái'];
    const dong = data.ds.map((o) => [o.ma, o.ngay, o.khach, o.sdt, o.diaChi, o.sanPham.replace(/\n/g, ' | '), o.tong, o.thanhToan, o.qua, o.trangThai]);
    const csv = '﻿' + [cot, ...dong].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `don-hang-${ngayISO(new Date())}.csv`; a.click();
    A.toast('Đã xuất file Excel (CSV)', 'ok');
  }

  A.dangKy({ route: '/don-hang', ten: 'Đơn hàng', icon: '🧾', nhom: 'ban-hang', quyen: 'order.view',
    mo: 'Đơn khách đặt trên website',
    ve(el, { sub }) { const [dong, viec] = String(sub || '').split('/'); return !dong ? veDS(el) : viec === 'sua' ? veSua(el, dong) : veChiTiet(el, dong); } });
})();
