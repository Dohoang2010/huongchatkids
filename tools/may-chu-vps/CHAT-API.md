# API chat web – để nối phần mềm chat của nhân viên

Hiện tại nhân viên trả lời ở **Quản trị › Khách hàng › Chat với khách**.
Khi có phần mềm chat (CRM, Pancake, Haravan Chat…), nối bằng 2 đường dưới đây. Không cần sửa code web.

## 1. Bật API

Trên VPS, thêm vào `/etc/hck-api/env` (hoặc Script Properties), rồi `systemctl restart hck-api`:

```
CHAT_API_KEY=<chuỗi bí mật dài, tự tạo>      # phần mềm dùng để gọi vào
CHAT_WEBHOOK=https://<địa chỉ phần mềm>/...   # (tuỳ chọn) web đẩy tin mới của khách tới đây
```

Lưu ý: KHÔNG ghi khoá vào repo (repo công khai).

## 2. Phần mềm gọi vào (GET, trả JSON)

`https://huongchatkids.vn/api?action=chatApi&key=<CHAT_API_KEY>&viec=...`

| viec | Tham số thêm | Trả về |
|---|---|---|
| `ds` | – | `{ok, ds:[{phien, ten, sdt, trang, soTin, chuaDoc, cuoi, cuoiTu, luc}]}` – 200 cuộc chat mới nhất |
| `xem` | `phien`, `sau` (tuỳ chọn, mili giây) | `{ok, tin:[{ma, luc, tu, noiDung, nv, dk?}]}` – đánh dấu đã đọc; có `sau` thì chỉ trả tin mới hơn mốc đó |
| `webhook` | `url` (https của phần mềm) | `{ok, webhook}` – phần mềm tự đăng ký địa chỉ nhận tin |
| `traLoi` | `phien`, `noiDung`, `nv` (tên NV), `dinhKem` (JSON, tuỳ chọn) | `{ok, tin}` – khách thấy trong vài giây |

- `tu`: `khach` | `nv` | `he-thong` | `tu-dong`
- `luc`: mốc thời gian, tính bằng mili giây
- `dk` / `dinhKem` (đính kèm), một trong các dạng:
  - `{"loai":"anh"|"video","url":"/chat-tep/YYYYMM/ten.jpg"}` – tệp nằm ở `https://huongchatkids.vn` + url
  - `{"loai":"sp","id":"<mã sản phẩm>","moi":true}` – thẻ sản phẩm; `moi:true` sẽ hiện nút "Đặt hàng ngay"
  - `{"loai":"don","ma":"HCK...","tong":123000,"tt":"Đang giao","sp":"...","ngay":"19/10/2026"}`

## 3. Web đẩy ra (webhook)

Web POST JSON tới `CHAT_WEBHOOK`, header `x-hck-chat-key: <CHAT_API_KEY>` (phần mềm kiểm tra khoá, sai thì bỏ qua).

Khách gửi tin (`tinThem` = tin tự trả lời đi kèm, có thể rỗng):

```json
{ "su": "tin_moi", "phien": "c...", "khach": { "ten": "", "sdt": "", "trang": "product.html?id=..." },
  "tin": { "ma": "m...", "luc": 1792..., "tu": "khach", "noiDung": "...", "dk": { } }, "tinThem": [] }
```

Nhân viên trả lời (từ trang Quản trị hoặc từ chính phần mềm qua `traLoi`) – dùng `tin.ma` để bỏ trùng:

```json
{ "su": "tin_nv", "phien": "c...", "tin": { "ma": "m...", "luc": 1792..., "tu": "nv", "noiDung": "...", "nv": "adminhck" } }
```

## 4. Dữ liệu

- Tin nhắn: sheet / bảng **Chat** trong PostgreSQL trên VPS, mỗi dòng 1 tin.
- Ảnh và video khách gửi: thư mục `/var/lib/hck-api/chat-tep/` trên VPS. Tối đa 25MB mỗi tệp; máy chủ kiểm tra đúng là ảnh hoặc video mới lưu.
- Khách chỉ đọc được phiên chat của chính mình (mã phiên ngẫu nhiên lưu trong trình duyệt).
- Tin đầu tiên của mỗi phiên được báo qua Zalo bot của shop. Hệ thống cũng tự trả lời 1 câu theo giờ làm việc (8:00 – 22:00).
