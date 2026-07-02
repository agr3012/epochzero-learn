import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAccount, requireAdmin } from '@/lib/auth';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try { await requireAdmin(account.email); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const db = createAdminClient();
  const [{ data: batch }, { data: members }] = await Promise.all([
    db.from('batches').select('id, enrollment_code, batch_label, semester, year, is_active, created_at, courses(id, title, slug)').eq('id', params.id).single(),
    db.from('batch_enrollments')
      .select('enrolled_at, student_accounts(id, email, display_name, last_login_at)')
      .eq('batch_id', params.id)
      .order('enrolled_at', { ascending: true }),
  ]);

  if (!batch) return NextResponse.json({ error: 'Batch not found' }, { status: 404 });

  // Fetch points for all members
  const memberAccounts = (members ?? []).map((m) => (m.student_accounts as unknown as { id: string } | null)?.id).filter(Boolean) as string[];
  const { data: points } = memberAccounts.length > 0
    ? await db.from('points_ledger').select('account_id, points').in('account_id', memberAccounts)
    : { data: [] };

  const pointsMap: Record<string, number> = {};
  for (const row of points ?? []) {
    pointsMap[row.account_id] = (pointsMap[row.account_id] ?? 0) + row.points;
  }

  // Fetch video watch time
  const { data: videoProgress } = memberAccounts.length > 0
    ? await db.from('video_progress').select('account_id, watched_seconds, completed').in('account_id', memberAccounts)
    : { data: [] };

  const watchMap: Record<string, { seconds: number; completed: number }> = {};
  for (const row of videoProgress ?? []) {
    if (!watchMap[row.account_id]) watchMap[row.account_id] = { seconds: 0, completed: 0 };
    watchMap[row.account_id].seconds += row.watched_seconds;
    if (row.completed) watchMap[row.account_id].completed += 1;
  }

  const enrichedMembers = (members ?? []).map((m) => {
    const sa = m.student_accounts as unknown as { id: string; email: string; display_name: string | null; last_login_at: string | null } | null;
    return {
      enrolled_at: m.enrolled_at,
      id:          sa?.id ?? '',
      email:       sa?.email ?? '',
      display_name: sa?.display_name ?? null,
      last_login_at: sa?.last_login_at ?? null,
      total_points: pointsMap[sa?.id ?? ''] ?? 0,
      watched_seconds: watchMap[sa?.id ?? '']?.seconds ?? 0,
      videos_completed: watchMap[sa?.id ?? '']?.completed ?? 0,
    };
  });

  return NextResponse.json({ batch, members: enrichedMembers });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try { await requireAdmin(account.email); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = await req.json() as { is_active?: boolean };
  if (typeof body.is_active !== 'boolean') return NextResponse.json({ error: 'is_active required' }, { status: 400 });
  const db = createAdminClient();
  const { error } = await db.from('batches').update({ is_active: body.is_active }).eq('id', params.id);
  if (error) return NextResponse.json({ error: 'Server error' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
