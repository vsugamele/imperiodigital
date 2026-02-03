$token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzYzQ3MTk0NS0yMmU3LTRkZTItOGE5YS04NjcwYTdhZmQxZDUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzY5NDU2MDA5LCJleHAiOjE3NzE5OTU2MDB9.s7kAIiS7dLCI55Nf8VtAscuRgPlQ9pGkO6_LwQQPkuU'
$headers = @{'X-N8N-API-KEY' = $token}
$url = 'https://n8n-n8n.p6yhvh.easypanel.host/api/v1/workflows/cQUJ7xuVa4WRdjp2BaRuj'

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

$json = Get-Content 'C:\Users\vsuga\clawd\n8n-update.json' -Raw | ConvertFrom-Json

# Atualiza matching column
$json.nodes | Where-Object { $_.name -eq 'Append or update row in sheet' } | ForEach-Object {
    $_.parameters.columns.matchingColumns = @('video_id')
    $_.parameters.columns.value = @{
        'video_id' = '={{ $json.video_id }}'
        'Status' = 'Pendente'
        'url_post_blotato' = '={{ $json.download_link }}'
    }
}

# Atualiza Function node code
$json.nodes | Where-Object { $_.name -eq 'Generate Share Links' } | ForEach-Object {
    $_.parameters.jsCode = 'const files = $input.all();const items = [];for (const file of files) {const fileId = file.json.id;const shareLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;items.push({...file.json,video_id: fileId,share_link: shareLink,download_link: downloadLink});}return items;'
}

$body = $json | ConvertTo-Json -Depth 20

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Put -Body $body -ContentType 'application/json' -TimeoutSec 30
    Write-Host '✅ Workflow atualizado com SUCESSO!'
    Write-Host 'Matching agora usa: video_id'
    Write-Host 'Status: Pendente'
} catch {
    Write-Host "❌ Erro: $($_.Exception.Message)"
}
