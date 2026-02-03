#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Adicionar Copy's nas Imagens do Teo"""

from PIL import Image, ImageDraw, ImageFont
import os
import subprocess
import glob

# Copy's correspondentes
COPYS = [
    "Manda aqui e concorra 🎁🔥",
    "Participa aqui 🫡💰",
    "Manda que eu to sorteando 🎁😎",
    "Comenta aqui e ganha 🔥🫡",
    "Manda aqui pro prêmio 💰👇🏻",
    "Participa que eu to de 👀🎁",
    "Manda aqui e boa sorte 🫡🔥",
    "Comenta e concorre 😎💰",
    "Manda aqui pro sorteio 🎁🔥",
    "Participa aqui 🫡😎👇🏻",
    "Manda que tem prêmio 💰🔥",
    "Comenta e ganha 🎁🫡",
    "Manda aqui e torce 😎💰",
    "Participa do sorteio 🔥🎁",
    "Manda que eu to vendo 👀🫡",
    "Comenta aqui pro prêmio 💰😎",
    "Manda e boa sorte 🎁🔥",
    "Participa aqui 🫡💰👇🏻",
    "Manda que tem ganhador 🔥😎",
    "Comenta e concorre aqui 🎁🫡",
    "Manda pro sorteio 💰🔥",
    "Participa que eu to sorteando 😎🎁",
    "Manda aqui e participa 🫡💰",
    "Comenta e ganha hoje 🔥🎁",
    "Manda que eu to de olho 👀💰",
    "Participa do prêmio 🫡😎",
    "Manda aqui e torce 🎁🔥",
    "Comenta pro sorteio 💰🫡",
    "Manda que vai ter ganhador 😎🎁",
    "Participa aqui agora 🔥💰🫡"
]

DRIVE_FOLDER = "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"

def add_text_to_image(input_path, text, output_path):
    """Adiciona texto na parte inferior da imagem com fundo semi-transparente"""
    
    # Abrir imagem
    img = Image.open(input_path).convert("RGBA")
    
    # Criar camada de overlay
    overlay = Image.new('RGBA', img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Tentar carregar fonte
    font_size = 80
    try:
        # Tentar fontes comuns no Windows
        for font_name in ['arialbd.ttf', 'arial.ttf', 'segoeui.ttf']:
            try:
                font_path = f"C:\\Windows\\Fonts\\{font_name}"
                font = ImageFont.truetype(font_path, font_size)
                break
            except:
                continue
        else:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Calcular posição do texto
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (img.width - text_width) // 2
    y = img.height - text_height - 120
    
    # Adicionar fundo escuro semi-transparente
    padding = 60
    draw.rectangle(
        [0, y - padding, img.width, img.height],
        fill=(0, 0, 0, 200)
    )
    
    # Adicionar texto branco
    draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))
    
    # Combinar overlay com imagem original
    combined = Image.alpha_composite(img, overlay)
    
    # Converter para RGB e salvar
    final = combined.convert('RGB')
    final.save(output_path, 'PNG', quality=95)
    
    return True

def main():
    print("🎨 ADICIONANDO COPY'S NAS IMAGENS DO TEO")
    print("=" * 45)
    print()
    
    count = 0
    total = 30
    
    for i in range(1, total + 1):
        num = f"{i:02d}"
        pattern = f"TEO_PREMIO_{num}_*.png"
        files = glob.glob(pattern)
        
        # Filtrar arquivos que já têm _COM_COPY
        files = [f for f in files if '_COM_COPY' not in f]
        
        if not files:
            print(f"⚠️  Imagem {num} não encontrada")
            continue
        
        input_file = files[0]
        copy_text = COPYS[i - 1]
        output_file = input_file.replace('.png', '_COM_COPY.png')
        
        print(f"[{i}/{total}] {copy_text}")
        
        try:
            if add_text_to_image(input_file, copy_text, output_file):
                print(f"  ✅ Criado: {output_file}")
                
                # Upload para Drive
                target_path = f"gdrive:{DRIVE_FOLDER}/{output_file}"
                result = subprocess.run(
                    ['.\\rclone.exe', 'copyto', output_file, target_path],
                    capture_output=True,
                    text=True
                )
                
                if result.returncode == 0:
                    print(f"  ☁️  Upload concluído")
                    count += 1
                else:
                    print(f"  ⚠️  Erro no upload")
            
        except Exception as e:
            print(f"  ❌ Erro: {e}")
    
    print()
    print("🎉 CONCLUÍDO!")
    print("=" * 13)
    print(f"✅ Processadas: {count}/{total} imagens")
    print(f"📁 Drive: Pasta do Teo")
    print(f"📝 Arquivos: *_COM_COPY.png")

if __name__ == "__main__":
    main()
