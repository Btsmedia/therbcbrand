'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// Floating "chat with us" button. Opens WhatsApp with a message that already says which page the customer was on.
export default function WhatsAppButton({ number }) {
  const path = usePathname();
  const [title, setTitle] = useState('');
  const [hint, setHint] = useState(false);
  const [cat, setCat] = useState(null);

  useEffect(() => { setTitle(document.title.split(' · ')[0]); setCat(new URLSearchParams(window.location.search).get('cat')); });
  // a small "Need help?" label shows once per visit after a few seconds, then tucks away
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem('az-wa-hint') === '1'; } catch {}
    if (seen) return;
    const a = setTimeout(() => setHint(true), 6000);
    const b = setTimeout(() => { setHint(false); try { sessionStorage.setItem('az-wa-hint', '1'); } catch {} }, 14000);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  const digits = String(number || '').replace(/\D/g, '');
  if (!digits || path.startsWith('/admin') || path.startsWith('/checkout') || path.startsWith('/pay')) return null;

  // enquiry-style openers, so the chat starts with what the customer wants to know
  const CATS = { beauty: 'bath & beauty', gadgets: 'gadgets', kitchen: 'kitchen', lighting: 'lighting', storage: 'storage', decor: 'decor' };
  const msg = path.startsWith('/product/') && title
    ? `Hi, I'm interested in the ${title}. Is it available, and how much would delivery be to my area?`
    : path.startsWith('/order/') || path.startsWith('/account')
      ? 'Hi, I have a question about my RBC order. My order number is '
      : path.startsWith('/shop') && CATS[cat]
        ? `Hi, I'm looking at your ${CATS[cat]} items and I'd like to ask about prices, availability and delivery.`
        : "Hi, I'd like to make an enquiry about some RBC items. Could you tell me what's available and how delivery works?";
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;

  return (
    <a className={`wa-fab ${hint ? 'hint' : ''}`} href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat with The RBC Brand on WhatsApp">
      <span className="wa-tip" aria-hidden="true">Questions? Chat with us</span>
      <svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3C8.8 3 3 8.7 3 15.8c0 2.5.7 4.9 2 7L3 29l6.4-2c2 1.1 4.3 1.7 6.6 1.7 7.2 0 13-5.7 13-12.8S23.2 3 16 3zm0 23.4c-2.1 0-4.1-.6-5.9-1.7l-.4-.3-3.8 1.2 1.2-3.7-.3-.4c-1.2-1.8-1.9-3.9-1.9-6 0-5.9 4.9-10.6 11-10.6s11 4.8 11 10.6-4.9 10.9-10.9 10.9zm6-7.9c-.3-.2-2-1-2.3-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.3-.7.1-.3-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6-.1-.2-.8-1.8-1-2.5-.3-.6-.5-.6-.8-.6h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.7s1.2 3.2 1.4 3.4c.2.2 2.4 3.6 5.8 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 2-.8 2.2-1.6.3-.8.3-1.4.2-1.6-.1-.1-.3-.2-.6-.4z" /></svg>
    </a>
  );
}
