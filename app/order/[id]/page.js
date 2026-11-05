import Link from 'next/link';
import { notFound } from 'next/navigation';
import { hasSupabase, hasServiceRole, paystackLive, opayLive } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { paystackVerify, opayStatus } from '@/lib/payments';
import { naira } from '@/lib/format';
import ClearCart from '@/components/ClearCart';
import TransferBox from '@/components/TransferBox';
import CancelOrder from '@/components/CancelOrder';
import { bankDetails } from '@/lib/emails';
import { emailOrder } from '@/lib/mailer';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your order', robots: { index: false } };

const STEPS = [['paid', 'Confirmed'], ['packed', 'Packed'], ['shipped', 'On its way'], ['delivered', 'Delivered']];

export default async function OrderPage({ params, searchParams }) {
  const { id } = await params; const sp = await searchParams;
  if (!hasSupabase || !hasServiceRole || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = createAdminClient();
  let { data: o } = await db.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
  if (!o) notFound();

  // returning from Paystack or OPay: confirm with them before showing "paid"
  if (o.status === 'awaiting_payment' && o.payment_reference) {
    let r = null;
    if (sp.verify === 'paystack' && paystackLive) { r = await paystackVerify(o.payment_reference); if (r.currency !== 'NGN') r = null; }
    if (sp.verify === 'opay' && opayLive) r = await opayStatus(o.payment_reference);
    if (r?.ok) { const { data: res } = await db.rpc('mark_order_paid', { p_order: o.id, p_reference: o.payment_reference, p_amount_kobo: r.amountKobo }); if (res === 'paid') { o = { ...o, status: 'paid' }; await emailOrder(o.id, 'paid'); } }
  }

  const ok = ['paid', 'packed', 'shipped', 'delivered', 'awaiting_transfer', 'pay_on_delivery'].includes(o.status);
  const stepIdx = Math.max(0, STEPS.findIndex(([s]) => s === o.status));
  const head = o.status === 'cancelled' ? 'This order is cancelled' : ok ? `Thank you, ${o.first_name}!` : o.status === 'failed' ? 'Payment didn’t go through' : 'Waiting for payment';
  const canCancel = ['awaiting_payment', 'awaiting_transfer', 'failed'].includes(o.status);
  const PAY = { paystack: 'Card, transfer or USSD (Paystack)', opay: 'OPay', transfer: 'Direct bank transfer', pod: o.delivery_mode === 'pickup' ? 'Pay at pickup' : 'Pay on delivery' };

  return (
    <div className="wrap">
      {ok && <ClearCart />}
      <div className="ord">
        <div className="head">
          <span className="ok">{ok ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12l5 5 9-10" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 7v6M12 17h.01" /></svg>}</span>
          <div><span className="eyebrow">Order {o.number}</span><h1>{head}</h1></div>
        </div>
        {o.status === 'awaiting_transfer' && <TransferBox amount={o.total} amountLabel={naira(o.total)} reference={o.number} bank={bankDetails()} whatsapp={`https://wa.me/${String(process.env.WHATSAPP_NUMBER || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I’ve paid ${naira(o.total)} for my order ${o.number}. Here’s my receipt.`)}`} />}
        {o.status === 'awaiting_payment' && <div className="proto">We haven’t received confirmation of your payment yet. If you’ve paid, refresh this page in a minute. <Link href="/checkout" style={{ textDecoration: 'underline' }}>Try again</Link></div>}
        {o.status === 'failed' && <div className="proto">No money was taken. <Link href="/shop" style={{ textDecoration: 'underline' }}>Return to the store</Link> and try again, or choose another payment method.</div>}
        {o.status === 'cancelled' && <div className="proto">Nothing is owed on this order. <Link href="/shop" style={{ textDecoration: 'underline' }}>Back to the store</Link> if you’d like to order again.</div>}
        {canCancel && <CancelOrder id={o.id} number={o.number} transfer={o.status === 'awaiting_transfer'} />}
        {ok && <div className="box"><h2>Your order is confirmed</h2><p>We’ve received your order and we’re getting it ready. A confirmation is on its way to <b style={{ color: 'var(--ink)' }}>{o.email}</b>.</p>
          <div className="otrack">{STEPS.map(([s, l], i) => <div key={s} className={['paid', 'packed', 'shipped', 'delivered'].includes(o.status) && i <= stepIdx ? 'on' : ''}><i />{l}</div>)}</div></div>}
        <div className="box"><h2>Order details</h2><div className="g2">
          <div><h3>Contact</h3><p>{o.email}<br />{o.phone}</p></div>
          <div><h3>Payment</h3><p>{PAY[o.payment_method]}<br />{naira(o.total)}</p></div>
          <div><h3>{o.delivery_mode === 'pickup' ? 'Pickup' : 'Delivery address'}</h3><p>{o.first_name} {o.last_name}<br />{o.delivery_mode === 'pickup' ? 'We’ll send you the pickup point on WhatsApp.' : [o.address, o.apartment, o.city, o.state].filter(Boolean).join(', ')}</p></div>
          <div><h3>Delivery</h3><p>{o.delivery_name}<br />{o.delivery_mode === 'pickup' ? 'No delivery fee' : o.delivery_fee != null ? `Delivery fee: ${naira(o.delivery_fee)}` : 'Delivery fee: we’ll confirm it on WhatsApp'}{o.courier ? <><br />Sent with {o.courier}{o.tracking_number ? ` · ${o.tracking_number}` : ''}</> : null}</p></div>
        </div></div>
        <div className="box">
          <div className="slines">{o.order_items.map((l) => <div className="sline" key={l.id}><span className="thw"><span className="th tone-1" style={{ display: 'block' }}>{l.image && <img className="pimg" src={l.image} alt="" />}</span><span className="q">{l.qty}</span></span><span><b>{l.name}</b><small>{l.colour}{l.custom ? ` · “${l.custom}”` : ''}</small>{l.custom_photo && <a className="cust-photo" href={l.custom_photo} target="_blank" rel="noreferrer"><img src={l.custom_photo} alt="Customer picture" /><span>View picture</span></a>}{l.custom_fee > 0 && <small className="hint" style={{ display: 'block' }}>incl. {naira(l.custom_fee)} personalisation</small>}</span><span className="amt">{naira(l.price * l.qty)}</span></div>)}</div>
          <div className="tot"><div><span>Subtotal</span><span>{naira(o.subtotal)}</span></div>{o.discount > 0 && <div className="dsc"><span>Discount ({o.discount_code})</span><span>−{naira(o.discount)}</span></div>}{o.delivery_mode === 'ship' && <div><span>Delivery fee</span><span>{o.delivery_fee != null ? naira(o.delivery_fee) : 'To be confirmed'}</span></div>}<div className="grand"><span>{o.delivery_mode === 'ship' ? 'Items total' : 'Total'}</span><span><small>NGN</small>{naira(o.total)}</span></div></div>
        </div>
        <div className="acts"><span className="hint"><Link href="/account" style={{ textDecoration: 'underline' }}>Sign in with {o.email}</Link> to track this order and review your items once they arrive.</span><Link className="btn btn-solid" href="/shop">Continue shopping</Link></div>
      </div>
    </div>
  );
}
