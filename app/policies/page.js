import { getPolicies } from '@/lib/catalog';

export const metadata = { title: 'Policies' };
export const revalidate = 60;

// Wording is edited by the team at /admin/policies.
export default async function Policies() {
  const { sections } = await getPolicies();
  return (
    <div className="wrap page-pad" style={{ maxWidth: 760 }}>
      <h1 className="page-title" style={{ marginBottom: 28 }}>Store policies</h1>
      {sections.map((s) => (
        <section key={s.id} id={s.id} style={{ padding: '0 0 28px' }}>
          <h2 className="display" style={{ fontSize: 30 }}>{s.title}</h2>
          {s.text && s.text.split(/\n{2,}/).map((para, i) => <p key={i} className="muted" style={{ whiteSpace: 'pre-line', marginBottom: 10 }}>{para}</p>)}
          {s.points.length > 0 && <ul className="muted pol-list">{s.points.map((p, i) => <li key={i}>{p.label && <b>{p.label}</b>}{p.label && p.text ? ' ' : ''}{p.text}</li>)}</ul>}
        </section>
      ))}
    </div>
  );
}
