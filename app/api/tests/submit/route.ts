import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { maybeIssueModuleCertificate } from '@/lib/certificates';
import { awardPoints } from '@/lib/points';

const schema = z.object({
  attempt_id: z.string().uuid(),
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
    if (!attempt.account_id && !attempt.otp_verified) {
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

    // Load full question rows (for review data + correct_index)
    const { data: questions } = await admin
      .from('test_questions')
      .select('id, question_text, options, correct_index, ebook_reference')
      .in('id', attempt.question_ids as string[]);
    if (!questions) {
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    // Build per-answer maps and review payload
    let correct_count = 0;
    const total_count = (attempt.question_ids as string[]).length;
    const answersJson: Record<string, number | null> = {};

    // Index answers by question_id so we preserve display order from attempt.question_ids
    const answerByQ = new Map(answers.map((a) => [a.question_id, a]));

    const review: {
      question_text: string;
      options: string[];
      user_answer_index: number | null;
      correct_answer_index: number;
      is_correct: boolean;
      ebook_reference: string | null;
    }[] = [];

    for (const qid of attempt.question_ids as string[]) {
      const q = questionMap.get(qid);
      const ans = answerByQ.get(qid);
      if (!q || !ans) continue;

      const correctOriginalIdx = q.correct_index;

      // Map display index -> original index using the permutation echoed by client
      const selectedOriginalIdx =
        ans.selected_index === null
          ? null
          : ans.option_permutation[ans.selected_index];

      answersJson[qid] = selectedOriginalIdx;

      const isCorrect = selectedOriginalIdx === correctOriginalIdx;
      if (isCorrect) correct_count++;

      // Reorder options into the display order the student saw,
      // and translate correct/user indices into that same display order.
      const originalOptions = (q.options as string[]) ?? [];
      const permutation = ans.option_permutation;
      const displayedOptions = permutation.map((origIdx) => originalOptions[origIdx]);

      const correctDisplayIdx = permutation.indexOf(correctOriginalIdx);
      const userDisplayIdx = ans.selected_index; // already a display index

      review.push({
        question_text: q.question_text,
        options: displayedOptions,
        user_answer_index: userDisplayIdx,
        correct_answer_index: correctDisplayIdx,
        is_correct: isCorrect,
        ebook_reference: q.ebook_reference ?? null,
      });
    }

    const score = Math.round((correct_count / total_count) * 100);
    const passed = score >= test.passing_score;

    // First-pass detection
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

    if (isFirstPass && attempt.account_id) {
      await awardPoints(attempt.account_id, 'exam', attempt.test_id);
    }

    // Increment test attempt count (best-effort)
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

      // Module/overall certs — awaited like the per-test cert above so the
      // PDF/email actually completes before the function returns, but
      // failures here must never break the test result response.
      try {
        await maybeIssueModuleCertificate(attempt.test_id, attempt.email, attempt.full_name);
      } catch (err) {
        console.error('module cert check failed:', err);
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
      review,
    });
  } catch (err) {
    console.error('submit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
