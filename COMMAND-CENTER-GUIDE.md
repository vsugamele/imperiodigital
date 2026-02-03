# 🎛️ COMMAND CENTER - GUIA COMPLETO

## 📁 CAMINHOS IMPORTANTES

### Supabase SQL
Acesse: **https://supabase.com/dashboard/project/sxiqbhcnkzrrenzgncss/sql**

Cole o conteúdo de:
```
C:\Users\vsuga\clawd\ops-dashboard\supabase\pipeline-health-schema.sql
```

---

## 🆕 COMMAND CENTER (NOVO!)

Acesse: **http://localhost:3000/dashboard/command-center**

Funcionalidades:
- 📊 Overview com métricas em tempo real
- 🔄 Pipeline visual de todos os produtos
- 🤖 Alex Monitor (status, tarefa atual, uptime)
- 🏗️ Arquitetura do sistema
- 📅 Cronograma de automações

---

## 🔇 SILENCIAR PROCESSOS

### Rodar script silenciosamente:
```powershell
# PowerShell
.\scripts\run-silent.ps1 "scripts\schedule-next-day.js" "teo"

# Ou via Node (para integrar em automações)
node scripts/kill-noise.js --run "scripts/schedule-next-day.js" "teo"
```

### Listar processos com janela:
```bash
node scripts/kill-noise.js --list
```

### Matar processos barulhentos:
```bash
node scripts/kill-noise.js --kill-all
# ⚠️ CUIDADO: mata todos os processos node!
```

---

## 📊 DASHBOARD PADRÃO

Acesse: **http://localhost:3000/dashboard**

Tabs disponíveis:
- 📈 **Visão Geral** - Marketing + Custos
- 📟 **Operações & Jobs** - Kanban + Pipeline Health + Timeline
- 🧠 **Inteligência & Tasks** - Arquitetura + Skills

---

## 🎯 FLUXO DE USO

### 1. Gerar vídeos (silencioso)
```powershell
.\scripts\run-silent.ps1 "scripts\schedule-next-day.js" "teo"
```

### 2. Verificar status do pipeline
```bash
node scripts/pipeline-health-check.js
```

### 3. Verificar custos
```bash
# No dashboard ou:
node scripts/ai-usage-enhanced.js  # Gera summary
```

### 4. Abrir Command Center
```
http://localhost:3000/dashboard/command-center
```

---

## 📈 PIPELINE STEPS

```
📥 IMG  →  🎨 GEN  →  🎬 VID  →  ☁️ UP  →  📅 SCH
  ↓          ↓          ↓          ↓          ↓
Download   Gemini    FFmpeg     Drive    Upload-Post
(no cost?)  ($$$)     (local)   (local)    (API)
```

---

## 💰 CUSTOS

### Gemini 3 Pro Image Preview
- Input: $0.55/1M tokens
- Output: $1.65/1M tokens
- Custo médio por imagem: **$0.02-$0.05**

### Economia com no_cost
- Se usar imagem do Drive `/no_cost/images`: **$0**
- Se gerar com Gemini: **~$0.03**

---

## 🔄 AUTOMAÇÕES ATIVAS

| Job | Schedule | Descrição |
|-----|----------|-----------|
| igaming_schedule_dplus1 | 5 7 * * * | Gera 6 vídeos por perfil |
| igaming_poll_status | 0 9,21 * * * | Verifica status posts |
| ops_autopilot | 0 */6 * * * | Avança tasks do kanban |
| jp_schedule | 45 7 * * * | Agenda vídeos JP |
| vanessa_weekly | 0 8 * * 1 | Planeja semana Vanessa |

---

## 🛠️ TROUBLESHOOTING

### "Supabase não disponível"
1. Execute o SQL no dashboard do Supabase
2. Instale dependência: `cd ops-dashboard && npm install @supabase/supabase-js`

### Terminal abrindo o tempo todo
```bash
# Verificar quem está abrindo terminal
node scripts/kill-noise.js --list

# Usar modo silencioso
.\scripts\run-silent.ps1 "scripts\script.bat"
```

### Pipeline mostrando 0 vídeos
```bash
# Regenerar health check
node scripts/pipeline-health-check.js
```

---

## 📞 ACESSOS

- **Dashboard**: http://localhost:3000/dashboard
- **Command Center**: http://localhost:3000/dashboard/command-center
- **Supabase**: https://supabase.com/dashboard/project/sxiqbhcnkzrrenzgncss
- **GitHub**: (repo local em C:\Users\vsuga\clawd)

---

**Atualizado em:** 2026-02-02
