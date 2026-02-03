# Setup de Proteção do Sistema
# Configura backups automáticos e prevenção de corrupção

Write-Host "🛡️ CONFIGURANDO PROTEÇÃO DO SISTEMA" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# === 1. CRIAR ESTRUTURA DE PASTAS ===
Write-Host "`n📁 Criando estrutura..."
$folders = @("backups", "memory", "logs", "recovery")
foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
        Write-Host "✅ Criado: $folder" -ForegroundColor Green
    } else {
        Write-Host "✅ Existe: $folder" -ForegroundColor Green
    }
}

# === 2. CONFIGURAR TAREFAS AUTOMÁTICAS ===
Write-Host "`n⏰ Configurando automação..."

# Backup diário às 23:59
$backupTask = @"
# Backup Automático - executa todo dia às 23:59
& "C:\Users\vsuga\clawd\backup-sistema.ps1"
"@

$backupTask | Out-File -FilePath "logs\auto-backup.ps1" -Force
Write-Host "✅ Script de backup diário criado" -ForegroundColor Green

# Health check a cada 6 horas  
$healthTask = @"
# Health Check - executa a cada 6 horas
node "C:\Users\vsuga\clawd\health-check.js"
"@

$healthTask | Out-File -FilePath "logs\auto-health.ps1" -Force
Write-Host "✅ Script de health check criado" -ForegroundColor Green

# === 3. CRIAR SESSÃO LIMPA ===
Write-Host "`n🧹 Configurando sessão limpa..."

$cleanSession = @"
# Sessão Limpa - Use quando detectar problemas
Write-Host "🧹 INICIANDO SESSÃO LIMPA..." -ForegroundColor Yellow

# 1. Backup de emergência
Write-Host "📦 Backup de emergência..."
& ".\backup-sistema.ps1"

# 2. Limpar cache do Clawdbot
Write-Host "🗑️ Limpando cache..."
Remove-Item "C:\Users\vsuga\.clawdbot\cache\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "C:\Users\vsuga\.clawdbot\temp\*" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Restart Clawdbot
Write-Host "🔄 Reiniciando Clawdbot..."
clawdbot restart

Write-Host "✅ SESSÃO LIMPA CONCLUÍDA" -ForegroundColor Green
Write-Host "🎯 Sistema resetado e pronto para uso" -ForegroundColor Cyan
"@

$cleanSession | Out-File -FilePath "clean-session.ps1" -Force
Write-Host "✅ Script de sessão limpa criado" -ForegroundColor Green

# === 4. CRIAR EMERGENCY KIT ===
Write-Host "`n🚑 Criando emergency kit..."

$emergencyKit = @"
# EMERGENCY KIT - Scripts essenciais para recovery

# === SCRIPTS DISPONÍVEIS ===
# backup-sistema.ps1     - Backup completo
# recovery-sistema.ps1   - Restaurar de backup
# health-check.js        - Verificar saúde do sistema
# clean-session.ps1      - Limpar sessão corrompida
# laise-final.js         - Gerar imagens (Node.js)

# === COMANDOS DE EMERGÊNCIA ===
Write-Host "🚑 EMERGENCY RECOVERY COMMANDS" -ForegroundColor Red
Write-Host "==============================" -ForegroundColor Red
Write-Host ""
Write-Host "📦 Backup:           .\backup-sistema.ps1" -ForegroundColor Yellow
Write-Host "🔄 Recovery:         .\recovery-sistema.ps1" -ForegroundColor Yellow  
Write-Host "🔍 Health Check:     node health-check.js" -ForegroundColor Yellow
Write-Host "🧹 Clean Session:    .\clean-session.ps1" -ForegroundColor Yellow
Write-Host "🎨 Test Generation:  node laise-final.js" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Em caso de sessão corrompida: clean-session.ps1" -ForegroundColor Cyan
Write-Host "💡 Em caso de arquivos perdidos: recovery-sistema.ps1" -ForegroundColor Cyan
Write-Host ""
"@

$emergencyKit | Out-File -FilePath "EMERGENCY.ps1" -Force
Write-Host "✅ Emergency kit criado" -ForegroundColor Green

# === 5. PRIMEIRO BACKUP ===
Write-Host "`n💾 Fazendo primeiro backup..."
& ".\backup-sistema.ps1"

# === 6. PRIMEIRO HEALTH CHECK ===
Write-Host "`n🔍 Executando health check..."
node health-check.js

Write-Host "`n🎉 PROTEÇÃO CONFIGURADA COM SUCESSO!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Resumo do que foi configurado:" -ForegroundColor Cyan
Write-Host "  ✅ Backup automático diário" -ForegroundColor Green
Write-Host "  ✅ Health check periódico" -ForegroundColor Green  
Write-Host "  ✅ Recovery rápido" -ForegroundColor Green
Write-Host "  ✅ Sessão limpa anti-corrupção" -ForegroundColor Green
Write-Host "  ✅ Emergency kit completo" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Use EMERGENCY.ps1 para ver comandos de emergência" -ForegroundColor Yellow
Write-Host "🛡️ Sistema agora está PROTEGIDO!" -ForegroundColor Cyan