'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/learn', label: 'Learn' },
  { href: '/articles', label: 'Articles' },
  { href: '/videos', label: 'Videos' },
  { href: '/tests', label: 'Tests' },
  { href: '/resources', label: 'Resources' },
  { href: '/podcast', label: 'Podcast' },
  { href: '/about', label: 'About' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-700 bg-navy-900/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-14 h-14 transition-transform group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="REMA Club"
              fill
              className="object-contain"
              priority
            />
          </div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-mono text-base font-bold tracking-tight text-bone-50">
              REMA Club
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-gold-500 uppercase">
              Reverse · Reveal · Respond
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href));
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
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'px-4 py-3 font-mono text-sm uppercase tracking-wider transition-colors',
                    active
                      ? 'text-gold-500 bg-navy-800 border-l-2 border-gold-500'
                      : 'text-bone-200 hover:text-gold-500 border-l-2 border-transparent'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
