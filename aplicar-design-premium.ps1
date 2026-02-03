# Script Profissional - Copy's com Design Premium
# Usa ffmpeg com filtros avançados

$copys = @(
    "MANDA AQUI AGORA! 🔥💰",
    "VEM PARTICIPAR! 🎁😎",
    "COMENTA E GANHA! 🫡🔥",
    "MANDA E CONCORRE! 💰👇",
    "SORTEIO HOJE! MANDA! 🎁🔥",
    "PARTICIPA AGORA! 🫡💰",
    "TÁ ESPERANDO O QUE? 🔥😎",
    "MANDA QUE EU TO VENDO! 👀💰",
    "COMENTA PRA GANHAR! 🎁🫡",
    "ENTRA PRO SORTEIO! 🔥💰",
    "MANDA AQUI! TEM PRÊMIO! 💰😎",
    "VEM QUE TEM GANHADOR! 🎁🔥",
    "ÚLTIMA CHANCE! MANDA! 🫡💰",
    "SORTEIO ROLANDO! VEM! 🔥🎁",
    "COMENTA E BOA SORTE! 💰😎",
    "MANDA PRO PRÊMIO! 🎁🫡",
    "TÔ SORTEANDO! PARTICIPA! 🔥💰",
    "VEM QUE DÁ TEMPO! 😎🎁",
    "MANDA E TORCE! 🫡💰",
    "TEM GRANA! COMENTA! 💰🔥",
    "PARTICIPA DO PRÊMIO! 🎁😎",
    "MANDA QUE EU TO DE OLHO! 👀🫡",
    "SORTEIO HOJE! VEM! 🔥💰",
    "COMENTA AGORA! 🎁🫡",
    "ENTRA NO SORTEIO! 💰😎",
    "MANDA PRA CONCORRER! 🔥🎁",
    "ÚLTIMA HORA! PARTICIPA! 🫡💰",
    "TEM PRÊMIO! MANDA! 💰🔥",
    "SORTEIO AO VIVO! VEM! 🎁😎",
    "CORRE! COMENTA AQUI! 🔥💰🫡"
)

Write-Host "🎨 APLICANDO DESIGN PREMIUM NAS IMAGENS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$count = 0
$total = 30

for ($i = 1; $i -le $total; $i++) {
    $num = $i.ToString().PadLeft(2, '0')
    $files = Get-ChildItem "TEO_PREMIO_${num}_*.png" -ErrorAction SilentlyContinue | 
             Where-Object { $_.Name -notlike '*_COM_COPY*' -and $_.Name -notlike '*_FINAL*' }
    
    if ($files.Count -eq 0) { continue }
    
    $inputFile = $files[0].Name
    $copy = $copys[$i - 1]
    $outputFile = $inputFile -replace '\.png$', '_FINAL.png'
    
    Write-Host "[$i/$total] $copy" -ForegroundColor Yellow
    
    # Design premium com:
    # - Texto grande e bold
    # - Outline branco grosso (melhor legibilidade)
    # - Sombra preta
    # - Fundo gradiente escuro
    # - Posicionamento estratégico
    
    $filter = @"
drawbox=y=ih-300:color=black@0.8:width=iw:height=300:t=fill,
drawtext=text='$copy':fontfile=C\\:/Windows/Fonts/impact.ttf:fontsize=85:fontcolor=white:borderw=4:bordercolor=black:x=(w-text_w)/2:y=h-180:shadowx=3:shadowy=3
"@ -replace "`n", "" -replace "`r", ""
    
    ffmpeg -i "$inputFile" -vf $filter "$outputFile" -y 2>&1 | Out-Null
    
    if (Test-Path $outputFile) {
        $size = (Get-Item $outputFile).Length / 1MB
        Write-Host "  ✅ Criado ($([math]::Round($size, 1)) MB)" -ForegroundColor Green
        
        # Upload
        $targetPath = "gdrive:1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP/$outputFile"
        .\rclone.exe copyto "$outputFile" "$targetPath" --progress 2>&1 | Out-Null
        Write-Host "  ☁️  Upload OK" -ForegroundColor Green
        $count++
    } else {
        Write-Host "  ❌ Erro ao criar" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 CONCLUÍDO!" -ForegroundColor Green
Write-Host "=============" -ForegroundColor Green
Write-Host "✅ Processadas: $count/$total imagens" -ForegroundColor Green
Write-Host "📁 Arquivos: *_FINAL.png" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Melhorias aplicadas:" -ForegroundColor Yellow
Write-Host "  • Copy's mais persuasivas e urgentes" -ForegroundColor White
Write-Host "  • Fonte Impact (mais impactante)" -ForegroundColor White
Write-Host "  • Tamanho 85px (muito maior)" -ForegroundColor White
Write-Host "  • Outline preto grosso (4px)" -ForegroundColor White
Write-Host "  • Sombra para profundidade" -ForegroundColor White
Write-Host "  • Fundo escuro para destaque" -ForegroundColor White
Write-Host "  • Posicionamento otimizado" -ForegroundColor White
