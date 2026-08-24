@echo off
title CRIS AI Block Scheduler - Indian Railways
echo ======================================================================
echo    Starting CRIS AI Block Scheduling System (Indian Railways)
echo ======================================================================
echo.
echo Opening browser at http://localhost:3030 ...
start http://localhost:3030
echo.
echo Starting Node.js multi-page web server on port 3030...
echo Press Ctrl+C to stop the server at any time.
echo.
node server.js
pause
