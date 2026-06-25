// app/forum/[domain]/[threadId]/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  MessageSquare, ChevronLeft, Lock, Pin,
  Loader2, AlertCircle, CheckCircle2, Send, User,
} from 'lucide-react';

const DOMAIN_META: Record<string, { label: string; color: string }> = {
  rema:   { label: 'REMA',   color: '#8B5E1A' },
  cloud:  { label: 'Cloud',  color: '#1B5FA8' },
  crypto: { label: 'Crypto', color: '#6B3AD4' },
  webdev: { label: 'Web Dev',color: '#1B7C3E' },
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
type Thread = {
  id: string; title: string; body: string; author_name: string;
  is_pinned: boolean; is_locked: boolean;
  reply_count: number; view_count: number; created_at: string; domain: string;
};

function Avatar({ name, color, size = 'md' }: { name: string; color?: string; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-sm';
  return (
    <div className={`${s} rounded-lg flex items-center justify-center font-display font-bold text-white shrink-0`}
      style={{ background: color ?? 'hsl(var(--muted))', color: color ? 'white' : 'hsl(var(--foreground-muted))' }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

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
  const [replyBody,  setReplyBody]  = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback,   setFeedback]   = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
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
    } catch {
      setFeedback({ type: 'error', msg: 'Network error. Please try again.' });
    } finally { setSubmitting(false); }
  }

  if (loading) return (
    <div className="container py-24 flex items-center justify-center gap-3 text-sm"
      style={{ color: 'hsl(var(--foreground-muted))' }}>
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'hsl(var(--primary))' }} />
      Loading thread...
    </div>
  );

  if (notFound || !thread) return (
    <div className="container py-24 text-center">
      <p className="text-sm mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>
        Thread not found or has been removed.
      </p>
      <Link href={`/forum/${domain}`} className="btn-ghost">Back to forum</Link>
    </div>
  );

  const accentColor = meta?.color ?? 'hsl(var(--primary))';

  return (
    <div>
      {/* Header */}
      <section style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-5 flex-wrap"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            <Link href="/forum"
              className="hover:text-[hsl(var(--foreground))] transition-colors">Forum</Link>
            <span>/</span>
            <Link href={`/forum/${domain}`}
              className="font-semibold transition-colors hover:text-[hsl(var(--foreground))]"
              style={{ color: accentColor }}>
              {meta?.label ?? domain}
            </Link>
            <span>/</span>
            <span className="truncate max-w-[200px]">{thread.title}</span>
          </div>

          {/* Badges */}
          {(thread.is_pinned || thread.is_locked) && (
            <div className="flex gap-2 mb-3">
              {thread.is_pinned && <span className="badge badge-active text-[10px]"><Pin className="w-2.5 h-2.5" /> Pinned</span>}
              {thread.is_locked && <span className="badge badge-tag text-[10px]"><Lock className="w-2.5 h-2.5" /> Locked</span>}
            </div>
          )}

          <h1 className="font-display text-2xl lg:text-3xl font-bold leading-snug mb-3"
            style={{ color: 'hsl(var(--foreground))' }}>
            {thread.title}
          </h1>
          <div className="flex items-center gap-3 text-xs flex-wrap"
            style={{ color: 'hsl(var(--foreground-subtle))' }}>
            <span>Posted by <span style={{ color: 'hsl(var(--foreground-muted))' }}>{thread.author_name}</span></span>
            <span>·</span>
            <span>{timeAgo(thread.created_at)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {thread.reply_count} {thread.reply_count === 1 ? 'reply' : 'replies'}
            </span>
          </div>
        </div>
      </section>

      <div className="container py-8 max-w-4xl">

        {/* Original post */}
        <div className="card p-6 lg:p-8 mb-6"
          style={{ borderLeft: `4px solid ${accentColor}` }}>
          <div className="flex items-center gap-3 mb-5">
            <Avatar name={thread.author_name} color={accentColor} />
            <div>
              <div className="font-sans text-sm font-semibold"
                style={{ color: 'hsl(var(--foreground))' }}>{thread.author_name}</div>
              <div className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                {timeAgo(thread.created_at)}
              </div>
            </div>
          </div>
          <div className="font-serif text-base leading-[1.8] whitespace-pre-wrap"
            style={{ color: 'hsl(var(--foreground))' }}>
            {thread.body}
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="mb-6">
            <p className="eyebrow mb-4">
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </p>
            <div className="space-y-3">
              {replies.map((r, i) => (
                <div key={r.id} className="card p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar name={r.author_name} size="sm" />
                    <div className="flex-1">
                      <div className="font-sans text-sm font-medium"
                        style={{ color: 'hsl(var(--foreground))' }}>{r.author_name}</div>
                    </div>
                    <span className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      #{i + 1} · {timeAgo(r.created_at)}
                    </span>
                  </div>
                  <div className="font-serif text-sm leading-[1.8] whitespace-pre-wrap"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {r.body}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply section */}
        {thread.is_locked ? (
          <div className="card p-6 text-center flex items-center justify-center gap-2 text-sm"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            <Lock className="w-4 h-4" /> This thread is locked.
          </div>
        ) : isLoggedIn ? (
          <div className="card p-6">
            <p className="eyebrow mb-4">Your reply</p>

            {feedback && (
              <div className="mb-4 flex items-start gap-2.5 p-4 rounded-lg text-sm"
                style={{
                  background: feedback.type === 'success' ? 'rgba(27,124,62,0.08)' : 'rgba(199,62,58,0.08)',
                  border: `1px solid ${feedback.type === 'success' ? 'rgba(27,124,62,0.35)' : 'rgba(199,62,58,0.35)'}`,
                  color: feedback.type === 'success' ? '#22c55e' : '#ef4444',
                }}>
                {feedback.type === 'success'
                  ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  : <AlertCircle  className="w-4 h-4 shrink-0 mt-0.5" />}
                {feedback.msg}
              </div>
            )}

            <textarea
              ref={replyRef}
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              rows={5} maxLength={3000}
              placeholder="Write your reply..."
              className="input-base resize-y mb-3"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: 'hsl(var(--foreground-subtle))' }}>
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
            <User className="w-8 h-8 mx-auto mb-3" style={{ color: 'hsl(var(--foreground-subtle))' }} />
            <p className="text-sm mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>
              Sign in with your RRU email to post a reply.
            </p>
            <Link href="/dashboard/login" className="btn-primary inline-flex">Sign in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
