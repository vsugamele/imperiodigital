#!/usr/bin/env python3
"""
Gera imagem + salva local + sobe pro Google Drive
"""
import sys
import os
import json
from datetime import datetime
from pathlib import Path

try:
    from google import genai
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError:
    os.system("python -m pip install --upgrade google-genai google-api-python-client --quiet")
    from google import genai
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

def upload_to_drive(filepath, filename, folder_id, api_key):
    """Faz upload do arquivo pro Google Drive"""
    try:
        service = build('drive', 'v3', developerKey=api_key)
        
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(filepath, mimetype='image/png')
        
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink'
        ).execute()
        
        return {
            'id': file.get('id'),
            'link': file.get('webViewLink')
        }
    except Exception as e:
        print(f"Erro Drive: {e}")
        return None

def generate_and_upload(prompt, folder_id):
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
        
        print(f"Salvo local: {filepath}")
        
        # 3. SOBE PRO GOOGLE DRIVE
        print("Subindo pro Drive...")
        drive_result = upload_to_drive(filepath, filename, folder_id, api_key)
        
        if drive_result:
            print(f"Drive OK: {drive_result['link']}")
            return {
                "status": "success",
                "filepath": filepath,
                "prompt": prompt,
                "drive_id": drive_result['id'],
                "drive_link": drive_result['link']
            }
        else:
            return {
                "status": "success_local_only",
                "filepath": filepath,
                "prompt": prompt,
                "message": "Salvo local, mas Drive falhou"
            }
            
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import json
    
    if len(sys.argv) < 2:
        print("Uso: image-gen-full.py 'prompt' [folder_id]")
        sys.exit(1)
    
    prompt = sys.argv[1]
    folder_id = sys.argv[2] if len(sys.argv) > 2 else "1-pRp7UtxfBVBNw1-5WJPCtzF5PnTmNUZ"
    
    result = generate_and_upload(prompt, folder_id)
    print(json.dumps(result, ensure_ascii=False, indent=2))
