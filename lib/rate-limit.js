import 'server-only';

// Simple per-visitor limiter. Each server instance keeps its own count, so it slows down
// scripted abuse (guessing discount codes, flooding orders) without needing another service.
const hits = new Map();

export function ipOf(req) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

export function limited(req, bucket, max, windowMs) {
  const now = Date.now();
  const key = `${bucket}:${ipOf(req)}`;
  const list = (hits.get(key) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.length || now - v[v.length - 1] > windowMs) hits.delete(k);
  return list.length > max;
}

export const isUuid = (v) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
