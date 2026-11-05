import { hasSupabase } from '@/lib/config';
import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { guard, NoAccess } from '@/lib/admin-guard';

export default async function EditProduct({ params }) {
  if (!hasSupabase) return null;
  const { supabase: sb, allowed } = await guard('catalog');
  if (!allowed) return <NoAccess what="products" />;
  const { id } = await params;
  if (id === 'new') return <ProductForm initial={null} />;
  const { data } = await sb.from('products').select('*, product_images(id, url, path, position), product_variants(id, colour, hex, stock, position)').eq('id', id).maybeSingle();
  if (!data) notFound();
  return <ProductForm initial={data} />;
}
