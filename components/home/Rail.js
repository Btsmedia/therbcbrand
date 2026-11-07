'use client';
import { useRef, useState } from 'react';
import ProductCard from '../ProductCard';
import { Prev, Next } from '../Icons';

export default function Rail({ eyebrow, title, id, tabs, products }) {
  const [f, setF] = useState(tabs[0][0]);
  const ref = useRef(null);
  const list = products.filter((p) => (f === 'new' || f === 'bestseller' ? p.tags.includes(f) : p.categories.includes(f)));
  return (
    <section id={id} style={{ paddingTop: 0 }} aria-labelledby={`${id}-h`}>
      <div className="wrap">
        <div className="sec-head">
          <div><h2 id={`${id}-h`}>{title}</h2></div>
          <div className="head-tools">
            <div className="tabs" role="tablist">
              {tabs.map(([k, n]) => <button key={k} className="tab" role="tab" aria-selected={f === k} onClick={() => { setF(k); if (ref.current) ref.current.scrollLeft = 0; }}>{n}</button>)}
            </div>
            <div className="rail-nav">
              <button className="arrow" aria-label="Previous" onClick={() => ref.current?.scrollBy({ left: -ref.current.clientWidth * 0.8, behavior: 'smooth' })}><Prev /></button>
              <button className="arrow" aria-label="Next" onClick={() => ref.current?.scrollBy({ left: ref.current.clientWidth * 0.8, behavior: 'smooth' })}><Next /></button>
            </div>
          </div>
        </div>
        <div className="rail" ref={ref}>{list.map((p, i) => <ProductCard key={p.id} p={p} tone={(i % 5) + 1} />)}</div>
      </div>
    </section>
  );
}
