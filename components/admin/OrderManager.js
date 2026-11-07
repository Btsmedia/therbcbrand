'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { naira } from '@/lib/format';
import { STATUS, NEXT, RANK, stepLabel, actionLabel } from '@/lib/roles';

const PAY = { paystack: 'Card (Paystack)', opay: 'OPay', transfer: 'Bank transfer', pod: 'Pay on delivery / at pickup' };
const COURIERS = ['RBC rider', 'GIG Logistics', 'DHL', 'Other'];
const when = (d) => new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Lagos' });
const waNumber = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.startsWith('234') ? d : d.startsWith('0') ? `234${d.slice(1)}` : d; };

export default function OrderManager({ initial, events, canEdit }) {
  const router = useRouter();
  const [o, setO] = useState(initial);
  const [fee, setFee] = useState(initial.delivery_fee ?? '');
  const [courier, setCourier] = useState(initial.courier || '');
  const [tracking, setTracking] = useState(initial.tracking_number || '');
  const [note, setNote] = useState(initial.staff_note || '');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const [tpl, setTpl] = useState(initial.delivery_mode === 'ship' && initial.delivery_fee == null ? 'fee' : 'status');
  const pickup = o.delivery_mode === 'pickup';
  const next = canEdit ? NEXT[o.status] || [] : [];
  const forward = next.filter((s) => s !== 'cancelled' && RANK[s] > RANK[o.status]);
  const back = next.filter((s) => s !== 'cancelled' && RANK[s] < RANK[o.status] && !(s === 'paid' && o.payment_method === 'pod'));

  const [notify, setNotify] = useState(true);
  async function save(patch, label) {
    setBusy(label); setMsg(null);
    const res = await fetch(`/api/admin/orders/${o.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...patch, notify }) });
    const j = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) return setMsg(['err', j.error || 'Couldn’t save. Please try again.']);
    setO({ ...o, ...j.order });
    setMsg(j.emailed?.startsWith('failed') ? ['err', `Saved, but the email to the customer didn’t send (${j.emailed.slice(8)}).`] : ['ok', j.emailed === 'sent' ? `Saved. ${o.first_name} has been emailed.` : 'Saved.']);
    router.refresh();
  }
  const setStatus = (s) => { if (s === 'cancelled' && !window.confirm(`Cancel order ${o.number}? Its items go back into stock. This can’t be undone.`)) return; save({ status: s }, s); };

  // progress steps
  const flow = [o.payment_method === 'transfer' ? 'paid' : o.payment_method === 'pod' ? 'pay_on_delivery' : 'paid', 'packed', 'shipped', 'delivered'];
  const order = ['awaiting_payment', 'awaiting_transfer', 'pay_on_delivery', 'paid', 'packed', 'shipped', 'delivered'];
  const reached = (s) => !['cancelled', 'failed'].includes(o.status) && order.indexOf(o.status) >= order.indexOf(s) && (s !== 'paid' || o.status !== 'pay_on_delivery');

  const itemsTotal = o.total;
  const feeNum = o.delivery_fee;
  const first = o.first_name;
  const where = [o.city, o.state].filter(Boolean).join(', ');
  const templates = {
    fee: `Hi ${first}, thank you for your RBC order ${o.number}! The delivery fee to ${where || 'your address'} is ${feeNum != null ? naira(feeNum) : '₦___'}. Please reply to confirm, and I'll share how to pay.\n\nThe RBC Brand`,
    status: {
      awaiting_transfer: `Hi ${first}, thanks for your RBC order ${o.number} (${naira(itemsTotal)}). We're waiting for your bank transfer. Please send proof of payment here once done.\n\nThe RBC Brand`,
      paid: `Hi ${first}, your RBC order ${o.number} is confirmed and we're getting it ready.\n\nThe RBC Brand`,
      pay_on_delivery: `Hi ${first}, your RBC order ${o.number} is confirmed. You'll pay ${naira(itemsTotal + (feeNum || 0))} ${pickup ? 'at pickup' : 'on delivery'}.\n\nThe RBC Brand`,
      packed: `Hi ${first}, your RBC order ${o.number} is packed${pickup ? ' and will be ready for pickup soon' : ' and goes out on the next delivery day'}.\n\nThe RBC Brand`,
      shipped: pickup ? `Hi ${first}, your RBC order ${o.number} is ready for pickup.\n\nThe RBC Brand` : `Hi ${first}, your RBC order ${o.number} is on its way${o.courier ? ` with ${o.courier}` : ''}${o.tracking_number ? `. Tracking number: ${o.tracking_number}` : ''}.\n\nThe RBC Brand`,
      delivered: `Hi ${first}, thank you for shopping with RBC! We hope you love your order ${o.number}. You can leave a review from your account on our website.\n\nThe RBC Brand`,
    }[o.status] || `Hi ${first}, this is the RBC team about your order ${o.number}.`,
  };
  const waText = tpl === 'fee' ? templates.fee : templates.status;

  return (
    <div className="om">
      <Link href="/admin/orders" className="ad-link">← All orders</Link>
      <div className="ad-head">
        <div><span className="eyebrow">Placed {when(o.created_at)}</span><h1>{o.number}</h1></div>
        <span className={`pill-s big ${STATUS[o.status]?.tone}`}>{['shipped', 'delivered'].includes(o.status) ? stepLabel(o.status, pickup) : STATUS[o.status]?.label}</span>
      </div>
      {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : 'ok'}`} role="status">{msg[1]}</p>}

      {!['cancelled', 'failed', 'awaiting_payment'].includes(o.status) && <ol className="om-steps">
        {flow.map((s) => <li key={s} className={reached(s) ? 'done' : ''}><i />{s === 'pay_on_delivery' ? 'Confirmed' : stepLabel(s, pickup)}</li>)}
      </ol>}

      <div className="om-grid">
        <div className="om-col">
          {canEdit && next.length > 0 && <section className="card-box">
            <h2 className="ad-h2">Update order</h2>
            <label className="chk2 om-notify"><input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Email {o.first_name} about status changes and the delivery fee</label>
            {o.status === 'awaiting_transfer' && <p className="hint">Check your bank app for {naira(itemsTotal)} with reference {o.number} before confirming.</p>}
            {o.status === 'awaiting_payment' && <p className="hint">Card and OPay payments confirm themselves when the customer pays. If they gave up, you can cancel the order.</p>}
            <div className="om-acts">
              {forward.map((s, i) => <button key={s} className={`btn ${i === 0 ? 'btn-solid' : 'btn-line'}`} aria-busy={busy === s} disabled={!!busy} onClick={() => setStatus(s)}>{busy === s ? 'Saving…' : actionLabel(s, pickup)}</button>)}
            </div>
            <div className="om-acts minor">
              {back.map((s) => <button key={s} className="linkish" aria-busy={busy === s} disabled={!!busy} onClick={() => setStatus(s)}>Move back to {stepLabel(s, pickup).toLowerCase()}</button>)}
              {next.includes('cancelled') && <button className="linkish danger" disabled={!!busy} onClick={() => setStatus('cancelled')}>Cancel order</button>}
            </div>
          </section>}

          {!pickup && <section className="card-box">
            <h2 className="ad-h2">Delivery fee</h2>
            <p className="hint">Customers don&apos;t pay delivery at checkout. Work it out from the location and weight, save it here, then send it to them on WhatsApp.</p>
            {canEdit ? <form className="om-inline" onSubmit={(e) => { e.preventDefault(); const n = fee === '' ? null : Math.round(Number(fee)); if (n != null && (!Number.isFinite(n) || n < 0)) return setMsg(['err', 'Enter the fee in naira, like 3500.']); save({ delivery_fee: n }, 'fee'); }}>
              <label className="lbl">Fee (₦)<input className="input" inputMode="numeric" value={fee} onChange={(e) => setFee(e.target.value.replace(/[^\d]/g, ''))} placeholder="e.g. 3500" /></label>
              <button className="btn btn-solid" aria-busy={busy === 'fee'} disabled={!!busy}>{busy === 'fee' ? 'Saving…' : 'Save fee'}</button>
            </form> : <p>{feeNum == null ? 'To be confirmed' : naira(feeNum)}</p>}
          </section>}

          <section className="card-box">
            <h2 className="ad-h2">{pickup ? 'Pickup' : 'Shipping'}</h2>
            {pickup ? <p className="muted">Customer collects at the pickup point. Send them the details on WhatsApp.</p> : canEdit ? (
              <form className="om-inline wrap2" onSubmit={(e) => { e.preventDefault(); save({ courier: courier || null, tracking_number: tracking.trim() || null }, 'track'); }}>
                <label className="lbl">Sent with<select className="select" value={courier} onChange={(e) => setCourier(e.target.value)}><option value="">Not sent yet</option>{COURIERS.map((c) => <option key={c}>{c}</option>)}</select></label>
                <label className="lbl">Tracking number <small>(GIG / DHL)</small><input className="input" value={tracking} maxLength={80} onChange={(e) => setTracking(e.target.value)} /></label>
                <button className="btn btn-line" aria-busy={busy === 'track'} disabled={!!busy}>{busy === 'track' ? 'Saving…' : 'Save'}</button>
              </form>) : <p>{o.courier || 'Not sent yet'}{o.tracking_number ? ` · ${o.tracking_number}` : ''}</p>}
          </section>

          <section className="card-box">
            <h2 className="ad-h2">Team notes</h2>
            {canEdit ? <form onSubmit={(e) => { e.preventDefault(); save({ staff_note: note.trim() || null }, 'note'); }} style={{ display: 'grid', gap: 10 }}>
              <textarea className="textarea" value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} placeholder="Only the team sees this, e.g. “Customer asked for gift wrap”" />
              <div><button className="btn btn-line" aria-busy={busy === 'note'} disabled={!!busy}>{busy === 'note' ? 'Saving…' : 'Save note'}</button></div>
            </form> : <p className="muted">{o.staff_note || 'No notes.'}</p>}
          </section>
        </div>

        <div className="om-col">
          <section className="card-box">
            <h2 className="ad-h2">Customer</h2>
            <p><b>{o.first_name} {o.last_name}</b><br /><a href={`tel:${o.phone}`}>{o.phone}</a><br /><a href={`mailto:${o.email}`}>{o.email}</a></p>
            <p className="muted"><b style={{ color: 'var(--ink)' }}>{o.delivery_name}</b><br />{pickup ? 'Pickup' : [o.address, o.apartment, o.city, o.state].filter(Boolean).join(', ')}</p>
            <div className="wa-box">
              <label className="lbl">WhatsApp message<select className="select" value={tpl} onChange={(e) => setTpl(e.target.value)}><option value="status">Order update</option>{!pickup && <option value="fee">Delivery fee</option>}</select></label>
              <p className="wa-preview">{waText}</p>
              <a className="btn btn-wa" href={`https://wa.me/${waNumber(o.phone)}?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer">Message on WhatsApp</a>
            </div>
          </section>

          <section className="card-box">
            <h2 className="ad-h2">Items</h2>
            <div className="slines">{o.order_items.map((l) => <div className="sline" key={l.id}><span className="thw"><span className="th tone-1" style={{ display: 'block' }}>{l.image && <img className="pimg" src={l.image} alt="" />}</span><span className="q">{l.qty}</span></span><span><b>{l.name}</b><small>{l.colour}{l.custom ? ` · “${l.custom}”` : ''}</small>{l.custom_photo && <a className="cust-photo" href={l.custom_photo} target="_blank" rel="noreferrer"><img src={l.custom_photo} alt="Customer picture" /><span>View picture</span></a>}{l.custom_fee > 0 && <small className="hint" style={{ display: 'block' }}>incl. {naira(l.custom_fee)} personalisation</small>}</span><span className="amt">{naira(l.price * l.qty)}</span></div>)}</div>
            <div className="tot">
              <div><span>Subtotal</span><span>{naira(o.subtotal)}</span></div>
              {o.discount > 0 && <div className="dsc"><span>Discount ({o.discount_code})</span><span>−{naira(o.discount)}</span></div>}
              <div className="grand"><span>Items total</span><span>{naira(itemsTotal)}</span></div>
              {!pickup && <div><span>Delivery fee</span><span>{feeNum == null ? <em className="fee-tbc">to confirm</em> : naira(feeNum)}</span></div>}
            </div>
            <p className="hint">Payment: {PAY[o.payment_method]}{o.paid_at ? ` · paid ${when(o.paid_at)}` : ''}<br />Reference: {o.payment_reference}</p>
          </section>

          <section className="card-box">
            <h2 className="ad-h2">History</h2>
            <ol className="timeline">{events.map((e) => (
              <li key={e.id}><b>{e.kind === 'status' ? (e.by_email === 'Customer' ? 'Order placed' : stepLabel(e.detail, pickup)) : e.kind === 'delivery_fee' ? `Delivery fee ${e.detail === 'cleared' ? 'cleared' : naira(Number(e.detail))}` : e.kind === 'email' ? `Email: ${e.detail}` : `Shipping: ${e.detail || 'cleared'}`}</b><small>{when(e.created_at)} · {e.by_email}</small></li>
            ))}{!events.length && <li><small>No history yet.</small></li>}</ol>
          </section>
        </div>
      </div>
    </div>
  );
}
