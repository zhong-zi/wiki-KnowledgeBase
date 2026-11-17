@echo off
rem Start the wiki: dependency containers + application in this window.
rem Usage: double-click, or run "start-docmost.cmd log" to write output to server-run.log
setlocal
title Wiki Server
cd /d "%~dp0"

set "LOGMODE="
if /i "%~1"=="log" set "LOGMODE=1"

echo [1/4] Checking Docker Engine ...
docker info >nul 2>&1
if errorlevel 1 goto nodocker

echo [2/4] Starting dependency containers (PostgreSQL / Redis / Gotenberg) ...
docker compose -f docker-compose.deps.yml up -d
if errorlevel 1 goto depsfail

echo [3/4] Locating Node.js runtime ...
set "NODE_EXE="
for /d %%d in ("%USERPROFILE%\.workbuddy\binaries\node\versions\*") do if exist "%%d\node.exe" set "NODE_EXE=%%d\node.exe"
if not defined NODE_EXE (
  for /f "delims=" %%a in ('where node 2^>nul') do if not defined NODE_EXE set "NODE_EXE=%%a"
)
if not defined NODE_EXE goto nonode
"%NODE_EXE%" -v >nul 2>&1
if errorlevel 1 goto nonode
echo       node %NODE_EXE%

if not exist "apps\server\dist\main.js" goto nobuild

echo [4/4] Starting application ...
echo       Open http://localhost:3000 after about 20 seconds.
echo       Keep this window open. Close it or press Ctrl+C to stop the app.
echo.

pushd "apps\server"
set NODE_ENV=production
if defined LOGMODE (
  "%NODE_EXE%" dist\main.js > "%~dp0server-run.log" 2>&1
) else (
  "%NODE_EXE%" dist\main.js
)
popd
echo.
echo Application has exited. Read the messages above for the reason.
pause
goto :eof

:nodocker
echo ERROR: Docker Desktop is not running. Start it, then run this again.
pause
goto :eof

:depsfail
echo ERROR: could not start the dependency containers.
echo        Run this to see the detail:
echo        docker compose -f docker-compose.deps.yml up -d
pause
goto :eof

:nonode
echo ERROR: Node.js runtime not found.
echo        Install Node.js 22 (x64) from https://nodejs.org/en/download and run this again.
pause
goto :eof

:nobuild
echo ERROR: build output missing: apps\server\dist\main.js
echo        Build first: pnpm install ^&^& pnpm build
pause
goto :eof
