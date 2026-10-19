/* ===== CHAT VỚI KHÁCH – hộp thư nhân viên trả lời khách chat trên web (js/chat.js)
   Danh sách cuộc chat bên trái (tự cập nhật 8 giây/lần), nội dung + ô trả lời bên phải.
   Gửi được: chữ, câu trả lời mẫu, sản phẩm (Gửi / Mời đặt hàng – khách bấm là mua ngay). ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, esc, fmt } = A;
  const R = '/chat';
  const MAU = [
    'Dạ Hương chào mẹ ạ 💗 Mẹ cho Hương xin tuổi, cân nặng và chiều cao hiện tại của bé để tư vấn chính xác nhé.',
    'Dạ mẹ cho Hương xin số điện thoại, chuyên gia của Hương gọi lại tư vấn kỹ cho mẹ ngay ạ.',
    'Dạ đơn của mẹ Hương đang kiểm tra, mẹ chờ Hương ít phút nhé ạ.',
    'Dạ sản phẩm này đang có ưu đãi, mẹ bấm "Đặt hàng ngay" ngay trong khung chat để đặt nhanh nhé ạ.',
    'Dạ Hương cảm ơn mẹ đã tin tưởng Hương Chất Kids ạ 🥰'
  ];
  let ds = [], chon = '', tin = [], hen = 0, bangSP = false, dangTai = false;
  const GOC = () => { try { return new URL((SITE.loyalty || {}).endpoint || '').origin; } catch { return ''; } };
  const gio = (t) => { const d = new Date(t + 7 * 36e5); return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')} ${d.getUTCDate()}/${d.getUTCMonth() + 1}`; };
  const trongTrang = () => location.hash.startsWith('#' + R);
  const sp = (id) => (A.D.PRODUCTS || window.PRODUCTS || []).find((p) => p.id === id);

  function theDK(dk) {
    if (!dk) return '';
    if (dk.loai === 'anh') return `<a href="${esc(GOC() + dk.url)}" target="_blank" rel="noopener"><img class="ch-anh" src="${esc(GOC() + dk.url)}" alt="Ảnh khách gửi"></a>`;
    if (dk.loai === 'video') return `<video class="ch-anh" src="${esc(GOC() + dk.url)}" controls preload="metadata"></video>`;
    if (dk.loai === 'sp') { const p = sp(dk.id); return `<div class="ch-sp">${p ? `<img src="${esc(p.thumb || p.image || '')}" alt=""><div><b>${esc(p.short || p.name)}</b><span>${fmt(p.price)}</span>${dk.moi ? '<small>Đã mời đặt hàng</small>' : ''}<a href="product.html?id=${encodeURIComponent(p.id)}" target="_blank" rel="noopener">Xem trên web ↗</a></div>` : `<div>Sản phẩm ${esc(dk.id)}</div>`}</div>`; }
    if (dk.loai === 'don') return `<div class="ch-sp ch-don"><div><b>📦 Đơn ${esc(dk.ma)}</b><small>${esc(dk.ngay || '')} ${dk.tt ? '· ' + esc(dk.tt) : ''}</small><span>${dk.tong ? fmt(dk.tong) : ''}</span><small>${esc(dk.sp || '')}</small><a href="#/don-hang">Mở Đơn hàng (tìm mã ${esc(dk.ma)}) →</a></div></div>`;
    return '';
  }
  function veDs() {
    const b = $('#chDs'); if (!b) return;
    b.innerHTML = ds.length ? ds.map((c) => `<button class="ch-dong ${c.phien === chon ? 'is-on' : ''}" data-ch="${esc(c.phien)}">
      <span class="ch-ava">${esc((c.ten || 'K').trim().slice(0, 1).toUpperCase())}</span>
      <span class="ch-dong__tt"><b>${esc(c.ten || 'Khách chưa đăng nhập')}${c.sdt ? ` <small>${esc(c.sdt)}</small>` : ''}</b><small>${c.cuoiTu === 'nv' ? 'Bạn: ' : ''}${esc(c.cuoi || '')}</small></span>
      <span class="ch-dong__p"><small>${gio(c.luc)}</small>${c.chuaDoc ? `<i>${c.chuaDoc}</i>` : ''}</span></button>`).join('')
      : A.trong('Chưa có cuộc chat nào', 'Khi khách nhắn ở góc phải website, tin sẽ hiện ở đây.', '💬');
  }
  function veTin() {
    const b = $('#chTin'); if (!b) return;
    const c = ds.find((x) => x.phien === chon);
    $('#chDau').innerHTML = c ? `<b>${esc(c.ten || 'Khách chưa đăng nhập')}</b>${c.sdt ? ` · <a href="#/thanh-vien/${encodeURIComponent(c.sdt)}">${esc(c.sdt)}</a> · <a href="tel:${esc(c.sdt)}">Gọi</a>` : ''}${c.trang ? ` <small class="muted">· đang xem ${esc(c.trang)}</small>` : ''}` : '<span class="muted">Chọn một cuộc chat bên trái</span>';
    b.innerHTML = chon ? tin.map((t) => `<div class="ch-m ch-m--${t.tu === 'khach' ? 'kh' : t.tu === 'he-thong' ? 'ht' : 'nv'}">${theDK(t.dk)}${t.noiDung ? `<div class="ch-m__b">${esc(t.noiDung).replace(/\n/g, '<br>')}</div>` : ''}<small>${t.tu === 'nv' ? esc(t.nv || 'Nhân viên') + ' · ' : t.tu === 'he-thong' || t.tu === 'tu-dong' ? 'Tự động · ' : ''}${gio(t.luc)}</small></div>`).join('') : '';
    b.scrollTop = b.scrollHeight;
    $('#chO').disabled = !chon; $('#chGui').disabled = !chon;
  }
  function veBangSP(q) {
    const b = $('#chBangSP'); if (!b) return; b.hidden = !bangSP; if (!bangSP) return;
    const all = (A.D.PRODUCTS || []).filter((p) => !p.an), k = A.khongDau(q || '');
    const list = (k ? all.filter((p) => A.khongDau((p.name || '') + ' ' + (p.short || '')).includes(k)) : all).slice(0, 40);
    $('#chDsSP').innerHTML = list.map((p) => `<div class="ch-bsp"><img src="${esc(p.thumb || p.image || '')}" alt=""><div><b>${esc(p.short || p.name)}</b><span>${fmt(p.price)}</span><small>${Number(p.stock) > 0 ? p.stock + ' còn hàng' : 'Hết hàng'} · ${p.sold || 0} đã bán</small></div>
      <button class="btn btn--ghost btn--sm" data-ch-sp="${esc(p.id)}" data-moi="1">🛒 Mời đặt hàng</button><button class="btn btn--primary btn--sm" data-ch-sp="${esc(p.id)}">Gửi</button></div>`).join('') || '<p class="muted">Không tìm thấy</p>';
  }
  async function taiDs() {
    if (dangTai) return; dangTai = true;
    try { const r = await A.api('qtChatDs', {}); if (r && r.ok) { ds = r.ds || []; veDs(); const tong = ds.reduce((s, c) => s + (c.chuaDoc || 0), 0); document.title = (tong ? `(${tong}) ` : '') + 'Chat với khách – Quản trị'; } }
    catch { /* thử lại lượt sau */ } finally { dangTai = false; }
  }
  async function taiTin() {
    if (!chon) return;
    try { const r = await A.api('qtChatXem', { phien: chon }); if (r && r.ok) { const cu = JSON.stringify(tin); tin = r.tin || []; if (JSON.stringify(tin) !== cu) veTin(); const c = ds.find((x) => x.phien === chon); if (c && c.chuaDoc) { c.chuaDoc = 0; veDs(); } } }
    catch { /* bỏ qua */ }
  }
  function lap() { clearTimeout(hen); if (!trongTrang()) return; hen = setTimeout(async () => { if (!document.hidden) { await taiDs(); await taiTin(); } lap(); }, 8000); }
  async function gui(noiDung, dinhKem) {
    if (!chon) return; noiDung = String(noiDung || '').trim(); if (!noiDung && !dinhKem) return;
    const nut = $('#chGui'); nut.disabled = true;
    try {
      const r = await A.api('qtChatTraLoi', { phien: chon, noiDung, dinhKem: dinhKem ? JSON.stringify(dinhKem) : '' });
      if (!r || !r.ok) throw new Error((r && r.msg) || 'Chưa gửi được');
      tin.push(r.tin); veTin(); taiDs();
    } catch (e) { A.toast(e.message, 'err'); } finally { nut.disabled = !chon; }
  }

  function ve(el, o) {
    const sub = decodeURIComponent((o && o.sub) || ''); if (sub) chon = sub;
    $('#pageAct').innerHTML = `<button class="btn btn--ghost" id="chTaiLai">↻ Tải lại</button>`;
    el.innerHTML = `<div class="ch">
      <div class="card ch-trai"><div class="ch-trai__dau"><b>Cuộc chat</b><span class="muted">tự cập nhật 8 giây/lần</span></div><div id="chDs" class="ch-ds">${A.trong('Đang tải…', '', '⏳')}</div></div>
      <div class="card ch-phai"><div class="ch-dau" id="chDau"></div><div class="ch-tin" id="chTin"></div>
        <div class="ch-bang" id="chBangSP" hidden><div class="ch-bang__dau"><input id="chTimSP" placeholder="Tìm sản phẩm" autocomplete="off"><button class="icobtn" data-ch-dong-sp>✕</button></div><div id="chDsSP" class="ch-bang__ds"></div></div>
        <div class="ch-mau">${MAU.map((m, i) => `<button data-ch-mau="${i}" title="${esc(m)}">${esc(m.slice(0, 28))}…</button>`).join('')}</div>
        <div class="ch-o"><button class="btn btn--ghost btn--sm" id="chMoSP" title="Gửi sản phẩm">🛍️ Sản phẩm</button><textarea id="chO" rows="2" placeholder="Nhập câu trả lời… (Enter để gửi, Shift+Enter xuống dòng)"></textarea><button class="btn btn--primary" id="chGui">Gửi</button></div>
        <p class="muted ch-ghi">Khách nhận tin trong khung chat trên web sau vài giây. Mỗi tin khách mới cũng được báo qua Zalo bot của shop.</p></div>
    </div>`;
    veDs(); veTin(); taiDs().then(taiTin); lap();
  }

  document.addEventListener('click', (e) => {
    if (!trongTrang()) return; const t = e.target;
    const d = t.closest('[data-ch]'); if (d) { chon = d.dataset.ch; tin = []; history.replaceState(null, '', '#' + R + '/' + encodeURIComponent(chon)); veDs(); veTin(); taiTin(); return; }
    if (t.id === 'chTaiLai') { taiDs().then(taiTin); return; }
    if (t.id === 'chGui') { const o = $('#chO'); const v = o.value; o.value = ''; gui(v); return; }
    if (t.id === 'chMoSP') { bangSP = !bangSP; veBangSP(''); if (bangSP) setTimeout(() => $('#chTimSP')?.focus(), 30); return; }
    if (t.closest('[data-ch-dong-sp]')) { bangSP = false; veBangSP(); return; }
    const s = t.closest('[data-ch-sp]'); if (s) { bangSP = false; veBangSP(); gui(s.dataset.moi ? 'Dạ mẹ tham khảo sản phẩm này nhé, mẹ bấm "Đặt hàng ngay" để đặt nhanh ạ 💗' : '', { loai: 'sp', id: s.dataset.chSp, moi: !!s.dataset.moi }); return; }
    const m = t.closest('[data-ch-mau]'); if (m) { const o = $('#chO'); o.value = MAU[Number(m.dataset.chMau)]; o.focus(); }
  });
  document.addEventListener('input', (e) => { if (e.target.id === 'chTimSP') veBangSP(e.target.value); });
  document.addEventListener('keydown', (e) => { if (e.target.id === 'chO' && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chGui').click(); } });
  window.addEventListener('hashchange', () => { if (trongTrang()) lap(); else clearTimeout(hen); });

  A.dangKy({ route: R, ten: 'Chat với khách', icon: '💬', nhom: 'khach-hang', quyen: 'customer.view', mo: 'Trả lời khách nhắn trong khung chat trên website', ve });
})();
