-- Posting log (Upload-Post scheduling + status tracking)
-- Source of truth: Supabase
-- Backup: results/posting-log-v2.csv on disk/Drive

create table if not exists public.posting_log (
  id bigserial primary key,

  -- from CSV columns
  at timestamptz not null,
  product text not null, -- e.g. teo/jonathan/laise/pedro/petselectuk
  request_id text,
  job_id text,
  filename text,
  drive_folder text,
  drive_paths text,
  profile text,
  platform text,
  status text,
  scheduled_at timestamptz,
  tz text,
  provider_job_id text,
  provider_request_id text,
  raw_json jsonb,

  -- ingestion metadata
  ingested_at timestamptz not null default now(),
  source text not null default 'posting-log-v2.csv'
);

create index if not exists posting_log_scheduled_at_idx on public.posting_log (scheduled_at);
create index if not exists posting_log_product_idx on public.posting_log (product);
create index if not exists posting_log_status_idx on public.posting_log (status);
create index if not exists posting_log_job_id_idx on public.posting_log (provider_job_id);

-- Dedup key: provider_job_id + status + scheduled_at is usually enough.
-- Keep it NON-PARTIAL so we can use ON CONFLICT in upserts.
create unique index if not exists posting_log_dedupe_idx
  on public.posting_log (provider_job_id, status, scheduled_at);
