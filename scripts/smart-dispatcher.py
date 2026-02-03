#!/usr/bin/env python3
"""
Smart Dispatcher - Eu detecta complexidade e roteia automaticamente
Escalação inteligente dentro da conversa
"""
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path

def analyze_and_dispatch(prompt):
    """Analisa prompt e decide se precisa escalação"""
    
    prompt_lower = prompt.lower()
    
    # Sinais de escalação
    escalate_signals = {
        'opus': [
            'arquitetura', 'design pattern', 'algoritmo', 'otimização avançada',
            'segurança crítica', 'problema muito complexo', 'deep dive',
            'refactor completo', 'pesquisa acadêmica'
        ],
        'gemini': [
            'pesquise', 'search', 'web', 'notícia', 'artigo recente',
            'dados atualizados', 'trend', 'latest', 'recente', '2026',
            'últimas notícias', 'informações atualizadas'
        ],
        'sonnet': [
            'escreva', 'redija', 'crie um artigo', 'email', 'carta',
            'análise de', 'explique como', 'compare', 'diferenças'
        ]
    }
    
    recommendation = None
    reason = None
    
    # Verifica sinais
    for model, signals in escalate_signals.items():
        for signal in signals:
            if signal in prompt_lower:
                recommendation = model
                reason = f"Detectado: '{signal}'"
                break
        if recommendation:
            break
    
    # Se não encontrou sinal específico, analisa complexidade geral
    if not recommendation:
        words = len(prompt.split())
        if words > 150:
            recommendation = "sonnet"
            reason = "Prompt longo (detalhado)"
        elif words > 50:
            recommendation = "sonnet"
            reason = "Prompt médio"
        else:
            recommendation = "haiku"
            reason = "Prompt rápido"
    
    return recommendation, reason

def log_dispatch(prompt, recommendation, reason):
    """Log a decisão"""
    
    log_dir = Path("C:\\Users\\vsuga\\clawd\\memory")
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / f"dispatch-{datetime.now().strftime('%Y-%m-%d')}.log"
    
    entry = {
        "timestamp": datetime.now().isoformat(),
        "prompt": prompt[:80],
        "recommendation": recommendation,
        "reason": reason
    }
    
    with open(log_file, 'a', encoding='utf-8') as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

def format_message(model, reason):
    """Formata mensagem pra exibir"""
    
    if model == "haiku":
        emoji = "⚡"
        desc = "Rápido (continuando)"
    elif model == "sonnet":
        emoji = "🧠"
        desc = "Melhor análise"
    elif model == "opus":
        emoji = "💪"
        desc = "Deep dive (spawning)"
    elif model == "gemini":
        emoji = "🌐"
        desc = "Web search"
    else:
        emoji = "❓"
        desc = "Unknown"
    
    return f"\n{emoji} **Roteamento**: {reason} → {model.upper()} ({desc})\n"

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: smart-dispatcher.py 'seu prompt'")
        sys.exit(1)
    
    prompt = " ".join(sys.argv[1:])
    recommendation, reason = analyze_and_dispatch(prompt)
    log_dispatch(prompt, recommendation, reason)
    
    # Output
    message = format_message(recommendation, reason)
    print(message)
    print(f"Model: {recommendation}")
