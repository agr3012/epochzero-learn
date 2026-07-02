'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserPlus, BookOpen,
  Plus, LogOut, ChevronDown, ChevronRight,
  Shield, UserCircle2, Circle,
} from 'lucide-react';
import { useState } from 'react';

type Batch = {
  id: string;
  enrollment_code: string;
  batch_label: string;
  is_active: boolean;
  courses: { title: string; slug: string } | null;
};

export function AdminSidebar({
  email, name, role, batches,
}: {
  email: string;
  name: string | null;
  role: string;
  batches: Batch[];
}) {
  const path = usePathname();
  const [batchesOpen, setBatchesOpen] = useState(
    path.startsWith('/admin/batches') || path.startsWith('/admin/users')
  );

  function active(href: string, exact = false) {
    return exact ? path === href : path.startsWith(href);
  }

  const linkCls = (href: string, exact = false) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full text-left ${
      active(href, exact) ? 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]' : 'text-[hsl(var(--foreground-muted))] hover:bg-white/5'
    }`;

  return (
    <aside
      className="w-64 shrink-0 flex flex-col h-screen border-r overflow-y-auto"
      style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}
    >
      {/* Brand */}
      <div className="px-5 py-5 border-b shrink-0" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'hsl(var(--primary))' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm font-display leading-tight" style={{ color: 'hsl(var(--foreground))' }}>
              Admin Panel
            </p>
            <p className="text-[10px] font-mono uppercase tracking-widest mt-0.5" style={{ color: 'hsl(var(--primary))' }}>
              {role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">

        {/* Dashboard */}
        <Link href="/admin" className={linkCls('/admin', true)}>
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard
        </Link>

        {/* Divider */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'hsl(var(--foreground-subtle))' }}>
            Students
          </p>
        </div>

        <Link href="/admin/users" className={linkCls('/admin/users')}>
          <Users className="w-4 h-4 shrink-0" />
          All Students
          {active('/admin/users') && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
        </Link>

        <Link href="/admin/users/new" className={linkCls('/admin/users/new', true)}>
          <UserPlus className="w-4 h-4 shrink-0" />
          Add Student
        </Link>

        {/* Batches section (collapsible) */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'hsl(var(--foreground-subtle))' }}>
            Batches &amp; Courses
          </p>
        </div>

        <Link href="/admin/batches/new" className={linkCls('/admin/batches/new', true)}>
          <Plus className="w-4 h-4 shrink-0" />
          Create Batch
        </Link>

        <button
          onClick={() => setBatchesOpen(o => !o)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full hover:bg-white/5"
          style={{ color: 'hsl(var(--foreground-muted))' }}
        >
          <BookOpen className="w-4 h-4 shrink-0" />
          All Batches
          <span className="ml-auto">{batchesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}</span>
        </button>

        {batchesOpen && (
          <div className="ml-3 pl-3 border-l space-y-0.5" style={{ borderColor: 'hsl(var(--border))' }}>
            <Link href="/admin/batches"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active('/admin/batches', true) ? 'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)]' : 'text-[hsl(var(--foreground-muted))] hover:bg-white/5'}`}>
              All batches
            </Link>
            {batches.map(b => (
              <Link key={b.id} href={`/admin/batches/${b.id}`}
                className={`flex items-start gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active(`/admin/batches/${b.id}`, true) ? 'text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.12)]' : 'text-[hsl(var(--foreground-muted))] hover:bg-white/5'}`}>
                <Circle className="w-1.5 h-1.5 mt-1.5 shrink-0 fill-current" style={{ opacity: 0.4 }} />
                <div>
                  <p className="leading-tight">{b.enrollment_code}</p>
                  <p className="text-[10px] opacity-60 leading-tight">{b.courses?.title ?? '—'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Profile */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'hsl(var(--foreground-subtle))' }}>
            Account
          </p>
        </div>

        <Link href="/admin/profile" className={linkCls('/admin/profile')}>
          <UserCircle2 className="w-4 h-4 shrink-0" />
          My Profile
          {active('/admin/profile') && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t shrink-0" style={{ borderColor: 'hsl(var(--border))' }}>
        <p className="text-xs font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>{name ?? 'Admin'}</p>
        <p className="text-[10px] truncate mb-3" style={{ color: 'hsl(var(--foreground-subtle))' }}>{email}</p>
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xs px-2 py-1 rounded font-medium" style={{ color: 'hsl(var(--foreground-muted))' }}>
            ← Site
          </Link>
          <form action="/api/auth/logout" method="POST" className="ml-auto">
            <button type="submit" className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
              style={{ color: '#ef4444' }}>
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
