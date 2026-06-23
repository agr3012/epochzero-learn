import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare, ArrowRight, BookOpen, Video,
  GraduationCap, FileText, Award, Terminal, Calendar,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, getYouTubeThumbnail } from '@/lib/utils';

export const revalidate = 3600;

const COMING_SOON = ['Crypto', 'Web Dev'];

async function getHomeData() {
  const supabase = createClient();
  const [
    articlesRes, videosRes, testsRes, coursesRes,
    videoCountRes, assessmentCountRes, questionCountRes,
    articleCountRes, podcastCountRes, topicCountRes,
    clubsRes, eventsRes, forumThreadsRes,
  ] = await Promise.all([
    supabase.from('articles').select('id, slug, title, excerpt, category, published_at, reading_time').eq('is_published', true).order('published_at', { ascending: false }).limit(3),
    supabase.from('videos').select('id, slug, youtube_id, title, episode_label, duration_seconds, published_at').eq('is_published', true).order('published_at', { ascending: false }).limit(3),
    supabase.from('tests').select('id, slug, title, description, malware_family, duration_minutes, total_questions').eq('is_published', true).order('created_at', { ascending: false }).limit(3),
    supabase.from('courses').select('id, title, slug, short_title').eq('is_published', true).order('created_at', { ascending: true }),
    supabase.from('videos').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('tests').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('test_questions').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('podcasts').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('topics').select('*', { count: 'exact', head: true }).not('slug', 'ilike', '%knowledge-check%'),
    supabase.from('clubs').select('id, slug, name, short_name, tagline, logo_url, is_active').eq('is_active', true).order('order_index'),
    supabase.from('club_events').select('id, slug, title, subtitle, event_type, status, event_date, registrations_count, participants_count, clubs(short_name, slug)').eq('is_published', true).neq('slug', 'digital-hygiene-drive-2025').order('event_date', { ascending: false }).limit(4),
    supabase.from('forum_threads').select('id, title, domain, author_name, reply_count, created_at').eq('status', 'published').order('created_at', { ascending: false }).limit(4),
  ]);

  const courses = coursesRes.data ?? [];
  const domainByCourseSlug: Record<string, string> = {
    'rema': 'rema', 'cloud-security': 'cloud', 'crypto': 'crypto', 'webdev': 'webdev',
  };
  const coursesWithCount = await Promise.all(
    courses.map(async (course) => {
      const domainKey = domainByCourseSlug[course.slug];
      if (!domainKey) return { ...course, video_count: 0 };
      const { count } = await supabase.from('videos').select('*', { count: 'exact', head: true }).eq('is_published', true).eq('domain', domainKey);
      return { ...course, video_count: count ?? 0 };
    })
  );

  return {
    articles: articlesRes.data ?? [],
    videos:   videosRes.data ?? [],
    tests:    testsRes.data ?? [],
    courses:  coursesWithCount,
    clubs:    clubsRes.data ?? [],
    events:   eventsRes.data ?? [],
    forumThreads: forumThreadsRes.data ?? [],
    stats: {
      domains:          courses.length,
      video_lessons:    videoCountRes.count    ?? 0,
      assessments:      assessmentCountRes.count ?? 0,
      total_questions:  questionCountRes.count  ?? 0,
      articles:         articleCountRes.count   ?? 0,
      podcast_episodes: podcastCountRes.count   ?? 0,
      content_topics:   topicCountRes.count     ?? 0,
    },
  };
}

// Domain badge colours (content metadata tiles — like CyberDefenders lab colours)
const DOMAIN_BADGE: Record<string, string> = {
  rema:   'bg-[rgba(232,160,32,0.12)] text-[#E8A020] border border-[rgba(232,160,32,0.25)]',
  cloud:  'bg-[rgba(56,139,253,0.12)] text-[#58A6FF] border border-[rgba(56,139,253,0.25)]',
  crypto: 'bg-[rgba(139,92,246,0.12)] text-[#A78BFA] border border-[rgba(139,92,246,0.25)]',
  webdev: 'bg-[rgba(34,197,94,0.12)]  text-[#4ADE80] border border-[rgba(34,197,94,0.25)]',
};

export default async function HomePage() {
  const { articles, videos, tests, courses, clubs, events, stats, forumThreads } = await getHomeData();

  const statBlocks = [
    { label: 'Domains',       value: `${stats.domains}+`         },
    { label: 'Video Lessons', value: `${stats.video_lessons}+`   },
    { label: 'Assessments',   value: `${stats.assessments}`      },
    { label: 'MCQ Questions', value: `${stats.total_questions}+` },
  ];

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-navy-800/60">
        {/* Very subtle grid — reduced opacity vs before */}
        <div className="absolute inset-0 border-grid opacity-20" aria-hidden />
        {/* No gold radial gradient — clean dark */}
        <div className="container relative py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left col */}
            <div className="lg:col-span-7">
              {/* Logo + wordmark */}
              <div className="flex items-center gap-4 mb-8">
                <Image
                  src="https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png"
                  alt="EpochZero Learn"
                  width={72}
                  height={72}
                  className="shrink-0 drop-shadow-2xl"
                  priority
                />
                <div>
                  {/* Sans wordmark — more professional */}
                  <div className="font-display text-xl font-bold text-[hsl(var(--foreground))] tracking-tight">
                    EpochZero Learn
                  </div>
                  <div className="text-sm text-[hsl(var(--foreground-muted))] mt-0.5">
                    Multi-Domain Tech Learning Hub
                  </div>
                </div>
              </div>

              {/* Live status pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5
                rounded-full border border-[hsl(var(--primary)/0.3)]
                bg-[hsl(var(--primary)/0.06)] mb-8 animate-fade-up">
                <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
                <span className="font-sans text-xs font-medium text-[hsl(var(--primary))]">
                  Live Platform
                </span>
              </div>

              {/* H1 — display font, no mono */}
              <h1
                className="font-display text-5xl lg:text-7xl font-bold leading-[1.0]
                  tracking-tight text-[hsl(var(--foreground))] mb-6 animate-fade-up text-balance"
                style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
              >
                Learn.
                <br />
                <span className="text-[hsl(var(--primary))]">Compete.</span>
                <br />
                Get Certified.
              </h1>

              <p
                className="font-serif text-xl text-[hsl(var(--foreground-muted))] max-w-2xl
                  leading-relaxed mb-10 animate-fade-up"
                style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
              >
                A multi-domain learning hub for{' '}
                <span className="text-[hsl(var(--primary))] font-sans font-semibold">REMA</span>,{' '}
                <span className="text-[hsl(var(--primary))] font-sans font-semibold">Cloud</span>,{' '}
                <span className="text-[hsl(var(--primary))] font-sans font-semibold">Cryptography</span>, and{' '}
                <span className="text-[hsl(var(--primary))] font-sans font-semibold">Web Dev</span>.
                Articles, video lessons, podcast, MCQ tests with verifiable certificates, and CTF events.
              </p>

              <div
                className="flex flex-wrap gap-3 animate-fade-up"
                style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
              >
                <Link href="/learn" className="btn-primary">
                  <GraduationCap className="w-4 h-4" />
                  Browse Courses
                </Link>
                <Link href="/videos" className="btn-ghost">
                  <Video className="w-4 h-4" />
                  Watch Lessons
                </Link>
              </div>

              {/* Stat blocks */}
              <div
                className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl animate-fade-up"
                style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
              >
                {statBlocks.map((s) => (
                  <div key={s.label} className="border-l-2 border-[hsl(var(--primary)/0.5)] pl-4">
                    <div className="font-display text-3xl text-[hsl(var(--foreground))] font-bold tabular-nums">
                      {s.value}
                    </div>
                    <div className="text-xs text-[hsl(var(--foreground-muted))] mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right col — terminal (keep mono, it's a terminal!) */}
            <div
              className="lg:col-span-5 animate-fade-up"
              style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
            >
              <div className="rounded-xl overflow-hidden border border-navy-700/60 shadow-2xl">
                {/* Terminal title bar */}
                <div className="flex items-center justify-between px-4 py-2.5
                  border-b border-navy-700 bg-navy-950">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-crimson-500" />
                    <span className="w-3 h-3 rounded-full bg-gold-500" />
                    <span className="w-3 h-3 rounded-full bg-bone-300/30" />
                  </div>
                  <span className="font-mono text-[10px] text-bone-400">
                    epochzero://session
                  </span>
                </div>

                {/* Terminal body — keep font-mono here */}
                <div className="p-6 bg-navy-950 font-mono text-sm leading-relaxed space-y-1">
                  <div className="text-bone-400 pb-1">
                    <span className="text-[hsl(var(--primary))]">$</span> ez courses --list
                  </div>
                  {courses.map((course) => (
                    <div key={course.slug} className="text-bone-200">
                      ├── {course.short_title ?? course.title}{' '}
                      <span className="text-[hsl(var(--primary))]">{course.video_count} lessons</span>
                    </div>
                  ))}
                  {COMING_SOON.map((label, i) => (
                    <div key={label} className="text-bone-400">
                      {i === COMING_SOON.length - 1 ? '└──' : '├──'} {label}{' '}
                      <span className="text-bone-500">coming soon</span>
                    </div>
                  ))}
                  <div className="text-bone-400 pt-3 pb-1">
                    <span className="text-[hsl(var(--primary))]">$</span> ez stats --live
                  </div>
                  <div className="text-bone-200">├── articles <span className="text-[hsl(var(--primary))]">{stats.articles}</span></div>
                  <div className="text-bone-200">├── podcasts <span className="text-[hsl(var(--primary))]">{stats.podcast_episodes} episodes</span></div>
                  <div className="text-bone-200">├── questions <span className="text-[hsl(var(--primary))]">{stats.total_questions} MCQs</span></div>
                  <div className="text-bone-200">└── topics <span className="text-[hsl(var(--primary))]">{stats.content_topics} covered</span></div>
                  <div className="text-bone-400 pt-3">
                    <span className="text-[hsl(var(--primary))]">$</span>{' '}
                    <span className="inline-block w-2 h-4 bg-[hsl(var(--primary))] animate-pulse align-middle" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────── */}
      <section className="container py-24 border-t border-navy-800/60">
        <div className="mb-12">
          {/* Eyebrow — no "//" prefix */}
          <p className="eyebrow mb-3">Multi-Domain</p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-[hsl(var(--foreground))]">
            Learning, assessments, and events — under one roof.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: BookOpen,    title: 'Articles & Writeups',     desc: 'In-depth technical writeups across malware analysis, cloud security, cryptography, and modern web development.', href: '/articles' },
            { icon: Video,       title: 'Video Lessons',           desc: 'Step-by-step lessons with synchronised lab notes, references, and exercises. YouTube-embedded for one-click viewing.', href: '/videos' },
            { icon: GraduationCap, title: 'MCQ Tests + Certificates', desc: 'Validated question banks across every domain. Pass the test, receive a verifiable PDF certificate by email.', href: '/tests' },
            { icon: FileText,    title: 'eBooks & Cheatsheets',    desc: 'Course textbooks, cheatsheets, and question banks — downloadable, all free.', href: '/resources' },
            { icon: Calendar,    title: 'Events & Activities',     desc: 'CTF competitions, expert talks, industrial visits, hackathons, and extension outreach organised by SITAICS clubs.', href: '/events' },
            { icon: Award,       title: 'Verifiable Credentials',  desc: 'Every certificate has a public verification URL. Employers and institutions can validate authenticity instantly.', href: '/verify' },
          ].map(({ icon: Icon, title, desc, href }) => (
            <Link key={title} href={href} className="card card-interactive p-7 group">
              {/* Icon with subtle gold — used only here as main visual anchor */}
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.1)]
                flex items-center justify-center mb-5
                group-hover:bg-[hsl(var(--primary)/0.18)] transition-colors">
                <Icon className="w-5 h-5 text-[hsl(var(--primary))]" />
              </div>
              <h3 className="font-display text-base font-semibold
                text-[hsl(var(--foreground))] mb-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                {title}
              </h3>
              <p className="text-sm text-[hsl(var(--foreground-muted))] leading-relaxed mb-4">
                {desc}
              </p>
              <span className="font-sans text-sm font-medium text-[hsl(var(--primary))]
                inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── LATEST ARTICLES ──────────────────────────────────────────── */}
      {articles.length > 0 && (
        <section className="container py-16 border-t border-navy-800/60">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="eyebrow mb-3">Latest writeups</p>
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
                From the lab notebook
              </h2>
            </div>
            <Link href="/articles"
              className="hidden md:inline-flex items-center gap-2
                font-sans text-sm font-medium text-[hsl(var(--primary))]
                hover:gap-3 transition-all">
              All articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {articles.map((a) => (
              <Link key={a.id} href={`/articles/${a.slug}`}
                className="card card-interactive p-6 group">
                {a.category && (
                  <span className="badge badge-tag mb-4 inline-flex">{a.category}</span>
                )}
                <h3 className="font-display text-lg font-semibold
                  text-[hsl(var(--foreground))] mb-3
                  group-hover:text-[hsl(var(--primary))] transition-colors">
                  {a.title}
                </h3>
                <p className="font-serif text-sm text-[hsl(var(--foreground-muted))]
                  leading-relaxed mb-4 line-clamp-3">
                  {a.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-[hsl(var(--foreground-subtle))]">
                  {a.published_at && <span>{formatDate(a.published_at)}</span>}
                  {a.reading_time && <span>· {a.reading_time} min read</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── FORUM DISCUSSIONS ────────────────────────────────────────── */}
      {forumThreads.length > 0 && (
        <section className="container py-16 border-t border-navy-800/60">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="eyebrow mb-3">Forum discussions</p>
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
                From the discussion floor
              </h2>
            </div>
            <Link href="/forum"
              className="hidden md:inline-flex items-center gap-2
                font-sans text-sm font-medium text-[hsl(var(--primary))]
                hover:gap-3 transition-all">
              All threads <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {forumThreads.map((t: any) => (
              <Link key={t.id} href={`/forum/${t.domain}/${t.id}`}
                className="card card-interactive p-5 group flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Domain badge — coloured tile like CyberDefenders */}
                  <span className={`font-sans text-xs font-medium
                    px-2 py-0.5 rounded-full ${DOMAIN_BADGE[t.domain] ?? 'badge-tag'}`}>
                    {t.domain}
                  </span>
                  <span className="text-xs text-[hsl(var(--foreground-subtle))] truncate">
                    {t.author_name}
                  </span>
                </div>
                <h3 className="font-sans text-sm font-medium
                  text-[hsl(var(--foreground))]
                  group-hover:text-[hsl(var(--primary))] transition-colors
                  leading-snug line-clamp-3 flex-1">
                  {t.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs
                  text-[hsl(var(--foreground-subtle))] mt-auto">
                  <MessageSquare className="w-3 h-3" />
                  {t.reply_count ?? 0} {t.reply_count === 1 ? 'reply' : 'replies'}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/forum"
              className="font-sans text-sm font-medium text-[hsl(var(--primary))]
                hover:opacity-80 transition-opacity inline-flex items-center gap-2">
              Join the discussion <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* ── LATEST VIDEOS ────────────────────────────────────────────── */}
      {videos.length > 0 && (
        <section className="container py-16 border-t border-navy-800/60">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="eyebrow mb-3">Recent lessons</p>
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
                Video lessons
              </h2>
            </div>
            <Link href="/videos"
              className="hidden md:inline-flex items-center gap-2
                font-sans text-sm font-medium text-[hsl(var(--primary))]
                hover:gap-3 transition-all">
              All videos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {videos.map((v) => (
              <Link key={v.id} href={`/videos/${v.slug}`} className="group">
                <div className="relative aspect-video overflow-hidden rounded-lg
                  border border-navy-700/60
                  group-hover:border-navy-600 transition-colors">
                  <Image
                    src={getYouTubeThumbnail(v.youtube_id, 'maxres')}
                    alt={v.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />
                  {v.episode_label && (
                    <span className="absolute bottom-3 left-3 font-mono text-[9px]
                      uppercase tracking-wider text-[hsl(var(--primary))]
                      border border-[hsl(var(--primary)/0.4)] px-2 py-1
                      bg-navy-950/80 rounded">
                      {v.episode_label}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-base font-semibold
                  text-[hsl(var(--foreground))] mt-3
                  group-hover:text-[hsl(var(--primary))] transition-colors
                  line-clamp-2">
                  {v.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── TECH CLUBS ───────────────────────────────────────────────── */}
      {clubs.length > 0 && (
        <section className="container py-16 border-t border-navy-800/60">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="eyebrow mb-3">Student clubs & outreach</p>
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
                Clubs & Activities at SITAICS
              </h2>
            </div>
            <Link href="/clubs"
              className="hidden md:inline-flex items-center gap-2
                font-sans text-sm font-medium text-[hsl(var(--primary))]
                hover:gap-3 transition-all">
              All clubs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((club: any) => (
              <Link key={club.id} href={`/clubs/${club.slug}`}
                className="card card-interactive p-6 group flex items-start gap-5">
                {club.logo_url && (
                  <Image
                    src={club.logo_url}
                    alt={club.name}
                    width={56}
                    height={56}
                    className="shrink-0 rounded-lg group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold
                    text-[hsl(var(--foreground))] mb-1
                    group-hover:text-[hsl(var(--primary))] transition-colors leading-tight">
                    {club.short_name ?? club.name}
                  </h3>
                  <p className="text-sm text-[hsl(var(--foreground-muted))] mb-3">
                    {club.tagline}
                  </p>
                  <span className="font-sans text-sm font-medium
                    text-[hsl(var(--primary))]
                    inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    View club <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── RECENT EVENTS ────────────────────────────────────────────── */}
      {events.length > 0 && (
        <section className="container py-16 border-t border-navy-800/60">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="eyebrow mb-3">Activities</p>
              <h2 className="font-display text-3xl font-bold text-[hsl(var(--foreground))]">
                Recent events
              </h2>
            </div>
            <Link href="/events"
              className="hidden md:inline-flex items-center gap-2
                font-sans text-sm font-medium text-[hsl(var(--primary))]
                hover:gap-3 transition-all">
              All events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {events.map((ev: any) => (
              <Link key={ev.id} href="/events"
                className="card card-interactive p-5 group flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge badge-tag">
                    {ev.event_type}
                  </span>
                  {ev.clubs && (
                    <span className="text-xs font-medium text-[hsl(var(--primary))]">
                      {ev.clubs.short_name}
                    </span>
                  )}
                </div>
                <h3 className="font-sans text-sm font-semibold
                  text-[hsl(var(--foreground))]
                  group-hover:text-[hsl(var(--primary))] transition-colors
                  leading-snug line-clamp-2">
                  {ev.title}
                </h3>
                {ev.event_date && (
                  <div className="text-xs text-[hsl(var(--foreground-subtle))] mt-auto">
                    {new Date(ev.event_date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                )}
                {ev.participants_count && (
                  <div className="text-xs text-[hsl(var(--foreground-subtle))]">
                    <span className="text-[hsl(var(--foreground))] font-semibold">
                      {ev.participants_count}+
                    </span> participants
                  </div>
                )}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/events"
              className="font-sans text-sm font-medium text-[hsl(var(--primary))]
                hover:opacity-80 transition-opacity inline-flex items-center gap-2">
              View all events <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>
      )}

      {/* ── TESTS CTA ─────────────────────────────────────────────────── */}
      <section className="container py-24 border-t border-navy-800/60">
        <div className="card relative overflow-hidden p-10 lg:p-14">
          {/* Subtle gold glow — disciplined, single use */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(600px circle at 80% 50%, rgba(232,160,32,0.06), transparent 60%)' }}
            aria-hidden
          />
          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.12)]
                flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
              <h2 className="font-display text-3xl lg:text-4xl font-bold
                text-[hsl(var(--foreground))] mb-4 leading-tight">
                Test your skills.
                <br />
                Earn a certificate.
              </h2>
              <p className="font-serif text-lg text-[hsl(var(--foreground-muted))]
                mb-8 leading-relaxed">
                Pick a test, enter your email, prove what you know. Pass the bar — receive
                a PDF certificate with a unique verification ID. No paywall. No catch.
              </p>
              <Link href="/tests" className="btn-primary">
                Browse Tests <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {tests.length > 0 ? (
                tests.map((t) => (
                  <Link key={t.id} href={`/tests/${t.slug}`}
                    className="card card-interactive block p-5 group">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-sans text-sm font-semibold
                        text-[hsl(var(--foreground))]
                        group-hover:text-[hsl(var(--primary))] transition-colors">
                        {t.title}
                      </h3>
                      <Terminal className="w-4 h-4 text-[hsl(var(--primary)/0.6)]" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[hsl(var(--foreground-subtle))]">
                      <span>{t.total_questions} questions</span>
                      <span>·</span>
                      <span>{t.duration_minutes} min</span>
                      {t.malware_family && (
                        <>
                          <span>·</span>
                          <span className="text-crimson-400">{t.malware_family}</span>
                        </>
                      )}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 border border-dashed border-navy-700 rounded-lg text-center">
                  <p className="text-sm text-[hsl(var(--foreground-muted))]">Tests coming soon.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
