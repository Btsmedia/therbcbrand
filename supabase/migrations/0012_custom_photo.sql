-- Personalised products can also let the customer upload a picture to print.
alter table public.products add column if not exists custom_photo boolean not null default false;
alter table public.order_items add column if not exists custom_photo text;

-- Bucket for customer-uploaded pictures. Public read (filenames are random UUIDs), and writes happen
-- only through the server (service role), so there's no public insert policy to abuse.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('custom-uploads', 'custom-uploads', true, 6291456, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
