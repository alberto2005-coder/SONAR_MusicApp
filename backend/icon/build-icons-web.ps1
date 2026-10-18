# Genera los iconos PWA de frontend/public/icons a partir del logo.
# Uso: powershell -ExecutionPolicy Bypass -File backend\icon\build-icons-web.ps1
Add-Type -AssemblyName System.Drawing

$srcDir = Resolve-Path (Join-Path $PSScriptRoot '..\..\frontend\public')
$logo   = Join-Path $srcDir 'logo_sonar.png'
$outDir = Join-Path $srcDir 'icons'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$src = [System.Drawing.Image]::FromFile($logo)

function New-Icon([int]$size, [string]$outPath, [double]$escala = 1.0) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    # Fondo (necesario para iconos "maskable" de Android/Windows)
    $bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 5, 5, 5))
    $g.FillRectangle($bg, 0, 0, $size, $size)
    $d = [int]($size * $escala)
    $o = [int](($size - $d) / 2)
    $g.DrawImage($src, $o, $o, $d, $d)
    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

New-Icon 192 (Join-Path $outDir 'icon-192.png') 1.0
New-Icon 512 (Join-Path $outDir 'icon-512.png') 1.0
# Maskable: el logo ocupa el 70% para que el recorte redondo del sistema no lo toque
New-Icon 512 (Join-Path $outDir 'icon-512-maskable.png') 0.70

$src.Dispose()
Get-ChildItem $outDir | ForEach-Object { "$($_.Name)  $([math]::Round($_.Length/1KB)) KB" }
