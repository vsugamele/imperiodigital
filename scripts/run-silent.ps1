<# 
.SYNOPSIS
  Executa scripts Node.js silenciosamente (sem mostrar terminal)
  
.DESCRIPTION
  Wrapper que executa scripts Node.js usando wscript/cscript para rodar em background
  sem janela de terminal visível.

.PARAMETER Script
  Caminho do script Node.js a ser executado

.PARAMETER Args
  Argumentos opcionais para o script

.EXAMPLE
  .\run-silent.ps1 "scripts\schedule-next-day.js" "teo"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Script,
    
    [string]$Args = ""
)

$ErrorActionPreference = "Stop"

# Verificar se o script existe
if (-not (Test-Path $Script)) {
    Write-Error "Script não encontrado: $Script"
    exit 1
}

# Caminho absoluto do script
$scriptPath = (Get-Item $Script).FullName
$scriptDir = Split-Path $scriptPath -Parent

# Criar script VBS temporário para rodar sem janela
$vbsContent = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d `"$scriptDir`" && node `"$scriptPath`" $Args", 0, False
"@

$vbsPath = [System.IO.Path]::GetTempFileName() + ".vbs"
$vbsContent | Out-File -FilePath $vbsPath -Encoding ASCII

# Executar via wscript (silencioso)
Write-Host "Executando silenciosamente: $Script $Args" -ForegroundColor Cyan
try {
    $process = Start-Process -FilePath "wscript" -ArgumentList "//B `"$vbsPath`" //Nologo" -WindowStyle Hidden -PassThru
    $process.WaitForExit()
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Concluído com sucesso" -ForegroundColor Green
    } else {
        Write-Warning "Finalizado com código: $LASTEXITCODE"
    }
} catch {
    Write-Error "Erro ao executar: $_"
} finally {
    # Limpar arquivo VBS temporário
    Remove-Item $vbsPath -ErrorAction SilentlyContinue
}
