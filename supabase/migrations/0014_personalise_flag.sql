-- Personalisation is its own switch now, not inferred from "has a text prompt or a photo".
-- This lets a product offer text-only personalisation with the picture option turned off.
alter table public.products add column if not exists personalise boolean not null default false;
-- Keep the products that were already set up as personalised.
update public.products set personalise = true where custom_label is not null or custom_photo;
