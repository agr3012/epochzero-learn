// app/learn/[courseSlug]/[unitSlug]/[topicSlug]/page.tsx
import { type ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft, Play, BookOpen, Globe, ListChecks,
  Target, Clock, ExternalLink, Download, ArrowRight,
  ShieldAlert, Headphones,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDuration, getYouTubeThumbnail } from '@/lib/utils';

export const revalidate = 60;

interface Props { params: { course: string; unit: string; topic: string } }

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data: course } = await supabase.from('courses').select('id').eq('slug', params.course).single();
  if (!course) return { title: 'Not found' };
  const { data: unit } = await supabase.from('units').select('id').eq('course_id', course.id).eq('slug', params.unit).single();
  if (!unit) return { title: 'Not found' };
  const { data: topic } = await supabase.from('topics').select('title, description').eq('unit_id', unit.id).eq('slug', params.topic).single();
  if (!topic) return { title: 'Topic not found' };
  return { title: topic.title, description: topic.description };
}

const DOMAIN_COLOR: Record<string, string> = {
  'rema': '#8B5E1A', 'cloud-security': '#1B5FA8', 'cloud': '#1B5FA8',
  'crypto': '#6B3AD4', 'webdev': '#1B7C3E',
};

// Quadrant section colors
const Q_COLORS = ['#1B5FA8', '#1B7C3E', '#8B5E1A', '#6B3AD4'];

export default async function TopicPage({ params }: Props) {
  const supabase = createClient();

  const { data: course } = await supabase.from('courses').select('*').eq('slug', params.course).eq('is_published', true).single();
  if (!course) notFound();
  const { data: unit } = await supabase.from('units').select('*').eq('course_id', course.id).eq('slug', params.unit).eq('is_published', true).single();
  if (!unit) notFound();
  const { data: topic } = await supabase.from('topics').select('*').eq('unit_id', unit.id).eq('slug', params.topic).eq('is_published', true).single();
  if (!topic) notFound();

  const [videosRes, articlesRes, resourcesRes, linksRes, testsRes] = await Promise.all([
    supabase.from('topic_videos').select('order_index, videos(id, slug, youtube_id, title, description, malware_family, duration_seconds)').eq('topic_id', topic.id).order('order_index', { ascending: true }),
    supabase.from('topic_articles').select('order_index, articles(id, slug, title, excerpt, category, reading_time, published_at)').eq('topic_id', topic.id).order('order_index', { ascending: true }),
    supabase.from('topic_resources').select('order_index, resources(id, slug, type, title, description, file_url, page_count, version)').eq('topic_id', topic.id).order('order_index', { ascending: true }),
    supabase.from('topic_web_links').select('*').eq('topic_id', topic.id).order('order_index', { ascending: true }),
    supabase.from('topic_tests').select('order_index, tests(id, slug, title, description, total_questions, duration_minutes, passing_score, malware_family)').eq('topic_id', topic.id).order('order_index', { ascending: true }),
  ]);

  const videos    = (videosRes.data   ?? []).map((r: any) => r.videos).filter(Boolean);
  const articles  = (articlesRes.data ?? []).map((r: any) => r.articles).filter(Boolean);
  const resources = (resourcesRes.data ?? []).map((r: any) => r.resources).filter(Boolean);
  const webLinks  = linksRes.data ?? [];
  const tests     = (testsRes.data   ?? []).map((r: any) => r.tests).filter(Boolean);
  const podcastLinks  = webLinks.filter((l: any) => l.source_type === 'podcast');
  const externalLinks = webLinks.filter((l: any) => l.source_type !== 'podcast');
  const q3Count = resources.length + webLinks.length;

  const { data: siblingTopics } = await supabase.from('topics').select('slug, title, topic_number').eq('unit_id', unit.id).eq('is_published', true).order('topic_number', { ascending: true });
  const idx = siblingTopics?.findIndex((t) => t.slug === topic.slug) ?? -1;
  const prev = idx > 0 ? siblingTopics![idx - 1] : null;
  const next = idx >= 0 && idx < (siblingTopics?.length ?? 0) - 1 ? siblingTopics![idx + 1] : null;

  const domainColor = DOMAIN_COLOR[course.slug] ?? '#1B5FA8';

  return (
    <div className="container py-12 lg:py-16">

      {/* ── Breadcrumb — sans, clean ── */}
      <nav className="mb-8 flex items-center gap-1.5 flex-wrap text-sm"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        <Link href="/learn" className="hover:text-[hsl(var(--foreground))] transition-colors">
          Learn
        </Link>
        <span>›</span>
        <Link href={`/learn/${course.slug}`} className="hover:text-[hsl(var(--foreground))] transition-colors">
          {course.short_title ?? course.title}
        </Link>
        <span>›</span>
        <Link href={`/learn/${course.slug}/${unit.slug}`} className="hover:text-[hsl(var(--foreground))] transition-colors">
          Unit {unit.unit_number}
        </Link>
        <span>›</span>
        <span style={{ color: 'hsl(var(--foreground))' }}>
          {unit.unit_number}.{topic.topic_number}
        </span>
      </nav>

      {/* ── Header ── */}
      <header className="mb-12 max-w-4xl">
        <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em] mb-3"
          style={{ color: domainColor }}>
          Topic {unit.unit_number}.{topic.topic_number}
        </p>
        <h1 className="font-display text-3xl lg:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'hsl(var(--foreground))' }}>
          {topic.title}
        </h1>
        {topic.description && (
          <p className="font-serif text-lg leading-relaxed mb-5"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            {topic.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm mb-6"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          {topic.estimated_minutes && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              ~{topic.estimated_minutes} min total
            </span>
          )}
          <span>·</span>
          <span>4 quadrants of structured content</span>
        </div>

        {/* Learning objectives */}
        {Array.isArray(topic.learning_objectives) && topic.learning_objectives.length > 0 && (
          <div className="card p-6 mt-4"
            style={{ borderLeft: `3px solid ${domainColor}` }}>
            <div className="inline-flex items-center gap-2 mb-4">
              <Target className="w-4 h-4" style={{ color: domainColor }} />
              <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em]"
                style={{ color: domainColor }}>
                By the end of this topic, you will
              </p>
            </div>
            <ul className="font-serif text-sm space-y-2"
              style={{ color: 'hsl(var(--foreground))' }}>
              {topic.learning_objectives.map((o: string, i: number) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: domainColor }} />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* ── Quadrant nav ── */}
      <nav className="sticky top-16 z-30 -mx-6 px-6 py-3 mb-12"
        style={{
          background: 'hsl(var(--surface)/0.96)',
          borderTop: '1px solid hsl(var(--border))',
          borderBottom: '1px solid hsl(var(--border))',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'q1', label: 'e-Tutorial',      count: videos.length,   color: Q_COLORS[0] },
            { id: 'q2', label: 'e-Content',        count: articles.length, color: Q_COLORS[1] },
            { id: 'q3', label: 'Web Resources',    count: q3Count,         color: Q_COLORS[2] },
            { id: 'q4', label: 'Self-Assessment',  count: tests.length,    color: Q_COLORS[3] },
          ].map((q, i) => (
            <a key={q.id} href={`#${q.id}`}
              className="font-sans text-sm font-medium px-4 py-1.5 rounded-full
                transition-colors inline-flex items-center gap-1.5"
              style={{
                background: `${q.color}18`,
                color: q.color,
                border: `1px solid ${q.color}40`,
                opacity: q.count === 0 ? 0.4 : 1,
                pointerEvents: q.count === 0 ? 'none' : 'auto',
              }}>
              Q{i + 1} · {q.label}
              <span className="font-sans text-xs font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: `${q.color}30`, color: q.color }}>
                {q.count}
              </span>
            </a>
          ))}
        </div>
      </nav>

      {/* ── Q1 e-Tutorial ── */}
      <QuadrantSection id="q1" number={1} title="e-Tutorial" subtitle="Video lectures and walkthroughs" icon={Play}>
        {videos.length === 0 ? (
          <EmptyQ text="No videos linked to this topic yet." />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {videos.map((v: any) => (
              <Link key={v.id} href={`/videos/${v.slug}`} className="group">
                <div className="relative aspect-video overflow-hidden rounded-lg border
                  group-hover:border-[hsl(var(--primary))] transition-colors"
                  style={{ borderColor: 'hsl(var(--border))' }}>
                  <Image src={getYouTubeThumbnail(v.youtube_id, 'maxres')} alt={v.title}
                    fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ background: 'hsl(var(--primary))' }}>
                      <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  {v.malware_family && (
                    <span className="absolute top-3 left-3 badge-malware">
                      <ShieldAlert className="w-3 h-3" />{v.malware_family}
                    </span>
                  )}
                  {v.duration_seconds && (
                    <span className="absolute bottom-3 right-3 font-mono text-xs px-2 py-1 rounded
                      text-white" style={{ background: 'rgba(0,0,0,0.75)' }}>
                      {formatDuration(v.duration_seconds)}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-base font-semibold mt-3 leading-snug
                  group-hover:text-[hsl(var(--primary))] transition-colors"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  {v.title}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </QuadrantSection>

      {/* ── Q2 e-Content ── */}
      <QuadrantSection id="q2" number={2} title="e-Content" subtitle="Articles and case studies" icon={BookOpen}>
        {articles.length === 0 ? (
          <EmptyQ text="No reading material linked to this topic yet." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {articles.map((a: any) => (
              <Link key={a.id} href={`/articles/${a.slug}`}
                className="card card-interactive p-5 group">
                {a.category && (
                  <span className="badge badge-tag mb-3 inline-flex">{a.category}</span>
                )}
                <h5 className="font-display text-base font-semibold mb-2 leading-snug
                  group-hover:text-[hsl(var(--primary))] transition-colors"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  {a.title}
                </h5>
                {a.excerpt && (
                  <p className="font-serif text-sm leading-relaxed line-clamp-2 mb-3"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {a.excerpt}
                  </p>
                )}
                {a.reading_time && (
                  <span className="text-xs inline-flex items-center gap-1"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    <Clock className="w-3 h-3" />{a.reading_time} min read
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </QuadrantSection>

      {/* ── Q3 Web Resources ── */}
      <QuadrantSection id="q3" number={3} title="Web Resources" subtitle="Downloadable material, podcasts, and curated external links" icon={Globe}>
        {q3Count === 0 ? (
          <EmptyQ text="No web resources linked to this topic yet." />
        ) : (
          <div className="space-y-8">
            {resources.length > 0 && (
              <div>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wide mb-4"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  Downloadable material
                </h4>
                {/* 2×2 card grid — each resource as a proper card */}
                <div className="grid sm:grid-cols-2 gap-3">
                  {resources.map((r: any) => {
                    // Use portal slug route; fall back to file_url proxy only if no slug
                    const href = r.slug
                      ? `/resources/${r.slug}`
                      : `/api/pdf/${r.file_url}`;
                    return (
                      <Link key={r.id} href={href}
                        className="card card-interactive p-5 group flex flex-col gap-4">
                        {/* Top: coloured icon + type badge */}
                        <div className="flex items-start justify-between">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: Q_COLORS[2] }}>
                            <Download className="w-5 h-5 text-white" />
                          </div>
                          {r.type && (
                            <span className="badge badge-tag text-[10px]">{r.type}</span>
                          )}
                        </div>
                        {/* Title + version */}
                        <div className="flex-1">
                          <div className="font-display text-sm font-semibold mb-1 leading-snug
                            group-hover:text-[hsl(var(--primary))] transition-colors"
                            style={{ color: 'hsl(var(--foreground))' }}>
                            {r.title}
                          </div>
                          <div className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>
                            {[r.page_count ? `${r.page_count} pages` : null, r.version ? `v${r.version}` : null]
                              .filter(Boolean).join(' · ')}
                          </div>
                        </div>
                        {/* Footer link */}
                        <div className="flex items-center gap-1 text-xs font-semibold mt-auto"
                          style={{ color: Q_COLORS[2] }}>
                          Open resource <ArrowRight className="w-3 h-3" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {podcastLinks.length > 0 && (
              <div>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wide mb-4
                  inline-flex items-center gap-2"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  <Headphones className="w-3.5 h-3.5" /> Podcast episodes
                </h4>
                <div className="space-y-2">
                  {podcastLinks.map((link: any) => (
                    <Link key={link.id} href={link.url}
                      className="card card-interactive flex items-start gap-4 p-4 group">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'hsl(var(--muted))' }}>
                        <Headphones className="w-4 h-4" style={{ color: Q_COLORS[2] }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-sans text-sm font-semibold mb-1
                          group-hover:text-[hsl(var(--primary))] transition-colors"
                          style={{ color: 'hsl(var(--foreground))' }}>
                          {link.title}
                        </div>
                        {link.description && (
                          <p className="font-serif text-sm leading-relaxed"
                            style={{ color: 'hsl(var(--foreground-muted))' }}>
                            {link.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {externalLinks.length > 0 && (
              <div>
                <h4 className="font-sans font-semibold text-xs uppercase tracking-wide mb-4"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  External links
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {externalLinks.map((link: any) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="card card-interactive flex items-start gap-3 p-4 group">
                      <Globe className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: 'hsl(var(--foreground-muted))' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-sans text-sm font-medium leading-snug
                            group-hover:text-[hsl(var(--primary))] transition-colors"
                            style={{ color: 'hsl(var(--foreground))' }}>
                            {link.title}
                          </span>
                          <ExternalLink className="w-3 h-3 shrink-0 mt-0.5"
                            style={{ color: 'hsl(var(--foreground-muted))' }} />
                        </div>
                        {link.description && (
                          <p className="font-serif text-xs leading-relaxed mb-2"
                            style={{ color: 'hsl(var(--foreground-muted))' }}>
                            {link.description}
                          </p>
                        )}
                        {link.source_type && (
                          <span className="badge badge-tag text-[10px]">{link.source_type}</span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </QuadrantSection>

      {/* ── Q4 Self-Assessment ── */}
      <QuadrantSection id="q4" number={4} title="Self-Assessment" subtitle="Test your knowledge — earn a certificate on first pass" icon={ListChecks}>
        {tests.length === 0 ? (
          <EmptyQ text="No assessments published for this topic yet." />
        ) : (
          {/* Compact single-line test rows with exam glyph */}
          <div className="space-y-2">
            {tests.map((t: any) => (
              <Link key={t.id} href={`/tests/${t.slug}`}
                className="card card-interactive flex items-center gap-4 px-5 py-3.5 group">
                {/* Exam icon tile */}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: Q_COLORS[3] }}>
                  <ListChecks className="w-4 h-4 text-white" />
                </div>
                {/* Title */}
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-sm font-semibold truncate
                    group-hover:text-[hsl(var(--primary))] transition-colors"
                    style={{ color: 'hsl(var(--foreground))' }}>
                    {t.title}
                  </div>
                  {t.malware_family && (
                    <span className="badge-malware mt-1 inline-flex text-[10px]">
                      <ShieldAlert className="w-2.5 h-2.5" />{t.malware_family}
                    </span>
                  )}
                </div>
                {/* Meta: Q · min · Pass% */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs shrink-0"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                    {t.total_questions}Q
                  </span>
                  <span>·</span>
                  <span>{t.duration_minutes} min</span>
                  <span>·</span>
                  <span>Pass {t.passing_score}%</span>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0"
                  style={{ color: 'hsl(var(--foreground-subtle))' }} />
              </Link>
            ))}
          </div>
        )}
      </QuadrantSection>

      {/* ── Topic navigation ── */}
      <div className="mt-16 pt-8 grid md:grid-cols-2 gap-4"
        style={{ borderTop: '1px solid hsl(var(--border))' }}>
        {prev ? (
          <Link href={`/learn/${course.slug}/${unit.slug}/${prev.slug}`}
            className="card card-interactive p-5 group">
            <div className="text-xs mb-1 inline-flex items-center gap-1"
              style={{ color: 'hsl(var(--foreground-muted))' }}>
              <ChevronLeft className="w-3 h-3" /> Previous topic
            </div>
            <div className="font-sans text-sm font-medium
              group-hover:text-[hsl(var(--primary))] transition-colors"
              style={{ color: 'hsl(var(--foreground))' }}>
              {unit.unit_number}.{prev.topic_number} · {prev.title}
            </div>
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/learn/${course.slug}/${unit.slug}/${next.slug}`}
            className="card card-interactive p-5 group md:text-right">
            <div className="text-xs mb-1 inline-flex items-center gap-1 md:justify-end md:w-full"
              style={{ color: 'hsl(var(--foreground-muted))' }}>
              Next topic <ArrowRight className="w-3 h-3" />
            </div>
            <div className="font-sans text-sm font-medium
              group-hover:text-[hsl(var(--primary))] transition-colors"
              style={{ color: 'hsl(var(--foreground))' }}>
              {unit.unit_number}.{next.topic_number} · {next.title}
            </div>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}

// ── Quadrant section component ──

function QuadrantSection({ id, number, title, subtitle, icon: Icon, children }: {
  id: string; number: number; title: string; subtitle: string;
  icon: any; children: ReactNode;
}) {
  const color = Q_COLORS[number - 1] ?? Q_COLORS[0];
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <header className="mb-8 flex items-start gap-5 pb-6"
        style={{ borderBottom: '1px solid hsl(var(--border))' }}>
        {/* Solid colored tile */}
        <div className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ background: color }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em] mb-1"
            style={{ color }}>
            Quadrant {number}
          </p>
          <h2 className="font-display text-2xl font-semibold leading-tight"
            style={{ color: 'hsl(var(--foreground))' }}>
            {title}
          </h2>
          <p className="text-sm mt-1" style={{ color: 'hsl(var(--foreground-muted))' }}>
            {subtitle}
          </p>
        </div>
      </header>
      {children}
    </section>
  );
}

function EmptyQ({ text }: { text: string }) {
  return (
    <div className="rounded-lg border-dashed border p-8 text-center"
      style={{ borderColor: 'hsl(var(--border))' }}>
      <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>{text}</p>
    </div>
  );
}
