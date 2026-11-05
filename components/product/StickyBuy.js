'use client';
import { useEffect, useState } from 'react';
import { naira } from '@/lib/format';

// Phones only (CSS): appears once the main "Add to cart" button has scrolled off the top.
export default function StickyBuy({ name, image, price, soldOut, onAdd }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById('pdp-buy');
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('has-sticky-buy', show);
    return () => document.body.classList.remove('has-sticky-buy');
  }, [show]);

  return (
    <div className={`sticky-buy ${show ? 'on' : ''}`} aria-hidden={!show}>
      {image && <img src={image} alt="" />}
      <span className="sb-txt"><b>{name}</b><small>{naira(price)}</small></span>
      <button className="btn btn-solid" disabled={soldOut} tabIndex={show ? 0 : -1} onClick={onAdd}>{soldOut ? 'Sold out' : 'Add to cart'}</button>
    </div>
  );
}
