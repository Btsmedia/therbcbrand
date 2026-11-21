import { isUuid } from '@/lib/rate-limit';
import { notFound } from 'next/navigation';
import StopReminders from '@/components/StopReminders';

export const metadata = { title: 'Bag reminders', robots: { index: false } };

// Opt-out page from the email footer. It asks for a click, so link scanners can't opt people out by accident.
export default async function StopPage({ params }) {
  const { token } = await params;
  if (!isUuid(token)) notFound();
  return <StopReminders token={token} />;
}
