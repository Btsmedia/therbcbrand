// The store policies page (/policies), edited at /admin/policies.
// Each section has a title, an optional paragraph, and optional bullet points ("label" is the bold start).
export const POL_LIMITS = { sections: 8, title: 60, text: 1200, points: 10, label: 60, point: 400, total: 7000 };

export const POL_DEFAULTS = {
  sections: [
    {
      id: 'delivery', title: 'Delivery', text: '',
      points: [
        { label: 'Nationwide delivery.', text: 'Interstate delivery takes 1 to 3 days. For farther locations we ship with GIG or DHL.' },
                { label: 'Pickup.', text: 'Collect your order from our pickup point. We’ll send you the details on WhatsApp.' },
        { label: 'Delivery fees.', text: 'Fees depend on your location and the weight of your package, so they aren’t charged at checkout. We confirm your fee on WhatsApp after you order, and you pay it separately.' },
      ],
    },
    { id: 'returns', title: 'Help with an order', text: 'If there’s a problem with your order, message us on WhatsApp with your order number and we’ll help sort it out.', points: [] },
    { id: 'privacy', title: 'Privacy', text: 'We use your name, contact details and address only to process and deliver your orders, and to send updates you’ve asked for. Paystack or OPay handle payments, so we never see or store your card details. You can ask us to see or delete your data at any time.', points: [] },
  ],
};

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const slugify = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'section';

export function cleanPolicies(v) {
  if (!v || !Array.isArray(v.sections)) return structuredClone(POL_DEFAULTS);
  const used = new Set();
  const sections = v.sections.slice(0, POL_LIMITS.sections).map((s) => {
    const title = str(s?.title, POL_LIMITS.title);
    // keep existing anchors (the footer links to #delivery, #returns, #privacy)
    let id = typeof s?.id === 'string' && /^[a-z0-9-]{1,40}$/.test(s.id) ? s.id : slugify(title);
    while (used.has(id)) id = `${id}-2`;
    used.add(id);
    const points = (Array.isArray(s?.points) ? s.points : []).slice(0, POL_LIMITS.points)
      .map((p) => ({ label: str(p?.label, POL_LIMITS.label), text: str(p?.text, POL_LIMITS.point) }))
      .filter((p) => p.label || p.text);
    return { id, title, text: str(s?.text, POL_LIMITS.text), points };
  }).filter((s) => s.title && (s.text || s.points.length));
  return { sections };
}

// rough size of what will be stored, so the editor can warn before the database refuses it
export const policiesSize = (v) => new TextEncoder().encode(JSON.stringify(v)).length;
