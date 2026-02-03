#!/bin/bash
# Script que gera imagem e envia no Telegram
# Uso: ./img-gen-telegram.sh "seu prompt aqui"

PROMPT="$@"
OUTPUT_DIR="C:\Users\vsuga\clawd\images"
FILEPATH=$(python C:\Users\vsuga\clawd\scripts\generate-image.py "$PROMPT" | grep "Path:" | awk '{print $NF}')

if [ -n "$FILEPATH" ]; then
    echo "Enviando $FILEPATH para Telegram..."
    # Aqui entra o comando do Clawdbot message tool
else
    echo "Erro ao gerar imagem"
    exit 1
fi
