import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { issueCertificate, resolveCourseChainFromTest } from '@/lib/certificates';

const schema = z.object({ attempt_id: z.string().uuid() });

export const runtime = 'nodejs';
export const maxDuration = 30;

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

    // Resolve domain via test → topic → unit → course chain (used only for
    // dual-logo branding; absent for standalone tests not linked to a topic)
    const chain = await resolveCourseChainFromTest(attempt.test_id);
    const slugToDomain: Record<string, string> = {
      rema: 'rema',
      'cloud-security': 'cloud',
      crypto: 'crypto',
      webdev: 'webdev',
    };
    const domain = chain ? slugToDomain[chain.courseSlug] ?? null : null;

    const testTitle = (attempt.tests as any).title;

    const result = await issueCertificate({
      certType: 'mcq',
      email: attempt.email,
      studentName: attempt.full_name,
      title: testTitle,
      score: attempt.score,
      domain,
      attemptId: attempt_id,
      testId: attempt.test_id,
      unitId: chain?.unitId ?? null,
      courseId: chain?.courseId ?? null,
    });

    return NextResponse.json({ cert_uid: result.cert_uid, pdf_url: result.pdf_url, already_existed: result.already_existed || undefined });
  } catch (err) {
    console.error('cert generate error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
