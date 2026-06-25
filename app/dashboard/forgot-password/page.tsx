// app/dashboard/forgot-password/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'done'|'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus('loading');
    try {
      await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      setStatus('done');
    } catch { setStatus('error'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="w-full max-w-sm">
        <Link href="/dashboard/login" className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors hover:text-[hsl(var(--foreground))]"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          &larr; Back to sign in
        </Link>
        <h1 className="font-display text-2xl font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Reset password</h1>
        <p className="text-sm mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>
          Enter your RRU email and we will send a reset link.
        </p>
        <div className="card p-8 rounded-2xl">
          {status === 'done' ? (
            <div className="text-center">
              <CheckCircle className="w-10 h-10 mx-auto mb-4" style={{ color: 'hsl(var(--primary))' }} />
              <p className="font-serif text-base mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>
                If an account exists for this email, a reset link has been sent.
              </p>
              <Link href="/dashboard/login" className="text-sm font-medium hover:underline" style={{ color: 'hsl(var(--primary))' }}>
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-sans text-xs font-semibold uppercase tracking-wide block mb-1.5"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@student.rru.ac.in" className="input-base" required />
              </div>
              {status === 'error' && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg text-sm"
                  style={{ background: 'rgba(199,62,58,0.08)', border: '1px solid rgba(199,62,58,0.30)', color: '#ef4444' }}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> Network error. Please try again.
                </div>
              )}
              <button type="submit" disabled={status === 'loading'} className="btn-primary w-full justify-center disabled:opacity-60">
                {status === 'loading' ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Mail className="w-4 h-4" /> Send reset link</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
