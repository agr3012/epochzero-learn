// components/dashboard/ProfileNameForm.tsx (or app/dashboard/ProfileNameForm.tsx)
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, Pencil } from 'lucide-react';

interface Props { accountId: string; currentName: string | null; email: string }

export function ProfileNameForm({ accountId, currentName, email }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(currentName ?? '');
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: name.trim() }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to save.'); return; }
      setSaved(true); setEditing(false);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    } catch { setError('Network error.'); }
    finally   { setLoading(false); }
  };

  if (!editing) return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center font-display text-base font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #8B5E1A 0%, #1B5FA8 100%)' }}>
          {currentName ? currentName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-sans text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            {currentName ?? <span style={{ color: 'hsl(var(--foreground-subtle))', fontStyle: 'italic' }}>Name not set</span>}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--foreground-subtle))' }}>{email}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {saved && (
          <span className="text-xs inline-flex items-center gap-1 font-medium" style={{ color: '#22c55e' }}>
            <Check className="w-3 h-3" /> Saved
          </span>
        )}
        <button onClick={() => setEditing(true)} className="btn-ghost py-1.5 px-3 text-xs">
          <Pencil className="w-3 h-3" /> {currentName ? 'Edit name' : 'Set name'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <div>
        <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
          style={{ color: 'hsl(var(--foreground-muted))' }}>Display name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Ashish Revar" autoFocus
          className="input-base max-w-sm" />
        {error && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{error}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={loading || !name.trim()}
          className="btn-primary py-2 px-4 text-xs disabled:opacity-60">
          {loading ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : <><Check className="w-3 h-3" /> Save name</>}
        </button>
        <button onClick={() => { setEditing(false); setName(currentName ?? ''); }}
          className="text-xs font-medium transition-colors hover:text-[hsl(var(--foreground))]"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
