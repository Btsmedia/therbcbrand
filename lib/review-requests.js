import 'server-only';

// "Thank you, would you review it?" emails for customers whose orders were delivered.
// One email per customer, listing the products they bought and haven't reviewed yet.
// Each order is asked about once (orders.review_requested_at), so running it again only
// reaches new deliveries. People who unsubscribed from emails are left out.
const norm = (e) => String(e || '').trim().toLowerCase();

// Orders placed before this were delivered before review requests existed: they're all due at once.
// Later ones are asked WAIT_DAYS after they're marked delivered, so the customer has had time to use it.
const LAUNCH = '2026-11-22T00:00:00Z';
const WAIT_DAYS = 2;

export async function reviewQueue(db, { dueOnly = false } = {}) {
  let { data: orders } = await db.from('orders')
    .select('id, email, first_name, created_at, order_items(product_id)')
    .eq('status', 'delivered').is('review_requested_at', null).order('created_at').limit(2000);
  if (!orders?.length) return [];
  if (dueOnly) {
    const newer = orders.filter((o) => o.created_at >= LAUNCH).map((o) => o.id);
    const { data: ev } = newer.length
      ? await db.from('order_events').select('order_id, created_at').eq('kind', 'status').eq('detail', 'delivered').in('order_id', newer)
      : { data: [] };
    const cutoff = Date.now() - WAIT_DAYS * 864e5;
    const ready = new Set((ev || []).filter((e) => new Date(e.created_at).getTime() <= cutoff).map((e) => e.order_id));
    orders = orders.filter((o) => o.created_at < LAUNCH || ready.has(o.id));
    if (!orders.length) return [];
  }
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

// Emails everyone in the queue who has something to review. Each customer's orders are marked
// before their email goes out, so two runs can never ask the same person twice.
export async function sendReviewRequests(db, queue, { from, build, unsub = () => '' }) {
  const done = queue.filter((c) => c.skip || !c.products.length).flatMap((c) => c.orderIds);
  if (done.length) await db.from('orders').update({ review_requested_at: new Date().toISOString() }).in('id', done);
  const out = [];
  for (const c of queue.filter((x) => !x.skip && x.products.length)) {
    const { data: claimed } = await db.from('orders').update({ review_requested_at: new Date().toISOString() })
      .in('id', c.orderIds).is('review_requested_at', null).select('id');
    if (!claimed?.length) continue;
    const u = unsub(c.email);
    const mail = build(c, { unsubscribe: u });
    out.push({ from, to: [c.email], subject: mail.subject, html: mail.html, text: mail.text, ...(u ? { headers: { 'List-Unsubscribe': `<${u}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } } : {}), _orders: c.orderIds });
  }
  return batchSend(db, out);
}

// Resend takes up to 100 emails per batch call; a failed batch has its orders un-marked so it can be retried
export async function batchSend(db, items) {
  let sent = 0, failed = 0, error = '';
  for (let i = 0; i < items.length; i += 100) {
    const chunk = items.slice(i, i + 100);
    let ok = false;
    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk.map(({ _orders, ...m }) => m)),
      });
      ok = res.ok;
      if (!ok) error = (await res.json().catch(() => ({}))).message || `Resend error ${res.status}`;
    } catch (e) { error = e.message; }
    if (ok) sent += chunk.length;
    else {
      failed += chunk.length;
      const ids = chunk.flatMap((m) => m._orders || []);
      if (ids.length) await db.from('orders').update({ review_requested_at: null }).in('id', ids);
    }
    if (i + 100 < items.length) await new Promise((r) => setTimeout(r, 600));
  }
  return { sent, failed, error };
}
