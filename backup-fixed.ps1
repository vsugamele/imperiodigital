# Backup Sistema - Versao Corrigida
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupDir = "C:\Users\vsuga\clawd\backups\$timestamp"

Write-Host "Iniciando backup..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

# Criar subpastas
New-Item -ItemType Directory -Force -Path "$backupDir\scripts" | Out-Null
New-Item -ItemType Directory -Force -Path "$backupDir\config" | Out-Null  
New-Item -ItemType Directory -Force -Path "$backupDir\images" | Out-Null
New-Item -ItemType Directory -Force -Path "$backupDir\memory" | Out-Null

# Scripts
Write-Host "Copiando scripts..." -ForegroundColor Yellow
Copy-Item "*.js" $backupDir -Force -ErrorAction SilentlyContinue
Copy-Item "*.ps1" $backupDir -Force -ErrorAction SilentlyContinue
Copy-Item "scripts\*.py" "$backupDir\scripts\" -Force -ErrorAction SilentlyContinue

# Configs
Write-Host "Copiando configs..." -ForegroundColor Yellow  
Copy-Item "config\*.json" "$backupDir\config\" -Force -ErrorAction SilentlyContinue
Copy-Item "*.md" $backupDir -Force -ErrorAction SilentlyContinue

# Imagens
Write-Host "Copiando imagens..." -ForegroundColor Yellow
Copy-Item "*.png" "$backupDir\images\" -Force -ErrorAction SilentlyContinue
Copy-Item "*.jpg" "$backupDir\images\" -Force -ErrorAction SilentlyContinue
Copy-Item "*.webp" "$backupDir\images\" -Force -ErrorAction SilentlyContinue

# Estados
Write-Host "Copiando estados..." -ForegroundColor Yellow
Copy-Item "memory\*.json" "$backupDir\memory\" -Force -ErrorAction SilentlyContinue

Write-Host "Backup completo: $backupDir" -ForegroundColor Green

# Tamanho
$size = (Get-ChildItem $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum/1MB
Write-Host "Tamanho: $([math]::Round($size, 2)) MB" -ForegroundColor Yellow