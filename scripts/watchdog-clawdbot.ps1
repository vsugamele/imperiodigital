# Watchdog: ensures Clawdbot Gateway is running (low overhead)
# Runs safely under Task Scheduler (current user).
# Logs to: C:\Users\vsuga\clawd\logs\watchdog-clawdbot.log

$ErrorActionPreference = 'SilentlyContinue'

$logDir = 'C:\Users\vsuga\clawd\logs'
$logFile = Join-Path $logDir 'watchdog-clawdbot.log'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Log($msg) {
  $ts = (Get-Date).ToString('s')
  Add-Content -Path $logFile -Value "$ts $msg"
}

$port = 18789
$hostName = '127.0.0.1'

# Quick TCP check (fast + light)
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

Log "Gateway not reachable on ${hostName}:$port. Attempting restart..."

# If a stale gateway process exists, kill it (prevents lock/port conflicts)
try {
  $stale = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*clawdbot*entry.js*gateway*' }
  foreach ($p in $stale) {
    Log "Killing stale gateway pid $($p.ProcessId)"
    Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
  }
} catch {
  Log "Error checking/killing stale gateway process."
}

# Start gateway in background (no service/task dependency)
try {
  $claw = 'C:\Users\vsuga\AppData\Roaming\npm\clawdbot.cmd'
  if (Test-Path $claw) {
    Start-Process -FilePath $claw -ArgumentList 'gateway' -WindowStyle Hidden
    Log "Started gateway via Start-Process: $claw gateway"
  } else {
    # Fallback: PATH lookup
    Start-Process -FilePath 'clawdbot' -ArgumentList 'gateway' -WindowStyle Hidden
    Log "Started gateway via Start-Process: clawdbot gateway"
  }
  Start-Sleep -Milliseconds 800
} catch {
  Log "Error starting gateway process."
}

# Re-check
$tcpOk2 = $false
try {
  $client2 = New-Object System.Net.Sockets.TcpClient
  $iar2 = $client2.BeginConnect($hostName, $port, $null, $null)
  $tcpOk2 = $iar2.AsyncWaitHandle.WaitOne(500)
  $client2.Close()
} catch {
  $tcpOk2 = $false
}

if ($tcpOk2) {
  Log "Gateway restored."
} else {
  Log "Gateway still down after restart attempt."
}
