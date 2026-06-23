// app/forum/[domain]/[threadId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { MessageSquare, ChevronRight, Lock, Pin, Loader2, AlertCircle, CheckCircle2, Send } from 'lucide-react';

const DOMAIN_META: Record<string, { label: string; color: string }> = {
  rema:   { label: 'REMA',   color: '#8B5E1A' },
  cloud:  { label: 'Cloud',  color: '#1B5FA8' },
  crypto: { label: 'Crypto', color: '#6B3AD4' },
  webdev: { label: 'WebDev', color: '#1B7C3E' },
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

type Reply  = { id: string; body: string; author_name: string; created_at: string };
type Thread = { id: string; title: string; body: string; author_name: string;
  is_pinned: boolean; is_locked: boolean; reply_count: number; view_count: number;
  created_at: string; domain: string };

export default function ThreadPage() {
  const params    = useParams();
  const domain    = params?.domain as string;
  const threadId  = params?.threadId as string;
  const meta      = DOMAIN_META[domain];

  const [thread,     setThread]     = useState<Thread | null>(null);
  const [replies,    setReplies]    = useState<Reply[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [replyBody,  setReplyBody]  = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback,   setFeedback]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok && setIsLoggedIn(true)).catch(() => {});
    fetch(`/api/forum/thread?id=${threadId}`)
      .then(r => { if (!r.ok) setNotFound(true); return r.json(); })
      .then(data => {
        if (data.thread)  setThread(data.thread);
        if (data.replies) setReplies(data.replies);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [threadId]);

  async function handleReply() {
    if (!replyBody.trim()) return;
    setSubmitting(true); setFeedback(null);
    try {
      const res  = await fetch('/api/forum/reply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, body: replyBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', msg: data.error ?? 'Something went wrong.' });
      } else {
        setFeedback({ type: 'success', msg: data.message });
        setReplyBody('');
        if (data.status === 'published') {
          setReplies(prev => [...prev, { id: data.id, body: replyBody.trim(), author_name: 'You', created_at: new Date().toISOString() }]);
          setThread(t => t ? { ...t, reply_count: t.reply_count + 1 } : t);
        }
      }
    } catch { setFeedback({ type: 'error', msg: 'Network error. Please try again.' });
    } finally { setSubmitting(false); }
  }

  if (loading) return (
    <div className="container py-24 flex items-center justify-center gap-3 text-sm"
      style={{ color: 'hsl(var(--foreground-muted))' }}>
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'hsl(var(--primary))' }} /> Loading thread...
    </div>
  );

  if (notFound || !thread) return (
    <div className="container py-24 text-center">
      <p className="mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>Thread not found or has been removed.</p>
      <Link href={`/forum/${domain}`} className="text-sm font-medium" style={{ color: 'hsl(var(--primary))' }}>
        ← Back to forum
      </Link>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Header ── */}
      <section style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-5"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            <Link href="/forum" className="hover:text-[hsl(var(--foreground))] transition-colors">Forum</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/forum/${domain}`} className="hover:text-[hsl(var(--foreground))] transition-colors font-medium"
              style={{ color: meta?.color }}>
              {domain.toUpperCase()}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="truncate max-w-[240px]" style={{ color: 'hsl(var(--foreground))' }}>
              {thread.title}
            </span>
          </nav>

          {/* Badges */}
          <div className="flex items-start gap-2 flex-wrap mb-3">
            {thread.is_pinned && (
              <span className="inline-flex items-center gap-1 font-sans text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{ background: `${meta?.color ?? '#8B5E1A'}18`, color: meta?.color ?? '#8B5E1A', border: `1px solid ${meta?.color ?? '#8B5E1A'}40` }}>
                <Pin className="w-2.5 h-2.5" /> Pinned
              </span>
            )}
            {thread.is_locked && (
              <span className="inline-flex items-center gap-1 font-sans text-xs font-medium px-2.5 py-0.5 rounded-full"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            )}
          </div>

          <h1 className="font-display text-2xl lg:text-3xl font-bold leading-snug mb-3"
            style={{ color: 'hsl(var(--foreground))' }}>
            {thread.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap text-sm"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            <span>Posted by <span style={{ color: 'hsl(var(--foreground))' }}>{thread.author_name}</span></span>
            <span>·</span>
            <span>{timeAgo(thread.created_at)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" /> {thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}
            </span>
          </div>
        </div>
      </section>

      <div className="container py-10 max-w-4xl">

        {/* ── Original post ── */}
        <div className="card p-6 lg:p-8 mb-6"
          style={{ borderLeft: `3px solid ${meta?.color ?? '#8B5E1A'}` }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm text-white"
              style={{ background: meta?.color ?? '#8B5E1A' }}>
              {thread.author_name.replace(/Mr\.|Ms\./, '').trim().charAt(0).toUpperCase()}
            </div>
            <span className="font-sans font-medium text-sm" style={{ color: 'hsl(var(--foreground))' }}>
              {thread.author_name}
            </span>
            <span className="text-xs ml-auto" style={{ color: 'hsl(var(--foreground-subtle))' }}>
              {timeAgo(thread.created_at)}
            </span>
          </div>
          <div className="font-serif leading-relaxed whitespace-pre-wrap"
            style={{ color: 'hsl(var(--foreground))' }}>
            {thread.body}
          </div>
        </div>

        {/* ── Replies ── */}
        {replies.length > 0 && (
          <div className="mb-6 space-y-3">
            <p className="eyebrow mb-4">{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</p>
            {replies.map((r, i) => (
              <div key={r.id} className="card p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'hsl(var(--border-strong))' }}>
                    {r.author_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-sans font-medium text-sm" style={{ color: 'hsl(var(--foreground))' }}>
                    {r.author_name}
                  </span>
                  <span className="text-xs ml-auto" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                    #{i + 1} · {timeAgo(r.created_at)}
                  </span>
                </div>
                <div className="font-serif text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  {r.body}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Reply box ── */}
        {thread.is_locked ? (
          <div className="card p-6 text-center flex items-center justify-center gap-2"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            <Lock className="w-4 h-4" /> This thread is locked.
          </div>
        ) : isLoggedIn ? (
          <div className="card p-6">
            <p className="eyebrow mb-4">Your reply</p>
            {feedback && (
              <div className={`mb-4 flex items-start gap-2 p-3 rounded-lg text-sm ${
                feedback.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {feedback.type === 'success'
                  ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  : <AlertCircle  className="w-4 h-4 shrink-0 mt-0.5" />}
                {feedback.msg}
              </div>
            )}
            <textarea ref={replyRef} value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              rows={5} maxLength={3000}
              placeholder="Write your reply..."
              className="input-base resize-y mb-3" />
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                {replyBody.length}/3000
              </span>
              <button onClick={handleReply}
                disabled={submitting || !replyBody.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Reviewing...</>
                  : <><Send className="w-4 h-4" /> Post Reply</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="text-sm mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>Sign in to post a reply.</p>
            <Link href="/dashboard/login" className="btn-primary inline-flex">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
