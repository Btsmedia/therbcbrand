import { notFound } from 'next/navigation';
import { hasServiceRole, testPaymentsAllowed } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { naira } from '@/lib/format';
import TestPayButtons from './TestPayButtons';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Test payment', robots: { index: false } };

export default async function TestPay({ searchParams }) {
  const { order: id } = await searchParams;
  if (!hasServiceRole || !testPaymentsAllowed || !id) notFound();
  const { data: o } = await createAdminClient().from('orders').select('id, number, total, payment_method, status').eq('id', id).maybeSingle();
  if (!o) notFound();
  return (
    <div className="wrap"><div className="testpay card-box">
      <span className="pill-s warn" style={{ justifySelf: 'center' }}>Test mode · no real money</span>
      <h1 className="page-title" style={{ fontSize: 36 }}>{o.payment_method === 'opay' ? 'OPay' : 'Paystack'} test payment</h1>
      <p className="muted">Order {o.number}. Once real keys are added, customers see the {o.payment_method === 'opay' ? 'OPay' : 'Paystack'} payment page here instead.</p>
      <div className="amt">{naira(o.total)}</div>
      {o.status === 'awaiting_payment' ? <TestPayButtons orderId={o.id} /> : <p>This order is already {o.status.replace('_', ' ')}.</p>}
    </div></div>
  );
}
