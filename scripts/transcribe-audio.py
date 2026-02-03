#!/usr/bin/env python3
"""
Transcrever áudio com Whisper
Uso: python transcribe-audio.py <arquivo.mp3/ogg/wav>
"""

import sys
import whisper
import json
from pathlib import Path

def transcribe(audio_file):
    """Transcreve áudio e retorna texto"""
    try:
        # Carrega modelo (tiny é mais rápido, base é mais preciso)
        print(f"🎙️ Carregando modelo Whisper...")
        model = whisper.load_model("base")
        
        print(f"📁 Transcrevendo: {audio_file}")
        result = model.transcribe(audio_file)
        
        text = result["text"]
        language = result.get("language", "pt")
        
        print(f"\n✅ Transcrição:")
        print(f"{'='*60}")
        print(text)
        print(f"{'='*60}")
        print(f"\n🌐 Idioma detectado: {language}")
        
        return text
        
    except FileNotFoundError:
        print(f"❌ Arquivo não encontrado: {audio_file}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python transcribe-audio.py <arquivo.mp3/ogg/wav>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    text = transcribe(audio_file)
    
    # Salva em arquivo
    output_file = Path(audio_file).stem + "_transcript.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(text)
    
    print(f"\n📝 Salvo em: {output_file}")
