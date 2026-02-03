# Adicionar Copy's usando FFmpeg (já instalado)
$copys = @(
    "Manda aqui e concorra",
    "Participa aqui",
    "Manda que eu to sorteando",
    "Comenta aqui e ganha",
    "Manda aqui pro premio",
    "Participa que eu to de olho",
    "Manda aqui e boa sorte",
    "Comenta e concorre",
    "Manda aqui pro sorteio",
    "Participa aqui",
    "Manda que tem premio",
    "Comenta e ganha",
    "Manda aqui e torce",
    "Participa do sorteio",
    "Manda que eu to vendo",
    "Comenta aqui pro premio",
    "Manda e boa sorte",
    "Participa aqui",
    "Manda que tem ganhador",
    "Comenta e concorre aqui",
    "Manda pro sorteio",
    "Participa que eu to sorteando",
    "Manda aqui e participa",
    "Comenta e ganha hoje",
    "Manda que eu to de olho",
    "Participa do premio",
    "Manda aqui e torce",
    "Comenta pro sorteio",
    "Manda que vai ter ganhador",
    "Participa aqui agora"
)

Write-Host "🎨 ADICIONANDO COPYS COM FFMPEG" -ForegroundColor Cyan
Write-Host ""

$count = 0
$total = 30

for ($i = 1; $i -le $total; $i++) {
    $num = $i.ToString().PadLeft(2, '0')
    $files = Get-ChildItem "TEO_PREMIO_${num}_*.png" -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike '*_COM_COPY*' }
    
    if ($files.Count -eq 0) { continue }
    
    $inputFile = $files[0].Name
    $copy = $copys[$i - 1]
    $outputFile = $inputFile -replace '\.png$', '_COM_COPY.png'
    
    Write-Host "[$i/$total] $copy"
    
    # Usar ffmpeg para adicionar texto
    $filter = "drawtext=text='$copy':fontfile=C\\:/Windows/Fonts/arialbd.ttf:fontsize=60:fontcolor=white:x=(w-text_w)/2:y=h-150:box=1:boxcolor=black@0.7:boxborderw=40"
    
    ffmpeg -i "$inputFile" -vf "$filter" "$outputFile" -y 2>&1 | Out-Null
    
    if (Test-Path $outputFile) {
        Write-Host "  ✅ Criado" -ForegroundColor Green
        
        # Upload
        $targetPath = "gdrive:1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP/$outputFile"
        .\rclone.exe copyto "$outputFile" "$targetPath" 2>&1 | Out-Null
        Write-Host "  ☁️  Upload OK" -ForegroundColor Green
        $count++
    }
}

Write-Host ""
Write-Host "🎉 Concluído: $count/$total" -ForegroundColor Green
