'use strict';
/* Kiểm thử "LƯU THẲNG VÀO VPS, GitHub chỉ là bản sao" (src/luu-github.js khoVps + src/dong-bo-web.js).
   Dùng repo git giả trong thư mục tạm: "web" (= /var/www/huongchatkids) + "goc" (bare, thay cho GitHub). Không gọi mạng, không đụng repo thật. */
process.env.TZ = 'Asia/Ho_Chi_Minh';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { Kho } = require('../src/kho');
const { BoChay } = require('../src/thuc-thi');
const { taoLuuGithub, khoVps } = require('../src/luu-github');
const dongBoWeb = require('../src/dong-bo-web');

const MA = fs.readFileSync(process.env.GS || path.join(__dirname, '..', '..', 'apps-script.gs'), 'utf8');
const KHOA = 'khoa-quan-tri-thu-nghiem-0123456789';
const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const DATA = "/* đầu tệp */\nwindow.SITE = { name: 'HCK' };\n/* ===ADMIN:PRODUCTS=== (x) */\nwindow.PRODUCTS = [{\"id\":\"a\",\"price\":1}];\n/* ===/ADMIN:PRODUCTS=== */\n/* ===ADMIN:CAUHINH=== (x) */\nwindow.CAUHINH = {};\n/* ===/ADMIN:CAUHINH=== */\nwindow.X = 1;\n";
const suaKhoi = (src, k, moi) => src.replace(new RegExp('window\\.' + k + ' = [^\\n]*;'), 'window.' + k + ' = ' + moi + ';');
const G = ['-c', 'user.name=Thu', '-c', 'user.email=thu@x', '-c', 'init.defaultBranch=main', '-c', 'commit.gpgsign=false', '-c', 'core.autocrlf=false'];
/* chạy trong hook pre-commit: git đặt sẵn GIT_DIR / GIT_INDEX_FILE… → bỏ đi để không đụng repo thật */
for (const k of Object.keys(process.env)) if (/^GIT_/.test(k)) delete process.env[k];
const git = (cwd, ...a) => execFileSync('git', [...G, ...a], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function taoMay() {
  const goc = fs.mkdtempSync(path.join(os.tmpdir(), 'hck-goc-')), web = fs.mkdtempSync(path.join(os.tmpdir(), 'hck-web-')), tt = fs.mkdtempSync(path.join(os.tmpdir(), 'hck-tt-'));
  git(goc, 'init', '-q', '--bare', '-b', 'main');
  git(web, 'init', '-q', '-b', 'main'); fs.mkdirSync(path.join(web, 'js')); fs.writeFileSync(path.join(web, 'js', 'data.js'), DATA);
  git(web, 'add', '.'); git(web, 'commit', '-q', '-m', 'đầu'); git(web, 'remote', 'add', 'origin', goc); git(web, 'push', '-q', 'origin', 'main'); git(web, 'fetch', '-q', 'origin');
  const db = dongBoWeb.tao({ web, trangThai: tt, env: path.join(tt, 'khong-co-env'), token: 'gia' });
  /* "root" áp dụng hàng chờ ngay khi được báo (trên VPS: hck-luu-web.path → hck-luu-web.service) */
  const kho = khoVps({ web, trangThai: tt, bao: path.join(tt, 'luu-moi'), choToiDa: 3000, khiBao: () => db.apDung() });
  const kh = new Kho();
  const bc = new BoChay({ kho: kh, cauHinh: { imLang: true, goiMang: async (ds) => ds.map(() => ({ ma: 404, noiDung: '', dau: {} })) }, guiDi: () => {} });
  bc.napMa(MA, 'apps-script.gs'); kh.thuocTinh.set('ADMIN_KEY', KHOA);
  const lg = taoLuuGithub({ bc, ghi: () => {}, docThan: async (req) => req.than, kho });
  const goi = async (o) => { let kq; await lg.xuLy({ than: JSON.stringify(o) }, {}, {}, (r, ma, d) => { kq = d; }); return kq; };
  const nv = async (vaiTro, tk) => { await bc.goiHam('qtQuyenGh_', ['x', '', []]); const t = 'tok' + tk; kh.bang.getSheetByName('Phiên QT').appendRow([t, tk, vaiTro, new Date(Date.now() + 3600e3), new Date(), '']); return t; };
  const docWeb = () => fs.readFileSync(path.join(web, 'js', 'data.js'), 'utf8');
  const docGoc = () => execFileSync('git', ['show', 'main:js/data.js'], { cwd: goc, encoding: 'utf8' });
  return { goi, nv, db, web, goc, tt, docWeb, docGoc };
}

test('lưu VPS: nhân viên sản phẩm lưu → tệp trên web đổi NGAY + commit tên nhân viên; GitHub chỉ nhận sau khi đồng bộ', async () => {
  const m = taoMay(), t = await m.nv('PRODUCT_STAFF', 'nv-sp');
  const tt = await m.goi({ viec: 'trangThai', token: t }); assert.strictEqual(tt.coToken, true); assert.strictEqual(tt.cheDo, 'vps');
  const f = await m.goi({ viec: 'doc', token: t, duong: 'js/data.js' }); assert.strictEqual(Buffer.from(f.tep.content, 'base64').toString(), DATA);
  const moi = suaKhoi(DATA, 'PRODUCTS', '[{"id":"a","price":2}]');
  const r = await m.goi({ viec: 'ghi', token: t, duong: 'js/data.js', sha: f.tep.sha, noiDung: b64(moi), thongDiep: 'Quản trị: cập nhật sản phẩm' });
  assert.strictEqual(r.ok, true, JSON.stringify(r)); assert.strictEqual(r.cheDo, 'vps'); assert.ok(r.commit);
  assert.strictEqual(m.docWeb(), moi, 'web đổi ngay');
  assert.match(git(m.web, 'log', '-1', '--format=%an|%s'), /^Quản trị \(nv-sp\)\|Quản trị \(nv-sp\): cập nhật sản phẩm/);
  assert.strictEqual(m.docGoc(), DATA, 'GitHub chưa nhận');
  const d = m.db.dongBo(); assert.strictEqual(d.ok, true, JSON.stringify(d)); assert.strictEqual(d.choGui, 0);
  assert.strictEqual(m.docGoc(), moi, 'đã gửi bản sao lên GitHub');
  /* đọc lại → sha mới; lưu với sha cũ bị từ chối (máy khác vừa sửa) */
  const f2 = await m.goi({ viec: 'doc', token: t, duong: 'js/data.js' }); assert.strictEqual(f2.tep.sha, r.tep.sha);
  const cu = await m.goi({ viec: 'ghi', token: t, duong: 'js/data.js', sha: f.tep.sha, noiDung: b64(suaKhoi(DATA, 'PRODUCTS', '[{"id":"a","price":3}]')) });
  assert.strictEqual(cu.ok, false); assert.strictEqual(m.docWeb(), moi);
});

test('lưu VPS: kiểm quyền như cũ (không sửa được cấu hình / mã web / tệp lạ), hàng chờ không ghi được tệp ngoài danh sách', async () => {
  const m = taoMay(), t = await m.nv('PRODUCT_STAFF', 'nv-sp');
  assert.strictEqual((await m.goi({ viec: 'ghi', token: t, duong: 'js/data.js', noiDung: b64(suaKhoi(DATA, 'CAUHINH', '{"a":1}')) })).loi, 'quyen');
  assert.strictEqual((await m.goi({ viec: 'ghi', token: t, duong: 'js/data.js', noiDung: b64(DATA.replace('window.X = 1;', 'window.X = 2;')) })).ok, false);
  assert.strictEqual((await m.goi({ viec: 'ghi', token: t, duong: 'js/app.js', noiDung: b64('x') })).ok, false);
  assert.strictEqual(m.docWeb(), DATA);
  /* ai đó (tài khoản hckapi bị chiếm) tự bỏ tệp lạ vào hàng chờ → root vẫn từ chối */
  fs.mkdirSync(path.join(m.tt, 'luu-cho'), { recursive: true });
  fs.writeFileSync(path.join(m.tt, 'luu-cho', 'zz-la.json'), JSON.stringify({ id: 'zz-la', duong: '../ngoai.txt', noiDung: b64('x') }));
  fs.writeFileSync(path.join(m.tt, 'luu-cho', 'zz-ma.json'), JSON.stringify({ id: 'zz-ma', duong: 'js/app.js', noiDung: b64('x') }));
  m.db.apDung();
  assert.strictEqual(fs.existsSync(path.join(m.web, '..', 'ngoai.txt')), false); assert.strictEqual(fs.existsSync(path.join(m.web, 'js', 'app.js')), false);
  assert.strictEqual(JSON.parse(fs.readFileSync(path.join(m.tt, 'luu-xong', 'zz-ma.json'), 'utf8')).ok, false);
  /* ảnh mới: ghi thẳng vào img/ */
  const a = await m.goi({ viec: 'ghi', token: t, duong: 'img/sp-moi.jpg', noiDung: b64('anh') });
  assert.strictEqual(a.ok, true, JSON.stringify(a)); assert.strictEqual(fs.readFileSync(path.join(m.web, 'img', 'sp-moi.jpg'), 'utf8'), 'anh');
  /* đơn hàng: không có quyền sửa web */
  const t2 = await m.nv('ORDER_STAFF', 'nv-don');
  assert.strictEqual((await m.goi({ viec: 'ghi', token: t2, duong: 'js/data.js', noiDung: b64(suaKhoi(DATA, 'PRODUCTS', '[]')) })).ok, false);
});

test('lưu VPS: GitHub mất kết nối → web vẫn đổi, bản sao nằm chờ; có mạng lại thì tự gửi; GitHub có mã mới thì ghép (rebase) cả hai', async () => {
  const m = taoMay(), urlThat = m.goc;
  git(m.web, 'remote', 'set-url', 'origin', path.join(m.tt, 'khong-ton-tai'));
  const moi = suaKhoi(DATA, 'PRODUCTS', '[{"id":"a","price":5}]');
  const r = await m.goi({ viec: 'ghi', key: KHOA, duong: 'js/data.js', noiDung: b64(moi) });
  assert.strictEqual(r.ok, true, JSON.stringify(r)); assert.strictEqual(m.docWeb(), moi);
  const d1 = m.db.dongBo(); assert.strictEqual(d1.ok, false); assert.ok(d1.loiTu); assert.strictEqual(m.docWeb(), moi, 'web giữ bản VPS');
  /* trong lúc đó trên GitHub có người sửa mã web (ngoài khối ADMIN) */
  const may2 = fs.mkdtempSync(path.join(os.tmpdir(), 'hck-may2-'));
  git(may2, 'clone', '-q', urlThat, '.'); fs.writeFileSync(path.join(may2, 'js', 'data.js'), DATA.replace('window.X = 1;', 'window.X = 9;'));
  fs.writeFileSync(path.join(may2, 'moi.html'), '<p>trang mới</p>'); git(may2, 'add', '.'); git(may2, 'commit', '-q', '-m', 'sửa mã'); git(may2, 'push', '-q', 'origin', 'main');
  git(m.web, 'remote', 'set-url', 'origin', urlThat);
  const d2 = m.db.dongBo(); assert.strictEqual(d2.ok, true, JSON.stringify(d2)); assert.strictEqual(d2.choGui, 0); assert.strictEqual(d2.loiTu, '');
  const ghep = moi.replace('window.X = 1;', 'window.X = 9;');
  assert.strictEqual(m.docWeb(), ghep, 'web có cả 2 thay đổi'); assert.strictEqual(m.docGoc(), ghep, 'GitHub có cả 2 thay đổi');
  assert.ok(fs.existsSync(path.join(m.web, 'moi.html')));
});

test('lưu VPS: lịch sử phiên bản + đọc bản cũ lấy ngay trên VPS (dạng giống GitHub)', async () => {
  const m = taoMay();
  await m.goi({ viec: 'ghi', key: KHOA, duong: 'js/data.js', noiDung: b64(suaKhoi(DATA, 'CAUHINH', '{"b":2}')), thongDiep: 'Quản trị: cập nhật cấu hình website' });
  const ls = await m.goi({ viec: 'lichSu', key: KHOA, duong: 'js/data.js', soLuong: 10 });
  assert.strictEqual(ls.ok, true); assert.strictEqual(ls.ds.length, 2);
  assert.match(ls.ds[0].commit.message, /cấu hình website/); assert.match(ls.ds[0].commit.author.name, /^Quản trị/); assert.ok(Date.parse(ls.ds[0].commit.author.date));
  const cu = await m.goi({ viec: 'docBan', key: KHOA, duong: 'js/data.js', ref: ls.ds[1].sha });
  assert.strictEqual(Buffer.from(cu.tep.content, 'base64').toString(), DATA);
});
