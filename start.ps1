# ============================================
# David & Farid - הפעלה נקייה
# ============================================

Write-Host "🧹 מנקה ומתחיל מחדש..." -ForegroundColor Cyan

# עצור תהליכים קיימים
$nodeProcess = Get-Process -Name node -ErrorAction SilentlyContinue
$ngrokProcess = Get-Process -Name ngrok -ErrorAction SilentlyContinue

if ($nodeProcess) {
    Write-Host "עוצר Node.js..." -ForegroundColor Yellow
    $nodeProcess | Stop-Process -Force
    Start-Sleep -Seconds 2
}

if ($ngrokProcess) {
    Write-Host "עוצר Ngrok..." -ForegroundColor Yellow
    $ngrokProcess | Stop-Process -Force
    Start-Sleep -Seconds 2
}

# עבור לפרויקט
Set-Location "D:\6\DAVIDANDFARS\tax-landing-page"

# הפעל את השרת
Write-Host "🚀 מפעיל שרת..." -ForegroundColor Green
$serverJob = Start-Job -ScriptBlock {
    Set-Location "D:\6\DAVIDANDFARS\tax-landing-page"
    node server.js
}

# המתן שהשרת יתחיל
Start-Sleep -Seconds 3

# בדוק שהשרת עובד
try {
    $health = Invoke-RestMethod -Uri "http://localhost:5001/api/health" -TimeoutSec 5
    Write-Host "✅ השרת פעיל: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ השרת לא זמין" -ForegroundColor Red
    exit 1
}

# שאל את המשתמש לגבי Ngrok
Write-Host "`n🌐 האם להפעיל Ngrok?" -ForegroundColor Cyan
$response = Read-Host "הקלד 'y' עבור כן, או משהו אחר להמתנה"

if ($response -eq 'y') {
    Write-Host "מפעיל Ngrok בחלון נפרד..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit -Command `"cd 'D:\6\DAVIDANDFARS\tax-landing-page'; ngrok http 5001`""
}

# הצג קישורים
Write-Host "`n🔗 הקישורים שלך:" -ForegroundColor Magenta
Write-Host "   מקומי:     http://localhost:5001" -ForegroundColor Green
Write-Host "   טופס:      http://localhost:5001/form25.html" -ForegroundColor Green
Write-Host "   דשבורד:    http://localhost:5001/dashboard.html" -ForegroundColor Green
Write-Host "   API:       http://localhost:5001/api/health" -ForegroundColor Green

if ($response -eq 'y') {
    Write-Host "`n⏳ המתן 5-10 שניות ל-Ngrok להתחבר..." -ForegroundColor Yellow
}

# פתח דפדפן
Start-Process "http://localhost:5001"

Write-Host "`n🎯 המערכת פועלת! לחץ Ctrl+C לעצירה." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

# המתן עד Ctrl+C
try {
    while ($true) {
        Start-Sleep -Seconds 10
    }
} finally {
    Write-Host "`n🛑 עוצר את הכל..." -ForegroundColor Red
    Get-Process -Name node, ngrok -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Job | Remove-Job -Force
}
