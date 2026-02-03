#!/usr/bin/env python3
"""
Sistema Unificado iGaming - Gemini 3 Pro Image API
Usa a API do Gemini diretamente (sem Replicate)
Suporta até 5 imagens de referência para manter consistência do personagem
"""
import sys
import os
import json
import time
import base64
import random
import argparse
from datetime import datetime
from pathlib import Path

# Instalar dependências se necessário
try:
    from google import genai
    from google.genai import types
    from PIL import Image
except ImportError:
    print("Instalando dependências...")
    os.system("pip install google-genai pillow --quiet")
    from google import genai
    from google.genai import types
    from PIL import Image

try:
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from google.oauth2 import service_account
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
except ImportError:
    os.system("pip install google-api-python-client --quiet")
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
    from google.oauth2 import service_account
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request

# Configurações
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90')
SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = 'C:\\Users\\vsuga\\clawd\\config\\imperio-service-account.json'
TOKEN_FILE = 'C:\\Users\\vsuga\\clawd\\config\\token.json'
RCLONE_PATH = 'C:\\Users\\vsuga\\clawd\\rclone.exe'
OUTPUT_DIR = Path('C:\\Users\\vsuga\\clawd\\images\\generated')
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Perfis iGaming
PROFILES = {
    "jonathan": {
        "name": "Jhonatan Vieira",
        "folderId": "1-pRp7UtxfBVBNw1-5WJPCtzF5PnTmNUZ",
        "referencePhoto": "jonathan.jpg",
        "characteristics": "Homem brasileiro, cabelo curto escuro, barba, pele morena, expressão confiante"
    },
    "pedro": {
        "name": "Pedro vlEIRA", 
        "folderId": "16Mhy_ydDXeq2RuvWq3F1FQ9Ehei5tsa7",
        "referencePhoto": "pedro.jpg",
        "characteristics": "Homem brasileiro, careca, barba, expressão confiante e determinada"
    },
    "laise": {
        "name": "Laise",
        "folderId": "18vm4Fv1hYM8B89m-qhr-eUeZjxKmm9Zm",
        "referencePhoto": "laise.jpg",
        "characteristics": "Mulher brasileira, cabelo longo, sorriso natural, elegante"
    },
    "teo": {
        "name": "Teo Martins",
        "folderId": "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP",
        "referencePhoto": "teo.jpg",
        "characteristics": "Homem brasileiro, barba escura aparada, cabelo preto, olhos claros, pele morena, carismático"
    },
    "fernandes": {
        "name": "Fernandes Vieira",
        "folderId": None,
        "referencePhoto": "fernandes.jpg",
        "characteristics": "Homem brasileiro, cabelo curto, expressão profissional"
    }
}

# Cenários Lifestyle Realistas
SCENARIOS = {
    "viagem": [
        "em frente ao Coliseu em Roma, dia ensolarado, vestindo roupa casual elegante",
        "na Torre Eiffel à noite, luzes brilhantes de Paris ao fundo",
        "em Santorini, Grécia, casas brancas e mar azul turquesa ao fundo",
        "em Dubai, Burj Khalifa ao fundo, cidade moderna luxuosa",
        "em Nova York, Times Square, energia urbana vibrante",
        "nas Maldivas, overwater bungalow, águas cristalinas",
        "em Tóquio, ruas com neon, estilo moderno",
        "no Grand Canyon, paisagem épica, aventura ao ar livre"
    ],
    "praia": [
        "em praia paradisíaca no Caribe, areia branca, água cristalina, bermuda de banho",
        "em resort de luxo, piscina infinity com vista pro mar",
        "em beach club, ambiente festivo e sofisticado",
        "em iate no mar, deck espaçoso, vida luxuosa",
        "em praia brasileira, coqueiros, céu azul perfeito"
    ],
    "academia": [
        "em academia moderna de luxo, equipamentos high-tech, roupa esportiva",
        "fazendo crossfit, box moderno, iluminação industrial",
        "levantando peso, músculos definidos, foco total",
        "em aula de boxing, luvas de boxe, determinação"
    ],
    "restaurante": [
        "em restaurante gourmet sofisticado, iluminação íntima, terno elegante",
        "em rooftop bar com vista para cidade à noite, drink na mão",
        "em wine bar exclusivo, taças de vinho, ambiente romântico",
        "em brunch em café parisiense, croissant e café"
    ],
    "trabalho": [
        "em escritório executivo moderno, vista panorâmica da cidade, terno",
        "em coworking tech, ambiente criativo e inovador",
        "em reunião de negócios, apresentando para investidores",
        "em home office elegante, setup profissional"
    ],
    "lifestyle": [
        "dirigindo carro de luxo conversível na estrada costeira",
        "em jato privado, interior luxuoso de couro",
        "em festa exclusiva, ambiente VIP, roupa elegante",
        "comprando em shopping de luxo, sacolas de grife"
    ],
    "cassino": [
        "em cassino luxuoso de Las Vegas, luzes neon vibrantes, terno elegante",
        "em mesa de poker VIP, fichas empilhadas, ambiente exclusivo",
        "em sala de roleta, ambiente sofisticado e tenso"
    ]
}

# Copys iGaming
COPYS = [
    "QUAL O SEU BOLETO MAIS CARO? DEIXA AQUI NOS COMENTÁRIOS 👇🔥",
    "Manda aqui e concorra 🎁🔥",
    "Participa aqui 🫡💰",
    "Manda que eu to sorteando 🎁😎",
    "Comenta aqui e ganha 🔥🫡",
    "Manda aqui pro prêmio 💰👇",
    "Quer saber como eu faço? Comenta EU QUERO 👇",
    "Qual foi sua maior vitória? 🏆💰",
    "Quem quer participar? Deixa o 🔥 nos comentários",
    "Isso aqui é real, comenta pra participar 💰",
    "Manda a reação e participa 🎲✨",
    "Comenta e concorre 😎💰",
    "Próximo ganhador pode ser você 🎁💰",
    "Manda que eu to de olho 👀🫡",
    "Participa do prêmio 🫡😎",
    "Manda aqui e boa sorte 🍀💰"
]

def get_oauth_drive():
    """Conecta ao Drive via OAuth"""
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
    return build('drive', 'v3', credentials=creds) if creds else None

def get_reference_image(profile_name):
    """Busca imagem de referência do perfil"""
    profile = PROFILES.get(profile_name)
    if not profile:
        return None
    
    # Tentar vários caminhos
    paths = [
        Path(f"C:\\Users\\vsuga\\clawd\\{profile['referencePhoto']}"),
        Path(f"C:\\Users\\vsuga\\clawd\\images\\{profile['referencePhoto']}"),
        Path(f".\\{profile['referencePhoto']}")
    ]
    
    for ref_path in paths:
        if ref_path.exists():
            return ref_path
    
    return None

def generate_image_gemini(ref_image_path, prompt, aspect_ratio="1:1", resolution="2K"):
    """Gera imagem usando Gemini 3 Pro Image API diretamente"""
    print(f"   🎨 Gerando com Gemini 3 Pro Image...")
    print(f"   📐 Aspecto: {aspect_ratio} | Resolução: {resolution}")
    
    try:
        # Inicializar cliente
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        # Carregar imagem de referência
        ref_image = Image.open(ref_image_path)
        
        # Gerar
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[
                prompt,
                ref_image  # Imagem de referência para manter consistência
            ],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE'],
                image_config=types.ImageConfig(
                    aspect_ratio=aspect_ratio,
                    image_size=resolution
                )
            )
        )
        
        # Extrair imagem da resposta
        for part in response.parts:
            if hasattr(part, 'as_image') and (image := part.as_image()):
                print(f"   ✅ Imagem gerada com sucesso!")
                return image
            elif hasattr(part, 'text') and part.text:
                print(f"   📝 Resposta: {part.text[:100]}...")
        
        print("   ❌ Nenhuma imagem na resposta")
        return None
        
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        return None

def upload_to_drive(image, folder_id, filename, service):
    """Upload imagem para o Drive"""
    local_path = OUTPUT_DIR / filename
    
    # Salvar localmente
    image.save(local_path)
    print(f"   💾 Salvo: {local_path}")
    
    if service and folder_id:
        try:
            media = MediaFileUpload(str(local_path), mimetype='image/png')
            file = service.files().create(
                body={'name': filename, 'parents': [folder_id]},
                media_body=media,
                fields='id, webViewLink'
            ).execute()
            print(f"   ☁️ Upload: {file.get('webViewLink')}")
            return {'path': str(local_path), 'link': file.get('webViewLink')}
        except Exception as e:
            print(f"   ⚠️ Erro upload: {e}")
    
    # Fallback: usar RClone
    if folder_id:
        target = f"gdrive:{folder_id}/{filename}"
        os.system(f'"{RCLONE_PATH}" copyto "{local_path}" "{target}" 2>nul')
        print(f"   ☁️ Upload via RClone")
    
    return {'path': str(local_path)}

def generate_for_profile(profile_name, category=None, count=1, aspect="1:1", resolution="2K"):
    """Gera imagens para um perfil específico"""
    profile = PROFILES.get(profile_name)
    if not profile:
        print(f"❌ Perfil '{profile_name}' não encontrado")
        print(f"   Disponíveis: {', '.join(PROFILES.keys())}")
        return []
    
    if not profile['folderId']:
        print(f"⚠️ Perfil '{profile_name}' sem folder ID - salvando apenas localmente")
    
    print(f"\n🎨 Gerando para: {profile['name']}")
    print(f"📁 Pasta: {profile['folderId'] or 'LOCAL'}")
    
    # Buscar imagem de referência
    ref_path = get_reference_image(profile_name)
    if not ref_path:
        print(f"❌ Imagem de referência não encontrada: {profile['referencePhoto']}")
        print(f"   Coloque o arquivo em: C:\\Users\\vsuga\\clawd\\{profile['referencePhoto']}")
        return []
    
    print(f"✅ Referência: {ref_path}")
    
    # Escolher cenários
    if category and category in SCENARIOS:
        scenarios = SCENARIOS[category]
        selected = random.sample(scenarios, min(count, len(scenarios)))
    else:
        # Mix de todas as categorias
        all_scenarios = []
        for cat_scenarios in SCENARIOS.values():
            all_scenarios.extend(cat_scenarios)
        selected = random.sample(all_scenarios, min(count, len(all_scenarios)))
    
    # Conectar Drive
    try:
        drive = get_oauth_drive()
    except Exception as e:
        print(f"⚠️ Sem conexão OAuth: {e}")
        drive = None
    
    generated = []
    
    for i, scenario in enumerate(selected):
        print(f"\n[{i+1}/{count}] 🎬 Cenário: {scenario[:60]}...")
        
        # Montar prompt completo
        prompt = f"""Generate a realistic photograph of this EXACT person: {profile['characteristics']}.

Scene: {scenario}

CRITICAL: Maintain the EXACT same face, features, and identity from the reference image.
Style: Professional Instagram photography, natural lighting, high quality, realistic.
"""
        
        # Gerar imagem
        image = generate_image_gemini(ref_path, prompt, aspect, resolution)
        
        if image:
            ts = datetime.now().strftime("%Y%m%d_%H%M%S")
            cat_name = category or 'lifestyle'
            filename = f"{profile_name}_{cat_name}_{ts}.png"
            
            # Upload
            result = upload_to_drive(image, profile['folderId'], filename, drive)
            
            copy = random.choice(COPYS)
            generated.append({
                'filename': filename,
                'scenario': scenario,
                'copy': copy,
                'path': result.get('path'),
                'link': result.get('link')
            })
        else:
            print(f"   ❌ Falha na geração")
        
        # Pausa entre gerações (rate limiting)
        if i < len(selected) - 1:
            print("   ⏳ Aguardando 3s...")
            time.sleep(3)
    
    # Resumo
    print(f"\n{'='*50}")
    print(f"🎉 GERAÇÃO COMPLETA: {len(generated)}/{count}")
    print(f"{'='*50}")
    
    for g in generated:
        print(f"\n📷 {g['filename']}")
        print(f"   📍 {g['scenario'][:50]}...")
        print(f"   📝 Copy: {g['copy']}")
        if g.get('link'):
            print(f"   🔗 {g['link']}")
    
    return generated

def main():
    parser = argparse.ArgumentParser(
        description='Sistema iGaming - Gemini 3 Pro Image',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python igaming-gemini.py -p teo -c praia -n 3
  python igaming-gemini.py -p jonathan -c viagem -n 5 --aspect 16:9
  python igaming-gemini.py -p laise -n 2 --resolution 4K
        """
    )
    parser.add_argument('--profile', '-p', required=True, 
                       choices=list(PROFILES.keys()),
                       help='Perfil: jonathan, pedro, laise, teo, fernandes')
    parser.add_argument('--category', '-c', 
                       choices=list(SCENARIOS.keys()),
                       help='Categoria: viagem, praia, academia, restaurante, trabalho, lifestyle, cassino')
    parser.add_argument('--count', '-n', type=int, default=1,
                       help='Número de imagens (default: 1)')
    parser.add_argument('--aspect', '-a', default='1:1',
                       choices=['1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'],
                       help='Proporção (default: 1:1)')
    parser.add_argument('--resolution', '-r', default='2K',
                       choices=['1K', '2K', '4K'],
                       help='Resolução (default: 2K)')
    
    args = parser.parse_args()
    
    print("🎮 SISTEMA IGAMING - GEMINI 3 PRO IMAGE")
    print("=" * 50)
    print(f"🔑 API Key: ...{GEMINI_API_KEY[-8:]}")
    
    generate_for_profile(
        args.profile, 
        args.category, 
        args.count,
        args.aspect,
        args.resolution
    )

if __name__ == "__main__":
    main()
