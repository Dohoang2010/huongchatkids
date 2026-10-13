/* =====================================================================
   THEO DÕI SỨC KHỎE CON (trang chủ, khối data-khoi="suc-khoe")
   Mẹ nhập giới tính, ngày sinh, chiều cao, cân nặng → đối chiếu chuẩn WHO
   (cân nặng/tuổi, chiều cao/tuổi, BMI/tuổi), dinh dưỡng theo giai đoạn,
   gợi ý sản phẩm hợp tuổi lấy thẳng từ PRODUCTS (quản trị sửa sản phẩm là đổi theo).
   Bảng LMS của WHO nằm ở js/who-growth.js (sinh bởi tools/who-growth.mjs), chỉ tải khi cần.
   Số đo lưu trong localStorage của máy khách (khoá hck_suckhoe), không gửi đi đâu.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------------- Tính toán theo chuẩn WHO (không phụ thuộc giao diện) ---------------- */
  const NGAY_MOI_THANG = 30.4375;
  const IND = { wfa: 'Cân nặng theo tuổi', hfa: 'Chiều cao theo tuổi', bfa: 'BMI theo tuổi' };

  /* L, M, S tại tuổi (tháng, số thực): nội suy tuyến tính giữa 2 tháng liền kề */
  function lmsAt(ind, sex, thang) {
    const t = window.WHO_GROWTH && window.WHO_GROWTH[ind] && window.WHO_GROWTH[ind][sex];
    if (!t || thang < 0 || thang > t.length - 1) return null;
    const i = Math.floor(thang), f = thang - i;
    if (!f || i + 1 >= t.length) return t[i];
    return t[i].map((v, k) => v + (t[i + 1][k] - v) * f);
  }
  /* Giá trị đo tương ứng z-score z */
  const giaTriTaiZ = (z, [L, M, S]) => (L ? M * Math.pow(1 + L * S * z, 1 / L) : M * Math.exp(S * z));
  /* z-score theo LMS; cân nặng và BMI ngoài ±3 hiệu chỉnh theo khoảng SD23 giống WHO Anthro */
  function zScore(x, lms, hieuChinh) {
    const [L, M, S] = lms;
    let z = L ? (Math.pow(x / M, L) - 1) / (L * S) : Math.log(x / M) / S;
    if (hieuChinh && z > 3) { const sd3 = giaTriTaiZ(3, lms); z = 3 + (x - sd3) / (sd3 - giaTriTaiZ(2, lms)); }
    if (hieuChinh && z < -3) { const sd3 = giaTriTaiZ(-3, lms); z = -3 + (x - sd3) / (giaTriTaiZ(-2, lms) - sd3); }
    return z;
  }
  /* Phân phối chuẩn tích luỹ (xấp xỉ erf, sai số < 1e-7) → bách phân vị */
  function phi(z) {
    const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    const e = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
    return z >= 0 ? (1 + e) / 2 : (1 - e) / 2;
  }

  /* Phân loại theo ngưỡng WHO. tone: good | warn | bad | info */
  function phanLoai(ind, z, thang) {
    if (ind === 'hfa') {
      if (z < -3) return { tone: 'bad', label: 'Thấp còi nặng' };
      if (z < -2) return { tone: 'warn', label: 'Thấp còi' };
      if (z > 3) return { tone: 'info', label: 'Rất cao' };
      return { tone: 'good', label: z < -1 ? 'Bình thường, hơi thấp' : 'Bình thường' };
    }
    if (ind === 'wfa') {
      if (z < -3) return { tone: 'bad', label: 'Nhẹ cân nặng' };
      if (z < -2) return { tone: 'warn', label: 'Nhẹ cân' };
      if (z > 2) return { tone: 'info', label: 'Cân nặng cao, xem BMI' };
      return { tone: 'good', label: 'Bình thường' };
    }
    const nho = thang < 60;
    if (z < -3) return { tone: 'bad', label: nho ? 'Gầy còm nặng' : 'Gầy nặng' };
    if (z < -2) return { tone: 'warn', label: nho ? 'Gầy còm' : 'Gầy' };
    if (nho) {
      if (z > 3) return { tone: 'bad', label: 'Béo phì' };
      if (z > 2) return { tone: 'warn', label: 'Thừa cân' };
      if (z > 1) return { tone: 'info', label: 'Nguy cơ thừa cân' };
    } else {
      if (z > 2) return { tone: 'bad', label: 'Béo phì' };
      if (z > 1) return { tone: 'warn', label: 'Thừa cân' };
    }
    return { tone: 'good', label: 'Bình thường' };
  }
  /* Dải màu của thang z (từ −4 đến +4) cho từng chỉ số */
  function dai(ind, thang) {
    if (ind === 'hfa') return [[-4, -3, 'bad'], [-3, -2, 'warn'], [-2, 3, 'good'], [3, 4, 'info']];
    if (ind === 'wfa') return [[-4, -3, 'bad'], [-3, -2, 'warn'], [-2, 2, 'good'], [2, 4, 'info']];
    return thang < 60
      ? [[-4, -3, 'bad'], [-3, -2, 'warn'], [-2, 1, 'good'], [1, 2, 'info'], [2, 3, 'warn'], [3, 4, 'bad']]
      : [[-4, -3, 'bad'], [-3, -2, 'warn'], [-2, 1, 'good'], [1, 2, 'warn'], [2, 4, 'bad']];
  }

  /* Phân tích một lần đo. sex: 1 trai, 2 gái; h cm; w kg; ngayTuoi: số ngày tuổi */
  function phanTich({ sex, h, w, ngayTuoi }) {
    const thang = ngayTuoi / NGAY_MOI_THANG;
    const bmi = w / Math.pow(h / 100, 2);
    const ket = { thang, bmi, chiSo: {} };
    [['wfa', w, true], ['hfa', h, false], ['bfa', bmi, true]].forEach(([ind, x, hc]) => {
      const lms = lmsAt(ind, sex, thang);
      if (!lms) return; // VD cân nặng/tuổi chỉ có tới 10 tuổi
      const z = zScore(x, lms, hc);
      ket.chiSo[ind] = {
        ind, x, z, pv: phi(z) * 100, ...phanLoai(ind, z, thang),
        // khoảng chuẩn hiển thị: −2SD / TB / +2SD (BMI: tới +1SD vì trên đó đã là thừa cân / nguy cơ)
        thap: giaTriTaiZ(-2, lms), tb: lms[1], cao: giaTriTaiZ(ind === 'bfa' ? 1 : 2, lms),
      };
    });
    return ket;
  }

  window.HK_GROWTH = { lmsAt, giaTriTaiZ, zScore, phi, phanLoai, phanTich, NGAY_MOI_THANG };
  if (typeof document === 'undefined' || !window.MC) return;

  /* ---------------- Dinh dưỡng theo giai đoạn ----------------
     Lượng mỗi ngày theo khuyến nghị của Viện Y học Hoa Kỳ (IOM, NIH ODS); DHA theo EFSA. */
  const GIAI_DOAN = {
    '0-6m': {
      trongTam: 'Bú mẹ hoàn toàn trong 6 tháng đầu, bú theo nhu cầu. Bé chưa cần uống nước hay ăn thêm.',
      chat: [
        ['Sữa mẹ', 'Bú theo nhu cầu', 'Đủ năng lượng, đạm và kháng thể cho bé', 'Mẹ ăn đủ bữa, uống đủ nước'],
        ['Vitamin D', '400 IU', 'Sữa mẹ ít vitamin D, bé dễ thiếu nếu ít ra nắng', 'Dạng nhỏ giọt theo hướng dẫn bác sĩ'],
        ['Canxi', '200 mg', 'Xây khung xương ngay từ những tháng đầu', 'Sữa mẹ'],
        ['Sắt', '0,27 mg', 'Bé có sẵn dự trữ sắt từ lúc sinh', 'Sữa mẹ'],
        ['Kẽm', '2 mg', 'Giúp bé lớn và có sức đề kháng', 'Sữa mẹ'],
        ['DHA', 'Qua sữa mẹ', 'Phát triển não và thị lực', 'Mẹ ăn cá 2-3 bữa mỗi tuần'],
      ],
    },
    '6-12m': {
      trongTam: 'Bắt đầu ăn dặm và vẫn bú mẹ. Sắt là chất bé dễ thiếu nhất ở giai đoạn này.',
      chat: [
        ['Sắt', '11 mg', 'Dự trữ sắt từ lúc sinh đã cạn, thiếu sắt làm bé chậm lớn', 'Thịt bò, gan, lòng đỏ trứng, ngũ cốc bổ sung sắt'],
        ['Kẽm', '3 mg', 'Giúp bé ăn ngon và tăng trưởng', 'Thịt, tôm, cua, cá'],
        ['Đạm', '11 g', 'Tạo cơ và mô mới khi bé lớn nhanh', 'Thịt, cá, trứng, đậu phụ'],
        ['Canxi', '260 mg', 'Răng và xương phát triển', 'Sữa mẹ, sữa chua, phô mai'],
        ['Vitamin D', '400 IU', 'Giúp hấp thu canxi', 'Nắng sáng, cá béo, dạng nhỏ giọt'],
        ['DHA', '100 mg', 'Não bộ và thị lực', 'Cá hồi, cá thu xay nhuyễn'],
      ],
    },
    '1-3y': {
      trongTam: 'Bé lớn chậm hơn năm đầu và hay biếng ăn. Cần đủ sữa, đạm và sắt trong 3 bữa chính, 2 bữa phụ.',
      chat: [
        ['Canxi', '700 mg', 'Xương dài ra nhanh khi bé tập đi, tập chạy', 'Khoảng 2 cốc sữa cùng sữa chua, phô mai'],
        ['Vitamin D', '600 IU', 'Giúp hấp thu canxi vào xương', 'Nắng sáng 15 phút, cá béo, trứng'],
        ['Sắt', '7 mg', 'Phòng thiếu máu, giúp bé tỉnh táo, ăn ngon', 'Thịt đỏ, gan, rau lá xanh đậm'],
        ['Kẽm', '3 mg', 'Hỗ trợ vị giác, ăn ngon miệng', 'Thịt, hải sản, các loại đậu'],
        ['Đạm', '13 g', 'Tăng cơ và chiều cao', 'Thịt, cá, trứng, sữa'],
        ['Chất xơ', '19 g', 'Giúp tiêu hoá tốt, ít táo bón', 'Rau củ, trái cây, ngũ cốc nguyên hạt'],
      ],
    },
    '3-6y': {
      trongTam: 'Bé đi mẫu giáo, vận động nhiều và dễ ốm vặt. Ưu tiên đủ canxi, vitamin D và chất tăng đề kháng.',
      chat: [
        ['Canxi', '700-1.000 mg', 'Xương và răng vĩnh viễn hình thành', 'Sữa, sữa chua, phô mai, tôm cua'],
        ['Vitamin D', '600 IU', 'Hấp thu canxi, hỗ trợ miễn dịch', 'Chơi ngoài trời, cá béo, trứng'],
        ['Sắt', '7-10 mg', 'Giúp bé tập trung, ít mệt', 'Thịt đỏ, gan, đậu'],
        ['Kẽm', '3-5 mg', 'Tăng sức đề kháng', 'Thịt, hàu, hạt bí'],
        ['Đạm', '13-19 g', 'Phát triển cơ bắp và chiều cao', 'Thịt, cá, trứng, sữa, đậu phụ'],
        ['Vitamin C', '15-25 mg', 'Giúp hấp thu sắt, bảo vệ cơ thể', 'Cam, ổi, kiwi, rau xanh'],
      ],
    },
    '6-12y': {
      trongTam: 'Tuổi tiểu học: học nhiều, xương dài nhanh trước dậy thì. Đây là lúc tích luỹ canxi quan trọng.',
      chat: [
        ['Canxi', '1.000-1.300 mg', 'Tích luỹ khối xương cho giai đoạn dậy thì', '3 phần sữa và chế phẩm từ sữa mỗi ngày'],
        ['Vitamin D', '600 IU', 'Giúp canxi vào xương', 'Vận động ngoài trời, cá béo'],
        ['Sắt', '8-10 mg', 'Giúp tập trung học tập', 'Thịt đỏ, gan, rau lá xanh đậm'],
        ['Kẽm', '5-8 mg', 'Tăng trưởng và miễn dịch', 'Thịt, hải sản, các loại hạt'],
        ['Đạm', '19-34 g', 'Phát triển cơ và chiều cao', 'Thịt, cá, trứng, sữa'],
        ['DHA và EPA', '250 mg', 'Hỗ trợ trí nhớ và thị lực', 'Cá hồi, cá thu, cá trích 2 bữa mỗi tuần'],
      ],
    },
    '12-18y': {
      trongTam: 'Dậy thì: chiều cao tăng vọt, nhu cầu canxi và sắt cao nhất trong đời. Bé gái cần thêm sắt khi có kinh nguyệt.',
      chat: [
        ['Canxi', '1.300 mg', 'Gần một nửa khối xương trưởng thành hình thành ở tuổi này', 'Sữa, sữa chua, phô mai, đậu phụ'],
        ['Vitamin D', '600 IU', 'Giúp xương chắc khi bé lớn nhanh', 'Vận động ngoài trời, cá béo, trứng'],
        ['Sắt', { 1: '8-11 mg', 2: '8-15 mg' }, 'Tạo máu cho cơ thể đang lớn nhanh', 'Thịt bò, gan, rau lá xanh đậm'],
        ['Kẽm', { 1: '8-11 mg', 2: '8-9 mg' }, 'Cần cho dậy thì và tăng trưởng', 'Thịt, hàu, hạt bí, các loại đậu'],
        ['Đạm', { 1: '34-52 g', 2: '34-46 g' }, 'Tăng cơ và chiều cao', 'Thịt, cá, trứng, sữa, đậu'],
        ['DHA và EPA', '250 mg', 'Hỗ trợ học tập và tim mạch', 'Cá béo 2 bữa mỗi tuần'],
      ],
    },
  };
  /* Lời khuyên và nhu cầu sản phẩm theo tình trạng (khớp với NEEDS trong data.js) */
  const TINH_TRANG = {
    thapCoi: { needs: ['tang-chieu-cao', 'canxi', 'd3k2'], loi: 'Chiều cao của bé đang thấp hơn chuẩn WHO. Mẹ ưu tiên đủ đạm (thịt, cá, trứng, sữa), canxi, vitamin D và kẽm, cho bé ngủ trước 22 giờ và vận động ngoài trời mỗi ngày. Mẹ nên đưa bé đi khám dinh dưỡng để tìm nguyên nhân.' },
    hoiThap: { needs: ['tang-chieu-cao', 'canxi', 'd3k2'], loi: 'Chiều cao của bé vẫn trong chuẩn nhưng dưới mức trung bình. Mẹ chú ý đủ sữa, đạm, canxi, vitamin D và giấc ngủ để bé bắt kịp đà tăng trưởng.' },
    gay: { needs: ['tang-can', 'tieu-hoa', 'an-dam', 'phuc-hoi'], loi: 'Bé đang nhẹ cân so với chuẩn. Mẹ chia nhỏ bữa, thêm dầu ăn, bơ, sữa vào món ăn để tăng năng lượng, và chú ý tiêu hoá của bé. Nếu bé sụt cân hoặc ốm kéo dài, mẹ đưa bé đi khám.' },
    thuaCan: { needs: ['tieu-hoa', 'de-khang', 'sua-tuoi', 'organic'], tranh: 'tang-can', loi: 'Cân nặng của bé đang vượt chuẩn so với chiều cao. Mẹ giảm nước ngọt, bánh kẹo, đồ chiên; tăng rau xanh và chất xơ; cho bé vận động ít nhất 60 phút mỗi ngày. Không để bé nhịn ăn hay ăn kiêng khắt khe vì bé vẫn đang lớn.' },
    nguyCo: { needs: ['tieu-hoa', 'de-khang', 'sua-tuoi', 'organic'], tranh: 'tang-can', loi: 'Bé có nguy cơ thừa cân. Mẹ hạn chế đồ ngọt, nước ngọt và cho bé vận động nhiều hơn, theo dõi lại sau 1-2 tháng.' },
    tot: { needs: ['de-khang', 'tang-chieu-cao', 'canxi', 'tri-nao', 'vitamin-tong-hop'], loi: 'Bé đang phát triển cân đối theo chuẩn WHO. Mẹ duy trì bữa ăn đa dạng, đủ sữa, ngủ đủ giấc và đo lại mỗi 1-3 tháng để theo dõi đà tăng trưởng.' },
  };

  const { $, $$, esc, I, productCard, rankDefault, store, ageRange } = MC;
  const KHOA = 'hck_suckhoe';
  const VER = '20261013a';
  const NEED_LABEL = (k) => ((window.NEEDS || []).find((n) => n.key === k) || {}).label || k;

  /* ---------------- Tiện ích ---------------- */
  const so = (x, d = 1) => Number(x).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });
  const docSo = (v) => { const n = parseFloat(String(v || '').trim().replace(',', '.')); return Number.isFinite(n) ? n : NaN; };
  const ngay = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
  const isoNgay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const hienNgay = (s) => ngay(s).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const soNgay = (tu, den) => Math.round((ngay(den) - ngay(tu)) / 864e5);
  function tuoiChu(dob, luc) {
    const a = ngay(dob), b = ngay(luc);
    let m = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
    if (b.getDate() < a.getDate()) m--;
    if (m < 1) return `${soNgay(dob, luc)} ngày tuổi`;
    const y = Math.floor(m / 12), r = m % 12;
    return m >= 24 ? `${y} tuổi${r ? ` ${r} tháng` : ''}` : `${m} tháng`; // dưới 2 tuổi các mẹ quen tính theo tháng
  }
  const giaiDoan = (thang) => (thang < 6 ? '0-6m' : thang < 12 ? '6-12m' : thang < 36 ? '1-3y' : thang < 72 ? '3-6y' : thang < 144 ? '6-12y' : '12-18y');
  const tenBe = (hs) => (hs.name ? `bé ${esc(hs.name)}` : 'bé');
  const gioi = (sex) => (sex === 1 ? 'bé trai' : 'bé gái');

  const doc = () => { try { const d = store.get(KHOA); return d && d.dob && d.sex && Array.isArray(d.log) && d.log.length ? d : null; } catch { return null; } };
  const ghi = (d) => { try { store.set(KHOA, d); } catch { /* chế độ ẩn danh: chỉ không lưu được */ } };

  let whoP = null;
  const taiWho = () => whoP || (whoP = window.WHO_GROWTH ? Promise.resolve() : new Promise((ok, loi) => {
    const s = document.createElement('script');
    s.src = `js/who-growth.js?v=${VER}`; s.onload = ok; s.onerror = () => { whoP = null; loi(new Error('who')); };
    document.head.appendChild(s);
  }));

  /* Phân tích lần đo cuối của hồ sơ, kèm tình trạng tổng hợp */
  function danhGia(hs, lan) {
    const k = phanTich({ sex: hs.sex, h: lan.h, w: lan.w, ngayTuoi: soNgay(hs.dob, lan.d) });
    const c = k.chiSo, zH = c.hfa ? c.hfa.z : 0, zB = c.bfa ? c.bfa.z : 0, zW = c.wfa ? c.wfa.z : 0;
    const ds = [];
    if (zB > 2 || (k.thang >= 60 && zB > 1)) ds.push('thuaCan');
    else if (zB > 1) ds.push('nguyCo');
    if (zH < -2) ds.push('thapCoi'); else if (zH < -1) ds.push('hoiThap');
    if (zB < -2 || zW < -2) ds.push('gay');
    if (!ds.length) ds.push('tot');
    k.tinhTrang = ds;
    k.giaiDoan = giaiDoan(k.thang);
    return k;
  }

  /* ---------------- Gợi ý sản phẩm ---------------- */
  function goiY(k) {
    const needs = []; let tranh = null;
    k.tinhTrang.forEach((t) => { TINH_TRANG[t].needs.forEach((n) => { if (!needs.includes(n)) needs.push(n); }); if (TINH_TRANG[t].tranh) tranh = TINH_TRANG[t].tranh; });
    const hopTuoi = (window.PRODUCTS || []).filter((p) => p.cat !== 'cho-me' && p.stock !== 0 && (p.ages || []).includes(k.giaiDoan) && !(tranh && (p.needs || []).includes(tranh)));
    const diem = (p) => needs.reduce((s, n, i) => s + ((p.needs || []).includes(n) ? needs.length - i : 0), 0);
    const chon = hopTuoi.filter((p) => diem(p) > 0).sort((a, b) => diem(b) - diem(a) || rankDefault(a, b)).slice(0, 4);
    const daCo = new Set(chon.map((p) => p.id));
    const banChay = hopTuoi.filter((p) => !daCo.has(p.id) && p.sold > 0).sort((a, b) => b.sold - a.sold).slice(0, 8);
    banChay.forEach((p) => daCo.add(p.id));
    const them = hopTuoi.filter((p) => !daCo.has(p.id)).sort(rankDefault).slice(0, 10);
    const lyDo = (p) => needs.filter((n) => (p.needs || []).includes(n)).slice(0, 2).map(NEED_LABEL);
    return { chon, banChay, them, lyDo };
  }

  /* ---------------- Biểu đồ tăng trưởng (SVG) ---------------- */
  /* Vẽ đúng bề rộng khung (tối đa 720px) để chữ trên trục luôn đọc được, không bị co theo màn hình */
  function bieuDo(ind, hs, k, rong) {
    const t = window.WHO_GROWTH[ind][hs.sex], maxT = t.length - 1;
    const nhip = k.thang < 24 ? 24 : k.thang < 60 ? 60 : 48;
    let tu = k.thang < 60 ? 0 : Math.max(0, Math.floor(k.thang - 30)), den = Math.min(maxT, tu + nhip);
    tu = Math.max(0, Math.min(tu, den - nhip));
    const giaTri = (lan) => (ind === 'hfa' ? lan.h : ind === 'wfa' ? lan.w : lan.w / Math.pow(lan.h / 100, 2));
    const diem = hs.log.map((lan) => ({ x: soNgay(hs.dob, lan.d) / NGAY_MOI_THANG, y: giaTri(lan), d: lan.d })).filter((p) => p.x >= tu && p.x <= den);
    const buoc = (den - tu) / 60, mau = [];
    for (let x = tu; x <= den + 1e-9; x += buoc) mau.push(x);
    const duong = (z) => mau.map((x) => [x, giaTriTaiZ(z, lmsAt(ind, hs.sex, x))]);
    const z3 = duong(-3), Z3 = duong(3);
    let yMin = Math.min(...z3.map((p) => p[1]), ...diem.map((p) => p.y)), yMax = Math.max(...Z3.map((p) => p[1]), ...diem.map((p) => p.y));
    const pad = (yMax - yMin) * 0.06; yMin -= pad; yMax += pad;
    const W = Math.round(Math.min(720, Math.max(300, rong || 640))), H = Math.round(Math.max(220, W * 0.5)), L = 40, R = 22, T = 16, B = 30;
    const X = (x) => L + (x - tu) / (den - tu) * (W - L - R), Y = (y) => T + (yMax - y) / (yMax - yMin) * (H - T - B);
    const path = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('');
    const vung = (a, b) => `${path(a)}L${[...b].reverse().map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('L')}Z`;
    const z2 = duong(-2), Z2 = duong(2), z0 = duong(0);
    const theoNam = den - tu > 30, vachX = [];
    for (let m = Math.ceil(tu / (theoNam ? 12 : 3)) * (theoNam ? 12 : 3); m <= den; m += theoNam ? 12 : 3) vachX.push(m);
    const buocY = (yMax - yMin) > 60 ? 20 : (yMax - yMin) > 24 ? 5 : (yMax - yMin) > 10 ? 2 : 1, vachY = [];
    for (let y = Math.ceil(yMin / buocY) * buocY; y <= yMax; y += buocY) vachY.push(y);
    const donVi = ind === 'hfa' ? 'cm' : ind === 'wfa' ? 'kg' : 'kg/m²';
    return `<svg class="hk-chart__svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ ${IND[ind].toLowerCase()} theo chuẩn WHO, ${diem.length} lần đo của bé">
      ${vachY.map((y) => `<line class="hk-grid" x1="${L}" x2="${W - R}" y1="${Y(y)}" y2="${Y(y)}"/><text class="hk-ax" x="${L - 6}" y="${Y(y) + 4}" text-anchor="end">${so(y, 0)}</text>`).join('')}
      ${vachX.map((m) => `<text class="hk-ax" x="${X(m)}" y="${H - 12}" text-anchor="middle">${theoNam ? m / 12 + 't' : m + 'th'}</text>`).join('')}
      <path class="hk-band hk-band--out" d="${vung(z3, Z3)}"/>
      <path class="hk-band" d="${vung(z2, Z2)}"/>
      <path class="hk-line hk-line--sd" d="${path(z2)}"/><path class="hk-line hk-line--sd" d="${path(Z2)}"/>
      <path class="hk-line" d="${path(z0)}"/>
      ${diem.length > 1 ? `<path class="hk-trail" d="${path(diem.map((p) => [p.x, p.y]))}"/>` : ''}
      ${diem.map((p, i) => `<circle class="hk-dot ${i === diem.length - 1 ? 'is-last' : ''}" cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="${i === diem.length - 1 ? 6 : 4}"><title>${hienNgay(p.d)}: ${so(p.y)} ${donVi}</title></circle>`).join('')}
      <text class="hk-ax hk-ax--unit" x="${L}" y="${T - 2}">${donVi}</text>
    </svg>`;
  }

  /* ---------------- Giao diện ---------------- */
  const root = $('#sucKhoe');
  if (!root) return;
  const the = $('#hkCard', root), kq = $('#hkResult', root);
  let moRong = false, bieuDoDangXem = 'hfa', hienTai = null, rongBieuDo = 0;

  function veThe() {
    const hs = doc();
    if (!hs) {
      the.innerHTML = `<div class="hk-card">
        <div class="hk-card__ic" aria-hidden="true">📏</div>
        <div class="hk-card__txt">
          <h2>Theo dõi sức khỏe con</h2>
          <p>Nhập chiều cao, cân nặng của bé để so với chuẩn WHO, xem bé cần những chất gì và nhận gợi ý sản phẩm hợp tuổi.</p>
          <ul class="hk-card__list"><li>${I.check}Chuẩn WHO cho bé 0-19 tuổi</li><li>${I.check}Dinh dưỡng theo từng giai đoạn</li><li>${I.check}Lưu lại để theo dõi lần sau</li></ul>
        </div>
        <div class="hk-card__acts"><button class="btn btn--primary btn--lg" type="button" data-hk-mo>Kiểm tra cho bé ${I.arrowR}</button></div>
      </div>`;
      kq.hidden = true; kq.innerHTML = '';
      return;
    }
    const lan = hs.log[hs.log.length - 1];
    if (!window.WHO_GROWTH) { taiWho().then(veThe, () => {}); }
    const k = window.WHO_GROWTH ? danhGia(hs, lan) : null;
    the.innerHTML = `<div class="hk-card hk-card--saved">
      <div class="hk-card__ic" aria-hidden="true">📏</div>
      <div class="hk-card__txt">
        <h2>Theo dõi sức khỏe con</h2>
        <p>Lần đo gần nhất của <b>${tenBe(hs)}</b> (${tuoiChu(hs.dob, lan.d)}) ngày ${hienNgay(lan.d)}: ${so(lan.h)} cm, ${so(lan.w)} kg.</p>
        ${k ? `<div class="hk-pills">${['wfa', 'hfa', 'bfa'].filter((i) => k.chiSo[i]).map((i) => `<span class="hk-pill hk-tone--${k.chiSo[i].tone}">${IND[i].replace(' theo tuổi', '')}: ${k.chiSo[i].label}</span>`).join('')}</div>` : ''}
      </div>
      <div class="hk-card__acts">
        <button class="btn btn--primary" type="button" data-hk-xem aria-expanded="${moRong}" aria-controls="hkResult">${moRong ? 'Thu gọn kết quả' : 'Xem kết quả'}</button>
        <button class="btn btn--outline" type="button" data-hk-mo>Đo lần mới</button>
      </div>
    </div>`;
    if (moRong && k) veKetQua(hs, k); else { kq.hidden = true; kq.innerHTML = ''; }
  }

  function oChiSo(c, hs, k) {
    const pct = (z) => Math.max(0, Math.min(100, (z + 4) / 8 * 100));
    const mau = { good: 'var(--hk-good)', warn: 'var(--hk-warn)', bad: 'var(--hk-bad)', info: 'var(--hk-info)' };
    const grad = dai(c.ind, k.thang).map(([a, b, t]) => `${mau[t]} ${pct(a)}% ${pct(b)}%`).join(', ');
    const donVi = c.ind === 'hfa' ? 'cm' : c.ind === 'wfa' ? 'kg' : '';
    const pv = c.pv < 1 ? 'dưới 1' : c.pv > 99 ? 'trên 99' : Math.round(c.pv);
    const so1 = (x) => so(x, 1);
    return `<div class="hk-metric hk-tone--${c.tone}">
      <div class="hk-metric__top"><span>${IND[c.ind]}</span><b class="hk-pill hk-tone--${c.tone}">${c.label}</b></div>
      <div class="hk-metric__val"><b>${so1(c.x)}</b>${donVi ? ` ${donVi}` : ''}<small>Mức ${pv}/100 so với ${gioi(hs.sex)} cùng tuổi</small></div>
      <div class="hk-scale" style="background:linear-gradient(90deg, ${grad})" aria-hidden="true"><i style="left:${pct(c.z)}%"></i></div>
      <div class="hk-scale__lbl" aria-hidden="true">${[-3, -2, 0, 2, 3].map((z) => `<span style="left:${pct(z)}%">${z > 0 ? '+' + z : z === 0 ? 'TB' : z}</span>`).join('')}</div>
      <p class="hk-metric__ref">Chuẩn WHO ${gioi(hs.sex)} ${tuoiChu(hs.dob, hs.log[hs.log.length - 1].d)}: <b>${so1(c.thap)} đến ${so1(c.cao)}${donVi ? ' ' + donVi : ''}</b>, trung bình ${so1(c.tb)}${c.ind === 'bfa' ? '. Từ ' + so1(c.cao) + ' trở lên là ' + (k.thang < 60 ? 'nguy cơ thừa cân' : 'thừa cân') : ''}</p>
    </div>`;
  }

  function veKetQua(hs, k) {
    const lan = hs.log[hs.log.length - 1], truoc = hs.log.length > 1 ? hs.log[hs.log.length - 2] : null;
    const gd = GIAI_DOAN[k.giaiDoan], tuoi = (window.AGES || []).find((a) => a.key === k.giaiDoan) || { label: '' };
    const c = k.chiSo, canhBao = Object.values(c).filter((x) => x.tone === 'warn' || x.tone === 'bad');
    const nhanXet = canhBao.length
      ? `${tenBe(hs)[0].toUpperCase() + tenBe(hs).slice(1)} cần chú ý: ${canhBao.map((x) => `${IND[x.ind].replace(/^C/, 'c')} ở mức <b>${x.label.toLowerCase()}</b>`).join(', ')}.`
      : `${tenBe(hs)[0].toUpperCase() + tenBe(hs).slice(1)} đang phát triển trong chuẩn WHO.`;
    const chenh = (a, b, d) => { const x = a - b; return `${x >= 0 ? '+' : '−'}${so(Math.abs(x), d)}`; };
    const g = goiY(k);
    const sp = (p) => `<div class="hk-pick">${g.lyDo(p).length ? `<span class="hk-pick__why">${I.check}${g.lyDo(p).map(esc).join(', ')}</span>` : ''}${productCard(p)}</div>`;
    const loi = k.tinhTrang.map((t) => `<p>${TINH_TRANG[t].loi}</p>`).join('');
    const bd = ['hfa', 'wfa', 'bfa'].filter((i) => c[i]);
    if (!bd.includes(bieuDoDangXem)) bieuDoDangXem = bd[0];
    kq.hidden = false;
    kq.innerHTML = `
      <div class="hk-res__head">
        <h3>Kết quả của ${tenBe(hs)}</h3>
        <p>${gioi(hs.sex)[0].toUpperCase() + gioi(hs.sex).slice(1)}, ${tuoiChu(hs.dob, lan.d)}, đo ngày ${hienNgay(lan.d)}. BMI ${so(k.bmi)}.</p>
      </div>
      <p class="hk-verdict hk-tone--${canhBao.length ? 'warn' : 'good'}">${nhanXet}${truoc ? ` So với lần đo ${hienNgay(truoc.d)}: ${chenh(lan.h, truoc.h, 1)} cm, ${chenh(lan.w, truoc.w, 1)} kg.` : ''}</p>
      <div class="hk-metrics hk-metrics--${Object.keys(c).length}">${['wfa', 'hfa', 'bfa'].filter((i) => c[i]).map((i) => oChiSo(c[i], hs, k)).join('')}</div>
      ${!c.wfa ? '<p class="hk-note">WHO chỉ dùng cân nặng theo tuổi cho trẻ dưới 10 tuổi, trên 10 tuổi mẹ xem chỉ số BMI.</p>' : ''}

      <div class="hk-block hk-chart">
        <div class="hk-block__head"><h3>Biểu đồ tăng trưởng</h3>
          <div class="chips" role="tablist">${bd.map((i) => `<button class="chip chip--sm ${i === bieuDoDangXem ? 'is-active' : ''}" type="button" role="tab" aria-selected="${i === bieuDoDangXem}" data-hk-bd="${i}">${IND[i].replace(' theo tuổi', '')}</button>`).join('')}</div>
        </div>
        <div class="hk-chart__body">
          <div id="hkChart"></div>
          <div class="hk-chart__side">
            <p class="hk-legend"><span><i class="hk-sw hk-sw--band"></i>Vùng chuẩn WHO (−2SD đến +2SD)</span><span><i class="hk-sw hk-sw--line"></i>Mức trung bình</span><span><i class="hk-sw hk-sw--dot"></i>Số đo của bé</span></p>
            <p class="hk-chart__tip">Chấm hồng nằm trong vùng xanh là bé đạt chuẩn. Mẹ đo lại mỗi 1-3 tháng: các chấm nối thành đường đi song song với đường trung bình nghĩa là bé lớn đều.</p>
          </div>
        </div>
      </div>

      <div class="hk-block hk-nutri">
        <div class="hk-block__head"><h3>Bé ${esc(tuoi.label)} cần gì mỗi ngày?</h3></div>
        <p class="hk-nutri__focus">${gd.trongTam}</p>
        <div class="hk-advice">${loi}</div>
        <div class="hk-nutri__grid">${gd.chat.map(([ten, luong, viSao, nguon]) => `<div class="hk-nut"><div class="hk-nut__top"><b>${ten}</b><span>${typeof luong === 'object' ? luong[hs.sex] : luong}</span></div><p>${viSao}</p><small>${nguon}</small></div>`).join('')}</div>
        <p class="hk-src">Lượng khuyến nghị mỗi ngày theo Viện Y học Hoa Kỳ (IOM, NIH); DHA theo Cơ quan An toàn Thực phẩm châu Âu (EFSA).</p>
      </div>

      ${k.thang < 24 ? '<p class="hk-milk">Sữa mẹ là thức ăn tốt nhất cho sự phát triển của trẻ. Các sản phẩm bên dưới không thay thế sữa mẹ.</p>' : ''}

      ${g.chon.length ? `<div class="hk-block">
        <div class="hk-block__head"><h3>Gợi ý cho ${tenBe(hs)}</h3><p>Chọn theo tình trạng của bé và độ tuổi ${esc(tuoi.label)}</p></div>
        <div class="grid grid--4">${g.chon.map(sp).join('')}</div>
      </div>` : ''}

      ${g.banChay.length ? `<div class="hk-block">
        <div class="hk-block__head"><h3>Các bạn cùng tuổi đang dùng</h3><p>Sản phẩm cho bé ${esc(tuoi.label)} bán chạy nhất tại shop, xếp theo số đã bán trên Shopee</p></div>
        <div class="row-scroll">${g.banChay.map((p) => productCard(p)).join('')}</div>
      </div>` : ''}

      ${g.them.length ? `<div class="hk-block">
        <div class="hk-block__head"><h3>Gợi ý thêm cho mẹ</h3><p>Những sản phẩm khác cũng hợp với bé ${esc(tuoi.label)}</p></div>
        <div class="row-scroll">${g.them.map((p) => productCard(p)).join('')}</div>
        <a class="link hk-all" href="collections.html?age=${k.giaiDoan}">Xem tất cả sản phẩm cho bé ${esc(tuoi.label)} ${I.arrowR}</a>
      </div>` : ''}

      <div class="hk-foot">
        <p>Kết quả dựa trên chuẩn tăng trưởng của WHO, chỉ để mẹ tham khảo, không thay thế khám và tư vấn của bác sĩ. Sản phẩm dinh dưỡng không phải là thuốc.</p>
        <div class="hk-foot__acts">
          ${window.SITE && SITE.expert ? `<a class="btn btn--zalo" href="${SITE.expert.zalo}" target="_blank" rel="noopener">Hỏi chuyên gia qua Zalo</a>` : ''}
          <button class="btn btn--outline" type="button" data-callback>${I.headset}Gọi lại cho tôi</button>
        </div>
      </div>`;
    hienTai = { hs, k };
    veBieuDo();
  }
  function veBieuDo() {
    const el = $('#hkChart', root);
    if (!el || !hienTai) return;
    rongBieuDo = el.clientWidth;
    el.innerHTML = bieuDo(bieuDoDangXem, hienTai.hs, hienTai.k, rongBieuDo);
  }
  /* Xoay máy / đổi cỡ cửa sổ thì vẽ lại cho vừa khung */
  if (window.ResizeObserver) new ResizeObserver(() => { const el = $('#hkChart', root); if (el && Math.abs(el.clientWidth - rongBieuDo) > 24) veBieuDo(); }).observe(kq);

  /* ---------------- Form nhập thông tin (modal dùng chung #callbackModal) ---------------- */
  function moForm() {
    taiWho().catch(() => {});
    const hs = doc() || {};
    const homNay = isoNgay(new Date());
    $('#callbackContent').innerHTML = `<div class="modal__head"><h3>📏 Thông tin của bé</h3><button class="modal__close" type="button" data-close-modal aria-label="Đóng">${I.close}</button></div>
      <form class="modal__body hk-form" id="hkForm" novalidate>
        <div class="field"><label for="hkTen">Tên bé (không bắt buộc)</label><input class="input" id="hkTen" name="name" maxlength="30" autocomplete="off" value="${esc(hs.name || '')}"></div>
        <fieldset class="field hk-sex"><legend>Giới tính <span>*</span></legend>
          <div class="chips">
            <label class="chip"><input type="radio" name="sex" value="1" ${hs.sex === 1 ? 'checked' : ''}>Bé trai</label>
            <label class="chip"><input type="radio" name="sex" value="2" ${hs.sex === 2 ? 'checked' : ''}>Bé gái</label>
          </div>
          <small class="form-error" data-err="sex"></small>
        </fieldset>
        <div class="field"><label for="hkDob">Ngày sinh <span>*</span></label><input class="input" id="hkDob" name="dob" type="date" max="${homNay}" value="${esc(hs.dob || '')}" required><small class="form-error" data-err="dob"></small></div>
        <div class="hk-form__row">
          <div class="field"><label for="hkH">Chiều cao (cm) <span>*</span></label><input class="input" id="hkH" name="h" inputmode="decimal" autocomplete="off" placeholder="VD: 82,5" required><small class="hk-help">Bé dưới 2 tuổi đo nằm</small><small class="form-error" data-err="h"></small></div>
          <div class="field"><label for="hkW">Cân nặng (kg) <span>*</span></label><input class="input" id="hkW" name="w" inputmode="decimal" autocomplete="off" placeholder="VD: 11,2" required><small class="form-error" data-err="w"></small></div>
        </div>
        <p class="hk-privacy">${I.shield}Số đo chỉ lưu trên máy của mẹ, không gửi đi đâu.</p>
        <button class="btn btn--primary btn--block btn--lg" type="submit">Xem kết quả</button>
      </form>`;
    MC.openModal('#callbackModal');
    setTimeout(() => { const o = hs.sex ? $('#hkH') : $('#callbackContent input[name="sex"]'); if (o) o.focus(); }, 300);
  }

  async function guiForm(f) {
    const d = Object.fromEntries(new FormData(f).entries());
    const loi = {};
    const sex = Number(d.sex), h = docSo(d.h), w = docSo(d.w), homNay = isoNgay(new Date());
    if (sex !== 1 && sex !== 2) loi.sex = 'Mẹ chọn giới tính của bé';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.dob || '')) loi.dob = 'Mẹ nhập ngày sinh của bé';
    else if (d.dob > homNay) loi.dob = 'Ngày sinh không được sau hôm nay';
    else if (soNgay(d.dob, homNay) / NGAY_MOI_THANG > 228) loi.dob = 'Công cụ hỗ trợ bé từ 0 đến 19 tuổi';
    if (!(h >= 40 && h <= 200)) loi.h = 'Chiều cao từ 40 đến 200 cm';
    if (!(w >= 1.5 && w <= 150)) loi.w = 'Cân nặng từ 1,5 đến 150 kg';
    try { await taiWho(); } catch { MC.toast('Chưa tải được bảng chuẩn WHO, mẹ kiểm tra mạng rồi thử lại nhé', { type: 'error' }); return; }
    const hs0 = doc();
    const cungBe = hs0 && hs0.sex === sex && hs0.dob === d.dob;
    const hs = { name: String(d.name || '').trim(), sex, dob: d.dob, log: cungBe ? hs0.log.filter((x) => x.d !== homNay) : [] };
    hs.log.push({ d: homNay, h, w });
    if (!Object.keys(loi).length && !f.dataset.daCanhBao) {
      const k = phanTich({ sex, h, w, ngayTuoi: soNgay(d.dob, homNay) });
      if (k.chiSo.hfa && Math.abs(k.chiSo.hfa.z) > 5) loi.h = 'Chiều cao này rất khác chuẩn, mẹ kiểm tra lại số đo. Đúng rồi thì bấm Xem kết quả lần nữa.';
      if (k.chiSo.bfa && Math.abs(k.chiSo.bfa.z) > 5) loi.w = 'Cân nặng này rất khác chuẩn, mẹ kiểm tra lại số đo. Đúng rồi thì bấm Xem kết quả lần nữa.';
      if (loi.h || loi.w) f.dataset.daCanhBao = '1';
    }
    $$('[data-err]', f).forEach((el) => { el.textContent = loi[el.dataset.err] || ''; });
    $$('.input', f).forEach((el) => { el.classList.toggle('is-invalid', !!loi[el.name]); el.setAttribute('aria-invalid', loi[el.name] ? 'true' : 'false'); });
    if (Object.keys(loi).length) { const o = f.querySelector('.is-invalid') || f.querySelector('input[name="sex"]'); if (o) o.focus(); return; }
    ghi(hs);
    MC.closeModal('#callbackModal');
    moRong = true; veThe();
    if (!doc()) veKetQua(hs, danhGia(hs, hs.log[hs.log.length - 1])); // không lưu được (ẩn danh) thì vẫn hiện kết quả
    setTimeout(toiMuc, 60);
  }

  const toiMuc = () => root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  /* Link "Theo dõi sức khỏe con" trên menu (NAV → index.html#sucKhoe): đang ở trang chủ thì đóng menu rồi cuộn tới khối,
     vì lúc menu mở trang bị khoá cuộn nên trình duyệt không tự nhảy tới được */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href$="#sucKhoe"]');
    if (!a) return;
    e.preventDefault();
    const dong = $('#mmenu.is-open [data-close-menu]');
    if (dong) dong.click();
    history.replaceState(null, '', '#sucKhoe');
    setTimeout(toiMuc, 60);
  });
  /* Từ trang khác bấm vào: các khối trang chủ được xếp lại thứ tự sau khi tải nên tự cuộn lại cho chắc */
  if (location.hash === '#sucKhoe') window.addEventListener('load', () => setTimeout(toiMuc, 100));

  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-hk-mo]')) { moForm(); return; }
    if (e.target.closest('[data-hk-xem]')) { moRong = !moRong; veThe(); return; }
    const b = e.target.closest('[data-hk-bd]');
    if (b) {
      bieuDoDangXem = b.dataset.hkBd;
      $$('[data-hk-bd]', root).forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
      veBieuDo();
    }
  });
  document.addEventListener('submit', (e) => { if (e.target.id === 'hkForm') { e.preventDefault(); guiForm(e.target); } });
  document.addEventListener('input', (e) => { if (e.target.closest('#hkForm')) delete e.target.closest('#hkForm').dataset.daCanhBao; });

  veThe();
})();
