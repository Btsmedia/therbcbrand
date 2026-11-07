'use client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { fmtDate } from '@/lib/format';
import { LOCK_TEMPLATES, LOCK_LIMITS, cleanLock, activeLock } from '@/lib/lock';

// datetime inputs are in Lagos time (UTC+1, no daylight saving)
const toLagosInput = (iso) => (iso ? new Date(Date.parse(iso) + 3600e3).toISOString().slice(0, 16) : '');
const fromLagosInput = (v) => (v ? new Date(`${v}:00+01:00`).toISOString() : null);
const lagosText = (iso) => new Date(iso).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function LockManager({ initial, signups }) {
  const router = useRouter();
  const [l, setL] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [list, setList] = useState(signups);
  const [filter, setFilter] = useState('all');
  const t = LOCK_TEMPLATES[l.template];
  const set = (k) => (e) => setL({ ...l, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const liveNow = !!activeLock(saved);
  const dirty = JSON.stringify(cleanLock(l)) !== JSON.stringify(cleanLock(saved));

  async function save(next = l, note) {
    setMsg(null);
    const value = cleanLock(next);
    if (value.on && value.until && Date.parse(value.until) <= Date.now() && value.autoOpen) return setMsg(['err', 'The opening time is in the past, so the store would open straight away. Pick a later time or untick “Open automatically”.']);
    setBusy(true);
    const { error } = await getBrowserClient().from('site_settings').upsert({ key: 'lock', value });
    setBusy(false);
    if (error) return setMsg(['err', error.message]);
    setL(value); setSaved(value);
    setMsg(['ok', note || 'Saved.']);
    router.refresh();
  }
  const lockNow = () => window.confirm(`Lock the store with the “${t.label}” page? Shoppers won’t be able to browse or buy until it opens. Existing orders, accounts and admin keep working.`) && save({ ...l, on: true }, 'The store is locked. Shoppers now see your lock page.');
  const unlock = () => window.confirm('Open the store to shoppers now?') && save({ ...l, on: false }, 'The store is open again.');

  const shown = useMemo(() => list.filter((s) => filter === 'all' || s.reason === filter), [list, filter]);
  const counts = useMemo(() => list.reduce((m, s) => ({ ...m, [s.reason]: (m[s.reason] || 0) + 1 }), {}), [list]);
  const copy = async () => { await navigator.clipboard.writeText(shown.map((s) => s.email).join(', ')); setMsg(['ok', `Copied ${shown.length} email${shown.length === 1 ? '' : 's'}.`]); };
  const csv = () => {
    const rows = [['email', 'reason', 'signed_up'], ...shown.map((s) => [s.email, s.reason, s.created_at])].map((r) => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows], { type: 'text/csv' })); a.download = `rbc-notify-list-${filter}.csv`; a.click();
  };
  const clear = async () => {
    if (!window.confirm(`Delete ${shown.length} email${shown.length === 1 ? '' : 's'} from the list? Do this after you’ve emailed them.`)) return;
    const ids = shown.map((s) => s.id);
    const { error } = await getBrowserClient().from('lock_signups').delete().in('id', ids);
    if (error) return setMsg(['err', error.message]);
    setList(list.filter((s) => !ids.includes(s.id))); setMsg(['ok', 'List cleared.']);
  };

  return (
    <>
      <div className="ad-head"><h1>Lock store</h1></div>
      {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : 'ok'}`} role="status">{msg[1]}</p>}

      <section className={`card-box lm-status ${liveNow ? 'locked' : ''}`}>
        <div>
          <span className="eyebrow">{liveNow ? 'Locked' : 'Open'}</span>
          <h2 className="ad-h2">{liveNow ? `Shoppers see the “${LOCK_TEMPLATES[saved.template].label}” page` : 'The store is open to shoppers'}</h2>
          <p className="hint">{liveNow ? (saved.until ? (saved.autoOpen ? `Opens automatically ${lagosText(saved.until)} (Lagos time).` : `Countdown to ${lagosText(saved.until)}. You’ll open it yourself.`) : 'Stays locked until you open it.') : 'Lock it for a launch, a sale that hasn’t started, restocking or a short break. You and your team can still see and test the store while it’s locked.'}</p>
        </div>
        <div className="lm-acts">
          {liveNow ? <><a className="btn btn-line" href="/?lockpreview=1" target="_blank" rel="noreferrer">See lock page</a><button className="btn btn-solid" onClick={unlock} disabled={busy}>Open store now</button></>
            : <button className="btn btn-solid lm-lockbtn" onClick={lockNow} aria-busy={busy} disabled={busy}>Lock store</button>}
        </div>
      </section>

      <section className="card-box">
        <h2 className="ad-h2">1. Pick a template</h2>
        <div className="lm-tpls" role="radiogroup" aria-label="Lock page template">
          {Object.entries(LOCK_TEMPLATES).map(([k, v]) => (
            <button key={k} type="button" role="radio" aria-checked={l.template === k} className={`lm-tpl ${l.template === k ? 'on' : ''}`} onClick={() => setL({ ...l, template: k })}>
              <span className={`lm-thumb lk-${v.tone}`}><img src={`/email/hero/${v.hero}.png`} alt="" /></span>
              <b>{v.label}</b><small>{v.hint}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="card-box">
        <h2 className="ad-h2">2. Wording <span className="hint">leave blank to use the template’s</span></h2>
        <div className="dl-form">
          <label className="lbl">Heading<input className="input" maxLength={LOCK_LIMITS.title} value={l.title} onChange={set('title')} placeholder={t.title} /></label>
          <label className="lbl">Message<textarea className="input" rows={3} maxLength={LOCK_LIMITS.message} value={l.message} onChange={set('message')} placeholder={t.message} /></label>
          <label className="lbl">Highlight (optional)<input className="input" maxLength={LOCK_LIMITS.badge} value={l.badge} onChange={set('badge')} placeholder={l.template === 'sale' ? 'Up to 40% off' : l.template === 'launch' ? 'Launch-day treats' : 'New arrivals inside'} /><small>A small pill under the heading, like a discount or offer.</small></label>
        </div>
      </section>

      <section className="card-box">
        <h2 className="ad-h2">3. Countdown and signups</h2>
        <div className="dl-form">
          <label className="lbl">Opening time (Lagos time, optional)<input className="input" type="datetime-local" value={toLagosInput(l.until)} onChange={(e) => setL({ ...l, until: fromLagosInput(e.target.value) })} style={{ maxWidth: 280 }} /><small>Shows a live countdown. Leave empty for no countdown.</small></label>
          {l.until && <label className="chk2"><input type="checkbox" checked={l.autoOpen} onChange={set('autoOpen')} /> Open the store automatically when the countdown ends</label>}
          {l.until && <button type="button" className="linkish" style={{ justifySelf: 'start' }} onClick={() => setL({ ...l, until: null })}>Remove countdown</button>}
          <label className="chk2"><input type="checkbox" checked={l.notify} onChange={set('notify')} /> Show a “{t.cta}” email box</label>
        </div>
        <div className="lm-save">
          <button className="btn btn-solid" onClick={() => save(l, liveNow ? 'Saved. The lock page is updated.' : 'Saved. Press “Lock store” when you’re ready.')} aria-busy={busy} disabled={busy || !dirty}>{busy ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}</button>
          <a className="linkish" href="/?lockpreview=1" target="_blank" rel="noreferrer" onClick={(e) => { if (!saved.on) { e.preventDefault(); setMsg(['err', 'The preview works while the store is locked. Lock it first, or save and check the template thumbnails above.']); } }}>Preview lock page</a>
        </div>
      </section>

      <section className="card-box">
        <h2 className="ad-h2">Notify list <span className="hint">{list.length}</span></h2>
        <p className="hint">People who left their email on the lock page. Email them when you open. The easiest way is to paste the copied list into BCC in your email app.</p>
        {list.length === 0 ? <p className="hint">No signups yet.</p> : <>
          <div className="lm-tools">
            <div className="tabs">{[['all', `All (${list.length})`], ...Object.entries(LOCK_TEMPLATES).filter(([k]) => counts[k]).map(([k, v]) => [k, `${v.label} (${counts[k]})`])].map(([k, lbl]) => <button key={k} className="tab" aria-selected={filter === k} onClick={() => setFilter(k)}>{lbl}</button>)}</div>
            <span className="lm-tb"><button className="btn btn-line btn-sm" onClick={copy}>Copy emails</button><button className="btn btn-line btn-sm" onClick={csv}>Download CSV</button><button className="linkish danger" onClick={clear}>Clear</button></span>
          </div>
          <div className="mini-list">{shown.slice(0, 200).map((s) => <div key={s.id}><span>{s.email}</span><small className="hint">{LOCK_TEMPLATES[s.reason]?.label} · {fmtDate(s.created_at)}</small></div>)}</div>
          {shown.length > 200 && <p className="hint">Showing 200 of {shown.length}. Download the CSV for everyone.</p>}
        </>}
      </section>
    </>
  );
}
