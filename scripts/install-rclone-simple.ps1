# Instalar rclone para Windows - versao simples
Write-Host "Instalando rclone..."

$tempDir = "C:\temp\rclone"
$installDir = "C:\tools\rclone"

# Criar diretorios
if (!(Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir -Force }
if (!(Test-Path $installDir)) { New-Item -ItemType Directory -Path $installDir -Force }

$rcloneUrl = "https://downloads.rclone.org/rclone-current-windows-amd64.zip"
$zipFile = "$tempDir\rclone.zip"

try {
    Write-Host "Baixando rclone..."
    Invoke-WebRequest -Uri $rcloneUrl -OutFile $zipFile
    
    Write-Host "Extraindo..."
    Expand-Archive -Path $zipFile -DestinationPath $tempDir -Force
    
    # Encontrar executavel
    $rcloneExe = Get-ChildItem -Path $tempDir -Recurse -Filter "rclone.exe" | Select-Object -First 1
    
    if ($rcloneExe) {
        Copy-Item $rcloneExe.FullName "$installDir\rclone.exe" -Force
        Write-Host "rclone instalado em: $installDir"
        
        # Testar
        & "$installDir\rclone.exe" version
        
        Write-Host "Instalacao concluida!"
    } else {
        Write-Host "Erro: rclone.exe nao encontrado no arquivo baixado"
    }
    
} catch {
    Write-Host "Erro: $($_.Exception.Message)"
}

# Limpar
if (Test-Path $zipFile) { Remove-Item $zipFile -Force }