'use client';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { Search, User, Heart, Bag, Menu, Close, Flower } from './Icons';

const NAV = [
  ['beauty', 'Bath & beauty'], ['gadgets', 'Gadgets'], ['kitchen', 'Kitchen'], ['lighting', 'Lighting'], ['storage', 'Storage'],
];
const POPULAR = ['Hair dryer', 'Tripod', 'Lamp', 'Chopper', 'Speaker', 'Towel'];

export default function Header({ deal, announcement }) {
  const { count, setOpen, wish } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const qs = params.toString();
  useEffect(() => { setMenu(false); setSearch(false); }, [path, qs]);
  // which menu item matches the page you're on
  const current = path === '/shop' ? (params.get('sale') === '1' ? 'sale' : params.get('cat') || (params.get('saved') ? '' : 'all')) : path === '/account' ? 'account' : '';
  // tapping a menu item always closes the menu and lands on that view, even if you're already on it
  const goTo = (e, href) => {
    e.preventDefault();
    setMenu(false);
    if (`${path}${qs ? `?${qs}` : ''}` === href) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    router.push(href);
    window.scrollTo({ top: 0 });
  };
  const MItem = ({ id, href, children, style }) => (
    <Link href={href} onClick={(e) => goTo(e, href)} aria-current={current === id ? 'page' : undefined} className={current === id ? 'on' : ''} style={style}>{children}</Link>
  );
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') { setMenu(false); setSearch(false); } };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, []);
  const go = (term) => { setSearch(false); router.push(`/shop?q=${encodeURIComponent(term)}`); };

  if (path.startsWith('/checkout') || path.startsWith('/admin')) return null;

  return (
    <>
      <div className={`util tone-${announcement?.tone || 'deep'}`}><div className="wrap">
        <div className="side"><Link href="/account">Track an order</Link>{deal && <Link href="/shop?sale=1">{deal.label}</Link>}</div>
        <p className="mid">{announcement?.on ? <>{announcement.text}{announcement.link && <> <Link className="ann-link" href={announcement.link}>{announcement.linkLabel || 'Shop now'} →</Link></>}</> : null}</p>
        <div className="side"><a href="#help">Contact us</a><span>NG · ₦ NGN</span></div>
      </div></div>
      <header className="site">
        <div className="wrap hdr">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="icon-btn burger" onClick={() => setMenu(true)} aria-label="Open menu"><Menu /></button>
            <ul className="nav">
              <li><Link href="/shop" aria-current={current === 'all' ? 'page' : undefined}>Shop</Link>
                <div className="mega"><div className="wrap">
                  <div><h4>Bath &amp; beauty</h4><ul><li><Link href="/shop?cat=beauty">Hair tools</Link></li><li><Link href="/shop?cat=beauty">Skincare</Link></li><li><Link href="/shop?cat=beauty">Towels &amp; bath</Link></li><li><Link href="/shop?cat=beauty">View all beauty</Link></li></ul></div>
                  <div><h4>Tech &amp; gadgets</h4><ul><li><Link href="/shop?cat=gadgets">Tripods &amp; stands</Link></li><li><Link href="/shop?cat=gadgets">Fill lights</Link></li><li><Link href="/shop?cat=gadgets">Speakers</Link></li><li><Link href="/shop?cat=gadgets">View all gadgets</Link></li></ul></div>
                  <div><h4>Home</h4><ul><li><Link href="/shop?cat=kitchen">Kitchen helpers</Link></li><li><Link href="/shop?cat=lighting">Lighting</Link></li><li><Link href="/shop?cat=storage">Storage</Link></li><li><Link href="/shop?cat=decor">Decor</Link></li><li><Link href="/shop">The full marketplace</Link></li></ul></div>
                  {deal && <Link className="promo" href="/shop?sale=1"><img src={deal.img || '/img/7285.jpg'} alt="" /><div><strong>{deal.label}</strong><span>Up to {deal.maxOff}% off selected pieces</span></div></Link>}
                </div></div>
              </li>
              {NAV.map(([c, n]) => <li key={c}><Link href={`/shop?cat=${c}`} aria-current={current === c ? 'page' : undefined}>{n}</Link></li>)}
              <li><Link href="/shop?sale=1" className="sale" aria-current={current === 'sale' ? 'page' : undefined}>Sale</Link></li>
            </ul>
          </div>
          <Link className="logo" href="/" aria-label="RBC home"><Flower />RBC</Link>
          <div className="icons">
            <button className="icon-btn s-trigger" onClick={() => setSearch(true)} aria-label="Search"><Search /><span className="s-pill" aria-hidden="true">Search gifts</span></button>
            <Link className="icon-btn hide-sm" href="/account" aria-label="Account"><User /></Link>
            <Link className="icon-btn" href="/shop?saved=1" aria-label="Wishlist"><Heart /><span className="count" data-n={wish.length}>{wish.length}</span></Link>
            <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Cart"><Bag /><span className="count" data-n={count}>{count}</span></button>
          </div>
        </div>
      </header>

      <div className={`veil ${menu || search ? 'on' : ''}`} onClick={() => { setMenu(false); setSearch(false); }} />
      <aside className={`drawer left ${menu ? 'on' : ''}`} aria-hidden={!menu} aria-label="Menu">
        <div className="dr-head"><Link className="logo" href="/" style={{ fontSize: 26 }}>RBC</Link><button className="icon-btn" onClick={() => setMenu(false)} aria-label="Close menu"><Close /></button></div>
        <div />
        <nav className="mnav">
          <MItem id="all" href="/shop">Shop all <small>Marketplace</small></MItem>
          <MItem id="beauty" href="/shop?cat=beauty">Bath &amp; beauty <small>Hair · Skin · Bath</small></MItem>
          <MItem id="gadgets" href="/shop?cat=gadgets">Tech &amp; gadgets <small>Tripods · Lights</small></MItem>
          <MItem id="kitchen" href="/shop?cat=kitchen">Kitchen</MItem>
          <MItem id="lighting" href="/shop?cat=lighting">Lighting</MItem>
          <MItem id="storage" href="/shop?cat=storage">Storage</MItem>
          <MItem id="decor" href="/shop?cat=decor">Decor</MItem>
          <MItem id="sale" href="/shop?sale=1" style={{ color: 'var(--azalea)' }}>Deals</MItem>
          <MItem id="account" href="/account">My account</MItem>
        </nav>
        <div />
      </aside>
      <div className={`search ${search ? 'on' : ''}`} aria-hidden={!search} role="dialog" aria-label="Search">
        <div className="wrap">
          <form className="s-bar" onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()); }}>
            <Search /><label htmlFor="q" style={{ position: 'absolute', left: -9999 }}>Search products</label>
            <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hair dryers, tripods, lamps…" autoComplete="off" />
            <button type="button" className="icon-btn" onClick={() => setSearch(false)} aria-label="Close search"><Close /></button>
          </form>
          <div className="s-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div><h4 className="eyebrow">Popular searches</h4><div className="s-pop">{POPULAR.map((w) => <button key={w} className="tab" onClick={() => go(w)}>{w}</button>)}</div></div>
          </div>
        </div>
      </div>
    </>
  );
}
