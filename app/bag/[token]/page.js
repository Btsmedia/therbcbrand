import { notFound } from 'next/navigation';
import { hasSupabase, hasServiceRole } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { liveLines } from '@/lib/carts';
import { isUuid } from '@/lib/rate-limit';
import RestoreBag from '@/components/RestoreBag';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your bag', robots: { index: false } };

// The link in a bag reminder email: refills the bag on this device and goes to checkout.
export default async function BagPage({ params }) {
  const { token } = await params;
  if (!isUuid(token) || !hasSupabase || !hasServiceRole) notFound();
  const db = createAdminClient();
  const { data: c } = await db.from('abandoned_carts').select('email, first_name, items').eq('token', token).maybeSingle();
  if (!c) notFound();
  const lines = await liveLines(db, c.items);
  return <RestoreBag lines={lines} email={c.email} first={c.first_name || ''} />;
}
