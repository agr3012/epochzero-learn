'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';

type Batch = { id: string; enrollment_code: string; batch_label: string; courses: { title: string } | null };

export function AddStudentForm({ batches }: { batches: Batch[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', display_name: '', password: '', role: 'student', batch_id: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email || !form.display_name || !form.password) { setErr('Email, name and password are required'); return; }
    setSaving(true); setErr('');

    // Create user
    const res  = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, display_name: form.display_name, password: form.password, role: form.role }) });
    const data = await res.json();
    if (!res.ok) { setSaving(false); setErr(data.error ?? 'Failed to create'); return; }

    // Optionally enroll in batch
    if (form.batch_id) {
      await fetch(`/api/admin/users/${data.user.id}/batches`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ batch_id: form.batch_id }) });
    }

    router.push(`/admin/users/${data.user.id}`);
  }

  const inp = 'w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] transition-all';
  const inpStyle = { background: 'hsl(var(--surface-elevated))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' };
  const label = (t: string) => <label className="block text-xs font-semibold mb-1.5" style={{ color: 'hsl(var(--foreground-muted))' }}>{t}</label>;

  return (
    <form onSubmit={submit} className="rounded-xl border p-6 space-y-4" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
      <div>{label('Full Name')}
        <input className={inp} style={inpStyle} placeholder="e.g. Rahul Sharma" value={form.display_name} onChange={e => set('display_name', e.target.value)} />
      </div>
      <div>{label('Email')}
        <input type="email" className={inp} style={inpStyle} placeholder="student@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
      </div>
      <div>{label('Password')}
        <input type="password" className={inp} style={inpStyle} placeholder="Min 8 characters" value={form.password} onChange={e => set('password', e.target.value)} />
      </div>
      <div>{label('Role')}
        <select className={inp} style={inpStyle} value={form.role} onChange={e => set('role', e.target.value)}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {batches.length > 0 && (
        <div>
          {label('Enroll in Batch (optional)')}
          <select className={inp} style={inpStyle} value={form.batch_id} onChange={e => set('batch_id', e.target.value)}>
            <option value="">— Skip enrollment —</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.batch_label} · {b.courses?.title} ({b.enrollment_code})</option>
            ))}
          </select>
        </div>
      )}

      {err && <p className="text-xs" style={{ color: '#ef4444' }}>{err}</p>}

      <button type="submit" disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
        style={{ background: 'hsl(var(--primary))' }}>
        <UserPlus className="w-4 h-4" />
        {saving ? 'Creating…' : 'Create Student'}
      </button>
    </form>
  );
}
