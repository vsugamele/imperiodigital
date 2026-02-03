#!/usr/bin/env python3
"""
Usa Service Account pra BAIXAR do Drive do Teo
Usa GEMINI CLI pra GERAR imagens (melhor qualidade)
Usa OAuth2 pra FAZER UPLOAD do resultado
"""
import sys
import os
import json
import subprocess
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

SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = 'C:\\Users\\vsuga\\clawd\\config\\imperio-service-account.json'
TOKEN_FILE = 'C:\\Users\\vsuga\\clawd\\config\\token.json'
CREDENTIALS_FILE = 'C:\\Users\\vsuga\\clawd\\config\\oauth-credentials.json'

def get_service_account_drive():
    """Service Account pra DOWNLOAD"""
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=['https://www.googleapis.com/auth/drive'])
    return build('drive', 'v3', credentials=credentials)

def get_oauth_drive():
    """OAuth2 pra UPLOAD"""
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    
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
    """Baixa imagem do Drive"""
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
        from google import genai
        from PIL import Image
        import io
        
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
- Qualquer marca ou característica distintiva

Seja bem específico e objetivo.
""",
                img
            ]
        )
        
        return message.text
    except Exception as e:
        print(f"Erro ao analisar: {e}")
        return None

def generate_with_cli(person_description, new_scenario, new_clothes, output_path):
    """Usa GEMINI CLI pra gerar imagem"""
    try:
        prompt = f"""Ultra high quality social media photo. Same person, different scenario.

PERSON (DO NOT CHANGE - KEEP EXACT):
{person_description}

NEW OUTFIT: {new_clothes}
NEW SCENE: {new_scenario}

CRITICAL: The FACE and physical features MUST be identical to the original. Only change clothing and background.
Professional Instagram/TikTok quality. Sharp, detailed, vibrant colors. Studio lighting.
Vertical composition, perfect for social media.
"""
        
        # Salva o prompt em arquivo temporário
        prompt_file = f"{output_path}.prompt.txt"
        with open(prompt_file, 'w', encoding='utf-8') as f:
            f.write(prompt)
        
        print(f"   Rodando Gemini CLI...")
        
        # Chama o CLI do Gemini via python -m
        result = subprocess.run([
            'python', '-m', 'google.genai', 'image-generate',
            '--prompt', prompt,
            '--model', 'imagen-4.0-ultra',
            '--output', output_path
        ], capture_output=True, text=True, timeout=120)
        
        if result.returncode == 0:
            print(f"   CLI OK")
            # Verifica se o arquivo foi criado
            if os.path.exists(output_path):
                return True
            else:
                # Tenta encontrar a imagem gerada
                img_files = [f for f in os.listdir(os.path.dirname(output_path)) if f.startswith(os.path.basename(output_path))]
                if img_files:
                    return True
        else:
            print(f"   Erro CLI: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"Erro ao gerar com CLI: {e}")
        return False

def save_and_upload(image_path, folder_id, oauth_service):
    """Sobe imagem pro Drive (OAuth2)"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"transformed_cli_{timestamp}.png"
        
        # Se a imagem gerada tem outro nome, renomeia
        if not os.path.exists(image_path):
            # Procura por arquivos gerados pelo CLI
            base_dir = os.path.dirname(image_path)
            base_name = os.path.basename(image_path)
            matching = [f for f in os.listdir(base_dir) if base_name in f and f.endswith('.png')]
            if matching:
                image_path = os.path.join(base_dir, matching[0])
        
        if not os.path.exists(image_path):
            print(f"Arquivo nao encontrado: {image_path}")
            return None
        
        print(f"Subindo pro Drive via OAuth2...")
        
        # Sobe pro Drive
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
        from googleapiclient.http import MediaFileUpload
        media = MediaFileUpload(image_path, mimetype='image/png')
        file = oauth_service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink'
        ).execute()
        
        return {
            'filepath': image_path,
            'drive_link': file.get('webViewLink'),
            'drive_id': file.get('id')
        }
    except Exception as e:
        print(f"Erro ao salvar: {e}")
        return None

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: image-transform-cli.py 'cenario novo' 'roupas novas' [folder_id_source] [folder_id_dest]")
        sys.exit(1)
    
    new_scenario = sys.argv[1]
    new_clothes = sys.argv[2]
    folder_id_source = sys.argv[3] if len(sys.argv) > 3 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"
    folder_id_dest = sys.argv[4] if len(sys.argv) > 4 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"
    
    print("1. Conectando...")
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
    print(f"   OK")
    
    print("5. Gerando nova imagem com Gemini CLI...")
    output_dir = "C:\\Users\\vsuga\\clawd\\images"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(output_dir, f"cli_generated_{timestamp}.png")
    
    if generate_with_cli(person_desc, new_scenario, new_clothes, output_path):
        print("6. Salvando e subindo via OAuth2...")
        result = save_and_upload(output_path, folder_id_dest, oauth_service)
        
        if result:
            print("\nSUCESSO!")
            print(f"Local: {result['filepath']}")
            print(f"Drive: {result['drive_link']}")
        else:
            print("Erro ao salvar")
    else:
        print("Erro ao gerar imagem com CLI")
