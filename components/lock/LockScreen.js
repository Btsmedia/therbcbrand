import Countdown from './Countdown';
import NotifyForm from './NotifyForm';
import Mascot from './Mascot';

// petals drifting down the page: [left %, size px, duration s, delay s]
const PETALS = [[4, 14, 13, 0], [14, 10, 17, -6], [26, 16, 15, -11], [38, 9, 19, -3], [52, 13, 14, -8], [63, 11, 18, -14], [74, 15, 16, -2], [85, 10, 20, -9], [94, 13, 15, -5]];
const flower = (k, x, y, s, c, r) => (
  <svg key={k} className="lk-fl" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, color: c, animationDelay: `${(k % 5) * -1.3}s`, transform: `rotate(${r}deg)` }} viewBox="0 0 32 32" aria-hidden="true">
    <g fill="currentColor">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="16" cy="8" rx="5" ry="7" transform={`rotate(${a} 16 16)`} />)}</g><circle cx="16" cy="16" r="3" fill="#fff" />
  </svg>
);
const FLOWERS = [[6, 14, 34, 0], [88, 10, 26, 20], [14, 72, 22, 40], [80, 66, 38, 10], [48, 6, 18, 60], [93, 42, 16, 30], [3, 44, 18, 15], [62, 88, 24, 50]];
const COLORS = ['var(--lk-f1)', 'var(--lk-f2)', 'var(--lk-f3)'];

// The full page shoppers see while the store is locked.
export default function LockScreen({ lock, whatsapp, preview = false }) {
  const wa = String(whatsapp || '').replace(/\D/g, '');
  const showCount = lock.until && Date.parse(lock.until) > Date.now();
  return (
    <div className={`lk lk-${lock.template === 'launch' ? 'auto' : lock.tone}`}>
      {FLOWERS.map(([x, y, s, r], i) => flower(i, x, y, s, COLORS[i % 3], r))}
      <div className="lk-petals" aria-hidden="true">{PETALS.map(([x, s, d, dl], i) => <i key={i} style={{ left: `${x}%`, width: s, height: s * 1.4, animationDuration: `${d}s`, animationDelay: `${dl}s`, background: COLORS[i % 3] }} />)}</div>
      {preview && <div className="lk-preview">Preview · shoppers see this while the store is locked · <a href="/admin/lock">Back to admin</a></div>}
      <div className="lk-in">
        <div className="lk-logo"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="9" fill="currentColor" /><text x="16" y="22" textAnchor="middle" fontFamily="Gloock, Georgia, serif" fontSize="16" fill="var(--lk-bg)">R</text></svg>RBC</div>
        {lock.template === 'launch' ? <Mascot /> : <img className="lk-hero" src={`/email/hero/${lock.hero}.png`} alt="" width="560" height="240" />}
        <span className="lk-eyebrow">{lock.eyebrow}</span>
        <h1 className="lk-title">{lock.title}</h1>
        {lock.badge && <span className="lk-badge">{lock.badge}</span>}
        <p className="lk-msg">{lock.message}</p>        {showCount && <Countdown until={lock.until} autoOpen={lock.autoOpen} />}
        {lock.notify && <NotifyForm reason={lock.template} cta={lock.cta} />}
        <div className="lk-links">
          {wa && <a href={`https://wa.me/${wa}?text=${encodeURIComponent('Hi, I have a question.')}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>}
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a>
          <a href="/account">Track an order</a>
        </div>
      </div>
    </div>
  );
}
