# Auto-Router para Clawdbot (PowerShell)
# Uso: .\auto-router.ps1 "seu prompt aqui"

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$PromptArgs
)

$Prompt = $PromptArgs -join " "
$RouterScript = Join-Path (Split-Path $MyInvocation.MyCommand.Path) "model-router.py"

Write-Host "Analisando prompt..." -ForegroundColor Cyan

# Executa router
$Result = python $RouterScript $Prompt | ConvertFrom-Json

$ModelKey = $Result.model_key
$Model = $Result.model
$Analysis = $Result.analysis

Write-Host "📊 Roteando..." -ForegroundColor Yellow
Write-Host "[$($Analysis.category.ToUpper())] Complexity: $($Analysis.complexity)/10" -ForegroundColor Green
Write-Host "🤖 Modelo: $ModelKey ($Model)" -ForegroundColor Cyan
Write-Host ""

# Executa com modelo escolhido
Write-Host "Enviando para $ModelKey..." -ForegroundColor Magenta
& clawdbot ask --model $ModelKey @PromptArgs
