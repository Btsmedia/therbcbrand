import { hasSupabase } from '@/lib/config';
import { guard, NoAccess } from '@/lib/admin-guard';
import { cleanAnnouncement } from '@/lib/announcement';
import AnnouncementManager from '@/components/admin/AnnouncementManager';

export const metadata = { title: 'Announcement bar' };

export default async function Announcement() {
  if (!hasSupabase) return null;
  const { supabase: sb, allowed } = await guard('catalog');
  if (!allowed) return <NoAccess what="the announcement bar" />;
  const { data } = await sb.from('site_settings').select('value').eq('key', 'announcement').maybeSingle();
  return <AnnouncementManager initial={cleanAnnouncement(data?.value)} />;
}
