@echo off
REM ProAgentic-DFX Windows Startup Script

setlocal enabledelayedexpansion
cd /d "%~dp0\.."

echo.
echo 🧹 Cleaning up old processes and lock files...
taskkill /F /IM node.exe /T >nul 2>&1 || echo   (No existing Node processes)
rmdir /s /q .next 2>nul || echo   (No .next cache to clean)
rmdir /s /q .turbo 2>nul || echo   (No .turbo cache to clean)

echo ✅ Cleanup complete
echo.

echo 📦 Verifying dependencies...
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install --legacy-peer-deps
  if !errorlevel! neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
  )
)
echo ✅ Dependencies verified

echo.
echo 🚀 Starting development server...
start /B npm run dev

echo ⏳ Waiting for server to be ready (max 60 seconds)...
set counter=0
:wait_loop
set /a counter+=1

for /f "tokens=1-5" %%a in ('netstat -ano ^| find "LISTENING" ^| find ":3000\|:3002"') do (
  echo.
  echo ✅ Server is ready!
  if "%%b"=="LISTENING" (
    echo 📍 Application running on detected port
  )
  echo 🔍 Open http://localhost:3000 in your browser (or http://localhost:3002 if 3000 is busy)
  echo.
  goto :done
)

if !counter! geq 60 (
  echo ❌ Server failed to start within 60 seconds
  taskkill /F /IM node.exe /T >nul 2>&1
  exit /b 1
)

echo   Attempt !counter!/60...
timeout /t 1 /nobreak >nul
goto wait_loop

:done
pause
