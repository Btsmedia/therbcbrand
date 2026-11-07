'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { ROLES, PERMANENT_OWNERS } from '@/lib/roles';

const ERR = {
  not_found: 'No account with that email yet. Ask them to sign in once on the store, then add them here.',
  self: 'You can’t change your own role.',
  not_owner: 'Only the owner can manage the team.',
  bad_role: 'Pick a role.',
  protected: 'That’s the store’s permanent owner account. It can’t be removed or changed.',
};

export default function TeamManager({ members, me }) {
  const router = useRouter();
  const [rows, setRows] = useState(members);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('fulfilment');
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null);

  async function setMember(targetEmail, newRole) {
    setBusy(targetEmail); setMsg(null);
    const { data, error } = await getBrowserClient().rpc('set_member_role', { p_email: targetEmail, p_role: newRole });
    setBusy('');
    if (error || data !== 'ok') return setMsg(['err', ERR[data] || error?.message || 'Something went wrong.']);
    setMsg(['ok', newRole === 'customer' ? `${targetEmail} no longer has admin access.` : `${targetEmail} is now ${ROLES[newRole].label}.`]);
    setRows((r) => { const i = r.findIndex((m) => m.email?.toLowerCase() === targetEmail.toLowerCase()); if (newRole === 'customer') return r.filter((_, j) => j !== i); if (i > -1) return r.map((m, j) => (j === i ? { ...m, role: newRole } : m)); return [...r, { id: targetEmail, email: targetEmail, role: newRole }]; });
    router.refresh();
  }

  return (
    <>
      <div className="ad-head"><h1>Team</h1></div>
      <section className="card-box">
        <h2 className="ad-h2">Add someone</h2>
        <p className="hint">They sign in with their own email, no password needed. Ask them to sign in once on the store first, then add them here.</p>
        <form className="om-inline wrap2" onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setMsg(['err', 'Enter their email address.']); setMember(email.trim(), role); setEmail(''); }}>
          <label className="lbl">Email<input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" /></label>
          <label className="lbl">Role<select className="select" value={role} onChange={(e) => setRole(e.target.value)}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
          <button className="btn btn-solid" aria-busy={!!busy && busy === email.trim()} disabled={!!busy}>Add to team</button>
        </form>
        {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : 'ok'}`} role="status">{msg[1]}</p>}
      </section>

      <section className="card-box">
        <h2 className="ad-h2">Who can do what</h2>
        <div className="roles-grid">{Object.entries(ROLES).map(([k, v]) => <div key={k}><b>{v.label}</b><span>{v.blurb}</span></div>)}</div>
      </section>

      <section className="card-box">
        <h2 className="ad-h2">Current team</h2>
        <div className="mini-list">{rows.map((m) => (
          <div key={m.id} className={`team-row ${busy === m.email ? 'is-loading' : ''}`}>
            <span><b>{m.full_name || m.email}</b><small>{m.email}{m.id === me ? ' · you' : ''}</small></span>
            {PERMANENT_OWNERS.includes((m.email || '').toLowerCase()) ? <span className="pill-s accent">Permanent owner</span> : m.id === me ? <span className="pill-s accent">{ROLES[m.role]?.label}</span> : (
              <span className="r">
                <select className="select" value={m.role} disabled={busy === m.email} onChange={(e) => setMember(m.email, e.target.value)} aria-label={`Role for ${m.email}`}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                <button className="linkish danger" disabled={busy === m.email} onClick={() => window.confirm(`Remove ${m.email} from the team?`) && setMember(m.email, 'customer')}>Remove</button>
              </span>
            )}
          </div>
        ))}</div>
      </section>
    </>
  );
}
