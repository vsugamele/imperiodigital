# HEARTBEAT.md - Tarefas Periódicas

## ⏰ Daily Intelligence Report (7 AM)

**Frequência:** Todos os dias às 7 AM (America/Sao_Paulo)

**O que fazer:**
1. Verificar hora local
2. Se for 7 AM (06:00-08:00 UTC), gerar relatório
3. Enviar por Telegram (385573206)
4. Salvar em `memory/YYYY-MM-DD-daily-intelligence.md`

**Não fazer se:**
- Já rodou hoje (check em `memory/heartbeat-state.json`)
- Horário não é 7 AM

---

**heartbeat-state.json (tracking):**
```json
{
  "lastIntelligenceReport": "2026-01-26",
  "lastIntelligenceTime": "2026-01-26T07:00:00Z"
}
```
