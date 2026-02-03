# Upload das imagens Teo iGaming para Google Drive
$images = @(
    @{ file = "C:\Users\vsuga\clawd\images\teo_cassino_google.png"; name = "teo_igaming_cassino.png" },
    @{ file = "C:\Users\vsuga\clawd\images\teo_gaming_google.png"; name = "teo_igaming_gaming.png" },
    @{ file = "C:\Users\vsuga\clawd\images\teo_streamer_google.png"; name = "teo_igaming_streamer.png" },
    @{ file = "C:\Users\vsuga\clawd\images\teo_vip_google.png"; name = "teo_igaming_vip.png" }
)

$teoFolderId = "1jDY5HSjJOtZw2yCxXzuEy_gTt9uRTObP"

Write-Host "Subindo 4 imagens Teo iGaming para Google Drive..." -ForegroundColor Green

foreach ($img in $images) {
    Write-Host "Subindo: $($img.name)" -ForegroundColor Yellow
    
    & "C:\Users\vsuga\AppData\Local\Python\pythoncore-3.14-64\python.exe" "scripts\image-gen-final.py" "--upload-only" $img.file $img.name $teoFolderId
    
    Start-Sleep -Seconds 2
}

Write-Host "Upload concluido!" -ForegroundColor Green