# Genera backend/icon/sonar.ico a partir del logo de la app (multi-tamaño).
# Uso: powershell -ExecutionPolicy Bypass -File backend\icon\build-icon.ps1
Add-Type -AssemblyName System.Drawing

$png    = Join-Path $PSScriptRoot '..\..\frontend\public\logo_sonar.png'
$icoOut = Join-Path $PSScriptRoot 'sonar.ico'
$sizes  = 256, 128, 64, 48, 32, 16

$src = [System.Drawing.Image]::FromFile((Resolve-Path $png))
$blobs = @()
foreach ($size in $sizes) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($src, 0, 0, $size, $size)
    $g.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $blobs += , @{ size = $size; data = $ms.ToArray() }
    $bmp.Dispose()
    $ms.Dispose()
}
$src.Dispose()

# Cabecera ICONDIR + entradas ICONDIRENTRY + datos PNG (Vista+ acepta PNG en ICO)
$out = New-Object System.IO.MemoryStream
$w = New-Object System.IO.BinaryWriter $out
$w.Write([UInt16]0)                  # reserved
$w.Write([UInt16]1)                  # tipo: 1 = icono
$w.Write([UInt16]$blobs.Count)       # nº de imágenes

$offset = 6 + (16 * $blobs.Count)
foreach ($b in $blobs) {
    $dim = if ($b.size -ge 256) { 0 } else { $b.size }   # 0 significa 256
    $w.Write([Byte]$dim)          # ancho
    $w.Write([Byte]$dim)          # alto
    $w.Write([Byte]0)             # colores
    $w.Write([Byte]0)             # reservado
    $w.Write([UInt16]1)           # planos
    $w.Write([UInt16]32)          # bits por píxel
    $w.Write([UInt32]$b.data.Length)
    $w.Write([UInt32]$offset)
    $offset += $b.data.Length
}
foreach ($b in $blobs) { $w.Write($b.data) }
$w.Flush()
[System.IO.File]::WriteAllBytes($icoOut, $out.ToArray())
$w.Dispose()

"OK: $icoOut ($([math]::Round((Get-Item $icoOut).Length / 1KB)) KB, $($blobs.Count) tamaños)"
