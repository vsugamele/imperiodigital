# Teo iGaming - Google Imagen 4.0 API (versao simples)
$apiKey = "AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90"
$model = "models/imagen-4.0-generate-001"
$headers = @{ 'Content-Type' = 'application/json' }

Write-Host "Gerando Teo iGaming com Google Imagen 4.0..." -ForegroundColor Green

# Prompt 1: Cassino
$prompt1 = "Brazilian man with dark beard, black hair, light eyes, tan skin, casino poker table, black shirt, blue red neon lights, realistic photo"
$body1 = @{
    prompt = $prompt1
    number_of_images = 1
    output_mime_type = "image/png"
} | ConvertTo-Json

$url = "https://generativelanguage.googleapis.com/v1beta/$model" + ":generateImage?key=$apiKey"

Write-Host "Testando API Google Imagen..." -ForegroundColor Yellow
Write-Host "URL: $url"

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Headers $headers -Body $body1
    Write-Host "Sucesso! Resposta recebida" -ForegroundColor Green
    
    if ($response.generatedImages) {
        Write-Host "Imagens geradas: $($response.generatedImages.Count)" -ForegroundColor Green
        
        # Salvar resposta
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $response | ConvertTo-Json -Depth 10 | Out-File "logs/gemini_test_$timestamp.json" -Encoding UTF8
        Write-Host "Resposta salva em: logs/gemini_test_$timestamp.json" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "Erro na API Google:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        Write-Host "Detalhes do erro: $errorContent" -ForegroundColor Red
    }
}