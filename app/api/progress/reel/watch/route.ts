import { NextResponse } from 'next/server';
import { getCurrentAccount } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { awardPoints } from '@/lib/points';

export async function POST(req: Request) {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { reel_id } = body;
  if (!reel_id || typeof reel_id !== 'string') {
    return NextResponse.json({ error: 'missing reel_id' }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: reel } = await admin
    .from('reels')
    .select('id')
    .eq('id', reel_id)
    .eq('is_published', true)
    .maybeSingle();
  if (!reel) return NextResponse.json({ error: 'reel not found' }, { status: 404 });

  const { data: existing } = await admin
    .from('reel_progress')
    .select('completed')
    .eq('account_id', account.id)
    .eq('reel_id', reel_id)
    .maybeSingle();

  const alreadyWatched = existing?.completed ?? false;

  await admin
    .from('reel_progress')
    .upsert(
      {
        account_id: account.id,
        reel_id,
        watched_seconds: 20,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'account_id,reel_id' }
    );

  if (!alreadyWatched) await awardPoints(account.id, 'reel', reel_id);

  return NextResponse.json({ ok: true, alreadyWatched });
}
