'use client';

import { useState } from 'react';
import { User, Check, Loader2, Pencil } from 'lucide-react';

interface Props {
  accountId: string;
  currentName: string | null;
  email: string;
}

export function ProfileNameForm({ accountId, currentName, email }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName ?? '');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: name.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? 'Failed to save.');
        return;
      }
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold-500/40 bg-navy-800 flex items-center justify-center font-mono text-xl text-gold-500 font-bold">
            {currentName ? currentName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-mono text-base text-bone-50">
              {currentName ?? <span className="text-bone-400 italic">Name not set</span>}
            </div>
            <div className="font-mono text-xs text-bone-400 mt-0.5">{email}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="font-mono text-xs text-green-400 inline-flex items-center gap-1">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-bone-400 hover:text-gold-500 border border-navy-700 hover:border-gold-500/40 px-3 py-1.5 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            {currentName ? 'Edit name' : 'Set name'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 border-2 border-gold-500/40 bg-navy-800 flex items-center justify-center font-mono text-xl text-gold-500 font-bold shrink-0">
        <User className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-3">
        <div>
          <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-2">
            Display name
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Ashish Revar"
            autoFocus
            className="w-full max-w-sm bg-navy-950 border border-navy-700 focus:border-gold-500 px-4 py-2.5 font-mono text-sm text-bone-100 placeholder-bone-500 outline-none transition-colors"
          />
          {error && <p className="font-mono text-xs text-red-400 mt-1">{error}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="btn-primary py-2 text-xs disabled:opacity-60"
          >
            {loading
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>
              : <><Check className="w-3 h-3" /> Save name</>
            }
          </button>
          <button
            onClick={() => { setEditing(false); setName(currentName ?? ''); }}
            className="font-mono text-xs text-bone-400 hover:text-bone-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
