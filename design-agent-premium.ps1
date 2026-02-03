# 🎨 SISTEMA INTELIGENTE DE DESIGN PARA COPY'S
# Designer Agent - Versão Final Premium

# ==========================================
# 30 COPY'S OTIMIZADAS (Baseadas no Instagram)
# ==========================================

$copys = @(
    "MANDA AQUI AGORA",
    "VEM PARTICIPAR",
    "COMENTA E GANHA",
    "SORTEIO HOJE",
    "PARTICIPA AGORA",
    "ULTIMA CHANCE",
    "MANDA E CONCORRE",
    "TEM PREMIO AQUI",
    "COMENTA PRA GANHAR",
    "ENTRA NO SORTEIO",
    "VEM QUE TEM GANHADOR",
    "CORRE QUE DA TEMPO",
    "SORTEIO ROLANDO",
    "MANDA PRO PREMIO",
    "GRANA GARANTIDA",
    "PARTICIPA DO PREMIO",
    "TO SORTEANDO AGORA",
    "NAO PERDE TEMPO",
    "COMENTA E TORCE",
    "TEM GRANA AQUI",
    "MANDA QUE EU TO VENDO",
    "SORTEIO AO VIVO",
    "ULTIMA HORA",
    "ENTRA AGORA",
    "COMENTA AQUI",
    "MANDA PRA CONCORRER",
    "TEM PREMIO HOJE",
    "PARTICIPA JA",
    "SORTEIO LIBERADO",
    "CORRE E MANDA"
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   DESIGN AGENT - SISTEMA INTELIGENTE v2.0      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 ESPECIFICAÇÕES DO DESIGN:" -ForegroundColor Yellow
Write-Host "   • Fonte: Arial Black (máxima legibilidade)" -ForegroundColor White
Write-Host "   • Tamanho: 100px (impactante)" -ForegroundColor White
Write-Host "   • Outline: Preto 6px (destaque máximo)" -ForegroundColor White
Write-Host "   • Sombra: 5px offset (profundidade)" -ForegroundColor White
Write-Host "   • Posição: Terço inferior centralizado" -ForegroundColor White
Write-Host "   • Fundo: Barra preta 90% opacidade" -ForegroundColor White
Write-Host ""

$count = 0
$total = 30
$errors = @()

for ($i = 1; $i -le $total; $i++) {
    $num = $i.ToString().PadLeft(2, '0')
    
    # Encontrar arquivo original (sem _COM_COPY e sem _FINAL)
    $files = Get-ChildItem "TEO_PREMIO_${num}_*.png" -ErrorAction SilentlyContinue | 
             Where-Object { $_.Name -notlike '*_COM_COPY*' -and $_.Name -notlike '*_FINAL*' }
    
    if ($files.Count -eq 0) { 
        $errors += "Imagem $num não encontrada"
        continue 
    }
    
    $inputFile = $files[0].Name
    $copy = $copys[$i - 1]
    $outputFile = $inputFile -replace '\.png$', '_PREMIUM.png'
    
    Write-Host "[$i/$total] " -NoNewline -ForegroundColor Cyan
    Write-Host "$copy" -ForegroundColor Yellow
    
    # DESIGN PREMIUM - Comando ffmpeg otimizado
    # Usa Arial Black com outline grosso e sombra
    $fontPath = "C:/Windows/Fonts/arialbd.ttf"
    
    # Filtro em etapas para máxima qualidade
    $filter = "drawbox=y=ih-280:color=black@0.9:width=iw:height=280:t=fill," +
              "drawtext=text='$copy':" +
              "fontfile=$fontPath:" +
              "fontsize=100:" +
              "fontcolor=white:" +
              "borderw=6:" +
              "bordercolor=black:" +
              "x=(w-text_w)/2:" +
              "y=h-180:" +
              "shadowx=5:" +
              "shadowy=5:" +
              "shadowcolor=black@0.8"
    
    # Executar ffmpeg
    $result = ffmpeg -i "$inputFile" -vf $filter "$outputFile" -y 2>&1
    
    if (Test-Path $outputFile) {
        $size = [math]::Round((Get-Item $outputFile).Length / 1MB, 2)
        Write-Host "   ✓ Criado ($size MB)" -ForegroundColor Green
        
        # Upload para Drive
        $targetPath = "gdrive:1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP/$outputFile"
        .\rclone.exe copyto "$outputFile" "$targetPath" 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Upload OK" -ForegroundColor Green
            $count++
        } else {
            Write-Host "   ✗ Erro no upload" -ForegroundColor Red
            $errors += "Upload falhou: $outputFile"
        }
    } else {
        Write-Host "   ✗ Erro ao criar" -ForegroundColor Red
        $errors += "Criação falhou: imagem $num"
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║             PROCESSAMENTO COMPLETO             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Sucesso: $count/$total imagens" -ForegroundColor Green
Write-Host "📁 Arquivos: *_PREMIUM.png" -ForegroundColor Cyan
Write-Host "☁️  Localização: Drive do Teo" -ForegroundColor Cyan

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Erros encontrados:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "   • $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "🎨 MELHORIAS APLICADAS:" -ForegroundColor Magenta
Write-Host "   ✓ Copy's mais persuasivas e urgentes" -ForegroundColor White
Write-Host "   ✓ Design premium tipo Instagram Stories" -ForegroundColor White  
Write-Host "   ✓ Fonte Arial Black 100px (máximo impacto)" -ForegroundColor White
Write-Host "   ✓ Outline preto 6px (legibilidade perfeita)" -ForegroundColor White
Write-Host "   ✓ Sombra profissional (profundidade)" -ForegroundColor White
Write-Host "   ✓ Barra preta de fundo (contraste máximo)" -ForegroundColor White
Write-Host ""
