# Teo iGaming - Google Imagen 4.0 API (endpoint correto)
$apiKey = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"
$model = "imagen-4.0-generate-001"
$headers = @{
    'Content-Type' = 'application/json'
    'x-goog-api-key' = $apiKey
}

Write-Host "Gerando Teo iGaming com Google Imagen 4.0..." -ForegroundColor Green

# Prompt para o Teo
$prompt = "Brazilian man with dark beard, black hair, light eyes, tan skin, casino poker table, black shirt, blue red neon lights, realistic photo"

# Body correto para API Google
$body = @{
    instances = @(
        @{
            prompt = $prompt
        }
    )
    parameters = @{
        sampleCount = 1
        aspectRatio = "1:1"
    }
} | ConvertTo-Json -Depth 10

# URL correta
$url = "https://generativelanguage.googleapis.com/v1beta/models/$model" + ":predict"

Write-Host "Testando API Google Imagen (endpoint correto)..." -ForegroundColor Yellow
Write-Host "URL: $url"
Write-Host "Prompt: $prompt"

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body
    Write-Host "Sucesso! Resposta recebida" -ForegroundColor Green
    
    if ($response.predictions) {
        Write-Host "Imagens geradas: $($response.predictions.Count)" -ForegroundColor Green
        
        # Salvar resposta completa
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $debugFile = "logs/gemini_success_$timestamp.json"
        $response | ConvertTo-Json -Depth 10 | Out-File $debugFile -Encoding UTF8
        Write-Host "Resposta salva: $debugFile" -ForegroundColor Cyan
        
        # Verificar se tem dados de imagem
        foreach ($prediction in $response.predictions) {
            if ($prediction.bytesBase64Encoded) {
                Write-Host "Imagem encontrada! Dados base64 recebidos." -ForegroundColor Green
                Write-Host "Tamanho dos dados: $($prediction.bytesBase64Encoded.Length) caracteres" -ForegroundColor Cyan
            }
        }
        
    } else {
        Write-Host "Nenhuma predicao encontrada na resposta" -ForegroundColor Yellow
        Write-Host "Estrutura da resposta:" -ForegroundColor Gray
        $response | ConvertTo-Json -Depth 2 | Write-Host
    }
    
} catch {
    Write-Host "Erro na API Google:" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        try {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorContent = $reader.ReadToEnd()
            Write-Host "Detalhes: $errorContent" -ForegroundColor Red
        } catch {
            Write-Host "Erro ao ler detalhes da resposta" -ForegroundColor Red
        }
    }
}