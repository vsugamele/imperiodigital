# Teo iGaming - Google/Gemini Imagen 4.0 API
$apiKey = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"
$model = "models/imagen-4.0-generate-001"

$headers = @{
    'Content-Type' = 'application/json'
}

# Prompts iGaming para Teo
$prompts = @(
    @{
        name = "Teo Cassino"
        prompt = "Professional photo of Brazilian man with dark trimmed beard, black hair, light eyes, tanned skin, sitting at modern casino poker table, wearing black dress shirt with rolled sleeves, holding cards confidently, blue and red neon lighting in background, slot machines glowing, dramatic cinematic lighting, high quality realistic photo, 4K resolution"
    },
    @{
        name = "Teo Gaming Setup"
        prompt = "Brazilian man with dark beard, black hair, light eyes, tan skin, in modern gaming office with multiple monitors showing betting screens, wearing black premium hoodie, concentrated expression, high-tech environment with green and blue LED lights, professional gaming equipment, soft neon lighting, ultra realistic photo, 4K"
    },
    @{
        name = "Teo Streamer"
        prompt = "Brazilian man with dark beard, black hair, light eyes, tan skin, in professional streaming studio, wearing navy blue polo shirt, speaking to camera with betting odds graphics in background, charismatic expression, ring light setup, screens with statistics, professional broadcast environment, realistic photo, 4K quality"
    },
    @{
        name = "Teo VIP Lounge"
        prompt = "Brazilian man with dark beard, black hair, light eyes, tan skin, in luxurious VIP casino lounge, wearing casual gray blazer over white t-shirt, holding drink, leaning on elegant bar counter, confident relaxed expression, warm golden lighting, leather furniture, premium atmosphere, lifestyle photography, 4K realistic"
    }
)

Write-Host "🚀 Teo iGaming Style - Google Imagen 4.0 API" -ForegroundColor Green
Write-Host "⚡ Muito mais direto que Replicate!" -ForegroundColor Yellow
Write-Host ""

$results = @()
$contador = 1

foreach ($promptData in $prompts) {
    Write-Host "[$contador/4] Gerando: $($promptData.name)" -ForegroundColor Yellow
    Write-Host "📝 Prompt: $($promptData.prompt.Substring(0, [Math]::Min(80, $promptData.prompt.Length)))..." -ForegroundColor Gray
    
    # Body para API Google
    $body = @{
        prompt = $promptData.prompt
        number_of_images = 1
        output_mime_type = "image/png"
        output_format = "bytes"
    } | ConvertTo-Json -Depth 10
    
    $url = "https://generativelanguage.googleapis.com/v1beta/$model`:generateImage?key=$apiKey"
    
    try {
        Write-Host "🔄 Chamando API Google..." -ForegroundColor Cyan
        
        $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
        
        if ($response.generatedImages -and $response.generatedImages.Count -gt 0) {
            Write-Host "✅ Imagem gerada com sucesso!" -ForegroundColor Green
            
            # Salvar informações
            $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
            $result = @{
                name = $promptData.name
                timestamp = $timestamp
                status = "success"
                image_data_length = $response.generatedImages[0].imageBytes.Length
                prompt = $promptData.prompt
            }
            
            $results += $result
            
            # Salvar resposta completa para debug
            $debugFile = "logs/gemini_response_$($promptData.name.Replace(' ', '_'))_$timestamp.json"
            $response | ConvertTo-Json -Depth 10 | Out-File -FilePath $debugFile -Encoding UTF8
            Write-Host "📁 Debug salvo: $debugFile" -ForegroundColor Gray
            
        } else {
            Write-Host "❌ Nenhuma imagem foi gerada" -ForegroundColor Red
            $results += @{
                name = $promptData.name
                status = "error"
                error = "No images generated"
            }
        }
        
    } catch {
        Write-Host "❌ Erro na API: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "🔍 Detalhes: $($_.Exception.Response)" -ForegroundColor Red
        
        $results += @{
            name = $promptData.name
            status = "error"
            error = $_.Exception.Message
        }
    }
    
    $contador++
    
    if ($contador -le $prompts.Count) {
        Write-Host "⏳ Aguardando 3 segundos..." -ForegroundColor Gray
        Start-Sleep -Seconds 3
        Write-Host ""
    }
}

Write-Host ""
Write-Host "📊 Resultados Finais:" -ForegroundColor Cyan
$sucessos = 0

foreach ($result in $results) {
    if ($result.status -eq "success") {
        Write-Host "✅ $($result.name): Sucesso" -ForegroundColor Green
        $sucessos++
    } else {
        Write-Host "❌ $($result.name): $($result.error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 Total: $sucessos/$($results.Count) imagens geradas com sucesso" -ForegroundColor $(if($sucessos -eq $results.Count){"Green"}else{"Yellow"})

# Salvar resumo
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$summary = @{
    timestamp = $timestamp
    model = "Google Imagen 4.0"
    total = $results.Count
    successful = $sucessos
    results = $results
} | ConvertTo-Json -Depth 10

$summaryFile = "logs/teo_igaming_gemini_summary_$timestamp.json"
$summary | Out-File -FilePath $summaryFile -Encoding UTF8

Write-Host "📁 Resumo salvo: $summaryFile" -ForegroundColor Green

if ($sucessos -gt 0) {
    Write-Host ""
    Write-Host "🎉 Pronto! Agora você tem as imagens geradas diretamente via API Google!" -ForegroundColor Green
    Write-Host "⚡ Muito mais eficiente que usar Replicate!" -ForegroundColor Yellow
}