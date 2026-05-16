// app/dashboard/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    const domain = form.email.trim().toLowerCase().split('@')[1];
    if (!['student.rru.ac.in', 'rru.ac.in'].includes(domain)) {
      setError('Only RRU email addresses are accepted (@student.rru.ac.in or @rru.ac.in).'); return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Registration failed.'); return; }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-navy-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-2">
            // Student Portal
          </div>
          <h1 className="font-mono text-3xl font-bold text-bone-50 mb-2">Create account</h1>
          <p className="font-serif text-bone-300">RRU students only</p>
        </div>

        <div className="card-forensic p-8 border-navy-700">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-2">
                RRU Email address
              </label>
              <input type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="22bcs*****@student.rru.ac.in"
                className={inputCls} autoComplete="email" required />
            </div>

            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-2">
                Password <span className="text-bone-500">(min. 8 characters)</span>
              </label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`${inputCls} pr-12`} autoComplete="new-password" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bone-400 hover:text-bone-100 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-2">
                Confirm password
              </label>
              <input type="password" value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="••••••••"
                className={inputCls} autoComplete="new-password" required />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 border border-red-500/40 bg-red-500/5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="font-mono text-xs text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center disabled:opacity-60">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                : <><Shield className="w-4 h-4" /> Create account</>
              }
            </button>
          </form>

          <p className="font-mono text-xs text-bone-400 text-center mt-6">
            Already have an account?{' '}
            <Link href="/dashboard/login" className="text-gold-500 hover:text-gold-400 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-navy-950 border border-navy-700 focus:border-gold-500 px-4 py-3 font-mono text-sm text-bone-100 placeholder-bone-500 outline-none transition-colors';
