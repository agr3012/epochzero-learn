import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAccount, requireAdmin, hashPassword, logAdminAction } from '@/lib/auth';

const createSchema = z.object({
  email:        z.string().email(),
  display_name: z.string().trim().min(1).max(120),
  password:     z.string().min(8),
  role:         z.enum(['student', 'admin', 'super_admin']).default('student'),
});

export async function GET() {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try { await requireAdmin(account.email); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const db = createAdminClient();
  const { data, error } = await db
    .from('student_accounts')
    .select('id, email, display_name, role, is_active, email_verified, last_login_at, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Server error' }, { status: 500 });
  return NextResponse.json({ users: data ?? [] });
}

export async function POST(req: NextRequest) {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try { await requireAdmin(account.email); } catch { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  const { email, display_name, password, role } = parsed.data;

  const db = createAdminClient();
  const { data: existing } = await db.from('student_accounts').select('id').eq('email', email).maybeSingle();
  if (existing) return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });

  const password_hash = await hashPassword(password);
  const { data: user, error } = await db
    .from('student_accounts')
    .insert({ email, display_name, password_hash, role, is_active: true, email_verified: true })
    .select('id, email, display_name, role, is_active')
    .single();

  if (error || !user) return NextResponse.json({ error: 'Server error' }, { status: 500 });
  await logAdminAction({ adminEmail: account.email, action: 'create_user', targetTable: 'student_accounts', targetId: user.id });
  return NextResponse.json({ user }, { status: 201 });
}
