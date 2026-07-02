import { redirect } from 'next/navigation';
import { getCurrentAccount, checkIsAdmin } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Admin — EpochZero' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const account = await getCurrentAccount();
  if (!account) redirect('/dashboard/login?next=/admin');

  const isAdmin = await checkIsAdmin(account.email);
  if (!isAdmin) redirect('/dashboard');

  return (
    <div className="flex min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <AdminSidebar email={account.email} name={account.display_name} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
