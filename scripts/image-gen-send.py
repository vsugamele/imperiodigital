#!/usr/bin/env python3
"""
Gera imagem + retorna caminho (para Clawdbot enviar no Telegram)
"""
import sys
import os
from datetime import datetime
from pathlib import Path

try:
    from google import genai
except ImportError:
    os.system("python -m pip install --upgrade google-genai --quiet")
    from google import genai

def generate_and_return(prompt):
    """Gera imagem e retorna o filepath em JSON"""
    
    output_dir = "C:\\Users\\vsuga\\clawd\\images"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    api_key = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"
    
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_images(
            model="models/imagen-4.0-generate-001",
            prompt=prompt
        )
        
        if not response.generated_images:
            return {"status": "error", "message": "Nenhuma imagem gerada"}
        
        image_obj = response.generated_images[0]
        
        if not (hasattr(image_obj, 'image') and hasattr(image_obj.image, 'image_bytes')):
            return {"status": "error", "message": "Estrutura inesperada"}
        
        image_bytes = image_obj.image.image_bytes
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(output_dir, f"generated_{timestamp}.png")
        
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
        
        return {
            "status": "success",
            "filepath": filepath,
            "prompt": prompt
        }
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import json
    prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "a beautiful image"
    result = generate_and_return(prompt)
    print(json.dumps(result))
