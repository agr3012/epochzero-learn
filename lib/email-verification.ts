// lib/email-verification.ts
// Shared by /api/auth/register and /api/auth/verify-email/resend.
import { createAdminClient } from '@/lib/supabase/admin';
import { getResend, FROM_EMAIL } from '@/lib/resend';
import { generateOTP, hashOTP } from '@/lib/utils';

export const VERIFICATION_OTP_EXPIRY_MINUTES = 10;
const RATE_LIMIT_PER_HOUR = 5;

type SendResult = { ok: true } | { ok: false; error: string; status: number };

export async function sendVerificationOtp(email: string): Promise<SendResult> {
  const admin = createAdminClient();
  const normalised = email.trim().toLowerCase();

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('email_otps')
    .select('id', { count: 'exact', head: true })
    .eq('email', normalised)
    .eq('purpose', 'account_verification')
    .gt('created_at', oneHourAgo);
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return { ok: false, error: 'Too many verification emails requested. Try again later.', status: 429 };
  }

  const otp = generateOTP(6);
  const otp_hash = await hashOTP(otp);
  const expires_at = new Date(Date.now() + VERIFICATION_OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  const { error: insertErr } = await admin.from('email_otps').insert({
    email: normalised,
    otp_hash,
    purpose: 'account_verification',
    expires_at,
  });
  if (insertErr) {
    console.error('verification OTP insert error:', insertErr);
    return { ok: false, error: 'Server error', status: 500 };
  }

  const resend = getResend();
  await resend.emails.send({
    from: FROM_EMAIL,
    to: normalised,
    subject: 'EpochZero Learn — Verify your email',
    html: verificationEmailHtml(otp),
  });

  return { ok: true };
}

function verificationEmailHtml(otp: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0A1628;font-family:'Helvetica Neue',Arial,sans-serif;color:#E8E4D9">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A1628">
    <tr><td align="center" style="padding:40px 20px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#11203B;border:1px solid #1A2D4D">
        <tr><td style="padding:32px;border-bottom:1px solid #1A2D4D">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;color:#FFC857;text-transform:uppercase">EpochZero Learn</div>
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#A8A498;margin-top:4px">Multi-Domain Tech Learning Hub</div>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 16px;font-family:'Courier New',monospace;font-size:22px;color:#F5F1E6">Verify your email</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#D4CFC2">
            Enter this code to confirm your account and finish creating it.
          </p>
          <div style="background:#0A1628;border:1px dashed #FFC857;padding:24px;text-align:center;margin:24px 0">
            <div style="font-family:'Courier New',monospace;font-size:36px;letter-spacing:12px;color:#FFC857;font-weight:bold">${otp}</div>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#A8A498">This code expires in ${VERIFICATION_OTP_EXPIRY_MINUTES} minutes.</p>
          <p style="margin:0;font-size:13px;color:#A8A498">If you didn't request this, ignore this email.</p>
        </td></tr>
        <tr><td style="padding:24px 32px;border-top:1px solid #1A2D4D;background:#0A1628">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;color:#A8A498;letter-spacing:1px">EPOCHZERO LEARN — INDEPENDENT LEARNING PLATFORM</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
