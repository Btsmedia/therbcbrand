import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch { /* called from a server component: safe to ignore */ }
      },
    },
  });
}

export async function getUserAndRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, role: null };
  const { data } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
  return { supabase, user, role: data?.role || 'customer', name: data?.full_name || '' };
}
