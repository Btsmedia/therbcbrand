import { hasSupabase } from '@/lib/config';
import { guard, NoAccess } from '@/lib/admin-guard';
import { cleanDeals } from '@/lib/deals';
import DealsManager from '@/components/admin/DealsManager';

export const metadata = { title: 'Deals' };

export default async function Deals() {
  if (!hasSupabase) return null;
  const { supabase: sb, allowed } = await guard('catalog');
  if (!allowed) return <NoAccess what="deals" />;
  const [{ data: s }, { data: products }] = await Promise.all([
    sb.from('site_settings').select('value').eq('key', 'deals').maybeSingle(),
    sb.from('products').select('id, name, slug, price, compare_at, status, product_images(url, position)').neq('status', 'archived').order('position'),
  ]);
  const list = (products || []).map((p) => ({ id: p.id, name: p.name, slug: p.slug, price: p.price, compare_at: p.compare_at, status: p.status, image: (p.product_images || []).sort((a, b) => a.position - b.position)[0]?.url || null }));
  return <DealsManager settings={cleanDeals(s?.value)} products={list} />;
}
