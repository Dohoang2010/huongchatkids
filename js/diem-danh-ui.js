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
  /* Trang chính – gọn trong 1 màn hình máy tính: thanh đầu 1 hàng, lịch bên trái, chuỗi + quà bên phải,
     lịch sử và thể lệ gập lại (bấm để mở). Dữ liệu từ máy chủ, hoặc dữ liệu minh hoạ khi xem trước. */
  function trang(d, cfg, opts = {}) {
    cfg = cfg || d.cauHinh || {};
    const daXong = d.daDiemDanhHomNay, dangChay = d.trongChuongTrinh !== false && cfg.bat !== false;
    const nut = !dangChay ? '<button class="btn ddq-nut" type="button" disabled>Chương trình đang tạm dừng</button>'
      : daXong ? '<button class="btn ddq-nut is-xong" type="button" disabled>✓ Hôm nay đã điểm danh</button>'
      : `<button class="btn ddq-nut" type="button" ${opts.xemTruoc ? 'disabled' : 'data-dd-nut'}>Điểm danh nhận +${so(cfg.diemNgay)} điểm</button>`;
    const K = (v) => (v >= 1000 && v % 1000 === 0 ? v / 1000 + 'K' : tien(v));
    const quaChip = [cfg.ngayDoi ? `<span>🎁 Ngày đôi <b>${K(cfg.ngayDoi)}</b></span>` : '', ...[10, 20, 30].filter((m) => cfg['m' + m]).map((m) => `<span>🔥 ${m} ngày <b>${K(cfg['m' + m])}</b></span>`)].join('');
    const soLs = (d.lich || []).length;
    return `${opts.xemTruoc ? '<div class="ddp-xt">👁️ Xem trước – dữ liệu minh hoạ, chưa lưu</div>' : ''}
      <div class="ddq" style="--dd:${mauHop(cfg.mau)}">
        <div class="ddq-dau"><span class="ddq-dau__ic" aria-hidden="true">${esc(cfg.icon || '📅')}</span>
          <div class="ddq-dau__tx"><h1>${esc(cfg.ten || 'Điểm danh mỗi ngày')}</h1><p>${daXong ? '🎉 Mẹ đã điểm danh hôm nay – quay lại ngày mai nhé!' : dangChay ? `Mỗi ngày đăng nhập nhận <b>${so(cfg.diemNgay)} điểm</b> · 1.000 điểm = 1.000đ` : 'Chương trình đang tạm dừng'}</p></div>
          <div class="ddq-diem"><small>Điểm hiện có</small><b>${so((d.diem || {}).soDu)}</b></div>${nut}</div>
        <div class="ddq-cot">
          <div class="ddq-trai">${lich(d, cfg)}
            <div class="ddq-mo"><details><summary>🗓️ Lịch sử điểm danh tháng này (${soLs})</summary>${lichSu(d)}</details>
              <details><summary>📜 Thể lệ chương trình</summary>${theLeKhoi(cfg)}</details></div>
          </div>
          <div class="ddq-phai">
            ${quaChip ? `<div class="ddq-qua">${quaChip}</div>` : ''}
            ${tienDo(d, cfg)}${thuong(d)}
          </div>
        </div>
      </div>`;
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
  /* =====================================================================
     LỊCH ĐIỂM DANH MINI – gắn trực tiếp vào trang (không cần sang diem-danh.html)
     DDUI.mini(el, { che: 'storefront' | 'account', sauDiemDanh(r) })
     - storefront: lịch + nút + trạng thái + tóm tắt quà, KHÔNG hiện số dư điểm
     - account   : thêm tổng điểm, chuỗi, tiến độ mốc, voucher đã nhận trong tháng
     Mọi số liệu lấy từ máy chủ (ddTongQuan / ddDiemDanh); chưa đăng nhập chỉ đọc cấu hình công khai (ddCauHinh).
     ===================================================================== */
  const homNayVN = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
  function luoiMini(d, cfg) {
    const thang = d.thang, homNay = d.homNay, [y, m] = thang.split('-').map(Number), dau = thang + '-01';
    const soNgay = new Date(Date.UTC(y, m, 0)).getUTCDate(), thu = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
    const daDD = {}; (d.lich || []).forEach((x) => { daDD[x.ngay] = x; });
    const o = [];
    for (let i = thu; i > 0; i--) { const ng = congNgay(dau, -i); o.push(`<span class="ddm-o ddm-o--ngoai" aria-hidden="true">${Number(ng.slice(8))}</span>`); }
    for (let i = 0; i < soNgay; i++) {
      const ng = congNgay(dau, i), x = daDD[ng], nay = ng === homNay, doi = ng.slice(5, 7) === ng.slice(8, 10) && !!cfg.ngayDoi;
      const nhan = x ? 'đã điểm danh' : nay ? 'hôm nay' : ng < homNay ? 'chưa điểm danh' : 'chưa tới';
      o.push(`<span class="ddm-o${x ? ' ddm-o--da' : ''}${nay ? ' ddm-o--nay' : ''}${!x && ng < homNay ? ' ddm-o--qua' : ''}${doi ? ' ddm-o--doi' : ''}" title="${ngayVN(ng)}: ${nhan}${doi ? ' · ngày đôi có voucher' : ''}" aria-label="Ngày ${i + 1}, ${nhan}">${x ? '<i aria-hidden="true">✓</i>' : i + 1}</span>`);
    }
    const du = (7 - (o.length % 7)) % 7; for (let i = 1; i <= du; i++) o.push(`<span class="ddm-o ddm-o--ngoai" aria-hidden="true">${i}</span>`);
    return `<div class="ddm-luoi" role="grid" aria-label="Lịch điểm danh tháng ${m}/${y}">${['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((t) => `<span class="ddm-thu">${t}</span>`).join('')}${o.join('')}</div>`;
  }
  function veMini(st) {
    const { che, d, cfg, dangNhap, dangGui, bao } = st;
    if (!cfg || cfg.bat === false) return '';
    const tk = che === 'account';
    const thangNay = homNayVN().slice(0, 7), thang = d ? d.thang : thangNay;
    const xem = d || { thang, homNay: homNayVN(), lich: [] };
    const daXong = !!(d && d.daDiemDanhHomNay), tamDung = d && d.trongChuongTrinh === false;
    const [y, m] = thang.split('-').map(Number);
    const truoc = congNgay(thang + '-01', -1).slice(0, 7), sau = congNgay(thang + '-01', 32).slice(0, 7);
    const nut = !dangNhap ? `<button type="button" class="btn btn--primary btn--block ddm-nut" data-ddm-login>Đăng nhập để điểm danh</button>`
      : !d ? '<button type="button" class="btn btn--block ddm-nut" disabled aria-busy="true"><span class="ddp-spin"></span> Đang tải…</button>'
      : tamDung ? '<button type="button" class="btn btn--block ddm-nut" disabled>Chương trình đang tạm dừng</button>'
      : daXong ? '<button type="button" class="btn btn--block ddm-nut is-xong" disabled>✓ Bạn đã điểm danh hôm nay</button>'
      : `<button type="button" class="btn btn--primary btn--block ddm-nut" data-ddm-nut ${dangGui ? 'disabled aria-busy="true"' : ''}>${dangGui ? '<span class="ddp-spin"></span> Đang điểm danh…' : `Điểm danh ngay · +${so(cfg.diemNgay)} điểm`}</button>`;
    const tomTat = !dangNhap ? `Điểm danh mỗi ngày nhận <b>${so(cfg.diemNgay)} điểm</b>${cfg.ngayDoi ? `, ngày đôi nhận voucher <b>${tien(cfg.ngayDoi)}</b>` : ''}.`
      : !d ? 'Đang tải trạng thái điểm danh của bạn…'
      : daXong ? `Hôm nay đã nhận thưởng · chuỗi <b>${so(d.chuoi)} ngày</b> liên tiếp.`
      : `Điểm danh hôm nay nhận <b>${so(cfg.diemNgay)} điểm</b>${xem.homNay.slice(5, 7) === xem.homNay.slice(8, 10) && cfg.ngayDoi ? ` + voucher ngày đôi <b>${tien(cfg.ngayDoi)}</b>` : ''}.`;
    const moc = d && [10, 20, 30].filter((x) => cfg['m' + x]);
    const nhanMoc = {}; ((d && d.daNhan) || []).forEach((v) => { nhanMoc[v.nguon] = true; });
    const ke = (d && (d.sapDat || []).find((x) => x.conLai > 0)) || null;
    return `<div class="ddm ddm--${che}" style="--dd:${mauHop(cfg.mau)}">
      <div class="ddm-dau"><span class="ddm-ic" aria-hidden="true">${esc(cfg.icon || '📅')}</span><div><h3>${tk ? 'Điểm danh hằng ngày' : 'Điểm danh nhận thưởng'}</h3><p>${tomTat}</p></div>
        ${tk && d ? `<div class="ddm-diem"><small>Điểm hiện có</small><b>${so((d.diem || {}).soDu)}</b></div>` : ''}</div>
      <div class="ddm-thang">${dangNhap ? `<button type="button" class="ddm-dh" data-ddm-thang="${truoc}" aria-label="Tháng trước">‹</button>` : '<span></span>'}<b>Tháng ${m}/${y}</b>${dangNhap ? `<button type="button" class="ddm-dh" data-ddm-thang="${sau}" ${sau > thangNay ? 'disabled' : ''} aria-label="Tháng sau">›</button>` : '<span></span>'}</div>
      ${luoiMini(xem, cfg)}
      <div class="ddm-chu"><span><i class="c-da">✓</i>Đã điểm danh</span><span><i class="c-nay"></i>Hôm nay</span>${cfg.ngayDoi ? '<span><i class="c-doi"></i>Ngày đôi</span>' : ''}</div>
      ${thang === thangNay ? nut : `<button type="button" class="btn btn--ghost btn--block ddm-nut" data-ddm-thang="${thangNay}">Về tháng này</button>`}
      ${bao ? `<p class="ddm-bao ddm-bao--${bao.kieu}" role="status">${bao.html}</p>` : ''}
      ${tk && d ? `<div class="ddm-td"><div class="ddm-td__so"><span><b>${so(d.chuoi)}</b> ngày liên tiếp</span><span><b>${so(d.chuoiDaiNhat)}</b> dài nhất</span><span><b>${so(d.soNgay)}</b> ngày tháng này</span></div>
          ${moc.length ? `<div class="ddm-moc">${moc.map((x) => `<span class="${nhanMoc['STREAK_' + x] ? 'is-on' : ''}"><b>${nhanMoc['STREAK_' + x] ? '✓' : x}</b><small>${x} ngày · ${tien(cfg['m' + x])}</small></span>`).join('')}</div>` : ''}
          ${ke ? `<p class="fs-13 text-muted">Còn <b>${ke.conLai} ngày</b> liên tiếp nữa để nhận voucher ${tien(ke.giaTri)}.</p>` : ''}
          ${(d.daNhan || []).length ? `<p class="fs-13">🎟️ Tháng này đã nhận: ${d.daNhan.map((v) => `<b>${tien(v.giaTri)}</b> (${esc(NGUON[v.nguon] || v.nguonTen)})`).join(', ')}</p>` : ''}</div>` : ''}
      ${!tk && dangNhap && ke ? `<p class="ddm-ghi">${d.chuoi ? `🔥 Chuỗi ${so(d.chuoi)} ngày – còn ${ke.conLai} ngày nữa nhận voucher ${tien(ke.giaTri)}` : `🔥 Điểm danh ${ke.moc} ngày liên tiếp để nhận voucher ${tien(ke.giaTri)}`}</p>` : ''}
      <a class="ddm-link" href="diem-danh.html">Thể lệ & lịch sử ›</a></div>`;
  }
  /* Gắn lịch mini vào phần tử. Mỗi phiên đăng nhập (token) chỉ tải 1 lần; đổi tài khoản / thoát thì tự bỏ dữ liệu cũ. */
  function mini(el, opts = {}) {
    if (!el || !window.MC) return null;
    const { DD, Session, openLogin, toast } = window.MC;
    const st = { che: opts.che === 'account' ? 'account' : 'storefront', d: null, cfg: null, dangNhap: false, dangGui: false, bao: null, thang: '', token: '' };
    const ve = () => { el.innerHTML = veMini(st); el.hidden = !el.innerHTML; };
    async function tai() {
      const s = Session.get(); st.dangNhap = !!s;
      if (!s) { st.d = null; st.token = ''; st.cfg = await DD.cauHinh(); ve(); return; }
      if (st.token && st.token !== s.token) { st.d = null; st.bao = null; }   // đổi tài khoản: không hiện dữ liệu người trước
      const tok = s.token; st.token = tok;
      if (!st.cfg) st.cfg = await DD.cauHinh();
      if (!st.d) ve();
      try {
        const r = await DD.tongQuan(st.thang);
        if (st.token !== tok) return;
        if (r && r.loi === 'token') { Session.clear(); return tai(); }
        if (!r || !r.ok) { st.bao = { kieu: 'loi', html: esc((r && r.msg) || 'Chưa tải được lịch điểm danh') + ' <button type="button" class="ddm-thu-lai" data-ddm-thu-lai>Thử lại</button>' }; ve(); return; }
        st.d = r; st.cfg = r.cauHinh || st.cfg; ve();
      } catch (e) { st.bao = { kieu: 'loi', html: esc(e.message) + ' <button type="button" class="ddm-thu-lai" data-ddm-thu-lai>Thử lại</button>' }; ve(); }
    }
    el.addEventListener('click', async (e) => {
      if (e.target.closest('[data-ddm-thu-lai]')) { st.bao = null; return tai(); }
      if (e.target.closest('[data-ddm-login]')) { const s = await openLogin(); if (s) { st.bao = null; tai(); if (opts.sauDangNhap) opts.sauDangNhap(s); } return; }
      const t = e.target.closest('[data-ddm-thang]'); if (t && !t.disabled) { st.thang = t.dataset.ddmThang === homNayVN().slice(0, 7) ? '' : t.dataset.ddmThang; st.bao = null; return tai(); }
      if (!e.target.closest('[data-ddm-nut]') || st.dangGui) return;
      if (!Session.get()) { st.dangNhap = false; return ve(); }
      st.dangGui = true; st.bao = null; ve();
      let r;
      try { r = await DD.diemDanh(); } catch (err) { r = { ok: false, msg: err.message }; }
      st.dangGui = false;
      if (r && r.loi === 'token') { Session.clear(); toast('Phiên đăng nhập đã hết hạn, mẹ đăng nhập lại nhé', { type: 'err' }); return tai(); }
      if (!r || !r.ok) { st.bao = { kieu: 'loi', html: esc((r && r.msg) || 'Chưa điểm danh được') + ' <button type="button" class="ddm-thu-lai" data-ddm-nut>Thử lại</button>' }; ve(); return; }
      const vc = (r.voucher || []).map((v) => `voucher <b>${tien(v.giaTri)}</b>`).join(', ');
      st.bao = r.moi ? { kieu: 'ok', html: `🎉 Điểm danh thành công! +${so(r.diem)} điểm${vc ? ' · nhận ' + vc + ' vào <a href="vi-voucher.html">Ví voucher</a>' : ''}` }
        : { kieu: 'ok', html: 'Bạn đã điểm danh hôm nay – hẹn bạn ngày mai nhé!' };
      st.thang = ''; await tai();
      if (opts.sauDiemDanh) opts.sauDiemDanh(r);
    });
    tai();
    return { taiLai: () => { st.bao = null; return tai(); } };
  }
  window.DDUI = { trang, dangTai, loi, chuaDangNhap, chucMung, mau, theLe, mini };
})();
