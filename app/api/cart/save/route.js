import { NextResponse } from 'next/server';
import { hasSupabase, hasServiceRole } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { limited } from '@/lib/rate-limit';
import { cleanItems } from '@/lib/carts';

// Checkout calls this once the shopper has typed their email, so we can send a reminder if they don't finish.
export async function POST(req) {
  if (!hasSupabase || !hasServiceRole) return NextResponse.json({ ok: false });
  if (limited(req, 'cart-save', 30, 10 * 60 * 1000)) return NextResponse.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => null);
  const email = String(b?.email ?? '').trim().toLowerCase();
  if (email.length > 120 || !/^[a-z0-9._%+'-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) return NextResponse.json({ ok: false }, { status: 400 });
  const items = cleanItems(b?.items);
  if (!items) return NextResponse.json({ ok: false }, { status: 400 });
  // first name is only used in the greeting, so keep it to plain letters
  const first = String(b?.first ?? '').trim().slice(0, 40);
  const first_name = /^[\p{L}][\p{L} '’-]*$/u.test(first) ? first : null;

  const db = createAdminClient();
  const { data: cur } = await db.from('abandoned_carts').select('id, recovered_at, first_name').eq('email', email).maybeSingle();
  if (!items.length) {
    // emptied the bag: nothing to remind about
    if (cur) await db.from('abandoned_carts').update({ items: [], recovered_at: new Date().toISOString() }).eq('id', cur.id);
    return NextResponse.json({ ok: true });
  }
  const row = { email, items, first_name: first_name || cur?.first_name || null, updated_at: new Date().toISOString() };
  // a new shopping trip after an earlier order starts the reminders over
  if (cur?.recovered_at) Object.assign(row, { recovered_at: null, reminders: 0, last_reminded_at: null });
  const { error } = cur ? await db.from('abandoned_carts').update(row).eq('id', cur.id) : await db.from('abandoned_carts').insert(row);
  if (error) console.error('cart save', error.message);
  return NextResponse.json({ ok: !error });
}
