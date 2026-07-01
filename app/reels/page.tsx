import { createClient } from '@/lib/supabase/server';
import { getCurrentAccount } from '@/lib/auth';
import { getReelWatchedSet } from '@/lib/progress';
import { ReelsClient } from './ReelsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Quick Bites' };

interface Props { searchParams: { domain?: string } }

export default async function ReelsPage({ searchParams }: Props) {
  const supabase = createClient();
  const { data: reels } = await supabase
    .from('reels')
    .select('id, youtube_id, title, description, domain, topic_slug, duration_seconds')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  const account = await getCurrentAccount();
  const ids = (reels ?? []).map(r => r.id as string);
  const watchedSet = account ? await getReelWatchedSet(account.id, ids) : new Set<string>();

  return (
    <ReelsClient
      reels={reels ?? []}
      watchedIds={watchedSet}
      initialDomain={searchParams.domain ?? 'all'}
    />
  );
}
