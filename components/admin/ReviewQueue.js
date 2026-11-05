'use client';
import Link from 'next/link';
import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import Stars from '../Stars';
import { fmtDate } from '@/lib/format';

export default function ReviewQueue({ reviews, status }) {
  const [rows, setRows] = useState(reviews);
  const [err, setErr] = useState('');
  async function decide(r, next) {
    setErr('');
    const reason = next === 'rejected' ? (document.getElementById(`why-${r.id}`)?.value || '').trim() || null : null;
    const { error } = await getBrowserClient().from('reviews').update({ status: next, reject_reason: reason }).eq('id', r.id);
    if (error) return setErr(`Couldn’t update the review: ${error.message}`);
    setRows(rows.filter((x) => x.id !== r.id));
  }
  return (
    <>
      <h1>Reviews</h1>
      <div className="tabs">{[['pending', 'Waiting'], ['approved', 'Published'], ['rejected', 'Rejected']].map(([k, l]) => <Link key={k} className="tab" aria-selected={status === k} href={`/admin/reviews?status=${k}`}>{l}</Link>)}</div>
      <p className="hint">Only customers who paid for the product can submit a review. Check photos and videos before approving: nothing shows in the store until you do.</p>
      {err && <p className="notice err">{err}</p>}
      {!rows.length && <p className="muted">{status === 'pending' ? 'No reviews waiting. Nice.' : 'Nothing here yet.'}</p>}
      <div className="rq">{rows.map((r) => (
        <article className="rq-item" key={r.id}>
          <div className="row-between"><span><Link href={`/product/${r.products?.slug}`} target="_blank" style={{ fontWeight: 600 }}>{r.products?.name}</Link> <span className="hint">· {fmtDate(r.created_at)}</span></span><Stars value={r.rating} label={`${r.rating} out of 5`} /></div>
          {r.title && <b>{r.title}</b>}
          <p>{r.body}</p>
          <span className="hint">{r.author_name}{r.city ? ` · ${r.city}` : ''}</span>
          {r.media.length > 0 && <div className="rv-media">{r.media.map((m) => m.url ? (m.kind === 'video'
            ? <video key={m.id} src={m.url} controls playsInline style={{ width: 220, height: 160, borderRadius: 6, background: '#000' }} />
            : <a key={m.id} href={m.url} target="_blank" rel="noreferrer"><img src={m.url} alt="Customer upload" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 6 }} /></a>) : null)}</div>}
          {r.status === 'rejected' && r.reject_reason && <p className="hint">Reason: {r.reject_reason}</p>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {r.status !== 'approved' && <button className="btn btn-solid" style={{ height: 40 }} onClick={() => decide(r, 'approved')}>Approve</button>}
            {r.status !== 'rejected' && <><input id={`why-${r.id}`} className="input" style={{ height: 40, maxWidth: 280 }} placeholder="Reason (optional, for your records)" /><button className="btn btn-line" style={{ height: 40 }} onClick={() => decide(r, 'rejected')}>Reject</button></>}
            {r.status !== 'pending' && <button className="btn btn-line" style={{ height: 40 }} onClick={() => decide(r, 'pending')}>Move back to waiting</button>}
          </div>
        </article>
      ))}</div>
    </>
  );
}
