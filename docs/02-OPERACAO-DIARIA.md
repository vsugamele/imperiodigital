# Operação diária (automação)

## Modelo
- **D+1**: todo dia cedo geramos e agendamos os posts de amanhã.
- Horários: 10/13/16/19/21/23 (America/Sao_Paulo)

## Jobs (cron)
- `igaming_schedule_dplus1_daily_0705`: 07:05 — gera + agenda D+1 (todos perfis)
- `igaming_ops_backup_daily_0730`: 07:30 — backup para Drive (IGAMING_OPS)
- `igaming_uploadpost_status_poll_15m`: a cada 15 min — checa status e atualiza CSV

## Onde acompanhar
- CSV: `results/posting-log-v2.csv`
  - status: queued / scheduled / in_progress / confirmed / failed / status_check_failed

## Rodar manualmente (debug)
- Gerar + agendar D+1 para um perfil:
  ```powershell
  node scripts\schedule-next-day.js teo
  ```
- Verificar status por request_id/job_id:
  ```powershell
  node scripts\upload-status.js --request_id <id>
  # ou
  node scripts\upload-status.js --job_id <id>
  ```
- Rodar poller uma vez:
  ```powershell
  node scripts\poll-upload-status.js 25
  ```
