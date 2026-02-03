# EMERGENCY RECOVERY COMMANDS
Write-Host ""
Write-Host "===========================================" -ForegroundColor Red
Write-Host "        EMERGENCY RECOVERY SYSTEM" -ForegroundColor Red  
Write-Host "===========================================" -ForegroundColor Red
Write-Host ""

Write-Host "COMANDOS DISPONÍVEIS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. BACKUP:" -ForegroundColor Cyan
Write-Host "   .\backup-fixed.ps1                  # Backup completo" -ForegroundColor White
Write-Host ""
Write-Host "2. HEALTH CHECK:" -ForegroundColor Cyan  
Write-Host "   node health-check.js               # Verificar saude" -ForegroundColor White
Write-Host ""
Write-Host "3. TESTE DE GERACAO:" -ForegroundColor Cyan
Write-Host "   node laise-final.js                # Testar sistema" -ForegroundColor White
Write-Host ""
Write-Host "4. RECOVERY:" -ForegroundColor Cyan
Write-Host "   .\recovery-sistema.ps1             # Restaurar backup" -ForegroundColor White
Write-Host ""
Write-Host "5. LISTAR BACKUPS:" -ForegroundColor Cyan  
Write-Host "   ls backups                         # Ver backups" -ForegroundColor White
Write-Host ""

Write-Host "STATUS ATUAL:" -ForegroundColor Yellow
Write-Host "=============" -ForegroundColor Yellow

# Verificar arquivos críticos
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

# Contar backups
$backupCount = (Get-ChildItem "backups" -ErrorAction SilentlyContinue).Count
Write-Host "📦 Backups disponíveis: $backupCount" -ForegroundColor Cyan

# Contar imagens
$imageCount = (Get-ChildItem "*.png","*.jpg","*.webp" -ErrorAction SilentlyContinue).Count  
Write-Host "🖼️ Imagens no workspace: $imageCount" -ForegroundColor Cyan

Write-Host ""
Write-Host "💡 DICAS RÁPIDAS:" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
Write-Host "• Sessão travada/corrompida: Restart Clawdbot" -ForegroundColor White
Write-Host "• Token expirado: Renovar no Google Console" -ForegroundColor White  
Write-Host "• Arquivos perdidos: .\recovery-sistema.ps1" -ForegroundColor White
Write-Host "• Sistema lento: node health-check.js" -ForegroundColor White
Write-Host ""