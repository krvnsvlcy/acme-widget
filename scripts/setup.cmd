@echo off
setlocal
cd /d "%~dp0.."

pushd apps\api
call composer install || exit /b 1
popd

pushd apps\web
call pnpm install || exit /b 1
popd
