#!/usr/bin/env python3
"""
Transform images mantendo pessoa - usando GEMINI 3.5 PRO
"""
import sys
import os
import base64
from datetime import datetime
from pathlib import Path

try:
    from google import genai
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError:
    os.system("python -m pip install --upgrade google-genai google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client --quiet")

SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = 'C:\\Users\\vsuga\\clawd\\config\\imperio-service-account.json'
TOKEN_FILE = 'C:\\Users\\vsuga\\clawd\\config\\token.json'
CREDENTIALS_FILE = 'C:\\Users\\vsuga\\clawd\\config\\oauth-credentials.json'
GOOGLE_CLOUD_API_KEY = "AQ.Ab8RN6ItMZiaE0b5Q_r78lyg-8r2pboURSl86_z7X0-8yiyWLw"

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

def generate_image(image_bytes, new_scenario, new_clothes):
    """Usa Gemini 2.0 Flash pra gerar imagem preservando pessoa"""
    from PIL import Image
    import io
    
    # Configura a API key diretamente (sem Vertex AI)
    genai.configure(api_key=GOOGLE_CLOUD_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    print("   Analisando pessoa...")
    
    # Converte bytes pra PIL Image
    pil_image = Image.open(io.BytesIO(image_bytes))
    
    # Step 1: Analisa a pessoa
    response_analyze = model.generate_content([
        """Analise esta pessoa em MÁXIMO DETALHE para eu poder recrear a mesma pessoa depois.

Descreva (MUITO preciso):
- Formato rosto
- Olhos (cor, formato, distância)
- Nariz (tamanho, forma)
- Boca (tamanho, formato)
- Cabelo (cor, textura, corte, comprimento)
- Barba/pelos
- Pele (tom, idade)
- Qualquer marca distintiva

Responda em 1-2 parágrafos bem específico.""",
        pil_image
    ])
    
    person_desc = response_analyze.text
    print(f"   Pessoa analisada")
    
    # Step 2: Gera nova imagem preservando pessoa
    print("   Gerando nova imagem...")
    
    prompt = f"""CRÍTICO: Gere a EXATAMENTE MESMA PESSOA em novo cenário.

PESSOA (manter 100% igual):
{person_desc}

MUDAR APENAS:
- Roupa: {new_clothes}
- Cenário: {new_scenario}

Requisitos:
- MESMA PESSOA, FACE IDÊNTICA
- Qualidade profissional Instagram/TikTok
- Iluminação profissional
- Nítida, vibrante
- Vertical ou quadrado

GERE A IMAGEM DIRETAMENTE.
"""
    
    response_generate = model.generate_content([prompt])
    
    # Tenta extrair a imagem da resposta
    if response_generate.candidates and response_generate.candidates[0].content.parts:
        for part in response_generate.candidates[0].content.parts:
            if hasattr(part, 'inline_data') and part.inline_data:
                image_data = part.inline_data.data
                print("   Imagem gerada!")
                return image_data
    
    print("   Resposta recebida (texto)")
    return None

def save_and_upload(image_bytes, folder_id, oauth_service):
    """Salva e sobe pro Drive"""
    if not image_bytes:
        return None
    
    output_dir = "C:\\Users\\vsuga\\clawd\\images"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(output_dir, f"pro_generated_{timestamp}.png")
    
    with open(filepath, 'wb') as f:
        f.write(image_bytes)
    
    print(f"Salvando no Drive...")
    
    file_metadata = {
        'name': f"transformed_pro_{timestamp}.png",
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

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: image-transform-pro.py 'cenario' 'roupas' [folder_source] [folder_dest]")
        sys.exit(1)
    
    scenario = sys.argv[1]
    clothes = sys.argv[2]
    src_folder = sys.argv[3] if len(sys.argv) > 3 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"
    dst_folder = sys.argv[4] if len(sys.argv) > 4 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"
    
    print("1. Conectando...")
    sa_srv = get_sa_drive()
    oauth_srv = get_oauth_drive()
    
    print("2. Buscando imagem...")
    img_file = get_first_image(src_folder, sa_srv)
    if not img_file:
        print("Nenhuma imagem!")
        sys.exit(1)
    
    print(f"   {img_file['name']}")
    print("3. Baixando...")
    img_bytes = download_image(img_file['id'], sa_srv)
    
    print("4. Processando com Gemini 3.5 Pro...")
    new_img = generate_image(img_bytes, scenario, clothes)
    
    print("5. Salvando...")
    result = save_and_upload(new_img, dst_folder, oauth_srv)
    
    if result:
        print("\nSUCESSO!")
        print(f"Local: {result['filepath']}")
        print(f"Drive: {result['drive_link']}")
    else:
        print("Não gerou imagem (mas pode ter processado)")
