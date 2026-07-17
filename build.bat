@echo off
cd /d "%~dp0"
echo Building static site into the dist folder...
call npm run build
echo.
echo Done. Upload the contents of the dist folder to your server.
pause
