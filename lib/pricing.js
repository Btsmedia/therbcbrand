// Shared money maths. The server always recomputes totals from database prices; the browser only uses this for display.
export function discountAmount(lines, discount) {
  if (!discount) return 0;
  const eligible = lines.filter((l) => !discount.category || (l.categories || []).includes(discount.category));
  const base = eligible.reduce((a, l) => a + l.price * l.qty, 0);
  return Math.round((base * discount.percent) / 100);
}
export function shippingFor(rate, subtotal) {
  if (!rate) return null;
  if (rate.free_over && subtotal >= rate.free_over) return 0;
  return rate.price;
}
export function totals(lines, rate, discount) {
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const disc = discountAmount(lines, discount);
  const shipping = shippingFor(rate, subtotal);
  const total = subtotal - disc + (shipping || 0);
  return { subtotal, discount: disc, shipping, total, vat: Math.round((total * 7.5) / 107.5) };
}
export const NG_STATES = ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT – Abuja','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'];
