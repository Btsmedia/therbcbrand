'use client';
import { useEffect, useState } from 'react';

// The envelope mascot: bobs gently; tapping it (or the email box) opens it and a flower pops out.
export default function Mascot() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const input = document.getElementById('lk-email');
    if (!input) return;
    const on = () => setOpen(true);
    input.addEventListener('focus', on);
    return () => input.removeEventListener('focus', on);
  }, []);

  return (
    <button type="button" className={`lk-mascot ${open ? 'open' : ''}`} onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close the envelope' : 'Open the envelope'}>
      <svg viewBox="0 0 200 170" aria-hidden="true">
        <ellipse className="m-shadow" cx="100" cy="160" rx="62" ry="7" />
        <g className="m-body">
          <rect className="m-env" x="34" y="62" width="132" height="90" rx="12" />
          <path className="m-front" d="M36 70 L100 116 L164 70 L164 140 Q164 150 154 150 L46 150 Q36 150 36 140 Z" />
          <path className="m-flap" d="M36 66 L100 112 L164 66" />
          <g className="m-flower">
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="100" cy="44" rx="11" ry="17" transform={`rotate(${a} 100 62)`} />)}
            <circle cx="100" cy="62" r="7" className="m-core" />
          </g>
          <g className="m-face">
            <ellipse cx="86" cy="128" rx="3.4" ry="4.4" /><ellipse cx="114" cy="128" rx="3.4" ry="4.4" />
            <path d="M93 136 Q100 142 107 136" className="m-smile" />
            <circle cx="76" cy="136" r="5" className="m-blush" /><circle cx="124" cy="136" r="5" className="m-blush" />
          </g>
        </g>
      </svg>
    </button>
  );
}
