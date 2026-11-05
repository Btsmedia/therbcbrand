-- Team roles, order fulfilment fields and history, and the Ile-Ife delivery options.

-- ============ ROLES ============
-- owner      : everything, including the team
-- manager    : products, stock, discounts, orders, reviews
-- fulfilment : orders only (pack, ship, deliver, delivery fees)
-- support    : view orders, moderate reviews
alter table public.profiles drop constraint if exists profiles_role_check;
update public.profiles set role = 'manager' where role = 'staff';
alter table public.profiles add constraint profiles_role_check check (role in ('customer','support','fulfilment','manager','owner'));

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('support','fulfilment','manager','owner'));
$$;
create or replace function public.can_manage_catalog() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('manager','owner'));
$$;
create or replace function public.can_manage_orders() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('fulfilment','manager','owner'));
$$;
create or replace function public.can_moderate_reviews() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('support','manager','owner'));
$$;

-- catalogue, delivery options and discount codes: managers and the owner
drop policy if exists "staff manage products" on public.products;
create policy "catalog team manages products" on public.products for all using (public.can_manage_catalog()) with check (public.can_manage_catalog());
drop policy if exists "staff manage images" on public.product_images;
create policy "catalog team manages images" on public.product_images for all using (public.can_manage_catalog()) with check (public.can_manage_catalog());
drop policy if exists "staff manage variants" on public.product_variants;
create policy "catalog team manages variants" on public.product_variants for all using (public.can_manage_catalog()) with check (public.can_manage_catalog());
drop policy if exists "staff manage rates" on public.delivery_rates;
create policy "catalog team manages rates" on public.delivery_rates for all using (public.can_manage_catalog()) with check (public.can_manage_catalog());
drop policy if exists "staff manage codes" on public.discount_codes;
create policy "catalog team manages codes" on public.discount_codes for all using (public.can_manage_catalog()) with check (public.can_manage_catalog());

drop policy if exists "staff upload product media" on storage.objects;
drop policy if exists "staff change product media" on storage.objects;
drop policy if exists "staff delete product media" on storage.objects;
create policy "catalog team uploads product media" on storage.objects for insert with check (bucket_id = 'product-media' and public.can_manage_catalog());
create policy "catalog team changes product media" on storage.objects for update using (bucket_id = 'product-media' and public.can_manage_catalog());
create policy "catalog team deletes product media" on storage.objects for delete using (bucket_id = 'product-media' and public.can_manage_catalog());

-- orders: everyone on the team can see them, fulfilment/managers/owner can update
drop policy if exists "staff update orders" on public.orders;
create policy "order team updates orders" on public.orders for update using (public.can_manage_orders()) with check (public.can_manage_orders());

-- reviews: support/managers/owner moderate
drop policy if exists "staff moderate reviews" on public.reviews;
drop policy if exists "staff delete reviews" on public.reviews;
drop policy if exists "staff delete media" on public.review_media;
create policy "review team moderates reviews" on public.reviews for update using (public.can_moderate_reviews()) with check (public.can_moderate_reviews());
create policy "review team deletes reviews" on public.reviews for delete using (public.can_moderate_reviews());
create policy "review team deletes media" on public.review_media for delete using (public.can_moderate_reviews());
drop policy if exists "staff delete review media" on storage.objects;
create policy "review team deletes review media" on storage.objects for delete using (bucket_id = 'review-media' and public.can_moderate_reviews());

-- the owner gives or removes team access by email (the person must have signed in to the store once)
create or replace function public.set_member_role(p_email text, p_role text) returns text
language plpgsql security definer set search_path = public as $$
declare target public.profiles;
begin
  if not public.is_owner() then return 'not_owner'; end if;
  if p_role not in ('customer','support','fulfilment','manager','owner') then return 'bad_role'; end if;
  select * into target from public.profiles where lower(email) = lower(trim(p_email));
  if not found then return 'not_found'; end if;
  if target.id = auth.uid() then return 'self'; end if;
  update public.profiles set role = p_role where id = target.id;
  return 'ok';
end; $$;
revoke execute on function public.set_member_role(text, text) from public, anon;
grant execute on function public.set_member_role(text, text) to authenticated;
revoke execute on function public.can_manage_catalog() from public;
revoke execute on function public.can_manage_orders() from public;
revoke execute on function public.can_moderate_reviews() from public;
grant execute on function public.can_manage_catalog(), public.can_manage_orders(), public.can_moderate_reviews() to anon, authenticated;

-- the role guard must also run as the person making the change
create or replace function public.guard_role_change() returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_owner() and current_user not in ('postgres','service_role','supabase_admin') then
    raise exception 'Only the owner can change roles';
  end if;
  return new;
end; $$;

-- ============ ORDER FULFILMENT ============
alter table public.orders
  add column if not exists delivery_fee integer check (delivery_fee is null or delivery_fee >= 0),  -- set by staff once location and weight are known
  add column if not exists courier text check (courier is null or char_length(courier) <= 40),
  add column if not exists tracking_number text check (tracking_number is null or char_length(tracking_number) <= 80),
  add column if not exists staff_note text check (staff_note is null or char_length(staff_note) <= 2000),
  add column if not exists updated_at timestamptz not null default now();

grant update (status, delivery_fee, courier, tracking_number, staff_note) on public.orders to authenticated;

-- Which status changes the team may make. Payment confirmations for card/OPay only ever come
-- from the payment provider, and cancelled orders can't be reopened (their stock has gone back).
-- (runs as the person making the change, so it can tell staff apart from the payment system)
create or replace function public.guard_order_status() returns trigger
language plpgsql security invoker set search_path = public as $$
declare allowed text[];
begin
  new.updated_at := now();
  if new.status is not distinct from old.status then return new; end if;
  if current_user in ('postgres','service_role','supabase_admin') then return new; end if;
  allowed := case old.status
    when 'awaiting_payment' then array['cancelled']
    when 'failed' then array['cancelled']
    when 'awaiting_transfer' then array['paid','cancelled']
    when 'pay_on_delivery' then array['packed','shipped','delivered','cancelled']
    when 'paid' then array['packed','shipped','delivered','cancelled']
    when 'packed' then array['paid','shipped','delivered','cancelled']
    when 'shipped' then array['packed','delivered','cancelled']
    when 'delivered' then array['shipped']
    else array[]::text[] end;
  if not (new.status = any(allowed)) then
    raise exception 'An order can''t go from % to %', replace(old.status,'_',' '), replace(new.status,'_',' ');
  end if;
  return new;
end; $$;
revoke execute on function public.guard_order_status() from public, anon, authenticated;
drop trigger if exists orders_guard_status on public.orders;
create trigger orders_guard_status before update on public.orders for each row execute function public.guard_order_status();

-- Order history: every status change, delivery fee and tracking update, with who made it.
create table if not exists public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  kind text not null,
  detail text,
  by_email text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);
alter table public.order_events enable row level security;
create policy "team reads order history" on public.order_events for select using (public.is_staff());
revoke insert, update, delete, truncate on public.order_events from anon, authenticated;

create or replace function public.log_order_event() returns trigger
language plpgsql security definer set search_path = public as $$
declare who text := coalesce((select email from auth.users where id = auth.uid()), 'Store');
begin
  if tg_op = 'INSERT' then
    insert into public.order_events(order_id, kind, detail, by_email) values (new.id, 'status', new.status, 'Customer');
    return new;
  end if;
  if new.status is distinct from old.status then
    insert into public.order_events(order_id, kind, detail, by_email) values (new.id, 'status', new.status, who);
  end if;
  if new.delivery_fee is distinct from old.delivery_fee then
    insert into public.order_events(order_id, kind, detail, by_email) values (new.id, 'delivery_fee', coalesce(new.delivery_fee::text, 'cleared'), who);
  end if;
  if new.courier is distinct from old.courier or new.tracking_number is distinct from old.tracking_number then
    insert into public.order_events(order_id, kind, detail, by_email) values (new.id, 'tracking', concat_ws(' · ', new.courier, new.tracking_number), who);
  end if;
  return new;
end; $$;
revoke execute on function public.log_order_event() from public, anon, authenticated;
drop trigger if exists orders_log_insert on public.orders;
drop trigger if exists orders_log_update on public.orders;
create trigger orders_log_insert after insert on public.orders for each row execute function public.log_order_event();
create trigger orders_log_update after update on public.orders for each row execute function public.log_order_event();

-- ============ DELIVERY OPTIONS ============
-- Delivery fees vary with location and weight, so they're confirmed after the order (price 0 = "to be confirmed").
alter table public.delivery_rates drop constraint if exists delivery_rates_zone_check;
alter table public.delivery_rates add constraint delivery_rates_zone_check check (zone in ('lagos','ife','nationwide','pickup'));
update public.delivery_rates set active = false;
insert into public.delivery_rates (zone, name, description, price, free_over, position, active) values
  ('nationwide', 'Nationwide delivery', 'Interstate takes 1–3 days. Farther locations ship with GIG or DHL.', 0, null, 0, true),
  ('ife', 'Delivery within Ile-Ife', 'Delivered on Fridays.', 0, null, 1, true),
  ('pickup', 'Pickup in Ile-Ife', 'Collect on Fridays. We''ll send you the pickup point.', 0, null, 2, true);
