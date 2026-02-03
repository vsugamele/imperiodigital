#!/usr/bin/env python3
"""
Gera imagem + sobe pro Google Drive usando OAuth2
Primeira vez: abre navegador pra você autorizar
Depois: funciona automático
"""
import sys
import os
import json
from datetime import datetime
from pathlib import Path

try:
    from google import genai
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError:
    os.system("python -m pip install --upgrade google-genai google-auth-oauthlib google-auth-httplib2 google-api-python-client --quiet")
    from google import genai
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']
TOKEN_FILE = 'C:\\Users\\vsuga\\clawd\\config\\token.json'
CREDENTIALS_FILE = 'C:\\Users\\vsuga\\clawd\\config\\oauth-credentials.json'

def get_oauth_credentials():
    """Faz OAuth2 login"""
    creds = None
    
    # Se tem token salvo, usa
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    
    # Se não tem ou tá expirado, faz login
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Cria um flow baseado na sua conta Google pessoal
            # Na primeira vez, você autoriza e ele salva o token
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Salva o token pra usar depois
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
    
    return creds

def upload_to_drive(filepath, filename, folder_id, creds):
    """Faz upload usando OAuth2"""
    try:
        service = build('drive', 'v3', credentials=creds)
        
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
    """Gera imagem, salva local e sobe pro Google Drive via OAuth2"""
    
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
        
        # 3. SOBE PRO GOOGLE DRIVE via OAuth2
        print("Subindo pro Drive...")
        creds = get_oauth_credentials()
        drive_result = upload_to_drive(filepath, filename, folder_id, creds)
        
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
    if len(sys.argv) < 2:
        print("Uso: image-gen-oauth.py 'prompt' [folder_id]")
        sys.exit(1)
    
    prompt = sys.argv[1]
    folder_id = sys.argv[2] if len(sys.argv) > 2 else "1mCGcjrnLAqtWYw5prcGXeK0nG1wQKg9-"
    
    result = generate_and_upload(prompt, folder_id)
    print(json.dumps(result, ensure_ascii=False, indent=2))
