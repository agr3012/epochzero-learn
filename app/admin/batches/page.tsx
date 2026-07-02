import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Plus, ChevronRight, Circle } from 'lucide-react';

type Batch = {
  id: string; enrollment_code: string; batch_label: string;
  semester: string; year: number; is_active: boolean; created_at: string;
  courses: { id: string; title: string; slug: string } | null;
  member_count?: number;
};

async function getData() {
  const db = createAdminClient();
  const [{ data: batches }, { data: counts }] = await Promise.all([
    db.from('batches')
      .select('id, enrollment_code, batch_label, semester, year, is_active, created_at, courses(id, title, slug)')
      .order('created_at', { ascending: false }),
    db.from('batch_enrollments').select('batch_id'),
  ]);

  const countMap: Record<string, number> = {};
  for (const e of counts ?? []) countMap[e.batch_id] = (countMap[e.batch_id] ?? 0) + 1;

  const enriched = ((batches ?? []) as unknown as Batch[]).map(b => ({ ...b, member_count: countMap[b.id] ?? 0 }));

  // Group by course
  const byCourse: Record<string, { course: { id: string; title: string; slug: string }; batches: Batch[] }> = {};
  for (const b of enriched) {
    const key = b.courses?.id ?? 'uncategorised';
    if (!byCourse[key]) byCourse[key] = { course: b.courses ?? { id: 'uncategorised', title: 'Uncategorised', slug: '' }, batches: [] };
    byCourse[key].batches.push(b);
  }
  return Object.values(byCourse);
}

export default async function BatchesPage() {
  const groups = await getData();
  const total  = groups.reduce((s, g) => s + g.batches.length, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-display font-bold" style={{ color: 'hsl(var(--foreground))' }}>Batches</h1>
        <Link href="/admin/batches/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'hsl(var(--primary))' }}>
          <Plus className="w-4 h-4" /> Create Batch
        </Link>
      </div>
      <p className="text-sm mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>{total} batch{total !== 1 ? 'es' : ''} across {groups.length} course{groups.length !== 1 ? 's' : ''}</p>

      {groups.length === 0 && (
        <div className="rounded-xl border p-12 text-center" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
          <p className="text-sm mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>No batches yet</p>
          <Link href="/admin/batches/new" className="text-sm font-semibold" style={{ color: 'hsl(var(--primary))' }}>
            + Create your first batch
          </Link>
        </div>
      )}

      <div className="space-y-8">
        {groups.map(({ course, batches }) => (
          <div key={course.id}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{course.title}</h2>
              <div className="h-px flex-1" style={{ background: 'hsl(var(--border))' }} />
              <span className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>{batches.length} batch{batches.length !== 1 ? 'es' : ''}</span>
            </div>

            <div className="rounded-xl border overflow-hidden" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
              {/* header row */}
              <div className="grid text-xs font-semibold px-5 py-3 border-b"
                style={{ gridTemplateColumns: '1fr 200px 80px 100px 32px', color: 'hsl(var(--foreground-muted))', borderColor: 'hsl(var(--border))' }}>
                <span>Batch</span><span>Code</span><span>Students</span><span>Status</span><span />
              </div>
              {batches.map(b => (
                <Link key={b.id} href={`/admin/batches/${b.id}`}
                  className="grid items-center px-5 py-3 border-b transition-colors hover:bg-white/5"
                  style={{ gridTemplateColumns: '1fr 200px 80px 100px 32px', borderColor: 'hsl(var(--border))' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{b.batch_label}</p>
                    <p className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>{b.semester} · {b.year}</p>
                  </div>
                  <span className="font-mono text-xs px-2 py-1 rounded w-fit"
                    style={{ background: 'hsl(var(--primary)/0.1)', color: 'hsl(var(--primary))' }}>
                    {b.enrollment_code}
                  </span>
                  <span className="text-sm font-mono" style={{ color: 'hsl(var(--foreground))' }}>
                    {b.member_count ?? 0}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: b.is_active ? '#10b981' : '#ef4444' }}>
                    <Circle className="w-2 h-2 fill-current" />
                    {b.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <ChevronRight className="w-4 h-4 justify-self-end" style={{ color: 'hsl(var(--foreground-subtle))' }} />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
