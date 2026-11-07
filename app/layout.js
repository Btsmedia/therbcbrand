import './globals.css';
import './extra.css';
import './soft.css';
import { Suspense } from 'react';
import CartProvider from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import WhatsAppButton from '@/components/WhatsAppButton';
import NavProgress from '@/components/NavProgress';
import { headers } from 'next/headers';
import { getProducts, getDealSettings, getAnnouncement, getLock } from '@/lib/catalog';
import { getUserAndRole } from '@/lib/supabase/server';
import { activeLock, LOCK_EXEMPT } from '@/lib/lock';
import { can } from '@/lib/roles';
import LockScreen from '@/components/lock/LockScreen';
import { dealPicks, pctOff } from '@/lib/deals';

export const metadata = {
  title: { default: 'The RBC Brand', template: '%s · The RBC Brand' },
  description: 'Personalised gifts, event souvenirs and home pieces from The RBC Brand, delivered across Nigeria.',
};
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#FBF9F5' };

export default async function RootLayout({ children }) {
  const [products, ds, ann, lockSettings, h] = await Promise.all([getProducts(), getDealSettings(), getAnnouncement(), getLock(), headers()]);
  // store lock: shoppers get the lock screen; the team (signed in) still sees the store, with a reminder strip
  const lock = activeLock(lockSettings);
  const path = h.get('x-pathname') || '/';
  let lockView = null; // 'screen' | 'staff'
  if (lock && !LOCK_EXEMPT.test(path)) {
    const { role } = await getUserAndRole().catch(() => ({ role: null }));
    const staff = can(role).admin;
    lockView = !staff ? 'screen' : h.get('x-lock-preview') === '1' ? 'preview' : 'staff';
  }
  if (lockView === 'screen' || lockView === 'preview') {
    return (
      <html lang="en-NG">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" />
          <meta name="robots" content="noindex" />
        </head>
        <body><LockScreen lock={lock} whatsapp={process.env.WHATSAPP_NUMBER} preview={lockView === 'preview'} /></body>
      </html>
    );
  }
  const onSale = products.filter((p) => pctOff(p) > 0);
  const deal = onSale.length ? { label: `${ds.title} ${ds.highlight}`.trim(), maxOff: Math.max(...onSale.map(pctOff)), img: dealPicks(onSale, ds.picks)[0]?.images[0] } : null;
  return (
    <html lang="en-NG">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gloock&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" />
      </head>
      <body>
        <Suspense fallback={null}><NavProgress /></Suspense>
        {lockView === 'staff' && <div className="lk-staffbar">The store is locked for shoppers ({lock.label}). <a href="/?lockpreview=1">See what they see</a> · <a href="/admin/lock">Change</a></div>}
        <CartProvider>
          <Suspense fallback={null}><Header deal={deal} announcement={ann} /></Suspense>
          <main id="top">{children}</main>
          <Footer />
          <CartDrawer products={products} />
          <WhatsAppButton number={process.env.WHATSAPP_NUMBER} />
        </CartProvider>
      </body>
    </html>
  );
}
