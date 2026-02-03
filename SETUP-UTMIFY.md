# 🔗 Utmify Integration - Setup Guide

## ✅ O que foi configurado

- ✅ **Browser Access** — Clawdbot consegue acessar Utmify
- ✅ **Data Extraction** — Pode ler todas as métricas, UTMs, campanhas
- ✅ **Profile Criado** — `memory/utmify-profile.md` com estrutura completa
- ✅ **Monitor Script** — Sistema automático de coleta de dados

---

## 🎯 Funcionalidades Disponíveis

### 1️⃣ Relatórios Diários
- **O quê:** Resumo de faturamento, ROAS, lucro, top UTMs
- **Quando:** Diariamente (horário a definir)
- **Onde:** Telegram + arquivo local

### 2️⃣ Alertas em Tempo Real
- **Se lucro < R$ 0** → ⚠️ Alerta crítico
- **Se ROAS < 1** → ⚠️ Campanhas prejudiciais
- **Se UTM gera prejuízo** → 🔴 Pausar automático

### 3️⃣ Análise de UTMs
- Extrair todas as UTMs criadas
- Performance por UTM
- Top 5 UTMs por vendas/lucro
- Identificar UTMs com prejuízo

### 4️⃣ Análise por Plataforma
- Meta Ads (Facebook/Instagram)
- Google Ads
- Kwai
- TikTok

### 5️⃣ Funil de Conversão
- Cliques → Visualizações → ICs → Vendas
- Taxa de conversão por etapa
- Identificar gargalos

---

## 📊 Dados Atuais (Hoje)

| Métrica | Valor | Status |
|---------|-------|--------|
| Faturamento Líquido | R$ 47,00 | ✅ |
| Gastos | R$ 46,23 | 📊 |
| ROAS | 1.02 | ⚠️ |
| Lucro | R$ 0,77 | 🔴 CRÍTICO |
| Margem | 1.6% | 🔴 BAIXA |

**UTMs Ativas:**
- ✅ `[ABO][ABERTO] CRIATIVO 17 E 19 PAGINA 04` — Lucro R$ 27,18
- ❌ `[BID][LANCE]` — Prejuízo -R$ 27,28

---

## 🚀 Como Usar

### Opção 1: Relatório Manual
```bash
# Gera relatório sob demanda
node C:\Users\vsuga\clawd\scripts\monitor-utmify.js
```

### Opção 2: Agendado Automático (Recomendado)
Mesma estrutura que o Daily Intelligence Report:

```powershell
schtasks /create `
  /tn "UtmifyDailyMonitor" `
  /tr "node C:\Users\vsuga\clawd\scripts\monitor-utmify.js" `
  /sc DAILY /st 08:00 `
  /rl HIGHEST /f
```

---

## 📈 O que você vai receber

**Diariamente (8 AM):**
1. **Telegram:** Notificação com métricas principais
2. **Arquivo:** `memory/YYYY-MM-DD-utmify-report.md` (completo)
3. **Alertas:** Se algo crítico acontecer

**Exemplo de Telegram:**
```
📊 UTMIFY DAILY REPORT

💰 Faturamento: R$ 47,00
📉 Gasto: R$ 46,23
📈 ROAS: 1.02
💹 Lucro: R$ 0,77
🎯 Margem: 1.6%

⚠️ ALERTA: Margem muito baixa!
❌ UTM [BID][LANCE] com prejuízo
```

---

## 💡 Insights Atuais

### 🔴 Problemas Identificados

1. **Margem crítica (1.6%)** — você está vendendo quase sem lucro
2. **Lucro praticamente zero** — R$ 0,77 não é sustentável
3. **Uma UTM gerando prejuízo** — `[BID][LANCE]` precisa ser pausada
4. **ROAS baixo (1.02)** — A cada R$ 1 gasto, você fatura R$ 1.02

### ✅ O que tá bom

- Meta Ads tá funcionando (1 venda)
- Funil tem 42 cliques → 1 venda (conversão existe)
- Pix é o principal método de pagamento (bom para Brasil)

### 🎯 Recomendações Imediatas

1. **Pausar `[BID][LANCE]`** — Tá gerando prejuízo
2. **Aumentar preço ou reduzir custos** — Margem de 1.6% é insustentável
3. **Otimizar funil** — Apenas 2.4% dos cliques viram vendas
4. **Aumentar volume** — Com margens melhores, ampliar tráfego

---

## 🔄 Próximos Passos

1. **Configurar agendamento** (Opção 2 acima)
2. **Revisar UTMs com prejuízo** — Decidir se pausa ou otimiza
3. **Definir alertas** — Qual lucro mínimo aceitável?
4. **Integrar com outro dashboard** — Se tiver mais ferramentas

---

## 🛠️ Troubleshooting

**Não recebeu relatório?**
- Verifique se Telegram tá pareado (já tá ✅)
- Rode manual pra testar: `node C:\Users\vsuga\clawd\scripts\monitor-utmify.js`

**Dados não aparecem?**
- Utmify pode ter mudado layout
- Avisa e a gente atualiza o extrator

**Quer dados diferentes?**
- Posso coletar qualquer métrica de Utmify
- Basta dizer o que precisa monitorar

---

**Status:** ✅ Tudo pronto! Escolha Opção 1 ou 2 acima e bora.
