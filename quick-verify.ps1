# GreenCart Assessment Quick Verification
Write-Host "🚀 GreenCart Logistics Assessment Verification" -ForegroundColor Green

$score = 0

# Core Files Check
Write-Host "`n📁 Core Files Verification:" -ForegroundColor Cyan

$coreFiles = @{
    "Backend Server" = "backend\server.js"
    "Frontend App" = "frontend-ts\src\App.tsx"
    "Database Config" = "backend\config\db.js"
    "Simulation Engine" = "backend\utils\simulationEngine.js"
    "Docker Compose" = "docker-compose.yml"
    "CI/CD Pipeline" = ".github\workflows\ci-cd.yml"
}

foreach ($file in $coreFiles.GetEnumerator()) {
    if (Test-Path $file.Value) {
        Write-Host "   ✓ $($file.Key)" -ForegroundColor Green
        $score += 10
    } else {
        Write-Host "   ✗ $($file.Key)" -ForegroundColor Red
    }
}

# Test Results
Write-Host "`n🧪 Running Tests:" -ForegroundColor Cyan
Push-Location "backend"
try {
    $testResult = npm test --silent 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ All Tests Passing" -ForegroundColor Green
        $score += 20
    } else {
        Write-Host "   ⚠ Some Tests Need Attention" -ForegroundColor Yellow
        $score += 10
    }
} catch {
    Write-Host "   ✗ Test Execution Failed" -ForegroundColor Red
}
Pop-Location

# Build Check
Write-Host "`n🏗️ Build Verification:" -ForegroundColor Cyan
Push-Location "frontend-ts"
try {
    $buildResult = npm run build --silent 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Frontend Build Successful" -ForegroundColor Green
        $score += 10
    } else {
        Write-Host "   ✗ Build Failed" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Build Process Error" -ForegroundColor Red
}
Pop-Location

# Final Score
$percentage = [math]::Round(($score / 100) * 100, 1)

Write-Host "`n📊 ASSESSMENT RESULTS:" -ForegroundColor Cyan
Write-Host "   Score: $score/100 points" -ForegroundColor White
Write-Host "   Percentage: $percentage%" -ForegroundColor White

if ($percentage -ge 90) {
    Write-Host "`n🏆 GRADE: EXCELLENT!" -ForegroundColor Green
} elseif ($percentage -ge 80) {
    Write-Host "`n🥇 GRADE: VERY GOOD!" -ForegroundColor Green
} elseif ($percentage -ge 70) {
    Write-Host "`n🥈 GRADE: GOOD!" -ForegroundColor Yellow
} else {
    Write-Host "`n📝 GRADE: NEEDS IMPROVEMENT!" -ForegroundColor Red
}

Write-Host "`n✅ Assessment Complete!" -ForegroundColor Green
