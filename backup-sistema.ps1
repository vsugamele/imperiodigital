# Sistema de Backup Automático - Alex & Laise
# Executa diariamente para salvar tudo que importa

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupDir = "C:\Users\vsuga\clawd\backups\$timestamp"

Write-Host "Iniciando backup do sistema..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# === SCRIPTS DE GERACAO ===
Write-Host "Copiando scripts de geracao..." -ForegroundColor Yellow
Copy-Item "*.js" $backupDir -Force
Copy-Item "*.ps1" $backupDir -Force
Copy-Item "scripts\*.py" "$backupDir\scripts\" -Recurse -Force

# === CONFIGURACOES CRITICAS ===
Write-Host "Salvando configuracoes..." -ForegroundColor Yellow
Copy-Item "config\*.json" "$backupDir\config\" -Recurse -Force
Copy-Item "*.md" $backupDir -Force

# === IMAGENS GERADAS ===
Write-Host "Backup das imagens..." -ForegroundColor Yellow
Copy-Item "*.png" "$backupDir\images\" -Force -ErrorAction SilentlyContinue
Copy-Item "*.jpg" "$backupDir\images\" -Force -ErrorAction SilentlyContinue  
Copy-Item "*.webp" "$backupDir\images\" -Force -ErrorAction SilentlyContinue

# === LOGS E ESTADOS ===
Write-Host "Salvando estados..." -ForegroundColor Yellow
Copy-Item "memory\*.json" "$backupDir\memory\" -Recurse -Force -ErrorAction SilentlyContinue

# === CLAWDBOT CONFIG ===
Write-Host "Backup Clawdbot..." -ForegroundColor Yellow
Copy-Item "C:\Users\vsuga\.clawdbot_backup\clawdbot.json" "$backupDir\clawdbot-config.json" -Force -ErrorAction SilentlyContinue

Write-Host "Backup completo: $backupDir" -ForegroundColor Green
Write-Host "Tamanho:" (Get-ChildItem $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum/1MB "MB" -ForegroundColor Yellow
Write-Host ""

# === LIMPEZA (manter so ultimos 7 dias) ===
$oldBackups = Get-ChildItem "C:\Users\vsuga\clawd\backups" | Where-Object {$_.CreationTime -lt (Get-Date).AddDays(-7)}
if ($oldBackups) {
    Write-Host "Limpando backups antigos..." -ForegroundColor Yellow
    $oldBackups | Remove-Item -Recurse -Force
}

Write-Host "Sistema protegido!" -ForegroundColor Green