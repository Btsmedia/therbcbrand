'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROLES, can } from '@/lib/roles';

const I = {
  home: <path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z" />,
  orders: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6" /></>,
  products: <><path d="M4 7l8-4 8 4-8 4z" /><path d="M4 7v10l8 4 8-4V7" /><path d="M12 11v10" /></>,
  reviews: <path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z" />,
  announce: <><path d="M4 10v4h3l6 4V6L7 10z" /><path d="M16 9a4 4 0 0 1 0 6" /></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  deals: <><path d="M13 3 4 14h7l-1 7 9-11h-7z" /></>,
  discounts: <><path d="M20 12 12 20 4 12V4h8z" /><circle cx="8.5" cy="8.5" r="1.5" /></>,
  team: <><circle cx="9" cy="8" r="3.2" /><path d="M3 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.6c2.6.2 4.4 2 5 5.4" /></>,
  tiles: <><rect x="3" y="3" width="10" height="18" rx="2" /><rect x="15" y="3" width="6" height="8" rx="2" /><rect x="15" y="13" width="6" height="8" rx="2" /></>,
  spot: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></>,
  policy: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7M9 16h7" /></>,
  store: <><path d="M4 9h16l-1-5H5z" /><path d="M5 9v11h14V9" /><path d="M10 20v-6h4v6" /></>,
};
const Ico = ({ n }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true">{I[n]}</svg>;

export default function AdminShell({ role, email, counts = {}, children }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const p = can(role);
  const links = [
    ['/admin', 'Dashboard', 'home', true],
    ['/admin/orders', 'Orders', 'orders', p.orders, counts.orders],
    ['/admin/products', 'Products', 'products', p.catalog],
    ['/admin/reviews', 'Reviews', 'reviews', p.reviews, counts.reviews],
    ['/admin/deals', 'Deals', 'deals', p.catalog],
    ['/admin/announcement', 'Announcement bar', 'announce', p.catalog],
    ['/admin/spotlight', 'Spotlight', 'spot', p.catalog],
    ['/admin/tiles', 'Homepage tiles', 'tiles', p.catalog],
    ['/admin/policies', 'Store policies', 'policy', p.catalog],
    ['/admin/lock', 'Lock store', 'lock', p.catalog],
    ['/admin/discounts', 'Discount codes', 'discounts', p.catalog],
    ['/admin/team', 'Team', 'team', p.team],
  ].filter((l) => l[3]);
  const active = (h) => (h === '/admin' ? path === h : path.startsWith(h));

  return (
    <div className="ad">
      <header className="ad-top">
        <button className="ad-burger" onClick={() => setOpen(true)} aria-label="Open admin menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h10" /></svg></button>
        <Link href="/admin" className="ad-logo">RBC <span>admin</span></Link>
        <span className="ad-role">{ROLES[role]?.label}</span>
      </header>
      <div className={`ad-veil ${open ? 'on' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`ad-side ${open ? 'on' : ''}`} aria-label="Admin menu">
        <div className="ad-side-head">
          <Link href="/admin" className="ad-logo">RBC <span>admin</span></Link>
          <button className="ad-close" onClick={() => setOpen(false)} aria-label="Close admin menu">×</button>
        </div>
        <nav className="ad-nav">
          {links.map(([h, l, ic, , n]) => (
            <Link key={h} href={h} className={active(h) ? 'on' : ''} aria-current={active(h) ? 'page' : undefined}>
              <Ico n={ic} /><span>{l}</span>{n ? <b className="ad-count">{n}</b> : null}
            </Link>
          ))}
        </nav>
        <div className="ad-me">
          <Link href="/" className="ad-store"><Ico n="store" /><span>View store</span></Link>
          <div className="ad-who"><span className="ad-email">{email}</span><span className="ad-role-s">{ROLES[role]?.label} · {ROLES[role]?.blurb}</span></div>
          <form action="/auth/signout" method="post"><button className="ad-signout">Sign out</button></form>
        </div>
      </aside>
      <main className="ad-main">{children}</main>
    </div>
  );
}
