/* =====================================================================
   CHAT VỚI SHOP – nút chat góc phải dưới, mọi trang bán hàng.
   - Khách nhắn chữ, gửi ảnh / video (lưu trên VPS ở /chat-tep/), gửi sản phẩm hoặc đơn hàng cần hỗ trợ.
   - Tin lưu trên máy chủ (tools/apps-script.gs: chatGui / chatDoc), nhân viên trả lời ở
     Quản trị › Khách hàng › Chat với khách. Sau này nối phần mềm chat: chatApi + CHAT_WEBHOOK (tools/may-chu-vps/CHAT-API.md).
   - Câu chào + nút chọn nhanh: sửa ở CHAT_CFG bên dưới.
   ===================================================================== */
(() => {
  'use strict';
  const MC = window.MC; if (!MC || window.top !== window) return;   // không chạy trong khung xem trước của trang quản trị
  const { esc, loyaltyApi, store, fmt } = MC;
  const CHAT_CFG = {
    ten: 'Hương Chất Kids',
    phuDe: 'Chuyên gia tư vấn · thường trả lời trong vài phút',
    chao: [
      'Chào mẹ, Hương Chất Kids rất vui được hỗ trợ mẹ!',
      'Mẹ cần tư vấn dinh dưỡng cho bé theo độ tuổi, chọn mỹ phẩm cho mẹ hay hỗ trợ đơn hàng ạ? Mẹ cứ nhắn, gửi ảnh sản phẩm hoặc đơn hàng – chuyên gia của Hương trả lời ngay nhé.'
    ],
    nhanh: [
      ['🍼', 'Tư vấn dinh dưỡng cho bé', 'Hương ơi, tư vấn giúp mình dinh dưỡng cho bé nhà mình với ạ. Bé '],
      ['📏', 'Bé chậm tăng cân, chiều cao', 'Bé nhà mình chậm tăng cân / chiều cao, Hương tư vấn giúp mình với. Bé '],
      ['💄', 'Mỹ phẩm cho mẹ', 'Hương tư vấn giúp mình mỹ phẩm phù hợp với da mình với ạ. Da mình '],
      ['📦', 'Hỗ trợ đơn hàng', '#don'],
      ['🎁', 'Ưu đãi hôm nay', 'Hôm nay shop đang có ưu đãi gì vậy Hương?']
    ]
  };
  const KP = 'mc_chat_phien', KT = 'mc_chat_tin';
  const API = () => ((SITE.loyalty || {}).endpoint || '').replace(/\/+$/, '');
  const GOC_TEP = () => { try { return new URL(API()).origin; } catch { return ''; } };   // tệp chat nằm trên máy chủ API
  const taoPhien = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  let phien = store.get(KP, '') || ''; if (!/^c[a-z0-9]{12,40}$/.test(phien)) phien = '';
  let tin = store.get(KT, []) || [], mo = false, hen = 0, dangGui = false, bang = '';
  const sauCung = () => tin.reduce((m, x) => Math.max(m, x.tam ? 0 : x.luc || 0), 0);
  const luu = () => store.set(KT, tin.filter((x) => !x.tam).slice(-200));
  const gioVN = (t) => { const d = new Date(t + 7 * 36e5); return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0'); };
  const khach = () => { const c = (MC.Customer && MC.Customer.get()) || {}, s = MC.Session && MC.Session.get(), k = (s && s.kh) || {}; return { ten: k.ten || c.name || '', sdt: (MC.Session && MC.Session.phone()) || c.phone || '' }; };

  /* ---- Hiển thị đính kèm ---- */
  function theDK(dk, toi) {
    if (!dk) return '';
    if (dk.loai === 'anh') { const u = dk.tam || GOC_TEP() + dk.url; return `<a class="chat-dk chat-dk--anh" href="${esc(u)}" target="_blank" rel="noopener"><img src="${esc(u)}" alt="Ảnh" loading="lazy"></a>`; }
    if (dk.loai === 'video') { const u = dk.tam || GOC_TEP() + dk.url; return `<video class="chat-dk chat-dk--video" src="${esc(u)}" controls preload="metadata" playsinline></video>`; }
    if (dk.loai === 'sp') {
      const p = MC.byId(dk.id); if (!p) return `<div class="chat-dk chat-dk--sp"><span>Sản phẩm ${esc(dk.id)} (đã ngừng bán)</span></div>`;
      return `<div class="chat-dk chat-dk--sp"><a href="product.html?id=${encodeURIComponent(p.id)}"><img src="${esc(MC.productThumb(p))}" alt=""></a><div><a href="product.html?id=${encodeURIComponent(p.id)}" class="chat-sp__ten">${esc(MC.shortName(p))}</a>${dk.bt ? `<small>${esc(dk.bt)}</small>` : ''}<b>${fmt(p.price)}</b>
        ${!toi ? `<button type="button" class="chat-sp__mua" data-buy="${esc(p.id)}">${dk.moi ? '⚡ Đặt hàng ngay' : 'Mua ngay'}</button>` : ''}</div></div>`;
    }
    if (dk.loai === 'don') return `<div class="chat-dk chat-dk--don"><b>📦 Đơn ${esc(dk.ma)}</b>${dk.ngay ? `<small>${esc(dk.ngay)}</small>` : ''}${dk.sp ? `<span>${esc(dk.sp)}</span>` : ''}<span>${dk.tong ? fmt(dk.tong) : ''}${dk.tt ? ' · ' + esc(dk.tt) : ''}</span></div>`;
    return '';
  }
  function veTin() {
    const b = document.getElementById('chatTin'); if (!b) return;
    const chao = CHAT_CFG.chao.map((t) => ({ tu: 'nv', noiDung: t }));
    b.innerHTML = chao.concat(tin).map((x) => { const toi = x.tu === 'khach';
      return `<div class="chat-m chat-m--${toi ? 'toi' : x.tu === 'he-thong' ? 'ht' : 'shop'}${x.tam ? ' is-tam' : ''}">${x.dk ? theDK(x.dk, toi) : ''}${x.noiDung ? `<div class="chat-m__b">${esc(x.noiDung).replace(/\n/g, '<br>')}</div>` : ''}${x.luc ? `<small>${x.tam ? 'Đang gửi…' : (x.tu === 'nv' && x.nv ? esc(x.nv) + ' · ' : '') + gioVN(x.luc)}</small>` : ''}</div>`; }).join('')
      + (!tin.length ? `<div class="chat-nhanh">${CHAT_CFG.nhanh.map(([, t], k) => `<button type="button" data-chat-nhanh="${k}">${esc(t)}</button>`).join('')}</div>` : '');
    b.scrollTop = b.scrollHeight;
    b.querySelectorAll('img,video').forEach((m) => m.addEventListener(m.tagName === 'IMG' ? 'load' : 'loadedmetadata', () => { b.scrollTop = b.scrollHeight; }, { once: true }));
  }
  function chamDo() { const n = tin.filter((x) => x.tu !== 'khach' && !x.daXem).length, d = document.getElementById('chatDo'); if (d) { d.textContent = n; d.hidden = !n; } }

  /* ---- Bảng chọn sản phẩm / đơn hàng ---- */
  function veBang() {
    const b = document.getElementById('chatBang'); if (!b) return;
    b.hidden = !bang; if (!bang) { b.innerHTML = ''; return; }
    if (bang === 'sp') {
      b.innerHTML = `<div class="chat-bang__dau"><b>Chọn sản phẩm cần hỗ trợ</b><button type="button" data-chat-bang="">×</button></div><input type="search" id="chatTimSP" placeholder="Tìm sản phẩm…" autocomplete="off"><div class="chat-bang__ds" id="chatDsSP"></div>`;
      veDsSP(''); setTimeout(() => document.getElementById('chatTimSP')?.focus(), 50);
    } else {
      const s = MC.Session && MC.Session.get();
      const tuMay = (store.get('mc_orders', []) || []).filter((o) => o.type !== 'callback' && o.code).map((o) => ({ ma: o.code, tong: o.total || 0, ngay: (o.createdAt || '').slice(0, 10).split('-').reverse().join('/'), sp: (o.items || []).map((i) => (i.short || i.name) + ' x' + i.qty).join(', '), tt: '' }));
      const tuTk = ((s && s.donHang) || []).map((d) => ({ ma: d.ma, tong: d.tong || 0, ngay: d.ngay || '', sp: d.sanPham || '', tt: d.trangThai || '' }));
      const gop = []; const co = new Set(); tuTk.concat(tuMay).forEach((d) => { if (d.ma && !co.has(d.ma)) { co.add(d.ma); gop.push(d); } });
      b.innerHTML = `<div class="chat-bang__dau"><b>Chọn đơn hàng cần hỗ trợ</b><button type="button" data-chat-bang="">×</button></div>
        <div class="chat-bang__ds">${gop.slice(0, 20).map((d, i) => `<div class="chat-bang__dong"><div><b>${esc(d.ma)}</b><small>${esc(d.ngay)}${d.tt ? ' · ' + esc(d.tt) : ''}</small><small class="chat-bang__sp">${esc(d.sp)}</small><span>${d.tong ? fmt(d.tong) : ''}</span></div><button type="button" class="chat-bang__gui" data-gui-don="${i}">Gửi</button></div>`).join('')
          || `<p class="chat-bang__trong">Chưa thấy đơn hàng trên máy này${s ? '' : ' – mẹ <a href="account.html">đăng nhập</a> để xem đơn đã đặt'}. Mẹ có thể nhắn mã đơn hoặc số điện thoại đặt hàng nhé.</p>`}</div>`;
      b._don = gop;
    }
  }
  function veDsSP(q) {
    const ds = document.getElementById('chatDsSP'); if (!ds) return;
    const list = (q ? MC.timSP(q).ds : PRODUCTS.slice().sort(MC.rankDefault)).slice(0, 30);
    ds.innerHTML = list.map((p) => `<div class="chat-bang__dong"><img src="${esc(MC.productThumb(p))}" alt=""><div><b>${esc(MC.shortName(p))}</b><span>${fmt(p.price)}</span></div><button type="button" class="chat-bang__gui" data-gui-sp="${esc(p.id)}">Gửi</button></div>`).join('') || '<p class="chat-bang__trong">Không tìm thấy sản phẩm</p>';
  }

  /* ---- Gửi / đọc tin ---- */
  async function docMoi() {
    if (!phien) return;
    try {
      const r = await loyaltyApi('chatDoc', { phien, sau: sauCung() }, 15000);
      if (r && r.ok && r.tin && r.tin.length) {
        const co = new Set(tin.map((x) => x.ma));
        r.tin.forEach((x) => { if (!co.has(x.ma)) { x.daXem = mo; tin.push(x); } });
        luu(); veTin(); chamDo();
      }
    } catch { /* mạng chập chờn – lần sau đọc lại */ }
  }
  /* Đọc tin mới: 5 giây/lần khi mở khung, 60 giây/lần khi đóng (chỉ khi đã từng chat), dừng khi tab ẩn */
  function lap() { clearTimeout(hen); if (!phien || document.hidden) return; hen = setTimeout(async () => { await docMoi(); lap(); }, mo ? 5000 : 60000); }
  const baoLoi = (msg) => { tin.push({ ma: 'loi' + Date.now(), tu: 'he-thong', noiDung: msg, luc: Date.now(), daXem: true }); };
  async function gui(nd, dk, tamDK) {
    nd = String(nd || '').trim(); if ((!nd && !dk) || dangGui) return;
    if (!phien) { phien = taoPhien(); store.set(KP, phien); }
    dangGui = true;
    const tam = { ma: 'tam' + Date.now(), tu: 'khach', noiDung: nd, luc: Date.now(), tam: true, dk: tamDK || dk };
    tin.push(tam); veTin();
    const k = khach();
    try {
      if (dk && dk.file) {   // tải tệp lên trước
        const r0 = await fetch(API() + '/chat-tep?phien=' + encodeURIComponent(phien), { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: dk.file });
        const j = await r0.json().catch(() => ({}));
        if (!r0.ok || !j.ok) throw new Error(j.msg || 'Chưa gửi được tệp, mẹ thử lại nhé');
        dk = { loai: j.loai, url: j.url };
      }
      const r = await loyaltyApi('chatGui', { phien, noiDung: nd, dinhKem: dk ? JSON.stringify(dk) : '', ten: k.ten, sdt: k.sdt, trang: location.pathname.split('/').pop() + location.search }, 20000);
      tin = tin.filter((x) => x !== tam);
      if (r && r.ok) (r.tin || []).forEach((x) => { x.daXem = true; tin.push(x); }); else baoLoi((r && r.msg) || 'Chưa gửi được, mẹ thử lại nhé');
    } catch (e) {
      tin = tin.filter((x) => x !== tam);
      baoLoi(/Failed to fetch|NetworkError|không phản hồi|kết nối/i.test(e.message) ? 'Mạng đang chập chờn, tin chưa gửi được. Mẹ thử lại hoặc nhắn Zalo cho Hương nhé.' : e.message);
    }
    if (tamDK && tamDK.tam) setTimeout(() => URL.revokeObjectURL(tamDK.tam), 60000);
    dangGui = false; luu(); veTin(); lap();
  }
  /* Ảnh: thu nhỏ còn tối đa 1600px trước khi gửi (nhanh, đỡ tốn 4G). Video: gửi nguyên, tối đa 25MB. */
  async function chonTep(f) {
    if (!f) return;
    if (/^video\//.test(f.type)) {
      if (f.size > 25 * 1048576) { baoLoi('Video quá dài (tối đa 25MB). Mẹ quay ngắn hơn hoặc gửi qua Zalo nhé.'); veTin(); return; }
      return gui('', { loai: 'video', file: f }, { loai: 'video', tam: URL.createObjectURL(f) });
    }
    if (!/^image\//.test(f.type)) { baoLoi('Mẹ chỉ gửi được ảnh hoặc video nhé.'); veTin(); return; }
    let blob = f;
    try {
      const anh = await createImageBitmap(f); const tl = Math.min(1, 1600 / Math.max(anh.width, anh.height));
      if (tl < 1 || f.size > 1.5 * 1048576 || !/jpe?g|png|webp/.test(f.type)) {
        const c = document.createElement('canvas'); c.width = Math.round(anh.width * tl); c.height = Math.round(anh.height * tl);
        c.getContext('2d').drawImage(anh, 0, 0, c.width, c.height);
        blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.85));
      }
    } catch { /* trình duyệt không thu nhỏ được (vd ảnh HEIC) → gửi nguyên */ }
    if (blob.size > 25 * 1048576) { baoLoi('Ảnh quá lớn, mẹ chụp lại hoặc gửi qua Zalo nhé.'); veTin(); return; }
    gui('', { loai: 'anh', file: blob }, { loai: 'anh', tam: URL.createObjectURL(blob) });
  }
  function moKhung(bat) {
    mo = bat; const k = document.getElementById('chatBox'); if (!k) return;
    k.classList.toggle('is-mo', bat); document.body.classList.toggle('chat-dang-mo', bat);
    if (bat) { tin.forEach((x) => { x.daXem = true; }); luu(); veTin(); chamDo(); docMoi(); setTimeout(() => { const i = document.getElementById('chatO'); if (i && window.innerWidth > 768) i.focus(); }, 150); }
    else { bang = ''; veBang(); }
    lap();
  }
  const moBang = (b) => { bang = bang === b ? '' : b; veBang(); };

  function dung() {
    if (document.getElementById('chatBox')) return;
    const w = document.createElement('div'); w.id = 'chatWrap';
    w.innerHTML = `<button type="button" class="chat-nut" id="chatNut" aria-label="Chat với Hương Chất Kids"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/></svg><span class="chat-nut__chu">Chat với Hương</span><b id="chatDo" hidden>0</b></button>
      <section class="chat-box" id="chatBox" aria-label="Chat với Hương Chất Kids">
        <header class="chat-dau"><img src="${esc(SITE.logo || 'img/logo.png')}" alt="" onerror="this.style.display='none'"><div><b>${esc(CHAT_CFG.ten)}</b><small><i class="chat-cham"></i>${esc(CHAT_CFG.phuDe)}</small></div>
          <button type="button" class="chat-dong" data-chat-dong aria-label="Thu nhỏ khung chat">×</button></header>
        <div class="chat-tin" id="chatTin"></div>
        <div class="chat-bang" id="chatBang" hidden></div>
        <div class="chat-cong">
          <button type="button" data-chat-tep title="Gửi ảnh / video">📷 Ảnh/Video</button>
          <button type="button" data-chat-bang="sp" title="Gửi sản phẩm">🛍️ Sản phẩm</button>
          <button type="button" data-chat-bang="don" title="Gửi đơn hàng">📦 Đơn hàng</button>
          <input type="file" id="chatTep" accept="image/*,video/*" hidden>
        </div>
        <form class="chat-o" id="chatForm" autocomplete="off"><textarea id="chatO" rows="1" maxlength="1000" placeholder="Nhập tin nhắn…" aria-label="Nhập tin nhắn"></textarea><button type="submit" aria-label="Gửi"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M3 20.5 21.5 12 3 3.5l.01 6.6L15 12 3.01 13.9z"/></svg></button></form>
        <div class="chat-chan">Cần gấp? <a href="${esc(SITE.zalo || '#')}" target="_blank" rel="noopener">Nhắn Zalo</a> · <a href="tel:${esc(SITE.hotlineTel || '')}">Gọi ${esc(SITE.hotline || '')}</a></div>
      </section>`;
    document.body.appendChild(w);
    document.getElementById('chatNut').addEventListener('click', () => moKhung(!mo));
    w.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('[data-chat-dong]')) return moKhung(false);
      if (t.closest('[data-chat-tep]')) return document.getElementById('chatTep').click();
      const bg = t.closest('[data-chat-bang]'); if (bg) return moBang(bg.dataset.chatBang);
      const gs = t.closest('[data-gui-sp]'); if (gs) { bang = ''; veBang(); return gui('', { loai: 'sp', id: gs.dataset.guiSp }); }
      const gd = t.closest('[data-gui-don]'); if (gd) { const d = document.getElementById('chatBang')._don[Number(gd.dataset.guiDon)]; bang = ''; veBang(); return gui('Hương hỗ trợ giúp mình đơn này với ạ', { loai: 'don', ma: d.ma, tong: d.tong, tt: d.tt, sp: d.sp.slice(0, 200), ngay: d.ngay }); }
      const n = t.closest('[data-chat-nhanh]');
      if (n) { const c = CHAT_CFG.nhanh[Number(n.dataset.chatNhanh)]; if (c[2] === '#don') return moBang('don'); const o = document.getElementById('chatO'); if (/ $/.test(c[2])) { o.value = c[2]; o.focus(); o.setSelectionRange(o.value.length, o.value.length); } else gui(c[2]); }
    });
    w.addEventListener('input', (e) => { if (e.target.id === 'chatTimSP') veDsSP(e.target.value); });
    document.getElementById('chatTep').addEventListener('change', (e) => { const f = e.target.files[0]; e.target.value = ''; chonTep(f); });
    const o = document.getElementById('chatO');
    const caoO = () => { o.style.height = 'auto'; o.style.height = Math.min(110, o.scrollHeight) + 'px'; };
    o.addEventListener('input', caoO);
    o.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); document.getElementById('chatForm').requestSubmit(); } });
    o.addEventListener('paste', (e) => { const f = [...(e.clipboardData || {}).files || []][0]; if (f) { e.preventDefault(); chonTep(f); } });
    document.getElementById('chatForm').addEventListener('submit', (e) => { e.preventDefault(); const v = o.value; o.value = ''; caoO(); gui(v); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { docMoi(); lap(); } else clearTimeout(hen); });
    veTin(); chamDo(); if (phien) { docMoi(); lap(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(dung, 0)); else dung();
  /* Các nút "Chat với Hương" trên web (data-mo-chat) mở khung chat thay vì sang Zalo; data-chat-nhap = gõ sẵn câu hỏi */
  document.addEventListener('click', (e) => {
    const n = e.target.closest('[data-mo-chat]'); if (!n || !document.getElementById('chatBox')) return;
    e.preventDefault(); moKhung(true);
    const nhap = n.dataset.chatNhap; if (nhap) { const o = document.getElementById('chatO'); o.value = nhap; o.dispatchEvent(new Event('input')); setTimeout(() => { o.focus(); o.setSelectionRange(o.value.length, o.value.length); }, 160); }
  });
  MC.chat = { mo: () => moKhung(true), gui };
})();
