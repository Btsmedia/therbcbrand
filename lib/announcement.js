// The announcement bar at the top of the store. Shared by the header and the admin page.
export const ANN_DEFAULTS = { on: true, text: 'Personalised gifts & souvenirs · Nationwide delivery', link: '', linkLabel: '', tone: 'deep' };
export const ANN_LIMITS = { text: 120, linkLabel: 24 };
export const ANN_TONES = { deep: 'Dark (default)', accent: 'Brand purple', soft: 'Soft lilac' };

// only store pages ("/shop?sale=1") or https links; anything else is dropped
export const safeLink = (v) => {
  const s = String(v || '').trim();
  if (/^\/(?!\/)[^\s]*$/.test(s)) return s.slice(0, 200);
  try { const u = new URL(s); return u.protocol === 'https:' ? u.href.slice(0, 300) : ''; } catch { return ''; }
};

export function cleanAnnouncement(v = {}) {
  const text = typeof v.text === 'string' ? v.text.trim().slice(0, ANN_LIMITS.text) : ANN_DEFAULTS.text;
  const link = safeLink(v.link);
  return {
    on: v.on !== false && !!text,
    text,
    link,
    linkLabel: link && typeof v.linkLabel === 'string' ? v.linkLabel.trim().slice(0, ANN_LIMITS.linkLabel) : '',
    tone: ANN_TONES[v.tone] ? v.tone : 'deep',
  };
}
