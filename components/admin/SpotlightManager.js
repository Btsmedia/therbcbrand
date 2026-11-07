'use client';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { SPOT_LIMITS, cleanSpotlight } from '@/lib/spotlight';
import { naira } from '@/lib/format';

export default function SpotlightManager({ initial, products }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setS({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const chosen = products.find((p) => p.slug === s.slug);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? products.filter((p) => p.name.toLowerCase().includes(t)) : products;
  }, [q, products]);

  async function save(e) {
    e.preventDefault(); setMsg(null);
    if (s.on && !chosen) return setMsg(['err', 'Pick a product to spotlight, or switch the section off.']);
    setBusy(true);
    const value = cleanSpotlight(s);
    const { error } = await getBrowserClient().from('site_settings').upsert({ key: 'spotlight', value });
    setBusy(false);
    if (error) return setMsg(['err', error.message]);
    setMsg(['ok', s.on ? `Saved. ${chosen.name} is now the homepage spotlight. The store updates within a minute.` : 'Saved. The spotlight section is now hidden.']);
    router.refresh();
  }

  return (
    <>
      <div className="ad-head"><h1>Homepage spotlight</h1><a className="btn btn-line" href="/#story-h" target="_blank" rel="noreferrer">View store</a></div>
      {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : 'ok'}`} role="status">{msg[1]}</p>}

      <section className="card-box">
        <h2 className="ad-h2">Preview</h2>
        {s.on && chosen ? (
          <div className="sp-preview">
            <div><span className="eyebrow">{s.eyebrow || 'Product spotlight'}</span><b>{chosen.name}</b><p>{s.blurb.trim() || chosen.description}</p><span className="sp-price">{naira(chosen.price)}</span><span className="sp-cta">{s.cta || 'See details & reviews'}</span></div>
            {chosen.image && <img src={chosen.image} alt="" />}
          </div>
        ) : <p className="muted">{s.on ? 'Pick a product below.' : 'The spotlight section is hidden on the homepage.'}</p>}
      </section>

      <section className="card-box">
        <form className="dl-form" onSubmit={save}>
          <label className="chk2"><input type="checkbox" checked={s.on} onChange={set('on')} /> Show the spotlight on the homepage</label>

          <fieldset className="sp-pick" disabled={!s.on}>
            <legend className="lbl">Product</legend>
            <input className="input" type="search" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="sp-list" role="radiogroup">
              {list.map((p) => (
                <label key={p.slug} className={`sp-item ${s.slug === p.slug ? 'on' : ''}`}>
                  <input type="radio" name="spot" checked={s.slug === p.slug} onChange={() => setS({ ...s, slug: p.slug })} />
                  {p.image ? <img src={p.image} alt="" /> : <span className="sp-noimg" />}
                  <span><b>{p.name}</b><small>{naira(p.price)}</small></span>
                </label>
              ))}
              {!list.length && <p className="muted" style={{ padding: 12 }}>No live products match “{q}”.</p>}
            </div>
            <small className="hint">Only live products with a photo can be spotlighted. If you hide or delete the product later, the section hides itself.</small>
          </fieldset>

          <label className="lbl">Small heading<input className="input" maxLength={SPOT_LIMITS.eyebrow} value={s.eyebrow} onChange={set('eyebrow')} placeholder="Product spotlight" /></label>
          <label className="lbl">Description (optional)<textarea className="input" rows={3} maxLength={SPOT_LIMITS.blurb} value={s.blurb} onChange={set('blurb')} placeholder={chosen?.description || 'Leave empty to use the product’s own description'} /><small className="hint dl-count">{s.blurb.length}/{SPOT_LIMITS.blurb} · empty uses the product description</small></label>
          <label className="lbl">Button text<input className="input" maxLength={SPOT_LIMITS.cta} value={s.cta} onChange={set('cta')} placeholder="See details & reviews" /></label>
          <div><button className="btn btn-solid" aria-busy={busy} disabled={busy}>{busy ? 'Saving…' : 'Save spotlight'}</button></div>
        </form>
      </section>
    </>
  );
}
