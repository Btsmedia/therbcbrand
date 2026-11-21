import 'server-only';

// Saved carts only keep what's needed to rebuild the bag: which colour, how many, and any personalisation.
// Names, prices and photos are always read fresh from the catalogue.
const PHOTO_PREFIX = () => `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/custom-uploads/`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function cleanItems(raw) {
  if (!Array.isArray(raw)) return null;
  const out = [];
  for (const i of raw.slice(0, 40)) {
    if (!UUID.test(i?.variantId || '')) return null;
    const personalise = !!i.personalise;
    const photo = personalise && typeof i.customPhoto === 'string' && i.customPhoto.startsWith(PHOTO_PREFIX()) && i.customPhoto.length < 400 ? i.customPhoto : undefined;
    out.push({
      variantId: i.variantId,
      qty: Math.max(1, Math.min(50, parseInt(i.qty, 10) || 1)),
      ...(personalise ? { personalise: true, custom: String(i.custom ?? '').trim().slice(0, 80) || undefined, customPhoto: photo } : {}),
    });
  }
  return out;
}

// Rebuilds cart lines (the same shape the shop's cart uses) from live products.
// Anything no longer live or out of stock is dropped; quantities are capped at what's in stock.
export async function liveLines(db, items) {
  const ids = [...new Set((items || []).map((i) => i.variantId))];
  if (!ids.length) return [];
  const { data } = await db.from('product_variants')
    .select('id, colour, stock, products(id, slug, name, price, status, categories, personalise, custom_fee, product_images(url, position))').in('id', ids);
  const lines = [];
  for (const it of items) {
    const v = (data || []).find((x) => x.id === it.variantId);
    const p = v?.products;
    if (!p || p.status !== 'live' || v.stock <= 0) continue;
    const on = !!p.personalise && !!it.personalise;
    const fee = on ? p.custom_fee || 0 : 0;
    lines.push({
      productId: p.id, variantId: v.id, slug: p.slug, name: p.name, colour: v.colour,
      price: p.price + fee, image: (p.product_images || []).sort((a, b) => a.position - b.position)[0]?.url,
      categories: p.categories, qty: Math.min(it.qty, v.stock),
      ...(on ? { personalise: true, customFee: fee || undefined, custom: it.custom || undefined, customPhoto: it.customPhoto || undefined } : {}),
    });
  }
  return lines;
}
