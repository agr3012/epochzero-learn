// app/dashboard/reset-password/page.tsx
'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Shield, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Reset failed.'); setStatus('idle'); return; }
      setStatus('success');
      setTimeout(() => { router.push('/dashboard'); router.refresh(); }, 1500);
    } catch {
      setError('Network error. Please try again.');
      setStatus('idle');
    }
  };

  if (!token || !email) return (
    <div className="text-center">
      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
      <p className="font-serif text-bone-200">Invalid or expired reset link.</p>
    </div>
  );

  if (status === 'success') return (
    <div className="text-center">
      <CheckCircle className="w-10 h-10 text-gold-500 mx-auto mb-4" />
      <p className="font-serif text-bone-200">Password updated. Redirecting to your dashboard...</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-2">New password</label>
        <div className="relative">
          <input type={showPass ? 'text' : 'password'} value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder="••••••••" required
            className="w-full bg-navy-950 border border-navy-700 focus:border-gold-500 px-4 py-3 pr-12 font-mono text-sm text-bone-100 placeholder-bone-500 outline-none transition-colors" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-bone-400 hover:text-bone-100 transition-colors">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-2">Confirm password</label>
        <input type="password" value={form.confirm}
          onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
          placeholder="••••••••" required
          className="w-full bg-navy-950 border border-navy-700 focus:border-gold-500 px-4 py-3 font-mono text-sm text-bone-100 placeholder-bone-500 outline-none transition-colors" />
      </div>
      {error && (
        <div className="flex items-center gap-2 p-3 border border-red-500/40 bg-red-500/5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="font-mono text-xs text-red-400">{error}</p>
        </div>
      )}
      <button type="submit" disabled={status === 'loading'}
        className="btn-primary w-full justify-center disabled:opacity-60">
        {status === 'loading'
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
          : <><Shield className="w-4 h-4" /> Set new password</>
        }
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-navy-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-2">// Student Portal</div>
          <h1 className="font-mono text-3xl font-bold text-bone-50 mb-2">Set new password</h1>
        </div>
        <div className="card-forensic p-8 border-navy-700">
          <Suspense fallback={<p className="font-mono text-sm text-bone-300 text-center">Loading...</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
