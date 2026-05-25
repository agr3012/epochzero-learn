// app/forum/[domain]/[threadId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MessageSquare, ChevronRight, Lock, Pin,
  Loader2, AlertCircle, CheckCircle2, Send,
} from 'lucide-react';

const DOMAIN_META: Record<string, { label: string; color: string }> = {
  rema:   { label: 'REMA',   color: 'text-gold-500'   },
  cloud:  { label: 'Cloud',  color: 'text-blue-400'   },
  crypto: { label: 'Crypto', color: 'text-purple-400' },
  webdev: { label: 'WebDev', color: 'text-green-400'  },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

type Reply = {
  id: string; body: string; author_name: string; created_at: string;
};

type Thread = {
  id: string; title: string; body: string; author_name: string;
  is_pinned: boolean; is_locked: boolean;
  reply_count: number; view_count: number; created_at: string; domain: string;
};

export default function ThreadPage() {
  const params   = useParams();
  const domain   = params?.domain as string;
  const threadId = params?.threadId as string;
  const meta     = DOMAIN_META[domain];

  const [thread,     setThread]     = useState<Thread | null>(null);
  const [replies,    setReplies]    = useState<Reply[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [replyBody,   setReplyBody]   = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [feedback,    setFeedback]    = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok && setIsLoggedIn(true)).catch(() => {});
    fetch(`/api/forum/thread?id=${threadId}`)
      .then(r => { if (!r.ok) setNotFound(true); return r.json(); })
      .then(data => {
        if (data.thread) setThread(data.thread);
        if (data.replies) setReplies(data.replies);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [threadId]);

  async function handleReply() {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/forum/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, body: replyBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', msg: data.error ?? 'Something went wrong.' });
      } else {
        setFeedback({ type: 'success', msg: data.message });
        setReplyBody('');
        if (data.status === 'published') {
          setReplies(prev => [...prev, {
            id: data.id, body: replyBody.trim(),
            author_name: 'You', created_at: new Date().toISOString(),
          }]);
          setThread(t => t ? { ...t, reply_count: t.reply_count + 1 } : t);
        }
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container py-24 flex items-center justify-center gap-3 font-mono text-sm text-bone-400">
        <Loader2 className="w-5 h-5 animate-spin text-gold-500" /> Loading thread...
      </div>
    );
  }

  if (notFound || !thread) {
    return (
      <div className="container py-24 text-center">
        <p className="font-mono text-bone-400 mb-4">Thread not found or has been removed.</p>
        <Link href={`/forum/${domain}`} className="font-mono text-xs text-gold-500 hover:text-gold-400">← Back to forum</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      {/* breadcrumb */}
      <section className="border-b border-navy-700 bg-navy-950">
        <div className="container py-8">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-400 mb-5">
            <Link href="/forum" className="hover:text-gold-500 transition-colors">Forum</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/forum/${domain}`} className={`hover:text-gold-500 transition-colors ${meta?.color}`}>
              {domain.toUpperCase()}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-bone-300 truncate max-w-[240px]">{thread.title}</span>
          </div>

          {/* Thread header */}
          <div className="flex items-start gap-3 flex-wrap mb-3">
            {thread.is_pinned && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border border-gold-500/40 text-gold-500">
                <Pin className="w-2.5 h-2.5" /> Pinned
              </span>
            )}
            {thread.is_locked && (
              <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 border border-bone-600/40 text-bone-500">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            )}
          </div>
          <h1 className="font-mono text-2xl lg:text-3xl font-bold text-bone-50 leading-snug">
            {thread.title}
          </h1>
          <div className="font-mono text-xs text-bone-400 mt-3 flex items-center gap-3 flex-wrap">
            <span>Posted by <span className="text-bone-200">{thread.author_name}</span></span>
            <span>·</span>
            <span>{timeAgo(thread.created_at)}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}</span>
          </div>
        </div>
      </section>

      <div className="container py-10 max-w-4xl">

        {/* Original post */}
        <div className="border border-gold-500/30 bg-navy-900 p-6 lg:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border border-gold-500/40 bg-navy-800 flex items-center justify-center font-mono text-xs font-bold text-gold-500">
              {thread.author_name.charAt(0).toUpperCase()}
            </div>
            <span className="font-mono text-sm text-bone-200">{thread.author_name}</span>
            <span className="font-mono text-xs text-bone-400 ml-auto">{timeAgo(thread.created_at)}</span>
          </div>
          <div className="font-serif text-bone-100 leading-relaxed whitespace-pre-wrap">{thread.body}</div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mb-8 space-y-4">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
              // {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </div>
            {replies.map((r, i) => (
              <div key={r.id} className="border border-navy-700 p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 border border-navy-600 bg-navy-800 flex items-center justify-center font-mono text-[10px] font-bold text-bone-300">
                    {r.author_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-mono text-sm text-bone-200">{r.author_name}</span>
                  <span className="font-mono text-xs text-bone-500 ml-auto">#{i + 1} · {timeAgo(r.created_at)}</span>
                </div>
                <div className="font-serif text-bone-200 leading-relaxed whitespace-pre-wrap">{r.body}</div>
              </div>
            ))}
          </div>
        )}

        {/* Reply box */}
        {thread.is_locked ? (
          <div className="border border-navy-700 p-6 text-center font-mono text-sm text-bone-400 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> This thread is locked.
          </div>
        ) : isLoggedIn ? (
          <div className="border border-navy-700 bg-navy-900 p-6">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">// Your reply</div>

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

            <textarea
              ref={replyRef}
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              rows={5}
              maxLength={3000}
              placeholder="Write your reply..."
              className="w-full bg-navy-800 border border-navy-600 text-bone-100 font-mono text-sm px-4 py-3 focus:outline-none focus:border-gold-500/60 placeholder:text-bone-500 resize-y mb-3"
            />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-bone-500">{replyBody.length}/3000</span>
              <button
                onClick={handleReply}
                disabled={submitting || !replyBody.trim()}
                className="btn-primary flex items-center gap-2 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Reviewing...</>
                  : <><Send className="w-4 h-4" /> Post Reply</>
                }
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-navy-700 p-8 text-center">
            <p className="font-mono text-sm text-bone-400 mb-4">Sign in to post a reply.</p>
            <Link href="/dashboard/login" className="btn-primary font-mono text-sm inline-flex">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
