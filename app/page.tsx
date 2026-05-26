// app/page.tsx — old homepage structure restored + forum activity section added
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, MessageSquare, BookOpen, Video, Headphones, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;

const LOGO =
  'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

// Courses not yet in DB — kept as static config
const COMING_SOON = [
  { label: 'Cloud',        note: 'coming soon' },
  { label: 'Crypto',       note: 'coming soon' },
  { label: 'Web Dev',      note: 'coming soon' },
];

export default async function HomePage() {
  const supabase = createClient();

  const [
    { data: courses },
    { count: articleCount },
    { count: videoCount },
    { count: podcastCount },
    { data: recentArticles },
    { data: recentThreads },
    { count: forumCount },
  ] = await Promise.all([
    supabase
      .from('courses')
      .select('title, slug, video_count')
      .eq('is_published', true)
      .order('created_at', { ascending: true }),
    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('podcasts')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('articles')
      .select('id, slug, title, category, reading_time, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(4),
    supabase
      .from('forum_threads')
      .select('id, title, domain, author_name, reply_count, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('forum_threads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
  ]);

  const publishedCourses = courses ?? [];

  const STATS = [
    { label: 'Articles',      value: articleCount ?? 0 },
    { label: 'Videos',        value: videoCount ?? 0 },
    { label: 'Forum Threads', value: forumCount ?? 0 },
    { label: 'Domains',       value: 4 },
  ];

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-navy-800 bg-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 border-grid opacity-10" aria-hidden />
        <div className="container py-14 lg:py-18">
          <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-center">

            {/* Left — text */}
            <div>
              {/* Logo + label */}
              <div className="flex items-center gap-3 mb-6">
                <Image src={LOGO} alt="EpochZero" width={48} height={48} className="rounded" />
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500">
                  EpochZero Learn — Live Platform
                </span>
              </div>
              <h1 className="font-mono text-5xl lg:text-6xl font-bold text-bone-50 leading-none mb-1">
                Learn.
              </h1>
              <h1 className="font-mono text-5xl lg:text-6xl font-bold text-gold-500 leading-none mb-1">
                Compete.
              </h1>
              <h1 className="font-mono text-5xl lg:text-6xl font-bold text-bone-50 leading-none mb-8">
                Get Certified.
              </h1>
              <p className="font-mono text-sm text-bone-300 leading-relaxed mb-8 max-w-lg">
                A structured learning platform for Reverse Engineering, Cloud Security,
                Cryptography, and Web Development. Articles, videos, tests, and peer
                discussion — all in one place.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/learn"
                  className="inline-flex items-center gap-2 px-5 py-3
                    bg-gold-500 text-navy-950 font-mono text-sm uppercase tracking-wider
                    hover:bg-gold-400 transition-colors">
                  Browse Courses <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/forum"
                  className="inline-flex items-center gap-2 px-5 py-3
                    border border-navy-600 text-bone-200 font-mono text-sm uppercase tracking-wider
                    hover:border-navy-500 hover:text-bone-50 transition-colors">
                  Join Discussion
                </Link>
              </div>
            </div>

            {/* Right — terminal widget */}
            <div className="bg-navy-800/80 border border-navy-700 font-mono text-sm">
              {/* Terminal title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-navy-700 bg-navy-900/60">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-auto text-[10px] text-bone-500 uppercase tracking-widest">
                  EPOCHZERO: // SESSION
                </span>
              </div>
              {/* Terminal body */}
              <div className="p-5 space-y-4">
                {/* Courses */}
                <div>
                  <p className="text-bone-300 text-xs mb-1.5">
                    <span className="text-gold-500">$</span> ez courses --list
                  </p>
                  {publishedCourses.map((c, i) => {
                    const isLast = i === publishedCourses.length - 1 && COMING_SOON.length === 0;
                    return (
                      <p key={c.slug} className="text-bone-200 text-xs pl-2">
                        <span className="text-bone-600">{isLast ? '└──' : '├──'}</span>{' '}
                        {c.title?.replace('Reverse Engineering and Malware Analysis', 'REMA') ?? c.slug}{' '}
                        <span className="text-gold-500">{c.video_count} lessons</span>
                      </p>
                    );
                  })}
                  {COMING_SOON.map((c, i) => (
                    <p key={c.label} className="text-bone-200 text-xs pl-2">
                      <span className="text-bone-600">{i === COMING_SOON.length - 1 ? '└──' : '├──'}</span>{' '}
                      {c.label}{' '}
                      <span className="text-bone-500">{c.note}</span>
                    </p>
                  ))}
                </div>
                {/* Stats */}
                <div>
                  <p className="text-bone-300 text-xs mb-1.5">
                    <span className="text-gold-500">$</span> ez stats --live
                  </p>
                  <p className="text-bone-200 text-xs pl-2">
                    <span className="text-bone-600">├──</span>{' '}
                    articles <span className="text-gold-500">{articleCount ?? 0}</span>
                  </p>
                  <p className="text-bone-200 text-xs pl-2">
                    <span className="text-bone-600">├──</span>{' '}
                    podcasts <span className="text-gold-500">{podcastCount ?? 0} episodes</span>
                  </p>
                  <p className="text-bone-200 text-xs pl-2">
                    <span className="text-bone-600">└──</span>{' '}
                    forum threads <span className="text-gold-500">{forumCount ?? 0} active</span>
                  </p>
                </div>
                {/* Prompt */}
                <p className="text-bone-500 text-xs">
                  <span className="text-gold-500">$</span>{' '}
                  <span className="animate-pulse">_</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────── */}
      <section className="border-b border-navy-800 bg-navy-900/40">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-navy-800">
            {STATS.map(({ label, value }) => (
              <div key={label} className="px-8 py-5 text-center">
                <div className="font-mono text-3xl font-bold text-bone-50 tabular-nums">
                  {value}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-400 mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest Articles + Forum Activity ─────────────────────────── */}
      <section className="border-b border-navy-800">
        <div className="container py-12 grid lg:grid-cols-[1fr_380px] gap-10">

          {/* Articles */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500">
                // Latest Articles
              </span>
              <Link href="/articles"
                className="font-mono text-xs text-bone-400 hover:text-gold-500
                  transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="border border-navy-800 divide-y divide-navy-800">
              {(recentArticles ?? []).length === 0 ? (
                <div className="p-8 text-center font-mono text-sm text-bone-500">
                  No articles published yet.
                </div>
              ) : (
                (recentArticles ?? []).map(a => (
                  <Link key={a.id} href={`/articles/${a.slug}`}
                    className="flex items-center gap-4 p-4 hover:bg-navy-900/40
                      transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[9px] uppercase tracking-widest
                          px-1.5 py-0.5 border border-navy-700 text-bone-400">
                          {a.category}
                        </span>
                        {a.reading_time && (
                          <span className="font-mono text-[10px] text-bone-500">
                            {a.reading_time} min read
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-sm text-bone-100
                        group-hover:text-gold-500 transition-colors leading-snug">
                        {a.title}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-bone-600 group-hover:text-gold-500
                      transition-colors shrink-0" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* ── Forum Activity — NEW section ── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500">
                // Forum Activity
              </span>
              <Link href="/forum"
                className="font-mono text-xs text-bone-400 hover:text-gold-500
                  transition-colors flex items-center gap-1">
                All threads <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {(recentThreads ?? []).length === 0 ? (
                <div className="border border-dashed border-navy-800 p-8 text-center
                  font-mono text-sm text-bone-500">
                  No threads yet.{' '}
                  <Link href="/forum" className="text-gold-500 hover:underline">
                    Start a discussion.
                  </Link>
                </div>
              ) : (
                (recentThreads ?? []).map(t => (
                  <Link key={t.id} href={`/forum/${t.domain}/${t.id}`}
                    className="block border border-navy-800 hover:border-navy-600
                      p-4 transition-colors group">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={[
                        'font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border',
                        t.domain === 'rema'   && 'text-gold-500 border-gold-500/30',
                        t.domain === 'cloud'  && 'text-blue-400 border-blue-400/30',
                        t.domain === 'crypto' && 'text-purple-400 border-purple-400/30',
                        t.domain === 'webdev' && 'text-emerald-400 border-emerald-400/30',
                      ].filter(Boolean).join(' ')}>
                        {t.domain}
                      </span>
                      <span className="font-mono text-[10px] text-bone-500 truncate">
                        {t.author_name}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-bone-200
                      group-hover:text-gold-500 transition-colors leading-snug line-clamp-2">
                      {t.title}
                    </div>
                    <div className="font-mono text-[10px] text-bone-500 mt-2
                      flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {t.reply_count ?? 0} {t.reply_count === 1 ? 'reply' : 'replies'}
                    </div>
                  </Link>
                ))
              )}
              <Link href="/forum"
                className="block text-center font-mono text-xs text-bone-500
                  hover:text-gold-500 transition-colors py-3 border border-dashed border-navy-800">
                View all forum threads →
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
