'use client';
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);
// a line is identified by its colour and any personalisation text, so two different names stay separate
export const lineKey = (l) => `${l.variantId}|${l.personalise ? 1 : 0}|${l.custom || ''}|${l.customPhoto || ''}`;

// A cart line keeps a display snapshot; the server re-prices everything at checkout.
export default function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const [wish, setWish] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setLines(JSON.parse(localStorage.getItem('az_cart') || '[]'));
      setWish(JSON.parse(localStorage.getItem('az_wish') || '[]'));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem('az_cart', JSON.stringify(lines)); } catch {} }, [lines, ready]);
  useEffect(() => { if (ready) try { localStorage.setItem('az_wish', JSON.stringify(wish)); } catch {} }, [wish, ready]);

  const say = useCallback((m) => { setToast(m); clearTimeout(say.t); say.t = setTimeout(() => setToast(''), 2200); }, []);

  const add = useCallback((product, variant, qty = 1, { silent, personalise, custom, customPhoto } = {}) => {
    if (!variant || variant.stock <= 0) { say('That colour is sold out'); return; }
    const on = !!personalise;
    const note = on ? (custom || '').trim().slice(0, 80) : '';
    const photo = on ? (customPhoto || '') : '';
    const fee = on ? (product.customFee || 0) : 0;
    const unit = product.price + fee;
    setLines((ls) => {
      const i = ls.findIndex((l) => l.variantId === variant.id && !!l.personalise === on && (l.custom || '') === note && (l.customPhoto || '') === photo);
      if (i > -1) { const c = [...ls]; c[i] = { ...c[i], qty: Math.min(c[i].qty + qty, variant.stock) }; return c; }
      return [...ls, { productId: product.id, variantId: variant.id, slug: product.slug, name: product.name, colour: variant.colour, price: unit, image: product.images[0], categories: product.categories, personalise: on || undefined, customFee: fee || undefined, custom: note || undefined, customPhoto: photo || undefined, qty: Math.min(qty, variant.stock) }];
    });
    if (!silent) setOpen(true); else say(`${product.name} added`);
  }, [say]);

  const setQty = (key, qty) => setLines((ls) => (qty < 1 ? ls.filter((l) => lineKey(l) !== key) : ls.map((l) => (lineKey(l) === key ? { ...l, qty } : l))));
  const clear = () => setLines([]);
  const toggleWish = (id) => setWish((w) => { const on = w.includes(id); say(on ? 'Removed from wishlist' : 'Saved to your wishlist'); return on ? w.filter((x) => x !== id) : [...w, id]; });

  const value = useMemo(() => ({
    lines, add, setQty, clear, open, setOpen, wish, toggleWish, say, ready,
    count: lines.reduce((a, l) => a + l.qty, 0),
    subtotal: lines.reduce((a, l) => a + l.price * l.qty, 0),
  }), [lines, add, open, wish, say, ready]);

  return (
    <CartCtx.Provider value={value}>
      {children}
      <div className={`toast ${toast ? 'on' : ''}`} role="status" aria-live="polite">{toast}</div>
    </CartCtx.Provider>
  );
}
