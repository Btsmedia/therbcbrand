'use client';
import { useEffect, useState } from 'react';

const KEY = 'rbc_theme';
const OPTS = [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']];

export default function ThemeSwitch() {
  const [mode, setMode] = useState('auto');
  useEffect(() => { try { setMode(localStorage.getItem(KEY) || 'auto'); } catch {} }, []);
  const pick = (m) => {
    setMode(m);
    const root = document.documentElement;
    if (m === 'auto') delete root.dataset.theme; else root.dataset.theme = m;
    try { if (m === 'auto') localStorage.removeItem(KEY); else localStorage.setItem(KEY, m); } catch {}
  };
  return (
    <div className="theme-sw" role="group" aria-label="Colour theme">
      {OPTS.map(([k, label]) => <button key={k} type="button" aria-pressed={mode === k} onClick={() => pick(k)}>{label}</button>)}
    </div>
  );
}
