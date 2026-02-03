# IGAMING OPS — Visão Geral

## Objetivo
Gerar e publicar Reels (Instagram) automaticamente para múltiplos perfis, com **6 posts/dia por perfil**, no modelo **D+1** (gera e agenda hoje para publicar amanhã), com logs e rastreabilidade.

## Perfis (interno → Upload-Post username)
- teo → `Theo_viieiraa`
- jonathan → `jonathanbk`
- laise → `Laise_fan`
- pedro → `pedrovieira`

## Horários (America/Sao_Paulo)
- 10:00
- 13:00
- 16:00
- 19:00
- 21:00
- 23:00

## Pastas
- Local workspace: `C:\Users\vsuga\clawd\`
- Vídeos locais: `videos/`
- Imagens geradas locais: `images/generated/`
- Metadados por execução: `results/runs/<perfil>/<runId>.json`
- Log Excel (CSV): `results/posting-log-v2.csv`

## Drive (por perfil)
Dentro da pasta de cada perfil (Drive):
- `/videos/` (MP4)
- `/images/` (PNG)

## Drive (central ops)
- Pasta: `IGAMING_OPS`
- `opsFolderId`: ver `config/drive-ops.json`
- Backups: docs + logs + metadados em `/docs` e `/results`
