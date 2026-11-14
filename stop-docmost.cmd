@echo off
rem Stop the Docmost app listening on port 3000 (DB containers keep running)
setlocal enabledelayedexpansion
set FOUND=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo Killing PID %%a
  taskkill /PID %%a /F >nul 2>&1
  if not errorlevel 1 set FOUND=1
)
if "!FOUND!"=="0" echo No listener on port 3000 - already stopped.
endlocal
