// app/api/admin/batches/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAccount, requireAdmin, logAdminAction } from '@/lib/auth';

const createSchema = z.object({
  course_id: z.string().uuid(),
  enrollment_code: z.string().trim().min(3).max(64),
  batch_label: z.string().trim().min(1).max(120),
  semester: z.enum(['odd', 'even']),
  year: z.number().int().min(2000).max(2100),
});

export async function GET() {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try {
    await requireAdmin(account.email);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const [{ data: batches, error }, { data: courses }] = await Promise.all([
    admin
      .from('batches')
      .select('id, enrollment_code, batch_label, semester, year, is_active, created_at, courses(title)')
      .order('created_at', { ascending: false }),
    admin.from('courses').select('id, title, slug').order('order_index'),
  ]);
  if (error) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  return NextResponse.json({ batches: batches ?? [], courses: courses ?? [] });
}

export async function POST(req: NextRequest) {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try {
    await requireAdmin(account.email);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  const { course_id, enrollment_code, batch_label, semester, year } = parsed.data;

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from('batches')
    .select('id')
    .eq('enrollment_code', enrollment_code)
    .maybeSingle();
  if (existing)
    return NextResponse.json({ error: 'That enrollment code is already in use.' }, { status: 409 });

  const { data: batch, error } = await admin
    .from('batches')
    .insert({
      course_id,
      enrollment_code,
      batch_label,
      semester,
      year,
      created_by: account.email,
    })
    .select('id, enrollment_code, batch_label, semester, year, is_active, created_at, courses(title)')
    .single();
  if (error || !batch)
    return NextResponse.json({ error: 'Server error' }, { status: 500 });

  await logAdminAction({
    adminEmail: account.email,
    action: 'create_batch',
    targetTable: 'batches',
    targetId: batch.id,
    notes: enrollment_code,
  });

  return NextResponse.json({ batch });
}
