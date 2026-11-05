-- theazaleastoreng@gmail.com is the store's permanent owner.
-- Nobody (other owners included) can lower its role, and if the account is ever recreated it becomes owner again.

create table if not exists public.permanent_owners (email text primary key check (email = lower(email)));
alter table public.permanent_owners enable row level security;   -- no policies: invisible and unchangeable from the store
revoke all on public.permanent_owners from anon, authenticated;
insert into public.permanent_owners (email) values ('theazaleastoreng@gmail.com') on conflict do nothing;

create or replace function public.protect_permanent_owner() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.permanent_owners p where p.email = lower(coalesce(new.email, old.email))) then
    if tg_op = 'INSERT' then
      new.role := 'owner';                         -- recreated account: owner straight away
    elsif new.role is distinct from 'owner' then
      raise exception 'This is the store''s permanent owner account and its role can''t be changed';
    end if;
  end if;
  return new;
end; $$;
revoke execute on function public.protect_permanent_owner() from public, anon, authenticated;
drop trigger if exists profiles_permanent_owner on public.profiles;
create trigger profiles_permanent_owner before insert or update on public.profiles
  for each row execute function public.protect_permanent_owner();

-- the Team page's role changer refuses it with a clear message too
create or replace function public.set_member_role(p_email text, p_role text) returns text
language plpgsql security definer set search_path = public as $$
declare target public.profiles;
begin
  if not public.is_owner() then return 'not_owner'; end if;
  if p_role not in ('customer','support','fulfilment','manager','owner') then return 'bad_role'; end if;
  select * into target from public.profiles where lower(email) = lower(trim(p_email));
  if not found then return 'not_found'; end if;
  if target.id = auth.uid() then return 'self'; end if;
  if exists (select 1 from public.permanent_owners p where p.email = lower(target.email)) and p_role <> 'owner' then return 'protected'; end if;
  update public.profiles set role = p_role where id = target.id;
  return 'ok';
end; $$;
revoke execute on function public.set_member_role(text, text) from public, anon;
grant execute on function public.set_member_role(text, text) to authenticated;

update public.profiles set role = 'owner' where lower(email) = 'theazaleastoreng@gmail.com';
