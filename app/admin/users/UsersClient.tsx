'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Plus, ChevronRight, Circle } from 'lucide-react';

type User = {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
};

const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  super_admin: { bg: '#7c3aed20', color: '#7c3aed' },
  admin:       { bg: '#2563eb20', color: '#2563eb' },
  student:     { bg: '#05966920', color: '#059669' },
};

export function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers]     = useState(initialUsers);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRole] = useState('all');
  const [showCreate, setShow] = useState(false);

  // Create form state
  const [newEmail, setNewEmail]   = useState('');
  const [newName, setNewName]     = useState('');
  const [newPw, setNewPw]         = useState('');
  const [newRole, setNewRole]     = useState('student');
  const [creating, setCreating]   = useState(false);
  const [createErr, setCreateErr] = useState('');

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || u.email.toLowerCase().includes(q) || (u.display_name ?? '').toLowerCase().includes(q);
    const matchR  = roleFilter === 'all' || u.role === roleFilter;
    return matchQ && matchR;
  }), [users, search, roleFilter]);

  async function createUser() {
    if (!newEmail || !newName || !newPw) { setCreateErr('All fields required'); return; }
    setCreating(true); setCreateErr('');
    const res  = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newEmail, display_name: newName, password: newPw, role: newRole }) });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) { setCreateErr(data.error ?? 'Failed'); return; }
    setUsers(prev => [data.user, ...prev]);
    setShow(false); setNewEmail(''); setNewName(''); setNewPw(''); setNewRole('student');
  }

  const inp = 'w-full px-3 py-2 rounded-lg border text-sm outline-none';
  const inpStyle = { background: 'hsl(var(--surface-elevated))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--foreground-muted))' }} />
          <input className={inp + ' pl-9'} style={inpStyle} placeholder="Search email or name…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className={inp + ' w-36'} style={inpStyle} value={roleFilter} onChange={e => setRole(e.target.value)}>
          <option value="all">All roles</option>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <button onClick={() => setShow(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'hsl(var(--primary))' }}>
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border p-5 mb-4 space-y-3" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
          <p className="font-semibold text-sm mb-1" style={{ color: 'hsl(var(--foreground))' }}>Create New User</p>
          <div className="grid grid-cols-2 gap-3">
            <input className={inp} style={inpStyle} placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
            <input className={inp} style={inpStyle} placeholder="Display Name" value={newName} onChange={e => setNewName(e.target.value)} />
            <input type="password" className={inp} style={inpStyle} placeholder="Password" value={newPw} onChange={e => setNewPw(e.target.value)} />
            <select className={inp} style={inpStyle} value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          {createErr && <p className="text-xs" style={{ color: '#ef4444' }}>{createErr}</p>}
          <div className="flex gap-2">
            <button onClick={createUser} disabled={creating}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'hsl(var(--primary))' }}>
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button onClick={() => setShow(false)} className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
        <div className="grid text-xs font-semibold px-5 py-3 border-b" style={{ gridTemplateColumns: '1fr 140px 100px 160px 32px', color: 'hsl(var(--foreground-muted))', borderColor: 'hsl(var(--border))' }}>
          <span>User</span><span>Role</span><span>Status</span><span>Last login</span><span />
        </div>
        {filtered.length === 0 && (
          <p className="px-5 py-6 text-sm text-center" style={{ color: 'hsl(var(--foreground-muted))' }}>No users found</p>
        )}
        {filtered.map(u => {
          const badge = ROLE_BADGE[u.role] ?? ROLE_BADGE.student;
          return (
            <Link key={u.id} href={`/admin/users/${u.id}`}
              className="grid items-center px-5 py-3 border-b transition-colors hover:bg-white/5"
              style={{ gridTemplateColumns: '1fr 140px 100px 160px 32px', borderColor: 'hsl(var(--border))' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{u.display_name ?? '—'}</p>
                <p className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>{u.email}</p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                style={{ background: badge.bg, color: badge.color }}>
                {u.role.replace('_', ' ')}
              </span>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: u.is_active ? '#10b981' : '#ef4444' }}>
                <Circle className="w-2 h-2 fill-current" />
                {u.is_active ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>
                {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
              </span>
              <ChevronRight className="w-4 h-4 justify-self-end" style={{ color: 'hsl(var(--foreground-subtle))' }} />
            </Link>
          );
        })}
      </div>
      <p className="text-xs mt-3" style={{ color: 'hsl(var(--foreground-subtle))' }}>{filtered.length} of {users.length} users</p>
    </div>
  );
}
