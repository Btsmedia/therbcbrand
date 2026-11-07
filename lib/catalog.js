import 'server-only';
import { hasSupabase } from './config';
import { createClient } from './supabase/server';
import { SEED_PRODUCTS, CATEGORIES } from './seed-data';

export { CATEGORIES };

function fromSeed(p) {
  return {
    id: p.id, slug: p.slug, name: p.name, price: p.price, compare_at: p.compare_at,
    category: p.category, categories: p.categories, tags: p.tags, badge: p.badge,
    description: p.description, care: p.care, images: [p.image],
    variants: p.variants.map((v, i) => ({ id: `${p.id}-${i}`, ...v })),
    rating: 0, reviewCount: 0, position: p.position, created_at: null,
  };
}

function normalise(row, ratings) {
  const r = ratings[row.id] || { sum: 0, n: 0 };
  return {
    id: row.id, slug: row.slug, name: row.name, price: row.price, compare_at: row.compare_at,
    category: row.category, categories: row.categories || [row.category], tags: row.tags || [], badge: row.badge,
    description: row.description, care: row.care, personalise: !!row.personalise, customLabel: row.custom_label || null, customPhoto: !!row.custom_photo, customFee: row.custom_fee || 0,
    images: (row.product_images || []).sort((a, b) => a.position - b.position).map((i) => i.url),
    variants: (row.product_variants || []).sort((a, b) => a.position - b.position).map((v) => ({ id: v.id, colour: v.colour, hex: v.hex, stock: v.stock })),
    rating: r.n ? r.sum / r.n : 0, reviewCount: r.n, position: row.position, created_at: row.created_at,
  };
}

const SELECT = 'id, slug, name, price, compare_at, category, categories, tags, badge, description, care, personalise, custom_label, custom_photo, custom_fee, position, created_at, status, product_images(url, position), product_variants(id, colour, hex, stock, position)';

async function ratingsMap(supabase) {
  const { data } = await supabase.from('reviews').select('product_id, rating').eq('status', 'approved');
  const m = {};
  (data || []).forEach((r) => { (m[r.product_id] ||= { sum: 0, n: 0 }); m[r.product_id].sum += r.rating; m[r.product_id].n++; });
  return m;
}

export async function getProducts() {
  if (!hasSupabase) return SEED_PRODUCTS.map(fromSeed);
  const supabase = await createClient();
  const [{ data, error }, ratings] = await Promise.all([
    supabase.from('products').select(SELECT).eq('status', 'live').order('position'),
    ratingsMap(supabase),
  ]);
  if (error) { console.error(error); return []; }
  return data.map((r) => normalise(r, ratings));
}

export async function getProduct(slug) {
  if (!hasSupabase) { const p = SEED_PRODUCTS.find((x) => x.slug === slug); return p ? fromSeed(p) : null; }
  const supabase = await createClient();
  const { data } = await supabase.from('products').select(SELECT).eq('slug', slug).maybeSingle();
  if (!data) return null;
  const ratings = await ratingsMap(supabase);
  return normalise(data, ratings);
}

// wording + homepage picks for the Deals section (edited at /admin/deals)
export async function getDealSettings() {
  const { cleanDeals } = await import('./deals');
  if (!hasSupabase) return cleanDeals();
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'deals').maybeSingle();
  return cleanDeals(data?.value);
}

// the announcement bar at the top of the store (edited at /admin/announcement)
export async function getAnnouncement() {
  const { cleanAnnouncement } = await import('./announcement');
  if (!hasSupabase) return cleanAnnouncement();
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'announcement').maybeSingle();
  return cleanAnnouncement(data?.value);
}

// store lock settings (edited at /admin/lock)
export async function getLock() {
  const { cleanLock } = await import('./lock');
  // local design preview only (no database): LOCK_DEMO=launch|sale|restock|break
  if (!hasSupabase) return cleanLock(process.env.LOCK_DEMO ? { on: true, template: process.env.LOCK_DEMO, badge: process.env.LOCK_DEMO === 'sale' ? 'Up to 40% off' : '', until: new Date(Date.now() + 2.6 * 864e5).toISOString() } : {});
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'lock').maybeSingle();
  return cleanLock(data?.value);
}

// homepage product spotlight (edited at /admin/spotlight)
export async function getSpotlight() {
  const { cleanSpotlight } = await import('./spotlight');
  if (!hasSupabase) return cleanSpotlight();
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'spotlight').maybeSingle();
  return cleanSpotlight(data?.value);
}

// store policies page (edited at /admin/policies)
export async function getPolicies() {
  const { cleanPolicies } = await import('./policies');
  if (!hasSupabase) return cleanPolicies();
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'policies').maybeSingle();
  return cleanPolicies(data?.value);
}

// homepage photo tiles (edited at /admin/tiles)
export async function getHomeTiles() {
  const { cleanTiles } = await import('./home-tiles');
  if (!hasSupabase) return cleanTiles();
  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('value').eq('key', 'home_tiles').maybeSingle();
  return cleanTiles(data?.value);
}
