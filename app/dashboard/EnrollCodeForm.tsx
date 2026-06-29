'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, GraduationCap } from 'lucide-react';

export function EnrollCodeForm({ startExpanded = false }: { startExpanded?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(startExpanded);
  const [code, setCode]       = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setError(''); setSuccess('');
    if (!code.trim()) { setError('Enter a code.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/enrollment/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Could not redeem this code.'); return; }
      setSuccess(`Joined ${data.batch_label} — ${data.course_title}.`);
      setCode('');
      router.refresh();
      setTimeout(() => { setSuccess(''); setEditing(false); }, 2500);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  if (!editing) return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <span className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>Course / batch code</span>
      <div className="flex items-center gap-3">
        {success && (
          <span className="text-xs inline-flex items-center gap-1 font-medium" style={{ color: '#22c55e' }}>
            <Check className="w-3 h-3" /> {success}
          </span>
        )}
        <button onClick={() => setEditing(true)} className="btn-ghost py-1.5 px-3 text-xs">
          <GraduationCap className="w-3 h-3" /> Add code
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 max-w-sm">
      <input type="text" value={code} onChange={e => setCode(e.target.value)}
        placeholder="REMA-ODD2025" autoFocus className="input-base uppercase" />
      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
      {success && <p className="text-xs" style={{ color: '#22c55e' }}>{success}</p>}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={loading || !code.trim()}
          className="btn-primary py-2 px-4 text-xs disabled:opacity-60">
          {loading ? <><Loader2 className="w-3 h-3 animate-spin" /> Joining...</> : <><Check className="w-3 h-3" /> Join batch</>}
        </button>
        <button onClick={() => { setEditing(false); setCode(''); setError(''); }}
          className="text-xs font-medium transition-colors hover:text-[hsl(var(--foreground))]"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
