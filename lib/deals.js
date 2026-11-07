// The Deals section's wording and homepage picks. Shared by the store and the admin page.
export const DEAL_DEFAULTS = {
  eyebrow: 'For a limited time',
  title: 'Gifts on',
  highlight: 'offer',
  blurb: 'Selected pieces at their best prices, while stock lasts. A good moment to buy early for the next birthday.',
  cta: 'Shop the offers',
  picks: [],
};
export const MAX_PICKS = 5;
export const LIMITS = { eyebrow: 40, title: 30, highlight: 30, blurb: 220, cta: 30 };

export const pctOff = (p) => (p.compare_at && p.compare_at > p.price ? Math.round((1 - p.price / p.compare_at) * 100) : 0);

// clean anything read from the database or a form
export function cleanDeals(v = {}) {
  const out = { ...DEAL_DEFAULTS };
  for (const k of Object.keys(LIMITS)) if (typeof v[k] === 'string') out[k] = v[k].trim().slice(0, LIMITS[k]);
  out.picks = Array.isArray(v.picks) ? v.picks.filter((x) => typeof x === 'string' && /^[0-9a-f-]{36}$/i.test(x)).slice(0, MAX_PICKS) : [];
  return out;
}

// picks the owner chose first (only ones still on sale), then the biggest discounts to fill the slots
export function dealPicks(deals, picks) {
  const chosen = picks.map((id) => deals.find((p) => p.id === id)).filter(Boolean);
  const rest = deals.filter((p) => !chosen.includes(p)).sort((a, b) => pctOff(b) - pctOff(a));
  return [...chosen, ...rest].slice(0, MAX_PICKS);
}
