'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const EPOCHZERO_LOGO = 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

const DOMAINS = [
  { slug: 'all',    label: 'All Domains',    comingSoon: false },
  { slug: 'rema',   label: 'REMA',           comingSoon: false },
  { slug: 'cloud',  label: 'Cloud',          comingSoon: false },
  { slug: 'crypto', label: 'Cryptography',   comingSoon: true  },
  { slug: 'webdev', label: 'Web Development',comingSoon: true  },
];

const PODCAST_TAGS = [
  { slug: 'all',   label: 'All Episodes', comingSoon: false },
  { slug: 'REMA',  label: 'REMA',         comingSoon: false },
  { slug: 'cloud', label: 'Cloud',        comingSoon: false },
  { slug: 'crypto',label: 'Cryptography', comingSoon: true  },
  { slug: 'webdev',label: 'Web Dev',      comingSoon: true  },
];

const CLUBS: { slug: string; label: string; href: string; comingSoon?: boolean }[] = [
  { slug: 'rema',      label: 'REMA Club',          href: '/clubs/rema'      },
  { slug: 'fullstack', label: 'Full Stack Club',     href: '/clubs/fullstack' },
];

const NAV_LINKS: Array<{
  href: string;
  label: string;
  hasDropdown?: boolean;
  dropdownType?: 'domain' | 'podcast' | 'clubs';
}> = [
  { href: '/learn',     label: 'Learn',      hasDropdown: true, dropdownType: 'domain'  },
  { href: '/articles',  label: 'Articles',   hasDropdown: true, dropdownType: 'domain'  },
  { href: '/videos',    label: 'Videos',     hasDropdown: true, dropdownType: 'domain'  },
  { href: '/tests',     label: 'Tests',      hasDropdown: true, dropdownType: 'domain'  },
  { href: '/resources', label: 'Resources',  hasDropdown: true, dropdownType: 'domain'  },
  { href: '/clubs',     label: 'Tech Clubs', hasDropdown: true, dropdownType: 'clubs'   },
  { href: '/podcast',   label: 'Podcast',    hasDropdown: true, dropdownType: 'podcast' },
  { href: '/about',     label: 'About'                                                   },
];

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentDomain = searchParams.get('domain') ?? 'all';
  const currentTag    = searchParams.get('tag')    ?? 'all';
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const buildDomainHref = (base: string, domain: string) =>
    domain === 'all' ? base : `${base}?domain=${domain}`;

  const buildTagHref = (base: string, tag: string) =>
    tag === 'all' ? base : `${base}?tag=${encodeURIComponent(tag)}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-700 bg-navy-900/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src={EPOCHZERO_LOGO}
            alt="EpochZero Learn"
            width={40}
            height={40}
            className="shrink-0"
          />
          <div className="flex flex-col leading-none">
            <span className="font-mono text-base font-bold tracking-tight text-bone-50">
              EpochZero Learn
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-gold-500 uppercase">
              Multi-Domain Tech Learning Hub
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href));

            if (!link.hasDropdown) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 font-mono text-sm uppercase tracking-wider transition-colors',
                    active
                      ? 'text-gold-500 border-b-2 border-gold-500'
                      : 'text-bone-200 hover:text-gold-500 border-b-2 border-transparent'
                  )}
                >
                  {link.label}
                </Link>
              );
            }

            // Build dropdown items based on type
            const dropdownItems = (() => {
              if (link.dropdownType === 'clubs') {
                return CLUBS.map((c) => ({
                  label: c.label,
                  href: c.href,
                  active: pathname.startsWith(c.href),
                  comingSoon: c.comingSoon ?? false,
                }));
              }
              if (link.dropdownType === 'podcast') {
                return PODCAST_TAGS.map((t) => ({
                  label: t.label,
                  href: buildTagHref(link.href, t.slug),
                  active: active && (t.slug === 'all' ? currentTag === 'all' : currentTag === t.slug),
                  comingSoon: t.comingSoon ?? false,
                }));
              }
              // domain
              return DOMAINS.map((d) => ({
                label: d.label,
                href: buildDomainHref(link.href, d.slug),
                active: active && currentDomain === d.slug,
                comingSoon: d.comingSoon ?? false,
              }));
            })();

            return (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => setOpenDropdown(link.href)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 font-mono text-sm uppercase tracking-wider transition-colors',
                    active
                      ? 'text-gold-500 border-b-2 border-gold-500'
                      : 'text-bone-200 hover:text-gold-500 border-b-2 border-transparent'
                  )}
                >
                  {link.label}
                  <ChevronDown className="w-3 h-3" />
                </Link>

                {openDropdown === link.href && (
                  <div className="absolute top-full left-0 min-w-[200px] bg-navy-900 border border-navy-700 shadow-xl py-2">
                    {dropdownItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.comingSoon ? '#' : item.href}
                        className={cn(
                          'flex items-center justify-between px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors',
                          item.comingSoon
                            ? 'text-bone-400 cursor-default'
                            : item.active
                            ? 'text-gold-500 bg-navy-800'
                            : 'text-bone-200 hover:text-gold-500 hover:bg-navy-800'
                        )}
                        onClick={item.comingSoon ? (e) => e.preventDefault() : undefined}
                      >
                        {item.label}
                        {item.comingSoon && (
                          <span className="font-mono text-[9px] text-bone-400 border border-navy-600 px-1.5 py-0.5 ml-2">
                            soon
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Dashboard icon — right of nav */}
        <div className="hidden lg:flex items-center ml-2 pl-2 border-l border-navy-700">
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 font-mono text-sm uppercase tracking-wider transition-colors border',
              pathname.startsWith('/dashboard')
                ? 'border-gold-500 text-gold-500 bg-gold-500/10'
                : 'border-navy-700 text-bone-300 hover:border-gold-500/60 hover:text-gold-500'
            )}
          >
            <User className="w-3.5 h-3.5" />
            Dashboard
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-bone-100 hover:text-gold-500 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="lg:hidden border-t border-navy-700 bg-navy-900">
          <div className="container py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== '/' && pathname.startsWith(link.href));

              const mobileItems = (() => {
                if (link.dropdownType === 'clubs') {
                  return CLUBS.map((c) => ({ label: c.label, href: c.href, comingSoon: c.comingSoon ?? false }));
                }
                if (link.dropdownType === 'podcast') {
                  return PODCAST_TAGS.map((t) => ({ label: t.label, href: buildTagHref(link.href, t.slug), comingSoon: t.comingSoon ?? false }));
                }
                return DOMAINS.map((d) => ({ label: d.label, href: buildDomainHref(link.href, d.slug), comingSoon: d.comingSoon ?? false }));
              })();

              return (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'px-4 py-3 font-mono text-sm uppercase tracking-wider transition-colors block',
                      active
                        ? 'text-gold-500 bg-navy-800 border-l-2 border-gold-500'
                        : 'text-bone-200 hover:text-gold-500 border-l-2 border-transparent'
                    )}
                  >
                    {link.label}
                  </Link>
                  {link.hasDropdown && active && (
                    <div className="pl-6 mt-1 mb-2">
                      {mobileItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.comingSoon ? '#' : item.href}
                          onClick={item.comingSoon ? (e) => e.preventDefault() : () => setOpen(false)}
                          className={cn(
                            'flex items-center justify-between px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors',
                            item.comingSoon ? 'text-bone-400' : 'text-bone-300 hover:text-gold-500'
                          )}
                        >
                          {item.label}
                          {item.comingSoon && (
                            <span className="text-[9px] border border-navy-600 px-1.5 py-0.5 ml-2">soon</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
