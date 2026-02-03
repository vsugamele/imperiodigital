-- Ops Dashboard Kanban (single-tenant, per-user rows)
-- Run this in Supabase SQL Editor.

-- 1) Extensions (optional)
create extension if not exists pgcrypto;

-- 2) Tables
create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  column_id uuid not null references public.columns(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists boards_owner_id_idx on public.boards(owner_id);
create index if not exists columns_board_id_idx on public.columns(board_id);
create index if not exists cards_board_id_idx on public.cards(board_id);
create index if not exists cards_column_id_idx on public.cards(column_id);

-- 3) RLS
alter table public.boards enable row level security;
alter table public.columns enable row level security;
alter table public.cards enable row level security;

-- boards policies
create policy "boards_select_own" on public.boards
  for select using (auth.uid() = owner_id);
create policy "boards_insert_own" on public.boards
  for insert with check (auth.uid() = owner_id);
create policy "boards_update_own" on public.boards
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "boards_delete_own" on public.boards
  for delete using (auth.uid() = owner_id);

-- columns policies
create policy "columns_select_own" on public.columns
  for select using (auth.uid() = owner_id);
create policy "columns_insert_own" on public.columns
  for insert with check (auth.uid() = owner_id);
create policy "columns_update_own" on public.columns
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "columns_delete_own" on public.columns
  for delete using (auth.uid() = owner_id);

-- cards policies
create policy "cards_select_own" on public.cards
  for select using (auth.uid() = owner_id);
create policy "cards_insert_own" on public.cards
  for insert with check (auth.uid() = owner_id);
create policy "cards_update_own" on public.cards
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "cards_delete_own" on public.cards
  for delete using (auth.uid() = owner_id);

-- 4) Helpful view (optional)
-- You can query boards + columns + cards via the app; no view required.
