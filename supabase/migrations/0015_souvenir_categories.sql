-- RBC sells souvenirs and gifts: swap the Azalea home-goods categories for souvenir ones.
alter table public.products drop constraint if exists products_category_check;
alter table public.products add constraint products_category_check
  check (category in ('custom','drinkware','stationery','wearables','keepsakes','corporate'));
alter table public.products alter column category set default 'custom';
notify pgrst, 'reload schema';
