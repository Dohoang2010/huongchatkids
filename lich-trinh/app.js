/* Lịch làm việc – Sếp ↔ Trợ lý. Máy chủ: tools/lich-trinh-apps-script.gs */
'use strict';
(() => {
  const API = String(window.LICH_API || '').trim();
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const kho = {
    get(k, d) { try { const v = localStorage.getItem('lt_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('lt_' + k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } },
    del(k) { try { localStorage.removeItem('lt_' + k); } catch (e) { /* bỏ qua */ } }
  };

  const VAI = { sep: 'Sếp', troly: 'Trợ lý' };
  const LICH = ['sep', 'troly', 'chung'];
  const THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const LAP = { '': 'Không bao giờ', ngay: 'Hằng ngày', tuan: 'Hằng tuần', thang: 'Hằng tháng', nam: 'Hằng năm' };
  const NHAC_GIO = [[-1, 'Không'], [0, 'Lúc diễn ra'], [5, '5 phút trước'], [10, '10 phút trước'], [15, '15 phút trước'], [30, '30 phút trước'],
    [60, '1 giờ trước'], [120, '2 giờ trước'], [1440, '1 ngày trước'], [2880, '2 ngày trước'], [10080, '1 tuần trước']];
  const NHAC_NGAY = [[-1, 'Không'], [0, 'Ngày diễn ra (8:00)'], [1440, '1 ngày trước (8:00)'], [2880, '2 ngày trước (8:00)'], [10080, '1 tuần trước (8:00)']];

  const S = {
    token: null, toi: null, ten: { sep: 'Sếp', troly: 'Trợ lý' }, vapid: '',
    lich: [], verLich: '', tin: [], choGui: [], tinCuoi: 0, daDoc: { sep: 0, troly: 0 }, online: {},
    thang: null, chon: null, xem: 'thang', namXem: 0, tab: 'lich',
    loc: kho.get('loc', { sep: true, troly: true, chung: true })
  };

  /* ===================== NGÀY GIỜ ===================== */
  const pad = n => String(n).padStart(2, '0');
  const ymdCua = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const homNay = () => ymdCua(new Date());
  const soNgay = ymd => Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10)) / 864e5;
  const ymdTuSo = n => new Date(n * 864e5).toISOString().slice(0, 10);
  const ymdCong = (ymd, k) => ymdTuSo(soNgay(ymd) + k);
  const thuCua = ymd => new Date(soNgay(ymd) * 864e5).getUTCDay();
  const ngayDai = ymd => `${THU[thuCua(ymd)]}, ${+ymd.slice(8, 10)} tháng ${+ymd.slice(5, 7)}, ${ymd.slice(0, 4)}`;
  const ngayNgan = ymd => `${THU[thuCua(ymd)]} ${ymd.slice(8, 10)}/${ymd.slice(5, 7)}`;
  const ngayVN = ymd => `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}/${ymd.slice(0, 4)}`;
  const phutCua = s => Date.parse(s.length === 10 ? s + 'T00:00' : s) / 6e4;
  const chuoiTuPhut = p => { const d = new Date(p * 6e4); return `${ymdCua(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const bayGio = () => { const d = new Date(); return `${ymdCua(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  function tenNgayGan(ymd) {
    const h = homNay();
    if (ymd === h) return 'Hôm nay';
    if (ymd === ymdCong(h, 1)) return 'Ngày mai';
    if (ymd === ymdCong(h, -1)) return 'Hôm qua';
    return '';
  }
  const thangCua = ymd => ({ y: +ymd.slice(0, 4), m: +ymd.slice(5, 7) });
  const soNgayThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
  const boDau = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

  // Giống hệt lanDienRa() ở máy chủ: các ngày bắt đầu (yyyy-MM-dd) của sự kiện có phần nằm trong [tu, den]
  function lanDienRa(ev, tu, den, toiDa, loc) {
    const bd = ev.bd.slice(0, 10), dai = soNgay(ev.kt.slice(0, 10)) - soNgay(bd);
    const nTu = soNgay(tu) - dai, nDen = soNgay(den), kq = [];
    const het = ev.lapDen ? Math.min(nDen, soNgay(ev.lapDen)) : nDen;
    const them = ymd => { if (!loc || loc(ymd)) kq.push(ymd); return kq.length >= toiDa; };
    const n0 = soNgay(bd);
    if (!ev.lap) { if (n0 >= nTu && n0 <= nDen) them(bd); return kq; }
    if (ev.lap === 'ngay' || ev.lap === 'tuan') {
      const buoc = ev.lap === 'ngay' ? 1 : 7;
      const k = Math.max(0, Math.ceil((nTu - n0) / buoc));
      for (let n = n0 + k * buoc; n <= het; n += buoc) if (them(ymdTuSo(n))) break;
      return kq;
    }
    let y = +bd.slice(0, 4), m = +bd.slice(5, 7);
    const d = +bd.slice(8, 10), yTu = +ymdTuSo(nTu).slice(0, 4), mTu = +ymdTuSo(nTu).slice(5, 7);
    if (ev.lap === 'thang') { const lech = (yTu - y) * 12 + (mTu - m) - 1; if (lech > 0) { y += Math.floor((m - 1 + lech) / 12); m = (m - 1 + lech) % 12 + 1; } }
    if (ev.lap === 'nam' && yTu - 1 > y) y = yTu - 1;
    for (let i = 0; i < 2000; i++) {
      if (new Date(Date.UTC(y, m - 1, d)).getUTCDate() === d) {
        const ymd = `${y}-${pad(m)}-${pad(d)}`, nn = soNgay(ymd);
        if (nn > het) break;
        if (nn >= nTu && nn >= n0 && them(ymd)) break;
      }
      if (ev.lap === 'thang') { m++; if (m > 12) { m = 1; y++; } } else y++;
    }
    return kq;
  }

  // Mọi lần diễn ra (của các lịch đang hiện) có phần nằm trong [tu, den]
  function trongKhoang(tu, den, tatCa) {
    const out = [];
    for (const ev of S.lich) {
      if (!tatCa && !S.loc[ev.lich]) continue;
      const dai = soNgay(ev.kt.slice(0, 10)) - soNgay(ev.bd.slice(0, 10));
      for (const ngay of lanDienRa(ev, tu, den, 800)) out.push({ ev, ngay, ket: ymdCong(ngay, dai) });
    }
    return out;
  }
  const thuTu = (a, b) => (b.ev.caNgay - a.ev.caNgay) || a.ev.bd.slice(11).localeCompare(b.ev.bd.slice(11)) || a.ev.tieuDe.localeCompare(b.ev.tieuDe);

  /* ===================== MÁY CHỦ ===================== */
  async function api(action, data = {}) {
    const ctl = new AbortController(), hen = setTimeout(() => ctl.abort(), 25000);
    let r;
    try {
      const res = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({ action, token: S.token }, data)), signal: ctl.signal
      });
      r = await res.json();
    } catch (e) {
      const err = new Error('Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.'); err.mang = true; throw err;
    } finally { clearTimeout(hen); }
    if (r.hetPhien) { hetPhien(); const err = new Error(r.loi); err.hetPhien = true; throw err; }
    if (r.loi) throw new Error(r.loi);
    return r;
  }

  function luuCache() {
    kho.set('cache', { toi: S.toi, ten: S.ten, vapid: S.vapid, lich: S.lich, verLich: S.verLich, tin: S.tin.slice(-200), tinCuoi: S.tinCuoi, daDoc: S.daDoc });
  }

  /* ===================== MÀN HÌNH ===================== */
  function hienMan(ten) {
    $$('.man').forEach(m => { m.hidden = m.id !== 'man-' + ten; });
  }

  function toast(msg, ms = 2400) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('hien');
    clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('hien'), ms);
  }

  function datLogo() {
    const h = homNay();
    $$('#logo-ngay, .logo-ngay').forEach(b => { b.textContent = +h.slice(8, 10); });
    $$('#man-tai .logo-to span, #man-dangnhap .logo-to span').forEach(s => { s.textContent = THU[thuCua(h)].toUpperCase(); });
  }

  async function khoiDong() {
    datLogo();
    dangKySW();
    if (!API) return hienMan('ketnoi');
    S.token = kho.get('token', null);
    if (!S.token) return moDangNhap();
    const c = kho.get('cache', null);
    if (c && c.toi) { Object.assign(S, c); vaoApp(); }
    try {
      const r = await api('tongHop', { chat: false });
      Object.assign(S, { toi: r.toi, ten: r.ten, vapid: r.vapid, lich: r.lich, verLich: r.verLich, tinCuoi: r.tinCuoi, online: r.online });
      S.daDoc = gopDaDoc(r.daDoc);
      S.tin = [];
      themTin(r.tin);
      luuCache();
      if (!c || !c.toi) vaoApp(); else veLai();
      kiemTraDangKyTB();
    } catch (e) {
      if (e.hetPhien) return;
      if (!c || !c.toi) loiTai(e.message, khoiDong);
      else $('#mat-mang').hidden = false;
    }
    henPoll(3000);
  }

  function loiTai(msg, thuLai) {
    hienMan('tai');
    const p = $('#man-tai .mo');
    p.innerHTML = `${esc(msg)}<br><br><button type="button" class="nut-chinh" style="width:auto;display:inline-block;padding:10px 26px">Thử lại</button>`;
    $('button', p).onclick = () => { p.textContent = 'Đang tải…'; thuLai(); };
  }

  async function moDangNhap() {
    hienMan('tai');
    try {
      const r = await api('trangThai');
      if (!r.daCaiDat) return hienMan('caidat');
      S.ten = r.ten;
      $$('#form-dangnhap [data-ten]').forEach(b => { b.textContent = r.ten[b.dataset.ten]; });
      $$('#form-dangnhap .the-vai i').forEach((i, k) => { i.textContent = (r.ten[k ? 'troly' : 'sep'] || '?').trim().charAt(0).toUpperCase(); });
      const cu = kho.get('vaiCu', '');
      if (cu) { const ip = $(`#form-dangnhap input[value="${cu}"]`); if (ip) ip.checked = true; }
      hienMan('dangnhap');
    } catch (e) { loiTai(e.message, moDangNhap); }
  }

  function hetPhien() {
    S.token = null; kho.del('token'); kho.del('cache'); kho.del('dkTb');
    clearTimeout(hPoll); dongSheet();
    toast('Phiên đăng nhập đã hết, vui lòng đăng nhập lại');
    moDangNhap();
  }

  $('#form-caidat').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, nut = $('button[type=submit]', f), data = Object.fromEntries(new FormData(f));
    nut.disabled = true; $('.loi', f).textContent = '';
    try { await api('caiDat', data); toast('Đã thiết lập xong. Mời đăng nhập.'); moDangNhap(); }
    catch (err) { $('.loi', f).textContent = err.message; }
    finally { nut.disabled = false; }
  });

  $('#form-dangnhap').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, nut = $('button[type=submit]', f), data = Object.fromEntries(new FormData(f));
    if (!data.vaiTro) { $('.loi', f).textContent = 'Chọn Sếp hoặc Trợ lý'; return; }
    nut.disabled = true; $('.loi', f).textContent = '';
    try {
      const r = await api('dangNhap', Object.assign(data, { tenMay: tenMay() }));
      S.token = r.token; kho.set('token', r.token); kho.set('vaiCu', r.vaiTro);
      f.reset();
      await khoiDong();
    } catch (err) { $('.loi', f).textContent = err.message; }
    finally { nut.disabled = false; }
  });

  function vaoApp() {
    hienMan('chinh');
    if (!S.chon) S.chon = homNay();
    S.thang = thangCua(S.chon);
    veLai();
    moDuongDan(location.hash);
    const ios = laIOS(), daCai = daCaiApp();
    $('#goi-y-cai').hidden = !(ios && !daCai && !kho.get('anGoiY', false));
  }

  function veLai() {
    veThang(); veDsNgay();
    if (S.xem === 'nam') veNam();
    if (S.tab === 'saptoi') veSapToi();
    veChat(); veTrangThaiChat(); capNhatHuyHieu();
    veToi();
  }

  /* ===================== CHUYỂN TAB & ĐƯỜNG DẪN ===================== */
  function chuyenTab(t) {
    S.tab = t;
    $$('#man-chinh .tab').forEach(x => { x.hidden = x.dataset.tab !== t; });
    $$('.tabbar button').forEach(b => b.classList.toggle('dang-chon', b.dataset.den === t));
    if (t === 'saptoi') veSapToi();
    if (t === 'chat') { veChat(true); danhDauDaDoc(); henPoll(400); }
    if (t === 'toi') veToi();
  }

  $$('.tabbar button').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.den === 'lich' && S.tab === 'lich') return veHomNay();
    chuyenTab(b.dataset.den);
  }));

  function moDuongDan(hash) {
    const p = String(hash || '').replace(/^#/, '').split('/');
    if (!p[0]) return;
    if (p[0] === 'chat') chuyenTab('chat');
    else if (p[0] === 'toi') chuyenTab('toi');
    else if (p[0] === 'lich' && /^\d{4}-\d{2}-\d{2}$/.test(p[1] || '')) { chuyenTab('lich'); chonNgay(p[1], true); }
    else if (p[0] === 'su-kien' && p[1]) {
      const ev = S.lich.find(x => x.id === p[1]);
      chuyenTab('lich');
      if (ev) { const ngay = /^\d{4}-\d{2}-\d{2}$/.test(p[2] || '') ? p[2] : ev.bd.slice(0, 10); chonNgay(ngay, true); moChiTiet(ev.id, ngay); }
    }
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }
  window.addEventListener('hashchange', () => moDuongDan(location.hash));

  /* ===================== LỊCH THÁNG ===================== */
  function veThang() {
    const { y, m } = S.thang, h = homNay();
    $('#ten-thang').textContent = `Tháng ${m}` + (y !== +h.slice(0, 4) ? ` ${y}` : '');
    $('#nhan-nam').textContent = y;
    const dau = `${y}-${pad(m)}-01`, n = soNgayThang(y, m), cuoi = `${y}-${pad(m)}-${pad(n)}`;
    const mau = {};
    for (const o of trongKhoang(dau, cuoi)) {
      for (let k = Math.max(soNgay(o.ngay), soNgay(dau)); k <= Math.min(soNgay(o.ket), soNgay(cuoi)); k++) {
        const ymd = ymdTuSo(k); (mau[ymd] = mau[ymd] || new Set()).add(o.ev.lich);
      }
    }
    const lech = (thuCua(dau) + 6) % 7;
    let html = '<span class="o-ngay trong"></span>'.repeat(lech);
    for (let d = 1; d <= n; d++) {
      const ymd = `${y}-${pad(m)}-${pad(d)}`, cot = (lech + d - 1) % 7, c = mau[ymd];
      const cls = ['o-ngay', cot >= 5 && 'cuoi-tuan', ymd === h && 'hom-nay', ymd === S.chon && 'dang-chon'].filter(Boolean).join(' ');
      const cham = c ? LICH.filter(l => c.has(l)).map(l => `<i class="c-${l}"></i>`).join('') : '';
      html += `<button type="button" class="${cls}" data-ngay="${ymd}" role="gridcell" aria-selected="${ymd === S.chon}" aria-label="${ngayDai(ymd)}${c ? ', có lịch' : ''}"><span class="so">${d}</span><span class="cham-ngay">${cham}</span></button>`;
    }
    $('#luoi-thang').innerHTML = html;
  }

  function veDsNgay() {
    const d = S.chon, ds = trongKhoang(d, d).sort(thuTu), gan = tenNgayGan(d);
    let html = `<div class="ngay-dau">${gan ? gan + ' <small>· ' + ngayDai(d) + '</small>' : ngayDai(d)}</div>`;
    html += ds.length ? ds.map(o => dongSuKien(o, d)).join('') : '<p class="trong-rong">Không có sự kiện</p>';
    $('#ds-ngay').innerHTML = html;
  }

  function dongSuKien(o, ngay) {
    const ev = o.ev;
    let gio;
    if (ev.caNgay || (o.ngay !== ngay && o.ket !== ngay)) gio = 'cả ngày';
    else if (o.ngay === ngay && o.ket === ngay) gio = `${ev.bd.slice(11)}<small>${ev.kt.slice(11)}</small>`;
    else if (o.ngay === ngay) gio = `${ev.bd.slice(11)}<small>bắt đầu</small>`;
    else gio = `${ev.kt.slice(11)}<small>kết thúc</small>`;
    const phu = [ev.diaDiem, ev.lich === 'chung' ? 'Lịch chung' : 'Lịch ' + VAI[ev.lich]].filter(Boolean).join(' · ');
    return `<button type="button" class="su-kien" data-ev="${esc(ev.id)}" data-ngay="${o.ngay}"><span class="gio">${gio}</span><i class="vach-mau c-${ev.lich}"></i><span class="nd"><b>${esc(ev.tieuDe)}</b><small>${esc(phu)}</small></span></button>`;
  }

  function chonNgay(ymd, doiThangNeuCan) {
    S.chon = ymd;
    const t = thangCua(ymd);
    if (doiThangNeuCan || t.y !== S.thang.y || t.m !== S.thang.m) S.thang = t;
    if (S.xem === 'nam') hienXem('thang');
    veThang(); veDsNgay();
  }

  function doiThang(k) {
    let { y, m } = S.thang;
    m += k; if (m > 12) { m = 1; y++; } if (m < 1) { m = 12; y--; }
    S.thang = { y, m };
    const h = homNay();
    S.chon = thangCua(h).y === y && thangCua(h).m === m ? h : `${y}-${pad(m)}-01`;
    veThang(); veDsNgay();
    const l = $('#luoi-thang');
    l.classList.remove('truot-trai', 'truot-phai'); void l.offsetWidth;
    l.classList.add(k > 0 ? 'truot-trai' : 'truot-phai');
  }

  function veHomNay() {
    hienXem('thang');
    chonNgay(homNay(), true);
    $('#tab-lich').scrollTo({ top: 0, behavior: 'smooth' });
  }

  function hienXem(x) {
    S.xem = x;
    $('#xem-thang').hidden = x !== 'thang';
    $('#xem-nam').hidden = x !== 'nam';
    $('#nut-ve-nam').style.visibility = x === 'nam' ? 'hidden' : '';
    if (x === 'nam') veNam();
  }

  $('#luoi-thang').addEventListener('click', e => {
    const o = e.target.closest('.o-ngay[data-ngay]');
    if (o) chonNgay(o.dataset.ngay);
  });
  $('#ds-ngay').addEventListener('click', e => {
    const o = e.target.closest('.su-kien');
    if (o) moChiTiet(o.dataset.ev, o.dataset.ngay);
  });
  $('#thang-truoc').onclick = () => doiThang(-1);
  $('#thang-sau').onclick = () => doiThang(1);
  $('#nut-hom-nay').onclick = veHomNay;
  $('#nut-ve-nam').onclick = () => { S.namXem = S.thang.y; hienXem('nam'); };
  $('#nut-them').onclick = () => moSoan(null);
  $('#nut-them-2').onclick = () => moSoan(null, homNay());
  $('#nut-loc').onclick = moLoc;
  $('.dong-goi-y').onclick = () => { $('#goi-y-cai').hidden = true; kho.set('anGoiY', true); };
  vuot($('#xem-thang'), k => doiThang(k));
  vuot($('#xem-nam'), k => { S.namXem += k; veNam(); });

  function vuot(el, fn) {
    let x0 = null, y0 = 0;
    el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', e => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.6) fn(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ===================== LỊCH NĂM ===================== */
  function veNam() {
    const y = S.namXem, h = homNay();
    $('#ten-nam').textContent = y;
    const co = new Set();
    for (const o of trongKhoang(`${y}-01-01`, `${y}-12-31`)) {
      for (let k = soNgay(o.ngay); k <= soNgay(o.ket); k++) co.add(ymdTuSo(k));
    }
    let html = '';
    for (let m = 1; m <= 12; m++) {
      const dau = `${y}-${pad(m)}-01`, lech = (thuCua(dau) + 6) % 7, n = soNgayThang(y, m);
      let o = '<i></i>'.repeat(lech);
      for (let d = 1; d <= n; d++) {
        const ymd = `${y}-${pad(m)}-${pad(d)}`;
        o += `<i class="${ymd === h ? 'hn' : co.has(ymd) ? 'co' : 'nhat'}">${d}</i>`;
      }
      html += `<button type="button" class="thang-nho" data-thang="${m}" aria-label="Tháng ${m} năm ${y}"><h3>Th${m}</h3><div class="luoi">${o}</div></button>`;
    }
    $('#luoi-nam').innerHTML = html;
  }
  $('#luoi-nam').addEventListener('click', e => {
    const b = e.target.closest('.thang-nho');
    if (!b) return;
    const y = S.namXem, m = +b.dataset.thang, h = homNay();
    S.thang = { y, m };
    S.chon = thangCua(h).y === y && thangCua(h).m === m ? h : `${y}-${pad(m)}-01`;
    hienXem('thang'); veThang(); veDsNgay();
  });
  $('#nam-truoc').onclick = () => { S.namXem--; veNam(); };
  $('#nam-sau').onclick = () => { S.namXem++; veNam(); };

  /* ===================== SẮP TỚI ===================== */
  function veSapToi() {
    const q = boDau($('#tim').value.trim()), h = homNay();
    const tu = q ? ymdCong(h, -365) : h, den = ymdCong(h, q ? 365 : 60);
    let ds = trongKhoang(tu, den, !!q);
    if (q) ds = ds.filter(o => boDau(`${o.ev.tieuDe} ${o.ev.diaDiem} ${o.ev.ghiChu}`).includes(q));
    ds.forEach(o => { o.hien = o.ngay < tu ? tu : o.ngay; });
    ds.sort((a, b) => a.hien.localeCompare(b.hien) || thuTu(a, b));
    ds = ds.slice(0, 300);
    if (!ds.length) {
      $('#ds-saptoi').innerHTML = `<p class="trong-rong">${q ? 'Không tìm thấy sự kiện nào' : 'Không có lịch nào trong 60 ngày tới'}</p>`;
      return;
    }
    let html = '', truoc = '';
    for (const o of ds) {
      if (o.hien !== truoc) {
        const gan = tenNgayGan(o.hien);
        html += `<div class="ngay-dau${o.hien === h ? ' hn' : ''}">${gan ? gan + ' <small>· ' + ngayNgan(o.hien) + '</small>' : ngayDai(o.hien)}</div>`;
        truoc = o.hien;
      }
      html += dongSuKien(o, o.hien);
    }
    $('#ds-saptoi').innerHTML = html;
  }
  $('#tim').addEventListener('input', veSapToi);
  $('#ds-saptoi').addEventListener('click', e => {
    const o = e.target.closest('.su-kien');
    if (o) moChiTiet(o.dataset.ev, o.dataset.ngay);
  });

  /* ===================== BẢNG TRƯỢT ===================== */
  let hDong = 0;
  function moSheet(html) {
    clearTimeout(hDong);
    const nen = $('#sheet'), sh = $('.sheet', nen);
    nen.classList.remove('dong-lai');
    sh.innerHTML = html; sh.scrollTop = 0;
    nen.hidden = false;
    return sh;
  }
  function dongSheet() {
    const nen = $('#sheet');
    if (nen.hidden) return;
    nen.classList.add('dong-lai');
    hDong = setTimeout(() => { nen.hidden = true; nen.classList.remove('dong-lai'); $('.sheet', nen).innerHTML = ''; }, 200);
  }
  $('#sheet').addEventListener('click', e => {
    if (e.target.id === 'sheet' || e.target.closest('[data-dong]')) dongSheet();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') dongSheet(); });

  /* ---- Chọn lịch hiển thị ---- */
  function moLoc() {
    const sh = moSheet(`<div class="sheet-dau"><span></span><b>Lịch hiển thị</b><button type="button" data-dong>Xong</button></div>
      <div class="sheet-than"><div class="nhom">${LICH.map(l => `<button type="button" class="dong" data-loc="${l}"><i class="cham c-${l}"></i><span>${tenLich(l)}</span><span class="dau-tich">${S.loc[l] ? '✓' : ''}</span></button>`).join('')}</div>
      <p class="chu-thich">Bỏ chọn để tạm ẩn lịch đó khỏi trang Lịch và Sắp tới.</p></div>`);
    sh.addEventListener('click', e => {
      const b = e.target.closest('[data-loc]');
      if (!b) return;
      S.loc[b.dataset.loc] = !S.loc[b.dataset.loc];
      kho.set('loc', S.loc);
      $('.dau-tich', b).textContent = S.loc[b.dataset.loc] ? '✓' : '';
      veThang(); veDsNgay(); if (S.xem === 'nam') veNam();
    });
  }
  const tenLich = l => l === 'chung' ? 'Lịch chung' : `${VAI[l]} · ${S.ten[l] || VAI[l]}`;

  /* ---- Xem chi tiết sự kiện ---- */
  const linkHoa = s => esc(s).replace(/https?:\/\/[^\s<]+/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
  const tenNguoi = v => S.ten[v] || VAI[v] || '';
  const tenNhac = ev => ((ev.caNgay ? NHAC_NGAY : NHAC_GIO).find(x => x[0] === ev.nhac) || [0, `${ev.nhac} phút trước`])[1];

  function moChiTiet(id, ngay) {
    const ev = S.lich.find(x => x.id === id);
    if (!ev) return toast('Sự kiện này không còn nữa');
    ngay = ngay || ev.bd.slice(0, 10);
    const ket = ymdCong(ngay, soNgay(ev.kt.slice(0, 10)) - soNgay(ev.bd.slice(0, 10)));
    let gio;
    if (ev.caNgay) gio = ngay === ket ? `${ngayDai(ngay)}<br>Cả ngày` : `Từ ${ngayDai(ngay)}<br>đến ${ngayDai(ket)}`;
    else if (ngay === ket) gio = `${ngayDai(ngay)}<br>từ ${ev.bd.slice(11)} đến ${ev.kt.slice(11)}`;
    else gio = `từ ${ev.bd.slice(11)} ${ngayNgan(ngay)}<br>đến ${ev.kt.slice(11)} ${ngayNgan(ket)}`;
    if (ev.lap) gio += `<br>Lặp lại ${LAP[ev.lap].toLowerCase()}${ev.lapDen ? ' đến ' + ngayVN(ev.lapDen) : ''}`;
    const sua = ev.capNhat ? ` · Sửa lần cuối bởi ${esc(tenNguoi(ev.suaBoi))} lúc ${esc(String(ev.capNhat).slice(11, 16))} ${esc(ngayVN(String(ev.capNhat).slice(0, 10)))}` : '';
    const sh = moSheet(`<div class="sheet-dau"><button type="button" data-dong>Đóng</button><b></b><button type="button" id="ct-sua">Sửa</button></div>
      <div class="sheet-than">
        <div class="ct-tieu-de">${esc(ev.tieuDe)}</div>
        ${ev.diaDiem ? `<div class="ct-dong dia-diem">${linkHoa(ev.diaDiem)}</div>` : ''}
        <div class="ct-dong" style="margin-bottom:18px">${gio}</div>
        <div class="nhom">
          <div class="dong"><span>Lịch</span><span class="gia-tri"><i class="cham c-${ev.lich}"></i>${esc(tenLich(ev.lich))}</span></div>
          <div class="dong"><span>Cảnh báo</span><span class="gia-tri">${esc(tenNhac(ev))}</span></div>
        </div>
        ${ev.ghiChu ? `<div class="nhom"><div class="ct-chu">${linkHoa(ev.ghiChu)}</div></div>` : ''}
        <div class="nhom">
          <button type="button" class="dong nut-dong xanh" id="ct-gui">Gửi vào tin nhắn</button>
          <button type="button" class="dong nut-dong nut-xoa" id="ct-xoa">Xoá sự kiện</button>
        </div>
        <p class="ct-meta">Tạo bởi ${esc(tenNguoi(ev.taoBoi))}${sua}</p>
      </div>`);
    $('#ct-sua', sh).onclick = () => moSoan(ev);
    $('#ct-gui', sh).onclick = () => { dongSheet(); chuyenTab('chat'); guiTin('', ev.id); };
    $('#ct-xoa', sh).onclick = async e => {
      if (!confirm(ev.lap ? 'Xoá sự kiện này và mọi lần lặp lại của nó?' : 'Xoá sự kiện này?')) return;
      e.target.disabled = true;
      try {
        const r = await api('xoaLich', { id: ev.id });
        S.lich = S.lich.filter(x => x.id !== ev.id); S.verLich = r.verLich;
        luuCache(); dongSheet(); veLai(); toast('Đã xoá sự kiện');
      } catch (err) { toast(err.message); e.target.disabled = false; }
    };
  }

  /* ---- Thêm / sửa sự kiện ---- */
  function luaChonNhac(caNgay, gt) {
    const ds = caNgay ? NHAC_NGAY : NHAC_GIO;
    if (!ds.some(x => x[0] === gt)) gt = caNgay ? 0 : 15;
    return ds.map(([v, t]) => `<option value="${v}"${v === gt ? ' selected' : ''}>${t}</option>`).join('');
  }

  function moSoan(ev, ngayMacDinh) {
    const moi = !ev;
    if (moi) {
      const ngay = ngayMacDinh || S.chon || homNay(), gio = Math.min(new Date().getHours() + 1, 22);
      ev = { tieuDe: '', caNgay: false, bd: `${ngay}T${pad(gio)}:00`, kt: `${ngay}T${pad(gio + 1)}:00`, diaDiem: '', lich: kho.get('lichMacDinh', S.toi), lap: '', lapDen: '', nhac: 15, ghiChu: '' };
    }
    const sh = moSheet(`<form id="form-sk" novalidate>
      <div class="sheet-dau"><button type="button" data-dong>Huỷ</button><b>${moi ? 'Sự kiện mới' : 'Sửa sự kiện'}</b><button type="submit">${moi ? 'Thêm' : 'Xong'}</button></div>
      <div class="sheet-than">
        <div class="nhom">
          <label class="dong cot"><input name="tieuDe" placeholder="Tiêu đề" maxlength="200" value="${esc(ev.tieuDe)}" aria-label="Tiêu đề" required></label>
          <label class="dong cot"><input name="diaDiem" placeholder="Địa điểm hoặc link họp" maxlength="200" value="${esc(ev.diaDiem)}" aria-label="Địa điểm"></label>
        </div>
        <div class="nhom">
          <label class="dong"><span>Cả ngày</span><span class="cong-tac"><input type="checkbox" name="caNgay"${ev.caNgay ? ' checked' : ''}><i></i></span></label>
          <div class="dong"><span>Bắt đầu</span><span class="ngay-gio"><input type="date" name="bdNgay" value="${ev.bd.slice(0, 10)}" aria-label="Ngày bắt đầu" required><input type="time" name="bdGio" value="${ev.bd.slice(11)}" aria-label="Giờ bắt đầu"></span></div>
          <div class="dong"><span>Kết thúc</span><span class="ngay-gio"><input type="date" name="ktNgay" value="${ev.kt.slice(0, 10)}" aria-label="Ngày kết thúc" required><input type="time" name="ktGio" value="${ev.kt.slice(11)}" aria-label="Giờ kết thúc"></span></div>
        </div>
        <div class="nhom">
          <label class="dong"><span>Lặp lại</span><select name="lap">${Object.entries(LAP).map(([k, t]) => `<option value="${k}"${k === ev.lap ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
          <label class="dong" id="dong-lap-den"${ev.lap ? '' : ' hidden'}><span>Kết thúc lặp</span><input type="date" name="lapDen" value="${esc(ev.lapDen)}" aria-label="Ngày kết thúc lặp"></label>
        </div>
        <p class="nhom-ten">Lịch của</p>
        <div class="nhom chon-lich" role="radiogroup" aria-label="Lịch của">
          ${LICH.map(l => `<label><input type="radio" name="lich" value="${l}"${l === ev.lich ? ' checked' : ''}><span style="color:var(--c-${l})"><i class="cham c-${l}"></i><b style="color:var(--chu);font-weight:inherit">${l === 'chung' ? 'Chung' : VAI[l]}</b></span></label>`).join('')}
        </div>
        <div class="nhom">
          <label class="dong"><span>Cảnh báo</span><select name="nhac">${luaChonNhac(ev.caNgay, ev.nhac)}</select></label>
        </div>
        <div class="nhom"><label class="dong cot"><textarea name="ghiChu" placeholder="Ghi chú" maxlength="3000" aria-label="Ghi chú">${esc(ev.ghiChu)}</textarea></label></div>
        <p class="loi" role="alert"></p>
      </div></form>`);
    const f = $('#form-sk', sh), el = n => f.elements[n];
    const capNhatCaNgay = () => {
      const c = el('caNgay').checked;
      el('bdGio').hidden = c; el('ktGio').hidden = c;
      el('nhac').innerHTML = luaChonNhac(c, Number(el('nhac').value));
    };
    el('bdGio').hidden = ev.caNgay; el('ktGio').hidden = ev.caNgay;
    $$('input[type=date], input[type=time]', f).forEach(i => i.addEventListener('click', () => { try { i.showPicker(); } catch (e) { /* trình duyệt tự mở */ } }));
    el('caNgay').addEventListener('change', capNhatCaNgay);
    el('lap').addEventListener('change', () => { $('#dong-lap-den', f).hidden = !el('lap').value; });
    // Đổi giờ bắt đầu thì dời giờ kết thúc theo, giữ nguyên độ dài
    let bdCu = `${el('bdNgay').value}T${el('bdGio').value || '00:00'}`;
    const doiBd = () => {
      if (!el('bdNgay').value) return;
      const bdMoi = `${el('bdNgay').value}T${el('bdGio').value || '00:00'}`;
      const kt = `${el('ktNgay').value || el('bdNgay').value}T${el('ktGio').value || '00:00'}`;
      const ktMoi = chuoiTuPhut(phutCua(kt) + phutCua(bdMoi) - phutCua(bdCu));
      el('ktNgay').value = ktMoi.slice(0, 10); el('ktGio').value = ktMoi.slice(11);
      bdCu = bdMoi;
    };
    el('bdNgay').addEventListener('change', doiBd);
    el('bdGio').addEventListener('change', doiBd);
    if (moi) setTimeout(() => el('tieuDe').focus(), 320);

    f.addEventListener('submit', async e => {
      e.preventDefault();
      const loi = $('.loi', f), nut = $('button[type=submit]', f);
      const caNgay = el('caNgay').checked;
      const ra = {
        id: ev.id, tieuDe: el('tieuDe').value.trim(), diaDiem: el('diaDiem').value.trim(), caNgay,
        bd: `${el('bdNgay').value}T${caNgay ? '00:00' : el('bdGio').value || '00:00'}`,
        kt: `${el('ktNgay').value || el('bdNgay').value}T${caNgay ? '23:59' : el('ktGio').value || '00:00'}`,
        lap: el('lap').value, lapDen: el('lap').value ? el('lapDen').value : '',
        lich: (f.querySelector('input[name=lich]:checked') || {}).value || S.toi,
        nhac: Number(el('nhac').value), ghiChu: el('ghiChu').value.trim()
      };
      if (!ra.tieuDe) { loi.textContent = 'Chưa nhập tiêu đề'; el('tieuDe').focus(); return; }
      if (!el('bdNgay').value) { loi.textContent = 'Chưa chọn ngày bắt đầu'; return; }
      if (ra.kt < ra.bd) { loi.textContent = 'Giờ kết thúc phải sau giờ bắt đầu'; return; }
      if (ra.lapDen && ra.lapDen < ra.bd.slice(0, 10)) { loi.textContent = 'Ngày kết thúc lặp phải sau ngày bắt đầu'; return; }
      nut.disabled = true; loi.textContent = '';
      try {
        const r = await api('luuLich', { ev: ra });
        const i = S.lich.findIndex(x => x.id === r.ev.id);
        if (i >= 0) S.lich[i] = r.ev; else S.lich.push(r.ev);
        S.verLich = r.verLich;
        if (moi) kho.set('lichMacDinh', ra.lich);
        luuCache(); dongSheet();
        if (S.tab === 'lich') chonNgay(ra.bd.slice(0, 10));
        veLai();
        toast(moi ? 'Đã thêm sự kiện' : 'Đã lưu thay đổi');
      } catch (err) { loi.textContent = err.message; nut.disabled = false; }
    });
  }

  /* ===================== TIN NHẮN ===================== */
  const khac = () => (S.toi === 'sep' ? 'troly' : 'sep');
  const dangXemChat = () => S.tab === 'chat' && document.visibilityState === 'visible' && !$('#man-chinh').hidden;
  const soChuaDoc = () => S.tin.filter(t => t.tu !== S.toi && t.id > (S.daDoc[S.toi] || 0)).length;

  function gopDaDoc(moi) {
    const r = Object.assign({}, S.daDoc);
    for (const k in moi) r[k] = Math.max(Number(moi[k]) || 0, Number(r[k]) || 0);
    return r;
  }

  function themTin(ds) {
    if (!ds || !ds.length) return;
    const co = new Set(S.tin.map(t => t.id));
    for (const t of ds) {
      if (co.has(t.id)) continue;
      S.tin.push(t); co.add(t.id);
      if (t.tu === S.toi) S.choGui = S.choGui.filter(c => !(c.dangGui && c.nd === t.nd && c.lichId === (t.lichId || '')));
      S.tinCuoi = Math.max(S.tinCuoi, t.id);
    }
    S.tin.sort((a, b) => a.id - b.id);
    if (S.tin.length > 500) S.tin = S.tin.slice(-500);
  }

  function noiDungTin(t) {
    let html = t.nd ? linkHoa(t.nd) : '';
    if (t.lichId) {
      const ev = S.lich.find(x => x.id === t.lichId);
      const the = ev
        ? `<button type="button" class="the-lich" data-ev="${esc(ev.id)}"><i class="vach-mau c-${ev.lich}"></i><span><b>${esc(ev.tieuDe)}</b><small>${ev.caNgay ? 'Cả ngày' : ev.bd.slice(11)} · ${ngayNgan(ev.bd.slice(0, 10))}${ev.lap ? ' · ' + LAP[ev.lap].toLowerCase() : ''}</small></span></button>`
        : '<span class="the-lich"><span><b>📅 Sự kiện đã bị xoá</b></span></span>';
      html += (html ? '\n' : '') + the;
    }
    return html;
  }

  function veChat(cuonXuong) {
    const box = $('#ds-tin');
    const gan = box.scrollHeight - box.scrollTop - box.clientHeight < 120;
    const ds = S.tin.concat(S.choGui);
    if (!ds.length) { box.innerHTML = '<p class="trong-rong">Chưa có tin nhắn nào.<br>Gửi lời chào nhé 👋</p>'; return; }
    const cuoiCuaToi = [...S.tin].reverse().find(t => t.tu === S.toi);
    const doc = S.daDoc[khac()] || 0;
    let html = '', truoc = null;
    ds.forEach((t, i) => {
      const moc = !truoc || t.t.slice(0, 10) !== truoc.t.slice(0, 10) || phutCua(t.t.slice(0, 16)) - phutCua(truoc.t.slice(0, 16)) > 30;
      if (moc) {
        const ngay = t.t.slice(0, 10);
        html += `<div class="moc-gio"><b>${tenNgayGan(ngay) || ngayNgan(ngay)}</b> ${t.t.slice(11, 16)}</div>`;
      }
      const sau = ds[i + 1];
      const cuoi = !sau || sau.tu !== t.tu || sau.t.slice(0, 10) !== t.t.slice(0, 10) || phutCua(sau.t.slice(0, 16)) - phutCua(t.t.slice(0, 16)) > 30;
      const cua = t.tu === S.toi ? 'cua-toi' : 'cua-ho';
      html += `<div class="bong ${cua}${cuoi ? ' cuoi' : ''}${t.dangGui ? ' dang-gui' : ''}" title="${esc(t.t.slice(11, 16))}">${noiDungTin(t)}</div>`;
      if (t.loi) html += `<button type="button" class="trang-thai-tin loi-gui" data-thu-lai="${esc(t.tam)}">Không gửi được · Bấm để gửi lại</button>`;
      else if (t.dangGui && !sau) html += '<div class="trang-thai-tin">Đang gửi…</div>';
      else if (cuoiCuaToi && t.id === cuoiCuaToi.id && !S.choGui.length) html += `<div class="trang-thai-tin">${doc >= t.id ? 'Đã xem' : 'Đã gửi'}</div>`;
      truoc = t;
    });
    box.innerHTML = html;
    if (cuonXuong || gan) box.scrollTop = box.scrollHeight;
  }

  function veTrangThaiChat() {
    const k = khac(), ten = tenNguoi(k), o = S.online[k];
    $('#chat-ten').textContent = ten;
    $('#chat-ava').textContent = ten.trim().charAt(0).toUpperCase();
    $('#chat-ava').className = 'ava c-' + k + '-bg';
    const tt = $('#chat-tt');
    if (o && Date.now() - o.t < 30000) { tt.textContent = 'Đang hoạt động'; tt.className = 'on'; }
    else if (o) { tt.textContent = 'Hoạt động ' + tuongDoi(o.t); tt.className = ''; }
    else { tt.textContent = VAI[k]; tt.className = ''; }
  }
  function tuongDoi(ms) {
    const p = Math.max(1, Math.round((Date.now() - ms) / 6e4));
    return p < 60 ? `${p} phút trước` : p < 1440 ? `${Math.round(p / 60)} giờ trước` : `${Math.round(p / 1440)} ngày trước`;
  }

  function capNhatHuyHieu() {
    const n = soChuaDoc(), b = $('#so-chua-doc');
    b.hidden = !n; b.textContent = n > 99 ? '99+' : n;
    try { if (navigator.setAppBadge) n ? navigator.setAppBadge(n) : navigator.clearAppBadge(); } catch (e) { /* bỏ qua */ }
  }

  function danhDauDaDoc() {
    if (!dangXemChat() || !soChuaDoc()) return;
    S.daDoc[S.toi] = S.tinCuoi;
    capNhatHuyHieu();
    api('daDoc', { id: S.tinCuoi }).catch(() => {});
  }

  async function guiTin(nd, lichId) {
    const tam = { tam: 'x' + Date.now() + Math.random(), t: bayGio(), tu: S.toi, nd, lichId: lichId || '', dangGui: true };
    S.choGui.push(tam);
    veChat(true);
    try {
      const r = await api('guiTin', { noiDung: nd, lichId: lichId || '' });
      S.choGui = S.choGui.filter(c => c !== tam);
      themTin([r.tin]);
      S.daDoc[S.toi] = Math.max(S.daDoc[S.toi] || 0, r.tin.id);
      luuCache();
    } catch (e) {
      if (e.hetPhien) return;
      tam.dangGui = false; tam.loi = true;
    }
    veChat(true);
  }

  const oTin = $('#o-tin');
  const coGian = () => { oTin.style.height = 'auto'; oTin.style.height = Math.min(oTin.scrollHeight, 130) + 'px'; $('#nut-gui').disabled = !oTin.value.trim(); };
  oTin.addEventListener('input', coGian);
  oTin.addEventListener('keydown', e => {
    // Máy tính: Enter để gửi, Shift+Enter xuống dòng. Điện thoại: phím Enter là xuống dòng.
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && matchMedia('(hover: hover) and (pointer: fine)').matches) { e.preventDefault(); $('#form-tin').requestSubmit(); }
  });
  oTin.addEventListener('focus', () => setTimeout(() => { const b = $('#ds-tin'); b.scrollTop = b.scrollHeight; }, 300));
  $('#form-tin').addEventListener('submit', e => {
    e.preventDefault();
    const nd = oTin.value.trim();
    if (!nd) return;
    oTin.value = ''; coGian(); oTin.focus();
    guiTin(nd, '');
  });
  $('#ds-tin').addEventListener('click', e => {
    const the = e.target.closest('.the-lich[data-ev]');
    if (the) { const ev = S.lich.find(x => x.id === the.dataset.ev); if (ev) moChiTiet(ev.id); return; }
    const lai = e.target.closest('[data-thu-lai]');
    if (lai) {
      const t = S.choGui.find(c => c.tam === lai.dataset.thuLai);
      if (t) { S.choGui = S.choGui.filter(c => c !== t); guiTin(t.nd, t.lichId); }
    }
  });
  $('#nut-gui-lich').onclick = () => {
    const h = homNay(), ds = trongKhoang(ymdCong(h, -1), ymdCong(h, 45), true).sort((a, b) => a.ngay.localeCompare(b.ngay) || thuTu(a, b)).slice(0, 80);
    const sh = moSheet(`<div class="sheet-dau"><button type="button" data-dong>Huỷ</button><b>Gửi một sự kiện</b><span></span></div>
      <div class="sheet-than"><div class="nhom">${ds.length ? ds.map(o => dongSuKien(o, o.ngay).replace('<span class="nd">', `<span class="nd"><small>${ngayNgan(o.ngay)}</small>`)).join('') : '<p class="trong-rong">Chưa có sự kiện nào sắp tới</p>'}</div></div>`);
    sh.addEventListener('click', e => {
      const b = e.target.closest('.su-kien');
      if (!b) return;
      dongSheet(); guiTin('', b.dataset.ev);
    });
  };

  /* ===================== ĐỒNG BỘ ĐỊNH KỲ ===================== */
  let hPoll = 0, dangPoll = false, loiLienTiep = 0;
  function henPoll(ms) { clearTimeout(hPoll); hPoll = setTimeout(poll, ms); }
  async function poll() {
    if (!S.token || document.visibilityState !== 'visible') return;
    if (dangPoll) return henPoll(800);
    dangPoll = true;
    try {
      const r = await api('poll', { verLich: S.verLich, tinCuoi: S.tinCuoi, chat: dangXemChat(), canTen: !S.daCoTen });
      S.daCoTen = true;
      let doiLich = false, doiTin = false;
      if (r.lich) { S.lich = r.lich; S.verLich = r.verLich; doiLich = true; }
      if (r.tin && r.tin.length) { themTin(r.tin); doiTin = true; }
      if (r.ten) S.ten = r.ten;
      const docCu = S.daDoc[khac()];
      S.daDoc = gopDaDoc(r.daDoc || {});
      S.online = r.online || {};
      if (doiLich) { veThang(); veDsNgay(); if (S.xem === 'nam') veNam(); if (S.tab === 'saptoi') veSapToi(); }
      if (doiTin || doiLich || docCu !== S.daDoc[khac()]) veChat(doiTin && dangXemChat());
      veTrangThaiChat(); capNhatHuyHieu(); danhDauDaDoc();
      if (doiLich || doiTin) luuCache();
      loiLienTiep = 0; $('#mat-mang').hidden = true;
    } catch (e) {
      if (e.hetPhien) { dangPoll = false; return; }
      if (++loiLienTiep >= 2) $('#mat-mang').hidden = false;
    }
    dangPoll = false;
    henPoll(dangXemChat() ? 3000 : loiLienTiep ? 15000 : 10000);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && S.token) { if (homNay() !== S.homNayCu) { S.homNayCu = homNay(); datLogo(); veThang(); } henPoll(100); }
  });
  window.addEventListener('online', () => henPoll(100));

  /* ===================== CÀI ĐẶT & THÔNG BÁO ===================== */
  const laIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const daCaiApp = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  function tenMay() {
    const u = navigator.userAgent;
    return /iPhone/.test(u) ? 'iPhone' : /iPad/.test(u) || (laIOS() && !/iPhone/.test(u)) ? 'iPad' : /Android/.test(u) ? 'Android' : /Mac/.test(u) ? 'Mac' : /Windows/.test(u) ? 'Máy tính Windows' : 'Trình duyệt';
  }
  const b64u = s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); const b = atob(s + '='.repeat((4 - s.length % 4) % 4)); return Uint8Array.from(b, c => c.charCodeAt(0)); };
  const u8b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const hoTroTB = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  let suKienCai = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); suKienCai = e; if (S.tab === 'toi') veThongBao(); });

  function dangKySW() {
    if (!('serviceWorker' in navigator) || dangKySW.xong) return;
    dangKySW.xong = true;
    navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {});
    navigator.serviceWorker.addEventListener('message', e => {
      if (e.data && e.data.mo) moDuongDan(new URL(e.data.mo, location.href).hash);
    });
  }

  function veToi() {
    if (!S.toi) return;
    $('#toi-ten').textContent = tenNguoi(S.toi);
    $('#toi-vai').textContent = VAI[S.toi];
    $('#toi-ava').textContent = tenNguoi(S.toi).trim().charAt(0).toUpperCase();
    $('#toi-ava').className = 'ava to c-' + S.toi + '-bg';
    veThongBao();
  }

  async function veThongBao() {
    const k = $('#khung-tb');
    const caiBtn = suKienCai ? '<button type="button" class="dong nut-dong xanh" id="tb-cai">Cài ứng dụng lên màn hình chính</button>' : '';
    if (!hoTroTB()) {
      k.innerHTML = laIOS() && !daCaiApp()
        ? `<div class="tt-tb"><b>Trên iPhone cần cài app trước:</b><ol><li>Mở trang này bằng <b>Safari</b>.</li><li>Bấm nút <b>Chia sẻ</b> (ô vuông có mũi tên lên).</li><li>Chọn <b>“Thêm vào MH chính”</b> → Thêm.</li><li>Mở app <b>“Lịch làm việc”</b> trên màn hình chính, vào Cài đặt → Bật thông báo.</li></ol>Cần iOS 16.4 trở lên.</div>`
        : '<div class="tt-tb">Trình duyệt này chưa hỗ trợ thông báo. Trên Android hãy dùng Chrome; trên iPhone cần iOS 16.4 trở lên và cài app lên màn hình chính.</div>' + caiBtn;
      return;
    }
    if (Notification.permission === 'denied') {
      k.innerHTML = `<div class="tt-tb"><b>Thông báo đang bị chặn.</b><br>${laIOS() ? 'Vào Cài đặt của iPhone → Thông báo → Lịch làm việc → bật Cho phép thông báo.' : 'Bấm biểu tượng ổ khoá cạnh thanh địa chỉ → Thông báo → Cho phép, rồi tải lại trang.'}</div>`;
      return;
    }
    let sub = null;
    try { sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription(); } catch (e) { /* bỏ qua */ }
    if (sub && Notification.permission === 'granted') {
      k.innerHTML = `<div class="dong"><span>Trạng thái</span><span class="gia-tri" style="color:var(--c-chung)">● Đã bật</span></div>
        <button type="button" class="dong nut-dong xanh" id="tb-thu">Gửi thử thông báo</button>
        <button type="button" class="dong nut-dong nut-xoa" id="tb-tat">Tắt thông báo trên máy này</button>${caiBtn}`;
    } else {
      k.innerHTML = `<div class="tt-tb">Chưa bật. Bấm nút dưới rồi chọn <b>Cho phép</b>.</div>
        <button type="button" class="dong nut-dong xanh" id="tb-bat">Bật thông báo</button>${caiBtn}`;
    }
  }

  $('#khung-tb').addEventListener('click', async e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'tb-bat') batThongBao(b);
    if (b.id === 'tb-cai' && suKienCai) { suKienCai.prompt(); suKienCai = null; veThongBao(); }
    if (b.id === 'tb-thu') {
      b.disabled = true;
      try { const r = await api('thuThongBao'); toast(`Đã gửi tới ${r.daGui} máy. Thông báo sẽ hiện sau vài giây.`); }
      catch (err) { toast(err.message, 4000); }
      b.disabled = false;
    }
    if (b.id === 'tb-tat') {
      b.disabled = true;
      try {
        const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
        if (sub) { await api('huyThongBao', { endpoint: sub.endpoint }).catch(() => {}); await sub.unsubscribe(); }
        kho.del('dkTb'); toast('Đã tắt thông báo trên máy này');
      } catch (err) { toast(err.message); }
      veThongBao();
    }
  });

  async function batThongBao(b) {
    b.disabled = true;
    try {
      const quyen = await Notification.requestPermission();   // iPhone bắt buộc gọi ngay khi bấm nút
      if (quyen !== 'granted') throw new Error('Bạn chưa cho phép thông báo');
      if (!S.vapid) throw new Error('Máy chủ chưa có khoá thông báo');
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (sub && sub.options && sub.options.applicationServerKey && u8b64(sub.options.applicationServerKey) !== S.vapid) { await sub.unsubscribe(); sub = null; }
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(S.vapid) });
      await api('dangKyThongBao', { sub: sub.toJSON(), tenMay: tenMay() });
      kho.set('dkTb', { t: Date.now(), v: S.toi });
      toast('Đã bật thông báo ✓');
    } catch (err) { toast(err.message, 4000); }
    veThongBao();
  }

  // Gửi lại đăng ký vài ngày 1 lần (phòng khi máy chủ đã xoá hoặc đổi người dùng trên máy này)
  async function kiemTraDangKyTB() {
    if (!hoTroTB() || Notification.permission !== 'granted') return;
    const dk = kho.get('dkTb', null);
    if (dk && dk.v === S.toi && Date.now() - dk.t < 3 * 864e5) return;
    try {
      const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
      if (!sub) return;
      await api('dangKyThongBao', { sub: sub.toJSON(), tenMay: tenMay() });
      kho.set('dkTb', { t: Date.now(), v: S.toi });
    } catch (e) { /* thử lại lần sau */ }
  }

  $('#nut-doi-ten').onclick = () => {
    const sh = moSheet(`<form><div class="sheet-dau"><button type="button" data-dong>Huỷ</button><b>Đổi tên hiển thị</b><button type="submit">Lưu</button></div>
      <div class="sheet-than"><div class="nhom"><label class="dong cot"><input name="ten" maxlength="40" value="${esc(tenNguoi(S.toi))}" aria-label="Tên hiển thị" required></label></div>
      <p class="chu-thich">Tên này hiện với ${esc(tenNguoi(khac()))} trong tin nhắn và thông báo.</p><p class="loi" role="alert"></p></div></form>`);
    $('form', sh).addEventListener('submit', async e => {
      e.preventDefault();
      try { const r = await api('doiTen', { ten: e.target.elements.ten.value }); S.ten = r.ten; luuCache(); veLai(); dongSheet(); toast('Đã đổi tên'); }
      catch (err) { $('.loi', sh).textContent = err.message; }
    });
  };

  $('#nut-doi-mk').onclick = () => {
    const sh = moSheet(`<form><div class="sheet-dau"><button type="button" data-dong>Huỷ</button><b>Đổi mật khẩu</b><button type="submit">Lưu</button></div>
      <div class="sheet-than"><div class="nhom">
        <label class="dong"><span>Hiện tại</span><input name="cu" type="password" autocomplete="current-password" required></label>
        <label class="dong"><span>Mới</span><input name="moi" type="password" autocomplete="new-password" minlength="4" required placeholder="Ít nhất 4 ký tự"></label>
        <label class="dong"><span>Nhập lại</span><input name="moi2" type="password" autocomplete="new-password" required></label>
      </div><p class="loi" role="alert"></p></div></form>`);
    $('form', sh).addEventListener('submit', async e => {
      e.preventDefault();
      const f = e.target.elements;
      if (f.moi.value !== f.moi2.value) { $('.loi', sh).textContent = 'Hai lần nhập mật khẩu mới chưa khớp'; return; }
      try { await api('doiMatKhau', { cu: f.cu.value, moi: f.moi.value }); dongSheet(); toast('Đã đổi mật khẩu'); }
      catch (err) { $('.loi', sh).textContent = err.message; }
    });
  };

  $('#nut-dang-xuat').onclick = async () => {
    if (!confirm('Đăng xuất khỏi máy này? Máy này sẽ không nhận thông báo nữa.')) return;
    let endpoint = '';
    try { const sub = hoTroTB() && await (await navigator.serviceWorker.ready).pushManager.getSubscription(); if (sub) endpoint = sub.endpoint; } catch (e) { /* bỏ qua */ }
    try { await api('dangXuat', { endpoint }); } catch (e) { /* vẫn đăng xuất trên máy */ }
    clearTimeout(hPoll);
    S.token = null; S.toi = null; S.tin = []; S.choGui = []; S.lich = []; S.tinCuoi = 0; S.daDoc = { sep: 0, troly: 0 };
    kho.del('token'); kho.del('cache'); kho.del('dkTb');
    try { navigator.clearAppBadge && navigator.clearAppBadge(); } catch (e) { /* bỏ qua */ }
    chuyenTab('lich');
    moDangNhap();
  };

  /* ===================== BÀN PHÍM ĐIỆN THOẠI ===================== */
  const vv = window.visualViewport;
  function theoBanPhim() {
    const h = vv ? vv.height : window.innerHeight;
    document.documentElement.style.setProperty('--app-h', h + 'px');
    $('#app').style.top = (vv ? vv.offsetTop : 0) + 'px';
    document.body.classList.toggle('ban-phim-mo', !!vv && window.innerHeight - vv.height > 150);
  }
  if (vv) { vv.addEventListener('resize', theoBanPhim); vv.addEventListener('scroll', theoBanPhim); }
  window.addEventListener('resize', theoBanPhim);
  theoBanPhim();

  S.homNayCu = homNay();
  khoiDong();
})();
