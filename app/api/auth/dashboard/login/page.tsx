// app/dashboard/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Login failed.'); return; }
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
          <h1 className="font-mono text-3xl font-bold text-bone-50 mb-2">Sign in</h1>
          <p className="font-serif text-bone-300">Use your RRU email address</p>
        </div>

        <div className="card-forensic p-8 border-navy-700">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-2">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="22bcs*****@student.rru.ac.in"
                className={inputCls}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`${inputCls} pr-12`}
                  autoComplete="current-password"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bone-400 hover:text-bone-100 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link href="/dashboard/forgot-password"
                  className="font-mono text-xs text-gold-500 hover:text-gold-400 transition-colors">
                  Forgot password?
                </Link>
              </div>
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
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                : <><Shield className="w-4 h-4" /> Sign in</>
              }
            </button>
          </form>

          <p className="font-mono text-xs text-bone-400 text-center mt-6">
            No account?{' '}
            <Link href="/dashboard/register" className="text-gold-500 hover:text-gold-400 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-navy-950 border border-navy-700 focus:border-gold-500 px-4 py-3 font-mono text-sm text-bone-100 placeholder-bone-500 outline-none transition-colors';
