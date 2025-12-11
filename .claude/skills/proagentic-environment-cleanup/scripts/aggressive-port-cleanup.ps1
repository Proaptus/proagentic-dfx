# Aggressive Port Cleanup Script for Windows
# Handles stale processes that prevent app startup
# Usage: .\scripts\aggressive-port-cleanup.ps1

Write-Host "`n=== Aggressive Port Cleanup Starting ===" -ForegroundColor Cyan

function Kill-ProcessOnPort {
    param(
        [int]$Port,
        [string]$Description
    )

    Write-Host "`nCleaning port $Port ($Description)..." -ForegroundColor Yellow

    # Find process using the port
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue

    if ($connections) {
        foreach ($conn in $connections) {
            $procId = $conn.OwningProcess
            $process = Get-Process -Id $procId -ErrorAction SilentlyContinue

            if ($process) {
                Write-Host "  Found: PID $procId ($($process.ProcessName))" -ForegroundColor Red
                try {
                    Stop-Process -Id $procId -Force -ErrorAction Stop
                    Write-Host "  Killed PID $procId" -ForegroundColor Green
                } catch {
                    Write-Host "  Failed to kill PID $procId`: $_" -ForegroundColor Red
                }
            }
        }
        Start-Sleep -Seconds 1
    } else {
        Write-Host "  Port $Port is already free" -ForegroundColor Green
    }

    # Verify port is free
    $stillInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if (-not $stillInUse) {
        Write-Host "  Port $Port is now clean" -ForegroundColor Green
    } else {
        Write-Host "  Warning: Port $Port may still have processes" -ForegroundColor Yellow
    }
}

# Clean main development ports
Kill-ProcessOnPort -Port 3000 -Description "Next.js Dev Server"
Kill-ProcessOnPort -Port 3001 -Description "Next.js Dev Server +1"
Kill-ProcessOnPort -Port 5173 -Description "Vite Dev Server"
Kill-ProcessOnPort -Port 5174 -Description "Vite Dev Server +1"
Kill-ProcessOnPort -Port 8080 -Description "Backend/Mock Server"
Kill-ProcessOnPort -Port 8081 -Description "Backend +1"

Write-Host "`n=== Port Cleanup Complete ===" -ForegroundColor Green

# Show current port usage
Write-Host "`nCurrent dev port status:" -ForegroundColor Cyan
$devPorts = @(3000, 3001, 5173, 5174, 8080, 8081)
foreach ($port in $devPorts) {
    $inUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($inUse) {
        $procId = $inUse[0].OwningProcess
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        Write-Host "  Port $port`: IN USE (PID $procId - $($proc.ProcessName))" -ForegroundColor Red
    } else {
        Write-Host "  Port $port`: FREE" -ForegroundColor Green
    }
}
