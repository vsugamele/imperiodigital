#!/usr/bin/env python3
"""
Transform images mantendo pessoa - usando NOVO google-genai SDK
"""
import sys
import os
import base64
from datetime import datetime
from pathlib import Path

try:
    from google import genai
    from google.genai import types
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError as e:
    print(f"Instalando: {e}")
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
    """Usa novo google-genai SDK com Gemini 2.0 Flash"""
    
    # Inicializa cliente
    client = genai.Client(api_key=GOOGLE_CLOUD_API_KEY)
    
    print("   Analisando pessoa...")
    
    # Converte imagem pra base64
    image_b64 = base64.standard_b64encode(image_bytes).decode('utf-8')
    
    # Step 1: Analisa a pessoa
    analysis_response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part(text="""ANALISE EXTREMAMENTE DETALHADA da pessoa:

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

Seja EXTREMAMENTE específico."""),
                    types.Part(
                        inline_data=types.Blob(
                            mime_type="image/png",
                            data=image_b64
                        )
                    )
                ]
            )
        ]
    )
    
    person_desc = analysis_response.text
    print(f"   OK")
    
    # Step 2: Gera nova imagem
    print("   Gerando nova imagem...")
    
    prompt = f"""TAREFA CRÍTICA: Regenere a MESMA PESSOA em novo cenário.

CARACTERÍSTICAS DA PESSOA (MANTER 100% IDÊNTICAS):
{person_desc}

MUDANÇAS APENAS:
- Roupa: {new_clothes}
- Cenário/Background: {new_scenario}

REQUISITOS:
✓ MESMA PESSOA - rosto e características faciais IDÊNTICAS
✓ Qualidade profissional Instagram/TikTok
✓ Pose e ângulo similar
✓ Iluminação profissional
✓ Nítida, vibrante, alta qualidade
✓ Vertical ou quadrado
✓ NÃO altere NADA do rosto da pessoa

GERE A IMAGEM AGORA."""
    
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            types.Content(
                role="user",
                parts=[types.Part(text=prompt)]
            )
        ]
    )
    
    if response.text:
        print("   Processada")
        return response.text
    
    return None

def save_and_upload(result_text, folder_id, oauth_service):
    """Salva resultado e sobe pro Drive"""
    if not result_text:
        return None
    
    output_dir = "C:\\Users\\vsuga\\clawd\\images"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(output_dir, f"genai_result_{timestamp}.txt")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(result_text)
    
    print(f"Salvando no Drive...")
    
    file_metadata = {
        'name': f"result_{timestamp}.txt",
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
        'drive_id': file.get('id'),
        'text': result_text[:300] + "..."
    }

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: image-transform-genai.py 'cenario' 'roupas' [folder_src] [folder_dst]")
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
    
    print("4. Processando com Gemini 2.0 Flash (novo SDK)...")
    result = generate_image(img_bytes, scenario, clothes)
    
    if result:
        print("5. Salvando...")
        saved = save_and_upload(result, dst_folder, oauth_srv)
        
        if saved:
            print("\n✅ SUCESSO!")
            print(f"Preview: {saved['text']}")
            print(f"Drive: {saved['drive_link']}")
        else:
            print("Erro ao salvar")
            sys.exit(1)
    else:
        print("Erro ao processar")
        sys.exit(1)
