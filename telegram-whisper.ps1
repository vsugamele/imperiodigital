# Script de Integração Whisper + Telegram
# Transcreve mensagens de voz do Telegram

param(
    [Parameter(Mandatory=$true)]
    [string]$AudioFile
)

Write-Host "🎤 Transcrevendo áudio do Telegram..." -ForegroundColor Cyan

# 1. Verificar se arquivo existe
if (-not (Test-Path $AudioFile)) {
    Write-Host "❌ Arquivo não encontrado: $AudioFile" -ForegroundColor Red
    exit 1
}

# 2. Converter para WAV se necessário (Telegram geralmente envia .ogg)
$wavFile = $AudioFile -replace '\.(ogg|mp3|m4a)$', '.wav'

if ($AudioFile -notlike "*.wav") {
    Write-Host "🔄 Convertendo para WAV..." -ForegroundColor Yellow
    ffmpeg -i "$AudioFile" -ar 16000 -ac 1 "$wavFile" -y 2>&1 | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro na conversão com ffmpeg" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Convertido: $wavFile" -ForegroundColor Green
} else {
    $wavFile = $AudioFile
}

# 3. Transcrever com Whisper
Write-Host "🎯 Transcrevendo com Whisper..." -ForegroundColor Yellow

$outputFile = $wavFile -replace '\.wav$', ''

.\whisper-cli.exe `
    -m "models/ggml-base.bin" `
    -f "$wavFile" `
    -l "pt" `
    -otxt `
    -of "$outputFile" `
    --no-prints

if ($LASTEXITCODE -eq 0) {
    # 4. Ler transcrição
    $transcriptionFile = "$outputFile.txt"
    
    if (Test-Path $transcriptionFile) {
        $transcription = Get-Content $transcriptionFile -Raw
        
        Write-Host "" -ForegroundColor Green
        Write-Host "✅ TRANSCRIÇÃO:" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        Write-Host $transcription -ForegroundColor White
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
        
        # Retornar transcrição (pode ser capturada por outro script)
        return $transcription
    } else {
        Write-Host "❌ Arquivo de transcrição não encontrado" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Erro na transcrição (código: $LASTEXITCODE)" -ForegroundColor Red
    exit 1
}