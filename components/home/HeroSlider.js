'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const SLIDES = [
  { tone: 't3', eyebrow: 'Personalised gifts · Made to order', title: 'Gifts with their name on it', lede: 'Mugs, journals, bottles and keepsakes, printed with a name, a photo or a few words of your own.', ctas: [['Personalise a gift', '/shop', 'solid'], ['Browse all gifts', '/shop', 'line']], imgs: ['7246', '7278', '7247'] },
  { tone: 't4', eyebrow: 'Weddings · Birthdays · Corporate events', title: 'Souvenirs your guests will keep', lede: 'Branded souvenir packs for weddings, parties, conferences and teams. Order in bulk and we deliver nationwide.', ctas: [['Shop event souvenirs', '/shop', 'solid']], imgs: ['7270', '7235', '7242'] },
  { tone: 't2', eyebrow: 'For the home', title: 'Quiet pieces for everyday rooms', lede: 'Bath, kitchen, lighting and storage finds, chosen to give or to keep.', ctas: [['Shop home pieces', '/shop', 'solid']], imgs: ['7244', '7248', '7317'] },
];

export default function HeroSlider() {
  const [cur, setCur] = useState(0);
  const tx = useRef(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setCur((c) => (c + 1) % 3), 6500);
    return () => clearTimeout(t);
  }, [cur]);
  return (
    <section className="hero" aria-label="Featured collections">
      <div className="slides"
        onTouchStart={(e) => { tx.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { if (tx.current == null) return; const dx = e.changedTouches[0].clientX - tx.current; if (Math.abs(dx) > 50) setCur((c) => (c + (dx < 0 ? 1 : 2)) % 3); tx.current = null; }}>
        {SLIDES.map((s, i) => (
          <div key={i} className={`slide photo ${i === cur ? 'on' : ''}`} style={{ '--sb': `var(--${s.tone})` }} aria-hidden={i !== cur}>
            <div className="wrap hs">
              <div className="inner">
                <span className="eyebrow">{s.eyebrow}</span>
                {i === 0 ? <h1>{s.title}</h1> : <h2>{s.title}</h2>}
                <p className="lede">{s.lede}</p>
                <div className="ctas">{s.ctas.map(([t, h, k]) => <Link key={t} className={`btn btn-${k}`} href={h} tabIndex={i === cur ? 0 : -1}>{t}</Link>)}</div>
              </div>
              <div className="stack" aria-hidden="true">
                {s.imgs.map((n, j) => <figure key={n} className={`ph p${j + 1}`}><img src={`/img/${n}.jpg`} alt="" loading={i === 0 ? 'eager' : 'lazy'} /></figure>)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="hero-ctrl"><div className="wrap">
        {SLIDES.map((_, i) => <button key={i} className={`dot ${i === cur ? 'on' : i < cur ? 'done' : ''}`} aria-label={`Slide ${i + 1}`} onClick={() => setCur(i)}><i key={`${i}-${cur}`} /></button>)}
        <span className="hero-num">0{cur + 1} / 03</span>
      </div></div>
    </section>
  );
}
