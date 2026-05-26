'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOGO =
  'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

// ─── Data ─────────────────────────────────────────────────────────────────────

const LEARN_COLS = [
  {
    heading: 'Articles',
    href: '/articles',
    items: [
      { label: 'All Articles',    href: '/articles' },
      { label: 'REMA',            href: '/articles?domain=rema' },
      { label: 'Cloud Security',  href: '/articles?domain=cloud' },
      { label: 'Cryptography',    href: '/articles?domain=crypto' },
      { label: 'Web Development', href: '/articles?domain=webdev' },
    ],
  },
  {
    heading: 'Videos',
    href: '/videos',
    items: [
      { label: 'All Videos',      href: '/videos' },
      { label: 'REMA',            href: '/videos?domain=rema' },
      { label: 'Cloud Security',  href: '/videos?domain=cloud' },
      { label: 'Cryptography',    href: '/videos?domain=crypto' },
      { label: 'Web Development', href: '/videos?domain=webdev' },
    ],
  },
  {
    heading: 'Podcast',
    href: '/podcast',
    items: [
      { label: 'All Episodes',    href: '/podcast' },
      { label: 'REMA Episodes',   href: '/podcast?domain=rema' },
      { label: 'Cloud Episodes',  href: '/podcast?domain=cloud' },
      { label: 'Crypto Episodes', href: '/podcast?domain=crypto' },
    ],
  },
  {
    heading: 'Resources',
    href: '/resources',
    items: [
      { label: 'All Resources',   href: '/resources' },
      { label: 'eBooks & PDFs',   href: '/resources?type=ebook' },
      { label: 'Question Banks',  href: '/resources?type=question-bank' },
      { label: 'MCQ Banks',       href: '/resources?type=mcq-bank' },
      { label: 'Cheatsheets',     href: '/resources?type=cheatsheet' },
      { label: 'Research Papers', href: '/resources?type=research-paper' },
    ],
  },
];

type Item = { label: string; href: string; soon?: boolean } | null;

const TESTS: Item[] = [
  { label: 'All Tests',       href: '/tests' },
  null,
  { label: 'REMA',            href: '/tests?domain=rema' },
  { label: 'Cloud Security',  href: '/tests?domain=cloud' },
  { label: 'Cryptography',    href: '/tests?domain=crypto',  soon: true },
  { label: 'Web Development', href: '/tests?domain=webdev',  soon: true },
];

const FORUM: Item[] = [
  { label: 'All Domains',    href: '/forum' },
  null,
  { label: 'REMA',           href: '/forum/rema' },
  { label: 'Cloud Security', href: '/forum/cloud' },
  { label: 'Cryptography',   href: '/forum/crypto' },
  { label: 'Web Dev',        href: '/forum/webdev' },
];

const CAMPUS: Item[] = [
  { label: 'REMA Club',           href: '/clubs/rema' },
  { label: 'Full Stack Dev Club', href: '/clubs/fullstack' },
  { label: 'Extension Activity',  href: '/clubs/extension' },
  null,
  { label: 'All Events',          href: '/events' },
  { label: 'CTF Competitions',    href: '/events?type=ctf' },
  { label: 'Workshops & Talks',   href: '/events?type=workshop' },
  { label: 'Industrial Visits',   href: '/events?type=industry' },
  { label: 'Hackathons',          href: '/events?type=hackathon', soon: true },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SoonTag() {
  return (
    <span className="ml-auto font-mono text-[9px] uppercase tracking-wider
      px-1.5 py-0.5 border border-navy-700 text-bone-500 leading-none">
      soon
    </span>
  );
}

function Dropdown({ items, onEnter, onLeave }: {
  items: Item[];
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute top-full left-0 mt-0 w-52
        bg-navy-900 border border-navy-700 border-t-0 shadow-xl z-50 py-1.5">
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="my-1 border-t border-navy-800" />
        ) : (
          <Link key={item.href}
            href={item.soon ? '#' : item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 font-mono text-xs text-bone-300',
              'hover:bg-navy-800 hover:text-gold-500 transition-colors',
              item.soon && 'pointer-events-none opacity-40',
            )}>
            {item.label}
            {item.soon && <SoonTag />}
          </Link>
        )
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu]         = useState<string | null>(null);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [mobileExpand, setMobileExpand] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hover handlers — open immediately, close with 120ms delay
  function enter(name: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpenMenu(name);
  }
  function leave() {
    timerRef.current = setTimeout(() => setOpenMenu(null), 120);
  }

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const active = (paths: string[]) =>
    paths.some(p => pathname === p || (p !== '/' && pathname.startsWith(p)));

  const btn = (isActive: boolean) =>
    cn(
      'flex items-center gap-1 px-3 py-2 font-mono text-xs uppercase',
      'tracking-wider transition-colors whitespace-nowrap h-16',
      isActive ? 'text-gold-500 border-b-2 border-gold-500' : 'text-bone-300 hover:text-bone-50',
    );

  return (
    // ── IMPORTANT: position:relative so mega menu can anchor to header ──
    <header className="sticky top-0 z-40 bg-navy-950/95 backdrop-blur-sm
      border-b border-navy-800 relative">

      {/* ── Desktop bar ── */}
      <div className="container flex items-center h-16 gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-3 mr-2">
          <Image src={LOGO} alt="EpochZero" width={32} height={32} className="rounded" />
          <div className="hidden sm:block leading-none">
            <div className="font-mono text-sm font-bold text-bone-50 tracking-wide">
              EpochZero Learn
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold-500 mt-0.5">
              Multi-Domain Tech Learning Hub
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0 ml-auto h-16">

          {/* Learn — hover triggers full-width mega panel */}
          <div
            onMouseEnter={() => enter('learn')}
            onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={btn(active(['/learn', '/articles', '/videos', '/podcast', '/resources']))}>
              Learn
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openMenu === 'learn' && 'rotate-180')} />
            </button>
          </div>

          {/* Tests */}
          <div
            onMouseEnter={() => enter('tests')}
            onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={btn(active(['/tests']))}>
              Tests
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openMenu === 'tests' && 'rotate-180')} />
            </button>
            {openMenu === 'tests' && (
              <Dropdown items={TESTS} onEnter={() => enter('tests')} onLeave={leave} />
            )}
          </div>

          {/* Forum */}
          <div
            onMouseEnter={() => enter('forum')}
            onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={btn(active(['/forum']))}>
              Forum
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openMenu === 'forum' && 'rotate-180')} />
            </button>
            {openMenu === 'forum' && (
              <Dropdown items={FORUM} onEnter={() => enter('forum')} onLeave={leave} />
            )}
          </div>

          {/* Campus */}
          <div
            onMouseEnter={() => enter('campus')}
            onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={btn(active(['/clubs', '/events']))}>
              Campus
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openMenu === 'campus' && 'rotate-180')} />
            </button>
            {openMenu === 'campus' && (
              <Dropdown items={CAMPUS} onEnter={() => enter('campus')} onLeave={leave} />
            )}
          </div>

          {/* About */}
          <Link href="/about" className={btn(pathname === '/about')}>About</Link>

          {/* Dashboard */}
          <Link href="/dashboard"
            className="ml-4 flex items-center gap-2 px-4 py-2 border border-gold-500/40
              font-mono text-xs uppercase tracking-wider text-bone-200
              hover:border-gold-500 hover:text-gold-500 transition-colors">
            <User className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </nav>

        {/* Hamburger */}
        <button
          className="lg:hidden ml-auto p-2 text-bone-300 hover:text-bone-50"
          onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── MEGA MENU — full width, anchored to header, not to button ── */}
      {openMenu === 'learn' && (
        <div
          onMouseEnter={() => enter('learn')}
          onMouseLeave={leave}
          className="absolute top-full left-0 right-0 bg-navy-900
            border-b border-navy-700 shadow-2xl z-50">
          <div className="container py-7 grid grid-cols-4 divide-x divide-navy-800">
            {LEARN_COLS.map(col => (
              <div key={col.heading} className="px-6 first:pl-0 last:pr-0">
                <Link href={col.href}
                  className="block font-mono text-[10px] uppercase tracking-[0.2em]
                    text-gold-500 mb-3 hover:text-gold-400 transition-colors">
                  {col.heading}
                </Link>
                <div className="space-y-1">
                  {col.items.map(item => (
                    <Link key={item.href} href={item.href}
                      className="block font-mono text-xs text-bone-300
                        hover:text-bone-50 py-1 transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-navy-800 bg-navy-950
          max-h-[calc(100vh-4rem)] overflow-y-auto divide-y divide-navy-800">

          {/* Learn accordion */}
          <MobileSection label="Learn" id="learn" open={mobileExpand} setOpen={setMobileExpand}>
            <div className="grid grid-cols-2 gap-4">
              {LEARN_COLS.map(col => (
                <div key={col.heading}>
                  <Link href={col.href}
                    className="block font-mono text-[9px] uppercase tracking-widest
                      text-gold-500 mb-2">
                    {col.heading}
                  </Link>
                  {col.items.map(item => (
                    <Link key={item.href} href={item.href}
                      className="block font-mono text-xs text-bone-300
                        hover:text-gold-500 py-1 pl-2">
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </MobileSection>

          <MobileSection label="Tests" id="tests" open={mobileExpand} setOpen={setMobileExpand}>
            <MobileItems items={TESTS} />
          </MobileSection>

          <MobileSection label="Forum" id="forum" open={mobileExpand} setOpen={setMobileExpand}>
            <MobileItems items={FORUM} />
          </MobileSection>

          <MobileSection label="Campus" id="campus" open={mobileExpand} setOpen={setMobileExpand}>
            <MobileItems items={CAMPUS} />
          </MobileSection>

          <Link href="/about"
            className="flex px-5 py-4 font-mono text-xs uppercase tracking-wider
              text-bone-200 hover:text-gold-500 transition-colors">
            About
          </Link>
          <Link href="/dashboard"
            className="flex items-center gap-2 px-5 py-4 font-mono text-xs uppercase
              tracking-wider text-bone-200 hover:text-gold-500 transition-colors">
            <User className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}

function MobileSection({ label, id, open, setOpen, children }: {
  label: string; id: string;
  open: string | null; setOpen: (v: string | null) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button onClick={() => setOpen(open === id ? null : id)}
        className="w-full flex items-center justify-between px-5 py-4
          font-mono text-xs uppercase tracking-wider text-bone-200">
        {label}
        <ChevronDown className={cn('w-4 h-4 transition-transform duration-150',
          open === id && 'rotate-180')} />
      </button>
      {open === id && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

function MobileItems({ items }: { items: Item[] }) {
  return (
    <div className="space-y-0.5">
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="my-2 border-t border-navy-800" />
        ) : (
          <Link key={item.href} href={item.soon ? '#' : item.href}
            className={cn(
              'flex items-center font-mono text-xs text-bone-300',
              'hover:text-gold-500 py-1.5 transition-colors',
              item.soon && 'opacity-40 pointer-events-none',
            )}>
            {item.label}
            {item.soon && <SoonTag />}
          </Link>
        )
      )}
    </div>
  );
}
