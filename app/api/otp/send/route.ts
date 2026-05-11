import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { getResend, FROM_EMAIL } from '@/lib/resend';
import { generateOTP, hashOTP } from '@/lib/utils';

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  test_id: z.string().uuid(),
  full_name: z.string().min(2).max(100).trim(),
  turnstile_token: z.string().optional(),
});

const OTP_EXPIRY_MINUTES = 10;
const OTP_RATE_LIMIT_PER_HOUR = 5;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { email, test_id, full_name, turnstile_token } = parsed.data;

    // Optional Turnstile verification
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstile_token) {
        return NextResponse.json({ error: 'Bot check required' }, { status: 400 });
      }
      const ts = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstile_token,
        }),
      }).then((r) => r.json());
      if (!ts.success) {
        return NextResponse.json({ error: 'Bot check failed' }, { status: 400 });
      }
    }

    const admin = createAdminClient();

    // Verify test exists and is published
    const { data: test } = await admin
      .from('tests')
      .select('id, title, is_published')
      .eq('id', test_id)
      .single();
    if (!test || !test.is_published) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Rate limit: max OTPs per hour for this email+test
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from('email_otps')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .eq('test_id', test_id)
      .gt('created_at', oneHourAgo);
    if ((count ?? 0) >= OTP_RATE_LIMIT_PER_HOUR) {
      return NextResponse.json(
        { error: 'Too many OTP requests. Try again later.' },
        { status: 429 }
      );
    }

    // Generate and hash OTP
    const otp = generateOTP(6);
    const otp_hash = await hashOTP(otp);
    const expires_at = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    ).toISOString();

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      null;

    const { error: insertErr } = await admin.from('email_otps').insert({
      email,
      otp_hash,
      purpose: 'test_attempt',
      test_id,
      expires_at,
      ip_address: ip,
    });
    if (insertErr) {
      console.error('OTP insert error:', insertErr);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    // Send email
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,            
      subject: `EpochZero Learn — Verify your email to begin the test`,
      html: otpEmailHtml({ name: full_name, otp, testTitle: test.title }),
    });

    return NextResponse.json({ ok: true, expires_in_minutes: OTP_EXPIRY_MINUTES });
  } catch (err) {
    console.error('send OTP error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function otpEmailHtml({
  name,
  otp,
  testTitle,
}: {
  name: string;
  otp: string;
  testTitle: string;
}) {
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
          <h1 style="margin:0 0 16px;font-family:'Courier New',monospace;font-size:22px;color:#F5F1E6">Your verification code</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#D4CFC2">
            Hi ${escapeHtml(name)}, here is your one-time code to begin the test
            <strong style="color:#FFC857">${escapeHtml(testTitle)}</strong>.
          </p>
          <div style="background:#0A1628;border:1px dashed #FFC857;padding:24px;text-align:center;margin:24px 0">
            <div style="font-family:'Courier New',monospace;font-size:36px;letter-spacing:12px;color:#FFC857;font-weight:bold">${otp}</div>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#A8A498">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
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

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
