# Model Router - Roteamento Inteligente de Modelos 🤖

Escolhe automaticamente o melhor modelo conforme seu prompt!

## Como Funciona

```
Seu Prompt
    ↓
Análise (categoria + complexidade)
    ↓
Router inteligente
    ↓
Melhor modelo selecionado
    ↓
Executa
```

## Modelos Disponíveis

| Modelo | Custo | Velocidade | Melhor Para |
|--------|-------|-----------|-----------|
| **Haiku** | 💰 | ⚡⚡⚡ | Perguntas rápidas |
| **Sonnet** | 💰💰 | ⚡⚡ | Análise, writing |
| **Opus** | 💰💰💰 | ⚡ | Coding complexo, reasoning |
| **Gemini** | 💰 | ⚡⚡⚡ | Web search, research |
| **GPT-4** | 💰💰💰 | ⚡ | Tasks específicas |

## Categorias de Prompt

### 1. **Quick** (Haiku)
```
"O que é ML?"
"Que hora é?"
"Traduz isso pra inglês"
```
→ **Haiku** (rápido, econômico)

### 2. **Coding** (Sonnet → Opus)
```
"Debug esse código Python"
"Refactor minha função"
"Crie um algoritmo pra..."
```
→ **Sonnet** (médio) / **Opus** (complexo)

### 3. **Writing** (Sonnet)
```
"Escreva um email profissional"
"Crie uma história"
"Redija um artigo sobre..."
```
→ **Sonnet** (melhor pra linguagem natural)

### 4. **Research** (Gemini)
```
"Pesquise sobre..."
"Encontre artigos recentes"
"Qual é a notícia hoje?"
```
→ **Gemini** (web search)

### 5. **Analysis** (Sonnet → Opus)
```
"Analise esse código"
"Explique como funciona"
"Compare essas abordagens"
```
→ **Sonnet** (médio) / **Opus** (profundo)

## Uso

### Opção 1: Python direto
```bash
python C:\Users\vsuga\clawd\scripts\model-router.py "seu prompt aqui"
```

Output:
```json
{
  "model": "anthropic/claude-haiku-4-5",
  "model_key": "haiku",
  "analysis": {
    "category": "quick",
    "complexity": 2,
    "requires_web": false,
    "prompt_length": 16
  }
}
```

### Opção 2: PowerShell (Windows)
```powershell
.\scripts\auto-router.ps1 "seu prompt aqui"
```

Output:
```
Analisando prompt...
📊 Roteando...
[QUICK] Complexity: 2/10
🤖 Modelo: haiku (anthropic/claude-haiku-4-5)

Enviando para haiku...
```

### Opção 3: Bash (Linux/Mac)
```bash
./scripts/auto-router.sh "seu prompt aqui"
```

## Configuração

Edite `config/model-router-config.json` para customizar:

```json
{
  "enabled": true,
  "auto_switch": true,
  "models": {
    "haiku": { "enabled": true },
    "sonnet": { "enabled": true },
    "opus": { "enabled": true },
    "gemini": { "enabled": true },
    "gpt4": { "enabled": false }
  },
  "routing_rules": {
    "complexity_thresholds": {
      "haiku": [0, 3],
      "sonnet": [4, 7],
      "opus": [8, 10]
    },
    "category_overrides": {
      "coding_high": "opus",
      "research": "gemini"
    }
  }
}
```

## Exemplos Práticos

### Exemplo 1: Pergunta Rápida
```
Input: "O que é um REST API?"
→ Análise: quick, complexity=1
→ Modelo: haiku
→ Tempo: 1s, custo: ~$0.001
```

### Exemplo 2: Bug Debug
```
Input: "Debug esse código Python que tá retornando None quando deveria retornar uma list"
→ Análise: coding, complexity=6
→ Modelo: sonnet
→ Tempo: 3s, custo: ~$0.01
```

### Exemplo 3: Arquitetura Complexa
```
Input: "Descreva a melhor arquitetura pra um sistema de microserviços com escalabilidade automática"
→ Análise: coding/analysis, complexity=9
→ Modelo: opus
→ Tempo: 5s, custo: ~$0.05
```

### Exemplo 4: Pesquisa Web
```
Input: "Pesquise as últimas notícias sobre IA"
→ Análise: research, complexity=5, requires_web=true
→ Modelo: gemini
→ Tempo: 2s, custo: ~$0.002
```

## Complexidade Explicada

```
Complexity 1-3:   Haiku    💚 Econômico
Complexity 4-7:   Sonnet   💛 Equilibrado
Complexity 8-10:  Opus     💜 Premium
```

### Fatores que aumentam complexidade:
- `+2` arquitetura/design
- `+2` otimização/performance
- `+2` segurança
- `+1` debugging/problema

## Dicas de Uso

1. **Para economizar** → Use `/ask haiku` pra perguntas simples
2. **Para qualidade** → Deixa o router decidir automaticamente
3. **Para pesquisa** → Use Gemini (web search)
4. **Para coding** → Sonnet (médio) ou Opus (complexo)

## Logging

O router loga cada decisão em:
```
memory/model-routing-YYYY-MM-DD.log
```

Para ver histórico:
```bash
tail -20 memory/model-routing-*.log
```

## Status Atual

- ✅ Router Python implementado
- ✅ PowerShell wrapper
- ✅ Bash wrapper
- ⏳ Integração automática com Clawdbot
- ⏳ Dashboard de uso por modelo
- ⏳ Ajustes dinâmicos baseados em custo/performance

## Próximos Passos

1. Teste os exemplos acima
2. Customize as regras de roteamento no JSON
3. Monitore `memory/model-routing-*.log`
4. Ajuste conforme vê o uso real

---

**Salve em alias:**
```powershell
# No seu perfil PowerShell
function ask-auto { & C:\Users\vsuga\clawd\scripts\auto-router.ps1 @args }
```

Depois use assim:
```
ask-auto "seu prompt aqui"
```
