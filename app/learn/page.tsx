// app/learn/page.tsx
import Link from 'next/link';
import { ArrowRight, GraduationCap, BookOpen, Play, FileText, Globe, ListChecks } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;
export const metadata = {
  title: 'Learn — UGC 4Q Structured Courses',
  description: 'Structured learning tracks organized by the UGC 4-Quadrant framework.',
};

// Quadrant definitions with CyberDefenders-style solid colors
const QUADRANTS = [
  { q: '1', title: 'e-Tutorial',      desc: 'Video lectures, walkthroughs, animated demos.',                color: '#1B5FA8', icon: Play       },
  { q: '2', title: 'e-Content',       desc: 'Articles, eBook chapters, case studies.',                      color: '#1B7C3E', icon: FileText   },
  { q: '3', title: 'Web Resources',   desc: 'Curated external references, MITRE links, tools.',             color: '#8B5E1A', icon: Globe      },
  { q: '4', title: 'Self-Assessment', desc: 'MCQ tests, practice questions, certificates.',                 color: '#6B3AD4', icon: ListChecks },
];

// Domain → colored tile mapping
const DOMAIN_COLOR: Record<string, string> = {
  'rema':           '#8B5E1A',
  'cloud-security': '#1B5FA8',
  'cloud':          '#1B5FA8',
  'crypto':         '#6B3AD4',
  'webdev':         '#1B7C3E',
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

      {/* ── Header ── */}
      <div className="mb-14 max-w-3xl">
        <p className="eyebrow mb-3">Structured learning · UGC 4-Quadrant model</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4 leading-tight"
          style={{ color: 'hsl(var(--foreground))' }}>
          Learn, by topic.
        </h1>
        <p className="font-serif text-lg leading-relaxed"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          Every topic on this hub is structured around the four pedagogical
          quadrants —{' '}
          <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>e-Tutorial</span>,{' '}
          <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>e-Content</span>,{' '}
          <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>Web Resources</span>, and{' '}
          <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>Self-Assessment</span>.
          Pick a course to begin.
        </p>
      </div>

      {/* ── 4Q explainer — CyberDefenders colored tiles ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {QUADRANTS.map(({ q, title, desc, color, icon: Icon }) => (
          <div key={q} className="card p-6 group">
            {/* Colored solid tile — like CyberDefenders lab tiles */}
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
              style={{ background: color }}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em] mb-1"
              style={{ color }}>
              Quadrant {q}
            </p>
            <h3 className="font-display text-base font-semibold mb-2"
              style={{ color: 'hsl(var(--foreground))' }}>
              {title}
            </h3>
            <p className="text-sm leading-relaxed"
              style={{ color: 'hsl(var(--foreground-muted))' }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* ── Available Courses ── */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold"
          style={{ color: 'hsl(var(--foreground))' }}>
          Available courses
        </h2>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
            No courses published yet.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((c) => {
            const tileColor = DOMAIN_COLOR[c.slug] ?? '#1B5FA8';
            return (
              <Link key={c.id} href={`/learn/${c.slug}`}
                className="card card-interactive p-7 group flex flex-col">
                <div className="flex items-start gap-4 mb-5">
                  {/* Domain colored tile */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: tileColor }}>
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    {c.short_title && (
                      <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em] mb-1"
                        style={{ color: tileColor }}>
                        {c.short_title}
                      </p>
                    )}
                    <h3 className="font-display text-xl font-semibold leading-snug
                      group-hover:text-[hsl(var(--primary))] transition-colors"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {c.title}
                    </h3>
                  </div>
                </div>
                {c.description && (
                  <p className="font-serif text-sm leading-relaxed mb-6"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {c.description}
                  </p>
                )}
                <div className="mt-auto pt-4 flex items-center justify-between"
                  style={{ borderTop: '1px solid hsl(var(--border))' }}>
                  <span className="text-xs inline-flex items-center gap-1.5"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    <BookOpen className="w-3.5 h-3.5" />
                    {(c.units as any[])?.length ?? 0} units
                  </span>
                  <span className="font-sans text-sm font-medium inline-flex items-center gap-1
                    group-hover:gap-2 transition-all"
                    style={{ color: 'hsl(var(--primary))' }}>
                    Open <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
