-- Carts left at checkout. Saved once the shopper types their email; the store emails a reminder
-- 1 hour later and a second one a day later, unless they order, empty the bag or opt out.
-- Only the server (service role) touches this table.
create table if not exists public.abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  first_name text,
  items jsonb not null default '[]',
  token uuid not null unique default gen_random_uuid(),
  reminders int not null default 0,
  last_reminded_at timestamptz,
  recovered_at timestamptz,
  opted_out boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists abandoned_carts_due on public.abandoned_carts (updated_at) where recovered_at is null and not opted_out and reminders < 2;
alter table public.abandoned_carts enable row level security;
revoke all on public.abandoned_carts from anon, authenticated;
