# Costs / Telemetry (WIP)

Objetivo: calcular e acompanhar **custos por Produto/Projeto** (ex: Pedro, Jonathan) para chamadas de IA (Gemini etc.) e outras ferramentas.

## Ledger (fonte de verdade)
- Arquivo: `results/ai-usage.jsonl`
- Formato: 1 JSON por linha

Exemplo:
```json
{"ts":"2026-01-30T12:00:00.000Z","provider":"gemini","model":"gemini-2.0-flash","project":"Pedro","inputTokens":1234,"outputTokens":456,"costUsd":0.00123,"meta":{"script":"scripts/schedule-next-day.js","kind":"generateImage"}}
```

## Cálculo de custo
- Base: `config/ai-pricing.json`
- Regra: custo = (inputTokens/1e6)*inputPrice + (outputTokens/1e6)*outputPrice

Observações:
- Alguns modelos cobram input/output diferente.
- Pode existir tier por contexto longo; inicialmente vamos ignorar e tratar como preço único.

## UI (Ops Dashboard)
- Nova página: `/costs`
- Visões:
  - Hoje: total por projeto
  - Mês: total por projeto
  - Últimas chamadas (audit)

## Próximos passos
1) Identificar onde estão as chamadas de IA no repo (scanner)
2) Centralizar wrapper de chamada (Gemini) e registrar usageMetadata
3) Popular ledger e exibir no dashboard
