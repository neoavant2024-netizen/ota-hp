@echo off
cd /d "%~dp0"
echo Stopping the preview server...
call npx astro dev stop
echo.
echo Done.
pause
