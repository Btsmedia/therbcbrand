import { NextResponse } from 'next/server';
import { hasSupabase, hasServiceRole } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/mailer';
import { cartEmail, SITE } from '@/lib/emails';
import { liveLines } from '@/lib/carts';
import { limited } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Runs every hour (Supabase pg_cron calls it). Sends at most two reminders per bag:
// the first an hour after checkout was left, the second a day after. Each reminder is
// claimed before it's sent, so overlapping runs can never email anyone twice.
// Calling it early does nothing extra: only reminders that are already due go out.
const HOUR = 3600e3;
const STEPS = [
  { n: 1, wait: 1 * HOUR, gap: 0 },
  { n: 2, wait: 24 * HOUR, gap: 12 * HOUR },
];

async function run(req) {
  if (!hasSupabase || !hasServiceRole || !process.env.RESEND_API_KEY) return NextResponse.json({ ok: false, error: 'not set up' }, { status: 503 });
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  if (limited(req, 'cron-carts', 6, 10 * 60 * 1000)) return NextResponse.json({ ok: false }, { status: 429 });

  const db = createAdminClient();
  const now = Date.now();
  const sent = [], skipped = [];
  for (const s of STEPS) {
    const { data: due } = await db.from('abandoned_carts').select('*')
      .eq('reminders', s.n - 1).is('recovered_at', null).eq('opted_out', false)
      .lt('updated_at', new Date(now - s.wait).toISOString())
      .gt('updated_at', new Date(now - 7 * 24 * HOUR).toISOString())
      .order('updated_at').limit(40);
    for (const c of due || []) {
      if (s.gap && c.last_reminded_at && new Date(c.last_reminded_at).getTime() > now - s.gap) continue;
      // ordered since? then it isn't abandoned
      const { count } = await db.from('orders').select('id', { count: 'exact', head: true })
        .eq('email', c.email).gte('created_at', new Date(new Date(c.updated_at).getTime() - 30 * 60e3).toISOString());
      if (count) { await db.from('abandoned_carts').update({ recovered_at: new Date().toISOString() }).eq('id', c.id); skipped.push('ordered'); continue; }
      // claim it first, so a second run can't send the same reminder
      const { data: claimed } = await db.from('abandoned_carts').update({ reminders: s.n, last_reminded_at: new Date().toISOString() })
        .eq('id', c.id).eq('reminders', s.n - 1).select('id');
      if (!claimed?.length) continue;
      const lines = await liveLines(db, c.items);
      if (!lines.length) { await db.from('abandoned_carts').update({ reminders: 2 }).eq('id', c.id); skipped.push('sold out'); continue; }
      const mail = cartEmail(s.n, { first: c.first_name, lines, restoreUrl: `${SITE}/bag/${c.token}`, stopUrl: `${SITE}/bag/${c.token}/stop` });
      const r = await sendEmail({ to: c.email, ...mail });
      if (r.ok) sent.push(s.n);
      else { console.error('cart reminder failed', r.error); await db.from('abandoned_carts').update({ reminders: s.n - 1 }).eq('id', c.id); }
    }
  }
  return NextResponse.json({ ok: true, sent: sent.length, skipped: skipped.length });
}

export const GET = run;
export const POST = run;
