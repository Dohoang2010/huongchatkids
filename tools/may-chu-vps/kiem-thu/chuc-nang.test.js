'use strict';
/* Kiểm thử các chức năng chính của máy chủ (chạy đúng mã tools/apps-script.gs trên dữ liệu giả – không cần PostgreSQL, không gọi mạng thật).
   Chạy:  node --test tools/may-chu-vps/kiem-thu/
   Mỗi bài tạo một máy mới (bảng tính trống) nên không ảnh hưởng nhau và không đụng dữ liệu thật. */
process.env.TZ = 'Asia/Ho_Chi_Minh';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { Kho } = require('../src/kho');
const { BoChay } = require('../src/thuc-thi');
const { datGoiChoThu } = require('../src/dich-vu');

const MA = fs.readFileSync(process.env.GS || path.join(__dirname, '..', '..', 'apps-script.gs'), 'utf8');
const KHOA_QT = 'khoa-quan-tri-thu-nghiem-0123456789';   // ADMIN_KEY giả (≥ 24 ký tự) – chỉ có trong bài kiểm thử
const SDT = '0912345678', SDT2 = '0987000111';

/* them: mã chạy thêm sau apps-script.gs (vd đặt hạn QUA_DANG_KY giả để bài không phụ thuộc ngày chạy) */
function taoMay(them) {
  const kho = new Kho(); const daGui = [];
  const traLoi = (y) => (/web-khach\?sdt=/.test(y.url) ? { ma: 200, noiDung: JSON.stringify({ ok: true, co: false, donHang: [] }), dau: {} } : { ma: 404, noiDung: '', dau: {} });
  const bc = new BoChay({ kho, cauHinh: { imLang: true, goiMang: async (ds) => ds.map(traLoi) }, guiDi: (h) => daGui.push(...h) });
  datGoiChoThu((ds) => ds.map(traLoi));
  bc.napMa(MA + (them ? '\n;' + them : ''), 'apps-script.gs');
  kho.thuocTinh.set('ADMIN_KEY', KHOA_QT);
  kho.thuocTinh.set('ZALO_BOT_TOKEN', '123456:thu-nghiem'); kho.thuocTinh.set('ZALO_BOT_CHAT_ID', 'chat-thu');   // Zalo giả: tin báo shop chỉ vào hộp thư đi của bài kiểm thử
  const get = async (q) => JSON.parse((await bc.doGet(new URLSearchParams(q))).noiDung);
  const qt = (q) => get(q + '&key=' + KHOA_QT);
  const post = async (o) => JSON.parse((await bc.doPost(new URLSearchParams(), JSON.stringify(o))).noiDung);
  const trang = (ten) => kho.bang.getSheetByName(ten);
  return { kho, bc, get, qt, post, trang, daGui };
}
const datDon = (m, sdt, o = {}) => m.post(Object.assign({ type: 'checkout', code: 'HCK' + Date.now().toString().slice(-9) + Math.floor(Math.random() * 90 + 10),
  customer: { name: 'Mẹ Thử', phone: sdt || SDT, address: 'Số 1, Phường Ba Đình, Hà Nội', email: 'me.thu@example.com' },
  items: [{ short: 'Nước ép Lotte Tăng Cao', name: 'Nước ép Lotte Tăng Cao', qty: 1 }], subtotal: 448000, discount: 0, ship: 0, total: 448000, payment: 'cod' }, o));
/* Đăng nhập bằng OTP số điện thoại (khách mới chưa có mật khẩu riêng) */
async function dangNhapOtp(m, sdt) {
  const g = await m.get('action=guiOtp&sdt=' + sdt); assert.strictEqual(g.ok, true, JSON.stringify(g));
  const v = m.trang('OTP').getDataRange().getValues(); const dong = v.filter((r) => String(r[0]).replace(/\D/g, '').endsWith(sdt.slice(1))).pop();
  const xt = await m.get('action=xacThuc&sdt=' + sdt + '&ma=' + dong[1]); assert.strictEqual(xt.ok, true, JSON.stringify(xt)); return xt;
}
const mail = (m, toi) => m.daGui.filter((x) => x.loai === 'mail' && String(x.thu.to).includes(toi));
const maTrongThu = (t) => (String(t.thu.htmlBody || t.thu.body || '').match(/\b(\d{6})\b/) || [])[1];

/* ---------- Giảm giới thiệu chỉ tính trên phần được hưởng ưu đãi (bỏ combo / sản phẩm đang có quà – 21/10/2026) ---------- */
test('giảm giới thiệu tính trên giaTriUuDai (web đã bỏ combo / sản phẩm có quà); web cũ không gửi thì tính trên cả đơn', async () => {
  const m = taoMay();
  const A = '0911000111', B = '0922000222', C = '0933000333';
  assert.strictEqual((await m.get('action=dangKy&sdt=' + A + '&ten=Mẹ Giới Thiệu&mk=Matkhau123&mk2=Matkhau123')).ok, true);
  const r1 = await m.get('action=gtGiuCho&sdt=' + B + '&maDon=HCKUD00001&dungGT=1&ref=' + A + '&giaTri=1000000&giaTriUuDai=400000&tongDon=1000000');
  assert.strictEqual(r1.ok, true, JSON.stringify(r1)); assert.strictEqual(r1.giamGT, 20000, '5% của 400.000đ được hưởng ưu đãi');
  const r2 = await m.get('action=gtGiuCho&sdt=' + C + '&maDon=HCKUD00002&dungGT=1&ref=' + A + '&giaTri=1000000&tongDon=1000000');
  assert.strictEqual(r2.ok, true, JSON.stringify(r2)); assert.strictEqual(r2.giamGT, 50000, 'không gửi giaTriUuDai → tính trên cả đơn như cũ');
});

/* ---------- Tài khoản ---------- */
test('quà tạo tài khoản mới: trong hạn tặng ngay QUA_DANG_KY.diem điểm (1 lần / số), hết hạn thì không tặng; khách cũ không đăng ký lại được', async () => {
  const m = taoMay("QUA_DANG_KY.tu = '2000-01-01'; QUA_DANG_KY.den = '2999-12-31';");
  const dk = await m.get('action=dangKy&sdt=' + SDT + '&ten=Mẹ Thử&mk=Matkhau123&mk2=Matkhau123');
  assert.strictEqual(dk.ok, true, JSON.stringify(dk));
  assert.ok(dk.quaLe && dk.quaLe.diem >= 50000, 'có quà: ' + JSON.stringify(dk.quaLe)); assert.match(dk.quaLe.thongBao, /50\.000 điểm/);
  const dn = await dangNhapOtp(m, SDT);
  const vi = await m.get('action=diemCuaToi&token=' + dn.token);
  assert.ok(vi.soDu >= 50000, 'ví có 50.000 điểm: ' + vi.soDu);
  assert.ok((vi.lichSu || []).some((x) => /tạo tài khoản/i.test(JSON.stringify(x))), 'lịch sử ghi rõ quà tạo tài khoản');
  assert.strictEqual((await m.get('action=dangKy&sdt=' + SDT + '&ten=Mẹ Thử&mk=Matkhau123&mk2=Matkhau123')).ok, false, 'không đăng ký lại để nhận thêm');
  const het = taoMay("QUA_DANG_KY.tu = '2000-01-01'; QUA_DANG_KY.den = '2001-01-01';");
  const dk2 = await het.get('action=dangKy&sdt=0912345678&ten=Mẹ Hai&mk=Matkhau123&mk2=Matkhau123');
  assert.strictEqual(dk2.ok, true); assert.ok(!dk2.quaLe || !/tạo tài khoản/.test(dk2.quaLe.ten), 'hết hạn thì không tặng');
});

test('đăng ký → đăng nhập OTP → đặt mật khẩu riêng → đăng nhập bằng mật khẩu; số / mật khẩu sai bị từ chối', async () => {
  const m = taoMay();
  assert.strictEqual((await m.get('action=dangKy&sdt=123&ten=Mẹ Thử&mk=Matkhau123&mk2=Matkhau123')).ok, false, 'số điện thoại sai');
  assert.strictEqual((await m.get('action=dangKy&sdt=' + SDT + '&ten=M&mk=Matkhau123&mk2=Matkhau123')).ok, false, 'thiếu họ tên');
  const dk = await m.get('action=dangKy&sdt=' + SDT + '&ten=Mẹ Thử&mk=Matkhau123&mk2=Matkhau123&email=me.thu@example.com');
  assert.strictEqual(dk.ok, true, JSON.stringify(dk));
  assert.strictEqual((await m.get('action=dangKy&sdt=' + SDT + '&ten=Mẹ Thử&mk=Matkhau123&mk2=Matkhau123')).ok, false, 'không đăng ký trùng số');
  assert.strictEqual((await m.get('action=dangNhap&sdt=' + SDT + '&mk=SaiMatKhau9')).ok, false, 'sai mật khẩu');
  assert.ok(m.daGui.some((x) => x.loai !== 'mail'), 'báo shop có khách mới qua Zalo');
  const dn = await dangNhapOtp(m, SDT); assert.ok(dn.token);
  const doi = await m.get('action=doiMatKhau&token=' + dn.token + '&mkMoi=MatKhauMoi456&mkMoi2=MatKhauMoi456');
  assert.strictEqual(doi.ok, true, JSON.stringify(doi));
  assert.strictEqual((await m.get('action=dangNhap&sdt=' + SDT + '&mk=1')).ok, false, 'đã có mật khẩu riêng thì mật khẩu mặc định hết dùng');
  assert.strictEqual((await m.get('action=dangNhap&sdt=' + SDT + '&mk=MatKhauMoi456')).ok, true, 'mật khẩu mới dùng được');
  assert.strictEqual((await m.get('action=doiMatKhau&token=sai&mkMoi=A12345678&mkMoi2=A12345678')).ok, false, 'phiên giả bị từ chối');
});

test('quên mật khẩu qua email: OTP đúng mới đặt lại được, OTP chỉ dùng 1 lần', async () => {
  const m = taoMay();
  await m.get('action=dangKy&sdt=' + SDT + '&ten=Mẹ Thử&email=me.thu@example.com');
  const gui = await m.get('action=qmkGui&email=me.thu@example.com&may=maythu1');
  assert.strictEqual(gui.ok, true, JSON.stringify(gui)); assert.ok(gui.maYc, 'có mã yêu cầu');
  const thu = mail(m, 'me.thu@example.com').pop(); assert.ok(thu, 'có gửi mail OTP');
  const otp = maTrongThu(thu); assert.match(String(otp), /^\d{6}$/);
  const sai = await m.get('action=qmkXacThuc&email=me.thu@example.com&maYc=' + gui.maYc + '&otp=' + (otp === '000000' ? '111111' : '000000'));
  assert.strictEqual(sai.ok, false);
  const xt = await m.get('action=qmkXacThuc&email=me.thu@example.com&maYc=' + gui.maYc + '&otp=' + otp);
  assert.strictEqual(xt.ok, true, JSON.stringify(xt)); assert.ok(xt.token);
  const dl = await m.get('action=qmkDatLai&maYc=' + gui.maYc + '&token=' + xt.token + '&mk=DatLai7890&mk2=DatLai7890');
  assert.strictEqual(dl.ok, true, JSON.stringify(dl));
  assert.strictEqual((await m.get('action=dangNhap&sdt=' + SDT + '&mk=DatLai7890')).ok, true);
  assert.strictEqual((await m.get('action=qmkXacThuc&email=me.thu@example.com&maYc=' + gui.maYc + '&otp=' + otp)).ok, false, 'OTP không dùng lại được');
});

/* ---------- Mã giảm giá ---------- */
test('mã giảm giá: đếm lượt dùng theo đơn, đơn huỷ / gọi lại không tính', async () => {
  const m = taoMay();
  assert.strictEqual((await m.get('action=maKiemTra&ma=%%%')).ok, false, 'mã rác bị từ chối');
  await datDon(m, SDT, { coupon: 'HUONG20' });
  await datDon(m, SDT2, { coupon: 'huong20' });
  await m.post({ type: 'callback', code: 'HCKGOILAI01', customer: { name: 'Mẹ Gọi', phone: '0911222333' }, coupon: 'HUONG20' });
  const kt = await m.get('action=maKiemTra&ma=HUONG20&sdt=' + SDT);
  assert.strictEqual(kt.ok, true); assert.strictEqual(kt.dung, 2, 'tính 2 đơn thật, không tính yêu cầu gọi lại: ' + JSON.stringify(kt));
  assert.strictEqual(kt.khach, 1, 'khách này đã dùng 1 lần');
  const bc = await m.qt('action=qtMaBaoCao');
  assert.strictEqual(bc.ok, true); assert.strictEqual(bc.ds.HUONG20.soKhach, 2);
  assert.strictEqual((await m.get('action=qtMaBaoCao&token=sai')).ok, false, 'báo cáo mã cần quyền quản trị');
});

/* ---------- Đánh giá sản phẩm ---------- */
test('đánh giá: cần đăng nhập, kiểm tra sao / nội dung, đã mua thì hiện ngay, chưa mua chờ duyệt, gửi lại là sửa', async () => {
  const m = taoMay();
  await datDon(m, SDT);   // khách 1 đã mua nước ép
  const dn1 = await m.get('action=dangNhap&sdt=' + SDT + '&mk=1');
  await m.get('action=dangKy&sdt=' + SDT2 + '&ten=Mẹ Chưa Mua');
  const dn2 = await dangNhapOtp(m, SDT2);
  const gui = (tk, o) => m.get(new URLSearchParams(Object.assign({ action: 'dgGui', token: tk, id: '41353214697', tenSP: 'Nước ép Lotte Tăng Cao' }, o)).toString());
  assert.strictEqual((await gui('sai', { sao: 5, noiDung: 'Bé uống rất thích luôn ạ' })).loi, 'token', 'chưa đăng nhập');
  assert.strictEqual((await gui(dn1.token, { sao: 0, noiDung: 'Bé uống rất thích luôn ạ' })).ok, false, 'thiếu sao');
  assert.strictEqual((await gui(dn1.token, { sao: 5, noiDung: 'ngon' })).ok, false, 'nội dung quá ngắn');
  assert.strictEqual((await gui(dn1.token, { sao: 5, noiDung: 'Bé uống rất thích, ăn ngon hơn hẳn' })).ok, true);
  assert.strictEqual((await gui(dn2.token, { sao: 2, noiDung: 'Mình chưa mua nhưng thấy đắt quá' })).ok, true);
  let ds = await m.get('action=dgDs&id=41353214697');
  assert.strictEqual(ds.so, 1, 'chỉ hiện đánh giá của khách đã mua');
  assert.strictEqual(ds.ds[0].daMua, true); assert.strictEqual(ds.tb, 5);
  // gửi lại = sửa, không tạo dòng mới
  assert.strictEqual((await gui(dn1.token, { sao: 4, noiDung: 'Bé uống ổn, giao hàng nhanh nữa' })).ok, true);
  assert.strictEqual(m.trang('Đánh giá').getLastRow(), 3, '2 khách = 2 dòng');
  ds = await m.get('action=dgDs&id=41353214697&token=' + dn2.token);
  assert.strictEqual(ds.tb, 4); assert.strictEqual(ds.cuaToi.trangThai, 'cho', 'khách chưa mua thấy đánh giá của mình đang chờ duyệt');
  // quản trị duyệt + trả lời
  assert.strictEqual((await m.get('action=qtDgDuyet&token=sai&ma=x&trangThai=hien')).ok, false, 'không có quyền');
  const dsQt = await m.qt('action=qtDgDs'); assert.strictEqual(dsQt.ok, true);
  const cho = dsQt.ds.find((d) => d.trangThai === 'cho');
  const duyet = await m.qt('action=qtDgDuyet&ma=' + cho.ma + '&trangThai=hien&traLoi=' + encodeURIComponent('Shop cảm ơn mẹ ạ'));
  assert.strictEqual(duyet.ok, true, JSON.stringify(duyet));
  ds = await m.get('action=dgDs&id=41353214697');
  assert.strictEqual(ds.so, 2); assert.strictEqual(ds.tb, 3);
  assert.ok(ds.ds.some((d) => d.traLoi === 'Shop cảm ơn mẹ ạ'), 'có trả lời của shop');
  const tt = await m.get('action=dgTomTat');
  assert.deepStrictEqual(tt.sp['41353214697'], { so: 2, tb: 3 });
});

/* ---------- Chat trên web ---------- */
test('chat: khách gửi → tự trả lời + báo shop; nhân viên trả lời; phiên giả bị từ chối', async () => {
  const m = taoMay(); const ph = 'cthunghiem000001';
  assert.strictEqual((await m.get('action=chatGui&phien=abc&noiDung=xin chao')).ok, false, 'phiên không hợp lệ');
  assert.strictEqual((await m.get('action=chatGui&phien=' + ph + '&noiDung=')).ok, false, 'tin rỗng');
  const g = await m.get('action=chatGui&phien=' + ph + '&noiDung=' + encodeURIComponent('Shop ơi bé 2 tuổi uống gì để tăng cân?') + '&ten=Mẹ Bin&sdt=' + SDT);
  assert.strictEqual(g.ok, true, JSON.stringify(g));
  let doc = await m.get('action=chatDoc&phien=' + ph);
  assert.ok(doc.tin.length >= 2, 'có tin khách + tin tự trả lời');
  assert.strictEqual(doc.tin[0].tu, 'khach');
  assert.ok(m.daGui.some((x) => x.loai !== 'mail'), 'báo shop qua Zalo');
  assert.strictEqual((await m.get('action=qtChatTraLoi&token=sai&phien=' + ph + '&noiDung=chao')).ok, false, 'nhân viên phải đăng nhập');
  const tl = await m.qt('action=qtChatTraLoi&phien=' + ph + '&noiDung=' + encodeURIComponent('Dạ mẹ cho bé dùng nước ép Lotte Tăng Cân ạ'));
  assert.strictEqual(tl.ok, true, JSON.stringify(tl));
  doc = await m.get('action=chatDoc&phien=' + ph);
  assert.ok(doc.tin.some((t) => t.tu === 'nv' && /Tăng Cân/.test(t.noiDung)), 'khách thấy câu trả lời');
  const ds = await m.qt('action=qtChatDs'); assert.strictEqual(ds.ok, true);
  assert.ok(ds.ds.some((c) => c.phien === ph && c.sdt === SDT));
  // giới hạn 40 tin / 10 phút mỗi phiên
  const kq = []; for (let i = 0; i < 42; i++) kq.push(await m.get('action=chatGui&phien=cthunghiem000002&noiDung=tin' + i));
  assert.ok(kq.slice(0, 40).every((x) => x.ok)); assert.strictEqual(kq[41].ok, false, 'tin thứ 42 bị chặn');
});

/* ---------- Đối tác (affiliate) ---------- */
test('đối tác: đăng ký → chờ duyệt (link chưa chạy) → shop duyệt → link ghi lượt bấm', async () => {
  const m = taoMay();
  const dk = (o) => m.get(new URLSearchParams(Object.assign({ action: 'affDangKy', ten: 'Chị Đối Tác', sdt: '0933444555', email: 'doitac@example.com', ma: 'CHITHU', mk: 'DoiTac12345', mk2: 'DoiTac12345', cccd: '001190000001', stk: '0123456789', nganHang: 'Vietcombank' }, o)).toString());
  assert.strictEqual((await dk({ email: 'sai' })).ok, false, 'email sai');
  assert.strictEqual((await dk({ stk: '' })).ok, false, 'thiếu tài khoản nhận hoa hồng');
  const r = await dk({}); assert.strictEqual(r.ok, true, JSON.stringify(r));
  assert.strictEqual((await dk({ ma: 'KHAC' })).ok, false, 'một số điện thoại chỉ đăng ký 1 lần');
  assert.strictEqual((await m.get('action=affBam&ma=CHITHU&vid=may1&trang=index.html')).ok, false, 'chưa duyệt thì link chưa chạy');
  assert.strictEqual((await m.get('action=qtAffDuyet&token=sai&ma=CHITHU&viec=duyet')).ok, false, 'duyệt cần quyền');
  const duyet = await m.qt('action=qtAffDuyet&ma=CHITHU&viec=duyet'); assert.strictEqual(duyet.ok, true, JSON.stringify(duyet));
  const bam = await m.get('action=affBam&ma=CHITHU&vid=may1&trang=index.html');
  assert.strictEqual(bam.ok, true, JSON.stringify(bam)); assert.match(bam.lb, /^LB/);
  const gan = await m.get('action=affGanDon&maDon=HCKAFF000001&sdt=' + SDT + '&lb=' + bam.lb);
  assert.strictEqual(gan.ok, true, JSON.stringify(gan));
  const gan2 = await m.get('action=affGanDon&maDon=HCKAFF000001&sdt=' + SDT + '&lb=' + bam.lb);
  assert.strictEqual(gan2.trung, true, 'gắn đơn 2 lần không tính trùng');
  assert.strictEqual((await m.qt('action=qtAffDuyet&ma=CHITHU&viec=khoa')).ok, true);
  assert.strictEqual((await m.get('action=affBam&ma=CHITHU&vid=may2')).ok, false, 'đối tác bị khoá thì link ngừng');
});

/* ---------- Tư vấn ---------- */
test('đăng ký tư vấn: kiểm tra thông tin, ghi lại + báo shop, chặn gửi dồn', async () => {
  const m = taoMay();
  assert.strictEqual((await m.get('action=leadTuVan&ten=Mẹ Na&sdt=0123&tinhTrang=bé biếng ăn')).ok, false, 'số sai');
  assert.strictEqual((await m.get('action=leadTuVan&ten=Mẹ Na&sdt=' + SDT)).ok, false, 'thiếu tình trạng');
  const ok = await m.get('action=leadTuVan&ten=Mẹ Na&sdt=' + SDT + '&tinhTrang=' + encodeURIComponent('Bé 3 tuổi biếng ăn, chậm tăng cân'));
  assert.strictEqual(ok.ok, true, JSON.stringify(ok));
  assert.ok(m.daGui.some((x) => x.loai !== 'mail'), 'báo shop qua Zalo');
  const kq = []; for (let i = 0; i < 6; i++) kq.push(await m.get('action=leadTuVan&ten=Mẹ Na&sdt=' + SDT + '&tinhTrang=lan' + i));
  assert.strictEqual(kq[kq.length - 1].ok, false, 'gửi quá 5 lần / giờ bị chặn');
});

/* ---------- Đơn hàng ---------- */
test('đơn hàng: khách xem được đơn của mình, không xem được đơn người khác; trùng mã đơn không ghi 2 lần', async () => {
  const m = taoMay();
  const don = { type: 'checkout', code: 'HCKTRUNG0001', customer: { name: 'Mẹ A', phone: SDT, address: 'Hà Nội' }, items: [{ short: 'Sữa thử', qty: 1 }], subtotal: 300000, total: 300000, payment: 'cod' };
  assert.strictEqual((await m.post(don)).ok, true);
  await m.post(don);   // web gửi lại (mạng chập chờn)
  assert.strictEqual(m.trang('Đơn hàng').getLastRow(), 2, 'đơn trùng mã chỉ ghi 1 lần');
  await datDon(m, SDT2);
  const dn = await m.get('action=dangNhap&sdt=' + SDT + '&mk=1');
  const ds = await m.get('action=hoSo&token=' + dn.token);   // trang Tài khoản › Đơn của tôi
  assert.strictEqual(ds.ok, true, JSON.stringify(ds));
  const ma = JSON.stringify(ds);
  assert.strictEqual(ds.donHang.length, 1, 'chỉ 1 đơn (đơn trùng không tính 2 lần): ' + ma); assert.ok(!ma.includes(SDT2), 'không lộ đơn của khách khác');
  assert.strictEqual((await m.get('action=donHang&token=' + dn.token)).ok, false, 'danh sách mọi đơn là của quản trị');
});

/* ---------- Thống kê bán hàng (nguồn khách, phễu, chương trình) ---------- */
test('báo cáo bán hàng: phễu theo lượt vào, đơn gắn đúng nguồn / bài đăng / chương trình, đơn huỷ không tính', async () => {
  const m = taoMay(), luc = () => new Date().toISOString();
  const su = (sid, s, o = {}) => m.bc.doPost(new URLSearchParams(), JSON.stringify(Object.assign({ type: 'track', su: s, vid: 'v' + sid, sid, luc: luc(), loai: 'khac', trang: 'index.html', nguon: 'Facebook', cd: 'bai-20-10', tb: 'Điện thoại' }, o)));   // lượt truy cập trả 'ok' (không phải JSON)
  // Phiên 1 (Facebook, bài 20-10): vào → xem SP → thêm giỏ → thanh toán → mua
  await su('s1', 'xem'); await su('s1', 'xem', { trang: 'product.html?id=41353214697', q: '41353214697' }); await su('s1', 'gio', { ct: '41353214697' }); await su('s1', 'thanhtoan'); await su('s1', 'mua', { ct: 'HCKBC0000001' });
  // Phiên 2 (Facebook, bài 20-10): chỉ xem SP rồi đi
  await su('s2', 'xem', { trang: 'product.html?id=41353214697' });
  // Phiên 3 (Google): vào trang chủ rồi đi
  await su('s3', 'xem', { nguon: 'Google', cd: '' });
  // Đơn từ phiên 1: mã giảm giá + quà chương trình
  await datDon(m, SDT, { code: 'HCKBC0000001', coupon: 'HUONG20', qua: { soQua: 1, ten: 'mặt nạ', chuongTrinh: 'ct-2010-5tr' }, items: [{ id: '41353214697', short: 'Nước ép Lotte Tăng Cao', qty: 2, price: 448000 }], total: 896000,
    theoDoi: { nguon: 'Facebook', cd: 'bai-20-10', vid: 'vs1', trangVao: 'index.html' } });
  // Đơn Zalo, không ưu đãi
  await datDon(m, SDT2, { code: 'HCKBC0000002', total: 500000, theoDoi: { nguon: 'Zalo', cd: '', vid: 'vx' } });
  // Đơn cũ không có nguồn
  await datDon(m, '0905111222', { code: 'HCKBC0000003', total: 300000 });
  assert.strictEqual(m.trang('Nguồn đơn').getLastRow(), 4, 'mỗi đơn 1 dòng nguồn');
  assert.strictEqual((await m.get('action=qtBaoCaoBan&token=sai')).ok, false, 'báo cáo cần quyền quản trị');
  const r = await m.qt('action=qtBaoCaoBan');
  assert.strictEqual(r.ok, true, JSON.stringify(r));
  assert.deepStrictEqual([r.tong.phien, r.tong.xemSP, r.tong.gio, r.tong.thanhToan, r.tong.mua], [3, 2, 1, 1, 1], 'phễu: ' + JSON.stringify(r.tong));
  assert.strictEqual(r.tong.don, 3); assert.strictEqual(r.tong.doanhThu, 1696000); assert.strictEqual(r.tong.donCoNguon, 3);
  const fb = r.nguon.find((x) => x.ten === 'Facebook');
  assert.deepStrictEqual([fb.phien, fb.don, fb.doanhThu, fb.tyLe], [2, 1, 896000, 50]);
  assert.strictEqual(r.nguon.find((x) => x.ten === 'Zalo').don, 1);
  assert.strictEqual(r.nguon.find((x) => x.ten === 'Google').don, 0);
  assert.strictEqual(r.nguon.find((x) => x.ten === 'Chưa rõ').don, 1, 'đơn không kèm nguồn → Chưa rõ');
  const bai = r.baiDang.find((x) => x.ten === 'Facebook · bai-20-10');
  assert.deepStrictEqual([bai.phien, bai.don, bai.doanhThu], [2, 1, 896000]);
  const ct = Object.fromEntries(r.chuongTrinh.map((x) => [x.ten, x.don]));
  assert.strictEqual(ct['Mã giảm giá HUONG20'], 1); assert.strictEqual(ct['Quà tặng: ct-2010-5tr'], 1); assert.strictEqual(ct['Không dùng ưu đãi nào'], 2);
  const sp = r.sanPham.find((x) => x.id === '41353214697');
  assert.deepStrictEqual([sp.xem, sp.gio, sp.don, sp.sl, sp.doanhThu], [2, 1, 1, 2, 896000]);
  // đơn huỷ không tính doanh thu
  const sh = m.trang('Đơn hàng'), v = sh.getDataRange().getValues(), dong = v.findIndex((x) => x[1] === 'HCKBC0000002') + 1;
  sh.getRange(dong, 19).setValue('Đã huỷ');
  const r2 = await m.qt('action=qtBaoCaoBan');
  assert.strictEqual(r2.tong.don, 2); assert.strictEqual(r2.tong.doanhThu, 1196000);
});

test('báo cáo bán hàng: tên nguồn cũ (fb, facebook.com, m.facebook.com, zalo) được gộp về Facebook / Zalo', async () => {
  const m = taoMay(), luc = new Date().toISOString();
  for (const [sid, ng] of [['a', 'fb'], ['b', 'facebook.com'], ['c', 'm.facebook.com'], ['d', 'zalo'], ['e', 'Trực tiếp']])
    await m.bc.doPost(new URLSearchParams(), JSON.stringify({ type: 'track', su: 'xem', vid: 'v' + sid, sid, luc, loai: 'khac', trang: 'index.html', nguon: ng }));
  const r = await m.qt('action=qtBaoCaoBan'), ten = Object.fromEntries(r.nguon.map((x) => [x.ten, x.phien]));
  assert.deepStrictEqual(ten, { Facebook: 3, Zalo: 1, 'Trực tiếp': 1 });
});
