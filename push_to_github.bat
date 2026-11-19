@echo off
title Push Risk Radar to GitHub
color 0A
echo ===============================================================================
echo                     PUSH RISK RADAR TO YOUR GITHUB ACCOUNT
echo ===============================================================================
echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/your-username/risk-radar.git): "

if "%REPO_URL%"=="" (
    echo [!] No URL entered. Aborting.
    pause
    exit /b
)

set GIT_CMD=D:\Git\cmd\git.exe
if not exist "%GIT_CMD%" (
    set GIT_CMD=C:\Users\lenovo\AppData\Local\Programs\Git\cmd\git.exe
)
if not exist "%GIT_CMD%" (
    set GIT_CMD=git
)

cd /d "D:\Risk Radar"
"%GIT_CMD%" remote remove origin 2>nul
"%GIT_CMD%" remote add origin %REPO_URL%
"%GIT_CMD%" branch -M main
echo.
echo [*] Pushing to %REPO_URL%...
"%GIT_CMD%" push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [OK] Successfully uploaded to GitHub!
) else (
    echo [!] Push failed. Please check your GitHub repository permissions or Personal Access Token.
)
pause
