'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Footer() {
  const path = usePathname();
  const [msg, setMsg] = useState('');
  if (path.startsWith('/checkout') || path.startsWith('/admin')) return null;
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot">
          <div className="news">
            <h3>Letters from The RBC Brand</h3>
            <p>New pieces, restocks and gift ideas, about twice a month.</p>
            <form noValidate onSubmit={(e) => { e.preventDefault(); const v = e.currentTarget.email.value.trim(); setMsg(/^\S+@\S+\.\S+$/.test(v) ? "You're on the list." : 'Enter an email address like name@example.com.'); }}>
              <label htmlFor="newsEmail" style={{ position: 'absolute', left: -9999 }}>Email address</label>
              <input id="newsEmail" name="email" type="email" placeholder="Your email address" autoComplete="email" /><button type="submit">Subscribe</button>
            </form>
            <p className="ok" aria-live="polite">{msg}</p>
          </div>
          <div><h4>Shop</h4><ul>
            <li><Link href="/shop?cat=beauty">Bath &amp; beauty</Link></li><li><Link href="/shop?cat=gadgets">Tech &amp; gadgets</Link></li><li><Link href="/shop?cat=kitchen">Kitchen</Link></li><li><Link href="/shop?cat=lighting">Lighting</Link></li><li><Link href="/shop?cat=storage">Storage</Link></li><li><Link href="/shop?sale=1">Deals</Link></li><li><Link href="/shop">Shop all</Link></li>
          </ul></div>
          <div id="help"><h4>Help</h4><ul><li><Link href="/account">Track an order</Link></li><li><Link href="/policies#delivery">Delivery</Link></li><li><Link href="/policies#returns">Help with an order</Link></li><li><Link href="/policies#privacy">Privacy</Link></li></ul></div>
          <div><h4>RBC</h4><ul><li><Link href="/account">My account</Link></li><li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li><li><a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a></li></ul></div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} The RBC Brand · NG / NGN ₦</span>
          <div className="pay"><span>VISA</span><span>MASTERCARD</span><span>VERVE</span><span>TRANSFER</span><span>USSD</span><span>OPAY</span></div>
        </div>
        <div className="wordmark" aria-hidden="true">RBC</div>
      </div>
    </footer>
  );
}
