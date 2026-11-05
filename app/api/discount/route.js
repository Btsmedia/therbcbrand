import { NextResponse } from 'next/server';
import { lookupCode } from '@/lib/discounts';
import { limited } from '@/lib/rate-limit';

export async function POST(req) {
  // stops scripts from guessing codes
  if (limited(req, 'discount', 10, 10 * 60 * 1000)) return NextResponse.json({ error: 'Too many tries. Please wait a few minutes.' }, { status: 429 });
  const { code } = await req.json().catch(() => ({}));
  const d = await lookupCode(String(code || '').slice(0, 40));
  if (!d) return NextResponse.json({ error: "That code isn't valid. Check the spelling and try again." }, { status: 404 });
  return NextResponse.json(d);
}
