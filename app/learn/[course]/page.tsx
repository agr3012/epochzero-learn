import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ArrowRight, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;

interface Props {
  params: { course: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from('courses')
    .select('title, description')
    .eq('slug', params.course)
    .eq('is_published', true)
    .single();
  if (!data) return { title: 'Course not found' };
  return { title: data.title, description: data.description };
}

export default async function CoursePage({ params }: Props) {
  const supabase = createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', params.course)
    .eq('is_published', true)
    .single();

  if (!course) notFound();

  const { data: units } = await supabase
    .from('units')
    .select('*, topics(id)')
    .eq('course_id', course.id)
    .eq('is_published', true)
    .order('unit_number', { ascending: true });

  return (
    <div className="container py-12 lg:py-16">
      <Link
        href="/learn"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-300 hover:text-gold-500 mb-8 transition-colors"
      >
        <ChevronLeft className="w-3 h-3" /> All courses
      </Link>

      <div className="mb-12 max-w-4xl">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
          // {course.short_title ?? 'Course'}
        </div>
        <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
          {course.title}
        </h1>
        {course.description && (
          <p className="font-serif text-xl text-bone-200 leading-relaxed">
            {course.description}
          </p>
        )}
        {course.instructor && (
          <p className="font-mono text-xs text-bone-300 mt-6 uppercase tracking-wider">
            Course Instructor: <span className="text-gold-500">{course.instructor}</span>
          </p>
        )}
      </div>

      <h2 className="font-mono text-2xl uppercase tracking-wider text-bone-50 mb-6">
        Units
      </h2>

      {!units || units.length === 0 ? (
        <div className="card-forensic p-8 text-center">
          <p className="font-mono text-sm text-bone-300">No units published yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {units.map((u) => (
            <Link
              key={u.id}
              href={`/learn/${course.slug}/${u.slug}`}
              className="card-forensic p-6 lg:p-8 group flex items-start gap-6"
            >
              <div className="shrink-0 w-16 h-16 border border-gold-500/40 flex items-center justify-center font-mono text-2xl text-gold-500 bg-navy-950">
                {String(u.unit_number).padStart(2, '0')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500 mb-2">
                  Unit {u.unit_number}
                </div>
                <h3 className="font-mono text-2xl text-bone-50 mb-3 group-hover:text-gold-500 transition-colors leading-tight">
                  {u.title}
                </h3>
                {u.description && (
                  <p className="font-serif text-bone-200 leading-relaxed mb-4 line-clamp-2">
                    {u.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-navy-700">
                  <span className="font-mono text-xs text-bone-300 inline-flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3 text-gold-500" />
                    {(u.topics as any[])?.length ?? 0} topics
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wider text-gold-500 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open unit <ArrowRight className="w-3 h-3" />
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
