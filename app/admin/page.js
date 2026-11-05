import Link from 'next/link';
import { hasSupabase } from '@/lib/config';
import { guard } from '@/lib/admin-guard';
import { naira, fmtDate } from '@/lib/format';
import { STATUS, ROLES } from '@/lib/roles';

const PAID = ['paid', 'packed', 'shipped', 'delivered'];
const dayKey = (d) => new Date(d).toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' });

export default async function Dashboard() {
  if (!hasSupabase) return null;
  const { supabase: sb, perms, role, name, allowed } = await guard();
  if (!allowed) return null;
  const since30 = new Date(Date.now() - 30 * 864e5).toISOString();

  const [{ data: recent }, { data: open }, { data: low }, { count: pendingReviews }, { data: items }] = await Promise.all([
    sb.from('orders').select('id, number, created_at, first_name, last_name, total, status, delivery_mode, delivery_fee').gte('created_at', since30).order('created_at', { ascending: false }).limit(500),
    sb.from('orders').select('id, status, delivery_mode, delivery_fee').in('status', ['awaiting_transfer', 'pay_on_delivery', 'paid', 'packed', 'shipped']),
    perms.catalog ? sb.from('product_variants').select('stock, colour, products(id, name, status)').lte('stock', 4).order('stock').limit(12) : Promise.resolve({ data: [] }),
    perms.reviews ? sb.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending') : Promise.resolve({ count: 0 }),
    perms.sales ? sb.from('order_items').select('name, qty, price, orders!inner(status, created_at)').in('orders.status', PAID).gte('orders.created_at', since30) : Promise.resolve({ data: [] }),
  ]);

  const orders = recent || [];
  const paid = orders.filter((o) => PAID.includes(o.status));
  const today = dayKey(Date.now());
  const sum = (list) => list.reduce((a, o) => a + o.total, 0);
  const in7 = paid.filter((o) => Date.now() - new Date(o.created_at) < 7 * 864e5);

  // last 14 days of paid sales for the chart
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(Date.now() - (13 - i) * 864e5); return { key: dayKey(d), label: d.toLocaleDateString('en-NG', { weekday: 'short', timeZone: 'Africa/Lagos' }).slice(0, 2), total: 0 }; });
  paid.forEach((o) => { const d = days.find((x) => x.key === dayKey(o.created_at)); if (d) d.total += o.total; });
  const max = Math.max(1, ...days.map((d) => d.total));

  // top sellers, last 30 days
  const top = Object.values((items || []).reduce((m, it) => { (m[it.name] ||= { name: it.name, qty: 0, revenue: 0 }); m[it.name].qty += it.qty; m[it.name].revenue += it.qty * it.price; return m; }, {})).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const o = open || [];
  const todo = [
    ['Confirm bank transfers', o.filter((x) => x.status === 'awaiting_transfer').length, '/admin/orders?status=awaiting_transfer'],
    ['To pack', o.filter((x) => ['paid', 'pay_on_delivery'].includes(x.status)).length, '/admin/orders?status=to_pack'],
    ['Packed, to ship', o.filter((x) => x.status === 'packed').length, '/admin/orders?status=packed'],
    ['Out for delivery', o.filter((x) => x.status === 'shipped').length, '/admin/orders?status=shipped'],
    ['Delivery fee to confirm', o.filter((x) => x.delivery_mode === 'ship' && x.delivery_fee == null).length, '/admin/orders?status=fee'],
  ];
  const lowLive = (low || []).filter((v) => v.products?.status === 'live');
  const hello = new Date().toLocaleString('en-NG', { hour: 'numeric', hour12: false, timeZone: 'Africa/Lagos' }) < 12 ? 'Good morning' : 'Good afternoon';

  return (
    <>
      <div className="ad-head"><div><span className="eyebrow">{ROLES[role]?.label}</span><h1>{hello}{name ? `, ${name.split(' ')[0]}` : ''}</h1></div>
        {perms.catalog && <Link className="btn btn-solid" href="/admin/products/new">Add a product</Link>}</div>

      {perms.sales && <div className="stat-row">
        <div className="stat"><span>Today</span><b>{naira(sum(paid.filter((x) => dayKey(x.created_at) === today)))}</b></div>
        <div className="stat"><span>Last 7 days</span><b>{naira(sum(in7))}</b><small>{in7.length} paid order{in7.length === 1 ? '' : 's'}</small></div>
        <div className="stat"><span>Last 30 days</span><b>{naira(sum(paid))}</b><small>{paid.length} paid order{paid.length === 1 ? '' : 's'}</small></div>
        <div className="stat"><span>Average order</span><b>{naira(paid.length ? Math.round(sum(paid) / paid.length) : 0)}</b><small>last 30 days</small></div>
      </div>}

      <div className="ad-grid">
        <section className="card-box">
          <h2 className="ad-h2">Needs doing</h2>
          <div className="todo">{todo.map(([l, n, h]) => <Link key={l} href={h} className={n ? 'has' : ''}><span>{l}</span><b>{n}</b></Link>)}
            {perms.reviews && <Link href="/admin/reviews" className={pendingReviews ? 'has' : ''}><span>Reviews to approve</span><b>{pendingReviews || 0}</b></Link>}</div>
        </section>
        {perms.sales && <section className="card-box">
          <h2 className="ad-h2">Sales, last 14 days</h2>
          <div className="bars" role="img" aria-label="Paid sales per day over the last 14 days">
            {days.map((d) => <div key={d.key} className="bar" title={`${d.key}: ${naira(d.total)}`}><i style={{ height: `${Math.max(2, (d.total / max) * 100)}%` }} className={d.total ? '' : 'zero'} /><span>{d.label}</span></div>)}
          </div>
          <p className="hint">Best day: {naira(max === 1 ? 0 : max)}</p>
        </section>}
      </div>

      <div className="ad-grid">
        <section className="card-box">
          <div className="row-between"><h2 className="ad-h2">Latest orders</h2><Link className="ad-link" href="/admin/orders">All orders →</Link></div>
          {!orders.length && <p className="muted">No orders in the last 30 days yet.</p>}
          <div className="mini-list">{orders.slice(0, 8).map((x) => (
            <Link key={x.id} href={`/admin/orders/${x.id}`}><span><b>{x.number}</b> {x.first_name} {x.last_name}<small>{fmtDate(x.created_at)}</small></span><span className="r"><b>{naira(x.total)}</b><span className={`pill-s ${STATUS[x.status]?.tone}`}>{STATUS[x.status]?.label}</span></span></Link>
          ))}</div>
        </section>
        {perms.sales && <section className="card-box">
          <h2 className="ad-h2">Top sellers, last 30 days</h2>
          {!top.length && <p className="muted">Sales will show here once orders are paid.</p>}
          <div className="mini-list">{top.map((t, i) => <div key={t.name}><span><b>{i + 1}. {t.name}</b><small>{t.qty} sold</small></span><span className="r"><b>{naira(t.revenue)}</b></span></div>)}</div>
        </section>}
      </div>

      {perms.catalog && <section className="card-box">
        <div className="row-between"><h2 className="ad-h2">Low stock</h2><Link className="ad-link" href="/admin/products">Products →</Link></div>
        {!lowLive.length && <p className="muted">Everything live has more than 4 in stock.</p>}
        <div className="mini-list">{lowLive.map((v, i) => <Link key={i} href={`/admin/products/${v.products.id}`}><span><b>{v.products.name}</b><small>{v.colour}</small></span><span className={`pill-s ${v.stock ? 'warn' : 'bad'}`}>{v.stock ? `${v.stock} left` : 'Sold out'}</span></Link>)}</div>
      </section>}
    </>
  );
}
