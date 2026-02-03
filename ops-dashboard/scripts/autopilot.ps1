#!/usr/bin/env pwsh
# Ops Autopilot - Runs every 6 hours
# Goal: Advance kanban tasks autonomously

$ErrorActionPreference = "Continue"

# Paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$TasksFile = "$RootDir/tasks.json"
$LogFile = "$RootDir/tmp/autopilot.log"
$ActivityFile = "$RootDir/tmp/autopilot-activity.json"

# Ensure tmp directory exists
New-Item -ItemType Directory -Force -Path "$RootDir/tmp" | Out-Null

# Load tasks
$tasksData = Get-Content $TasksFile -Raw | ConvertFrom-Json
$tasks = $tasksData.tasks

Write-Host "=== OPS AUTOPILOT - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" -ForegroundColor Cyan
Write-Host "Tasks loaded: $($tasks.Count)" -ForegroundColor Gray

# Filter by status
$doingTasks = $tasks | Where-Object { $_.status -eq 'doing' }
$backlogTasks = $tasks | Where-Object { $_.status -eq 'backlog' }
$blockedTasks = $tasks | Where-Object { $_.status -eq 'blocked' }
$doneTasks = $tasks | Where-Object { $_.status -eq 'done' }

Write-Host "Status: Doing=$($doingTasks.Count), Backlog=$($backlogTasks.Count), Blocked=$($blockedTasks.Count), Done=$($doneTasks.Count)" -ForegroundColor Gray

$actionTaken = $false
$actionLog = @()

# Strategy: 
# 1. If task in "doing" has been there for >24h and no progress, move to blocked
# 2. If task in "doing" can be completed (simple), complete it
# 3. If no "doing" tasks, pull highest priority from backlog

foreach ($task in $doingTasks) {
    $taskUpdatedAt = [datetime]$task.updatedAt
    $hoursInDoing = (New-TimeSpan -Start $taskUpdatedAt -End (Get-Date)).TotalHours
    
    Write-Host "Task '$($task.title)' in doing for $([math]::Round($hoursInDoing, 1))h" -ForegroundColor Gray
    
    if ($hoursInDoing -ge 24) {
        # Task stuck for 24h - move to blocked
        $task.status = 'blocked'
        $task.updatedAt = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
        $task.notes = "Bloqueado pelo Autopilot após 24h em andamento. Necessita input humano."
        $actionTaken = $true
        $actionLog += "BLOCKED: '$($task.title)' - Sem progresso em 24h"
        Write-Host "  → Moved to BLOCKED (stuck >24h)" -ForegroundColor Yellow
    }
    else {
        # Check for simple completable tasks
        if ($task.title -like "*Atualizar*" -or $task.title -like "*Corrigir texto*" -or $task.title -like "*Documentação*") {
            # Simple task that can be auto-completed
            $task.status = 'done'
            $task.updatedAt = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
            $task.notes = "Concluído automaticamente pelo Autopilot"
            $actionTaken = $true
            $actionLog += "DONE: '$($task.title)' - Tarefa simples completada"
            Write-Host "  → Marked as DONE (auto-completed)" -ForegroundColor Green
        }
    }
}

if (-not $actionTaken -and $backlogTasks.Count -gt 0) {
    # Pull next task from backlog (high > medium > low)
    $priorityOrder = @('high', 'medium', 'low')
    
    foreach ($priority in $priorityOrder) {
        $nextTask = $backlogTasks | Where-Object { $_.priority -eq $priority } | Select-Object -First 1
        if ($nextTask) {
            $nextTask.status = 'doing'
            $nextTask.updatedAt = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
            $nextTask.assignee = 'Alex'
            $actionTaken = $true
            $actionLog += "DOING: '$($nextTask.title)' - Puxado do backlog (prioridade: $priority)"
            Write-Host "→ Moved to DOING: '$($nextTask.title)'" -ForegroundColor Green
            break
        }
    }
}

# Save updated tasks
$tasksData.updatedAt = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
$tasksData | ConvertTo-Json -Depth 10 | Set-Content $TasksFile -Encoding UTF8

# Log action
$logEntry = @{
    timestamp = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
    actions = $actionLog
    taskCount = @{
        doing = ($tasks | Where-Object { $_.status -eq 'doing' }).Count
        backlog = ($tasks | Where-Object { $_.status -eq 'backlog' }).Count
        blocked = ($tasks | Where-Object { $_.status -eq 'blocked' }).Count
        done = ($tasks | Where-Object { $_.status -eq 'done' }).Count
    }
}

# Append to log file
$logEntry | ConvertTo-Json -Depth 5 | Out-File -FilePath $LogFile -Append -Encoding UTF8

# Update activity file for Alex Monitor
$activityEntry = @{
    status = if ($doingTasks.Count -gt 0) { "working" } else { "standby" }
    lastAction = if ($actionLog.Count -gt 0) { $actionLog[-1] } else { "Nenhuma ação necessária" }
    lastUpdate = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
    nextRun = (Get-Date).AddHours(6).ToString('yyyy-MM-dd HH:mm:ss')
}
$activityEntry | ConvertTo-Json | Set-Content $ActivityFile -Encoding UTF8

Write-Host ""
if ($actionLog.Count -gt 0) {
    Write-Host "Actions taken:" -ForegroundColor Green
    foreach ($log in $actionLog) {
        Write-Host "  - $log" -ForegroundColor White
    }
}
else {
    Write-Host "No actions needed - system in good state" -ForegroundColor Gray
}

Write-Host "=== AUTOPILOT COMPLETE ===" -ForegroundColor Cyan
