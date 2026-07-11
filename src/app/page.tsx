import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import GuestSite from '@/components/wedding/GuestSite';

export default async function Page() {
  const session = await getServerSession();

  if (session?.user) {
    const role = session.user.role;

    if (role === 'SUPER_ADMIN' || role === 'ACCOUNT_MANAGER') {
      redirect('/admin');
    }

    if (role === 'COUPLE') {
      redirect('/workspace');
    }
  }

  return <GuestSite showEditorButton />;
}