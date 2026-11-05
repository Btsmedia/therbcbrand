'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CancelOrder({ id, number, transfer }) {
  const router = useRouter();
  const [step, setStep] = useState('idle'); // idle | confirm | busy
  const [err, setErr] = useState('');

  async function cancel() {
    setStep('busy'); setErr('');
    const r = await fetch(`/api/orders/${id}/cancel`, { method: 'POST' }).catch(() => null);
    const j = await r?.json().catch(() => ({}));
    if (!r?.ok) { setStep('idle'); setErr(j?.error || 'Couldn’t cancel the order. Check your connection and try again.'); if (j?.paid) router.refresh(); return; }
    router.refresh();
  }

  return (
    <div className="cx">
      {step === 'idle' && <button type="button" className="linkish" onClick={() => setStep('confirm')}>Cancel this order</button>}
      {step !== 'idle' && (
        <div className="cx-box" role="alertdialog" aria-labelledby="cx-h">
          <p id="cx-h"><b>Cancel order {number}?</b> {transfer ? 'Don’t send the transfer if you cancel. ' : ''}The items go back on sale and this can’t be undone.</p>
          <div className="cx-acts">
            <button type="button" className="btn btn-solid btn-sm cx-yes" aria-busy={step === 'busy'} disabled={step === 'busy'} onClick={cancel}>{step === 'busy' ? 'Cancelling…' : 'Yes, cancel it'}</button>
            <button type="button" className="btn btn-line btn-sm" disabled={step === 'busy'} onClick={() => setStep('idle')}>Keep my order</button>
          </div>
        </div>
      )}
      {err && <p className="co-err" role="alert">{err}</p>}
    </div>
  );
}
