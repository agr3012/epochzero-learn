'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOGO = 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

// ─── Types ────────────────────────────────────────────────────────────────────

type LearnItem = { label: string; href: string; soon?: boolean };
type DropItem  = { label: string; href: string; soon?: boolean } | 'sep';

// ─── Data ─────────────────────────────────────────────────────────────────────

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
      { label: 'All Episodes',   href: '/podcast' },
      { label: 'REMA',           href: '/podcast?tag=REMA' },
      { label: 'Cloud Security', href: '/podcast?tag=cloud' },
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
      { label: 'Research Papers', href: '/resources?type=research-paper' },
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

// ─── Shared dropdown component ────────────────────────────────────────────────

function Dropdown({ items }: { items: DropItem[] }) {
  return (
    <div className="absolute top-full left-0 min-w-[210px]
      bg-navy-900 border border-navy-700 shadow-xl z-50 py-1.5">
      {items.map((item, i) =>
        item === 'sep' ? (
          <div key={i} className="my-1 border-t border-navy-800" />
        ) : (
          <Link
            key={item.href}
            href={item.soon ? '#' : item.href}
            className={cn(
              'flex items-center justify-between px-4 py-2',
              'font-mono text-xs uppercase tracking-wider transition-colors',
              item.soon
                ? 'text-bone-500 pointer-events-none'
                : 'text-bone-200 hover:text-gold-500 hover:bg-navy-800',
            )}>
            <span className={item.soon ? 'opacity-50' : ''}>{item.label}</span>
            {item.soon && (
              <span className="ml-3 font-mono text-[9px] uppercase tracking-wider
                px-1.5 py-0.5 border border-navy-600 text-bone-500 leading-none">
                soon
              </span>
            )}
          </Link>
        )
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

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

  // Clear timer on unmount
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  // Close on route change
  useEffect(() => { setMobileOpen(false); setOpenKey(null); }, [pathname]);

  const isActive = (paths: string[]) =>
    paths.some(p => pathname === p || (p !== '/' && pathname.startsWith(p)));

  const btnCls = (active: boolean) => cn(
    'flex items-center gap-1 px-3 py-2 h-16',
    'font-mono text-xs uppercase tracking-wider transition-colors border-b-2',
    active
      ? 'text-gold-500 border-gold-500'
      : 'text-bone-200 hover:text-gold-500 border-transparent',
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-700 bg-navy-900/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src={LOGO} alt="EpochZero Learn" width={44} height={44} />
          <div className="flex flex-col leading-none">
            <span className="font-mono text-sm font-bold tracking-tight text-bone-50">
              EpochZero Learn
            </span>
            <span className="font-mono text-[9px] tracking-[0.25em] text-gold-500 uppercase hidden xl:block">
              Multi-Domain Tech Learning Hub
            </span>
          </div>
        </Link>

        {/* ── Desktop nav — position:relative so mega menu anchors here ── */}
        <nav className="hidden lg:flex items-center gap-0 h-16 relative">

          {/* Learn button — no relative wrapper needed, mega menu lives in nav */}
          <div
            onMouseEnter={() => enter('learn')}
            onMouseLeave={leave}
            className="h-full flex items-center">
            <button className={btnCls(isActive(['/learn', '/articles', '/videos', '/podcast', '/resources']))}>
              Learn
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openKey === 'learn' && 'rotate-180')} />
            </button>
          </div>

          {/* Tests */}
          <div
            onMouseEnter={() => enter('tests')}
            onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={btnCls(isActive(['/tests']))}>
              Tests
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openKey === 'tests' && 'rotate-180')} />
            </button>
            {openKey === 'tests' && <Dropdown items={TESTS_ITEMS} />}
          </div>

          {/* Forum */}
          <div
            onMouseEnter={() => enter('forum')}
            onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={btnCls(isActive(['/forum']))}>
              Forum
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openKey === 'forum' && 'rotate-180')} />
            </button>
            {openKey === 'forum' && <Dropdown items={FORUM_ITEMS} />}
          </div>

          {/* Campus */}
          <div
            onMouseEnter={() => enter('campus')}
            onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={btnCls(isActive(['/clubs', '/events']))}>
              Campus
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                openKey === 'campus' && 'rotate-180')} />
            </button>
            {openKey === 'campus' && <Dropdown items={CAMPUS_ITEMS} />}
          </div>

          {/* About */}
          <Link href="/about" className={btnCls(pathname === '/about')}>
            About
          </Link>

          {/* Dashboard */}
          <Link href="/dashboard"
            className={cn(
              'ml-3 flex items-center gap-1.5 px-3 py-1.5',
              'font-mono text-xs uppercase tracking-wider transition-colors border',
              pathname.startsWith('/dashboard')
                ? 'border-gold-500 text-gold-500 bg-gold-500/10'
                : 'border-navy-700 text-bone-300 hover:border-gold-500/60 hover:text-gold-500',
            )}>
            <User className="w-3.5 h-3.5" /> Dashboard
          </Link>

          {/* ── Learn mega menu — right-aligned inside <nav> ── */}
          {openKey === 'learn' && (
            <div
              onMouseEnter={() => enter('learn')}
              onMouseLeave={leave}
              className="absolute top-full right-0 w-[760px]
                bg-navy-900 border border-navy-700 shadow-2xl z-50
                grid grid-cols-4 divide-x divide-navy-800">
              {LEARN_COLS.map(col => (
                <div key={col.heading} className="py-5 px-4">
                  <Link href={col.href}
                    className="block font-mono text-[10px] uppercase tracking-[0.2em]
                      text-gold-500 mb-3 hover:text-gold-400 transition-colors">
                    {col.heading}
                  </Link>
                  {col.items.map((item: LearnItem) => (
                    <Link key={item.href}
                      href={item.soon ? '#' : item.href}
                      className={cn(
                        'flex items-center justify-between',
                        'font-mono text-xs uppercase tracking-wider px-2 py-1.5 -mx-2 transition-colors',
                        item.soon
                          ? 'text-bone-600 pointer-events-none'
                          : 'text-bone-300 hover:text-gold-500 hover:bg-navy-800',
                      )}>
                      <span className={item.soon ? 'opacity-50' : ''}>{item.label}</span>
                      {item.soon && (
                        <span className="ml-2 font-mono text-[9px] uppercase tracking-wider
                          px-1.5 py-0.5 border border-navy-600 text-bone-500 leading-none">
                          soon
                        </span>
                      )}
                    </Link>
                  ))}

                </div>
              ))}
            </div>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-bone-100 hover:text-gold-500 transition-colors"
          onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-navy-700 bg-navy-900
          max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="container py-4 flex flex-col gap-1">

            {/* Learn accordion */}
            <div>
              <button
                onClick={() => setMobileExp(mobileExp === 'learn' ? null : 'learn')}
                className="w-full flex items-center justify-between px-4 py-3
                  font-mono text-sm uppercase tracking-wider text-bone-200">
                Learn
                <ChevronDown className={cn('w-4 h-4 transition-transform',
                  mobileExp === 'learn' && 'rotate-180')} />
              </button>
              {mobileExp === 'learn' && (
                <div className="pb-2 grid grid-cols-2 gap-0 pl-2">
                  {LEARN_COLS.map(col => (
                    <div key={col.heading} className="px-3 pb-3">
                      <Link href={col.href} onClick={() => setMobileOpen(false)}
                        className="block font-mono text-[9px] uppercase tracking-widest
                          text-gold-500 py-1 mb-1">
                        {col.heading}
                      </Link>
                      {col.items.map((item: LearnItem) => (
                        <Link key={item.href}
                          href={item.soon ? '#' : item.href}
                          onClick={item.soon ? undefined : () => setMobileOpen(false)}
                          className={cn(
                            'block font-mono text-xs uppercase tracking-wider px-2 py-1.5',
                            item.soon ? 'text-bone-500' : 'text-bone-300 hover:text-gold-500 hover:bg-navy-800',
                          )}>
                          {item.label}{item.soon ? ' ›' : ''}
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
              className="block px-4 py-3 font-mono text-sm uppercase tracking-wider
                text-bone-200 hover:text-gold-500 transition-colors">
              About
            </Link>
            <Link href="/dashboard" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-3
                font-mono text-sm uppercase tracking-wider
                text-bone-200 hover:text-gold-500 transition-colors">
              <User className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

// ─── Mobile accordion helper ──────────────────────────────────────────────────

function MobileAccordion({ label, id, items, open, setOpen, onClose }: {
  label: string; id: string; items: DropItem[];
  open: string | null; setOpen: (v: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div>
      <button
        onClick={() => setOpen(open === id ? null : id)}
        className="w-full flex items-center justify-between px-4 py-3
          font-mono text-sm uppercase tracking-wider text-bone-200">
        {label}
        <ChevronDown className={cn('w-4 h-4 transition-transform',
          open === id && 'rotate-180')} />
      </button>
      {open === id && (
        <div className="pl-4 pb-2">
          {items.map((item, i) =>
            item === 'sep' ? (
              <div key={i} className="my-1.5 mx-4 border-t border-navy-800" />
            ) : (
              <Link key={item.href}
                href={item.soon ? '#' : item.href}
                onClick={item.soon ? undefined : onClose}
                className={cn(
                  'flex items-center justify-between px-4 py-2',
                  'font-mono text-xs uppercase tracking-wider transition-colors',
                  item.soon ? 'text-bone-500' : 'text-bone-300 hover:text-gold-500',
                )}>
                <span className={item.soon ? 'opacity-50' : ''}>{item.label}</span>
                {item.soon && (
                  <span className="font-mono text-[9px] uppercase tracking-wider
                    px-1.5 border border-navy-600 text-bone-500">soon</span>
                )}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
