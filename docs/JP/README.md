# Projeto JP

## What it is
JP is a hair professional focused on **curly / coily / wavy hair** (cacheados, crespos e ondulados).

## Inputs
- Drive folder (videos): folderId `1QfbkZUZMn6SICYQwovnyuQITlj95wYPw`
- Used folder: `Usados/`

## Scheduling
- Target posting time: **19:00 BRT**.
- Upload-Post scheduling quirk: schedule as **22:00 America/Sao_Paulo** (adjustable).

## Accounts
- Main account: multi-platform (TikTok + YouTube + Facebook + Instagram)
- Fan account: Instagram only

## Caption logic
- Base context comes from the **filename** (always).
- Caption is enriched with:
  - 1 CTA related to hair care / curls
  - 1–2 niche hashtags (#cachos etc)

## Script
- `node scripts/jp-schedule-next-day.js`

## Behavior
- If no videos exist: do nothing.
- If any scheduling fails: do NOT move the video.
- If both schedules succeed: move file to `/Usados`.
