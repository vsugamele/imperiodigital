# Pipeline Health Dashboard - README

## 🎯 Visão Geral

Este módulo adiciona visibilidade completa sobre:
- **Pipeline Health**: Status de cada step (download → generate → video → upload → schedule)
- **Token Tracker**: Uso de tokens por modelo com alertas de limite

---

## 📁 Arquivos Criados

### Scripts
- `scripts/pipeline-health-check.js` - Verifica saúde do pipeline e gera JSON
- `scripts/ai-usage-enhanced.js` - Logger de uso de IA com pricing

### Dashboard
- `ops-dashboard/src/app/dashboard/PipelineHealth.tsx` - Componente visual
- `ops-dashboard/src/app/dashboard/TokenTracker.tsx` - Tracker de tokens
- `ops-dashboard/src/app/api/pipeline-health/route.ts` - API endpoint
- `ops-dashboard/src/app/api/token-usage/route.ts` - API endpoint

### Schema SQL
- `ops-dashboard/supabase/pipeline-health-schema.sql` - Tabelas e funções

---

## 🚀 Como Usar

### 1. Gerar Relatório de Pipeline
```bash
cd C:\Users\vsuga\clawd
node scripts\pipeline-health-check.js
```

Isso gera `results/pipeline-health.json` que alimenta o dashboard.

### 2. Rodar no Dashboard
```bash
cd ops-dashboard
npm run dev
```

Acesse: http://localhost:3000/dashboard

### 3. Criar Tabelas no Supabase
Rode o SQL em `ops-dashboard/supabase/pipeline-health-schema.sql` no Supabase SQL Editor.

---

## 📊 Pipeline Steps

Cada perfil (teo/jonathan/laise/pedro) tem 5 steps monitorados:

| Step | Descrição | O que conta |
|------|-----------|-------------|
| 📥 IMG | Download imagens | Imagens geradas em `images/generated/` |
| 🎨 GEN | Geração Gemini | Arquivos de imagem PNG |
| 🎬 VID | Criação vídeos | Arquivos MP4 em `videos/` |
| ☁️ UP | Upload Drive | Assume que vídeos existentes foram upados |
| 📅 SCH | Schedule Upload-Post | Posts com status scheduled/confirmed |

---

## 🪙 Token Tracker

### Limites Configurados
- **Diário**: 1M tokens (80% = alerta)
- **Mensal**: 30M tokens (80% = alerta)

### Alertas
- 🟡 80-95% → Warning
- 🔴 95%+ → Crítico

---

## 🔧 Integração com Cron Jobs

O `schedule-next-day.js` agora chama automaticamente `pipeline-health-check.js` após agendar posts.

---

## 📈 Exemplo de Output

```
🔍 Verificando saúde dos pipelines...

✅ TEO
   Status: completed
   Vídeos hoje: 6/6
   Steps:
     📥 Imagens: 6
     🎨 Gerados: 6
     🎬 Vídeos: 6
     ☁️  Agendados: 6
```

---

## ⚠️ Troubleshooting

### "Supabase não disponível"
Execute: `npm install @supabase/supabase-js`

### Dashboard mostra "API not available"
Gere o relatório primeiro: `node scripts/pipeline-health-check.js`

### CSV parsing errors
Verifique se `results/posting-log-v2.csv` existe e tem formato válido.
