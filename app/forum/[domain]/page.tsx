// app/forum/[domain]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  MessageSquare, Pin, Lock, ChevronRight,
  Plus, X, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';

const DOMAIN_META: Record<string, { label: string; color: string }> = {
  rema:   { label: 'REMA — Reverse Engineering & Malware Analysis', color: 'text-gold-500'   },
  cloud:  { label: 'Cloud — Cloud Security',                        color: 'text-blue-400'   },
  crypto: { label: 'Cryptography',                                  color: 'text-purple-400' },
  webdev: { label: 'Web Development',                               color: 'text-green-400'  },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

type Thread = {
  id: string; title: string; body: string; author_name: string;
  is_pinned: boolean; is_locked: boolean;
  reply_count: number; view_count: number; created_at: string;
};

export default function ForumDomainPage() {
  const params  = useParams();
  const router  = useRouter();
  const domain  = params?.domain as string;
  const meta    = DOMAIN_META[domain];

  const [threads,   setThreads]   = useState<Thread[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForm,  setShowForm]  = useState(false);

  // form state
  const [title,     setTitle]     = useState('');
  const [body,      setBody]      = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback,  setFeedback]  = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (!meta) return;
    // check session
    fetch('/api/auth/me').then(r => r.ok && setIsLoggedIn(true)).catch(() => {});
    // load threads
    fetch(`/api/forum/threads?domain=${domain}`)
      .then(r => r.json())
      .then(data => { setThreads(data.threads ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [domain]);

  if (!meta) {
    return <div className="container py-20 font-mono text-bone-400">Invalid domain.</div>;
  }

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
        // refresh thread list
        if (data.status === 'published') {
          setThreads(prev => [{
            id: data.id, title: title.trim(), body: body.trim(),
            author_name: 'You', is_pinned: false, is_locked: false,
            reply_count: 0, view_count: 0, created_at: new Date().toISOString(),
          }, ...prev]);
        }
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen">

      {/* breadcrumb + header */}
      <section className="border-b border-navy-700 bg-navy-950">
        <div className="container py-10">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-400 mb-4">
            <Link href="/forum" className="hover:text-gold-500 transition-colors">Forum</Link>
            <ChevronRight className="w-3 h-3" />
            <span className={meta.color}>{domain.toUpperCase()}</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className={`font-mono text-3xl font-bold text-bone-50 mb-1`}>{meta.label}</h1>
              <p className="font-mono text-sm text-bone-400">{threads.length} thread{threads.length !== 1 ? 's' : ''}</p>
            </div>
            {isLoggedIn ? (
              <button onClick={() => { setShowForm(s => !s); setFeedback(null); }}
                className="btn-primary flex items-center gap-2 font-mono text-sm">
                {showForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Thread</>}
              </button>
            ) : (
              <Link href="/dashboard/login" className="btn-ghost font-mono text-sm">
                Sign in to post
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="container py-10">

        {/* feedback banner */}
        {feedback && (
          <div className={`mb-6 flex items-start gap-3 p-4 border font-mono text-sm ${
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

        {/* new thread form */}
        {showForm && (
          <div className="mb-8 border border-gold-500/30 bg-navy-900 p-6">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">// New thread</div>
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
                  placeholder="Describe your question, share your findings, or start a discussion..."
                  className="w-full bg-navy-800 border border-navy-600 text-bone-100 font-mono text-sm px-4 py-3 focus:outline-none focus:border-gold-500/60 placeholder:text-bone-500 resize-y"
                />
                <div className="font-mono text-[10px] text-bone-500 text-right mt-1">{body.length}/5000</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !title.trim() || !body.trim()}
                  className="btn-primary flex items-center gap-2 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Reviewing...</>
                    : 'Post Thread'
                  }
                </button>
                <span className="font-mono text-[10px] text-bone-400">Posts are reviewed before publishing</span>
              </div>
            </div>
          </div>
        )}

        {/* thread list */}
        {loading ? (
          <div className="flex items-center gap-3 py-20 justify-center font-mono text-sm text-bone-400">
            <Loader2 className="w-5 h-5 animate-spin text-gold-500" /> Loading threads...
          </div>
        ) : threads.length === 0 ? (
          <div className="border border-dashed border-navy-700 p-16 text-center">
            <MessageSquare className="w-10 h-10 text-gold-500/20 mx-auto mb-4" />
            <p className="font-mono text-sm text-bone-400 mb-2">No threads yet in this domain.</p>
            {isLoggedIn
              ? <button onClick={() => setShowForm(true)} className="font-mono text-xs text-gold-500 hover:text-gold-400 transition-colors">Start the first discussion →</button>
              : <Link href="/dashboard/login" className="font-mono text-xs text-gold-500 hover:text-gold-400 transition-colors">Sign in to start the first discussion →</Link>
            }
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map(t => (
              <Link key={t.id} href={`/forum/${domain}/${t.id}`}
                className="block border border-navy-700 hover:border-gold-500/40 p-5 transition-colors group">
                <div className="grid lg:grid-cols-[1fr_auto] gap-4 items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {t.is_pinned && (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border border-gold-500/40 text-gold-500">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                      {t.is_locked && (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border border-bone-600/40 text-bone-500">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </div>
                    <h3 className="font-mono text-base font-bold text-bone-50 group-hover:text-gold-500 transition-colors leading-snug mb-1">
                      {t.title}
                    </h3>
                    <p className="font-serif text-sm text-bone-300 line-clamp-2 leading-relaxed">{t.body}</p>
                  </div>
                  <div className="flex lg:flex-col items-center lg:items-end gap-4 lg:gap-2 font-mono text-xs text-bone-400 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" /> {t.reply_count}
                    </span>
                    <span>{t.author_name}</span>
                    <span>{timeAgo(t.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
