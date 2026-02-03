$projectId = 'gen-lang-client-0361434742'
$apiKey = 'AIzaSyAerWKegKaAUh5idI-Ra0sjEXcSSTXkp90'
$url = "https://us-central1-aiplatform.googleapis.com/v1/projects/$projectId/locations/us-central1/imageGenerationModels/imagegeneration:predict?key=$apiKey"

$headers = @{
    'Content-Type' = 'application/json'
}

$body = @{
    'instances' = @(
        @{
            'prompt' = 'A cute cat wearing sunglasses, digital art'
        }
    )
    'parameters' = @{
        'sampleCount' = 1
    }
} | ConvertTo-Json

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Body $body -Method Post -TimeoutSec 60
    Write-Host '✅ Vertex AI está ativo!'
    Write-Host 'Resposta:'
    $response | ConvertTo-Json -Depth 3
} catch {
    $errorMsg = $_.Exception.Message
    Write-Host "❌ Erro: $errorMsg"
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message
    }
}
