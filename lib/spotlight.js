// The "Product spotlight" section on the homepage (edited at /admin/spotlight).
export const SPOT_LIMITS = { eyebrow: 40, blurb: 400, cta: 30 };
// Before anything is saved, the homepage keeps showing what it always did.
export const SPOT_DEFAULTS = { on: true, slug: '', eyebrow: 'Product spotlight', blurb: '', cta: 'See details & reviews' };

const str = (v, max, fallback = '') => (typeof v === 'string' ? v.trim().slice(0, max) : fallback);

export function cleanSpotlight(v) {
  if (!v || typeof v !== 'object') return { ...SPOT_DEFAULTS };
  const slug = typeof v.slug === 'string' && /^[a-z0-9-]{1,120}$/.test(v.slug) ? v.slug : '';
  return {
    on: v.on !== false && !!slug,
    slug,
    eyebrow: str(v.eyebrow, SPOT_LIMITS.eyebrow, SPOT_DEFAULTS.eyebrow) || SPOT_DEFAULTS.eyebrow,
    blurb: str(v.blurb, SPOT_LIMITS.blurb),
    cta: str(v.cta, SPOT_LIMITS.cta, SPOT_DEFAULTS.cta) || SPOT_DEFAULTS.cta,
  };
}
