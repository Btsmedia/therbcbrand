-- Editable store settings. The first one is the Deals section (banner text + homepage picks).
create table if not exists public.site_settings (
  key text primary key check (key ~ '^[a-z_]{2,40}$'),
  value jsonb not null default '{}'::jsonb check (pg_column_size(value) < 8000),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.site_settings enable row level security;

drop policy if exists "settings are public" on public.site_settings;
create policy "settings are public" on public.site_settings for select using (true);
drop policy if exists "catalog team edits settings" on public.site_settings;
create policy "catalog team edits settings" on public.site_settings for all
  using (public.can_manage_catalog()) with check (public.can_manage_catalog());

revoke all on public.site_settings from anon, authenticated;
grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;

create or replace function public.touch_site_settings() returns trigger
language plpgsql security invoker set search_path = public as $$
begin new.updated_at := now(); new.updated_by := auth.uid(); return new; end; $$;
drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before insert or update on public.site_settings
  for each row execute function public.touch_site_settings();

insert into public.site_settings (key, value) values ('deals', jsonb_build_object(
  'eyebrow', 'This week only',
  'title', 'Weekend',
  'highlight', 'Deals',
  'blurb', 'Hand-picked favourites at their best prices this month, from hair tools to storage. While stocks last.',
  'cta', 'Shop the deals',
  'picks', '[]'::jsonb
)) on conflict (key) do nothing;
