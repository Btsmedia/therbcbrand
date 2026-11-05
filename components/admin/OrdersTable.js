'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { naira, fmtDate } from '@/lib/format';
import { STATUS, NEXT, stepLabel, shortAction, forwardSteps } from '@/lib/roles';

const TABS = [['open', 'Open'], ['awaiting_transfer', 'Confirm transfer'], ['to_pack', 'To pack'], ['packed', 'Packed'], ['shipped', 'Shipped'], ['fee', 'Fee to confirm'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled'], ['', 'All']];
const PAY = { paystack: 'Card (Paystack)', opay: 'OPay', transfer: 'Bank transfer', pod: 'Pay on delivery' };

export default function OrdersTable({ orders, status, q, canEdit, error }) {
  const router = useRouter();
  const [rows, setRows] = useState(orders);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(error ? ['err', error] : null);
  const [search, setSearch] = useState(q);

  async function update(o, next) {
    if (next === 'cancelled' && !window.confirm(`Cancel order ${o.number}? Its items go back into stock.`)) return;
    setBusy(o.id); setMsg(null);
    const res = await fetch(`/api/admin/orders/${o.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }) });
    const j = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) return setMsg(['err', `Couldn’t update ${o.number}: ${j.error || 'please try again'}`]);
    setRows(rows.map((r) => (r.id === o.id ? { ...r, status: next } : r)));
    setMsg(['ok', `${o.number} is now ${stepLabel(next, o.delivery_mode === 'pickup').toLowerCase()}.${j.emailed === 'sent' ? ' Customer emailed.' : j.emailed ? ' (Email didn’t send.)' : ''}`]);
    router.refresh();
  }
  const go = (s, query = search) => router.push(`/admin/orders?${new URLSearchParams({ ...(s ? { status: s } : {}), ...(query ? { q: query } : {}) })}`);

  return (
    <>
      <div className="ad-head"><h1>Orders</h1>
        <form className="ad-search" onSubmit={(e) => { e.preventDefault(); go(status); }} role="search">
          <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order no., name, phone or email" aria-label="Search orders" />
          {q && <button type="button" className="btn btn-line" onClick={() => { setSearch(''); go(status, ''); }}>Clear</button>}
        </form></div>
      <div className="tabs ad-tabs">{TABS.map(([k, l]) => <button key={k} className="tab" aria-selected={status === k} onClick={() => go(k)}>{l}</button>)}</div>
      {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : 'ok'}`} role="status">{msg[1]}</p>}
      {!rows.length && <div className="card-box"><p className="muted">{q ? `No orders match “${q}”.` : 'No orders here right now.'}</p></div>}

      <div className="olist">{rows.map((o) => { const pickup = o.delivery_mode === 'pickup'; const next = canEdit ? NEXT[o.status] || [] : []; return (
        <article key={o.id} className="orow">
          <Link href={`/admin/orders/${o.id}`} className="orow-main">
            <span className="orow-top"><b>{o.number}</b><span className={`pill-s ${STATUS[o.status]?.tone}`}>{['shipped', 'delivered'].includes(o.status) ? stepLabel(o.status, pickup) : STATUS[o.status]?.label}</span></span>
            <span className="orow-name">{o.first_name} {o.last_name} <small>· {o.phone}</small></span>
            <span className="orow-meta">{fmtDate(o.created_at)} · {o.order_items.reduce((a, i) => a + i.qty, 0)} item(s) · {PAY[o.payment_method]}</span>
            <span className="orow-meta">{o.delivery_name}{o.city ? ` · ${o.city}` : ''}{o.state ? `, ${o.state}` : ''}{!pickup && <> · {o.delivery_fee == null ? <em className="fee-tbc">fee to confirm</em> : `delivery ${naira(o.delivery_fee)}`}</>}</span>
          </Link>
          <div className="orow-side">
            <b className="orow-total">{naira(o.total)}</b>
            {forwardSteps(o.status, next).length > 0 && <div className="orow-acts">
              {forwardSteps(o.status, next).slice(0, 1).map((s) => (
                <button key={s} className="btn btn-solid" aria-busy={busy === o.id} disabled={busy === o.id} onClick={() => update(o, s)}>{busy === o.id ? 'Saving…' : shortAction(s, pickup)}</button>
              ))}
              <Link className="btn btn-line" href={`/admin/orders/${o.id}`}>Open</Link>
            </div>}
            {!forwardSteps(o.status, next).length && <Link className="btn btn-line" href={`/admin/orders/${o.id}`}>Open</Link>}
          </div>
        </article>
      ); })}</div>
    </>
  );
}
