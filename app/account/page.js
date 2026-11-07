import Link from 'next/link';
import SignInForm from '@/components/SignInForm';
import { hasSupabase } from '@/lib/config';
import { getUserAndRole } from '@/lib/supabase/server';
import { naira, fmtDate } from '@/lib/format';
import { Bag, Heart, User } from '@/components/Icons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My account' };

const LABEL = { awaiting_payment: ['Awaiting payment', 'warn'], awaiting_transfer: ['Awaiting transfer', 'warn'], pay_on_delivery: ['Pay on delivery', 'accent'], paid: ['Confirmed', 'accent'], packed: ['Packed', 'accent'], shipped: ['On its way', 'accent'], delivered: ['Delivered', 'good'], cancelled: ['Cancelled', 'bad'], failed: ['Payment failed', 'bad'] };
const GROUPS = [
  ['active', 'In progress', ['awaiting_payment', 'awaiting_transfer', 'pay_on_delivery', 'paid', 'packed', 'shipped']],
  ['delivered', 'Delivered', ['delivered']],
  ['cancelled', 'Cancelled', ['cancelled', 'failed']],
];

function greeting() {
  const h = Number(new Date().toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Africa/Lagos' }));
  return h < 12 ? 'Good morning,' : h < 17 ? 'Good afternoon,' : 'Good evening,';
}

const Pin = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>;
const Van = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 6h12v10H2zM14 10h4l3 3.5V16h-7z" /><circle cx="6" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></svg>;
const Out = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10" /></svg>;
const Gear = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" /></svg>;

export default async function Account({ searchParams }) {
  const sp = await searchParams;
  if (!hasSupabase) return <div className="wrap page-pad"><h1 className="page-title">My account</h1><p className="notice">Accounts switch on once the store database is connected.</p></div>;
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return (
    <div className="wrap page-pad" style={{ maxWidth: 520 }}>
      <h1 className="page-title">My account</h1>
      {sp.error && <p className="notice err" style={{ marginBottom: 16 }}>That sign-in link has expired or was already used. Request a new one below.</p>}
      <SignInForm next={sp.next || '/account'} />
    </div>
  );
  const { data: orders } = await supabase.from('orders').select('id, number, created_at, total, status, delivery_mode, first_name, city, state, order_items(id, name, colour, image, price, qty, product_id, products(slug))').order('created_at', { ascending: false });
  const { data: mine } = await supabase.from('reviews').select('product_id, status').eq('user_id', user.id);
  const reviewed = new Map((mine || []).map((r) => [r.product_id, r.status]));
  const all = orders || [];
  const counts = Object.fromEntries(GROUPS.map(([k, , st]) => [k, all.filter((o) => st.includes(o.status)).length]));
  const tab = GROUPS.some(([k]) => k === sp.tab) ? sp.tab : (counts.active || !all.length ? 'active' : counts.delivered ? 'delivered' : 'cancelled');
  const shown = all.filter((o) => GROUPS.find(([k]) => k === tab)[2].includes(o.status));
  const name = user.user_metadata?.full_name || all.find((o) => o.first_name)?.first_name || user.email.split('@')[0];

  return (
    <div className="wrap page-pad acc">
      <div className="acc-top">
        <div className="acc-hi"><small>{greeting()}</small><h1>{name}</h1></div>
        <nav className="acc-tabs" aria-label="Account">
          <Link className="on" href="/account" aria-current="page"><Bag />My orders</Link>
          <Link href="/shop?saved=1"><Heart />Wishlist</Link>
          <span className="acc-mail"><User />{user.email}</span>
          {['staff', 'owner'].includes(role) && <Link href="/admin"><Gear />Open admin</Link>}
          <form action="/auth/signout" method="post"><button><Out />Sign out</button></form>
        </nav>
      </div>

      <div className="acc-body">
        <nav className="acc-side" aria-label="Order status">
          {GROUPS.map(([k, label]) => (
            <Link key={k} href={`/account?tab=${k}`} className={tab === k ? 'on' : ''} aria-current={tab === k ? 'page' : undefined}>{label}<span>{counts[k]}</span></Link>
          ))}
        </nav>

        <div className="acc-list">
          {!all.length && <div className="acc-empty"><h2>No orders yet</h2><p className="muted">Orders placed with {user.email} show up here, including ones placed before you signed in.</p><Link className="btn btn-solid" href="/shop">Start shopping</Link></div>}
          {all.length > 0 && !shown.length && <div className="acc-empty"><p className="muted">Nothing here right now.</p></div>}
          {shown.map((o) => {
            const items = o.order_items.reduce((a, it) => a + it.qty, 0);
            const [lab, tone] = LABEL[o.status] || [o.status, ''];
            const dest = o.delivery_mode === 'pickup' ? 'Pickup point' : [o.city, o.state].filter(Boolean).join(', ') || 'Your address';
            return (
              <article className="oc" key={o.id}>
                <div className="oc-head">
                  <div><small>Order ID</small><b><Bag />{o.number}</b></div>
                  <div className="oc-tags"><span className="oc-date">Placed {fmtDate(o.created_at)}</span><span className={`oc-st ${tone}`}>{lab}</span></div>
                </div>
                <div className="oc-route"><span><Van />The RBC Brand</span><i aria-hidden="true" /><span><Pin />{dest}</span></div>
                <div className="oc-items">
                  {o.order_items.map((it) => { const canReview = ['paid', 'packed', 'shipped', 'delivered'].includes(o.status) && it.product_id; const st = reviewed.get(it.product_id); return (
                    <div className="oc-item" key={it.id}>
                      <span className="th">{it.image && <img className="pimg" src={it.image} alt="" />}</span>
                      <div><b>{it.name}</b><span>{naira(it.price)} <small>×{it.qty}</small></span>{it.colour && <span className="muted">{it.colour}</span>}</div>
                      {canReview && (st ? <span className="pill-s">{st === 'approved' ? 'Reviewed' : st === 'pending' ? 'Review pending' : 'Review not published'}</span> : <Link className="btn btn-line oc-rev" href={`/product/${it.products?.slug}#reviews`}>Write a review</Link>)}
                    </div>
                  ); })}
                </div>
                <div className="oc-foot"><span>Total: <b>{naira(o.total)}</b> <small>({items} item{items === 1 ? '' : 's'})</small></span><Link className="btn btn-solid" href={`/order/${o.id}`}>Details</Link></div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
