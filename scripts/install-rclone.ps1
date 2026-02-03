# Instalar rclone para Windows
Write-Host "🚀 Instalando rclone..." -ForegroundColor Green

# Criar diretório temporário
$tempDir = "C:\temp\rclone"
if (!(Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force
}

# URL do rclone para Windows
$rcloneUrl = "https://downloads.rclone.org/rclone-current-windows-amd64.zip"
$zipFile = "$tempDir\rclone.zip"

try {
    Write-Host "📥 Baixando rclone..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $rcloneUrl -OutFile $zipFile
    
    Write-Host "📦 Extraindo..." -ForegroundColor Yellow
    Expand-Archive -Path $zipFile -DestinationPath $tempDir -Force
    
    # Encontrar o executável
    $rcloneExe = Get-ChildItem -Path $tempDir -Recurse -Name "rclone.exe" | Select-Object -First 1
    $rclonePath = "$tempDir\$($rcloneExe -replace '\\rclone\.exe$', '')"
    
    # Copiar para local permanente
    $installDir = "C:\tools\rclone"
    if (!(Test-Path $installDir)) {
        New-Item -ItemType Directory -Path $installDir -Force
    }
    
    Copy-Item "$rclonePath\rclone.exe" "$installDir\rclone.exe" -Force
    
    Write-Host "✅ rclone instalado em: $installDir" -ForegroundColor Green
    Write-Host "🔧 Adicionando ao PATH..." -ForegroundColor Yellow
    
    # Adicionar ao PATH da sessão atual
    $env:PATH = "$installDir;$env:PATH"
    
    Write-Host "🧪 Testando instalação..." -ForegroundColor Cyan
    & "$installDir\rclone.exe" version
    
    Write-Host ""
    Write-Host "✅ rclone instalado com sucesso!" -ForegroundColor Green
    Write-Host "📍 Local: $installDir\rclone.exe" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Erro na instalação: $($_.Exception.Message)" -ForegroundColor Red
}

# Limpar arquivos temporários
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}