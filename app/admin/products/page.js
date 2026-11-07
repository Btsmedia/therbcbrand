import { hasSupabase } from '@/lib/config';
import { guard, NoAccess } from '@/lib/admin-guard';
import ProductsBrowser from '@/components/admin/ProductsBrowser';

export const metadata = { title: 'Products' };

export default async function Products() {
  if (!hasSupabase) return null;
  const { supabase: sb, allowed } = await guard('catalog');
  if (!allowed) return <NoAccess what="products" />;
  const { data } = await sb.from('products')
    .select('id, name, slug, price, compare_at, category, status, personalise, product_images(url, position), product_variants(colour, hex, stock, position)')
    .order('position');
  const rows = (data || []).map((p) => ({
    id: p.id, name: p.name, slug: p.slug, price: p.price, compare_at: p.compare_at, category: p.category, status: p.status,
    personalised: !!p.personalise,
    colours: (p.product_variants || []).sort((a, b) => a.position - b.position).map((v) => ({ colour: v.colour, hex: v.hex, stock: v.stock })),
    image: (p.product_images || []).sort((a, b) => a.position - b.position)[0]?.url || null,
    stock: (p.product_variants || []).reduce((a, v) => a + v.stock, 0),
  }));
  return <ProductsBrowser products={rows} />;
}
