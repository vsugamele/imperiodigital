# 🛡️ SISTEMA DE PROTEÇÃO - Alex & Laise

**Sistema à prova de falhas para evitar perda de dados e corrupção de sessões.**

---

## 📋 **COMPONENTES**

### 🔧 **Scripts de Proteção**
- **`backup-sistema.ps1`** → Backup completo automático
- **`recovery-sistema.ps1`** → Restauração rápida
- **`health-check.js`** → Monitoramento de saúde
- **`clean-session.ps1`** → Limpeza de sessão corrompida
- **`setup-protection.ps1`** → Configuração inicial

### 📁 **Estrutura Criada**
```
clawd/
├── backups/           # Backups diários (últimos 7 dias)
├── memory/            # Estados e logs
├── logs/              # Scripts automáticos
├── recovery/          # Pontos de restauração
└── EMERGENCY.ps1      # Comandos de emergência
```

---

## 🚑 **CENÁRIOS DE EMERGÊNCIA**

### ❌ **Sessão Corrompida** (erro tool_use, travamento)
```powershell
# SOLUÇÃO RÁPIDA
.\clean-session.ps1
```
**O que faz:**
1. 📦 Backup de emergência
2. 🗑️ Limpa cache do Clawdbot  
3. 🔄 Restart do sistema
4. ✅ Sessão fresca

### 💥 **Arquivos Perdidos/Corrompidos**
```powershell
# RECOVERY COMPLETO
.\recovery-sistema.ps1

# OU de data específica
.\recovery-sistema.ps1 "2026-01-27_18-00"
```

### 🔍 **Sistema Instável/Lento**
```powershell
# DIAGNÓSTICO
node health-check.js
```
**Verifica:**
- ✅ Arquivos críticos
- 🔐 Credenciais válidas  
- 🌐 APIs funcionando
- 💾 Espaço disponível

---

## ⏰ **AUTOMAÇÃO**

### 📦 **Backup Automático**
- **Frequência:** Diário às 23:59
- **Retenção:** 7 dias
- **Localização:** `backups/YYYY-MM-DD_HH-mm/`

### 🔍 **Health Check**
- **Frequência:** A cada 6 horas
- **Log:** `memory/health-check.json`
- **Alertas:** Automáticos por problemas críticos

---

## 🎯 **COMANDOS ESSENCIAIS**

### 🔄 **Uso Diário**
```powershell
# Health check manual
node health-check.js

# Backup manual  
.\backup-sistema.ps1

# Gerar imagem (teste)
node laise-final.js "prompt teste"
```

### 🚨 **Emergência**
```powershell
# Ver todas as opções
.\EMERGENCY.ps1

# Sessão travada/corrompida
.\clean-session.ps1

# Perda de arquivos
.\recovery-sistema.ps1

# Sistema instável
node health-check.js
```

---

## 📊 **MONITORAMENTO**

### ✅ **Indicadores de Saúde**
- **Token Google Drive:** > 1 hora restante
- **APIs Replicate:** Response < 5s
- **Arquivos críticos:** Todos presentes
- **Workspace:** < 20 imagens acumuladas

### ⚠️ **Sinais de Alerta**
- Token expirando em < 1 hora
- APIs lentas/falhando
- Muitas imagens acumuladas
- Arquivos críticos missing

### ❌ **Problemas Críticos**
- Token expirado
- APIs inacessíveis  
- Scripts principais missing
- Workspace inacessível

---

## 🔧 **CONFIGURAÇÃO INICIAL**

### Primeira vez:
```powershell
# Setup completo
.\setup-protection.ps1
```

### Verificar se tudo funcionou:
```powershell
.\EMERGENCY.ps1  # Ver comandos disponíveis
node health-check.js  # Status completo
```

---

## 💡 **MELHORES PRÁTICAS**

### ✅ **Prevenção**
1. **Health check diário** antes de trabalho pesado
2. **Backup manual** antes de mudanças grandes  
3. **Clean session** se notar lentidão
4. **Monitorar logs** de health check

### 🚨 **Em Problemas**
1. **NUNCA deletar** backups manualmente
2. **Sempre fazer backup** antes de recovery
3. **Verificar health** após recovery
4. **Documentar** problemas encontrados

### 🎯 **Performance**
- Limpar imagens antigas (> 20 arquivos)
- Renovar token Google antes de expirar
- Restart Clawdbot semanalmente
- Monitorar uso de APIs

---

## 🔗 **ARQUIVOS CRÍTICOS**

### 🎨 **Geração de Imagens**
- `laise-final.js` → Script principal Node.js
- `config/token.json` → Credenciais Google Drive
- `config/imperio-service-account.json` → Service Account

### 🤖 **Clawdbot Core**
- `SOUL.md` → Personalidade
- `USER.md` → Contexto do usuário
- `IDENTITY.md` → Identidade do assistente
- `HEARTBEAT.md` → Tarefas periódicas

### ⚙️ **Sistema**
- `scripts/*.py` → Scripts Python originais
- `memory/*.json` → Estados salvos
- `backups/` → Histórico completo

---

## 🎉 **RESULTADO**

```
┌─────────────────────────────────┐
│   🛡️ SISTEMA PROTEGIDO          │
│   📦 Backup Automático          │
│   🔍 Monitoramento Ativo        │
│   🚑 Recovery Rápido            │
│   🧹 Prevenção de Corrupção     │
│   ✅ ZERO DOWNTIME              │
└─────────────────────────────────┘
```

**Nunca mais vamos perder tempo com sessões corrompidas!** 🚀