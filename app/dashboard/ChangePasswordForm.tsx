'use client';
import { useState } from 'react';
import { Check, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';

export function ChangePasswordForm() {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext]       = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow]       = useState(false);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const reset = () => { setCurrent(''); setNext(''); setConfirm(''); setError(''); };

  const handleSave = async () => {
    setError('');
    if (next !== confirm) { setError('New passwords do not match.'); return; }
    if (next.length < 8) { setError('New password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: current, new_password: next }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to update password.'); return; }
      setSaved(true); setEditing(false); reset();
      setTimeout(() => setSaved(false), 3000);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  if (!editing) return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <span className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>Password</span>
      <div className="flex items-center gap-3">
        {saved && (
          <span className="text-xs inline-flex items-center gap-1 font-medium" style={{ color: '#22c55e' }}>
            <Check className="w-3 h-3" /> Updated
          </span>
        )}
        <button onClick={() => setEditing(true)} className="btn-ghost py-1.5 px-3 text-xs">
          <KeyRound className="w-3 h-3" /> Change password
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3 max-w-sm">
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)}
          placeholder="Current password" autoComplete="current-password" className="input-base pr-12" />
      </div>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={next} onChange={e => setNext(e.target.value)}
          placeholder="New password (min. 8 characters)" autoComplete="new-password" className="input-base pr-12" />
      </div>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)}
          placeholder="Confirm new password" autoComplete="new-password" className="input-base pr-12" />
        <button type="button" onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--foreground-subtle))' }}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={loading || !current || !next || !confirm}
          className="btn-primary py-2 px-4 text-xs disabled:opacity-60">
          {loading ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : <><Check className="w-3 h-3" /> Update password</>}
        </button>
        <button onClick={() => { setEditing(false); reset(); }}
          className="text-xs font-medium transition-colors hover:text-[hsl(var(--foreground))]"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
