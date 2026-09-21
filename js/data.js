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
  transferFormat: '{name}_thanhtoan_{code}',   // nội dung chuyển khoản; {name} = tên khách (không dấu, in hoa), {code} = mã đơn
  workingHours: '8:00 – 22:00 (cả T7, CN)',
  hotSearches: ['Hồng sâm ChuChu', 'Nước ép Lotte', 'D3K2', 'Rong biển', 'Váng sữa canxi', 'Gạc hươu Sumo'],
  advisor: 'Dược sĩ',                 // danh xưng người tư vấn – chỉ dùng 'Dược sĩ' khi shop có dược sĩ có chứng chỉ hành nghề, nếu không đổi thành 'Chuyên viên tư vấn'
  showReviews: false,                 // true → hiện thêm mảng REVIEWS (đánh giá do shop nhập) ở trang chủ & trang sản phẩm
  flashSaleEnd: '2026-09-30T23:59:59+07:00',  // hạn chót flash sale thật; qua ngày này countdown tự ẩn
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
  { key: 'nuoc-ep',   label: 'Nước ép & nước dinh dưỡng', icon: '🧃', color: '#FFF3D6', desc: 'Lotte Organic – ăn ngon, tăng chiều cao, đề kháng', tpcn: false, image: 'img/thumb/22686115682.jpg' },
  { key: 'hong-sam',  label: 'Hồng sâm cho bé',            icon: '🌿', color: '#FFE9EF', desc: 'ChuChu Hàn Quốc – đề kháng, phục hồi sau ốm', tpcn: true, image: 'img/thumb/22644617070.jpg' },
  { key: 'vitamin',   label: 'Vitamin & canxi',            icon: '💊', color: '#EAF0FF', desc: 'D3K2 nhỏ giọt, váng sữa canxi Calciumore', tpcn: true, image: 'img/thumb/42878618667.jpg' },
  { key: 'tang-can',  label: 'Tăng cân, ăn ngon',          icon: '🍯', color: '#EEF8E6', desc: 'Gạc hươu non Sumo cho bé chậm tăng cân, biếng ăn', tpcn: true, image: 'img/thumb/26156646705.jpg' },
  { key: 'rong-bien', label: 'Rong biển cho bé (từ 1 tuổi)',           icon: '🍙', color: '#E0F5F2', desc: 'Sung Gyung, Busan – rắc cơm, trộn cơm', tpcn: false, image: 'img/thumb/45462512687.jpg' },
  { key: 'cho-me',    label: 'Dành cho mẹ',                icon: '💆‍♀️', color: '#F3E9FF', desc: 'Nghệ nano Curcumin 365 Plus', tpcn: true, image: 'img/thumb/49061985399.jpg' },
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
  { key: 'khac',       label: 'Nhập khẩu',   origin: 'Hàn Quốc', color: '#6A1B9A' },
];

/* Menu chính (desktop mega menu + menu mobile). links: [nhãn, đường dẫn]; needs/ages: key trong NEEDS/AGES */
window.NAV = [
  { label: 'Nước ép & dinh dưỡng', link: 'collections.html?cat=nuoc-ep', columns: [
    { title: 'Dòng sản phẩm', links: [['Nước ép hoa quả & rau củ Organic', 'product.html?id=22686115682'], ['Nước dinh dưỡng Organic', 'product.html?id=44353325470'], ['Lotte Khoẻ Mạnh (cam)', 'product.html?id=23660586997'], ['Lotte Xanh táo & củ dền (6 tháng+)', 'product.html?id=41353214697'], ['Nước ép lê & rễ cát cánh', 'product.html?id=43605768422']] },
    { title: 'Theo nhu cầu', needs: ['tang-chieu-cao', 'tang-can', 'de-khang', 'organic'] },
    { title: 'Theo độ tuổi', ages: ['1-3y', '3-6y', '6-12y', '12-18y'] } ] },
  { label: 'Hồng sâm & đề kháng', link: 'collections.html?cat=hong-sam', columns: [
    { title: 'Sản phẩm', links: [['Hồng sâm ChuChu tăng cao & phục hồi', 'product.html?id=28254163202'], ['Hồng sâm ChuChu ăn ngon, phục hồi sau ốm', 'product.html?id=22644617070'], ['Gạc hươu non Sumo tăng cân', 'product.html?id=26156646705']] },
    { title: 'Theo nhu cầu', needs: ['de-khang', 'phuc-hoi', 'tang-can'] },
    { title: 'Theo độ tuổi', ages: ['1-3y', '3-6y', '6-12y'] } ] },
  { label: 'Vitamin & canxi', link: 'collections.html?cat=vitamin', columns: [
    { title: 'Sản phẩm', links: [['Vitamin D3K2 nhỏ giọt 30ml', 'product.html?id=42878618667'], ['Váng sữa canxi Calciumore 30 gói', 'product.html?id=26060839019'], ['Váng sữa canxi Calciumore (trẻ & người lớn)', 'product.html?id=22376269734']] },
    { title: 'Theo nhu cầu', needs: ['d3k2', 'canxi', 'tang-chieu-cao'] },
    { title: 'Danh mục khác', links: [['Rong biển ăn dặm', 'collections.html?cat=rong-bien'], ['Tăng cân, ăn ngon', 'collections.html?cat=tang-can'], ['Dành cho mẹ', 'collections.html?cat=cho-me']] } ] },
  { label: 'Chọn theo tuổi', ages: true },
  { label: '🔥 Flash sale', link: 'collections.html?sort=discount', hot: true },
  { label: 'Cẩm nang mẹ', link: 'blog.html' },
];

/* importer / congBo (tuỳ chọn): nhà nhập khẩu & số công bố ghi trên tem phụ – điền để hiện ở bảng thông tin.
   image: ảnh thật (img/<mã Shopee>.jpg); thumb: ảnh cắt gọn 420px dùng cho thẻ sản phẩm/giỏ/tìm kiếm. variants: phân loại từ Shopee, sắp theo giá tăng dần.
   price/oldPrice = phân loại rẻ nhất (giá "từ"). shape/color: dùng vẽ ảnh minh hoạ khi chưa có ảnh. */
window.PRODUCTS = [
  { id: "41002695070", name: "Rong Biển Vụn Ăn Liền Sung Gyung - Lựa Chọn Hoàn Hảo Cho Bữa Ăn Nhanh Gọn và Bổ Dưỡng", short: "Rong biển vụn Sung Gyung", brand: "sunggyung", cat: "rong-bien",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["an-dam", "tang-can"], price: 624000, oldPrice: 1000000, rating: 4.94, reviews: 53, sold: 423, stock: 50,
    shape: "box", color: "#1B5E20", weight: "Gói 500g", origin: "Hàn Quốc", tags: ["Giảm sâu"],
    image: "img/41002695070.jpg", thumb: "img/thumb/41002695070.jpg", images: ["img/41002695070.jpg", "img/41002695070-2.jpg", "img/41002695070-3.jpg", "img/41002695070-4.jpg", "img/41002695070-5.jpg"], shopeeId: "41002695070", shopeeUrl: "https://shopee.vn/product/837223358/41002695070", shopeeCategory: "Thực phẩm và đồ uống › Đồ ăn vặt › Các loại rong biển ăn liền",
    variants: [{ label: "1 gói (500g)", price: 624000, oldPrice: 1000000 }, { label: "2 gói", price: 1248000, oldPrice: 2000000 }, { label: "3 gói", price: 1872000, oldPrice: 3000000 }],
    desc: "Rong biển vụn ăn liền Sung Gyung – rắc cơm, cháo hoặc trộn cơm nắm cho bé. Rong biển Hàn Quốc sấy giòn, vị nhạt, giúp bữa ăn của con nhanh gọn mà vẫn bổ dưỡng.",
    highlights: ["Rong biển Hàn Quốc sấy giòn, thơm, vị nhạt phù hợp trẻ nhỏ", "Rắc cơm, cháo, cơm nắm, kimbap – bé ăn ngon hơn", "Tiện lợi cho bữa sáng và hộp cơm đi học"],
    usage: "Rắc trực tiếp lên cơm, cháo hoặc trộn cơm nắm cho bé. Đậy kín sau khi mở, bảo quản nơi khô ráo, tránh ẩm." },

  { id: "22686115682", name: "Nước Ép Lotte Hoa Quả Và Rau Củ Organic Giúp Bé Phát Triển Chiều Cao, Ăn Ngon Miệng, Tăng Cường Sức Khỏe", short: "Nước ép Lotte Organic hoa quả & rau củ", brand: "lotte", cat: "nuoc-ep",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["tang-chieu-cao", "tang-can", "de-khang", "organic"], price: 495000, oldPrice: 800000, rating: 4.93, reviews: 525, sold: 3000, stock: 50,
    shape: "box", color: "#E60012", weight: "Gói 100ml", origin: "Hàn Quốc", tags: ["Giảm sâu"],
    image: "img/22686115682.jpg", thumb: "img/thumb/22686115682.jpg", images: ["img/22686115682.jpg", "img/22686115682-3.jpg", "img/22686115682-4.jpg", "img/22686115682-5.jpg"], shopeeId: "22686115682", shopeeUrl: "https://shopee.vn/product/837223358/22686115682", shopeeCategory: "Thực phẩm và đồ uống › Đồ uống › Khác",
    variants: [{ label: "Khoẻ Mạnh (Cam) · 10 gói", price: 495000, oldPrice: 800000 }, { label: "Mix vị · 10 gói", price: 800000, oldPrice: null }, { label: "Mix vị · Thùng 30 gói", price: 1490000, oldPrice: 1800000 }, { label: "Khoẻ Mạnh (Cam) · Thùng 30 gói", price: 1490000, oldPrice: 1800000 }],
    desc: "Nước ép hoa quả và rau củ hữu cơ Lotte (Hàn Quốc) dạng gói tiện lợi, vị cam “Khoẻ Mạnh” hoặc mix vị. Theo nhà sản xuất, sản phẩm bổ sung vitamin từ rau quả organic giúp bé ăn ngon miệng, hỗ trợ phát triển chiều cao và tăng cường sức khoẻ.",
    highlights: ["Nguyên liệu hoa quả & rau củ hữu cơ (Organic)", "Gói nhỏ có ống hút – tiện mang đi học, đi chơi", "Chọn vị cam “Khoẻ Mạnh” hoặc thùng mix vị"],
    usage: "Bé uống 1–2 gói/ngày, ngon hơn khi để mát. Dùng theo hướng dẫn trên bao bì." },

  { id: "42878618667", name: "Vitamin D3K2– Hỗ Trợ Phát Triển Xương Răng, Tăng Đề Kháng, Tim Mạch – Lọ 30ml", short: "Vitamin D3K2 Pure Vitality 30ml", brand: "purevitality", cat: "vitamin",
    ages: ["0-6m", "6-12m", "1-3y", "3-6y", "6-12y"], needs: ["d3k2", "tang-chieu-cao", "canxi", "de-khang"], price: 468000, oldPrice: 500000, rating: 5.0, reviews: 69, sold: 356, stock: 50,
    shape: "bottle", color: "#E0A526", weight: "Lọ 30ml", origin: "New Zealand", tags: ["Bán chạy"],
    image: "img/42878618667.jpg", thumb: "img/thumb/42878618667.jpg", images: ["img/42878618667.jpg", "img/42878618667-2.jpg", "img/42878618667-3.jpg", "img/42878618667-4.jpg", "img/42878618667-5.jpg"], shopeeId: "42878618667", shopeeUrl: "https://shopee.vn/product/837223358/42878618667", shopeeCategory: "Mẹ & Bé › Chăm sóc sức khỏe bé › Vitamin & Thực phẩm bổ sung",
    variants: [{ label: "1 lọ", price: 468000, oldPrice: 500000 }, { label: "2 lọ", price: 936000, oldPrice: 1000000 }],
    desc: "Vitamin D3 + K2 Pure Vitality (New Zealand) dạng nhỏ giọt 30ml, hương táo NZ. Theo nhà sản xuất, D3 hỗ trợ hấp thu canxi, K2 giúp đưa canxi vào xương, hỗ trợ phát triển xương răng và đề kháng cho bé. Có chứng nhận HACCP, GMP. Mua 2 lọ tiết kiệm hơn.",
    highlights: ["Sản xuất tại New Zealand, chứng nhận HACCP & GMP", "D3 hỗ trợ hấp thu canxi, K2 dẫn canxi vào xương", "Dạng giọt vị táo, dễ dùng cho bé từ sơ sinh"],
    usage: "Nhỏ trực tiếp vào miệng bé hoặc pha vào sữa, dùng vào buổi sáng sau ăn. Liều dùng theo hướng dẫn trên bao bì hoặc dược sĩ tư vấn." },

  { id: "45462512687", name: "Rong biển Tăng cao Busan trộn cơm Hàn Quốc, giúp bé cao lớn, bổ sung chất xơ vitamin", short: "Rong biển tăng cao Busan trộn cơm", brand: "busan", cat: "rong-bien",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["an-dam", "tang-chieu-cao", "tieu-hoa"], price: 589000, oldPrice: 600000, rating: 0.0, reviews: 0, sold: 12, stock: 50,
    shape: "box", color: "#00695C", weight: "Gói 40g", origin: "Hàn Quốc", tags: [],
    image: "img/45462512687.jpg", thumb: "img/thumb/45462512687.jpg", images: ["img/45462512687.jpg", "img/45462512687-2.jpg", "img/45462512687-3.jpg", "img/45462512687-4.jpg", "img/45462512687-5.jpg"], shopeeId: "45462512687", shopeeUrl: "https://shopee.vn/product/837223358/45462512687", shopeeCategory: "Thực phẩm và đồ uống › Đồ ăn vặt › Các loại rong biển ăn liền",
    variants: [{ label: "1 gói", price: 589000, oldPrice: 600000 }, { label: "2 gói", price: 1178000, oldPrice: 1200000 }, { label: "3 gói", price: 1767000, oldPrice: 1800000 }, { label: "4 gói", price: 2356000, oldPrice: 2400000 }, { label: "5 gói", price: 2945000, oldPrice: 3000000 }],
    desc: "Rong biển Busan trộn cơm Hàn Quốc, bổ sung chất xơ và vitamin tự nhiên từ rong biển. Vị mặn nhẹ, giòn, trộn cơm là bé ăn hết bát.",
    highlights: ["Rong biển Busan – vùng rong biển nổi tiếng Hàn Quốc", "Bổ sung chất xơ, vitamin tự nhiên", "Trộn cơm, làm cơm nắm, kimbap cho bé"],
    usage: "Trộn 1 gói nhỏ với cơm nóng hoặc rắc lên cháo. Bảo quản nơi khô ráo, dùng hết sau khi mở gói." },

  { id: "28254163202", name: "Hồng Sâm ChuChu Hàn Quốc Giúp bé Tăng Sức Đề Kháng, Tăng Cao Và Phục Hồi Sức Khoẻ", short: "Hồng sâm ChuChu tăng cao & phục hồi", brand: "chuchu", cat: "hong-sam",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["de-khang", "tang-chieu-cao", "phuc-hoi"], price: 350000, oldPrice: null, rating: 4.9, reviews: 20, sold: 119, stock: 50,
    shape: "box", color: "#B5121B", weight: "Gói 20ml", origin: "Hàn Quốc", tags: ["Bán chạy"],
    image: "img/28254163202.jpg", thumb: "img/thumb/28254163202.jpg", images: ["img/28254163202.jpg", "img/28254163202-2.jpg", "img/28254163202-3.jpg", "img/28254163202-4.jpg"], shopeeId: "28254163202", shopeeUrl: "https://shopee.vn/product/837223358/28254163202", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    variants: [{ label: "Mix · 10 gói", price: 350000, oldPrice: null }, { label: "Nho– Việt Quất · 10 gói", price: 350000, oldPrice: null }, { label: "Táo lê · 10 gói", price: 350000, oldPrice: null }, { label: "Nho– Việt Quất · 20 gói", price: 680000, oldPrice: 700000 }, { label: "Táo lê · 20 gói", price: 680000, oldPrice: 700000 }, { label: "Mix · 20 gói", price: 680000, oldPrice: 700000 }, { label: "Mix · thùng 40 gói", price: 1340000, oldPrice: 1400000 }, { label: "Nho– Việt Quất · thùng 40 gói", price: 1340000, oldPrice: 1400000 }, { label: "Táo lê · thùng 40 gói", price: 1340000, oldPrice: 1400000 }],
    desc: "Hồng sâm ChuChu Hàn Quốc dạng gói uống liền cho bé, vị táo lê, nho – việt quất hoặc mix. Theo nhà sản xuất, hồng sâm giúp bé tăng sức đề kháng, hỗ trợ phát triển chiều cao và phục hồi sức khoẻ.",
    highlights: ["Hồng sâm Hàn Quốc cho trẻ em, vị trái cây dễ uống", "3 vị: Táo lê, Nho – việt quất, Mix", "Mua thùng 40 gói tiết kiệm hơn"],
    usage: "Bé uống 1 gói/ngày sau bữa ăn. Lắc đều trước khi dùng. Liều dùng theo hướng dẫn trên bao bì." },

  { id: "44353325470", name: "Nước Dinh Dưỡng Lotte Hoa Quả Và Rau Củ Organic Giúp Bé Phát Triển Chiều Cao, Ăn Ngon, Tăng Sức Khỏe", short: "Nước dinh dưỡng Lotte Organic", brand: "lotte", cat: "nuoc-ep",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["tang-chieu-cao", "tang-can", "de-khang", "organic"], price: 495000, oldPrice: 500000, rating: 4.98, reviews: 416, sold: 4000, stock: 50,
    shape: "box", color: "#F57C00", weight: "Gói 100ml", origin: "Hàn Quốc", tags: [],
    image: "img/44353325470.jpg", thumb: "img/thumb/44353325470.jpg", images: ["img/44353325470.jpg", "img/44353325470-2.jpg", "img/44353325470-3.jpg", "img/44353325470-4.jpg", "img/44353325470-5.jpg"], shopeeId: "44353325470", shopeeUrl: "https://shopee.vn/product/837223358/44353325470", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    variants: [{ label: "10 gói · Tăng đề kháng (cam)", price: 495000, oldPrice: 500000 }, { label: "10 gói · Mix vị", price: 500000, oldPrice: null }, { label: "Thùng 30 gói · Mix vị", price: 1490000, oldPrice: 1500000 }, { label: "Thùng 30 gói · Tăng đề kháng (cam)", price: 1490000, oldPrice: 1500000 }],
    desc: "Nước dinh dưỡng Lotte từ hoa quả và rau củ hữu cơ, vị cam “Tăng đề kháng” hoặc mix vị. Theo nhà sản xuất, sản phẩm giúp bé phát triển chiều cao, ăn ngon và tăng sức khoẻ.",
    highlights: ["Hoa quả & rau củ Organic Hàn Quốc", "Vị cam tăng đề kháng hoặc thùng mix vị", "Thùng 30 gói đủ dùng cả tháng"],
    usage: "Bé uống 1–2 gói/ngày. Dùng theo hướng dẫn trên bao bì." },

  { id: "22644617070", name: "Hồng Sâm ChuChu Hàn Quốc Giúp Trẻ Tăng Sức Đề Kháng, ăn ngon Và Phục Hồi Sức Khoẻ Sau Khi Bị Ốm", short: "Hồng sâm ChuChu ăn ngon & phục hồi sau ốm", brand: "chuchu", cat: "hong-sam",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["de-khang", "tang-can", "phuc-hoi"], price: 350000, oldPrice: null, rating: 4.92, reviews: 165, sold: 699, stock: 50,
    shape: "box", color: "#C62828", weight: "Gói 20ml", origin: "Hàn Quốc", tags: ["Bán chạy"],
    image: "img/22644617070.jpg", thumb: "img/thumb/22644617070.jpg", images: ["img/22644617070.jpg", "img/22644617070-4.jpg", "img/22644617070-5.jpg"], shopeeId: "22644617070", shopeeUrl: "https://shopee.vn/product/837223358/22644617070", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    variants: [{ label: "Việt quất – nho · 10 gói", price: 350000, oldPrice: null }, { label: "Táo lê · 10 gói", price: 350000, oldPrice: null }, { label: "Mix vị · 20 gói (nửa thùng)", price: 680000, oldPrice: null }, { label: "Táo lê · 20 gói (nửa thùng)", price: 680000, oldPrice: null }, { label: "Việt quất – nho · 20 gói (nửa thùng)", price: 680000, oldPrice: null }, { label: "Mix vị · 40 gói (1 thùng)", price: 1340000, oldPrice: null }, { label: "Việt quất – nho · 40 gói (1 thùng)", price: 1340000, oldPrice: null }, { label: "Táo lê · 40 gói (1 thùng)", price: 1340000, oldPrice: null }],
    desc: "Hồng sâm ChuChu Hàn Quốc dành cho trẻ hay ốm vặt, biếng ăn. Theo nhà sản xuất, sản phẩm giúp trẻ tăng sức đề kháng, ăn ngon và phục hồi sức khoẻ sau khi bị ốm. Có gói 10, nửa thùng và nguyên thùng.",
    highlights: ["Cho bé hay ốm vặt, mới ốm dậy, biếng ăn", "Vị táo lê, việt quất – nho hoặc mix", "Nửa thùng / 1 thùng giá tốt hơn"],
    usage: "Bé uống 1 gói/ngày sau bữa ăn. Liều dùng theo hướng dẫn trên bao bì." },

  { id: "26156646705", name: "Gạc Hươu Non Sumo Chiết Xuất Nhung Hươu Hỗ Trợ Tăng Cân, Giúp Con Ăn Ngon", short: "Gạc hươu non Sumo", brand: "sumo", cat: "tang-can",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["tang-can", "canxi", "de-khang"], price: 429000, oldPrice: 500000, rating: 5.0, reviews: 32, sold: 161, stock: 50,
    shape: "box", color: "#8D6E63", weight: "Gói", origin: "Hàn Quốc", tags: ["Giảm sâu"],
    image: "img/26156646705.jpg", thumb: "img/thumb/26156646705.jpg", images: ["img/26156646705.jpg", "img/26156646705-2.jpg", "img/26156646705-3.jpg", "img/26156646705-4.jpg", "img/26156646705-5.jpg"], shopeeId: "26156646705", shopeeUrl: "https://shopee.vn/product/837223358/26156646705", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    variants: [{ label: "10 gói", price: 429000, oldPrice: 500000 }, { label: "20 gói", price: 1000000, oldPrice: null }, { label: "30 gói", price: 1265000, oldPrice: 1350000 }, { label: "1 thùng gạc canxi", price: 1500000, oldPrice: null }, { label: "1 thùng 40 gói", price: 1639000, oldPrice: 1800000 }],
    desc: "Gạc hươu non Sumo chiết xuất nhung hươu Hàn Quốc dạng gói uống. Theo nhà sản xuất, sản phẩm hỗ trợ bé tăng cân, ăn ngon miệng và bổ sung canxi cho bé chậm lớn.",
    highlights: ["Chiết xuất nhung hươu non Hàn Quốc", "Hỗ trợ tăng cân, ăn ngon cho bé chậm lớn", "Có bản gạc canxi (thùng)"],
    usage: "Bé uống 1 gói/ngày sau ăn. Liều dùng theo hướng dẫn trên bao bì hoặc dược sĩ tư vấn." },

  { id: "23660586997", name: "Nước Ép LOTTE KHOẺ MẠNH - Bổ Sung Vitamin Giúp Trẻ Ăn Ngon Miệng, Tăng Cường Hệ Miễn Dịch", short: "Nước ép Lotte Khoẻ Mạnh (cam)", brand: "lotte", cat: "nuoc-ep",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["vitamin-tong-hop", "tang-can", "de-khang"], price: 495000, oldPrice: 800000, rating: 5, reviews: 0, sold: 0, stock: 50,
    shape: "box", color: "#FB8C00", weight: "Gói 100ml", origin: "Hàn Quốc", tags: ["Giảm sâu"],
    image: "img/23660586997.jpg", shopeeId: "23660586997", shopeeUrl: "https://shopee.vn/product/837223358/23660586997", shopeeCategory: "Thực phẩm và đồ uống › Đồ uống › Khác",
    variants: [{ label: "10 gói (cam)", price: 495000, oldPrice: 800000 }, { label: "Thùng 30 gói (cam)", price: 1490000, oldPrice: 2100000 }],
    desc: "Nước ép Lotte Khoẻ Mạnh vị cam bổ sung vitamin, theo nhà sản xuất giúp trẻ ăn ngon miệng và tăng cường hệ miễn dịch. Đang giảm giá sâu – mua thùng 30 gói tiết kiệm nhất.",
    highlights: ["Bổ sung vitamin từ cam", "Vị cam ngọt dịu, bé thích uống", "Giảm giá sâu cho thùng 30 gói"],
    usage: "Bé uống 1–2 gói/ngày. Dùng theo hướng dẫn trên bao bì." },

  { id: "26060839019", name: "Váng Sữa Canxi Hữu Cơ 30 Gói CALCIUMORE CALCIUM SUPPLEMENT Hàn Quốc Xương Phát Triển, Bé Cao Tối Đa", short: "Canxi hữu cơ Calciumore (dạng váng sữa) 30 gói", brand: "calciumore", cat: "vitamin",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["canxi", "tang-chieu-cao", "organic"], price: 1100000, oldPrice: null, rating: 4.92, reviews: 156, sold: 663, stock: 50,
    shape: "box", color: "#F9A825", weight: "30 gói", origin: "Hàn Quốc", tags: [],
    image: "img/26060839019.jpg", thumb: "img/thumb/26060839019.jpg", images: ["img/26060839019.jpg", "img/26060839019-3.jpg", "img/26060839019-4.jpg", "img/26060839019-5.jpg"], shopeeId: "26060839019", shopeeUrl: "https://shopee.vn/product/837223358/26060839019", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Đồ ăn nhẹ cho bé",
    variants: [{ label: "30 gói (không hộp)", price: 1100000, oldPrice: null }, { label: "1 hộp 90 gói", price: 3225000, oldPrice: 3500000 }],
    desc: "Canxi bổ sung dạng gói sệt vị váng sữa (không phải váng sữa tráng miệng) – Calciumore Calcium Supplement Hàn Quốc. Theo nhà sản xuất, sản phẩm bổ sung canxi hữu cơ giúp xương phát triển, hỗ trợ bé cao tối đa.",
    highlights: ["Canxi hữu cơ dễ hấp thu", "Dạng váng sữa thơm ngon, bé không sợ uống", "Hộp 90 gói dùng trong 3 tháng"],
    usage: "Bé dùng 1 gói/ngày sau bữa ăn. Liều dùng theo hướng dẫn trên bao bì." },

  { id: "22376269734", name: "Váng Sữa Canxi Hữu Cơ CALCIUMORE CALCIUM SUPPLEMENT Hàn Quốc Bé Lớn Khỏe Dành Cho Trẻ & Người Lớn", short: "Canxi hữu cơ Calciumore (dạng váng sữa) hộp 90 gói – bé & cả nhà", brand: "calciumore", cat: "vitamin",
    ages: ["3-6y", "6-12y", "12-18y"], needs: ["canxi", "tang-chieu-cao", "cho-me"], price: 3225000, oldPrice: 3500000, rating: 4.9, reviews: 132, sold: 554, stock: 50,
    shape: "box", color: "#FBC02D", weight: "Hộp 90 gói", origin: "Hàn Quốc", tags: [],
    image: "img/22376269734.jpg", thumb: "img/thumb/22376269734.jpg", images: ["img/22376269734.jpg", "img/22376269734-2.jpg", "img/22376269734-3.jpg", "img/22376269734-4.jpg", "img/22376269734-5.jpg"], shopeeId: "22376269734", shopeeUrl: "https://shopee.vn/product/837223358/22376269734", shopeeCategory: "Mẹ & Bé › Chăm sóc sức khỏe bé › Vitamin & Thực phẩm bổ sung",
    variants: [{ label: "1 hộp 90 gói", price: 3225000, oldPrice: 3500000 }, { label: "2 hộp 180 gói", price: 6448000, oldPrice: 7000000 }],
    desc: "Canxi hữu cơ dạng gói vị váng sữa (không phải váng sữa tráng miệng) Calciumore Hàn Quốc “Bé lớn khoẻ”, dùng được cho cả trẻ em và người lớn. Bổ sung canxi hữu cơ cho tuổi dậy thì tăng chiều cao và cho mẹ sau sinh, người lớn tuổi.",
    highlights: ["Dùng được cho cả gia đình: bé, mẹ, ông bà", "Canxi hữu cơ hỗ trợ xương chắc khoẻ", "Mua 2 hộp tiết kiệm hơn"],
    usage: "1 gói/ngày sau bữa ăn. Liều dùng theo hướng dẫn trên bao bì." },

  { id: "49061985399", name: "Tinh Chất Nghệ Nano Curcumin 365 Plus Hàn Quốc 32 Tép/Hộp - Hỗ Trợ Dạ Dày, Đẹp Da, Mờ Thâm Sẹo", short: "Nghệ nano Curcumin 365 Plus", brand: "365plus", cat: "cho-me",
    ages: [], needs: ["cho-me"], price: 1548000, oldPrice: null, rating: 0.0, reviews: 0, sold: 5, stock: 50,
    shape: "box", color: "#EF6C00", weight: "32 tép/hộp", origin: "Hàn Quốc", tags: ["Cho mẹ"],
    image: "img/49061985399.jpg", thumb: "img/thumb/49061985399.jpg", images: ["img/49061985399.jpg", "img/49061985399-2.jpg", "img/49061985399-3.jpg", "img/49061985399-4.jpg", "img/49061985399-5.jpg"], shopeeId: "49061985399", shopeeUrl: "https://shopee.vn/product/837223358/49061985399", shopeeCategory: "Sắc Đẹp › Chăm sóc da mặt › Tinh chất dưỡng",
    desc: "Tinh chất nghệ nano Curcumin 365 Plus Hàn Quốc, hộp 32 tép. Theo nhà sản xuất, sản phẩm hỗ trợ dạ dày, giúp đẹp da, mờ thâm sẹo – phù hợp cho mẹ sau sinh.",
    highlights: ["Nano curcumin hấp thu tốt hơn nghệ thường", "Hỗ trợ dạ dày, đẹp da, mờ thâm", "Tép nhỏ tiện dùng hằng ngày"],
    usage: "Người lớn dùng 1 tép/ngày sau ăn. Dùng theo hướng dẫn trên bao bì. Mẹ đang mang thai hoặc cho con bú cần hỏi ý kiến bác sĩ trước khi dùng." },

  { id: "41353214697", name: "Nước ép táo & củ dền hữu cơ Lotte Xanh – bổ sung canxi, sắt cho bé từ 6 tháng", short: "Nước ép táo & củ dền hữu cơ Lotte (Xanh)", brand: "lotte", cat: "nuoc-ep",
    ages: ["6-12m", "1-3y", "3-6y", "6-12y"], needs: ["canxi", "organic", "an-dam"], price: 600000, oldPrice: null, rating: 5.0, reviews: 23, sold: 190, stock: 50,
    shape: "box", color: "#2E7D32", weight: "10 gói", origin: "Hàn Quốc", tags: [],
    image: "img/41353214697.jpg", thumb: "img/thumb/41353214697.jpg", images: ["img/41353214697.jpg", "img/41353214697-3.jpg", "img/41353214697-4.jpg", "img/41353214697-5.jpg"], shopeeId: "41353214697", shopeeUrl: "https://shopee.vn/product/837223358/41353214697", shopeeCategory: "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    desc: "Nước dinh dưỡng Lotte Xanh Hàn Quốc, theo nhà sản xuất hỗ trợ phát triển chiều cao ở trẻ nhỏ và tuổi dậy thì.",
    highlights: ["Dùng được cho bé từ 6 tháng – hợp giai đoạn ăn dặm", "Táo & củ dền hữu cơ, chứng nhận Organic, HACCP", "Bổ sung canxi, sắt, axit folic"],
    usage: "Bé 6–12 tháng: 1/2–1 gói/ngày, cho uống bằng thìa hoặc bình; bé trên 1 tuổi: 1 gói/ngày. Theo hướng dẫn trên bao bì." },

  { id: "43605768422", name: "Nước ép Lê và Rễ cát cánh hữu cơ Organic LOTTE Giúp Trẻ Ăn Ngon Miệng, Tăng Cường Hệ Miễn Dịch", short: "Nước ép lê & rễ cát cánh hữu cơ Lotte", brand: "lotte", cat: "nuoc-ep",
    ages: ["1-3y", "3-6y", "6-12y"], needs: ["tang-can", "de-khang", "organic"], price: 495000, oldPrice: 500000, rating: 5, reviews: 0, sold: 0, stock: 50,
    shape: "box", color: "#7CB342", weight: "Gói 100ml", origin: "Hàn Quốc", tags: [],
    image: "img/43605768422.jpg", shopeeId: "43605768422", shopeeUrl: "https://shopee.vn/product/837223358/43605768422", shopeeCategory: "Thực phẩm và đồ uống › Đồ uống › Khác",
    variants: [{ label: "10 gói", price: 495000, oldPrice: 500000 }, { label: "Thùng 30 gói", price: 1490000, oldPrice: 1500000 }],
    desc: "Nước ép lê và rễ cát cánh hữu cơ Organic Lotte – bài kết hợp quen thuộc của Hàn Quốc giúp dịu họng. Theo nhà sản xuất, sản phẩm giúp trẻ ăn ngon miệng và tăng cường hệ miễn dịch.",
    highlights: ["Lê + rễ cát cánh: bộ đôi dịu họng của người Hàn", "Nguyên liệu hữu cơ, vị ngọt thanh", "Thùng 30 gói giá tốt"],
    usage: "Bé uống 1–2 gói/ngày, có thể hâm ấm khi trời lạnh. Dùng theo hướng dẫn trên bao bì." }
];

/* Feedback thực tế của khách (ảnh chụp tin nhắn/bình luận/ảnh bé dùng sản phẩm) – đặt file vào img/feedback/.
   Chỉ dùng ảnh đã được khách đồng ý; nên làm mờ tên/avatar; không dùng ảnh có tuyên bố chữa bệnh, "cao thêm X cm" (quy định quảng cáo TPCN).
   Mỗi mục: image (bắt buộc), name (VD 'Mẹ Hà · Hà Nội'), product (mã sản phẩm, tuỳ chọn), text (trích ngắn, tuỳ chọn), date (tuỳ chọn). Để mảng rỗng → mục tự ẩn. */
window.FEEDBACKS = [
  // { image: 'img/feedback/fb-01.jpg', name: 'Mẹ Hà · Hà Nội', product: '22644617070', text: 'Bé uống hồng sâm đều 2 tháng, đi lớp ít ốm vặt hẳn.', date: '09/2026' },
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
