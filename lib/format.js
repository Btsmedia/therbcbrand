export const naira = (n) => '₦' + Math.round(Number(n) || 0).toLocaleString('en-NG');
export const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export const pctOff = (p) => (p.compare_at && p.compare_at > p.price ? Math.round((1 - p.price / p.compare_at) * 100) : 0);
export const esc = (s) => String(s ?? '');
