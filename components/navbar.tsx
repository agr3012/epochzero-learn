'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOGO = 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

// ── Data ──────────────────────────────────────────────────────────────────────

const DOMAINS = [
  { slug: 'all',    label: 'All Domains',     soon: false },
  { slug: 'rema',   label: 'REMA',            soon: false },
  { slug: 'cloud',  label: 'Cloud Security',  soon: false },
  { slug: 'crypto', label: 'Cryptography',    soon: true  },
  { slug: 'webdev', label: 'Web Development', soon: true  },
];

type LearnItem = { label: string; href: string; soon?: boolean };
type LearnExtra = { heading: string; href: string; items: { label: string; href: string }[] };
type LearnCol = { heading: string; href: string; items: LearnItem[]; extra?: LearnExtra };

// Learn mega menu — 3 columns
const LEARN_COLS: LearnCol[] = [
  {
    heading: 'Articles',
    href: '/articles',
    items: [
      { label: 'All Articles',    href: '/articles'               },
      { label: 'REMA',            href: '/articles?domain=rema'   },
      { label: 'Cloud Security',  href: '/articles?domain=cloud'  },
      { label: 'Cryptography',    href: '/articles?domain=crypto',  soon: true },
      { label: 'Web Development', href: '/articles?domain=webdev',  soon: true },
    ],
  },
  {
    heading: 'Videos',
    href: '/videos',
    items: [
      { label: 'All Videos',      href: '/videos'               },
      { label: 'REMA',            href: '/videos?domain=rema'   },
      { label: 'Cloud Security',  href: '/videos?domain=cloud'  },
      { label: 'Cryptography',    href: '/videos?domain=crypto',  soon: true },
      { label: 'Web Development', href: '/videos?domain=webdev',  soon: true },
    ],
  },
  {
    heading: 'Podcast',
    href: '/podcast',
    items: [
      { label: 'All Episodes',   href: '/podcast'             },
      { label: 'REMA',           href: '/podcast?tag=REMA'    },
      { label: 'Cloud Security', href: '/podcast?tag=cloud'   },
    ],
    extra: {
      heading: 'Resources',
      href: '/resources',
      items: [
        { label: 'All Resources',   href: '/resources'                       },
        { label: 'eBooks & PDFs',   href: '/resources?type=ebook'            },
        { label: 'Question Banks',  href: '/resources?type=question-bank'    },
        { label: 'MCQ Banks',       href: '/resources?type=mcq-bank'         },
        { label: 'Cheatsheets',     href: '/resources?type=cheatsheet'       },
        { label: 'Research Papers', href: '/resources?type=research-paper'   },
      ],
    },
  },
];

type DropItem = { label: string; href: string; soon?: boolean } | 'sep';

const TESTS_ITEMS: DropItem[] = [
  { label: 'All Tests',       href: '/tests'                  },
  'sep',
  { label: 'REMA',            href: '/tests?domain=rema'      },
  { label: 'Cloud Security',  href: '/tests?domain=cloud'     },
  { label: 'Cryptography',    href: '/tests?domain=crypto',   soon: true },
  { label: 'Web Development', href: '/tests?domain=webdev',   soon: true },
];

const FORUM_ITEMS: DropItem[] = [
  { label: 'All Domains',    href: '/forum'          },
  'sep',
  { label: 'REMA',           href: '/forum/rema'     },
  { label: 'Cloud Security', href: '/forum/cloud'    },
  { label: 'Cryptography',   href: '/forum/crypto'   },
  { label: 'Web Dev',        href: '/forum/webdev'   },
];

const CAMPUS_ITEMS: DropItem[] = [
  { label: 'REMA Club',           href: '/clubs/rema'             },
  { label: 'Full Stack Dev Club', href: '/clubs/fullstack'        },
  { label: 'Extension Activity',  href: '/clubs/extension'        },
  'sep',
  { label: 'All Events',          href: '/events'                 },
  { label: 'CTF Competitions',    href: '/events?type=ctf'        },
  { label: 'Workshops & Talks',   href: '/events?type=workshop'   },
  { label: 'Industrial Visits',   href: '/events?type=industry'   },
  { label: 'Hackathons',          href: '/events?type=hackathon', soon: true },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function SoonTag() {
  return (
    <span className="ml-auto font-mono text-[9px] uppercase tracking-wider
      px-1.5 py-0.5 border border-navy-600 text-bone-500 leading-none shrink-0">
      soon
    </span>
  );
}

function Dropdown({ items, onEnter, onLeave }: {
  items: DropItem[];
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute top-full left-0 min-w-[200px]
        bg-navy-900 border border-navy-700 shadow-xl z-50 py-1.5">
      {items.map((item, i) =>
        item === 'sep' ? (
          <div key={i} className="my-1 border-t border-navy-800" />
        ) : (
          <Link key={item.href}
            href={item.soon ? '#' : item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 font-mono text-xs',
              'uppercase tracking-wider transition-colors',
              item.soon
                ? 'pointer-events-none text-bone-500'
                : 'text-bone-200 hover:text-gold-500 hover:bg-navy-800',
            )}>
            <span className={item.soon ? 'opacity-50' : ''}>{item.label}</span>
            {item.soon && <SoonTag />}
          </Link>
        )
      )}
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen]             = useState(false);
  const [hover, setHover]           = useState<string | null>(null);
  const [mobileExpand, setMobile]   = useState<string | null>(null);
  const timerRef                    = useRef<ReturnType<typeof setTimeout> | null>(null);

  function enter(key: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    setHover(key);
  }
  function leave() {
    timerRef.current = setTimeout(() => setHover(null), 120);
  }

  const isActive = (hrefs: string[]) =>
    hrefs.some(h => pathname === h || (h !== '/' && pathname.startsWith(h)));

  const navCls = (active: boolean) =>
    cn(
      'flex items-center gap-0.5 px-3 py-2 font-mono text-xs uppercase tracking-wider',
      'transition-colors border-b-2 h-16',
      active
        ? 'text-gold-500 border-gold-500'
        : 'text-bone-200 hover:text-gold-500 border-transparent',
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-700 bg-navy-900/80 backdrop-blur-md relative">
      <div className="container flex h-16 items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src={LOGO} alt="EpochZero Learn" width={44} height={44} className="shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="font-mono text-sm font-bold tracking-tight text-bone-50">
              EpochZero Learn
            </span>
            <span className="font-mono text-[9px] tracking-[0.25em] text-gold-500 uppercase hidden xl:block">
              Multi-Domain Tech Learning Hub
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0 h-16">

          {/* Learn — triggers mega menu */}
          <div
            onMouseEnter={() => enter('learn')}
            onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={navCls(isActive(['/learn', '/articles', '/videos', '/podcast', '/resources']))}>
              Learn
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                hover === 'learn' && 'rotate-180')} />
            </button>
          </div>

          {/* Tests */}
          <div
            onMouseEnter={() => enter('tests')}
            onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={navCls(isActive(['/tests']))}>
              Tests
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                hover === 'tests' && 'rotate-180')} />
            </button>
            {hover === 'tests' && (
              <Dropdown items={TESTS_ITEMS}
                onEnter={() => enter('tests')} onLeave={leave} />
            )}
          </div>

          {/* Forum */}
          <div
            onMouseEnter={() => enter('forum')}
            onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={navCls(isActive(['/forum']))}>
              Forum
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                hover === 'forum' && 'rotate-180')} />
            </button>
            {hover === 'forum' && (
              <Dropdown items={FORUM_ITEMS}
                onEnter={() => enter('forum')} onLeave={leave} />
            )}
          </div>

          {/* Campus */}
          <div
            onMouseEnter={() => enter('campus')}
            onMouseLeave={leave}
            className="relative h-full flex items-center">
            <button className={navCls(isActive(['/clubs', '/events']))}>
              Campus
              <ChevronDown className={cn('w-3 h-3 transition-transform duration-150',
                hover === 'campus' && 'rotate-180')} />
            </button>
            {hover === 'campus' && (
              <Dropdown items={CAMPUS_ITEMS}
                onEnter={() => enter('campus')} onLeave={leave} />
            )}
          </div>

          {/* About */}
          <Link href="/about" className={navCls(pathname === '/about')}>
            About
          </Link>

          {/* Dashboard */}
          <Link href="/dashboard"
            className={cn(
              'ml-3 flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors border',
              pathname.startsWith('/dashboard')
                ? 'border-gold-500 text-gold-500 bg-gold-500/10'
                : 'border-navy-700 text-bone-300 hover:border-gold-500/60 hover:text-gold-500',
            )}>
            <User className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2 text-bone-100 hover:text-gold-500 transition-colors"
          onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── Learn mega menu — fixed 580px, anchored to header ── */}
      {hover === 'learn' && (
        <div
          onMouseEnter={() => enter('learn')}
          onMouseLeave={leave}
          className="absolute top-full left-0 w-[580px] max-w-[95vw]
            bg-navy-900 border border-navy-700 border-t-0 shadow-2xl z-50
            grid grid-cols-3 divide-x divide-navy-800">
          {LEARN_COLS.map(col => (
            <div key={col.heading} className="py-4 px-4">
              {/* Column heading */}
              <Link href={col.href}
                className="block font-mono text-[10px] uppercase tracking-[0.2em]
                  text-gold-500 mb-2 hover:text-gold-400 transition-colors">
                {col.heading}
              </Link>
              {col.items.map(item => (
                <Link key={item.href}
                  href={item.soon ? '#' : item.href}
                  className={cn(
                    'flex items-center font-mono text-xs uppercase tracking-wider py-1 transition-colors',
                    item.soon
                      ? 'pointer-events-none text-bone-600'
                      : 'text-bone-300 hover:text-gold-500',
                  )}>
                  <span className={item.soon ? 'opacity-50' : ''}>{item.label}</span>
                  {item.soon && <SoonTag />}
                </Link>
              ))}

              {/* Extra section in col 3 (Resources) */}
              {col.extra && (
                <>
                  <div className="my-3 border-t border-navy-800" />
                  <Link href={col.extra.href}
                    className="block font-mono text-[10px] uppercase tracking-[0.2em]
                      text-gold-500 mb-2 hover:text-gold-400 transition-colors">
                    {col.extra.heading}
                  </Link>
                  {col.extra.items.map(item => (
                    <Link key={item.href} href={item.href}
                      className="block font-mono text-xs uppercase tracking-wider
                        text-bone-300 hover:text-gold-500 py-1 transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Mobile nav ── */}
      {open && (
        <nav className="lg:hidden border-t border-navy-700 bg-navy-900">
          <div className="container py-4 flex flex-col gap-1">

            {/* Learn accordion */}
            <div>
              <button
                onClick={() => setMobile(mobileExpand === 'learn' ? null : 'learn')}
                className="w-full flex items-center justify-between px-4 py-3
                  font-mono text-sm uppercase tracking-wider text-bone-200">
                Learn
                <ChevronDown className={cn('w-4 h-4 transition-transform',
                  mobileExpand === 'learn' && 'rotate-180')} />
              </button>
              {mobileExpand === 'learn' && (
                <div className="pl-4 pb-2 grid grid-cols-2 gap-2">
                  {LEARN_COLS.map(col => (
                    <div key={col.heading}>
                      <Link href={col.href} onClick={() => setOpen(false)}
                        className="block font-mono text-[9px] uppercase tracking-widest
                          text-gold-500 px-4 py-1">
                        {col.heading}
                      </Link>
                      {col.items.map(item => (
                        <Link key={item.href} href={item.soon ? '#' : item.href}
                          onClick={item.soon ? undefined : () => setOpen(false)}
                          className={cn('block font-mono text-xs uppercase tracking-wider px-4 py-1',
                            item.soon ? 'text-bone-500' : 'text-bone-300 hover:text-gold-500')}>
                          {item.label}
                          {item.soon && ' ›'}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tests accordion */}
            <MobileSection label="Tests" id="tests" open={mobileExpand} setOpen={setMobile} onClose={() => setOpen(false)}>
              {TESTS_ITEMS}
            </MobileSection>

            {/* Forum accordion */}
            <MobileSection label="Forum" id="forum" open={mobileExpand} setOpen={setMobile} onClose={() => setOpen(false)}>
              {FORUM_ITEMS}
            </MobileSection>

            {/* Campus accordion */}
            <MobileSection label="Campus" id="campus" open={mobileExpand} setOpen={setMobile} onClose={() => setOpen(false)}>
              {CAMPUS_ITEMS}
            </MobileSection>

            <Link href="/about" onClick={() => setOpen(false)}
              className="px-4 py-3 font-mono text-sm uppercase tracking-wider
                text-bone-200 hover:text-gold-500 border-l-2 border-transparent
                hover:border-gold-500/40 transition-colors block">
              About
            </Link>
            <Link href="/dashboard" onClick={() => setOpen(false)}
              className="px-4 py-3 font-mono text-sm uppercase tracking-wider
                text-bone-200 hover:text-gold-500 border-l-2 border-transparent
                hover:border-gold-500/40 transition-colors flex items-center gap-2">
              <User className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function MobileSection({ label, id, open, setOpen, onClose, children }: {
  label: string; id: string;
  open: string | null; setOpen: (v: string | null) => void;
  onClose: () => void;
  children: DropItem[];
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
          {children.map((item, i) =>
            item === 'sep' ? (
              <div key={i} className="my-1 mx-4 border-t border-navy-800" />
            ) : (
              <Link key={item.href}
                href={item.soon ? '#' : item.href}
                onClick={item.soon ? undefined : onClose}
                className={cn(
                  'flex items-center justify-between px-4 py-1.5',
                  'font-mono text-xs uppercase tracking-wider transition-colors',
                  item.soon ? 'text-bone-500' : 'text-bone-300 hover:text-gold-500',
                )}>
                <span className={item.soon ? 'opacity-50' : ''}>{item.label}</span>
                {item.soon && <SoonTag />}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
