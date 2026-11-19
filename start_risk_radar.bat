@echo off
title RISK RADAR - IBM Cloud CSPM Platform
color 0B
echo ===============================================================================
echo                RISK RADAR - CLOUD SECURITY POSTURE MANAGEMENT
echo   Automated Misconfiguration Scanner & Compliance (ISO 27017 & CSA STAR)
echo ===============================================================================
echo.

set PYTHON_CMD=C:\Users\lenovo\AppData\Local\Programs\Python\Python311\python.exe
if not exist "%PYTHON_CMD%" (
    set PYTHON_CMD=python
)

echo [*] Starting Risk Radar CSPM Backend & Web Interface on Port 5000...
echo [*] Open your web browser at: http://localhost:5000
echo.
cd /d "D:\Risk Radar\backend"
"%PYTHON_CMD%" app.py
pause
