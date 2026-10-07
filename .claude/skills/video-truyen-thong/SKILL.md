---
name: video-truyen-thong
description: Tạo video truyền thông ngắn (giọng đọc tiếng Việt, phụ đề, nhạc nền, hình giao diện thật của web huongchatkids.vn) và viết content đăng Facebook / TikTok / Zalo cho shop Hương Chất Kids. Dùng khi chủ shop nhờ "làm video", "video giới thiệu / hướng dẫn / quảng cáo", "viết content / caption / bài đăng" cho một chương trình, tính năng hoặc sản phẩm của web.
---

# Video + content truyền thông – Hương Chất Kids

Kết quả giao cho chủ shop: **1 file MP4** (mặc định dọc 9:16, 45–90 giây) đặt trên Desktop + **content đăng bài** (bản đầy đủ, bản ngắn, caption TikTok, gợi ý đăng). Trả lời bằng tiếng Việt.

## Công cụ (đã cài trên máy chủ shop)
- Node: `C:\Program Files\nodejs` · Chrome: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- ffmpeg/ffprobe (winget Gyan.FFmpeg): `C:\Users\B-Tech Computer\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\` (chưa có → `winget install --id Gyan.FFmpeg -e`)
- Giọng đọc: thư viện npm `msedge-tts` (giọng Edge neural, cần mạng; lời thoại được gửi tới dịch vụ đọc của Microsoft – chỉ đưa lời thoại, không đưa dữ liệu khách). Giọng: `vi-VN-HoaiMyNeural` (nữ, mặc định) hoặc `vi-VN-NamMinhNeural` (nam).
- Nhạc nền: build.mjs tự soạn bằng đàn gảy (không bản quyền). Không dùng nhạc tải trên mạng.

## Quy trình
1. **Nắm nội dung thật từ code/dữ liệu web** (đừng bịa): % giảm, giá, điều kiện, các bước khách bấm. Nguồn: `js/data.js`, các trang HTML, Apps Script (`tools/apps-script.gs`). Chủ đề mơ hồ thì hỏi 1 câu.
2. **Thư mục làm việc** trong scratchpad, ví dụ `<scratchpad>/video-<chu-de>/`:
   ```sh
   cp .claude/skills/video-truyen-thong/scripts/* <thu-muc>/ && cd <thu-muc> && npm init -y && npm install msedge-tts
   ```
3. **Chụp giao diện thật** (tuỳ chọn nhưng nên có): tạo trang thử = bản sao trang web + `<base href="file:///C:/Users/B-Tech Computer/Desktop/web HCK2026/">` + 1 `<script>` chèn ngay sau `js/app.js` để giả lập dữ liệu (ghi đè `MC.GT.*`, `MC.loyaltyApi`, đặt `localStorage` giỏ hàng / phiên đăng nhập). **Bắt buộc** đặt `SITE.orderEndpoint = ''; SITE.loyalty.endpoint = '';` trong trang thử để không gửi đơn / gọi máy chủ thật. Không để trang thử tự bấm Đặt hàng. Rồi:
   ```sh
   sh chup-ui.sh <trang-thu.html> '<selector>' <rộng cửa sổ: 1300 desktop | 520 mobile> <thu-muc>/ui_xxx.png [trễ ms]
   ```
   Ví dụ selector đã dùng: `#gioi-thieu`, `#diem` (account.html), `.checkout__side .card` (checkout.html), `#quickBuy .modal__panel` (mua nhanh, rộng 520).
4. **Viết kịch bản** `kich-ban.json` (mẫu: `vi-du/gioi-thieu-ban-be.json`). Mỗi cảnh:
   - `html`: nội dung cảnh dùng lớp có sẵn trong `khung.html` – `pill` (`--teal`/`--amber`), `h1`/`h2` (`<em>` hồng, `.t` xanh), `lead`, `ui` (ảnh giao diện), `ui crop` + `img style="top:-Npx"` (cắt một đoạn ảnh), `duo`+`box`, `phone`, `flow`+`row` (`--minus`, `--tot`, `--teal`), `list`+`li`, `cta`+`web`, `eq`+`coin`+`vnd`, `sp` (thẻ sản phẩm: ảnh + tên + `.gia`), `big`, `ct`.
   - `vo`: lời đọc – viết số bằng chữ ("năm phần trăm", "một triệu đồng"), tên miền đọc "chấm vi en".
   - `sub`: phụ đề chia 2–4 đoạn ngắn (≤ 45 ký tự), dùng chữ số.
   - `k` (tuỳ chọn): hiện lần lượt – phần tử gắn `data-k="1|2|3"`, `k: [0, 0.3, 0.6]` là thời điểm (tỉ lệ lời đọc) mỗi phần xuất hiện.
   - `nhan` (tuỳ chọn): chữ góc phải trên, vd "1/5".
   - Bố cục chuẩn 7–9 cảnh: mở đầu lợi ích → khái niệm → các bước (ảnh thật) → ví dụ số → lưu ý → kêu gọi + web + hotline 0967 233 003.
   - Tuỳ chọn chung: `khuon` ("9:16" | "16:9"), `giong`, `tocDo` ("+6%"), `mauPhuDe` ("#D93E66"), `nhac.bpm`, `amLuongNhac`, `tenFile`.
5. **Xem trước bố cục** trước khi dựng: chạy `node build.mjs` lần đầu sẽ chụp các cảnh vào `build/c*.png`; hoặc mở `khung.html?s=<id>` (cần `canh.js` – build ghi ra). Ghép lưới để xem nhanh, chỉnh `top:-Npx` / chiều cao `crop` cho đúng chỗ.
6. **Dựng**:
   ```sh
   FFMPEG=<…/ffmpeg.exe> FFPROBE=<…/ffprobe.exe> node build.mjs kich-ban.json
   ```
   Chạy lại được: giọng / ảnh / clip đã có trong `build/` thì bỏ qua → sửa cảnh nào thì xoá `build/c<id>*.png` và `build/clip<id>.mp4` của cảnh đó. Sửa lời thì xoá `build/vo<id>.mp3`. Lỗi "Stream closed" của giọng đọc là mạng chập chờn – chạy lại.
7. **Kiểm tra**: trích 6–9 khung (`ffmpeg -ss <giây> -i video.mp4 -frames:v 1 -vf scale=324:576 kN.png`), ghép lưới và xem: chữ không bị cắt, phụ đề không che nội dung chính, ảnh giao diện đúng chỗ. Âm lượng: `ffmpeg -i video.mp4 -af volumedetect -f null -` → max khoảng −1 đến −3 dB.
8. **Giao**: chép MP4 ra `C:\Users\B-Tech Computer\Desktop\` với tên tiếng Việt không dấu dễ hiểu. Viết content theo `mau-content.md` (bản đầy đủ + bản ngắn + caption TikTok + gợi ý đăng), bắt đầu tin nhắn bằng 1 dòng "Viết cho: …".

## Lưu ý
- Không đưa video / ảnh dựng vào git (repo công khai, file nặng). Kịch bản JSON của video đã làm có thể lưu thêm vào `vi-du/` để dùng lại.
- Hình ảnh sản phẩm: dùng ảnh trong `img/` của web (đường dẫn file:///…/web%20HCK2026/img/…).
- Màu, font theo `DESIGN.md` (hồng #F0537A, xanh ngọc #17A398, vàng #FFB020, Quicksand + Be Vietnam Pro).
- Muốn bản ngang 16:9 (YouTube, Facebook feed): `"khuon": "16:9"` và viết html gọn hơn (ít chữ, ảnh nhỏ hơn).
