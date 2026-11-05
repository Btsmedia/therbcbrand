import 'server-only';
import { createClient } from '@supabase/supabase-js';
// Full-access client. Only ever used on the server (API routes), never sent to the browser.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}
