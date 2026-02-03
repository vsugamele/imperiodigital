# Adicionar Copy's nas 30 Imagens do Teo
# Usa ImageMagick para adicionar texto profissional

param(
    [switch]$Test
)

# Copy's correspondentes a cada imagem
$copys = @(
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
)

Write-Host "🎨 ADICIONANDO COPY'S NAS IMAGENS DO TEO" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se ImageMagick está disponível
$magickAvailable = $false
try {
    magick -version | Out-Null
    $magickAvailable = $true
    Write-Host "✅ ImageMagick encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ ImageMagick não encontrado. Tentando instalar..." -ForegroundColor Yellow
    
    # Tentar instalar via chocolatey
    try {
        choco install imagemagick -y
        $magickAvailable = $true
        Write-Host "✅ ImageMagick instalado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Não foi possível instalar ImageMagick" -ForegroundColor Red
        Write-Host "Baixe manualmente: https://imagemagick.org/script/download.php" -ForegroundColor Yellow
        exit 1
    }
}

if (-not $magickAvailable) {
    Write-Host "⚠️  Vou usar Python com Pillow como alternativa..." -ForegroundColor Yellow
    
    # Criar script Python alternativo
    $pythonScript = @"
from PIL import Image, ImageDraw, ImageFont
import sys

image_path = sys.argv[1]
text = sys.argv[2]
output_path = sys.argv[3]

# Abrir imagem
img = Image.open(image_path)
draw = ImageDraw.Draw(img)

# Configurar fonte (usar fonte padrão se não tiver)
try:
    font = ImageFont.truetype("arial.ttf", 60)
except:
    font = ImageFont.load_default()

# Posição do texto (centralizado na parte inferior)
text_bbox = draw.textbbox((0, 0), text, font=font)
text_width = text_bbox[2] - text_bbox[0]
text_height = text_bbox[3] - text_bbox[1]

x = (img.width - text_width) // 2
y = img.height - text_height - 100

# Adicionar fundo semi-transparente
padding = 40
draw.rectangle([x - padding, y - padding, x + text_width + padding, y + text_height + padding], 
               fill=(0, 0, 0, 180))

# Adicionar texto
draw.text((x, y), text, font=font, fill=(255, 255, 255, 255))

# Salvar
img.save(output_path)
print(f"✅ Texto adicionado: {output_path}")
"@
    
    Set-Content -Path "add_text.py" -Value $pythonScript
}

$count = 0
$total = 30

for ($i = 1; $i -le $total; $i++) {
    $num = $i.ToString().PadLeft(2, '0')
    $files = Get-ChildItem "TEO_PREMIO_${num}_*.png" -ErrorAction SilentlyContinue
    
    if ($files.Count -eq 0) {
        Write-Host "⚠️  Imagem ${num} não encontrada" -ForegroundColor Yellow
        continue
    }
    
    $inputFile = $files[0].Name
    $copy = $copys[$i - 1]
    $outputFile = $inputFile -replace '\.png$', '_COM_COPY.png'
    
    Write-Host "[$i/$total] Adicionando: $copy" -ForegroundColor Cyan
    
    if ($magickAvailable) {
        # Usar ImageMagick
        magick "$inputFile" `
            -gravity South `
            -background 'rgba(0,0,0,0.7)' `
            -fill white `
            -font Arial-Bold `
            -pointsize 70 `
            -splice 0x200 `
            -annotate +0+50 "$copy" `
            "$outputFile"
    } else {
        # Usar Python
        python add_text.py "$inputFile" "$copy" "$outputFile"
    }
    
    if (Test-Path $outputFile) {
        Write-Host "  ✅ Criado: $outputFile" -ForegroundColor Green
        
        # Upload para Drive
        if (-not $Test) {
            $targetPath = "gdrive:1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP/$outputFile"
            .\rclone.exe copyto "$outputFile" "$targetPath" --progress 2>&1 | Out-Null
            Write-Host "  ☁️  Upload concluído" -ForegroundColor Green
        }
        
        $count++
    } else {
        Write-Host "  ❌ Erro ao criar $outputFile" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 CONCLUÍDO!" -ForegroundColor Green
Write-Host "=============" -ForegroundColor Green
Write-Host "✅ Processadas: $count/$total imagens" -ForegroundColor Green
Write-Host "📁 Localização: Pasta do Teo no Drive" -ForegroundColor Cyan
Write-Host "📝 Arquivos: *_COM_COPY.png" -ForegroundColor Cyan
