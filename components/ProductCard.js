'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './CartProvider';
import { Heart } from './Icons';
import Stars from './Stars';
import { naira, pctOff } from '@/lib/format';
import { catLabel } from '@/lib/categories';

export default function ProductCard({ p, tone = 1 }) {
  const { add, wish, toggleWish } = useCart();
  const [vi, setVi] = useState(Math.max(0, p.variants.findIndex((v) => v.stock > 0)));
  const v = p.variants[vi];
  const stock = p.variants.reduce((a, x) => a + x.stock, 0);
  const soldOut = stock === 0;
  const off = pctOff(p);
  const badges = [p.compare_at ? `−${off}%` : null, p.tags.includes('new') ? 'New' : null, p.badge, soldOut ? 'Sold out' : null].filter(Boolean);
  const href = `/product/${p.slug}`;
  return (
    <article className="card">
      <div className={`media tone-${tone}`}>
        <Link href={href} aria-label={p.name}>
          <img className="pimg main" src={p.images[0]} alt={p.name} loading="lazy" />
          <img className="pimg alt" src={p.images[1] || p.images[0]} alt="" loading="lazy" />
        </Link>
        <div className="badges">{badges.map((b) => <span key={b} className={`badge ${b.startsWith('−') ? 'sale' : b === 'New' ? 'new' : ''}`}>{b}</span>)}</div>
        <button className="wish" aria-pressed={wish.includes(p.id)} onClick={() => toggleWish(p.id)} aria-label={`Save ${p.name}`}><Heart /></button>
        {soldOut ? <button className="quick" disabled>Sold out</button> : <button className="quick" onClick={() => add(p, v)}>Quick add · {naira(p.price)}</button>}
      </div>
      <p className="vendor">{catLabel(p.category)}</p>
      <h3><Link href={href}>{p.name}</Link></h3>
      {p.reviewCount > 0 && <p className="rate"><Stars value={p.rating} />{p.rating.toFixed(1)} ({p.reviewCount})</p>}
      <p className="price"><span>{naira(p.price)}</span>{p.compare_at && <><s>{naira(p.compare_at)}</s><em>Save {naira(p.compare_at - p.price)}</em></>}</p>
      {!soldOut && stock <= 4 && <p className="stock">Only {stock} left</p>}
      {p.variants.length > 1 && (
        <div className="swatches">
          {p.variants.map((x, i) => <button key={x.id} className="sw" style={{ background: x.hex }} aria-pressed={i === vi} aria-label={x.colour} onClick={() => setVi(i)} />)}
          <span className="sw-name">{v.colour}</span>
        </div>
      )}
    </article>
  );
}
