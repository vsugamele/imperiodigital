# Token Optimization Guide

## Boas Práticas

### 1. Batch Operations
- ✅ Agrupar múltiplas operações similares
- ✅ Usar loops ao invés de chamadas individuais
- ❌ Evitar polling excessivo

### 2. Context Caching
- ✅ Reutilizar context quando possível
- ✅ Carregar arquivos grandes uma vez
- ❌ Recarregar mesma informação repetidamente

### 3. Lazy Loading
- ✅ Carregar apenas o necessário (offset/limit)
- ✅ Usar `head` ou `tail` ao invés de ler arquivos inteiros
- ❌ Ler arquivos grandes desnecessariamente

### 4. Respostas Concisas
- ✅ HEARTBEAT_OK ao invés de explicações longas
- ✅ Logs simples em automações
- ❌ Narrar passos óbvios

### 5. Tool Call Efficiency
- ✅ Combinar múltiplas chamadas independentes
- ✅ Usar ferramentas específicas (não `exec` genérico)
- ❌ Múltiplas chamadas quando uma basta

## Meta: Reduzir 30% tokens mantendo qualidade

**Métricas alvo:**
- Heartbeats: <200 tokens/ciclo
- Automações: <500 tokens/execução
- Tarefas simples: <2000 tokens total
- Tarefas complexas: <5000 tokens total

**Monitoramento:**
- Use `/status` para verificar consumo
- Dashboard Ops mostrará métricas por projeto
- Revisar sessions com alto consumo
