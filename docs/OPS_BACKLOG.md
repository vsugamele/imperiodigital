# OPS Backlog

## Next (when idle)
- [ ] Add local speech-to-text support for inbound Telegram audio (Whisper): install python + faster-whisper (or equivalent), wire into Clawdbot to auto-transcribe .ogg opus.
- [ ] Build online dashboard (kanban/status): queue + running tasks + last runs + cron schedule + health.
  - Use Supabase (tables + realtime) + n8n (workflows/alerts) + MCP where useful.
- [ ] "Disaster recovery" pack: architecture + processes + bootstrap scripts + cron definitions; ensure backup-to-Drive includes it and excludes secrets.
