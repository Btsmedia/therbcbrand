-- Starter catalogue, delivery rates and discount codes.

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b1', 'phone-led-fill-light', 'Phone LED Fill Light', 'Slim rechargeable LED panel that clips onto your phone. Adjustable brightness for selfies, calls and live videos.', 'Charge fully before first use. Wipe with a dry cloth.', 5500, null, 'lighting', array['lighting','gadgets']::text[], array['new']::text[], null, 'live', 0) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7270.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('White', '#F7F7F5', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b2', 'z6-selfie-stick-tripod', 'Z6 Selfie Stick Tripod', 'Extendable selfie stick that opens into a tripod, with a Bluetooth remote. Fits most phones.', 'Fold gently. Keep the remote charged.', 12000, null, 'gadgets', array['gadgets']::text[], array['bestseller']::text[], null, 'live', 1) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7234.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Ink', '#34333A', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b3', 'l16-selfie-stick-tripod', 'L16 Selfie Stick Tripod', 'Tall extendable tripod with a stable base and Bluetooth remote. Good for content, calls and group photos.', 'Extend and fold section by section.', 16500, null, 'gadgets', array['gadgets']::text[], array['new']::text[], 'Trending', 'live', 2) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7235.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Ink', '#34333A', 2, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b4', 'sunset-projection-lamp', 'Sunset Projection Lamp', 'LED atmosphere lamp that casts a warm sunset glow on your wall. Adjustable head, USB powered.', 'Do not look directly into the light. Dust with a dry cloth.', 11500, null, 'lighting', array['lighting','decor']::text[], array['new']::text[], null, 'live', 3) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7236.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Ink', '#34333A', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b5', 'rechargeable-hair-trimmer', 'Rechargeable Hair Trimmer', 'Cordless trimmer with guide combs for lining and touch-ups. USB rechargeable.', 'Brush out hair after each use. Oil the blade now and then.', 13500, null, 'beauty', array['beauty']::text[], array[]::text[], null, 'live', 4) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7237.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Ink', '#34333A', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b6', 'mini-wireless-speaker', 'Mini Wireless Speaker', 'Pocket-size Bluetooth speaker with a carry strap. Rechargeable.', 'Keep away from water. Charge with the cable included.', 9500, null, 'gadgets', array['gadgets']::text[], array['new','bestseller']::text[], null, 'live', 5) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7242.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Blush', '#E2B9B9', 18, 0), ('Mint', '#9ED3C3', 18, 1)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b7', 'glow-in-the-dark-star-stickers', 'Glow-in-the-Dark Star Stickers', 'Peel-and-stick stars and moons that glow softly after the lights go off. Pack of assorted sizes.', 'Stick on clean, dry walls or ceilings.', 3000, null, 'decor', array['decor']::text[], array[]::text[], null, 'live', 6) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7243.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Mint', '#9ED3C3', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b8', 'digital-kitchen-scale', 'Digital Kitchen Scale', 'Electronic scale with a tare button, for baking and portioning. Battery powered.', 'Wipe clean. Do not immerse in water.', 9000, null, 'kitchen', array['kitchen']::text[], array['bestseller']::text[], null, 'live', 7) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7244.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('White', '#F7F7F5', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b9', 'heated-straightening-brush', 'Heated Straightening Brush', 'Brush-style straightener with temperature control. Smooths as you comb.', 'Unplug and let it cool before storing. Clean bristles gently.', 18000, null, 'beauty', array['beauty']::text[], array['bestseller']::text[], 'Trending', 'live', 8) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7246.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Ink', '#34333A', 18, 0), ('White', '#F7F7F5', 18, 1)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b10', 'foldable-1000w-hair-dryer', 'Foldable 1000W Hair Dryer', 'Compact 1000 W dryer with a folding handle. Light enough for travel.', 'Clear the air vent of lint regularly.', 12500, 15000, 'beauty', array['beauty']::text[], array[]::text[], null, 'live', 9) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7247.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Cobalt', '#3E5A8C', 18, 0), ('Rose', '#D98AA0', 18, 1)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b11', 'hand-pull-food-chopper-2-l', 'Hand-Pull Food Chopper, 2 L', 'Pull-cord chopper with sharp blades for onions, peppers, garlic and herbs. No electricity needed.', 'Blades are sharp. Hand wash the bowl and blades.', 10500, null, 'kitchen', array['kitchen']::text[], array['new','bestseller']::text[], null, 'live', 10) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7248.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Mint', '#9ED3C3', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b12', 'waist-trainer-belt', 'Waist Trainer Belt', 'Adjustable compression belt to wear under or over clothes.', 'Hand wash in cool water and air dry.', 8500, null, 'beauty', array['beauty']::text[], array[]::text[], null, 'live', 11) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7249.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Ink', '#34333A', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b13', 'plush-bath-towel-set', 'Plush Bath Towel Set', 'Soft, thick microfibre towels. Quick to dry and very absorbent.', 'Machine wash warm. Avoid fabric softener to keep them absorbent.', 15000, null, 'beauty', array['beauty']::text[], array['new']::text[], null, 'live', 12) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7254.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Oat', '#D9CBB2', 18, 0), ('Lilac', '#B9A6E0', 18, 1)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b14', 'fabric-storage-wardrobe', 'Fabric Storage Wardrobe', 'Freestanding wardrobe with hanging rail and shelves, covered in fabric with a zip front. 130 × 45 × 175 cm.', 'Assemble on a flat floor. Wipe the cover clean.', 38000, 45000, 'storage', array['storage']::text[], array['bestseller']::text[], null, 'live', 13) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7259.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('White', '#F7F7F5', 3, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b15', 'travel-toothbrush-case', 'Travel Toothbrush Case', 'Ribbed case that holds a toothbrush and paste, and doubles as a rinsing cup.', 'Rinse and dry after use.', 2500, null, 'beauty', array['beauty','storage']::text[], array[]::text[], null, 'live', 14) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7266.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Mint', '#9ED3C3', 18, 0), ('White', '#F7F7F5', 18, 1)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b16', 'smart-warm-belt', 'Smart Warm Belt', 'Rechargeable heated waist wrap with adjustable warmth. Wear around the waist or lower back.', 'Remove the heating unit before washing the wrap.', 16000, null, 'beauty', array['beauty']::text[], array[]::text[], null, 'live', 15) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7268.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Rose', '#D98AA0', 18, 0), ('Cobalt', '#3E5A8C', 18, 1)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('b17', 'desk-phone-holder-stand', 'Desk Phone Holder Stand', 'Adjustable stand with a weighted base and phone clamp. Good for calls, recipes and live videos.', 'Wipe clean.', 6500, null, 'gadgets', array['gadgets']::text[], array[]::text[], null, 'live', 16) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7269.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('White', '#F7F7F5', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('a1', 'led-cube-light-with-clip', 'LED Cube Light with Clip', 'Rechargeable LED panel with a clip-on mount. Charges by USB or Type-C. Three light tones.', 'Charge fully before first use. Wipe with a dry cloth.', 8500, null, 'lighting', array['lighting']::text[], array['new','bestseller']::text[], null, 'live', 17) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7271.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('White', '#F7F7F5', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('a2', 'refillable-perfume-atomizer', 'Refillable Perfume Atomizer', 'Aluminium shell with a glass inner bottle. Refills from the base in seconds. About 5 ml.', 'Rinse with warm water between scents.', 4500, null, 'beauty', array['beauty']::text[], array['new']::text[], null, 'live', 18) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7272.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Silver', '#C9CCD3', 18, 0), ('Cobalt', '#3E5A8C', 18, 1), ('Rose', '#D98AA0', 18, 2)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('a3', 'mini-travel-hair-straightener', 'Mini Travel Hair Straightener', 'Ceramic plates that heat up in about a minute. Comes in a clear travel case.', 'Unplug and let it cool before packing away.', 9500, null, 'beauty', array['beauty']::text[], array['new']::text[], null, 'live', 19) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7273.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Yellow', '#F2C94C', 18, 0), ('Lilac', '#B9A6E0', 18, 1)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('a4', '5-in-1-facial-cleansing-massager', '5-in-1 Facial Cleansing Massager', 'Five swappable heads: cleansing brush, sponge, pumice, massage roller and soft brush. Battery powered.', 'Rinse the heads after each use and let them air dry.', 14000, null, 'beauty', array['beauty']::text[], array['bestseller']::text[], 'Trending', 'live', 20) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7278.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Rose', '#D98AA0', 4, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('a5', 'honeycomb-ice-cube-tray-with-lid', 'Honeycomb Ice Cube Tray with Lid', 'Food-grade silicone tray with a fitted lid. Makes 37 small cubes.', 'Dishwasher safe. Press from the base to release cubes.', 6500, null, 'kitchen', array['kitchen']::text[], array['new']::text[], null, 'live', 21) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7281.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Yellow', '#F2C94C', 18, 0), ('White', '#F7F7F5', 18, 1)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('a6', 'wireless-led-puck-lights-set-of-3', 'Wireless LED Puck Lights, Set of 3', 'Battery-powered stick-on lights with a remote, timer and dimmer. No wiring needed.', 'Uses AAA batteries. Mount on clean, dry surfaces.', 15500, 18500, 'lighting', array['lighting','storage']::text[], array['bestseller']::text[], null, 'live', 22) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7283.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('White', '#F7F7F5', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('a7', 'automatic-toothpaste-dispenser', 'Automatic Toothpaste Dispenser', 'Wall-mounted squeezer with five brush slots. Sticks on without drilling.', 'Wipe clean weekly. Remove toothpaste cap before fitting.', 11000, null, 'beauty', array['beauty','storage']::text[], array[]::text[], null, 'live', 23) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7284.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('White', '#F7F7F5', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('a8', 'portable-water-flosser', 'Portable Water Flosser', 'Rechargeable oral irrigator with three modes and a refillable tank. USB charging.', 'Empty the tank after use and dry it upside down.', 22000, 26000, 'beauty', array['beauty']::text[], array['bestseller']::text[], null, 'live', 24) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7285.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Sage', '#A9B9A2', 18, 0), ('Rose', '#D98AA0', 18, 1)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('a9', 'expandable-wooden-peg-rack', 'Expandable Wooden Peg Rack', 'Natural wood accordion rack with 13 pegs. Opens up to about 1 metre wide.', 'Dust with a dry cloth. Hang with the screws included.', 9000, null, 'decor', array['decor','storage']::text[], array['new']::text[], null, 'live', 25) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7289.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Natural wood', '#D8B98A', 18, 0)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('a10', 'travel-jewellery-box', 'Travel Jewellery Box', 'Zip-around faux-leather case with ring rolls, earring slots and a necklace hook.', 'Wipe with a damp cloth.', 7500, null, 'storage', array['storage','beauty']::text[], array[]::text[], null, 'live', 26) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7304.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Blush', '#E2B9B9', 18, 0), ('Mint', '#9ED3C3', 18, 1)) as v(colour, hex, stock, pos);

with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values ('a11', 'smart-led-temperature-flask', 'Smart LED Temperature Flask', 'Double-walled stainless steel. Tap the lid to show the drink temperature. About 500 ml.', 'Hand wash only. Keep the lid out of water.', 12500, null, 'kitchen', array['kitchen']::text[], array['new','bestseller']::text[], 'Trending', 'live', 27) returning id),
img as (insert into public.product_images (product_id, url, position) select id, '/img/7317.jpg', 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ('Navy', '#1F2A4D', 18, 0), ('Red', '#C0392B', 18, 1)) as v(colour, hex, stock, pos);

insert into public.delivery_rates (zone, name, description, price, free_over, position) values
  ('lagos', 'Lagos standard', '1–2 working days', 3500, 150000, 0),
  ('lagos', 'Lagos express', 'Same day when ordered before 12 noon', 7500, null, 1),
  ('nationwide', 'Nationwide standard', '3–5 working days', 6500, null, 2),
  ('nationwide', 'Nationwide express', '2–3 working days', 12000, null, 3),
  ('pickup', 'Studio pickup', 'Usually ready in 24 hours. Address sent with your confirmation.', 0, null, 4);

insert into public.discount_codes (code, percent, category, label) values
  ('AZALEA10', 10, null, '10% off your order'),
  ('GLOW15', 15, 'beauty', '15% off bath & beauty');
