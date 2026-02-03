#!/usr/bin/env python3
"""
Transform images - Usa Claude pra gerar a imagem (experimental)
"""
import sys
import os
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

def save_and_upload(analysis_and_prompt, folder_id, oauth_service):
    """Salva relatorio de transformacao e sobe pro Drive"""
    
    output_dir = "C:\\Users\\vsuga\\clawd\\images"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(output_dir, f"transform_guide_{timestamp}.txt")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(analysis_and_prompt)
    
    print(f"Salvando no Drive...")
    
    file_metadata = {
        'name': f"transform_guide_{timestamp}.txt",
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
        print("Uso: image-transform-claude.py 'cenario' 'roupas' [folder_src] [folder_dst]")
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
    
    # Aqui você poderia:
    # 1. Enviar a imagem pra Claude pra análise
    # 2. Gerar um prompt detalhado
    # 3. Usar Imagen ou DALL-E pra gerar
    
    content = f"""GUIA DE TRANSFORMACAO DE IMAGEM
=====================================
Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

ORIGINAL: {img_file['name']}
TAMANHO: {len(img_bytes)} bytes

TRANSFORMACAO SOLICITADA:
- Cenario: {scenario}
- Roupas: {clothes}

STATUS: Aguardando permissoes no Vertex AI para gerar imagem automaticamente.

PROXIMOS PASSOS:
1. Aumentar permissoes do Service Account no Google Cloud
2. Tentar novamente com Imagen 3 ou 4

OU

Use o prompt manual:
"Recrie a mesma pessoa em um novo cenario: {scenario}, vestida com {clothes}, em qualidade profissional de Instagram/TikTok"
"""
    
    print("4. Gerando guia de transformacao...")
    result = save_and_upload(content, dst_folder, oauth_srv)
    
    if result:
        print("\nCONCLUIDO")
        print(f"Guia salvo: {result['drive_link']}")
        print("\nPROXIMO PASSO: Configure as permissoes do Service Account no Google Cloud")
    else:
        print("Erro ao salvar")
        sys.exit(1)
