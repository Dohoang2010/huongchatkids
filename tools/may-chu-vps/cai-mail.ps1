# Cài gửi mail thẳng từ VPS (SMTP Gmail) – CHỦ SHOP TỰ CHẠY trên máy Windows có khoá SSH của VPS.
# Cần "Mật khẩu ứng dụng" (App Password) 16 ký tự của Gmail huongchatkids@gmail.com:
#   myaccount.google.com → Bảo mật → Xác minh 2 bước (bật) → Mật khẩu ứng dụng → tạo tên "VPS Huong Chat Kids".
# Mật khẩu gõ ẩn, gửi qua SSH vào /etc/hck-api/env trên VPS (quyền 600) – KHÔNG ghi vào file nào trong máy / GitHub.
# Chạy:  powershell -ExecutionPolicy Bypass -File tools\may-chu-vps\cai-mail.ps1
$ErrorActionPreference = 'Stop'
$vps = 'root@103.77.242.192'
$khoa = Join-Path $env:USERPROFILE '.ssh\id_ed25519_hck_vps'
if (-not (Test-Path $khoa)) { Write-Host "Máy này chưa có khoá SSH của VPS ($khoa)." -ForegroundColor Red; exit 1 }

$mail = Read-Host 'Gmail dùng để gửi (Enter = huongchatkids@gmail.com)'
if (-not $mail) { $mail = 'huongchatkids@gmail.com' }
$an = Read-Host 'Dán Mật khẩu ứng dụng 16 ký tự (chữ sẽ không hiện ra)' -AsSecureString
$mk = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($an)) -replace '\s', ''
if ($mk.Length -ne 16) { Write-Host "Mật khẩu ứng dụng phải đủ 16 ký tự (đang có $($mk.Length)). Chưa đổi gì." -ForegroundColor Red; exit 1 }

# Gửi địa chỉ + mật khẩu qua stdin (không lộ trên dòng lệnh) cho he-thong/cai-smtp.sh trên VPS: ghi cấu hình, khởi động lại, gửi thử 1 mail
Write-Host "Đang cài và gửi thử 1 mail tới huongchatkids@gmail.com ..."
$kq = ("$mail`n$mk`n" | ssh -i $khoa -o BatchMode=yes $vps "sh /opt/hck-api/he-thong/cai-smtp.sh") -join " "
$mk = $null; $an = $null
Write-Host $kq
if ($kq -match '"ok":true') { Write-Host 'XONG: VPS đã tự gửi mail được. Mở hộp thư huongchatkids@gmail.com để xem mail thử.' -ForegroundColor Green }
else { Write-Host 'Chưa gửi được – mail khách vẫn nhờ Google Apps Script gửi như cũ (không mất mail). Kiểm tra lại mật khẩu ứng dụng rồi chạy lại.' -ForegroundColor Yellow }
