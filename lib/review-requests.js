import 'server-only';

// "Thank you, would you review it?" emails for customers whose orders were delivered.
// One email per customer, listing the products they bought and haven't reviewed yet.
// Each order is asked about once (orders.review_requested_at), so running it again only
// reaches new deliveries. People who unsubscribed from emails are left out.
const norm = (e) => String(e || '').trim().toLowerCase();

export async function reviewQueue(db) {
  const { data: orders } = await db.from('orders')
    .select('id, email, first_name, created_at, order_items(product_id)')
    .eq('status', 'delivered').is('review_requested_at', null).order('created_at').limit(2000);
  if (!orders?.length) return [];
  const [{ data: gone }, { data: reviews }, { data: profiles }] = await Promise.all([
    db.from('email_unsubscribes').select('email').limit(10000).then((r) => r, () => ({ data: [] })),
    db.from('reviews').select('product_id, user_id').limit(20000),
    db.from('profiles').select('id, email').limit(20000),
  ]);
  const out = new Set((gone || []).map((r) => norm(r.email)));
  const emailOf = Object.fromEntries((profiles || []).map((p) => [p.id, norm(p.email)]));
  const reviewed = new Set((reviews || []).map((r) => `${emailOf[r.user_id]}|${r.product_id}`));

  const people = new Map();
  for (const o of orders) {
    const email = norm(o.email);
    const c = people.get(email) || { email, first: '', orderIds: [], productIds: new Set(), skip: out.has(email) };
    c.first = (o.first_name || '').trim() || c.first; // the latest order's name wins
    c.orderIds.push(o.id);
    (o.order_items || []).forEach((i) => { if (i.product_id && !reviewed.has(`${email}|${i.product_id}`)) c.productIds.add(i.product_id); });
    people.set(email, c);
  }

  const ids = [...new Set([...people.values()].flatMap((c) => [...c.productIds]))];
  const { data: prods } = ids.length
    ? await db.from('products').select('id, slug, name, status, product_images(url, position)').in('id', ids)
    : { data: [] };
  const byId = Object.fromEntries((prods || []).filter((p) => p.status === 'live').map((p) => [p.id, {
    slug: p.slug, name: p.name, image: (p.product_images || []).sort((a, b) => a.position - b.position)[0]?.url || '',
  }]));
  return [...people.values()].map((c) => ({
    email: c.email, first: tidyName(c.first), orderIds: c.orderIds, skip: c.skip,
    products: [...c.productIds].map((id) => byId[id]).filter(Boolean).slice(0, 8),
  }));
}

// "OPEYEMI" → "Opeyemi", "emmanuel" → "Emmanuel"; anything odd is dropped
function tidyName(n) {
  const s = String(n || '').trim().split(/\s+/)[0] || '';
  if (!/^[\p{L}][\p{L}'’-]{0,29}$/u.test(s)) return '';
  return s[0].toUpperCase() + s.slice(1).toLowerCase();
}
