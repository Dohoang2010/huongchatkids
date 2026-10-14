/* Lịch làm việc – nhiều thành viên + admin. Máy chủ: tools/lich-trinh-vps/server.js */
'use strict';
(() => {
  const DEMO = window.LICH_DEMO || null;   // ?demo: máy chủ giả trong demo.js
  const API = DEMO ? 'demo' : String(window.LICH_API || '').trim();
  const TIEN_TO = DEMO ? 'ltd_' : 'lt_';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const kho = {
    get(k, d) { try { const v = localStorage.getItem(TIEN_TO + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(TIEN_TO + k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } },
    del(k) { try { localStorage.removeItem(TIEN_TO + k); } catch (e) { /* bỏ qua */ } }
  };

  const MAU_CHUNG = '#34c759';
  const MAU_TV = ['#ff9500', '#007aff', '#af52de', '#ff2d55', '#5ac8fa', '#a2845e', '#ffcc00', '#5856d6', '#ff6482', '#30b0c7', '#64c466', '#bf5af2'];
  const THU = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const LAP = { '': 'Không bao giờ', ngay: 'Hằng ngày', tuan: 'Hằng tuần', thang: 'Hằng tháng', nam: 'Hằng năm' };
  const NHAC_GIO = [[-1, 'Không'], [0, 'Lúc diễn ra'], [5, '5 phút trước'], [10, '10 phút trước'], [15, '15 phút trước'], [30, '30 phút trước'],
    [60, '1 giờ trước'], [120, '2 giờ trước'], [1440, '1 ngày trước'], [2880, '2 ngày trước'], [10080, '1 tuần trước']];
  const NHAC_NGAY = [[-1, 'Không'], [0, 'Ngày diễn ra (8:00)'], [1440, '1 ngày trước (8:00)'], [2880, '2 ngày trước (8:00)'], [10080, '1 tuần trước (8:00)']];

  const S = {
    token: null, toi: null, admin: false, nguoi: [], verNguoi: '', vapid: '',
    lich: [], verLich: '', tin: [], choGui: [], tinCuoi: 0, daDoc: {}, online: {}, kenh: null,
    thang: null, chon: null, xem: 'thang', namXem: 0, tab: 'lich',
    loc: kho.get('loc2', {})
  };

  /* ===================== THÀNH VIÊN & LỊCH CỦA AI ===================== */
  const nguoi = id => S.nguoi.find(u => u.id === id);
  const tenNguoi = id => (nguoi(id) || {}).ten || 'Người đã rời nhóm';
  const chuCai = s => String(s || '?').trim().charAt(0).toUpperCase();
  // Ảnh đại diện: có ảnh thì hiện ảnh, không thì chữ cái đầu trên nền màu của người đó
  const anhCua = u => !u ? '' : u.anhUrl || (u.anh ? `${API}?anh=${encodeURIComponent(u.id)}&v=${encodeURIComponent(u.anh)}` : '');
  const avaHtml = (u, cls = '', id = '') => {
    const a = anhCua(u);
    return `<i${id ? ` id="${id}"` : ''} class="ava ${cls}" style="background:${u && !u.admin ? u.mau : '#636366'}" aria-hidden="true">${a ? `<img src="${esc(a)}" alt="" loading="lazy">` : esc(chuCai(u && u.ten))}</i>`;
  };
  const thanhVien = () => S.nguoi.filter(u => !u.admin && !u.daXoa);
  const dsLich = conHoatDong => [...thanhVien().filter(u => !conHoatDong || !u.khoa).map(u => u.id), 'chung'];
  const mauLich = l => l === 'chung' ? MAU_CHUNG : (nguoi(l) || {}).mau || '#8e8e93';
  const tenLich = l => { if (l === 'chung') return 'Lịch chung'; const u = nguoi(l); return u ? u.ten + (u.chucVu ? ` (${u.chucVu})` : '') : 'Người đã rời nhóm'; };
  const tenLichNgan = l => l === 'chung' ? 'Lịch chung' : 'Lịch ' + tenNguoi(l);
  const hienLich = l => S.loc[l] !== false;
  const lichMacDinh = () => { const l = kho.get('lichMacDinh', ''); return dsLich(true).includes(l) ? l : dsLich(true).includes(S.toi) ? S.toi : 'chung'; };

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
      if (!tatCa && !hienLich(ev.lich)) continue;
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
    if (DEMO) r = await DEMO.api(action, Object.assign({ token: S.token }, data));
    else try {
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
    kho.set('cache2', { toi: S.toi, admin: S.admin, nguoi: S.nguoi, verNguoi: S.verNguoi, vapid: S.vapid, lich: S.lich, verLich: S.verLich, tin: S.tin.slice(-300), tinCuoi: S.tinCuoi, daDoc: S.daDoc });
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
    const c = kho.get('cache2', null);
    if (c && c.toi) { Object.assign(S, c); vaoApp(); }
    try {
      const r = await api('tongHop', { kenhMo: '' });
      Object.assign(S, { toi: r.toi, admin: !!r.admin, nguoi: r.nguoi, verNguoi: r.verNguoi, vapid: r.vapid, lich: r.lich, verLich: r.verLich, tinCuoi: r.tinCuoi, online: r.online || {} });
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
    moLuong();
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
      const f = $('#form-dangnhap');
      if (!f.elements.tenDangNhap.value) f.elements.tenDangNhap.value = kho.get('tenCu', '');
      hienMan('dangnhap');
    } catch (e) { loiTai(e.message, moDangNhap); }
  }

  function hetPhien() {
    S.token = null; kho.del('token'); kho.del('cache2'); kho.del('dkTb');
    clearTimeout(hPoll); dongLuong(); dongSheet();
    toast('Phiên đăng nhập đã hết, vui lòng đăng nhập lại');
    moDangNhap();
  }

  $('#form-caidat').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, nut = $('button[type=submit]', f), data = Object.fromEntries(new FormData(f));
    if (data.matKhau !== data.matKhau2) { $('.loi', f).textContent = 'Hai lần nhập mật khẩu chưa khớp'; return; }
    nut.disabled = true; $('.loi', f).textContent = '';
    try {
      await api('caiDat', { tenDangNhap: data.tenDangNhap, matKhau: data.matKhau });
      kho.set('tenCu', data.tenDangNhap.trim().toLowerCase());
      toast('Đã tạo admin. Mời đăng nhập.'); moDangNhap();
    }
    catch (err) { $('.loi', f).textContent = err.message; }
    finally { nut.disabled = false; }
  });

  $('#form-dangnhap').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, nut = $('button[type=submit]', f), data = Object.fromEntries(new FormData(f));
    data.tenDangNhap = String(data.tenDangNhap || '').trim().toLowerCase();
    nut.disabled = true; $('.loi', f).textContent = '';
    try {
      const r = await api('dangNhap', Object.assign(data, { tenMay: tenMay() }));
      S.token = r.token; kho.set('token', r.token); kho.set('tenCu', data.tenDangNhap);
      f.elements.matKhau.value = '';
      await khoiDong();
    } catch (err) { $('.loi', f).textContent = err.message; }
    finally { nut.disabled = false; }
  });

  function vaoApp() {
    hienMan('chinh');
    // Admin: không có tin nhắn, có tab Thành viên
    $('.tabbar [data-den=chat]').hidden = S.admin;
    $('.tabbar [data-den=thanhvien]').hidden = !S.admin;
    if (S.admin && S.tab === 'chat') chuyenTab('lich');
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
    veChat(); capNhatHuyHieu();
    veToi();
  }

  /* ===================== CHUYỂN TAB & ĐƯỜNG DẪN ===================== */
  function chuyenTab(t) {
    S.tab = t;
    $$('#man-chinh .tab').forEach(x => { x.hidden = x.dataset.tab !== t; });
    $$('.tabbar button').forEach(b => b.classList.toggle('dang-chon', b.dataset.den === t));
    if (t === 'nhap' && !$('#form-nhap')) veNhap();
    if (t === 'chat') { veChat(true); danhDauDaDoc(); }
    if (t === 'thanhvien') veThanhVien();
    if (S.token) henPoll(300);
    if (t === 'toi') veToi();
  }

  $$('.tabbar button').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.den === 'lich' && S.tab === 'lich') return veHomNay();
    if (b.dataset.den === 'chat' && S.tab === 'chat' && S.kenh) return dongKenh();
    chuyenTab(b.dataset.den);
  }));

  function moDuongDan(hash) {
    const p = String(hash || '').replace(/^#/, '').split('/');
    if (!p[0]) return;
    if (p[0] === 'chat') { chuyenTab('chat'); if (p[1]) moKenh(decodeURIComponent(p[1])); }
    else if (p[0] === 'toi') chuyenTab('toi');
    else if (p[0] === 'sap-toi') chuyenTab('lich');
    else if (p[0] === 'nhap') chuyenTab('nhap');
    else if (p[0] === 'nhap-nhieu') { chuyenTab('lich'); moNhapNhieu(); }
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
      const cham = c ? [...dsLich(), ...[...c].filter(l => !dsLich().includes(l))].filter(l => c.has(l)).slice(0, 4).map(l => `<i style="background:${mauLich(l)}"></i>`).join('') : '';
      html += `<button type="button" class="${cls}" data-ngay="${ymd}" role="gridcell" aria-selected="${ymd === S.chon}" aria-label="${ngayDai(ymd)}${c ? ', có lịch' : ''}"><span class="so">${d}</span><span class="cham-ngay">${cham}</span></button>`;
    }
    $('#luoi-thang').innerHTML = html;
  }

  // Dưới lịch tháng: các sự kiện sắp tới, bắt đầu từ ngày đang chọn (mặc định hôm nay), 60 ngày
  function veDsNgay() {
    const q = boDau($('#tim').value.trim()), h = homNay(), chon = S.chon || h;
    const tu = q ? ymdCong(h, -365) : chon, den = q ? ymdCong(h, 365) : ymdCong(chon, 60);
    let ds = trongKhoang(tu, den, !!q);
    if (q) ds = ds.filter(o => boDau(`${o.ev.tieuDe} ${o.ev.diaDiem} ${o.ev.ghiChu}`).includes(q));
    ds.forEach(o => { o.hien = o.ngay < tu ? tu : o.ngay; });
    ds.sort((a, b) => a.hien.localeCompare(b.hien) || thuTu(a, b));
    ds = ds.slice(0, 300);
    const dau = d => {
      const gan = tenNgayGan(d);
      return `<div class="ngay-dau${d === h ? ' hn' : ''}">${gan ? gan + ' <small>· ' + ngayDai(d) + '</small>' : ngayDai(d)}</div>`;
    };
    let html = `<div class="tieu-de-ds"><h2>${q ? 'Kết quả tìm kiếm' : 'Sự kiện sắp tới'}</h2>${!q && chon !== h ? '<button type="button" class="nut-chu" id="ds-tu-hom-nay">Từ hôm nay</button>' : ''}</div>`;
    if (q && !ds.length) html += '<p class="trong-rong">Không tìm thấy sự kiện nào</p>';
    if (!q && !ds.some(o => o.hien === chon)) html += dau(chon) + '<p class="trong-rong nho">Không có sự kiện</p>';
    let truoc = '';
    for (const o of ds) {
      if (o.hien !== truoc) { html += dau(o.hien); truoc = o.hien; }
      html += dongSuKien(o, o.hien);
    }
    if (!q && !ds.length) html += '<p class="trong-rong nho">Không có lịch nào trong 60 ngày tới. Bấm “Nhập lịch” để thêm.</p>';
    $('#ds-ngay').innerHTML = html;
  }

  function dongSuKien(o, ngay) {
    const ev = o.ev;
    let gio;
    if (ev.caNgay || (o.ngay !== ngay && o.ket !== ngay)) gio = 'cả ngày';
    else if (o.ngay === ngay && o.ket === ngay) gio = ev.bd.slice(11) + (ev.kt !== ev.bd ? `<small>${ev.kt.slice(11)}</small>` : '');
    else if (o.ngay === ngay) gio = `${ev.bd.slice(11)}<small>bắt đầu</small>`;
    else gio = `${ev.kt.slice(11)}<small>kết thúc</small>`;
    const phu = [ev.diaDiem, tenLichNgan(ev.lich)].filter(Boolean).join(' · ');
    return `<button type="button" class="su-kien" data-ev="${esc(ev.id)}" data-ngay="${o.ngay}"><span class="gio">${gio}</span><i class="vach-mau" style="background:${mauLich(ev.lich)}"></i><span class="nd"><b>${esc(ev.tieuDe)}</b><small>${esc(phu)}</small></span></button>`;
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
    if (e.target.id === 'ds-tu-hom-nay') return veHomNay();
    const o = e.target.closest('.su-kien');
    if (o) moChiTiet(o.dataset.ev, o.dataset.ngay);
  });
  $('#tim').addEventListener('input', veDsNgay);
  $('#nut-tim').onclick = () => {
    const k = $('#khung-tim');
    k.hidden = !k.hidden;
    if (k.hidden) { $('#tim').value = ''; veDsNgay(); } else { $('#tim').focus(); k.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  };
  $('#thang-truoc').onclick = () => doiThang(-1);
  $('#thang-sau').onclick = () => doiThang(1);
  $('#nut-hom-nay').onclick = veHomNay;
  $('#nut-ve-nam').onclick = () => { S.namXem = S.thang.y; hienXem('nam'); };
  $('#nut-them').onclick = () => {
    chuyenTab('nhap');
    if (!$('#form-nhap [name=noiDung]').value.trim()) veNhap(S.chon);
  };
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
      <div class="sheet-than"><div class="nhom">${dsLich().map(l => `<button type="button" class="dong" data-loc="${esc(l)}"><i class="cham" style="background:${mauLich(l)}"></i><span>${esc(tenLich(l))}</span><span class="dau-tich">${hienLich(l) ? '✓' : ''}</span></button>`).join('')}</div>
      <p class="chu-thich">Bỏ chọn để tạm ẩn lịch của người đó khỏi trang Lịch.</p></div>`);
    sh.addEventListener('click', e => {
      const b = e.target.closest('[data-loc]');
      if (!b) return;
      S.loc[b.dataset.loc] = !hienLich(b.dataset.loc);
      kho.set('loc2', S.loc);
      $('.dau-tich', b).textContent = hienLich(b.dataset.loc) ? '✓' : '';
      veThang(); veDsNgay(); if (S.xem === 'nam') veNam();
    });
  }

  /* ---- Xem chi tiết sự kiện ---- */
  const linkHoa = s => esc(s).replace(/https?:\/\/[^\s<]+/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
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
          <div class="dong"><span>Lịch của</span><span class="gia-tri"><i class="cham" style="background:${mauLich(ev.lich)}"></i>${esc(tenLich(ev.lich))}</span></div>
          <div class="dong"><span>Cảnh báo</span><span class="gia-tri">${esc(tenNhac(ev))}</span></div>
        </div>
        ${ev.ghiChu ? `<div class="nhom"><div class="ct-chu">${linkHoa(ev.ghiChu)}</div></div>` : ''}
        <div class="nhom">
          ${S.admin ? '' : '<button type="button" class="dong nut-dong xanh" id="ct-gui">Gửi vào tin nhắn</button>'}
          <button type="button" class="dong nut-dong nut-xoa" id="ct-xoa">Xoá sự kiện</button>
        </div>
        <p class="ct-meta">Tạo bởi ${esc(tenNguoi(ev.taoBoi))}${sua}</p>
      </div>`);
    $('#ct-sua', sh).onclick = () => moSoan(ev);
    if ($('#ct-gui', sh)) $('#ct-gui', sh).onclick = () => chonKenhGui(ev.id);
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

  // Form lịch trình: chọn giờ, phút, ngày, tháng, năm bằng ô chọn + địa điểm + nội dung công việc.
  // Dùng cho trang "Nhập lịch trình" và khi bấm Sửa một sự kiện.
  const soOpt = (tu, den, gt, nhan = pad) => { let h = ''; for (let i = tu; i <= den; i++) h += `<option value="${i}"${i === gt ? ' selected' : ''}>${nhan(i)}</option>`; return h; };
  const phutOpt = gt => [...new Set([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, gt])].sort((a, b) => a - b)
    .map(p => `<option value="${p}"${p === gt ? ' selected' : ''}>${pad(p)} phút</option>`).join('');

  function evMoi(ngay) {
    const gio = Math.min(new Date().getHours() + 1, 23), bd = `${ngay}T${pad(gio)}:00`;
    return { tieuDe: '', caNgay: false, bd, kt: bd, diaDiem: '', lich: lichMacDinh(), lap: '', lapDen: '', nhac: 15, ghiChu: '' };
  }

  // Các ô chọn "Lịch của": mỗi thành viên + Chung
  function chipLich(ten, gt) {
    const ds = dsLich(true);
    if (gt && !ds.includes(gt)) ds.unshift(gt);
    return ds.map(l => `<label><input type="radio" name="${ten}" value="${esc(l)}"${l === gt ? ' checked' : ''}><span style="color:${mauLich(l)}"><i class="cham" style="background:${mauLich(l)}"></i><b style="color:var(--chu);font-weight:inherit">${esc(l === 'chung' ? 'Chung' : tenNguoi(l))}</b></span></label>`).join('');
  }

  function htmlFormLich(ev) {
    const y = +ev.bd.slice(0, 4), m = +ev.bd.slice(5, 7), d = +ev.bd.slice(8, 10), namNay = +homNay().slice(0, 4);
    const coDen = !ev.caNgay && ev.kt !== ev.bd, motNgay = ev.kt.slice(0, 10) === ev.bd.slice(0, 10);
    const noiDung = ev.tieuDe + (ev.ghiChu ? '\n' + ev.ghiChu : '');
    return `
      <p class="nhom-ten">Thời gian</p>
      <div class="nhom">
        <div class="dong"><span>Ngày</span><span class="chon-so">
          <select name="ngay" aria-label="Ngày">${soOpt(1, soNgayThang(y, m), d)}</select>
          <select name="thang" aria-label="Tháng">${soOpt(1, 12, m, i => 'Tháng ' + i)}</select>
          <select name="nam" aria-label="Năm">${soOpt(Math.min(y, namNay - 1), Math.max(y, namNay + 4), y, String)}</select></span></div>
        <div class="dong"><span>Giờ</span><span class="chon-so">
          <select name="gio" aria-label="Giờ"><option value="ca"${ev.caNgay ? ' selected' : ''}>Cả ngày</option>${soOpt(0, 23, ev.caNgay ? -1 : +ev.bd.slice(11, 13), i => pad(i) + ' giờ')}</select>
          <select name="phut" aria-label="Phút"${ev.caNgay ? ' hidden' : ''}>${phutOpt(+ev.bd.slice(14, 16))}</select></span></div>
        <div class="dong dong-den"${ev.caNgay ? ' hidden' : ''}><span>Đến</span><span class="chon-so">
          <select name="denGio" aria-label="Đến giờ"><option value="">— không —</option>${soOpt(0, 23, coDen ? +ev.kt.slice(11, 13) : -1, i => pad(i) + ' giờ')}</select>
          <select name="denPhut" aria-label="Đến phút"${coDen ? '' : ' hidden'}>${phutOpt(coDen ? +ev.kt.slice(14, 16) : 0)}</select></span></div>
      </div>
      <p class="nhom-ten">Địa điểm</p>
      <div class="nhom"><label class="dong cot"><input name="diaDiem" placeholder="VD: Văn phòng công ty, quán cà phê, link họp…" maxlength="200" value="${esc(ev.diaDiem)}" aria-label="Địa điểm"></label></div>
      <p class="nhom-ten">Nội dung công việc</p>
      <div class="nhom"><label class="dong cot"><textarea name="noiDung" placeholder="VD: Họp với đối tác về hợp đồng quý 4. Mang theo bản in hợp đồng." maxlength="3200" aria-label="Nội dung công việc">${esc(noiDung)}</textarea></label></div>
      <p class="nhom-ten">Lịch của</p>
      <div class="nhom chon-lich" role="radiogroup" aria-label="Lịch của">${chipLich('lich', ev.lich)}</div>
      <div class="nhom"><label class="dong"><span>Nhắc trước</span><select name="nhac">${luaChonNhac(ev.caNgay, ev.nhac)}</select></label></div>
      <details class="nhom tuy-chon"${ev.lap || !motNgay ? ' open' : ''}><summary class="dong">Tuỳ chọn thêm: lặp lại, kéo dài nhiều ngày</summary>
        <label class="dong"><span>Lặp lại</span><select name="lap">${Object.entries(LAP).map(([k, t]) => `<option value="${k}"${k === ev.lap ? ' selected' : ''}>${t}</option>`).join('')}</select></label>
        <label class="dong dong-lap-den"${ev.lap ? '' : ' hidden'}><span>Lặp đến ngày</span><input type="date" name="lapDen" value="${esc(ev.lapDen)}" aria-label="Lặp đến ngày"></label>
        <label class="dong"><span>Kéo dài đến ngày</span><input type="date" name="ktNgay" value="${motNgay ? '' : ev.kt.slice(0, 10)}" aria-label="Kéo dài đến ngày"></label>
      </details>`;
  }

  function ganFormLich(f) {
    const el = n => f.elements[n];
    const doiThangNam = () => {
      const n = soNgayThang(+el('nam').value, +el('thang').value), d = Math.min(+el('ngay').value, n);
      el('ngay').innerHTML = soOpt(1, n, d);
    };
    el('thang').addEventListener('change', doiThangNam);
    el('nam').addEventListener('change', doiThangNam);
    el('gio').addEventListener('change', () => {
      const ca = el('gio').value === 'ca';
      el('phut').hidden = ca;
      $('.dong-den', f).hidden = ca;
      el('nhac').innerHTML = luaChonNhac(ca, Number(el('nhac').value));
      if (!ca && el('denGio').value && +el('denGio').value < +el('gio').value) { el('denGio').value = ''; el('denPhut').hidden = true; }
    });
    el('denGio').addEventListener('change', () => { el('denPhut').hidden = !el('denGio').value; });
    el('lap').addEventListener('change', () => { $('.dong-lap-den', f).hidden = !el('lap').value; });
    $$('input[type=date]', f).forEach(i => i.addEventListener('click', () => { try { i.showPicker(); } catch (e) { /* trình duyệt tự mở */ } }));
  }

  function docFormLich(f, ev) {
    const el = n => f.elements[n];
    const ngay = `${el('nam').value}-${pad(+el('thang').value)}-${pad(+el('ngay').value)}`, caNgay = el('gio').value === 'ca';
    const noiDung = el('noiDung').value.trim();
    if (!noiDung) throw new Error('Chưa nhập nội dung công việc');
    const dong = noiDung.split('\n'), dau = dong[0].trim();
    const tieuDe = dau.slice(0, 200), ghiChu = ((dau.length > 200 ? dau.slice(200) + '\n' : '') + dong.slice(1).join('\n')).trim();
    const ktNgay = el('ktNgay').value > ngay ? el('ktNgay').value : ngay;
    const bd = caNgay ? `${ngay}T00:00` : `${ngay}T${pad(+el('gio').value)}:${pad(+el('phut').value)}`;
    let kt;
    if (caNgay) kt = `${ktNgay}T23:59`;
    else if (el('denGio').value) kt = `${ktNgay}T${pad(+el('denGio').value)}:${pad(+el('denPhut').value)}`;
    else kt = ktNgay > ngay ? `${ktNgay}T23:59` : bd;
    if (kt < bd) throw new Error('Giờ “Đến” phải sau giờ bắt đầu');
    const lapDen = el('lap').value ? el('lapDen').value : '';
    if (lapDen && lapDen < ngay) throw new Error('Ngày “Lặp đến” phải sau ngày bắt đầu');
    return {
      id: ev && ev.id, tieuDe, ghiChu, diaDiem: el('diaDiem').value.trim(), caNgay, bd, kt,
      lap: el('lap').value, lapDen, lich: (f.querySelector('input[name=lich]:checked') || {}).value || lichMacDinh(),
      nhac: Number(el('nhac').value)
    };
  }

  async function luuTuForm(ra) {
    const r = await api('luuLich', { ev: ra });
    const i = S.lich.findIndex(x => x.id === r.ev.id);
    if (i >= 0) S.lich[i] = r.ev; else S.lich.push(r.ev);
    S.verLich = r.verLich;
    luuCache();
    return r.ev;
  }

  // Trang "Nhập lịch trình"
  function veNhap(ngay) {
    const ev = evMoi(ngay || S.chon || homNay());
    $('#khung-nhap').innerHTML = `<form id="form-nhap" novalidate>${htmlFormLich(ev)}
      <button class="nut-chinh" type="submit">Lưu lịch trình</button>
      <p class="loi" role="alert"></p>
      <button type="button" class="nut-phu" id="nut-mo-nhieu">Nhập nhiều lịch cùng lúc →</button></form>`;
    const f = $('#form-nhap');
    ganFormLich(f);
    $('#nut-mo-nhieu').onclick = moNhapNhieu;
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const loi = $('.loi', f), nut = $('button[type=submit]', f);
      let ra;
      try { ra = docFormLich(f); } catch (err) { loi.textContent = err.message; return; }
      nut.disabled = true; loi.textContent = '';
      try {
        const moi = await luuTuForm(ra);
        kho.set('lichMacDinh', ra.lich);
        veLai();
        const ngayLuu = moi.bd.slice(0, 10);
        toast(`Đã lưu: ${moi.tieuDe} – ${moi.caNgay ? 'cả ngày' : moi.bd.slice(11)} ${ngayNgan(ngayLuu)}`, 3000);
        veNhap(ngayLuu);   // để trống form, giữ ngày vừa chọn để nhập tiếp
        $('#tab-nhap').scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) { loi.textContent = err.message; nut.disabled = false; }
    });
  }

  // Sửa một sự kiện có sẵn (bảng trượt)
  function moSoan(ev) {
    const sh = moSheet(`<form id="form-sk" novalidate>
      <div class="sheet-dau"><button type="button" data-dong>Huỷ</button><b>Sửa lịch trình</b><button type="submit">Lưu</button></div>
      <div class="sheet-than">${htmlFormLich(ev)}<p class="loi" role="alert"></p></div></form>`);
    const f = $('#form-sk', sh);
    ganFormLich(f);
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const loi = $('.loi', f), nut = $('button[type=submit]', f);
      let ra;
      try { ra = docFormLich(f, ev); } catch (err) { loi.textContent = err.message; return; }
      nut.disabled = true; loi.textContent = '';
      try {
        await luuTuForm(ra);
        dongSheet(); chonNgay(ra.bd.slice(0, 10)); veLai();
        toast('Đã lưu thay đổi');
      } catch (err) { loi.textContent = err.message; nut.disabled = false; }
    });
  }

  /* ===================== NHẬP NHIỀU LỊCH 1 LẦN ===================== */
  // [Tên] trong dòng dán vào → lịch của thành viên có tên / chức vụ khớp; [Chung] → lịch chung
  function timLichTheoTen(chu) {
    const k = boDau(chu).trim();
    if (k === 'chung') return 'chung';
    const ds = thanhVien().filter(u => !u.khoa);
    const u = ds.find(x => boDau(x.ten) === k) || ds.find(x => boDau(x.chucVu) === k) || ds.find(x => boDau(x.ten).includes(k) || (k.length > 2 && boDau(x.chucVu).includes(k)));
    return u ? u.id : '';
  }

  // Tách danh sách dán vào (mỗi dòng 1 lịch, hoặc copy từ Excel) thành các dòng lịch.
  // Hiểu: 16/10, 16/10/2026, hôm nay, mai, mốt, thứ 2…CN · 9:00, 9h, 9h30, 2h chiều, 9:00-10:30, cả ngày · "@ địa điểm" · [Sếp]/[Trợ lý]/[Chung]
  function tachDanhSach(chu, ngayDau) {
    const kq = [];
    let ngayTruoc = ngayDau;
    for (let dong of String(chu).split(/\r?\n/)) {
      dong = dong.replace(/^\s*(?:[-•*+]|\d+[.)])\s+/, '').trim();
      if (!dong) continue;
      const o = { ngay: '', tu: '', den: '', caNgay: false, tieuDe: '', diaDiem: '', lich: '' };
      const o1 = dong.split('\t').map(x => x.trim()).filter(Boolean);
      let con = o1.length > 1 ? o1.slice() : [dong];
      const lay = (re, fn) => { con = con.map(c => c.replace(re, (...m) => { fn(m); return ' '; })); };
      lay(/\[([^\]]{1,40})\]/, m => { o.lich = timLichTheoTen(m[1]); });
      lay(/(?:^|\s)(?:cả ngày|ca ngay)(?=\s|$|[,.;:])/i, () => { o.caNgay = true; });
      lay(/(?:^|\s)(?:ngày\s*)?(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?(?=\s|$|,)/, m => {
        const h = homNay();
        let y = m[3] ? +m[3] : +h.slice(0, 4);
        if (y < 100) y += 2000;
        let ymd = `${y}-${pad(+m[2])}-${pad(+m[1])}`;
        if (!m[3] && ymd < ymdCong(h, -60)) ymd = `${y + 1}${ymd.slice(4)}`;
        if (+m[2] >= 1 && +m[2] <= 12 && +m[1] >= 1 && +m[1] <= 31) o.ngay = ymd;
      });
      if (!o.ngay) lay(/(?:^|\s)(hôm nay|hom nay|ngày mai|ngay mai|mai|ngày mốt|mốt|mot)(?=\s|$|[,.;:])/i, m => {
        const k = boDau(m[1]); o.ngay = ymdCong(homNay(), k.includes('nay') ? 0 : k.includes('mai') ? 1 : 2);
      });
      if (!o.ngay) lay(/(?:^|\s)(?:thứ\s*(2|3|4|5|6|7|hai|ba|tư|năm|sáu|bảy)|t([2-7])|(cn|chủ nhật))(?=\s|$|[,.;:])/i, m => {
        const ten = { hai: 2, ba: 3, 'tư': 4, 'năm': 5, 'sáu': 6, 'bảy': 7 };
        const so = m[3] ? 8 : +(m[2] || ten[String(m[1]).toLowerCase()] || m[1]);
        const thu = so === 8 ? 0 : so - 1, h = homNay();
        o.ngay = ymdCong(h, (thu - thuCua(h) + 7) % 7);
      });
      const gio = (h, p, buoi) => {
        h = +h; if (/chiều|tối/i.test(buoi || '') && h < 12) h += 12;
        return h <= 23 && (+p || 0) <= 59 ? `${pad(h)}:${pad(+p || 0)}` : '';
      };
      lay(/(?:^|\s)(\d{1,2})(?:\s*giờ|[:hg](?![a-zà-ỹ]))\s*(\d{2})?\s*(sáng|chiều|tối)?(?:\s*(?:-|–|đến|tới)\s*(\d{1,2})(?:\s*giờ|[:hg](?![a-zà-ỹ]))?\s*(\d{2})?\s*(sáng|chiều|tối)?)?(?=\s|$|[,.;:])/i, m => {
        if (o.tu && !o.den && !m[4]) { o.den = gio(m[1], m[2], m[3]); return; }   // Excel: ô giờ thứ 2 là giờ kết thúc
        o.tu = gio(m[1], m[2], m[3] || m[6]);
        if (m[4]) o.den = gio(m[4], m[5], m[6] || m[3]);
      });
      if (o1.length > 1) {
        const chu2 = con.map(c => c.replace(/\s+/g, ' ').trim()).filter(Boolean);
        o.tieuDe = chu2[0] || ''; o.diaDiem = chu2.slice(1).join(', ');
      } else {
        let t = con.join(' ');
        const at = t.search(/\s@|@\s|\stại\s/i);
        if (at >= 0) { o.diaDiem = t.slice(at).replace(/^\s*(?:@|tại)\s*/i, '').trim(); t = t.slice(0, at); }
        o.tieuDe = t.replace(/\s+/g, ' ').replace(/^[\s,:;–-]+|[\s,:;–-]+$/g, '');
      }
      if (!o.tieuDe) continue;
      o.ngay = o.ngay || ngayTruoc;
      ngayTruoc = o.ngay;
      if (!o.tu && !o.caNgay) o.caNgay = true;
      if (o.tu && !o.den) o.den = chuoiTuPhut(phutCua(`${o.ngay}T${o.tu}`) + 60).slice(11);
      if (o.den && o.den < o.tu) o.den = '23:59';
      kq.push(o);
    }
    return kq;
  }

  function dongNhap(o, i) {
    return `<div class="dong-nhap${o.caNgay ? ' ca-ngay' : ''}">
      <div class="dn-hang1"><span class="dn-so">${i + 1}</span>
        <input type="date" name="ngay" value="${esc(o.ngay)}" aria-label="Ngày">
        <label class="dn-cn"><input type="checkbox" name="caNgay"${o.caNgay ? ' checked' : ''}>Cả ngày</label>
        <button type="button" class="dn-xoa" aria-label="Bỏ dòng này">×</button></div>
      <div class="dn-hang3"><input type="time" name="tu" value="${esc(o.tu)}" aria-label="Giờ bắt đầu"><span class="gach">–</span><input type="time" name="den" value="${esc(o.den)}" aria-label="Giờ kết thúc">
        <select name="lich" aria-label="Lịch của"><option value="">Lịch: mặc định</option>${dsLich(true).map(l => `<option value="${esc(l)}"${o.lich === l ? ' selected' : ''}>${esc(tenLichNgan(l))}</option>`).join('')}</select></div>
      <input name="tieuDe" placeholder="Tiêu đề" maxlength="200" value="${esc(o.tieuDe)}" aria-label="Tiêu đề">
      <input name="diaDiem" placeholder="Địa điểm (không bắt buộc)" maxlength="200" value="${esc(o.diaDiem)}" aria-label="Địa điểm">
    </div>`;
  }

  function moNhapNhieu() {
    const ngay0 = S.chon || homNay(), trong = () => ({ ngay: ngay0, tu: '', den: '', caNgay: false, tieuDe: '', diaDiem: '', lich: '' });
    const macDinh = lichMacDinh();
    const sh = moSheet(`<form id="form-nhieu" novalidate>
      <div class="sheet-dau"><button type="button" data-dong>Huỷ</button><b>Nhập nhiều lịch</b><button type="submit" id="nn-luu">Lưu</button></div>
      <div class="sheet-than">
        <p class="nhom-ten">Cách 1 · Dán cả danh sách</p>
        <div class="nhom dan-nhanh">
          <textarea id="nn-dan" aria-label="Dán danh sách lịch" placeholder="Mỗi dòng 1 lịch, ví dụ:
16/10 9:00-10:30 Họp đối tác @ Văn phòng
17/10 14h Gặp kế toán [tên người]
mai 8h30 Khám sức khoẻ
thứ 2 cả ngày Công tác Hà Nội [Chung]"></textarea>
          <button type="button" class="dong nut-dong xanh" id="nn-tach">Tách thành các dòng bên dưới ↓</button>
        </div>
        <p class="chu-thich">Hiểu được: ngày (16/10, mai, thứ 2…), giờ (9h, 9:30, 2h chiều, 9h-11h), “cả ngày”, “@ địa điểm”, [tên hoặc chức vụ người nhận] / [Chung]. Dán từ Excel cũng được.</p>

        <p class="nhom-ten">Áp dụng cho tất cả</p>
        <div class="nhom chon-lich" role="radiogroup" aria-label="Lịch của (mặc định)">${chipLich('lichChung', macDinh)}</div>
        <div class="nhom"><label class="dong"><span>Cảnh báo</span><select name="nhacChung">${luaChonNhac(false, 15)}</select></label></div>

        <p class="nhom-ten">Cách 2 · Điền từng dòng <span id="nn-dem"></span></p>
        <div id="nn-ds"></div>
        <button type="button" class="nut-them-dong" id="nn-them">+ Thêm dòng</button>
        <p class="loi" role="alert"></p>
      </div></form>`);
    const f = $('#form-nhieu', sh), ds = $('#nn-ds', f), loi = $('.loi', f);
    const danhSo = () => {
      const n = $$('.dong-nhap', ds).length, co = $$('.dong-nhap', ds).filter(d => $('[name=tieuDe]', d).value.trim()).length;
      $$('.dn-so', ds).forEach((s, i) => { s.textContent = i + 1; });
      $('#nn-dem', f).textContent = n ? `(${co}/${n} dòng có tiêu đề)` : '';
      $('#nn-luu', f).textContent = co ? `Lưu ${co}` : 'Lưu';
    };
    const them = (ds2, thay) => {
      if (thay) ds.innerHTML = '';
      ds.insertAdjacentHTML('beforeend', ds2.map((o, i) => dongNhap(o, i)).join(''));
      danhSo();
    };
    them([trong(), trong(), trong()]);

    $('#nn-tach', f).onclick = () => {
      const kq = tachDanhSach($('#nn-dan', f).value, ngay0);
      if (!kq.length) { toast('Chưa đọc được dòng nào. Mỗi dòng cần có tiêu đề.'); return; }
      const coSan = $$('.dong-nhap', ds).filter(d => $('[name=tieuDe]', d).value.trim()).length;
      them(kq, !coSan);
      $('#nn-dan', f).value = '';
      toast(`Đã tách được ${kq.length} lịch. Kiểm tra lại rồi bấm Lưu.`, 3500);
      ds.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    $('#nn-them', f).onclick = () => {
      const cuoi = $$('.dong-nhap', ds).pop();
      them([Object.assign(trong(), cuoi ? { ngay: $('[name=ngay]', cuoi).value || ngay0 } : {})]);
      const moi = $$('.dong-nhap', ds).pop();
      $('[name=tieuDe]', moi).focus();
    };
    ds.addEventListener('click', e => {
      const x = e.target.closest('.dn-xoa');
      if (x) { x.closest('.dong-nhap').remove(); danhSo(); }
      const i = e.target.closest('input[type=date], input[type=time]');
      if (i) { try { i.showPicker(); } catch (err) { /* trình duyệt tự mở */ } }
    });
    ds.addEventListener('input', e => { if (e.target.name === 'tieuDe') { e.target.closest('.dong-nhap').classList.remove('loi-dong'); danhSo(); } });
    ds.addEventListener('change', e => {
      const d = e.target.closest('.dong-nhap');
      if (e.target.name === 'caNgay') d.classList.toggle('ca-ngay', e.target.checked);
      if (e.target.name === 'tu' && e.target.value) {
        const den = $('[name=den]', d);
        if (!den.value || den.value <= e.target.value) den.value = chuoiTuPhut(phutCua(`2000-01-01T${e.target.value}`) + 60).slice(11);
        $('[name=caNgay]', d).checked = false; d.classList.remove('ca-ngay');
      }
    });

    f.addEventListener('submit', async e => {
      e.preventDefault();
      loi.textContent = '';
      const lichChung = (f.querySelector('input[name=lichChung]:checked') || {}).value || lichMacDinh(), nhac = Number(f.elements.nhacChung.value);
      const ra = [];
      let sai = null;
      $$('.dong-nhap', ds).forEach(d => {
        d.classList.remove('loi-dong');
        const g = n => $(`[name=${n}]`, d), tieuDe = g('tieuDe').value.trim();
        if (!tieuDe) return;
        const ngay = g('ngay').value, caNgay = g('caNgay').checked || !g('tu').value;
        let tu = g('tu').value, den = g('den').value;
        if (!caNgay && (!den || den < tu)) den = tu;
        if (!ngay) { d.classList.add('loi-dong'); sai = sai || d; return; }
        ra.push({
          tieuDe, diaDiem: g('diaDiem').value.trim(), caNgay, lap: '', lapDen: '', ghiChu: '',
          bd: `${ngay}T${caNgay ? '00:00' : tu}`, kt: `${ngay}T${caNgay ? '23:59' : den}`,
          lich: g('lich').value || lichChung,
          nhac: caNgay ? (nhac < 0 ? -1 : 0) : nhac
        });
      });
      if (sai) { loi.textContent = 'Có dòng chưa chọn ngày (viền đỏ)'; sai.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      if (!ra.length) { loi.textContent = 'Chưa có dòng nào có tiêu đề'; return; }
      const nut = $('#nn-luu', f);
      nut.disabled = true;
      try {
        const r = await api('luuNhieuLich', { ds: ra });
        S.lich.push(...r.ds); S.verLich = r.verLich;
        kho.set('lichMacDinh', lichChung);
        luuCache(); dongSheet(); veLai();
        toast(`Đã thêm ${r.ds.length} lịch ✓`);
      } catch (err) { loi.textContent = err.message; nut.disabled = false; }
    });
  }

  /* ===================== TIN NHẮN ===================== */
  // Kênh: 'nhom' (nhóm chung) hoặc 'dm:<id1>:<id2>' (nhắn riêng, 2 id xếp theo thứ tự)
  const kenhRieng = (a, b) => 'dm:' + [a, b].sort().join(':');
  const nguoiKia = kenh => kenh.slice(3).split(':').find(x => x !== S.toi);
  const tenKenh = kenh => kenh === 'nhom' ? 'Nhóm chung' : tenNguoi(nguoiKia(kenh));
  const dsKenh = () => S.admin || !nguoi(S.toi) ? [] : ['nhom', ...thanhVien().filter(u => u.id !== S.toi).map(u => kenhRieng(S.toi, u.id))];
  const dangXemChat = () => S.tab === 'chat' && !!S.kenh && document.visibilityState === 'visible' && !$('#man-chinh').hidden;
  const docCua = (kenh, uid) => ((S.daDoc[kenh] || {})[uid]) || 0;
  const soChuaDocKenh = kenh => S.tin.filter(t => t.kenh === kenh && t.tu !== S.toi && t.id > docCua(kenh, S.toi)).length;
  const soChuaDoc = () => dsKenh().reduce((n, k) => n + soChuaDocKenh(k), 0);

  function gopDaDoc(moi) {
    const r = JSON.parse(JSON.stringify(S.daDoc || {}));
    for (const k in moi || {}) {
      r[k] = r[k] || {};
      for (const u in moi[k]) r[k][u] = Math.max(Number(moi[k][u]) || 0, Number(r[k][u]) || 0);
    }
    return r;
  }

  function themTin(ds) {
    if (!ds || !ds.length) return;
    const co = new Set(S.tin.map(t => t.id));
    for (const t of ds) {
      if (co.has(t.id)) continue;
      t.kenh = t.kenh || 'nhom';
      S.tin.push(t); co.add(t.id);
      if (t.tu === S.toi) S.choGui = S.choGui.filter(c => !(c.dangGui && c.kenh === t.kenh && c.nd === t.nd && c.lichId === (t.lichId || '')));
      S.tinCuoi = Math.max(S.tinCuoi, t.id);
    }
    S.tin.sort((a, b) => a.id - b.id);
    if (S.tin.length > 1500) S.tin = S.tin.slice(-1500);
  }

  function noiDungTin(t) {
    let html = t.nd ? linkHoa(t.nd) : '';
    if (t.lichId) {
      const ev = S.lich.find(x => x.id === t.lichId);
      const the = ev
        ? `<button type="button" class="the-lich" data-ev="${esc(ev.id)}"><i class="vach-mau" style="background:${mauLich(ev.lich)}"></i><span><b>${esc(ev.tieuDe)}</b><small>${ev.caNgay ? 'Cả ngày' : ev.bd.slice(11)} · ${ngayNgan(ev.bd.slice(0, 10))}${ev.lap ? ' · ' + LAP[ev.lap].toLowerCase() : ''}</small></span></button>`
        : '<span class="the-lich"><span><b>📅 Sự kiện đã bị xoá</b></span></span>';
      html += (html ? '\n' : '') + the;
    }
    return html;
  }

  function avaKenh(kenh, to) {
    if (kenh === 'nhom') return `<i class="ava ava-nhom${to ? ' to' : ''}" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.6-5.5 6.5-5.5s5.5 2 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16 14.6c2.6-.3 4.8 1.4 5.6 4.4"/></svg></i>`;
    return avaHtml(nguoi(nguoiKia(kenh)), to ? 'to' : '');
  }

  // Danh sách cuộc trò chuyện (giống Zalo / Tin nhắn iPhone)
  function veDsChat() {
    const ds = dsKenh().map(k => {
      const cuoi = [...S.tin].reverse().find(t => t.kenh === k);
      return { k, cuoi, chua: soChuaDocKenh(k) };
    }).sort((a, b) => (b.cuoi ? b.cuoi.id : -1) - (a.cuoi ? a.cuoi.id : -1) || (a.k === 'nhom' ? -1 : b.k === 'nhom' ? 1 : 0));
    if (!ds.length) { $('#chat-ds').innerHTML = '<p class="trong-rong">Chưa có thành viên nào khác. Nhờ admin thêm thành viên.</p>'; return; }
    $('#chat-ds').innerHTML = ds.map(({ k, cuoi, chua }) => {
      let xem = 'Chưa có tin nhắn';
      if (cuoi) {
        const nd = cuoi.nd || (cuoi.lichId ? '📅 Đã gửi một sự kiện' : '');
        xem = (cuoi.tu === S.toi ? 'Bạn: ' : k === 'nhom' ? tenNguoi(cuoi.tu) + ': ' : '') + nd;
      }
      const u = k === 'nhom' ? null : nguoi(nguoiKia(k));
      const phu = k === 'nhom' ? `${thanhVien().length} thành viên` : (u && u.chucVu) || '';
      const gio = cuoi ? (cuoi.t.slice(0, 10) === homNay() ? cuoi.t.slice(11, 16) : `${cuoi.t.slice(8, 10)}/${cuoi.t.slice(5, 7)}`) : '';
      return `<button type="button" class="dong-chat${chua ? ' chua-doc' : ''}" data-kenh="${esc(k)}">${avaKenh(k)}
        <span class="dc-nd"><span class="dc-hang"><b>${esc(tenKenh(k))}</b><small>${esc(gio)}</small></span>
        <span class="dc-hang"><span class="dc-xem">${esc(xem)}</span>${chua ? `<i class="huy-hieu-nho">${chua}</i>` : ''}</span>
        ${!cuoi && phu ? `<small class="dc-phu">${esc(phu)}</small>` : ''}</span></button>`;
    }).join('');
  }
  $('#chat-ds').addEventListener('click', e => { const b = e.target.closest('[data-kenh]'); if (b) moKenh(b.dataset.kenh); });

  function moKenh(kenh) {
    if (!dsKenh().includes(kenh)) return;
    S.kenh = kenh;
    $('#chat-ds-khung').hidden = true; $('#chat-phong').hidden = false;
    veTrangThaiChat(); veChat(true); danhDauDaDoc(); henPoll(300);
  }
  function dongKenh() {
    S.kenh = null;
    $('#chat-phong').hidden = true; $('#chat-ds-khung').hidden = false;
    veDsChat(); henPoll(300);
  }
  $('#chat-lui').onclick = dongKenh;

  function veChat(cuonXuong) {
    if (!S.kenh) { veDsChat(); return; }
    const box = $('#ds-tin'), kenh = S.kenh;
    const gan = box.scrollHeight - box.scrollTop - box.clientHeight < 120;
    const ds = S.tin.filter(t => t.kenh === kenh).concat(S.choGui.filter(c => c.kenh === kenh));
    if (!ds.length) { box.innerHTML = `<p class="trong-rong">Chưa có tin nhắn nào.<br>Gửi lời chào ${kenh === 'nhom' ? 'cả nhóm' : esc(tenKenh(kenh))} nhé 👋</p>`; return; }
    const cuoiCuaToi = [...ds].reverse().find(t => t.tu === S.toi && t.id);
    let html = '', truoc = null;
    ds.forEach((t, i) => {
      const moc = !truoc || t.t.slice(0, 10) !== truoc.t.slice(0, 10) || phutCua(t.t.slice(0, 16)) - phutCua(truoc.t.slice(0, 16)) > 30;
      if (moc) html += `<div class="moc-gio"><b>${tenNgayGan(t.t.slice(0, 10)) || ngayNgan(t.t.slice(0, 10))}</b> ${t.t.slice(11, 16)}</div>`;
      const sau = ds[i + 1], cuaToi = t.tu === S.toi;
      const dauNhom = moc || !truoc || truoc.tu !== t.tu;
      const cuoi = !sau || sau.tu !== t.tu || sau.t.slice(0, 10) !== t.t.slice(0, 10) || phutCua(sau.t.slice(0, 16)) - phutCua(t.t.slice(0, 16)) > 30;
      if (kenh === 'nhom' && !cuaToi && dauNhom) html += `<div class="ten-gui" style="color:${mauLich(t.tu)}">${esc(tenNguoi(t.tu))}</div>`;
      html += `<div class="bong ${cuaToi ? 'cua-toi' : 'cua-ho'}${cuoi ? ' cuoi' : ''}${t.dangGui ? ' dang-gui' : ''}" title="${esc(t.t.slice(11, 16))}">${noiDungTin(t)}</div>`;
      if (t.loi) html += `<button type="button" class="trang-thai-tin loi-gui" data-thu-lai="${esc(t.tam)}">Không gửi được · Bấm để gửi lại</button>`;
      else if (t.dangGui && !sau) html += '<div class="trang-thai-tin">Đang gửi…</div>';
      else if (cuoiCuaToi && t.id === cuoiCuaToi.id) {
        const daXem = Object.keys(S.daDoc[kenh] || {}).filter(u => u !== S.toi && docCua(kenh, u) >= t.id);
        const chu = kenh === 'nhom'
          ? (daXem.length ? (daXem.length >= thanhVien().length - 1 ? 'Mọi người đã xem' : 'Đã xem: ' + daXem.map(tenNguoi).join(', ')) : 'Đã gửi')
          : (daXem.length ? 'Đã xem' : 'Đã gửi');
        html += `<div class="trang-thai-tin">${esc(chu)}</div>`;
      }
      truoc = t;
    });
    box.innerHTML = html;
    if (cuonXuong || gan) box.scrollTop = box.scrollHeight;
  }

  function veTrangThaiChat() {
    if (!S.kenh) return;
    const k = S.kenh;
    $('#chat-ten').textContent = tenKenh(k);
    $('#chat-ava').outerHTML = avaKenh(k).replace('<i class="ava', '<i id="chat-ava" class="ava');
    const tt = $('#chat-tt');
    if (k === 'nhom') {
      const on = thanhVien().filter(u => u.id !== S.toi && S.online[u.id] && Date.now() - S.online[u.id].t < 30000);
      tt.textContent = `${thanhVien().length} thành viên${on.length ? ` · ${on.length} đang hoạt động` : ''}`;
      tt.className = on.length ? 'on' : '';
      return;
    }
    const id = nguoiKia(k), o = S.online[id], u = nguoi(id) || {};
    if (o && Date.now() - o.t < 30000) { tt.textContent = 'Đang hoạt động'; tt.className = 'on'; }
    else if (o) { tt.textContent = 'Hoạt động ' + tuongDoi(o.t); tt.className = ''; }
    else { tt.textContent = u.chucVu || ''; tt.className = ''; }
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
    if (!dangXemChat() || !soChuaDocKenh(S.kenh)) return;
    const kenh = S.kenh, cuoi = Math.max(...S.tin.filter(t => t.kenh === kenh).map(t => t.id));
    (S.daDoc[kenh] = S.daDoc[kenh] || {})[S.toi] = cuoi;
    capNhatHuyHieu();
    api('daDoc', { kenh, id: cuoi }).catch(() => {});
  }

  async function guiTin(nd, lichId, kenh = S.kenh) {
    if (!kenh) return;
    const tam = { tam: 'x' + Date.now() + Math.random(), t: bayGio(), tu: S.toi, nd, lichId: lichId || '', kenh, dangGui: true };
    S.choGui.push(tam);
    veChat(true);
    try {
      const r = await api('guiTin', { kenh, noiDung: nd, lichId: lichId || '' });
      S.choGui = S.choGui.filter(c => c !== tam);
      themTin([r.tin]);
      (S.daDoc[kenh] = S.daDoc[kenh] || {})[S.toi] = Math.max(docCua(kenh, S.toi), r.tin.id);
      luuCache();
    } catch (e) {
      if (e.hetPhien) return;
      tam.dangGui = false; tam.loi = true;
      toast(e.message);
    }
    veChat(true);
  }

  // Từ chi tiết sự kiện: chọn gửi vào nhóm hay cho ai
  function chonKenhGui(lichId) {
    const sh = moSheet(`<div class="sheet-dau"><button type="button" data-dong>Huỷ</button><b>Gửi sự kiện cho</b><span></span></div>
      <div class="sheet-than"><div class="nhom">${dsKenh().map(k => `<button type="button" class="dong-chat" data-kenh="${esc(k)}">${avaKenh(k)}<span class="dc-nd"><b>${esc(tenKenh(k))}</b></span></button>`).join('')}</div></div>`);
    sh.addEventListener('click', e => {
      const b = e.target.closest('[data-kenh]');
      if (!b) return;
      dongSheet(); chuyenTab('chat'); moKenh(b.dataset.kenh); guiTin('', lichId, b.dataset.kenh);
    });
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
      if (t) { S.choGui = S.choGui.filter(c => c !== t); guiTin(t.nd, t.lichId, t.kenh); }
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

  /* ===================== QUẢN LÝ THÀNH VIÊN (ADMIN) ===================== */
  const CHUC_VU_GOI_Y = ['Sếp', 'Trợ lý', 'Thư ký', 'Quản lý', 'Kế toán', 'Nhân viên'];
  function taoMatKhau() {
    const chu = 'abcdefghjkmnpqrstuvwxyz23456789', b = new Uint8Array(8);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(b) : b.forEach((_, i) => { b[i] = Math.random() * 256; });
    return [...b].map(x => chu[x % chu.length]).join('');
  }
  function goiYTenDN(ten) {
    const tu = boDau(ten).replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (!tu.length) return '';
    return (tu[tu.length - 1] + (tu.length > 1 ? '.' + tu.slice(0, -1).map(x => x[0]).join('') : '')).slice(0, 30);
  }

  async function veThanhVien() {
    if (!S.admin) return;
    const k = $('#khung-tv');
    if (!S.dsTv) k.innerHTML = '<p class="trong-rong">Đang tải…</p>';
    try { S.dsTv = (await api('dsThanhVien')).ds; } catch (e) { k.innerHTML = `<p class="trong-rong">${esc(e.message)}</p>`; return; }
    const ds = S.dsTv;
    k.innerHTML = `<p class="chu-thich" style="margin:4px 16px 10px">${ds.length ? `${ds.length} thành viên. Bấm vào một người để sửa, đặt lại mật khẩu, khoá hoặc xoá.` : 'Chưa có thành viên nào. Bấm “Thêm thành viên” để tạo tài khoản đầu tiên.'}</p>
      ${ds.length ? `<div class="nhom">${ds.map(u => `<button type="button" class="dong nut-dong the-tv" data-tv="${esc(u.id)}">
        ${avaHtml(u)}
        <span class="tv-nd"><b>${esc(u.ten)}</b><small>${esc(u.chucVu || 'Thành viên')} · ${esc(u.tenDangNhap)}${u.khoa ? ' · <em class="do">Đã khoá</em>' : ''}</small></span>
        <i class="mui">›</i></button>`).join('')}</div>` : ''}
      <button type="button" class="nut-chinh" id="tv-them">+ Thêm thành viên</button>`;
    $('#tv-them').onclick = () => moFormTv(null);
  }
  $('#khung-tv').addEventListener('click', e => { const b = e.target.closest('[data-tv]'); if (b) moFormTv((S.dsTv || []).find(u => u.id === b.dataset.tv)); });
  $('#nut-them-tv').onclick = () => moFormTv(null);

  function moFormTv(u) {
    const moi = !u;
    const mauDung = new Set((S.dsTv || []).map(x => x.mau));
    const mau = u ? u.mau : (MAU_TV.find(m => !mauDung.has(m)) || MAU_TV[0]);
    const sh = moSheet(`<form id="form-tv" novalidate autocomplete="off">
      <div class="sheet-dau"><button type="button" data-dong>Huỷ</button><b>${moi ? 'Thêm thành viên' : 'Sửa thành viên'}</b><button type="submit">${moi ? 'Tạo' : 'Lưu'}</button></div>
      <div class="sheet-than">
        <div class="nhom">
          <label class="dong"><span>Họ tên</span><input name="ten" maxlength="40" value="${esc(u ? u.ten : '')}" placeholder="VD: Nguyễn Văn An" required></label>
          <label class="dong"><span>Chức vụ</span><input name="chucVu" maxlength="30" value="${esc(u ? u.chucVu : '')}" placeholder="VD: Trợ lý" list="goi-y-chuc-vu"></label>
        </div>
        <datalist id="goi-y-chuc-vu">${CHUC_VU_GOI_Y.map(c => `<option value="${c}">`).join('')}</datalist>
        ${moi ? `<p class="nhom-ten">Thông tin đăng nhập</p>
        <div class="nhom">
          <label class="dong"><span>Tên đăng nhập</span><input name="tenDangNhap" maxlength="30" placeholder="VD: an.nv" autocapitalize="none" autocorrect="off" spellcheck="false" required></label>
          <label class="dong"><span>Mật khẩu</span><input name="matKhau" value="${taoMatKhau()}" minlength="6" required autocapitalize="none" autocorrect="off" spellcheck="false"></label>
          <button type="button" class="dong nut-dong xanh" id="tv-tao-mk">Tạo mật khẩu khác</button>
        </div>
        <p class="chu-thich">Tên đăng nhập: chữ không dấu, số, dấu chấm. Mật khẩu ít nhất 6 ký tự – thành viên có thể tự đổi sau.</p>`
        : `<div class="nhom"><div class="dong"><span>Tên đăng nhập</span><span class="gia-tri">${esc(u.tenDangNhap)}</span></div></div>`}
        <p class="nhom-ten">Màu lịch</p>
        <div class="nhom chon-mau" role="radiogroup" aria-label="Màu lịch">${MAU_TV.map(m => `<label><input type="radio" name="mau" value="${m}"${m === mau ? ' checked' : ''}><i style="background:${m}"></i></label>`).join('')}</div>
        ${moi ? '' : `<div class="nhom">
          <button type="button" class="dong nut-dong xanh" id="tv-doi-anh">Đổi ảnh đại diện</button>
          <button type="button" class="dong nut-dong xanh" id="tv-dat-mk">Đặt lại mật khẩu</button>
          <button type="button" class="dong nut-dong xanh" id="tv-khoa">${u.khoa ? 'Mở khoá tài khoản' : 'Khoá tài khoản'}</button>
          <button type="button" class="dong nut-dong nut-xoa" id="tv-xoa">Xoá thành viên</button>
        </div>
        <p class="chu-thich">Khoá: người này không đăng nhập được nữa (mở khoá lại được). Xoá: tài khoản bị gỡ hẳn, lịch đã giao cho họ vẫn được giữ.</p>`}
        <p class="loi" role="alert"></p>
      </div></form>`);
    const f = $('#form-tv', sh), loi = $('.loi', f);
    if (moi) {
      let tuSua = false;
      f.elements.tenDangNhap.addEventListener('input', () => { tuSua = true; });
      f.elements.ten.addEventListener('input', () => { if (!tuSua) f.elements.tenDangNhap.value = goiYTenDN(f.elements.ten.value); });
      $('#tv-tao-mk', f).onclick = () => { f.elements.matKhau.value = taoMatKhau(); };
      setTimeout(() => f.elements.ten.focus(), 320);
    } else {
      $('#tv-doi-anh', f).onclick = () => moDoiAnh(u, () => veThanhVien());
      $('#tv-dat-mk', f).onclick = async () => {
        const mk = taoMatKhau();
        if (!confirm(`Đặt lại mật khẩu cho ${u.ten}?\nMật khẩu mới: ${mk}\n(${u.ten} sẽ bị đăng xuất khỏi mọi máy)`)) return;
        try { await api('datLaiMatKhau', { id: u.id, matKhau: mk }); moThongTinTk(u.ten, u.tenDangNhap, mk, 'Đã đặt lại mật khẩu'); }
        catch (err) { loi.textContent = err.message; }
      };
      $('#tv-khoa', f).onclick = async () => {
        if (!u.khoa && !confirm(`Khoá tài khoản của ${u.ten}? Người này sẽ bị đăng xuất và không đăng nhập được nữa.`)) return;
        try { await api('khoaThanhVien', { id: u.id, khoa: !u.khoa }); dongSheet(); toast(u.khoa ? 'Đã mở khoá' : 'Đã khoá tài khoản'); veThanhVien(); henPoll(0); }
        catch (err) { loi.textContent = err.message; }
      };
      $('#tv-xoa', f).onclick = async () => {
        if (!confirm(`Xoá thành viên ${u.ten}? Không hoàn tác được.\nLịch đã giao cho ${u.ten} vẫn được giữ lại.`)) return;
        try { await api('xoaThanhVien', { id: u.id }); dongSheet(); toast('Đã xoá thành viên'); veThanhVien(); henPoll(0); }
        catch (err) { loi.textContent = err.message; }
      };
    }
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const g = n => (f.elements[n] ? f.elements[n].value.trim() : '');
      const d = { ten: g('ten'), chucVu: g('chucVu'), mau: (f.querySelector('input[name=mau]:checked') || {}).value };
      if (!d.ten) { loi.textContent = 'Chưa nhập họ tên'; return; }
      const nut = $('button[type=submit]', f);
      nut.disabled = true; loi.textContent = '';
      try {
        if (moi) {
          d.tenDangNhap = g('tenDangNhap').toLowerCase(); d.matKhau = g('matKhau');
          await api('taoThanhVien', d);
          moThongTinTk(d.ten, d.tenDangNhap, d.matKhau, 'Đã tạo tài khoản');
        } else {
          await api('suaThanhVien', Object.assign(d, { id: u.id }));
          dongSheet(); toast('Đã lưu');
        }
        veThanhVien(); henPoll(0);
      } catch (err) { loi.textContent = err.message; nut.disabled = false; }
    });
  }

  // Sau khi tạo / đặt lại mật khẩu: hiện thông tin để admin gửi cho thành viên (Zalo, tin nhắn…)
  function moThongTinTk(ten, tenDN, mk, tieuDe) {
    const link = location.origin + '/';
    const chu = `Tài khoản Lịch làm việc của ${ten}\nĐăng nhập: ${link}\nTên đăng nhập: ${tenDN}\nMật khẩu: ${mk}\n(Vào Cài đặt để đổi mật khẩu sau khi đăng nhập)`;
    const sh = moSheet(`<div class="sheet-dau"><span></span><b>${esc(tieuDe)}</b><button type="button" data-dong>Xong</button></div>
      <div class="sheet-than">
        <p class="chu-thich" style="margin:6px 4px 12px">Gửi thông tin này cho ${esc(ten)} (qua Zalo hoặc nhắn riêng):</p>
        <div class="nhom">
          <div class="dong"><span>Trang đăng nhập</span><span class="gia-tri">${esc(link.replace(/^https?:\/\//, ''))}</span></div>
          <div class="dong"><span>Tên đăng nhập</span><b class="gia-tri chu-ma">${esc(tenDN)}</b></div>
          <div class="dong"><span>Mật khẩu</span><b class="gia-tri chu-ma">${esc(mk)}</b></div>
        </div>
        <button type="button" class="nut-chinh" id="tk-chep">Sao chép để gửi</button>
      </div>`);
    $('#tk-chep', sh).onclick = async () => {
      try { await navigator.clipboard.writeText(chu); toast('Đã sao chép. Dán vào Zalo để gửi.'); }
      catch (e) { prompt('Sao chép nội dung này:', chu); }
    };
  }

  /* ===================== ĐỒNG BỘ ĐỊNH KỲ ===================== */
  let hPoll = 0, dangPoll = false, loiLienTiep = 0;
  function henPoll(ms) { clearTimeout(hPoll); hPoll = setTimeout(poll, ms); }
  async function poll() {
    if (!S.token || document.visibilityState !== 'visible') return;
    if (dangPoll) return henPoll(800);
    dangPoll = true;
    try {
      const r = await api('poll', { verLich: S.verLich, verNguoi: S.verNguoi, tinCuoi: S.tinCuoi, kenhMo: dangXemChat() ? S.kenh : '' });
      let doiLich = false, doiTin = false, doiNguoi = false;
      if (r.nguoi) { S.nguoi = r.nguoi; S.verNguoi = r.verNguoi; doiNguoi = true; }
      if (r.lich) { S.lich = r.lich; S.verLich = r.verLich; doiLich = true; }
      if (r.tin && r.tin.length) { themTin(r.tin); doiTin = true; }
      const docCu = JSON.stringify(S.daDoc);
      S.daDoc = gopDaDoc(r.daDoc || {});
      S.online = r.online || {};
      const me = nguoi(S.toi);
      if (doiNguoi && !S.admin && (!me || me.khoa || me.daXoa)) { dangPoll = false; return hetPhien(); }
      if (doiNguoi && S.kenh && !dsKenh().includes(S.kenh)) dongKenh();
      if (doiLich || doiNguoi) { veThang(); veDsNgay(); if (S.xem === 'nam') veNam(); }
      if (doiNguoi) { veToi(); if (S.tab === 'thanhvien') veThanhVien(); }
      if (doiTin || doiLich || doiNguoi || docCu !== JSON.stringify(S.daDoc)) veChat(doiTin && dangXemChat());
      veTrangThaiChat(); capNhatHuyHieu(); danhDauDaDoc();
      if (doiLich || doiTin || doiNguoi) luuCache();
      loiLienTiep = 0; $('#mat-mang').hidden = true;
    } catch (e) {
      if (e.hetPhien) { dangPoll = false; return; }
      if (++loiLienTiep >= 2) $('#mat-mang').hidden = false;
    }
    dangPoll = false;
    henPoll(luongMo() ? 25000 : dangXemChat() ? 3000 : loiLienTiep ? 15000 : 10000);
  }

  /* Kênh tức thì (máy chủ VPS): có tin nhắn / lịch mới thì máy chủ báo ngay, app tải lại liền */
  let luong = null;
  const luongMo = () => !!luong && luong.readyState === 1;
  function moLuong() {
    if (DEMO || luong || !S.token || !window.EventSource || !API.startsWith('/') || document.visibilityState !== 'visible') return;
    luong = new EventSource(API + '/luong?token=' + encodeURIComponent(S.token));
    luong.onmessage = () => henPoll(0);
    luong.onopen = () => henPoll(0);
    luong.onerror = () => { if (luong && luong.readyState === 2) { luong = null; setTimeout(moLuong, 5000); } };
  }
  function dongLuong() { if (luong) { luong.close(); luong = null; } }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') dongLuong();
    else if (S.token) moLuong();
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
  const hoTroTB = () => 'serviceWorker' in navigator && (DEMO || 'PushManager' in window) && 'Notification' in window;

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
    const u = nguoi(S.toi) || {};
    $('#toi-ten').textContent = u.ten || '';
    $('#toi-vai').textContent = S.admin ? 'Admin – quản lý thành viên' : (u.chucVu || 'Thành viên');
    $('#toi-ava').outerHTML = avaHtml(u, 'to', 'toi-ava');
    $('#nut-doi-anh-2').textContent = u.anh || u.anhUrl ? 'Đổi ảnh đại diện' : 'Thêm ảnh đại diện';
    veGiaoDien();
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
    if (DEMO) sub = kho.get('demoTb', false);
    else try { sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription(); } catch (e) { /* bỏ qua */ }
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
      if (DEMO) { kho.del('demoTb'); toast('Đã tắt thông báo trên máy này'); return veThongBao(); }
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
      if (DEMO) { kho.set('demoTb', true); toast('Đã bật thông báo ✓'); return veThongBao(); }
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
    if (DEMO || !hoTroTB() || Notification.permission !== 'granted') return;
    const dk = kho.get('dkTb', null);
    if (dk && dk.v === S.toi && Date.now() - dk.t < 3 * 864e5) return;
    try {
      const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
      if (!sub) return;
      await api('dangKyThongBao', { sub: sub.toJSON(), tenMay: tenMay() });
      kho.set('dkTb', { t: Date.now(), v: S.toi });
    } catch (e) { /* thử lại lần sau */ }
  }

  /* ---- Ảnh đại diện ---- */
  // Cắt vuông ở giữa, thu nhỏ còn 320×320 JPEG (~30 KB) ngay trên máy rồi mới gửi lên
  async function thuNhoAnh(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((ok, loi) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => loi(new Error('Không đọc được ảnh này, hãy chọn ảnh khác')); i.src = url; });
      const c = Math.min(img.naturalWidth, img.naturalHeight), N = 320, cv = document.createElement('canvas');
      cv.width = cv.height = N;
      const g = cv.getContext('2d');
      g.fillStyle = '#fff'; g.fillRect(0, 0, N, N);
      g.drawImage(img, (img.naturalWidth - c) / 2, (img.naturalHeight - c) / 2, c, c, 0, 0, N, N);
      return cv.toDataURL('image/jpeg', 0.85);
    } finally { URL.revokeObjectURL(url); }
  }

  // u: người cần đổi ảnh (chính mình, hoặc thành viên nếu là admin); xong gọi sauKhi()
  function moDoiAnh(u, sauKhi) {
    u = u || nguoi(S.toi) || {};
    const laToi = u.id === S.toi, coAnh = !!anhCua(u);
    const sh = moSheet(`<div class="sheet-dau"><button type="button" data-dong>Đóng</button><b>Ảnh đại diện</b><span></span></div>
      <div class="sheet-than">
        <div id="anh-xem">${avaHtml(u, 'rat-to')}</div>
        <div class="nhom">
          <button type="button" class="dong nut-dong xanh" id="anh-chon">${coAnh ? 'Chọn ảnh khác' : 'Chọn ảnh hoặc chụp ảnh'}</button>
          ${coAnh ? '<button type="button" class="dong nut-dong nut-xoa" id="anh-xoa">Xoá ảnh, dùng chữ cái đầu</button>' : ''}
        </div>
        <p class="chu-thich">${laToi ? 'Ảnh hiện với mọi người trong tin nhắn và danh sách thành viên.' : `Đổi ảnh đại diện của ${esc(u.ten)}.`} Ảnh sẽ được cắt vuông ở giữa.</p>
        <p class="loi" role="alert"></p>
      </div>`);
    const loi = $('.loi', sh), oChon = $('#chon-anh');
    const gui = async anh => {
      loi.textContent = '';
      try {
        const r = await api('doiAnh', { id: u.id, anh });
        S.nguoi = r.nguoi; S.verNguoi = r.verNguoi; luuCache();
        dongSheet(); veLai(); if (sauKhi) sauKhi();
        toast(anh ? 'Đã đổi ảnh đại diện' : 'Đã xoá ảnh đại diện');
      } catch (err) { loi.textContent = err.message; }
    };
    $('#anh-chon', sh).onclick = () => {
      oChon.value = '';
      oChon.onchange = async () => {
        const f = oChon.files && oChon.files[0];
        if (!f) return;
        try {
          const anh = await thuNhoAnh(f);
          $('#anh-xem', sh).innerHTML = `<i class="ava rat-to"><img src="${anh}" alt=""></i>`;
          $('#anh-chon', sh).disabled = true; $('#anh-chon', sh).textContent = 'Đang lưu…';
          await gui(anh);
        } catch (err) { loi.textContent = err.message; }
      };
      oChon.click();
    };
    if ($('#anh-xoa', sh)) $('#anh-xoa', sh).onclick = () => gui('');
  }
  $('#nut-doi-anh').onclick = () => moDoiAnh();
  $('#nut-doi-anh-2').onclick = () => moDoiAnh();

  /* ---- Giao diện: sáng / tối + màu nền (lưu trên máy này) ---- */
  const MAU_NEN = [['', 'Mặc định', '#ffffff'], ['kem', 'Kem', '#f7eedb'], ['xanh', 'Xanh dương', '#dfeafa'], ['la', 'Xanh lá', '#dcf1e3'],
    ['hong', 'Hồng', '#f9e0e8'], ['tim', 'Tím', '#e7e0f8'], ['xam', 'Xám', '#e3e3e8']];
  function apDungGiaoDien() {
    const g = kho.get('giaoDien', {}), r = document.documentElement;
    g.che ? r.setAttribute('data-theme', g.che) : r.removeAttribute('data-theme');
    g.nen ? r.setAttribute('data-nen', g.nen) : r.removeAttribute('data-nen');
    // thanh trạng thái điện thoại cùng màu với nền
    const mau = getComputedStyle(r).getPropertyValue('--nen').trim();
    $$('meta[name="theme-color"]').forEach(m => {
      if (!m.dataset.goc) m.dataset.goc = m.getAttribute('content');
      m.setAttribute('content', g.che || g.nen ? mau : m.dataset.goc);
    });
  }
  function veGiaoDien() {
    const g = kho.get('giaoDien', {});
    const che = document.querySelector(`input[name=cheDo][value="${g.che || ''}"]`);
    if (che) che.checked = true;
    $('#chon-nen').innerHTML = MAU_NEN.map(([k, ten, mau]) => `<label><input type="radio" name="mauNen" value="${k}"${(g.nen || '') === k ? ' checked' : ''}><i style="background:${mau}"></i><span>${ten}</span></label>`).join('');
  }
  $('#tab-toi').addEventListener('change', e => {
    if (e.target.name !== 'cheDo' && e.target.name !== 'mauNen') return;
    const g = kho.get('giaoDien', {});
    if (e.target.name === 'cheDo') g.che = e.target.value; else g.nen = e.target.value;
    kho.set('giaoDien', g);
    apDungGiaoDien();
  });
  apDungGiaoDien();

  $('#nut-doi-ten').onclick = () => {
    const sh = moSheet(`<form><div class="sheet-dau"><button type="button" data-dong>Huỷ</button><b>Đổi tên hiển thị</b><button type="submit">Lưu</button></div>
      <div class="sheet-than"><div class="nhom"><label class="dong cot"><input name="ten" maxlength="40" value="${esc(tenNguoi(S.toi))}" aria-label="Tên hiển thị" required></label></div>
      <p class="chu-thich">Tên này hiện với mọi người trong lịch, tin nhắn và thông báo.</p><p class="loi" role="alert"></p></div></form>`);
    $('form', sh).addEventListener('submit', async e => {
      e.preventDefault();
      try { const r = await api('doiTen', { ten: e.target.elements.ten.value }); S.nguoi = r.nguoi; S.verNguoi = r.verNguoi; luuCache(); veLai(); dongSheet(); toast('Đã đổi tên'); }
      catch (err) { $('.loi', sh).textContent = err.message; }
    });
  };

  $('#nut-doi-mk').onclick = () => {
    const sh = moSheet(`<form><div class="sheet-dau"><button type="button" data-dong>Huỷ</button><b>Đổi mật khẩu</b><button type="submit">Lưu</button></div>
      <div class="sheet-than"><div class="nhom">
        <label class="dong"><span>Hiện tại</span><input name="cu" type="password" autocomplete="current-password" required></label>
        <label class="dong"><span>Mới</span><input name="moi" type="password" autocomplete="new-password" minlength="6" required placeholder="Ít nhất 6 ký tự"></label>
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
    clearTimeout(hPoll); dongLuong();
    S.token = null; S.toi = null; S.admin = false; S.nguoi = []; S.dsTv = null; S.kenh = null;
    S.tin = []; S.choGui = []; S.lich = []; S.tinCuoi = 0; S.daDoc = {};
    kho.del('token'); kho.del('cache2'); kho.del('dkTb');
    $('#chat-phong').hidden = true; $('#chat-ds-khung').hidden = false;
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

  /* ===================== BẢN DEMO ===================== */
  if (DEMO) {
    const goiY = document.createElement('p');
    goiY.className = 'chu-thich giua';
    goiY.innerHTML = 'Bản demo – tên đăng nhập: <b>sep</b>, <b>troly</b>, <b>minh</b> hoặc <b>admin</b>; mật khẩu gõ gì cũng được.';
    $('#form-dangnhap').append(goiY);
    const thanh = document.createElement('div');
    thanh.className = 'thanh-demo';
    thanh.innerHTML = '<span>Bản demo · đang xem: <b id="demo-vai"></b></span><button type="button" id="demo-doi">Đổi người ⇄</button><button type="button" id="demo-lai">Làm lại</button>';
    $('#man-chinh').insertBefore(thanh, $('.tabbar'));
    const capNhatVai = () => { $('#demo-vai').textContent = S.admin ? 'Admin' : tenNguoi(S.toi); };
    new MutationObserver(capNhatVai).observe($('#toi-vai'), { childList: true });
    $('#demo-doi').onclick = async () => {
      const ds = DEMO.dsDangNhap(), i = ds.indexOf(DEMO.tenDangNhapCua(S.toi)), tenDN = ds[(i + 1) % ds.length];
      S.token = DEMO.tokenCua(tenDN); kho.set('token', S.token); kho.del('cache2');
      Object.assign(S, { tin: [], choGui: [], tinCuoi: 0, daDoc: {}, kenh: null, dsTv: null, tab: 'lich' });
      $('#chat-phong').hidden = true; $('#chat-ds-khung').hidden = false;
      await khoiDong(); chuyenTab('lich'); capNhatVai();
      toast('Đang xem với: ' + (S.admin ? 'Admin' : tenNguoi(S.toi)));
    };
    $('#demo-lai').onclick = () => {
      if (!confirm('Xoá dữ liệu demo và bắt đầu lại?')) return;
      DEMO.datLai(); kho.del('cache2'); location.reload();
    };
  }

  S.homNayCu = homNay();
  khoiDong();
})();
