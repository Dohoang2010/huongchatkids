'use strict';
/* Gọi mạng: dùng chung cho cách "gọi trước rồi chạy lại" (bất đồng bộ, trong máy chủ)
   và cách "chờ kết quả" (chạy file này như tiến trình con, đọc yêu cầu từ stdin, in kết quả ra stdout). */

async function goiMot(y) {
  try {
    const r = await fetch(y.url, { method: y.method || 'GET', headers: y.headers || {}, body: y.body, redirect: y.theoChuyenHuong === false ? 'manual' : 'follow', signal: AbortSignal.timeout(60000) });
    const noiDung = await r.text();
    const dau = {}; r.headers.forEach((v, k) => { dau[k.replace(/(^|-)([a-z])/g, (m) => m.toUpperCase())] = v; });
    return { ma: r.status, noiDung, dau };
  } catch (e) {
    const ly = e && e.name === 'TimeoutError' ? 'Timeout' : (e && e.cause && e.cause.code ? e.cause.code : String(e && e.message || e));
    return { loi: 'Address unavailable (' + ly + ')' };
  }
}

async function goiNhieu(ds, songSong = 10) {
  const kq = new Array(ds.length); let i = 0;
  const tho = async () => { while (i < ds.length) { const k = i++; kq[k] = await goiMot(ds[k]); } };
  await Promise.all(Array.from({ length: Math.min(songSong, ds.length) }, tho));
  return kq;
}

module.exports = { goiMot, goiNhieu };

if (require.main === module) {
  let vao = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => { vao += d; });
  process.stdin.on('end', async () => {
    const kq = await goiNhieu(JSON.parse(vao || '[]'));
    process.stdout.write(JSON.stringify(kq));
  });
}
