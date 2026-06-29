// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateResetToken, resetTokenExpiresAt } from '@/lib/auth';
import { getResend, FROM_EMAIL } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return NextResponse.json({ success: true }); // silent — don't reveal if email exists

    const admin = createAdminClient();
    const normalised = email.trim().toLowerCase();

    const { data: account } = await admin
      .from('student_accounts')
      .select('id, email')
      .eq('email', normalised)
      .maybeSingle();

    if (!account) return NextResponse.json({ success: true }); // silent

    // Invalidate any existing unused tokens
    await admin
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('account_id', account.id)
      .is('used_at', null);

    const { raw, hash } = await generateResetToken();

    await admin.from('password_reset_tokens').insert({
      account_id: account.id,
      token_hash: hash,
      expires_at: resetTokenExpiresAt().toISOString(),
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://learn.epochzero.net';
    const resetUrl = `${siteUrl}/dashboard/reset-password?token=${raw}&email=${encodeURIComponent(normalised)}`;

    const resend = getResend();
    const { error: sendErr } = await resend.emails.send({
      from: FROM_EMAIL,
      to: normalised,
      subject: 'Reset your EpochZero Learn password',
      html: resetEmailHtml(resetUrl),
    });
    if (sendErr) console.error('forgot-password resend error:', sendErr);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // always silent on error
  }
}

function resetEmailHtml(resetUrl: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0A1628;font-family:'Helvetica Neue',Arial,sans-serif;color:#E8E4D9">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#11203B;border:1px solid #1A2D4D">
        <tr><td style="padding:28px 32px;border-bottom:1px solid #1A2D4D">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;color:#FFC857;text-transform:uppercase">EpochZero Learn</div>
        </td></tr>
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 12px;font-family:Georgia,serif;font-size:22px;color:#F5F1E6">Password reset request</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#D4CFC2">
            Click the button below to set a new password. This link expires in 2 hours.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#FFC857;color:#0A1628;font-family:'Courier New',monospace;font-size:13px;font-weight:bold;padding:12px 28px;text-decoration:none;letter-spacing:1px;text-transform:uppercase">
            Reset Password
          </a>
          <p style="margin:20px 0 0;font-size:12px;color:#A8A498;line-height:1.6">
            If you did not request this, ignore this email. Your password will not change.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #1A2D4D;background:#0A1628">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#A8A498;letter-spacing:1px">
            EPOCHZERO LEARN · learn.epochzero.net
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
