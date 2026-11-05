'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { useCart } from './CartProvider';
import { Close, Arrow } from './Icons';
import { naira } from '@/lib/format';
import { CATEGORIES } from '@/lib/categories';

const CATS = CATEGORIES.map(([s, l]) => [s, l]);
const SORTS = { featured: (a, b) => a.position - b.position, best: (a, b) => (b.tags.includes('bestseller') - a.tags.includes('bestseller')) || a.position - b.position, new: (a, b) => (b.tags.includes('new') - a.tags.includes('new')) || a.position - b.position, lo: (a, b) => a.price - b.price, hi: (a, b) => b.price - a.price, az: (a, b) => a.name.localeCompare(b.name), za: (a, b) => b.name.localeCompare(a.name), rating: (a, b) => b.rating - a.rating };
const PRESETS = [[0, 9999, 'Under ₦10k'], [10000, 20000, '₦10k–20k'], [20000, null, 'Over ₦20k']];

export default function ShopClient({ products, initial, deal }) {
  const { wish } = useCart();
  const [cat, setCat] = useState(new Set(initial.cat ? [initial.cat] : []));
  const [colours, setColours] = useState(new Set());
  const [avail, setAvail] = useState(new Set());
  const [sale, setSale] = useState(!!initial.sale);
  const [saved, setSaved] = useState(!!initial.saved);
  const [min, setMin] = useState(initial.min ?? '');
  const [max, setMax] = useState(initial.max ?? '');
  const [q, setQ] = useState(initial.q || '');
  const [sort, setSort] = useState(initial.sort || 'featured');
  const [shown, setShown] = useState(12);
  const [cols, setCols] = useState(3);
  const [panel, setPanel] = useState(true);
  const [drawer, setDrawer] = useState(false);

  // when the URL changes (e.g. a nav link), reset to its filters
  useEffect(() => {
    setCat(new Set(initial.cat ? [initial.cat] : [])); setSale(!!initial.sale); setSaved(!!initial.saved);
    setMin(initial.min ?? ''); setMax(initial.max ?? ''); setQ(initial.q || ''); setSort(initial.sort || 'featured'); setShown(12); setColours(new Set()); setAvail(new Set());
  }, [initial]);

  const allColours = useMemo(() => { const m = new Map(); products.forEach((p) => p.variants.forEach((v) => m.set(v.colour, v.hex))); return [...m]; }, [products]);

  const match = (p, skip) => {
    const stock = p.variants.reduce((a, v) => a + v.stock, 0);
    if (skip !== 'cat' && cat.size && ![...cat].some((c) => p.categories.includes(c))) return false;
    if (skip !== 'colour' && colours.size && !p.variants.some((v) => colours.has(v.colour))) return false;
    if (skip !== 'avail' && avail.size && !avail.has(stock > 0 ? 'in' : 'out')) return false;
    if (skip !== 'sale' && sale && !p.compare_at) return false;
    if (saved && !wish.includes(p.id)) return false;
    if (min !== '' && p.price < Number(min)) return false;
    if (max !== '' && p.price > Number(max)) return false;
    if (q && !`${p.name} ${p.description} ${p.categories.join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  };
  const list = products.filter((p) => match(p)).sort(SORTS[sort] || SORTS.featured);
  const visible = list.slice(0, shown);
  const toggle = (set, setter, v) => { const n = new Set(set); n.has(v) ? n.delete(v) : n.add(v); setter(n); setShown(12); };
  const clearAll = () => { setCat(new Set()); setColours(new Set()); setAvail(new Set()); setSale(false); setSaved(false); setMin(''); setMax(''); setQ(''); setShown(12); };

  const pills = [
    ...[...cat].map((c) => [CATS.find((x) => x[0] === c)?.[1] || c, () => toggle(cat, setCat, c)]),
    ...[...colours].map((c) => [`Colour: ${c}`, () => toggle(colours, setColours, c)]),
    ...[...avail].map((a) => [a === 'in' ? 'In stock' : 'Out of stock', () => toggle(avail, setAvail, a)]),
    ...(sale ? [['On sale', () => setSale(false)]] : []),
    ...(saved ? [['Saved pieces', () => setSaved(false)]] : []),
    ...(min !== '' || max !== '' ? [[`${naira(min || 0)} – ${max !== '' ? naira(max) : 'any'}`, () => { setMin(''); setMax(''); }]] : []),
    ...(q ? [[`“${q}”`, () => setQ('')]] : []),
  ];
  const onlyCat = cat.size === 1 ? [...cat][0] : cat.size === 0 ? 'all' : null;

  const count = (fn) => products.filter(fn).length;
  const Chk = ({ label, checked, onChange, n }) => (
    <label className={`chk ${n === 0 && !checked ? 'dis' : ''}`}><input type="checkbox" checked={checked} onChange={onChange} /><span>{label}</span><span className="c">{n}</span></label>
  );

  const filters = (
    <>
      <details className="fg" open><summary>Category</summary><div className="opts">
        {CATS.map(([k, n]) => <Chk key={k} label={n} checked={cat.has(k)} onChange={() => toggle(cat, setCat, k)} n={count((p) => match(p, 'cat') && p.categories.includes(k))} />)}
      </div></details>
      <details className="fg" open><summary>Price</summary>
        <div className="range">
          <label><span>₦</span><input type="number" inputMode="numeric" min="0" step="1000" placeholder="0" value={min} onChange={(e) => { setMin(e.target.value); setShown(12); }} aria-label="Minimum price" /></label>to
          <label><span>₦</span><input type="number" inputMode="numeric" min="0" step="1000" placeholder="50,000" value={max} onChange={(e) => { setMax(e.target.value); setShown(12); }} aria-label="Maximum price" /></label>
        </div>
        <div className="presets">{PRESETS.map(([a, b, l]) => { const on = Number(min || 0) === a && (b == null ? max === '' : Number(max) === b) && (min !== '' || max !== ''); return <button key={l} aria-pressed={on} onClick={() => { if (on) { setMin(''); setMax(''); } else { setMin(String(a)); setMax(b == null ? '' : String(b)); } setShown(12); }}>{l}</button>; })}</div>
      </details>
      <details className="fg" open><summary>Colour</summary><div className="fsw">
        {allColours.map(([c, hex]) => <button key={c} className="sw" style={{ background: hex }} aria-pressed={colours.has(c)} aria-label={c} title={c} disabled={!colours.has(c) && count((p) => match(p, 'colour') && p.variants.some((v) => v.colour === c)) === 0} onClick={() => toggle(colours, setColours, c)} />)}
      </div></details>
      <details className="fg" open><summary>Availability</summary><div className="opts">
        <Chk label="In stock" checked={avail.has('in')} onChange={() => toggle(avail, setAvail, 'in')} n={count((p) => match(p, 'avail') && p.variants.some((v) => v.stock > 0))} />
        <Chk label="Out of stock" checked={avail.has('out')} onChange={() => toggle(avail, setAvail, 'out')} n={count((p) => match(p, 'avail') && !p.variants.some((v) => v.stock > 0))} />
      </div></details>
      <details className="fg" open><summary>Offers</summary><div className="opts">
        <Chk label="On sale" checked={sale} onChange={() => { setSale(!sale); setShown(12); }} n={count((p) => match(p, 'sale') && p.compare_at)} />
      </div></details>
    </>
  );

  return (
    <>
      <section className="mk-hero"><div className="wrap">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><b>Marketplace</b></nav>
        <div className="mk-title"><h1 className="display">The Marketplace</h1><p>Every RBC find in one place. Filter by category, colour or budget, and sort by price or what&apos;s new.</p></div>
      </div></section>
      <section className="mk"><div className="wrap">
        <div className="mk-cats" role="tablist">
          <button className="tab" role="tab" aria-selected={onlyCat === 'all' && !sale} onClick={() => { setCat(new Set()); setSale(false); setShown(12); }}>All pieces <span style={{ opacity: 0.6, fontWeight: 500 }}>{products.length}</span></button>
          {CATS.map(([k, n]) => <button key={k} className="tab" role="tab" aria-selected={onlyCat === k && !sale} onClick={() => { setCat(new Set([k])); setSale(false); setShown(12); }}>{n} <span style={{ opacity: 0.6, fontWeight: 500 }}>{count((p) => p.categories.includes(k))}</span></button>)}
          <button className="tab" role="tab" aria-selected={sale && cat.size === 0} style={{ color: 'var(--azalea)' }} onClick={() => { setCat(new Set()); setSale(true); setShown(12); }}>Deals</button>
        </div>
        <div className="mk-bar">
          <button className="fbtn" onClick={() => (matchMedia('(max-width:900px)').matches ? setDrawer(true) : setPanel(!panel))} aria-controls="filters">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M7 12h10M10 18h4" /></svg><span>{panel ? 'Filters' : 'Show filters'}</span><span className="n" data-n={pills.length}>{pills.length}</span>
          </button>
          <span id="mkCount">{list.length} {list.length === 1 ? 'product' : 'products'}</span>
          <label className="sort" htmlFor="mkSort"><span>Sort by</span>
            <select id="mkSort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option><option value="best">Best selling</option><option value="new">Newest</option><option value="rating">Top rated</option><option value="lo">Price, low to high</option><option value="hi">Price, high to low</option><option value="az">Alphabetical, A–Z</option><option value="za">Alphabetical, Z–A</option>
            </select></label>
          <div className="dens" role="group" aria-label="Grid density">{[2, 3, 4].map((n) => <button key={n} aria-pressed={cols === n} aria-label={`${n} per row`} onClick={() => setCols(n)}><svg viewBox="0 0 20 20" fill="currentColor">{Array.from({ length: n * 2 }, (_, i) => { const w = (18 - (n - 1) * 1.5) / n; return <rect key={i} x={1 + (i % n) * (w + 1.5)} y={i < n ? 2 : 11} width={w} height="7" rx="1" />; })}</svg></button>)}</div>
        </div>
        {pills.length > 0 && <div className="pills">{pills.map(([l, rm]) => <button key={l} className="pill" onClick={rm}>{l} <span aria-hidden="true">×</span></button>)}<button className="pill clear" onClick={clearAll}>Remove all</button></div>}
        <div className={`mk-body ${panel ? '' : 'nofilters'}`}>
          <div className={`veil ${drawer ? 'on' : ''}`} onClick={() => setDrawer(false)} />
          <aside className={`filters ${drawer ? 'on' : ''}`} id="filters" aria-label="Filters">
            <div className="f-head"><h2>Filter</h2><button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close filters"><Close /></button></div>
            <div className="f-scroll">{filters}</div>
            <div className="f-foot"><button className="btn btn-line" onClick={clearAll}>Remove all</button><button className="btn btn-solid" onClick={() => setDrawer(false)}>Show {list.length} results</button></div>
          </aside>
          <div>
            <div className="grid" style={{ '--cols': panel ? cols : Math.max(cols, 3) }}>
              {list.length === 0 && <div className="mk-empty"><h3>No pieces match</h3><p>{saved ? 'Tap the heart on any piece to save it here.' : 'Try removing a filter or widening the price range.'}</p><button className="btn btn-solid" onClick={clearAll}>Remove all filters</button></div>}
              {visible.map((p, i) => (
                <FragmentWithPromo key={p.id} index={i} showPromo={!!deal && !sale && visible.length >= 6 && i === 4} deal={deal}><ProductCard p={p} tone={(i % 5) + 1} /></FragmentWithPromo>
              ))}
            </div>
            {list.length > 0 && (
              <div className="more"><p>Showing {visible.length} of {list.length} products</p><div className="bar"><i style={{ width: `${(visible.length / list.length) * 100}%` }} /></div>
                {visible.length < list.length && <button className="btn btn-line" onClick={() => setShown(shown + 12)}>Load more</button>}</div>
            )}
          </div>
        </div>
      </div></section>
    </>
  );
}

function FragmentWithPromo({ children, showPromo, deal }) {
  return (
    <>
      {showPromo && (
        <Link className="promo-card" href="/shop?sale=1"><img className="pc-img" src={deal.img || '/img/7283.jpg'} alt="" loading="lazy" />
          <div><span className="eyebrow">{deal.eyebrow}</span><h3>{deal.title} {deal.highlight}</h3><p>{deal.blurb}</p><span className="link-arrow">{deal.cta} <Arrow /></span></div></Link>
      )}
      {children}
    </>
  );
}
