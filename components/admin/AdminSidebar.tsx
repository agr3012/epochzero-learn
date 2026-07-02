'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BookMarked, UserCircle2,
  LogOut, ChevronRight, Shield,
} from 'lucide-react';

const NAV = [
  { href: '/admin',         label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/admin/users',   label: 'Users',       icon: Users           },
  { href: '/admin/batches', label: 'Batches',     icon: BookMarked      },
  { href: '/admin/profile', label: 'My Profile',  icon: UserCircle2     },
];

export function AdminSidebar({ email, name }: { email: string; name: string | null }) {
  const path = usePathname();

  function isActive(href: string) {
    if (href === '/admin') return path === '/admin';
    return path.startsWith(href);
  }

  return (
    <aside className="w-60 shrink-0 flex flex-col min-h-screen border-r"
      style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>

      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'hsl(var(--primary))' }}>
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm" style={{ color: 'hsl(var(--foreground))' }}>Admin Panel</p>
            <p className="text-[10px] font-mono" style={{ color: 'hsl(var(--foreground-subtle))' }}>EpochZero</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                color: active ? 'hsl(var(--primary))' : 'hsl(var(--foreground-muted))',
              }}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <p className="text-xs font-semibold truncate mb-0.5" style={{ color: 'hsl(var(--foreground))' }}>
          {name ?? 'Admin'}
        </p>
        <p className="text-[10px] truncate mb-3" style={{ color: 'hsl(var(--foreground-subtle))' }}>{email}</p>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xs font-medium px-2 py-1 rounded"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            ← Site
          </Link>
          <form action="/api/auth/logout" method="POST" className="ml-auto">
            <button type="submit" className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded transition-colors hover:bg-red-500/10"
              style={{ color: '#ef4444' }}>
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
