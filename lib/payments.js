import 'server-only';
import crypto from 'node:crypto';
import { siteUrl } from './config';

// ---------- Paystack ----------
// Docs: https://paystack.com/docs/api/transaction/
export async function paystackInit({ order }) {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: order.email,
      amount: order.total * 100, // kobo
      currency: 'NGN',
      reference: order.payment_reference,
      callback_url: `${siteUrl}/order/${order.id}?verify=paystack`,
      metadata: { order_id: order.id, order_number: order.number },
    }),
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message || 'Paystack could not start the payment');
  return json.data.authorization_url;
}

export async function paystackVerify(reference) {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }, cache: 'no-store' });
  const json = await res.json();
  return { ok: !!json.status && json.data?.status === 'success' && json.data?.reference === reference, amountKobo: json.data?.amount ?? null, currency: json.data?.currency };
}

export function paystackSignatureValid(rawBody, signature) {
  if (typeof signature !== 'string' || !/^[0-9a-f]{128}$/i.test(signature)) return false;
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest();
  return crypto.timingSafeEqual(hash, Buffer.from(signature, 'hex'));
}

// ---------- OPay Cashier ----------
// Check these against OPay's current merchant docs before going live.
const opayBase = () => (process.env.OPAY_ENV === 'live' ? 'https://liveapi.opaycheckout.com' : 'https://testapi.opaycheckout.com');

export async function opayInit({ order }) {
  const res = await fetch(`${opayBase()}/api/v1/international/cashier/create`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPAY_PUBLIC_KEY}`, MerchantId: process.env.OPAY_MERCHANT_ID, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      country: 'NG',
      reference: order.payment_reference,
      amount: { total: order.total * 100, currency: 'NGN' },
      returnUrl: `${siteUrl}/order/${order.id}?verify=opay`,
      callbackUrl: `${siteUrl}/api/opay/webhook`,
      cancelUrl: `${siteUrl}/checkout?cancelled=1`,
      expireAt: 30,
      product: { name: `RBC order ${order.number}`, description: `${order.item_count} item(s)` },
      userInfo: { userEmail: order.email, userMobile: order.phone, userName: `${order.first_name} ${order.last_name}` },
    }),
  });
  const json = await res.json();
  if (json.code !== '00000' || !json.data?.cashierUrl) throw new Error(json.message || 'OPay could not start the payment');
  return json.data.cashierUrl;
}

export async function opayStatus(reference) {
  const body = JSON.stringify({ country: 'NG', reference });
  const sig = crypto.createHmac('sha512', process.env.OPAY_SECRET_KEY).update(body).digest('hex');
  const res = await fetch(`${opayBase()}/api/v1/international/cashier/status`, {
    method: 'POST', cache: 'no-store',
    headers: { Authorization: `Bearer ${sig}`, MerchantId: process.env.OPAY_MERCHANT_ID, 'Content-Type': 'application/json' },
    body,
  });
  const json = await res.json();
  return { ok: json.code === '00000' && json.data?.status === 'SUCCESS', amountKobo: json.data?.amount?.total ?? null };
}
