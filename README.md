# clawd

Workspace de automações + Ops Dashboard.

## Pastas principais
- `ops-dashboard/` — Next.js UI (Kanban, Marketing summary, status)
- `scripts/` — automações (schedule, poll, backup)
- `results/` — logs/outputs (não versionado)
- `docs/` — arquitetura, processos e fontes de dados

## Desenvolvimento (Ops Dashboard)
```bash
cd ops-dashboard
npm install
npm run dev
```

## Nota de segurança
- Não versionamos `.env*` nem `config/token.json`.
