// Generates supabase/migrations/0002_seed.sql from lib/seed-data.js
import fs from 'node:fs';
import { SEED_PRODUCTS } from '../lib/seed-data.js';
const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`);
const arr = (a) => `array[${a.map(q).join(',')}]::text[]`;
let sql = '-- Starter catalogue, delivery rates and discount codes.\n\n';
for (const p of SEED_PRODUCTS) {
  sql += `with p as (insert into public.products (legacy_id, slug, name, description, care, price, compare_at, category, categories, tags, badge, status, position)
  values (${q(p.id)}, ${q(p.slug)}, ${q(p.name)}, ${q(p.description)}, ${q(p.care)}, ${p.price}, ${p.compare_at ?? 'null'}, ${q(p.category)}, ${arr(p.categories)}, ${arr(p.tags)}, ${q(p.badge)}, 'live', ${p.position}) returning id),
img as (insert into public.product_images (product_id, url, position) select id, ${q(p.image)}, 0 from p)
insert into public.product_variants (product_id, colour, hex, stock, position) select p.id, v.colour, v.hex, v.stock, v.pos from p, (values ${p.variants.map((v, i) => `(${q(v.colour)}, ${q(v.hex)}, ${v.stock}, ${i})`).join(', ')}) as v(colour, hex, stock, pos);\n\n`;
}
sql += `insert into public.delivery_rates (zone, name, description, price, free_over, position) values
  ('lagos', 'Lagos standard', '1–2 working days', 3500, 150000, 0),
  ('lagos', 'Lagos express', 'Same day when ordered before 12 noon', 7500, null, 1),
  ('nationwide', 'Nationwide standard', '3–5 working days', 6500, null, 2),
  ('nationwide', 'Nationwide express', '2–3 working days', 12000, null, 3),
  ('pickup', 'Studio pickup', 'Usually ready in 24 hours. Address sent with your confirmation.', 0, null, 4);

insert into public.discount_codes (code, percent, category, label) values
  ('AZALEA10', 10, null, '10% off your order'),
  ('GLOW15', 15, 'beauty', '15% off bath & beauty');
`;
fs.writeFileSync('supabase/migrations/0002_seed.sql', sql);
console.log('ok', sql.length);
