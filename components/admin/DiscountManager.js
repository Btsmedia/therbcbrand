'use client';
import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { fmtDate } from '@/lib/format';
import { CATEGORIES } from '@/lib/categories';

const CATS = [['', 'Whole order'], ...CATEGORIES.map(([s, l]) => [s, l])];

export default function DiscountManager({ codes }) {
  const [rows, setRows] = useState(codes);
  const [f, setF] = useState({ code: '', percent: '10', category: '', expires: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const sb = getBrowserClient();

  async function add(e) {
    e.preventDefault(); setMsg(null);
    const code = f.code.trim().toUpperCase();
    const percent = parseInt(f.percent, 10);
    if (!/^[A-Z0-9]{3,20}$/.test(code)) return setMsg(['err', 'Use 3–20 letters or numbers, no spaces.']);
    if (!(percent >= 1 && percent <= 90)) return setMsg(['err', 'Discount must be between 1% and 90%.']);
    const cat = CATS.find(([k]) => k === f.category)?.[1];
    const row = { code, percent, category: f.category || null, label: f.category ? `${percent}% off ${cat.toLowerCase()}` : `${percent}% off your order`, active: true, expires_at: f.expires ? new Date(`${f.expires}T23:59:59+01:00`).toISOString() : null };
    setBusy(true);
    const { error } = await sb.from('discount_codes').insert(row);
    setBusy(false);
    if (error) return setMsg(['err', error.code === '23505' ? 'That code already exists.' : error.message]);
    setRows([...rows, row].sort((a, b) => a.code.localeCompare(b.code)));
    setF({ code: '', percent: '10', category: '', expires: '' });
    setMsg(['ok', `${code} is live.`]);
  }
  async function toggle(r) {
    const { error } = await sb.from('discount_codes').update({ active: !r.active }).eq('code', r.code);
    if (error) return setMsg(['err', error.message]);
    setRows(rows.map((x) => (x.code === r.code ? { ...x, active: !x.active } : x)));
  }

  return (
    <>
      <div className="ad-head"><h1>Discount codes</h1></div>
      <section className="card-box">
        <h2 className="ad-h2">New code</h2>
        <form className="om-inline wrap2" onSubmit={add}>
          <label className="lbl">Code<input className="input" value={f.code} maxLength={20} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="e.g. FRIDAY10" /></label>
          <label className="lbl">% off<input className="input" inputMode="numeric" value={f.percent} onChange={(e) => setF({ ...f, percent: e.target.value.replace(/\D/g, '') })} /></label>
          <label className="lbl">Applies to<select className="select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label className="lbl">Ends <small>(optional)</small><input className="input" type="date" value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} /></label>
          <button className="btn btn-solid" aria-busy={busy} disabled={busy}>{busy ? 'Creating…' : 'Create'}</button>
        </form>
        {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : 'ok'}`} role="status">{msg[1]}</p>}
      </section>
      <section className="card-box">
        <h2 className="ad-h2">All codes</h2>
        {!rows.length && <p className="muted">No codes yet.</p>}
        <div className="mini-list">{rows.map((r) => { const expired = r.expires_at && new Date(r.expires_at) < new Date(); return (
          <div key={r.code} className="team-row">
            <span><b>{r.code}</b><small>{r.label}{r.expires_at ? ` · ${expired ? 'ended' : 'ends'} ${fmtDate(r.expires_at)}` : ''}</small></span>
            <span className="r"><span className={`pill-s ${r.active && !expired ? 'good' : ''}`}>{expired ? 'Ended' : r.active ? 'Active' : 'Paused'}</span>{!expired && <button className="btn btn-line" onClick={() => toggle(r)}>{r.active ? 'Pause' : 'Turn on'}</button>}</span>
          </div>
        ); })}</div>
      </section>
    </>
  );
}
