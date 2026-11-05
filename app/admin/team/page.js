import { hasSupabase } from '@/lib/config';
import { guard, NoAccess } from '@/lib/admin-guard';
import TeamManager from '@/components/admin/TeamManager';

export default async function Team() {
  if (!hasSupabase) return null;
  const { supabase: sb, user, allowed } = await guard('team');
  if (!allowed) return <NoAccess what="managing the team" />;
  const { data } = await sb.from('profiles').select('id, email, full_name, role, created_at').neq('role', 'customer').order('created_at');
  return <TeamManager members={data || []} me={user.id} />;
}
