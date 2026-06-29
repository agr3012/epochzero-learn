'use client';
import { useState } from 'react';
import { MailWarning, Loader2, Check } from 'lucide-react';
import { SignOutButton } from './SignOutButton';

export function VerifyEmailGate({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleResend() {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/verify-email/resend', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to send.'); return; }
      setSent(true);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(var(--background))' }}>
      <div className="w-full max-w-sm text-center">
        <MailWarning className="w-10 h-10 mx-auto mb-4" style={{ color: '#E8A020' }} />
        <h1 className="font-display text-xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
          Verify your email
        </h1>
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--foreground-muted))' }}>
          We sent a verification link to <strong>{email}</strong>. Click it to unlock your dashboard.
        </p>
        {error && <p className="text-xs mb-3" style={{ color: '#ef4444' }}>{error}</p>}
        {sent ? (
          <p className="text-sm mb-4" style={{ color: '#22c55e' }}>Email sent — check your inbox (and spam folder).</p>
        ) : (
          <button onClick={handleResend} disabled={loading} className="btn-primary inline-flex disabled:opacity-60 mb-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Resend verification email
          </button>
        )}
        <div>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
