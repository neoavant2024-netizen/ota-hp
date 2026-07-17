@echo off
cd /d "%~dp0"
echo Running diagnostics... please wait.
(
  echo === cd ===
  cd
  echo === node -v ===
  node -v
  echo === npm -v ===
  npm -v
  echo === where node ===
  where node
  echo === where npm ===
  where npm
  echo === dir top ===
  dir /b
  echo === npm install ===
  call npm install
  echo === npm run build ===
  call npm run build
  echo === END ===
) > diagnose-log.txt 2>&1
echo.
echo Finished. A file named  diagnose-log.txt  was created in this folder.
echo Please tell Claude that it is ready, or open it to see the result.
pause
