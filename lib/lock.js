// Store lock: shows a full-page "we're closed for now" screen to shoppers. Shared by the store, checkout and admin.
export const LOCK_TEMPLATES = {
  launch: {
    label: 'Launch', hint: 'Opening day countdown',
    eyebrow: 'Coming soon', title: 'Something lovely is on the way',
    message: 'Our doors open soon with home finds, beauty and gadgets picked for you. Leave your email and you’ll be first in.',
    hero: 'invite', tone: 'deep', cta: 'Tell me when it opens',
  },
  sale: {
    label: 'Upcoming sale', hint: 'Build excitement before prices drop',
    eyebrow: 'Sale loading', title: 'The big sale is almost here',
    message: 'Prices drop the moment the countdown ends. Get on the list so you can shop before your favourites sell out.',
    hero: 'paid', tone: 'accent', cta: 'Remind me when it starts',
  },
  restock: {
    label: 'Restocking', hint: 'Filling the shelves',
    eyebrow: 'Restocking', title: 'Fresh stock is landing',
    message: 'We’re unpacking new arrivals and bringing back the pieces you love. We’ll be back open shortly.',
    hero: 'packed', tone: 'soft', cta: 'Tell me when it’s back',
  },
  break: {
    label: 'Short break', hint: 'Maintenance or a day off',
    eyebrow: 'Back soon', title: 'We’re taking a short break',
    message: 'The store is closed for a little while. Existing orders are still being looked after. Message us on WhatsApp if you need anything.',
    hero: 'pickup', tone: 'deep', cta: 'Tell me when you’re back',
  },
};
export const LOCK_LIMITS = { title: 70, message: 260, badge: 40 };

export function cleanLock(v = {}) {
  const template = LOCK_TEMPLATES[v.template] ? v.template : 'launch';
  const str = (x, n) => (typeof x === 'string' ? x.trim().slice(0, n) : '');
  const until = v.until && !Number.isNaN(Date.parse(v.until)) ? new Date(v.until).toISOString() : null;
  return {
    on: v.on === true, template,
    title: str(v.title, LOCK_LIMITS.title), message: str(v.message, LOCK_LIMITS.message), badge: str(v.badge, LOCK_LIMITS.badge),
    until, autoOpen: v.autoOpen !== false, notify: v.notify !== false,
  };
}

// the lock as shoppers see it: null when the store is open (switched off, or the countdown ended with auto-open on)
export function activeLock(lock, now = Date.now()) {
  if (!lock?.on) return null;
  if (lock.until && lock.autoOpen && Date.parse(lock.until) <= now) return null;
  const t = LOCK_TEMPLATES[lock.template];
  return { ...lock, ...t, title: lock.title || t.title, message: lock.message || t.message };
}

// pages that stay open while the store is locked, so the team can work and customers can check existing orders
export const LOCK_EXEMPT = /^\/(admin|auth|account|order|pay)(\/|$)/;
