import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { emailOrder } from '@/lib/mailer';
import { EMAIL_FOR_STATUS } from '@/lib/emails';
import { isUuid } from '@/lib/rate-limit';

// Team order updates go through here so the customer can be emailed afterwards.
// The update itself runs as the signed-in staff member, so the database rules (roles, allowed status changes) still apply.
export async function POST(req, { params }) {
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 });

  const b = await req.json().catch(() => ({}));
  const patch = {};
  if (typeof b.status === 'string') patch.status = b.status;
  if ('delivery_fee' in b) patch.delivery_fee = b.delivery_fee === null || b.delivery_fee === '' ? null : Math.round(Number(b.delivery_fee));
  if ('courier' in b) patch.courier = b.courier ? String(b.courier).slice(0, 40) : null;
  if ('tracking_number' in b) patch.tracking_number = b.tracking_number ? String(b.tracking_number).trim().slice(0, 80) : null;
  if ('staff_note' in b) patch.staff_note = b.staff_note ? String(b.staff_note).slice(0, 2000) : null;
  if (patch.delivery_fee != null && (!Number.isFinite(patch.delivery_fee) || patch.delivery_fee < 0)) return NextResponse.json({ error: 'Enter the fee in naira, like 3500.' }, { status: 400 });
  if (!Object.keys(patch).length) return NextResponse.json({ error: 'Nothing to change.' }, { status: 400 });

  const { data: before } = await sb.from('orders').select('status, delivery_fee').eq('id', id).maybeSingle();
  if (!before) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  const { data, error } = await sb.from('orders').update(patch).eq('id', id).select('*').maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: 'Your role can’t update orders.' }, { status: 403 });

  // email the customer about what changed (unless the team member unticked it)
  let emailed = null;
  if (b.notify !== false) {
    const kind = patch.status && patch.status !== before.status ? EMAIL_FOR_STATUS[patch.status]
      : 'delivery_fee' in patch && patch.delivery_fee != null && patch.delivery_fee !== before.delivery_fee ? 'delivery_fee' : null;
    if (kind) { const r = await emailOrder(id, kind); emailed = r.ok ? 'sent' : `failed: ${r.error}`; }
  }
  return NextResponse.json({ order: data, emailed });
}
