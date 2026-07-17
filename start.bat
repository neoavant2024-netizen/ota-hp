@echo off
cd /d "%~dp0"
echo ============================================
echo   White-Ota Renewal - Preview
echo ============================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js / npm was not found.
  echo Please install Node.js from https://nodejs.org/ , then run this again.
  echo.
  pause
  exit /b
)

if not exist node_modules (
  echo Installing dependencies for the first time. This may take a minute...
  call npm install
  echo.
)

echo Starting the preview server...
call npm run dev
echo.

echo Opening http://localhost:4321 in your browser...
timeout /t 2 >nul
start "" http://localhost:4321

echo.
echo ============================================
echo  The site is running at  http://localhost:4321
echo  If the browser did not open, type that address manually.
echo  To stop the server, run  stop.bat
echo ============================================
echo.
pause
