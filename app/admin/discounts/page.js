import { hasSupabase } from '@/lib/config';
import { guard, NoAccess } from '@/lib/admin-guard';
import DiscountManager from '@/components/admin/DiscountManager';

export default async function Discounts() {
  if (!hasSupabase) return null;
  const { supabase: sb, allowed } = await guard('catalog');
  if (!allowed) return <NoAccess what="discount codes" />;
  const { data } = await sb.from('discount_codes').select('code, percent, category, label, active, expires_at').order('code');
  return <DiscountManager codes={data || []} />;
}
