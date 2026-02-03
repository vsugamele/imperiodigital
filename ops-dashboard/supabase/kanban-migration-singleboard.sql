-- Migration: switch to single-board + labels on cards
-- Run AFTER kanban-schema.sql has been applied.

alter table public.cards
  add column if not exists labels text[] not null default '{}';

create index if not exists cards_labels_gin_idx on public.cards using gin (labels);
