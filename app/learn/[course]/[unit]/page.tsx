import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Clock, ArrowRight, Target } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;

interface Props {
  params: { course: string; unit: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', params.course)
    .single();
  if (!course) return { title: 'Not found' };
  const { data: unit } = await supabase
    .from('units')
    .select('title, description')
    .eq('course_id', course.id)
    .eq('slug', params.unit)
    .single();
  if (!unit) return { title: 'Unit not found' };
  return { title: unit.title, description: unit.description };
}

export default async function UnitPage({ params }: Props) {
  const supabase = createClient();
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', params.course)
    .eq('is_published', true)
    .single();
  if (!course) notFound();

  const { data: unit } = await supabase
    .from('units')
    .select('*')
    .eq('course_id', course.id)
    .eq('slug', params.unit)
    .eq('is_published', true)
    .single();
  if (!unit) notFound();

  const { data: topics } = await supabase
    .from('topics')
    .select('*')
    .eq('unit_id', unit.id)
    .eq('is_published', true)
    .order('topic_number', { ascending: true });

  return (
    <div className="container py-12 lg:py-16">
      <Link
        href={`/learn/${course.slug}`}
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-300 hover:text-gold-500 mb-8 transition-colors"
      >
        <ChevronLeft className="w-3 h-3" /> {course.short_title ?? 'Course'} units
      </Link>

      <div className="mb-12 max-w-4xl">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
          // Unit {unit.unit_number} of {course.short_title ?? 'Course'}
        </div>
        <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
          {unit.title}
        </h1>
        {unit.description && (
          <p className="font-serif text-xl text-bone-200 leading-relaxed mb-6">
            {unit.description}
          </p>
        )}
        {Array.isArray(unit.learning_outcomes) && unit.learning_outcomes.length > 0 && (
          <div className="border-l-2 border-gold-500 pl-6 py-2 bg-navy-800/50 mt-6">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500 mb-3 inline-flex items-center gap-2">
              <Target className="w-3 h-3" />
              Learning outcomes
            </div>
            <ul className="font-serif text-bone-200 space-y-2">
              {unit.learning_outcomes.map((o: string, i: number) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gold-500">·</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <h2 className="font-mono text-2xl uppercase tracking-wider text-bone-50 mb-6">
        Topics
      </h2>

      {!topics || topics.length === 0 ? (
        <div className="card-forensic p-8 text-center">
          <p className="font-mono text-sm text-bone-300">
            No topics published in this unit yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((t) => (
            <Link
              key={t.id}
              href={`/learn/${course.slug}/${unit.slug}/${t.slug}`}
              className="block card-forensic p-5 lg:p-6 group"
            >
              <div className="flex items-center gap-6">
                <span className="shrink-0 font-mono text-sm text-gold-500 border border-gold-500/40 px-3 py-1.5">
                  {unit.unit_number}.{t.topic_number}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-mono text-lg text-bone-50 group-hover:text-gold-500 transition-colors leading-tight">
                    {t.title}
                  </h3>
                  {t.description && (
                    <p className="font-serif text-sm text-bone-200 leading-relaxed mt-1 line-clamp-1">
                      {t.description}
                    </p>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-4 font-mono text-xs text-bone-300 shrink-0">
                  {t.estimated_minutes && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {t.estimated_minutes} min
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-gold-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
