@echo off
rem Runs the PHP API (:8000) and the web app (:3000) in separate windows.
setlocal
cd /d "%~dp0.."

start "api" /d apps\api php -S localhost:8000 -t public
start "web" /d apps\web cmd /c npm run dev
