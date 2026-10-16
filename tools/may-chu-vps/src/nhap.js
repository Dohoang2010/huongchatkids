'use strict';
/* Chép dữ liệu Google Sheets (qua Apps Script, lệnh vpsXuat có khoá) về VPS, và đối chiếu mã băm từng trang. */
const crypto = require('node:crypto');
const { maHoaDong } = require('./kho');

async function goiXuat(cauHinh, thamSo, lanThu = 3) {
  const q = new URLSearchParams(Object.assign({ action: 'vpsXuat', key: cauHinh.vpsKhoa }, thamSo));
  let loi;
  for (let i = 0; i < lanThu; i++) {
    try {
      const r = await fetch(cauHinh.appsScriptUrl + '?' + q, { redirect: 'follow', signal: AbortSignal.timeout(300000) });
      const t = await r.text();
      const d = JSON.parse(t);
      if (!d.ok) throw new Error('Apps Script trả lỗi: ' + (d.msg || t.slice(0, 200)));
      return d;
    } catch (e) { loi = e; await new Promise((ok) => setTimeout(ok, 2000 * (i + 1))); }
  }
  throw loi;
}

/* Lấy toàn bộ dữ liệu → {muiGio, ngonNgu, trang:[…], thuocTinh, luc} */
async function layTuAppsScript(cauHinh, ghi = () => {}) {
  if (!cauHinh.appsScriptUrl || !cauHinh.vpsKhoa) throw new Error('Thiếu APPS_SCRIPT_URL hoặc VPS_KHOA');
  const meta = await goiXuat(cauHinh, { viec: 'meta' });
  const LO = 3000;
  const trang = [];
  for (const t of meta.trang) {
    const giaTri = [];
    for (let tu = 1; tu <= t.soDong; tu += LO) {
      const d = await goiXuat(cauHinh, { viec: 'trang', ten: t.ten, tu, so: LO });
      giaTri.push(...d.giaTri);
      if (d.soDong < tu + LO - 1) break;   // trang ngắn lại trong lúc chép
    }
    trang.push({ ten: t.ten, soCotToiDa: t.soCotToiDa, dongCoDinh: t.dongCoDinh, cotChu: t.cotChu || {}, giaTri });
    ghi('  ' + t.ten + ': ' + giaTri.length + ' dòng');
  }
  return { muiGio: meta.muiGio, ngonNgu: meta.ngonNgu, trang, thuocTinh: meta.thuocTinh || {}, luc: meta.luc };
}

function bamTrang(giaTri) { return crypto.createHash('sha256').update(JSON.stringify(giaTri), 'utf8').digest('hex'); }

/* So mã băm từng trang giữa Google Sheets và VPS */
async function doiChieuBam(cauHinh, kho) {
  const ben = await goiXuat(cauHinh, { viec: 'bam' });
  const vps = new Map(kho.anhChup().map((t) => [t.ten, t]));
  const ds = ben.trang.map((g) => {
    const v = vps.get(g.ten);
    const bamV = v ? bamTrang(v.giaTri) : '';
    return { ten: g.ten, dongSheets: g.soDong, dongVps: v ? v.giaTri.length : null, khop: !!v && bamV === g.bam };
  });
  for (const t of vps.keys()) if (!ben.trang.some((g) => g.ten === t)) ds.push({ ten: t, dongSheets: null, dongVps: vps.get(t).giaTri.length, khop: false });
  return { luc: ben.luc, khopHet: ds.every((x) => x.khop), ds };
}

module.exports = { layTuAppsScript, doiChieuBam, bamTrang, goiXuat, maHoaDong };
