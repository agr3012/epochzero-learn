// app/api/tests/start/route.ts
// Replaces the old OTP-verify attempt-creation flow — login is now the gate.
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAccount } from '@/lib/auth';
import { isEnrolledInCourse } from '@/lib/enrollment';

const schema = z.object({ test_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  try {
    const account = await getCurrentAccount();
    if (!account)
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    const { test_id } = parsed.data;

    const admin = createAdminClient();

    const { data: test } = await admin
      .from('tests')
      .select('*')
      .eq('id', test_id)
      .single();
    if (!test || !test.is_published)
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });

    // Defense in depth: if this test belongs to a gated course, re-check
    // enrollment server-side (the page-level gate is the primary check).
    const { data: topicTestRow } = await admin
      .from('topic_tests')
      .select('topic_id')
      .eq('test_id', test_id)
      .maybeSingle();
    if (topicTestRow?.topic_id) {
      const { data: topicRow } = await admin
        .from('topics')
        .select('unit_id')
        .eq('id', topicTestRow.topic_id)
        .maybeSingle();
      const { data: unitRow } = topicRow?.unit_id
        ? await admin.from('units').select('course_id').eq('id', topicRow.unit_id).maybeSingle()
        : { data: null };
      if (unitRow?.course_id) {
        const enrolled = await isEnrolledInCourse(account.id, unitRow.course_id);
        if (!enrolled)
          return NextResponse.json({ error: 'Enrollment required for this course' }, { status: 403 });
      }
    }

    const { data: questions } = await admin
      .from('test_questions')
      .select('id, question_text, options, order_index')
      .eq('test_id', test_id);
    if (!questions || questions.length === 0)
      return NextResponse.json({ error: 'No questions configured' }, { status: 500 });

    let selected = [...questions];
    if (test.shuffle_questions) {
      selected = shuffle(selected);
    } else {
      selected.sort((a, b) => a.order_index - b.order_index);
    }
    selected = selected.slice(0, test.total_questions);

    const clientQuestions = selected.map((q) => {
      const opts = q.options as string[];
      if (test.shuffle_options) {
        const indices = opts.map((_, i) => i);
        const shuffled = shuffle(indices);
        return {
          id: q.id,
          question_text: q.question_text,
          options: shuffled.map((i) => opts[i]),
          option_permutation: shuffled,
        };
      }
      return {
        id: q.id,
        question_text: q.question_text,
        options: opts,
        option_permutation: opts.map((_, i) => i),
      };
    });

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      null;
    const ua = req.headers.get('user-agent') ?? null;

    const { data: attempt, error: attemptErr } = await admin
      .from('attempts')
      .insert({
        test_id,
        account_id: account.id,
        email: account.email,
        full_name: account.display_name ?? account.email,
        question_ids: clientQuestions.map((q) => q.id),
        otp_verified: true,
        ip_address: ip,
        user_agent: ua,
      })
      .select()
      .single();

    if (attemptErr || !attempt) {
      console.error('attempt insert error:', attemptErr);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    return NextResponse.json({
      attempt_id: attempt.id,
      test: {
        id: test.id,
        title: test.title,
        duration_minutes: test.duration_minutes,
        passing_score: test.passing_score,
      },
      questions: clientQuestions,
    });
  } catch (err) {
    console.error('test start error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
