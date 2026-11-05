// The store's categories, in display order: [slug, label, short label, menu hint].
// Change them here and the menu, shop filters, admin and footer all follow.
// (The database also checks category slugs — see supabase/migrations/0015_souvenir_categories.sql.)
export const CATEGORIES = [
  ['custom', 'Personalised gifts', 'Personalised', 'Names · Photos · Logos'],
  ['drinkware', 'Mugs & bottles', 'Drinkware', 'Mugs · Bottles · Flasks'],
  ['stationery', 'Journals & stationery', 'Stationery', 'Journals · Pens · Planners'],
  ['wearables', 'Tees, caps & totes', 'Tees & totes', 'Tees · Caps · Tote bags'],
  ['keepsakes', 'Keychains & keepsakes', 'Keepsakes', 'Keychains · Magnets · Frames'],
  ['corporate', 'Corporate & events', 'Events', 'Weddings · Birthdays · Teams'],
];

export const CAT_SLUGS = CATEGORIES.map(([s]) => s);
export const CAT_LABEL = Object.fromEntries(CATEGORIES.map(([s, l]) => [s, l]));
export const catLabel = (slug) => CAT_LABEL[slug] || (slug ? slug[0].toUpperCase() + slug.slice(1) : '');
