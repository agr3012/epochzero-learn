'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2, AlertCircle, Plus, Copy, Check } from 'lucide-react';

type Course = { id: string; title: string; slug: string };
type Batch = {
  id: string;
  enrollment_code: string;
  batch_label: string;
  semester: 'odd' | 'even';
  year: number;
  is_active: boolean;
  created_at: string;
  courses: { title: string } | null;
};

export default function AdminBatchesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied]   = useState<string | null>(null);

  const [form, setForm] = useState({
    course_id: '', enrollment_code: '', batch_label: '', semester: 'odd' as 'odd' | 'even', year: new Date().getFullYear(),
  });

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/batches');
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to load.'); return; }
      setCourses(data.courses ?? []);
      setBatches(data.batches ?? []);
      if (!form.course_id && data.courses?.[0]) setForm(f => ({ ...f, course_id: data.courses[0].id }));
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!form.course_id || !form.enrollment_code.trim() || !form.batch_label.trim()) {
      setError('Fill in all fields.'); return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/admin/batches', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, enrollment_code: form.enrollment_code.trim().toUpperCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to create batch.'); return; }
      setForm(f => ({ ...f, enrollment_code: '', batch_label: '' }));
      await load();
    } catch { setError('Network error.'); }
    finally { setCreating(false); }
  };

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="container py-10 lg:py-14 max-w-3xl">
      <Link href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-7"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        <ChevronLeft className="w-4 h-4" /> Dashboard
      </Link>

      <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Batches & enrollment codes</h1>
      <p className="text-sm mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>
        Generate a code per cohort. Students enter it on their dashboard to join.
      </p>

      <form onSubmit={handleCreate} className="card p-6 rounded-xl mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Course</label>
            <select value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}
              className="input-base">
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Enrollment code</label>
            <input type="text" value={form.enrollment_code}
              onChange={e => setForm(f => ({ ...f, enrollment_code: e.target.value }))}
              placeholder="REMA-ODD2025" className="input-base uppercase" />
          </div>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Batch label</label>
            <input type="text" value={form.batch_label}
              onChange={e => setForm(f => ({ ...f, batch_label: e.target.value }))}
              placeholder="B.Tech CSE 5th Sem" className="input-base" />
          </div>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Semester</label>
            <select value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value as 'odd' | 'even' }))}
              className="input-base">
              <option value="odd">Odd</option>
              <option value="even">Even</option>
            </select>
          </div>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Year</label>
            <input type="number" value={form.year}
              onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}
              className="input-base" />
          </div>
        </div>
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
            style={{ background: 'rgba(199,62,58,0.08)', border: '1px solid rgba(199,62,58,0.30)', color: '#ef4444' }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
          </div>
        )}
        <button type="submit" disabled={creating} className="btn-primary disabled:opacity-60">
          {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Plus className="w-4 h-4" /> Create batch</>}
        </button>
      </form>

      <h2 className="font-display text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>Existing batches</h2>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : batches.length === 0 ? (
        <p className="text-sm" style={{ color: 'hsl(var(--foreground-subtle))' }}>No batches yet.</p>
      ) : (
        <div className="space-y-2">
          {batches.map(b => (
            <div key={b.id} className="card p-4 rounded-xl flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="font-sans text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  {b.batch_label} <span style={{ color: 'hsl(var(--foreground-subtle))' }}>· {b.courses?.title ?? 'Unknown course'}</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                  {b.semester} {b.year} {!b.is_active && '· inactive'}
                </div>
              </div>
              <button onClick={() => copyCode(b.enrollment_code)}
                className="btn-ghost py-1.5 px-3 text-xs shrink-0 font-mono">
                {copied === b.enrollment_code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {b.enrollment_code}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
