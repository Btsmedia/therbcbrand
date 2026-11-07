// The photo tiles on the homepage (edited at /admin/tiles):
// the three-tile collage under "Shop by category", and the two tiles under "Two places to start".
export const TILE_LIMITS = { title: 60, cta: 30, heading: 60 };

export const TILE_DEFAULTS = {
  collage: [
    { img: '/img/7236.jpg', title: 'Soft light for evenings in', cta: 'Shop lighting', href: '/shop?cat=lighting' },
    { img: '/img/7254.jpg', title: 'A calmer bathroom shelf', cta: 'Shop bath & beauty', href: '/shop?cat=beauty' },
    { img: '/img/7259.jpg', title: 'A place for everything', cta: 'Shop storage', href: '/shop?cat=storage' },
  ],
  edits: [
    { img: '/img/7234.jpg', title: 'Set up for content', cta: 'Shop gadgets', href: '/shop?cat=gadgets' },
    { img: '/img/7272.jpg', title: 'Pack light, arrive fresh', cta: 'Shop travel minis', href: '/shop?cat=beauty' },
  ],
  editsOn: true,
  editsHeading: 'Two places to start',
};

// Links that stay inside the store; anything else falls back to the shop
export const TILE_LINKS = [
  ['/shop', 'All products'], ['/shop?sort=new', 'New arrivals'], ['/shop?sale=1', 'Deals'],
  ['/shop?cat=beauty', 'Bath & beauty'], ['/shop?cat=gadgets', 'Gadgets'], ['/shop?cat=kitchen', 'Kitchen'],
  ['/shop?cat=lighting', 'Lighting'], ['/shop?cat=storage', 'Storage'], ['/shop?cat=decor', 'Decor'],
];

const str = (v, max, fallback) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : fallback);
const okHref = (h) => typeof h === 'string' && /^\/(?![\/\\])[A-Za-z0-9\-._~/?=&%]*$/.test(h) && h.length <= 200;
const okImg = (u) => typeof u === 'string' && u.length <= 500 && (/^\/(img|products)\/[\w.-]+$/.test(u) || /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/product-media\/[\w./-]+$/.test(u));

function cleanTile(t, d) {
  const v = t && typeof t === 'object' ? t : {};
  return {
    img: okImg(v.img) ? v.img : d.img,
    title: str(v.title, TILE_LIMITS.title, d.title),
    cta: str(v.cta, TILE_LIMITS.cta, d.cta),
    href: okHref(v.href) ? v.href : d.href,
  };
}

export function cleanTiles(v) {
  const o = v && typeof v === 'object' ? v : {};
  const D = TILE_DEFAULTS;
  return {
    collage: D.collage.map((d, i) => cleanTile(o.collage?.[i], d)),
    edits: D.edits.map((d, i) => cleanTile(o.edits?.[i], d)),
    editsOn: o.editsOn !== false,
    editsHeading: str(o.editsHeading, TILE_LIMITS.heading, D.editsHeading),
  };
}
