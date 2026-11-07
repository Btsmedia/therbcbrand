'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { Heart, Bag } from './Icons';
import Stars from './Stars';
import { naira, pctOff } from '@/lib/format';

export default function ProductCard({ p, tone = 1 }) {
  const { add, wish, toggleWish } = useCart();
  const [vi, setVi] = useState(Math.max(0, p.variants.findIndex((v) => v.stock > 0)));
  const [pic, setPic] = useState(0);
  const v = p.variants[vi];
  const stock = p.variants.reduce((a, x) => a + x.stock, 0);
  const soldOut = stock === 0;
  const off = pctOff(p);
  const pics = p.images.slice(0, 4);
  const tags = [p.badge, p.tags.includes('new') ? 'New' : null, p.compare_at ? `−${off}%` : null, soldOut ? 'Sold out' : null].filter(Boolean);
  const href = `/product/${p.slug}`;
  const saved = wish.includes(p.id);
  // hovering across the photo steps through the pictures, like flicking a carousel
  const onMove = (e) => {
    if (pics.length < 2) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPic(Math.min(pics.length - 1, Math.floor(((e.clientX - r.left) / r.width) * pics.length)));
  };
  return (
    <article className="card pc">
      <div className={`media tone-${tone}`} onMouseMove={onMove} onMouseLeave={() => setPic(0)}>
        <Link href={href} aria-label={p.name}>
          {pics.map((src, i) => <img key={src + i} className={`pimg ${i === pic ? 'on' : ''}`} src={src} alt={i === 0 ? p.name : ''} loading="lazy" />)}
        </Link>
        {tags.length > 0 && <div className="pc-tags">{tags.map((t) => <span key={t} className={t.startsWith('−') ? 'sale' : t === 'Sold out' ? 'out' : ''}>{t}</span>)}</div>}
        {pics.length > 1 && <div className="pc-dots">{pics.map((_, i) => <button key={i} className={i === pic ? 'on' : ''} aria-label={`Photo ${i + 1}`} onClick={() => setPic(i)} />)}</div>}
      </div>
      <h3><Link href={href}>{p.name}</Link></h3>
      {p.reviewCount > 0 && <p className="rate"><Stars value={p.rating} />{p.rating.toFixed(1)} ({p.reviewCount})</p>}
      {p.variants.length > 1 && (
        <div className="swatches">
          {p.variants.map((x, i) => <button key={x.id} className="sw" style={{ background: x.hex }} aria-pressed={i === vi} aria-label={x.colour} onClick={() => setVi(i)} />)}
          <span className="sw-name">{v.colour}</span>
        </div>
      )}
      <div className="pc-row">
        <p className="price">{p.compare_at && <s>{naira(p.compare_at)}</s>}<span>{naira(p.price)}</span>{!soldOut && stock <= 4 && <small className="stock">Only {stock} left</small>}</p>
        <div className="pc-acts">
          <button className="pc-btn" aria-pressed={saved} onClick={() => toggleWish(p.id)} aria-label={saved ? `Remove ${p.name} from wishlist` : `Save ${p.name}`}><Heart /></button>
          <button className="pc-btn" disabled={soldOut} onClick={() => add(p, v)} aria-label={soldOut ? `${p.name} is sold out` : `Add ${p.name} to bag`}><Bag /></button>
        </div>
      </div>
    </article>
  );
}
