# Kết nối Zalo ZBS (tin xác nhận đơn + mã OTP qua Zalo) – CHỦ SHOP TỰ CHẠY trên máy Windows có khoá SSH của VPS.
# Mã chỉ được gửi thẳng lên VPS, không lưu trên máy này, không nằm trong mã web.
# Chuẩn bị (developers.zalo.me):
#   1. Ứng dụng của tôi › Hương Chất Kids › Cài đặt: chép "Khóa bí mật của ứng dụng" (Secret Key)
#   2. Công cụ › API Explorer: chọn loại "OA Access Token", ứng dụng Hương Chất Kids, OA Hương Chất Kids → Lấy Access Token → chép "Refresh Token"
# Chạy:  powershell -ExecutionPolicy Bypass -File tools\may-chu-vps\cai-zalo-zbs.ps1
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$vps = 'root@103.77.242.192'
$khoa = Join-Path $env:USERPROFILE '.ssh\id_ed25519_hck_vps'
if (-not (Test-Path $khoa)) { Write-Host "Máy này chưa có khoá SSH của VPS ($khoa)." -ForegroundColor Red; exit 1 }
function An($hoi) {
  $s = Read-Host $hoi -AsSecureString
  return ([Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)) -replace '\s', '')
}
function Goi($o) { return (($o | ConvertTo-Json -Compress) | ssh -i $khoa -o BatchMode=yes $vps 'node /opt/hck-api/cong-cu/dat-zbs.js') -join ' ' | ConvertFrom-Json }
$appId = (Read-Host 'App ID (Enter = 2831485758862930392)') -replace '\s', ''
if (-not $appId) { $appId = '2831485758862930392' }
$secret = An 'Dán Secret Key (chữ sẽ không hiện ra)'
$refresh = An 'Dán Refresh Token (chữ sẽ không hiện ra)'
Write-Host 'Đang lưu mã lên VPS ...'
$kq = Goi @{ viec = 'luu'; appId = $appId; secret = $secret; refresh = $refresh }
$secret = $null; $refresh = $null
if (-not $kq.ok) { Write-Host ('Chưa được: ' + $kq.msg) -ForegroundColor Yellow; Read-Host 'Bấm Enter để đóng'; exit 1 }
Write-Host 'XONG: đã kết nối Zalo ZBS.' -ForegroundColor Green
$sdt = (Read-Host 'Gửi thử vào số nào (Enter = 0983899734)') -replace '\D', ''
if (-not $sdt) { $sdt = '0983899734' }
foreach ($loai in 'don', 'otp') {
  $t = Goi @{ viec = 'thu'; sdt = $sdt; loai = $loai }
  if ($t.ok) { Write-Host ("Đã gửi thử tin '" + $loai + "' tới " + $sdt + " – mở Zalo kiểm tra.") -ForegroundColor Green }
  else { Write-Host ("Gửi thử '" + $loai + "' chưa được: " + $t.loi) -ForegroundColor Yellow }
}
$bat = Read-Host 'Tin thử đã nhận đúng? Gõ CO để bật gửi cho khách thật (Enter = để sau)'
if ($bat -eq 'CO') { $null = Goi @{ viec = 'bat' }; Write-Host 'Đã BẬT: khách đặt đơn / lấy mã OTP sẽ nhận tin qua Zalo.' -ForegroundColor Green }
else { Write-Host 'Chưa bật cho khách. Chạy lại file này khi muốn bật.' }
Read-Host 'Bấm Enter để đóng'
