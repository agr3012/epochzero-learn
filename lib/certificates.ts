// lib/certificates.ts
// Server-side only. Shared certificate issuance for all five cert types:
//   mcq      — auto, one per first-pass test attempt (existing behaviour)
//   module   — auto, one per unit once every Q4 test in it is passed
//   practical/oral — manual, issued by an admin (no MCQ test exists)
//   overall  — auto, once all 6 module certs + practical + oral exist
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { createAdminClient } from '@/lib/supabase/admin';
import { getResend, FROM_EMAIL } from '@/lib/resend';
import { CertificateDocument, type CertType } from '@/components/certificate-pdf';
import { formatDate } from '@/lib/utils';

const PLATFORM_LOGO_URL =
  'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

const SLUG_TO_DOMAIN: Record<string, string> = {
  rema: 'rema',
  'cloud-security': 'cloud',
  crypto: 'crypto',
  webdev: 'webdev',
};

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

export function resolveClubMeta(courseSlug: string | null | undefined) {
  const domain = courseSlug ? SLUG_TO_DOMAIN[courseSlug] ?? null : null;
  const club = domain ? DOMAIN_CLUB[domain] ?? null : null;
  return { domain, club };
}

/** Walks test → topic → unit → course. Used both to resolve the MCQ cert's
 *  club branding and to know which unit/course a module cert just earned. */
export async function resolveCourseChainFromTest(
  testId: string
): Promise<{ topicId: string; unitId: string; courseId: string; courseSlug: string } | null> {
  const admin = createAdminClient();
  const { data: topicTestRow } = await admin
    .from('topic_tests')
    .select('topic_id')
    .eq('test_id', testId)
    .maybeSingle();
  if (!topicTestRow?.topic_id) return null;

  const { data: topicRow } = await admin
    .from('topics')
    .select('unit_id')
    .eq('id', topicTestRow.topic_id)
    .maybeSingle();
  if (!topicRow?.unit_id) return null;

  const { data: unitRow } = await admin
    .from('units')
    .select('course_id')
    .eq('id', topicRow.unit_id)
    .maybeSingle();
  if (!unitRow?.course_id) return null;

  const { data: courseRow } = await admin
    .from('courses')
    .select('slug')
    .eq('id', unitRow.course_id)
    .maybeSingle();
  if (!courseRow) return null;

  return {
    topicId: topicTestRow.topic_id,
    unitId: topicRow.unit_id,
    courseId: unitRow.course_id,
    courseSlug: courseRow.slug,
  };
}

/** True once every topic in the unit that has a linked Q4 test has been
 *  passed (a topic_progress row exists for it). A unit with no testable
 *  topics can never be "mastered" — there is nothing to certify. */
export async function isUnitMastered(email: string, unitId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: topics } = await admin
    .from('topics')
    .select('id')
    .eq('unit_id', unitId)
    .eq('is_published', true);
  const topicIds = (topics ?? []).map((t) => t.id as string);
  if (topicIds.length === 0) return false;

  const { data: topicTestRows } = await admin
    .from('topic_tests')
    .select('topic_id')
    .in('topic_id', topicIds);
  const testableTopicIds = Array.from(new Set((topicTestRows ?? []).map((r) => r.topic_id as string)));
  if (testableTopicIds.length === 0) return false;

  const { data: progressRows } = await admin
    .from('topic_progress')
    .select('topic_id')
    .eq('email', email)
    .in('topic_id', testableTopicIds);
  const passedSet = new Set((progressRows ?? []).map((r) => r.topic_id as string));

  return testableTopicIds.every((id) => passedSet.has(id));
}

interface IssueCertificateParams {
  certType: CertType;
  email: string;
  studentName: string;
  title: string;
  score?: number | null;
  domain?: string | null;
  attemptId?: string | null;
  testId?: string | null;
  unitId?: string | null;
  courseId?: string | null;
  awardedBy?: string | null;
  notes?: string | null;
}

interface IssueCertificateResult {
  cert_uid: string;
  pdf_url: string;
  already_existed: boolean;
}

/** Returns the existing cert for this (email, certType, key) if one was
 *  already issued — every cert type has exactly one natural dedupe key. */
async function findExistingCertificate(
  certType: CertType,
  email: string,
  { attemptId, unitId, courseId }: { attemptId?: string | null; unitId?: string | null; courseId?: string | null }
) {
  const admin = createAdminClient();
  let query = admin.from('certificates').select('id, cert_uid, pdf_url').eq('cert_type', certType).eq('email', email);
  if (certType === 'mcq' && attemptId) query = query.eq('attempt_id', attemptId);
  else if (certType === 'module' && unitId) query = query.eq('unit_id', unitId);
  else if (courseId) query = query.eq('course_id', courseId);
  const { data } = await query.maybeSingle();
  return data;
}

export async function issueCertificate(params: IssueCertificateParams): Promise<IssueCertificateResult> {
  const { certType, email, studentName, title, score, domain, attemptId, testId, unitId, courseId, awardedBy, notes } = params;
  const admin = createAdminClient();

  const existing = await findExistingCertificate(certType, email, { attemptId, unitId, courseId });
  if (existing) {
    return { cert_uid: existing.cert_uid, pdf_url: existing.pdf_url, already_existed: true };
  }

  const clubMeta = domain ? DOMAIN_CLUB[domain] ?? null : null;

  const { data: uidData } = await admin.rpc('generate_cert_uid');
  const cert_uid =
    (uidData as string) ??
    `EPZ-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify/${cert_uid}`;
  const issuedDate = formatDate(new Date());

  const pdfBuffer = await renderToBuffer(
    React.createElement(CertificateDocument, {
      certType,
      studentName,
      testTitle: title,
      score: score ?? null,
      certUid: cert_uid,
      issuedDate,
      verifyUrl,
      domain: domain ?? undefined,
    }) as any
  );

  const filename = `${cert_uid}.pdf`;
  const { error: uploadErr } = await admin.storage
    .from('certificates')
    .upload(filename, pdfBuffer, { contentType: 'application/pdf', cacheControl: '31536000', upsert: true });
  if (uploadErr) throw new Error(`cert upload error: ${uploadErr.message}`);

  const { data: pub } = admin.storage.from('certificates').getPublicUrl(filename);
  const pdf_url = pub.publicUrl;

  const { data: certRow, error: certErr } = await admin
    .from('certificates')
    .insert({
      cert_type: certType,
      attempt_id: attemptId ?? null,
      test_id: testId ?? null,
      unit_id: unitId ?? null,
      course_id: courseId ?? null,
      awarded_by: awardedBy ?? null,
      notes: notes ?? null,
      cert_uid,
      email,
      student_name: studentName,
      test_title: title,
      score: score ?? null,
      pdf_url,
      domain: domain ?? null,
      club_slug: clubMeta?.slug ?? null,
      club_name: clubMeta?.name ?? null,
      club_logo_url: clubMeta?.logo ?? null,
      platform_logo_url: PLATFORM_LOGO_URL,
    })
    .select()
    .single();
  if (certErr || !certRow) throw new Error(`cert insert error: ${certErr?.message}`);

  try {
    const resend = getResend();
    const { error: sendErr } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your EpochZero Learn certificate — ${title}`,
      html: certificateEmailHtml({ name: studentName, title, certType, score: score ?? null, certUid: cert_uid, verifyUrl, domain: domain ?? undefined, clubName: clubMeta?.name }),
      attachments: [{ filename: `EpochZero-Learn-Certificate-${cert_uid}.pdf`, content: pdfBuffer }],
    });
    if (sendErr) throw sendErr;
    await admin.from('certificates').update({ email_sent_at: new Date().toISOString() }).eq('id', certRow.id);
  } catch (emailErr) {
    console.error('cert email error:', emailErr);
    await admin.from('certificates').update({ email_send_attempts: (certRow.email_send_attempts ?? 0) + 1 }).eq('id', certRow.id);
  }

  return { cert_uid, pdf_url, already_existed: false };
}

/** Called after a test's first-pass MCQ cert is issued. If this test
 *  completes a unit (every topic's Q4 test now passed), auto-issues the
 *  module certificate, then checks whether the full chain is now complete. */
export async function maybeIssueModuleCertificate(
  testId: string,
  email: string,
  studentName: string
): Promise<IssueCertificateResult | null> {
  const chain = await resolveCourseChainFromTest(testId);
  if (!chain) return null;

  const mastered = await isUnitMastered(email, chain.unitId);
  if (!mastered) return null;

  const admin = createAdminClient();
  const { data: unit } = await admin.from('units').select('title').eq('id', chain.unitId).maybeSingle();
  const { domain } = resolveClubMeta(chain.courseSlug);

  const result = await issueCertificate({
    certType: 'module',
    email,
    studentName,
    title: `${unit?.title ?? 'Module'} — Module Certificate`,
    domain,
    unitId: chain.unitId,
    courseId: chain.courseId,
  });

  if (!result.already_existed) {
    await maybeIssueOverallCertificate(email, studentName, chain.courseId);
  }
  return result;
}

/** True once a student holds a non-revoked module cert for every published
 *  unit in the course, plus one practical and one oral cert. */
export async function hasFullCertificateChain(email: string, courseId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: units } = await admin.from('units').select('id').eq('course_id', courseId).eq('is_published', true);
  const unitIds = (units ?? []).map((u) => u.id as string);
  if (unitIds.length === 0) return false;

  const { data: certs } = await admin
    .from('certificates')
    .select('cert_type, unit_id')
    .eq('email', email)
    .eq('course_id', courseId)
    .eq('is_revoked', false)
    .in('cert_type', ['module', 'practical', 'oral']);
  const rows = certs ?? [];

  const moduleUnitSet = new Set(rows.filter((r) => r.cert_type === 'module').map((r) => r.unit_id as string));
  const allModulesDone = unitIds.every((id) => moduleUnitSet.has(id));
  const hasPractical = rows.some((r) => r.cert_type === 'practical');
  const hasOral = rows.some((r) => r.cert_type === 'oral');

  return allModulesDone && hasPractical && hasOral;
}

export async function maybeIssueOverallCertificate(
  email: string,
  studentName: string,
  courseId: string
): Promise<IssueCertificateResult | null> {
  if (!(await hasFullCertificateChain(email, courseId))) return null;

  const admin = createAdminClient();
  const { data: course } = await admin.from('courses').select('title, slug').eq('id', courseId).maybeSingle();
  const { domain } = resolveClubMeta(course?.slug ?? null);

  return issueCertificate({
    certType: 'overall',
    email,
    studentName,
    title: `${course?.title ?? 'Course'} — Full Certification`,
    domain,
    courseId,
  });
}

export type ChainSlot = { key: string; label: string; earned: boolean; certUid: string | null; pdfUrl: string | null };
export type CertificateChainStatus = {
  courseTitle: string;
  modules: ChainSlot[];
  practical: ChainSlot;
  oral: ChainSlot;
  overall: ChainSlot;
};

export async function getCertificateChainStatus(email: string, courseId: string): Promise<CertificateChainStatus> {
  const admin = createAdminClient();
  const [{ data: course }, { data: units }, { data: certs }] = await Promise.all([
    admin.from('courses').select('title').eq('id', courseId).maybeSingle(),
    admin.from('units').select('id, title, unit_number').eq('course_id', courseId).eq('is_published', true).order('unit_number', { ascending: true }),
    admin.from('certificates').select('cert_type, unit_id, cert_uid, pdf_url').eq('email', email).eq('course_id', courseId).eq('is_revoked', false),
  ]);

  const certRows = certs ?? [];
  const findCert = (type: string, unitId?: string) =>
    certRows.find((c) => c.cert_type === type && (unitId ? c.unit_id === unitId : true)) ?? null;

  const modules: ChainSlot[] = (units ?? []).map((u) => {
    const c = findCert('module', u.id as string);
    return { key: u.id as string, label: u.title as string, earned: !!c, certUid: c?.cert_uid ?? null, pdfUrl: c?.pdf_url ?? null };
  });

  const slot = (type: string, label: string): ChainSlot => {
    const c = findCert(type);
    return { key: type, label, earned: !!c, certUid: c?.cert_uid ?? null, pdfUrl: c?.pdf_url ?? null };
  };

  return {
    courseTitle: course?.title ?? '',
    modules,
    practical: slot('practical', 'Practical Exam'),
    oral: slot('oral', 'Oral Exam'),
    overall: slot('overall', 'Overall Certification'),
  };
}

function certificateEmailHtml({
  name,
  title,
  certType,
  score,
  certUid,
  verifyUrl,
  domain,
  clubName,
}: {
  name: string;
  title: string;
  certType: CertType;
  score: number | null;
  certUid: string;
  verifyUrl: string;
  domain?: string;
  clubName?: string;
}) {
  const esc = (s: string | number) =>
    String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const domainLabel: Record<string, string> = { rema: 'REMA', cloud: 'Cloud Security', crypto: 'Cryptography', webdev: 'Web Development' };
  const domainStr = domain ? domainLabel[domain] ?? '' : '';
  const clubLine = clubName
    ? `<p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#A8A498">This certificate is issued in association with the <strong style="color:#FFC857">${esc(clubName)}</strong>.</p>`
    : '';

  const completionPhrase: Record<CertType, string> = {
    mcq: 'passed',
    module: 'completed the module',
    practical: 'completed the practical examination for',
    oral: 'completed the oral examination for',
    overall: 'completed the full certification requirements of',
  };

  const scoreLine = score != null
    ? ` with a score of <strong style="color:#FFC857">${esc(score)}%</strong>`
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
            You ${completionPhrase[certType]} <strong style="color:#F5F1E6">${esc(title)}</strong>${scoreLine}. Your certificate is attached to this email.
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
