// app/page.tsx — EpochZero Learn Homepage
// CyberDefenders-inspired: compact, content-forward, CSS-var-based
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare, ArrowRight, BookOpen, Video,
  GraduationCap, FileText, Award, Terminal,
  Calendar, Users, Shield, Zap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, getYouTubeThumbnail } from '@/lib/utils';
import { StatCounter } from '@/components/StatCounter';

export const revalidate = 3600;

const COMING_SOON = ['Crypto', 'Web Dev'];

// Domain tile colors — CyberDefenders solid tile pattern
const DOMAIN_BADGE: Record<string, string> = {
  rema:   '#8B5E1A',
  cloud:  '#1B5FA8',
  crypto: '#6B3AD4',
  webdev: '#1B7C3E',
};

async function getHomeData() {
  const supabase = createClient();
  const [
    articlesRes, videosRes, testsRes, coursesRes,
    videoCountRes, testCountRes, questionCountRes,
    articleCountRes, podcastCountRes, forumCountRes,
    clubsRes, eventsRes, forumThreadsRes,
  ] = await Promise.all([
    supabase.from('articles').select('id, slug, title, excerpt, category, published_at, reading_time')
      .eq('is_published', true).order('published_at', { ascending: false }).limit(3),
    supabase.from('videos').select('id, slug, youtube_id, title, episode_label, domain, published_at')
      .eq('is_published', true).order('order_index', { ascending: false }).limit(3),
    supabase.from('tests').select('id, slug, title, description, malware_family, duration_minutes, total_questions')
      .eq('is_published', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('courses').select('id, title, slug, short_title, units(id)')
      .eq('is_published', true).order('created_at', { ascending: true }),

    // Live counts — dynamically reflect all new content
    supabase.from('videos').select('*',        { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('tests').select('*',         { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('test_questions').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*',      { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('podcasts').select('*',      { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('status', 'published'),

    supabase.from('clubs').select('id, slug, name, short_name, tagline, logo_url')
      .eq('is_active', true).order('order_index'),
    supabase.from('club_events').select('id, slug, title, event_type, event_date, participants_count, clubs(short_name, slug)')
      .eq('is_published', true).neq('slug', 'digital-hygiene-drive-2025')
      .order('event_date', { ascending: false }).limit(4),
    supabase.from('forum_threads').select('id, title, domain, author_name, reply_count, created_at')
      .eq('status', 'published').order('created_at', { ascending: false }).limit(4),
  ]);

  return {
    articles:     articlesRes.data    ?? [],
    videos:       videosRes.data      ?? [],
    tests:        testsRes.data       ?? [],
    courses:      coursesRes.data     ?? [],
    clubs:        clubsRes.data       ?? [],
    events:       eventsRes.data      ?? [],
    forumThreads: forumThreadsRes.data ?? [],
    // All counts live from DB — add content, numbers auto-update
    stats: {
      videos:     videoCountRes.count    ?? 0,
      tests:      testCountRes.count     ?? 0,
      questions:  questionCountRes.count ?? 0,
      articles:   articleCountRes.count  ?? 0,
      podcasts:   podcastCountRes.count  ?? 0,
      forum:      forumCountRes.count    ?? 0,
    },
  };
}

export default async function HomePage() {
  const { articles, videos, tests, courses, clubs, events, stats, forumThreads } = await getHomeData();

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          HERO — compact, no giant padding, straight to content
          ═══════════════════════════════════════════════════════ */}
      <section
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
        className="relative overflow-hidden">
        <div className="container pt-10 pb-14 lg:pt-14 lg:pb-20 relative">
          <div className="grid lg:grid-cols-12 gap-10 items-center">

            {/* Left */}
            <div className="lg:col-span-7">
              {/* Live platform pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5
                rounded-full mb-6"
                style={{
                  background: 'hsl(var(--primary)/0.08)',
                  border: '1px solid hsl(var(--primary)/0.25)',
                }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: 'hsl(var(--primary))' }} />
                <span className="font-sans text-xs font-semibold"
                  style={{ color: 'hsl(var(--primary))' }}>
                  Live Platform — SITAICS, RRU
                </span>
              </div>

              {/* H1 */}
              <h1 className="font-display font-bold leading-[1.0] tracking-tight mb-5"
                style={{
                  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                  color: 'hsl(var(--foreground))',
                }}>
                Learn.
                <br />
                <span style={{ color: 'hsl(var(--primary))' }}>Compete.</span>
                <br />
                Get Certified.
              </h1>

              <p className="font-serif text-lg leading-relaxed mb-8 max-w-xl"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                Structured cybersecurity education across{' '}
                <span className="font-sans font-semibold" style={{ color: 'hsl(var(--primary))' }}>REMA</span>,{' '}
                <span className="font-sans font-semibold" style={{ color: '#58A6FF' }}>Cloud</span>,{' '}
                <span className="font-sans font-semibold" style={{ color: '#A78BFA' }}>Cryptography</span>, and{' '}
                <span className="font-sans font-semibold" style={{ color: '#4ADE80' }}>Web Dev</span>.
                Articles, videos, MCQ tests with verifiable certificates, and CTF events.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/learn" className="btn-primary">
                  <GraduationCap className="w-4 h-4" />
                  Start Learning
                </Link>
                <Link href="/tests" className="btn-ghost">
                  <Award className="w-4 h-4" />
                  Take a Test
                </Link>
              </div>
            </div>

            {/* Right — terminal (keep mono, it's intentional) */}
            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden shadow-2xl"
                style={{ border: '1px solid hsl(var(--border))' }}>
                {/* Title bar */}
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{
                    background: 'hsl(var(--surface))',
                    borderBottom: '1px solid hsl(var(--border))',
                  }}>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-crimson-500" />
                    <span className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--primary))' }} />
                    <span className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--border-strong))' }} />
                  </div>
                  <span className="font-mono text-[10px]" style={{ color: 'hsl(var(--foreground-muted))' }}>
                    epochzero://session
                  </span>
                </div>
                {/* Terminal body */}
                <div className="p-5 font-mono text-sm leading-loose space-y-0.5"
                  style={{ background: 'hsl(222 47% 8%)' }}>
                  <div style={{ color: 'hsl(var(--foreground-muted))' }}>
                    <span style={{ color: 'hsl(var(--primary))' }}>$</span> ez courses --list
                  </div>
                  {courses.map((c) => (
                    <div key={c.slug} style={{ color: '#cfd7e2' }}>
                      ├── {c.short_title ?? c.title}{' '}
                      <span style={{ color: 'hsl(var(--primary))' }}>
                        {(c.units as any[])?.length ?? 0} units
                      </span>
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
                  <div style={{ color: '#cfd7e2' }}>
                    ├── articles{' '}
                    <span style={{ color: 'hsl(var(--primary))' }}>{stats.articles}</span>
                  </div>
                  <div style={{ color: '#cfd7e2' }}>
                    ├── videos{' '}
                    <span style={{ color: 'hsl(var(--primary))' }}>{stats.videos}</span>
                  </div>
                  <div style={{ color: '#cfd7e2' }}>
                    ├── questions{' '}
                    <span style={{ color: 'hsl(var(--primary))' }}>{stats.questions}</span>
                  </div>
                  <div style={{ color: '#cfd7e2' }}>
                    └── forum{' '}
                    <span style={{ color: 'hsl(var(--primary))' }}>{stats.forum} threads</span>
                  </div>
                  <div className="pt-1" style={{ color: 'hsl(var(--foreground-muted))' }}>
                    <span style={{ color: 'hsl(var(--primary))' }}>$</span>{' '}
                    <span className="inline-block w-2 h-4 align-middle animate-pulse"
                      style={{ background: 'hsl(var(--primary))' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LIVE STATS — animated counters, real DB numbers
          ═══════════════════════════════════════════════════════ */}
      <section style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-0 divide-x"
            style={{ '--tw-divide-opacity': 1, borderColor: 'hsl(var(--border))' } as React.CSSProperties}>
            {[
              { icon: Video,        label: 'Video Lessons',  value: stats.videos    },
              { icon: BookOpen,     label: 'Articles',        value: stats.articles  },
              { icon: Award,        label: 'MCQ Tests',       value: stats.tests     },
              { icon: Zap,          label: 'MCQ Questions',   value: stats.questions },
              { icon: MessageSquare,label: 'Forum Threads',   value: stats.forum     },
              { icon: Terminal,     label: 'Podcast Episodes',value: stats.podcasts  },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center py-6 px-4 text-center">
                <Icon className="w-5 h-5 mb-3" style={{ color: 'hsl(var(--primary))' }} />
                <div className="font-display text-2xl font-bold tabular-nums"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  <StatCounter value={value} suffix="+" />
                </div>
                <div className="text-xs mt-1" style={{ color: 'hsl(var(--foreground-muted))' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES GRID
          ═══════════════════════════════════════════════════════ */}
      <section className="container py-16">
        <div className="mb-10">
          <p className="eyebrow mb-3">What's inside</p>
          <h2 className="font-display text-3xl font-bold"
            style={{ color: 'hsl(var(--foreground))' }}>
            Learning, assessments, and events — under one roof.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: BookOpen,     color: '#1B5FA8', title: 'Articles & Writeups',       desc: 'In-depth technical writeups across malware analysis, cloud security, cryptography, and web development.',          href: '/articles' },
            { icon: Video,        color: '#1B7C3E', title: 'Video Lessons',             desc: 'Step-by-step lessons paired with lab notes and exercises. YouTube-embedded for one-click viewing.',               href: '/videos'   },
            { icon: Award,        color: '#8B5E1A', title: 'MCQ Tests + Certificates',  desc: 'Validated question banks across every domain. Pass the test, receive a verifiable PDF certificate by email.',      href: '/tests'    },
            { icon: FileText,     color: '#6B3AD4', title: 'eBooks & Cheatsheets',      desc: 'Course textbooks, cheatsheets, and question banks — downloadable, all free.',                                       href: '/resources'},
            { icon: Calendar,     color: '#1B5FA8', title: 'Events & Activities',       desc: 'CTF competitions, expert talks, industrial visits, and hackathons organised by SITAICS clubs.',                     href: '/events'   },
            { icon: Shield,       color: '#8B5E1A', title: 'Verifiable Credentials',    desc: 'Every certificate has a public verification URL. Employers and institutions can validate authenticity instantly.',   href: '/verify'   },
          ].map(({ icon: Icon, color, title, desc, href }) => (
            <Link key={title} href={href} className="card card-interactive p-6 group">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                style={{ background: color }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display text-base font-semibold mb-2
                group-hover:text-[hsl(var(--primary))] transition-colors"
                style={{ color: 'hsl(var(--foreground))' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed mb-4"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                {desc}
              </p>
              <span className="font-sans text-sm font-medium inline-flex items-center gap-1
                group-hover:gap-2 transition-all"
                style={{ color: 'hsl(var(--primary))' }}>
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          LATEST ARTICLES
          ═══════════════════════════════════════════════════════ */}
      {articles.length > 0 && (
        <section className="container py-14" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-2">Latest writeups</p>
              <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                From the lab notebook
              </h2>
            </div>
            <Link href="/articles" className="hidden md:inline-flex items-center gap-2
              font-sans text-sm font-medium hover:gap-3 transition-all"
              style={{ color: 'hsl(var(--primary))' }}>
              All articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {articles.map((a) => (
              <Link key={a.id} href={`/articles/${a.slug}`}
                className="card card-interactive p-6 group flex flex-col">
                {a.category && (
                  <span className="badge badge-tag mb-4 inline-flex">{a.category}</span>
                )}
                <h3 className="font-display text-base font-semibold mb-3 leading-snug
                  group-hover:text-[hsl(var(--primary))] transition-colors"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  {a.title}
                </h3>
                <p className="font-serif text-sm leading-relaxed mb-4 line-clamp-3"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  {a.excerpt}
                </p>
                <div className="mt-auto flex items-center gap-3 text-xs"
                  style={{ color: 'hsl(var(--foreground-subtle))' }}>
                  {a.published_at && <span>{formatDate(a.published_at)}</span>}
                  {a.reading_time && <span>· {a.reading_time} min read</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          FORUM DISCUSSIONS
          ═══════════════════════════════════════════════════════ */}
      {forumThreads.length > 0 && (
        <section className="container py-14" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-2">Community</p>
              <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                From the discussion floor
              </h2>
            </div>
            <Link href="/forum" className="hidden md:inline-flex items-center gap-2
              font-sans text-sm font-medium hover:gap-3 transition-all"
              style={{ color: 'hsl(var(--primary))' }}>
              All threads <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {forumThreads.map((t: any) => {
              const badgeColor = DOMAIN_BADGE[t.domain] ?? '#1B5FA8';
              return (
                <Link key={t.id} href={`/forum/${t.domain}/${t.id}`}
                  className="card card-interactive p-5 group flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    {/* Domain colored pill */}
                    <span className="font-sans text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${badgeColor}18`,
                        color: badgeColor,
                        border: `1px solid ${badgeColor}40`,
                      }}>
                      {t.domain}
                    </span>
                  </div>
                  <h3 className="font-sans text-sm font-medium leading-snug line-clamp-3 flex-1
                    group-hover:text-[hsl(var(--primary))] transition-colors"
                    style={{ color: 'hsl(var(--foreground))' }}>
                    {t.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs mt-auto"
                    style={{ color: 'hsl(var(--foreground-subtle))' }}>
                    <MessageSquare className="w-3 h-3" />
                    {t.reply_count ?? 0} {t.reply_count === 1 ? 'reply' : 'replies'}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          LATEST VIDEOS
          ═══════════════════════════════════════════════════════ */}
      {videos.length > 0 && (
        <section className="container py-14" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-2">Recent lessons</p>
              <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                Video lessons
              </h2>
            </div>
            <Link href="/videos" className="hidden md:inline-flex items-center gap-2
              font-sans text-sm font-medium hover:gap-3 transition-all"
              style={{ color: 'hsl(var(--primary))' }}>
              All videos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {videos.map((v) => {
              const tileColor = DOMAIN_BADGE[v.domain ?? 'rema'] ?? '#8B5E1A';
              return (
                <Link key={v.id} href={`/videos/${v.slug}`} className="group">
                  <div className="relative aspect-video overflow-hidden rounded-lg"
                    style={{ border: '1px solid hsl(var(--border))' }}>
                    <Image src={getYouTubeThumbnail(v.youtube_id, 'maxres')} alt={v.title}
                      fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    {v.episode_label && (
                      <span className="absolute bottom-3 left-3 font-mono text-[9px]
                        uppercase tracking-wider px-2 py-1 text-white rounded"
                        style={{ background: tileColor }}>
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
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          CLUBS
          ═══════════════════════════════════════════════════════ */}
      {clubs.length > 0 && (
        <section className="container py-14" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-2">Campus life</p>
              <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                Clubs at SITAICS
              </h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club: any) => (
              <Link key={club.id} href={`/clubs/${club.slug}`}
                className="card card-interactive p-6 group flex items-start gap-4">
                {club.logo_url ? (
                  <Image src={club.logo_url} alt={club.name} width={48} height={48}
                    className="rounded-lg shrink-0 group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: '#1B5FA8' }}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold mb-1 leading-tight
                    group-hover:text-[hsl(var(--primary))] transition-colors"
                    style={{ color: 'hsl(var(--foreground))' }}>
                    {club.short_name ?? club.name}
                  </h3>
                  <p className="text-sm line-clamp-2"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {club.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          EVENTS
          ═══════════════════════════════════════════════════════ */}
      {events.length > 0 && (
        <section className="container py-14" style={{ borderTop: '1px solid hsl(var(--border))' }}>
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="eyebrow mb-2">Activities</p>
              <h2 className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                Recent events
              </h2>
            </div>
            <Link href="/events" className="hidden md:inline-flex items-center gap-2
              font-sans text-sm font-medium hover:gap-3 transition-all"
              style={{ color: 'hsl(var(--primary))' }}>
              All events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map((ev: any) => (
              <Link key={ev.id} href="/events"
                className="card card-interactive p-5 group flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="badge badge-tag">{ev.event_type}</span>
                  {ev.clubs && (
                    <span className="text-xs font-semibold"
                      style={{ color: 'hsl(var(--primary))' }}>
                      {ev.clubs.short_name}
                    </span>
                  )}
                </div>
                <h3 className="font-sans text-sm font-semibold leading-snug line-clamp-2 flex-1
                  group-hover:text-[hsl(var(--primary))] transition-colors"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  {ev.title}
                </h3>
                <div className="text-xs mt-auto" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                  {ev.event_date && new Date(ev.event_date).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                  {ev.participants_count && (
                    <span className="ml-2 font-semibold"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      · {ev.participants_count}+ participants
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          TESTS CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="container py-16" style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <div className="card relative overflow-hidden p-10 lg:p-14">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(600px circle at 80% 50%, rgba(27,95,168,0.08), transparent 60%)' }}
            aria-hidden />
          <div className="relative grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: '#6B3AD4' }}>
                <Award className="w-6 h-6 text-white" />
              </div>
              <h2 className="font-display text-3xl font-bold mb-4 leading-tight"
                style={{ color: 'hsl(var(--foreground))' }}>
                Test your skills.
                <br />Earn a certificate.
              </h2>
              <p className="font-serif text-lg leading-relaxed mb-8"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                Pick a test, enter your email, prove what you know. Pass the bar
                — receive a PDF certificate with a unique verification ID.
                No paywall. No catch.
              </p>
              <Link href="/tests" className="btn-primary">
                Browse Tests <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {tests.map((t) => (
                <Link key={t.id} href={`/tests/${t.slug}`}
                  className="card card-interactive block p-5 group">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-sans text-sm font-semibold
                      group-hover:text-[hsl(var(--primary))] transition-colors"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {t.title}
                    </h3>
                    <Terminal className="w-4 h-4 shrink-0"
                      style={{ color: 'hsl(var(--foreground-subtle))' }} />
                  </div>
                  <div className="flex items-center gap-3 text-xs"
                    style={{ color: 'hsl(var(--foreground-subtle))' }}>
                    <span>{t.total_questions} questions</span>
                    <span>·</span>
                    <span>{t.duration_minutes} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
