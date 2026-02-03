#!/usr/bin/env python3
"""
Pega imagem do Drive, analisa a pessoa e gera nova imagem
mantendo características da pessoa mas com novo cenário/roupas
"""
import sys
import os
import json
from datetime import datetime
from pathlib import Path
import io

try:
    from google import genai
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from PIL import Image
except ImportError:
    os.system("python -m pip install --upgrade google-genai google-auth-oauthlib google-auth-httplib2 google-api-python-client pillow --quiet")
    from google import genai
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from PIL import Image

SCOPES = ['https://www.googleapis.com/auth/drive.file']
TOKEN_FILE = 'C:\\Users\\vsuga\\clawd\\config\\token.json'
CREDENTIALS_FILE = 'C:\\Users\\vsuga\\clawd\\config\\oauth-credentials.json'

def get_oauth_credentials():
    """Pega credenciais OAuth2"""
    creds = None
    
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
    
    return creds

def get_first_image_from_folder(folder_id, creds):
    """Pega primeira imagem da pasta"""
    try:
        service = build('drive', 'v3', credentials=creds)
        
        # Procura por imagens - versão 1
        results = service.files().list(
            q=f"'{folder_id}' in parents and (mimeType='image/jpeg' or mimeType='image/png') and trashed=false",
            spaces='drive',
            fields='files(id, name, mimeType)',
            pageSize=10
        ).execute()
        
        files = results.get('files', [])
        if files:
            print(f"   Encontradas {len(files)} imagens")
            return files[0]
        
        # Se não achou, tenta sem filtro
        print("   Tentando sem filtro...")
        results = service.files().list(
            q=f"'{folder_id}' in parents and trashed=false",
            spaces='drive',
            fields='files(id, name, mimeType)',
            pageSize=10
        ).execute()
        
        files = results.get('files', [])
        if files:
            print(f"   Encontrados {len(files)} arquivos")
            for f in files:
                print(f"     - {f['name']} ({f['mimeType']})")
            return files[0]
        
        return None
    except Exception as e:
        print(f"Erro ao listar imagens: {e}")
        return None

def download_image(file_id, creds):
    """Baixa imagem do Drive"""
    try:
        service = build('drive', 'v3', credentials=creds)
        request = service.files().get_media(fileId=file_id)
        file_content = request.execute()
        return file_content
    except Exception as e:
        print(f"Erro ao baixar: {e}")
        return None

def analyze_person_in_image(image_bytes):
    """Analisa a imagem pra descrever a pessoa"""
    try:
        client = genai.Client(api_key="AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90")
        
        # Converte bytes pra Image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Analisa com Gemini Vision
        message = client.models.generate_content(
            model="models/gemini-2.0-flash",
            contents=[
                "Descreva brevemente a pessoa nesta imagem: características físicas, tipo de rosto, cabelo, compleição, etc. Seja bem específico.",
                img
            ]
        )
        
        return message.text
    except Exception as e:
        print(f"Erro ao analisar: {e}")
        return None

def generate_new_image(person_description, new_scenario, new_clothes):
    """Gera nova imagem com mesma pessoa mas novo cenário/roupas"""
    try:
        client = genai.Client(api_key="AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90")
        
        prompt = f"""
Crie uma imagem de uma pessoa com estas características:
{person_description}

Vistindo: {new_clothes}
Cenário: {new_scenario}

Mantenha as características faciais e físicas da pessoa da descrição, mas mude completamente o cenário e as roupas.
Qualidade alta, realista.
"""
        
        response = client.models.generate_images(
            model="models/imagen-4.0-generate-001",
            prompt=prompt
        )
        
        if response.generated_images:
            return response.generated_images[0].image.image_bytes
        return None
    except Exception as e:
        print(f"Erro ao gerar: {e}")
        return None

def save_and_upload(image_bytes, folder_id, creds, description):
    """Salva local e sobe pro Drive"""
    try:
        output_dir = "C:\\Users\\vsuga\\clawd\\images"
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"transformed_{timestamp}.png"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
        
        print(f"Salvo local: {filepath}")
        
        # Sobe pro Drive
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
            'filepath': filepath,
            'drive_link': file.get('webViewLink'),
            'drive_id': file.get('id')
        }
    except Exception as e:
        print(f"Erro ao salvar: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: image-transform.py 'cenario novo' 'roupas novas' [folder_id]")
        sys.exit(1)
    
    new_scenario = sys.argv[1]
    new_clothes = sys.argv[2]
    folder_id = sys.argv[3] if len(sys.argv) > 3 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"  # Teo
    
    print("1. Conectando...")
    creds = get_oauth_credentials()
    
    print("2. Buscando imagem no Drive do Teo...")
    image_file = get_first_image_from_folder(folder_id, creds)
    
    if not image_file:
        print("Nenhuma imagem encontrada!")
        sys.exit(1)
    
    print(f"   Encontrada: {image_file['name']}")
    print("3. Baixando...")
    image_bytes = download_image(image_file['id'], creds)
    
    print("4. Analisando a pessoa...")
    person_desc = analyze_person_in_image(image_bytes)
    print(f"   {person_desc[:200]}...")
    
    print("5. Gerando nova imagem...")
    new_image = generate_new_image(person_desc, new_scenario, new_clothes)
    
    if new_image:
        print("6. Salvando e subindo...")
        result = save_and_upload(new_image, folder_id, creds, person_desc)
        
        if result:
            print("\nSucesso!")
            print(f"Local: {result['filepath']}")
            print(f"Drive: {result['drive_link']}")
        else:
            print("Erro ao salvar")
    else:
        print("Erro ao gerar imagem")
