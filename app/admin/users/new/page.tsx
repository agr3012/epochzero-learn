import { AddStudentForm } from './AddStudentForm';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function AddStudentPage() {
  const db = createAdminClient();
  const { data: batches } = await db
    .from('batches')
    .select('id, enrollment_code, batch_label, courses(title)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-display font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Add Student</h1>
      <p className="text-sm mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>Create an account and optionally enroll into a batch</p>
      <AddStudentForm batches={(batches ?? []) as any} />
    </div>
  );
}
