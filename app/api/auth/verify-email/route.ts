// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyResetToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, email } = await req.json();
    if (!token || !email)
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

    const admin = createAdminClient();
    const normalised = email.trim().toLowerCase();

    const { data: account } = await admin
      .from('student_accounts')
      .select('id, email_verified')
      .eq('email', normalised)
      .maybeSingle();
    if (!account)
      return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });

    if (account.email_verified)
      return NextResponse.json({ success: true, already_verified: true });

    const { data: tokenRows } = await admin
      .from('email_verification_tokens')
      .select('id, token_hash, expires_at')
      .eq('account_id', account.id)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (!tokenRows || tokenRows.length === 0)
      return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });

    let matchedTokenId: string | null = null;
    for (const row of tokenRows) {
      const valid = await verifyResetToken(token, row.token_hash);
      if (valid) { matchedTokenId = row.id; break; }
    }
    if (!matchedTokenId)
      return NextResponse.json({ error: 'Invalid or expired verification link.' }, { status: 400 });

    await admin
      .from('email_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', matchedTokenId);

    await admin
      .from('student_accounts')
      .update({ email_verified: true })
      .eq('id', account.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('verify-email error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
