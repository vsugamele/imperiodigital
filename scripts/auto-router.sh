#!/bin/bash
# Auto-Router para Clawdbot
# Uso: ./auto-router.sh "seu prompt aqui"
# Ou coloque isso em um alias/comando do Clawdbot

PROMPT="$@"
ROUTER_SCRIPT="$(dirname "$0")/model-router.py"

# Executa o router
RESULT=$(python "$ROUTER_SCRIPT" "$PROMPT")

# Extrai o modelo
MODEL=$(echo "$RESULT" | python -c "import sys, json; print(json.load(sys.stdin)['model_key'])")

# Extrai análise
ANALYSIS=$(echo "$RESULT" | python -c "import sys, json; d=json.load(sys.stdin)['analysis']; print(f\"[{d['category'].upper()}] Complexity: {d['complexity']}/10\")")

echo "📊 Roteando..."
echo "$ANALYSIS"
echo "🤖 Modelo: $MODEL"
echo ""

# Executa com o modelo escolhido
exec clawdbot ask --model "$MODEL" "$PROMPT"
