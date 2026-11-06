'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { useCart } from '../CartProvider';
import Stars from '../Stars';
import { Heart } from '../Icons';
import { naira, pctOff } from '@/lib/format';
import TrustList from './TrustList';
import StickyBuy from './StickyBuy';

export default function ProductView({ p, bundle, whatsapp }) {
  const { add, wish, toggleWish } = useCart();
  const router = useRouter();
  const [img, setImg] = useState(0);
  const [vi, setVi] = useState(Math.max(0, p.variants.findIndex((v) => v.stock > 0)));
  const [qty, setQty] = useState(1);
  const [going, setGoing] = useState(false);
  const [custom, setCustom] = useState('');
  const [customErr, setCustomErr] = useState(false);
  const [photo, setPhoto] = useState('');       // uploaded picture URL
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoErr, setPhotoErr] = useState('');
  const photoRef = useRef(null);
  const canPersonalise = !!p.personalise;
  const textLabel = p.customLabel || 'Name or text to print';
  const [pOn, setPOn] = useState(false);          // the customer opted into personalisation
  const fee = p.customFee || 0;
  const v = p.variants[vi];
  const soldOut = !v || v.stock === 0;
  const unit = p.price + (pOn ? fee : 0);         // what one of this item costs now
  // when personalisation is on the text is required; a picture is an optional extra
  const needsText = pOn && !custom.trim();
  const tryAdd = (opts = {}) => {
    if (photoBusy) { setPhotoErr('Please wait for the picture to finish uploading.'); return false; }
    if (needsText) { setCustomErr(true); document.getElementById('pdp-custom')?.focus(); return false; }
    add(p, v, qty, { ...opts, personalise: pOn, custom: pOn ? custom : undefined, customPhoto: pOn && p.customPhoto ? photo : undefined });
    return true;
  };

  async function pickPhoto(file) {
    if (!file) return;
    setPhotoErr(''); setPhotoBusy(true); setPhoto('');
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas'); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
      if (!blob) throw new Error('read');
      const fd = new FormData(); fd.append('file', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
      const r = await fetch('/api/custom-upload', { method: 'POST', body: fd });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Upload failed.');
      setPhoto(j.url);
    } catch (e) { setPhotoErr(e.message === 'read' ? 'Couldn’t read that image. Try a JPG or PNG.' : e.message || 'Upload failed. Please try again.'); }
    setPhotoBusy(false);
  }
  const off = pctOff(p);
  const [picked, setPicked] = useState(() => Object.fromEntries(bundle.map((b) => [b.id, true])));
  const bundlePicked = bundle.filter((b) => picked[b.id]);
  const bundleSum = bundlePicked.reduce((a, b) => a + b.price, 0);
  const firstVariant = (x) => (x.id === p.id ? v : x.variants.find((y) => y.stock > 0));

  return (
    <>
      <div className="wrap"><nav className="crumbs" aria-label="Breadcrumb" style={{ paddingTop: 20 }}><Link href="/">Home</Link><span>/</span><Link href={`/shop?cat=${p.category}`}>{p.category === 'beauty' ? 'Bath & beauty' : p.category[0].toUpperCase() + p.category.slice(1)}</Link><span>/</span><b>{p.name}</b></nav></div>
      <div className="wrap pdp">
        <div className="gal">
          <div className="gal-thumbs">{p.images.length > 1 && p.images.map((u, i) => <button key={u} aria-pressed={i === img} onClick={() => setImg(i)} aria-label={`Photo ${i + 1}`}><img className="pimg" src={u} alt="" /></button>)}</div>
          <div className={`gal-main tone-${(p.position % 5) + 1}`}><img className="pimg" src={p.images[img]} alt={p.name} /></div>
        </div>
        <div className="pdp-info">
          <span className="vendor">RBC Finds</span>
          <h1>{p.name}</h1>
          <a className="mrate" href="#reviews">{p.reviewCount ? <><Stars value={p.rating} /><span>{p.rating.toFixed(1)} · <u>{p.reviewCount} review{p.reviewCount === 1 ? '' : 's'}</u></span></> : null}</a>
          <div className="price"><span>{naira(unit)}</span>{p.compare_at && !pOn && <><s>{naira(p.compare_at)}</s><em>Save {naira(p.compare_at - p.price)} ({off}%)</em></>}{pOn && fee > 0 && <em className="pfee">incl. {naira(fee)} personalisation</em>}</div>
          <p className="desc muted">{p.description}</p>
          {p.variants.length > 0 && (
            <div className="opt" style={{ display: 'grid', gap: 10 }}>
              <span className="eyebrow">Colour · <b style={{ color: 'var(--ink)', fontWeight: 500 }}>{v?.colour}</b></span>
              <div className="swatches">{p.variants.map((x, i) => <button key={x.id} className="sw" style={{ background: x.hex, width: 28, height: 28, opacity: x.stock ? 1 : 0.35 }} aria-pressed={i === vi} aria-label={`${x.colour}${x.stock ? '' : ', sold out'}`} onClick={() => { setVi(i); setQty(1); }} />)}</div>
            </div>
          )}
          {soldOut ? <p className="stock out">Sold out in this colour</p> : v.stock <= 4 && <p className="stock">Only {v.stock} left in stock</p>}
          {canPersonalise && (
            <div className={`pers ${pOn ? 'on' : ''}`}>
              <label className="pers-opt"><input type="checkbox" checked={pOn} onChange={(e) => { setPOn(e.target.checked); setCustomErr(false); setPhotoErr(''); }} /><span><b>Personalise this{fee > 0 ? ` (+${naira(fee)})` : ''}</b><small>{p.customPhoto ? 'Add your own text, and a picture if you like' : 'Add your own text to print'}</small></span></label>
              {pOn && (
                <div className={`pers-field ${customErr ? 'err' : ''}`}>
                  <label htmlFor="pdp-custom">{textLabel} <span className="pers-req">(required)</span></label>
                  <input id="pdp-custom" type="text" maxLength={80} value={custom} onChange={(e) => { setCustom(e.target.value); setCustomErr(false); }} placeholder="Type exactly how it should appear" />
                  <span className="pers-msg">{customErr ? 'Please fill this in before adding to cart.' : `${custom.length}/80 · we print it exactly as you type it`}</span>
                </div>
              )}
              {pOn && p.customPhoto && (
                <div className="pers-field">
                  <label>Picture to print <span className="hint" style={{ fontWeight: 400 }}>(optional)</span></label>
                  {photo ? (
                    <div className="pers-photo"><img src={photo} alt="Your picture" /><button type="button" className="linkish" onClick={() => { setPhoto(''); if (photoRef.current) photoRef.current.value = ''; }}>Remove</button></div>
                  ) : (
                    <button type="button" className="pers-up" onClick={() => photoRef.current?.click()} disabled={photoBusy}>{photoBusy ? 'Uploading…' : '＋ Choose a picture'}</button>
                  )}
                  <input ref={photoRef} type="file" accept="image/jpeg,image/png" hidden onChange={(e) => { pickPhoto(e.target.files?.[0]); }} />
                  <span className="pers-msg">{photoErr ? <span style={{ color: 'var(--err)' }}>{photoErr}</span> : 'A clear JPG or PNG, up to 6MB. We print it as shown.'}</span>
                </div>
              )}
            </div>
          )}
          <div className="buy" id="pdp-buy">
            <div className="qty"><button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button><output>{qty}</output><button onClick={() => setQty(Math.min(v?.stock || 1, qty + 1))} aria-label="Increase quantity">+</button></div>
            <button className="btn btn-solid" disabled={soldOut} onClick={() => tryAdd()}>{soldOut ? 'Sold out' : 'Add to cart'}</button>
            <button className="icon-btn" style={{ width: 52, height: 52, border: '1px solid var(--line)' }} aria-pressed={wish.includes(p.id)} onClick={() => toggleWish(p.id)} aria-label="Save to wishlist"><Heart /></button>
          </div>
          <button className="btn btn-line" style={{ justifyContent: 'center', height: 52 }} aria-busy={going} disabled={soldOut || going} onClick={() => { if (tryAdd({ silent: true })) { setGoing(true); router.push('/checkout'); } }}>{going ? 'One moment…' : 'Buy it now'}</button>
          <TrustList productName={p.name} whatsapp={whatsapp} />
          <div>
            <details open><summary>Details</summary><p>{p.description}</p></details>
            <details><summary>Care</summary><p>{p.care || 'Wipe clean with a dry cloth.'}</p></details>
            <details><summary>Delivery</summary><p>Nationwide delivery takes 1–3 days, or pick up from our pickup point. We ship with GIG or DHL for farther locations. The delivery fee depends on your location and the package weight, and we confirm it after you order. Any problem with your order? Message us on WhatsApp and we’ll sort it out.</p></details>
          </div>
        </div>
      </div>

      <StickyBuy name={p.name} image={p.images[0]} price={unit} soldOut={soldOut} onAdd={() => { if (needsText) { document.getElementById('pdp-custom')?.scrollIntoView({ block: 'center' }); } tryAdd(); }} />

      {bundle.length > 1 && !soldOut && (
        <div className="wrap pdp-sec"><section className="mbt" aria-label="Usually bought together">
          <div className="bt-head"><h2>Usually bought together</h2><span className="hint">Pieces customers pair with {p.name}</span></div>
          <div className="bt">
            <div className="bt-items">{bundle.map((b, i) => (
              <span key={b.id} style={{ display: 'contents' }}>
                {i > 0 && <span className="bt-plus" aria-hidden="true">+</span>}
                <label className={`bt-item ${picked[b.id] ? '' : 'off'}`}>
                  <span className={`th tone-${(i % 5) + 2}`}><img className="pimg" src={b.images[0]} alt="" /><input type="checkbox" checked={!!picked[b.id]} onChange={(e) => setPicked({ ...picked, [b.id]: e.target.checked })} aria-label={`Include ${b.name}`} /></span>
                  <b>{i === 0 ? 'This item: ' : ''}{b.name}</b><small>{naira(b.price)}</small>
                </label>
              </span>
            ))}</div>
            <div className="bt-buy"><span className="hint">Total for {bundlePicked.length} item{bundlePicked.length === 1 ? '' : 's'}</span><strong>{naira(bundleSum)}</strong>
              <button className="btn btn-solid" disabled={!bundlePicked.length} onClick={() => bundlePicked.forEach((b, i) => add(b, firstVariant(b), 1, { silent: i < bundlePicked.length - 1 }))}>Add {bundlePicked.length === bundle.length ? `all ${bundle.length}` : bundlePicked.length} to cart</button></div>
          </div>
        </section></div>
      )}
    </>
  );
}
