/* Bản demo (mở bằng ?demo): máy chủ giả chạy ngay trong trình duyệt, dữ liệu mẫu chỉ lưu trên máy này.
   Đăng nhập bằng: sep, troly, minh (thành viên) hoặc admin; mật khẩu gõ gì cũng được. */
'use strict';
(() => {
  if (!/[?&]demo\b/.test(location.search)) return;
  const KHOA = 'ltd_db3';
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const cong = k => { const d = new Date(); d.setDate(d.getDate() + k); return ymd(d); };
  const bayGio = (k = 0) => { const d = new Date(Date.now() + k); return `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  const thu2 = (() => { const d = new Date(); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return ymd(d); })();
  const kenhRieng = (a, b) => 'dm:' + [a, b].sort().join(':');

  function taoMau() {
    const h = cong(0), ev = (id, o) => Object.assign({ id, caNgay: false, diaDiem: '', lap: '', lapDen: '', nhac: 15, ghiChu: '', taoBoi: 'troly', suaBoi: 'troly', capNhat: bayGio(-86400000) }, o);
    return {
      nguoi: [
        { id: 'admin', tenDN: 'admin', ten: 'Quản trị viên', chucVu: 'Admin', mau: '#8e8e93', admin: true, khoa: false, daXoa: false },
        { id: 'sep', tenDN: 'sep', ten: 'Anh Hoàng', chucVu: 'Sếp', job: 'Điều hành chung', mau: '#ff9500', admin: false, khoa: false, daXoa: false },
        { id: 'troly', tenDN: 'troly', ten: 'Chị Lan', chucVu: 'Trợ lý', job: 'Lịch hẹn & giấy tờ', mau: '#007aff', admin: false, khoa: false, daXoa: false },
        { id: 'minh', tenDN: 'minh', ten: 'Minh', chucVu: 'Nhân viên', job: 'Kho & giao hàng', mau: '#af52de', admin: false, khoa: false, daXoa: false }
      ],
      ver: 1, verNguoi: 1,
      lich: [
        ev('D1', { tieuDe: 'Họp giao ban đầu tuần', bd: `${thu2}T08:30`, kt: `${thu2}T09:30`, diaDiem: 'Phòng họp tầng 3', lich: 'chung', lap: 'tuan', ghiChu: 'Mỗi người báo cáo kết quả tuần trước' }),
        ev('D2', { tieuDe: 'Gặp đối tác Shopee', bd: `${h}T14:00`, kt: `${h}T15:30`, diaDiem: 'The Coffee House – Nguyễn Huệ', lich: 'sep', nhac: 30, ghiChu: 'Mang hợp đồng bản cứng' }),
        ev('D3', { tieuDe: 'Đặt vé máy bay đi Hà Nội', bd: `${h}T10:00`, kt: `${h}T10:30`, lich: 'troly', taoBoi: 'sep', suaBoi: 'sep' }),
        ev('D4', { tieuDe: 'Ký hợp đồng nhà cung cấp vải', bd: `${cong(1)}T09:00`, kt: `${cong(1)}T10:00`, diaDiem: 'Văn phòng công ty', lich: 'sep' }),
        ev('D5', { tieuDe: 'Giao hàng cho khách sỉ', bd: `${cong(1)}T15:00`, kt: `${cong(1)}T16:00`, diaDiem: 'Kho Bình Tân', lich: 'minh' }),
        ev('D6', { tieuDe: 'Phỏng vấn nhân viên bán hàng', bd: `${cong(2)}T15:00`, kt: `${cong(2)}T16:30`, lich: 'chung', nhac: 60 }),
        ev('D7', { tieuDe: 'Công tác Hà Nội', caNgay: true, bd: `${cong(6)}T00:00`, kt: `${cong(8)}T23:59`, diaDiem: 'Hà Nội', lich: 'sep', nhac: 1440, taoBoi: 'sep', suaBoi: 'sep' }),
        ev('D8', { tieuDe: 'Kiểm kho cuối tháng', caNgay: true, bd: `${h.slice(0, 8)}25T00:00`, kt: `${h.slice(0, 8)}25T23:59`, lich: 'minh', lap: 'thang', nhac: 0 })
      ],
      tin: [
        { id: 1, t: `${cong(-1)}T16:21:00`, tu: 'troly', nd: 'Em đã đặt lịch gặp đối tác Shopee chiều nay 14h ạ', lichId: '', kenh: kenhRieng('sep', 'troly') },
        { id: 2, t: `${cong(-1)}T16:21:30`, tu: 'troly', nd: '', lichId: 'D2', kenh: kenhRieng('sep', 'troly') },
        { id: 3, t: `${cong(-1)}T16:40:00`, tu: 'sep', nd: 'Ok em. Nhớ chuẩn bị hợp đồng nhé', lichId: '', kenh: kenhRieng('sep', 'troly') },
        { id: 4, t: `${h}T07:45:00`, tu: 'sep', nd: 'Chào cả nhà, tuần này mình tập trung chốt đơn sỉ nhé 💪', lichId: '', kenh: 'nhom' },
        { id: 5, t: `${h}T07:50:00`, tu: 'minh', nd: 'Dạ anh, mai em giao lô hàng cho khách sỉ ạ', lichId: '', kenh: 'nhom' },
        { id: 7, t: `${h}T08:10:00`, tu: 'troly', nd: '', lichId: '', kenh: 'nhom', loai: 'binhchon', dl: { cauHoi: 'Liên hoan cuối tháng ăn gì cả nhà?', luaChon: ['Lẩu', 'Nướng', 'Hải sản'], nhieu: false }, tt: { phieu: { minh: [1], troly: [0] }, cam: { minh: '👍' } } },
        { id: 6, t: `${h}T08:02:00`, tu: 'troly', nd: 'Dạ vâng anh. Vé đi Hà Nội em đặt chuyến 7h sáng được không ạ?', lichId: '', kenh: kenhRieng('sep', 'troly') }
      ],
      daDoc: { [`sep|${kenhRieng('sep', 'troly')}`]: 3, [`troly|${kenhRieng('sep', 'troly')}`]: 6, 'sep|nhom': 4, 'minh|nhom': 5, 'troly|nhom': 5 },
      tiepId: 10, verTT: 1
    };
  }
  const doc = () => { try { const s = localStorage.getItem(KHOA); if (s) return JSON.parse(s); } catch (e) { /* bỏ qua */ } return taoMau(); };
  const ghi = db => { try { localStorage.setItem(KHOA, JSON.stringify(db)); } catch (e) { /* bỏ qua */ } };

  const TRA_LOI = ['Dạ vâng, em ghi nhận ạ 👍', 'Ok, để mình sắp xếp nhé', 'Cảm ơn nhé!', 'Dạ được ạ. Có gì em báo lại', 'Nhớ nhắc mình trước giờ họp nhé'];
  let soTraLoi = 0;
  const congKhai = u => ({ id: u.id, ten: u.ten, chucVu: u.chucVu, job: u.job || '', mau: u.mau, anh: u.anhUrl ? 'demo' : '', anhUrl: u.anhUrl || '', admin: u.admin, khoa: u.khoa, daXoa: u.daXoa });
  const tv = db => db.nguoi.filter(u => !u.admin && !u.daXoa);
  const kenhCua = (db, uid) => { const u = db.nguoi.find(x => x.id === uid); if (!u || u.admin) return []; return ['nhom', ...tv(db).filter(x => x.id !== uid).map(x => kenhRieng(uid, x.id))]; };
  const nguoiKenh = (db, k) => k === 'nhom' ? tv(db).map(u => u.id) : k.slice(3).split(':');
  const daDocCho = (db, uid) => { const r = {}; for (const k of kenhCua(db, uid)) { r[k] = {}; for (const n of nguoiKenh(db, k)) r[k][n] = db.daDoc[`${n}|${k}`] || 0; } return r; };

  async function baoTaiCho(title, body) {
    try {
      if (Notification.permission !== 'granted' || localStorage.getItem('ltd_demoTb') !== 'true') return;
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, { body, icon: 'icon-192.png', badge: 'badge-96.png', tag: 'demo-' + Date.now(), data: { url: './?demo#chat' } });
    } catch (e) { /* trình duyệt không hỗ trợ */ }
  }

  // Người kia (hoặc 1 người trong nhóm) "đọc" rồi trả lời sau vài giây
  function traLoiTuDong(toi, kenh) {
    const db0 = doc(), ho = nguoiKenh(db0, kenh).filter(x => x !== toi);
    if (!ho.length) return;
    const ai = ho[soTraLoi % ho.length];
    setTimeout(() => { const db = doc(); for (const n of ho) db.daDoc[`${n}|${kenh}`] = db.tiepId - 1; ghi(db); }, 1500);
    setTimeout(() => {
      const db = doc(), nd = TRA_LOI[soTraLoi++ % TRA_LOI.length], id = db.tiepId++;
      db.tin.push({ id, t: bayGio(), tu: ai, nd, lichId: '', kenh });
      db.daDoc[`${ai}|${kenh}`] = id; ghi(db);
      const tab = document.getElementById('chat-phong');
      if (document.visibilityState !== 'visible' || !tab || tab.hidden) baoTaiCho('💬 ' + db.nguoi.find(u => u.id === ai).ten, nd);
    }, 3500);
  }

  const online = db => Object.fromEntries(tv(db).map(u => [u.id, { t: Date.now() - (u.id === 'minh' ? 600000 : 2000) }]));
  const uidCua = token => (/^demo-(.+)$/.exec(token || '') || [])[1];

  window.LICH_DEMO = {
    dsDangNhap: () => doc().nguoi.filter(u => !u.daXoa).map(u => u.tenDN),
    tenDangNhapCua: id => (doc().nguoi.find(u => u.id === id) || {}).tenDN,
    tokenCua: tenDN => 'demo-' + (doc().nguoi.find(u => u.tenDN === tenDN) || {}).id,
    async api(action, d) {
      await new Promise(r => setTimeout(r, 200));   // giả độ trễ mạng
      const db = doc(), toi = uidCua(d.token), me = db.nguoi.find(u => u.id === toi);
      if (action === 'trangThai') return { ok: true, daCaiDat: true };
      if (action === 'dangNhap') {
        const u = db.nguoi.find(x => x.tenDN === String(d.tenDangNhap || '').toLowerCase() && !x.daXoa);
        if (!u) return { loi: 'Bản demo: thử tên đăng nhập sep, troly, minh hoặc admin' };
        if (u.khoa) return { loi: 'Tài khoản này đang bị khoá. Liên hệ admin.' };
        return { ok: true, token: 'demo-' + u.id, toi: u.id };
      }
      if (action === 'caiDat') return { ok: true };
      if (!me || me.khoa || me.daXoa) return { loi: 'Phiên demo đã hết', hetPhien: true };
      const tinCuoi = db.tin.length ? db.tin[db.tin.length - 1].id : 0;
      const kenhs = kenhCua(db, toi), tinCua = sau => db.tin.filter(t => t.id > sau && kenhs.includes(t.kenh));
      const quyenAdmin = () => { if (!me.admin) throw new Error('Chỉ admin mới làm được việc này'); };
      const doiNguoi = () => { db.verNguoi++; };
      try {
        switch (action) {
          case 'tongHop':
            return { ok: true, toi, admin: me.admin, nguoi: db.nguoi.map(congKhai), verNguoi: String(db.verNguoi), vapid: 'demo', verLich: String(db.ver), lich: db.lich, tin: tinCua(0), tinCuoi, verTT: db.verTT || 0, daDoc: daDocCho(db, toi), online: online(db) };
          case 'poll': {
            const r = { ok: true, verLich: String(db.ver), verNguoi: String(db.verNguoi), tinCuoi, daDoc: daDocCho(db, toi), online: online(db) };
            if (String(d.verLich) !== String(db.ver)) r.lich = db.lich;
            if (String(d.verNguoi) !== String(db.verNguoi)) r.nguoi = db.nguoi.map(congKhai);
            if ((d.tinCuoi || 0) < tinCuoi) r.tin = tinCua(d.tinCuoi || 0);
            if ((d.verTT || 0) < (db.verTT || 0)) r.capNhat = db.tin.filter(t => (t.verTT || 0) > (d.verTT || 0) && kenhs.includes(t.kenh)).map(t => ({ id: t.id, tt: t.tt || {} }));
            r.verTT = db.verTT || 0;
            return r;
          }
          case 'luuLich': {
            const ev = Object.assign({}, d.ev, { suaBoi: toi, capNhat: bayGio() });
            const i = db.lich.findIndex(x => x.id === ev.id);
            if (i >= 0) db.lich[i] = Object.assign({}, db.lich[i], ev);
            else { ev.id = 'D' + Date.now().toString(36); ev.taoBoi = toi; db.lich.push(ev); }
            db.ver++; ghi(db);
            return { ok: true, ev: i >= 0 ? db.lich[i] : ev, verLich: String(db.ver) };
          }
          case 'luuNhieuLich': {
            const ds = (d.ds || []).map((e, i) => Object.assign({}, e, { id: 'D' + Date.now().toString(36) + i, taoBoi: toi, suaBoi: toi, capNhat: bayGio() }));
            db.lich.push(...ds); db.ver++; ghi(db);
            return { ok: true, ds, verLich: String(db.ver) };
          }
          case 'xoaLich':
            db.lich = db.lich.filter(x => x.id !== d.id); db.ver++; ghi(db);
            return { ok: true, verLich: String(db.ver) };
          case 'taoBinhChon': {
            if (!kenhs.includes(d.kenh)) return { loi: 'Bạn không ở trong cuộc trò chuyện này' };
            const tin = { id: db.tiepId++, t: bayGio(), tu: toi, nd: '', lichId: '', kenh: d.kenh, loai: 'binhchon', dl: { cauHoi: d.cauHoi, luaChon: d.luaChon, nhieu: !!d.nhieu }, tt: {} };
            db.tin.push(tin); db.daDoc[`${toi}|${d.kenh}`] = tin.id; ghi(db);
            return { ok: true, tin };
          }
          case 'binhChon': case 'thaCam': {
            const t = db.tin.find(x => x.id === d.id && kenhs.includes(x.kenh));
            if (!t) return { loi: 'Không tìm thấy tin nhắn' };
            const tt = t.tt = t.tt || {}, k = action === 'binhChon' ? 'phieu' : 'cam', o = tt[k] = tt[k] || {};
            const v = action === 'binhChon' ? (d.chon || []) : d.cam;
            if (v && v.length) o[toi] = v; else delete o[toi];
            db.verTT = (db.verTT || 0) + 1; t.verTT = db.verTT; ghi(db);
            return { ok: true, tt, verTT: db.verTT };
          }
          case 'guiTin': {
            if (!kenhs.includes(d.kenh)) return { loi: 'Bạn không ở trong cuộc trò chuyện này' };
            const tin = { id: db.tiepId++, t: bayGio(), tu: toi, nd: d.noiDung || '', lichId: d.lichId || '', kenh: d.kenh };
            db.tin.push(tin); db.daDoc[`${toi}|${d.kenh}`] = tin.id; ghi(db);
            traLoiTuDong(toi, d.kenh);
            return { ok: true, tin };
          }
          case 'daDoc': db.daDoc[`${toi}|${d.kenh}`] = Math.max(db.daDoc[`${toi}|${d.kenh}`] || 0, d.id); ghi(db); return { ok: true };
          case 'doiAnh': {
            const u = d.id && d.id !== toi ? (quyenAdmin(), db.nguoi.find(x => x.id === d.id)) : me;
            u.anhUrl = d.anh || ''; doiNguoi(); ghi(db);
            return { ok: true, nguoi: db.nguoi.map(congKhai), verNguoi: String(db.verNguoi) };
          }
          case 'doiTen': me.ten = String(d.ten || '').trim() || me.ten; doiNguoi(); ghi(db); return { ok: true, nguoi: db.nguoi.map(congKhai), verNguoi: String(db.verNguoi) };
          case 'thuThongBao':
            await baoTaiCho('🔔 Thông báo đã hoạt động', 'Máy này sẽ nhận nhắc lịch và tin nhắn.');
            return { ok: true, daGui: 1 };
          /* ---- admin ---- */
          case 'dsThanhVien': quyenAdmin(); return { ok: true, ds: tv(db).map(u => Object.assign(congKhai(u), { tenDangNhap: u.tenDN })) };
          case 'taoThanhVien': {
            quyenAdmin();
            const tenDN = String(d.tenDangNhap || '').toLowerCase();
            if (!/^[a-z0-9._-]{3,30}$/.test(tenDN)) return { loi: 'Tên đăng nhập 3–30 ký tự, chỉ gồm chữ không dấu, số, dấu chấm, gạch dưới' };
            if (String(d.matKhau || '').length < 6) return { loi: 'Mật khẩu cần ít nhất 6 ký tự' };
            if (db.nguoi.some(u => u.tenDN === tenDN)) return { loi: 'Tên đăng nhập này đã có người dùng' };
            db.nguoi.push({ id: 'u' + Date.now().toString(36), tenDN, ten: d.ten, chucVu: d.chucVu || '', job: d.job || '', mau: d.mau || '#5ac8fa', admin: false, khoa: false, daXoa: false });
            doiNguoi(); ghi(db); return { ok: true };
          }
          case 'suaThanhVien': { quyenAdmin(); const u = db.nguoi.find(x => x.id === d.id); Object.assign(u, { ten: d.ten, chucVu: d.chucVu, job: d.job || '', mau: d.mau || u.mau }); doiNguoi(); ghi(db); return { ok: true }; }
          case 'datLaiMatKhau': quyenAdmin(); return { ok: true };
          case 'khoaThanhVien': { quyenAdmin(); db.nguoi.find(x => x.id === d.id).khoa = !!d.khoa; doiNguoi(); ghi(db); return { ok: true }; }
          case 'xoaThanhVien': { quyenAdmin(); const u = db.nguoi.find(x => x.id === d.id); Object.assign(u, { daXoa: true, khoa: true, tenDN: u.tenDN + '#xoa' }); doiNguoi(); ghi(db); return { ok: true }; }
          default: return { ok: true };
        }
      } catch (e) { return { loi: e.message }; }
    },
    // Gửi ảnh / video / tệp trong demo: ảnh nhỏ lưu luôn trên máy, video & tệp chỉ xem được trong lần mở này
    async taiLen(blob, m) {
      const db = doc(), toi = uidCua(m.token);
      if (!kenhCua(db, toi).includes(m.kenh)) throw new Error('Bạn không ở trong cuộc trò chuyện này');
      await new Promise(r => setTimeout(r, 600));
      let url = URL.createObjectURL(blob);
      if (/^image\//.test(m.loai) && blob.size < 400000) url = await new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(blob); });
      const tin = { id: db.tiepId++, t: bayGio(), tu: toi, nd: '', lichId: '', kenh: m.kenh, loai: 'tep', tt: {},
        dl: { id: 'demo', ten: m.ten, loai: m.loai, co: blob.size, k: '', rong: m.rong, cao: m.cao, url } };
      db.tin.push(tin); db.daDoc[`${toi}|${m.kenh}`] = tin.id; ghi(db);
      return { ok: true, tin };
    },
    datLai() { try { localStorage.removeItem(KHOA); } catch (e) { /* bỏ qua */ } }
  };
})();
