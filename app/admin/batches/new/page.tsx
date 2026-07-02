import { createAdminClient } from '@/lib/supabase/admin';
import { CreateBatchForm } from './CreateBatchForm';

export default async function NewBatchPage() {
  const db = createAdminClient();
  const { data: courses } = await db.from('courses').select('id, title, slug').order('order_index');
  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-display font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Create Batch</h1>
      <p className="text-sm mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>
        A batch ties a course to an enrollment code. Share the code with students to auto-enroll them.
      </p>
      <CreateBatchForm courses={courses ?? []} />
    </div>
  );
}
