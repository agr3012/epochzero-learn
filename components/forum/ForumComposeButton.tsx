'use client';

// components/forum/ForumComposeButton.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function ForumComposeButton({ domain }: { domain: string }) {
  const [isLoggedIn,  setIsLoggedIn]  = useState(false);
  const [checked,     setChecked]     = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [title,       setTitle]       = useState('');
  const [body,        setBody]        = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [feedback,    setFeedback]    = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (r.ok) setIsLoggedIn(true); })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  async function handleSubmit() {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/forum/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, title: title.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', msg: data.error ?? 'Something went wrong.' });
      } else {
        setFeedback({ type: 'success', msg: data.message });
        setTitle(''); setBody(''); setShowForm(false);
        // Reload to show new thread if published
        if (data.status === 'published') {
          setTimeout(() => window.location.reload(), 1000);
        }
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!checked) return null;

  if (!isLoggedIn) {
    return (
      <Link href="/dashboard/login"
        className="font-mono text-xs uppercase tracking-wider border border-navy-700 text-bone-300 hover:border-gold-500/60 hover:text-gold-500 px-4 py-2 transition-colors">
        Sign in to post
      </Link>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={() => { setShowForm(s => !s); setFeedback(null); }}
        className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider border border-gold-500/40 text-gold-500 hover:border-gold-500 hover:bg-gold-500/5 px-4 py-2 transition-colors">
        {showForm ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Plus className="w-3.5 h-3.5" /> New Thread</>}
      </button>

      {showForm && (
        <div className="mt-6 border border-gold-500/30 bg-navy-900 p-6">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-5">// New thread</div>

          {feedback && (
            <div className={`mb-4 flex items-start gap-2 p-3 border font-mono text-sm ${
              feedback.type === 'success'
                ? 'border-green-500/40 bg-green-500/5 text-green-400'
                : 'border-red-500/40 bg-red-500/5 text-red-400'
            }`}>
              {feedback.type === 'success'
                ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                : <AlertCircle  className="w-4 h-4 shrink-0 mt-0.5" />
              }
              {feedback.msg}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-bone-400 block mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={200}
                placeholder="What is your question or topic?"
                className="w-full bg-navy-800 border border-navy-600 text-bone-100 font-mono text-sm px-4 py-3 focus:outline-none focus:border-gold-500/60 placeholder:text-bone-500"
              />
              <div className="font-mono text-[10px] text-bone-500 text-right mt-1">{title.length}/200</div>
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-bone-400 block mb-2">Post *</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={6}
                maxLength={5000}
                placeholder="Describe your question, share findings, or start a discussion..."
                className="w-full bg-navy-800 border border-navy-600 text-bone-100 font-mono text-sm px-4 py-3 focus:outline-none focus:border-gold-500/60 placeholder:text-bone-500 resize-y"
              />
              <div className="font-mono text-[10px] text-bone-500 text-right mt-1">{body.length}/5000</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSubmit}
                disabled={submitting || !title.trim() || !body.trim()}
                className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider border border-gold-500/60 text-gold-500 hover:bg-gold-500/10 px-5 py-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reviewing...</>
                  : 'Post Thread'
                }
              </button>
              <span className="font-mono text-[10px] text-bone-500">Posts are screened before publishing</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
