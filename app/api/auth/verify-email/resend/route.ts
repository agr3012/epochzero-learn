// app/api/auth/verify-email/resend/route.ts
import { NextResponse } from 'next/server';
import { getCurrentAccount } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email-verification';

export async function POST() {
  try {
    const account = await getCurrentAccount();
    if (!account)
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    if (account.email_verified)
      return NextResponse.json({ success: true, already_verified: true });

    const result = await sendVerificationEmail(account.id, account.email);
    if (!result.ok)
      return NextResponse.json({ error: result.error }, { status: result.status });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('verify-email resend error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
