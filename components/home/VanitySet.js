'use client';
import Link from 'next/link';
import { useCart } from '../CartProvider';
import { naira } from '@/lib/format';

export default function VanitySet({ items }) {
  const { add } = useCart();
  if (items.length < 2) return null;
  const sum = items.reduce((a, p) => a + p.price, 0);
  const firstVariant = (p) => p.variants.find((v) => v.stock > 0);
  return (
    <section id="room" aria-labelledby="room-h">
      <div className="wrap room">
        <div className="room-copy">
          <span className="eyebrow">Shop the set</span>
          <h2 id="room-h">Build your vanity corner</h2>
          <p>{items.length} pieces for hair, scent and storage. Add them one at a time, or all together.</p>
          <div className="room-list">
            {items.map((p, i) => (
              <div className="room-item" key={p.id}>
                <Link className="th tone-3" href={`/product/${p.slug}`}><img className="pimg" src={p.images[0]} alt="" /></Link>
                <Link href={`/product/${p.slug}`} style={{ minWidth: 0 }}><b><span className="mo-i">{i + 1}</span>{p.name}</b><span>{naira(p.price)}{p.compare_at ? <s style={{ opacity: 0.7, marginLeft: 6 }}>{naira(p.compare_at)}</s> : null}</span></Link>
                <button className="plus" aria-label={`Add ${p.name}`} onClick={() => add(p, firstVariant(p), 1, { silent: true })}>+</button>
              </div>
            ))}
          </div>
          <button className="btn btn-solid" style={{ width: '100%', justifyContent: 'center' }} onClick={() => items.forEach((p, i) => add(p, firstVariant(p), 1, { silent: i < items.length - 1 }))}>Add all {items.length} · {naira(sum)}</button>
        </div>
        <div className="mosaic">{items.map((p, i) => <Link className="mo" key={p.id} href={`/product/${p.slug}`} aria-label={p.name}><img className="pimg" src={p.images[0]} alt="" /><span className="mo-n">{i + 1}</span></Link>)}</div>
      </div>
    </section>
  );
}
