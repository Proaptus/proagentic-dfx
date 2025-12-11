# Test Artifact Cleanup Script for ProAgentic (Windows)
# Removes old coverage reports, test results, and screenshots
# Usage: .\scripts\cleanup-artifacts.ps1

Write-Host "`n=== ProAgentic Test Artifact Cleanup ===" -ForegroundColor Cyan

$projectRoot = "C:\Users\chine\Projects\proagentic-dfx\proagentic-dfx"

# Verify we're in the right place
if (-not (Test-Path "$projectRoot\package.json")) {
    Write-Host "Error: package.json not found at $projectRoot" -ForegroundColor Red
    exit 1
}

$cleaned = @()
$skipped = @()
$freedMB = 0

function Clean-Directory {
    param(
        [string]$Dir,
        [string]$Description
    )

    $fullPath = Join-Path $projectRoot $Dir

    if (Test-Path $fullPath) {
        # Get size before
        $sizeBefore = [math]::Round((Get-ChildItem $fullPath -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB, 2)

        Write-Host "  Cleaning $Description ($sizeBefore MB)..." -ForegroundColor Yellow
        Remove-Item $fullPath -Recurse -Force -ErrorAction SilentlyContinue

        $script:cleaned += "$Dir ($sizeBefore MB)"
        $script:freedMB += $sizeBefore
    } else {
        $script:skipped += "$Dir (doesn't exist)"
    }
}

# Clean coverage reports (largest)
Clean-Directory "coverage" "coverage reports"

# Clean test results
Clean-Directory "test-results" "test results"

# Clean Playwright cache and reports
Clean-Directory ".playwright" "Playwright cache"
Clean-Directory "playwright-report" "Playwright report"

# Clean screenshot artifacts
Clean-Directory "uat-screenshots" "UAT screenshots"
Clean-Directory "e2e-screenshots" "E2E screenshots"

# Clean build cache
Clean-Directory ".next" "Next.js build cache"

# Clean old log files
$logFiles = Get-ChildItem $projectRoot -Filter "*.log" -ErrorAction SilentlyContinue
if ($logFiles) {
    $logSize = [math]::Round(($logFiles | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
    foreach ($log in $logFiles) {
        Remove-Item $log.FullName -Force -ErrorAction SilentlyContinue
    }
    $cleaned += "Log files ($logSize MB)"
    $freedMB += $logSize
}

# Clean temp files
$tempFiles = @("nul", "temp_test_fixes.txt", "test-output.txt", "test-output-2.txt", "latest-test-run.txt")
foreach ($tempFile in $tempFiles) {
    $fullPath = Join-Path $projectRoot $tempFile
    if (Test-Path $fullPath) {
        Remove-Item $fullPath -Force -ErrorAction SilentlyContinue
        $cleaned += $tempFile
    }
}

# Clean docs quarantine (old artifacts)
$quarantinePath = "C:\Users\chine\Projects\proagentic-dfx\docs\quarantine"
if (Test-Path $quarantinePath) {
    $quarantineDirs = Get-ChildItem $quarantinePath -Directory -ErrorAction SilentlyContinue
    foreach ($dir in $quarantineDirs) {
        $sizeMB = [math]::Round((Get-ChildItem $dir.FullName -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
        Remove-Item $dir.FullName -Recurse -Force -ErrorAction SilentlyContinue
        $cleaned += "quarantine/$($dir.Name) ($sizeMB MB)"
        $freedMB += $sizeMB
    }
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Green

Write-Host "`nCleaned Items:" -ForegroundColor Cyan
foreach ($item in $cleaned) {
    Write-Host "  $item" -ForegroundColor Green
}

if ($skipped.Count -gt 0) {
    Write-Host "`nSkipped (not found):" -ForegroundColor Yellow
    foreach ($item in $skipped) {
        Write-Host "  $item" -ForegroundColor Gray
    }
}

Write-Host "`nSpace Freed: $([math]::Round($freedMB, 2)) MB" -ForegroundColor Cyan
