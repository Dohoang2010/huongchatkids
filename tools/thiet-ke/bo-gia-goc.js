// Bỏ mọi chỗ ghi giá gốc trong bài (chữ + thẻ ảnh) – giá niêm yết là bí mật (chủ shop dặn 24/10/2026)
const fs = require('fs'), path = require('path');
const P = '(?:\\d{1,3}(?:\\.\\d{3})+|\\d+)\\s?(?:đ|₫|k|K|nghìn|triệu)?';
const RE = [
  new RegExp(`\\s*\\((?:giá gốc|giá gạch)\\s*${P}(?:\\s*/\\s*${P})?\\)`, 'gi'),
  new RegExp(`,\\s*(?:giá gốc|giá gạch)\\s*${P}`, 'gi'),
  new RegExp(`\\s*[·|–-]\\s*(?:giá gốc|giá gạch)\\s*${P}`, 'gi'),
  new RegExp(`(?:giá gốc|giá gạch)\\s*:?\\s*${P}\\s*[·|,]?\\s*`, 'gi'),
];
const sach = (s) => { let t = String(s || ''); for (const r of RE) t = t.replace(r, ''); return t.replace(/\(\s*\)/g, '').replace(/[ \t]{2,}/g, ' '); };
let doi = 0; const con = [];
for (const f of fs.readdirSync(path.join(__dirname, 'parts')).filter((f) => /^bai-.*\.json$/.test(f))) {
  const p = path.join(__dirname, 'parts', f), a = JSON.parse(fs.readFileSync(p, 'utf8'));
  for (const b of a) {
    const t0 = JSON.stringify(b);
    b.noiDung = sach(b.noiDung);
    for (const x of b.binhLuan || []) {
      x.noiDung = sach(x.noiDung);
      if (x.the) { delete x.the.giaCu; x.the.dong = (x.the.dong || []).map(sach).map((d) => d.trim()).filter(Boolean); x.the.tieuDe = sach(x.the.tieuDe); }
    }
    if (JSON.stringify(b) !== t0) doi++;
    const t = JSON.stringify(b); const m = t.match(/[^"]{0,50}(giá gốc|giá gạch|niêm yết|so với giá)[^"]{0,40}/gi); if (m) con.push(b.cd + ': ' + m.join(' ## '));
  }
  fs.writeFileSync(p, JSON.stringify(a, null, 1));
}
console.log('Đã sửa', doi, 'bài'); console.log('Còn sót:', con.length); con.slice(0, 30).forEach((x) => console.log(' ', x));
