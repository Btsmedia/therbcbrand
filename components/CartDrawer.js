'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart, lineKey } from './CartProvider';
import { Close } from './Icons';
import { naira } from '@/lib/format';
import { boughtTogether } from '@/lib/pairs';


export default function CartDrawer({ products }) {
  const { lines, open, setOpen, setQty, subtotal, add } = useCart();
  const router = useRouter();
  const ids = [...new Set(lines.map((l) => l.productId))];
  const ups = lines.length ? boughtTogether(products, ids, 3) : [];

  return (
    <>
      <div className={`veil ${open ? 'on' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? 'on' : ''}`} aria-label="Cart" aria-hidden={!open}>
        <div className="dr-head"><h2>Your cart</h2><button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close cart"><Close /></button></div>
        <div className="ship">
          <span><b>Delivery or pickup.</b> Nationwide in 1 to 3 days. Your delivery fee comes on WhatsApp after you order.</span>
        </div>
        <div className="lines">
          {lines.length === 0 && (
            <div className="empty"><h3>Your bag is empty</h3><p>Start with a gift for someone, or something for your own space.</p>
              <Link className="btn btn-solid" href="/shop?sort=best" onClick={() => setOpen(false)}>Shop bestsellers</Link></div>
          )}
          {lines.map((l) => (
            <div className="line" key={lineKey(l)}>
              <Link href={`/product/${l.slug}`} className="th tone-1" onClick={() => setOpen(false)}><img className="pimg" src={l.image} alt="" /></Link>
              <div><b>{l.name}</b><span className="var">{l.colour} · {naira(l.price)}</span>{l.custom && <span className="var cust">“{l.custom}”</span>}{l.customPhoto && <span className="var cust">📷 Picture added</span>}{l.customFee > 0 && <span className="var cust">Personalised · +{naira(l.customFee)}</span>}
                <div className="qty"><button onClick={() => setQty(lineKey(l), l.qty - 1)} aria-label="Decrease">−</button><output>{l.qty}</output><button onClick={() => setQty(lineKey(l), l.qty + 1)} aria-label="Increase">+</button></div>
              </div>
              <div className="rt"><span>{naira(l.price * l.qty)}</span><button className="rm" onClick={() => setQty(lineKey(l), 0)}>Remove</button></div>
            </div>
          ))}
          {ups.length > 0 && (
            <div className="dr-ups"><h3>Usually bought together</h3><div className="dr-rail">
              {ups.map((p) => (
                <div className="dr-up" key={p.id}>
                  <Link className="th tone-2" href={`/product/${p.slug}`} onClick={() => setOpen(false)}><img className="pimg" src={p.images[0]} alt="" /></Link>
                  <b>{p.name}</b><span>{naira(p.price)}</span>
                  <button className="mini" onClick={() => add(p, p.variants.find((v) => v.stock > 0), 1, { silent: true })}>Add</button>
                </div>
              ))}
            </div></div>
          )}
        </div>
        {lines.length > 0 && (
          <div className="dr-foot">
            <div className="row"><span>Subtotal</span><strong>{naira(subtotal)}</strong></div>
            <small>You pay for your items now. We’ll send your delivery fee on WhatsApp, or pick up free from our pickup point.</small>
            <button className="btn btn-solid" onClick={() => { setOpen(false); router.push('/checkout'); }}>Check out securely · {naira(subtotal)}</button>
            <small className="dr-assure">Pay by card, bank transfer or USSD</small>
          </div>
        )}
      </aside>
    </>
  );
}
