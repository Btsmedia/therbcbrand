'use client';
import { useState } from 'react';

export default function NotifyForm({ reason, cta }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | busy | done
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault(); setErr('');
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr('Enter your email address.');
    setState('busy');
    const r = await fetch('/api/lock-signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, reason }) }).catch(() => null);
    const j = await r?.json().catch(() => ({}));
    if (!r?.ok) { setState('idle'); return setErr(j?.error || 'Couldn’t save that. Check your connection and try again.'); }
    setState('done');
  }

  if (state === 'done') return <p className="lk-done" role="status"><b>You’re on the list! 💜</b> We’ll email you the moment we open.</p>;
  return (
    <form className="lk-form lk-pill" onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor="lk-email">Email address</label>
      <input id="lk-email" type="email" inputMode="email" autoComplete="email" placeholder="Your email address" value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} />
      <button className="btn" aria-busy={state === 'busy'} disabled={state === 'busy'}>{state === 'busy' ? 'Saving…' : cta}</button>
      {err && <p className="lk-err" role="alert">{err}</p>}
    </form>
  );
}
