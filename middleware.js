import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Keeps the sign-in session fresh on every page load.
export async function middleware(request) {
  // The live store lives at the store: anyone opening an old vercel.app address is sent there.
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const host = request.headers.get('host') || '';
  if (process.env.VERCEL_ENV === 'production' && host.endsWith('.vercel.app') && site && !site.includes('.vercel.app')) {
    const to = new URL(request.nextUrl.pathname + request.nextUrl.search, site);
    return NextResponse.redirect(to, 308);
  }
  // tell the page layout which address is being opened (used by the store lock to keep admin, account and orders open)
  const withPath = () => {
    const h = new Headers(request.headers);
    h.set('x-pathname', request.nextUrl.pathname);
    if (request.nextUrl.searchParams.get('lockpreview') === '1') h.set('x-lock-preview', '1'); else h.delete('x-lock-preview');
    return NextResponse.next({ request: { headers: h } });
  };
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return withPath();
  let response = withPath();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = withPath();
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|img/|favicon.ico|api/paystack|api/opay).*)'] };
