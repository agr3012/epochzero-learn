'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

const LOGO = 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

type LearnItem = { label: string; href: string; soon?: boolean };
type DropItem  = { label: string; href: string; soon?: boolean } | 'sep';

const LEARN_COLS: Array<{ heading: string; href: string; items: LearnItem[] }> = [
  {
    heading: 'Articles', href: '/articles',
    items: [
      { label: 'All Articles',    href: '/articles' },
      { label: 'REMA',            href: '/articles?domain=rema' },
      { label: 'Cloud Security',  href: '/articles?domain=cloud' },
      { label: 'Cryptography',    href: '/articles?domain=crypto',  soon: true },
      { label: 'Web Dev',         href: '/articles?domain=webdev',  soon: true },
    ],
  },
  {
    heading: 'Videos', href: '/videos',
    items: [
      { label: 'All Videos',      href: '/videos' },
      { label: 'REMA',            href: '/videos?domain=rema' },
      { label: 'Cloud Security',  href: '/videos?domain=cloud' },
      { label: 'Cryptography',    href: '/videos?domain=crypto',  soon: true },
      { label: 'Web Dev',         href: '/videos?domain=webdev',  soon: true },
    ],
  },
  {
    heading: 'Podcast', href: '/podcast',
    items: [
      { label: 'All Episodes',    href: '/podcast' },
      { label: 'REMA',            href: '/podcast?tag=REMA' },
      { label: 'Cloud Security',  href: '/podcast?tag=cloud' },
      { label: 'Cryptography',    href: '/podcast?tag=crypto',  soon: true },
      { label: 'Web Dev',         href: '/podcast?tag=webdev',  soon: true },
    ],
  },
  {
    heading: 'Resources', href: '/resources',
    items: [
      { label: 'All Resources',   href: '/resources' },
      { label: 'eBooks & PDFs',   href: '/resources?type=ebook' },
      { label: 'Question Banks',  href: '/resources?type=question-bank' },
      { label: 'MCQ Banks',       href: '/resources?type=mcq-bank' },
      { label: 'Cheatsheets',     href: '/resources?type=cheatsheet' },
      { label: 'Research Papers', href: '/resources?type=research-paper', soon: true },
    ],
  },
];

const TESTS_ITEMS: DropItem[] = [
  { label: 'All Tests',       href: '/tests' },
  'sep',
  { label: 'REMA',            href: '/tests?domain=rema' },
  { label: 'Cloud Security',  href: '/tests?domain=cloud' },
  { label: 'Cryptography',    href: '/tests?domain=crypto',  soon: true },
  { label: 'Web Development', href: '/tests?domain=webdev',  soon: true },
];

const FORUM_ITEMS: DropItem[] = [
  { label: 'All Domains',    href: '/forum' },
  'sep',
  { label: 'REMA',           href: '/forum/rema' },
  { label: 'Cloud Security', href: '/forum/cloud' },
  { label: 'Cryptography',   href: '/forum/crypto' },
  { label: 'Web Dev',        href: '/forum/webdev' },
];

const CAMPUS_ITEMS: DropItem[] = [
  { label: 'REMA Club',           href: '/clubs/rema' },
  { label: 'Full Stack Dev Club', href: '/clubs/fullstack' },
  { label: 'Extension Activity',  href: '/clubs/extension' },
  'sep',
  { label: 'All Events',          href: '/events' },
  { label: 'CTF Competitions',    href: '/events?type=ctf' },
  { label: 'Workshops & Talks',   href: '/events?type=workshop' },
  { label: 'Industrial Visits',   href: '/events?type=industry' },
  { label: 'Hackathons',          href: '/events?type=hackathon', soon: true },
];

// ── Dropdown ──────────────────────────────────────────────────────────────────
// Uses CSS vars — works in both light and dark

function Dropdown({ items }: { items: DropItem[] }) {
  return (
    <div className="absolute top-full left-0 mt-1 min-w-[200px] z-50 py-1.5
      rounded-xl overflow-hidden"
      style={{
        background: 'hsl(var(--card))',
        boxShadow: 'var(--shadow-dropdown)',
        border: '1px solid hsl(var(--border))',
      }}>
      {items.map((item, i) =>
        item === 'sep' ? (
          <div key={i} className="my-1 mx-2"
            style={{ borderTop: '1px solid hsl(var(--border))' }} />
        ) : (
          <Link key={item.href}
            href={item.soon ? '#' : item.href}
            className={cn(
              'flex items-center justify-between px-3.5 py-2 mx-1 rounded-lg',
              'font-sans text-sm transition-colors',
              item.soon ? 'pointer-events-none opacity-40' : '',
            )}
            style={{
              color: item.soon ? 'hsl(var(--foreground-subtle))' : 'hsl(var(--foreground-muted))',
            }}
            onMouseEnter={e => {
              if (!item.soon) {
                (e.currentTarget as HTMLElement).style.background = 'hsl(var(--muted))';
                (e.currentTarget as HTMLElement).style.color = 'hsl(var(--foreground))';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = '';
              (e.currentTarget as HTMLElement).style.color = item.soon
                ? 'hsl(var(--foreground-subtle))'
                : 'hsl(var(--foreground-muted))';
            }}
          >
            <span>{item.label}</span>
            {item.soon && (
              <span className="ml-2 font-sans text-[9px] font-medium px-1.5 py-0.5 rounded"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground-subtle))' }}>
                soon
              </span>
            )}
          </Link>
        )
      )}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const [openKey, setOpenKey]       = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExp, setMobileExp]   = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function enter(key: string) {
    if (timer.current) clearTimeout(timer.current);
    setOpenKey(key);
  }
  function leave() {
    timer.current = setTimeout(() => setOpenKey(null), 150);
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { setMobileOpen(false); setOpenKey(null); }, [pathname]);

  const isActive = (paths: string[]) =>
    paths.some(p => pathname === p || (p !== '/' && pathname.startsWith(p)));

  return (
    <header className="sticky top-0 z-40 w-full navbar-glass">
      <div className="container flex h-16 items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src={LOGO} alt="EpochZero Learn" width={38} height={38}
            className="rounded-md" />
          <div className="flex flex-col leading-none">
            <span className="font-sans text-sm font-bold"
              style={{ color: 'hsl(var(--foreground))' }}>
              EpochZero Learn
            </span>
            <span className="text-[10px] hidden xl:block"
              style={{ color: 'hsl(var(--foreground-muted))' }}>
              Multi-Domain Tech Learning Hub
            </span>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center h-16 relative">

          {/* Learn */}
          <div onMouseEnter={() => enter('learn')} onMouseLeave={leave}
            className="h-full flex items-center">
            <button className={cn('nav-link-underline',
              isActive(['/learn', '/articles', '/videos', '/podcast', '/resources']) && 'active')}>
              Learn
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openKey === 'learn' && 'rotate-180')} />
            </button>
          </div>

          {/* Tests */}
          <div onMouseEnter={() => enter('tests')} onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={cn('nav-link-underline', isActive(['/tests']) && 'active')}>
              Tests
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openKey === 'tests' && 'rotate-180')} />
            </button>
            {openKey === 'tests' && <Dropdown items={TESTS_ITEMS} />}
          </div>

          {/* Forum */}
          <div onMouseEnter={() => enter('forum')} onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={cn('nav-link-underline', isActive(['/forum']) && 'active')}>
              Forum
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openKey === 'forum' && 'rotate-180')} />
            </button>
            {openKey === 'forum' && <Dropdown items={FORUM_ITEMS} />}
          </div>

          {/* Campus */}
          <div onMouseEnter={() => enter('campus')} onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={cn('nav-link-underline', isActive(['/clubs', '/events']) && 'active')}>
              Campus
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openKey === 'campus' && 'rotate-180')} />
            </button>
            {openKey === 'campus' && <Dropdown items={CAMPUS_ITEMS} />}
          </div>

          {/* About */}
          <Link href="/about"
            className={cn('nav-link-underline', pathname === '/about' && 'active')}>
            About
          </Link>

          {/* ── Right icons — matches CyberDefenders icon row ── */}
          <div className="ml-4 flex items-center gap-1">
            <ThemeToggle />
            <Link href="/dashboard"
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg ml-1',
                'font-sans font-medium text-sm transition-colors',
              )}
              style={{
                color: pathname.startsWith('/dashboard')
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--foreground-muted))',
                background: pathname.startsWith('/dashboard')
                  ? 'hsl(var(--primary) / 0.1)'
                  : 'transparent',
              }}
              onMouseEnter={e => {
                if (!pathname.startsWith('/dashboard')) {
                  (e.currentTarget as HTMLElement).style.background = 'hsl(var(--muted))';
                  (e.currentTarget as HTMLElement).style.color = 'hsl(var(--foreground))';
                }
              }}
              onMouseLeave={e => {
                if (!pathname.startsWith('/dashboard')) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'hsl(var(--foreground-muted))';
                }
              }}
            >
              <User className="w-3.5 h-3.5" /> Dashboard
            </Link>
          </div>

          {/* ── Learn mega menu ── */}
          {openKey === 'learn' && (
            <div onMouseEnter={() => enter('learn')} onMouseLeave={leave}
              className="absolute top-full right-0 w-[700px] z-50 rounded-xl overflow-hidden"
              style={{
                background: 'hsl(var(--card))',
                boxShadow: 'var(--shadow-dropdown)',
                border: '1px solid hsl(var(--border))',
                marginTop: '0px',
              }}>

              {/* Domain strip */}
              <div className="grid grid-cols-4 border-b"
                style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--surface))' }}>
                {[
                  { label: 'REMA',            sub: 'Reverse Engineering',    href: '/learn?domain=rema',   color: '#8B5E1A', soon: false },
                  { label: 'Cloud Security',  sub: 'Architecture & Threats', href: '/learn?domain=cloud',  color: '#1B5FA8', soon: false },
                  { label: 'Cryptography',    sub: 'Applied & PKI',          href: '/learn?domain=crypto', color: '#6B3AD4', soon: true  },
                  { label: 'Web Development', sub: 'Full Stack & Secure',    href: '/learn?domain=webdev', color: '#1B7C3E', soon: true  },
                ].map(d => (
                  <Link key={d.href}
                    href={d.soon ? '#' : d.href}
                    className={cn(
                      'px-4 py-3 transition-colors group',
                      d.soon ? 'pointer-events-none opacity-40' : '',
                    )}
                    style={{}}
                    onMouseEnter={e => {
                      if (!d.soon) (e.currentTarget as HTMLElement).style.background = 'hsl(var(--muted))';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = '';
                    }}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      {/* Tiny domain colour dot */}
                      <span className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: d.color }} />
                      <span className="font-sans font-semibold text-sm"
                        style={{ color: 'hsl(var(--foreground))' }}>
                        {d.label}
                      </span>
                      {d.soon && (
                        <span className="text-[9px] font-sans font-medium px-1 py-0.5 rounded"
                          style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground-subtle))' }}>
                          soon
                        </span>
                      )}
                    </div>
                    <div className="text-xs pl-4"
                      style={{ color: 'hsl(var(--foreground-muted))' }}>
                      {d.sub}
                    </div>
                  </Link>
                ))}
              </div>

              {/* Content columns */}
              <div className="grid grid-cols-4 divide-x"
                style={{ '--tw-divide-opacity': '1' } as React.CSSProperties}>
                {LEARN_COLS.map(col => (
                  <div key={col.heading} className="py-4">
                    <Link href={col.href}
                      className="block font-sans font-semibold text-xs uppercase tracking-wide mb-2 px-4 transition-colors"
                      style={{ color: 'hsl(var(--foreground-subtle))' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'hsl(var(--primary))'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'hsl(var(--foreground-subtle))'}
                    >
                      {col.heading}
                    </Link>
                    {col.items.map((item: LearnItem) => (
                      <Link key={item.href}
                        href={item.soon ? '#' : item.href}
                        className={cn(
                          'flex items-center justify-between font-sans text-sm',
                          'px-4 py-1.5 mx-1 rounded-lg transition-colors',
                          item.soon ? 'pointer-events-none opacity-40' : '',
                        )}
                        style={{ color: 'hsl(var(--foreground-muted))' }}
                        onMouseEnter={e => {
                          if (!item.soon) {
                            (e.currentTarget as HTMLElement).style.background = 'hsl(var(--muted))';
                            (e.currentTarget as HTMLElement).style.color = 'hsl(var(--foreground))';
                          }
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = '';
                          (e.currentTarget as HTMLElement).style.color = 'hsl(var(--foreground-muted))';
                        }}
                      >
                        <span>{item.label}</span>
                        {item.soon && (
                          <span className="text-[9px] font-sans font-medium px-1.5 py-0.5 rounded"
                            style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground-subtle))' }}>
                            soon
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'hsl(var(--foreground-muted))' }}
          onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <nav className="lg:hidden border-t max-h-[calc(100vh-4rem)] overflow-y-auto"
          style={{
            borderColor: 'hsl(var(--border))',
            background: 'hsl(var(--surface))',
          }}>
          <div className="container py-3 flex flex-col gap-0.5">

            {/* Learn accordion */}
            <div>
              <button
                onClick={() => setMobileExp(mobileExp === 'learn' ? null : 'learn')}
                className="w-full flex items-center justify-between px-3 py-3
                  font-sans font-medium text-sm rounded-lg transition-colors"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                Learn
                <ChevronDown className={cn('w-4 h-4 transition-transform',
                  mobileExp === 'learn' && 'rotate-180')} />
              </button>
              {mobileExp === 'learn' && (
                <div className="pb-2 grid grid-cols-2 pl-2">
                  {LEARN_COLS.map(col => (
                    <div key={col.heading} className="px-3 pb-3">
                      <Link href={col.href} onClick={() => setMobileOpen(false)}
                        className="block font-sans font-semibold text-xs uppercase tracking-wide py-1 mb-1"
                        style={{ color: 'hsl(var(--foreground-subtle))' }}>
                        {col.heading}
                      </Link>
                      {col.items.map((item: LearnItem) => (
                        <Link key={item.href}
                          href={item.soon ? '#' : item.href}
                          onClick={item.soon ? undefined : () => setMobileOpen(false)}
                          className="block font-sans text-sm px-2 py-1.5 rounded-lg"
                          style={{
                            color: item.soon ? 'hsl(var(--foreground-subtle))' : 'hsl(var(--foreground-muted))',
                          }}>
                          {item.label}{item.soon ? ' ·' : ''}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <MobileAccordion label="Tests"  id="tests"  items={TESTS_ITEMS}
              open={mobileExp} setOpen={setMobileExp} onClose={() => setMobileOpen(false)} />
            <MobileAccordion label="Forum"  id="forum"  items={FORUM_ITEMS}
              open={mobileExp} setOpen={setMobileExp} onClose={() => setMobileOpen(false)} />
            <MobileAccordion label="Campus" id="campus" items={CAMPUS_ITEMS}
              open={mobileExp} setOpen={setMobileExp} onClose={() => setMobileOpen(false)} />

            <Link href="/about" onClick={() => setMobileOpen(false)}
              className="block px-3 py-3 font-sans font-medium text-sm rounded-lg"
              style={{ color: 'hsl(var(--foreground-muted))' }}>
              About
            </Link>

            <div className="flex items-center gap-3 px-3 py-3 border-t mt-1"
              style={{ borderColor: 'hsl(var(--border))' }}>
              <ThemeToggle />
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 font-sans font-medium text-sm"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                <User className="w-4 h-4" /> Dashboard
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

// ── Mobile accordion ──────────────────────────────────────────────────────────

function MobileAccordion({ label, id, items, open, setOpen, onClose }: {
  label: string; id: string; items: DropItem[];
  open: string | null; setOpen: (v: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div>
      <button onClick={() => setOpen(open === id ? null : id)}
        className="w-full flex items-center justify-between px-3 py-3
          font-sans font-medium text-sm rounded-lg"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        {label}
        <ChevronDown className={cn('w-4 h-4 transition-transform', open === id && 'rotate-180')} />
      </button>
      {open === id && (
        <div className="pl-3 pb-2">
          {items.map((item, i) =>
            item === 'sep' ? (
              <div key={i} className="my-1.5 mx-3 border-t"
                style={{ borderColor: 'hsl(var(--border))' }} />
            ) : (
              <Link key={item.href}
                href={item.soon ? '#' : item.href}
                onClick={item.soon ? undefined : onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg font-sans text-sm transition-colors"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                <span>{item.label}</span>
                {item.soon && (
                  <span className="text-[9px] font-sans font-medium px-1.5 rounded"
                    style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground-subtle))' }}>
                    soon
                  </span>
                )}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
