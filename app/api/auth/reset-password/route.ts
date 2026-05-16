// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashPassword, verifyResetToken, generateSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json();

    if (!token || !email || !password)
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

    const admin = createAdminClient();
    const normalised = email.trim().toLowerCase();

    const { data: account } = await admin
      .from('student_accounts')
      .select('id, email')
      .eq('email', normalised)
      .maybeSingle();

    if (!account)
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });

    // Find the most recent unused, unexpired token for this account
    const { data: tokenRows } = await admin
      .from('password_reset_tokens')
      .select('id, token_hash, expires_at')
      .eq('account_id', account.id)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (!tokenRows || tokenRows.length === 0)
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });

    // Check each token (in case of multiple)
    let matchedTokenId: string | null = null;
    for (const row of tokenRows) {
      const valid = await verifyResetToken(token, row.token_hash);
      if (valid) { matchedTokenId = row.id; break; }
    }

    if (!matchedTokenId)
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });

    // Mark token as used
    await admin
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', matchedTokenId);

    // Update password
    const password_hash = await hashPassword(password);
    await admin
      .from('student_accounts')
      .update({ password_hash })
      .eq('id', account.id);

    // Auto-login after successful reset
    const sessionToken = generateSessionToken(account.id, account.email);
    setSessionCookie(sessionToken);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
