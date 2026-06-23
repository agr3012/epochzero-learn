// app/about/page.tsx
// Editorial layout — intentionally different from homepage.
// Prose-driven, personal, minimal cards. No stat counters, no domain grid.
import Link from 'next/link';
import { Youtube, Mail, Github, Globe, CheckCircle, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;
export const metadata = {
  title: 'About — EpochZero Learn',
  description:
    'Who built EpochZero Learn, why, and what it honestly is — a cybersecurity and technology learning platform started on a university campus and opened to anyone.',
};

const LOGO = 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

export default async function AboutPage() {
  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ══════════════════════════════════════════════
          HERO — editorial, no cards, no stats
          ══════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-20 lg:py-28">
          <div className="max-w-4xl">
            <p className="eyebrow mb-5">About EpochZero Learn</p>
            {/* Large editorial headline */}
            <h1 className="font-display font-bold leading-[1.05] mb-8 text-balance"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', color: 'hsl(var(--foreground))' }}>
              A learning platform started on a campus
              and opened to anyone who wants to use it.
            </h1>
            {/* Pull quote */}
            <blockquote className="font-serif text-xl leading-relaxed pl-5 mb-0"
              style={{
                borderLeft: '3px solid hsl(var(--primary))',
                color: 'hsl(var(--foreground-muted))',
                fontStyle: 'normal',
              }}>
              This started as teaching material for students at SITAICS, Rashtriya Raksha University.
              The notes existed, the videos were recorded, and the MCQ banks were built.
              It made more sense to put them online than to keep them in a shared folder.
            </blockquote>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          STORY — two-column editorial prose
          ══════════════════════════════════════════════ */}
      <section className="container py-16">
        <div className="grid lg:grid-cols-[1fr_380px] gap-14 items-start">

          {/* Main prose */}
          <div className="font-serif text-base leading-[1.8] space-y-5"
            style={{ color: 'hsl(var(--foreground))' }}>
            <h2 className="font-display text-2xl font-semibold mb-6"
              style={{ color: 'hsl(var(--foreground))' }}>
              Why this exists
            </h2>
            <p style={{ color: 'hsl(var(--foreground-muted))' }}>
              There are plenty of cybersecurity courses online. Most cost money. Some are good.
              But there was no single place where reverse engineering content, cloud security,
              and web development sat side by side — structured the way we actually teach it,
              with videos and articles and tests all connected to the same topic.
            </p>
            <p style={{ color: 'hsl(var(--foreground-muted))' }}>
              The platform follows the UGC 4-Quadrant model from NEP 2020. Every topic has four
              layers: a video lecture (Q1), a written article (Q2), external references and
              downloadable resources (Q3), and an MCQ assessment (Q4). That structure is why
              the content here doesn't feel like isolated YouTube uploads or scattered PDFs.
              Each piece knows where it belongs.
            </p>
            <p style={{ color: 'hsl(var(--foreground-muted))' }}>
              Students from SITAICS use it as part of their coursework. Everyone else can access
              articles, videos, podcasts, resources, and MCQ tests with no account and no payment.
              If you pass a test, you get a PDF certificate with a unique ID and a public
              verification URL. That's the whole deal.
            </p>

            {/* Inline section break */}
            <div className="pt-4 pb-2" style={{ borderTop: '1px solid hsl(var(--border))' }}>
              <h3 className="font-display text-lg font-semibold mb-4"
                style={{ color: 'hsl(var(--foreground))' }}>
                What this platform is not
              </h3>
              <p style={{ color: 'hsl(var(--foreground-muted))' }}>
                The certificates here are not institutional academic credentials. They are records
                of passing a publicly available assessment. They do not represent any university
                or government body. Each one carries a verification link so anyone can check it
                directly. The assessment tested what it says it tested.
              </p>
              <p className="mt-4" style={{ color: 'hsl(var(--foreground-muted))' }}>
                CTF events, proctored exams, and instructor-led activities are for enrolled
                students at SITAICS, RRU. Everything else is open.
              </p>
            </div>
          </div>

          {/* Sidebar — access table, clean and typographic */}
          <div className="lg:sticky lg:top-24">
            <h3 className="font-display text-base font-semibold mb-5"
              style={{ color: 'hsl(var(--foreground))' }}>
              Access at a glance
            </h3>
            <div className="space-y-2 mb-8">
              {[
                { item: 'Articles, videos, podcasts',             open: true,  note: 'No account needed'         },
                { item: 'Downloadable resources',                  open: true,  note: 'No account needed'         },
                { item: 'MCQ tests and certificates',             open: true,  note: 'Enter email to receive cert'},
                { item: 'Discussion forum — read',                open: true,  note: 'No account needed'         },
                { item: 'Discussion forum — post',                open: false, note: 'RRU institutional email'    },
                { item: 'Proctored exams and CTF events',        open: false, note: 'SITAICS enrolled students'  },
              ].map(({ item, open, note }) => (
                <div key={item} className="flex items-start gap-3 py-2.5 px-0"
                  style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                  <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5"
                    style={{ color: open ? '#4ADE80' : 'hsl(var(--foreground-subtle))' }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                      {item}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--foreground-muted))' }}>
                      {note}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Verify certificate */}
            <Link href="/verify-certificate"
              className="inline-flex items-center gap-2 font-sans text-sm font-medium transition-colors hover:gap-3"
              style={{ color: 'hsl(var(--primary))' }}>
              <Globe className="w-4 h-4" /> Verify a certificate
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          INSTRUCTOR — the one card on this page
          ══════════════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <div className="container py-16">
          <p className="eyebrow mb-3">The person behind it</p>
          <h2 className="font-display text-2xl font-semibold mb-8"
            style={{ color: 'hsl(var(--foreground))' }}>
            Founder and course instructor
          </h2>

          <div className="card rounded-2xl overflow-hidden grid lg:grid-cols-[240px_1fr]">

            {/* Identity */}
            <div className="p-8 flex flex-col items-center justify-start text-center pt-10"
              style={{ background: 'rgba(139,94,26,0.08)', borderRight: '1px solid hsl(var(--border))' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center
                font-display text-3xl font-bold text-white mb-5"
                style={{ background: 'linear-gradient(135deg, #8B5E1A 0%, #1B5FA8 100%)' }}>
                AR
              </div>
              <div className="font-display text-lg font-bold mb-0.5"
                style={{ color: 'hsl(var(--foreground))' }}>
                Ashish Revar
              </div>
              <div className="font-sans text-xs font-semibold uppercase tracking-wide mb-5"
                style={{ color: 'hsl(var(--primary))' }}>
                Assistant Professor
              </div>

              <div className="space-y-2 w-full text-xs">
                {['Computer Science & Cyber Security', 'SITAICS, Rashtriya Raksha University', 'Gandhinagar, Gujarat'].map(l => (
                  <div key={l} className="px-3 py-2 rounded-lg"
                    style={{ background: 'hsl(var(--card))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>
                    {l}
                  </div>
                ))}
              </div>

              {/* Social links */}
              <div className="flex gap-2 mt-6">
                {[
                  { icon: Github,  href: 'https://github.com/agr3012',        label: 'GitHub'  },
                  { icon: Youtube, href: 'https://youtube.com/@EpochZeroNet', label: 'YouTube' },
                  { icon: Mail,    href: 'mailto:ashish.revar@rru.ac.in',     label: 'Email'   },
                ].map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'hsl(var(--card))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Bio — prose, not bullets */}
            <div className="p-8 lg:p-10">
              <div className="font-serif text-base leading-[1.8] space-y-4 mb-8"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                <p>
                  Ashish Revar teaches Reverse Engineering, Malware Analysis, Cloud Security,
                  Cryptography, and Web Development at SITAICS, Rashtriya Raksha University —
                  a Central Government institution in Gandhinagar. He has been teaching and
                  working in applied cybersecurity for over fifteen years.
                </p>
                <p>
                  His research focuses on machine learning approaches to malware detection —
                  specifically, building automatic YARA rule generation systems for cloud
                  malware. The work sits at the intersection of static analysis, ML classification,
                  and cloud security forensics.
                </p>
                <p>
                  Outside the university, he delivers specialised cybersecurity training to
                  law-enforcement agencies, government departments, and defence organisations.
                  Past programmes have included Gujarat Police, Nepal Police under the Indian
                  Technical and Economic Cooperation scheme, SEBI, the Ministry of Home Affairs,
                  and national-level exercises including Bharat NCX.
                </p>
              </div>

              {/* Four factual callouts — not promotional */}
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: 'Role',           value: 'Assistant Professor, SITAICS, RRU' },
                  { label: 'Research',       value: 'ML for malware detection; automatic YARA rule generation' },
                  { label: 'Students',       value: 'B.Tech · M.Sc. (CSDF) · M.Tech · PGD' },
                  { label: 'Training',       value: 'Gujarat Police · Nepal Police · SEBI · MHA · Bharat NCX' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="font-sans text-[10px] font-semibold uppercase tracking-wider mb-1"
                      style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      {label}
                    </div>
                    <div className="font-sans text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CLUBS — text-forward, no icon tiles
          ══════════════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <div className="container py-14">
          <p className="eyebrow mb-3">Campus</p>
          <div className="grid lg:grid-cols-[1fr_1fr_1fr] gap-8">

            <div>
              <h2 className="font-display text-2xl font-semibold mb-4"
                style={{ color: 'hsl(var(--foreground))' }}>
                Student clubs
              </h2>
              <p className="font-serif text-sm leading-relaxed"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                Three student clubs operate under SITAICS. Their events are documented here
                and the results are public.
              </p>
            </div>

            {[
              {
                slug: 'rema', name: 'REMA Club', tagline: 'Reverse. Reveal. Respond.',
                color: '#8B5E1A',
                body: 'Runs CTF competitions and malware analysis labs. REMA CTF 2.0 had over 70 participants and 300+ registrations.',
              },
              {
                slug: 'fullstack', name: 'Full Stack Dev Club', tagline: 'Build. Deploy. Scale.',
                color: '#1B5FA8',
                body: 'Organises hackathons, project sprints, and cloud deployment workshops.',
              },
            ].map(({ slug, name, tagline, color, body }) => (
              <div key={slug}>
                <div className="font-sans text-xs font-semibold uppercase tracking-wide mb-1"
                  style={{ color }}>
                  {tagline}
                </div>
                <Link href={`/clubs/${slug}`}
                  className="font-display text-lg font-semibold mb-2 block
                    hover:text-[hsl(var(--primary))] transition-colors"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  {name}
                </Link>
                <p className="font-serif text-sm leading-relaxed"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  {body}
                </p>
              </div>
            ))}
          </div>

          {/* Extension activity — separate, fuller treatment */}
          <div className="mt-10 pt-8" style={{ borderTop: '1px solid hsl(var(--border))' }}>
            <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-start">
              <div>
                <div className="font-sans text-xs font-semibold uppercase tracking-wide mb-1"
                  style={{ color: '#1B7C3E' }}>
                  Outreach. Awareness. Impact.
                </div>
                <Link href="/clubs/extension"
                  className="font-display text-lg font-semibold block mb-1
                    hover:text-[hsl(var(--primary))] transition-colors"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  Extension Activity
                </Link>
                <div className="font-sans text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                  In collaboration with EDLD, RRU
                </div>
              </div>
              <p className="font-serif text-sm leading-relaxed"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                Runs cyber safety awareness programmes in schools, residential societies, and
                government offices. Activities include digital hygiene drives, Nukkad Natak
                (street theatre), and public education sessions on fraud and online safety.
                Aligned with Cyber Surakshit Bharat, Swachh Bharat, and NEP 2020 extension
                activity requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CONNECT — minimal, text-driven
          ══════════════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <div className="container py-14 max-w-3xl">
          <p className="eyebrow mb-3">Contact</p>
          <h2 className="font-display text-2xl font-semibold mb-8"
            style={{ color: 'hsl(var(--foreground))' }}>
            Get in touch
          </h2>
          <div className="space-y-0" style={{ borderTop: '1px solid hsl(var(--border))' }}>
            {[
              {
                icon: Youtube, label: 'YouTube',
                display: '@EpochZeroNet',
                href: 'https://youtube.com/@EpochZeroNet',
                note: 'All video lessons and short explainers.',
              },
              {
                icon: Mail, label: 'Email',
                display: 'epochzero.net@gmail.com',
                href: 'mailto:epochzero.net@gmail.com',
                note: 'Questions about the platform, certificates, or access.',
              },
              {
                icon: Github, label: 'GitHub',
                display: 'github.com/agr3012',
                href: 'https://github.com/agr3012',
                note: 'Research code and open tools.',
              },
              {
                icon: Mail, label: 'Institutional email',
                display: 'ashish.revar@rru.ac.in',
                href: 'mailto:ashish.revar@rru.ac.in',
                note: 'Academic or training enquiries.',
              },
            ].map(({ icon: Icon, label, display, href, note }) => (
              <a key={display} href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center gap-4 py-4 group transition-colors"
                style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <Icon className="w-4 h-4 shrink-0"
                  style={{ color: 'hsl(var(--foreground-subtle))' }} />
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-xs uppercase tracking-wide mb-0.5"
                    style={{ color: 'hsl(var(--foreground-subtle))' }}>
                    {label}
                  </div>
                  <div className="font-sans text-sm font-medium
                    group-hover:text-[hsl(var(--primary))] transition-colors"
                    style={{ color: 'hsl(var(--foreground))' }}>
                    {display}
                  </div>
                </div>
                <div className="hidden md:block text-xs text-right shrink-0 max-w-[220px]"
                  style={{ color: 'hsl(var(--foreground-subtle))' }}>
                  {note}
                </div>
                <ExternalLink className="w-3.5 h-3.5 shrink-0"
                  style={{ color: 'hsl(var(--foreground-subtle))' }} />
              </a>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
