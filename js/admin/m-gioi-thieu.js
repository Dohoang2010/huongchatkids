/* ===== GIỚI THIỆU & ĐIỂM – tổng quan, quan hệ giới thiệu, ví điểm, sổ giao dịch, cộng/trừ điểm, cấu hình =====
   Dữ liệu ở Apps Script (sheet "Giới thiệu", "Điểm - Giao dịch", "Điểm - Giữ chỗ"). Trang này chỉ đọc / gửi lệnh,
   mọi kiểm tra (quyền, số dư, chống trùng) do máy chủ làm. */
(() => {
  'use strict';
  const A = window.ADMIN, { $, esc, fmt, ngayISO } = A;
  const n0 = (x) => Number(x || 0).toLocaleString('vi-VN');
  const TAB = [['', '🤝 Tổng quan & giới thiệu', 'referral.view'], ['diem', '⭐ Ví điểm', 'points.view'], ['giao-dich', '🧾 Giao dịch điểm', 'points.view'], ['cau-hinh', '⚙️ Cấu hình', 'referral.view']];
  const LOAI = { EARN: ['Thưởng giới thiệu', 'tag--ok'], SPEND: ['Dùng điểm', ''], REVERSE: ['Thu hồi', 'tag--no'], REFUND: ['Hoàn điểm', 'tag--ok'], ADJUSTMENT: ['Điều chỉnh', ''], EXPIRE: ['Hết hạn', 'tag--no'] };
  const TT = { 'Đã liên kết': '', 'Chờ giao': '', 'Đã thưởng': 'tag--ok', 'Đã thu hồi': 'tag--no', 'Đang giữ': '', 'Đã dùng': 'tag--ok', 'Đã trả lại': '', 'Đã hoàn điểm': 'tag--no' };
  const S = { q: '', tt: '', trang: 1, moiTrang: 20, sx: 'soDu', qd: '', trangD: 1, loai: '', trangG: 1 };
  let duLieu = { gt: null, diem: null, gd: null };

  const khung = (el, tab, noiDung) => {
    el.innerHTML = `<div class="tabs2">${TAB.filter((t) => A.co(t[2])).map(([k, t]) => `<a class="tab2 ${k === tab ? 'is-on' : ''}" href="#/gioi-thieu${k ? '/' + k : ''}">${t}</a>`).join('')}</div><div id="gtBody">${noiDung || A.dangTai('dữ liệu')}</div>`;
    return $('#gtBody');
  };
  const csv = (ten, cot, dong) => {
    const s = '﻿' + [cot, ...dong].map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv;charset=utf-8' }));
    a.download = `${ten}-${ngayISO(new Date())}.csv`; a.click(); A.toast('Đã xuất file Excel (CSV)', 'ok');
  };
  const chuaCo = (msg) => `<div class="card err-box"><h3>⏳ Chưa tải được dữ liệu</h3><p>${esc(msg || 'Apps Script chưa có phần Giới thiệu & điểm.')}</p><button class="btn btn--primary" data-act="tai-lai">Thử lại</button></div>`;

  /* ---------------- Tổng quan + danh sách quan hệ giới thiệu ---------------- */
  async function veTongQuan(el) {
    const body = khung(el, '');
    try {
      const d = await A.api('qtGioiThieu', {}); if (!d || !d.ok) { body.innerHTML = chuaCo(d && d.msg); return; }
      duLieu.gt = d; veBangGT(body, d);
    } catch (e) { body.innerHTML = A.loiTai(e.message); }
  }
  function veBangGT(body, d) {
    const ds = d.ds || [];
    const nguoiGT = new Set(ds.map((x) => x.gt)).size, daMua = ds.filter((x) => x.trangThai === 'Đã thưởng' || x.trangThai === 'Đã thu hồi').length;
    const coDon = ds.filter((x) => x.maDon || x.trangThai === 'Đã thưởng');
    const giaTri = coDon.reduce((s, x) => s + (x.giaTri || 0), 0), giam = coDon.reduce((s, x) => s + (x.giam || 0), 0);
    const loc = ds.filter((x) => (!S.tt || x.trangThai === S.tt) && (!S.q || [x.duoc, x.gt, x.tenDuoc, x.tenGt, x.maDon].join(' ').toLowerCase().includes(S.q.toLowerCase())));
    S.trang = Math.min(S.trang, Math.max(1, Math.ceil(loc.length / S.moiTrang)));
    const trang = loc.slice((S.trang - 1) * S.moiTrang, S.trang * S.moiTrang);
    $('#pageAct').innerHTML = `${A.co('referral.update') ? '<button class="btn btn--ghost" id="gtXuLy">⟳ Xử lý ngay theo CRM</button>' : ''}${A.co('referral.export') ? '<button class="btn btn--ghost" id="gtXuat">⭳ Xuất Excel</button>' : ''}`;
    body.innerHTML = `
      ${d.lich === false ? `<div class="card err-box"><h3>⏰ Chưa bật lịch tự xử lý</h3><p>Điểm thưởng / trừ điểm được xử lý khi CRM báo trạng thái đơn. Bật lịch để hệ thống tự chạy 30 phút/lần (cùng lúc đồng bộ trạng thái đơn từ CRM).</p>${A.co('referral_settings.update') ? '<button class="btn btn--primary" id="gtBatLich">Bật lịch 30 phút</button>' : ''}</div>`
        : d.lich === null ? `<div class="card err-box"><h3>⏰ Cần bật lịch tự xử lý (làm 1 lần)</h3><p>Apps Script chưa được cấp quyền tạo lịch chạy nền. Mở <b>Apps Script</b> của shop → chọn hàm <code>taoLichDongBoCRM</code> ở thanh trên → bấm <b>▶ Chạy</b> → <b>Cho phép</b>. Xong hệ thống tự cộng / trừ điểm theo trạng thái CRM 30 phút/lần. Trong lúc chờ, bấm “⟳ Xử lý ngay theo CRM” để xử lý tay.</p></div>` : ''}
      <div class="kpis">
        ${A.the('Lượt giới thiệu', n0(ds.length), `${n0(nguoiGT)} người giới thiệu`)}
        ${A.the('Đã mua (giao thành công)', n0(daMua), ds.length ? `Tỉ lệ chuyển đổi ${Math.round(daMua / ds.length * 100)}%` : '', 'kpi--teal')}
        ${A.the('Giá trị đơn từ giới thiệu', fmt(giaTri), `${n0(coDon.length)} đơn`)}
        ${A.the('Đã giảm cho khách mới', fmt(giam), '', 'kpi--pink')}
        ${A.the('Tổng điểm đã thưởng', n0(d.tongThuong), 'sau khi trừ thu hồi')}
        ${A.the('Tổng điểm khách đã dùng', n0(d.tongDung), `= ${fmt(d.tongDung * (Number((d.cauHinh || {}).giaTriDiem) || 1))}`)}
      </div>
      <div class="grid-2">
        <div class="card"><h3>🏆 Top người giới thiệu</h3>${(d.top || []).length ? `<div class="tbl-wrap"><table><thead><tr><th>#</th><th>Khách</th><th class="num">Đã giới thiệu</th><th class="num">Đã mua</th><th class="num">Điểm nhận</th></tr></thead><tbody>
          ${d.top.map((t, i) => `<tr><td>${i + 1}</td><td><a href="#/gioi-thieu/diem/${esc(t.sdt)}"><b>${esc(t.ten || '(chưa có tên)')}</b></a><br><small class="muted">${esc(t.sdt)}</small></td><td class="num">${t.soNguoi}</td><td class="num">${t.daMua}</td><td class="num"><b>${n0(t.diem)}</b></td></tr>`).join('')}
          </tbody></table></div>` : A.trong('Chưa có ai giới thiệu', 'Khách chia sẻ mã ở trang Tài khoản → Giới thiệu bạn bè.', '🤝')}</div>
        <div class="card"><h3>📌 Quy tắc đang chạy</h3>${quyTac(d.cauHinh || {})}</div>
      </div>
      <div class="card"><h3>📋 Quan hệ giới thiệu</h3>
        <div class="tool" style="grid-template-columns:1fr 220px"><div class="tool__tim"><input id="gtQ" placeholder="Tìm SĐT, tên, mã đơn…" value="${esc(S.q)}" autocomplete="off"></div>
          <select id="gtTT"><option value="">Mọi trạng thái</option>${['Đã liên kết', 'Chờ giao', 'Đã thưởng', 'Đã thu hồi'].map((t) => `<option ${S.tt === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        ${loc.length ? `<div class="tbl-wrap"><table><thead><tr><th>Người giới thiệu</th><th>Khách được giới thiệu</th><th>Đơn</th><th class="num">Giá trị đơn</th><th class="num">Giảm</th><th class="num">Điểm thưởng</th><th>Trạng thái</th><th>Ngày</th></tr></thead><tbody>
          ${trang.map((x) => `<tr><td data-nhan="Người GT"><a href="#/gioi-thieu/diem/${esc(x.gt)}"><b>${esc(x.tenGt || x.gt)}</b></a>${x.tenGt ? `<br><small class="muted">${esc(x.gt)}</small>` : ''}</td>
            <td data-nhan="Được GT"><a href="#/thanh-vien/${esc(x.duoc)}">${esc(x.tenDuoc || x.duoc)}</a>${x.tenDuoc ? `<br><small class="muted">${esc(x.duoc)}</small>` : ''}<br><small class="muted">${esc(x.nguon)}</small></td>
            <td data-nhan="Đơn">${esc(x.maDon || '—')}</td><td class="num" data-nhan="Giá trị">${x.giaTri ? fmt(x.giaTri) : '—'}</td>
            <td class="num" data-nhan="Giảm">${x.giam ? '−' + fmt(x.giam) + `<br><small class="muted">${esc(x.pGiam)}%</small>` : '—'}</td>
            <td class="num" data-nhan="Điểm">${x.diem ? `<b>+${n0(x.diem)}</b><br><small class="muted">${esc(x.pThuong)}%</small>` : '—'}</td>
            <td>${A.badge(x.trangThai, TT[x.trangThai] || '')}${x.ghiChu ? `<br><small class="muted">${esc(x.ghiChu)}</small>` : ''}</td><td data-nhan="Ngày"><small>${esc(x.ngay)}</small></td></tr>`).join('')}
          </tbody></table></div>${A.phanTrang(loc.length, S.trang, S.moiTrang, 'gt-pg')}` : A.trong('Không có dòng nào', S.q || S.tt ? 'Thử bỏ bớt bộ lọc.' : 'Khi khách nhập mã giới thiệu, quan hệ sẽ hiện ở đây.', '🤝')}
      </div>`;
  }
  const quyTac = (c) => `<div class="kh-row"><span>Chương trình</span><b>${c.bat ? A.badge('Đang bật', 'tag--ok') : A.badge('Đang tắt', 'tag--no')}</b></div>
    <div class="kh-row"><span>Giảm cho người mới (đơn đầu)</span><b>${c.giam}%</b></div>
    <div class="kh-row"><span>Thưởng người giới thiệu</span><b>${c.thuong}% giá trị đơn → điểm</b></div>
    <div class="kh-row"><span>Giá trị 1 điểm</span><b>${fmt(c.giaTriDiem)}</b></div>
    <div class="kh-row"><span>Đơn tối thiểu</span><b>${c.donToiThieu ? fmt(c.donToiThieu) : 'Không'}</b></div>
    <div class="kh-row"><span>Người mới phải OTP</span><b>${c.canXacThuc ? 'Có' : 'Không'}</b></div>
    <p class="muted" style="margin-top:8px">Giảm giới thiệu không cộng dồn với mã giảm giá / ưu đãi hạng và không kèm quà. Điểm dùng chung được với mọi ưu đãi, không trừ phí ship. Điểm thưởng cộng khi CRM báo <b>Đã giao</b>, tự thu hồi nếu hoàn hàng.</p>`;

  /* ---------------- Ví điểm ---------------- */
  async function veVi(el) {
    const body = khung(el, 'diem');
    try {
      const d = await A.api('qtDiem', {}); if (!d || !d.ok) { body.innerHTML = chuaCo(d && d.msg); return; }
      duLieu.diem = d; veBangVi(body, d);
    } catch (e) { body.innerHTML = A.loiTai(e.message); }
  }
  function veBangVi(body, d) {
    const ds = (d.ds || []).filter((x) => !S.qd || (x.sdt + ' ' + x.ten).toLowerCase().includes(S.qd.toLowerCase()));
    ds.sort((a, b) => (S.sx === 'ten' ? String(a.ten).localeCompare(String(b.ten), 'vi') : (b[S.sx] || 0) - (a[S.sx] || 0)));
    S.trangD = Math.min(S.trangD, Math.max(1, Math.ceil(ds.length / S.moiTrang)));
    const trang = ds.slice((S.trangD - 1) * S.moiTrang, S.trangD * S.moiTrang);
    const tong = (k) => (d.ds || []).reduce((s, x) => s + (x[k] || 0), 0);
    $('#pageAct').innerHTML = A.co('points.export') ? '<button class="btn btn--ghost" id="diemXuat">⭳ Xuất Excel</button>' : '';
    body.innerHTML = `
      <div class="kpis">
        ${A.the('Khách có ví điểm', n0((d.ds || []).length), '')}
        ${A.the('Tổng điểm khả dụng', n0(tong('khaDung')), '', 'kpi--teal')}
        ${A.the('Đang giữ cho đơn', n0(tong('dangGiu')), 'chờ CRM xác nhận đơn')}
        ${A.the('Tổng đã nhận / đã dùng', `${n0(tong('tongNhan'))} / ${n0(tong('tongDung'))}`, '', 'kpi--pink')}
      </div>
      ${A.co('points.adjust') ? formDieuChinh('') : ''}
      <div class="card"><h3>⭐ Ví điểm khách hàng</h3>
        <div class="tool" style="grid-template-columns:1fr 220px"><div class="tool__tim"><input id="diemQ" placeholder="Tìm tên hoặc số điện thoại…" value="${esc(S.qd)}" autocomplete="off"></div>
          <select id="diemSx">${[['soDu', 'Số dư cao nhất'], ['khaDung', 'Khả dụng cao nhất'], ['tongNhan', 'Đã nhận nhiều nhất'], ['tongDung', 'Đã dùng nhiều nhất'], ['dangGiu', 'Đang giữ nhiều nhất'], ['ten', 'Tên A→Z']].map(([k, t]) => `<option value="${k}" ${S.sx === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        ${ds.length ? `<div class="tbl-wrap"><table><thead><tr><th>Khách hàng</th><th class="num">Khả dụng</th><th class="num">Đang giữ</th><th class="num">Tổng nhận</th><th class="num">Tổng dùng</th><th>Giao dịch gần nhất</th><th>Trạng thái</th><th></th></tr></thead><tbody>
          ${trang.map((x) => `<tr><td><a href="#/gioi-thieu/diem/${esc(x.sdt)}"><b>${esc(x.ten || '(chưa có tên)')}</b></a><br><small class="muted">${esc(x.sdt)}</small></td>
            <td class="num" data-nhan="Khả dụng"><b>${n0(x.khaDung)}</b></td><td class="num" data-nhan="Đang giữ">${n0(x.dangGiu)}</td>
            <td class="num" data-nhan="Tổng nhận">${n0(x.tongNhan)}</td><td class="num" data-nhan="Tổng dùng">${n0(x.tongDung)}</td>
            <td data-nhan="Gần nhất"><small>${esc(x.ganNhat || '—')}</small></td><td>${x.khoa ? A.badge('Tài khoản khoá', 'tag--no') : A.badge('Bình thường', 'tag--ok')}</td>
            <td class="num"><a class="btn btn--ghost btn--sm" href="#/gioi-thieu/diem/${esc(x.sdt)}">Lịch sử</a></td></tr>`).join('')}
          </tbody></table></div>${A.phanTrang(ds.length, S.trangD, S.moiTrang, 'diem-pg')}` : A.trong('Chưa có ví điểm nào', 'Ví được tạo khi khách nhận điểm thưởng hoặc shop cộng điểm.', '⭐')}
      </div>`;
  }
  const formDieuChinh = (sdt) => `<div class="card"><h3>➕➖ Cộng / trừ điểm</h3>
    <div class="grid-2" style="grid-template-columns:1fr 1fr 2fr;align-items:end">
      <label>Số điện thoại <i>*</i><input id="dcSdt" inputmode="numeric" value="${esc(sdt)}" placeholder="VD: 0901234567" ${sdt ? 'readonly' : ''}></label>
      <label>Số điểm <i>*</i><input id="dcDiem" type="number" step="1000" placeholder="VD: 100000 hoặc -50000"></label>
      <label>Lý do <i>*</i><input id="dcLyDo" maxlength="200" placeholder="VD: Chăm sóc khách hàng / Điều chỉnh sai điểm"></label>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn--primary" data-dc="1">+ Cộng điểm</button><button class="btn btn--red" data-dc="-1">− Trừ điểm</button></div>
    <p class="muted" style="margin-top:8px">Không sửa thẳng số dư: mỗi lần cộng/trừ tạo 1 giao dịch “Điều chỉnh” trong sổ điểm và ghi nhật ký (ai, khi nào, bao nhiêu, vì sao). Không trừ quá số dư.</p></div>`;

  async function veLichSu(el, sdt) {
    const body = khung(el, 'diem');
    $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#/gioi-thieu/diem">← Ví điểm</a><a class="btn btn--ghost" href="#/thanh-vien/${esc(sdt)}">👤 Hồ sơ khách</a>`;
    try {
      const d = await A.api('qtDiemLichSu', { sdt }); if (!d || !d.ok) { body.innerHTML = chuaCo(d && d.msg); return; }
      const v = d.vi || {};
      body.innerHTML = `<div class="kpis">
          ${A.the('Khách', esc(d.ten || '(chưa có tên)'), esc(sdt))}
          ${A.the('Điểm khả dụng', n0(v.khaDung), '', 'kpi--teal')}
          ${A.the('Đang giữ', n0(v.dangGiu), '')}
          ${A.the('Tổng nhận / dùng', `${n0(v.tongNhan)} / ${n0(v.tongDung)}`, '', 'kpi--pink')}
        </div>
        ${A.co('points.adjust') ? formDieuChinh(sdt) : ''}
        <div class="card"><h3>🧾 Lịch sử giao dịch điểm</h3>${bangGD(d.ls, false)}</div>
        <div class="card"><h3>🔒 Giữ chỗ theo đơn</h3>${bangGiu(d.giu)}</div>`;
    } catch (e) { body.innerHTML = A.loiTai(e.message); }
  }
  const bangGD = (ls, coSdt) => ((ls || []).length ? `<div class="tbl-wrap"><table><thead><tr><th>Thời gian</th>${coSdt ? '<th>Khách</th>' : ''}<th>Loại</th><th class="num">Điểm</th><th class="num">Số dư sau</th><th>Nội dung</th><th>Đơn / tham chiếu</th><th>Người tạo</th></tr></thead><tbody>
    ${ls.map((x) => `<tr><td><small>${esc(x.ngay)}</small></td>${coSdt ? `<td><a href="#/gioi-thieu/diem/${esc(x.sdt)}">${esc(x.sdt)}</a></td>` : ''}<td>${A.badge((LOAI[x.loai] || [x.loai])[0], (LOAI[x.loai] || [])[1] || '')}</td>
      <td class="num" data-nhan="Điểm"><b style="color:${x.diem > 0 ? 'var(--teal)' : 'var(--red,#E53935)'}">${x.diem > 0 ? '+' : ''}${n0(x.diem)}</b></td><td class="num" data-nhan="Số dư">${n0(x.sau)}</td>
      <td data-nhan="Nội dung">${esc(x.noiDung)}</td><td data-nhan="Tham chiếu"><small>${esc(x.ref || '—')}</small></td><td data-nhan="Người tạo"><small>${esc(x.nguoiTao)}</small></td></tr>`).join('')}
    </tbody></table></div>` : A.trong('Chưa có giao dịch', '', '🧾'));
  const bangGiu = (ds) => ((ds || []).length ? `<div class="tbl-wrap"><table><thead><tr><th>Mã giữ chỗ</th><th>Đơn</th><th>Khách</th><th class="num">Điểm</th><th class="num">Giảm GT</th><th class="num">Tổng đơn</th><th>Trạng thái</th><th>Tạo lúc</th></tr></thead><tbody>
    ${ds.map((x) => `<tr><td><small>${esc(x.ma)}</small></td><td>${esc(x.maDon)}</td><td><a href="#/gioi-thieu/diem/${esc(x.sdt)}">${esc(x.sdt)}</a></td><td class="num">${n0(x.diem)}</td><td class="num">${x.giamGT ? '−' + fmt(x.giamGT) : '—'}</td><td class="num">${fmt(x.tongDon)}</td>
      <td>${A.badge(x.trangThai, TT[x.trangThai] || '')}${x.ghiChu ? `<br><small class="muted">${esc(x.ghiChu)}</small>` : ''}</td><td><small>${esc(x.ngay)}</small></td></tr>`).join('')}
    </tbody></table></div>` : A.trong('Chưa có đơn nào dùng điểm / giới thiệu', '', '🔒'));

  /* ---------------- Toàn bộ giao dịch ---------------- */
  async function veGiaoDich(el) {
    const body = khung(el, 'giao-dich');
    try {
      const d = await A.api('qtDiemLichSu', {}); if (!d || !d.ok) { body.innerHTML = chuaCo(d && d.msg); return; }
      duLieu.gd = d; veBangGiaoDich(body, d);
    } catch (e) { body.innerHTML = A.loiTai(e.message); }
  }
  function veBangGiaoDich(body, d) {
    const ls = (d.ls || []).filter((x) => !S.loai || x.loai === S.loai);
    S.trangG = Math.min(S.trangG, Math.max(1, Math.ceil(ls.length / 50)));
    $('#pageAct').innerHTML = A.co('points.export') ? '<button class="btn btn--ghost" id="gdXuat">⭳ Xuất Excel</button>' : '';
    body.innerHTML = `<div class="card"><h3>🧾 Sổ giao dịch điểm (mới nhất trước)</h3>
        <div class="tool" style="grid-template-columns:220px"><select id="gdLoai"><option value="">Mọi loại giao dịch</option>${Object.keys(LOAI).map((k) => `<option value="${k}" ${S.loai === k ? 'selected' : ''}>${LOAI[k][0]} (${k})</option>`).join('')}</select></div>
        ${bangGD(ls.slice((S.trangG - 1) * 50, S.trangG * 50), true)}${A.phanTrang(ls.length, S.trangG, 50, 'gd-pg')}</div>
      <div class="card"><h3>🔒 Giữ chỗ theo đơn</h3>${bangGiu(d.giu)}</div>`;
  }

  /* ---------------- Cấu hình ---------------- */
  async function veCauHinh(el) {
    const body = khung(el, 'cau-hinh'); $('#pageAct').innerHTML = '';
    try {
      const d = await A.api('qtGtCauHinh', {}); if (!d || !d.ok) { body.innerHTML = chuaCo(d && d.msg); return; }
      const c = d.cauHinh, sua = A.co('referral_settings.update'), dis = sua ? '' : 'disabled';
      body.innerHTML = `<div class="card" style="max-width:720px"><h3>⚙️ Chương trình giới thiệu & điểm thưởng</h3>
        <label class="sw"><input type="checkbox" id="chBat" ${c.bat ? 'checked' : ''} ${dis}> <span>Kích hoạt chương trình giới thiệu<small class="hint">Tắt: không nhận mã giới thiệu mới. Điểm khách đã có vẫn dùng được.</small></span></label>
        <div class="grid-2">
          <label>Giảm cho người mới (đơn đầu) – %<input id="chGiam" type="number" min="0" max="50" step="0.5" value="${esc(c.giam)}" ${dis}></label>
          <label>Điểm thưởng người giới thiệu – % giá trị đơn<input id="chThuong" type="number" min="0" max="50" step="0.5" value="${esc(c.thuong)}" ${dis}></label>
          <label>1 điểm tương đương (đồng)<input id="chGtd" type="number" min="0.01" step="0.01" value="${esc(c.giaTriDiem)}" ${dis}></label>
          <label>Giá trị hàng tối thiểu để được giảm (đồng)<input id="chMin" type="number" min="0" step="10000" value="${esc(c.donToiThieu)}" ${dis}></label>
          <label>Giữ điểm tối đa khi CRM chưa thấy đơn (giờ)<input id="chGiu" type="number" min="1" max="720" value="${esc(c.giuChoGio)}" ${dis}></label>
          <label>Theo dõi hoàn hàng sau khi thưởng (ngày)<input id="chTheoDoi" type="number" min="1" max="365" value="${esc(c.theoDoiNgay)}" ${dis}></label>
        </div>
        <label class="sw"><input type="checkbox" id="chOtp" ${c.canXacThuc ? 'checked' : ''} ${dis}> <span>Người mới phải xác thực OTP mới được giảm giới thiệu<small class="hint">Bật: chặn bịa số điện thoại, nhưng khách phải chờ mã (shop chưa có SMS nên mã gửi qua email / shop nhắn tay). Dùng điểm luôn bắt OTP hoặc mật khẩu riêng.</small></span></label>
        <label>Nội dung chia sẻ mặc định<textarea id="chChiaSe" rows="3" maxlength="300" ${dis}>${esc(c.noiDungChiaSe)}</textarea><small class="hint">{giam} = % giảm, {ma} = mã của khách, {link} = link giới thiệu.</small></label>
        ${sua ? '<button class="btn btn--primary" id="chLuu">Lưu cấu hình</button>' : '<p class="muted">Bạn chỉ có quyền xem cấu hình.</p>'}
        <p class="muted" style="margin-top:10px">Đơn đã đặt giữ nguyên % tại lúc đặt (lưu kèm từng đơn), đổi cấu hình chỉ áp dụng cho đơn mới. Thay đổi được ghi vào Nhật ký.</p></div>`;
    } catch (e) { body.innerHTML = A.loiTai(e.message); }
  }

  /* ---------------- Sự kiện ---------------- */
  const tim = A.tre(() => { S.trang = 1; S.trangD = 1; const b = $('#gtBody'); if (!b) return; if (duLieu.gt && $('#gtQ')) veBangGT(b, duLieu.gt); else if (duLieu.diem && $('#diemQ')) veBangVi(b, duLieu.diem); const i = $('#gtQ') || $('#diemQ'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 380);
  document.addEventListener('input', (e) => { if (e.target.id === 'gtQ') { S.q = e.target.value; tim(); } if (e.target.id === 'diemQ') { S.qd = e.target.value; tim(); } });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'gtTT') { S.tt = e.target.value; S.trang = 1; veBangGT($('#gtBody'), duLieu.gt); }
    if (e.target.id === 'diemSx') { S.sx = e.target.value; veBangVi($('#gtBody'), duLieu.diem); }
    if (e.target.id === 'gdLoai') { S.loai = e.target.value; S.trangG = 1; veBangGiaoDich($('#gtBody'), duLieu.gd); }
  });
  document.addEventListener('click', async (e) => {
    if (!location.hash.startsWith('#/gioi-thieu')) return;
    const pg = e.target.closest('[data-gt-pg]'); if (pg) { S.trang = Number(pg.dataset.gtPg); return veBangGT($('#gtBody'), duLieu.gt); }
    const pd = e.target.closest('[data-diem-pg]'); if (pd) { S.trangD = Number(pd.dataset.diemPg); return veBangVi($('#gtBody'), duLieu.diem); }
    const pgd = e.target.closest('[data-gd-pg]'); if (pgd) { S.trangG = Number(pgd.dataset.gdPg); return veBangGiaoDich($('#gtBody'), duLieu.gd); }
    if (e.target.closest('[data-act="tai-lai"]')) return A.veTrang();
    if (e.target.id === 'gtXuat' && duLieu.gt) return csv('gioi-thieu', ['Người giới thiệu', 'Tên người GT', 'Khách được GT', 'Tên khách', 'Nguồn', 'Mã đơn', 'Giá trị đơn', 'Giảm', '% giảm', 'Điểm thưởng', '% thưởng', 'Trạng thái', 'Ngày', 'Cập nhật', 'Ghi chú'],
      duLieu.gt.ds.map((x) => [x.gt, x.tenGt, x.duoc, x.tenDuoc, x.nguon, x.maDon, x.giaTri, x.giam, x.pGiam, x.diem, x.pThuong, x.trangThai, x.ngay, x.capNhat, x.ghiChu]));
    if (e.target.id === 'diemXuat' && duLieu.diem) return csv('vi-diem', ['Điện thoại', 'Khách', 'Số dư', 'Khả dụng', 'Đang giữ', 'Tổng nhận', 'Tổng dùng', 'Số giao dịch', 'Gần nhất'],
      duLieu.diem.ds.map((x) => [x.sdt, x.ten, x.soDu, x.khaDung, x.dangGiu, x.tongNhan, x.tongDung, x.soGD, x.ganNhat]));
    if (e.target.id === 'gdXuat' && duLieu.gd) return csv('giao-dich-diem', ['Thời gian', 'Mã GD', 'Điện thoại', 'Loại', 'Điểm', 'Số dư trước', 'Số dư sau', 'Loại tham chiếu', 'Tham chiếu', 'Nội dung', 'Người tạo'],
      duLieu.gd.ls.map((x) => [x.ngay, x.ma, x.sdt, x.loai, x.diem, x.truoc, x.sau, x.refLoai, x.ref, x.noiDung, x.nguoiTao]));
    if (e.target.id === 'gtXuLy') {
      e.target.disabled = true; e.target.textContent = 'Đang xử lý…';
      try { const r = await A.api('qtGtXuLy', {}, 120000); if (!r || !r.ok) A.toast((r && r.msg) || 'Chưa xử lý được', 'err');
        else A.toast(`Xong: ${r.thuong} thưởng, ${r.daDung} trừ điểm, ${r.traLai} trả lại, ${r.hoanDiem} hoàn điểm, ${r.thuHoi} thu hồi${r.loi && r.loi.length ? ' · lỗi: ' + r.loi.join('; ') : ''}`, 'ok'); }
      catch (err) { A.toast(err.message, 'err'); }
      return A.veTrang();
    }
    if (e.target.id === 'gtBatLich') {
      try { const r = await A.api('qtGtLich', {}); A.toast(r && r.ok ? 'Đã bật lịch tự xử lý 30 phút/lần' : (r && r.msg) || 'Chưa bật được', r && r.ok ? 'ok' : 'err'); } catch (err) { A.toast(err.message, 'err'); }
      return A.veTrang();
    }
    const dc = e.target.closest('[data-dc]');
    if (dc) {
      const sdt = ($('#dcSdt').value || '').replace(/\D/g, ''); const so = Math.abs(Math.round(Number($('#dcDiem').value) || 0)) * Number(dc.dataset.dc); const lyDo = $('#dcLyDo').value.trim();
      if (!/^0\d{9}$/.test(sdt)) return A.toast('Số điện thoại chưa đúng', 'err');
      if (!so) return A.toast('Nhập số điểm', 'err');
      if (lyDo.length < 3) { $('#dcLyDo').focus(); return A.toast('Bắt buộc nhập lý do', 'err'); }
      const ok = await A.hoi({ tieuDe: so > 0 ? 'Cộng điểm cho khách?' : 'Trừ điểm của khách?', noiDung: `${so > 0 ? 'Cộng' : 'Trừ'} <b>${n0(Math.abs(so))} điểm</b> cho <b>${esc(sdt)}</b>.<br>Lý do: ${esc(lyDo)}<br><small>Giao dịch được ghi vào sổ điểm và nhật ký, không xoá được.</small>`, nutOk: so > 0 ? 'Cộng điểm' : 'Trừ điểm', nguyHiem: so < 0 });
      if (!ok) return;
      dc.disabled = true;
      try {
        const r = await A.api('qtDiemDieuChinh', { sdt, diem: so, lyDo, maYc: Date.now().toString(36) + Math.random().toString(36).slice(2, 7) });
        if (!r || !r.ok) { A.toast((r && r.msg) || 'Không điều chỉnh được', 'err'); dc.disabled = false; return; }
        A.toast(`Đã ${so > 0 ? 'cộng' : 'trừ'} ${n0(Math.abs(so))} điểm · số dư mới ${n0(r.soDu)}`, 'ok'); A.veTrang();
      } catch (err) { A.toast(err.message, 'err'); dc.disabled = false; }
    }
    if (e.target.id === 'chLuu') {
      const v = (id) => $('#' + id).value;
      const p = { luu: '1', bat: $('#chBat').checked ? '1' : '0', canXacThuc: $('#chOtp').checked ? '1' : '0', giam: v('chGiam'), thuong: v('chThuong'), giaTriDiem: v('chGtd'), donToiThieu: v('chMin'), giuChoGio: v('chGiu'), theoDoiNgay: v('chTheoDoi'), noiDungChiaSe: v('chChiaSe') };
      const ok = await A.hoi({ tieuDe: 'Lưu cấu hình giới thiệu?', noiDung: `Chương trình: <b>${p.bat === '1' ? 'BẬT' : 'TẮT'}</b> · Giảm người mới <b>${esc(p.giam)}%</b> · Thưởng <b>${esc(p.thuong)}%</b> · 1 điểm = <b>${esc(p.giaTriDiem)}đ</b><br><small>Áp dụng ngay cho đơn mới; đơn đã đặt giữ % cũ.</small>`, nutOk: 'Lưu' });
      if (!ok) return;
      try { const r = await A.api('qtGtCauHinh', p); A.toast(r && r.ok ? 'Đã lưu cấu hình' : (r && r.msg) || 'Chưa lưu được', r && r.ok ? 'ok' : 'err'); try { localStorage.removeItem('mc_gt_cfg'); } catch { /* không sao */ } A.veTrang(); }
      catch (err) { A.toast(err.message, 'err'); }
    }
  });

  A.dangKy({ route: '/gioi-thieu', ten: 'Giới thiệu & điểm', icon: '🤝', nhom: 'khach-hang', quyen: 'referral.view',
    mo: 'Giới thiệu bạn bè, ví điểm, cộng/trừ điểm',
    ve(el, { sub }) {
      if (sub === 'diem') return veVi(el);
      if (sub.startsWith('diem/')) return veLichSu(el, sub.slice(5));
      if (sub === 'giao-dich') return veGiaoDich(el);
      if (sub === 'cau-hinh') return veCauHinh(el);
      return veTongQuan(el);
    } });
})();
