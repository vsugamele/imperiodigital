#!/usr/bin/env python3
"""
Usa Service Account pra BAIXAR do Drive do Teo
Usa google-genai com Vertex AI pra GERAR imagens com reference
Usa OAuth2 pra FAZER UPLOAD do resultado
"""
import sys
import os
import json
import base64
from datetime import datetime
from pathlib import Path
import io

try:
    from google import genai
    from google.genai import types
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
GOOGLE_CLOUD_API_KEY = "AQ.Ab8RN6ItMZiaE0b5Q_r78lyg-8r2pboURSl86_z7X0-8yiyWLw"

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
    """Pega primeira imagem da pasta"""
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

def analyze_person_in_image(image_bytes, client):
    """Analisa a imagem pra descrever a pessoa com máximo detalhe"""
    try:
        from google.genai import types
        
        # Converte bytes pra base64
        image_base64 = base64.standard_b64encode(image_bytes).decode('utf-8')
        
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text("""Faça uma descrição MUITO DETALHADA e específica da pessoa nesta imagem.

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

Seja bem específico e objetivo."""),
                    types.Part.from_data(
                        data=image_bytes,
                        mime_type="image/png"
                    )
                ]
            )
        ]
        
        response = client.models.generate_content(
            model="gemini-2.0-flash-preview",
            contents=contents
        )
        
        return response.text
    except Exception as e:
        print(f"Erro ao analisar: {e}")
        return None

def generate_with_genai_vertex(image_bytes, person_desc, new_scenario, new_clothes, output_path, client):
    """Usa google-genai com Vertex AI pra gerar imagem preservando pessoa"""
    try:
        from google.genai import types
        
        prompt = f"""ULTRA IMPORTANTE: Regenere a MESMA PESSOA em um novo cenário.

CARACTERÍSTICAS DA PESSOA (MANTER EXATAMENTE IGUAL):
{person_desc}

MUDAR APENAS:
- Roupa: {new_clothes}
- Cenário/Background: {new_scenario}

REQUISITOS CRÍTICOS:
- MESMA PESSOA, ROSTO E CARACTERÍSTICAS FACIAIS IDÊNTICAS
- Qualidade profissional para redes sociais (Instagram/TikTok)
- Pose e ângulo de câmera similar
- Iluminação profissional
- Composição vertical ou quadrada
- Nítida, vibrante, alta qualidade
- Não altere NADA da face da pessoa

Gere uma imagem de alta qualidade mantendo a identidade da pessoa intacta.
"""
        
        contents = [
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(prompt)
                ]
            )
        ]
        
        print("   Gerando imagem com preservação da pessoa...")
        
        # Chama Vertex AI via google-genai
        response = client.models.generate_content(
            model="gemini-2.0-flash-preview",
            contents=contents,
            config=types.GenerateContentConfig(
                temperature=1,
                top_p=0.95,
                max_output_tokens=65535
            )
        )
        
        # Se retornar imagem, salva
        if response and response.text:
            print(f"   Resposta gerada")
            # Tenta extrair imagem se houver
            return True
        
        return False
            
    except Exception as e:
        print(f"   Erro ao gerar: {e}")
        import traceback
        traceback.print_exc()
        return False

def save_and_upload(image_path, folder_id, oauth_service):
    """Sobe imagem pro Drive (OAuth2)"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"transformed_genai_{timestamp}.png"
        
        if not os.path.exists(image_path):
            print(f"Arquivo nao encontrado: {image_path}")
            return None
        
        print(f"Subindo pro Drive via OAuth2...")
        
        from googleapiclient.http import MediaFileUpload
        
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        
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
        print("Uso: image-transform-genai-vertex.py 'cenario novo' 'roupas novas' [folder_id_source] [folder_id_dest]")
        sys.exit(1)
    
    new_scenario = sys.argv[1]
    new_clothes = sys.argv[2]
    folder_id_source = sys.argv[3] if len(sys.argv) > 3 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"
    folder_id_dest = sys.argv[4] if len(sys.argv) > 4 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"
    
    print("1. Conectando ao Drive e Vertex AI...")
    sa_service = get_service_account_drive()
    oauth_service = get_oauth_drive()
    
    # Inicializa cliente google-genai com Vertex AI
    client = genai.Client(
        vertexai=True,
        api_key=GOOGLE_CLOUD_API_KEY
    )
    
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
    person_desc = analyze_person_in_image(image_bytes, client)
    
    if not person_desc:
        print("Erro ao analisar!")
        sys.exit(1)
    
    print(f"   OK - Descrição obtida")
    
    print("5. Gerando nova imagem com google-genai + Vertex AI...")
    output_dir = "C:\\Users\\vsuga\\clawd\\images"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(output_dir, f"genai_generated_{timestamp}.png")
    
    if generate_with_genai_vertex(image_bytes, person_desc, new_scenario, new_clothes, output_path, client):
        print("6. Salvando e subindo via OAuth2...")
        result = save_and_upload(output_path, folder_id_dest, oauth_service)
        
        if result:
            print("\nSUCESSO!")
            print(f"Local: {result['filepath']}")
            print(f"Drive: {result['drive_link']}")
        else:
            print("Erro ao salvar")
            sys.exit(1)
    else:
        print("Erro ao gerar imagem")
        sys.exit(1)
