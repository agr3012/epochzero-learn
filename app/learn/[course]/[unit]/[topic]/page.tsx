import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  Video,
  Globe,
  ClipboardCheck,
  Download,
  Headphones,
  ExternalLink,
  ChevronRight,
  Clock,
} from 'lucide-react'

/* ─── Types ─────────────────────────────────────────────── */

interface TopicObjective {
  id: string
  text: string
  sort_order: number
}

interface VideoItem {
  id: string
  title: string
  slug: string
}

interface ArticleItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  read_time: number | null
}

interface ResourceItem {
  id: string
  title: string
  slug: string
  resource_type: string
  version: string
}

interface PodcastItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
}

interface ExternalLinkItem {
  id: string
  label: string
  url: string
  description: string | null
  link_type: string | null
}

interface TestItem {
  id: string
  title: string
  slug: string
  description: string | null
  question_count: number
  duration_minutes: number
  passing_score: number
}

/* ─── Helpers ───────────────────────────────────────────── */

function resourceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    'ebook': 'eBook',
    'cheatsheet': 'Cheatsheet',
    'mcq-bank': 'MCQ Bank',
    'question-bank': 'Question Bank',
  }
  return map[type] ?? type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

/* ─── Page ──────────────────────────────────────────────── */

export default async function TopicPage({
  params,
}: {
  params: { course: string; unit: string; topic: string }
}) {
  const supabase = createClient()

  // ── Core: topic (no embedded joins — keeps query safe) ──
  const { data: topic, error: topicError } = await supabase
    .from('topics')
    .select('id, title, slug, description, estimated_minutes, topic_number')
    .eq('slug', params.topic)
    .single()

  if (topicError || !topic) return notFound()

  // ── Core: unit ──────────────────────────────────────────
  const { data: unit, error: unitError } = await supabase
    .from('units')
    .select('id, title, slug, unit_number')
    .eq('slug', params.unit)
    .single()

  if (unitError || !unit) return notFound()

  // ── Core: course ─────────────────────────────────────────
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, slug')
    .eq('slug', params.course)
    .single()

  if (courseError || !course) return notFound()

  // ── Learning objectives (separate query — fails gracefully) ──
  const { data: rawObjectives } = await supabase
    .from('topic_objectives')
    .select('id, text, sort_order')
    .eq('topic_id', topic.id)
    .order('sort_order')

  const objectives: TopicObjective[] = (rawObjectives ?? []) as TopicObjective[]

  // ── Q1: Videos ───────────────────────────────────────────
  const { data: rawVideos } = await supabase
    .from('topic_videos')
    .select('sort_order, videos(id, title, slug)')
    .eq('topic_id', topic.id)
    .order('sort_order')

  // ── Q2: Articles ─────────────────────────────────────────
  const { data: rawArticles } = await supabase
    .from('topic_articles')
    .select('sort_order, articles(id, title, slug, excerpt, category, read_time)')
    .eq('topic_id', topic.id)
    .order('sort_order')

  // ── Q3: Resources ─────────────────────────────────────────
  const { data: rawResources } = await supabase
    .from('topic_resources')
    .select('sort_order, resources(id, title, slug, resource_type, version)')
    .eq('topic_id', topic.id)
    .order('sort_order')

  // ── Q3: Podcasts ──────────────────────────────────────────
  const { data: rawPodcasts } = await supabase
    .from('topic_podcasts')
    .select('sort_order, podcasts(id, title, slug, excerpt)')
    .eq('topic_id', topic.id)
    .order('sort_order')

  // ── Q3: External links ────────────────────────────────────
  const { data: rawLinks } = await supabase
    .from('topic_external_links')
    .select('id, label, url, description, link_type')
    .eq('topic_id', topic.id)
    .order('sort_order')

  // ── Q4: Tests ─────────────────────────────────────────────
  const { data: rawTests } = await supabase
    .from('topic_tests')
    .select(
      'sort_order, tests(id, title, slug, description, question_count, duration_minutes, passing_score)'
    )
    .eq('topic_id', topic.id)
    .order('sort_order')

  // ── Flatten junction results (graceful empty on failure) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videos: VideoItem[] = (rawVideos ?? []).flatMap((r: any) => (r.videos ? [r.videos] : []))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const articles: ArticleItem[] = (rawArticles ?? []).flatMap((r: any) => (r.articles ? [r.articles] : []))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resources: ResourceItem[] = (rawResources ?? []).flatMap((r: any) => (r.resources ? [r.resources] : []))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const podcasts: PodcastItem[] = (rawPodcasts ?? []).flatMap((r: any) => (r.podcasts ? [r.podcasts] : []))
  const links: ExternalLinkItem[] = (rawLinks ?? []) as ExternalLinkItem[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tests: TestItem[] = (rawTests ?? []).flatMap((r: any) => (r.tests ? [r.tests] : []))

  const q3Total = resources.length + podcasts.length + links.length

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-16">

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center flex-wrap gap-1.5 text-sm text-[hsl(var(--foreground-muted))]"
        >
          <Link href="/learn" className="hover:text-[hsl(var(--foreground))] transition-colors">
            Learn
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link
            href={`/learn/${course.slug}`}
            className="hover:text-[hsl(var(--foreground))] transition-colors uppercase tracking-wide text-xs"
          >
            {course.title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link
            href={`/learn/${course.slug}/${unit.slug}`}
            className="hover:text-[hsl(var(--foreground))] transition-colors"
          >
            Unit {unit.unit_number}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[hsl(var(--foreground))]">{topic.topic_number}</span>
        </nav>

        {/* Topic header */}
        <header className="space-y-4">
          <p className="font-mono text-xs tracking-widest text-[hsl(var(--foreground-muted))] uppercase">
            // Topic {topic.topic_number}
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-[hsl(var(--foreground))]">
            {topic.title}
          </h1>
          {topic.description && (
            <p className="text-lg text-[hsl(var(--foreground-muted))] leading-relaxed max-w-2xl">
              {topic.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-sm text-[hsl(var(--foreground-muted))]">
            {topic.estimated_minutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                ~{topic.estimated_minutes} min total
              </span>
            )}
            <span>-</span>
            <span>4 quadrants of structured content</span>
          </div>
        </header>

        {/* Learning objectives */}
        {objectives.length > 0 && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-3">
            <p className="font-mono text-xs tracking-widest text-[hsl(var(--primary))] uppercase">
              By the end of this topic, you will
            </p>
            <ul className="space-y-2">
              {objectives.map((obj) => (
                <li
                  key={obj.id}
                  className="flex items-start gap-2.5 text-sm text-[hsl(var(--foreground-muted))]"
                >
                  <span className="text-[hsl(var(--primary))] shrink-0 mt-0.5">-</span>
                  <span>{obj.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quadrant tab navigation */}
        <nav aria-label="Quadrant navigation" className="flex flex-wrap gap-2">
          {[
            { href: '#q1', label: `Q1 - E-TUTORIAL (${videos.length})` },
            { href: '#q2', label: `Q2 - E-CONTENT (${articles.length})` },
            { href: '#q3', label: `Q3 - WEB RESOURCES (${q3Total})` },
            { href: '#q4', label: `Q4 - SELF-ASSESSMENT (${tests.length})` },
          ].map((tab) => (
            <a
              key={tab.href}
              href={tab.href}
              className="px-4 py-2 text-xs font-mono tracking-wide border border-[hsl(var(--border))] rounded-lg text-[hsl(var(--foreground-muted))] hover:border-[hsl(var(--primary)/0.5)] hover:text-[hsl(var(--foreground))] transition-all"
            >
              {tab.label}
            </a>
          ))}
        </nav>

        {/* ─── Q1: e-Tutorial ─────────────────────────────── */}
        <section id="q1" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.08)] shrink-0">
              <Video className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <p className="font-mono text-xs tracking-widest text-[hsl(var(--primary))] uppercase">
                Quadrant 1
              </p>
              <h2 className="text-xl font-display font-bold text-[hsl(var(--foreground))]">
                e-Tutorial
              </h2>
              <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                Video lectures and walkthroughs
              </p>
            </div>
          </div>

          {videos.length > 0 ? (
            <div className="space-y-3">
              {videos.map((v) => (
                <Link
                  key={v.id}
                  href={`/videos/${v.slug}`}
                  className="flex items-center gap-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-4 hover:border-[hsl(var(--primary)/0.4)] transition-all group"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--primary)/0.12)] shrink-0">
                    <Video className="w-4 h-4 text-[hsl(var(--primary))]" />
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-1">
                    {v.title}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[hsl(var(--foreground-muted))] italic">
              Video content coming soon.
            </p>
          )}
        </section>

        {/* ─── Q2: e-Content ──────────────────────────────── */}
        <section id="q2" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.08)] shrink-0">
              <BookOpen className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <p className="font-mono text-xs tracking-widest text-[hsl(var(--primary))] uppercase">
                Quadrant 2
              </p>
              <h2 className="text-xl font-display font-bold text-[hsl(var(--foreground))]">
                e-Content
              </h2>
              <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                Articles and case studies
              </p>
            </div>
          </div>

          {articles.length > 0 ? (
            <div className="space-y-3">
              {articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/articles/${a.slug}`}
                  className="flex items-start gap-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 hover:border-[hsl(var(--primary)/0.4)] transition-all group"
                >
                  {a.category && (
                    <span className="shrink-0 font-mono text-[10px] tracking-widest text-[hsl(var(--primary))] uppercase bg-[hsl(var(--primary)/0.1)] px-2 py-1 rounded-md mt-0.5">
                      {a.category}
                    </span>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                      {a.title}
                    </p>
                    {a.excerpt && (
                      <p className="text-sm text-[hsl(var(--foreground-muted))] line-clamp-2">
                        {a.excerpt}
                      </p>
                    )}
                    {a.read_time && (
                      <p className="text-xs text-[hsl(var(--foreground-muted))]">
                        {a.read_time} min read
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[hsl(var(--foreground-muted))] italic">
              Article content coming soon.
            </p>
          )}
        </section>

        {/* ─── Q3: Web Resources — 2x2 card grid ─────────── */}
        <section id="q3" className="scroll-mt-20 space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.08)] shrink-0">
              <Globe className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <p className="font-mono text-xs tracking-widest text-[hsl(var(--primary))] uppercase">
                Quadrant 3
              </p>
              <h2 className="text-xl font-display font-bold text-[hsl(var(--foreground))]">
                Web Resources
              </h2>
              <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                Downloadable material, podcast episodes, and curated external links
              </p>
            </div>
          </div>

          {/* Downloadable resources — 2-column grid */}
          {resources.length > 0 && (
            <div className="space-y-4">
              <p className="font-mono text-xs tracking-widest text-[hsl(var(--foreground-muted))] uppercase">
                Downloadable reference material
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {resources.map((r) => (
                  <Link
                    key={r.id}
                    href={`/resources/${r.slug}`}
                    className="group flex flex-col gap-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 hover:border-[hsl(var(--primary)/0.4)] transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.12)]">
                        <Download className="w-5 h-5 text-[hsl(var(--primary))]" />
                      </div>
                      <span className="text-[10px] font-mono tracking-wide text-[hsl(var(--foreground-muted))] bg-[hsl(var(--muted))] border border-[hsl(var(--border))] px-2.5 py-0.5 rounded-full">
                        {resourceTypeLabel(r.resource_type)}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-sm text-[hsl(var(--foreground))]">
                        {r.title}
                      </p>
                      <p className="text-xs text-[hsl(var(--foreground-muted))]">v{r.version}</p>
                    </div>
                    <p className="text-xs text-[hsl(var(--primary))] mt-auto group-hover:underline">
                      Open resource
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Podcast episodes */}
          {podcasts.length > 0 && (
            <div className="space-y-4">
              <p className="font-mono text-xs tracking-widest text-[hsl(var(--foreground-muted))] uppercase">
                Podcast episodes
              </p>
              <div className="space-y-3">
                {podcasts.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/podcast/${ep.slug}`}
                    className="group flex items-start gap-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 hover:border-[hsl(var(--primary)/0.4)] transition-all"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.12)] shrink-0">
                      <Headphones className="w-5 h-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-semibold text-sm text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                        {ep.title}
                      </p>
                      {ep.excerpt && (
                        <p className="text-xs text-[hsl(var(--foreground-muted))] line-clamp-2">
                          {ep.excerpt}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-[hsl(var(--foreground-muted))] shrink-0 mt-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* External links */}
          {links.length > 0 && (
            <div className="space-y-4">
              <p className="font-mono text-xs tracking-widest text-[hsl(var(--foreground-muted))] uppercase">
                External links
              </p>
              <div className="space-y-3">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 hover:border-[hsl(var(--primary)/0.4)] transition-all"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.12)] shrink-0">
                      <Globe className="w-5 h-5 text-[hsl(var(--primary))]" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-semibold text-sm text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                        {link.label}
                      </p>
                      {link.description && (
                        <p className="text-xs text-[hsl(var(--foreground-muted))] line-clamp-2">
                          {link.description}
                        </p>
                      )}
                      {link.link_type && (
                        <span className="inline-block text-[10px] font-mono tracking-wide text-[hsl(var(--foreground-muted))] bg-[hsl(var(--muted))] border border-[hsl(var(--border))] px-2.5 py-0.5 rounded-full capitalize mt-1">
                          {link.link_type}
                        </span>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-[hsl(var(--foreground-muted))] shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ─── Q4: Self-Assessment ────────────────────────── */}
        <section id="q4" className="scroll-mt-20 space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.08)] shrink-0">
              <ClipboardCheck className="w-5 h-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <p className="font-mono text-xs tracking-widest text-[hsl(var(--primary))] uppercase">
                Quadrant 4
              </p>
              <h2 className="text-xl font-display font-bold text-[hsl(var(--foreground))]">
                Self-Assessment
              </h2>
              <p className="text-xs text-[hsl(var(--foreground-muted))] mt-0.5">
                Test your knowledge - earn a certificate on first pass
              </p>
            </div>
          </div>

          {tests.length > 0 ? (
            <div className="space-y-3">
              {tests.map((t) => (
                <Link
                  key={t.id}
                  href={`/tests/${t.slug}`}
                  className="flex flex-col gap-3 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] p-5 hover:border-[hsl(var(--primary)/0.4)] transition-all group"
                >
                  <p className="font-semibold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="text-sm text-[hsl(var(--foreground-muted))] line-clamp-2">
                      {t.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-[hsl(var(--foreground-muted))]">
                    <span>{t.question_count} questions</span>
                    <span>{t.duration_minutes} min</span>
                    <span>Pass: {t.passing_score}%</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[hsl(var(--foreground-muted))] italic">
              Assessment coming soon.
            </p>
          )}
        </section>

      </main>
    </div>
  )
}
