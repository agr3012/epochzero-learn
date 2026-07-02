import { notFound } from 'next/navigation';
import { BatchDetailClient } from './BatchDetailClient';
import { createAdminClient } from '@/lib/supabase/admin';

type Batch = {
  id: string; enrollment_code: string; batch_label: string;
  semester: string; year: number; is_active: boolean; created_at: string;
  courses: { id: string; title: string; slug: string } | null;
};

export default async function BatchDetailPage({ params }: { params: { id: string } }) {
  const db = createAdminClient();

  const [{ data: batch }, { data: rawMembers }] = await Promise.all([
    db.from('batches').select('id, enrollment_code, batch_label, semester, year, is_active, created_at, courses(id, title, slug)').eq('id', params.id).single(),
    db.from('batch_enrollments').select('enrolled_at, student_account_id, student_accounts(id, email, display_name, last_login_at)').eq('batch_id', params.id).order('enrolled_at', { ascending: true }),
  ]);

  if (!batch) notFound();

  const memberIds = (rawMembers ?? []).map(m => m.student_account_id).filter(Boolean) as string[];

  const [{ data: points }, { data: videoProgress }] = await Promise.all([
    memberIds.length > 0
      ? db.from('points_ledger').select('account_id, points').in('account_id', memberIds)
      : Promise.resolve({ data: [] }),
    memberIds.length > 0
      ? db.from('video_progress').select('account_id, watched_seconds, completed').in('account_id', memberIds)
      : Promise.resolve({ data: [] }),
  ]);

  const pointsMap: Record<string, number> = {};
  for (const r of points ?? []) pointsMap[r.account_id] = (pointsMap[r.account_id] ?? 0) + r.points;

  const watchMap: Record<string, { seconds: number; completed: number }> = {};
  for (const r of videoProgress ?? []) {
    if (!watchMap[r.account_id]) watchMap[r.account_id] = { seconds: 0, completed: 0 };
    watchMap[r.account_id].seconds += r.watched_seconds;
    if (r.completed) watchMap[r.account_id].completed += 1;
  }

  const members = (rawMembers ?? []).map(m => {
    const sa = m.student_accounts as unknown as { id: string; email: string; display_name: string | null; last_login_at: string | null } | null;
    return {
      id:              sa?.id ?? '',
      email:           sa?.email ?? '',
      display_name:    sa?.display_name ?? null,
      last_login_at:   sa?.last_login_at ?? null,
      enrolled_at:     m.enrolled_at,
      total_points:    pointsMap[sa?.id ?? ''] ?? 0,
      watched_seconds: watchMap[sa?.id ?? '']?.seconds ?? 0,
      videos_completed: watchMap[sa?.id ?? '']?.completed ?? 0,
    };
  });

  return (
    <div className="p-8 max-w-5xl">
      <BatchDetailClient batch={batch as unknown as Batch} members={members} />
    </div>
  );
}
