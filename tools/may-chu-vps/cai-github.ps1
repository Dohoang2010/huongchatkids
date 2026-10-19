# Đưa mã GitHub lên máy chủ VPS để trang quản trị LƯU QUA MÁY CHỦ – CHỦ SHOP TỰ CHẠY trên máy Windows có khoá SSH của VPS.
# Sau khi chạy: mọi máy (kể cả máy nhân viên) không cần dán mã GitHub nữa; máy chủ kiểm quyền từng tài khoản và ghi nhật ký.
# Tạo mã: github.com/settings/personal-access-tokens/new → Only select repositories: Dohoang2010/huongchatkids → Contents: Read and write → Generate.
# Chạy:  powershell -ExecutionPolicy Bypass -File tools\may-chu-vps\cai-github.ps1
$ErrorActionPreference = 'Stop'
$vps = 'root@103.77.242.192'
$khoa = Join-Path $env:USERPROFILE '.ssh\id_ed25519_hck_vps'
if (-not (Test-Path $khoa)) { Write-Host "Máy này chưa có khoá SSH của VPS ($khoa)." -ForegroundColor Red; exit 1 }
$an = Read-Host 'Dán mã GitHub (github_pat_…, chữ sẽ không hiện ra)' -AsSecureString
$t = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($an)) -replace '\s', ''
Write-Host 'Đang kiểm tra mã và lưu lên VPS ...'
$kq = ("$t`n" | ssh -i $khoa -o BatchMode=yes $vps "sh /opt/hck-api/he-thong/dat-github.sh") -join ' '
$t = $null; $an = $null
Write-Host $kq
if ($kq -match '"ok":true') { Write-Host 'XONG: trang quản trị giờ lưu qua máy chủ. Mở lại trang quản trị – mã GitHub cũ trong trình duyệt sẽ tự bị xoá.' -ForegroundColor Green }
else { Write-Host 'Chưa được – xem dòng báo lỗi ở trên rồi tạo lại mã đúng hướng dẫn.' -ForegroundColor Yellow }
