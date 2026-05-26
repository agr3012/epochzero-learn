'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import {
  Menu, X, ChevronDown, User,
  BookOpen, FileText, Video, Headphones,
  Download, FlaskConical, MessageSquare,
  GraduationCap, Users, CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LOGO =
  'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

// ─── Data ────────────────────────────────────────────────────────────────────

const MATERIALS_COLS = [
  {
    heading: 'Learn',
    icon: BookOpen,
    items: [
      { label: 'Learning Path',   href: '/learn' },
      { label: '4Q Course View',  href: '/learn/4q' },
      { label: 'All Articles',    href: '/articles' },
    ],
  },
  {
    heading: 'By Domain',
    icon: FileText,
    items: [
      { label: 'REMA',            href: '/articles?domain=rema' },
      { label: 'Cloud Security',  href: '/articles?domain=cloud' },
      { label: 'Cryptography',    href: '/articles?domain=crypto' },
      { label: 'Web Development', href: '/articles?domain=webdev' },
    ],
  },
  {
    heading: 'Watch & Listen',
    icon: Video,
    items: [
      { label: 'Video Walkthroughs', href: '/videos' },
      { label: 'REMA Videos',        href: '/videos?domain=rema' },
      { label: 'Cloud Videos',       href: '/videos?domain=cloud' },
      { label: 'Podcast',            href: '/podcast' },
    ],
  },
  {
    heading: 'Downloads',
    icon: Download,
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

type NavItem = { label: string; href: string; soon?: boolean } | null;

const TESTS: NavItem[] = [
  { label: 'All Tests',        href: '/tests' },
  null,
  { label: 'REMA',             href: '/tests?domain=rema' },
  { label: 'Cloud Security',   href: '/tests?domain=cloud' },
  { label: 'Cryptography',     href: '/tests?domain=crypto',  soon: true },
  { label: 'Web Development',  href: '/tests?domain=webdev',  soon: true },
];

const FORUM: NavItem[] = [
  { label: 'All Domains',     href: '/forum' },
  null,
  { label: 'REMA',            href: '/forum/rema' },
  { label: 'Cloud Security',  href: '/forum/cloud' },
  { label: 'Cryptography',    href: '/forum/crypto' },
  { label: 'Web Dev',         href: '/forum/webdev' },
];

const CAMPUS: NavItem[] = [
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SoonBadge() {
  return (
    <span className="ml-auto font-mono text-[9px] uppercase tracking-wider
      px-1.5 py-0.5 border border-navy-600 text-bone-500">
      soon
    </span>
  );
}

/** Standard dropdown (Tests / Forum / Campus) */
function Dropdown({ items }: { items: NavItem[] }) {
  return (
    <div className="absolute top-full left-0 mt-0 w-52 bg-navy-900 border
      border-navy-700 shadow-xl z-50 py-1">
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="my-1 border-t border-navy-700" />
        ) : (
          <Link key={item.href}
            href={item.soon ? '#' : item.href}
            className={cn(
              'flex items-center px-4 py-2 font-mono text-xs text-bone-200',
              'hover:bg-navy-800 hover:text-gold-500 transition-colors',
              item.soon && 'pointer-events-none opacity-50',
            )}>
            {item.label}
            {item.soon && <SoonBadge />}
          </Link>
        )
      )}
    </div>
  );
}

/** Mega menu — Materials */
function MegaMenu() {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0
      w-[720px] max-w-[95vw] bg-navy-900 border border-navy-700
      shadow-xl z-50 p-6 grid grid-cols-4 gap-6">
      {MATERIALS_COLS.map(({ heading, icon: Icon, items }) => (
        <div key={heading}>
          <div className="flex items-center gap-2 mb-3">
            <Icon className="w-3.5 h-3.5 text-gold-500" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-500">
              {heading}
            </span>
          </div>
          <div className="space-y-1">
            {items.map(item => (
              <Link key={item.href} href={item.href}
                className="block font-mono text-xs text-bone-300
                  hover:text-gold-500 transition-colors py-0.5">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [openMenu, setOpenMenu]       = useState<string | null>(null);
  const [mobileOpen2, setMobileOpen2] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  function toggleMenu(name: string) {
    setOpenMenu(prev => (prev === name ? null : name));
  }

  const isActive = (hrefs: string[]) =>
    hrefs.some(h => pathname === h || (h !== '/' && pathname.startsWith(h.split('?')[0])));

  return (
    <header ref={navRef}
      className="sticky top-0 z-40 bg-navy-950/95 backdrop-blur border-b border-navy-800">

      {/* ── Desktop bar ── */}
      <div className="container flex items-center h-16 gap-8">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-3">
          <Image src={LOGO} alt="EpochZero" width={32} height={32} className="rounded" />
          <div className="hidden sm:block">
            <div className="font-mono text-sm font-bold text-bone-50 leading-none">
              EpochZero Learn
            </div>
            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold-500 mt-0.5">
              Multi-Domain Tech Learning Hub
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-auto">

          {/* Materials — mega menu trigger */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('materials')}
              className={cn(
                'flex items-center gap-1 px-3 py-2 font-mono text-xs uppercase',
                'tracking-wider transition-colors',
                isActive(['/learn', '/articles', '/videos', '/podcast', '/resources'])
                  ? 'text-gold-500'
                  : 'text-bone-300 hover:text-bone-50',
              )}>
              Materials
              <ChevronDown className={cn(
                'w-3 h-3 transition-transform',
                openMenu === 'materials' && 'rotate-180',
              )} />
            </button>
            {openMenu === 'materials' && <MegaMenu />}
          </div>

          {/* Tests */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('tests')}
              className={cn(
                'flex items-center gap-1 px-3 py-2 font-mono text-xs uppercase',
                'tracking-wider transition-colors',
                isActive(['/tests']) ? 'text-gold-500' : 'text-bone-300 hover:text-bone-50',
              )}>
              Tests
              <ChevronDown className={cn('w-3 h-3 transition-transform', openMenu === 'tests' && 'rotate-180')} />
            </button>
            {openMenu === 'tests' && <Dropdown items={TESTS} />}
          </div>

          {/* Forum */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('forum')}
              className={cn(
                'flex items-center gap-1 px-3 py-2 font-mono text-xs uppercase',
                'tracking-wider transition-colors',
                isActive(['/forum']) ? 'text-gold-500' : 'text-bone-300 hover:text-bone-50',
              )}>
              Forum
              <ChevronDown className={cn('w-3 h-3 transition-transform', openMenu === 'forum' && 'rotate-180')} />
            </button>
            {openMenu === 'forum' && <Dropdown items={FORUM} />}
          </div>

          {/* Campus */}
          <div className="relative">
            <button
              onClick={() => toggleMenu('campus')}
              className={cn(
                'flex items-center gap-1 px-3 py-2 font-mono text-xs uppercase',
                'tracking-wider transition-colors',
                isActive(['/clubs', '/events']) ? 'text-gold-500' : 'text-bone-300 hover:text-bone-50',
              )}>
              Campus
              <ChevronDown className={cn('w-3 h-3 transition-transform', openMenu === 'campus' && 'rotate-180')} />
            </button>
            {openMenu === 'campus' && <Dropdown items={CAMPUS} />}
          </div>

          {/* About */}
          <Link href="/about"
            className={cn(
              'px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors',
              pathname === '/about' ? 'text-gold-500' : 'text-bone-300 hover:text-bone-50',
            )}>
            About
          </Link>

          {/* Dashboard button */}
          <Link href="/dashboard"
            className="ml-3 flex items-center gap-2 px-4 py-2 border border-gold-500/50
              font-mono text-xs uppercase tracking-wider text-bone-200
              hover:border-gold-500 hover:text-gold-500 transition-colors">
            <User className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </nav>

        {/* Mobile: hamburger */}
        <button
          className="lg:hidden ml-auto p-2 text-bone-300 hover:text-bone-50"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-navy-800 bg-navy-950 max-h-[80vh] overflow-y-auto">

          {/* Materials accordion */}
          <div className="border-b border-navy-800">
            <button
              onClick={() => setMobileOpen2(v => v === 'materials' ? null : 'materials')}
              className="w-full flex items-center justify-between px-5 py-4
                font-mono text-xs uppercase tracking-wider text-bone-200">
              Materials
              <ChevronDown className={cn('w-4 h-4 transition-transform',
                mobileOpen2 === 'materials' && 'rotate-180')} />
            </button>
            {mobileOpen2 === 'materials' && (
              <div className="pb-3 px-5 grid grid-cols-2 gap-x-6 gap-y-1">
                {MATERIALS_COLS.map(col => (
                  <div key={col.heading} className="mb-3">
                    <div className="font-mono text-[9px] uppercase tracking-widest
                      text-gold-500 mb-2">{col.heading}</div>
                    {col.items.map(item => (
                      <Link key={item.href} href={item.href}
                        className="block font-mono text-xs text-bone-300
                          hover:text-gold-500 py-1">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tests accordion */}
          <MobileAccordion label="Tests" id="tests" open={mobileOpen2}
            setOpen={setMobileOpen2} items={TESTS} />

          {/* Forum accordion */}
          <MobileAccordion label="Forum" id="forum" open={mobileOpen2}
            setOpen={setMobileOpen2} items={FORUM} />

          {/* Campus accordion */}
          <MobileAccordion label="Campus" id="campus" open={mobileOpen2}
            setOpen={setMobileOpen2} items={CAMPUS} />

          {/* About + Dashboard */}
          <Link href="/about"
            className="flex items-center px-5 py-4 font-mono text-xs uppercase
              tracking-wider text-bone-200 border-b border-navy-800
              hover:text-gold-500 transition-colors">
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

// ─── Mobile accordion helper ──────────────────────────────────────────────────

function MobileAccordion({
  label, id, open, setOpen, items,
}: {
  label: string;
  id: string;
  open: string | null;
  setOpen: (v: string | null) => void;
  items: NavItem[];
}) {
  return (
    <div className="border-b border-navy-800">
      <button
        onClick={() => setOpen(open === id ? null : id)}
        className="w-full flex items-center justify-between px-5 py-4
          font-mono text-xs uppercase tracking-wider text-bone-200">
        {label}
        <ChevronDown className={cn('w-4 h-4 transition-transform',
          open === id && 'rotate-180')} />
      </button>
      {open === id && (
        <div className="pb-3 px-5 space-y-0.5">
          {items.map((item, i) =>
            item === null ? (
              <div key={i} className="my-2 border-t border-navy-800" />
            ) : (
              <Link key={item.href}
                href={item.soon ? '#' : item.href}
                className={cn(
                  'flex items-center font-mono text-xs text-bone-300',
                  'hover:text-gold-500 py-1.5 transition-colors',
                  item.soon && 'opacity-50 pointer-events-none',
                )}>
                {item.label}
                {item.soon && <SoonBadge />}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
