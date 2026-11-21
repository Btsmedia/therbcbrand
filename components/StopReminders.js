'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function StopReminders({ token }) {
  const [state, setState] = useState('ask');
  const stop = async () => {
    setState('busy');
    const r = await fetch('/api/cart/stop', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) }).catch(() => null);
    setState(r?.ok ? 'done' : 'error');
  };
  return (
    <section style={{ padding: '96px 0' }}><div className="wrap" style={{ textAlign: 'center', maxWidth: 520 }}>
      {state === 'done' ? (
        <><h1 style={{ fontSize: 28, marginBottom: 10 }}>Reminders stopped</h1><p style={{ color: 'var(--muted)', marginBottom: 24 }}>We won’t email you about bags you leave at checkout. Order emails still come as normal.</p><Link className="btn btn-solid" href="/shop">Back to the shop</Link></>
      ) : (
        <><h1 style={{ fontSize: 28, marginBottom: 10 }}>Stop bag reminders?</h1><p style={{ color: 'var(--muted)', marginBottom: 24 }}>We’ll stop emailing you when you leave items at checkout.</p>
          <button className="btn btn-solid" onClick={stop} disabled={state === 'busy'}>{state === 'busy' ? 'One moment…' : 'Stop reminders'}</button>
          {state === 'error' && <p style={{ color: 'var(--muted)', marginTop: 14 }}>That didn’t work. Please try again.</p>}</>
      )}
    </div></section>
  );
}
