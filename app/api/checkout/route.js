import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { hasSupabase, hasServiceRole, paystackLive, opayLive, testPaymentsAllowed } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { totals, NG_STATES } from '@/lib/pricing';
import { lookupCode } from '@/lib/discounts';
import { paystackInit, opayInit } from '@/lib/payments';
import { limited, isUuid } from '@/lib/rate-limit';
import { emailOrder } from '@/lib/mailer';
import { getLock } from '@/lib/catalog';
import { activeLock } from '@/lib/lock';
import { getUserAndRole } from '@/lib/supabase/server';
import { can } from '@/lib/roles';

// most unpaid bank-transfer orders the whole store accepts at once (they auto-cancel after 24 hours)
const TRANSFER_CAP = { hour: Number(process.env.TRANSFER_CAP_HOUR) || 10, day: Number(process.env.TRANSFER_CAP_DAY) || 40 };
const bad = (error, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req) {
  if (!hasSupabase || !hasServiceRole) return bad('The store database isn’t connected yet, so orders can’t be placed.', 503);
  if (limited(req, 'checkout', 10, 10 * 60 * 1000)) return bad('Too many order attempts. Please wait a few minutes and try again.', 429);
  // while the store is locked only the team can place (test) orders
  if (activeLock(await getLock())) {
    const { role } = await getUserAndRole().catch(() => ({ role: null }));
    if (!can(role).admin) return bad('The store is closed for now. Please check back when we reopen.', 403);
  }
  const b = await req.json().catch(() => null);
  if (!b || !Array.isArray(b.items) || !b.items.length) return bad('Your cart is empty.');
  if (b.items.length > 40) return bad('Your cart has too many different items. Split it into two orders.');
  if (!b.items.every((i) => isUuid(i?.variantId)) || !isUuid(b.rateId)) return bad('Your cart is out of date. Refresh the page and try again.');
  // the same colour + personalisation added twice counts as one line; a different name is its own line
  const PHOTO_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/custom-uploads/`;
  const merged = new Map();
  for (const i of b.items) {
    const personalise = !!i.personalise;
    const custom = personalise ? String(i.custom ?? '').trim().slice(0, 80) : '';
    // only accept a picture URL that really points at our uploads bucket
    const photo = personalise && typeof i.customPhoto === 'string' && i.customPhoto.startsWith(PHOTO_PREFIX) && i.customPhoto.length < 400 ? i.customPhoto : '';
    const key = `${i.variantId}|${personalise ? 1 : 0}|${custom}|${photo}`;
    const cur = merged.get(key) || { variantId: i.variantId, personalise, custom, customPhoto: photo, qty: 0 };
    cur.qty += Math.max(1, parseInt(i.qty, 10) || 1);
    merged.set(key, cur);
  }
  b.items = [...merged.values()];
  const str = (v, max = 200) => String(v ?? '').trim().slice(0, max);
  const email = str(b.email).toLowerCase(), phone = str(b.phone, 30).replace(/[\s-]/g, '');
  const first = str(b.first, 60), last = str(b.last, 60);
  const mode = b.mode === 'pickup' ? 'pickup' : 'ship';
  const state = str(b.state, 40);
  if (email.length > 120 || !/^[a-z0-9._%+'-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) return bad('Enter a valid email address.');
  if (!/^(\+?234|0)[789][01]\d{8}$/.test(phone)) return bad('Enter a Nigerian mobile number, like 0803 123 4567.');
  if (!first || !last) return bad('Enter your first and last name.');
  if (mode === 'ship' && (!str(b.address) || !str(b.city) || !NG_STATES.includes(state))) return bad('Enter your full delivery address.');
  if (!['paystack', 'opay', 'transfer'].includes(b.payment)) return bad('Choose a payment method.');

  const db = createAdminClient();
  // tidy up: unpaid bank-transfer orders older than 24 hours are cancelled and their stock returned
  await db.rpc('cancel_stale_transfers').then(() => {}, () => {});

  // 1. price every line from the database, never from the browser
  const ids = [...new Set(b.items.map((i) => i.variantId))];
  const { data: variants, error: vErr } = await db.from('product_variants')
    .select('id, colour, stock, products(id, name, price, status, categories, personalise, custom_label, custom_photo, custom_fee, product_images(url, position))').in('id', ids);
  if (vErr) return bad('We couldn’t check stock. Please try again.', 500);
  // stock is per variant, but the cart may hold several lines of one variant (different personalisation)
  const needPerVariant = new Map();
  for (const it of b.items) needPerVariant.set(it.variantId, (needPerVariant.get(it.variantId) || 0) + Math.max(1, Math.min(50, parseInt(it.qty, 10) || 1)));
  const lines = [];
  for (const it of b.items) {
    const v = variants.find((x) => x.id === it.variantId);
    const qty = Math.max(1, Math.min(50, parseInt(it.qty, 10) || 1));
    if (!v || v.products?.status !== 'live') return bad('One of the items in your cart is no longer available. Remove it and try again.');
    if (v.stock < needPerVariant.get(it.variantId)) return bad(`Only ${v.stock} of ${v.products.name} (${v.colour}) left. Update your cart and try again.`);
    const img = (v.products.product_images || []).sort((a, c) => a.position - c.position)[0]?.url;
    // personalisation only counts on products that offer it, and only when the customer opted in
    const on = !!v.products.personalise && !!it.personalise;
    const custom = on ? String(it.custom ?? '').trim().slice(0, 80) || null : null;
    const custom_photo = on && v.products.custom_photo ? (it.customPhoto || null) : null;
    if (on && !custom) return bad(`Please add the personalisation text for ${v.products.name}, or turn it off.`);
    const custom_fee = on ? Math.max(0, v.products.custom_fee || 0) : 0;
    lines.push({ variant_id: v.id, product_id: v.products.id, name: v.products.name, colour: v.colour, image: img, price: v.products.price + custom_fee, qty, custom, custom_photo, custom_fee, categories: v.products.categories });
  }

  // 2. delivery
  const { data: rate } = await db.from('delivery_rates').select('*').eq('id', b.rateId).eq('active', true).maybeSingle();
  const zoneOk = rate && (mode === 'pickup' ? rate.zone === 'pickup' : ['ife', 'nationwide'].includes(rate.zone));
  if (!zoneOk) return bad('Choose how you’d like to get your order.');
  if (rate.zone === 'ife' && state !== 'Osun') return bad('Local delivery is for Osun State addresses. Choose nationwide delivery instead.');
  // transfer and pay-on-delivery orders hold stock before any money moves, so cap how many one person can have open
  if (b.payment === 'transfer' || b.payment === 'pod') {
    if (lines.some((l) => l.qty > 5)) return bad('For bank transfer, order up to 5 of each item. For more, pay by card or contact us on WhatsApp.');
    const open = (col, val) => db.from('orders').select('id', { count: 'exact', head: true }).in('status', ['awaiting_transfer', 'pay_on_delivery']).eq(col, val);
    const [{ count: byEmail }, { count: byPhone }] = await Promise.all([open('email', email), open('phone', phone)]);
    if (Math.max(byEmail || 0, byPhone || 0) >= 2) return bad('You already have unpaid orders waiting. Complete or cancel those first, or pay by card.');
    // store-wide brake: fake transfer orders could otherwise tie up stock and use up the day's email allowance
    const since = (ms) => new Date(Date.now() - ms).toISOString();
    const recent = (ms) => db.from('orders').select('id', { count: 'exact', head: true }).eq('payment_method', 'transfer').eq('status', 'awaiting_transfer').gte('created_at', since(ms));
    const [{ count: lastHour }, { count: lastDay }] = await Promise.all([recent(3600e3), recent(864e5)]);
    if ((lastHour || 0) >= TRANSFER_CAP.hour || (lastDay || 0) >= TRANSFER_CAP.day) return bad('Bank transfer is busy right now. Please pay by card, transfer or USSD with Paystack instead, or message us on WhatsApp.', 429);
  }

  // 3. discount + totals
  const discount = b.code ? await lookupCode(b.code) : null;
  // delivery isn't charged here: staff confirm the fee (location and weight) after the order
  const t = totals(lines, null, discount);

  // 4. who is ordering (optional sign-in)
  let userId = null;
  try { const { data: { user } } = await (await createClient()).auth.getUser(); userId = user?.id || null; } catch {}

  const reference = `az_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  const status = b.payment === 'transfer' ? 'awaiting_transfer' : b.payment === 'pod' ? 'pay_on_delivery' : 'awaiting_payment';
  const { data: order, error: oErr } = await db.from('orders').insert({
    user_id: userId, email, phone, first_name: first, last_name: last, delivery_mode: mode,
    address: mode === 'ship' ? str(b.address) : null, apartment: mode === 'ship' ? str(b.apartment) || null : null,
    city: mode === 'ship' ? str(b.city, 80) : null, state: mode === 'ship' ? state : null,
    delivery_name: rate.name, subtotal: t.subtotal, discount: t.discount, discount_code: discount?.code || null,
    shipping: t.shipping || 0, total: t.total, payment_method: b.payment, payment_reference: reference, status, news_opt_in: !!b.news,
  }).select('*').single();
  if (oErr) { console.error(oErr); return bad('We couldn’t create your order. Please try again.', 500); }
  const { error: iErr } = await db.from('order_items').insert(lines.map(({ categories, ...l }) => ({ ...l, order_id: order.id })));
  if (iErr) { console.error(iErr); await db.from('orders').delete().eq('id', order.id); return bad('We couldn’t save your order items. Please try again.', 500); }

  // 5. hand over to the payment provider
  const testUrl = `/pay/test?order=${order.id}`;
  try {
    if (b.payment === 'paystack') {
      if (paystackLive) return NextResponse.json({ url: await paystackInit({ order }) });
      if (testPaymentsAllowed) return NextResponse.json({ url: testUrl });
      return bad('Card payments aren’t switched on yet.', 503);
    }
    if (b.payment === 'opay') {
      if (opayLive) return NextResponse.json({ url: await opayInit({ order: { ...order, item_count: lines.length } }) });
      if (testPaymentsAllowed) return NextResponse.json({ url: testUrl });
      return bad('OPay isn’t switched on yet.', 503);
    }
    await db.rpc('reserve_stock', { p_order: order.id });
    await emailOrder(order.id, b.payment === 'transfer' ? 'transfer' : 'pod');
    return NextResponse.json({ url: `/order/${order.id}` });
  } catch (e) {
    console.error(e);
    await db.from('orders').update({ status: 'failed' }).eq('id', order.id);
    return bad('We couldn’t start the payment. Please try again or choose another payment method.', 502);
  }
}
