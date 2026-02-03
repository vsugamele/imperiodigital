#!/usr/bin/env python3
"""
Teo iGaming - Gemini 3 Pro Image com REFERENCIA
Usando ate 14 imagens de referencia para manter identidade
"""
import os
from google import genai
from google.genai import types
from PIL import Image

# Configurar cliente Google
GOOGLE_API_KEY = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"
client = genai.Client(api_key=GOOGLE_API_KEY)

# Foto original do Teo
TEO_PHOTO = r"C:\Users\vsuga\clawd\images\teo_20260127_075330.png"

# Cenarios iGaming
SCENARIOS = [
    {
        "name": "cassino_poker",
        "prompt": "Professional photo of this exact person in modern casino with poker table, blue and red neon lights, wearing black dress shirt with rolled sleeves, sitting confidently at poker table, dramatic casino lighting",
        "filename": "teo_igaming_cassino_gemini3.png"
    },
    {
        "name": "gaming_setup",
        "prompt": "Professional photo of this exact person in modern gaming office with multiple monitors and RGB LED lighting, wearing black premium hoodie, concentrated gaming expression, high-tech environment",
        "filename": "teo_igaming_gaming_gemini3.png"
    },
    {
        "name": "streamer_studio",
        "prompt": "Professional photo of this exact person in professional streaming studio with cameras and multiple screens, wearing navy blue polo shirt, engaging streamer pose, professional broadcast setup",
        "filename": "teo_igaming_streamer_gemini3.png"
    },
    {
        "name": "vip_lounge",
        "prompt": "Professional photo of this exact person in luxurious VIP casino lounge with golden ambient lighting, wearing casual gray blazer over white t-shirt, relaxed premium atmosphere",
        "filename": "teo_igaming_vip_gemini3.png"
    }
]

def generate_with_gemini3(scenario_data):
    """Gera imagem usando Gemini 3 Pro Image com referencia"""
    
    print(f"\nGerando: {scenario_data['name']}")
    print(f"   Prompt: {scenario_data['prompt'][:80]}...")
    
    if not os.path.exists(TEO_PHOTO):
        print(f"   ERRO: Foto nao encontrada: {TEO_PHOTO}")
        return {"status": "error", "message": "Foto nao encontrada"}
    
    print(f"   Foto referencia: {os.path.basename(TEO_PHOTO)}")
    
    try:
        # Carregar imagem de referencia
        reference_image = Image.open(TEO_PHOTO)
        
        print("   Enviando para Gemini 3 Pro Image...")
        
        # Gerar conteudo com referencia
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[
                scenario_data["prompt"],
                reference_image  # FOTO DO TEO COMO REFERENCIA!
            ],
            config=types.GenerateContentConfig(
                response_modalities=['IMAGE'],
                image_config=types.ImageConfig(
                    aspect_ratio="4:3",  # Bom para retratos
                    image_size="2K"      # Alta resolucao
                )
            )
        )
        
        # Salvar imagem gerada
        for part in response.parts:
            if image := part.as_image():
                output_path = f"C:\\Users\\vsuga\\clawd\\images\\{scenario_data['filename']}"
                image.save(output_path)
                
                print(f"   SUCESSO: {output_path}")
                print(f"   Tamanho: {image.size}")
                
                return {
                    "status": "success",
                    "path": output_path,
                    "size": image.size
                }
        
        print("   ERRO: Nenhuma imagem gerada")
        return {"status": "error", "message": "Nenhuma imagem na resposta"}
        
    except Exception as e:
        print(f"   ERRO: {e}")
        return {"status": "error", "message": str(e)}

def main():
    """Gera todas as 4 imagens do Teo iGaming"""
    
    print("=" * 60)
    print("TEO IGAMING - GEMINI 3 PRO IMAGE")
    print("Usando foto de referencia para manter identidade")
    print("=" * 60)
    
    if not os.path.exists(TEO_PHOTO):
        print(f"\nERRO: Foto do Teo nao encontrada: {TEO_PHOTO}")
        return
    
    results = []
    
    for i, scenario in enumerate(SCENARIOS, 1):
        print(f"\n[{i}/{len(SCENARIOS)}] {scenario['name'].upper()}")
        
        result = generate_with_gemini3(scenario)
        results.append({
            "name": scenario["name"],
            "result": result
        })
        
        if result["status"] == "success":
            print(f"   OK!")
        else:
            print(f"   FALHOU: {result['message']}")
        
        # Pausa entre gerações
        if i < len(SCENARIOS):
            print("   Aguardando 5 segundos...")
            import time
            time.sleep(5)
    
    # Resumo final
    print("\n" + "=" * 60)
    print("RESULTADOS FINAIS:")
    print("=" * 60)
    
    success_count = 0
    for r in results:
        if r["result"]["status"] == "success":
            success_count += 1
            print(f"   OK: {r['name']} -> {r['result']['path']}")
        else:
            print(f"   ERRO: {r['name']} -> {r['result']['message']}")
    
    print(f"\nTotal: {success_count}/{len(SCENARIOS)} imagens geradas")
    
    if success_count == len(SCENARIOS):
        print("\nSUCESSO TOTAL! Todas as imagens do Teo foram geradas!")
    elif success_count > 0:
        print(f"\nSucesso parcial: {success_count} imagens geradas")
    else:
        print("\nNenhuma imagem foi gerada com sucesso")

if __name__ == "__main__":
    main()
