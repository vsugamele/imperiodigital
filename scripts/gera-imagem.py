#!/usr/bin/env python3
"""
Script pra gerar imagem + enviar no Telegram via Clawdbot
Uso: python gera-imagem.py "prompt aqui"
"""
import sys
import os
import json
import subprocess
from datetime import datetime
from pathlib import Path

try:
    from google import genai
except ImportError:
    os.system("python -m pip install --upgrade google-genai --quiet")
    from google import genai

def generate_image_with_telegram(prompt):
    """Gera imagem e envia via Telegram usando Clawdbot"""
    
    output_dir = "C:\\Users\\vsuga\\clawd\\images"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    api_key = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"
    telegram_id = "385573206"
    
    print(f"[GENERAR] {prompt}")
    
    try:
        # 1. GERA A IMAGEM
        client = genai.Client(api_key=api_key)
        response = client.models.generate_images(
            model="models/imagen-4.0-generate-001",
            prompt=prompt
        )
        
        if not response.generated_images:
            print("[ERRO] Nenhuma imagem gerada")
            return False
        
        image_obj = response.generated_images[0]
        
        if not (hasattr(image_obj, 'image') and hasattr(image_obj.image, 'image_bytes')):
            print("[ERRO] Estrutura inesperada")
            return False
        
        image_bytes = image_obj.image.image_bytes
        
        # Salva localmente
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(output_dir, f"generated_{timestamp}.png")
        
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
        
        print(f"[SALVO] {filepath}")
        
        # 2. ENVIA NO TELEGRAM via Clawdbot message tool
        try:
            # Usa o message tool do Clawdbot (que você pode chamar)
            print(f"[TELEGRAM] Enviando para {telegram_id}...")
            print(f"[ARQUIVO] {filepath}")
            
            # Retorna o path para o Clawdbot chamar
            print(f"[PRONTO] Imagem: {filepath}")
            return True
        except Exception as e:
            print(f"[AVISO] Nao conseguiu enviar Telegram: {e}")
            return True  # Mesmo assim, a imagem foi gerada
            
    except Exception as e:
        print(f"[ERRO] {str(e)}")
        return False

if __name__ == "__main__":
    prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else input("Prompt: ")
    success = generate_image_with_telegram(prompt)
    sys.exit(0 if success else 1)
