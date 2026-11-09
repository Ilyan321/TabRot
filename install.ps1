# TabRot 1-Line Installer for Windows (PowerShell)
$InstallDir = "$HOME\.tabrot-extension"
$ReleaseUrl = "https://github.com/Ilyan321/TabRot/releases/latest/download/tabrot-extension-v1.0.0.zip"
$ZipFile = "$InstallDir\tabrot.zip"

Write-Host "🪴 TabRot — The Digital Tab Terrarium & Graveyard" -ForegroundColor Green
Write-Host "------------------------------------------------"
Write-Host "📦 Downloading latest production build..." -ForegroundColor Cyan

If (!(Test-Path -Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

Invoke-WebRequest -Uri $ReleaseUrl -OutFile $ZipFile -UseBasicParsing

Write-Host "📂 Extracting files to $InstallDir..." -ForegroundColor Cyan
Expand-Archive -Path $ZipFile -DestinationPath $InstallDir -Force
Remove-Item -Path $ZipFile -Force

Write-Host ""
Write-Host "✅ TabRot extension successfully installed to: $InstallDir" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Final Step (10 seconds):" -ForegroundColor Yellow
Write-Host "  1. In Google Chrome, go to: chrome://extensions"
Write-Host "  2. Toggle on 'Developer mode' (top-right corner)"
Write-Host "  3. Click 'Load unpacked' and select:"
Write-Host "     $InstallDir"
Write-Host ""
Write-Host "Enjoy your living tab terrarium! 🪦✨" -ForegroundColor Green
