import { hasSupabase } from '@/lib/config';
import { guard, NoAccess } from '@/lib/admin-guard';
import { cleanSpotlight } from '@/lib/spotlight';
import SpotlightManager from '@/components/admin/SpotlightManager';

export const metadata = { title: 'Spotlight' };

export default async function Spotlight() {
  if (!hasSupabase) return null;
  const { supabase: sb, allowed } = await guard('catalog');
  if (!allowed) return <NoAccess what="the homepage spotlight" />;
  const [{ data }, { data: rows }] = await Promise.all([
    sb.from('site_settings').select('value').eq('key', 'spotlight').maybeSingle(),
    sb.from('products').select('slug, name, price, description, product_images(url, position)').eq('status', 'live').order('position'),
  ]);
  const products = (rows || []).map((p) => ({
    slug: p.slug, name: p.name, price: p.price, description: p.description || '',
    image: (p.product_images || []).sort((a, b) => a.position - b.position)[0]?.url || '',
  }));
  return <SpotlightManager initial={cleanSpotlight(data?.value)} products={products} />;
}
