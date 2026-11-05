-- Stop fake transfer / pay-on-delivery orders from locking up stock.

-- 1. Whenever an order that was holding stock is cancelled, put the stock back.
create or replace function public.restock_on_cancel() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status in ('awaiting_transfer','pay_on_delivery','paid','packed','shipped') then
    update public.product_variants v set stock = v.stock + oi.qty
      from public.order_items oi where oi.order_id = new.id and oi.variant_id = v.id;
  end if;
  return new;
end; $$;
revoke execute on function public.restock_on_cancel() from public, anon, authenticated;
drop trigger if exists orders_restock_on_cancel on public.orders;
create trigger orders_restock_on_cancel after update of status on public.orders
  for each row when (old.status is distinct from new.status) execute function public.restock_on_cancel();

-- 2. Bank-transfer orders that are still unpaid after 24 hours are cancelled automatically
--    (which puts their stock back, via the trigger above).
--    The store runs this whenever someone checks out or staff open the orders page.
create or replace function public.cancel_stale_transfers() returns integer
language plpgsql security definer set search_path = public as $$
declare n integer;
begin
  update public.orders set status = 'cancelled'
   where status = 'awaiting_transfer' and created_at < now() - interval '24 hours';
  get diagnostics n = row_count;
  return n;
end; $$;
revoke execute on function public.cancel_stale_transfers() from public, anon, authenticated;

