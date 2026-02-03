#!/usr/bin/env python3
"""
Pega imagem do Drive usando Service Account, analisa a pessoa e gera nova imagem
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
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from PIL import Image
except ImportError:
    os.system("python -m pip install --upgrade google-genai google-auth google-auth-httplib2 google-api-python-client pillow --quiet")
    from google import genai
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from PIL import Image

SCOPES = ['https://www.googleapis.com/auth/drive']
SERVICE_ACCOUNT_FILE = 'C:\\Users\\vsuga\\clawd\\config\\imperio-service-account.json'

def get_drive_service():
    """Cria serviço Drive com Service Account"""
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=credentials)

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
    """Analisa a imagem pra descrever a pessoa"""
    try:
        client = genai.Client(api_key="AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90")
        
        img = Image.open(io.BytesIO(image_bytes))
        
        message = client.models.generate_content(
            model="models/gemini-2.0-flash",
            contents=[
                "Descreva a pessoa nesta imagem para uso em fotos de redes sociais. Foque em: rosto, tipo de cabelo, compleição, estilo. Seja bem específico e objetivo.",
                img
            ]
        )
        
        return message.text
    except Exception as e:
        print(f"Erro ao analisar: {e}")
        return None

def generate_new_image(person_description, new_scenario, new_clothes):
    """Gera nova imagem com mesma pessoa mas novo cenário/roupas para redes sociais"""
    try:
        client = genai.Client(api_key="AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90")
        
        prompt = f"""
CRIAR FOTO DE REDE SOCIAL (Instagram/TikTok quality):

Pessoa:
{person_description}

Nova Roupa: {new_clothes}
Cenário: {new_scenario}

INSTRUÇÕES:
- Mantenha as características faciais e físicas exatas da pessoa
- Altere COMPLETAMENTE o cenário e roupas
- Estilo: profissional para redes sociais
- Iluminação: luz natural/estúdio profissional
- Composição: retrato vertical ou quadrado (bom para posts)
- Qualidade: alta, nítida, vibrante
- Background: complementar à roupa
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

def save_and_upload(image_bytes, folder_id, service, description):
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
        print("Uso: image-transform-sa.py 'cenario novo' 'roupas novas' [folder_id]")
        sys.exit(1)
    
    new_scenario = sys.argv[1]
    new_clothes = sys.argv[2]
    folder_id = sys.argv[3] if len(sys.argv) > 3 else "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"  # Teo
    
    print("1. Conectando com Service Account...")
    service = get_drive_service()
    
    print("2. Buscando imagem no Drive do Teo...")
    image_file = get_first_image_from_folder(folder_id, service)
    
    if not image_file:
        print("Nenhuma imagem encontrada!")
        sys.exit(1)
    
    print(f"   Selecionada: {image_file['name']}")
    print("3. Baixando...")
    image_bytes = download_image(image_file['id'], service)
    
    if not image_bytes:
        print("Erro ao baixar imagem!")
        sys.exit(1)
    
    print("4. Analisando a pessoa...")
    person_desc = analyze_person_in_image(image_bytes)
    print(f"   Descrição: {person_desc[:150]}...")
    
    print("5. Gerando nova imagem...")
    new_image = generate_new_image(person_desc, new_scenario, new_clothes)
    
    if new_image:
        print("6. Salvando e subindo...")
        result = save_and_upload(new_image, folder_id, service, person_desc)
        
        if result:
            print("\n✅ Sucesso!")
            print(f"Local: {result['filepath']}")
            print(f"Drive: {result['drive_link']}")
        else:
            print("Erro ao salvar")
    else:
        print("Erro ao gerar imagem")
