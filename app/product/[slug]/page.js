import { notFound } from 'next/navigation';
import ProductView from '@/components/product/ProductView';
import Reviews from '@/components/product/Reviews';
import { getProduct, getProducts } from '@/lib/catalog';
import { getProductReviews } from '@/lib/reviews';
import { boughtTogether } from '@/lib/pairs';
import { hasSupabase } from '@/lib/config';
import { getUserAndRole } from '@/lib/supabase/server';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  return p ? { title: p.name, description: p.description, openGraph: { images: p.images.slice(0, 1) } } : {};
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const [p, all] = await Promise.all([getProduct(slug), getProducts()]);
  if (!p) notFound();
  const reviews = await getProductReviews(p.id);
  const bundle = [p, ...boughtTogether(all, [p.id], 2)];

  // who can write a review: signed in, bought it, hasn't reviewed yet
  const access = { enabled: hasSupabase, userId: null, bought: false, existing: null, name: '' };
  if (hasSupabase) {
    const { supabase, user, name } = await getUserAndRole();
    if (user) {
      access.userId = user.id; access.name = name;
      const [{ data: bought }, { data: mine }] = await Promise.all([
        supabase.rpc('has_bought', { p_product: p.id }),
        supabase.from('reviews').select('status').eq('product_id', p.id).eq('user_id', user.id).maybeSingle(),
      ]);
      access.bought = !!bought; access.existing = mine?.status || null;
    }
  }

  // structured data so Google can show price, stock and rating in search results
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const abs = (u) => (/^https?:/.test(u) ? u : `${site}${u}`);
  const inStock = p.variants.some((x) => x.stock > 0);
  const ld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description, sku: p.id,
    image: p.images.map(abs), brand: { '@type': 'Brand', name: 'The RBC Brand' }, url: `${site}/product/${p.slug}`,
    offers: { '@type': 'Offer', priceCurrency: 'NGN', price: p.price, availability: `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`, url: `${site}/product/${p.slug}`, itemCondition: 'https://schema.org/NewCondition' },
    ...(p.reviewCount ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(p.rating.toFixed(1)), reviewCount: p.reviewCount } } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <ProductView p={p} bundle={bundle} whatsapp={process.env.WHATSAPP_NUMBER} />
      <Reviews product={{ id: p.id, slug: p.slug, name: p.name }} reviews={reviews} access={access} />
    </>
  );
}
