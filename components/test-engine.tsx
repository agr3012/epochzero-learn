'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Mail,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Award,
  Download,
  Clock,
  BookOpen,
} from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';

type Step = 'enroll' | 'otp' | 'taking' | 'submitting' | 'result';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  option_permutation: number[];
}

interface ReviewItem {
  question_text: string;
  options: string[];
  user_answer_index: number | null;
  correct_answer_index: number;
  is_correct: boolean;
  ebook_reference: string | null;
}

interface Props {
  testId:             string;
  testTitle:          string;
  onAttemptCreated?:  (attemptId: string) => void; // proctor hook
}

export function TestEngine({ testId, testTitle, onAttemptCreated }: Props) {
  const [step, setStep] = useState<Step>('enroll');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [durationMin, setDurationMin] = useState(30);
  const [passingScore, setPassingScore] = useState(60);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState<{
    score: number;
    correct_count: number;
    total_count: number;
    passed: boolean;
    is_first_pass: boolean;
    cert_uid: string | null;
    review: ReviewItem[];
  } | null>(null);

  const submittedRef = useRef(false);

  // ---- ENROLL STEP ----
  const sendOtp = async () => {
    if (!email || !fullName) {
      toast.error('Enter your name and email');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, test_id: testId, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to send code');
        return;
      }
      toast.success('Verification code sent. Check your inbox.');
      setStep('otp');
    } catch {
      toast.error('Network error');
    } finally {
      setBusy(false);
    }
  };

  // ---- OTP STEP ----
  const verifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, test_id: testId, full_name: fullName, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Verification failed');
        return;
      }
      setQuestions(data.questions);
      setAttemptId(data.attempt_id);
      onAttemptCreated?.(data.attempt_id); // notify ProctorShell
      setDurationMin(data.test.duration_minutes);
      setPassingScore(data.test.passing_score);
      setSecondsLeft(data.test.duration_minutes * 60);
      setAnswers(
        Object.fromEntries(
          (data.questions as Question[]).map((q) => [q.id, null])
        )
      );
      setStep('taking');
    } catch {
      toast.error('Network error');
    } finally {
      setBusy(false);
    }
  };

  // ---- TIMER ----
  useEffect(() => {
    if (step !== 'taking') return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          submitTest(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ---- SUBMIT ----
  const submitTest = useCallback(
    async (auto = false) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setStep('submitting');
      try {
        const payload = {
          attempt_id: attemptId,
          answers: questions.map((q) => ({
            question_id: q.id,
            selected_index: answers[q.id] ?? null,
            option_permutation: q.option_permutation,
          })),
        };
        const res = await fetch('/api/tests/submit', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? 'Submission failed');
          submittedRef.current = false;
          setStep('taking');
          return;
        }
        setResult(data);
        setStep('result');
        if (auto) toast.warning('Time up — your test was submitted automatically.');
      } catch {
        toast.error('Network error');
        submittedRef.current = false;
        setStep('taking');
      }
    },
    [attemptId, questions, answers]
  );

  const answeredCount = Object.values(answers).filter((v) => v !== null).length;

  // ===================================================================
  //  RENDER
  // ===================================================================

  if (step === 'enroll') {
    return (
      <div className="card-forensic p-8 lg:p-10 max-w-2xl">
        <h2 className="font-mono text-xl uppercase tracking-wider text-gold-500 mb-2">
          Begin Test
        </h2>
        <p className="font-serif text-bone-200 mb-8">
          We'll send a 6-digit code to your email to verify ownership before
          starting. Your name will be printed on the certificate exactly as
          entered below.
        </p>

        <label className="block mb-6">
          <span className="font-mono text-xs uppercase tracking-wider text-bone-300 mb-2 block">
            Full name (as printed on certificate)
          </span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Aditi Sharma"
            maxLength={100}
            className="w-full bg-navy-950 border border-navy-700 focus:border-gold-500 px-4 py-3 font-serif text-bone-100 outline-none transition-colors"
          />
        </label>

        <label className="block mb-8">
          <span className="font-mono text-xs uppercase tracking-wider text-bone-300 mb-2 block">
            Email address
          </span>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-navy-950 border border-navy-700 focus:border-gold-500 pl-10 pr-4 py-3 font-mono text-sm text-bone-100 outline-none transition-colors"
            />
          </div>
        </label>

        <button onClick={sendOtp} disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending code…
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              Send verification code
            </>
          )}
        </button>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="card-forensic p-8 lg:p-10 max-w-2xl">
        <h2 className="font-mono text-xl uppercase tracking-wider text-gold-500 mb-2">
          Enter the code
        </h2>
        <p className="font-serif text-bone-200 mb-8">
          Sent a 6-digit code to <span className="font-mono text-gold-500">{email}</span>.
          The code expires in 10 minutes.
        </p>

        <label className="block mb-8">
          <span className="font-mono text-xs uppercase tracking-wider text-bone-300 mb-2 block">
            Verification code
          </span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            className="w-full bg-navy-950 border border-navy-700 focus:border-gold-500 px-4 py-4 font-mono text-2xl text-center tracking-[0.5em] text-gold-500 outline-none transition-colors"
            autoFocus
          />
        </label>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setStep('enroll');
              setOtp('');
            }}
            className="btn-ghost"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <button onClick={verifyOtp} disabled={busy} className="btn-primary flex-1 justify-center disabled:opacity-50">
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
              </>
            ) : (
              <>
                Verify and start <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'taking') {
    const q = questions[currentIdx];
    return (
      <div className="space-y-3">
        {/* Sticky timer + progress */}
        <div className="sticky top-16 z-30 -mx-6 px-6 py-3 bg-navy-900/90 backdrop-blur-md border-b border-navy-700 flex items-center justify-between">
          <div className="flex items-center gap-4 font-mono text-sm">
            <span className="text-bone-300">
              Question{' '}
              <span className="text-gold-500">{currentIdx + 1}</span>
              <span className="text-bone-300"> / {questions.length}</span>
            </span>
            <span className="text-bone-300">·</span>
            <span className="text-bone-300">
              Answered <span className="text-gold-500">{answeredCount}</span>
            </span>
          </div>
          <div
            className={cn(
              'inline-flex items-center gap-2 font-mono text-sm px-3 py-1.5 border',
              secondsLeft < 60
                ? 'border-crimson-500 text-crimson-400 animate-pulse'
                : 'border-navy-700 text-bone-100'
            )}
          >
            <Clock className="w-4 h-4" />
            {formatDuration(secondsLeft)}
          </div>
        </div>

        {/* Question card */}
        <div className="card-forensic p-5 lg:p-6">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500 mb-2">
            Q{currentIdx + 1}
          </div>
          <h3 className="font-serif text-lg lg:text-xl text-bone-50 leading-relaxed mb-5">
            {q.question_text}
          </h3>

          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const selected = answers[q.id] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                  className={cn(
                    'w-full text-left flex items-center gap-3 px-3 py-2 border-2 transition-colors',
                    selected
                      ? 'border-gold-500 bg-gold-500/5 text-bone-50'
                      : 'border-navy-700 text-bone-200 hover:border-navy-600'
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 w-6 h-6 border-2 flex items-center justify-center font-mono text-xs uppercase',
                      selected
                        ? 'border-gold-500 bg-gold-500 text-navy-900'
                        : 'border-navy-600 text-bone-300'
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-serif text-sm leading-snug">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="btn-ghost disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          {/* Question grid */}
          <div className="hidden md:flex flex-wrap gap-1.5 max-w-md justify-center">
            {questions.map((qq, i) => {
              const answered = answers[qq.id] !== null;
              const active = i === currentIdx;
              return (
                <button
                  key={qq.id}
                  onClick={() => setCurrentIdx(i)}
                  className={cn(
                    'w-8 h-8 font-mono text-xs border transition-colors',
                    active
                      ? 'border-gold-500 bg-gold-500 text-navy-900'
                      : answered
                      ? 'border-gold-500/50 bg-gold-500/10 text-gold-500'
                      : 'border-navy-700 text-bone-300 hover:border-navy-600'
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              className="btn-ghost"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (answeredCount < questions.length) {
                  if (
                    !confirm(
                      `You have ${
                        questions.length - answeredCount
                      } unanswered question(s). Submit anyway?`
                    )
                  )
                    return;
                }
                submitTest(false);
              }}
              className="btn-primary"
            >
              Submit Test <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'submitting') {
    return (
      <div className="card-forensic p-12 max-w-2xl text-center">
        <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-6" />
        <h2 className="font-mono text-xl uppercase tracking-wider text-bone-50 mb-2">
          Scoring your responses
        </h2>
        <p className="font-serif text-bone-200">
          Generating certificate if you've passed. This takes a few seconds.
        </p>
      </div>
    );
  }

  if (step === 'result' && result) {
    return (
      <div className="card-forensic p-8 lg:p-12 max-w-3xl">
        <div
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 mb-6 border-2',
            result.passed
              ? 'border-gold-500 bg-gold-500/10 text-gold-500'
              : 'border-crimson-500 bg-crimson-500/10 text-crimson-400'
          )}
        >
          {result.passed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span className="font-mono text-sm uppercase tracking-wider">
            {result.passed ? 'Passed' : 'Did not pass'}
          </span>
        </div>

        <h2 className="font-mono text-3xl lg:text-4xl font-bold text-bone-50 mb-4 leading-tight">
          {result.passed
            ? `Well done. You scored ${result.score}%.`
            : `You scored ${result.score}%.`}
        </h2>
        <p className="font-serif text-lg text-bone-200 leading-relaxed mb-8">
          {result.correct_count} of {result.total_count} correct. Passing mark:{' '}
          {passingScore}%.
        </p>

        {result.passed && result.is_first_pass && result.cert_uid && (
          <div className="border border-gold-500/40 bg-gold-500/5 p-6 mb-8">
            <Award className="w-8 h-8 text-gold-500 mb-3" />
            <h3 className="font-mono text-lg uppercase tracking-wider text-bone-50 mb-2">
              Certificate issued
            </h3>
            <p className="font-serif text-bone-200 mb-4">
              Your PDF certificate has been emailed to{' '}
              <span className="font-mono text-gold-500">{email}</span>. Save the
              certificate ID below — anyone can use it to verify authenticity.
            </p>
            <div className="font-mono text-sm bg-navy-950 border border-navy-700 px-4 py-3 mb-4">
              <span className="text-bone-300 uppercase text-xs tracking-wider">
                Certificate ID:{' '}
              </span>
              <span className="text-gold-500">{result.cert_uid}</span>
            </div>
            <Link
              href={`/verify/${result.cert_uid}`}
              className="btn-primary"
              target="_blank"
            >
              <Download className="w-4 h-4" />
              View &amp; download certificate
            </Link>
          </div>
        )}

        {result.passed && !result.is_first_pass && (
          <div className="border border-navy-700 p-6 mb-8">
            <p className="font-serif text-bone-200">
              You've already received a certificate for this test on a previous
              attempt — only the first passing attempt issues a new certificate.
            </p>
          </div>
        )}

        {/* ---- Study References (all questions) ---- */}
        {result.review && result.review.length > 0 && (
          <div className="border border-navy-700 p-6 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-gold-500" />
              <h3 className="font-mono text-lg uppercase tracking-wider text-gold-500">
                Study References
              </h3>
            </div>
            <p className="font-serif text-sm text-bone-300 mb-6">
              Each question below shows your answer, the correct answer, and the
              section of the REMA eBook 2026 where the topic is covered. Use this
              to revise the areas where your answer was incorrect.
            </p>

            <ol className="space-y-5">
              {result.review.map((r, idx) => (
                <li
                  key={idx}
                  className={cn(
                    'border-l-2 pl-4 py-1',
                    r.is_correct ? 'border-gold-500/40' : 'border-crimson-500'
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-serif text-bone-100 text-sm leading-snug">
                      <span className="font-mono text-xs text-gold-500 mr-2">
                        Q{idx + 1}.
                      </span>
                      {r.question_text}
                    </span>
                    <span
                      className={cn(
                        'shrink-0 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border',
                        r.is_correct
                          ? 'border-gold-500/40 text-gold-500'
                          : 'border-crimson-500 text-crimson-400'
                      )}
                    >
                      {r.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <div className="font-mono text-xs space-y-1 mb-2 pl-1">
                    {r.user_answer_index !== null && !r.is_correct && (
                      <div className="text-crimson-400">
                        Your answer: (
                        {String.fromCharCode(65 + r.user_answer_index)}){' '}
                        {r.options[r.user_answer_index]}
                      </div>
                    )}
                    {r.user_answer_index === null && (
                      <div className="text-bone-300 italic">
                        You did not answer this question.
                      </div>
                    )}
                    <div className="text-gold-500">
                      Correct answer: (
                      {String.fromCharCode(65 + r.correct_answer_index)}){' '}
                      {r.options[r.correct_answer_index]}
                    </div>
                  </div>

                  {r.ebook_reference && (
                    <div className="font-mono text-xs text-bone-300 italic pl-1">
                      Study: {r.ebook_reference}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              submittedRef.current = false;
              setStep('enroll');
              setEmail('');
              setFullName('');
              setOtp('');
              setAnswers({});
              setQuestions([]);
              setCurrentIdx(0);
              setResult(null);
            }}
            className="btn-ghost"
          >
            Take this test again
          </button>
          <Link href="/tests" className="btn-ghost">
            Browse other tests
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
