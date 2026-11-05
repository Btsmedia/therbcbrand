import 'server-only';
import { getUserAndRole } from './supabase/server';
import { can } from './roles';

// Every admin page checks the role itself (the layout alone isn't enough in Next.js).
export async function guard(perm) {
  const ctx = await getUserAndRole();
  const p = can(ctx.role);
  return { ...ctx, perms: p, allowed: !!ctx.user && p.admin && (!perm || p[perm]) };
}

export function NoAccess({ what = 'this page' }) {
  return <div className="card-box"><h2 style={{ fontSize: 20, fontWeight: 600 }}>Not part of your role</h2><p className="muted">Your role doesn&apos;t include {what}. Ask the owner if you need it.</p></div>;
}
