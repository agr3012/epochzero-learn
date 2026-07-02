import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAccount, requireAdmin, hashPassword, logAdminAction } from '@/lib/auth';

const patchSchema = z.object({
  display_name: z.string().trim().min(1).max(120).optional(),
  role:         z.enum(['student', 'admin', 'super_admin']).optional(),
  is_active:    z.boolean().optional(),
  password:     z.string().min(8).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try { await requireAdmin(account.email); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (parsed.data.display_name !== undefined) updates.display_name = parsed.data.display_name;
  if (parsed.data.role         !== undefined) updates.role         = parsed.data.role;
  if (parsed.data.is_active    !== undefined) updates.is_active    = parsed.data.is_active;
  if (parsed.data.password     !== undefined) updates.password_hash = await hashPassword(parsed.data.password);

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  const db = createAdminClient();
  const { data, error } = await db
    .from('student_accounts')
    .update(updates)
    .eq('id', params.id)
    .select('id, email, display_name, role, is_active, email_verified, last_login_at')
    .single();

  if (error || !data) return NextResponse.json({ error: 'User not found or server error' }, { status: 404 });
  await logAdminAction({ adminEmail: account.email, action: 'update_user', targetTable: 'student_accounts', targetId: params.id });
  return NextResponse.json({ user: data });
}
