'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { ANN_LIMITS, ANN_TONES, cleanAnnouncement, safeLink } from '@/lib/announcement';

const QUICK = [
  ['Deals', '/shop?sale=1'], ['New arrivals', '/shop?sort=new'], ['Marketplace', '/shop'], ['Personalised gifts', '/shop?cat=custom'], ['Corporate & events', '/shop?cat=corporate'],
];

export default function AnnouncementManager({ initial }) {
  const router = useRouter();
  const [a, setA] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setA({ ...a, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const linkOk = !a.link || !!safeLink(a.link);

  async function save(e) {
    e.preventDefault(); setMsg(null);
    if (a.on && !a.text.trim()) return setMsg(['err', 'Write a message, or switch the bar off.']);
    if (!linkOk) return setMsg(['err', 'The link must be a store page like /shop?sale=1, or start with https://']);
    setBusy(true);
    const value = cleanAnnouncement(a);
    const { error } = await getBrowserClient().from('site_settings').upsert({ key: 'announcement', value });
    setBusy(false);
    if (error) return setMsg(['err', error.message]);
    setA(value);
    setMsg(['ok', value.on ? 'Saved. The new message shows on the store within a minute.' : 'Saved. The announcement bar is now hidden.']);
    router.refresh();
  }

  return (
    <>
      <div className="ad-head"><h1>Announcement bar</h1><a className="btn btn-line" href="/" target="_blank" rel="noreferrer">View store</a></div>
      {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : 'ok'}`} role="status">{msg[1]}</p>}

      <section className="card-box">
        <h2 className="ad-h2">Preview</h2>
        <div className={`util tone-${a.tone} an-preview`} aria-label="Preview">
          <p className="mid">{a.on && a.text.trim() ? <>{a.text}{a.link && linkOk && <> <span className="ann-link">{a.linkLabel || 'Shop now'} →</span></>}</> : <span style={{ opacity: .6 }}>Bar hidden</span>}</p>
        </div>
        <p className="hint">This thin strip sits above the menu on every page. On phones it’s the only thing in the strip, so keep it short.</p>
      </section>

      <section className="card-box">
        <form className="dl-form" onSubmit={save}>
          <label className="chk2 an-toggle"><input type="checkbox" checked={a.on} onChange={set('on')} /> Show the announcement bar</label>
          <label className="lbl">Message<input className="input" maxLength={ANN_LIMITS.text} value={a.text} onChange={set('text')} placeholder="Free local pickup available" /><small className="hint dl-count">{a.text.length}/{ANN_LIMITS.text}</small></label>
          <div className="dl-row">
            <label className="lbl">Link (optional)<input className="input" value={a.link} onChange={set('link')} placeholder="/shop?sale=1" aria-invalid={!linkOk} /></label>
            <label className="lbl">Link text<input className="input" maxLength={ANN_LIMITS.linkLabel} value={a.linkLabel} onChange={set('linkLabel')} placeholder="Shop now" disabled={!a.link} /></label>
          </div>
          {!linkOk && <p className="co-err">Use a store page like /shop?sale=1, or a full link starting with https://</p>}
          <div className="an-quick"><span className="hint">Quick links:</span>{QUICK.map(([l, h]) => <button key={h} type="button" className="chip" onClick={() => setA({ ...a, link: h, linkLabel: a.linkLabel || 'Shop now' })}>{l}</button>)}{a.link && <button type="button" className="linkish" onClick={() => setA({ ...a, link: '', linkLabel: '' })}>Remove link</button>}</div>
          <fieldset className="an-tones"><legend className="lbl">Colour</legend>
            {Object.entries(ANN_TONES).map(([k, l]) => <label key={k} className={`an-tone ${a.tone === k ? 'on' : ''}`}><input type="radio" name="tone" checked={a.tone === k} onChange={() => setA({ ...a, tone: k })} /><span className={`util tone-${k} an-sw`} />{l}</label>)}
          </fieldset>
          <div><button className="btn btn-solid" aria-busy={busy} disabled={busy}>{busy ? 'Saving…' : 'Save announcement'}</button></div>
        </form>
      </section>
    </>
  );
}
