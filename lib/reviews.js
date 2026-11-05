import 'server-only';
import { hasSupabase, hasServiceRole } from './config';
import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';

// Approved reviews for a product, with short-lived links to their photos and videos.
export async function getProductReviews(productId) {
  if (!hasSupabase) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('reviews')
    .select('id, user_id, author_name, city, rating, title, body, created_at, review_media(id, path, kind)')
    .eq('product_id', productId).eq('status', 'approved').order('created_at', { ascending: false });
  // only show files the reviewer uploaded themselves, and never send their account id to the browser
  const list = (data || []).map(({ user_id, ...r }) => ({ ...r, review_media: r.review_media.filter((m) => m.path.split('/')[0] === user_id) }));
  const paths = list.flatMap((r) => r.review_media.map((m) => m.path));
  let signed = {};
  if (paths.length && hasServiceRole) {
    const { data: s } = await createAdminClient().storage.from('review-media').createSignedUrls(paths, 60 * 60);
    (s || []).forEach((x) => { if (x.signedUrl) signed[x.path] = x.signedUrl; });
  }
  return list.map((r) => ({ ...r, media: r.review_media.map((m) => ({ ...m, url: signed[m.path] })).filter((m) => m.url) }));
}

export async function getLatestReviews(n = 3) {
  if (!hasSupabase) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('reviews')
    .select('id, author_name, city, rating, title, body, products(slug, name, product_images(url, position))')
    .eq('status', 'approved').gte('rating', 4).order('created_at', { ascending: false }).limit(n);
  return data || [];
}
