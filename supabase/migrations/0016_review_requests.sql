-- when the customer was emailed asking for a review of this order (once per order)
alter table public.orders add column if not exists review_requested_at timestamptz;
