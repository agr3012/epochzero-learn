import { createAdminClient } from '@/lib/supabase/admin';
import { notFound } from 'next/navigation';
import { UserDetailClient } from './UserDetailClient';

type Enrollment = {
  batch_id: string; enrolled_at: string;
  batches: { id: string; enrollment_code: string; batch_label: string; semester: string; year: number; courses: { title: string; slug: string } | null } | null;
};
type Batch = { id: string; enrollment_code: string; batch_label: string; semester: string; year: number; courses: { title: string; slug: string } | null };
type VideoRow = { watched_seconds: number; completed: boolean; videos: { title: string; courses: { title: string } | null } | null };

async function getData(id: string) {
  const db = createAdminClient();
  const [{ data: user }, { data: enrollments }, { data: batches }, { data: videoProgress }, { data: points }] = await Promise.all([
    db.from('student_accounts').select('id, email, display_name, role, is_active, email_verified, last_login_at, created_at').eq('id', id).single(),
    db.from('batch_enrollments').select('batch_id, enrolled_at, batches(id, enrollment_code, batch_label, semester, year, courses(title, slug))').eq('student_account_id', id),
    db.from('batches').select('id, enrollment_code, batch_label, semester, year, courses(title, slug)').eq('is_active', true),
    db.from('video_progress').select('watched_seconds, completed, videos(title, courses(title))').eq('account_id', id),
    db.from('points_ledger').select('points, reason, created_at').eq('account_id', id).order('created_at', { ascending: false }).limit(20),
  ]);
  return {
    user,
    enrollments: (enrollments ?? []) as unknown as Enrollment[],
    batches:     (batches     ?? []) as unknown as Batch[],
    videoProgress: (videoProgress ?? []) as unknown as VideoRow[],
    points: points ?? [],
  };
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const { user, enrollments, batches, videoProgress, points } = await getData(params.id);
  if (!user) notFound();
  return (
    <div className="p-8 max-w-4xl">
      <UserDetailClient user={user} enrollments={enrollments} allBatches={batches} videoProgress={videoProgress} pointsLedger={points} />
    </div>
  );
}
