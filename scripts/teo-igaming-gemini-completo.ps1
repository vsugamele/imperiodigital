# Teo iGaming - Google Imagen 4.0 API COMPLETO
$apiKey = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"
$model = "imagen-4.0-generate-001"
$outputDir = "C:\Users\vsuga\clawd\images"

# Criar diretório se não existir
if (!(Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir -Force
}

$headers = @{
    'Content-Type' = 'application/json'
    'x-goog-api-key' = $apiKey
}

# Prompts iGaming para Teo
$prompts = @(
    @{
        name = "Teo_Cassino_Gemini"
        prompt = "Professional photo of Brazilian man with dark trimmed beard, black hair, light eyes, tanned skin, sitting at modern casino poker table, wearing black dress shirt with rolled sleeves, holding cards confidently, blue and red neon lighting in background, slot machines glowing, dramatic cinematic lighting, high quality realistic photo"
        filename = "teo_cassino_gemini.png"
    },
    @{
        name = "Teo_Gaming_Gemini"
        prompt = "Brazilian man with dark beard, black hair, light eyes, tan skin, in modern gaming office with multiple monitors showing betting screens, wearing black premium hoodie, concentrated expression, high-tech environment with green and blue LED lights, professional gaming equipment, ultra realistic photo"
        filename = "teo_gaming_gemini.png"
    },
    @{
        name = "Teo_Streamer_Gemini"
        prompt = "Brazilian man with dark beard, black hair, light eyes, tan skin, in professional streaming studio, wearing navy blue polo shirt, speaking to camera with betting odds graphics in background, charismatic expression, ring light setup, realistic photo"
        filename = "teo_streamer_gemini.png"
    },
    @{
        name = "Teo_VIP_Gemini"
        prompt = "Brazilian man with dark beard, black hair, light eyes, tan skin, in luxurious VIP casino lounge, wearing casual gray blazer over white t-shirt, holding drink, confident expression, warm golden lighting, premium atmosphere, realistic photo"
        filename = "teo_vip_gemini.png"
    }
)

Write-Host "🚀 Teo iGaming Style - Google Imagen 4.0 API" -ForegroundColor Green
Write-Host "⚡ Gerando 4 imagens diretamente via API Google!" -ForegroundColor Yellow
Write-Host ""

$results = @()
$sucessos = 0

for ($i = 0; $i -lt $prompts.Count; $i++) {
    $promptData = $prompts[$i]
    $num = $i + 1
    
    Write-Host "[$num/4] Gerando: $($promptData.name)" -ForegroundColor Yellow
    Write-Host "📝 $($promptData.prompt.Substring(0, [Math]::Min(100, $promptData.prompt.Length)))..." -ForegroundColor Gray
    
    # Body para API Google
    $body = @{
        instances = @(
            @{ prompt = $promptData.prompt }
        )
        parameters = @{
            sampleCount = 1
            aspectRatio = "1:1"
        }
    } | ConvertTo-Json -Depth 10
    
    $url = "https://generativelanguage.googleapis.com/v1beta/models/$model" + ":predict"
    
    try {
        Write-Host "🔄 Chamando API Google..." -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
        
        if ($response.predictions -and $response.predictions[0].bytesBase64Encoded) {
            $base64Data = $response.predictions[0].bytesBase64Encoded
            Write-Host "✅ Imagem gerada! Base64: $($base64Data.Length) caracteres" -ForegroundColor Green
            
            # Decodificar base64 para bytes
            $imageBytes = [System.Convert]::FromBase64String($base64Data)
            
            # Salvar como arquivo PNG
            $filepath = Join-Path $outputDir $promptData.filename
            [System.IO.File]::WriteAllBytes($filepath, $imageBytes)
            
            Write-Host "💾 Salva: $filepath" -ForegroundColor Green
            Write-Host "📏 Tamanho: $([math]::Round($imageBytes.Length / 1KB, 2)) KB" -ForegroundColor Cyan
            
            $results += @{
                name = $promptData.name
                status = "success"
                filepath = $filepath
                size_kb = [math]::Round($imageBytes.Length / 1KB, 2)
            }
            
            $sucessos++
            
        } else {
            Write-Host "❌ Nenhuma imagem na resposta" -ForegroundColor Red
            $results += @{
                name = $promptData.name
                status = "error"
                error = "No image data in response"
            }
        }
        
    } catch {
        Write-Host "❌ Erro: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            name = $promptData.name
            status = "error"
            error = $_.Exception.Message
        }
    }
    
    # Pausa entre requests
    if ($num -lt $prompts.Count) {
        Write-Host "⏳ Aguardando 3 segundos..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
        Write-Host ""
    }
}

Write-Host ""
Write-Host "🎉 Concluído! Resultados:" -ForegroundColor Green
Write-Host ""

foreach ($result in $results) {
    if ($result.status -eq "success") {
        Write-Host "✅ $($result.name): $($result.filepath) ($($result.size_kb) KB)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($result.name): $($result.error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Total: $sucessos/$($results.Count) imagens geradas com sucesso" -ForegroundColor $(if($sucessos -eq $results.Count){"Green"}else{"Yellow"})

if ($sucessos -gt 0) {
    Write-Host ""
    Write-Host "🎯 Imagens salvas em: $outputDir" -ForegroundColor Cyan
    Write-Host "⚡ Geradas via API Google Imagen 4.0 (muito melhor que Replicate!)" -ForegroundColor Yellow
}

# Salvar log
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "logs/teo_igaming_gemini_completo_$timestamp.json"
@{
    timestamp = $timestamp
    model = "Google Imagen 4.0"
    api_endpoint = "generativelanguage.googleapis.com"
    total = $results.Count
    successful = $sucessos
    output_directory = $outputDir
    results = $results
} | ConvertTo-Json -Depth 10 | Out-File $logFile -Encoding UTF8

Write-Host "📁 Log salvo: $logFile" -ForegroundColor Gray