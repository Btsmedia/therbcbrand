-- Azalea store: tables, security rules, storage buckets and payment functions.

-- ============ PROFILES & ROLES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','staff','owner')),
  created_at timestamptz not null default now()
);

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('staff','owner'));
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

-- new sign-ups get a profile automatically
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name) values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- only the owner may change anyone's role
create or replace function public.guard_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_owner() and current_user not in ('postgres','service_role','supabase_admin') then
    raise exception 'Only the owner can change roles';
  end if;
  return new;
end; $$;
create trigger profiles_role_guard before update on public.profiles for each row execute function public.guard_role_change();

alter table public.profiles enable row level security;
create policy "read own profile or staff" on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy "update own profile or owner" on public.profiles for update using (id = auth.uid() or public.is_owner());

-- ============ CATALOGUE ============
create table public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  slug text not null unique,
  name text not null,
  description text not null default '',
  care text not null default '',
  price integer not null check (price >= 0),          -- naira
  compare_at integer check (compare_at is null or compare_at > 0), -- old price when on sale
  category text not null check (category in ('beauty','gadgets','kitchen','lighting','storage','decor')),
  categories text[] not null default '{}',
  tags text[] not null default '{}',                   -- e.g. new, bestseller
  badge text,                                          -- e.g. Trending, Limited
  status text not null default 'draft' check (status in ('draft','live','archived')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  path text,                -- storage path when uploaded through the admin
  position integer not null default 0
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  colour text not null default 'Default',
  hex text not null default '#cccccc',
  stock integer not null default 0 check (stock >= 0),
  position integer not null default 0
);

create index on public.product_images (product_id);
create index on public.product_variants (product_id);

alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;

create policy "live products are public" on public.products for select using (status = 'live' or public.is_staff());
create policy "staff manage products" on public.products for all using (public.is_staff()) with check (public.is_staff());
create policy "images of visible products" on public.product_images for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'live' or public.is_staff())));
create policy "staff manage images" on public.product_images for all using (public.is_staff()) with check (public.is_staff());
create policy "variants of visible products" on public.product_variants for select using (exists (select 1 from public.products p where p.id = product_id and (p.status = 'live' or public.is_staff())));
create policy "staff manage variants" on public.product_variants for all using (public.is_staff()) with check (public.is_staff());

-- ============ DELIVERY & DISCOUNTS ============
create table public.delivery_rates (
  id uuid primary key default gen_random_uuid(),
  zone text not null check (zone in ('lagos','nationwide','pickup')),
  name text not null,
  description text not null default '',
  price integer not null default 0,
  free_over integer,
  active boolean not null default true,
  position integer not null default 0
);
alter table public.delivery_rates enable row level security;
create policy "active rates are public" on public.delivery_rates for select using (active or public.is_staff());
create policy "staff manage rates" on public.delivery_rates for all using (public.is_staff()) with check (public.is_staff());

create table public.discount_codes (
  code text primary key,
  percent integer not null check (percent between 1 and 90),
  category text,
  label text not null default '',
  active boolean not null default true,
  expires_at timestamptz
);
alter table public.discount_codes enable row level security;
create policy "staff manage codes" on public.discount_codes for all using (public.is_staff()) with check (public.is_staff());

-- ============ ORDERS ============
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('AZ-' || nextval('public.order_number_seq')),
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  phone text not null,
  first_name text not null,
  last_name text not null,
  delivery_mode text not null check (delivery_mode in ('ship','pickup')),
  address text, apartment text, city text, state text,
  delivery_name text not null,
  subtotal integer not null,
  discount integer not null default 0,
  discount_code text,
  shipping integer not null default 0,
  total integer not null,
  payment_method text not null check (payment_method in ('paystack','opay','transfer','pod')),
  payment_reference text unique,
  status text not null default 'awaiting_payment' check (status in ('awaiting_payment','awaiting_transfer','pay_on_delivery','paid','packed','shipped','delivered','cancelled','failed')),
  news_opt_in boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  name text not null,
  colour text,
  image text,
  price integer not null,
  qty integer not null check (qty > 0)
);
create index on public.order_items (order_id);
create index on public.orders (user_id);
create index on public.orders (email);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
-- orders are created by the server (service role), never directly from the browser
create policy "own orders or staff" on public.orders for select using (user_id = auth.uid() or public.is_staff());
create policy "staff update orders" on public.orders for update using (public.is_staff()) with check (public.is_staff());
create policy "items of visible orders" on public.order_items for select using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff())));

-- link guest orders to an account when the customer signs in with the same email
create or replace function public.claim_orders() returns void
language sql security definer set search_path = public as $$
  update public.orders set user_id = auth.uid()
  where user_id is null and lower(email) = lower((select email from auth.users where id = auth.uid()));
$$;

-- called only by the server after the payment provider confirms payment
create or replace function public.mark_order_paid(p_order uuid, p_reference text, p_amount_kobo bigint) returns text
language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then return 'not_found'; end if;
  if o.status not in ('awaiting_payment','failed') then return 'already_' || o.status; end if;
  if p_amount_kobo is not null and p_amount_kobo < o.total::bigint * 100 then return 'amount_mismatch'; end if;
  update public.orders set status = 'paid', paid_at = now(), payment_reference = coalesce(payment_reference, p_reference) where id = p_order;
  update public.product_variants v set stock = greatest(v.stock - oi.qty, 0)
    from public.order_items oi where oi.order_id = p_order and oi.variant_id = v.id;
  return 'paid';
end; $$;
revoke execute on function public.mark_order_paid(uuid, text, bigint) from public, anon, authenticated;

-- transfer and pay-on-delivery orders hold stock straight away
create or replace function public.reserve_stock(p_order uuid) returns void
language sql security definer set search_path = public as $$
  update public.product_variants v set stock = greatest(v.stock - oi.qty, 0)
  from public.order_items oi where oi.order_id = p_order and oi.variant_id = v.id;
$$;
revoke execute on function public.reserve_stock(uuid) from public, anon, authenticated;

-- ============ REVIEWS ============
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  city text,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reject_reason text,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create table public.review_media (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  path text not null,
  kind text not null check (kind in ('photo','video')),
  created_at timestamptz not null default now()
);
create index on public.reviews (product_id, status);
create index on public.review_media (review_id);

create or replace function public.has_bought(p_product uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.order_items oi join public.orders o on o.id = oi.order_id
    where oi.product_id = p_product and o.user_id = auth.uid()
      and o.status in ('paid','packed','shipped','delivered'));
$$;

alter table public.reviews enable row level security;
alter table public.review_media enable row level security;
create policy "approved, own or staff reviews" on public.reviews for select using (status = 'approved' or user_id = auth.uid() or public.is_staff());
create policy "buyers write pending reviews" on public.reviews for insert with check (user_id = auth.uid() and status = 'pending' and public.has_bought(product_id));
create policy "staff moderate reviews" on public.reviews for update using (public.is_staff()) with check (public.is_staff());
create policy "staff delete reviews" on public.reviews for delete using (public.is_staff());
create policy "media of visible reviews" on public.review_media for select using (exists (select 1 from public.reviews r where r.id = review_id and (r.status = 'approved' or r.user_id = auth.uid() or public.is_staff())));
create policy "authors add media to pending reviews" on public.review_media for insert with check (exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid() and r.status = 'pending'));
create policy "staff delete media" on public.review_media for delete using (public.is_staff());

-- ============ STORAGE ============
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('product-media', 'product-media', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('review-media', 'review-media', false, 52428800, array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime'])
on conflict (id) do nothing;

create policy "staff upload product media" on storage.objects for insert with check (bucket_id = 'product-media' and public.is_staff());
create policy "staff change product media" on storage.objects for update using (bucket_id = 'product-media' and public.is_staff());
create policy "staff delete product media" on storage.objects for delete using (bucket_id = 'product-media' and public.is_staff());
create policy "customers upload own review media" on storage.objects for insert with check (bucket_id = 'review-media' and auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own review media or staff" on storage.objects for select using (bucket_id = 'review-media' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff()));
create policy "staff delete review media" on storage.objects for delete using (bucket_id = 'review-media' and public.is_staff());

-- keep updated_at fresh
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
