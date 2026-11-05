'use client';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import Stars from '../Stars';
import { Close } from '../Icons';
import { fmtDate } from '@/lib/format';
import { getBrowserClient } from '@/lib/supabase/client';

const MAX_PHOTOS = 5, PHOTO_MB = 10, VIDEO_MB = 50, VIDEO_SECONDS = 60;

export default function Reviews({ product, reviews, access }) {
  const [filter, setFilter] = useState(0);
  const [sort, setSort] = useState('recent');
  const [mediaOnly, setMediaOnly] = useState(false);
  const [open, setOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const n = reviews.length;
  const avg = n ? reviews.reduce((a, r) => a + r.rating, 0) / n : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => reviews.filter((r) => r.rating === s).length);
  const allMedia = reviews.flatMap((r) => r.media);

  const list = useMemo(() => {
    let l = reviews.filter((r) => (!filter || r.rating === filter) && (!mediaOnly || r.media.length));
    const S = { recent: (a, b) => new Date(b.created_at) - new Date(a.created_at), high: (a, b) => b.rating - a.rating, low: (a, b) => a.rating - b.rating };
    return [...l].sort(S[sort]);
  }, [reviews, filter, sort, mediaOnly]);

  const Thumb = ({ m }) => (
    <button onClick={() => setLightbox(m)} aria-label={m.kind === 'video' ? 'Play customer video' : 'View customer photo'}>
      {m.kind === 'video' ? <><video src={`${m.url}#t=0.5`} muted preload="metadata" playsInline /><span className="play">▶</span></> : <img src={m.url} alt="Customer photo" loading="lazy" />}
    </button>
  );

  return (
    <div className="wrap pdp-sec" id="reviews">
      <section className="mrev" aria-label="Reviews">
        <div className="rv-head"><h2>Reviews</h2>{n > 0 && <span className="hint">Only verified buyers can review</span>}</div>
        {allMedia.length > 0 && (
          <div><span className="eyebrow">Customer photos &amp; videos</span><div className="media-strip" style={{ marginTop: 10 }}>{allMedia.map((m) => <Thumb key={m.id} m={m} />)}</div></div>
        )}
        <div className="rv-grid">
          {n === 0 ? (
          <div className="rv-sum">
            <p style={{ fontSize: 15, color: 'var(--ink)' }}><b>Be the first to review this.</b></p>
            <p>Bought it? A quick note (with a photo) helps other shoppers decide.</p>
            <WriteButton access={access} productSlug={product.slug} onOpen={() => setOpen(true)} />
          </div>
          ) : (
          <div className="rv-sum">
            <div className="big">{avg.toFixed(1)}</div>
            <Stars value={avg} large />
            <p>Based on {n} review{n === 1 ? '' : 's'}</p>
            <div className="rv-bars">{[5, 4, 3, 2, 1].map((s, k) => (
              <button key={s} className="rv-bar" aria-pressed={filter === s} disabled={!dist[k]} onClick={() => setFilter(filter === s ? 0 : s)} aria-label={`Show ${s}-star reviews`}>
                <span>{s}★</span><i><b style={{ width: `${n ? (dist[k] / n) * 100 : 0}%` }} /></i><span>{dist[k]}</span>
              </button>
            ))}</div>
            <WriteButton access={access} productSlug={product.slug} onOpen={() => setOpen(true)} />
          </div>
          )}
          <div>
            {open && <ReviewForm product={product} userId={access.userId} defaultName={access.name} onDone={() => setOpen(false)} />}
            {n > 0 && <div className="rv-tools">
              <span>{filter ? <>Showing {list.length} {filter}-star · <button onClick={() => setFilter(0)} style={{ textDecoration: 'underline', color: 'var(--ink)' }}>Show all</button></> : `Showing ${list.length} review${list.length === 1 ? '' : 's'}`}</span>
              <span style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <label className="chk2"><input type="checkbox" checked={mediaOnly} onChange={(e) => setMediaOnly(e.target.checked)} /> With photos &amp; videos</label>
                <label>Sort <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="recent">Most recent</option><option value="high">Highest rated</option><option value="low">Lowest rated</option></select></label>
              </span>
            </div>}
            <div className="rv-list">
              {n > 0 && list.length === 0 && <p className="rv-empty">No reviews match this filter.</p>}
              {list.map((r) => (
                <article className="rv" key={r.id}>
                  <div className="top"><Stars value={r.rating} label={`${r.rating} out of 5 stars`} /><span className="meta">{fmtDate(r.created_at)}</span></div>
                  {r.title && <h3>{r.title}</h3>}
                  <p>{r.body}</p>
                  {r.media.length > 0 && <div className="rv-media">{r.media.map((m) => <Thumb key={m.id} m={m} />)}</div>}
                  <div className="meta"><span>{r.author_name}{r.city ? ` · ${r.city}` : ''}</span><span className="verified">Verified buyer</span></div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      {lightbox && (
        <div className="lightbox" role="dialog" aria-label="Customer media" onClick={() => setLightbox(null)}>
          <button className="close" onClick={() => setLightbox(null)} aria-label="Close"><Close /></button>
          {lightbox.kind === 'video' ? <video src={lightbox.url} controls autoPlay playsInline onClick={(e) => e.stopPropagation()} /> : <img src={lightbox.url} alt="Customer photo" onClick={(e) => e.stopPropagation()} />}
        </div>
      )}
    </div>
  );
}

function WriteButton({ access, productSlug, onOpen }) {
  if (!access.enabled) return null;
  if (!access.userId) return <Link className="btn btn-line" href={`/account?next=/product/${productSlug}%23reviews`}>Sign in to write a review</Link>;
  if (access.existing) return <p className="hint">{access.existing === 'pending' ? 'Thanks! Your review is waiting for approval.' : 'You have reviewed this product.'}</p>;
  if (!access.bought) return <p className="hint">Reviews are open to customers who bought this item.</p>;
  return <button className="btn btn-line" onClick={onOpen}>Write a review</button>;
}

async function shrinkPhoto(file) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.85));
    return blob ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
  } catch { return null; } // the browser can't read this image (e.g. HEIC on Chrome)
}

function videoDuration(file) {
  return new Promise((res) => { const v = document.createElement('video'); v.preload = 'metadata'; v.onloadedmetadata = () => { res(v.duration); URL.revokeObjectURL(v.src); }; v.onerror = () => res(0); v.src = URL.createObjectURL(file); });
}

function ReviewForm({ product, userId, defaultName, onDone }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [name, setName] = useState(defaultName || '');
  const [city, setCity] = useState('');
  const [files, setFiles] = useState([]); // {file, kind, url}
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [over, setOver] = useState(false);
  const input = useRef(null);

  async function addFiles(list) {
    setErr('');
    const next = [...files];
    for (const f of list) {
      const isVideo = f.type.startsWith('video/') || /\.(mp4|mov)$/i.test(f.name);
      if (isVideo) {
        if (next.some((x) => x.kind === 'video')) { setErr('You can add one video per review.'); continue; }
        if (f.size > VIDEO_MB * 1024 * 1024) { setErr(`That video is over ${VIDEO_MB} MB. Trim it and try again.`); continue; }
        const d = await videoDuration(f);
        if (d > VIDEO_SECONDS + 0.5) { setErr(`Videos can be up to ${VIDEO_SECONDS} seconds. Yours is ${Math.round(d)} seconds.`); continue; }
        next.push({ file: f, kind: 'video', url: URL.createObjectURL(f) });
      } else {
        if (next.filter((x) => x.kind === 'photo').length >= MAX_PHOTOS) { setErr(`You can add up to ${MAX_PHOTOS} photos.`); continue; }
        if (f.size > PHOTO_MB * 1024 * 1024 * 3) { setErr(`That photo is too large. Use one under ${PHOTO_MB} MB.`); continue; }
        const small = await shrinkPhoto(f);
        if (!small) { setErr('We couldn’t read that photo. Try a JPG or PNG.'); continue; }
        next.push({ file: small, kind: 'photo', url: URL.createObjectURL(small) });
      }
    }
    setFiles(next);
  }

  async function submit(e) {
    e.preventDefault();
    if (!rating) return setErr('Choose a star rating.');
    if (body.trim().length < 10) return setErr('Write at least a sentence (10 characters or more).');
    if (!name.trim()) return setErr('Add the name to show on your review.');
    setBusy(true); setErr('');
    const sb = getBrowserClient();
    const { data: review, error } = await sb.from('reviews').insert({ product_id: product.id, user_id: userId, author_name: name.trim(), city: city.trim() || null, rating, title: title.trim() || null, body: body.trim() }).select('id').single();
    if (error) { setBusy(false); return setErr(error.code === '23505' ? 'You have already reviewed this product.' : 'We couldn’t save your review. Make sure you’re signed in with the email you ordered with.'); }
    for (const [i, f] of files.entries()) {
      const ext = f.kind === 'video' ? (f.file.name.split('.').pop() || 'mp4').toLowerCase() : 'jpg';
      const path = `${userId}/${review.id}/${i}.${ext}`;
      const up = await sb.storage.from('review-media').upload(path, f.file, { contentType: f.file.type || (f.kind === 'video' ? 'video/mp4' : 'image/jpeg') });
      if (up.error) { setErr(`One file didn’t upload (${up.error.message}). Your review was still saved.`); continue; }
      await sb.from('review_media').insert({ review_id: review.id, path, kind: f.kind });
    }
    setBusy(false); setDone(true);
  }

  if (done) return <div className="rv-form"><h3>Thank you!</h3><p className="muted">Your review will appear here once our team approves it, usually within a day.</p><div><button className="btn btn-line" onClick={onDone}>Close</button></div></div>;

  return (
    <form className="rv-form" onSubmit={submit} noValidate>
      <h3>Review {product.name}</h3>
      <div><span className="eyebrow">Your rating</span>
        <div className="pick">{[5, 4, 3, 2, 1].map((s) => <span key={s} style={{ display: 'contents' }}><input type="radio" name="rvr" id={`rvr${s}`} value={s} checked={rating === s} onChange={() => setRating(s)} /><label htmlFor={`rvr${s}`} title={`${s} star${s > 1 ? 's' : ''}`}>★</label></span>)}</div>
      </div>
      <label className="lbl">Title <small>(optional)</small><input className="input" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} /></label>
      <label className="lbl">Your review<textarea className="textarea" value={body} maxLength={2000} onChange={(e) => setBody(e.target.value)} placeholder="How are you using it? What do you like?" /></label>
      <div className="form-grid">
        <label className="lbl">Name to show<input className="input" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} autoComplete="given-name" /></label>
        <label className="lbl">City <small>(optional)</small><input className="input" value={city} maxLength={40} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Lagos" /></label>
      </div>
      <div className="upl">
        <span className="eyebrow">Photos or a video <span style={{ textTransform: 'none', letterSpacing: 0 }}>· up to {MAX_PHOTOS} photos and 1 MP4 (max {VIDEO_SECONDS}s, {VIDEO_MB} MB)</span></span>
        <div className={`drop ${over ? 'over' : ''}`} onClick={() => input.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); addFiles([...e.dataTransfer.files]); }} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') input.current?.click(); }}>
          Tap to add photos or a video, or drag them here
        </div>
        <input ref={input} type="file" accept="image/*,video/mp4,video/quicktime" multiple hidden onChange={(e) => { addFiles([...e.target.files]); e.target.value = ''; }} />
        {files.length > 0 && <div className="upl-grid">{files.map((f, i) => (
          <div className="upl-item" key={f.url}>{f.kind === 'video' ? <video src={f.url} muted playsInline /> : <img src={f.url} alt="" />}<button type="button" aria-label="Remove" onClick={() => setFiles(files.filter((_, j) => j !== i))}>×</button></div>
        ))}</div>}
      </div>
      {err && <p className="notice err" role="alert">{err}</p>}
      <div className="acts"><button className="btn btn-solid" aria-busy={busy} disabled={busy}>{busy ? 'Posting…' : 'Post review'}</button><button type="button" className="btn btn-line" onClick={onDone}>Cancel</button><span className="note2">Reviews appear after a quick check by our team.</span></div>
    </form>
  );
}
