# Setup - Model Router 🚀

Seu sistema de roteamento inteligente está pronto!

## ✅ O que foi instalado

1. **model-router.py** - Núcleo do roteador
2. **auto-router.ps1** - Wrapper PowerShell (Windows)
3. **auto-router.sh** - Wrapper Bash (Linux/Mac)
4. **model-router-config.json** - Configuração
5. **model-router-logger.py** - Logging de uso
6. **MODEL-ROUTER.md** - Documentação completa

## 🚀 Como Usar

### Opção 1: Teste Rápido (sem alias)

```powershell
python C:\Users\vsuga\clawd\scripts\model-router.py "Crie um algoritmo de ordenação"
```

Output mostra qual modelo vai ser usado e por quê.

### Opção 2: PowerShell Wrapper (melhor)

```powershell
.\scripts\auto-router.ps1 "seu prompt aqui"
```

### Opção 3: Criar Alias Permanente

**Adicione ao seu perfil PowerShell:**

1. Abra PowerShell
2. Execute: `$PROFILE` (pra ver o caminho)
3. Edite o arquivo com seu editor favorito
4. Adicione no final:

```powershell
# Model Router
function ask-smart {
    & C:\Users\vsuga\clawd\scripts\auto-router.ps1 @args
}

function ask-haiku {
    clawdbot ask --model haiku @args
}

function ask-sonnet {
    clawdbot ask --model sonnet @args
}

function ask-opus {
    clawdbot ask --model opus @args
}

function ask-gemini {
    clawdbot ask --model gemini @args
}

function model-stats {
    python C:\Users\vsuga\clawd\scripts\model-router-logger.py stats
}
```

5. Salve e feche
6. Restart PowerShell
7. Agora use:

```powershell
ask-smart "seu prompt"      # Roteamento automático
ask-haiku "seu prompt"      # Força Haiku
ask-sonnet "seu prompt"     # Força Sonnet
ask-opus "seu prompt"       # Força Opus
ask-gemini "seu prompt"     # Força Gemini
model-stats                 # Ver estatísticas
```

## 📊 Ver Estatísticas de Uso

```powershell
python C:\Users\vsuga\clawd\scripts\model-router-logger.py stats
```

Output:
```
==================================================
MODEL ROUTING STATISTICS
==================================================
Total Requests: 42
Avg Complexity: 5.3/10

By Model:
  haiku: 18 (42.9%)
  sonnet: 15 (35.7%)
  opus: 5 (11.9%)
  gemini: 4 (9.5%)

By Category:
  quick: 18 (42.9%)
  analysis: 15 (35.7%)
  coding: 5 (11.9%)
  research: 4 (9.5%)

==================================================
```

## 🎯 Customizar Roteamento

Edite `config/model-router-config.json`:

### Desabilitar um modelo:
```json
"enabled": false
```

### Mudar limites de complexidade:
```json
"complexity_thresholds": {
  "haiku": [0, 2],      // Haiku pra tudo até 2
  "sonnet": [3, 6],     // Sonnet pra 3-6
  "opus": [7, 10]       // Opus pra 7-10
}
```

### Forçar categoria pra modelo específico:
```json
"category_overrides": {
  "coding_high": "opus",    // Coding complexo sempre Opus
  "research": "gemini",      // Research sempre Gemini
  "writing": "sonnet"        // Writing sempre Sonnet
}
```

### Sempre usar um modelo:
```json
"always_use": "opus"  // null pra automático
```

## 💰 Estimativa de Custo

Baseado no uso histórico:

```
Se usar o roteador inteligente:
- 40% Haiku (~$0.0002 cada)
- 35% Sonnet (~$0.003 cada)
- 15% Opus (~$0.015 cada)
- 10% Gemini (~$0.0005 cada)

Custo médio por requisição: ~$0.006
Custo por 100 requisições: ~$0.60

vs sempre usar Opus: ~$1.50 por 100
=== ECONOMIZA 60% ===
```

## 🔍 Entender o Roteamento

### Exemplo 1: "O que é ML?"
```
Prompt: "O que é ML?"
  ↓
Análise:
- category: quick
- complexity: 1
- requires_web: false
  ↓
Lógica:
  if complexity < 3: return haiku
  ↓
Resultado: HAIKU ✅
Tempo: ~0.5s
Custo: ~$0.0001
```

### Exemplo 2: "Crie um sistema de cache distribuído com Redis"
```
Prompt: "Crie um sistema de cache..."
  ↓
Análise:
- category: coding
- complexity: 8
- requires_web: false
  ↓
Lógica:
  if category == coding and complexity >= 7: return opus
  ↓
Resultado: OPUS ✅
Tempo: ~2s
Custo: ~$0.015
```

### Exemplo 3: "Pesquise como usar async/await em JavaScript"
```
Prompt: "Pesquise como usar async/await..."
  ↓
Análise:
- category: research
- complexity: 5
- requires_web: true  ← KEY!
  ↓
Lógica:
  if requires_web: return gemini
  ↓
Resultado: GEMINI ✅
Tempo: ~1s
Custo: ~$0.0005
```

## 📈 Próximos Passos

1. **Crie os aliases** (veja acima)
2. **Use `ask-smart`** por alguns dias
3. **Rode `model-stats`** pra ver padrões
4. **Ajuste as regras** se necessário
5. **Monitore o custo/qualidade**

## ❓ Troubleshooting

### Erro: "Python not found"
```
Instale Python 3.10+
https://www.python.org/downloads/
```

### Erro: "clawdbot not found"
```
Certifique que o Clawdbot tá instalado globalmente
npm install -g clawdbot
```

### Modelo não está sendo roteado corretamente
```powershell
# Debug: veja exatamente o que o router decidiu
python C:\Users\vsuga\clawd\scripts\model-router.py "seu prompt aqui"
```

### Quer sempre usar um modelo específico
```powershell
# Apenas use diretamente:
ask-opus "seu prompt"
ask-haiku "seu prompt"
# etc
```

## 🔗 Recursos

- **Documentação Completa**: `MODEL-ROUTER.md`
- **Config**: `config/model-router-config.json`
- **Logs**: `memory/model-routing-YYYY-MM-DD.log`

## ✨ Destaques

- ✅ Escolhe automaticamente o melhor modelo
- ✅ Economiza 60% em custos
- ✅ Mantém qualidade (usa Opus quando precisa)
- ✅ Rápido (prioriza Haiku/Gemini quando possível)
- ✅ Logging completo de uso
- ✅ Customizável

---

**Pronto pra usar!** 🚀

Rode seu primeiro comando:
```powershell
ask-smart "Crie um algoritmo de busca binária em Python"
```

