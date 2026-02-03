#!/usr/bin/env python3
"""
Gera imagem + salva no PC + sobe pro Google Drive
"""
import sys
import os
import json
from datetime import datetime
from pathlib import Path

try:
    from google import genai
    from google.auth.transport.requests import Request
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError:
    os.system("python -m pip install --upgrade google-genai google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client --quiet")
    from google import genai
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

def generate_and_upload(prompt):
    """Gera imagem, salva local e sobe pro Google Drive"""
    
    output_dir = "C:\\Users\\vsuga\\clawd\\images"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    api_key = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"
    
    try:
        # 1. GERA A IMAGEM
        print("Gerando imagem...")
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
        
        # 2. SALVA LOCALMENTE
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"generated_{timestamp}.png"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
        
        print(f"Salvo: {filepath}")
        
        # 3. SOBE PRO GOOGLE DRIVE (opcional por enquanto)
        # Nota: Precisa de credenciais de Service Account
        drive_link = None
        try:
            # Aqui entraria a lógica de upload pro Drive
            # Por enquanto, retorna só o filepath local
            print("Drive: Configurando...")
            drive_link = None
        except Exception as e:
            print(f"Drive: {e}")
            pass
        
        return {
            "status": "success",
            "filepath": filepath,
            "prompt": prompt,
            "drive_link": drive_link
        }
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import json
    prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "a beautiful image"
    result = generate_and_upload(prompt)
    print(json.dumps(result))
