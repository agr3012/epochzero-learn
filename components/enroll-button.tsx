'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, GraduationCap } from 'lucide-react';

export function EnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleEnroll() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/enrollment/self', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to enroll.'); return; }
      router.refresh();
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <button onClick={handleEnroll} disabled={loading} className="btn-primary disabled:opacity-60">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
        Enroll in this course
      </button>
      {error && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}
