/* Vận động cùng bé – popup nhỏ bên phải trang Đo chỉ số cho bé (do-chi-so-cho-be.html).
   Dữ liệu: js/van-dong-du-lieu.js (VAN_DONG, BAI_TAP). Ảnh 2 tư thế: img/tap/<id>-<nhân vật>-<0|1>.webp.
   Mỗi ngày 1 bộ bài theo tuổi (khởi động + bài chính + thả lỏng), xáo theo tuần → cả tuần mỗi ngày một bộ, mọi máy thấy cùng lịch.
   Tuổi / giới tính lấy từ số đo đã lưu (localStorage hck_suckhoe), không gửi đi đâu, không đụng cách tính của suc-khoe.js. */
(function () {
  'use strict';
  var TUOI = [['0-6m', '0–6 tháng'], ['6-12m', '6–12 tháng'], ['1-3y', '1–3 tuổi'], ['3-6y', '3–6 tuổi'], ['6-12y', '6–12 tuổi'], ['12-18y', '12–18 tuổi']];
  var LOAI = { khoi: 'Khởi động', chinh: 'Bài chính', tha: 'Thả lỏng' };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var doc = function (k, md) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? md : v; } catch (e) { return md; } };
  var ghi = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* trình duyệt chặn lưu */ } };

  /* ---- Lịch theo tuần (cùng cách xếp với bản thiết kế gốc) ---- */
  var homNay = function () { return new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10); };
  var congNgay = function (ngay, n) { return new Date(Date.parse(ngay + 'T12:00:00+07:00') + n * 864e5 + 7 * 36e5).toISOString().slice(0, 10); };
  var thuTrongTuan = function (ngay) { return (new Date(ngay + 'T12:00:00+07:00').getUTCDay() + 6) % 7; };
  function hat(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function xao(ds, seed) {
    var a = ds.slice(), r = function () { seed = (seed + 0x6D2B79F5) >>> 0; var t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  var cauHinh = function () { var c = window.VAN_DONG || {}; return { soKhoi: c.soKhoi || 1, soChinh: c.soChinh || 2, soTha: c.soTha || 1, nghiGiay: c.nghiGiay || 10 }; };
  function baiNgay(k, ngay) {
    var c = cauHinh(), thu = thuTrongTuan(ngay), tuan = congNgay(ngay, -thu), ds = (window.BAI_TAP || []).filter(function (b) { return (b.ages || []).indexOf(k) > -1; }), out = [];
    [['khoi', c.soKhoi], ['chinh', c.soChinh], ['tha', c.soTha]].forEach(function (x) {
      var nhom = xao(ds.filter(function (b) { return b.loai === x[0]; }), hat(tuan + ':' + k + ':' + x[0]));
      for (var i = 0; i < Math.min(x[1], nhom.length); i++) out.push(nhom[(thu * x[1] + i) % nhom.length]);
    });
    return out.length ? out : ds.slice(0, 4);
  }
  var nhanVat = function (k, gai) { return k === '0-6m' || k === '6-12m' ? 'emBe' : (k === '1-3y' ? 'chap' : k === '12-18y' ? 'teen' : 'be') + (gai ? 'Gai' : 'Trai'); };
  var anh = function (b, nv, i) { return 'img/tap/' + b.id + '-' + nv + '-' + i + '.webp'; };

  /* ---- Tuổi từ số đo đã lưu ---- */
  function macDinh() {
    var hs = doc('hck_suckhoe', null) || {}, luu = doc('hck_vandong', {}) || {};
    var tuoi = luu.tuoi, gai = luu.gai;
    if (!tuoi && hs.dob) {
      var p = String(hs.dob).split('-').map(Number), a = new Date(p[0], (p[1] || 1) - 1, p[2] || 1), b = new Date();
      var m = (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth(); if (b.getDate() < a.getDate()) m--;
      if (m >= 0 && m < 228) tuoi = m < 6 ? '0-6m' : m < 12 ? '6-12m' : m < 36 ? '1-3y' : m < 72 ? '3-6y' : m < 144 ? '6-12y' : '12-18y';
    }
    if (gai == null) gai = hs.sex === 2;
    return { tuoi: tuoi || '3-6y', gai: !!gai, ten: String(hs.name || '').trim() };
  }

  var S = macDinh(), ds = [], viTri = 0, conLai = 0, hen = null, lat = null, dung = false, nghi = false;
  var nut, khung;
  function luu() { var c = doc('hck_vandong', {}) || {}; c.tuoi = S.tuoi; c.gai = S.gai; ghi('hck_vandong', c); }
  function daTapHomNay() { return (doc('hck_vandong', {}) || {}).xong === homNay() + ':' + S.tuoi; }
  function dungHen() { clearInterval(hen); clearInterval(lat); hen = lat = null; }

  function veTrangChinh() {
    dungHen(); ds = baiNgay(S.tuoi, homNay());
    var nv = nhanVat(S.tuoi, S.gai), c = cauHinh(), giay = ds.reduce(function (t, b) { return t + (b.giay || 40); }, 0) + (ds.length - 1) * c.nghiGiay;
    var emBe = S.tuoi === '0-6m' || S.tuoi === '6-12m';
    khung.querySelector('.vd-than').innerHTML =
      '<div class="vd-tuoi" role="group" aria-label="Chọn tuổi của bé">' + TUOI.map(function (t) {
        return '<button type="button" data-vd-tuoi="' + t[0] + '" class="' + (t[0] === S.tuoi ? 'is-on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      (emBe ? '' : '<div class="vd-gt"><button type="button" data-vd-gai="0" class="' + (!S.gai ? 'is-on' : '') + '">Bé trai</button><button type="button" data-vd-gai="1" class="' + (S.gai ? 'is-on' : '') + '">Bé gái</button></div>') +
      '<div class="vd-tom"><b>Bài hôm nay' + (S.ten ? ' cho bé ' + esc(S.ten) : '') + '</b><span>' + ds.length + ' động tác · khoảng ' + Math.max(1, Math.round(giay / 60)) + ' phút</span></div>' +
      (daTapHomNay() ? '<p class="vd-xong-nho">🎉 Hôm nay bé đã tập xong rồi, mai có bộ mới nhé!</p>' : '') +
      '<ol class="vd-ds">' + ds.map(function (b, i) {
        return '<li><button type="button" data-vd-bat="' + i + '"><img src="' + anh(b, nv, 0) + '" alt="" loading="lazy" width="56" height="56">' +
          '<span><b>' + esc(b.ten) + '</b><small>' + (LOAI[b.loai] || '') + ' · ' + b.giay + ' giây' + (b.boMe ? ' · bố mẹ tập cùng' : '') + '</small></span></button></li>'; }).join('') + '</ol>' +
      '<button type="button" class="vd-bd" data-vd-bat="0">▶ Bắt đầu tập</button>' +
      '<p class="vd-ghi">Luôn có người lớn bên cạnh khi bé tập. Dừng ngay nếu bé mệt hoặc không thích. Nội dung chỉ để tham khảo, không thay thế tư vấn của bác sĩ.</p>';
  }

  function veBai() {
    dungHen();
    var b = ds[viTri], nv = nhanVat(S.tuoi, S.gai), c = cauHinh();
    if (!b) return veXong();
    conLai = nghi ? c.nghiGiay : (b.giay || 40); dung = false;
    var tiep = ds[viTri + 1];
    khung.querySelector('.vd-than').innerHTML =
      '<div class="vd-tien"><span>' + (viTri + 1) + '/' + ds.length + '</span><i><u style="width:' + Math.round(viTri / ds.length * 100) + '%"></u></i></div>' +
      (nghi ? '<div class="vd-nghi"><b>Nghỉ một chút nhé</b><span>Tiếp theo: ' + esc(b.ten) + '</span></div>' : '') +
      '<div class="vd-hinh' + (nghi ? ' is-nghi' : '') + '"><img src="' + anh(b, nv, 0) + '" alt="' + esc(b.ten) + '"><img src="' + anh(b, nv, 1) + '" alt="" class="vd-hinh__2">' +
      '<div class="vd-dem" aria-live="polite"><b>' + conLai + '</b><small>giây</small></div></div>' +
      '<h4 class="vd-ten">' + esc(b.ten) + '<small>' + (LOAI[b.loai] || '') + (b.lan ? ' · ' + esc(b.lan) : '') + '</small></h4>' +
      '<ol class="vd-buoc">' + (b.buoc || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' +
      (b.loiIch ? '<p class="vd-loi">💡 ' + esc(b.loiIch) + '</p>' : '') + (b.luuY ? '<p class="vd-luu">⚠️ ' + esc(b.luuY) + '</p>' : '') +
      '<div class="vd-nut2"><button type="button" data-vd-dung>' + '⏸ Tạm dừng' + '</button><button type="button" class="is-chinh" data-vd-tiep>' + (nghi ? 'Tập luôn' : tiep ? 'Bài tiếp ▶' : 'Hoàn thành') + '</button></div>' +
      '<button type="button" class="vd-lui" data-vd-ve>‹ Danh sách bài hôm nay</button>';
    var hinh = khung.querySelector('.vd-hinh');
    lat = setInterval(function () { hinh.classList.toggle('is-lat'); }, nghi ? 1400 : 750);
    hen = setInterval(function () {
      if (dung) return;
      conLai--; var o = khung.querySelector('.vd-dem b'); if (o) o.textContent = Math.max(0, conLai);
      if (conLai <= 0) qua();
    }, 1000);
  }
  function qua() { if (nghi) { nghi = false; return veBai(); } viTri++; if (viTri >= ds.length) return veXong(); nghi = true; veBai(); }
  function veXong() {
    dungHen();
    var c = doc('hck_vandong', {}) || {}; c.xong = homNay() + ':' + S.tuoi; ghi('hck_vandong', c);
    var nv = nhanVat(S.tuoi, S.gai), b = ds[ds.length - 1];
    khung.querySelector('.vd-than').innerHTML = '<div class="vd-xong">' + (b ? '<img src="' + anh(b, nv, 1) + '" alt="" width="140" height="140">' : '') +
      '<b>Giỏi quá! Hoàn thành bài hôm nay 🎉</b><p>Mai mở lại để tập bộ động tác mới nhé. Vận động đều mỗi ngày cùng ăn đủ chất, ngủ đủ giấc giúp bé khoẻ khoắn, vui vẻ.</p>' +
      '<button type="button" class="vd-bd" data-vd-ve>Xem lại bài hôm nay</button></div>';
  }

  function mo() { khung.classList.add('is-mo'); nut.setAttribute('aria-expanded', 'true'); document.body.classList.add('vd-dang-mo'); S = macDinh(); veTrangChinh(); khung.querySelector('.vd-dong').focus(); }
  function dong() { dungHen(); khung.classList.remove('is-mo'); nut.setAttribute('aria-expanded', 'false'); document.body.classList.remove('vd-dang-mo'); nut.focus(); }

  function dung1() {
    if (!window.BAI_TAP || !window.BAI_TAP.length) return;
    var nv = nhanVat(S.tuoi, S.gai), b0 = baiNgay(S.tuoi, homNay())[0];
    nut = document.createElement('button');
    nut.type = 'button'; nut.className = 'vd-nut'; nut.setAttribute('aria-expanded', 'false'); nut.setAttribute('aria-controls', 'vdKhung');
    nut.innerHTML = '<img src="' + (b0 ? anh(b0, nv, 1) : '') + '" alt="" width="40" height="40"><span>Tập cùng bé</span>';
    khung = document.createElement('section');
    khung.id = 'vdKhung'; khung.className = 'vd-khung'; khung.setAttribute('role', 'dialog'); khung.setAttribute('aria-label', 'Vận động cùng bé');
    khung.innerHTML = '<header class="vd-dau"><span>🤸</span><div><b>Vận động cùng bé</b><small>Mỗi ngày vài phút, đúng theo tuổi</small></div><button type="button" class="vd-dong" aria-label="Đóng">✕</button></header><div class="vd-than"></div>';
    document.body.appendChild(nut); document.body.appendChild(khung);
    nut.addEventListener('click', function () { khung.classList.contains('is-mo') ? dong() : mo(); });
    khung.addEventListener('click', function (e) {
      var t = e.target.closest('button'); if (!t) return;
      if (t.classList.contains('vd-dong')) return dong();
      if (t.dataset.vdTuoi) { S.tuoi = t.dataset.vdTuoi; luu(); return veTrangChinh(); }
      if (t.dataset.vdGai != null) { S.gai = t.dataset.vdGai === '1'; luu(); return veTrangChinh(); }
      if (t.dataset.vdBat != null) { viTri = Number(t.dataset.vdBat) || 0; nghi = false; return veBai(); }
      if (t.hasAttribute('data-vd-dung')) { dung = !dung; t.textContent = dung ? '▶ Tập tiếp' : '⏸ Tạm dừng'; return; }
      if (t.hasAttribute('data-vd-tiep')) return qua();
      if (t.hasAttribute('data-vd-ve')) return veTrangChinh();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && khung.classList.contains('is-mo')) dong(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && hen) dung = true; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dung1); else dung1();
})();
