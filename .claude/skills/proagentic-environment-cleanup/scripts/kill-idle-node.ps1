# Kill idle/orphan Node.js processes
Write-Host "`nCleaning idle Node.js processes..." -ForegroundColor Yellow

$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
$killed = 0
$totalBefore = $nodeProcesses.Count

foreach ($proc in $nodeProcesses) {
    $memMB = [math]::Round($proc.WorkingSet64 / 1MB, 1)
    # Kill processes using less than 50MB (likely idle/orphaned)
    if ($memMB -lt 50) {
        Write-Host "  Killing idle node PID $($proc.Id) ($memMB MB)" -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        $killed++
    }
}

$remaining = (Get-Process -Name "node" -ErrorAction SilentlyContinue).Count
Write-Host "`nNode.js processes: $totalBefore -> $remaining (killed $killed idle processes)" -ForegroundColor Green
