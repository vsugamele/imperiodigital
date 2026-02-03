@echo off
REM Utmify Daily Monitor - Scheduled Task
REM Roda o monitor de Utmify

cd C:\Users\vsuga\clawd
node C:\Users\vsuga\clawd\scripts\monitor-utmify.js

REM Log
echo [%date% %time%] Utmify Monitor executado >> C:\Users\vsuga\clawd\monitor-log.txt
