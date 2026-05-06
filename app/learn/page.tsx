import Link from 'next/link';
import { ArrowRight, GraduationCap, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;
export const metadata = {
  title: 'Learn — UGC 4Q Structured Courses',
  description:
    'Structured learning tracks organized by the UGC 4-Quadrant framework: e-Tutorial, e-Content, Web Resources, and Self-Assessment.',
};

export default async function LearnIndexPage() {
  const supabase = createClient();
  const { data: courses } = await supabase
    .from('courses')
    .select('*, units(id)')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  return (
    <div className="container py-16 lg:py-24">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // Structured learning · UGC 4-Quadrant model
      </div>
      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        Learn, by topic.
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-12">
        Every topic on this hub is structured around the four pedagogical
        quadrants — <strong className="text-gold-500">e-Tutorial</strong>,{' '}
        <strong className="text-gold-500">e-Content</strong>,{' '}
        <strong className="text-gold-500">Web Resources</strong>, and{' '}
        <strong className="text-gold-500">Self-Assessment</strong>. Pick a
        course to begin.
      </p>

      {/* 4Q explainer */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {[
          { q: 'Q1', title: 'e-Tutorial', desc: 'Video lectures, walkthroughs, animated demos.' },
          { q: 'Q2', title: 'e-Content', desc: 'Articles, eBook chapters, case studies.' },
          { q: 'Q3', title: 'Web Resources', desc: 'Curated external references, MITRE links, tools.' },
          { q: 'Q4', title: 'Self-Assessment', desc: 'MCQ tests, practice questions, certificates.' },
        ].map((item) => (
          <div key={item.q} className="card-forensic p-5">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500 mb-2">
              Quadrant {item.q.slice(1)}
            </div>
            <h3 className="font-mono text-lg text-bone-50 mb-2">{item.title}</h3>
            <p className="font-serif text-sm text-bone-200 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Courses */}
      <h2 className="font-mono text-2xl uppercase tracking-wider text-bone-50 mb-6">
        Available courses
      </h2>

      {!courses || courses.length === 0 ? (
        <div className="card-forensic p-12 text-center">
          <p className="font-mono text-sm text-bone-300">
            No courses published yet. Run migration 003 first.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/learn/${c.slug}`}
              className="card-forensic p-8 group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 border border-gold-500/40 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6 text-gold-500" />
                </div>
                <div>
                  {c.short_title && (
                    <span className="font-mono text-xs uppercase tracking-wider text-gold-500">
                      {c.short_title}
                    </span>
                  )}
                  <h3 className="font-mono text-xl text-bone-50 group-hover:text-gold-500 transition-colors leading-tight mt-1">
                    {c.title}
                  </h3>
                </div>
              </div>
              {c.description && (
                <p className="font-serif text-bone-200 leading-relaxed mb-6">
                  {c.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-4 border-t border-navy-700">
                <span className="font-mono text-xs text-bone-300 inline-flex items-center gap-1.5">
                  <BookOpen className="w-3 h-3 text-gold-500" />
                  {(c.units as any[])?.length ?? 0} units
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-gold-500 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Open <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
