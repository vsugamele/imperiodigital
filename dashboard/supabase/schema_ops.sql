-- OPS schema (isolated from existing tables)
-- Safe: creates a separate schema + new tables only.

create schema if not exists ops;

-- Heartbeat table (agent liveness)
create table if not exists ops.heartbeat (
  id bigserial primary key,
  source text not null, -- e.g. 'clawdbot-main'
  status text not null default 'online',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Tasks (kanban)
create table if not exists ops.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null default 'job', -- cron|manual|systemEvent|job
  status text not null default 'queued', -- queued|running|done|failed
  priority int not null default 0,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz,
  last_error text
);

-- Task logs (lightweight log lines)
create table if not exists ops.task_logs (
  id bigserial primary key,
  task_id uuid not null references ops.tasks(id) on delete cascade,
  level text not null default 'info',
  message text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Runs (execution records)
create table if not exists ops.runs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references ops.tasks(id) on delete set null,
  name text,
  status text not null default 'running', -- running|ok|error
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms int,
  meta jsonb not null default '{}'::jsonb,
  last_error text
);

-- Enable RLS on ops schema tables
alter table ops.heartbeat enable row level security;
alter table ops.tasks enable row level security;
alter table ops.task_logs enable row level security;
alter table ops.runs enable row level security;

-- Minimal policies: allow authenticated users read (private project)
-- Adjust later if you want stricter per-user rules.
create policy if not exists "ops_read_heartbeat" on ops.heartbeat
for select to authenticated using (true);

create policy if not exists "ops_read_tasks" on ops.tasks
for select to authenticated using (true);

create policy if not exists "ops_read_task_logs" on ops.task_logs
for select to authenticated using (true);

create policy if not exists "ops_read_runs" on ops.runs
for select to authenticated using (true);

-- Inserts/updates should be done server-side with service_role key.
