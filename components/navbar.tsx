'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const DOMAINS = [
  { slug: 'all', label: 'All Domains' },
  { slug: 'rema', label: 'REMA' },
  { slug: 'cloud', label: 'Cloud' },
  { slug: 'crypto', label: 'Cryptography' },
  { slug: 'webdev', label: 'Web Development' },
];

const NAV_LINKS: Array<{
  href: string;
  label: string;
  hasDropdown?: boolean;
}> = [
  { href: '/learn', label: 'Learn', hasDropdown: true },
  { href: '/articles', label: 'Articles', hasDropdown: true },
  { href: '/videos', label: 'Videos', hasDropdown: true },
  { href: '/tests', label: 'Tests', hasDropdown: true },
  { href: '/resources', label: 'Resources', hasDropdown: true },
  { href: '/podcast', label: 'Podcast' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentDomain = searchParams.get('domain') ?? 'all';
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const buildHref = (base: string, domain: string) =>
    domain === 'all' ? base : `${base}?domain=${domain}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-700 bg-navy-900/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
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
                    {DOMAINS.map((d) => (
                      <Link
                        key={d.slug}
                        href={buildHref(link.href, d.slug)}
                        className={cn(
                          'block px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors',
                          active && currentDomain === d.slug
                            ? 'text-gold-500 bg-navy-800'
                            : 'text-bone-200 hover:text-gold-500 hover:bg-navy-800'
                        )}
                      >
                        {d.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

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
                      {DOMAINS.map((d) => (
                        <Link
                          key={d.slug}
                          href={buildHref(link.href, d.slug)}
                          onClick={() => setOpen(false)}
                          className={cn(
                            'block px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors',
                            currentDomain === d.slug
                              ? 'text-gold-500'
                              : 'text-bone-300 hover:text-gold-500'
                          )}
                        >
                          {d.label}
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
