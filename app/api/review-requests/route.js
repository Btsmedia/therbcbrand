import { NextResponse } from 'next/server';
import { hasServiceRole } from '@/lib/config';
import { getUserAndRole } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { can } from '@/lib/roles';
import { FROM, reviewEmail } from '@/lib/emails';
import { reviewQueue, sendReviewRequests, batchSend } from '@/lib/review-requests';
import { UNSUB } from '@/lib/review-unsub';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Admin: GET shows who's waiting for a review request (sent automatically 2 days after delivery).
// POST { mode: 'test' } sends one sample to you; { mode: 'send' } asks everyone waiting right now.
async function team() {
  const { user, role } = await getUserAndRole();
  if (!user) return { error: NextResponse.json({ error: 'Your sign-in has expired. Reload the page and sign in again.' }, { status: 401 }) };
  if (!can(role).catalog) return { error: NextResponse.json({ error: 'Your role can’t send review requests.' }, { status: 403 }) };
  if (!hasServiceRole || !process.env.RESEND_API_KEY) return { error: NextResponse.json({ error: 'Email isn’t set up on the server yet.' }, { status: 503 }) };
  return { user };
}

export async function GET() {
  const t = await team(); if (t.error) return t.error;
  const ready = (await reviewQueue(createAdminClient())).filter((c) => !c.skip && c.products.length);
  return NextResponse.json({ customers: ready.length, list: ready.map((c) => ({ first: c.first, products: c.products.map((p) => p.name) })) });
}

export async function POST(req) {
  const t = await team(); if (t.error) return t.error;
  const b = await req.json().catch(() => ({}));
  if (!['test', 'send'].includes(b.mode)) return NextResponse.json({ error: 'Bad request.' }, { status: 400 });
  const db = createAdminClient();
  const q = await reviewQueue(db);
  if (b.mode === 'test') {
    const sample = q.find((c) => !c.skip && c.products.length);
    if (!sample) return NextResponse.json({ error: 'Nobody is waiting for a review request, so there’s nothing to preview.' }, { status: 400 });
    const mail = reviewEmail({ ...sample, email: t.user.email });
    const r = await batchSend(db, [{ from: FROM, to: [t.user.email], subject: `[Test] ${mail.subject}`, html: mail.html, text: mail.text }]);
    return r.failed ? NextResponse.json({ error: r.error || 'The test didn’t send.' }, { status: 502 }) : NextResponse.json({ ok: true, to: t.user.email });
  }
  if (!q.some((c) => !c.skip && c.products.length)) return NextResponse.json({ error: 'Nobody is waiting for a review request.' }, { status: 400 });
  const r = await sendReviewRequests(db, q, { from: FROM, build: reviewEmail, unsub: UNSUB });
  return NextResponse.json({ ok: true, sent: r.sent, failed: r.failed, error: r.failed ? r.error : undefined });
}
