#!/usr/bin/env python3
"""
Model Router Inteligente - Escolhe o melhor modelo conforme o prompt
Analisa a tarefa e roteia pra modelo ideal
"""
import sys
import json
import re

# Mapeamento de modelos
MODELS = {
    "haiku": "anthropic/claude-haiku-4-5",
    "sonnet": "anthropic/claude-3-5-sonnet",
    "opus": "anthropic/claude-opus-4-5",
    "gemini": "google/gemini-2.0-flash",
    "gpt4": "openai/gpt-4"
}

def analyze_prompt(prompt):
    """
    Analisa o prompt e retorna:
    - complexity: 1-10
    - category: coding|research|writing|analysis|quick
    - requires_web: bool
    """
    
    prompt_lower = prompt.lower()
    
    # Detecção de categoria
    coding_keywords = ['code', 'python', 'javascript', 'debug', 'função', 'script', 'classe', 'algoritmo', 'implementar', 'refactor']
    research_keywords = ['pesquise', 'search', 'web', 'find', 'informações', 'dados', 'notícia', 'artigo', 'research']
    writing_keywords = ['escreva', 'write', 'texto', 'artigo', 'email', 'carta', 'história', 'poema', 'conteúdo']
    analysis_keywords = ['analise', 'analyze', 'explique', 'explain', 'por quê', 'como funciona', 'compare', 'avalie']
    
    category = "quick"
    requires_web = False
    complexity = 1
    
    # Classifica por categoria
    if any(kw in prompt_lower for kw in coding_keywords):
        category = "coding"
        complexity = 7
    elif any(kw in prompt_lower for kw in research_keywords):
        category = "research"
        requires_web = True
        complexity = 6
    elif any(kw in prompt_lower for kw in writing_keywords):
        category = "writing"
        complexity = 5
    elif any(kw in prompt_lower for kw in analysis_keywords):
        category = "analysis"
        complexity = 6
    else:
        # Detecção por tamanho e estrutura
        if len(prompt) > 500:
            complexity = 5
        elif len(prompt) > 200:
            complexity = 3
        else:
            complexity = 1
    
    # Aumenta complexidade se tiver requisitos específicos
    if 'arquitetura' in prompt_lower or 'design' in prompt_lower:
        complexity += 2
    if 'otimização' in prompt_lower or 'performance' in prompt_lower:
        complexity += 2
    if 'segurança' in prompt_lower or 'security' in prompt_lower:
        complexity += 2
    if 'problema' in prompt_lower or 'error' in prompt_lower or 'bug' in prompt_lower:
        complexity += 1
    
    complexity = min(complexity, 10)
    
    return {
        'category': category,
        'complexity': complexity,
        'requires_web': requires_web,
        'prompt_length': len(prompt)
    }

def route_model(analysis):
    """
    Baseado na análise, retorna o modelo ideal
    """
    
    category = analysis['category']
    complexity = analysis['complexity']
    requires_web = analysis['requires_web']
    
    # Lógica de roteamento
    
    # Web search → Gemini
    if requires_web:
        return "gemini"
    
    # Coding complexo → Opus
    if category == "coding" and complexity >= 7:
        return "opus"
    
    # Coding médio → Sonnet
    if category == "coding" and complexity >= 4:
        return "sonnet"
    
    # Analysis complexa → Opus
    if category == "analysis" and complexity >= 8:
        return "opus"
    
    # Analysis média → Sonnet
    if category == "analysis" and complexity >= 5:
        return "sonnet"
    
    # Research → Gemini (web search)
    if category == "research":
        return "gemini"
    
    # Writing → Sonnet (melhor pra linguagem natural)
    if category == "writing":
        return "sonnet"
    
    # Complexity muito alta → Opus
    if complexity >= 8:
        return "opus"
    
    # Complexity média → Sonnet
    if complexity >= 4:
        return "sonnet"
    
    # Default → Haiku (rápido e econômico)
    return "haiku"

def format_output(analysis, model_key):
    """Formata output pra usar com Clawdbot"""
    
    model = MODELS[model_key]
    
    output = {
        'model': model,
        'model_key': model_key,
        'analysis': analysis,
        'command': f"/model set {model_key}"
    }
    
    return output

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: model-router.py 'seu prompt aqui'")
        sys.exit(1)
    
    prompt = " ".join(sys.argv[1:])
    
    # Analisa
    analysis = analyze_prompt(prompt)
    
    # Roteia
    model_key = route_model(analysis)
    
    # Formata output
    result = format_output(analysis, model_key)
    
    # Printa como JSON pra Clawdbot ler
    print(json.dumps(result, indent=2, ensure_ascii=False))
