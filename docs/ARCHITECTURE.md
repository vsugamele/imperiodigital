# Architecture (WIP)

## Goals
- Operar com autonomia (Head de Ops)
- Tudo rastreável: backlog → execução → logs → dados
- Observabilidade: saber o que rodou, quando, custo, status e erros

## High-level components

### 1) Clawdbot (Agent + Gateway)
- Gateway local (ws/http)
- Canal Telegram (Vinicius)
- Automações (cron/heartbeat)

### 2) Ops Dashboard (Next.js + Supabase)
- UI: Kanban + Marketing Summary + Status (Alex)
- Supabase: boards/columns/cards (single-board "Master")
- APIs locais: `/api/status`, `/api/marketing-summary`

### 3) Upload-Post pipeline
- Geração de assets (imagem → vídeo + áudio)
- Upload para Drive (videos/images)
- Scheduling para IG
- Logging em `results/posting-log-v2.csv`

### 4) Storage / Artifacts
- `results/` (CSV, runs)
- `memory/` (logs diários/estado)
- Drive (backup IGAMING_OPS)

## Conventions
- Toda automação escreve log mínimo em `memory/YYYY-MM-DD.md`
- CSV `posting-log-v2.csv` é a fonte de truth do scheduling/posting

## Open questions / next steps
- Padronizar "Projetos/Produtos" (Pedro/Jonathan/etc) e taxonomia
- Criar ledger de custos (IA e ferramentas) por projeto
- Conectar GitHub + CI
