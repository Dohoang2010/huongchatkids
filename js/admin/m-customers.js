/* ===== THÀNH VIÊN – danh sách, lọc theo hạng/nhóm, chi tiết, khoá/mở ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt, ngayISO } = A;

  const S = { q: '', hang: '', nhom: '', trang: 1, moiTrang: 20 };
  let data = null;

  const NHOM = [
    { k: '', t: 'Tất cả khách' },
    { k: 'moi', t: 'Khách mới (chưa mua)' },
    { k: 'thuong', t: 'Khách thường (1–2 đơn)' },
    { k: 'vip', t: 'Khách VIP (đã lên hạng)' },
    { k: 'lau', t: 'Lâu không mua (>90 ngày)' },
  ];
  function thuocNhom(k, x) {
    if (!k) return true;
    if (k === 'moi') return (x.soDon || 0) === 0;
    if (k === 'thuong') return (x.soDon || 0) >= 1 && (x.soDon || 0) <= 2;
    if (k === 'vip') return x.hang && x.hang !== 'moi';
    if (k === 'lau') {
      if (!x.donGanNhat) return false;
      const m = String(x.donGanNhat).match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (!m) return false;
      return Date.now() - new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime() > 90 * 864e5;
    }
    return true;
  }

  async function veDS(el) {
    el.innerHTML = A.dangTai('danh sách khách hàng');
    try {
      const d = await A.api('khachHang', { key: A.adminKey(), q: S.q, hang: S.hang });
      if (!d || !d.ok) { el.innerHTML = d && d.msg ? A.loiTai(d.msg) : chuaCo(); return; }
      if (!d.ds) { el.innerHTML = chuaCo(); return; }
      data = d; veBang(el, d);
    } catch (e) { el.innerHTML = A.loiTai(e.message); }
  }

  const chuaCo = () => `<div class="card err-box"><h3>⏳ Apps Script chưa có phần khách hàng</h3>
    <p>Dán lại <code>tools/apps-script-CUA-SHOP.gs</code> vào Apps Script rồi
    <b>Deploy → Manage deployments → ✏️ → New version → Deploy</b>.</p>
    <button class="btn btn--primary" data-act="tai-lai">Thử lại</button></div>`;

  function veBang(el, d) {
    const all = d.ds.filter((x) => thuocNhom(S.nhom, x));
    const tong = all.length;
    S.trang = Math.min(S.trang, Math.max(1, Math.ceil(tong / S.moiTrang)));
    const slice = all.slice((S.trang - 1) * S.moiTrang, S.trang * S.moiTrang);
    const tongTien = d.ds.reduce((s, x) => s + x.tongChiTieu, 0);
    const vip = d.ds.filter((x) => x.hang && x.hang !== 'moi').length;
    $('#pageAct').innerHTML = `${A.co('customer.update') ? '<button class="btn btn--primary" id="khCRM" title="Khách cũ đã từng mua của shop: cộng các đơn trước đây trong CRM vào tổng chi tiêu và tự lên hạng">🔄 Cập nhật chi tiêu từ CRM</button>' : ''}<button class="btn btn--ghost" id="khXuat">⭳ Xuất Excel</button>`;

    el.innerHTML = `
      <div class="kpis">
        ${A.the('Tổng khách hàng', d.tong, 'có hồ sơ trong hệ thống')}
        ${A.the('Khách đã lên hạng', vip, `${d.tong ? Math.round(vip / d.tong * 100) : 0}% tổng số`, 'kpi--teal')}
        ${A.the('Tổng chi tiêu', fmt(tongTien), 'gồm cả đơn mua trước đây (CRM)', 'kpi--pink')}
        ${A.the('Chi tiêu TB/khách', fmt(d.tong ? tongTien / d.tong : 0), '')}
      </div>
      <div class="card">
        <div class="tool">
          <div class="tool__tim"><input id="khQ" placeholder="Tìm tên hoặc số điện thoại…" value="${esc(S.q)}" autocomplete="off"></div>
          <select id="khHang"><option value="">Mọi hạng</option>${(window.TIERS || []).map((t) => `<option value="${esc(t.key)}" ${S.hang === t.key ? 'selected' : ''}>${t.icon} ${esc(t.label)}</option>`).join('')}</select>
          <select id="khNhom">${NHOM.map((n) => `<option value="${n.k}" ${S.nhom === n.k ? 'selected' : ''}>${n.t}</option>`).join('')}</select>
        </div>
        ${tong ? `<div class="tbl-wrap"><table>
          <thead><tr><th>Khách hàng</th><th>Địa chỉ</th><th class="num">Số đơn</th><th class="num">Đã chi tiêu</th><th>Hạng</th><th>Đơn gần nhất</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>${slice.map((x) => `<tr>
            <td><a href="#/thanh-vien/${esc(x.sdt)}"><b>${esc(x.ten || '(chưa có tên)')}</b></a><br><small class="muted">${esc(x.sdt)}</small></td>
            <td data-nhan="Địa chỉ">${esc([x.diaChi, x.xa, x.tinh].filter(Boolean).join(', ') || '—')}</td>
            <td class="num" data-nhan="Số đơn">${x.soDon}</td>
            <td class="num" data-nhan="Tổng chi tiêu"><b>${fmt(x.tongChiTieu)}</b></td>
            <td>${A.badge(x.hangLabel, x.hang === 'moi' ? '' : 'tag--ok')}</td>
            <td data-nhan="Đơn gần nhất">${esc(x.donGanNhat || '—')}</td>
            <td>${x.khoa ? A.badge('Đã khoá', 'tag--no') : A.badge('Bình thường', 'tag--ok')}</td>
            <td class="num"><a class="btn btn--ghost btn--sm" href="#/thanh-vien/${esc(x.sdt)}">Chi tiết</a></td>
          </tr>`).join('')}</tbody></table></div>
          ${A.phanTrang(tong, S.trang, S.moiTrang, 'kh-pg')}`
          : A.trong('Không có khách nào', 'Thử bỏ bớt bộ lọc xem sao.', '👥')}
      </div>`;
  }

  /* ---------------- Chi tiết khách ---------------- */
  async function veChiTiet(el, sdt) {
    el.innerHTML = A.dangTai('hồ sơ khách hàng');
    try {
      const d = await A.api('khachChiTiet', { key: A.adminKey(), sdt });
      if (!d || !d.ok) { el.innerHTML = d && d.msg ? A.loiTai(d.msg) : chuaCo(); return; }
      const k = d.kh; const tier = (window.TIERS || []).find((t) => t.key === k.hang) || {};
      const sau = (window.TIERS || []).find((t) => t.min > (k.tongChiTieu || 0));
      $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#/thanh-vien">← Danh sách</a>
        <a class="btn btn--ghost" href="tel:${esc(k.sdt)}">📞 Gọi</a>
        ${A.co('points.view') ? `<a class="btn btn--ghost" href="#/gioi-thieu/diem/${esc(k.sdt)}">⭐ Điểm & giới thiệu</a>` : ''}
        <button class="btn ${d.khoa ? 'btn--primary' : 'btn--red'}" data-khoa="${esc(k.sdt)}" data-tt="${d.khoa ? '0' : '1'}">${d.khoa ? 'Mở khoá tài khoản' : 'Khoá tài khoản'}</button>`;

      el.innerHTML = `
        <div class="grid-2">
          <div class="card"><h3>👤 Thông tin</h3>
            <div class="kh-row"><span>Họ tên</span><b>${esc(k.ten || '(chưa có)')}</b></div>
            <div class="kh-row"><span>Điện thoại</span><b>${esc(k.sdt)}</b></div>
            <div class="kh-row"><span>Email</span><b>${esc(k.email || '—')}</b></div>
            <div class="kh-row"><span>Địa chỉ</span><b>${esc([k.diaChi, k.xa, k.tinh].filter(Boolean).join(', ') || '—')}</b></div>
            <div class="kh-row"><span>Đơn gần nhất</span><b>${esc(k.donGanNhat || '—')}</b></div>
            <div class="kh-row"><span>Trạng thái</span><b>${d.khoa ? A.badge('Đã khoá', 'tag--no') : A.badge('Bình thường', 'tag--ok')}</b></div>
          </div>
          <div class="card"><h3>🏅 Hạng & chi tiêu</h3>
            <div class="kpis" style="grid-template-columns:1fr 1fr">
              ${A.the('Đã chi tiêu', fmt(k.tongChiTieu), 'gồm cả đơn mua trước đây (CRM)', 'kpi--pink')}
              ${A.the('Số đơn đã mua', k.soDon, '')}
            </div>
            <div class="hang-box"><span class="hang-badge" style="--c:${esc(tier.color || '#78909C')}">${tier.icon || ''} ${esc(k.hangLabel || '')}</span>
              ${tier.discount ? `<b>Đang được giảm ${tier.discount}% mọi đơn</b>` : '<b>Chưa có chiết khấu</b>'}</div>
            ${sau ? `<div class="tien-do"><i style="width:${Math.min(100, Math.round((k.tongChiTieu || 0) / sau.min * 100))}%"></i></div>
              <p class="muted">Còn <b>${fmt(Math.max(0, sau.min - (k.tongChiTieu || 0)))}</b> nữa là lên hạng ${sau.icon} ${esc(sau.label)} (giảm ${sau.discount}%)</p>`
              : '<p class="muted">Đang ở hạng cao nhất.</p>'}
          </div>
        </div>
        <div class="card"><h3>🧾 Lịch sử đơn hàng (${(d.donHang || []).length})</h3>
          ${(d.donHang || []).length ? `<div class="tbl-wrap"><table><thead><tr><th>Mã đơn</th><th>Thời gian</th><th>Sản phẩm</th><th class="num">Tổng</th><th>Thanh toán</th><th>Trạng thái</th></tr></thead><tbody>
            ${d.donHang.map((o) => `<tr><td><b>${esc(o.ma)}</b></td><td>${esc(o.ngay)}</td>
              <td>${esc(String(o.sanPham || '').split('\n').filter(Boolean).join(' · '))}</td>
              <td class="num">${fmt(o.tong)}</td><td>${esc(o.thanhToan)}</td>
              <td>${A.badge(o.trangThai || 'Chờ xác nhận', /huỷ|hoàn/i.test(o.trangThai) ? 'tag--no' : 'tag--ok')}</td></tr>`).join('')}
          </tbody></table></div>` : '<p class="muted">Khách chưa có đơn nào.</p>'}</div>`;
      if (A.veBaoMatKhach) { const bm = document.createElement('div'); bm.className = 'card'; el.appendChild(bm); A.veBaoMatKhach(bm, k.sdt); }
    } catch (e) { el.innerHTML = A.loiTai(e.message); }
  }

  /* ---------------- Sự kiện ---------------- */
  const timTre = A.tre(() => { S.trang = 1; A.veTrang(); }, 420);
  document.addEventListener('input', (e) => { if (e.target.id === 'khQ') { S.q = e.target.value; timTre(); } });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'khHang') { S.hang = e.target.value; S.trang = 1; return A.veTrang(); }
    if (e.target.id === 'khNhom') { S.nhom = e.target.value; S.trang = 1; return A.veTrang(); }
  });
  document.addEventListener('click', async (e) => {
    const pg = e.target.closest('[data-kh-pg]'); if (pg) { S.trang = Number(pg.dataset.khPg); return A.veTrang(); }
    if (e.target.id === 'khXuat') return xuat();
    if (e.target.id === 'khCRM') return dongBoCRM(e.target);
    const kb = e.target.closest('[data-khoa]');
    if (kb) {
      const khoa = kb.dataset.tt === '1';
      const ok = await A.hoi({ tieuDe: khoa ? 'Khoá tài khoản khách?' : 'Mở khoá tài khoản?',
        noiDung: khoa ? 'Khách sẽ không đăng nhập xem hồ sơ được nữa (vẫn đặt hàng bình thường).' : 'Khách đăng nhập lại được.',
        nutOk: khoa ? 'Khoá' : 'Mở khoá', nguyHiem: khoa });
      if (!ok) return;
      try {
        const r = await A.api('khoaKhach', { key: A.adminKey(), sdt: kb.dataset.khoa, khoa: khoa ? '1' : '0' });
        if (!r || !r.ok) { A.toast((r && r.msg) || 'Không đổi được', 'err'); return; }
        A.toast(khoa ? 'Đã khoá tài khoản' : 'Đã mở khoá', 'ok'); A.veTrang();
      } catch (err) { A.toast(err.message, 'err'); }
    }
  });

  /* Cộng các đơn đã mua trong CRM vào tổng chi tiêu + hạng của mọi thành viên (máy chủ chạy theo lượt ~20 giây, tự gọi tiếp) */
  async function dongBoCRM(nut) {
    nut.disabled = true; const chu = nut.textContent;
    const tong = { xem: 0, doi: 0, lenHang: 0, loi: 0, ds: [] };
    try {
      let tu = 0;
      for (;;) {
        nut.textContent = `⏳ Đang cập nhật… ${tong.xem}${data ? '/' + data.tong : ''}`;
        const r = await A.api('dongBoChiTieuKH', { key: A.adminKey(), tu }, 60000);
        if (!r || !r.ok) { A.toast((r && r.msg) || 'Chưa cập nhật được', 'err'); break; }
        tong.xem += r.xem; tong.doi += r.doi; tong.lenHang += r.lenHang; tong.loi += r.loi; tong.ds.push(...(r.ds || []));
        if (r.tiep == null) {
          await A.hoi({ tieuDe: '✅ Đã cập nhật chi tiêu từ CRM', nutOk: 'Xong', noiDung: `Đã xem <b>${tong.xem}</b> khách · cập nhật <b>${tong.doi}</b> khách · <b>${tong.lenHang}</b> khách lên hạng${tong.loi ? ` · ${tong.loi} khách CRM chưa trả lời (bấm lại sau)` : ''}.${tong.ds.length ? '<br><br>' + tong.ds.slice(0, 20).map((x) => `• ${esc(x.ten || x.sdt)}: ${esc(x.tu)} → <b>${esc(x.len)}</b> (${fmt(x.tong)})`).join('<br>') : ''}` });
          break;
        }
        tu = r.tiep;
      }
    } catch (err) { A.toast(err.message, 'err'); }
    nut.disabled = false; nut.textContent = chu; A.veTrang();
  }

  function xuat() {
    if (!data) return;
    const cot = ['Điện thoại', 'Họ tên', 'Tỉnh/Thành', 'Xã/Phường', 'Địa chỉ', 'Email', 'Số đơn', 'Tổng chi tiêu', 'Hạng', 'Đơn gần nhất'];
    const dong = data.ds.map((x) => [x.sdt, x.ten, x.tinh, x.xa, x.diaChi, x.email, x.soDon, x.tongChiTieu, x.hangLabel, x.donGanNhat]);
    const csv = '﻿' + [cot, ...dong].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `khach-hang-${ngayISO(new Date())}.csv`; a.click();
    A.toast('Đã xuất file Excel (CSV)', 'ok');
  }

  A.dangKy({ route: '/thanh-vien', ten: 'Thành viên', icon: '👤', nhom: 'khach-hang', quyen: 'customer.view',
    mo: 'Khách hàng, hạng và lịch sử mua',
    ve(el, { sub }) { return sub ? veChiTiet(el, sub) : veDS(el); } });
})();
