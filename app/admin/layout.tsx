import { redirect } from 'next/navigation';
import { getCurrentAccount, checkIsAdmin } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Admin — EpochZero' };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const account = await getCurrentAccount();
  if (!account) redirect('/dashboard/login?next=/admin');

  const isAdmin = await checkIsAdmin(account.email);
  if (!isAdmin) redirect('/dashboard');

  // Load batches for sidebar dynamic list
  const db = createAdminClient();
  const { data: batches } = await db
    .from('batches')
    .select('id, enrollment_code, batch_label, is_active, courses(title, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
      <AdminSidebar
        email={account.email}
        name={account.display_name}
        role={account.role}
        batches={(batches ?? []) as any}
      />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
