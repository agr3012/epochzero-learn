import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

const schema = z.object({
  attempt_id: z.string().uuid(),
  // Map of question_id -> { selected_display_index, option_permutation }
  // Permutation is echoed back from the verify call so we can map display->original.
  answers: z.array(
    z.object({
      question_id: z.string().uuid(),
      selected_index: z.number().int().min(0).max(20).nullable(),
      option_permutation: z.array(z.number().int()),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid submission', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { attempt_id, answers } = parsed.data;
    const admin = createAdminClient();

    // Load attempt
    const { data: attempt } = await admin
      .from('attempts')
      .select('*')
      .eq('id', attempt_id)
      .single();
    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }
    if (attempt.submitted_at) {
      return NextResponse.json(
        { error: 'Attempt already submitted' },
        { status: 400 }
      );
    }
    if (!attempt.otp_verified) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Load test config
    const { data: test } = await admin
      .from('tests')
      .select('*')
      .eq('id', attempt.test_id)
      .single();
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Load correct answers for the questions in this attempt
    const { data: questions } = await admin
      .from('test_questions')
      .select('id, correct_index')
      .in('id', attempt.question_ids as string[]);
    if (!questions) {
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
    const correctMap = new Map(questions.map((q) => [q.id, q.correct_index]));

    // Score
    let correct_count = 0;
    const total_count = (attempt.question_ids as string[]).length;
    const answersJson: Record<string, number | null> = {};

    for (const ans of answers) {
      const correctOriginalIdx = correctMap.get(ans.question_id);
      if (correctOriginalIdx === undefined) continue;
      // Map display index -> original index
      const selectedOriginalIdx =
        ans.selected_index === null
          ? null
          : ans.option_permutation[ans.selected_index];
      answersJson[ans.question_id] = selectedOriginalIdx;
      if (selectedOriginalIdx === correctOriginalIdx) correct_count++;
    }

    const score = Math.round((correct_count / total_count) * 100);
    const passed = score >= test.passing_score;

    // Determine first-pass: only if email hasn't already received a cert for this test
    let isFirstPass = false;
    if (passed) {
      const { data: prior } = await admin
        .from('attempts')
        .select('id')
        .eq('email', attempt.email)
        .eq('test_id', attempt.test_id)
        .eq('passed', true)
        .eq('is_first_pass', true)
        .limit(1)
        .maybeSingle();
      if (!prior) isFirstPass = true;
    }

    const submitted_at = new Date().toISOString();
    const duration_seconds = Math.round(
      (Date.now() - new Date(attempt.started_at).getTime()) / 1000
    );

    // Update attempt
    const { error: updErr } = await admin
      .from('attempts')
      .update({
        score,
        correct_count,
        total_count,
        passed,
        is_first_pass: isFirstPass,
        answers: answersJson,
        submitted_at,
        duration_seconds,
      })
      .eq('id', attempt_id);
    if (updErr) {
      console.error('attempt update error:', updErr);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    // Increment test attempt count (best-effort, non-blocking)
    admin
      .from('tests')
      .update({ attempt_count: (test.attempt_count ?? 0) + 1 })
      .eq('id', test.id)
      .then(
        () => {},
        () => {}
      );

    let cert_uid: string | null = null;
    if (isFirstPass) {
      // Generate certificate (PDF + email is handled in a separate route to keep this fast)
      const certRes = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/certificates/generate`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-internal-key': process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
          },
          body: JSON.stringify({ attempt_id }),
        }
      );
      if (certRes.ok) {
        const data = await certRes.json();
        cert_uid = data.cert_uid;
      } else {
        console.error('cert generation failed:', await certRes.text());
      }
    }

    return NextResponse.json({
      score,
      correct_count,
      total_count,
      passed,
      is_first_pass: isFirstPass,
      cert_uid,
      passing_score: test.passing_score,
    });
  } catch (err) {
    console.error('submit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
