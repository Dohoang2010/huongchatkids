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
  /* ---------------- Chế độ ăn theo giai đoạn ----------------
     Tham khảo khuyến nghị nuôi dưỡng trẻ nhỏ của WHO/UNICEF và tháp dinh dưỡng của Viện Dinh dưỡng Quốc gia; lượng chỉ là mức trung bình. */
  const CHE_DO_AN = {
    '0-6m': {
      bua: [['Bữa', 'Bú mẹ theo nhu cầu, 8-12 cữ/ngày'], ['Nước', 'Không cần uống thêm'], ['Ăn dặm', 'Chưa ăn, đợi đủ 6 tháng']],
      nhom: [['🤱', 'Sữa mẹ', 'Là thức ăn duy nhất và đầy đủ nhất cho bé 6 tháng đầu, kể cả trời nóng.'],
        ['👀', 'Dấu hiệu bé bú đủ', 'Khoảng 6 tã ướt mỗi ngày, bé tăng cân đều, ngủ ngon sau bú.'],
        ['🥗', 'Mẹ ăn gì', 'Mẹ ăn đủ 3 bữa, thêm bữa phụ, uống đủ nước; ăn cá 2-3 bữa mỗi tuần.']],
      thucDon: [],
      tranh: ['Nước lọc, nước cháo, nước hoa quả', 'Mật ong', 'Ăn dặm trước 6 tháng'],
      ghi: 'Không bú mẹ được, mẹ hỏi nhân viên y tế để được hướng dẫn cách nuôi phù hợp.',
    },
    '6-12m': {
      bua: [['6-8 tháng', '2-3 bữa ăn dặm + bú mẹ'], ['9-12 tháng', '3-4 bữa ăn dặm + 1-2 bữa phụ + bú mẹ'], ['Độ thô', 'Bột/cháo nghiền → cháo hạt, thức ăn băm nhỏ']],
      nhom: [['🍚', 'Tinh bột', 'Bột/cháo gạo, khoai; bắt đầu 2-3 thìa, tăng dần tới khoảng 2/3 bát mỗi bữa.'],
        ['🥩', 'Đạm', 'Thịt, cá, trứng, tôm, đậu phụ băm nhuyễn – mỗi bữa 1-2 thìa canh, gan 1 lần/tuần.'],
        ['🥬', 'Rau củ', 'Bí đỏ, cà rốt, rau ngót, cải… nấu chín, nghiền vào cháo.'],
        ['🫒', 'Dầu, mỡ', 'Mỗi bữa thêm 1 thìa cà phê dầu ăn hoặc mỡ để đủ năng lượng.'],
        ['🍌', 'Trái cây', 'Chuối, đu đủ, xoài nạo hoặc nghiền làm bữa phụ.']],
      thucDon: [['Sáng', 'Bú mẹ'], ['9h', 'Cháo thịt bò bí đỏ + dầu ăn'], ['11h', 'Bú mẹ'], ['14h', 'Chuối nghiền / sữa chua'], ['17h', 'Cháo cá rau ngót + dầu ăn'], ['Tối', 'Bú mẹ']],
      tranh: ['Muối, nước mắm, đường cho vào đồ ăn của bé', 'Mật ong (trước 12 tháng)', 'Sữa tươi thay cho sữa mẹ', 'Hạt, đồ cứng dễ hóc'],
      ghi: 'Mỗi lần cho bé thử 1 món mới và theo dõi 2-3 ngày để biết bé có dị ứng không.',
    },
    '1-3y': {
      bua: [['Bữa', '3 bữa chính + 2 bữa phụ'], ['Sữa', 'Khoảng 500 ml/ngày (sữa mẹ hoặc sữa, sữa chua)'], ['Nước', 'Khoảng 1 lít/ngày gồm cả sữa, canh']],
      nhom: [['🍚', 'Tinh bột', 'Cơm nát, cháo, mì, khoai – khoảng 1-2 bát con mỗi ngày.'],
        ['🥩', 'Đạm', 'Thịt, cá, trứng, tôm, đậu – mỗi bữa chính 1 phần, xoay vòng các loại.'],
        ['🥛', 'Sữa và chế phẩm', 'Khoảng 2 cốc sữa cùng sữa chua, phô mai.'],
        ['🥬', 'Rau xanh', 'Mỗi bữa chính có rau, thái nhỏ, nấu mềm.'],
        ['🍊', 'Trái cây', '1-2 phần mỗi ngày làm bữa phụ.']],
      thucDon: [['7h', 'Cháo / phở thịt bò + 1 hộp sữa chua'], ['9h30', 'Sữa + 1 quả chuối'], ['11h', 'Cơm nát, cá kho, canh rau ngót'], ['15h', 'Sữa + bánh flan / hoa quả'], ['18h', 'Cơm nát, trứng hấp thịt, rau luộc'], ['21h', 'Sữa trước khi ngủ']],
      tranh: ['Nước ngọt, bánh kẹo, đồ chiên rán', 'Ép ăn, cho xem màn hình khi ăn', 'Nho, hạt, thạch nguyên miếng (dễ hóc)'],
      ghi: 'Bé biếng ăn: mỗi bữa không quá 30 phút, không cho ăn vặt sát bữa, cho bé tự xúc.',
    },
    '3-6y': {
      bua: [['Bữa', '3 bữa chính + 1-2 bữa phụ'], ['Sữa', '2-3 cốc/ngày (khoảng 500 ml)'], ['Nước', '1-1,5 lít/ngày']],
      nhom: [['🍚', 'Tinh bột', 'Cơm, bún, phở, khoai – khoảng 2-3 bát con mỗi ngày.'],
        ['🥩', 'Đạm', 'Thịt, cá, trứng, tôm, đậu phụ – mỗi bữa chính 1 phần; cá 2-3 bữa mỗi tuần.'],
        ['🥛', 'Sữa và chế phẩm', 'Sữa, sữa chua, phô mai giúp đủ canxi cho xương, răng.'],
        ['🥬', 'Rau xanh', 'Khoảng 1-2 bát con rau mỗi ngày, nhiều màu.'],
        ['🍊', 'Trái cây', '2 phần mỗi ngày (VD: 1 quả cam, 1 quả chuối).']],
      thucDon: [['6h30', 'Bánh mì trứng + 1 cốc sữa'], ['Trưa', 'Cơm, thịt rim, canh bí, rau cải luộc'], ['15h', 'Sữa chua + hoa quả'], ['18h', 'Cơm, cá sốt cà chua, canh rau ngót'], ['20h30', '1 cốc sữa']],
      tranh: ['Nước ngọt, trà sữa, bánh kẹo', 'Đồ ăn nhanh, xúc xích, đồ chiên rán nhiều', 'Bỏ bữa sáng'],
      ghi: 'Cho bé ăn cùng cả nhà và tự chọn món trong các món lành mạnh, bé sẽ ăn hợp tác hơn.',
    },
    '6-12y': {
      bua: [['Bữa', '3 bữa chính + 1 bữa phụ'], ['Sữa', '3 phần/ngày (sữa, sữa chua, phô mai)'], ['Nước', '1,5-2 lít/ngày']],
      nhom: [['🍚', 'Tinh bột', 'Cơm, bún, mì, ngô, khoai – ưu tiên ngũ cốc nguyên hạt, khoảng 3-4 bát con mỗi ngày.'],
        ['🥩', 'Đạm', 'Thịt nạc, cá, trứng, tôm, đậu – mỗi bữa chính có đạm; cá béo 2 bữa mỗi tuần.'],
        ['🥛', 'Sữa và chế phẩm', '3 phần mỗi ngày để tích luỹ canxi trước dậy thì.'],
        ['🥬', 'Rau xanh', 'Khoảng 2 bát con mỗi ngày.'],
        ['🍊', 'Trái cây', '2-3 phần mỗi ngày.']],
      thucDon: [['6h30', 'Xôi / phở / bánh mì kẹp trứng + 1 cốc sữa'], ['Trưa', 'Cơm, thịt gà, canh rau, đậu phụ sốt cà'], ['16h', 'Sữa chua + hoa quả hoặc 1 nắm hạt'], ['Tối', 'Cơm, cá kho, rau xào, canh'], ['21h', '1 cốc sữa']],
      tranh: ['Trà sữa, nước ngọt có ga', 'Đồ ăn nhanh, mì gói thay bữa', 'Bỏ bữa sáng trước khi đi học'],
      ghi: 'Bữa sáng đủ tinh bột, đạm và sữa giúp bé tập trung học buổi sáng.',
    },
    '12-18y': {
      bua: [['Bữa', '3 bữa chính + 1-2 bữa phụ'], ['Sữa', '3-4 phần/ngày'], ['Nước', '2-2,5 lít/ngày, thêm khi chơi thể thao']],
      nhom: [['🍚', 'Tinh bột', 'Nhu cầu năng lượng cao nhất trong đời: cơm, bún, khoai, ngũ cốc nguyên hạt đủ mỗi bữa.'],
        ['🥩', 'Đạm', 'Thịt nạc, cá, trứng, đậu – mỗi bữa chính; thịt bò, gan giúp đủ sắt (bé gái có kinh nguyệt cần nhiều hơn).'],
        ['🥛', 'Sữa và chế phẩm', '3-4 phần mỗi ngày – gần một nửa khối xương trưởng thành hình thành ở tuổi này.'],
        ['🥬', 'Rau xanh', 'Khoảng 2-3 bát con mỗi ngày.'],
        ['🍊', 'Trái cây', '2-3 phần mỗi ngày, ưu tiên quả giàu vitamin C (cam, ổi, kiwi).']],
      thucDon: [['6h30', 'Bánh mì trứng / phở bò + 1 cốc sữa'], ['Trưa', 'Cơm, thịt bò xào rau, canh, đậu phụ'], ['16h', 'Sữa chua, hoa quả, 1 nắm hạt'], ['Tối', 'Cơm, cá hồi / cá thu, rau luộc, canh'], ['Tối muộn', '1 cốc sữa nếu học khuya']],
      tranh: ['Ăn kiêng, nhịn ăn để giảm cân', 'Nước tăng lực, trà sữa, đồ ăn nhanh thường xuyên', 'Bỏ bữa sáng'],
      ghi: 'Tuổi dậy thì dễ ăn kiêng sai cách: muốn giảm cân, con nên tăng vận động và giảm đồ ngọt thay vì bỏ bữa.',
    },
  };
  /* Điều chỉnh bữa ăn theo tình trạng (từ 6 tháng) */
  const AN_TINH_TRANG = {
    thapCoi: 'Chiều cao thấp hơn chuẩn: mỗi bữa chính đều có đạm (thịt, cá, trứng), đủ sữa mỗi ngày, thêm thực phẩm giàu kẽm, canxi (tôm, cua, hàu, sữa chua, phô mai).',
    hoiThap: 'Để hỗ trợ chiều cao: đủ đạm mỗi bữa, đủ 2-3 phần sữa mỗi ngày và thêm thực phẩm giàu canxi, kẽm.',
    gay: 'Bé nhẹ cân: chia nhỏ thành 5-6 bữa, thêm dầu ăn, bơ, phô mai, sữa vào món ăn để tăng năng lượng mà không cần ăn nhiều hơn.',
    thuaCan: 'Bé thừa cân: không bỏ bữa, giữ đủ đạm và rau; giảm nước ngọt, bánh kẹo, đồ chiên; thay sữa có đường bằng sữa không đường; ăn chậm, nhai kỹ.',
    nguyCo: 'Bé có nguy cơ thừa cân: hạn chế đồ ngọt, nước ngọt và đồ ăn vặt, tăng rau xanh trong bữa chính.',
  };

  /* ---------------- Vận động theo giai đoạn ----------------
     Thời lượng theo khuyến nghị của WHO (trẻ dưới 5 tuổi: 2019; 5-17 tuổi: 2020); giấc ngủ theo Viện Hàn lâm Y học Giấc ngủ Hoa Kỳ (AASM). */
  const VAN_DONG = {
    '0-6m': {
      trongTam: 'Bé chưa cần "tập thể dục". Mẹ cho bé nằm sấp chơi và cử động tự do nhiều lần trong ngày để cổ, lưng và tay chân khoẻ dần.',
      chiTieu: [['Vận động', 'Nhiều lần/ngày, nằm sấp tổng 30 phút'], ['Màn hình', 'Không xem'], ['Giấc ngủ', '14-17 giờ (gồm giấc ngày)']],
      goiY: [['🤸', 'Nằm sấp chơi (tummy time)', 'Bắt đầu 3-5 phút mỗi lần khi bé tỉnh, tăng dần. Đặt đồ chơi trước mặt để bé ngẩng đầu.'],
        ['🦶', 'Đạp chân, với tay', 'Treo đồ chơi để bé với, đạp; cho bé nằm trên thảm thay vì nằm nôi, ghế rung quá lâu.'],
        ['🛁', 'Chơi khi tắm, massage', 'Massage tay chân nhẹ nhàng sau tắm giúp bé thư giãn, ngủ ngon.']],
      luuY: 'Không để bé ngồi ghế ăn, xe đẩy, địu quá 1 giờ liền.',
    },
    '6-12m': {
      trongTam: 'Bé tập lẫy, bò, ngồi, đứng vịn. Mẹ tạo không gian an toàn trên sàn để bé tự di chuyển nhiều nhất có thể.',
      chiTieu: [['Vận động', 'Nhiều lần/ngày, chơi trên sàn'], ['Màn hình', 'Không xem'], ['Giấc ngủ', '12-16 giờ (gồm giấc ngày)']],
      goiY: [['🐾', 'Tập bò, trườn', 'Đặt đồ chơi xa một chút để bé bò tới lấy; bò giúp phối hợp tay chân và chắc vai.'],
        ['🧸', 'Đứng vịn, men theo ghế', 'Kê sofa, bàn thấp chắc chắn để bé vịn đứng và tập bước.'],
        ['🎶', 'Chơi cùng bố mẹ', 'Lăn bóng, vỗ tay theo nhạc, ú oà – vận động kèm tương tác giúp bé phát triển ngôn ngữ.']],
      luuY: 'Không dùng xe tập đi (dễ ngã, không giúp bé đi sớm hơn). Không để bé ngồi ghế, xe đẩy quá 1 giờ liền.',
    },
    '1-3y': {
      trongTam: 'Bé tập đi vững, chạy, leo trèo. Cần ít nhất 3 giờ vận động mỗi ngày, rải đều, càng nhiều kiểu càng tốt.',
      chiTieu: [['Vận động', 'Ít nhất 180 phút/ngày'], ['Màn hình', 'Dưới 2 tuổi: không; 2 tuổi: tối đa 1 giờ'], ['Giấc ngủ', '11-14 giờ (gồm giấc ngày)']],
      goiY: [['🏃', 'Chạy nhảy, leo trèo', 'Chơi ở công viên, sân chơi; leo cầu trượt thấp, bò qua đường hầm.'],
        ['⚽', 'Đá bóng, ném bóng', 'Bóng to, mềm giúp bé phối hợp tay - mắt - chân.'],
        ['💃', 'Nhảy theo nhạc', 'Nhún nhảy, giậm chân, xoay vòng theo bài hát thiếu nhi.'],
        ['🚲', 'Xe chòi chân', 'Giúp bé giữ thăng bằng, khoẻ chân, làm quen trước khi đạp xe.']],
      luuY: 'Không để bé ngồi yên quá 1 giờ liền. Khi bé ngồi, đọc truyện, chơi xếp hình tốt hơn xem màn hình.',
    },
    '3-6y': {
      trongTam: 'Tuổi mẫu giáo: ít nhất 3 giờ vận động mỗi ngày, trong đó có 1 giờ vận động mạnh làm bé thở nhanh, ra mồ hôi.',
      chiTieu: [['Vận động', '180 phút/ngày, trong đó 60 phút mạnh'], ['Màn hình', 'Tối đa 1 giờ/ngày'], ['Giấc ngủ', '10-13 giờ (gồm giấc trưa)']],
      goiY: [['🏊', 'Bơi', 'Vận động toàn thân, tốt cho tim phổi; cho bé học bơi để an toàn dưới nước.'],
        ['🪢', 'Nhảy dây, bật nhảy', 'Lò cò, nhảy ô, bật xa – các bài có bật nhảy giúp xương chắc khoẻ.'],
        ['🚴', 'Đạp xe', 'Xe có bánh phụ hoặc xe thăng bằng, đội mũ bảo hiểm.'],
        ['🤾', 'Trò chơi vận động', 'Đuổi bắt, kéo co, ném bóng, múa, võ thiếu nhi – bé vui là bé chịu vận động.']],
      luuY: 'Vận động ngoài trời buổi sáng vừa có nắng cho vitamin D vừa giúp bé ngủ ngon hơn.',
    },
    '6-12y': {
      trongTam: 'Tuổi tiểu học: trung bình ít nhất 60 phút vận động vừa đến mạnh mỗi ngày, chủ yếu là vận động sức bền.',
      chiTieu: [['Vận động', '60 phút/ngày vừa đến mạnh'], ['Tập mạnh, chắc xương', 'Ít nhất 3 buổi/tuần'], ['Màn hình giải trí', 'Càng ít càng tốt, nên dưới 2 giờ'], ['Giấc ngủ', '9-12 giờ']],
      goiY: [['🏊', 'Bơi lội', 'Môn toàn thân, ít chấn thương, phù hợp hầu hết các bé.'],
        ['🏀', 'Bóng rổ, cầu lông, bóng chuyền', 'Nhiều động tác bật nhảy, vươn người giúp xương chắc khoẻ.'],
        ['⚽', 'Bóng đá, chạy bộ, đạp xe', 'Tăng sức bền tim phổi, giúp bé tập trung học tốt hơn.'],
        ['🥋', 'Võ, nhảy dây, leo trèo', 'Tăng sức mạnh cơ và xương – thay cho tạ, bé chưa cần tập tạ nặng.']],
      luuY: 'Mỗi 1 giờ ngồi học, cho bé đứng dậy đi lại, vươn vai vài phút.',
    },
    '12-18y': {
      trongTam: 'Tuổi dậy thì: trung bình ít nhất 60 phút vận động vừa đến mạnh mỗi ngày. Đây là giai đoạn xương tích luỹ nhanh nhất.',
      chiTieu: [['Vận động', '60 phút/ngày vừa đến mạnh'], ['Tập mạnh, chắc xương', 'Ít nhất 3 buổi/tuần'], ['Màn hình giải trí', 'Càng ít càng tốt'], ['Giấc ngủ', '8-10 giờ']],
      goiY: [['🏀', 'Bóng rổ, bóng chuyền, cầu lông', 'Môn có bật nhảy giúp xương chắc khoẻ trong giai đoạn lớn nhanh.'],
        ['🏊', 'Bơi, chạy bộ, đạp xe', 'Rèn sức bền, giảm căng thẳng học tập.'],
        ['💪', 'Tập sức mạnh', 'Hít đất, plank, squat, kéo xà – tập đúng kỹ thuật, tăng dần, có người hướng dẫn nếu dùng tạ.'],
        ['🧘', 'Giãn cơ, yoga', 'Giúp dáng thẳng, giảm đau mỏi khi ngồi học lâu.']],
      luuY: 'Ngủ đủ giấc, ngủ trước 23 giờ: hormone tăng trưởng tiết nhiều khi ngủ sâu.',
    },
  };
  /* Gợi ý môn theo giới tính (từ 3 tuổi): 1 bé trai, 2 bé gái – thay cho danh sách chung */
  const VD_GIOI = {
    '3-6y': {
      1: { goiY: [['🏊', 'Bơi', 'Vận động toàn thân, tốt cho tim phổi; học bơi sớm để an toàn dưới nước.'],
        ['⚽', 'Đá bóng mini, chạy đuổi', 'Bé trai tuổi này thích chạy nhảy, tranh bóng – giúp khoẻ chân, nhanh nhẹn.'],
        ['🥋', 'Võ thiếu nhi', 'Vovinam, taekwondo: khoẻ cơ, rèn tính kỷ luật và tự tin.'],
        ['🚴', 'Xe thăng bằng, đạp xe', 'Rèn thăng bằng, sức bền chân; nhớ đội mũ bảo hiểm.']],
        ghi: 'Bé trai thường hiếu động: cho bé xả năng lượng ngoài trời mỗi ngày, bé sẽ ngủ ngon và ít quấy hơn.' },
      2: { goiY: [['🏊', 'Bơi', 'Vận động toàn thân, tốt cho tim phổi; học bơi sớm để an toàn dưới nước.'],
        ['💃', 'Múa, ballet thiếu nhi', 'Giúp bé dẻo dai, giữ dáng thẳng, cảm thụ âm nhạc.'],
        ['🪢', 'Nhảy dây, lò cò, nhảy ô', 'Các trò bật nhảy giúp xương chắc khoẻ, chân khoẻ.'],
        ['🤸', 'Thể dục nhịp điệu, leo trèo sân chơi', 'Tăng sự khéo léo, thăng bằng và sức mạnh tay.']],
        ghi: 'Bé gái cũng cần vận động mạnh 60 phút mỗi ngày như bé trai: khuyến khích bé chạy nhảy, đừng chỉ chơi tĩnh.' },
    },
    '6-12y': {
      1: { goiY: [['⚽', 'Bóng đá', 'Tăng sức bền, phối hợp đồng đội; chơi 2-3 buổi mỗi tuần.'],
        ['🏀', 'Bóng rổ', 'Nhiều động tác bật nhảy, vươn người giúp xương chắc khoẻ.'],
        ['🏊', 'Bơi lội', 'Môn toàn thân, ít chấn thương.'],
        ['🥋', 'Võ: karate, taekwondo, vovinam', 'Tăng sức mạnh cơ, phản xạ và tính kỷ luật.']],
        ghi: 'Bé trai thường dậy thì khoảng 9-14 tuổi, muộn hơn bé gái: duy trì môn có bật nhảy và ngủ đủ để chuẩn bị cho giai đoạn cao vọt.' },
      2: { goiY: [['🏸', 'Cầu lông', 'Vươn người, bật nhảy liên tục; dễ tập cùng bố mẹ, bạn bè.'],
        ['💃', 'Múa, aerobic, nhảy hiện đại', 'Rèn sức bền, sự dẻo dai và dáng đẹp, bé gái thường rất thích.'],
        ['🏊', 'Bơi lội', 'Môn toàn thân, ít chấn thương.'],
        ['🏐', 'Nhảy dây, bóng chuyền mini', 'Bật nhảy nhiều giúp xương chắc khoẻ trước tuổi dậy thì.']],
        ghi: 'Bé gái thường dậy thì sớm hơn, khoảng 8-13 tuổi – đây là lúc chiều cao tăng nhanh, mẹ giữ cho bé vận động đều và ngủ đủ.' },
    },
    '12-18y': {
      1: { goiY: [['🏀', 'Bóng rổ, bóng chuyền', 'Bật nhảy nhiều, hỗ trợ xương chắc khoẻ trong giai đoạn cao vọt.'],
        ['💪', 'Tập sức mạnh', 'Hít đất, kéo xà, squat, plank; tập tạ nhẹ khi có người hướng dẫn đúng kỹ thuật.'],
        ['⚽', 'Bóng đá, chạy bộ', 'Rèn sức bền tim phổi, giải toả căng thẳng học tập.'],
        ['🏊', 'Bơi', 'Toàn thân, giúp vai lưng phát triển cân đối.']],
        ghi: 'Tập sức mạnh đúng cách không làm con thấp đi; chỉ tránh tạ nặng khi chưa có người hướng dẫn.' },
      2: { goiY: [['🏸', 'Cầu lông, bóng chuyền', 'Vận động vừa sức, nhiều bật nhảy, dễ chơi cùng bạn.'],
        ['💃', 'Nhảy, aerobic, zumba', 'Tăng sức bền, vui và dễ duy trì lâu dài.'],
        ['🧘', 'Yoga, pilates', 'Dẻo dai, giữ dáng thẳng, giảm đau mỏi khi ngồi học lâu.'],
        ['🏊', 'Bơi, đạp xe', 'Rèn sức bền, tốt cho tim phổi.']],
        ghi: 'Tuổi dậy thì nhiều bé gái giảm vận động: mẹ khuyến khích con chọn môn mình thích, tập cùng bạn. Những ngày có kinh vẫn vận động nhẹ được.' },
    },
  };
  /* Gợi ý thêm theo tình trạng (chỉ áp dụng từ 1 tuổi) */
  const VD_TINH_TRANG = {
    thapCoi: 'Chiều cao của bé đang thấp hơn chuẩn: ưu tiên các môn vận động toàn thân, bật nhảy như bơi, bóng rổ, nhảy dây, cầu lông; cho bé ngủ trước 22 giờ và chơi ngoài trời buổi sáng.',
    hoiThap: 'Để hỗ trợ chiều cao: thêm các môn có bật nhảy, vươn người (nhảy dây, bóng rổ, bơi, cầu lông) và giữ giấc ngủ đủ, ngủ sớm.',
    thuaCan: 'Bé đang thừa cân: tăng dần thời gian vận động vừa đến mạnh (đạp xe, bơi, đi bộ nhanh, chơi bóng), giảm thời gian ngồi xem màn hình, cả nhà cùng vận động để bé có động lực. Không bắt bé nhịn ăn.',
    nguyCo: 'Bé có nguy cơ thừa cân: mỗi ngày thêm vận động ngoài trời, hạn chế màn hình và đồ ăn vặt khi ngồi xem.',
    gay: 'Bé đang nhẹ cân: vận động vừa sức, vui chơi là chính, không ép tập nặng; cho bé ăn bữa phụ sau khi vận động để bù năng lượng.',
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
  const VER = '20261014e';
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
  /* Sản phẩm shop muốn ưu tiên đứng đầu "Gợi ý cho bé" (khi hợp tuổi, còn hàng): váng sữa canxi hữu cơ Calciumore */
  const SP_UU_TIEN = ['26060839019'];
  function goiY(k) {
    const needs = []; let tranh = null;
    k.tinhTrang.forEach((t) => { TINH_TRANG[t].needs.forEach((n) => { if (!needs.includes(n)) needs.push(n); }); if (TINH_TRANG[t].tranh) tranh = TINH_TRANG[t].tranh; });
    const hopTuoi = (window.PRODUCTS || []).filter((p) => p.cat !== 'cho-me' && p.stock !== 0 && (p.ages || []).includes(k.giaiDoan) && !(tranh && (p.needs || []).includes(tranh)));
    const diem = (p) => needs.reduce((s, n, i) => s + ((p.needs || []).includes(n) ? needs.length - i : 0), 0);
    const uuTien = SP_UU_TIEN.map((id) => hopTuoi.find((p) => p.id === id)).filter(Boolean);
    const chon = [...uuTien, ...hopTuoi.filter((p) => diem(p) > 0 && !uuTien.includes(p)).sort((a, b) => diem(b) - diem(a) || rankDefault(a, b))].slice(0, 4);
    const daCo = new Set(chon.map((p) => p.id));
    const banChay = hopTuoi.filter((p) => !daCo.has(p.id) && p.sold > 0).sort((a, b) => b.sold - a.sold).slice(0, 8);
    banChay.forEach((p) => daCo.add(p.id));
    const them = hopTuoi.filter((p) => !daCo.has(p.id)).sort(rankDefault).slice(0, 10);
    const lyDo = (p) => { const l = needs.filter((n) => (p.needs || []).includes(n)).slice(0, 2).map(NEED_LABEL); return l.length || !uuTien.includes(p) ? l : (p.needs || []).filter((n) => n !== 'cho-me' && n !== 'organic').slice(0, 2).map(NEED_LABEL); };
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

  const tenTho = (hs) => (hs.name ? 'bé ' + hs.name : 'bé');
  /* ---------------- Hình bé (SVG tự vẽ, đổ bóng kiểu 3D, màu pastel) ----------------
     Bé lớn theo tuổi (trẻ nhỏ đầu to, lớn dần thân dài ra), bé trai / bé gái khác tóc và quần áo.
     loai: 'be' (bé của mẹ) | 'cu' (bé lần đo trước, nhạt hơn) | 'tb' (bạn trung bình theo chuẩn WHO) */
  let soHinh = 0;
  function hinhBe(sex, thang, loai = 'be') {
    const id = 'hb' + (++soHinh), gai = sex === 2;
    const tl = thang < 12 ? 0.36 : thang < 36 ? 0.31 : thang < 72 ? 0.27 : thang < 144 ? 0.22 : 0.185;   // tỉ lệ đầu / chiều cao
    const r = tl * 100, cy = r + 2, co = 2 * r + 2, hong = co + (198 - co) * (thang < 36 ? 0.5 : 0.46), chan = 194;
    const rong = thang < 12 ? 50 : thang < 36 ? 44 : thang < 144 ? 38 : 34;   // bề ngang thân
    const x0 = 50 - rong / 2, x1 = 50 + rong / 2;
    const ao = loai === 'tb' ? ['#E4E0F2', '#C9C2E3'] : gai ? ['#FFC6D6', '#FF94B4'] : ['#B6ECE4', '#6ED3C4'];
    const quan = loai === 'tb' ? '#B9B1D8' : gai ? '#FF94B4' : '#9DB8FF';
    const toc = loai === 'tb' ? '#A79FC4' : '#6B4A3A';
    const than = gai
      ? `M${x0 + 4},${co + 2} Q50,${co - 3} ${x1 - 4},${co + 2} L${x1 + 7},${hong + 6} Q50,${hong + 12} ${x0 - 7},${hong + 6} Z`   // váy xoè
      : `M${x0 + 2},${co + 2} Q50,${co - 3} ${x1 - 2},${co + 2} L${x1},${hong} L${x0},${hong} Z`;
    const chanX = [50 - rong * 0.2, 50 + rong * 0.2], dayChan = thang < 36 ? 12 : 10;
    const tocTren = `M${50 - r - 1},${cy + 2} Q${50 - r},${cy - r - 4} 50,${cy - r - 3} Q${50 + r},${cy - r - 4} ${50 + r + 1},${cy + 2} Q${50 + r * 0.55},${cy - r * 0.45} 50,${cy - r * 0.55} Q${50 - r * 0.55},${cy - r * 0.45} ${50 - r - 1},${cy + 2} Z`;
    const tocGai = gai ? (thang < 144
      ? `<circle cx="${50 - r - 3}" cy="${cy - r * 0.35}" r="${r * 0.36}" fill="${toc}"/><circle cx="${50 + r + 3}" cy="${cy - r * 0.35}" r="${r * 0.36}" fill="${toc}"/>
         <circle cx="${50 - r * 0.7}" cy="${cy - r * 0.78}" r="${r * 0.13}" fill="${ao[1]}"/><circle cx="${50 + r * 0.7}" cy="${cy - r * 0.78}" r="${r * 0.13}" fill="${ao[1]}"/>`
      : `<path d="M${50 - r},${cy} Q${50 - r - 4},${cy + r * 1.5} ${50 - r * 0.5},${cy + r * 1.7} L${50 + r * 0.5},${cy + r * 1.7} Q${50 + r + 4},${cy + r * 1.5} ${50 + r},${cy} Z" fill="${toc}"/>`) : '';
    return `<svg class="hb hb--${loai}" viewBox="0 0 100 200" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="${id}d" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#FFEFE4"/><stop offset=".65" stop-color="#FFD6BF"/><stop offset="1" stop-color="#F2B597"/></radialGradient>
        <linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${ao[0]}"/><stop offset="1" stop-color="${ao[1]}"/></linearGradient>
      </defs>
      <ellipse cx="50" cy="197" rx="${rong * 0.62}" ry="3" fill="#000" opacity=".1"/>
      ${tocGai && thang >= 144 ? tocGai : ''}
      <g class="hb__chan">${chanX.map((x) => `<rect x="${x - dayChan / 2}" y="${hong - 4}" width="${dayChan}" height="${chan - hong}" rx="${dayChan / 2}" fill="url(#${id}d)"/><ellipse cx="${x + 1}" cy="${chan}" rx="${dayChan * 0.75}" ry="4" fill="${loai === 'tb' ? '#9E96BE' : '#5B6B8C'}"/>`).join('')}</g>
      ${gai ? '' : `<rect x="${x0}" y="${hong - 10}" width="${rong}" height="${(chan - hong) * 0.42 + 10}" rx="6" fill="${quan}"/>`}
      <g class="hb__tay"><path d="M${x0 + 3},${co + 8} Q${x0 - 9},${co + (hong - co) * 0.5} ${x0 - 5},${hong - 4}" stroke="url(#${id}d)" stroke-width="${dayChan - 1}" stroke-linecap="round" fill="none"/>
        <path class="hb__tay-p" d="M${x1 - 3},${co + 8} Q${x1 + 9},${co + (hong - co) * 0.5} ${x1 + 5},${hong - 4}" stroke="url(#${id}d)" stroke-width="${dayChan - 1}" stroke-linecap="round" fill="none"/></g>
      <path d="${than}" fill="url(#${id}a)"/>
      <path d="M${x0 + 8},${co + 6} Q50,${co + 1} ${x1 - 8},${co + 6}" stroke="#fff" stroke-opacity=".55" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      ${tocGai && thang < 144 ? tocGai : ''}
      <circle cx="50" cy="${cy}" r="${r}" fill="url(#${id}d)"/>
      <path d="${tocTren}" fill="${toc}"/>
      <ellipse cx="${50 - r * 0.38}" cy="${cy + r * 0.12}" rx="${r * 0.085}" ry="${r * 0.11}" fill="#3A2A2A"/><ellipse cx="${50 + r * 0.38}" cy="${cy + r * 0.12}" rx="${r * 0.085}" ry="${r * 0.11}" fill="#3A2A2A"/>
      <circle cx="${50 - r * 0.35}" cy="${cy + r * 0.06}" r="${r * 0.03}" fill="#fff"/><circle cx="${50 + r * 0.41}" cy="${cy + r * 0.06}" r="${r * 0.03}" fill="#fff"/>
      <ellipse cx="${50 - r * 0.6}" cy="${cy + r * 0.38}" rx="${r * 0.15}" ry="${r * 0.09}" fill="#FF8FA8" opacity=".55"/><ellipse cx="${50 + r * 0.6}" cy="${cy + r * 0.38}" rx="${r * 0.15}" ry="${r * 0.09}" fill="#FF8FA8" opacity=".55"/>
      <path class="hb__mieng" d="M${50 - r * 0.2},${cy + r * 0.4} Q50,${cy + r * 0.62} ${50 + r * 0.2},${cy + r * 0.4}" stroke="#B5524F" stroke-width="${Math.max(1.4, r * 0.06)}" fill="none" stroke-linecap="round"/>
    </svg>`;
  }
  const thangTai = (hs, d) => soNgay(hs.dob, d) / NGAY_MOI_THANG;
  /* Nút hình bé: chạm vào thì bé nhảy lên và nói (câu nói ngẫu nhiên trong data-hk-cau) */
  const nutBe = (sex, thang, loai, cau, nhan) => `<button class="hk-be hk-be--${loai}" type="button" data-hk-be data-hk-cau="${esc(JSON.stringify(cau))}" aria-label="${esc(nhan || 'Chạm vào bé')}">${hinhBe(sex, thang, loai)}<span class="hk-be__noi" aria-live="polite"></span></button>`;

  /* "So với chuẩn WHO": bé lần trước · bé hôm nay · bạn trung bình, đứng trên cùng một thước chiều cao */
  function canhSoSanh(hs, k) {
    const c = k.chiSo.hfa; if (!c) return '';
    const lan = hs.log[hs.log.length - 1], truoc = hs.log.length > 1 ? hs.log[hs.log.length - 2] : null, ten = tenTho(hs), Ten = ten[0].toUpperCase() + ten.slice(1);
    const dH = truoc ? lan.h - truoc.h : 0;
    const ds = [];
    if (truoc) ds.push({ loai: 'cu', nhan: 'Lần trước', phu: hienNgay(truoc.d), h: truoc.h, thang: thangTai(hs, truoc.d), cau: [`Đây là con lúc ${tuoiChu(hs.dob, truoc.d)} nè mẹ!`, `Hồi đó con cao ${so(truoc.h)} cm thôi.`] });
    ds.push({ loai: 'be', nhan: Ten, phu: 'hôm nay', h: lan.h, thang: k.thang,
      cau: [`Con cao ${so(lan.h)} cm rồi nè mẹ!`, ...(truoc && dH > 0 ? [`Con cao thêm ${so(dH)} cm so với lần trước đó!`] : []),
        c.z >= 0 ? 'Con cao hơn mức trung bình của các bạn rồi nha!' : 'Mẹ cho con ăn đủ chất, ngủ sớm để con cao thêm nha!', 'Con muốn ra ngoài chạy nhảy một chút!', 'Mẹ nhớ đo cho con mỗi 1-3 tháng nhé!'] });
    ds.push({ loai: 'tb', nhan: 'Trung bình', phu: 'chuẩn WHO', h: c.tb, thang: k.thang, cau: [`Mình là bạn ${gioi(hs.sex)} cao trung bình ${so(c.tb)} cm theo chuẩn WHO nè!`, 'Mình cùng tuổi với bạn đó!'] });
    const maxH = Math.max(...ds.map((x) => x.h)) * 1.14, buoc = maxH > 120 ? 20 : maxH > 60 ? 10 : 5, vach = [];
    for (let v = 0; v <= maxH; v += buoc) vach.push(v);
    const pct = (h) => (h / maxH * 100).toFixed(2);
    return `<div class="hk-block hk-ss">
      <div class="hk-block__head"><h3>So với chuẩn WHO</h3><p>${truoc ? 'Lần trước · hôm nay · bạn trung bình cùng tuổi' : 'Bé hôm nay và bạn trung bình cùng tuổi, cùng giới'} trên cùng một thước. Mẹ chạm vào bé nhé!</p></div>
      <div class="hk-ss__canh">
        <div class="hk-ss__thuoc" aria-hidden="true">${vach.map((v) => `<span style="bottom:${pct(v)}%">${v}</span>`).join('')}</div>
        <div class="hk-ss__ds">${ds.map((x) => `<div class="hk-ss__o hk-ss__o--${x.loai}">
          <div class="hk-ss__cot" style="height:${pct(x.h)}%"><b class="hk-ss__so">${so(x.h)} cm</b>${nutBe(hs.sex, x.thang, x.loai, x.cau, x.nhan + ' ' + so(x.h) + ' cm')}</div>
          <div class="hk-ss__ten"><b>${esc(x.nhan)}</b><small>${esc(x.phu)}</small></div></div>`).join('')}</div>
      </div>
      <p class="hk-ss__ket hk-tone--${c.tone}">${Math.abs(lan.h - c.tb) < 0.1 ? `${esc(Ten)} cao đúng bằng bạn trung bình.` : `${esc(Ten)} ${lan.h > c.tb ? 'cao hơn' : 'thấp hơn'} bạn trung bình <b>${so(Math.abs(lan.h - c.tb))} cm</b>.`}${truoc ? ` So với lần trước bé ${dH >= 0 ? 'cao thêm' : 'giảm'} <b>${so(Math.abs(dH))} cm</b>.` : ''}</p>
    </div>`;
  }

  /* "Hành trình lớn lên": các chặng tuổi, bé đứng ở chặng nào thì ghim "Bé ở đây" (bấm chặng → sản phẩm hợp tuổi đó) */
  const GIUA_CHANG = { '0-6m': 3, '6-12m': 9, '1-3y': 24, '3-6y': 54, '6-12y': 108, '12-18y': 180 };
  function hanhTrinh(hs, k) {
    const ds = (window.AGES || []).filter((a) => GIUA_CHANG[a.key] != null);
    if (!ds.length) return '';
    const cao = (m) => lmsAt('hfa', hs.sex, m)[1], max = cao(GIUA_CHANG['12-18y']) * 1.05;
    return `<div class="hk-block hk-ht">
      <div class="hk-block__head"><h3>Hành trình lớn lên của ${tenBe(hs)}</h3><p>Chiều cao trung bình mỗi chặng theo chuẩn WHO. Bấm một chặng để xem sản phẩm hợp tuổi.</p></div>
      <div class="hk-ht__ds">${ds.map((a) => { const o = a.key === k.giaiDoan, m = o ? k.thang : GIUA_CHANG[a.key], h = o ? hs.log[hs.log.length - 1].h : cao(m);
        return `<a class="hk-ht__o ${o ? 'is-o' : ''}" href="collections.html?age=${a.key}" style="--nen:${esc(a.color || '#F4F6FA')}">
          ${o ? '<span class="hk-ht__ghim">📍 Bé ở đây</span>' : ''}
          <span class="hk-ht__khung"><span class="hk-ht__be" style="height:${(h / max * 100).toFixed(1)}%">${hinhBe(hs.sex, m, o ? 'be' : 'tb')}</span></span>
          <b>${esc(a.label)}</b><small>${esc(a.desc || '')} · ~${so(h, 0)} cm</small></a>`; }).join('')}</div>
    </div>`;
  }

  /* "Mỗi ngày một điều về bé": mẹo theo chặng tuổi, đổi mỗi ngày (thông tin chung, không thay lời khuyên của bác sĩ) */
  const MOT_DIEU = {
    '0-6m': ['Bé sơ sinh ngủ 14-17 tiếng mỗi ngày, giấc ngủ là lúc bé lớn nhanh nhất.', 'Trò chuyện, hát cho bé nghe mỗi ngày giúp bé làm quen với giọng nói của mẹ.', 'Cho bé nằm sấp vài phút mỗi ngày khi bé thức, có người lớn bên cạnh, để cổ và vai bé khoẻ hơn.',
      'Đến khoảng 3 tháng tuổi, nhiều bé đã biết cười đáp lại khi mẹ cười với bé.', 'Trong 6 tháng đầu, WHO khuyến nghị bú mẹ hoàn toàn, chưa cần cho bé uống nước.', 'Mẹ đo chiều dài cho bé dưới 2 tuổi ở tư thế nằm để có số đo chính xác.'],
    '6-12m': ['Từ 6 tháng, bé bắt đầu ăn dặm: mẹ cho bé làm quen từng món, mỗi món vài ngày.', 'Thức ăn giàu sắt như thịt, trứng, rau xanh đậm rất cần cho bé giai đoạn ăn dặm.', 'Để bé tự cầm nắm thức ăn mềm giúp bé khéo tay hơn.',
      'Khoảng 9-12 tháng, nhiều bé tập bò, vịn đứng: mẹ dọn chỗ chơi an toàn cho bé nhé.', 'Đọc sách tranh cùng bé mỗi tối là thói quen tốt cho khả năng ngôn ngữ.', 'Bé dưới 1 tuổi chưa nên ăn mật ong và hạn chế muối, đường trong bữa ăn.'],
    '1-3y': ['Bé 1-3 tuổi cần ngủ 11-14 tiếng mỗi ngày, kể cả giấc trưa.', 'Mẹ cho bé vận động ít nhất 3 tiếng mỗi ngày: chạy, nhảy, leo trèo đều tốt.', 'Bé tuổi này thích bắt chước: mẹ ăn rau cùng bé, bé sẽ dễ ăn rau hơn.',
      'Uống sữa và ăn các món giàu canxi giúp xương bé chắc khoẻ.', 'Hạn chế cho bé dưới 2 tuổi xem màn hình (TV, điện thoại).', 'Mỗi bữa ăn nên gói gọn trong khoảng 30 phút, không ép bé ăn.'],
    '3-6y': ['Bé 3-5 tuổi cần ngủ 10-13 tiếng mỗi ngày để lớn tốt.', 'Chơi ngoài trời có nắng sớm giúp bé vận động và vui vẻ hơn.', 'Cho bé tự xúc ăn, tự mặc áo giúp bé tự lập hơn.',
      'Trung bình bé tuổi mầm non cao thêm khoảng 6-7 cm mỗi năm.', 'Mẹ cho bé uống nước lọc thay nước ngọt để bảo vệ răng.', 'Đánh răng 2 lần mỗi ngày, mẹ kiểm tra lại giúp bé nhé.'],
    '6-12y': ['Bé tiểu học cần ngủ 9-12 tiếng mỗi đêm.', 'WHO khuyến nghị trẻ 5-17 tuổi vận động trung bình 60 phút mỗi ngày.', 'Bữa sáng đủ chất giúp bé tập trung học tốt hơn.',
      'Bơi, nhảy dây, bóng rổ là những môn bé tuổi này thường thích.', 'Mẹ đo chiều cao cho bé vào buổi sáng, bé đứng thẳng, không mang giày.', 'Giới hạn thời gian dùng điện thoại, máy tính giúp bé ngủ ngon hơn.'],
    '12-18y': ['Tuổi dậy thì là giai đoạn chiều cao tăng nhanh nhất sau những năm đầu đời.', 'Thiếu niên 13-18 tuổi cần ngủ 8-10 tiếng mỗi đêm.', 'Canxi và vitamin D rất cần cho xương trong tuổi dậy thì.',
      'Vận động đều đặn 60 phút mỗi ngày giúp con khoẻ và giảm căng thẳng học hành.', 'Bữa ăn đủ đạm, rau quả giúp con có năng lượng cho cả ngày.', 'Mẹ lắng nghe và trò chuyện cùng con mỗi ngày là món quà lớn cho tuổi teen.'],
  };
  function motDieu(k) {
    const ds = MOT_DIEU[k.giaiDoan] || []; if (!ds.length) return '';
    const n = Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
    return `<p class="hk-motdieu"><b>💡 Mỗi ngày một điều về bé</b>${ds[n % ds.length]}</p>`;
  }

  /* Chạm vào bé: bé nhảy lên và nói lần lượt từng câu */
  function noiBe(b) {
    let cau = []; try { cau = JSON.parse(b.dataset.hkCau || '[]'); } catch { cau = []; }
    const i = (Number(b.dataset.lan ?? -1) + 1) % (cau.length || 1); b.dataset.lan = i;
    const o = b.querySelector('.hk-be__noi'); if (o && cau.length) { o.textContent = cau[i]; o.classList.add('is-hien'); }
    b.classList.remove('is-nhay'); void b.offsetWidth; b.classList.add('is-nhay');
    clearTimeout(b._t); b._t = setTimeout(() => { if (o) o.classList.remove('is-hien'); }, 3500);
  }

  /* ---------------- Giao diện ---------------- */
  const root = $('#sucKhoe');
  if (!root) return;
  const the = $('#hkCard', root), kq = $('#hkResult', root);
  let moRong = false, bieuDoDangXem = 'hfa', hienTai = null, rongBieuDo = 0;
  let tam = null; // kết quả tra cứu không lưu (mẹ bỏ tích "Lưu thông tin bé"): chỉ hiện, không ghi vào máy

  function veThe() {
    const hs = tam || doc();
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
    const tt = tenTho(hs);
    the.innerHTML = `<div class="hk-card hk-card--saved">
      ${k ? `<div class="hk-card__ic hk-card__ic--be">${nutBe(hs.sex, k.thang, 'be', [`Chào mẹ! Con là ${tt} nè!`, `Con ${tuoiChu(hs.dob, isoNgay(new Date()))} rồi đó mẹ!`, 'Mẹ bấm Xem kết quả để xem con lớn thế nào nhé!', 'Lâu chưa đo thì mẹ bấm Đo lần mới cho con nha!'], 'Chạm vào ' + tt)}</div>` : '<div class="hk-card__ic" aria-hidden="true">📏</div>'}
      <div class="hk-card__txt">
        <h2>${tam ? 'Kết quả tra cứu' : 'Theo dõi sức khỏe con'}</h2>
        <p>${tam ? 'Số đo' : 'Lần đo gần nhất'} của <b>${tenBe(hs)}</b> (${tuoiChu(hs.dob, lan.d)}) ngày ${hienNgay(lan.d)}: ${so(lan.h)} cm, ${so(lan.w)} kg.${tam ? ' <span class="hk-tam">Chưa lưu</span>' : ''}</p>
        ${k ? `<div class="hk-pills">${['wfa', 'hfa', 'bfa'].filter((i) => k.chiSo[i]).map((i) => `<span class="hk-pill hk-tone--${k.chiSo[i].tone}">${IND[i].replace(' theo tuổi', '')}: ${k.chiSo[i].label}</span>`).join('')}</div>` : ''}
        ${k ? motDieu(k) : ''}
      </div>
      <div class="hk-card__acts">
        <button class="btn btn--primary" type="button" data-hk-xem aria-expanded="${moRong}" aria-controls="hkResult">${moRong ? 'Thu gọn kết quả' : 'Xem kết quả'}</button>
        ${tam ? '<button class="btn btn--teal" type="button" data-hk-luu>Lưu thông tin bé</button>' : ''}
        <button class="btn btn--outline" type="button" data-hk-mo>${tam ? 'Tra cứu bé khác' : 'Đo lần mới'}</button>
        ${tam && doc() ? '<button class="btn btn--ghost" type="button" data-hk-ve>Về bé đã lưu</button>' : ''}
      </div>
    </div>`;
    if (moRong && k) veKetQua(hs, k); else { kq.hidden = true; kq.innerHTML = ''; }
  }

  /* ---------------- Đánh giá chi tiết theo số đo thật ----------------
     Mỗi chỉ số: chênh so với mức trung bình WHO, thứ hạng trên 100 trẻ cùng tuổi, nhận xét theo z-score
     (chia mịn hơn ngưỡng WHO để mẹ biết bé đang ở đâu trong vùng chuẩn). */
  const NX = {
    hfa: [[-3, 'bad', 'Bé thấp còi nặng so với chuẩn WHO. Mẹ nên đưa bé đi khám dinh dưỡng sớm.'],
      [-2, 'warn', 'Bé đang thấp còi (dưới mức −2SD). Mẹ cần cải thiện dinh dưỡng, giấc ngủ và nên hỏi ý kiến bác sĩ.'],
      [-1, 'warn', 'Vẫn trong chuẩn nhưng thuộc nhóm thấp. Mẹ nên ưu tiên cải thiện chiều cao để bé bắt kịp các bạn.'],
      [-0.5, 'good', 'Trong chuẩn, thấp hơn mức trung bình một chút.'],
      [0.5, 'good', 'Ngang mức trung bình của trẻ cùng tuổi.'],
      [1, 'good', 'Trong chuẩn, cao hơn mức trung bình.'],
      [2, 'good', 'Bé thuộc nhóm cao, chiều cao phát triển rất tốt.'],
      [3, 'good', 'Bé rất cao so với các bạn cùng tuổi, vẫn trong ngưỡng WHO.'],
      [99, 'info', 'Bé cao vượt trội (trên +3SD). Thường do di truyền; nếu bố mẹ không cao, mẹ nên hỏi ý kiến bác sĩ.']],
    wfa: [[-3, 'bad', 'Bé nhẹ cân nặng so với chuẩn WHO. Mẹ nên đưa bé đi khám dinh dưỡng sớm.'],
      [-2, 'warn', 'Bé đang nhẹ cân so với tuổi. Mẹ cần tăng năng lượng và đạm trong bữa ăn.'],
      [-1, 'warn', 'Vẫn trong chuẩn nhưng thuộc nhóm nhẹ cân. Mẹ chú ý cho bé ăn đủ bữa, đủ năng lượng.'],
      [-0.5, 'good', 'Trong chuẩn, nhẹ hơn mức trung bình một chút.'],
      [0.5, 'good', 'Ngang mức trung bình của trẻ cùng tuổi.'],
      [1, 'good', 'Trong chuẩn, nặng hơn mức trung bình.'],
      [2, 'good', 'Trong chuẩn, thuộc nhóm nặng cân. Mẹ xem BMI để biết cân nặng có cân đối với chiều cao không.'],
      [99, 'info', 'Bé nặng hơn hầu hết các bạn cùng tuổi. Mẹ xem BMI để biết bé có thừa cân không.']],
  };
  const NX_BMI = (nho) => [[-3, 'bad', 'Bé gầy còm nặng: cân nặng quá thấp so với chiều cao. Mẹ nên đưa bé đi khám sớm.'],
    [-2, 'warn', 'Bé đang gầy so với chiều cao. Mẹ cần tăng năng lượng và đạm để bé lên cân.'],
    [-1, 'good', 'Trong chuẩn nhưng hơi gầy so với chiều cao, mẹ có thể cho bé ăn thêm bữa phụ.'],
    [1, 'good', 'Cân nặng cân đối với chiều cao.'],
    ...(nho
      ? [[2, 'info', 'Bé có nguy cơ thừa cân. Mẹ hạn chế đồ ngọt và cho bé vận động nhiều hơn.'], [3, 'warn', 'Bé đang thừa cân so với chiều cao.'], [99, 'bad', 'Bé béo phì so với chiều cao. Mẹ nên hỏi ý kiến bác sĩ dinh dưỡng.']]
      : [[2, 'warn', 'Bé đang thừa cân so với chiều cao.'], [99, 'bad', 'Bé béo phì so với chiều cao. Mẹ nên hỏi ý kiến bác sĩ dinh dưỡng.']])];
  const nhanXetZ = (bang, z) => bang.find(([toi]) => z <= toi) || bang[bang.length - 1];

  function danhGiaChiTiet(hs, k) {
    const c = k.chiSo, cung = `${gioi(hs.sex)} cùng tuổi`, lan = hs.log[hs.log.length - 1];
    const hang = (x) => (x.pv < 1 ? 'thấp hơn gần như tất cả' : x.pv > 99 ? 'cao hơn gần như tất cả' : `cao hơn khoảng ${Math.round(x.pv)}/100`);
    const lech = (x, dv) => { const d = x.x - x.tb, [hon, kem] = dv === 'kg' ? ['Nặng', 'Nhẹ'] : ['Cao', 'Thấp']; return Math.abs(d) < (dv === 'kg' ? 0.05 : 0.1) ? 'Đúng bằng mức trung bình' : `${d > 0 ? hon : kem} hơn mức trung bình ${so(Math.abs(d))} ${dv}`; };
    const dong = [];
    if (c.hfa) { const [, tone, txt] = nhanXetZ(NX.hfa, c.hfa.z); dong.push({ ten: 'Chiều cao', tone, so: `${so(c.hfa.x)} cm`, chi: `${lech(c.hfa, 'cm')} (trung bình ${so(c.hfa.tb)} cm), ${hang(c.hfa)} ${cung}.`, txt }); }
    if (c.wfa) { const [, tone, txt] = nhanXetZ(NX.wfa, c.wfa.z); dong.push({ ten: 'Cân nặng', tone, so: `${so(c.wfa.x)} kg`, chi: `${lech(c.wfa, 'kg')} (trung bình ${so(c.wfa.tb)} kg), ${hang(c.wfa).replace('cao hơn', 'nặng hơn').replace('thấp hơn', 'nhẹ hơn')} ${cung}.`, txt }); }
    if (c.bfa) { const [, tone, txt] = nhanXetZ(NX_BMI(k.thang < 60), c.bfa.z); dong.push({ ten: 'BMI', tone, so: so(c.bfa.x), chi: `Vùng cân đối với chiều cao: ${so(c.bfa.thap)} đến ${so(c.bfa.cao)}.`, txt }); }

    /* Tổng kết: ghép chiều cao với độ cân đối (BMI) */
    const zH = c.hfa ? c.hfa.z : 0, zB = c.bfa ? c.bfa.z : 0, ten = tenBe(hs)[0].toUpperCase() + tenBe(hs).slice(1);
    const canDoi = zB >= -1 && zB <= 1;
    let tong;
    if (zH < -2 || zB < -2 || zB > (k.thang < 60 ? 2 : 1) || (c.wfa && c.wfa.z < -2)) tong = `${ten} có chỉ số ngoài chuẩn WHO, mẹ xem lời khuyên bên dưới và nên cho bé đi khám dinh dưỡng.`;
    else if (zH >= 1 && canDoi) tong = `${ten} phát triển rất tốt: chiều cao nổi trội và cân nặng cân đối với chiều cao.`;
    else if (zH >= 1) tong = `${ten} cao tốt so với tuổi${zB < -1 ? ' nhưng hơi gầy so với chiều cao, mẹ chú ý thêm năng lượng cho bé' : ', mẹ để ý cân nặng đừng tăng nhanh hơn chiều cao'}.`;
    else if (zH < -1) tong = `${ten} ${canDoi ? 'cân đối' : 'trong chuẩn'} nhưng chiều cao hơi thấp, đây là chỉ số mẹ nên ưu tiên cải thiện.`;
    else if (canDoi) tong = `${ten} phát triển cân đối: chiều cao và cân nặng đều quanh mức trung bình của trẻ cùng tuổi.`;
    else tong = `${ten} có chiều cao bình thường, ${zB < -1 ? 'hơi gầy so với chiều cao' : 'hơi nặng so với chiều cao'}.`;

    /* Đà tăng trưởng so với lần đo trước (từ 3 tuần trở lên mới so được tốc độ) */
    let da = '';
    const truoc = hs.log.length > 1 ? hs.log[hs.log.length - 2] : null;
    if (truoc) {
      const ngayCach = soNgay(truoc.d, lan.d);
      const k0 = phanTich({ sex: hs.sex, h: truoc.h, w: truoc.w, ngayTuoi: soNgay(hs.dob, truoc.d) });
      const khoang = ngayCach < 60 ? `${ngayCach} ngày` : `${so(ngayCach / NGAY_MOI_THANG, 0)} tháng`;
      const dH = lan.h - truoc.h, dW = lan.w - truoc.w;
      da = `Sau ${khoang} bé ${dH >= 0 ? 'cao thêm' : 'giảm'} ${so(Math.abs(dH))} cm, ${dW >= 0 ? 'tăng' : 'giảm'} ${so(Math.abs(dW))} kg.`;
      const toc = (ind, nhanh, cham, deu) => { if (!c[ind] || !k0.chiSo[ind]) return ''; const dz = c[ind].z - k0.chiSo[ind].z; return dz > 0.25 ? nhanh : dz < -0.25 ? cham : deu; };
      if (ngayCach >= 21) da += ' ' + [toc('hfa', 'Chiều cao tăng nhanh hơn chuẩn, bé đang vượt lên so với các bạn.', 'Chiều cao tăng chậm hơn chuẩn, mẹ nên chú ý dinh dưỡng và giấc ngủ của bé.', 'Chiều cao tăng đều theo chuẩn.'),
        toc('bfa', 'Cân nặng tăng nhanh hơn chiều cao.', 'Cân nặng tăng chậm hơn chiều cao.', 'Cân nặng tăng cân đối với chiều cao.')].filter(Boolean).join(' ');
    }
    const tone = dong.some((d) => d.tone === 'bad') ? 'bad' : dong.some((d) => d.tone === 'warn') ? 'warn' : 'good';
    return { dong, tong, da, tone };
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
    const dg = danhGiaChiTiet(hs, k);
    const an = CHE_DO_AN[k.giaiDoan], anThem = k.thang >= 6 ? k.tinhTrang.map((t) => AN_TINH_TRANG[t]).filter(Boolean) : [];
    const vdGioi = (VD_GIOI[k.giaiDoan] || {})[hs.sex] || null;
    const vd = VAN_DONG[k.giaiDoan], vdThem = k.thang >= 12 ? k.tinhTrang.map((t) => VD_TINH_TRANG[t]).filter(Boolean) : [];
    const bd = ['hfa', 'wfa', 'bfa'].filter((i) => c[i]);
    if (!bd.includes(bieuDoDangXem)) bieuDoDangXem = bd[0];
    kq.hidden = false;
    kq.innerHTML = `
      <div class="hk-res__head">
        <h3>Kết quả của ${tenBe(hs)}</h3>
        <p>${gioi(hs.sex)[0].toUpperCase() + gioi(hs.sex).slice(1)}, ${tuoiChu(hs.dob, lan.d)}, đo ngày ${hienNgay(lan.d)}. BMI ${so(k.bmi)}.</p>
      </div>
      <p class="hk-verdict hk-tone--${canhBao.length ? 'warn' : 'good'}">${nhanXet}${truoc ? ` So với lần đo ${hienNgay(truoc.d)}: ${chenh(lan.h, truoc.h, 1)} cm, ${chenh(lan.w, truoc.w, 1)} kg.` : ''}</p>
      ${canhSoSanh(hs, k)}
      <div class="hk-metrics hk-metrics--${Object.keys(c).length}">${['wfa', 'hfa', 'bfa'].filter((i) => c[i]).map((i) => oChiSo(c[i], hs, k)).join('')}</div>
      <details class="hk-block hk-eval hk-acc" open>
        <summary class="hk-block__head"><h3>Đánh giá chi tiết</h3></summary>
        <p class="hk-eval__tong hk-tone--${dg.tone}">${dg.tong}</p>
        <ul class="hk-eval__ds">${dg.dong.map((d) => `<li class="hk-tone--${d.tone}"><div class="hk-eval__dau"><span>${d.ten}</span><b>${d.so}</b></div><p><span class="hk-eval__so">${d.chi}</span> ${d.txt}</p></li>`).join('')}</ul>
        ${dg.da ? `<p class="hk-eval__da"><b>Đà tăng trưởng:</b> ${dg.da}</p>` : ''}
        <div class="hk-advice"><b class="hk-advice__t">Lời khuyên cho mẹ</b>${loi}</div>
      </details>
      ${!c.wfa ? '<p class="hk-note">WHO chỉ dùng cân nặng theo tuổi cho trẻ dưới 10 tuổi, trên 10 tuổi mẹ xem chỉ số BMI.</p>' : ''}

      <details class="hk-block hk-chart hk-acc">
        <summary class="hk-block__head"><h3>Biểu đồ tăng trưởng</h3><p>Các lần đo của bé trên biểu đồ chuẩn WHO</p></summary>
          <div class="chips hk-chart__chips" role="tablist">${bd.map((i) => `<button class="chip chip--sm ${i === bieuDoDangXem ? 'is-active' : ''}" type="button" role="tab" aria-selected="${i === bieuDoDangXem}" data-hk-bd="${i}">${IND[i].replace(' theo tuổi', '')}</button>`).join('')}</div>
        <div class="hk-chart__body">
          <div id="hkChart"></div>
          <div class="hk-chart__side">
            <p class="hk-legend"><span><i class="hk-sw hk-sw--band"></i>Vùng chuẩn WHO (−2SD đến +2SD)</span><span><i class="hk-sw hk-sw--line"></i>Mức trung bình</span><span><i class="hk-sw hk-sw--dot"></i>Số đo của bé</span></p>
            <p class="hk-chart__tip">Chấm hồng nằm trong vùng xanh là bé đạt chuẩn. Mẹ đo lại mỗi 1-3 tháng: các chấm nối thành đường đi song song với đường trung bình nghĩa là bé lớn đều.</p>
          </div>
        </div>
      </details>

      <details class="hk-block hk-nutri hk-acc">
        <summary class="hk-block__head"><h3>Bé ${esc(tuoi.label)} cần gì mỗi ngày?</h3><p>Các chất cần thiết và lượng khuyến nghị</p></summary>
        <p class="hk-nutri__focus">${gd.trongTam}</p>
        <div class="hk-nutri__grid">${gd.chat.map(([ten, luong, viSao, nguon]) => `<div class="hk-nut"><div class="hk-nut__top"><b>${ten}</b><span>${typeof luong === 'object' ? luong[hs.sex] : luong}</span></div><p>${viSao}</p><small>${nguon}</small></div>`).join('')}</div>
        <p class="hk-src">Lượng khuyến nghị mỗi ngày theo Viện Y học Hoa Kỳ (IOM, NIH); DHA theo Cơ quan An toàn Thực phẩm châu Âu (EFSA).</p>
      </details>

      ${an ? `<details class="hk-block hk-an hk-acc">
        <summary class="hk-block__head"><h3>Chế độ ăn cho bé ${esc(tuoi.label)}</h3><p>Lượng tham khảo trung bình, mẹ điều chỉnh theo sức ăn của bé</p></summary>
        <div class="hk-vd__chi">${an.bua.map(([ten, gt]) => `<div><small>${ten}</small><b>${gt}</b></div>`).join('')}</div>
        ${anThem.length ? `<div class="hk-vd__them">${anThem.map((t) => `<p>${t}</p>`).join('')}</div>` : ''}
        <h4 class="hk-an__t">${k.thang < 6 ? 'Mẹ cần biết' : 'Mỗi ngày nên có'}</h4>
        <div class="hk-vd__ds">${an.nhom.map(([ic, ten, mo]) => `<div class="hk-vd__o"><span class="hk-vd__ic" aria-hidden="true">${ic}</span><div><b>${ten}</b><p>${mo}</p></div></div>`).join('')}</div>
        ${an.thucDon.length ? `<h4 class="hk-an__t">Thực đơn gợi ý 1 ngày</h4><ol class="hk-an__td">${an.thucDon.map(([gio, mon]) => `<li><span>${gio}</span><p>${mon}</p></li>`).join('')}</ol>` : ''}
        <h4 class="hk-an__t">Nên hạn chế</h4>
        <ul class="hk-an__tranh">${an.tranh.map((t) => `<li>${t}</li>`).join('')}</ul>
        <p class="hk-vd__luu">${an.ghi}</p>
        <p class="hk-src">Tham khảo khuyến nghị nuôi dưỡng trẻ nhỏ của WHO/UNICEF và tháp dinh dưỡng của Viện Dinh dưỡng Quốc gia. Bé dị ứng hoặc có bệnh lý, mẹ hỏi bác sĩ dinh dưỡng.</p>
      </details>` : ''}

      ${vd ? `<details class="hk-block hk-vd hk-acc">
        <summary class="hk-block__head"><h3>Vận động cho bé ${esc(tuoi.label)}</h3><p>Thời gian vận động, giấc ngủ và môn phù hợp</p></summary>
        <p class="hk-nutri__focus">${vd.trongTam}</p>
        <div class="hk-vd__chi">${vd.chiTieu.map(([ten, gt]) => `<div><small>${ten}</small><b>${gt}</b></div>`).join('')}</div>
        ${vdThem.length ? `<div class="hk-vd__them">${vdThem.map((t) => `<p>${t}</p>`).join('')}</div>` : ''}
        <h4 class="hk-an__t">${vdGioi ? `Môn phù hợp cho ${gioi(hs.sex)}` : 'Gợi ý vận động'}</h4>
        <div class="hk-vd__ds">${(vdGioi ? vdGioi.goiY : vd.goiY).map(([ic, ten, mo]) => `<div class="hk-vd__o"><span class="hk-vd__ic" aria-hidden="true">${ic}</span><div><b>${ten}</b><p>${mo}</p></div></div>`).join('')}</div>
        ${vdGioi ? `<p class="hk-vd__luu">${vdGioi.ghi}</p>` : ''}
        <p class="hk-vd__luu">${vd.luuY}</p>
        <p class="hk-src">Thời lượng vận động theo khuyến nghị của Tổ chức Y tế Thế giới (WHO); giấc ngủ theo Viện Hàn lâm Y học Giấc ngủ Hoa Kỳ (AASM). Bé có bệnh lý, mẹ hỏi bác sĩ trước khi cho bé tập môn mới.</p>
      </details>` : ''}

      ${hanhTrinh(hs, k)}

      ${k.thang < 24 ? '<p class="hk-milk">Sữa mẹ là thức ăn tốt nhất cho sự phát triển của trẻ. Các sản phẩm bên dưới không thay thế sữa mẹ.</p>' : ''}

      ${g.chon.length ? `<div class="hk-block">
        <div class="hk-block__head"><h3>Gợi ý cho ${tenBe(hs)}</h3><p>Chọn theo tình trạng của bé và độ tuổi ${esc(tuoi.label)}</p></div>
        <div class="grid grid--4">${g.chon.map(sp).join('')}</div>
      </div>` : ''}

      <form class="hk-tv" id="hkTv" novalidate>
        <div class="hk-tv__txt">
          <h3>Mẹ để lại số điện thoại để Hương Chất Kids tư vấn cho mẹ</h3>
          <p>Chuyên gia dinh dưỡng xem chỉ số của ${tenBe(hs)} rồi gọi tư vấn miễn phí: nên bổ sung gì, dùng sản phẩm nào, liều ra sao.</p>
        </div>
        <div class="hk-tv__o">
          <label class="sr-only" for="hkTvTen">Tên của mẹ</label><input class="input" id="hkTvTen" name="ten" maxlength="60" autocomplete="name" placeholder="Tên của mẹ (không bắt buộc)" value="${esc(((MC.Customer && MC.Customer.get()) || {}).name || '')}">
          <label class="sr-only" for="hkTvSdt">Số điện thoại</label><input class="input" id="hkTvSdt" name="sdt" type="tel" inputmode="numeric" autocomplete="tel" maxlength="15" placeholder="Số điện thoại của mẹ" value="${esc(((MC.Customer && MC.Customer.get()) || {}).phone || '')}" required>
          <button class="btn btn--primary" type="submit">${I.headset}Nhờ tư vấn cho bé</button>
        </div>
        <small class="form-error" id="hkTvLoi" role="alert"></small>
        <p class="hk-tv__luu">Khi gửi, tên bé, ngày sinh, chiều cao, cân nặng và đánh giá ở trên được gửi kèm để chuyên gia tư vấn đúng cho bé.</p>
      </form>

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
    hienTai = { hs, k, dg };
    veBieuDo();
    /* Hành trình lớn lên: cuộn tới chặng bé đang ở (điện thoại không hiện hết các chặng) */
    const oHt = kq.querySelector('.hk-ht__o.is-o'); if (oHt) oHt.parentElement.scrollLeft = Math.max(0, oHt.offsetLeft - oHt.parentElement.offsetLeft - 24);
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
    const daLuu = doc(), hs = daLuu || {};
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
        <label class="hk-luu"><input type="checkbox" name="luu" value="1" ${daLuu ? 'checked' : ''}><span><b>Lưu thông tin bé để theo dõi lần sau</b><small>Không tích: chỉ xem kết quả (tra hộ người thân, bạn bè), không lưu lại.</small></span></label>
        <p class="hk-privacy">${I.shield}Số đo chỉ lưu trên máy của mẹ khi mẹ tích chọn, không gửi đi đâu.</p>
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
    if (d.luu) { ghi(hs); tam = doc() ? null : hs; } // ẩn danh không lưu được thì vẫn hiện kết quả như tra cứu
    else tam = hs;
    MC.closeModal('#callbackModal');
    moRong = true; veThe();
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
    const be = e.target.closest('[data-hk-be]'); if (be) { noiBe(be); return; }
    if (e.target.closest('[data-hk-mo]')) { moForm(); return; }
    if (e.target.closest('[data-hk-xem]')) { moRong = !moRong; veThe(); return; }
    if (e.target.closest('[data-hk-ve]')) { tam = null; veThe(); return; }
    if (e.target.closest('[data-hk-luu]') && tam) {
      const cu = doc();
      if (cu && !(cu.sex === tam.sex && cu.dob === tam.dob) && !confirm(`Máy này đang lưu thông tin ${cu.name ? 'bé ' + cu.name : 'một bé khác'}. Thay bằng bé này?`)) return;
      ghi(tam);
      if (doc()) { tam = null; MC.toast('Đã lưu thông tin bé. Lần sau mẹ đo tiếp, web sẽ tự so với lần này.', { type: 'ok' }); veThe(); }
      else MC.toast('Trình duyệt đang chặn lưu (chế độ ẩn danh), mẹ mở trình duyệt thường để lưu nhé', { type: 'error' });
      return;
    }
    const b = e.target.closest('[data-hk-bd]');
    if (b) {
      bieuDoDangXem = b.dataset.hkBd;
      $$('[data-hk-bd]', root).forEach((x) => { const on = x === b; x.classList.toggle('is-active', on); x.setAttribute('aria-selected', on); });
      veBieuDo();
    }
  });
  root.addEventListener('toggle', (e) => { if (e.target.classList && e.target.classList.contains('hk-chart') && e.target.open) veBieuDo(); }, true);
  document.addEventListener('submit', (e) => { if (e.target.id === 'hkForm') { e.preventDefault(); guiForm(e.target); } });
  root.addEventListener('submit', async (e) => {
    if (e.target.id !== 'hkTv' || !hienTai) return;
    e.preventDefault();
    const f = e.target, loi = $('#hkTvLoi', root), ten = f.ten.value.trim(), sdt = f.sdt.value.trim();
    if (!MC.phoneOk(sdt)) { loi.textContent = 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0)'; f.sdt.focus(); return; }
    loi.textContent = '';
    const { hs, k, dg } = hienTai, lan = hs.log[hs.log.length - 1], c = k.chiSo;
    const pv = (x) => (x.pv < 1 ? 'dưới 1' : x.pv > 99 ? 'trên 99' : Math.round(x.pv)) + '/100';
    const chiTiet = [c.hfa && `Chiều cao ${so(c.hfa.x)} cm: ${c.hfa.label} (mức ${pv(c.hfa)})`, c.wfa && `Cân nặng ${so(c.wfa.x)} kg: ${c.wfa.label} (mức ${pv(c.wfa)})`, c.bfa && `BMI ${so(c.bfa.x)}: ${c.bfa.label}`].filter(Boolean).join('; ');
    const canChu = Object.values(c).filter((x) => x.tone === 'warn' || x.tone === 'bad').map((x) => IND[x.ind] + ': ' + x.label).join(', ');
    if (MC.Customer) MC.Customer.set({ ...(MC.Customer.get() || {}), ...(ten ? { name: ten } : {}), phone: sdt });
    const nut = f.querySelector('[type=submit]'); nut.disabled = true; nut.textContent = 'Đang gửi…';
    try {
      const r = await MC.loyaltyApi('leadTuVan', { nguon: 'suc-khoe', ten, sdt, tenBe: hs.name || '', ngaySinh: hs.dob, gioiTinh: hs.sex, tuoi: tuoiChu(hs.dob, lan.d), cao: lan.h, nang: lan.w,
        danhGia: [dg.tong, chiTiet && chiTiet + '.', dg.da].filter(Boolean).join(' '), tinhTrang: canChu, link: location.href.split('#')[0] });
      if (!r || !r.ok) throw new Error((r && r.msg) || 'Chưa gửi được, mẹ thử lại nhé');
      f.innerHTML = `<div class="hk-tv__xong">${I.check}<div><b>Đã gửi chỉ số của ${tenBe(hs)} cho chuyên gia</b><p>Hương Chất Kids sẽ gọi số <b>${esc(sdt)}</b> ${MC.hoursNote ? MC.hoursNote() : 'sớm'} để tư vấn cho mẹ. Mẹ để ý điện thoại nhé 💗</p></div></div>`;
    } catch (err) {
      nut.disabled = false; nut.innerHTML = `${I.headset}Nhờ tư vấn cho bé`; loi.textContent = err.message;
    }
  });
  document.addEventListener('input', (e) => { if (e.target.closest('#hkForm')) delete e.target.closest('#hkForm').dataset.daCanhBao; });

  veThe();
})();
