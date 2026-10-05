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
      <label>Sản phẩm trong bài <span class="muted">— mã sản phẩm, cách nhau dấu phẩy</span><input data-b="sanPham" value="${esc((p.sanPham || []).join(', '))}" placeholder="VD: 41353214697, men-sysy"></label>
      <label>Tóm tắt <span class="muted">— hiện ở danh sách bài và kết quả tìm kiếm</span>
        <textarea data-b="excerpt" rows="3">${esc(p.excerpt || '')}</textarea></label>
      <label>Nội dung <span class="muted">— mỗi đoạn một dòng. "## " đầu dòng = tiêu đề nhỏ, "- " = gạch đầu dòng, "![chú thích](img/ảnh.jpg)" = ảnh, "[[sp:mã sản phẩm]]" = thẻ sản phẩm</span>
        <textarea data-b="body" rows="16" class="soan">${esc((p.body || []).join('\n'))}</textarea></label>
      <div class="row row-2">
        <label>Ảnh đại diện<input data-b="image" value="${esc(p.image || '')}" placeholder="img/thumb/....jpg"></label>
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
    if (e.target.closest('#btForm')) { thu(); A.doiDuLieu(); }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'btCat') { S.cat = e.target.value; return A.veTrang(); }
    if (e.target.closest('#btForm')) { thu(); A.doiDuLieu(); }
  });
  document.addEventListener('click', async (e) => {
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
