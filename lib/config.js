export const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')).replace(/\/$/, '');
export const paystackLive = Boolean(process.env.PAYSTACK_SECRET_KEY);
export const opayLive = Boolean(process.env.OPAY_MERCHANT_ID && process.env.OPAY_PUBLIC_KEY && process.env.OPAY_SECRET_KEY);
export const testPaymentsAllowed = process.env.ALLOW_TEST_PAYMENTS !== 'false';
