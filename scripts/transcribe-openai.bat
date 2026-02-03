@echo off
REM OpenAI Whisper API Transcriber
REM Usage: transcribe-openai.bat "audio_file.ogg"

setlocal enabledelayedexpansion

if "%1"=="" (
    echo Uso: transcribe-openai.bat "arquivo.ogg"
    exit /b 1
)

set PYTHON="C:\Users\vsuga\AppData\Local\Python\pythoncore-3.14-64\python.exe"

REM Set OpenAI API Key (substitua com sua chave se necessário)
REM Já tá configurado no Clawdbot, mas pode usar variável de ambiente também

%PYTHON% C:\Users\vsuga\clawd\scripts\transcribe-openai.py "%1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Transcricao via OpenAI Whisper API completa!
    echo.
) else (
    echo Erro na transcricao
    exit /b 1
)
