#!/usr/bin/env python3
"""
Teo iGaming - Google Imagen com REFERENCIA (metodo oficial)
"""
import sys
import os
import json
import base64
from datetime import datetime

TEO_PHOTO = r"C:\Users\vsuga\clawd\images\teo_20260127_075330.png"
GOOGLE_API_KEY = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"

# Cenarios iGaming
SCENARIOS = [
    {
        "name": "cassino_poker",
        "prompt": "Professional photo of this exact person in modern casino with poker table, blue and red neon lights, wearing black dress shirt with rolled sleeves, sitting confidently at poker table, dramatic lighting",
        "filename": "teo_igaming_cassino_ref.png"
    },
    {
        "name": "gaming_setup", 
        "prompt": "Professional photo of this exact person in modern gaming office with multiple monitors, wearing black premium hoodie, concentrated expression, high-tech environment with LED lighting",
        "filename": "teo_igaming_gaming_ref.png"
    }
]

def generate_with_reference(scenario_data):
    """Gera imagem mantendo identidade usando referenceImages"""
    
    print(f"Gerando: {scenario_data['name']}")
    print(f"   Prompt: {scenario_data['prompt'][:80]}...")
    
    # Ler foto do Teo
    if not os.path.exists(TEO_PHOTO):
        return {"status": "error", "message": "Foto do Teo nao encontrada"}
    
    with open(TEO_PHOTO, 'rb') as f:
        image_bytes = f.read()
    
    # Converter para base64
    image_b64 = base64.standard_b64encode(image_bytes).decode('utf-8')
    
    print(f"   Foto carregada: {len(image_bytes)} bytes")
    
    # Body para Google Imagen com referenceImages
    body = {
        "instances": [
            {
                "prompt": scenario_data["prompt"],
                "referenceImages": [
                    {
                        "referenceId": 1,
                        "referenceImage": {
                            "bytesBase64Encoded": image_b64
                        }
                    }
                ]
            }
        ],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "1:1"
        }
    }
    
    headers = {
        'Content-Type': 'application/json',
        'x-goog-api-key': GOOGLE_API_KEY
    }
    
    # URL para Imagen com customizacao
    url = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-capability-001:predict"
    
    try:
        print("   Enviando para Google Imagen com referencia...")
        
        import requests
        response = requests.post(url, headers=headers, json=body)
        
        if response.status_code == 200:
            result = response.json()
            
            if "predictions" in result and len(result["predictions"]) > 0:
                prediction = result["predictions"][0]
                
                if "bytesBase64Encoded" in prediction:
                    # Decodificar imagem
                    image_data = base64.b64decode(prediction["bytesBase64Encoded"])
                    
                    # Salvar
                    output_path = f"C:\\Users\\vsuga\\clawd\\images\\{scenario_data['filename']}"
                    with open(output_path, 'wb') as f:
                        f.write(image_data)
                    
                    print(f"   SUCESSO: {output_path}")
                    print(f"   Tamanho: {len(image_data)} bytes")
                    
                    return {
                        "status": "success",
                        "path": output_path,
                        "size": len(image_data)
                    }
                else:
                    print("   ERRO: Sem bytesBase64Encoded na resposta")
                    return {"status": "error", "message": "No image data"}
            else:
                print("   ERRO: Sem predictions na resposta")
                return {"status": "error", "message": "No predictions"}
        else:
            print(f"   ERRO HTTP: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return {"status": "error", "message": f"HTTP {response.status_code}: {response.text}"}
            
    except Exception as e:
        print(f"   EXCECAO: {e}")
        return {"status": "error", "message": str(e)}

def main():
    """Testa Google Imagen com referencia"""
    
    print("TEO IGAMING - GOOGLE IMAGEN COM REFERENCIA")
    print(f"Foto base: {os.path.basename(TEO_PHOTO)}")
    print("-" * 60)
    
    if not os.path.exists(TEO_PHOTO):
        print(f"ERRO: Foto nao encontrada: {TEO_PHOTO}")
        return
    
    # Testar com 2 cenarios primeiro
    for i, scenario in enumerate(SCENARIOS, 1):
        print(f"\n[{i}/{len(SCENARIOS)}] {scenario['name'].upper()}")
        
        result = generate_with_reference(scenario)
        
        if result["status"] == "success":
            print(f"   OK: Imagem salva em {result['path']}")
        else:
            print(f"   FALHOU: {result['message']}")
        
        if i < len(SCENARIOS):
            print("   Pausa de 5 segundos...")
            import time
            time.sleep(5)
    
    print("\nTeste concluido!")

if __name__ == "__main__":
    main()