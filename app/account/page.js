import Link from 'next/link';
import SignInForm from '@/components/SignInForm';
import { hasSupabase } from '@/lib/config';
import { getUserAndRole } from '@/lib/supabase/server';
import { naira, fmtDate } from '@/lib/format';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'My account' };

const LABEL = { awaiting_payment: ['Awaiting payment', 'warn'], awaiting_transfer: ['Awaiting transfer', 'warn'], pay_on_delivery: ['Pay on delivery', 'accent'], paid: ['Confirmed', 'accent'], packed: ['Packed', 'accent'], shipped: ['On its way', 'accent'], delivered: ['Delivered', 'good'], cancelled: ['Cancelled', 'bad'], failed: ['Payment failed', 'bad'] };

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
  const { data: orders } = await supabase.from('orders').select('id, number, created_at, total, status, order_items(id, name, colour, image, qty, product_id, products(slug))').order('created_at', { ascending: false });
  const { data: mine } = await supabase.from('reviews').select('product_id, status').eq('user_id', user.id);
  const reviewed = new Map((mine || []).map((r) => [r.product_id, r.status]));
  return (
    <div className="wrap page-pad">
      <div className="row-between"><div><span className="eyebrow">Signed in as {user.email}</span><h1 className="page-title">My account</h1></div>
        <div style={{ display: 'flex', gap: 10 }}>{['staff', 'owner'].includes(role) && <Link className="btn btn-solid" href="/admin">Open admin</Link>}<form action="/auth/signout" method="post"><button className="btn btn-line">Sign out</button></form></div></div>
      <div className="card-box" style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Your orders</h2>
        {!orders?.length && <p className="muted">No orders yet. Orders placed with {user.email} show up here, including ones placed before you signed in.</p>}
        {orders?.map((o) => (
          <div key={o.id} style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'grid', gap: 10 }}>
            <div className="row-between"><div><b><Link href={`/order/${o.id}`}>{o.number}</Link></b> <span className="muted">· {fmtDate(o.created_at)} · {naira(o.total)}</span></div><span className={`pill-s ${LABEL[o.status]?.[1]}`}>{LABEL[o.status]?.[0]}</span></div>
            {o.order_items.map((it) => { const canReview = ['paid', 'packed', 'shipped', 'delivered'].includes(o.status) && it.product_id; const st = reviewed.get(it.product_id); return (
              <div className="ord-row" key={it.id}>
                <span className="th tone-1" style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', display: 'block' }}>{it.image && <img className="pimg" src={it.image} alt="" />}</span>
                <span><b style={{ fontWeight: 600 }}>{it.name}</b> <span className="muted">· {it.colour} × {it.qty}</span></span>
                {canReview && (st ? <span className="pill-s">{st === 'approved' ? 'Reviewed' : st === 'pending' ? 'Review pending' : 'Review not published'}</span> : <Link className="btn btn-line" style={{ height: 36 }} href={`/product/${it.products?.slug}#reviews`}>Write a review</Link>)}
              </div>
            ); })}
          </div>
        ))}
      </div>
    </div>
  );
}
