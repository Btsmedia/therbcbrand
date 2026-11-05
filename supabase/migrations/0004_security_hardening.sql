-- Security hardening after the November audit.

-- 1. Visitors who aren't signed in never write to the database directly. Everything they do
--    (placing orders, payments) goes through the server, which uses its own key.
revoke insert, update, delete, truncate on all tables in schema public from anon;
-- Nobody but the database owner may wipe a whole table.
revoke truncate on all tables in schema public from authenticated;
-- Orders are only ever created or removed by the server.
revoke insert, delete on public.orders, public.order_items from authenticated;
revoke update on public.order_items from authenticated;
-- Staff can move an order through its stages, but nobody can edit its prices or totals from the browser.
revoke update on public.orders from authenticated;
grant update (status) on public.orders to authenticated;
-- New tables created later start locked too.
alter default privileges in schema public revoke insert, update, delete, truncate on tables from anon;

-- 2. Customers may only edit their name and phone on their profile, never their role or email.
revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
revoke insert, delete on public.profiles from authenticated;

-- 3. Review photos/videos: a customer can only attach files from their own upload folder.
drop policy if exists "authors add media to pending reviews" on public.review_media;
create policy "authors add media to pending reviews" on public.review_media for insert with check (
  split_part(path, '/', 1) = auth.uid()::text
  and exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid() and r.status = 'pending')
);
-- at most 6 files per review
create or replace function public.limit_review_media() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.review_media where review_id = new.review_id) >= 6 then
    raise exception 'A review can have up to 6 photos or videos';
  end if;
  return new;
end; $$;
revoke execute on function public.limit_review_media() from public, anon, authenticated;
drop trigger if exists review_media_limit on public.review_media;
create trigger review_media_limit before insert on public.review_media for each row execute function public.limit_review_media();

-- 4. Keep review text to sensible lengths.
alter table public.reviews
  add constraint reviews_author_len check (char_length(author_name) between 1 and 80),
  add constraint reviews_city_len check (city is null or char_length(city) <= 80),
  add constraint reviews_title_len check (title is null or char_length(title) <= 120);

-- 5. Marking an order paid now always requires the confirmed amount, and it must match exactly
--    or exceed the order total. Only orders still waiting for card/OPay payment qualify.
create or replace function public.mark_order_paid(p_order uuid, p_reference text, p_amount_kobo bigint) returns text
language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then return 'not_found'; end if;
  if o.payment_method not in ('paystack','opay') then return 'wrong_method'; end if;
  if o.status not in ('awaiting_payment','failed') then return 'already_' || o.status; end if;
  if p_reference is distinct from o.payment_reference then return 'reference_mismatch'; end if;
  if p_amount_kobo is null or p_amount_kobo < o.total::bigint * 100 then return 'amount_mismatch'; end if;
  update public.orders set status = 'paid', paid_at = now() where id = p_order;
  update public.product_variants v set stock = greatest(v.stock - oi.qty, 0)
    from public.order_items oi where oi.order_id = p_order and oi.variant_id = v.id;
  return 'paid';
end; $$;
revoke execute on function public.mark_order_paid(uuid, text, bigint) from public, anon, authenticated;

-- 6. Prices, stock and totals can never be negative or absurd.
alter table public.orders
  add constraint orders_amounts_ok check (subtotal >= 0 and discount >= 0 and shipping >= 0 and total >= 0 and discount <= subtotal);
