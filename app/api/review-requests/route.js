import { NextResponse } from 'next/server';
import { hasServiceRole } from '@/lib/config';
import { getUserAndRole } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { can } from '@/lib/roles';
import { FROM, reviewEmail } from '@/lib/emails';
import { reviewQueue } from '@/lib/review-requests';

export const runtime = 'nodejs';
export const maxDuration = 60;

const unsub = () => ''; // RBC has no newsletter list yet, so there's no unsubscribe link

// GET: who would get a review request right now. POST { mode: 'test' } sends one sample to you,
// POST { mode: 'send' } emails everyone waiting (each order is marked first, so nobody gets it twice).
async function team() {
  const { user, role } = await getUserAndRole();
  if (!user) return { error: NextResponse.json({ error: 'Your sign-in has expired. Reload the page and sign in again.' }, { status: 401 }) };
  if (!can(role).catalog) return { error: NextResponse.json({ error: 'Your role can’t send review requests.' }, { status: 403 }) };
  if (!hasServiceRole || !process.env.RESEND_API_KEY) return { error: NextResponse.json({ error: 'Email isn’t set up on the server yet.' }, { status: 503 }) };
  return { user };
}

export async function GET() {
  const t = await team(); if (t.error) return t.error;
  const q = await reviewQueue(createAdminClient());
  const ready = q.filter((c) => !c.skip && c.products.length);
  return NextResponse.json({ customers: ready.length, orders: ready.reduce((a, c) => a + c.orderIds.length, 0), list: ready.map((c) => ({ first: c.first, products: c.products.map((p) => p.name) })) });
}

export async function POST(req) {
  const t = await team(); if (t.error) return t.error;
  const b = await req.json().catch(() => ({}));
  if (!['test', 'send'].includes(b.mode)) return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  const db = createAdminClient();
  const q = await reviewQueue(db);
  const ready = q.filter((c) => !c.skip && c.products.length);

  if (b.mode === 'test') {
    const sample = ready[0];
    if (!sample) return NextResponse.json({ error: 'Nobody is waiting for a review request, so there’s nothing to preview.' }, { status: 400 });
    const mail = reviewEmail({ ...sample, email: t.user.email });
    const r = await send([{ from: FROM, to: [t.user.email], subject: `[Test] ${mail.subject}`, html: mail.html, text: mail.text }]);
    return r.failed ? NextResponse.json({ error: r.error || 'The test didn’t send.' }, { status: 502 }) : NextResponse.json({ ok: true, to: t.user.email });
  }

  // customers who unsubscribed or have nothing left to review: mark their orders so they don't come up again
  const done = q.filter((c) => c.skip || !c.products.length).flatMap((c) => c.orderIds);
  if (done.length) await db.from('orders').update({ review_requested_at: new Date().toISOString() }).in('id', done);
  if (!ready.length) return NextResponse.json({ error: 'Nobody is waiting for a review request.' }, { status: 400 });

  const out = [];
  for (const c of ready) {
    // claim this customer's orders first; if another send already did, skip them
    const { data: claimed } = await db.from('orders').update({ review_requested_at: new Date().toISOString() })
      .in('id', c.orderIds).is('review_requested_at', null).select('id');
    if (!claimed?.length) continue;
    const u = unsub(c.email);
    const mail = reviewEmail(c, { unsubscribe: u });
    out.push({ from: FROM, to: [c.email], subject: mail.subject, html: mail.html, text: mail.text, ...(u ? { headers: { 'List-Unsubscribe': `<${u}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } } : {}), _orders: c.orderIds });
  }
  const r = await send(out);
  return NextResponse.json({ ok: true, sent: r.sent, failed: r.failed, error: r.failed ? r.error : undefined });
}

// Resend takes up to 100 emails per batch call; a failed batch has its orders un-marked so it can be retried
async function send(items) {
  let sent = 0, failed = 0, error = '';
  const db = createAdminClient();
  for (let i = 0; i < items.length; i += 100) {
    const chunk = items.slice(i, i + 100);
    try {
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk.map(({ _orders, ...m }) => m)),
      });
      if (res.ok) sent += chunk.length;
      else { failed += chunk.length; error = (await res.json().catch(() => ({}))).message || `Resend error ${res.status}`; }
    } catch (e) { failed += chunk.length; error = e.message; }
    if (failed) {
      const ids = chunk.flatMap((m) => m._orders || []);
      if (ids.length) await db.from('orders').update({ review_requested_at: null }).in('id', ids);
    }
    if (i + 100 < items.length) await new Promise((r) => setTimeout(r, 600));
  }
  return { sent, failed, error };
}
