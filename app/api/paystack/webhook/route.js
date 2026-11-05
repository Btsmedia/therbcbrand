import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { paystackSignatureValid, paystackVerify } from '@/lib/payments';
import { emailOrder } from '@/lib/mailer';

// Paystack → Dashboard → Settings → API Keys & Webhooks → Webhook URL: https://<your-site>/api/paystack/webhook
export async function POST(req) {
  if (!process.env.PAYSTACK_SECRET_KEY) return NextResponse.json({ ok: false }, { status: 503 });
  const raw = await req.text();
  if (!paystackSignatureValid(raw, req.headers.get('x-paystack-signature'))) return NextResponse.json({ ok: false }, { status: 401 });
  let event;
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const reference = event?.data?.reference;
  if (event.event === 'charge.success' && typeof reference === 'string') {
    const db = createAdminClient();
    const { data: order } = await db.from('orders').select('id').eq('payment_reference', reference).maybeSingle();
    if (order) {
      // double-check with Paystack directly before marking paid
      const r = await paystackVerify(reference);
      if (r.ok && r.currency === 'NGN') {
        const { data: res } = await db.rpc('mark_order_paid', { p_order: order.id, p_reference: reference, p_amount_kobo: r.amountKobo });
        if (res === 'paid') await emailOrder(order.id, 'paid');
      }
    }
  }
  return NextResponse.json({ ok: true });
}
