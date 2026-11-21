import { NextResponse } from 'next/server';
import { hasSupabase, hasServiceRole } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { FROM, reviewEmail } from '@/lib/emails';
import { reviewQueue, sendReviewRequests } from '@/lib/review-requests';
import { UNSUB } from '@/lib/review-unsub';
import { limited } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Runs daily (Supabase pg_cron calls it): asks customers for a review 2 days after their order
// is marked delivered. Calling it early does nothing extra: each order is only ever asked about once.
async function run(req) {
  if (!hasSupabase || !hasServiceRole || !process.env.RESEND_API_KEY) return NextResponse.json({ ok: false, error: 'not set up' }, { status: 503 });
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ ok: false }, { status: 401 });
  if (limited(req, 'cron-reviews', 4, 10 * 60 * 1000)) return NextResponse.json({ ok: false }, { status: 429 });
  const db = createAdminClient();
  const q = await reviewQueue(db, { dueOnly: true });
  const r = await sendReviewRequests(db, q, { from: FROM, build: reviewEmail, unsub: UNSUB });
  return NextResponse.json({ ok: true, sent: r.sent, failed: r.failed });
}
export const GET = run;
export const POST = run;
