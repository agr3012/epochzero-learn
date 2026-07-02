import { createAdminClient } from '@/lib/supabase/admin';
import { BatchesClient } from './BatchesClient';

type Batch = {
  id: string; enrollment_code: string; batch_label: string;
  semester: string; year: number; is_active: boolean; created_at: string;
  courses: { title: string; slug: string } | null;
};

async function getData() {
  const db = createAdminClient();
  const [{ data: batches }, { data: courses }] = await Promise.all([
    db.from('batches').select('id, enrollment_code, batch_label, semester, year, is_active, created_at, courses(title, slug)').order('created_at', { ascending: false }),
    db.from('courses').select('id, title, slug').order('order_index'),
  ]);
  return { batches: (batches ?? []) as unknown as Batch[], courses: courses ?? [] };
}

export default async function BatchesPage() {
  const { batches, courses } = await getData();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-display font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Batches</h1>
      <p className="text-sm mb-6" style={{ color: 'hsl(var(--foreground-muted))' }}>Enrollment groups and access codes</p>
      <BatchesClient initialBatches={batches} courses={courses} />
    </div>
  );
}
