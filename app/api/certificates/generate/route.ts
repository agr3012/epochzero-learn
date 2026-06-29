import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { createAdminClient } from '@/lib/supabase/admin';
import { getResend, FROM_EMAIL } from '@/lib/resend';
import { CertificateDocument } from '@/components/certificate-pdf';
import { formatDate } from '@/lib/utils';

const schema = z.object({ attempt_id: z.string().uuid() });

export const runtime = 'nodejs';
export const maxDuration = 30;

// ── Domain → club metadata map (mirrors certificate-pdf.tsx) ──────────────
const PLATFORM_LOGO_URL =
  'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

const DOMAIN_CLUB: Record<string, { slug: string; name: string; logo: string }> = {
  rema: {
    slug: 'rema',
    name: 'REMA Club',
    logo: 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/REMA_Club_Logo.png',
  },
  webdev: {
    slug: 'fullstack',
    name: 'Full Stack Development Club',
    logo: 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/FSD_Club_Logo.png',
  },
};

export async function POST(req: NextRequest) {
  try {
    // Internal-only: verify service role key in header
    const internalKey = req.headers.get('x-internal-key');
    if (internalKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { attempt_id } = parsed.data;
    const admin = createAdminClient();

    // Load attempt + test
    const { data: attempt } = await admin
      .from('attempts')
      .select('*, tests(id, title, slug)')
      .eq('id', attempt_id)
      .single();
    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }
    if (!attempt.passed || !attempt.is_first_pass) {
      return NextResponse.json(
        { error: 'Certificate only issued on first passing attempt' },
        { status: 400 }
      );
    }

    // Check no cert exists yet
    const { data: existing } = await admin
      .from('certificates')
      .select('id, cert_uid')
      .eq('attempt_id', attempt_id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ cert_uid: existing.cert_uid, already_existed: true });
    }

    // ── Resolve domain via test → unit → course chain ─────────────────────
    // topic_tests → topics → units → courses gives us the course domain/slug
    let domain: string | null = null;
    try {
      const testId = attempt.test_id;

      // Find topic linked to this test
      const { data: topicTestRow } = await admin
        .from('topic_tests')
        .select('topic_id')
        .eq('test_id', testId)
        .maybeSingle();

      if (topicTestRow?.topic_id) {
        // Find unit for this topic
        const { data: topicRow } = await admin
          .from('topics')
          .select('unit_id')
          .eq('id', topicTestRow.topic_id)
          .maybeSingle();

        if (topicRow?.unit_id) {
          // Find course for this unit
          const { data: unitRow } = await admin
            .from('units')
            .select('course_id')
            .eq('id', topicRow.unit_id)
            .maybeSingle();

          if (unitRow?.course_id) {
            // Get course slug — this is the domain
            const { data: courseRow } = await admin
              .from('courses')
              .select('slug')
              .eq('id', unitRow.course_id)
              .maybeSingle();

            // Map course slug to domain string
            // courses.slug values: 'rema', 'cloud-security', 'crypto', 'webdev'
            const slugToDomain: Record<string, string> = {
              'rema':          'rema',
              'cloud-security':'cloud',
              'crypto':        'crypto',
              'webdev':        'webdev',
            };
            domain = slugToDomain[courseRow?.slug ?? ''] ?? null;
          }
        }
      }
    } catch (domainErr) {
      // Non-fatal — cert generates without club logo if domain lookup fails
      console.warn('Domain lookup failed, using platform logo only:', domainErr);
    }

    // Resolve club metadata for this domain
    const clubMeta = domain ? (DOMAIN_CLUB[domain] ?? null) : null;

    // Generate cert UID
    const { data: uidData } = await admin.rpc('generate_cert_uid');
    const cert_uid =
      (uidData as string) ??
      `EPZ-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify/${cert_uid}`;
    const issuedDate = formatDate(new Date());

    // Render PDF — pass domain so certificate-pdf.tsx picks correct logos
    const pdfBuffer = await renderToBuffer(
      React.createElement(CertificateDocument, {
        studentName:  attempt.full_name,
        testTitle:    (attempt.tests as any).title,
        score:        attempt.score,
        certUid:      cert_uid,
        issuedDate,
        verifyUrl,
        domain:       domain ?? undefined,
      }) as any
    );

    // Upload PDF to Supabase Storage
    const filename = `${cert_uid}.pdf`;
    const { error: uploadErr } = await admin.storage
      .from('certificates')
      .upload(filename, pdfBuffer, {
        contentType:  'application/pdf',
        cacheControl: '31536000',
        upsert:       true,
      });
    if (uploadErr) {
      console.error('cert upload error:', uploadErr);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const { data: pub } = admin.storage.from('certificates').getPublicUrl(filename);
    const pdf_url = pub.publicUrl;

    // Insert cert row — includes domain + club metadata for reporting
    const { data: certRow, error: certErr } = await admin
      .from('certificates')
      .insert({
        attempt_id,
        cert_uid,
        email:             attempt.email,
        student_name:      attempt.full_name,
        test_id:           attempt.test_id,
        test_title:        (attempt.tests as any).title,
        score:             attempt.score,
        pdf_url,
        // Analytics + dual-logo fields (added by analytics_migration.sql)
        domain:            domain,
        club_slug:         clubMeta?.slug   ?? null,
        club_name:         clubMeta?.name   ?? null,
        club_logo_url:     clubMeta?.logo   ?? null,
        platform_logo_url: PLATFORM_LOGO_URL,
      })
      .select()
      .single();
    if (certErr || !certRow) {
      console.error('cert insert error:', certErr);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    // Send email with PDF attached
    try {
      const resend = getResend();
      const { error: sendErr } = await resend.emails.send({
        from: FROM_EMAIL,
        to:   attempt.email,
        subject: `Your EpochZero Learn certificate — ${(attempt.tests as any).title}`,
        html: certificateEmailHtml({
          name:      attempt.full_name,
          testTitle: (attempt.tests as any).title,
          score:     attempt.score,
          certUid:   cert_uid,
          verifyUrl,
          domain:    domain ?? undefined,
          clubName:  clubMeta?.name,
        }),
        attachments: [
          {
            filename: `EpochZero-Learn-Certificate-${cert_uid}.pdf`,
            content:  pdfBuffer,
          },
        ],
      });
      if (sendErr) throw sendErr;
      await admin
        .from('certificates')
        .update({ email_sent_at: new Date().toISOString() })
        .eq('id', certRow.id);
    } catch (emailErr) {
      console.error('cert email error:', emailErr);
      await admin
        .from('certificates')
        .update({ email_send_attempts: (certRow.email_send_attempts ?? 0) + 1 })
        .eq('id', certRow.id);
    }

    return NextResponse.json({ cert_uid, pdf_url });
  } catch (err) {
    console.error('cert generate error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ── Email HTML ─────────────────────────────────────────────────────────────
function certificateEmailHtml({
  name,
  testTitle,
  score,
  certUid,
  verifyUrl,
  domain,
  clubName,
}: {
  name:      string;
  testTitle: string;
  score:     number;
  certUid:   string;
  verifyUrl: string;
  domain?:   string;
  clubName?: string;
}) {
  const esc = (s: string | number) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  // Domain label for email subject context
  const domainLabel: Record<string, string> = {
    rema:   'REMA',
    cloud:  'Cloud Security',
    crypto: 'Cryptography',
    webdev: 'Web Development',
  };
  const domainStr = domain ? domainLabel[domain] ?? '' : '';
  const clubLine  = clubName
    ? `<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#A8A498">
        This certificate is issued in association with the
        <strong style="color:#FFC857">${esc(clubName)}</strong>.
       </p>`
    : '';

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0A1628;font-family:'Helvetica Neue',Arial,sans-serif;color:#E8E4D9">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0A1628">
    <tr><td align="center" style="padding:40px 20px">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#11203B;border:1px solid #1A2D4D">
        <tr><td style="padding:32px;border-bottom:1px solid #1A2D4D">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:3px;color:#FFC857;text-transform:uppercase">EpochZero Learn</div>
          <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#A8A498;margin-top:4px">Multi-Domain Tech Learning Hub${domainStr ? ' · ' + domainStr : ''}</div>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:#FFC857">Congratulations, ${esc(name)}.</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#D4CFC2">
            You passed <strong style="color:#F5F1E6">${esc(testTitle)}</strong> with a score of
            <strong style="color:#FFC857">${esc(score)}%</strong>. Your certificate is attached to this email.
          </p>
          ${clubLine}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px dashed #FFC857;margin:0 0 24px">
            <tr><td style="padding:20px">
              <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#A8A498;text-transform:uppercase;margin-bottom:6px">Certificate ID</div>
              <div style="font-family:'Courier New',monospace;font-size:18px;color:#FFC857;letter-spacing:2px">${esc(certUid)}</div>
              <div style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:2px;color:#A8A498;text-transform:uppercase;margin:14px 0 6px">Public verification</div>
              <a href="${esc(verifyUrl)}" style="font-family:'Courier New',monospace;font-size:12px;color:#FFC857;text-decoration:underline;word-break:break-all">${esc(verifyUrl)}</a>
            </td></tr>
          </table>
          <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#A8A498">
            Anyone with the verification URL can confirm the authenticity of this certificate. Save the PDF for your records.
          </p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#A8A498">
            Continue learning at <a href="${esc(process.env.NEXT_PUBLIC_SITE_URL ?? '')}" style="color:#FFC857">EpochZero Learn</a> — new walkthroughs and tests are added regularly.
          </p>
        </td></tr>
        <tr><td style="padding:24px 32px;border-top:1px solid #1A2D4D;background:#0A1628">
          <p style="margin:0;font-family:'Courier New',monospace;font-size:11px;color:#A8A498;letter-spacing:1px">EPOCHZERO LEARN — MULTI-DOMAIN TECH LEARNING HUB</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
