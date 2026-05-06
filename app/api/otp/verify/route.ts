import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashOTP } from '@/lib/utils';

const schema = z.object({
  email: z.string().email().toLowerCase().trim(),
  test_id: z.string().uuid(),
  full_name: z.string().min(2).max(100).trim(),
  otp: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { email, test_id, full_name, otp } = parsed.data;
    const admin = createAdminClient();

    // Lookup OTP
    const otp_hash = await hashOTP(otp);
    const { data: otpRow } = await admin
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .eq('test_id', test_id)
      .eq('purpose', 'test_attempt')
      .eq('otp_hash', otp_hash)
      .is('consumed_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpRow) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Mark consumed
    await admin
      .from('email_otps')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', otpRow.id);

    // Load test config
    const { data: test } = await admin
      .from('tests')
      .select('*')
      .eq('id', test_id)
      .single();
    if (!test || !test.is_published) {
      return NextResponse.json({ error: 'Test not available' }, { status: 404 });
    }

    // Load questions
    const { data: questions } = await admin
      .from('test_questions')
      .select('id, question_text, options, order_index')
      .eq('test_id', test_id);

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions configured' },
        { status: 500 }
      );
    }

    // Pick N questions (shuffled if configured)
    let selected = [...questions];
    if (test.shuffle_questions) {
      selected = shuffle(selected);
    } else {
      selected.sort((a, b) => a.order_index - b.order_index);
    }
    selected = selected.slice(0, test.total_questions);

    // Optionally shuffle options per question
    const clientQuestions = selected.map((q) => {
      const opts = q.options as string[];
      if (test.shuffle_options) {
        const indices = opts.map((_, i) => i);
        const shuffled = shuffle(indices);
        return {
          id: q.id,
          question_text: q.question_text,
          options: shuffled.map((i) => opts[i]),
          // We send the permutation back so we can map student's selected
          // *display* index to the *original* index when scoring.
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

    // Create attempt record
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      null;
    const ua = req.headers.get('user-agent') ?? null;

    const { data: attempt, error: attemptErr } = await admin
      .from('attempts')
      .insert({
        test_id,
        email,
        full_name,
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
    console.error('verify OTP error:', err);
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
