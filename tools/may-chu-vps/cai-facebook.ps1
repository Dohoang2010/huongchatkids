# Kết nối page Facebook cho LỊCH ĐĂNG FACEBOOK (trang quản trị) – CHỦ SHOP TỰ CHẠY trên máy Windows có khoá SSH của VPS.
# Mã chỉ được gửi thẳng lên VPS (/etc/hck-api/env), không lưu trên máy này, không nằm trong mã web.
# Chuẩn bị:
#   1. developers.facebook.com → Ứng dụng của tôi → Tạo ứng dụng → lấy App ID + App Secret (Cài đặt ứng dụng › Thông tin cơ bản)
#   2. developers.facebook.com/tools/explorer → chọn ứng dụng → thêm quyền pages_show_list, pages_read_engagement,
#      pages_manage_posts, pages_manage_engagement → Generate Access Token → đăng nhập tài khoản quản trị page → chép mã
# Chạy:  powershell -ExecutionPolicy Bypass -File tools\may-chu-vps\cai-facebook.ps1
$ErrorActionPreference = 'Stop'
$vps = 'root@103.77.242.192'
$khoa = Join-Path $env:USERPROFILE '.ssh\id_ed25519_hck_vps'
if (-not (Test-Path $khoa)) { Write-Host "Máy này chưa có khoá SSH của VPS ($khoa)." -ForegroundColor Red; exit 1 }
function An($hoi) {
  $s = Read-Host $hoi -AsSecureString
  $t = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
  return ($t -replace '\s', '')
}
$appId = (Read-Host 'Dán App ID (dãy số)') -replace '\s', ''
$appSecret = An 'Dán App Secret (chữ sẽ không hiện ra)'
$userToken = An 'Dán mã từ Graph API Explorer (chữ sẽ không hiện ra)'
$pageId = ''
for ($lan = 0; $lan -lt 2; $lan++) {
  Write-Host 'Đang lấy mã page và lưu lên VPS ...'
  $json = (@{ appId = $appId; appSecret = $appSecret; userToken = $userToken; pageId = $pageId } | ConvertTo-Json -Compress)
  $kq = ($json | ssh -i $khoa -o BatchMode=yes $vps 'node /opt/hck-api/he-thong/dat-facebook.js') -join ' '
  $d = $kq | ConvertFrom-Json
  if ($d.ok) { Write-Host ("XONG: đã kết nối page '" + $d.trang + "'. Mở trang quản trị › Lịch đăng Facebook, bấm Kiểm tra lại.") -ForegroundColor Green; break }
  if ($d.chon) {
    Write-Host 'Tài khoản quản trị nhiều page, chọn page cần đăng bài:'
    for ($i = 0; $i -lt $d.chon.Count; $i++) { Write-Host ('  ' + ($i + 1) + '. ' + $d.chon[$i].ten) }
    $so = [int](Read-Host 'Gõ số thứ tự page')
    $pageId = $d.chon[$so - 1].id
    continue
  }
  Write-Host ('Chưa được: ' + $d.msg) -ForegroundColor Yellow
  break
}
$appSecret = $null; $userToken = $null
