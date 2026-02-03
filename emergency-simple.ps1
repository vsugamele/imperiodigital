# EMERGENCY RECOVERY COMMANDS
Write-Host ""
Write-Host "=========================================" -ForegroundColor Red
Write-Host "       EMERGENCY RECOVERY SYSTEM" -ForegroundColor Red  
Write-Host "=========================================" -ForegroundColor Red
Write-Host ""

Write-Host "COMANDOS DISPONIVEIS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. BACKUP:" -ForegroundColor Cyan
Write-Host "   .\backup-fixed.ps1" -ForegroundColor White
Write-Host ""
Write-Host "2. HEALTH CHECK:" -ForegroundColor Cyan  
Write-Host "   node health-check.js" -ForegroundColor White
Write-Host ""
Write-Host "3. TESTE DE GERACAO:" -ForegroundColor Cyan
Write-Host "   node laise-final.js" -ForegroundColor White
Write-Host ""
Write-Host "4. RECOVERY:" -ForegroundColor Cyan
Write-Host "   .\recovery-sistema.ps1" -ForegroundColor White
Write-Host ""

Write-Host "STATUS ATUAL:" -ForegroundColor Yellow

# Verificar arquivos criticos
if (Test-Path "laise-final.js") {
    Write-Host "Script principal: OK" -ForegroundColor Green
} else {
    Write-Host "Script principal: MISSING" -ForegroundColor Red
}

if (Test-Path "config\token.json") {
    Write-Host "Credenciais: OK" -ForegroundColor Green
} else {
    Write-Host "Credenciais: MISSING" -ForegroundColor Red  
}

# Contar backups
$backupCount = (Get-ChildItem "backups" -ErrorAction SilentlyContinue).Count
Write-Host "Backups disponiveis: $backupCount" -ForegroundColor Cyan

Write-Host ""
Write-Host "Sistema de protecao ativo!" -ForegroundColor Green
Write-Host ""