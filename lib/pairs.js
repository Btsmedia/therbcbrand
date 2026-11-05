// Which kinds of product are usually bought together, by category.
const PAIR_CATS = {
  custom: ['custom', 'drinkware', 'stationery'],
  drinkware: ['drinkware', 'custom', 'keepsakes'],
  stationery: ['stationery', 'custom', 'drinkware'],
  wearables: ['wearables', 'keepsakes', 'custom'],
  keepsakes: ['keepsakes', 'wearables', 'custom'],
  corporate: ['corporate', 'custom', 'drinkware'],
};

export function boughtTogether(products, ids, n = 3) {
  const have = new Set(ids);
  const base = products.filter((p) => have.has(p.id));
  const score = new Map();
  base.forEach((b) => {
    (PAIR_CATS[b.category] || []).forEach((cat, w) => {
      products.forEach((p) => {
        if (have.has(p.id) || !p.variants.some((v) => v.stock > 0)) return;
        if (!p.categories.includes(cat)) return;
        let s = (3 - w) * 10 + (p.tags.includes('bestseller') ? 3 : 0);
        // prefer a different category from the item itself, so suggestions complement it
        if (p.category === b.category && w === 0) s -= 4;
        score.set(p.id, (score.get(p.id) || 0) + s);
      });
    });
  });
  return [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([id]) => products.find((p) => p.id === id));
}
