#!/usr/bin/env python3
import sys
import os
from datetime import datetime
from pathlib import Path

try:
    from google import genai
except ImportError:
    print("Instalando...")
    os.system("python -m pip install --upgrade google-genai --quiet")
    from google import genai

def generate_image(prompt, output_dir="C:\\Users\\vsuga\\clawd\\images"):
    """Gera uma imagem usando Gemini e salva localmente"""
    
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    api_key = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"
    
    print(f"Gerando: {prompt}")
    
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_images(
            model="models/imagen-4.0-generate-001",
            prompt=prompt
        )
        
        if response.generated_images:
            image_obj = response.generated_images[0]
            
            # Acessa a imagem através do objeto .image
            if hasattr(image_obj, 'image') and hasattr(image_obj.image, 'image_bytes'):
                image_bytes = image_obj.image.image_bytes
                
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filepath = os.path.join(output_dir, f"generated_{timestamp}.png")
                
                with open(filepath, 'wb') as f:
                    f.write(image_bytes)
                
                print(f"OK: {filepath}")
                return filepath
            else:
                print("ERRO - Estrutura inesperada")
                return None
        else:
            print("ERRO - Nenhuma imagem")
            return None
            
    except Exception as e:
        print(f"ERRO: {e}")
        return None

if __name__ == "__main__":
    prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else input("Prompt: ")
    result = generate_image(prompt)
    if result:
        print(f"Path: {result}")
