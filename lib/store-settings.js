import 'server-only';
import { hasSupabase } from './config';
import { createClient } from './supabase/server';

export const DEFAULT_RATES = [
  { id: 'nat', zone: 'nationwide', name: 'Nationwide delivery', description: 'Interstate takes 1–3 days. Farther locations ship with GIG or DHL.', price: 0, free_over: null },
  { id: 'ife', zone: 'ife', name: 'Local delivery', description: 'Fast local delivery.', price: 0, free_over: null },
  { id: 'pick', zone: 'pickup', name: 'Pickup', description: 'We’ll send you the pickup point.', price: 0, free_over: null },
];

export async function getRates() {
  if (!hasSupabase) return DEFAULT_RATES;
  const supabase = await createClient();
  const { data } = await supabase.from('delivery_rates').select('id, zone, name, description, price, free_over').eq('active', true).order('position');
  return data?.length ? data : DEFAULT_RATES;
}
