# Downloads real photos into assets/photos/ (JPG). Run once from the project folder:
#   powershell -ExecutionPolicy Bypass -File .\download-photos.ps1
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = "Stop"
$dir = Join-Path $PSScriptRoot "assets\photos"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"

$photos = @(
  @{ n="flat-white"; id="1534778101976-62847782c213"; kw="latte%2Ccoffee"; w=600; h=600; lock=1 },
  @{ n="cappuccino"; id="1572442388796-11668a67e53d"; kw="cappuccino"; w=600; h=600; lock=2 },
  @{ n="americano"; id="1495474472287-4d71bcdd2085"; kw="black%2Ccoffee"; w=600; h=600; lock=3 },
  @{ n="red-cappuccino"; id="1509042239860-f550ce710b93"; kw="coffee%2Ccup"; w=600; h=600; lock=4 },
  @{ n="mocha"; id="1514432324607-a09d9b4aefdd"; kw="mocha%2Ccoffee"; w=600; h=600; lock=5 },
  @{ n="iced-latte"; id="1461023058943-07fcbe16d735"; kw="iced%2Ccoffee"; w=600; h=600; lock=6 },
  @{ n="burger"; id="1568901346375-23c9450c58cd"; kw="burger"; w=600; h=600; lock=7 },
  @{ n="toastie"; id="1528735602780-2552fd46c7af"; kw="sandwich%2Ctoasted"; w=600; h=600; lock=8 },
  @{ n="wrap"; id="1626700051175-6818013e1d4f"; kw="falafel%2Cwrap"; w=600; h=600; lock=9 },
  @{ n="chips"; id="1573080496219-bb080dd4f877"; kw="french%2Cfries"; w=600; h=600; lock=10 },
  @{ n="bowl"; id="1512621776951-a57141f2eefd"; kw="salad%2Cbowl"; w=600; h=600; lock=11 },
  @{ n="croissant"; id="1555507036-ab1f4038808a"; kw="croissant"; w=600; h=600; lock=12 },
  @{ n="cake"; id="1565958011703-44f9829ba187"; kw="strawberry%2Ccake"; w=600; h=600; lock=13 },
  @{ n="carrot-cake"; id="1621303837174-89787a7d4729"; kw="carrot%2Ccake"; w=600; h=600; lock=14 },
  @{ n="brownie"; id="1606313564200-e75d5e30476c"; kw="chocolate%2Cbrownie"; w=600; h=600; lock=15 },
  @{ n="malva"; id="1488477181946-6428a0291777"; kw="pudding%2Cdessert"; w=600; h=600; lock=16 },
  @{ n="smoothie"; id="1553530666-ba11a7da3888"; kw="smoothie"; w=600; h=600; lock=17 },
  @{ n="lemonade"; id="1621263764928-df1444c5e859"; kw="lemonade"; w=600; h=600; lock=18 },
  @{ n="rooibos"; id="1544787219-7f47ccb76574"; kw="tea%2Cteapot"; w=600; h=600; lock=19 },
  @{ n="milkshake"; id="1572490122747-3968b75cc699"; kw="milkshake"; w=600; h=600; lock=20 },
  @{ n="juice"; id="1600271886742-f049cd451bba"; kw="orange%2Cjuice"; w=600; h=600; lock=21 },
  @{ n="jacaranda-latte"; id="1541167760496-1628856ab772"; kw="latte%2Cart"; w=600; h=600; lock=22 },
  @{ n="pancakes"; id="1567620905732-2d1ec7ab7445"; kw="pancakes"; w=600; h=600; lock=23 },
  @{ n="shakshuka"; id="1590412200988-a436970781fa"; kw="shakshuka"; w=600; h=600; lock=24 },
  @{ n="breakfast"; id="1525351484163-7529414344d8"; kw="english%2Cbreakfast"; w=600; h=600; lock=25 },
  @{ n="hero"; id="1554118811-1e0d58224f24"; kw="cafe%2Cinterior"; w=900; h=1100; lock=26 },
  @{ n="g-terrace"; id="1559329007-40df8a9345d8"; kw="cafe%2Cterrace"; w=1400; h=1000; lock=27 },
  @{ n="g-counter"; id="1442512595331-e89e73853f31"; kw="coffee%2Cbar"; w=1400; h=1000; lock=28 },
  @{ n="g-flatwhite"; id="1495474472287-4d71bcdd2085"; kw="flat%2Cwhite%2Ccoffee"; w=1400; h=1000; lock=29 },
  @{ n="g-storefront"; id="1521017432531-fbd92d768814"; kw="cafe%2Cstorefront"; w=1400; h=1000; lock=30 },
  @{ n="g-bakes"; id="1509440159596-0249088772ff"; kw="bakery%2Cpastries"; w=1400; h=1000; lock=31 },
  @{ n="g-brunch"; id="1504754524776-8f4f37790ca0"; kw="brunch%2Ctable"; w=1400; h=1000; lock=32 }
)

function Get-Jpg($url, $file) {
  try {
    Invoke-WebRequest -Uri $url -OutFile $file -UserAgent $ua -UseBasicParsing -TimeoutSec 40 | Out-Null
    $b = [System.IO.File]::ReadAllBytes($file)
    if ($b.Length -gt 8000 -and $b[0] -eq 0xFF -and $b[1] -eq 0xD8) { return $true }   # real JPEG?
  } catch { }
  if (Test-Path $file) { Remove-Item $file -Force }
  return $false
}

$ok = 0; $bad = @()
foreach ($p in $photos) {
  $file = Join-Path $dir ($p.n + ".jpg")
  if ((Test-Path $file) -and ((Get-Item $file).Length -gt 8000)) { Write-Host "have  $($p.n)"; $ok++; continue }
  $done = $false
  if ($p.id) { $done = Get-Jpg "https://images.unsplash.com/photo-$($p.id)?auto=format&fit=crop&fm=jpg&q=80&w=$($p.w)&h=$($p.h)" $file }
  if (-not $done) { $done = Get-Jpg "https://loremflickr.com/$($p.w)/$($p.h)/$($p.kw)?lock=$($p.lock)" $file }
  if ($done) { Write-Host "OK    $($p.n)"; $ok++ } else { Write-Host "FAIL  $($p.n)" -ForegroundColor Red; $bad += $p.n }
}

Write-Host ""
Write-Host "$ok of $($photos.Count) photos saved in assets\photos"
if ($bad.Count -gt 0) { Write-Host "Missing: $($bad -join ', '). Check your internet and run the script again." -ForegroundColor Yellow }
