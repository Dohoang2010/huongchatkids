/* ===== NỘI DUNG – bài viết Cẩm nang chăm con (soạn thảo, nháp/đăng, SEO từng bài) ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc, khongDau } = A;
  const ds = () => A.D.POSTS || [];
  const S = { q: '', cat: '' };

  const slug = (s) => khongDau(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);
  const nay = () => { const d = new Date(); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; };
  const ngayBai = (p) => { const m = String(p.date || '').match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? new Date(+m[3], m[2] - 1, +m[1]).getTime() : 0; };
  const cats = () => [...new Set(ds().map((p) => p.cat).filter(Boolean))];
  const SP = () => A.D.PRODUCTS || [];
  const fmt = (n) => (Math.round(n) || 0).toLocaleString('vi-VN') + '₫';
  const anhSP = (p, c) => `<img src="${esc(p.thumb || p.image || (p.images || [])[0] || '')}" alt="" style="width:${c}px;height:${c}px;border-radius:6px;object-fit:cover;background:#f3f3f3;flex:none" onerror="this.style.visibility='hidden'">`;

  function veDS(el) {
    $('#pageAct').innerHTML = `<button class="btn btn--primary" id="btThem">+ Viết bài mới</button>`;
    let list = ds().map((p, i) => ({ p, i }));
    if (S.q) list = list.filter(({ p }) => khongDau(p.title + ' ' + (p.excerpt || '')).includes(khongDau(S.q)));
    if (S.cat) list = list.filter(({ p }) => p.cat === S.cat);
    el.innerHTML = `<div class="card">
      <div class="tool"><div class="tool__tim"><input id="btQ" placeholder="Tìm tiêu đề bài viết…" value="${esc(S.q)}"></div>
        <select id="btCat"><option value="">Mọi chuyên mục</option>${cats().map((c) => `<option ${S.cat === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
      ${list.length ? `<div class="tbl-wrap"><table><thead><tr><th>Bài viết</th><th>Chuyên mục</th><th>Ngày đăng</th><th>Thời gian đọc</th><th>Trạng thái</th><th></th></tr></thead><tbody>
        ${list.map(({ p, i }) => `<tr>
          <td><a class="sp-cell" href="#/noi-dung/${i}">
            <span class="bt-ico" style="background:${esc(p.color || '#F2F4F7')}">${p.emoji || '📄'}</span>
            <span><b>${esc(p.title)}</b><small>${esc(p.id)}</small></span></a></td>
          <td>${esc(p.cat || '—')}</td><td>${esc(p.date || '—')}</td><td>${esc(p.read || '—')}</td>
          <td>${p.nhap ? A.badge('Bản nháp', 'tag--wait') : ngayBai(p) > Date.now() ? A.badge('Hẹn đăng ' + (p.date || ''), 'tag--hot') : A.badge('Đã đăng', 'tag--ok')}${p.noiBat ? ' ' + A.badge('Nổi bật', 'tag--hot') : ''}</td>
          <td class="num"><a class="btn btn--ghost btn--sm" href="#/noi-dung/${i}">Sửa</a></td></tr>`).join('')}
      </tbody></table></div>` : A.trong('Chưa có bài viết nào', 'Bấm “Viết bài mới” để tạo bài đầu tiên.', '📝')}</div>`;
  }

  function veForm(el, idx) {
    const p = ds()[idx];
    if (!p) { el.innerHTML = A.trong('Không tìm thấy bài viết', '', '🔍'); return; }
    $('#pageAct').innerHTML = `<a class="btn btn--ghost" href="#/noi-dung">← Danh sách</a>
      <a class="btn btn--ghost" href="blog.html?id=${encodeURIComponent(p.id)}&preview=1" target="_blank" rel="noopener">Xem trên web ↗</a>
      <button class="btn btn--red" data-bt-xoa="${idx}">Xoá</button>`;
    el.innerHTML = `<div class="card" id="btForm" data-idx="${idx}">
      <div class="row row-2">
        <label>Tiêu đề <i>*</i><input data-b="title" value="${esc(p.title || '')}"></label>
        <label>Đường dẫn (slug)<input data-b="id" value="${esc(p.id || '')}"><small class="hint">Đổi slug sẽ làm hỏng link cũ.</small></label>
      </div>
      <div class="row row-4">
        <label>Chuyên mục<input data-b="cat" value="${esc(p.cat || '')}" list="dsCat"><datalist id="dsCat">${cats().map((c) => `<option>${esc(c)}</option>`).join('')}</datalist></label>
        <label>Ngày đăng<input data-b="date" value="${esc(p.date || '')}" placeholder="dd/mm/yyyy"></label>
        <label>Thời gian đọc<input data-b="read" value="${esc(p.read || '')}" placeholder="VD: 5 phút"></label>
        <label>Biểu tượng<input data-b="emoji" value="${esc(p.emoji || '')}" placeholder="📄"></label>
      </div>
      <label class="sw"><input type="checkbox" data-b="nhap" ${p.nhap ? 'checked' : ''}> Để ở bản nháp (chưa cho khách đọc)</label>
      <p class="hint">Ngày đăng ở tương lai = <b>hẹn giờ</b>: bài tự hiện cho khách khi tới ngày đó.</p>
      <label class="sw"><input type="checkbox" data-b="noiBat" ${p.noiBat ? 'checked' : ''}> Bài nổi bật (chạy ở băng xoay vòng cuối trang Cẩm nang; bài về sản phẩm hot cũng tự vào băng này)</label>
      <label>Sản phẩm trong bài <span class="muted">— bấm ô bên dưới, tìm và tích chọn sản phẩm</span></label>
      <input type="hidden" data-b="sanPham" id="btSpVal" value="${esc((p.sanPham || []).join(', '))}">
      <div class="dt-pick bt-sp" id="btSpPick"><div class="tool__tim"><input id="btSpQ" placeholder="Bấm để tìm & chọn sản phẩm (tên, mã)…" autocomplete="off"></div>
        <div class="dt-pick__dd" id="btSpDd" hidden><div class="dt-pick__ds">${SP().map((x) => `<label class="dt-pick__it" data-tim="${esc(khongDau([x.name, x.short, x.id].join(' ')))}"><input type="checkbox" data-bt-sp="${esc(x.id)}" ${(p.sanPham || []).includes(String(x.id)) ? 'checked' : ''}>${anhSP(x, 36)}<span>${esc(x.short || x.name)}</span><small class="muted">${fmt(x.price)}${x.an ? ' · đang ẩn' : ''}</small></label>`).join('')}<p class="muted" id="btSpRong" hidden>Không thấy sản phẩm phù hợp.</p></div></div></div>
      <div class="dt-pick__chon" id="btSpChon"></div>
      <label>Tóm tắt <span class="muted">— hiện ở danh sách bài và kết quả tìm kiếm</span>
        <textarea data-b="excerpt" rows="3">${esc(p.excerpt || '')}</textarea></label>
      <div class="bt-tool"><button type="button" class="btn btn--ghost btn--sm" id="btChenAnh">🖼️ Thêm ảnh vào bài</button><input type="file" id="btMediaFile" accept="image/*" multiple hidden>
        <button type="button" class="btn btn--ghost btn--sm" id="btChenSp">🛍️ Chèn thẻ sản phẩm đã chọn</button>
        <span class="hint">Chọn được nhiều ảnh một lúc. Ảnh chèn ngay dưới dòng con trỏ đang đứng trong ô Nội dung.</span></div>
      <label>Nội dung <span class="muted">— mỗi đoạn một dòng. "## " đầu dòng = tiêu đề nhỏ, "- " = gạch đầu dòng, "![chú thích](img/ảnh.jpg)" = ảnh, "[[sp:mã sản phẩm]]" = thẻ sản phẩm</span>
        <textarea data-b="body" id="btBody" rows="16" class="soan">${esc((p.body || []).join('\n'))}</textarea></label>
      <div id="btMedia"></div>
      <div class="row row-2">
        <div><label>Ảnh đại diện</label>
          <div class="bt-anh"><div class="bt-anh__xem" id="btAnhXem"></div>
            <div class="bt-anh__nut"><div class="drop" id="btAnhDrop">📁 Bấm hoặc kéo ảnh từ máy vào đây để tải lên<input type="file" id="btAnhFile" accept="image/*" hidden></div>
              <input data-b="image" id="btAnh" value="${esc(p.image || '')}" placeholder="hoặc dán đường dẫn ảnh: img/....jpg">
              <button type="button" class="btn btn--ghost btn--sm" id="btAnhBo">Bỏ ảnh</button></div></div></div>
        <label>Màu nền biểu tượng<input data-b="color" value="${esc(p.color || '')}" placeholder="#FFE9EF"></label>
      </div>
      <h4>SEO</h4>
      <div class="row row-2">
        <div><label>Tiêu đề SEO<input data-b="seoTitle" value="${esc(p.seoTitle || '')}" placeholder="${esc(p.title || '')} – Hương Chất Kids" maxlength="70"></label>
          <label>Mô tả SEO<textarea data-b="seoDesc" rows="3" maxlength="170" placeholder="${esc((p.excerpt || '').slice(0, 155))}">${esc(p.seoDesc || '')}</textarea></label></div>
        <div><h4 style="margin-top:0">Xem trước trên Google</h4>
          <div class="goo"><div class="goo__u">huongchatkids.vn › blog</div>
            <div class="goo__t" id="btGooT">${esc(p.seoTitle || (p.title || '') + ' – Hương Chất Kids')}</div>
            <div class="goo__d" id="btGooD">${esc(p.seoDesc || (p.excerpt || '').slice(0, 155))}</div></div></div>
      </div></div>`;
    veChonSp(); xemAnh(p.image || ''); veMedia(); viTri = -1;
  }

  /* Ảnh trong bài (phương tiện): tải nhiều ảnh, chèn dòng "![chú thích](ảnh)" vào chỗ con trỏ, xem / xoá / đặt làm ảnh đại diện */
  const xemTam = {}; // ảnh vừa tải: GitHub Pages cần ~1 phút mới có, nên xem trước bằng file trên máy
  const nguon = (src) => xemTam[src] || src;
  let viTri = -1;
  const veMediaTre = A.tre(() => veMedia(), 400);
  function chenDong(dong) {
    const ta = $('#btBody'); if (!ta || !dong.length) return;
    const v = ta.value; let i = viTri < 0 ? v.length : Math.min(viTri, v.length);
    const cuoi = v.indexOf('\n', i); i = cuoi < 0 ? v.length : cuoi;
    const truoc = v.slice(0, i), them = (truoc && !truoc.endsWith('\n') ? '\n' : '') + dong.join('\n');
    ta.value = truoc + them + v.slice(i); viTri = (truoc + them).length;
    thu(); A.doiDuLieu(); veMedia();
  }
  function veMedia() {
    const el = $('#btMedia'), ta = $('#btBody'); if (!el || !ta) return;
    const anh = []; ta.value.split('\n').forEach((d, i) => { const m = d.trim().match(/^!\[(.*?)\]\((.+?)\)$/); if (m) anh.push({ i, cap: m[1], src: m[2] }); });
    el.innerHTML = anh.length ? `<div class="bt-media"><b>Ảnh trong bài (${anh.length})</b><div class="bt-media__ds">${anh.map((a) => `<figure class="bt-media__it"><img src="${esc(nguon(a.src))}" alt="" onerror="this.style.visibility='hidden'">
      <figcaption title="${esc(a.cap)}">${esc(a.cap || '(chưa có chú thích)')}</figcaption>
      <div><button type="button" class="btn btn--ghost btn--sm" data-bt-dai="${esc(a.src)}">Làm ảnh đại diện</button><button type="button" class="btn btn--ghost btn--sm" data-bt-xa="${a.i}" title="Xoá ảnh khỏi bài">Xoá</button></div></figure>`).join('')}</div></div>` : '';
  }
  async function taiAnhTrongBai(files) {
    files = files.filter((x) => /^image\//.test(x.type)); if (!files.length) return;
    if (!A.ghToken()) { A.toast('Cần mã GitHub để tải ảnh lên (⚙️ Cấu hình → Kết nối GitHub)', 'err'); return; }
    const p = ds()[Number($('#btForm').dataset.idx)]; if (!p) return;
    const dong = [], goc = slug(p.id || 'bai').slice(0, 50) || 'bai';
    try {
      for (let k = 0; k < files.length; k++) {
        A.toast(`Đang tải ảnh ${k + 1}/${files.length}…`);
        const g = await nenAnh(files[k]);
        const duong = await A.taiAnh(g, `blog/${goc}-${Date.now().toString(36)}${k}.${(g.name.split('.').pop() || 'jpg').toLowerCase()}`);
        xemTam[duong] = URL.createObjectURL(g);
        dong.push(`![${(p.title || '').replace(/[\[\]]/g, '')}](${duong})`);
      }
      A.toast(`Đã thêm ${dong.length} ảnh vào bài – sửa chú thích trong ngoặc [ ] nếu cần`, 'ok');
    } catch (err) { A.toast(err.message, 'err'); }
    chenDong(dong);
  }

  /* Ô chọn sản phẩm: danh sách thả xuống có tích chọn, sản phẩm đã chọn hiện thành thẻ */
  const spChon = () => (($('#btSpVal') || {}).value || '').split(',').map((x) => x.trim()).filter(Boolean);
  const moSp = (mo) => { const d = $('#btSpDd'); if (d) d.hidden = !mo; };
  function veChonSp() {
    const el = $('#btSpChon'); if (!el) return;
    el.innerHTML = spChon().map((id) => { const x = SP().find((q) => String(q.id) === id);
      return `<span class="dt-chip">${x ? anhSP(x, 22) : ''}${esc(x ? x.short || x.name : id)}<button type="button" data-bt-bo="${esc(id)}" title="Bỏ sản phẩm">×</button></span>`; }).join('');
  }
  function datSp(a) { $('#btSpVal').value = a.join(', '); veChonSp(); thu(); A.doiDuLieu(); }
  function locSp(q) {
    const k = khongDau(q.trim()); let co = 0;
    $$('#btSpDd .dt-pick__it').forEach((it) => { const ok = !k || it.dataset.tim.includes(k); it.hidden = !ok; if (ok) co++; });
    const r = $('#btSpRong'); if (r) r.hidden = !!co;
  }

  /* Ảnh đại diện: xem trước + tải từ máy lên img/blog/ (ảnh lớn tự thu nhỏ còn tối đa 1600px) */
  function xemAnh(src) {
    const el = $('#btAnhXem'); if (!el) return;
    el.innerHTML = src ? `<img src="${esc(nguon(src))}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'Không xem được ảnh'}))">` : '<span>Chưa có ảnh</span>';
  }
  async function nenAnh(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
    const bmp = await createImageBitmap(file).catch(() => null); if (!bmp) return file;
    const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    if (k === 1 && file.size < 600e3) return file;
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(bmp, 0, 0, c.width, c.height);
    const b = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
    return b && b.size < file.size ? new File([b], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
  }
  async function taiAnhBai(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) { A.toast('Chỉ nhận file ảnh', 'err'); return; }
    if (!A.ghToken()) { A.toast('Cần mã GitHub để tải ảnh lên (⚙️ Cấu hình → Kết nối GitHub)', 'err'); return; }
    const p = ds()[Number($('#btForm').dataset.idx)]; if (!p) return;
    A.toast('Đang tải ảnh lên…');
    try {
      const g = await nenAnh(file);
      const duong = await A.taiAnh(g, `blog/${slug(p.id || 'bai').slice(0, 50) || 'bai'}-${Date.now().toString(36)}.${(g.name.split('.').pop() || 'jpg').toLowerCase()}`);
      $('#btAnh').value = duong; xemTam[duong] = URL.createObjectURL(g); xemAnh(xemTam[duong]); thu(); A.doiDuLieu();
      A.toast('Đã tải ảnh lên – website hiện ảnh sau khoảng 1 phút', 'ok');
    } catch (err) { A.toast(err.message, 'err'); }
  }

  function thu() {
    const f = $('#btForm'); if (!f) return;
    const p = ds()[Number(f.dataset.idx)]; if (!p) return;
    $$('[data-b]', f).forEach((el) => {
      const k = el.dataset.b;
      if (k === 'nhap' || k === 'noiBat') { if (el.checked) p[k] = true; else delete p[k]; return; }
      if (k === 'sanPham') { const a = el.value.split(',').map((x) => x.trim()).filter(Boolean); if (a.length) p.sanPham = a; else delete p.sanPham; return; }
      if (k === 'body') { p.body = el.value.split('\n').map((x) => x.trim()).filter(Boolean); return; }
      const v = el.value.trim();
      if (!v && ['seoTitle', 'seoDesc', 'image', 'color', 'emoji'].includes(k)) delete p[k]; else p[k] = v;
    });
    const t = $('#btGooT'), d = $('#btGooD');
    if (t) t.textContent = p.seoTitle || (p.title || '') + ' – Hương Chất Kids';
    if (d) d.textContent = p.seoDesc || (p.excerpt || '').slice(0, 155);
  }

  document.addEventListener('input', (e) => {
    if (e.target.id === 'btQ') { S.q = e.target.value; return A.tre(() => A.veTrang(), 350)(); }
    if (e.target.id === 'btSpQ') { moSp(true); return locSp(e.target.value); }
    if (e.target.matches('[data-bt-sp], #btAnhFile, #btMediaFile')) return;
    if (e.target.id === 'btBody') { viTri = e.target.selectionStart; veMediaTre(); }
    if (e.target.id === 'btAnh') xemAnh(e.target.value.trim());
    if (e.target.closest('#btForm')) { thu(); A.doiDuLieu(); }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'btCat') { S.cat = e.target.value; return A.veTrang(); }
    if (e.target.id === 'btSpQ') return;
    if (e.target.matches('[data-bt-sp]')) { const id = e.target.dataset.btSp, a = spChon().filter((x) => x !== id); if (e.target.checked) a.push(id); return datSp(a); }
    if (e.target.id === 'btMediaFile') { const fl = Array.from(e.target.files || []); e.target.value = ''; return taiAnhTrongBai(fl); }
    if (e.target.id === 'btAnhFile') { const fl = e.target.files[0]; e.target.value = ''; return taiAnhBai(fl); }
    if (e.target.closest('#btForm')) { thu(); A.doiDuLieu(); }
  });
  document.addEventListener('focusin', (e) => { if (e.target.id === 'btSpQ') moSp(true); });
  document.addEventListener('keyup', (e) => { if (e.target.id === 'btBody') viTri = e.target.selectionStart; });
  document.addEventListener('dragover', (e) => { const d = e.target.closest && e.target.closest('#btAnhDrop'); if (d) { e.preventDefault(); d.classList.add('is-keo'); } });
  document.addEventListener('dragleave', (e) => { const d = e.target.closest && e.target.closest('#btAnhDrop'); if (d) d.classList.remove('is-keo'); });
  document.addEventListener('drop', (e) => { const d = e.target.closest && e.target.closest('#btAnhDrop'); if (!d) return; e.preventDefault(); d.classList.remove('is-keo'); taiAnhBai((e.dataTransfer.files || [])[0]); });
  document.addEventListener('click', async (e) => {
    if ($('#btSpDd')) moSp(!!e.target.closest('#btSpPick'));
    const bo = e.target.closest('[data-bt-bo]');
    if (bo) { const id = bo.dataset.btBo; const cb = $$('[data-bt-sp]').find((c) => c.dataset.btSp === id); if (cb) cb.checked = false; datSp(spChon().filter((x) => x !== id)); return; }
    if (e.target.closest('#btAnhDrop') && e.target.id !== 'btAnhFile') { $('#btAnhFile').click(); return; }
    if (e.target.id === 'btBody') { viTri = e.target.selectionStart; return; }
    if (e.target.id === 'btChenAnh') { $('#btMediaFile').click(); return; }
    if (e.target.id === 'btChenSp') { const ta = $('#btBody'), a = spChon().filter((id) => !ta.value.includes(`[[sp:${id}]]`));
      if (!spChon().length) { A.toast('Chưa chọn sản phẩm nào ở ô “Sản phẩm trong bài”', 'err'); return; }
      if (!a.length) { A.toast('Các sản phẩm đã chọn đều có trong bài rồi'); return; }
      chenDong(a.map((id) => `[[sp:${id}]]`)); A.toast(`Đã chèn ${a.length} thẻ sản phẩm`, 'ok'); return; }
    const dai = e.target.closest('[data-bt-dai]');
    if (dai) { $('#btAnh').value = dai.dataset.btDai; xemAnh(dai.dataset.btDai); thu(); A.doiDuLieu(); A.toast('Đã đặt làm ảnh đại diện', 'ok'); return; }
    const xa = e.target.closest('[data-bt-xa]');
    if (xa) { const ta = $('#btBody'), d = ta.value.split('\n'); d.splice(Number(xa.dataset.btXa), 1); ta.value = d.join('\n'); viTri = -1; thu(); A.doiDuLieu(); veMedia(); return; }
    if (e.target.id === 'btAnhBo') { $('#btAnh').value = ''; xemAnh(''); thu(); A.doiDuLieu(); return; }
    if (e.target.id === 'btThem') {
      const t = 'Bài viết mới';
      ds().unshift({ id: slug(t) + '-' + Date.now().toString(36), title: t, cat: cats()[0] || 'Dinh dưỡng', date: nay(),
        read: '3 phút', emoji: '📄', color: '#FFE9EF', image: '', excerpt: '', body: [], nhap: true });
      A.doiDuLieu(); A.di('#/noi-dung/0'); A.toast('Đã tạo bài nháp – viết xong thì bỏ tick “bản nháp”', 'ok'); return;
    }
    const x = e.target.closest('[data-bt-xoa]');
    if (x) { const i = Number(x.dataset.btXoa);
      const ok = await A.hoi({ tieuDe: 'Xoá bài viết?', noiDung: `Bài <b>${esc(ds()[i].title)}</b> sẽ biến mất khỏi website.`, nutOk: 'Xoá', nguyHiem: true });
      if (!ok) return; ds().splice(i, 1); A.doiDuLieu(); A.di('#/noi-dung'); A.toast('Đã xoá bài viết'); return; }
  });

  A.dangKy({ route: '/noi-dung', ten: 'Nội dung', icon: '📝', nhom: 'website', quyen: 'content.view',
    mo: 'Bài viết Cẩm nang chăm con',
    ve(el, { sub }) { if (sub !== '') veForm(el, Number(sub)); else veDS(el); } });
})();
