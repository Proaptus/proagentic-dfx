# ProAgentic System Health Check Script (Windows)
# Shows comprehensive system diagnostics and health status
# Usage: .\scripts\system-health-check.ps1

Write-Host "`n=== ProAgentic System Health Check ===" -ForegroundColor Cyan
Write-Host ""

# Disk Usage
Write-Host "Disk Usage:" -ForegroundColor Yellow
$disk = Get-PSDrive C
$diskUsedGB = [math]::Round(($disk.Used) / 1GB, 2)
$diskTotalGB = [math]::Round(($disk.Used + $disk.Free) / 1GB, 2)
$diskPercent = [math]::Round(($disk.Used / ($disk.Used + $disk.Free)) * 100, 1)

if ($diskPercent -lt 50) {
    Write-Host "  [OK] Disk: $diskUsedGB GB / $diskTotalGB GB ($diskPercent%) - HEALTHY" -ForegroundColor Green
} elseif ($diskPercent -lt 70) {
    Write-Host "  [WARN] Disk: $diskUsedGB GB / $diskTotalGB GB ($diskPercent%) - CAUTION" -ForegroundColor Yellow
} else {
    Write-Host "  [CRITICAL] Disk: $diskUsedGB GB / $diskTotalGB GB ($diskPercent%) - URGENT" -ForegroundColor Red
}

# Memory
Write-Host "`nMemory:" -ForegroundColor Yellow
$mem = Get-CimInstance Win32_OperatingSystem
$totalMemGB = [math]::Round($mem.TotalVisibleMemorySize / 1MB, 2)
$freeMemGB = [math]::Round($mem.FreePhysicalMemory / 1MB, 2)
$usedMemGB = [math]::Round($totalMemGB - $freeMemGB, 2)
$memPercent = [math]::Round(($usedMemGB / $totalMemGB) * 100, 1)

if ($memPercent -lt 60) {
    Write-Host "  [OK] Memory: $usedMemGB GB / $totalMemGB GB ($memPercent%) - HEALTHY" -ForegroundColor Green
} elseif ($memPercent -lt 80) {
    Write-Host "  [WARN] Memory: $usedMemGB GB / $totalMemGB GB ($memPercent%) - CAUTION" -ForegroundColor Yellow
} else {
    Write-Host "  [CRITICAL] Memory: $usedMemGB GB / $totalMemGB GB ($memPercent%) - CRITICAL" -ForegroundColor Red
}

# Port Status
Write-Host "`nDevelopment Ports:" -ForegroundColor Yellow
$devPorts = @(
    @{Port=3000; Desc="Next.js"},
    @{Port=5173; Desc="Vite"},
    @{Port=8080; Desc="Backend"}
)

foreach ($p in $devPorts) {
    $conn = Get-NetTCPConnection -LocalPort $p.Port -ErrorAction SilentlyContinue
    if ($conn) {
        $procId = $conn[0].OwningProcess
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        Write-Host "  [IN USE] Port $($p.Port) ($($p.Desc)): PID $procId ($($proc.ProcessName))" -ForegroundColor Red
    } else {
        Write-Host "  [FREE] Port $($p.Port) ($($p.Desc))" -ForegroundColor Green
    }
}

# Node/NPM processes
Write-Host "`nNode.js Processes:" -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "  Found $($nodeProcesses.Count) Node.js process(es):" -ForegroundColor Yellow
    foreach ($proc in $nodeProcesses | Select-Object -First 5) {
        $memMB = [math]::Round($proc.WorkingSet64 / 1MB, 1)
        Write-Host "    PID $($proc.Id): $memMB MB" -ForegroundColor Gray
    }
} else {
    Write-Host "  No Node.js processes running" -ForegroundColor Green
}

# Chrome processes (for Playwright)
Write-Host "`nChrome/Chromium Processes:" -ForegroundColor Yellow
$chromeProcesses = Get-Process -Name "chrome", "chromium", "msedge" -ErrorAction SilentlyContinue
if ($chromeProcesses) {
    $chromeCount = $chromeProcesses.Count
    $chromeMemMB = [math]::Round(($chromeProcesses | Measure-Object -Property WorkingSet64 -Sum).Sum / 1MB, 1)
    if ($chromeCount -gt 20) {
        Write-Host "  [WARN] $chromeCount browser processes ($chromeMemMB MB) - Consider closing some" -ForegroundColor Yellow
    } else {
        Write-Host "  [OK] $chromeCount browser process(es) ($chromeMemMB MB)" -ForegroundColor Green
    }
} else {
    Write-Host "  No browser processes" -ForegroundColor Green
}

# Docker (if available)
Write-Host "`nDocker:" -ForegroundColor Yellow
$docker = Get-Command docker -ErrorAction SilentlyContinue
if ($docker) {
    try {
        $dockerVersion = docker --version 2>&1
        Write-Host "  [OK] $dockerVersion" -ForegroundColor Green

        $containers = docker ps -q 2>&1
        if ($containers -and $containers.Count -gt 0) {
            Write-Host "  Running containers: $($containers.Count)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [WARN] Docker installed but daemon not running" -ForegroundColor Yellow
    }
} else {
    Write-Host "  Docker not installed (not required)" -ForegroundColor Gray
}

# Top Memory Consumers
Write-Host "`nTop 5 Memory Consumers:" -ForegroundColor Yellow
Get-Process | Sort-Object -Property WorkingSet64 -Descending | Select-Object -First 5 | ForEach-Object {
    $memMB = [math]::Round($_.WorkingSet64 / 1MB, 1)
    Write-Host "  $memMB MB - $($_.ProcessName)" -ForegroundColor Gray
}

# Project-specific checks
Write-Host "`nProject Status:" -ForegroundColor Yellow
$projectRoot = "C:\Users\chine\Projects\proagentic-dfx\proagentic-dfx"

# node_modules
if (Test-Path "$projectRoot\node_modules") {
    $nmSize = [math]::Round((Get-ChildItem "$projectRoot\node_modules" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB, 0)
    Write-Host "  node_modules: $nmSize MB" -ForegroundColor Gray
} else {
    Write-Host "  [WARN] node_modules not found - run npm install" -ForegroundColor Yellow
}

# .next cache
if (Test-Path "$projectRoot\.next") {
    $nextSize = [math]::Round((Get-ChildItem "$projectRoot\.next" -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB, 0)
    Write-Host "  .next cache: $nextSize MB" -ForegroundColor Gray
}

# Overall Status
Write-Host "`n========================================" -ForegroundColor Cyan
if ($diskPercent -lt 70 -and $memPercent -lt 80) {
    Write-Host "SYSTEM STATUS: READY FOR DEVELOPMENT" -ForegroundColor Green
} elseif ($diskPercent -lt 85 -and $memPercent -lt 90) {
    Write-Host "SYSTEM STATUS: CAUTION - MONITOR RESOURCES" -ForegroundColor Yellow
} else {
    Write-Host "SYSTEM STATUS: CLEANUP RECOMMENDED" -ForegroundColor Red
}
Write-Host ""
