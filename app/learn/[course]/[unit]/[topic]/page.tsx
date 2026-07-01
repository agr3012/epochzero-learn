// app/learn/[course]/[unit]/[topic]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  BookOpen,
  Play,
  Globe,
  GraduationCap,
  Download,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { DOMAIN_COLOR, QUADRANT_COLORS } from '@/lib/colors'
import { formatDuration, getYouTubeThumbnail } from '@/lib/utils'
import { getCurrentAccount } from '@/lib/auth'
import { getVideoProgress, getArticleReadSet, isUnitComplete, getReelWatchedSet, type VideoProgressRow } from '@/lib/progress'
import { SignInBanner } from '@/components/SignInBanner'
import { createAdminClient } from '@/lib/supabase/admin'
import { QuickBiteCard } from '@/components/QuickBiteCard'

export const dynamic = 'force-dynamic';

/* ─── Types ─────────────────────────────────────────────── */

interface VideoItem {
  id: string
  title: string
  slug: string
  youtube_id: string
  duration_seconds: number | null
}

interface ArticleItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  reading_time: number | null
}

interface ResourceItem {
  id: string
  title: string
  slug: string
  type: string
  version: string
}

interface WebLinkItem {
  id: string
  title: string
  url: string
  description: string | null
  source_type: string | null
}

interface TestItem {
  id: string
  title: string
  slug: string
  description: string | null
  total_questions: number
  duration_minutes: number
  passing_score: number
}

/* ─── Helpers ───────────────────────────────────────────── */

function resourceTypeLabel(type: string): string {
  const map: Record<string, string> = {
    ebook: 'eBook',
    cheatsheet: 'Cheatsheet',
    'mcq-bank': 'MCQ Bank',
    'question-bank': 'Question Bank',
  }
  return map[type] ?? type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

function QuadrantHeader({
  icon: Icon,
  n,
  eyebrow,
  title,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  n: string
  eyebrow: string
  title: string
  color: string
}) {
  return (
    <header className="flex items-center gap-4 pb-4 mb-1" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
      <div
        className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: color }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p
          className="font-sans font-semibold text-[10px] uppercase tracking-[0.1em] mb-0.5"
          style={{ color }}
        >
          Quadrant {n} · {eyebrow}
        </p>
        <h2 className="font-display text-xl font-semibold leading-tight" style={{ color: 'hsl(var(--foreground))' }}>
          {title}
        </h2>
      </div>
    </header>
  )
}

/* ─── Page ──────────────────────────────────────────────── */

export default async function TopicPage({
  params,
}: {
  params: { course: string; unit: string; topic: string }
}) {
  const supabase = createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('id, slug, title, short_title')
    .eq('slug', params.course)
    .eq('is_published', true)
    .single()

  if (!course) return notFound()

  const { data: unit } = await supabase
    .from('units')
    .select('id, slug, title, unit_number')
    .eq('course_id', course.id)
    .eq('slug', params.unit)
    .eq('is_published', true)
    .single()

  if (!unit) return notFound()

  const { data: topic } = await supabase
    .from('topics')
    .select('id, title, slug, description, estimated_minutes, topic_number, learning_objectives')
    .eq('unit_id', unit.id)
    .eq('slug', params.topic)
    .eq('is_published', true)
    .single()

  if (!topic) return notFound()

  const tileColor = DOMAIN_COLOR[course.slug] ?? '#1B5FA8'
  const objectives: string[] = topic.learning_objectives ?? []

  // ── Q1: Videos ───────────────────────────────────────────
  const { data: rawVideos } = await supabase
    .from('topic_videos')
    .select('order_index, videos(id, title, slug, youtube_id, duration_seconds)')
    .eq('topic_id', topic.id)
    .order('order_index')

  // ── Q2: Articles ─────────────────────────────────────────
  const { data: rawArticles } = await supabase
    .from('topic_articles')
    .select('order_index, articles(id, title, slug, excerpt, category, reading_time)')
    .eq('topic_id', topic.id)
    .order('order_index')

  // ── Q3: Resources ─────────────────────────────────────────
  const { data: rawResources } = await supabase
    .from('topic_resources')
    .select('order_index, resources(id, title, slug, type, version)')
    .eq('topic_id', topic.id)
    .order('order_index')

  // ── Q3: Web links ──────────────────────────────────────────
  const { data: rawLinks } = await supabase
    .from('topic_web_links')
    .select('id, title, url, description, source_type')
    .eq('topic_id', topic.id)
    .order('order_index')

  // ── Q4: Tests ─────────────────────────────────────────────
  const { data: rawTests } = await supabase
    .from('topic_tests')
    .select(
      'order_index, tests(id, title, slug, description, total_questions, duration_minutes, passing_score)'
    )
    .eq('topic_id', topic.id)
    .order('order_index')

  // ── Flatten junction results (graceful empty on failure) ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videos: VideoItem[] = (rawVideos ?? []).flatMap((r: any) => (r.videos ? [r.videos] : []))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const articles: ArticleItem[] = (rawArticles ?? []).flatMap((r: any) => (r.articles ? [r.articles] : []))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resources: ResourceItem[] = (rawResources ?? []).flatMap((r: any) => (r.resources ? [r.resources] : []))
  const links: WebLinkItem[] = (rawLinks ?? []) as WebLinkItem[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tests: TestItem[] = (rawTests ?? []).flatMap((r: any) => (r.tests ? [r.tests] : []))

  const q3Total = resources.length + links.length

  // ── Quick Bite reel for this topic ────────────────────────────────────
  const { data: topicReel } = await createAdminClient()
    .from('reels')
    .select('id, youtube_id, title, description, duration_seconds')
    .eq('topic_slug', params.topic)
    .eq('is_published', true)
    .limit(1)
    .maybeSingle()

  // ── Phase 2: account-aware completion state ────────────────────────────
  const account = await getCurrentAccount()
  const [videoProgress, readArticleIds, unitComplete]: [Record<string, VideoProgressRow>, Set<string>, boolean] = account
    ? await Promise.all([
        getVideoProgress(account.id, videos.map((v) => v.id)),
        getArticleReadSet(account.id, articles.map((a) => a.id)),
        isUnitComplete(account.id, unit.id),
      ])
    : [{}, new Set<string>(), false]

  const reelWatched = (topicReel && account)
    ? (await getReelWatchedSet(account.id, [topicReel.id])).has(topicReel.id)
    : false

  return (
    <div className="container py-12 lg:py-16">

      {!account && <SignInBanner next={`/learn/${course.slug}/${unit.slug}/${topic.slug}`} />}

      {/* ── Back link ── */}
      <Link
        href={`/learn/${course.slug}/${unit.slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-colors"
        style={{ color: 'hsl(var(--foreground-muted))' }}
      >
        <ChevronLeft className="w-4 h-4" />
        {unit.title}
      </Link>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center flex-wrap gap-1.5 text-xs font-sans mb-6"
        style={{ color: 'hsl(var(--foreground-subtle))' }}
      >
        <Link href="/learn" className="hover:underline">
          Learn
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link href={`/learn/${course.slug}`} className="hover:underline uppercase tracking-wide">
          {course.short_title ?? course.title}
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <Link href={`/learn/${course.slug}/${unit.slug}`} className="hover:underline">
          Unit {unit.unit_number}
        </Link>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span style={{ color: 'hsl(var(--foreground-muted))' }}>{topic.topic_number}</span>
      </nav>

      {/* Topic header */}
      <div className="mb-12 max-w-4xl">
        <p
          className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em] mb-3"
          style={{ color: tileColor }}
        >
          Topic {unit.unit_number}.{topic.topic_number} of {unit.title}
        </p>
        <h1
          className="font-display text-3xl lg:text-4xl font-bold mb-4 leading-tight"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          {topic.title}
        </h1>
        {topic.description && (
          <p
            className="font-serif text-lg leading-relaxed mb-4"
            style={{ color: 'hsl(var(--foreground-muted))' }}
          >
            {topic.description}
          </p>
        )}
        <div
          className="flex items-center gap-3 text-sm"
          style={{ color: 'hsl(var(--foreground-muted))' }}
        >
          {topic.estimated_minutes && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              ~{topic.estimated_minutes} min total
            </span>
          )}
          <span>·</span>
          <span>4 quadrants of structured content</span>
        </div>

        {/* Learning objectives */}
        {objectives.length > 0 && (
          <div className="card p-6 mt-6" style={{ borderLeft: `3px solid ${tileColor}` }}>
            <div className="inline-flex items-center gap-2 mb-4">
              <Target className="w-4 h-4" style={{ color: tileColor }} />
              <p
                className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em]"
                style={{ color: tileColor }}
              >
                By the end of this topic, you will
              </p>
            </div>
            <ul className="font-serif text-sm space-y-2" style={{ color: 'hsl(var(--foreground))' }}>
              {objectives.map((text, i) => (
                <li key={i} className="flex gap-2.5">
                  <span
                    className="mt-1 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: tileColor }}
                  />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Quadrant tab navigation */}
      <nav aria-label="Quadrant navigation" className="flex flex-wrap gap-2 mb-12">
        {[
          { href: '#q1', label: `Q1 · E-TUTORIAL (${videos.length})`, color: QUADRANT_COLORS.tutorial },
          { href: '#q2', label: `Q2 · E-CONTENT (${articles.length})`, color: QUADRANT_COLORS.content },
          { href: '#q3', label: `Q3 · WEB RESOURCES (${q3Total})`, color: QUADRANT_COLORS.resources },
          { href: '#q4', label: `Q4 · SELF-ASSESSMENT (${tests.length})`, color: QUADRANT_COLORS.assessment },
        ].map((tab) => (
          <a
            key={tab.href}
            href={tab.href}
            className="px-4 py-2 text-xs font-sans font-medium tracking-wide rounded-lg transition-colors"
            style={{
              border: `1px solid ${tab.color}40`,
              color: tab.color,
              background: `${tab.color}0d`,
            }}
          >
            {tab.label}
          </a>
        ))}
      </nav>

      <div className="space-y-16">

        {/* ─── Q1: e-Tutorial ─────────────────────────────── */}
        <section id="q1" className="scroll-mt-20 space-y-6">
          <QuadrantHeader
            icon={Play}
            n="1"
            eyebrow="e-Tutorial"
            title="Video lectures and walkthroughs"
            color={QUADRANT_COLORS.tutorial}
          />

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map((v) => (
                <Link key={v.id} href={`/videos/${v.slug}`} className="group">
                  <div
                    className="relative aspect-video overflow-hidden rounded-lg"
                    style={{ border: '1px solid hsl(var(--border))' }}
                  >
                    <Image
                      src={getYouTubeThumbnail(v.youtube_id, 'hq')}
                      alt={v.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
                        style={{ background: QUADRANT_COLORS.tutorial }}
                      >
                        <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                    {v.duration_seconds && (
                      <span
                        className="absolute bottom-2 right-2 font-mono text-[10px] px-1.5 py-0.5 rounded text-white"
                        style={{ background: 'rgba(0,0,0,0.75)' }}
                      >
                        {formatDuration(v.duration_seconds)}
                      </span>
                    )}
                    {videoProgress[v.id]?.completed && (
                      <span
                        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                        style={{ background: 'rgba(27,124,62,0.85)' }}
                      >
                        <CheckCircle2 className="w-3 h-3" /> Watched
                      </span>
                    )}
                  </div>
                  <p
                    className="mt-3 text-sm font-medium leading-snug line-clamp-2 transition-colors group-hover:text-[hsl(var(--primary))]"
                    style={{ color: 'hsl(var(--foreground))' }}
                  >
                    {v.title}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm italic font-serif" style={{ color: 'hsl(var(--foreground-muted))' }}>
              Video content coming soon.
            </p>
          )}

          {/* Quick Bite — portrait thumbnail, opens theater modal on click */}
          {topicReel && (
            <div className="flex items-start gap-4 pt-2">
              <QuickBiteCard
                youtubeId={topicReel.youtube_id}
                reelId={topicReel.id}
                title={topicReel.title}
                description={topicReel.description}
                durationSeconds={topicReel.duration_seconds}
                initialWatched={reelWatched}
              />
              <div className="hidden sm:flex flex-col justify-center gap-2 pt-4">
                <p className="font-sans text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: '#ca8a04' }}>
                  Quick Bite
                </p>
                <p className="font-display font-semibold text-sm leading-snug max-w-xs" style={{ color: 'hsl(var(--foreground))' }}>
                  {topicReel.title}
                </p>
                <p className="font-serif text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>
                  A {topicReel.duration_seconds}s visual summary of this topic. Click to watch.
                </p>
                {reelWatched && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold w-fit px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(27,124,62,0.12)', color: '#22c55e' }}>
                    <CheckCircle2 className="w-3 h-3" /> Watched · +5 pts
                  </span>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ─── Q2: e-Content ──────────────────────────────── */}
        <section id="q2" className="scroll-mt-20 space-y-6">
          <QuadrantHeader
            icon={BookOpen}
            n="2"
            eyebrow="e-Content"
            title="Articles and case studies"
            color={QUADRANT_COLORS.content}
          />

          {articles.length > 0 ? (
            <div className="space-y-3">
              {articles.map((a) => (
                <Link key={a.id} href={`/articles/${a.slug}`} className="card card-interactive p-5 group flex items-start gap-4">
                  {a.category && <span className="badge badge-tag mt-0.5 shrink-0">{a.category}</span>}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p
                      className="font-display font-semibold transition-colors group-hover:text-[hsl(var(--primary))] flex items-center gap-2"
                      style={{ color: 'hsl(var(--foreground))' }}
                    >
                      {a.title}
                      {readArticleIds.has(a.id) && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: 'rgba(27,124,62,0.10)', color: '#22c55e' }}>
                          <CheckCircle2 className="w-3 h-3" /> Read
                        </span>
                      )}
                    </p>
                    {a.excerpt && (
                      <p className="font-serif text-sm line-clamp-2" style={{ color: 'hsl(var(--foreground-muted))' }}>
                        {a.excerpt}
                      </p>
                    )}
                    {a.reading_time && (
                      <p className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                        {a.reading_time} min read
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm italic font-serif" style={{ color: 'hsl(var(--foreground-muted))' }}>
              Article content coming soon.
            </p>
          )}
        </section>

        {/* ─── Q3: Web Resources ──────────────────────────── */}
        <section id="q3" className="scroll-mt-20 space-y-8">
          <QuadrantHeader
            icon={Globe}
            n="3"
            eyebrow="Web Resources"
            title="Downloadable material and curated external links"
            color={QUADRANT_COLORS.resources}
          />

          {resources.length > 0 && (
            <div className="space-y-4">
              <p
                className="font-sans text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: 'hsl(var(--foreground-muted))' }}
              >
                Downloadable reference material
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {resources.map((r) => (
                  <Link key={r.id} href={`/resources/${r.slug}`} className="card card-interactive p-4 group flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white"
                        style={{ background: QUADRANT_COLORS.resources }}
                      >
                        <Download className="w-4 h-4" />
                      </div>
                      <span className="badge badge-tag text-[10px]">{resourceTypeLabel(r.type)}</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-display font-semibold text-sm line-clamp-2" style={{ color: 'hsl(var(--foreground))' }}>
                        {r.title}
                      </p>
                      <p className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>v{r.version}</p>
                    </div>
                    <p
                      className="text-xs font-sans font-medium mt-auto group-hover:underline"
                      style={{ color: QUADRANT_COLORS.resources }}
                    >
                      Open resource
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {links.length > 0 && (
            <div className="space-y-4">
              <p
                className="font-sans text-xs font-semibold uppercase tracking-[0.12em]"
                style={{ color: 'hsl(var(--foreground-muted))' }}
              >
                External links
              </p>
              <div className="space-y-3">
                {links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card card-interactive p-5 group flex items-start gap-4"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
                      style={{ background: QUADRANT_COLORS.resources }}
                    >
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p
                        className="font-display font-semibold text-sm transition-colors group-hover:text-[hsl(var(--primary))]"
                        style={{ color: 'hsl(var(--foreground))' }}
                      >
                        {link.title}
                      </p>
                      {link.description && (
                        <p className="font-serif text-xs line-clamp-2" style={{ color: 'hsl(var(--foreground-muted))' }}>
                          {link.description}
                        </p>
                      )}
                      {link.source_type && <span className="badge badge-tag mt-1 capitalize">{link.source_type}</span>}
                    </div>
                    <ExternalLink className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'hsl(var(--foreground-muted))' }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {resources.length === 0 && links.length === 0 && (
            <p className="text-sm italic font-serif" style={{ color: 'hsl(var(--foreground-muted))' }}>
              Web resources coming soon.
            </p>
          )}
        </section>

        {/* ─── Q4: Self-Assessment ────────────────────────── */}
        <section id="q4" className="scroll-mt-20 space-y-6">
          <QuadrantHeader
            icon={GraduationCap}
            n="4"
            eyebrow="Self-Assessment"
            title="Test your knowledge — earn a certificate on first pass"
            color={QUADRANT_COLORS.assessment}
          />

          {account && tests.length > 0 && !unitComplete && (
            <div className="card p-5 flex items-start gap-3" style={{ borderLeft: `3px solid ${QUADRANT_COLORS.assessment}` }}>
              <Lock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: QUADRANT_COLORS.assessment }} />
              <p className="font-serif text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
                Locked until every topic in <strong>{unit.title}</strong> is complete — all videos watched, all articles read.
              </p>
            </div>
          )}

          {tests.length > 0 ? (
            <div className="space-y-3">
              {tests.map((t) => {
                const locked = !!account && !unitComplete
                const cardClass = `card p-5 flex items-start gap-4 ${locked ? 'opacity-60 cursor-not-allowed' : 'card-interactive group'}`
                const inner = (
                  <>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
                      style={{ background: QUADRANT_COLORS.assessment }}
                    >
                      {locked ? <Lock className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <p
                        className="font-display font-semibold transition-colors group-hover:text-[hsl(var(--primary))]"
                        style={{ color: 'hsl(var(--foreground))' }}
                      >
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="font-serif text-sm line-clamp-2" style={{ color: 'hsl(var(--foreground-muted))' }}>
                          {t.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>
                        <span>{t.total_questions} questions</span>
                        <span>{t.duration_minutes} min</span>
                        <span>Pass: {t.passing_score}%</span>
                      </div>
                    </div>
                  </>
                )
                return locked ? (
                  <div key={t.id} className={cardClass}>{inner}</div>
                ) : (
                  <Link key={t.id} href={`/tests/${t.slug}`} className={cardClass}>{inner}</Link>
                )
              })}
            </div>
          ) : (
            <p className="text-sm italic font-serif" style={{ color: 'hsl(var(--foreground-muted))' }}>
              Assessment coming soon.
            </p>
          )}
        </section>

      </div>
    </div>
  )
}
