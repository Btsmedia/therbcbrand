-- Customer personalisation: a product can ask the buyer for text to print (a name, a date…).
-- products.custom_label holds the prompt (e.g. "Name to print"); null means the product isn't personalised.
alter table public.products add column if not exists custom_label text;
-- order_items.custom holds what the customer typed for that line.
alter table public.order_items add column if not exists custom text;
