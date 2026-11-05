import { NextResponse } from 'next/server';
import { hasSupabase, hasServiceRole } from '@/lib/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { limited } from '@/lib/rate-limit';

// A customer's picture for a personalised product. Uploaded through the server so the bucket
// stays closed to the public; the client sends a downsized JPEG. Returns the public URL.
export const runtime = 'nodejs';
const MAX = 6 * 1024 * 1024;

export async function POST(req) {
  if (!hasSupabase || !hasServiceRole) return NextResponse.json({ error: 'Uploads aren’t available right now.' }, { status: 503 });
  if (limited(req, 'custom-upload', 30, 10 * 60 * 1000)) return NextResponse.json({ error: 'Too many uploads. Please wait a few minutes.' }, { status: 429 });

  let file;
  try { const form = await req.formData(); file = form.get('file'); } catch { return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 400 }); }
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'Choose a picture to upload.' }, { status: 400 });
  if (file.type !== 'image/jpeg') return NextResponse.json({ error: 'Please upload a JPG or PNG image.' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: 'That picture is too large. Keep it under 6MB.' }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length < 100 || buf[0] !== 0xff || buf[1] !== 0xd8) return NextResponse.json({ error: 'That file isn’t a valid image.' }, { status: 400 });

  const path = `${crypto.randomUUID()}.jpg`;
  const db = createAdminClient();
  const { error } = await db.storage.from('custom-uploads').upload(path, buf, { contentType: 'image/jpeg', cacheControl: '31536000' });
  if (error) return NextResponse.json({ error: 'Couldn’t save the picture. Please try again.' }, { status: 500 });
  const url = db.storage.from('custom-uploads').getPublicUrl(path).data.publicUrl;
  return NextResponse.json({ url });
}
