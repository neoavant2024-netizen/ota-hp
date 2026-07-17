@echo off
cd /d "%~dp0"
echo Opening image folders in Explorer...
start "" "%~dp0public\images\sale"
start "" "%~dp0public\images\factory"
echo.
echo  [1] sale    ... put the SALE FLYER image here
echo  [2] factory ... put the FACTORY photos here
echo.
echo  See the text file inside each folder for details.
echo.
timeout /t 3 >nul
