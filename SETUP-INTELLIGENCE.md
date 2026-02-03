# 📊 Daily Intelligence Report - Setup Guide

## ✅ O que foi configurado

- ✅ **Gerador de relatório**: Coleta crypto trends, política e trends em tempo real
- ✅ **Telegram pareado**: Mensagens saem automático pra você (Chat ID: 385573206)
- ✅ **Arquivo local**: Relatório salvo em `memory/YYYY-MM-DD-daily-intelligence.md`
- ✅ **Monitor de hora**: Sistema verifica quando é 7 AM

---

## 🚀 Como Ativar

### Opção 1: Windows Task Scheduler (Recomendado)

**Admin PowerShell:**

```powershell
schtasks /create `
  /tn "ClawdbotDailyIntelligence" `
  /tr "node C:\Users\vsuga\clawd\scripts\run-intelligence-report.js" `
  /sc DAILY /st 07:00 `
  /rl HIGHEST /f
```

Ou execute o batch file:
```
C:\Users\vsuga\clawd\scripts\schedule-daily-report.bat
```

### Opção 2: Teste Manual Agora

```bash
node C:\Users\vsuga\clawd\scripts\run-intelligence-report.js
```

---

## 📋 O que você vai receber

**Diariamente às 7:00 AM:**

1. **Telegram** — Notificação + resumo
2. **Arquivo Local** — Relatório completo em markdown
3. **Arquivo de Estado** — Tracking em `memory/heartbeat-state.json`

---

## 🔍 Estrutura do Relatório

```markdown
# Daily Intelligence Report - 2026-01-26

## 🪙 CRYPTO TRENDS
- Bitcoin price, top movers
- Market sentiment & opportunities

## 🏛️ POLITICS & POLICY  
- Brazil news & policy changes
- Global geopolitical events

## 📈 TRENDING TOPICS
- Social media trends
- Google Trends
- Viral news topics
```

---

## 🛠️ Verificar Status

```bash
# Ver se a tarefa foi criada
schtasks /query /tn ClawdbotDailyIntelligence

# Ver histórico de execuções
Get-ScheduledTaskInfo -TaskName ClawdbotDailyIntelligence

# Deletar tarefa (se precisar)
schtasks /delete /tn ClawdbotDailyIntelligence /f
```

---

## 📞 Suporte

- **Não recebeu em Telegram?** Verifique: `memory/heartbeat-state.json`
- **Erro ao agendar?** Rode PowerShell como **Administrator**
- **Quer desativar?** Delete a tarefa com o comando acima

---

**Status:** ✅ Tudo pronto! Escolha Opção 1 ou 2 acima e bora lá.
