// app/learn/[courseSlug]/[unitSlug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Clock, ArrowRight, Target, CheckCircle2, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { DOMAIN_COLOR } from '@/lib/colors';
import { getCurrentAccount } from '@/lib/auth';
import { isTopicComplete } from '@/lib/progress';

export const dynamic = 'force-dynamic';

interface Props { params: { course: string; unit: string } }

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data: course } = await supabase.from('courses').select('id')
    .eq('slug', params.course).single();
  if (!course) return { title: 'Not found' };
  const { data: unit } = await supabase.from('units').select('title, description')
    .eq('course_id', course.id).eq('slug', params.unit).single();
  if (!unit) return { title: 'Unit not found' };
  return { title: unit.title, description: unit.description };
}

export default async function UnitPage({ params }: Props) {
  const supabase = createClient();
  const { data: course } = await supabase.from('courses').select('*')
    .eq('slug', params.course).eq('is_published', true).single();
  if (!course) notFound();

  const { data: unit } = await supabase.from('units').select('*')
    .eq('course_id', course.id).eq('slug', params.unit).eq('is_published', true).single();
  if (!unit) notFound();

  const account = await getCurrentAccount();

  const { data: topics } = await supabase.from('topics').select('*')
    .eq('unit_id', unit.id).eq('is_published', true).order('topic_number', { ascending: true });

  const tileColor = DOMAIN_COLOR[course.slug] ?? '#1B5FA8';

  const completedTopicIds = account && topics
    ? new Set(
        (await Promise.all(topics.map(async (t) => ((await isTopicComplete(account.id, t.id)) ? t.id : null))))
          .filter((id): id is string => id !== null)
      )
    : new Set<string>();

  return (
    <div className="container py-12 lg:py-16">

      {/* ── Back link ── */}
      <Link href={`/learn/${course.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        <ChevronLeft className="w-4 h-4" />
        {course.short_title ?? 'Course'} units
      </Link>

      {/* ── Unit header ── */}
      <div className="mb-12 max-w-4xl">
        <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em] mb-3"
          style={{ color: tileColor }}>
          Unit {unit.unit_number} of {course.short_title ?? 'Course'}
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'hsl(var(--foreground))' }}>
          {unit.title}
        </h1>
        {unit.description && (
          <p className="font-serif text-lg leading-relaxed mb-6"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            {unit.description}
          </p>
        )}

        {/* Learning outcomes */}
        {Array.isArray(unit.learning_outcomes) && unit.learning_outcomes.length > 0 && (
          <div className="card p-6 mt-6"
            style={{ borderLeft: `3px solid ${tileColor}` }}>
            <div className="inline-flex items-center gap-2 mb-4">
              <Target className="w-4 h-4" style={{ color: tileColor }} />
              <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em]"
                style={{ color: tileColor }}>
                Learning outcomes
              </p>
            </div>
            <ul className="font-serif text-sm space-y-2"
              style={{ color: 'hsl(var(--foreground))' }}>
              {unit.learning_outcomes.map((o: string, i: number) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: tileColor }} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Sign-in prompt (content itself is open — an account just tracks progress) ── */}
      {!account && (
        <div className="card-forensic p-8 lg:p-10 max-w-2xl mb-12">
          <h2 className="font-mono text-xl uppercase tracking-wider text-gold-500 mb-2">
            Sign in to track your progress
          </h2>
          <p className="font-serif text-bone-200 mb-8">
            Topics are open to everyone — sign in to save your watch/read progress and unlock module exams.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/login?next=${encodeURIComponent(`/learn/${course.slug}/${unit.slug}`)}`} className="btn-primary">
              <LogIn className="w-4 h-4" /> Sign in
            </Link>
            <Link href={`/dashboard/register?next=${encodeURIComponent(`/learn/${course.slug}/${unit.slug}`)}`} className="btn-ghost">
              Create an account
            </Link>
          </div>
        </div>
      )}

      {/* ── Topics ── */}
      <h2 className="font-display text-xl font-semibold mb-5"
        style={{ color: 'hsl(var(--foreground))' }}>
        Topics
      </h2>

      {!topics || topics.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
            No topics published in this unit yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {topics.map((t) => (
            <Link key={t.id}
              href={`/learn/${course.slug}/${unit.slug}/${t.slug}`}
              className="card card-interactive p-5 group block">
              <div className="flex items-center gap-5">
                {/* Topic number — rounded pill */}
                <span className="shrink-0 font-sans font-semibold text-sm
                  px-3 py-1 rounded-full"
                  style={{
                    background: `${tileColor}20`,
                    color: tileColor,
                    border: `1px solid ${tileColor}40`,
                  }}>
                  {unit.unit_number}.{t.topic_number}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-semibold leading-snug
                    group-hover:text-[hsl(var(--primary))] transition-colors flex items-center gap-2"
                    style={{ color: 'hsl(var(--foreground))' }}>
                    {t.title}
                    {completedTopicIds.has(t.id) && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
                        style={{ background: 'rgba(27,124,62,0.10)', color: '#22c55e' }}>
                        <CheckCircle2 className="w-3 h-3" /> Complete
                      </span>
                    )}
                  </h3>
                  {t.description && (
                    <p className="text-sm mt-0.5 line-clamp-1"
                      style={{ color: 'hsl(var(--foreground-muted))' }}>
                      {t.description}
                    </p>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-4 shrink-0">
                  {t.estimated_minutes && (
                    <span className="text-xs inline-flex items-center gap-1.5"
                      style={{ color: 'hsl(var(--foreground-muted))' }}>
                      <Clock className="w-3 h-3" />
                      {t.estimated_minutes} min
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    style={{ color: 'hsl(var(--primary))' }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
