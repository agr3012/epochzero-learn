'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const LOGO =
  'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

// ─── Nav structure (UGC 4Q aligned) ──────────────────────────────────────────

type NavItem  = { label: string; href: string; soon?: boolean };
type NavEntry =
  | { type: 'link';  label: string; href: string }
  | { type: 'group'; label: string; href: string; badge?: string; items: (NavItem | 'sep')[] };

const NAV: NavEntry[] = [
  // Q2 — e-Content
  {
    type: 'group', label: 'Content', href: '/learn', badge: 'Q2',
    items: [
      { label: 'Learning Path',   href: '/learn' },
      { label: 'Articles',        href: '/articles' },
      { label: 'Videos',          href: '/videos' },
      'sep',
      { label: 'All Resources',   href: '/resources' },
      { label: 'eBooks & PDFs',   href: '/resources?type=ebook' },
      { label: 'Question Banks',  href: '/resources?type=question-bank' },
      { label: 'MCQ Banks',       href: '/resources?type=mcq-bank' },
      { label: 'Cheatsheets',     href: '/resources?type=cheatsheet' },
      { label: 'Research Papers', href: '/resources?type=research-paper' },
    ],
  },

  // Q3 — Self-Assessment
  {
    type: 'group', label: 'Tests', href: '/tests', badge: 'Q3',
    items: [
      { label: 'All Tests',        href: '/tests' },
      'sep',
      { label: 'REMA',             href: '/tests?domain=rema' },
      { label: 'Cloud Security',   href: '/tests?domain=cloud' },
      { label: 'Cryptography',     href: '/tests?domain=crypto',  soon: true },
      { label: 'Web Development',  href: '/tests?domain=webdev',  soon: true },
    ],
  },

  // Q4 — Discussion Forum
  {
    type: 'group', label: 'Forum', href: '/forum', badge: 'Q4',
    items: [
      { label: 'All Domains',     href: '/forum' },
      'sep',
      { label: 'REMA',            href: '/forum/rema' },
      { label: 'Cloud Security',  href: '/forum/cloud' },
      { label: 'Cryptography',    href: '/forum/crypto' },
      { label: 'Web Dev',         href: '/forum/webdev' },
    ],
  },

  // Campus
  {
    type: 'group', label: 'Campus', href: '/clubs',
    items: [
      { label: 'REMA Club',           href: '/clubs/rema' },
      { label: 'Full Stack Dev Club', href: '/clubs/fullstack' },
      { label: 'Extension Activity',  href: '/clubs/extension' },
      'sep',
      { label: 'All Events',          href: '/events' },
      { label: 'CTF Competitions',    href: '/events?type=ctf' },
      { label: 'Workshops & Talks',   href: '/events?type=workshop' },
      { label: 'Industrial Visits',   href: '/events?type=industry' },
      { label: 'Hackathons',          href: '/events?type=hackathon', soon: true },
      'sep',
      { label: 'Podcast',             href: '/podcast' },
    ],
  },

  // About
  { type: 'link', label: 'About', href: '/about' },
];

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function Dropdown({ items }: { items: (NavItem | 'sep')[] }) {
  return (
    <div className="absolute top-full left-0 mt-0 min-w-[200px]
      bg-navy-900 border border-navy-700 border-t-0 shadow-xl z-50 py-1.5">
      {items.map((item, i) =>
        item === 'sep' ? (
          <div key={i} className="my-1 border-t border-navy-800" />
        ) : (
          <Link key={item.href}
            href={item.soon ? '#' : item.href}
            className="flex items-center justify-between px-4 py-1.5
              font-mono text-xs text-bone-300
              hover:bg-navy-800 hover:text-gold-500 transition-colors">
            <span className={item.soon ? 'opacity-40' : ''}>{item.label}</span>
            {item.soon && (
              <span className="font-mono text-[9px] uppercase tracking-wider
                px-1.5 py-0.5 border border-navy-600 text-bone-500 leading-none ml-3">
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
  const pathname    = usePathname();
  const [openGroup, setOpenGroup]     = useState<string | null>(null);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);

  function groupActive(entry: NavEntry) {
    if (entry.type === 'link') return pathname === entry.href;
    return (
      pathname.startsWith(entry.href) ||
      entry.items.some(i =>
        i !== 'sep' && (pathname === i.href || pathname.startsWith(i.href.split('?')[0]))
      )
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-navy-950/95 backdrop-blur-sm border-b border-navy-800">

      {/* ── Desktop ── */}
      <div className="container flex items-center h-16 gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-3 mr-4">
          <Image src={LOGO} alt="EpochZero" width={32} height={32} className="rounded" />
          <div className="hidden sm:block leading-none">
            <div className="font-mono text-sm font-bold text-bone-50">EpochZero Learn</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-gold-500 mt-0.5">
              Multi-Domain Tech Learning Hub
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0 ml-auto">
          {NAV.map(entry => {
            const isActive = groupActive(entry);

            if (entry.type === 'link') {
              return (
                <Link key={entry.href} href={entry.href}
                  className={cn(
                    'px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors h-16 flex items-center',
                    isActive ? 'text-gold-500 border-b-2 border-gold-500' : 'text-bone-300 hover:text-bone-50',
                  )}>
                  {entry.label}
                </Link>
              );
            }

            return (
              <div key={entry.href} className="relative h-16 flex items-center">
                <button
                  onClick={() => setOpenGroup(p => p === entry.label ? null : entry.label)}
                  onBlur={() => setTimeout(() => setOpenGroup(null), 150)}
                  className={cn(
                    'flex items-center gap-1 px-3 py-2 font-mono text-xs uppercase tracking-wider transition-colors h-16',
                    isActive ? 'text-gold-500 border-b-2 border-gold-500' : 'text-bone-300 hover:text-bone-50',
                  )}>
                  {entry.label}
                  {entry.badge && (
                    <span className="font-mono text-[8px] px-1 border border-current opacity-60 leading-none ml-0.5">
                      {entry.badge}
                    </span>
                  )}
                  <ChevronDown className={cn(
                    'w-3 h-3 transition-transform duration-150 ml-0.5',
                    openGroup === entry.label && 'rotate-180',
                  )} />
                </button>
                {openGroup === entry.label && <Dropdown items={entry.items} />}
              </div>
            );
          })}

          {/* Dashboard */}
          <Link href="/dashboard"
            className="ml-4 flex items-center gap-2 px-4 py-2
              border border-gold-500/40 font-mono text-xs uppercase tracking-wider
              text-bone-200 hover:border-gold-500 hover:text-gold-500 transition-colors">
            <User className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </nav>

        {/* Hamburger */}
        <button
          className="lg:hidden ml-auto p-2 text-bone-300 hover:text-bone-50"
          onClick={() => setMobileOpen(v => !v)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-navy-800 bg-navy-950
          max-h-[calc(100vh-4rem)] overflow-y-auto divide-y divide-navy-800">

          {NAV.map(entry => {
            if (entry.type === 'link') {
              return (
                <Link key={entry.href} href={entry.href}
                  className="flex px-5 py-4 font-mono text-xs uppercase tracking-wider
                    text-bone-200 hover:text-gold-500 transition-colors">
                  {entry.label}
                </Link>
              );
            }
            return (
              <div key={entry.href}>
                <button
                  onClick={() => setMobileGroup(p => p === entry.label ? null : entry.label)}
                  className="w-full flex items-center justify-between px-5 py-4
                    font-mono text-xs uppercase tracking-wider text-bone-200">
                  <span className="flex items-center gap-2">
                    {entry.label}
                    {entry.badge && (
                      <span className="font-mono text-[8px] px-1 border border-bone-600 text-bone-500 leading-none">
                        {entry.badge}
                      </span>
                    )}
                  </span>
                  <ChevronDown className={cn(
                    'w-4 h-4 transition-transform duration-150',
                    mobileGroup === entry.label && 'rotate-180',
                  )} />
                </button>
                {mobileGroup === entry.label && (
                  <div className="px-5 pb-3 space-y-0.5">
                    {entry.items.map((item, i) =>
                      item === 'sep' ? (
                        <div key={i} className="my-2 border-t border-navy-800" />
                      ) : (
                        <div key={item.href} className="flex items-center justify-between">
                          <Link
                            href={item.soon ? '#' : item.href}
                            className={cn(
                              'font-mono text-xs py-1.5 transition-colors',
                              item.soon ? 'text-bone-500 pointer-events-none' : 'text-bone-300 hover:text-gold-500',
                            )}>
                            {item.label}
                          </Link>
                          {item.soon && (
                            <span className="font-mono text-[9px] uppercase tracking-wider
                              px-1.5 border border-navy-600 text-bone-500">
                              soon
                            </span>
                          )}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}

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
