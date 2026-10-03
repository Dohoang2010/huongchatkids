/* ===== KHÁCH HÀNG · HỆ THỐNG · CẤU HÌNH ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, fmt } = A;


  /* ---------------- NGƯỜI DÙNG & PHÂN QUYỀN ---------------- */
  function veNguoiDung(el) {
    el.innerHTML = `<div class="card"><h3>Người dùng quản trị</h3>
      <div class="tbl-wrap"><table><thead><tr><th>Tên</th><th>Tài khoản</th><th>Vai trò</th><th>Trạng thái</th></tr></thead><tbody>
        <tr><td><b>Chủ shop</b></td><td><code>adminhck</code></td><td>${A.badge('Quản trị cao nhất', 'tag--ok')}</td><td>${A.badge('Đang hoạt động', 'tag--ok')}</td></tr>
      </tbody></table></div>
      <div class="box-note">⚙️ <b>Sẽ bổ sung ở Phase 8:</b> thêm tài khoản cho nhân viên, mỗi người một mật khẩu riêng (hash lưu trong Google Sheet),
      khoá/mở tài khoản, bắt buộc đổi mật khẩu lần đầu.</div></div>`;
  }
  function veQuyen(el) {
    const V = A.VAI_TRO;
    el.innerHTML = `<div class="card"><h3>Vai trò & phân quyền</h3>
      <p class="muted">Vai trò quyết định menu nào hiện ra và nút nào bấm được.</p>
      <div class="tbl-wrap"><table><thead><tr><th>Vai trò</th><th>Quyền</th></tr></thead><tbody>
        ${Object.keys(V).map((k) => `<tr><td><b>${esc(V[k].ten)}</b><br><small class="muted">${esc(k)}</small></td>
        <td>${V[k].quyen.map((q) => A.badge(q)).join(' ')}</td></tr>`).join('')}
      </tbody></table></div>
      <div class="box-note">⚙️ <b>Sẽ bổ sung ở Phase 8:</b> gán vai trò cho từng tài khoản và cho Apps Script kiểm tra quyền phía máy chủ
      (hiện phần quyền mới chỉ ẩn/hiện giao diện).</div></div>`;
  }

  /* ---------------- NHẬT KÝ HOẠT ĐỘNG (dùng lịch sử Git) ---------------- */
  async function veNhatKy(el) {
    el.innerHTML = A.dangTai('nhật ký');
    try {
      const r = await fetch(`https://api.github.com/repos/${A.REPO}/commits?per_page=40&t=${Date.now()}`,
        A.ghToken() ? { headers: { Authorization: 'Bearer ' + A.ghToken() } } : {});
      if (!r.ok) throw new Error('Không đọc được lịch sử (' + r.status + ')');
      const ds = await r.json();
      el.innerHTML = `<div class="card">
        <p class="muted">Mỗi lần xuất bản là một bản ghi trong lịch sử website. Bấm “Xem” để thấy chính xác đã đổi những gì.</p>
        <div class="tbl-wrap"><table><thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Nội dung thay đổi</th><th></th></tr></thead><tbody>
        ${ds.map((c) => { const d = new Date(c.commit.author.date);
          return `<tr><td>${d.toLocaleString('vi-VN')}</td><td>${esc(c.commit.author.name)}</td>
          <td>${esc(c.commit.message.split('\n')[0])}</td>
          <td class="num"><a class="btn btn--ghost btn--sm" href="${esc(c.html_url)}" target="_blank" rel="noopener">Xem ↗</a></td></tr>`; }).join('')}
        </tbody></table></div>
        <div class="box-note">⚙️ <b>Sẽ bổ sung ở Phase 7–8:</b> nút “Khôi phục bản này” ngay trong trang, so sánh hai phiên bản cạnh nhau,
        và ghi thêm thao tác không đụng tới mã nguồn (đổi trạng thái đơn, khoá khách…) vào một sheet nhật ký riêng.</div></div>`;
    } catch (e) { el.innerHTML = A.loiTai(e.message); }
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

    if (tab === 'chung') b.innerHTML = `
      <h3>Thông tin shop</h3>
      <div class="row row-2">
        <label>Tên website<input value="${esc(SITE.name)}" disabled></label>
        <label>Khẩu hiệu<input value="${esc(SITE.slogan || '')}" disabled></label>
        <label>Hotline<input value="${esc(SITE.hotline)}" disabled></label>
        <label>Email<input value="${esc(SITE.email)}" disabled></label>
        <label>Địa chỉ<input value="${esc(SITE.address)}" disabled></label>
        <label>Zalo<input value="${esc(SITE.zalo)}" disabled></label>
      </div>
      <div class="box-note">⚙️ <b>Sẽ mở khoá sửa ở Phase 8</b> (cần đánh dấu khối <code>SITE</code> trong <code>js/data.js</code> để ghi đè an toàn).
      Hiện muốn đổi thì nhắn Claude.</div>`;

    if (tab === 'van-chuyen') b.innerHTML = `
      <h3>Phí vận chuyển</h3>
      <div class="tbl-wrap"><table><thead><tr><th>Nơi nhận</th><th class="num">Phí</th></tr></thead><tbody>
        <tr><td>Nội thành Hà Nội</td><td class="num">${fmt((SITE.shipping || {}).noiThanhGia || SITE.shipFee)}</td></tr>
        <tr><td>Tỉnh/thành khác</td><td class="num">theo bảng giá ${esc((SITE.shipping || {}).hang || 'GHN')}, tối thiểu ${fmt((SITE.shipping || {}).toiThieu || 0)}</td></tr>
        <tr><td>Hoả tốc nội thành Hà Nội</td><td class="num">${fmt(SITE.expressFee)}</td></tr>
        <tr><td>Đơn từ ${fmt(SITE.freeshipFrom)}</td><td class="num">Miễn phí</td></tr>
      </tbody></table></div>
      <div class="box-note">⚙️ <b>Sẽ mở khoá sửa ở Phase 8.</b></div>`;

    if (tab === 'thanh-toan') b.innerHTML = `
      <h3>Thanh toán</h3>
      <div class="tbl-wrap"><table><thead><tr><th>Hình thức</th><th>Trạng thái</th><th>Thông tin</th></tr></thead><tbody>
        <tr><td>Thanh toán khi nhận hàng (COD)</td><td>${A.badge('Đang bật', 'tag--ok')}</td><td>—</td></tr>
        <tr><td>Chuyển khoản / VietQR</td><td>${A.badge('Đang bật', 'tag--ok')}</td><td>${esc((SITE.bank || {}).name)} · ${esc((SITE.bank || {}).account)} · ${esc((SITE.bank || {}).holder)}</td></tr>
        <tr><td>VNPay / MoMo / ZaloPay</td><td>${A.badge('Chưa bật', 'tag--off')}</td><td>Cần đăng ký với nhà cung cấp và có máy chủ nhận callback</td></tr>
      </tbody></table></div>
      <div class="box-note">⚙️ <b>Sẽ mở khoá sửa ở Phase 8.</b> Riêng ví điện tử cần máy chủ riêng để nhận kết quả thanh toán — em sẽ tư vấn khi anh/chị cần.</div>`;

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

  document.addEventListener('click', (e) => {
    if (e.target.id === 'btnLuuGh') { const v = $('#inGh').value.trim(); if (!v) return; localStorage.setItem('hck_gh_token', v); $('#inGh').value = ''; A.toast('Đã lưu mã GitHub trên máy này', 'ok'); A.kiemTraGh(); A.thongBao(); return; }
    if (e.target.id === 'btnXoaGh') { localStorage.removeItem('hck_gh_token'); A.toast('Đã xoá mã khỏi máy này'); A.kiemTraGh(); A.thongBao(); return; }
    if (e.target.id === 'btnKey2') { localStorage.setItem('hck_admin_key', $('#inKey2').value.trim()); A.toast('Đã lưu khoá', 'ok'); return; }
  });

  A.dangKy({ route: '/nguoi-dung', ten: 'Người dùng', icon: '🧑‍💼', nhom: 'he-thong', quyen: 'setting.view', mo: 'Tài khoản quản trị', giaiDoan: 8, ve: veNguoiDung });
  A.dangKy({ route: '/phan-quyen', ten: 'Vai trò & phân quyền', icon: '🛡️', nhom: 'he-thong', quyen: 'setting.view', mo: 'Ai được làm gì', giaiDoan: 8, ve: veQuyen });
  A.dangKy({ route: '/nhat-ky', ten: 'Nhật ký hoạt động', icon: '📜', nhom: 'he-thong', quyen: 'setting.view', mo: 'Lịch sử thay đổi website', ve: veNhatKy });
  A.dangKy({ route: '/cau-hinh', ten: 'Cấu hình', icon: '⚙️', nhom: 'cau-hinh', quyen: 'setting.view', mo: 'Kết nối, thông tin shop, bảo mật',
    ve(el, { sub }) { veCauHinh(el, sub); } });
})();
