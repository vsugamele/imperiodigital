#!/usr/bin/env python3
"""
Teo iGaming Style - usando API Google/Gemini diretamente (Imagen 4.0)
Muito mais direto que o Replicate!
"""
import sys
import os
import json
from datetime import datetime
from pathlib import Path

try:
    from google import genai
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError:
    os.system("python -m pip install --upgrade google-genai google-auth google-auth-httplib2 google-api-python-client --quiet")
    from google import genai
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

# Configurações
API_KEY = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"
SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = 'C:\\Users\\vsuga\\clawd\\config\\imperio-service-account.json'
TEO_FOLDER_ID = "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"

# Prompts iGaming para o Teo
prompts = [
    {
        "name": "teo_igaming_cassino_gemini",
        "prompt": "Professional photo of Brazilian man with dark trimmed beard, black hair, light eyes, tanned skin, sitting at modern casino poker table, wearing black dress shirt with rolled sleeves, holding cards confidently, blue and red neon lighting in background, slot machines glowing, dramatic cinematic lighting, high quality realistic photo, 4K resolution",
        "filename": "teo_cassino_gemini.png"
    },
    {
        "name": "teo_igaming_gaming_gemini", 
        "prompt": "Brazilian man with dark beard, black hair, light eyes, tan skin, in modern gaming office with multiple monitors showing betting screens, wearing black premium hoodie, concentrated expression, high-tech environment with green and blue LED lights, professional gaming equipment, soft neon lighting, ultra realistic photo, 4K",
        "filename": "teo_gaming_setup_gemini.png"
    },
    {
        "name": "teo_igaming_streamer_gemini",
        "prompt": "Brazilian man with dark beard, black hair, light eyes, tan skin, in professional streaming studio, wearing navy blue polo shirt, speaking to camera with betting odds graphics in background, charismatic expression, ring light setup, screens with statistics, professional broadcast environment, realistic photo, 4K quality",
        "filename": "teo_streamer_gemini.png"
    },
    {
        "name": "teo_igaming_vip_gemini",
        "prompt": "Brazilian man with dark beard, black hair, light eyes, tan skin, in luxurious VIP casino lounge, wearing casual gray blazer over white t-shirt, holding drink, leaning on elegant bar counter, confident relaxed expression, warm golden lighting, leather furniture, premium atmosphere, lifestyle photography, 4K realistic",
        "filename": "teo_vip_lounge_gemini.png"
    }
]

def upload_to_drive(filepath, filename, folder_id):
    """Upload para Google Drive"""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        service = build('drive', 'v3', credentials=credentials)
        
        file_metadata = {
            'name': filename,
            'parents': [folder_id]
        }
        media = MediaFileUpload(filepath, mimetype='image/png')
        file = service.files().create(body=file_metadata, media_body=media, fields='id, webViewLink').execute()
        
        return {
            'id': file.get('id'),
            'link': file.get('webViewLink')
        }
    except Exception as e:
        print(f"❌ Erro Drive: {e}")
        return None

def generate_teo_image(prompt_data):
    """Gera uma imagem usando Google Imagen 4.0"""
    
    output_dir = "C:\\Users\\vsuga\\clawd\\images"
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    print(f"🎮 Gerando: {prompt_data['name']}")
    print(f"📝 Modelo: Imagen 4.0 (Google)")
    
    try:
        # Gera com Imagen 4.0
        client = genai.Client(api_key=API_KEY)
        response = client.models.generate_images(
            model="models/imagen-4.0-generate-001",
            prompt=prompt_data["prompt"]
        )
        
        if not response.generated_images:
            return {"status": "error", "message": "Nenhuma imagem gerada"}
        
        image_obj = response.generated_images[0]
        image_bytes = image_obj.image.image_bytes
        
        # Salva localmente
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        local_filename = f"{prompt_data['name']}_{timestamp}.png"
        local_path = os.path.join(output_dir, local_filename)
        
        with open(local_path, 'wb') as f:
            f.write(image_bytes)
        
        print(f"✅ Salva localmente: {local_path}")
        
        # Upload pro Drive
        drive_result = upload_to_drive(local_path, prompt_data["filename"], TEO_FOLDER_ID)
        
        if drive_result:
            print(f"📤 Drive: {drive_result['link']}")
            return {
                "status": "success",
                "local_path": local_path,
                "drive_link": drive_result['link'],
                "drive_id": drive_result['id']
            }
        else:
            return {
                "status": "partial",
                "local_path": local_path,
                "message": "Imagem gerada localmente, erro no upload Drive"
            }
            
    except Exception as e:
        print(f"❌ Erro na geração: {e}")
        return {"status": "error", "message": str(e)}

def main():
    """Gera todas as 4 imagens do Teo iGaming"""
    
    print("🚀 Teo iGaming Style - API Google/Gemini Imagen 4.0")
    print(f"⏰ {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 60)
    
    results = []
    
    for i, prompt_data in enumerate(prompts, 1):
        print(f"\n[{i}/4] {prompt_data['name']}")
        result = generate_teo_image(prompt_data)
        results.append({
            "name": prompt_data["name"],
            "result": result
        })
        
        if i < len(prompts):
            print("⏳ Aguardando 3 segundos...")
            import time
            time.sleep(3)
    
    # Resumo final
    print(f"\n🎉 Concluído! Geradas {len(results)} imagens")
    print("\n📋 Resultados:")
    
    successful = 0
    for r in results:
        if r["result"]["status"] == "success":
            successful += 1
            print(f"✅ {r['name']}: {r['result']['drive_link']}")
        else:
            print(f"❌ {r['name']}: {r['result']['message']}")
    
    print(f"\n✅ Sucesso: {successful}/{len(results)} imagens")
    
    # Salvar log
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    log_file = f"logs/teo_igaming_gemini_{timestamp}.json"
    
    with open(log_file, 'w') as f:
        json.dump({
            "timestamp": timestamp,
            "model": "imagen-4.0-generate-001",
            "total": len(results),
            "successful": successful,
            "results": results
        }, f, indent=2)
    
    print(f"📁 Log salvo: {log_file}")

if __name__ == "__main__":
    main()