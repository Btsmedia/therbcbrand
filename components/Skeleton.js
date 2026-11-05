// Quiet placeholders shown while a page loads. They fade in only if loading takes a moment.
export function GridSkeleton({ n = 8 }) {
  return (
    <div className="wrap sk-page" aria-busy="true" aria-label="Loading">
      <div className="sk sk-title" />
      <div className="sk-grid">{Array.from({ length: n }, (_, i) => <div key={i} className="sk-card"><div className="sk" /><div className="sk sk-line" style={{ width: '80%' }} /><div className="sk sk-line" style={{ width: '40%' }} /></div>)}</div>
    </div>
  );
}
export function DetailSkeleton() {
  return (
    <div className="wrap sk-page" aria-busy="true" aria-label="Loading" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 32 }}>
      <div className="sk" style={{ aspectRatio: '4/5' }} />
      <div><div className="sk sk-title" />{[90, 60, 75, 40].map((w, i) => <div key={i} className="sk sk-line" style={{ width: `${w}%` }} />)}<div className="sk" style={{ height: 52, borderRadius: 999, marginTop: 24 }} /></div>
    </div>
  );
}
export function ListSkeleton({ rows = 6 }) {
  return (
    <div className="sk-page" style={{ paddingTop: 8 }} aria-busy="true" aria-label="Loading">
      <div className="sk sk-title" />
      <div className="card-box">{Array.from({ length: rows }, (_, i) => <div key={i} className="sk sk-line" style={{ height: 22, width: `${95 - (i % 3) * 12}%` }} />)}</div>
    </div>
  );
}
