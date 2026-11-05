import 'server-only';
import { hasSupabase, hasServiceRole } from './config';
import { createAdminClient } from './supabase/admin';

const FALLBACK = { RBC10: { percent: 10, category: null, label: '10% off your order' }, GIFT15: { percent: 15, category: 'custom', label: '15% off personalised gifts' } };

export async function lookupCode(raw) {
  const code = String(raw || '').trim().toUpperCase();
  if (!code) return null;
  if (!hasSupabase || !hasServiceRole) return FALLBACK[code] ? { code, ...FALLBACK[code] } : null;
  const { data } = await createAdminClient().from('discount_codes').select('code, percent, category, label, active, expires_at').eq('code', code).maybeSingle();
  if (!data || !data.active || (data.expires_at && new Date(data.expires_at) < new Date())) return null;
  return { code: data.code, percent: data.percent, category: data.category, label: data.label || `${data.percent}% off` };
}

