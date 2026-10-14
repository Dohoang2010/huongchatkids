/* Bản demo (mở bằng ?demo): máy chủ giả chạy ngay trong trình duyệt, dữ liệu mẫu chỉ lưu trên máy này */
'use strict';
(() => {
  if (!/[?&]demo\b/.test(location.search)) return;
  const KHOA = 'ltd_db';
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const cong = k => { const d = new Date(); d.setDate(d.getDate() + k); return ymd(d); };
  const bayGio = (k = 0) => { const d = new Date(Date.now() + k); return `${ymd(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
  const thu2 = (() => { const d = new Date(); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return ymd(d); })();
  const khac = v => (v === 'sep' ? 'troly' : 'sep');

  function taoMau() {
    const h = cong(0), ev = (id, o) => Object.assign({ id, caNgay: false, diaDiem: '', lap: '', lapDen: '', nhac: 15, ghiChu: '', taoBoi: 'troly', suaBoi: 'troly', capNhat: bayGio(-86400000) }, o);
    return {
      ten: { sep: 'Anh Hoàng', troly: 'Chị Lan' }, ver: 1,
      lich: [
        ev('D1', { tieuDe: 'Họp giao ban đầu tuần', bd: `${thu2}T08:30`, kt: `${thu2}T09:30`, diaDiem: 'Phòng họp tầng 3', lich: 'chung', lap: 'tuan', ghiChu: 'Mỗi phòng báo cáo kết quả tuần trước' }),
        ev('D2', { tieuDe: 'Gặp đối tác Shopee', bd: `${h}T14:00`, kt: `${h}T15:30`, diaDiem: 'The Coffee House – Nguyễn Huệ', lich: 'sep', nhac: 30, ghiChu: 'Mang hợp đồng bản cứng\nLink họp dự phòng: https://meet.google.com/' }),
        ev('D3', { tieuDe: 'Đặt vé máy bay đi Hà Nội', bd: `${h}T10:00`, kt: `${h}T10:30`, lich: 'troly', taoBoi: 'sep', suaBoi: 'sep' }),
        ev('D4', { tieuDe: 'Ký hợp đồng nhà cung cấp vải', bd: `${cong(1)}T09:00`, kt: `${cong(1)}T10:00`, diaDiem: 'Văn phòng công ty', lich: 'sep' }),
        ev('D5', { tieuDe: 'Phỏng vấn nhân viên bán hàng', bd: `${cong(2)}T15:00`, kt: `${cong(2)}T16:30`, lich: 'chung', nhac: 60 }),
        ev('D6', { tieuDe: 'Công tác Hà Nội', caNgay: true, bd: `${cong(6)}T00:00`, kt: `${cong(8)}T23:59`, diaDiem: 'Hà Nội', lich: 'sep', nhac: 1440, taoBoi: 'sep', suaBoi: 'sep' }),
        ev('D7', { tieuDe: 'Chốt bảng lương nhân viên', caNgay: true, bd: `${h.slice(0, 8)}25T00:00`, kt: `${h.slice(0, 8)}25T23:59`, lich: 'troly', lap: 'thang', nhac: 0 }),
        ev('D8', { tieuDe: 'Gọi điện cho kế toán', bd: `${cong(3)}T11:00`, kt: `${cong(3)}T11:15`, lich: 'troly', nhac: 10 })
      ],
      tin: [
        { id: 1, t: `${cong(-1)}T16:21:00`, tu: 'troly', nd: 'Em đã đặt lịch gặp đối tác Shopee chiều nay 14h ạ', lichId: '' },
        { id: 2, t: `${cong(-1)}T16:21:30`, tu: 'troly', nd: '', lichId: 'D2' },
        { id: 3, t: `${cong(-1)}T16:40:00`, tu: 'sep', nd: 'Ok em. Nhớ chuẩn bị hợp đồng nhé', lichId: '' },
        { id: 4, t: `${h}T08:02:00`, tu: 'troly', nd: 'Dạ vâng anh. Vé đi Hà Nội em đặt chuyến 7h sáng được không ạ?', lichId: '' }
      ],
      daDoc: { sep: 3, troly: 4 }
    };
  }
  const doc = () => { try { const s = localStorage.getItem(KHOA); if (s) return JSON.parse(s); } catch (e) { /* bỏ qua */ } return taoMau(); };
  const ghi = db => { try { localStorage.setItem(KHOA, JSON.stringify(db)); } catch (e) { /* bỏ qua */ } };

  const TRA_LOI = {
    troly: ['Dạ vâng anh, em ghi nhận ạ 👍', 'Dạ em cập nhật vào lịch ngay ạ', 'Dạ anh, em sẽ nhắc anh trước 30 phút ạ', 'Dạ được ạ. Có gì em báo lại anh nhé'],
    sep: ['Ok em 👍', 'Được, em sắp xếp giúp anh nhé', 'Cảm ơn em', 'Nhớ nhắc anh trước giờ họp nhé']
  };
  let soTraLoi = 0;

  async function baoTaiCho(title, body) {
    try {
      if (Notification.permission !== 'granted' || localStorage.getItem('ltd_demoTb') !== 'true') return;
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, { body, icon: 'icon-192.png', badge: 'badge-96.png', tag: 'demo-' + Date.now(), data: { url: './?demo#chat' } });
    } catch (e) { /* trình duyệt không hỗ trợ */ }
  }

  function traLoiTuDong(toi) {
    const ho = khac(toi);
    setTimeout(() => { const db = doc(); db.daDoc[ho] = db.tin[db.tin.length - 1].id; ghi(db); }, 1500);
    setTimeout(() => {
      const db = doc(), ds = TRA_LOI[ho], nd = ds[soTraLoi++ % ds.length];
      const id = db.tin[db.tin.length - 1].id + 1;
      db.tin.push({ id, t: bayGio(), tu: ho, nd, lichId: '' });
      db.daDoc[ho] = id; ghi(db);
      const tab = document.getElementById('tab-chat');
      if (document.visibilityState !== 'visible' || !tab || tab.hidden) baoTaiCho('💬 ' + db.ten[ho], nd);
    }, 3500);
  }

  const online = () => ({ sep: { t: Date.now() - 2000, chat: false }, troly: { t: Date.now() - 2000, chat: false } });
  const vaiCua = token => (/^demo-(sep|troly)$/.exec(token || '') || [])[1];

  window.LICH_DEMO = {
    async api(action, d) {
      await new Promise(r => setTimeout(r, 250));   // giả độ trễ mạng
      const db = doc(), toi = vaiCua(d.token);
      if (action === 'trangThai') return { ok: true, daCaiDat: true, ten: db.ten };
      if (action === 'dangNhap') return { ok: true, token: 'demo-' + d.vaiTro, vaiTro: d.vaiTro };
      if (action === 'caiDat') return { ok: true };
      if (!toi) return { loi: 'Phiên demo đã hết', hetPhien: true };
      const tinCuoi = db.tin.length ? db.tin[db.tin.length - 1].id : 0;
      switch (action) {
        case 'tongHop':
          return { ok: true, toi, ten: db.ten, vapid: 'demo', verLich: String(db.ver), lich: db.lich, tin: db.tin, tinCuoi, daDoc: db.daDoc, online: online() };
        case 'poll': {
          const r = { ok: true, verLich: String(db.ver), tinCuoi, daDoc: db.daDoc, online: online() };
          if (String(d.verLich) !== String(db.ver)) r.lich = db.lich;
          if ((d.tinCuoi || 0) < tinCuoi) r.tin = db.tin.filter(t => t.id > (d.tinCuoi || 0));
          if (d.canTen) r.ten = db.ten;
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
        case 'guiTin': {
          const tin = { id: tinCuoi + 1, t: bayGio(), tu: toi, nd: d.noiDung || '', lichId: d.lichId || '' };
          db.tin.push(tin); db.daDoc[toi] = tin.id; ghi(db);
          traLoiTuDong(toi);
          return { ok: true, tin };
        }
        case 'daDoc': db.daDoc[toi] = Math.max(db.daDoc[toi] || 0, d.id); ghi(db); return { ok: true };
        case 'doiTen': db.ten[toi] = String(d.ten || '').trim() || db.ten[toi]; ghi(db); return { ok: true, ten: db.ten };
        case 'thuThongBao':
          await baoTaiCho('🔔 Thông báo đã hoạt động', 'Máy này sẽ nhận nhắc lịch và tin nhắn.');
          return { ok: true, daGui: 1 };
        default: return { ok: true };
      }
    },
    datLai() { try { localStorage.removeItem(KHOA); } catch (e) { /* bỏ qua */ } }
  };
})();
