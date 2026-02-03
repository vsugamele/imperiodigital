# Setup de Protecao do Sistema
Write-Host "Configurando protecao do sistema..." -ForegroundColor Cyan

# Criar pastas
$folders = @("backups", "memory", "logs", "recovery")
foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
        Write-Host "Criado: $folder" -ForegroundColor Green
    }
}

# Primeiro backup
Write-Host "Fazendo primeiro backup..." -ForegroundColor Yellow
& ".\backup-sistema.ps1"

# Health check
Write-Host "Executando health check..." -ForegroundColor Yellow
node health-check.js

Write-Host "Sistema protegido com sucesso!" -ForegroundColor Green