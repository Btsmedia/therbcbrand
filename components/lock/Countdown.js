'use client';
import { useEffect, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');
function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [['Days', Math.floor(s / 86400)], ['Hours', Math.floor((s % 86400) / 3600)], ['Mins', Math.floor((s % 3600) / 60)], ['Secs', s % 60]];
}

// Ticks down to the opening time; when it hits zero and auto-open is on, the page reloads into the open store.
export default function Countdown({ until, autoOpen }) {
  const target = Date.parse(until);
  const [now, setNow] = useState(null); // null on the server so the first paint matches
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (now != null && autoOpen && now >= target) { const r = setTimeout(() => window.location.reload(), 1500); return () => clearTimeout(r); }
  }, [now, autoOpen, target]);

  const p = parts(now == null ? 0 : target - now);
  const opening = now != null && now >= target;
  return (
    <div className="lk-count" role="timer" aria-live="off" aria-label="Time until we open">
      {opening ? <p className="lk-opening">Opening now…</p> : p.map(([l, v]) => (
        <div key={l} className="lk-cell"><b suppressHydrationWarning>{now == null ? '--' : pad(v)}</b><span>{l}</span></div>
      ))}
    </div>
  );
}
