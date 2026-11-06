import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Sign-in links from the email land here. Unlike /auth/callback, this works even when the
// link opens in a different browser or app than the one that asked for it.
export async function GET(request) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') || 'email';
  const next = url.searchParams.get('next') || '/account';
  let safeNext = '/account';
  if (/^\/(?![\/\\])/.test(next) && !/[\\\s]/.test(next)) {
    const dest = new URL(next, url.origin);
    if (dest.origin === url.origin) safeNext = dest.pathname + dest.search + dest.hash;
  }
  if (token_hash && ['email', 'magiclink', 'signup'].includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) { await supabase.rpc('claim_orders'); return NextResponse.redirect(new URL(safeNext, url.origin)); }
  }
  return NextResponse.redirect(new URL('/account?error=link', url.origin));
}
