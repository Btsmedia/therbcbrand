'use client';
import { createBrowserClient } from '@supabase/ssr';

export const SIGNED_OUT_EVENT = 'store:signed-out';
let client;

// Reads the bearer token on an outgoing request and says whether it belongs to a signed-in person.
// With no session, supabase-js sends the public key (or no token at all), which has no user id in it.
function hasUserToken(headers) {
  const auth = new Headers(headers || {}).get('authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  const part = token.split('.')[1];
  if (!part) return false;
  try {
    const claims = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    return !!claims.sub && claims.role !== 'anon';
  } catch { return false; }
}

const isAdminPage = () => typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
const isDataRequest = (url) => /\/(rest|storage)\/v1\//.test(url);
const signedOutReply = () => new Response(JSON.stringify({
  code: 'SIGNED_OUT',
  message: 'You’ve been signed out. Sign in again and your changes on this page will still be here.',
}), { status: 401, headers: { 'content-type': 'application/json' } });

// On admin pages, a save sent while signed out would reach the database as a stranger and be refused
// with a confusing "permission denied". Catch it before it leaves the phone and ask the person to sign in.
async function adminSafeFetch(input, init = {}) {
  const url = typeof input === 'string' ? input : input?.url || '';
  const method = (init.method || (typeof input === 'object' && input?.method) || 'GET').toUpperCase();
  const watching = isAdminPage() && isDataRequest(url);
  if (watching && method !== 'GET' && method !== 'HEAD' && !hasUserToken(init.headers || input?.headers)) {
    window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
    return signedOutReply();
  }
  const res = await fetch(input, init);
  if (watching && (res.status === 401 || res.status === 403)) window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
  return res;
}

export function getBrowserClient() {
  if (!client) client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { global: { fetch: adminSafeFetch } });
  return client;
}
