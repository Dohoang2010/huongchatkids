/* ===== ĐỐI TÁC (AFFILIATE) – duyệt đối tác, đơn theo nguồn (bằng chứng lượt bấm), gán tay, kỳ thanh toán + thuế TNCN, cấu hình =====
   Máy chủ: Apps Script qtAff* (tools/apps-script.gs, phần ĐỐI TÁC). Trang này chỉ hiển thị / gửi lệnh, máy chủ kiểm tra quyền và số liệu. */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt, ngayISO } = A;
  const TAB = [['', '🤝 Đối tác', 'affiliate.view'], ['don', '🧾 Đơn & nguồn', 'affiliate.view'], ['thanh-toan', '💳 Thanh toán', 'affiliate.view'], ['cau-hinh', '⚙️ Cấu hình', 'affiliate.view']];
  const TT_DT = { 'Chờ duyệt': '', 'Đã duyệt': 'tag--ok', 'Từ chối': 'tag--no', 'Đã khoá': 'tag--no' };
  const TT_DON = { 'Chờ giao': '', 'Đã giao': 'tag--ok', 'Đã huỷ': 'tag--no', 'Hoàn hàng': 'tag--no', 'Không tính': 'tag--no' };
  const LOAI = { 'ca-nhan': 'Cá nhân – khấu trừ TNCN', 'cam-ket-08': 'Cam kết 08/CK-TNCN', 'doanh-nghiep': 'DN / HKD xuất hoá đơn' };
  const S = { tt: '', q: '', dt: '', nguon: '', ttDon: '', trang: 1 };
  let duLieu = { ds: null, don: null, ky: null }; let lyDoTam = '';
  const n0 = (x) => Number(x || 0).toLocaleString('vi-VN');

  const khung = (el, tab) => { el.innerHTML = `<div class="tabs2">${TAB.filter((t) => A.co(t[2])).map(([k, t]) => `<a class="tab2 ${k === tab ? 'is-on' : ''}" href="#/doi-tac${k ? '/' + k : ''}">${t}</a>`).join('')}</div><div id="dtBody">${A.dangTai('dữ liệu đối tác')}</div>`; return $('#dtBody'); };
  const csv = (ten, cot, dong) => {
    const s = '﻿' + [cot, ...dong].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv;charset=utf-8' })); a.download = `${ten}-${ngayISO(new Date())}.csv`; a.click(); A.toast('Đã xuất file Excel (CSV)', 'ok');
  };

  /* ---------------- Đối tác ---------------- */
  async function veDs(el) {
    const b = khung(el, '');
    try { const d = await A.api('qtAffDs', {}); if (!d || !d.ok) { b.innerHTML = A.loiTai((d && d.msg) || 'Apps Script chưa có phần Đối tác'); return; } duLieu.ds = d; veBangDs(b, d); }
    catch (e) { b.innerHTML = A.loiTai(e.message); }
  }
  function veBangDs(b, d) {
    const ds = d.ds.filter((x) => (!S.tt || x.tt === S.tt) && (!S.q || [x.ma, x.ten, x.sdt, x.email].join(' ').toLowerCase().includes(S.q.toLowerCase())));
    const tong = (k) => d.ds.reduce((s, x) => s + (x.tk[k] || 0), 0); const cho = d.ds.filter((x) => x.tt === 'Chờ duyệt').length;
    $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="doi-tac.html" target="_blank">↗ Trang đối tác</a>${A.co('affiliate.update') ? '<button class="btn btn--ghost" id="affXuLy">⟳ Xử lý ngay theo CRM</button>' : ''}<button class="btn btn--ghost" id="affXuatDs">⭳ Xuất Excel</button>`;
    b.innerHTML = `<div class="kpis">
        ${A.the('Đối tác', n0(d.ds.length), cho ? `⏳ ${cho} chờ duyệt` : 'không có đơn chờ duyệt')}
        ${A.the('Lượt bấm link', n0(tong('bam')), '')}
        ${A.the('Đơn qua đối tác', n0(tong('don')), tong('bam') ? `chuyển đổi ${(tong('don') / tong('bam') * 100).toFixed(1)}%` : '', 'kpi--teal')}
        ${A.the('Doanh thu qua đối tác', fmt(tong('doanhThu')), 'tiền hàng khách trả')}
        ${A.the('Hoa hồng phát sinh', fmt(tong('hh')), 'chờ giao + đã giao', 'kpi--pink')}
      </div>
      <div class="card"><div class="tool" style="grid-template-columns:1fr 220px"><div class="tool__tim"><input id="affQ" placeholder="Tìm mã, tên, SĐT, email…" value="${esc(S.q)}" autocomplete="off"></div>
        <select id="affTT"><option value="">Mọi trạng thái</option>${Object.keys(TT_DT).map((t) => `<option ${S.tt === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
      ${ds.length ? `<div class="tbl-wrap"><table><thead><tr><th>Đối tác</th><th>Kênh bán</th><th>Nhận tiền / thuế</th><th class="num">Bấm</th><th class="num">Đơn</th><th class="num">Doanh thu</th><th class="num">Hoa hồng</th><th>Trạng thái</th><th></th></tr></thead><tbody>
        ${ds.map((x) => `<tr><td><b>${esc(x.ma)}</b> · ${esc(x.ten)}<br><small class="muted">${esc(x.sdt)} · ${esc(x.email)}<br>Đăng ký ${esc(x.dangKy)}</small></td>
          <td data-nhan="Kênh"><small>${esc(x.kenh || '—').replace(/(https?:\/\/[^\s,]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')}</small></td>
          <td data-nhan="Nhận tiền"><small>${esc(x.nganHang)} ${esc(x.stk)}<br>${esc(x.chuTk)}<br>CCCD/MST ${esc(x.cccd)}</small><br>${A.co('affiliate.update') ? `<select data-loai="${esc(x.ma)}">${Object.entries(LOAI).map(([k, t]) => `<option value="${k}" ${x.loaiThue === k ? 'selected' : ''}>${t}</option>`).join('')}</select>` : esc(LOAI[x.loaiThue] || '')}</td>
          <td class="num">${n0(x.tk.bam)}</td><td class="num">${n0(x.tk.don)}</td><td class="num">${fmt(x.tk.doanhThu)}</td><td class="num"><b>${fmt(x.tk.hh)}</b></td>
          <td>${A.badge(x.tt, TT_DT[x.tt] || '')}${x.ghiChu ? `<br><small class="muted">${esc(x.ghiChu)}</small>` : ''}</td>
          <td class="num">${A.co('affiliate.update') ? (x.tt === 'Chờ duyệt' ? `<button class="btn btn--primary btn--sm" data-duyet="${esc(x.ma)}">Duyệt</button> <button class="btn btn--ghost btn--sm" data-tuchoi="${esc(x.ma)}">Từ chối</button>`
            : x.tt === 'Đã duyệt' ? `<button class="btn btn--ghost btn--sm" data-khoa="${esc(x.ma)}">Khoá</button>` : x.tt === 'Đã khoá' ? `<button class="btn btn--ghost btn--sm" data-mokhoa="${esc(x.ma)}">Mở khoá</button>` : '') : ''}</td></tr>`).join('')}
      </tbody></table></div>` : A.trong('Chưa có đối tác', 'Chia sẻ trang huongchatkids.vn/doi-tac.html để mời đối tác đăng ký.', '🤝')}</div>`;
  }

  /* ---------------- Đơn & nguồn ---------------- */
  async function veDon(el) {
    const b = khung(el, 'don');
    try {
      const [d, dsDt] = await Promise.all([A.api('qtAffDon', {}), duLieu.ds ? Promise.resolve(duLieu.ds) : A.api('qtAffDs', {})]);
      if (!d || !d.ok) { b.innerHTML = A.loiTai((d && d.msg) || 'Chưa tải được'); return; } duLieu.don = d; if (dsDt && dsDt.ok) duLieu.ds = dsDt; veBangDon(b);
    } catch (e) { b.innerHTML = A.loiTai(e.message); }
  }
  function veBangDon(b) {
    const d = duLieu.don; const dts = ((duLieu.ds || {}).ds || []).filter((x) => x.tt === 'Đã duyệt');
    const ds = d.ds.filter((x) => (!S.dt || x.dt === S.dt) && (!S.nguon || x.nguon === S.nguon) && (!S.ttDon || x.tt === S.ttDon));
    S.trang = Math.min(S.trang, Math.max(1, Math.ceil(ds.length / 30))); const trang = ds.slice((S.trang - 1) * 30, S.trang * 30);
    const nguon = [...new Set(d.ds.map((x) => x.nguon))];
    $('#pageAct').innerHTML = '<button class="btn btn--ghost" id="affXuatDon">⭳ Xuất Excel</button>';
    b.innerHTML = `${A.co('affiliate.update') ? `<div class="card"><h3>✋ Gán tay đơn Zalo / gọi điện cho đối tác</h3>
        <div class="grid-2" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));align-items:end">
          <label>Mã đơn <i>*</i><input id="gtMa" placeholder="VD: mã đơn CRM"></label><label>SĐT khách <i>*</i><input id="gtSdt" inputmode="numeric"></label>
          <label>Đối tác <i>*</i><select id="gtDt"><option value="">Chọn…</option>${dts.map((x) => `<option value="${esc(x.ma)}">${esc(x.ma)} · ${esc(x.ten)}</option>`).join('')}</select></label>
          <label>Tiền hàng (sau giảm, không ship) <i>*</i><input id="gtTien" type="number" step="1000"></label>
          <label>Nguồn<select id="gtNguon"><option value="zalo">Zalo có mã đối tác</option><option value="ganTay">Gán tay khác</option></select></label>
          <label>Lý do <i>*</i><input id="gtLyDo" placeholder="VD: khách nhắn Zalo kèm mã MEBI"></label></div>
        <button class="btn btn--primary" id="gtLuu">Gán đơn</button> <small class="muted">Hoa hồng tính theo mức của nguồn đã chọn, tự xử lý theo trạng thái CRM như đơn web. Ghi nhật ký người gán.</small></div>` : ''}
      <div class="card"><h3>🧾 Đơn gắn đối tác</h3>
        <div class="tool" style="grid-template-columns:repeat(3,200px)"><select id="donDt"><option value="">Mọi đối tác</option>${[...new Set(d.ds.map((x) => x.dt))].map((m) => `<option ${S.dt === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select>
          <select id="donNguon"><option value="">Mọi nguồn</option>${nguon.map((m) => `<option ${S.nguon === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select>
          <select id="donTT"><option value="">Mọi trạng thái</option>${Object.keys(TT_DON).map((m) => `<option ${S.ttDon === m ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
        ${ds.length ? `<div class="tbl-wrap"><table><thead><tr><th>Đơn</th><th>Đối tác</th><th>Nguồn & bằng chứng</th><th class="num">Tiền tính HH</th><th class="num">Hoa hồng</th><th>Trạng thái</th><th>Kỳ</th></tr></thead><tbody>
          ${trang.map((x) => `<tr><td><b>${esc(x.ma)}</b><br><small class="muted">${esc(x.ngay)} · ${esc(x.sdt)}</small>${x.sp ? `<br><small>${esc(x.sp)}</small>` : ''}</td><td><b>${esc(x.dt)}</b></td>
            <td data-nhan="Nguồn">${A.badge(x.nguon, /link/.test(x.nguon) ? 'tag--ok' : '')}<br><small class="muted">${x.bamLuc ? `Bấm ${esc(x.bamLuc)} → đặt sau ${x.cachPhut < 120 ? x.cachPhut + ' phút' : x.cachPhut < 2880 ? Math.round(x.cachPhut / 60) + ' giờ' : Math.round(x.cachPhut / 1440) + ' ngày'}` : 'Gán bởi ' + esc(x.nguoiGan)}${x.ghiChu ? ' · ' + esc(x.ghiChu) : ''}</small></td>
            <td class="num">${fmt(x.tien)}<br><small class="muted">× ${esc(x.pt)}%</small></td><td class="num"><b>${fmt(x.hh)}</b></td>
            <td>${A.badge(x.tt, TT_DON[x.tt] || '')}${x.giao ? `<br><small class="muted">giao ${esc(x.giao)}</small>` : ''}</td><td><small>${esc(x.ky || '—')}${x.tru ? '<br>trừ ở ' + esc(x.tru) : ''}</small></td></tr>`).join('')}
        </tbody></table></div>${A.phanTrang(ds.length, S.trang, 30, 'aff-pg')}` : A.trong('Chưa có đơn nào gắn đối tác', '', '🧾')}</div>`;
  }

  /* ---------------- Thanh toán ---------------- */
  async function veKy(el) {
    const b = khung(el, 'thanh-toan');
    try { const d = await A.api('qtAffKy', {}); if (!d || !d.ok) { b.innerHTML = A.loiTai((d && d.msg) || 'Chưa tải được'); return; } duLieu.ky = d; veBangKy(b, d); }
    catch (e) { b.innerHTML = A.loiTai(e.message); }
  }
  function veBangKy(b, d) {
    const cho = d.ds.filter((x) => x.tt === 'Chờ trả');
    $('#pageAct').innerHTML = `${A.co('affiliate.pay') ? '<button class="btn btn--primary" id="affChot">Chốt kỳ ngay</button>' : ''}<button class="btn btn--ghost" id="affXuatKy">⭳ Bảng kê thuế TNCN</button>`;
    b.innerHTML = `<div class="kpis">${A.the('Chờ chuyển khoản', fmt(cho.reduce((s, x) => s + x.nhan, 0)), `${cho.length} kỳ`, 'kpi--pink')}
        ${A.the('Đã trả', fmt(d.ds.filter((x) => x.tt === 'Đã trả').reduce((s, x) => s + x.nhan, 0)), '')}
        ${A.the('Thuế TNCN đã khấu trừ', fmt(d.ds.reduce((s, x) => s + x.thue, 0)), 'nộp cho cơ quan thuế', 'kpi--teal')}</div>
      <div class="card"><h3>💳 Kỳ thanh toán</h3><p class="muted">Hệ thống tự chốt kỳ từ ngày trả hằng tháng (mặc định ngày 10): gom đơn đã giao quá số ngày đổi trả, trừ khoản hoàn hàng của kỳ trước, tính thuế TNCN. Chuyển khoản xong nhập mã giao dịch rồi bấm "Đã trả" – đối tác nhận email.</p>
      ${d.ds.length ? `<div class="tbl-wrap"><table><thead><tr><th>Kỳ</th><th>Đối tác / nhận tiền</th><th class="num">Hoa hồng</th><th class="num">Điều chỉnh</th><th class="num">Thuế TNCN</th><th class="num">Thực nhận</th><th>Trạng thái</th></tr></thead><tbody>
        ${d.ds.map((x) => `<tr><td><b>${esc(x.ngay)}</b><br><small class="muted">${esc(x.ma)} · ${x.soDon} đơn</small></td>
          <td><b>${esc(x.dt)}</b> · ${esc(x.ten)}<br><small class="muted">${esc(x.nganHang)} ${esc(x.stk)} · ${esc(x.chuTk)}<br>${esc(LOAI[x.loaiThue] || '')} · CCCD/MST ${esc(x.cccd)}</small></td>
          <td class="num">${fmt(x.tong)}</td><td class="num">${x.dc ? fmt(x.dc) : '—'}</td><td class="num">${fmt(x.thue)}${x.ghiChu ? `<br><small class="muted">${esc(x.ghiChu)}</small>` : ''}</td><td class="num"><b>${fmt(x.nhan)}</b></td>
          <td>${x.tt === 'Đã trả' ? `${A.badge('Đã trả', 'tag--ok')}<br><small class="muted">${esc(x.traLuc)} · GD ${esc(x.gd)}<br>${esc(x.nguoiTra)}</small>`
            : A.co('affiliate.pay') ? `<input data-gd="${esc(x.ma)}" placeholder="Mã giao dịch CK" style="width:150px"> <button class="btn btn--primary btn--sm" data-tra="${esc(x.ma)}">Đã trả</button>` : A.badge('Chờ trả', '')}</td></tr>`).join('')}
      </tbody></table></div>` : A.trong('Chưa có kỳ thanh toán', 'Kỳ đầu tiên được chốt vào ngày trả khi có đơn đủ điều kiện.', '💳')}</div>
      <div class="card"><h3>⚖️ Thuế TNCN – việc shop cần làm</h3><ul class="huong-dan">
        <li>Khấu trừ <b>10%</b> trên khoản chi từ <b>2.000.000đ/lần</b> cho cá nhân không ký hợp đồng lao động (Thông tư 111/2013/TT-BTC, Điều 25) – hệ thống đã tự tính; tỉ lệ / ngưỡng chỉnh ở tab Cấu hình.</li>
        <li>Không khấu trừ khi đối tác nộp <b>bản cam kết 08/CK-TNCN</b> (đủ điều kiện về thu nhập) hoặc là <b>doanh nghiệp / hộ kinh doanh xuất hoá đơn</b> – chọn ở tab Đối tác.</li>
        <li>Cấp <b>chứng từ khấu trừ thuế TNCN</b> cho đối tác khi được yêu cầu (chứng từ điện tử theo Nghị định 123/2020/NĐ-CP, qua phần mềm hoá đơn / chứng từ điện tử của shop).</li>
        <li>Kê khai tờ khai <b>05/KK-TNCN</b> theo kỳ khai thuế và quyết toán <b>05/QTT-TNCN</b> cuối năm. Nút "Bảng kê thuế TNCN" xuất đủ cột họ tên, CCCD/MST, thu nhập, thuế đã khấu trừ.</li>
        <li><i>Quy định có thể thay đổi – kế toán của shop nên xác nhận lại mức khấu trừ và mẫu biểu đang áp dụng.</i></li></ul></div>`;
  }

  /* ---------------- Cấu hình ---------------- */
  async function veCauHinh(el) {
    const b = khung(el, 'cau-hinh'); $('#pageAct').innerHTML = '';
    try {
      const d = await A.api('qtAffCauHinh', {}); if (!d || !d.ok) { b.innerHTML = A.loiTai((d && d.msg) || 'Chưa tải được'); return; }
      const c = d.cauHinh, dis = A.co('affiliate.settings') ? '' : 'disabled';
      b.innerHTML = `<div class="card" style="max-width:760px"><h3>⚙️ Chương trình đối tác</h3>
        <label class="sw"><input type="checkbox" id="acBat" ${c.bat ? 'checked' : ''} ${dis}> <span>Bật chương trình<small class="hint">Tắt: không ghi nhận lượt bấm / đơn mới (đơn đã ghi nhận vẫn xử lý và trả bình thường).</small></span></label>
        <h4>Mức hoa hồng theo nguồn (% tiền hàng khách trả)</h4>
        <div class="grid-2">${[['link', 'Qua link (cùng máy)'], ['khacMay', 'Qua link – khác máy (nối SĐT)'], ['zalo', 'Zalo có mã đối tác (gán tay)'], ['ganTay', 'Gán tay khác']].map(([k, t]) => `<label>${t}<input id="ac_hh_${k}" type="number" min="0" max="50" step="0.5" value="${esc(c.hh[k])}" ${dis}></label>`).join('')}</div>
        <div class="grid-2"><label>Hạn tính sau lượt bấm gần nhất (ngày)<input id="ac_ngay" type="number" min="1" max="90" value="${esc(c.ngay)}" ${dis}></label>
          <label>Chờ hết đổi trả sau khi giao (ngày)<input id="ac_choDoiTraNgay" type="number" min="0" max="60" value="${esc(c.choDoiTraNgay)}" ${dis}></label>
          <label>Ngày chốt / trả hằng tháng<input id="ac_ngayTra" type="number" min="1" max="28" value="${esc(c.ngayTra)}" ${dis}></label></div>
        <h4>Thuế TNCN</h4>
        <div class="grid-2"><label>Tỉ lệ khấu trừ (%)<input id="ac_thueTyLe" type="number" min="0" max="50" step="0.5" value="${esc(c.thueTyLe)}" ${dis}></label>
          <label>Áp dụng khi khoản trả từ (đồng)<input id="ac_thueNguong" type="number" min="0" step="100000" value="${esc(c.thueNguong)}" ${dis}></label></div>
        <label>Lời giới thiệu trên trang đối tác<textarea id="ac_gioiThieu" rows="2" maxlength="500" ${dis}>${esc(c.gioiThieu)}</textarea></label>
        ${dis ? '<p class="muted">Bạn chỉ có quyền xem.</p>' : '<button class="btn btn--primary" id="acLuu">Lưu cấu hình</button>'}
        <p class="muted" style="margin-top:8px">Đơn đã ghi nhận giữ % lúc đặt; thay đổi chỉ áp dụng cho đơn mới. Mọi thay đổi ghi vào Nhật ký.</p></div>`;
    } catch (e) { b.innerHTML = A.loiTai(e.message); }
  }

  /* ---------------- Sự kiện ---------------- */
  const goi = async (lenh, p, ok) => { try { const r = await A.api(lenh, p, 90000); if (!r || !r.ok) { A.toast((r && r.msg) || 'Không thực hiện được', 'err'); return null; } if (ok) A.toast(ok, 'ok'); return r; } catch (e) { A.toast(e.message, 'err'); return null; } };
  const tim = A.tre(() => { if (duLieu.ds && $('#affQ')) { veBangDs($('#dtBody'), duLieu.ds); const i = $('#affQ'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 350);
  document.addEventListener('input', (e) => { if (e.target.id === 'affQ') { S.q = e.target.value; tim(); } if (e.target.id === 'affLyDo') lyDoTam = e.target.value; });
  document.addEventListener('change', async (e) => {
    if (e.target.id === 'affTT') { S.tt = e.target.value; veBangDs($('#dtBody'), duLieu.ds); }
    if (e.target.id === 'donDt') { S.dt = e.target.value; S.trang = 1; veBangDon($('#dtBody')); }
    if (e.target.id === 'donNguon') { S.nguon = e.target.value; S.trang = 1; veBangDon($('#dtBody')); }
    if (e.target.id === 'donTT') { S.ttDon = e.target.value; S.trang = 1; veBangDon($('#dtBody')); }
    const lo = e.target.closest('[data-loai]'); if (lo) { const x = duLieu.ds.ds.find((y) => y.ma === lo.dataset.loai);
      if (x) await goi('qtAffDuyet', { ma: lo.dataset.loai, viec: 'capNhat', loaiThue: lo.value }, 'Đã đổi hình thức thuế'); }
  });
  document.addEventListener('click', async (e) => {
    if (!location.hash.startsWith('#/doi-tac')) return;
    const pg = e.target.closest('[data-aff-pg]'); if (pg) { S.trang = Number(pg.dataset.affPg); return veBangDon($('#dtBody')); }
    for (const [attr, viec, td, nd, nguy] of [['duyet', 'duyet', 'Duyệt đối tác?', 'Đối tác nhận email kèm mã và đăng nhập được ngay.', false], ['khoa', 'khoa', 'Khoá đối tác?', 'Link của đối tác ngừng ghi nhận. Hoa hồng đã phát sinh vẫn được xử lý và trả.', true], ['mokhoa', 'moKhoa', 'Mở khoá đối tác?', 'Link ghi nhận trở lại.', false]]) {
      const bt = e.target.closest(`[data-${attr}]`); if (!bt) continue;
      if (!(await A.hoi({ tieuDe: td, noiDung: `<b>${esc(bt.dataset[attr])}</b> – ${nd}`, nutOk: 'Đồng ý', nguyHiem: nguy }))) return;
      if (await goi('qtAffDuyet', { ma: bt.dataset[attr], viec }, 'Đã cập nhật')) { duLieu.ds = null; A.veTrang(); } return;
    }
    const tc = e.target.closest('[data-tuchoi]'); if (tc) { lyDoTam = '';
      if (!(await A.hoi({ tieuDe: 'Từ chối đăng ký?', noiDung: `<b>${esc(tc.dataset.tuchoi)}</b> nhận email báo kết quả.<br><input id="affLyDo" placeholder="Lý do (gửi kèm email, không bắt buộc)" style="margin-top:10px">`, nutOk: 'Từ chối', nguyHiem: true }))) return;
      if (await goi('qtAffDuyet', { ma: tc.dataset.tuchoi, viec: 'tuChoi', ghiChu: lyDoTam }, 'Đã từ chối')) { duLieu.ds = null; A.veTrang(); } return; }
    if (e.target.id === 'affXuLy') { e.target.disabled = true; const r = await goi('qtAffXuLy', {}); if (r) A.toast(`Xong: ${r.giao || 0} giao, ${r.huy || 0} huỷ, ${r.hoan || 0} hoàn${r.ky ? ', chốt ' + r.ky + ' kỳ' : ''}`, 'ok'); duLieu.ds = null; return A.veTrang(); }
    if (e.target.id === 'affChot') { if (!(await A.hoi({ tieuDe: 'Chốt kỳ thanh toán ngay?', noiDung: 'Gom đơn đã giao quá số ngày đổi trả của mọi đối tác thành kỳ mới (bình thường hệ thống tự chốt vào ngày trả hằng tháng).', nutOk: 'Chốt kỳ' }))) return;
      const r = await goi('qtAffChotKy', {}); if (r) A.toast(r.soKy ? `Đã chốt ${r.soKy} kỳ` : 'Chưa có đơn nào đủ điều kiện', 'ok'); return A.veTrang(); }
    const tr = e.target.closest('[data-tra]'); if (tr) { const gd = ($(`[data-gd="${tr.dataset.tra}"]`) || {}).value || ''; if (gd.trim().length < 3) return A.toast('Nhập mã giao dịch chuyển khoản', 'err');
      const x = duLieu.ky.ds.find((y) => y.ma === tr.dataset.tra);
      if (!(await A.hoi({ tieuDe: 'Xác nhận đã chuyển khoản?', noiDung: `Kỳ <b>${esc(x.ma)}</b> – <b>${fmt(x.nhan)}</b> tới ${esc(x.nganHang)} ${esc(x.stk)} (${esc(x.chuTk)}).<br>Mã GD: ${esc(gd)}<br><small>Đối tác nhận email xác nhận.</small>`, nutOk: 'Đã trả' }))) return;
      if (await goi('qtAffTra', { maKy: tr.dataset.tra, gd }, 'Đã ghi nhận thanh toán')) A.veTrang(); return; }
    if (e.target.id === 'gtLuu') {
      const p = { maDon: $('#gtMa').value.trim(), sdt: $('#gtSdt').value.trim(), maDT: $('#gtDt').value, tien: $('#gtTien').value, nguon: $('#gtNguon').value, lyDo: $('#gtLyDo').value.trim() };
      if (!p.maDon || !p.sdt || !p.maDT || !p.tien || p.lyDo.length < 3) return A.toast('Nhập đủ mã đơn, SĐT, đối tác, tiền hàng và lý do', 'err');
      if (await goi('qtAffGanTay', p, 'Đã gán đơn cho ' + p.maDT)) A.veTrang(); return;
    }
    if (e.target.id === 'acLuu') {
      const v = (id) => ($('#' + id) || {}).value; const p = { luu: '1', bat: $('#acBat').checked ? '1' : '0', ngay: v('ac_ngay'), choDoiTraNgay: v('ac_choDoiTraNgay'), ngayTra: v('ac_ngayTra'), thueTyLe: v('ac_thueTyLe'), thueNguong: v('ac_thueNguong'), gioiThieu: v('ac_gioiThieu') };
      ['link', 'khacMay', 'zalo', 'ganTay'].forEach((k) => { p['hh_' + k] = v('ac_hh_' + k); });
      if (!(await A.hoi({ tieuDe: 'Lưu cấu hình đối tác?', noiDung: `Hoa hồng: link ${esc(p.hh_link)}% · khác máy ${esc(p.hh_khacMay)}% · Zalo ${esc(p.hh_zalo)}% · gán tay ${esc(p.hh_ganTay)}%<br>Hạn ${esc(p.ngay)} ngày · trả ngày ${esc(p.ngayTra)} · thuế ${esc(p.thueTyLe)}% từ ${fmt(Number(p.thueNguong))}`, nutOk: 'Lưu' }))) return;
      if (await goi('qtAffCauHinh', p, 'Đã lưu cấu hình')) A.veTrang(); return;
    }
    if (e.target.id === 'affXuatDs' && duLieu.ds) return csv('doi-tac', ['Mã', 'Họ tên', 'SĐT', 'Email', 'Kênh', 'Ngân hàng', 'Số TK', 'Chủ TK', 'CCCD/MST', 'Hình thức thuế', 'Trạng thái', 'Đăng ký', 'Lượt bấm', 'Đơn', 'Doanh thu', 'Hoa hồng'],
      duLieu.ds.ds.map((x) => [x.ma, x.ten, x.sdt, x.email, x.kenh, x.nganHang, x.stk, x.chuTk, x.cccd, LOAI[x.loaiThue] || x.loaiThue, x.tt, x.dangKy, x.tk.bam, x.tk.don, x.tk.doanhThu, x.tk.hh]));
    if (e.target.id === 'affXuatDon' && duLieu.don) return csv('don-doi-tac', ['Mã đơn', 'Thời gian', 'SĐT khách', 'Đối tác', 'Nguồn', 'Bấm lúc', 'Phút từ lúc bấm', 'Sản phẩm', 'Tiền tính HH', '% HH', 'Hoa hồng', 'Trạng thái', 'Giao lúc', 'Kỳ trả', 'Trừ ở kỳ', 'Người gán', 'Ghi chú'],
      duLieu.don.ds.map((x) => [x.ma, x.ngay, x.sdt, x.dt, x.nguon, x.bamLuc, x.cachPhut, x.sp, x.tien, x.pt, x.hh, x.tt, x.giao, x.ky, x.tru, x.nguoiGan, x.ghiChu]));
    if (e.target.id === 'affXuatKy' && duLieu.ky) return csv('bang-ke-thue-tncn-doi-tac', ['Kỳ', 'Ngày chốt', 'Mã đối tác', 'Họ tên', 'CCCD / MST', 'Hình thức', 'Thu nhập (hoa hồng)', 'Điều chỉnh', 'Thu nhập tính thuế', 'Thuế TNCN đã khấu trừ', 'Thực nhận', 'Ngân hàng', 'Số TK', 'Chủ TK', 'Trạng thái', 'Ngày trả', 'Mã GD'],
      duLieu.ky.ds.map((x) => [x.ma, x.ngay, x.dt, x.ten, x.cccd, LOAI[x.loaiThue] || x.loaiThue, x.tong, x.dc, x.tinhThue, x.thue, x.nhan, x.nganHang, x.stk, x.chuTk, x.tt, x.traLuc, x.gd]));
  });

  A.dangKy({ route: '/doi-tac', ten: 'Đối tác (affiliate)', icon: '🤝', nhom: 'ban-hang', quyen: 'affiliate.view', mo: 'Đối tác bán hàng, đơn theo nguồn, hoa hồng & thuế',
    ve(el, { sub }) { if (sub === 'don') return veDon(el); if (sub === 'thanh-toan') return veKy(el); if (sub === 'cau-hinh') return veCauHinh(el); return veDs(el); } });
})();
