-- Lock the store for a launch, an upcoming sale, restocking or a short break (edited at /admin/lock).
insert into public.site_settings (key, value) values ('lock', jsonb_build_object(
  'on', false, 'template', 'launch', 'title', '', 'message', '', 'badge', '', 'until', null, 'autoOpen', true, 'notify', true
)) on conflict (key) do nothing;

-- (RLS with no insert policy: only the server, using the service key, can add signups)
-- "Notify me" signups from the lock screen. Written only by the store's server; read only by the team.
create table if not exists public.lock_signups (
  id bigint generated always as identity primary key,
  email text not null check (email = lower(email) and length(email) <= 120),
  reason text not null default 'launch' check (reason in ('launch','sale','restock','break')),
  created_at timestamptz not null default now(),
  unique (email, reason)
);
alter table public.lock_signups enable row level security;
create policy "catalog team reads signups" on public.lock_signups for select using (public.can_manage_catalog());
create policy "catalog team removes signups" on public.lock_signups for delete using (public.can_manage_catalog());
