# Data sources (WIP)

## Primary logs
- `results/posting-log-v2.csv`
  - Scheduling + upload pipeline log
  - Used by dashboard marketing summary and daily-summary

## Supabase
- Project: `NEXT_PUBLIC_SUPABASE_URL` (see ops-dashboard/.env.local)
- Tables:
  - `boards`, `columns`, `cards`

## Google Drive
- Videos: `/videos`
- Images: `/images`
- Backup folder: IGAMING_OPS

## AI providers (current)
- Gemini (Google AI Studio / generativelanguage.googleapis.com)
  - Some scripts currently call API directly.
  - TODO: centralize calls + record usage/tokens + cost ledger per project.

## TODO
- Create `results/ai-usage.jsonl` (one line per call) for cost tracking.
