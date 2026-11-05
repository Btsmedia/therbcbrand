'use client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { naira } from '@/lib/format';
import { LIMITS, MAX_PICKS, pctOff, dealPicks } from '@/lib/deals';

const onSale = (p) => p.compare_at && p.compare_at > p.price;

export default function DealsManager({ settings, products }) {
  const router = useRouter();
  const sb = getBrowserClient();
  const [s, setS] = useState(settings);
  const [rows, setRows] = useState(products);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);
  const [add, setAdd] = useState({ id: '', pct: '10' });
  const [edit, setEdit] = useState({}); // product id -> sale price being typed

  const deals = useMemo(() => rows.filter(onSale), [rows]);
  const notOnSale = rows.filter((p) => !onSale(p));
  const shown = dealPicks(deals.filter((p) => p.status === 'live'), s.picks);
  const say = (kind, text) => setMsg([kind, text]);
  const field = (k) => (e) => setS({ ...s, [k]: e.target.value });

  async function saveText(e) {
    e.preventDefault();
    if (!s.title.trim() || !s.cta.trim()) return say('err', 'The heading and button text can’t be empty.');
    setBusy('text');
    const { error } = await sb.from('site_settings').upsert({ key: 'deals', value: s });
    setBusy('');
    if (error) return say('err', error.message);
    say('ok', 'Deals section saved. The store shows it within a minute.');
    router.refresh();
  }

  async function savePicks(picks) {
    const next = { ...s, picks };
    setS(next); setBusy('picks');
    const { error } = await sb.from('site_settings').upsert({ key: 'deals', value: next });
    setBusy('');
    if (error) { setS(s); return say('err', error.message); }
    say('ok', 'Homepage picks updated.');
  }
  const togglePick = (id) => {
    if (s.picks.includes(id)) return savePicks(s.picks.filter((x) => x !== id));
    if (s.picks.length >= MAX_PICKS) return say('err', `You can feature up to ${MAX_PICKS}. Remove one first.`);
    savePicks([...s.picks, id]);
  };
  const move = (id, d) => { const i = s.picks.indexOf(id); const j = i + d; if (j < 0 || j >= s.picks.length) return; const p = [...s.picks]; [p[i], p[j]] = [p[j], p[i]]; savePicks(p); };

  async function setPrice(p, price, compare_at) {
    setBusy(p.id);
    const { error } = await sb.from('products').update({ price, compare_at }).eq('id', p.id);
    setBusy('');
    if (error) { say('err', error.message); return false; }
    setRows((r) => r.map((x) => (x.id === p.id ? { ...x, price, compare_at } : x)));
    return true;
  }

  async function addDeal(e) {
    e.preventDefault();
    const p = rows.find((x) => x.id === add.id);
    const pct = parseInt(add.pct, 10);
    if (!p) return say('err', 'Pick a product.');
    if (!(pct >= 1 && pct <= 90)) return say('err', 'Discount must be between 1% and 90%.');
    const sale = Math.max(1, Math.round((p.price * (100 - pct)) / 100 / 50) * 50); // round to the nearest ₦50
    if (await setPrice(p, sale, p.price)) { setAdd({ id: '', pct: add.pct }); say('ok', `${p.name} is now ${naira(sale)} (was ${naira(p.price)}).`); }
  }

  async function saveSale(p) {
    const v = parseInt(String(edit[p.id] ?? '').replace(/[^\d]/g, ''), 10);
    if (!(v > 0)) return say('err', 'Enter a sale price.');
    if (v >= p.compare_at) return say('err', `The sale price must be lower than the old price (${naira(p.compare_at)}).`);
    if (await setPrice(p, v, p.compare_at)) { setEdit((x) => ({ ...x, [p.id]: undefined })); say('ok', `${p.name} updated to ${naira(v)}.`); }
  }

  async function endDeal(p) {
    if (!window.confirm(`End the deal on ${p.name}? It goes back to ${naira(p.compare_at)}.`)) return;
    if (await setPrice(p, p.compare_at, null)) {
      if (s.picks.includes(p.id)) savePicks(s.picks.filter((x) => x !== p.id));
      say('ok', `${p.name} is back to ${naira(p.compare_at)}.`);
    }
  }

  const count = (k) => <small className="hint dl-count">{s[k].length}/{LIMITS[k]}</small>;

  return (
    <>
      <div className="ad-head"><h1>Deals</h1><a className="btn btn-line" href="/#sale" target="_blank" rel="noreferrer">View on store</a></div>
      {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : 'ok'}`} role="status">{msg[1]}</p>}

      <section className="card-box">
        <h2 className="ad-h2">Deals banner</h2>
        <p className="hint">The wording on the homepage Deals section, the shop’s deals card and the menu.</p>
        <div className="dl-grid">
          <form className="dl-form" onSubmit={saveText}>
            <label className="lbl">Small line above<input className="input" maxLength={LIMITS.eyebrow} value={s.eyebrow} onChange={field('eyebrow')} />{count('eyebrow')}</label>
            <div className="dl-row">
              <label className="lbl">Heading<input className="input" maxLength={LIMITS.title} value={s.title} onChange={field('title')} />{count('title')}</label>
              <label className="lbl">Highlighted word<input className="input" maxLength={LIMITS.highlight} value={s.highlight} onChange={field('highlight')} />{count('highlight')}</label>
            </div>
            <label className="lbl">Description<textarea className="input" rows={3} maxLength={LIMITS.blurb} value={s.blurb} onChange={field('blurb')} />{count('blurb')}</label>
            <label className="lbl">Button text<input className="input" maxLength={LIMITS.cta} value={s.cta} onChange={field('cta')} />{count('cta')}</label>
            <div><button className="btn btn-solid" aria-busy={busy === 'text'} disabled={busy === 'text'}>{busy === 'text' ? 'Saving…' : 'Save banner'}</button></div>
          </form>
          <div className="dl-preview" aria-label="Preview">
            <span className="eyebrow">{s.eyebrow}</span>
            <h3>{s.title} <span>{s.highlight}</span></h3>
            <p>{s.blurb}</p>
            <span className="btn btn-solid btn-sm" aria-hidden="true">{s.cta}</span>
          </div>
        </div>
      </section>

      <section className="card-box">
        <h2 className="ad-h2">On the homepage <span className="hint">{shown.length}/{MAX_PICKS} spots</span></h2>
        <p className="hint">Star up to {MAX_PICKS} deals to show first. Empty spots fill with the biggest discounts.</p>
        <div className="dl-picks">
          {Array.from({ length: MAX_PICKS }, (_, i) => { const p = shown[i]; return (
            <div key={i} className={`dl-pick ${p ? '' : 'empty'} ${i < 2 ? 'big' : ''}`}>
              {p ? <>{p.image && <img src={p.image} alt="" />}<span className="badge sale">−{pctOff(p)}%</span><b>{p.name}</b>{!s.picks.includes(p.id) && <small>auto</small>}</> : <small>Empty spot</small>}
            </div>
          ); })}
        </div>
      </section>

      <section className="card-box">
        <h2 className="ad-h2">Products on deal <span className="hint">{deals.length}</span></h2>
        <form className="om-inline wrap2" onSubmit={addDeal}>
          <label className="lbl">Product<select className="select" value={add.id} onChange={(e) => setAdd({ ...add, id: e.target.value })}><option value="">Choose a product</option>{notOnSale.map((p) => <option key={p.id} value={p.id}>{p.name} · {naira(p.price)}{p.status !== 'live' ? ' (draft)' : ''}</option>)}</select></label>
          <label className="lbl">% off<input className="input" inputMode="numeric" value={add.pct} onChange={(e) => setAdd({ ...add, pct: e.target.value })} style={{ maxWidth: 90 }} /></label>
          <button className="btn btn-solid" aria-busy={busy === add.id && !!add.id} disabled={!!busy}>Put on deal</button>
        </form>
        {deals.length === 0 ? <p className="hint">No products are on deal. The Deals section is hidden from the homepage until you add one.</p> : (
          <div className="mini-list">{deals.map((p) => { const pick = s.picks.includes(p.id); const v = edit[p.id]; return (
            <div key={p.id} className={`dl-item ${busy === p.id ? 'is-loading' : ''}`}>
              <button type="button" className={`dl-star ${pick ? 'on' : ''}`} onClick={() => togglePick(p.id)} disabled={busy === 'picks'} aria-pressed={pick} aria-label={pick ? `Remove ${p.name} from homepage` : `Feature ${p.name} on homepage`} title={pick ? 'On the homepage' : 'Feature on homepage'}>★</button>
              <span className="dl-th">{p.image && <img src={p.image} alt="" />}</span>
              <span className="dl-name"><b>{p.name}</b><small><s>{naira(p.compare_at)}</s> → {naira(p.price)} · <b className="dl-off">−{pctOff(p)}%</b>{p.status !== 'live' && ' · draft, not shown'}</small></span>
              <span className="dl-acts">
                {pick && <><button type="button" className="linkish" onClick={() => move(p.id, -1)} aria-label="Move earlier">↑</button><button type="button" className="linkish" onClick={() => move(p.id, 1)} aria-label="Move later">↓</button></>}
                {v === undefined ? <button type="button" className="linkish" onClick={() => setEdit({ ...edit, [p.id]: String(p.price) })}>Change price</button> : (
                  <form className="dl-price" onSubmit={(e) => { e.preventDefault(); saveSale(p); }}>
                    <span>₦</span><input className="input" inputMode="numeric" autoFocus value={v} onChange={(e) => setEdit({ ...edit, [p.id]: e.target.value })} aria-label={`Sale price for ${p.name}`} />
                    <button className="btn btn-solid btn-sm" disabled={busy === p.id}>Save</button><button type="button" className="linkish" onClick={() => setEdit({ ...edit, [p.id]: undefined })}>Cancel</button>
                  </form>
                )}
                <button type="button" className="linkish danger" onClick={() => endDeal(p)} disabled={busy === p.id}>End deal</button>
              </span>
            </div>
          ); })}</div>
        )}
      </section>
    </>
  );
}
