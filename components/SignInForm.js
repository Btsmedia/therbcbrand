'use client';
import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';

export default function SignInForm({ next = '/account', title = 'Sign in' }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const [err, setErr] = useState('');
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  async function verify(e) {
    e.preventDefault();
    const token = code.replace(/\D/g, '');
    if (token.length < 6) return setErr('Enter the code from the email.');
    setChecking(true); setErr('');
    const sb = getBrowserClient();
    const { error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
    if (error) { setChecking(false); setErr('That code didn’t work. Check it, or send a new one.'); return; }
    await sb.rpc('claim_orders');
    window.location.assign(next.startsWith('/') && !next.startsWith('//') ? next : '/account');
  }
  async function send(e) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr('Enter an email address like name@example.com.');
    setState('sending'); setErr('');
    const { error } = await getBrowserClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
    if (error) { setState('idle'); setErr(error.message.includes('rate') ? 'Too many attempts. Wait a minute and try again.' : 'We couldn’t send the link. Try again.'); return; }
    setState('sent');
  }
  if (state === 'sent') return (
    <form className="card-box" onSubmit={verify} noValidate>
      <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 28 }}>Check your email</h2>
      <p className="muted">We sent a sign-in link to <b style={{ color: 'var(--ink)' }}>{email}</b>. Tap the link, or type the code from the email here.</p>
      <label className="lbl">Code<input className="input" inputMode="numeric" autoComplete="one-time-code" maxLength={10} value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" /></label>
      {err && <p className="notice err">{err}</p>}
      <button className="btn btn-solid" style={{ justifyContent: 'center' }} aria-busy={checking} disabled={checking}>{checking ? 'Checking…' : 'Sign in'}</button>
      <button type="button" className="btn btn-line" onClick={() => { setState('idle'); setCode(''); setErr(''); }}>Use a different email</button>
    </form>
  );
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
