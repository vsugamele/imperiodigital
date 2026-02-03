# Company Context (Imperio Digital Ops)

## What this is
This repo is the **operations brain** for Vinicius' automation stack: content generation + scheduling + monitoring.

## Products / Projects
### iGaming (Profiles)
- Profiles: **teo**, **jonathan**, **laise**, **pedro**
- Goal: generate Reels assets (image → video) and schedule D+1 posts.
- Strategy:
  - Prefer **no_cost images** on Drive: `/no_cost/images` per profile
  - Fallback: generate image with **Gemini** (multi-ref: person + style)
  - Upload generated assets to Drive under each profile (`/videos`, `/images`)
  - Schedule via **Upload-Post**

### PetSelectUK
- Generates:
  - 1 image (4:5)
  - 5 carousel slides (4:5)
  - 1 reels cover (9:16) + 10s mp4
- Schedules on Instagram for Europe/London.

### Projeto JP (Hair / Curly specialist)
- Project is a hair professional (curly / coily / wavy).
- Flow:
  - Take the newest MP4/MOV from Drive folderId `1QfbkZUZMn6SICYQwovnyuQITlj95wYPw`
  - Caption base = filename (context/explanation)
  - Caption enriched with JP CTA + 1–2 niche hashtags
  - Schedule D+1 via Upload-Post:
    - main profile: multi-platform
    - fan profile: Instagram only
  - After both schedules succeed: move file to `/Usados`

## Data Sources
- **Drive**: source for media inputs + backups
- **Supabase**: source of truth for ops data
  - `posting_log`: scheduling/status log
- **CSV backup**:
  - `results/posting-log-v2.csv` (always exists as fallback)

## Key Systems
- Upload-Post API: schedules posts.
- Rclone: Drive sync/copy.
- Ops Dashboard (Next.js): kanban + ops visibility.
- Clawdbot cron: automations schedule.

## Golden rules
- Secrets are never committed.
- Supabase is the "truth"; CSV is the "backup".
- Any important operational decision must be written to docs/DECISIONS.md.
