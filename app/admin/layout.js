import Link from 'next/link';
import SignInForm from '@/components/SignInForm';
import AdminShell from '@/components/admin/AdminShell';
import { hasSupabase } from '@/lib/config';
import { getUserAndRole } from '@/lib/supabase/server';
import { can } from '@/lib/roles';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin', robots: { index: false } };

const Bare = ({ children }) => <div className="ad-bare"><Link href="/" className="ad-logo">RBC <span>admin</span></Link>{children}</div>;

export default async function AdminLayout({ children }) {
  if (!hasSupabase) return <Bare><p className="notice">The admin switches on once the store database is connected.</p></Bare>;
  const { supabase, user, role } = await getUserAndRole();
  if (!user) return <Bare><SignInForm next="/admin" title="Team sign in" /></Bare>;
  if (!can(role).admin) return (
    <Bare><div className="card-box"><h2 style={{ fontSize: 22, fontWeight: 600 }}>No admin access</h2>
      <p className="muted">You&apos;re signed in as {user.email}, which isn&apos;t on the RBC team. Ask the store owner to add this email on the Team page.</p>
      <p><Link className="btn btn-line" href="/">Back to the store</Link></p></div></Bare>
  );
  // badges on the menu: orders needing action, reviews waiting
  const p = can(role);
  const [{ count: orders }, { count: reviews }] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['paid', 'awaiting_transfer', 'pay_on_delivery', 'packed']),
    p.reviews ? supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending') : Promise.resolve({ count: 0 }),
  ]);
  return <AdminShell role={role} email={user.email} counts={{ orders, reviews }}>{children}</AdminShell>;
}
