import 'server-only';
import { FROM, orderEmail, staffOrderEmail } from './emails';
import { createAdminClient } from './supabase/admin';
import { hasServiceRole } from './config';

// Sends one email through Resend. Never throws: a failed email must not break checkout or an order update.
export async function sendEmail({ to, subject, html, text, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: 'Email isn’t set up (no RESEND_API_KEY).' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: Array.isArray(to) ? to : [to], subject, html, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    const j = await res.json().catch(() => ({}));
    return res.ok ? { ok: true, id: j.id } : { ok: false, error: j.message || `Resend error ${res.status}` };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Loads the order, builds the right email, sends it to the customer and notes it in the order history.
export async function emailOrder(orderId, kind) {
  if (!hasServiceRole) return { ok: false, error: 'no service role' };
  const db = createAdminClient();
  const { data: o } = await db.from('orders').select('*, order_items(name, colour, image, price, qty, custom, custom_photo, custom_fee)').eq('id', orderId).maybeSingle();
  if (!o) return { ok: false, error: 'order not found' };
  const mail = orderEmail(kind, o);
  if (!mail) return { ok: false, error: 'no template' };
  const r = await sendEmail({ to: o.email, ...mail });
  await db.from('order_events').insert({ order_id: o.id, kind: 'email', detail: r.ok ? mail.subject : `Email failed: ${r.error}`.slice(0, 300), by_email: 'Store' }).then(() => {}, () => {});
  if (!r.ok) console.error('order email failed', kind, o.number, r.error);
  // let the team know about new orders: paid automatically (card/OPay), or a transfer to look out for.
  // a transfer marked paid by staff doesn't alert anyone, since they did it themselves.
  if ((kind === 'paid' && ['paystack', 'opay'].includes(o.payment_method)) || kind === 'transfer') await alertTeam(db, o, kind === 'transfer' ? 'transfer' : 'paid');
  return r;
}

// Who hears about new orders: ORDER_ALERT_EMAILS (comma-separated) if set, otherwise owners, managers and fulfilment.
async function teamInbox(db) {
  const fromEnv = (process.env.ORDER_ALERT_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter((e) => /^\S+@\S+\.\S+$/.test(e));
  if (fromEnv.length) return fromEnv;
  const { data } = await db.from('profiles').select('email').in('role', ['owner', 'manager', 'fulfilment']);
  const list = [...new Set((data || []).map((r) => (r.email || '').toLowerCase()).filter(Boolean))];
  return list.length ? list.slice(0, 20) : ['boluwatifeosuolale3@gmail.com'];
}

async function alertTeam(db, o, kind) {
  try {
    const to = await teamInbox(db);
    const mail = staffOrderEmail(kind, o);
    const r = await sendEmail({ to, replyTo: o.email, ...mail });
    await db.from('order_events').insert({ order_id: o.id, kind: 'email', detail: r.ok ? `Team alerted (${to.length})` : `Team alert failed: ${r.error}`.slice(0, 300), by_email: 'Store' }).then(() => {}, () => {});
    if (!r.ok) console.error('team alert failed', o.number, r.error);
  } catch (e) { console.error('team alert failed', o.number, e.message); }
}
