import { hasSupabase } from '@/lib/config';
import { guard, NoAccess } from '@/lib/admin-guard';
import { cleanTiles } from '@/lib/home-tiles';
import TilesManager from '@/components/admin/TilesManager';

export const metadata = { title: 'Homepage tiles' };

export default async function Tiles() {
  if (!hasSupabase) return null;
  const { supabase: sb, allowed } = await guard('catalog');
  if (!allowed) return <NoAccess what="the homepage tiles" />;
  const { data } = await sb.from('site_settings').select('value').eq('key', 'home_tiles').maybeSingle();
  return <TilesManager initial={cleanTiles(data?.value)} />;
}
