'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { naira } from '@/lib/format';
import { CATEGORIES } from '@/lib/categories';

const CATS = CATEGORIES.map(([s, l]) => [s, l]);
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function toWebImage(file) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
  } catch { return null; }
}

export default function ProductForm({ initial }) {
  const router = useRouter();
  const sb = getBrowserClient();
  const isNew = !initial;
  const [id] = useState(() => initial?.id || crypto.randomUUID());
  const [f, setF] = useState({
    name: initial?.name || '', description: initial?.description || '', care: initial?.care || '',
    price: initial?.price ?? '', compare_at: initial?.compare_at ?? '', category: initial?.category || CATEGORIES[0][0],
    extra: (initial?.categories || []).filter((c) => c !== initial?.category), tags: initial?.tags || [], badge: initial?.badge || '',
    custom_label: initial?.custom_label || '', custom_photo: !!initial?.custom_photo, custom_fee: initial?.custom_fee ?? '',
    status: initial?.status || 'draft',
  });
  const [personalise, setPersonalise] = useState(() => !!initial?.personalise);
  const [variants, setVariants] = useState(() => (initial?.product_variants?.length ? [...initial.product_variants].sort((a, b) => a.position - b.position).map((v) => ({ ...v })) : [{ id: null, colour: 'Default', hex: '#cccccc', stock: 0 }]));
  const [images, setImages] = useState(() => [...(initial?.product_images || [])].sort((a, b) => a.position - b.position).map((i) => ({ ...i })));
  const [removedImgs, setRemovedImgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [msg, setMsg] = useState(null);
  const [saved, setSaved] = useState(false); // brief "Saved ✓" state after a successful save
  const [onSale, setOnSale] = useState(() => initial?.compare_at != null && initial.compare_at !== '');
  const fileRef = useRef(null);
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setSaved(false); };
  const savePrimary = () => save(f.status === 'draft' ? 'live' : f.status);
  const primaryLabel = busy ? 'Saving…' : uploading > 0 ? 'Uploading…' : saved ? 'Saved ✓' : f.status === 'draft' ? 'Publish' : 'Save changes';
  // switching the sale off clears the "was" price; switching it on brings the field back
  const toggleSale = (e) => { const on = e.target.checked; setOnSale(on); if (!on) setF((x) => ({ ...x, compare_at: '' })); };

  async function upload(list) {
    setMsg(null);
    for (const file of list) {
      if (images.length >= 8) { setMsg(['err', 'You can add up to 8 photos.']); break; }
      setUploading((n) => n + 1);
      const blob = await toWebImage(file);
      if (!blob) { setUploading((n) => n - 1); setMsg(['err', `${file.name} couldn’t be read. Use a JPG or PNG (iPhone photos: share as "Most compatible").`]); continue; }
      const path = `products/${id}/${crypto.randomUUID()}.jpg`;
      const { error } = await sb.storage.from('product-media').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
      setUploading((n) => n - 1);
      if (error) { setMsg(['err', `Upload failed: ${error.message}`]); continue; }
      const url = sb.storage.from('product-media').getPublicUrl(path).data.publicUrl;
      setImages((im) => [...im, { id: null, url, path }]);
    }
  }
  const move = (i, d) => setImages((im) => { const c = [...im]; const j = i + d; if (j < 0 || j >= c.length) return im; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const removeImg = (i) => { const img = images[i]; if (img.id || img.path) setRemovedImgs((r) => [...r, img]); setImages(images.filter((_, j) => j !== i)); };

  async function save(statusOverride) {
    const status = statusOverride || f.status;
    const price = parseInt(f.price, 10), cmp = f.compare_at === '' ? null : parseInt(f.compare_at, 10);
    if (!f.name.trim()) return setMsg(['err', 'Add a product name.']);
    if (!(price >= 0)) return setMsg(['err', 'Add a price in naira.']);
    if (cmp != null && cmp <= price) return setMsg(['err', 'The “was” price must be higher than the price, or left empty.']);
    if (status === 'live' && price < 1) return setMsg(['err', 'Set a price before publishing.']);
    if (status === 'live' && !images.length) return setMsg(['err', 'Add at least one photo before publishing.']);
    if (!variants.length) return setMsg(['err', 'Add at least one colour with a stock count.']);
    setBusy(true); setMsg(null);
    const row = {
      id, name: f.name.trim(), description: f.description.trim(), care: f.care.trim(), price, compare_at: cmp,
      category: f.category, categories: [f.category, ...f.extra.filter((c) => c !== f.category)], tags: f.tags, badge: f.badge.trim() || null, status,
      personalise,
      custom_label: personalise && f.custom_label.trim() ? f.custom_label.trim().slice(0, 60) : null,
      custom_photo: personalise && f.custom_photo,
      custom_fee: personalise ? Math.max(0, parseInt(f.custom_fee, 10) || 0) : 0,
    };
    if (isNew) { row.slug = slugify(f.name); row.position = Math.floor(Date.now() / 1000) % 100000; }
    let { error } = isNew ? await sb.from('products').insert(row) : await sb.from('products').update(row).eq('id', id);
    if (error?.code === '23505' && isNew) { row.slug = `${slugify(f.name)}-${id.slice(0, 4)}`; ({ error } = await sb.from('products').insert(row)); }
    if (error) { setBusy(false); return setMsg(['err', `Couldn’t save: ${error.message}`]); }

    // colours and stock
    const keep = variants.filter((v) => v.id).map((v) => v.id);
    if (!isNew) { let del = sb.from('product_variants').delete().eq('product_id', id); if (keep.length) del = del.not('id', 'in', `(${keep.join(',')})`); await del; }
    for (const [i, v] of variants.entries()) {
      const vrow = { product_id: id, colour: v.colour.trim() || 'Default', hex: v.hex, stock: Math.max(0, parseInt(v.stock, 10) || 0), position: i };
      const r = v.id ? await sb.from('product_variants').update(vrow).eq('id', v.id) : await sb.from('product_variants').insert(vrow);
      if (r.error) { setBusy(false); return setMsg(['err', `Couldn’t save colours: ${r.error.message}`]); }
    }
    // photos
    for (const img of removedImgs) {
      if (img.id) await sb.from('product_images').delete().eq('id', img.id);
      if (img.path) await sb.storage.from('product-media').remove([img.path]);
    }
    for (const [i, img] of images.entries()) {
      const r = img.id ? await sb.from('product_images').update({ position: i }).eq('id', img.id) : await sb.from('product_images').insert({ product_id: id, url: img.url, path: img.path, position: i });
      if (r.error) { setBusy(false); return setMsg(['err', `Couldn’t save photos: ${r.error.message}`]); }
    }
    const [{ data: vs }, { data: ims }] = await Promise.all([
      sb.from('product_variants').select('id, colour, hex, stock, position').eq('product_id', id).order('position'),
      sb.from('product_images').select('id, url, path, position').eq('product_id', id).order('position'),
    ]);
    if (vs) setVariants(vs); if (ims) setImages(ims);
    setBusy(false); setRemovedImgs([]); setF((x) => ({ ...x, status }));
    setMsg(['ok', status === 'live' ? 'Saved. This product is live in the store.' : 'Saved as a draft.']);
    setSaved(true); clearTimeout(save.t); save.t = setTimeout(() => setSaved(false), 2500);
    if (isNew) router.replace(`/admin/products/${id}`); else router.refresh();
  }

  const toggleIn = (key, v) => setF({ ...f, [key]: f[key].includes(v) ? f[key].filter((x) => x !== v) : [...f[key], v] });

  return (
    <>
      <div className="row-between">
        <div><Link href="/admin/products" className="hint">← Products</Link><h1>{isNew ? 'New product' : f.name || 'Edit product'}</h1></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!isNew && initial.status === 'live' && <Link className="btn btn-line" href={`/product/${initial.slug}`} target="_blank">View in store ↗</Link>}
          <button className="btn btn-line" disabled={busy || uploading > 0} onClick={() => save('draft')}>Save draft</button>
          <button className={`btn btn-solid ${saved ? 'is-saved' : ''}`} aria-busy={busy} disabled={busy || uploading > 0} onClick={savePrimary}>{primaryLabel}</button>
        </div>
      </div>
      {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : ''}`} role="status">{msg[1]}</p>}

      <div className="card-box">
        <h2 style={{ fontSize: 17, fontWeight: 600 }}>Photos</h2>
        <p className="hint">Up to 8. The first photo is the cover on cards and in search. Photos are resized for the web as they upload.</p>
        <div className="img-grid">
          {images.map((img, i) => (
            <div className="img-cell" key={img.url}>
              <div className="th"><img className="pimg" src={img.url} alt="" />{i === 0 && <span className="pill-s accent" style={{ position: 'absolute', top: 6, left: 6 }}>Cover</span>}</div>
              <div className="acts"><button onClick={() => move(i, -1)} aria-label="Move left" disabled={i === 0}>←</button><button onClick={() => move(i, 1)} aria-label="Move right" disabled={i === images.length - 1}>→</button><button onClick={() => removeImg(i)} aria-label="Remove photo">✕</button></div>
            </div>
          ))}
          {uploading > 0 && <div className="img-cell"><div className="th" style={{ display: 'grid', placeItems: 'center' }}><span className="hint">Uploading…</span></div></div>}
        </div>
        <div className="drop" role="button" tabIndex={0} onClick={() => fileRef.current?.click()} onKeyDown={(e) => { if (e.key === 'Enter') fileRef.current?.click(); }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); upload([...e.dataTransfer.files]); }}>Drag photos here, or tap to choose</div>
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { upload([...e.target.files]); e.target.value = ''; }} />
      </div>

      <div className="card-box">
        <h2 style={{ fontSize: 17, fontWeight: 600 }}>Details</h2>
        <div className="form-grid">
          <label className="lbl full">Name<input className="input" value={f.name} onChange={set('name')} placeholder="e.g. Foldable 1000W Hair Dryer" /></label>
          <label className="lbl">Price (₦)<input className="input" type="number" min="0" inputMode="numeric" value={f.price} onChange={set('price')} /></label>
          <div className="lbl"><span className="sale-row">Put on sale<label className="switch"><input type="checkbox" checked={onSale} onChange={toggleSale} /><span className="track" aria-hidden="true" /></label></span>
            {onSale ? <input className="input" type="number" min="0" inputMode="numeric" value={f.compare_at} onChange={set('compare_at')} placeholder="Was price (₦)" aria-label="Was price" /> : <small>Off — sold at the normal price.</small>}
          </div>
          {onSale && f.compare_at !== '' && Number(f.compare_at) > Number(f.price) && <p className="hint full">Shows as {naira(f.price)} <s>{naira(f.compare_at)}</s>, {Math.round((1 - f.price / f.compare_at) * 100)}% off, and appears in Deals.</p>}
          <label className="lbl">Main category<select className="select" value={f.category} onChange={set('category')}>{CATS.map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select></label>
          <label className="lbl">Badge <small>optional, e.g. Trending</small><input className="input" value={f.badge} onChange={set('badge')} maxLength={20} /></label>
          <div className="lbl full">Also show in
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontWeight: 400 }}>{CATS.filter(([k]) => k !== f.category).map(([k, n]) => <label key={k} className="chk2"><input type="checkbox" checked={f.extra.includes(k)} onChange={() => toggleIn('extra', k)} />{n}</label>)}</div>
          </div>
          <div className="lbl full">Home page placement
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontWeight: 400 }}>
              <label className="chk2"><input type="checkbox" checked={f.tags.includes('new')} onChange={() => toggleIn('tags', 'new')} />New in</label>
              <label className="chk2"><input type="checkbox" checked={f.tags.includes('bestseller')} onChange={() => toggleIn('tags', 'bestseller')} />Bestseller</label>
            </div>
          </div>
          <label className="lbl full">Description<textarea className="textarea" value={f.description} onChange={set('description')} placeholder="What it is, what it does, size or capacity." /></label>
          <label className="lbl full">Care<textarea className="textarea" style={{ minHeight: 70 }} value={f.care} onChange={set('care')} /></label>
          <div className="lbl full">
            <span className="sale-row">Personalised product<label className="switch"><input type="checkbox" checked={personalise} onChange={(e) => setPersonalise(e.target.checked)} /><span className="track" aria-hidden="true" /></label></span>
            {personalise
              ? <><input className="input" value={f.custom_label} onChange={set('custom_label')} maxLength={60} placeholder="e.g. Name to print on the cover" style={{ marginTop: 8 }} /><small>The text prompt the customer fills in. Leave blank to use “Name or text to print”. Their text and colour come through on the order and emails.</small>
                 <label className="chk2" style={{ marginTop: 10 }}><input type="checkbox" checked={f.custom_photo} onChange={(e) => { setF({ ...f, custom_photo: e.target.checked }); setSaved(false); }} /> Let the customer upload a picture to print</label>
                 <label className="lbl" style={{ marginTop: 10 }}>Personalisation fee (₦)<input className="input" type="number" min="0" inputMode="numeric" value={f.custom_fee} onChange={set('custom_fee')} placeholder="0" style={{ maxWidth: 200 }} /><small>Added to the price when a customer chooses to personalise. Leave 0 for free personalisation.</small></label></>
              : <small>Off. Turn on for items you print or engrave with a name, date, message or picture.</small>}
          </div>
        </div>
      </div>

      <div className="card-box">
        <div className="row-between"><h2 style={{ fontSize: 17, fontWeight: 600 }}>Colours &amp; stock</h2><button className="btn btn-line" style={{ height: 38 }} onClick={() => setVariants([...variants, { id: null, colour: '', hex: '#cccccc', stock: 0 }])}>Add colour</button></div>
        <p className="hint">The store shows “Only 3 left” at 4 or fewer, and “Sold out” at 0. Stock drops automatically when an order is paid.</p>
        <div className="var-row var-head hint" style={{ fontSize: 12 }}><span>Colour name</span><span>Swatch</span><span>In stock</span><span /></div>
        {variants.map((v, i) => (
          <div className="var-row" key={v.id || `new-${i}`}>
            <label className="vf vf-name"><span className="vl">Colour name</span><input className="input" value={v.colour} placeholder="e.g. Rose" onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, colour: e.target.value } : x)))} aria-label="Colour name" /></label>
            <label className="vf"><span className="vl">Swatch</span><input type="color" value={v.hex} onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))} aria-label="Swatch colour" /></label>
            <label className="vf"><span className="vl">In stock</span><input className="input" type="number" min="0" inputMode="numeric" value={v.stock} onChange={(e) => setVariants(variants.map((x, j) => (j === i ? { ...x, stock: e.target.value } : x)))} aria-label="Stock" /></label>
            <button className="icon-btn var-x" aria-label="Remove colour" disabled={variants.length === 1} onClick={() => setVariants(variants.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
      </div>

      <div className="card-box">
        <h2 style={{ fontSize: 17, fontWeight: 600 }}>Status</h2>
        <div className="seg" style={{ maxWidth: 480, gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[['draft', 'Draft'], ['live', 'Live'], ['archived', 'Archived']].map(([k, l]) => <label key={k}><input type="radio" name="status" checked={f.status === k} onChange={() => setF({ ...f, status: k })} /> {l}</label>)}
        </div>
        <p className="hint">Drafts and archived products are hidden from the store. Archive instead of deleting so past orders keep their details.</p>
      </div>

      <div className="adm-savebar">
        <span className="asb-name">{saved ? <span className="asb-saved">✓ Saved</span> : <>{f.name || (isNew ? 'New product' : 'Edit product')}<small>{f.status === 'live' ? 'Live' : f.status === 'archived' ? 'Archived' : 'Draft'}</small></>}</span>
        <button className="btn btn-line" disabled={busy || uploading > 0} onClick={() => save('draft')}>Save draft</button>
        <button className={`btn btn-solid ${saved ? 'is-saved' : ''}`} aria-busy={busy} disabled={busy || uploading > 0} onClick={savePrimary}>{primaryLabel}</button>
      </div>
    </>
  );
}
