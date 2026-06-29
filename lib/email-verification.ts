// lib/email-verification.ts
// Server-side only — link-based email verification, same shape as the
// password-reset flow (random token, bcrypt-hashed at rest, 24h expiry).
import { createAdminClient } from '@/lib/supabase/admin';
import { generateResetToken } from '@/lib/auth';
import { getResend, FROM_EMAIL } from '@/lib/resend';

const VERIFICATION_EXPIRY_HOURS = 24;
const RATE_LIMIT_PER_HOUR = 5;

type SendResult = { ok: true } | { ok: false; error: string; status: number };

export async function sendVerificationEmail(accountId: string, email: string): Promise<SendResult> {
  const admin = createAdminClient();

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('email_verification_tokens')
    .select('id', { count: 'exact', head: true })
    .eq('account_id', accountId)
    .gt('created_at', oneHourAgo);
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR)
    return { ok: false, error: 'Too many verification emails requested. Try again later.', status: 429 };

  const { raw, hash } = await generateResetToken();
  const expires_at = new Date(Date.now() + VERIFICATION_EXPIRY_HOURS * 3600 * 1000).toISOString();

  const { error: insertErr } = await admin
    .from('email_verification_tokens')
    .insert({ account_id: accountId, token_hash: hash, expires_at });
  if (insertErr) {
    console.error('verification token insert error:', insertErr);
    return { ok: false, error: 'Server error', status: 500 };
  }

  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/verify-email?token=${raw}&email=${encodeURIComponent(email)}`;

  const resend = getResend();
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'EpochZero Learn — Verify your email',
    html: verificationEmailHtml(verifyUrl),
  });

  return { ok: true };
}

function verificationEmailHtml(verifyUrl: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0A1628;font-family:'Helvetica Neue',Arial,sans-serif;color:#E8E4D9">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A1628">
    <tr><td align="center" style="padding:40px 20px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#11203B;border:1px solid #1A2D4D">
        <tr><td style="padding:32px;border-bottom:1px solid #1A2D4D">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;color:#FFC857;text-transform:uppercase">EpochZero Learn</div>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 16px;font-family:'Courier New',monospace;font-size:22px;color:#F5F1E6">Verify your email</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#D4CFC2">
            Click the button below to confirm your email address.
          </p>
          <a href="${verifyUrl}" style="display:inline-block;background:#FFC857;color:#0A1628;font-family:'Courier New',monospace;font-size:13px;font-weight:bold;padding:12px 28px;text-decoration:none;letter-spacing:1px;text-transform:uppercase">
            Verify email
          </a>
          <p style="margin:20px 0 0;font-size:12px;color:#A8A498;line-height:1.6">
            This link expires in ${VERIFICATION_EXPIRY_HOURS} hours. If you didn't create this account, ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #1A2D4D;background:#0A1628">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:10px;color:#A8A498;letter-spacing:1px">EPOCHZERO LEARN</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
