// Short reassurance shown right under the buy buttons.
const ITEMS = [
  ['Secure payment', 'Card, bank transfer or USSD'],
  ['Pay for your items now', 'We send your delivery fee on WhatsApp'],
  ['Nationwide delivery', 'Delivered in 1–3 days, or local pickup'],
  ['Real help, fast', 'Chat with us on WhatsApp'],
];

export default function TrustList({ productName, whatsapp }) {
  const num = String(whatsapp || '').replace(/\D/g, '');
  const wa = num ? `https://wa.me/${num}?text=${encodeURIComponent(`Hi, I have a question about the ${productName}.`)}` : null;
  return (
    <div className="pdp-trust">
      <ul>{ITEMS.map(([t, s]) => <li key={t}><span className="pt-dot" aria-hidden="true" /><span><b>{t}</b><small>{s}</small></span></li>)}</ul>
      {wa && <a className="pt-ask" href={wa} target="_blank" rel="noopener noreferrer">Questions about this item? Ask the RBC team on WhatsApp</a>}
    </div>
  );
}
