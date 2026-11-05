'use client';
import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';

export default function SignInForm({ next = '/account', title = 'Sign in' }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [err, setErr] = useState('');
  async function send(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter an email address like name@example.com.');
    setState('sending'); setErr('');
    const { error } = await getBrowserClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    if (error) { setState('idle'); setErr(error.message.includes('rate') ? 'Too many attempts. Wait a minute and try again.' : 'We couldn’t send the link. Try again.'); return; }
    setState('sent');
  }
  if (state === 'sent') return <div className="card-box"><h2 style={{ fontFamily: 'var(--f-display)', fontSize: 28 }}>Check your email</h2><p className="muted">We sent a sign-in link to <b style={{ color: 'var(--ink)' }}>{email}</b>. Open it on this device to continue.</p><button className="btn btn-line" onClick={() => setState('idle')}>Use a different email</button></div>;
  return (
    <form className="card-box" onSubmit={send} noValidate>
      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 28 }}>{title}</h2>
      <p className="muted">No password needed. Enter the email you order with and we&apos;ll send you a sign-in link.</p>
      <label className="lbl">Email<input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      {err && <p className="notice err">{err}</p>}
      <button className="btn btn-solid" style={{ justifyContent: 'center' }} aria-busy={state === 'sending'} disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Email me a sign-in link'}</button>
    </form>
  );
}
