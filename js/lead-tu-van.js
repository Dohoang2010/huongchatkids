/* Popup "Nhờ chuyên gia tư vấn" (lead form) – dùng trong bài viết Cẩm nang.
   Gắn vào bất kỳ nút nào có data-lead-tu-van; gửi về Apps Script (action leadTuVan) → sheet "Lead tư vấn".
   Tự điền sẵn tên / SĐT đã lưu và số đo gần nhất từ "Theo dõi sức khỏe con" (nếu mẹ đã dùng). */
(function () {
  const { $, $$, esc, I, toast, phoneOk, Customer, store, hoursNote, openModal, loyaltyApi } = MC;
  const TINH_TRANG = ['Tăng cân', 'Tăng chiều cao', 'Biếng ăn', 'Tiêu hoá, táo bón', 'Hay ốm vặt', 'Ngủ chưa ngon', 'Phát triển trí não'];

  /* Số đo gần nhất từ trang Theo dõi sức khỏe con (chỉ đọc trên máy khách) */
  function soDoDaLuu() {
    try {
      const d = store.get('hck_suckhoe'); if (!d || !d.dob || !Array.isArray(d.log) || !d.log.length) return {};
      const lan = d.log[d.log.length - 1]; const [y, m, n] = d.dob.split('-').map(Number); const nay = new Date();
      let thang = (nay.getFullYear() - y) * 12 + nay.getMonth() - (m - 1); if (nay.getDate() < n) thang--;
      const tuoi = thang < 1 ? 'Dưới 1 tháng' : thang < 24 ? `${thang} tháng` : `${Math.floor(thang / 12)} tuổi${thang % 12 ? ` ${thang % 12} tháng` : ''}`;
      return { tuoi, cao: lan.h, nang: lan.w };
    } catch { return {}; }
  }
  const so = (v) => (v === undefined || v === null || v === '' ? '' : String(v).replace('.', ','));

  function mo(bai) {
    const c = Customer.get() || {}; const sd = soDoDaLuu();
    $('#callbackContent').innerHTML = `<div class="modal__head"><h3>${I.headset}Nhờ chuyên gia tư vấn cho bé</h3><button class="modal__close" type="button" data-close-modal aria-label="Đóng">${I.close}</button></div>
      <div class="modal__body"><form id="ltvForm" class="ltv" novalidate>
        <p class="ltv__dan">Mẹ kể giúp tình trạng của bé, chuyên gia dinh dưỡng sẽ gọi lại tư vấn miễn phí ${hoursNote()}.</p>
        <div class="ltv__hai">
          <div class="field"><label for="ltvTen">Họ tên mẹ <span>*</span></label><input class="input" id="ltvTen" name="ten" autocomplete="name" maxlength="60" value="${esc(c.name || '')}" required></div>
          <div class="field"><label for="ltvSdt">Số điện thoại <span>*</span></label><input class="input" id="ltvSdt" name="sdt" type="tel" inputmode="numeric" autocomplete="tel" maxlength="15" value="${esc(c.phone || '')}" required></div>
        </div>
        <fieldset class="ltv__be"><legend>Thông tin của bé</legend>
          <div class="ltv__so">
            <label class="ltv__o"><span>Tuổi</span><input class="input" name="tuoi" maxlength="40" placeholder="VD: 2 tuổi 3 tháng" value="${esc(sd.tuoi || '')}"></label>
            <label class="ltv__o"><span>Chiều cao</span><span class="ltv__dv"><input class="input" name="cao" inputmode="decimal" maxlength="5" placeholder="86" value="${esc(so(sd.cao))}"><i>cm</i></span></label>
            <label class="ltv__o"><span>Cân nặng</span><span class="ltv__dv"><input class="input" name="nang" inputmode="decimal" maxlength="5" placeholder="11,5" value="${esc(so(sd.nang))}"><i>kg</i></span></label>
          </div>
          ${sd.tuoi ? '<small class="ltv__goc">Đã điền sẵn theo lần đo gần nhất ở Theo dõi sức khỏe con, mẹ sửa nếu cần.</small>' : ''}
        </fieldset>
        <fieldset class="ltv__tt"><legend>Tình trạng mong muốn cải thiện <span>*</span></legend>
          <div class="ltv__chips">${TINH_TRANG.map((t) => `<button type="button" class="chip chip--sm" aria-pressed="false" data-tt="${esc(t)}">${esc(t)}</button>`).join('')}</div>
          <label class="sr-only" for="ltvGhi">Ghi thêm về tình trạng của bé</label>
          <textarea class="input ltv__ghi" id="ltvGhi" name="ghi" rows="2" maxlength="400" placeholder="Ghi thêm: bé ăn uống, ngủ, đi ngoài thế nào…"></textarea>
        </fieldset>
        <div class="form-error hide" id="ltvLoi" role="alert"></div>
        <button class="btn btn--teal btn--lg btn--block" type="submit">${I.phoneCall}Gửi để chuyên gia gọi lại</button>
        <p class="ltv__rieng">Thông tin chỉ dùng để chuyên gia Hương Chất Kids gọi tư vấn cho mẹ.</p>
      </form></div>`;
    openModal('#callbackModal');
    const f = $('#ltvForm');
    setTimeout(() => (c.name ? (c.phone ? $('[data-tt]', f) : f.sdt) : f.ten).focus(), 300);
    f.addEventListener('click', (e) => { const b = e.target.closest('[data-tt]'); if (!b) return; const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); b.classList.toggle('is-active', on); });
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const loi = $('#ltvLoi'); const bao = (t, o) => { loi.textContent = t; loi.classList.remove('hide'); if (o) o.focus(); };
      const ten = f.ten.value.trim(), sdt = f.sdt.value.trim();
      const chon = $$('[data-tt][aria-pressed="true"]', f).map((b) => b.dataset.tt); const ghi = f.ghi.value.trim();
      const tinhTrang = [chon.join(', '), ghi].filter(Boolean).join('. ');
      if (!ten) return bao('Mẹ nhập họ tên giúp shop nhé', f.ten);
      if (!phoneOk(sdt)) return bao('Số điện thoại chưa đúng (10 số, bắt đầu bằng 0)', f.sdt);
      if (!tinhTrang) return bao('Mẹ chọn ít nhất 1 tình trạng hoặc ghi thêm về bé nhé', $('[data-tt]', f));
      loi.classList.add('hide');
      Customer.set({ ...(Customer.get() || {}), name: ten, phone: sdt });
      const nut = $('button[type=submit]', f); nut.disabled = true; nut.textContent = 'Đang gửi…';
      try {
        const r = await loyaltyApi('leadTuVan', { ten, sdt, tuoi: f.tuoi.value.trim(), cao: f.cao.value.trim(), nang: f.nang.value.trim(), tinhTrang, bai: bai.ten || '', link: bai.link || '' });
        if (!r || !r.ok) throw new Error((r && r.msg) || 'Chưa gửi được, mẹ thử lại nhé');
        $('#callbackContent').innerHTML = `<div class="modal__body"><div class="qb__success"><div class="check">${I.check}</div><h3 tabindex="-1">Đã gửi cho chuyên gia!</h3><p>Chuyên gia dinh dưỡng sẽ gọi số <b>${esc(sdt)}</b> ${hoursNote()} để tư vấn cho bé. Mẹ để ý điện thoại nhé 💗</p><div class="actions"><button class="btn btn--primary btn--block" type="button" data-close-modal>Đọc tiếp bài viết</button></div></div></div>`;
        $('#callbackContent h3').focus();
      } catch (err) {
        nut.disabled = false; nut.innerHTML = `${I.phoneCall}Gửi để chuyên gia gọi lại`;
        bao(err.message); toast(err.message, { type: 'err' });
      }
    });
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-lead-tu-van]'); if (!b) return;
    e.preventDefault(); mo({ ten: b.dataset.leadTuVan || document.title, link: location.href.split('#')[0] });
  });
  window.LeadTuVan = { mo };
})();
