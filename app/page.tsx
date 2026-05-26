// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { ArrowRight, BookOpen, FlaskConical, MessageSquare, Users, CalendarDays, Award } from 'lucide-react';

export const revalidate = 60;

const DOMAINS = [
  {
    slug: 'rema', label: 'REMA',
    full: 'Reverse Engineering & Malware Analysis',
    color: 'border-gold-500/40 hover:border-gold-500',
    tag: 'text-gold-500 border-gold-500/40',
    desc: 'Static & dynamic analysis, YARA rules, unpacking, IOC extraction, malware triage.',
  },
  {
    slug: 'cloud', label: 'Cloud Security',
    full: 'Cloud Architecture & Threat Modelling',
    color: 'border-blue-500/40 hover:border-blue-500',
    tag: 'text-blue-400 border-blue-400/40',
    desc: 'Shared responsibility, IAM, data protection, cloud forensics, attack surfaces.',
  },
  {
    slug: 'crypto', label: 'Cryptography',
    full: 'Applied Cryptography & PKI',
    color: 'border-purple-500/40 hover:border-purple-500',
    tag: 'text-purple-400 border-purple-400/40',
    desc: 'Symmetric/asymmetric systems, hash functions, TLS, PKI, cryptanalysis techniques.',
    soon: true,
  },
  {
    slug: 'webdev', label: 'Web Development',
    full: 'Full Stack & Secure Coding',
    color: 'border-emerald-500/40 hover:border-emerald-500',
    tag: 'text-emerald-400 border-emerald-400/40',
    desc: 'React, Node.js, REST APIs, databases, deployment, secure coding practices.',
    soon: true,
  },
];

export default async function HomePage() {
  const supabase = createClient();

  // Fetch counts
  const [
    { count: articleCount },
    { count: videoCount },
    { count: forumCount },
    { data: recentArticles },
    { data: recentThreads },
    { data: domainCounts },
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('videos').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles')
      .select('id, slug, title, category, reading_time, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(4),
    supabase.from('forum_threads')
      .select('id, title, domain, author_name, reply_count, created_at')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('articles')
      .select('category')
      .eq('is_published', true),
  ]);

  // Count articles per domain
  const domainMap: Record<string, number> = {};
  for (const row of domainCounts ?? []) {
    const key = (row.category as string)?.toLowerCase().replace(/\s/g, '') ?? 'other';
    domainMap[key] = (domainMap[key] ?? 0) + 1;
  }

  const STATS = [
    { label: 'Articles',     value: articleCount ?? 0 },
    { label: 'Videos',       value: videoCount ?? 0 },
    { label: 'Forum Threads',value: forumCount ?? 0 },
    { label: 'Domains',      value: 4 },
  ];

  function domainArticleCount(slug: string) {
    const map: Record<string, string[]> = {
      rema:   ['rema', 'reverseengineering', 'malware'],
      cloud:  ['cloud', 'cloudsecurity'],
      crypto: ['crypto', 'cryptography'],
      webdev: ['webdev', 'webdevelopment'],
    };
    return Object.entries(domainMap)
      .filter(([k]) => (map[slug] ?? [slug]).some(m => k.includes(m)))
      .reduce((s, [, v]) => s + v, 0);
  }

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-navy-800 bg-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 border-grid opacity-10" aria-hidden />
        <div className="container py-16 lg:py-20">
          <div className="max-w-2xl">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
              EpochZero Learn — Live Platform
            </div>
            <h1 className="font-mono text-5xl lg:text-6xl font-bold text-bone-50 leading-none mb-2">
              Learn.
            </h1>
            <h1 className="font-mono text-5xl lg:text-6xl font-bold text-gold-500 leading-none mb-2">
              Compete.
            </h1>
            <h1 className="font-mono text-5xl lg:text-6xl font-bold text-bone-50 leading-none mb-8">
              Get Certified.
            </h1>
            <p className="font-serif text-lg text-bone-300 leading-relaxed mb-8 max-w-lg">
              A structured learning platform for Reverse Engineering, Cloud Security,
              Cryptography, and Web Development. Articles, videos, tests, and peer discussion
              — all in one place.
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
                  hover:border-gold-500/50 hover:text-bone-50 transition-colors">
                Join Discussion
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section className="border-b border-navy-800 bg-navy-900/50">
        <div className="container py-0">
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

      {/* ── Domains ──────────────────────────────────────────────────────── */}
      <section className="border-b border-navy-800">
        <div className="container py-14">
          <div className="mb-8">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-2">
              // Domains
            </div>
            <h2 className="font-mono text-2xl font-bold text-bone-50">
              Four specialisations. One platform.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOMAINS.map(d => (
              <Link key={d.slug}
                href={d.soon ? '#' : `/learn?domain=${d.slug}`}
                className={cn(
                  'border p-5 block transition-colors group',
                  d.color,
                  d.soon && 'pointer-events-none opacity-60',
                )}>
                <div className="flex items-start justify-between mb-4">
                  <span className={cn(
                    'font-mono text-[9px] uppercase tracking-widest px-2 py-1 border',
                    d.tag,
                  )}>
                    {d.label}
                  </span>
                  {d.soon
                    ? <span className="font-mono text-[9px] text-bone-500 uppercase tracking-wider">Soon</span>
                    : <span className="font-mono text-[10px] text-bone-400">
                        {domainArticleCount(d.slug)} articles
                      </span>
                  }
                </div>
                <div className="font-mono text-sm font-semibold text-bone-100
                  group-hover:text-gold-500 transition-colors mb-2 leading-snug">
                  {d.full}
                </div>
                <p className="font-mono text-[11px] text-bone-400 leading-relaxed">
                  {d.desc}
                </p>
                {!d.soon && (
                  <div className="mt-4 font-mono text-xs text-gold-500 flex items-center gap-1
                    group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Articles + Forum Activity ─────────────────────────────── */}
      <section className="border-b border-navy-800">
        <div className="container py-14 grid lg:grid-cols-[1fr_380px] gap-10">

          {/* Articles */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-1">
                  // Latest Articles
                </div>
              </div>
              <Link href="/articles"
                className="font-mono text-xs text-bone-400 hover:text-gold-500
                  transition-colors flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-0 border border-navy-800 divide-y divide-navy-800">
              {(recentArticles ?? []).length === 0 ? (
                <div className="p-8 text-center font-mono text-sm text-bone-500">
                  No articles yet.
                </div>
              ) : (
                (recentArticles ?? []).map(article => (
                  <Link key={article.id} href={`/articles/${article.slug}`}
                    className="flex items-start gap-4 p-5 hover:bg-navy-900/40
                      transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-mono text-[9px] uppercase tracking-widest
                          px-1.5 py-0.5 border border-navy-700 text-bone-400">
                          {article.category}
                        </span>
                        {article.reading_time && (
                          <span className="font-mono text-[10px] text-bone-500">
                            {article.reading_time} min read
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-sm text-bone-100
                        group-hover:text-gold-500 transition-colors leading-snug">
                        {article.title}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-bone-600 group-hover:text-gold-500
                      transition-colors shrink-0 mt-1" />
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Forum Activity */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500">
                // Forum Activity
              </div>
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
                  No threads yet.
                </div>
              ) : (
                (recentThreads ?? []).map(t => (
                  <Link key={t.id}
                    href={`/forum/${t.domain}/${t.id}`}
                    className="block border border-navy-800 hover:border-navy-600
                      p-4 transition-colors group">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn(
                        'font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 border',
                        t.domain === 'rema'   && 'text-gold-500 border-gold-500/30',
                        t.domain === 'cloud'  && 'text-blue-400 border-blue-400/30',
                        t.domain === 'crypto' && 'text-purple-400 border-purple-400/30',
                        t.domain === 'webdev' && 'text-emerald-400 border-emerald-400/30',
                      )}>
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
                    <div className="font-mono text-[10px] text-bone-500 mt-2 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {t.reply_count ?? 0} {t.reply_count === 1 ? 'reply' : 'replies'}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Campus ───────────────────────────────────────────────────────── */}
      <section className="border-b border-navy-800">
        <div className="container py-14 grid md:grid-cols-3 gap-8">

          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
              // Campus
            </div>
            <p className="font-mono text-xs text-bone-400 leading-relaxed">
              Student clubs, events, workshops, CTF competitions, and industrial visits.
              All linked to the learning domains.
            </p>
          </div>

          <div className="border border-navy-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-gold-500" />
              <span className="font-mono text-xs uppercase tracking-wider text-bone-200">Clubs</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'REMA Club',           href: '/clubs/rema',       tag: 'Active' },
                { label: 'Full Stack Dev Club',  href: '/clubs/fullstack',  tag: 'Active' },
                { label: 'Extension Activity',   href: '/clubs/extension',  tag: 'Active' },
              ].map(c => (
                <Link key={c.href} href={c.href}
                  className="flex items-center justify-between font-mono text-xs
                    text-bone-300 hover:text-gold-500 transition-colors py-1">
                  {c.label}
                  <span className="text-[9px] text-emerald-400 uppercase tracking-wider">
                    {c.tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border border-navy-800 p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-4 h-4 text-gold-500" />
              <span className="font-mono text-xs uppercase tracking-wider text-bone-200">Events</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'CTF Competitions',  href: '/events?type=ctf' },
                { label: 'Workshops & Talks', href: '/events?type=workshop' },
                { label: 'Industrial Visits', href: '/events?type=industry' },
              ].map(e => (
                <Link key={e.href} href={e.href}
                  className="flex items-center font-mono text-xs text-bone-300
                    hover:text-gold-500 transition-colors py-1 gap-2">
                  <ArrowRight className="w-3 h-3 text-bone-600 shrink-0" />
                  {e.label}
                </Link>
              ))}
              <Link href="/events"
                className="font-mono text-xs text-gold-500 hover:text-gold-400
                  transition-colors pt-1 flex items-center gap-1">
                View all events <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="bg-navy-950 border-b border-navy-800">
        <div className="container py-12 flex flex-col md:flex-row
          items-start md:items-center justify-between gap-6">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-2">
              // Verify Certificate
            </div>
            <p className="font-mono text-sm text-bone-300">
              All test completions generate a verifiable certificate with a unique ID.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3
                bg-gold-500 text-navy-950 font-mono text-sm uppercase tracking-wider
                hover:bg-gold-400 transition-colors">
              Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/verify-certificate"
              className="inline-flex items-center gap-2 px-5 py-3
                border border-navy-600 text-bone-200 font-mono text-sm uppercase tracking-wider
                hover:border-navy-500 transition-colors">
              <Award className="w-4 h-4" />
              Verify
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
