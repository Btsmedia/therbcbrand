import { NextResponse } from 'next/server';
import { hasSupabase, hasServiceRole } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { limited, isUuid } from '@/lib/rate-limit';

export async function POST(req) {
  if (!hasSupabase || !hasServiceRole) return NextResponse.json({ ok: false }, { status: 503 });
  if (limited(req, 'cart-stop', 20, 10 * 60 * 1000)) return NextResponse.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => null);
  if (!isUuid(b?.token)) return NextResponse.json({ ok: false }, { status: 400 });
  const { error } = await createAdminClient().from('abandoned_carts').update({ opted_out: true }).eq('token', b.token);
  return NextResponse.json({ ok: !error });
}
