// Dựng video truyền thông từ 1 file kịch bản JSON: giọng đọc tiếng Việt (Edge TTS) + phụ đề ASS + nhạc nền tự tạo + cảnh HTML.
// Dùng: node build.mjs <kich-ban.json>   (chạy trong thư mục làm việc đã `npm install msedge-tts`)
// Cần biến môi trường FFMPEG, FFPROBE (đường dẫn ffmpeg.exe / ffprobe.exe). Chrome ở đường dẫn mặc định.
// Chạy lại được: giọng / ảnh / clip đã có thì bỏ qua (xoá file trong build/ để làm lại phần đó).
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SKILL = path.dirname(fileURLToPath(import.meta.url));
const KB_FILE = path.resolve(process.argv[2] || 'kich-ban.json');
const KB = JSON.parse(fs.readFileSync(KB_FILE, 'utf8'));
const DIR = path.dirname(KB_FILE);
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FF = process.env.FFMPEG || 'ffmpeg', FP = process.env.FFPROBE || 'ffprobe';
const DOC = KB.khuon !== '16:9';                     // mặc định dọc 9:16
const W = DOC ? 1080 : 1920, H = DOC ? 1920 : 1080;
const X = KB.chuyenCanh ?? 0.4, PAD_DAU = 0.35, PAD_CUOI = KB.nghiCuoi ?? 0.75;
const CANH = KB.canh;
const HIEU_UNG = ['slideleft', 'fade', 'smoothup', 'slideleft', 'fade', 'circleopen', 'slideleft', 'fade', 'smoothleft', 'fade'];

const run = (cmd, args) => execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 }).toString();
const dur = (f) => Number(run(FP, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', f]).trim());
const out = (f) => path.join(DIR, 'build', f);
fs.mkdirSync(out(''), { recursive: true });

/* 0) Khung cảnh: chép khung.html + ghi kịch bản ra canh.js để trang đọc */
if (path.resolve(SKILL) !== path.resolve(DIR)) fs.copyFileSync(path.join(SKILL, 'khung.html'), path.join(DIR, 'khung.html'));
fs.writeFileSync(path.join(DIR, 'canh.js'), 'window.KB = ' + JSON.stringify(KB) + ';');

/* 1) Giọng đọc từng cảnh (thử lại 3 lần nếu mạng ngắt) */
for (const c of CANH) {
  const f = out(`vo${c.id}.mp3`); if (fs.existsSync(f)) continue;
  for (let lan = 1; ; lan++) {
    try {
      const tmp = out(`tmp${c.id}`); fs.mkdirSync(tmp, { recursive: true });
      const tts = new MsEdgeTTS();
      await tts.setMetadata(KB.giong || 'vi-VN-HoaiMyNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
      const r = await tts.toFile(tmp, c.vo, { rate: KB.tocDo || '+6%', pitch: KB.caoDo || '+2Hz' });
      fs.renameSync(r.audioFilePath, f); fs.rmSync(tmp, { recursive: true, force: true }); tts.close?.();
      console.log('giọng', c.id); break;
    } catch (e) { if (lan >= 3) throw e; console.log('giọng lỗi, thử lại', c.id); await new Promise((r) => setTimeout(r, 3000)); }
  }
}
/* 2) Thời lượng + mốc (chuyển cảnh chồng X giây) */
let t = 0;
CANH.forEach((c, i) => { c.vd = dur(out(`vo${c.id}.mp3`)); c.d = PAD_DAU + c.vd + PAD_CUOI; c.bd = i ? t - X : 0; t = c.bd + c.d; c.vo0 = c.bd + PAD_DAU; });
const TONG = t; console.log('tổng', TONG.toFixed(1), 'giây');

/* 3) Ảnh từng khung bằng Chrome */
const url = (id, k) => `file:///${DIR.replace(/\\/g, '/')}/khung.html?s=${id}&k=${k}`;
const anh = (id, k, f) => { if (fs.existsSync(f)) return; run(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--virtual-time-budget=4000', `--window-size=${W},${H}`, `--screenshot=${f}`, url(id, k)]); };
for (const c of CANH) { if (c.k) c.k.forEach((_, j) => anh(c.id, j + 1, out(`c${c.id}_${j + 1}.png`))); else anh(c.id, 99, out(`c${c.id}.png`)); }

/* 4) Clip từng cảnh: 1 khung → zoom chậm; nhiều khung → hiện lần lượt theo tỉ lệ thời gian lời đọc */
for (const c of CANH) {
  const f = out(`clip${c.id}.mp4`); if (fs.existsSync(f)) continue;
  if (!c.k) {
    const n = Math.ceil(c.d * 30);
    run(FF, ['-y', '-loop', '1', '-i', out(`c${c.id}.png`), '-vf', `scale=${W * 2}:${H * 2},zoompan=z='1+0.045*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${n}:s=${W}x${H}:fps=30,format=yuv420p`, '-frames:v', String(n), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', f]);
  } else {
    const moc = c.k.map((p) => (p === 0 ? 0 : PAD_DAU + p * c.vd)); const lst = [];
    moc.forEach((m, j) => { const het = j + 1 < moc.length ? moc[j + 1] : c.d; lst.push(`file '${out(`c${c.id}_${j + 1}.png`).replace(/\\/g, '/')}'`, `duration ${(het - m).toFixed(3)}`); });
    lst.push(`file '${out(`c${c.id}_${c.k.length}.png`).replace(/\\/g, '/')}'`);
    fs.writeFileSync(out(`l${c.id}.txt`), lst.join('\n'));
    run(FF, ['-y', '-f', 'concat', '-safe', '0', '-i', out(`l${c.id}.txt`), '-vf', 'fps=30,format=yuv420p', '-t', c.d.toFixed(3), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', f]);
  }
  console.log('clip', c.id);
}

/* 5) Nhạc nền tự tạo (đàn gảy Karplus-Strong) – không vướng bản quyền. KB.nhac: { bpm, hop: [[midi…]…] } */
{
  const NH = KB.nhac || {}; const SR = 44100, N = Math.ceil((TONG + 1) * SR); const L = new Float32Array(N), R = new Float32Array(N);
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const gay = (t0, midi, vol, pan) => {
    const p = Math.round(SR / hz(midi)); const buf = new Float32Array(p).map(() => Math.random() * 2 - 1); const i0 = Math.floor(t0 * SR);
    for (let n = 0; n < SR * 2.2 && i0 + n < N; n++) { const k = n % p; const v = buf[k]; buf[k] = 0.996 * 0.5 * (buf[k] + buf[(k + 1) % p]); const e = v * vol; L[i0 + n] += e * (1 - pan); R[i0 + n] += e * (1 + pan); }
  };
  const HOP = NH.hop || [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]];   // C – Am – F – G
  const beat = 60 / (NH.bpm || 96); let t0 = 0, b = 0;
  while (t0 < TONG + 0.5) {
    const h = HOP[Math.floor(b / 8) % HOP.length]; const thuTu = [0, 2, 1, 3, 2, 1, 3, 2];
    gay(t0, h[thuTu[b % 8]], 0.22, (b % 2 ? 0.25 : -0.25));
    if (b % 8 === 0) gay(t0, h[0] - 12, 0.28, 0);
    if (b % 8 === 4) gay(t0, h[2] - 12, 0.18, 0);
    t0 += beat / 2; b++;
  }
  let mx = 0; for (let i = 0; i < N; i++) mx = Math.max(mx, Math.abs(L[i]), Math.abs(R[i]));
  const buf = Buffer.alloc(44 + N * 4); const w = (s, o) => buf.write(s, o);
  w('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); w('WAVE', 8); w('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); w('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let i = 0; i < N; i++) { const f = Math.min(1, i / (SR * 1.5), (N - i) / (SR * 2.5)); buf.writeInt16LE(Math.round(L[i] / mx * 0.8 * f * 32767), 44 + i * 4); buf.writeInt16LE(Math.round(R[i] / mx * 0.8 * f * 32767), 46 + i * 4); }
  fs.writeFileSync(out('nhac.wav'), buf);
}

/* 6) Phụ đề ASS: chữ trắng trên nền màu thương hiệu, mỗi đoạn chia theo độ dài chữ trong lúc đọc */
{
  const ts = (x) => { const h = Math.floor(x / 3600), m = Math.floor(x / 60) % 60, s = x % 60; return `${h}:${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`; };
  const hex = String(KB.mauPhuDe || '#D93E66').replace('#', ''); const bgr = `&H00${hex.slice(4, 6)}${hex.slice(2, 4)}${hex.slice(0, 2)}`.toUpperCase();
  const dong = [];
  for (const c of CANH) {
    const tong = c.sub.reduce((a, x) => a + x.length, 0); let tt = c.vo0;
    c.sub.forEach((x, j) => { const dd = c.vd * x.length / tong; const het = j + 1 === c.sub.length ? c.vo0 + c.vd + 0.3 : tt + dd; dong.push(`Dialogue: 0,${ts(tt)},${ts(het)},Sub,,0,0,0,,${x}`); tt += dd; });
  }
  const co = DOC ? 64 : 56, le = DOC ? 70 : 160, day = DOC ? 170 : 70;
  fs.writeFileSync(out('sub.ass'), `[Script Info]\nScriptType: v4.00+\nPlayResX: ${W}\nPlayResY: ${H}\nWrapStyle: 0\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Sub,Segoe UI,${co},&H00FFFFFF,&H00FFFFFF,${bgr},${bgr},1,0,0,0,100,100,0,0,3,20,0,2,${le},${le},${day},1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n${dong.join('\n')}\n`);
}

/* 7) Ghép: xfade + phụ đề + giọng đúng mốc + nhạc tự hạ khi có giọng (sidechain) */
{
  const ten = KB.tenFile || 'video.mp4';
  const vin = CANH.flatMap((c) => ['-i', out(`clip${c.id}.mp4`)]);
  let fv = '', prev = '[0:v]';
  CANH.slice(1).forEach((c, i) => { const lab = `[v${i + 1}]`; fv += `${prev}[${i + 1}:v]xfade=transition=${HIEU_UNG[i % HIEU_UNG.length]}:duration=${X}:offset=${c.bd.toFixed(3)}${lab};`; prev = lab; });
  fv += `${prev}ass=build/sub.ass[vout];`;
  const nV = CANH.length;
  const ain = CANH.flatMap((c) => ['-i', out(`vo${c.id}.mp3`)]);
  let fa = CANH.map((c, i) => `[${nV + i}:a]adelay=${Math.round(c.vo0 * 1000)}|${Math.round(c.vo0 * 1000)},aformat=channel_layouts=stereo[a${i}];`).join('');
  fa += `${CANH.map((_, i) => `[a${i}]`).join('')}amix=inputs=${nV}:normalize=0,volume=1.6[voice];[voice]asplit[vo1][vo2];`;
  fa += `[${nV * 2}:a]volume=${KB.amLuongNhac ?? 0.32}[m];[m][vo1]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=500[mduck];[vo2][mduck]amix=inputs=2:normalize=0,alimiter=limit=0.95[aout]`;
  execFileSync(FF, ['-y', ...vin, ...ain, '-i', out('nhac.wav'), '-filter_complex', fv + fa, '-map', '[vout]', '-map', '[aout]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-t', TONG.toFixed(2), ten], { cwd: DIR, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 });
  console.log('XONG', path.join(DIR, ten), TONG.toFixed(1), 'giây');
}
