import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAccount, hashPassword } from '@/lib/auth';

const schema = z.object({
  display_name:     z.string().trim().min(1).max(120).optional(),
  current_password: z.string().optional(),
  new_password:     z.string().min(8).optional(),
}).refine(d => !(d.new_password && !d.current_password), {
  message: 'current_password required when changing password',
  path: ['current_password'],
});

export async function PATCH(req: NextRequest) {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });

  const db = createAdminClient();
  const updates: Record<string, unknown> = {};

  if (parsed.data.display_name !== undefined) updates.display_name = parsed.data.display_name;

  if (parsed.data.new_password) {
    // Verify current password
    const { data: row } = await db.from('student_accounts').select('password_hash').eq('id', account.id).single();
    if (!row) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    const bcrypt = await import('bcryptjs');
    const ok = await bcrypt.compare(parsed.data.current_password ?? '', row.password_hash);
    if (!ok) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    updates.password_hash = await hashPassword(parsed.data.new_password);
  }

  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  const { data, error } = await db
    .from('student_accounts')
    .update(updates)
    .eq('id', account.id)
    .select('id, email, display_name, role')
    .single();

  if (error || !data) return NextResponse.json({ error: 'Server error' }, { status: 500 });
  return NextResponse.json({ user: data });
}
