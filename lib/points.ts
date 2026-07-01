// lib/points.ts
// Server-side only — Phase 4 leaderboard. See supabase/migrations/010_points_leaderboard.sql
// for why awarding is idempotent (ON CONFLICT DO NOTHING on account_id+reason+ref_id).
import { createAdminClient } from '@/lib/supabase/admin';

export type PointReason = 'video' | 'article' | 'exam' | 'forum' | 'reel';

export const POINT_VALUES: Record<PointReason, number> = {
  video: 10,
  article: 5,
  exam: 20,
  forum: 3,
  reel: 5,
};

/** Returns true only if this call actually awarded new points (i.e. this
 *  exact account+reason+ref_id hadn't already been credited). Safe to call
 *  on every heartbeat/read/pass/post — duplicates are silently no-ops. */
export async function awardPoints(accountId: string, reason: PointReason, refId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('points_ledger')
    .upsert(
      { account_id: accountId, reason, ref_id: refId, points: POINT_VALUES[reason] },
      { onConflict: 'account_id,reason,ref_id', ignoreDuplicates: true }
    )
    .select('id');
  if (error) {
    console.error('award points error:', error);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export type LeaderboardRow = {
  account_id: string;
  display_name: string | null;
  email: string;
  total_points: number;
  video_points: number;
  article_points: number;
  exam_points: number;
  forum_points: number;
  rank: number;
};

export async function getLeaderboard(limitN = 100): Promise<LeaderboardRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('get_leaderboard', { limit_n: limitN });
  if (error) {
    console.error('get_leaderboard error:', error);
    return [];
  }
  return (data ?? []) as LeaderboardRow[];
}

/** A student's own rank/breakdown, even if they're outside the top N shown
 *  on the public page. Scale here is small enough that pulling a large
 *  slice and finding the row is simpler than a second SQL function. */
export async function getMyRank(accountId: string): Promise<LeaderboardRow | null> {
  const rows = await getLeaderboard(10000);
  return rows.find((r) => r.account_id === accountId) ?? null;
}

/** For public-facing display where a student hasn't set a display name —
 *  shows enough to recognise yourself without exposing a classmate's full
 *  email address. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${local.slice(0, 2)}***@${domain}`;
}
