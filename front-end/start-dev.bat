@echo off
echo Starting Next.js development server...
cd /d "C:\Sites\ikdesign\EDTect\front-end"
echo Current directory: %CD%
echo.
echo Attempting to start with npm...
call npm run dev
pause
