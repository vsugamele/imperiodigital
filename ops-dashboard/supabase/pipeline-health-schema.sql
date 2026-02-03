-- Pipeline Health & Token Tracking Schema
-- Run this in Supabase SQL Editor.

-- 1) Pipeline Runs Table
create table if not exists public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  product text not null,          -- teo/laise/jonathan/pedro/petselectuk
  run_at timestamptz not null default now(),
  status text not null,           -- running|completed|failed|partial
  
  -- Steps com status individual
  step_download_imgs int,         -- Quantidade de imagens baixadas
  step_generate int,              -- Quantidade de imagens geradas
  step_video int,                 -- Quantidade de vídeos criados
  step_upload int,                -- Quantidade de uploads para Drive
  step_schedule int,              -- Quantidade de posts agendados no Upload-Post
  
  errors jsonb,                   -- Array de erros encontrados
  duration_ms int,                -- Tempo de execução em ms
  
  created_at timestamptz not null default now()
);

-- Indexes para performance
create index if not exists pipeline_runs_product_idx on public.pipeline_runs (product);
create index if not exists pipeline_runs_run_at_idx on public.pipeline_runs (run_at);
create index if not exists pipeline_runs_status_idx on public.pipeline_runs (status);

-- 2) Token Usage Table (para tracking detalhado)
create table if not exists public.token_usage (
  id uuid primary key default gen_random_uuid(),
  recorded_at timestamptz not null default now(),
  
  -- Período
  period_date date not null,      -- Data do registro
  period_type text not null,      -- 'daily' ou 'monthly'
  
  -- Métricas
  total_tokens int not null default 0,
  total_cost numeric(10, 6) not null default 0,
  
  -- Breakdown por modelo
  by_model jsonb not null default '{}', -- { "haiku": { tokens: 1000, cost: 0.01 }, ... }
  
  -- Limites
  limit_tokens int,
  usage_percent numeric(5, 2),
  
  created_at timestamptz not null default now()
);

-- Indexes para token_usage
create index if not exists token_usage_date_idx on public.token_usage (period_date);
create index if not exists token_usage_type_idx on public.token_usage (period_type);

-- 3) Alerts Table (para notificações)
create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type text not null,       -- 'pipeline_failed' | 'token_limit' | 'scheduling_missing'
  severity text not null default 'warning', -- 'info' | 'warning' | 'critical'
  product text,                   -- Perfil afetado (se aplicável)
  message text not null,
  metadata jsonb not null default '{}',
  acknowledged boolean not null default false,
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  acknowledged_by text
);

-- Indexes para alertas
create index if not exists alerts_type_idx on public.alerts (alert_type);
create index if not exists alerts_severity_idx on public.alerts (severity);
create index if not exists alerts_created_idx on public.alerts (created_at);

-- 4) RLS Policies (já definidas em kanban-schema.sql, adicionando as novas)
alter table public.pipeline_runs enable row level security;
alter table public.token_usage enable row level security;
alter table public.alerts enable row level security;

-- Policies para pipeline_runs
create policy if not exists "pipeline_runs_select_all" on public.pipeline_runs
  for select using (true);

create policy if not exists "pipeline_runs_insert_service" on public.pipeline_runs
  for insert with check (true); -- Serviço role pode inserir

-- Policies para token_usage
create policy if not exists "token_usage_select_all" on public.token_usage
  for select using (true);

create policy if not exists "token_usage_insert_service" on public.token_usage
  for insert with check (true);

-- Policies para alerts
create policy if not exists "alerts_select_all" on public.alerts
  for select using (true);

create policy if not exists "alerts_insert_service" on public.alerts
  for insert with check (true);

create policy if not exists "alerts_acknowledge" on public.alerts
  for update using (true);

-- 5) View para Dashboard (últimas 24h)
create or replace view public.pipeline_health_summary as
select 
  product,
  status,
  count(*) as run_count,
  avg(step_video) as avg_videos,
  max(run_at) as last_run,
  array_agg(distinct error) filter (where error is not null) as errors
from (
  select 
    product,
    status,
    step_video,
    run_at,
    (select jsonb_array_elements_text(errors) from public.pipeline_runs pr2 where pr2.id = pr1.id) as error
  from public.pipeline_runs pr1
  where run_at > now() - interval '24 hours'
) sub
group by product, status;

-- 6) Função para gerar alertas automaticamente
create or replace function public.check_pipeline_alerts()
returns setof public.alerts as $$
declare
  rec record;
  new_alert public.alerts;
begin
  -- Verificar pipelines que falharam nas últimas 2 horas
  for rec in (
    select product, count(*) as fail_count
    from public.pipeline_runs
    where status = 'failed'
      and run_at > now() - interval '2 hours'
    group by product
  ) loop
    select into new_alert * from public.alerts where 
      alert_type = 'pipeline_failed' and 
      product = rec.product and 
      created_at > now() - interval '1 hour' and
      acknowledged = false;
    
    if not found then
      insert into public.alerts (alert_type, severity, product, message, metadata)
      values (
        'pipeline_failed',
        'warning',
        rec.product,
        format('Pipeline %s falhou %s vez(es) nas últimas 2 horas', rec.product, rec.fail_count),
        jsonb_build_object('fail_count', rec.fail_count, 'hours', 2)
      );
    end if;
  end loop;
  
  return query select * from public.alerts where acknowledged = false;
end;
$$ language plpgsql security definer;

-- 7) Função para gerar alerta de tokens
create or replace function public.check_token_alerts()
returns setof public.alerts as $$
declare
  daily_limit constant int := 1000000; -- 1M tokens
  monthly_limit constant int := 30000000; -- 30M tokens
  warning_threshold constant numeric := 0.8; -- 80%
  
  rec record;
  usage_percent numeric;
  new_alert public.alerts;
begin
  -- Verificar limite diário
  select (total_tokens / daily_limit) into usage_percent
  from public.token_usage
  where period_type = 'daily'
  order by recorded_at desc
  limit 1;
  
  if usage_percent >= warning_threshold then
    select into new_alert * from public.alerts where 
      alert_type = 'token_limit' and 
      message like 'Limite diário%' and
      created_at > now() - interval '6 hours' and
      acknowledged = false;
    
    if not found then
      insert into public.alerts (alert_type, severity, message, metadata)
      values (
        'token_limit',
        case when usage_percent >= 0.95 then 'critical' else 'warning' end,
        format('Limite diário de tokens em %s%%', (usage_percent * 100)::int),
        jsonb_build_object('usage_percent', usage_percent, 'limit', daily_limit, 'period', 'daily')
      );
    end if;
  end if;
  
  -- Verificar limite mensal
  select (total_tokens / monthly_limit) into usage_percent
  from public.token_usage
  where period_type = 'monthly'
  order by recorded_at desc
  limit 1;
  
  if usage_percent >= warning_threshold then
    select into new_alert * from public.alerts where 
      alert_type = 'token_limit' and 
      message like 'Limite mensal%' and
      created_at > now() - interval '24 hours' and
      acknowledged = false;
    
    if not found then
      insert into public.alerts (alert_type, severity, message, metadata)
      values (
        'token_limit',
        case when usage_percent >= 0.95 then 'critical' else 'warning' end,
        format('Limite mensal de tokens em %s%%', (usage_percent * 100)::int),
        jsonb_build_object('usage_percent', usage_percent, 'limit', monthly_limit, 'period', 'monthly')
      );
    end if;
  end if;
  
  return query select * from public.alerts where acknowledged = false;
end;
$$ language plpgsql security definer;
