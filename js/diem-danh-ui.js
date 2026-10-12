/* =====================================================================
   GIAO DIỆN ĐIỂM DANH – dùng chung cho trang diem-danh.html và khung xem trước ở trang quản trị.
   Chỉ vẽ dữ liệu máy chủ trả về (ddTongQuan); riêng mau() tạo dữ liệu MINH HOẠ cho khung xem trước của quản trị.
   ===================================================================== */
(function () {
  'use strict';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tien = (n) => (Math.round(n) || 0).toLocaleString('vi-VN') + 'đ';
  const so = (n) => (Number(n) || 0).toLocaleString('vi-VN');
  const mauHop = (m) => (/^#[0-9a-fA-F]{6}$/.test(String(m || '')) ? m : '#F0537A');
  const congNgay = (d, n) => { const t = new Date(d + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
  const ngayVN = (d) => d.split('-').reverse().join('/');
  const NGUON = { DOUBLE_DATE: '🎁 Ngày đôi', STREAK_10: '🔥 Chuỗi 10 ngày', STREAK_20: '🔥 Chuỗi 20 ngày', STREAK_30: '🏆 Chuỗi 30 ngày' };

  /* Thể lệ: thay {diem}, {ngayDoi}, {m10}, {m20}, {m30}, {donToiThieu}, {hanNgay} bằng giá trị cấu hình */
  function theLe(cfg) {
    const v = { diem: so(cfg.diemNgay), ngayDoi: tien(cfg.ngayDoi), m10: tien(cfg.m10), m20: tien(cfg.m20), m30: tien(cfg.m30), donToiThieu: tien(cfg.donToiThieu), hanNgay: so(cfg.hanNgay) };
    return String(cfg.theLe || '').split('\n').filter((x) => x.trim()).map((x) => `<li>${esc(x.replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m)))}</li>`).join('');
  }
  const hero = (cfg, them = '') => `<div class="ddp-hero" style="--dd:${mauHop(cfg.mau)}"><div class="ddp-hero__ic" aria-hidden="true">${esc(cfg.icon || '📅')}</div>
    <div class="ddp-hero__tx"><h1>${esc(cfg.ten || 'Điểm danh mỗi ngày')}</h1><p>${esc(cfg.moTa || '')}</p></div>${them}</div>`;
  const quaTomTat = (cfg) => `<div class="ddp-qua">
    <div><b>+${so(cfg.diemNgay)}</b><small>điểm mỗi ngày</small></div>
    ${cfg.ngayDoi ? `<div><b>${tien(cfg.ngayDoi)}</b><small>voucher ngày đôi</small></div>` : ''}
    ${[10, 20, 30].filter((m) => cfg['m' + m]).map((m) => `<div><b>${tien(cfg['m' + m])}</b><small>chuỗi ${m} ngày</small></div>`).join('')}</div>`;
  const theLeKhoi = (cfg) => `<div class="card card--pad ddp-tl"><h3>📜 Thể lệ chương trình</h3><ul>${theLe(cfg)}</ul>
    ${cfg.batDau || cfg.ketThuc ? `<p class="fs-13 text-muted">Thời gian: ${cfg.batDau ? 'từ ' + ngayVN(cfg.batDau) : ''} ${cfg.ketThuc ? 'đến hết ' + ngayVN(cfg.ketThuc) : ''}</p>` : ''}</div>`;

  function dangTai() { return `<div class="ddp-skel"><div></div><div></div><div></div></div><p class="text-muted fs-14 text-center">Đang tải dữ liệu điểm danh…</p>`; }
  function loi(msg) { return `<div class="card card--pad text-center ddp-loi"><div class="ddp-loi__ic">⚠️</div><h3>Chưa tải được dữ liệu</h3><p class="text-muted">${esc(msg)}</p><button class="btn btn--primary" type="button" data-dd-thu-lai>Thử lại</button></div>`; }
  function chuaDangNhap(cfg) {
    if (!cfg || cfg.bat === false) return `<div class="card card--pad text-center"><h3>Chương trình điểm danh đang tạm dừng</h3><p class="text-muted">Mẹ quay lại sau nhé!</p></div>`;
    return `${hero(cfg)}${quaTomTat(cfg)}
      <div class="card card--pad text-center ddp-moi"><h3>Đăng nhập để điểm danh hôm nay</h3><p class="text-muted fs-14">Đăng nhập là tự điểm danh, không cần bấm thêm. Điểm và voucher được lưu vào tài khoản của mẹ.</p>
      <button class="btn btn--primary btn--lg" type="button" id="ddLogin">Đăng nhập / Đăng ký</button></div>${theLeKhoi(cfg)}`;
  }

  /* Lịch tháng: đã điểm danh / bỏ lỡ / hôm nay / tương lai / ngày đôi / ngày đạt mốc */
  function lich(d, cfg) {
    const [y, m] = d.thang.split('-').map(Number); const dau = d.thang + '-01';
    const soNgay = new Date(Date.UTC(y, m, 0)).getUTCDate(); const thu = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
    const daDD = {}; (d.lich || []).forEach((x) => { daDD[x.ngay] = x; });
    const o = []; for (let i = 0; i < thu; i++) o.push('<div class="ddp-o ddp-o--rong"></div>');
    for (let i = 0; i < soNgay; i++) {
      const ng = congNgay(dau, i), x = daDD[ng], doi = ng.slice(5, 7) === ng.slice(8, 10);
      const truocCT = cfg.batDau && ng < cfg.batDau;
      const kieu = x ? 'da' : ng === d.homNay ? 'nay' : ng > d.homNay ? 'sau' : truocCT ? 'sau' : 'lo';
      const moc = x && [10, 20, 30].includes(x.chuoi);
      const nhan = { da: 'Đã điểm danh', nay: 'Hôm nay', sau: 'Chưa tới', lo: 'Bỏ lỡ' }[kieu];
      o.push(`<div class="ddp-o ddp-o--${kieu}${doi ? ' ddp-o--doi' : ''}${moc ? ' ddp-o--moc' : ''}" title="${ngayVN(ng)} – ${nhan}${doi ? ' · Ngày đôi' : ''}${moc ? ' · Đạt mốc ' + x.chuoi + ' ngày' : ''}">
        <b>${i + 1}</b><i aria-hidden="true">${moc ? '🏆' : x && doi ? '🎁' : x ? '✓' : doi ? '🎁' : kieu === 'lo' ? '·' : ''}</i></div>`);
    }
    const truoc = congNgay(dau, -1).slice(0, 7), sau = congNgay(dau, 32).slice(0, 7), thangNay = d.homNay.slice(0, 7);
    return `<div class="card card--pad ddp-lich"><div class="ddp-lich__dau"><button type="button" class="btn btn--ghost btn--sm" data-dd-thang="${truoc}" aria-label="Tháng trước">‹</button>
      <h3>Tháng ${m}/${y}</h3><button type="button" class="btn btn--ghost btn--sm" ${sau > thangNay ? 'disabled' : ''} data-dd-thang="${sau}" aria-label="Tháng sau">›</button></div>
      <div class="ddp-luoi">${['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((t) => `<div class="ddp-thu">${t}</div>`).join('')}${o.join('')}</div>
      <div class="ddp-chu"><span><i class="c-da"></i>Đã điểm danh</span><span><i class="c-lo"></i>Bỏ lỡ</span><span><i class="c-nay"></i>Hôm nay</span><span>🎁 Ngày đôi</span><span>🏆 Đạt mốc</span></div></div>`;
  }
  function tienDo(d, cfg) {
    const c = d.chuoi || 0, nhan = {}; (d.daNhan || []).forEach((v) => { nhan[v.nguon] = true; });
    const ds = [10, 20, 30].filter((m) => cfg['m' + m]);
    if (!ds.length) return '';
    return `<div class="card card--pad ddp-td"><h3>🔥 Chuỗi đăng nhập trong tháng</h3>
      <div class="ddp-td__so"><div><b>${so(c)}</b><small>ngày liên tiếp</small></div><div><b>${so(d.chuoiDaiNhat)}</b><small>chuỗi dài nhất</small></div><div><b>${so(d.soNgay)}</b><small>ngày đã điểm danh</small></div></div>
      <div class="ddp-bar"><div style="width:${Math.min(100, c / 30 * 100)}%"></div>${ds.map((m) => `<span class="${nhan['STREAK_' + m] ? 'is-on' : ''}" style="left:${m / 30 * 100}%"><i>${nhan['STREAK_' + m] ? '✓' : m}</i><small>${tien(cfg['m' + m])}</small></span>`).join('')}</div>
      ${(d.sapDat || []).length ? `<p class="fs-14 mt-12">${(() => { const t = d.sapDat.find((x) => x.conLai > 0) || d.sapDat[0]; return t.conLai > 0 ? `Còn <b>${t.conLai} ngày</b> liên tiếp nữa để nhận voucher <b>${tien(t.giaTri)}</b> (mốc ${t.moc} ngày).` : `Mẹ đã đủ mốc ${t.moc} ngày – voucher sẽ vào ví khi điểm danh.`; })()}</p>` : `<p class="fs-14 mt-12 text-teal fw-600">🎉 Mẹ đã nhận đủ các mốc thưởng của tháng này!</p>`}
      <p class="fs-12 text-muted">Bỏ lỡ 1 ngày chuỗi tính lại từ đầu · sang tháng mới bắt đầu chuỗi mới · mỗi mốc nhận 1 lần/tháng.</p></div>`;
  }
  function thuong(d) {
    const ds = d.daNhan || [];
    return `<div class="card card--pad ddp-th"><h3>🎟️ Phần thưởng tháng này</h3>
      ${ds.length ? `<div class="ddp-vcs">${ds.map((v) => `<div class="ddp-vc ddp-vc--${v.trangThai.toLowerCase()}"><b>${tien(v.giaTri)}</b><div><span>${esc(NGUON[v.nguon] || v.nguonTen)}</span><small>${{ AVAILABLE: 'Chưa dùng', RESERVED: 'Đang giữ cho đơn', USED: 'Đã dùng', EXPIRED: 'Hết hạn', REVOKED: 'Đã thu hồi' }[v.trangThai] || v.trangThai} · HSD ${new Date(v.hetHan).toLocaleDateString('vi-VN')}</small></div></div>`).join('')}</div>`
        : '<p class="text-muted fs-14">Chưa có voucher nào trong tháng. Điểm danh đều đặn để nhận voucher nhé!</p>'}
      <a class="btn btn--outline btn--block mt-12" href="vi-voucher.html">Xem Ví voucher →</a></div>`;
  }
  function lichSu(d) {
    const ds = [...(d.lich || [])].reverse();
    return `<div class="card card--pad ddp-ls"><h3>🗓️ Lịch sử điểm danh</h3>${ds.length ? `<div class="diem-ls">${ds.map((x) => `<div class="diem-ls__it"><div><b>${ngayVN(x.ngay)}${x.gio ? ' · ' + esc(x.gio) : ''}</b><small>${esc(x.nguon)} · chuỗi ${x.chuoi} ngày${x.thuong ? ' · có voucher' : ''}</small></div><div class="diem-ls__so is-cong">+${so(x.diem)}</div></div>`).join('')}</div>` : '<p class="text-muted fs-14">Tháng này chưa có lượt điểm danh nào.</p>'}</div>`;
  }
  /* Trang chính (dữ liệu từ máy chủ, hoặc dữ liệu minh hoạ khi xem trước) */
  function trang(d, cfg, opts = {}) {
    cfg = cfg || d.cauHinh || {};
    const daXong = d.daDiemDanhHomNay, dangChay = d.trongChuongTrinh !== false && cfg.bat !== false;
    const nut = !dangChay ? '<button class="btn btn--lg ddp-nut" type="button" disabled>Chương trình đang tạm dừng</button>'
      : daXong ? '<button class="btn btn--lg ddp-nut is-xong" type="button" disabled>✓ Hôm nay đã điểm danh</button>'
      : `<button class="btn btn--lg ddp-nut" type="button" ${opts.xemTruoc ? 'disabled' : 'data-dd-nut'}>Điểm danh nhận +${so(cfg.diemNgay)} điểm</button>`;
    return `${opts.xemTruoc ? '<div class="ddp-xt">👁️ Xem trước – dữ liệu minh hoạ, chưa lưu</div>' : ''}
      ${hero(cfg, `<div class="ddp-hero__nut"><div class="ddp-diem"><small>Điểm hiện có</small><b>${so((d.diem || {}).soDu)}</b></div>${nut}
      <p class="ddp-tt">${daXong ? '🎉 Mẹ đã điểm danh hôm nay – quay lại ngày mai nhé!' : dangChay ? 'Hôm nay mẹ chưa điểm danh' : ''}</p></div>`)}
      ${quaTomTat(cfg)}
      <div class="ddp-cot"><div>${lich(d, cfg)}${lichSu(d)}</div><div>${tienDo(d, cfg)}${thuong(d)}${theLeKhoi(cfg)}</div></div>`;
  }
  /* Hộp chúc mừng sau khi điểm danh thành công (chỉ gọi khi máy chủ đã xác nhận) */
  function chucMung(r) {
    const m = document.createElement('div'); m.className = 'ddp-cm'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-label', 'Điểm danh thành công');
    m.innerHTML = `<div class="ddp-cm__hop"><div class="ddp-cm__ic">🎉</div><h3>Điểm danh thành công!</h3><p class="ddp-cm__diem">+${so(r.diem)} điểm</p>
      <p class="fs-14 text-muted">Chuỗi hiện tại: <b>${so(r.chuoi)} ngày</b></p>
      ${(r.voucher || []).map((v) => `<div class="ddp-vc"><b>${tien(v.giaTri)}</b><div><span>${esc(NGUON[v.nguon] || v.ten)}</span><small>Đã vào Ví voucher · HSD ${esc(v.hetHan)}</small></div></div>`).join('')}
      <button class="btn btn--primary btn--block mt-12" type="button">Tuyệt vời</button></div>`;
    const dong = () => m.remove(); m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('button')) dong(); });
    document.body.appendChild(m); m.querySelector('button').focus();
  }
  /* Dữ liệu MINH HOẠ cho khung xem trước ở trang quản trị (không dùng ở trang khách) */
  function mau(cfg) {
    const homNay = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10), dau = homNay.slice(0, 8) + '01', n = Number(homNay.slice(8, 10));
    const lichMau = []; let chuoi = 0;
    for (let i = 0; i < n - 1; i++) { const ng = congNgay(dau, i); if (i === 2) { chuoi = 0; continue; } chuoi++; lichMau.push({ ngay: ng, gio: '08:15', nguon: 'Đăng nhập', chuoi, diem: cfg.diemNgay, thuong: [10, 20, 30].includes(chuoi) ? '1' : '' }); }
    const daNhan = [10, 20, 30].filter((m) => chuoi >= m && cfg['m' + m]).map((m) => ({ nguon: 'STREAK_' + m, nguonTen: '', giaTri: cfg['m' + m], trangThai: 'AVAILABLE', hetHan: new Date(Date.now() + cfg.hanNgay * 864e5).toISOString() }));
    return { homNay, thang: homNay.slice(0, 7), chuoi, chuoiDaiNhat: chuoi, soNgay: lichMau.length, lich: lichMau, daNhan, daDiemDanhHomNay: false,
      sapDat: [10, 20, 30].filter((m) => chuoi < m && cfg['m' + m]).map((m) => ({ moc: m, giaTri: cfg['m' + m], conLai: m - chuoi })), diem: { soDu: lichMau.length * cfg.diemNgay }, trongChuongTrinh: true };
  }
  window.DDUI = { trang, dangTai, loi, chuaDangNhap, chucMung, mau, theLe };
})();
