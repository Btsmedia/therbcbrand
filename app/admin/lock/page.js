import { hasSupabase } from '@/lib/config';
import { guard, NoAccess } from '@/lib/admin-guard';
import { cleanLock } from '@/lib/lock';
import LockManager from '@/components/admin/LockManager';

export const metadata = { title: 'Lock store' };

export default async function Lock() {
  if (!hasSupabase) return null;
  const { supabase: sb, allowed } = await guard('catalog');
  if (!allowed) return <NoAccess what="locking the store" />;
  const [{ data: s }, { data: signups }] = await Promise.all([
    sb.from('site_settings').select('value').eq('key', 'lock').maybeSingle(),
    sb.from('lock_signups').select('id, email, reason, created_at').order('created_at', { ascending: false }).limit(1000),
  ]);
  return <LockManager initial={cleanLock(s?.value)} signups={signups || []} />;
}
