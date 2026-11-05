'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// A thin purple line at the top of the screen while the next page loads.
export default function NavProgress() {
  const path = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState('');
  const timer = useRef();

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page or #anchor
      clearTimeout(timer.current);
      setState('go');
    };
    document.addEventListener('click', onClick, true); // capture: runs before Link cancels the click
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    setState((s) => (s === 'go' ? 'done' : s));
    timer.current = setTimeout(() => setState(''), 600);
    return () => clearTimeout(timer.current);
  }, [path, search]);

  return <div className={`nav-progress ${state}`} aria-hidden="true" />;
}
