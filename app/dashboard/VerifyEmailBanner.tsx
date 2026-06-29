'use client';
import { useState } from 'react';
import { MailWarning, Loader2, Check, X } from 'lucide-react';

/**
 * Non-blocking reminder — NOT an access gate. Email delivery to .ac.in
 * institutional addresses is unreliable (mail gateways at several
 * universities hard-bounce transactional senders with a 550, regardless
 * of domain auth being correctly configured) — hard-blocking the app on
 * verification would lock out real students over something neither they
 * nor we can fix. Verification stays available for whoever's email does
 * go through, but nothing in the app depends on it.
 */
export function VerifyEmailGate({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [dismissed, setDismissed] = useState(false);

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

  if (dismissed) return null;

  return (
    <div className="rounded-xl p-4 mb-8 flex items-center justify-between gap-4 flex-wrap"
      style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.30)' }}>
      <div className="flex items-center gap-3 min-w-0">
        <MailWarning className="w-4 h-4 shrink-0" style={{ color: '#E8A020' }} />
        <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
          {sent
            ? 'Verification email sent — check your inbox (and spam folder).'
            : <>Verify <strong>{email}</strong> if you'd like — this doesn't affect your access.</>}
          {error && <span style={{ color: '#ef4444' }}> {error}</span>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {!sent && (
          <button onClick={handleResend} disabled={loading} className="btn-ghost py-1.5 px-3 text-xs disabled:opacity-60">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Resend email
          </button>
        )}
        <button onClick={() => setDismissed(true)} aria-label="Dismiss"
          className="p-1.5 rounded-lg transition-colors" style={{ color: 'hsl(var(--foreground-subtle))' }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
