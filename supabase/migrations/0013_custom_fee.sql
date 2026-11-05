-- A personalised product can charge an extra fee when the customer opts in.
alter table public.products add column if not exists custom_fee integer not null default 0 check (custom_fee >= 0);
-- Record the fee charged on each personalised line (the line's unit price already includes it).
alter table public.order_items add column if not exists custom_fee integer not null default 0;
