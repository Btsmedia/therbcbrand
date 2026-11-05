import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { opayStatus } from '@/lib/payments';
import { opayLive } from '@/lib/config';
import { emailOrder } from '@/lib/mailer';

// OPay calls this after a payment. We never trust the message itself: we ask OPay for the status before marking the order paid.
export async function POST(req) {
  if (!opayLive) return NextResponse.json({ ok: false }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const reference = body?.payload?.reference || body?.reference;
  if (typeof reference !== 'string' || !/^az_[0-9a-f]{16}$/.test(reference)) return NextResponse.json({ ok: false }, { status: 400 });
  const db = createAdminClient();
  const { data: order } = await db.from('orders').select('id').eq('payment_reference', reference).maybeSingle();
  if (order) {
    const s = await opayStatus(reference);
    if (s.ok) {
      const { data: res } = await db.rpc('mark_order_paid', { p_order: order.id, p_reference: reference, p_amount_kobo: s.amountKobo });
      if (res === 'paid') await emailOrder(order.id, 'paid');
    }
  }
  return NextResponse.json({ ok: true });
}
