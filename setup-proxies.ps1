# Quick Proxy Setup Script
# This script helps you quickly set up the proxies in the extension

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EKW Extension - Proxy Configuration  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$proxies = @(
    "ucyhwuvb:39kdvyd2sus6@142.111.48.253:7030",
    "ucyhwuvb:39kdvyd2sus6@31.59.20.176:6754",
    "ucyhwuvb:39kdvyd2sus6@23.95.150.145:6114",
    "ucyhwuvb:39kdvyd2sus6@198.23.239.134:6540",
    "ucyhwuvb:39kdvyd2sus6@107.172.163.27:6543",
    "ucyhwuvb:39kdvyd2sus6@198.105.121.200:6462",
    "ucyhwuvb:39kdvyd2sus6@64.137.96.74:6641",
    "ucyhwuvb:39kdvyd2sus6@84.247.60.125:6095",
    "ucyhwuvb:39kdvyd2sus6@216.10.27.159:6837",
    "ucyhwuvb:39kdvyd2sus6@142.111.67.146:5611"
)

Write-Host "Found $($proxies.Count) proxies configured:" -ForegroundColor Green
Write-Host ""

foreach ($proxy in $proxies) {
    $parts = $proxy -split '@'
    $creds = $parts[0] -split ':'
    $host_port = $parts[1]
    
    Write-Host "  ✓ IP: $host_port (User: $($creds[0]))" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open your browser (Edge/Chrome)" -ForegroundColor White
Write-Host "2. Go to: edge://extensions/ or chrome://extensions/" -ForegroundColor White
Write-Host "3. Click 'Reload' on the EKW extension" -ForegroundColor White
Write-Host "4. Open extension popup -> Settings tab" -ForegroundColor White
Write-Host "5. Copy proxies from DEFAULT_PROXIES.txt" -ForegroundColor White
Write-Host "6. Paste into 'Proxy' field" -ForegroundColor White
Write-Host "7. Click 'Save Settings'" -ForegroundColor White
Write-Host ""

$copyToClipboard = Read-Host "Copy proxy list to clipboard now? (Y/N)"

if ($copyToClipboard -eq 'Y' -or $copyToClipboard -eq 'y') {
    $proxyText = $proxies -join "`n"
    Set-Clipboard -Value $proxyText
    Write-Host ""
    Write-Host "✓ Proxies copied to clipboard!" -ForegroundColor Green
    Write-Host "  Now paste them into the extension settings." -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "You can manually copy from: DEFAULT_PROXIES.txt" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
