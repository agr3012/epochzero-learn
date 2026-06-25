// app/dashboard/login/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Shield, Loader2, Eye, EyeOff, AlertCircle, GraduationCap } from 'lucide-react';

const LOGO = 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Login failed.'); return; }
      router.push('/dashboard'); router.refresh();
    } catch { setError('Network error. Please try again.'); }
    finally   { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ background: 'hsl(var(--background))' }}>

      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: '#101825', backgroundImage: 'linear-gradient(135deg, rgba(139,94,26,0.5) 0%, rgba(27,95,168,0.25) 55%, rgba(8,14,28,0.95) 100%)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <Image src={LOGO} alt="EpochZero Learn" width={40} height={40} className="rounded-xl" />
            <div>
              <div className="font-display font-bold text-white text-lg leading-none">EpochZero Learn</div>
              <div className="text-xs" style={{ color: 'rgba(207,215,226,0.6)' }}>Student Portal</div>
            </div>
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-4 leading-tight">
            Track your progress.<br />Earn real certificates.
          </h2>
          <p className="font-serif text-base leading-relaxed mb-10" style={{ color: 'rgba(207,215,226,0.75)' }}>
            Sign in with your RRU email to access your certificate history,
            test attempts, club applications, and forum activity.
          </p>
          <div className="space-y-3">
            {['Certificate download with unique verification URL', 'Full test attempt history', 'Club application status'].map(f => (
              <div key={f} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(207,215,226,0.8)' }}>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#E8A020' }} />
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs" style={{ color: 'rgba(207,215,226,0.35)' }}>
          SITAICS, Rashtriya Raksha University
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <Image src={LOGO} alt="EpochZero Learn" width={36} height={36} className="rounded-xl" />
            <span className="font-display font-bold text-lg" style={{ color: 'hsl(var(--foreground))' }}>EpochZero Learn</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Sign in</h1>
            <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>Use your RRU institutional email</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
                style={{ color: 'hsl(var(--foreground-muted))' }}>Email address</label>
              <input type="email" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@student.rru.ac.in"
                className="input-base" autoComplete="email" required />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-sans text-xs font-semibold uppercase tracking-wide"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>Password</label>
                <Link href="/dashboard/forgot-password"
                  className="text-xs font-medium hover:underline" style={{ color: 'hsl(var(--primary))' }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input-base pr-12" autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'hsl(var(--foreground-subtle))' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
                style={{ background: 'rgba(199,62,58,0.08)', border: '1px solid rgba(199,62,58,0.30)', color: '#ef4444' }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center disabled:opacity-60 mt-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <><Shield className="w-4 h-4" /> Sign in</>}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'hsl(var(--foreground-muted))' }}>
            No account?{' '}
            <Link href="/dashboard/register" className="font-semibold hover:underline" style={{ color: 'hsl(var(--primary))' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
