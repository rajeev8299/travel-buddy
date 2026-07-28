@echo off
cd /d "%~dp0"
echo Building static site (no server needed to view it)...
call npm run build
if errorlevel 1 (
  echo Build failed. See errors above.
  pause
  exit /b 1
)
echo Opening dist\index.html directly in your browser...
start "" "dist\index.html"
