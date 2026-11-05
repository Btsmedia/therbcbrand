import { notFound } from 'next/navigation';
import { hasSupabase } from '@/lib/config';
import { guard, NoAccess } from '@/lib/admin-guard';
import OrderManager from '@/components/admin/OrderManager';

export default async function OrderDetail({ params }) {
  if (!hasSupabase) return null;
  const { supabase: sb, perms, allowed } = await guard('orders');
  if (!allowed) return <NoAccess what="orders" />;
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [{ data: order }, { data: events }] = await Promise.all([
    sb.from('orders').select('*, order_items(id, name, colour, image, price, qty, product_id)').eq('id', id).maybeSingle(),
    sb.from('order_events').select('id, kind, detail, by_email, created_at').eq('order_id', id).order('created_at', { ascending: false }),
  ]);
  if (!order) notFound();
  return <OrderManager initial={order} events={events || []} canEdit={perms.editOrders} />;
}
