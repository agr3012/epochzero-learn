import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  Video,
  GraduationCap,
  FileText,
  Headphones,
  Award,
  Terminal,
  ShieldAlert,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, getYouTubeThumbnail } from '@/lib/utils';

export const revalidate = 60; // ISR every 60s

async function getLatestContent() {
  const supabase = createClient();

  const [articles, videos, tests] = await Promise.all([
    supabase
      .from('articles')
      .select('id, slug, title, excerpt, category, published_at, reading_time')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('videos')
      .select('id, slug, youtube_id, title, malware_family, duration_seconds, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('tests')
      .select('id, slug, title, description, malware_family, duration_minutes, total_questions')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  return {
    articles: articles.data ?? [],
    videos: videos.data ?? [],
    tests: tests.data ?? [],
  };
}

export default async function HomePage() {
  const { articles, videos, tests } = await getLatestContent();

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-navy-700">
        {/* Grid background */}
        <div className="absolute inset-0 border-grid opacity-40" aria-hidden />
        {/* Gold radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(800px circle at 30% 20%, rgba(255,200,87,0.08), transparent 50%)',
          }}
          aria-hidden
        />
        {/* Scanlines overlay */}
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-50" aria-hidden />

        <div className="container relative py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              {/* Terminal-style status line */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gold-500/30 bg-gold-500/5 mb-8 animate-fade-up">
                <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500">
                  Sample 0x00 — Live Learning Hub
                </span>
              </div>

              <h1
                className="font-mono text-5xl lg:text-7xl font-bold leading-[0.95] tracking-tight text-bone-50 mb-6 animate-fade-up text-balance"
                style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
              >
                Reverse.
                <br />
                <span className="text-gold-500">Reveal.</span>
                <br />
                Respond.
              </h1>

              <p
                className="font-serif text-xl text-bone-200 max-w-2xl leading-relaxed mb-10 animate-fade-up"
                style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
              >
                A learning hub for serious students of malware. Walk through real samples like{' '}
                <span className="text-gold-500 font-mono text-base">njRAT</span>,{' '}
                <span className="text-gold-500 font-mono text-base">Jigsaw</span>, and{' '}
                <span className="text-gold-500 font-mono text-base">Qakbot</span> — backed by
                articles, video analyses, an eBook, and a 360-question bank. Earn verifiable
                certificates by passing the MCQ assessments.
              </p>

              <div
                className="flex flex-wrap gap-4 animate-fade-up"
                style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
              >
                <Link href="/learn" className="btn-primary">
                  <GraduationCap className="w-4 h-4" />
                  Browse 4Q Courses
                </Link>
                <Link href="/videos" className="btn-ghost">
                  <Video className="w-4 h-4" />
                  Watch Walkthroughs
                </Link>
              </div>

              {/* Stats */}
              <div
                className="mt-16 grid grid-cols-3 gap-8 max-w-xl animate-fade-up"
                style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
              >
                {[
                  { label: 'MCQs in Bank', value: '120+' },
                  { label: 'Question Pool', value: '360' },
                  { label: 'Malware Families', value: '15+' },
                ].map((s) => (
                  <div key={s.label} className="border-l-2 border-gold-500 pl-4">
                    <div className="font-mono text-3xl text-bone-50 font-bold">{s.value}</div>
                    <div className="font-mono text-xs uppercase tracking-wider text-bone-300 mt-1">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero illustration / terminal mockup */}
            <div
              className="lg:col-span-5 animate-fade-up"
              style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
            >
              <div className="relative">
                <div className="card-forensic border-2 p-1">
                  {/* Terminal chrome */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-navy-700 bg-navy-950">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-crimson-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-gold-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-bone-300/40" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-bone-300">
                      rema://analyst.session
                    </span>
                  </div>

                  {/* Terminal body */}
                  <div className="p-6 bg-navy-950 font-mono text-sm leading-relaxed space-y-2">
                    <div className="text-bone-300">
                      <span className="text-gold-500">$</span> file njrat_sample.exe
                    </div>
                    <div className="text-bone-200">
                      njrat_sample.exe: PE32 executable, .NET assembly
                    </div>
                    <div className="text-bone-300">
                      <span className="text-gold-500">$</span> yara rules/njrat.yar njrat_sample.exe
                    </div>
                    <div className="text-crimson-400">
                      [<span className="text-crimson-500">!</span>] njRAT_v0.7d : njrat_sample.exe
                    </div>
                    <div className="text-bone-300">
                      <span className="text-gold-500">$</span> rema analyze --static
                    </div>
                    <div className="text-bone-200">
                      ├── PE entropy ......... 7.84 / 8.0
                    </div>
                    <div className="text-bone-200">
                      ├── Suspicious imports . VirtualAlloc, WriteProcessMemory
                    </div>
                    <div className="text-bone-200">
                      ├── C2 indicator ....... 192.168.1.7:5552
                    </div>
                    <div className="text-bone-200">
                      └── Verdict ............ <span className="text-crimson-400">RAT</span>
                    </div>
                    <div className="text-bone-300 pt-2">
                      <span className="text-gold-500">$</span>{' '}
                      <span className="inline-block w-2 h-4 bg-gold-500 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -top-3 -right-3 px-3 py-1.5 bg-gold-500 text-navy-900 font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
                  Hands-on
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU'LL FIND */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
            // What you'll find here
          </div>
          <h2 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 max-w-3xl mx-auto leading-tight text-balance">
            A complete lab notebook for malware analysis.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen,
              title: 'Articles & Writeups',
              desc: 'In-depth malware writeups: HTML smuggling chains, DLL side-loading, packing techniques, MITRE ATT&CK mappings.',
              href: '/articles',
            },
            {
              icon: Video,
              title: 'Video Walkthroughs',
              desc: 'Step-by-step analyses of njRAT, Jigsaw, Qakbot and more — embedded YouTube player with synchronized lab notes.',
              href: '/videos',
            },
            {
              icon: GraduationCap,
              title: 'MCQ Tests + Certificates',
              desc: 'Validated question bank. Pass the test, receive a verifiable PDF certificate by email. No registration paywall.',
              href: '/tests',
            },
            {
              icon: FileText,
              title: 'eBook & Cheatsheet',
              desc: 'REMA eBook 2026 (~135 pages), Question Bank (360 Q), and cheatsheet — all downloadable, all free.',
              href: '/resources',
            },
            {
              icon: Headphones,
              title: 'Audio Podcast',
              desc: 'On-the-go discussions on threat actors, current campaigns, and reverse engineering tradecraft.',
              href: '/podcast',
            },
            {
              icon: ShieldAlert,
              title: 'Verifiable Credentials',
              desc: 'Every certificate has a public verification URL. Employers can validate authenticity instantly.',
              href: '/verify',
            },
          ].map(({ icon: Icon, title, desc, href }) => (
            <Link
              key={title}
              href={href}
              className="card-forensic p-8 group"
            >
              <Icon className="w-8 h-8 text-gold-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-mono text-lg uppercase tracking-wider text-bone-50 mb-3">
                {title}
              </h3>
              <p className="font-serif text-bone-200 leading-relaxed mb-4">{desc}</p>
              <span className="font-mono text-xs uppercase tracking-wider text-gold-500 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Open <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* LATEST ARTICLES */}
      {articles.length > 0 && (
        <section className="container py-16 border-t border-navy-700">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">
                // Latest writeups
              </div>
              <h2 className="font-mono text-3xl lg:text-4xl font-bold text-bone-50">
                From the lab notebook
              </h2>
            </div>
            <Link
              href="/articles"
              className="hidden md:inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-gold-500 hover:gap-3 transition-all"
            >
              All articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link key={a.id} href={`/articles/${a.slug}`} className="card-forensic p-6 group">
                {a.category && (
                  <span className="badge-tag mb-4">{a.category}</span>
                )}
                <h3 className="font-mono text-xl text-bone-50 mb-3 group-hover:text-gold-500 transition-colors">
                  {a.title}
                </h3>
                <p className="font-serif text-bone-200 leading-relaxed mb-4 line-clamp-3">
                  {a.excerpt}
                </p>
                <div className="flex items-center gap-3 font-mono text-xs text-bone-300">
                  {a.published_at && <span>{formatDate(a.published_at)}</span>}
                  {a.reading_time && <span>· {a.reading_time} min read</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* LATEST VIDEOS */}
      {videos.length > 0 && (
        <section className="container py-16 border-t border-navy-700">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">
                // Recent walkthroughs
              </div>
              <h2 className="font-mono text-3xl lg:text-4xl font-bold text-bone-50">
                Video analyses
              </h2>
            </div>
            <Link
              href="/videos"
              className="hidden md:inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-gold-500 hover:gap-3 transition-all"
            >
              All videos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {videos.map((v) => (
              <Link key={v.id} href={`/videos/${v.slug}`} className="group">
                <div className="relative aspect-video overflow-hidden border border-navy-700 group-hover:border-gold-500 transition-colors">
                  <Image
                    src={getYouTubeThumbnail(v.youtube_id, 'maxres')}
                    alt={v.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />
                  {v.malware_family && (
                    <span className="absolute top-3 left-3 badge-malware">
                      {v.malware_family}
                    </span>
                  )}
                </div>
                <h3 className="font-mono text-base text-bone-50 mt-4 group-hover:text-gold-500 transition-colors">
                  {v.title}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CALL TO TESTS */}
      <section className="container py-24 border-t border-navy-700">
        <div className="card-forensic relative overflow-hidden p-12 lg:p-16 border-2">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(600px circle at 80% 50%, rgba(255,200,87,0.08), transparent 60%)',
            }}
            aria-hidden
          />
          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Award className="w-12 h-12 text-gold-500 mb-6" />
              <h2 className="font-mono text-3xl lg:text-4xl font-bold text-bone-50 mb-4 leading-tight">
                Test your skills.
                <br />
                Earn a certificate.
              </h2>
              <p className="font-serif text-lg text-bone-200 mb-8 leading-relaxed">
                Pick a test, enter your email, prove you can identify the indicators.
                Pass the bar — receive a PDF certificate with a unique verification ID.
                No paywall. No catch.
              </p>
              <Link href="/tests" className="btn-primary">
                Browse Tests <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {tests.length > 0 ? (
                tests.map((t) => (
                  <Link
                    key={t.id}
                    href={`/tests/${t.slug}`}
                    className="block p-5 border border-navy-700 hover:border-gold-500 group transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-mono text-sm uppercase tracking-wider text-bone-50 group-hover:text-gold-500 transition-colors">
                        {t.title}
                      </h3>
                      <Terminal className="w-4 h-4 text-gold-500" />
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs text-bone-300">
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
                <div className="p-8 border border-dashed border-navy-700 text-center">
                  <p className="font-mono text-sm text-bone-300">
                    Tests coming soon. Add them via{' '}
                    <Link href="/admin/tests" className="text-gold-500 underline">
                      admin panel
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
