# Ops Runbook

## If Upload-Post scheduling fails
1) Check `results/posting-log-v2.csv` for the last failure line.
2) Re-run only the failing script/profile:
   - iGaming D+1: `node scripts/schedule-next-day.js <profile>`
   - PetSelectUK D+1: `node scripts/petselect-schedule-next-day.js`
   - JP D+1: `node scripts/jp-schedule-next-day.js`
3) If it is an API outage, wait and retry; do not generate extra content.

## If Ops Dashboard steals window focus (Windows)
- Ensure Task Scheduler watchdogs run with hidden window.
  - Tasks: `\OpsDashboard Watchdog`, `\Clawdbot Watchdog`
  - Action should include: `powershell.exe -WindowStyle Hidden ...`

## If Supabase is down / unreadable
- Dashboard may show stale/empty data.
- CSV backup continues to work.
- When recovered, import again:
  - `node scripts/import-posting-log-to-supabase.js --limit 5000`

## If posting_log import errors with ON CONFLICT
- Ensure dedupe index is **non-partial**:
```sql
DROP INDEX IF EXISTS public.posting_log_dedupe_idx;
CREATE UNIQUE INDEX IF NOT EXISTS posting_log_dedupe_idx
  ON public.posting_log (provider_job_id, status, scheduled_at);
```

## If identity is wrong (iGaming faces)
- Put fixed reference image on Drive:
  - `/<profile folder>/reference/<profile>_ref.png`
- Then generation stops using random fallback.
