'use client';
import { useEffect, useState } from 'react';
import { getBrowserClient, SIGNED_OUT_EVENT } from '@/lib/supabase/client';
import SignInForm from '@/components/SignInForm';

// Watches the admin sign-in. If it drops (expired, or cancelled by Supabase), a sign-in box opens
// over the page instead of saves failing with "permission denied". Signing in here keeps whatever
// is typed on the page, so the person can just press Save again.
export default function SessionGuard({ email }) {
  const [out, setOut] = useState(false);

  useEffect(() => {
    const sb = getBrowserClient();
    let alive = true;
    // getSession renews the sign-in if it's due; it comes back empty only when that's no longer possible
    const check = async () => {
      const { data } = await sb.auth.getSession();
      if (alive && !data.session) setOut(true);
    };
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) setOut(true);
      else setOut(false);
    });
    window.addEventListener(SIGNED_OUT_EVENT, check);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', onVisible);
    check();
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
      window.removeEventListener(SIGNED_OUT_EVENT, check);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!out) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="relog-title" style={{ position: 'fixed', inset: 0, zIndex: 120, display: 'grid', placeItems: 'center', padding: 16, background: 'var(--scrim, rgba(10,6,16,.45))', overflowY: 'auto' }}>
      <div style={{ width: 'min(440px, 100%)', display: 'grid', gap: 10 }}>
        <div className="card-box" style={{ display: 'grid', gap: 6 }}>
          <h2 id="relog-title" style={{ fontSize: 20, fontWeight: 600 }}>You’ve been signed out</h2>
          <p className="muted">Sign in again to keep working. Use the code from the email rather than the link, so this page stays open and nothing you’ve typed is lost.</p>
        </div>
        <SignInForm title="Sign in again" defaultEmail={email} onSignedIn={() => setOut(false)} />
        <button type="button" className="btn btn-line" style={{ justifyContent: 'center', background: 'var(--bg)' }} onClick={() => setOut(false)}>Not now (copy my changes first)</button>
      </div>
    </div>
  );
}
