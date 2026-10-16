'use strict';
/* Kho dữ liệu: giữ toàn bộ "bảng tính" trong bộ nhớ (đọc cực nhanh), mỗi lần chạy ghi xuống PostgreSQL
   trong 1 giao dịch. Lần chạy lỗi / phải chạy lại → hoàn tác trong bộ nhớ, không ghi gì xuống PostgreSQL.

   Mô phỏng đúng cách Google Sheets đối xử với giá trị ghi vào ô (setValue / setValues / appendRow):
   - chuỗi bắt đầu bằng ' → giữ nguyên chuỗi (bỏ dấu ')
   - chuỗi toàn số → số, "TRUE"/"FALSE" → đúng/sai, "12%" → 0.12
   - chuỗi dạng ngày (yyyy-MM-dd, dd/MM/yyyy … theo ngôn ngữ của bảng tính) → ngày
   - cột định dạng "văn bản thuần" (@) → giữ nguyên chuỗi */
const { laNgay } = require('./ngay');

/* ===================== Giá trị ô ===================== */
function laRong(v) { return v === '' || v === null || v === undefined; }

function taoNgayDiaPhuong(y, mo, d, h, mi, s) {
  const dt = new Date(y, mo - 1, d, h || 0, mi || 0, s || 0);   // process chạy với TZ = múi giờ của bảng tính
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  if ((h || 0) > 23 || (mi || 0) > 59 || (s || 0) > 59) return null;
  return dt;
}

function phanTichChuoi(t, ngonNgu) {
  const s = t.trim();
  if (s === '') return t;
  const thapPhan = /^(vi|de|fr|es|it|pt|ru|id|nl|tr|pl)/i.test(ngonNgu || '') ? ',' : '.';
  const reSo = thapPhan === ',' ? /^[+-]?(\d+(,\d+)?|,\d+)([eE][+-]?\d+)?$/ : /^[+-]?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/;
  if (reSo.test(s)) { const n = Number(s.replace(',', '.')); if (isFinite(n)) return n; }
  if (/^[+-]?\d+$/.test(s)) { const n = Number(s); if (isFinite(n)) return n; }
  const pt = s.match(thapPhan === ',' ? /^([+-]?\d+(,\d+)?)\s?%$/ : /^([+-]?\d+(\.\d+)?)\s?%$/);
  if (pt) return Number(pt[1].replace(',', '.')) / 100;
  if (/^true$/i.test(s)) return true;
  if (/^false$/i.test(s)) return false;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) { const d = taoNgayDiaPhuong(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)); if (d) return d; }
  m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (m) {
    const ngayTruoc = !/^en_US|^en$/i.test(ngonNgu || 'vi_VN');   // vi_VN, en_GB…: ngày/tháng/năm; en_US: tháng/ngày/năm
    const d = ngayTruoc ? +m[1] : +m[2], mo = ngayTruoc ? +m[2] : +m[1];
    const dt = taoNgayDiaPhuong(+m[3], mo, d, +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)); if (dt) return dt;
  }
  return t;
}

/* Giá trị ghi vào ô → giá trị Sheets thực sự lưu */
function giaTriGhi(v, cotChu, ngonNgu) {
  if (v === null || v === undefined) return '';
  if (laNgay(v)) { const ms = v.getTime(); return isFinite(ms) ? new Date(ms) : ''; }
  if (typeof v === 'number') return isFinite(v) ? v : String(v);
  if (typeof v === 'boolean') return v;
  if (typeof v !== 'string') {
    if (Array.isArray(v)) return v.length ? giaTriGhi(v[0], cotChu, ngonNgu) : '';
    return String(v);
  }
  if (v.charAt(0) === "'") return v.slice(1);
  if (cotChu) return v;
  return phanTichChuoi(v, ngonNgu);
}

/* Lưu xuống PostgreSQL: ngày → {d: mili giây} */
function maHoa(v) { return laNgay(v) ? { d: v.getTime() } : v; }
function giaiMa(x) { return x && typeof x === 'object' && typeof x.d === 'number' ? new Date(x.d) : x; }
function maHoaDong(v) { const a = v.map(maHoa); let n = a.length; while (n && laRong(a[n - 1])) n--; a.length = n; return a; }

/* ===================== Bảng tính ===================== */
class Trang {
  constructor(kho, o) {
    this.kho = kho;
    this.id = o.id; this.ten = o.ten; this.thuTu = o.thuTu || 0;
    this.soCotToiDa = o.soCotToiDa || 26; this.dongCoDinh = o.dongCoDinh || 0;
    this.cotChu = o.cotChu || {};      // {soCot: true} cột định dạng văn bản thuần
    this.dong = [];                    // [{id, vt, v: []}]
    this.vtCuoi = 0;
    this._cotCuoi = null;
  }
  gd() { return this.kho.gdHienTai(); }
  /* ---- đọc ---- */
  getName() { return this.ten; }
  getSheetName() { return this.ten; }
  getSheetId() { return this.id; }
  getIndex() { return this.kho.trang.indexOf(this) + 1; }
  getParent() { return this.kho.bang; }
  getLastRow() {
    for (let i = this.dong.length - 1; i >= 0; i--) { const v = this.dong[i].v; for (let j = 0; j < v.length; j++) if (!laRong(v[j])) return i + 1; }
    return 0;
  }
  getLastColumn() {
    if (this._cotCuoi == null) {
      let m = 0; for (const r of this.dong) { for (let j = r.v.length - 1; j >= m; j--) if (!laRong(r.v[j])) { m = j + 1; break; } }
      this._cotCuoi = m;
    }
    return this._cotCuoi;
  }
  getMaxColumns() { return Math.max(this.soCotToiDa, this.getLastColumn()); }
  getMaxRows() { return Math.max(1000, this.dong.length); }
  getFrozenRows() { return this.dongCoDinh; }
  getFrozenColumns() { return 0; }
  getRange(a, b, c, d) {
    if (typeof a === 'string') return this.vungA1(a);
    const hang = Number(a), cot = Number(b), soHang = c == null ? 1 : Number(c), soCot = d == null ? 1 : Number(d);
    if (!(hang >= 1) || !(cot >= 1) || !(soHang >= 1) || !(soCot >= 1) || [hang, cot, soHang, soCot].some((x) => Math.floor(x) !== x))
      throw new Error('Exception: The parameters (' + [a, b, c, d].filter((x) => x !== undefined).join(',') + ') don\'t match the method signature for SpreadsheetApp.Sheet.getRange.');
    return new Vung(this, hang, cot, soHang, soCot);
  }
  vungA1(a1) {
    const m = String(a1).toUpperCase().replace(/\$/g, '').match(/^([A-Z]+)(\d+)(?::([A-Z]+)(\d+))?$/);
    if (!m) throw new Error('Exception: Range not found');
    const cot = (s) => s.split('').reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0);
    const h1 = +m[2], c1 = cot(m[1]), h2 = m[4] ? +m[4] : h1, c2 = m[3] ? cot(m[3]) : c1;
    return new Vung(this, Math.min(h1, h2), Math.min(c1, c2), Math.abs(h2 - h1) + 1, Math.abs(c2 - c1) + 1);
  }
  getDataRange() { return new Vung(this, 1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }
  /* ---- ghi ---- */
  dongThu(i, tao) {   // i: 0-based
    while (tao && this.dong.length <= i) {
      const gd = this.gd(); gd.chupTrang(this);
      const r = { id: this.kho.idMoi(), vt: ++this.vtCuoi, v: [] };
      this.dong.push(r); gd.ghiDong(this, r);
    }
    return this.dong[i];
  }
  ghiO(i, j, v) {   // i, j: 0-based
    const r = this.dongThu(i, true); const gd = this.gd();
    gd.ghiDong(this, r);
    const gt = giaTriGhi(v, this.cotChu[j + 1], this.kho.ngonNgu);
    while (r.v.length < j) r.v.push('');
    r.v[j] = gt; this._cotCuoi = null;
    if (j + 1 > this.soCotToiDa) { this.gd().chupTrang(this); this.soCotToiDa = j + 1; }
  }
  appendRow(mang) {
    if (!Array.isArray(mang)) throw new Error('Exception: The parameters don\'t match the method signature for SpreadsheetApp.Sheet.appendRow.');
    const i = this.getLastRow();
    for (let j = 0; j < mang.length; j++) this.ghiO(i, j, mang[j]);
    if (!mang.length) this.dongThu(i, true);
    return this;
  }
  deleteRow(hang) {
    const i = Number(hang) - 1;
    if (!(i >= 0) || i >= this.getMaxRows()) throw new Error('Exception: Those rows are out of bounds.');
    if (i >= this.dong.length) return this;
    const gd = this.gd(); gd.chupTrang(this);
    const [r] = this.dong.splice(i, 1); gd.xoaDong(this, r); this._cotCuoi = null;
    return this;
  }
  deleteRows(hang, so) { for (let k = 0; k < so; k++) this.deleteRow(hang); return this; }
  insertColumnsAfter(sau, so) { this.gd().chupTrang(this); this.soCotToiDa = Math.max(this.soCotToiDa, Number(sau)) + Number(so || 1); return this; }
  insertColumnAfter(sau) { return this.insertColumnsAfter(sau, 1); }
  setFrozenRows(n) { this.gd().chupTrang(this); this.dongCoDinh = Number(n) || 0; return this; }
  setFrozenColumns() { return this; }
  setName(ten) {
    ten = String(ten);
    if (this.kho.trang.some((t) => t !== this && t.ten === ten)) throw new Error('Exception: A sheet with the name "' + ten + '" already exists. Please enter another name.');
    this.gd().chupTrang(this); this.ten = ten; return this;
  }
  clear() { return this.clearContents(); }
  clearContents() {
    const gd = this.gd();
    for (const r of this.dong) if (r.v.some((x) => !laRong(x))) { gd.ghiDong(this, r); r.v = []; }
    this._cotCuoi = null; return this;
  }
  setColumnWidth() { return this; } autoResizeColumns() { return this; } setTabColor() { return this; } hideSheet() { return this; } showSheet() { return this; }
  activate() { return this; }
}

class Vung {
  constructor(trang, hang, cot, soHang, soCot) { this.trang = trang; this.hang = hang; this.cot = cot; this.soHang = soHang; this.soCot = soCot; }
  getRow() { return this.hang; } getColumn() { return this.cot; } getNumRows() { return this.soHang; } getNumColumns() { return this.soCot; }
  getLastRow() { return this.hang + this.soHang - 1; } getLastColumn() { return this.cot + this.soCot - 1; }
  getSheet() { return this.trang; }
  getValues() {
    const kho = this.trang.kho, kq = new Array(this.soHang);
    for (let i = 0; i < this.soHang; i++) {
      const r = this.trang.dong[this.hang - 1 + i], dong = new Array(this.soCot);
      for (let j = 0; j < this.soCot; j++) {
        const x = r ? r.v[this.cot - 1 + j] : undefined;
        dong[j] = x === undefined || x === null ? '' : (laNgay(x) ? kho.taoNgay(x.getTime()) : x);
      }
      kq[i] = dong;
    }
    return kq;
  }
  getValue() { return this.getValues()[0][0]; }
  getDisplayValues() { return this.getValues().map((d) => d.map((x) => (laNgay(x) ? x.toLocaleString('vi-VN') : String(x)))); }
  getDisplayValue() { return this.getDisplayValues()[0][0]; }
  setValues(mang) {
    if (!Array.isArray(mang) || mang.length !== this.soHang) throw new Error('Exception: The number of rows in the data does not match the number of rows in the range. The data has ' + (Array.isArray(mang) ? mang.length : 0) + ' but the range has ' + this.soHang + '.');
    for (let i = 0; i < mang.length; i++) {
      if (!Array.isArray(mang[i]) || mang[i].length !== this.soCot) throw new Error('Exception: The number of columns in the data does not match the number of columns in the range. The data has ' + (Array.isArray(mang[i]) ? mang[i].length : 0) + ' but the range has ' + this.soCot + '.');
    }
    for (let i = 0; i < mang.length; i++) for (let j = 0; j < this.soCot; j++) this.trang.ghiO(this.hang - 1 + i, this.cot - 1 + j, mang[i][j]);
    return this;
  }
  setValue(v) { for (let i = 0; i < this.soHang; i++) for (let j = 0; j < this.soCot; j++) this.trang.ghiO(this.hang - 1 + i, this.cot - 1 + j, v); return this; }
  clearContent() { return this.setValue(''); }
  clear() { return this.setValue(''); }
}
/* Các hàm định dạng (đậm, màu, căn lề…) không ảnh hưởng dữ liệu → bỏ qua */
['setFontWeight', 'setFontColor', 'setFontSize', 'setFontStyle', 'setBackground', 'setBackgrounds', 'setNumberFormat', 'setNumberFormats', 'setHorizontalAlignment',
  'setVerticalAlignment', 'setWrap', 'setWrapStrategy', 'setNote', 'setBorder', 'setFontFamily', 'activate', 'setDataValidation', 'merge', 'setFormula']
  .forEach((ten) => { Vung.prototype[ten] = function () { return this; }; });

class BangTinh {
  constructor(kho) { this.kho = kho; }
  getId() { return 'vps-huongchatkids'; }
  getName() { return 'Đơn hàng Hương Chất Kids'; }
  getUrl() { return ''; }
  getSheetByName(ten) { return this.kho.trang.find((t) => t.ten === String(ten)) || null; }
  getSheets() { return this.kho.trang.slice(); }
  getActiveSheet() { return this.kho.trang[0] || null; }
  getSpreadsheetTimeZone() { return this.kho.muiGio; }
  getSpreadsheetLocale() { return this.kho.ngonNgu; }
  insertSheet(ten) {
    ten = ten == null ? 'Trang tính ' + (this.kho.trang.length + 1) : String(ten);
    if (this.getSheetByName(ten)) throw new Error('Exception: A sheet with the name "' + ten + '" already exists. Please enter another name.');
    const gd = this.kho.gdHienTai(); gd.chupBang();
    const t = new Trang(this.kho, { id: this.kho.idTrangMoi(), ten, thuTu: this.kho.trang.length });
    this.kho.trang.push(t); gd.chupTrang(t);
    return t;
  }
  deleteSheet(t) { const gd = this.kho.gdHienTai(); gd.chupBang(); const i = this.kho.trang.indexOf(t); if (i > -1) { this.kho.trang.splice(i, 1); gd.xoaTrang(t); } }
  toast() {} flush() {}
}

/* ===================== Giao dịch (1 lần chạy) ===================== */
class GiaoDich {
  constructor(kho) {
    this.kho = kho;
    this.anhBang = null;            // danh sách trang trước khi đổi
    this.anhTrang = new Map();      // trang → {dong, ten, soCotToiDa, dongCoDinh, vtCuoi}
    this.anhDong = new Map();       // dòng → giá trị cũ
    this.dongDoi = new Map();       // dòng → trang (cần ghi xuống PG)
    this.dongXoa = new Map();       // id → trang
    this.trangXoa = new Set();
    this.hoanTacKhac = [];          // hàm hoàn tác bộ nhớ đệm / thuộc tính
    this.thuocTinhDoi = new Set();
  }
  chupBang() { if (!this.anhBang) this.anhBang = this.kho.trang.slice(); }
  chupTrang(t) { if (!this.anhTrang.has(t)) this.anhTrang.set(t, { dong: t.dong.slice(), ten: t.ten, soCotToiDa: t.soCotToiDa, dongCoDinh: t.dongCoDinh, vtCuoi: t.vtCuoi }); }
  ghiDong(t, r) { if (!this.anhDong.has(r)) this.anhDong.set(r, r.v.slice()); this.dongDoi.set(r, t); }
  xoaDong(t, r) { this.dongXoa.set(r.id, t); this.dongDoi.delete(r); }
  xoaTrang(t) { this.trangXoa.add(t); }
  hoanTac() {
    for (const [r, v] of this.anhDong) r.v = v;
    for (const [t, a] of this.anhTrang) { t.dong = a.dong; t.ten = a.ten; t.soCotToiDa = a.soCotToiDa; t.dongCoDinh = a.dongCoDinh; t.vtCuoi = a.vtCuoi; t._cotCuoi = null; }
    if (this.anhBang) this.kho.trang = this.anhBang;
    for (let i = this.hoanTacKhac.length - 1; i >= 0; i--) this.hoanTacKhac[i]();
  }
  coThayDoi() { return this.anhTrang.size || this.dongDoi.size || this.dongXoa.size || this.thuocTinhDoi.size || this.anhBang; }
}

/* ===================== Kho ===================== */
class Kho {
  constructor(o = {}) {
    this.pool = o.pool || null;            // pg.Pool; không có = chỉ chạy trong bộ nhớ (kiểm thử)
    this.muiGio = o.muiGio || 'Asia/Ho_Chi_Minh';
    this.ngonNgu = o.ngonNgu || 'vi_VN';
    this.trang = [];
    this.bang = new BangTinh(this);
    this.thuocTinh = new Map();            // Script Properties
    this.boNhoDem = new Map();             // CacheService: khoá → {v, het}
    this._id = 1; this._idTrang = 1;
    this.gd = null;
    this.taoNgay = (ms) => new Date(ms);   // đổi theo vùng chạy mã .gs
    this.gdTam = null;
    this.trang.push(new Trang(this, { id: this._idTrang++, ten: 'Trang tính1' }));   // bảng tính mới của Google luôn có sẵn 1 trang
  }
  idMoi() { return this._id++; }
  idTrangMoi() { return this._idTrang++; }
  gdHienTai() {
    if (this.gd) return this.gd;
    if (!this.gdTam) this.gdTam = new GiaoDich(this);   // ghi ngoài lần chạy (nhập dữ liệu, kiểm thử) – không hoàn tác
    return this.gdTam;
  }
  /* ---- tải từ PostgreSQL ---- */
  async taiTuPG() {
    const db = this.pool;
    await taoBang(db);
    const cfg = await db.query('SELECT khoa, gia_tri FROM cau_hinh_kho');
    for (const r of cfg.rows) { if (r.khoa === 'mui_gio') this.muiGio = r.gia_tri; if (r.khoa === 'ngon_ngu') this.ngonNgu = r.gia_tri; }
    const ts = await db.query('SELECT id, ten, thu_tu, so_cot, dong_co_dinh, cot_chu FROM trang_tinh ORDER BY thu_tu, id');
    const theoId = new Map();
    this.trang = ts.rows.map((r) => { const t = new Trang(this, { id: r.id, ten: r.ten, thuTu: r.thu_tu, soCotToiDa: r.so_cot, dongCoDinh: r.dong_co_dinh, cotChu: r.cot_chu || {} }); theoId.set(r.id, t); return t; });
    const ds = await db.query('SELECT id, trang_id, vt, gia_tri FROM dong ORDER BY trang_id, vt, id');
    let maxId = 0;
    for (const r of ds.rows) {
      const t = theoId.get(r.trang_id); if (!t) continue;
      const id = Number(r.id); maxId = Math.max(maxId, id);
      t.dong.push({ id, vt: r.vt, v: (r.gia_tri || []).map(giaiMa) });
      if (r.vt > t.vtCuoi) t.vtCuoi = r.vt;
    }
    this._id = maxId + 1;
    this._idTrang = this.trang.reduce((m, t) => Math.max(m, t.id), 0) + 1;
    const tt = await db.query('SELECT khoa, gia_tri FROM thuoc_tinh');
    this.thuocTinh = new Map(tt.rows.map((r) => [r.khoa, r.gia_tri]));
    return { trang: this.trang.length, dong: ds.rows.length };
  }
  /* ---- ghi giao dịch xuống PostgreSQL ---- */
  async luu(gd) {
    if (!this.pool || !gd || !gd.coThayDoi()) return;
    const trangGhi = new Set(gd.anhTrang.keys());
    for (const t of gd.dongDoi.values()) trangGhi.add(t);
    const conTrang = new Set(this.trang);
    const ids = [], tids = [], vts = [], gts = [];
    for (const [r, t] of gd.dongDoi) { if (!conTrang.has(t) || !t.dong.includes(r)) continue; ids.push(r.id); tids.push(t.id); vts.push(r.vt); gts.push(JSON.stringify(maHoaDong(r.v))); }
    const xoa = [...gd.dongXoa.keys()];
    const c = await this.pool.connect();
    try {
      await c.query('BEGIN');
      for (const t of trangGhi) {
        if (!conTrang.has(t)) continue;
        await c.query(`INSERT INTO trang_tinh (id, ten, thu_tu, so_cot, dong_co_dinh, cot_chu) VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (id) DO UPDATE SET ten = EXCLUDED.ten, thu_tu = EXCLUDED.thu_tu, so_cot = EXCLUDED.so_cot, dong_co_dinh = EXCLUDED.dong_co_dinh`,
          [t.id, t.ten, this.trang.indexOf(t), t.soCotToiDa, t.dongCoDinh, JSON.stringify(t.cotChu || {})]);
      }
      for (const t of gd.trangXoa) await c.query('DELETE FROM trang_tinh WHERE id = $1', [t.id]);
      if (xoa.length) await c.query('DELETE FROM dong WHERE id = ANY($1::bigint[])', [xoa]);
      if (ids.length) await c.query(`INSERT INTO dong (id, trang_id, vt, gia_tri)
          SELECT * FROM unnest($1::bigint[], $2::int[], $3::float8[], $4::jsonb[])
          ON CONFLICT (id) DO UPDATE SET trang_id = EXCLUDED.trang_id, vt = EXCLUDED.vt, gia_tri = EXCLUDED.gia_tri`, [ids, tids, vts, gts]);
      for (const k of gd.thuocTinhDoi) {
        if (this.thuocTinh.has(k)) await c.query('INSERT INTO thuoc_tinh (khoa, gia_tri) VALUES ($1,$2) ON CONFLICT (khoa) DO UPDATE SET gia_tri = EXCLUDED.gia_tri', [k, this.thuocTinh.get(k)]);
        else await c.query('DELETE FROM thuoc_tinh WHERE khoa = $1', [k]);
      }
      await c.query('COMMIT');
    } catch (e) { try { await c.query('ROLLBACK'); } catch (e2) { /* bỏ qua */ } throw e; } finally { c.release(); }
  }
  /* ---- thay toàn bộ dữ liệu (nhập từ Apps Script) ---- */
  async thayToanBo(du) {
    // du: {muiGio, ngonNgu, trang: [{ten, soCotToiDa, dongCoDinh, cotChu, giaTri: [[...]]}], thuocTinh: {k: v}}
    const kho = new Kho({ muiGio: du.muiGio, ngonNgu: du.ngonNgu });
    let id = 1;
    kho.trang = du.trang.map((x, i) => {
      const t = new Trang(kho, { id: i + 1, ten: x.ten, thuTu: i, soCotToiDa: x.soCotToiDa, dongCoDinh: x.dongCoDinh, cotChu: x.cotChu });
      t.dong = x.giaTri.map((v, k) => ({ id: id++, vt: k + 1, v: v.map(giaiMa) }));
      t.vtCuoi = t.dong.length; return t;
    });
    if (this.pool) {
      const c = await this.pool.connect();
      try {
        await c.query('BEGIN');
        await c.query('TRUNCATE dong, trang_tinh');
        await c.query("DELETE FROM thuoc_tinh WHERE khoa NOT LIKE 'VPS\\_%'");
        for (const t of kho.trang) await c.query('INSERT INTO trang_tinh (id, ten, thu_tu, so_cot, dong_co_dinh, cot_chu) VALUES ($1,$2,$3,$4,$5,$6)', [t.id, t.ten, t.thuTu, t.soCotToiDa, t.dongCoDinh, JSON.stringify(t.cotChu || {})]);
        for (const t of kho.trang) {
          for (let b = 0; b < t.dong.length; b += 2000) {
            const lo = t.dong.slice(b, b + 2000);
            await c.query('INSERT INTO dong (id, trang_id, vt, gia_tri) SELECT * FROM unnest($1::bigint[], $2::int[], $3::float8[], $4::jsonb[])',
              [lo.map((r) => r.id), lo.map(() => t.id), lo.map((r) => r.vt), lo.map((r) => JSON.stringify(maHoaDong(r.v)))]);
          }
        }
        for (const [k, v] of Object.entries(du.thuocTinh || {})) if (!/^VPS_/.test(k)) await c.query('INSERT INTO thuoc_tinh (khoa, gia_tri) VALUES ($1,$2) ON CONFLICT (khoa) DO UPDATE SET gia_tri = EXCLUDED.gia_tri', [k, String(v)]);
        await c.query("INSERT INTO cau_hinh_kho (khoa, gia_tri) VALUES ('mui_gio',$1),('ngon_ngu',$2) ON CONFLICT (khoa) DO UPDATE SET gia_tri = EXCLUDED.gia_tri", [kho.muiGio, kho.ngonNgu]);
        await c.query('COMMIT');
      } catch (e) { try { await c.query('ROLLBACK'); } catch (e2) { /* bỏ qua */ } throw e; } finally { c.release(); }
    }
    // đổi dữ liệu trong bộ nhớ (người gọi giữ khoá chạy)
    this.muiGio = kho.muiGio; this.ngonNgu = kho.ngonNgu;
    this.trang = kho.trang; for (const t of this.trang) t.kho = this;
    this._id = id; this._idTrang = this.trang.length + 1;
    const giuLai = [...this.thuocTinh].filter(([k]) => /^VPS_/.test(k));
    this.thuocTinh = new Map(Object.entries(du.thuocTinh || {}).filter(([k]) => !/^VPS_/.test(k)).map(([k, v]) => [k, String(v)]).concat(giuLai));
    this.boNhoDem.clear();
  }
  /* Ảnh chụp dữ liệu để đối chiếu / xuất ngược: {ten: [[giá trị đã mã hoá]]} – bỏ các dòng trống ở cuối như Sheets */
  anhChup() {
    return this.trang.map((t) => {
      const n = t.getLastRow();
      return { ten: t.ten, soCotToiDa: t.getMaxColumns(), dongCoDinh: t.dongCoDinh, cotChu: t.cotChu, giaTri: t.dong.slice(0, n).map((r) => maHoaDong(r.v)) };
    });
  }
}

async function taoBang(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS trang_tinh (id int PRIMARY KEY, ten text NOT NULL UNIQUE, thu_tu int NOT NULL DEFAULT 0, so_cot int NOT NULL DEFAULT 26,
      dong_co_dinh int NOT NULL DEFAULT 0, cot_chu jsonb NOT NULL DEFAULT '{}');
    CREATE TABLE IF NOT EXISTS dong (id bigint PRIMARY KEY, trang_id int NOT NULL REFERENCES trang_tinh(id) ON DELETE CASCADE, vt float8 NOT NULL, gia_tri jsonb NOT NULL);
    CREATE INDEX IF NOT EXISTS dong_trang_vt ON dong (trang_id, vt);
    CREATE TABLE IF NOT EXISTS thuoc_tinh (khoa text PRIMARY KEY, gia_tri text NOT NULL);
    CREATE TABLE IF NOT EXISTS cau_hinh_kho (khoa text PRIMARY KEY, gia_tri text NOT NULL);
    CREATE TABLE IF NOT EXISTS hop_thu_di (id bigserial PRIMARY KEY, luc timestamptz NOT NULL DEFAULT now(), loai text NOT NULL, tom_tat text,
      noi_dung jsonb NOT NULL, trang_thai text NOT NULL, loi text, gui_luc timestamptz);
    CREATE TABLE IF NOT EXISTS lan_nhap (id bigserial PRIMARY KEY, luc timestamptz NOT NULL DEFAULT now(), nguon text, ket_qua jsonb);
  `);
  /* Bảng xem cho người: mỗi trang tính 1 dòng / 1 mảng giá trị (đọc bằng psql) */
  await db.query(`CREATE OR REPLACE VIEW xem_dong AS SELECT t.ten AS trang, row_number() OVER (PARTITION BY d.trang_id ORDER BY d.vt, d.id) AS hang, d.gia_tri
    FROM dong d JOIN trang_tinh t ON t.id = d.trang_id`);
}

module.exports = { Kho, Trang, Vung, GiaoDich, giaTriGhi, maHoa, giaiMa, maHoaDong, taoBang, laRong };
