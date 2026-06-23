// app/about/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import {
  Youtube, Mail, Github, Shield, BookOpen, Video, Mic,
  Award, MessageSquare, Users, FileText, CheckCircle,
  ExternalLink, Globe,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;

export const metadata = {
  title: 'About — EpochZero Learn',
  description:
    'EpochZero Learn is a cybersecurity and technology learning platform. Articles, videos, MCQ tests with certificates, podcasts, CTF events, and peer discussion — free and open.',
};

const LOGO    = 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';
const DOMAINS = [
  { color: '#8B5E1A', label: 'REMA',         full: 'Reverse Engineering & Malware Analysis', desc: 'Static and dynamic malware analysis, unpacking, anti-debugging, memory forensics, IOC extraction, and YARA rule writing.' },
  { color: '#1B5FA8', label: 'Cloud',         full: 'Cloud Security',                         desc: 'Cloud architecture, attack vectors, data protection, IAM, compliance, forensics, and hands-on labs aligned with CSA and NIST.' },
  { color: '#6B3AD4', label: 'Cryptography',  full: 'Cryptography',                           desc: 'Symmetric and asymmetric cryptography, PKI, hash functions, TLS/SSL, and applied cryptanalysis. Coming soon.' },
  { color: '#1B7C3E', label: 'Web Dev',       full: 'Full Stack Web Development',             desc: 'Frontend, backend, databases, APIs, cloud deployment, and secure coding practices. Coming soon.' },
];

export default async function AboutPage() {
  const supabase = createClient();
  const [vRes, aRes, tRes, qRes, pRes, fRes] = await Promise.all([
    supabase.from('videos').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('tests').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('test_questions').select('*', { count: 'exact', head: true }),
    supabase.from('podcasts').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('forum_threads').select('*', { count: 'exact', head: true }).eq('status', 'published'),
  ]);

  const stats = {
    videos:    vRes.count ?? 0,
    articles:  aRes.count ?? 0,
    tests:     tRes.count ?? 0,
    questions: qRes.count ?? 0,
    podcasts:  pRes.count ?? 0,
    forum:     fRes.count ?? 0,
  };

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <section style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Image src={LOGO} alt="EpochZero Learn" width={52} height={52} className="rounded-xl" />
                <div>
                  <div className="font-display text-lg font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                    EpochZero Learn
                  </div>
                  <div className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>
                    Cybersecurity Learning Platform
                  </div>
                </div>
              </div>
              <p className="eyebrow mb-4">About this platform</p>
              <h1 className="font-display text-4xl lg:text-5xl font-bold leading-tight mb-6"
                style={{ color: 'hsl(var(--foreground))' }}>
                Built on a campus.<br />
                <span style={{ color: 'hsl(var(--primary))' }}>Open to everyone.</span>
              </h1>
              <p className="font-serif text-lg leading-relaxed mb-4"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                EpochZero Learn started as teaching material — notes, videos, and MCQ banks built for students at
                SITAICS, Rashtriya Raksha University. At some point it made more sense to put it online and let
                anyone use it than to keep it in a shared drive.
              </p>
              <p className="font-serif text-base leading-relaxed"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                So here it is. Articles, video lessons, a podcast, MCQ tests with actual verifiable certificates,
                downloadable resources, and a discussion forum. All free. No paywall, no signup required to read.
              </p>
            </div>

            {/* Live stats panel */}
            <div className="gradient-card-gold p-8 relative">
              <div className="relative z-10">
                <p className="font-sans text-sm font-semibold mb-6" style={{ color: 'rgba(232,160,32,0.9)' }}>
                  What's live right now
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Video,         label: 'Video lessons',   value: stats.videos    },
                    { icon: BookOpen,      label: 'Articles',         value: stats.articles  },
                    { icon: Award,         label: 'MCQ tests',        value: stats.tests     },
                    { icon: FileText,      label: 'MCQ questions',    value: stats.questions },
                    { icon: Mic,           label: 'Podcast episodes', value: stats.podcasts  },
                    { icon: MessageSquare, label: 'Forum threads',    value: stats.forum     },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <Icon className="w-4 h-4 shrink-0" style={{ color: 'rgba(232,160,32,0.8)' }} />
                      <div>
                        <div className="font-display text-lg font-bold text-white leading-none">{value}+</div>
                        <div className="text-xs mt-0.5" style={{ color: 'rgba(207,215,226,0.65)' }}>{label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY THIS EXISTS ── */}
      <section className="container py-16">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <p className="eyebrow mb-3">The honest version</p>
            <h2 className="font-display text-3xl font-bold mb-6" style={{ color: 'hsl(var(--foreground))' }}>
              Why this exists
            </h2>
            <div className="font-serif space-y-4 text-base leading-relaxed"
              style={{ color: 'hsl(var(--foreground-muted))' }}>
              <p>
                There are a lot of cybersecurity courses online. Most cost money. Some are good.
                But there was no single place where REMA content, cloud security, and web development
                sat alongside each other, structured in a way that matched how we actually teach it
                — unit by unit, topic by topic, with videos and articles and tests all connected.
              </p>
              <p>
                This platform is built around the UGC 4-Quadrant model: every topic has an e-Tutorial
                (video), e-Content (article), Web Resources (references and downloads), and
                Self-Assessment (MCQ test). The framework is from NEP 2020, but the content is ours.
              </p>
              <p>
                Students from SITAICS, RRU use it as part of their coursework. Everyone else can use it
                to learn, practice, and pick up a certificate if they pass the tests.
                The certificates are independently verifiable — each one has a public URL.
              </p>
            </div>
          </div>

          {/* UGC model explanation */}
          <div>
            <p className="eyebrow mb-3">UGC NEP 2020 — 4 Quadrant model</p>
            <h2 className="font-display text-2xl font-semibold mb-5" style={{ color: 'hsl(var(--foreground))' }}>
              How content is structured
            </h2>
            <div className="space-y-3">
              {[
                { q: 'Q1', label: 'e-Tutorial',       desc: 'Video lectures, walkthroughs, and animated explanations. Each episode has timestamped lab notes.', color: '#1B5FA8' },
                { q: 'Q2', label: 'e-Content',         desc: 'Written articles, case studies, and eBook chapters that go deeper than the video.',               color: '#1B7C3E' },
                { q: 'Q3', label: 'Web Resources',     desc: 'Curated external links, MITRE references, downloadable cheatsheets and question banks.',          color: '#8B5E1A' },
                { q: 'Q4', label: 'Self-Assessment',   desc: 'MCQ tests linked to each topic. Pass any test and receive a PDF certificate by email.',           color: '#6B3AD4' },
              ].map(({ q, label, desc, color }) => (
                <div key={q} className="card p-4 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-display font-bold text-sm text-white"
                    style={{ background: color }}>
                    {q}
                  </div>
                  <div>
                    <div className="font-sans font-semibold text-sm mb-1" style={{ color: 'hsl(var(--foreground))' }}>
                      {label}
                    </div>
                    <div className="font-serif text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── DOMAINS ── */}
      <section style={{ background: 'hsl(var(--surface))', borderTop: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-14">
          <p className="eyebrow mb-3">What we cover</p>
          <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: 'hsl(var(--foreground))' }}>
            Four domains
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {DOMAINS.map(({ color, label, full, desc }) => (
              <div key={label} className="card p-6 flex gap-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: color }}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                      {label}
                    </span>
                    <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
                      {label === 'Cryptography' || label === 'Web Dev' ? 'coming soon' : 'live'}
                    </span>
                  </div>
                  <div className="font-sans text-xs font-medium mb-2" style={{ color }}>
                    {full}
                  </div>
                  <p className="font-serif text-sm leading-relaxed"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT'S ON THE PLATFORM ── */}
      <section className="container py-16">
        <p className="eyebrow mb-3">Platform features</p>
        <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: 'hsl(var(--foreground))' }}>
          What you get
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: BookOpen,  color: '#1B5FA8',
              title: 'Articles & Writeups',
              body: 'Long-form technical writeups on malware samples, cloud attack chains, and lab walkthroughs. Written to be useful, not comprehensive for the sake of it.',
            },
            {
              icon: Video,     color: '#1B7C3E',
              title: 'Video Lessons',
              body: 'YouTube-embedded lessons, each paired with timestamped lab notes, reference lists, and an exercise. You can watch and work through it at the same time.',
            },
            {
              icon: Mic,       color: '#8B5E1A',
              title: 'Podcast',
              body: 'Audio episodes on each domain — useful for commutes or when you want to absorb material without staring at a screen.',
            },
            {
              icon: Award,     color: '#6B3AD4',
              title: 'MCQ Tests + Certificates',
              body: 'Topic-linked MCQ tests with a pass threshold. Pass and a PDF certificate lands in your email. Each certificate has a public verification URL — no guessing if it\'s real.',
            },
            {
              icon: FileText,  color: '#8B5E1A',
              title: 'Resources',
              body: 'eBooks, cheatsheets, question banks, and research references. All free. Download and keep them.',
            },
            {
              icon: MessageSquare, color: '#1B5FA8',
              title: 'Discussion Forum',
              body: 'Domain-specific threads. Anyone can read. Sign in with your RRU email to post. Replies are reviewed before publishing.',
            },
          ].map(({ icon: Icon, color, title, body }) => (
            <div key={title} className="card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: color }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  {title}
                </h3>
              </div>
              <p className="font-serif text-sm leading-relaxed flex-1"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CAMPUS CLUBS ── */}
      <section style={{ background: 'hsl(var(--surface))', borderTop: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-14">
          <p className="eyebrow mb-3">Campus</p>
          <h2 className="font-display text-2xl font-semibold mb-3" style={{ color: 'hsl(var(--foreground))' }}>
            Student clubs
          </h2>
          <p className="font-serif text-base leading-relaxed mb-8 max-w-2xl"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            Three student clubs operate under SITAICS. Their events — CTF competitions, hackathons,
            industrial visits, and outreach activities — are documented here and open for anyone to read about.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { slug: 'rema',      name: 'REMA Club',                    tagline: 'Reverse. Reveal. Respond.',  color: '#8B5E1A', desc: 'CTF events, malware analysis labs, and hands-on research. REMA CTF 2.0 had 70+ participants.' },
              { slug: 'fullstack', name: 'Full Stack Development Club',  tagline: 'Build. Deploy. Scale.',       color: '#1B5FA8', desc: 'Hackathons, full-stack project sprints, and cloud deployment workshops.' },
              { slug: 'extension', name: 'Extension Activity',           tagline: 'Outreach. Awareness. Impact.',color: '#1B7C3E', desc: 'Cyber safety awareness drives, digital hygiene programmes, and community outreach in collaboration with EDLD, RRU.' },
            ].map(({ slug, name, tagline, color, desc }) => (
              <Link key={slug} href={`/clubs/${slug}`}
                className="card card-interactive p-6 group flex flex-col overflow-hidden">
                <div className="h-1 w-full mb-5 rounded-full" style={{ background: color }} />
                <div className="font-sans font-semibold text-[10px] uppercase tracking-[0.1em] mb-1"
                  style={{ color }}>
                  Student Club
                </div>
                <h3 className="font-display text-base font-semibold mb-1 leading-snug
                  group-hover:text-[hsl(var(--primary))] transition-colors"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  {name}
                </h3>
                <div className="font-sans text-xs italic mb-3" style={{ color }}>
                  {tagline}
                </div>
                <p className="font-serif text-sm leading-relaxed flex-1"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  {desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ASHISH REVAR ── */}
      <section className="container py-16">
        <p className="eyebrow mb-3">The person behind it</p>
        <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: 'hsl(var(--foreground))' }}>
          Founder & Course Instructor
        </h2>

        <div className="card rounded-2xl overflow-hidden grid lg:grid-cols-[280px_1fr]">
          {/* Identity panel */}
          <div className="p-10 flex flex-col items-center justify-center text-center"
            style={{ background: 'rgba(139,94,26,0.12)', borderRight: '1px solid hsl(var(--border))' }}>
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center
              font-display text-4xl font-bold text-white mb-5"
              style={{ background: 'linear-gradient(135deg, #8B5E1A 0%, #1B5FA8 100%)' }}>
              AR
            </div>
            <div className="font-display text-xl font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Ashish Revar
            </div>
            <div className="font-sans text-xs font-semibold uppercase tracking-wide mb-5"
              style={{ color: 'hsl(var(--primary))' }}>
              Assistant Professor · Researcher
            </div>
            <div className="flex flex-col gap-2 w-full text-xs">
              {[
                'SITAICS, Rashtriya Raksha University',
                'PhD Scholar — PDEU, Gandhinagar',
                '15+ years in cybersecurity',
              ].map(l => (
                <div key={l} className="px-3 py-2 rounded-lg text-center"
                  style={{ background: 'hsl(var(--card))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>
                  {l}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Github,  href: 'https://github.com/agr3012',            label: 'GitHub'  },
                { icon: Youtube, href: 'https://youtube.com/@EpochZeroNet',     label: 'YouTube' },
                { icon: Mail,    href: 'mailto:ashish.revar@rru.ac.in',         label: 'Email'   },
              ].map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: 'hsl(var(--card))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Bio panel */}
          <div className="p-10">
            <div className="font-serif space-y-4 text-base leading-relaxed mb-8"
              style={{ color: 'hsl(var(--foreground-muted))' }}>
              <p>
                Ashish Revar teaches Reverse Engineering, Malware Analysis, Cloud Security,
                Cryptography, and Web Development to B.Tech, M.Sc., and M.Tech students at
                SITAICS, Rashtriya Raksha University — a Central Government institution.
                He has been doing this for over fifteen years.
              </p>
              <p>
                His PhD research at PDEU focuses on automatic YARA rule generation using machine
                learning for cloud malware detection — a project called RUDRA. Before that, he worked
                on the CEQ framework for quantifying malware's cryptographic footprint, and on
                machine learning models for resource-exhaustion detection.
              </p>
              <p>
                He has delivered cybersecurity training to Gujarat Police, Nepal Police (under the
                Indian Technical and Economic Cooperation programme), SEBI, the Ministry of Home
                Affairs, and to national-level exercises including Bharat NCX.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Institution',    value: 'SITAICS, RRU, Gandhinagar' },
                { label: 'PhD',            value: 'PDEU — ML-based YARA rule generation (RUDRA)' },
                { label: 'Teaching',       value: 'B.Tech · M.Sc. · M.Tech · Diploma' },
                { label: 'Training',       value: 'Gujarat Police · Nepal Police · SEBI · MHA · Bharat NCX' },
              ].map(({ label, value }) => (
                <div key={label} className="pl-4" style={{ borderLeft: '2px solid rgba(139,94,26,0.4)' }}>
                  <div className="font-sans text-xs font-semibold uppercase tracking-wide mb-1"
                    style={{ color: 'hsl(var(--foreground-subtle))' }}>
                    {label}
                  </div>
                  <div className="font-serif text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ACCESS + CERTIFICATES ── */}
      <section style={{ background: 'hsl(var(--surface))', borderTop: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-14 grid md:grid-cols-2 gap-8">

          {/* Open access */}
          <div>
            <p className="eyebrow mb-3">Access</p>
            <h3 className="font-display text-xl font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
              Who can use this
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Articles, videos, podcasts, resources', access: 'Open to anyone — no account needed', ok: true },
                { label: 'MCQ tests and certificates',             access: 'Open to anyone — enter your email to receive results', ok: true },
                { label: 'Discussion forum (read)',                access: 'Open to anyone',   ok: true },
                { label: 'Discussion forum (post)',               access: 'Sign in with an RRU email', ok: false },
                { label: 'CTF events and proctored exams',        access: 'SITAICS, RRU students', ok: false },
              ].map(({ label, access, ok }) => (
                <div key={label} className="card p-4 flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: ok ? '#4ADE80' : 'hsl(var(--foreground-subtle))' }} />
                  <div>
                    <div className="font-sans text-sm font-medium"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {label}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--foreground-muted))' }}>
                      {access}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate note */}
          <div>
            <p className="eyebrow mb-3">Certificates</p>
            <h3 className="font-display text-xl font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
              What the certificate means
            </h3>
            <div className="font-serif space-y-4 text-sm leading-relaxed mb-6"
              style={{ color: 'hsl(var(--foreground-muted))' }}>
              <p>
                EpochZero Learn is an independent platform. Certificates issued here are records
                of completion for our publicly available assessments and events.
                They are not academic credentials from any university.
              </p>
              <p>
                Each certificate carries a unique ID and a public verification URL so anyone
                — a recruiter, a hiring manager, a colleague — can check it directly without
                contacting us.
              </p>
              <p>
                If you pass a test, you passed it. The certificate says what it tested, your
                score, and when you sat it. That's the whole thing.
              </p>
            </div>
            <Link href="/verify-certificate"
              className="btn-ghost inline-flex items-center gap-2">
              <Globe className="w-4 h-4" /> Verify a certificate
            </Link>
          </div>
        </div>
      </section>

      {/* ── CONNECT ── */}
      <section className="container py-16">
        <p className="eyebrow mb-3">Connect</p>
        <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: 'hsl(var(--foreground))' }}>
          Get in touch
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Youtube,
              label: 'YouTube',
              sub: '@EpochZeroNet',
              href: 'https://youtube.com/@EpochZeroNet',
              desc: 'Video lessons and short explainers.',
              color: '#8B5E1A',
            },
            {
              icon: Mail,
              label: 'Email',
              sub: 'epochzero.net@gmail.com',
              href: 'mailto:epochzero.net@gmail.com',
              desc: 'Questions about the platform or certificates.',
              color: '#1B5FA8',
            },
            {
              icon: Github,
              label: 'GitHub',
              sub: 'github.com/agr3012',
              href: 'https://github.com/agr3012',
              desc: 'Open source tools and research code.',
              color: '#6B3AD4',
            },
          ].map(({ icon: Icon, label, sub, href, desc, color }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer"
              className="card card-interactive p-6 group flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: color }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-display text-sm font-semibold mb-0.5
                  group-hover:text-[hsl(var(--primary))] transition-colors"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  {label}
                </div>
                <div className="font-mono text-xs mb-2" style={{ color }}>
                  {sub}
                </div>
                <p className="font-serif text-xs leading-relaxed"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  {desc}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

    </div>
  );
}
