'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { naira } from '@/lib/format';

const CAT = { beauty: 'Bath & beauty', gadgets: 'Gadgets', kitchen: 'Kitchen', lighting: 'Lighting', storage: 'Storage', decor: 'Decor' };
const TABS = [['all', 'All'], ['live', 'Live'], ['draft', 'Drafts'], ['archived', 'Archived']];

export default function ProductsBrowser({ products }) {
  const [rows, setRows] = useState(products);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');

  // remember the chosen pill, so editing a product and coming back keeps you on the same tab
  useEffect(() => {
    try {
      const fromUrl = new URLSearchParams(window.location.search).get('status');
      const saved = fromUrl || sessionStorage.getItem('az_prodTab');
      if (saved && TABS.some((t) => t[0] === saved)) setTab(saved);
    } catch {}
  }, []);
  const changeTab = (k) => {
    setTab(k);
    try {
      sessionStorage.setItem('az_prodTab', k);
      const url = new URL(window.location.href);
      if (k === 'all') url.searchParams.delete('status'); else url.searchParams.set('status', k);
      window.history.replaceState(null, '', url);
    } catch {}
  };
  const [busy, setBusy] = useState('');
  const [confirmId, setConfirmId] = useState('');  // row awaiting delete confirmation
  const [msg, setMsg] = useState(null);
  const sb = getBrowserClient();

  const counts = useMemo(() => rows.reduce((m, p) => ({ ...m, all: (m.all || 0) + 1, [p.status]: (m[p.status] || 0) + 1 }), {}), [rows]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((p) => (tab === 'all' || p.status === tab) && (!needle || p.name.toLowerCase().includes(needle) || (CAT[p.category] || '').toLowerCase().includes(needle)));
  }, [rows, tab, q]);

  async function del(p) {
    setBusy(p.id); setConfirmId(''); setMsg(null);
    const { data, error } = await sb.from('products').delete().eq('id', p.id).select('id');
    setBusy('');
    if (error) return setMsg(['err', `Couldn’t delete ${p.name}: ${error.message}`]);
    if (!data?.length) return setMsg(['err', `Couldn’t delete ${p.name}. You may not have permission.`]);
    setRows((r) => r.filter((x) => x.id !== p.id));
    setMsg(['ok', `${p.name} deleted.`]);
  }

  return (
    <>
      <div className="row-between"><h1>Products <span className="hint">{counts.all || 0}</span></h1><Link className="btn btn-solid" href="/admin/products/new">New product</Link></div>
      {msg && <p className={`notice ${msg[0] === 'err' ? 'err' : 'ok'}`} role="status">{msg[1]}</p>}

      <div className="pl-controls">
        <div className="pl-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products by name or category" aria-label="Search products" />
          {q && <button type="button" className="pl-clear" onClick={() => setQ('')} aria-label="Clear search">×</button>}
        </div>
        <div className="tabs pl-tabs">{TABS.map(([k, l]) => <button key={k} className="tab" aria-selected={tab === k} onClick={() => changeTab(k)}>{l}{counts[k] ? ` (${counts[k]})` : ''}</button>)}</div>
      </div>

      {shown.length === 0 ? (
        <p className="muted" style={{ padding: '24px 0' }}>{q ? `No products match “${q}”.` : 'No products here yet.'}</p>
      ) : (
        <div className="apc-grid">
          {shown.map((p) => {
            return (
              <article className={`apc-card ${busy === p.id ? 'is-loading' : ''}`} key={p.id}>
                <div className="apc-top">
                  <Link href={`/admin/products/${p.id}`} className="apc-thumb" aria-label={`Edit ${p.name}`}>
                    {p.image ? <img src={p.image} alt="" /> : <span className="pl-noimg">No photo</span>}
                  </Link>
                  <div className="apc-info">
                    <Link href={`/admin/products/${p.id}`} className="apc-name">{p.name}</Link>
                    <span className="apc-meta">
                      {CAT[p.category] || p.category}
                    </span>
                    <span className="apc-tags">
                      <span className={`pill-s ${p.status === 'live' ? 'good' : p.status === 'draft' ? 'warn' : ''}`}>{p.status}</span>
                      {p.personalised && <span className="pl-pers">Personalised</span>}
                    </span>
                    <div className="apc-priceline">
                      <span className="apc-price">{p.price ? naira(p.price) : <b className="pill-s warn">Set price</b>}{p.compare_at ? <s>{naira(p.compare_at)}</s> : null}</span>
                      <span className={`apc-qty ${p.stock === 0 ? 'out' : p.stock <= 4 ? 'low' : ''}`}>{p.stock === 0 ? 'Sold out' : `×${p.stock}`}</span>
                    </div>
                  </div>
                </div>
                <div className="apc-foot">
                  <div className="apc-cols">
                    <span>{p.colours.length === 1 ? '1 colour' : `${p.colours.length} colours`}</span>
                    <div className="apc-sw">{p.colours.map((c) => <i key={c.colour} title={`${c.colour}${c.stock ? ` · ${c.stock} in stock` : ' · sold out'}`} className={c.stock ? '' : 'out'} style={{ background: c.hex }} />)}{p.colours.length === 1 && <small>{p.colours[0].colour}</small>}</div>
                  </div>
                  {confirmId === p.id ? (
                    <div className="apc-acts">
                      <button className="apc-pill apc-danger" disabled={busy === p.id} onClick={() => del(p)}>{busy === p.id ? 'Deleting…' : 'Yes, delete'}</button>
                      <button className="apc-round" onClick={() => setConfirmId('')} aria-label="Keep product" title="Keep">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="apc-acts">
                      <Link className={`apc-pill ${p.status === 'live' ? 'solid' : ''}`} href={`/admin/products/${p.id}`}>Edit product</Link>
                      <button className={`apc-round ${p.status === 'live' ? 'solid' : ''}`} disabled={busy === p.id} onClick={() => setConfirmId(p.id)} aria-label={`Delete ${p.name}`} title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
