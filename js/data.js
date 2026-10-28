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
  hotline: '(+84) 967.233.003',
  hotlineTel: '+84967233003',
  zalo: 'https://zalo.me/2560253151670008554',
  zaloQr: 'img/zalo-qr-oa.png',     // mã QR Zalo OA của shop hiện ở footer & modal gọi lại
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
  /* Phí giao tiêu chuẩn theo BẢNG PHÍ SHIP J&T EXPRESS của shop (21/10/2026): đồng giá toàn quốc, tính theo số thùng / kiện.
     thung: hàng đóng thùng – mỗi nhóm tính gia[số thùng − 1] (heSo: số thùng của 1 phân loại, nếu có) (nhiều hơn bảng → cộng tiếp từ đầu bảng); số thùng = số gói ÷ goiMotThung
       (phân loại ghi "… gói"), hoặc số thùng ghi trong tên phân loại. Chưa đủ 1 thùng → tính như hàng khác.
     hangKhac: mỗi kiện tới kgMoiKien kg giá gia (cân nặng ước tính theo gramTheoSP / gramTheoDanhMuc bên dưới).
     Các nhóm trong một đơn cộng lại. Đơn từ freeshipFrom vẫn miễn phí. Kiện hoàn / đổi: hoanDoi × phí ship lượt đi. */
  shipping: {
    hang: 'J&T Express',
    thung: [
      { ten: 'Lotte', ids: ['22686115682', '23660586997', '41353214697', '25632276959', 'combo-lottexanh-d3k2', 'suaxanh-lotte', 'lotte-hau-an'], heSo: { 'Date 12/2026 · Mua 1 tặng 1 (2 thùng)': 2, 'Date 03/2027 · Thùng 24 hộp': 1 }, goiMotThung: 30, gia: [30000, 60000, 130000, 130000] },
      { ten: 'Gạc hươu non', ids: ['26156646705'], goiMotThung: 40, gia: [50000, 80000, 130000] },
      { ten: 'Gạc canxi', ids: ['gac-canxi-sumo'], heSo: { 'Hộp 10 gói': 1 / 3, 'Thùng 30 gói': 1, 'Thùng 40 gói': 1 }, gia: [50000, 80000, 130000] },
      { ten: 'Hồng sâm ChuChu', ids: ['22644617070'], goiMotThung: 40, gia: [50000, 80000, 130000] },
      { ten: 'Norco', ids: ['26523206270'], gia: [50000, 80000, 130000] },
    ],
    hangKhac: { kgMoiKien: 3, gia: 30000 },
    hoanDoi: 1.5,
    dongGoi: 100,                                          // gram thùng/hộp đóng gói cộng thêm mỗi đơn
    /* Cân nặng ước tính (gram) cho 1 đơn vị = phân loại đầu tiên. Phân loại khác quy đổi theo tỉ lệ giá (2 hộp ≈ 2 lần). */
    gramTheoDanhMuc: { 'nuoc-ep': 1100, 'sua': 1000, 'hong-sam': 450, 'vitamin': 200, 'tang-can': 400, 'rong-bien': 500, 'thuc-pham': 600, 'do-an': 400, 'cho-me': 350 },
    gramTheoSP: {
      '26523206270': 12500,  // sữa tươi Norco – 1 thùng 12 hộp 1L
      '26060839019': 700,    // váng sữa Calciumore 30 gói
      '42878618667': 150,    // D3K2 30ml
      'combo-vangsua-d3k2': 2250, // combo 1 hộp váng sữa 90 gói + 1 lọ D3K2
      '41002695070': 600,    // rong biển Sung Gyung 500g
      '28467224687': 1100,   // táo đỏ 1kg
      '43532388498': 300,    // granola 200g
      'ngu-coc-bap-thien-ma-kitea': 1100,   // ngũ cốc thiên ma Kitea hộp 900g
      '19491505209': 1050, '19682441455': 1050, '20992159167': 1050,   // sữa Biostime 800g
      '47357633686': 1300,   // sâm Pinkfong
      '27355720019': 550,    // hồng sâm Rich Kid 10 gói 40ml
      '48112514210': 500,    // collagen 90 gói
      '50002678694': 3000,   // thảm ngải cứu
      '27809051612': 1000,   // cặp dầu gội & xả 400ml
      '24465090622': 450,    // sữa tắm 300ml
      '24767149051': 200,    // NMN 60 viên
      'suaxanh-lotte': 3500, // sữa xanh Lotte – thùng 24 hộp 125ml
      'men-sysy': 350,
      'binh-giu-nhiet-hck': 450,      // bình giữ nhiệt có hộp
      'lotte-hau-an': 3300,      // Lotte Háu Ăn – thùng 24 hộp 125ml
      'mabelle-6999': 60,      // quần lót MaBelle 1 cái
      'mabelle-5192': 120,      // áo lót MaBelle 1 chiếc
      'mabelle-5790': 120,      // áo lót MaBelle 1 chiếc
      'mabelle-5038': 120,      // áo lót MaBelle 1 chiếc
      'mabelle-5997': 120,      // áo lót MaBelle 1 chiếc
      'mabelle-5992': 120,      // áo lót MaBelle 1 chiếc
      'avca-body-tone-up': 400,      // serum body AVCA 250ml có hộp
      'daycell-nad-white-cream': 400,      // kem NAD+ 50ml hũ thuỷ tinh có hộp
      'drvita-ecm-serum': 300,      // serum Dr.VITA 100ml có hộp
      'gac-canxi-sumo': 950,      // gạc canxi Sumo hộp 10 gói × 80ml       // men vi sinh Sysy – hộp 6 gói lớn × 10 gói 2g
    },
  },
  expert: { title: 'Chuyên gia dinh dưỡng', phone: '+84392312796', display: '(+84) 392 312 796', zalo: 'https://zalo.me/0392312796' },  // gặp trực tiếp chuyên gia
  bank: { name: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)', bin: '970418', account: '8855349222', holder: 'DO VAN HOANG' },  // holder: tên chủ tài khoản in hoa không dấu (VD: NGUYEN VAN A) – hiện cạnh mã QR
  orderEndpoint: 'https://crm.huongchatkids.com/api/webhook/web-don/8a0ff1e000d7d4cc5c16ff1bf3b952d3',  // đơn web gửi thẳng về CRM (crm.huongchatkids.com). OTP & hồ sơ khách vẫn qua Apps Script ở loyalty.endpoint bên dưới
  transferFormat: '{name}_thanhtoan_{code}',   // nội dung chuyển khoản; {name} = tên khách (không dấu, in hoa), {code} = mã đơn
  workingHours: '8:00 – 22:00 (cả T7, CN)',
  hotSearches: ['Hồng sâm ChuChu', 'Nước ép Lotte', 'Sữa Biostime', 'D3K2', 'Táo đỏ Tân Cương', 'Men vi sinh'],
  advisor: 'Chuyên gia dinh dưỡng',  // danh xưng người tư vấn hiển thị trên toàn bộ website
  showReviews: false,                 // true → hiện thêm mảng REVIEWS (đánh giá do shop nhập) ở trang chủ & trang sản phẩm
  showOldPrice: false,                // false → web CHỈ hiện giá bán, ẩn hết giá niêm yết (giá gạch ngang) và % giảm. Đổi thành true nếu muốn hiện lại.
  /* Khách hàng thân thiết: nhận diện bằng SỐ ĐIỆN THOẠI, xác thực bằng mã OTP.
     Dữ liệu khách nằm trong Google Sheet của shop (qua Apps Script ở orderEndpoint). */
  loyalty: {
    enabled: true,
    endpoint: 'https://103-77-242-192.sslip.io/api',   // máy chủ API trên VPS (từ 16/10/2026). Quay lại Apps Script: https://script.google.com/macros/s/AKfycbzgqygxD6zYswgL8HtoBcvWvYRTQjjejhpt7H2Sqz9LcrzHVk0zt4iKf6_7JerNSUgG/exec
    combineWithCoupon: false,  // false = KHÔNG cộng dồn ưu đãi hạng với mã giảm giá, web tự lấy mức có lợi nhất cho khách
    otpPhut: 10,               // mã OTP sống bao nhiêu phút
    nhoPhienNgay: 30,          // đăng nhập bằng OTP xong thì nhớ máy khách bao nhiêu ngày
    sinhNhat: { bat: true, giam: 10 },   // tháng sinh nhật: giảm giam% mọi đơn (khách đã đăng nhập, có ngày sinh); không cộng dồn với ưu đãi hạng – lấy mức cao hơn
  },
  flashSaleEnd: 'daily',  // 'daily' = ưu đãi trong hôm nay (đếm ngược tới 24:00, mỗi ngày tự đếm lại); hoặc đặt hạn cụ thể '2026-09-30T23:59:59+07:00' (qua ngày này countdown tự ẩn)
  facebook: 'https://www.facebook.com/huongchatkids.vn', instagram: '', youtube: '', tiktok: '',   // điền link mạng xã hội, để trống sẽ ẩn icon
};
/* Web mở thẳng trên VPS mới (chạy thử trước ngày đổi tên miền) → gọi máy chủ API của chính VPS (/api). Trên huongchatkids.vn không đổi gì. */
if (/^(103\.77\.242\.192|103-77-242-192\.sslip\.io)$/.test(location.hostname)) window.SITE.loyalty.endpoint = location.origin + '/api';

window.AGES = [
  { key: '0-6m',   label: '0–6 tháng',  emoji: '🍼', desc: 'Sơ sinh',   color: '#FFE9EF' },
  { key: '6-12m',  label: '6–12 tháng', emoji: '🥣', desc: 'Ăn dặm',    color: '#FFF3D6' },
  { key: '1-3y',   label: '1–3 tuổi',   emoji: '🧸', desc: 'Tập đi',    color: '#E0F5F2' },
  { key: '3-6y',   label: '3–6 tuổi',   emoji: '🎨', desc: 'Mầm non',   color: '#EAF0FF' },
  { key: '6-12y',  label: '6–12 tuổi',  emoji: '🎒', desc: 'Tiểu học',  color: '#EEF8E6' },
  { key: '12-18y', label: '12–18 tuổi', emoji: '⚽', desc: 'Tuổi teen', color: '#F3E9FF' }
];

/* tpcn: true → hiện cảnh báo "không phải là thuốc" theo quy định quảng cáo TPCN. image: ảnh đại diện ô danh mục trang chủ (bỏ trống sẽ dùng icon) */
window.CATEGORIES = [
  { key: 'nuoc-ep',   label: 'Nước ép & nước dinh dưỡng', icon: '🧃', color: '#FFF3D6', desc: 'Lotte Organic – ăn ngon, tăng cân, đề kháng', tpcn: false, image: 'img/thumb/22686115682.jpg' },
  { key: 'sua',       label: 'Sữa cho bé',                icon: '🥛', color: '#EAF0FF', desc: 'Biostime, Lotte Kid A+, sữa tươi Norco', tpcn: false, image: 'img/thumb/13899935993.jpg' },
  { key: 'hong-sam',  label: 'Hồng sâm & đề kháng',       icon: '🌿', color: '#FFE9EF', desc: 'ChuChu, Rich Kid, sâm Pinkfong', tpcn: true, image: 'img/thumb/22644617070.jpg' },
  { key: 'vitamin',   label: 'Vitamin & canxi',            icon: '💊', color: '#E0F5F2', desc: 'D3K2 nhỏ giọt, canxi Calciumore', tpcn: true, image: 'img/thumb/42878618667.jpg' },
  { key: 'tang-can',  label: 'Ăn ngon, tăng cân & tiêu hoá', icon: '🍯', color: '#EEF8E6', desc: 'Gạc hươu Sumo, men vi sinh Biostime', tpcn: true, image: 'img/thumb/26156646705.jpg' },
  { key: 'rong-bien', label: 'Rong biển & ăn dặm',        icon: '🍙', color: '#FFF8E1', desc: 'Sung Gyung, Busan – rắc cơm, trộn cơm', tpcn: false, image: 'img/thumb/45462512687.jpg' },
  { key: 'thuc-pham', label: 'Thực phẩm gia đình',        icon: '🍎', color: '#FFEBEE', desc: 'Táo đỏ Hotan, granola Nhật Bản', tpcn: false, image: 'img/thumb/28467224687.jpg' },
  { key: 'do-an',     label: 'Đồ ăn & ăn vặt',            icon: '🍱', color: '#FFF1E0', desc: 'Bò xuyên tiêu, cơm cháy, lợn đen gác bếp', tpcn: false, image: 'img/thumb/bo-xuyen-tieu.jpg' },
  { key: 'thoi-trang', label: 'Thời trang', icon: '👗', color: '#FDEBF1', desc: 'Đồ lót MaBelle mỏng nhẹ, an toàn cho da', tpcn: false, image: 'img/thumb/mabelle-6999-h.jpg' },
  { key: 'cho-me',    label: 'Dành cho mẹ',                icon: '💆‍♀️', color: '#F3E9FF', desc: 'Chống nắng, serum, collagen, chăm sóc mẹ', tpcn: true, image: 'img/thumb/49061985399.jpg' },
  { key: 'luu-niem',  label: 'Đồ lưu niệm Hương Chất Kids', icon: '🎁', color: '#FFF3E6', desc: 'Sản phẩm lưu niệm độc quyền của Hương Chất Kids', tpcn: false, image: 'img/thumb/binh-giu-nhiet-hck.jpg' }
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
  { key: 'lam-dep',          label: 'Làm đẹp cho mẹ' }
];

/* Trang đích của 8 mục trên menu (chủ shop 23/10/2026) – collections.html dùng chung 1 khung, mỗi mục một cấu hình:
   slug: đường dẫn đẹp huongchatkids.vn/<slug> (máy chủ VPS dựng sẵn cho Google, link cũ collections.html?… chuyển 301)
   loc: bộ lọc gốc (cat / tag / km) · mau: màu riêng (nền, phụ, nhấn, chữ) · con: ô danh mục con · an: nhóm bộ lọc ẩn
   gioiThieu: đoạn giới thiệu (không ghi công dụng chữa bệnh, không số liệu tự đặt). Sửa nội dung ở đây. */
window.TRANG_DM = [
  { key: 'san-pham', slug: 'san-pham', ten: 'Tất cả sản phẩm', nhan: 'Danh mục sản phẩm', icon: '🛍️', loc: {},
    mau: { nen: '#FAFAF8', phu: '#EAEAEA', nhan: '#F0537A', chu: '#262626' },
    gioiThieu: 'Toàn bộ sản phẩm đang bán tại Hương Chất Kids: dinh dưỡng Hàn Quốc cho bé, mỹ phẩm và chăm sóc cho mẹ, đồ lót, thực phẩm gia đình. Hàng chính hãng có tem phụ tiếng Việt, mẹ lọc theo độ tuổi, nhu cầu, thương hiệu hoặc mức giá để chọn nhanh.',
    con: 'danhMuc', seoTieuDe: 'Tất cả sản phẩm chính hãng cho mẹ và bé – Hương Chất Kids' },
  { key: 'khuyen-mai', slug: 'khuyen-mai', ten: 'Ưu đãi và khuyến mãi', nhan: 'Khuyến mãi', icon: '🏷️', loc: { km: true },
    mau: { nen: '#FFF9F3', phu: '#FFE3D3', nhan: '#F26A3D', chu: '#292524' },
    gioiThieu: 'Các sản phẩm đang có quà tặng, giờ vàng giảm giá hoặc combo tiết kiệm trên huongchatkids.vn. Quà và mức giảm được web tự áp khi mẹ thêm sản phẩm vào giỏ.',
    seoTieuDe: 'Ưu đãi, quà tặng và khuyến mãi đang diễn ra – Hương Chất Kids' },
  { key: 'be', slug: 'danh-cho-be', ten: 'Sản phẩm dành cho bé', nhan: 'Dành cho bé', icon: '🧸', loc: { cat: ['nuoc-ep', 'sua', 'hong-sam', 'vitamin', 'tang-can', 'rong-bien'] },
    mau: { nen: '#F1F8FC', phu: '#B8DDF2', nhan: '#4D94C4', chu: '#243746' },
    gioiThieu: 'Nước ép, sữa, hồng sâm, vitamin, canxi và rong biển nhập khẩu từ Hàn Quốc, Úc, New Zealand. Mỗi sản phẩm ghi rõ độ tuổi nhà sản xuất khuyến nghị, mẹ chọn theo tuổi của con hoặc nhắn chuyên gia dinh dưỡng để được tư vấn miễn phí.',
    con: 'danhMuc', theoTuoi: true, seoTieuDe: 'Dinh dưỡng cho bé chính hãng Hàn Quốc theo độ tuổi – Hương Chất Kids' },
  { key: 'beauty', slug: 'beauty', ten: 'Beauty – chăm sóc cho mẹ', nhan: 'Beauty', icon: '💄', loc: { cat: ['cho-me'] },
    mau: { nen: '#FFF6F0', phu: '#F2D5D2', nhan: '#B86E78', chu: '#493A38' },
    gioiThieu: 'Mỹ phẩm Hàn Quốc chính hãng, sản phẩm tắm gội và chăm sóc cơ thể cho mẹ: kem dưỡng, serum, kem chống nắng, mặt nạ, son, sữa tắm. Thông tin thành phần và cách dùng theo nhà sản xuất, hiệu quả tuỳ cơ địa mỗi người.',
    con: 'thuongHieu', an: ['age', 'need', 'cat'], seoTieuDe: 'Mỹ phẩm Hàn Quốc chính hãng cho mẹ – Beauty | Hương Chất Kids' },
  { key: 'thoi-trang', slug: 'thoi-trang', ten: 'Thời trang', nhan: 'Thời trang', icon: '👗', loc: { cat: ['thoi-trang'] },
    mau: { nen: '#FFFFFF', phu: '#F5F5F3', nhan: '#222222', chu: '#222222' },
    gioiThieu: 'Đồ lót nữ MaBelle: áo ngực có gọng, không gọng, liền mạch và quần lót su đúc. Mỗi mẫu có đủ size và màu để mẹ chọn ngay trên trang sản phẩm.',
    an: ['age', 'need', 'cat'], locSizeMau: true, seoTieuDe: 'Thời trang đồ lót nữ MaBelle chính hãng – Hương Chất Kids' },
  { key: 'thuc-pham', slug: 'thuc-pham', ten: 'Foods – Đồ ăn vặt', nhan: 'Foods – Đồ ăn vặt', icon: '🍎', loc: { cat: ['thuc-pham', 'do-an'] },
    mau: { nen: '#FCFBF5', phu: '#E7F0DF', nhan: '#557B4C', chu: '#2D342B' },
    gioiThieu: 'Thực phẩm gia đình và đồ ăn vặt: táo đỏ, granola, ngũ cốc, miến, bò xuyên tiêu, lợn đen gác bếp, cơm cháy. Quy cách đóng gói và xuất xứ ghi rõ trong từng sản phẩm.',
    con: 'danhMuc', an: ['age', 'need'], seoTieuDe: 'Thực phẩm gia đình, đặc sản và đồ ăn vặt – Hương Chất Kids' },
  { key: 'flash-sale', slug: 'flash-sale', ten: 'Flash Sale', nhan: 'Flash sale', icon: '⚡', loc: { tag: 'Sản phẩm hot' },
    mau: { nen: '#FFFFFF', phu: '#FFF0C2', nhan: '#E84B3C', chu: '#262626' },
    gioiThieu: 'Những sản phẩm hot của shop, được các mẹ đặt nhiều. Giá và quà tặng hiện tại xem ngay trên từng sản phẩm.',
    seoTieuDe: 'Flash Sale – sản phẩm hot giá tốt | Hương Chất Kids' },
  { key: 'cam-nang', slug: 'cam-nang', ten: 'Cẩm nang chăm con', nhan: 'Cẩm nang', icon: '📖', trang: 'blog',
    mau: { nen: '#FAF9F6', phu: '#EFEDE8', nhan: '#F0537A', chu: '#282828' } }
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
  { key: 'primefood',  label: 'Prime Food',  origin: 'Trung Quốc', color: '#C62828' },
  { key: 'kimjeongmoon', label: 'Kim Jeong Moon Aloe', origin: 'Hàn Quốc', color: '#43A047' },
  { key: 'cellhappy',  label: 'Cell Happy Co', origin: 'Hàn Quốc', color: '#F06292' },
  { key: 'chera', label: 'Grace By Chera', origin: 'Hàn Quốc', color: '#F48FB1' },
  { key: 'clastive', label: 'Clastive', origin: 'Nhật Bản', color: '#455A64' },
  { key: 'kousa', label: 'Kousa', origin: 'Hàn Quốc', color: '#4FC3F7' },
  { key: 'glutanex', label: 'Glutanex', origin: 'Hàn Quốc', color: '#1E88E5' },
  { key: 'rvblab', label: 'RVB LAB', origin: 'Ý', color: '#C2185B' },
  { key: 'meso', label: 'Meso', origin: 'Đan Mạch', color: '#C9A227' },
  { key: 'dermoioniq', label: 'Dermo Ioniq', origin: 'Pháp', color: '#00897B' },
  { key: 'anubis', label: 'Anubis', origin: 'Tây Ban Nha', color: '#6D4C41' },
  { key: 'arravite', label: 'Arravite', origin: 'Úc', color: '#7E57C2' },
  { key: 'hiskin', label: 'Hiskin', origin: 'Hàn Quốc', color: '#0288D1' },
  { key: 'arganicare', label: 'Arganicare', origin: 'Ma-rốc', color: '#8D6E63' },
  { key: 'akiko', label: 'Akiko', origin: 'Nhật Bản', color: '#26A69A' },
  { key: 'chef-to-factory', label: 'CF – Chef To Factory', origin: 'Việt Nam', color: '#8A2A2A' },
  { key: 'vua-dinh-vi', label: 'Vua Đỉnh Vị', origin: 'Việt Nam', color: '#B71C1C' },
  { key: 'hexacare', label: 'Hexacare', origin: 'Pháp', color: '#C2185B' },
  { key: 'boryeong-mud', label: 'Boryeong MUD+', origin: 'Hàn Quốc', color: '#8B6B4E' },
  { key: 'kitea', label: 'Kitea', origin: 'Hàn Quốc', color: '#C2561B' },
  { key: 'avca', label: 'AVCA', origin: 'Hàn Quốc', color: '#F59E0B' },
  { key: 'mabelle', label: 'MaBelle', origin: 'Việt Nam', color: '#D4A017' },
  { key: 'daycell', label: 'DayCell', origin: 'Hàn Quốc', color: '#C0392B' },
  { key: 'khac',       label: 'Nhập khẩu',   origin: 'Hàn Quốc', color: '#6A1B9A' }
];

/* Menu chính (desktop mega menu + menu mobile). links: [nhãn, đường dẫn]; needs/ages: key trong NEEDS/AGES */
/* ===ADMIN:NAV=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong) */
window.NAV = [
  { label: 'Dành cho bé', short: 'Dành cho bé', tiny: 'Cho bé', link: 'collections.html?cat=nuoc-ep,sua,hong-sam,vitamin,tang-can,rong-bien', columns: [
    { title: 'Danh mục cho bé', links: [['🧃 Nước ép & nước dinh dưỡng', 'collections.html?cat=nuoc-ep'], ['🥛 Sữa cho bé', 'collections.html?cat=sua'], ['🌿 Hồng sâm & đề kháng', 'collections.html?cat=hong-sam'], ['💊 Vitamin & canxi', 'collections.html?cat=vitamin'], ['🍯 Ăn ngon, tăng cân & tiêu hoá', 'collections.html?cat=tang-can'], ['🍙 Rong biển & ăn dặm', 'collections.html?cat=rong-bien']] },
    { title: 'Mẹ hay chọn', links: [['Nước ép Lotte hoa quả & rau củ Organic', 'product.html?id=22686115682'], ['Nước ép Lotte Tăng Cân', 'product.html?id=25632276959'], ['Vitamin D3K2 Pure Vitality', 'product.html?id=42878618667'], ['Canxi Calciumore (váng sữa)', 'product.html?id=26060839019'], ['Hồng sâm ChuChu', 'product.html?id=22644617070'], ['Gạc hươu non Sumo', 'product.html?id=26156646705'], ['Rong biển Sung Gyung', 'product.html?id=41002695070']] },
    { title: 'Theo nhu cầu', needs: ['tang-chieu-cao', 'tang-can', 'de-khang', 'tieu-hoa', 'tri-nao'] },
    { title: 'Theo độ tuổi', ages: ['6-12m', '1-3y', '3-6y', '6-12y', '12-18y'] } ] },
  { label: 'Beauty', short: 'Beauty', tiny: 'Beauty', link: 'collections.html?cat=cho-me', columns: [
    { title: 'Mới về', links: [['Kem dưỡng DayCell NAD+ White Cream', 'product.html?id=daycell-nad-white-cream'], ['Serum DayCell Dr.VITA ECM', 'product.html?id=drvita-ecm-serum'], ['Serum body nâng tone AVCA', 'product.html?id=avca-body-tone-up'], ['Kem trắng EXOSOME Tone-up', 'product.html?id=kem-exosome-toneup'], ['Cặp kem tạo nền Éclat du Teint', 'product.html?id=cap-kem-nen-eclat'], ['Kem hồng da Cell Happy Co 5in1', 'product.html?id=57903449970'], ['Gội xả bùn khoáng Boryeong MUD+', 'product.html?id=goi-xa-boryeong-mud']] },
    { title: 'Chăm sóc da', links: [['Kem chống nắng Hiskin 5in1 SPF50+', 'product.html?id=27734205778'], ['Serum RVB LAB Hyalu C+ 30ml', 'product.html?id=24015142248'], ['Kem dưỡng RVB LAB Hyalu C+ 30ml', 'product.html?id=26800350417'], ['Mặt nạ trẻ hoá NMN Kousa', 'product.html?id=24015583018'], ['Mặt nạ thạch lô hội Cure', 'product.html?id=57413220644']] },
    { title: 'Bộ chăm sóc chuyên sâu', links: [['Combo dưỡng da Hyalu C+', 'product.html?id=26900366084'], ['Cặp Meso bạc RVB LAB', 'product.html?id=29006040615'], ['Bộ đôi Meso Retinol siêu vi', 'product.html?id=28806784125'], ['Combo Meso vàng siêu vi', 'product.html?id=24329101823'], ['Cặp tái tạo phục hồi da Dermo Ioniq', 'product.html?id=25678530796']] },
    { title: 'Sức khoẻ & cơ thể', links: [['Viên uống Pure NMN 12000mg+', 'product.html?id=24767149051'], ['Men vi sinh phụ khoa Arravite', 'product.html?id=28902157429'], ['Super Collagen Alpha 90 gói', 'product.html?id=48112514210'], ['Nghệ nano Curcumin 365 Plus', 'product.html?id=49061985399'], ['Thảm ngải cứu trị liệu', 'product.html?id=50002678694']] },
    { title: 'Tắm gội & làm đẹp', links: [['Sữa tắm dưỡng trắng Glutanex 300ml', 'product.html?id=24465090622'], ['Cặp dầu gội & xả Arganicare', 'product.html?id=27809051612'], ['Xịt phun sương Grace By Chera', 'product.html?id=51013054442'], ['Son filler RVB LAB Lip Explosion', 'product.html?id=57556697426'], ['Bột trắng răng Akiko Nhật Bản', 'product.html?id=56857599724']] } ] },
  { label: 'Thời trang', short: 'Thời trang', tiny: 'Thời trang', link: 'collections.html?cat=thoi-trang', columns: [
    { title: 'Áo lót MaBelle', links: [['Áo ngực chống từ MaBelle 5192', 'product.html?id=mabelle-5192'], ['Áo ngực chống hằn MaBelle 5790', 'product.html?id=mabelle-5790'], ['Áo ngực có gọng MaBelle 5038', 'product.html?id=mabelle-5038'], ['Áo lót liền mạch không gọng MaBelle 5997', 'product.html?id=mabelle-5997'], ['Áo lót không gọng MaBelle 5992', 'product.html?id=mabelle-5992']] },
    { title: 'Quần lót MaBelle', links: [['Quần lót su đúc kháng khuẩn MaBelle 6999', 'product.html?id=mabelle-6999'], ['Xem tất cả thời trang', 'collections.html?cat=thoi-trang']] } ] },
  { label: 'Foods – Đồ ăn vặt', short: 'Foods – Đồ ăn vặt', tiny: 'Foods', link: 'collections.html?cat=thuc-pham,do-an', columns: [
    { title: 'Thực phẩm gia đình', links: [['Táo đỏ Hoàng Gia Hotan 1kg', 'product.html?id=28467224687'], ['Granola Fuwa-Saku Nhật Bản', 'product.html?id=43532388498'], ['Ngũ cốc bắp thiên ma Kitea', 'product.html?id=ngu-coc-bap-thien-ma-kitea'], ['Miến gà sấy thăng hoa', 'product.html?id=mien-ga-cf']] },
    { title: 'Đồ ăn & ăn vặt', links: [['Bò xuyên tiêu Chef Hải', 'product.html?id=bo-xuyen-tieu'], ['Lợn đen khói mơ Tây Bắc', 'product.html?id=lon-den-khoi-mo'], ['Cơm cháy phô mai & BBQ', 'product.html?id=com-chay-phomai'], ['Cơm cháy chà bông Nội Ơi', 'product.html?id=com-vang-noi-oi'], ['Muối xuyên tiêu Chef Hải', 'product.html?id=muoi-xuyen-tieu']] } ] },
  { label: 'Flash sale', short: 'Flash sale', tiny: 'Sale', link: 'collections.html?tag=S%E1%BA%A3n%20ph%E1%BA%A9m%20hot', hot: true },
  { label: 'Cẩm nang chăm con', short: 'Cẩm nang', tiny: 'Cẩm nang', link: 'blog.html' },
  { label: 'Đồ lưu niệm Hương Chất Kids', short: 'Lưu niệm', tiny: 'Lưu niệm', link: 'collections.html?cat=luu-niem' }
];
/* ===/ADMIN:NAV=== */

/* importer / congBo (tuỳ chọn): nhà nhập khẩu & số công bố ghi trên tem phụ – điền để hiện ở bảng thông tin.
   image: ảnh thật (img/<mã Shopee>.jpg); thumb: ảnh cắt gọn 420px dùng cho thẻ sản phẩm/giỏ/tìm kiếm. variants: phân loại từ Shopee, sắp theo giá tăng dần.
   price/oldPrice = phân loại rẻ nhất (giá "từ"). shape/color: dùng vẽ ảnh minh hoạ khi chưa có ảnh. */
/* ===ADMIN:CAUHINH=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong)
   Những gì ghi ở đây sẽ ĐÈ LÊN window.SITE ở trên. Để trống {} nghĩa là dùng nguyên SITE. */
window.CAUHINH = {};
/* ===/ADMIN:CAUHINH=== */

/* ===ADMIN:THEME=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong) */
window.THEME = {
  "mau": {
    "primary": "#F0537A",
    "primary-600": "#D93E66",
    "teal": "#17A398",
    "amber": "#FFB020",
    "ink": "#22202A",
    "bg-soft": "#FFF8FA"
  },
  "chu": {
    "body": "Be Vietnam Pro",
    "heading": "Quicksand",
    "co": 15
  },
  "bo": {
    "radius": 16,
    "radius-sm": 10
  },
  "header": {
    "sticky": true,
    "thongBao": "",
    "hienTimKiem": true,
    "hienGioHang": true,
    "hienTaiKhoan": true
  },
  "khoi": [
    { "key": "hero", "ten": "Banner lớn đầu trang", "bat": true },
    { "key": "suc-khoe", "ten": "Nút Đo chỉ số cho bé", "bat": true },
    { "key": "flash", "ten": "Flash sale", "bat": true },
    { "key": "noi-bat", "ten": "Mẹ tin dùng nhất", "bat": true },
    { "key": "do-tuoi", "ten": "Bé nhà mình mấy tuổi", "bat": true },
    { "key": "danh-muc", "ten": "Danh mục sản phẩm", "bat": true },
    { "key": "gioi-thieu", "ten": "Giới thiệu shop (4 năm đồng hành)", "bat": true },
    { "key": "combo", "ten": "Combo tiết kiệm", "bat": true },
    { "key": "cho-me", "ten": "Dành cho mẹ", "bat": true },
    { "key": "vi-sao", "ten": "Vì sao mẹ chọn shop", "bat": true },
    { "key": "danh-gia", "ten": "Đánh giá trên Shopee", "bat": true },
    { "key": "cam-nhan", "ten": "Mẹ và bé đã dùng (ảnh thật)", "bat": true },
    { "key": "cam-nang", "ten": "Cẩm nang chăm con", "bat": true },
    { "key": "hang-moi", "ten": "Hàng mới về", "bat": true },
    { "key": "thuong-hieu", "ten": "Thương hiệu chính hãng", "bat": true },
    { "key": "zalo", "ten": "Nhận ưu đãi qua Zalo", "bat": true }
  ]
};
/* ===/ADMIN:THEME=== */

/* ===ADMIN:PRODUCTS=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong) */
window.PRODUCTS = [
  {
    "id": "cap-kem-nen-eclat",
    "name": "Cặp Kem Dưỡng Da Tạo Nền Éclat du Teint – Hydrate UV Defense SPF50+ PA+++ & Glow Pot No.17 Max Mirror BB Cream Hàn Quốc",
    "short": "Cặp kem dưỡng da tạo nền Éclat du Teint",
    "brand": "khac",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 1996000,
    "oldPrice": 2695000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 10,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#E8C8CF",
    "weight": "Cặp 2 tuýp",
    "origin": "Hàn Quốc",
    "tags": [
      "Sản phẩm hot",
      "Mới",
      "Cho mẹ"
    ],
    "image": "img/cap-kem-nen-v2-h.jpg",
    "thumb": "img/thumb/cap-kem-nen-v2-h.jpg",
    "images": [
      "img/cap-kem-nen-v2-h.jpg",
      "img/cap-kem-nen-2.jpg",
      "img/cap-kem-nen-3.jpg",
      "img/cap-kem-nen-4.jpg",
      "img/cap-kem-nen-5.jpg",
      "img/cap-kem-nen-6.jpg",
      "img/cap-kem-nen-7.jpg"
    ],
    "variants": [
      {
        "label": "Cặp 2 tuýp (chống nắng + BB cream)",
        "price": 1996000,
        "oldPrice": 2695000
      },
      {
        "label": "Lẻ 1 tuýp kem chống nắng Hydrate UV Defense",
        "price": 998000,
        "oldPrice": 1347000
      },
      {
        "label": "Lẻ 1 tuýp kem nền Glow Pot No.17 BB Cream",
        "price": 998000,
        "oldPrice": 1347000
      }
    ],
    "desc": "Cặp kem dưỡng da tạo nền Éclat du Teint gồm kem chống nắng Hydrate UV Defense SPF50+ PA+++ và BB cream Glow Pot No.17 Max Mirror. Theo nhà sản xuất: kem chống nắng bảo vệ phổ rộng, dưỡng ẩm làm dịu da, phù hợp da nhạy cảm và da đang treatment; BB cream che phủ nhẹ tự nhiên, tạo hiệu ứng da căng bóng glow khoẻ kiểu Hàn. Dùng riêng từng tuýp hoặc trộn chung để có lớp nền mỏng nhẹ.",
    "highlights": [
      "Kem chống nắng phổ rộng SPF50+ PA+++, chất kem mỏng nhẹ dễ tán, không bí da",
      "Dưỡng ẩm, làm dịu – hợp da nhạy cảm, da đang treatment",
      "BB cream che phủ nhẹ tự nhiên, da đều màu và tươi tắn hơn",
      "Tạo hiệu ứng căng bóng glow khoẻ, cũng có SPF50+ PA+++",
      "Mua cặp 1.996.000đ · mua lẻ từng tuýp 998.000đ"
    ],
    "usage": "Cách 1 – dùng riêng: sau bước dưỡng da, thoa kem chống nắng đều lên mặt và cổ, sau đó dùng lượng BB cream mỏng để tạo nền tự nhiên. Cách 2 – trộn chung: lấy một lượng kem chống nắng và một lượng nhỏ BB cream, trộn đều rồi thoa lên da. Thoa trước khi ra ngoài 15–20 phút; thoa lại kem chống nắng sau vài giờ nếu ra nhiều mồ hôi hoặc tiếp xúc nước."
  },
  {
    "id": "kem-exosome-toneup",
    "name": "Kem Trắng EXOSOME Hàn Quốc EXOPLUS Tone-up Cream Premiere Look 50ml – Nâng Tông, Dưỡng Trắng, Căng Bóng",
    "short": "Kem trắng EXOSOME EXOPLUS Tone-up 50ml",
    "brand": "khac",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 980000,
    "oldPrice": 1323000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 9,
    "cosmetic": true,
    "shape": "box",
    "color": "#B9BDC4",
    "weight": "Hũ 50ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Sản phẩm hot",
      "Mới",
      "Cho mẹ"
    ],
    "image": "img/kem-exosome-h.jpg",
    "thumb": "img/thumb/kem-exosome-h.jpg",
    "images": [
      "img/kem-exosome-h.jpg",
      "img/kem-exosome-2.jpg",
      "img/kem-exosome-3.jpg",
      "img/kem-exosome-4.jpg"
    ],
    "variants": [
      {
        "label": "1 hũ 50ml",
        "price": 980000,
        "oldPrice": 1323000
      },
      {
        "label": "2 hũ",
        "price": 1960000
      }
    ],
    "desc": "Kem trắng EXOSOME Hàn Quốc dòng EXOPLUS – mỹ phẩm ứng dụng công nghệ EXOSOME được cấp bằng sáng chế vào chăm sóc da, hàm lượng EXOSOME tăng cường. Theo nhà sản xuất, sản phẩm vừa nâng tông trang điểm nhẹ, vừa chăm sóc da sáng mịn, căng bóng, hỗ trợ cải thiện nếp nhăn và làm dịu làn da ửng đỏ, mỏng yếu.",
    "highlights": [
      "Công nghệ EXOSOME được cấp bằng sáng chế, dòng EXOPLUS hàm lượng cao",
      "Thành phần dưỡng sáng mạnh gấp 4 lần Hydroquinone theo công bố của nhà sản xuất",
      "Nâng tông tức thì, lên màu trắng hồng tự nhiên, tạo độ glow đẹp",
      "HA đa tầng cấp ẩm sâu, chất kem mướt, ăn tệp, không bí da",
      "Hỗ trợ trẻ hoá, cải thiện nếp nhăn, xoa dịu da ửng đỏ mỏng yếu"
    ],
    "usage": "Sau bước dưỡng da, lấy lượng vừa đủ thoa đều lên mặt và cổ, vỗ nhẹ cho thẩm thấu. Dùng buổi sáng trước kem chống nắng hoặc buổi tối ở bước cuối. Có thể dùng thay lớp nền mỏng khi ra ngoài."
  },
  {
    "id": "41002695070",
    "name": "Rong Biển Vụn Ăn Liền Sung Gyung - Lựa Chọn Hoàn Hảo Cho Bữa Ăn Nhanh Gọn và Bổ Dưỡng",
    "short": "Rong biển vụn Sung Gyung",
    "brand": "sunggyung",
    "cat": "rong-bien",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y"
    ],
    "needs": [
      "an-dam",
      "tang-can"
    ],
    "price": 520000,
    "oldPrice": 702000,
    "rating": 4.94,
    "reviews": 53,
    "sold": 423,
    "stock": 50,
    "priority": 3,
    "shape": "box",
    "color": "#1B5E20",
    "weight": "Gói 500g",
    "origin": "Hàn Quốc",
    "tags": [
      "Sản phẩm hot",
      "Giảm sâu"
    ],
    "image": "img/41002695070.jpg",
    "thumb": "img/thumb/41002695070.jpg",
    "images": [
      "img/41002695070.jpg",
      "img/41002695070-2.jpg",
      "img/41002695070-3.jpg",
      "img/41002695070-4.jpg",
      "img/41002695070-5.jpg"
    ],
    "shopeeId": "41002695070",
    "shopeeUrl": "https://shopee.vn/product/837223358/41002695070",
    "shopeeCategory": "Thực phẩm và đồ uống › Đồ ăn vặt › Các loại rong biển ăn liền",
    "variants": [
      {
        "label": "1 gói (500g)",
        "price": 520000,
        "oldPrice": 702000
      },
      {
        "label": "2 gói",
        "price": 1040000,
        "oldPrice": 1404000
      },
      {
        "label": "3 gói",
        "price": 1560000,
        "oldPrice": 2106000
      }
    ],
    "desc": "Rong biển vụn ăn liền Sung Gyung – rắc cơm, cháo hoặc trộn cơm nắm cho bé. Rong biển Hàn Quốc sấy giòn, vị nhạt, giúp bữa ăn của con nhanh gọn mà vẫn bổ dưỡng.",
    "highlights": [
      "Rong biển Hàn Quốc sấy giòn, thơm, vị nhạt phù hợp trẻ nhỏ",
      "Rắc cơm, cháo, cơm nắm, kimbap – hỗ trợ bé ăn ngon miệng hơn",
      "Tiện lợi cho bữa sáng và hộp cơm đi học"
    ],
    "usage": "Rắc trực tiếp lên cơm, cháo hoặc trộn cơm nắm cho bé. Đậy kín sau khi mở, bảo quản nơi khô ráo, tránh ẩm."
  },
  {
    "id": "22686115682",
    "slug": "nuoc-ep-lotte-organic-hoa-qua-rau-cu",
    "name": "Nước Ép Lotte Hoa Quả Và Rau Củ Organic Hỗ Trợ Bé Phát Triển Chiều Cao, Ăn Ngon Miệng, Tăng Cường Sức Khỏe",
    "short": "Nước Ép Lotte Hoa Quả Và Rau Củ Organic Hỗ Trợ Bé Phát Triển Chiều Cao, Ăn Ngon Miệng, Tăng Cường Sức Khỏe",
    "brand": "lotte",
    "cat": "nuoc-ep",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "tang-chieu-cao",
      "tang-can",
      "de-khang",
      "organic"
    ],
    "price": 448000,
    "oldPrice": 627000,
    "rating": 4.93,
    "reviews": 525,
    "sold": 3000,
    "stock": 50,
    "priority": 3,
    "shape": "box",
    "color": "#E60012",
    "weight": "Gói 80ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Sản phẩm hot",
      "Giảm sâu"
    ],
    "image": "img/22686115682.jpg",
    "thumb": "img/thumb/22686115682.jpg",
    "images": [
      "img/22686115682.jpg",
      "img/22686115682-3.jpg",
      "img/22686115682-4.jpg",
      "img/22686115682-5.jpg"
    ],
    "shopeeId": "22686115682",
    "shopeeUrl": "https://shopee.vn/product/837223358/22686115682",
    "shopeeCategory": "Thực phẩm và đồ uống › Đồ uống › Khác",
    "variants": [
      {
        "label": "Xanh – Táo & Củ dền · 10 gói",
        "price": 448000,
        "oldPrice": 627000
      },
      {
        "label": "Hồng – Nho & Mận · 10 gói",
        "price": 448000,
        "oldPrice": 627000
      },
      {
        "label": "Cam – Lê & Hoa chuông · 10 gói",
        "price": 448000,
        "oldPrice": 627000
      },
      {
        "label": "Xanh – Táo & Củ dền · Thùng 30 gói",
        "price": 1317000,
        "oldPrice": 1844000
      },
      {
        "label": "Hồng – Nho & Mận · Thùng 30 gói",
        "price": 1317000,
        "oldPrice": 1844000
      },
      {
        "label": "Cam – Lê & Hoa chuông · Thùng 30 gói",
        "price": 1317000,
        "oldPrice": 1844000
      },
      {
        "label": "Mix vị · Thùng 30 gói",
        "price": 1317000,
        "oldPrice": 1844000
      }
    ],
    "desc": "Gồm 3 dòng: Lotte xanh – Táo & Củ dền (bổ sung canxi, hỗ trợ phát triển chiều cao); Lotte hồng – Nho & Mận (bổ sung lợi khuẩn, giúp con ăn ngon miệng); Lotte cam – Lê & Hoa chuông (giúp con tăng cường sức đề kháng), theo nhà sản xuất. Nước ép hoa quả và rau củ hữu cơ Lotte (Hàn Quốc) dạng gói tiện lợi, vị cam “Khoẻ Mạnh” hoặc mix vị. Theo nhà sản xuất, sản phẩm bổ sung vitamin từ rau quả organic, hỗ trợ bé ăn ngon miệng, phát triển chiều cao và tăng cường sức khoẻ.",
    "highlights": [
      "Nguyên liệu hoa quả & rau củ hữu cơ (Organic)",
      "Gói nhỏ có ống hút – tiện mang đi học, đi chơi",
      "Chọn vị cam “Khoẻ Mạnh” hoặc thùng mix vị"
    ],
    "usage": "Bé uống 1–2 gói/ngày, ngon hơn khi để mát. Dùng theo hướng dẫn trên bao bì."
  },
  {
    "id": "42878618667",
    "name": "Vitamin D3K2 – Hỗ Trợ Phát Triển Xương Răng, Hỗ Trợ Tăng Đề Kháng, Tim Mạch – Lọ 30ml",
    "short": "Vitamin D3K2 Pure Vitality 30ml",
    "brand": "purevitality",
    "cat": "vitamin",
    "ages": [
      "0-6m",
      "6-12m",
      "1-3y",
      "3-6y",
      "6-12y"
    ],
    "needs": [
      "d3k2",
      "tang-chieu-cao",
      "canxi",
      "de-khang"
    ],
    "price": 390000,
    "oldPrice": 507000,
    "rating": 5,
    "reviews": 69,
    "sold": 356,
    "stock": 50,
    "priority": 3,
    "shape": "bottle",
    "color": "#E0A526",
    "weight": "Lọ 30ml",
    "origin": "New Zealand",
    "tags": [
      "Sản phẩm hot",
      "Bán chạy"
    ],
    "image": "img/42878618667-h.jpg",
    "thumb": "img/thumb/42878618667-h.jpg",
    "images": [
      "img/42878618667-h.jpg",
      "img/42878618667-2.jpg",
      "img/42878618667-3.jpg",
      "img/42878618667-4.jpg",
      "img/42878618667-5.jpg"
    ],
    "shopeeId": "42878618667",
    "shopeeUrl": "https://shopee.vn/product/837223358/42878618667",
    "shopeeCategory": "Mẹ & Bé › Chăm sóc sức khỏe bé › Vitamin & Thực phẩm bổ sung",
    "variants": [
      {
        "label": "1 lọ",
        "price": 390000,
        "oldPrice": 507000
      },
      {
        "label": "2 lọ",
        "price": 780000,
        "oldPrice": 1014000
      },
      {
        "label": "1 lọ d3k2 + 1 hộp váng sữa canxi giảm 5%",
        "price": 2726000
      }
    ],
    "desc": "Vitamin D3 + K2 Pure Vitality (New Zealand) dạng nhỏ giọt 30ml, hương táo NZ. Theo nhà sản xuất, D3 hỗ trợ hấp thu canxi, K2 hỗ trợ đưa canxi vào xương, hỗ trợ phát triển xương răng và đề kháng cho bé. Có chứng nhận HACCP, GMP. Mua 2 lọ tiết kiệm hơn.",
    "highlights": [
      "Sản xuất tại New Zealand, chứng nhận HACCP & GMP",
      "D3 hỗ trợ hấp thu canxi, K2 dẫn canxi vào xương",
      "Dạng giọt vị táo, dễ dùng cho bé từ sơ sinh"
    ],
    "usage": "Nhỏ trực tiếp vào miệng bé hoặc pha vào sữa, dùng vào buổi sáng sau ăn. Liều dùng theo hướng dẫn trên bao bì hoặc chuyên gia dinh dưỡng tư vấn."
  },
  {
    "id": "45462512687",
    "name": "Rong biển Tăng cao Busan trộn cơm Hàn Quốc, bổ sung chất xơ, vitamin, hỗ trợ bé cao lớn",
    "short": "Rong biển tăng cao Busan trộn cơm",
    "brand": "busan",
    "cat": "rong-bien",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y"
    ],
    "needs": [
      "an-dam",
      "tang-chieu-cao",
      "tieu-hoa"
    ],
    "price": 589000,
    "oldPrice": 795000,
    "rating": 0,
    "reviews": 0,
    "sold": 12,
    "stock": 50,
    "priority": 3,
    "shape": "box",
    "color": "#00695C",
    "weight": "Gói 40g",
    "origin": "Hàn Quốc",
    "tags": [
      "Sản phẩm hot"
    ],
    "image": "img/45462512687.jpg",
    "thumb": "img/thumb/45462512687.jpg",
    "images": [
      "img/45462512687.jpg",
      "img/45462512687-2.jpg",
      "img/45462512687-3.jpg",
      "img/45462512687-4.jpg",
      "img/45462512687-5.jpg"
    ],
    "shopeeId": "45462512687",
    "shopeeUrl": "https://shopee.vn/product/837223358/45462512687",
    "shopeeCategory": "Thực phẩm và đồ uống › Đồ ăn vặt › Các loại rong biển ăn liền",
    "variants": [
      {
        "label": "1 gói",
        "price": 589000,
        "oldPrice": 795000
      },
      {
        "label": "2 gói",
        "price": 1178000,
        "oldPrice": 1590000
      },
      {
        "label": "3 gói",
        "price": 1767000,
        "oldPrice": 2385000
      },
      {
        "label": "4 gói",
        "price": 2356000,
        "oldPrice": 3181000
      },
      {
        "label": "5 gói",
        "price": 2945000,
        "oldPrice": 3976000
      }
    ],
    "desc": "Rong biển Busan trộn cơm Hàn Quốc, bổ sung chất xơ và vitamin tự nhiên từ rong biển. Vị mặn nhẹ, giòn, trộn cơm là bé ăn hết bát.",
    "highlights": [
      "Rong biển Busan – vùng rong biển nổi tiếng Hàn Quốc",
      "Bổ sung chất xơ, vitamin tự nhiên",
      "Trộn cơm, làm cơm nắm, kimbap cho bé"
    ],
    "usage": "Trộn 1 gói nhỏ với cơm nóng hoặc rắc lên cháo. Bảo quản nơi khô ráo, dùng hết sau khi mở gói."
  },
  {
    "id": "22644617070",
    "name": "Hồng Sâm ChuChu Hàn Quốc Hỗ Trợ Tăng Sức Đề Kháng, Ăn Ngon Và Phục Hồi Sức Khoẻ Sau Ốm",
    "short": "Hồng sâm ChuChu hỗ trợ ăn ngon & phục hồi sau ốm",
    "brand": "chuchu",
    "cat": "hong-sam",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y"
    ],
    "needs": [
      "de-khang",
      "tang-can",
      "phuc-hoi"
    ],
    "price": 290000,
    "oldPrice": 392000,
    "rating": 4.92,
    "reviews": 165,
    "sold": 699,
    "stock": 50,
    "shape": "box",
    "color": "#C62828",
    "weight": "Gói 20ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Bán chạy"
    ],
    "image": "img/22644617070.jpg",
    "thumb": "img/thumb/22644617070.jpg",
    "images": [
      "img/22644617070.jpg",
      "img/22644617070-4.jpg",
      "img/22644617070-5.jpg"
    ],
    "shopeeId": "22644617070",
    "shopeeUrl": "https://shopee.vn/product/837223358/22644617070",
    "shopeeCategory": "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    "variants": [
      {
        "label": "Việt quất – nho · 10 gói",
        "price": 290000,
        "oldPrice": 392000
      },
      {
        "label": "Táo lê · 10 gói",
        "price": 290000,
        "oldPrice": 392000
      },
      {
        "label": "Mix vị · 10 gói",
        "price": 290000,
        "oldPrice": 392000
      },
      {
        "label": "Mix vị · 20 gói (nửa thùng)",
        "price": 580000,
        "oldPrice": 783000
      },
      {
        "label": "Táo lê · 20 gói (nửa thùng)",
        "price": 580000,
        "oldPrice": 783000
      },
      {
        "label": "Việt quất – nho · 20 gói (nửa thùng)",
        "price": 580000,
        "oldPrice": 783000
      },
      {
        "label": "Mix vị · 40 gói (1 thùng)",
        "price": 1160000,
        "oldPrice": 1566000
      },
      {
        "label": "Việt quất – nho · 40 gói (1 thùng)",
        "price": 1160000,
        "oldPrice": 1566000
      },
      {
        "label": "Táo lê · 40 gói (1 thùng)",
        "price": 1160000,
        "oldPrice": 1566000
      }
    ],
    "desc": "Hồng sâm ChuChu Hàn Quốc dành cho trẻ hay ốm vặt, biếng ăn. Theo nhà sản xuất, sản phẩm hỗ trợ tăng sức đề kháng, ăn ngon và phục hồi sức khoẻ sau ốm cho trẻ. Có gói 10, nửa thùng và nguyên thùng.",
    "highlights": [
      "Cho bé hay ốm vặt, mới ốm dậy, biếng ăn",
      "Vị táo lê, việt quất – nho hoặc mix",
      "Nửa thùng / 1 thùng giá tốt hơn"
    ],
    "usage": "Bé uống 1 gói/ngày sau bữa ăn. Liều dùng theo hướng dẫn trên bao bì."
  },
  {
    "id": "26156646705",
    "name": "Gạc Hươu Non Sumo Chiết Xuất Nhung Hươu Hỗ Trợ Tăng Cân, Ăn Ngon",
    "short": "Gạc hươu non tăng cân Sumo",
    "brand": "sumo",
    "cat": "tang-can",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y"
    ],
    "needs": [
      "de-khang",
      "tang-can",
      "canxi"
    ],
    "price": 390000,
    "oldPrice": 527000,
    "rating": 5,
    "reviews": 32,
    "sold": 161,
    "stock": 50,
    "shape": "box",
    "color": "#8D6E63",
    "weight": "Gói",
    "origin": "Hàn Quốc",
    "tags": [
      "Giảm sâu"
    ],
    "image": "img/26156646705.jpg",
    "thumb": "img/thumb/26156646705.jpg",
    "images": [
      "img/26156646705.jpg",
      "img/26156646705-2.jpg",
      "img/26156646705-3.jpg",
      "img/26156646705-4.jpg",
      "img/26156646705-5.jpg"
    ],
    "shopeeId": "26156646705",
    "shopeeUrl": "https://shopee.vn/product/837223358/26156646705",
    "shopeeCategory": "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    "variants": [
      {
        "label": "10 gói",
        "price": 390000,
        "oldPrice": 527000
      },
      {
        "label": "20 gói",
        "price": 780000,
        "oldPrice": 1053000
      },
      {
        "label": "30 gói",
        "price": 1150000,
        "oldPrice": 1553000
      },
      {
        "label": "Thùng 40 gói",
        "price": 1490000,
        "oldPrice": 2012000
      }
    ],
    "desc": "Gạc hươu non Sumo chiết xuất nhung hươu Hàn Quốc dạng gói uống. Theo nhà sản xuất, sản phẩm hỗ trợ bé tăng cân, ăn ngon miệng và bổ sung canxi cho bé chậm lớn.",
    "highlights": [
      "Chiết xuất nhung hươu non Hàn Quốc",
      "Hỗ trợ tăng cân, ăn ngon cho bé chậm lớn",
      "Có bản gạc canxi (thùng)"
    ],
    "usage": "Bé uống 1 gói/ngày sau ăn. Liều dùng theo hướng dẫn trên bao bì hoặc chuyên gia dinh dưỡng tư vấn."
  },
  {
    "id": "gac-canxi-sumo",
    "name": "Gạc Nhung Hươu Canxi Sumo (Byplay Sumo Calcium Deer Antler Liquid) Hỗ Trợ Phát Triển Chiều Cao",
    "short": "Gạc nhung hươu canxi Sumo",
    "brand": "sumo",
    "cat": "vitamin",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "tang-chieu-cao",
      "canxi"
    ],
    "price": 520000,
    "oldPrice": 520000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 5,
    "shape": "box",
    "color": "#9CCC65",
    "weight": "Hộp 10 gói × 80ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Mới"
    ],
    "image": "img/gac-canxi-sumo-h.jpg",
    "thumb": "img/thumb/gac-canxi-sumo-h.jpg",
    "images": [
      "img/gac-canxi-sumo-h.jpg",
      "img/gac-canxi-sumo-2.jpg",
      "img/gac-canxi-sumo-3.jpg",
      "img/gac-canxi-sumo-4.jpg",
      "img/gac-canxi-sumo-5.jpg",
      "img/gac-canxi-sumo-6.jpg"
    ],
    "variants": [
      {
        "label": "Hộp 10 gói",
        "price": 520000,
        "oldPrice": 520000
      },
      {
        "label": "Thùng 30 gói",
        "price": 1490000,
        "oldPrice": 1490000
      },
      {
        "label": "Thùng 40 gói",
        "price": 1890000,
        "oldPrice": 1890000
      }
    ],
    "desc": "Gạc nhung hươu canxi Sumo (Byplay Sumo Calcium Deer Antler Liquid) là nước uống bổ sung canxi dạng túi 80ml, sản xuất tại Hàn Quốc bởi Huons Foodience CO., LTD. Theo nhà sản xuất, mỗi gói chứa 100mg canxi (lipocalcium) kết hợp chiết xuất nhung hươu New Zealand, kẽm, vitamin D3 và hỗn hợp trái cây nhiệt đới, hỗ trợ bé từ 1 tuổi phát triển chiều cao. Vị trái cây dễ uống, túi có nắp vặn tiện mang theo. Quy cách: hộp 10 gói × 80ml (túi PE, hộp giấy); thùng 30 gói (3 hộp) hoặc 40 gói. Nhà sản xuất: Huons Foodience CO., LTD (Hàn Quốc). Thành phần: Nước tinh khiết, fructooligosaccharides, hỗn hợp trái cây nhiệt đới cô đặc (cam, xoài, chanh dây, ổi, chuối – Israel), hỗn hợp thảo mộc cô đặc (đương quy, hoàng kỳ, thược dược, cam thảo, quế, bạch truật, xuyên khung, địa hoàng, phục linh), chế phẩm hỗn hợp 1 (tricalci phosphat INS 341iii, lecithin INS 322i), chiết xuất nhung hươu cô đặc (nhung hươu New Zealand, thành phần rắn 20% (70%) 0,149%), chất chống oxy hoá vitamin C INS 300, chất làm dày xanthan gum INS 415, kẽm oxit, chế phẩm hỗn hợp 2 (gum arabic INS 414, saccarose, tinh bột bắp, dầu chế biến, silicon dioxide INS 551, vitamin D3, vitamin E). Sản phẩm không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.",
    "highlights": [
      "100mg canxi (lipocalcium) mỗi gói – theo nhà sản xuất",
      "Chiết xuất nhung hươu New Zealand, kẽm, vitamin D3, vitamin E",
      "Hỗn hợp trái cây nhiệt đới Israel (cam, xoài, chanh dây, ổi, chuối) và thảo mộc Hàn Quốc",
      "Dành cho bé từ 1 tuổi, túi 80ml nắp vặn, uống trực tiếp",
      "Đạt chuẩn HACCP · nhập khẩu chính ngạch, có bản tự công bố sản phẩm"
    ],
    "usage": "Uống trực tiếp, mỗi ngày 1 túi. Bảo quản nơi khô mát, tránh ánh nắng và nhiệt độ cao; đã mở túi thì bảo quản lạnh và dùng hết sớm. Hạn sử dụng 2 năm kể từ ngày sản xuất (xem trên bao bì).",
    "importer": "Công ty CP Xuất nhập khẩu và Phân phối Global Beauty Solutions",
    "congBo": "01/GLOBAL BEAUTY SOLUTIONS/2024",
    "seoTitle": "Gạc nhung hươu canxi Sumo Hàn Quốc – hộp 10 gói 80ml | Hương Chất Kids",
    "seoDesc": "Nước gạc nhung hươu canxi Sumo (Byplay) Hàn Quốc: 100mg canxi mỗi gói, nhung hươu New Zealand, kẽm, vitamin D3 – cho bé từ 1 tuổi. Chính hãng, có công bố. Hộp 10 gói, thùng 30 / 40 gói."
  },
  {
    "id": "23660586997",
    "name": "Nước Ép Hữu Cơ LOTTE Lê Và Hoa Chuông (Lotte cam) – Giúp Con Tăng Cường Sức Đề Kháng",
    "short": "Nước ép hữu cơ Lotte Lê & Hoa chuông (cam)",
    "brand": "lotte",
    "cat": "nuoc-ep",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "de-khang",
      "tang-can",
      "tieu-hoa",
      "organic"
    ],
    "price": 448000,
    "oldPrice": 627000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 3,
    "shape": "box",
    "color": "#FB8C00",
    "weight": "Gói 80ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Sản phẩm hot",
      "Giảm sâu"
    ],
    "image": "img/23660586997.jpg",
    "thumb": "img/thumb/23660586997.jpg",
    "images": [
      "img/23660586997.jpg",
      "img/23660586997-7.jpg",
      "img/23660586997-8.jpg",
      "img/23660586997-2.jpg",
      "img/23660586997-3.jpg",
      "img/23660586997-4.jpg",
      "img/23660586997-5.jpg",
      "img/23660586997-6.jpg"
    ],
    "shopeeId": "23660586997",
    "shopeeUrl": "https://shopee.vn/product/837223358/23660586997",
    "shopeeCategory": "Thực phẩm và đồ uống › Đồ uống › Khác",
    "variants": [
      {
        "label": "Hộp 10 gói",
        "price": 448000,
        "oldPrice": 627000
      },
      {
        "label": "Thùng 30 gói (3 hộp)",
        "price": 1317000,
        "oldPrice": 1844000
      }
    ],
    "desc": "Lotte cam (dòng Đề Kháng) – Nước ép hữu cơ LOTTE Lê và Hoa chuông (rễ cát cánh): giúp con tăng cường sức đề kháng (theo nhà sản xuất). Nước ép lê và rễ cát cánh (doraji) hữu cơ dòng Khoẻ Mạnh (무적튼튼) của Lotte, do Viện Pasteur Hàn Quốc nghiên cứu và sản xuất, gói 80ml có ống hút, dùng cho bé từ 12 tháng tuổi. Theo nhà sản xuất: lê & rễ cát cánh hữu cơ, hồng sâm organic cô đặc và lợi khuẩn EPS Lactobacillus (được cấp bằng sáng chế); không chất bảo quản, phụ gia; chứng nhận Organic và HACCP Hàn Quốc. Bổ sung vitamin C, kali, magie, axit amin, saponin, kẽm, canxi hỗ trợ đề kháng và hấp thu dưỡng chất.",
    "highlights": [
      "Dùng cho bé từ 12 tháng tuổi",
      "Lê & rễ cát cánh hữu cơ + hồng sâm cô đặc + lợi khuẩn EPS",
      "Chứng nhận Organic, HACCP – không chất bảo quản, phụ gia",
      "Hộp 10 gói · thùng 30 gói (3 hộp), gói nhỏ có ống hút tiện mang đi"
    ],
    "usage": "Bé từ 12 tháng: 1 gói (80ml)/ngày sau bữa ăn, lắc nhẹ trước khi uống, ngon hơn khi để mát. Đã mở gói nên dùng ngay. Theo hướng dẫn trên bao bì.",
    "slug": "nuoc-ep-lotte-de-khang"
  },
  {
    "id": "26060839019",
    "name": "Váng Sữa Canxi Hữu Cơ CALCIUMORE CALCIUM SUPPLEMENT Hàn Quốc Bé Lớn Khỏe Dành Cho Trẻ & Người Lớn",
    "short": "Váng sữa canxi hữu cơ Calciumore",
    "brand": "calciumore",
    "cat": "vitamin",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "tang-chieu-cao",
      "canxi",
      "organic",
      "cho-me"
    ],
    "price": 2480000,
    "oldPrice": 3225000,
    "rating": 4.92,
    "reviews": 156,
    "sold": 663,
    "stock": 50,
    "priority": 3,
    "shape": "box",
    "color": "#F9A825",
    "weight": "30 gói",
    "origin": "Hàn Quốc",
    "tags": [
      "Sản phẩm hot"
    ],
    "image": "img/26060839019.jpg",
    "thumb": "img/thumb/26060839019.jpg",
    "images": [
      "img/26060839019.jpg",
      "img/26060839019-3.jpg",
      "img/26060839019-4.jpg",
      "img/26060839019-5.jpg"
    ],
    "shopeeId": "26060839019",
    "shopeeUrl": "https://shopee.vn/product/837223358/26060839019",
    "shopeeCategory": "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Đồ ăn nhẹ cho bé",
    "variants": [
      {
        "label": "1 hộp 90 gói",
        "price": 2480000,
        "oldPrice": 3224000
      },
      {
        "label": "2 hộp váng sữa",
        "price": 4960000,
        "oldPrice": 6448000
      },
      {
        "label": "1 hộp váng sữa canxi+1 d3k2 giảm 5%",
        "price": 2726000
      },
      {
        "label": "30 gói (không hộp)",
        "price": 830000,
        "oldPrice": 1075000
      },
      {
        "label": "3 hộp váng sữa",
        "price": 7440000
      },
      {
        "label": "4 hộp váng sữa",
        "price": 9920000
      }
    ],
    "desc": "Canxi bổ sung dạng gói sệt vị váng sữa (không phải váng sữa tráng miệng) – Calciumore Calcium Supplement Hàn Quốc. Theo nhà sản xuất, sản phẩm bổ sung canxi hữu cơ, hỗ trợ xương chắc khoẻ và bé phát triển chiều cao.",
    "highlights": [
      "Canxi hữu cơ dễ hấp thu",
      "Dạng váng sữa thơm ngon, bé không sợ uống",
      "Hộp 90 gói dùng trong 3 tháng; dùng được cho cả mẹ và người lớn"
    ],
    "usage": "Bé dùng 1 gói/ngày sau bữa ăn. Liều dùng theo hướng dẫn trên bao bì."
  },
  {
    "id": "49061985399",
    "name": "Tinh Chất Nghệ Nano Curcumin 365 Plus Hàn Quốc 32 Tép/Hộp - Hỗ Trợ Dạ Dày, Đẹp Da, Mờ Thâm Sẹo",
    "short": "Nghệ nano Curcumin 365 Plus",
    "brand": "365plus",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me"
    ],
    "price": 1290000,
    "oldPrice": 1742000,
    "rating": 0,
    "reviews": 0,
    "sold": 5,
    "stock": 50,
    "shape": "box",
    "color": "#EF6C00",
    "weight": "32 tép/hộp",
    "origin": "Hàn Quốc",
    "tags": [
      "Cho mẹ"
    ],
    "image": "img/49061985399.jpg",
    "thumb": "img/thumb/49061985399.jpg",
    "images": [
      "img/49061985399.jpg",
      "img/49061985399-2.jpg",
      "img/49061985399-3.jpg",
      "img/49061985399-4.jpg",
      "img/49061985399-5.jpg"
    ],
    "shopeeId": "49061985399",
    "shopeeUrl": "https://shopee.vn/product/837223358/49061985399",
    "shopeeCategory": "Sắc Đẹp › Chăm sóc da mặt › Tinh chất dưỡng",
    "variants": [
      {
        "label": "1 hộp",
        "price": 1290000,
        "oldPrice": 1742000
      },
      {
        "label": "2 hộp",
        "price": 2580000,
        "oldPrice": 3484000
      }
    ],
    "desc": "Tinh chất nghệ nano Curcumin 365 Plus Hàn Quốc, hộp 32 tép. Theo nhà sản xuất, sản phẩm hỗ trợ dạ dày, hỗ trợ làm đẹp da, giảm thâm sẹo – phù hợp cho mẹ sau sinh.",
    "highlights": [
      "Nano curcumin hấp thu tốt hơn nghệ thường",
      "Hỗ trợ dạ dày, đẹp da, mờ thâm",
      "Tép nhỏ tiện dùng hằng ngày"
    ],
    "usage": "Người lớn dùng 1 tép/ngày sau ăn. Dùng theo hướng dẫn trên bao bì. Mẹ đang mang thai hoặc cho con bú cần hỏi ý kiến bác sĩ trước khi dùng."
  },
  {
    "id": "41353214697",
    "name": "Nước Ép Hữu Cơ LOTTE Táo Và Củ Dền (Lotte xanh) – Bổ Sung Canxi, Hỗ Trợ Phát Triển Chiều Cao",
    "short": "Nước ép hữu cơ Lotte Táo & Củ dền (xanh)",
    "brand": "lotte",
    "cat": "nuoc-ep",
    "ages": [
      "6-12m",
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "canxi",
      "organic",
      "an-dam"
    ],
    "price": 448000,
    "oldPrice": 627000,
    "rating": 5,
    "reviews": 23,
    "sold": 190,
    "stock": 50,
    "priority": 3,
    "shape": "box",
    "color": "#2E7D32",
    "weight": "10 gói",
    "origin": "Hàn Quốc",
    "tags": [
      "Sản phẩm hot"
    ],
    "image": "img/41353214697.jpg",
    "thumb": "img/thumb/41353214697.jpg",
    "images": [
      "img/41353214697.jpg",
      "img/41353214697-3.jpg",
      "img/41353214697-4.jpg",
      "img/41353214697-5.jpg"
    ],
    "shopeeId": "41353214697",
    "shopeeUrl": "https://shopee.vn/product/837223358/41353214697",
    "shopeeCategory": "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Khác",
    "variants": [
      {
        "label": "Hộp 10 gói",
        "price": 448000,
        "oldPrice": 627000
      },
      {
        "label": "Thùng 30 gói (3 hộp)",
        "price": 1317000,
        "oldPrice": 1844000
      }
    ],
    "desc": "Lotte xanh (dòng Tăng Cao) – Nước ép hữu cơ LOTTE Táo và Củ dền: bổ sung canxi, hỗ trợ phát triển chiều cao (theo nhà sản xuất). Nước dinh dưỡng Lotte Xanh Hàn Quốc, theo nhà sản xuất hỗ trợ phát triển chiều cao ở trẻ nhỏ và tuổi dậy thì.",
    "highlights": [
      "Dùng được cho bé từ 6 tháng – hợp giai đoạn ăn dặm",
      "Táo & củ dền hữu cơ, chứng nhận Organic, HACCP",
      "Bổ sung canxi, sắt, axit folic"
    ],
    "usage": "Bé 6–12 tháng: 1/2–1 gói/ngày, cho uống bằng thìa hoặc bình; bé trên 1 tuổi: 1 gói/ngày. Theo hướng dẫn trên bao bì.",
    "slug": "nuoc-ep-lotte-tang-cao"
  },
  {
    "id": "28467224687",
    "name": "TẢO ĐÔ HOÀNG GIA Hotan Tân Cương bigsize hàng loại 1 cao cấp, hỗ trợ bồi bổ sức khoẻ và giấc ngủ",
    "short": "Táo đỏ Hoàng Gia Hotan Tân Cương gói 1kg",
    "brand": "primefood",
    "cat": "thuc-pham",
    "ages": [],
    "needs": [
      "an-vat",
      "cho-me"
    ],
    "price": 299000,
    "oldPrice": 404000,
    "rating": 4.9,
    "reviews": 0,
    "sold": 60,
    "stock": 50,
    "shape": "box",
    "color": "#C62828",
    "weight": "Gói 1kg",
    "origin": "Trung Quốc",
    "tags": [],
    "family": true,
    "image": "img/28467224687.jpg",
    "thumb": "img/thumb/28467224687.jpg",
    "images": [
      "img/28467224687.jpg",
      "img/28467224687-2.jpg",
      "img/28467224687-3.jpg",
      "img/28467224687-4.jpg",
      "img/28467224687-5.jpg"
    ],
    "shopeeId": "28467224687",
    "shopeeUrl": "https://shopee.vn/product/837223358/28467224687",
    "shopeeCategory": "Thực phẩm và đồ uống › Đồ ăn vặt › Thức ăn khô › Hoa quả sấy khô",
    "variants": [
      {
        "label": "1 gói",
        "price": 299000,
        "oldPrice": 404000
      },
      {
        "label": "2 gói",
        "price": 598000,
        "oldPrice": 807000
      }
    ],
    "desc": "Táo đỏ Hotan (Hoà Điền, Tân Cương) loại 1 size lớn, quả to dày thịt, ngọt tự nhiên, sấy khô không đường, không chất bảo quản. Dùng ăn liền, pha trà, nấu chè, hầm canh, chưng yến cho cả nhà.",
    "highlights": [
      "100% táo đỏ Hotan Tân Cương loại 1, size big",
      "Không đường, không chất bảo quản",
      "Gói 1kg – mua 2 gói tiết kiệm hơn"
    ],
    "usage": "Ăn trực tiếp 3–5 quả/ngày, hoặc pha trà, nấu chè, hầm canh. Bảo quản nơi khô ráo, đậy kín sau khi mở."
  },
  {
    "id": "26523206270",
    "name": "Sữa Tươi Tiệt Trùng Norco Nội Địa Úc Bổ Sung Sức Khỏe Cho Cơ Thể - Hương Vị Nguyên Chất, Dinh Dưỡng",
    "short": "Sữa tươi tiệt trùng Norco nguyên kem nội địa Úc 1L",
    "brand": "norco",
    "cat": "sua",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "sua-tuoi",
      "canxi",
      "tang-chieu-cao"
    ],
    "price": 720000,
    "oldPrice": 972000,
    "rating": 5,
    "reviews": 0,
    "sold": 76,
    "stock": 50,
    "shape": "carton",
    "color": "#1565C0",
    "weight": "Thùng",
    "origin": "Úc",
    "tags": [],
    "image": "img/26523206270.jpg",
    "thumb": "img/thumb/26523206270.jpg",
    "images": [
      "img/26523206270.jpg",
      "img/26523206270-2.jpg",
      "img/26523206270-3.jpg",
      "img/26523206270-4.jpg",
      "img/26523206270-5.jpg"
    ],
    "shopeeId": "26523206270",
    "shopeeUrl": "https://shopee.vn/product/837223358/26523206270",
    "shopeeCategory": "Thực phẩm và đồ uống › Sữa - trứng › Sữa › Sữa tiệt trùng",
    "variants": [
      {
        "label": "1 thùng",
        "price": 720000,
        "oldPrice": 972000
      },
      {
        "label": "2 thùng",
        "price": 1440000,
        "oldPrice": 1944000
      }
    ],
    "desc": "Sữa tươi tiệt trùng Norco – thương hiệu sữa hơn 128 năm của Úc, sản xuất từ đàn bò ăn cỏ nội địa Úc; sữa nguyên kem giàu canxi và đạm tự nhiên, vị béo thanh, không đường. Phù hợp bé từ 1 tuổi và cả gia đình.",
    "highlights": [
      "Thương hiệu Norco 128 năm, hàng nội địa Úc",
      "Sữa bò ăn cỏ, không đường, không chất bảo quản",
      "Giàu canxi & đạm, hỗ trợ bé phát triển chiều cao"
    ],
    "usage": "Bé trên 1 tuổi uống 1–2 ly (200–400ml)/ngày. Sau khi mở nắp bảo quản lạnh và dùng trong 3 ngày."
  },
  {
    "id": "13899935993",
    "name": "Sữa Dê Lotte Kid A+ Bổ Sung Canxi Hỗ Trợ Phát Triển Chiều Cao, Tăng Đề Kháng Cho Trẻ 760g",
    "short": "Sữa dê Lotte Kid A+ 760g",
    "brand": "lotte",
    "cat": "sua",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "sua-cong-thuc",
      "canxi",
      "tang-chieu-cao",
      "de-khang"
    ],
    "price": 850000,
    "oldPrice": 1148000,
    "rating": 5,
    "reviews": 0,
    "sold": 33,
    "stock": 50,
    "priority": 2,
    "shape": "can",
    "color": "#E60012",
    "weight": "Lon 760g",
    "origin": "Hàn Quốc",
    "tags": [],
    "formula": true,
    "image": "img/13899935993.jpg",
    "thumb": "img/thumb/13899935993.jpg",
    "images": [
      "img/13899935993.jpg",
      "img/13899935993-2.jpg",
      "img/13899935993-3.jpg",
      "img/13899935993-4.jpg"
    ],
    "shopeeId": "13899935993",
    "shopeeUrl": "https://shopee.vn/product/837223358/13899935993",
    "shopeeCategory": "Mẹ & Bé › Sữa công thức & Thực phẩm cho bé › Sữa công thức",
    "variants": [
      {
        "label": "1 hộp",
        "price": 850000,
        "oldPrice": 1148000
      },
      {
        "label": "2 hộp",
        "price": 1700000,
        "oldPrice": 2296000
      }
    ],
    "desc": "Sữa dê Lotte Kid A+ (Hàn Quốc) lon 760g cho bé từ 1 tuổi. Theo nhà sản xuất: bổ sung canxi, vitamin D, Alpha-lactalbumin (1.050mg/100g) hỗ trợ miễn dịch và hệ lợi khuẩn thực vật (100 triệu CFU/lon) hỗ trợ tiêu hoá tốt; đạm sữa dê dễ hấp thu, phù hợp bé chậm tăng cân.",
    "highlights": [
      "Sữa dê dễ hấp thu, hỗ trợ tăng cân & chiều cao",
      "Alpha-lactalbumin + lợi khuẩn hỗ trợ miễn dịch, tiêu hoá",
      "Đạt tiêu chuẩn xuất khẩu nhiều thị trường"
    ],
    "usage": "Pha 7–8 muỗng gạt (muỗng trong hộp) với 180ml nước ấm 40–50°C được 1 ly 240ml. 2 ly/ngày. Dùng trong 3 tuần sau khi mở."
  },
  {
    "id": "19682441455",
    "name": "SỮA DÊ BIOSTIME- 800g - Hỗ Trợ Bé Phát Triển Toàn Diện Về Chiều Cao- Cân Nặng",
    "short": "Sữa dê Biostime 800g",
    "brand": "biostime",
    "cat": "sua",
    "ages": [
      "0-6m",
      "6-12m",
      "1-3y"
    ],
    "needs": [
      "sua-cong-thuc",
      "tang-can",
      "tang-chieu-cao"
    ],
    "price": 1170000,
    "oldPrice": 1580000,
    "rating": 5,
    "reviews": 0,
    "sold": 32,
    "stock": 50,
    "shape": "can",
    "color": "#6D4C41",
    "weight": "Lon 800g",
    "origin": "Úc",
    "tags": [],
    "formula": true,
    "image": "img/19682441455.jpg",
    "thumb": "img/thumb/19682441455.jpg",
    "images": [
      "img/19682441455.jpg",
      "img/19682441455-2.jpg",
      "img/19682441455-3.jpg",
      "img/19682441455-4.jpg"
    ],
    "shopeeId": "19682441455",
    "shopeeUrl": "https://shopee.vn/product/837223358/19682441455",
    "shopeeCategory": "Mẹ & Bé › Chăm sóc sức khỏe bé › Khác",
    "variants": [
      {
        "label": "Số 1 (0–6 tháng)",
        "price": 1170000,
        "oldPrice": 1580000
      },
      {
        "label": "Số 2 (6–12 tháng)",
        "price": 1170000,
        "oldPrice": 1580000
      },
      {
        "label": "Số 3 (từ 12 tháng)",
        "price": 1170000,
        "oldPrice": 1580000
      }
    ],
    "desc": "Sữa dê công thức Biostime (Úc) lon 800g – dòng sữa dê cao cấp hỗ trợ bé phát triển toàn diện chiều cao và cân nặng; đạm sữa dê nhỏ, dễ tiêu, ít gây dị ứng. Số 1: 0–6 tháng, số 2: 6–12 tháng, số 3: từ 12 tháng.",
    "highlights": [
      "Sữa dê dễ tiêu, phù hợp bé nhạy cảm với sữa bò",
      "Sản xuất tại Úc",
      "Đủ số 1, 2, 3"
    ],
    "usage": "1 muỗng gạt pha với 30ml nước ấm theo bảng trên hộp. Sữa pha xong dùng trong 1 giờ."
  },
  {
    "id": "48112514210",
    "name": "SUPER COLLAGEN ALPHA 90 Gói Collagen Peptide VERISOL Đức, Hỗ Trợ Đẹp Da, Tăng Độ Đàn Hồi, Dưỡng Ẩm",
    "short": "Super Collagen Alpha 90 gói (Đức)",
    "brand": "alpha",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 3600000,
    "oldPrice": 4860000,
    "rating": 0,
    "reviews": 0,
    "sold": 4,
    "stock": 50,
    "shape": "box",
    "color": "#8E24AA",
    "weight": "Hộp 90 gói (270g)",
    "origin": "Đức",
    "tags": [],
    "image": "img/48112514210.jpg",
    "thumb": "img/thumb/48112514210.jpg",
    "images": [
      "img/48112514210.jpg",
      "img/48112514210-2.jpg",
      "img/48112514210-3.jpg",
      "img/48112514210-4.jpg",
      "img/48112514210-5.jpg"
    ],
    "shopeeId": "48112514210",
    "shopeeUrl": "https://shopee.vn/product/837223358/48112514210",
    "shopeeCategory": "Sức Khỏe › Thực phẩm chức năng › Hỗ trợ làm đẹp",
    "variants": [
      {
        "label": "1 hộp",
        "price": 3600000,
        "oldPrice": 4860000
      },
      {
        "label": "2 hộp",
        "price": 7200000,
        "oldPrice": 9720000
      }
    ],
    "desc": "Super Collagen Alpha hộp 90 gói, Collagen Peptide VERISOL® (Đức) kết hợp vitamin C, Hyaluronic Acid, Biotin, N-Acetylglucosamine và chiết xuất ốc sên. Theo nhà sản xuất: hỗ trợ da căng mịn, giảm nếp nhăn, chống lão hoá cho mẹ.",
    "highlights": [
      "Collagen VERISOL® Đức",
      "Kèm vitamin C, HA, Biotin",
      "Hộp 90 gói dùng 3 tháng"
    ],
    "usage": "Mỗi ngày 1 gói pha với nước, uống sau ăn. Phụ nữ có thai/cho con bú hỏi ý kiến bác sĩ."
  },
  {
    "id": "25632276959",
    "name": "Nước Ép Hữu Cơ LOTTE Nho Và Mận (Lotte hồng) – Bổ Sung Lợi Khuẩn, Giúp Con Ăn Ngon Miệng",
    "short": "Nước ép hữu cơ Lotte Nho & Mận (hồng)",
    "brand": "lotte",
    "cat": "nuoc-ep",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "tang-can",
      "tieu-hoa",
      "organic",
      "de-khang"
    ],
    "price": 448000,
    "oldPrice": 627000,
    "rating": 4.9,
    "reviews": 0,
    "sold": 431,
    "stock": 50,
    "priority": 3,
    "shape": "box",
    "color": "#7B1FA2",
    "weight": "Gói 80ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Sản phẩm hot",
      "Bán chạy"
    ],
    "image": "img/25632276959.jpg",
    "thumb": "img/thumb/25632276959.jpg",
    "images": [
      "img/25632276959.jpg",
      "img/25632276959-2.jpg",
      "img/25632276959-3.jpg",
      "img/25632276959-4.jpg",
      "img/25632276959-5.jpg",
      "img/25632276959-cb.jpg"
    ],
    "shopeeId": "25632276959",
    "shopeeUrl": "https://shopee.vn/product/837223358/25632276959",
    "shopeeCategory": "Thực phẩm và đồ uống › Đồ uống › Khác",
    "variants": [
      {
        "label": "Hộp 10 gói",
        "price": 448000,
        "oldPrice": 627000
      },
      {
        "label": "Thùng 30 gói (3 hộp)",
        "price": 1317000,
        "oldPrice": 1844000
      }
    ],
    "desc": "Lotte hồng (dòng Tăng Cân) – Nước ép hữu cơ LOTTE Nho và Mận: bổ sung lợi khuẩn, giúp con ăn ngon miệng (theo nhà sản xuất). Nước ép mận, nho và táo hữu cơ Lotte (Pasteur Prune & Grape & Apple Juice) dòng Tăng Cân – Ăn Ngon, túi 80ml có nắp vặn, nhà sản xuất Food Well Co., Ltd (Daegu, Hàn Quốc). Theo nhà sản xuất: 99,94% nguyên liệu hữu cơ, lợi khuẩn EPS Lactobacillus, hỗ trợ bé ăn ngon, cân bằng tiêu hoá, giảm táo bón. Có bản tự công bố sản phẩm tại Việt Nam.",
    "highlights": [
      "99,94% nguyên liệu hữu cơ, chứng nhận HACCP & Organic",
      "Mận hỗ trợ nhuận tràng, giảm táo bón",
      "Đã công bố ATTP tại Việt Nam (xem ảnh cuối)"
    ],
    "usage": "Bé từ 1 tuổi: 1 gói/ngày sau ăn. Hạn dùng 12 tháng, đã mở gói dùng ngay.",
    "slug": "nuoc-ep-lotte-tang-can-tu-nhien"
  },
  {
    "id": "lotte-hau-an",
    "name": "Lotte Háu Ăn – Nước Uống Lợi Khuẩn Bareun Mokjang Lactic Hàn Quốc, Thùng 24 Hộp 125ml",
    "short": "Lotte Háu Ăn – nước uống lợi khuẩn Bareun Mokjang (thùng 24 hộp)",
    "brand": "lotte",
    "cat": "sua",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "tieu-hoa",
      "de-khang",
      "tang-can"
    ],
    "price": 635000,
    "oldPrice": 635000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 100,
    "priority": 5,
    "shape": "box",
    "color": "#2E7BD6",
    "weight": "Thùng 24 hộp × 125ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Mới",
      "Sản phẩm hot"
    ],
    "image": "img/lotte-hau-an.jpg",
    "thumb": "img/thumb/lotte-hau-an.jpg",
    "images": [
      "img/lotte-hau-an.jpg",
      "img/lotte-hau-an-2.jpg",
      "img/lotte-hau-an-3.jpg"
    ],
    "variants": [
      {
        "label": "Date 12/2026 · Mua 1 tặng 1 (2 thùng)",
        "price": 635000,
        "oldPrice": 635000
      },
      {
        "label": "Date 03/2027 · Thùng 24 hộp",
        "price": 775000,
        "oldPrice": 775000
      }
    ],
    "desc": "Lotte Háu Ăn (Bareun Mokjang Lactic) là nước uống lợi khuẩn của Pasteur – Tập đoàn Lotte Hàn Quốc, hộp 125ml, thùng 24 hộp, dùng cho bé từ 1 tuổi. Theo nhà sản xuất: sản phẩm chứa 4,5% dịch nuôi cấy lợi khuẩn lên men từ sữa nguyên liệu Bareun Mokjang; Isomalto-oligosaccharide – chất xơ hoà tan, là nguồn thức ăn cho lợi khuẩn đường ruột; bổ sung 7 loại vitamin A, B2, B6, C, E, Niacin và axit folic. Vị sữa chua ngọt dịu, hộp nhỏ gọn tiện mang đi học, đi chơi. Bảo quản ở nhiệt độ phòng, hạn dùng 12 tháng kể từ ngày sản xuất (in trên bao bì). Phân loại: lô date 12/2026 mua 1 tặng 1 (nhận 2 thùng) giá 635.000đ; lô date 03/2027 giá 775.000đ/thùng. Sản phẩm không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh.",
    "highlights": [
      "4,5% dịch nuôi cấy lợi khuẩn lên men từ sữa – theo nhà sản xuất",
      "Isomalto-oligosaccharide (chất xơ hoà tan) – thức ăn cho lợi khuẩn đường ruột",
      "Bổ sung 7 loại vitamin A, B2, B6, C, E, Niacin, axit folic",
      "Dùng cho bé từ 1 tuổi · hộp 125ml, thùng 24 hộp",
      "Date 12/2026: mua 1 tặng 1 (2 thùng) 635.000đ · Date 03/2027: 775.000đ/thùng"
    ],
    "usage": "Lắc nhẹ trước khi uống. Bé từ 1 tuổi dùng 1 – 2 hộp mỗi ngày, ngon hơn khi uống lạnh. Bảo quản nơi khô mát, tránh ánh nắng; hộp đã mở nên dùng hết trong ngày. Dùng theo hướng dẫn của nhà sản xuất.",
    "seoTitle": "Lotte Háu Ăn – nước uống lợi khuẩn Bareun Mokjang Hàn Quốc thùng 24 hộp | Hương Chất Kids",
    "seoDesc": "Lotte Háu Ăn Bareun Mokjang Lactic: 4,5% dịch nuôi cấy lợi khuẩn, chất xơ Isomalto-oligosaccharide, 7 vitamin, cho bé từ 1 tuổi. Thùng 24 hộp 125ml, date 12/2026 mua 1 tặng 1."
  },
  {
    "id": "43532388498",
    "name": "Ngũ Cốc Tuổi Thọ Healthy Fuwa-Saku Granola Nhật Bản 200g",
    "short": "Granola Fuwa-Saku Nhật Bản 200g",
    "brand": "sakuma",
    "cat": "thuc-pham",
    "ages": [
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "an-vat"
    ],
    "price": 289000,
    "oldPrice": 390000,
    "rating": 0,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "shape": "box",
    "color": "#8D6E63",
    "weight": "Gói 200g",
    "origin": "Nhật Bản",
    "tags": [],
    "family": true,
    "image": "img/43532388498-h.jpg",
    "thumb": "img/thumb/43532388498-h.jpg",
    "images": [
      "img/43532388498-h.jpg",
      "img/43532388498-2.jpg",
      "img/43532388498-3.jpg",
      "img/43532388498-4.jpg",
      "img/43532388498-5.jpg"
    ],
    "shopeeId": "43532388498",
    "shopeeUrl": "https://shopee.vn/product/837223358/43532388498",
    "shopeeCategory": "Thực phẩm và đồ uống › Ngũ cốc & mứt › Ngũ cốc",
    "variants": [
      {
        "label": "1 gói 200g",
        "price": 289000,
        "oldPrice": 390000
      },
      {
        "label": "2 gói",
        "price": 578000,
        "oldPrice": 780000
      }
    ],
    "desc": "Ngũ cốc granola Healthy Fuwa-Saku (Sakuma Seika, Nhật Bản) kết hợp 15 loại ngũ cốc, hạt và trái cây tự nhiên; giàu chất xơ, vitamin, khoáng chất. 50g cung cấp 207 kcal, 3,3g protein – bữa sáng nhanh gọn cho cả nhà.",
    "highlights": [
      "15 loại ngũ cốc, hạt & trái cây",
      "Giòn xốp, ít muối",
      "Bữa sáng 5 phút cho cả gia đình"
    ],
    "usage": "50g granola + 200ml sữa tươi hoặc sữa chua. Đậy kín sau khi mở."
  },
  {
    "id": "57413220644",
    "name": "Mặt Nạ Thạch Lô Hội CURE Hàn Quốc - Cấp Ẩm, Làm Dịu Da, Hỗ Trợ Phục Hồi Da, Dưỡng Sáng Da",
    "short": "Mặt nạ thạch lô hội Cure Hàn Quốc",
    "brand": "kimjeongmoon",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 790000,
    "oldPrice": 1067000,
    "rating": 0,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "cosmetic": true,
    "shape": "box",
    "color": "#43A047",
    "weight": "Hộp",
    "origin": "Hàn Quốc",
    "tags": [
      "Sản phẩm hot"
    ],
    "image": "img/57413220644.jpg",
    "thumb": "img/thumb/57413220644.jpg",
    "images": [
      "img/57413220644.jpg",
      "img/57413220644-2.jpg",
      "img/57413220644-3.jpg",
      "img/57413220644-4.jpg",
      "img/57413220644-5.jpg"
    ],
    "shopeeId": "57413220644",
    "shopeeUrl": "https://shopee.vn/product/837223358/57413220644",
    "shopeeCategory": "Sắc Đẹp › Tắm & chăm sóc cơ thể › Mặt nạ ủ cơ thể",
    "variants": [
      {
        "label": "1 hộp",
        "price": 790000,
        "oldPrice": 1067000
      },
      {
        "label": "2 hộp",
        "price": 1580000,
        "oldPrice": 2134000
      }
    ],
    "desc": "Mặt nạ thạch lô hội Cure (Kim Jeong Moon Aloe, Hàn Quốc) ứng dụng công nghệ Exosome, kết hợp lô hội, Niacinamide, Collagen thuỷ phân và vitamin. Theo nhà sản xuất: cấp ẩm sâu, làm dịu da, phục hồi da căng mướt.",
    "highlights": [
      "Thạch lô hội mát dịu",
      "Niacinamide + Collagen thuỷ phân",
      "Phù hợp mẹ sau sinh da khô, sạm"
    ],
    "usage": "Đắp 15–20 phút, 2–3 lần/tuần sau khi rửa mặt sạch.",
    "priority": 7
  },
  {
    "id": "57903449970",
    "name": "Kem thắp sáng hồng da Cell Happy Co 5in1 nâng tone, bảo vệ da khỏi ánh nắng giúp da căng bóng",
    "short": "Kem hồng da Cell Happy Co 5in1",
    "brand": "cellhappy",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 693000,
    "oldPrice": 936000,
    "rating": 5,
    "reviews": 0,
    "sold": 11,
    "stock": 50,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#F06292",
    "weight": "Tuýp",
    "origin": "Hàn Quốc",
    "tags": [
      "Sản phẩm hot"
    ],
    "image": "img/57903449970-h.jpg",
    "thumb": "img/thumb/57903449970-h.jpg",
    "images": [
      "img/57903449970-h.jpg",
      "img/57903449970-2.jpg",
      "img/57903449970-3.jpg",
      "img/57903449970-4.jpg",
      "img/57903449970-5.jpg"
    ],
    "shopeeId": "57903449970",
    "shopeeUrl": "https://shopee.vn/product/837223358/57903449970",
    "shopeeCategory": "Sắc Đẹp › Chăm sóc da mặt › Kem dưỡng ẩm",
    "desc": "Kem dưỡng hồng da Cell Happy Co 5in1 (Hàn Quốc): nâng tone, chống nắng vô cơ không gây kích ứng, dưỡng ẩm, làm sáng và bảo vệ da khỏi tia UV. Theo nhà sản xuất: cho da căng bóng, trắng hồng tự nhiên.",
    "highlights": [
      "5 công dụng: nâng tone, chống nắng, dưỡng ẩm, sáng da, bảo vệ",
      "Chống nắng vô cơ, không kích ứng",
      "Thương hiệu Hàn Quốc"
    ],
    "usage": "Thoa lớp mỏng buổi sáng sau bước dưỡng, trước khi trang điểm.",
    "priority": 8
  },
  {
    "id": "27355720019",
    "name": "Hồng Sâm Siêu Trí Tuệ Rich Kid – Hỗ Trợ Phát Triển Trí Não, Tăng Khả Năng Tập Trung",
    "short": "Hồng sâm Siêu Trí Tuệ Rich Kid (Kinigini) hộp 10 gói",
    "brand": "kinigini",
    "cat": "hong-sam",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "tri-nao",
      "de-khang"
    ],
    "price": 480000,
    "oldPrice": 648000,
    "rating": 5,
    "reviews": 0,
    "sold": 213,
    "stock": 50,
    "shape": "box",
    "color": "#5E35B1",
    "weight": "Hộp 10 gói × 40ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Bán chạy"
    ],
    "image": "img/27355720019.jpg",
    "thumb": "img/thumb/27355720019.jpg",
    "images": [
      "img/27355720019.jpg",
      "img/27355720019-2.jpg",
      "img/27355720019-3.jpg",
      "img/27355720019-4.jpg",
      "img/27355720019-5.jpg"
    ],
    "shopeeId": "27355720019",
    "shopeeUrl": "https://shopee.vn/product/837223358/27355720019",
    "shopeeCategory": "Mẹ & Bé › Chăm sóc sức khỏe bé › Khác",
    "variants": [
      {
        "label": "1 hộp",
        "price": 480000,
        "oldPrice": 648000
      },
      {
        "label": "2 hộp",
        "price": 960000,
        "oldPrice": 1296000
      }
    ],
    "desc": "Hồng sâm hữu cơ Kinigini Kids Red Ginseng “Rich Kid” (Hàn Quốc), gói 40ml, hộp 10 gói, cho bé 2–15 tuổi. Theo nhà sản xuất: hỗ trợ phát triển trí não, tăng tập trung, tăng đề kháng.",
    "highlights": [
      "Hồng sâm hữu cơ cho bé 2–15 tuổi",
      "Hỗ trợ trí não, tập trung khi đi học",
      "Gói 40ml uống liền, ngon hơn khi lạnh"
    ],
    "usage": "Bé uống 1 gói/ngày hoặc 2–3 ngày 1 gói, uống trực tiếp, ngon hơn khi để lạnh."
  },
  {
    "id": "51013054442",
    "name": "Xịt Phun Sương Grace By Chera Snow White Tone-Up Booster 150ml Hàn Quốc  Dưỡng Trắng Làm Đều Màu Da",
    "short": "Xịt phun sương nâng tone Grace By Chera 150ml",
    "brand": "chera",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 835000,
    "oldPrice": 1127000,
    "rating": 5,
    "reviews": 3,
    "sold": 12,
    "stock": 50,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#F48FB1",
    "weight": "Chai 150ml",
    "origin": "Hàn Quốc",
    "tags": [],
    "image": "img/51013054442-h.jpg",
    "thumb": "img/thumb/51013054442-h.jpg",
    "images": [
      "img/51013054442-h.jpg",
      "img/51013054442-2.jpg",
      "img/51013054442-3.jpg",
      "img/51013054442-4.jpg",
      "img/51013054442-5.jpg"
    ],
    "shopeeId": "51013054442",
    "shopeeUrl": "https://shopee.vn/product/1192937802/51013054442",
    "shopeeCategory": "Sắc Đẹp › Chăm sóc da mặt › Xịt khoáng",
    "variants": [
      {
        "label": "1 chai",
        "price": 835000,
        "oldPrice": 1127000
      },
      {
        "label": "2 chai",
        "price": 1598000,
        "oldPrice": 2157000
      },
      {
        "label": "3 chai",
        "price": 2293000,
        "oldPrice": 3096000
      }
    ],
    "desc": "Xịt phun sương Grace By Chera Snow White Tone-Up Booster 150ml, sản xuất bởi SKIN N SKIN Co., Ltd (Hàn Quốc). Theo nhà sản xuất: nâng tone da tức thì, cấp ẩm, giúp da mềm mịn và đều màu hơn; dùng được cho cả mặt và toàn thân.",
    "highlights": [
      "Nâng tone tức thì, hiệu ứng trắng hồng tự nhiên",
      "Cấp ẩm, da mềm mịn",
      "Dùng cho cả mặt và body"
    ],
    "usage": "Làm sạch và lau khô da, xịt lượng vừa đủ rồi thoa đều, massage nhẹ tới khi thấm. Dùng buổi sáng hoặc trước khi ra ngoài."
  },
  {
    "id": "24767149051",
    "name": "Viên Uống PURE NMN 12000MG+ Hỗ Trợ Chống Lão Hóa, Hỗ Trợ Cải Thiện Sức Khỏe Và Sắc Đẹp",
    "short": "Viên uống Pure NMN 12000mg+ hộp 60 viên",
    "brand": "clastive",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me"
    ],
    "price": 3960000,
    "oldPrice": 8100000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "shape": "bottle",
    "color": "#455A64",
    "weight": "Hộp 60 viên",
    "origin": "Nhật Bản",
    "tags": [],
    "image": "img/24767149051-h.jpg",
    "thumb": "img/thumb/24767149051-h.jpg",
    "images": [
      "img/24767149051-h.jpg",
      "img/24767149051-2.jpg",
      "img/24767149051-3.jpg",
      "img/24767149051-4.jpg",
      "img/24767149051-5.jpg"
    ],
    "shopeeId": "24767149051",
    "shopeeUrl": "https://shopee.vn/product/1192937802/24767149051",
    "shopeeCategory": "Sức Khỏe › Thực phẩm chức năng › Hỗ trợ làm đẹp",
    "variants": [
      {
        "label": "1 hộp",
        "price": 3960000,
        "oldPrice": 4950000
      },
      {
        "label": "2 hộp",
        "price": 7920000,
        "oldPrice": 9900000
      },
      {
        "label": "NMN Regene 1 hộp",
        "price": 5560000,
        "oldPrice": 6950000
      }
    ],
    "desc": "Viên uống Pure NMN 12.000mg+ (Clastive, Nhật Bản), hộp 60 viên. Thành phần gồm NMN 99,99%, collagen peptide, nhau thai ngựa, glutathione và hyaluronic acid. Theo nhà sản xuất: hỗ trợ chống lão hoá, tăng cường năng lượng và cân bằng nội tiết.",
    "highlights": [
      "NMN 12.000mg+ độ tinh khiết 99,99%",
      "Kèm collagen peptide, glutathione, HA",
      "Hộp 60 viên dùng 1 tháng"
    ],
    "usage": "Uống 2 viên/ngày sau ăn sáng, uống với nhiều nước. Đọc kỹ hướng dẫn trên bao bì."
  },
  {
    "id": "50002678694",
    "name": "Thảm Ngải Cứu Đông Y Toả Nhiệt – Thư Giãn Lưng, Vai Gáy, Tay Chân, Hỗ Trợ Ngủ Ngon, Lưu Thông Khí Huyết, Có Điều Khiển",
    "short": "Thảm ngải cứu toả nhiệt 150×60cm",
    "brand": "khac",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me"
    ],
    "price": 900000,
    "oldPrice": 1215000,
    "rating": 0,
    "reviews": 0,
    "sold": 9,
    "stock": 50,
    "cosmetic": true,
    "shape": "box",
    "color": "#7CB342",
    "weight": "Thảm 150×60cm",
    "origin": "Việt Nam",
    "tags": [],
    "image": "img/50002678694-h.jpg",
    "thumb": "img/thumb/50002678694-h.jpg",
    "images": [
      "img/50002678694-h.jpg",
      "img/50002678694-2.jpg",
      "img/50002678694-3.jpg",
      "img/50002678694-4.jpg",
      "img/50002678694-5.jpg"
    ],
    "shopeeId": "50002678694",
    "shopeeUrl": "https://shopee.vn/product/1192937802/50002678694",
    "shopeeCategory": "Sức Khỏe › Chăm sóc cá nhân › Dụng cụ massage và trị liệu",
    "variants": [
      {
        "label": "Thảm ngải cứu",
        "price": 1990000,
        "oldPrice": 2687000
      },
      {
        "label": "Lõi thảm",
        "price": 900000,
        "oldPrice": 1215000
      }
    ],
    "desc": "Thảm ngải cứu toả nhiệt kích thước 150×60cm, đệm sưởi điện tích hợp 220V–50Hz, có bộ điều khiển. Theo nhà sản xuất: hơi ấm từ ngải cứu giúp thư giãn vùng lưng, vai gáy và tay chân, hỗ trợ giấc ngủ và lưu thông khí huyết.",
    "highlights": [
      "Thảm ngải cứu 150×60cm, điều khiển thông minh",
      "Toả nhiệt ấm đều vùng lưng – vai gáy",
      "Thư giãn, hỗ trợ ngủ ngon"
    ],
    "usage": "Trải thảm, cắm điện và chọn mức nhiệt vừa với cơ thể, nằm 20–30 phút mỗi lần. Không dùng khi da có vết thương hở; rút điện sau khi dùng."
  },
  {
    "id": "24465090622",
    "name": "Sữa Tắm Dưỡng Trắng Body Glutanex 300ml Dưỡng Trắng Da Tức Thì Đem Lại Một Làn Da Trắng Sáng Và Ẩm Mượt Mềm Mại",
    "short": "Sữa tắm dưỡng trắng Glutanex 300ml",
    "brand": "glutanex",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 1290000,
    "oldPrice": 1742000,
    "rating": 5,
    "reviews": 1,
    "sold": 10,
    "stock": 50,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#1E88E5",
    "weight": "Chai 300ml",
    "origin": "Hàn Quốc",
    "tags": [],
    "image": "img/24465090622-h.jpg",
    "thumb": "img/thumb/24465090622-h.jpg",
    "images": [
      "img/24465090622-h.jpg",
      "img/24465090622-2.jpg",
      "img/24465090622-3.jpg",
      "img/24465090622-4.jpg",
      "img/24465090622-5.jpg"
    ],
    "shopeeId": "24465090622",
    "shopeeUrl": "https://shopee.vn/product/1192937802/24465090622",
    "shopeeCategory": "Sắc Đẹp › Tắm & chăm sóc cơ thể › Xà phòng & sữa tắm",
    "variants": [
      {
        "label": "1 chai",
        "price": 1290000,
        "oldPrice": 1742000
      },
      {
        "label": "2 chai",
        "price": 2580000,
        "oldPrice": 3483000
      }
    ],
    "desc": "Sữa tắm dưỡng trắng body Glutanex 300ml (Hàn Quốc) với glutathione, niacinamide, hyaluronic acid cùng chiết xuất rau má, hà thủ ô, hắc mai biển. Theo nhà sản xuất: làm sạch dịu nhẹ, dưỡng ẩm và giúp da sáng mịn hơn.",
    "highlights": [
      "Glutathione + Niacinamide + HA",
      "Làm sạch dịu nhẹ, dưỡng ẩm",
      "Chai 300ml dùng cho cả nhà"
    ],
    "usage": "Lấy lượng vừa đủ, tạo bọt và massage khắp cơ thể 1–2 phút rồi rửa sạch với nước."
  },
  {
    "id": "57556697426",
    "name": "Son Filler Môi pH Hồng Tự Nhiên – Plump & Glow Lip Plumper",
    "short": "Son filler căng mọng môi RVB LAB Lip Explosion",
    "brand": "rvblab",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 890000,
    "oldPrice": 1202000,
    "rating": 5,
    "reviews": 3,
    "sold": 17,
    "stock": 50,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#C2185B",
    "weight": "Tuýp",
    "origin": "Ý",
    "tags": [
      "Sản phẩm hot"
    ],
    "image": "img/57556697426-h.jpg",
    "thumb": "img/thumb/57556697426-h.jpg",
    "images": [
      "img/57556697426-h.jpg",
      "img/57556697426-2.jpg",
      "img/57556697426-3.jpg",
      "img/57556697426-4.jpg",
      "img/57556697426-5.jpg"
    ],
    "shopeeId": "57556697426",
    "shopeeUrl": "https://shopee.vn/product/1192937802/57556697426",
    "shopeeCategory": "Sắc Đẹp › Trang điểm › Trang điểm môi › Son làm căng môi",
    "variants": [
      {
        "label": "1 cây",
        "price": 890000,
        "oldPrice": 1202000
      },
      {
        "label": "2 cây",
        "price": 1780000,
        "oldPrice": 2403000
      }
    ],
    "desc": "Son filler môi RVB LAB Plump & Glow, công thức có chiết xuất ớt Capsicum, dầu jojoba, lựu, vitamin E và ceramide. Sắc tố phản ứng với độ pH môi tạo màu hồng tự nhiên riêng cho từng người. Theo nhà sản xuất: tạo hiệu ứng làm đầy môi tức thì.",
    "highlights": [
      "Hiệu ứng filler, môi căng mọng tự nhiên",
      "Màu hồng đổi theo độ pH của môi",
      "Dưỡng ẩm với jojoba, vitamin E, ceramide"
    ],
    "usage": "Thoa một lớp mỏng lên môi đã làm sạch, có thể dùng riêng hoặc dặm lên son khác. Cảm giác châm nhẹ lúc đầu là bình thường.",
    "priority": 6
  },
  {
    "id": "24015142248",
    "name": "Serum RVB LAB HYALU C+ Tinh Chất Đậm Đặc Làm Sáng Da Chống Lão Hóa Chai Có Nắp Nhỏ Giọt 30ml",
    "short": "Serum RVB LAB Hyalu C+ 30ml",
    "brand": "rvblab",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 1710000,
    "oldPrice": 2309000,
    "rating": 5,
    "reviews": 1,
    "sold": 7,
    "stock": 50,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#C2185B",
    "weight": "Chai 30ml",
    "origin": "Ý",
    "tags": [],
    "image": "img/24015142248-h.jpg",
    "thumb": "img/thumb/24015142248-h.jpg",
    "images": [
      "img/24015142248-h.jpg",
      "img/24015142248-2.jpg",
      "img/24015142248-3.jpg",
      "img/24015142248-4.jpg",
      "img/24015142248-5.jpg"
    ],
    "shopeeId": "24015142248",
    "shopeeUrl": "https://shopee.vn/product/1192937802/24015142248",
    "shopeeCategory": "Sắc Đẹp › Chăm sóc da mặt › Tinh chất dưỡng",
    "variants": [
      {
        "label": "1 chai",
        "price": 1710000,
        "oldPrice": 2309000
      },
      {
        "label": "2 chai",
        "price": 3420000,
        "oldPrice": 4617000
      }
    ],
    "desc": "Tinh chất đậm đặc RVB LAB Hyalu C+ 30ml (Ý) với vitamin C ổn định và niacinamide, chai có nắp nhỏ giọt. Theo nhà sản xuất: làm sáng da, chống oxy hoá và cải thiện làn da không đều màu.",
    "highlights": [
      "Vitamin C ổn định + 5% Niacinamide",
      "Làm sáng, chống oxy hoá",
      "Chai nhỏ giọt 30ml định lượng dễ dùng"
    ],
    "usage": "Buổi tối sau khi làm sạch, nhỏ 3–4 giọt lên mặt và cổ, vỗ nhẹ cho thấm rồi dùng kem dưỡng. Ban ngày nhớ dùng kem chống nắng."
  },
  {
    "id": "drvita-ecm-serum",
    "name": "Kem Dưỡng Da DayCell Dr.VITA ECM Anti Aging Serum 100ml Hàn Quốc – Dưỡng Ẩm, Săn Chắc, Chăm Sóc Nếp Nhăn",
    "short": "Kem Dưỡng DayCell Dr.VITA ECM Anti Aging Serum 100ml",
    "brand": "daycell",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 1290000,
    "oldPrice": 1290000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 5,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#E8A08A",
    "weight": "Chai 100ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Mới",
      "Cho mẹ"
    ],
    "image": "img/drvita-ecm-serum-h.jpg",
    "thumb": "img/thumb/drvita-ecm-serum-h.jpg",
    "images": [
      "img/drvita-ecm-serum-h.jpg",
      "img/drvita-ecm-serum-2.jpg",
      "img/drvita-ecm-serum-3.jpg",
      "img/drvita-ecm-serum-4.jpg",
      "img/drvita-ecm-serum-5.jpg",
      "img/drvita-ecm-serum-6.jpg"
    ],
    "variants": [
      {
        "label": "Chai 100ml",
        "price": 1290000,
        "oldPrice": 1290000
      },
      {
        "label": "2 chai",
        "price": 2580000,
        "oldPrice": 2580000
      }
    ],
    "desc": "DayCell Dr.VITA ECM Anti Aging Serum là tinh chất dưỡng da chăm sóc cấu trúc da đến từ Hàn Quốc, chai 100ml. Theo nhà sản xuất, sản phẩm hỗ trợ chống lão hoá, cải thiện nếp nhăn và tăng độ đàn hồi; giúp da săn chắc, căng mịn; bổ sung độ ẩm, nuôi dưỡng và củng cố cấu trúc da; phù hợp chăm sóc làn da khô, nhạy cảm và có dấu hiệu lão hoá. Thành phần nổi bật: ECM Complex 50.000 PPM (phức hợp mô phỏng cấu trúc nền ngoại bào của da, trong đó 89% Collagen Liposome Type 1), 43,9% nước Collagen Type 1, 26 loại peptide và 20 loại axit amin, Cerasome & Cica. Theo tài liệu thử nghiệm của nhà sản xuất sau 4 tuần: cải thiện nếp nhăn vùng mắt 5,316%, độ săn chắc 4,903%, độ đàn hồi 8,891%. Hiệu quả tuỳ cơ địa mỗi người. Phù hợp: da bắt đầu xuất hiện nếp nhăn và dấu hiệu lão hoá; da thiếu săn chắc, kém đàn hồi; da khô, thiếu ẩm, thiếu sức sống; người cần chăm sóc da chuyên sâu.",
    "highlights": [
      "ECM Complex 50.000 PPM + 43,9% nước Collagen Type 1 – theo nhà sản xuất",
      "26 loại peptide, 20 loại axit amin, Cerasome & Cica",
      "Hỗ trợ cải thiện nếp nhăn, tăng độ săn chắc và đàn hồi cho da",
      "Cấp ẩm, giúp da căng mịn – phù hợp da khô, nhạy cảm, da có dấu hiệu lão hoá",
      "Nhập khẩu Hàn Quốc, chai 100ml dùng lâu"
    ],
    "usage": "Sau bước làm sạch và toner, lấy một lượng vừa đủ thoa đều lên mặt và cổ, vỗ nhẹ cho thẩm thấu; dùng sáng và tối. Ban ngày dùng kèm kem chống nắng. Thử trước trên vùng da nhỏ; ngưng dùng nếu da kích ứng. Dùng theo hướng dẫn của nhà sản xuất.",
    "seoTitle": "Tinh chất DayCell Dr.VITA ECM Anti Aging Serum 100ml Hàn Quốc | Hương Chất Kids",
    "seoDesc": "Serum DayCell Dr.VITA ECM Anti Aging 100ml: ECM Complex 50.000 PPM, 43,9% nước collagen, 26 peptide – dưỡng ẩm, săn chắc, chăm sóc nếp nhăn theo nhà sản xuất. Chính hãng Hàn Quốc."
  },
  {
    "id": "daycell-nad-white-cream",
    "name": "Kem Dưỡng Da DayCell Medi Lab NAD+ White Cream 50ml Hàn Quốc – Dưỡng Ẩm, Dưỡng Trắng, Hỗ Trợ Làm Mờ Nám & Tàn Nhang",
    "short": "Kem dưỡng DayCell Medi Lab NAD+ White Cream 50ml",
    "brand": "daycell",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 1550000,
    "oldPrice": 1550000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 5,
    "cosmetic": true,
    "shape": "jar",
    "color": "#C62828",
    "weight": "Hũ 50ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Mới",
      "Cho mẹ"
    ],
    "image": "img/daycell-nad-white-cream-h.jpg",
    "thumb": "img/thumb/daycell-nad-white-cream-h.jpg",
    "images": [
      "img/daycell-nad-white-cream-h.jpg",
      "img/daycell-nad-white-cream-2.jpg",
      "img/daycell-nad-white-cream-3.jpg",
      "img/daycell-nad-white-cream-4.jpg",
      "img/daycell-nad-white-cream-5.jpg"
    ],
    "variants": [
      {
        "label": "Hũ 50ml",
        "price": 1550000,
        "oldPrice": 1550000
      },
      {
        "label": "2 hũ",
        "price": 3100000,
        "oldPrice": 3100000
      }
    ],
    "desc": "DayCell Medi Lab NAD+ White Cream là kem dưỡng da dung tích 50ml đến từ Hàn Quốc, kết hợp dưỡng trắng và chăm sóc lão hoá, ứng dụng công thức NAD+ và NMN cùng các thành phần dưỡng sáng, chống oxy hoá. Sản phẩm đã có giấy công bố mỹ phẩm, ghi nhận mục đích sử dụng: “Kem dưỡng da giúp dưỡng ẩm, dưỡng trắng da, hỗ trợ làm mờ các vết nám và tàn nhang trên da, mang lại làn da mềm mịn.” Theo nhà sản xuất, kem giúp cấp ẩm, cải thiện làn da xỉn màu, hỗ trợ làm mờ nám, tàn nhang, đốm sắc tố và chăm sóc nếp nhăn, mang lại làn da mềm mịn, tươi sáng. Thành phần nổi bật: NAD+ (Nicotinamide Adenine Dinucleotide) và NMN (Nicotinamide Mononucleotide) – chăm sóc da lão hoá; MadeWhite™ (nguồn gốc rau má) – hỗ trợ kiểm soát sự hình thành melanin; Idebesome (Idebenone dạng liposome) – chống oxy hoá; Tranexamic Acid – hỗ trợ làm sáng, đều màu da; Glutathione – chống oxy hoá, dưỡng sáng; Kojic Acid. Hiệu quả tuỳ cơ địa mỗi người.",
    "highlights": [
      "Có giấy công bố mỹ phẩm: dưỡng ẩm, dưỡng trắng, hỗ trợ làm mờ nám và tàn nhang",
      "Công thức NAD+ và NMN – chăm sóc da lão hoá, nếp nhăn (theo nhà sản xuất)",
      "MadeWhite™, Tranexamic Acid, Glutathione – dưỡng sáng, hỗ trợ cải thiện da xỉn màu, không đều màu",
      "Idebesome chống oxy hoá, bảo vệ da trước gốc tự do",
      "Kết cấu kem mỏng, dưỡng ẩm cho da mềm mịn – nhập khẩu Hàn Quốc"
    ],
    "usage": "Sau bước serum, lấy một lượng vừa đủ thoa đều lên mặt, massage nhẹ cho thẩm thấu; dùng sáng và tối. Ban ngày dùng kèm kem chống nắng. Thử trước trên vùng da nhỏ; ngưng dùng nếu da kích ứng. Dùng theo hướng dẫn của nhà sản xuất.",
    "seoTitle": "Kem DayCell Medi Lab NAD+ White Cream 50ml Hàn Quốc | Hương Chất Kids",
    "seoDesc": "Kem dưỡng DayCell Medi Lab NAD+ White Cream 50ml: NAD+, NMN, MadeWhite, Tranexamic Acid, Glutathione – dưỡng ẩm, dưỡng trắng, hỗ trợ làm mờ nám và tàn nhang (theo công bố). Chính hãng Hàn Quốc."
  },
  {
    "id": "avca-body-tone-up",
    "name": "Serum Dưỡng Thể Nâng Tone AVCA Intense Brightening Body Tone-Up Serum 250ml Hàn Quốc",
    "short": "Serum body nâng tone AVCA Intense Brightening 250ml",
    "brand": "avca",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 635000,
    "oldPrice": 635000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 5,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#FFB300",
    "weight": "Chai 250ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Mới",
      "Sản phẩm hot",
      "Cho mẹ"
    ],
    "image": "img/avca-body-tone-up-h.jpg",
    "thumb": "img/thumb/avca-body-tone-up-h.jpg",
    "images": [
      "img/avca-body-tone-up-h.jpg",
      "img/avca-body-tone-up-2.jpg",
      "img/avca-body-tone-up-3.jpg",
      "img/avca-body-tone-up-4.jpg",
      "img/avca-body-tone-up-5.jpg",
      "img/avca-body-tone-up-6.jpg",
      "img/avca-body-tone-up-7.jpg"
    ],
    "variants": [
      {
        "label": "Chai 250ml",
        "price": 635000,
        "oldPrice": 635000
      },
      {
        "label": "2 chai",
        "price": 1270000,
        "oldPrice": 1270000
      }
    ],
    "desc": "AVCA Intense Brightening Body Tone-Up Serum là serum dưỡng thể nâng tone hàng nội địa Hàn Quốc, chai 250ml. Kết cấu mỏng nhẹ, không bết dính, dùng được cho toàn thân. Theo nhà sản xuất: Titanium Dioxide tạo hiệu ứng nâng tone ngay sau khi thoa, giúp da trông sáng hơn; Niacinamide, L-Glutathione Liposome và Licorice (cam thảo) hỗ trợ dưỡng sáng, cải thiện tình trạng da không đều màu. Không chỉ là kem nâng tone, sản phẩm kết hợp hệ dưỡng da: 8 loại Hyaluronic Acid cấp ẩm đa tầng; Panthenol (vitamin B5) làm dịu, hỗ trợ phục hồi; Adenosine hỗ trợ cải thiện độ đàn hồi; chiết xuất chuối dưỡng ẩm, làm mềm da; Ceramide NP + Panthenol + Niacinamide hỗ trợ duy trì hàng rào bảo vệ da. Phức hợp thực vật chống oxy hoá: chuối, việt quất, mâm xôi, mâm xôi đen, nam việt quất, cơm cháy và hắc mai biển (sea buckthorn). Hiệu quả tuỳ cơ địa mỗi người.",
    "highlights": [
      "Nâng tone ngay sau khi thoa (Titanium Dioxide) – theo nhà sản xuất",
      "Niacinamide, L-Glutathione Liposome, Licorice – hỗ trợ dưỡng sáng, đều màu da",
      "8 loại Hyaluronic Acid, Panthenol, Adenosine, chiết xuất chuối – cấp ẩm, làm mềm da",
      "Ceramide NP hỗ trợ hàng rào bảo vệ da; phức hợp 7 loại quả chống oxy hoá",
      "Serum body mỏng nhẹ, không bết dính, dùng toàn thân – hàng nội địa Hàn Quốc 250ml"
    ],
    "usage": "Sau khi tắm, lau khô người, nhấn vòi lấy lượng vừa đủ thoa đều lên vùng da toàn thân, massage nhẹ cho thẩm thấu. Dùng hằng ngày; ban ngày ra nắng nên dùng kèm kem chống nắng. Thử trước trên vùng da nhỏ; ngưng dùng nếu da kích ứng. Dùng theo hướng dẫn của nhà sản xuất.",
    "seoTitle": "Serum body nâng tone AVCA Intense Brightening 250ml Hàn Quốc | Hương Chất Kids",
    "seoDesc": "AVCA Intense Brightening Body Tone-Up Serum 250ml: nâng tone ngay khi thoa, Niacinamide, Glutathione liposome, 8 loại Hyaluronic Acid, Ceramide – dưỡng sáng, cấp ẩm toàn thân. Hàng nội địa Hàn Quốc."
  },
  {
    "id": "mabelle-6999",
    "name": "Quần Lót Nữ Su Đúc Kháng Khuẩn MaBelle 6999 – Mỏng Nhẹ, Tàng Hình, Không Đường May",
    "short": "Quần lót su đúc kháng khuẩn MaBelle 6999",
    "brand": "mabelle",
    "cat": "thoi-trang",
    "ages": [],
    "needs": [
      "cho-me"
    ],
    "price": 118000,
    "oldPrice": 118000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 200,
    "priority": 5,
    "shape": "box",
    "color": "#E8C9B5",
    "weight": "Size 45–65kg",
    "origin": "Việt Nam",
    "tags": [
      "Mới",
      "Cho mẹ"
    ],
    "image": "img/mabelle-6999-h.jpg",
    "thumb": "img/thumb/mabelle-6999-h.jpg",
    "images": [
      "img/mabelle-6999-h.jpg",
      "img/mabelle-6999-2.jpg",
      "img/mabelle-6999-3.jpg",
      "img/mabelle-6999-4.jpg",
      "img/mabelle-6999-5.jpg",
      "img/mabelle-6999-6.jpg",
      "img/mabelle-6999-7.jpg",
      "img/mabelle-6999-8.jpg",
      "img/mabelle-6999-9.jpg",
      "img/mabelle-6999-10.jpg"
    ],
    "variants": [
      {
        "label": "1 cái",
        "price": 118000,
        "oldPrice": 118000
      },
      {
        "label": "Set 3 cái (túi)",
        "price": 354000,
        "oldPrice": 354000
      },
      {
        "label": "Set 5 cái (hộp)",
        "price": 590000,
        "oldPrice": 590000
      },
      {
        "label": "Set 8 cái (hộp)",
        "price": 944000,
        "oldPrice": 944000
      }
    ],
    "desc": "Quần lót nữ su đúc MaBelle mã 6999, thiết kế liền mạch không đường may, mỏng nhẹ ôm sát như làn da thứ hai, mặc váy hay quần ôm không lộ viền. Theo nhà sản xuất: sợi vải mát lạnh, co giãn 4 chiều, đàn hồi tốt, giữ phom chuẩn; thiết kế chống tuột, chống bong tróc khi giặt và sử dụng lâu dài; thấm hút tốt, khử mùi, kháng khuẩn. Sản phẩm đã được kiểm định hàm lượng Formaldehyde và amin thơm (VNTEST), an toàn cho vùng da nhạy cảm. Size: 45kg – 65kg (vòng 3 khoảng 92 – 98cm mặc đẹp nhất). Bán lẻ 118.000đ/cái, set 3 cái đóng túi, set 5 và set 8 cái đóng hộp.",
    "highlights": [
      "Su đúc liền mạch, mỏng nhẹ, tàng hình, không hằn khi mặc váy, quần ôm",
      "Sợi mát lạnh, co giãn 4 chiều, giữ phom, chống tuột",
      "Thấm hút, khử mùi, kháng khuẩn – theo nhà sản xuất",
      "Đã kiểm định Formaldehyde & amin thơm (VNTEST), an toàn cho da nhạy cảm",
      "Size 45–65kg · set 3 cái (túi), set 5 / 8 cái (hộp)"
    ],
    "usage": "Nên giặt tay hoặc cho vào túi giặt khi giặt máy, dùng nước giặt nhẹ, không ngâm thuốc tẩy, không vắt mạnh. Phơi nơi thoáng mát, tránh nắng gắt. Đồ lót không đổi trả khi đã bóc tem, mở túi (trừ hàng lỗi do nhà sản xuất).",
    "seoTitle": "Quần lót su đúc kháng khuẩn MaBelle 6999 – mỏng nhẹ, tàng hình | Hương Chất Kids",
    "seoDesc": "Quần lót nữ su đúc MaBelle 6999: liền mạch không đường may, sợi mát lạnh, co giãn 4 chiều, kháng khuẩn, đã kiểm định Formaldehyde & amin thơm. Size 45–65kg, 118.000đ/cái, set 3/5/8 cái."
  },
  {
    "id": "mabelle-5192",
    "name": "Áo Ngực Chống Từ MaBelle 5192 – Mút Đúc Giả Gọng, Nâng Đỡ Tự Nhiên, Gom Mỡ Nách",
    "short": "Áo ngực chống từ MaBelle 5192",
    "brand": "mabelle",
    "cat": "thoi-trang",
    "ages": [],
    "needs": [
      "cho-me"
    ],
    "price": 435000,
    "oldPrice": 435000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 100,
    "priority": 5,
    "shape": "box",
    "color": "#E8C9B5",
    "weight": "Size 34 / 36 / 38",
    "origin": "Việt Nam",
    "tags": [
      "Mới",
      "Cho mẹ"
    ],
    "image": "img/mabelle-5192-h.jpg",
    "thumb": "img/thumb/mabelle-5192-h.jpg",
    "images": [
      "img/mabelle-5192-h.jpg",
      "img/mabelle-5192-2.jpg",
      "img/mabelle-5192-3.jpg",
      "img/mabelle-5192-4.jpg",
      "img/mabelle-5192-5.jpg",
      "img/mabelle-5192-6.jpg",
      "img/mabelle-5192-7.jpg",
      "img/mabelle-5192-8.jpg",
      "img/mabelle-5192-9.jpg",
      "img/mabelle-5192-10.jpg",
      "img/mabelle-5192-11.jpg"
    ],
    "variants": [
      {
        "label": "Da đậm · 34",
        "price": 435000,
        "oldPrice": 435000
      },
      {
        "label": "Da đậm · 36",
        "price": 435000,
        "oldPrice": 435000
      },
      {
        "label": "Da đậm · 38",
        "price": 435000,
        "oldPrice": 435000
      },
      {
        "label": "Da sữa · 34",
        "price": 435000,
        "oldPrice": 435000
      },
      {
        "label": "Da sữa · 36",
        "price": 435000,
        "oldPrice": 435000
      },
      {
        "label": "Da sữa · 38",
        "price": 435000,
        "oldPrice": 435000
      },
      {
        "label": "Đen · 34",
        "price": 435000,
        "oldPrice": 435000
      },
      {
        "label": "Đen · 36",
        "price": 435000,
        "oldPrice": 435000
      },
      {
        "label": "Đen · 38",
        "price": 435000,
        "oldPrice": 435000
      },
      {
        "label": "Da hồng · 34",
        "price": 435000,
        "oldPrice": 435000
      },
      {
        "label": "Da hồng · 36",
        "price": 435000,
        "oldPrice": 435000
      },
      {
        "label": "Da hồng · 38",
        "price": 435000,
        "oldPrice": 435000
      }
    ],
    "desc": "Áo ngực MaBelle mã 5192, mút đúc mềm mại, thiết kế giả gọng nâng đỡ nhẹ nhàng, hạn chế cảm giác cấn, bát áo ôm vừa vặn tạo dáng vòng 1 cân đối, tự nhiên. Theo nhà sản xuất: ôm sát, giữ form ổn định; hỗ trợ gom phần mỡ nách và hai bên lưng cho tổng thể gọn gàng; hợp nhiều dáng ngực (ngực nhỏ, chưa đầy hoặc có độ chảy nhẹ). Chất liệu thoáng khí, nhẹ, mềm, chống hằn, dễ phối đồ, mặc đi làm, đi chơi, dự tiệc hằng ngày. Tính năng \"chống từ\" áp dụng theo thông tin kỹ thuật của nhà sản xuất. Size 34 / 36 / 38; màu da đậm, da sữa, đen, da hồng.",
    "highlights": [
      "Mút đúc mềm, thiết kế giả gọng nâng đỡ nhẹ nhàng, không cấn",
      "Ôm gọn, hỗ trợ gom mỡ nách và hai bên lưng – theo nhà sản xuất",
      "Chất liệu thoáng khí, nhẹ, chống hằn, dễ phối đồ",
      "Công nghệ chống từ theo thông tin kỹ thuật của nhà sản xuất",
      "Size 34 / 36 / 38 · 4 màu da đậm, da sữa, đen, da hồng"
    ],
    "usage": "Nên giặt tay hoặc cho vào túi giặt khi giặt máy, không vắt mạnh để giữ form mút; phơi nơi thoáng mát, tránh nắng gắt. Đồ lót không đổi trả khi đã bóc tem, mở túi (trừ hàng lỗi do nhà sản xuất).",
    "seoTitle": "Áo ngực chống từ MaBelle 5192 – chính hãng | Hương Chất Kids",
    "seoDesc": "Áo ngực chống từ MaBelle 5192: Mút đúc mềm, thiết kế giả gọng nâng đỡ nhẹ nhàng, không cấn; Ôm gọn, hỗ trợ gom mỡ nách và hai bên lưng – theo nhà sản xuất; Chất liệu thoáng khí, nhẹ, chống hằn, dễ phối đồ. Giá 435.000đ/chiếc."
  },
  {
    "id": "mabelle-5790",
    "name": "Áo Ngực MaBelle 5790 – Chống Hằn, Mút Thoáng Khí, Tôn Dáng Khi Mặc Áo Dài, Váy Ôm",
    "short": "Áo ngực chống hằn MaBelle 5790",
    "brand": "mabelle",
    "cat": "thoi-trang",
    "ages": [],
    "needs": [
      "cho-me"
    ],
    "price": 456000,
    "oldPrice": 456000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 100,
    "priority": 5,
    "shape": "box",
    "color": "#E8C9B5",
    "weight": "Size 34 / 36 / 38 / 40",
    "origin": "Việt Nam",
    "tags": [
      "Mới",
      "Cho mẹ"
    ],
    "image": "img/mabelle-5790-h.jpg",
    "thumb": "img/thumb/mabelle-5790-h.jpg",
    "images": [
      "img/mabelle-5790-h.jpg",
      "img/mabelle-5790-2.jpg",
      "img/mabelle-5790-3.jpg",
      "img/mabelle-5790-4.jpg",
      "img/mabelle-5790-5.jpg",
      "img/mabelle-5790-6.jpg",
      "img/mabelle-5790-7.jpg",
      "img/mabelle-5790-8.jpg",
      "img/mabelle-5790-9.jpg",
      "img/mabelle-5790-10.jpg",
      "img/mabelle-5790-11.jpg",
      "img/mabelle-5790-12.jpg"
    ],
    "variants": [
      {
        "label": "Size 34",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Size 36",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Size 38",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Size 40",
        "price": 456000,
        "oldPrice": 456000
      }
    ],
    "desc": "Áo ngực MaBelle mã 5790 hiện đại, ngọt ngào, giúp tự tin khi diện áo dài, váy ôm hay trang phục mỏng. Theo nhà sản xuất: thiết kế chống hằn; form ôm nhẹ nhàng, tạo dáng vòng 1 cân đối, tự nhiên; ôm gọn vùng nách và lưng; chất liệu cao cấp mềm mại, co giãn tốt. Mút thoáng khí với cấu trúc nhiều lỗ thông khí, thun mềm đàn hồi tốt, hạn chế bai giãn; mặc nhẹ nhàng cả ngày đi làm, đi chơi, dự tiệc. Size 34 / 36 / 38 / 40; màu theo ảnh, mẹ ghi màu muốn chọn ở phần ghi chú khi đặt hàng.",
    "highlights": [
      "Chống hằn, mặc đẹp với áo dài, váy ôm, trang phục mỏng",
      "Form ôm nhẹ, ôm gọn vùng nách và lưng – theo nhà sản xuất",
      "Mút thoáng khí nhiều lỗ thông khí, thun mềm, hạn chế bai giãn",
      "Size 34 / 36 / 38 / 40"
    ],
    "usage": "Nên giặt tay hoặc cho vào túi giặt khi giặt máy, không vắt mạnh để giữ form mút; phơi nơi thoáng mát, tránh nắng gắt. Đồ lót không đổi trả khi đã bóc tem, mở túi (trừ hàng lỗi do nhà sản xuất).",
    "seoTitle": "Áo ngực chống hằn MaBelle 5790 – chính hãng | Hương Chất Kids",
    "seoDesc": "Áo ngực chống hằn MaBelle 5790: Chống hằn, mặc đẹp với áo dài, váy ôm, trang phục mỏng; Form ôm nhẹ, ôm gọn vùng nách và lưng – theo nhà sản xuất; Mút thoáng khí nhiều lỗ thông khí, thun mềm, hạn chế bai giãn. Giá 456.000đ/chiếc."
  },
  {
    "id": "mabelle-5038",
    "name": "Áo Ngực Có Gọng MaBelle 5038 – Mút Mỏng, Lót Cotton, Chống Tuột, Không Hằn",
    "short": "Áo ngực có gọng MaBelle 5038",
    "brand": "mabelle",
    "cat": "thoi-trang",
    "ages": [],
    "needs": [
      "cho-me"
    ],
    "price": 346000,
    "oldPrice": 346000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 100,
    "priority": 5,
    "shape": "box",
    "color": "#E8C9B5",
    "weight": "Size 34 / 36 / 38",
    "origin": "Việt Nam",
    "tags": [
      "Mới",
      "Cho mẹ"
    ],
    "image": "img/mabelle-5038-h.jpg",
    "thumb": "img/thumb/mabelle-5038-h.jpg",
    "images": [
      "img/mabelle-5038-h.jpg",
      "img/mabelle-5038-2.jpg",
      "img/mabelle-5038-3.jpg",
      "img/mabelle-5038-4.jpg",
      "img/mabelle-5038-5.jpg",
      "img/mabelle-5038-6.jpg",
      "img/mabelle-5038-7.jpg",
      "img/mabelle-5038-8.jpg",
      "img/mabelle-5038-9.jpg",
      "img/mabelle-5038-10.jpg",
      "img/mabelle-5038-11.jpg",
      "img/mabelle-5038-12.jpg"
    ],
    "variants": [
      {
        "label": "Ghi · 34",
        "price": 346000,
        "oldPrice": 346000
      },
      {
        "label": "Ghi · 36",
        "price": 346000,
        "oldPrice": 346000
      },
      {
        "label": "Ghi · 38",
        "price": 346000,
        "oldPrice": 346000
      },
      {
        "label": "Đen · 34",
        "price": 346000,
        "oldPrice": 346000
      },
      {
        "label": "Đen · 36",
        "price": 346000,
        "oldPrice": 346000
      },
      {
        "label": "Đen · 38",
        "price": 346000,
        "oldPrice": 346000
      },
      {
        "label": "Da · 34",
        "price": 346000,
        "oldPrice": 346000
      },
      {
        "label": "Da · 36",
        "price": 346000,
        "oldPrice": 346000
      },
      {
        "label": "Da · 38",
        "price": 346000,
        "oldPrice": 346000
      }
    ],
    "desc": "Áo ngực có gọng MaBelle mã 5038, mút mỏng nhẹ ôm vừa vặn, không gây bí; lớp trong cotton mềm mại cho da. Theo nhà sản xuất: phần chân ngực 2 lớp cotton giữ form chắc chắn, chống tuột, chống xô lệch; gọng ôm chuẩn, nâng đỡ tự nhiên; dây áo chắc chắn, giặt máy không lo biến dạng. Ôm gọn, tôn dáng, không hằn, êm ái suốt cả ngày. Sản phẩm đã được kiểm định an toàn. Size 34 / 36 / 38; màu ghi, đen, da.",
    "highlights": [
      "Có gọng ôm chuẩn, nâng đỡ tự nhiên",
      "Chân ngực 2 lớp cotton, chống tuột, chống xô lệch – theo nhà sản xuất",
      "Mút mỏng nhẹ, lớp trong cotton mềm, không bí",
      "Dây áo chắc chắn, giặt máy không biến dạng",
      "Size 34 / 36 / 38 · màu ghi, đen, da"
    ],
    "usage": "Nên giặt tay hoặc cho vào túi giặt khi giặt máy, không vắt mạnh để giữ form mút; phơi nơi thoáng mát, tránh nắng gắt. Đồ lót không đổi trả khi đã bóc tem, mở túi (trừ hàng lỗi do nhà sản xuất).",
    "seoTitle": "Áo ngực có gọng MaBelle 5038 – chính hãng | Hương Chất Kids",
    "seoDesc": "Áo ngực có gọng MaBelle 5038: Có gọng ôm chuẩn, nâng đỡ tự nhiên; Chân ngực 2 lớp cotton, chống tuột, chống xô lệch – theo nhà sản xuất; Mút mỏng nhẹ, lớp trong cotton mềm, không bí. Giá 346.000đ/chiếc."
  },
  {
    "id": "mabelle-5997",
    "name": "Áo Lót Liền Mạch Không Gọng MaBelle 5997 – Mút 3cm Hạt Massage, Đã Kiểm Định An Toàn",
    "short": "Áo lót liền mạch không gọng MaBelle 5997",
    "brand": "mabelle",
    "cat": "thoi-trang",
    "ages": [],
    "needs": [
      "cho-me"
    ],
    "price": 330000,
    "oldPrice": 330000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 100,
    "priority": 5,
    "shape": "box",
    "color": "#E8C9B5",
    "weight": "Size 34 / 36 / 38",
    "origin": "Việt Nam",
    "tags": [
      "Mới",
      "Cho mẹ"
    ],
    "image": "img/mabelle-5997-h.jpg",
    "thumb": "img/thumb/mabelle-5997-h.jpg",
    "images": [
      "img/mabelle-5997-h.jpg",
      "img/mabelle-5997-2.jpg",
      "img/mabelle-5997-3.jpg",
      "img/mabelle-5997-4.jpg",
      "img/mabelle-5997-5.jpg",
      "img/mabelle-5997-6.jpg",
      "img/mabelle-5997-7.jpg",
      "img/mabelle-5997-8.jpg",
      "img/mabelle-5997-9.jpg",
      "img/mabelle-5997-10.jpg",
      "img/mabelle-5997-11.jpg"
    ],
    "variants": [
      {
        "label": "Đen · 34",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Đen · 36",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Đen · 38",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Da · 34",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Da · 36",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Da · 38",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Đỏ · 34",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Đỏ · 36",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Đỏ · 38",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Trắng · 34",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Trắng · 36",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Trắng · 38",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Đá · 34",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Đá · 36",
        "price": 330000,
        "oldPrice": 330000
      },
      {
        "label": "Đá · 38",
        "price": 330000,
        "oldPrice": 330000
      }
    ],
    "desc": "Áo lót liền mạch cao cấp MaBelle mã 5997, form không gọng mặc nhẹ như không, không hằn. Theo nhà sản xuất: mút 3cm tích hợp hạt massage nâng đỡ êm ái, tạo dáng ngực đầy đặn tự nhiên; quả áo tròn đều, không nhọn, không bè; bản lưng ôm trọn nách và mỡ lưng cho dáng gọn; dây chỉnh trước tiện lợi, hạn chế hằn vai; lớp cao su non êm, thoáng, mát. Sản phẩm đã được kiểm định hàm lượng Formaldehyde và amin thơm (VNTEST). Size 34 / 36 / 38; màu đen, da, đỏ, trắng, đá.",
    "highlights": [
      "Liền mạch không gọng, nhẹ, không hằn",
      "Mút 3cm có hạt massage, quả áo tròn đều – theo nhà sản xuất",
      "Bản lưng ôm nách và mỡ lưng, dây chỉnh trước tiện lợi",
      "Đã kiểm định Formaldehyde & amin thơm (VNTEST)",
      "Size 34 / 36 / 38 · 5 màu đen, da, đỏ, trắng, đá"
    ],
    "usage": "Nên giặt tay hoặc cho vào túi giặt khi giặt máy, không vắt mạnh để giữ form mút; phơi nơi thoáng mát, tránh nắng gắt. Đồ lót không đổi trả khi đã bóc tem, mở túi (trừ hàng lỗi do nhà sản xuất).",
    "seoTitle": "Áo lót liền mạch không gọng MaBelle 5997 – chính hãng | Hương Chất Kids",
    "seoDesc": "Áo lót liền mạch không gọng MaBelle 5997: Liền mạch không gọng, nhẹ, không hằn; Mút 3cm có hạt massage, quả áo tròn đều – theo nhà sản xuất; Bản lưng ôm nách và mỡ lưng, dây chỉnh trước tiện lợi. Giá 330.000đ/chiếc."
  },
  {
    "id": "mabelle-5992",
    "name": "Áo Lót Không Gọng MaBelle 5992 – Dây Chỉnh Phía Trước, Mút 2cm, Chống Hằn, Chống Tuột",
    "short": "Áo lót không gọng MaBelle 5992",
    "brand": "mabelle",
    "cat": "thoi-trang",
    "ages": [],
    "needs": [
      "cho-me"
    ],
    "price": 456000,
    "oldPrice": 456000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 100,
    "priority": 5,
    "shape": "box",
    "color": "#E8C9B5",
    "weight": "Size 34 / 36 / 38",
    "origin": "Việt Nam",
    "tags": [
      "Mới",
      "Cho mẹ"
    ],
    "image": "img/mabelle-5992-h.jpg",
    "thumb": "img/thumb/mabelle-5992-h.jpg",
    "images": [
      "img/mabelle-5992-h.jpg",
      "img/mabelle-5992-2.jpg",
      "img/mabelle-5992-3.jpg",
      "img/mabelle-5992-4.jpg",
      "img/mabelle-5992-5.jpg",
      "img/mabelle-5992-6.jpg",
      "img/mabelle-5992-7.jpg",
      "img/mabelle-5992-8.jpg",
      "img/mabelle-5992-9.jpg",
      "img/mabelle-5992-10.jpg",
      "img/mabelle-5992-11.jpg",
      "img/mabelle-5992-12.jpg"
    ],
    "variants": [
      {
        "label": "Đen · 34",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Đen · 36",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Đen · 38",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Da · 34",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Da · 36",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Da · 38",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Ghi · 34",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Ghi · 36",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Ghi · 38",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Kem · 34",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Kem · 36",
        "price": 456000,
        "oldPrice": 456000
      },
      {
        "label": "Kem · 38",
        "price": 456000,
        "oldPrice": 456000
      }
    ],
    "desc": "Áo lót cao cấp MaBelle mã 5992, thiết kế chỉnh vai đưa về phía trước tinh tế, tiện lợi, chống hằn, mặc đẹp với mọi trang phục. Theo nhà sản xuất: mút mỏng 2cm vừa vặn, mềm êm; thân áo an toàn, thoáng nhẹ, thân thiện làn da; không gọng thoải mái cả ngày. Ôm trọn, nâng đẩy tự nhiên, gom gọn mỡ nách, hỗ trợ tạo dáng cho bầu ngực căng tròn; chống tuột, chống xô lệch, giữ form chuẩn. Size 34 / 36 / 38; màu đen, da, ghi, kem.",
    "highlights": [
      "Dây chỉnh vai đưa về phía trước, tiện lợi, chống hằn",
      "Mút mỏng 2cm, không gọng, nhẹ êm cả ngày",
      "Ôm trọn, nâng đẩy tự nhiên, gom gọn mỡ nách – theo nhà sản xuất",
      "Chống tuột, chống xô lệch, giữ form chuẩn",
      "Size 34 / 36 / 38 · màu đen, da, ghi, kem"
    ],
    "usage": "Nên giặt tay hoặc cho vào túi giặt khi giặt máy, không vắt mạnh để giữ form mút; phơi nơi thoáng mát, tránh nắng gắt. Đồ lót không đổi trả khi đã bóc tem, mở túi (trừ hàng lỗi do nhà sản xuất).",
    "seoTitle": "Áo lót không gọng MaBelle 5992 – chính hãng | Hương Chất Kids",
    "seoDesc": "Áo lót không gọng MaBelle 5992: Dây chỉnh vai đưa về phía trước, tiện lợi, chống hằn; Mút mỏng 2cm, không gọng, nhẹ êm cả ngày; Ôm trọn, nâng đẩy tự nhiên, gom gọn mỡ nách – theo nhà sản xuất. Giá 456.000đ/chiếc."
  },
  {
    "id": "24764883120",
    "name": "Peel Anubis Tặng Kèm Xịt Trung Hòa Anubismed Giúp Làn Da Cải Thiện Lỗ Chân Lông, Đào Thải Độc Tố, Chống Lão Hóa, Mờ Thâm",
    "short": "Bộ peel da Anubis Azelaic 14% + xịt trung hoà",
    "brand": "anubis",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 2450000,
    "oldPrice": 3308000,
    "rating": 5,
    "reviews": 107,
    "sold": 1000,
    "stock": 50,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#6D4C41",
    "weight": "Chai 50ml + xịt",
    "origin": "Tây Ban Nha",
    "tags": [],
    "image": "img/24764883120-h.jpg",
    "thumb": "img/thumb/24764883120-h.jpg",
    "images": [
      "img/24764883120-h.jpg",
      "img/24764883120-2.jpg",
      "img/24764883120-3.jpg",
      "img/24764883120-4.jpg",
      "img/24764883120-5.jpg"
    ],
    "shopeeId": "24764883120",
    "shopeeUrl": "https://shopee.vn/product/1192937802/24764883120",
    "shopeeCategory": "Sắc Đẹp › Bộ sản phẩm làm đẹp",
    "variants": [
      {
        "label": "1 bộ",
        "price": 2450000,
        "oldPrice": 3308000
      },
      {
        "label": "2 bộ",
        "price": 4900000,
        "oldPrice": 6615000
      }
    ],
    "desc": "Bộ peel da Anubis với 14% axit azelaic tinh khiết, tặng kèm xịt trung hoà Anubismed. Theo nhà sản xuất: hỗ trợ làm sạch sâu lỗ chân lông, giảm mụn và làm mờ vết thâm.",
    "highlights": [
      "14% axit azelaic tinh khiết",
      "Tặng kèm xịt trung hoà Anubismed",
      "Đã bán 1.000+ trên Shopee"
    ],
    "usage": "Sản phẩm dành cho người đã quen với peel da: thoa lớp mỏng lên vùng cần xử lý, để đúng thời gian hướng dẫn rồi xịt trung hoà và rửa sạch. Nên hỏi ý kiến chuyên viên da liễu trước khi dùng."
  },
  {
    "id": "24015583018",
    "name": "Mặt Nạ NMN Giúp Dưỡng Da Trắng Sáng, Trẻ Trung, Bổ Sung Nước Cấp Ẩm Cho Da, Hỗ Trợ Hạn Chế Nếp Nhăn",
    "short": "Mặt nạ trẻ hoá NMN Kousa hộp 8 miếng",
    "brand": "kousa",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 595000,
    "oldPrice": 803000,
    "rating": 4.9,
    "reviews": 81,
    "sold": 703,
    "stock": 50,
    "cosmetic": true,
    "shape": "box",
    "color": "#4FC3F7",
    "weight": "Hộp 8 miếng",
    "origin": "Hàn Quốc",
    "tags": [],
    "image": "img/24015583018-h.jpg",
    "thumb": "img/thumb/24015583018-h.jpg",
    "images": [
      "img/24015583018-h.jpg",
      "img/24015583018-2.jpg",
      "img/24015583018-3.jpg",
      "img/24015583018-4.jpg",
      "img/24015583018-5.jpg"
    ],
    "shopeeId": "24015583018",
    "shopeeUrl": "https://shopee.vn/product/1192937802/24015583018",
    "shopeeCategory": "Sắc Đẹp › Chăm sóc da mặt › Mặt nạ",
    "variants": [
      {
        "label": "1 hộp",
        "price": 595000,
        "oldPrice": 803000
      },
      {
        "label": "2 hộp",
        "price": 1190000,
        "oldPrice": 1607000
      }
    ],
    "desc": "Mặt nạ NMN Kousa (Hàn Quốc), hộp 8 miếng, chứa 1.000ppm NMN cùng collagen và adenosine. Theo nhà sản xuất: cấp ẩm, dưỡng sáng và giúp da mịn màng hơn.",
    "highlights": [
      "1.000ppm NMN + collagen",
      "Cấp ẩm, dưỡng sáng",
      "Hộp 8 miếng, đã bán 700+"
    ],
    "usage": "Đắp 15–20 phút sau bước làm sạch, 2–3 lần/tuần; vỗ nhẹ phần tinh chất còn lại cho thấm, không cần rửa."
  },
  {
    "id": "28902157429",
    "name": "Men Vi Sinh Phụ Khoa ARRAVITE Bổ Sung Lợi Khuẩn, Hỗ Trợ Cân Bằng Hệ Vi Sinh Vùng Kín, Hỗ Trợ Tiêu Hóa",
    "short": "Men vi sinh phụ khoa Arravite hộp 30 viên",
    "brand": "arravite",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "tieu-hoa"
    ],
    "price": 990000,
    "oldPrice": 1337000,
    "rating": 5,
    "reviews": 3,
    "sold": 49,
    "stock": 50,
    "shape": "bottle",
    "color": "#7E57C2",
    "weight": "Hộp 30 viên",
    "origin": "Úc",
    "tags": [],
    "image": "img/28902157429-h.jpg",
    "thumb": "img/thumb/28902157429-h.jpg",
    "images": [
      "img/28902157429-h.jpg",
      "img/28902157429-2.jpg",
      "img/28902157429-3.jpg",
      "img/28902157429-4.jpg",
      "img/28902157429-5.jpg"
    ],
    "shopeeId": "28902157429",
    "shopeeUrl": "https://shopee.vn/product/1192937802/28902157429",
    "shopeeCategory": "Sức Khỏe › Thực phẩm chức năng › Hỗ trợ sức khỏe",
    "variants": [
      {
        "label": "1 hộp",
        "price": 990000,
        "oldPrice": 1337000
      },
      {
        "label": "2 hộp",
        "price": 1980000,
        "oldPrice": 2673000
      }
    ],
    "desc": "Men vi sinh Arravite (Úc), hộp 30 viên, có các dòng 5 tỷ – 10 tỷ – 20 tỷ lợi khuẩn dành cho nam nữ từ 15 tuổi. Theo nhà sản xuất: bổ sung lợi khuẩn, hỗ trợ cân bằng hệ vi sinh và tiêu hoá.",
    "highlights": [
      "Lợi khuẩn chuyên biệt cho phụ nữ",
      "3 mức 5 – 10 – 20 tỷ lợi khuẩn",
      "Hộp 30 viên dùng 1 tháng"
    ],
    "usage": "Uống 1 viên/ngày sau ăn. Phụ nữ có thai hoặc đang dùng thuốc nên hỏi ý kiến bác sĩ trước khi dùng."
  },
  {
    "id": "26800350417",
    "name": "Kem Dưỡng Trắng Da Căng Bóng HYALU C+ Thế Hệ Mới Làm Giảm Và Ngăn Các Dấu Hiệu Lão Hóa, Giúp Hồi Sinh Và Bảo Vệ Làn Da",
    "short": "Kem dưỡng RVB LAB Hyalu C+ 30ml",
    "brand": "rvblab",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 2050000,
    "oldPrice": 2768000,
    "rating": 5,
    "reviews": 1,
    "sold": 5,
    "stock": 50,
    "cosmetic": true,
    "shape": "box",
    "color": "#C2185B",
    "weight": "Hũ 30ml",
    "origin": "Ý",
    "tags": [],
    "image": "img/26800350417-h.jpg",
    "thumb": "img/thumb/26800350417-h.jpg",
    "images": [
      "img/26800350417-h.jpg",
      "img/26800350417-2.jpg",
      "img/26800350417-3.jpg",
      "img/26800350417-4.jpg",
      "img/26800350417-5.jpg"
    ],
    "shopeeId": "26800350417",
    "shopeeUrl": "https://shopee.vn/product/1192937802/26800350417",
    "shopeeCategory": "Sắc Đẹp › Chăm sóc da mặt › Kem dưỡng ẩm",
    "variants": [
      {
        "label": "1 hũ",
        "price": 2050000,
        "oldPrice": 2768000
      },
      {
        "label": "2 hũ",
        "price": 4100000,
        "oldPrice": 5535000
      }
    ],
    "desc": "Kem dưỡng trắng da căng bóng RVB LAB Hyalu C+ thế hệ mới, 30ml (Ý). Theo nhà sản xuất: công thức đa tác dụng giúp da mịn màng, tươi sáng và hạn chế các dấu hiệu lão hoá theo thời gian.",
    "highlights": [
      "Công thức Hyalu C+ thế hệ mới",
      "Dưỡng ẩm, làm sáng, nâng đỡ da",
      "Hũ 30ml dùng sáng và tối"
    ],
    "usage": "Thoa lượng vừa đủ lên mặt và cổ đã làm sạch, sáng và tối, sau bước serum."
  },
  {
    "id": "27734205778",
    "name": "Kem Chống Nắng HISKIN 5in1 Giúp Bảo Vệ Da Dưỡng Trắng Phục Hồi Chống Lão Hoá Nâng Tone An Toàn Với Làn Da Nhạy Cảm",
    "short": "Kem chống nắng Hiskin 5in1 SPF50+ 60ml",
    "brand": "hiskin",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 695000,
    "oldPrice": 938000,
    "rating": 5,
    "reviews": 8,
    "sold": 56,
    "stock": 50,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#0288D1",
    "weight": "Tuýp 60ml",
    "origin": "Hàn Quốc",
    "tags": [],
    "image": "img/27734205778-h.jpg",
    "thumb": "img/thumb/27734205778-h.jpg",
    "images": [
      "img/27734205778-h.jpg",
      "img/27734205778-2.jpg",
      "img/27734205778-3.jpg",
      "img/27734205778-4.jpg",
      "img/27734205778-5.jpg"
    ],
    "shopeeId": "27734205778",
    "shopeeUrl": "https://shopee.vn/product/1192937802/27734205778",
    "shopeeCategory": "Sắc Đẹp › Chăm sóc da mặt › Kem chống nắng cho mặt",
    "variants": [
      {
        "label": "1 tuýp",
        "price": 695000,
        "oldPrice": 938000
      },
      {
        "label": "2 tuýp",
        "price": 1390000,
        "oldPrice": 1877000
      }
    ],
    "desc": "Kem chống nắng Hiskin 5in1 60ml (Hàn Quốc), SPF50+ PA++++, chứa niacinamide, glutathione và collagen. Theo nhà sản xuất: bảo vệ da khỏi tia UV, kiềm dầu, nâng tone nhẹ và phù hợp cả với da nhạy cảm.",
    "highlights": [
      "SPF50+ / PA++++",
      "Niacinamide, glutathione, collagen",
      "Nâng tone nhẹ, thay được kem lót"
    ],
    "usage": "Thoa lớp vừa đủ trước khi ra ngoài 15–20 phút, dặm lại sau mỗi 2–3 giờ nếu hoạt động ngoài trời."
  },
  {
    "id": "hiskin-micellar",
    "name": "Nước Tẩy Trang HISKIN Cleansing Micellar Water 500ml Hàn Quốc Làm Sạch Dịu Nhẹ, Cấp Ẩm, Chiết Xuất Trà Xanh",
    "short": "Nước tẩy trang Hiskin Micellar Water 500ml",
    "brand": "hiskin",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 750000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#2E7D32",
    "weight": "Chai 500ml",
    "origin": "Hàn Quốc",
    "tags": [],
    "image": "img/hiskin-micellar-h.jpg",
    "thumb": "img/thumb/hiskin-micellar-h.jpg",
    "images": [
      "img/hiskin-micellar-h.jpg",
      "img/hiskin-micellar-2.jpg",
      "img/hiskin-micellar-3.jpg"
    ],
    "desc": "Nước tẩy trang HISKIN Cleansing Micellar Water 500ml (Hàn Quốc), dạng nước, chứa chiết xuất trà xanh, nước biển và Glycerin 4%. Theo nhà sản xuất: ứng dụng công nghệ Micellar giúp làm sạch lớp trang điểm, kem chống nắng, bụi bẩn và bã nhờn mà không cần chà xát mạnh; Glycerin 4% hỗ trợ duy trì độ ẩm, hạn chế cảm giác khô căng sau khi làm sạch; chiết xuất trà xanh và nước biển mang lại cảm giác tươi mát, dễ chịu. Kết cấu nền nước không gây nhờn, dùng được hằng ngày, phù hợp mọi loại da kể cả da nhạy cảm. Hạn sử dụng sau mở nắp: 12 tháng. Phù hợp với người thường xuyên trang điểm, dùng kem chống nắng hoặc cần làm sạch bụi bẩn, dầu thừa mỗi ngày.",
    "highlights": [
      "Công nghệ Micellar làm sạch nhẹ nhàng, không cần chà xát mạnh",
      "Glycerin 4% hỗ trợ giữ ẩm, hạn chế khô căng",
      "Chiết xuất trà xanh + nước biển, cảm giác tươi mát",
      "Dạng nước, không nhờn, phù hợp cả da nhạy cảm",
      "Chai 500ml, dùng được 12 tháng sau mở nắp"
    ],
    "usage": "Bước 1: Thấm một lượng nước tẩy trang vừa đủ vào bông tẩy trang. Bước 2: Lau nhẹ nhàng từ trung tâm khuôn mặt ra ngoài, theo chiều thớ da. Bước 3: Với vùng trang điểm đậm, đặt bông đã thấm sản phẩm lên vùng da trong giây lát rồi lau nhẹ. Bước 4: Tiếp tục dùng bông sạch cho đến khi không còn cặn trang điểm hoặc bụi bẩn trên bông."
  },
  {
    "id": "25678530796",
    "name": "Cặp Tái Tạo Phục Hồi Da Hỗ Trợ Kích Hoạt Tái Cấu Trúc Đa Tầng Giúp Làn Da Được Thắp Sáng Tăng Cường Sức Sống Luôn Ẩm Mịn",
    "short": "Cặp tái tạo phục hồi da Dermo Ioniq",
    "brand": "dermoioniq",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 5275000,
    "oldPrice": 7121000,
    "rating": 4.5,
    "reviews": 2,
    "sold": 4,
    "stock": 50,
    "cosmetic": true,
    "shape": "box",
    "color": "#00897B",
    "weight": "Bộ 2 sản phẩm",
    "origin": "Pháp",
    "tags": [],
    "image": "img/25678530796-h.jpg",
    "thumb": "img/thumb/25678530796-h.jpg",
    "images": [
      "img/25678530796-h.jpg",
      "img/25678530796-2.jpg",
      "img/25678530796-3.jpg",
      "img/25678530796-4.jpg",
      "img/25678530796-5.jpg"
    ],
    "shopeeId": "25678530796",
    "shopeeUrl": "https://shopee.vn/product/1192937802/25678530796",
    "shopeeCategory": "Sắc Đẹp › Bộ sản phẩm làm đẹp",
    "variants": [
      {
        "label": "1 cặp",
        "price": 5275000,
        "oldPrice": 7121000
      },
      {
        "label": "2 cặp",
        "price": 10550000,
        "oldPrice": 14243000
      }
    ],
    "desc": "Bộ đôi tái tạo phục hồi da Dermo Ioniq (Pháp) gồm kem kích hoạt tái cấu trúc đa tầng 100ml và huyết thanh thắp sáng 30ml (có các lựa chọn kem làm dịu 40ml và huyết thanh trẻ hoá 30ml). Theo nhà sản xuất: hỗ trợ phục hồi, cấp ẩm và giúp da tăng sức sống.",
    "highlights": [
      "Kem tái cấu trúc đa tầng 100ml",
      "Huyết thanh thắp sáng 30ml",
      "Dành cho da cần phục hồi chuyên sâu"
    ],
    "usage": "Dùng huyết thanh trước, kem sau, sáng và tối trên da đã làm sạch."
  },
  {
    "id": "29006040615",
    "name": "Cặp MESO Bạc Giúp Cấy Meso Vào Da Bằng Đường Bôi, Đưa Sâu Dưỡng Chất Vào Da, Giảm Nếp Nhăn Dưỡng Da Trắng Sáng, Đều Màu",
    "short": "Meso bạc RVB LAB – serum & kem dưỡng",
    "brand": "rvblab",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 3388000,
    "oldPrice": 4574000,
    "rating": 4.9,
    "reviews": 50,
    "sold": 525,
    "stock": 50,
    "cosmetic": true,
    "shape": "box",
    "color": "#90A4AE",
    "weight": "Serum 30ml + kem 50ml",
    "origin": "Ý",
    "tags": [],
    "image": "img/29006040615-h.jpg",
    "thumb": "img/thumb/29006040615-h.jpg",
    "images": [
      "img/29006040615-h.jpg",
      "img/29006040615-2.jpg",
      "img/29006040615-3.jpg",
      "img/29006040615-4.jpg",
      "img/29006040615-5.jpg"
    ],
    "shopeeId": "29006040615",
    "shopeeUrl": "https://shopee.vn/product/1192937802/29006040615",
    "shopeeCategory": "Sắc Đẹp › Dụng cụ làm đẹp › Khác",
    "variants": [
      {
        "label": "Cặp tất bạc (serum + kem)",
        "price": 6500000,
        "oldPrice": 8775000,
        "oos": true
      },
      {
        "label": "Serum Meso bạc",
        "price": 3388000,
        "oldPrice": 4574000
      },
      {
        "label": "Kem dưỡng Meso bạc",
        "price": 3465000,
        "oldPrice": 4678000
      }
    ],
    "desc": "Cặp Meso bạc RVB LAB (Ý) gồm serum Meso bạc 30ml và kem dưỡng Meso bạc 50ml với phức hợp Hyalu Smart PGA. Theo nhà sản xuất: đưa dưỡng chất sâu vào da, hỗ trợ giảm nếp nhăn và dưỡng da sáng đều màu.",
    "highlights": [
      "Serum 30ml + kem dưỡng 50ml",
      "Phức hợp Hyalu Smart PGA",
      "Đã bán 500+ trên Shopee"
    ],
    "usage": "Thoa serum lên da đã làm sạch, đợi thấm rồi dùng kem dưỡng; dùng sáng và tối."
  },
  {
    "id": "27809051612",
    "name": "Cặp Dầu Gội - Xả Arganicare Collagen Làm Sạch Tóc, Dưỡng Tóc Mềm Mượt, Phục Hồi Tóc Hư Tổn Chuyên Sâu Cho Tóc Hư Tổn",
    "short": "Cặp dầu gội & xả Arganicare Biotin Collagen 400ml",
    "brand": "arganicare",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 1290000,
    "oldPrice": 1742000,
    "rating": 4.7,
    "reviews": 3,
    "sold": 5,
    "stock": 50,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#8D6E63",
    "weight": "Gội 400ml + xả 400ml",
    "origin": "Ma-rốc",
    "tags": [],
    "image": "img/27809051612-h.jpg",
    "thumb": "img/thumb/27809051612-h.jpg",
    "images": [
      "img/27809051612-h.jpg",
      "img/27809051612-2.jpg",
      "img/27809051612-3.jpg",
      "img/27809051612-4.jpg",
      "img/27809051612-5.jpg"
    ],
    "shopeeId": "27809051612",
    "shopeeUrl": "https://shopee.vn/product/1192937802/27809051612",
    "shopeeCategory": "Sắc Đẹp › Chăm sóc tóc › Dầu gội",
    "variants": [
      {
        "label": "1 cặp",
        "price": 1080000,
        "oldPrice": 1742000
      },
      {
        "label": "2 cặp",
        "price": 2160000,
        "oldPrice": 3483000
      }
    ],
    "desc": "Cặp dầu gội và dầu xả Arganicare Biotin & Collagen, mỗi chai 400ml (Ma-rốc), thành phần có biotin, dầu argan, keratin và vitamin. Theo nhà sản xuất: làm sạch dịu nhẹ, giúp tóc mềm mượt và hỗ trợ phục hồi tóc hư tổn.",
    "highlights": [
      "Biotin + dầu argan + keratin",
      "Cặp gội – xả 400ml",
      "Cho tóc khô, hư tổn sau uốn nhuộm"
    ],
    "usage": "Gội sạch tóc, thoa dầu xả lên thân và ngọn tóc, để 2–3 phút rồi xả kỹ với nước."
  },
  {
    "id": "ngu-coc-bap-thien-ma-kitea",
    "slug": "ngu-coc-bap-thien-ma-kitea-han-quoc",
    "name": "Ngũ Cốc Bắp Thiên Ma Kitea Hàn Quốc Hộp 900g 50 Gói – Trà Ngũ Cốc Cornflakes Thiên Ma Pha Nóng Hoặc Lạnh",
    "short": "Ngũ cốc bắp thiên ma Kitea 900g (50 gói)",
    "brand": "kitea",
    "cat": "thuc-pham",
    "ages": [
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "an-vat"
    ],
    "price": 449000,
    "oldPrice": 0,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "shape": "box",
    "color": "#C2561B",
    "weight": "Hộp 900g (50 gói x 18g)",
    "origin": "Hàn Quốc",
    "tags": [
      "Mới"
    ],
    "family": true,
    "image": "img/ngu-coc-bap-thien-ma-kitea-h.jpg",
    "thumb": "img/thumb/ngu-coc-bap-thien-ma-kitea-h.jpg",
    "images": [
      "img/ngu-coc-bap-thien-ma-kitea-h.jpg",
      "img/ngu-coc-bap-thien-ma-kitea-tt.jpg",
      "img/ngu-coc-bap-thien-ma-kitea-dd.jpg",
      "img/ngu-coc-bap-thien-ma-kitea-hd.jpg",
      "img/ngu-coc-bap-thien-ma-kitea-2.jpg",
      "img/ngu-coc-bap-thien-ma-kitea-3.jpg",
      "img/ngu-coc-bap-thien-ma-kitea-4.jpg"
    ],
    "variants": [
      {
        "label": "Hộp 900g (50 gói)",
        "price": 449000
      },
      {
        "label": "2 Hộp",
        "price": 898000
      }
    ],
    "desc": "Ngũ cốc Bắp Thiên Ma Kitea là sự kết hợp giữa bột thiên ma, bột bắp và các loại hạt giàu dinh dưỡng. Sản phẩm có hương vị thơm béo, ngọt dịu, kèm topping gạo lứt sấy giòn, phù hợp dùng vào bữa sáng, bữa phụ hoặc những lúc cần bổ sung năng lượng nhanh chóng. Thương hiệu Kitea, xuất xứ Hàn Quốc, nhà sản xuất Korea Ginseng Product Co., Ltd. Hộp 900g gồm 50 gói, mỗi gói khoảng 18g. Hạn sử dụng: xem trên bao bì sản phẩm.",
    "highlights": [
      "Kết hợp bột thiên ma, bột bắp và nhiều loại hạt dinh dưỡng",
      "Có thêm topping gạo lứt sấy giòn, tạo cảm giác thơm ngon khi thưởng thức",
      "Hương vị thơm dịu, dễ uống, phù hợp với nhiều độ tuổi",
      "Gói nhỏ 18g tiện lợi, dễ mang theo khi đi học, đi làm hoặc đi du lịch",
      "Pha nóng hoặc pha lạnh tùy theo sở thích – hợp bữa sáng, bữa phụ"
    ],
    "usage": "Pha nóng: cho 01 gói ngũ cốc vào cốc, thêm khoảng 80–100ml nước nóng, khuấy đều và thưởng thức. Pha lạnh: cho 01 gói ngũ cốc vào khoảng 40ml nước, khuấy đều cho bột hòa tan, thêm đá lạnh và thưởng thức. Có thể điều chỉnh lượng nước tùy theo khẩu vị đậm hoặc nhạt.",
    "seoTitle": "Ngũ cốc bắp thiên ma Kitea Hàn Quốc 900g (50 gói) – Hương Chất Kids",
    "seoDesc": "Ngũ cốc bắp thiên ma Kitea Hàn Quốc hộp 900g 50 gói, giá 449.000đ. Thơm béo, ngọt dịu, pha nóng hoặc lạnh, tiện cho bữa sáng, bữa phụ của cả nhà.",
    "seoKey": "ngũ cốc bắp thiên ma, ngũ cốc thiên ma Kitea, trà ngũ cốc thiên ma Hàn Quốc, ngũ cốc Hàn Quốc 50 gói"
  },
  {
    "id": "goi-xa-boryeong-mud",
    "name": "Cặp Dầu Gội – Xả Bùn Khoáng Boryeong MUD+ Hàn Quốc 500ml – Anti-Hair Loss Shampoo & Deep Care Treatment, Bộ Skincare Cho Da Đầu",
    "short": "Cặp gội xả bùn khoáng Boryeong MUD+ 500ml",
    "brand": "boryeong-mud",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 1050000,
    "oldPrice": 0,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "cosmetic": true,
    "shape": "bottle",
    "color": "#8B6B4E",
    "weight": "Gội 500ml + xả 500ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Mới",
      "Cho mẹ"
    ],
    "image": "img/goi-xa-boryeong-mud-h.jpg",
    "thumb": "img/thumb/goi-xa-boryeong-mud-h.jpg",
    "images": [
      "img/goi-xa-boryeong-mud-h.jpg",
      "img/goi-xa-boryeong-mud-2.jpg",
      "img/goi-xa-boryeong-mud-4.jpg",
      "img/goi-xa-boryeong-mud-5.jpg",
      "img/goi-xa-boryeong-mud-6.jpg",
      "img/goi-xa-boryeong-mud-7.jpg",
      "img/goi-xa-boryeong-mud-8.jpg",
      "img/goi-xa-boryeong-mud-9.jpg",
      "img/goi-xa-boryeong-mud-10.jpg"
    ],
    "variants": [
      {
        "label": "Gội + xả 500ml",
        "price": 1050000
      }
    ],
    "desc": "Bộ đôi dầu gội Anti-Hair Loss Shampoo và dầu xả Deep Care Treatment Boryeong MUD+ (Hàn Quốc), mỗi chai 500ml – \"bộ skincare cho da đầu\" với tinh tuý bùn khoáng biển Boryeong. Theo nhà sản xuất: dầu gội làm sạch sâu, kiểm soát dầu thừa, làm thông thoáng nang tóc và hỗ trợ giảm gãy rụng; dầu xả giúp phục hồi tóc hư tổn, giảm khô xơ, tăng độ mềm mượt và bảo vệ sợi tóc. Thành phần nổi bật: bùn biển Boryeong (9 khoáng chất tự nhiên), Salicylic Acid, Climbazole, Niacinamide, Panthenol (dầu gội); Ceramide NP, Amodimethicone, Behentrimonium Chloride (dầu xả). Đã thử nghiệm kích ứng da tại Viện Nghiên cứu Da liễu Hàn Quốc (2023) trên 30 người trưởng thành: dịu nhẹ, không gây kích ứng. Sản xuất tại nhà máy Groovy Cosmetic đạt ISO 9001, ISO 22716 (GMP mỹ phẩm), ISO 14001.",
    "highlights": [
      "Bùn khoáng biển Boryeong – 9 khoáng chất tự nhiên",
      "Cặp gội + xả 500ml, công nghệ Ozone Therapy",
      "Đã thử nghiệm kích ứng da tại Viện Nghiên cứu Da liễu Hàn Quốc",
      "Theo NSX: tới 5 ngày không bết, da đầu dầu, gàu, ngứa cải thiện sau khoảng 3 lần gội",
      "Cho mẹ lo tóc rụng, tóc thưa, da đầu dầu, gàu ngứa, tóc hư tổn"
    ],
    "usage": "Làm ướt tóc, lấy lượng dầu gội vừa đủ, massage nhẹ da đầu 2–3 phút rồi xả sạch. Sau khi gội, lau bớt nước, thoa dầu xả đều lên thân và ngọn tóc, massage nhẹ 2–3 phút rồi xả sạch bằng nước ấm. Mẹo: dùng đều 2–3 lần/tuần giúp phục hồi tóc hư tổn hiệu quả hơn. Không dùng trên vùng da bị thương, tránh để dính vào mắt; ngưng sử dụng nếu xuất hiện kích ứng."
  },
  {
    "id": "24329101823",
    "name": "Combo Meso Vàng Siêu Vi Tăng Sinh Tế Bào, Chống Lão Hóa Và Cấp Ẩm Chuyên Sâu Mang Lại Vẻ Căng Bóng, Tươi Sáng Cho Làn Da",
    "short": "Combo Meso vàng siêu vi",
    "brand": "meso",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 1450000,
    "oldPrice": 1958000,
    "rating": 5,
    "reviews": 4,
    "sold": 24,
    "stock": 50,
    "cosmetic": true,
    "shape": "box",
    "color": "#C9A227",
    "weight": "Bộ sản phẩm",
    "origin": "Đan Mạch",
    "tags": [],
    "image": "img/24329101823-h.jpg",
    "thumb": "img/thumb/24329101823-h.jpg",
    "images": [
      "img/24329101823-h.jpg",
      "img/24329101823-2.jpg",
      "img/24329101823-3.jpg",
      "img/24329101823-4.jpg",
      "img/24329101823-5.jpg"
    ],
    "shopeeId": "24329101823",
    "shopeeUrl": "https://shopee.vn/product/1192937802/24329101823",
    "shopeeCategory": "Sắc Đẹp › Bộ sản phẩm làm đẹp",
    "variants": [
      {
        "label": "Kem chống nắng Meso",
        "price": 3500000,
        "oldPrice": 4725000,
        "oos": true
      },
      {
        "label": "Kem Meso Retinol",
        "price": 3250000,
        "oldPrice": 4388000
      },
      {
        "label": "Sữa rửa mặt Meso",
        "price": 1450000,
        "oldPrice": 1958000
      },
      {
        "label": "Kem mắt Meso",
        "price": 2590000,
        "oldPrice": 3497000
      },
      {
        "label": "Combo siêu vi Meso",
        "price": 7200000,
        "oldPrice": 9720000
      },
      {
        "label": "Serum vàng Meso",
        "price": 4015000,
        "oldPrice": 5420000
      },
      {
        "label": "Kem vàng siêu vi",
        "price": 3910000,
        "oldPrice": 5279000
      }
    ],
    "desc": "Combo Meso vàng siêu vi gồm serum vàng siêu vi và kem vàng siêu vi; ngoài ra có thêm các lựa chọn kem ngày, kem đêm, sữa rửa mặt 3in1 và kem mắt Meso. Theo nhà sản xuất: cấp ẩm chuyên sâu, hỗ trợ chống lão hoá, cho da căng bóng tươi sáng.",
    "highlights": [
      "Serum + kem vàng siêu vi",
      "Nhiều lựa chọn combo theo nhu cầu",
      "Cấp ẩm, hỗ trợ chống lão hoá"
    ],
    "usage": "Dùng serum trước, kem sau, sáng và tối trên da đã làm sạch."
  },
  {
    "id": "26900366084",
    "name": "Combo Dưỡng Da Hyalu C+ Giúp Da Trắng Sáng, Căng Bóng, Mịn Màng, Dưỡng Ẩm, Hỗ Trợ Chống Lão Hóa",
    "short": "Combo dưỡng da Hyalu C+ (kem + serum + toner)",
    "brand": "rvblab",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 1270000,
    "oldPrice": 1715000,
    "rating": 5,
    "reviews": 2,
    "sold": 13,
    "stock": 50,
    "cosmetic": true,
    "shape": "box",
    "color": "#C2185B",
    "weight": "Bộ 3 sản phẩm",
    "origin": "Ý",
    "tags": [],
    "image": "img/26900366084-h.jpg",
    "thumb": "img/thumb/26900366084-h.jpg",
    "images": [
      "img/26900366084-h.jpg",
      "img/26900366084-2.jpg",
      "img/26900366084-3.jpg",
      "img/26900366084-4.jpg",
      "img/26900366084-5.jpg"
    ],
    "shopeeId": "26900366084",
    "shopeeUrl": "https://shopee.vn/product/1192937802/26900366084",
    "shopeeCategory": "Sắc Đẹp › Bộ sản phẩm làm đẹp",
    "variants": [
      {
        "label": "Kem dưỡng Hyalu C+",
        "price": 2050000,
        "oldPrice": 2768000
      },
      {
        "label": "Serum Hyalu C+",
        "price": 2350000,
        "oldPrice": 3173000
      },
      {
        "label": "Toner Hyalu C+",
        "price": 1270000,
        "oldPrice": 1715000
      },
      {
        "label": "Bộ dưỡng da Hyalu C+",
        "price": 5030000,
        "oldPrice": 6791000
      }
    ],
    "desc": "Combo dưỡng da Hyalu C+ (Ý) gồm kem dưỡng trắng 50ml, serum 30ml và toner 200ml. Theo nhà sản xuất: bộ ba dưỡng ẩm – làm sáng – chống oxy hoá dùng cho cả chu trình sáng và tối.",
    "highlights": [
      "Kem 50ml + serum 30ml + toner 200ml",
      "Trọn chu trình dưỡng sáng",
      "Nhiều lựa chọn combo"
    ],
    "usage": "Toner → serum → kem dưỡng, dùng sáng và tối sau khi rửa mặt."
  },
  {
    "id": "56857599724",
    "name": "Bột Trắng Răng AKIKO Nhật Bản Trắng Răng Bật Tone, Loại Bỏ Mảng Bám Không Ê Buốt, Khử Hôi Miệng",
    "short": "Bột trắng răng Akiko Nhật Bản 26g",
    "brand": "akiko",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 550000,
    "oldPrice": 743000,
    "rating": 5,
    "reviews": 1,
    "sold": 14,
    "stock": 50,
    "cosmetic": true,
    "shape": "box",
    "color": "#26A69A",
    "weight": "Hũ 26g",
    "origin": "Nhật Bản",
    "tags": [],
    "image": "img/56857599724-h.jpg",
    "thumb": "img/thumb/56857599724-h.jpg",
    "images": [
      "img/56857599724-h.jpg",
      "img/56857599724-2.jpg",
      "img/56857599724-3.jpg",
      "img/56857599724-4.jpg",
      "img/56857599724-5.jpg"
    ],
    "shopeeId": "56857599724",
    "shopeeUrl": "https://shopee.vn/product/1192937802/56857599724",
    "shopeeCategory": "Sức Khỏe › Chăm sóc cá nhân › Vệ sinh răng miệng › Hỗ trợ trắng răng",
    "variants": [
      {
        "label": "1 hộp",
        "price": 550000,
        "oldPrice": 743000
      },
      {
        "label": "2 hộp",
        "price": 1100000,
        "oldPrice": 1485000
      }
    ],
    "desc": "Bột khử vàng răng Akiko 26g (Nhật Bản). Theo nhà sản xuất: làm sạch mảng bám và vết ố, giúp răng sáng hơn mà không gây ê buốt, đồng thời khử mùi hôi miệng.",
    "highlights": [
      "Hũ 26g dùng được lâu",
      "Làm sạch mảng bám, vết ố",
      "Không gây ê buốt"
    ],
    "usage": "Nhúng bàn chải ẩm vào bột, chải đều 2–3 phút rồi súc miệng sạch, dùng 2–3 lần/tuần."
  },
  {
    "id": "28806784125",
    "name": "Bộ Đôi Meso Retinol Siêu Vi Tăng Sinh Tế Bào, Chống Lão Hóa Căng Bóng Làn Da Xóa Nhăn Trẻ Hóa Sáng Da",
    "short": "Bộ đôi Meso Retinol siêu vi",
    "brand": "meso",
    "cat": "cho-me",
    "ages": [],
    "needs": [
      "cho-me",
      "lam-dep"
    ],
    "price": 2590000,
    "oldPrice": 3497000,
    "rating": 5,
    "reviews": 2,
    "sold": 12,
    "stock": 50,
    "cosmetic": true,
    "shape": "box",
    "color": "#C9A227",
    "weight": "Bộ 2 sản phẩm",
    "origin": "Ý",
    "tags": [],
    "image": "img/28806784125-h.jpg",
    "thumb": "img/thumb/28806784125-h.jpg",
    "images": [
      "img/28806784125-h.jpg",
      "img/28806784125-2.jpg",
      "img/28806784125-3.jpg",
      "img/28806784125-4.jpg",
      "img/28806784125-5.jpg"
    ],
    "shopeeId": "28806784125",
    "shopeeUrl": "https://shopee.vn/product/1192937802/28806784125",
    "shopeeCategory": "Sắc Đẹp › Bộ sản phẩm làm đẹp",
    "variants": [
      {
        "label": "Kem Meso Retinol",
        "price": 3250000,
        "oldPrice": 4388000
      },
      {
        "label": "Kem mắt Meso",
        "price": 2590000,
        "oldPrice": 3497000
      },
      {
        "label": "Bộ đôi Meso",
        "price": 5840000,
        "oldPrice": 7884000
      }
    ],
    "desc": "Bộ đôi Meso Retinol siêu vi với retinol, axit alpha lipoic và phức hợp vitamin chống oxy hoá. Theo nhà sản xuất: hỗ trợ giảm nếp nhăn, giúp da căng bóng và sáng đều màu hơn.",
    "highlights": [
      "Retinol + axit alpha lipoic",
      "Hỗ trợ giảm nếp nhăn",
      "Dùng buổi tối, kết hợp chống nắng ban ngày"
    ],
    "usage": "Bắt đầu 2 lần/tuần vào buổi tối rồi tăng dần; luôn dùng kem chống nắng vào ban ngày."
  },
  {
    "id": "suaxanh-lotte",
    "name": "Sữa Xanh Lotte Organic – Sữa Tươi Hữu Cơ Pasteur Hàn Quốc Hộp 125ml, Thùng 24 Hộp",
    "short": "Sữa xanh Lotte Organic 125ml (thùng 24 hộp)",
    "brand": "lotte",
    "cat": "sua",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "tang-chieu-cao",
      "canxi",
      "organic",
      "sua-tuoi"
    ],
    "price": 875000,
    "oldPrice": 1181000,
    "rating": 0,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 2,
    "shape": "carton",
    "color": "#2E7D32",
    "weight": "Thùng 24 hộp × 125ml",
    "origin": "Hàn Quốc",
    "tags": [
      "Mới"
    ],
    "image": "img/suaxanh-lotte.jpg",
    "thumb": "img/thumb/suaxanh-lotte.jpg",
    "images": [
      "img/suaxanh-lotte.jpg",
      "img/suaxanh-lotte-2.jpg",
      "img/suaxanh-lotte-3.jpg",
      "img/suaxanh-lotte-4.jpg",
      "img/suaxanh-lotte-5.jpg",
      "img/suaxanh-lotte-6.jpg"
    ],
    "variants": [
      {
        "label": "1 thùng 24 hộp",
        "price": 875000,
        "oldPrice": 1181000,
        "oos": true
      },
      {
        "label": "2 thùng 48 hộp",
        "price": 1750000,
        "oldPrice": 2363000,
        "oos": true
      }
    ],
    "desc": "Sữa xanh Lotte Organic (Pasteur 유기농 우유) – sữa tươi hữu cơ nguyên kem của Lotte Wellfood Hàn Quốc, hộp 125ml vừa một lần uống cho bé. Sữa đạt chứng nhận hữu cơ của Bộ Nông nghiệp Hàn Quốc, cơ sở sản xuất đạt HACCP. Mỗi hộp 125ml (80 kcal) có 4g đạm, 4,6g chất béo và 125mg canxi, vị thơm béo tự nhiên, dùng được cho cả bé và người lớn.",
    "highlights": [
      "Sữa tươi hữu cơ nguyên kem, chứng nhận Organic Hàn Quốc",
      "Mỗi hộp 125ml: 4g đạm, 4,6g chất béo, 125mg canxi",
      "Hộp nhỏ 125ml tiện mang đi học, vừa một lần uống"
    ],
    "usage": "Bé từ 1 tuổi uống 1–2 hộp/ngày, ngon hơn khi để lạnh. Lắc đều trước khi uống, đã mở hộp thì dùng hết trong ngày. Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp."
  },
  {
    "id": "combo-vangsua-d3k2",
    "name": "Combo Váng Sữa Canxi Calciumore + Vitamin D3K2 Pure Vitality – Bổ Sung Canxi Và Vitamin D3, K2 Cho Bé",
    "short": "Combo váng sữa canxi Calciumore + D3K2",
    "brand": "calciumore",
    "cat": "vitamin",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "canxi",
      "tang-chieu-cao",
      "d3k2",
      "organic"
    ],
    "price": 2726000,
    "oldPrice": 2870000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "isCombo": true,
    "items": [
      "26060839019",
      "42878618667"
    ],
    "shape": "box",
    "color": "#4FA3D1",
    "weight": "1 hộp 90 gói váng sữa + 1 lọ D3K2 30ml",
    "origin": "Hàn Quốc & New Zealand",
    "tags": [
      "Combo"
    ],
    "image": "img/combo-vangsua-d3k2-n.jpg",
    "thumb": "img/thumb/combo-vangsua-d3k2-n.jpg",
    "images": [
      "img/combo-vangsua-d3k2-n.jpg",
      "img/26060839019.jpg",
      "img/42878618667-h.jpg",
      "img/26060839019-3.jpg",
      "img/42878618667-3.jpg"
    ],
    "variants": [
      {
        "label": "1 hộp váng sữa 90 gói + 1 D3K2 · giảm 5%",
        "price": 2726000,
        "oldPrice": 2870000
      },
      {
        "label": "2 hộp váng sữa 180 gói · TẶNG 1 D3K2",
        "price": 4960000,
        "oldPrice": 5350000
      },
      {
        "label": "3 hộp váng sữa 270 gói · TẶNG 2 D3K2",
        "price": 7440000,
        "oldPrice": 8220000
      },
      {
        "label": "4 hộp váng sữa 360 gói · TẶNG 3 D3K2",
        "price": 9920000,
        "oldPrice": 11090000
      }
    ],
    "uuDai": [
      "Mua 1 hộp canxi + 1 lọ D3K2 = 2.870.000₫, giảm 5% còn 2.726.000₫",
      "Mua 2 hộp canxi 4.960.000₫ → tặng ngay 1 lọ D3K2 (tiết kiệm 390.000₫)",
      "Mua 3 hộp canxi 7.440.000₫ → tặng ngay 2 lọ D3K2 (tiết kiệm 780.000₫)",
      "Mua 4 hộp canxi 9.920.000₫ → tặng ngay 3 lọ D3K2 (tiết kiệm 1.170.000₫)"
    ],
    "desc": "Bộ đôi canxi cho bé: váng sữa canxi hữu cơ Calciumore (hộp 90 gói) bổ sung canxi sữa dễ hấp thu, kết hợp vitamin D3K2 Pure Vitality (New Zealand) hỗ trợ đưa canxi vào xương. Theo nhà sản xuất, dùng cùng nhau hỗ trợ bé phát triển chiều cao và răng chắc khoẻ.",
    "highlights": [
      "Mua 1 hộp váng sữa + 1 D3K2 được giảm 5% so với mua lẻ",
      "Mua 2 hộp tặng 1 lọ D3K2 · 3 hộp tặng 2 lọ · 4 hộp tặng 3 lọ",
      "Canxi sữa hữu cơ Hàn Quốc + D3K2 New Zealand",
      "Mỗi hộp 90 gói đủ dùng cho bé khoảng 3 tháng"
    ],
    "usage": "Váng sữa: 1 gói/ngày pha cùng sữa hoặc ăn trực tiếp. D3K2: nhỏ giọt theo độ tuổi, dùng buổi sáng sau ăn. Dùng canxi và D3K2 cùng buổi để hấp thu tốt nhất."
  },
  {
    "id": "combo-lottexanh-d3k2",
    "name": "Combo Nước Ép Lotte Tăng Cao (Xanh) + Vitamin D3K2 Pure Vitality – Hỗ Trợ Bé Phát Triển Chiều Cao",
    "short": "Combo nước ép Lotte Tăng cao + D3K2",
    "brand": "lotte",
    "cat": "nuoc-ep",
    "ages": [
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "tang-chieu-cao",
      "canxi",
      "d3k2",
      "organic"
    ],
    "price": 1707000,
    "oldPrice": 1707000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "isCombo": true,
    "items": [
      "22686115682",
      "42878618667"
    ],
    "shape": "box",
    "color": "#2F8FD0",
    "weight": "1 thùng 30 gói nước ép + 1 lọ D3K2 30ml",
    "origin": "Hàn Quốc & New Zealand",
    "tags": [
      "Combo"
    ],
    "image": "img/combo-lottexanh-d3k2-n.jpg",
    "thumb": "img/thumb/combo-lottexanh-d3k2-n.jpg",
    "images": [
      "img/combo-lottexanh-d3k2-n.jpg",
      "img/22686115682.jpg",
      "img/42878618667-h.jpg",
      "img/22686115682-3.jpg",
      "img/42878618667-3.jpg"
    ],
    "variants": [
      {
        "label": "1 thùng Lotte Tăng cao 30 gói + 1 D3K2",
        "price": 1707000,
        "oldPrice": 1707000
      }
    ],
    "desc": "Bộ đôi hỗ trợ phát triển chiều cao: nước ép Lotte Tăng cao vị Xanh (táo & củ dền hữu cơ Hàn Quốc) bé dễ uống, ngon miệng, kết hợp vitamin D3K2 Pure Vitality (New Zealand) hỗ trợ hấp thu canxi và đưa canxi vào xương.",
    "highlights": [
      "Mua trọn bộ 1 chạm, không phải chọn từng món",
      "Nước ép hữu cơ Hàn Quốc, bé dễ uống",
      "Thùng 30 gói dùng được khoảng 1 tháng",
      "D3K2 hỗ trợ hấp thu canxi, dùng cùng nước ép tăng cao"
    ],
    "usage": "Nước ép: 1 gói/ngày, uống lạnh càng ngon. D3K2: nhỏ giọt theo độ tuổi, dùng buổi sáng sau ăn."
  },
  {
    "id": "men-sysy",
    "name": "Men Vi Sinh Sysy Pasteur (Lotte) Hàn Quốc – Men Baby Từ 0 Tháng, Men Kids Từ 24 Tháng, Hộp 60 Gói",
    "short": "Men vi sinh Sysy Pasteur – Baby 0+ / Kids 24m+",
    "brand": "lotte",
    "cat": "tang-can",
    "ages": [
      "0-6m",
      "6-12m",
      "1-3y",
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "de-khang",
      "tang-can",
      "tieu-hoa"
    ],
    "price": 986000,
    "oldPrice": 1282000,
    "rating": 0,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 2,
    "shape": "jar",
    "color": "#8D5A2B",
    "weight": "Hộp 6 gói lớn × 10 gói nhỏ (2g)",
    "origin": "Hàn Quốc",
    "tags": [
      "Mới"
    ],
    "image": "img/men-sysy-h.jpg",
    "thumb": "img/thumb/men-sysy-h.jpg",
    "images": [
      "img/men-sysy-h.jpg",
      "img/men-sysy-2.jpg",
      "img/men-sysy-3.jpg",
      "img/men-sysy-4.jpg",
      "img/men-sysy-5.jpg"
    ],
    "variants": [
      {
        "label": "Men Baby (nâu) · từ 0 tháng",
        "price": 986000,
        "oldPrice": 1282000,
        "oos": true
      },
      {
        "label": "Men Kids (xanh) · từ 24 tháng",
        "price": 986000,
        "oldPrice": 1282000,
        "oos": true
      },
      {
        "label": "30 gói nhỏ Men Kids (xanh) · từ 24 tháng",
        "price": 399000
      },
      {
        "label": "30 gói nhỏ Men Baby (nâu) · từ 0 tháng",
        "price": 399000
      }
    ],
    "desc": "Men vi sinh Sysy (Pasteur 아이생각 생유산균) – hàng nội địa Hàn Quốc của Pasteur thuộc tập đoàn Lotte. Men Baby (hộp nâu, cho bé từ 0 tháng): 15,1 tỉ lợi khuẩn, 8 chủng. Men Kids (hộp xanh, cho bé từ 24 tháng): 16,1 tỉ lợi khuẩn, 7 chủng, bổ sung kẽm 2,55mg và vitamin D 400 IU. Đạt GMP, công nghệ Probiocap bao bọc lợi khuẩn và Synbiotic (lợi khuẩn kết hợp chất xơ nuôi lợi khuẩn); nhà sản xuất cam kết ít nhất 2 tỉ lợi khuẩn sống. Theo nhà sản xuất: hỗ trợ tiêu hoá, ăn ngon, hấp thu tốt; hỗ trợ giảm táo bón, tiêu chảy và tác dụng phụ khi dùng kháng sinh; hỗ trợ cải thiện biếng ăn, chậm tăng cân, giảm trớ sữa ở trẻ nhỏ.",
    "highlights": [
      "Men Baby (từ 0 tháng): 15,1 tỉ lợi khuẩn, 8 chủng",
      "Men Kids (từ 24 tháng): 16,1 tỉ lợi khuẩn, 7 chủng + kẽm 2,55mg, vitamin D 400 IU",
      "GMP · Probiocap · Synbiotic – nội địa Hàn, Pasteur thuộc Lotte"
    ],
    "usage": "Mỗi ngày 1 gói. Pha cùng bột, cháo, sữa hoặc nước dưới 50°C; bé lớn có thể uống trực tiếp. Dùng theo hướng dẫn của bác sĩ hoặc chuyên gia dinh dưỡng. Hộp tròn gồm 6 gói lớn, mỗi gói lớn 10 gói nhỏ; hạn dùng 18 tháng kể từ ngày sản xuất."
  },
  {
    "id": "mien-ga-cf",
    "name": "Miến Gà Sấy Thăng Hoa – Masterchef Phạm Tuấn Hải (CF Chef To Factory), Nước Dùng Ninh 8 Giờ, Gà – Măng – Nấm Thật",
    "short": "Miến gà sấy thăng hoa – Masterchef Phạm Tuấn Hải",
    "brand": "chef-to-factory",
    "cat": "thuc-pham",
    "ages": [],
    "needs": [],
    "price": 65000,
    "oldPrice": 88000,
    "rating": 0,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 2,
    "shape": "box",
    "color": "#8A2A2A",
    "weight": "1 hộp",
    "origin": "Việt Nam",
    "family": true,
    "tags": [
      "Mới"
    ],
    "image": "img/mien-ga-cf.jpg",
    "thumb": "img/thumb/mien-ga-cf.jpg",
    "images": [
      "img/mien-ga-cf.jpg",
      "img/mien-ga-cf-2.jpg",
      "img/mien-ga-cf-3.jpg",
      "img/mien-ga-cf-4.jpg",
      "img/mien-ga-cf-5.jpg"
    ],
    "variants": [
      {
        "label": "1 hộp",
        "price": 65000,
        "oldPrice": 88000
      },
      {
        "label": "2 hộp",
        "price": 130000,
        "oldPrice": 176000
      }
    ],
    "desc": "Miến gà sấy thăng hoa – Masterchef Phạm Tuấn Hải. Sợi miến khoai tây & đậu xanh: sợi mềm dai, dễ chín, để lâu trong nước dùng vẫn giữ được độ ngon, không nhanh nở nhũn. Nước dùng ninh 8 giờ: nấu từ xương gà, cổ cánh gà, xương heo kết hợp rau củ và gia vị, tạo vị ngọt đậm đà, thơm ngon. Gà – măng – nấm thật: không chỉ có sợi miến và gia vị, mỗi tô có đầy đủ thịt gà, măng, nấm hương, hành lá, ngò và gia vị. Sấy thăng hoa 48 giờ: ứng dụng công nghệ sấy thăng hoa giúp giữ tốt cấu trúc, màu sắc và hương vị của nguyên liệu. Khi pha với nước nóng, các thành phần hoàn nguyên để thưởng thức.",
    "highlights": [
      "Sợi miến khoai tây & đậu xanh – mềm dai, dễ chín, không nhanh nở nhũn",
      "Nước dùng ninh 8 giờ từ xương gà, cổ cánh gà, xương heo, rau củ và gia vị",
      "Gà – măng – nấm thật: thịt gà, măng, nấm hương, hành lá, ngò và gia vị",
      "Sấy thăng hoa 48 giờ – giữ cấu trúc, màu sắc và hương vị nguyên liệu"
    ],
    "usage": "Pha với nước nóng, các thành phần hoàn nguyên để thưởng thức. Làm theo hướng dẫn in trên bao bì."
  },
  {
    "id": "hexacare",
    "name": "Dung Dịch Vệ Sinh Hexacare Pháp 200ml – 4 Loại: Điều Tiết Hằng Ngày pH 3.6, Ngăn Ngừa Kháng Viêm pH 5.0, Dịu Nhẹ Da Nhạy Cảm pH 4.5, Lành Tính Cho Bé Gái pH 4.5",
    "short": "Dung dịch vệ sinh Hexacare (Pháp) 200ml",
    "brand": "hexacare",
    "cat": "cho-me",
    "ages": [
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "cho-me"
    ],
    "price": 195000,
    "oldPrice": 195000,
    "rating": 0,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 2,
    "shape": "bottle",
    "color": "#C2185B",
    "weight": "200ml/chai",
    "origin": "Pháp",
    "family": true,
    "cosmetic": true,
    "tags": [
      "Mới"
    ],
    "image": "img/hexacare.jpg",
    "thumb": "img/thumb/hexacare.jpg",
    "images": [
      "img/hexacare.jpg",
      "img/hexacare-2.jpg",
      "img/hexacare-3.jpg",
      "img/hexacare-4.jpg"
    ],
    "variants": [
      {
        "label": "Điều tiết hằng ngày – pH 3.6 · 1 chai",
        "price": 195000,
        "oldPrice": 195000
      },
      {
        "label": "Điều tiết hằng ngày – pH 3.6 · 2 chai",
        "price": 390000,
        "oldPrice": 390000
      },
      {
        "label": "Ngăn ngừa kháng viêm – pH 5.0 · 1 chai",
        "price": 195000,
        "oldPrice": 195000
      },
      {
        "label": "Ngăn ngừa kháng viêm – pH 5.0 · 2 chai",
        "price": 390000,
        "oldPrice": 390000
      },
      {
        "label": "Dịu nhẹ da nhạy cảm – pH 4.5 · 1 chai",
        "price": 195000,
        "oldPrice": 195000
      },
      {
        "label": "Dịu nhẹ da nhạy cảm – pH 4.5 · 2 chai",
        "price": 390000,
        "oldPrice": 390000
      },
      {
        "label": "Lành tính cho bé gái – pH 4.5 · 1 chai",
        "price": 195000,
        "oldPrice": 195000
      },
      {
        "label": "Lành tính cho bé gái – pH 4.5 · 2 chai",
        "price": 390000,
        "oldPrice": 390000
      }
    ],
    "chon2": [
      "Loại",
      "Số chai"
    ],
    "desc": "Dung dịch vệ sinh Hexacare – sản xuất tại Pháp, chai 200ml, giá bán lẻ 195.000đ/chai. Có 4 loại theo nhu cầu:\n\n1. Dung dịch vệ sinh điều tiết hằng ngày – pH 3.6 (200ml). Đối tượng: phụ nữ và trẻ vị thành niên từ 12 tuổi trở lên. Công dụng: làm sạch và duy trì độ ẩm tự nhiên; pH 3.6 hỗ trợ bảo vệ vùng kín, hạn chế tình trạng viêm nhiễm; hỗ trợ khử mùi, mang lại cảm giác sạch thoáng, tươi mát; phù hợp sử dụng hằng ngày.\n\n2. Dung dịch vệ sinh ngăn ngừa kháng viêm – pH 5.0 (200ml). Đối tượng: phụ nữ, kể cả trong thai kỳ và chu kỳ kinh nguyệt; trẻ vị thành niên từ 12 tuổi trở lên. Công dụng: cấp ẩm, làm dịu tình trạng khô rát và khó chịu; pH 5.0 hỗ trợ hệ lợi khuẩn bảo vệ vùng kín; hỗ trợ làm dịu và chăm sóc vùng da đang nhạy cảm; hương hoa cúc La Mã nhẹ nhàng.\n\n3. Dung dịch vệ sinh dịu nhẹ cho da nhạy cảm – pH 4.5 (200ml). Đối tượng: phụ nữ và trẻ vị thành niên từ 12 tuổi trở lên, đặc biệt phù hợp với làn da nhạy cảm. Công dụng: làm sạch dịu nhẹ và dưỡng ẩm; pH 4.5 hỗ trợ bảo vệ môi trường vùng kín; hỗ trợ hạn chế cảm giác khô rát; hỗ trợ khử mùi, tạo cảm giác sạch và thoải mái.\n\n4. Dung dịch vệ sinh lành tính dành cho bé gái – pH 4.5 (200ml). Đối tượng: bé gái từ 3–12 tuổi. Công dụng: làm sạch nhẹ nhàng, không gây khô da; duy trì độ pH sinh lý phù hợp cho bé; hỗ trợ bảo vệ vùng kín và hạn chế tình trạng khó chịu.",
    "highlights": [
      "Điều tiết hằng ngày pH 3.6 – làm sạch, giữ ẩm tự nhiên, hỗ trợ khử mùi (phụ nữ & trẻ từ 12 tuổi)",
      "Ngăn ngừa kháng viêm pH 5.0 – cấp ẩm, làm dịu khô rát, hương hoa cúc La Mã (dùng được cả thai kỳ & kỳ kinh nguyệt)",
      "Dịu nhẹ cho da nhạy cảm pH 4.5 – làm sạch dịu nhẹ, dưỡng ẩm, hỗ trợ hạn chế khô rát",
      "Lành tính cho bé gái pH 4.5 – làm sạch nhẹ nhàng, không gây khô da (bé gái 3–12 tuổi)",
      "Sản xuất tại Pháp – chai 200ml"
    ],
    "usage": "Dùng ngoài. Lấy lượng vừa đủ, làm sạch nhẹ nhàng vùng kín bên ngoài rồi rửa lại bằng nước sạch. Tránh tiếp xúc với mắt. Chọn đúng loại theo độ tuổi và nhu cầu; làm theo hướng dẫn in trên bao bì."
  },
  {
    "id": "zinc-purevitality",
    "slug": "kem-zinc-pure-vitality",
    "name": "Kẽm ZinC Pure Vitality New Zealand – Bổ Sung Kẽm Hỗ Trợ Tăng Đề Kháng & Phát Triển Toàn Diện – Lọ Nhỏ Giọt 30ml Không Hương",
    "short": "Kẽm ZinC Pure Vitality 30ml",
    "brand": "purevitality",
    "cat": "vitamin",
    "ages": [
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "needs": [
      "de-khang",
      "tang-can",
      "tri-nao",
      "cho-me"
    ],
    "price": 290000,
    "oldPrice": 290000,
    "rating": 0,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 2,
    "shape": "bottle",
    "color": "#0E6B57",
    "weight": "Lọ nhỏ giọt 30ml",
    "origin": "New Zealand",
    "family": true,
    "tags": [
      "Mới"
    ],
    "image": "img/zinc-purevitality-h.jpg",
    "thumb": "img/thumb/zinc-purevitality-h.jpg",
    "images": [
      "img/zinc-purevitality-h.jpg",
      "img/zinc-purevitality-2.jpg",
      "img/zinc-purevitality-3.jpg",
      "img/zinc-purevitality-4.jpg",
      "img/zinc-purevitality-5.jpg"
    ],
    "variants": [
      {
        "label": "1 lọ",
        "price": 290000,
        "oldPrice": 290000
      },
      {
        "label": "2 lọ",
        "price": 580000,
        "oldPrice": 580000
      }
    ],
    "desc": "ZinC – Bổ sung kẽm hỗ trợ đề kháng & phát triển toàn diện. Thành phần chính: Zinc (as Zinc Sulphate) – 6.75 mg. Công dụng nổi bật: tăng cường hệ miễn dịch, giúp cơ thể khỏe mạnh hơn; hỗ trợ xương chắc khỏe, giảm nguy cơ loãng xương; tốt cho tóc – da – móng, hỗ trợ chức năng sinh sản; tăng khả năng tập trung & hiệu suất học tập. Đối tượng sử dụng: trẻ em biếng ăn, chậm lớn, cần tăng đề kháng; phụ nữ mang thai & cho con bú; người hấp thu kém hoặc hay ốm vặt. Quy cách: lọ nhỏ giọt 30ml – không hương. Xuất xứ: New Zealand. HSD: 2 năm từ NSX.",
    "highlights": [
      "Thành phần chính: Zinc (as Zinc Sulphate) – 6.75 mg",
      "Tăng cường hệ miễn dịch, giúp cơ thể khỏe mạnh hơn",
      "Hỗ trợ xương chắc khỏe, giảm nguy cơ loãng xương",
      "Tốt cho tóc – da – móng, hỗ trợ chức năng sinh sản",
      "Tăng khả năng tập trung & hiệu suất học tập",
      "Lọ nhỏ giọt 30ml – không hương, xuất xứ New Zealand, HSD 2 năm từ NSX"
    ],
    "usage": "Trẻ 4–13 tuổi: 0.5ml/lần/ngày. Từ 14 tuổi & người lớn: 0.5ml × 2 lần/ngày. Uống cùng bữa ăn hoặc theo hướng dẫn y tế."
  },
  {
    "rating": 0,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 2,
    "origin": "Việt Nam",
    "family": true,
    "tags": [
      "Mới"
    ],
    "cat": "do-an",
    "needs": [],
    "id": "bo-xuyen-tieu",
    "name": "Bò Xuyên Tiêu Chef Hải – Bò Sấy Dẻo Vị Xuyên Tiêu Công Thức Masterchef Phạm Tuấn Hải – Gói 200g",
    "short": "Bò xuyên tiêu Chef Hải 200g",
    "brand": "chef-to-factory",
    "ages": [],
    "price": 339000,
    "oldPrice": 339000,
    "shape": "box",
    "color": "#8A2A2A",
    "weight": "Gói 200g",
    "images": [
      "img/bo-xuyen-tieu.jpg",
      "img/bo-xuyen-tieu-2.jpg",
      "img/bo-xuyen-tieu-3.jpg",
      "img/bo-xuyen-tieu-4.jpg",
      "img/bo-xuyen-tieu-5.jpg"
    ],
    "variants": [
      {
        "label": "1 gói 200g",
        "price": 339000,
        "oldPrice": 339000
      },
      {
        "label": "2 gói",
        "price": 678000,
        "oldPrice": 678000
      }
    ],
    "desc": "Bò xuyên tiêu làm theo công thức của Masterchef Phạm Tuấn Hải: thịt bò mông tươi được chọn kỹ, tẩm ướp đậm đà rồi sấy dẻo nên miếng thịt vẫn mềm, dai, không khô cứng. Vị xuyên tiêu thơm nồng, tê nhẹ rất cuốn – xé ra nhâm nhi, ăn kèm cơm nóng, xôi, bánh mì hay làm món mặn trong bữa cơm gia đình đều hợp. Sản phẩm đạt tiêu chuẩn an toàn thực phẩm ISO 22000.",
    "highlights": [
      "Thịt bò mông tươi, công thức Masterchef Phạm Tuấn Hải",
      "Sấy dẻo: thịt mềm, dai, không khô cứng",
      "Vị xuyên tiêu thơm nồng, tê nhẹ đặc trưng",
      "Đạt tiêu chuẩn an toàn thực phẩm ISO 22000"
    ],
    "usage": "Ăn liền, hoặc hâm nóng vài phút cho thơm hơn. Ăn kèm cơm nóng, xôi, bánh mì hoặc nhâm nhi. Bảo quản nơi khô ráo, thoáng mát; đã mở thì buộc kín và dùng sớm.",
    "image": "img/bo-xuyen-tieu.jpg",
    "thumb": "img/thumb/bo-xuyen-tieu.jpg"
  },
  {
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 2,
    "origin": "Việt Nam",
    "family": true,
    "tags": [
      "Mới"
    ],
    "cat": "do-an",
    "needs": [],
    "id": "com-chay-phomai",
    "name": "Cơm Cháy Nướng Cháy Cạnh Vị Phô Mai Vua Đỉnh Vị – Nướng Không Chiên, Giòn Không Ngấy – Túi Zip 200g",
    "short": "Cơm cháy nướng vị phô mai & BBQ 200g",
    "brand": "vua-dinh-vi",
    "ages": [
      "3-6y",
      "6-12y",
      "12-18y"
    ],
    "price": 115000,
    "oldPrice": 115000,
    "shape": "box",
    "color": "#E8A317",
    "weight": "Túi zip 200g",
    "images": [
      "img/com-chay-phomai.jpg",
      "img/com-chay-phomai-2.jpg",
      "img/com-chay-phomai-3.jpg",
      "img/com-chay-phomai-4.jpg",
      "img/com-chay-phomai-5.jpg"
    ],
    "variants": [
      {
        "label": "1 túi 200g (vị phô mai)",
        "price": 115000,
        "oldPrice": 115000
      },
      {
        "label": "2 túi (vị phô mai)",
        "price": 230000,
        "oldPrice": 230000
      },
      {
        "label": "3 túi (vị phô mai)",
        "price": 345000,
        "oldPrice": 345000
      },
      {
        "label": "1 túi 200 gr (vị BBQ)",
        "price": 125000
      },
      {
        "label": "2 túi (vị BBQ)",
        "price": 250000
      },
      {
        "label": "3 túi  (vị BBQ)",
        "price": 375000
      }
    ],
    "desc": "Cơm cháy Vua Đỉnh Vị được nướng thay vì chiên nên miếng cơm vàng giòn, cạnh cháy thơm mà không cứng, không ngấy dầu. Lớp phô mai phủ đều, vị béo, mặn ngọt hài hoà – bé thích, người lớn cũng mê. Túi zip dày giúp cơm giữ độ giòn sau khi mở. Món ăn vặt tiện mang đi học, đi làm, dã ngoại hay xem phim cùng cả nhà. Thành phần: gạo, dầu thực vật, đường, muối, ớt, chiết xuất nấm men, bột phô mai.",
    "highlights": [
      "Nướng không chiên: vàng giòn, không cứng, không ngấy",
      "Phủ phô mai béo, vị mặn ngọt hài hoà",
      "Túi zip giữ cơm giòn sau khi mở",
      "Ăn vặt tiện lợi cho cả nhà"
    ],
    "usage": "Ăn liền. Sau khi mở, kéo kín khoá zip để cơm giữ độ giòn. Bảo quản nơi khô ráo, tránh ánh nắng.",
    "image": "img/com-chay-phomai.jpg",
    "thumb": "img/thumb/com-chay-phomai.jpg"
  },
  {
    "rating": 0,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 2,
    "origin": "Việt Nam",
    "family": true,
    "tags": [
      "Mới"
    ],
    "cat": "do-an",
    "needs": [],
    "id": "com-vang-noi-oi",
    "name": "Cơm Cháy Chà Bông Cơm Vàng Nội Ơi Vua Đỉnh Vị – Cơm Cháy Nướng Phủ Chà Bông, Sốt Mắm Hành – Túi 300g",
    "short": "Cơm cháy chà bông Nội Ơi 300g",
    "brand": "vua-dinh-vi",
    "ages": [
      "6-12y",
      "12-18y"
    ],
    "price": 445000,
    "oldPrice": 445000,
    "shape": "box",
    "color": "#D9822B",
    "weight": "Túi 300g",
    "images": [
      "img/com-vang-noi-oi.jpg",
      "img/com-vang-noi-oi-2.jpg",
      "img/com-vang-noi-oi-3.jpg",
      "img/com-vang-noi-oi-4.jpg",
      "img/com-vang-noi-oi-5.jpg"
    ],
    "variants": [
      {
        "label": "1 túi 300g",
        "price": 445000,
        "oldPrice": 445000
      },
      {
        "label": "2 túi",
        "price": 890000,
        "oldPrice": 890000
      }
    ],
    "desc": "Cơm Vàng Nội Ơi mang vị cơm cháy truyền thống: lớp cơm mỏng ép rồi nướng vàng giòn, phủ đều chà bông (ruốc) mặn ngọt vừa phải, rưới sốt mắm, ớt, hành thơm lừng. Món ăn vặt đậm vị quê nhà, hợp để cả nhà quây quần thưởng thức hay làm quà biếu. Thành phần: gạo, ruốc, dầu thực vật, đường, mạch nha, mắm, ớt, tỏi, muối, chiết xuất nấm men.",
    "highlights": [
      "Cơm cháy nướng mỏng, vàng giòn",
      "Phủ chà bông đều mặt, vị mặn ngọt hài hoà",
      "Sốt mắm, ớt, hành thơm đậm đà",
      "Hộp đẹp, hợp làm quà biếu"
    ],
    "usage": "Ăn liền, ngon nhất ngay sau khi mở túi. Đã mở thì buộc kín hoặc cho vào hộp kín để giữ giòn. Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng; không dùng nếu bao bì rách hoặc sản phẩm có dấu hiệu lạ.",
    "image": "img/com-vang-noi-oi.jpg",
    "thumb": "img/thumb/com-vang-noi-oi.jpg"
  },
  {
    "rating": 0,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 2,
    "origin": "Việt Nam",
    "family": true,
    "tags": [
      "Mới"
    ],
    "cat": "do-an",
    "needs": [],
    "id": "lon-den-khoi-mo",
    "name": "Lợn Đen Khói Mơ Tây Bắc Vua Đỉnh Vị – Thịt Lợn Đen Gác Bếp Ướp Mắc Khén, Hạt Dổi – Gói 200g",
    "short": "Lợn đen khói mơ Tây Bắc 200g",
    "brand": "vua-dinh-vi",
    "ages": [],
    "price": 265000,
    "oldPrice": 265000,
    "shape": "box",
    "color": "#5D1F14",
    "weight": "Gói 200g",
    "images": [
      "img/lon-den-khoi-mo.jpg",
      "img/lon-den-khoi-mo-2.jpg",
      "img/lon-den-khoi-mo-3.jpg",
      "img/lon-den-khoi-mo-4.jpg",
      "img/lon-den-khoi-mo-5.jpg"
    ],
    "variants": [
      {
        "label": "1 gói 200g",
        "price": 265000,
        "oldPrice": 265000,
        "oos": true
      },
      {
        "label": "2 gói",
        "price": 530000,
        "oldPrice": 530000,
        "oos": true
      }
    ],
    "desc": "Đặc sản lợn đen Tây Bắc làm từ thịt lợn đen tươi (99%), ướp kỹ với mắc khén, hạt dổi, thảo quả, tỏi, ớt, tiêu rồi hun khói, cho miếng thịt thơm mùi khói, đậm đà, càng nhai càng ngọt. Không chất bảo quản. Món nhâm nhi ở nhà hay đãi bạn bè đều ngon.",
    "highlights": [
      "99% thịt lợn đen tươi, không chất bảo quản",
      "Ướp mắc khén, hạt dổi, thảo quả – đúng vị Tây Bắc",
      "Hun khói thơm, đậm đà",
      "Ăn liền hoặc hấp nóng đều ngon"
    ],
    "usage": "Xé sợi ăn liền, hoặc hấp 3–5 phút cho thơm mềm; chấm chẩm chéo hoặc tương ớt. Bảo quản: chưa mở để nhiệt độ thường 5–7 ngày, ngăn mát tới 2 tháng; đã mở gói kín và để ngăn đá (tới 6 tháng). Không dùng nếu có dấu hiệu mốc hoặc bao bì rách.",
    "image": "img/lon-den-khoi-mo.jpg",
    "thumb": "img/thumb/lon-den-khoi-mo.jpg"
  },
  {
    "rating": 0,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 2,
    "origin": "Việt Nam",
    "family": true,
    "tags": [
      "Mới"
    ],
    "cat": "do-an",
    "needs": [],
    "id": "muoi-xuyen-tieu",
    "name": "Muối Xuyên Tiêu Chef Hải – Muối Chấm Mắc Khén, Tiêu Xanh Cay Tê Thơm Nồng – Hũ 100g",
    "short": "Muối xuyên tiêu Chef Hải 100g",
    "brand": "chef-to-factory",
    "ages": [],
    "price": 48000,
    "oldPrice": 48000,
    "shape": "jar",
    "color": "#C62828",
    "weight": "Hũ 100g",
    "images": [
      "img/muoi-xuyen-tieu.jpg",
      "img/muoi-xuyen-tieu-2.jpg",
      "img/muoi-xuyen-tieu-3.jpg",
      "img/muoi-xuyen-tieu-4.jpg",
      "img/muoi-xuyen-tieu-5.jpg"
    ],
    "variants": [
      {
        "label": "1 hũ 100g",
        "price": 48000,
        "oldPrice": 48000
      },
      {
        "label": "3 hũ",
        "price": 144000,
        "oldPrice": 144000
      }
    ],
    "desc": "Muối chấm và rắc xuyên tiêu của Chef Hải: vị cay nồng, tê nhẹ, mặn vừa và thơm mùi tiêu rang, chấm đâu cũng \"bắt vị\" mà không gắt. Hoà quyện nhiều loại tiêu và thảo mộc: muối, mắc khén, tiêu xanh, ớt bột sấy. Chấm hoa quả chua (xoài, cóc, ổi), thịt luộc, đồ nướng, hải sản hay rắc vào món xào đều ngon.",
    "highlights": [
      "Cay nồng, tê nhẹ, thơm mùi tiêu rang",
      "Kết hợp mắc khén, tiêu xanh, ớt sấy",
      "Chấm hoa quả chua, thịt luộc, hải sản, đồ nướng",
      "Rắc món xào, chiên thêm đậm vị"
    ],
    "usage": "Mở nắp, lấy lượng vừa dùng rồi đậy kín. Bảo quản nơi khô ráo, thoáng mát. Không dùng khi quá hạn hoặc sản phẩm có mùi lạ, chảy nước, đổi màu.",
    "image": "img/muoi-xuyen-tieu.jpg",
    "thumb": "img/thumb/muoi-xuyen-tieu.jpg"
  },
  {
    "id": "binh-giu-nhiet-hck",
    "name": "Bình Giữ Nhiệt Hương Chất Kids – Quà Độc Quyền Website, Nắp Bật Có Vòi Hút",
    "short": "Bình giữ nhiệt Hương Chất Kids (độc quyền web)",
    "brand": "khac",
    "cat": "luu-niem",
    "ages": [],
    "needs": [
      "cho-me"
    ],
    "price": 199000,
    "oldPrice": 199000,
    "rating": 5,
    "reviews": 0,
    "sold": 0,
    "stock": 50,
    "priority": 4,
    "shape": "bottle",
    "color": "#F3EAD8",
    "weight": "Bình giữ nhiệt",
    "origin": "",
    "tags": [
      "Mới"
    ],
    "family": true,
    "image": "img/binh-giu-nhiet-hck.jpg",
    "thumb": "img/thumb/binh-giu-nhiet-hck.jpg",
    "images": [
      "img/binh-giu-nhiet-hck.jpg",
      "img/binh-giu-nhiet-hck-2.jpg",
      "img/binh-giu-nhiet-hck-3.jpg",
      "img/binh-giu-nhiet-hck-4.jpg"
    ],
    "desc": "Bình giữ nhiệt Hương Chất Kids – sản phẩm độc quyền, chỉ bán trên huongchatkids.vn. Thân bình màu kem, in logo Hương Chất Kids và cả nhà thú cưng đáng yêu, đáy viền vàng. Nắp bật, vòi hút gập gọn, tiện cho mẹ mang đi làm, bé mang đi học. Ngoài mua lẻ 199.000đ, bình còn là quà tặng khi mẹ mua 1 thùng nước dinh dưỡng Lotte hoặc hoá đơn từ 2 triệu, không tính Canxi váng sữa (theo chương trình, số suất có hạn).",
    "highlights": [
      "Sản phẩm độc quyền – chỉ có trên huongchatkids.vn",
      "In logo Hương Chất Kids và nhân vật thú cưng ngộ nghĩnh",
      "Nắp bật, vòi hút gập gọn",
      "Tiện mang đi làm, đi học, đi chơi"
    ],
    "usage": "Rửa sạch bình và nắp trước lần dùng đầu. Rửa tay bằng nước ấm, không ngâm lâu, không dùng máy rửa bát, không cho vào lò vi sóng. Không đựng đồ uống có ga.",
    "seoTitle": "Bình giữ nhiệt Hương Chất Kids – quà độc quyền website | Hương Chất Kids",
    "seoDesc": "Bình giữ nhiệt Hương Chất Kids in logo và nhân vật thú cưng, nắp bật vòi hút – độc quyền huongchatkids.vn, giá 199.000đ."
  }
];
/* ===/ADMIN:PRODUCTS=== */

/* Đường dẫn sản phẩm có từ khoá: huongchatkids.vn/<slug> (vd /nuoc-ep-lotte-tang-cao).
   slug = p.slug (sửa ở Quản trị › Sản phẩm › SEO) hoặc tự tạo từ tên ngắn; trùng nhau / trùng tên trang có sẵn thì thêm mã sản phẩm.
   Máy chủ VPS đọc cùng bảng này để trả trang sản phẩm + chuyển link cũ product.html?id=… sang link mới. */
window.taoSlug = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '');
(function () {
  var TRANG = ['index', 'product', 'collections', 'cart', 'checkout', 'account', 'admin', 'blog', 'policy', 'gioi-thieu', 'do-chi-so-cho-be', 'doi-tac', 'diem-danh', 'vi-voucher', 'quen-mat-khau', 'quan-ly-ton-kho', 'css', 'js', 'img', 'data', 'tools', 'api', 'chat-tep', 'webp', 'cam-nang', 'lich-trinh', '2010', 'sitemap', 'robots'].concat((window.TRANG_DM || []).map(function (t) { return t.slug; }));
  var bySlug = {}, byId = {};
  (window.PRODUCTS || []).forEach(function (p) {
    var s = window.taoSlug(p.slug || p.short || p.name) || window.taoSlug(String(p.id));
    if (bySlug[s] || TRANG.indexOf(s) > -1) s = s + '-' + window.taoSlug(String(p.id));
    bySlug[s] = p.id; byId[p.id] = s;
  });
  window.SP_SLUG = byId; window.SP_THEO_SLUG = bySlug;
})();

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
  { image: "img/feedback/fb-51.jpg", thumb: "img/feedback/thumb/fb-51.jpg", name: "Nước dinh dưỡng Lotte", kol: true }
];

/* Banner đầu trang chủ. Ảnh minh hoạ bên phải: image (1 ảnh) · images + sticker (nhiều ảnh xếp chồng + nhãn dán) · tiers: true (bảng hạng khách hàng lấy từ TIERS) */
/* ===ADMIN:BANNERS=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong) */
window.BANNERS = [
  {
    "hienTu": "2026-11-01T08:30:00+07:00",
    "anTu": "2027-01-01T00:00:00+07:00",
    "anh": {
      "pc": "img/banner/canxi-chi-web-0111-pc.jpg",
      "mb": "img/banner/canxi-chi-web-0111-mb.jpg"
    },
    "nen": "#6E1224",
    "link": "product.html?id=26060839019",
    "alt": "Từ 01/11/2026 Canxi Calciumore chỉ bán trên web huongchatkids.vn, dừng bán trên Shopee và TikTok Shop – khách quen Shopee nhập mã KHSP, khách quen TikTok Shop nhập mã KHTT giảm 5% canxi (1 lần/khách, đến 31/12/2026)"
  },
  {
    "hienTu": "2026-10-24T00:00:00+07:00",
    "anTu": "2026-10-26T00:00:00+07:00",
    "anh": {
      "pc": "img/banner/hau-an-2410-pc.jpg",
      "mb": "img/banner/hau-an-2410-mb.jpg"
    },
    "nen": "#CFE8FF",
    "link": "product.html?id=26060839019",
    "alt": "Ưu đãi 24–25/10: mua 1 hộp Canxi váng sữa Calciumore tặng 1 thùng Lotte Háu Ăn 24 hộp; mua 2 thùng nước ép Lotte tặng 1 thùng Lotte Háu Ăn 24 hộp – quà trị giá 775.000đ"
  },
  {
    "hienTu": "2026-10-24T00:00:00+07:00",
    "anh": {
      "pc": "img/banner/binh-giu-nhiet-v9-pc.jpg",
      "mb": "img/banner/binh-giu-nhiet-v9-mb.jpg"
    },
    "nen": "#FFE6EE",
    "link": "collections.html?ct=ct-2410-binh-lotte",
    "alt": "Quà độc quyền web: tặng bình giữ nhiệt Hương Chất Kids khi mua 1 thùng nước dinh dưỡng Lotte hoặc hoá đơn từ 2 triệu (không tính Canxi váng sữa) – chỉ 50 suất, vẫn được ưu đãi hạng thành viên",
    "anTu": "2027-01-01T00:00:00+07:00"
  },
  {
    "title": "Canxi Calciumore\nmua 2 tặng D3K2",
    "sub": "✅ 1 hộp canxi + 1 lọ D3K2 giảm 5% còn <b>2.726.000₫</b><br>✅ Mua 2 hộp tặng <b>1 lọ D3K2</b> · 3 hộp tặng <b>2 lọ</b> · 4 hộp tặng <b>3 lọ</b>",
    "cta": "Mua ngay",
    "link": "product.html?id=26060839019",
    "theme": "sky",
    "badge": "🎁 Tiết kiệm đến 1.170.000₫",
    "images": [
      "img/thumb/26060839019.jpg",
      "img/thumb/42878618667.jpg"
    ],
    "imageLabels": [
      "📦 Canxi hộp 90 gói",
      "💧 D3K2 30ml"
    ],
    "sticker": "MUA 2\nTẶNG D3K2",
    "fx": "canxi",
    "anTu": "2027-01-01T00:00:00+07:00"
  },
  {
    "anh": {
      "pc": "img/banner/facebook-chinh-chu-pc.jpg",
      "mb": "img/banner/facebook-chinh-chu-mb.jpg"
    },
    "nen": "#D6E6FF",
    "link": "https://www.facebook.com/huongchatkids.vn",
    "alt": "Trang Facebook chính chủ của Hương Chất Kids: facebook.com/huongchatkids.vn – mẹo nuôi con, ưu đãi mới, hơn 11.000 người theo dõi. Cẩn thận trang giả mạo."
  },
  {
    "anh": {
      "pc": "img/banner/diem-danh-pc.jpg",
      "mb": "img/banner/diem-danh-mb.jpg"
    },
    "nen": "#FBB3C7",
    "link": "index.html#ddMini",
    "alt": "Điểm danh mỗi ngày nhận 1.000 điểm – ngày đôi tặng voucher 30K, chuỗi 10/20/30 ngày tặng voucher 10K/20K/30K"
  },
  {
    "anh": {
      "pc": "img/banner/do-chi-so-v2-pc.jpg",
      "mb": "img/banner/do-chi-so-v2-mb.jpg"
    },
    "nen": "#FDEFF4",
    "link": "do-chi-so-cho-be.html",
    "alt": "Đo chỉ số con miễn phí theo chuẩn WHO – chiều cao, cân nặng, BMI, chế độ ăn và vận động theo tuổi"
  },
  {
    "hienTu": "2026-10-21T00:00:00+07:00",
    "anh": {
      "pc": "img/banner/huong-lam-dep-pc-v2.jpg",
      "mb": "img/banner/huong-lam-dep-mb-v2.jpg"
    },
    "nen": "#FFC9D8",
    "link": "collections.html?cat=cho-me",
    "alt": "Hương Chất Kids – Đẹp từ những điều chọn lọc: mỹ phẩm Hàn Quốc chính hãng cho mẹ, chính hãng 100%, tư vấn miễn phí, freeship đơn từ 3 triệu",
    "sub": ""
  },
  {
    "hienTu": "2026-10-21T00:00:00+07:00",
    "anh": {
      "pc": "img/banner/huong-dinh-duong-pc-v2.jpg",
      "mb": "img/banner/huong-dinh-duong-mb-v2.jpg"
    },
    "nen": "#CDEFE6",
    "link": "collections.html",
    "alt": "Mẹ chọn chất – con lớn khoẻ: dinh dưỡng Hàn Quốc chính hãng cho bé 0–18 tuổi, lọc theo tuổi, đo chỉ số miễn phí, chuyên gia tư vấn",
    "sub": ""
  },
  {
    "hienTu": "2026-10-21T00:00:00+07:00",
    "anh": {
      "pc": "img/banner/huong-doi-tac-pc-v2.jpg",
      "mb": "img/banner/huong-doi-tac-mb-v2.jpg"
    },
    "nen": "#FFE6A6",
    "link": "doi-tac.html",
    "alt": "Mẹ Chất Kiếm Chất – làm Đối tác cùng Hương Chất Kids: chia sẻ link sản phẩm, nhận hoa hồng mỗi đơn giao thành công, không phí, không ôm hàng",
    "sub": ""
  },
  {
    "hienTu": "2026-10-21T00:00:00+07:00",
    "anh": {
      "pc": "img/banner/huong-song-chat-pc-v2.jpg",
      "mb": "img/banner/huong-song-chat-mb-v2.jpg"
    },
    "nen": "#FFE0CF",
    "link": "collections.html?cat=do-an",
    "alt": "Ăn chất mỗi ngày, sống chất mỗi giây – đặc sản, đồ ăn ngon và thực phẩm chọn lọc cho cả gia đình",
    "sub": ""
  },
  {
    "title": "Khách mới\ngiảm ngay 5%",
    "sub": "Nhập mã <b>HCK5</b> khi thanh toán – giảm 5% cho đơn hàng đầu tiên, áp dụng mọi sản phẩm. Bấm <b>Lưu mã</b>, web tự áp khi mẹ đặt hàng.",
    "cta": "Lưu mã HCK5",
    "luuMa": "HCK5",
    "link": "collections.html",
    "theme": "pink",
    "badge": "🎟️ Mã giảm giá khách mới",
    "voucher": "HCK5",
    "fx": "voucher",
    "anTu": "2026-11-01T00:00:00+07:00"
  },
  {
    "title": "Khách thân thiết\ngiảm đến 12%",
    "sub": "Tích luỹ chi tiêu tự động theo số điện thoại, không cần đăng ký. Xác thực OTP khi đặt hàng để nhận ưu đãi mọi đơn.",
    "cta": "Xem hạng của tôi",
    "link": "account.html",
    "theme": "grape",
    "badge": "👑 Mới ra mắt",
    "tiers": true
  }
];
/* ===/ADMIN:BANNERS=== */

/* Đánh giá minh hoạ (KHÔNG hiển thị). Trang chủ hiện điểm đánh giá thật từ Shopee. Khi có phản hồi thật của khách, đặt SITE.showReviews = true để hiện mục này. */
window.REVIEWS = [
  { name: 'Mẹ Thu Hà', child: 'bé Bin 3 tuổi', city: 'Q.7, TP.HCM', stars: 5, text: 'Đặt hồng sâm ChuChu buổi sáng, trưa đã có hàng. Bé uống vị táo lê rất thích, dạo này ít ốm vặt hẳn. Có tem phụ đầy đủ nên mình yên tâm.', product: '22644617070' },
  { name: 'Mẹ Ngọc Anh', child: 'bé Sóc 8 tháng', city: 'Cầu Giấy, Hà Nội', stars: 5, text: 'Mua D3K2 nhỏ giọt cho con, chuyên gia dinh dưỡng gọi hướng dẫn liều dùng rất kỹ. Giá tốt hơn mấy shop khác mà còn freeship.', product: '42878618667' },
  { name: 'Mẹ Phương Linh', child: 'bé Na 4 tuổi', city: 'Đà Nẵng', stars: 5, text: 'Nút mua nhanh tiện thật, chỉ nhập số điện thoại với địa chỉ là xong, không phải đăng ký tài khoản. Lần 2 mua nước ép Lotte còn tự điền sẵn luôn.', product: '22686115682' },
  { name: 'Chị Mai Trang', child: 'con trai 6 tuổi', city: 'Thủ Đức, TP.HCM', stars: 4, text: 'Con biếng ăn nên mình mua gạc hươu Sumo. Giao hàng đúng hẹn, đóng gói cẩn thận, thùng không móp. Mong shop có thêm mã giảm.', product: '26156646705' }
];

/* ===ADMIN:POSTS=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong) */
window.POSTS = [
  {
    "id": "chuc-mung-20-10-phu-nu-viet-nam",
    "title": "Chúc mừng ngày Phụ nữ Việt Nam 20/10: gửi những người mẹ tuyệt vời",
    "cat": "Làm đẹp cho mẹ",
    "date": "20/10/2026",
    "read": "3 phút",
    "emoji": "💐",
    "color": "#FCE4EC",
    "image": "img/su-kien/2010d-b1pc.jpg",
    "sanPham": [
      "24015583018",
      "57556697426"
    ],
    "excerpt": "Hôm nay là ngày của mẹ, của chị, của những người phụ nữ luôn lặng lẽ chăm lo cho gia đình. Hương Chất Kids gửi lời chúc và vài gợi ý nhỏ để mẹ dành chút thời gian cho chính mình.",
    "body": [
      "Hôm nay, 20/10, cả nhà Hương Chất Kids xin gửi lời chúc mừng tới tất cả các mẹ, các chị và những người phụ nữ đang đọc những dòng này: chúc mẹ luôn khoẻ mạnh, xinh đẹp, rạng rỡ và có thật nhiều bình yên.",
      "Làm mẹ là một hành trình không có ngày nghỉ. Từ cữ sữa đêm, bữa cơm của con, đến lúc con ốm hay mùa thi đầu cấp – mẹ luôn là người thức khuya nhất và dậy sớm nhất. Vì vậy, Hương mong hôm nay mẹ được nghỉ ngơi một chút, được yêu thương và chiều chuộng nhiều hơn.",
      "![Chúc mừng ngày Phụ nữ Việt Nam 20/10](img/su-kien/2010d-poster.jpg)",
      "## Vài điều nhỏ để mẹ dành cho chính mình",
      "- Ngủ đủ giấc: nhờ bố hoặc người thân trông con một buổi để mẹ ngủ bù.",
      "- Ăn một bữa thật ngon, uống đủ nước – chăm cả nhà thì mẹ cũng cần được chăm.",
      "- 15 phút chăm da buổi tối: làm sạch, đắp mặt nạ, thoa kem dưỡng và nghe một bản nhạc mẹ thích.",
      "- Dạo bộ, tập nhẹ hoặc gặp bạn bè – niềm vui của mẹ cũng là niềm vui của cả nhà.",
      "- Đừng ngại nói \"con mệt\" – cả nhà luôn sẵn lòng chia sẻ cùng mẹ.",
      "## Gợi ý cho bố và các con",
      "Một bó hoa, một tấm thiệp tự vẽ, một bữa cơm bố nấu hay đơn giản là một cái ôm và câu \"cảm ơn mẹ\" – món quà nào cũng quý khi xuất phát từ tình yêu thương.",
      "## Quà 20/10 vẫn đang chờ mẹ hôm nay",
      "- Tạo tài khoản hoặc đăng nhập web hôm nay: nhận 20.100 điểm (mỗi tài khoản 1 lần).",
      "- Điểm danh hôm nay: nhận 50.000 điểm.",
      "- Mua mỹ phẩm từ 5 triệu có quà theo từng mức đơn; mức 10 và 15 triệu mẹ chọn nhận quà hoặc giảm 5%.",
      "- Chương trình kết thúc hết ngày hôm nay 20/10.",
      "[[sp:24015583018]]",
      "Một lần nữa, Hương Chất Kids chúc mẹ một ngày 20/10 thật trọn vẹn, ngập tràn yêu thương. Cảm ơn mẹ đã luôn tin tưởng đồng hành cùng Hương! 💗"
    ]
  },
  {
    "id": "uu-dai-20-10-huong-chat-kids",
    "title": "Mừng 20/10 tại Hương Chất Kids: tặng 20.100 điểm, điểm danh 50.000 điểm và quà mỹ phẩm theo đơn",
    "cat": "Khuyến mãi",
    "date": "18/10/2026",
    "read": "4 phút",
    "emoji": "🌷",
    "color": "#FCE4EC",
    "noiBat": true,
    "image": "img/su-kien/2010d-b1pc.jpg",
    "sanPham": [
      "24015583018",
      "57556697426",
      "bo-xuyen-tieu"
    ],
    "excerpt": "Tạo tài khoản đến hết 20/10 nhận 20.100 điểm, ngày 20/10 điểm danh nhận 50.000 điểm, mỹ phẩm từ 5 triệu có quà và Bò xuyên tiêu tặng sốt. Mẹ xem đủ quà và cách nhận ở đây.",
    "body": [
      "Ngày Phụ nữ Việt Nam 20/10 là dịp để cả nhà nói lời cảm ơn với mẹ – người luôn chăm chút từng bữa ăn, giấc ngủ cho gia đình. Năm nay Hương Chất Kids chuẩn bị nhiều món quà nhỏ để mẹ vừa mua được thứ mình cần, vừa có thêm quà mang về.",
      "## 1. Quà điểm thưởng 20/10: tổng 70.100 điểm",
      "- Tạo tài khoản mới trên web từ 16/10 đến hết ngày 20/10: tặng ngay 20.100 điểm.",
      "- Mẹ đã có tài khoản: đăng nhập trong ngày 20/10 để nhận 20.100 điểm.",
      "- Mỗi tài khoản nhận quà 20.100 điểm 1 lần, điểm tự cộng vào ví.",
      "- Riêng ngày 20/10, mỗi lần điểm danh được 50.000 điểm (ngày thường 1.000 điểm).",
      "- 1 điểm = 1đ. Khi đặt hàng, mỗi đơn dùng điểm giảm tối đa 10% tiền hàng.",
      "![Điểm danh ngày 20/10 nhận 50.000 điểm](img/su-kien/2010d-b2pc.jpg)",
      "## 2. Mua mỹ phẩm – nhận quà theo từng mức đơn (18/10 – hết 20/10)",
      "Áp dụng cho các sản phẩm làm đẹp và chăm sóc dành cho mẹ trên web, tính theo tổng tiền các sản phẩm này trong đơn:",
      "- Đơn từ 5 triệu: tặng 1 hộp mặt nạ NMN Kousa.",
      "- Đơn từ 10 triệu: tặng 1 son Filler RVB LAB, hoặc mẹ chọn giảm trực tiếp 5%.",
      "- Đơn từ 15 triệu: tặng 1 nồi luộc gà inox Ciwete Royal Knight 28cm (trị giá 1.790.000đ), hoặc mẹ chọn giảm trực tiếp 5%.",
      "Ở mức 10 và 15 triệu, trang thanh toán có 2 nút để mẹ tự chọn \"Nhận quà\" hoặc \"Giảm 5%\". Các mức quà không cộng dồn – web tự áp mức cao nhất mà đơn đạt được.",
      "[[sp:24015583018]]",
      "[[sp:57556697426]]",
      "## 3. Món ngon cho cả nhà: Bò xuyên tiêu tặng sốt",
      "- Mỗi gói Bò xuyên tiêu Chef Hải tặng 1 chai sốt, mẹ chọn sốt xào hoặc sốt nướng khi thanh toán.",
      "- Quà này được cộng thêm, kể cả khi đơn đã có quà mỹ phẩm.",
      "[[sp:bo-xuyen-tieu]]",
      "## 4. Cách nhận quà",
      "- Bước 1: vào huongchatkids.vn, bấm tab 🌷 20.10 trên trang chủ để xem đủ ưu đãi.",
      "- Bước 2: tạo tài khoản (hoặc đăng nhập) để nhận điểm; ngày 20/10 bấm Điểm danh.",
      "- Bước 3: chọn sản phẩm, vào thanh toán – quà và lựa chọn giảm giá hiện sẵn, mẹ chỉ cần bấm chọn.",
      "## Lưu ý nhỏ",
      "- Quà tặng theo đơn không dùng chung với mã giảm giá (mã freeship vẫn dùng kèm được).",
      "- Freeship cho đơn từ 3 triệu.",
      "- Sáng 8:00 ngày 20/10, các mẹ đã mua hàng và có email sẽ nhận thư chúc mừng từ Hương.",
      "Mẹ cần tư vấn chọn sản phẩm hay mức quà phù hợp với đơn của mình thì nhắn Zalo cho Hương nhé. Chúc mẹ một mùa 20/10 thật nhiều niềm vui!"
    ]
  },
  {
    "id": "checklist-dinh-duong-nam-moi",
    "title": "Checklist dinh dưỡng năm mới cho bé: 7 điều mẹ nên duy trì",
    "cat": "Dinh dưỡng",
    "date": "31/12/2026",
    "read": "5 phút",
    "emoji": "✅",
    "color": "#FFF3D6",
    "image": "img/42878618667.jpg",
    "sanPham": [
      "42878618667",
      "26060839019",
      "41353214697"
    ],
    "excerpt": "Năm mới, mẹ không cần thay đổi lớn. Bảy thói quen dinh dưỡng đơn giản, duy trì đều đặn mỗi ngày sẽ giúp con lớn khoẻ suốt cả năm.",
    "body": [
      "Đầu năm là lúc mẹ nhìn lại bữa ăn của con. Thay vì những kế hoạch lớn khó giữ, mẹ thử đánh dấu 7 điều dưới đây và duy trì đều đặn.",
      "## 7 điều nên duy trì",
      "- Ăn sáng mỗi ngày, trước khi đến trường.",
      "- Mỗi bữa chính có đủ 4 nhóm: tinh bột, đạm, chất béo, rau củ.",
      "- Rau củ và trái cây nhiều màu mỗi ngày, ưu tiên trái cây nguyên quả hơn nước ép đóng hộp.",
      "- Đủ canxi từ sữa, sữa chua, phô mai, tôm cá nhỏ, đậu phụ theo nhu cầu từng độ tuổi.",
      "- Uống nước lọc là chính, hạn chế nước ngọt và bánh kẹo.",
      "- Ngủ đủ và vận động ngoài trời ít nhất 60 phút mỗi ngày với bé đi học.",
      "- Theo dõi cân nặng, chiều cao định kỳ để biết con lớn đều hay không.",
      "## Bổ sung khi cần",
      "Vitamin D giúp cơ thể hấp thu canxi. Bé ít ra nắng hoặc ăn ít sữa có thể cần bổ sung. Theo nhà sản xuất, D3K2 Pure Vitality dạng giọt dùng được từ sơ sinh, D3 hỗ trợ hấp thu canxi, K2 hỗ trợ đưa canxi vào xương.",
      "![Vitamin D3K2 Pure Vitality dạng giọt](img/42878618667-2.jpg)",
      "[[sp:42878618667]]",
      "[[sp:26060839019]]",
      "[[sp:41353214697]]",
      "Canxi Calciumore và nước ép Lotte Tăng Cao là thực phẩm bổ sung, không phải thuốc, chỉ đi kèm chứ không thay được bữa ăn đa dạng. Mẹ dùng đúng liều trên bao bì, không dùng cùng lúc quá nhiều loại có canxi.",
      "Nếu con chậm tăng cân, đứng cân nhiều tháng liền, thấp hơn hẳn bạn cùng tuổi hoặc biếng ăn kéo dài, mẹ nên đưa con đi khám bác sĩ dinh dưỡng."
    ]
  },
  {
    "id": "cham-soc-rang-mieng-ca-nha",
    "title": "Chăm sóc răng miệng cho cả nhà: mẹ giữ răng khoẻ, bé đánh răng đúng theo tuổi",
    "cat": "Làm đẹp cho mẹ",
    "date": "28/12/2026",
    "read": "5 phút",
    "emoji": "🦷",
    "color": "#E0F5F2",
    "image": "img/56857599724.jpg",
    "sanPham": [
      "56857599724"
    ],
    "excerpt": "Răng chắc khoẻ bắt đầu từ thói quen hằng ngày. Cách mẹ chăm răng cho mình và hướng dẫn bé đánh răng đúng cách theo từng độ tuổi.",
    "body": [
      "Sâu răng là bệnh rất phổ biến ở trẻ nhỏ, và người lớn cũng dễ ố vàng răng vì cà phê, trà. Thói quen tốt của bố mẹ là tấm gương để con làm theo.",
      "## Bé đánh răng theo tuổi",
      "- Khi chiếc răng đầu tiên mọc: lau hoặc chải bằng bàn chải mềm cho bé, dùng lượng kem có fluor bằng hạt gạo.",
      "- Từ 3 tuổi: dùng lượng kem bằng hạt đậu, tập cho bé nhổ bọt, không nuốt kem.",
      "- Dưới khoảng 7–8 tuổi: bố mẹ vẫn nên chải lại hoặc kiểm tra sau khi bé tự chải.",
      "- Chải 2 lần/ngày, mỗi lần khoảng 2 phút, buổi tối là quan trọng nhất.",
      "- Hạn chế đồ ngọt, nước ngọt; không cho bé ngủ khi đang ngậm bình sữa.",
      "## Mẹ giữ răng sáng khoẻ",
      "- Chải răng 2 lần/ngày, dùng chỉ nha khoa để làm sạch kẽ răng.",
      "- Súc miệng bằng nước lọc sau khi uống cà phê, trà.",
      "- Lấy cao răng và khám răng định kỳ khoảng 6 tháng/lần.",
      "![Bột trắng răng Akiko hũ 26g](img/56857599724-2.jpg)",
      "Một số mẹ dùng thêm bột làm sạch răng để giảm vết ố. Theo nhà sản xuất, bột Akiko giúp làm sạch mảng bám, vết ố và không gây ê buốt; dùng 2–3 lần/tuần, chải 2–3 phút rồi súc sạch. Sản phẩm dành cho người lớn, không dùng cho bé. Mẹ đang mang thai, cho con bú hoặc có răng nhạy cảm, đang làm răng sứ nên hỏi nha sĩ trước khi dùng.",
      "[[sp:56857599724]]",
      "Mẹ đưa bé đi khám nha khoa lần đầu khi răng đầu tiên mọc hoặc trước 1 tuổi, sau đó khám định kỳ. Nếu thấy răng bé có đốm trắng đục, đốm nâu đen, bé kêu đau răng, sưng nướu, mẹ nên cho bé đi khám sớm."
    ]
  },
  {
    "id": "tiec-giang-sinh-an-vat-cho-be",
    "title": "Tiệc Giáng sinh tại nhà: món ăn vặt an toàn cho bé và cách chia phần hợp lý",
    "cat": "Món ngon gia đình",
    "date": "25/12/2026",
    "read": "4 phút",
    "emoji": "🎄",
    "color": "#EEF8E6",
    "image": "img/com-chay-phomai.jpg",
    "sanPham": [
      "com-chay-phomai",
      "43532388498",
      "41002695070"
    ],
    "excerpt": "Tiệc Noel tại nhà vui hơn khi mẹ chuẩn bị món ăn vặt hợp tuổi, chia phần vừa đủ và để ý nguy cơ hóc, dị ứng cho các bé nhỏ.",
    "body": [
      "Giáng sinh là dịp cả nhà quây quần, các bé được mời bạn đến chơi. Bàn tiệc nhiều bánh kẹo dễ khiến con ăn quá nhiều đồ ngọt, bỏ bữa chính. Mẹ chuẩn bị khéo một chút là bé vừa vui vừa an toàn.",
      "## Chọn món theo tuổi",
      "- Bé dưới 4 tuổi: tránh hạt nguyên hạt, kẹo cứng, nho và cà chua bi để nguyên quả, xúc xích cắt khoanh tròn – cắt nhỏ theo chiều dọc.",
      "- Đồ giòn cứng như cơm cháy: bẻ miếng nhỏ, cho bé ngồi ăn, không vừa chạy vừa ăn.",
      "- Hỏi trước phụ huynh các bé khách về dị ứng (sữa, trứng, đậu phộng, hải sản).",
      "## Chia phần hợp lý",
      "- Dùng đĩa nhỏ hoặc cốc giấy chia sẵn từng phần thay vì để cả túi trên bàn.",
      "- Mỗi phần nên có trái cây, một món giòn và một món ngũ cốc để no lâu.",
      "- Đồ ngọt để sau bữa chính, mỗi bé 1–2 cái là đủ.",
      "- Nước lọc, sữa tươi thay cho nước ngọt có ga.",
      "![Cơm cháy nướng vị phô mai chia phần cho tiệc](img/com-chay-phomai-2.jpg)",
      "Cơm cháy phô mai Vua Đỉnh Vị được nướng không chiên. Thành phần có muối và ớt, nên với bé nhỏ mẹ cho thử một miếng nhỏ trước và chỉ ăn lượng vừa phải. Granola Fuwa-Saku trộn sữa chua làm cốc parfait Noel rất xinh; granola có hạt, nên với bé nhỏ mẹ ngâm mềm trong sữa và chú ý bé dị ứng hạt. Rong biển vụn rắc cơm nắm hình cây thông, người tuyết, vị nhạt hợp trẻ nhỏ.",
      "[[sp:com-chay-phomai]]",
      "[[sp:43532388498]]",
      "[[sp:41002695070]]",
      "Nếu bé bị hóc, ho sặc liên tục, khó thở, hoặc nổi mẩn, sưng môi sau khi ăn, mẹ cần đưa bé đến cơ sở y tế ngay. Mẹ nên học trước cách sơ cứu hóc dị vật cho trẻ."
    ]
  },
  {
    "id": "retinol-peel-da-cho-me",
    "title": "Retinol và peel da: mẹ cần biết gì trước khi dùng?",
    "cat": "Làm đẹp cho mẹ",
    "date": "22/12/2026",
    "read": "5 phút",
    "emoji": "🧴",
    "color": "#F3E9FF",
    "image": "img/28806784125.jpg",
    "sanPham": [
      "28806784125",
      "24764883120",
      "27734205778"
    ],
    "excerpt": "Retinol và peel axit là hai bước dưỡng da mạnh. Dùng sai tần suất hay quên chống nắng dễ khiến da đỏ, bong tróc. Đây là những điều mẹ nên nắm trước khi bắt đầu.",
    "body": [
      "Retinol và peel da (axit) được nhiều mẹ tìm đến khi da bắt đầu có nếp nhăn, thâm sạm. Đây đều là hoạt chất mạnh: dùng đúng thì hợp, dùng vội thì da dễ kích ứng.",
      "## Trước khi bắt đầu",
      "- Mẹ đang mang thai hoặc cho con bú: không tự dùng retinol, hỏi bác sĩ trước khi dùng bất kỳ sản phẩm peel/axit nào.",
      "- Thử trên vùng da nhỏ (sau tai hoặc quai hàm) 24–48 giờ trước khi thoa toàn mặt.",
      "- Không dùng retinol và peel axit cùng một tối; không dùng khi da đang trầy xước, cháy nắng.",
      "## Tần suất hợp lý",
      "- Retinol: bắt đầu 2 tối/tuần, da quen sau vài tuần mới tăng dần. Thoa lượng bằng hạt đậu cho cả mặt.",
      "- Peel axit: dành cho người đã quen peel, dùng đúng thời gian hướng dẫn rồi trung hoà và rửa sạch. Nên hỏi chuyên viên da liễu trước.",
      "- Những ngày còn lại tập trung dưỡng ẩm, làm dịu da.",
      "![Bộ đôi Meso Retinol dùng buổi tối](img/28806784125-2.jpg)",
      "[[sp:28806784125]]",
      "[[sp:24764883120]]",
      "## Chống nắng là bắt buộc",
      "Retinol và axit khiến da nhạy nắng hơn. Mẹ thoa kem chống nắng mỗi sáng, kể cả ngày ở trong nhà, trước khi ra ngoài 15–20 phút và dặm lại sau 2–3 giờ nếu ở ngoài trời. Kem chống nắng Hiskin 5in1 có SPF50+ PA++++, theo nhà sản xuất phù hợp cả da nhạy cảm.",
      "[[sp:27734205778]]",
      "Hơi châm chích nhẹ lúc đầu có thể gặp. Nếu da đỏ rát kéo dài, sưng, nổi mẩn hoặc bong tróc nhiều, mẹ ngưng dùng và đi khám da liễu. Kết quả trên da mỗi người khác nhau, cần kiên nhẫn và không nên kỳ vọng thay đổi nhanh."
    ]
  },
  {
    "id": "mua-thi-hoc-ky-an-ngu",
    "title": "Mùa thi học kỳ: ăn uống, giấc ngủ và nghỉ ngơi cho con tuổi đi học",
    "cat": "Tuổi teen",
    "date": "19/12/2026",
    "read": "5 phút",
    "emoji": "📚",
    "color": "#E8F4FF",
    "image": "img/27355720019.jpg",
    "sanPham": [
      "47357633686",
      "27355720019",
      "23660586997"
    ],
    "excerpt": "Thi học kỳ là lúc con dễ thức khuya, bỏ bữa và căng thẳng. Mẹ giữ nhịp ăn, ngủ, nghỉ đều đặn để con ôn bài hiệu quả mà vẫn khoẻ.",
    "body": [
      "Cuối tháng 12 là mùa thi học kỳ I. Nhiều con ôn bài đến khuya, sáng vội bỏ bữa, uống nước ngọt để tỉnh táo. Học nhiều không thay được ăn đủ và ngủ đủ – não cần cả hai để ghi nhớ.",
      "## Ăn uống trong tuần thi",
      "- Không bỏ bữa sáng: một bát cháo, bánh mì trứng hoặc ngũ cốc với sữa là đủ để con tập trung buổi sáng.",
      "- Mỗi bữa có đủ đạm (thịt, cá, trứng, đậu), tinh bột và rau xanh.",
      "- Bữa phụ nhẹ khi học tối: sữa chua, trái cây, một nắm nhỏ hạt – tránh mì gói, đồ chiên.",
      "- Uống đủ nước lọc, hạn chế nước ngọt, trà sữa và nước tăng lực.",
      "- Không đổi món lạ ngay trước ngày thi để tránh đau bụng.",
      "## Giấc ngủ là lúc não ghi nhớ bài",
      "Trẻ 6–12 tuổi cần khoảng 9–12 giờ ngủ, tuổi teen 13–18 cần khoảng 8–10 giờ mỗi đêm. Thức trắng đêm trước ngày thi thường làm con mệt và dễ quên bài. Mẹ nhắc con tắt điện thoại trước giờ ngủ 30–60 phút và giữ giờ đi ngủ ổn định.",
      "## Nghỉ ngơi xen kẽ",
      "- Học 40–50 phút thì đứng dậy nghỉ 5–10 phút, đi lại, uống nước.",
      "- Dành 20–30 phút vận động nhẹ mỗi ngày: đi bộ, đạp xe, giãn cơ.",
      "- Mẹ hỏi han, động viên thay vì so sánh điểm số – áp lực quá lớn làm con khó ngủ, chán ăn.",
      "![Hồng sâm Rich Kid gói 40ml cho bé đi học](img/27355720019-2.jpg)",
      "Một số mẹ cho con dùng thêm hồng sâm hoặc nước ép trong giai đoạn học căng. Theo nhà sản xuất, hồng sâm Rich Kid hỗ trợ tập trung và trí não; nước ép Lotte Đề Kháng hỗ trợ đề kháng. Đây là thực phẩm bổ sung, không phải thuốc, và không thay được bữa ăn chính.",
      "[[sp:27355720019]]",
      "[[sp:47357633686]]",
      "[[sp:23660586997]]",
      "Nếu con mất ngủ kéo dài, đau đầu, chán ăn, sụt cân hoặc lo âu nhiều trong mùa thi, mẹ nên đưa con đi khám để bác sĩ tư vấn."
    ]
  },
  {
    "id": "chuyen-doi-sua-cong-thuc",
    "title": "Chuyển đổi sữa công thức cho bé dưới 3 tuổi: đổi từ từ để bé không rối loạn tiêu hoá",
    "cat": "Tiêu hoá",
    "date": "16/12/2026",
    "read": "5 phút",
    "emoji": "🍼",
    "color": "#E8F4FF",
    "image": "img/19491505209.jpg",
    "sanPham": [
      "19491505209",
      "19682441455",
      "20992159167"
    ],
    "excerpt": "Đổi sữa đột ngột dễ khiến bé táo bón, đi ngoài hay quấy. Lịch chuyển sữa 5–7 ngày, cách pha đúng và dấu hiệu cần đưa bé đi khám.",
    "body": [
      "Mẹ có thể cần đổi sữa khi bé lên số mới theo tuổi, khi sữa cũ khó mua hoặc theo gợi ý của bác sĩ. Hệ tiêu hoá của bé dưới 3 tuổi còn non, nên đổi từ từ sẽ giúp bé quen dần, hạn chế táo bón, đi ngoài lỏng hay đầy hơi.",
      "## Lịch chuyển sữa 5–7 ngày",
      "- Ngày 1–2: thay 1 cữ trong ngày bằng sữa mới, các cữ còn lại giữ sữa cũ.",
      "- Ngày 3–4: thay khoảng một nửa số cữ bằng sữa mới.",
      "- Ngày 5–7: dùng sữa mới cho hầu hết các cữ, rồi chuyển hẳn nếu bé ăn ngủ, đi ngoài bình thường.",
      "Mỗi bình chỉ pha một loại sữa với đúng muỗng của loại đó, vì mỗi hãng có muỗng và tỉ lệ khác nhau. Không pha đặc hơn hay loãng hơn hướng dẫn.",
      "## Pha đúng theo từng loại",
      "Biostime SN-2 Bio Plus HPO pha 1 muỗng gạt (4,5g) với 30ml nước ấm, dùng trong 1 giờ. Theo nhà sản xuất, sữa có chất béo SN-2, lợi khuẩn và HMO, hỗ trợ tiêu hoá dễ.",
      "[[sp:19491505209]]",
      "Sữa dê Biostime pha 1 muỗng gạt với 30ml nước ấm theo bảng trên hộp. Theo nhà sản xuất, đạm sữa dê nhỏ, dễ tiêu. Sữa bò Organic Biostime pha với nước ấm 40–50°C theo bảng trên hộp.",
      "![Sữa dê Biostime lon 800g](img/19682441455-2.jpg)",
      "[[sp:19682441455]]",
      "[[sp:20992159167]]",
      "## Mẹo giúp bé hợp tác",
      "- Bắt đầu đổi sữa khi bé khoẻ, không đang ốm, mọc răng hay vừa tiêm phòng.",
      "- Cho bé thử cữ sữa mới vào buổi sáng để mẹ dễ theo dõi trong ngày.",
      "- Phân bé đổi màu, đổi độ đặc nhẹ trong vài ngày đầu là thường gặp; mẹ ghi lại số lần đi ngoài để so sánh.",
      "## Khi nào cần đưa bé đi khám",
      "Mẹ dừng sữa mới và đưa bé đi khám khi bé nôn nhiều, tiêu chảy hoặc táo bón kéo dài quá 3 ngày, có máu trong phân, nổi mẩn, quấy khóc liên tục, bỏ bú hoặc sụt cân. Bé có tiền sử dị ứng đạm sữa bò cần hỏi bác sĩ trước khi đổi sang bất kỳ loại sữa nào, kể cả sữa dê."
    ]
  },
  {
    "id": "tao-do-trong-bua-an-gia-dinh",
    "title": "Táo đỏ trong bữa ăn gia đình: nấu chè, hầm canh, pha trà và lưu ý cho bé nhỏ",
    "cat": "Món ngon gia đình",
    "date": "13/12/2026",
    "read": "4 phút",
    "emoji": "🍲",
    "color": "#FFE9EF",
    "image": "img/28467224687.jpg",
    "sanPham": [
      "28467224687"
    ],
    "excerpt": "Táo đỏ khô ngọt tự nhiên, dễ đưa vào chè, canh hầm, trà ấm. Cách dùng lượng vừa phải và lưu ý bỏ hạt, cắt nhỏ để bé không bị hóc.",
    "body": [
      "Táo đỏ khô có vị ngọt tự nhiên, thơm, hợp với nhiều món trong ngày lạnh. Dùng đúng cách và đúng lượng, táo đỏ là nguyên liệu tiện cho cả nhà.",
      "## 3 cách dùng táo đỏ hằng ngày",
      "- Chè táo đỏ hạt sen: ngâm hạt sen, nấu mềm rồi thêm 5–6 quả táo đỏ bổ đôi bỏ hạt, nấu thêm 10 phút. Táo đã ngọt nên mẹ bớt đường.",
      "- Canh gà hầm táo đỏ: hầm gà với nấm, cà rốt và 4–5 quả táo đỏ, vị nước dùng ngọt dịu, trẻ con dễ ăn.",
      "- Trà táo đỏ gừng: 3–4 quả táo cắt lát, vài lát gừng, hãm với nước sôi 10 phút, uống ấm.",
      "![Táo đỏ Hotan quả to dày thịt](img/28467224687-2.jpg)",
      "## Lượng dùng hợp lý",
      "Theo hướng dẫn của sản phẩm, người lớn ăn trực tiếp khoảng 3–5 quả mỗi ngày. Táo đỏ khô chứa nhiều đường tự nhiên, ăn nhiều dễ đầy bụng, nên tính chung cả lượng táo trong chè, canh, trà. Người có bệnh tiểu đường hoặc đang dùng thuốc nên hỏi bác sĩ trước khi dùng thường xuyên.",
      "[[sp:28467224687]]",
      "## Lưu ý quan trọng cho bé nhỏ",
      "- Luôn bỏ hạt trước khi nấu hoặc cho bé ăn. Hạt táo nhọn, cứng, rất dễ gây hóc.",
      "- Bé dưới 4 tuổi: không cho ăn nguyên quả khô vì thịt táo dai. Nên nấu mềm rồi băm nhỏ hoặc nghiền lẫn vào cháo, canh.",
      "- Bé nhỏ chỉ cần 1–2 quả mỗi ngày, cho ăn khi ngồi yên, có người lớn bên cạnh.",
      "- Trà táo đỏ gừng có vị cay, không dành cho bé nhỏ.",
      "## Bảo quản",
      "Táo đỏ sấy khô không đường, không chất bảo quản (theo nhà sản xuất), nên mẹ bảo quản nơi khô ráo, đậy kín sau khi mở. Nếu thấy mốc, mùi lạ thì bỏ đi. Nếu bé ho sặc, khó thở sau khi ăn, mẹ sơ cứu và đưa bé đến cơ sở y tế ngay."
    ]
  },
  {
    "id": "da-me-sau-sinh-xin-mau",
    "title": "Da mẹ sau sinh xỉn màu, khô ráp: chăm sóc da mặt và da body an toàn",
    "cat": "Làm đẹp cho mẹ",
    "date": "10/12/2026",
    "read": "5 phút",
    "emoji": "🌷",
    "color": "#F3E9FF",
    "image": "img/27734205778.jpg",
    "sanPham": [
      "27734205778",
      "57903449970",
      "24465090622"
    ],
    "excerpt": "Thay đổi nội tiết, thiếu ngủ, ít uống nước khiến da mẹ sau sinh xỉn và khô. Gợi ý chu trình đơn giản cho da mặt, da body và lưu ý khi đang cho con bú.",
    "body": [
      "Sau sinh, nội tiết thay đổi, mẹ thức đêm nhiều và hay quên uống nước nên da dễ xỉn màu, khô ráp, có khi lên vài đốm sạm. Phần lớn sẽ cải thiện dần trong vài tháng nếu mẹ chăm da đều đặn và nghỉ ngơi đủ.",
      "## Chăm từ bên trong trước",
      "- Uống đủ nước, nhất là khi cho con bú: khoảng 2–2,5 lít mỗi ngày, chia nhiều lần.",
      "- Ăn đủ rau xanh, trái cây, đạm; ngủ bù khi bé ngủ.",
      "## Chu trình da mặt đơn giản",
      "- Sáng: rửa mặt dịu nhẹ, dưỡng ẩm, sau đó thoa kem chống nắng kể cả khi ở trong nhà gần cửa sổ.",
      "- Tối: làm sạch kỹ, dưỡng ẩm. Tạm chưa dùng retinol, peel, axit mạnh khi chưa hỏi bác sĩ.",
      "Kem chống nắng Hiskin 5in1 có SPF50+ PA++++, theo nhà sản xuất có niacinamide, glutathione, collagen, nâng tone nhẹ và hợp cả da nhạy cảm. Thoa trước khi ra ngoài 15–20 phút, dặm lại sau 2–3 giờ nếu ở ngoài trời.",
      "[[sp:27734205778]]",
      "Nếu thích lớp nền tươi tắn hơn, mẹ có thể thoa lớp mỏng kem Cell Happy Co 5in1 buổi sáng sau bước dưỡng. Theo nhà sản xuất, kem dùng chống nắng vô cơ, giúp nâng tone, dưỡng ẩm.",
      "![Kem Cell Happy Co 5in1 cho da mặt](img/57903449970-2.jpg)",
      "[[sp:57903449970]]",
      "## Da body khô ráp",
      "Tắm nước ấm vừa, không quá nóng, tắm nhanh 5–10 phút. Sữa tắm Glutanex theo nhà sản xuất có glutathione, niacinamide, HA, làm sạch dịu nhẹ và dưỡng ẩm. Lấy lượng vừa đủ, massage 1–2 phút rồi xả sạch, lau khô và thoa dưỡng thể khi da còn hơi ẩm.",
      "![Sữa tắm Glutanex 300ml](img/24465090622-2.jpg)",
      "[[sp:24465090622]]",
      "## Lưu ý an toàn khi đang cho con bú",
      "- Luôn thử sản phẩm mới trên vùng da nhỏ ở cổ tay hoặc sau tai trong 24 giờ trước khi dùng rộng.",
      "- Không thoa sản phẩm lên vùng ngực bé bú; rửa tay sạch trước khi bế, cho bé bú.",
      "- Mẹ đang cho con bú hoặc mang thai nên hỏi bác sĩ trước khi dùng mỹ phẩm có hoạt chất mạnh hay viên uống làm đẹp. Nếu da nổi mẩn, rát, ngứa kéo dài hoặc sạm lan rộng, mẹ đi khám bác sĩ da liễu."
    ]
  },
  {
    "id": "ve-sinh-vung-kin-be-gai",
    "title": "Vệ sinh vùng kín cho bé gái đúng cách theo độ tuổi: sai lầm mẹ hay mắc",
    "cat": "Chăm con",
    "date": "07/12/2026",
    "read": "5 phút",
    "emoji": "🌸",
    "color": "#FFE9EF",
    "image": "img/hexacare.jpg",
    "sanPham": [
      "hexacare"
    ],
    "excerpt": "Vùng kín bé gái mỏng và nhạy cảm hơn người lớn. Cách vệ sinh theo từng độ tuổi, những sai lầm mẹ hay mắc và dấu hiệu cần đưa bé đi khám.",
    "body": [
      "Da và niêm mạc vùng kín của bé gái rất mỏng, chưa có lớp bảo vệ như người lớn. Vệ sinh đúng cách giúp bé thoải mái, hạn chế hăm, ngứa và khó chịu.",
      "## Từ sơ sinh đến dưới 3 tuổi",
      "- Chỉ cần nước ấm sạch và khăn mềm, lau nhẹ từ trước ra sau sau mỗi lần thay tã.",
      "- Không banh rộng để rửa sâu bên trong; chất trắng mỏng ở nếp gấp nhỏ thường là bình thường.",
      "- Để vùng da khô thoáng vài phút trước khi mặc tã mới.",
      "## Bé từ 3 đến 12 tuổi",
      "- Rửa bên ngoài 1 lần mỗi ngày khi tắm và sau khi đi vệ sinh nặng, luôn theo chiều từ trước ra sau.",
      "- Nếu mẹ muốn dùng dung dịch, chọn loại dành riêng cho bé gái. Hexacare loại Lành tính cho bé gái pH 4.5 dành cho bé 3–12 tuổi, theo nhà sản xuất làm sạch nhẹ nhàng, không gây khô da. Dùng lượng vừa đủ ở bên ngoài rồi rửa lại bằng nước sạch.",
      "- Dạy bé tự lau đúng chiều và thay quần lót cotton mỗi ngày.",
      "![Dung dịch vệ sinh Hexacare cho bé gái](img/hexacare-2.jpg)",
      "[[sp:hexacare]]",
      "## Từ 12 tuổi trở lên",
      "Khi bé bắt đầu dậy thì và có kinh, nhu cầu thay đổi. Theo nhà sản xuất, Hexacare có loại Điều tiết hằng ngày pH 3.6 và loại Dịu nhẹ cho da nhạy cảm pH 4.5 dành cho trẻ từ 12 tuổi. Mẹ chọn đúng loại theo tuổi, không dùng chung chai của mẹ cho bé nhỏ.",
      "## Sai lầm mẹ hay mắc",
      "- Dùng xà phòng tắm, sữa tắm thơm để rửa vùng kín, dễ gây khô rát.",
      "- Thụt rửa hoặc rửa quá nhiều lần mỗi ngày làm mất lớp bảo vệ tự nhiên.",
      "- Cho bé ngồi bồn tắm bọt lâu, mặc quần bó, quần chất liệu bí.",
      "## Khi nào cần đưa bé đi khám",
      "Mẹ đưa bé đi khám bác sĩ nhi hoặc phụ khoa nhi khi bé đỏ rát, ngứa nhiều, tiểu buốt, có khí hư màu vàng xanh hoặc mùi hôi, chảy máu bất thường, hay tình trạng kéo dài quá 2–3 ngày. Dung dịch vệ sinh không thay được thuốc và thăm khám."
    ]
  },
  {
    "id": "bua-toi-15-phut-mien-ga",
    "title": "Bữa tối 15 phút cho cả nhà ngày bận: miến gà thêm rau, trứng và cơm rong biển cho bé",
    "cat": "Món ngon gia đình",
    "date": "04/12/2026",
    "read": "4 phút",
    "emoji": "🍜",
    "color": "#FFF3D6",
    "image": "img/mien-ga-cf.jpg",
    "sanPham": [
      "mien-ga-cf",
      "45462512687"
    ],
    "excerpt": "Ngày đi làm về muộn, mẹ vẫn có bữa tối nóng hổi trong 15 phút: miến gà sấy nấu thêm rau, trứng cho người lớn, cơm rắc rong biển cho bé.",
    "body": [
      "Những hôm tan làm muộn, mẹ chỉ có khoảng 15 phút cho bữa tối. Bí quyết là có sẵn một món nền nhanh, rồi thêm rau và đạm tươi để bữa ăn đủ chất hơn.",
      "## Bước 1: Chuẩn bị trong 5 phút",
      "- Đun sôi một nồi nước, trong lúc chờ thì rửa một nắm rau cải, cải thìa hoặc giá đỗ.",
      "- Đập 1–2 quả trứng ra bát, đánh tan. Nếu có cà rốt, bào sợi mỏng cho nhanh chín.",
      "- Nấu sẵn cơm từ sáng hoặc hâm lại cơm nguội cho bé.",
      "## Bước 2: Nấu miến gà thêm rau, trứng",
      "Miến gà sấy thăng hoa có sợi miến khoai tây và đậu xanh, nước dùng ninh từ xương gà, kèm thịt gà, măng, nấm hương thật (theo nhà sản xuất). Mẹ cho miến vào nồi nước sôi theo lượng ghi trên bao bì, thả rau vào, đến khi sôi lại thì rưới trứng thành vân. Tắt bếp ngay để rau còn xanh.",
      "![Tô miến gà nóng với gà, măng, nấm](img/mien-ga-cf-2.jpg)",
      "[[sp:mien-ga-cf]]",
      "## Bước 3: Phần ăn riêng cho bé",
      "- Bé dưới 3 tuổi: múc miến ra trước khi nêm thêm, chỉ dùng một phần gói gia vị để giảm mặn; cắt ngắn sợi miến, bỏ măng và nấm vì dai, dễ hóc.",
      "- Cơm rắc rong biển: trộn 1 gói nhỏ rong biển với cơm nóng, nắm thành viên vừa miệng. Rong biển đã có vị mặn nhẹ nên mẹ không cần nêm thêm muối vào cơm.",
      "![Cơm trộn rong biển nắm viên cho bé](img/45462512687-2.jpg)",
      "[[sp:45462512687]]",
      "## Lưu ý để bữa nhanh vẫn lành mạnh",
      "Món ăn liền chỉ nên là giải pháp cho ngày bận, không thay hẳn bữa nấu tươi. Mỗi bữa nên có thêm rau và trái cây. Bé mới tập ăn hoặc có tiền sử dị ứng trứng, đậu, hải sản thì mẹ cho thử lượng nhỏ trước; nếu bé nổi mẩn, nôn hay khó thở sau ăn, mẹ đưa bé đi khám ngay."
    ]
  },
  {
    "id": "troi-lanh-be-luoi-uong-nuoc",
    "title": "Trời lạnh bé lười uống nước: dấu hiệu thiếu nước và mẹo giúp bé uống đủ",
    "cat": "Chăm con",
    "date": "01/12/2026",
    "read": "5 phút",
    "emoji": "💧",
    "color": "#E8F4FF",
    "image": "img/23660586997.jpg",
    "sanPham": [
      "23660586997",
      "25632276959",
      "22686115682"
    ],
    "excerpt": "Trời lạnh bé ít khát nên dễ uống thiếu nước mà mẹ không để ý. Cách nhận biết bé thiếu nước, lượng nước gợi ý theo tuổi và mẹo nhỏ giúp con chịu uống hơn.",
    "body": [
      "Mùa đông bé ít ra mồ hôi, ít thấy khát nên hay bỏ bình nước. Nhưng không khí hanh khô, máy sưởi, điều hoà vẫn làm cơ thể mất nước qua hơi thở và da.",
      "## Dấu hiệu bé đang thiếu nước",
      "- Đi tiểu ít, nước tiểu vàng đậm, mùi nồng.",
      "- Môi khô nứt, da khô, bé hay táo bón.",
      "- Bé mệt, quấy, kém tập trung, hay kêu đau đầu.",
      "## Bé cần bao nhiêu nước?",
      "Tham khảo tổng lượng nước (gồm cả sữa, canh, nước ép): bé 1–3 tuổi khoảng 1–1,3 lít/ngày, 4–8 tuổi khoảng 1,3–1,7 lít/ngày, lớn hơn thì nhiều hơn. Nước lọc vẫn nên là phần chính.",
      "## Mẹo giúp bé chịu uống",
      "- Cho bé tự chọn bình nước yêu thích, đặt luôn trong tầm tay.",
      "- Chia nhỏ: vài ngụm sau mỗi giờ chơi, không đợi khát mới uống.",
      "- Mùa lạnh pha nước ấm, nấu canh, súp, cháo loãng để bé nhận thêm nước.",
      "- Thỉnh thoảng đổi vị bằng một gói nước ép nhỏ sau bữa ăn. Nước ép có đường tự nhiên nên không thay nước lọc, mỗi ngày 1 gói là đủ.",
      "![Nước ép Lotte gói nhỏ có ống hút](img/23660586997-2.jpg)",
      "[[sp:23660586997]]",
      "[[sp:25632276959]]",
      "[[sp:22686115682]]",
      "Các dòng nước ép Lotte dùng cho bé từ 12 tháng; theo nhà sản xuất làm từ nguyên liệu hữu cơ, có dòng bổ sung lợi khuẩn hỗ trợ tiêu hoá. Mẹ đưa bé đi khám ngay nếu bé tiểu rất ít hoặc 6–8 giờ không tiểu, môi khô, khóc không có nước mắt, li bì, hoặc đang tiêu chảy, nôn, sốt mà không uống được."
    ]
  },
  {
    "id": "rung-toc-sau-sinh",
    "title": "Rụng tóc sau sinh: vì sao xảy ra, chăm tóc thế nào, khi nào nên đi khám?",
    "cat": "Làm đẹp cho mẹ",
    "date": "28/11/2026",
    "read": "5 phút",
    "emoji": "💇‍♀️",
    "color": "#F3E9FF",
    "image": "img/27809051612.jpg",
    "sanPham": [
      "27809051612",
      "48112514210"
    ],
    "excerpt": "Sinh con được vài tháng, tóc rụng từng nắm khi gội. Phần lớn là hiện tượng tạm thời. Mẹ hiểu nguyên nhân, chăm tóc nhẹ nhàng và biết dấu hiệu cần đi khám.",
    "body": [
      "Nhiều mẹ hoảng hốt khi thấy tóc rụng đầy lược vào tháng thứ 2–4 sau sinh. Đây là chuyện rất thường gặp, và ở đa số mẹ tóc sẽ dần mọc lại.",
      "## Vì sao tóc rụng nhiều sau sinh?",
      "Khi mang thai, nội tiết tố estrogen cao giữ cho tóc ở pha phát triển lâu hơn, nên tóc dày hơn bình thường. Sau sinh, nội tiết giảm nhanh, số tóc “giữ lại” đó cùng chuyển sang pha rụng. Hiện tượng này thường rõ nhất khoảng tháng thứ 3–4 và giảm dần sau 6–12 tháng. Thiếu ngủ, căng thẳng, ăn uống thiếu chất cũng làm tóc rụng nhiều hơn.",
      "## Chăm tóc nhẹ nhàng",
      "- Gội 2–3 lần/tuần bằng dầu gội dịu nhẹ, dùng đầu ngón tay massage da đầu, không cào móng.",
      "- Dùng dầu xả ở thân và ngọn tóc, tránh bôi sát chân tóc.",
      "- Lau tóc bằng khăn mềm, sấy gió mát; hạn chế buộc chặt, uốn, nhuộm trong giai đoạn này.",
      "- Ăn đủ đạm, sắt, kẽm, rau xanh; uống đủ nước, nhất là khi cho con bú.",
      "![Cặp dầu gội và dầu xả Arganicare](img/27809051612-2.jpg)",
      "[[sp:27809051612]]",
      "Cặp gội xả Arganicare có biotin, dầu argan, keratin; theo nhà sản xuất giúp làm sạch dịu nhẹ và tóc mềm mượt hơn. Một số mẹ dùng thêm collagen dạng uống như Super Collagen Alpha (collagen VERISOL kèm vitamin C, biotin theo thông tin nhà sản xuất). Đây là thực phẩm bổ sung, không phải thuốc trị rụng tóc. Mẹ đang mang thai hoặc cho con bú cần hỏi bác sĩ trước khi dùng viên uống, gói uống.",
      "[[sp:48112514210]]",
      "Với dầu gội mới, mẹ thử trước trên vùng da nhỏ để xem có ngứa, đỏ không.",
      "## Khi nào nên đi khám?",
      "Mẹ nên đi khám nếu tóc rụng thành mảng hói, rụng nhiều kéo dài quá 12 tháng sau sinh, hoặc kèm mệt mỏi, da xanh, hồi hộp, sợ lạnh, tăng sụt cân bất thường. Đó có thể là dấu hiệu thiếu máu hay rối loạn tuyến giáp sau sinh, cần bác sĩ kiểm tra."
    ]
  },
  {
    "id": "bua-phu-cho-be-tuoi-di-hoc",
    "title": "Bữa phụ cho bé tuổi đi học: granola, trái cây khô và cách phối cho đủ chất",
    "cat": "Dinh dưỡng",
    "date": "25/11/2026",
    "read": "5 phút",
    "emoji": "🥣",
    "color": "#EEF8E6",
    "image": "img/43532388498.jpg",
    "sanPham": [
      "43532388498",
      "28467224687",
      "26060839019"
    ],
    "excerpt": "Bé đi học về là kêu đói, bữa phụ thế nào cho no vừa đủ mà không ăn mất bữa tối? Gợi ý lượng ăn, cách phối granola, trái cây khô với sữa và lưu ý an toàn.",
    "body": [
      "Trẻ tuổi đi học vận động nhiều, dạ dày lại nhỏ, nên một bữa phụ giữa buổi sáng hoặc chiều tan học giúp con không bị đói lả. Bữa phụ đúng nghĩa là bữa nhỏ, không phải bữa thứ tư.",
      "## Bữa phụ bao nhiêu là vừa?",
      "- Chiếm khoảng 10–15% năng lượng cả ngày, tức chừng 150–250 kcal với bé 6–10 tuổi.",
      "- Cách bữa chính ít nhất 1,5–2 giờ để bé vẫn ăn ngon bữa tối.",
      "- Phối đủ 3 nhóm: tinh bột (ngũ cốc), đạm (sữa, sữa chua, trứng) và trái cây.",
      "## 3 kiểu phối đơn giản",
      "- Granola + sữa chua: khoảng 30–50g granola trộn hũ sữa chua, thêm vài lát chuối.",
      "- Granola + sữa tươi: theo nhà sản xuất, 50g granola với 200ml sữa, cho năng lượng khoảng 207 kcal từ phần granola.",
      "- Trái cây khô + sữa: 2–3 quả táo đỏ bỏ hạt cắt nhỏ, kèm một hộp sữa hoặc vài lát phô mai.",
      "![Granola ăn kèm sữa chua cho bữa phụ](img/43532388498-2.jpg)",
      "[[sp:43532388498]]",
      "[[sp:28467224687]]",
      "## Lưu ý an toàn",
      "Trái cây khô ngọt đậm và dính răng, cho bé ăn lượng nhỏ rồi súc miệng hoặc uống nước. Với bé dưới 4 tuổi, mẹ bỏ hạt táo, cắt nhỏ quả khô và nghiền vụn hạt cứng trong granola để tránh hóc. Bé dị ứng hạt (lạc, hạnh nhân...) cần đọc kỹ thành phần. Nếu bé ít uống sữa, một số mẹ bổ sung canxi dạng gói như Calciumore, bé dùng 1 gói/ngày sau ăn theo nhà sản xuất; đây là thực phẩm bổ sung, không phải thuốc.",
      "[[sp:26060839019]]",
      "Nếu bé ăn bữa phụ đều đặn mà vẫn chậm lên cân, hay mệt hoặc biếng ăn kéo dài, mẹ nên đưa bé đi khám dinh dưỡng để được tư vấn cụ thể."
    ]
  },
  {
    "id": "dap-mat-na-dung-cach",
    "title": "Đắp mặt nạ đúng cách: mấy lần một tuần, đắp bao lâu, loại nào hợp da nào?",
    "cat": "Làm đẹp cho mẹ",
    "date": "22/11/2026",
    "read": "5 phút",
    "emoji": "🧖‍♀️",
    "color": "#FFE9EF",
    "image": "img/57413220644.jpg",
    "sanPham": [
      "57413220644",
      "24015583018"
    ],
    "excerpt": "Đắp mặt nạ mỗi ngày có tốt hơn? Để qua đêm có sao không? Những điều mẹ cần biết để đắp đúng tần suất, đúng thời gian và chọn loại hợp với làn da của mình.",
    "body": [
      "Mặt nạ giấy là bước dưỡng nhanh, hợp với mẹ bỉm ít thời gian. Nhưng đắp nhiều chưa chắc đã tốt, và đắp sai cách có khi còn làm da khô hơn.",
      "## Mấy lần một tuần là đủ?",
      "- Da thường, da khô: 2–3 lần/tuần là hợp lý.",
      "- Da nhạy cảm, dễ kích ứng: bắt đầu 1–2 lần/tuần, theo dõi phản ứng của da.",
      "- Không cần đắp mỗi ngày. Kem dưỡng ẩm hằng ngày mới là bước giữ ẩm chính.",
      "## Đắp bao lâu?",
      "Thường 15–20 phút. Đừng để mặt nạ khô cong trên mặt hay đắp qua đêm: khi miếng giấy khô, nó có thể hút ngược độ ẩm của da. Gỡ ra rồi vỗ nhẹ phần tinh chất còn lại cho thấm, sau đó thoa kem dưỡng để khoá ẩm.",
      "## Chọn loại theo làn da",
      "- Da khô, căng rát, dễ ửng đỏ: ưu tiên thành phần làm dịu như lô hội, rau má, panthenol.",
      "- Da xỉn, thiếu sức sống: có thể chọn mặt nạ có niacinamide, collagen. Nếu da đang dùng nhiều hoạt chất mạnh, mẹ đừng chồng thêm cùng lúc.",
      "- Da dầu, mụn: chọn loại mỏng nhẹ, tránh để tinh chất đọng lâu ở vùng chữ T.",
      "![Mặt nạ thạch lô hội mát dịu cho da khô](img/57413220644-2.jpg)",
      "[[sp:57413220644]]",
      "Mặt nạ thạch lô hội Cure có lô hội, niacinamide, collagen thuỷ phân; theo nhà sản xuất giúp cấp ẩm và làm dịu da. Mặt nạ NMN Kousa có NMN, collagen và adenosine; theo nhà sản xuất giúp cấp ẩm, dưỡng sáng. Cả hai đều hướng dẫn đắp 15–20 phút, 2–3 lần/tuần.",
      "[[sp:24015583018]]",
      "Mẹ luôn thử mặt nạ trên vùng da nhỏ (sau tai hoặc cạnh hàm) trước khi đắp cả mặt. Mẹ đang mang thai hoặc cho con bú nên hỏi bác sĩ trước khi dùng sản phẩm mới. Nếu da đỏ, ngứa, nổi mẩn kéo dài sau khi đắp, mẹ ngưng dùng và đi khám da liễu."
    ]
  },
  {
    "id": "mon-nham-nhi-cuoi-tuan-tay-bac",
    "title": "Món nhâm nhi cuối tuần cho bố mẹ từ đặc sản Tây Bắc: ăn ngon, cất đúng cách",
    "cat": "Món ngon gia đình",
    "date": "19/11/2026",
    "read": "5 phút",
    "emoji": "🥩",
    "color": "#FFF3D6",
    "image": "img/lon-den-khoi-mo.jpg",
    "sanPham": [
      "bo-xuyen-tieu",
      "lon-den-khoi-mo",
      "muoi-xuyen-tieu"
    ],
    "excerpt": "Tối cuối tuần, con ngủ rồi, bố mẹ có một đĩa nhâm nhi nhỏ. Cách bày bò khô, thịt gác bếp cho ngon, cất giữ đúng và lưu ý để bé nhỏ không ăn nhầm đồ cay.",
    "body": [
      "Tối thứ Bảy, con đã ngủ, bố mẹ ngồi xem phim cùng một đĩa đồ nhâm nhi là thú vui nhỏ rất đáng giá. Đặc sản Tây Bắc như thịt gác bếp, bò khô xuyên tiêu không cần nấu nướng, bày ra 5 phút là xong.",
      "## Bày đĩa thế nào cho ngon",
      "- Lợn đen khói: xé sợi theo thớ, hấp 3–5 phút cho mềm và dậy mùi khói, ăn nóng thơm hơn ăn nguội.",
      "- Bò xuyên tiêu: ăn liền được, hoặc hâm nóng vài phút cho thơm; xé miếng nhỏ để nhai dễ.",
      "- Thêm rau: dưa chuột, cà rốt cắt que, lá cải, xoài xanh hoặc ổi chấm muối cho đỡ ngấy và đủ chất xơ.",
      "- Lượng vừa phải: mỗi người chừng 50–70g thịt là đủ cho một buổi. Đồ khô, đồ hun khói khá mặn, ăn nhiều dễ khát nước và nặng bụng.",
      "![Lợn đen khói xé sợi, ăn kèm chẩm chéo](img/lon-den-khoi-mo-2.jpg)",
      "[[sp:lon-den-khoi-mo]]",
      "[[sp:bo-xuyen-tieu]]",
      "## Muối chấm và bảo quản",
      "Một hũ muối xuyên tiêu (mắc khén, tiêu xanh, ớt sấy theo thông tin nhà sản xuất) chấm được cả thịt lẫn hoa quả chua. Mẹ lấy ra đĩa nhỏ lượng vừa dùng, đậy nắp ngay để muối không ẩm. Lợn đen khói chưa mở để nhiệt độ thường 5–7 ngày, ngăn mát tới 2 tháng; đã mở thì gói kín cho vào ngăn đá. Gói nào có mốc, mùi lạ hay bao bì rách thì bỏ đi.",
      "[[sp:muoi-xuyen-tieu]]",
      "## Lưu ý khi nhà có bé nhỏ",
      "- Đồ cay tê như mắc khén, xuyên tiêu không hợp với bé: dễ rát miệng, đau bụng. Bé dưới 3 tuổi không nên ăn.",
      "- Thịt sấy, thịt gác bếp dai và cứng, bé nhỏ nhai chưa kỹ dễ hóc. Cất cao, xa tầm tay con.",
      "- Mẹ đang cho con bú hạn chế đồ quá cay và nên tránh rượu bia. Người có bệnh dạ dày, huyết áp cao nên ăn ít mặn và hỏi bác sĩ nếu không chắc.",
      "Nếu bé lỡ ăn phải đồ cay mà nôn nhiều, đau bụng không đỡ, hoặc nghi hóc thức ăn (ho sặc, khó thở, tím tái), mẹ đưa bé đi khám ngay."
    ]
  },
  {
    "id": "sua-hop-mang-di-hoc",
    "title": "Sữa hộp mang đi học: chọn thế nào, uống lúc nào, bảo quản ra sao",
    "cat": "Dinh dưỡng",
    "date": "16/11/2026",
    "read": "4 phút",
    "emoji": "🥛",
    "color": "#E0F5F2",
    "image": "img/suaxanh-lotte.jpg",
    "sanPham": [
      "suaxanh-lotte",
      "26523206270"
    ],
    "excerpt": "Một hộp sữa trong cặp giúp bé có thêm năng lượng giữa buổi học. Mẹ lưu ý cách chọn, giờ uống và giữ sữa an toàn cả ngày.",
    "body": [
      "Mang sữa đi học là cách tiện để bé có bữa phụ giữa buổi. Nhưng sữa để trong cặp nhiều giờ cần được chọn và cất đúng cách để luôn an toàn.",
      "## Chọn sữa mang đi",
      "- Ưu tiên hộp nhỏ vừa một lần uống, không phải để dành phần thừa.",
      "- Chọn sữa không đường hoặc ít đường cho bữa phụ hằng ngày.",
      "- Kiểm tra hạn dùng, hộp không móp, không phồng.",
      "Theo nhà sản xuất, sữa xanh Lotte Organic là sữa tươi hữu cơ nguyên kem, hộp 125 ml có 4 g đạm, 4,6 g chất béo và 125 mg canxi, vừa một lần uống cho bé từ 1 tuổi.",
      "![Sữa xanh Lotte Organic hộp 125ml mang đi học](img/suaxanh-lotte-2.jpg)",
      "[[sp:suaxanh-lotte]]",
      "## Uống lúc nào",
      "- Giờ ra chơi giữa buổi sáng hoặc sau giờ ngủ trưa là hợp lý.",
      "- Không uống sát giờ ăn trưa để bé không no sữa mà bỏ cơm.",
      "- Sữa là bữa phụ, không thay được bữa sáng đủ chất.",
      "## Bảo quản trong ngày",
      "- Đã cắm ống hút thì uống hết trong lần đó, không để lại uống tiếp.",
      "- Không để cặp dưới nắng, trong xe nóng; mẹ có thể dùng túi giữ nhiệt nhỏ.",
      "- Sữa có mùi chua, vón cục hoặc hộp phồng thì bỏ đi.",
      "Ở nhà, mẹ có thể dùng sữa hộp lớn. Theo nhà sản xuất, sữa tươi Norco nguyên kem không đường; sau khi mở nắp bảo quản lạnh và dùng trong 3 ngày, bé trên 1 tuổi uống 1–2 ly (200–400 ml)/ngày.",
      "[[sp:26523206270]]",
      "Nếu bé hay đau bụng, đầy hơi, tiêu chảy hoặc nổi mẩn sau khi uống sữa, mẹ cho bé ngưng và đi khám để kiểm tra dị ứng đạm sữa hay bất dung nạp lactose."
    ]
  },
  {
    "id": "duong-da-3-buoc-cho-me-ban-ron",
    "title": "Chu trình dưỡng da 3 bước cho mẹ bận rộn: làm sạch – dưỡng – chống nắng",
    "cat": "Làm đẹp cho mẹ",
    "date": "13/11/2026",
    "read": "5 phút",
    "emoji": "✨",
    "color": "#F3E9FF",
    "image": "img/26900366084.jpg",
    "sanPham": [
      "26900366084",
      "24015142248",
      "27734205778"
    ],
    "excerpt": "Không cần 10 bước, mẹ chỉ cần 3 bước đều đặn sáng tối. Cách sắp chu trình gọn trong 5 phút giữa lúc chăm con.",
    "body": [
      "Có con nhỏ, mẹ hiếm khi có 20 phút đứng trước gương. Tin vui là làn da cần sự đều đặn hơn là nhiều bước. Ba bước cơ bản, làm mỗi ngày, đã là nền tảng tốt.",
      "## Bước 1: Làm sạch",
      "- Sáng: rửa mặt bằng nước ấm hoặc sữa rửa mặt dịu nhẹ.",
      "- Tối: nếu có dùng kem chống nắng hay trang điểm, làm sạch kỹ hơn, rửa trong khoảng 1 phút rồi thấm khô.",
      "## Bước 2: Dưỡng",
      "- Thứ tự từ lỏng đến đặc: toner, serum, rồi kem dưỡng.",
      "- Thoa khi da còn hơi ẩm để giữ nước tốt hơn.",
      "Theo nhà sản xuất, combo Hyalu C+ (Ý) gồm toner 200 ml, serum 30 ml và kem dưỡng 50 ml, dùng theo thứ tự toner, serum, kem dưỡng vào sáng và tối.",
      "![Combo dưỡng da Hyalu C+ toner, serum và kem dưỡng](img/26900366084-2.jpg)",
      "[[sp:26900366084]]",
      "Mẹ chỉ muốn thêm một bước có thể dùng riêng serum Hyalu C+. Theo nhà sản xuất, serum có vitamin C ổn định và niacinamide, dùng buổi tối 3–4 giọt cho mặt và cổ, ban ngày cần dùng kem chống nắng.",
      "[[sp:24015142248]]",
      "## Bước 3: Chống nắng (buổi sáng)",
      "Bước cuối buổi sáng, thoa trước khi ra ngoài 15–20 phút. Theo nhà sản xuất, kem chống nắng Hiskin 5in1 có SPF50+ / PA++++ và nâng tone nhẹ, có thể thay kem lót.",
      "[[sp:27734205778]]",
      "## Mẹo để duy trì",
      "- Thêm từng sản phẩm mới cách nhau 1–2 tuần để biết da hợp sản phẩm nào.",
      "- Luôn thử trên vùng da nhỏ trước khi dùng cả mặt; vitamin C, niacinamide có thể làm da nhạy cảm châm chích lúc đầu.",
      "Mẹ đang mang thai hoặc cho con bú nên hỏi bác sĩ trước khi dùng sản phẩm mới, nhất là loại có retinol, axit. Nếu da đỏ, rát, nổi mụn nhiều sau khi đổi sản phẩm, mẹ ngưng dùng và đi khám da liễu."
    ]
  },
  {
    "id": "kem-cho-be-vai-tro-nguon-thuc-pham",
    "title": "Kẽm cho bé: vai trò, thực phẩm giàu kẽm và khi nào cân nhắc bổ sung",
    "cat": "Vitamin",
    "date": "10/11/2026",
    "read": "5 phút",
    "emoji": "🦪",
    "color": "#E8F4FF",
    "image": "img/zinc-purevitality.jpg",
    "sanPham": [
      "zinc-purevitality",
      "42878618667"
    ],
    "excerpt": "Kẽm tham gia vào miễn dịch, vị giác và sự lớn lên của bé. Mẹ ưu tiên thực phẩm trước, chỉ cân nhắc bổ sung khi thật sự cần.",
    "body": [
      "Kẽm là vi chất cơ thể chỉ cần lượng nhỏ nhưng không tự dự trữ được nhiều, nên bé cần nhận đều đặn qua bữa ăn mỗi ngày.",
      "## Kẽm làm gì cho bé",
      "- Tham gia vào hoạt động của hệ miễn dịch.",
      "- Cần cho quá trình tăng trưởng, làm lành vết thương.",
      "- Liên quan đến vị giác; thiếu kẽm bé có thể kém ăn hơn.",
      "## Nhu cầu và nguồn thực phẩm",
      "Theo khuyến nghị phổ biến, bé 1–3 tuổi cần khoảng 3 mg kẽm/ngày, 4–8 tuổi khoảng 5 mg, 9–13 tuổi khoảng 8 mg.",
      "- Giàu kẽm nhất: hàu, sò, thịt bò, thịt heo nạc, đùi gà.",
      "- Nguồn khác: lòng đỏ trứng, sữa, phô mai, các loại đậu, hạt bí (xay mịn cho bé nhỏ).",
      "- Kẽm từ thịt, hải sản dễ hấp thu hơn từ ngũ cốc, đậu.",
      "## Khi nào cân nhắc bổ sung",
      "Bé ăn ít đạm động vật, biếng ăn kéo dài, hay ốm hoặc chậm lớn có thể được bác sĩ chỉ định bổ sung kẽm. Mẹ không tự cho uống liều cao kéo dài vì thừa kẽm có thể gây buồn nôn, đau bụng và ảnh hưởng hấp thu đồng.",
      "Theo nhà sản xuất, kẽm ZinC Pure Vitality (New Zealand) dạng nhỏ giọt không hương; trẻ 4–13 tuổi dùng 0,5 ml/lần/ngày, uống cùng bữa ăn. Đây là thực phẩm bổ sung, không phải là thuốc.",
      "![Kẽm ZinC Pure Vitality dạng nhỏ giọt cho bé](img/zinc-purevitality-2.jpg)",
      "[[sp:zinc-purevitality]]",
      "Nếu bé đang dùng vitamin D3K2, mẹ vẫn giữ lịch như cũ và đọc kỹ hướng dẫn từng sản phẩm. Theo nhà sản xuất, D3 hỗ trợ hấp thu canxi, K2 hỗ trợ đưa canxi vào xương.",
      "[[sp:42878618667]]",
      "Mẹ nên đưa bé đi khám nếu bé biếng ăn, đứng cân hoặc ốm liên tục nhiều tháng, để bác sĩ đánh giá và quyết định có cần xét nghiệm, bổ sung vi chất hay không."
    ]
  },
  {
    "id": "an-vat-cho-be-dung-cach",
    "title": "Ăn vặt cho bé: chọn món giòn ngon, lượng vừa đủ, giờ nào không làm bé bỏ bữa",
    "cat": "Dinh dưỡng",
    "date": "07/11/2026",
    "read": "5 phút",
    "emoji": "🍘",
    "color": "#FFF3D6",
    "image": "img/com-chay-phomai.jpg",
    "sanPham": [
      "com-chay-phomai",
      "com-vang-noi-oi",
      "41002695070"
    ],
    "excerpt": "Ăn vặt không xấu nếu đúng món, đúng lượng, đúng giờ. Mẹ xem cách sắp bữa phụ để bé vui miệng mà vẫn ăn ngon bữa chính.",
    "body": [
      "Bé đang lớn nên đói nhanh, một bữa phụ hợp lý giúp con đủ năng lượng giữa các bữa chính. Vấn đề chỉ xuất hiện khi bé ăn vặt liên tục, ăn quá nhiều hoặc ăn sát giờ cơm.",
      "## Giờ ăn vặt hợp lý",
      "- Mỗi ngày 1–2 bữa phụ, thường giữa buổi sáng và giữa buổi chiều.",
      "- Cách bữa chính ít nhất 1,5–2 giờ để bé đói lại đúng giờ cơm.",
      "- Không cho ăn vặt trong lúc xem tivi hay trước giờ ngủ.",
      "## Lượng bao nhiêu là vừa",
      "- Một bữa phụ chỉ nên bằng khoảng một nắm tay của bé.",
      "- Đồ giòn mặn như cơm cháy: vài miếng nhỏ, kèm nước lọc, sữa hoặc trái cây cho cân bằng.",
      "- Chia sẵn ra đĩa nhỏ thay vì đưa cả túi cho bé tự ăn.",
      "## Chọn món giòn ngon nhưng an toàn",
      "Cơm cháy nướng là lựa chọn quen thuộc của nhiều nhà. Theo nhà sản xuất, cơm cháy phô mai Vua Đỉnh Vị được nướng thay vì chiên, giòn mà không cứng, túi zip giữ giòn sau khi mở.",
      "![Cơm cháy nướng vị phô mai cho bé ăn vặt](img/com-chay-phomai-2.jpg)",
      "[[sp:com-chay-phomai]]",
      "Cơm cháy chà bông Nội Ơi có sốt mắm, ớt, hành đậm vị nên hợp bé lớn từ 6 tuổi; mẹ cho bé thử một miếng nhỏ trước xem có cay quá không. Cả hai loại đều có ớt và muối, mẹ nên cho ăn lượng ít.",
      "[[sp:com-vang-noi-oi]]",
      "Với bé nhỏ, một nắm cơm trộn rong biển vụn Sung Gyung vừa là bữa phụ no lâu vừa mềm dễ nhai. Theo nhà sản xuất, rong biển sấy giòn, vị nhạt, phù hợp trẻ nhỏ.",
      "[[sp:41002695070]]",
      "## Lưu ý cho bé nhỏ",
      "Đồ giòn cứng dễ gây hóc với bé dưới 4 tuổi: mẹ bẻ miếng nhỏ, cho bé ngồi yên khi ăn, không vừa chạy vừa ăn. Đọc kỹ thành phần nếu bé dị ứng sữa, phô mai hoặc hải sản. Nếu bé thường xuyên bỏ bữa, sụt cân hoặc chậm tăng cân, mẹ nên đưa bé đi khám dinh dưỡng."
    ]
  },
  {
    "id": "chong-nang-mua-dong-cho-me",
    "title": "Chống nắng cho mẹ bỉm mùa đông: vì sao vẫn cần và bôi thế nào cho đúng",
    "cat": "Làm đẹp cho mẹ",
    "date": "04/11/2026",
    "read": "4 phút",
    "emoji": "🧴",
    "color": "#FFE9EF",
    "image": "img/27734205778.jpg",
    "sanPham": [
      "27734205778",
      "51013054442"
    ],
    "excerpt": "Trời âm u, nắng nhạt nhưng tia UV vẫn chạm tới da. Mẹ bỉm chỉ cần vài thói quen nhỏ để da được bảo vệ đều đặn cả mùa đông.",
    "body": [
      "Mùa đông trời mát, ít nắng gắt nên nhiều mẹ bỏ kem chống nắng. Thật ra tia UVA vẫn xuyên qua mây và cửa kính quanh năm, là một trong những nguyên nhân khiến da sạm, nhanh lão hoá.",
      "## Vì sao mùa đông vẫn cần chống nắng",
      "- Tia UVA gần như không giảm theo mùa, đi qua được cả mây và kính xe, kính cửa sổ.",
      "- Mẹ đưa đón con, đi chợ, phơi đồ… cộng dồn thời gian ngoài trời mỗi ngày không hề ít.",
      "- Da mùa đông khô, hàng rào bảo vệ yếu hơn nên dễ kích ứng và xỉn màu.",
      "## Bôi thế nào cho đúng",
      "- Lượng đủ cho mặt khoảng 2 đốt ngón tay; bôi mỏng quá thì chỉ số SPF trên nhãn không còn đúng.",
      "- Thoa trước khi ra ngoài 15–20 phút, sau bước dưỡng ẩm, nhớ cả cổ và vành tai.",
      "- Dặm lại sau 2–3 giờ nếu ở ngoài trời lâu hoặc đổ mồ hôi, lau mặt.",
      "- Tối về rửa mặt sạch, không để kem chống nắng qua đêm.",
      "Theo nhà sản xuất, kem chống nắng Hiskin 5in1 có SPF50+ / PA++++, chứa niacinamide, glutathione, collagen và nâng tone nhẹ nên có thể thay kem lót cho mẹ bận rộn.",
      "![Kem chống nắng Hiskin 5in1 SPF50+ cho mẹ](img/27734205778-2.jpg)",
      "[[sp:27734205778]]",
      "Mẹ thích lớp nền ẩm mịn có thể dùng thêm xịt phun sương Grace By Chera ở bước dưỡng buổi sáng. Theo thông tin nhà sản xuất, sản phẩm giúp cấp ẩm và nâng tone, dùng được cho mặt và body. Đây là bước dưỡng, không thay cho kem chống nắng.",
      "[[sp:51013054442]]",
      "## Lưu ý an toàn",
      "Mẹ thử sản phẩm mới trên một vùng da nhỏ (sau tai, cổ tay) 24 giờ trước khi bôi cả mặt. Mẹ đang mang thai hoặc cho con bú nên hỏi bác sĩ trước khi dùng mỹ phẩm mới. Nếu da đỏ rát, ngứa, nổi mẩn kéo dài, mẹ ngưng dùng và đi khám da liễu. Kem chống nắng của mẹ không dùng thoa cho bé, đặc biệt bé dưới 6 tháng."
    ]
  },
  {
    "id": "sua-tuoi-cho-be-tu-1-tuoi",
    "title": "Sữa tươi cho bé từ 1 tuổi: uống bao nhiêu mỗi ngày là đủ?",
    "cat": "Dinh dưỡng",
    "date": "01/11/2026",
    "read": "4 phút",
    "emoji": "🥛",
    "color": "#EAF0FF",
    "image": "img/suaxanh-lotte.jpg",
    "sanPham": [
      "suaxanh-lotte",
      "26523206270"
    ],
    "excerpt": "Sữa tươi là nguồn canxi và đạm dễ dùng nhất cho bé, nhưng uống quá nhiều lại khiến bé lười ăn. Mẹ xem lượng sữa nên dùng theo tuổi và cách chọn sữa.",
    "body": [
      "Từ 12 tháng tuổi, bé có thể uống sữa tươi nguyên kem. Trước 12 tháng, sữa mẹ hoặc sữa công thức vẫn là nguồn sữa chính, không thay bằng sữa tươi.",
      "## Lượng sữa gợi ý mỗi ngày",
      "- 1–2 tuổi: khoảng 400–500ml, chọn sữa nguyên kem.",
      "- 2–5 tuổi: khoảng 400–600ml.",
      "- Trên 5 tuổi: 2–3 hộp nhỏ, kết hợp sữa chua, phô mai.",
      "Uống quá 700–800ml sữa mỗi ngày có thể làm bé no, ăn ít bữa chính và dễ thiếu sắt.",
      "## Chọn sữa thế nào?",
      "- Sữa tươi nguyên kem, không đường hoặc ít đường.",
      "- Ưu tiên sữa hữu cơ, có chứng nhận rõ ràng.",
      "- Hộp nhỏ vừa một lần uống để không phải bảo quản sữa đã mở.",
      "![Sữa xanh Lotte Organic hộp 125ml](img/suaxanh-lotte-2.jpg)",
      "[[sp:suaxanh-lotte]]",
      "[[sp:26523206270]]",
      "Mẹo nhỏ: cho bé uống sữa vào bữa phụ, cách bữa chính khoảng 1,5–2 giờ để bé vẫn ăn ngon bữa cơm."
    ]
  },
  {
    "id": "rong-bien-cho-be-an-dam",
    "title": "Rong biển cho bé: lợi ích, lượng dùng và lưu ý về muối, i-ốt",
    "cat": "Dinh dưỡng",
    "date": "29/10/2026",
    "read": "4 phút",
    "emoji": "🌊",
    "color": "#E3F6F8",
    "image": "img/45462512687.jpg",
    "sanPham": [
      "41002695070",
      "45462512687"
    ],
    "excerpt": "Rong biển giàu chất xơ, i-ốt và khoáng chất, lại hỗ trợ bé ăn cơm ngon miệng hơn. Nhưng ăn bao nhiêu là vừa và chọn loại nào ít muối?",
    "body": [
      "Rong biển là món quen thuộc trong bữa ăn của trẻ em Hàn Quốc và Nhật Bản. Rắc một chút lên cơm, cháo giúp bữa ăn thơm hơn và bé hợp tác hơn.",
      "## Lợi ích",
      "- Chất xơ tự nhiên hỗ trợ bé đi ngoài đều.",
      "- I-ốt cần cho tuyến giáp và sự phát triển trí não.",
      "- Có canxi, sắt, magie và vitamin nhóm B.",
      "## Bé ăn bao nhiêu là vừa?",
      "Bé từ 1 tuổi có thể dùng rong biển ăn liền với lượng nhỏ: khoảng một nhúm (1–2g) rắc lên mỗi bữa, không cần ăn mỗi bữa. Ăn quá nhiều rong biển trong thời gian dài có thể khiến bé nhận quá nhiều i-ốt.",
      "## Chọn loại nào?",
      "- Ưu tiên loại vị nhạt, ít muối, dành riêng cho trẻ em.",
      "- Xem hạn dùng, bao bì kín, có tem phụ tiếng Việt.",
      "- Đã mở gói thì kẹp kín để rong biển không bị ỉu.",
      "![Rong biển Busan trộn cơm cho bé](img/45462512687-2.jpg)",
      "[[sp:45462512687]]",
      "[[sp:41002695070]]",
      "Bé đang có bệnh tuyến giáp thì mẹ hỏi bác sĩ trước khi cho ăn rong biển thường xuyên."
    ]
  },
  {
    "id": "be-cham-tang-can",
    "title": "Bé chậm tăng cân: nguyên nhân thường gặp và cách cải thiện tại nhà",
    "cat": "Chăm con",
    "date": "26/10/2026",
    "read": "6 phút",
    "emoji": "⚖️",
    "color": "#FFF0E0",
    "image": "img/26156646705.jpg",
    "sanPham": [
      "26156646705",
      "25632276959",
      "men-sysy"
    ],
    "excerpt": "Bé đứng cân vài tháng liền, ăn mãi không lớn? Mẹ xem bé có thật sự chậm tăng cân không, các nguyên nhân hay gặp và 5 cách cải thiện.",
    "body": [
      "Trước khi lo lắng, mẹ chấm cân nặng và chiều cao của bé lên biểu đồ tăng trưởng của WHO (trong sổ tiêm chủng). Nếu bé đi đều theo một đường thì vẫn bình thường, dù nhỏ hơn bạn cùng tuổi.",
      "## Nguyên nhân thường gặp",
      "- Bữa ăn ít năng lượng: nhiều canh, nhiều rau, ít đạm và dầu mỡ.",
      "- Uống quá nhiều sữa hoặc nước ngọt nên không ăn được bữa chính.",
      "- Thiếu vi chất như kẽm, sắt khiến bé biếng ăn.",
      "- Rối loạn tiêu hoá, táo bón kéo dài, nhiễm giun.",
      "- Bé hay ốm vặt, mỗi lần ốm lại sụt cân.",
      "## 5 cách cải thiện tại nhà",
      "- Chia 3 bữa chính và 2–3 bữa phụ, mỗi bữa không quá 30 phút.",
      "- Thêm một thìa dầu ăn hoặc bơ vào cháo, bột của bé.",
      "- Ưu tiên đạm: trứng, thịt, cá, đậu phụ trong mọi bữa.",
      "- Tẩy giun định kỳ 6 tháng một lần cho bé từ 2 tuổi.",
      "- Hỗ trợ tiêu hoá bằng men vi sinh, thêm bữa phụ ngọt tự nhiên như nước ép mận.",
      "![Gạc hươu non Sumo hỗ trợ bé chậm lớn](img/26156646705-2.jpg)",
      "[[sp:26156646705]]",
      "[[sp:25632276959]]",
      "Mẹ đưa bé đi khám dinh dưỡng nếu bé đứng cân hoặc sụt cân liên tục trên 3 tháng, hoặc nằm dưới đường thấp nhất của biểu đồ."
    ]
  },
  {
    "id": "sua-de-hay-sua-bo",
    "title": "Sữa dê hay sữa bò: bé tiêu hoá nhạy cảm nên chọn loại nào?",
    "cat": "Dinh dưỡng",
    "date": "23/10/2026",
    "read": "5 phút",
    "emoji": "🐐",
    "color": "#F3E9FF",
    "image": "img/13899935993.jpg",
    "sanPham": [
      "13899935993",
      "19682441455",
      "20992159167",
      "19491505209"
    ],
    "excerpt": "Sữa dê có hạt đạm và hạt béo nhỏ, nhiều bé dễ tiêu hơn. Nhưng bé dị ứng đạm sữa bò thì không nên đổi sang sữa dê. Mẹ cần biết điểm khác nhau này.",
    "body": [
      "Nhiều mẹ chuyển sang sữa dê khi bé hay đầy bụng, táo bón với sữa bò. Hiểu đúng sự khác nhau giúp mẹ chọn được loại hợp với con.",
      "## Sữa dê khác sữa bò thế nào?",
      "- Hạt béo và cục đông đạm của sữa dê nhỏ, mềm hơn, nhiều bé tiêu hoá dễ hơn.",
      "- Hàm lượng canxi, đạm tương đương sữa bò.",
      "- Sữa dê công thức đã được bổ sung vi chất như sữa bò công thức.",
      "## Lưu ý quan trọng",
      "Bé được chẩn đoán dị ứng đạm sữa bò thường cũng phản ứng với sữa dê vì hai loại đạm khá giống nhau. Trường hợp này mẹ cần theo hướng dẫn của bác sĩ, không tự đổi sang sữa dê.",
      "## Gợi ý theo độ tuổi",
      "- Từ 0–36 tháng, bé nhạy cảm: sữa dê Biostime số 1, 2, 3 (Úc).",
      "- Từ 1 tuổi, cần tăng cân, chiều cao: sữa dê Lotte Kid A+ (Hàn Quốc).",
      "- Muốn dùng sữa bò hữu cơ: Biostime Organic (Pháp) hoặc SN-2 Bio Plus (Úc).",
      "![Sữa dê Lotte Kid A+ 760g](img/13899935993-2.jpg)",
      "[[sp:13899935993]]",
      "[[sp:19682441455]]",
      "Khi đổi sữa, mẹ pha xen kẽ sữa cũ và sữa mới trong 5–7 ngày để bé quen dần."
    ]
  },
  {
    "id": "bua-sang-10-phut-cho-be",
    "title": "Bữa sáng 10 phút cho bé đi học: 5 thực đơn đủ chất, mẹ không phải dậy sớm",
    "cat": "Chăm con",
    "date": "20/10/2026",
    "read": "4 phút",
    "emoji": "🍙",
    "color": "#E0F5F2",
    "image": "img/41002695070.jpg",
    "noiBat": true,
    "sanPham": [
      "41002695070",
      "43532388498",
      "suaxanh-lotte",
      "26523206270"
    ],
    "excerpt": "Bỏ bữa sáng khiến bé khó tập trung ở lớp. Năm thực đơn chuẩn bị trong 10 phút với cơm nắm rong biển, granola, sữa tươi – bé ăn ngon, mẹ nhàn.",
    "body": [
      "Bữa sáng nên có đủ ba nhóm: tinh bột cho năng lượng, đạm để no lâu, và sữa hoặc trái cây cho vitamin, canxi. Dưới đây là 5 thực đơn mẹ làm được trong 10 phút.",
      "## Thực đơn gợi ý cho 5 ngày",
      "- Thứ 2: cơm nắm rong biển trứng chiên + 1 hộp sữa tươi.",
      "- Thứ 3: granola trộn sữa chua và chuối.",
      "- Thứ 4: cháo yến mạch thịt bằm rắc rong biển vụn.",
      "- Thứ 5: bánh mì trứng ốp la + 1 hộp sữa tươi + vài miếng táo.",
      "- Thứ 6: cơm trộn rong biển Busan, cá hồi áp chảo, dưa leo.",
      "## Mẹo chuẩn bị nhanh",
      "Nấu sẵn cơm tối hôm trước, sáng chỉ cần hâm nóng rồi trộn rong biển vụn và nắm thành viên. Rong biển Hàn Quốc sấy giòn, vị nhạt nên hợp với bé nhỏ.",
      "![Rong biển vụn Sung Gyung rắc cơm cho bé](img/41002695070-2.jpg)",
      "[[sp:41002695070]]",
      "[[sp:43532388498]]",
      "Một hộp sữa tươi nhỏ là cách bổ sung canxi và đạm nhanh nhất khi bé phải đi học sớm.",
      "[[sp:suaxanh-lotte]]"
    ]
  },
  {
    "id": "hong-sam-cho-tre-may-tuoi",
    "title": "Hồng sâm cho trẻ: bé mấy tuổi dùng được và uống thế nào cho đúng?",
    "cat": "Dinh dưỡng",
    "date": "17/10/2026",
    "read": "4 phút",
    "emoji": "🌱",
    "color": "#FDECEC",
    "image": "img/27355720019.jpg",
    "sanPham": [
      "27355720019",
      "22644617070",
      "47357633686"
    ],
    "excerpt": "Hồng sâm cho trẻ em khác hồng sâm người lớn ở hàm lượng và cách chế biến. Mẹ xem độ tuổi, liều dùng và những lúc nên tạm ngưng.",
    "body": [
      "Hồng sâm dành cho trẻ em được làm từ sâm đã hấp sấy, pha loãng với nước ép trái cây để vị dịu, hàm lượng phù hợp với cơ thể bé. Mẹ tuyệt đối không cho bé uống hồng sâm của người lớn.",
      "## Bé mấy tuổi dùng được?",
      "Mỗi sản phẩm ghi độ tuổi riêng, mẹ đọc kỹ trên hộp:",
      "- Hồng sâm ChuChu: cho bé từ khoảng 1 tuổi, hợp bé hay ốm vặt, biếng ăn.",
      "- Hồng sâm Rich Kid (Kinigini): cho bé 2–15 tuổi, hỗ trợ tập trung khi đi học.",
      "- Sâm Pinkfong Kid Up: cho bé từ 3 tuổi.",
      "![Hồng sâm Rich Kid hộp 10 gói 40ml](img/27355720019-2.jpg)",
      "[[sp:27355720019]]",
      "## Uống thế nào?",
      "- Mỗi ngày 1 gói, uống buổi sáng hoặc trưa sau ăn – tránh uống sát giờ ngủ.",
      "- Có thể để mát cho bé dễ uống hơn.",
      "- Dùng theo đợt (ví dụ 1–2 tháng) rồi nghỉ, theo hướng dẫn của nhà sản xuất.",
      "## Khi nào nên tạm ngưng?",
      "Khi bé đang sốt cao, đang dùng thuốc điều trị hoặc có bệnh mạn tính, mẹ hỏi ý kiến bác sĩ trước khi cho bé dùng tiếp.",
      "[[sp:47357633686]]"
    ]
  },
  {
    "id": "be-hay-om-giao-mua",
    "title": "Bé hay ốm vặt khi giao mùa: 6 việc mẹ nên làm để con khoẻ hơn",
    "cat": "Chăm con",
    "date": "14/10/2026",
    "read": "5 phút",
    "emoji": "🍂",
    "color": "#FFF3D6",
    "image": "img/22644617070.jpg",
    "noiBat": true,
    "sanPham": [
      "22644617070",
      "23660586997",
      "47357633686"
    ],
    "excerpt": "Trời chuyển lạnh, bé đi học về là ho, sổ mũi. Sáu thói quen đơn giản hỗ trợ hệ miễn dịch của con vững vàng hơn trong mùa thu đông.",
    "body": [
      "Trẻ dưới 6 tuổi có thể ốm 6–8 lần mỗi năm vì hệ miễn dịch đang hoàn thiện. Không có cách nào giúp con không bao giờ ốm, nhưng dinh dưỡng và sinh hoạt hợp lý hỗ trợ con khoẻ mạnh và mau lại sức hơn.",
      "## 6 việc mẹ nên làm",
      "- Ngủ đủ giấc: bé 3–5 tuổi cần 10–13 giờ/ngày kể cả giấc trưa.",
      "- Rửa tay bằng xà phòng khi đi học về và trước khi ăn.",
      "- Tiêm chủng đủ mũi, đặc biệt vắc xin cúm hằng năm.",
      "- Ăn đa dạng: đạm, rau củ nhiều màu, trái cây giàu vitamin C.",
      "- Cho bé vận động ngoài trời mỗi ngày, mặc ấm vừa đủ, không ủ quá kín.",
      "- Không tự ý dùng kháng sinh khi bé cảm cúm thông thường.",
      "## Bổ sung khi bé hay ốm",
      "Với bé hay ốm vặt, mới ốm dậy hoặc biếng ăn, nhiều mẹ dùng thêm hồng sâm hoặc nước ép đề kháng theo hướng dẫn của nhà sản xuất.",
      "![Hồng sâm ChuChu cho bé hay ốm vặt, mới ốm dậy](img/22644617070-2.jpg)",
      "[[sp:22644617070]]",
      "[[sp:23660586997]]",
      "Mẹ đưa bé đi khám ngay khi bé sốt trên 39°C, thở nhanh, li bì, bỏ ăn uống hoặc sốt kéo dài quá 3 ngày."
    ]
  },
  {
    "id": "men-vi-sinh-doc-nhan-cfu",
    "title": "Men vi sinh cho bé từ sơ sinh: cách đọc nhãn chủng lợi khuẩn và số CFU",
    "cat": "Tiêu hoá",
    "date": "11/10/2026",
    "read": "4 phút",
    "emoji": "🦠",
    "color": "#EEF8E6",
    "image": "img/men-sysy.jpg",
    "sanPham": [
      "men-sysy"
    ],
    "excerpt": "\"15 tỉ lợi khuẩn, 8 chủng\" nghĩa là gì? Loại nào dùng được cho bé từ 0 tháng? Hướng dẫn mẹ đọc nhãn men vi sinh và pha đúng cách.",
    "body": [
      "Men vi sinh (probiotics) là lợi khuẩn sống. Khi chọn cho bé, mẹ nên nhìn 4 thông tin trên nhãn: độ tuổi, số lợi khuẩn (CFU), số chủng và cách bảo quản.",
      "## 1. Độ tuổi",
      "Bé dưới 2 tuổi nên dùng loại ghi rõ dành cho trẻ sơ sinh. Ví dụ men Sysy Pasteur có hai dòng: Baby (hộp nâu, từ 0 tháng) và Kids (hộp xanh, từ 24 tháng).",
      "## 2. Số lợi khuẩn (CFU)",
      "CFU là số lợi khuẩn sống trong mỗi gói. Số càng cao chưa chắc càng tốt; quan trọng là còn sống đến ruột. Men Sysy Baby có 15,1 tỉ lợi khuẩn, Kids có 16,1 tỉ lợi khuẩn mỗi gói (theo nhà sản xuất).",
      "## 3. Số chủng",
      "Nhiều chủng hỗ trợ nhiều vùng của ruột. Sysy Baby có 8 chủng; Sysy Kids có 7 chủng và bổ sung thêm kẽm 2,55mg, vitamin D 400IU.",
      "![Men vi sinh Sysy Pasteur – Baby 0+ và Kids 24m+](img/men-sysy-2.jpg)",
      "[[sp:men-sysy]]",
      "## 4. Pha và bảo quản",
      "- Pha với nước ấm, sữa hoặc cháo dưới 40°C – nước nóng làm chết lợi khuẩn.",
      "- Cho bé dùng ngay sau khi pha.",
      "- Bảo quản nơi khô mát theo hướng dẫn trên hộp.",
      "Nếu bé tiêu chảy kéo dài, có máu trong phân, sốt cao hoặc bỏ bú, mẹ cần đưa bé đi khám thay vì chỉ dùng men vi sinh."
    ]
  },
  {
    "id": "sale-doi-10-10-deal-doi",
    "title": "10/10 Sale đôi – Deal đôi: quà tặng rộn ràng tại Hương Chất Kids",
    "cat": "Khuyến mãi",
    "date": "09/10/2026",
    "read": "2 phút",
    "emoji": "🎉",
    "color": "#E8EEFF",
    "image": "img/su-kien/1010-poster.jpg",
    "noiBat": true,
    "sanPham": [
      "22686115682",
      "22644617070",
      "26060839019",
      "42878618667",
      "26156646705"
    ],
    "excerpt": "Nhân ngày sale đôi 10/10, Hương có ưu đãi cho Lotte 3 màu, Hồng sâm ChuChu, Canxi váng sữa và Gạc hươu non Sumo. Deal chỉ áp dụng trong ngày 9–10/10.",
    "body": [
      "🎉 10/10 SALE ĐÔI – DEAL ĐÔI. Quà tặng rộn ràng tại HCK đây ba mẹ ơi 🎁",
      "Giai đoạn vàng là lúc mẹ nên chú ý xây nền tảng dinh dưỡng cho con mỗi ngày, từ bữa ăn đa dạng đến những lựa chọn bổ sung phù hợp với nhu cầu của bé.",
      "Nhân ngày sale đôi 10/10, Hương có ưu đãi cho các dòng sản phẩm để mẹ vừa tham khảo giải pháp dinh dưỡng, vừa tranh thủ nhận quà nhé!",
      "![Sale 10.10 – Chốt đơn rinh quà tại Hương Chất Kids](img/su-kien/1010-poster.jpg)",
      "## 🥤 Lotte 3 màu: Mua 3 tặng 1",
      "Thêm lựa chọn nước dinh dưỡng từ trái cây vào thực đơn hằng ngày của bé.",
      "- Mua 1 thùng tặng 5 gói.",
      "- Mua 2 thùng tặng 10 gói.",
      "[[sp:22686115682]]",
      "## 🐻 Hồng sâm ChuChu: Mua 3 thùng tặng quà",
      "Lựa chọn bổ sung hồng sâm cho bé theo độ tuổi phù hợp, hỗ trợ tăng cường đề kháng.",
      "[[sp:22644617070]]",
      "## 🥛 Canxi váng sữa: Mua 2 tặng 1 D3K2",
      "Hỗ trợ bổ sung canxi và dưỡng chất đồng hành cùng quá trình phát triển hệ xương.",
      "- Mua 2 hộp tặng 1 D3K2.",
      "- Mua 3 hộp tặng 2 D3K2.",
      "- Mua 4 hộp tặng 3 D3K2.",
      "[[sp:26060839019]]",
      "[[sp:42878618667]]",
      "## 🦌 Gạc hươu non Sumo",
      "- Mua 1 thùng giảm 5%.",
      "- Mua 2 thùng giảm 5% + tặng 10 gói.",
      "- Mua 3 thùng giảm 5% + tặng 20 gói.",
      "[[sp:26156646705]]",
      "## ⏰ Chỉ trong ngày 9–10/10",
      "Deal sale đôi chỉ áp dụng trong ngày 9–10/10! Mẹ nhắn Hương liền tay để xem giá và chọn sản phẩm phù hợp với độ tuổi, nhu cầu của con nhé.",
      "Chăm con là hành trình mỗi ngày, còn ưu đãi tốt thì không phải lúc nào cũng có, mẹ tranh thủ hôm nay để không bỏ lỡ nha."
    ]
  },
  {
    "id": "uong-canxi-luc-nao-cho-be",
    "title": "Bé uống canxi lúc nào thì hấp thu tốt? Vì sao nên dùng kèm D3K2",
    "cat": "Vitamin",
    "date": "08/10/2026",
    "read": "5 phút",
    "emoji": "🦴",
    "color": "#E8F4FF",
    "image": "img/26060839019.jpg",
    "noiBat": true,
    "sanPham": [
      "26060839019",
      "42878618667",
      "combo-vangsua-d3k2"
    ],
    "excerpt": "Uống canxi đúng giờ, đúng liều và có đủ vitamin D3, K2 thì canxi mới vào xương. Mẹ xem nhu cầu canxi theo tuổi và lịch uống gợi ý trong bài.",
    "body": [
      "Canxi là khoáng chất chính tạo nên xương và răng. Nhưng uống canxi nhiều chưa chắc đã tốt: cơ thể chỉ hấp thu một phần, và cần vitamin D3, K2 để đưa canxi vào đúng chỗ.",
      "## Bé cần bao nhiêu canxi mỗi ngày?",
      "- 1–3 tuổi: khoảng 700mg/ngày.",
      "- 4–8 tuổi: khoảng 1.000mg/ngày.",
      "- 9–18 tuổi: khoảng 1.300mg/ngày – giai đoạn dậy thì cần nhiều nhất.",
      "Phần lớn lượng này nên đến từ bữa ăn: sữa, sữa chua, phô mai, tôm cua, đậu phụ, rau xanh đậm. Canxi bổ sung chỉ bù phần còn thiếu.",
      "## Uống lúc nào?",
      "- Buổi sáng hoặc đầu giờ chiều, sau bữa ăn khoảng 30 phút.",
      "- Chia nhỏ nếu liều lớn: cơ thể hấp thu tốt nhất từng lượng nhỏ.",
      "- Không uống cùng lúc với viên sắt; nên cách nhau khoảng 2 giờ.",
      "## Vì sao cần D3 và K2?",
      "Vitamin D3 hỗ trợ ruột hấp thu canxi; vitamin K2 (MK7) hỗ trợ đưa canxi vào xương. Trẻ dưới 12 tháng cần khoảng 400IU vitamin D mỗi ngày, trẻ lớn hơn khoảng 600IU, đặc biệt khi bé ít ra nắng.",
      "![Váng sữa canxi Calciumore dạng gói, bé dễ uống](img/26060839019-2.jpg)",
      "[[sp:26060839019]]",
      "[[sp:42878618667]]",
      "Mẹ muốn tiện hơn có thể chọn combo váng sữa canxi + D3K2, mua cùng lúc được giá tốt hơn mua lẻ.",
      "[[sp:combo-vangsua-d3k2]]"
    ]
  },
  {
    "id": "nuoc-ep-lotte-chon-loai-nao",
    "title": "Nước ép Lotte Tăng cân, Tăng cao hay Đề kháng – mẹ chọn loại nào cho con?",
    "cat": "Dinh dưỡng",
    "date": "05/10/2026",
    "read": "5 phút",
    "emoji": "🧃",
    "color": "#FFE9EF",
    "image": "img/41353214697.jpg",
    "noiBat": true,
    "sanPham": [
      "25632276959",
      "41353214697",
      "23660586997",
      "22686115682"
    ],
    "excerpt": "Ba dòng nước ép hữu cơ Lotte có thành phần và độ tuổi dùng khác nhau. Chuyên gia dinh dưỡng Hương Chất Kids giúp mẹ chọn đúng loại theo nhu cầu của bé.",
    "body": [
      "Nước ép hữu cơ Lotte (Hàn Quốc) là món bé dễ uống nhất trong nhóm dinh dưỡng bổ sung: gói nhỏ có ống hút hoặc nắp vặn, vị trái cây tự nhiên. Nhưng mỗi dòng có thành phần riêng, mẹ nên chọn theo điều bé đang cần.",
      "## Dòng Tăng Cân – Ăn Ngon (mận, nho, táo)",
      "Theo nhà sản xuất, dòng này dùng 99,94% nguyên liệu hữu cơ, có mận hỗ trợ nhuận tràng. Phù hợp bé biếng ăn, đi ngoài khó, cần bữa phụ ngọt tự nhiên thay bánh kẹo.",
      "[[sp:25632276959]]",
      "## Dòng Tăng Cao (táo, củ dền)",
      "Dùng được cho bé từ 6 tháng – hợp giai đoạn ăn dặm. Nhà sản xuất bổ sung canxi, sắt và axit folic. Đây là lựa chọn của nhiều mẹ có con đang tuổi lớn nhanh hoặc bước vào dậy thì.",
      "![Nước ép Lotte Tăng Cao vị táo & củ dền](img/41353214697-2.jpg)",
      "[[sp:41353214697]]",
      "## Dòng Đề Kháng – Khoẻ Mạnh (lê, rễ cát cánh)",
      "Dùng cho bé từ 12 tháng. Theo nhà sản xuất, lê và rễ cát cánh hữu cơ kết hợp hồng sâm cô đặc và lợi khuẩn EPS, hợp với bé hay ốm vặt khi giao mùa, đi nhà trẻ.",
      "[[sp:23660586997]]",
      "## Uống bao nhiêu là đủ?",
      "- Bé 1–3 tuổi: 1 gói/ngày, uống sau bữa chính hoặc làm bữa phụ.",
      "- Bé từ 3 tuổi: 1–2 gói/ngày, không thay bữa chính hay sữa.",
      "- Ngon hơn khi để mát; đã mở thì uống hết trong ngày.",
      "Nếu chưa biết chọn dòng nào, mẹ có thể lấy thùng mix vị để bé thử và tự chọn vị mình thích. Đơn hàng từ 1 triệu còn được shop tặng thêm gói nước ép Lotte."
    ]
  },
  {
    "id": "chon-dinh-duong-theo-thang-tuoi",
    "sanPham": [
      "41353214697",
      "42878618667",
      "22644617070"
    ],
    "title": "Bé mấy tháng thì dùng được nước ép, hồng sâm, D3K2? Lộ trình bổ sung theo độ tuổi",
    "cat": "Dinh dưỡng",
    "date": "12/09/2026",
    "read": "5 phút",
    "emoji": "🍼",
    "color": "#FFE9EF",
    "image": "img/thumb/22686115682.jpg",
    "excerpt": "Không phải sản phẩm nào cũng dùng được cho bé sơ sinh. Chuyên gia dinh dưỡng Hương Chất Kids gợi ý lộ trình bổ sung an toàn theo từng mốc tuổi.",
    "body": [
      "0–6 tháng: sữa mẹ (hoặc sữa công thức) là nguồn dinh dưỡng chính. Chỉ nên bổ sung vitamin D3 (có thể kèm K2) dạng nhỏ giọt theo khuyến cáo 400IU/ngày; không dùng nước ép, hồng sâm hay thực phẩm bổ sung khác.",
      "6–12 tháng: bắt đầu ăn dặm. Có thể tập cho bé nước ép hoa quả – rau củ hữu cơ loại dành cho bé từ 6 tháng (pha loãng, 1/2 gói/ngày), rong biển vụn rắc cháo với lượng nhỏ.",
      "1–3 tuổi: bé hay ốm vặt khi đi nhà trẻ. Hồng sâm cho trẻ em, váng sữa canxi, D3K2 có thể dùng theo liều trên bao bì; ưu tiên sản phẩm ghi rõ độ tuổi.",
      "3–6 tuổi và tiểu học: giai đoạn tăng chiều cao nhanh, chú ý canxi + D3K2 + vận động; bé biếng ăn có thể cân nhắc gạc hươu, kẽm.",
      "Nguyên tắc chung: đọc kỹ độ tuổi trên bao bì, không dùng cùng lúc nhiều sản phẩm cùng công dụng, ngưng và hỏi bác sĩ nếu bé dị ứng. Chuyên gia dinh dưỡng Hương Chất Kids tư vấn miễn phí qua Zalo trước khi mẹ đặt hàng."
    ]
  },
  {
    "id": "vitamin-d3-k2-cho-be",
    "sanPham": [
      "42878618667",
      "combo-vangsua-d3k2"
    ],
    "title": "Vitamin D3 K2: vì sao bé cần bổ sung ngay từ sơ sinh?",
    "cat": "Vitamin",
    "date": "08/09/2026",
    "read": "4 phút",
    "emoji": "☀️",
    "color": "#FFF3D6",
    "image": "img/thumb/42878618667.jpg",
    "excerpt": "Theo Viện Dinh dưỡng Quốc gia, tỷ lệ trẻ em Việt Nam thiếu vitamin D còn cao. Cùng tìm hiểu liều 400IU/ngày và cách nhỏ D3 K2 đúng cho bé.",
    "body": [
      "Vitamin D3 hỗ trợ cơ thể hấp thu canxi từ ruột, còn vitamin K2 (MK7) dẫn canxi vào đúng xương thay vì lắng đọng ở mạch máu, thận.",
      "Bộ Y tế khuyến cáo bổ sung 400IU vitamin D/ngày cho trẻ từ sơ sinh, đặc biệt trẻ bú mẹ hoàn toàn.",
      "Nên nhỏ D3 K2 vào buổi sáng, sau ăn để hấp thu tốt nhất. Kết hợp tắm nắng nhẹ 10–15 phút trước 9h sáng.",
      "Dấu hiệu thiếu vitamin D: bé hay quấy khóc đêm, ra mồ hôi trộm, rụng tóc vành khăn, chậm mọc răng, chậm biết đi."
    ]
  },
  {
    "id": "be-bieng-an",
    "sanPham": [
      "26156646705",
      "22644617070"
    ],
    "title": "Bé biếng ăn: 7 sai lầm mẹ hay mắc và cách khắc phục",
    "cat": "Chăm con",
    "date": "03/09/2026",
    "read": "6 phút",
    "emoji": "🥄",
    "color": "#E0F5F2",
    "image": "img/thumb/26156646705.jpg",
    "excerpt": "Ép ăn, cho xem tivi khi ăn, bữa ăn kéo dài quá 30 phút… là những thói quen khiến bé càng sợ ăn. Cùng xem cách sửa.",
    "body": [
      "Biếng ăn ở trẻ có thể do sinh lý (mọc răng, tập đi), bệnh lý (thiếu kẽm, thiếu sắt, rối loạn tiêu hoá) hoặc tâm lý (bị ép ăn).",
      "Sai lầm phổ biến: ép ăn, cho ăn vặt sát bữa chính, bữa ăn quá 30 phút, cho bé xem điện thoại khi ăn, thay đổi món liên tục, cho uống sữa quá nhiều, so sánh bé với trẻ khác.",
      "Giải pháp: cho bé tự xúc, ăn cùng gia đình, tạo không khí vui vẻ, bổ sung kẽm/lysine nếu thiếu, đưa bé đi khám nếu biếng ăn kéo dài trên 1 tháng kèm sụt cân."
    ]
  },
  {
    "id": "tang-chieu-cao-tuoi-day-thi",
    "sanPham": [
      "26060839019",
      "41353214697",
      "42878618667"
    ],
    "title": "Giai đoạn vàng tăng chiều cao: mẹ đừng bỏ lỡ tuổi 10–16",
    "cat": "Tuổi teen",
    "date": "28/08/2026",
    "read": "5 phút",
    "emoji": "📏",
    "color": "#F3E9FF",
    "image": "img/thumb/26060839019.jpg",
    "excerpt": "Tuổi dậy thì là cơ hội cuối để con tăng 8–12cm/năm. Dinh dưỡng, giấc ngủ và vận động nào hỗ trợ con phát triển chiều cao tốt?",
    "body": [
      "Trước khi sụn tăng trưởng đóng lại (khoảng 16–18 tuổi ở nữ, 18–20 tuổi ở nam), con có thể tăng 8–12cm mỗi năm trong giai đoạn dậy thì.",
      "Dinh dưỡng: đủ canxi (1.000–1.300mg/ngày), vitamin D3, K2, kẽm, đạm chất lượng. Sữa tươi 500ml/ngày là nguồn canxi dễ hấp thu nhất.",
      "Giấc ngủ: 90% hormone tăng trưởng tiết ra khi ngủ sâu, con nên ngủ trước 22h và đủ 8–9 tiếng.",
      "Vận động: bơi, bóng rổ, nhảy dây, xà đơn 30–60 phút/ngày."
    ]
  },
  {
    "id": "men-vi-sinh-khi-nao",
    "sanPham": [
      "men-sysy"
    ],
    "title": "Khi nào bé cần men vi sinh? Phân biệt men vi sinh và men tiêu hoá",
    "cat": "Tiêu hoá",
    "date": "20/08/2026",
    "read": "4 phút",
    "emoji": "🌿",
    "color": "#EEF8E6",
    "image": "img/thumb/45462512687.jpg",
    "excerpt": "Nhiều mẹ nhầm men vi sinh với men tiêu hoá. Dùng sai có thể khiến bé phụ thuộc. Chuyên gia dinh dưỡng giải thích rõ.",
    "body": [
      "Men vi sinh (probiotics) là lợi khuẩn sống, hỗ trợ cân bằng hệ vi sinh đường ruột – dùng khi bé táo bón, tiêu chảy, sau kháng sinh, khóc dạ đề.",
      "Men tiêu hoá là enzyme giúp phân giải thức ăn – chỉ dùng ngắn ngày khi bé thiếu enzyme, theo chỉ định bác sĩ.",
      "Chọn men vi sinh có chủng được nghiên cứu (L. reuteri DSM 17938, B. infantis…), dùng cách kháng sinh 2 tiếng, pha với nước/sữa nguội dưới 40°C."
    ]
  },
  {
    "id": "phan-biet-hang-chinh-hang",
    "title": "Cách kiểm tra hàng Hàn Quốc nhập khẩu chính hãng trước khi cho bé dùng",
    "cat": "Mua sắm",
    "date": "15/08/2026",
    "read": "3 phút",
    "emoji": "🔍",
    "color": "#EAF0FF",
    "image": "img/thumb/22644617070.jpg",
    "excerpt": "Kiểm tra tem phụ, mã QR, số lô, hạn dùng… 5 bước đơn giản để mẹ tự kiểm tra sản phẩm trước khi cho con dùng.",
    "body": [
      "1. Tem phụ tiếng Việt: ghi rõ nhà nhập khẩu, số công bố, hạn dùng.",
      "2. Mã QR/mã vạch: quét được thông tin sản phẩm trùng với hộp.",
      "3. Bao bì: seal, nắp nguyên vẹn, không móp rách; hạn dùng còn dài.",
      "4. Chữ Hàn trên bao bì rõ nét, in sắc; hàng giả thường mờ, sai chính tả.",
      "5. Hoá đơn: yêu cầu hoá đơn VAT khi mua – Hương Chất Kids xuất hoá đơn cho mọi đơn hàng."
    ]
  }
];
/* ===/ADMIN:POSTS=== */

/* Đường dẫn bài cẩm nang có từ khoá: huongchatkids.vn/<slug> (slug = mã bài). Trùng link sản phẩm / tên trang thì thêm "cam-nang-" phía trước.
   Máy chủ VPS dựng sẵn nội dung bài theo bảng này; link cũ blog.html?id=… tự chuyển sang link mới. */
(function () {
  var TRANG = ['index', 'product', 'collections', 'cart', 'checkout', 'account', 'admin', 'blog', 'policy', 'gioi-thieu', 'do-chi-so-cho-be', 'doi-tac', 'diem-danh', 'vi-voucher', 'quen-mat-khau', 'quan-ly-ton-kho', 'css', 'js', 'img', 'data', 'tools', 'api', 'chat-tep', 'webp', 'lich-trinh', '2010', 'sitemap', 'robots'];
  var spTheoSlug = window.SP_THEO_SLUG || {}, bySlug = {}, byId = {};
  (window.POSTS || []).forEach(function (p) {
    var s = window.taoSlug(p.id) || window.taoSlug(p.title);
    if (spTheoSlug[s] != null || bySlug[s] || TRANG.indexOf(s) > -1) s = 'cam-nang-' + s;
    bySlug[s] = p.id; byId[p.id] = s;
  });
  window.BAI_SLUG = byId; window.BAI_THEO_SLUG = bySlug;
})();

/* =====================================================================
   QUÀ TẶNG KÈM – web tự tính và tự thêm quà vào đơn hàng
   Hai chương trình KHÔNG áp dụng song song: web lấy chương trình tặng nhiều quà hơn.
   KHÁCH VIP (đã lên hạng, đang được chiết khấu %) nhận chiết khấu thay cho quà tặng.
     1) donTu  : đơn hàng (KHÔNG tính nước dinh dưỡng Lotte) từ 1.000.000đ → tặng 5 gói
     2) thung  : mua thùng nước dinh dưỡng Lotte → 1 thùng 5 gói, 2 thùng 10 gói, từ 3 thùng 20 gói
   ===================================================================== */
/* ===ADMIN:QUA_TANG=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong) */
window.QUA_TANG = {
  "enabled": true,
  "ketHop": {
    "hangMa": true,
    "quaMa": false,
    "quaHang": true,
    "quaShip": true
  },
  "ten": "gói nước ép Lotte",
  "vi": [
    "Hồng – Tăng cân tự nhiên",
    "Cam – Đề kháng"
  ],
  "donTu": {
    "muc": 1000000,
    "soQua": 5,
    "chiKhachMoi": true
  },
  "thungChiKhachMoi": false,
  "thung": [
    {
      "tu": 1,
      "soQua": 5
    },
    {
      "tu": 2,
      "soQua": 10
    },
    {
      "tu": 3,
      "soQua": 20
    }
  ],
  "loc": {
    "cat": "nuoc-ep",
    "brand": "lotte"
  },
  "tuKhoaThung": "thùng",
  "chuongTrinh": [
    {
      "id": "ct-calciumore-d3k2",
      "ten": "Canxi Calciumore mua 2–4 hộp tặng D3K2",
      "batDau": "2026-10-05T00:00",
      "ketThuc": "2026-12-31T23:59",
      "kieu": "soLuong",
      "donVi": "hộp",
      "tenQua": "lọ D3K2",
      "bac": [
        {
          "muc": 2,
          "soQua": 1
        },
        {
          "muc": 3,
          "soQua": 2
        },
        {
          "muc": 4,
          "soQua": 3
        }
      ],
      "muc": 2,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "26060839019",
          "bat": true,
          "heSo": {
            "30 gói (không hộp)": 0,
            "1 hộp 90 gói": 1,
            "2 hộp váng sữa": 2,
            "3 hộp váng sữa": 3,
            "4 hộp váng sữa": 4,
            "1 hộp váng sữa canxi+1 d3k2 giảm 5%": 0
          }
        }
      ],
      "quaTang": [
        {
          "id": "42878618667",
          "bienThe": {
            "1 lọ": true,
            "2 lọ": false
          }
        }
      ]
    },
    {
      "id": "ct-1010-lotte",
      "ten": "10.10 · Nước ép Lotte mua thùng tặng gói",
      "suKien": "1010",
      "batDau": "2026-10-10T00:00",
      "ketThuc": "2026-10-11T00:00",
      "kieu": "soLuong",
      "donVi": "thùng",
      "tenQua": "gói nước ép Lotte",
      "bac": [
        {
          "muc": 1,
          "soQua": 5
        },
        {
          "muc": 2,
          "soQua": 10
        }
      ],
      "muc": 1,
      "soQua": 5,
      "sanPhamChinh": [
        {
          "id": "22686115682",
          "bat": true,
          "heSo": {
            "Xanh – Táo & Củ dền · 10 gói": 0,
            "Hồng – Nho & Mận · 10 gói": 0,
            "Cam – Lê & Hoa chuông · 10 gói": 0,
            "Xanh – Táo & Củ dền · Thùng 30 gói": 1,
            "Hồng – Nho & Mận · Thùng 30 gói": 1,
            "Cam – Lê & Hoa chuông · Thùng 30 gói": 1,
            "Mix vị · Thùng 30 gói": 1
          }
        },
        {
          "id": "41353214697",
          "bat": true,
          "heSo": {
            "Hộp 10 gói": 0,
            "Thùng 30 gói (3 hộp)": 1
          }
        },
        {
          "id": "25632276959",
          "bat": true,
          "heSo": {
            "Hộp 10 gói": 0,
            "Thùng 30 gói (3 hộp)": 1
          }
        },
        {
          "id": "23660586997",
          "bat": true,
          "heSo": {
            "Hộp 10 gói": 0,
            "Thùng 30 gói (3 hộp)": 1
          }
        }
      ],
      "quaTang": [
        {
          "ten": "Hồng – Tăng cân tự nhiên",
          "gia": 44800
        },
        {
          "ten": "Cam – Đề kháng",
          "gia": 44800
        }
      ]
    },
    {
      "id": "ct-1010-chuchu",
      "ten": "10.10 · Hồng sâm ChuChu mua 3 thùng tặng 20 gói",
      "suKien": "1010",
      "batDau": "2026-10-10T00:00",
      "ketThuc": "2026-10-11T00:00",
      "kieu": "soLuong",
      "donVi": "thùng",
      "tenQua": "phần 20 gói hồng sâm ChuChu",
      "bac": [
        {
          "muc": 3,
          "soQua": 1
        },
        {
          "muc": 6,
          "soQua": 2
        }
      ],
      "muc": 3,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "22644617070",
          "bat": true,
          "heSo": {
            "Việt quất – nho · 10 gói": 0,
            "Táo lê · 10 gói": 0,
            "Mix vị · 10 gói": 0,
            "Mix vị · 20 gói (nửa thùng)": 0.5,
            "Táo lê · 20 gói (nửa thùng)": 0.5,
            "Việt quất – nho · 20 gói (nửa thùng)": 0.5,
            "Mix vị · 40 gói (1 thùng)": 1,
            "Việt quất – nho · 40 gói (1 thùng)": 1,
            "Táo lê · 40 gói (1 thùng)": 1
          }
        }
      ],
      "quaTang": [
        {
          "id": "22644617070",
          "bienThe": {
            "Việt quất – nho · 10 gói": false,
            "Táo lê · 10 gói": false,
            "Mix vị · 10 gói": false,
            "Mix vị · 20 gói (nửa thùng)": true,
            "Táo lê · 20 gói (nửa thùng)": true,
            "Việt quất – nho · 20 gói (nửa thùng)": true,
            "Mix vị · 40 gói (1 thùng)": false,
            "Việt quất – nho · 40 gói (1 thùng)": false,
            "Táo lê · 40 gói (1 thùng)": false
          }
        }
      ]
    },
    {
      "id": "ct-1010-calciumore",
      "ten": "10.10 · Canxi Calciumore mua 2–4 hộp tặng D3K2",
      "suKien": "1010",
      "batDau": "2026-10-10T00:00",
      "ketThuc": "2026-10-11T00:00",
      "kieu": "soLuong",
      "donVi": "hộp",
      "tenQua": "lọ D3K2",
      "bac": [
        {
          "muc": 2,
          "soQua": 1
        },
        {
          "muc": 3,
          "soQua": 2
        },
        {
          "muc": 4,
          "soQua": 3
        }
      ],
      "muc": 2,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "26060839019",
          "bat": true,
          "heSo": {
            "30 gói (không hộp)": 0,
            "1 hộp 90 gói": 1,
            "2 hộp váng sữa": 2,
            "3 hộp váng sữa": 3,
            "4 hộp váng sữa": 4,
            "1 hộp váng sữa canxi+1 d3k2 giảm 5%": 0
          }
        }
      ],
      "quaTang": [
        {
          "id": "42878618667",
          "bienThe": {
            "1 lọ": true,
            "2 lọ": false
          }
        }
      ]
    },
    {
      "id": "ct-2010-mp-5tr",
      "ten": "20/10 · Mỹ phẩm đơn từ 5 triệu tặng 1 hộp mặt nạ NMN",
      "batDau": "2026-10-18T00:00",
      "ketThuc": "2026-10-21T00:00",
      "kieu": "tien",
      "tenQua": "hộp mặt nạ NMN Kousa",
      "bac": [
        {
          "muc": 5000000,
          "soQua": 1
        }
      ],
      "muc": 5000000,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "cap-kem-nen-eclat",
          "bat": true
        },
        {
          "id": "kem-exosome-toneup",
          "bat": true
        },
        {
          "id": "49061985399",
          "bat": true
        },
        {
          "id": "48112514210",
          "bat": true
        },
        {
          "id": "57413220644",
          "bat": true
        },
        {
          "id": "57903449970",
          "bat": true
        },
        {
          "id": "51013054442",
          "bat": true
        },
        {
          "id": "24767149051",
          "bat": true
        },
        {
          "id": "50002678694",
          "bat": true
        },
        {
          "id": "24465090622",
          "bat": true
        },
        {
          "id": "57556697426",
          "bat": true
        },
        {
          "id": "24015142248",
          "bat": true
        },
        {
          "id": "24764883120",
          "bat": true
        },
        {
          "id": "24015583018",
          "bat": true
        },
        {
          "id": "28902157429",
          "bat": true
        },
        {
          "id": "26800350417",
          "bat": true
        },
        {
          "id": "27734205778",
          "bat": true
        },
        {
          "id": "25678530796",
          "bat": true
        },
        {
          "id": "29006040615",
          "bat": true
        },
        {
          "id": "27809051612",
          "bat": true
        },
        {
          "id": "24329101823",
          "bat": true
        },
        {
          "id": "26900366084",
          "bat": true
        },
        {
          "id": "56857599724",
          "bat": true
        },
        {
          "id": "28806784125",
          "bat": true
        },
        {
          "id": "hexacare",
          "bat": true
        }
      ],
      "quaTang": [
        {
          "id": "24015583018",
          "bienThe": {
            "1 hộp": true,
            "2 hộp": false
          }
        }
      ]
    },
    {
      "id": "ct-2010-mp-10tr",
      "ten": "20/10 · Mỹ phẩm đơn từ 10 triệu tặng son Filler (hoặc giảm 5%)",
      "batDau": "2026-10-18T00:00",
      "ketThuc": "2026-10-21T00:00",
      "kieu": "tien",
      "tenQua": "son Filler RVB LAB",
      "hoacGiam": 5,
      "bac": [
        {
          "muc": 10000000,
          "soQua": 1
        }
      ],
      "muc": 10000000,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "cap-kem-nen-eclat",
          "bat": true
        },
        {
          "id": "kem-exosome-toneup",
          "bat": true
        },
        {
          "id": "49061985399",
          "bat": true
        },
        {
          "id": "48112514210",
          "bat": true
        },
        {
          "id": "57413220644",
          "bat": true
        },
        {
          "id": "57903449970",
          "bat": true
        },
        {
          "id": "51013054442",
          "bat": true
        },
        {
          "id": "24767149051",
          "bat": true
        },
        {
          "id": "50002678694",
          "bat": true
        },
        {
          "id": "24465090622",
          "bat": true
        },
        {
          "id": "57556697426",
          "bat": true
        },
        {
          "id": "24015142248",
          "bat": true
        },
        {
          "id": "24764883120",
          "bat": true
        },
        {
          "id": "24015583018",
          "bat": true
        },
        {
          "id": "28902157429",
          "bat": true
        },
        {
          "id": "26800350417",
          "bat": true
        },
        {
          "id": "27734205778",
          "bat": true
        },
        {
          "id": "25678530796",
          "bat": true
        },
        {
          "id": "29006040615",
          "bat": true
        },
        {
          "id": "27809051612",
          "bat": true
        },
        {
          "id": "24329101823",
          "bat": true
        },
        {
          "id": "26900366084",
          "bat": true
        },
        {
          "id": "56857599724",
          "bat": true
        },
        {
          "id": "28806784125",
          "bat": true
        },
        {
          "id": "hexacare",
          "bat": true
        }
      ],
      "quaTang": [
        {
          "id": "57556697426",
          "bienThe": {
            "1 cây": true,
            "2 cây": false
          }
        }
      ]
    },
    {
      "id": "ct-2010-mp-15tr",
      "ten": "20/10 · Mỹ phẩm đơn từ 15 triệu tặng nồi luộc gà (hoặc giảm 5%)",
      "batDau": "2026-10-18T00:00",
      "ketThuc": "2026-10-21T00:00",
      "kieu": "tien",
      "tenQua": "nồi luộc gà inox Ciwete Royal Knight 28cm",
      "hoacGiam": 5,
      "bac": [
        {
          "muc": 15000000,
          "soQua": 1
        }
      ],
      "muc": 15000000,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "cap-kem-nen-eclat",
          "bat": true
        },
        {
          "id": "kem-exosome-toneup",
          "bat": true
        },
        {
          "id": "49061985399",
          "bat": true
        },
        {
          "id": "48112514210",
          "bat": true
        },
        {
          "id": "57413220644",
          "bat": true
        },
        {
          "id": "57903449970",
          "bat": true
        },
        {
          "id": "51013054442",
          "bat": true
        },
        {
          "id": "24767149051",
          "bat": true
        },
        {
          "id": "50002678694",
          "bat": true
        },
        {
          "id": "24465090622",
          "bat": true
        },
        {
          "id": "57556697426",
          "bat": true
        },
        {
          "id": "24015142248",
          "bat": true
        },
        {
          "id": "24764883120",
          "bat": true
        },
        {
          "id": "24015583018",
          "bat": true
        },
        {
          "id": "28902157429",
          "bat": true
        },
        {
          "id": "26800350417",
          "bat": true
        },
        {
          "id": "27734205778",
          "bat": true
        },
        {
          "id": "25678530796",
          "bat": true
        },
        {
          "id": "29006040615",
          "bat": true
        },
        {
          "id": "27809051612",
          "bat": true
        },
        {
          "id": "24329101823",
          "bat": true
        },
        {
          "id": "26900366084",
          "bat": true
        },
        {
          "id": "56857599724",
          "bat": true
        },
        {
          "id": "28806784125",
          "bat": true
        },
        {
          "id": "hexacare",
          "bat": true
        }
      ],
      "quaTang": [
        {
          "ten": "Nồi luộc gà inox Ciwete Royal Knight 28cm (trị giá 1.790.000đ)",
          "gia": 1790000
        }
      ]
    },
    {
      "id": "ct-2010-bo-xuyen-tieu",
      "congDon": true,
      "tenSP": "Bò xuyên tiêu",
      "ten": "20/10 · Mua Bò xuyên tiêu tặng chai sốt xào / sốt nướng",
      "batDau": "2026-10-18T00:00",
      "ketThuc": "2026-10-21T00:00",
      "kieu": "soLuong",
      "donVi": "gói",
      "tenQua": "chai sốt (xào hoặc nướng)",
      "bac": [
        {
          "muc": 1,
          "soQua": 1
        },
        {
          "muc": 2,
          "soQua": 2
        },
        {
          "muc": 3,
          "soQua": 3
        },
        {
          "muc": 4,
          "soQua": 4
        },
        {
          "muc": 5,
          "soQua": 5
        },
        {
          "muc": 6,
          "soQua": 6
        }
      ],
      "muc": 1,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "bo-xuyen-tieu",
          "bat": true,
          "heSo": {
            "1 gói 200g": 1,
            "2 gói": 2
          }
        }
      ],
      "quaTang": [
        {
          "ten": "Sốt xào",
          "gia": 1
        },
        {
          "ten": "Sốt nướng",
          "gia": 1
        }
      ]
    },
    {
      "id": "ct-2110-gac-sumo",
      "ten": "Kid · Gạc Sumo / Gạc canxi mua thùng 40 gói tặng 1 hộp Lotte 10 gói",
      "batDau": "2026-10-21T00:00",
      "ketThuc": "2027-12-31T23:59",
      "kieu": "soLuong",
      "donVi": "thùng",
      "tenQua": "hộp nước dinh dưỡng Lotte 10 gói",
      "nhuongHang": true,
      "bac": [
        {
          "muc": 1,
          "soQua": 1
        },
        {
          "muc": 2,
          "soQua": 2
        },
        {
          "muc": 3,
          "soQua": 3
        },
        {
          "muc": 4,
          "soQua": 4
        },
        {
          "muc": 5,
          "soQua": 5
        }
      ],
      "muc": 1,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "26156646705",
          "bat": true,
          "heSo": {
            "10 gói": 0,
            "20 gói": 0,
            "30 gói": 0,
            "Thùng 40 gói": 1
          }
        },
        {
          "id": "gac-canxi-sumo",
          "bat": true,
          "heSo": {
            "Hộp 10 gói": 0,
            "Thùng 30 gói": 0,
            "Thùng 40 gói": 1
          }
        }
      ],
      "quaTang": [
        {
          "id": "22686115682",
          "bienThe": {
            "Xanh – Táo & Củ dền · 10 gói": true,
            "Hồng – Nho & Mận · 10 gói": true,
            "Cam – Lê & Hoa chuông · 10 gói": true,
            "Xanh – Táo & Củ dền · Thùng 30 gói": false,
            "Hồng – Nho & Mận · Thùng 30 gói": false,
            "Cam – Lê & Hoa chuông · Thùng 30 gói": false,
            "Mix vị · Thùng 30 gói": false
          }
        }
      ]
    },
    {
      "id": "ct-2110-meso-bac",
      "ten": "MP · Bộ 3 Meso bạc (cặp serum + kem + peel Anubis) tặng 1 hộp mặt nạ NMN",
      "batDau": "2026-10-21T00:00",
      "ketThuc": "2027-12-31T23:59",
      "kieu": "bo",
      "donVi": "bộ",
      "tenQua": "hộp mặt nạ NMN Kousa",
      "nhuongHang": true,
      "lyDo": "Mua bộ 3 Meso bạc (cặp serum + kem Meso bạc và bộ peel Anubis)",
      "moTa": "Mua bộ 3 Meso bạc (cặp serum + kem Meso bạc + bộ peel Anubis) tặng 1 hộp mặt nạ NMN, không áp dụng giảm giá",
      "bac": [
        {
          "muc": 1,
          "soQua": 1
        },
        {
          "muc": 2,
          "soQua": 2
        }
      ],
      "muc": 1,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "29006040615",
          "bat": true,
          "heSo": {
            "Cặp tất bạc (serum + kem)": 1,
            "Serum Meso bạc": 0,
            "Kem dưỡng Meso bạc": 0
          }
        },
        {
          "id": "24764883120",
          "bat": true,
          "heSo": {
            "1 bộ": 1,
            "2 bộ": 2
          }
        }
      ],
      "quaTang": [
        {
          "id": "24015583018",
          "bienThe": {
            "1 hộp": true,
            "2 hộp": false
          }
        }
      ]
    },
    {
      "id": "ct-2110-mp-10tr",
      "ten": "MP · Mỹ phẩm từ 10 triệu: giảm 5% hoặc chọn 1 quà",
      "batDau": "2026-10-21T00:00",
      "ketThuc": "2027-12-31T23:59",
      "kieu": "tien",
      "tenQua": "quà (Toner C hoặc 2 hộp mặt nạ NMN)",
      "nhuongHang": true,
      "hoacGiam": 5,
      "lyDo": "Mỹ phẩm từ 10.000.000đ",
      "moTa": "Mỹ phẩm từ 10.000.000đ: chọn giảm 5% hoặc tặng 1 quà (Toner C hoặc 2 hộp mặt nạ NMN)",
      "bac": [
        {
          "muc": 10000000,
          "soQua": 1
        }
      ],
      "muc": 10000000,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "cap-kem-nen-eclat",
          "bat": true
        },
        {
          "id": "kem-exosome-toneup",
          "bat": true
        },
        {
          "id": "49061985399",
          "bat": true
        },
        {
          "id": "48112514210",
          "bat": true
        },
        {
          "id": "57413220644",
          "bat": true
        },
        {
          "id": "57903449970",
          "bat": true
        },
        {
          "id": "51013054442",
          "bat": true
        },
        {
          "id": "24767149051",
          "bat": true
        },
        {
          "id": "50002678694",
          "bat": true
        },
        {
          "id": "24465090622",
          "bat": true
        },
        {
          "id": "57556697426",
          "bat": true
        },
        {
          "id": "24015142248",
          "bat": true
        },
        {
          "id": "24764883120",
          "bat": true
        },
        {
          "id": "24015583018",
          "bat": true
        },
        {
          "id": "28902157429",
          "bat": true
        },
        {
          "id": "26800350417",
          "bat": true
        },
        {
          "id": "27734205778",
          "bat": true
        },
        {
          "id": "25678530796",
          "bat": true
        },
        {
          "id": "29006040615",
          "bat": true
        },
        {
          "id": "27809051612",
          "bat": true
        },
        {
          "id": "24329101823",
          "bat": true
        },
        {
          "id": "26900366084",
          "bat": true
        },
        {
          "id": "56857599724",
          "bat": true
        },
        {
          "id": "28806784125",
          "bat": true
        },
        {
          "id": "hexacare",
          "bat": true
        },
        {
          "id": "goi-xa-boryeong-mud",
          "bat": true
        },
        {
          "id": "drvita-ecm-serum",
          "bat": true
        },
        {
          "id": "daycell-nad-white-cream",
          "bat": true
        },
        {
          "id": "avca-body-tone-up",
          "bat": true
        }
      ],
      "quaTang": [
        {
          "ten": "Toner C – Toner Hyalu C+ (trị giá 1.270.000đ)",
          "gia": 1270000
        },
        {
          "ten": "2 hộp mặt nạ NMN Kousa (trị giá 1.190.000đ)",
          "gia": 1190000
        }
      ]
    },
    {
      "id": "ct-2110-food-1tr",
      "ten": "Food · Đơn từ 1 triệu giảm 5%",
      "batDau": "2026-10-21T00:00",
      "ketThuc": "2027-12-31T23:59",
      "kieu": "tien",
      "chiGiam": 5,
      "tenGiam": "Food từ 1 triệu giảm 5%",
      "nhuongHang": true,
      "moTa": "Thực phẩm & đồ ăn vặt từ 1.000.000đ giảm 5%",
      "bac": [
        {
          "muc": 1000000,
          "soQua": 1
        }
      ],
      "muc": 1000000,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "28467224687",
          "bat": true
        },
        {
          "id": "43532388498",
          "bat": true
        },
        {
          "id": "ngu-coc-bap-thien-ma-kitea",
          "bat": true
        },
        {
          "id": "mien-ga-cf",
          "bat": true
        },
        {
          "id": "bo-xuyen-tieu",
          "bat": true
        },
        {
          "id": "com-chay-phomai",
          "bat": true
        },
        {
          "id": "com-vang-noi-oi",
          "bat": true
        },
        {
          "id": "lon-den-khoi-mo",
          "bat": true
        },
        {
          "id": "muoi-xuyen-tieu",
          "bat": true
        }
      ],
      "quaTang": []
    },
    {
      "id": "ct-2410-hau-an-canxi",
      "ten": "24–25/10 · Mua 1 hộp Canxi váng sữa tặng 1 thùng Lotte Háu Ăn 24 hộp",
      "moTa": "Mua 1 hộp Canxi váng sữa Calciumore tặng 1 thùng Lotte Háu Ăn 24 hộp (trị giá 775.000đ)",
      "lyDo": "Mua hộp Canxi váng sữa Calciumore",
      "batDau": "2026-10-24T00:00",
      "ketThuc": "2026-10-26T00:00",
      "kieu": "soLuong",
      "donVi": "hộp",
      "tenQua": "thùng Lotte Háu Ăn 24 hộp",
      "bac": [
        {
          "muc": 1,
          "soQua": 1
        },
        {
          "muc": 2,
          "soQua": 2
        },
        {
          "muc": 3,
          "soQua": 3
        },
        {
          "muc": 4,
          "soQua": 4
        }
      ],
      "muc": 1,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "26060839019",
          "bat": true,
          "heSo": {
            "1 hộp 90 gói": 1,
            "2 hộp váng sữa": 2,
            "3 hộp váng sữa": 3,
            "4 hộp váng sữa": 4,
            "30 gói (không hộp)": 0,
            "1 hộp váng sữa canxi+1 d3k2 giảm 5%": 0
          }
        }
      ],
      "quaTang": [
        {
          "ten": "Thùng Lotte Háu Ăn 24 hộp",
          "bat": true,
          "gia": 775000
        }
      ]
    },
    {
      "id": "ct-2410-hau-an-lotte",
      "ten": "24–25/10 · Mua 2 thùng nước ép Lotte tặng 1 thùng Lotte Háu Ăn 24 hộp",
      "moTa": "Mua 2 thùng nước ép Lotte (dòng dinh dưỡng thường) tặng 1 thùng Lotte Háu Ăn 24 hộp (trị giá 775.000đ)",
      "lyDo": "Mua thùng nước ép Lotte",
      "batDau": "2026-10-24T00:00",
      "ketThuc": "2026-10-26T00:00",
      "kieu": "soLuong",
      "donVi": "thùng",
      "tenQua": "thùng Lotte Háu Ăn 24 hộp",
      "bac": [
        {
          "muc": 2,
          "soQua": 1
        },
        {
          "muc": 4,
          "soQua": 2
        },
        {
          "muc": 6,
          "soQua": 3
        }
      ],
      "muc": 2,
      "soQua": 1,
      "sanPhamChinh": [
        {
          "id": "22686115682",
          "bat": true,
          "heSo": {
            "Xanh – Táo & Củ dền · 10 gói": 0,
            "Xanh – Táo & Củ dền · Thùng 30 gói": 1,
            "Hồng – Nho & Mận · 10 gói": 0,
            "Hồng – Nho & Mận · Thùng 30 gói": 1,
            "Cam – Lê & Hoa chuông · 10 gói": 0,
            "Cam – Lê & Hoa chuông · Thùng 30 gói": 1,
            "Mix vị · Thùng 30 gói": 1
          }
        },
        {
          "id": "23660586997",
          "bat": true,
          "heSo": {
            "Hộp 10 gói": 0,
            "Thùng 30 gói (3 hộp)": 1
          }
        },
        {
          "id": "41353214697",
          "bat": true,
          "heSo": {
            "Hộp 10 gói": 0,
            "Thùng 30 gói (3 hộp)": 1
          }
        },
        {
          "id": "25632276959",
          "bat": true,
          "heSo": {
            "Hộp 10 gói": 0,
            "Thùng 30 gói (3 hộp)": 1
          }
        }
      ],
      "quaTang": [
        {
          "ten": "Thùng Lotte Háu Ăn 24 hộp",
          "bat": true,
          "gia": 775000
        }
      ]
    },
    {
      "id": "ct-2410-binh-lotte",
      "ten": "Quà độc quyền web · Mua 1 thùng nước dinh dưỡng Lotte tặng bình giữ nhiệt (50 suất)",
      "moTa": "Mua 1 thùng nước dinh dưỡng Lotte tặng 1 bình giữ nhiệt Hương Chất Kids – quà độc quyền web, 50 suất, vẫn được ưu đãi hạng thành viên",
      "lyDo": "Mua thùng nước dinh dưỡng Lotte",
      "kieu": "soLuong",
      "donVi": "thùng",
      "bac": [
        {
          "muc": 1,
          "soQua": 1
        }
      ],
      "muc": 1,
      "soQua": 1,
      "batDau": "2026-10-24T00:00",
      "ketThuc": "2026-12-31T23:59",
      "tenQua": "bình giữ nhiệt Hương Chất Kids",
      "gioiHan": 50,
      "giuHang": true,
      "quaTang": [
        {
          "ten": "Bình giữ nhiệt Hương Chất Kids (quà độc quyền web)",
          "bat": true,
          "gia": 250000
        }
      ],
      "sanPhamChinh": [
        {
          "id": "22686115682",
          "bat": true,
          "heSo": {
            "Xanh – Táo & Củ dền · 10 gói": 0,
            "Xanh – Táo & Củ dền · Thùng 30 gói": 1,
            "Hồng – Nho & Mận · 10 gói": 0,
            "Hồng – Nho & Mận · Thùng 30 gói": 1,
            "Cam – Lê & Hoa chuông · 10 gói": 0,
            "Cam – Lê & Hoa chuông · Thùng 30 gói": 1,
            "Mix vị · Thùng 30 gói": 1
          }
        },
        {
          "id": "23660586997",
          "bat": true,
          "heSo": {
            "Hộp 10 gói": 0,
            "Thùng 30 gói (3 hộp)": 1
          }
        },
        {
          "id": "41353214697",
          "bat": true,
          "heSo": {
            "Hộp 10 gói": 0,
            "Thùng 30 gói (3 hộp)": 1
          }
        },
        {
          "id": "25632276959",
          "bat": true,
          "heSo": {
            "Hộp 10 gói": 0,
            "Thùng 30 gói (3 hộp)": 1
          }
        }
      ]
    },
    {
      "id": "ct-2410-binh-2tr",
      "ten": "Quà độc quyền web · Hoá đơn từ 2 triệu tặng bình giữ nhiệt (50 suất)",
      "moTa": "Hoá đơn từ 2.000.000đ (không tính Canxi váng sữa) tặng 1 bình giữ nhiệt Hương Chất Kids – quà độc quyền web, 50 suất, vẫn được ưu đãi hạng thành viên",
      "lyDo": "Hoá đơn từ 2.000.000đ",
      "kieu": "tien",
      "tatCaSP": true,
      "truSP": [
        "26060839019",
        "combo-vangsua-d3k2"
      ],
      "bac": [
        {
          "muc": 2000000,
          "soQua": 1
        }
      ],
      "muc": 2000000,
      "soQua": 1,
      "batDau": "2026-10-24T00:00",
      "ketThuc": "2026-12-31T23:59",
      "tenQua": "bình giữ nhiệt Hương Chất Kids",
      "gioiHan": 50,
      "giuHang": true,
      "quaTang": [
        {
          "ten": "Bình giữ nhiệt Hương Chất Kids (quà độc quyền web)",
          "bat": true,
          "gia": 250000
        }
      ],
      "sanPhamChinh": []
    }
  ]
};
/* ===/ADMIN:QUA_TANG=== */

/* =====================================================================
   SỰ KIỆN THEO NGÀY (vd Siêu sale 10.10) – web tự hiện / tự ẩn theo giờ:
   - hienTu → ketThuc : hiện tab "10.10" (menu + trang chủ) và 2 banner đầu trang
   - batDau → ketThuc : trang chủ mở sẵn tab sự kiện; CHỈ chạy chương trình quà có suKien = id,
                        mọi chương trình cũ tạm dừng (không cộng dồn, mỗi đơn 1 chương trình có lợi nhất)
   - sau ketThuc      : mọi thứ tự biến mất, web về như ngày thường
   ===================================================================== */
/* =====================================================================
   GIAO DIỆN NGÀY LỄ – js/le-hoi.js đọc khối này (trang quản trị › Website › Giao diện ngày lễ).
   Chỉ là lớp trang trí: dải chào mừng, màu trang trí, hiệu ứng nhẹ. Không ảnh hưởng giá, giỏ hàng, voucher, điểm.
   ===================================================================== */
/* ===ADMIN:LE_HOI=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong) */
window.LE_HOI = {
  "bat": true,
  "hieuUng": true,
  "chiDungNgayDoiChieu": false,
  "ds": [
    {
      "id": "tet-duong-lich",
      "ten": "Tết Dương lịch",
      "lich": {
        "loai": "duong",
        "ngay": "01-01"
      },
      "bat": true,
      "uuTien": 20,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "nam-moi",
      "hieuUng": null,
      "dai": "🎆 Hương Chất Kids chúc mẹ và bé năm mới an khang – mạnh khoẻ – nhiều niềm vui!",
      "nut": "",
      "link": "",
      "moTa": "Năm mới, pháo hoa, lời chúc",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "tet-nguyen-dan",
      "ten": "Tết Nguyên Đán",
      "lich": {
        "loai": "am",
        "thang": 1,
        "ngay": 1
      },
      "bat": true,
      "uuTien": 100,
      "truoc": 3,
      "soNgay": 3,
      "chuDe": "tet",
      "hieuUng": null,
      "dai": "🧧 Chúc Mừng Năm Mới – Hương Chất Kids chúc cả nhà an khang thịnh vượng, bé ăn ngoan chóng lớn!",
      "nut": "",
      "link": "",
      "moTa": "Mùng 1–3 Tết âm lịch: hoa đào, hoa mai, lì xì",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "valentine",
      "ten": "Valentine",
      "lich": {
        "loai": "duong",
        "ngay": "02-14"
      },
      "bat": true,
      "uuTien": 10,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "tinh-yeu",
      "hieuUng": null,
      "dai": "💝 Valentine ngọt ngào – yêu thương bắt đầu từ những điều chọn lọc cho cả nhà",
      "nut": "",
      "link": "",
      "moTa": "Trái tim, quà tặng, hoa",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "quoc-te-phu-nu",
      "ten": "Ngày Quốc tế Phụ nữ 8/3",
      "lich": {
        "loai": "duong",
        "ngay": "03-08"
      },
      "bat": true,
      "uuTien": 30,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "hoa-tim",
      "hieuUng": null,
      "dai": "💐 Chúc mừng ngày Quốc tế Phụ nữ 8/3 – chúc mẹ luôn xinh đẹp, hạnh phúc và được yêu thương",
      "nut": "",
      "link": "",
      "moTa": "Hoa, quà tặng, lời chúc phụ nữ",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "gio-to",
      "ten": "Giỗ Tổ Hùng Vương",
      "lich": {
        "loai": "am",
        "thang": 3,
        "ngay": 10
      },
      "bat": true,
      "uuTien": 40,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "trang-trong",
      "hieuUng": null,
      "dai": "🇻🇳 Dù ai đi ngược về xuôi, nhớ ngày Giỗ Tổ mùng mười tháng ba",
      "nut": "",
      "link": "",
      "moTa": "Trang trọng, văn hoá Việt – không hiệu ứng",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "30-4-1-5",
      "ten": "Giải phóng miền Nam & Quốc tế Lao động",
      "lich": {
        "loai": "duong",
        "ngay": "04-30"
      },
      "bat": true,
      "uuTien": 40,
      "truoc": 3,
      "soNgay": 2,
      "chuDe": "trang-trong",
      "hieuUng": null,
      "dai": "🇻🇳 Chào mừng 30/4 – 1/5 · Chúc cả nhà kỳ nghỉ lễ vui vẻ, an toàn",
      "nut": "",
      "link": "",
      "moTa": "30/4 và 1/5 – trang trọng, hiện đại",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "ngay-cua-me",
      "ten": "Ngày của Mẹ",
      "lich": {
        "loai": "quytac",
        "ma": "ngay-cua-me"
      },
      "bat": true,
      "uuTien": 30,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "gia-dinh",
      "hieuUng": null,
      "dai": "💐 Ngày của Mẹ – cảm ơn mẹ vì tất cả. Hương Chất Kids chúc mẹ luôn khoẻ và hạnh phúc",
      "nut": "",
      "link": "",
      "moTa": "Chủ nhật thứ 2 của tháng 5",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "thieu-nhi",
      "ten": "Quốc tế Thiếu nhi 1/6",
      "lich": {
        "loai": "duong",
        "ngay": "06-01"
      },
      "bat": true,
      "uuTien": 30,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "thieu-nhi",
      "hieuUng": null,
      "dai": "🎈 Chúc mừng ngày Quốc tế Thiếu nhi 1/6 – chúc các bé luôn vui khoẻ, mau lớn!",
      "nut": "",
      "link": "",
      "moTa": "Bóng bay, màu sắc vui tươi",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "ngay-cua-cha",
      "ten": "Ngày của Cha",
      "lich": {
        "loai": "quytac",
        "ma": "ngay-cua-cha"
      },
      "bat": true,
      "uuTien": 30,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "am-ap",
      "hieuUng": null,
      "dai": "👔 Ngày của Cha – gửi lời cảm ơn tới những người bố tuyệt vời",
      "nut": "",
      "link": "",
      "moTa": "Chủ nhật thứ 3 của tháng 6",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "tuu-truong",
      "ten": "Back to School – Mùa tựu trường",
      "lich": {
        "loai": "duong",
        "ngay": "08-01"
      },
      "bat": true,
      "uuTien": 5,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "tuu-truong",
      "hieuUng": null,
      "dai": "🎒 Mùa tựu trường – chuẩn bị dinh dưỡng cho bé tự tin vào năm học mới",
      "nut": "",
      "link": "",
      "moTa": "Từ 01/8 đến 10/9 (sửa được)",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {},
      "denNgay": "09-10"
    },
    {
      "id": "quoc-khanh",
      "ten": "Quốc khánh 2/9",
      "lich": {
        "loai": "duong",
        "ngay": "09-02"
      },
      "bat": true,
      "uuTien": 50,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "trang-trong",
      "hieuUng": null,
      "dai": "🇻🇳 Chào mừng Quốc khánh 2/9 – chúc cả nhà kỳ nghỉ lễ vui vẻ, bình an",
      "nut": "",
      "link": "",
      "moTa": "Đỏ, vàng, trang trọng",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "trung-thu",
      "ten": "Tết Trung Thu",
      "lich": {
        "loai": "am",
        "thang": 8,
        "ngay": 15
      },
      "bat": true,
      "uuTien": 60,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "trung-thu",
      "hieuUng": null,
      "dai": "🏮 Trung Thu đoàn viên – chúc các bé một mùa trăng thật vui, cả nhà sum vầy",
      "nut": "",
      "link": "",
      "moTa": "Rằm tháng 8 âm lịch: trăng, đèn lồng, thỏ",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "phu-nu-viet-nam",
      "ten": "Ngày Phụ nữ Việt Nam 20/10",
      "lich": {
        "loai": "duong",
        "ngay": "10-20"
      },
      "bat": true,
      "uuTien": 60,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "hoa-hong",
      "hieuUng": null,
      "dai": "🌷 Chào mừng 20/10 – tạo tài khoản từ nay đến hết 20/10 tặng ngay 20.100 điểm · điểm danh ngày 20/10 nhận 50.000 điểm",
      "nut": "Nhận quà",
      "link": "index.html?tab=2010",
      "moTa": "Hoa, quà tặng, lời chúc",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "halloween",
      "ten": "Halloween",
      "lich": {
        "loai": "duong",
        "ngay": "10-31"
      },
      "bat": true,
      "uuTien": 20,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "halloween",
      "hieuUng": null,
      "dai": "🎃 Happy Halloween – bé vui hết nấc, mẹ yên tâm với đồ ăn vặt chọn lọc",
      "nut": "",
      "link": "",
      "moTa": "Bí ngô, dơi, ma vui nhộn",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "sale-11-11",
      "ten": "Siêu sale 11.11",
      "lich": {
        "loai": "duong",
        "ngay": "11-11"
      },
      "bat": true,
      "uuTien": 30,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "sale",
      "hieuUng": null,
      "dai": "🛍️ Mùa săn deal 11.11 – xem các ưu đãi đang có trên web",
      "nut": "Xem ưu đãi",
      "link": "collections.html",
      "moTa": "Mua sắm, ưu đãi",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "nha-giao",
      "ten": "Ngày Nhà giáo Việt Nam 20/11",
      "lich": {
        "loai": "duong",
        "ngay": "11-20"
      },
      "bat": true,
      "uuTien": 40,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "tri-an",
      "hieuUng": null,
      "dai": "📚 Tri ân thầy cô nhân ngày Nhà giáo Việt Nam 20/11",
      "nut": "",
      "link": "",
      "moTa": "Hoa, sách, lời tri ân",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "black-friday",
      "ten": "Black Friday & Cyber Monday",
      "lich": {
        "loai": "quytac",
        "ma": "black-friday"
      },
      "bat": true,
      "uuTien": 35,
      "truoc": 3,
      "soNgay": 4,
      "chuDe": "sale-den",
      "hieuUng": null,
      "dai": "🏷️ Black Friday – Cyber Monday: săn ưu đãi cuối tháng 11",
      "nut": "Xem ưu đãi",
      "link": "collections.html",
      "moTa": "Thứ Sáu sau Lễ Tạ ơn → Cyber Monday",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "sale-12-12",
      "ten": "Siêu sale 12.12",
      "lich": {
        "loai": "duong",
        "ngay": "12-12"
      },
      "bat": true,
      "uuTien": 30,
      "truoc": 3,
      "soNgay": 1,
      "chuDe": "sale",
      "hieuUng": null,
      "dai": "🛍️ Siêu sale 12.12 – deal cuối năm cho mẹ và bé",
      "nut": "Xem ưu đãi",
      "link": "collections.html",
      "moTa": "Ngày đôi cuối năm",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    },
    {
      "id": "giang-sinh",
      "ten": "Giáng sinh",
      "lich": {
        "loai": "duong",
        "ngay": "12-24"
      },
      "bat": true,
      "uuTien": 50,
      "truoc": 3,
      "soNgay": 2,
      "chuDe": "giang-sinh",
      "hieuUng": null,
      "dai": "🎄 Merry Christmas – Hương Chất Kids chúc cả nhà Giáng sinh an lành, ấm áp",
      "nut": "",
      "link": "",
      "moTa": "24–25/12: cây thông, tuyết nhẹ, quà",
      "trang": [
        "*"
      ],
      "truTrang": [
        "checkout.html"
      ],
      "hieuUngTrang": [
        "index.html",
        "collections.html",
        "product.html",
        "blog.html",
        "diem-danh.html"
      ],
      "ghiDe": {}
    }
  ]
};
/* ===/ADMIN:LE_HOI=== */

/* Quà tạo tài khoản mới: web chỉ dùng để HIỆN thông báo – máy chủ (tools/apps-script.gs › QUA_DANG_KY) mới là nơi cộng điểm, sửa cả 2 nơi */
window.QUA_DANG_KY = { diem: 50000, tu: '2026-10-21', den: '2026-12-31' };

window.SU_KIEN = {
  id: '2010', nhan: '20.10', icon: '🌷', ten: 'Ngày Phụ nữ Việt Nam 20.10', khau: 'Mẹ xứng đáng được yêu thương',
  hienTu: '2026-10-16T00:00:00+07:00', batDau: '2026-10-20T00:00:00+07:00', ketThuc: '2026-10-21T00:00:00+07:00',
  giuCT: true,   // không tạm dừng quà tặng / giờ vàng ngày thường
  poster: 'img/su-kien/2010d-poster.jpg',
  loiChuc: 'Cảm ơn mẹ đã luôn chăm chút từng bữa ăn, giấc ngủ cho cả nhà. Ngày 20/10 này, Hương Chất Kids gửi mẹ những món quà nhỏ – chúc mẹ luôn khoẻ, xinh và thật nhiều yêu thương 💗',
  luat: ['Quà 20.100 điểm: tạo tài khoản mới từ nay đến hết 20/10, hoặc đăng nhập trong ngày 20/10 – mỗi tài khoản nhận 1 lần.', 'Điểm danh ngày 20/10 được 50.000 điểm (ngày thường 1.000 điểm). 1 điểm = 1đ, mỗi đơn dùng điểm giảm tối đa 10% tiền hàng.', 'Quà tặng, mã giảm giá và giờ vàng ngày thường vẫn áp dụng như bình thường.'],
  banners: [
    { pc: 'img/su-kien/2010d-b1pc.jpg', mb: 'img/su-kien/2010d-b1mb.jpg', link: 'index.html?tab=2010', alt: 'Chúc mừng ngày Phụ nữ Việt Nam 20.10 – đăng nhập tặng 20.100 điểm, điểm danh 50.000 điểm' },
    { pc: 'img/su-kien/2010d-b2pc.jpg', mb: 'img/su-kien/2010d-b2mb.jpg', link: 'diem-danh.html', alt: 'Chỉ trong ngày 20/10 – điểm danh nhận 50.000 điểm thưởng' }
  ],
  khoi: [
    { nhan: 'Quà 20/10', icon: '🎁', tieuDe: 'Tạo tài khoản / đăng nhập nhận 20.100 điểm', noiBat: 'Tặng 20.100 điểm = 20.100đ', huyHieu: 'Đến hết 20/10', dong: ['Tạo tài khoản mới từ nay đến hết 20/10 – nhận ngay', 'Đã có tài khoản: đăng nhập trong ngày 20/10', 'Điểm tự cộng vào ví – mỗi tài khoản 1 lần', 'Dùng giảm tới 10% tiền hàng mỗi đơn'], nut: { chu: 'Tạo tài khoản nhận quà', link: 'account.html' } },
    { nhan: 'Điểm danh', icon: '📅', tieuDe: 'Điểm danh nhận 50.000 điểm', noiBat: 'Gấp 50 lần ngày thường', huyHieu: 'Chỉ ngày 20/10', dong: ['Ngày thường: 1.000 điểm', 'Riêng 20/10: 50.000 điểm', 'Cộng quà đăng nhập: tổng 70.100 điểm'], nut: { chu: 'Điểm danh ngay', link: 'diem-danh.html' } },
    { anh: 'img/su-kien/2010d-my-pham.jpg', alt: 'Ưu đãi làm đẹp 20/10 – mua mỹ phẩm nhận quà theo từng mức đơn', link: 'collections.html?cat=cho-me' },
    { nhan: 'Làm đẹp cho mẹ', icon: '💄', tieuDe: 'Mẹ đẹp từ những điều chọn lọc', dong: ['Mỹ phẩm Hàn Quốc chính hãng 100%', 'Dùng điểm 20/10 giảm thêm khi mua'], ghiChu: 'Tự thưởng cho mình một món quà nhỏ nhé mẹ 💗', xem: { chu: 'Xem tất cả mỹ phẩm', mo: 'Toàn bộ sản phẩm dành cho mẹ', icon: '💄', link: 'collections.html?cat=cho-me' }, sp: ['cap-kem-nen-eclat', '57903449970', '57413220644', '57556697426'] },
    { nhan: 'Mẹ khoẻ con khoẻ', icon: '🍼', tieuDe: 'Dinh dưỡng Hàn Quốc cho bé', dong: ['Chọn theo đúng tuổi của con', 'Đo chỉ số chiều cao – cân nặng miễn phí'], xem: { chu: 'Xem tất cả sản phẩm cho bé', mo: 'Sữa, hồng sâm, vitamin, nước ép…', icon: '🍼', link: 'collections.html' }, sp: ['22686115682', '26060839019', '42878618667', '22644617070'] }
  ],
};


/* =====================================================================
   GIỜ VÀNG – giảm giá theo khung giờ trong ngày (giờ Việt Nam), web tự bật / tự tắt:
   - tu → den mỗi ngày (trong khoảng tuNgay → denNgay; denNgay trống = chạy mãi đến khi tắt)
   - giam: % giảm trừ thẳng vào giá bán của sản phẩm thuộc brands (hoặc sanPham: [id])
   - bỏ qua combo và sữa công thức (formula) theo quy định; truSanPham: mã sản phẩm không áp giờ vàng; tat: true để tắt nhanh
   - ngày có SU_KIEN đang chạy (vd 10.10) thì giờ vàng tạm nghỉ
   ===================================================================== */
window.GIO_VANG = [
  { id: 'lotte-5', ten: 'Giờ vàng Lotte', giam: 5, tu: '20:00', den: '22:00', brands: ['lotte'], sanPham: [], truSanPham: ['lotte-hau-an'], tuNgay: '2026-10-12', denNgay: '', tat: false }
];

/* =====================================================================
   SẢN PHẨM NÊN MUA KÈM – hiện ở trang thanh toán để khách thêm vào đơn 1 chạm
   Theo DANH MỤC của sản phẩm đang có trong giỏ: [mã sản phẩm, lý do ngắn hiện dưới tên].
   Web tự bỏ sản phẩm đã có trong giỏ / đang hết hàng, lấy tối đa `soLuong` món;
   thiếu thì bù bằng sản phẩm bán chạy cùng nhóm (cho bé / cho mẹ).
   ===================================================================== */
window.MUA_KEM = {
  enabled: true,
  soLuong: 4,
  theoDanhMuc: {
    'sua': [
      ['42878618667', 'Uống cùng sữa – D3K2 hỗ trợ hấp thu canxi'],
      ['41353214697', 'Bộ đôi hỗ trợ phát triển chiều cao mẹ hay chọn'],
      ['26060839019', 'Thêm canxi hữu cơ cho bé ăn vặt'],
      ['45462512687', 'Trộn cơm hỗ trợ bé ăn ngon miệng hơn']
    ],
    'nuoc-ep': [
      ['22644617070', 'Hồng sâm hỗ trợ bé ăn ngon, phục hồi sức khoẻ'],
      ['42878618667', 'Thêm D3K2 hỗ trợ bé phát triển chiều cao'],
      ['27355720019', 'Hồng sâm hỗ trợ trí não khi đi học'],
      ['41002695070', 'Rắc cơm hỗ trợ bé ăn ngon miệng hơn']
    ],
    'hong-sam': [
      ['25632276959', 'Nước ép tăng cân uống xen với hồng sâm'],
      ['42878618667', 'Thêm D3K2 hỗ trợ bé phát triển chiều cao'],
      ['26156646705', 'Gạc hươu hỗ trợ bé tăng cân'],
      ['41002695070', 'Rắc cơm hỗ trợ bé ăn ngon miệng hơn']
    ],
    'vitamin': [
      ['13899935993', 'Sữa dê bổ sung canxi, dễ hấp thu'],
      ['41353214697', 'Bộ đôi hỗ trợ phát triển chiều cao mẹ hay chọn'],
      ['42878618667', 'Mẹ hay dùng D3K2 cùng canxi'],
      ['45462512687', 'Trộn cơm hỗ trợ bé ăn ngon miệng hơn']
    ],
    'tang-can': [
      ['22644617070', 'Hồng sâm hỗ trợ bé ăn ngon, phục hồi sức khoẻ'],
      ['25632276959', 'Nước ép tăng cân tự nhiên cho bé'],
      ['13899935993', 'Sữa dê dễ hấp thu, hỗ trợ tăng cân'],
      ['41002695070', 'Rắc cơm hỗ trợ bé ăn ngon miệng hơn']
    ],
    'rong-bien': [
      ['41002695070', 'Đổi vị rong biển cho bé đỡ ngán'],
      ['45462512687', 'Đổi vị rong biển cho bé đỡ ngán'],
      ['25632276959', 'Nước ép tăng cân tự nhiên cho bé'],
      ['22644617070', 'Hồng sâm hỗ trợ bé ăn ngon, phục hồi sức khoẻ']
    ],
    'thuc-pham': [
      ['43532388498', 'Ăn sáng nhanh cùng sữa chua, sữa tươi'],
      ['28467224687', 'Táo đỏ – món ăn vặt tốt cho cả nhà'],
      ['25632276959', 'Nước ép tăng cân tự nhiên cho bé'],
      ['41002695070', 'Rắc cơm hỗ trợ bé ăn ngon miệng hơn']
    ],
    'do-an': [
      ['com-chay-phomai', 'Ăn vặt giòn rụm cho cả nhà'],
      ['muoi-xuyen-tieu', 'Muối chấm hoa quả, thịt luộc'],
      ['bo-xuyen-tieu', 'Bò sấy dẻo nhâm nhi'],
      ['28467224687', 'Táo đỏ – món ăn vặt tốt cho cả nhà']
    ],
    'cho-me': [
      ['27734205778', 'Chống nắng mỗi ngày – bước dưỡng không thể thiếu'],
      ['24015583018', 'Mặt nạ bán chạy, đắp 2–3 lần/tuần'],
      ['28467224687', 'Táo đỏ hầm canh, pha trà cho mẹ'],
      ['25632276959', 'Mua kèm cho bé – nước ép bán chạy nhất']
    ],
  },
};

/* Hạng khách hàng – xét theo TỔNG TIỀN ĐÃ CHI TIÊU (cộng các đơn đã đặt, trừ đơn huỷ/hoàn).
   Sửa mốc tiền hoặc % giảm ngay tại đây, web và Apps Script đều dùng chung bảng này. */
/* ===ADMIN:TIERS=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong) */
window.TIERS = [
  { key: 'moi',     label: 'Khách mới',  icon: '🌱', color: '#78909C', min: 0,         discount: 0,  desc: 'Mua đủ 5 triệu để lên hạng Silver' },
  { key: 'silver',   label: 'Silver',   icon: '🥈', color: '#78909C', min: 5000000,   discount: 5,  desc: 'Giảm 5% mọi đơn hàng' },
  { key: 'gold',     label: 'Gold',     icon: '🥇', color: '#C98A12', min: 20000000,  discount: 7,  desc: 'Giảm 7% mọi đơn hàng' },
  { key: 'diamond',  label: 'Diamond',  icon: '💎', color: '#1E9CB8', min: 40000000,  discount: 10, desc: 'Giảm 10% mọi đơn hàng' },
  { key: 'platinum', label: 'Platinum', icon: '👑', color: '#6A4FB6', min: 100000000, discount: 12, desc: 'Giảm 12% mọi đơn hàng' }
];
/* ===/ADMIN:TIERS=== */

/* ===ADMIN:COUPONS=== (trang quản trị ghi đè khối này – đừng viết ghi chú bên trong) */
window.COUPONS = {
  "FREESHIP": {
    "ten": "FREESHIP",
    "loai": "shop",
    "type": "ship",
    "value": 0,
    "min": 3000000,
    "desc": "Miễn phí vận chuyển cho đơn từ 3000K"
  },
  "HCK5": {
    "ten": "khách mua lần đầu",
    "loai": "shop",
    "type": "percent",
    "value": 5,
    "min": 0,
    "donDau": true,
    "desc": "Giảm 5% cho đơn hàng đầu tiên",
    "batDau": "2026-10-05T11:22",
    "hetHan": "2026-10-31T23:59"
  },
  "BMWCCV": {
    "ten": "thành viên BMWCCV",
    "loai": "riengtu",
    "type": "percent",
    "value": 20,
    "min": 0,
    "desc": "Giảm 20% cho thành viên BMWCCV"
  },
  "KHSP": {
    "ten": "Khách Shopee chuyển sang web – váng sữa canxi",
    "loai": "sanpham",
    "type": "percent",
    "value": 5,
    "min": 0,
    "desc": "Giảm 5% váng sữa canxi Calciumore – mỗi khách 1 lần",
    "batDau": "2026-11-01T00:00",
    "hetHan": "2026-12-31T23:59",
    "motLan": true,
    "sanPham": [
      "26060839019",
      "combo-vangsua-d3k2"
    ]
  },
  "KHTT": {
    "ten": "Khách TikTok Shop chuyển sang web – váng sữa canxi",
    "loai": "sanpham",
    "type": "percent",
    "value": 5,
    "min": 0,
    "desc": "Giảm 5% váng sữa canxi Calciumore – mỗi khách 1 lần",
    "batDau": "2026-11-01T00:00",
    "hetHan": "2026-12-31T23:59",
    "motLan": true,
    "sanPham": [
      "26060839019",
      "combo-vangsua-d3k2"
    ]
  },
  "CAMON30": {
    "ten": "Cảm ơn khách đã mua (poster gửi kèm đơn)",
    "loai": "riengtu",
    "type": "fixed",
    "value": 30000,
    "min": 200000,
    "motLan": true,
    "desc": "Giảm 30.000đ cho đơn từ 200.000đ – mỗi khách 1 lần"
  }
};
/* ===/ADMIN:COUPONS=== */

window.PROVINCES = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'];
