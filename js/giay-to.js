/* Giấy tờ sản phẩm (tự công bố, kiểm nghiệm) – hiện ở bảng "Thông tin sản phẩm" trang sản phẩm (product.html).
   Mỗi mục: mã sản phẩm → [[tên giấy tờ, link Google Drive]]. Chỉ gắn công bố / kiểm nghiệm, KHÔNG gắn thư mục
   (thư mục gốc có giấy tờ riêng của nhà phân phối). Hàng thời trang / lưu niệm không hiện mục này. */
(function () {
  var d = function (id) { return 'https://drive.google.com/file/d/' + id + '/view'; };
  /* Nước ép Lotte 3 màu: hồ sơ tự công bố + phiếu kiểm nghiệm (COA) mới nhất – thư mục "UPDATE GT LOTTE 3 MÀU" */
  var LOTTE_LE = [['Tự công bố – Nước ép Lê, Hoa chuông & Hồng sâm (Lotte cam)', d('1j9HUj9j6QCXJ_E9yOl1N4SBi-kkdLOQI')], ['Kiểm nghiệm – Lotte cam (26/06/2026)', d('1a9kMZLMIrQxZDBtbaCYmuCEOMIQOF1ns')]];
  var LOTTE_NHO = [['Tự công bố – Nước ép Mận, Nho & Táo (Lotte hồng)', d('1nOIDkMVvhZKnoNmRJBoH-egx3rSBjF0I')], ['Kiểm nghiệm – Lotte hồng (26/06/2026)', d('1itUKRci2nbT-YRjqZk5n9usqZ5AO2dO4')]];
  var LOTTE_TAO = [['Tự công bố – Nước ép Táo & Củ dền (Lotte xanh)', d('1KVrC_vhKJUDsSHdZoMX79xAy4O1TcEm9')], ['Kiểm nghiệm – Lotte xanh (26/03/2026)', d('1da9SYsMK2UMuIKfNE5WZZPzpBGmx9kck')]];
  var D3K2 = [['Hồ sơ sản phẩm – Vitamin D3K2 Pure Vitality', d('1A1NsS7F69NaQJcW3sz1R1ZhP0qFwQl0B')]];
  var CANXI = [['Công bố TPCN – Canxi Calciumore', d('1e20B2pwxUNdZwoVAwX4MLy5Lnw82l5gj')], ['Công bố sản phẩm – Calciumore', d('11B1UXbkjMRLTIcyKUoOcNw164CxjFlAc')]];
  window.GIAY_TO = {
    '23660586997': LOTTE_LE,                     // Lotte cam
    '25632276959': LOTTE_NHO,                    // Lotte hồng
    '41353214697': LOTTE_TAO,                    // Lotte xanh
    '22686115682': LOTTE_LE.concat(LOTTE_NHO, LOTTE_TAO), // Lotte organic (3 vị)
    'combo-lottexanh-d3k2': LOTTE_TAO.concat(D3K2),
    '42878618667': D3K2,                           // Vitamin D3K2 Pure Vitality
    '26060839019': CANXI,                          // váng sữa canxi Calciumore
    'combo-vangsua-d3k2': CANXI.concat(D3K2),
    '22644617070': [['Công bố – Nước hồng sâm táo lê', d('1nHFLxBPYGt3M1jLIdb3X1nhbIlB_c7x1')], ['Công bố – Nước hồng sâm việt quất nho', d('1MgwNxK8jpwYmhHbhxNoybfclUXMIoQGp')]],   // hồng sâm ChuChu
    '26156646705': [['Tự công bố – Lộc nhung (gạc Sumo)', d('11Udd6KVfbBdhzqF31tUFsctbE5r2Hpy2')], ['Kiểm nghiệm gạc Sumo', d('11mTRcwk3_apGvACcXx3mJLb1Cjk3OTvd')]],
    'gac-canxi-sumo': [['Tự công bố – Gạc canxi', d('1BUuD82ufxPC2CWO0G-eHXNVECao2AnZa')], ['Phiếu kiểm nghiệm gạc canxi', d('1aTM4B6cGAvVSCDE3lI7hDaMR_QToLMrW')], ['Kiểm nghiệm gạc canxi (Hàn Quốc)', d('1GeDg89Suhd9Vwm5WNLun48CwWhGr5rug')], ['Thông báo thay đổi bao bì gạc canxi', d('1ypQbfNnRDRG_7W-UYa53dB2Bfh6GKu7T')]],
    '57413220644': [['Hồ sơ sản phẩm – Mặt nạ thạch lô hội CURE', d('1DxT5dZMer27LAw894NbGwEurmp-eo5DI')]],
    '48112514210': [['Hồ sơ sản phẩm – Super Collagen Alpha', d('1xTnzJM8bauG3NzDcItQFtybEcOTW4A63')], ['Giấy tờ sản phẩm – Collagen', d('1u78GGb1mrWu2R3AFmrApuT8AiFdk47No')], ['Kiểm nghiệm dinh dưỡng collagen', d('1aKxE3K7tbVQyIyh9ARfQGv9sBCvXk69R')]],
    'hexacare': [['Phiếu công bố mỹ phẩm – Hexacare Soothing (dịu nhẹ)', d('1Ax4Z_7F5iyNccMTRvsTToZEQULCCM_hW')], ['Phiếu công bố mỹ phẩm – Hexacare Extra-Gentle', d('1lhQ-Vxf-rjiRYHbzHQGx-1Js9nfvEM32')], ['Phiếu công bố mỹ phẩm – Hexacare Regulating (điều tiết)', d('1_gbjKMYn9rK6jKZQfS69MrP1PU3ugvTr')], ['Phiếu công bố mỹ phẩm – Hexacare bé gái 3–12 tuổi', d('1SWqP6cn-Nodl8Co8vtxF01El2_WFzcwI')]],
    'muoi-xuyen-tieu': [['Bản tự công bố – Muối xuyên tiêu', d('1YeK5z2JeQ-CLVx4X27rI8hNlsvY4PpjR')], ['Phiếu kiểm nghiệm – Muối xuyên tiêu', d('1eyzLFZdN_nRQ1zy-5UYvYnsVZJUK3cbH')]],
    'ngu-coc-bap-thien-ma-kitea': [['Hồ sơ công bố – Bột thiên ma (ngũ cốc bắp Kitea)', d('1kX03GxWjjJ9-F1f6UEn3JtZVZBB6ERSn')]],
    'lotte-hau-an': [['Tự công bố – Nước uống Bareun Mokjang Lactic (Lotte Háu Ăn)', d('1rb0x3yLKeQzhiwphZFECzEu79INSWY_b')], ['Bảng thành phần, hàm lượng vitamin', d('1vdFrzcpC1vfK-dWYDWpwPWrfdcLz4gng')]],
    '41002695070': [['Công bố – Rong biển tẩm gia vị Sung Gyung 300g, 500g', d('1tycZUrNeZJ3h0Dh-T4qaCWG2HRywUpqL')]],   // rong vụn Sung Gyung
    '56857599724': [['Phiếu công bố mỹ phẩm – Bột đánh trắng răng Akiko', d('17x51-vXVBqyvPoRMpJmajlefTxL0rBeO')]],
    'hiskin-micellar': [['Phiếu công bố mỹ phẩm – Hiskin Cleansing Micellar Water', 'img/giay-to/hiskin-micellar-cong-bo.pdf']],
    'men-sysy': [['Hồ sơ công bố – Men Sysy nâu', d('1g2ieGmkDIBvhOmt1--L4PXCx7BOQ5l_5')], ['Hồ sơ công bố – Men Sysy xanh', d('1VDnvPXcEcRjr5iFR5BvT0Rj4UXHX2AQA')]],
  };
})();

/* Nút "Xem chi tiết" (data-giay-to = mã sản phẩm): mở cửa sổ xem giấy tờ ngay trên web (bản xem trước của Google Drive) */
document.addEventListener('click', function (e) {
  var nut = e.target.closest('[data-giay-to]'); if (!nut) return;
  var ds = (window.GIAY_TO || {})[nut.getAttribute('data-giay-to')] || []; if (!ds.length) return;
  var tuyetDoi = function (u) { return new URL(u, location.href).href; };
  /* Drive: bản xem trước của Drive; PDF trên web: trình xem Google (điện thoại Android không hiện PDF trong khung) */
  var xem = function (u) { return /drive\.google\.com/.test(u) ? u.replace(/\/view$/, '/preview') : 'https://docs.google.com/viewer?embedded=true&url=' + encodeURIComponent(tuyetDoi(u)); };
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var o = document.createElement('div'); o.className = 'gt-lop'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Giấy tờ sản phẩm');
  o.innerHTML = '<div class="gt-hop"><div class="gt-dau"><b>Giấy tờ sản phẩm</b><button type="button" class="gt-dong" aria-label="Đóng">✕</button></div>' +
    (ds.length > 1 ? '<div class="gt-tab">' + ds.map(function (x, i) { return '<button type="button" data-gt-i="' + i + '" class="' + (i ? '' : 'is-on') + '">' + esc(x[0]) + '</button>'; }).join('') + '</div>' : '<div class="gt-tab"><button type="button" class="is-on">' + esc(ds[0][0]) + '</button></div>') +
    '<iframe class="gt-khung" src="' + xem(ds[0][1]) + '" title="Giấy tờ sản phẩm" allow="autoplay"></iframe>' +
    '<a class="gt-mo" href="' + tuyetDoi(ds[0][1]) + '" target="_blank" rel="noopener">Mở toàn màn hình ↗</a></div>';
  document.body.appendChild(o); document.body.style.overflow = 'hidden';
  var dong = function () { o.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', phim); };
  var phim = function (ev) { if (ev.key === 'Escape') dong(); };
  document.addEventListener('keydown', phim);
  o.addEventListener('click', function (ev) {
    if (ev.target === o || ev.target.closest('.gt-dong')) return dong();
    var t = ev.target.closest('[data-gt-i]'); if (!t) return;
    var x = ds[Number(t.getAttribute('data-gt-i'))];
    o.querySelectorAll('[data-gt-i]').forEach(function (b) { b.classList.toggle('is-on', b === t); });
    o.querySelector('.gt-khung').src = xem(x[1]); o.querySelector('.gt-mo').href = tuyetDoi(x[1]);
  });
});
