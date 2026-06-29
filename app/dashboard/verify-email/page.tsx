// app/dashboard/verify-email/page.tsx
'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';

function VerifyBody() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const email = params.get('email') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!token || !email) { setStatus('error'); setError('Invalid or expired verification link.'); return; }
    fetch('/api/auth/verify-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) { setStatus('error'); setError(data.error ?? 'Verification failed.'); return; }
        setStatus('success');
      })
      .catch(() => { setStatus('error'); setError('Network error. Please try again.'); });
  }, [token, email]);

  if (status === 'loading') return (
    <div className="text-center">
      <Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin" style={{ color: 'hsl(var(--primary))' }} />
      <p style={{ color: 'hsl(var(--foreground-muted))' }}>Verifying your email...</p>
    </div>
  );
  if (status === 'error') return (
    <div className="text-center">
      <AlertCircle className="w-10 h-10 mx-auto mb-4" style={{ color: '#ef4444' }} />
      <p className="mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>{error}</p>
      <Link href="/dashboard" className="btn-primary inline-flex">Go to dashboard</Link>
    </div>
  );
  return (
    <div className="text-center">
      <CheckCircle className="w-10 h-10 mx-auto mb-4" style={{ color: '#22c55e' }} />
      <p className="mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>Your email is verified.</p>
      <Link href="/dashboard" className="btn-primary inline-flex">Go to dashboard</Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-bold mb-1 flex items-center gap-2" style={{ color: 'hsl(var(--foreground))' }}>
          <ShieldCheck className="w-5 h-5" style={{ color: 'hsl(var(--primary))' }} /> Email verification
        </h1>
        <div className="card p-8 rounded-2xl mt-6">
          <Suspense fallback={<p className="text-sm text-center" style={{ color: 'hsl(var(--foreground-muted))' }}>Loading...</p>}>
            <VerifyBody />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
