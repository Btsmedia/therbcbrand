import { hasSupabase } from '@/lib/config';
import { guard, NoAccess } from '@/lib/admin-guard';
import ReviewQueue from '@/components/admin/ReviewQueue';

export default async function ReviewsAdmin({ searchParams }) {
  if (!hasSupabase) return null;
  const { supabase: sb, allowed } = await guard('reviews');
  if (!allowed) return <NoAccess what="reviews" />;
  const sp = await searchParams;
  const status = sp.status || 'pending';
  const { data } = await sb.from('reviews').select('id, author_name, city, rating, title, body, status, created_at, reject_reason, products(name, slug), review_media(id, path, kind)').eq('status', status).order('created_at', { ascending: status === 'pending' }).limit(100);
  const paths = (data || []).flatMap((r) => r.review_media.map((m) => m.path));
  const signed = {};
  if (paths.length) { const { data: s } = await sb.storage.from('review-media').createSignedUrls(paths, 3600); (s || []).forEach((x) => { if (x.signedUrl) signed[x.path] = x.signedUrl; }); }
  const reviews = (data || []).map((r) => ({ ...r, media: r.review_media.map((m) => ({ ...m, url: signed[m.path] })) }));
  return <ReviewQueue reviews={reviews} status={status} />;
}
