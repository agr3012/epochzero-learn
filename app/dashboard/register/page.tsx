// app/dashboard/register/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Shield, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LOGO = 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]         = useState({ email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8)       { setError('Password must be at least 8 characters.'); return; }
    const domain = form.email.trim().toLowerCase().split('@')[1];
    if (!['student.rru.ac.in', 'rru.ac.in'].includes(domain)) {
      setError('Only RRU email addresses are accepted.'); return;
    }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, password: form.password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Registration failed.'); return; }
      router.push('/dashboard'); router.refresh();
    } catch { setError('Network error. Please try again.'); }
    finally   { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8">
          <Image src={LOGO} alt="EpochZero Learn" width={36} height={36} className="rounded-xl" />
          <span className="font-display font-bold text-lg" style={{ color: 'hsl(var(--foreground))' }}>EpochZero Learn</span>
        </div>
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Create account</h1>
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>RRU institutional email only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>RRU Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="you@student.rru.ac.in" className="input-base" autoComplete="email" required />
          </div>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Password <span style={{ color: 'hsl(var(--foreground-subtle))' }}>(min. 8 characters)</span></label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••" className="input-base pr-12" autoComplete="new-password" required />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
              style={{ color: 'hsl(var(--foreground-muted))' }}>Confirm password</label>
            <input type="password" value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
              placeholder="••••••••" className="input-base" autoComplete="new-password" required />
          </div>
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
              style={{ background: 'rgba(199,62,58,0.08)', border: '1px solid rgba(199,62,58,0.30)', color: '#ef4444' }}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><Shield className="w-4 h-4" /> Create account</>}
          </button>
        </form>
        <p className="text-sm text-center mt-6" style={{ color: 'hsl(var(--foreground-muted))' }}>
          Already have an account?{' '}
          <Link href="/dashboard/login" className="font-semibold hover:underline" style={{ color: 'hsl(var(--primary))' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
