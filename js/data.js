/* =====================================================================
   DỮ LIỆU CỬA HÀNG – Hương Chất Kids
   Sản phẩm được nhập từ file Shopee (14 sản phẩm) ngày 21/09/2026. Gallery đã bỏ các ảnh Shopee chứa
   tuyên bố công dụng vượt công bố / ảnh bình luận cá nhân (xem img/README.txt).
   Ảnh, điểm đánh giá, số đánh giá, đã bán: lấy từ file xuất Shopee (12/14 sản phẩm).
   - Đổi tên thương hiệu, hotline, Zalo… tại SITE. Thêm/sửa sản phẩm tại PRODUCTS.
   - Ảnh sản phẩm: đặt file img/<mã sản phẩm Shopee>.jpg (VD: img/41002695070.jpg).
     Khi chưa có file ảnh, web tự hiện ảnh minh hoạ.
   - Bộ dữ liệu demo cũ (32 SP mẫu) được lưu tại js/data.demo.js.
   Mọi giá tính bằng VNĐ (số nguyên).
   ===================================================================== */

window.SITE = {
  name: 'Hương Chất Kids',
  logo: 'img/logo.png',               // ảnh logo (vuông); để trống sẽ dùng biểu tượng 🍼
  slogan: 'Mẹ nào cũng là siêu nhân',
  hotline: '(+84) 865.023.003',
  hotlineTel: '+84865023003',
  zalo: 'https://zalo.me/0865023003',
  zaloQr: 'img/zalo-qr.png',        // mã QR Zalo (tạo từ số hotline) hiện ở footer & modal gọi lại
  messenger: '',                      // điền link m.me/... nếu có fanpage; để trống sẽ ẩn nút Messenger
  shopee: 'https://shopee.vn/shop/837223358',
  shopeeSale: { days: [15, 25], doubleDays: true, label: 'Siêu ưu đãi ngày {d}' },  // ngày sale Shopee: 15, 25 hằng tháng + ngày đôi (1/1, 2/2 … 12/12) → nút Shopee tự gắn tag; xem trước: thêm ?demo_date=2026-09-09 vào URL
  bctUrl: '',   // điền link xác nhận trên online.gov.vn sau khi thông báo website với Bộ Công Thương → footer tự hiện logo
  address: '15 Lý Nam Đế, Hoàn Kiếm, Hà Nội',
  email: 'huongchatkids@gmail.com',
  company: 'HƯƠNG CHẤT KIDS',        // tên pháp nhân đầy đủ khi có GPKD, VD: CÔNG TY TNHH ...
  taxCode: '',                        // mã số thuế – để trống sẽ ẩn dòng MST ở footer
  freeshipFrom: 3000000,
  shipFee: 25000,
  expressFee: 35000,
  expressCities: ['Hà Nội'],            // tỉnh/thành có giao hoả tốc trong ngày
  expert: { title: 'Chuyên gia dinh dưỡng', phone: '+84392312796', display: '(+84) 392 312 796', zalo: 'https://zalo.me/0392312796' },  // gặp trực tiếp chuyên gia
  bank: { name: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)', bin: '970418', account: '8855349222', holder: 'DO VAN HOANG' },  // holder: tên chủ tài khoản in hoa không dấu (VD: NGUYEN VAN A) – hiện cạnh mã QR
  orderEndpoint: 'https://script.google.com/macros/s/AKfycbzgqygxD6zYswgL8HtoBcvWvYRTQjjejhpt7H2Sqz9LcrzHVk0zt4iKf6_7JerNSUgG/exec',  // dán link Google Apps Script (đuôi /exec) để đơn tự về Google Sheet + email + Telegram; xem README
  transferFormat: '{name}_thanhtoan_{code}',   // nội dung chuyển khoản; {name} = tên khách (không dấu, in hoa), {code} = mã đơn
  workingHours: '8:00 – 22:00 (cả T7, CN)',
  hotSearches: ['Hồng sâm ChuChu', 'Nước ép Lotte', 'Sữa Biostime', 'D3K2', 'Táo đỏ Tân Cương', 'Men vi sinh'],
  advisor: 'Dược sĩ',                 // danh xưng người tư vấn – chỉ dùng 'Dược sĩ' khi shop có dược sĩ có chứng chỉ hành nghề, nếu không đổi thành 'Chuyên viên tư vấn'
  showReviews: false,                 // true → hiện thêm mảng REVIEWS (đánh giá do shop nhập) ở trang chủ & trang sản phẩm
  flashSaleEnd: 'daily',  // 'daily' = ưu đãi trong hôm nay (đếm ngược tới 24:00, mỗi ngày tự đếm lại); hoặc đặt hạn cụ thể '2026-09-30T23:59:59+07:00' (qua ngày này countdown tự ẩn)
  facebook: '', instagram: '', youtube: '', tiktok: '',   // điền link mạng xã hội, để trống sẽ ẩn icon
};

window.AGES = [
  { key: '0-6m',   label: '0–6 tháng',  emoji: '🍼', desc: 'Sơ sinh',   color: '#FFE9EF' },
  { key: '6-12m',  label: '6–12 tháng', emoji: '🥣', desc: 'Ăn dặm',    color: '#FFF3D6' },
  { key: '1-3y',   label: '1–3 tuổi',   emoji: '🧸', desc: 'Tập đi',    color: '#E0F5F2' },
  { key: '3-6y',   label: '3–6 tuổi',   emoji: '🎨', desc: 'Mầm non',   color: '#EAF0FF' },
  { key: '6-12y',  label: '6–12 tuổi',  emoji: '🎒', desc: 'Tiểu học',  color: '#EEF8E6' },
  { key: '12-18y', label: '12–18 tuổi', emoji: '⚽', desc: 'Tuổi teen', color: '#F3E9FF' },
];

/* tpcn: true → hiện cảnh báo "không phải là thuốc" theo quy định quảng cáo TPCN. image: ảnh đại diện ô danh mục trang chủ (bỏ trống sẽ dùng icon) */
window.CATEGORIES = [
  { key: 'nuoc-ep',   label: 'Nước ép & nước dinh dưỡng', icon: '🧃', color: '#FFF3D6', desc: 'Lotte Organic – ăn ngon, tăng cân, đề kháng', tpcn: false, image: 'img/thumb/22686115682.jpg' },
  { key: 'sua',       label: 'Sữa cho bé',                icon: '🥛', color: '#EAF0FF', desc: 'Biostime, Lotte Kid A+, sữa tươi Norco', tpcn: false, image: 'img/thumb/13899935993.jpg' },
  { key: 'hong-sam',  label: 'Hồng sâm & đề kháng',       icon: '🌿', color: '#FFE9EF', desc: 'ChuChu, Rich Kid, sâm Pinkfong', tpcn: true, image: 'img/thumb/22644617070.jpg' },
  { key: 'vitamin',   label: 'Vitamin & canxi',            icon: '💊', color: '#E0F5F2', desc: 'D3K2 nhỏ giọt, canxi Calciumore', tpcn: true, image: 'img/thumb/42878618667.jpg' },
  { key: 'tang-can',  label: 'Ăn ngon, tăng cân & tiêu hoá', icon: '🍯', color: '#EEF8E6', desc: 'Gạc hươu Sumo, men vi sinh Biostime', tpcn: true, image: 'img/thumb/26156646705.jpg' },
  { key: 'rong-bien', label: 'Rong biển & ăn dặm',        icon: '🍙', color: '#FFF8E1', desc: 'Sung Gyung, Busan – rắc cơm, trộn cơm', tpcn: false, image: 'img/thumb/45462512687.jpg' },
  { key: 'thuc-pham', label: 'Thực phẩm gia đình',        icon: '🍎', color: '#FFEBEE', desc: 'Táo đỏ, kỷ tử, granola, bò sấy', tpcn: false, image: 'img/thumb/29402041000.jpg' },
  { key: 'cho-me',    label: 'Dành cho mẹ',                icon: '💆‍♀️', color: '#F3E9FF', desc: 'Nghệ nano, collagen, chăm sóc da', tpcn: true, image: 'img/thumb/49061985399.jpg' },
];

window.NEEDS = [
  { key: 'tang-chieu-cao',   label: 'Tăng chiều cao' },
  { key: 'de-khang',         label: 'Tăng đề kháng' },
  { key: 'tang-can',         label: 'Tăng cân, ăn ngon' },
  { key: 'phuc-hoi',         label: 'Phục hồi sau ốm' },
  { key: 'canxi',            label: 'Bổ sung canxi' },
  { key: 'd3k2',             label: 'Vitamin D3 K2' },
  { key: 'tieu-hoa',         label: 'Hỗ trợ tiêu hoá' },
  { key: 'vitamin-tong-hop', label: 'Bổ sung vitamin' },
  { key: 'an-dam',           label: 'Ăn dặm, trộn cơm' },
  { key: 'organic',          label: 'Hữu cơ (Organic)' },
  { key: 'cho-me',           label: 'Dành cho mẹ' },
  { key: 'sua-cong-thuc',    label: 'Sữa công thức' },
  { key: 'sua-tuoi',         label: 'Sữa tươi' },
  { key: 'tri-nao',          label: 'Phát triển trí não' },
  { key: 'an-vat',           label: 'Ăn vặt lành mạnh' },
  { key: 'lam-dep',          label: 'Làm đẹp cho mẹ' },
];

window.BRANDS = [
  { key: 'lotte',      label: 'Lotte Foods', origin: 'Hàn Quốc', color: '#E60012' },
  { key: 'chuchu',     label: 'ChuChu',      origin: 'Hàn Quốc', color: '#B5121B' },
  { key: 'calciumore', label: 'Calciumore',  origin: 'Hàn Quốc', color: '#F9A825' },
  { key: 'sumo',       label: 'Sumo Kids',   origin: 'Hàn Quốc', color: '#8D6E63' },
  { key: 'sunggyung',  label: 'Sung Gyung',  origin: 'Hàn Quốc', color: '#1B5E20' },
  { key: 'busan',      label: 'Busan',       origin: 'Hàn Quốc', color: '#00695C' },
  { key: '365plus',    label: 'Korea365',    origin: 'Hàn Quốc', color: '#EF6C00' },
  { key: 'purevitality', label: 'Pure Vitality', origin: 'New Zealand', color: '#E0A526' },
  { key: 'norco',      label: 'Norco',       origin: 'Úc',        color: '#1565C0' },
  { key: 'biostime',   label: 'Biostime',    origin: 'Úc / Pháp', color: '#1E88E5' },
  { key: 'pinkfong',   label: 'Pinkfong',    origin: 'Hàn Quốc',  color: '#EC407A' },
  { key: 'kinigini',   label: 'Kinigini',    origin: 'Hàn Quốc',  color: '#5E35B1' },
  { key: 'alpha',      label: 'Alpha',       origin: 'Đức',       color: '#8E24AA' },
  { key: 'sakuma',     label: 'Sakuma Seika', origin: 'Nhật Bản', color: '#8D6E63' },
  { key: 'hoanggia',   label: 'Hoàng Gia',   origin: 'Trung Quốc', color: '#D84315' },
  { key: 'primefood',  label: 'Prime Food',  origin: 'Trung Quốc', color: '#C62828' },
  { key: 'richfoods',  label: 'The Rich Foods', origin: 'Trung Quốc', color: '#AD1457' },
  { key: 'kimjeongmoon', label: 'Kim Jeong Moon Aloe', origin: 'Hàn Quốc', color: '#43A047' },
  { key: 'cellhappy',  label: 'Cell Happy Co', origin: 'Hàn Quốc', color: '#F06292' },
  { key: 'masterchef', label: 'MasterChef – Chef Hải', origin: 'Việt Nam', color: '#BF360C' },
  { key: 'khac',       label: 'Nhập khẩu',   origin: 'Hàn Quốc', color: '#6A1B9A' },
];

/* Menu chính (desktop mega menu + menu mobile). links: [nhãn, đường dẫn]; needs/ages: key trong NEEDS/AGES */
window.NAV = [
  { label: 'Nước ép & dinh dưỡng', link: 'collections.html?cat=nuoc-ep', columns: [
    { title: 'Dòng sản phẩm', links: [['Nước ép hoa quả & rau củ Organic', 'product.html?id=22686115682'], ['Nước ép lê & rễ cát cánh (Khoẻ Mạnh)', 'product.html?id=23660586997'], ['Nước ép mận, nho & táo (Tăng Cân)', 'product.html?id=25632276959'], ['Lotte Xanh táo & củ dền (6 tháng+)', 'product.html?id=41353214697']] },
    { title: 'Theo nhu cầu', needs: ['tang-chieu-cao', 'tang-can', 'de-khang', 'organic'] },
    { title: 'Theo độ tuổi', ages: ['6-12m', '1-3y', '3-6y', '6-12y', '12-18y'] } ] },
  { label: 'Sữa cho bé', link: 'collections.html?cat=sua', columns: [
    { title: 'Sữa công thức', links: [['Biostime SN-2 Bio Plus (Úc)', 'product.html?id=19491505209'], ['Sữa dê Biostime (Úc)', 'product.html?id=19682441455'], ['Biostime Organic (Pháp)', 'product.html?id=20992159167'], ['Sữa dê Lotte Kid A+', 'product.html?id=13899935993'], ['Sữa bò Lotte Kid A+', 'product.html?id=29210696898']] },
    { title: 'Sữa tươi', links: [['Norco nguyên kem nội địa Úc', 'product.html?id=26523206270']] },
    { title: 'Theo độ tuổi', ages: ['0-6m', '6-12m', '1-3y', '3-6y', '6-12y'] } ] },
  { label: 'Hồng sâm & đề kháng', link: 'collections.html?cat=hong-sam', columns: [
    { title: 'Sản phẩm', links: [['Hồng sâm ChuChu tăng cao & phục hồi', 'product.html?id=28254163202'], ['Hồng sâm ChuChu ăn ngon, phục hồi sau ốm', 'product.html?id=22644617070'], ['Hồng sâm Rich Kid – trí não', 'product.html?id=27355720019'], ['Sâm Organic Pinkfong Kid Up', 'product.html?id=47357633686'], ['Gạc hươu non Sumo tăng cân', 'product.html?id=26156646705']] },
    { title: 'Theo nhu cầu', needs: ['de-khang', 'phuc-hoi', 'tang-can', 'tri-nao'] },
    { title: 'Theo độ tuổi', ages: ['1-3y', '3-6y', '6-12y', '12-18y'] } ] },
  { label: 'Vitamin & canxi', link: 'collections.html?cat=vitamin', columns: [
    { title: 'Sản phẩm', links: [['Vitamin D3K2 Pure Vitality 30ml', 'product.html?id=42878618667'], ['Canxi hữu cơ Calciumore (dạng váng sữa)', 'product.html?id=26060839019'], ['Men vi sinh Biostime 28 gói', 'product.html?id=19880841223']] },
    { title: 'Theo nhu cầu', needs: ['d3k2', 'canxi', 'tieu-hoa', 'tang-chieu-cao'] },
    { title: 'Danh mục khác', links: [['Rong biển & ăn dặm', 'collections.html?cat=rong-bien'], ['Thực phẩm gia đình', 'collections.html?cat=thuc-pham'], ['Dành cho mẹ', 'collections.html?cat=cho-me']] } ] },
  { label: 'Chọn theo tuổi', ages: true },
  { label: '🔥 Flash sale', link: 'collections.html?sort=discount', hot: true },
  { label: 'Cẩm nang mẹ', link: 'blog.html' },
];

/* importer / congBo (tuỳ chọn): nhà nhập khẩu & số công bố ghi trên tem phụ – điền để hiện ở bảng thông tin.
   image: ảnh thật (img/<mã Shopee>.jpg); thumb: ảnh cắt gọn 420px dùng cho thẻ sản phẩm/giỏ/tìm kiếm. variants: phân loại từ Shopee, sắp theo giá tăng dần.
   price/oldPrice = phân loại rẻ nhất (giá "từ"). shape/color: dùng vẽ ảnh minh hoạ khi chưa có ảnh. */
window.PRODUCTS = [
  { id: "41002695070", name: "Rong Biển Vụn Ăn Liền Sung Gyung - Lựa Chọn Hoàn Hảo Cho Bữa Ăn Nhanh Gọn và Bổ Dưỡng", short: "Rong biển vụn Sung Gyung", brand: "sunggyung", cat: "rong-bien",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["an-dam", "tang-can"], price: 520000, oldPrice: 702000, rating: 4.94, reviews: 53, sold: 423, stock: 50, priority: 3,
    shape: "box", color: "#1B5E20", weight: "Gói 500g", origin: "Hàn Quốc", tags: ["Giảm sâu"],
    image: "img/41002695070.jpg", thumb: "img/thumb/41002695070.jpg", images: ["img/41002695070.jpg", "img/41002695070-2.jpg", "img/41002695070-3.jpg", "img/41002695070-4.jpg", "img/41002695070-5.jpg"], shopeeId: "41002695070", shopeeUrl: "https://shopee.vn/product/837223358/41002695070", shopeeCategory: "Thực phẩm và đồ uống › Đồ ăn vặt › Các loại rong biển ăn liền",
    variants: [{ label: "1 gói (500g)", price: 520000, oldPrice: 702000 }, { label: "2 gói", price: 1040000, oldPrice: 1404000 }, { label: "3 gói", price: 1560000, oldPrice: 2106000 }],
    desc: "Rong biển vụn ăn liền Sung Gyung – rắc cơm, cháo hoặc trộn cơm nắm cho bé. Rong biển Hàn Quốc sấy giòn, vị nhạt, giúp bữa ăn của con nhanh gọn mà vẫn bổ dưỡng.",
    highlights: ["Rong biển Hàn Quốc sấy giòn, thơm, vị nhạt phù hợp trẻ nhỏ", "Rắc cơm, cháo, cơm nắm, kimbap – bé ăn ngon hơn", "Tiện lợi cho bữa sáng và hộp cơm đi học"],
    usage: "Rắc trực tiếp lên cơm, cháo hoặc trộn cơm nắm cho bé. Đậy kín sau khi mở, bảo quản nơi khô ráo, tránh ẩm." },

  { id: "22686115682", name: "Nước Ép Lotte Hoa Quả Và Rau Củ Organic Giúp Bé Phát Triển Chiều Cao, Ăn Ngon Miệng, Tăng Cường Sức Khỏe", short: "Nước ép Lotte Organic hoa quả & rau củ", brand: "lotte", cat: "nuoc-ep",
    ages: ["1-3y", "3-6y", "6-12y", "12-18y"], needs: ["tang-chieu-cao", "tang-can", "de-khang", "organic"], price: 448000, oldPrice: 627000, rating: 4.93, reviews: 525, sold: 3000, stock: 50, priority: 3,
    shape: "box", color: "#E60012", weight: "Gói 100ml", origin: "Hàn Quốc", tags: ["Giảm sâu"],
    image: "img/22686115682.jpg", thumb: "img/thumb/22686115682.jpg", images: ["img/22686115682.jpg", "img/22686115682-3.jpg", "img/22686115682-4.jpg", "img/22686115682-5.jpg"], shopeeId: "22686115682", shopeeUrl: "https://shopee.vn/product/837223358/22686115682", shopeeCategory: "Thực phẩm và đồ uống › Đồ uống › Khác",
    variants: [{ label: "Tăng cao (Xanh) · 10 gói", price: 448000, oldPrice: 627000 }, { label: "Tăng cân (Hồng) · 10 gói", price: 448000, oldPrice: 627000 }, { label: "Đề kháng (Cam) · 10 gói", price: 448000, oldPrice: 627000 }, { label: "Tăng cao (Xanh) · Thùng 30 gói", price: 1317000, oldPrice: 1844000 }, { label: "Tăng cân (Hồng) · Thùng 30 gói", price: 1317000, oldPrice: 1844000 }, { label: "Đề kháng (Cam) · Thùng 30 gói", price: 1317000, oldPrice: 1844000 }, { label: "Mix vị · Thùng 30 gói", price: 1317000, oldPrice: 1844000 }],
    desc: "Nước ép hoa quả và rau củ hữu cơ Lotte (Hàn Quốc) dạng gói tiện lợi, vị cam “Khoẻ Mạnh” hoặc mix vị. Theo nhà sản xuất, sản phẩm bổ sung vitamin từ rau quả organic giúp bé ăn ngon miệng, hỗ trợ phát triển chiều cao và tăng cường sức khoẻ.",
    highlights: ["Nguyên liệu hoa quả & rau củ hữu cơ (Organic)", "Gói nhỏ có ống hút – tiện mang đi học, đi chơi", "Chọn vị cam “Khoẻ Mạnh” hoặc thùng mix vị"],
    usage: "Bé uống 1–2 gói/ngày, ngon hơn khi để mát. Dùng theo hướng dẫn trên bao bì." },

  { id: "42878618667", name: "Vitamin D3K2– Hỗ Trợ Phát Triển Xương Răng, Tăng Đề Kháng, Tim Mạch – Lọ 30ml", short: "Vitamin D3K2 Pure Vitality 30ml", brand: "purevitality", cat: "vitamin",
    ages: ["0-6m", "6-12m", "1-3y", "3-6y", "6-12y"], needs: ["d3k2", "tang-chieu-cao", "canxi", "de-khang"], price: 390000, oldPrice: 507000, rating: 5.0, reviews: 69, sold: 356, stock: 50, priority: 3,
    shape: "bottle", color: "#E0A526", weight: "Lọ 30ml", origin: "New Zealand", tags: ["Bán chạy"],
    image: "img/42878618667.jpg", thumb: "img/thumb/42878618667.jpg", images: ["img/42878618667.jpg", "img/42878618667-2.jpg", "img/42878618667-3.jpg", "img/42878618667-4.jpg", "img/42878618667-5.jpg"], shopeeId: "42878618667", shopeeUrl: "https://shopee.vn/product/837223358/42878618667", shopeeCategory: "Mẹ & Bé › Chăm sóc sức khỏe bé › Vitamin & Thực phẩm bổ sung",
    variants: [{ label: "1 lọ", price: 390000, oldPrice: 507000 }, { label: "2 lọ", price: 780000, oldPrice: 1014000 }],
    desc: "Vitamin D3 + K2 Pure Vitality (New Zealand) dạng nhỏ giọt 30ml, hương táo NZ. Theo nhà sản xuất, D3 hỗ trợ hấp thu canxi, K2 giúp đưa canxi vào xương, hỗ trợ phát triển xương răng và đề kháng cho bé. Có chứng nhận HACCP, GMP. Mua 2 lọ tiết kiệm hơn.",
    highlights: ["Sản xuất tại New Zealand, chứng nhận HACCP & GMP", "D3 hỗ trợ hấp thu canxi, K2 dẫn canxi vào xương", "Dạng giọt vị táo, dễ dùng cho bé từ sơ sinh"],
    usage: "Nhỏ trực tiếp vào miệng bé hoặc pha vào sữa, dùng vào buổi sáng sau ăn. Liều dùng theo hướng dẫn trên bao bì hoặc dược sĩ tư vấn." },

  { id: "45462512687", name: "Rong biển Tăng cao Busan trộn cơm Hàn Quốc, giúp bé cao lớn, bổ sung chất xơ vitamin", short: "Rong biển tăng cao Busan trộn cơm", brand: "busan", cat: "rong-bien",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["an-dam", "tang-chieu-cao", "tieu-hoa"], price: 589000, oldPrice: 795000, rating: 0.0, reviews: 0, sold: 12, stock: 50, priority: 3,
    shape: "box", color: "#00695C", weight: "Gói 40g", origin: "Hàn Quốc", tags: [],
    image: "img/45462512687.jpg", thumb: "img/thumb/45462512687.jpg", images: ["img/45462512687.jpg", "img/45462512687-2.jpg", "img/45462512687-3.jpg", "img/45462512687-4.jpg", "img/45462512687-5.jpg"], shopeeId: "45462512687", shopeeUrl: "https://shopee.vn/product/837223358/45462512687", shopeeCategory: "Thực phẩm và đồ uống › Đồ ăn vặt › Các loại rong biển ăn liền",
    variants: [{ label: "1 gói", price: 589000, oldPrice: 795000 }, { label: "2 gói", price: 1178000, oldPrice: 1590000 }, { label: "3 gói", price: 1767000, oldPrice: 2385000 }, { label: "4 gói", price: 2356000, oldPrice: 3181000 }, { label: "5 gói", price: 2945000, oldPrice: 3976000 }],
    desc: "Rong biển Busan trộn cơm Hàn Quốc, bổ sung chất xơ và vitamin tự nhiên từ rong biển. Vị mặn nhẹ, giòn, trộn cơm là bé ăn hết bát.",
    highlights: ["Rong biển Busan – vùng rong biển nổi tiếng Hàn Quốc", "Bổ sung chất xơ, vitamin tự nhiên", "Trộn cơm, làm cơm nắm, kimbap cho bé"],
    usage: "Trộn 1 gói nhỏ với cơm nóng hoặc rắc lên cháo. Bảo quản nơi khô ráo, dùng hết sau khi mở gói." },

  { id: "28254163202", name: "Hồng Sâm ChuChu Hàn Quốc Giúp bé Tăng Sức Đề Kháng, Tăng Cao Và Phục Hồi Sức Khoẻ", short: "Hồng sâm ChuChu tăng cao & phục hồi", brand: "chuchu", cat: "hong-sam",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["de-khang", "tang-chieu-cao", "phuc-hoi"], price: 290000, oldPrice: 392000, rating: 4.9, reviews: 20, sold: 119, stock: 50,
    shape: "box", color: "#B5121B", weight: "Gói 20ml", origin: "Hàn Quốc", tags: ["Bán chạy"],
    image: "img/28254163202.jpg", thumb: "img/thumb/28254163202.jpg", images: ["img/28254163202.jpg", "img/28254163202-2.jpg", "img/28254163202-3.jpg", "img/28254163202-4.jpg"], shopeeId: "28254163202", shopeeUrl: "https://shopee.vn/product/837223358/28254163202", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    variants: [{ label: "Mix · 10 gói", price: 290000, oldPrice: 392000 }, { label: "Nho– Việt Quất · 10 gói", price: 290000, oldPrice: 392000 }, { label: "Táo lê · 10 gói", price: 290000, oldPrice: 392000 }, { label: "Mix · 20 gói", price: 580000, oldPrice: 783000 }, { label: "Nho– Việt Quất · 20 gói", price: 580000, oldPrice: 783000 }, { label: "Táo lê · 20 gói", price: 580000, oldPrice: 783000 }, { label: "Mix · thùng 40 gói", price: 1160000, oldPrice: 1566000 }, { label: "Nho– Việt Quất · thùng 40 gói", price: 1160000, oldPrice: 1566000 }, { label: "Táo lê · thùng 40 gói", price: 1160000, oldPrice: 1566000 }],
    desc: "Hồng sâm ChuChu Hàn Quốc dạng gói uống liền cho bé, vị táo lê, nho – việt quất hoặc mix. Theo nhà sản xuất, hồng sâm giúp bé tăng sức đề kháng, hỗ trợ phát triển chiều cao và phục hồi sức khoẻ.",
    highlights: ["Hồng sâm Hàn Quốc cho trẻ em, vị trái cây dễ uống", "3 vị: Táo lê, Nho – việt quất, Mix", "Mua thùng 40 gói tiết kiệm hơn"],
    usage: "Bé uống 1 gói/ngày sau bữa ăn. Lắc đều trước khi dùng. Liều dùng theo hướng dẫn trên bao bì." },


  { id: "22644617070", name: "Hồng Sâm ChuChu Hàn Quốc Giúp Trẻ Tăng Sức Đề Kháng, ăn ngon Và Phục Hồi Sức Khoẻ Sau Khi Bị Ốm", short: "Hồng sâm ChuChu ăn ngon & phục hồi sau ốm", brand: "chuchu", cat: "hong-sam",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["de-khang", "tang-can", "phuc-hoi"], price: 290000, oldPrice: 392000, rating: 4.92, reviews: 165, sold: 699, stock: 50,
    shape: "box", color: "#C62828", weight: "Gói 20ml", origin: "Hàn Quốc", tags: ["Bán chạy"],
    image: "img/22644617070.jpg", thumb: "img/thumb/22644617070.jpg", images: ["img/22644617070.jpg", "img/22644617070-4.jpg", "img/22644617070-5.jpg"], shopeeId: "22644617070", shopeeUrl: "https://shopee.vn/product/837223358/22644617070", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    variants: [{ label: "Việt quất – nho · 10 gói", price: 290000, oldPrice: 392000 }, { label: "Táo lê · 10 gói", price: 290000, oldPrice: 392000 }, { label: "Mix vị · 10 gói", price: 290000, oldPrice: 392000 }, { label: "Mix vị · 20 gói (nửa thùng)", price: 580000, oldPrice: 783000 }, { label: "Táo lê · 20 gói (nửa thùng)", price: 580000, oldPrice: 783000 }, { label: "Việt quất – nho · 20 gói (nửa thùng)", price: 580000, oldPrice: 783000 }, { label: "Mix vị · 40 gói (1 thùng)", price: 1160000, oldPrice: 1566000 }, { label: "Việt quất – nho · 40 gói (1 thùng)", price: 1160000, oldPrice: 1566000 }, { label: "Táo lê · 40 gói (1 thùng)", price: 1160000, oldPrice: 1566000 }],
    desc: "Hồng sâm ChuChu Hàn Quốc dành cho trẻ hay ốm vặt, biếng ăn. Theo nhà sản xuất, sản phẩm giúp trẻ tăng sức đề kháng, ăn ngon và phục hồi sức khoẻ sau khi bị ốm. Có gói 10, nửa thùng và nguyên thùng.",
    highlights: ["Cho bé hay ốm vặt, mới ốm dậy, biếng ăn", "Vị táo lê, việt quất – nho hoặc mix", "Nửa thùng / 1 thùng giá tốt hơn"],
    usage: "Bé uống 1 gói/ngày sau bữa ăn. Liều dùng theo hướng dẫn trên bao bì." },

  { id: "26156646705", name: "Gạc Hươu Non Sumo Chiết Xuất Nhung Hươu Hỗ Trợ Tăng Cân, Giúp Con Ăn Ngon", short: "Gạc hươu non Sumo", brand: "sumo", cat: "tang-can",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["tang-can", "canxi", "de-khang"], price: 390000, oldPrice: 527000, rating: 5.0, reviews: 32, sold: 161, stock: 50,
    shape: "box", color: "#8D6E63", weight: "Gói", origin: "Hàn Quốc", tags: ["Giảm sâu"],
    image: "img/26156646705.jpg", thumb: "img/thumb/26156646705.jpg", images: ["img/26156646705.jpg", "img/26156646705-2.jpg", "img/26156646705-3.jpg", "img/26156646705-4.jpg", "img/26156646705-5.jpg"], shopeeId: "26156646705", shopeeUrl: "https://shopee.vn/product/837223358/26156646705", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    variants: [{ label: "10 gói", price: 390000, oldPrice: 527000 }, { label: "20 gói", price: 780000, oldPrice: 1053000 }, { label: "30 gói", price: 1150000, oldPrice: 1553000 }, { label: "Thùng 40 gói", price: 1490000, oldPrice: 2012000 }],
    desc: "Gạc hươu non Sumo chiết xuất nhung hươu Hàn Quốc dạng gói uống. Theo nhà sản xuất, sản phẩm hỗ trợ bé tăng cân, ăn ngon miệng và bổ sung canxi cho bé chậm lớn.",
    highlights: ["Chiết xuất nhung hươu non Hàn Quốc", "Hỗ trợ tăng cân, ăn ngon cho bé chậm lớn", "Có bản gạc canxi (thùng)"],
    usage: "Bé uống 1 gói/ngày sau ăn. Liều dùng theo hướng dẫn trên bao bì hoặc dược sĩ tư vấn." },

  { id: "23660586997", name: "Nước ép Lotte Đề Kháng – nước ép lê & rễ cát cánh Hàn Quốc cho bé", short: "Nước ép Lotte Đề Kháng", brand: "lotte", cat: "nuoc-ep",
    ages: ["1-3y", "3-6y", "6-12y", "12-18y"], needs: ["de-khang", "tang-can", "tieu-hoa", "organic"], price: 448000, oldPrice: 627000, rating: 5, reviews: 0, sold: 0, stock: 50, priority: 3,
    shape: "box", color: "#FB8C00", weight: "Gói 80ml", origin: "Hàn Quốc", tags: ["Giảm sâu"],
    image: "img/23660586997.jpg", thumb: "img/thumb/23660586997.jpg", images: ["img/23660586997.jpg", "img/23660586997-7.jpg", "img/23660586997-8.jpg", "img/23660586997-2.jpg", "img/23660586997-3.jpg", "img/23660586997-4.jpg", "img/23660586997-5.jpg", "img/23660586997-6.jpg"], shopeeId: "23660586997", shopeeUrl: "https://shopee.vn/product/837223358/23660586997", shopeeCategory: "Thực phẩm và đồ uống › Đồ uống › Khác",
    variants: [{ label: "Hộp 10 gói", price: 448000, oldPrice: 627000 }, { label: "Thùng 30 gói (3 hộp)", price: 1317000, oldPrice: 1844000 }],
    desc: "Nước ép lê và rễ cát cánh (doraji) hữu cơ dòng Khoẻ Mạnh (무적튼튼) của Lotte, do Viện Pasteur Hàn Quốc nghiên cứu và sản xuất, gói 80ml có ống hút, dùng cho bé từ 12 tháng tuổi. Theo nhà sản xuất: lê & rễ cát cánh hữu cơ, hồng sâm organic cô đặc và lợi khuẩn EPS Lactobacillus (được cấp bằng sáng chế); không chất bảo quản, phụ gia; chứng nhận Organic và HACCP Hàn Quốc. Bổ sung vitamin C, kali, magie, axit amin, saponin, kẽm, canxi hỗ trợ đề kháng và hấp thu dưỡng chất.",
    highlights: ["Dùng cho bé từ 12 tháng tuổi", "Lê & rễ cát cánh hữu cơ + hồng sâm cô đặc + lợi khuẩn EPS", "Chứng nhận Organic, HACCP – không chất bảo quản, phụ gia", "Hộp 10 gói · thùng 30 gói (3 hộp), gói nhỏ có ống hút tiện mang đi"],
    usage: "Bé từ 12 tháng: 1 gói (80ml)/ngày sau bữa ăn, lắc nhẹ trước khi uống, ngon hơn khi để mát. Đã mở gói nên dùng ngay. Theo hướng dẫn trên bao bì." },

  { id: "26060839019", name: "Váng Sữa Canxi Hữu Cơ CALCIUMORE CALCIUM SUPPLEMENT Hàn Quốc Bé Lớn Khỏe Dành Cho Trẻ & Người Lớn", short: "Váng sữa canxi hữu cơ Calciumore", brand: "calciumore", cat: "vitamin",
    ages: ["1-3y", "3-6y", "6-12y", "12-18y"], needs: ["canxi", "tang-chieu-cao", "organic", "cho-me"], price: 827000, oldPrice: 1075000, rating: 4.92, reviews: 156, sold: 663, stock: 50, priority: 3,
    shape: "box", color: "#F9A825", weight: "30 gói", origin: "Hàn Quốc", tags: [],
    image: "img/26060839019.jpg", thumb: "img/thumb/26060839019.jpg", images: ["img/26060839019.jpg", "img/26060839019-3.jpg", "img/26060839019-4.jpg", "img/26060839019-5.jpg"], shopeeId: "26060839019", shopeeUrl: "https://shopee.vn/product/837223358/26060839019", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Đồ ăn nhẹ cho bé",
    variants: [{ label: "30 gói (không hộp)", price: 827000, oldPrice: 1075000 }, { label: "1 hộp 90 gói", price: 2480000, oldPrice: 3224000 }, { label: "2 hộp 180 gói", price: 4960000, oldPrice: 6448000 }],
    desc: "Canxi bổ sung dạng gói sệt vị váng sữa (không phải váng sữa tráng miệng) – Calciumore Calcium Supplement Hàn Quốc. Theo nhà sản xuất, sản phẩm bổ sung canxi hữu cơ giúp xương phát triển, hỗ trợ bé cao tối đa.",
    highlights: ["Canxi hữu cơ dễ hấp thu", "Dạng váng sữa thơm ngon, bé không sợ uống", "Hộp 90 gói dùng trong 3 tháng; dùng được cho cả mẹ và người lớn"],
    usage: "Bé dùng 1 gói/ngày sau bữa ăn. Liều dùng theo hướng dẫn trên bao bì." },


  { id: "49061985399", name: "Tinh Chất Nghệ Nano Curcumin 365 Plus Hàn Quốc 32 Tép/Hộp - Hỗ Trợ Dạ Dày, Đẹp Da, Mờ Thâm Sẹo", short: "Nghệ nano Curcumin 365 Plus", brand: "365plus", cat: "cho-me",
    ages: [], needs: ["cho-me"], price: 1290000, oldPrice: 1742000, rating: 0.0, reviews: 0, sold: 5, stock: 50,
    shape: "box", color: "#EF6C00", weight: "32 tép/hộp", origin: "Hàn Quốc", tags: ["Cho mẹ"],
    image: "img/49061985399.jpg", thumb: "img/thumb/49061985399.jpg", images: ["img/49061985399.jpg", "img/49061985399-2.jpg", "img/49061985399-3.jpg", "img/49061985399-4.jpg", "img/49061985399-5.jpg"], shopeeId: "49061985399", shopeeUrl: "https://shopee.vn/product/837223358/49061985399", shopeeCategory: "Sắc Đẹp › Chăm sóc da mặt › Tinh chất dưỡng",
    desc: "Tinh chất nghệ nano Curcumin 365 Plus Hàn Quốc, hộp 32 tép. Theo nhà sản xuất, sản phẩm hỗ trợ dạ dày, giúp đẹp da, mờ thâm sẹo – phù hợp cho mẹ sau sinh.",
    highlights: ["Nano curcumin hấp thu tốt hơn nghệ thường", "Hỗ trợ dạ dày, đẹp da, mờ thâm", "Tép nhỏ tiện dùng hằng ngày"],
    usage: "Người lớn dùng 1 tép/ngày sau ăn. Dùng theo hướng dẫn trên bao bì. Mẹ đang mang thai hoặc cho con bú cần hỏi ý kiến bác sĩ trước khi dùng." },

  { id: "41353214697", name: "Nước ép Lotte Tăng Cao – nước ép táo & củ dền hữu cơ Hàn Quốc cho bé", short: "Nước ép Lotte Tăng Cao", brand: "lotte", cat: "nuoc-ep",
    ages: ["6-12m", "1-3y", "3-6y", "6-12y", "12-18y"], needs: ["canxi", "organic", "an-dam"], price: 448000, oldPrice: 627000, rating: 5.0, reviews: 23, sold: 190, stock: 50, priority: 3,
    shape: "box", color: "#2E7D32", weight: "10 gói", origin: "Hàn Quốc", tags: [],
    image: "img/41353214697.jpg", thumb: "img/thumb/41353214697.jpg", images: ["img/41353214697.jpg", "img/41353214697-3.jpg", "img/41353214697-4.jpg", "img/41353214697-5.jpg"], shopeeId: "41353214697", shopeeUrl: "https://shopee.vn/product/837223358/41353214697", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    variants: [{ label: "Hộp 10 gói", price: 448000, oldPrice: 627000 }, { label: "Thùng 30 gói (3 hộp)", price: 1317000, oldPrice: 1844000 }],
    desc: "Nước dinh dưỡng Lotte Xanh Hàn Quốc, theo nhà sản xuất hỗ trợ phát triển chiều cao ở trẻ nhỏ và tuổi dậy thì.",
    highlights: ["Dùng được cho bé từ 6 tháng – hợp giai đoạn ăn dặm", "Táo & củ dền hữu cơ, chứng nhận Organic, HACCP", "Bổ sung canxi, sắt, axit folic"],
    usage: "Bé 6–12 tháng: 1/2–1 gói/ngày, cho uống bằng thìa hoặc bình; bé trên 1 tuổi: 1 gói/ngày. Theo hướng dẫn trên bao bì." },

  { id: "28467224687", name: "TẢO ĐÔ HOÀNG GIA Hotan Tân Cương bigsize hàng loại 1 cao cấp giúp bồi bổ sức khoẻ, hỗ trợ giấc ngủ", short: "Táo đỏ Hoàng Gia Hotan Tân Cương gói 1kg", brand: "primefood", cat: "thuc-pham",
    ages: [], needs: ["an-vat", "cho-me"], price: 299000, oldPrice: 404000, rating: 4.9, reviews: 0, sold: 60, stock: 50,
    shape: "box", color: "#C62828", weight: "Gói 1kg", origin: "Trung Quốc", tags: [], family: true,
    image: "img/28467224687.jpg", thumb: "img/thumb/28467224687.jpg", images: ["img/28467224687.jpg", "img/28467224687-2.jpg", "img/28467224687-3.jpg", "img/28467224687-4.jpg", "img/28467224687-5.jpg"], shopeeId: "28467224687", shopeeUrl: "https://shopee.vn/product/837223358/28467224687", shopeeCategory: "Thực phẩm và đồ uống › Đồ ăn vặt › Thức ăn khô › Hoa quả sấy khô",
    variants: [{ label: "1 gói", price: 299000, oldPrice: 404000 }, { label: "2 gói", price: 598000, oldPrice: 807000 }],
    desc: "Táo đỏ Hotan (Hoà Điền, Tân Cương) loại 1 size lớn, quả to dày thịt, ngọt tự nhiên, sấy khô không đường, không chất bảo quản. Dùng ăn liền, pha trà, nấu chè, hầm canh, chưng yến cho cả nhà.",
    highlights: ["100% táo đỏ Hotan Tân Cương loại 1, size big", "Không đường, không chất bảo quản", "Gói 1kg – mua 2 gói tiết kiệm hơn"],
    usage: "Ăn trực tiếp 3–5 quả/ngày, hoặc pha trà, nấu chè, hầm canh. Bảo quản nơi khô ráo, đậy kín sau khi mở." },

  { id: "29402041000", name: "Táo Đỏ Thiên Sâm Tân Cương Big Size Thượng Hạng Loại 1 Thơm, Ngọt, Bổ Máu Túi Gói 1kg", short: "Táo đỏ Thiên Sâm Tân Cương 1kg", brand: "richfoods", cat: "thuc-pham",
    ages: [], needs: ["an-vat", "cho-me"], price: 500000, oldPrice: 675000, rating: 4.95, reviews: 0, sold: 79, stock: 50,
    shape: "box", color: "#AD1457", weight: "Túi 1kg", origin: "Trung Quốc", tags: [], family: true,
    image: "img/29402041000.jpg", thumb: "img/thumb/29402041000.jpg", images: ["img/29402041000.jpg", "img/29402041000-2.jpg", "img/29402041000-3.jpg", "img/29402041000-4.jpg", "img/29402041000-5.jpg"], shopeeId: "29402041000", shopeeUrl: "https://shopee.vn/product/837223358/29402041000", shopeeCategory: "Thực phẩm và đồ uống › Nhu yếu phẩm › Thực phẩm khô › Thảo mộc truyền thống",
    variants: [{ label: "Túi 1kg", price: 500000, oldPrice: 675000 }, { label: "Combo 3 túi (3kg)", price: 1200000, oldPrice: 1620000 }],
    desc: "Táo đỏ Thiên Sâm Tân Cương size big thượng hạng loại 1, được chọn lọc kỹ; quả dày thịt, thơm, ngọt. 100g táo cung cấp khoảng 79 kcal, 10g chất xơ và 77% nhu cầu vitamin C hằng ngày. Ăn liền, pha trà, chưng yến, hầm canh.",
    highlights: ["Táo Tân Cương loại 1 size big, ngọt thơm", "Giàu chất xơ và vitamin C", "Túi 1kg – mua combo 3 túi tiết kiệm"],
    usage: "Ăn trực tiếp hoặc pha trà, nấu chè, hầm canh. Bảo quản nơi khô ráo." },

  { id: "26523206270", name: "Sữa Tươi Tiệt Trùng Norco Nội Địa Úc Bổ Sung Sức Khỏe Cho Cơ Thể - Hương Vị Nguyên Chất, Dinh Dưỡng", short: "Sữa tươi tiệt trùng Norco nguyên kem nội địa Úc 1L", brand: "norco", cat: "sua",
    ages: ["1-3y", "3-6y", "6-12y", "12-18y"], needs: ["sua-tuoi", "canxi", "tang-chieu-cao"], price: 720000, oldPrice: 972000, rating: 5.0, reviews: 0, sold: 76, stock: 50,
    shape: "carton", color: "#1565C0", weight: "Thùng", origin: "Úc", tags: [],
    image: "img/26523206270.jpg", thumb: "img/thumb/26523206270.jpg", images: ["img/26523206270.jpg", "img/26523206270-2.jpg", "img/26523206270-3.jpg", "img/26523206270-4.jpg", "img/26523206270-5.jpg"], shopeeId: "26523206270", shopeeUrl: "https://shopee.vn/product/837223358/26523206270", shopeeCategory: "Thực phẩm và đồ uống › Sữa - trứng › Sữa › Sữa tiệt trùng",
    variants: [{ label: "1 thùng", price: 720000, oldPrice: 972000 }, { label: "2 thùng", price: 1440000, oldPrice: 1944000 }],
    desc: "Sữa tươi tiệt trùng Norco – thương hiệu sữa hơn 128 năm của Úc, sản xuất từ đàn bò ăn cỏ nội địa Úc; sữa nguyên kem giàu canxi và đạm tự nhiên, vị béo thanh, không đường. Phù hợp bé từ 1 tuổi và cả gia đình.",
    highlights: ["Thương hiệu Norco 128 năm, hàng nội địa Úc", "Sữa bò ăn cỏ, không đường, không chất bảo quản", "Giàu canxi & đạm cho bé tăng chiều cao"],
    usage: "Bé trên 1 tuổi uống 1–2 ly (200–400ml)/ngày. Sau khi mở nắp bảo quản lạnh và dùng trong 3 ngày." },

  { id: "13899935993", name: "Sữa Dê Lotte Kid A+ Bổ Sung Canxi Hỗ Trợ Phát Triển Chiều Cao, Tăng Đề Kháng Cho Trẻ 760g", short: "Sữa dê Lotte Kid A+ 760g", brand: "lotte", cat: "sua",
    ages: ["1-3y", "3-6y", "6-12y", "12-18y"], needs: ["sua-cong-thuc", "canxi", "tang-chieu-cao", "de-khang"], price: 850000, oldPrice: 1148000, rating: 5.0, reviews: 0, sold: 33, stock: 50, priority: 2,
    shape: "can", color: "#E60012", weight: "Lon 760g", origin: "Hàn Quốc", tags: [], formula: true,
    image: "img/13899935993.jpg", thumb: "img/thumb/13899935993.jpg", images: ["img/13899935993.jpg", "img/13899935993-2.jpg", "img/13899935993-3.jpg", "img/13899935993-4.jpg"], shopeeId: "13899935993", shopeeUrl: "https://shopee.vn/product/837223358/13899935993", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Sữa công thức",
    desc: "Sữa dê Lotte Kid A+ (Hàn Quốc) lon 760g cho bé từ 1 tuổi. Theo nhà sản xuất: bổ sung canxi, vitamin D, Alpha-lactalbumin (1.050mg/100g) hỗ trợ miễn dịch và hệ lợi khuẩn thực vật (100 triệu CFU/lon) giúp tiêu hoá tốt; đạm sữa dê dễ hấp thu, phù hợp bé chậm tăng cân.",
    highlights: ["Sữa dê dễ hấp thu, hỗ trợ tăng cân & chiều cao", "Alpha-lactalbumin + lợi khuẩn hỗ trợ miễn dịch, tiêu hoá", "Đạt tiêu chuẩn xuất khẩu nhiều thị trường"],
    usage: "Pha 7–8 muỗng gạt (muỗng trong hộp) với 180ml nước ấm 40–50°C được 1 ly 240ml. 2 ly/ngày. Dùng trong 3 tuần sau khi mở." },

  { id: "29210696898", name: "Sữa Bò Lotte Kid A+ Giúp Phát Triển Chiều Cao Lon 760g Bổ Sung Canxi Giúp Ổn Định Hệ Tiêu Hóa Của Bé", short: "Sữa bò Lotte Kid A+ 760g", brand: "lotte", cat: "sua",
    ages: ["1-3y", "3-6y", "6-12y", "12-18y"], needs: ["sua-cong-thuc", "canxi", "tang-chieu-cao", "tri-nao"], price: 650000, oldPrice: 878000, rating: 5.0, reviews: 0, sold: 11, stock: 50, priority: 2,
    shape: "can", color: "#0066B3", weight: "Lon 760g", origin: "Hàn Quốc", tags: [], formula: true,
    image: "img/29210696898.jpg", thumb: "img/thumb/29210696898.jpg", images: ["img/29210696898.jpg", "img/29210696898-2.jpg", "img/29210696898-3.jpg", "img/29210696898-4.jpg", "img/29210696898-5.jpg"], shopeeId: "29210696898", shopeeUrl: "https://shopee.vn/product/837223358/29210696898", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Sữa công thức",
    desc: "Sữa bò Lotte Kid A+ (Hàn Quốc) lon 760g cho bé từ 1 tuổi. Theo nhà sản xuất: đạm thuỷ phân một phần dễ tiêu, canxi 720mg/100g, vitamin D, CPP 600mg/100g giúp hấp thu canxi, DHA từ tảo biển, dầu MCT và hệ lợi khuẩn Synbiotic; không gây dậy thì sớm.",
    highlights: ["Canxi 720mg/100g + CPP hỗ trợ chiều cao", "DHA tảo biển, đạm thuỷ phân dễ tiêu", "Lợi khuẩn Synbiotic ổn định tiêu hoá"],
    usage: "Pha 7–8 thìa gạt với 180ml nước ấm 40–50°C, khuấy đều. 2 ly/ngày." },

  { id: "19491505209", name: "Sữa Bò Biostime SN-2 Bio Plus HPO- ON FORMULA LON- Tăng Cường Đề Kháng, Dưỡng Chất- Giúp Bé Ngủ Ngon, Ít Quấy Khóc", short: "Sữa bò Biostime SN-2 Bio Plus HPO 800g", brand: "biostime", cat: "sua",
    ages: ["0-6m", "6-12m", "1-3y"], needs: ["sua-cong-thuc", "de-khang", "tieu-hoa"], price: 1290000, oldPrice: 1742000, rating: 0.0, reviews: 0, sold: 0, stock: 50,
    shape: "can", color: "#1E88E5", weight: "Lon 800g", origin: "Úc", tags: [], formula: true,
    image: "img/19491505209.jpg", thumb: "img/thumb/19491505209.jpg", images: ["img/19491505209.jpg", "img/19491505209-2.jpg", "img/19491505209-3.jpg", "img/19491505209-4.jpg", "img/19491505209-5.jpg"], shopeeId: "19491505209", shopeeUrl: "https://shopee.vn/product/837223358/19491505209", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Sữa pha sẵn",
    variants: [{ label: "Số 1 (0–6 tháng)", price: 1290000, oldPrice: 1742000 }, { label: "Số 2 (6–12 tháng)", price: 1290000, oldPrice: 1742000 }, { label: "Số 3 (1–3 tuổi)", price: 1290000, oldPrice: 1742000 }],
    desc: "Sữa công thức Biostime SN-2 Bio Plus HPO (Úc) lon 800g, chất béo cấu trúc SN-2 gần giống sữa mẹ, bổ sung lợi khuẩn và HMO. Theo nhà sản xuất: hỗ trợ tăng đề kháng, tiêu hoá dễ, giảm táo bón.",
    highlights: ["Sản xuất tại Úc, kiểm soát chất lượng nghiêm ngặt", "Chất béo SN-2 + HPO + lợi khuẩn", "Có số 1, 2, 3 theo độ tuổi"],
    usage: "1 muỗng gạt (4,5g) pha với 30ml nước ấm. Pha theo bảng trên hộp; sữa đã pha dùng trong 1 giờ (2 giờ nếu bảo quản lạnh)." },

  { id: "19682441455", name: "SỮA DÊ BIOSTIME- 800g - Hỗ Trợ Bé Phát Triển Toàn Diện Về Chiều Cao- Cân Nặng", short: "Sữa dê Biostime 800g", brand: "biostime", cat: "sua",
    ages: ["0-6m", "6-12m", "1-3y"], needs: ["sua-cong-thuc", "tang-can", "tang-chieu-cao"], price: 1170000, oldPrice: 1580000, rating: 5.0, reviews: 0, sold: 32, stock: 50,
    shape: "can", color: "#6D4C41", weight: "Lon 800g", origin: "Úc", tags: [], formula: true,
    image: "img/19682441455.jpg", thumb: "img/thumb/19682441455.jpg", images: ["img/19682441455.jpg", "img/19682441455-2.jpg", "img/19682441455-3.jpg", "img/19682441455-4.jpg"], shopeeId: "19682441455", shopeeUrl: "https://shopee.vn/product/837223358/19682441455", shopeeCategory: "Mẹ & Bé › Chăm sóc sức khỏe bé › Khác",
    variants: [{ label: "Số 1 (0–6 tháng)", price: 1170000, oldPrice: 1580000 }, { label: "Số 2 (6–12 tháng)", price: 1170000, oldPrice: 1580000 }, { label: "Số 3 (từ 12 tháng)", price: 1170000, oldPrice: 1580000 }],
    desc: "Sữa dê công thức Biostime (Úc) lon 800g – dòng sữa dê cao cấp hỗ trợ bé phát triển toàn diện chiều cao và cân nặng; đạm sữa dê nhỏ, dễ tiêu, ít gây dị ứng. Số 1: 0–6 tháng, số 2: 6–12 tháng, số 3: từ 12 tháng.",
    highlights: ["Sữa dê dễ tiêu, phù hợp bé nhạy cảm với sữa bò", "Sản xuất tại Úc", "Đủ số 1, 2, 3"],
    usage: "1 muỗng gạt pha với 30ml nước ấm theo bảng trên hộp. Sữa pha xong dùng trong 1 giờ." },

  { id: "20992159167", name: "SỮA BÒ ORGANIC BIOSTIME- GIÚP BÉ TĂNG ĐỀ KH.ÁNG, PHÁT TRIỂN CHIỀU CAO, PHÁT TRIỂN NÃO BỘ", short: "Sữa bò Organic Biostime 800g (Pháp)", brand: "biostime", cat: "sua",
    ages: ["0-6m", "6-12m", "1-3y"], needs: ["sua-cong-thuc", "organic", "de-khang", "tang-chieu-cao"], price: 1290000, oldPrice: 1742000, rating: 0.0, reviews: 0, sold: 1, stock: 50,
    shape: "can", color: "#2E7D32", weight: "Lon 800g", origin: "Pháp", tags: [], formula: true,
    image: "img/20992159167.jpg", thumb: "img/thumb/20992159167.jpg", images: ["img/20992159167.jpg", "img/20992159167-2.jpg", "img/20992159167-3.jpg", "img/20992159167-4.jpg", "img/20992159167-5.jpg"], shopeeId: "20992159167", shopeeUrl: "https://shopee.vn/product/837223358/20992159167", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Sữa công thức",
    variants: [{ label: "Số 1 (0–6 tháng)", price: 1290000, oldPrice: 1742000 }, { label: "Số 2 (6–12 tháng)", price: 1290000, oldPrice: 1742000 }, { label: "Số 3 (từ 12 tháng)", price: 1290000, oldPrice: 1742000 }],
    desc: "Sữa bò hữu cơ Biostime Organic nội địa Pháp, lon 800g. Theo nhà sản xuất: nguyên liệu organic, chất béo SN-2 giúp hấp thu tốt, hỗ trợ tăng đề kháng và phát triển chiều cao.",
    highlights: ["Sữa hữu cơ nội địa Pháp", "Chất béo liên kết SN-2", "Đủ số 1, 2, 3"],
    usage: "Pha theo bảng hướng dẫn trên hộp với nước ấm 40–50°C." },

  { id: "47357633686", name: "Sâm Organic Pinkfong Kid Up 40ml – Tăng Chiều Cao, Tăng Đề Kháng, Giúp Bé Ăn Ngon Ngủ Ngon", short: "Sâm Organic Pinkfong Kid Up 40ml", brand: "pinkfong", cat: "hong-sam",
    ages: ["3-6y", "6-12y", "12-18y"], needs: ["tang-chieu-cao", "de-khang", "tang-can"], price: 1190000, oldPrice: 1607000, rating: 0.0, reviews: 0, sold: 1, stock: 50,
    shape: "box", color: "#EC407A", weight: "Hộp (gói 40ml)", origin: "Hàn Quốc", tags: ["Mới"],
    image: "img/47357633686.jpg", thumb: "img/thumb/47357633686.jpg", images: ["img/47357633686.jpg", "img/47357633686-2.jpg", "img/47357633686-3.jpg", "img/47357633686-4.jpg", "img/47357633686-5.jpg"], shopeeId: "47357633686", shopeeUrl: "https://shopee.vn/product/837223358/47357633686", shopeeCategory: "Mẹ & Bé › Chăm sóc sức khỏe bé › Vitamin & Thực phẩm bổ sung",
    variants: [{ label: "1 hộp", price: 1190000, oldPrice: 1607000 }, { label: "2 hộp", price: 2380000, oldPrice: 3213000 }],
    desc: "Sâm hữu cơ Pinkfong Kid Up gói 40ml (Hàn Quốc), hạn dùng 24 tháng. Theo nhà sản xuất: hỗ trợ bé phát triển chiều cao và thể chất, tăng đề kháng, giảm biếng ăn.",
    highlights: ["Nhân sâm organic Hàn Quốc", "Nhân vật Pinkfong bé thích", "Hộp gói 40ml tiện mang theo – mua 2 hộp tiết kiệm hơn"],
    usage: "Bé 3–6 tuổi: 2/3 gói/ngày; trên 7 tuổi: 1–2 gói/ngày, uống buổi sáng." },

  { id: "48112514210", name: "SUPER COLLAGEN ALPHA 90 Gói Collagen Peptide VERISOL Đức, Hỗ Trợ Đẹp Da, Tăng Độ Đàn Hồi, Dưỡng Ẩm", short: "Super Collagen Alpha 90 gói (Đức)", brand: "alpha", cat: "cho-me",
    ages: [], needs: ["cho-me", "lam-dep"], price: 3600000, oldPrice: 4860000, rating: 0.0, reviews: 0, sold: 4, stock: 50,
    shape: "box", color: "#8E24AA", weight: "Hộp 90 gói (270g)", origin: "Đức", tags: [],
    image: "img/48112514210.jpg", thumb: "img/thumb/48112514210.jpg", images: ["img/48112514210.jpg", "img/48112514210-2.jpg", "img/48112514210-3.jpg", "img/48112514210-4.jpg", "img/48112514210-5.jpg"], shopeeId: "48112514210", shopeeUrl: "https://shopee.vn/product/837223358/48112514210", shopeeCategory: "Sức Khỏe › Thực phẩm chức năng › Hỗ trợ làm đẹp",
    desc: "Super Collagen Alpha hộp 90 gói, Collagen Peptide VERISOL® (Đức) kết hợp vitamin C, Hyaluronic Acid, Biotin, N-Acetylglucosamine và chiết xuất ốc sên. Theo nhà sản xuất: hỗ trợ da căng mịn, giảm nếp nhăn, chống lão hoá cho mẹ.",
    highlights: ["Collagen VERISOL® Đức", "Kèm vitamin C, HA, Biotin", "Hộp 90 gói dùng 3 tháng"],
    usage: "Mỗi ngày 1 gói pha với nước, uống sau ăn. Phụ nữ có thai/cho con bú hỏi ý kiến bác sĩ." },

  { id: "25632276959", name: "Nước ép Lotte Tăng Cân Tự Nhiên – nước ép mận, nho & táo hữu cơ Hàn Quốc cho bé", short: "Nước ép Lotte Tăng Cân Tự Nhiên", brand: "lotte", cat: "nuoc-ep",
    ages: ["1-3y", "3-6y", "6-12y", "12-18y"], needs: ["tang-can", "tieu-hoa", "organic", "de-khang"], price: 448000, oldPrice: 627000, rating: 4.9, reviews: 0, sold: 431, stock: 50, priority: 3,
    shape: "box", color: "#7B1FA2", weight: "Gói 80ml", origin: "Hàn Quốc", tags: ["Bán chạy"],
    image: "img/25632276959.jpg", thumb: "img/thumb/25632276959.jpg", images: ["img/25632276959.jpg", "img/25632276959-2.jpg", "img/25632276959-3.jpg", "img/25632276959-4.jpg", "img/25632276959-5.jpg", "img/25632276959-cb.jpg"], shopeeId: "25632276959", shopeeUrl: "https://shopee.vn/product/837223358/25632276959", shopeeCategory: "Thực phẩm và đồ uống › Đồ uống › Khác", importer: "Công ty TNHH Đầu tư Xuất nhập khẩu Hoan TT (Hưng Yên)", congBo: "Bản tự công bố số 13/HOAN TT/2023",
    variants: [{ label: "Hộp 10 gói", price: 448000, oldPrice: 627000 }, { label: "Thùng 30 gói (3 hộp)", price: 1317000, oldPrice: 1844000 }],
    desc: "Nước ép mận, nho và táo hữu cơ Lotte (Pasteur Prune & Grape & Apple Juice) dòng Tăng Cân – Ăn Ngon, túi 80ml có nắp vặn, nhà sản xuất Food Well Co., Ltd (Daegu, Hàn Quốc). Theo nhà sản xuất: 99,94% nguyên liệu hữu cơ, lợi khuẩn EPS Lactobacillus, hỗ trợ bé ăn ngon, cân bằng tiêu hoá, giảm táo bón. Có bản tự công bố sản phẩm tại Việt Nam.",
    highlights: ["99,94% nguyên liệu hữu cơ, chứng nhận HACCP & Organic", "Mận giúp nhuận tràng, giảm táo bón", "Đã công bố ATTP tại Việt Nam (xem ảnh cuối)"],
    usage: "Bé từ 1 tuổi: 1 gói/ngày sau ăn. Hạn dùng 12 tháng, đã mở gói dùng ngay." },

  { id: "43532388498", name: "Ngũ Cốc Tuổi Thọ Healthy Fuwa-Saku Granola Nhật Bản 200g", short: "Granola Fuwa-Saku Nhật Bản 200g", brand: "sakuma", cat: "thuc-pham",
    ages: ["3-6y", "6-12y", "12-18y"], needs: ["an-vat"], price: 289000, oldPrice: 390000, rating: 0.0, reviews: 0, sold: 0, stock: 50,
    shape: "box", color: "#8D6E63", weight: "Gói 200g", origin: "Nhật Bản", tags: [], family: true,
    image: "img/43532388498.jpg", thumb: "img/thumb/43532388498.jpg", images: ["img/43532388498.jpg", "img/43532388498-2.jpg", "img/43532388498-3.jpg", "img/43532388498-4.jpg", "img/43532388498-5.jpg"], shopeeId: "43532388498", shopeeUrl: "https://shopee.vn/product/837223358/43532388498", shopeeCategory: "Thực phẩm và đồ uống › Ngũ cốc & mứt › Ngũ cốc",
    variants: [{ label: "1 gói 200g", price: 289000, oldPrice: 390000 }, { label: "2 gói", price: 578000, oldPrice: 780000 }],
    desc: "Ngũ cốc granola Healthy Fuwa-Saku (Sakuma Seika, Nhật Bản) kết hợp 15 loại ngũ cốc, hạt và trái cây tự nhiên; giàu chất xơ, vitamin, khoáng chất. 50g cung cấp 207 kcal, 3,3g protein – bữa sáng nhanh gọn cho cả nhà.",
    highlights: ["15 loại ngũ cốc, hạt & trái cây", "Giòn xốp, ít muối", "Bữa sáng 5 phút cho cả gia đình"],
    usage: "50g granola + 200ml sữa tươi hoặc sữa chua. Đậy kín sau khi mở." },

  { id: "57413220644", name: "Mặt Nạ Chữa Lành Lô Hội CURE Hàn Quốc - Cấp Ẩm, Làm Dịu Da, Phục Hồi Da, Dưỡng Sáng Da,", short: "Mặt nạ thạch lô hội Cure Hàn Quốc", brand: "kimjeongmoon", cat: "cho-me",
    ages: [], needs: ["cho-me", "lam-dep"], price: 790000, oldPrice: 1067000, rating: 0.0, reviews: 0, sold: 0, stock: 50,
    shape: "box", color: "#43A047", weight: "Hộp", origin: "Hàn Quốc", tags: [],
    image: "img/57413220644.jpg", thumb: "img/thumb/57413220644.jpg", images: ["img/57413220644.jpg", "img/57413220644-2.jpg", "img/57413220644-3.jpg", "img/57413220644-4.jpg", "img/57413220644-5.jpg"], shopeeId: "57413220644", shopeeUrl: "https://shopee.vn/product/837223358/57413220644", shopeeCategory: "Sắc Đẹp › Tắm & chăm sóc cơ thể › Mặt nạ ủ cơ thể",
    desc: "Mặt nạ thạch lô hội Cure (Kim Jeong Moon Aloe, Hàn Quốc) ứng dụng công nghệ Exosome, kết hợp lô hội, Niacinamide, Collagen thuỷ phân và vitamin. Theo nhà sản xuất: cấp ẩm sâu, làm dịu da, phục hồi da căng mướt.",
    highlights: ["Thạch lô hội mát dịu", "Niacinamide + Collagen thuỷ phân", "Phù hợp mẹ sau sinh da khô, sạm"],
    usage: "Đắp 15–20 phút, 2–3 lần/tuần sau khi rửa mặt sạch." },

  { id: "19880841223", name: "Men Vi Sinh Biostime Giúp Trẻ Ăn Ngon Miệng, Tiêu Hóa Tốt, Tăng Cường Sức Đề Kháng, Phát Triển Trí Tuệ", short: "Men vi sinh Biostime 28 gói (Pháp)", brand: "biostime", cat: "tang-can",
    ages: ["0-6m", "6-12m", "1-3y", "3-6y", "6-12y"], needs: ["tieu-hoa", "tang-can", "de-khang"], price: 995000, oldPrice: 1343000, rating: 4.98, reviews: 0, sold: 408, stock: 50,
    shape: "box", color: "#00897B", weight: "Hộp 28 gói × 1,5g", origin: "Pháp", tags: ["Bán chạy"],
    image: "img/19880841223.jpg", thumb: "img/thumb/19880841223.jpg", images: ["img/19880841223.jpg", "img/19880841223-2.jpg", "img/19880841223-3.jpg", "img/19880841223-4.jpg", "img/19880841223-5.jpg"], shopeeId: "19880841223", shopeeUrl: "https://shopee.vn/product/837223358/19880841223", shopeeCategory: "Mẹ & Bé › Chăm sóc sức khỏe bé › Vitamin & Thực phẩm bổ sung",
    desc: "Men vi sinh Biostime nội địa Pháp, hộp 28 gói 1,5g, bổ sung lợi khuẩn kết hợp HMO. Theo nhà sản xuất: giúp trẻ ăn ngon miệng, tiêu hoá tốt, tăng đề kháng. Dùng cho trẻ từ sơ sinh đến 7 tuổi; mẹ bầu cũng dùng được.",
    highlights: ["Lợi khuẩn + HMO", "Từ sơ sinh, gói bột không vị dễ pha", "Nội địa Pháp"],
    usage: "1 gói/ngày pha với sữa, nước hoặc thức ăn nguội dưới 40°C. Uống cách kháng sinh 2 giờ." },

  { id: "27721793055", name: "Kỷ Tử Hữu Cơ Hoàng Gia Ninh Hạ Size Lớn Đỏ Đen, Không Chất Bảo Quản,– Bổ Dưỡng, An Toàn Cho Sức Khoẻ", short: "Kỷ tử hữu cơ Hoàng Gia Ninh Hạ (đỏ & đen)", brand: "hoanggia", cat: "thuc-pham",
    ages: [], needs: ["an-vat", "cho-me"], price: 250000, oldPrice: 338000, rating: 5.0, reviews: 0, sold: 7, stock: 50,
    shape: "box", color: "#D84315", weight: "Túi", origin: "Trung Quốc", tags: [], family: true,
    image: "img/27721793055.jpg", thumb: "img/thumb/27721793055.jpg", images: ["img/27721793055.jpg", "img/27721793055-2.jpg", "img/27721793055-3.jpg", "img/27721793055-4.jpg", "img/27721793055-5.jpg"], shopeeId: "27721793055", shopeeUrl: "https://shopee.vn/product/837223358/27721793055", shopeeCategory: "Sức Khỏe › Thực phẩm chức năng › Hỗ trợ sức khỏe",
    variants: [{ label: "Kỷ tử đỏ", price: 250000, oldPrice: 338000 }, { label: "Kỷ tử đen", price: 417000, oldPrice: 563000 }],
    desc: "Kỷ tử hữu cơ Hoàng Gia trồng tại Ninh Hạ – vùng kỷ tử nổi tiếng nhất Trung Quốc, quả size lớn, không chất bảo quản. Có kỷ tử đỏ và kỷ tử đen. Pha trà, nấu chè, hầm canh, ngâm nước uống cho cả nhà.",
    highlights: ["Kỷ tử hữu cơ Ninh Hạ size lớn", "Không chất bảo quản", "Có loại đỏ và đen"],
    usage: "10–15g/ngày pha trà hoặc nấu ăn. Bảo quản kín, nơi khô mát." },

  { id: "57903449970", name: "Kem thắp sáng hồng da Cell Happy Co 5in1 nâng tone, bảo vệ da khỏi ánh nắng giúp da căng bóng", short: "Kem hồng da Cell Happy Co 5in1", brand: "cellhappy", cat: "cho-me",
    ages: [], needs: ["cho-me", "lam-dep"], price: 693000, oldPrice: 936000, rating: 5.0, reviews: 0, sold: 11, stock: 50,
    shape: "bottle", color: "#F06292", weight: "Tuýp", origin: "Hàn Quốc", tags: [],
    image: "img/57903449970.jpg", thumb: "img/thumb/57903449970.jpg", images: ["img/57903449970.jpg", "img/57903449970-2.jpg", "img/57903449970-3.jpg", "img/57903449970-4.jpg", "img/57903449970-5.jpg"], shopeeId: "57903449970", shopeeUrl: "https://shopee.vn/product/837223358/57903449970", shopeeCategory: "Sắc Đẹp › Chăm sóc da mặt › Kem dưỡng ẩm",
    desc: "Kem dưỡng hồng da Cell Happy Co 5in1 (Hàn Quốc): nâng tone, chống nắng vô cơ không gây kích ứng, dưỡng ẩm, làm sáng và bảo vệ da khỏi tia UV. Theo nhà sản xuất: cho da căng bóng, trắng hồng tự nhiên.",
    highlights: ["5 công dụng: nâng tone, chống nắng, dưỡng ẩm, sáng da, bảo vệ", "Chống nắng vô cơ, không kích ứng", "Thương hiệu Hàn Quốc"],
    usage: "Thoa lớp mỏng buổi sáng sau bước dưỡng, trước khi trang điểm." },

  { id: "27355720019", name: "Hồng Sâm Siêu Trí Tuệ Rich Kid- Tăng Cường Trí Tuệ , Cải Thiện Chức Năng Não Bộ", short: "Hồng sâm Siêu Trí Tuệ Rich Kid (Kinigini) hộp 10 gói", brand: "kinigini", cat: "hong-sam",
    ages: ["1-3y", "3-6y", "6-12y", "12-18y"], needs: ["tri-nao", "de-khang"], price: 480000, oldPrice: 648000, rating: 5.0, reviews: 0, sold: 213, stock: 50,
    shape: "box", color: "#5E35B1", weight: "Hộp 10 gói × 40ml", origin: "Hàn Quốc", tags: ["Bán chạy"],
    image: "img/27355720019.jpg", thumb: "img/thumb/27355720019.jpg", images: ["img/27355720019.jpg", "img/27355720019-2.jpg", "img/27355720019-3.jpg", "img/27355720019-4.jpg", "img/27355720019-5.jpg"], shopeeId: "27355720019", shopeeUrl: "https://shopee.vn/product/837223358/27355720019", shopeeCategory: "Mẹ & Bé › Chăm sóc sức khỏe bé › Khác",
    desc: "Hồng sâm hữu cơ Kinigini Kids Red Ginseng “Rich Kid” (Hàn Quốc), gói 40ml, hộp 10 gói, cho bé 2–15 tuổi. Theo nhà sản xuất: hỗ trợ phát triển trí não, tăng tập trung, tăng đề kháng.",
    highlights: ["Hồng sâm hữu cơ cho bé 2–15 tuổi", "Hỗ trợ trí não, tập trung khi đi học", "Gói 40ml uống liền, ngon hơn khi lạnh"],
    usage: "Bé uống 1 gói/ngày hoặc 2–3 ngày 1 gói, uống trực tiếp, ngon hơn khi để lạnh." },


  { id: "26137781198", name: "Bò Xuyên Tiêu Cay– Thịt Bò Sấy Dẻo Cao Cấp – Thương Hiệu Chef Hải", short: "Bò xuyên tiêu sấy dẻo MasterChef", brand: "masterchef", cat: "thuc-pham",
    ages: ["12-18y"], needs: ["an-vat"], price: 339000, oldPrice: 458000, rating: 5.0, reviews: 0, sold: 28, stock: 50,
    shape: "box", color: "#BF360C", weight: "200g / 500g", origin: "Việt Nam", tags: [], family: true,
    image: "img/26137781198.jpg", thumb: "img/thumb/26137781198.jpg", images: ["img/26137781198.jpg", "img/26137781198-2.jpg", "img/26137781198-3.jpg", "img/26137781198-4.jpg", "img/26137781198-5.jpg"], shopeeId: "26137781198", shopeeUrl: "https://shopee.vn/product/837223358/26137781198", shopeeCategory: "Thực phẩm và đồ uống › Đồ ăn vặt › Thức ăn khô › Thịt khô",
    variants: [{ label: "200g", price: 339000, oldPrice: 458000 }, { label: "500g", price: 678000, oldPrice: 915000 }],
    desc: "Bò xuyên tiêu cay MasterChef (Chef Hải) – thịt bò mông tươi 100% xé tay, sấy dẻo giữ độ mềm, không chất bảo quản, hạn dùng 6 tháng. Món ăn vặt cay đậm đà cho người lớn và bé lớn.",
    highlights: ["100% thịt bò mông tươi, xé tay thủ công", "Sấy dẻo, không chất bảo quản", "Có 200g và 500g"],
    usage: "Ăn trực tiếp. Bảo quản nơi khô ráo, đậy kín. Không dùng cho bé nhỏ (cay)." }
];

/* Feedback thực tế của khách (ảnh chụp tin nhắn/bình luận/ảnh bé dùng sản phẩm) – đặt file vào img/feedback/.
   Chỉ dùng ảnh đã được khách đồng ý; nên làm mờ tên/avatar; không dùng ảnh có tuyên bố chữa bệnh, "cao thêm X cm" (quy định quảng cáo TPCN).
   Mỗi mục: image (bắt buộc), name (VD 'Mẹ Hà · Hà Nội'), product (mã sản phẩm, tuỳ chọn), text (trích ngắn, tuỳ chọn), date (tuỳ chọn). Để mảng rỗng → mục tự ẩn. */
window.FEEDBACKS = [
  { image: "img/feedback/fb-01.jpg", thumb: "img/feedback/thumb/fb-01.jpg" },
  { image: "img/feedback/fb-02.jpg", thumb: "img/feedback/thumb/fb-02.jpg" },
  { image: "img/feedback/fb-03.jpg", thumb: "img/feedback/thumb/fb-03.jpg" },
  { image: "img/feedback/fb-04.jpg", thumb: "img/feedback/thumb/fb-04.jpg" },
  { image: "img/feedback/fb-05.jpg", thumb: "img/feedback/thumb/fb-05.jpg" },
  { image: "img/feedback/fb-06.jpg", thumb: "img/feedback/thumb/fb-06.jpg" },
  { image: "img/feedback/fb-07.jpg", thumb: "img/feedback/thumb/fb-07.jpg" },
  { image: "img/feedback/fb-08.jpg", thumb: "img/feedback/thumb/fb-08.jpg" },
  { image: "img/feedback/fb-09.jpg", thumb: "img/feedback/thumb/fb-09.jpg", name: "Salim", kol: true },
  { image: "img/feedback/fb-10.jpg", thumb: "img/feedback/thumb/fb-10.jpg" },
  { image: "img/feedback/fb-11.jpg", thumb: "img/feedback/thumb/fb-11.jpg" },
  { image: "img/feedback/fb-12.jpg", thumb: "img/feedback/thumb/fb-12.jpg" },
  { image: "img/feedback/fb-13.jpg", thumb: "img/feedback/thumb/fb-13.jpg" },
  { image: "img/feedback/fb-14.jpg", thumb: "img/feedback/thumb/fb-14.jpg" },
  { image: "img/feedback/fb-15.jpg", thumb: "img/feedback/thumb/fb-15.jpg" },
  { image: "img/feedback/fb-16.jpg", thumb: "img/feedback/thumb/fb-16.jpg" },
  { image: "img/feedback/fb-17.jpg", thumb: "img/feedback/thumb/fb-17.jpg" },
  { image: "img/feedback/fb-18.jpg", thumb: "img/feedback/thumb/fb-18.jpg" },
  { image: "img/feedback/fb-19.jpg", thumb: "img/feedback/thumb/fb-19.jpg" },
  { image: "img/feedback/fb-20.jpg", thumb: "img/feedback/thumb/fb-20.jpg" },
  { image: "img/feedback/fb-21.jpg", thumb: "img/feedback/thumb/fb-21.jpg" },
  { image: "img/feedback/fb-22.jpg", thumb: "img/feedback/thumb/fb-22.jpg" },
  { image: "img/feedback/fb-23.jpg", thumb: "img/feedback/thumb/fb-23.jpg" },
  { image: "img/feedback/fb-24.jpg", thumb: "img/feedback/thumb/fb-24.jpg" },
  { image: "img/feedback/fb-25.jpg", thumb: "img/feedback/thumb/fb-25.jpg" },
  { image: "img/feedback/fb-26.jpg", thumb: "img/feedback/thumb/fb-26.jpg" },
  { image: "img/feedback/fb-27.jpg", thumb: "img/feedback/thumb/fb-27.jpg" },
  { image: "img/feedback/fb-28.jpg", thumb: "img/feedback/thumb/fb-28.jpg" },
  { image: "img/feedback/fb-29.jpg", thumb: "img/feedback/thumb/fb-29.jpg" },
  { image: "img/feedback/fb-30.jpg", thumb: "img/feedback/thumb/fb-30.jpg" },
  { image: "img/feedback/fb-31.jpg", thumb: "img/feedback/thumb/fb-31.jpg" },
  { image: "img/feedback/fb-32.jpg", thumb: "img/feedback/thumb/fb-32.jpg" },
  { image: "img/feedback/fb-33.jpg", thumb: "img/feedback/thumb/fb-33.jpg" },
  { image: "img/feedback/fb-34.jpg", thumb: "img/feedback/thumb/fb-34.jpg" },
  { image: "img/feedback/fb-35.jpg", thumb: "img/feedback/thumb/fb-35.jpg" },
  { image: "img/feedback/fb-36.jpg", thumb: "img/feedback/thumb/fb-36.jpg" },
  { image: "img/feedback/fb-37.jpg", thumb: "img/feedback/thumb/fb-37.jpg" },
  { image: "img/feedback/fb-38.jpg", thumb: "img/feedback/thumb/fb-38.jpg" },
  { image: "img/feedback/fb-39.jpg", thumb: "img/feedback/thumb/fb-39.jpg", name: "Huỳnh Trí Bảo Family", kol: true },
  { image: "img/feedback/fb-40.jpg", thumb: "img/feedback/thumb/fb-40.jpg", name: "Hồ Bích Trâm", kol: true },
  { image: "img/feedback/fb-41.jpg", thumb: "img/feedback/thumb/fb-41.jpg", name: "Hoyer Family", kol: true },
  { image: "img/feedback/fb-42.jpg", thumb: "img/feedback/thumb/fb-42.jpg", name: "Nguyễn Quốc Vũ", kol: true },
  { image: "img/feedback/fb-43.jpg", thumb: "img/feedback/thumb/fb-43.jpg", name: "Phan Minh Huyền", kol: true },
  { image: "img/feedback/fb-44.jpg", thumb: "img/feedback/thumb/fb-44.jpg", name: "Hồ Bích Trâm", kol: true },
  { image: "img/feedback/fb-45.jpg", thumb: "img/feedback/thumb/fb-45.jpg", name: "Phan Minh Huyền", kol: true },
  { image: "img/feedback/fb-46.jpg", thumb: "img/feedback/thumb/fb-46.jpg", name: "Hoyer Family", kol: true },
  { image: "img/feedback/fb-47.jpg", thumb: "img/feedback/thumb/fb-47.jpg", name: "Hoà Minzy", kol: true },
  { image: "img/feedback/fb-48.jpg", thumb: "img/feedback/thumb/fb-48.jpg", name: "Hoà Minzy", kol: true },
  { image: "img/feedback/fb-49.jpg", thumb: "img/feedback/thumb/fb-49.jpg", name: "Đông Nhi", kol: true },
  { image: "img/feedback/fb-50.jpg", thumb: "img/feedback/thumb/fb-50.jpg", name: "Đông Nhi", kol: true },
  { image: "img/feedback/fb-51.jpg", thumb: "img/feedback/thumb/fb-51.jpg", name: "Nước dinh dưỡng Lotte", kol: true },
];

window.BANNERS = [
  { title: 'Freeship toàn quốc\ncho đơn từ 3 triệu', sub: 'Giao nhanh trong ngày nội thành Hà Nội, toàn quốc 1–3 ngày. Nhập mã <b>HCK10</b> giảm 10% (tối đa 100K, đơn từ 300K).', cta: 'Mua ngay', link: 'collections.html?sort=best', theme: 'pink', badge: 'Ưu đãi tháng 9', image: 'img/thumb/26156646705.jpg' },
  { title: 'Dinh dưỡng Hàn Quốc\nchính hãng cho bé', sub: 'Lotte, ChuChu, Calciumore, Sumo… nhập khẩu chính ngạch, tem phụ tiếng Việt, hoá đơn VAT.', cta: 'Xem sản phẩm', link: 'collections.html', theme: 'teal', badge: 'Chính hãng 100%', image: 'img/thumb/22644617070.jpg' },
  { title: 'Nước ép Lotte Organic\ngiảm đến 38%', sub: 'Giúp bé ăn ngon, tăng chiều cao – giá tốt nhất tháng này, thùng 30 gói chỉ từ <b>1.490.000₫</b>.', cta: 'Mua ngay', link: 'collections.html?cat=nuoc-ep', theme: 'amber', badge: 'Flash sale', image: 'img/thumb/22686115682.jpg' },
];

/* Đánh giá minh hoạ (KHÔNG hiển thị). Trang chủ hiện điểm đánh giá thật từ Shopee. Khi có phản hồi thật của khách, đặt SITE.showReviews = true để hiện mục này. */
window.REVIEWS = [
  { name: 'Mẹ Thu Hà', child: 'bé Bin 3 tuổi', city: 'Q.7, TP.HCM', stars: 5, text: 'Đặt hồng sâm ChuChu buổi sáng, trưa đã có hàng. Bé uống vị táo lê rất thích, dạo này ít ốm vặt hẳn. Có tem phụ đầy đủ nên mình yên tâm.', product: '22644617070' },
  { name: 'Mẹ Ngọc Anh', child: 'bé Sóc 8 tháng', city: 'Cầu Giấy, Hà Nội', stars: 5, text: 'Mua D3K2 nhỏ giọt cho con, bạn dược sĩ gọi hướng dẫn liều dùng rất kỹ. Giá tốt hơn mấy shop khác mà còn freeship.', product: '42878618667' },
  { name: 'Mẹ Phương Linh', child: 'bé Na 4 tuổi', city: 'Đà Nẵng', stars: 5, text: 'Nút mua nhanh tiện thật, chỉ nhập số điện thoại với địa chỉ là xong, không phải đăng ký tài khoản. Lần 2 mua nước ép Lotte còn tự điền sẵn luôn.', product: '22686115682' },
  { name: 'Chị Mai Trang', child: 'con trai 6 tuổi', city: 'Thủ Đức, TP.HCM', stars: 4, text: 'Con biếng ăn nên mình mua gạc hươu Sumo. Giao hàng đúng hẹn, đóng gói cẩn thận, thùng không móp. Mong shop có thêm mã giảm.', product: '26156646705' },
];

window.POSTS = [
  { id: 'chon-dinh-duong-theo-thang-tuoi', title: 'Bé mấy tháng thì dùng được nước ép, hồng sâm, D3K2? Lộ trình bổ sung theo độ tuổi', cat: 'Dinh dưỡng', date: '12/09/2026', read: '5 phút', emoji: '🍼', color: '#FFE9EF', image: 'img/thumb/22686115682.jpg',
    excerpt: 'Không phải sản phẩm nào cũng dùng được cho bé sơ sinh. Dược sĩ Hương Chất Kids gợi ý lộ trình bổ sung an toàn theo từng mốc tuổi.',
    body: ['0–6 tháng: sữa mẹ (hoặc sữa công thức) là nguồn dinh dưỡng chính. Chỉ nên bổ sung vitamin D3 (có thể kèm K2) dạng nhỏ giọt theo khuyến cáo 400IU/ngày; không dùng nước ép, hồng sâm hay thực phẩm bổ sung khác.', '6–12 tháng: bắt đầu ăn dặm. Có thể tập cho bé nước ép hoa quả – rau củ hữu cơ loại dành cho bé từ 6 tháng (pha loãng, 1/2 gói/ngày), rong biển vụn rắc cháo với lượng nhỏ.', '1–3 tuổi: bé hay ốm vặt khi đi nhà trẻ. Hồng sâm cho trẻ em, váng sữa canxi, D3K2 có thể dùng theo liều trên bao bì; ưu tiên sản phẩm ghi rõ độ tuổi.', '3–6 tuổi và tiểu học: giai đoạn tăng chiều cao nhanh, chú ý canxi + D3K2 + vận động; bé biếng ăn có thể cân nhắc gạc hươu, kẽm.', 'Nguyên tắc chung: đọc kỹ độ tuổi trên bao bì, không dùng cùng lúc nhiều sản phẩm cùng công dụng, ngưng và hỏi bác sĩ nếu bé dị ứng. Dược sĩ Hương Chất Kids tư vấn miễn phí qua Zalo trước khi mẹ đặt hàng.'] },
  { id: 'vitamin-d3-k2-cho-be', title: 'Vitamin D3 K2: vì sao bé cần bổ sung ngay từ sơ sinh?', cat: 'Vitamin', date: '08/09/2026', read: '4 phút', emoji: '☀️', color: '#FFF3D6', image: 'img/thumb/42878618667.jpg',
    excerpt: 'Theo Viện Dinh dưỡng Quốc gia, tỷ lệ trẻ em Việt Nam thiếu vitamin D còn cao. Cùng tìm hiểu liều 400IU/ngày và cách nhỏ D3 K2 đúng cho bé.',
    body: ['Vitamin D3 giúp cơ thể hấp thu canxi từ ruột, còn vitamin K2 (MK7) dẫn canxi vào đúng xương thay vì lắng đọng ở mạch máu, thận.', 'Bộ Y tế khuyến cáo bổ sung 400IU vitamin D/ngày cho trẻ từ sơ sinh, đặc biệt trẻ bú mẹ hoàn toàn.', 'Nên nhỏ D3 K2 vào buổi sáng, sau ăn để hấp thu tốt nhất. Kết hợp tắm nắng nhẹ 10–15 phút trước 9h sáng.', 'Dấu hiệu thiếu vitamin D: bé hay quấy khóc đêm, ra mồ hôi trộm, rụng tóc vành khăn, chậm mọc răng, chậm biết đi.'] },
  { id: 'be-bieng-an', title: 'Bé biếng ăn: 7 sai lầm mẹ hay mắc và cách khắc phục', cat: 'Chăm con', date: '03/09/2026', read: '6 phút', emoji: '🥄', color: '#E0F5F2', image: 'img/thumb/26156646705.jpg',
    excerpt: 'Ép ăn, cho xem tivi khi ăn, bữa ăn kéo dài quá 30 phút… là những thói quen khiến bé càng sợ ăn. Cùng xem cách sửa.',
    body: ['Biếng ăn ở trẻ có thể do sinh lý (mọc răng, tập đi), bệnh lý (thiếu kẽm, thiếu sắt, rối loạn tiêu hoá) hoặc tâm lý (bị ép ăn).', 'Sai lầm phổ biến: ép ăn, cho ăn vặt sát bữa chính, bữa ăn quá 30 phút, cho bé xem điện thoại khi ăn, thay đổi món liên tục, cho uống sữa quá nhiều, so sánh bé với trẻ khác.', 'Giải pháp: cho bé tự xúc, ăn cùng gia đình, tạo không khí vui vẻ, bổ sung kẽm/lysine nếu thiếu, đưa bé đi khám nếu biếng ăn kéo dài trên 1 tháng kèm sụt cân.'] },
  { id: 'tang-chieu-cao-tuoi-day-thi', title: 'Giai đoạn vàng tăng chiều cao: mẹ đừng bỏ lỡ tuổi 10–16', cat: 'Tuổi teen', date: '28/08/2026', read: '5 phút', emoji: '📏', color: '#F3E9FF', image: 'img/thumb/26060839019.jpg',
    excerpt: 'Tuổi dậy thì là cơ hội cuối để con tăng 8–12cm/năm. Dinh dưỡng, giấc ngủ và vận động nào giúp con cao tối đa?',
    body: ['Trước khi sụn tăng trưởng đóng lại (khoảng 16–18 tuổi ở nữ, 18–20 tuổi ở nam), con có thể tăng 8–12cm mỗi năm trong giai đoạn dậy thì.', 'Dinh dưỡng: đủ canxi (1.000–1.300mg/ngày), vitamin D3, K2, kẽm, đạm chất lượng. Sữa tươi 500ml/ngày là nguồn canxi dễ hấp thu nhất.', 'Giấc ngủ: 90% hormone tăng trưởng tiết ra khi ngủ sâu, con nên ngủ trước 22h và đủ 8–9 tiếng.', 'Vận động: bơi, bóng rổ, nhảy dây, xà đơn 30–60 phút/ngày.'] },
  { id: 'men-vi-sinh-khi-nao', title: 'Khi nào bé cần men vi sinh? Phân biệt men vi sinh và men tiêu hoá', cat: 'Tiêu hoá', date: '20/08/2026', read: '4 phút', emoji: '🌿', color: '#EEF8E6', image: 'img/thumb/45462512687.jpg',
    excerpt: 'Nhiều mẹ nhầm men vi sinh với men tiêu hoá. Dùng sai có thể khiến bé phụ thuộc. Dược sĩ giải thích rõ.',
    body: ['Men vi sinh (probiotics) là lợi khuẩn sống, giúp cân bằng hệ vi sinh đường ruột – dùng khi bé táo bón, tiêu chảy, sau kháng sinh, khóc dạ đề.', 'Men tiêu hoá là enzyme giúp phân giải thức ăn – chỉ dùng ngắn ngày khi bé thiếu enzyme, theo chỉ định bác sĩ.', 'Chọn men vi sinh có chủng được nghiên cứu (L. reuteri DSM 17938, B. infantis…), dùng cách kháng sinh 2 tiếng, pha với nước/sữa nguội dưới 40°C.'] },
  { id: 'phan-biet-hang-chinh-hang', title: 'Cách kiểm tra hàng Hàn Quốc nhập khẩu chính hãng trước khi cho bé dùng', cat: 'Mua sắm', date: '15/08/2026', read: '3 phút', emoji: '🔍', color: '#EAF0FF', image: 'img/thumb/22644617070.jpg',
    excerpt: 'Kiểm tra tem phụ, mã QR, số lô, hạn dùng… 5 bước đơn giản để mẹ tự kiểm tra sản phẩm trước khi cho con dùng.',
    body: ['1. Tem phụ tiếng Việt: ghi rõ nhà nhập khẩu, số công bố, hạn dùng.', '2. Mã QR/mã vạch: quét được thông tin sản phẩm trùng với hộp.', '3. Bao bì: seal, nắp nguyên vẹn, không móp rách; hạn dùng còn dài.', '4. Chữ Hàn trên bao bì rõ nét, in sắc; hàng giả thường mờ, sai chính tả.', '5. Hoá đơn: yêu cầu hoá đơn VAT khi mua – Hương Chất Kids xuất hoá đơn cho mọi đơn hàng.'] },
];

window.COUPONS = {
  HCK10: { type: 'percent', value: 10, max: 100000, min: 300000, desc: 'Giảm 10% (tối đa 100K) cho đơn từ 300K' },
  FREESHIP:  { type: 'ship', value: 0, min: 300000, desc: 'Miễn phí vận chuyển cho đơn từ 300K' },
  MOI50:     { type: 'fixed', value: 50000, min: 500000, desc: 'Giảm 50K cho đơn đầu tiên từ 500K' },
};

window.PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'];
