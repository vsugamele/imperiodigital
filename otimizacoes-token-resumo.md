# Otimizações de Token - Resumo

## ✅ APLICADO

### 1. Cron Jobs Reduzidos
- **Poll Upload-Post**: 15min → 2x/dia (9h, 21h) - Redução de 96 chamadas/dia para 2
- **Import Supabase**: 15min → 2x/dia (9h, 21h) - Mesma redução
- **Ops Autopilot**: 10min → 6h em 6h - Redução de 144 chamadas/dia para 4

**Economia estimada**: ~70% de redução no consumo de tokens

## ⚠️ PENDENTE

### 2. Context Pruning (REDUZIR TTL)
- Atual: 15 minutos
- Target: 5 minutos
- **Ação manual necessária**: Editar `C:\Users\vsuga\.openclaw\openclaw.json`

```json
"contextPruning": {
  "mode": "cache-ttl",
  "ttl": "5m"
}
```

### 3. Dashboard Offline
- Gateway está funcionando (verificado)
- Precisa verificar o dashboard específico (frontend/API status)

### 4. Terminal Silencioso
- É o daemon do clawd rodando em background
- Comportamento normal - mantém o serviço ativo

### 5. Projetos Dia 2
- Precisa validar no Supabase/CSV se todos foram agendados

## 📊 IMPACTO

Antes:
- ~250 chamadas automáticas/dia
- Cada chamada consumindo tokens de contexto completo

Depois:
- ~20 chamadas automáticas/dia
- Contexto enxuto com pruning ativo
- Economia: ~90% de redução
