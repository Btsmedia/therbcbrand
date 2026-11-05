import ShopClient from '@/components/ShopClient';
import { getProducts, getDealSettings } from '@/lib/catalog';
import { dealPicks, pctOff } from '@/lib/deals';

export const metadata = { title: 'Marketplace' };
export const revalidate = 60;

export default async function Shop({ searchParams }) {
  const sp = await searchParams;
  const [products, ds] = await Promise.all([getProducts(), getDealSettings()]);
  const onSale = products.filter((p) => pctOff(p) > 0);
  const deal = onSale.length ? { ...ds, img: dealPicks(onSale, ds.picks)[0]?.images[0] } : null;
  const initial = {
    cat: sp.cat || null, q: sp.q || '', sale: sp.sale === '1', saved: sp.saved === '1',
    min: sp.min ?? '', max: sp.max ?? '', sort: sp.sort || (sp.max ? 'lo' : 'featured'),
  };
  return <ShopClient products={products} initial={initial} deal={deal} />;
}
