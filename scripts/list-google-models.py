#!/usr/bin/env python3
"""Lista modelos disponíveis na API Google"""
import requests

GOOGLE_API_KEY = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"

headers = {
    'x-goog-api-key': GOOGLE_API_KEY
}

print("Listando modelos Google disponíveis...")

try:
    response = requests.get(
        "https://generativelanguage.googleapis.com/v1beta/models",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"Total de modelos: {len(data.get('models', []))}")
        print()
        
        for model in data.get('models', []):
            name = model.get('name', 'Unknown')
            display_name = model.get('displayName', 'N/A')
            description = model.get('description', '')
            
            print(f"Nome: {name}")
            print(f"Display: {display_name}")
            
            if 'image' in name.lower() or 'imagen' in name.lower():
                print("  ** MODELO DE IMAGEM **")
            
            if description:
                print(f"Desc: {description[:100]}...")
            
            print("-" * 50)
    
    else:
        print(f"Erro: {response.status_code}")
        print(response.text)

except Exception as e:
    print(f"Erro: {e}")