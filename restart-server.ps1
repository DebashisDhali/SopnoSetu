# Restart Server Script
# This script helps you restart the backend server to load new routes

Write-Host "🔄 SopnoSetu Server Restart Helper" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if server is running
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "✅ Server is currently running on port 5000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Server is not running on port 5000" -ForegroundColor Red
}

Write-Host "`n📋 Instructions:" -ForegroundColor Yellow
Write-Host "================`n" -ForegroundColor Yellow

if ($serverRunning) {
    Write-Host "1. Find the terminal window running 'npm run dev' in the server folder" -ForegroundColor White
    Write-Host "2. Press Ctrl+C to stop the server" -ForegroundColor White
    Write-Host "3. Run: npm run dev" -ForegroundColor White
    Write-Host "`n💡 The new review routes will be loaded after restart!`n" -ForegroundColor Cyan
} else {
    Write-Host "1. Open a terminal in the server folder" -ForegroundColor White
    Write-Host "2. Run: cd d:\A_W\SopnoSetu\server" -ForegroundColor White
    Write-Host "3. Run: npm run dev`n" -ForegroundColor White
}

Write-Host "🎯 After restart, test the review API:" -ForegroundColor Green
Write-Host "   Visit: http://localhost:5000/api/reviews/mentor/YOUR_MENTOR_ID`n" -ForegroundColor Gray

Write-Host "📚 Documentation:" -ForegroundColor Magenta
Write-Host "   - REVIEW_TESTING_GUIDE.md - Step-by-step testing" -ForegroundColor Gray
Write-Host "   - REVIEW_SYSTEM_COMPLETE.md - Technical details" -ForegroundColor Gray
Write-Host "   - TASK_COMPLETION_SUMMARY.md - Quick overview`n" -ForegroundColor Gray

Write-Host "✨ All pending tasks are complete! Happy testing! 🚀`n" -ForegroundColor Green
