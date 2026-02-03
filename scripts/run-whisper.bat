@echo off
REM Whisper Transcriber - Full Path Version
REM Usage: run-whisper.bat "audio_file.ogg"

setlocal enabledelayedexpansion

if "%1"=="" (
    echo Uso: run-whisper.bat "arquivo.ogg"
    exit /b 1
)

set PYTHON="C:\Users\vsuga\AppData\Local\Python\pythoncore-3.14-64\python.exe"

%PYTHON% -m whisper "%1" --model base --language pt --output_format txt --output_dir "%~dp1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Transcricao concluida!
    echo.
) else (
    echo Erro na transcricao
    exit /b 1
)
