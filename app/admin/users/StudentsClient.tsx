'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, Circle, Trash2 } from 'lucide-react';

type User = {
  id: string; email: string; display_name: string | null;
  role: string; is_active: boolean; last_login_at: string | null; created_at: string;
};
type Batch = { id: string; enrollment_code: string; batch_label: string; courses: { id: string; title: string; slug: string } | null };
type Enrollment = { student_account_id: string; batch_id: string };

const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  super_admin: { bg: '#7c3aed20', color: '#7c3aed' },
  admin:       { bg: '#2563eb20', color: '#2563eb' },
  student:     { bg: '#05966920', color: '#059669' },
};

export function StudentsClient({ users: init, batches, enrollments }: { users: User[]; batches: Batch[]; enrollments: Enrollment[] }) {
  const [users, setUsers]       = useState(init);
  const [search, setSearch]     = useState('');
  const [roleFilter, setRole]   = useState('all');
  const [batchFilter, setBatch] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Build lookup: student_id → batch_ids
  const studentBatches = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const e of enrollments) {
      if (!map[e.student_account_id]) map[e.student_account_id] = [];
      map[e.student_account_id].push(e.batch_id);
    }
    return map;
  }, [enrollments]);

  // Unique courses from batches for filter
  const courses = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; title: string }[] = [];
    for (const b of batches) {
      if (b.courses && !seen.has(b.courses.id)) {
        seen.add(b.courses.id);
        list.push(b.courses);
      }
    }
    return list;
  }, [batches]);

  // Course filter → filter batches → filter students
  const [courseFilter, setCourse] = useState('all');
  const filteredBatches = useMemo(() =>
    courseFilter === 'all' ? batches : batches.filter(b => b.courses?.id === courseFilter),
  [batches, courseFilter]);

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    if (q && !u.email.toLowerCase().includes(q) && !(u.display_name ?? '').toLowerCase().includes(q)) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (batchFilter !== 'all') {
      const uBatches = studentBatches[u.id] ?? [];
      if (!uBatches.includes(batchFilter)) return false;
    } else if (courseFilter !== 'all') {
      const courseBatchIds = filteredBatches.map(b => b.id);
      const uBatches = studentBatches[u.id] ?? [];
      if (!uBatches.some(bid => courseBatchIds.includes(bid))) return false;
    }
    return true;
  }), [users, search, roleFilter, batchFilter, courseFilter, filteredBatches, studentBatches]);

  async function toggleActive(u: User) {
    const res = await fetch(`/api/admin/users/${u.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !u.is_active }) });
    if (res.ok) setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x));
  }

  async function deleteUser(id: string) {
    if (!confirm('Delete this student permanently? This cannot be undone.')) return;
    setDeleting(id);
    // No delete API yet — just deactivate
    const res = await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: false }) });
    if (res.ok) setUsers(prev => prev.map(x => x.id === id ? { ...x, is_active: false } : x));
    setDeleting(null);
  }

  const inp = 'px-3 py-2 rounded-lg border text-sm outline-none';
  const inpStyle = { background: 'hsl(var(--surface-elevated))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' };

  return (
    <div>
      {/* Filters */}
      <div className="rounded-xl border p-4 mb-4 space-y-3" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(var(--foreground-subtle))' }}>Filter Students</p>
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--foreground-muted))' }} />
            <input className={inp + ' w-full pl-9'} style={inpStyle} placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {/* Role */}
          <select className={inp} style={inpStyle} value={roleFilter} onChange={e => setRole(e.target.value)}>
            <option value="all">All roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          {/* Course filter */}
          {courses.length > 0 && (
            <select className={inp} style={inpStyle} value={courseFilter} onChange={e => { setCourse(e.target.value); setBatch('all'); }}>
              <option value="all">All courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}
          {/* Batch filter */}
          <select className={inp} style={inpStyle} value={batchFilter} onChange={e => setBatch(e.target.value)}>
            <option value="all">All batches</option>
            {filteredBatches.map(b => (
              <option key={b.id} value={b.id}>{b.enrollment_code} — {b.batch_label}</option>
            ))}
          </select>
        </div>
        <p className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
          Showing <strong style={{ color: 'hsl(var(--foreground))' }}>{filtered.length}</strong> of {users.length} students
          {batchFilter !== 'all' && ` · Batch: ${batches.find(b => b.id === batchFilter)?.enrollment_code}`}
          {courseFilter !== 'all' && batchFilter === 'all' && ` · Course: ${courses.find(c => c.id === courseFilter)?.title}`}
        </p>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
        {/* Header */}
        <div className="grid text-xs font-semibold px-5 py-3 border-b"
          style={{ gridTemplateColumns: '1fr 120px 100px 150px 80px 40px', color: 'hsl(var(--foreground-muted))', borderColor: 'hsl(var(--border))' }}>
          <span>Student</span>
          <span>Role</span>
          <span>Status</span>
          <span>Last login</span>
          <span>Action</span>
          <span />
        </div>

        {filtered.length === 0 && (
          <p className="px-5 py-8 text-sm text-center" style={{ color: 'hsl(var(--foreground-muted))' }}>
            No students match your filters
          </p>
        )}

        {filtered.map(u => {
          const badge = ROLE_BADGE[u.role] ?? ROLE_BADGE.student;
          const userBatchIds = studentBatches[u.id] ?? [];
          const userBatches  = batches.filter(b => userBatchIds.includes(b.id));
          return (
            <div key={u.id} className="grid items-center px-5 py-3 border-b"
              style={{ gridTemplateColumns: '1fr 120px 100px 150px 80px 40px', borderColor: 'hsl(var(--border))' }}>
              {/* Name + email + batch tags */}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>
                  {u.display_name ?? '—'}
                </p>
                <p className="text-xs truncate" style={{ color: 'hsl(var(--foreground-muted))' }}>{u.email}</p>
                {userBatches.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userBatches.map(b => (
                      <span key={b.id} className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                        style={{ background: 'hsl(var(--primary)/0.1)', color: 'hsl(var(--primary))' }}>
                        {b.enrollment_code}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Role */}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                style={{ background: badge.bg, color: badge.color }}>
                {u.role.replace('_', ' ')}
              </span>
              {/* Status toggle */}
              <button onClick={() => toggleActive(u)}
                className="flex items-center gap-1.5 text-xs font-medium w-fit px-2 py-1 rounded hover:bg-white/5 transition-colors"
                style={{ color: u.is_active ? '#10b981' : '#ef4444' }}>
                <Circle className="w-2 h-2 fill-current" />
                {u.is_active ? 'Active' : 'Inactive'}
              </button>
              {/* Last login */}
              <span className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>
                {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
              </span>
              {/* Delete */}
              <button onClick={() => deleteUser(u.id)} disabled={deleting === u.id}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-red-500/10 transition-colors disabled:opacity-40"
                style={{ color: '#ef4444' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              {/* Edit link */}
              <Link href={`/admin/users/${u.id}`} className="flex justify-end">
                <ChevronRight className="w-4 h-4" style={{ color: 'hsl(var(--foreground-subtle))' }} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
