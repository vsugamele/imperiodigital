# Script rclone para upload do Téo
# Executar DEPOIS de instalar e configurar rclone

$filename = "TEO_BARMAN_PROFISSIONAL_PREPARANDO_DRINK_EM_BAR_DE_JAZZ_SOFISTICADO__ILUMINACAO_DRAMATICA_2026-01-27.png"
$driveFolder = "1mCGcjrnLAqtWYw5prcGXeK0nG1wQKg9"  # Pasta do Téo

Write-Host "🚀 Upload com rclone para pasta do Téo..." -ForegroundColor Green

# Verificar se rclone está configurado
$configTest = .\rclone.exe listremotes 2>$null
if (-not $configTest -like "*gdrive*") {
    Write-Host "❌ rclone não configurado para Google Drive" -ForegroundColor Red
    Write-Host "Execute: .\rclone.exe config" -ForegroundColor Yellow
    Write-Host "Escolha: Google Drive, nome: 'gdrive'" -ForegroundColor Yellow
    exit 1
}

# Verificar se arquivo existe
if (-not (Test-Path $filename)) {
    Write-Host "❌ Arquivo não encontrado: $filename" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Arquivo: $filename" -ForegroundColor Cyan
Write-Host "📂 Destino: drive:$driveFolder/" -ForegroundColor Cyan

# Upload usando rclone
# Sintaxe: .\rclone.exe copyto "origem" "gdrive:ID_PASTA/nome_final"
$targetPath = "gdrive:$driveFolder/$filename"

Write-Host "⬆️  Iniciando upload..." -ForegroundColor Yellow
.\rclone.exe copyto "$filename" "$targetPath" --progress

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Upload concluído com sucesso!" -ForegroundColor Green
    Write-Host "🔗 Arquivo salvo em: $targetPath" -ForegroundColor Cyan
} else {
    Write-Host "❌ Falha no upload (código: $LASTEXITCODE)" -ForegroundColor Red
}