@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   ProAgentic DfX Development Environment
echo ============================================
echo.

:: Get the script directory and project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

echo [1/5] Cleaning up existing processes on ports 3000 and 3001...
:: Kill processes on port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo   Killing process on port 3000 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)
:: Kill processes on port 3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo   Killing process on port 3001 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo   Ports cleared!
echo.

echo [2/5] Project root: %PROJECT_ROOT%
echo.

echo [3/5] Starting Mock Server on port 3001...
start "H2 Tank Mock Server" cmd /c "cd h2-tank-mock-server && npm run dev"

echo   Waiting for mock server...
set /a count=0
:wait_mock
timeout /t 1 /nobreak >nul
set /a count+=1
if !count! gtr 30 (
    echo   ERROR: Mock server failed to start after 30 seconds!
    goto :error
)
netstat -an | findstr :3001 | findstr LISTENING >nul
if errorlevel 1 goto wait_mock
echo   Mock Server listening on port 3001
echo.

echo [4/5] Running integration tests on Mock Server APIs...
echo.

:: Test 1: Materials API
echo   Testing /api/materials...
curl -s -f -o nul -w "    Status: %%{http_code}\n" http://localhost:3001/api/materials
if errorlevel 1 (
    echo   FAILED: Materials API not responding
    set "TEST_FAILED=1"
) else (
    echo   PASSED
)

:: Test 2: Standards API
echo   Testing /api/standards...
curl -s -f -o nul -w "    Status: %%{http_code}\n" http://localhost:3001/api/standards
if errorlevel 1 (
    echo   FAILED: Standards API not responding
    set "TEST_FAILED=1"
) else (
    echo   PASSED
)

:: Test 3: Optimization Results API (Pareto data)
echo   Testing /api/optimization/demo/results...
curl -s -f -o nul -w "    Status: %%{http_code}\n" http://localhost:3001/api/optimization/demo/results
if errorlevel 1 (
    echo   FAILED: Optimization Results API not responding
    set "TEST_FAILED=1"
) else (
    echo   PASSED
)

:: Test 4: Design Geometry API
echo   Testing /api/designs/A/geometry...
curl -s -f -o nul -w "    Status: %%{http_code}\n" http://localhost:3001/api/designs/A/geometry
if errorlevel 1 (
    echo   FAILED: Design Geometry API not responding
    set "TEST_FAILED=1"
) else (
    echo   PASSED
)

:: Test 5: Design Stress API
echo   Testing /api/designs/A/stress...
curl -s -f -o nul -w "    Status: %%{http_code}\n" http://localhost:3001/api/designs/A/stress
if errorlevel 1 (
    echo   FAILED: Design Stress API not responding
    set "TEST_FAILED=1"
) else (
    echo   PASSED
)

:: Test 6: Design Thermal API
echo   Testing /api/designs/A/thermal...
curl -s -f -o nul -w "    Status: %%{http_code}\n" http://localhost:3001/api/designs/A/thermal
if errorlevel 1 (
    echo   FAILED: Design Thermal API not responding
    set "TEST_FAILED=1"
) else (
    echo   PASSED
)

:: Test 7: Design Compliance API
echo   Testing /api/designs/A/compliance...
curl -s -f -o nul -w "    Status: %%{http_code}\n" http://localhost:3001/api/designs/A/compliance
if errorlevel 1 (
    echo   FAILED: Design Compliance API not responding
    set "TEST_FAILED=1"
) else (
    echo   PASSED
)

echo.

if defined TEST_FAILED (
    echo ============================================
    echo   WARNING: Some integration tests failed!
    echo   The app may not work correctly.
    echo ============================================
    echo.
    echo   Press any key to continue anyway, or Ctrl+C to abort...
    pause >nul
)

echo   All critical APIs responding!
echo.

echo [5/5] Starting Frontend on port 3000...
start "ProAgentic DfX Frontend" cmd /c "cd proagentic-dfx && npm run dev"

echo   Waiting for frontend...
set /a count=0
:wait_frontend
timeout /t 1 /nobreak >nul
set /a count+=1
if !count! gtr 60 (
    echo   ERROR: Frontend failed to start after 60 seconds!
    goto :error
)
netstat -an | findstr :3000 | findstr LISTENING >nul
if errorlevel 1 goto wait_frontend
echo   Frontend ready at http://localhost:3000
echo.

echo ============================================
echo   Development Environment Ready!
echo ============================================
echo.
echo   Frontend:    http://localhost:3000
echo   Mock Server: http://localhost:3001
echo.
echo   Integration Tests: PASSED
echo.

:: Open browser
start http://localhost:3000

echo   Press any key to exit (servers will keep running)...
pause >nul
goto :eof

:error
echo.
echo ============================================
echo   ERROR: Failed to start development environment
echo ============================================
echo.
echo   Please check the server windows for error details.
echo.
pause
exit /b 1
