create extension if not exists "pgcrypto";

create table if not exists public.configuration_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  instruction_id text null,
  work_line_id text null,
  item_id text null,
  commission text not null,
  instruction text not null,
  matter text not null,
  submatter text not null,
  work_line text null,
  work_line_unified text null,
  item_objective text not null,
  item_objective_2 text null,
  status text null,
  year integer not null default 2026
);

alter table public.configuration_items enable row level security;

drop policy if exists "Public read configuration items" on public.configuration_items;
create policy "Public read configuration items"
  on public.configuration_items
  for select
  to anon
  using (true);

drop policy if exists "Admin full access configuration items" on public.configuration_items;
create policy "Admin full access configuration items"
  on public.configuration_items
  for all
  to authenticated
  using (true)
  with check (true);
