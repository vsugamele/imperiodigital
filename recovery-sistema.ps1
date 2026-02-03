# Recovery do Sistema - Restauração Rápida
# Use quando a sessão corromper ou algo quebrar

param(
    [string]$BackupDate = ""
)

Write-Host "🚑 EMERGENCY RECOVERY INICIADO" -ForegroundColor Red
Write-Host "==============================" -ForegroundColor Red

if ($BackupDate -eq "") {
    # Pegar último backup
    $latestBackup = Get-ChildItem "C:\Users\vsuga\clawd\backups" | Sort-Object CreationTime -Descending | Select-Object -First 1
    $BackupDate = $latestBackup.Name
}

$backupPath = "C:\Users\vsuga\clawd\backups\$BackupDate"

if (!(Test-Path $backupPath)) {
    Write-Host "❌ Backup não encontrado: $backupPath" -ForegroundColor Red
    Write-Host "📂 Backups disponíveis:"
    Get-ChildItem "C:\Users\vsuga\clawd\backups" | Select-Object Name, CreationTime
    exit 1
}

Write-Host "📦 Restaurando de: $BackupDate" -ForegroundColor Yellow

# === RESTAURAR SCRIPTS ===
Write-Host "🔧 Restaurando scripts..."
Copy-Item "$backupPath\*.js" "." -Force
Copy-Item "$backupPath\*.ps1" "." -Force
if (Test-Path "$backupPath\scripts") {
    Copy-Item "$backupPath\scripts\*" "scripts\" -Recurse -Force
}

# === RESTAURAR CONFIGURAÇÕES ===
Write-Host "⚙️ Restaurando configs..."
if (Test-Path "$backupPath\config") {
    Copy-Item "$backupPath\config\*" "config\" -Recurse -Force
}

# === RESTAURAR WORKSPACE FILES ===
Write-Host "📄 Restaurando workspace..."
Copy-Item "$backupPath\*.md" "." -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ RECOVERY COMPLETO!" -ForegroundColor Green
Write-Host "🎯 Sistema restaurado para: $BackupDate" -ForegroundColor Green
Write-Host ""

# === TESTE BÁSICO ===
Write-Host "🧪 Testando sistema..."
if (Test-Path "laise-final.js") {
    Write-Host "✅ Script principal: OK" -ForegroundColor Green
} else {
    Write-Host "❌ Script principal: MISSING" -ForegroundColor Red
}

if (Test-Path "config\token.json") {
    Write-Host "✅ Credenciais: OK" -ForegroundColor Green  
} else {
    Write-Host "❌ Credenciais: MISSING" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Pronto para usar!" -ForegroundColor Cyan
Write-Host "💡 Teste: node laise-final.js" -ForegroundColor Yellow