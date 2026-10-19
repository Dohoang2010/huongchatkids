# Đặt mật khẩu khoá bản sao lưu gửi về Gmail mỗi tháng – CHỦ SHOP TỰ CHẠY trên máy Windows có khoá SSH của VPS.
# Mật khẩu gõ ẩn, gửi qua SSH vào /etc/hck-api/env trên VPS (quyền 600) – KHÔNG ghi vào file nào trong máy / GitHub.
# GHI MẬT KHẨU RA GIẤY, CẤT KỸ: mất mật khẩu thì không mở được bản sao lưu.
# Chạy:  powershell -ExecutionPolicy Bypass -File tools\may-chu-vps\cai-mat-khau-sao-luu.ps1
$ErrorActionPreference = 'Stop'
$vps = 'root@103.77.242.192'
$khoa = Join-Path $env:USERPROFILE '.ssh\id_ed25519_hck_vps'
if (-not (Test-Path $khoa)) { Write-Host "Máy này chưa có khoá SSH của VPS ($khoa)." -ForegroundColor Red; exit 1 }
function Doc($loi) { $s = Read-Host $loi -AsSecureString; [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)) }
Write-Host 'Mật khẩu: ít nhất 10 ký tự, chữ KHÔNG dấu, số, có thể dùng @ # % + = _ . , : -'
$mk = Doc 'Gõ mật khẩu khoá bản sao lưu (chữ không hiện ra)'
$mk2 = Doc 'Gõ lại mật khẩu'
if ($mk -ne $mk2) { Write-Host 'Hai lần gõ không giống nhau. Chưa đổi gì.' -ForegroundColor Red; exit 1 }
if ($mk.Length -lt 10 -or $mk -notmatch '^[A-Za-z0-9@#%+=_.,:-]+$') { Write-Host 'Mật khẩu chưa đúng yêu cầu. Chưa đổi gì.' -ForegroundColor Red; exit 1 }
Write-Host 'Đang lưu mật khẩu lên VPS và gửi thử 1 bản sao lưu về huongchatkids@gmail.com ...'
$kq = ("$mk`n" | ssh -i $khoa -o BatchMode=yes $vps "sh /opt/hck-api/he-thong/dat-mk-sao-luu.sh") -join ' '
$mk = $null; $mk2 = $null
Write-Host $kq
if ($kq -match '"ok":true') { Write-Host 'XONG: đã gửi bản sao lưu có khoá về Gmail. Từ nay ngày 1 hằng tháng tự gửi. Nhớ ghi mật khẩu ra giấy cất kỹ.' -ForegroundColor Green }
else { Write-Host 'Chưa gửi được – chụp màn hình gửi người kỹ thuật. Sao lưu hằng đêm trên VPS vẫn chạy bình thường.' -ForegroundColor Yellow }
