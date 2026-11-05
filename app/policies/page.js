export const metadata = { title: 'Policies' };
export default function Policies() {
  return (
    <div className="wrap page-pad" style={{ maxWidth: 760 }}>
      <h1 className="page-title">Store policies</h1>
      <p className="notice" style={{ margin: '12px 0 28px' }}>Draft wording. RBC should review these before launch.</p>
      <section id="delivery" style={{ padding: '0 0 28px' }}><h2 className="display" style={{ fontSize: 30 }}>Delivery</h2><ul className="muted pol-list"><li><b>Nationwide delivery.</b> Interstate delivery takes 1–3 days. For farther locations we ship with GIG or DHL.</li><li><b>Local delivery.</b> We&apos;ll confirm your delivery day on WhatsApp.</li><li><b>Pickup.</b> Collect your order in person. We&apos;ll send you the pickup point.</li><li><b>Delivery fees.</b> Fees depend on your location and the weight of your package, so they aren&apos;t charged at checkout. We confirm your fee on WhatsApp after you order, and you pay it separately.</li></ul></section>
      <section id="returns" style={{ padding: '0 0 28px' }}><h2 className="display" style={{ fontSize: 30 }}>Help with an order</h2><p className="muted">If there&apos;s a problem with your order, message us on WhatsApp with your order number and we&apos;ll help sort it out.</p></section>
      <section id="privacy" style={{ padding: '0 0 28px' }}><h2 className="display" style={{ fontSize: 30 }}>Privacy</h2><p className="muted">We use your name, contact details and address only to process and deliver your orders, and to send updates you&apos;ve asked for. Payments are handled by Paystack or OPay; we never see or store your card details. You can ask us to see or delete your data at any time.</p></section>
    </div>
  );
}
