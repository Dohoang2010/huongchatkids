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
    'hexacare': [['Phiếu công bố mỹ phẩm – Hexacare Soothing (dịu nhẹ)', d('1Ax4Z_7F5iyNccMTRvsTToZEQULCCM_hW')], ['Phiếu công bố mỹ phẩm – Hexacare Extra-Gentle', d('1lhQ-Vxf-rjiRYHbzHQGx-1Js9nfvEM32')], ['Phiếu công bố mỹ phẩm – Hexacare Regulating (điều tiết)', d('1_gbjKMYn9rK6jKZQfS69MrP1PU3ugvTr')]],
    'hexacare-be-gai': [['Phiếu công bố mỹ phẩm – Hexacare bé gái 3–12 tuổi', d('1SWqP6cn-Nodl8Co8vtxF01El2_WFzcwI')]],
    'muoi-xuyen-tieu': [['Bản tự công bố – Muối xuyên tiêu', d('1YeK5z2JeQ-CLVx4X27rI8hNlsvY4PpjR')], ['Phiếu kiểm nghiệm – Muối xuyên tiêu', d('1eyzLFZdN_nRQ1zy-5UYvYnsVZJUK3cbH')]],
    'ngu-coc-bap-thien-ma-kitea': [['Hồ sơ công bố – Bột thiên ma (ngũ cốc bắp Kitea)', d('1kX03GxWjjJ9-F1f6UEn3JtZVZBB6ERSn')]],
    'lotte-hau-an': [['Tự công bố – Nước uống Bareun Mokjang Lactic (Lotte Háu Ăn)', d('1rb0x3yLKeQzhiwphZFECzEu79INSWY_b')], ['Bảng thành phần, hàm lượng vitamin', d('1vdFrzcpC1vfK-dWYDWpwPWrfdcLz4gng')]],
    '41002695070': [['Công bố – Rong biển tẩm gia vị Sung Gyung 300g, 500g', d('1tycZUrNeZJ3h0Dh-T4qaCWG2HRywUpqL')]],   // rong vụn Sung Gyung
    '56857599724': [['Phiếu công bố mỹ phẩm – Bột đánh trắng răng Akiko', d('17x51-vXVBqyvPoRMpJmajlefTxL0rBeO')]],
    'hiskin-micellar': [['Phiếu công bố mỹ phẩm – Hiskin Cleansing Micellar Water', 'img/giay-to/hiskin-micellar-cong-bo.pdf']],
    'avca-body-tone-up': [['Hồ sơ công bố – AVCA Body Tone-Up Serum', d('16VgNDpOb7fgB5-7PGm1avTVf09RKbLWb')], ['Giấy chứng nhận lưu hành tự do (CFS)', d('1Xo_Tj37pKs2UVyLd4I0m3_AcU2nxK2Hm')]],
    '28902157429': [['Hồ sơ công bố – Men Arravite tím nhạt', d('1CMs5KxWK6Jvr8q1_BaEPpvGMa6NgHcWn')], ['Hồ sơ công bố – Men Arravite tím đậm', d('1baL2A4PRbFobmSppMcbz1JajemyBcYkj')], ['Phiếu kiểm nghiệm – Men 10 tỷ lợi khuẩn', d('1tH7retWrFDEStG7sNAiEhhd67h39YOkL')]],   // men phụ khoa Arravite
    '27734205778': [['Hồ sơ công bố – Kem chống nắng Hiskin', d('14FAjmcSe9J-y0ghuyKpymYT_uvMPdW-M')], ['Thông tin sản phẩm Hiskin', d('1O7auvkLH8324ddJ3o41skV6q9Irx64Gx')]],
    /* ---- Thư mục tổng "GT SẢN PHẨM HCG" (29/10/2026) ---- */
    'cap-kem-nen-eclat': [['Hồ sơ công bố – Éclat du Teint After Care Sun Cream', d('1bX_k19W5DHkaCPAqNq_piZIc1GpMcYmy')], ['Hồ sơ công bố – Glow Pot No.17 Max Mirror BB', d('1mUwbqU97IB9toQGZET7-Xx9z8tP_ARZT')]],
    '45462512687': [['Hồ sơ công bố – Rong biển trộn cơm', d('1nPCsT1jNNZDLyJXygJeU8d4YrkJn3A_3')]],   // rong biển Busan
    '49061985399': [['Công bố – Nghệ 365 Plus', d('10RkZt066vYyVn9j47CH-Lf2UB13JF7cL')], ['Kết quả thử nghiệm – Nghệ tép', d('1C_f42crqJgiTphPZtXzZgVsAzBezihLu')]],
    '28467224687': [['Hồ sơ công bố – Táo đỏ Hoàng gia', d('1kAyO_2H7gXorIz8MJsg39ycose-4rItb')], ['Kiểm định – Táo đỏ Hoàng gia', d('1YBFmrjyby9fm702T9_PaEwtgV9LkLqZ8')]],
    '26523206270': [['Hồ sơ công bố – Sữa Norco', d('1lFvPQVwYrQk2Z-0ShEm-EJXYAf_xCaKF')], ['Kiểm nghiệm – Sữa nước Norco', d('1sfP23_KTynyRMF33JQIC7-ucTNUVmNXV')], ['Đính chính hạn sử dụng – Sữa Norco', d('1_enCaZtMPJyEp-20SEHJEgmrWsSMWJmn')]],
    '13899935993': [['Hồ sơ công bố – Lotte Kid Dê 760g', d('132pOglbMO0Gcap4rpQo80dhPjJqeAOyv')], ['Kiểm nghiệm – Lotte Kid Goat A+ (COA)', d('1cowT-pO1fzrLzGH2E8Ys2Kc6HQX6i2BK')]],
    '19682441455': [['Hồ sơ công bố – Biostime Dê số 1', d('1M7LgvFQl---ZhUuBxfFJthVjKpZeSjzW')], ['Hồ sơ công bố – Biostime Dê số 2', d('1ZDxWF3EujfuYab9h9vYSQBZgNGwm0frN')], ['Hồ sơ công bố – Biostime Dê số 3', d('1aN052ZueCDmUS3q31rJok9P4DM30TjqQ')], ['Kiểm nghiệm – Dê số 1', d('1QzrFmdOnlNFSJIB9HvQJndW2gvwRwLjY')], ['Kiểm nghiệm – Dê số 2', d('1xZ-DqiD8N4_IJctuFXZwqdCPj7_7Jpnv')], ['Kiểm nghiệm – Dê số 3', d('1x77i-UEQ-GO6Qa9sA6pPJlpOF2U0d1bH')]],
    '57903449970': [['Phiếu công bố – Cell Happy Co Inorganic Tone-up Sun Cream', d('1zoF2sRT6VNMqxFPYdEPwP0iMDLNDx52r')], ['Kiểm nghiệm SPF – Cell Happy Co', d('1EsZy12wc3uiffT_melW21sy6HcJ2bz9A')]],
    '27355720019': [['Tự công bố – Nước hồng sâm Kid', d('1Qw-yIaKEnLKVu5UebM3BgqxluO3s0Qd9')]],
    '51013054442': [['Hồ sơ công bố – Grace By Chera Snow White Tone-Up Booster', d('1ysfPXz_ighCfmzI9aAsyBh0vcrjZDksQ')]],
    '24767149051': [['Bản công bố – Pure NMN 12000mg+', d('1lTbFz0nSYaoJaPEtKis-7aESwQqWaDvk')], ['Phiếu kiểm nghiệm – NMN Pure', d('1t43-S_vqrspMN4vuCPyzAzzMFUeIRz-5')], ['Giấy chứng nhận lưu hành tự do (CFS) – NMN Pure', d('1ZZOzqdG_wS8mryWxlZTapo7oHvX55wad')], ['Công bố – NMN Regene', d('1kY4j-YBDyTldzLfa1oyW9i17KcElQyu4')], ['Phiếu kiểm nghiệm – NMN Regene', d('1Xo7Mk4CYf0mexkgkAn-wrMmkSbWip2aG')]],
    '57556697426': [['Hồ sơ công bố – Lip Explosion (filler không tiêm)', d('1ZtMazNydB84wVjuPtHBkaAtsyg80EBwX')]],
    '24015142248': [['Giấy phép lưu hành – Hyalu C+ Tinh chất làm trắng, căng bóng', d('1UcMIhV8R-FN4Lk5MK1kT6xmQQTd18g_1')]],
    'drvita-ecm-serum': [['Phiếu công bố – DayCell Dr.Vita ECM Serum', d('1iomp2baGHoGOJM1D4EJfmRBf3N4q4QdO')], ['Báo cáo thử nghiệm kích ứng da', d('1xvYd8vP3sN8tHF-z1PzkpZgJObOrhau6')]],
    'daycell-nad-white-cream': [['Phiếu công bố – DayCell Medi Lab NAD+ White Cream', d('19Z2uXWpMIH5vIsC3rrrUj1GQxAmLQcM6')], ['Báo cáo thử nghiệm kích ứng da', d('1O-AqIuCkyo4KHAF0T0PeMPEB5tkZOyFs')]],
    '24764883120': [['Công bố – Peel Anubis', d('1A9IVoqyczmxycaAKjZ2XMm1nmSIRtNIJ')], ['Giấy công bố – Peel Anubis', d('1ObveHPX4jlSNM7Uo5Nm5xn-BjKAzr08P')]],
    '24015583018': [['Công bố – Mặt nạ NMN', d('1gTGvbTtBKVgQnvMtYHJYMEKDOYYjDoHk')]],
    '26800350417': [['Giấy phép lưu hành – Hyalu C+ Kem dưỡng', d('1vEPrZST0zDHfTsXoGLIBZ8I1Nx1FuBOG')]],
    '25678530796': [['Công bố – The Concentrate Smoothing & Plumping (tím)', d('1CKIOePXVLMA8dDIXES8tWNfkZCt1tiCA')], ['Công bố – The Concentrate Illuminator & Rebalancing (xanh)', d('1_LcjgmeNIqWGKe-80L49s09UdeDeTicy')], ['Công bố – Dermo-Active Cream (đen)', d('15Pdc2x_4VwIgh6XyWUnLcLxSoih9CwuN')], ['Công bố – The Cream Soothing & Restorative (vàng)', d('1S0b7NtO_MU96hBXzy-oW06gndVx6A7Wi')]],
    '29006040615': [['Hồ sơ công bố – Meso Fill serum Fill&Peel', d('1uONrpaF3nXrA4Uzr-ZTLYO_EP7i0HoHL')], ['Hồ sơ công bố – Meso Fill kem Plump&Lift', d('13L-DW65D0chk9b7tY_JDCLv3uAgyBi_2')]],
    '27809051612': [['Hồ sơ công bố – Arganicare Biotin Shampoo', d('1OjI3wZKC5HFZ5bb1p9kUKGJda6-aSCJH')], ['Hồ sơ công bố – Arganicare Biotin Conditioner', d('1PRDxYGdSMl8w6V9uhSZoQsst8-81PpRX')], ['Giấy chứng nhận lưu hành tự do (CFS)', d('1YUgxi4B3hZfcZe_8DogAYHksU7jUnImL')], ['Kiểm nghiệm dầu gội', d('12n8MJ97cbdtJtS9k7L2Q6YVFIOmhaokp')]],
    '24329101823': [['Phiếu công bố – Meso Fill kem chống nắng SPF50', d('1AVLRLIoACnHXbmJUofzNYyttualpxIDk')], ['Phiếu công bố – Sữa rửa mặt Double Cleansing 2 in 1', d('15jC56oSjB5Rs57YjwNH-MStgw81T6pMS')], ['Phiếu công bố – Meso Fill kem mắt', d('1h8rkIsz55rPNOqJXSxB4M7Mmg4dd-Jex')]],   // combo Meso vàng
    '26900366084': [['Giấy phép lưu hành – Hyalu C+ Kem dưỡng', d('1vEPrZST0zDHfTsXoGLIBZ8I1Nx1FuBOG')], ['Giấy phép lưu hành – Hyalu C+ Tinh chất', d('1UcMIhV8R-FN4Lk5MK1kT6xmQQTd18g_1')], ['Giấy phép lưu hành – Hyalu C+ Dung dịch cân bằng (toner)', d('1geJkyqauzOPnGXTsOxV1E5FlR2pdkrmC')]],
    '28806784125': [['Công bố – Retinol Dream', d('12UmmAjACaWDWKGzc98zQE_6jzdvLuFGq')], ['Công bố – 3D Eye Cream', d('1-wdgOmDUmUcJBjVWPtYDV_bVf6wOHtZJ')], ['Giấy chứng nhận lưu hành tự do', d('1IqbX2jRJCU6WH9dM4mNvc--SGvw1ubVO')]],
    'suaxanh-lotte': [['Hồ sơ tự công bố – Sữa Pasteur Organic', d('1Tzt_2p6jnAnOtDFU3Aiz3DfSZNdHi9tR')], ['Phiếu kiểm nghiệm', d('13OJ2Yz7chUZHfTLvB-OZzO-iLyBlfe84')], ['Chứng nhận hữu cơ – nhà máy Pasteur', d('1QH67ZapPF8sFLdSldf_F0YK44gegIQ6T')]],
    'mien-ga-cf': [['Tự công bố – Miến gà', d('11JziccowLxVJf7GntD_q_ZmrsdePvSyf')]],
    'bo-xuyen-tieu': [['Tự công bố – Bò xuyên tiêu', d('1EA6EHN7wAOTc4DjEQPmlPrSZ2tq0Y_IT')], ['Giấy kiểm nghiệm', d('1RYtYnIhgLmAj4gkZeIbrCkzgGKQnnSZr')], ['Kết quả kiểm nghiệm', d('1OGFy6dNtbI7Rarljy5f7AbbOBwq2pR7o')]],
    'lon-den-khoi-mo': [['Hồ sơ tự công bố – Lợn đen khói mơ Vua Đỉnh Vị', d('10TnqxWU8Mv8YAei_by0dqy0-dW7RVEaM')]],
    'goi-xa-boryeong-mud': [['Công bố – Dầu gội bùn khoáng MUD+', d('1GLBzR6vgj6yenXYR6YEUkKnbiHkjQx0T')], ['Công bố – Dầu xả bùn khoáng MUD+', d('1IHyds8csjHAepXd1r7hXpXvfcXowXLVW')], ['Báo cáo kiểm nghiệm – Viện Nghiên cứu & Thử nghiệm Hàn Quốc', d('1SUL-18W7PA3pXX_KwFyyA-XoiW8_CGLI')], ['Giấy chứng nhận lưu hành tự do (CFS)', d('1jMX2lgPACUkasZZPbKTALQzDGObQ9_Yh')]],
    'com-vang-noi-oi': [['Hồ sơ pháp lý – Cơm vàng Nội Ơi', d('1L4bCF0Naa_CuhKwKAkEc9Ng1kkOtO49a')]],
    '43532388498': [['Hồ sơ pháp lý – Ngũ cốc Fuwasaku Trái cây & Hạt', d('1TjTcFYbNuH7UQiSkW1mLUv_h9MmBTlpa')]],   // granola Fuwa-Saku
    'com-chay-phomai': [['Tự công bố – Cơm nướng cháy cạnh vị Phô mai', d('1qUSvOedvz2ypNGtp0i_CZt2jECI3nnE-')], ['Tự công bố – Cơm sấy vị BBQ', d('1B7Z5y_TKixp8ipZf0LdPfz7cfGueEz5m')], ['Kiểm nghiệm – Cơm sấy vị BBQ', d('1dPr1hNRY4Wqi02OjU866UBTQvIqlCvdf')]],   // cơm cháy phô mai & BBQ
    'zinc-purevitality': [['Giấy tiếp nhận đăng ký bản công bố – Pure Vitality Zinc (Cục ATTP)', 'img/giay-to/kem-zinc-pure-vitality.pdf']],
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

/* Tổ chức chịu trách nhiệm về hàng hóa (đứng tên công bố / nhập khẩu) – đọc từ hồ sơ công bố ngày 29/10/2026.
   Hương Chất Kids là đơn vị phân phối. Sản phẩm không có ở đây → "Theo nhãn phụ và hồ sơ công bố" (product.html). */
(function () {
  var HOAN = 'Công ty TNHH Đầu tư Xuất nhập khẩu Hoan TT', TY = 'Công ty TNHH Dịch vụ và Thương mại TY', D3 = 'Công ty CP Đầu tư Thương mại 3DO',
    NEMOS = 'Công ty TNHH Nemos Việt Nam', THAIAN = 'Công ty TNHH Công nghệ và Thương mại Thái An', KOVI = 'Công ty TNHH XNK và Thương mại Nhật Minh Kovi',
    HSH = 'Công ty TNHH Xuất nhập khẩu HSH Thăng Long', GBS = 'Công ty CP Xuất nhập khẩu và Phân phối Global Beauty Solutions', ZION = 'Công ty TNHH Zion and The Beauty Vietnam',
    VJ = 'Công ty TNHH V&J Partner', VIKOTRA = 'Công ty CP Thương mại Vikotra', FOODS1 = 'Công ty CP Foods 1 Việt Nam', DAILONG = 'Công ty CP Sản xuất và Thương mại Đại Long';
  window.CHIU_TRACH_NHIEM = {
    '23660586997': VIKOTRA, '25632276959': VIKOTRA, '41353214697': VIKOTRA, '22686115682': VIKOTRA, 'combo-lottexanh-d3k2': VIKOTRA + ' (nước ép) · ' + TY + ' (D3K2)',   // nước ép Lotte 3 màu: hồ sơ mới 2026
    '42878618667': TY, 'zinc-purevitality': TY, '26060839019': D3, 'combo-vangsua-d3k2': D3 + ' (váng sữa) · ' + TY + ' (D3K2)',
    '48112514210': D3, '57413220644': D3, '41002695070': D3, '22644617070': HSH, '24015583018': HSH,
    '26156646705': GBS, 'gac-canxi-sumo': GBS, 'avca-body-tone-up': 'Công ty TNHH Sản xuất Đầu tư và Thương mại Dịch vụ Nguyệt Phong',
    '28902157429': HOAN, 'men-sysy': HOAN, '26523206270': HOAN, '13899935993': HOAN, '19682441455': HOAN, '27355720019': HOAN,
    '27734205778': NEMOS, 'hiskin-micellar': NEMOS, '24764883120': NEMOS, '25678530796': NEMOS, '28806784125': NEMOS,
    'ngu-coc-bap-thien-ma-kitea': KOVI, 'drvita-ecm-serum': KOVI, 'daycell-nad-white-cream': KOVI,
    '56857599724': 'Công ty TNHH Đầu tư Thương mại và Du lịch Phúc Khang', 'hexacare': 'Công ty CP Hexa Vietnam', 'hexacare-be-gai': 'Công ty CP Hexa Vietnam',
    'muoi-xuyen-tieu': FOODS1, 'bo-xuyen-tieu': FOODS1, 'lotte-hau-an': VJ, 'suaxanh-lotte': VJ,
    'cap-kem-nen-eclat': ZION, '51013054442': ZION, '45462512687': 'Công ty CP Xuất nhập khẩu Thực phẩm Quyên Điệp',
    '49061985399': 'Công ty CP Thương mại và Đầu tư Quốc tế Hayoon Korea', '28467224687': 'Công ty TNHH Tinh Hoa MSC',
    '57903449970': 'Công ty TNHH JV Global', '24767149051': 'Công ty CP Clastive Nhật Việt',
    '24015142248': THAIAN, '26800350417': THAIAN, '26900366084': THAIAN, '29006040615': THAIAN, '24329101823': THAIAN,
    '27809051612': 'Công ty CP Thương mại Tổng hợp 18', 'mien-ga-cf': 'Công ty CP Thực phẩm và Thương mại CF',
    'lon-den-khoi-mo': 'Hộ kinh doanh Trần Thị Yến', 'goi-xa-boryeong-mud': 'Công ty CP Kinh doanh Thương mại Cara',
    'com-vang-noi-oi': DAILONG, 'com-chay-phomai': DAILONG + ' (vị phô mai) · Công ty TNHH TM-DV-SX Thực phẩm Nhật Quỳnh (vị BBQ)',
    '43532388498': 'Công ty TNHH Thực phẩm Aqua Meat',
  };
})();
