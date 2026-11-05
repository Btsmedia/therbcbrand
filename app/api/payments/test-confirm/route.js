import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { testPaymentsAllowed, paystackLive, opayLive } from '@/lib/config';
import { limited, isUuid } from '@/lib/rate-limit';
import { emailOrder } from '@/lib/mailer';

// Test mode only: lets you finish a checkout before real payment keys are added.
// Switched off completely once ALLOW_TEST_PAYMENTS is false.
export async function POST(req) {
  if (!testPaymentsAllowed) return NextResponse.json({ error: 'Test payments are switched off.' }, { status: 403 });
  if (limited(req, 'testpay', 20, 10 * 60 * 1000)) return NextResponse.json({ error: 'Too many tries.' }, { status: 429 });
  const { orderId, outcome } = await req.json().catch(() => ({}));
  if (!isUuid(orderId)) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  const db = createAdminClient();
  const { data: order } = await db.from('orders').select('id, payment_method, payment_reference, total, status').eq('id', orderId).maybeSingle();
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  // only card/OPay orders that are still waiting, and only while that method has no real keys
  if (!['paystack', 'opay'].includes(order.payment_method) || order.status !== 'awaiting_payment') return NextResponse.json({ error: 'This order can’t be test-paid.' }, { status: 403 });
  if ((order.payment_method === 'paystack' && paystackLive) || (order.payment_method === 'opay' && opayLive)) return NextResponse.json({ error: 'This method uses real payments.' }, { status: 403 });
  if (outcome === 'fail') { await db.from('orders').update({ status: 'failed' }).eq('id', order.id).eq('status', 'awaiting_payment'); return NextResponse.json({ ok: true }); }
  const { data } = await db.rpc('mark_order_paid', { p_order: order.id, p_reference: order.payment_reference, p_amount_kobo: order.total * 100 });
  if (data === 'paid') await emailOrder(order.id, 'paid');
  return NextResponse.json({ ok: data === 'paid', result: data });
}
