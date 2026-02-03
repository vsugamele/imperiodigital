# Design Agent Premium - Versao Simplificada

$copys = "MANDA AQUI AGORA","VEM PARTICIPAR","COMENTA E GANHA","SORTEIO HOJE","PARTICIPA AGORA","ULTIMA CHANCE","MANDA E CONCORRE","TEM PREMIO AQUI","COMENTA PRA GANHAR","ENTRA NO SORTEIO","VEM QUE TEM GANHADOR","CORRE QUE DA TEMPO","SORTEIO ROLANDO","MANDA PRO PREMIO","GRANA GARANTIDA","PARTICIPA DO PREMIO","TO SORTEANDO AGORA","NAO PERDE TEMPO","COMENTA E TORCE","TEM GRANA AQUI","MANDA QUE EU TO VENDO","SORTEIO AO VIVO","ULTIMA HORA","ENTRA AGORA","COMENTA AQUI","MANDA PRA CONCORRER","TEM PREMIO HOJE","PARTICIPA JA","SORTEIO LIBERADO","CORRE E MANDA"

Write-Host "DESIGN AGENT - PREMIUM v2.0"
Write-Host ""

$count = 0

for ($i = 1; $i -le 30; $i++) {
    $num = "{0:D2}" -f $i
    $pattern = "TEO_PREMIO_${num}_*.png"
    $files = Get-ChildItem $pattern -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch '(_COM_COPY|_FINAL|_PREMIUM)' }
    
    if ($files.Count -eq 0) { continue }
    
    $input = $files[0].Name
    $texto = $copys[$i - 1]
    $output = $input -replace '\.png$', '_PREMIUM.png'
    
    Write-Host "[$i/30] $texto"
    
    $filterText = "drawbox=y=ih-280`ncolor=black@0.9`nwidth=iw`nheight=280`nt=fill,drawtext=text='$texto'`nfontfile=C`\/Windows/Fonts/arialbd.ttf`nfontsize=100`nfontcolor=white`nborderw=6`nbordercolor=black`nx=(w-text_w)/2`ny=h-180`nshadowx=5`nshadowy=5" -replace "`n",":"
    
    ffmpeg -i $input -vf $filterText $output -y 2>&1 | Out-Null
    
    if (Test-Path $output) {
        Write-Host "  OK - Criado"
        .\rclone.exe copyto $output "gdrive`n1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP/$output" 2>&1 | Out-Null
        Write-Host "  OK - Upload"
        $count++
    }
}

Write-Host ""
Write-Host "Completo`n $count/30"
