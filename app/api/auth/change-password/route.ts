// app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAccount, verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const account = await getCurrentAccount();
    if (!account)
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

    const { current_password, new_password } = await req.json();
    if (!current_password || !new_password)
      return NextResponse.json({ error: 'Both fields are required.' }, { status: 400 });
    if (new_password.length < 8)
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });

    const admin = createAdminClient();
    const { data: row } = await admin
      .from('student_accounts')
      .select('password_hash')
      .eq('id', account.id)
      .single();
    if (!row)
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

    const valid = await verifyPassword(current_password, row.password_hash);
    if (!valid)
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 });

    const password_hash = await hashPassword(new_password);
    const { error } = await admin
      .from('student_accounts')
      .update({ password_hash })
      .eq('id', account.id);
    if (error) {
      console.error('change-password error:', error);
      return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('change-password server error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
