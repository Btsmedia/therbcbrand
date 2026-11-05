'use client';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { Search, User, Heart, Bag, Menu, Close, Flower } from './Icons';
import { CATEGORIES } from '@/lib/categories';

const NAV = CATEGORIES.slice(0, 5).map(([s, , short]) => [s, short]);
const POPULAR = ['Mug', 'Journal', 'Keychain', 'Tote bag', 'Water bottle', 'Wedding souvenir'];

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
                  <div><h4>Make it personal</h4><ul><li><Link href="/shop?cat=custom">Name &amp; photo gifts</Link></li><li><Link href="/shop?cat=drinkware">Custom mugs &amp; bottles</Link></li><li><Link href="/shop?cat=stationery">Custom journals</Link></li><li><Link href="/shop?cat=custom">View all personalised</Link></li></ul></div>
                  <div><h4>For occasions</h4><ul><li><Link href="/shop?cat=corporate">Wedding souvenirs</Link></li><li><Link href="/shop?cat=corporate">Birthday &amp; party packs</Link></li><li><Link href="/shop?cat=corporate">Corporate gifts</Link></li><li><Link href="/shop?cat=corporate">Bulk orders</Link></li></ul></div>
                  <div><h4>Shop by type</h4><ul>{CATEGORIES.slice(1, 5).map(([s, l]) => <li key={s}><Link href={`/shop?cat=${s}`}>{l}</Link></li>)}<li><Link href="/shop">Shop everything</Link></li></ul></div>
                  {deal && <Link className="promo" href="/shop?sale=1"><img src={deal.img || '/img/7285.jpg'} alt="" /><div><strong>{deal.label}</strong><span>Up to {deal.maxOff}% off selected pieces</span></div></Link>}
                </div></div>
              </li>
              {NAV.map(([c, n]) => <li key={c}><Link href={`/shop?cat=${c}`} aria-current={current === c ? 'page' : undefined}>{n}</Link></li>)}
              <li><Link href="/shop?sale=1" className="sale" aria-current={current === 'sale' ? 'page' : undefined}>Sale</Link></li>
            </ul>
          </div>
          <Link className="logo" href="/" aria-label="RBC home"><Flower />RBC</Link>
          <div className="icons">
            <button className="icon-btn" onClick={() => setSearch(true)} aria-label="Search"><Search /></button>
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
          <MItem id="all" href="/shop">Shop all <small>Every gift</small></MItem>
          {CATEGORIES.map(([s, l, , hint]) => <MItem key={s} id={s} href={`/shop?cat=${s}`}>{l} <small>{hint}</small></MItem>)}
          <MItem id="sale" href="/shop?sale=1" style={{ color: 'var(--azalea)' }}>Deals</MItem>
          <MItem id="account" href="/account">My account</MItem>
        </nav>
        <div />
      </aside>
      <div className={`search ${search ? 'on' : ''}`} aria-hidden={!search} role="dialog" aria-label="Search">
        <div className="wrap">
          <form className="s-bar" onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()); }}>
            <Search /><label htmlFor="q" style={{ position: 'absolute', left: -9999 }}>Search products</label>
            <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search mugs, journals, keychains…" autoComplete="off" />
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
