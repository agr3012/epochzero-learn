'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, Circle } from 'lucide-react';

type Batch = {
  id: string; enrollment_code: string; batch_label: string;
  semester: string; year: number; is_active: boolean; created_at: string;
  courses: { title: string; slug: string } | null;
};

type Course = { id: string; title: string; slug: string };

export function BatchesClient({ initialBatches, courses }: { initialBatches: Batch[]; courses: Course[] }) {
  const [batches, setBatches]   = useState(initialBatches);
  const [showCreate, setShow]   = useState(false);
  const [creating, setCreating] = useState(false);
  const [err, setErr]           = useState('');

  const [form, setForm] = useState({ course_id: '', enrollment_code: '', batch_label: '', semester: 'odd', year: new Date().getFullYear() });

  async function createBatch() {
    if (!form.course_id || !form.enrollment_code || !form.batch_label) { setErr('All fields required'); return; }
    setCreating(true); setErr('');
    const res  = await fetch('/api/admin/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, year: Number(form.year) }) });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) { setErr(data.error ?? 'Failed'); return; }
    setBatches(prev => [data.batch, ...prev]);
    setShow(false); setForm({ course_id: '', enrollment_code: '', batch_label: '', semester: 'odd', year: new Date().getFullYear() });
  }

  const inp = 'w-full px-3 py-2 rounded-lg border text-sm outline-none';
  const inpStyle = { background: 'hsl(var(--surface-elevated))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShow(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'hsl(var(--primary))' }}>
          <Plus className="w-4 h-4" /> Create Batch
        </button>
      </div>

      {showCreate && (
        <div className="rounded-xl border p-5 mb-4 space-y-3" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
          <p className="font-semibold text-sm" style={{ color: 'hsl(var(--foreground))' }}>New Batch</p>
          <div className="grid grid-cols-2 gap-3">
            <select className={inp} style={inpStyle} value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}>
              <option value="">Select course…</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input className={inp} style={inpStyle} placeholder="Enrollment code (e.g. REMA-ODD2025)" value={form.enrollment_code} onChange={e => setForm(f => ({ ...f, enrollment_code: e.target.value.toUpperCase() }))} />
            <input className={inp} style={inpStyle} placeholder="Batch label (e.g. B.Tech CS Sem 3)" value={form.batch_label} onChange={e => setForm(f => ({ ...f, batch_label: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <select className={inp} style={inpStyle} value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}>
                <option value="odd">Odd</option>
                <option value="even">Even</option>
              </select>
              <input type="number" className={inp} style={inpStyle} value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))} />
            </div>
          </div>
          {err && <p className="text-xs" style={{ color: '#ef4444' }}>{err}</p>}
          <div className="flex gap-2">
            <button onClick={createBatch} disabled={creating}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: 'hsl(var(--primary))' }}>
              {creating ? 'Creating…' : 'Create'}
            </button>
            <button onClick={() => setShow(false)} className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
        <div className="grid text-xs font-semibold px-5 py-3 border-b"
          style={{ gridTemplateColumns: '1fr 180px 160px 100px 32px', color: 'hsl(var(--foreground-muted))', borderColor: 'hsl(var(--border))' }}>
          <span>Batch</span><span>Course</span><span>Code</span><span>Status</span><span />
        </div>
        {batches.length === 0 && (
          <p className="px-5 py-6 text-sm text-center" style={{ color: 'hsl(var(--foreground-muted))' }}>No batches yet</p>
        )}
        {batches.map(b => (
          <Link key={b.id} href={`/admin/batches/${b.id}`}
            className="grid items-center px-5 py-3 border-b transition-colors hover:bg-white/5"
            style={{ gridTemplateColumns: '1fr 180px 160px 100px 32px', borderColor: 'hsl(var(--border))' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{b.batch_label}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>{b.semester} · {b.year}</p>
            </div>
            <span className="text-sm truncate" style={{ color: 'hsl(var(--foreground-muted))' }}>{b.courses?.title ?? '—'}</span>
            <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
              {b.enrollment_code}
            </span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: b.is_active ? '#10b981' : '#ef4444' }}>
              <Circle className="w-2 h-2 fill-current" />
              {b.is_active ? 'Active' : 'Inactive'}
            </span>
            <ChevronRight className="w-4 h-4 justify-self-end" style={{ color: 'hsl(var(--foreground-subtle))' }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
