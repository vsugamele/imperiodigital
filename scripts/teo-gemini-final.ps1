# Teo iGaming - Google Imagen 4.0 (versao final limpa)
$apiKey = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"
$model = "imagen-4.0-generate-001"
$outputDir = "C:\Users\vsuga\clawd\images"

if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

$headers = @{
    'Content-Type' = 'application/json'
    'x-goog-api-key' = $apiKey
}

$prompts = @(
    @{
        name = "Teo_Cassino"
        prompt = "Brazilian man with dark beard, black hair, light eyes, tan skin, casino poker table, black shirt, blue red neon lights, realistic photo"
        file = "teo_cassino_google.png"
    },
    @{
        name = "Teo_Gaming"
        prompt = "Brazilian man with dark beard, black hair, light eyes, tan skin, gaming setup multiple monitors, black hoodie, LED lights, realistic photo"
        file = "teo_gaming_google.png"
    },
    @{
        name = "Teo_Streamer"
        prompt = "Brazilian man with dark beard, black hair, light eyes, tan skin, streaming studio, navy polo shirt, camera setup, realistic photo"
        file = "teo_streamer_google.png"
    },
    @{
        name = "Teo_VIP"
        prompt = "Brazilian man with dark beard, black hair, light eyes, tan skin, VIP casino lounge, gray blazer, holding drink, realistic photo"
        file = "teo_vip_google.png"
    }
)

Write-Host "Gerando 4 imagens Teo iGaming via Google Imagen 4.0..." -ForegroundColor Green

$results = @()
$count = 0

for ($i = 0; $i -lt $prompts.Count; $i++) {
    $p = $prompts[$i]
    $num = $i + 1
    
    Write-Host "[$num/4] Gerando: $($p.name)" -ForegroundColor Yellow
    
    $body = @{
        instances = @( @{ prompt = $p.prompt } )
        parameters = @{ sampleCount = 1; aspectRatio = "1:1" }
    } | ConvertTo-Json -Depth 10
    
    $url = "https://generativelanguage.googleapis.com/v1beta/models/$model" + ":predict"
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
        
        if ($response.predictions -and $response.predictions[0].bytesBase64Encoded) {
            $base64 = $response.predictions[0].bytesBase64Encoded
            $bytes = [System.Convert]::FromBase64String($base64)
            $path = Join-Path $outputDir $p.file
            [System.IO.File]::WriteAllBytes($path, $bytes)
            
            Write-Host "Sucesso: $($p.file) ($([math]::Round($bytes.Length / 1KB, 0)) KB)" -ForegroundColor Green
            
            $results += @{
                name = $p.name
                file = $path
                size_kb = [math]::Round($bytes.Length / 1KB, 0)
                status = "ok"
            }
            $count++
        } else {
            Write-Host "Erro: sem dados de imagem" -ForegroundColor Red
            $results += @{ name = $p.name; status = "error" }
        }
        
    } catch {
        Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{ name = $p.name; status = "error"; error = $_.Exception.Message }
    }
    
    if ($num -lt $prompts.Count) {
        Start-Sleep -Seconds 3
    }
}

Write-Host ""
Write-Host "Concluido: $count/$($prompts.Count) imagens geradas" -ForegroundColor Green

foreach ($r in $results) {
    if ($r.status -eq "ok") {
        Write-Host "OK: $($r.name) -> $($r.file)" -ForegroundColor Green
    } else {
        Write-Host "ERRO: $($r.name)" -ForegroundColor Red
    }
}

if ($count -gt 0) {
    Write-Host ""
    Write-Host "Imagens salvas em: $outputDir" -ForegroundColor Cyan
}