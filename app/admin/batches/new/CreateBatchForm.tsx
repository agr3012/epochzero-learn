'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';

type Course = { id: string; title: string; slug: string };

export function CreateBatchForm({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    course_id: '', enrollment_code: '', batch_label: '',
    semester: 'odd', year: new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState('');

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.course_id || !form.enrollment_code || !form.batch_label) { setErr('All fields required'); return; }
    setSaving(true); setErr('');
    const res  = await fetch('/api/admin/batches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, year: Number(form.year) }) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error ?? 'Failed'); return; }
    router.push(`/admin/batches/${data.batch.id}`);
  }

  const inp = 'w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.4)] transition-all';
  const inpStyle = { background: 'hsl(var(--surface-elevated))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' };
  const label = (t: string) => <label className="block text-xs font-semibold mb-1.5" style={{ color: 'hsl(var(--foreground-muted))' }}>{t}</label>;

  return (
    <form onSubmit={submit} className="rounded-xl border p-6 space-y-4" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
      <div>{label('Course')}
        <select className={inp} style={inpStyle} value={form.course_id} onChange={e => set('course_id', e.target.value)}>
          <option value="">Select a course…</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
      <div>{label('Enrollment Code')}
        <input className={inp} style={inpStyle} placeholder="e.g. REMA-ODD2025" value={form.enrollment_code}
          onChange={e => set('enrollment_code', e.target.value.toUpperCase())} />
        <p className="text-[11px] mt-1" style={{ color: 'hsl(var(--foreground-subtle))' }}>Students enter this code to join. Make it unique and memorable.</p>
      </div>
      <div>{label('Batch Label')}
        <input className={inp} style={inpStyle} placeholder="e.g. B.Tech CSE Sem 5 — 2025" value={form.batch_label}
          onChange={e => set('batch_label', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>{label('Semester')}
          <select className={inp} style={inpStyle} value={form.semester} onChange={e => set('semester', e.target.value)}>
            <option value="odd">Odd</option>
            <option value="even">Even</option>
          </select>
        </div>
        <div>{label('Year')}
          <input type="number" className={inp} style={inpStyle} value={form.year} onChange={e => set('year', Number(e.target.value))} />
        </div>
      </div>
      {err && <p className="text-xs" style={{ color: '#ef4444' }}>{err}</p>}
      <button type="submit" disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
        style={{ background: 'hsl(var(--primary))' }}>
        <BookOpen className="w-4 h-4" />
        {saving ? 'Creating…' : 'Create Batch'}
      </button>
    </form>
  );
}
