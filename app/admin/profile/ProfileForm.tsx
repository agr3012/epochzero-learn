'use client';

import { useState } from 'react';
import { Save, Lock } from 'lucide-react';

export function ProfileForm({ email, displayName }: { email: string; displayName: string | null }) {
  const [name, setName] = useState(displayName ?? '');
  const [currPw, setCurrPw] = useState('');
  const [newPw, setNewPw]   = useState('');
  const [msg, setMsg]       = useState('');
  const [err, setErr]       = useState('');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) { setErr('Name is required'); return; }
    setSaving(true); setMsg(''); setErr('');
    const body: Record<string, string> = { display_name: name };
    if (newPw) { body.new_password = newPw; body.current_password = currPw; }
    const res = await fetch('/api/admin/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error ?? 'Something went wrong'); return; }
    setMsg('Profile updated!'); setCurrPw(''); setNewPw('');
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 transition-all';
  const inputStyle = { background: 'hsl(var(--surface-elevated))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' };

  return (
    <div className="rounded-xl border p-6 space-y-5" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'hsl(var(--foreground-muted))' }}>Email</label>
        <div className="px-3 py-2 rounded-lg border text-sm" style={{ ...inputStyle, opacity: 0.6 }}>{email}</div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: 'hsl(var(--foreground-muted))' }}>Display Name</label>
        <input className={inputCls} style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
      </div>

      <div className="border-t pt-5" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-3.5 h-3.5" style={{ color: 'hsl(var(--foreground-muted))' }} />
          <span className="text-xs font-semibold" style={{ color: 'hsl(var(--foreground-muted))' }}>Change Password (optional)</span>
        </div>
        <div className="space-y-3">
          <input type="password" className={inputCls} style={inputStyle} value={currPw} onChange={e => setCurrPw(e.target.value)} placeholder="Current password" />
          <input type="password" className={inputCls} style={inputStyle} value={newPw}  onChange={e => setNewPw(e.target.value)}  placeholder="New password (min 8 chars)" />
        </div>
      </div>

      {err && <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{err}</p>}
      {msg && <p className="text-xs font-medium" style={{ color: '#10b981' }}>{msg}</p>}

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ background: 'hsl(var(--primary))' }}>
        <Save className="w-4 h-4" />
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
}
