import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Play,
  BookOpen,
  Globe,
  ListChecks,
  Target,
  Clock,
  ExternalLink,
  Download,
  ArrowRight,
  ShieldAlert,
  Headphones,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDuration, getYouTubeThumbnail } from '@/lib/utils';

export const revalidate = 60;

interface Props {
  params: { course: string; unit: string; topic: string };
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
    .select('id')
    .eq('course_id', course.id)
    .eq('slug', params.unit)
    .single();
  if (!unit) return { title: 'Not found' };
  const { data: topic } = await supabase
    .from('topics')
    .select('title, description')
    .eq('unit_id', unit.id)
    .eq('slug', params.topic)
    .single();
  if (!topic) return { title: 'Topic not found' };
  return { title: topic.title, description: topic.description };
}

export default async function TopicPage({ params }: Props) {
  const supabase = createClient();

  // Resolve course -> unit -> topic
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

  const { data: topic } = await supabase
    .from('topics')
    .select('*')
    .eq('unit_id', unit.id)
    .eq('slug', params.topic)
    .eq('is_published', true)
    .single();
  if (!topic) notFound();

  // Pull all four quadrants in parallel
  const [videosRes, articlesRes, resourcesRes, linksRes, testsRes] = await Promise.all([
    supabase
      .from('topic_videos')
      .select(
        'order_index, videos(id, slug, youtube_id, title, description, malware_family, duration_seconds)'
      )
      .eq('topic_id', topic.id)
      .order('order_index', { ascending: true }),
    supabase
      .from('topic_articles')
      .select(
        'order_index, articles(id, slug, title, excerpt, category, reading_time, published_at)'
      )
      .eq('topic_id', topic.id)
      .order('order_index', { ascending: true }),
    supabase
      .from('topic_resources')
      .select(
        'order_index, resources(id, slug, type, title, description, file_url, page_count, version)'
      )
      .eq('topic_id', topic.id)
      .order('order_index', { ascending: true }),
    supabase
      .from('topic_web_links')
      .select('*')
      .eq('topic_id', topic.id)
      .order('order_index', { ascending: true }),
    supabase
      .from('topic_tests')
      .select(
        'order_index, tests(id, slug, title, description, total_questions, duration_minutes, passing_score, malware_family)'
      )
      .eq('topic_id', topic.id)
      .order('order_index', { ascending: true }),
  ]);

  const videos    = (videosRes.data   || []).map((r: any) => r.videos).filter(Boolean);
  const articles  = (articlesRes.data || []).map((r: any) => r.articles).filter(Boolean);
  const resources = (resourcesRes.data || []).map((r: any) => r.resources).filter(Boolean);
  const webLinks  = linksRes.data || [];
  const tests     = (testsRes.data   || []).map((r: any) => r.tests).filter(Boolean);

  // Split web links: our podcast vs third-party external
  const podcastLinks  = webLinks.filter((l: any) => l.source_type === 'podcast');
  const externalLinks = webLinks.filter((l: any) => l.source_type !== 'podcast');

  // Q3 total count for header badge
  const q3Count = resources.length + webLinks.length;

  // Adjacent topics for nav
  const { data: siblingTopics } = await supabase
    .from('topics')
    .select('slug, title, topic_number')
    .eq('unit_id', unit.id)
    .eq('is_published', true)
    .order('topic_number', { ascending: true });
  const idx = siblingTopics?.findIndex((t) => t.slug === topic.slug) || -1;
  const prev = idx > 0 ? siblingTopics![idx - 1] : null;
  const next =
    idx >= 0 && idx < (siblingTopics?.length || 0) - 1 ? siblingTopics![idx + 1] : null;

  return (
    <div className="container py-12 lg:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 font-sans text-xs uppercase tracking-wider text-[hsl(var(--foreground-muted))] flex items-center gap-2 flex-wrap">
        <Link href="/learn" className="hover:text-[hsl(var(--primary))] transition-colors">
          Learn
        </Link>
        <span>/</span>
        <Link href={`/learn/${course.slug}`} className="hover:text-[hsl(var(--primary))] transition-colors">
          {course.short_title || course.title}
        </Link>
        <span>/</span>
        <Link
          href={`/learn/${course.slug}/${unit.slug}`}
          className="hover:text-[hsl(var(--primary))] transition-colors"
        >
          Unit {unit.unit_number}
        </Link>
        <span>/</span>
        <span className="text-[hsl(var(--primary))]">
          {unit.unit_number}.{topic.topic_number}
        </span>
      </nav>

      {/* Header */}
      <header className="mb-12 max-w-4xl">
        <div className="font-sans eyebrow mb-4">
          // Topic {unit.unit_number}.{topic.topic_number}
        </div>
        <h1 className="font-sans text-3xl lg:text-5xl font-bold text-[hsl(var(--foreground))] mb-4 leading-tight">
          {topic.title}
        </h1>
        {topic.description && (
          <p className="font-serif text-lg lg:text-xl text-[hsl(var(--foreground-muted))] leading-relaxed mb-6">
            {topic.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 font-sans text-xs text-[hsl(var(--foreground-muted))] mb-6">
          {topic.estimated_minutes && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[hsl(var(--primary))]" />
              ~{topic.estimated_minutes} min total
            </span>
          )}
          <span>-</span>
          <span>4 quadrants of structured content</span>
        </div>

        {Array.isArray(topic.learning_objectives) && topic.learning_objectives.length > 0 && (
          <div className="border-l-2 border-[hsl(var(--primary))] pl-6 py-2 bg-[hsl(var(--muted))]/50 mt-6">
            <div className="font-sans text-xs uppercase tracking-[0.2em] text-[hsl(var(--primary))] mb-3 inline-flex items-center gap-2">
              <Target className="w-3 h-3" />
              By the end of this topic, you will
            </div>
            <ul className="font-serif text-[hsl(var(--foreground))] space-y-2">
              {topic.learning_objectives.map((o: string, i: number) => (
                <li key={i} className="flex gap-2">
                  <span className="text-[hsl(var(--primary))]">-</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* Quadrant nav */}
      <nav className="sticky top-16 z-30 -mx-6 px-6 py-3 mb-12 bg-[hsl(var(--surface))]/90 backdrop-blur-md border-y border-[hsl(var(--border))]">
        <div className="flex flex-wrap gap-2 font-sans text-xs uppercase tracking-wider">
          <a
            href="#q1"
            className={`px-3 py-1.5 border transition-colors ${
              videos.length > 0
                ? 'border-[hsl(var(--primary))]/40 text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))] opacity-50'
            }`}
          >
            Q1 - e-Tutorial ({videos.length})
          </a>
          <a
            href="#q2"
            className={`px-3 py-1.5 border transition-colors ${
              articles.length > 0
                ? 'border-[hsl(var(--primary))]/40 text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))] opacity-50'
            }`}
          >
            Q2 - e-Content ({articles.length})
          </a>
          <a
            href="#q3"
            className={`px-3 py-1.5 border transition-colors ${
              q3Count > 0
                ? 'border-[hsl(var(--primary))]/40 text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))] opacity-50'
            }`}
          >
            Q3 - Web Resources ({q3Count})
          </a>
          <a
            href="#q4"
            className={`px-3 py-1.5 border transition-colors ${
              tests.length > 0
                ? 'border-[hsl(var(--primary))]/40 text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--foreground-muted))] opacity-50'
            }`}
          >
            Q4 - Self-Assessment ({tests.length})
          </a>
        </div>
      </nav>

      {/* ============== Q1  -  e-TUTORIAL ============== */}
      <Quadrant id="q1" number="1" title="e-Tutorial" subtitle="Video lectures and walkthroughs" icon={Play}>
        {videos.length === 0 ? (
          <EmptyQuadrant text="No videos linked to this topic yet." />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {videos.map((v: any) => (
              <Link key={v.id} href={`/videos/${v.slug}`} className="group">
                <div className="relative aspect-video overflow-hidden border border-[hsl(var(--border))] group-hover:border-[hsl(var(--primary))] transition-colors">
                  <Image
                    src={getYouTubeThumbnail(v.youtube_id, 'maxres')}
                    alt={v.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-gold-500 flex items-center justify-center">
                      <Play className="w-7 h-7 text-navy-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                  {v.malware_family && (
                    <span className="absolute top-3 left-3 badge-malware">
                      <ShieldAlert className="w-3 h-3" />
                      {v.malware_family}
                    </span>
                  )}
                  {v.duration_seconds && (
                    <span className="absolute bottom-3 right-3 px-2 py-1 bg-[hsl(var(--surface))]/90 border border-[hsl(var(--border))] font-sans text-xs text-[hsl(var(--foreground))]">
                      {formatDuration(v.duration_seconds)}
                    </span>
                  )}
                </div>
                <h3 className="font-sans text-base text-[hsl(var(--foreground))] mt-3 group-hover:text-[hsl(var(--primary))] transition-colors">
                  {v.title}
                </h3>
              </Link>
            ))}
          </div>
        )}
      </Quadrant>

      {/* ============== Q2  -  e-CONTENT ============== */}
      <Quadrant id="q2" number="2" title="e-Content" subtitle="Articles and case studies" icon={BookOpen}>
        {articles.length === 0 ? (
          <EmptyQuadrant text="No reading material linked to this topic yet." />
        ) : (
          <div>
            <div className="grid md:grid-cols-2 gap-4">
              {articles.map((a: any) => (
                <Link key={a.id} href={`/articles/${a.slug}`} className="card p-5 group">
                  {a.category && <span className="badge-tag mb-3 inline-block">{a.category}</span>}
                  <h5 className="font-sans text-base text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors leading-tight">
                    {a.title}
                  </h5>
                  {a.excerpt && (
                    <p className="font-serif text-sm text-[hsl(var(--foreground-muted))] leading-relaxed line-clamp-2 mb-3">
                      {a.excerpt}
                    </p>
                  )}
                  {a.reading_time && (
                    <span className="font-sans text-xs text-[hsl(var(--foreground-muted))] inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {a.reading_time} min read
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </Quadrant>

      {/* ============== Q3  -  WEB RESOURCES ============== */}
      <Quadrant id="q3" number="3" title="Web Resources" subtitle="Downloadable material, podcast episodes, and curated external links" icon={Globe}>
        {q3Count === 0 ? (
          <EmptyQuadrant text="No web resources linked to this topic yet." />
        ) : (
          <div className="space-y-8">

            {/* Downloadable reference material */}
            {resources.length > 0 && (
              <div>
                <h4 className="font-sans text-sm uppercase tracking-wider text-[hsl(var(--primary))] mb-4">
                  Downloadable reference material
                </h4>
                <div className="space-y-3">
                  {resources.map((r: any) => (
                    <a
                      key={r.id}
                      href={r.slug ? `/resources/${r.slug}` : `/api/pdf/${r.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-colors group"
                    >
                      <div className="w-10 h-10 border border-[hsl(var(--primary))]/40 flex items-center justify-center shrink-0">
                        <Download className="w-4 h-4 text-[hsl(var(--primary))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-sans text-sm text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                          {r.title}
                        </div>
                        <div className="font-sans text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                          {r.type}{r.page_count ? ` - ${r.page_count} ? `${r.page_count} pages` : ''}{' '}
                          {r.version ? ` - v${r.version}` : ''}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Podcast episodes  -  internal EpochZero content, uses Link not <a> */}
            {podcastLinks.length > 0 && (
              <div>
                <h4 className="font-sans text-sm uppercase tracking-wider text-[hsl(var(--primary))] mb-4 inline-flex items-center gap-2">
                  <Headphones className="w-3.5 h-3.5" />
                  Podcast episodes
                </h4>
                <div className="space-y-3">
                  {podcastLinks.map((link: any) => (
                    <Link
                      key={link.id}
                      href={link.url}
                      className="flex items-start gap-4 p-4 border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-colors group"
                    >
                      <div className="w-10 h-10 border border-[hsl(var(--primary))]/40 bg-[hsl(var(--muted))] flex items-center justify-center shrink-0">
                        <Headphones className="w-4 h-4 text-[hsl(var(--primary))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-sans text-sm text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors mb-1">
                          {link.title}
                        </div>
                        {link.description && (
                          <p className="font-serif text-sm text-[hsl(var(--foreground-muted))] leading-relaxed">
                            {link.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* External links  -  third-party references and tools */}
            {externalLinks.length > 0 && (
              <div>
                <h4 className="font-sans text-sm uppercase tracking-wider text-[hsl(var(--primary))] mb-4">
                  External links
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {externalLinks.map((link: any) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))] transition-colors group"
                    >
                      <Globe className="w-4 h-4 text-[hsl(var(--primary))] mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-sans text-sm text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors leading-tight">
                            {link.title}
                          </span>
                          <ExternalLink className="w-3 h-3 text-[hsl(var(--foreground-muted))] shrink-0 mt-0.5" />
                        </div>
                        {link.description && (
                          <p className="font-serif text-sm text-[hsl(var(--foreground-muted))] leading-relaxed mb-2">
                            {link.description}
                          </p>
                        )}
                        {link.source_type && (
                          <span className="badge-tag text-[10px]">{link.source_type}</span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </Quadrant>

      {/* ============== Q4  -  SELF-ASSESSMENT ============== */}
      <Quadrant id="q4" number="4" title="Self-Assessment" subtitle="Test your knowledge  -  earn a certificate on first pass" icon={ListChecks}>
        {tests.length === 0 ? (
          <EmptyQuadrant text="No assessments published for this topic yet." />
        ) : (
          <div className="space-y-4">
            {tests.map((t: any) => (
              <Link
                key={t.id}
                href={`/tests/${t.slug}`}
                className="card p-6 lg:p-8 group flex flex-col md:flex-row md:items-center md:justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {t.malware_family && (
                      <span className="badge-malware">
                        <ShieldAlert className="w-3 h-3" />
                        {t.malware_family}
                      </span>
                    )}
                  </div>
                  <h3 className="font-sans text-xl text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                    {t.title}
                  </h3>
                  {t.description && (
                    <p className="font-serif text-[hsl(var(--foreground-muted))] leading-relaxed line-clamp-2">
                      {t.description}
                    </p>
                  )}
                </div>
                <div className="flex md:flex-col gap-4 md:items-end font-sans text-xs text-[hsl(var(--foreground-muted))] shrink-0">
                  <span>{t.total_questions} questions</span>
                  <span>{t.duration_minutes} min</span>
                  <span>Pass: {t.passing_score}%</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Quadrant>

      {/* Topic navigation */}
      <div className="mt-16 pt-8 border-t border-[hsl(var(--border))] grid md:grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`/learn/${course.slug}/${unit.slug}/${prev.slug}`}
            className="card p-5 group"
          >
            <div className="font-sans text-xs uppercase tracking-wider text-[hsl(var(--foreground-muted))] mb-1 inline-flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Previous topic
            </div>
            <div className="font-sans text-base text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
              {unit.unit_number}.{prev.topic_number} {prev.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/learn/${course.slug}/${unit.slug}/${next.slug}`}
            className="card p-5 group md:text-right"
          >
            <div className="font-sans text-xs uppercase tracking-wider text-[hsl(var(--foreground-muted))] mb-1 inline-flex items-center gap-1 md:justify-end md:w-full">
              Next topic <ArrowRight className="w-3 h-3" />
            </div>
            <div className="font-sans text-base text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
              {unit.unit_number}.{next.topic_number} {next.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------
// Quadrant section wrapper
// ---------------------------------------------------------------------
function Quadrant({
  id, number, title, subtitle, icon: Icon, children,
}: {
  id: string; number: string; title: string; subtitle: string; icon: any; children: any;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-32">
      <header className="mb-8 flex items-start gap-5 pb-5 border-b border-[hsl(var(--border))]">
        <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: Q_COLORS[parseInt(number, 10) - 1] || Q_COLORS[0] }}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: Q_COLORS[parseInt(number, 10) - 1] || Q_COLORS[0] }}>
            Quadrant {number}
          </div>
          <h2 className="font-display text-2xl lg:text-3xl mt-1 leading-tight" style={{ color: "hsl(var(--foreground))" }}>
            {title}
          </h2>
          <p className="font-serif text-[hsl(var(--foreground-muted))] mt-1">{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

function EmptyQuadrant({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-[hsl(var(--border))] p-8 text-center">
      <p className="font-sans text-sm text-[hsl(var(--foreground-muted))]">{text}</p>
    </div>
  );
}
