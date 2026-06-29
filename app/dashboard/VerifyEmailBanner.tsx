'use client';
import { useState } from 'react';
import { MailWarning, Loader2, Check } from 'lucide-react';

export function VerifyEmailBanner() {
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
    <div className="rounded-xl p-4 mb-8 flex items-center justify-between gap-4 flex-wrap"
      style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.30)' }}>
      <div className="flex items-center gap-3">
        <MailWarning className="w-4 h-4 shrink-0" style={{ color: '#E8A020' }} />
        <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
          {sent ? 'Verification email sent — check your inbox.' : 'Please verify your email address.'}
          {error && <span style={{ color: '#ef4444' }}> {error}</span>}
        </p>
      </div>
      {!sent && (
        <button onClick={handleResend} disabled={loading} className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-60">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Resend email
        </button>
      )}
    </div>
  );
}
