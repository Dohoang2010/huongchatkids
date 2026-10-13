/* Tạo js/who-growth.js từ bảng LMS chính thức của WHO.
   Chạy lại: node tools/who-growth.mjs
   - 0–5 tuổi: WHO Child Growth Standards (2006), gói R "anthro" – bảng theo ngày tuổi
   - 5–19 tuổi: WHO Growth Reference (2007), gói R "anthroplus" – bảng theo tháng tuổi
   Kết quả: mỗi chỉ số là mảng [L, M, S] theo từng tháng tuổi (chỉ số mảng = số tháng). */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const RAW = 'https://raw.githubusercontent.com/WorldHealthOrganization';
const SRC = {
  wfa: [`${RAW}/anthro/master/data-raw/growthstandards/weianthro.txt`, `${RAW}/anthroplus/master/data-raw/growthstandards/wfawho2007.txt`],
  hfa: [`${RAW}/anthro/master/data-raw/growthstandards/lenanthro.txt`, `${RAW}/anthroplus/master/data-raw/growthstandards/hfawho2007.txt`],
  bfa: [`${RAW}/anthro/master/data-raw/growthstandards/bmianthro.txt`, `${RAW}/anthroplus/master/data-raw/growthstandards/bfawho2007.txt`],
};
const MAX_MONTH = 228; // 19 tuổi

async function bang(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Không tải được ${url}: ${res.status}`);
  const [head, ...rows] = (await res.text()).trim().split(/\r?\n/);
  const cot = head.split('\t');
  const i = (k) => cot.indexOf(k);
  const out = { 1: new Map(), 2: new Map() };
  rows.forEach((r) => {
    const c = r.split('\t');
    out[c[i('sex')]].set(Number(c[i('age')]), [Number(c[i('l')]), Number(c[i('m')]), Number(c[i('s')])]);
  });
  return out;
}

const data = {};
for (const [key, [urlNgay, urlThang]] of Object.entries(SRC)) {
  const [ngay, thang] = await Promise.all([bang(urlNgay), bang(urlThang)]);
  data[key] = {};
  for (const sex of [1, 2]) {
    const arr = [];
    for (let m = 0; m <= MAX_MONTH; m++) {
      const v = m <= 60 ? ngay[sex].get(Math.round(m * 30.4375)) : thang[sex].get(m);
      if (!v) break; // cân nặng/tuổi của WHO 2007 chỉ có tới 10 tuổi
      arr.push(v);
    }
    data[key][sex] = arr;
  }
}

const out = fileURLToPath(new URL('../js/who-growth.js', import.meta.url));
writeFileSync(out, `/* Bảng LMS chuẩn tăng trưởng WHO theo tháng tuổi – TỰ SINH bởi tools/who-growth.mjs, đừng sửa tay.
   wfa: cân nặng/tuổi (0–120 tháng), hfa: chiều dài-chiều cao/tuổi (0–228), bfa: BMI/tuổi (0–228).
   Khoá 1 = bé trai, 2 = bé gái; phần tử [L, M, S]. Nguồn: WHO Child Growth Standards 2006 + WHO Growth Reference 2007. */
window.WHO_GROWTH = ${JSON.stringify(data)};
`);
console.log('Đã ghi', out, Object.entries(data).map(([k, v]) => `${k}: ${v[1].length}/${v[2].length} tháng`).join(', '));
