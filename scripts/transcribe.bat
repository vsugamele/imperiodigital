@echo off
REM Wrapper para transcrever áudio com Whisper
REM Uso: transcribe.bat arquivo.ogg

if "%1"=="" (
    echo Uso: transcribe.bat arquivo.ogg
    exit /b 1
)

python C:\Users\vsuga\clawd\scripts\transcribe-audio.py "%1"
