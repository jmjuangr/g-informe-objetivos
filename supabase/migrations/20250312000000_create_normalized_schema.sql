create extension if not exists "pgcrypto";

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.instructions (
  id uuid primary key default gen_random_uuid(),
  commission_id uuid references public.commissions(id),
  name text not null,
  legacy_instruction_id text null,
  created_at timestamptz not null default now()
);

create table if not exists public.matters (
  id uuid primary key default gen_random_uuid(),
  instruction_id uuid not null references public.instructions(id),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.submatters (
  id uuid primary key default gen_random_uuid(),
  matter_id uuid not null references public.matters(id),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.work_lines (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  display_name text not null,
  sort_order integer null,
  created_at timestamptz not null default now()
);

create table if not exists public.items_objetivo (
  id uuid primary key default gen_random_uuid(),
  instruction_id uuid not null references public.instructions(id),
  submatter_id uuid not null references public.submatters(id),
  work_line_id uuid not null references public.work_lines(id),
  title text not null,
  status text null,
  year integer not null default 2026,
  legacy_item_code text null,
  created_at timestamptz not null default now()
);

create or replace view public.v_items_export as
select
  items.id as item_uuid,
  items.legacy_item_code as item_code,
  items.title,
  items.status,
  items.year,
  instructions.id as instruction_id,
  instructions.name as instruction,
  commissions.name as commission,
  matters.name as matter,
  submatters.name as submatter,
  work_lines.id as work_line_id,
  work_lines.code as work_line_code,
  work_lines.display_name as work_line
from public.items_objetivo items
join public.instructions instructions on instructions.id = items.instruction_id
left join public.commissions commissions on commissions.id = instructions.commission_id
join public.submatters submatters on submatters.id = items.submatter_id
join public.matters matters on matters.id = submatters.matter_id
join public.work_lines work_lines on work_lines.id = items.work_line_id;

alter table public.commissions enable row level security;
alter table public.instructions enable row level security;
alter table public.matters enable row level security;
alter table public.submatters enable row level security;
alter table public.work_lines enable row level security;
alter table public.items_objetivo enable row level security;

drop policy if exists "Public read commissions" on public.commissions;
create policy "Public read commissions"
  on public.commissions
  for select
  to anon
  using (true);

drop policy if exists "Public read instructions" on public.instructions;
create policy "Public read instructions"
  on public.instructions
  for select
  to anon
  using (true);

drop policy if exists "Public read matters" on public.matters;
create policy "Public read matters"
  on public.matters
  for select
  to anon
  using (true);

drop policy if exists "Public read submatters" on public.submatters;
create policy "Public read submatters"
  on public.submatters
  for select
  to anon
  using (true);

drop policy if exists "Public read work lines" on public.work_lines;
create policy "Public read work lines"
  on public.work_lines
  for select
  to anon
  using (true);

drop policy if exists "Public read items objetivo" on public.items_objetivo;
create policy "Public read items objetivo"
  on public.items_objetivo
  for select
  to anon
  using (true);

drop policy if exists "Admin full commissions" on public.commissions;
create policy "Admin full commissions"
  on public.commissions
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin full instructions" on public.instructions;
create policy "Admin full instructions"
  on public.instructions
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin full matters" on public.matters;
create policy "Admin full matters"
  on public.matters
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin full submatters" on public.submatters;
create policy "Admin full submatters"
  on public.submatters
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin full work lines" on public.work_lines;
create policy "Admin full work lines"
  on public.work_lines
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin full items objetivo" on public.items_objetivo;
create policy "Admin full items objetivo"
  on public.items_objetivo
  for all
  to authenticated
  using (true)
  with check (true);
