/* =====================================================================
   ĐO CHỈ SỐ CHO BỐ MẸ (trang do-chi-so-cho-be.html, khối #boMe)
   Nhập chiều cao, cân nặng (+ vòng eo, tình trạng của mẹ) → BMI theo ngưỡng WHO cho người châu Á
   (WHO Western Pacific 2000: < 18,5 thiếu cân · 18,5–22,9 bình thường · 23–24,9 thừa cân · ≥ 25 béo phì),
   cân nặng hợp lý theo chiều cao, vòng eo (nữ < 80 cm, nam < 90 cm), lượng nước tham khảo.
   Gợi ý sản phẩm cho mẹ lấy thẳng từ PRODUCTS (danh mục cho-me). Chỉ để tham khảo, không thay lời khuyên bác sĩ.
   Số đo chỉ lưu trên máy (localStorage hck_bome) khi khách tích "Lưu lại".
   ===================================================================== */
(function () {
  'use strict';
  const root = document.getElementById('boMe');
  if (!root || !window.MC) return;
  const { esc, productCard } = MC;
  const KHOA = 'hck_bome';
  /* Ảnh nhân vật 3D (cùng bộ với ảnh bé). bo: chưa có ảnh → hiện biểu tượng; có ảnh thì đặt img/bo-me/bo.webp và điền vào đây */
  const ANH = { me: 'img/bo-me/me-be.webp', thai: 'img/bo-me/me-bau.webp', bo: '' };
  const anhCho = (ai, tt) => (ai === 'bo' ? ANH.bo : tt === 'thai' ? ANH.thai : ANH.me);
  function doiHinh(ai, tt) { const h = document.getElementById('bmHinh'); if (!h) return; const u = anhCho(ai, tt); const cu = h.querySelector("img"); if (u && cu && cu.getAttribute("src") === u) return;
    h.innerHTML = u ? `<img src="${u}" width="222" height="600" alt="" decoding="async">` : ''; h.hidden = !u; }
  const so = (x, n = 1) => Number(x).toLocaleString('vi-VN', { maximumFractionDigits: n });
  const docSo = (s) => { const x = parseFloat(String(s || '').replace(',', '.')); return isFinite(x) ? x : NaN; };
  const doc = () => { try { return JSON.parse(localStorage.getItem(KHOA)) || null; } catch { return null; } };
  const ghi = (v) => { try { localStorage.setItem(KHOA, JSON.stringify(v)); } catch { /* ẩn danh */ } };
  const xoa = () => { try { localStorage.removeItem(KHOA); } catch { /* */ } };

  /* ---------------- Tính toán ---------------- */
  const MUC = [
    { max: 18.5, ten: 'Thiếu cân', tone: 'warn' },
    { max: 23, ten: 'Bình thường', tone: 'good' },
    { max: 25, ten: 'Thừa cân', tone: 'warn' },
    { max: 30, ten: 'Béo phì độ I', tone: 'bad' },
    { max: Infinity, ten: 'Béo phì độ II', tone: 'bad' },
  ];
  function tinh({ ai, tuoi, h, w, eo, tt }) {
    const m = h / 100, bmi = w / (m * m);
    const muc = MUC.find((x) => bmi < x.max);
    const nangTu = 18.5 * m * m, nangDen = 22.9 * m * m;
    const nguongEo = ai === 'me' ? 80 : 90;
    const nuoc = Math.round((w * 35 + (tt === 'bu' ? 700 : tt === 'thai' ? 300 : 0)) / 100) / 10; // lít / ngày
    return { bmi, muc, nangTu, nangDen, eoCao: eo ? eo >= nguongEo : null, nguongEo, nuoc, chenh: w < nangTu ? w - nangTu : w > nangDen ? w - nangDen : 0, coThai: tt === 'thai', tuoi };
  }

  /* Lời khuyên chung theo mức BMI và tình trạng (khuyến nghị chung của WHO / Viện Dinh dưỡng) */
  function loiKhuyen(k, d) {
    const ds = [];
    if (k.coThai) {
      ds.push(['🤰', 'Tăng cân khi mang thai theo hướng dẫn của bác sĩ sản khoa – mức tăng hợp lý tuỳ cân nặng trước khi mang thai.']);
      ds.push(['🥗', 'Ăn đủ bữa, đa dạng thực phẩm; bổ sung sắt, acid folic theo chỉ định của bác sĩ.']);
      ds.push(['🚶‍♀️', 'Đi bộ nhẹ nhàng 20–30 phút mỗi ngày nếu bác sĩ không dặn khác.']);
      return ds;
    }
    if (d.tt === 'bu') ds.push(['🤱', 'Đang cho con bú: mẹ ăn đủ bữa, uống nhiều nước, không ăn kiêng giảm cân cấp tốc để giữ sữa cho bé.']);
    if (d.tt === 'sinh') ds.push(['🌸', 'Mới sinh dưới 6 tháng: cơ thể đang hồi phục, mẹ ưu tiên nghỉ ngơi, ăn đủ chất, vận động nhẹ khi bác sĩ cho phép.']);
    if (k.muc.ten === 'Thiếu cân') {
      ds.push(['🍚', 'Chia 3 bữa chính + 2 bữa phụ, tăng thêm đạm (trứng, thịt, cá, sữa) và chất béo tốt (dầu ăn, hạt, bơ).']);
      ds.push(['😴', 'Ngủ đủ 7–8 tiếng; nếu sụt cân không rõ lý do, nên đi khám.']);
    } else if (k.muc.ten === 'Bình thường') {
      ds.push(['✅', 'Cân nặng đang hợp lý – giữ nếp ăn đa dạng, nhiều rau xanh, trái cây, đủ đạm.']);
      ds.push(['🏃', 'Vận động ít nhất 150 phút mỗi tuần (khoảng 30 phút × 5 ngày) để giữ dáng và khoẻ tim mạch.']);
    } else {
      ds.push(['🥦', 'Giảm đồ ngọt, nước ngọt, đồ chiên; ăn nhiều rau, ưu tiên đạm nạc; ăn chậm, đủ bữa.']);
      ds.push(['🏃', 'Vận động 150–300 phút mỗi tuần, đi bộ nhanh là cách dễ bắt đầu nhất.']);
      if (k.muc.tone === 'bad') ds.push(['🩺', 'Nên kiểm tra sức khoẻ định kỳ (huyết áp, đường huyết, mỡ máu) và hỏi bác sĩ về cách giảm cân an toàn.']);
    }
    if (k.eoCao) ds.push(['📏', `Vòng eo từ ${k.nguongEo} cm trở lên: mỡ bụng nhiều – mẹ chú ý ăn uống, vận động đều.`]);
    ds.push(['💧', `Uống khoảng ${so(k.nuoc)} lít nước mỗi ngày (gồm cả canh, sữa).`]);
    return ds;
  }

  /* ---------------- Gợi ý sản phẩm cho mẹ ---------------- */
  const NHOM_ME = [
    { ma: 'da', ten: '✨ Dưỡng da & chống nắng', loc: (p) => p.cosmetic && /kem|serum|mặt nạ|xịt|son|meso|peel|toner|chống nắng|dưỡng/i.test(p.name) },
    { ma: 'trong', ten: '🌿 Chăm sóc từ bên trong', loc: (p) => !p.cosmetic && /collagen|nmn|nghệ|curcumin|men vi sinh|viên uống/i.test(p.name) },
    { ma: 'than', ten: '🛁 Cơ thể, tóc & thư giãn', loc: (p) => /sữa tắm|dầu gội|thảm|trắng răng|vệ sinh/i.test(p.name) },
  ];
  /* Đang mang thai / cho con bú: không gợi ý sản phẩm cần hỏi bác sĩ trước (retinol, peel, meso, viên uống bổ sung) */
  const CAN_HOI = /retinol|peel|meso|nmn|nghệ|curcumin|collagen|men vi sinh|viên uống|trắng răng/i;
  function spMe(tt) {
    const ds = (window.PRODUCTS || []).filter((p) => p.cat === 'cho-me' && p.stock !== 0 && !p.an);
    const tranh = tt === 'thai' || tt === 'bu';
    return NHOM_ME.map((n) => ({ ...n, sp: ds.filter((p) => n.loc(p) && !(tranh && CAN_HOI.test(p.name))).sort(MC.rankDefault || (() => 0)).slice(0, 8) })).filter((n) => n.sp.length);
  }
  function spCaNha() {
    return (window.PRODUCTS || []).filter((p) => (p.cat === 'thuc-pham' || p.cat === 'do-an') && p.stock !== 0 && !p.an).sort(MC.rankDefault || (() => 0)).slice(0, 8);
  }

  /* ---------------- Giao diện ---------------- */
  /* Mẹ và bố có ô nhập + kết quả riêng: bấm chuyển người là form trống để điền mới, quay lại vẫn còn số của người kia */
  const S = { ai: 'me', nhom: 'da', ng: { me: { o: { tt: 'binh' }, kq: null }, bo: { o: {}, kq: null } } };
  const daLuu = doc();
  if (daLuu) {
    if (daLuu.me || daLuu.bo) { S.ai = daLuu.ai === 'bo' ? 'bo' : 'me'; ['me', 'bo'].forEach((a) => { if (daLuu[a]) S.ng[a].o = { ...daLuu[a] }; }); }
    else { const a = daLuu.ai === 'bo' ? 'bo' : 'me'; S.ai = a; S.ng[a].o = { ...daLuu }; }   // kiểu lưu cũ (1 người)
  }
  const cur = () => S.ng[S.ai];
  const ttHt = () => (S.ai === 'bo' ? 'binh' : cur().o.tt || 'binh');
  /* giữ lại những gì đang gõ dở của người hiện tại trước khi chuyển người */
  function giuDangGo() { const f = document.getElementById('bmForm'); if (!f) return; const o = cur().o; ['h', 'w', 'tuoi', 'eo'].forEach((k) => { o[k] = f.elements[k].value; }); }

  function veForm() {
    const d = cur().o;
    return `<form class="bm-form" id="bmForm" novalidate>
      <div class="bm-ai chips" role="radiogroup" aria-label="Đo cho ai">
        <label class="chip ${S.ai === 'me' ? 'is-active' : ''}"><input type="radio" name="ai" value="me" ${S.ai === 'me' ? 'checked' : ''}>👩 Mẹ</label>
        <label class="chip ${S.ai === 'bo' ? 'is-active' : ''}"><input type="radio" name="ai" value="bo" ${S.ai === 'bo' ? 'checked' : ''}>👨 Bố</label>
      </div>
      <div class="bm-o">
        <div class="field"><label for="bmH">Chiều cao (cm) <span>*</span></label><input class="input" id="bmH" name="h" inputmode="decimal" autocomplete="off" placeholder="VD: 158" value="${esc(d.h || '')}"><small class="form-error" data-err="h"></small></div>
        <div class="field"><label for="bmW">Cân nặng (kg) <span>*</span></label><input class="input" id="bmW" name="w" inputmode="decimal" autocomplete="off" placeholder="VD: 52,5" value="${esc(d.w || '')}"><small class="form-error" data-err="w"></small></div>
        <div class="field"><label for="bmT">Tuổi <small class="bm-tuy">Không bắt buộc</small></label><input class="input" id="bmT" name="tuoi" inputmode="numeric" autocomplete="off" placeholder="VD: 30" value="${esc(d.tuoi || '')}"><small class="form-error" data-err="tuoi"></small></div>
        <div class="field"><label for="bmE">Vòng eo (cm) <small class="bm-tuy">Không bắt buộc</small></label><input class="input" id="bmE" name="eo" inputmode="decimal" autocomplete="off" placeholder="VD: 75" value="${esc(d.eo || '')}"><small class="hk-help">Đo ngang rốn, đứng thẳng, thở ra nhẹ. Bỏ trống nếu chưa đo.</small><small class="form-error" data-err="eo"></small></div>
      </div>
      <fieldset class="bm-tt" ${S.ai === 'me' ? '' : 'hidden'}><legend>Mẹ đang</legend>
        <div class="chips">${[['binh', 'Bình thường'], ['thai', 'Mang thai'], ['bu', 'Cho con bú'], ['sinh', 'Mới sinh < 6 tháng']].map(([v, t]) => `<label class="chip ${ttHt() === v ? 'is-active' : ''}"><input type="radio" name="tt" value="${v}" ${ttHt() === v ? 'checked' : ''}>${t}</label>`).join('')}</div>
      </fieldset>
      <label class="hk-luu"><input type="checkbox" name="luu" value="1" ${daLuu ? 'checked' : ''}><span><b>Lưu lại trên máy này</b><small>Lần sau mở trang là có sẵn số đo, không gửi đi đâu.</small></span></label>
      <button class="btn btn--primary btn--lg bm-nut" type="submit">Xem kết quả</button>
    </form>`;
  }

  function thang(bmi) {
    /* thước BMI 15 → 35 */
    const vi = (x) => Math.max(0, Math.min(100, (x - 15) / 20 * 100));
    return `<div class="bm-thuoc" aria-hidden="true">
      <div class="bm-thuoc__vach"><i style="width:${vi(18.5)}%" class="warn"></i><i style="width:${vi(23) - vi(18.5)}%" class="good"></i><i style="width:${vi(25) - vi(23)}%" class="warn"></i><i style="width:${100 - vi(25)}%" class="bad"></i></div>
      <span class="bm-thuoc__kim" style="left:${vi(bmi)}%"></span>
      <div class="bm-thuoc__so"><span style="left:${vi(18.5)}%">18,5</span><span style="left:${vi(23)}%">23</span><span style="left:${vi(25)}%">25</span></div>
    </div>`;
  }

  function veKetQua(d, k) {
    const ten = d.ai === 'me' ? 'mẹ' : 'bố';
    const nhom = d.ai === 'me' ? spMe(d.tt) : [];
    if (nhom.length && !nhom.some((n) => n.ma === S.nhom)) S.nhom = nhom[0].ma;
    const nhomDang = nhom.find((n) => n.ma === S.nhom);
    const caNha = spCaNha();
    return `<div class="bm-kq" id="bmKq" tabindex="-1">
      <div class="bm-kq__dau">
        <div class="bm-bmi bm-bmi--${k.coThai ? 'info' : k.muc.tone}"><small>BMI của ${ten}</small><b>${so(k.bmi)}</b><span>${k.coThai ? 'Đang mang thai' : esc(k.muc.ten)}</span></div>
        <div class="bm-kq__txt">
          ${k.coThai ? `<p>Khi mang thai, cân nặng tăng theo thai kỳ nên <b>BMI không dùng để đánh giá như bình thường</b>. Mẹ theo dõi mức tăng cân với bác sĩ sản khoa nhé.</p>`
            : `<p>Với chiều cao <b>${so(d.h, 0)} cm</b>, cân nặng hợp lý của ${ten} khoảng <b>${so(k.nangTu)} – ${so(k.nangDen)} kg</b>${k.chenh ? ` · hiện ${k.chenh > 0 ? 'cao hơn' : 'thấp hơn'} khoảng <b>${so(Math.abs(k.chenh))} kg</b>` : ' · đang trong khoảng này 👍'}.</p>`}
          ${thang(k.bmi)}
        </div>
      </div>
      <div class="bm-chi">
        <div class="bm-chi__o"><small>Cân nặng hợp lý</small><b>${so(k.nangTu)}–${so(k.nangDen)} kg</b></div>
        <div class="bm-chi__o ${k.eoCao ? 'is-warn' : ''}"><small>Vòng eo</small><b>${d.eo ? so(d.eo) + ' cm' : '—'}</b><span>${d.eo ? (k.eoCao ? `từ ${k.nguongEo} cm: cần chú ý` : `dưới ${k.nguongEo} cm: tốt`) : 'không bắt buộc'}</span></div>
        <div class="bm-chi__o"><small>Nước mỗi ngày</small><b>~${so(k.nuoc)} lít</b></div>
      </div>
      <div class="hk-block"><div class="hk-block__head"><h3>Lời khuyên cho ${ten}</h3></div>
        <ul class="bm-lk">${loiKhuyen(k, d).map(([ic, t]) => `<li><span>${ic}</span>${esc(t)}</li>`).join('')}</ul></div>
      ${nhom.length ? `<div class="hk-block">
        <div class="hk-block__head"><h3>Gợi ý cho mẹ</h3><p>Sản phẩm chính hãng dành riêng cho mẹ – thông tin theo nhà sản xuất${d.tt === 'thai' || d.tt === 'bu' ? '. Mẹ đang mang thai / cho con bú: đã ẩn sản phẩm cần hỏi bác sĩ trước khi dùng' : ''}</p></div>
        <div class="chips bm-nhom" role="tablist">${nhom.map((n) => `<button type="button" class="chip ${n.ma === S.nhom ? 'is-active' : ''}" role="tab" aria-selected="${n.ma === S.nhom}" data-bm-nhom="${n.ma}">${n.ten} <b>${n.sp.length}</b></button>`).join('')}</div>
        <div class="row-scroll" id="bmSp">${nhomDang ? nhomDang.sp.map((p) => productCard(p)).join('') : ''}</div>
        <a class="link hk-all" href="collections.html?cat=cho-me">Xem tất cả sản phẩm cho mẹ →</a>
      </div>` : ''}
      ${caNha.length ? `<div class="hk-block">
        <div class="hk-block__head"><h3>${d.ai === 'me' ? 'Món ngon cho cả nhà' : 'Gợi ý cho bố & cả nhà'}</h3><p>Thực phẩm gia đình, đồ ăn vặt chất lượng tại Hương Chất Kids</p></div>
        <div class="row-scroll">${caNha.map((p) => productCard(p)).join('')}</div>
      </div>` : ''}
      <p class="bm-foot">Kết quả tính theo ngưỡng BMI của WHO cho người châu Á, chỉ để tham khảo, không thay thế khám và tư vấn của bác sĩ. Thực phẩm bảo vệ sức khoẻ không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh.</p>
    </div>`;
  }

  function ve() {
    const c = cur();
    root.querySelector('.bm-vung').innerHTML = veForm() + (c.kq ? veKetQua(c.kq.d, c.kq.k) : '');
    doiHinh(S.ai, ttHt());
  }

  function gui(f) {
    const fd = new FormData(f), d = { ai: fd.get('ai') || 'me', tt: fd.get('ai') === 'bo' ? 'binh' : (fd.get('tt') || 'binh'), h: docSo(fd.get('h')), w: docSo(fd.get('w')), tuoi: docSo(fd.get('tuoi')), eo: docSo(fd.get('eo')) };
    const loi = {};
    if (!(d.h >= 120 && d.h <= 220)) loi.h = 'Chiều cao từ 120 đến 220 cm';
    if (!(d.w >= 30 && d.w <= 200)) loi.w = 'Cân nặng từ 30 đến 200 kg';
    if (fd.get('tuoi') && !(d.tuoi >= 18 && d.tuoi <= 90)) loi.tuoi = 'Công cụ dành cho người từ 18 tuổi';
    if (fd.get('eo') && !(d.eo >= 40 && d.eo <= 200)) loi.eo = 'Vòng eo từ 40 đến 200 cm';
    f.querySelectorAll('[data-err]').forEach((el) => { el.textContent = loi[el.dataset.err] || ''; });
    f.querySelectorAll('.input').forEach((el) => { el.classList.toggle('is-invalid', !!loi[el.name]); el.setAttribute('aria-invalid', loi[el.name] ? 'true' : 'false'); });
    if (Object.keys(loi).length) { const o = f.querySelector('.is-invalid'); if (o) o.focus(); return; }
    if (!isFinite(d.tuoi)) d.tuoi = ''; if (!isFinite(d.eo)) d.eo = '';
    S.ai = d.ai; S.ng[d.ai].o = { tt: d.tt, h: d.h, w: d.w, tuoi: d.tuoi, eo: d.eo }; S.ng[d.ai].kq = { d, k: tinh(d) };
    const coSo = (o) => (o && o.h && o.w ? { ...o } : undefined);
    if (fd.get('luu')) ghi({ ai: d.ai, me: coSo(S.ng.me.kq && S.ng.me.o), bo: coSo(S.ng.bo.kq && S.ng.bo.o) }); else xoa();
    ve();
    const kq = document.getElementById('bmKq');
    if (kq) { kq.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); kq.focus({ preventScroll: true }); }
  }

  root.addEventListener('submit', (e) => { if (e.target.id === 'bmForm') { e.preventDefault(); gui(e.target); } });
  root.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'ai' || t.name === 'tt') {
      t.closest('.chips').querySelectorAll('.chip').forEach((c) => c.classList.toggle('is-active', c.contains(t)));
      if (t.name === 'ai') { if (t.value !== S.ai) { giuDangGo(); S.ai = t.value; ve(); const h = document.getElementById('bmH'); if (h) h.focus({ preventScroll: true }); } return; }
      if (t.name === 'tt') cur().o.tt = t.value;
      doiHinh(S.ai, ttHt());
    }
  });
  root.addEventListener('click', (e) => {
    const n = e.target.closest('[data-bm-nhom]'); if (!n || !cur().kq) return;
    S.nhom = n.dataset.bmNhom;
    const nhom = spMe(cur().kq.d.tt).find((x) => x.ma === S.nhom);
    root.querySelectorAll('[data-bm-nhom]').forEach((b) => { const on = b === n; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    const el = document.getElementById('bmSp'); if (el && nhom) { el.innerHTML = nhom.sp.map((p) => productCard(p)).join(''); el.scrollLeft = 0; }
  });

  ve();
  window.BO_ME = { tinh, MUC };   // dùng cho kiểm thử
})();
