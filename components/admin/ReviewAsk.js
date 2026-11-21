'use client';
import { useEffect, useState } from 'react';

// "Ask buyers for a review": emails everyone whose order was delivered and hasn't been asked yet.
export default function ReviewAsk() {
  const [info, setInfo] = useState(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState('');
  const load = () => fetch('/api/review-requests').then((r) => r.json()).then(setInfo).catch(() => setInfo({ error: 'Couldn’t load.' }));
  useEffect(() => { load(); }, []);
  const go = async (mode) => {
    if (mode === 'send' && !confirm(`Email ${info.customers} customer${info.customers === 1 ? '' : 's'} asking for a review? This can’t be undone.`)) return;
    setBusy(mode); setMsg('');
    const r = await fetch('/api/review-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode }) });
    const j = await r.json().catch(() => ({}));
    setBusy('');
    setMsg(!r.ok ? j.error || 'Something went wrong.' : mode === 'test' ? `Test sent to ${j.to}.` : `Sent to ${j.sent} customer${j.sent === 1 ? '' : 's'}${j.failed ? `, ${j.failed} failed: ${j.error}` : ''}.`);
    if (mode === 'send') load();
  };
  if (!info) return null;
  if (info.error && !('customers' in info)) return null;
  return (
    <div className="card" style={{ padding: 18, marginBottom: 20 }}>
      <h3 style={{ margin: '0 0 6px', fontSize: 17 }}>Ask buyers for a review</h3>
      <p className="hint" style={{ margin: '0 0 12px' }}>
        {info.customers
          ? `${info.customers} customer${info.customers === 1 ? ' is' : 's are'} waiting: their order was delivered and they haven’t been asked yet. Each gets one thank-you email with a link to review what they bought.`
          : 'Everyone with a delivered order has been asked. New deliveries show up here.'}
      </p>
      {info.customers > 0 && (
        <details style={{ marginBottom: 12 }}><summary className="hint" style={{ cursor: 'pointer' }}>See who</summary>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13.5 }}>{info.list.map((c, i) => <li key={i}>{c.first || 'Customer'}: {c.products.join(', ')}</li>)}</ul>
        </details>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-line" disabled={!!busy || !info.customers} onClick={() => go('test')}>{busy === 'test' ? 'Sending…' : 'Send me a test'}</button>
        <button className="btn btn-solid" disabled={!!busy || !info.customers} onClick={() => go('send')}>{busy === 'send' ? 'Sending…' : `Send to ${info.customers || 0}`}</button>
      </div>
      {msg && <p className="hint" style={{ marginTop: 10 }} role="status">{msg}</p>}
    </div>
  );
}
