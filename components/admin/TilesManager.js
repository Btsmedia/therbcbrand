'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { TILE_LIMITS, TILE_LINKS, TILE_DEFAULTS, cleanTiles } from '@/lib/home-tiles';

async function toWebImage(file) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
  } catch { return null; }
}

function TileEditor({ label, tile, onChange, onPhoto, uploading }) {
  const file = useRef(null);
  const custom = !TILE_LINKS.some(([h]) => h === tile.href);
  const set = (k) => (e) => onChange({ ...tile, [k]: e.target.value });
  return (
    <div className="tl-ed">
      <div className="tl-pic">
        <img src={tile.img} alt="" />
        <div className="tl-cap"><b>{tile.title}</b><span>{tile.cta} →</span></div>
      </div>
      <div className="tl-fields">
        <h3>{label}</h3>
        <div className="tl-row">
          <button type="button" className="btn btn-line" onClick={() => file.current?.click()} disabled={uploading}>{uploading ? 'Uploading…' : 'Change photo'}</button>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) onPhoto(f); }} />
          <small className="hint">Landscape or square photos work best.</small>
        </div>
        <label className="lbl">Title<input className="input" maxLength={TILE_LIMITS.title} value={tile.title} onChange={set('title')} /></label>
        <label className="lbl">Button text<input className="input" maxLength={TILE_LIMITS.cta} value={tile.cta} onChange={set('cta')} /></label>
        <label className="lbl">Button goes to
          <select className="input" value={custom ? '' : tile.href} onChange={(e) => onChange({ ...tile, href: e.target.value || tile.href })}>
            {TILE_LINKS.map(([h, n]) => <option key={h} value={h}>{n}</option>)}
            {custom && <option value="">Custom: {tile.href}</option>}
          </select>
        </label>
      </div>
    </div>
  );
}

export default function TilesManager({ initial }) {
  const router = useRouter();
  const [t, setT] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [up, setUp] = useState('');
  const [msg, setMsg] = useState(null);

  const setTile = (group, i) => (tile) => setT((s) => ({ ...s, [group]: s[group].map((x, j) => (j === i ? tile : x)) }));

  async function photo(group, i, file) {
    setMsg(null); setUp(`${group}-${i}`);
    const blob = await toWebImage(file);
    if (!blob) { setUp(''); return setMsg(['err', `${file.name} couldn’t be read. Use a JPG or PNG (iPhone photos: share as "Most compatible").`]); }
    const sb = getBrowserClient();
    const path = `tiles/${crypto.randomUUID()}.jpg`;
    const { error } = await sb.storage.from('product-media').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
    setUp('');
    if (error) return setMsg(['err', `Upload failed: ${error.message}`]);
    const url = sb.storage.from('product-media').getPublicUrl(path).data.publicUrl;
    setT((s) => ({ ...s, [group]: s[group].map((x, j) => (j === i ? { ...x, img: url } : x)) }));
    setMsg(['ok', 'Photo uploaded. Press Save to put it on the homepage.']);
  }

  async function save(e) {
    e.preventDefault(); setMsg(null); setBusy(true);
    const { error } = await getBrowserClient().from('site_settings').upsert({ key: 'home_tiles', value: cleanTiles(t) });
    setBusy(false);
    if (error) return setMsg(['err', error.message]);
    setMsg(['ok', 'Saved. The homepage updates within a minute.']);
    router.refresh();
  }

  return (
    <>
      <div className="ad-head"><h1>Homepage tiles</h1><a className="btn btn-line" href="/" target="_blank" rel="noreferrer">View store</a></div>
      {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : 'ok'}`} role="status">{msg[1]}</p>}
      <form className="dl-form" onSubmit={save} style={{ display: 'grid', gap: 20 }}>
        <section className="card-box">
          <h2 className="ad-h2">Photo tiles under “Shop by category”</h2>
          <p className="muted">One large tile on the left and two smaller ones on the right. On phones they stack.</p>
          {t.collage.map((tile, i) => <TileEditor key={i} label={i === 0 ? 'Large tile' : `Small tile ${i}`} tile={tile} onChange={setTile('collage', i)} onPhoto={(f) => photo('collage', i, f)} uploading={up === `collage-${i}`} />)}
        </section>
        <section className="card-box">
          <h2 className="ad-h2">Two tiles further down</h2>
          <label className="chk2"><input type="checkbox" checked={t.editsOn} onChange={(e) => setT({ ...t, editsOn: e.target.checked })} /> Show this section</label>
          <label className="lbl">Section heading<input className="input" maxLength={TILE_LIMITS.heading} value={t.editsHeading} onChange={(e) => setT({ ...t, editsHeading: e.target.value })} placeholder={TILE_DEFAULTS.editsHeading} /></label>
          {t.edits.map((tile, i) => <TileEditor key={i} label={`Tile ${i + 1}`} tile={tile} onChange={setTile('edits', i)} onPhoto={(f) => photo('edits', i, f)} uploading={up === `edits-${i}`} />)}
        </section>
        <div className="ad-save"><button className="btn btn-solid" aria-busy={busy} disabled={busy || !!up}>{busy ? 'Saving…' : 'Save tiles'}</button>
          <button type="button" className="btn btn-line" onClick={() => setT(cleanTiles({}))}>Reset to default</button></div>
      </form>
    </>
  );
}
