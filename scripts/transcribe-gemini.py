#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Transcrever audio com Google Gemini API
Uso: python transcribe-gemini.py <arquivo.ogg/mp3/wav>
"""

import sys
import os
from pathlib import Path

# Carregar GEMINI_API_KEY do .env.local
def load_env_file(env_path):
    env_vars = {}
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key] = value
    return env_vars

# Carregar .env.local
env_path = Path(__file__).parent.parent / 'ops-dashboard' / '.env.local'
env_vars = load_env_file(env_path)
api_key = env_vars.get('GEMINI_API_KEY')

if api_key:
    os.environ['GEMINI_API_KEY'] = api_key

try:
    import google.generativeai as genai
except ImportError:
    print("Instalando google-generativeai...")
    os.system("pip install google-generativeai")
    import google.generativeai as genai

def transcribe_audio(audio_file):
    """Transcreve audio usando Google Gemini API"""
    
    # Verifica se tem a chave
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("ERRO: GEMINI_API_KEY nao configurada!")
        print("Adicione GEMINI_API_KEY no arquivo ops-dashboard/.env.local")
        sys.exit(1)
    
    # Configura Gemini
    genai.configure(api_key=api_key)
    
    if not os.path.exists(audio_file):
        print(f"ERRO: Arquivo nao encontrado: {audio_file}")
        sys.exit(1)
    
    print(f"Transcrevendo: {audio_file}")
    print("Enviando pra Google Gemini API...")
    
    try:
        # Faz upload do arquivo de audio
        print("Fazendo upload do audio...")
        audio_upload = genai.upload_file(audio_file)
        
        # Usa Gemini 2.0 Flash (suporta audio)
        model = genai.GenerativeModel("gemini-2.0-flash-exp")
        
        # Transcreve
        print("Processando transcricao...")
        response = model.generate_content([
            audio_upload,
            "Transcreva este audio em portugues. Retorne apenas a transcricao do texto falado, sem comentarios adicionais."
        ])
        
        text = response.text.strip()
        
        print("\nTranscricao completa:")
        print("=" * 60)
        print(text)
        print("=" * 60)
        
        # Salva em arquivo
        output_file = Path(audio_file).stem + "_transcript.txt"
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(text)
        
        print(f"\nSalvo em: {output_file}")
        
        # Limpa arquivo temporario
        genai.delete_file(audio_upload.name)
        
        return text
        
    except Exception as e:
        print(f"ERRO: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python transcribe-gemini.py <arquivo.ogg/mp3/wav>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    transcribe_audio(audio_file)
