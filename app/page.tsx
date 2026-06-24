// app/page.tsx — EpochZero Learn Homepage v2.2
// Layout: bento features, editorial articles, feed forum, gradient cards, rings
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare, ArrowRight, BookOpen, Video,
  GraduationCap, FileText, Award, Mic, Terminal,
  Calendar, Users, Shield, Zap, CheckCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, getYouTubeThumbnail } from '@/lib/utils';
import { StatCounter } from '@/components/StatCounter';
import { FadeIn } from '@/components/FadeIn';

export const revalidate = 3600;

const COMING_SOON = ['Crypto', 'Web Dev'];
const DOMAIN_COLOR: Record<string, string> = {
  rema: '#8B5E1A', cloud: '#1B5FA8', crypto: '#6B3AD4', webdev: '#1B7C3E',
};
const CLUB_COLOR: Record<string, string> = {
  rema: '#8B5E1A', fullstack: '#1B5FA8', extension: '#1B7C3E',
};

async function getHomeData() {
  const supabase = createClient();
  const [
    articlesRes, videosRes, testsRes, coursesRes,
    videoCountRes, testCountRes, questionCountRes,
    articleCountRes, podcastCountRes, forumCountRes,
    clubsRes, eventsRes, forumThreadsRes,
  ] = await Promise.all([
    supabase.from('articles').select('id, slug, title, excerpt, category, published_at, reading_time').eq('is_published', true).order('published_at', { ascending: false }).limit(3),
    supabase.from('videos').select('id, slug, youtube_id, title, episode_label, domain, published_at').eq('is_published', true).order('order_index', { ascending: false }).limit(3),
    supabase.from('tests').select('id, slug, title, malware_family, duration_minutes, total_questions').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('courses').select('id, title, slug, short_title, units(id)').eq('is_published', true).order('created_at', { ascending: true }),
    supabase.from('videos').select('*',         { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('tests').select('*',          { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('test_questions').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*',       { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('podcasts').select('*',       { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('forum_threads').select('*',  { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('clubs').select('id, slug, name, short_name, tagline, logo_url').eq('is_active', true).order('order_index'),
    supabase.from('club_events').select('id, slug, title, event_type, event_date, participants_count, clubs(short_name, slug)').eq('is_published', true).neq('slug', 'digital-hygiene-drive-2025').order('event_date', { ascending: false }).limit(4),
    supabase.from('forum_threads').select('id, title, domain, author_name, reply_count, created_at').eq('status', 'published').order('created_at', { ascending: false }).limit(5),
  ]);
  return {
    articles:     articlesRes.data    ?? [],
    videos:       videosRes.data      ?? [],
    tests:        testsRes.data       ?? [],
    courses:      coursesRes.data     ?? [],
    clubs:        clubsRes.data       ?? [],
    events:       eventsRes.data      ?? [],
    forumThreads: forumThreadsRes.data ?? [],
    stats: {
      videos:    videoCountRes.count    ?? 0,
      tests:     testCountRes.count     ?? 0,
      questions: questionCountRes.count ?? 0,
      articles:  articleCountRes.count  ?? 0,
      podcasts:  podcastCountRes.count  ?? 0,
      forum:     forumCountRes.count    ?? 0,
    },
  };
}

export default async function HomePage() {
  const { articles, videos, tests, courses, clubs, events, stats, forumThreads } = await getHomeData();
  const totalContent = stats.videos + stats.articles + stats.tests;

  return (
    <>
      {/* ══════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid hsl(var(--border))', position: 'relative', overflow: 'hidden' }}>
        <div className="container pt-5 pb-6 lg:pt-8 lg:pb-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(var(--primary))' }} />
                <span className="font-sans text-xs font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                  Cybersecurity Learning Platform
                </span>
              </div>
              <h1 className="font-display font-bold leading-[1.0] tracking-tight mb-5"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: 'hsl(var(--foreground))' }}>
                Learn.
                <br /><span style={{ color: 'hsl(var(--primary))' }}>Compete.</span>
                <br />Get Certified.
              </h1>
              <p className="font-serif text-lg leading-relaxed mb-8 max-w-xl"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                Structured cybersecurity education across{' '}
                <span className="font-sans font-semibold" style={{ color: '#E8A020' }}>REMA</span>,{' '}
                <span className="font-sans font-semibold" style={{ color: '#58A6FF' }}>Cloud</span>,{' '}
                <span className="font-sans font-semibold" style={{ color: '#A78BFA' }}>Cryptography</span>, and{' '}
                <span className="font-sans font-semibold" style={{ color: '#4ADE80' }}>Web Dev</span>.
                Articles, videos, MCQ tests with verifiable certificates, and CTF events.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <Link href="/learn" className="btn-primary"><GraduationCap className="w-4 h-4" /> Start Learning</Link>
                <Link href="/tests" className="btn-ghost"><Award className="w-4 h-4" /> Take a Test</Link>
              </div>

            </div>

            {/* Terminal widget */}
            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden shadow-2xl" style={{ border: '1px solid hsl(var(--border))' }}>
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--primary))' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--border-strong))' }} />
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: 'hsl(var(--foreground-muted))' }}>epochzero://session</span>
                </div>
                <div className="p-5 font-mono text-sm leading-loose space-y-0.5"
                  style={{ background: 'hsl(222 47% 7%)' }}>
                  <div style={{ color: 'hsl(var(--foreground-muted))' }}>
                    <span style={{ color: 'hsl(var(--primary))' }}>$</span> ez courses --list
                  </div>
                  {courses.map(c => (
                    <div key={c.slug} style={{ color: '#cfd7e2' }}>
                      ├── {c.short_title ?? c.title}{' '}
                      <span style={{ color: 'hsl(var(--primary))' }}>{(c.units as any[])?.length ?? 0} units</span>
                    </div>
                  ))}
                  {COMING_SOON.map((label, i) => (
                    <div key={label} style={{ color: '#555f7a' }}>
                      {i === COMING_SOON.length - 1 ? '└──' : '├──'} {label} coming soon
                    </div>
                  ))}
                  <div className="pt-2" style={{ color: 'hsl(var(--foreground-muted))' }}>
                    <span style={{ color: 'hsl(var(--primary))' }}>$</span> ez stats --live
                  </div>
                  <div style={{ color: '#cfd7e2' }}>├── articles <span style={{ color: 'hsl(var(--primary))' }}>{stats.articles}</span></div>
                  <div style={{ color: '#cfd7e2' }}>├── videos   <span style={{ color: 'hsl(var(--primary))' }}>{stats.videos}</span></div>
                  <div style={{ color: '#cfd7e2' }}>├── mcq      <span style={{ color: 'hsl(var(--primary))' }}>{stats.questions} questions</span></div>
                  <div style={{ color: '#cfd7e2' }}>└── forum    <span style={{ color: 'hsl(var(--primary))' }}>{stats.forum} threads</span></div>
                  <div className="pt-1" style={{ color: 'hsl(var(--foreground-muted))' }}>
                    <span style={{ color: 'hsl(var(--primary))' }}>$</span>{' '}
                    <span className="inline-block w-2 h-4 align-middle animate-pulse" style={{ background: 'hsl(var(--primary))' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          LIVE STATS BAR
          ══════════════════════════════════════════════════════ */}
      <section style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { icon: Video,         label: 'Video Lessons',   value: stats.videos,    color: '#8B5E1A' },
              { icon: BookOpen,      label: 'Articles',         value: stats.articles,  color: '#1B5FA8' },
              { icon: Award,         label: 'MCQ Tests',        value: stats.tests,     color: '#6B3AD4' },
              { icon: Zap,           label: 'MCQ Questions',    value: stats.questions, color: '#1B7C3E' },
              { icon: MessageSquare, label: 'Forum Threads',    value: stats.forum,     color: '#8B5E1A' },
              { icon: Mic,           label: 'Podcast Episodes', value: stats.podcasts,  color: '#1B5FA8' },
            ].map(({ icon: Icon, label, value, color }, i) => (
              <div key={label}
                className="group flex flex-col items-center py-4 px-4 text-center cursor-default select-none transition-colors duration-200"
                style={{ borderRight: i < 5 ? '1px solid hsl(var(--border))' : 'none' }}>
                <Icon className="w-5 h-5 mb-3 transition-transform duration-200 group-hover:scale-125"
                  style={{ color }} />
                <div className="font-display text-2xl font-bold tabular-nums transition-transform duration-200 group-hover:scale-110 origin-bottom"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  <StatCounter value={value} suffix="+" />
                </div>
                <div className="text-xs mt-1 transition-colors duration-200 group-hover:text-[hsl(var(--foreground))]"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES — bento layout (not pure grid)
          ══════════════════════════════════════════════════════ */}
      <section className="container py-16">
        <FadeIn>
          <div className="mb-10">
            <p className="eyebrow mb-3">What's inside</p>
            <h2 className="font-display text-3xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
              Learning, assessments, and events — under one roof.
            </h2>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-4 gap-4">
          {/* Large gradient featured card */}
          <FadeIn delay={0.05} className="lg:col-span-2 lg:row-span-2">
            <Link href="/learn" className="gradient-card-gold group block h-full p-8 lg:p-10 relative">
              <div className="relative z-10 flex flex-col h-full min-h-[280px]">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shrink-0"
                  style={{ background: 'rgba(232,160,32,0.2)', border: '1px solid rgba(232,160,32,0.4)' }}>
                  <GraduationCap className="w-7 h-7" style={{ color: '#E8A020' }} />
                </div>
                <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.15em] mb-2"
                  style={{ color: '#E8A020' }}>
                  Structured curriculum
                </p>
                <h3 className="font-display text-2xl lg:text-3xl font-bold mb-4 leading-tight text-white">
                  4-Quadrant UGC Learning Framework
                </h3>
                <p className="font-serif text-base leading-relaxed mb-6"
                  style={{ color: 'rgba(207,215,226,0.85)' }}>
                  Every topic is structured across e-Tutorial, e-Content, Web Resources, and Self-Assessment.
                  Start from Unit 1 and build mastery progressively with articles, videos,
                  and graded MCQ tests at every step.
                </p>
                {/* Bullet checklist */}
                <div className="flex flex-col gap-2.5 mb-8">
                  {['REMA — Reverse Engineering & Malware Analysis', 'Cloud Security — Architecture to Forensics', 'Cryptography — Applied & PKI (coming soon)', 'Web Development — Full Stack (coming soon)'].map(item => (
                    <div key={item} className="flex items-center gap-2.5 text-sm" style={{ color: 'rgba(207,215,226,0.8)' }}>
                      <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#4ADE80' }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-auto">
                  <span className="font-sans text-sm font-semibold inline-flex items-center gap-2
                    group-hover:gap-3 transition-all" style={{ color: '#E8A020' }}>
                    Explore learning paths <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </FadeIn>

          {/* Right column — 4 cards in 2×2, centred big-icon layout */}
          {[
            { icon: BookOpen,  color: '#1B5FA8', title: 'Articles & Writeups',      desc: 'In-depth technical writeups across malware analysis, cloud security, and cryptography.',  href: '/articles'  },
            { icon: Video,     color: '#1B7C3E', title: 'Video Lessons',            desc: 'Step-by-step lessons paired with lab notes and exercises.',       href: '/videos'    },
            { icon: Award,     color: '#6B3AD4', title: 'MCQ Tests + Certificates', desc: 'Pass the test and receive a verifiable PDF certificate by email.',         href: '/tests'     },
            { icon: FileText,  color: '#8B5E1A', title: 'eBooks & Cheatsheets',     desc: 'Course textbooks, cheatsheets, and question banks — all free.',                  href: '/resources' },
          ].map(({ icon: Icon, color, title, desc, href }, i) => (
            <FadeIn key={title} delay={0.05 + i * 0.07}>
              <Link href={href}
                className="card card-interactive p-6 group
                  flex flex-col items-center text-center justify-between h-full">
                {/* Centered big icon + text */}
                <div className="flex flex-col items-center flex-1">
                  {/* Large icon tile */}
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: color }}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-base font-bold mb-2
                    group-hover:text-[hsl(var(--primary))] transition-colors leading-tight"
                    style={{ color: 'hsl(var(--foreground))' }}>
                    {title}
                  </h3>
                  <p className="text-xs leading-relaxed"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {desc}
                  </p>
                </div>
                {/* Explore link pinned to bottom */}
                <span className="mt-5 font-sans text-xs font-semibold inline-flex items-center gap-1
                  group-hover:gap-2 transition-all"
                  style={{ color }}>
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ARTICLES — editorial layout (1 featured + 2 stacked)
          ══════════════════════════════════════════════════════ */}
      {articles.length > 0 && (
        <section className="container py-14" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <FadeIn>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="eyebrow mb-2">Latest writeups</p>
                <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                  From the lab notebook
                </h2>
              </div>
              <Link href="/articles" className="hidden md:inline-flex items-center gap-2 font-sans text-sm font-medium hover:gap-3 transition-all" style={{ color: 'hsl(var(--primary))' }}>
                All articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-5 gap-4">
            {/* Featured article — spans 2 cols */}
            <FadeIn delay={0.05} className="md:col-span-2">
              <Link href={`/articles/${articles[0].slug}`}
                className="card card-interactive p-7 group flex flex-col h-full">
                {articles[0].category && (
                  <span className="badge badge-tag mb-5 self-start">{articles[0].category}</span>
                )}
                <h3 className="font-display text-xl font-semibold mb-4 leading-snug
                  group-hover:text-[hsl(var(--primary))] transition-colors"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  {articles[0].title}
                </h3>
                {articles[0].excerpt && (
                  <p className="font-serif text-sm leading-relaxed mb-5 flex-1"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {articles[0].excerpt}
                  </p>
                )}
                <div className="mt-auto pt-4 flex items-center justify-between text-xs"
                  style={{ borderTop: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground-subtle))' }}>
                  <span>{articles[0].published_at ? formatDate(articles[0].published_at) : '—'}</span>
                  {articles[0].reading_time && <span>{articles[0].reading_time} min read</span>}
                </div>
              </Link>
            </FadeIn>

            {/* Two stacked articles — span 3 cols */}
            <div className="md:col-span-3 flex flex-col gap-4">
              {articles.slice(1).map((a, i) => (
                <FadeIn key={a.id} delay={0.1 + i * 0.07} className="flex-1">
                  <Link href={`/articles/${a.slug}`}
                    className="card card-interactive p-6 group flex gap-5 h-full items-start">
                    {/* Left accent bar with domain color */}
                    <div className="w-1 self-stretch rounded-full shrink-0"
                      style={{ background: 'hsl(var(--primary))' }} />
                    <div className="flex-1 min-w-0">
                      {a.category && (
                        <span className="badge badge-tag mb-3 inline-flex">{a.category}</span>
                      )}
                      <h3 className="font-display text-base font-semibold leading-snug
                        group-hover:text-[hsl(var(--primary))] transition-colors mb-2"
                        style={{ color: 'hsl(var(--foreground))' }}>
                        {a.title}
                      </h3>
                      {a.excerpt && (
                        <p className="font-serif text-sm leading-relaxed line-clamp-2 mb-3"
                          style={{ color: 'hsl(var(--foreground-muted))' }}>
                          {a.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs"
                        style={{ color: 'hsl(var(--foreground-subtle))' }}>
                        {a.published_at && <span>{formatDate(a.published_at)}</span>}
                        {a.reading_time && <span>· {a.reading_time} min read</span>}
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          FORUM — gradient CTA + vertical feed (not 4-col grid)
          ══════════════════════════════════════════════════════ */}
      {forumThreads.length > 0 && (
        <section className="container py-14" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <FadeIn>
            <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
              {/* Thread feed */}
              <div>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <p className="eyebrow mb-2">Community</p>
                    <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                      From the discussion floor
                    </h2>
                  </div>
                  <Link href="/forum" className="hidden md:inline-flex items-center gap-2 font-sans text-sm font-medium hover:gap-3 transition-all" style={{ color: 'hsl(var(--primary))' }}>
                    All threads <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                {/* Vertical feed — not a grid */}
                <div className="space-y-2">
                  {forumThreads.map((t: any, i) => {
                    const c = DOMAIN_COLOR[t.domain] ?? '#1B5FA8';
                    return (
                      <FadeIn key={t.id} delay={i * 0.06}>
                        <Link href={`/forum/${t.domain}/${t.id}`}
                          className="card card-interactive block px-4 py-3.5 group">
                          {/* Top row: domain pill + reply count */}
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c }} />
                            <span className="font-sans text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: `${c}18`, color: c, border: `1px solid ${c}40` }}>
                              {t.domain}
                            </span>
                            <div className="flex items-center gap-1 text-xs ml-auto shrink-0"
                              style={{ color: 'hsl(var(--foreground-subtle))' }}>
                              <MessageSquare className="w-3 h-3" />
                              {t.reply_count ?? 0}
                            </div>
                          </div>
                          {/* Title on its own line — safe on narrow screens */}
                          <h3 className="font-sans text-sm font-medium leading-snug line-clamp-2
                            group-hover:text-[hsl(var(--primary))] transition-colors pl-3.5"
                            style={{ color: 'hsl(var(--foreground))' }}>
                            {t.title}
                          </h3>
                        </Link>
                      </FadeIn>
                    );
                  })}
                </div>
              </div>

              {/* Gradient CTA card — like CyberDefenders' "Unlock Premium" card */}
              <FadeIn delay={0.1}>
                <div className="gradient-card-blue p-7 flex flex-col relative">
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 shrink-0"
                      style={{ background: 'rgba(27,95,168,0.35)', border: '1px solid rgba(56,139,253,0.4)' }}>
                      <MessageSquare className="w-6 h-6" style={{ color: '#58A6FF' }} />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2 text-white">Have a question?</h3>
                    <p className="font-serif text-sm leading-relaxed mb-6"
                      style={{ color: 'rgba(207,215,226,0.8)' }}>
                      Join the discussion forum. Ask questions, share knowledge, and collaborate
                      with peers across REMA, Cloud, Cryptography, and Web Dev.
                    </p>
                    <div className="flex flex-col gap-2 mb-6">
                      {['No account needed to read', 'Sign in with RRU email to post', 'Replies reviewed and published'].map(item => (
                        <div key={item} className="flex items-center gap-2 text-sm"
                          style={{ color: 'rgba(207,215,226,0.75)' }}>
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#4ADE80' }} />
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto flex flex-col gap-2">
                      <Link href="/forum" className="btn-primary text-center justify-center">
                        Browse the Forum
                      </Link>
                      <Link href="/dashboard/login"
                        className="font-sans text-sm font-medium text-center py-2 rounded-lg transition-colors"
                        style={{ color: 'rgba(207,215,226,0.7)' }}>
                        Sign in to post →
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </FadeIn>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          VIDEOS — 3-col grid (thumbnails work best here)
          ══════════════════════════════════════════════════════ */}
      {videos.length > 0 && (
        <section className="container py-14" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <FadeIn>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="eyebrow mb-2">Recent lessons</p>
                <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Video lessons</h2>
              </div>
              <Link href="/videos" className="hidden md:inline-flex items-center gap-2 font-sans text-sm font-medium hover:gap-3 transition-all" style={{ color: 'hsl(var(--primary))' }}>
                All videos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-5">
            {videos.map((v, i) => {
              const c = DOMAIN_COLOR[v.domain ?? 'rema'] ?? '#8B5E1A';
              return (
                <FadeIn key={v.id} delay={i * 0.1}>
                  <Link href={`/videos/${v.slug}`} className="group block">
                    <div className="relative aspect-video overflow-hidden rounded-lg"
                      style={{ border: '1px solid hsl(var(--border))' }}>
                      <Image src={getYouTubeThumbnail(v.youtube_id, 'maxres')} alt={v.title}
                        fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {v.episode_label && (
                        <span className="absolute bottom-3 left-3 font-mono text-[9px] uppercase tracking-wider px-2 py-1 text-white rounded"
                          style={{ background: c }}>
                          {v.episode_label}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-base font-semibold mt-3 leading-snug
                      group-hover:text-[hsl(var(--primary))] transition-colors"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {v.title}
                    </h3>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          CLUBS — 3-col with colour accent top bars
          ══════════════════════════════════════════════════════ */}
      {clubs.length > 0 && (
        <section className="container py-14" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <FadeIn>
            <div className="mb-8">
              <p className="eyebrow mb-2">Campus life</p>
              <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Clubs at SITAICS</h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-4">
            {clubs.map((club: any, i) => {
              const c = CLUB_COLOR[club.slug] ?? '#1B5FA8';
              return (
                <FadeIn key={club.id} delay={i * 0.1}>
                  <Link href={`/clubs/${club.slug}`} className="card card-interactive group flex flex-col overflow-hidden">
                    <div className="h-1.5 w-full shrink-0" style={{ background: c }} />
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        {club.logo_url
                          ? <Image src={club.logo_url} alt={club.name} width={44} height={44} className="rounded-lg shrink-0" />
                          : <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: c }}><Users className="w-5 h-5 text-white" /></div>
                        }
                        <div>
                          <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.1em] mb-0.5" style={{ color: c }}>Student Club</p>
                          <h3 className="font-display text-base font-semibold leading-tight group-hover:text-[hsl(var(--primary))] transition-colors" style={{ color: 'hsl(var(--foreground))' }}>
                            {club.name}
                          </h3>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'hsl(var(--foreground-muted))' }}>{club.tagline}</p>
                      <div className="flex items-center justify-between pt-4 mt-auto" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                        <span className="text-xs font-sans font-medium" style={{ color: c }}>Rashtriya Raksha University</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: 'hsl(var(--foreground-subtle))' }} />
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          EVENTS — 2-col with more info density
          ══════════════════════════════════════════════════════ */}
      {events.length > 0 && (
        <section className="container py-14" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <FadeIn>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="eyebrow mb-2">Activities</p>
                <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Recent events</h2>
              </div>
              <Link href="/events" className="hidden md:inline-flex items-center gap-2 font-sans text-sm font-medium hover:gap-3 transition-all" style={{ color: 'hsl(var(--primary))' }}>
                All events <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 gap-4">
            {events.map((ev: any, i) => (
              <FadeIn key={ev.id} delay={i * 0.08}>
                <Link href="/events" className="card card-interactive p-6 group flex items-start gap-5">
                  {/* Event type dot + number */}
                  <div className="shrink-0 flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'hsl(var(--muted))' }}>
                      <Calendar className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                    <span className="font-mono text-[9px]" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      #{String(events.length - i).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="badge badge-tag self-start">{ev.event_type}</span>
                      {ev.clubs && <span className="text-xs font-semibold" style={{ color: 'hsl(var(--primary))' }}>{ev.clubs.short_name}</span>}
                    </div>
                    <h3 className="font-sans text-sm font-semibold leading-snug mb-2
                      group-hover:text-[hsl(var(--primary))] transition-colors"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {ev.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      {ev.event_date && <span>{new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {ev.participants_count && (
                        <span className="font-semibold" style={{ color: 'hsl(var(--foreground))' }}>· {ev.participants_count}+ participants</span>
                      )}
                    </div>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════
          TESTS CTA — gradient purple card with gradient ring
          ══════════════════════════════════════════════════════ */}
      <section className="container py-16" style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <FadeIn>
          <div className="gradient-card-purple p-10 lg:p-14 relative">
            <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex gap-8 mb-6">
                  <div className="pl-4" style={{ borderLeft: '2px solid rgba(167,139,250,0.7)' }}>
                    <div className="font-display text-3xl font-bold text-white">{stats.tests}</div>
                    <div className="text-xs" style={{ color: 'rgba(207,215,226,0.7)' }}>Tests available</div>
                  </div>
                  <div className="pl-4" style={{ borderLeft: '2px solid rgba(74,222,128,0.6)' }}>
                    <div className="font-display text-3xl font-bold text-white">{stats.questions}</div>
                    <div className="text-xs" style={{ color: 'rgba(207,215,226,0.7)' }}>MCQ questions</div>
                  </div>
                  <div className="pl-4" style={{ borderLeft: '2px solid rgba(232,160,32,0.6)' }}>
                    <div className="font-display text-3xl font-bold text-white">Free</div>
                    <div className="text-xs" style={{ color: 'rgba(207,215,226,0.7)' }}>No paywall</div>
                  </div>
                </div>
                <h2 className="font-display text-3xl font-bold mb-4 leading-tight text-white">
                  Test your skills.<br />Earn a certificate.
                </h2>
                <p className="font-serif text-base leading-relaxed mb-8" style={{ color: 'rgba(207,215,226,0.8)' }}>
                  Pick a test, enter your email, prove what you know. Pass the bar — receive a PDF certificate
                  with a unique verification ID. No paywall. No catch.
                </p>
                <Link href="/tests" className="btn-primary">
                  Browse Tests <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {tests.map((t, i) => (
                  <FadeIn key={t.id} delay={i * 0.1}>
                    <Link href={`/tests/${t.slug}`}
                      className="block p-5 rounded-xl group transition-colors"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(167,139,250,0.25)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-sans text-sm font-semibold text-white group-hover:text-[#A78BFA] transition-colors">
                          {t.title}
                        </h3>
                        <Terminal className="w-4 h-4 shrink-0" style={{ color: 'rgba(167,139,250,0.5)' }} />
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(207,215,226,0.6)' }}>
                        <span>{t.total_questions} questions</span>
                        <span>·</span>
                        <span>{t.duration_minutes} min</span>
                      </div>
                    </Link>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
