// app/learn/page.tsx
import Link from 'next/link';
import { Play, FileText, Globe, ListChecks, ArrowRight, GraduationCap } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;
export const metadata = {
  title: 'Learn -- UGC 4Q Structured Courses',
  description: 'Structured learning tracks organised by the UGC 4-Quadrant framework.',
};

interface Props { searchParams: { domain?: string } }

const DOMAIN_META: Record<string, { label: string; color: string }> = {
  rema:   { label: 'REMA',   color: '#8B5E1A' },
  cloud:  { label: 'Cloud',  color: '#1B5FA8' },
  crypto: { label: 'Crypto', color: '#6B3AD4' },
  webdev: { label: 'Web Dev',color: '#1B7C3E' },
};

const Q_ITEMS = [
  { q: '1', label: 'e-Tutorial',     icon: Play,        desc: 'Video lectures, walkthroughs, and animated explanations.', color: '#1B5FA8' },
  { q: '2', label: 'e-Content',      icon: FileText,    desc: 'Articles, eBook chapters, and written case studies.',       color: '#1B7C3E' },
  { q: '3', label: 'Web Resources',  icon: Globe,       desc: 'Curated references, MITRE links, tools, and downloads.',    color: '#8B5E1A' },
  { q: '4', label: 'Self-Assessment',icon: ListChecks,  desc: 'MCQ tests with verifiable PDF certificates on first pass.', color: '#6B3AD4' },
];

export default async function LearnIndexPage({ searchParams }: Props) {
  const supabase = createClient();
  const { data: allCourses } = await supabase
    .from('courses').select('*, units(id)')
    .eq('is_published', true).order('order_index', { ascending: true });

  const domain  = searchParams.domain ?? null;
  const courses = domain
    ? (allCourses ?? []).filter((c: any) =>
        // Match by domain field OR by course slug starting with domain key
        c.domain === domain || c.slug?.startsWith(domain) || c.slug === domain
      )
    : (allCourses ?? []);

  return (
    <div className="container py-12 lg:py-16">

      {/* Header */}
      <div className="mb-12">
        <p className="eyebrow mb-3">Structured learning -- UGC 4-Quadrant model</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4 leading-tight"
          style={{ color: 'hsl(var(--foreground))' }}>
          {domain && DOMAIN_META[domain]
            ? <>{DOMAIN_META[domain].label} <span style={{ color: DOMAIN_META[domain].color }}>courses</span></>
            : <>Learn, <span style={{ color: 'hsl(var(--primary))' }}>by topic.</span></>}
        </h1>
        <p className="font-serif text-lg max-w-2xl leading-relaxed"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          Every topic is structured across <strong style={{ color: '#1B5FA8' }}>e-Tutorial</strong>,{' '}
          <strong style={{ color: '#1B7C3E' }}>e-Content</strong>,{' '}
          <strong style={{ color: '#8B5E1A' }}>Web Resources</strong>, and{' '}
          <strong style={{ color: '#6B3AD4' }}>Self-Assessment</strong>.
          Pick a course to begin.
        </p>
      </div>

      {/* 4Q explainer boxes -- fade + scale on hover */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {Q_ITEMS.map(({ q, label, icon: Icon, desc, color }, i) => (
          <div key={q}
            className="card p-6 group cursor-default transition-all duration-300
              hover:scale-[1.03] hover:-translate-y-0.5"
            style={{
              borderTop: `3px solid ${color}`,
              animationDelay: `${i * 80}ms`,
              animationFillMode: 'both',
            }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: color }}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] mb-1"
              style={{ color }}>
              Quadrant {q}
            </div>
            <h3 className="font-display text-base font-semibold mb-2"
              style={{ color: 'hsl(var(--foreground))' }}>
              {label}
            </h3>
            <p className="font-serif text-sm leading-relaxed"
              style={{ color: 'hsl(var(--foreground-muted))' }}>
              {desc}
            </p>
          </div>
        ))}
      </div>

      {/* Domain filter -- only show when no domain pre-selected */}
      {!domain && (
        <div className="flex flex-wrap gap-2 mb-8">
          {Object.entries(DOMAIN_META).map(([slug, { label, color }]) => (
            <Link key={slug} href={`/learn?domain=${slug}`}
              className="font-sans text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
              style={{
                background: `${color}14`,
                color,
                border: `1px solid ${color}45`,
              }}>
              {label}
            </Link>
          ))}
        </div>
      )}

      {/* Courses */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold"
          style={{ color: 'hsl(var(--foreground))' }}>
          {domain && DOMAIN_META[domain] ? `${DOMAIN_META[domain].label} courses` : 'Available courses'}
        </h2>
        {domain && (
          <Link href="/learn" className="text-sm font-medium hover:underline"
            style={{ color: 'hsl(var(--primary))' }}>
            All domains
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="card p-12 text-center">
          <GraduationCap className="w-8 h-8 mx-auto mb-3"
            style={{ color: 'hsl(var(--foreground-subtle))' }} />
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
            No courses published in this domain yet.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {courses.map((c: any) => {
            const meta = DOMAIN_META[c.domain ?? ''];
            return (
              <Link key={c.id} href={`/learn/${c.slug}`}
                className="card card-interactive p-7 group flex gap-5 items-start">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: meta?.color ?? '#8B5E1A' }}>
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {c.short_title && (
                    <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] mb-1"
                      style={{ color: meta?.color ?? 'hsl(var(--primary))' }}>
                      {c.domain?.toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-display text-xl font-semibold mb-2 leading-snug
                    group-hover:text-[hsl(var(--primary))] transition-colors"
                    style={{ color: 'hsl(var(--foreground))' }}>
                    {c.title}
                  </h3>
                  {c.description && (
                    <p className="font-serif text-sm leading-relaxed mb-4"
                      style={{ color: 'hsl(var(--foreground-muted))' }}>
                      {c.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs"
                    style={{ color: 'hsl(var(--foreground-subtle))' }}>
                    <span>{(c.units as any[])?.length ?? 0} units</span>
                    <span className="flex items-center gap-1 font-medium group-hover:gap-2 transition-all"
                      style={{ color: meta?.color ?? 'hsl(var(--primary))' }}>
                      Start learning <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
