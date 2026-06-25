// app/dashboard/reset-password/page.tsx
'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

function ResetForm() {
  const router = useRouter(); const params = useSearchParams();
  const token = params.get('token') ?? ''; const email = params.get('email') ?? '';
  const [form, setForm]         = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [status, setStatus]     = useState<'idle'|'loading'|'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (form.password.length < 8)       { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setStatus('loading');
    try {
      const res  = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, email, password: form.password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Reset failed.'); setStatus('idle'); return; }
      setStatus('success');
      setTimeout(() => { router.push('/dashboard'); router.refresh(); }, 1500);
    } catch { setError('Network error. Please try again.'); setStatus('idle'); }
  };

  if (!token || !email) return (
    <div className="text-center"><AlertCircle className="w-10 h-10 mx-auto mb-4" style={{ color: '#ef4444' }} />
      <p style={{ color: 'hsl(var(--foreground-muted))' }}>Invalid or expired reset link.</p></div>
  );
  if (status === 'success') return (
    <div className="text-center"><CheckCircle className="w-10 h-10 mx-auto mb-4" style={{ color: '#22c55e' }} />
      <p style={{ color: 'hsl(var(--foreground-muted))' }}>Password updated. Redirecting...</p></div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'hsl(var(--foreground-muted))' }}>New password</label>
        <div className="relative">
          <input type={showPass ? 'text' : 'password'} value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder="••••••••" className="input-base pr-12" required />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--foreground-subtle))' }}>
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5" style={{ color: 'hsl(var(--foreground-muted))' }}>Confirm password</label>
        <input type="password" value={form.confirm}
          onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
          placeholder="••••••••" className="input-base" required />
      </div>
      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
          style={{ background: 'rgba(199,62,58,0.08)', border: '1px solid rgba(199,62,58,0.30)', color: '#ef4444' }}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
        </div>
      )}
      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full justify-center disabled:opacity-60">
        {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Shield className="w-4 h-4" /> Set new password</>}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Set new password</h1>
        <p className="text-sm mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>Choose a strong password for your account.</p>
        <div className="card p-8 rounded-2xl">
          <Suspense fallback={<p className="text-sm text-center" style={{ color: 'hsl(var(--foreground-muted))' }}>Loading...</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
