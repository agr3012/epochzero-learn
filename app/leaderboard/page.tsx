// app/leaderboard/page.tsx
import { Trophy, Video, BookOpen, GraduationCap, MessageSquare } from 'lucide-react';
import { getCurrentAccount } from '@/lib/auth';
import { getLeaderboard, getMyRank, maskEmail } from '@/lib/points';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Leaderboard' };

function displayLabel(row: { display_name: string | null; email: string }): string {
  return row.display_name?.trim() || maskEmail(row.email);
}

const RANK_COLOR = (rank: number) => (rank === 1 ? '#FFC857' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#B87333' : 'hsl(var(--foreground-subtle))');

export default async function LeaderboardPage() {
  const account = await getCurrentAccount();
  const [rows, myRank] = await Promise.all([
    getLeaderboard(100),
    account ? getMyRank(account.id) : Promise.resolve(null),
  ]);

  return (
    <div className="container py-10 lg:py-14 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="w-6 h-6" style={{ color: '#E8A020' }} />
        <h1 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Leaderboard</h1>
      </div>
      <p className="text-sm mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>
        Points: video watched +10 · article read +5 · exam passed +20 · forum reply +3.
      </p>

      {account && (
        <div className="card p-5 rounded-xl mb-8 flex items-center gap-5 flex-wrap"
          style={{ borderLeft: '3px solid #E8A020' }}>
          {myRank ? (
            <>
              <div className="text-center shrink-0">
                <div className="font-display text-2xl font-bold" style={{ color: '#E8A020' }}>#{myRank.rank}</div>
                <div className="text-[10px] uppercase tracking-wide" style={{ color: 'hsl(var(--foreground-subtle))' }}>Your rank</div>
              </div>
              <div className="flex-1 min-w-0 flex flex-wrap gap-4 text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>
                <span className="font-display text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  {myRank.total_points} pts
                </span>
                <span className="inline-flex items-center gap-1"><Video className="w-3.5 h-3.5" /> {myRank.video_points}</span>
                <span className="inline-flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {myRank.article_points}</span>
                <span className="inline-flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {myRank.exam_points}</span>
                <span className="inline-flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {myRank.forum_points}</span>
              </div>
            </>
          ) : (
            <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
              You haven't earned any points yet — watch a video, read an article, or pass a test to get on the board.
            </p>
          )}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="card p-10 text-center rounded-xl">
          <Trophy className="w-8 h-8 mx-auto mb-3" style={{ color: 'hsl(var(--foreground-subtle))' }} />
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>No points earned yet — be the first.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r) => (
            <div key={r.account_id} className="card p-3.5 rounded-xl flex items-center gap-4"
              style={{ borderLeft: r.rank <= 3 ? `3px solid ${RANK_COLOR(r.rank)}` : undefined }}>
              <div className="w-8 text-center font-display font-bold shrink-0" style={{ color: RANK_COLOR(r.rank) }}>
                {r.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-sans text-sm font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>
                  {displayLabel(r)}
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] mt-0.5" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                  <span className="inline-flex items-center gap-1"><Video className="w-3 h-3" /> {r.video_points}</span>
                  <span className="inline-flex items-center gap-1"><BookOpen className="w-3 h-3" /> {r.article_points}</span>
                  <span className="inline-flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {r.exam_points}</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {r.forum_points}</span>
                </div>
              </div>
              <div className="font-display text-lg font-bold shrink-0" style={{ color: 'hsl(var(--foreground))' }}>
                {r.total_points}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
