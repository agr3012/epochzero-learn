// app/learn/[courseSlug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ArrowRight, BookOpen, GraduationCap, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DOMAIN_COLOR } from '@/lib/colors';
import { getCurrentAccount } from '@/lib/auth';
import { getCourseProgressSummary } from '@/lib/progress';
import { isEnrolledInCourseAny } from '@/lib/enrollment';
import { ProgressDonut } from '@/components/dashboard/ProgressDonut';
import { EnrollButton } from '@/components/enroll-button';

export const dynamic = 'force-dynamic';

interface Props { params: { course: string } }

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase.from('courses').select('title, description')
    .eq('slug', params.course).eq('is_published', true).single();
  if (!data) return { title: 'Course not found' };
  return { title: data.title, description: data.description };
}

export default async function CoursePage({ params }: Props) {
  const supabase = createClient();
  const { data: course } = await supabase.from('courses').select('*')
    .eq('slug', params.course).eq('is_published', true).single();
  if (!course) notFound();

  const account = await getCurrentAccount();
  const [progress, enrolled] = account
    ? await Promise.all([getCourseProgressSummary(account.id, course.id), isEnrolledInCourseAny(account.id, course.id)])
    : [null, false];

  const { data: units } = await supabase.from('units')
    .select('*, topics(id)').eq('course_id', course.id).eq('is_published', true)
    .order('unit_number', { ascending: true });

  const tileColor = DOMAIN_COLOR[course.slug] ?? '#1B5FA8';

  return (
    <div className="container py-12 lg:py-16">

      {/* ── Back link ── */}
      <Link href="/learn"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        <ChevronLeft className="w-4 h-4" />
        All courses
      </Link>

      {/* ── Course header ── */}
      <div className="mb-12 max-w-4xl">
        <div className="flex items-start gap-5 mb-6">
          {/* Domain colored tile */}
          <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: tileColor }}>
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div>
            {course.short_title && (
              <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em] mb-1"
                style={{ color: tileColor }}>
                {course.short_title}
              </p>
            )}
            <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight"
              style={{ color: 'hsl(var(--foreground))' }}>
              {course.title}
            </h1>
          </div>
        </div>
        {course.description && (
          <p className="font-serif text-lg leading-relaxed mb-4"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            {course.description}
          </p>
        )}
        {course.instructor && (
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
            Course Instructor:{' '}
            <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              {course.instructor}
            </span>
          </p>
        )}
      </div>

      {/* ── Sign-in prompt (content itself is open — an account just tracks progress) ── */}
      {!account ? (
        <div className="card-forensic p-8 lg:p-10 max-w-2xl mb-12">
          <h2 className="font-mono text-xl uppercase tracking-wider text-gold-500 mb-2">
            Sign in to track your progress
          </h2>
          <p className="font-serif text-bone-200 mb-8">
            Course content is open to everyone — sign in to save your watch/read progress and unlock module exams.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/login?next=${encodeURIComponent(`/learn/${course.slug}`)}`} className="btn-primary">
              <LogIn className="w-4 h-4" /> Sign in
            </Link>
            <Link href={`/dashboard/register?next=${encodeURIComponent(`/learn/${course.slug}`)}`} className="btn-ghost">
              Create an account
            </Link>
          </div>
        </div>
      ) : progress && (
        <div className="card p-6 rounded-xl mb-12 flex items-center gap-6 flex-wrap">
          <ProgressDonut percent={progress.overallPercent} label="Overall" color={tileColor} />
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Your progress
            </p>
            <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
              {progress.units.filter((u) => u.percent === 100).length} of {progress.units.length} units complete.
            </p>
            {!enrolled && (
              <p className="text-xs mt-1" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                Not in your dashboard's "My Courses" yet — enroll to add it.
              </p>
            )}
          </div>
          {!enrolled && <EnrollButton courseId={course.id} />}
        </div>
      )}

      {/* ── Units section ── */}
      <h2 className="font-display text-xl font-semibold mb-6"
        style={{ color: 'hsl(var(--foreground))' }}>
        Units
      </h2>

      {!units || units.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
            No units published yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {units.map((u) => (
            <Link key={u.id} href={`/learn/${course.slug}/${u.slug}`}
              className="card card-interactive p-5 lg:p-6 group flex items-start gap-5">

              {/* Unit number — colored solid tile (CyberDefenders pattern) */}
              <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center
                font-display font-bold text-xl text-white"
                style={{ background: tileColor }}>
                {String(u.unit_number).padStart(2, '0')}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em] mb-1"
                  style={{ color: tileColor }}>
                  Unit {u.unit_number}
                </p>
                <h3 className="font-display text-lg font-semibold mb-2 leading-snug
                  group-hover:text-[hsl(var(--primary))] transition-colors"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  {u.title}
                </h3>
                {u.description && (
                  <p className="font-serif text-sm leading-relaxed mb-3 line-clamp-2"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {u.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-3"
                  style={{ borderTop: '1px solid hsl(var(--border))' }}>
                  <span className="text-xs inline-flex items-center gap-1.5"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    <BookOpen className="w-3.5 h-3.5" />
                    {(u.topics as any[])?.length ?? 0} topics
                  </span>
                  <span className="font-sans text-sm font-medium inline-flex items-center gap-1
                    group-hover:gap-2 transition-all"
                    style={{ color: 'hsl(var(--primary))' }}>
                    Open unit <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
