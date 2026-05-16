// app/dashboard/forgot-password/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'done'|'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus('done'); // always show success — don't reveal if email exists
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-navy-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-2">// Student Portal</div>
          <h1 className="font-mono text-3xl font-bold text-bone-50 mb-2">Reset password</h1>
        </div>
        <div className="card-forensic p-8 border-navy-700">
          {status === 'done' ? (
            <div className="text-center">
              <CheckCircle className="w-10 h-10 text-gold-500 mx-auto mb-4" />
              <p className="font-serif text-bone-200 mb-4">
                If an account exists for this email, a reset link has been sent. Check your inbox.
              </p>
              <Link href="/dashboard/login" className="font-mono text-xs text-gold-500 hover:text-gold-400 transition-colors">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="font-serif text-sm text-bone-300 leading-relaxed">
                Enter your RRU email address and we will send a password reset link.
              </p>
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-bone-300 block mb-2">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="22bcs*****@student.rru.ac.in"
                  className="w-full bg-navy-950 border border-navy-700 focus:border-gold-500 px-4 py-3 font-mono text-sm text-bone-100 placeholder-bone-500 outline-none transition-colors"
                  required />
              </div>
              {status === 'error' && (
                <div className="flex items-center gap-2 p-3 border border-red-500/40 bg-red-500/5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="font-mono text-xs text-red-400">Network error. Please try again.</p>
                </div>
              )}
              <button type="submit" disabled={status === 'loading'}
                className="btn-primary w-full justify-center disabled:opacity-60">
                {status === 'loading'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  : <><Mail className="w-4 h-4" /> Send reset link</>
                }
              </button>
              <p className="font-mono text-xs text-bone-400 text-center">
                <Link href="/dashboard/login" className="text-gold-500 hover:text-gold-400 transition-colors">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
