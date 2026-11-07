'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { POL_LIMITS, cleanPolicies, policiesSize, slugify } from '@/lib/policies';

const FIXED = { delivery: 'Linked from checkout and the footer', returns: 'Linked from “Help with an order” in the footer', privacy: 'Linked from the footer' };

export default function PoliciesManager({ initial }) {
  const router = useRouter();
  const [secs, setSecs] = useState(initial.sections);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const upd = (i, patch) => setSecs(secs.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const updPoint = (i, k, patch) => upd(i, { points: secs[i].points.map((p, j) => (j === k ? { ...p, ...patch } : p)) });
  const move = (i, d) => { const n = [...secs]; [n[i], n[i + d]] = [n[i + d], n[i]]; setSecs(n); };
  const movePoint = (i, k, d) => { const pts = [...secs[i].points]; [pts[k], pts[k + d]] = [pts[k + d], pts[k]]; upd(i, { points: pts }); };
  const addSection = () => setSecs([...secs, { id: '', title: '', text: '', points: [] }]);
  const size = policiesSize({ sections: secs });

  async function save(e) {
    e.preventDefault(); setMsg(null); setConfirmDel(null);
    const empty = secs.findIndex((s) => !s.title.trim() || (!s.text.trim() && !s.points.some((p) => p.label.trim() || p.text.trim())));
    if (empty >= 0) return setMsg(['err', `Section ${empty + 1} needs a title and some wording, either a paragraph or at least one point. Fill it in or delete it.`]);
    if (size > POL_LIMITS.total) return setMsg(['err', 'The policies are too long to save. Shorten some sections.']);
    // new sections get a link name from their title
    const value = cleanPolicies({ sections: secs.map((s) => ({ ...s, id: s.id || slugify(s.title) })) });
    setBusy(true);
    const { error } = await getBrowserClient().from('site_settings').upsert({ key: 'policies', value });
    setBusy(false);
    if (error) return setMsg(['err', error.message]);
    setSecs(value.sections);
    setMsg(['ok', 'Saved. The policies page updates within a minute.']);
    router.refresh();
  }

  return (
    <>
      <div className="ad-head"><h1>Store policies</h1><a className="btn btn-line" href="/policies" target="_blank" rel="noreferrer">View page</a></div>
      {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : 'ok'}`} role="status">{msg[1]}</p>}
      <p className="hint" style={{ margin: '0 0 14px' }}>Each section has a title, an optional paragraph and optional points. Each point can start with a few bold words, like “Pickup.”, but it doesn’t have to.</p>

      <form onSubmit={save}>
        {secs.map((s, i) => (
          <section className="card-box pol-sec" key={i}>
            <div className="pol-head">
              <span className="pol-num">{i + 1}</span>
              <input className="input pol-title" maxLength={POL_LIMITS.title} value={s.title} onChange={(e) => upd(i, { title: e.target.value })} placeholder="Section title, e.g. Returns" aria-label={`Section ${i + 1} title`} />
              <div className="pol-tools">
                <button type="button" className="icon-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move section up">↑</button>
                <button type="button" className="icon-sm" onClick={() => move(i, 1)} disabled={i === secs.length - 1} aria-label="Move section down">↓</button>
                {confirmDel === i
                  ? <><button type="button" className="linkish danger" onClick={() => { setSecs(secs.filter((_, j) => j !== i)); setConfirmDel(null); }}>Delete</button><button type="button" className="linkish" onClick={() => setConfirmDel(null)}>Keep</button></>
                  : <button type="button" className="linkish danger" onClick={() => setConfirmDel(i)}>Delete section</button>}
              </div>
            </div>
            {FIXED[s.id] && <small className="hint">{FIXED[s.id]}, so keep this section.</small>}

            <label className="lbl">Paragraph (optional)<textarea className="input" rows={3} maxLength={POL_LIMITS.text} value={s.text} onChange={(e) => upd(i, { text: e.target.value })} placeholder="A short paragraph. Leave a blank line to start a new paragraph." /></label>

            {s.points.length > 0 && <span className="lbl" style={{ marginTop: 6 }}>Points</span>}
            {s.points.map((p, k) => (
              <div className="pol-point" key={k}>
                <input className="input" maxLength={POL_LIMITS.label} value={p.label} onChange={(e) => updPoint(i, k, { label: e.target.value })} placeholder="Bold start (optional)" aria-label="Bold start" />
                <div className="pol-ptools">
                  <button type="button" className="icon-sm" onClick={() => movePoint(i, k, -1)} disabled={k === 0} aria-label="Move point up">↑</button>
                  <button type="button" className="icon-sm" onClick={() => movePoint(i, k, 1)} disabled={k === s.points.length - 1} aria-label="Move point down">↓</button>
                  <button type="button" className="icon-sm" onClick={() => upd(i, { points: s.points.filter((_, j) => j !== k) })} aria-label="Remove point">×</button>
                </div>
                <textarea className="input" rows={3} maxLength={POL_LIMITS.point} value={p.text} onChange={(e) => updPoint(i, k, { text: e.target.value })} placeholder="What this point says" aria-label="Point text" />
              </div>
            ))}
            {s.points.length < POL_LIMITS.points && <button type="button" className="btn btn-line btn-sm" style={{ justifySelf: 'start' }} onClick={() => upd(i, { points: [...s.points, { label: '', text: '' }] })}>+ Add a point</button>}
          </section>
        ))}

        {secs.length < POL_LIMITS.sections && <button type="button" className="btn btn-line" onClick={addSection} style={{ marginBottom: 90 }}>+ Add a section</button>}

        <div className="adm-savebar">
          <span className="asb-name">{secs.length} section{secs.length === 1 ? '' : 's'}{size > POL_LIMITS.total * 0.85 ? ` · ${Math.round((size / POL_LIMITS.total) * 100)}% of the space used` : ''}<small>Store policies</small></span>
          <button className="btn btn-solid" aria-busy={busy} disabled={busy}>{busy ? 'Saving…' : 'Save policies'}</button>
        </div>
      </form>
    </>
  );
}
