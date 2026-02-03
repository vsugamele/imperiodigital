# Design Premium - SEM emojis (mais limpo e profissional)

$copys = @(
    "MANDA AQUI AGORA!",
    "VEM PARTICIPAR!",
    "COMENTA E GANHA!",
    "MANDA E CONCORRE!",
    "SORTEIO HOJE!",
    "PARTICIPA AGORA!",
    "TA ESPERANDO O QUE?",
    "MANDA QUE EU TO VENDO!",
    "COMENTA PRA GANHAR!",
    "ENTRA PRO SORTEIO!",
    "TEM PREMIO AQUI!",
    "VEM QUE TEM GANHADOR!",
    "ULTIMA CHANCE!",
    "SORTEIO ROLANDO!",
    "COMENTA E BOA SORTE!",
    "MANDA PRO PREMIO!",
    "TO SORTEANDO!",
    "VEM QUE DA TEMPO!",
    "MANDA E TORCE!",
    "TEM GRANA! COMENTA!",
    "PARTICIPA DO PREMIO!",
    "MANDA QUE EU TO DE OLHO!",
    "SORTEIO HOJE! VEM!",
    "COMENTA AGORA!",
    "ENTRA NO SORTEIO!",
    "MANDA PRA CONCORRER!",
    "ULTIMA HORA!",
    "TEM PREMIO! MANDA!",
    "SORTEIO AO VIVO!",
    "CORRE! COMENTA AQUI!"
)

Write-Host "🎨 DESIGN PREMIUM - VERSAO PROFISSIONAL"
Write-Host "======================================="
Write-Host ""

$count = 0

for ($i = 1; $i -le 30; $i++) {
    $num = $i.ToString().PadLeft(2, '0')
    $files = Get-ChildItem "TEO_PREMIO_${num}_*.png" -ErrorAction SilentlyContinue | 
             Where-Object { $_.Name -notlike '*_COM_COPY*' -and $_.Name -notlike '*_FINAL*' }
    
    if ($files.Count -eq 0) { continue }
    
    $inputFile = $files[0].Name
    $copy = $copys[$i - 1]
    $outputFile = $inputFile -replace '\.png$', '_FINAL.png'
    
    Write-Host "[$i/30] $copy"
    
    # Design premium: fonte Impact, tamanho grande, outline, sombra
    $filter = "drawbox=y=ih-300:color=black@0.85:width=iw:height=300:t=fill,drawtext=text='$copy':fontfile=C\:/Windows/Fonts/impact.ttf:fontsize=90:fontcolor=white:borderw=5:bordercolor=black:x=(w-text_w)/2:y=h-160:shadowx=4:shadowy=4"
    
    ffmpeg -i "$inputFile" -vf $filter "$outputFile" -y 2>&1 | Out-Null
    
    if (Test-Path $outputFile) {
        Write-Host "  OK - Criado"
        
        $targetPath = "gdrive:1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP/$outputFile"
        .\rclone.exe copyto "$outputFile" "$targetPath" 2>&1 | Out-Null
        Write-Host "  OK - Upload"
        $count++
    }
}

Write-Host ""
Write-Host "Concluido: $count/30"
