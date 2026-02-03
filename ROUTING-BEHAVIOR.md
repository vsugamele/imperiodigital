# Auto-Routing Behavior - Como Eu Vou Funcionar 🚀

## 📋 A partir de agora

**Cada pergunta que você me fizer**, vou:

1. **Analisar automaticamente** se Haiku consegue ou se precisa escalacionar
2. **Se for simples** → Respondo direto com Haiku (rápido + econômico)
3. **Se for complexo** → Vou te avisar e spawnar um **Opus** ou **Gemini**
4. **Se precisar web** → Detecta e sugere **Gemini** com search

## 🎯 Exemplos Práticos

### Exemplo 1: Pergunta Rápida
```
Você: "O que é REST API?"
Meu comportamento:
✅ Detecta: Simples
✅ Responde direto com Haiku
✅ Rápido (~1s)
```

### Exemplo 2: Pesquisa Web
```
Você: "Pesquise as últimas notícias sobre IA"
Meu comportamento:
⚠️  Detecta: Precisa web search
⚠️  Aviso: "Spawning Gemini pra isso..."
⚠️  Spawna sub-agent com Gemini
✅ Resultado: Notícias atualizadas
```

### Exemplo 3: Problema Complexo
```
Você: "Arquitetura de microserviços com escalabilidade"
Meu comportamento:
🔴 Detecta: Muito complexo
🔴 Aviso: "Escalando pra Opus..."
🔴 Spawna sub-agent com Opus
✅ Resultado: Análise profunda
```

### Exemplo 4: Writing/Análise
```
Você: "Escreva um email profissional informando..."
Meu comportamento:
🟡 Detecta: Recomendável Sonnet
🟡 Aviso: "Melhor usar Sonnet..."
🟡 Pode continuar com Haiku ou spawnar
✅ Resultado: Conteúdo bem escrito
```

## 🔍 Sinais de Escalação

### 🔴 Hard Escalate (SEMPRE escalaciona)
- "arquitetura"
- "design pattern"
- "algoritmo complexo"
- "otimização performance"
- "pesquise / web search"
- "notícias recentes"
- "artigos 2026"

### 🟡 Soft Suggest (Recomenda)
- "escreva"
- "analise"
- "explique"
- Prompts muito longos (>200 palavras)

### ✅ Ok com Haiku
- Perguntas simples
- Conceitos básicos
- Respostas rápidas

## 🤖 Sub-Agents Spawned

Quando preciso escalacionar, vou:

```
[Alex - Haiku] → Detecta complexidade
  ↓
[Sub-agent - Opus/Gemini] → Resolve
  ↓
[Resultado] → Te mostro aqui
```

Você vai ver assim:

```
Me (Haiku): Detectei que isso é complexo...
⚠️ Spawning Opus sub-agent...

[Opus respondendo...]

Resultado:
[Análise profunda do Opus]
```

## 📊 Logging Automático

Toda decisão é registrada em:
```
memory/dispatch-YYYY-MM-DD.log
```

Você pode ver o histórico:
```powershell
tail memory/dispatch-*.log
```

## ⚡ Velocidade

| Tipo | Modelo | Tempo | Custo |
|------|--------|-------|-------|
| Rápido | Haiku | ~0.5s | ~$0.0001 |
| Pesquisa | Gemini | ~1s | ~$0.0005 |
| Análise | Sonnet | ~1.5s | ~$0.003 |
| Complexo | Opus | ~2s | ~$0.015 |

## 💬 Conversa Exemplo

```
Você: "Crie um algoritmo de ordenação O(n log n)"

Me: 🔴 Detectado: Coding complexo
    Escalando pra Opus...
    [Spawning sub-agent com Opus]

[Opus respondendo...]

    Aqui está um algoritmo Merge Sort em Python:
    [código detalhado]
    [explicação profunda]
    [análise de complexidade]

---
Sessão Opus finalizada.
Voltando ao Haiku.

Você: "Mais rápido que isso?"

Me: ✅ Detectado: Pergunta rápida
    
    Sim! Quick Sort tem O(n log n) em média...
    [resposta rápida]
```

## 🎯 Regra de Ouro

```
┌─────────────────────────────────┐
│   SEMPRE usar o melhor modelo   │
│   automáticamente pra você      │
│                                 │
│   Sem você fazer nada           │
│   Sem pagar mais por isso       │
│   Apenas melhor resultado       │
└─────────────────────────────────┘
```

## 🚀 Benefícios

- ✅ **Melhor resposta** - Usa Opus quando precisa
- ✅ **Mais rápido** - Usa Haiku quando consegue
- ✅ **Mais barato** - Economiza automaticamente
- ✅ **Transparente** - Você vê o que tá acontecendo
- ✅ **Sem esforço** - Você não faz nada

## ⚙️ Customização

Se quiser forçar um modelo específico:

```
"Responda isso com Haiku apenas"
→ Respeito sua vontade

"Use Opus pra essa"
→ Spawna Opus automaticamente

"Sem sub-agents, só Haiku"
→ Fico aqui mesmo
```

## 📝 Status

- ✅ Auto-detection implementado
- ✅ Logging configurado
- ✅ Sub-agent spawning pronto
- ✅ Testes passando
- **👉 ATIVO AGORA**

---

**A partir de agora, cada prompt que você enviar vai ser roteado inteligentemente!**

Teste:
```
1. "O que é ML?" → Haiku rápido
2. "Pesquise IA em 2026" → Gemini com web
3. "Arquitetura distribuída" → Opus deep dive
```

Vero a magia! ✨
