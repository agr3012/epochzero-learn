// app/learn/[courseSlug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ArrowRight, BookOpen, GraduationCap } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;

interface Props { params: { course: string } }

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase.from('courses').select('title, description')
    .eq('slug', params.course).eq('is_published', true).single();
  if (!data) return { title: 'Course not found' };
  return { title: data.title, description: data.description };
}

const DOMAIN_COLOR: Record<string, string> = {
  'rema': '#8B5E1A', 'cloud-security': '#1B5FA8', 'cloud': '#1B5FA8',
  'crypto': '#6B3AD4', 'webdev': '#1B7C3E',
};

export default async function CoursePage({ params }: Props) {
  const supabase = createClient();
  const { data: course } = await supabase.from('courses').select('*')
    .eq('slug', params.course).eq('is_published', true).single();
  if (!course) notFound();

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
