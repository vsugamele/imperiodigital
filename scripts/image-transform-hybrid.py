#!/usr/bin/env python3
"""
Usa Service Account pra BAIXAR do Drive do Teo
Usa OAuth2 pra FAZER UPLOAD do resultado
"""
import sys
import os
import json
from datetime import datetime
from pathlib import Path
import io

try:
    from google import genai
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from PIL import Image
except ImportError:
    os.system("python -m pip install --upgrade google-genai google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client pillow --quiet")
    from google import genai
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from PIL import Image

SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = 'C:\\Users\\vsuga\\clawd\\config\\imperio-service-account.json'
TOKEN_FILE = 'C:\\Users\\vsuga\\clawd\\config\\token.json'
CREDENTIALS_FILE = 'C:\\Users\\vsuga\\clawd\\config\\oauth-credentials.json'

def get_service_account_drive():
    """Service Account pra DOWNLOAD"""
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=['https://www.googleapis.com/auth/drive'])
    return build('drive', 'v3', credentials=credentials)

def get_oauth_drive():
    """OAuth2 pra UPLOAD"""
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
    
    return build('drive', 'v3', credentials=creds)

def get_first_image_from_folder(folder_id, service):
    """Pega primeira imagem da pasta (Service Account)"""
    try:
        results = service.files().list(
            q=f"'{folder_id}' in parents and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='image/webp') and trashed=false",
            spaces='drive',
            fields='files(id, name, mimeType)',
            pageSize=10
        ).execute()
        
        files = results.get('files', [])
        if files:
            print(f"   Encontradas {len(files)} imagens")
            for f in files:
                print(f"     - {f['name']}")
            return files[0]
        
        return None
    except Exception as e:
        print(f"Erro ao listar imagens: {e}")
        return None

def download_image(file_id, service):
    """Baixa imagem do Drive (Service Account)"""
    try:
        request = service.files().get_media(fileId=file_id)
        file_content = request.execute()
        return file_content
    except Exception as e:
        print(f"Erro ao baixar: {e}")
        return None

def analyze_person_in_image(image_bytes):
    """Analisa a imagem pra descrever a pessoa com máximo detalhe"""
    try:
        client = genai.Client(api_key="AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90")
        
        img = Image.open(io.BytesIO(image_bytes))
        
        message = client.models.generate_content(
            model="models/gemini-2.0-flash",
            contents=[
                """Faça uma descrição MUITO DETALHADA e específica da pessoa nesta imagem. 
                
IMPORTANTE: Você vai usar essa descrição pra REGENERAR a MESMA PESSOA em um novo cenário.
Por isso seja EXTREMAMENTE PRECISO sobre características faciais imutáveis:

- Formato exato do rosto (oval, quadrado, redondo, etc)
- Estrutura óssea (maçãs do rosto, queixo, testa)
- Características dos olhos (cor, formato, distância)
- Nariz (formato, tamanho, largura)
- Boca (forma dos lábios, tamanho)
- Cabelo (cor exata, textura, comprimento, estilo)
- Barba/pelos faciais
- Compleição da pele (tom exato)
- Idade aparente
- Expressão facial

Seja bem específico. Exemplo: "Rosto oval com queixo proeminente, olhos castanhos espaçados, nariz reto..."
""",
                img
            ]
        )
        
        return message.text
    except Exception as e:
        print(f"Erro ao analisar: {e}")
        return None

def generate_new_image(person_description, new_scenario, new_clothes):
    """Gera nova imagem com mesma pessoa mas novo cenário/roupas - ULTRA PRECISE"""
    try:
        client = genai.Client(api_key="AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90")
        
        prompt = f"""
ULTRA IMPORTANT: Regenerate the EXACT SAME PERSON in a new scenario.

FACIAL & PHYSICAL CHARACTERISTICS (DO NOT CHANGE):
{person_description}

ONLY CHANGE:
- Outfit: {new_clothes}
- Background: {new_scenario}
- Camera angle: similar
- Lighting: professional

REQUIREMENTS:
- Same person, IDENTICAL face and features
- Professional social media photo quality
- Instagram/TikTok ready
- Vertical or square composition
- Studio or natural professional lighting
- High resolution, sharp, vibrant
- Color grading: natural, appealing for social media
"""
        
        response = client.models.generate_images(
            model="models/imagen-4.0-ultra-generate-001",  # Ultra model pra melhor detalhe
            prompt=prompt
        )
        
        if response.generated_images:
            return response.generated_images[0].image.image_bytes
        return None
    except Exception as e:
        print(f"Erro ao gerar: {e}")
        return None

def save_and_upload(image_bytes, folder_id, oauth_service, description):
    """Salva local e sobe pro Drive (OAuth2)"""
    try:
        output_dir = "C:\\Users\\vsuga\\clawd\\images"
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"transformed_{timestamp}.png"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
        
        print(f"Salvo local: {filepath}")
        
        # Sobe pro Drive com OAuth2
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(filepath, mimetype='image/png')
        file = oauth_service.files().create(
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
        print("Uso: image-transform-hybrid.py 'cenario novo' 'roupas novas' [folder_id_source] [folder_id_dest]")
        sys.exit(1)
    
    new_scenario = sys.argv[1]
    new_clothes = sys.argv[2]
    folder_id_source = sys.argv[3] if len(sys.argv) > 3 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"  # Teo (origem)
    folder_id_dest = sys.argv[4] if len(sys.argv) > 4 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"  # Teo (destino - salva no mesmo lugar)
    
    print("1. Conectando (Service Account pra download, OAuth2 pra upload)...")
    sa_service = get_service_account_drive()
    oauth_service = get_oauth_drive()
    
    print("2. Buscando imagem no Drive do Teo...")
    image_file = get_first_image_from_folder(folder_id_source, sa_service)
    
    if not image_file:
        print("Nenhuma imagem encontrada!")
        sys.exit(1)
    
    print(f"   Selecionada: {image_file['name']}")
    print("3. Baixando...")
    image_bytes = download_image(image_file['id'], sa_service)
    
    if not image_bytes:
        print("Erro ao baixar imagem!")
        sys.exit(1)
    
    print("4. Analisando a pessoa...")
    person_desc = analyze_person_in_image(image_bytes)
    print(f"   Descrição: {person_desc[:150]}...")
    
    print("5. Gerando nova imagem...")
    new_image = generate_new_image(person_desc, new_scenario, new_clothes)
    
    if new_image:
        print("6. Salvando localmente e subindo via OAuth2...")
        result = save_and_upload(new_image, folder_id_dest, oauth_service, person_desc)
        
        if result:
            print("\nSUCESSO!")
            print(f"Local: {result['filepath']}")
            print(f"Drive: {result['drive_link']}")
        else:
            print("Erro ao salvar")
    else:
        print("Erro ao gerar imagem")
