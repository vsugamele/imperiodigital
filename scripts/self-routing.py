#!/usr/bin/env python3
"""
Self-Routing - Eu mesmo detecta e recomenda escalação
Usado pelo Claude Haiku pra decidir se precisa spawn um Opus/Gemini
"""
import sys
import json

def should_escalate(prompt):
    """Retorna se deve escalacionar e pra qual modelo"""
    
    prompt_lower = prompt.lower()
    
    # Hard escalation - SEMPRE escalaciona
    hard_escalate = {
        'opus': [
            'arquitetura', 'design pattern', 'algoritmo complexo',
            'otimização performance', 'segurança crítica',
            'very complex', 'deep analysis', 'research paper',
            'sistema distribuído', 'microserviços', 'escalabilidade',
            'refactor completo', 'análise profunda'
        ],
        'gemini': [
            'pesquise', 'search the web', 'find articles',
            'últimas notícias', 'dados atualizados', 'trend atual',
            'informações 2026', 'artigos recentes', 'status quo'
        ]
    }
    
    # Soft suggestion - RECOMENDA mas não obriga
    soft_suggest = {
        'sonnet': [
            'escreva um', 'redija', 'crie um artigo', 'draft email',
            'explique', 'análise comparativa', 'como funciona',
            'diferenças entre'
        ],
        'opus': [
            'problema muito complexo', 'dúvida profunda',
            'questão técnica avançada', 'design decisão'
        ]
    }
    
    # Verifica hard escalation
    for model, signals in hard_escalate.items():
        for signal in signals:
            if signal in prompt_lower:
                return {
                    'should_escalate': True,
                    'model': model,
                    'reason': f"Detectado: '{signal}'",
                    'confidence': 'high'
                }
    
    # Verifica soft suggestion
    for model, signals in soft_suggest.items():
        for signal in signals:
            if signal in prompt_lower:
                return {
                    'should_escalate': True,
                    'model': model,
                    'reason': f"Sugerívelmente: '{signal}'",
                    'confidence': 'medium'
                }
    
    # Complexidade por tamanho
    words = len(prompt.split())
    if words > 200:
        return {
            'should_escalate': True,
            'model': 'sonnet',
            'reason': f"Prompt muito longo ({words} palavras)",
            'confidence': 'low'
        }
    
    return {
        'should_escalate': False,
        'model': 'haiku',
        'reason': 'Prompt simples - Haiku consegue',
        'confidence': 'high'
    }

def format_recommendation(result):
    """Formata recomendação em Markdown"""
    
    if not result['should_escalate']:
        return "✅ Continuando com Haiku..."
    
    confidence_emoji = {
        'high': '🔴',
        'medium': '🟡',
        'low': '🟢'
    }
    
    emoji = confidence_emoji.get(result['confidence'], '❓')
    model = result['model'].upper()
    reason = result['reason']
    
    msg = f"\n{emoji} **Recomendação**: {reason}\n"
    msg += f"→ Melhor usar **{model}** pra isso\n"
    
    return msg

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: self-routing.py 'seu prompt'")
        sys.exit(1)
    
    prompt = " ".join(sys.argv[1:])
    result = should_escalate(prompt)
    
    print(json.dumps(result, ensure_ascii=False, indent=2))
