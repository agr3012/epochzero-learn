// app/forum/[domain]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Pin, Lock, MessageSquare, ChevronLeft, Eye } from 'lucide-react';
import { ForumComposeButton } from '@/components/forum/ForumComposeButton';

export const revalidate = 60;

const DOMAIN_META: Record<string, { label: string; full: string; color: string }> = {
  rema:   { label: 'REMA',         full: 'Reverse Engineering & Malware Analysis', color: '#8B5E1A' },
  cloud:  { label: 'Cloud',        full: 'Cloud Security',                         color: '#1B5FA8' },
  crypto: { label: 'Cryptography', full: 'Cryptography',                           color: '#6B3AD4' },
  webdev: { label: 'Web Dev',      full: 'Full Stack Web Development',             color: '#1B7C3E' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export async function generateMetadata({ params }: { params: { domain: string } }) {
  const meta = DOMAIN_META[params.domain];
  if (!meta) return {};
  return { title: `${meta.label} Forum — EpochZero Learn` };
}

export default async function ForumDomainPage({ params }: { params: { domain: string } }) {
  const meta = DOMAIN_META[params.domain];
  if (!meta) notFound();

  const supabase = createClient();
  const { data: threads } = await supabase
    .from('forum_threads')
    .select('id, title, body, author_name, is_pinned, is_locked, reply_count, view_count, created_at')
    .eq('domain', params.domain).eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  const list = threads ?? [];

  return (
    <div>
      {/* Header */}
      <section style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-10">
          {/* Breadcrumb */}
          <Link href="/forum"
            className="inline-flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors
              hover:text-[hsl(var(--foreground))]"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            <ChevronLeft className="w-4 h-4" /> Forum
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-sans text-xs font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: `${meta.color}18`,
                    color: meta.color,
                    border: `1px solid ${meta.color}40`,
                  }}>
                  {meta.label}
                </span>
              </div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1"
                style={{ color: 'hsl(var(--foreground))' }}>
                {meta.full}
              </h1>
              <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
                {list.length} thread{list.length !== 1 ? 's' : ''}
              </p>
            </div>
            <ForumComposeButton domain={params.domain} />
          </div>
        </div>
      </section>

      <div className="container py-8">
        {list.length === 0 ? (
          <div className="card p-16 text-center">
            <MessageSquare className="w-10 h-10 mx-auto mb-4"
              style={{ color: 'hsl(var(--foreground-subtle))' }} />
            <p className="text-sm mb-3" style={{ color: 'hsl(var(--foreground-muted))' }}>
              No threads yet in this domain.
            </p>
            <Link href="/dashboard/login" className="btn-primary inline-flex">
              Sign in to start the first discussion
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map(t => (
              <Link key={t.id} href={`/forum/${params.domain}/${t.id}`}
                className="card card-interactive block p-5 group">
                <div className="grid lg:grid-cols-[1fr_180px] gap-4 items-center">
                  <div>
                    {/* Badges */}
                    {(t.is_pinned || t.is_locked) && (
                      <div className="flex gap-2 mb-2">
                        {t.is_pinned && (
                          <span className="badge badge-active text-[10px]">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                        {t.is_locked && (
                          <span className="badge badge-tag text-[10px]">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        )}
                      </div>
                    )}
                    <h3 className="font-sans text-base font-semibold leading-snug mb-1
                      group-hover:text-[hsl(var(--primary))] transition-colors"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {t.title}
                    </h3>
                    {t.body && (
                      <p className="font-serif text-sm leading-relaxed line-clamp-2"
                        style={{ color: 'hsl(var(--foreground-muted))' }}>
                        {t.body}
                      </p>
                    )}
                  </div>
                  <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:gap-1 text-xs shrink-0"
                    style={{ color: 'hsl(var(--foreground-subtle))' }}>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {t.reply_count} {t.reply_count === 1 ? 'reply' : 'replies'}
                    </span>
                    <span style={{ color: 'hsl(var(--foreground-muted))' }}>{t.author_name}</span>
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
