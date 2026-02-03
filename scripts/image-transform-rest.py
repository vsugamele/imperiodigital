#!/usr/bin/env python3
"""
Transform images - usando REST API puro do Gemini
"""
import sys
import os
import base64
import requests
import json
from datetime import datetime
from pathlib import Path

try:
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError:
    os.system("python -m pip install --upgrade google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client requests --quiet")

SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = 'C:\\Users\\vsuga\\clawd\\config\\imperio-service-account.json'
TOKEN_FILE = 'C:\\Users\\vsuga\\clawd\\config\\token.json'
CREDENTIALS_FILE = 'C:\\Users\\vsuga\\clawd\\config\\oauth-credentials.json'
GEMINI_API_KEY = "AQ.Ab8RN6ItMZiaE0b5Q_r78lyg-8r2pboURSl86_z7X0-8yiyWLw"

def get_sa_drive():
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=['https://www.googleapis.com/auth/drive'])
    return build('drive', 'v3', credentials=credentials)

def get_oauth_drive():
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
    return build('drive', 'v3', credentials=creds)

def get_first_image(folder_id, service):
    results = service.files().list(
        q=f"'{folder_id}' in parents and (mimeType='image/jpeg' or mimeType='image/png') and trashed=false",
        spaces='drive',
        fields='files(id, name)',
        pageSize=1
    ).execute()
    files = results.get('files', [])
    return files[0] if files else None

def download_image(file_id, service):
    request = service.files().get_media(fileId=file_id)
    return request.execute()

def analyze_person(image_bytes):
    """Analisa pessoa usando REST API"""
    print("   Analisando pessoa...")
    
    image_b64 = base64.standard_b64encode(image_bytes).decode('utf-8')
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": """ANALISE EXTREMAMENTE DETALHADA da pessoa:

Por favor faça uma descrição ultra-precisa que vou usar pra REGENERAR A MESMA PESSOA:

- Formato exato do rosto (oval, quadrado, redondo, etc)
- Olhos: cor, formato, tamanho, espaçamento
- Nariz: tamanho, forma, largura
- Boca: tamanho, formato dos lábios
- Cabelo: cor exata, textura, comprimento, estilo
- Barba/pelos faciais
- Pele: tom exato, textura
- Idade aparente
- Qualquer marca distintiva ou cicatriz
- Forma das sobrancelhas

Seja EXTREMAMENTE específico."""
                    },
                    {
                        "inline_data": {
                            "mime_type": "image/png",
                            "data": image_b64
                        }
                    }
                ]
            }
        ]
    }
    
    params = {"key": GEMINI_API_KEY}
    
    try:
        response = requests.post(url, json=payload, params=params, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and result['candidates']:
                text = result['candidates'][0]['content']['parts'][0]['text']
                print(f"   OK")
                return text
        else:
            print(f"   Erro: {response.status_code}")
            print(f"   {response.text[:200]}")
            return None
    except Exception as e:
        print(f"   Erro: {e}")
        return None

def generate_image_prompt(person_desc, new_scenario, new_clothes):
    """Gera prompt para nova imagem"""
    print("   Gerando prompt...")
    
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    
    prompt_text = f"""TAREFA CRÍTICA: Crie um prompt PERFEITO para gerar a MESMA PESSOA em novo cenário.

CARACTERÍSTICAS DA PESSOA (MANTER 100% IDÊNTICAS):
{person_desc}

MUDANÇAS APENAS:
- Roupa: {new_clothes}
- Cenário/Background: {new_scenario}

Agora gere um prompt em PORTUGUÊS ultra-detalhado que eu possa usar com um gerador de imagens (como Imagen, Midjourney, etc) para:
1. Recrear a MESMA PESSOA com essas características exatas
2. Vestida com {new_clothes}
3. Em um cenário de {new_scenario}

O prompt deve ser muito descritivo, com especificações de qualidade, iluminação, pose, etc.

GERE O PROMPT AGORA:"""
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt_text}
                ]
            }
        ]
    }
    
    params = {"key": GEMINI_API_KEY}
    
    try:
        response = requests.post(url, json=payload, params=params, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and result['candidates']:
                text = result['candidates'][0]['content']['parts'][0]['text']
                print(f"   OK")
                return text
        else:
            print(f"   Erro: {response.status_code}")
            return None
    except Exception as e:
        print(f"   Erro: {e}")
        return None

def save_and_upload(analysis, prompt, image_name, folder_id, oauth_service):
    """Salva análise e prompt, sobe pro Drive"""
    
    output_dir = "C:\\Users\\vsuga\\clawd\\images"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Salva localmente
    content = f"""TRANSFORMAÇÃO DE IMAGEM - {timestamp}
=====================================

IMAGEM ORIGINAL: {image_name}

ANÁLISE DA PESSOA:
{analysis}

---

PROMPT PARA GERAÇÃO:
{prompt}

=====================================
Use o prompt acima com um gerador de imagens para criar a imagem com as mesmas características da pessoa.
"""
    
    filepath = os.path.join(output_dir, f"transform_report_{timestamp}.txt")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Salvando no Drive...")
    
    file_metadata = {
        'name': f"transform_report_{timestamp}.txt",
        'parents': [folder_id]
    }
    
    media = MediaFileUpload(filepath, mimetype='text/plain')
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

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: image-transform-rest.py 'cenario' 'roupas' [folder_src] [folder_dst]")
        sys.exit(1)
    
    scenario = sys.argv[1]
    clothes = sys.argv[2]
    src_folder = sys.argv[3] if len(sys.argv) > 3 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"
    dst_folder = sys.argv[4] if len(sys.argv) > 4 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"
    
    print("1. Conectando ao Drive...")
    sa_srv = get_sa_drive()
    oauth_srv = get_oauth_drive()
    
    print("2. Buscando imagem do Teo...")
    img_file = get_first_image(src_folder, sa_srv)
    if not img_file:
        print("Nenhuma imagem encontrada!")
        sys.exit(1)
    
    print(f"   Encontrada: {img_file['name']}")
    print("3. Baixando...")
    img_bytes = download_image(img_file['id'], sa_srv)
    
    print("4. Analisando com Gemini 2.0 Flash...")
    analysis = analyze_person(img_bytes)
    
    if not analysis:
        print("Erro ao analisar!")
        sys.exit(1)
    
    print("5. Gerando prompt para nova imagem...")
    prompt = generate_image_prompt(analysis, scenario, clothes)
    
    if not prompt:
        print("Erro ao gerar prompt!")
        sys.exit(1)
    
    print("6. Salvando e subindo pro Drive...")
    result = save_and_upload(analysis, prompt, img_file['name'], dst_folder, oauth_srv)
    
    if result:
        print("\n✅ SUCESSO!")
        print(f"Arquivo local: {result['filepath']}")
        print(f"Drive: {result['drive_link']}")
        print("\nAgora você pode usar o prompt gerado com Imagen, Midjourney ou outro gerador!")
    else:
        print("Erro ao salvar")
        sys.exit(1)
