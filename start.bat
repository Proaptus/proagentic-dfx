@echo off
setlocal

echo Killing existing processes on ports 3000 and 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING 2^>nul') do taskkill /PID %%a /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING 2^>nul') do taskkill /PID %%a /F >nul 2>&1
timeout /t 2 >nul

echo Starting Mock Server on port 3001...
start "Mock Server" cmd /k "cd /d C:\Users\chine\Projects\proagentic-dfx\h2-tank-mock-server && npm run dev"

echo Waiting for mock server...
:wait_mock
timeout /t 1 >nul
netstat -an | findstr ":3001.*LISTENING" >nul 2>&1
if errorlevel 1 goto wait_mock
echo Mock server ready.

echo Starting Frontend on port 3000...
start "Frontend" cmd /k "cd /d C:\Users\chine\Projects\proagentic-dfx\proagentic-dfx && npm run dev"

echo Waiting for frontend...
:wait_frontend
timeout /t 1 >nul
netstat -an | findstr ":3000.*LISTENING" >nul 2>&1
if errorlevel 1 goto wait_frontend
echo Frontend ready.

echo.
echo ========================================
echo   Both servers are running!
echo   Frontend:    http://localhost:3000
echo   Mock Server: http://localhost:3001
echo ========================================
echo.

start http://localhost:3000
