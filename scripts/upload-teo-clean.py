#!/usr/bin/env python3
"""Upload das imagens Teo iGaming para Google Drive"""
import os
import sys
from pathlib import Path

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError:
    print("Instalando dependencias...")
    os.system("pip install google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client --quiet")
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']
SERVICE_ACCOUNT_FILE = r'C:\Users\vsuga\clawd\config\imperio-service-account.json'
TEO_FOLDER_ID = "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"

IMAGES = [
    {
        "local_path": r"C:\Users\vsuga\clawd\images\teo_cassino_google.png",
        "drive_name": "teo_igaming_cassino.png",
        "description": "Teo iGaming - Cassino Poker (Google Imagen 4.0)"
    },
    {
        "local_path": r"C:\Users\vsuga\clawd\images\teo_gaming_google.png", 
        "drive_name": "teo_igaming_gaming.png",
        "description": "Teo iGaming - Gaming Setup (Google Imagen 4.0)"
    },
    {
        "local_path": r"C:\Users\vsuga\clawd\images\teo_streamer_google.png",
        "drive_name": "teo_igaming_streamer.png", 
        "description": "Teo iGaming - Streamer Studio (Google Imagen 4.0)"
    },
    {
        "local_path": r"C:\Users\vsuga\clawd\images\teo_vip_google.png",
        "drive_name": "teo_igaming_vip.png",
        "description": "Teo iGaming - VIP Lounge (Google Imagen 4.0)"
    }
]

def upload_to_drive(file_path, drive_filename, description, folder_id):
    """Upload arquivo para Google Drive"""
    try:
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        
        service = build('drive', 'v3', credentials=credentials)
        
        file_metadata = {
            'name': drive_filename,
            'description': description,
            'parents': [folder_id]
        }
        
        media = MediaFileUpload(file_path, mimetype='image/png')
        file_result = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, name, webViewLink'
        ).execute()
        
        return {
            'status': 'success',
            'id': file_result.get('id'),
            'name': file_result.get('name'), 
            'link': file_result.get('webViewLink')
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'message': str(e)
        }

def main():
    """Upload todas as imagens do Teo"""
    print("Upload Teo iGaming para Google Drive")
    print("Pasta destino:", TEO_FOLDER_ID)
    print("-" * 50)
    
    results = []
    success_count = 0
    
    for i, img in enumerate(IMAGES, 1):
        print(f"[{i}/{len(IMAGES)}] {img['drive_name']}")
        
        if not os.path.exists(img['local_path']):
            print(f"   ERRO: Arquivo nao encontrado: {img['local_path']}")
            results.append({
                'name': img['drive_name'],
                'status': 'error',
                'message': 'File not found'
            })
            continue
        
        print(f"   Enviando: {os.path.basename(img['local_path'])}")
        
        result = upload_to_drive(
            img['local_path'], 
            img['drive_name'],
            img['description'],
            TEO_FOLDER_ID
        )
        
        if result['status'] == 'success':
            print(f"   SUCESSO: {result['link']}")
            success_count += 1
        else:
            print(f"   ERRO: {result['message']}")
        
        results.append({
            'name': img['drive_name'],
            **result
        })
        
        print()
    
    print("=" * 50)
    print(f"Concluido: {success_count}/{len(IMAGES)} uploads bem-sucedidos")
    
    if success_count > 0:
        print("\nLinks das imagens no Drive:")
        for result in results:
            if result['status'] == 'success':
                print(f"   {result['name']}: {result['link']}")
    
    return success_count == len(IMAGES)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)