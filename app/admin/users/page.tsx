import { createAdminClient } from '@/lib/supabase/admin';
import { StudentsClient } from './StudentsClient';

async function getData() {
  const db = createAdminClient();
  const [{ data: users }, { data: batches }] = await Promise.all([
    db.from('student_accounts')
      .select('id, email, display_name, role, is_active, last_login_at, created_at')
      .order('created_at', { ascending: false }),
    db.from('batches')
      .select('id, enrollment_code, batch_label, courses(id, title, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
  ]);

  // Fetch all enrollments to know which batch each student is in
  const { data: enrollments } = await db
    .from('batch_enrollments')
    .select('student_account_id, batch_id');

  return {
    users:       (users       ?? []),
    batches:     (batches     ?? []) as unknown as BatchOption[],
    enrollments: (enrollments ?? []),
  };
}

type BatchOption = {
  id: string; enrollment_code: string; batch_label: string;
  courses: { id: string; title: string; slug: string } | null;
};

export default async function StudentsPage() {
  const { users, batches, enrollments } = await getData();
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-display font-bold" style={{ color: 'hsl(var(--foreground))' }}>Students</h1>
        <a href="/admin/users/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'hsl(var(--primary))' }}>
          + Add Student
        </a>
      </div>
      <p className="text-sm mb-6" style={{ color: 'hsl(var(--foreground-muted))' }}>{users.length} total accounts</p>
      <StudentsClient users={users as any} batches={batches} enrollments={enrollments} />
    </div>
  );
}
