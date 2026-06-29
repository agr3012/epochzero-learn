'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2, AlertCircle, Award, GraduationCap } from 'lucide-react';

type Course = { id: string; title: string; slug: string };
type Cert = {
  id: string;
  email: string;
  student_name: string;
  cert_type: 'practical' | 'oral' | 'module' | 'overall';
  test_title: string;
  score: number | null;
  issued_at: string;
  cert_uid: string;
  courses: { title: string } | null;
};

const CERT_TYPE_LABEL: Record<Cert['cert_type'], string> = {
  practical: 'Practical', oral: 'Oral', module: 'Module', overall: 'Overall',
};

export default function AdminCertificatesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [certs, setCerts]     = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [issuing, setIssuing] = useState(false);

  const [form, setForm] = useState({
    email: '', course_id: '', cert_type: 'practical' as 'practical' | 'oral', score: '', notes: '',
  });

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin/certificates/issue');
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to load.'); return; }
      setCourses(data.courses ?? []);
      setCerts(data.certs ?? []);
      if (!form.course_id && data.courses?.[0]) setForm((f) => ({ ...f, course_id: data.courses[0].id }));
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!form.email.trim() || !form.course_id) { setError('Fill in email and course.'); return; }
    setIssuing(true);
    try {
      const res = await fetch('/api/admin/certificates/issue', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          course_id: form.course_id,
          cert_type: form.cert_type,
          score: form.score.trim() ? Number(form.score) : null,
          notes: form.notes.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to issue certificate.'); return; }
      setSuccess(`Issued ${data.cert_uid}.`);
      setForm((f) => ({ ...f, email: '', score: '', notes: '' }));
      await load();
    } catch { setError('Network error.'); }
    finally { setIssuing(false); }
  };

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <div className="container py-10 lg:py-14 max-w-3xl">
      <Link href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-7"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        <ChevronLeft className="w-4 h-4" /> Dashboard
      </Link>

      <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Issue practical/oral certificates</h1>
      <p className="text-sm mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>
        There's no MCQ test for these — mark a student as having passed in person.
        Module certificates auto-issue once every test in a unit is passed; the overall
        certification auto-issues once all six modules plus practical and oral exist.
      </p>

      <form onSubmit={handleIssue} className="card p-6 rounded-xl mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Student email</label>
            <input type="email" value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="student@example.com" className="input-base" />
          </div>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Course</label>
            <select value={form.course_id} onChange={(e) => setForm((f) => ({ ...f, course_id: e.target.value }))}
              className="input-base">
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Exam type</label>
            <select value={form.cert_type} onChange={(e) => setForm((f) => ({ ...f, cert_type: e.target.value as 'practical' | 'oral' }))}
              className="input-base">
              <option value="practical">Practical</option>
              <option value="oral">Oral</option>
            </select>
          </div>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Score <span style={{ color: 'hsl(var(--foreground-subtle))' }}>(optional)</span></label>
            <input type="number" min={0} max={100} value={form.score}
              onChange={(e) => setForm((f) => ({ ...f, score: e.target.value }))}
              placeholder="—" className="input-base" />
          </div>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Notes <span style={{ color: 'hsl(var(--foreground-subtle))' }}>(optional)</span></label>
            <input type="text" value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Examiner remarks" className="input-base" />
          </div>
        </div>
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
            style={{ background: 'rgba(199,62,58,0.08)', border: '1px solid rgba(199,62,58,0.30)', color: '#ef4444' }}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
          </div>
        )}
        {success && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
            style={{ background: 'rgba(27,124,62,0.10)', border: '1px solid rgba(27,124,62,0.30)', color: '#22c55e' }}>
            <Award className="w-4 h-4 shrink-0 mt-0.5" />{success}
          </div>
        )}
        <button type="submit" disabled={issuing} className="btn-primary disabled:opacity-60">
          {issuing ? <><Loader2 className="w-4 h-4 animate-spin" /> Issuing...</> : <><Award className="w-4 h-4" /> Issue certificate</>}
        </button>
      </form>

      <h2 className="font-display text-lg font-semibold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
        Recent module / practical / oral / overall certificates
      </h2>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" /></div>
      ) : certs.length === 0 ? (
        <p className="text-sm" style={{ color: 'hsl(var(--foreground-subtle))' }}>None issued yet.</p>
      ) : (
        <div className="space-y-2">
          {certs.map((c) => (
            <div key={c.id} className="card p-4 rounded-xl flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: c.cert_type === 'overall' ? '#6B3AD4' : '#8B5E1A' }}>
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-sans text-sm font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>
                  {c.student_name} <span style={{ color: 'hsl(var(--foreground-subtle))' }}>· {c.email}</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                  {CERT_TYPE_LABEL[c.cert_type]} · {c.test_title} · {fmtDate(c.issued_at)}
                </div>
              </div>
              <span className="font-mono text-xs shrink-0" style={{ color: 'hsl(var(--primary))' }}>{c.cert_uid}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
