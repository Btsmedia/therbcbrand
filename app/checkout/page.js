import CheckoutClient from '@/components/CheckoutClient';
import { getRates } from '@/lib/store-settings';
import { getProducts } from '@/lib/catalog';
import { hasSupabase, hasServiceRole, paystackLive, opayLive, testPaymentsAllowed } from '@/lib/config';
import { getUserAndRole } from '@/lib/supabase/server';

export const metadata = { title: 'Checkout' };
export const dynamic = 'force-dynamic';

export default async function Checkout() {
  const [rates, products] = await Promise.all([getRates(), getProducts()]);
  let email = '';
  if (hasSupabase) { const { user } = await getUserAndRole(); email = user?.email || ''; }
  const live = { paystack: paystackLive, opay: opayLive };
  return <CheckoutClient rates={rates} products={products} email={email} canOrder={hasSupabase && hasServiceRole} live={live} testMode={testPaymentsAllowed && (!paystackLive || !opayLive)} />;
}
