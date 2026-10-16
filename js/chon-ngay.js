/* Bộ chọn ngày / ngày-giờ dùng chung cho cả web (trang khách + trang quản trị).
   Tự thay mọi <input type="date"> và <input type="datetime-local">: giờ hiện 24 giờ (00:00 – 23:59), có nút Lưu ở dưới.
   Ô gốc được đổi thành ô ẩn (giữ nguyên id, name, giá trị dạng YYYY-MM-DD / YYYY-MM-DDTHH:mm) nên code cũ đọc .value như trước;
   bấm Lưu / Xoá sẽ phát sự kiện input + change trên ô gốc. Tôn trọng min / max (VD ngày sinh không quá hôm nay). */
(function () {
  'use strict';
  if (window.ChonNgay) return;
  const pad = (n) => String(n).padStart(2, '0');
  const THANG = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const doc = (v) => { const m = String(v || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/); return m ? { y: +m[1], m: +m[2] - 1, d: +m[3], h: +(m[4] || 0), mi: +(m[5] || 0) } : null; };
  const ngayKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const hien = (v, dt) => { const x = doc(v); if (!x) return dt ? 'dd/mm/yyyy --:--' : 'dd/mm/yyyy'; return `${pad(x.d)}/${pad(x.m + 1)}/${x.y}` + (dt ? ` ${pad(x.h)}:${pad(x.mi)}` : ''); };

  /* ---------- CSS (tự chứa, dùng được ở cả trang khách và trang quản trị) ---------- */
  const css = `
.cn-o{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:38px;padding:8px 11px;border:1px solid #DCE1E7;border-radius:9px;background:#fff;color:#22202A;font:inherit;font-size:14px;text-align:left;cursor:pointer;margin-top:5px}
.cn-o.cn-trong{color:#9A96A3}.cn-o:disabled{background:#F2F4F7;color:#9A96A3;cursor:not-allowed}
.cn-o:focus-visible{outline:0;border-color:#F0537A;box-shadow:0 0 0 3px #FFE1EA}
.cn-o i{font-style:normal;opacity:.6}
.input.cn-o,.input--sm.cn-o{margin-top:0}
.cn-hop{position:absolute;z-index:9999;background:#fff;border-radius:16px;box-shadow:0 18px 50px rgba(30,20,40,.22);border:1px solid #EEE;padding:14px;font-family:inherit;color:#22202A;user-select:none}
.cn-dau{display:flex;align-items:center;gap:6px;margin-bottom:10px}
.cn-dau select{flex:1;padding:6px 8px;border:1px solid #DCE1E7;border-radius:8px;background:#fff;font:inherit;font-size:14px;font-weight:700;width:auto;margin:0}
.cn-dau button{width:32px;height:32px;border:0;border-radius:8px;background:#F4F5F7;cursor:pointer;font-size:16px}
.cn-than{display:flex;gap:12px}
.cn-lich{width:252px}
.cn-tuan,.cn-ngay{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;text-align:center}
.cn-tuan span{font-size:12px;font-weight:700;color:#8A8794;padding:4px 0}
.cn-ngay button{height:34px;border:0;border-radius:9px;background:none;font:inherit;font-size:14px;cursor:pointer;color:#22202A}
.cn-ngay button:hover{background:#FFF0F4}.cn-ngay button.ngoai{color:#C4C1CA}.cn-ngay button.nay{box-shadow:inset 0 0 0 1.5px #F0537A}
.cn-ngay button.chon{background:#F0537A;color:#fff;font-weight:700}.cn-ngay button:disabled{color:#D6D4DA;cursor:not-allowed;background:none}
.cn-gio{display:flex;gap:6px;border-left:1px solid #EEE;padding-left:12px}
.cn-cot{display:flex;flex-direction:column;align-items:center}
.cn-cot b{font-size:12px;color:#8A8794;margin-bottom:4px}
.cn-cuon{height:222px;overflow-y:auto;width:52px;scrollbar-width:thin}
.cn-cuon button{display:block;width:100%;height:30px;border:0;border-radius:8px;background:none;font:inherit;font-size:14px;cursor:pointer;color:#22202A}
.cn-cuon button:hover{background:#FFF0F4}.cn-cuon button.chon{background:#F0537A;color:#fff;font-weight:700}
.cn-chan{display:flex;align-items:center;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid #EEE}
.cn-chan .cn-kq{flex:1;font-size:13px;font-weight:700;color:#7E1C45}
.cn-chan button{border:0;border-radius:9px;padding:9px 14px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;background:#F4F5F7;color:#3B3442}
.cn-chan .cn-luu{background:#F0537A;color:#fff;font-weight:700;padding:9px 20px}
.cn-chan .cn-xoa{background:none;color:#C62828;padding:9px 6px}
@media (max-width:560px){.cn-hop{position:fixed;left:8px!important;right:8px;bottom:8px;top:auto!important}.cn-than{flex-direction:column}.cn-lich{width:auto}.cn-gio{border-left:0;padding-left:0;border-top:1px solid #EEE;padding-top:8px;justify-content:center}.cn-cuon{height:120px;width:70px}.cn-chan{flex-wrap:wrap}}`;
  const st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  /* ---------- Thay ô gốc bằng nút hiển thị ---------- */
  const moTa = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  function capNhat(inp) {
    const n = inp._cnNut; if (!n) return;
    const v = moTa.get.call(inp);
    n.querySelector('span').textContent = hien(v, inp.dataset.cn === 'dt');
    n.classList.toggle('cn-trong', !v); n.disabled = inp.disabled;
  }
  function bien(inp) {
    if (inp.dataset.cn) return;
    const dt = inp.type === 'datetime-local';
    inp.dataset.cn = dt ? 'dt' : 'd';
    const nut = document.createElement('button');
    nut.type = 'button'; nut.className = 'cn-o' + (inp.classList.contains('input') ? ' input' : '') + (inp.classList.contains('input--sm') ? ' input--sm' : '');
    nut.innerHTML = '<span></span><i>📅</i>';
    if (inp.getAttribute('aria-label')) nut.setAttribute('aria-label', inp.getAttribute('aria-label'));
    nut._cnInp = inp; inp._cnNut = nut;
    inp.type = 'hidden';
    Object.defineProperty(inp, 'value', { configurable: true, get() { return moTa.get.call(this); }, set(v) { moTa.set.call(this, v); capNhat(this); } });
    new MutationObserver(() => capNhat(inp)).observe(inp, { attributes: true, attributeFilter: ['disabled'] });
    inp.after(nut); capNhat(inp);
    /* Bấm vào nhãn (label for=…) thì mở bộ chọn */
    if (inp.id) document.querySelectorAll(`label[for="${CSS.escape(inp.id)}"]`).forEach((l) => l.addEventListener('click', (e) => { e.preventDefault(); if (!nut.disabled) mo(inp); }));
  }
  function quet(goc) { (goc || document).querySelectorAll('input[type="date"]:not([data-cn]),input[type="datetime-local"]:not([data-cn])').forEach(bien); }

  /* ---------- Hộp chọn ---------- */
  let hop = null, dang = null, S = null;
  function dong() { if (hop) { hop.remove(); hop = null; } dang = null; }
  function mo(inp) {
    dong(); dang = inp;
    const dt = inp.dataset.cn === 'dt', now = new Date(), x = doc(moTa.get.call(inp));
    const mn = doc(inp.getAttribute('min')), mx = doc(inp.getAttribute('max'));
    S = { dt, mn, mx, chon: x ? { ...x } : null, y: x ? x.y : now.getFullYear(), m: x ? x.m : now.getMonth(), h: x ? x.h : 0, mi: x ? x.mi : 0 };
    if (!x && mx && new Date(S.y, S.m, 1) > new Date(mx.y, mx.m, 1)) { S.y = mx.y; S.m = mx.m; }
    hop = document.createElement('div'); hop.className = 'cn-hop'; hop.setAttribute('role', 'dialog');
    document.body.appendChild(hop); ve(); viTri(inp._cnNut);
    hop.querySelectorAll('.cn-cuon .chon').forEach((b) => { b.parentNode.scrollTop = b.offsetTop - 90; });
  }
  function viTri(nut) {
    if (innerWidth <= 560) return;
    const r = nut.getBoundingClientRect(), w = hop.offsetWidth, h = hop.offsetHeight;
    const rong = document.documentElement.clientWidth, cao = document.documentElement.clientHeight;
    const left = Math.max(8, Math.min(r.left, rong - w - 8));
    let top;
    if (r.bottom + 6 + h <= cao - 8) top = r.bottom + 6;
    else if (r.top - 6 - h >= 8) top = r.top - 6 - h;
    else top = Math.max(8, (cao - h) / 2);   // không đủ chỗ trên / dưới: đặt giữa màn hình
    hop.style.position = 'fixed'; hop.style.left = left + 'px'; hop.style.top = top + 'px';
  }
  addEventListener('scroll', () => { if (hop && dang && innerWidth > 560) { const r = dang._cnNut.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) dong(); } }, true);
  const ngoaiGioiHan = (y, m, d) => { const k = ngayKey(y, m, d); return (S.mn && k < ngayKey(S.mn.y, S.mn.m, S.mn.d)) || (S.mx && k > ngayKey(S.mx.y, S.mx.m, S.mx.d)); };
  function ve() {
    const now = new Date(), homNay = ngayKey(now.getFullYear(), now.getMonth(), now.getDate());
    const namMax = S.mx ? S.mx.y : now.getFullYear() + 6, namMin = S.mn ? S.mn.y : Math.min(1950, S.y);
    let nam = ''; for (let y = namMax; y >= namMin; y--) nam += `<option value="${y}" ${y === S.y ? 'selected' : ''}>${y}</option>`;
    const dau = new Date(S.y, S.m, 1), lech = (dau.getDay() + 6) % 7, soNgay = new Date(S.y, S.m + 1, 0).getDate();
    let o = '';
    for (let i = 0; i < 42; i++) {
      const dd = new Date(S.y, S.m, 1 - lech + i), y = dd.getFullYear(), m = dd.getMonth(), d = dd.getDate(), k = ngayKey(y, m, d);
      if (i >= 35 && 1 - lech + i > soNgay) break;
      const chon = S.chon && k === ngayKey(S.chon.y, S.chon.m, S.chon.d);
      o += `<button type="button" data-ngay="${k}" class="${m !== S.m ? 'ngoai' : ''} ${k === homNay ? 'nay' : ''} ${chon ? 'chon' : ''}" ${ngoaiGioiHan(y, m, d) ? 'disabled' : ''}>${d}</button>`;
    }
    const cot = (ten, n, gt, loai) => `<div class="cn-cot"><b>${ten}</b><div class="cn-cuon">${Array.from({ length: n }, (_, i) => `<button type="button" data-${loai}="${i}" class="${i === gt ? 'chon' : ''}">${pad(i)}</button>`).join('')}</div></div>`;
    const kq = S.chon ? `${pad(S.chon.d)}/${pad(S.chon.m + 1)}/${S.chon.y}${S.dt ? ` ${pad(S.h)}:${pad(S.mi)}` : ''}` : 'Chưa chọn ngày';
    hop.innerHTML = `<div class="cn-dau"><button type="button" data-lui aria-label="Tháng trước">‹</button>
        <select data-thang aria-label="Tháng">${THANG.map((t, i) => `<option value="${i}" ${i === S.m ? 'selected' : ''}>${t}</option>`).join('')}</select>
        <select data-nam aria-label="Năm">${nam}</select><button type="button" data-toi aria-label="Tháng sau">›</button></div>
      <div class="cn-than"><div class="cn-lich"><div class="cn-tuan">${['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((t) => `<span>${t}</span>`).join('')}</div><div class="cn-ngay">${o}</div></div>
        ${S.dt ? `<div class="cn-gio">${cot('Giờ', 24, S.h, 'gio')}${cot('Phút', 60, S.mi, 'phut')}</div>` : ''}</div>
      <div class="cn-chan"><span class="cn-kq">${kq}</span><button type="button" class="cn-xoa" data-xoa>Xoá</button><button type="button" data-nay>${S.dt ? 'Bây giờ' : 'Hôm nay'}</button><button type="button" data-huy>Huỷ</button><button type="button" class="cn-luu" data-luu>Lưu</button></div>`;
  }
  function luu(v) {
    const inp = dang; if (!inp) return;
    inp.value = v;
    inp.dispatchEvent(new Event('input', { bubbles: true })); inp.dispatchEvent(new Event('change', { bubbles: true }));
    const n = inp._cnNut; dong(); if (n) n.focus();
  }
  document.addEventListener('click', (e) => {
    const nut = e.target.closest('.cn-o');
    if (nut && nut._cnInp) { e.preventDefault(); if (dang === nut._cnInp) dong(); else mo(nut._cnInp); return; }
    if (!hop) return;
    if (!hop.contains(e.target)) { dong(); return; }
    const t = e.target.closest('button'); if (!t) return;
    const giuCuon = () => [...hop.querySelectorAll('.cn-cuon')].map((c) => c.scrollTop), traCuon = (a) => hop.querySelectorAll('.cn-cuon').forEach((c, i) => { c.scrollTop = a[i]; });
    if (t.hasAttribute('data-lui') || t.hasAttribute('data-toi')) { const d = new Date(S.y, S.m + (t.hasAttribute('data-lui') ? -1 : 1), 1); S.y = d.getFullYear(); S.m = d.getMonth(); const a = giuCuon(); ve(); traCuon(a); return; }
    if (t.dataset.ngay) { const x = doc(t.dataset.ngay); S.chon = { y: x.y, m: x.m, d: x.d }; if (x.m !== S.m) { S.y = x.y; S.m = x.m; } const a = giuCuon(); ve(); traCuon(a); return; }
    if (t.dataset.gio != null) { S.h = +t.dataset.gio; if (!S.chon) { const n = new Date(); S.chon = { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() }; } const a = giuCuon(); ve(); traCuon(a); return; }
    if (t.dataset.phut != null) { S.mi = +t.dataset.phut; if (!S.chon) { const n = new Date(); S.chon = { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() }; } const a = giuCuon(); ve(); traCuon(a); return; }
    if (t.hasAttribute('data-nay')) { const n = new Date(); S.chon = { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() }; S.y = S.chon.y; S.m = S.chon.m; if (S.dt) { S.h = n.getHours(); S.mi = n.getMinutes(); } ve(); hop.querySelectorAll('.cn-cuon .chon').forEach((b) => { b.parentNode.scrollTop = b.offsetTop - 90; }); return; }
    if (t.hasAttribute('data-huy')) { dong(); return; }
    if (t.hasAttribute('data-xoa')) { luu(''); return; }
    if (t.hasAttribute('data-luu')) {
      if (!S.chon) { const k = hop.querySelector('.cn-kq'); if (k) k.textContent = 'Mẹ chọn ngày trước nhé'; return; }
      luu(ngayKey(S.chon.y, S.chon.m, S.chon.d) + (S.dt ? `T${pad(S.h)}:${pad(S.mi)}` : ''));
    }
  }, true);
  document.addEventListener('change', (e) => {
    if (!hop || !hop.contains(e.target)) return;
    if (e.target.matches('[data-thang]')) S.m = +e.target.value;
    if (e.target.matches('[data-nam]')) S.y = +e.target.value;
    ve();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && hop) { const n = dang && dang._cnNut; dong(); if (n) n.focus(); } });
  addEventListener('resize', () => { if (hop && dang) viTri(dang._cnNut); });

  const bat = () => { quet(); new MutationObserver((ms) => { if (ms.some((m) => m.addedNodes.length)) quet(); }).observe(document.body, { childList: true, subtree: true }); };
  if (document.body) bat(); else document.addEventListener('DOMContentLoaded', bat);
  window.ChonNgay = { quet, mo };
})();
