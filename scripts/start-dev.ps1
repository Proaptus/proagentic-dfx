# PowerShell script to start ProAgentic DfX development environment
# Usage: .\scripts\start-dev.ps1

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  ProAgentic DfX Development Environment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-PortInUse {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

# Function to kill process on port
function Stop-ProcessOnPort {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process -and $process.Name -ne "System") {
                Write-Host "Killing process $($process.Name) (PID: $($process.Id)) on port $Port" -ForegroundColor Yellow
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
        Start-Sleep -Seconds 2
    }
}

# Function to wait for port to be ready
function Wait-ForPort {
    param(
        [int]$Port,
        [int]$TimeoutSeconds = 60
    )
    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        try {
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $tcpClient.Connect("localhost", $Port)
            $tcpClient.Close()
            return $true
        }
        catch {
            Start-Sleep -Seconds 1
            $elapsed++
            Write-Host "." -NoNewline
        }
    }
    return $false
}

# Step 1: Clean up existing processes
Write-Host "[1/4] Cleaning up existing processes..." -ForegroundColor Yellow
if (Test-PortInUse -Port 3000) {
    Write-Host "  Port 3000 in use, stopping..." -ForegroundColor Yellow
    Stop-ProcessOnPort -Port 3000
}
if (Test-PortInUse -Port 3001) {
    Write-Host "  Port 3001 in use, stopping..." -ForegroundColor Yellow
    Stop-ProcessOnPort -Port 3001
}
Write-Host "  Ports cleared!" -ForegroundColor Green
Write-Host ""

# Step 2: Change to project root
$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $projectRoot
Write-Host "[2/4] Project root: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# Step 3: Start Mock Server
Write-Host "[3/4] Starting Mock Server on port 3001..." -ForegroundColor Yellow
$mockServerPath = Join-Path $projectRoot "h2-tank-mock-server"
$mockServerJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev 2>&1
} -ArgumentList $mockServerPath

Write-Host "  Waiting for mock server to be ready" -NoNewline -ForegroundColor Cyan
$mockReady = Wait-ForPort -Port 3001 -TimeoutSeconds 30
Write-Host ""

if (-not $mockReady) {
    Write-Host "  ERROR: Mock server failed to start!" -ForegroundColor Red
    Write-Host "  Check the logs above for errors." -ForegroundColor Red
    Receive-Job -Job $mockServerJob
    Stop-Job -Job $mockServerJob
    Remove-Job -Job $mockServerJob
    exit 1
}

Write-Host "  Mock Server ready at http://localhost:3001" -ForegroundColor Green
Write-Host ""

# Step 4: Start Frontend
Write-Host "[4/4] Starting Frontend on port 3000..." -ForegroundColor Yellow
$frontendPath = Join-Path $projectRoot "proagentic-dfx"
$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev 2>&1
} -ArgumentList $frontendPath

Write-Host "  Waiting for frontend to be ready" -NoNewline -ForegroundColor Cyan
$frontendReady = Wait-ForPort -Port 3000 -TimeoutSeconds 60
Write-Host ""

if (-not $frontendReady) {
    Write-Host "  ERROR: Frontend failed to start!" -ForegroundColor Red
    Write-Host "  Check the logs above for errors." -ForegroundColor Red
    Receive-Job -Job $frontendJob
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $mockServerJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $mockServerJob -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "  Frontend ready at http://localhost:3000" -ForegroundColor Green
Write-Host ""

# Success!
Write-Host "============================================" -ForegroundColor Green
Write-Host "  Development Environment Ready!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "  Mock Server: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "  Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Keep running and show logs
try {
    while ($true) {
        # Check if jobs are still running
        if ($mockServerJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
            Write-Host "A server has failed!" -ForegroundColor Red
            break
        }

        # Output any new logs
        $mockOutput = Receive-Job -Job $mockServerJob -ErrorAction SilentlyContinue
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue

        if ($mockOutput) {
            $mockOutput | ForEach-Object { Write-Host "[Mock] $_" -ForegroundColor DarkGray }
        }
        if ($frontendOutput) {
            $frontendOutput | ForEach-Object { Write-Host "[Frontend] $_" -ForegroundColor DarkCyan }
        }

        Start-Sleep -Milliseconds 500
    }
}
finally {
    Write-Host ""
    Write-Host "Shutting down servers..." -ForegroundColor Yellow
    Stop-Job -Job $mockServerJob -ErrorAction SilentlyContinue
    Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job -Job $mockServerJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob -ErrorAction SilentlyContinue

    # Clean up ports
    Stop-ProcessOnPort -Port 3000
    Stop-ProcessOnPort -Port 3001

    Write-Host "Done!" -ForegroundColor Green
}
