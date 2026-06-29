// lib/progress.ts
// Server-side only — Phase 2 progress engine: video watch-time, article
// reads, and the topic/unit completion they derive, used to gate module
// exams (see app/api/tests/start/route.ts).
import { createAdminClient } from '@/lib/supabase/admin';

const HEARTBEAT_MAX_DELTA_SECONDS = 15; // defense: clamp implausible deltas from a single heartbeat

export type VideoProgressRow = {
  watched_seconds: number;
  last_position_seconds: number;
  completed: boolean;
};

export async function getVideoProgress(
  accountId: string,
  videoIds: string[]
): Promise<Record<string, VideoProgressRow>> {
  if (videoIds.length === 0) return {};
  const admin = createAdminClient();
  const { data } = await admin
    .from('video_progress')
    .select('video_id, watched_seconds, last_position_seconds, completed')
    .eq('account_id', accountId)
    .in('video_id', videoIds);

  const map: Record<string, VideoProgressRow> = {};
  for (const row of data ?? []) {
    map[row.video_id] = {
      watched_seconds: row.watched_seconds,
      last_position_seconds: row.last_position_seconds,
      completed: row.completed,
    };
  }
  return map;
}

export async function getArticleReadSet(accountId: string, articleIds: string[]): Promise<Set<string>> {
  if (articleIds.length === 0) return new Set();
  const admin = createAdminClient();
  const { data } = await admin
    .from('article_progress')
    .select('article_id')
    .eq('account_id', accountId)
    .in('article_id', articleIds);
  return new Set((data ?? []).map((r) => r.article_id as string));
}

export async function markArticleRead(accountId: string, articleId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from('article_progress')
    .upsert(
      { account_id: accountId, article_id: articleId },
      { onConflict: 'account_id,article_id', ignoreDuplicates: true }
    );
}

/**
 * Records a heartbeat from the YouTube IFrame API while the player is in
 * the "playing" state. deltaSeconds is the real time elapsed since the last
 * heartbeat (clamped). Seeking/fast-forwarding doesn't add extra credit —
 * the clock only advances while actually playing.
 */
export async function recordVideoHeartbeat(
  accountId: string,
  videoId: string,
  deltaSeconds: number,
  positionSeconds: number
): Promise<VideoProgressRow | null> {
  const admin = createAdminClient();

  const { data: video } = await admin
    .from('videos')
    .select('duration_seconds')
    .eq('id', videoId)
    .maybeSingle();
  if (!video) return null;
  const duration = video.duration_seconds ?? null;

  const clampedDelta = Math.max(0, Math.min(deltaSeconds, HEARTBEAT_MAX_DELTA_SECONDS));

  const { data: existing } = await admin
    .from('video_progress')
    .select('watched_seconds')
    .eq('account_id', accountId)
    .eq('video_id', videoId)
    .maybeSingle();

  const nextWatched = (existing?.watched_seconds ?? 0) + clampedDelta;
  const watched_seconds = duration ? Math.min(nextWatched, duration) : nextWatched;
  const completed = duration ? watched_seconds >= duration : false;
  const last_position_seconds = Math.max(0, Math.floor(positionSeconds));

  await admin
    .from('video_progress')
    .upsert(
      {
        account_id: accountId,
        video_id: videoId,
        watched_seconds,
        last_position_seconds,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'account_id,video_id' }
    );

  return { watched_seconds, last_position_seconds, completed };
}

export async function isTopicComplete(accountId: string, topicId: string): Promise<boolean> {
  const admin = createAdminClient();
  const [{ data: topicVideos }, { data: topicArticles }] = await Promise.all([
    admin.from('topic_videos').select('video_id').eq('topic_id', topicId),
    admin.from('topic_articles').select('article_id').eq('topic_id', topicId),
  ]);
  const videoIds = (topicVideos ?? []).map((r) => r.video_id as string);
  const articleIds = (topicArticles ?? []).map((r) => r.article_id as string);
  if (videoIds.length === 0 && articleIds.length === 0) return true;

  const [videoProgress, readSet] = await Promise.all([
    getVideoProgress(accountId, videoIds),
    getArticleReadSet(accountId, articleIds),
  ]);

  const allVideosWatched = videoIds.every((id) => videoProgress[id]?.completed);
  const allArticlesRead = articleIds.every((id) => readSet.has(id));
  return allVideosWatched && allArticlesRead;
}

export async function isUnitComplete(accountId: string, unitId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: topics } = await admin
    .from('topics')
    .select('id')
    .eq('unit_id', unitId)
    .eq('is_published', true);
  const topicIds = (topics ?? []).map((t) => t.id as string);
  if (topicIds.length === 0) return true;

  const results = await Promise.all(topicIds.map((id) => isTopicComplete(accountId, id)));
  return results.every(Boolean);
}

export type ExamLockStatus =
  | { locked: false }
  | { locked: true; unitTitle: string; reason: string };

/**
 * A test only gates on unit completion if it's linked to a topic (a
 * "module exam" inside the /learn hierarchy). Standalone tests on the
 * generic /tests page are never locked by this check.
 */
export async function getExamLockStatus(accountId: string, testId: string): Promise<ExamLockStatus> {
  const admin = createAdminClient();

  const { data: topicTestRow } = await admin
    .from('topic_tests')
    .select('topic_id')
    .eq('test_id', testId)
    .maybeSingle();
  if (!topicTestRow?.topic_id) return { locked: false };

  const { data: topicRow } = await admin
    .from('topics')
    .select('unit_id')
    .eq('id', topicTestRow.topic_id)
    .maybeSingle();
  if (!topicRow?.unit_id) return { locked: false };

  const { data: unitRow } = await admin
    .from('units')
    .select('id, title')
    .eq('id', topicRow.unit_id)
    .maybeSingle();
  if (!unitRow) return { locked: false };

  const complete = await isUnitComplete(accountId, unitRow.id);
  if (complete) return { locked: false };

  return {
    locked: true,
    unitTitle: unitRow.title,
    reason: 'Finish every topic in this unit — all videos watched, all articles read — to unlock its exam.',
  };
}
