import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAccount, requireAdmin, logAdminAction } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try { await requireAdmin(account.email); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const body = z.object({ batch_id: z.string().uuid() }).safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: 'Invalid batch_id' }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from('batch_enrollments').upsert(
    { batch_id: body.data.batch_id, student_account_id: params.id },
    { onConflict: 'batch_id,student_account_id' }
  );
  if (error) return NextResponse.json({ error: 'Server error' }, { status: 500 });
  await logAdminAction({ adminEmail: account.email, action: 'assign_batch', targetTable: 'batch_enrollments', targetId: params.id, notes: body.data.batch_id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try { await requireAdmin(account.email); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get('batch_id');
  if (!batchId) return NextResponse.json({ error: 'batch_id required' }, { status: 400 });

  const db = createAdminClient();
  await db.from('batch_enrollments').delete().eq('student_account_id', params.id).eq('batch_id', batchId);
  await logAdminAction({ adminEmail: account.email, action: 'remove_batch', targetTable: 'batch_enrollments', targetId: params.id, notes: batchId });
  return NextResponse.json({ ok: true });
}
