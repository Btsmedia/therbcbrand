import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/account';
  // only ever send people to a page on this site (blocks tricks like //evil.com or /\\evil.com)
  let safeNext = '/account';
  if (/^\/(?![\/\\])/.test(next) && !/[\\\s]/.test(next)) {
    const dest = new URL(next, url.origin);
    if (dest.origin === url.origin) safeNext = dest.pathname + dest.search + dest.hash;
  }
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) { await supabase.rpc('claim_orders'); return NextResponse.redirect(new URL(safeNext, url.origin)); }
  }
  return NextResponse.redirect(new URL('/account?error=link', url.origin));
}
