/* ===== KHÁCH HÀNG · HỆ THỐNG · CẤU HÌNH ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt } = A;


  /* ---------------- NHẬT KÝ HOẠT ĐỘNG – gộp Git (nội dung website) + Sheet (đơn, khách, tài khoản) ---------------- */
  async function veNhatKy(el) {
    el.innerHTML = A.dangTai('nhật ký');
    const ds = [];
    const loi = [];
    /* Thao tác nghiệp vụ ghi ở Google Sheet */
    try {
      const d = await A.api('nhatKy', {});
      if (d && d.ok && d.ds) d.ds.forEach((x) => ds.push({ ngay: x.ngay, nguoi: '—', muc: x.muc, viec: x.thayDoi, chiTiet: x.banGhi, loai: 'sheet' }));
      else if (d && d.msg) loi.push(d.msg);
    } catch (e) { loi.push(e.message); }
    /* Thay đổi nội dung website ghi trong lịch sử Git */
    try {
      const r = await fetch(`https://api.github.com/repos/${A.REPO}/commits?per_page=40&t=${Date.now()}`,
        A.ghToken() ? { headers: { Authorization: 'Bearer ' + A.ghToken() } } : {});
      if (r.ok) (await r.json()).forEach((c) => ds.push({
        ngay: new Date(c.commit.author.date).toLocaleString('vi-VN'),
        nguoi: c.commit.author.name, muc: 'Website', viec: c.commit.message.split('\n')[0], link: c.html_url, loai: 'git',
        luc: new Date(c.commit.author.date).getTime() }));
      else loi.push('Không đọc được lịch sử Git (' + r.status + ')');
    } catch (e) { loi.push(e.message); }

    const gio = (x) => { if (x.luc) return x.luc; const m = String(x.ngay).match(/(\d{2})\/(\d{2})\/(\d{4})[^\d]*(\d{2}):(\d{2})/); return m ? new Date(`${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}`).getTime() : 0; };
    ds.sort((a, b) => gio(b) - gio(a));

    el.innerHTML = `<div class="card">
      <p class="muted">Gộp hai nguồn: thao tác trên <b>đơn hàng, khách hàng, tài khoản</b> (lưu ở Google Sheet)
      và thay đổi <b>nội dung website</b> (lưu trong lịch sử phiên bản).</p>
      ${loi.length ? `<div class="box-note">${loi.map(esc).join('<br>')}</div>` : ''}
      ${ds.length ? `<div class="tbl-wrap"><table><thead><tr><th>Thời gian</th><th>Mục</th><th>Nội dung</th><th>Người thực hiện</th><th></th></tr></thead><tbody>
        ${ds.slice(0, 120).map((x) => `<tr>
          <td data-nhan="Thời gian">${esc(x.ngay)}</td>
          <td data-nhan="Mục">${A.badge(x.muc, x.loai === 'git' ? '' : 'tag--ok')}</td>
          <td data-nhan="Nội dung">${esc(x.viec)}${x.chiTiet ? `<br><small class="muted">${esc(x.chiTiet)}</small>` : ''}</td>
          <td data-nhan="Người">${esc(x.nguoi)}</td>
          <td class="num">${x.link ? `<a class="btn btn--ghost btn--sm" href="${esc(x.link)}" target="_blank" rel="noopener">Xem ↗</a>` : ''}</td></tr>`).join('')}
      </tbody></table></div>` : A.trong('Chưa có hoạt động nào', 'Nhật ký sẽ ghi lại khi có thao tác.', '📜')}
      <p class="muted mt-8">Xem lịch sử nội dung đầy đủ kèm so sánh và khôi phục ở mục <a href="#/phien-ban">Phiên bản & xem thử</a>.</p></div>`;
  }

  /* ---------------- CẤU HÌNH ---------------- */
  const TAB_CH = [['github', '🔑 Kết nối GitHub'], ['chung', '🏪 Thông tin shop'], ['van-chuyen', '🚚 Vận chuyển'], ['thanh-toan', '💳 Thanh toán'], ['bao-mat', '🔒 Bảo mật']];
  function veCauHinh(el, sub) {
    const tab = sub || 'github';
    el.innerHTML = `<div class="card"><div class="tabs2">${TAB_CH.map(([k, t]) => `<a class="tab2 ${k === tab ? 'is-on' : ''}" href="#/cau-hinh/${k}">${t}</a>`).join('')}</div><div id="chBody"></div></div>`;
    const b = $('#chBody');

    if (tab === 'github') b.innerHTML = `
      <h3>Kết nối GitHub</h3>
      <p class="muted">Trang quản trị ghi thay đổi thẳng vào mã nguồn website trên GitHub. Mã này chỉ lưu trên máy này, không nằm trong mã nguồn.</p>
      <ol class="huong-dan">
        <li>Vào <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com → Fine-grained token</a></li>
        <li><b>Repository access</b> → Only select repositories → chọn <b>${A.REPO}</b></li>
        <li><b>Permissions</b> → Repository permissions → <b>Contents: Read and write</b></li>
        <li>Generate token → copy mã <code>github_pat_…</code> → dán xuống dưới</li>
      </ol>
      <div class="row row-2"><label>Mã GitHub<input type="password" id="inGh" placeholder="github_pat_..." autocomplete="off"></label>
      <div class="row__nut"><button class="btn btn--primary" id="btnLuuGh">Lưu mã</button><button class="btn btn--ghost" id="btnXoaGh">Xoá mã</button></div></div>
      <div class="divider"></div>
      <h3>Khoá đọc số liệu</h3><p class="muted">Phải khớp với <code>var ADMIN_KEY</code> trong Apps Script.</p>
      <div class="row row-2"><label>Khoá quản trị<input id="inKey2" value="${esc(A.adminKey())}"></label>
      <div class="row__nut"><button class="btn btn--primary" id="btnKey2">Lưu khoá</button></div></div>`;

    const C = () => (A.D.CAUHINH = A.D.CAUHINH || {});
    const gt = (k, md) => { const o = C(); return o[k] !== undefined ? o[k] : (md !== undefined ? md : SITE[k]); };

    if (tab === 'chung') b.innerHTML = `
      <h3>Thông tin shop</h3><p class="muted">Sửa xong bấm <b>Xuất bản</b> ở thanh trên để khách nhìn thấy.</p>
      <div class="row row-2">
        <label>Tên website<input data-ch="name" value="${esc(gt('name'))}"></label>
        <label>Khẩu hiệu<input data-ch="slogan" value="${esc(gt('slogan'))}"></label>
        <label>Hotline hiển thị<input data-ch="hotline" value="${esc(gt('hotline'))}"></label>
        <label>Hotline dạng gọi<input data-ch="hotlineTel" value="${esc(gt('hotlineTel'))}"><small class="hint">VD: +84967233003</small></label>
        <label>Email<input data-ch="email" value="${esc(gt('email'))}"></label>
        <label>Link Zalo<input data-ch="zalo" value="${esc(gt('zalo'))}"></label>
        <label>Địa chỉ<input data-ch="address" value="${esc(gt('address'))}"></label>
        <label>Giờ làm việc<input data-ch="workingHours" value="${esc(gt('workingHours'))}"></label>
        <label>Tên pháp nhân<input data-ch="company" value="${esc(gt('company'))}"></label>
        <label>Mã số thuế<input data-ch="taxCode" value="${esc(gt('taxCode', ''))}"></label>
      </div>
      <h4>Mạng xã hội <span class="muted">— để trống thì ẩn biểu tượng</span></h4>
      <div class="row row-4">
        ${['facebook', 'instagram', 'youtube', 'tiktok'].map((k) => `<label>${k[0].toUpperCase() + k.slice(1)}<input data-ch="${k}" value="${esc(gt(k, ''))}"></label>`).join('')}
      </div>`;

    if (tab === 'van-chuyen') b.innerHTML = `
      <h3>Phí vận chuyển</h3>
      <div class="row row-3">
        <label>Nội thành Hà Nội (đ)<input type="number" data-ch2="shipping.noiThanhGia" value="${(SITE.shipping || {}).noiThanhGia || 0}"></label>
        <label>Mức tối thiểu tỉnh khác (đ)<input type="number" data-ch2="shipping.toiThieu" value="${(SITE.shipping || {}).toiThieu || 0}"></label>
        <label>Hoả tốc Hà Nội (đ)<input type="number" data-ch="expressFee" value="${gt('expressFee')}"></label>
      </div>
      <div class="row row-2">
        <label>Miễn phí ship cho đơn từ (đ)<input type="number" data-ch="freeshipFrom" value="${gt('freeshipFrom')}"></label>
        <label>Đơn vị vận chuyển<input value="${esc((SITE.shipping || {}).hang || '')}" disabled></label>
      </div>
      <div class="box-note">Tỉnh khác tính theo bảng giá ${esc((SITE.shipping || {}).hang || 'GHN')} theo cân nặng và vùng,
      nhưng không thấp hơn mức tối thiểu ở trên. Bảng giá chi tiết sửa trong <code>js/data.js</code>.</div>`;

    if (tab === 'thanh-toan') b.innerHTML = `
      <h3>Thanh toán</h3>
      <div class="row row-2">
        <label>Ngân hàng<input data-ch2="bank.name" value="${esc((SITE.bank || {}).name || '')}"></label>
        <label>Mã ngân hàng (BIN)<input data-ch2="bank.bin" value="${esc((SITE.bank || {}).bin || '')}"><small class="hint">Dùng tạo mã VietQR. BIDV = 970418.</small></label>
        <label>Số tài khoản<input data-ch2="bank.account" value="${esc((SITE.bank || {}).account || '')}"></label>
        <label>Chủ tài khoản<input data-ch2="bank.holder" value="${esc((SITE.bank || {}).holder || '')}"><small class="hint">In hoa không dấu, VD: DO VAN HOANG</small></label>
      </div>
      <div class="tbl-wrap"><table><thead><tr><th>Hình thức</th><th>Trạng thái</th></tr></thead><tbody>
        <tr><td>Thanh toán khi nhận hàng (COD)</td><td>${A.badge('Đang bật', 'tag--ok')}</td></tr>
        <tr><td>Chuyển khoản / VietQR</td><td>${A.badge('Đang bật', 'tag--ok')}</td></tr>
        <tr><td>VNPay / MoMo / ZaloPay</td><td>${A.badge('Chưa bật', 'tag--off')}</td></tr>
      </tbody></table></div>
      <div class="box-note">Ví điện tử cần máy chủ riêng để nhận kết quả thanh toán — nhắn Claude khi anh/chị muốn bật.</div>`;

    if (tab === 'bao-mat') b.innerHTML = `
      <h3>Bảo mật</h3>
      <div class="box-note box-note--red"><b>Mật khẩu đăng nhập trang này nằm trong mã nguồn website</b> nên ai xem mã nguồn cũng đọc được.
      Nó chỉ là lớp che cho đỡ bấm nhầm, không phải bảo vệ thật.</div>
      <p>Thứ thật sự bảo vệ shop là <b>mã GitHub</b> — mã này chỉ nằm trên máy này, không nằm trong mã nguồn.
      Không có mã đó thì người lạ đăng nhập được cũng <b>không sửa được gì</b>, và cũng không xem được doanh thu (phần đó cần khoá riêng trong Apps Script).</p>
      <ul class="huong-dan">
        <li>Đừng dán mã GitHub trên máy lạ, máy công cộng.</li>
        <li>Nghi mã bị lộ → vào GitHub xoá token cũ, tạo token mới, dán lại ở tab Kết nối GitHub.</li>
        <li>Phiên đăng nhập tự hết sau 8 giờ không dùng.</li>
      </ul>
      <div class="box-note">⚙️ <b>Phase 8–9:</b> chuyển mật khẩu admin sang Google Sheet (hash + salt như tài khoản khách),
      thêm giới hạn số lần nhập sai, và ghi lại lịch sử đăng nhập.</div>`;
  }

  /* Ghi vào khối CAUHINH (đè lên SITE) – giữ nguyên ghi chú trong js/data.js */
  function thuCauHinh(el) {
    const C = (A.D.CAUHINH = A.D.CAUHINH || {});
    const k = el.dataset.ch, k2 = el.dataset.ch2;
    if (k) { const v = el.type === 'number' ? Number(el.value) || 0 : el.value; C[k] = v; A.doiDuLieu(); return; }
    if (k2) { const [a, b2] = k2.split('.'); C[a] = C[a] || {}; C[a][b2] = el.type === 'number' ? Number(el.value) || 0 : el.value; A.doiDuLieu(); }
  }
  document.addEventListener('input', (e) => { if (e.target.dataset.ch || e.target.dataset.ch2) thuCauHinh(e.target); });

  document.addEventListener('click', (e) => {
    if (e.target.id === 'btnLuuGh') { const v = $('#inGh').value.trim(); if (!v) return; localStorage.setItem('hck_gh_token', v); $('#inGh').value = ''; A.toast('Đã lưu mã GitHub trên máy này', 'ok'); A.kiemTraGh(); A.thongBao(); return; }
    if (e.target.id === 'btnXoaGh') { localStorage.removeItem('hck_gh_token'); A.toast('Đã xoá mã khỏi máy này'); A.kiemTraGh(); A.thongBao(); return; }
    if (e.target.id === 'btnKey2') { localStorage.setItem('hck_admin_key', $('#inKey2').value.trim()); A.toast('Đã lưu khoá', 'ok'); return; }
  });

  A.dangKy({ route: '/nhat-ky', ten: 'Nhật ký hoạt động', icon: '📜', nhom: 'he-thong', quyen: 'setting.view', mo: 'Thao tác trên đơn hàng và khách hàng', ve: veNhatKy });
  A.dangKy({ route: '/cau-hinh', ten: 'Cấu hình', icon: '⚙️', nhom: 'cau-hinh', quyen: 'setting.view', mo: 'Kết nối, thông tin shop, bảo mật',
    ve(el, { sub }) { veCauHinh(el, sub); } });
})();
