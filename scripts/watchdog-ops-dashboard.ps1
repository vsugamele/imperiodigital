# Watchdog: ensures Ops Dashboard (Next dev server) is running
# Logs to: C:\Users\vsuga\clawd\logs\watchdog-ops-dashboard.log

$ErrorActionPreference = 'SilentlyContinue'

$logDir = 'C:\Users\vsuga\clawd\logs'
$logFile = Join-Path $logDir 'watchdog-ops-dashboard.log'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Log($msg) {
  $ts = (Get-Date).ToString('s')
  Add-Content -Path $logFile -Value "$ts $msg"
}

$port = 3000
$hostName = '127.0.0.1'

# Quick TCP check
$tcpOk = $false
try {
  $client = New-Object System.Net.Sockets.TcpClient
  $iar = $client.BeginConnect($hostName, $port, $null, $null)
  $tcpOk = $iar.AsyncWaitHandle.WaitOne(250)
  $client.Close()
} catch {
  $tcpOk = $false
}

if ($tcpOk) {
  exit 0
}

Log "Ops Dashboard not reachable on ${hostName}:$port. Attempting restart..."

# Kill stale next dev server if any
try {
  $stale = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*ops-dashboard*next*dev*' }
  foreach ($p in $stale) {
    Log "Killing stale ops-dashboard pid $($p.ProcessId)"
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
} catch {
  Log "Error checking/killing stale ops-dashboard process."
}

# Start dev server in background
try {
  $workdir = 'C:\Users\vsuga\clawd\ops-dashboard'
  $cmd = 'C:\Windows\System32\cmd.exe'
  $args = '/c npm run dev'
  Start-Process -FilePath $cmd -ArgumentList $args -WorkingDirectory $workdir -WindowStyle Hidden
  Log "Started ops-dashboard via Start-Process: npm run dev"
  Start-Sleep -Milliseconds 1200
} catch {
  Log "Error starting ops-dashboard process."
}

# Re-check
$tcpOk2 = $false
try {
  $client2 = New-Object System.Net.Sockets.TcpClient
  $iar2 = $client2.BeginConnect($hostName, $port, $null, $null)
  $tcpOk2 = $iar2.AsyncWaitHandle.WaitOne(800)
  $client2.Close()
} catch {
  $tcpOk2 = $false
}

if ($tcpOk2) {
  Log "Ops Dashboard restored."
} else {
  Log "Ops Dashboard still down after restart attempt."
}
