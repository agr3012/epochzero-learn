// app/api/admin/certificates/issue/route.ts
// Manual issuance of practical/oral exam certificates — there is no MCQ
// test behind these, so an admin (the instructor) marks them directly.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAccount, requireAdmin, logAdminAction } from '@/lib/auth';
import { issueCertificate, resolveClubMeta, maybeIssueOverallCertificate } from '@/lib/certificates';

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  course_id: z.string().uuid(),
  cert_type: z.enum(['practical', 'oral']),
  score: z.number().int().min(0).max(100).nullable().optional(),
  notes: z.string().trim().max(500).optional(),
});

export async function GET() {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try {
    await requireAdmin(account.email);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const admin = createAdminClient();
  const [{ data: certs, error }, { data: courses }] = await Promise.all([
    admin
      .from('certificates')
      .select('id, email, student_name, cert_type, test_title, score, issued_at, cert_uid, courses(title)')
      .in('cert_type', ['practical', 'oral', 'module', 'overall'])
      .order('issued_at', { ascending: false })
      .limit(100),
    admin.from('courses').select('id, title, slug').order('order_index'),
  ]);
  if (error) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  return NextResponse.json({ certs: certs ?? [], courses: courses ?? [] });
}

export async function POST(req: NextRequest) {
  const account = await getCurrentAccount();
  if (!account) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try {
    await requireAdmin(account.email);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
  const { email, course_id, cert_type, score, notes } = parsed.data;

  const admin = createAdminClient();

  const [{ data: student }, { data: course }] = await Promise.all([
    admin.from('student_accounts').select('id, email, display_name').eq('email', email).maybeSingle(),
    admin.from('courses').select('id, title, slug').eq('id', course_id).maybeSingle(),
  ]);
  if (!student) return NextResponse.json({ error: 'No account found for that email' }, { status: 404 });
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const { domain } = resolveClubMeta(course.slug);
  const examLabel = cert_type === 'practical' ? 'Practical Examination' : 'Oral Examination';

  try {
    const result = await issueCertificate({
      certType: cert_type,
      email: student.email,
      studentName: student.display_name ?? student.email,
      title: `${course.title} — ${examLabel}`,
      score: score ?? null,
      domain,
      courseId: course.id,
      awardedBy: account.email,
      notes: notes ?? null,
    });

    await maybeIssueOverallCertificate(student.email, student.display_name ?? student.email, course.id);

    await logAdminAction({
      adminEmail: account.email,
      action: `issue_${cert_type}_certificate`,
      targetTable: 'certificates',
      targetId: result.cert_uid,
      notes: `${student.email} — ${course.title}`,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error('admin cert issue error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
