@echo off
REM Daily Market Intelligence Report Scheduler for Windows
REM Run this once to setup automatic daily reports at 7 AM

setlocal enabledelayedexpansion

echo Creating Windows Task Scheduler job...
echo.

REM Get the current user
for /f "tokens=*" %%a in ('whoami') do set CURRENT_USER=%%a

REM Create the task
schtasks /create /tn "ClawdbotDailyIntelligence" /tr "node C:\Users\vsuga\clawd\scripts\run-intelligence-report.js" /sc DAILY /st 07:00 /rl HIGHEST /f

if %ERRORLEVEL% EQU 0 (
  echo.
  echo ✅ Task created successfully!
  echo ⏰ Will run every day at 7:00 AM
  echo.
  echo To verify: schtasks /query /tn ClawdbotDailyIntelligence
  echo To delete: schtasks /delete /tn ClawdbotDailyIntelligence /f
) else (
  echo.
  echo ❌ Failed to create task
  echo Make sure you're running as Administrator
)

pause
