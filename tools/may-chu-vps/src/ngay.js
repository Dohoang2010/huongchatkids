'use strict';
/* Ngày giờ kiểu Apps Script:
   - dinhDangNgay = Utilities.formatDate (mẫu kiểu Java SimpleDateFormat: yyyy MM dd HH mm ss …)
   - laNgay: nhận cả ngày tạo trong vùng chạy mã .gs (mỗi lần chạy là 1 vùng riêng) */

function laNgay(v) { return Object.prototype.toString.call(v) === '[object Date]'; }

function chuanMuiGio(tz) {
  const t = String(tz || '').trim();
  const m = t.match(/^(?:GMT|UTC)\s*([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (m) return m[1] + ('0' + m[2]).slice(-2) + ':' + (m[3] || '00');
  if (/^(GMT|UTC)$/i.test(t)) return 'UTC';
  return t || 'Asia/Ho_Chi_Minh';
}

const boDinhDang = new Map();
function phanNgay(ms, tz) {
  let f = boDinhDang.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric', weekday: 'long', timeZoneName: 'longOffset' });
    boDinhDang.set(tz, f);
  }
  const o = {};
  for (const p of f.formatToParts(new Date(ms))) o[p.type] = p.value;
  return o;
}

const THANG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const THU = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dem = (n, k) => String(n).padStart(k, '0');

function dinhDangNgay(date, tz, mau) {
  if (date == null) throw new Error('Exception: Invalid argument: date');
  const ms = typeof date === 'number' ? date : (laNgay(date) ? date.getTime() : new Date(date).getTime());
  if (!isFinite(ms)) throw new Error('Exception: Invalid argument: date');
  if (mau == null) throw new Error('Exception: Invalid argument: format');
  const muiGio = chuanMuiGio(tz);
  let p;
  try { p = phanNgay(ms, muiGio); } catch (e) { p = phanNgay(ms, 'Asia/Ho_Chi_Minh'); }
  const nam = +p.year, thang = +p.month, ngay = +p.day, gio = +p.hour % 24, phut = +p.minute, giay = +p.second;
  const thu = THU.indexOf(p.weekday);
  const lech = String(p.timeZoneName || 'GMT').replace('GMT', '') || '+00:00';   // "+07:00"
  return String(mau).replace(/'(?:[^']|'')*'|([A-Za-z])\1*/g, (tk) => {
    if (tk.charAt(0) === "'") return tk === "''" ? "'" : tk.slice(1, -1).replace(/''/g, "'");
    const c = tk.charAt(0), n = tk.length;
    switch (c) {
      case 'y': case 'Y': return n === 2 ? dem(nam % 100, 2) : dem(nam, n);
      case 'M': case 'L': return n >= 4 ? THANG[thang - 1] : n === 3 ? THANG[thang - 1].slice(0, 3) : dem(thang, n);
      case 'd': return dem(ngay, n);
      case 'H': return dem(gio, n);
      case 'k': return dem(gio === 0 ? 24 : gio, n);
      case 'h': return dem(gio % 12 === 0 ? 12 : gio % 12, n);
      case 'K': return dem(gio % 12, n);
      case 'm': return dem(phut, n);
      case 's': return dem(giay, n);
      case 'S': return dem(((ms % 1000) + 1000) % 1000, 3).slice(0, Math.max(n, 3)).padEnd(n, '0');
      case 'E': return n >= 4 ? THU[thu] : THU[thu].slice(0, 3);
      case 'u': return dem(thu === 0 ? 7 : thu, n);
      case 'a': return gio < 12 ? 'AM' : 'PM';
      case 'Z': return lech === '+00:00' && n === 0 ? 'Z' : lech.replace(':', '');
      case 'X': return lech === '+00:00' ? 'Z' : (n === 1 ? lech.slice(0, 3) : n === 2 ? lech.replace(':', '') : lech);
      case 'z': return n >= 4 ? 'GMT' + lech : (muiGio === 'Asia/Ho_Chi_Minh' ? 'ICT' : 'GMT' + lech);
      case 'D': { const dau = Date.UTC(nam, 0, 1), nay = Date.UTC(nam, thang - 1, ngay); return dem((nay - dau) / 864e5 + 1, n); }
      default: return tk;
    }
  });
}

module.exports = { laNgay, dinhDangNgay, chuanMuiGio };
