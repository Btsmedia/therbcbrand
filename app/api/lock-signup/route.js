import { NextResponse } from 'next/server';
import { hasSupabase, hasServiceRole } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { limited } from '@/lib/rate-limit';
import { getLock } from '@/lib/catalog';
import { LOCK_TEMPLATES } from '@/lib/lock';

// "Notify me" on the lock screen. Saves the email once per reason; nothing is sent until the team emails the list.
export async function POST(req) {
  if (!hasSupabase || !hasServiceRole) return NextResponse.json({ error: 'Signups aren’t available right now.' }, { status: 503 });
  if (limited(req, 'lock-signup', 5, 10 * 60 * 1000)) return NextResponse.json({ error: 'Too many tries. Please wait a few minutes.' }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const email = String(b.email || '').trim().toLowerCase();
  if (email.length > 120 || !/^[a-z0-9._%+'-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  const lock = await getLock();
  const reason = LOCK_TEMPLATES[b.reason] ? b.reason : lock.template;
  const { error } = await createAdminClient().from('lock_signups').upsert({ email, reason }, { onConflict: 'email,reason', ignoreDuplicates: true });
  if (error) return NextResponse.json({ error: 'Couldn’t save that. Please try again.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
