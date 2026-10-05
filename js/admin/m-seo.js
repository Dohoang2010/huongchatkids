/* ===== SEO – sửa tiêu đề & mô tả của từng trang, ghi thẳng vào file HTML ===== */
(() => {
  'use strict';
  const A = window.ADMIN, { $, $$, esc } = A;

  const TRANG = [
    { f: 'index.html', t: 'Trang chủ', u: '' },
    { f: 'collections.html', t: 'Tất cả sản phẩm', u: 'collections.html' },
    { f: 'product.html', t: 'Trang sản phẩm', u: 'product.html' },
    { f: 'blog.html', t: 'Cẩm nang chăm con', u: 'blog.html' },
    { f: 'gioi-thieu.html', t: 'Giới thiệu', u: 'gioi-thieu.html' },
    { f: 'policy.html', t: 'Chính sách', u: 'policy.html' },
    { f: 'cart.html', t: 'Giỏ hàng', u: 'cart.html' },
    { f: 'checkout.html', t: 'Thanh toán', u: 'checkout.html' },
    { f: 'account.html', t: 'Thông tin khách hàng', u: 'account.html' },
  ];
  let kho = null;          // { file: {title, desc, sha, src} }
  let dangSua = {};        // thay đổi chưa ghi

  async function ve(el) {
    $('#pageAct').innerHTML = `<button class="btn btn--ghost" id="seoTai">↻ Tải lại</button>
      <button class="btn btn--primary" id="seoLuu" disabled>Ghi lên website</button>`;
    el.innerHTML = A.dangTai('thẻ SEO của các trang');
    if (!A.ghToken()) { el.innerHTML = `<div class="card err-box"><h3>🔑 Cần mã GitHub</h3>
      <p>Thẻ SEO nằm trong file HTML nên phải đọc/ghi qua GitHub. Vào <a href="#/cau-hinh/github">Cấu hình → Kết nối GitHub</a> dán mã trước nhé.</p></div>`; return; }
    try {
      if (!kho) {
        kho = {};
        for (const t of TRANG) {
          const f = await A.ghDoc(t.f);
          const src = A.unb64(f.content);
          kho[t.f] = { sha: f.sha, src, ...doc(src) };
        }
      }
      veBang(el);
    } catch (e) { el.innerHTML = A.loiTai(e.message); }
  }

  function doc(src) {
    const khoi = (src.match(/<!-- ADMIN:SEO[\s\S]*?<!-- \/ADMIN:SEO -->/) || [''])[0];
    const title = (khoi.match(/<title>([\s\S]*?)<\/title>/) || [, ''])[1].trim();
    const desc = (khoi.match(/<meta name="description" content="([\s\S]*?)">/) || [, ''])[1].trim();
    return { title, desc };
  }

  function veBang(el) {
    const cur = TRANG[0].f;
    el.innerHTML = `<div class="card">
      <p class="muted">Tiêu đề và mô tả hiện ra trên Google. Sửa xong bấm <b>Ghi lên website</b> — phần này ghi thẳng vào file HTML nên không dùng nút Xuất bản chung.</p>
      <div class="seo-grid">
        <div class="seo-ds">${TRANG.map((t, i) => `<button class="seo-i ${i === 0 ? 'is-on' : ''}" data-seo="${t.f}">
          <b>${esc(t.t)}</b><small>${esc(t.f)}</small>${dangSua[t.f] ? '<em>●</em>' : ''}</button>`).join('')}</div>
        <div id="seoForm"></div>
      </div></div>`;
    veForm(cur);
  }

  function veForm(file) {
    const t = TRANG.find((x) => x.f === file); const k = kho[file];
    const v = dangSua[file] || { title: k.title, desc: k.desc };
    $('#seoForm').innerHTML = `
      <h3>${esc(t.t)}</h3>
      <label>Tiêu đề SEO <span class="muted" id="seoTL">(${v.title.length}/60)</span>
        <input id="seoT" value="${esc(v.title)}" maxlength="75"></label>
      <label>Mô tả SEO <span class="muted" id="seoDL">(${v.desc.length}/155)</span>
        <textarea id="seoD" rows="3" maxlength="180">${esc(v.desc)}</textarea></label>
      <h4>Xem trước trên Google</h4>
      <div class="goo"><div class="goo__u">huongchatkids.vn${t.u ? ' › ' + t.u.replace('.html', '') : ''}</div>
        <div class="goo__t" id="gT">${esc(v.title)}</div><div class="goo__d" id="gD">${esc(v.desc)}</div></div>
      <div class="box-note">Nên: tiêu đề 50–60 ký tự, mô tả 120–155 ký tự, có tên thương hiệu và từ khoá chính.</div>`;
    $('#seoForm').dataset.file = file;
  }

  document.addEventListener('input', (e) => {
    const box = $('#seoForm'); if (!box || !box.dataset.file) return;
    if (e.target.id !== 'seoT' && e.target.id !== 'seoD') return;
    const file = box.dataset.file;
    const v = { title: $('#seoT').value, desc: $('#seoD').value };
    const g = kho[file];
    if (v.title === g.title && v.desc === g.desc) delete dangSua[file]; else dangSua[file] = v;
    $('#gT').textContent = v.title; $('#gD').textContent = v.desc;
    $('#seoTL').textContent = `(${v.title.length}/60)`;
    $('#seoDL').textContent = `(${v.desc.length}/155)`;
    $('#seoLuu').disabled = !Object.keys(dangSua).length;
    $$('.seo-i').forEach((b) => { const f = b.dataset.seo; const em = b.querySelector('em');
      if (dangSua[f] && !em) b.insertAdjacentHTML('beforeend', '<em>●</em>');
      if (!dangSua[f] && em) em.remove(); });
  });

  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-seo]');
    if (b) { $$('.seo-i').forEach((x) => x.classList.toggle('is-on', x === b)); veForm(b.dataset.seo); return; }
    if (e.target.id === 'seoTai') { kho = null; dangSua = {}; return A.veTrang(); }
    if (e.target.id === 'seoLuu') {
      const files = Object.keys(dangSua);
      const ok = await A.hoi({ tieuDe: 'Ghi thẻ SEO lên website?', noiDung: `Cập nhật ${files.length} trang: <b>${files.join(', ')}</b>.`, nutOk: 'Ghi lên web' });
      if (!ok) return;
      const btn = $('#seoLuu'); btn.disabled = true; btn.textContent = 'Đang ghi…';
      try {
        for (const f of files) {
          const k = kho[f]; const v = dangSua[f];
          const moi = `<!-- ADMIN:SEO (trang quản trị ghi đè khối này) -->\n  <title>${v.title}</title>\n  <meta name="description" content="${v.desc.replace(/"/g, '&quot;')}">\n  <!-- /ADMIN:SEO -->`;
          const src = k.src.replace(/<!-- ADMIN:SEO[\s\S]*?<!-- \/ADMIN:SEO -->/, () => moi);
          const r = await A.ghGhi(f, A.b64(src), k.sha, 'Quản trị: cập nhật SEO ' + f);
          kho[f] = { sha: r.content.sha, src, title: v.title, desc: v.desc };
          delete dangSua[f];
        }
        A.toast('Đã ghi SEO lên website 🎉', 'ok'); A.veTrang();
      } catch (err) { A.toast(err.message, 'err'); btn.disabled = false; btn.textContent = 'Ghi lên website'; }
    }
  });

  A.dangKy({ route: '/seo', ten: 'SEO', icon: '🔍', nhom: 'website', quyen: 'seo.view', mo: 'Tiêu đề và mô tả hiện trên Google', ve });
})();
