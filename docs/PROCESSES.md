# Processes (WIP)

## Daily / periodic automations

### Upload-Post polling (every 10 min)
- Script: `scripts/poll-upload-status.js 50`
- Goal: atualizar status de rows scheduled/posted/in_progress
- Output: append updates into `results/posting-log-v2.csv`

### D+1 scheduling (daily)
- Script: `scripts/schedule-next-day.js <profile>`
- Profiles: teo / jonathan / laise / pedro
- Creates: images/videos, uploads to Drive, schedules for tomorrow (America/Sao_Paulo)
- Logs: appends to `results/posting-log-v2.csv`

### Daily summary (daily)
- Script: `scripts/daily-summary.js`
- Reads CSV and sends summary to Vinicius via Telegram

### Backup to Drive (daily)
- Script: `scripts/backup-ops-to-drive.js`
- Target Drive folder: IGAMING_OPS (folderId 1rd94GIgRGfIr9lR02JYF9qquJJjLPjLO)
- Syncs docs + results

## Ops Dashboard autopilot (every 10 min)
- Reads Kanban state
- Picks next eligible task from Backlog → Doing
- Executes
- Updates card → Done/Blocked with a short note

## Incident handling
- Gateway watchdog: `scripts/watchdog-clawdbot.ps1` via Task Scheduler (10 min)
- If gateway port 18789 not reachable → restart
