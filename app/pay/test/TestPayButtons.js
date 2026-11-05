'use client';
import { useState } from 'react';
export default function TestPayButtons({ orderId }) {
  const [busy, setBusy] = useState(false);
  const go = async (outcome) => {
    setBusy(true);
    await fetch('/api/payments/test-confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, outcome }) });
    window.location.href = `/order/${orderId}`;
  };
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <button className="btn btn-solid" style={{ justifyContent: 'center' }} disabled={busy} onClick={() => go('pay')}>Simulate a successful payment</button>
      <button className="btn btn-line" style={{ justifyContent: 'center' }} disabled={busy} onClick={() => go('fail')}>Simulate a failed payment</button>
    </div>
  );
}
