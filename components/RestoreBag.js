'use client';
import Link from 'next/link';
import { useEffect } from 'react';

// Puts the saved items back in the bag (the cart lives in this browser) and opens checkout.
export default function RestoreBag({ lines, email, first }) {
  useEffect(() => {
    if (!lines.length) return;
    try {
      const cur = JSON.parse(localStorage.getItem('az_cart') || '[]');
      // keep anything already in the bag on this device; saved items replace matching lines
      const key = (l) => `${l.variantId}|${l.personalise ? 1 : 0}|${l.custom || ''}|${l.customPhoto || ''}`;
      const keys = new Set(lines.map(key));
      localStorage.setItem('az_cart', JSON.stringify([...cur.filter((l) => !keys.has(key(l))), ...lines]));
      sessionStorage.setItem('rbc_co_prefill', JSON.stringify({ email, first }));
    } catch {}
    window.location.replace('/checkout');
  }, [lines, email, first]);

  return (
    <section style={{ padding: '96px 0' }}><div className="wrap" style={{ textAlign: 'center', maxWidth: 520 }}>
      {lines.length ? (
        <><h1 style={{ fontSize: 28, marginBottom: 10 }}>Bringing back your bag…</h1><p style={{ color: 'var(--muted)' }}>One moment while we take you to checkout.</p></>
      ) : (
        <><h1 style={{ fontSize: 28, marginBottom: 10 }}>Those pieces have sold out</h1><p style={{ color: 'var(--muted)', marginBottom: 24 }}>Everything in your saved bag is out of stock now. Have a look at what’s new.</p><Link className="btn btn-solid" href="/shop">Shop new arrivals</Link></>
      )}
    </div></section>
  );
}
