import { NextResponse } from 'next/server';
import { hasSupabase, hasServiceRole, paystackLive } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { paystackVerify } from '@/lib/payments';
import { emailOrder } from '@/lib/mailer';
import { limited, isUuid } from '@/lib/rate-limit';

// Customers can cancel an order themselves only while nothing has been paid.
// The order link (a long random id) is the proof it's theirs, same as viewing the order page.
const CANCELLABLE = ['awaiting_payment', 'awaiting_transfer', 'failed'];

export async function POST(req, { params }) {
  const { id } = await params;
  if (!hasSupabase || !hasServiceRole || !isUuid(id)) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (limited(req, 'cancel', 6, 10 * 60 * 1000)) return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 });

  const db = createAdminClient();
  const { data: o } = await db.from('orders').select('id, status, payment_method, payment_reference').eq('id', id).maybeSingle();
  if (!o) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (!CANCELLABLE.includes(o.status)) return NextResponse.json({ error: o.status === 'cancelled' ? 'This order is already cancelled.' : 'This order is paid, so it can’t be cancelled here. Message us on WhatsApp and we’ll help.' }, { status: 409 });

  // a card payment may have just gone through: check with Paystack before cancelling
  if (o.payment_method === 'paystack' && o.payment_reference && paystackLive) {
    const r = await paystackVerify(o.payment_reference).catch(() => null);
    if (r?.ok && r.currency === 'NGN') {
      const { data: res } = await db.rpc('mark_order_paid', { p_order: o.id, p_reference: o.payment_reference, p_amount_kobo: r.amountKobo });
      if (res === 'paid') await emailOrder(o.id, 'paid');
      return NextResponse.json({ error: 'Your payment has just come through, so this order is confirmed and wasn’t cancelled.', paid: true }, { status: 409 });
    }
  }

  // only cancel if it's still unpaid at this exact moment (guards against a payment landing in between)
  const { data: done, error } = await db.from('orders').update({ status: 'cancelled' }).eq('id', o.id).in('status', CANCELLABLE).select('id');
  if (error) return NextResponse.json({ error: 'Couldn’t cancel the order. Please try again.' }, { status: 500 });
  if (!done?.length) return NextResponse.json({ error: 'This order changed a moment ago. Refresh the page to see its status.' }, { status: 409 });

  await db.from('order_events').insert({ order_id: o.id, kind: 'note', detail: 'Cancelled by the customer from the order page', by_email: 'Customer' }).then(() => {}, () => {});
  await emailOrder(o.id, 'cancelled_by_you');
  return NextResponse.json({ ok: true });
}
