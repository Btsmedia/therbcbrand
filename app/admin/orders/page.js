import { hasSupabase, hasServiceRole } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { guard, NoAccess } from '@/lib/admin-guard';
import OrdersTable from '@/components/admin/OrdersTable';

export default async function Orders({ searchParams }) {
  if (!hasSupabase) return null;
  const { supabase: sb, perms, allowed } = await guard('orders');
  if (!allowed) return <NoAccess what="orders" />;
  const sp = await searchParams;
  // unpaid bank-transfer orders older than 24 hours are cancelled and their stock returned
  if (hasServiceRole) await createAdminClient().rpc('cancel_stale_transfers').then(() => {}, () => {});

  const status = String(sp.status || '');
  const q = String(sp.q || '').replace(/[^\p{L}\p{N} @.+-]/gu, '').trim().slice(0, 60);
  let query = sb.from('orders').select('id, number, created_at, first_name, last_name, phone, email, total, status, payment_method, delivery_mode, delivery_name, delivery_fee, city, state, order_items(qty)').order('created_at', { ascending: false }).limit(200);
  if (status === 'to_pack') query = query.in('status', ['paid', 'pay_on_delivery']);
  else if (status === 'fee') query = query.eq('delivery_mode', 'ship').is('delivery_fee', null).not('status', 'in', '(cancelled,failed,delivered)');
  else if (status === 'open') query = query.in('status', ['awaiting_transfer', 'pay_on_delivery', 'paid', 'packed', 'shipped']);
  else if (status) query = query.eq('status', status);
  if (q) query = query.or(['number', 'first_name', 'last_name', 'phone', 'email'].map((c) => `${c}.ilike.*${q}*`).join(','));
  const { data, error } = await query;
  return <OrdersTable orders={data || []} status={status} q={q} canEdit={perms.editOrders} error={error?.message} />;
}
