import { hasSupabase } from '@/lib/config';
import { guard, NoAccess } from '@/lib/admin-guard';
import { cleanPolicies } from '@/lib/policies';
import PoliciesManager from '@/components/admin/PoliciesManager';

export const metadata = { title: 'Store policies' };

export default async function PoliciesAdmin() {
  if (!hasSupabase) return null;
  const { supabase: sb, allowed } = await guard('catalog');
  if (!allowed) return <NoAccess what="the store policies" />;
  const { data } = await sb.from('site_settings').select('value').eq('key', 'policies').maybeSingle();
  return <PoliciesManager initial={cleanPolicies(data?.value)} />;
}
