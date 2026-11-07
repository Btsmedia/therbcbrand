'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from './CartProvider';
import { Lock, Bag } from './Icons';
import { naira } from '@/lib/format';
import { totals, NG_STATES } from '@/lib/pricing';

const SHORT = { nationwide: 'Interstate in 1 to 3 days. GIG or DHL for farther places.', ife: 'Local delivery', pickup: 'Collect at our pickup point' };

const Field = ({ id, label, err, children }) => (
  <div className={`field ${err ? 'err' : ''}`}><label htmlFor={id}>{label}</label>{children}<span className="msg">{err}</span></div>
);

export default function CheckoutClient({ rates, products, email: signedEmail, canOrder, live, testMode }) {
  const { lines, ready } = useCart();
  const [f, setF] = useState({ email: signedEmail, first: '', last: '', address: '', apartment: '', city: '', state: '', phone: '', news: true });
  const [rateId, setRateId] = useState(rates[0]?.id || null);
  const [payment, setPayment] = useState('paystack');
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(null);
  const [codeErr, setCodeErr] = useState('');
  const [codeOpen, setCodeOpen] = useState(false);
  const [errs, setErrs] = useState({});
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sumOpen, setSumOpen] = useState(false);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }); setErrs({ ...errs, [k]: '' }); };

  // refresh prices from the live catalogue in case they changed since the item was added
  const priced = useMemo(() => lines.map((l) => { const p = products.find((x) => x.id === l.productId); return p ? { ...l, price: p.price, categories: p.categories } : l; }), [lines, products]);
  const rate = rates.find((r) => r.id === rateId);
  const mode = rate?.zone === 'pickup' ? 'pickup' : 'ship';
  // delivery isn't charged at checkout: the fee depends on location and weight and is confirmed afterwards
  const T = totals(priced, null, discount);
  const chooseRate = (r) => {
    setRateId(r.id);
    if (r.zone === 'ife') setF((x) => ({ ...x, state: 'Osun' }));
  };

  async function applyCode(e) {
    e.preventDefault(); setCodeErr('');
    const r = await fetch('/api/discount', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
    const j = await r.json();
    if (!r.ok) return setCodeErr(j.error);
    const eligible = priced.some((l) => !j.category || (l.categories || []).includes(j.category));
    if (!eligible) return setCodeErr(`${j.code} applies to ${j.category === 'beauty' ? 'bath & beauty' : j.category} items, and there are none in your cart.`);
    setDiscount(j); setCode('');
  }

  async function submit(e) {
    e.preventDefault();
    const er = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) er.email = 'Enter an email address like name@example.com';
    if (!f.first.trim()) er.first = 'Enter your first name';
    if (!f.last.trim()) er.last = 'Enter your last name';
    if (mode === 'ship') { if (!f.address.trim()) er.address = 'Enter your street address'; if (!f.city.trim()) er.city = 'Enter a city or area'; if (!f.state) er.state = 'Select your state';  }
    if (!/^(\+?234|0)[789][01]\d{8}$/.test(f.phone.replace(/[\s-]/g, ''))) er.phone = 'Enter a Nigerian mobile number, like 0803 123 4567';
    setErrs(er);
    if (Object.keys(er).length) { setFormErr(`Check the ${Object.keys(er).length} highlighted field${Object.keys(er).length === 1 ? '' : 's'} above.`); document.querySelector(`#co-${Object.keys(er)[0]}`)?.focus(); return; }
    if (!rate) return setFormErr('Choose how you’d like to get your order.');
    setBusy(true); setFormErr('');
    const r = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: lines.map((l) => ({ variantId: l.variantId, qty: l.qty, custom: l.custom, customPhoto: l.customPhoto })), ...f, mode, rateId, payment, code: discount?.code }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setBusy(false); return setFormErr(j.error || 'Something went wrong. Please try again.'); }
    window.location.href = j.url;
  }

  if (ready && !lines.length) return (
    <div className="wrap" style={{ paddingBlock: 80, textAlign: 'center', display: 'grid', gap: 16, justifyItems: 'center' }}>
      <h1 className="page-title">Your bag is empty</h1><Link className="btn btn-solid" href="/shop">Go to the shop</Link>
    </div>
  );

  const PAY = [
    ['paystack', 'Card, transfer or USSD', 'Pay now with Paystack', "After you select Pay now, you'll go to Paystack to finish paying securely.", live.paystack],
    ['opay', 'OPay', 'Pay from your OPay wallet or OPay card', "After you select Pay now, you'll go to OPay to approve the payment, then come back here.", live.opay],
    ['transfer', 'Bank transfer', 'Pay into our bank account', 'Pay into our bank account. The details appear once you place the order, and we hold your items for 24 hours.', true],
  ].filter(([, , , , isLive]) => isLive || testMode); // a method without live keys only shows while test payments are allowed
  const summary = (
    <div className="in">
      <div className="slines">{priced.map((l) => (
        <div className="sline" key={`${l.variantId}|${l.custom || ''}|${l.customPhoto || ''}`}><span className="thw"><span className="th tone-1"><img className="pimg" src={l.image} alt="" /></span><span className="q">{l.qty}</span></span><span><b>{l.name}</b><small>{l.colour}{l.custom ? ` · “${l.custom}”` : ''}{l.customPhoto ? ' · 📷 picture' : ''}{l.customFee > 0 ? ` · +${naira(l.customFee)} personalisation` : ''}</small></span><span className="amt">{naira(l.price * l.qty)}</span></div>
      ))}</div>
      {!discount && (codeOpen ? <form className="disc" onSubmit={applyCode} noValidate>
        <div className={`field ${codeErr ? 'err' : ''}`}><label htmlFor="coCode">Discount code</label><input id="coCode" value={code} onChange={(e) => { setCode(e.target.value); setCodeErr(''); }} autoComplete="off" autoFocus /><span className="msg">{codeErr}</span></div>
        <button className="btn btn-line" disabled={!code.trim()}>Apply</button>
      </form> : <button type="button" className="co-link" onClick={() => setCodeOpen(true)}>Have a discount code?</button>)}
      {discount && <span className="applied">{discount.code} · {discount.label}<button type="button" onClick={() => setDiscount(null)} aria-label="Remove discount">×</button></span>}
      <div className="tot">
        <div><span>Subtotal · {lines.reduce((a, l) => a + l.qty, 0)} {lines.reduce((a, l) => a + l.qty, 0) === 1 ? 'item' : 'items'}</span><span>{naira(T.subtotal)}</span></div>
        {T.discount > 0 && <div className="dsc"><span>Discount</span><span>−{naira(T.discount)}</span></div>}
        <div><span>Delivery</span><span>{mode === 'pickup' ? 'Free pickup' : <span className="hint">Sent to you on WhatsApp</span>}</span></div>
        <div className="grand"><span>Total</span><span>{naira(T.total)}</span></div>
      </div>
    </div>
  );

  return (
    <>
      <div className="co-top"><div className="wrap co-top-in"><Link className="logo" href="/shop">RBC</Link><span className="secure"><Lock /><span>Secure checkout</span></span><Link className="icon-btn" href="/shop" aria-label="Back to shopping"><Bag /></Link></div></div>
      <div className="co">
        <form className="co-main" onSubmit={submit} noValidate>
          <div className="in">
            {!canOrder && <p className="notice">The store database isn&apos;t connected yet, so this checkout is view-only.</p>}
            {canOrder && testMode && <p className="notice"><b>Test mode.</b> Payments without live keys open a test screen and no money moves.</p>}

            <div className="co-sec">
              <div className="sh"><h2>Your details</h2>{!signedEmail && <small><Link href="/account?next=/checkout" style={{ textDecoration: 'underline' }}>Sign in</Link></small>}</div>
              <Field id="co-email" label="Email" err={errs.email}><input id="co-email" type="email" autoComplete="email" inputMode="email" value={f.email} onChange={set('email')} /></Field>
              <Field id="co-phone" label="Phone (WhatsApp)" err={errs.phone}><input id="co-phone" type="tel" autoComplete="tel" inputMode="tel" value={f.phone} onChange={set('phone')} /></Field>
              <div className="row2">
                <Field id="co-first" label="First name" err={errs.first}><input id="co-first" autoComplete="given-name" value={f.first} onChange={set('first')} /></Field>
                <Field id="co-last" label="Last name" err={errs.last}><input id="co-last" autoComplete="family-name" value={f.last} onChange={set('last')} /></Field>
              </div>
            </div>

            <div className="co-sec">
              <h2>Delivery</h2>
              <div className="radios" role="radiogroup" aria-label="How you'll get your order">{rates.map((r) => (
                <label className="radio" key={r.id}><input type="radio" name="ship" checked={rateId === r.id} onChange={() => chooseRate(r)} /><span>{r.name}<small>{SHORT[r.zone] || r.description}</small></span>{r.zone === 'pickup' && <b className="hint">Free</b>}</label>
              ))}</div>
              {mode === 'ship' && <p className="co-note">The delivery fee depends on your location and package weight. We&apos;ll send it to you on WhatsApp.</p>}
              {mode === 'ship' && <>
                <Field id="co-address" label="Address (house number, street, landmark)" err={errs.address}><input id="co-address" autoComplete="street-address" value={f.address} onChange={set('address')} /></Field>
                <div className="row2">
                  <Field id="co-city" label="City / area" err={errs.city}><input id="co-city" autoComplete="address-level2" value={f.city} onChange={set('city')} /></Field>
                  <Field id="co-state" label="State" err={errs.state}><select id="co-state" autoComplete="address-level1" value={f.state} onChange={set('state')}><option value="">Select</option>{NG_STATES.map((s) => <option key={s}>{s}</option>)}</select></Field>
                </div>
              </>}
            </div>

            <div className="co-sec">
              <h2>Payment</h2>
              <div className="radios">{PAY.map(([id, name, sub, , isLive]) => (
                <label className="radio" key={id}><input type="radio" name="pay" checked={payment === id} onChange={() => setPayment(id)} /><span>{name}<small>{sub}</small></span>{!isLive && <span className="pill-s warn">Test</span>}</label>
              ))}</div>
            </div>

            <div className="co-sec">
              <p className="co-err" aria-live="polite">{formErr}</p>
              <button className="btn btn-solid paybtn" aria-busy={busy} disabled={busy || !canOrder}>{busy ? 'Placing your order…' : `${payment === 'transfer' ? 'Place order' : 'Pay'} ${naira(T.total)}`}</button>
              <p className="co-secure"><Lock /> {payment === 'transfer' ? 'You’ll see our bank details next.' : 'Secure payment by Paystack'}</p>
              <label className="chk2 co-news"><input type="checkbox" checked={f.news} onChange={set('news')} /> Send me new arrivals and offers</label>
            </div>
            <div className="co-foot"><Link href="/policies#returns">Order help</Link><Link href="/policies#delivery">Delivery</Link><Link href="/policies#privacy">Privacy policy</Link></div>
          </div>
        </form>
        <aside className={`co-side ${sumOpen ? 'open' : ''}`} aria-label="Order summary">
          <button className="co-toggle" type="button" aria-expanded={sumOpen} onClick={() => setSumOpen(!sumOpen)}><span>{sumOpen ? 'Hide order summary ▴' : 'Show order summary ▾'}</span><strong>{naira(T.total)}</strong></button>
          {summary}
        </aside>
      </div>
    </>
  );
}
