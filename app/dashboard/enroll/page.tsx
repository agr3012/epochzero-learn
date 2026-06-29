'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Loader2, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';

export default function EnrollPage() {
  const router = useRouter();
  const [code, setCode]       = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState<{ batch_label: string; course_title: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(null);
    if (!code.trim()) { setError('Enter an enrollment code.'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/enrollment/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Could not redeem this code.'); return; }
      setSuccess({ batch_label: data.batch_label, course_title: data.course_title });
      setCode('');
      router.refresh();
    } catch { setError('Network error. Please try again.'); }
    finally   { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="w-full max-w-sm">
        <Link href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          <ChevronLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Join a batch</h1>
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
            Enter the enrollment code shared by your instructor.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Enrollment code</label>
            <input type="text" value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="REMA-ODD2025" className="input-base uppercase" autoComplete="off" required />
          </div>
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
              style={{ background: 'rgba(199,62,58,0.08)', border: '1px solid rgba(199,62,58,0.30)', color: '#ef4444' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
              style={{ background: 'rgba(27,124,62,0.08)', border: '1px solid rgba(27,124,62,0.30)', color: '#22c55e' }}>
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              Joined <strong>{success.batch_label}</strong> — {success.course_title}.
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</> : <><GraduationCap className="w-4 h-4" /> Join batch</>}
          </button>
        </form>
      </div>
    </div>
  );
}
