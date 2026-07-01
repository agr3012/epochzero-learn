import { createClient } from '@/lib/supabase/server';
import { getCurrentAccount } from '@/lib/auth';
import { getVideoProgress } from '@/lib/progress';
import { VideoModalClient } from './VideoModalClient';

export const dynamic = 'force-dynamic';

export default async function VideoModalPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();

  const { data: video } = await supabase
    .from('videos')
    .select('id, youtube_id, title, duration_seconds')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!video) return null;

  const account = await getCurrentAccount();
  let progress = null;
  if (account) {
    const progressMap = await getVideoProgress(account.id, [video.id]);
    const row = progressMap[video.id];
    if (row) {
      progress = {
        watched_seconds: row.watched_seconds,
        last_position_seconds: row.last_position_seconds,
        completed: row.completed,
      };
    }
  }

  return <VideoModalClient video={video} progress={progress} />;
}
