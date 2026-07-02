import { createAdminClient } from '@/lib/supabase/admin';
import { UsersClient } from './UsersClient';

async function getUsers() {
  const db = createAdminClient();
  const { data } = await db
    .from('student_accounts')
    .select('id, email, display_name, role, is_active, email_verified, last_login_at, created_at')
    .order('created_at', { ascending: false });
  return data ?? [];
}

export default async function AdminUsersPage() {
  const users = await getUsers();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-display font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Users</h1>
      <p className="text-sm mb-6" style={{ color: 'hsl(var(--foreground-muted))' }}>Manage student and admin accounts</p>
      <UsersClient initialUsers={users} />
    </div>
  );
}
