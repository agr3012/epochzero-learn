'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const EPOCHZERO_LOGO =
  'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

type NavItem = { label: string; href: string; soon?: boolean };
type NavGroup = { label: string; href: string; items: NavItem[] };

const SEP: NavItem = { label: '---', href: '#' };

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Learn',
    href:  '/learn',
    items: [
      { label: 'Learning Path',    href: '/learn'     },
      { label: 'Articles',         href: '/articles'  },
      { label: 'Videos',           href: '/videos'    },
      SEP,
      { label: 'All Resources',    href: '/resources'                        },
      { label: 'eBooks',           href: '/resources?type=ebook'             },
      { label: 'Question Banks',   href: '/resources?type=question-bank'     },
      { label: 'MCQ Banks',        href: '/resources?type=mcq-bank'          },
      { label: 'Cheatsheets',      href: '/resources?type=cheatsheet'        },
      { label: 'Research Papers',  href: '/resources?type=research-paper'    },
    ],
  },
  {
    label: 'Practice',
    href:  '/tests',
    items: [
      { label: 'MCQ Tests',        href: '/tests'         },
      SEP,
      { label: 'Forum',            href: '/forum'         },
      { label: 'REMA Forum',       href: '/forum/rema'    },
      { label: 'Cloud Forum',      href: '/forum/cloud'   },
      { label: 'Crypto Forum',     href: '/forum/crypto'  },
      { label: 'Web Dev Forum',    href: '/forum/webdev'  },
    ],
  },
  {
    label: 'Community',
    href:  '/clubs',
    items: [
      { label: 'REMA Club',            href: '/clubs/rema'      },
      { label: 'Full Stack Dev Club',  href: '/clubs/fullstack' },
      { label: 'Extension Activity',   href: '/clubs/extension' },
      SEP,
      { label: 'All Events',           href: '/events'                    },
      { label: 'CTF Competitions',     href: '/events?type=ctf'           },
      { label: 'Workshops & Talks',    href: '/events?type=workshop'      },
      { label: 'Industrial Visits',    href: '/events?type=industry'      },
      { label: 'Extension Activity',   href: '/events?type=extension'     },
      { label: 'Hackathons',           href: '/events?type=hackathon', soon: true },
      SEP,
      { label: 'Podcast',              href: '/podcast' },
    ],
  },
];

const isSep = (i: NavItem) => i.label === '---';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [openGroup,   setOpenGroup]   = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);

  const groupActive = (g: NavGroup) =>
    pathname.startsWith(g.href) ||
    g.items.some(i => !isSep(i) && i.href !== '#' && pathname.startsWith(i.href.split('?')[0]));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-700 bg-navy-900/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src={EPOCHZERO_LOGO} alt="EpochZero Learn" width={42} height={42} className="shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="font-mono text-sm font-bold tracking-tight text-bone-50">EpochZero Learn</span>
            <span className="font-mono text-[9px] tracking-[0.2em] text-gold-500 uppercase hidden xl:block">
              Multi-Domain Tech Learning Hub
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center">
          {NAV_GROUPS.map(group => {
            const active = groupActive(group);
            const isOpen = openGroup === group.label;

            return (
              <div key={group.label} className="relative"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}>
                <button className={cn(
                  'flex items-center gap-0.5 px-3.5 py-2 font-mono text-xs uppercase tracking-wider transition-colors border-b-2',
                  active || isOpen
                    ? 'text-gold-500 border-gold-500'
                    : 'text-bone-200 hover:text-gold-500 border-transparent'
                )}>
                  {group.label}
                  <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')} />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 w-56 bg-navy-900 border border-navy-700 shadow-2xl py-2 z-50">
                    {group.items.map((item, idx) => {
                      if (isSep(item)) return <div key={idx} className="my-1 mx-3 border-t border-navy-700/60" />;
                      const ia = pathname === item.href || (item.href !== '/' && !item.href.includes('?') && pathname.startsWith(item.href));
                      return (
                        <Link key={idx} href={item.soon ? '#' : item.href}
                          onClick={() => setOpenGroup(null)}
                          className={cn(
                            'flex items-center justify-between px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors',
                            item.soon   ? 'text-bone-500 cursor-default'
                            : ia        ? 'text-gold-500 bg-navy-800'
                            :             'text-bone-200 hover:text-gold-500 hover:bg-navy-800'
                          )}>
                          {item.label}
                          {item.soon && <span className="text-[9px] border border-navy-600 px-1.5 py-0.5 ml-2">soon</span>}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <Link href="/about"
            className={cn(
              'px-3.5 py-2 font-mono text-xs uppercase tracking-wider transition-colors border-b-2',
              pathname === '/about' ? 'text-gold-500 border-gold-500' : 'text-bone-200 hover:text-gold-500 border-transparent'
            )}>
            About
          </Link>
        </nav>

        {/* Dashboard */}
        <div className="hidden lg:flex shrink-0">
          <Link href="/dashboard"
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors border',
              pathname.startsWith('/dashboard')
                ? 'border-gold-500 text-gold-500 bg-gold-500/10'
                : 'border-navy-700 text-bone-300 hover:border-gold-500/60 hover:text-gold-500'
            )}>
            <User className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2 text-bone-100 hover:text-gold-500 transition-colors"
          onClick={() => { setMobileOpen(o => !o); setMobileGroup(null); }}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-navy-700 bg-navy-900 max-h-[80vh] overflow-y-auto">
          <div className="py-2">
            {NAV_GROUPS.map(group => {
              const active   = groupActive(group);
              const expanded = mobileGroup === group.label;

              return (
                <div key={group.label}>
                  <button
                    onClick={() => setMobileGroup(expanded ? null : group.label)}
                    className={cn(
                      'w-full flex items-center justify-between px-5 py-4 font-mono text-sm uppercase tracking-wider transition-colors border-l-2',
                      active || expanded
                        ? 'text-gold-500 border-gold-500 bg-navy-800/60'
                        : 'text-bone-200 border-transparent'
                    )}>
                    {group.label}
                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', expanded && 'rotate-180')} />
                  </button>

                  {expanded && (
                    <div className="bg-navy-950 pb-1">
                      {group.items.map((item, idx) => {
                        if (isSep(item)) return <div key={idx} className="my-1 mx-5 border-t border-navy-700/40" />;
                        const ia = pathname === item.href;
                        return (
                          <Link key={idx} href={item.soon ? '#' : item.href}
                            onClick={item.soon ? e => e.preventDefault() : () => { setMobileOpen(false); setMobileGroup(null); }}
                            className={cn(
                              'flex items-center justify-between pl-8 pr-5 py-3 font-mono text-xs uppercase tracking-wider transition-colors border-l-2 border-transparent',
                              item.soon ? 'text-bone-500'
                              : ia      ? 'text-gold-500 bg-navy-800 border-gold-500'
                              :           'text-bone-300 hover:text-gold-500 hover:bg-navy-800/60'
                            )}>
                            {item.label}
                            {item.soon && <span className="text-[9px] border border-navy-700 px-1.5 py-0.5">soon</span>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <Link href="/about" onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center px-5 py-4 font-mono text-sm uppercase tracking-wider transition-colors border-l-2',
                pathname === '/about' ? 'text-gold-500 border-gold-500 bg-navy-800/60' : 'text-bone-200 border-transparent'
              )}>
              About
            </Link>

            <div className="border-t border-navy-700 mt-1">
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 px-5 py-4 font-mono text-sm uppercase tracking-wider transition-colors border-l-2',
                  pathname.startsWith('/dashboard') ? 'text-gold-500 border-gold-500 bg-navy-800/60' : 'text-bone-200 border-transparent'
                )}>
                <User className="w-4 h-4" /> Dashboard
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
